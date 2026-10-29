// Emulación REAL de un AVR con avr8js: ATmega328P (Arduino UNO / Nano) o
// ATmega2560 (base del ESP32 simulado, ver esp32/capaEsp32.ts).
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
  AVRIOPort, portAConfig, portBConfig, portCConfig, portDConfig, portEConfig, portFConfig, portGConfig,
  portHConfig, portJConfig, portKConfig, portLConfig, AVRUSART, usart0Config,
  AVRADC, adcConfig, PinState, type AVRPortConfig,
} from 'avr8js'
import { parseIntelHex } from './hex'

export const CPU_FREQ_HZ = 16_000_000

export type Chip = 'atmega328p' | 'atmega2560'
export type PortName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'J' | 'K' | 'L'

// Pines del UNO/Nano → (puerto, bit) del ATmega328P.
//   D0–D7  = PORTD 0–7
//   D8–D13 = PORTB 0–5
//   A0–A5  = PORTC 0–5 (también son D14–D19)
export const UNO_PINS: Record<string, { port: PortName; bit: number }> = {}
for (let i = 0; i < 8; i++) UNO_PINS[`D${i}`] = { port: 'D', bit: i }
for (let i = 8; i < 14; i++) UNO_PINS[`D${i}`] = { port: 'B', bit: i - 8 }
for (let i = 0; i < 6; i++) UNO_PINS[`A${i}`] = { port: 'C', bit: i }

// ATmega2560 (pinout del Arduino Mega). En el ESP32 simulado cada GPIOn del
// ESP32 es el pin n del Mega, así que aquí se nombran «GPIOn».
const MEGA: [PortName, number][] = [
  ['E', 0], ['E', 1], ['E', 4], ['E', 5], ['G', 5], ['E', 3], ['H', 3], ['H', 4], ['H', 5], ['H', 6],
  ['B', 4], ['B', 5], ['B', 6], ['B', 7], ['J', 1], ['J', 0], ['H', 1], ['H', 0], ['D', 3], ['D', 2],
  ['D', 1], ['D', 0], ['A', 0], ['A', 1], ['A', 2], ['A', 3], ['A', 4], ['A', 5], ['A', 6], ['A', 7],
  ['C', 7], ['C', 6], ['C', 5], ['C', 4], ['C', 3], ['C', 2], ['C', 1], ['C', 0], ['D', 7], ['G', 2],
  ['G', 1], ['G', 0], ['L', 7], ['L', 6], ['L', 5], ['L', 4], ['L', 3], ['L', 2], ['L', 1], ['L', 0],
  ['B', 3], ['B', 2], ['B', 1], ['B', 0],
]
export const ESP32_PINS: Record<string, { port: PortName; bit: number }> = {}
MEGA.forEach(([port, bit], n) => { ESP32_PINS[`GPIO${n}`] = { port, bit } })

/** GPIO analógicos del ESP32 → canal del ADC del Mega (A0–A7). Igual que en la capa C++. */
export const ESP32_ADC: Record<string, number> = { GPIO36: 0, GPIO39: 1, GPIO34: 2, GPIO35: 3, GPIO32: 4, GPIO33: 5, GPIO25: 6, GPIO26: 7 }

// En el ATmega2560 los vectores de interrupción están en otras direcciones
// (vector n → dirección 2n): se ajustan las configuraciones de avr8js.
const timer0Mega = { ...timer0Config, compAInterrupt: 42, compBInterrupt: 44, ovfInterrupt: 46 }
const usart0Mega = { ...usart0Config, rxCompleteInterrupt: 50, dataRegisterEmptyInterrupt: 52, txCompleteInterrupt: 54 }
const adcMega = { ...adcConfig, adcInterrupt: 58 }

// Canal de la capa ESP32 hacia el simulador: registros de uso general del AVR.
// La capa escribe pin (GPIOR1) y valor (GPIOR2) y luego el comando (GPIOR0).
const GPIOR0 = 0x3e, GPIOR1 = 0x4a, GPIOR2 = 0x4b
const CMD_PWM = 1      // valor = ciclo de trabajo 0–255 (ledcWrite / analogWrite)
const CMD_SERVO = 2    // valor = ancho de pulso / 10 µs

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

/** Callback de flanco (HC-SR04): pin, nivel, ciclo exacto. */
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
  readonly chip: Chip
  private readonly pinMap: Record<string, { port: PortName; bit: number }>
  private readonly ports: Partial<Record<PortName, AVRIOPort>> = {}
  private readonly usart: AVRUSART
  private readonly adc: AVRADC
  private readonly tracks: Partial<Record<PortName, (PinTrack | null)[]>> = {}
  private serialOut: number[] = []
  private serialIn: number[] = []
  private edgeListeners: EdgeListener[] = []
  /** PWM y servos que informa la capa ESP32 (pin → valor). */
  private pwmCapa = new Map<string, number>()
  private servoCapa = new Map<string, number>()
  /** Entradas que dependen del pull-up interno: [sin pull-up, con pull-up]. */
  private dobles = new Map<string, [boolean, boolean]>()

  constructor(hex: string, chip: Chip = 'atmega328p') {
    this.chip = chip
    const mega = chip === 'atmega2560'
    // Flash: 32 KB (328P) o 256 KB (2560). avr8js la quiere como palabras de 16 bits.
    const flash = parseIntelHex(hex, mega ? 0x40000 : 0x8000)
    // En el 2560 la RAM va de 0x200 a 0x21FF (hay más registros de E/S abajo):
    // avr8js suma 0x100 de registros, así que hacen falta 0x2100 bytes.
    this.cpu = new CPU(new Uint16Array(flash.buffer), mega ? 0x2100 : 2048)
    this.pinMap = mega ? ESP32_PINS : UNO_PINS

    // Timers: Timer0 da millis()/delay() y el PWM de D5/D6; Timer1 el de D9/D10;
    // Timer2 el de D3/D11 (y tone()). Sin ellos, analogWrite no haría nada.
    // En el 2560 basta Timer0 (el PWM y los servos los informa la capa ESP32).
    if (mega) {
      new AVRTimer(this.cpu, timer0Mega)
    } else {
      new AVRTimer(this.cpu, timer0Config)
      new AVRTimer(this.cpu, timer1Config)
      new AVRTimer(this.cpu, timer2Config)
    }

    const configs: Partial<Record<PortName, AVRPortConfig>> = mega
      ? { A: portAConfig, B: portBConfig, C: portCConfig, D: portDConfig, E: portEConfig, F: portFConfig, G: portGConfig, H: portHConfig, J: portJConfig, K: portKConfig, L: portLConfig }
      : { B: portBConfig, C: portCConfig, D: portDConfig }
    for (const [p, cfg] of Object.entries(configs) as [PortName, AVRPortConfig][]) this.ports[p] = new AVRIOPort(this.cpu, cfg)
    // avr8js no aplica el pull-up interno al leer una entrada: cuando el sketch
    // cambia DDR o PORT (pinMode), se vuelve a poner el nivel que corresponde.
    for (const [p, cfg] of Object.entries(configs) as [PortName, AVRPortConfig][]) {
      for (const dir of [cfg.DDR, cfg.PORT]) {
        const original = this.cpu.writeHooks[dir]
        this.cpu.writeHooks[dir] = (...args) => {
          const r = original(...args)
          if (this.dobles.size) this.reaplicar(p)
          return r
        }
      }
    }

    // Serial: cada byte que transmite el USART va al monitor serial.
    this.usart = new AVRUSART(this.cpu, mega ? usart0Mega : usart0Config, CPU_FREQ_HZ)
    this.usart.onByteTransmit = (b: number) => { this.serialOut.push(b) }

    // ADC: analogRead lee el voltaje que inyectamos en channelValues.
    this.adc = new AVRADC(this.cpu, mega ? adcMega : adcConfig)

    // Seguimiento de cada pin para medir PWM: guardamos el ciclo exacto de
    // cada cambio y sumamos cuánto tiempo estuvo en ALTO.
    for (const [name, { port, bit }] of Object.entries(this.pinMap)) {
      const lista = (this.tracks[port] ??= [])
      lista[bit] = { name, level: 0, lastChange: 0, highAcc: 0, rises: 0, lastRise: 0, lastPulse: 0 }
    }
    for (const p of Object.keys(this.ports) as PortName[]) {
      this.ports[p]!.addListener((value, oldValue) => this.onPortWrite(p, value, oldValue))
    }

    if (mega) {
      // La capa ESP32 escribe pin y valor y, al escribir el comando, se aplica.
      this.cpu.writeHooks[GPIOR0] = cmd => {
        const pin = `GPIO${this.cpu.data[GPIOR1]}`
        const valor = this.cpu.data[GPIOR2]
        if (cmd === CMD_PWM) this.pwmCapa.set(pin, valor / 255)
        else if (cmd === CMD_SERVO) this.servoCapa.set(pin, valor * 10)
        return false
      }
    }
  }

  private onPortWrite(port: PortName, value: number, oldValue: number) {
    const changed = value ^ oldValue
    if (!changed) return
    const now = this.cpu.cycles
    for (let bit = 0; bit < 8; bit++) {
      if (!(changed & (1 << bit))) continue
      const t = this.tracks[port]?.[bit]
      if (!t) continue
      if (t.level) t.highAcc += now - t.lastChange
      t.level = value & (1 << bit) ? 1 : 0
      t.lastChange = now
      if (t.level) { t.rises++; t.lastRise = now } else if (t.lastRise) t.lastPulse = now - t.lastRise
      // Un digitalWrite sobre un pin con PWM de la capa ESP32 lo vuelve digital.
      this.pwmCapa.delete(t.name)
      for (const l of this.edgeListeners) l(t.name, t.level, now)
    }
  }

  onEdge(listener: EdgeListener) { this.edgeListeners.push(listener) }

  /** Nivel que un sensor externo pone en un pin de entrada (digitalRead lo verá). */
  setDigitalInput(pin: string, high: boolean) {
    const p = this.pinMap[pin]
    if (p) this.ports[p.port]!.setPin(p.bit, high)
  }

  /**
   * Entrada de un circuito (pulsador, pin al aire): el nivel depende de si el
   * pin tiene el pull-up interno activado (INPUT_PULLUP) en el momento de leer.
   */
  setDigitalInputDoble(pin: string, sinPullup: boolean, conPullup: boolean) {
    if (!this.pinMap[pin]) return
    this.dobles.set(pin, [sinPullup, conPullup])
    this.aplicarDoble(pin)
  }

  private aplicarDoble(pin: string) {
    const v = this.dobles.get(pin)
    const p = this.pinMap[pin]
    if (!v || !p) return
    const puerto = this.ports[p.port]!
    puerto.setPin(p.bit, puerto.pinState(p.bit) === PinState.InputPullUp ? v[1] : v[0])
  }

  private reaplicar(puerto: PortName) {
    this.dobles.forEach((_, pin) => { if (this.pinMap[pin].port === puerto) this.aplicarDoble(pin) })
  }

  /**
   * Voltaje que ve analogRead. UNO/Nano: A0–A7 con 0–5 V → 0–1023.
   * ESP32: GPIO analógicos con 0–3,3 V; la capa multiplica por 4 (12 bits),
   * así que 3,3 V se inyectan como 5 V para que dé 4092 ≈ 4095.
   */
  setAnalogInput(pin: string, volts: number) {
    if (this.chip === 'atmega2560') {
      const c = ESP32_ADC[pin]
      if (c !== undefined) this.adc.channelValues[c] = Math.min(5, (volts * 5) / 3.3)
      return
    }
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
    const p = this.pinMap[pin]
    const s = this.ports[p.port]!.pinState(p.bit)
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
    for (const p of Object.keys(this.tracks) as PortName[]) {
      for (const t of this.tracks[p]!) {
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
    // PWM y servos de la capa ESP32 (en el ESP32 real los genera el hardware LEDC).
    this.pwmCapa.forEach((duty, name) => {
      const r = pins[name]
      if (r) pins[name] = { ...r, mode: 'output', duty, level: duty > 0 ? 1 : 0, freqHz: duty > 0 && duty < 1 ? 5000 : 0 }
    })
    this.servoCapa.forEach((us, name) => {
      const r = pins[name]
      if (r) pins[name] = { ...r, mode: 'output', pulsoUs: us, freqHz: 50 }
    })
    const serial = this.serialOut
    this.serialOut = []
    return { cycles: ran, totalCycles: cpu.cycles, pins, serial }
  }
}
