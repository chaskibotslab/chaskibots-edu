import { describe, it, expect, beforeAll } from 'vitest'
import { RobotFisico, iniciarRapier } from '../engine/physics'
import { MOTOR_TT, motorTargetOmega } from '../engine/bridge'
import { SEGUIDOR_LINEA } from '../robots/seguidorLinea'
import { planFromRobot } from '../engine/netlist'

const params = { izq: MOTOR_TT, der: MOTOR_TT }
const correr = (r: RobotFisico, seg: number, volts: { izq: number; der: number }) => {
  for (let t = 0; t < seg; t += 1 / 60) r.paso(1 / 60, volts, params)
}

describe('física del robot (Rapier)', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('la masa sale de sumar los componentes del catálogo', () => {
    const plan = planFromRobot(SEGUIDOR_LINEA)
    expect(plan.masaKg).toBeGreaterThan(0.3)
    expect(plan.masaKg).toBeLessThan(0.5)
  })

  it('con el mismo voltaje en ambos motores avanza recto a ω·R', () => {
    const r = new RobotFisico(SEGUIDOR_LINEA, 0.37, 'tierra', { x: 0, z: 0, yaw: 0 })
    correr(r, 0.3, { izq: 0, der: 0 }) // asentarse en el piso
    correr(r, 2, { izq: 4, der: 4 })
    const p = r.pose()
    const vEsperada = motorTargetOmega(4) * r.radio
    expect(p.velocidad).toBeGreaterThan(vEsperada * 0.85)
    expect(p.velocidad).toBeLessThan(vEsperada * 1.05)
    expect(p.pos.x).toBeGreaterThan(0.5)
    expect(Math.abs(p.pos.z)).toBeLessThan(0.03)
    expect(Math.abs(p.yaw)).toBeLessThan(0.05)
    expect(p.pos.y).toBeGreaterThan(0.02) // no atravesó el piso
    r.liberar()
  })

  it('si el motor derecho va más rápido, gira a la izquierda', () => {
    const r = new RobotFisico(SEGUIDOR_LINEA, 0.37, 'tierra', { x: 0, z: 0, yaw: 0 })
    correr(r, 0.3, { izq: 0, der: 0 })
    correr(r, 0.5, { izq: 1.5, der: 5 })
    expect(r.pose().yaw).toBeGreaterThan(0.3)
    r.liberar()
  })

  it('en gravedad cero las ruedas giran pero el robot no avanza', () => {
    const r = new RobotFisico(SEGUIDOR_LINEA, 0.37, 'cero', { x: 0, z: 0, yaw: 0 })
    correr(r, 1, { izq: 5, der: 5 })
    expect(r.ruedas.izq.omega).toBeGreaterThan(10)
    expect(Math.abs(r.pose().pos.x)).toBeLessThan(0.01)
    r.liberar()
  })

  it('el sensor IR ve el piso con un raycast', () => {
    const r = new RobotFisico(SEGUIDOR_LINEA, 0.37, 'tierra', { x: 0.2, z: -0.1, yaw: 0 })
    correr(r, 0.3, { izq: 0, der: 0 })
    const hit = r.rayoAlPiso([95, -20, -14], 0.025)
    expect(hit).not.toBeNull()
    expect(hit!.x).toBeCloseTo(0.295, 2)
    expect(hit!.z).toBeCloseTo(-0.114, 2)
    r.liberar()
  })
})
