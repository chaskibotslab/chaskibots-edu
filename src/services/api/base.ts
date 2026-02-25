// ============================================
// BASE API SERVICE - ChaskiBots EDU
// Funciones base para llamadas a API
// ============================================

import { cache, cacheKeys } from '@/lib/cache'

// Tipos base
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number
  page?: number
  pageSize?: number
  hasMore?: boolean
}

// Configuración base
const API_BASE = '/api'

// Opciones de fetch
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  cache?: boolean
  cacheKey?: string
  forceRefresh?: boolean
}

/**
 * Función base para llamadas a API
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    cache: useCache = false,
    cacheKey,
    forceRefresh = false,
  } = options

  // Si es GET y tiene caché habilitado, intentar obtener del caché
  if (method === 'GET' && useCache && cacheKey && !forceRefresh) {
    const cached = cache.get<T>(cacheKey)
    if (cached !== null) {
      return { success: true, data: cached }
    }
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
    
    if (body) {
      fetchOptions.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions)

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error ${response.status}`,
      }
    }

    // Guardar en caché si aplica
    if (method === 'GET' && useCache && cacheKey && data) {
      const dataToCache = data.data ?? data
      cache.set(cacheKey, dataToCache)
    }

    return {
      success: true,
      data: data.data ?? data,
      message: data.message,
    }
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error)
    return {
      success: false,
      error: 'Error de conexión',
    }
  }
}

/**
 * GET con caché automático
 */
export async function apiGet<T>(
  endpoint: string,
  cacheKey?: string,
  forceRefresh = false
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'GET',
    cache: !!cacheKey,
    cacheKey,
    forceRefresh,
  })
}

/**
 * POST
 */
export async function apiPost<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body,
  })
}

/**
 * PATCH
 */
export async function apiPatch<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body,
  })
}

/**
 * DELETE
 */
export async function apiDelete<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
    body,
  })
}

/**
 * Invalidar caché después de mutaciones
 */
export function invalidateCache(type: string): void {
  cache.invalidateType(type)
}
