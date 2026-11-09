// Jetson Nano con cámara: armado, lo que ve la cámara, el seguidor por visión
// en lazo cerrado y, si hay CPython 3.11+, que el programa en Python decide
// exactamente lo mismo que el controlador del test con las mismas imágenes.
import { beforeAll, describe, expect, it } from 'vitest'
import { spawnSync } from 'child_process'
import { arenaDePista, circuitoVelocidad } from '../arenas'
import type { PinReport } from '../engine/avrRunner'
import { encimadas } from '../engine/ensamblaje'
import { iniciarRapier } from '../engine/fisica/mundo'
import { aplicarPines, leerCamara, type ImagenCamara } from '../engine/paso'
import { infoPlaca } from '../engine/placa'
import { planDe } from '../engine/plan'
import { RUNTIME_PY } from '../engine/python/runtime'
import { SimSincrona } from '../engine/simSincrona'
import { PISTAS, curvas, ovalo, type Punto } from '../engine/tracks'
import { verificar } from '../engine/verificacion'
import { VISION } from '../robots/jetson'
import { PREARMADOS } from '../robots/prearmados'

const proyecto = (id: string) => PREARMADOS.find(p => p.id === id)!.construir()

/** La pista dibujada en una grilla de 2 mm (como MapaPista, sin canvas): cinta de 19 mm. */
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

type Params = { UMBRAL: number; FILA: number; BASE: number; KP: number; GIRO: number; RAPIDO?: number }

/** El mismo algoritmo que los programas en Python de robots/jetson.ts. */
function controlador(v: Params) {
  let ultimo = 0
  return (img: ImagenCamara): [number, number] => {
    const fila = img.px.slice(v.FILA * img.ancho, (v.FILA + 1) * img.ancho)
    const oscuros = fila.map((b, x) => (b < v.UMBRAL ? x : -1)).filter(x => x >= 0)
    if (!oscuros.length) return ultimo > 0 ? [v.GIRO, -v.GIRO] : [-v.GIRO, v.GIRO]
    const mitad = (img.ancho - 1) / 2
    const error = oscuros.reduce((s, x) => s + x, 0) / oscuros.length - mitad
    ultimo = error
    const vel = v.RAPIDO === undefined ? v.BASE : v.BASE + (v.RAPIDO - v.BASE) * (1 - Math.min(1, Math.abs(error) / mitad))
    return [vel + v.KP * error, vel - v.KP * error]
  }
}

/** Pines como los deja motores(izq, der) del programa en Python. */
function pinesMotores(plan: ReturnType<typeof planDe>, izq: number, der: number): Record<string, PinReport> {
  const pines: Record<string, PinReport> = {}
  const sal = (pin: string | null, duty: number) => { if (pin) pines[pin] = { mode: 'output', level: duty >= 0.5 ? 1 : 0, duty, freqHz: 0, pulsoUs: 0 } as PinReport }
  plan.motores.forEach(m => {
    const v = Math.max(-100, Math.min(100, m.rueda && m.rueda.centro.z < 0 ? izq : der))
    sal(m.en, Math.abs(v) / 100)
    sal(m.inA, v > 0 ? 1 : 0)
    sal(m.inB, v < 0 ? 1 : 0)
  })
  return pines
}

/** Maneja el robot con el controlador: una imagen nueva y una decisión cada 1/30 s. */
function manejar(sim: SimSincrona, reflectancia: (x: number, z: number) => number, v: Params, segundos: number, cadaCuadro?: (img: ImagenCamara, izq: number, der: number) => void) {
  const decidir = controlador(v)
  let n = 0
  sim.correr(segundos, 1 / 60, s => {
    if (n++ % 2) return
    const img = leerCamara(s.plan, s.doc, s.robot, reflectancia)!
    const [izq, der] = decidir(img)
    cadaCuadro?.(img, izq, der)
    aplicarPines(s.plan, s.robot, pinesMotores(s.plan, izq, der))
  })
}

function distanciaA(muestras: Punto[], x: number, z: number) {
  let mejor = Infinity, idx = 0
  muestras.forEach(([px, pz], i) => { const d = Math.hypot(px - x, pz - z); if (d < mejor) { mejor = d; idx = i } })
  return { d: mejor, idx }
}

describe('Jetson Nano: armado', () => {
  it('los dos proyectos se arman sin choques ni avisos, con la cámara al CSI y ENA/ENB en los pines con PWM', () => {
    for (const id of ['jetson-seguidor-camara', 'jetson-carrera-camara']) {
      const d = proyecto(id)
      expect(infoPlaca(d).placa, id).toBe('jetson')
      expect(encimadas(d), id).toEqual([])
      expect(verificar(d), id).toEqual([])
      const p = planDe(d)
      expect(p.avisos, id).toEqual([])
      expect(p.camaras).toHaveLength(1)
      expect(p.motores.map(m => m.en).sort()).toEqual(['PIN32', 'PIN33'])
      expect(d.programa.cpp).toContain('GPIO.setmode(GPIO.BOARD)')
    }
  })

  it('sin el cable plano, el plan avisa que la cámara no está conectada', () => {
    const d = proyecto('jetson-seguidor-camara')
    const sinCable = { ...d, cables: d.cables.filter(c => c.de[1] !== 'CSI' && c.a[1] !== 'CSI') }
    const p = planDe(sinCable)
    expect(p.camaras).toHaveLength(0)
    expect(p.avisos.join()).toMatch(/cable plano/)
  })
})

describe('Jetson Nano: cámara y visión', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('la cámara ve la línea al centro si está delante y a la derecha si está a la derecha', () => {
    const arena = arenaDePista(PISTAS.find(p => p.id === 'ovalo')!)
    const columnaDeLaLinea = (zLinea: number) => {
      const refl = (_x: number, z: number) => (Math.abs(z - zLinea) < 0.0095 ? 0.07 : 0.95)
      const sim = new SimSincrona(proyecto('jetson-seguidor-camara'), arena, { reflectancia: refl })
      sim.robot.colocar({ x: 0, z: 0, yaw: 0 })   // mirando a +x: su derecha es +z
      sim.correr(0.3)
      const img = leerCamara(sim.plan, sim.doc, sim.robot, refl)!
      sim.liberar()
      expect(img.px).toHaveLength(img.ancho * img.alto)
      const fila = img.px.slice(VISION.ovalo.FILA * img.ancho, (VISION.ovalo.FILA + 1) * img.ancho)
      const oscuros = fila.map((b, x) => (b < 100 ? x : -1)).filter(x => x >= 0)
      return oscuros.reduce((s, x) => s + x, 0) / oscuros.length
    }
    expect(Math.abs(columnaDeLaLinea(0) - 19.5)).toBeLessThan(1)
    expect(columnaDeLaLinea(0.04)).toBeGreaterThan(24)
    expect(columnaDeLaLinea(-0.04)).toBeLessThan(15)
  })

  it('el seguidor con cámara recorre el óvalo sin salirse', () => {
    const refl = mapaDe(ovalo)
    const muestras = Array.from({ length: 3000 }, (_, i) => ovalo(i / 3000))
    const arena = arenaDePista(PISTAS.find(p => p.id === 'ovalo')!)
    const sim = new SimSincrona(proyecto('jetson-seguidor-camara'), arena, { reflectancia: refl })
    let maxDesvio = 0, avance = 0, previo = distanciaA(muestras, arena.inicio.x, arena.inicio.z).idx
    manejar(sim, refl, VISION.ovalo, 20, () => {
      const p = sim.robot.pose().pos
      const { d, idx } = distanciaA(muestras, p.x, p.z)
      if (sim.tiempo > 1) maxDesvio = Math.max(maxDesvio, d)
      let paso = idx - previo
      if (paso > 1500) paso -= 3000
      if (paso < -1500) paso += 3000
      avance += paso
      previo = idx
    })
    sim.liberar()
    console.log('óvalo: desvío máx', maxDesvio.toFixed(3), 'm, vueltas', (avance / 3000).toFixed(2))
    expect(maxDesvio).toBeLessThan(0.04)
    expect(avance / 3000).toBeGreaterThan(1)
  }, 300_000)

  it('la carrera con cámara da las 3 vueltas del circuito sin salirse', () => {
    const refl = mapaDe(curvas)
    const sim = new SimSincrona(proyecto('jetson-carrera-camara'), circuitoVelocidad(), { reflectancia: refl })
    const c = sim.cronometro!
    const decidir = controlador(VISION.carrera)
    let n = 0
    for (let t = 0; t < 90 && c.estado.fase !== 'final'; t += 1 / 60) {
      if (n++ % 2 === 0) {
        const [izq, der] = decidir(leerCamara(sim.plan, sim.doc, sim.robot, refl)!)
        aplicarPines(sim.plan, sim.robot, pinesMotores(sim.plan, izq, der))
      }
      sim.paso(1 / 60)
    }
    sim.liberar()
    const total = c.estado.vueltas.reduce((s, v) => s + v, 0)
    console.log('carrera: vueltas', c.estado.vueltas.map(v => v.toFixed(1)).join(' / '), 'total', total.toFixed(1), 's, salidas', c.estado.salidas)
    expect(c.estado.fase).toBe('final')
    expect(c.estado.salidas).toBe(0)
    // El seguidor de velocidad con dos TCRT5000 tarda ≈ 52 s: mirar lejos gana.
    expect(total).toBeLessThan(50)
  }, 600_000)
})

// ---------------------------------------------------------------------------
// Python (CPython de la máquina, el mismo motor que corre Pyodide)
// ---------------------------------------------------------------------------

function python(prueba: string): { ok: boolean; salida: string } | null {
  const script = `import json, sys\n${RUNTIME_PY}\n${prueba}\n`
  for (const exe of ['python', 'py', 'python3']) {
    // -X utf8: en Windows, Python lee la entrada en cp1252 y rompe las tildes.
    const r = spawnSync(exe, ['-I', '-X', 'utf8', '-c', 'import sys; exec(sys.stdin.read())'], { input: script, encoding: 'utf8', timeout: 60_000 })
    if (r.error || /no se encontr|not found|Microsoft Store/i.test(r.stderr ?? '')) continue
    return { ok: r.status === 0, salida: `${r.stdout}${r.stderr}` }
  }
  return null
}
const hayPython = python('print(sys.version_info >= (3, 11))')?.salida.trim() === 'True'

describe.skipIf(!hayPython)('Jetson Nano: Python (Jetson.GPIO y cámara)', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('Jetson.GPIO numera por el conector, solo da PWM en 32 y 33 y explica los errores', () => {
    const r = python(`
import Jetson.GPIO as GPIO
_cargar('', 'jetson')
try:
    GPIO.setup(32, GPIO.OUT)
    raise SystemExit('debía pedir setmode')
except RuntimeError as e:
    assert 'setmode' in str(e)
GPIO.setmode(GPIO.BOARD)
GPIO.setup([32, 29], GPIO.OUT, initial=GPIO.LOW)
p = GPIO.PWM(32, 1000); p.start(40)
GPIO.output(29, GPIO.HIGH)
r = _reporte()
assert abs(r['PIN32']['duty'] - 0.4) < 1e-9 and r['PIN29']['level'] == 1, r
GPIO.setup(31, GPIO.OUT)
try:
    GPIO.PWM(31, 1000)
    raise SystemExit('el 31 no tiene PWM')
except ValueError as e:
    assert '32 y 33' in str(e)
GPIO.setup(7, GPIO.IN, pull_up_down=GPIO.PUD_UP)
_entradas['digital'] = {'PIN7': False}
assert GPIO.input(7) == GPIO.LOW
# En la Raspberry, la misma API con GPIO.BCM usa los nombres GPIOn.
_cargar('', 'rpi')
import RPi.GPIO as G2
G2.setmode(G2.BCM); G2.setup(17, G2.OUT); G2.output(17, True)
assert _reporte()['GPIO17']['level'] == 1
print('ok')
`)!
    expect(r.salida.trim()).toBe('ok')
    expect(r.ok).toBe(true)
  })

  it('el programa en Python decide igual que el controlador del test con las mismas imágenes', () => {
    const refl = mapaDe(ovalo)
    const doc = proyecto('jetson-seguidor-camara')
    const sim = new SimSincrona(doc, arenaDePista(PISTAS.find(p => p.id === 'ovalo')!), { reflectancia: refl })
    const cuadros: { img: ImagenCamara; pines: Record<string, number> }[] = []
    manejar(sim, refl, VISION.ovalo, 6, (img, izq, der) => {
      if (cuadros.length < 40 && sim.tiempo > 0.5) {
        const p = pinesMotores(sim.plan, izq, der)
        cuadros.push({ img, pines: Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.duty])) })
      }
    })
    sim.liberar()
    expect(cuadros.length).toBe(40)
    const r = python(`
cuadros = json.loads(${JSON.stringify(JSON.stringify(cuadros))})
assert _cargar(${JSON.stringify(doc.programa.cpp)}, 'jetson') is None
malos = 0
for i, c in enumerate(cuadros):
    r = _avanzar(1/30, {}, {}, [], c['img'])
    assert r['error'] is None, r['error']
    for pin, duty in c['pines'].items():
        if abs(r['pines'][pin]['duty'] - duty) > 1e-6:
            malos += 1
            print('cuadro', i, pin, r['pines'][pin]['duty'], duty)
print('malos', malos)
`)!
    expect(r.ok, r.salida).toBe(true)
    expect(r.salida).toContain('malos 0')
  }, 300_000)
})
