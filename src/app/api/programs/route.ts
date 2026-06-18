import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Obtener programas (todos o filtrados por nivel)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')

  try {
    let query = supabaseAdmin
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (levelId) query = query.eq('level_id', levelId)

    const { data, error } = await query

    if (error) {
      console.error('[Programs] Supabase error:', error)
      return NextResponse.json({ success: false, programs: [] })
    }

    const programs = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      levelId: row.level_id,
      levelName: row.level_name,
      type: row.type,
      duration: row.duration,
      price: row.price,
      isActive: row.is_active,
    }))

    return NextResponse.json({ success: true, programs })
  } catch (error: any) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({ success: false, programs: [] })
  }
}

// POST - Crear programa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, levelId, levelName, type, duration, price } = body

    if (!name || !levelId || !type) {
      return NextResponse.json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const programId = `prog-${levelId}-${type}-${Date.now()}`

    const { error } = await supabaseAdmin.from('programs').insert({
      id: programId,
      name,
      description: description || '',
      level_id: levelId,
      level_name: levelName || '',
      type,
      duration: duration || '6 meses',
      price: price || 50,
      is_active: true,
    })

    if (error) {
      console.error('Error creating program:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      program: { id: programId, name, description, levelId, levelName, type, duration, price, isActive: true },
      message: 'Programa creado exitosamente',
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al crear programa' }, { status: 500 })
  }
}

// PATCH - Actualizar programa
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId, name, description, levelId, levelName, type, duration, price, isActive } = body

    if (!programId) {
      return NextResponse.json({ success: false, error: 'programId es requerido' }, { status: 400 })
    }

    const fields: Record<string, any> = {}
    if (name !== undefined) fields.name = name
    if (description !== undefined) fields.description = description
    if (levelId !== undefined) fields.level_id = levelId
    if (levelName !== undefined) fields.level_name = levelName
    if (type !== undefined) fields.type = type
    if (duration !== undefined) fields.duration = duration
    if (price !== undefined) fields.price = price
    if (isActive !== undefined) fields.is_active = isActive

    const { error } = await supabaseAdmin.from('programs').update(fields).eq('id', programId)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Programa actualizado exitosamente' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al actualizar programa' }, { status: 500 })
  }
}

// DELETE - Eliminar programa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json({ success: false, error: 'programId es requerido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('programs').delete().eq('id', programId)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Programa eliminado exitosamente' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al eliminar programa' }, { status: 500 })
  }
}
