// Guard para las rutas /api/admin/*. Antes ninguna de estas rutas verificaba
// sesión del lado del servidor — solo la PÁGINA /admin/* estaba protegida
// por el middleware, así que cualquiera podía llamar estos endpoints
// directo por HTTP sin haber iniciado sesión nunca (incluyendo promoverse
// a admin vía /api/admin/users). Mismo criterio que ya usa el middleware
// para las páginas de admin: admin o teacher, no cualquier usuario.

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionCookie, SESSION_COOKIE_NAME, SessionPayload } from '@/lib/session'

export async function requireAdmin(request: NextRequest): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: NextResponse }
> {
  const session = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 }) }
  }
  if (session.role !== 'admin' && session.role !== 'teacher') {
    return { ok: false, response: NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 }) }
  }
  return { ok: true, session }
}
