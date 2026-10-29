// F5 · Competencias: reglamento, juez y un combate real de minisumo (el
// programa del prearmado compilado con arduino-cli contra el rival de práctica).
import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { iniciarRapier, Mundo } from '../engine/fisica/mundo'
import { RobotFisico } from '../engine/fisica/robotFisico'
import { SimSincrona } from '../engine/simSincrona'
import { Competencia, revisarReglamento } from '../engine/competencia'
import { planDe } from '../engine/plan'
import { resumen } from '../engine/ensamblaje'
import { verificar } from '../engine/verificacion'
import { dohyo, reflectanciaArena } from '../arenas'
import { construirMinisumo, construirMinisumoEsp32 } from '../robots/prearmados'

const hex = fs.readFileSync(path.join(__dirname, 'fixtures', 'minisumo.hex'), 'utf8')

/** Un combate armado a mano (sin micro): para probar al juez solo. */
function combateManual() {
  const arena = dohyo('minisumo')
  const mundo = new Mundo(arena, 'tierra')
  const doc = construirMinisumo()
  const alumno = new RobotFisico(mundo, doc, planDe(doc), arena.inicio)
  const c = new Competencia(mundo, arena, alumno, construirMinisumo('pla-rojo', 'Rival'), 'quieto', reflectanciaArena(arena))
  c.empezar()
  return { c, alumno, mundo }
}

describe('competencias (F5)', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el minisumo prearmado cumple el reglamento y está bien cableado', () => {
    const doc = construirMinisumo()
    const r = resumen(doc)
    const reglas = revisarReglamento(dohyo('minisumo').competencia!, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
    expect(reglas.every(x => x.ok)).toBe(true)
    expect(verificar(doc).filter(p => p.nivel === 'error')).toEqual([])
    expect(planDe(doc).avisos).toEqual([])
  })

  it('el dohyo: negro adentro, borde blanco y, fuera de la plataforma, el piso del aula', () => {
    const refl = reflectanciaArena(dohyo('minisumo'))
    expect(refl(0, 0)).toBeLessThan(0.2)
    expect(refl(0.375, 0)).toBeGreaterThan(0.8)
    expect(refl(0.5, 0)).toBeLessThan(0.5)
  })

  it('juez: moverse durante los 5 s de espera es salida en falso', () => {
    const { c, alumno, mundo } = combateManual()
    expect(c.estado.fase).toBe('cuenta')
    alumno.colocar({ x: -0.05, z: 0, yaw: 0 })   // se movió 8 cm
    c.despues(1 / 60)
    expect(c.estado.marcador).toEqual({ alumno: 0, rival: 1 })
    expect(c.estado.ultima?.motivo).toMatch(/salida en falso/i)
    mundo.liberar()
  })

  it('juez: sacar al rival da el punto; a 2 puntos termina el combate', () => {
    const { c, mundo } = combateManual()
    for (let ronda = 1; ronda <= 2; ronda++) {
      // Pasan los 5 s de espera…
      for (let t = 0; t < 5.1; t += 0.1) c.despues(0.1)
      expect(c.estado.fase).toBe('combate')
      // …y el rival aparece fuera del dohyo.
      c.rival.fisica.colocar({ x: 0.6, z: 0, yaw: 0 })
      c.despues(0.1)
      expect(c.estado.marcador.alumno).toBe(ronda)
      if (ronda === 1) {
        expect(c.estado.fase).toBe('pausa')
        let evento = null
        for (let t = 0; t < 3.2 && !evento; t += 0.1) evento = c.despues(0.1)
        expect(evento).toBe('nueva-ronda')
        expect(c.estado.ronda).toBe(2)
        expect(c.estado.salida).toBe('De costado')
      }
    }
    expect(c.estado.fase).toBe('final')
    expect(c.estado.ganador).toBe('alumno')
    mundo.liberar()
  })

  it('combate real: el minisumo espera 5 s, encuentra al rival quieto y lo saca 2 a 0', () => {
    const sim = new SimSincrona(construirMinisumo(), dohyo('minisumo'), { hex, rival: 'quieto' })
    const c = sim.competencia!
    let movioEnCuenta = false
    sim.correr(40, 1 / 60, s => {
      if (c.estado.fase === 'cuenta' && s.robot.pose().velocidad > 0.02) movioEnCuenta = true
    })
    expect(movioEnCuenta).toBe(false)              // respeta la espera del reglamento
    expect(c.estado.fase).toBe('final')
    expect(c.estado.marcador).toEqual({ alumno: 2, rival: 0 })
    expect(sim.serial).toContain('A pelear')
    sim.liberar()
  }, 600_000)

  it('el minisumo ESP32 de dos pisos cumple el reglamento y gana al rival quieto', () => {
    const doc = construirMinisumoEsp32()
    const r = resumen(doc)
    const reglas = revisarReglamento(dohyo('minisumo').competencia!, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
    expect(reglas.every(x => x.ok)).toBe(true)
    expect(verificar(doc).filter(p => p.nivel === 'error')).toEqual([])
    expect(planDe(doc).avisos).toEqual([])
    const hexEsp32 = fs.readFileSync(path.join(__dirname, 'fixtures', 'minisumoesp32.hex'), 'utf8')
    const sim = new SimSincrona(doc, dohyo('minisumo'), { hex: hexEsp32, rival: 'quieto' })
    const c = sim.competencia!
    sim.correr(40)
    expect(sim.avr?.chip).toBe('atmega2560')
    expect(c.estado.marcador.alumno).toBeGreaterThan(c.estado.marcador.rival)
    sim.liberar()
  }, 600_000)
})
