import { NextRequest, NextResponse } from 'next/server'

// API para registrar retos completados del simulador 3D
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'simulator_challenges'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export interface SimulatorChallenge {
  id: string
  challengeId: string
  challengeName: string
  challengeCategory: string
  challengeDifficulty: string
  studentName: string
  studentEmail?: string
  courseId?: string
  schoolId?: string
  completedAt: string
  status: 'completed' | 'verified'
  verifiedBy?: string
  verifiedAt?: string
}

// GET - Obtener retos completados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('studentName')
    const studentEmail = searchParams.get('studentEmail')
    const courseId = searchParams.get('courseId')
    const schoolId = searchParams.get('schoolId')
    const category = searchParams.get('category')

    let filterFormula = ''
    const filters: string[] = []
    
    if (studentName) filters.push(`{studentName}="${studentName}"`)
    if (studentEmail) filters.push(`{studentEmail}="${studentEmail}"`)
    if (courseId) filters.push(`{courseId}="${courseId}"`)
    if (schoolId) filters.push(`{schoolId}="${schoolId}"`)
    if (category) filters.push(`{challengeCategory}="${category}"`)
    
    if (filters.length > 0) {
      filterFormula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(',')})`
    }

    let url = AIRTABLE_API_URL + '?sort[0][field]=completedAt&sort[0][direction]=desc'
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
      console.error('Airtable simulator_challenges error:', errorText)
      return NextResponse.json({ error: 'Error fetching challenges' }, { status: 500 })
    }

    const data = await response.json()
    
    const challenges: SimulatorChallenge[] = data.records.map((record: any) => ({
      id: record.id,
      challengeId: record.fields.challengeId || '',
      challengeName: record.fields.challengeName || '',
      challengeCategory: record.fields.challengeCategory || '',
      challengeDifficulty: record.fields.challengeDifficulty || '',
      studentName: record.fields.studentName || '',
      studentEmail: record.fields.studentEmail || '',
      courseId: record.fields.courseId || '',
      schoolId: record.fields.schoolId || '',
      completedAt: record.fields.completedAt || '',
      status: record.fields.status || 'completed',
      verifiedBy: record.fields.verifiedBy || '',
      verifiedAt: record.fields.verifiedAt || '',
    }))

    return NextResponse.json({ success: true, challenges })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Registrar nuevo reto completado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('POST /api/simulator-challenges - body:', body)
    
    const { 
      challengeId, 
      challengeName, 
      challengeCategory, 
      challengeDifficulty,
      studentName, 
      studentEmail,
      courseId,
      schoolId
    } = body

    if (!challengeId || !studentName) {
      return NextResponse.json(
        { error: 'challengeId y studentName son requeridos' },
        { status: 400 }
      )
    }

    const fields: any = {
      challengeId,
      challengeName: challengeName || challengeId,
      challengeCategory: challengeCategory || 'laberinto',
      challengeDifficulty: challengeDifficulty || 'easy',
      studentName,
      studentEmail: studentEmail || '',
      courseId: courseId || '',
      schoolId: schoolId || '',
      completedAt: new Date().toISOString(),
      status: 'completed'
    }

    console.log('Creating simulator challenge with fields:', fields)

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating challenge record', details: errorText }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      challenge: data.records[0],
      message: '¡Reto registrado exitosamente!'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Verificar reto (para docentes)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, verifiedBy } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    const fields: Record<string, any> = {
      status: status || 'verified',
      verifiedAt: new Date().toISOString()
    }
    
    if (verifiedBy) {
      fields.verifiedBy = verifiedBy
    }

    console.log('PATCH simulator challenge:', id, fields)

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id,
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable PATCH error:', errorText)
      return NextResponse.json({ error: 'Error updating challenge', details: errorText }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Reto verificado' })
  } catch (error) {
    console.error('PATCH Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar registro de reto
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
      return NextResponse.json({ error: 'Error deleting challenge' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
