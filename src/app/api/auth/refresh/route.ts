import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const USERS_TABLE = 'users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario por email en Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}?filterByFormula=${encodeURIComponent(`{email}='${email}'`)}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Error al buscar usuario' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    if (!data.records || data.records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const record = data.records[0]
    const fields = record.fields

    // Normalizar rol
    let role = 'student'
    const rawRole = (fields.role as string || '').toLowerCase()
    if (rawRole === 'admin' || rawRole === 'administrador') role = 'admin'
    else if (rawRole === 'teacher' || rawRole === 'profesor' || rawRole === 'docente') role = 'teacher'

    const user = {
      id: record.id,
      accessCode: (fields.accessCode as string) || '',
      name: (fields.name as string) || 'Usuario',
      email: fields.email as string,
      role,
      courseId: (fields.courseId as string) || '',
      courseName: (fields.courseName as string) || '',
      schoolId: (fields.schoolId as string) || '',
      schoolName: (fields.schoolName as string) || '',
      programId: (fields.programId as string) || '',
      programName: (fields.programName as string) || '',
      levelId: (fields.levelId as string) || '',
      isActive: true,
      createdAt: (fields.createdAt as string) || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Datos refrescados'
    })

  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
