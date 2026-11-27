// Módulos inalámbricos (HC-05, HC-06, HC-12): encastran en el chasis, se
// cablean cruzados con el puerto serie y el laboratorio sabe si las órdenes llegan.
import { describe, expect, it } from 'vitest'
import { autocablear } from '../engine/autocableado'
import { encastrar, encimadas, motivoNoEncastra, raiz, robotVacio } from '../engine/ensamblaje'
import { estadoRadio } from '../engine/radio'
import { verificar } from '../engine/verificacion'
import { construirSeguidor, PREARMADOS } from '../robots/prearmados'
import type { RobotDoc } from '../robots/doc'

const conRadio = (doc: RobotDoc, modulo = 'hc05') => {
  const r = encastrar(doc, modulo, raiz(doc).id, 'radio')
  return { doc: { ...r.doc, cables: autocablear(r.doc, { conservar: true }).cables }, id: r.id }
}
const placaDe = (doc: RobotDoc) => doc.piezas.find(p => p.pieza.startsWith('arduino'))!.id

describe('módulos inalámbricos', () => {
  it('un robot sin módulo no tiene radio', () => {
    expect(estadoRadio(construirSeguidor())).toBeNull()
  })

  it.each(['hc05', 'hc06', 'hc12'])('%s encastra en el seguidor sin encimarse y queda listo con el cableado automático', modulo => {
    const base = construirSeguidor()
    expect(motivoNoEncastra(base, modulo, raiz(base).id, 'radio')).toBeNull()
    const { doc, id } = conRadio(base, modulo)
    expect(encimadas(doc).filter(par => par.some(p => p.id === id))).toEqual([])
    const uno = placaDe(doc)
    const cable = (pin: string) => doc.cables.find(c => (c.de[0] === id && c.de[1] === pin) || (c.a[0] === id && c.a[1] === pin))!
    expect([cable('TXD').de, cable('TXD').a]).toContainEqual([uno, 'D0'])
    expect([cable('RXD').de, cable('RXD').a]).toContainEqual([uno, 'D1'])
    expect(estadoRadio(doc)).toMatchObject({ listo: true })
    expect(verificar(doc).filter(p => p.nivel === 'error')).toEqual([])
  })

  it('cabe en los tres chasis que tienen soporte', () => {
    for (const chasis of ['chasis-2wd', 'chasis-4wd', 'chasis-battlebot']) {
      const p = PREARMADOS.find(x => x.construir().piezas[0].pieza === chasis)
      const base = p ? p.construir() : robotVacio(chasis)
      expect(motivoNoEncastra(base, 'hc05', raiz(base).id, 'radio'), chasis).toBeNull()
      const r = encastrar(base, 'hc05', raiz(base).id, 'radio')
      expect(encimadas(r.doc).filter(par => par.some(x => x.id === r.id)), chasis).toEqual([])
    }
  })

  it('avisa si los cables van cruzados, si falta TXD o si la velocidad no es 9600', () => {
    const { doc, id } = conRadio(construirSeguidor())
    const uno = placaDe(doc)
    const sinSenal = doc.cables.filter(c => !((c.de[0] === id || c.a[0] === id) && ['TXD', 'RXD'].some(p => c.de[1] === p || c.a[1] === p)))
    const suelto = { ...doc, cables: sinSenal }
    expect(estadoRadio(suelto)).toMatchObject({ listo: false })
    expect(estadoRadio(suelto)!.problema).toContain('TXD')
    expect(verificar(suelto).some(p => p.texto.includes('TXD'))).toBe(true)
    const cruzado = { ...doc, cables: [...sinSenal, { de: [id, 'TXD'] as [string, string], a: [uno, 'D1'] as [string, string], color: '#0f0' }] }
    expect(estadoRadio(cruzado)!.problema).toContain('cruzados')
    const rapido = { ...doc, programa: { ...doc.programa, cpp: 'void setup() { Serial.begin(115200); }\nvoid loop() {}' } }
    expect(estadoRadio(rapido)!.problema).toContain('9600')
  })
})
