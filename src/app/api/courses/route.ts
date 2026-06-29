import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function row(r: any) {
  return {
    id: r.id,
    name: r.name,
    description: r.description || '',
    levelId: r.level_id || '',
    programId: r.program_id || '',
    durationHours: r.duration_hours || 0,
    modality: r.modality || 'presencial',
    icon: r.icon || '📚',
    color: r.color || '#7C3AED',
    coverImage: r.cover_image || '',
    isActive: r.is_active !== false,
    createdAt: r.created_at,
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('name')
    if (error) return NextResponse.json({ courses: [], error: error.message }, { status: 200 })
    return NextResponse.json({ courses: (data || []).map(row) })
  } catch (e: any) {
    return NextResponse.json({ courses: [], error: e.message }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, levelId, programId, durationHours, modality, icon, color, coverImage, isActive } = body
    if (!name) return NextResponse.json({ error: 'name requerido' }, { status: 400 })
    const id = body.id || `curso-${Date.now()}`
    const { data, error } = await supabaseAdmin.from('courses').insert({
      id, name,
      description: description || null,
      level_id: levelId || null,
      program_id: programId || null,
      duration_hours: durationHours || null,
      modality: modality || 'presencial',
      icon: icon || '📚',
      color: color || '#7C3AED',
      cover_image: coverImage || null,
      is_active: isActive !== false,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ course: row(data) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, levelId, programId, durationHours, modality, icon, color, coverImage, isActive } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const { data, error } = await supabaseAdmin.from('courses').update({
      name,
      description: description || null,
      level_id: levelId || null,
      program_id: programId || null,
      duration_hours: durationHours || null,
      modality: modality || 'presencial',
      icon: icon || '📚',
      color: color || '#7C3AED',
      cover_image: coverImage || null,
      is_active: isActive !== false,
    }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ course: row(data) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const { error } = await supabaseAdmin.from('courses').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
