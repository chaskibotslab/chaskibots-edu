// ESP32 simulado: el sketch (fixtures/fuentes/esp32prueba.ino) se preparó con
// la capa ESP32 y se compiló para ATmega2560 con arduino-cli.
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AvrRunner, CPU_FREQ_HZ } from '../engine/avrRunner'
import { servoPulseToAngle } from '../engine/bridge'
import { prepararSketchEsp32 } from '../esp32/capaEsp32'

const hex = () => fs.readFileSync(path.join(__dirname, 'fixtures', 'esp32prueba.hex'), 'utf8')
const texto = (b: number[]) => String.fromCharCode(...b)

describe('ESP32 simulado (capa ESP32 sobre ATmega2560)', () => {
  it('arranca, imprime por Serial y respeta los tiempos de delay()', () => {
    const avr = new AvrRunner(hex(), 'atmega2560')
    const r = avr.run(CPU_FREQ_HZ * 1.05)
    const t = texto(r.serial)
    expect(t).toContain('ESP32 listo')
    const lecturas = t.split(/\r?\n/).filter(l => /^\d+$/.test(l))
    expect(lecturas.length).toBeGreaterThanOrEqual(9)   // un println cada 100 ms
    expect(lecturas.length).toBeLessThanOrEqual(11)
  }, 60_000)

  it('analogRead da 12 bits (3,3 V → ~4095, 1,65 V → ~2048)', () => {
    const avr = new AvrRunner(hex(), 'atmega2560')
    avr.setAnalogInput('GPIO34', 1.65)
    const medio = texto(avr.run(CPU_FREQ_HZ * 0.35).serial).split(/\r?\n/).filter(l => /^\d+$/.test(l)).map(Number)
    expect(medio.at(-1)!).toBeGreaterThan(1990)
    expect(medio.at(-1)!).toBeLessThan(2110)
    avr.setAnalogInput('GPIO34', 3.3)
    const alto = texto(avr.run(CPU_FREQ_HZ * 0.25).serial).split(/\r?\n/).filter(l => /^\d+$/.test(l)).map(Number)
    expect(alto.at(-1)!).toBeGreaterThan(4000)
  }, 60_000)

  it('ledcWrite da PWM en cualquier GPIO y el servo llega al ángulo pedido', () => {
    const avr = new AvrRunner(hex(), 'atmega2560')
    avr.run(CPU_FREQ_HZ * 0.2)
    const r = avr.run(CPU_FREQ_HZ * 0.1)
    expect(r.pins.GPIO25.duty).toBeCloseTo(128 / 255, 2)
    expect(r.pins.GPIO25.mode).toBe('output')
    expect(servoPulseToAngle(r.pins.GPIO13.pulsoUs / 1000)).toBeCloseTo(45, -1)
  }, 60_000)

  it('los GPIO digitales funcionan con la numeración del ESP32', () => {
    const avr = new AvrRunner(hex(), 'atmega2560')
    avr.setDigitalInput('GPIO4', true)
    expect(avr.run(CPU_FREQ_HZ * 0.15).pins.GPIO2.level).toBe(1)
    avr.setDigitalInput('GPIO4', false)
    expect(avr.run(CPU_FREQ_HZ * 0.15).pins.GPIO2.level).toBe(0)
  }, 60_000)

  it('la capa solo usa librerías que el compilador permite', () => {
    // Lista blanca de services/lab-compiler/server.js
    const permitidas = new Set(['Arduino.h', 'avr/io.h', 'avr/interrupt.h', 'avr/pgmspace.h', 'util/delay.h', 'stdint.h', 'stdlib.h', 'string.h', 'math.h', 'EEPROM.h', 'SPI.h', 'Wire.h', 'SoftwareSerial.h', 'Servo.h', 'NewPing.h', 'DHT.h', 'DHT_U.h', 'Adafruit_Sensor.h', 'Adafruit_GFX.h', 'Adafruit_SSD1306.h', 'Adafruit_I2CDevice.h'])
    const { codigo } = prepararSketchEsp32('#include <ESP32Servo.h>\n#include <BluetoothSerial.h>\n#include <WiFi.h>\nvoid setup(){}\nvoid loop(){}')
    const incluidas = Array.from(codigo.matchAll(/^\s*#\s*include\s*<([^>]+)>/gm)).map(m => m[1])
    for (const i of incluidas) expect(permitidas.has(i), i).toBe(true)
  })

  it('la capa quita las librerías que reemplaza y avisa las que no hay', () => {
    const ok = prepararSketchEsp32('#include <WiFi.h>\n#include <ESP32Servo.h>\nvoid setup(){}\nvoid loop(){}')
    expect(ok.error).toBeUndefined()
    expect(ok.codigo).toContain('#line 1 "sketch.ino"')
    expect(ok.codigo).toContain('// #include <WiFi.h>  (lo provee el simulador)')
    expect(prepararSketchEsp32('#include <WebServer.h>\nvoid setup(){}').error).toMatch(/WebServer/)
  })
})
