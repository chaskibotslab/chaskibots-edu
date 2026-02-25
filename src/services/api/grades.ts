// ============================================
// GRADES API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface Grade {
  id: string
  studentId?: string
  studentName: string
  lessonId?: string
  levelId: string
  courseId?: string
  schoolId?: string
  score: number
  feedback?: string
  taskId?: string
  submittedAt?: string
  gradedAt?: string
  gradedBy?: string
}

interface GradeFilters {
  levelId?: string
  courseId?: string
  schoolId?: string
  studentName?: string
}

/**
 * Obtener calificaciones con filtros
 */
export async function getGrades(filters: GradeFilters = {}, forceRefresh = false): Promise<ApiResponse<Grade[]>> {
  const filterKey = JSON.stringify(filters)
  const cacheKey = cacheKeys.grades(filterKey)
  
  if (!forceRefresh) {
    const cached = cache.get<Grade[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const params = new URLSearchParams()
  if (filters.levelId) params.append('levelId', filters.levelId)
  if (filters.courseId) params.append('courseId', filters.courseId)
  if (filters.schoolId) params.append('schoolId', filters.schoolId)
  if (filters.studentName) params.append('studentName', filters.studentName)
  
  const queryString = params.toString()
  const endpoint = `/grades${queryString ? `?${queryString}` : ''}`
  
  const response = await apiGet<{ grades: Grade[] }>(endpoint)
  
  if (response.success && response.data) {
    const grades = response.data.grades || response.data
    cache.set(cacheKey, grades)
    return { success: true, data: grades as Grade[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Crear calificación
 */
export async function createGrade(data: Partial<Grade>): Promise<ApiResponse<Grade>> {
  const response = await apiPost<Grade>('/grades', data)
  if (response.success) {
    invalidateCache('grades')
  }
  return response
}

/**
 * Eliminar calificación
 */
export async function deleteGrade(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/grades?id=${id}`)
  if (response.success) {
    invalidateCache('grades')
  }
  return response
}

/**
 * Obtener calificaciones de un estudiante
 */
export async function getStudentGrades(studentName: string): Promise<ApiResponse<Grade[]>> {
  return getGrades({ studentName })
}

/**
 * Obtener resumen de calificaciones por nivel
 */
export async function getGradesSummary(levelId: string): Promise<ApiResponse<{
  total: number
  average: number
  byStudent: Record<string, { count: number; average: number }>
}>> {
  const grades = await getGrades({ levelId })
  
  if (!grades.success || !grades.data) {
    return { success: false, error: grades.error }
  }
  
  const byStudent: Record<string, { scores: number[]; count: number }> = {}
  
  grades.data.forEach(g => {
    if (!byStudent[g.studentName]) {
      byStudent[g.studentName] = { scores: [], count: 0 }
    }
    byStudent[g.studentName].scores.push(g.score)
    byStudent[g.studentName].count++
  })
  
  const summary = {
    total: grades.data.length,
    average: grades.data.length > 0 
      ? grades.data.reduce((acc, g) => acc + g.score, 0) / grades.data.length 
      : 0,
    byStudent: Object.fromEntries(
      Object.entries(byStudent).map(([name, data]) => [
        name,
        {
          count: data.count,
          average: data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        }
      ])
    )
  }
  
  return { success: true, data: summary }
}
