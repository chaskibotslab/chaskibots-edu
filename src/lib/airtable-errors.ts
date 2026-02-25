// ============================================
// MANEJO DE ERRORES DE AIRTABLE - ChaskiBots EDU
// ============================================

export interface AirtableErrorResponse {
  error: string
  message: string
  isRateLimit: boolean
  isBillingLimit: boolean
  retryAfter?: number
}

/**
 * Parsear errores de Airtable y devolver mensajes amigables
 */
export function parseAirtableError(errorText: string, status: number): AirtableErrorResponse {
  // Error 429 - Rate limit o billing limit
  if (status === 429) {
    if (errorText.includes('PUBLIC_API_BILLING_LIMIT_EXCEEDED')) {
      return {
        error: 'BILLING_LIMIT',
        message: '⚠️ Se ha alcanzado el límite mensual de solicitudes de la base de datos. Por favor, espera a que se reinicie el próximo mes o contacta al administrador para actualizar el plan.',
        isRateLimit: false,
        isBillingLimit: true
      }
    }
    
    return {
      error: 'RATE_LIMIT',
      message: '⏳ Demasiadas solicitudes. Por favor, espera unos segundos e intenta de nuevo.',
      isRateLimit: true,
      isBillingLimit: false,
      retryAfter: 30
    }
  }
  
  // Error 401 - No autorizado
  if (status === 401) {
    return {
      error: 'UNAUTHORIZED',
      message: '🔐 Error de autenticación con la base de datos. Contacta al administrador.',
      isRateLimit: false,
      isBillingLimit: false
    }
  }
  
  // Error 403 - Prohibido
  if (status === 403) {
    return {
      error: 'FORBIDDEN',
      message: '🚫 No tienes permisos para acceder a estos datos.',
      isRateLimit: false,
      isBillingLimit: false
    }
  }
  
  // Error 404 - No encontrado
  if (status === 404) {
    return {
      error: 'NOT_FOUND',
      message: '🔍 El recurso solicitado no existe.',
      isRateLimit: false,
      isBillingLimit: false
    }
  }
  
  // Error 422 - Datos inválidos
  if (status === 422) {
    return {
      error: 'INVALID_DATA',
      message: '❌ Los datos enviados no son válidos. Verifica la información e intenta de nuevo.',
      isRateLimit: false,
      isBillingLimit: false
    }
  }
  
  // Error 500+ - Error del servidor
  if (status >= 500) {
    return {
      error: 'SERVER_ERROR',
      message: '🔧 Error temporal del servidor. Por favor, intenta de nuevo en unos minutos.',
      isRateLimit: false,
      isBillingLimit: false
    }
  }
  
  // Error genérico
  return {
    error: 'UNKNOWN',
    message: `❌ Error inesperado: ${errorText}`,
    isRateLimit: false,
    isBillingLimit: false
  }
}

/**
 * Verificar si un error es recuperable (se puede reintentar)
 */
export function isRetryableError(status: number): boolean {
  return status === 429 || status >= 500
}

/**
 * Mensaje de error para mostrar al usuario
 */
export function getUserFriendlyError(status: number, errorText: string): string {
  const parsed = parseAirtableError(errorText, status)
  return parsed.message
}
