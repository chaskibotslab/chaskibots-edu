import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

const TABLE_NAME = 'programs'

// GET - Obtener todos los programas
export async function GET() {
  try {
    const records = await base(TABLE_NAME)
      .select({
        sort: [{ field: 'name', direction: 'asc' }]
      })
      .all()

    const programs = records.map((record: any) => ({
      id: record.fields.id || record.id,
      recordId: record.id,
      name: record.fields.name || '',
      description: record.fields.description || '',
      levelId: record.fields.levelId || '',
      levelName: record.fields.levelName || '',
      type: record.fields.type || 'robotica',
      duration: record.fields.duration || '',
      price: record.fields.price || 0,
      isActive: record.fields.isActive !== false
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
    const { name, description, levelId, levelName, type, duration, price } = body

    console.log('Creating program with body:', body)

    if (!name || !levelId) {
      return NextResponse.json(
        { success: false, error: 'Nombre y nivel son requeridos' },
        { status: 400 }
      )
    }

    // Enviar campos a Airtable (todos como texto)
    const fields: Record<string, any> = {
      name: String(name),
      levelId: String(levelId),
    }
    
    // Campos opcionales
    if (description) fields.description = String(description)
    if (levelName) fields.levelName = String(levelName)
    if (type) fields.type = String(type)
    if (duration) fields.duration = String(duration)
    if (price !== undefined && price !== '') fields.price = Number(price) || 0

    console.log('Sending fields to Airtable:', fields)

    const result = await base(TABLE_NAME).create(fields)
    console.log('Program created:', result.id)

    return NextResponse.json({
      success: true,
      message: 'Programa creado exitosamente',
      id: result.id
    })
  } catch (error: any) {
    console.error('Error creating program:', error)
    const errorMessage = error?.message || error?.error?.message || 'Error al crear programa'
    return NextResponse.json(
      { success: false, error: errorMessage, details: String(error) },
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
