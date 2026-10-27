// Arenas: dónde se prueba el robot. Cada arena define su piso (material y lo
// que ven los sensores de línea), los objetos con los que se puede chocar y
// dónde arranca el robot. Unidades: metros (mundo), con y hacia arriba.

import type { MaterialFisico } from '../catalogo/tipos'
import type { Pista, Pose2D } from '../engine/tracks'

export interface ObjetoArena {
  id: string
  forma: 'caja' | 'cilindro'
  /** caja: [largo x, alto y, ancho z]; cilindro: [radio, alto, radio] (m) */
  medidas: [number, number, number]
  /** Centro de la base, sobre el piso (m). */
  x: number
  z: number
  yaw?: number
  color: string
  material: MaterialFisico
  /** Si tiene masa, se puede empujar (si no, es fijo). */
  masaKg?: number
}

export interface ArenaDef {
  id: string
  nombre: string
  descripcion: string
  ancho: number   // x (m)
  largo: number   // z (m)
  piso: {
    material: MaterialFisico
    color: string
    /** Reflectancia uniforme (0 negro – 1 blanco) si no hay pista dibujada. */
    reflectancia: number
  }
  /** Pista dibujada (seguidor de línea): textura del piso y lo que leen los sensores. */
  pista?: Pista
  objetos: ObjetoArena[]
  /** Paredes alrededor del borde. */
  paredes: boolean
  inicio: Pose2D
}
