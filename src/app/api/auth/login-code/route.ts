import { NextRequest, NextResponse } from 'next/server'
import { validateAccessCode } from '@/lib/supabase-auth'
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session'
import { getClientIp, checkLoginLock, recordFailedLogin, resetLoginAttempts } from '@/lib/loginRateLimit'

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
    const { accessCode } = body

    if (!accessCode) {
      return NextResponse.json(
        { success: false, error: 'Código de acceso requerido' },
        { status: 400 }
      )
    }

    // Validar código de acceso en Airtable
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
        { success: false, error: result.error || 'Código de acceso inválido' },
        { status: 401 }
      )
    }

    resetLoginAttempts(ip)

    // Formatear usuario para el frontend
    const user = {
      id: result.user?.id,
      name: result.user?.name,
      email: result.user?.email || '',
      role: result.user?.role,
      levelId: result.user?.levelId,
      programId: result.user?.programId,
      programName: result.user?.programName,
      progress: 0,
      createdAt: result.user?.createdAt,
      lastLogin: new Date().toISOString()
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Acceso exitoso'
    })

    const cookieValue = await createSessionCookie({
      id: result.user!.id,
      role: result.user!.role,
      email: result.user!.email,
    })
    response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return response

  } catch (error) {
    console.error('Error in login-code:', error)
    return NextResponse.json(
      { success: false, error: 'Error al validar código' },
      { status: 500 }
    )
  }
}
