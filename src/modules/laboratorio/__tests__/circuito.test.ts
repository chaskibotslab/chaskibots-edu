import { describe, expect, it, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { iniciarRapier } from '../engine/fisica/mundo'
import { planCircuito, resolverCircuito, type ControlesCircuito } from '../engine/circuito'
import type { PinReport } from '../engine/avrRunner'
import { autocablear } from '../engine/autocableado'
import { bancoVacio, encastrar } from '../engine/ensamblaje'
import { verificar } from '../engine/verificacion'
import { SimSincrona } from '../engine/simSincrona'
import { mesaElectronica } from '../arenas'
import { construirPotBrillo, construirSemaforo, construirLuzNocturna, construirLedPila, construirBotonSinArduino, construirDosPilas, PROYECTOS_CIRCUITO } from '../robots/circuitos'
import { agujeroRiel, xRiel } from '../catalogo/piezas/circuito'
import { encimadas } from '../engine/ensamblaje'
import { nets } from '../engine/plan'
import type { RobotDoc } from '../robots/doc'

const salida = (level: 0 | 1, duty: number = level, freqHz = 0): PinReport => ({ mode: 'output', level, duty, freqHz, pulsoUs: 0 })
const pullup: PinReport = { mode: 'input_pullup', level: 1, duty: 1, freqHz: 0, pulsoUs: 0 }
const sinTocar: ControlesCircuito = { botones: {}, perillas: {} }
/** Id de la (primera) instancia de una pieza del catálogo. */
const idDe = (doc: RobotDoc, piezaId: string) => doc.piezas.find(p => p.pieza === piezaId)!.id

/** Protoboard con un LED (y opcionalmente su resistencia) del pin D8 a tierra. */
function ledEnD8(resistencia: string | null, alReves = false): RobotDoc {
  let d = bancoVacio()
  const l = encastrar(d, 'led-rojo', 'protoboard', 'hueco-1'); d = l.doc
  const cables: RobotDoc['cables'] = [{ de: [l.id, alReves ? 'K' : 'A'], a: ['placa', 'D8'], color: '#f00' }]
  if (resistencia) {
    const r = encastrar(d, resistencia, 'protoboard', 'hueco-9'); d = r.doc
    cables.push({ de: [l.id, alReves ? 'A' : 'K'], a: [r.id, '1'], color: '#999' }, { de: [r.id, '2'], a: ['placa', 'GND'], color: '#000' })
  } else cables.push({ de: [l.id, alReves ? 'A' : 'K'], a: ['placa', 'GND'], color: '#000' })
  return { ...d, cables, cableado: 'manual' }
}

describe('circuito de la protoboard', () => {
  it('un LED con 330 Ω enciende con HIGH y se apaga con LOW', () => {
    const plan = planCircuito(ledEnD8('resistencia-330'))!
    const prendido = resolverCircuito(plan, { D8: salida(1) }, sinTocar, new Set())
    expect(prendido.leds['led-rojo'][0]).toBeGreaterThan(0.9)
    expect(prendido.quemados).toEqual([])
    expect(resolverCircuito(plan, { D8: salida(0) }, sinTocar, new Set()).leds['led-rojo'][0]).toBe(0)
  })

  it('con 10 kΩ el LED apenas brilla; sin resistencia se quema', () => {
    const tenue = resolverCircuito(planCircuito(ledEnD8('resistencia-10000'))!, { D8: salida(1) }, sinTocar, new Set())
    expect(tenue.leds['led-rojo'][0]).toBeGreaterThan(0.05)
    expect(tenue.leds['led-rojo'][0]).toBeLessThan(0.35)
    const sinR = resolverCircuito(planCircuito(ledEnD8(null))!, { D8: salida(1) }, sinTocar, new Set())
    expect(sinR.quemados).toEqual(['led-rojo'])
    expect(sinR.leds['led-rojo'][0]).toBe(0)
    expect(sinR.avisos[0]).toMatch(/se quemó/)
  })

  it('un LED al revés no enciende', () => {
    const r = resolverCircuito(planCircuito(ledEnD8('resistencia-330', true))!, { D8: salida(1) }, sinTocar, new Set())
    expect(r.leds['led-rojo'][0]).toBe(0)
  })

  it('con PWM al 25 % el LED brilla menos que encendido del todo', () => {
    const plan = planCircuito(ledEnD8('resistencia-330'))!
    const lleno = resolverCircuito(plan, { D8: salida(1) }, sinTocar, new Set()).leds['led-rojo'][0]
    const cuarto = resolverCircuito(plan, { D8: salida(1, 0.25, 490) }, sinTocar, new Set()).leds['led-rojo'][0]
    expect(cuarto).toBeGreaterThan(0.15)
    expect(cuarto).toBeLessThan(lleno * 0.4)
  })

  it('pulsador con INPUT_PULLUP: suelto se lee HIGH, presionado LOW', () => {
    const doc = construirSemaforo()
    const plan = planCircuito(doc)!
    expect(resolverCircuito(plan, { D2: pullup }, sinTocar, new Set()).digital.D2).toBe(true)
    const presionado = resolverCircuito(plan, { D2: pullup }, { botones: { [idDe(doc, 'pulsador')]: true }, perillas: {} }, new Set())
    expect(presionado.digital.D2).toBe(false)
    expect(presionado.entradas.D2).toEqual([false, false])
    // Suelto y sin pull-up, el pin queda al aire.
    expect(resolverCircuito(plan, { D2: pullup }, sinTocar, new Set()).entradas.D2).toEqual([false, true])
  })

  it('el potenciómetro reparte el voltaje y la LDR con 1 kΩ mide la luz', () => {
    const docPot = construirPotBrillo()
    const pot = planCircuito(docPot)!
    const v = resolverCircuito(pot, {}, { botones: {}, perillas: { [idDe(docPot, 'potenciometro-10k')]: 0.25 } }, new Set()).analog.A0
    expect(v).toBeCloseTo(1.25, 1)
    const docLdr = construirLuzNocturna()
    const ldr = planCircuito(docLdr)!
    const sol = resolverCircuito(ldr, {}, { botones: {}, perillas: { [idDe(docLdr, 'ldr')]: 1 } }, new Set()).analog.A0
    const noche = resolverCircuito(ldr, {}, { botones: {}, perillas: { [idDe(docLdr, 'ldr')]: 0 } }, new Set()).analog.A0
    expect(sol).toBeCloseTo(2.5, 1)
    expect(noche).toBeLessThan(0.05)
  })

  it('el buzzer pasivo suena con la frecuencia de tone() y calla con HIGH fijo', () => {
    const plan = planCircuito(construirSemaforo())!
    expect(resolverCircuito(plan, { D7: salida(1, 0.5, 1500) }, sinTocar, new Set()).sonidos).toEqual([{ inst: 'buzzer-pasivo', freq: 1500 }])
    expect(resolverCircuito(plan, { D7: salida(1) }, sinTocar, new Set()).sonidos).toEqual([])
  })

  it('el cableado automático pone cada LED con su resistencia y la verificación avisa si falta', () => {
    let d = bancoVacio()
    for (const [p, h] of [['led-rojo', 1], ['led-verde', 2], ['resistencia-330', 9], ['pulsador', 4]] as const) d = encastrar(d, p, 'protoboard', `hueco-${h}`).doc
    const { cables, tabla } = autocablear(d)
    const conCables = { ...d, cables }
    expect(tabla.find(f => f.instancia === 'led-rojo')?.placa).toBe('D8')
    expect(tabla.find(f => f.instancia === 'led-verde')?.placa).toBe('D9')
    expect(tabla.find(f => f.instancia === idDe(d, 'pulsador'))?.placa).toBe('D2')
    const avisos = verificar(conCables).map(p => p.texto)
    expect(avisos.some(t => t.startsWith('LED verde no tiene resistencia'))).toBe(true)
    expect(avisos.some(t => t.startsWith('LED rojo no tiene resistencia'))).toBe(false)
  })
})

describe('rieles de la protoboard y circuitos sin Arduino', () => {
  const brillo = (doc: RobotDoc, controles = sinTocar) => resolverCircuito(planCircuito(doc)!, {}, controles, new Set()).leds

  it('la pila de 9 V en los rieles enciende el LED (sin placa ni programa)', () => {
    const doc = construirLedPila()
    expect(doc.piezas.some(p => p.id === 'placa')).toBe(false)
    expect(brillo(doc)[idDe(doc, 'led-rojo')][0]).toBeGreaterThan(0.5)
    expect(verificar(doc)).toEqual([])
  })

  it('la fuente MB102 une sus pines con los cuatro rieles por dentro', () => {
    const doc = construirBotonSinArduino()
    const n = nets(doc)
    const f = idDe(doc, 'fuente-mb102')
    expect(n.get(`protoboard.+ arriba`)).toBe(n.get(`${f}.+`))
    expect(n.get(`protoboard.+ abajo`)).toBe(n.get(`${f}.+`))
    expect(n.get(`protoboard.- abajo`)).toBe(n.get(`${f}.-`))
    expect(n.get(`protoboard.+ arriba`)).not.toBe(n.get(`protoboard.- arriba`))
  })

  it('con la fuente, el LED se enciende solo mientras se presiona el pulsador', () => {
    const doc = construirBotonSinArduino()
    const led = idDe(doc, 'led-verde')
    expect(brillo(doc)[led][0]).toBe(0)
    expect(brillo(doc, { botones: { [idDe(doc, 'pulsador')]: true }, perillas: {} })[led][0]).toBeGreaterThan(0.5)
  })

  it('con 3 V (dos AA) el LED rojo brilla y el azul casi no', () => {
    const doc = construirDosPilas()
    const b = brillo(doc)
    expect(b[idDe(doc, 'led-rojo')][0]).toBeGreaterThan(0.5)
    expect(b[idDe(doc, 'led-azul')][0]).toBeLessThan(0.1)
  })

  it('un cable del riel + al − con la pila puesta es un cortocircuito', () => {
    const doc = construirLedPila()
    const malo = { ...doc, cables: [...doc.cables, { de: ['protoboard', '+ abajo'] as [string, string], a: ['protoboard', '- abajo'] as [string, string], color: '#f00' }] }
    expect(verificar(malo).some(p => p.nivel === 'error' && p.texto.startsWith('Cortocircuito'))).toBe(true)
  })

  it('la fuente no se encima con los componentes de la izquierda, pero sí con los del lugar 8', () => {
    let d = bancoVacio()
    d = encastrar(d, 'fuente-mb102', 'protoboard', 'fuente').doc
    for (const h of [1, 7, 9, 15]) d = encastrar(d, 'resistencia-330', 'protoboard', `hueco-${h}`).doc
    d = encastrar(d, 'hcsr04', 'protoboard', 'sensor').doc
    expect(encimadas(d)).toEqual([])
    expect(() => encastrar(d, 'resistencia-330', 'protoboard', 'hueco-8')).toThrow()
  })

  it('cada cable entra en su propio agujero del riel, el más cercano a su otra punta', () => {
    const usados = new Map<string, Set<number>>()
    const a = agujeroRiel('+ abajo', 0, usados)!, b = agujeroRiel('+ abajo', 0, usados)!
    expect(a[0]).not.toBe(b[0])
    expect(Math.abs(a[0])).toBeLessThan(5)
    expect(a[1]).toBe(22.1)
    expect(agujeroRiel('- arriba', 500, usados)![0]).toBe(xRiel(49))
  })
})

describe('proyectos de electrónica', () => {
  it('todos quedan bien cableados: sin errores ni advertencias, y cada LED con su resistencia', () => {
    for (const p of PROYECTOS_CIRCUITO) {
      const doc = p.construir()
      expect(verificar(doc).map(x => x.texto), p.id).toEqual([])
      const plan = planCircuito(doc)
      if (!plan) continue // solo módulos (sensor, servo): no hay circuito en la protoboard
      // Con todos los pines en HIGH ningún LED se quema.
      const altos = Object.fromEntries(plan.pines.map(x => [x.pin, salida(1)]))
      expect(resolverCircuito(plan, altos, sinTocar, new Set()).quemados, p.id).toEqual([])
    }
  })
})

describe('semáforo del kit de 8vo (programa real en el ATmega328P emulado)', () => {
  beforeAll(async () => { await iniciarRapier() })
  const hex = fs.readFileSync(path.join(__dirname, 'fixtures', 'semaforo.hex'), 'utf8')
  const brillo = (s: SimSincrona, id: string) => s.ultimas?.circuito?.leds[id]?.[0] ?? 0

  it('verde, peatón presiona, amarillo, rojo con tres pitidos de 1500 Hz', () => {
    const doc = construirSemaforo()
    const s = new SimSincrona(doc, mesaElectronica(), { hex })
    s.correr(1)
    expect(brillo(s, 'led-verde')).toBeGreaterThan(0.9)
    expect(brillo(s, 'led-rojo')).toBe(0)
    // El peatón presiona el botón (0,2 s) en medio del verde.
    s.controles.botones[idDe(doc, 'pulsador')] = true
    s.correr(0.2)
    s.controles.botones[idDe(doc, 'pulsador')] = false
    s.correr(0.5)
    expect(brillo(s, 'led-amarillo')).toBeGreaterThan(0.9)
    expect(brillo(s, 'led-verde')).toBe(0)
    // Pasa el amarillo (1,5 s): rojo y el aviso sonoro.
    const tonos = new Set<number>()
    s.correr(1.6, 1 / 60, x => { for (const t of x.ultimas?.circuito?.sonidos ?? []) tonos.add(Math.round(t.freq / 100) * 100) })
    expect(brillo(s, 'led-rojo')).toBeGreaterThan(0.9)
    expect(tonos.has(1500)).toBe(true)
    s.liberar()
  }, 180_000)

  it('sin peatón, el verde dura 5 s completos', () => {
    const s = new SimSincrona(construirSemaforo(), mesaElectronica(), { hex })
    s.correr(4.8)
    expect(brillo(s, 'led-verde')).toBeGreaterThan(0.9)
    s.correr(0.5)
    expect(brillo(s, 'led-amarillo')).toBeGreaterThan(0.9)
    s.liberar()
  }, 180_000)

  it('la perilla regula el brillo con analogWrite (programa real)', () => {
    const hexPot = fs.readFileSync(path.join(__dirname, 'fixtures', 'potbrillo.hex'), 'utf8')
    const doc = construirPotBrillo()
    const perilla = idDe(doc, 'potenciometro-10k')
    const s = new SimSincrona(doc, mesaElectronica(), { hex: hexPot })
    s.controles.perillas[perilla] = 1
    s.correr(0.6)
    const alto = brillo(s, 'led-azul')
    s.controles.perillas[perilla] = 0.1
    s.correr(0.6)
    const bajo = brillo(s, 'led-azul')
    expect(alto).toBeGreaterThan(0.8)
    expect(bajo).toBeLessThan(alto * 0.6)
    expect(bajo).toBeGreaterThan(0)
    expect(s.serial).toMatch(/Perilla: \d+/)
    s.liberar()
  }, 180_000)
})
