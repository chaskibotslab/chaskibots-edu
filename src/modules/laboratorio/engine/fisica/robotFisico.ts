// Robot físico construido desde sus piezas (F2).
//
// Cuerpo: un solo cuerpo rígido con los colisionadores de todas las piezas en
// su lugar, cada uno con su masa → el centro de masa y la inercia salen solos.
//
// Ruedas motrices (cualquier cantidad): suspensión corta por rayo + modelo de
// neumático (el de F1, generalizado):
//   1. Un rayo desde el centro de la rueda hacia abajo mide cuánto se comprime
//      el "neumático" → fuerza normal N de esa rueda (resorte + amortiguador).
//      Así el peso se reparte solo entre las ruedas, una rueda en el aire no
//      empuja y con gravedad cero N = 0.
//   2. El motor lleva la rueda hacia su velocidad objetivo (bridge.motorStep).
//   3. En el contacto, la diferencia entre ω·R y la velocidad real del suelo
//      (deslizamiento) da la fuerza de tracción; la velocidad lateral da una
//      fuerza que la frena. Ambas limitadas por el círculo de fricción
//      |F| ≤ μ·N, con μ según el material de la rueda y del piso.
// Las ruedas tienen además un colisionador sin fricción un poco más chico
// (para chocar de costado con paredes), y la rueda loca es una esfera sin
// fricción que toca el piso.
//
// Servos: el ángulo sigue al pedido a la velocidad del servo (p. ej. SG90 =
// 600°/s). Lo que cuelga del servo gira con él para los sensores; sus
// colisionadores quedan en la posición de 90° (son piezas livianas).

import RAPIER from '@dimforge/rapier3d-compat'
import { Euler, Quaternion as TQ } from 'three'
import { datosVariante, pieza } from '../../catalogo/piezas'
import { friccion, type Colisionador } from '../../catalogo/tipos'
import type { RobotDoc } from '../../robots/doc'
import { motorStep, type MotorParams } from '../bridge'
import { poses, ruedasLocas, type Pose } from '../ensamblaje'
import type { SimPlan } from '../plan'
import type { Pose2D } from '../tracks'
import { Mundo, SUBPASO } from './mundo'
import { dot, horizontal, rotar, yawDe, yawQuat, type Q, type V3 } from './vec'

/** Compresión estática del neumático (m): define la rigidez de la suspensión. */
const COMPRESION = 0.002
const AMORTIGUAMIENTO = 0.8
const G_REF = 9.81

export interface RuedaFisica {
  motor: string
  instancia: string
  centro: V3          // m, marco del cuerpo
  radio: number       // m
  mu: number
  params: MotorParams
  omega: number
  angulo: number
  volts: number
  normal: number
}

export interface ServoFisico { instancia: string; angulo: number; objetivo: number | null; gradosPorSeg: number; activo: boolean }

const mm = (v: { x: number; y: number; z: number }): V3 => ({ x: v.x / 1000, y: v.y / 1000, z: v.z / 1000 })

function rotacionColisionador(c: Colisionador): TQ {
  if (c.forma === 'caja') {
    const r = c.rotacion ?? [0, 0, 0]
    return new TQ().setFromEuler(new Euler((r[0] * Math.PI) / 180, (r[1] * Math.PI) / 180, (r[2] * Math.PI) / 180, 'XYZ'))
  }
  // Los cilindros de Rapier van a lo largo de +y.
  if (c.forma !== 'cilindro' || c.eje === 'y') return new TQ()
  return new TQ().setFromEuler(c.eje === 'x' ? new Euler(0, 0, Math.PI / 2) : new Euler(Math.PI / 2, 0, 0))
}

export class RobotFisico {
  readonly mundo: Mundo
  readonly body: RAPIER.RigidBody
  readonly doc: RobotDoc
  readonly masa: number
  readonly ruedas: RuedaFisica[] = []
  readonly servos = new Map<string, ServoFisico>()
  /** Altura del origen del robot (chasis) cuando apoya en el piso (m). */
  readonly alturaApoyo: number
  private readonly k: number
  private readonly b: number

  constructor(mundo: Mundo, doc: RobotDoc, plan: SimPlan, inicio: Pose2D) {
    this.mundo = mundo
    this.doc = doc
    const world = mundo.world
    const ps = poses(doc)
    const locas = new Map(ruedasLocas(doc, ps).map(l => [l.instancia, l]))
    const material = mundo.arena.piso.material

    // Punto más bajo (ruedas y ruedas locas) para apoyar el robot en el piso.
    let bajo = Infinity
    for (const m of plan.motores) if (m.rueda) bajo = Math.min(bajo, m.rueda.centro.y - m.rueda.radio)
    for (const l of Array.from(locas.values())) bajo = Math.min(bajo, l.centroBola.y - l.radio)
    if (!isFinite(bajo)) bajo = -30
    this.alturaApoyo = -bajo / 1000 + COMPRESION

    this.body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(inicio.x, this.alturaApoyo, inicio.z)
        .setRotation(yawQuat(inicio.yaw))
        .setCanSleep(false)
        .setAngularDamping(0.5)
        .setLinearDamping(0.05),
    )

    const sinFriccion = (d: RAPIER.ColliderDesc) =>
      d.setFriction(0).setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min).setRestitution(0)

    let masa = 0
    for (const p of doc.piezas) {
      const def = pieza(p.pieza)
      const m = datosVariante(def, p.variante).masa_g / 1000
      masa += m
      const pose = ps.get(p.id)!
      const c = def.comportamiento
      if (c.tipo === 'rueda-loca') {
        const l = locas.get(p.id)!
        world.createCollider(sinFriccion(RAPIER.ColliderDesc.ball(l.radio / 1000)).setTranslation(l.centroBola.x / 1000, l.centroBola.y / 1000, l.centroBola.z / 1000).setMass(m), this.body)
        continue
      }
      if (c.tipo === 'rueda') {
        const q = pose.rot.clone().multiply(new TQ().setFromEuler(new Euler(Math.PI / 2, 0, 0)))
        world.createCollider(
          sinFriccion(RAPIER.ColliderDesc.cylinder(c.ancho_mm / 2000, (c.radio_mm - 3) / 1000))
            .setTranslation(pose.pos.x / 1000, pose.pos.y / 1000, pose.pos.z / 1000)
            .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
            .setMass(m),
          this.body,
        )
        continue
      }
      this.agregarColisionadores(def.colisionadores, pose, m)
    }
    this.masa = masa

    for (const mp of plan.motores) {
      if (!mp.rueda) continue
      const r = mp.rueda
      this.ruedas.push({
        motor: mp.instancia, instancia: r.instancia, centro: mm(r.centro), radio: r.radio / 1000,
        mu: friccion(r.material, material), params: mp.params, omega: 0, angulo: 0, volts: 0, normal: 0,
      })
    }
    for (const s of plan.servos) this.servos.set(s.instancia, { instancia: s.instancia, angulo: 90, objetivo: null, gradosPorSeg: s.gradosPorSeg, activo: s.alimentado })

    const n = Math.max(1, this.ruedas.length)
    this.k = (this.masa * G_REF) / (n * COMPRESION)
    this.b = 2 * AMORTIGUAMIENTO * Math.sqrt((this.k * this.masa) / n)
  }

  private agregarColisionadores(cs: Colisionador[], pose: Pose, masa: number) {
    for (const c of cs) {
      const desc = c.forma === 'caja'
        ? RAPIER.ColliderDesc.cuboid(c.medidas[0] / 2000, c.medidas[1] / 2000, c.medidas[2] / 2000)
        : c.forma === 'esfera'
          ? RAPIER.ColliderDesc.ball(c.radio / 1000)
          : RAPIER.ColliderDesc.cylinder(c.alto / 2000, c.radio / 1000)
      // Centro del colisionador (marco de la pieza) llevado al marco del robot.
      const [cx, cy, cz] = c.centro ?? [0, 0, 0]
      const off = rotar(pose.rot, { x: cx, y: cy, z: cz })
      const q = pose.rot.clone().multiply(rotacionColisionador(c))
      desc.setTranslation((pose.pos.x + off.x) / 1000, (pose.pos.y + off.y) / 1000, (pose.pos.z + off.z) / 1000)
        .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
        .setFriction(c.friccion ?? 0.5)
        .setMass(masa / cs.length)
      // Una pala de poca fricción manda: si no, Rapier promedia con el piso.
      if (c.friccion !== undefined) desc.setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
      this.mundo.world.createCollider(desc, this.body)
    }
  }

  colocar(p: Pose2D) {
    this.body.setTranslation({ x: p.x, y: this.alturaApoyo, z: p.z }, true)
    this.body.setRotation(yawQuat(p.yaw), true)
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    for (const r of this.ruedas) { r.omega = 0; r.volts = 0 }
  }

  /** Un sub-paso de 1/240 s: servos, motores y fuerzas de las ruedas. */
  subpaso(dt = SUBPASO) {
    for (const s of Array.from(this.servos.values())) {
      if (!s.activo || s.objetivo === null) continue
      const d = s.objetivo - s.angulo
      const max = s.gradosPorSeg * dt
      s.angulo += Math.max(-max, Math.min(max, d))
    }

    const body = this.body
    const rot = body.rotation()
    const pos = body.translation()
    const abajo = rotar(rot, { x: 0, y: -1, z: 0 })
    // Direcciones del robot proyectadas sobre el piso: el piso solo puede
    // empujar en horizontal (si no, al inclinarse la tracción lo levantaría).
    const adelante = horizontal(rotar(rot, { x: 1, y: 0, z: 0 }))
    const lateral = { x: -adelante.z, y: 0, z: adelante.x }
    const n = Math.max(1, this.ruedas.length)
    // "Masa efectiva" que cada rueda debe empujar para anular el deslizamiento en un paso.
    const mEff = this.masa / (2 * n)

    // Ojo: addForceAtPoint suma fuerza Y torque; hay que borrar los dos cada paso.
    body.resetForces(true)
    body.resetTorques(true)
    for (const r of this.ruedas) {
      r.omega = motorStep(r.omega, r.volts, dt, r.params)
      r.angulo += r.omega * dt
      r.normal = 0

      const off = rotar(rot, r.centro)
      const c = { x: pos.x + off.x, y: pos.y + off.y, z: pos.z + off.z }
      const alcance = r.radio + COMPRESION
      const ray = new RAPIER.Ray(c, abajo)
      const hit = this.mundo.world.castRay(ray, alcance + 0.01, true, undefined, undefined, undefined, body)
      if (!hit) continue
      const compresion = alcance - hit.timeOfImpact
      if (compresion <= 0) continue
      const vComp = dot(body.velocityAtPoint(c), abajo)
      const N = Math.max(0, this.k * compresion + this.b * vComp)
      if (N <= 0) continue
      r.normal = N
      body.addForceAtPoint({ x: -abajo.x * N, y: -abajo.y * N, z: -abajo.z * N }, c, true)

      const punto = { x: c.x + abajo.x * hit.timeOfImpact, y: c.y + abajo.y * hit.timeOfImpact, z: c.z + abajo.z * hit.timeOfImpact }
      const v = body.velocityAtPoint(punto)
      const vLong = dot(v, adelante)
      const vLat = dot(v, lateral)
      const limite = r.mu * N
      let fLong = ((r.omega * r.radio - vLong) * mEff) / dt
      let fLat = (-vLat * mEff) / dt
      const total = Math.hypot(fLong, fLat)
      if (total > limite) { fLong *= limite / total; fLat *= limite / total }
      body.addForceAtPoint(
        { x: adelante.x * fLong + lateral.x * fLat, y: 0, z: adelante.z * fLong + lateral.z * fLat },
        punto,
        true,
      )
    }
  }

  /** Punto (mm, marco del robot) en el mundo (m). */
  puntoMundo(p: V3): V3 {
    const o = rotar(this.body.rotation(), mm(p))
    const t = this.body.translation()
    return { x: t.x + o.x, y: t.y + o.y, z: t.z + o.z }
  }

  direccionMundo(d: V3): V3 { return rotar(this.body.rotation(), d) }

  /** Distancia (m) al primer obstáculo en esa dirección, o null. No se ve a sí mismo. */
  rayo(origen: V3, dir: V3, alcance: number): number | null {
    const hit = this.mundo.world.castRay(new RAPIER.Ray(origen, dir), alcance, true, undefined, undefined, undefined, this.body)
    return hit ? hit.timeOfImpact : null
  }

  angulosServo(): Record<string, number> {
    const out: Record<string, number> = {}
    for (const s of Array.from(this.servos.values())) out[s.instancia] = s.angulo
    return out
  }

  pose() {
    const p = this.body.translation()
    const q = this.body.rotation() as Q
    const v = this.body.linvel()
    return { pos: p, rot: q, velocidad: Math.hypot(v.x, v.z), yaw: yawDe(q) }
  }
}

/** Avanza el mundo `dt` segundos en sub-pasos fijos (mismo resultado en cualquier equipo). */
export class Reloj {
  private acumulado = 0
  avanzar(mundo: Mundo, robots: RobotFisico[], dt: number) {
    this.acumulado += Math.min(dt, 0.1)
    while (this.acumulado >= SUBPASO) {
      for (const r of robots) r.subpaso(SUBPASO)
      mundo.world.step()
      this.acumulado -= SUBPASO
    }
  }
}
