// Catálogo de piezas. Para agregar una pieza: escribir su ficha (ver
// ../tipos.ts) en el archivo de su familia y sumarla a la lista de abajo.
// El test catalogo.test.ts revisa que la ficha sea coherente.

import type { Familia, PiezaDef } from '../tipos'
import { ARDUINO_UNO, ARDUINO_NANO, ESP32 } from './placas'
import { CHASIS_2WD, CHASIS_4WD, CHASIS_MINISUMO } from './chasis'
import { MOTOR_TT, RUEDA_65, RUEDA_65_PLASTICO, RUEDA_48, RUEDA_LOCA, MOTOR_N20, RUEDA_34 } from './movimiento'
import { SG90, MG90S } from './servos'
import { TCRT5000, FC51, HCSR04 } from './sensores'
import { L298N, TB6612, BATERIA_18650, BATERIA_9V, BATERIA_LIPO_2S } from './electronica'
import { JOYSTICK, MPU6050, DRV8825 } from './futuras'
import { PROTOBOARD, PIEZAS_CIRCUITO } from './circuito'

export const LISTA_PIEZAS: PiezaDef[] = [
  CHASIS_2WD, CHASIS_4WD, CHASIS_MINISUMO, PROTOBOARD,
  ARDUINO_UNO, ARDUINO_NANO, ESP32,
  MOTOR_TT, RUEDA_65, RUEDA_65_PLASTICO, RUEDA_48, RUEDA_LOCA, MOTOR_N20, RUEDA_34,
  SG90, MG90S,
  TCRT5000, FC51, HCSR04, JOYSTICK, MPU6050,
  L298N, TB6612, BATERIA_18650, BATERIA_9V, BATERIA_LIPO_2S, DRV8825,
  ...PIEZAS_CIRCUITO,
]

export const PIEZAS: Record<string, PiezaDef> = Object.fromEntries(LISTA_PIEZAS.map(p => [p.id, p]))

export function pieza(id: string): PiezaDef {
  const p = PIEZAS[id]
  if (!p) throw new Error(`Pieza desconocida en el catálogo: ${id}`)
  return p
}

export function piezasDe(familia: Familia): PiezaDef[] {
  return LISTA_PIEZAS.filter(p => p.familia === familia)
}

/** Masa, material y color de una pieza según la variante elegida. */
export function datosVariante(p: PiezaDef, variante?: string) {
  const v = p.variantes?.find(x => x.id === variante) ?? p.variantes?.[0]
  return {
    masa_g: v?.masa_g ?? p.masa_g,
    material: v?.material ?? p.material,
    color: v?.color ?? p.color,
    nombre: v ? `${p.nombre} (${v.nombre})` : p.nombre,
  }
}
