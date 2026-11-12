import { describe, it, expect } from 'vitest'
import { aprendizajes, explicarCable, explicarPin, pasosPendientes } from '../engine/explicacion'
import { verificar } from '../engine/verificacion'
import { pieza } from '../catalogo/piezas'
import { construirSeguidor, PREARMADOS } from '../robots/prearmados'
import type { RobotDoc } from '../robots/doc'

const id = (doc: RobotDoc, p: string) => doc.piezas.find(x => x.pieza === p)!.id

describe('explicaciones del cableado', () => {
  it('todos los pines de todos los proyectos tienen explicación', () => {
    for (const p of PREARMADOS) {
      const d = p.construir()
      for (const inst of d.piezas) for (const pin of pieza(inst.pieza).pines) {
        const e = explicarPin(d, inst.id, pin.nombre)
        expect(e, `${p.id} ${inst.etiqueta}.${pin.nombre}`).not.toBeNull()
        expect(e!.que.length, `${p.id} ${inst.etiqueta}.${pin.nombre}`).toBeGreaterThan(20)
        expect(e!.que).not.toMatch(/undefined|null|NaN/)
      }
    }
  })

  it('todos los cables de todos los proyectos tienen explicación', () => {
    for (const p of PREARMADOS) {
      const d = p.construir()
      for (const c of d.cables) {
        const e = explicarCable(d, c)
        expect(e, `${p.id} ${c.de.join('.')} → ${c.a.join('.')}`).not.toBeNull()
        expect(e!.texto.length).toBeGreaterThan(20)
        expect(e!.texto).not.toMatch(/undefined|null|NaN|cortocircuito/)
      }
    }
  })

  it('explica un pin de la placa con lo que tiene conectado y cómo se usa en el código', () => {
    const d = construirSeguidor()
    const drv = id(d, 'l298n'), uno = id(d, 'arduino-uno')
    const c = d.cables.find(x => x.de[0] === drv && x.de[1] === 'ENA')!
    const e = explicarPin(d, uno, c.a[1])!
    expect(e.titulo).toContain('Arduino')
    expect(e.unidoA.join()).toContain('ENA')
    expect(e.codigo).toContain('analogWrite')
    expect(e.cuidado).toContain('20 mA')
  })

  it('un pin sin cable dice que está suelto', () => {
    const d = { ...construirSeguidor(), cables: [] }
    expect(explicarPin(d, id(d, 'arduino-uno'), 'D2')!.unidoA).toEqual([])
  })

  it('explica un cortocircuito y un motor directo a la placa', () => {
    const d = construirSeguidor()
    const uno = id(d, 'arduino-uno')
    expect(explicarCable(d, { de: [uno, '5V'], a: [uno, 'GND'] })!.texto).toContain('cortocircuito')
    const motor = d.piezas.find(p => p.etiqueta === 'Motor izquierdo')!.id
    expect(explicarCable(d, { de: [motor, 'M+'], a: [uno, 'D4'] })!.texto).toContain('driver')
  })

  it('con todo conectado no falta ningún paso', () => {
    for (const p of PREARMADOS) expect(pasosPendientes(p.construir()), p.id).toEqual([])
  })

  it('sin cables, la guía lleva a un robot que funciona', () => {
    let d: RobotDoc = { ...construirSeguidor(), cables: [], cableado: 'manual' }
    const pasos = pasosPendientes(d)
    expect(pasos.length).toBeGreaterThan(10)
    for (let i = 0; i < 60; i++) {
      const p = pasosPendientes(d)[0]
      if (!p) break
      expect(p.titulo).toMatch(/^Conecta /)
      expect(p.porque.length).toBeGreaterThan(20)
      d = { ...d, cables: [...d.cables, p.cable] }
    }
    expect(pasosPendientes(d)).toEqual([])
    expect(verificar(d).filter(x => x.nivel === 'error')).toEqual([])
  })

  it('si el alumno ya ocupó el pin que tocaba, propone otro libre del mismo tipo', () => {
    const base = construirSeguidor()
    const drv = id(base, 'l298n'), uno = id(base, 'arduino-uno')
    const ena = base.cables.find(x => x.de[0] === drv && x.de[1] === 'ENA')!
    // Se quita ENA y su pin se ocupa con otra cosa.
    const sensor = base.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'ir-reflectivo')!.id
    const d: RobotDoc = {
      ...base,
      cables: [...base.cables.filter(x => x !== ena && !(x.de[0] === sensor && x.de[1] === 'DO')), { de: [sensor, 'DO'], a: ena.a, color: '#000' }],
    }
    const paso = pasosPendientes(d).find(p => p.cable.de[1] === 'ENA' || p.cable.a[1] === 'ENA')!
    const pinPlaca = paso.cable.de[0] === uno ? paso.cable.de[1] : paso.cable.a[1]
    expect(pinPlaca).not.toBe(ena.a[1])
    expect(pieza('arduino-uno').pines.find(p => p.nombre === pinPlaca)!.tipo).toBe('pwm')
  })

  it('cada proyecto dice qué se aprende', () => {
    for (const p of PREARMADOS) {
      const a = aprendizajes(p.construir())
      expect(a.length, p.id).toBeGreaterThan(0)
      expect(a.length).toBeLessThanOrEqual(5)
    }
  })
})

describe('guía con un circuito armado a su manera', () => {
  it('si el LED ya usa otra resistencia, no insiste con la primera y ofrece la libre al siguiente LED', () => {
    const p = PREARMADOS.find(x => x.id === 'semaforo-carros') ?? PREARMADOS.find(x => x.construir().piezas.filter(q => pieza(q.pieza).comportamiento.tipo === 'led').length >= 2)!
    const base = p.construir()
    const leds = base.piezas.filter(q => pieza(q.pieza).comportamiento.tipo === 'led')
    const res = base.piezas.filter(q => pieza(q.pieza).comportamiento.tipo === 'resistencia')
    // El primer LED va a la segunda resistencia (no a la que propone la guía).
    const d: RobotDoc = { ...base, cableado: 'manual', cables: [{ de: [leds[0].id, 'K'], a: [res[1].id, '1'], color: '#000' }] }
    const pasos = pasosPendientes(d)
    const toca = (inst: string, pin: string) => pasos.filter(x => (x.cable.de[0] === inst && x.cable.de[1] === pin) || (x.cable.a[0] === inst && x.cable.a[1] === pin))
    expect(toca(leds[0].id, 'K')).toEqual([])
    // Ningún paso manda otro LED a la pata que ya está ocupada.
    expect(toca(res[1].id, '1')).toEqual([])
    expect(toca(leds[1].id, 'K').length).toBe(1)
  })
})
