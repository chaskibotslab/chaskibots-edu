import { describe, it, expect } from 'vitest'
import { LISTA_PIEZAS, pieza } from '../catalogo/piezas'
import type { TipoMontaje } from '../catalogo/tipos'
import {
  avisosEnsamblaje, encastrar, montajesLibres, motivoNoEncastra, poses, quitar, reemplazar,
  resumen, robotVacio, ruedas, ruedasLocas, validar, girar,
} from '../engine/ensamblaje'
import { autocablear } from '../engine/autocableado'
import { planDe } from '../engine/plan'
import { construirEvitaObstaculos, construirSeguidor, PREARMADOS } from '../robots/prearmados'

describe('catálogo de piezas', () => {
  it('ids únicos, pines únicos y masas positivas', () => {
    const ids = new Set<string>()
    for (const p of LISTA_PIEZAS) {
      expect(ids.has(p.id), p.id).toBe(false)
      ids.add(p.id)
      const pines = p.pines.map(x => x.nombre)
      expect(new Set(pines).size, p.id).toBe(pines.length)
      expect(p.masa_g, p.id).toBeGreaterThan(0)
      expect(p.colisionadores.length, p.id).toBeGreaterThan(0)
      for (const v of p.variantes ?? []) expect(v.masa_g).toBeGreaterThan(0)
    }
  })

  it('cada pieza encaja en algún montaje que existe (salvo los chasis)', () => {
    const tipos = new Set<TipoMontaje>(LISTA_PIEZAS.flatMap(p => p.montajes.map(m => m.tipo)))
    for (const p of LISTA_PIEZAS) {
      if (p.familia === 'chasis' || p.proximamente) continue
      expect(p.encaja.length, p.id).toBeGreaterThan(0)
      for (const t of p.encaja) expect(tipos.has(t), `${p.id} → ${t}`).toBe(true)
    }
  })

  it('montajes con ids únicos en cada pieza', () => {
    for (const p of LISTA_PIEZAS) {
      const ids = p.montajes.map(m => m.id)
      expect(new Set(ids).size, p.id).toBe(ids.length)
    }
  })
})

describe('ensamblaje', () => {
  it('el seguidor prearmado queda con las medidas del robot de F1', () => {
    const doc = construirSeguidor()
    expect(validar(doc)).toEqual([])
    const ps = poses(doc)
    const rs = ruedas(doc, ps)
    expect(rs).toHaveLength(2)
    // F1: ruedas a ±70 mm del centro, radio 33 mm, 140 mm entre ruedas.
    const [izq, der] = rs.sort((a, b) => a.centro.z - b.centro.z)
    expect(izq.centro.z).toBeCloseTo(-70, 1)
    expect(der.centro.z).toBeCloseTo(70, 1)
    expect(izq.radio).toBe(33)
    // Sensores de piso 95 mm delante del eje y 13 mm sobre el piso.
    const ejeX = izq.centro.x, piso = izq.centro.y - izq.radio
    const sIzq = ps.get(doc.piezas.find(p => p.padre?.montaje === 'piso-izq')!.id)!
    expect(sIzq.pos.x - ejeX).toBeCloseTo(95, 1)
    expect(sIzq.pos.y - piso).toBeCloseTo(13, 1)
    expect(sIzq.pos.z).toBeCloseTo(-14, 1)
    // La rueda loca llega justo al piso gracias a los separadores.
    const [loca] = ruedasLocas(doc, ps)
    expect(loca.centroBola.y - loca.radio).toBeCloseTo(piso, 1)
    expect(loca.centroBola.x - ejeX).toBeCloseTo(-70, 1)
    // Masa: la del robot de F1 (≈ 0,37 kg).
    expect(resumen(doc).masa_g).toBeCloseTo(68 + 25 + 30 + 105 + 2 * 30 + 2 * 15 + 8 + 2 * 4, 5)
    expect(avisosEnsamblaje(doc)).toEqual([])
  })

  it('el motor izquierdo cuelga del chasis y su rueda sale hacia afuera', () => {
    const doc = construirSeguidor()
    const rs = ruedas(doc).sort((a, b) => a.centro.z - b.centro.z)
    expect(Math.abs(rs[0].eje.z)).toBeCloseTo(1, 5)
    expect(rs[0].centro.y).toBeCloseTo(-15, 1)
  })

  it('quitar un motor quita también su rueda y sus cables', () => {
    const doc = construirSeguidor()
    const motor = doc.piezas.find(p => p.padre?.montaje === 'motor-izq')!
    const d = quitar(doc, motor.id)
    expect(d.piezas.find(p => p.padre?.instancia === motor.id)).toBeUndefined()
    expect(ruedas(d)).toHaveLength(1)
    expect(d.cables.some(c => c.de[0] === motor.id || c.a[0] === motor.id)).toBe(false)
    expect(avisosEnsamblaje(d)).toEqual([])
  })

  it('cambiar llantas 65 → 48 mm conserva el motor y baja el robot', () => {
    let doc = construirSeguidor()
    for (const r of ruedas(doc)) doc = reemplazar(doc, r.instancia, 'rueda-48').doc
    expect(validar(doc)).toEqual([])
    const rs = ruedas(doc)
    expect(rs.every(r => r.radio === 24)).toBe(true)
    // La rueda loca se ajusta a la nueva altura.
    const [loca] = ruedasLocas(doc)
    expect(loca.centroBola.y - loca.radio).toBeCloseTo(rs[0].centro.y - 24, 1)
  })

  it('no deja encastrar piezas donde no van', () => {
    const doc = construirSeguidor()
    expect(motivoNoEncastra(doc, 'rueda-65', 'chasis', 'placa')).toMatch(/no encaja/)
    expect(motivoNoEncastra(doc, 'tcrt5000', 'chasis', 'piso-izq')).toMatch(/ocupado/)
    expect(() => encastrar(doc, 'arduino-uno', 'chasis', 'frente')).toThrow()
    expect(motivoNoEncastra(doc, 'hcsr04', 'chasis', 'frente')).toBeNull()
  })

  it('cambiar el chasis a 4WD conserva lo que tiene lugar en el nuevo', () => {
    const doc = construirSeguidor()
    const { doc: d, quitadas } = reemplazar(doc, 'chasis', 'chasis-4wd', 'aluminio')
    expect(validar(d)).toEqual([])
    // El 4WD no tiene montajes motor-izq/motor-der ni rueda loca: se quitan.
    expect(quitadas).toEqual(expect.arrayContaining(['Motor izquierdo', 'Motor derecho', 'Rueda loca']))
    expect(d.piezas.some(p => p.pieza === 'arduino-uno')).toBe(true)
    expect(resumen(d).masa_g).toBeLessThan(resumen(doc).masa_g + 140)
  })

  it('un 4WD armado desde cero tiene 4 ruedas a la misma altura', () => {
    let doc = robotVacio('chasis-4wd', 'acrilico')
    for (const m of ['motor-del-izq', 'motor-tra-izq', 'motor-del-der', 'motor-tra-der']) {
      const r = encastrar(doc, 'motor-tt', 'chasis', m)
      doc = encastrar(r.doc, 'rueda-65', r.id, 'eje').doc
    }
    const rs = ruedas(doc)
    expect(rs).toHaveLength(4)
    expect(new Set(rs.map(r => r.centro.y.toFixed(3))).size).toBe(1)
    expect(montajesLibres(doc).some(m => m.montaje.tipo === 'soporte-motor')).toBe(false)
  })

  it('girar la placa alterna entre las rotaciones permitidas', () => {
    const doc = construirSeguidor()
    const uno = doc.piezas.find(p => p.pieza === 'arduino-uno')!
    const d1 = girar(doc, uno.id)
    expect(d1.piezas.find(p => p.id === uno.id)!.padre!.giro).toBe(180)
    expect(girar(d1, uno.id).piezas.find(p => p.id === uno.id)!.padre!.giro).toBe(0)
  })

  it('lo que va sobre el servo gira con él', () => {
    const doc = construirEvitaObstaculos()
    const servo = doc.piezas.find(p => p.pieza === 'sg90')!
    const us = doc.piezas.find(p => p.pieza === 'hcsr04')!
    const frente = poses(doc, { [servo.id]: 90 }).get(us.id)!
    const izq = poses(doc, { [servo.id]: 180 }).get(us.id)!
    const adelante = (q: typeof frente.rot) => {
      const { x, y, z, w } = q
      return { x: 1 - 2 * (y * y + z * z), z: 2 * (x * z - w * y) }
    }
    expect(adelante(frente.rot).x).toBeCloseTo(1, 5)
    expect(adelante(izq.rot).z).toBeCloseTo(-1, 5) // 180° = mira a la izquierda (−z)
  })
})

describe('cableado automático y plan', () => {
  it('el seguidor usa los mismos pines que en F1', () => {
    const doc = construirSeguidor()
    const plan = planDe(doc)
    expect(plan.avisos).toEqual([])
    const izq = plan.motores.find(m => m.etiqueta === 'Motor izquierdo')!
    const der = plan.motores.find(m => m.etiqueta === 'Motor derecho')!
    expect([izq.en, izq.inA, izq.inB, izq.polaridad]).toEqual(['D5', 'D7', 'D8', 1])
    expect([der.en, der.inA, der.inB, der.polaridad]).toEqual(['D6', 'D9', 'D10', 1])
    const lineas = plan.lineas.map(l => [l.pinDigital, l.pinAnalogico])
    expect(lineas).toEqual([['D2', 'A0'], ['D3', 'A1']])
    expect(plan.voltajeBateria).toBe(7.4)
  })

  it('el evita obstáculos conecta ultrasonido y servo a pines válidos', () => {
    const doc = construirEvitaObstaculos()
    const plan = planDe(doc)
    expect(plan.avisos).toEqual([])
    expect(plan.ultrasonidos[0]).toMatchObject({ trig: 'D12', echo: 'D11' })
    expect(plan.servos[0]).toMatchObject({ sig: 'D3', alimentado: true })
    expect(doc.programa.cpp).toContain('const int TRIG = 12;')
    expect(doc.programa.cpp).toContain('const int SERVO_PIN = 3;')
  })

  it('un 4WD con L298N maneja dos motores por canal', () => {
    let doc = robotVacio('chasis-4wd', 'acrilico')
    for (const m of ['motor-del-izq', 'motor-tra-izq', 'motor-del-der', 'motor-tra-der']) {
      const r = encastrar(doc, 'motor-tt', 'chasis', m)
      doc = encastrar(r.doc, 'rueda-65', r.id, 'eje').doc
    }
    doc = encastrar(doc, 'arduino-uno', 'chasis', 'placa').doc
    doc = encastrar(doc, 'l298n', 'chasis', 'driver').doc
    doc = encastrar(doc, 'bateria-2x18650', 'chasis', 'bateria').doc
    doc = { ...doc, cables: autocablear(doc).cables }
    const plan = planDe(doc)
    expect(plan.avisos).toEqual([])
    const ladoIzq = plan.motores.filter(m => m.etiqueta.includes('izquierdo'))
    expect(ladoIzq).toHaveLength(2)
    expect(new Set(ladoIzq.map(m => m.en))).toEqual(new Set(['D5']))
  })

  it('con un TB6612 el cableado alimenta VCC y STBY y los motores funcionan', () => {
    let doc = construirSeguidor()
    const driver = doc.piezas.find(p => p.pieza === 'l298n')!
    doc = reemplazar(doc, driver.id, 'tb6612').doc
    doc = { ...doc, cables: autocablear(doc).cables }
    const plan = planDe(doc)
    expect(plan.avisos).toEqual([])
    expect(plan.caidaDriver).toBe(0.5)
    const izq = plan.motores.find(m => m.etiqueta === 'Motor izquierdo')!
    expect([izq.en, izq.inA, izq.inB, izq.polaridad]).toEqual(['D5', 'D7', 'D8', 1])
    // Sin STBY a 5 V el driver queda apagado (como en la realidad) y se avisa.
    const sinStby = { ...doc, cables: doc.cables.filter(c => !(c.de[1] === 'STBY' || c.a[1] === 'STBY')) }
    const p2 = planDe(sinStby)
    expect(p2.avisos.some(a => a.includes('STBY'))).toBe(true)
    expect(p2.motores.every(m => m.polaridad === 0)).toBe(true)
  })

  it('las piezas «próximamente» se ven pero no se pueden encastrar', () => {
    const doc = robotVacio('chasis-2wd')
    expect(motivoNoEncastra(doc, 'esp32-devkit', 'chasis', 'placa')).toMatch(/F4/)
  })

  it('un sensor sin alimentación no funciona y se avisa', () => {
    const doc = construirSeguidor()
    const s = doc.piezas.find(p => p.padre?.montaje === 'piso-izq')!
    const sinVcc = { ...doc, cables: doc.cables.filter(c => !(c.de[0] === s.id && c.de[1] === 'VCC')) }
    const plan = planDe(sinVcc)
    expect(plan.avisos.some(a => a.includes('alimentación'))).toBe(true)
    expect(plan.lineas.find(l => l.instancia === s.id)!.pinDigital).toBeNull()
  })

  it('todos los prearmados se arman sin errores ni avisos', () => {
    for (const p of PREARMADOS) {
      const doc = p.construir()
      expect(validar(doc), p.id).toEqual([])
      expect(avisosEnsamblaje(doc), p.id).toEqual([])
      expect(planDe(doc).avisos, p.id).toEqual([])
      expect(p.plantillas(doc, autocablear(doc).tabla).length).toBeGreaterThan(0)
      for (const x of doc.piezas) expect(() => pieza(x.pieza)).not.toThrow()
    }
  })
})
