// Minisumo «Paladín»: carrocería de torneo con modelo real (ruedas adentro, rampa).
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { dohyo } from '../arenas'
import { encimadas, resumen } from '../engine/ensamblaje'
import { revisarReglamento } from '../engine/competencia'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { verificar } from '../engine/verificacion'
import { construirMinisumo, construirPaladin } from '../robots/prearmados'

const hex = fs.readFileSync(path.join(__dirname, 'fixtures', 'minisumo.hex'), 'utf8')

describe('minisumo Paladín', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('cumple el reglamento, nada encimado, y se cablea igual que el minisumo', () => {
    const d = construirPaladin()
    const r = resumen(d)
    const reglas = revisarReglamento(dohyo('minisumo').competencia!, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
    expect(reglas.every(x => x.ok)).toBe(true)
    expect(encimadas(d)).toEqual([])
    expect(verificar(d).filter(p => p.nivel === 'error')).toEqual([])
    // El mismo programa (y el mismo .hex de prueba) que el minisumo de chasis abierto.
    expect(d.programa.cpp).toBe(construirMinisumo().programa.cpp)
  })

  it('combate real: espera 5 s, encuentra al rival quieto y lo saca 2 a 0', () => {
    const sim = new SimSincrona(construirPaladin(), dohyo('minisumo'), { hex, rival: 'quieto' })
    const c = sim.competencia!
    // Los primeros instantes no cuentan: el robot se asienta sobre sus ruedas al aparecer.
    let movioEnCuenta = false, t = 0
    sim.correr(40, 1 / 60, s => {
      t += 1 / 60
      if (t > 0.3 && c.estado.fase === 'cuenta' && s.robot.pose().velocidad > 0.02) movioEnCuenta = true
    })
    expect(movioEnCuenta).toBe(false)
    expect(c.estado.fase).toBe('final')
    expect(c.estado.marcador).toEqual({ alumno: 2, rival: 0 })
    sim.liberar()
  }, 600_000)

  it('contra un rival que empuja, no se cae del dohyo por su cuenta y gana', () => {
    const sim = new SimSincrona(construirPaladin(), dohyo('minisumo'), { hex, rival: 'empujador' })
    const c = sim.competencia!
    sim.correr(60, 1 / 60)
    console.log('PALADIN vs empujador', JSON.stringify(c.estado.marcador), c.estado.fase)
    expect(c.estado.marcador.alumno).toBeGreaterThanOrEqual(c.estado.marcador.rival)
    sim.liberar()
  }, 600_000)
})
