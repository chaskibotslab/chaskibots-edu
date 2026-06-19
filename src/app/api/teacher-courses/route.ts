import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToTC(row: any) {
  return {
    id: row.id,
    teacherId: row.teacher_id || '',
    teacherName: row.teacher_name || '',
    courseId: row.course_id || '',
    courseName: row.course_name || '',
    levelId: row.level_id || '',
    schoolId: row.school_id || '',
    schoolName: row.school_name || '',
    createdAt: row.created_at || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const schoolId = searchParams.get('schoolId')

    let query = supabaseAdmin.from('teacher_courses').select('*').order('created_at', { ascending: false })
    if (teacherId) query = query.eq('teacher_id', teacherId)
    if (schoolId) query = query.eq('school_id', schoolId)

    const { data, error } = await query
    if (error) return NextResponse.json({ assignments: [] })
    return NextResponse.json({ success: true, assignments: (data || []).map(rowToTC) })
  } catch (error) {
    return NextResponse.json({ assignments: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, teacherName, courseId, courseName, levelId, schoolId, schoolName } = body
    if (!teacherId) return NextResponse.json({ error: 'teacherId requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('teacher_courses').insert({
      teacher_id: teacherId, teacher_name: teacherName || null,
      course_id: courseId || null, course_name: courseName || null,
      level_id: levelId || null, school_id: schoolId || null, school_name: schoolName || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, assignment: rowToTC(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const { error } = await supabaseAdmin.from('teacher_courses').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
