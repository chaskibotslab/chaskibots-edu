import { NextRequest, NextResponse } from 'next/server'
import { validateAccessCode, validateEmailPassword } from '@/lib/supabase-auth'
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session'
import { getClientIp, checkLoginLock, recordFailedLogin, resetLoginAttempts } from '@/lib/loginRateLimit'

export const dynamic = 'force-dynamic'

async function withSessionCookie(response: NextResponse, user: { id: string; role: 'admin' | 'teacher' | 'student'; email?: string }) {
  const cookieValue = await createSessionCookie({ id: user.id, role: user.role, email: user.email })
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return response
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const lock = checkLoginLock(ip)
    if (lock.locked) {
      return NextResponse.json(
        { success: false, error: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil((lock.retryAfterSeconds || 0) / 60)} minutos.` },
        { status: 429, headers: { 'Retry-After': String(lock.retryAfterSeconds || 0) } }
      )
    }

    const body = await request.json()
    const { accessCode, email, password } = body

    // Modo 1: Login con código de acceso (Airtable)
    if (accessCode) {
      const result = await validateAccessCode(accessCode)

      if (!result.success) {
        const attempt = recordFailedLogin(ip)
        if (attempt.locked) {
          return NextResponse.json(
            { success: false, error: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil((attempt.retryAfterSeconds || 0) / 60)} minutos.` },
            { status: 429, headers: { 'Retry-After': String(attempt.retryAfterSeconds || 0) } }
          )
        }
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        )
      }

      resetLoginAttempts(ip)
      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: 'Login exitoso'
      })
      return await withSessionCookie(response, { id: result.user!.id, role: result.user!.role, email: result.user!.email })
    }

    // Modo 2: Login con email/password (Airtable)
    if (email && password) {
      const result = await validateEmailPassword(email, password)

      if (!result.success) {
        const attempt = recordFailedLogin(ip)
        if (attempt.locked) {
          return NextResponse.json(
            { success: false, error: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil((attempt.retryAfterSeconds || 0) / 60)} minutos.` },
            { status: 429, headers: { 'Retry-After': String(attempt.retryAfterSeconds || 0) } }
          )
        }
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        )
      }

      resetLoginAttempts(ip)
      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: 'Login exitoso'
      })
      return await withSessionCookie(response, { id: result.user!.id, role: result.user!.role, email: result.user!.email })
    }

    return NextResponse.json(
      { success: false, error: 'Proporciona un codigo de acceso o email/contrasena' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
