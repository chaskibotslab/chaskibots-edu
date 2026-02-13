import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'teacher_courses'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export interface TeacherCourse {
  id: string
  recordId: string
  teacherId: string
  teacherName: string
  courseId: string
  courseName: string
  levelId: string
  schoolId: string
  schoolName: string
  createdAt: string
}

// GET - Obtener asignaciones de cursos a profesores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const teacherName = searchParams.get('teacherName')
    const schoolId = searchParams.get('schoolId')
    const courseId = searchParams.get('courseId')

    console.log('[TeacherCourses API] GET request - teacherId:', JSON.stringify(teacherId), 'teacherName:', JSON.stringify(teacherName))

    let filterFormula = ''
    const filters: string[] = []
    
    // Si se busca por teacherId, buscar por teacherId O por teacherName
    // Usar LOWER() para búsqueda case-insensitive
    if (teacherId && teacherName) {
      // Si vienen ambos, buscar por cualquiera de los dos (case-insensitive)
      const lowerName = teacherName.toLowerCase()
      filters.push(`OR({teacherId}="${teacherId}",LOWER({teacherName})="${lowerName}")`)
    } else if (teacherId) {
      // Solo teacherId - buscar exacto
      filters.push(`{teacherId}="${teacherId}"`)
    } else if (teacherName) {
      // Solo teacherName - buscar case-insensitive
      const lowerName = teacherName.toLowerCase()
      filters.push(`LOWER({teacherName})="${lowerName}"`)
    }
    if (schoolId) filters.push(`{schoolId}="${schoolId}"`)
    if (courseId) filters.push(`{courseId}="${courseId}"`)
    
    if (filters.length > 0) {
      filterFormula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(',')})`
    }

    console.log('[TeacherCourses API] Filter formula:', filterFormula)

    let url = AIRTABLE_API_URL + '?sort[0][field]=teacherName&sort[0][direction]=asc'
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
      console.error('Airtable teacher_courses error:', errorText)
      // Si la tabla no existe, retornar array vacío
      if (errorText.includes('NOT_FOUND') || errorText.includes('TABLE_NOT_FOUND')) {
        return NextResponse.json({ success: true, assignments: [], message: 'Tabla teacher_courses no existe. Créala en Airtable.' })
      }
      return NextResponse.json({ error: 'Error fetching teacher courses' }, { status: 500 })
    }

    const data = await response.json()
    
    const assignments: TeacherCourse[] = data.records.map((record: any) => ({
      id: record.fields.id || record.id,
      recordId: record.id,
      teacherId: record.fields.teacherId || '',
      teacherName: record.fields.teacherName || '',
      courseId: record.fields.courseId || '',
      courseName: record.fields.courseName || '',
      levelId: record.fields.levelId || '',
      schoolId: record.fields.schoolId || '',
      schoolName: record.fields.schoolName || '',
      createdAt: record.fields.createdAt || '',
    }))

    console.log('[TeacherCourses API] Found', assignments.length, 'assignments')
    if (assignments.length > 0) {
      console.log('[TeacherCourses API] All assignments:', assignments.map(a => ({ courseName: a.courseName, levelId: a.levelId, teacherName: a.teacherName })))
    }

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Asignar curso a profesor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, teacherName, courseId, courseName, levelId, schoolId, schoolName } = body

    if (!teacherId || !courseId || !schoolId) {
      return NextResponse.json({ error: 'teacherId, courseId y schoolId son requeridos' }, { status: 400 })
    }

    // Verificar si ya existe esta asignación
    const checkUrl = `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(`AND({teacherId}="${teacherId}",{courseId}="${courseId}")`)}`
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json()
      if (checkData.records && checkData.records.length > 0) {
        return NextResponse.json({ error: 'Este profesor ya tiene asignado este curso' }, { status: 400 })
      }
    }

    const assignmentId = `tc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`

    const fields = {
      id: assignmentId,
      teacherId,
      teacherName: teacherName || '',
      courseId,
      courseName: courseName || '',
      levelId: levelId || '',
      schoolId,
      schoolName: schoolName || '',
      createdAt: new Date().toISOString().split('T')[0],
    }

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }] }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable create error:', errorText)
      return NextResponse.json({ error: `Error al asignar curso: ${errorText}` }, { status: 500 })
    }

    const data = await response.json()
    const record = data.records?.[0]
    
    return NextResponse.json({ 
      success: true, 
      assignment: {
        ...fields,
        recordId: record.id,
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar asignación de curso
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId')
    const assignmentId = searchParams.get('id')

    let airtableRecordId = recordId

    // Si no tenemos recordId pero tenemos assignmentId, buscar el registro
    if (!airtableRecordId && assignmentId) {
      const searchUrl = `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(`{id}="${assignmentId}"`)}`
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      })
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.records && searchData.records.length > 0) {
          airtableRecordId = searchData.records[0].id
        }
      }
    }

    if (!airtableRecordId) {
      return NextResponse.json({ error: 'ID de asignación es requerido' }, { status: 400 })
    }

    const response = await fetch(`${AIRTABLE_API_URL}/${airtableRecordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable delete error:', errorText)
      return NextResponse.json({ error: 'Error al eliminar asignación' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
