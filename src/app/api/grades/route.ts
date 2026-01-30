import { NextRequest, NextResponse } from 'next/server'

// API para gestionar calificaciones en Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_GRADES_TABLE = 'grades'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_GRADES_TABLE}`

export interface Grade {
  id: string
  studentId: string
  studentName: string
  lessonId: string
  levelId: string
  courseId?: string
  schoolId?: string
  score: number
  feedback?: string
  taskId?: string
  submittedAt: string
  gradedAt?: string
  gradedBy?: string
}

// GET - Obtener calificaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const courseId = searchParams.get('courseId')
    const schoolId = searchParams.get('schoolId')
    const studentId = searchParams.get('studentId')

    let filterFormula = ''
    const filters: string[] = []
    
    if (levelId) filters.push(`{levelId}="${levelId}"`)
    if (courseId) filters.push(`{courseId}="${courseId}"`)
    if (schoolId) filters.push(`{schoolId}="${schoolId}"`)
    if (studentId) filters.push(`{studentId}="${studentId}"`)
    
    if (filters.length > 0) {
      filterFormula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(',')})`
    }

    let url = AIRTABLE_API_URL + '?sort[0][field]=gradedAt&sort[0][direction]=desc'
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
      console.error('Airtable grades error:', errorText)
      // Si la tabla no existe, devolver array vacío
      if (errorText.includes('NOT_FOUND') || errorText.includes('TABLE_NOT_FOUND')) {
        return NextResponse.json({ success: true, grades: [], message: 'Tabla grades no existe en Airtable. Créala primero.' })
      }
      return NextResponse.json({ error: 'Error fetching grades' }, { status: 500 })
    }

    const data = await response.json()
    
    const grades: Grade[] = data.records.map((record: any) => ({
      id: record.id,
      studentId: record.fields.studentId || '',
      studentName: record.fields.studentName || '',
      lessonId: record.fields.lessonId || '',
      levelId: record.fields.levelId || '',
      courseId: record.fields.courseId || '',
      schoolId: record.fields.schoolId || '',
      score: parseFloat(record.fields.score) || 0,
      feedback: record.fields.feedback || '',
      taskId: record.fields.taskId || '',
      submittedAt: record.fields.submittedAt || '',
      gradedAt: record.fields.gradedAt || '',
      gradedBy: record.fields.gradedBy || '',
    }))

    return NextResponse.json({ success: true, grades })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear calificación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, studentName, lessonId, levelId, courseId, schoolId, score, feedback, taskId, submittedAt, gradedBy } = body

    if (!studentName || score === undefined) {
      return NextResponse.json({ error: 'studentName y score son requeridos' }, { status: 400 })
    }

    // Solo incluir campos que no estén vacíos para evitar errores de Airtable
    const fields: Record<string, any> = {
      studentName,
      score: Number(score),
      gradedAt: new Date().toISOString(),
    }
    
    // Agregar campos opcionales solo si tienen valor
    if (studentId) fields.studentId = studentId
    if (lessonId) fields.lessonId = lessonId
    if (levelId) fields.levelId = levelId
    if (courseId) fields.courseId = courseId
    if (schoolId) fields.schoolId = schoolId
    if (submittedAt) fields.submittedAt = submittedAt
    if (feedback) fields.feedback = feedback
    if (taskId) fields.taskId = taskId
    if (gradedBy) fields.gradedBy = gradedBy

    console.log('Creating grade with fields:', fields)

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
      console.error('Airtable grades POST error:', response.status, errorText)
      // Si la tabla no existe, dar mensaje claro
      if (errorText.includes('NOT_FOUND') || errorText.includes('TABLE_NOT_FOUND')) {
        return NextResponse.json({ 
          error: 'Tabla grades no existe en Airtable', 
          message: 'Crea una tabla llamada "grades" con los campos: studentName, score, gradedAt, studentId, lessonId, levelId, courseId, schoolId, submittedAt, feedback, taskId, gradedBy' 
        }, { status: 404 })
      }
      // Si hay error de campo desconocido
      if (errorText.includes('UNKNOWN_FIELD_NAME')) {
        const match = errorText.match(/Unknown field name: \\"([^"]+)\\"/)
        const fieldName = match ? match[1] : 'desconocido'
        return NextResponse.json({ 
          error: `Campo "${fieldName}" no existe en la tabla grades de Airtable`,
          message: `Agrega el campo "${fieldName}" a tu tabla grades en Airtable, o verifica que el nombre sea correcto.`,
          details: errorText
        }, { status: 422 })
      }
      return NextResponse.json({ error: 'Error creating grade', details: errorText }, { status: 500 })
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      grade: data.records[0]
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar calificación
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
      return NextResponse.json({ error: 'Error deleting grade' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
