// E2 — basurero inteligente del kit de 9no: la maqueta (tapa movida por el
// servo), la mano frente al sensor ultrasónico y el programa REAL del kit
// (fixtures/fuentes/basurero.ino, compilado para Arduino Nano con arduino-cli).

import { describe, expect, it, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { mesaElectronica } from '../arenas'
import { aRobot, poses } from '../engine/ensamblaje'
import { iniciarRapier } from '../engine/fisica/mundo'
import { planDe } from '../engine/plan'
import { SimSincrona } from '../engine/simSincrona'
import { construirBasurero, construirMideDistancia, PROYECTOS_CIRCUITO } from '../robots/circuitos'
import type { RobotDoc } from '../robots/doc'

const idDe = (doc: RobotDoc, piezaId: string) => doc.piezas.find(p => p.pieza === piezaId)!.id

describe('maqueta del basurero', () => {
  it('con el servo en 0° la tapa cierra la boca del basurero; en 90° queda vertical', () => {
    const doc = construirBasurero()
    const servo = idDe(doc, 'sg90'), tapa = idDe(doc, 'tapa-basurero'), basurero = idDe(doc, 'maqueta-basurero')
    const base = poses(doc).get(basurero)!.pos
    // Punta de la tapa (el borde que se levanta), relativa a la base del basurero.
    const punta = (angulo: number) => aRobot(poses(doc, { [servo]: angulo }).get(tapa)!, [104, 52, 0]).sub(base)
    const cerrada = punta(0)
    expect(cerrada.x).toBeCloseTo(0, 0)
    expect(cerrada.y).toBeCloseTo(113, 0)  // apoyada sobre el borde (110 mm)
    expect(cerrada.z).toBeCloseTo(52, 0)   // llega al borde de adelante
    const abierta = punta(90)
    expect(abierta.y).toBeCloseTo(217, 0)  // apuntando hacia arriba
    expect(abierta.z).toBeCloseTo(-52, 0)  // sobre la bisagra
  })

  it('el sensor del basurero y el servo quedan conectados a los pines del kit', () => {
    const plan = planDe(construirBasurero())
    expect(plan.ultrasonidos[0]).toMatchObject({ trig: 'D9', echo: 'D10' })
    expect(plan.servos[0]).toMatchObject({ sig: 'D6', alimentado: true })
    expect(plan.avisos).toEqual([])
  })

  it('el kit de 9no trae sus 8 proyectos con Arduino Nano', () => {
    const kit = PROYECTOS_CIRCUITO.filter(p => p.kit?.startsWith('Kit 9no'))
    expect(kit.map(p => p.id)).toEqual(['led-tapa', 'mide-distancia', 'mueve-servo', 'basurero', 'contador-personas', 'dispensador', 'puerta-automatica', 'alarma-proximidad'])
    for (const p of kit) expect(p.construir().piezas.find(x => x.id === 'placa')?.pieza, p.id).toBe('arduino-nano')
  })
})

describe('la mano frente al sensor', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el sensor mide la distancia de la mano; sin mano no hay eco', () => {
    const s = new SimSincrona(construirMideDistancia(), mesaElectronica())
    const cm = () => { const l = s.ultimas?.lecturas.find(x => x.tipo === 'ultrasonido'); return l?.tipo === 'ultrasonido' ? l.cm : undefined }
    s.paso(1 / 60)
    expect(cm()).toBeNull()
    s.controles.mano = 12
    s.paso(1 / 60)
    expect(cm()).toBeCloseTo(12, 5)
    s.liberar()
  })
})

describe('basurero del kit de 9no (programa real en el Nano emulado)', () => {
  beforeAll(async () => { await iniciarRapier() })
  const hex = fs.readFileSync(path.join(__dirname, 'fixtures', 'basurero.hex'), 'utf8')

  it('sin mano la tapa se cierra; al acercar la mano se abre, el LED avisa y a los 3 s vuelve a cerrar', () => {
    const doc = construirBasurero()
    const servo = idDe(doc, 'sg90')
    const s = new SimSincrona(doc, mesaElectronica(), { hex })
    const angulo = () => s.robot.servos.get(servo)!.angulo
    const led = () => s.ultimas?.circuito?.leds['led-verde']?.[0] ?? 0

    s.correr(0.6)
    expect(angulo()).toBeLessThan(2)       // tapa.write(ANGULO_CERRADO)
    expect(led()).toBe(0)

    // La mano a 30 cm: más lejos que los 15 cm del kit, no pasa nada.
    s.controles.mano = 30
    s.correr(0.5)
    expect(angulo()).toBeLessThan(2)

    // A 10 cm: la tapa se abre y el LED parpadea tres veces y queda encendido.
    s.controles.mano = 10
    let destellos = 0, antes = false
    s.correr(1, 1 / 120, x => { const on = (x.ultimas?.circuito?.leds['led-verde']?.[0] ?? 0) > 0.5; if (on && !antes) destellos++; antes = on })
    expect(angulo()).toBeGreaterThan(88)
    expect(destellos).toBe(4)               // 3 parpadeos + queda encendido
    expect(led()).toBeGreaterThan(0.9)

    // Se va la mano: tras el parpadeo (0,6 s) y los 3 s abierta, se cierra y el LED se apaga.
    s.controles.mano = null
    s.correr(2.4)
    expect(angulo()).toBeGreaterThan(88)    // todavía abierta
    s.correr(0.9)
    expect(angulo()).toBeLessThan(2)
    expect(led()).toBe(0)
    s.liberar()
  }, 180_000)
})
