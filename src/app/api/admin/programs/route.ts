import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Obtener todos los programas
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching programs:', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener programas', programs: [] },
        { status: 500 }
      )
    }

    const programs = (data || []).map((row: any) => ({
      id: row.id,
      recordId: row.id,
      name: row.name || '',
      description: row.description || '',
      levelId: row.level_id || '',
      levelName: row.level_name || '',
      type: row.type || 'robotica',
      duration: row.duration || '',
      price: row.price || 0,
      isActive: row.is_active !== false
    }))

    return NextResponse.json({ success: true, programs })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener programas', programs: [] },
      { status: 500 }
    )
  }
}

// POST - Crear programa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, levelId, levelName, type, duration, price } = body

    if (!name || !levelId) {
      return NextResponse.json(
        { success: false, error: 'Nombre y nivel son requeridos' },
        { status: 400 }
      )
    }

    const programId = id || `prog-${levelId}-${type || 'robotica'}-${Date.now()}`
    const insert: Record<string, any> = {
      id: programId,
      name: String(name),
      level_id: String(levelId),
    }
    if (description) insert.description = String(description)
    if (levelName) insert.level_name = String(levelName)
    if (type) insert.type = String(type)
    if (duration) insert.duration = String(duration)
    if (price !== undefined && price !== '') insert.price = Number(price) || 0

    const { error } = await supabaseAdmin.from('programs').insert(insert)
    if (error) {
      console.error('Error creating program:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al crear programa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Programa creado exitosamente',
      id: programId,
    })
  } catch (error: any) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al crear programa', details: String(error) },
      { status: 500 }
    )
  }
}

// PUT - Actualizar programa
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, recordId, ...updateData } = body
    const searchId = id || recordId

    if (!searchId) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const fields: Record<string, any> = {}
    if (updateData.name !== undefined) fields.name = String(updateData.name)
    if (updateData.description !== undefined) fields.description = String(updateData.description || '')
    if (updateData.levelId !== undefined) fields.level_id = String(updateData.levelId)
    if (updateData.levelName !== undefined) fields.level_name = String(updateData.levelName)
    if (updateData.type !== undefined) fields.type = String(updateData.type)
    if (updateData.duration !== undefined) fields.duration = String(updateData.duration)
    if (updateData.price !== undefined) fields.price = Number(updateData.price) || 0
    if (updateData.isActive !== undefined) fields.is_active = Boolean(updateData.isActive)
    if (updateData.id !== undefined && updateData.id !== searchId) fields.id = updateData.id

    const { error } = await supabaseAdmin.from('programs').update(fields).eq('id', searchId)
    if (error) {
      console.error('Error updating program:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al actualizar programa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Programa actualizado exitosamente'
    })
  } catch (error: any) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al actualizar programa' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar programa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.from('programs').delete().eq('id', id)
    if (error) {
      console.error('Error deleting program:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al eliminar programa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Programa eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar programa' },
      { status: 500 }
    )
  }
}
