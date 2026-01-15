import { NextRequest, NextResponse } from 'next/server'
import { validateAccessCode } from '@/lib/airtable-auth'
import { validateLogin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessCode, email, password } = body

    // Modo 1: Login con código de acceso (Airtable)
    if (accessCode) {
      const result = await validateAccessCode(accessCode)
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        user: result.user,
        message: 'Login exitoso'
      })
    }

    // Modo 2: Login tradicional con email/password (fallback)
    if (email && password) {
      const result = validateLogin({ email, password })
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        user: result.user,
        message: 'Login exitoso'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Proporciona un código de acceso o email/contraseña' },
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
