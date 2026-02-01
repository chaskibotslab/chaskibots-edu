import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'documents'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export interface Document {
  id: string
  title: string
  description: string
  driveUrl: string
  levelId: string
  moduleId?: string
  category: 'codigo' | 'tutorial' | 'ejercicio' | 'referencia' | 'otro'
  tags: string[]
  createdAt: string
  isActive: boolean
}

// GET - Obtener documentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const category = searchParams.get('category')

    let filterFormula = ''
    const filters: string[] = []
    
    if (levelId) filters.push(`{levelId}="${levelId}"`)
    if (category) filters.push(`{category}="${category}"`)
    filters.push(`{isActive}=TRUE()`)
    
    if (filters.length > 0) {
      filterFormula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(',')})`
    }

    let url = AIRTABLE_API_URL + '?sort[0][field]=createdAt&sort[0][direction]=desc'
    if (filterFormula) {
      url += `&filterByFormula=${encodeURIComponent(filterFormula)}`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable documents error:', errorText)
      return NextResponse.json({ error: 'Error fetching documents' }, { status: 500 })
    }

    const data = await response.json()
    
    const documents: Document[] = data.records.map((record: any) => ({
      id: record.id,
      title: record.fields.title || '',
      description: record.fields.description || '',
      driveUrl: record.fields.driveUrl || '',
      levelId: record.fields.levelId || '',
      moduleId: record.fields.moduleId || '',
      category: record.fields.category || 'otro',
      tags: (record.fields.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      createdAt: record.fields.createdAt || new Date().toISOString(),
      isActive: record.fields.isActive !== false
    }))

    return NextResponse.json({ success: true, documents })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear nuevo documento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, driveUrl, levelId, moduleId, category, tags } = body

    if (!title || !driveUrl || !levelId) {
      return NextResponse.json(
        { error: 'title, driveUrl y levelId son requeridos' },
        { status: 400 }
      )
    }

    const fields: Record<string, any> = {
      title: String(title),
      description: String(description || ''),
      driveUrl: String(driveUrl),
      levelId: String(levelId),
      moduleId: String(moduleId || ''),
      category: category || 'codigo',
      tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
      createdAt: new Date().toISOString(),
      isActive: true
    }

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Airtable error:', errorData)
      return NextResponse.json({ error: 'Error creating document', details: errorData }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, document: data.records[0] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Actualizar documento
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const fields: Record<string, any> = {}
    if (updates.title !== undefined) fields.title = String(updates.title)
    if (updates.description !== undefined) fields.description = String(updates.description)
    if (updates.driveUrl !== undefined) fields.driveUrl = String(updates.driveUrl)
    if (updates.levelId !== undefined) fields.levelId = String(updates.levelId)
    if (updates.moduleId !== undefined) fields.moduleId = String(updates.moduleId)
    if (updates.category !== undefined) fields.category = updates.category
    if (updates.tags !== undefined) fields.tags = Array.isArray(updates.tags) ? updates.tags.join(', ') : updates.tags
    if (updates.isActive !== undefined) fields.isActive = updates.isActive

    const response = await fetch(`${AIRTABLE_API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: 'Error updating document', details: errorData }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar documento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const response = await fetch(`${AIRTABLE_API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error deleting document' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
