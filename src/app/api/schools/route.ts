import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToSchool(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    code: row.code || '',
    address: row.address || '',
    city: row.city || '',
    country: row.country || '',
    phone: row.phone || '',
    email: row.email || '',
    maxStudents: row.max_students || 0,
    maxTeachers: row.max_teachers || 0,
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('schools').select('*').order('name')
    if (error) return NextResponse.json({ schools: [] })
    return NextResponse.json({ success: true, schools: (data || []).map(rowToSchool) })
  } catch (error) {
    return NextResponse.json({ schools: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, code, address, city, country, phone, email, maxStudents, maxTeachers } = body
    if (!name) return NextResponse.json({ error: 'name requerido' }, { status: 400 })

    const schoolId = id || code || `school-${Date.now()}`

    const { data, error } = await supabaseAdmin.from('schools').insert({
      id: schoolId, name, code: code || null, address: address || null, city: city || null,
      country: country || null, phone: phone || null, email: email || null,
      max_students: maxStudents || null, max_teachers: maxTeachers || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, school: rowToSchool(data) })
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
    if (updates.code !== undefined) fields.code = updates.code
    if (updates.address !== undefined) fields.address = updates.address
    if (updates.city !== undefined) fields.city = updates.city
    if (updates.country !== undefined) fields.country = updates.country
    if (updates.phone !== undefined) fields.phone = updates.phone
    if (updates.email !== undefined) fields.email = updates.email
    if (updates.maxStudents !== undefined) fields.max_students = updates.maxStudents
    if (updates.maxTeachers !== undefined) fields.max_teachers = updates.maxTeachers

    const { error } = await supabaseAdmin.from('schools').update(fields).eq('id', id)
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

    const { error } = await supabaseAdmin.from('schools').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
