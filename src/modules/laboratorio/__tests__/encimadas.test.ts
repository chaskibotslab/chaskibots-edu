import { describe, expect, it } from 'vitest'
import { avisosEnsamblaje, encastrar, motivoNoEncastra, robotVacio } from '../engine/ensamblaje'
import { PREARMADOS } from '../robots/prearmados'

describe('piezas encimadas', () => {
  it('ningún proyecto armado tiene piezas encimadas', () => {
    for (const p of PREARMADOS) expect(avisosEnsamblaje(p.construir()).filter(a => a.includes('encimad')), p.id).toEqual([])
  })

  it('minisumo con ESP32 y L298N: abajo no caben; con el piso de arriba, sí', () => {
    let d = robotVacio('chasis-minisumo')
    const p = (id: string, padre: string, m: string) => { const r = encastrar(d, id, padre, m); d = r.doc; return r.id }
    const mi = p('motor-n20', 'chasis', 'motor-izq'), md = p('motor-n20', 'chasis', 'motor-der')
    p('rueda-34', mi, 'eje'); p('rueda-34', md, 'eje')
    // El L298N toca la rueda: el aviso dice qué hacer.
    expect(motivoNoEncastra(d, 'l298n', 'chasis', 'driver')).toMatch(/chocaría con Rueda.*Piso de arriba/)
    // El pack de 18650 al costado también: el aviso propone el centro.
    expect(motivoNoEncastra(d, 'bateria-2x18650', 'chasis', 'bateria')).toMatch(/chocaría con Rueda.*«Batería \(al centro/)
    p('bateria-lipo-2s', 'chasis', 'bateria')
    p('hcsr04', 'chasis', 'frente')
    const piso = p('piso-arriba-minisumo', 'chasis', 'arriba')
    p('l298n', piso, 'driver')
    p('esp32-devkit', piso, 'placa')
    p('fc51', 'chasis', 'frente-izq'); p('fc51', 'chasis', 'frente-der')
    p('tcrt5000', 'chasis', 'piso-izq'); p('tcrt5000', 'chasis', 'piso-der')
    expect(avisosEnsamblaje(d).filter(a => a.includes('encimad'))).toEqual([])
  })

  it('el pack de 18650 cabe al centro, con la placa y el driver arriba', () => {
    let d = robotVacio('chasis-minisumo')
    const p = (id: string, padre: string, m: string) => { const r = encastrar(d, id, padre, m); d = r.doc; return r.id }
    const mi = p('motor-n20', 'chasis', 'motor-izq'), md = p('motor-n20', 'chasis', 'motor-der')
    p('rueda-34', mi, 'eje'); p('rueda-34', md, 'eje')
    p('bateria-2x18650', 'chasis', 'bateria-centro')
    const piso = p('piso-arriba-minisumo', 'chasis', 'arriba')
    p('l298n', piso, 'driver')
    p('esp32-devkit', piso, 'placa')
    expect(avisosEnsamblaje(d).filter(a => a.includes('encimad'))).toEqual([])
  })

  it('los separadores del piso de arriba no dejan poner el L298N debajo', () => {
    let d = robotVacio('chasis-minisumo')
    d = encastrar(d, 'l298n', 'chasis', 'driver').doc
    expect(motivoNoEncastra(d, 'piso-arriba-minisumo', 'chasis', 'arriba')).toMatch(/chocaría con .*L298N\. Cambia de lugar/)
  })
})

describe('mesa de electrónica con pila', () => {
  it('LED + resistencia + pila de 9 V: enciende sin placa ni programa', async () => {
    const { construirLedPila } = await import('../robots/circuitos')
    const { planCircuito, resolverCircuito } = await import('../engine/circuito')
    const { verificar } = await import('../engine/verificacion')
    const doc = construirLedPila()
    expect(verificar(doc).map(x => x.texto)).toEqual([])
    expect(avisosEnsamblaje(doc)).toEqual([])
    const e = resolverCircuito(planCircuito(doc)!, null, { botones: {}, perillas: {} }, new Set())
    expect(e.leds['led-rojo'][0]).toBeGreaterThan(0.8)
    expect(e.quemados).toEqual([])
  })
})
