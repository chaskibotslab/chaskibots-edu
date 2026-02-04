import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToDrive, isDriveConfigured } from '@/lib/googleDrive'

// API Submissions - v4 (2026-01-30) - Upload files to Google Drive
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
  courseId?: string
  schoolId?: string
  code: string
  output: string
  submittedAt: string
  status: 'pending' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: string
  drawing?: string // base64 del dibujo
  files?: string // JSON con archivos [{name, type, data}]
}

// GET - Obtener entregas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const status = searchParams.get('status')
    const taskId = searchParams.get('taskId')
    const courseId = searchParams.get('courseId')
    const schoolId = searchParams.get('schoolId')

    let filterFormula = ''
    const filters: string[] = []
    
    if (levelId) filters.push(`{levelId}="${levelId}"`)
    if (status) filters.push(`{status}="${status}"`)
    if (taskId) filters.push(`{taskId}="${taskId}"`)
    if (courseId) filters.push(`{courseId}="${courseId}"`)
    if (schoolId) filters.push(`{schoolId}="${schoolId}"`)
    
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
      courseId: record.fields.courseId || '',
      schoolId: record.fields.schoolId || '',
      code: record.fields.code || '',
      output: record.fields.output || '',
      submittedAt: record.fields.submittedAt || '',
      status: record.fields.status || 'pending',
      grade: record.fields.grade,
      feedback: record.fields.feedback || '',
      gradedAt: record.fields.gradedAt || '',
      gradedBy: record.fields.gradedBy || '',
      drawing: record.fields.drawing || '',
      files: record.fields.files || '',
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
    console.log('POST /api/submissions - body keys:', Object.keys(body))
    
    const { taskId, studentName, studentEmail, levelId, lessonId, code, output, drawing, files } = body

    // Si hay dibujo pero no hay código, usar placeholder
    const finalCode = code || (drawing ? '[Respuesta con dibujo]' : '')
    
    if (!taskId || !studentName) {
      console.log('Missing required fields:', { taskId, studentName })
      return NextResponse.json(
        { error: 'taskId y studentName son requeridos' },
        { status: 400 }
      )
    }

    // Preparar información de adjuntos
    let attachments: string[] = []
    
    // Guardar dibujo como base64 en el campo drawing (con límite de tamaño)
    let drawingData = ''
    if (drawing) {
      // Limitar tamaño del dibujo a 100KB para evitar errores de Airtable
      const maxDrawingSize = 100000
      if (drawing.length <= maxDrawingSize) {
        drawingData = drawing
      } else {
        console.log('Drawing too large, truncating:', drawing.length, 'chars')
        drawingData = '[Dibujo muy grande - no guardado]'
      }
      attachments.push('🎨 Dibujo incluido')
    }
    
    // Guardar archivos - subir a Google Drive si está configurado
    let filesData = ''
    if (files && files.length > 0) {
      const processedFiles = []
      
      for (const f of files) {
        // Si ya tiene URL de Drive, usarla directamente
        if (f.url) {
          processedFiles.push({
            name: f.name,
            type: f.type,
            url: f.url,
            data: ''
          })
        } 
        // Si tiene datos base64 y Drive está configurado, subir a Drive
        else if (f.data && isDriveConfigured()) {
          try {
            console.log(`Uploading file to Drive: ${f.name}`)
            const driveResult = await uploadFileToDrive(
              f.data,
              f.name,
              f.type || 'application/octet-stream',
              levelId || 'sin-nivel',
              studentName,
              taskId
            )
            processedFiles.push({
              name: f.name,
              type: f.type,
              url: driveResult.webViewLink,
              data: '' // No guardar base64, solo el enlace de Drive
            })
            console.log(`File uploaded to Drive: ${driveResult.webViewLink}`)
          } catch (driveError) {
            console.error('Error uploading to Drive:', driveError)
            // Si falla Drive, guardar base64 si es pequeño
            const maxSize = 90000
            if (f.data.length <= maxSize) {
              processedFiles.push({
                name: f.name,
                type: f.type,
                url: '',
                data: f.data
              })
            } else {
              processedFiles.push({
                name: f.name,
                type: f.type,
                url: '',
                data: '' // Muy grande y Drive falló
              })
            }
          }
        }
        // Sin Drive configurado, guardar base64 si es pequeño
        else if (f.data) {
          const maxSize = 90000
          processedFiles.push({
            name: f.name,
            type: f.type,
            url: '',
            data: f.data.length <= maxSize ? f.data : ''
          })
        }
      }
      
      filesData = JSON.stringify(processedFiles)
      attachments.push(`📎 ${files.length} archivo(s): ${files.map((f: any) => f.name).join(', ')}`)
    }

    // Construir output final
    let finalOutput = output || ''
    if (attachments.length > 0) {
      finalOutput += '\n\n📁 ADJUNTOS:\n' + attachments.join('\n')
    }

    // Guardar en Airtable (campos: drawing y files para los datos)
    const fields: any = {
      taskId,
      studentName,
      studentEmail: studentEmail || '',
      levelId: levelId || '',
      lessonId: lessonId || '',
      code: finalCode,
      output: finalOutput,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    }
    
    console.log('Creating submission with fields:', { taskId, studentName, levelId, hasDrawing: !!drawingData, hasFiles: !!filesData })
    
    // Solo agregar campos si tienen datos (evitar campos vacíos que pueden causar error)
    if (drawingData) {
      fields.drawing = drawingData
    }
    if (filesData) {
      fields.files = filesData
    }

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
      
      // Si falla por campos desconocidos, intentar sin drawing/files
      if (errorText.includes('UNKNOWN_FIELD')) {
        console.log('Retrying without drawing/files fields...')
        delete fields.drawing
        delete fields.files
        
        const retryResponse = await fetch(AIRTABLE_API_URL, {
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
        
        if (retryResponse.ok) {
          const data = await retryResponse.json()
          return NextResponse.json({ 
            success: true, 
            submission: data.records[0],
            message: 'Tarea enviada (sin campos de adjuntos en Airtable)'
          })
        }
      }
      
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
    const { id, submissionId, grade, feedback, gradedBy, status } = body

    const recordId = id || submissionId
    if (!recordId) {
      return NextResponse.json({ error: 'id o submissionId es requerido' }, { status: 400 })
    }

    // Solo enviar campos que existen en Airtable
    const fields: Record<string, any> = {
      status: status || 'graded'
    }
    
    // grade debe ser string porque Airtable lo tiene como texto
    if (grade !== undefined && grade !== null && grade !== '') {
      fields.grade = String(grade)
    }
    if (feedback) {
      fields.feedback = String(feedback)
    }
    if (gradedBy) {
      fields.gradedBy = String(gradedBy)
    }

    console.log('PATCH submission:', recordId, fields)

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id: recordId,
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable PATCH error:', errorText)
      return NextResponse.json({ error: 'Error updating submission', details: errorText }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Calificación guardada' })
  } catch (error) {
    console.error('PATCH Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar entrega
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idFromQuery = searchParams.get('id')
    
    let submissionId = idFromQuery
    
    // Si no hay id en query, intentar leer del body
    if (!submissionId) {
      try {
        const body = await request.json()
        submissionId = body.id || body.submissionId
      } catch {
        // No body
      }
    }

    if (!submissionId) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 })
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
