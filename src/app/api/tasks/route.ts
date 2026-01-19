import { NextRequest, NextResponse } from 'next/server'

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
      
      // Parsear metadatos (type, category, difficulty guardados como JSON)
      let metadata = { type: 'concept', category: 'general', difficulty: 'basico' }
      if (record.fields.metadata) {
        try {
          metadata = JSON.parse(record.fields.metadata)
        } catch {
          // Si falla el parse, usar valores por defecto
        }
      }
      
      return {
        id: record.id,
        levelId: record.fields.levelId || '',
        title: record.fields.title || '',
        description: record.fields.description || '',
        type: record.fields.type || metadata.type || 'concept',
        category: record.fields.category || metadata.category || 'general',
        difficulty: record.fields.difficulty || metadata.difficulty || 'basico',
        points: record.fields.points || 10,
        dueDate: record.fields.dueDate || '',
        isActive: record.fields.isActive !== false,
        questions,
        createdAt: record.fields.createdAt || new Date().toISOString(),
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
    const { levelId, title, description, type, category, difficulty, points, dueDate, questions, attachmentUrl, attachmentType } = body

    if (!levelId || !title) {
      return NextResponse.json(
        { error: 'levelId y title son requeridos' },
        { status: 400 }
      )
    }

    // Convertir array de preguntas a string separado por |
    const questionsStr = Array.isArray(questions) 
      ? questions.filter((q: string) => q && q.trim()).join('|') 
      : (questions || '')

    // Construir campos - solo incluir los que tienen valor
    // NOTA: type, category, difficulty se guardan como texto para evitar errores de Single Select en Airtable
    const fields: Record<string, any> = {
      levelId: String(levelId),
      title: String(title),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    }

    // Guardar metadatos como JSON en un campo de texto para evitar problemas con Single Select
    const metadata = {
      type: type || 'concept',
      category: category || 'general',
      difficulty: difficulty || 'basico'
    }
    fields.metadata = JSON.stringify(metadata)

    if (description) fields.description = String(description)
    if (points) fields.points = Number(points) || 10
    if (dueDate) fields.dueDate = String(dueDate)
    if (questionsStr) fields.questions = questionsStr
    if (attachmentUrl) fields.attachmentUrl = String(attachmentUrl)
    if (attachmentType && attachmentType !== 'none') fields.attachmentType = String(attachmentType)

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

    const fields: Record<string, any> = {}
    
    if (updates.levelId !== undefined) fields.levelId = updates.levelId
    if (updates.title !== undefined) fields.title = updates.title
    if (updates.description !== undefined) fields.description = updates.description
    if (updates.type !== undefined) fields.type = updates.type
    if (updates.category !== undefined) fields.category = updates.category
    if (updates.difficulty !== undefined) fields.difficulty = updates.difficulty
    if (updates.points !== undefined) fields.points = updates.points
    if (updates.dueDate !== undefined) fields.dueDate = updates.dueDate
    if (updates.isActive !== undefined) fields.isActive = updates.isActive
    if (updates.questions !== undefined) {
      fields.questions = Array.isArray(updates.questions) 
        ? updates.questions.join('|') 
        : updates.questions
    }

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
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
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
