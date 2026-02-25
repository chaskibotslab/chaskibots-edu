// ============================================
// SISTEMA DE CACHÉ - ChaskiBots EDU
// Caché en memoria con TTL configurable
// ============================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  
  // TTL por defecto: 5 minutos
  private defaultTTL = 5 * 60 * 1000
  
  // TTL específicos por tipo de dato (en ms)
  private ttlConfig: Record<string, number> = {
    levels: 30 * 60 * 1000,      // 30 minutos - cambian poco
    programs: 30 * 60 * 1000,    // 30 minutos
    kits: 60 * 60 * 1000,        // 1 hora - casi nunca cambian
    simulators: 60 * 60 * 1000,  // 1 hora
    lessons: 15 * 60 * 1000,     // 15 minutos
    schools: 30 * 60 * 1000,     // 30 minutos
    courses: 15 * 60 * 1000,     // 15 minutos
    users: 2 * 60 * 1000,        // 2 minutos - cambian frecuentemente
    tasks: 5 * 60 * 1000,        // 5 minutos
    submissions: 1 * 60 * 1000,  // 1 minuto - muy dinámico
    grades: 2 * 60 * 1000,       // 2 minutos
    students: 5 * 60 * 1000,     // 5 minutos
  }

  /**
   * Obtener dato del caché
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    
    if (!entry) return null
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  /**
   * Guardar dato en caché
   */
  set<T>(key: string, data: T, customTTL?: number): void {
    // Determinar TTL basado en el tipo de dato
    const dataType = key.split(':')[0]
    const ttl = customTTL ?? this.ttlConfig[dataType] ?? this.defaultTTL
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Invalidar caché por clave exacta
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidar caché por prefijo (ej: 'levels:' invalida todas las entradas de levels)
   */
  invalidateByPrefix(prefix: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Invalidar todo el caché de un tipo de dato
   */
  invalidateType(dataType: string): void {
    this.invalidateByPrefix(`${dataType}:`)
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Wrapper para fetch con caché
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    // Si no forzamos refresh, intentar obtener del caché
    if (!forceRefresh) {
      const cached = this.get<T>(key)
      if (cached !== null) {
        console.log(`[Cache] HIT: ${key}`)
        return cached
      }
    }
    
    console.log(`[Cache] MISS: ${key}`)
    
    // Fetch y guardar en caché
    const data = await fetcher()
    this.set(key, data)
    
    return data
  }
}

// Singleton para usar en toda la aplicación
export const cache = new CacheManager()

// Helpers para tipos específicos
export const cacheKeys = {
  levels: (filter?: string) => `levels:${filter || 'all'}`,
  programs: (levelId?: string) => `programs:${levelId || 'all'}`,
  kits: (levelId?: string) => `kits:${levelId || 'all'}`,
  lessons: (levelId: string) => `lessons:${levelId}`,
  schools: () => 'schools:all',
  courses: (schoolId?: string) => `courses:${schoolId || 'all'}`,
  users: (filter?: string) => `users:${filter || 'all'}`,
  tasks: (levelId?: string) => `tasks:${levelId || 'all'}`,
  submissions: (filter: string) => `submissions:${filter}`,
  grades: (filter: string) => `grades:${filter}`,
  students: (filter?: string) => `students:${filter || 'all'}`,
}
