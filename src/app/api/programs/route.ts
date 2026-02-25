import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'
import { cache } from '@/lib/cache'
import { getUserFriendlyError } from '@/lib/airtable-errors'

export const dynamic = 'force-dynamic'

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID || '')

// GET - Obtener programas (todos o filtrados por nivel)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')
  
  // Caché de programas - 30 minutos
  const CACHE_KEY = `programs:${levelId || 'all'}`

  try {
    // Intentar obtener del caché primero
    const cached = cache.get<any>(CACHE_KEY)
    if (cached) {
      console.log('[Programs API] Usando caché para:', levelId || 'todos')
      return NextResponse.json({ success: true, programs: cached })
    }

    console.log('[Programs API] Consultando Airtable para:', levelId || 'todos')

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

    // Guardar en caché
    cache.set(CACHE_KEY, programs)

    return NextResponse.json({ success: true, programs })
  } catch (error: any) {
    console.error('Error fetching programs:', error)
    
    // Mensaje amigable para límite de API
    const errorMessage = error?.message || ''
    if (errorMessage.includes('429') || errorMessage.includes('BILLING_LIMIT')) {
      return NextResponse.json(
        { success: false, error: getUserFriendlyError(429, errorMessage), programs: [] },
        { status: 429 }
      )
    }
    
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

// PATCH - Actualizar programa
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId, name, description, levelId, levelName, type, duration, price, isActive } = body

    if (!programId) {
      return NextResponse.json(
        { success: false, error: 'programId es requerido' },
        { status: 400 }
      )
    }

    const fields: Record<string, unknown> = {}
    if (name !== undefined) fields.name = name
    if (description !== undefined) fields.description = description
    if (levelId !== undefined) fields.levelId = levelId
    if (levelName !== undefined) fields.levelName = levelName
    if (type !== undefined) fields.type = type
    if (duration !== undefined) fields.duration = duration
    if (price !== undefined) fields.price = price
    if (isActive !== undefined) fields.isActive = isActive

    await base('programs').update(programId, fields)

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
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json(
        { success: false, error: 'programId es requerido' },
        { status: 400 }
      )
    }

    await base('programs').destroy(programId)

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
