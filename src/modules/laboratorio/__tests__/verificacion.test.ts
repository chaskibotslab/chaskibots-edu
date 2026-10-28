import { describe, it, expect } from 'vitest'
import { pinesDelCodigo, verificar } from '../engine/verificacion'
import { construirSeguidor, PREARMADOS } from '../robots/prearmados'
import type { Cable, RobotDoc } from '../robots/doc'

const id = (doc: RobotDoc, pieza: string) => doc.piezas.find(p => p.pieza === pieza)!.id
const con = (doc: RobotDoc, cables: Cable[]): RobotDoc => ({ ...doc, cables: [...doc.cables, ...cables] })
const sin = (doc: RobotDoc, f: (c: Cable) => boolean): RobotDoc => ({ ...doc, cables: doc.cables.filter(c => !f(c)) })

describe('verificación eléctrica', () => {
  it('los prearmados no tienen ningún problema', () => {
    for (const p of PREARMADOS) expect(verificar(p.construir()), p.id).toEqual([])
  })

  it('detecta un cortocircuito 5V–GND', () => {
    const d = construirSeguidor()
    const uno = id(d, 'arduino-uno')
    const r = verificar(con(d, [{ de: [uno, '5V'], a: [uno, 'GND'], color: '#f00' }]))
    expect(r.some(p => p.nivel === 'error' && p.texto.startsWith('Cortocircuito'))).toBe(true)
  })

  it('un motor directo al Arduino es un error', () => {
    const d = construirSeguidor()
    const motor = d.piezas.find(p => p.etiqueta === 'Motor izquierdo')!.id
    const r = verificar(con(d, [{ de: [motor, 'M+'], a: [id(d, 'arduino-uno'), 'D4'], color: '#f00' }]))
    expect(r.some(p => p.nivel === 'error' && p.texto.includes('driver'))).toBe(true)
  })

  it('la batería en un pin de señal es un error', () => {
    const d = construirSeguidor()
    const r = verificar(con(d, [{ de: [id(d, 'bateria-2x18650'), '+'], a: [id(d, 'arduino-uno'), 'D4'], color: '#f00' }]))
    expect(r.some(p => p.nivel === 'error' && p.texto.includes('quemaría'))).toBe(true)
  })

  it('la velocidad en un pin sin PWM es una advertencia', () => {
    let d = construirSeguidor()
    const drv = id(d, 'l298n'), uno = id(d, 'arduino-uno')
    d = sin(d, c => c.de[0] === drv && c.de[1] === 'ENA')
    d = con(d, [{ de: [drv, 'ENA'], a: [uno, 'D4'], color: '#a855f7' }])
    const r = verificar(d)
    expect(r.some(p => p.nivel === 'advertencia' && p.texto.includes('PWM'))).toBe(true)
    expect(r.some(p => p.nivel === 'error')).toBe(false)
  })

  it('una salida analógica en un pin digital es una advertencia', () => {
    let d = construirSeguidor()
    const s = d.piezas.find(p => p.padre?.montaje === 'piso-izq')!.id
    d = sin(d, c => c.de[0] === s && c.de[1] === 'AO')
    d = con(d, [{ de: [s, 'AO'], a: [id(d, 'arduino-uno'), 'D4'], color: '#84cc16' }])
    expect(verificar(d).some(p => p.texto.includes('analógica'))).toBe(true)
  })

  it('avisa si el programa usa un pin sin cable', () => {
    const d = construirSeguidor()
    const r = verificar({ ...d, programa: { modo: 'codigo', cpp: 'const int LED = 4;\nvoid setup(){ pinMode(LED, OUTPUT); }\nvoid loop(){}' } })
    expect(r.some(p => p.texto.includes('pin D4'))).toBe(true)
  })

  it('lee los pines del código, también en listas de constantes', () => {
    const pines = pinesDelCodigo('const int ENA = 5, IN1 = 7;\n#define SENSOR A2\nvoid setup(){ pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); analogRead(SENSOR); pinMode(13, OUTPUT); }')
    expect(Array.from(pines).sort()).toEqual(['A2', 'D5', 'D7'])
  })
})
