// ============================================
// TESTS - requireAdmin (guard de sesión para /api/admin/*)
//
// Regresión para el hallazgo: las 8 rutas de /api/admin/* no verificaban
// sesión del lado del servidor — cualquiera podía llamarlas directo por
// HTTP sin loguearse (incluida auto-promoción a admin vía /api/admin/users).
// ============================================

import { describe, it, expect, vi } from 'vitest'

const verifySessionCookieMock = vi.fn()
vi.mock('@/lib/session', () => ({
  verifySessionCookie: (...args: any[]) => verifySessionCookieMock(...args),
  SESSION_COOKIE_NAME: 'chaskibots_session',
}))

import { requireAdmin } from '@/lib/requireAdmin'

function makeRequest(cookieValue?: string) {
  return {
    cookies: { get: () => (cookieValue !== undefined ? { value: cookieValue } : undefined) },
  } as any
}

describe('requireAdmin', () => {
  it('rejects with 401 when there is no session cookie', async () => {
    verifySessionCookieMock.mockResolvedValueOnce(null)
    const result = await requireAdmin(makeRequest(undefined))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(401)
  })

  it('rejects with 403 when the session role is student', async () => {
    verifySessionCookieMock.mockResolvedValueOnce({ id: 'u1', role: 'student', exp: Date.now() + 10000 })
    const result = await requireAdmin(makeRequest('valid-but-student'))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(403)
  })

  it('allows a valid admin session', async () => {
    verifySessionCookieMock.mockResolvedValueOnce({ id: 'u1', role: 'admin', exp: Date.now() + 10000 })
    const result = await requireAdmin(makeRequest('valid-admin'))
    expect(result.ok).toBe(true)
  })

  it('allows a valid teacher session (same policy as the admin pages middleware)', async () => {
    verifySessionCookieMock.mockResolvedValueOnce({ id: 'u1', role: 'teacher', exp: Date.now() + 10000 })
    const result = await requireAdmin(makeRequest('valid-teacher'))
    expect(result.ok).toBe(true)
  })
})
