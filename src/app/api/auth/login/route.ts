import { NextRequest, NextResponse } from 'next/server'
import { validateAccessCode, validateEmailPassword } from '@/lib/airtable-auth'

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

    // Modo 2: Login con email/password (Airtable)
    if (email && password) {
      const result = await validateEmailPassword(email, password)
      
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
