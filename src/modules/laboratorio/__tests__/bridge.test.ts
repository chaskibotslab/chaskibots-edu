import { describe, it, expect } from 'vitest'
import {
  pwmToVoltage, l298nChannel, motorTargetOmega, motorStep, MOTOR_TT,
  irDigital, irAnalogVolts, voltsToAdc, hcsr04EchoMicros, servoPulseToAngle,
} from '../engine/bridge'
import { parseIntelHex } from '../engine/hex'

describe('puente pin ↔ física', () => {
  it('PWM 50% → 2,5 V promedio', () => {
    expect(pwmToVoltage(0.5)).toBeCloseTo(2.5)
    expect(pwmToVoltage(128 / 255)).toBeCloseTo(2.51, 1)
    expect(pwmToVoltage(1.2)).toBe(5)
  })

  it('L298N: IN1/IN2 dan el sentido y ENA la velocidad', () => {
    expect(l298nChannel(1, 0, 1, 7.4)).toBeCloseTo(5.4)
    expect(l298nChannel(0, 1, 1, 7.4)).toBeCloseTo(-5.4)
    expect(l298nChannel(1, 0, 0.5, 7.4)).toBeCloseTo(2.7)
    expect(l298nChannel(1, 1, 1, 7.4)).toBe(0) // freno
    expect(l298nChannel(0, 0, 1, 7.4)).toBe(0)
  })

  it('motor TT: velocidad ∝ voltaje, zona muerta e inercia', () => {
    const w6 = motorTargetOmega(6)
    expect(w6).toBeCloseTo((200 * 2 * Math.PI) / 60)
    expect(motorTargetOmega(3)).toBeCloseTo(w6 / 2)
    expect(motorTargetOmega(0.5)).toBe(0)
    expect(motorTargetOmega(-6)).toBeCloseTo(-w6)
    // Tras una constante de tiempo llega al ~63 % de la velocidad final.
    expect(motorStep(0, 6, MOTOR_TT.tau) / w6).toBeCloseTo(1 - Math.exp(-1), 3)
  })

  it('sensor IR: digital ALTO sobre negro, analógico sube con lo oscuro', () => {
    expect(irDigital(0.05)).toBe(true)
    expect(irDigital(0.95)).toBe(false)
    expect(voltsToAdc(irAnalogVolts(0))).toBeGreaterThan(950)
    expect(voltsToAdc(irAnalogVolts(1))).toBeLessThan(60)
  })

  it('ADC: 0–5 V → 0–1023', () => {
    expect(voltsToAdc(0)).toBe(0)
    expect(voltsToAdc(2.5)).toBe(512)
    expect(voltsToAdc(5)).toBe(1023)
    expect(voltsToAdc(7)).toBe(1023)
  })

  it('HC-SR04: eco a 20 cm = 1160 µs; sin obstáculo, pulso largo', () => {
    expect(hcsr04EchoMicros(20)).toBe(1160)
    expect(hcsr04EchoMicros(500)).toBe(38000)
    expect(hcsr04EchoMicros(null)).toBe(38000)
  })

  it('servo: pulsos de la librería Servo → ángulo', () => {
    expect(servoPulseToAngle(0.544)).toBeCloseTo(0)
    expect(servoPulseToAngle(1.472)).toBeCloseTo(90)
    expect(servoPulseToAngle(2.4)).toBeCloseTo(180)
  })
})

describe('Intel HEX', () => {
  it('carga datos y detecta checksums malos', () => {
    const flash = parseIntelHex(':0400000001020304F2\n:00000001FF\n', 16)
    expect(Array.from(flash.slice(0, 4))).toEqual([1, 2, 3, 4])
    expect(() => parseIntelHex(':0400000001020304F3\n', 16)).toThrow(/Checksum/)
  })
})
