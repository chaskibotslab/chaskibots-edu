// Entorno 3D (bloque A): aspectos de los objetos, decoración y texturas procedurales.

import { describe, expect, it } from 'vitest'
import { aspectoDe, listaArenas } from '../arenas'
import type { AspectoObjeto } from '../arenas/tipos'
import { claveTextura, MOSAICO_M, repeticion, texturaBase } from '../ui/entorno/texturas'

const ASPECTOS: AspectoObjeto[] = ['carton', 'pared-mdf', 'barrera', 'sofa', 'mueble', 'maceta', 'pata-madera', 'pata-metal']

describe('aspecto de los objetos de las arenas', () => {
  it('todas las arenas usan aspectos conocidos y decoración válida', () => {
    for (const a of listaArenas()) {
      for (const o of a.objetos) if (o.aspecto) expect(ASPECTOS).toContain(o.aspecto)
      for (const d of a.decoracion ?? []) {
        expect(['madera', 'tela', 'liso', 'metal']).toContain(d.aspecto)
        expect(d.medidas.every(v => v > 0)).toBe(true)
      }
    }
  })

  it('sin aspecto, se dibuja la forma lisa', () => {
    expect(aspectoDe({ id: 'x', forma: 'caja', medidas: [1, 1, 1], x: 0, z: 0, color: '#fff', material: 'mdf' })).toBe('caja')
    expect(aspectoDe({ id: 'x', forma: 'cilindro', medidas: [1, 1, 1], x: 0, z: 0, color: '#fff', material: 'mdf' })).toBe('cilindro')
    expect(aspectoDe({ id: 'x', forma: 'caja', medidas: [1, 1, 1], x: 0, z: 0, color: '#fff', material: 'mdf', aspecto: 'carton' })).toBe('carton')
  })

  it('el campo libre tiene cajas de cartón, el laberinto paredes de MDF y la sala muebles reales', () => {
    const arenas = listaArenas()
    const campo = arenas.find(a => a.id === 'campo-libre')!
    expect(campo.objetos.length).toBeGreaterThan(0)
    expect(campo.objetos.every(o => o.aspecto === 'carton')).toBe(true)
    const lab = arenas.find(a => a.id === 'laberinto')!
    expect(lab.objetos.every(o => o.aspecto === 'pared-mdf')).toBe(true)
    const sala = arenas.find(a => a.id === 'sala')!
    expect(sala.objetos.map(o => o.aspecto)).toEqual(expect.arrayContaining(['sofa', 'mueble', 'maceta', 'pata-madera', 'pata-metal']))
    expect(sala.piso.aspecto).toBe('madera')
    expect(sala.decoracion?.length).toBeGreaterThan(0)
    // La decoración está por encima del robot (no estorba) y dentro de la sala.
    for (const d of sala.decoracion!) {
      expect(d.y).toBeGreaterThanOrEqual(0.3)
      expect(Math.abs(d.x)).toBeLessThan(sala.ancho / 2)
      expect(Math.abs(d.z)).toBeLessThan(sala.largo / 2 + 0.1)
    }
  })

  it('los objetos siguen dentro de sus colisionadores (la física no cambia)', () => {
    const sala = listaArenas().find(a => a.id === 'sala')!
    const sofa = sala.objetos.find(o => o.id === 'sofa')!
    expect(sofa.medidas).toEqual([0.9, 0.35, 0.35])
    expect(sofa.forma).toBe('caja')
  })
})

describe('texturas procedurales', () => {
  it('la repetición sale de los metros por mosaico', () => {
    const cerca = (r: [number, number], e: [number, number]) => { expect(r[0]).toBeCloseTo(e[0], 9); expect(r[1]).toBeCloseTo(e[1], 9) }
    cerca(repeticion('tapete', 0.9, 0.6), [9, 6])
    cerca(repeticion('melamina', 3, 2), [6, 4])
    cerca(repeticion('acero', 0.3, 0.3), [1, 1])
    for (const v of Object.values(MOSAICO_M)) expect(v).toBeGreaterThan(0)
  })

  it('las claves de caché son estables e incluyen el color', () => {
    expect(claveTextura('madera', 1024, '#abc')).toBe('madera:1024:#abc')
    expect(claveTextura('aula', 512)).toBe('aula:512:')
  })

  it('sin canvas 2D devuelven null (y el material cae al color liso)', () => {
    // En jsdom no hay contexto 2D; en un navegador real sí. Nunca debe lanzar.
    const t = texturaBase('melamina', 64, '#ffffff')
    expect(t === null || typeof t.map === 'object').toBe(true)
  })
})
