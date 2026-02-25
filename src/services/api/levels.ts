// ============================================
// LEVELS API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiPatch, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface Level {
  id: string
  name: string
  fullName: string
  category: string
  ageRange: string
  gradeNumber: number
  color?: string
  neonColor?: string
  icon?: string
  kitPrice?: number
  hasHacking?: boolean
  hasAdvancedIA?: boolean
}

/**
 * Obtener todos los niveles
 */
export async function getLevels(forceRefresh = false): Promise<ApiResponse<Level[]>> {
  const cacheKey = cacheKeys.levels()
  
  if (!forceRefresh) {
    const cached = cache.get<Level[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const response = await apiGet<{ levels: Level[] }>('/levels')
  
  if (response.success && response.data) {
    const levels = response.data.levels || response.data
    cache.set(cacheKey, levels)
    return { success: true, data: levels as Level[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Obtener nivel por ID
 */
export async function getLevelById(id: string): Promise<ApiResponse<Level>> {
  const levels = await getLevels()
  if (levels.success && levels.data) {
    const level = levels.data.find(l => l.id === id)
    if (level) return { success: true, data: level }
  }
  return { success: false, error: 'Nivel no encontrado' }
}

/**
 * Crear nivel
 */
export async function createLevel(data: Partial<Level>): Promise<ApiResponse<Level>> {
  const response = await apiPost<Level>('/admin/levels', data)
  if (response.success) {
    invalidateCache('levels')
  }
  return response
}

/**
 * Actualizar nivel
 */
export async function updateLevel(id: string, data: Partial<Level>): Promise<ApiResponse<Level>> {
  const response = await apiPatch<Level>('/admin/levels', { id, ...data })
  if (response.success) {
    invalidateCache('levels')
  }
  return response
}

/**
 * Eliminar nivel
 */
export async function deleteLevel(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/admin/levels?id=${id}`)
  if (response.success) {
    invalidateCache('levels')
  }
  return response
}
