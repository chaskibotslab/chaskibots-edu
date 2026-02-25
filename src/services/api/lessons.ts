// ============================================
// LESSONS API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiPatch, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface Lesson {
  id: string
  levelId: string
  moduleName: string
  title: string
  type: 'video' | 'lectura' | 'actividad' | 'quiz' | 'tutorial' | 'project'
  duration?: string
  order: number
  videoUrl?: string
  content?: string
  pdfUrl?: string
  locked?: boolean
}

/**
 * Obtener lecciones por nivel
 */
export async function getLessonsByLevel(levelId: string, forceRefresh = false): Promise<ApiResponse<Lesson[]>> {
  const cacheKey = cacheKeys.lessons(levelId)
  
  if (!forceRefresh) {
    const cached = cache.get<Lesson[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const response = await apiGet<{ lessons: Lesson[] }>(`/lessons?levelId=${levelId}`)
  
  if (response.success && response.data) {
    const lessons = response.data.lessons || response.data
    cache.set(cacheKey, lessons)
    return { success: true, data: lessons as Lesson[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Obtener todas las lecciones
 */
export async function getAllLessons(forceRefresh = false): Promise<ApiResponse<Lesson[]>> {
  const cacheKey = cacheKeys.lessons('all')
  
  if (!forceRefresh) {
    const cached = cache.get<Lesson[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const response = await apiGet<{ lessons: Lesson[] }>('/lessons')
  
  if (response.success && response.data) {
    const lessons = response.data.lessons || response.data
    cache.set(cacheKey, lessons)
    return { success: true, data: lessons as Lesson[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Crear lección
 */
export async function createLesson(data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
  const response = await apiPost<Lesson>('/lessons', data)
  if (response.success) {
    invalidateCache('lessons')
  }
  return response
}

/**
 * Actualizar lección
 */
export async function updateLesson(id: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
  const response = await apiPatch<Lesson>('/lessons', { id, ...data })
  if (response.success) {
    invalidateCache('lessons')
  }
  return response
}

/**
 * Eliminar lección
 */
export async function deleteLesson(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/lessons?id=${id}`)
  if (response.success) {
    invalidateCache('lessons')
  }
  return response
}
