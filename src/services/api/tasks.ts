// ============================================
// TASKS API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiPatch, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface Task {
  id: string
  levelId: string
  title: string
  description: string
  points: number
  dueDate?: string
  isActive: boolean
  questions?: string[]
  type?: string
  category?: string
  difficulty?: string
  attachmentUrl?: string
  courseId?: string
}

interface TaskFilters {
  levelId?: string
  courseId?: string
  isActive?: boolean
}

/**
 * Obtener tareas con filtros
 */
export async function getTasks(filters: TaskFilters = {}, forceRefresh = false): Promise<ApiResponse<Task[]>> {
  const filterKey = JSON.stringify(filters)
  const cacheKey = cacheKeys.tasks(filterKey)
  
  if (!forceRefresh) {
    const cached = cache.get<Task[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const params = new URLSearchParams()
  if (filters.levelId) params.append('levelId', filters.levelId)
  if (filters.courseId) params.append('courseId', filters.courseId)
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive))
  
  const queryString = params.toString()
  const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`
  
  const response = await apiGet<{ tasks: Task[] }>(endpoint)
  
  if (response.success && response.data) {
    const tasks = response.data.tasks || response.data
    cache.set(cacheKey, tasks)
    return { success: true, data: tasks as Task[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Obtener tarea por ID
 */
export async function getTaskById(id: string): Promise<ApiResponse<Task>> {
  const response = await apiGet<{ task: Task }>(`/tasks?id=${id}`)
  if (response.success && response.data) {
    return { success: true, data: (response.data as any).task || response.data }
  }
  return { success: false, error: response.error }
}

/**
 * Crear tarea
 */
export async function createTask(data: Partial<Task>): Promise<ApiResponse<Task>> {
  const response = await apiPost<Task>('/tasks', data)
  if (response.success) {
    invalidateCache('tasks')
  }
  return response
}

/**
 * Actualizar tarea
 */
export async function updateTask(id: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
  const response = await apiPatch<Task>('/tasks', { id, ...data })
  if (response.success) {
    invalidateCache('tasks')
  }
  return response
}

/**
 * Eliminar tarea
 */
export async function deleteTask(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/tasks?id=${id}`)
  if (response.success) {
    invalidateCache('tasks')
  }
  return response
}

/**
 * Activar/Desactivar tarea
 */
export async function toggleTaskActive(id: string, isActive: boolean): Promise<ApiResponse<Task>> {
  return updateTask(id, { isActive })
}
