// ============================================
// TESTS DE CACHÉ - ChaskiBots EDU
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cache, cacheKeys } from '@/lib/cache'

describe('CacheManager', () => {
  beforeEach(() => {
    cache.clear()
  })

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const testData = { name: 'Test', value: 123 }
      cache.set('test:key', testData)
      
      const result = cache.get('test:key')
      expect(result).toEqual(testData)
    })

    it('should return null for non-existent key', () => {
      const result = cache.get('non:existent')
      expect(result).toBeNull()
    })

    it('should return null for expired data', async () => {
      cache.set('test:expired', { data: 'test' }, 10) // 10ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 20))
      
      const result = cache.get('test:expired')
      expect(result).toBeNull()
    })
  })

  describe('invalidate', () => {
    it('should invalidate specific key', () => {
      cache.set('test:key1', 'value1')
      cache.set('test:key2', 'value2')
      
      cache.invalidate('test:key1')
      
      expect(cache.get('test:key1')).toBeNull()
      expect(cache.get('test:key2')).toBe('value2')
    })

    it('should invalidate by prefix', () => {
      cache.set('levels:all', ['level1', 'level2'])
      cache.set('levels:filtered', ['level1'])
      cache.set('users:all', ['user1'])
      
      cache.invalidateByPrefix('levels:')
      
      expect(cache.get('levels:all')).toBeNull()
      expect(cache.get('levels:filtered')).toBeNull()
      expect(cache.get('users:all')).toEqual(['user1'])
    })

    it('should invalidate by type', () => {
      cache.set('tasks:all', ['task1'])
      cache.set('tasks:level1', ['task2'])
      
      cache.invalidateType('tasks')
      
      expect(cache.get('tasks:all')).toBeNull()
      expect(cache.get('tasks:level1')).toBeNull()
    })
  })

  describe('clear', () => {
    it('should clear all cache', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      cache.clear()
      
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats = cache.getStats()
      
      expect(stats.size).toBe(2)
      expect(stats.keys).toContain('key1')
      expect(stats.keys).toContain('key2')
    })
  })

  describe('fetchWithCache', () => {
    it('should fetch and cache data', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'fetched' })
      
      const result = await cache.fetchWithCache('test:fetch', fetcher)
      
      expect(result).toEqual({ data: 'fetched' })
      expect(fetcher).toHaveBeenCalledTimes(1)
      
      // Second call should use cache
      const result2 = await cache.fetchWithCache('test:fetch', fetcher)
      expect(result2).toEqual({ data: 'fetched' })
      expect(fetcher).toHaveBeenCalledTimes(1) // Still 1, used cache
    })

    it('should force refresh when requested', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'new' })
      cache.set('test:force', { data: 'old' })
      
      const result = await cache.fetchWithCache('test:force', fetcher, true)
      
      expect(result).toEqual({ data: 'new' })
      expect(fetcher).toHaveBeenCalledTimes(1)
    })
  })
})

describe('cacheKeys', () => {
  it('should generate correct keys for levels', () => {
    expect(cacheKeys.levels()).toBe('levels:all')
    expect(cacheKeys.levels('filtered')).toBe('levels:filtered')
  })

  it('should generate correct keys for lessons', () => {
    expect(cacheKeys.lessons('quinto-egb')).toBe('lessons:quinto-egb')
  })

  it('should generate correct keys for tasks', () => {
    expect(cacheKeys.tasks()).toBe('tasks:all')
    expect(cacheKeys.tasks('quinto-egb')).toBe('tasks:quinto-egb')
  })

  it('should generate correct keys for schools', () => {
    expect(cacheKeys.schools()).toBe('schools:all')
  })
})
