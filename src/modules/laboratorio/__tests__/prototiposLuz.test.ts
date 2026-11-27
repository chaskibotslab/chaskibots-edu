// Lazo cerrado de los prototipos de luz y seguimiento, cada uno con su programa
// REAL (fixtures/fuentes/*.ino compilados con arduino-cli) en su arena: el
// test mueve la linterna o la caja como lo haría el alumno con el mouse.
import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { iniciarRapier } from '../engine/fisica/mundo'
import { nivelDeLuz } from '../engine/paso'
import { SimSincrona } from '../engine/simSincrona'
import { arena } from '../arenas'
import { PREARMADOS } from '../robots/prearmados'

const fx = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')

function preparar(id: string, hex: string) {
  const pre = PREARMADOS.find(p => p.id === id)!
  return new SimSincrona(pre.construir(), arena(pre.arena), { hex: fx(hex) })
}

/** Distancia (m) del centro del robot a la linterna o la caja. */
const aSenuelo = (sim: SimSincrona) => { const p = sim.robot.pose().pos; return Math.hypot(p.x - sim.senuelo!.x, p.z - sim.senuelo!.z) }

/** ¿El robot toca de costado algo (caja o pared)? El piso no cuenta. */
function choca(sim: SimSincrona) {
  const w = sim.mundo.world, b = sim.robot.body
  let toca = false
  for (let i = 0; i < b.numColliders(); i++) {
    w.contactPairsWith(b.collider(i), otro => {
      w.contactPair(b.collider(i), otro, m => { if (m.numContacts() > 0 && Math.abs(m.normal().y) < 0.7) toca = true })
    })
  }
  return toca
}

describe('sensor de luz', () => {
  const libre = () => false
  const o = { x: 0, y: 0.05, z: 0 }, frente = { x: 1, y: 0, z: 0 }

  it('lee más cuanto más cerca está la linterna, y casi nada sin ella', () => {
    const lejos = nivelDeLuz(o, frente, { x: 2, y: 0.05, z: 0 }, libre)
    const cerca = nivelDeLuz(o, frente, { x: 0.3, y: 0.05, z: 0 }, libre)
    const sin = nivelDeLuz(o, frente, null, libre)
    expect(cerca).toBeGreaterThan(lejos * 3)
    expect(lejos).toBeGreaterThan(sin)
    expect(sin).toBeLessThan(0.1)
  })

  it('lee más de frente que de costado, y de costado más que de espaldas', () => {
    const f = nivelDeLuz(o, frente, { x: 1, y: 0.05, z: 0 }, libre)
    const c = nivelDeLuz(o, frente, { x: 0, y: 0.05, z: 1 }, libre)
    const e = nivelDeLuz(o, frente, { x: -1, y: 0.05, z: 0 }, libre)
    expect(f).toBeGreaterThan(c * 1.5)
    expect(c).toBeGreaterThan(e)
  })

  it('a la sombra (algo tapa la linterna) queda la luz del aula', () => {
    expect(nivelDeLuz(o, frente, { x: 1, y: 0.05, z: 0 }, () => true)).toBe(nivelDeLuz(o, frente, null, libre))
  })
})

describe('prototipos de luz y seguimiento con su programa real', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('«Seguidor de luz»: llega a la linterna y la vuelve a buscar cuando se la mueven', () => {
    const sim = preparar('sigue-luz', 'sigueluz.hex')
    const antes = aSenuelo(sim)
    sim.correr(12, 1 / 60)
    expect(aSenuelo(sim)).toBeLessThan(0.55)
    expect(sim.robot.pose().velocidad).toBeLessThan(0.02)   // llegó y se detuvo
    // La linterna se va al otro lado de la sala, detrás del robot.
    sim.moverSenuelo(-0.8, 0.7)
    expect(aSenuelo(sim)).toBeGreaterThan(1)
    sim.correr(15, 1 / 60)
    expect(aSenuelo(sim)).toBeLessThan(0.55)
    sim.liberar()
  }, 300_000)

  it('«Huye de la luz»: con la linterna adelante escapa, y de espaldas a ella se queda quieto', () => {
    const sim = preparar('huye-luz', 'huyeluz.hex')
    const p0 = sim.robot.pose().pos
    sim.moverSenuelo(p0.x + 0.4, p0.z + 0.1)
    sim.correr(6, 1 / 60)
    expect(aSenuelo(sim)).toBeGreaterThan(0.7)
    expect(sim.serial).toContain('Me escapo')
    // Ya le da la espalda: no ve la luz y se queda quieto.
    const p1 = sim.robot.pose().pos
    sim.correr(3, 1 / 60)
    expect(Math.hypot(sim.robot.pose().pos.x - p1.x, sim.robot.pose().pos.z - p1.z)).toBeLessThan(0.05)
    sim.liberar()
  }, 300_000)

  it('«Sígueme»: alcanza la caja, se detiene sin tocarla, la sigue y retrocede si se le acerca', () => {
    const sim = preparar('sigueme', 'sigueme.hex')
    let choques = 0
    const paso = (s: SimSincrona) => { if (choca(s)) choques++ }
    sim.correr(5, 1 / 60, paso)
    const x1 = sim.robot.pose().pos.x
    expect(x1).toBeGreaterThan(-1.05)                       // avanzó
    expect(sim.robot.pose().velocidad).toBeLessThan(0.02)   // y se quedó a la distancia justa
    // La caja se aleja de a poco, 60 cm.
    for (let i = 0; i < 60; i++) { sim.moverSenuelo(sim.senuelo!.x + 0.01, 0); sim.correr(0.1, 1 / 60, paso) }
    sim.correr(3, 1 / 60, paso)
    const x2 = sim.robot.pose().pos.x
    expect(x2).toBeGreaterThan(x1 + 0.45)
    // La caja se le acerca 25 cm: retrocede.
    for (let i = 0; i < 25; i++) { sim.moverSenuelo(sim.senuelo!.x - 0.01, 0); sim.correr(0.1, 1 / 60, paso) }
    sim.correr(3, 1 / 60, paso)
    const x3 = sim.robot.pose().pos.x
    expect(x3).toBeLessThan(x2 - 0.15)
    expect(choques).toBe(0)
    sim.liberar()
  }, 300_000)

  it('«Sigue paredes»: da la vuelta a la sala pegado a la pared, sin chocar', () => {
    const sim = preparar('sigue-pared', 'siguepared.hex')
    let choques = 0, recorrido = 0, prev = sim.robot.pose().pos
    const cuadrantes = new Set<string>()
    sim.correr(45, 1 / 60, s => {
      const p = s.robot.pose().pos
      if (choca(s)) choques++
      recorrido += Math.hypot(p.x - prev.x, p.z - prev.z)
      prev = p
      cuadrantes.add(`${p.x > 0 ? 'E' : 'O'}${p.z > 0 ? 'S' : 'N'}`)
    })
    expect(recorrido).toBeGreaterThan(10)        // dos vueltas a la sala
    expect(cuadrantes.size).toBe(4)
    expect(choques).toBe(0)
    sim.liberar()
  }, 600_000)
})
