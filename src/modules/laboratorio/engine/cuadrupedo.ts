// Perro robot cuadrúpedo: marcha de alto nivel (como el «modo deportivo» del
// Unitree Go2). El programa no mueve motores: pide una postura y una velocidad
// (adelante, de costado, giro) y este controlador hace el resto.
//
// Física (un sub-paso de 1/240 s):
//   1. Cada pata es una suspensión por rayo desde la cadera hacia abajo: la
//      fuerza normal lleva la cadera a la altura de la postura (resorte +
//      amortiguador). Pararse o sentarse = cambiar esas alturas poco a poco.
//   2. En cada pie apoyado, el controlador empuja para que su velocidad sea la
//      del cuerpo que se pidió (v + ω × r), con el límite de la fricción μ·N.
//      Es lo que logra una marcha al trote bien sintonizada sin simular cada
//      paso: el cuerpo se traslada y gira como lo pide el programa.
//   3. La fase del trote (patas en diagonal) solo sirve para dibujar las patas.

import RAPIER from '@dimforge/rapier3d-compat'
import type { V3 as V3mm } from '../catalogo/tipos'
import { dot, rotar, yawDe, type Q, type V3 } from './fisica/vec'

export type Postura = 'echado' | 'parado' | 'sentado' | 'saludo'

/** Lo que el programa le pide al perro: m/s, m/s (+ = izquierda) y grados/s (+ = izquierda). */
export interface ComandoMarcha { vx: number; vy: number; giro: number; postura: Postura }

/** Lo que el perro le cuenta al programa en cada paso. */
export interface EstadoPerro {
  /** Distancia al obstáculo de adelante (cm); null = nada hasta el alcance. */
  distancia: number | null
  /** Cuánto giró desde la salida (grados, + = izquierda), sin saltos en ±180. */
  orientacion: number
  postura: Postura
  /** Ya terminó de cambiar de postura (parado y listo para caminar). */
  lista: boolean
  v_max: number; v_lateral_max: number; giro_max: number; alcance: number
}

export interface CuadrupedoPlan {
  instancia: string
  /** Caderas (m, marco del robot): adelante izq., adelante der., atrás izq., atrás der. */
  caderas: V3[]
  largoPata: number
  alturas: { parado: number; echado: number; sentadoAdelante: number; sentadoAtras: number }
  vMax: number; vLatMax: number; giroMax: number
  /** Sensor de distancia de la cabeza (mm, marco del robot) y su alcance (cm). */
  distancia: { origen: V3mm; alcanceCm: number }
  /** El cable de red llega a la placa: si no, el perro no recibe órdenes. */
  conectado: boolean
}

const COMPRESION = 0.01       // m que se hunde cada pata con su parte del peso
const AMORTIGUAMIENTO = 1.2
const VEL_ALTURA = 0.15       // m/s al pararse, echarse o sentarse
const ACEL = 1.5              // m/s²
const ACEL_GIRO = 6           // rad/s²
const FRECUENCIA_TROTE = 2.6  // pasos por segundo a velocidad máxima (aprox.)
const MU_PIE = 0.9

const hacia = (x: number, objetivo: number, max: number) => x + Math.max(-max, Math.min(max, objetivo - x))

/** Alturas de cadera que pide cada postura (las 4 patas, en el orden de `caderas`). null = la pata en el aire. */
function alturasDe(p: CuadrupedoPlan, postura: Postura): (number | null)[] {
  const a = p.alturas
  switch (postura) {
    case 'parado': return [a.parado, a.parado, a.parado, a.parado]
    case 'echado': return [a.echado, a.echado, a.echado, a.echado]
    case 'sentado': return [a.sentadoAdelante, a.sentadoAdelante, a.sentadoAtras, a.sentadoAtras]
    // Sentado y con la pata delantera derecha levantada.
    case 'saludo': return [a.sentadoAdelante, null, a.sentadoAtras, a.sentadoAtras]
  }
}

/**
 * Dónde apoya cada pie respecto de su cadera (m, marco del robot). Para
 * saludar, la otra pata delantera se corre hacia el centro: así el peso queda
 * dentro del triángulo de las tres patas que apoyan (si no, se cae de costado).
 */
function corrimientoPie(postura: Postura, i: number): { x: number; z: number } {
  return postura === 'saludo' && i === 0 ? { x: 0, z: 0.045 } : { x: 0, z: 0 }
}

export interface PataFisica {
  /** Altura de cadera que está persiguiendo ahora (m). */
  altura: number
  /** Cuánto se corrió el pie de debajo de la cadera (m, marco del robot; va y viene de a poco). */
  corrimiento: { x: number; z: number }
  /** Largo de la pata hasta el piso en el último sub-paso (m; null = no toca). */
  largo: number | null
  normal: number
  enAire: boolean
}

export class Marcha {
  readonly plan: CuadrupedoPlan
  readonly masa: number
  /** Órdenes del programa (o del control manual); null = quedarse como está, quieto. */
  comando: ComandoMarcha | null = null
  postura: Postura = 'echado'
  patas: PataFisica[]
  /** Velocidad que ya alcanzó el controlador (marco del robot): x adelante, y izquierda, w giro (rad/s). */
  v = { x: 0, y: 0, w: 0 }
  /** Fase del trote (rad): para dibujar las patas. */
  fase = 0
  /** Altura del piso bajo los pies (para que el sensor de distancia no lo vea). */
  pisoY = 0
  private yawPrevio: number | null = null
  orientacion = 0
  private readonly k: number
  private readonly b: number

  constructor(plan: CuadrupedoPlan, masa: number) {
    this.plan = plan
    this.masa = masa
    this.k = (masa * 9.81) / (4 * COMPRESION)
    this.b = 2 * AMORTIGUAMIENTO * Math.sqrt((this.k * masa) / 4)
    this.patas = plan.caderas.map(() => ({ altura: plan.alturas.echado, corrimiento: { x: 0, z: 0 }, largo: null, normal: 0, enAire: false }))
  }

  /** Altura del origen del robot (cara de abajo del cuerpo) con las patas en esta postura. */
  alturaOrigen(postura: Postura = this.postura): number {
    const h = alturasDe(this.plan, postura).filter((x): x is number => x !== null)
    // Con su parte del peso, cada resorte se hunde justo COMPRESION: la cadera queda a la altura pedida.
    return h.reduce((s, x) => s + x, 0) / h.length - this.plan.caderas[0].y
  }

  reiniciar() {
    this.comando = null
    this.postura = 'echado'
    this.v = { x: 0, y: 0, w: 0 }
    this.fase = 0
    this.yawPrevio = null
    this.orientacion = 0
    for (const p of this.patas) { p.altura = this.plan.alturas.echado; p.corrimiento = { x: 0, z: 0 }; p.largo = null; p.normal = 0; p.enAire = false }
  }

  /** Parado, con las 4 patas a la altura de pararse: puede caminar. */
  get lista(): boolean {
    return this.postura === 'parado' && this.patas.every(p => Math.abs(p.altura - this.plan.alturas.parado) < 1e-4)
  }

  subpaso(world: RAPIER.World, body: RAPIER.RigidBody, dt: number) {
    const cmd = this.comando
    if (cmd) this.postura = cmd.postura
    const objetivo = alturasDe(this.plan, this.postura)
    this.patas.forEach((p, i) => {
      const h = objetivo[i]
      // La pata se levanta recién cuando la otra ya se corrió (si no, se cae antes).
      const c = corrimientoPie(this.postura, i)
      p.corrimiento.x = hacia(p.corrimiento.x, c.x, VEL_ALTURA * dt)
      p.corrimiento.z = hacia(p.corrimiento.z, c.z, VEL_ALTURA * dt)
      const corrida = this.patas.every((q, j) => Math.abs(q.corrimiento.z - corrimientoPie(this.postura, j).z) < 1e-4)
      p.enAire = h === null && corrida
      if (h !== null) p.altura = hacia(p.altura, h, VEL_ALTURA * dt)
    })

    // Velocidad pedida (solo se camina parado), con aceleración limitada.
    const lista = this.lista
    const vx = lista && cmd ? Math.max(-this.plan.vMax, Math.min(this.plan.vMax, cmd.vx)) : 0
    const vy = lista && cmd ? Math.max(-this.plan.vLatMax, Math.min(this.plan.vLatMax, cmd.vy)) : 0
    const w = lista && cmd ? (Math.max(-this.plan.giroMax, Math.min(this.plan.giroMax, cmd.giro)) * Math.PI) / 180 : 0
    this.v.x = hacia(this.v.x, vx, ACEL * dt)
    this.v.y = hacia(this.v.y, vy, ACEL * dt)
    this.v.w = hacia(this.v.w, w, ACEL_GIRO * dt)
    const rapidez = Math.max(Math.hypot(this.v.x, this.v.y) / this.plan.vMax, Math.abs(this.v.w) / ((this.plan.giroMax * Math.PI) / 180))
    if (rapidez > 0.02) this.fase += 2 * Math.PI * FRECUENCIA_TROTE * Math.min(1, 0.5 + rapidez) * dt
    else this.fase = hacia(this.fase % (2 * Math.PI), 0, 4 * dt)

    const rot = body.rotation() as Q
    const pos = body.translation()
    const yaw = yawDe(rot)
    if (this.yawPrevio !== null) {
      let d = yaw - this.yawPrevio
      if (d > Math.PI) d -= 2 * Math.PI
      if (d < -Math.PI) d += 2 * Math.PI
      this.orientacion += (d * 180) / Math.PI
    }
    this.yawPrevio = yaw

    const abajo = rotar(rot, { x: 0, y: -1, z: 0 })
    // Velocidad pedida en el mundo: adelante = +x del robot, izquierda = −z.
    const ad = rotar(rot, { x: 1, y: 0, z: 0 }), izq = rotar(rot, { x: 0, y: 0, z: -1 })
    const vObj = { x: ad.x * this.v.x + izq.x * this.v.y, z: ad.z * this.v.x + izq.z * this.v.y }
    const mEff = this.masa / 8
    let piso = Infinity

    body.resetForces(true)
    body.resetTorques(true)
    this.patas.forEach((p, i) => {
      p.normal = 0
      p.largo = null
      const cad = this.plan.caderas[i]
      const off = rotar(rot, { x: cad.x + p.corrimiento.x, y: cad.y, z: cad.z + p.corrimiento.z })
      const c = { x: pos.x + off.x, y: pos.y + off.y, z: pos.z + off.z }
      const hit = world.castRay(new RAPIER.Ray(c, abajo), this.plan.largoPata, true, undefined, undefined, undefined, body)
      if (!hit) return
      p.largo = hit.timeOfImpact
      const pie = { x: c.x + abajo.x * hit.timeOfImpact, y: c.y + abajo.y * hit.timeOfImpact, z: c.z + abajo.z * hit.timeOfImpact }
      piso = Math.min(piso, pie.y)
      if (p.enAire) return
      const compresion = p.altura + COMPRESION - hit.timeOfImpact
      if (compresion <= 0) return
      const N = Math.max(0, this.k * compresion + this.b * dot(body.velocityAtPoint(c), abajo))
      if (N <= 0) return
      p.normal = N
      body.addForceAtPoint({ x: -abajo.x * N, y: -abajo.y * N, z: -abajo.z * N }, pie, true)

      // El pie empuja para llevar su punto a la velocidad pedida: v + ω × r (ω vertical).
      const r = { x: pie.x - pos.x, z: pie.z - pos.z }
      const objetivo = { x: vObj.x + this.v.w * r.z, z: vObj.z - this.v.w * r.x }
      const v = body.velocityAtPoint(pie)
      let fx = ((objetivo.x - v.x) * mEff) / dt
      let fz = ((objetivo.z - v.z) * mEff) / dt
      const total = Math.hypot(fx, fz), limite = MU_PIE * N
      if (total > limite) { fx *= limite / total; fz *= limite / total }
      body.addForceAtPoint({ x: fx, y: 0, z: fz }, pie, true)
    })
    if (piso < Infinity) this.pisoY = piso
  }
}

/** Lo que mide el sensor de distancia de la cabeza: un abanico de rayos que ignora el piso. */
export function medirDistancia(
  plan: CuadrupedoPlan, marcha: Marcha,
  rayo: (o: V3, d: V3, alcance: number) => number | null, punto: (p: V3mm) => V3, direccion: (d: V3) => V3,
): number | null {
  const o = punto(plan.distancia.origen)
  const alcance = plan.distancia.alcanceCm / 100
  let min: number | null = null
  for (const elev of [0, -10, -20]) {
    for (const az of [-20, -10, 0, 10, 20]) {
      const e = (elev * Math.PI) / 180, a = (az * Math.PI) / 180
      const d = direccion({ x: Math.cos(e) * Math.cos(a), y: Math.sin(e), z: Math.cos(e) * Math.sin(a) })
      const t = rayo(o, d, alcance)
      if (t === null || o.y + d.y * t < marcha.pisoY + 0.02) continue   // eso es el piso
      if (min === null || t < min) min = t
    }
  }
  return min === null ? null : min * 100
}

export function estadoPerro(plan: CuadrupedoPlan, marcha: Marcha, distancia: number | null): EstadoPerro {
  return {
    distancia: distancia === null ? null : Math.round(distancia * 10) / 10,
    orientacion: marcha.orientacion, postura: marcha.postura, lista: marcha.lista,
    v_max: plan.vMax, v_lateral_max: plan.vLatMax, giro_max: plan.giroMax, alcance: plan.distancia.alcanceCm,
  }
}
