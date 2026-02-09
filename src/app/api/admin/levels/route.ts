import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

const TABLE_NAME = 'levels'

// GET - Obtener todos los niveles desde Airtable
export async function GET() {
  try {
    const records = await base(TABLE_NAME)
      .select({
        sort: [{ field: 'gradeNumber', direction: 'asc' }]
      })
      .all()

    const levels = records.map((record: any) => ({
      id: record.fields.id || record.id,
      recordId: record.id,
      name: record.fields.name || '',
      fullName: record.fields.fullName || record.fields.name || '',
      category: record.fields.category || 'elemental',
      ageRange: record.fields.ageRange || '',
      gradeNumber: record.fields.gradeNumber || 0,
      color: record.fields.color || 'from-blue-500 to-cyan-600',
      neonColor: record.fields.neonColor || '#00d4ff',
      icon: record.fields.icon || 'BookOpen',
      kitPrice: record.fields.kitPrice || 50,
      hasHacking: record.fields.hasHacking || false,
      hasAdvancedIA: record.fields.hasAdvancedIA || false,
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

    // Solo enviar campos que existen en Airtable
    const fields: Record<string, any> = {
      name,
    }
    
    // Campos opcionales - solo agregar si tienen valor
    if (id) fields.id = id
    if (fullName) fields.fullName = fullName
    if (category) fields.category = category
    if (ageRange) fields.ageRange = ageRange
    if (gradeNumber !== undefined) fields.gradeNumber = Number(gradeNumber) || 1
    if (kitPrice !== undefined) fields.kitPrice = Number(kitPrice) || 50
    if (hasHacking !== undefined) fields.hasHacking = hasHacking
    if (hasAdvancedIA !== undefined) fields.hasAdvancedIA = hasAdvancedIA
    if (color) fields.color = color
    if (neonColor) fields.neonColor = neonColor
    if (icon) fields.icon = icon

    await base(TABLE_NAME).create(fields)

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
    // Excluir originalId y recordId de los datos a enviar a Airtable
    const { originalId, recordId, ...updateData } = body

    // Usar originalId para buscar, o id si no hay originalId
    const searchId = originalId || updateData.id

    if (!searchId) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    console.log('Updating level, searching by:', searchId)

    // Buscar el registro por el campo 'id' original
    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{id} = '${searchId}'`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar incluyendo el nuevo id si cambió
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
