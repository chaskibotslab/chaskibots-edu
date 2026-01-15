// ============================================
// ÍNDICE DE CURSOS - ChaskiBots EDU
// ============================================
// Este archivo centraliza todos los cursos disponibles
// Para agregar un nuevo curso:
// 1. Crea un archivo nuevo (ej: primero-egb.ts)
// 2. Importa y exporta aquí
// ============================================

// Tipos
export * from './types'

// Cursos por nivel
export { INICIAL_1 } from './inicial-1'
export { INICIAL_2 } from './inicial-2'

// Importar todos los cursos
import { INICIAL_1 } from './inicial-1'
import { INICIAL_2 } from './inicial-2'
import { CourseData } from './types'

// Objeto con todos los cursos indexados por ID
export const ALL_COURSES: Record<string, CourseData> = {
  'inicial-1': INICIAL_1,
  'inicial-2': INICIAL_2,
  // Agregar más cursos aquí conforme se creen:
  // 'primero-egb': PRIMERO_EGB,
  // 'segundo-egb': SEGUNDO_EGB,
  // etc.
}

// Función para obtener un curso por ID
export function getCourse(levelId: string): CourseData | null {
  return ALL_COURSES[levelId] || null
}

// Lista de IDs de cursos disponibles
export const AVAILABLE_COURSES = Object.keys(ALL_COURSES)
