import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_SUBMISSIONS_TABLE = 'submissions'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_SUBMISSIONS_TABLE}`

export interface Submission {
  id: string
  taskId: string
  studentName: string
  studentEmail?: string
  levelId: string
  lessonId?: string
  code: string
  output: string
  submittedAt: string
  status: 'pending' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: string
}

// GET - Obtener entregas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const status = searchParams.get('status')
    const taskId = searchParams.get('taskId')

    let filterFormula = ''
    const filters: string[] = []
    
    if (levelId) filters.push(`{levelId}="${levelId}"`)
    if (status) filters.push(`{status}="${status}"`)
    if (taskId) filters.push(`{taskId}="${taskId}"`)
    
    if (filters.length > 0) {
      filterFormula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(',')})`
    }

    let url = AIRTABLE_API_URL + '?sort[0][field]=submittedAt&sort[0][direction]=desc'
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
      console.error('Airtable submissions error:', errorText)
      return NextResponse.json({ error: 'Error fetching submissions' }, { status: 500 })
    }

    const data = await response.json()
    
    const submissions: Submission[] = data.records.map((record: any) => ({
      id: record.id,
      taskId: record.fields.taskId || '',
      studentName: record.fields.studentName || '',
      studentEmail: record.fields.studentEmail || '',
      levelId: record.fields.levelId || '',
      lessonId: record.fields.lessonId || '',
      code: record.fields.code || '',
      output: record.fields.output || '',
      submittedAt: record.fields.submittedAt || '',
      status: record.fields.status || 'pending',
      grade: record.fields.grade,
      feedback: record.fields.feedback || '',
      gradedAt: record.fields.gradedAt || '',
      gradedBy: record.fields.gradedBy || '',
    }))

    return NextResponse.json({ success: true, submissions })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear nueva entrega
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, studentName, studentEmail, levelId, lessonId, code, output } = body

    if (!taskId || !studentName || !code) {
      return NextResponse.json(
        { error: 'taskId, studentName y code son requeridos' },
        { status: 400 }
      )
    }

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            taskId,
            studentName,
            studentEmail: studentEmail || '',
            levelId: levelId || '',
            lessonId: lessonId || '',
            code,
            output: output || '',
            submittedAt: new Date().toISOString(),
            status: 'pending'
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating submission' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      submission: data.records[0],
      message: 'Tarea enviada correctamente'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Calificar entrega
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId, grade, feedback, gradedBy } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId es requerido' }, { status: 400 })
    }

    const fields: Record<string, any> = {
      status: 'graded',
      gradedAt: new Date().toISOString()
    }
    
    if (grade !== undefined) fields.grade = grade
    if (feedback) fields.feedback = feedback
    if (gradedBy) fields.gradedBy = gradedBy

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id: submissionId,
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error updating submission' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Calificación guardada' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar entrega
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId es requerido' }, { status: 400 })
    }

    const response = await fetch(`${AIRTABLE_API_URL}/${submissionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error deleting submission' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
