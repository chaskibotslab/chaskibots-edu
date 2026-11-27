// Módulos inalámbricos de cable serie (HC-05, HC-06, HC-12): ¿están bien
// conectados para que las órdenes del mando lleguen al programa?
// TXD del módulo → RX de la placa; RXD del módulo → TX de la placa (cruzados).

import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from '../robots/doc'
import { nets } from './plan'
import { infoPlaca, mcuDe } from './placa'

/** Pines del puerto serie de la placa donde va un módulo de radio (solo las placas Arduino). */
export const SERIE_PLACA: Partial<Record<string, { rx: string; tx: string }>> = {
  uno: { rx: 'D0', tx: 'D1' },
  nano: { rx: 'D0', tx: 'D1' },
  mega: { rx: 'D0', tx: 'D1' },
}

export interface EstadoRadio {
  instancia: string
  nombre: string
  /** Bluetooth, 433 MHz… */
  radio: string
  /** Las órdenes llegan al programa. */
  listo: boolean
  /** Qué falta, en palabras para el alumno. */
  problema?: string
}

/** Estado del primer módulo de radio del robot, o null si no tiene ninguno. */
export function estadoRadio(doc: RobotDoc): EstadoRadio | null {
  const inst = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'radio-serie')
  if (!inst) return null
  const def = pieza(inst.pieza)
  const c = def.comportamiento
  if (c.tipo !== 'radio-serie') return null
  const corto = def.nombre.replace(/^Módulo (Bluetooth |de radio )?/, '').replace(/ \(.*$/, '')
  const estado = (problema?: string): EstadoRadio => ({ instancia: inst.id, nombre: corto, radio: c.radio, listo: !problema, problema })
  const mcu = mcuDe(doc)
  if (!mcu) return estado('Falta la placa.')
  const info = infoPlaca(doc)
  const serie = SERIE_PLACA[info.placa]
  if (!serie) return estado(info.placa === 'esp32' ? 'El ESP32 ya trae Bluetooth: no necesita este módulo.' : `En el laboratorio el ${corto} funciona con Arduino UNO, Nano y Mega.`)
  const n = nets(doc)
  const unidos = (a: string, b: string) => { const x = n.get(a), y = n.get(b); return !!x && x === y }
  const k = (i: string, p: string) => `${i}.${p}`
  const tx = k(inst.id, 'TXD'), rxd = k(inst.id, 'RXD')
  if (unidos(tx, k(mcu.id, serie.tx)) || unidos(rxd, k(mcu.id, serie.rx))) return estado(`Los cables van cruzados: TXD del ${corto} va al RX (${serie.rx}) de la placa, y RXD al TX (${serie.tx}).`)
  if (!unidos(tx, k(mcu.id, serie.rx))) return estado(`Conecta TXD del ${corto} al RX de la placa (${serie.rx}): por ahí le llegan las órdenes.`)
  const alimentado = Object.keys(info.fuentes).some(f => unidos(k(inst.id, 'VCC'), k(mcu.id, f)))
  if (!alimentado || !unidos(k(inst.id, 'GND'), k(mcu.id, 'GND'))) return estado(`El ${corto} no tiene alimentación: conecta VCC a 5 V y GND a tierra.`)
  const baud = /\bSerial\.begin\s*\(\s*(\d+)/.exec(doc.programa.cpp.replace(/\/\/.*$/gm, ''))
  if (baud && Number(baud[1]) !== c.baudios) return estado(`El ${corto} habla a ${c.baudios} baudios: en tu programa usa Serial.begin(${c.baudios}), no ${baud[1]}.`)
  return estado()
}
