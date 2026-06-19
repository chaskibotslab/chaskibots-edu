import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToStudent(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    levelId: row.level_id || '',
    courseId: row.course_id || '',
    schoolId: row.school_id || '',
    email: row.email || '',
    accessCode: row.access_code || '',
    createdAt: row.created_at || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const courseId = searchParams.get('courseId')
    const schoolId = searchParams.get('schoolId')

    let query = supabaseAdmin.from('students').select('*').order('name')
    if (levelId) query = query.eq('level_id', levelId)
    if (courseId) query = query.eq('course_id', courseId)
    if (schoolId) query = query.eq('school_id', schoolId)

    const { data, error } = await query
    if (error) {
      console.error('[Students] Supabase error:', error)
      return NextResponse.json({ students: [] })
    }

    return NextResponse.json({ success: true, students: (data || []).map(rowToStudent) })
  } catch (error) {
    return NextResponse.json({ students: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, levelId, courseId, schoolId, email, accessCode } = body

    if (!name) return NextResponse.json({ error: 'name requerido' }, { status: 400 })

    const code = accessCode || `STU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const { data, error } = await supabaseAdmin.from('students').insert({
      name,
      level_id: levelId || null,
      course_id: courseId || null,
      school_id: schoolId || null,
      email: email || null,
      access_code: code,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, student: rowToStudent(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const fields: Record<string, any> = {}
    if (updates.name !== undefined) fields.name = updates.name
    if (updates.levelId !== undefined) fields.level_id = updates.levelId
    if (updates.courseId !== undefined) fields.course_id = updates.courseId
    if (updates.schoolId !== undefined) fields.school_id = updates.schoolId
    if (updates.email !== undefined) fields.email = updates.email
    if (updates.accessCode !== undefined) fields.access_code = updates.accessCode

    const { error } = await supabaseAdmin.from('students').update(fields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const { error } = await supabaseAdmin.from('students').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
