// HC-SR04 y servo con binarios REALES (fixtures/fuentes/*.ino compilados con arduino-cli).
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AvrRunner, CPU_FREQ_HZ } from '../engine/avrRunner'
import { Ultrasonidos } from '../engine/hcsr04'
import { servoPulseToAngle } from '../engine/bridge'

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8')
const lineas = (bytes: number[]) => String.fromCharCode(...bytes).split(/\r?\n/).filter(Boolean)

describe('HC-SR04 dentro del micro emulado', () => {
  it('pulseIn mide la distancia simulada (20 cm y 150 cm)', () => {
    const avr = new AvrRunner(fixture('ultra.hex'))
    const us = new Ultrasonidos(avr)
    us.actualizar([{ trig: 'D12', echo: 'D11', cm: 20 }])
    avr.run(CPU_FREQ_HZ * 0.05)
    let r = avr.run(CPU_FREQ_HZ * 0.3)
    const a = lineas(r.serial).map(Number)
    expect(a.length).toBeGreaterThan(2)
    for (const v of a.slice(1)) { expect(v).toBeGreaterThanOrEqual(19); expect(v).toBeLessThanOrEqual(21) }

    us.actualizar([{ trig: 'D12', echo: 'D11', cm: 150 }])
    avr.run(CPU_FREQ_HZ * 0.1)
    r = avr.run(CPU_FREQ_HZ * 0.3)
    for (const v of lineas(r.serial).map(Number).slice(1)) { expect(v).toBeGreaterThanOrEqual(148); expect(v).toBeLessThanOrEqual(152) }
  })

  it('sin obstáculo pulseIn se agota y devuelve 0', () => {
    const avr = new AvrRunner(fixture('ultra.hex'))
    new Ultrasonidos(avr).actualizar([{ trig: 'D12', echo: 'D11', cm: null }])
    avr.run(CPU_FREQ_HZ * 0.05)
    const r = avr.run(CPU_FREQ_HZ * 0.4)
    const v = lineas(r.serial).map(Number)
    expect(v.length).toBeGreaterThan(0)
    expect(v.every(x => x === 0)).toBe(true)
  })
})

describe('servo con la librería Servo.h', () => {
  it('el ancho de pulso sigue a servo.write (0°, 90°, 180°)', () => {
    const avr = new AvrRunner(fixture('servo.hex'))
    const angulo = () => servoPulseToAngle(avr.run(CPU_FREQ_HZ * 0.05).pins.D3.pulsoUs / 1000)
    avr.run(CPU_FREQ_HZ * 0.2)        // dentro del tramo de 0°
    expect(angulo()).toBeLessThan(3)
    avr.run(CPU_FREQ_HZ * 0.3)        // ~0,55 s: tramo de 90°
    expect(Math.abs(angulo() - 90)).toBeLessThan(3)
    avr.run(CPU_FREQ_HZ * 0.35)       // ~0,95 s: tramo de 180°
    expect(angulo()).toBeGreaterThan(177)
  })
})
