// ============================================
// STUDENTS API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface Student {
  id: string
  name: string
  levelId: string
  courseId?: string
  schoolId?: string
  email?: string
  accessCode?: string
  createdAt: string
}

interface StudentFilters {
  levelId?: string
  courseId?: string
  schoolId?: string
  search?: string
}

/**
 * Obtener estudiantes con filtros
 */
export async function getStudents(filters: StudentFilters = {}, forceRefresh = false): Promise<ApiResponse<Student[]>> {
  const filterKey = JSON.stringify(filters)
  const cacheKey = cacheKeys.students(filterKey)
  
  if (!forceRefresh) {
    const cached = cache.get<Student[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const params = new URLSearchParams()
  if (filters.levelId) params.append('levelId', filters.levelId)
  if (filters.courseId) params.append('courseId', filters.courseId)
  if (filters.schoolId) params.append('schoolId', filters.schoolId)
  if (filters.search) params.append('search', filters.search)
  
  const queryString = params.toString()
  const endpoint = `/students${queryString ? `?${queryString}` : ''}`
  
  const response = await apiGet<{ students: Student[] }>(endpoint)
  
  if (response.success && response.data) {
    const students = response.data.students || response.data
    cache.set(cacheKey, students)
    return { success: true, data: students as Student[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Crear estudiante
 */
export async function createStudent(data: Partial<Student>): Promise<ApiResponse<Student>> {
  const response = await apiPost<Student>('/students', data)
  if (response.success) {
    invalidateCache('students')
  }
  return response
}

/**
 * Eliminar estudiante
 */
export async function deleteStudent(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/students?id=${id}`)
  if (response.success) {
    invalidateCache('students')
  }
  return response
}

/**
 * Buscar estudiantes por nombre
 */
export async function searchStudents(query: string): Promise<ApiResponse<Student[]>> {
  return getStudents({ search: query })
}

/**
 * Obtener estudiantes por colegio
 */
export async function getStudentsBySchool(schoolId: string): Promise<ApiResponse<Student[]>> {
  return getStudents({ schoolId })
}

/**
 * Obtener estudiantes por curso
 */
export async function getStudentsByCourse(courseId: string): Promise<ApiResponse<Student[]>> {
  return getStudents({ courseId })
}
