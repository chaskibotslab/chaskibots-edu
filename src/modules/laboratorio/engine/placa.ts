// Todo lo que depende de la placa del robot, en un solo lugar: qué chip se
// emula, con qué se compila, su voltaje lógico, el pin del LED, de dónde
// salen los 5 V / 3,3 V para los sensores y qué pines prefiere el cableado
// automático. El resto del código le pregunta a este archivo.

import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from '../robots/doc'
import type { Chip } from './avrRunner'

export type Placa = 'uno' | 'nano' | 'mega' | 'esp32' | 'pico'

export interface InfoPlaca {
  placa: Placa
  nombre: string
  chip: Chip
  /** Placa que se pide al compilador (ESP32, Pico y Mega se compilan sobre el ATmega2560 con su capa). */
  compilador: Placa
  vLogica: 5 | 3.3
  /** Cómo se llaman sus pines en el código: «5» → D5, GPIO5 o GP5. */
  prefijoPin: 'D' | 'GPIO' | 'GP'
  /** Todos sus pines de salida dan PWM (ESP32, Pico); si no, solo los marcados ~. */
  pwmEnTodos: boolean
  pinLed: string
  /** Pin de la placa que alimenta sensores (5 V en Arduino, 3,3 V en ESP32). */
  alimSensores: string
  /** Pin que alimenta servos (siempre 5 V: en el ESP32, VIN = 5 V del USB). */
  alimServo: string
  /** Pines de la placa que dan alimentación a otras piezas, con su voltaje. */
  fuentes: Record<string, number>
  preferencias: Record<'en' | 'in' | 'lineaDigital' | 'lineaAnalogica' | 'obstaculo' | 'trig' | 'echo' | 'servo' | 'led' | 'boton' | 'buzzer' | 'analogica', string[]>
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
  // Mesa de electrónica: como en el kit de 8vo (LED en D8–D10, pulsador en D2, buzzer en D7).
  led: ['D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D6', 'D5', 'D3', 'D4'],
  boton: ['D2', 'D3', 'D4', 'D12', 'D11', 'D13'],
  buzzer: ['D7', 'D6', 'D5', 'D4', 'D12'],
  analogica: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
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
  led: ['GPIO25', 'GPIO26', 'GPIO27', 'GPIO14', 'GPIO12', 'GPIO13', 'GPIO33'],
  boton: ['GPIO4', 'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19'],
  buzzer: ['GPIO23', 'GPIO22', 'GPIO21'],
  analogica: ['GPIO34', 'GPIO35', 'GPIO32', 'GPIO33', 'GPIO36', 'GPIO39'],
}

// Raspberry Pi Pico: PWM en cualquier GP; ADC solo en GP26–GP28.
const PICO_PREF: InfoPlaca['preferencias'] = {
  en: ['GP14', 'GP15'],
  in: ['GP10', 'GP11', 'GP12', 'GP13', 'GP8', 'GP9'],
  lineaDigital: ['GP2', 'GP3', 'GP4'],
  lineaAnalogica: ['GP26', 'GP27', 'GP28'],
  obstaculo: ['GP2', 'GP3', 'GP4', 'GP5'],
  trig: ['GP6', 'GP20'],
  echo: ['GP7', 'GP21'],
  servo: ['GP16', 'GP17', 'GP18'],
  led: ['GP15', 'GP14', 'GP13', 'GP12', 'GP11', 'GP10', 'GP9'],
  boton: ['GP16', 'GP17', 'GP18', 'GP19', 'GP20'],
  buzzer: ['GP22', 'GP21', 'GP20'],
  analogica: ['GP26', 'GP27', 'GP28'],
}

const ARDUINO_5V = { '5V': 5, '3V3': 3.3 }

const INFO: Record<Placa, InfoPlaca> = {
  uno: {
    placa: 'uno', nombre: 'Arduino UNO', chip: 'atmega328p', compilador: 'uno', vLogica: 5, prefijoPin: 'D', pwmEnTodos: false, pinLed: 'D13',
    alimSensores: '5V', alimServo: '5V', fuentes: ARDUINO_5V, preferencias: ARDUINO_PREF, reservados: ['D0', 'D1'],
  },
  nano: {
    placa: 'nano', nombre: 'Arduino Nano', chip: 'atmega328p', compilador: 'nano', vLogica: 5, prefijoPin: 'D', pwmEnTodos: false, pinLed: 'D13',
    alimSensores: '5V', alimServo: '5V', fuentes: ARDUINO_5V, preferencias: ARDUINO_PREF, reservados: ['D0', 'D1'],
  },
  mega: {
    placa: 'mega', nombre: 'Arduino Mega', chip: 'atmega2560-mega', compilador: 'mega', vLogica: 5, prefijoPin: 'D', pwmEnTodos: false, pinLed: 'D13',
    alimSensores: '5V', alimServo: '5V', fuentes: ARDUINO_5V, preferencias: ARDUINO_PREF, reservados: ['D0', 'D1'],
  },
  esp32: {
    placa: 'esp32', nombre: 'ESP32', chip: 'atmega2560', compilador: 'esp32', vLogica: 3.3, prefijoPin: 'GPIO', pwmEnTodos: true, pinLed: 'GPIO2',
    alimSensores: '3V3', alimServo: 'VIN', fuentes: { '3V3': 3.3, VIN: 5 }, preferencias: ESP32_PREF, reservados: ['GPIO1', 'GPIO3'],
  },
  pico: {
    placa: 'pico', nombre: 'Raspberry Pi Pico', chip: 'atmega2560-pico', compilador: 'pico', vLogica: 3.3, prefijoPin: 'GP', pwmEnTodos: true, pinLed: 'GP25',
    alimSensores: '3V3', alimServo: 'VBUS', fuentes: { '3V3': 3.3, VBUS: 5 }, preferencias: PICO_PREF, reservados: [],
  },
}

/** Datos de una placa por su id ('uno', 'esp32'…). */
export const datosPlaca = (placa: Placa): InfoPlaca => INFO[placa]

/** Instancia de la placa (el «cerebro») del robot. */
export function mcuDe(doc: RobotDoc) {
  return doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'mcu') ?? null
}

export function infoPlaca(doc: RobotDoc): InfoPlaca {
  const m = mcuDe(doc)
  const c = m ? pieza(m.pieza).comportamiento : null
  return INFO[c?.tipo === 'mcu' ? c.placa : 'uno']
}

/** Número de pin para el código: "D5" → "5", "GPIO25" → "25", "GP15" → "15", "A0" → "A0". */
export function pinCodigo(pin: string | null): string {
  if (!pin) return '-1'
  const m = /^(?:GPIO|GP|D)(\d+)$/.exec(pin)
  return m ? m[1] : pin
}
