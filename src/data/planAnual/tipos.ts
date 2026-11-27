// Plan del año de un curso de Academia: clase por clase, con qué se trabaja y qué se entrega.
// Se muestra en la pestaña «Plan del Año» de /academia/[colegio]/[kit].

export type TipoClase = 'kit' | 'simulador' | 'sin-pantalla' | 'proyecto' | 'evaluacion'

export interface ClasePlan {
  n: number
  titulo: string
  tipo: TipoClase
  /** Con qué se trabaja y dónde está: kit y lección, o simulador y actividad exacta. */
  herramienta: string
  objetivo: string
  /** Qué se hace en la clase, en orden. */
  pasos: string[]
  /** Qué queda al terminar: lo que el docente puede revisar o calificar. */
  evidencia: string
}

export interface TrimestrePlan {
  titulo: string
  proposito: string
  clases: ClasePlan[]
}

export interface PlanAnual {
  grado: string
  /** Minutos por clase para los que está pensado el plan. */
  minutos: number
  resumen: string
  /** Cómo se trabaja con este grupo (lectura, turnos, proyección…). */
  comoTrabajar: string[]
  trimestres: TrimestrePlan[]
}

type Fila = [titulo: string, tipo: TipoClase, herramienta: string, objetivo: string, pasos: string[], evidencia: string]

/** Arma un trimestre numerando las clases a partir de `desde`. */
export function trimestre(titulo: string, proposito: string, desde: number, filas: Fila[]): TrimestrePlan {
  return {
    titulo,
    proposito,
    clases: filas.map(([t, tipo, herramienta, objetivo, pasos, evidencia], i) => ({ n: desde + i, titulo: t, tipo, herramienta, objetivo, pasos, evidencia })),
  }
}

// Nombres tal como aparecen en la plataforma, para que el docente los encuentre igual.
export const KIT = (leccion: string) => `Kit · pestaña Lecciones · «${leccion}»`
export const CBIA = (actividad: string) => `Simuladores · ChaskiBlocks IA (tipo Scratch) · actividad «${actividad}»`
export const CBIA_LIBRE = 'Simuladores · ChaskiBlocks IA (tipo Scratch) · proyecto en blanco'
export const LEGO = (curso: string, clase: string) => `Simuladores · LEGO EV3 · Programar · curso «${curso}» · clase «${clase}»`
export const LEGO_ARMAR = 'Simuladores · LEGO EV3 · pestaña Armar (galería de robots)'
export const CAD = (modo: 'Construye' | 'Diseñar' | 'Visor 3D') => `Simuladores · Laboratorio CAD 3D · pestaña ${modo}`
export const IA = (actividad: string) => `Pestaña IA en Vivo · ${actividad}`
export const LAB = (prototipo: string) => `Menú Laboratorio (robótica 3D) · prototipo «${prototipo}»`
export const SCRATCH = 'Simuladores · Scratch'
export const MAKECODE = 'Simuladores · MakeCode Arcade'
export const TEACHABLE = 'Simuladores · Teachable Machine'
export const PYTHON = (leccion: string) => `Simuladores · Python IDE Professional · ${leccion}`
export const WOKWI = 'Simuladores · Wokwi ESP32'
export const SIN = 'Sin pantalla ni kit'
