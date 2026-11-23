import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, requireSession } from '@/lib/requireAdmin'
import { getUserScope } from '@/lib/scope'

export const dynamic = 'force-dynamic'

function rowToSubmission(row: any) {
  return {
    id: row.id,
    userId: row.user_id || '',
    taskId: row.task_id || '',
    studentName: row.student_name || '',
    studentEmail: row.student_email || '',
    levelId: row.level_id || '',
    lessonId: row.lesson_id || '',
    courseId: row.course_id || '',
    schoolId: row.school_id || '',
    code: row.code || '',
    output: row.output || '',
    submittedAt: row.submitted_at || '',
    status: row.status || 'pending',
    grade: row.grade,
    feedback: row.feedback || '',
    gradedAt: row.graded_at || '',
    gradedBy: row.graded_by || '',
    drawing: row.drawing || '',
    drawingUrl: row.drawing_url || '',
    files: row.files || '',
    attachmentUrls: row.attachment_urls || [],
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireSession(request)
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const status = searchParams.get('status')
    const taskId = searchParams.get('taskId')
    const courseId = searchParams.get('courseId')
    const schoolId = searchParams.get('schoolId')
    const studentEmail = searchParams.get('studentEmail')

    let query = supabaseAdmin.from('submissions').select('*').order('submitted_at', { ascending: false })
    if (levelId) query = query.eq('level_id', levelId)
    if (status) query = query.eq('status', status)
    if (taskId) query = query.eq('task_id', taskId)
    if (courseId) query = query.eq('course_id', courseId)
    if (schoolId) query = query.eq('school_id', schoolId)
    if (studentEmail) query = query.eq('student_email', studentEmail)

    // Estudiantes y docentes solo ven entregas de los niveles de sus grupos.
    const scope = await getUserScope(auth.session)
    if (scope.role === 'student') {
      // El estudiante ve SOLO sus propias entregas (ligadas a su cuenta).
      query = query.eq('user_id', auth.session.id)
    } else if (scope.role !== 'admin' && scope.levelIds.length > 0) {
      query = query.in('level_id', scope.levelIds)
    }

    const { data, error } = await query
    if (error) {
      console.error('[Submissions] Supabase error:', error)
      return NextResponse.json({ error: 'Error fetching submissions' }, { status: 500 })
    }

    const submissions = (data || []).map(rowToSubmission)
    return NextResponse.json({ success: true, submissions })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSession(request)
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const {
      taskId, studentName, studentEmail, levelId, lessonId, courseId, schoolId,
      code, output, drawing, drawingUrl, files, attachmentUrls, answers
    } = body

    // La identidad viene de la SESIÓN (cuenta logueada), no de un nombre tecleado:
    // así cada entrega queda ligada al usuario real que la envió.
    const { data: cuenta } = await supabaseAdmin
      .from('users')
      .select('id, name, email, level_id, course_id, school_id')
      .eq('id', auth.session.id)
      .maybeSingle()
    const nombre = cuenta?.name || studentName || cuenta?.email || auth.session.email || 'Estudiante'

    const insertRow: Record<string, any> = {
      task_id: taskId || null,
      user_id: auth.session.id,
      student_name: nombre,
      student_email: cuenta?.email || auth.session.email || studentEmail || null,
      level_id: levelId || cuenta?.level_id || null,
      lesson_id: lessonId || null,
      course_id: courseId || cuenta?.course_id || null,
      school_id: schoolId || cuenta?.school_id || null,
      code: code || null,
      output: output || null,
      drawing: drawing || null,
      files: files || (answers ? answers : null),
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }
    if (drawingUrl) insertRow.drawing_url = drawingUrl
    if (Array.isArray(attachmentUrls) && attachmentUrls.length > 0) insertRow.attachment_urls = attachmentUrls

    const { data, error } = await supabaseAdmin.from('submissions').insert(insertRow).select().single()

    if (error) {
      console.error('Error creating submission:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, submission: rowToSubmission(data) })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const { submissionId, grade, feedback, status, gradedBy } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId es requerido' }, { status: 400 })
    }

    const fields: Record<string, any> = {}
    if (grade !== undefined) fields.grade = Number(grade)
    if (feedback !== undefined) fields.feedback = feedback
    if (status !== undefined) fields.status = status
    if (gradedBy !== undefined) fields.graded_by = gradedBy
    if (grade !== undefined || feedback !== undefined) {
      fields.graded_at = new Date().toISOString()
      if (!status) fields.status = 'graded'
    }

    const { error } = await supabaseAdmin.from('submissions').update(fields).eq('id', submissionId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Entrega calificada' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
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
