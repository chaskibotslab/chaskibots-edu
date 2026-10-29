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
  /** Mesa elevada: fuera de ella no hay piso (el robot se cae). */
  mesa?: { altura: number }
  /** Dohyo de sumo: plataforma circular negra con borde blanco; su cara de arriba está en y = 0. */
  dohyo?: { radio: number; borde: number; altura: number }
  /** Arena de competencia: reglamento, salidas por ronda y juez (engine/competencia.ts). */
  competencia?: ReglamentoSumo
  /** Mesa de electrónica: cámara de cerca, sin rastro ni controles del robot. */
  banco?: boolean
  /** Zona de llegada (solo visual). */
  meta?: { x: number; z: number; radio: number }
  inicio: Pose2D
}

/** Reglamento de sumo / minisumo (versión de aula: rondas de 60 s). */
export interface ReglamentoSumo {
  tipo: 'sumo'
  categoria: 'minisumo' | 'sumo'
  /** Lado máximo del robot visto desde arriba (mm) y masa máxima (g). */
  maxLadoMm: number
  maxMasaG: number
  /** Segundos que el robot debe esperar quieto al empezar cada ronda. */
  espera: number
  duracionRonda: number
  /** Puntos para ganar el combate (2 de 3). */
  puntosParaGanar: number
  /** Salidas por ronda: [alumno, rival]. */
  salidas: { nombre: string; alumno: Pose2D; rival: Pose2D }[]
}
