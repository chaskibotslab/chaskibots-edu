// ============================================
// SUBMISSIONS API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiPatch, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface Submission {
  id: string
  taskId: string
  studentName: string
  studentEmail?: string
  levelId: string
  lessonId?: string
  courseId?: string
  schoolId?: string
  code?: string
  output?: string
  submittedAt: string
  status: 'pending' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: string
  drawing?: string
  files?: string
}

interface SubmissionFilters {
  levelId?: string
  taskId?: string
  status?: string
  courseId?: string
  schoolId?: string
}

/**
 * Obtener entregas con filtros
 */
export async function getSubmissions(filters: SubmissionFilters = {}, forceRefresh = false): Promise<ApiResponse<Submission[]>> {
  const filterKey = JSON.stringify(filters)
  const cacheKey = cacheKeys.submissions(filterKey)
  
  if (!forceRefresh) {
    const cached = cache.get<Submission[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const params = new URLSearchParams()
  if (filters.levelId) params.append('levelId', filters.levelId)
  if (filters.taskId) params.append('taskId', filters.taskId)
  if (filters.status) params.append('status', filters.status)
  if (filters.courseId) params.append('courseId', filters.courseId)
  if (filters.schoolId) params.append('schoolId', filters.schoolId)
  
  const queryString = params.toString()
  const endpoint = `/submissions${queryString ? `?${queryString}` : ''}`
  
  const response = await apiGet<{ submissions: Submission[] }>(endpoint)
  
  if (response.success && response.data) {
    const submissions = response.data.submissions || response.data
    cache.set(cacheKey, submissions)
    return { success: true, data: submissions as Submission[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Crear entrega
 */
export async function createSubmission(data: Partial<Submission>): Promise<ApiResponse<Submission>> {
  const response = await apiPost<Submission>('/submissions', data)
  if (response.success) {
    invalidateCache('submissions')
    invalidateCache('grades')
  }
  return response
}

/**
 * Calificar entrega
 */
export async function gradeSubmission(
  id: string,
  grade: number,
  feedback?: string,
  gradedBy?: string
): Promise<ApiResponse<Submission>> {
  const response = await apiPatch<Submission>('/submissions', {
    id,
    grade,
    feedback,
    gradedBy,
    status: 'graded'
  })
  if (response.success) {
    invalidateCache('submissions')
    invalidateCache('grades')
  }
  return response
}

/**
 * Devolver entrega (sin calificar)
 */
export async function returnSubmission(
  id: string,
  feedback?: string
): Promise<ApiResponse<Submission>> {
  const response = await apiPatch<Submission>('/submissions', {
    id,
    feedback,
    status: 'returned'
  })
  if (response.success) {
    invalidateCache('submissions')
  }
  return response
}

/**
 * Eliminar entrega
 */
export async function deleteSubmission(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/submissions?id=${id}`)
  if (response.success) {
    invalidateCache('submissions')
  }
  return response
}
