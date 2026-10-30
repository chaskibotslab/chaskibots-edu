import { describe, expect, it, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { mesaElectronica } from '../arenas'
import { prepararSketch } from '../esp32/capasPlacas'
import { pinesDelCodigo, verificar } from '../engine/verificacion'
import { infoPlaca, pinCodigo } from '../engine/placa'
import { anclaPin } from '../ui/modelos/Piezas3D'
import { pieza } from '../catalogo/piezas'
import { bancoVacio, encimadas } from '../engine/ensamblaje'
import { construirMegaBarra, construirPicoParpadeo, construirPicoPerilla } from '../robots/circuitos'
import type { RobotDoc } from '../robots/doc'

// Raspberry Pi Pico y Arduino Mega: los .hex se compilaron con arduino-cli
// (atmega2560) a partir de los programas de los proyectos, con la capa de su
// placa delante (fixtures/fuentes/*.ino + esp32/capasPlacas.ts).
const hex = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', `${n}.hex`), 'utf8')
const idDe = (doc: RobotDoc, piezaId: string) => doc.piezas.filter(p => p.pieza === piezaId).map(p => p.id)
const brillo = (s: SimSincrona, id: string) => s.ultimas?.circuito?.leds[id]?.[0] ?? 0

describe('placas nuevas: fichas, pines y capas', () => {
  it('cada pin de la Pico y el Mega tiene dónde dibujar su cable', () => {
    for (const id of ['raspberry-pico', 'arduino-mega']) {
      const def = pieza(id)
      for (const p of def.pines) expect(anclaPin(def.modelo, p.nombre), `${id} ${p.nombre}`).not.toBeNull()
    }
  })

  it('caben junto a la protoboard', () => {
    for (const id of ['raspberry-pico', 'arduino-mega']) expect(encimadas(bancoVacio(id)), id).toEqual([])
  })

  it('los números del código se leen como los pines de cada placa', () => {
    expect(Array.from(pinesDelCodigo('pinMode(15, OUTPUT); analogRead(A0);', { placa: 'pico', prefijoPin: 'GP' })).sort()).toEqual(['GP15', 'GP26'])
    expect(Array.from(pinesDelCodigo('pinMode(22, OUTPUT); analogRead(A8); pinMode(60, INPUT);', { placa: 'mega', prefijoPin: 'D' })).sort()).toEqual(['A6', 'A8', 'D22'])
    expect(pinCodigo('GP15')).toBe('15')
    expect(infoPlaca(construirPicoPerilla()).chip).toBe('atmega2560-pico')
  })

  it('la capa de la Pico quita Servo.h y avisa que el WiFi no está', () => {
    const r = prepararSketch('pico', '#include <Servo.h>\nvoid setup(){}\nvoid loop(){}')
    expect(r.board).toBe('mega')
    expect(r.codigo).toContain('// #include <Servo.h>  (lo provee el simulador)')
    expect(r.codigo).toContain('#line 1 "sketch.ino"')
    expect(prepararSketch('pico', '#include <WiFi.h>\nvoid setup(){}').error).toMatch(/WiFi/)
    expect(prepararSketch('uno', 'x')).toEqual({ board: 'uno', codigo: 'x' })
  })

  it('los proyectos quedan bien cableados', () => {
    for (const f of [construirPicoParpadeo, construirPicoPerilla, construirMegaBarra]) expect(verificar(f()).map(p => p.texto)).toEqual([])
  })
})

describe('Raspberry Pi Pico (programa real sobre el ATmega2560 emulado)', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el LED de GP15 y el de la placa (GP25) se turnan', () => {
    const doc = construirPicoParpadeo()
    const s = new SimSincrona(doc, mesaElectronica(), { hex: hex('picoparpadeo') })
    const led = idDe(doc, 'led-rojo')[0]
    s.correr(0.25)
    expect(brillo(s, led)).toBeGreaterThan(0.5)
    expect(s.ultimoPaso?.pins.GP25?.level).toBe(0)
    s.correr(0.5)
    expect(brillo(s, led)).toBe(0)
    expect(s.ultimoPaso?.pins.GP25?.level).toBe(1)
  })

  it('la perilla en GP26 se lee con 12 bits y regula el brillo con PWM', () => {
    const doc = construirPicoPerilla()
    const s = new SimSincrona(doc, mesaElectronica(), { hex: hex('picoperilla') })
    const led = idDe(doc, 'led-verde')[0]
    s.controles.perillas[idDe(doc, 'potenciometro-10k')[0]] = 1
    s.correr(0.5)
    const lleno = brillo(s, led)
    const lecturas = s.serial.match(/Perilla: (\d+)/g)!.map(t => Number(t.slice(9)))
    expect(lecturas.at(-1)).toBeGreaterThan(4000)
    s.controles.perillas[idDe(doc, 'potenciometro-10k')[0]] = 0.25
    s.correr(0.5)
    const cuarto = brillo(s, led)
    expect(lleno).toBeGreaterThan(0.5)
    expect(cuarto).toBeGreaterThan(0.05)
    expect(cuarto).toBeLessThan(lleno * 0.6)
  })
})

describe('Arduino Mega (programa real en el ATmega2560 emulado)', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('la perilla en A8 enciende más LEDs en D22–D28', () => {
    const doc = construirMegaBarra()
    const s = new SimSincrona(doc, mesaElectronica(), { hex: hex('megabarra') })
    const pt = idDe(doc, 'potenciometro-10k')[0]
    const leds = doc.piezas.filter(p => pieza(p.pieza).comportamiento.tipo === 'led').map(p => p.id)
    const encendidos = () => leds.filter(id => brillo(s, id) > 0.3).length
    s.controles.perillas[pt] = 0
    s.correr(0.3)
    expect(encendidos()).toBe(0)
    s.controles.perillas[pt] = 0.6
    s.correr(0.3)
    expect(encendidos()).toBe(4)
    s.controles.perillas[pt] = 1
    s.correr(0.3)
    expect(encendidos()).toBe(7)
  })
})
