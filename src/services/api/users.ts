// ============================================
// USERS API SERVICE - ChaskiBots EDU
// ============================================

import { apiGet, apiPost, apiPatch, apiDelete, invalidateCache, ApiResponse } from './base'
import { cache, cacheKeys } from '@/lib/cache'

export interface User {
  id: string
  accessCode?: string
  email?: string
  password?: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  levelId?: string
  courseId?: string
  courseName?: string
  schoolId?: string
  schoolName?: string
  programId?: string
  programName?: string
  progress?: number
  createdAt?: string
  lastLogin?: string
  expiresAt?: string
  isActive?: boolean
}

interface UserFilters {
  role?: string
  schoolId?: string
  levelId?: string
  courseId?: string
}

/**
 * Obtener usuarios con filtros
 */
export async function getUsers(filters: UserFilters = {}, forceRefresh = false): Promise<ApiResponse<User[]>> {
  const filterKey = JSON.stringify(filters)
  const cacheKey = cacheKeys.users(filterKey)
  
  if (!forceRefresh) {
    const cached = cache.get<User[]>(cacheKey)
    if (cached) return { success: true, data: cached }
  }
  
  const params = new URLSearchParams()
  if (filters.role) params.append('role', filters.role)
  if (filters.schoolId) params.append('schoolId', filters.schoolId)
  if (filters.levelId) params.append('levelId', filters.levelId)
  if (filters.courseId) params.append('courseId', filters.courseId)
  
  const queryString = params.toString()
  const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`
  
  const response = await apiGet<{ users: User[] }>(endpoint)
  
  if (response.success && response.data) {
    const users = response.data.users || response.data
    cache.set(cacheKey, users)
    return { success: true, data: users as User[] }
  }
  
  return { success: false, error: response.error }
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  const users = await getUsers()
  if (users.success && users.data) {
    const user = users.data.find(u => u.id === id)
    if (user) return { success: true, data: user }
  }
  return { success: false, error: 'Usuario no encontrado' }
}

/**
 * Crear usuario
 */
export async function createUser(data: Partial<User>): Promise<ApiResponse<User>> {
  const response = await apiPost<User>('/admin/users', data)
  if (response.success) {
    invalidateCache('users')
  }
  return response
}

/**
 * Actualizar usuario
 */
export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  const response = await apiPatch<User>('/admin/users', { id, ...data })
  if (response.success) {
    invalidateCache('users')
  }
  return response
}

/**
 * Eliminar usuario
 */
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  const response = await apiDelete<void>(`/admin/users?id=${id}`)
  if (response.success) {
    invalidateCache('users')
  }
  return response
}

/**
 * Obtener profesores
 */
export async function getTeachers(): Promise<ApiResponse<User[]>> {
  return getUsers({ role: 'teacher' })
}

/**
 * Obtener estudiantes (usuarios con rol student)
 */
export async function getStudentUsers(): Promise<ApiResponse<User[]>> {
  return getUsers({ role: 'student' })
}

/**
 * Obtener administradores
 */
export async function getAdmins(): Promise<ApiResponse<User[]>> {
  return getUsers({ role: 'admin' })
}
