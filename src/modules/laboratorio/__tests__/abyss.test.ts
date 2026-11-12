// «Abyss»: robot de combate con modelo real (carrocería, ruedas y tambor propios).
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
import { construirAbyss, construirWarbot } from '../robots/prearmados'

const fixture = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')

describe('Abyss', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('cumple el reglamento, nada encimado, y se cablea igual que el robot de tambor', () => {
    const d = construirAbyss()
    const r = resumen(d)
    const reglas = revisarReglamento(arenaCombate().competencia!, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
    expect(reglas.every(x => x.ok)).toBe(true)
    expect(r.masa_g).toBeLessThan(1500)
    expect(encimadas(d)).toEqual([])
    expect(verificar(d).filter(p => p.nivel === 'error')).toEqual([])
    const [arma] = planDe(d).armas
    expect(arma.alimentado).toBe(true)
    expect(arma.vertical).toBe(true)
    // El mismo programa (y el mismo .hex de prueba) que el robot de tambor.
    expect(d.programa.cpp).toBe(construirWarbot('tambor').programa.cpp)
  })

  it('avanza derecho, gira en el lugar y enciende el tambor', () => {
    const sim = new SimSincrona(construirAbyss(), arenaCombate(), { hex: fixture('warbottambor.hex'), rival: 'quieto' })
    sim.correr(3.5)                                   // pasa la cuenta
    const p0 = sim.robot.pose()
    sim.avr!.serialWrite('9F')
    sim.correr(1)
    const p1 = sim.robot.pose()
    const avance = Math.hypot(p1.pos.x - p0.pos.x, p1.pos.z - p0.pos.z)
    expect(avance).toBeGreaterThan(0.25)
    expect(Math.abs(p1.yaw - p0.yaw)).toBeLessThan(0.25)
    sim.avr!.serialWrite('L')
    sim.correr(1)
    const p2 = sim.robot.pose()
    expect(Math.abs(Math.atan2(Math.sin(p2.yaw - p1.yaw), Math.cos(p2.yaw - p1.yaw)))).toBeGreaterThan(0.6)
    sim.avr!.serialWrite('SX')
    sim.correr(3)
    const arma = sim.robot.armas[0]
    expect(arma.omega).toBeGreaterThan(0.9 * arma.omegaMax)
    // Sigue de pie sobre sus ruedas y sus púas.
    expect(sim.robot.pose().pos.y).toBeLessThan(0.08)
    sim.liberar()
  }, 300_000)

  it('combate RC: golpea al rival y lo levanta', () => {
    const sim = new SimSincrona(construirAbyss(), arenaCombate(), { hex: fixture('warbottambor.hex'), rival: 'empujador' })
    const c = sim.competencia!
    let altura = 0, ultima = '', trabado = 0, atras = 0
    for (let t = 0; t < 120 && c.estado.fase !== 'final'; t += 1 / 60) {
      sim.paso(1 / 60)
      altura = Math.max(altura, c.rival.fisica.pose().pos.y)
      if (c.estado.fase !== 'combate') { ultima = ''; continue }
      const p = sim.robot.pose(), r = c.rival.fisica.pose().pos
      trabado = p.velocidad < 0.05 ? trabado + 1 / 60 : 0
      if (trabado > 0.7) { atras = 0.6; trabado = 0 }
      let letra: string
      if (atras > 0) { atras -= 1 / 60; letra = 'B' } else {
        const rumbo = Math.atan2(-(r.z - p.pos.z), r.x - p.pos.x)
        const error = Math.atan2(Math.sin(rumbo - p.yaw), Math.cos(rumbo - p.yaw))
        letra = error > 0.3 ? 'L' : error < -0.3 ? 'R' : 'F'
      }
      if (letra !== ultima) { sim.avr!.serialWrite((ultima ? '' : '9X') + letra); ultima = letra }
    }
    expect(c.estado.vida!.rival).toBeLessThan(85)
    expect(altura).toBeGreaterThan(0.12)
    sim.liberar()
  }, 600_000)
})
