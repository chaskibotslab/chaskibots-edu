import { NextRequest, NextResponse } from 'next/server'

// API para registrar retos completados del simulador 3D
// Usa la tabla 'submissions' con taskId que empieza con 'simulator-challenge-'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'submissions'

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

// GET - Obtener retos completados del simulador
// Filtra submissions donde taskId empieza con 'simulator-challenge-'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('studentName')
    const studentEmail = searchParams.get('studentEmail')
    const courseId = searchParams.get('courseId')
    const schoolId = searchParams.get('schoolId')
    const category = searchParams.get('category')

    // Siempre filtrar por taskId que empiece con 'simulator-challenge-'
    const filters: string[] = ['FIND("simulator-challenge-",{taskId})>0']
    
    if (studentName) filters.push(`{studentName}="${studentName}"`)
    if (studentEmail) filters.push(`{studentEmail}="${studentEmail}"`)
    if (courseId) filters.push(`{courseId}="${courseId}"`)
    if (schoolId) filters.push(`{schoolId}="${schoolId}"`)
    // category se guarda en el campo 'output' como JSON
    if (category) filters.push(`FIND("${category}",{output})>0`)
    
    const filterFormula = `AND(${filters.join(',')})`

    let url = AIRTABLE_API_URL + '?sort[0][field]=submittedAt&sort[0][direction]=desc'
    url += `&filterByFormula=${encodeURIComponent(filterFormula)}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable submissions (simulator) error:', errorText)
      return NextResponse.json({ error: 'Error fetching challenges' }, { status: 500 })
    }

    const data = await response.json()
    
    // Parsear los datos del reto desde los campos de submission
    const challenges: SimulatorChallenge[] = data.records.map((record: any) => {
      // Extraer info del reto del campo 'output' (guardado como JSON)
      let challengeInfo: any = {}
      try {
        challengeInfo = JSON.parse(record.fields.output || '{}')
      } catch {
        challengeInfo = {}
      }
      
      return {
        id: record.id,
        challengeId: record.fields.taskId?.replace('simulator-challenge-', '') || '',
        challengeName: challengeInfo.challengeName || record.fields.taskId || '',
        challengeCategory: challengeInfo.challengeCategory || 'laberinto',
        challengeDifficulty: challengeInfo.challengeDifficulty || 'easy',
        studentName: record.fields.studentName || '',
        studentEmail: record.fields.studentEmail || '',
        courseId: record.fields.courseId || '',
        schoolId: record.fields.schoolId || '',
        completedAt: record.fields.submittedAt || '',
        status: record.fields.status === 'graded' ? 'verified' : 'completed',
        verifiedBy: record.fields.gradedBy || '',
        verifiedAt: record.fields.gradedAt || '',
      }
    })

    return NextResponse.json({ success: true, challenges })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Registrar nuevo reto completado
// Guarda en tabla submissions con taskId = 'simulator-challenge-{challengeId}'
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
      schoolId,
      levelId
    } = body

    if (!challengeId || !studentName) {
      return NextResponse.json(
        { error: 'challengeId y studentName son requeridos' },
        { status: 400 }
      )
    }

    // Guardar info del reto como JSON en el campo 'output'
    const challengeInfo = JSON.stringify({
      challengeName: challengeName || challengeId,
      challengeCategory: challengeCategory || 'laberinto',
      challengeDifficulty: challengeDifficulty || 'easy',
    })

    // Usar formato de submissions con taskId especial
    const fields: any = {
      taskId: `simulator-challenge-${challengeId}`,
      studentName,
      studentEmail: studentEmail || '',
      levelId: levelId || '',
      courseId: courseId || '',
      schoolId: schoolId || '',
      code: `Reto: ${challengeName || challengeId}`,
      output: challengeInfo,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    }

    console.log('Creating simulator challenge in submissions:', fields)

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
// Usa campos de submissions: status='graded', gradedBy, gradedAt
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, verifiedBy } = body

    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
    }

    // Mapear a campos de submissions
    const fields: Record<string, any> = {
      status: status === 'verified' ? 'graded' : 'pending',
      gradedAt: new Date().toISOString()
    }
    
    if (verifiedBy) {
      fields.gradedBy = verifiedBy
    }

    console.log('PATCH simulator challenge (submissions):', id, fields)

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
