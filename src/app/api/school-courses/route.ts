import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function row(r: any) {
  return {
    id: r.id,
    schoolId: r.school_id,
    courseId: r.course_id,
    customName: r.custom_name || '',
    classroom: r.classroom || '',
    schedule: r.schedule || '',
    academicYear: r.academic_year || '',
    startDate: r.start_date || null,
    endDate: r.end_date || null,
    maxStudents: r.max_students || 0,
    teacherId: r.teacher_id || null,
    teacherName: r.teacher_name || '',
    notes: r.notes || '',
    isActive: r.is_active !== false,
    course: r.courses || null,
    school: r.schools || null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')
    const courseId = searchParams.get('courseId')

    let q = supabaseAdmin
      .from('school_courses')
      .select('*, courses(*), schools(id,name,city)')
      .order('created_at', { ascending: false })

    if (schoolId) q = q.eq('school_id', schoolId)
    if (courseId) q = q.eq('course_id', courseId)

    const { data, error } = await q
    if (error) return NextResponse.json({ items: [], error: error.message }, { status: 200 })
    return NextResponse.json({ items: (data || []).map(row) })
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e.message }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schoolId, courseId, customName, classroom, schedule, academicYear, startDate, endDate, maxStudents, teacherId, teacherName, notes, isActive } = body
    if (!schoolId || !courseId) return NextResponse.json({ error: 'schoolId y courseId requeridos' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('school_courses').insert({
      school_id: schoolId,
      course_id: courseId,
      custom_name: customName || null,
      classroom: classroom || null,
      schedule: schedule || null,
      academic_year: academicYear || null,
      start_date: startDate || null,
      end_date: endDate || null,
      max_students: maxStudents || null,
      teacher_id: teacherId || null,
      teacher_name: teacherName || null,
      notes: notes || null,
      is_active: isActive !== false,
    }).select('*, courses(*), schools(id,name,city)').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ item: row(data) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, customName, classroom, schedule, academicYear, startDate, endDate, maxStudents, teacherId, teacherName, notes, isActive } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('school_courses').update({
      custom_name: customName || null,
      classroom: classroom || null,
      schedule: schedule || null,
      academic_year: academicYear || null,
      start_date: startDate || null,
      end_date: endDate || null,
      max_students: maxStudents || null,
      teacher_id: teacherId || null,
      teacher_name: teacherName || null,
      notes: notes || null,
      is_active: isActive !== false,
    }).eq('id', id).select('*, courses(*), schools(id,name,city)').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ item: row(data) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const { error } = await supabaseAdmin.from('school_courses').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
