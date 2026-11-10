// Perro robot cuadrúpedo: armado, marcha de alto nivel (posturas, caminar,
// girar, de costado), el sensor de distancia, los dos programas en lazo
// cerrado y, si hay CPython 3.11+, que los programas en Python dan las mismas
// órdenes que su versión del test paso a paso.
import { beforeAll, describe, expect, it } from 'vitest'
import { spawnSync } from 'child_process'
import { arena, arenaDePista, patio } from '../arenas'
import type { ComandoMarcha, EstadoPerro } from '../engine/cuadrupedo'
import { avisosEnsamblaje, encimadas } from '../engine/ensamblaje'
import { iniciarRapier } from '../engine/fisica/mundo'
import { leerCamara, leerPerro, type ImagenCamara } from '../engine/paso'
import { infoPlaca } from '../engine/placa'
import { planDe } from '../engine/plan'
import { RUNTIME_PY } from '../engine/python/runtime'
import { SimSincrona } from '../engine/simSincrona'
import { PISTAS, ovalo, type Punto } from '../engine/tracks'
import { verificar } from '../engine/verificacion'
import { PERRO } from '../robots/perro'
import { PREARMADOS } from '../robots/prearmados'

const proyecto = (id: string) => PREARMADOS.find(p => p.id === id)!.construir()
const IDS = ['perro-primeros-pasos', 'perro-explorador', 'perro-guia-camara']

/** Ángulos del cuerpo (grados): cabeceo (+ = la cabeza sube) y alabeo. */
function inclinacion(sim: SimSincrona) {
  const r = sim.robot
  const ad = r.direccionMundo({ x: 1, y: 0, z: 0 }), der = r.direccionMundo({ x: 0, y: 0, z: 1 })
  const asin = (v: number) => (Math.asin(Math.max(-1, Math.min(1, v))) * 180) / Math.PI
  return { cabeceo: asin(ad.y), alabeo: asin(der.y) }
}

const ordenar = (sim: SimSincrona, c: Partial<ComandoMarcha>) => {
  sim.robot.marcha!.comando = { vx: 0, vy: 0, giro: 0, postura: 'parado', ...c }
}

// ---------------------------------------------------------------------------
// Programas del perro escritos como generadores: cada `yield s` es un sleep(s)
// y se avanzan con el mismo reloj lógico que runtime.ts (ver _avanzar).
// ---------------------------------------------------------------------------

type Orden = (c: Partial<ComandoMarcha>) => void
interface Ctx { perro: () => EstadoPerro; ordenar: Orden; cam: () => ImagenCamara | null; marcha: ComandoMarcha }
type Prog = (c: Ctx) => Generator<number, void, void>

class Planificador {
  private reloj = 0
  private despertar = 0
  private t = 0
  private vivo = true
  private gen: Generator<number, void, void> | null = null
  readonly ctx: Ctx
  constructor(private prog: Prog, entradas: { perro: () => EstadoPerro; cam: () => ImagenCamara | null }) {
    const marcha: ComandoMarcha = { vx: 0, vy: 0, giro: 0, postura: 'echado' }
    this.ctx = { ...entradas, marcha, ordenar: c => Object.assign(marcha, c) }
  }
  avanzar(dt: number): ComandoMarcha {
    this.reloj += dt
    if (!this.gen) { this.gen = this.prog(this.ctx); this.despertar = this.t }
    while (this.vivo && this.reloj >= this.despertar) {
      this.t = this.despertar
      const r = this.gen.next()
      if (r.done) this.vivo = false
      else this.despertar = this.t + r.value
    }
    this.t = this.reloj
    return { ...this.ctx.marcha }
  }
}

const v0 = { vx: 0, vy: 0, giro: 0 }

/** El mismo algoritmo que codigoExplorador() de robots/perro.ts. */
const explorador: Prog = function* ({ perro, ordenar }) {
  const v = PERRO.explorador
  const dist = () => perro().distancia ?? perro().alcance
  ordenar({ postura: 'parado', ...v0 })
  while (!perro().lista) yield 0.1
  function* girar(grados: number): Generator<number, number, void> {
    const inicio = perro().orientacion
    ordenar({ vx: 0, vy: 0, giro: grados > 0 ? v.GIRO : -v.GIRO })
    while (Math.abs(perro().orientacion - inicio) < Math.abs(grados)) yield 0.02
    ordenar(v0)
    yield 0.3
    return dist()
  }
  for (;;) {
    const d = dist()
    if (d < v.CERCA) {
      ordenar(v0)
      const izquierda = yield* girar(v.MIRAR)
      const derecha = yield* girar(-2 * v.MIRAR)
      let lado = -1
      if (izquierda > derecha) { yield* girar(2 * v.MIRAR); lado = 1 }
      ordenar({ vx: 0, vy: 0, giro: v.GIRO * lado })
      while (dist() < v.LIBRE) yield 0.05
    } else if (d < 2 * v.CERCA) ordenar({ vx: v.LENTO, vy: 0, giro: 0 })
    else ordenar({ vx: v.VELOCIDAD, vy: 0, giro: 0 })
    yield 0.05
  }
}

/** El mismo algoritmo que codigoSeguidorCamara() de robots/perro.ts. */
const guiaCamara: Prog = function* ({ perro, ordenar, cam }) {
  const v = PERRO.camara
  ordenar({ postura: 'parado', ...v0 })
  while (!perro().lista) yield 0.1
  let ultimo = 0
  for (;;) {
    const img = cam()!
    const fila = img.px.slice(v.FILA * img.ancho, (v.FILA + 1) * img.ancho)
    const oscuros = fila.map((b, x) => (b < v.UMBRAL ? x : -1)).filter(x => x >= 0)
    if (!oscuros.length) ordenar({ vx: 0, vy: 0, giro: ultimo > 0 ? -v.GIRO : v.GIRO })
    else {
      const error = oscuros.reduce((s, x) => s + x, 0) / oscuros.length - (img.ancho - 1) / 2
      ordenar({ vx: v.VELOCIDAD, vy: 0, giro: -v.KP * error })
      ultimo = error
    }
    yield 1 / 30
  }
}

interface Registro { perro: EstadoPerro; cam: ImagenCamara | null; orden: ComandoMarcha }

/** Corre un programa en lazo cerrado: estado → programa → orden → física (paso de 1/60 s, cámara a 30 fps). */
function correr(sim: SimSincrona, prog: Prog, segundos: number, refl?: (x: number, z: number) => number, cada?: (s: SimSincrona) => void): Registro[] {
  let estado = leerPerro(sim.plan, sim.robot)!
  let img: ImagenCamara | null = null
  const p = new Planificador(prog, { perro: () => estado, cam: () => img })
  const registro: Registro[] = []
  let n = 0
  for (let t = 0; t < segundos; t += 1 / 60) {
    estado = leerPerro(sim.plan, sim.robot)!
    const foto = refl && n++ % 2 === 0 ? leerCamara(sim.plan, sim.doc, sim.robot, refl) : null
    if (foto) img = foto
    const orden = p.avanzar(1 / 60)
    registro.push({ perro: estado, cam: foto, orden })
    sim.robot.marcha!.comando = orden
    sim.paso(1 / 60)
    cada?.(sim)
  }
  return registro
}

// ---------------------------------------------------------------------------

describe('Perro robot: armado', () => {
  it('los proyectos se arman sin choques ni avisos, con el cable de red a la Jetson', () => {
    for (const id of IDS) {
      const d = proyecto(id)
      expect(infoPlaca(d).lenguaje, id).toBe('python')
      expect(encimadas(d), id).toEqual([])
      expect(avisosEnsamblaje(d), id).toEqual([])
      expect(verificar(d), id).toEqual([])
      const p = planDe(d)
      expect(p.avisos, id).toEqual([])
      expect(p.cuadrupedo?.conectado, id).toBe(true)
      expect(p.motores).toHaveLength(0)
    }
    expect(planDe(proyecto('perro-guia-camara')).camaras).toHaveLength(1)
  })

  it('sin el cable de red, el plan avisa y el perro no recibe órdenes', () => {
    const d = proyecto('perro-explorador')
    const sinRed = { ...d, cables: d.cables.filter(c => c.de[1] !== 'ETH' && c.a[1] !== 'ETH') }
    const p = planDe(sinRed)
    expect(p.cuadrupedo?.conectado).toBe(false)
    expect(p.avisos.join()).toMatch(/cable de red/)
  })
})

describe('Perro robot: marcha', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('arranca echado, se para nivelado y se sienta con la cabeza en alto', () => {
    const sim = new SimSincrona(proyecto('perro-primeros-pasos'), patio())
    const m = sim.robot.marcha!
    sim.correr(0.5)
    const echado = sim.robot.pose().pos.y
    expect(Math.abs(echado - m.alturaOrigen('echado'))).toBeLessThan(0.01)
    ordenar(sim, { postura: 'parado' })
    sim.correr(1.5)
    const parado = sim.robot.pose().pos.y
    expect(Math.abs(parado - m.alturaOrigen('parado'))).toBeLessThan(0.01)
    expect(m.lista).toBe(true)
    const i = inclinacion(sim)
    expect(Math.abs(i.cabeceo)).toBeLessThan(2)
    expect(Math.abs(i.alabeo)).toBeLessThan(2)
    ordenar(sim, { postura: 'sentado' })
    sim.correr(1.5)
    expect(inclinacion(sim).cabeceo).toBeGreaterThan(10)
    // Saluda con una pata en el aire sin caerse.
    ordenar(sim, { postura: 'saludo' })
    sim.correr(2)
    expect(m.patas[1].normal).toBe(0)
    expect(Math.abs(inclinacion(sim).alabeo)).toBeLessThan(8)
    ordenar(sim, { postura: 'parado' })
    sim.correr(1.5)
    expect(Math.abs(inclinacion(sim).cabeceo)).toBeLessThan(2)
    console.log('alturas: echado', echado.toFixed(3), 'parado', parado.toFixed(3))
    sim.liberar()
  })

  it('camina derecho a la velocidad pedida, gira lo pedido y va de costado', () => {
    const sim = new SimSincrona(proyecto('perro-primeros-pasos'), patio())
    // Echado no camina aunque se lo pidan.
    sim.robot.marcha!.comando = { vx: 0.3, vy: 0, giro: 0, postura: 'echado' }
    sim.correr(1)
    expect(sim.robot.pose().velocidad).toBeLessThan(0.01)
    ordenar(sim, {})
    sim.correr(1.5)
    const a = sim.robot.pose().pos
    ordenar(sim, { vx: 0.3 })
    sim.correr(3)
    const b = sim.robot.pose().pos
    console.log('3 s a 0,3 m/s:', (b.x - a.x).toFixed(3), 'm adelante, desvío', (b.z - a.z).toFixed(3))
    expect(b.x - a.x).toBeGreaterThan(0.8)   // 0,9 m menos lo que tarda en acelerar
    expect(b.x - a.x).toBeLessThan(0.92)
    expect(Math.abs(b.z - a.z)).toBeLessThan(0.02)

    ordenar(sim, {})
    sim.correr(1)
    const o0 = sim.robot.marcha!.orientacion, p0 = sim.robot.pose().pos
    ordenar(sim, { giro: 60 })
    sim.correr(1.5)
    ordenar(sim, {})
    sim.correr(1)
    const giro = sim.robot.marcha!.orientacion - o0, p1 = sim.robot.pose().pos
    console.log('1,5 s a 60°/s:', giro.toFixed(1), '° y se corrió', Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(3), 'm')
    expect(giro).toBeGreaterThan(85)
    expect(giro).toBeLessThan(95)
    expect(Math.hypot(p1.x - p0.x, p1.z - p0.z)).toBeLessThan(0.03)

    // Mirando a −z (giró 90° a la izquierda), su izquierda es −x.
    const p2 = sim.robot.pose().pos
    ordenar(sim, { vy: 0.2 })
    sim.correr(1.5)
    const p3 = sim.robot.pose().pos
    console.log('de costado 1,5 s:', (p3.x - p2.x).toFixed(3), (p3.z - p2.z).toFixed(3))
    expect(p3.x - p2.x).toBeLessThan(-0.22)
    expect(Math.abs(p3.z - p2.z)).toBeLessThan(0.03)
    sim.liberar()
  })

  it('el sensor de distancia ve la pared y no el piso', () => {
    const sim = new SimSincrona(proyecto('perro-explorador'), patio())
    sim.robot.colocar({ x: 1.0, z: 0, yaw: 0 })   // la pared está en x = 2
    ordenar(sim, {})
    sim.correr(1.5)
    const cabeza = sim.robot.puntoMundo({ x: 200, y: 55, z: 0 }).x
    const d = leerPerro(sim.plan, sim.robot)!.distancia!
    console.log('pared a', ((2 - cabeza) * 100).toFixed(1), 'cm; el sensor mide', d)
    expect(Math.abs(d - (2 - cabeza) * 100)).toBeLessThan(2)
    sim.robot.colocar({ x: -1.5, z: 0, yaw: 0 })   // 3,5 m de piso libre adelante
    ordenar(sim, {})
    sim.correr(1.5)
    expect(leerPerro(sim.plan, sim.robot)!.distancia).toBeNull()
    sim.liberar()
  })
})

describe('Perro robot: programas en lazo cerrado', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el explorador recorre el campo un minuto sin chocar las cajas ni las paredes', () => {
    const campo = arena('campo-libre')
    const sim = new SimSincrona(proyecto('perro-explorador'), campo)
    const cajas = new Set(sim.mundo.objetos.map(o => o.body.collider(0).handle))
    let choques = 0, recorrido = 0
    let previo = sim.robot.pose().pos
    const celdas = new Set<string>()
    correr(sim, explorador, 60, undefined, s => {
      const p = s.robot.pose().pos
      recorrido += Math.hypot(p.x - previo.x, p.z - previo.z)
      previo = p
      celdas.add(`${Math.floor(p.x / 0.25)},${Math.floor(p.z / 0.25)}`)
      // Un par de la fase fina solo dice que las cajas envolventes se tocan: hay choque si tiene puntos de contacto.
      for (let i = 0; i < s.robot.body.numColliders(); i++) {
        const c = s.robot.body.collider(i)
        s.mundo.world.contactPairsWith(c, otro => {
          if (cajas.has(otro.handle)) s.mundo.world.contactPair(c, otro, m => { if (m.numContacts() > 0) choques++ })
        })
      }
      if (Math.abs(p.x) > campo.ancho / 2 - 0.12 || Math.abs(p.z) > campo.largo / 2 - 0.12) choques++
    })
    sim.liberar()
    console.log('explorador: recorrió', recorrido.toFixed(1), 'm, celdas', celdas.size, ', choques', choques)
    expect(choques).toBe(0)
    expect(recorrido).toBeGreaterThan(6)   // mirar a los lados lleva su tiempo
    expect(celdas.size).toBeGreaterThan(25)
  }, 300_000)

  it('el perro guía sigue el óvalo con la cámara', () => {
    const refl = mapaDe(ovalo)
    const muestras = Array.from({ length: 3000 }, (_, i) => ovalo(i / 3000))
    const pista = arenaDePista(PISTAS.find(p => p.id === 'ovalo')!)
    const sim = new SimSincrona(proyecto('perro-guia-camara'), pista, { reflectancia: refl })
    let maxDesvio = 0, avance = 0, previo = distanciaA(muestras, pista.inicio.x, pista.inicio.z).idx
    correr(sim, guiaCamara, 35, refl, s => {
      const p = s.robot.pose().pos
      const { d, idx } = distanciaA(muestras, p.x, p.z)
      if (s.tiempo > 3) maxDesvio = Math.max(maxDesvio, d)
      let paso = idx - previo
      if (paso > 1500) paso -= 3000
      if (paso < -1500) paso += 3000
      avance += paso
      previo = idx
    })
    sim.liberar()
    console.log('perro guía: desvío máx', maxDesvio.toFixed(3), 'm, vueltas', (avance / 3000).toFixed(2))
    expect(maxDesvio).toBeLessThan(0.045)
    expect(avance / 3000).toBeGreaterThan(1)
  }, 300_000)
})

/** La pista dibujada en una grilla de 2 mm (como en jetson.test.ts): cinta de 19 mm. */
function mapaDe(f: (t: number) => Punto, anchoM = 3, altoM = 2) {
  const PX = 500, w = anchoM * PX, h = altoM * PX
  const g = new Uint8Array(w * h)
  const r = 0.0095 * PX
  for (let i = 0; i < 8000; i++) {
    const [x, z] = f(i / 8000)
    const cx = (x + anchoM / 2) * PX, cy = (z + altoM / 2) * PX
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
      if (dx * dx + dy * dy > r * r) continue
      const px = Math.round(cx + dx), py = Math.round(cy + dy)
      if (px >= 0 && py >= 0 && px < w && py < h) g[py * w + px] = 1
    }
  }
  return (x: number, z: number) => {
    const px = Math.round((x + anchoM / 2) * PX), py = Math.round((z + altoM / 2) * PX)
    if (px < 0 || py < 0 || px >= w || py >= h) return 0.55
    return g[py * w + px] ? 0.07 : 0.95
  }
}

function distanciaA(muestras: Punto[], x: number, z: number) {
  let mejor = Infinity, idx = 0
  muestras.forEach(([px, pz], i) => { const d = Math.hypot(px - x, pz - z); if (d < mejor) { mejor = d; idx = i } })
  return { d: mejor, idx }
}

// ---------------------------------------------------------------------------
// Python (CPython de la máquina, el mismo motor que corre Pyodide)
// ---------------------------------------------------------------------------

function python(prueba: string): { ok: boolean; salida: string } | null {
  const script = `import json, sys\n${RUNTIME_PY}\n${prueba}\n`
  for (const exe of ['python', 'py', 'python3']) {
    const r = spawnSync(exe, ['-I', '-X', 'utf8', '-c', 'import sys; exec(sys.stdin.read())'], { input: script, encoding: 'utf8', timeout: 120_000, maxBuffer: 64 * 1024 * 1024 })
    if (r.error || /no se encontr|not found|Microsoft Store/i.test(r.stderr ?? '')) continue
    return { ok: r.status === 0, salida: `${r.stdout}${r.stderr}` }
  }
  return null
}
const hayPython = python('print(sys.version_info >= (3, 11))')?.salida.trim() === 'True'

/** Le pasa a Python los mismos estados (y fotos) paso a paso y compara sus órdenes con las del test. */
function compararConPython(codigo: string, registro: Registro[]) {
  const pasos = registro.map(r => ({ p: r.perro, c: r.cam, o: r.orden }))
  return python(`
pasos = json.loads(${JSON.stringify(JSON.stringify(pasos))})
assert _cargar(${JSON.stringify(codigo)}, 'jetson') is None
malos = 0
for i, s in enumerate(pasos):
    r = _avanzar(1/60, {}, {}, [], s['c'], s['p'])
    assert r['error'] is None, (i, r['error'])
    m, o = r['marcha'], s['o']
    if m['postura'] != o['postura'] or any(abs(m[k] - o[k]) > 1e-6 for k in ('vx', 'vy', 'giro')):
        malos += 1
        if malos < 5: print('paso', i, m, o)
print('pasos', len(pasos), 'malos', malos)
`)!
}

describe.skipIf(!hayPython)('Perro robot: Python (módulo perro)', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el módulo perro pide pararse antes de caminar, limita las velocidades y explica los errores', () => {
    const r = python(`
estado = {'distancia': None, 'orientacion': 12.5, 'postura': 'echado', 'lista': False, 'v_max': 0.5, 'v_lateral_max': 0.25, 'giro_max': 90, 'alcance': 200}
from perro import Perro
_cargar('', 'jetson')
try:
    Perro()
    raise SystemExit('sin cable de red debía fallar')
except RuntimeError as e:
    assert 'cable de red' in str(e), e
_entradas['perro'] = estado
p = Perro()
try:
    p.mover(0.3)
    raise SystemExit('echado no camina')
except RuntimeError as e:
    assert 'pararse' in str(e), e
p.pararse(); p.mover(2, -1, 500)
assert _estado['marcha'] == {'vx': 0.5, 'vy': -0.25, 'giro': 90.0, 'postura': 'parado'}, _estado['marcha']
assert p.distancia() == 200.0 and p.orientacion() == 12.5 and p.listo is False
p.sentarse()
assert _estado['marcha']['vx'] == 0 and _estado['marcha']['postura'] == 'sentado'
# Al terminar el programa, el perro se queda quieto en su postura.
assert _cargar('from perro import Perro\\np = Perro()\\np.pararse()\\np.mover(0.3)', 'jetson') is None
r = _avanzar(1/60, {}, {}, [], None, estado)
assert r['terminado'] and r['marcha'] == {'vx': 0.0, 'vy': 0.0, 'giro': 0.0, 'postura': 'parado'}, r
print('ok')
`)!
    expect(r.salida.trim()).toBe('ok')
    expect(r.ok).toBe(true)
  })

  it('el explorador en Python da las mismas órdenes que el del test', () => {
    const doc = proyecto('perro-explorador')
    const sim = new SimSincrona(doc, arena('campo-libre'))
    const registro = correr(sim, explorador, 20)
    sim.liberar()
    expect(registro.some(r => r.orden.giro !== 0)).toBe(true)   // llegó a esquivar algo
    const r = compararConPython(doc.programa.cpp, registro)
    expect(r.ok, r.salida).toBe(true)
    expect(r.salida).toContain('malos 0')
  }, 300_000)

  it('el perro guía en Python da las mismas órdenes que el del test', () => {
    const refl = mapaDe(ovalo)
    const doc = proyecto('perro-guia-camara')
    const sim = new SimSincrona(doc, arenaDePista(PISTAS.find(p => p.id === 'ovalo')!), { reflectancia: refl })
    const registro = correr(sim, guiaCamara, 6, refl)
    sim.liberar()
    const r = compararConPython(doc.programa.cpp, registro)
    expect(r.ok, r.salida).toBe(true)
    expect(r.salida).toContain('malos 0')
  }, 300_000)
})
