import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - Obtener todos los niveles desde Supabase
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('levels')
      .select('*')
      .order('grade_number', { ascending: true })

    if (error) {
      console.error('Error fetching levels:', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener niveles', levels: [] },
        { status: 500 }
      )
    }

    const levels = (data || []).map((row: any) => ({
      id: row.id,
      recordId: row.id,
      name: row.name || '',
      fullName: row.full_name || row.name || '',
      category: row.category || 'elemental',
      ageRange: row.age_range || '',
      gradeNumber: row.grade_number || 0,
      color: row.color || 'from-blue-500 to-cyan-600',
      neonColor: row.neon_color || '#00d4ff',
      icon: row.icon || 'BookOpen',
      kitPrice: row.kit_price || 50,
      hasHacking: row.has_hacking || false,
      hasAdvancedIA: row.has_advanced_ia || false,
    }))

    return NextResponse.json({ success: true, levels })
  } catch (error) {
    console.error('Error fetching levels:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener niveles', levels: [] },
      { status: 500 }
    )
  }
}

// POST - Crear nivel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, fullName, category, ageRange, gradeNumber, kitPrice, hasHacking, hasAdvancedIA, color, neonColor, icon } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nombre es requerido' },
        { status: 400 }
      )
    }

    const insert: Record<string, any> = {
      id: id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50),
      name,
    }
    if (fullName) insert.full_name = fullName
    if (category) insert.category = category
    if (ageRange) insert.age_range = ageRange
    if (gradeNumber !== undefined) insert.grade_number = Number(gradeNumber) || 1
    if (kitPrice !== undefined) insert.kit_price = Number(kitPrice) || 50
    if (hasHacking !== undefined) insert.has_hacking = hasHacking
    if (hasAdvancedIA !== undefined) insert.has_advanced_ia = hasAdvancedIA
    if (color) insert.color = color
    if (neonColor) insert.neon_color = neonColor
    if (icon) insert.icon = icon

    const { error } = await supabaseAdmin.from('levels').insert(insert)
    if (error) {
      console.error('Error creating level:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al crear nivel' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nivel creado exitosamente'
    })
  } catch (error) {
    console.error('Error creating level:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear nivel' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar nivel
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { originalId, recordId, ...updateData } = body
    const searchId = originalId || recordId || updateData.id

    if (!searchId) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const fields: Record<string, any> = {}
    if (updateData.name !== undefined) fields.name = updateData.name
    if (updateData.fullName !== undefined) fields.full_name = updateData.fullName
    if (updateData.category !== undefined) fields.category = updateData.category
    if (updateData.ageRange !== undefined) fields.age_range = updateData.ageRange
    if (updateData.gradeNumber !== undefined) fields.grade_number = Number(updateData.gradeNumber) || 1
    if (updateData.kitPrice !== undefined) fields.kit_price = Number(updateData.kitPrice) || 50
    if (updateData.hasHacking !== undefined) fields.has_hacking = updateData.hasHacking
    if (updateData.hasAdvancedIA !== undefined) fields.has_advanced_ia = updateData.hasAdvancedIA
    if (updateData.color !== undefined) fields.color = updateData.color
    if (updateData.neonColor !== undefined) fields.neon_color = updateData.neonColor
    if (updateData.icon !== undefined) fields.icon = updateData.icon
    if (updateData.id !== undefined && updateData.id !== searchId) fields.id = updateData.id

    const { error } = await supabaseAdmin.from('levels').update(fields).eq('id', searchId)
    if (error) {
      console.error('Error updating level:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al actualizar nivel' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nivel actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error updating level:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar nivel' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar nivel
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

    const { error } = await supabaseAdmin.from('levels').delete().eq('id', id)
    if (error) {
      console.error('Error deleting level:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al eliminar nivel' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nivel eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting level:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar nivel' },
      { status: 500 }
    )
  }
}
