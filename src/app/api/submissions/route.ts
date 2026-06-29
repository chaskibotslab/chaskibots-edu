import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToSubmission(row: any) {
  return {
    id: row.id,
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
  try {
    const body = await request.json()
    const {
      taskId, studentName, studentEmail, levelId, lessonId, courseId, schoolId,
      code, output, drawing, drawingUrl, files, attachmentUrls, answers
    } = body

    if (!studentName) {
      return NextResponse.json({ error: 'studentName es requerido' }, { status: 400 })
    }

    const insertRow: Record<string, any> = {
      task_id: taskId || null,
      student_name: studentName,
      student_email: studentEmail || null,
      level_id: levelId || null,
      lesson_id: lessonId || null,
      course_id: courseId || null,
      school_id: schoolId || null,
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
