import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

// GET - Obtener programas (todos o filtrados por nivel)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')

    let filterFormula = '{isActive} = TRUE()'
    if (levelId) {
      filterFormula = `AND({levelId} = '${levelId}', {isActive} = TRUE())`
    }

    const records = await base('programs')
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'name', direction: 'asc' }]
      })
      .all()

    const programs = records.map(record => ({
      id: record.fields.id as string,
      name: record.fields.name as string,
      description: record.fields.description as string,
      levelId: record.fields.levelId as string,
      levelName: record.fields.levelName as string,
      type: record.fields.type as string,
      duration: record.fields.duration as string,
      price: record.fields.price as number,
      isActive: record.fields.isActive as boolean
    }))

    return NextResponse.json({ success: true, programs })
  } catch (error) {
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
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Generar ID único
    const programId = `prog-${levelId}-${type}-${Date.now()}`

    const record = await base('programs').create({
      id: programId,
      name,
      description: description || '',
      levelId,
      levelName: levelName || '',
      type,
      duration: duration || '6 meses',
      price: price || 50,
      isActive: true,
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      program: {
        id: programId,
        name,
        description,
        levelId,
        levelName,
        type,
        duration,
        price,
        isActive: true
      },
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
