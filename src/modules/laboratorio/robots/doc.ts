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
  programa: { modo: 'codigo'; cpp: string }
}
