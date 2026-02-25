// ============================================
// TESTS DE SERVICIOS API - ChaskiBots EDU
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiFetch, apiGet, apiPost, apiPatch, apiDelete } from '@/services/api/base'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Services', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('apiFetch', () => {
    it('should make GET request correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      })

      const result = await apiFetch('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result.success).toBe(true)
      expect(result.data).toBe('test')
    })

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const body = { name: 'Test' }
      await apiFetch('/test', { method: 'POST', body })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
    })

    it('should handle error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' }),
      })

      const result = await apiFetch('/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bad request')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await apiFetch('/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Error de conexión')
    })
  })

  describe('apiGet', () => {
    it('should call apiFetch with GET method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ levels: [] }),
      })

      const result = await apiGet('/levels')

      expect(result.success).toBe(true)
    })
  })

  describe('apiPost', () => {
    it('should call apiFetch with POST method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '123' }),
      })

      const result = await apiPost('/users', { name: 'Test' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.success).toBe(true)
    })
  })

  describe('apiPatch', () => {
    it('should call apiFetch with PATCH method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ updated: true }),
      })

      const result = await apiPatch('/users', { id: '123', name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({ method: 'PATCH' })
      )
      expect(result.success).toBe(true)
    })
  })

  describe('apiDelete', () => {
    it('should call apiFetch with DELETE method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: true }),
      })

      const result = await apiDelete('/users?id=123')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/users?id=123',
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(result.success).toBe(true)
    })
  })
})
