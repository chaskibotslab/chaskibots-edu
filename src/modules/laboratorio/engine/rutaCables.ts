// Por dónde va cada cable en el robot armado. Un cable real no atraviesa el
// chasis ni la batería: rodea las piezas, y para pasar de abajo del chasis a
// arriba usa un agujero (un pasacables). Aquí se calcula ese recorrido:
//   1. Si la curva directa de pin a pin no toca ninguna pieza, se deja tal cual.
//   2. Si toca algo, se busca el camino libre más corto en una cuadrícula 3D
//      (A*), donde las piezas son paredes y las placas planas (chasis, pisos)
//      se pueden cruzar solo en vertical, por un pasacables.
//   3. Los cables siguientes prefieren un pasacables ya abierto, así quedan
//      agrupados como en un robot bien armado.
// Todo en milímetros, en el marco del robot. Sin React ni WebGL: se prueba solo.

import { Vector3 } from 'three'
import { pieza } from '../catalogo/piezas'
import { cajasDe, poses, type Caja } from './ensamblaje'
import type { RobotDoc } from '../robots/doc'

/** Punta de un cable: dónde sale de su conector, hacia dónde, y de qué pieza. */
export interface ExtremoCable { p: Vector3; dir: Vector3; inst: string }
/** Agujero con goma por donde los cables cruzan una placa (y0–y1 = caras de la placa). */
export interface Pasacables { x: number; z: number; y0: number; y1: number; radio: number; cables: number }
export interface RutasCables {
  /** Por cable: los puntos del recorrido, o null si va directo (curva de siempre). */
  rutas: (Vector3[] | null)[]
  pasacables: Pasacables[]
}

export interface Obstaculo { caja: Caja; inst: string; pi: number; plana: boolean }

/**
 * Puntos de control de la curva directa (Bézier) entre dos puntas: sale derecho
 * del conector un tramo corto y cae un poco por su peso. `mm` = 1 si los puntos
 * están en milímetros, 0.001 si están en metros.
 */
export function controlDirecto(p0: Vector3, dirA: Vector3, p3: Vector3, dirB: Vector3, mm = 1): [Vector3, Vector3, Vector3, Vector3] {
  const L = p0.distanceTo(p3)
  const tiron = Math.min(16 * mm, 6 * mm + L * 0.12)
  const p1 = p0.clone().addScaledVector(dirA, tiron)
  const p2 = p3.clone().addScaledVector(dirB, tiron)
  p1.y -= L * 0.08
  p2.y -= L * 0.08
  return [p0, p1, p2, p3]
}

function bezier(c: [Vector3, Vector3, Vector3, Vector3], t: number, out: Vector3) {
  const u = 1 - t
  return out.set(0, 0, 0)
    .addScaledVector(c[0], u * u * u).addScaledVector(c[1], 3 * u * u * t)
    .addScaledVector(c[2], 3 * u * t * t).addScaledVector(c[3], t * t * t)
}

const tmp = new Vector3()
/** ¿El punto está dentro de la caja (agrandada `margen` mm)? */
export function dentroDeCaja(c: Caja, p: Vector3, margen = 0): boolean {
  tmp.copy(p).sub(c.c)
  for (let i = 0; i < 3; i++) if (Math.abs(tmp.dot(c.ejes[i])) > c.h[i] + margen) return false
  return true
}

/** Eje delgado de una placa plana horizontal (chasis, piso de arriba), o -1. */
function ejePlano(c: Caja): number {
  for (let i = 0; i < 3; i++) {
    const otros = [0, 1, 2].filter(j => j !== i)
    if (c.h[i] <= 2.6 && Math.abs(c.ejes[i].y) > 0.99 && otros.every(j => c.h[j] >= 18)) return i
  }
  return -1
}

/** Las piezas del robot como cajas. Las carrocerías cerradas no cuentan: la electrónica va adentro. */
export function obstaculos(doc: RobotDoc): Obstaculo[] {
  const ps = poses(doc)
  const out: Obstaculo[] = []
  doc.piezas.forEach((p, pi) => {
    const def = pieza(p.pieza)
    const pose = ps.get(p.id)
    if (!pose || def.carcasa || def.comportamiento.tipo === 'rueda-loca') return
    for (const caja of cajasDe(def, pose)) out.push({ caja, inst: p.id, pi, plana: ejePlano(caja) >= 0 })
  })
  return out
}

/** Lejos de sus puntas, ¿el cable se mete en una pieza que no es ninguna de las dos suyas? */
const LIBRE_PUNTA = 8
export function tocaPieza(obs: Obstaculo[], puntos: Vector3[], a: ExtremoCable, b: ExtremoCable, pasa: Pasacables[] = [], margen = 0.4): boolean {
  for (const p of puntos) {
    if (p.distanceTo(a.p) < LIBRE_PUNTA || p.distanceTo(b.p) < LIBRE_PUNTA) continue
    for (const o of obs) {
      if (o.inst === a.inst || o.inst === b.inst || !dentroDeCaja(o.caja, p, margen)) continue
      if (o.plana && pasa.some(h => Math.hypot(h.x - p.x, h.z - p.z) <= h.radio)) continue
      return true
    }
  }
  return false
}

/** Puntos a lo largo de una línea quebrada, uno cada `paso` mm. */
export function muestrear(puntos: Vector3[], paso = 1): Vector3[] {
  const out: Vector3[] = []
  for (let i = 0; i + 1 < puntos.length; i++) {
    const n = Math.max(1, Math.ceil(puntos[i].distanceTo(puntos[i + 1]) / paso))
    for (let k = 0; k < n; k++) out.push(puntos[i].clone().lerp(puntos[i + 1], k / n))
  }
  if (puntos.length) out.push(puntos[puntos.length - 1].clone())
  return out
}

export function curvaDirecta(a: ExtremoCable, b: ExtremoCable, n = 40): Vector3[] {
  const c = controlDirecto(a.p, a.dir, b.p, b.dir)
  return Array.from({ length: n + 1 }, (_, i) => bezier(c, i / n, new Vector3()))
}

// ---------------------------------------------------------------------------
// Cuadrícula
// ---------------------------------------------------------------------------

const LIBRE = 0, SOLIDO = 1, PASO = 2
const MAX_CELDAS = 420_000
const COSTO_PARED = 400, COSTO_PROPIA = 4, COSTO_AGUJERO = 14, COSTO_AGUJERO_ABIERTO = 3

interface Malla {
  celda: number; nx: number; ny: number; nz: number; o: Vector3
  clase: Uint8Array; duenio: Int16Array
  /** Por columna (ix, iz): 0 nada, 1 pasacables abierto, 2 pegado a uno abierto. */
  columna: Uint8Array
  /** Por columna: 1 si queda fuera de la planta del chasis (ahí un cable cuelga por fuera del robot). */
  fuera: Uint8Array
}

function crearMalla(obs: Obstaculo[], extremos: ExtremoCable[]): Malla | null {
  const min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)
  let piso = Infinity
  for (const { caja } of obs) {
    const r = new Vector3()
    for (let i = 0; i < 3; i++) r.set(r.x + Math.abs(caja.ejes[i].x) * caja.h[i], r.y + Math.abs(caja.ejes[i].y) * caja.h[i], r.z + Math.abs(caja.ejes[i].z) * caja.h[i])
    min.min(caja.c.clone().sub(r)); max.max(caja.c.clone().add(r))
    piso = Math.min(piso, caja.c.y - r.y)
  }
  for (const e of extremos) { min.min(e.p); max.max(e.p) }
  if (!isFinite(min.x)) return null
  min.subScalar(15); max.addScalar(15)
  // Nada por debajo del piso (la parte más baja del robot son las ruedas).
  if (isFinite(piso)) min.y = Math.max(min.y, Math.min(piso + 2, ...extremos.map(e => e.p.y - 3)))
  const t = max.clone().sub(min)
  const celda = Math.max(3, Math.cbrt((t.x * t.y * t.z) / MAX_CELDAS))
  const nx = Math.ceil(t.x / celda), ny = Math.ceil(t.y / celda), nz = Math.ceil(t.z / celda)
  const n = nx * ny * nz
  const m: Malla = { celda, nx, ny, nz, o: min, clase: new Uint8Array(n), duenio: new Int16Array(n).fill(-1), columna: new Uint8Array(nx * nz), fuera: new Uint8Array(nx * nz) }
  const infla = celda / 2 + 1
  const p = new Vector3(), loc = new Vector3()
  for (const ob of obs) {
    const { caja } = ob
    const r = [0, 0, 0]
    for (let i = 0; i < 3; i++) { r[0] += Math.abs(caja.ejes[i].x) * caja.h[i]; r[1] += Math.abs(caja.ejes[i].y) * caja.h[i]; r[2] += Math.abs(caja.ejes[i].z) * caja.h[i] }
    const lim = (c: number, rr: number, o: number, nn: number): [number, number] => [Math.max(0, Math.floor((c - rr - infla - o) / celda)), Math.min(nn - 1, Math.ceil((c + rr + infla - o) / celda))]
    const [x0, x1] = lim(caja.c.x, r[0], min.x, nx), [y0, y1] = lim(caja.c.y, r[1], min.y, ny), [z0, z1] = lim(caja.c.z, r[2], min.z, nz)
    const ep = ob.plana ? ejePlano(caja) : -1
    for (let iy = y0; iy <= y1; iy++) for (let iz = z0; iz <= z1; iz++) for (let ix = x0; ix <= x1; ix++) {
      p.set(min.x + (ix + 0.5) * celda, min.y + (iy + 0.5) * celda, min.z + (iz + 0.5) * celda)
      if (!dentroDeCaja(caja, p, infla)) continue
      const k = (iy * nz + iz) * nx + ix
      // Por una placa se puede pasar (con un agujero) si no es justo en el borde.
      let pasable = false
      if (ep >= 0) {
        loc.copy(p).sub(caja.c)
        pasable = [0, 1, 2].every(j => j === ep || Math.abs(loc.dot(caja.ejes[j])) <= caja.h[j] - 7)
      }
      const antes = m.clase[k]
      if (antes === LIBRE) { m.clase[k] = pasable ? PASO : SOLIDO; m.duenio[k] = ob.pi }
      else {
        if (!(pasable && antes === PASO)) m.clase[k] = SOLIDO
        if (m.duenio[k] !== ob.pi) m.duenio[k] = -2
      }
    }
  }
  // Planta del robot: lo que cubren sus placas (chasis y pisos), con un margen corto.
  const planas = obs.filter(o => o.plana)
  if (planas.length) {
    for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
      p.set(min.x + (ix + 0.5) * celda, 0, min.z + (iz + 0.5) * celda)
      m.fuera[iz * nx + ix] = planas.some(o => { p.y = o.caja.c.y; return dentroDeCaja(o.caja, p, 3) }) ? 0 : 1
    }
  }
  // Un pasacables necesita lugar libre encima y debajo de la placa.
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
    const k = (iy: number) => (iy * nz + iz) * nx + ix
    for (let iy = 0; iy < ny; iy++) {
      if (m.clase[k(iy)] !== PASO) continue
      let fin = iy
      while (fin + 1 < ny && m.clase[k(fin + 1)] === PASO) fin++
      const libre = (y: number) => y >= 0 && y < ny && m.clase[k(y)] === LIBRE
      if (!(libre(iy - 1) && libre(iy - 2) && libre(fin + 1) && libre(fin + 2))) for (let y = iy; y <= fin; y++) m.clase[k(y)] = SOLIDO
      iy = fin
    }
  }
  return m
}

const celdaDe = (m: Malla, p: Vector3): [number, number, number] => [
  Math.min(m.nx - 1, Math.max(0, Math.floor((p.x - m.o.x) / m.celda))),
  Math.min(m.ny - 1, Math.max(0, Math.floor((p.y - m.o.y) / m.celda))),
  Math.min(m.nz - 1, Math.max(0, Math.floor((p.z - m.o.z) / m.celda))),
]
const indice = (m: Malla, c: [number, number, number]) => (c[1] * m.nz + c[2]) * m.nx + c[0]
const centro = (m: Malla, k: number) => {
  const ix = k % m.nx, r = (k - ix) / m.nx, iz = r % m.nz, iy = (r - iz) / m.nz
  return new Vector3(m.o.x + (ix + 0.5) * m.celda, m.o.y + (iy + 0.5) * m.celda, m.o.z + (iz + 0.5) * m.celda)
}

/** Montículo binario mínimo de (prioridad, celda). */
class Monticulo {
  private f: number[] = []; private v: number[] = []
  get vacio() { return this.f.length === 0 }
  meter(f: number, v: number) {
    let i = this.f.length
    this.f.push(f); this.v.push(v)
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.f[p] <= f) break
      this.f[i] = this.f[p]; this.v[i] = this.v[p]; i = p
    }
    this.f[i] = f; this.v[i] = v
  }
  sacar(): number {
    const tope = this.v[0], f = this.f.pop()!, v = this.v.pop()!, n = this.f.length
    if (n > 0) {
      let i = 0
      for (;;) {
        let h = 2 * i + 1
        if (h >= n) break
        if (h + 1 < n && this.f[h + 1] < this.f[h]) h++
        if (this.f[h] >= f) break
        this.f[i] = this.f[h]; this.v[i] = this.v[h]; i = h
      }
      this.f[i] = f; this.v[i] = v
    }
    return tope
  }
}

/** Camino más barato entre dos celdas (A*). Devuelve las celdas en orden, o null. */
function camino(m: Malla, ini: number, fin: number, pa: number, pb: number): number[] | null {
  const n = m.clase.length, { nx, nz, ny, celda } = m
  const g = new Float32Array(n).fill(Infinity)
  const previo = new Int32Array(n).fill(-1)
  const cerrada = new Uint8Array(n)
  const fx = fin % nx, fr = (fin - fx) / nx, fz = fr % nz, fy = (fr - fz) / nz
  const h = (ix: number, iy: number, iz: number) => Math.hypot(ix - fx, iy - fy, iz - fz) * celda
  const cola = new Monticulo()
  g[ini] = 0
  cola.meter(0, ini)
  let vueltas = 0
  while (!cola.vacio) {
    const k = cola.sacar()
    if (cerrada[k]) continue
    cerrada[k] = 1
    if (k === fin) break
    if (++vueltas > 350_000) return null
    const ix = k % nx, r = (k - ix) / nx, iz = r % nz, iy = (r - iz) / nz
    const ck = m.clase[k]
    for (let dy = -1; dy <= 1; dy++) {
      const y = iy + dy
      if (y < 0 || y >= ny) continue
      for (let dz = -1; dz <= 1; dz++) {
        const z = iz + dz
        if (z < 0 || z >= nz) continue
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy && !dz) continue
          const x = ix + dx
          if (x < 0 || x >= nx) continue
          const q = (y * nz + z) * nx + x
          if (cerrada[q]) continue
          const cq = m.clase[q]
          // Una placa se cruza solo en vertical, por el agujero.
          if ((cq === PASO || ck === PASO) && (dx || dz)) continue
          let c = Math.sqrt(dx * dx + dy * dy + dz * dz) * celda
          // Por fuera de la planta del chasis el cable cuelga a la vista: cuesta el triple.
          if (m.fuera[z * nx + x]) c *= 3
          if (cq === SOLIDO) c += m.duenio[q] === pa || m.duenio[q] === pb ? COSTO_PROPIA : COSTO_PARED
          else if (cq === PASO && ck !== PASO) {
            const col = m.columna[z * nx + x]
            c += col === 1 ? COSTO_AGUJERO_ABIERTO : col === 2 ? COSTO_PARED : COSTO_AGUJERO
          }
          const ng = g[k] + c
          if (ng < g[q]) { g[q] = ng; previo[q] = k; cola.meter(ng + h(x, y, z), q) }
        }
      }
    }
  }
  if (previo[fin] < 0 && fin !== ini) return null
  const out: number[] = []
  for (let k = fin; k >= 0; k = previo[k]) out.push(k)
  return out.reverse()
}

/** ¿Se puede tender derecho de p a q sin tocar nada que el camino no tocara ya? */
function seVe(m: Malla, p: Vector3, q: Vector3, propias: Set<number>): boolean {
  const n = Math.max(1, Math.ceil(p.distanceTo(q) / (m.celda / 2)))
  const s = new Vector3()
  for (let i = 0; i <= n; i++) {
    const k = indice(m, celdaDe(m, s.copy(p).lerp(q, i / n)))
    if (m.clase[k] !== LIBRE && !propias.has(k)) return false
  }
  return true
}

const STUB = 5

/**
 * Recorrido de cada cable. `cables[i] = null` (una punta sin lugar) da ruta null.
 * Los bancos de protoboard no pasan por aquí: sus puentes van por encima.
 */
export function rutearCables(doc: RobotDoc, cables: ([ExtremoCable, ExtremoCable] | null)[]): RutasCables {
  const rutas: (Vector3[] | null)[] = cables.map(() => null)
  const obs = obstaculos(doc)
  const pendientes = cables.map((c, i) => ({ c, i })).filter(x => x.c && tocaPieza(obs, curvaDirecta(x.c[0], x.c[1]), x.c[0], x.c[1])) as { c: [ExtremoCable, ExtremoCable]; i: number }[]
  if (!pendientes.length) return { rutas, pasacables: [] }
  const m = crearMalla(obs, pendientes.flatMap(x => x.c))
  if (!m) return { rutas, pasacables: [] }
  const idPieza = new Map(doc.piezas.map((p, i) => [p.id, i]))
  const agujeros = new Map<number, Pasacables>()
  pendientes.forEach(({ c: [a, b], i }, orden) => {
    const sa = a.p.clone().addScaledVector(a.dir, STUB), sb = b.p.clone().addScaledVector(b.dir, STUB)
    const ruta = camino(m, indice(m, celdaDe(m, sa)), indice(m, celdaDe(m, sb)), idPieza.get(a.inst) ?? -3, idPieza.get(b.inst) ?? -3)
    if (!ruta) return
    const propias = new Set(ruta)
    // Nudos del recorrido; los de cada lado de un pasacables quedan fijos.
    const nudos: { p: Vector3; fijo: boolean }[] = []
    for (let k = 0; k < ruta.length; k++) {
      if (m.clase[ruta[k]] !== PASO) { nudos.push({ p: centro(m, ruta[k]), fijo: false }); continue }
      let fin = k
      while (fin + 1 < ruta.length && m.clase[ruta[fin + 1]] === PASO) fin++
      const c0 = centro(m, ruta[k]), c1 = centro(m, ruta[fin])
      const ix = ruta[k] % m.nx, iz = ((ruta[k] - ix) / m.nx) % m.nz
      const col = iz * m.nx + ix
      const placa = obs.find(o => o.plana && dentroDeCaja(o.caja, c0, m.celda))
      const esp = placa ? placa.caja.h[ejePlano(placa.caja)] : 1.5
      const cy = placa ? placa.caja.c.y : (c0.y + c1.y) / 2
      const clave = col * 4096 + Math.round(cy)
      const ag = agujeros.get(clave) ?? { x: c0.x, z: c0.z, y0: cy - esp, y1: cy + esp, radio: 0, cables: 0 }
      ag.cables++
      agujeros.set(clave, ag)
      for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
        const x = ix + dx, z = iz + dz
        if (x < 0 || z < 0 || x >= m.nx || z >= m.nz) continue
        const q = z * m.nx + x
        if (!dx && !dz) m.columna[q] = 1
        else if (m.columna[q] === 0) m.columna[q] = 2
      }
      const sube = c1.y >= c0.y ? 1 : -1
      if (nudos.length) nudos[nudos.length - 1].fijo = true
      nudos.push({ p: new Vector3(c0.x, cy - sube * (esp + 4), c0.z), fijo: true })
      nudos.push({ p: new Vector3(c0.x, cy + sube * (esp + 4), c0.z), fijo: true })
      k = fin
      if (k + 1 < ruta.length) { nudos.push({ p: centro(m, ruta[k + 1]), fijo: true }); k++ }
    }
    // Estirar: quitar los nudos que sobran entre dos que se ven derecho.
    const tenso: Vector3[] = []
    let desde = 0
    while (desde < nudos.length) {
      tenso.push(nudos[desde].p)
      if (desde === nudos.length - 1) break
      let hasta = desde + 1
      if (!nudos[desde + 1].fijo) {
        let tope = desde + 1
        while (tope < nudos.length - 1 && !nudos[tope].fijo) tope++
        for (let j = tope; j > desde + 1; j--) if (seVe(m, nudos[desde].p, nudos[j].p, propias)) { hasta = j; break }
      }
      desde = hasta
    }
    // Las puntas exactas en lugar de los centros de celda.
    const medio = tenso.slice(1, -1)
    // Cada cable un poco corrido, para que los que comparten camino no se encimen.
    const rad = 0.5 + 0.28 * (orden % 5), ang = orden * 2.39996
    for (const p of medio) { p.x += Math.cos(ang) * rad; p.z += Math.sin(ang) * rad }
    const puntos = [a.p.clone(), sa, ...medio, sb, b.p.clone()].filter((p, k, arr) => k === 0 || p.distanceTo(arr[k - 1]) > 1)
    rutas[i] = puntos
  })
  const pasacables = Array.from(agujeros.values())
  for (const h of pasacables) h.radio = 2 + 0.6 * Math.sqrt(h.cables)
  return { rutas, pasacables }
}
