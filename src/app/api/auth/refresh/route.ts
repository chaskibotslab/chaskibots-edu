import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Buscar usuario por email en Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error) {
      console.error('Refresh error:', error.message)
      return NextResponse.json(
        { success: false, error: 'Error al buscar usuario' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const row = data[0]
    const rawRole = String(row.role || '').toLowerCase()
    let role: 'admin' | 'teacher' | 'student' = 'student'
    if (rawRole.includes('admin')) role = 'admin'
    else if (rawRole.includes('teacher') || rawRole.includes('prof') || rawRole.includes('docente')) role = 'teacher'

    // Actualizar último login (best-effort)
    supabaseAdmin.from('users').update({ last_login: new Date().toISOString() }).eq('id', row.id).then(() => {})

    const user = {
      id: row.id,
      accessCode: row.access_code || '',
      name: row.name || 'Usuario',
      email: row.email,
      role,
      courseId: row.course_id || '',
      courseName: row.course_name || '',
      schoolId: row.school_id || '',
      schoolName: row.school_name || '',
      programId: row.program_id || '',
      programName: row.program_name || '',
      levelId: row.level_id || '',
      isActive: row.is_active !== false,
      createdAt: row.created_at || new Date().toISOString(),
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
