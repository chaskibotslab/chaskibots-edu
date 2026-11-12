'use client'
// Conexiones por PCB: en lugar de un cable suelto por cada conexión, la placa
// y el driver van sobre una placa de circuito con pistas de cobre, y cada pieza
// de afuera (sensor, motor, batería) llega con un solo mazo ordenado hasta un
// conector en el borde. Las conexiones son las mismas del robot (doc.cables):
// solo cambia cómo se dibujan. Todo en metros, en el marco del robot.

import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { pieza } from '../../catalogo/piezas'
import { aRobot, poses } from '../../engine/ensamblaje'
import type { Cable, RobotDoc } from '../../robots/doc'
import { anclaPin, type SalidaPin } from './Piezas3D'

interface Punta { pos: THREE.Vector3; dir: THREE.Vector3; tipo: SalidaPin['tipo'] }
export interface CablePuesto { c: Cable; i: number; p: [Punta, Punta] }

const MM = 0.001
const MARGEN = 5 * MM
const PASO_PISTA = 0.8 * MM
const PASO_HILO = 1.1 * MM
/** Más alto que esto sobre la PCB ya no es un zócalo: esa pieza va aparte. */
const ZOCALO_MAX = 14

/** Va soldada (o en zócalo) sobre la PCB: la placa y el driver de motores. */
const vaEnPcb = (id: string) => {
  const d = pieza(id)
  return d.familia === 'placa' || d.comportamiento.tipo === 'puente-h'
}

interface CajaPcb { id: string; x0: number; x1: number; z0: number; z1: number; y0: number }
export interface PlanoPcb { ids: Set<string>; cajas: CajaPcb[]; x0: number; x1: number; z0: number; z1: number; y: number }

/** Dónde va la PCB: debajo de la placa y del driver, con un margen. null si el robot no tiene ninguno. */
export function planoPcb(doc: RobotDoc): PlanoPcb | null {
  const ps = poses(doc)
  const cajas: CajaPcb[] = []
  for (const p of doc.piezas) {
    const pose = ps.get(p.id)
    if (!p.padre || !pose || !vaEnPcb(p.pieza)) continue
    const def = pieza(p.pieza)
    const c = (def.huella ?? def.colisionadores)[0]
    if (!c || c.forma !== 'caja') continue
    const k: CajaPcb = { id: p.id, x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity, y0: Infinity }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const v = aRobot(pose, [(c.centro?.[0] ?? 0) + sx * c.medidas[0] / 2, (c.centro?.[1] ?? 0) + sy * c.medidas[1] / 2, (c.centro?.[2] ?? 0) + sz * c.medidas[2] / 2])
      k.x0 = Math.min(k.x0, v.x); k.x1 = Math.max(k.x1, v.x); k.z0 = Math.min(k.z0, v.z); k.z1 = Math.max(k.z1, v.z); k.y0 = Math.min(k.y0, v.y)
    }
    cajas.push(k)
  }
  if (!cajas.length) return null
  const base = Math.min(...cajas.map(k => k.y0))
  const sobre = cajas.filter(k => k.y0 - base <= ZOCALO_MAX)
  return {
    ids: new Set(sobre.map(k => k.id)),
    cajas: sobre.map(k => ({ ...k, x0: k.x0 * MM, x1: k.x1 * MM, z0: k.z0 * MM, z1: k.z1 * MM, y0: k.y0 * MM })),
    x0: Math.min(...sobre.map(k => k.x0)) * MM - MARGEN, x1: Math.max(...sobre.map(k => k.x1)) * MM + MARGEN,
    z0: Math.min(...sobre.map(k => k.z0)) * MM - MARGEN, z1: Math.max(...sobre.map(k => k.z1)) * MM + MARGEN,
    y: (base + 0.3) * MM,
  }
}

type P2 = [number, number]   // (x, z) sobre la PCB

interface Mazo { inst: string; hilos: { color: string; pin: Punta; enPcb: P2 }[]; centro: P2; n: P2; t: P2; ancho: number }

/** Reparte las conexiones: pistas entre lo que está en la PCB, un mazo por cada pieza de afuera, y lo demás suelto. */
function repartir(pl: PlanoPcb, lista: CablePuesto[]) {
  const pistas: { puntos: P2[] }[] = []
  const sueltos: CablePuesto[] = []
  const porPieza = new Map<string, Mazo['hilos']>()
  const p2 = (p: Punta): P2 => [p.pos.x, p.pos.z]
  const internas = lista.filter(x => pl.ids.has(x.c.de[0]) && pl.ids.has(x.c.a[0]))
  internas.forEach((x, j) => {
    const A = p2(x.p[0]), B = p2(x.p[1])
    const ka = pl.cajas.find(k => k.id === x.c.de[0])!, kb = pl.cajas.find(k => k.id === x.c.a[0])!
    const carril = (j - (internas.length - 1) / 2) * PASO_PISTA
    const dx = (kb.x0 + kb.x1 - ka.x0 - ka.x1) / 2, dz = (kb.z0 + kb.z1 - ka.z0 - ka.z1) / 2
    if (ka === kb) pistas.push({ puntos: [A, [A[0], B[1]], B] })
    else if (Math.abs(dz) >= Math.abs(dx)) {
      const z = (dz > 0 ? (ka.z1 + kb.z0) / 2 : (ka.z0 + kb.z1) / 2) + carril
      pistas.push({ puntos: [A, [A[0], z], [B[0], z], B] })
    } else {
      const xm = (dx > 0 ? (ka.x1 + kb.x0) / 2 : (ka.x0 + kb.x1) / 2) + carril
      pistas.push({ puntos: [A, [xm, A[1]], [xm, B[1]], B] })
    }
  })
  for (const x of lista) {
    const de = pl.ids.has(x.c.de[0]), a = pl.ids.has(x.c.a[0])
    if (de === a) { if (!de) sueltos.push(x); continue }
    const [afuera, adentro, inst] = de ? [x.p[1], x.p[0], x.c.a[0]] : [x.p[0], x.p[1], x.c.de[0]]
    porPieza.set(inst, [...(porPieza.get(inst) ?? []), { color: x.c.color, pin: afuera, enPcb: p2(adentro) }])
  }
  // Cada mazo llega al punto del borde más cercano a su pieza; si dos caen juntos, se corren.
  const mazos: Mazo[] = []
  const cx = (pl.x0 + pl.x1) / 2, cz = (pl.z0 + pl.z1) / 2
  for (const [inst, hilos] of Array.from(porPieza)) {
    const px = hilos.reduce((s, h) => s + h.pin.pos.x, 0) / hilos.length, pz = hilos.reduce((s, h) => s + h.pin.pos.z, 0) / hilos.length
    const x = Math.min(pl.x1, Math.max(pl.x0, px)), z = Math.min(pl.z1, Math.max(pl.z0, pz))
    // El borde más cercano (si la pieza está debajo o encima de la PCB, también).
    const d = [x - pl.x0, pl.x1 - x, z - pl.z0, pl.z1 - z]
    const borde = d.indexOf(Math.min(...d))
    const n: P2 = borde === 0 ? [-1, 0] : borde === 1 ? [1, 0] : borde === 2 ? [0, -1] : [0, 1]
    const t: P2 = [Math.abs(n[1]), Math.abs(n[0])]
    const ancho = hilos.length * PASO_HILO + 1.6 * MM
    const adentro = 2.4 * MM
    let centro: P2 = borde === 0 ? [pl.x0 + adentro, z] : borde === 1 ? [pl.x1 - adentro, z] : borde === 2 ? [x, pl.z0 + adentro] : [x, pl.z1 - adentro]
    const lim = (c: P2): P2 => (t[0] ? [Math.min(pl.x1 - ancho / 2 - MM, Math.max(pl.x0 + ancho / 2 + MM, c[0])), c[1]] : [c[0], Math.min(pl.z1 - ancho / 2 - MM, Math.max(pl.z0 + ancho / 2 + MM, c[1]))])
    centro = lim(centro)
    const choca = (c: P2) => mazos.some(m => m.n[0] === n[0] && m.n[1] === n[1] && Math.abs((c[0] - m.centro[0]) * t[0] + (c[1] - m.centro[1]) * t[1]) < (ancho + m.ancho) / 2 + 0.8 * MM)
    const hacia = ((t[0] ? cx - centro[0] : cz - centro[1]) >= 0 ? 1 : -1)
    for (let k = 1; k <= 24 && choca(centro); k++) {
      const paso = Math.ceil(k / 2) * 1.5 * MM * (k % 2 ? hacia : -hacia)
      const c = lim([centro[0] + t[0] * paso, centro[1] + t[1] * paso])
      if (!choca(c)) centro = c
    }
    // Los hilos en el orden de los pines de la pieza, para que el mazo no se cruce.
    const orden = (h: Mazo['hilos'][number]) => h.pin.pos.x * t[0] + h.pin.pos.z * t[1]
    mazos.push({ inst, hilos: [...hilos].sort((a, b) => orden(a) - orden(b)), centro, n, t, ancho })
  }
  // Pistas del conector al pin de la placa o del driver.
  mazos.forEach(m => m.hilos.forEach((h, k) => {
    const o = (k - (m.hilos.length - 1) / 2) * PASO_HILO
    const T: P2 = [m.centro[0] + m.t[0] * o, m.centro[1] + m.t[1] * o]
    const fondo = (2.2 + k * 0.8) * MM
    const I: P2 = [T[0] - m.n[0] * fondo, T[1] - m.n[1] * fondo]
    pistas.push({ puntos: m.n[0] ? [T, I, [I[0], h.enPcb[1]], h.enPcb] : [T, I, [h.enPcb[0], I[1]], h.enPcb] })
  }))
  return { pistas, mazos, sueltos }
}

/** Todas las pistas y sus pads en una sola malla plana. */
function geometriaPistas(pistas: { puntos: P2[] }[], y: number) {
  const pos: number[] = []
  const cuad = (a: P2, b: P2, w: number) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz)
    if (l < 1e-6) return
    const nx = (-dz / l) * w, nz = (dx / l) * w, ex = (dx / l) * w, ez = (dz / l) * w
    const A = [a[0] - ex + nx, a[1] - ez + nz], B = [a[0] - ex - nx, a[1] - ez - nz], C = [b[0] + ex - nx, b[1] + ez - nz], D = [b[0] + ex + nx, b[1] + ez + nz]
    pos.push(A[0], y, A[1], D[0], y, D[1], B[0], y, B[1], B[0], y, B[1], D[0], y, D[1], C[0], y, C[1])
  }
  for (const { puntos } of pistas) {
    for (let i = 0; i + 1 < puntos.length; i++) cuad(puntos[i], puntos[i + 1], 0.22 * MM)
    for (const p of [puntos[0], puntos[puntos.length - 1]]) cuad([p[0] - 0.45 * MM, p[1]], [p[0] + 0.45 * MM, p[1]], 0.5 * MM)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

function Hilo({ desde, n, pin, color }: { desde: THREE.Vector3; n: THREE.Vector3; pin: Punta; color: string }) {
  const geo = useMemo(() => {
    const fin = pin.pos.clone().addScaledVector(pin.dir, 0.003)
    const L = desde.distanceTo(fin), tiron = Math.min(0.02, 0.005 + L * 0.25)
    const c1 = desde.clone().addScaledVector(n, tiron), c2 = fin.clone().addScaledVector(pin.dir, tiron)
    c1.y -= L * 0.05; c2.y -= L * 0.05
    return new THREE.TubeGeometry(new THREE.CubicBezierCurve3(desde, c1, c2, fin), 24, 0.00045, 5, false)
  }, [desde, n, pin])
  return <mesh geometry={geo}><meshStandardMaterial color={color} roughness={0.45} /></mesh>
}

const CAJA = new THREE.BoxGeometry(1, 1, 1)

export function CablesPcb({ doc, lista, suelto }: { doc: RobotDoc; lista: CablePuesto[]; suelto: (x: CablePuesto) => ReactNode }) {
  const d = useMemo(() => {
    const pl = planoPcb(doc)
    if (!pl) return null
    const r = repartir(pl, lista)
    // Zócalos: lo que queda levantado sobre la PCB (el Nano en sus tiras de pines) baja hasta ella.
    const ps = poses(doc)
    const zocalos: { x: number; z: number; alto: number }[] = []
    for (const k of pl.cajas) {
      const alto = k.y0 - pl.y
      const p = doc.piezas.find(x => x.id === k.id)!
      const pose = ps.get(k.id)
      if (alto < 2.5 * MM || !pose) continue
      const def = pieza(p.pieza)
      for (const pin of def.pines) {
        const a = anclaPin(def.modelo, pin.nombre)
        if (!a) continue
        const v = aRobot(pose, a)
        zocalos.push({ x: v.x * MM, z: v.z * MM, alto })
      }
    }
    return { pl, ...r, zocalos, pistas: geometriaPistas(r.pistas, pl.y + 0.12 * MM) }
  }, [doc, lista])
  if (!d) return <>{lista.map(suelto)}</>
  const { pl } = d
  return (
    <group>
      <mesh geometry={CAJA} position={[(pl.x0 + pl.x1) / 2, pl.y - 0.6 * MM, (pl.z0 + pl.z1) / 2]} scale={[pl.x1 - pl.x0, 1.2 * MM, pl.z1 - pl.z0]} receiveShadow>
        <meshStandardMaterial color="#10151b" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh geometry={d.pistas}>
        <meshStandardMaterial color="#d9a92f" roughness={0.35} metalness={0.7} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} />
      </mesh>
      {d.zocalos.map((z, i) => (
        <mesh key={`z${i}`} geometry={CAJA} position={[z.x, pl.y + z.alto / 2, z.z]} scale={[2.4 * MM, z.alto, 2.4 * MM]}>
          <meshStandardMaterial color="#15171a" roughness={0.6} />
        </mesh>
      ))}
      {d.mazos.map(m => {
        const n = new THREE.Vector3(m.n[0], 0, m.n[1])
        return (
          <group key={m.inst}>
            <mesh geometry={CAJA} position={[m.centro[0], pl.y + 1.9 * MM, m.centro[1]]} scale={[m.t[0] ? m.ancho : 3.4 * MM, 3.8 * MM, m.t[1] ? m.ancho : 3.4 * MM]}>
              <meshStandardMaterial color="#ece7da" roughness={0.6} />
            </mesh>
            {m.hilos.map((h, k) => {
              const o = (k - (m.hilos.length - 1) / 2) * PASO_HILO
              const desde = new THREE.Vector3(m.centro[0] + m.t[0] * o + m.n[0] * 1.7 * MM, pl.y + 2 * MM, m.centro[1] + m.t[1] * o + m.n[1] * 1.7 * MM)
              return <Hilo key={k} desde={desde} n={n} pin={h.pin} color={h.color} />
            })}
          </group>
        )
      })}
      {d.sueltos.map(suelto)}
    </group>
  )
}
