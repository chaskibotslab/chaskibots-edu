import { NextRequest, NextResponse } from 'next/server'

// Contraseñas por nivel (en producción, esto debería estar en Airtable)
const COURSE_PASSWORDS: Record<string, string> = {
  'inicial-1': 'inicial1@chaski',
  'inicial-2': 'inicial2@chaski',
  'elemental': 'elemental@chaski',
  'media': 'media@chaski',
  'superior': 'superior@chaski',
  'bachillerato': 'bachillerato@chaski',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { levelId, password } = body

    if (!levelId || !password) {
      return NextResponse.json(
        { success: false, error: 'Nivel y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const correctPassword = COURSE_PASSWORDS[levelId]

    if (!correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    if (password === correctPassword) {
      return NextResponse.json({
        success: true,
        message: 'Acceso concedido'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Contraseña incorrecta' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Course access error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
