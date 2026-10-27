// Emulación REAL de un ATmega328P (Arduino UNO / Nano) con avr8js.
//
// Importante: aquí NO se interpreta el código del estudiante. El servicio
// compilador lo convierte con avr-gcc en el mismo binario (.hex) que se
// grabaría en la placa, y este archivo lo ejecuta instrucción por instrucción
// en un CPU AVR emulado. Por eso delay(), millis(), analogWrite() o las
// interrupciones se comportan igual que en el hardware: los genera el mismo
// código del core de Arduino corriendo sobre timers emulados.
//
// Esta clase no sabe nada del navegador: se usa dentro de un Web Worker
// (avr.worker.ts) y también en los tests con Node.

import {
  CPU, avrInstruction, AVRTimer, timer0Config, timer1Config, timer2Config,
  AVRIOPort, portBConfig, portCConfig, portDConfig, AVRUSART, usart0Config,
  AVRADC, adcConfig, PinState,
} from 'avr8js'
import { parseIntelHex } from './hex'

export const CPU_FREQ_HZ = 16_000_000

// Pines del UNO/Nano → (puerto, bit) del ATmega328P.
//   D0–D7  = PORTD 0–7
//   D8–D13 = PORTB 0–5
//   A0–A5  = PORTC 0–5 (también son D14–D19)
export type PortName = 'B' | 'C' | 'D'
export const UNO_PINS: Record<string, { port: PortName; bit: number }> = {}
for (let i = 0; i < 8; i++) UNO_PINS[`D${i}`] = { port: 'D', bit: i }
for (let i = 8; i < 14; i++) UNO_PINS[`D${i}`] = { port: 'B', bit: i - 8 }
for (let i = 0; i < 6; i++) UNO_PINS[`A${i}`] = { port: 'C', bit: i }

export type PinMode = 'output' | 'input' | 'input_pullup'

export interface PinReport {
  mode: PinMode
  level: 0 | 1      // nivel al final del paso
  duty: number      // fracción del tiempo en ALTO durante el paso (0–1) → PWM
  freqHz: number    // flancos de subida por segundo (0 si es fijo)
  pulsoUs: number   // ancho del último pulso en ALTO terminado (µs): servos
}

export interface StepResult {
  cycles: number                       // ciclos realmente ejecutados
  totalCycles: number                  // ciclos desde el arranque
  pins: Record<string, PinReport>
  serial: number[]                     // bytes que el sketch envió por Serial
}

/** Callback de flanco (lo usarán HC-SR04 y servo en F2): pin, nivel, ciclo exacto. */
export type EdgeListener = (pin: string, level: 0 | 1, cycle: number) => void

interface PinTrack {
  name: string
  level: 0 | 1
  lastChange: number
  highAcc: number
  rises: number
  lastRise: number
  lastPulse: number
}

export class AvrRunner {
  readonly cpu: CPU
  private readonly ports: Record<PortName, AVRIOPort>
  private readonly usart: AVRUSART
  private readonly adc: AVRADC
  private readonly tracks: Record<PortName, (PinTrack | null)[]>
  private serialOut: number[] = []
  private serialIn: number[] = []
  private edgeListeners: EdgeListener[] = []

  constructor(hex: string) {
    // 32 KB de flash. avr8js la quiere como palabras de 16 bits.
    const flash = parseIntelHex(hex, 0x8000)
    this.cpu = new CPU(new Uint16Array(flash.buffer))

    // Timers: Timer0 da millis()/delay() y el PWM de D5/D6; Timer1 el de D9/D10;
    // Timer2 el de D3/D11 (y tone()). Sin ellos, analogWrite no haría nada.
    new AVRTimer(this.cpu, timer0Config)
    new AVRTimer(this.cpu, timer1Config)
    new AVRTimer(this.cpu, timer2Config)

    this.ports = {
      B: new AVRIOPort(this.cpu, portBConfig),
      C: new AVRIOPort(this.cpu, portCConfig),
      D: new AVRIOPort(this.cpu, portDConfig),
    }

    // Serial: cada byte que transmite el USART va al monitor serial.
    this.usart = new AVRUSART(this.cpu, usart0Config, CPU_FREQ_HZ)
    this.usart.onByteTransmit = (b: number) => { this.serialOut.push(b) }

    // ADC: analogRead lee el voltaje que inyectamos en channelValues.
    this.adc = new AVRADC(this.cpu, adcConfig)

    // Seguimiento de cada pin para medir PWM: guardamos el ciclo exacto de
    // cada cambio y sumamos cuánto tiempo estuvo en ALTO.
    this.tracks = { B: [], C: [], D: [] }
    for (const [name, { port, bit }] of Object.entries(UNO_PINS)) {
      this.tracks[port][bit] = { name, level: 0, lastChange: 0, highAcc: 0, rises: 0, lastRise: 0, lastPulse: 0 }
    }
    for (const p of ['B', 'C', 'D'] as PortName[]) {
      this.ports[p].addListener((value, oldValue) => this.onPortWrite(p, value, oldValue))
    }
  }

  private onPortWrite(port: PortName, value: number, oldValue: number) {
    const changed = value ^ oldValue
    if (!changed) return
    const now = this.cpu.cycles
    for (let bit = 0; bit < 8; bit++) {
      if (!(changed & (1 << bit))) continue
      const t = this.tracks[port][bit]
      if (!t) continue
      if (t.level) t.highAcc += now - t.lastChange
      t.level = value & (1 << bit) ? 1 : 0
      t.lastChange = now
      if (t.level) { t.rises++; t.lastRise = now } else if (t.lastRise) t.lastPulse = now - t.lastRise
      for (const l of this.edgeListeners) l(t.name, t.level, now)
    }
  }

  onEdge(listener: EdgeListener) { this.edgeListeners.push(listener) }

  /** Nivel que un sensor externo pone en un pin de entrada (digitalRead lo verá). */
  setDigitalInput(pin: string, high: boolean) {
    const p = UNO_PINS[pin]
    if (p) this.ports[p.port].setPin(p.bit, high)
  }

  /** Voltaje que ve analogRead en A0–A5 (0–5 V → 0–1023). */
  setAnalogInput(pin: string, volts: number) {
    const m = /^A(\d)$/.exec(pin)
    if (m) this.adc.channelValues[Number(m[1])] = volts
  }

  /** Texto que el estudiante envía desde el monitor serial. */
  serialWrite(text: string) {
    for (const ch of Array.from(new TextEncoder().encode(text))) this.serialIn.push(ch)
    // Si el sketch no llama a Serial.begin nadie lee: no acumulamos sin límite.
    if (this.serialIn.length > 256) this.serialIn.splice(0, this.serialIn.length - 256)
  }

  pinMode(pin: string): PinMode {
    const p = UNO_PINS[pin]
    const s = this.ports[p.port].pinState(p.bit)
    if (s === PinState.Input) return 'input'
    if (s === PinState.InputPullUp) return 'input_pullup'
    return 'output'
  }

  /** Ejecuta `cycles` ciclos de CPU (16 000 000 = 1 segundo de tiempo simulado). */
  run(cycles: number): StepResult {
    const cpu = this.cpu
    const start = cpu.cycles
    const end = start + Math.max(0, Math.floor(cycles))

    // Corremos en tramos de ~1000 ciclos para poder meter los bytes que
    // llegan por Serial a la velocidad que el USART los acepta.
    while (cpu.cycles < end) {
      const chunkEnd = Math.min(end, cpu.cycles + 1000)
      while (cpu.cycles < chunkEnd) {
        avrInstruction(cpu)
        cpu.tick()
      }
      if (this.serialIn.length && this.usart.writeByte(this.serialIn[0])) this.serialIn.shift()
    }

    const ran = cpu.cycles - start
    const pins: Record<string, PinReport> = {}
    for (const p of ['B', 'C', 'D'] as PortName[]) {
      for (const t of this.tracks[p]) {
        if (!t) continue
        if (t.level) t.highAcc += cpu.cycles - t.lastChange
        t.lastChange = cpu.cycles
        pins[t.name] = {
          mode: this.pinMode(t.name),
          level: t.level,
          duty: ran > 0 ? t.highAcc / ran : t.level,
          freqHz: ran > 0 ? (t.rises * CPU_FREQ_HZ) / ran : 0,
          pulsoUs: (t.lastPulse * 1e6) / CPU_FREQ_HZ,
        }
        t.highAcc = 0
        t.rises = 0
      }
    }
    const serial = this.serialOut
    this.serialOut = []
    return { cycles: ran, totalCycles: cpu.cycles, pins, serial }
  }
}
