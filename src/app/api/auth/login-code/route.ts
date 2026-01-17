import { NextRequest, NextResponse } from 'next/server'
import { validateAccessCode } from '@/lib/airtable-auth'

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { success: false, error: result.error || 'Código de acceso inválido' },
        { status: 401 }
      )
    }

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

    return NextResponse.json({
      success: true,
      user,
      message: 'Acceso exitoso'
    })

  } catch (error) {
    console.error('Error in login-code:', error)
    return NextResponse.json(
      { success: false, error: 'Error al validar código' },
      { status: 500 }
    )
  }
}
