import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

const TABLE_NAME = 'programs'

// POST - Crear programa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, levelId, levelName, type, duration, price } = body

    if (!name || !levelId || !type) {
      return NextResponse.json(
        { success: false, error: 'Nombre, nivel y tipo son requeridos' },
        { status: 400 }
      )
    }

    const programId = id || `prog-${levelId}-${type}-${Date.now()}`

    // Solo enviar campos que existen en Airtable
    const fields: Record<string, any> = {
      name,
      levelId,
      type,
    }
    
    // Campos opcionales
    if (description) fields.description = description
    if (levelName) fields.levelName = levelName
    if (duration) fields.duration = duration
    if (price !== undefined) fields.price = Number(price) || 50

    await base(TABLE_NAME).create(fields)

    return NextResponse.json({
      success: true,
      message: 'Programa creado exitosamente'
    })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear programa' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar programa
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

    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{id} = '${id}'`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Programa no encontrado' },
        { status: 404 }
      )
    }

    await base(TABLE_NAME).update(records[0].id, updateData)

    return NextResponse.json({
      success: true,
      message: 'Programa actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar programa' },
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

    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{id} = '${id}'`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Programa no encontrado' },
        { status: 404 }
      )
    }

    await base(TABLE_NAME).destroy(records[0].id)

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
