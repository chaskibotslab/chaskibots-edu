// Battlebots: armado, arma giratoria con su ESC y combates reales en la arena.
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { arenaCombate } from '../arenas'
import { encimadas, resumen } from '../engine/ensamblaje'
import { revisarReglamento } from '../engine/competencia'
import { iniciarRapier } from '../engine/fisica/mundo'
import { planDe } from '../engine/plan'
import { SimSincrona } from '../engine/simSincrona'
import { verificar } from '../engine/verificacion'
import { construirBattlebot } from '../robots/prearmados'

const fixture = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')

/** Piloto como el alumno: apunta al rival y avanza; manda las letras solo cuando cambian. */
function piloto(sim: SimSincrona, conArma: boolean) {
  const c = sim.competencia!
  let ultima = ''
  return (s: SimSincrona) => {
    if (c.estado.fase === 'cuenta') { ultima = ''; return }
    if (c.estado.fase !== 'combate') return
    const p = s.robot.pose(), r = c.rival.fisica.pose().pos
    const rumbo = Math.atan2(-(r.z - p.pos.z), r.x - p.pos.x)
    const error = Math.atan2(Math.sin(rumbo - p.yaw), Math.cos(rumbo - p.yaw))
    const letra = error > 0.3 ? 'L' : error < -0.3 ? 'R' : 'F'
    if (letra !== ultima) { s.avr!.serialWrite((ultima ? '' : `9${conArma ? 'X' : ''}`) + letra); ultima = letra }
  }
}

describe('battlebot', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('cumple el reglamento, nada encimado y el ESC queda cableado a la batería y a un PWM', () => {
    for (const d of [construirBattlebot(), construirBattlebot('pla', 'A', true)]) {
      const r = resumen(d)
      const reglas = revisarReglamento(arenaCombate().competencia!, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
      expect(reglas.every(x => x.ok)).toBe(true)
      expect(encimadas(d)).toEqual([])
      expect(verificar(d).filter(p => p.nivel === 'error')).toEqual([])
      const [arma] = planDe(d).armas
      expect(arma.alimentado).toBe(true)
      expect(arma.sig).toBe('D3')
    }
  })

  it('X enciende el arma (≈ 6000 rpm en 2 s) e Y la apaga', () => {
    const sim = new SimSincrona(construirBattlebot(), arenaCombate(), { hex: fixture('battlebotrc.hex') })
    sim.correr(0.3)
    sim.avr!.serialWrite('X')
    sim.correr(2.5)
    const arma = sim.robot.armas[0]
    expect(arma.omega).toBeGreaterThan(0.8 * arma.omegaMax)
    sim.avr!.serialWrite('Y')
    sim.correr(3)
    expect(arma.omega).toBeLessThan(0.15 * arma.omegaMax)
    sim.liberar()
  }, 300_000)

  it('combate RC: con el arma a fondo le gana al empujador', () => {
    const sim = new SimSincrona(construirBattlebot(), arenaCombate(), { hex: fixture('battlebotrc.hex'), rival: 'empujador' })
    const c = sim.competencia!
    sim.correr(60, 1 / 60, piloto(sim, true))
    expect(c.estado.vida!.rival).toBeLessThan(100)            // lo golpeó
    expect(c.estado.vida!.alumno).toBe(100)                   // el empujador no tiene arma encendida
    expect(c.estado.marcador.alumno).toBe(1)
    expect(c.estado.fase).toBe('final')
    sim.liberar()
  }, 600_000)

  it('el robot que cae al pozo queda KO', () => {
    const sim = new SimSincrona(construirBattlebot(), arenaCombate(), { hex: fixture('battlebotrc.hex'), rival: 'quieto' })
    const c = sim.competencia!
    sim.correr(3.5)                                           // pasa la cuenta
    expect(c.estado.fase).toBe('combate')
    const { x, z } = arenaCombate().pozo!
    c.rival.colocar({ x, z, yaw: 0 })                         // el rival, justo sobre el pozo
    sim.correr(2)
    expect(c.estado.fase).toBe('final')
    expect(c.estado.ultima?.motivo).toMatch(/pozo/)
    expect(c.estado.ganador).toBe('alumno')
    sim.liberar()
  }, 300_000)

  it('autónomo: busca con el ultrasonido y golpea al rival', () => {
    const sim = new SimSincrona(construirBattlebot('pla', 'A', true), arenaCombate(), { hex: fixture('battlebotauto.hex'), rival: 'quieto' })
    const c = sim.competencia!
    sim.correr(45)
    expect(sim.serial).toContain('Ataque')
    expect(c.estado.vida!.rival).toBeLessThan(100)
    sim.liberar()
  }, 600_000)
})
