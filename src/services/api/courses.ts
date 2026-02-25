// ============================================
// COURSES API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiPatch, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface Course {
  id: string
  name: string
  description?: string
  levelId: string
  teacherId?: string
  teacherName?: string
  schoolId?: string
  schoolName?: string
  maxStudents?: number
  currentStudents?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
  createdAt?: string
}

interface CourseFilters {
  levelId?: string
  schoolId?: string
  teacherId?: string
  isActive?: boolean
}

/**
 * Obtener cursos con filtros
 */
export async function getCourses(filters: CourseFilters = {}, forceRefresh = false): Promise<ApiResponse<Course[]>> {
  const filterKey = JSON.stringify(filters)
  const cacheKey = cacheKeys.courses(filterKey)
  
  if (!forceRefresh) {
    const cached = cache.get<Course[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const params = new URLSearchParams()
  if (filters.levelId) params.append('levelId', filters.levelId)
  if (filters.schoolId) params.append('schoolId', filters.schoolId)
  if (filters.teacherId) params.append('teacherId', filters.teacherId)
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive))
  
  const queryString = params.toString()
  const endpoint = `/admin/courses${queryString ? `?${queryString}` : ''}`
  
  const response = await apiGet<{ courses: Course[] }>(endpoint)
  
  if (response.success && response.data) {
    const courses = response.data.courses || response.data
    cache.set(cacheKey, courses)
    return { success: true, data: courses as Course[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Obtener curso por ID
 */
export async function getCourseById(id: string): Promise<ApiResponse<Course>> {
  const courses = await getCourses()
  if (courses.success && courses.data) {
    const course = courses.data.find(c => c.id === id)
    if (course) return { success: true, data: course }
  }
  return { success: false, error: 'Curso no encontrado' }
}

/**
 * Crear curso
 */
export async function createCourse(data: Partial<Course>): Promise<ApiResponse<Course>> {
  const response = await apiPost<Course>('/admin/courses', data)
  if (response.success) {
    invalidateCache('courses')
  }
  return response
}

/**
 * Actualizar curso
 */
export async function updateCourse(id: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
  const response = await apiPatch<Course>('/admin/courses', { id, ...data })
  if (response.success) {
    invalidateCache('courses')
  }
  return response
}

/**
 * Eliminar curso
 */
export async function deleteCourse(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/admin/courses?id=${id}`)
  if (response.success) {
    invalidateCache('courses')
  }
  return response
}

/**
 * Obtener cursos por colegio
 */
export async function getCoursesBySchool(schoolId: string): Promise<ApiResponse<Course[]>> {
  return getCourses({ schoolId })
}

/**
 * Obtener cursos por profesor
 */
export async function getCoursesByTeacher(teacherId: string): Promise<ApiResponse<Course[]>> {
  return getCourses({ teacherId })
}
