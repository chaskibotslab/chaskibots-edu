// ============================================
// TESTS - /api/admin/academy (CRUD de la Academia)
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, PATCH, DELETE } from '@/app/api/admin/academy/route'

function makeQueryBuilder(result: any) {
  const qb: any = {}
  qb.insert = vi.fn(() => qb)
  qb.update = vi.fn(() => qb)
  qb.delete = vi.fn(() => qb)
  qb.select = vi.fn(() => qb)
  qb.eq = vi.fn(() => qb)
  qb.order = vi.fn(() => qb)
  qb.single = vi.fn(() => Promise.resolve(result))
  // Hace el builder "awaitable" directamente, como el cliente real de supabase-js
  qb.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
  return qb
}

const fromMock = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: { from: (...args: any[]) => fromMock(...args) },
}))

const jsonRequest = (body: any) => ({ json: async () => body }) as any
const urlRequest = (query: string) => ({ url: `http://localhost/api/admin/academy${query}` }) as any

describe('/api/admin/academy', () => {
  beforeEach(() => {
    fromMock.mockReset()
  })

  describe('POST', () => {
    it('rejects when title is missing', async () => {
      const res = await POST(jsonRequest({ entity: 'lesson', module_id: 'm1' }))
      expect(res.status).toBe(400)
      expect(fromMock).not.toHaveBeenCalled()
    })

    it('rejects an invalid entity', async () => {
      const res = await POST(jsonRequest({ entity: 'bogus', title: 'x' }))
      expect(res.status).toBe(400)
    })

    it('rejects a module without course_id', async () => {
      const res = await POST(jsonRequest({ entity: 'module', title: 'Nuevo módulo', slug: 'nuevo' }))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toMatch(/course_id/)
    })

    it('rejects a lesson without module_id', async () => {
      const res = await POST(jsonRequest({ entity: 'lesson', title: 'Nueva lección' }))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toMatch(/module_id/)
    })

    it('creates a lesson when fields are valid', async () => {
      fromMock.mockReturnValue(makeQueryBuilder({ data: { id: 'l1', title: 'Nueva lección' }, error: null }))
      const res = await POST(jsonRequest({ entity: 'lesson', title: 'Nueva lección', module_id: 'm1' }))
      expect(fromMock).toHaveBeenCalledWith('simulator_lessons')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.id).toBe('l1')
    })
  })

  describe('PATCH', () => {
    it('rejects when id is missing', async () => {
      const res = await PATCH(jsonRequest({ entity: 'lesson', title: 'x' }))
      expect(res.status).toBe(400)
    })

    it('updates an existing lesson', async () => {
      fromMock.mockReturnValue(makeQueryBuilder({ data: { id: 'l1', title: 'Editada' }, error: null }))
      const res = await PATCH(jsonRequest({ entity: 'lesson', id: 'l1', title: 'Editada' }))
      expect(fromMock).toHaveBeenCalledWith('simulator_lessons')
      expect(res.status).toBe(200)
    })
  })

  describe('DELETE', () => {
    it('rejects when entity or id is missing', async () => {
      const res = await DELETE(urlRequest('?entity=lesson'))
      expect(res.status).toBe(400)
    })

    it('deletes a lesson by id', async () => {
      fromMock.mockReturnValue(makeQueryBuilder({ error: null }))
      const res = await DELETE(urlRequest('?entity=lesson&id=l1'))
      expect(fromMock).toHaveBeenCalledWith('simulator_lessons')
      expect(res.status).toBe(200)
    })
  })
})
