import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

const TABLE_NAME = 'levels'

// POST - Crear nivel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, fullName, category, ageRange, gradeNumber, kitPrice, hasHacking, hasAdvancedIA, color, neonColor, icon } = body

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'ID y nombre son requeridos' },
        { status: 400 }
      )
    }

    await base(TABLE_NAME).create({
      id,
      name,
      fullName: fullName || name,
      category: category || 'elemental',
      ageRange: ageRange || '',
      gradeNumber: gradeNumber || 1,
      kitPrice: kitPrice || 50,
      hasHacking: hasHacking || false,
      hasAdvancedIA: hasAdvancedIA || false,
      color: color || 'from-blue-500 to-cyan-600',
      neonColor: neonColor || '#00d4ff',
      icon: icon || '📚'
    })

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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Buscar el registro por el campo 'id'
    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{id} = '${id}'`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    await base(TABLE_NAME).update(records[0].id, updateData)

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

    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{id} = '${id}'`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    await base(TABLE_NAME).destroy(records[0].id)

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
