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
    const { id, name, description, levelId, levelName, type, duration, price } = body

    console.log('Creating program with body:', body)

    if (!name || !levelId) {
      return NextResponse.json(
        { success: false, error: 'Nombre y nivel son requeridos' },
        { status: 400 }
      )
    }

    // Generar ID si no viene
    const programId = id || `prog-${levelId}-${type || 'robotica'}-${Date.now()}`

    // Enviar campos a Airtable (todos como texto)
    const fields: Record<string, any> = {
      id: programId,
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
      id: programId,
      recordId: result.id
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
    const { id, recordId, ...updateData } = body

    console.log('Updating program:', { id, recordId, updateData })

    if (!id && !recordId) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    let airtableRecordId = recordId

    // Si no tenemos recordId, buscar por el campo id
    if (!airtableRecordId && id) {
      const records = await base(TABLE_NAME)
        .select({
          filterByFormula: `{id} = '${id}'`,
          maxRecords: 1
        })
        .firstPage()

      if (records.length > 0) {
        airtableRecordId = records[0].id
      }
    }

    // Si aún no encontramos, intentar usar id como recordId directo (formato rec...)
    if (!airtableRecordId && id && id.startsWith('rec')) {
      airtableRecordId = id
    }

    if (!airtableRecordId) {
      return NextResponse.json(
        { success: false, error: 'Programa no encontrado' },
        { status: 404 }
      )
    }

    // Preparar campos para actualizar
    const fields: Record<string, any> = {}
    if (updateData.name) fields.name = String(updateData.name)
    if (updateData.description !== undefined) fields.description = String(updateData.description || '')
    if (updateData.levelId) fields.levelId = String(updateData.levelId)
    if (updateData.levelName) fields.levelName = String(updateData.levelName)
    if (updateData.type) fields.type = String(updateData.type)
    if (updateData.duration) fields.duration = String(updateData.duration)
    if (updateData.price !== undefined) fields.price = Number(updateData.price) || 0
    if (updateData.isActive !== undefined) fields.isActive = Boolean(updateData.isActive)

    console.log('Updating Airtable record:', airtableRecordId, 'with fields:', fields)

    await base(TABLE_NAME).update(airtableRecordId, fields)

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
