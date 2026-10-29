import { describe, expect, it } from 'vitest'
import { avisosEnsamblaje, encastrar, motivoNoEncastra, robotVacio } from '../engine/ensamblaje'
import { PREARMADOS } from '../robots/prearmados'

describe('piezas encimadas', () => {
  it('ningún proyecto armado tiene piezas encimadas', () => {
    for (const p of PREARMADOS) expect(avisosEnsamblaje(p.construir()).filter(a => a.includes('encimad')), p.id).toEqual([])
  })

  it('en el minisumo el ESP32 y el L298N no caben juntos abajo; con el piso de arriba, sí', () => {
    let d = robotVacio('chasis-minisumo')
    d = encastrar(d, 'l298n', 'chasis', 'driver').doc
    expect(motivoNoEncastra(d, 'esp32-devkit', 'chasis', 'placa')).toMatch(/no cabe ahí: chocaría con .*L298N.*Piso de arriba/)
    const piso = encastrar(d, 'piso-arriba-minisumo', 'chasis', 'arriba')
    d = piso.doc
    expect(motivoNoEncastra(d, 'esp32-devkit', piso.id, 'placa')).toBeNull()
    d = encastrar(d, 'esp32-devkit', piso.id, 'placa').doc
    expect(motivoNoEncastra(d, 'bateria-2x18650', 'chasis', 'bateria')).toBeNull()
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
