import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Mantiene compatibilidad: usa la tabla 'submissions' con task_id prefijado 'sim-'
// La info del reto se guarda como JSON en el campo 'output'

function rowToChallenge(row: any) {
  let info: any = {}
  try { info = JSON.parse(row.output || '{}') } catch {}
  const taskId = row.task_id || ''
  const challengeId = taskId.startsWith('sim-') ? taskId.substring(4) : taskId
  return {
    id: row.id,
    challengeId,
    challengeName: info.challengeName || challengeId,
    challengeCategory: info.challengeCategory || 'laberinto',
    challengeDifficulty: info.challengeDifficulty || 'easy',
    studentName: row.student_name || '',
    studentEmail: row.student_email || '',
    courseId: row.course_id || '',
    schoolId: row.school_id || '',
    completedAt: row.submitted_at || '',
    status: row.status === 'graded' ? 'verified' : 'completed',
    verifiedBy: row.graded_by || '',
    verifiedAt: row.graded_at || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('studentName')
    const studentEmail = searchParams.get('studentEmail')
    const courseId = searchParams.get('courseId')
    const schoolId = searchParams.get('schoolId')

    let query = supabaseAdmin.from('submissions').select('*')
      .like('task_id', 'sim-%')
      .order('submitted_at', { ascending: false })

    if (studentName) query = query.eq('student_name', studentName)
    if (studentEmail) query = query.eq('student_email', studentEmail)
    if (courseId) query = query.eq('course_id', courseId)
    if (schoolId) query = query.eq('school_id', schoolId)

    const { data, error } = await query
    if (error) return NextResponse.json({ challenges: [] })

    return NextResponse.json({ success: true, challenges: (data || []).map(rowToChallenge) })
  } catch (error) {
    return NextResponse.json({ challenges: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengeId, challengeName, challengeCategory, challengeDifficulty, studentName, studentEmail, courseId, schoolId, levelId } = body

    if (!challengeId || !studentName) {
      return NextResponse.json({ error: 'challengeId y studentName son requeridos' }, { status: 400 })
    }

    const challengeInfo = JSON.stringify({
      challengeName: challengeName || challengeId,
      challengeCategory: challengeCategory || 'laberinto',
      challengeDifficulty: challengeDifficulty || 'easy',
    })

    const { data, error } = await supabaseAdmin.from('submissions').insert({
      task_id: `sim-${challengeId}`,
      student_name: studentName,
      student_email: studentEmail || null,
      level_id: levelId || null,
      course_id: courseId || null,
      school_id: schoolId || null,
      code: `Reto: ${challengeName || challengeId}`,
      output: challengeInfo,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, challenge: rowToChallenge(data), message: '¡Reto registrado!' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, verifiedBy } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const fields: Record<string, any> = {
      status: status === 'verified' ? 'graded' : 'pending',
      graded_at: new Date().toISOString(),
    }
    if (verifiedBy) fields.graded_by = verifiedBy

    const { error } = await supabaseAdmin.from('submissions').update(fields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Reto verificado' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const { error } = await supabaseAdmin.from('submissions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
