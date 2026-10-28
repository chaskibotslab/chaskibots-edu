import type { ProgramaBloques } from '../bloques/generador'

// Documento de un robot (F2): árbol de piezas encastradas + cables + programa.
// La posición de cada pieza NO se guarda: sale de los montajes (ver
// engine/ensamblaje.ts). Así no puede haber piezas flotando y cambiar una
// rueda no obliga a recalcular nada a mano.

export interface PiezaEnRobot {
  id: string
  /** id en el catálogo */
  pieza: string
  variante?: string
  etiqueta: string
  /** Sin padre = raíz (el chasis). */
  padre?: { instancia: string; montaje: string; giro?: number }
}

export interface Cable {
  de: [string, string]  // [instancia, pin]
  a: [string, string]
  color: string
}

export interface RobotDoc {
  version: 2
  nombre: string
  placa: 'uno'
  piezas: PiezaEnRobot[]
  cables: Cable[]
  /** 'auto' (por defecto): los cables se rehacen solos al cambiar piezas.
   *  'manual': se respetan los del alumno y solo se conectan las piezas nuevas. */
  cableado?: 'auto' | 'manual'
  /** En bloques, `cpp` es el código generado (se rehace al cambiar bloques o cables). */
  programa: { modo: 'codigo'; cpp: string } | { modo: 'bloques'; bloques: ProgramaBloques; cpp: string }
}
