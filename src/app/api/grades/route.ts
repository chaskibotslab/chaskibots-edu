import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToGrade(row: any) {
  return {
    id: row.id,
    studentName: row.student_name || '',
    studentId: row.student_id || '',
    lessonId: row.lesson_id || '',
    levelId: row.level_id || '',
    courseId: row.course_id || '',
    schoolId: row.school_id || '',
    taskId: row.task_id || '',
    score: row.score,
    feedback: row.feedback || '',
    submittedAt: row.submitted_at || '',
    gradedAt: row.graded_at || '',
    gradedBy: row.graded_by || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const studentName = searchParams.get('studentName')
    const levelId = searchParams.get('levelId')
    const courseId = searchParams.get('courseId')

    let query = supabaseAdmin.from('grades').select('*').order('graded_at', { ascending: false })
    if (studentId) query = query.eq('student_id', studentId)
    if (studentName) query = query.eq('student_name', studentName)
    if (levelId) query = query.eq('level_id', levelId)
    if (courseId) query = query.eq('course_id', courseId)

    const { data, error } = await query
    if (error) {
      console.error('[Grades] error:', error)
      return NextResponse.json({ grades: [] })
    }

    return NextResponse.json({ success: true, grades: (data || []).map(rowToGrade) })
  } catch (error) {
    return NextResponse.json({ grades: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, studentId, lessonId, levelId, courseId, schoolId, taskId, score, feedback, gradedBy } = body

    const { data, error } = await supabaseAdmin.from('grades').insert({
      student_name: studentName || null,
      student_id: studentId || null,
      lesson_id: lessonId || null,
      level_id: levelId || null,
      course_id: courseId || null,
      school_id: schoolId || null,
      task_id: taskId || null,
      score: score !== undefined ? Number(score) : null,
      feedback: feedback || null,
      graded_by: gradedBy || null,
      submitted_at: new Date().toISOString(),
      graded_at: new Date().toISOString(),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, grade: rowToGrade(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
