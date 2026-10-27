// Física construida desde las piezas (F2): N ruedas, suspensión por rayo,
// fricción por material, servos y sensores con rayos.
import { describe, it, expect, beforeAll } from 'vitest'
import { iniciarRapier, Mundo } from '../engine/fisica/mundo'
import { Reloj, RobotFisico } from '../engine/fisica/robotFisico'
import { MOTOR_TT, motorTargetOmega } from '../engine/bridge'
import { planDe } from '../engine/plan'
import { leerSensores } from '../engine/paso'
import { autocablear } from '../engine/autocableado'
import { encastrar, reemplazar, robotVacio, ruedas } from '../engine/ensamblaje'
import { campoLibre } from '../arenas'
import type { ArenaDef } from '../arenas/tipos'
import type { RobotDoc } from '../robots/doc'
import { construirEvitaObstaculos, construirSeguidor } from '../robots/prearmados'

const piso = (extra: Partial<ArenaDef> = {}): ArenaDef => ({
  id: 'test', nombre: 'test', descripcion: '', ancho: 10, largo: 10,
  piso: { material: 'melamina', color: '#fff', reflectancia: 0.9 }, objetos: [], paredes: false,
  inicio: { x: 0, z: 0, yaw: 0 }, ...extra,
})

function armar(doc: RobotDoc, arena = piso(), gravedad: 'tierra' | 'cero' = 'tierra') {
  const plan = planDe(doc)
  const mundo = new Mundo(arena, gravedad)
  const robot = new RobotFisico(mundo, doc, plan, arena.inicio)
  const reloj = new Reloj()
  const correr = (seg: number, volts: (motor: string, etiqueta: string) => number) => {
    for (let t = 0; t < seg; t += 1 / 60) {
      for (const r of robot.ruedas) r.volts = volts(r.motor, doc.piezas.find(p => p.id === r.motor)!.etiqueta)
      reloj.avanzar(mundo, [robot], 1 / 60)
    }
  }
  return { plan, mundo, robot, correr }
}

function cuatroRuedas(rueda = 'rueda-65') {
  let doc = robotVacio('chasis-4wd', 'acrilico')
  for (const m of ['motor-del-izq', 'motor-tra-izq', 'motor-del-der', 'motor-tra-der']) {
    const r = encastrar(doc, 'motor-tt', 'chasis', m)
    doc = encastrar(r.doc, rueda, r.id, 'eje').doc
  }
  doc = encastrar(doc, 'arduino-uno', 'chasis', 'placa').doc
  doc = encastrar(doc, 'l298n', 'chasis', 'driver').doc
  doc = encastrar(doc, 'bateria-2x18650', 'chasis', 'bateria').doc
  return { ...doc, cables: autocablear(doc).cables }
}

describe('física desde las piezas', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el seguidor se apoya en el piso y su peso se reparte entre ruedas y rueda loca', () => {
    const { robot, correr, mundo } = armar(construirSeguidor())
    correr(0.5, () => 0)
    const p = robot.pose()
    expect(p.pos.y).toBeGreaterThan(0.03)
    expect(p.pos.y).toBeLessThan(0.06)
    const total = robot.ruedas.reduce((s, r) => s + r.normal, 0)
    const peso = robot.masa * 9.81
    expect(total).toBeGreaterThan(peso * 0.4)  // el resto lo lleva la rueda loca
    expect(total).toBeLessThan(peso * 1.05)
    mundo.liberar()
  })

  it('con el mismo voltaje en ambos lados avanza recto a ω·R', () => {
    const { robot, correr, mundo } = armar(construirSeguidor())
    correr(0.3, () => 0)
    correr(2, () => 4)
    const p = robot.pose()
    const vEsperada = motorTargetOmega(4, MOTOR_TT) * 0.033
    expect(p.velocidad).toBeGreaterThan(vEsperada * 0.85)
    expect(p.velocidad).toBeLessThan(vEsperada * 1.05)
    expect(p.pos.x).toBeGreaterThan(0.5)
    expect(Math.abs(p.pos.z)).toBeLessThan(0.03)
    expect(Math.abs(p.yaw)).toBeLessThan(0.05)
    mundo.liberar()
  })

  it('si el lado derecho va más rápido, gira a la izquierda', () => {
    const { robot, correr, mundo } = armar(construirSeguidor())
    correr(0.3, () => 0)
    correr(0.5, (_, e) => (e.includes('izquierdo') ? 1.5 : 5))
    expect(robot.pose().yaw).toBeGreaterThan(0.3)
    mundo.liberar()
  })

  it('en gravedad cero las ruedas giran pero el robot no avanza', () => {
    const { robot, correr, mundo } = armar(construirSeguidor(), piso(), 'cero')
    correr(1, () => 5)
    expect(robot.ruedas[0].omega).toBeGreaterThan(10)
    expect(Math.abs(robot.pose().pos.x)).toBeLessThan(0.01)
    mundo.liberar()
  })

  it('un 4WD avanza recto y gira derrapando', () => {
    const { robot, correr, mundo } = armar(cuatroRuedas())
    correr(0.3, () => 0)
    correr(1.5, () => 5)
    const p = robot.pose()
    expect(p.pos.x).toBeGreaterThan(0.4)
    expect(Math.abs(p.yaw)).toBeLessThan(0.05)
    correr(0.8, (_, e) => (e.includes('izquierdo') ? -5 : 5))
    expect(Math.abs(robot.pose().yaw)).toBeGreaterThan(0.5)
    mundo.liberar()
  })

  it('las ruedas de goma aceleran más que las de plástico', () => {
    const avance = (rueda: string) => {
      let doc = construirSeguidor()
      for (const r of ruedas(doc)) doc = reemplazar(doc, r.instancia, rueda).doc
      const { robot, correr, mundo } = armar(doc)
      correr(0.3, () => 0)
      correr(0.15, () => 7.4)
      const x = robot.pose().pos.x
      mundo.liberar()
      return x
    }
    const goma = avance('rueda-65'), plastico = avance('rueda-65-plastico')
    expect(goma).toBeGreaterThan(plastico * 1.15)
  })

  it('el servo SG90 llega a 180° en menos de 0,3 s', () => {
    const { robot, correr, mundo } = armar(construirEvitaObstaculos())
    const servo = Array.from(robot.servos.values())[0]
    servo.objetivo = 180
    correr(0.2, () => 0)
    expect(servo.angulo).toBeCloseTo(180, 0)
    mundo.liberar()
  })

  it('el ultrasonido mide la distancia a una caja y sigue al servo', () => {
    const arena = piso({
      objetos: [{ id: 'caja', forma: 'caja', medidas: [0.1, 0.2, 0.4], x: 0.6, z: 0, color: '#f00', material: 'mdf' }],
    })
    const doc = construirEvitaObstaculos()
    const { robot, correr, mundo, plan } = armar(doc, arena)
    correr(0.3, () => 0)
    const lectura = () => leerSensores(plan, doc, robot, () => 0.9).lecturas.find(l => l.tipo === 'ultrasonido')!
    const l = lectura()
    expect(l.tipo === 'ultrasonido' && l.cm).toBeGreaterThan(30)
    expect(l.tipo === 'ultrasonido' && l.cm).toBeLessThan(55)
    // Mirando a un costado no ve la caja.
    Array.from(robot.servos.values())[0].angulo = 180
    const lado = lectura()
    expect(lado.tipo === 'ultrasonido' && (lado.cm === null || lado.cm > 100)).toBe(true)
    mundo.liberar()
  })

  it('el campo libre deja libre la zona de salida', () => {
    const a = campoLibre(7)
    expect(a.objetos.length).toBeGreaterThan(4)
    for (const o of a.objetos) expect(Math.hypot(o.x - a.inicio.x, o.z - a.inicio.z)).toBeGreaterThan(0.5)
    expect(campoLibre(7)).toEqual(a) // misma semilla, mismo campo
  })
})
