// Robots de combate (beetle): armado, arma con su ESC y combates reales en la arena.
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
import { construirWarbot } from '../robots/prearmados'

const fixture = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')

/**
 * Piloto como el alumno: enciende el arma, apunta al rival y avanza; si queda
 * trabado retrocede un momento y vuelve a atacar. Manda las letras solo cuando cambian.
 */
function piloto(sim: SimSincrona) {
  const c = sim.competencia!
  let ultima = '', trabado = 0, atras = 0
  return (s: SimSincrona) => {
    if (c.estado.fase !== 'combate') { ultima = ''; return }
    const p = s.robot.pose(), r = c.rival.fisica.pose().pos
    trabado = p.velocidad < 0.05 ? trabado + 1 / 60 : 0
    if (trabado > 0.7) { atras = 0.6; trabado = 0 }
    let letra: string
    if (atras > 0) { atras -= 1 / 60; letra = 'B' } else {
      const rumbo = Math.atan2(-(r.z - p.pos.z), r.x - p.pos.x)
      const error = Math.atan2(Math.sin(rumbo - p.yaw), Math.cos(rumbo - p.yaw))
      letra = error > 0.3 ? 'L' : error < -0.3 ? 'R' : 'F'
    }
    if (letra !== ultima) { s.avr!.serialWrite((ultima ? '' : '9X') + letra); ultima = letra }
  }
}

describe('robots de combate', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('cumplen el reglamento, nada encimado y el ESC queda cableado a la batería y a un PWM', () => {
    for (const d of [construirWarbot('tambor'), construirWarbot('disco'), construirWarbot('tambor', 'uhmw', 'A', true)]) {
      const r = resumen(d)
      const reglas = revisarReglamento(arenaCombate().competencia!, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
      expect(reglas.every(x => x.ok), d.nombre).toBe(true)
      expect(encimadas(d), d.nombre).toEqual([])
      expect(verificar(d).filter(p => p.nivel === 'error'), d.nombre).toEqual([])
      const [arma] = planDe(d).armas
      expect(arma.alimentado).toBe(true)
      expect(arma.sig).toBe('D3')
      expect(arma.vertical).toBe(true)
    }
  })

  it('X enciende el tambor (≈ 7000 rpm en 3 s) e Y lo apaga', () => {
    const sim = new SimSincrona(construirWarbot('tambor'), arenaCombate(), { hex: fixture('warbottambor.hex') })
    sim.correr(0.3)
    sim.avr!.serialWrite('X')
    sim.correr(3)
    const arma = sim.robot.armas[0]
    expect(arma.omega).toBeGreaterThan(0.9 * arma.omegaMax)
    sim.avr!.serialWrite('Y')
    sim.correr(3.5)
    expect(arma.omega).toBeLessThan(0.1 * arma.omegaMax)
    sim.liberar()
  }, 300_000)

  for (const arma of ['tambor', 'disco'] as const) {
    it(`combate RC con ${arma}: golpea, lanza al rival por el aire y gana`, () => {
      const sim = new SimSincrona(construirWarbot(arma), arenaCombate(), { hex: fixture('warbottambor.hex'), rival: 'empujador' })
      const c = sim.competencia!
      let altura = 0
      const pilotar = piloto(sim)
      for (let t = 0; t < 120 && c.estado.fase !== 'final'; t += 1 / 60) {
        sim.paso(1 / 60); pilotar(sim)
        altura = Math.max(altura, c.rival.fisica.pose().pos.y)
      }
      expect(c.estado.vida!.rival).toBeLessThan(85)             // al menos un golpe fuerte
      expect(altura).toBeGreaterThan(0.15)                      // el arma de pie lo levanta
      expect(c.estado.vida!.alumno).toBe(100)                   // el empujador no tiene arma encendida
      sim.liberar()
    }, 600_000)
  }

  it('el robot que cae al pozo queda KO', () => {
    const sim = new SimSincrona(construirWarbot('tambor'), arenaCombate(), { hex: fixture('warbottambor.hex'), rival: 'quieto' })
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
    const sim = new SimSincrona(construirWarbot('tambor', 'uhmw', 'A', true), arenaCombate(), { hex: fixture('warbotauto.hex'), rival: 'quieto' })
    const c = sim.competencia!
    sim.correr(45)
    expect(sim.serial).toContain('Ataque')
    expect(c.estado.vida!.rival).toBeLessThan(100)
    sim.liberar()
  }, 600_000)
})
