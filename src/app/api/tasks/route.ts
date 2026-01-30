import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToDrive, isDriveConfigured } from '@/lib/googleDrive'

// Carpeta del docente en Google Drive
const DOCENTE_FOLDER_ID = '1HLKy4aNlrzKMccj0X81ViS0Kfa8h2Z1N'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TASKS_TABLE = 'tasks'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TASKS_TABLE}`

export interface Task {
  id: string
  levelId: string
  title: string
  description: string
  type: 'concept' | 'code' | 'project' | 'quiz'
  category: 'robotica' | 'electronica' | 'programacion' | 'ia' | 'general'
  difficulty: 'basico' | 'intermedio' | 'avanzado'
  points: number
  dueDate?: string
  isActive: boolean
  questions: string[]
  createdAt: string
}

// GET - Obtener tareas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    let filterFormula = ''
    const filters: string[] = []
    
    if (levelId) filters.push(`{levelId}="${levelId}"`)
    if (activeOnly) filters.push(`{isActive}=TRUE()`)
    
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
      console.error('Airtable tasks error:', errorText)
      return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
    }

    const data = await response.json()
    
    const tasks: Task[] = data.records.map((record: any) => {
      // Parsear preguntas (separadas por |)
      const questionsStr = record.fields.questions || ''
      const questions = questionsStr.split('|').filter((q: string) => q.trim())
      
      // Parsear metadatos desde prefijo en description: [type|category|difficulty|attachmentUrl] descripcion
      let taskType = 'concept'
      let category = 'general'
      let difficulty = 'basico'
      let attachmentUrl = ''
      let description = record.fields.description || ''
      
      // Nuevo formato con 4 campos: [type|category|difficulty|attachmentUrl]
      const metaMatch4 = description.match(/^\[([^|]*)\|([^|]*)\|([^|]*)\|([^\]]*)\]\s*(.*)$/)
      // Formato antiguo con 3 campos: [type|category|difficulty]
      const metaMatch3 = description.match(/^\[([^|]+)\|([^|]+)\|([^\]]+)\]\s*(.*)$/)
      
      if (metaMatch4) {
        taskType = metaMatch4[1] || 'concept'
        category = metaMatch4[2] || 'general'
        difficulty = metaMatch4[3] || 'basico'
        attachmentUrl = metaMatch4[4] || ''
        description = metaMatch4[5] || ''
      } else if (metaMatch3) {
        taskType = metaMatch3[1] || 'concept'
        category = metaMatch3[2] || 'general'
        difficulty = metaMatch3[3] || 'basico'
        description = metaMatch3[4] || ''
      }
      
      return {
        id: record.id,
        levelId: record.fields.levelId || '',
        title: record.fields.title || '',
        description,
        type: taskType,
        category,
        difficulty,
        points: record.fields.points || 10,
        dueDate: record.fields.dueDate || '',
        isActive: record.fields.isActive !== false,
        questions,
        createdAt: record.fields.createdAt || new Date().toISOString(),
        attachmentUrl: attachmentUrl,
        attachmentType: attachmentUrl ? 'drive' : 'none',
      }
    })

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear nueva tarea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { levelId, title, description, type, category, difficulty, points, dueDate, questions, attachmentUrl, attachmentType, attachmentData, attachmentName, attachmentMimeType } = body

    if (!levelId || !title) {
      return NextResponse.json(
        { error: 'levelId y title son requeridos' },
        { status: 400 }
      )
    }

    // Si hay archivo adjunto con datos base64, intentar subirlo a Google Drive
    // Si falla, guardar como data URL directamente
    let finalAttachmentUrl = attachmentUrl || ''
    if (attachmentData && attachmentName) {
      if (isDriveConfigured()) {
        try {
          console.log(`Uploading teacher file to Drive: ${attachmentName}`)
          const driveResult = await uploadFileToDrive(
            attachmentData,
            attachmentName,
            attachmentMimeType || 'application/octet-stream',
            'Tareas-Docente',
            'docente',
            levelId
          )
          finalAttachmentUrl = driveResult.webViewLink
          console.log(`Teacher file uploaded to Drive: ${finalAttachmentUrl}`)
        } catch (driveError) {
          console.error('Error uploading teacher file to Drive:', driveError)
          // Si Drive falla, guardar como data URL (base64)
          console.log('Falling back to base64 storage')
          finalAttachmentUrl = attachmentData // El attachmentData ya es un data URL
        }
      } else {
        // Sin Drive configurado, guardar como data URL
        console.log('Drive not configured, using base64 storage')
        finalAttachmentUrl = attachmentData
      }
    }

    // Convertir array de preguntas a string separado por |
    const questionsStr = Array.isArray(questions) 
      ? questions.filter((q: string) => q && q.trim()).join('|') 
      : (questions || '')

    // Construir campos - solo incluir los que existen en Airtable
    // NOTA: type, category, difficulty y attachmentUrl se guardan como prefijo en description
    // Formato: [type|category|difficulty|attachmentUrl] descripcion
    const metaPrefix = `[${type || 'concept'}|${category || 'general'}|${difficulty || 'basico'}|${finalAttachmentUrl}]`
    const fullDescription = `${metaPrefix} ${description || ''}`
    
    const fields: Record<string, any> = {
      levelId: String(levelId),
      title: String(title),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      description: fullDescription
    }

    if (points) fields.points = Number(points) || 10
    if (dueDate) fields.dueDate = String(dueDate)
    if (questionsStr) fields.questions = questionsStr
    // NO enviar attachmentUrl ni attachmentType - se guardan en description

    console.log('Creating task with fields:', fields)

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
      console.error('Airtable error creating task:', errorText)
      return NextResponse.json({ error: `Error creating task: ${errorText}` }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      task: data.records[0],
      message: 'Tarea creada correctamente'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Actualizar tarea
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, ...updates } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId es requerido' }, { status: 400 })
    }

    // Si hay archivo adjunto con datos base64, intentar subirlo a Google Drive
    // Si falla, guardar como data URL directamente
    let finalAttachmentUrl = updates.attachmentUrl || ''
    if (updates.attachmentData && updates.attachmentName) {
      if (isDriveConfigured()) {
        try {
          console.log(`Uploading teacher file to Drive: ${updates.attachmentName}`)
          const driveResult = await uploadFileToDrive(
            updates.attachmentData,
            updates.attachmentName,
            updates.attachmentMimeType || 'application/octet-stream',
            'Tareas-Docente',
            'docente',
            updates.levelId || 'general'
          )
          finalAttachmentUrl = driveResult.webViewLink
          console.log(`Teacher file uploaded to Drive: ${finalAttachmentUrl}`)
        } catch (driveError) {
          console.error('Error uploading teacher file to Drive:', driveError)
          // Si Drive falla, guardar como data URL (base64)
          console.log('Falling back to base64 storage')
          finalAttachmentUrl = updates.attachmentData
        }
      } else {
        // Sin Drive configurado, guardar como data URL
        console.log('Drive not configured, using base64 storage')
        finalAttachmentUrl = updates.attachmentData
      }
    }

    // Solo campos que existen en Airtable
    const fields: Record<string, any> = {}
    
    if (updates.levelId !== undefined) fields.levelId = String(updates.levelId)
    if (updates.title !== undefined) fields.title = String(updates.title)
    if (updates.points !== undefined) fields.points = Number(updates.points) || 10
    if (updates.dueDate !== undefined) fields.dueDate = String(updates.dueDate)
    if (updates.isActive !== undefined) fields.isActive = Boolean(updates.isActive)
    
    // type, category, difficulty y attachmentUrl se guardan como prefijo en description
    // Formato: [type|category|difficulty|attachmentUrl] descripcion
    if (updates.description !== undefined || updates.type !== undefined || updates.category !== undefined || updates.difficulty !== undefined || finalAttachmentUrl) {
      const metaPrefix = `[${updates.type || 'concept'}|${updates.category || 'general'}|${updates.difficulty || 'basico'}|${finalAttachmentUrl}]`
      fields.description = `${metaPrefix} ${updates.description || ''}`
    }
    
    if (updates.questions !== undefined) {
      fields.questions = Array.isArray(updates.questions) 
        ? updates.questions.filter((q: string) => q && q.trim()).join('|') 
        : updates.questions
    }
    // NO enviar attachmentUrl ni attachmentType como campos separados - se guardan en description

    console.log('Updating task:', taskId, 'with fields:', fields)

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id: taskId,
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error updating task:', errorText)
      return NextResponse.json({ error: `Error updating task: ${errorText}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Tarea actualizada' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar tarea
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId es requerido' }, { status: 400 })
    }

    const response = await fetch(`${AIRTABLE_API_URL}/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error deleting task' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
