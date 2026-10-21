// Ejecuta binarios REALES compilados con arduino-cli (fixtures/*.hex) en el
// ATmega328P emulado y comprueba que PWM, digitalRead, analogRead, millis y
// Serial se comportan como en la placa.
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AvrRunner, CPU_FREQ_HZ } from '../engine/avrRunner'

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8')
const text = (bytes: number[]) => String.fromCharCode(...bytes)

describe('AvrRunner (ATmega328P emulado)', () => {
  // pwm-test.ino: analogWrite(5,128); digitalWrite(13, digitalRead(2));
  //               Serial.println(analogRead(A0)); eco de lo que llega; delay(20)
  it('analogWrite(5,128) se mide como ~50 % de ciclo de trabajo', () => {
    const avr = new AvrRunner(fixture('pwm-test.hex'))
    avr.run(CPU_FREQ_HZ * 0.05) // arranque
    const r = avr.run(CPU_FREQ_HZ * 0.1)
    expect(r.pins.D5.mode).toBe('output')
    expect(r.pins.D5.duty).toBeCloseTo(128 / 255, 1)
    // Timer0 da ~976 Hz de PWM en el pin 5
    expect(r.pins.D5.freqHz).toBeGreaterThan(900)
    expect(r.pins.D5.freqHz).toBeLessThan(1050)
  })

  it('digitalRead sigue al nivel que inyecta el sensor', () => {
    const avr = new AvrRunner(fixture('pwm-test.hex'))
    avr.setDigitalInput('D2', true)
    let r = avr.run(CPU_FREQ_HZ * 0.06)
    expect(r.pins.D13.level).toBe(1)
    avr.setDigitalInput('D2', false)
    r = avr.run(CPU_FREQ_HZ * 0.06)
    expect(r.pins.D13.level).toBe(0)
  })

  it('analogRead(A0) devuelve el voltaje inyectado (2,5 V → ~512) por Serial', () => {
    const avr = new AvrRunner(fixture('pwm-test.hex'))
    avr.setAnalogInput('A0', 2.5)
    const out = text(avr.run(CPU_FREQ_HZ * 0.2).serial)
    const values = out.split(/\r?\n/).filter(Boolean).map(Number)
    expect(values.length).toBeGreaterThan(3)
    for (const v of values.slice(1)) expect(Math.abs(v - 512)).toBeLessThanOrEqual(2)
  })

  it('Serial recibe texto del monitor y lo devuelve (eco)', () => {
    const avr = new AvrRunner(fixture('pwm-test.hex'))
    avr.run(CPU_FREQ_HZ * 0.01)
    avr.serialWrite('hola')
    // El sketch devuelve un carácter por vuelta del loop, entre lecturas de A0.
    const out = text(avr.run(CPU_FREQ_HZ * 0.3).serial).replace(/[0-9\r\n]/g, '')
    expect(out).toBe('hola')
  })

  it('el seguidor de línea gira hacia el lado donde está la línea', () => {
    const avr = new AvrRunner(fixture('seguidor.hex'))
    const boot = text(avr.run(CPU_FREQ_HZ * 0.05).serial)
    expect(boot).toContain('Seguidor de linea listo')

    // Ambos sensores en blanco → los dos motores adelante con la misma velocidad
    avr.setDigitalInput('D2', false); avr.setDigitalInput('D3', false)
    let r = avr.run(CPU_FREQ_HZ * 0.05)
    expect(r.pins.D7.level).toBe(1); expect(r.pins.D8.level).toBe(0)
    expect(r.pins.D9.level).toBe(1); expect(r.pins.D10.level).toBe(0)
    expect(r.pins.D5.duty).toBeCloseTo(150 / 255, 1)
    expect(r.pins.D6.duty).toBeCloseTo(150 / 255, 1)

    // Línea bajo el sensor izquierdo → motor izquierdo atrás, derecho adelante
    avr.setDigitalInput('D2', true)
    r = avr.run(CPU_FREQ_HZ * 0.05)
    expect(r.pins.D7.level).toBe(0); expect(r.pins.D8.level).toBe(1)
    expect(r.pins.D6.duty).toBeCloseTo(170 / 255, 1)
    expect(r.pins.D13.level).toBe(1)
  })

  it('millis() avanza al ritmo del reloj de 16 MHz', () => {
    // 1 s simulado = 16 000 000 ciclos: el loop con delay(20) imprime ~50 líneas
    const avr = new AvrRunner(fixture('pwm-test.hex'))
    const lines = text(avr.run(CPU_FREQ_HZ).serial).split('\n').filter(Boolean)
    expect(lines.length).toBeGreaterThan(40)
    expect(lines.length).toBeLessThan(52)
  })
})
