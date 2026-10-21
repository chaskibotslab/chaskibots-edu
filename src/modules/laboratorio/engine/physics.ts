// Física del robot con Rapier (motor de física 3D en WebAssembly).
//
// El chasis es un cuerpo rígido con su masa real (suma de los componentes del
// catálogo). Se apoya en el piso sobre dos esferas en las ruedas y la rueda
// loca, todas SIN fricción: el agarre de las ruedas lo calculamos nosotros
// (modelo de neumático), porque así controlamos exactamente cómo empuja cada
// motor y el robot no "patina" de forma rara.
//
// Modelo de cada rueda motriz, en cada sub-paso:
//   1. El motor lleva la rueda hacia su velocidad objetivo (bridge.motorStep).
//   2. En el punto de contacto comparamos la velocidad de la superficie de la
//      rueda (ω·R) con la velocidad real del suelo bajo ella.
//   3. Esa diferencia (deslizamiento) genera una fuerza longitudinal; la
//      velocidad lateral genera una fuerza que la frena (la rueda no se mueve
//      de costado). Ambas están limitadas por fricción: |F| ≤ μ·N.
//   Con gravedad cero N = 0: las ruedas giran pero el robot no avanza.

import RAPIER from '@dimforge/rapier3d-compat'
import { motorStep, type MotorParams } from './bridge'
import type { RobotDef } from '../robots/seguidorLinea'
import type { Pose2D } from './tracks'

export const GRAVEDADES = {
  tierra: { nombre: 'Tierra', g: 9.81 },
  luna: { nombre: 'Luna', g: 1.62 },
  marte: { nombre: 'Marte', g: 3.71 },
  cero: { nombre: 'Gravedad cero', g: 0 },
} as const
export type Gravedad = keyof typeof GRAVEDADES

let rapierListo: Promise<void> | null = null
export function iniciarRapier(): Promise<void> {
  if (!rapierListo) rapierListo = RAPIER.init()
  return rapierListo
}

const SUBPASO = 1 / 240
const MU_RUEDA = 0.9

export interface RuedaEstado { omega: number; angulo: number; volts: number }

export class RobotFisico {
  readonly world: RAPIER.World
  readonly body: RAPIER.RigidBody
  readonly radio: number
  readonly vias: number
  readonly masa: number
  private g: number
  private acumulado = 0
  ruedas: { izq: RuedaEstado; der: RuedaEstado } = {
    izq: { omega: 0, angulo: 0, volts: 0 },
    der: { omega: 0, angulo: 0, volts: 0 },
  }

  constructor(robot: RobotDef, masaKg: number, gravedad: Gravedad, inicio: Pose2D) {
    const geo = robot.geometria
    this.radio = geo.radio_rueda_mm / 1000
    this.vias = geo.vias_mm / 1000
    this.masa = masaKg
    this.g = GRAVEDADES[gravedad].g

    this.world = new RAPIER.World({ x: 0, y: -this.g, z: 0 })

    // Piso (la cara superior queda en y = 0).
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(20, 0.05, 20).setTranslation(0, -0.05, 0).setFriction(0.8))

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(inicio.x, this.radio + 0.001, inicio.z)
      .setRotation(yawQuat(inicio.yaw))
      .setCanSleep(false)
      .setAngularDamping(0.5)
      .setLinearDamping(0.05)
    this.body = this.world.createRigidBody(bodyDesc)

    const ch = geo.chasis_mm
    const sinFriccion = (d: RAPIER.ColliderDesc) =>
      d.setFriction(0).setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min).setRestitution(0)

    // Chasis: lleva casi toda la masa. El centro de masa queda un poco
    // detrás del eje (batería y driver atrás), como en el robot real.
    this.world.createCollider(
      sinFriccion(RAPIER.ColliderDesc.cuboid(ch.largo / 2000, 0.02, ch.ancho / 2000))
        .setTranslation(ch.centro_x / 1000, ch.altura / 1000 + 0.012, 0)
        .setMass(masaKg * 0.9),
      this.body,
    )
    // Apoyos de las ruedas y rueda loca.
    for (const z of [-this.vias / 2, this.vias / 2]) {
      this.world.createCollider(sinFriccion(RAPIER.ColliderDesc.ball(this.radio)).setTranslation(0, 0, z).setMass(masaKg * 0.04), this.body)
    }
    const [lx, ly, lz] = geo.rueda_loca_mm.map(v => v / 1000)
    this.world.createCollider(sinFriccion(RAPIER.ColliderDesc.ball(0.008)).setTranslation(lx, ly, lz).setMass(masaKg * 0.02), this.body)
  }

  setGravedad(gravedad: Gravedad) {
    this.g = GRAVEDADES[gravedad].g
    this.world.gravity = { x: 0, y: -this.g, z: 0 }
  }

  colocar(p: Pose2D) {
    this.body.setTranslation({ x: p.x, y: this.radio + 0.001, z: p.z }, true)
    this.body.setRotation(yawQuat(p.yaw), true)
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    this.ruedas.izq.omega = 0
    this.ruedas.der.omega = 0
  }

  /**
   * Avanza la física `dt` segundos con los voltajes de cada motor.
   * `dt` es exactamente el tiempo que corrió el microcontrolador emulado.
   */
  paso(dt: number, volts: { izq: number; der: number }, params: { izq: MotorParams; der: MotorParams }) {
    this.ruedas.izq.volts = volts.izq
    this.ruedas.der.volts = volts.der
    this.acumulado += Math.min(dt, 0.1)
    while (this.acumulado >= SUBPASO) {
      this.subpaso(SUBPASO, params)
      this.acumulado -= SUBPASO
    }
  }

  private subpaso(dt: number, params: { izq: MotorParams; der: MotorParams }) {
    const body = this.body
    const rot = body.rotation()
    const pos = body.translation()
    // Direcciones del robot proyectadas sobre el piso: el piso solo puede
    // empujar en horizontal. (Si usáramos el "adelante" del chasis, al
    // inclinarse la tracción empujaría hacia arriba y el robot se levantaría.)
    const adelante = horizontal(rotar(rot, { x: 1, y: 0, z: 0 }))
    const lateral = { x: -adelante.z, y: 0, z: adelante.x }
    // Normal aproximada en cada rueda motriz: ~40 % del peso cada una (el resto en la rueda loca).
    const N = 0.4 * this.masa * this.g
    // "Masa efectiva" que cada rueda debe frenar/empujar para anular el deslizamiento en un paso.
    const mEff = this.masa * 0.25

    // Ojo: addForceAtPoint suma fuerza Y torque; hay que borrar los dos cada paso.
    body.resetForces(true)
    body.resetTorques(true)
    for (const lado of ['izq', 'der'] as const) {
      const r = this.ruedas[lado]
      r.omega = motorStep(r.omega, r.volts, dt, params[lado])
      r.angulo += r.omega * dt

      const z = lado === 'izq' ? -this.vias / 2 : this.vias / 2
      const off = rotar(rot, { x: 0, y: -this.radio, z })
      const punto = { x: pos.x + off.x, y: pos.y + off.y, z: pos.z + off.z }
      // Solo hay tracción si la rueda toca el piso.
      if (punto.y > 0.004) continue
      const v = body.velocityAtPoint(punto)
      const vLong = dot(v, adelante)
      const vLat = dot(v, lateral)
      const limite = MU_RUEDA * N
      let fLong = ((r.omega * this.radio - vLong) * mEff) / dt
      let fLat = (-vLat * mEff) / dt
      // Círculo de fricción: la fuerza total no puede superar μ·N.
      const total = Math.hypot(fLong, fLat)
      if (total > limite) { fLong *= limite / total; fLat *= limite / total }
      body.addForceAtPoint(
        { x: adelante.x * fLong + lateral.x * fLat, y: 0, z: adelante.z * fLong + lateral.z * fLat },
        punto,
        true,
      )
    }
    this.world.timestep = dt
    this.world.step()
  }

  /** Posición (en el mundo) de un punto dado en mm en el marco del robot. */
  puntoMundo(mm: [number, number, number]) {
    const p = this.body.translation()
    const o = rotar(this.body.rotation(), { x: mm[0] / 1000, y: mm[1] / 1000, z: mm[2] / 1000 })
    return { x: p.x + o.x, y: p.y + o.y, z: p.z + o.z }
  }

  /**
   * Lanza un rayo hacia abajo desde el sensor (raycast con Rapier) y devuelve
   * el punto del piso que ve, o null si está demasiado alto (robot levantado).
   */
  rayoAlPiso(mm: [number, number, number], alcanceM: number): { x: number; z: number } | null {
    const o = this.puntoMundo(mm)
    const dir = rotar(this.body.rotation(), { x: 0, y: -1, z: 0 })
    const ray = new RAPIER.Ray(o, dir)
    const hit = this.world.castRay(ray, alcanceM, true, undefined, undefined, undefined, this.body)
    if (!hit) return null
    const p = ray.pointAt(hit.timeOfImpact)
    return { x: p.x, z: p.z }
  }

  pose() {
    const p = this.body.translation()
    const q = this.body.rotation()
    const v = this.body.linvel()
    return { pos: p, rot: q, velocidad: Math.hypot(v.x, v.z), yaw: yawDe(q) }
  }

  liberar() { this.world.free() }
}

// ---------- utilidades de vectores/cuaterniones ----------
type V3 = { x: number; y: number; z: number }
type Q = { x: number; y: number; z: number; w: number }

function yawQuat(yaw: number): Q {
  return { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }
}
function yawDe(q: Q): number {
  return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z))
}
function rotar(q: Q, v: V3): V3 {
  // v' = q v q*  (forma optimizada)
  const ix = q.w * v.x + q.y * v.z - q.z * v.y
  const iy = q.w * v.y + q.z * v.x - q.x * v.z
  const iz = q.w * v.z + q.x * v.y - q.y * v.x
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z
  return {
    x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
  }
}
function dot(a: V3, b: V3) { return a.x * b.x + a.y * b.y + a.z * b.z }
function horizontal(v: V3): V3 {
  const l = Math.hypot(v.x, v.z) || 1
  return { x: v.x / l, y: 0, z: v.z / l }
}
