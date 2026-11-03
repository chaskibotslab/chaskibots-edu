// Proyectos de los pasos C1–C3 y clasificación de la galería. Los .hex salen de
// compilar fixtures/fuentes con arduino-cli.
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { mesaElectronica } from '../arenas'
import { encimadas } from '../engine/ensamblaje'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { verificar } from '../engine/verificacion'
import { GRUPOS, grupoDe } from '../robots/clasificacion'
import { PREARMADOS } from '../robots/prearmados'
import { PROYECTOS_AULAS } from '../robots/proyectosAulas'

const hex = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', `${n}.hex`), 'utf8')

describe('clasificación de la galería', () => {
  it('cada proyecto está en un grupo de su sección', () => {
    for (const p of PREARMADOS) expect(grupoDe(p.id), p.id).not.toBeNull()
    expect(GRUPOS.length).toBe(9)
  })
})

describe('proyectos por tema', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('se arman sin errores ni piezas encimadas', () => {
    for (const p of PROYECTOS_AULAS) {
      const d = p.construir()
      expect(verificar(d).filter(x => x.nivel === 'error'), p.id).toEqual([])
      expect(encimadas(d), p.id).toEqual([])
    }
  })

  const leds = (s: SimSincrona) => s.ultimas!.circuito!.leds

  it('semáforo con botón: sigue en verde hasta que un peatón presiona', () => {
    const doc = PROYECTOS_AULAS.find(p => p.id === 'semaforo-peatones')!.construir()
    const s = new SimSincrona(doc, mesaElectronica(), { hex: hex('semaforopeatones') })
    const id = (pin: string) => doc.cables.find(c => c.a[0] === 'placa' && c.a[1] === pin)!.de[0]
    const pulsador = doc.piezas.find(p => p.pieza === 'pulsador')!.id
    s.correr(1)
    expect(leds(s)[id('D10')][0]).toBeGreaterThan(0.5)
    expect(leds(s)[id('D8')][0]).toBeLessThan(0.1)
    s.controles.botones[pulsador] = true
    s.correr(0.2)
    s.controles.botones[pulsador] = false
    s.correr(2)
    expect(leds(s)[id('D8')][0]).toBeGreaterThan(0.5)
    expect(leds(s)[id('D12')][0]).toBeGreaterThan(0.5)
    expect(leds(s)[id('D10')][0]).toBeLessThan(0.1)
    s.liberar()
  }, 120_000)

  it('estacionamiento: con la mano a 5 cm se encienden las tres luces; lejos, ninguna', () => {
    const doc = PROYECTOS_AULAS.find(p => p.id === 'estacionamiento')!.construir()
    const s = new SimSincrona(doc, mesaElectronica(), { hex: hex('estacionamiento') })
    const id = (pin: string) => doc.cables.find(c => c.a[0] === 'placa' && c.a[1] === pin)!.de[0]
    s.controles.mano = 5
    s.correr(1)
    expect(leds(s)[id('D7')][0]).toBeGreaterThan(0.5)
    expect(leds(s)[id('D5')][0]).toBeGreaterThan(0.5)
    s.controles.mano = 100
    s.correr(1)
    expect(leds(s)[id('D5')][0]).toBeLessThan(0.1)
    s.liberar()
  }, 120_000)
})
