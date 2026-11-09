// Catálogo de piezas. Para agregar una pieza: escribir su ficha (ver
// ../tipos.ts) en el archivo de su familia y sumarla a la lista de abajo.
// El test catalogo.test.ts revisa que la ficha sea coherente.

import type { Familia, PiezaDef } from '../tipos'
import { ARDUINO_UNO, ARDUINO_NANO, ARDUINO_MEGA, ESP32, RASPBERRY_PICO, RASPBERRY_PI_4, JETSON_NANO } from './placas'
import { CHASIS_2WD, CHASIS_4WD, CHASIS_MINISUMO, PISO_ARRIBA_MINISUMO } from './chasis'
import { MOTOR_TT, RUEDA_65, RUEDA_65_PLASTICO, RUEDA_48, RUEDA_LOCA, MOTOR_N20, RUEDA_34 } from './movimiento'
import { SG90, MG90S } from './servos'
import { TCRT5000, FC51, HCSR04, JOYSTICK, CAMARA_CSI } from './sensores'
import { L298N, TB6612, BATERIA_18650, BATERIA_9V, BATERIA_LIPO_2S } from './electronica'
import { MPU6050, DRV8825 } from './futuras'
import { PROTOBOARD, PIEZAS_CIRCUITO } from './circuito'
import { CHASIS_BATTLEBOT, ARMA_GIRATORIA, CHASIS_TAMBOR, CHASIS_DISCO, MOTOR_COMBATE, RUEDA_COMBATE, ARMA_TAMBOR, ARMA_DISCO } from './combate'

export const LISTA_PIEZAS: PiezaDef[] = [
  CHASIS_2WD, CHASIS_4WD, CHASIS_MINISUMO, PISO_ARRIBA_MINISUMO, CHASIS_BATTLEBOT, CHASIS_TAMBOR, CHASIS_DISCO, PROTOBOARD,
  ARDUINO_UNO, ARDUINO_NANO, ARDUINO_MEGA, ESP32, RASPBERRY_PICO, RASPBERRY_PI_4, JETSON_NANO,
  MOTOR_TT, RUEDA_65, RUEDA_65_PLASTICO, RUEDA_48, RUEDA_LOCA, MOTOR_N20, RUEDA_34, MOTOR_COMBATE, RUEDA_COMBATE,
  SG90, MG90S,
  TCRT5000, FC51, HCSR04, JOYSTICK, CAMARA_CSI, MPU6050,
  L298N, TB6612, BATERIA_18650, BATERIA_9V, BATERIA_LIPO_2S, DRV8825,
  ARMA_GIRATORIA, ARMA_TAMBOR, ARMA_DISCO,
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
