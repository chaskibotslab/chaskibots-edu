/**
 * Guías de armado LEGO EV3 (modelos LDraw empaquetados en public/ldraw).
 *
 * Los datos salen de `guias.generado.ts`, que escribe `scripts/ldraw/modelos.js` junto con
 * los modelos .mpd: así cada paso de la guía coincide siempre con un `0 STEP` del modelo.
 * Para agregar o cambiar un robot se edita modelos.js y se vuelve a ejecutar (ver su README).
 */
import datos from './guias.generado'

export interface PasoGuia {
  /** Pieza del catálogo que el alumno debe elegir (public/ldraw/piezas/<tipo>.mpd). */
  tipo: string
  titulo: string
  info: string
  /** Cuántas piezas iguales se colocan en este paso. */
  piezas: number
}
export interface Guia {
  id: string; nombre: string; emoji: string; descripcion: string; archivo: string; pasos: PasoGuia[]
  /** Tiene ladrillo EV3: se puede elegir en «Programar» para simularlo. */
  simulable: boolean
  /** Pasos de la rueda izquierda y derecha: sirven para hacerlas girar al simular. */
  ruedas: number[]
  /** Sensores de color mirando al piso: posición lateral de cada uno en cm (+ = derecha), de izquierda a derecha. */
  lineas: number[]
  /** Qué sensores lleva, en palabras. */
  equipo: string
}

export const GUIAS: Guia[] = datos

/** El robot que se muestra primero en «Armar» y en «Programar». */
export const GUIA_ROBOT = GUIAS.find(g => g.id === 'explorador') || GUIAS[0]

/** Robots que se pueden simular en «Programar». */
export const ROBOTS_SIMULABLES = GUIAS.filter(g => g.simulable)
