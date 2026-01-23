import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_STUDENTS_TABLE = 'students'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_STUDENTS_TABLE}`

export interface Student {
  id: string
  name: string
  levelId: string
  courseId?: string
  email?: string
  createdAt: string
}

// GET - Obtener estudiantes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const courseId = searchParams.get('courseId')

    let filterFormula = ''
    const filters: string[] = []
    
    if (levelId) filters.push(`{levelId}="${levelId}"`)
    if (courseId) filters.push(`{courseId}="${courseId}"`)
    
    if (filters.length > 0) {
      filterFormula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(',')})`
    }

    let url = AIRTABLE_API_URL + '?sort[0][field]=name&sort[0][direction]=asc'
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
      console.error('Airtable students error:', errorText)
      // Si la tabla no existe, devolver array vacío
      if (errorText.includes('NOT_FOUND') || errorText.includes('TABLE_NOT_FOUND')) {
        return NextResponse.json({ success: true, students: [], message: 'Tabla students no existe en Airtable. Créala primero.' })
      }
      return NextResponse.json({ error: 'Error fetching students' }, { status: 500 })
    }

    const data = await response.json()
    
    const students: Student[] = data.records.map((record: any) => ({
      id: record.id,
      name: record.fields.name || '',
      levelId: record.fields.levelId || '',
      courseId: record.fields.courseId || '',
      email: record.fields.email || '',
      createdAt: record.fields.createdAt || record.createdTime,
    }))

    return NextResponse.json({ success: true, students })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear estudiante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, levelId, courseId, email } = body

    if (!name) {
      return NextResponse.json({ error: 'name es requerido' }, { status: 400 })
    }

    const fields: Record<string, any> = {
      name,
      levelId: levelId || '',
      courseId: courseId || '',
      createdAt: new Date().toISOString(),
    }
    
    if (email) fields.email = email

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
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating student', message: errorText }, { status: 500 })
    }

    const data = await response.json()
    const record = data.records[0]
    
    return NextResponse.json({ 
      success: true, 
      student: {
        id: record.id,
        name: record.fields.name,
        levelId: record.fields.levelId,
        courseId: record.fields.courseId,
        email: record.fields.email,
        createdAt: record.fields.createdAt,
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar estudiante
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
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error deleting student' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
