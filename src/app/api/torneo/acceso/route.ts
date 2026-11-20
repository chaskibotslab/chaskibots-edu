import { NextRequest, NextResponse } from 'next/server'
import { claveCorrecta, crearCookieJuez, COOKIE_JUEZ, JUEZ_MAX_AGE_SECONDS, texto } from '@/lib/torneo'
import { getClientIp, checkLoginLock, recordFailedLogin, resetLoginAttempts } from '@/lib/loginRateLimit'

export const dynamic = 'force-dynamic'

// Entrada de jueces con la clave del torneo.
export async function POST(request: NextRequest) {
  const ip = `torneo:${getClientIp(request)}`
  const bloqueo = checkLoginLock(ip)
  if (bloqueo.locked) {
    const min = Math.ceil((bloqueo.retryAfterSeconds || 60) / 60)
    return NextResponse.json({ success: false, error: `Demasiados intentos. Espera ${min} minutos.` }, { status: 429 })
  }
  const cuerpo = await request.json().catch(() => null)
  const clave = texto(cuerpo?.clave, 100)
  if (!clave || !(await claveCorrecta(clave))) {
    recordFailedLogin(ip)
    return NextResponse.json({ success: false, error: 'Clave incorrecta' }, { status: 401 })
  }
  const cookie = crearCookieJuez()
  if (!cookie) return NextResponse.json({ success: false, error: 'Servidor sin configurar' }, { status: 500 })
  resetLoginAttempts(ip)
  const respuesta = NextResponse.json({ success: true })
  respuesta.cookies.set(COOKIE_JUEZ, cookie, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: JUEZ_MAX_AGE_SECONDS,
  })
  return respuesta
}

// Salir del panel de jueces.
export async function DELETE() {
  const respuesta = NextResponse.json({ success: true })
  respuesta.cookies.delete(COOKIE_JUEZ)
  return respuesta
}
