// ============================================
// SCHOOLS API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiPatch, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface School {
  id: string
  name: string
  code: string
  address?: string
  city?: string
  country?: string
  email?: string
  phone?: string
  logo?: string
  isActive?: boolean
  maxStudents?: number
  maxTeachers?: number
  createdAt?: string
}

/**
 * Obtener todos los colegios
 */
export async function getSchools(forceRefresh = false): Promise<ApiResponse<School[]>> {
  const cacheKey = cacheKeys.schools()
  
  if (!forceRefresh) {
    const cached = cache.get<School[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const response = await apiGet<{ schools: School[] }>('/schools')
  
  if (response.success && response.data) {
    const schools = response.data.schools || response.data
    cache.set(cacheKey, schools)
    return { success: true, data: schools as School[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Obtener colegio por ID
 */
export async function getSchoolById(id: string): Promise<ApiResponse<School>> {
  const schools = await getSchools()
  if (schools.success && schools.data) {
    const school = schools.data.find(s => s.id === id)
    if (school) return { success: true, data: school }
  }
  return { success: false, error: 'Colegio no encontrado' }
}

/**
 * Crear colegio
 */
export async function createSchool(data: Partial<School>): Promise<ApiResponse<School>> {
  const response = await apiPost<School>('/schools', data)
  if (response.success) {
    invalidateCache('schools')
  }
  return response
}

/**
 * Actualizar colegio
 */
export async function updateSchool(id: string, data: Partial<School>): Promise<ApiResponse<School>> {
  const response = await apiPatch<School>('/schools', { id, ...data })
  if (response.success) {
    invalidateCache('schools')
  }
  return response
}

/**
 * Eliminar colegio
 */
export async function deleteSchool(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/schools?id=${id}`)
  if (response.success) {
    invalidateCache('schools')
  }
  return response
}
