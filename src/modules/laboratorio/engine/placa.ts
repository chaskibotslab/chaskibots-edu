// Todo lo que depende de la placa del robot, en un solo lugar: qué chip se
// emula, con qué se compila, su voltaje lógico, el pin del LED, de dónde
// salen los 5 V / 3,3 V para los sensores y qué pines prefiere el cableado
// automático. El resto del código le pregunta a este archivo.

import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from '../robots/doc'
import type { Chip } from './avrRunner'

export type Placa = 'uno' | 'nano' | 'esp32'

export interface InfoPlaca {
  placa: Placa
  nombre: string
  chip: Chip
  /** Placa que se pide al compilador (el ESP32 se compila sobre el ATmega2560). */
  compilador: 'uno' | 'nano' | 'esp32'
  vLogica: 5 | 3.3
  pinLed: string
  /** Pin de la placa que alimenta sensores (5 V en Arduino, 3,3 V en ESP32). */
  alimSensores: string
  /** Pin que alimenta servos (siempre 5 V: en el ESP32, VIN = 5 V del USB). */
  alimServo: string
  /** Pines de la placa que dan alimentación a otras piezas. */
  fuentes: string[]
  preferencias: Record<'en' | 'in' | 'lineaDigital' | 'lineaAnalogica' | 'obstaculo' | 'trig' | 'echo' | 'servo', string[]>
  /** Pines que no se usan solos (Serial). */
  reservados: string[]
}

const ARDUINO_PREF: InfoPlaca['preferencias'] = {
  en: ['D5', 'D6', 'D3', 'D11'],
  in: ['D7', 'D8', 'D9', 'D10', 'D4', 'D12', 'D13', 'D2', 'D3', 'D11'],
  lineaDigital: ['D2', 'D3', 'D4', 'D12', 'D13', 'D11'],
  lineaAnalogica: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
  obstaculo: ['D2', 'D3', 'D4', 'D12', 'D13', 'A2', 'A3', 'A4', 'A5'],
  trig: ['D12', 'D4', 'D13', 'A2', 'A3', 'A4'],
  echo: ['D11', 'D2', 'D3', 'D4', 'A3', 'A4', 'A5'],
  servo: ['D3', 'D4', 'D13', 'D11', 'D12', 'A2', 'A3', 'A4', 'A5'],
}

// ESP32 DevKit V1: cualquier GPIO de salida da PWM (LEDC); 34–39 son solo
// entradas; las lecturas analógicas van a los GPIO con ADC (36, 39, 34, 35).
const ESP32_PREF: InfoPlaca['preferencias'] = {
  en: ['GPIO14', 'GPIO32'],
  in: ['GPIO27', 'GPIO26', 'GPIO25', 'GPIO33', 'GPIO13', 'GPIO15'],
  lineaDigital: ['GPIO4', 'GPIO16', 'GPIO17'],
  lineaAnalogica: ['GPIO36', 'GPIO39', 'GPIO34', 'GPIO35'],
  obstaculo: ['GPIO4', 'GPIO16', 'GPIO17', 'GPIO18'],
  trig: ['GPIO5', 'GPIO18'],
  echo: ['GPIO19', 'GPIO21'],
  servo: ['GPIO23', 'GPIO22', 'GPIO13'],
}

const INFO: Record<Placa, InfoPlaca> = {
  uno: {
    placa: 'uno', nombre: 'Arduino UNO', chip: 'atmega328p', compilador: 'uno', vLogica: 5, pinLed: 'D13',
    alimSensores: '5V', alimServo: '5V', fuentes: ['5V', '3V3'], preferencias: ARDUINO_PREF, reservados: ['D0', 'D1'],
  },
  nano: {
    placa: 'nano', nombre: 'Arduino Nano', chip: 'atmega328p', compilador: 'nano', vLogica: 5, pinLed: 'D13',
    alimSensores: '5V', alimServo: '5V', fuentes: ['5V', '3V3'], preferencias: ARDUINO_PREF, reservados: ['D0', 'D1'],
  },
  esp32: {
    placa: 'esp32', nombre: 'ESP32', chip: 'atmega2560', compilador: 'esp32', vLogica: 3.3, pinLed: 'GPIO2',
    alimSensores: '3V3', alimServo: 'VIN', fuentes: ['3V3', 'VIN'], preferencias: ESP32_PREF, reservados: ['GPIO1', 'GPIO3'],
  },
}

/** Instancia de la placa (el «cerebro») del robot. */
export function mcuDe(doc: RobotDoc) {
  return doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'mcu') ?? null
}

export function infoPlaca(doc: RobotDoc): InfoPlaca {
  const m = mcuDe(doc)
  const c = m ? pieza(m.pieza).comportamiento : null
  return INFO[c?.tipo === 'mcu' ? c.placa : 'uno']
}

/** Número de pin para el código: "D5" → "5", "GPIO25" → "25", "A0" → "A0". */
export function pinCodigo(pin: string | null): string {
  if (!pin) return '-1'
  if (pin.startsWith('GPIO')) return pin.slice(4)
  return pin.startsWith('D') ? pin.slice(1) : pin
}
