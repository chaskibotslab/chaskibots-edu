// Calidad gráfica adaptable. Arranca según el equipo (núcleos, memoria,
// pantalla táctil) y luego se ajusta con los cuadros por segundo medidos.
// La física y el resultado de la simulación NUNCA dependen de la calidad.

import { createContext, useContext } from 'react'

export type NivelCalidad = 'alta' | 'media' | 'baja'

export interface Calidad {
  nivel: NivelCalidad
  dpr: [number, number]
  sombras: boolean
  tamSombra: number
  /** Acrílico con transmisión real (caro en GPU) o transparencia simple. */
  transmision: boolean
  segmentos: number
  /** Oclusión ambiental por postprocesado (N8AO). */
  ao: boolean
  /** Antialiasing: SMAA en el postprocesado, MSAA del lienzo o ninguno. */
  aa: 'smaa' | 'msaa' | 'ninguno'
  /** Lado (px) de las texturas procedurales del entorno. */
  texturas: 512 | 1024
}

export const CALIDADES: Record<NivelCalidad, Calidad> = {
  alta: { nivel: 'alta', dpr: [1, 2], sombras: true, tamSombra: 2048, transmision: true, segmentos: 40, ao: true, aa: 'smaa', texturas: 1024 },
  media: { nivel: 'media', dpr: [1, 1.5], sombras: true, tamSombra: 1024, transmision: false, segmentos: 28, ao: true, aa: 'msaa', texturas: 1024 },
  baja: { nivel: 'baja', dpr: [0.75, 1], sombras: false, tamSombra: 512, transmision: false, segmentos: 16, ao: false, aa: 'ninguno', texturas: 512 },
}

export function calidadInicial(): NivelCalidad {
  if (typeof navigator === 'undefined') return 'media'
  const nucleos = navigator.hardwareConcurrency || 4
  const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const tactil = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
  if (nucleos >= 8 && memoria >= 8 && !tactil) return 'alta'
  if (nucleos <= 4 || memoria <= 2) return 'baja'
  return 'media'
}

export const CalidadContexto = createContext<Calidad>(CALIDADES.media)
export const useCalidad = () => useContext(CalidadContexto)
