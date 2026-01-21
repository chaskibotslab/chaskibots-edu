import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE_NAME = 'blockly_projects'

interface BlocklyProject {
  id: string
  userId: string
  userName: string
  projectName: string
  projectData: string
  levelId?: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

// GET - Obtener proyectos del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')
    const isPublic = searchParams.get('isPublic')

    let filterFormula = ''
    
    if (projectId) {
      filterFormula = `{id}='${projectId}'`
    } else if (userId) {
      filterFormula = `{userId}='${userId}'`
    } else if (isPublic === 'true') {
      filterFormula = `{isPublic}=TRUE()`
    }

    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`)
    if (filterFormula) {
      url.searchParams.set('filterByFormula', filterFormula)
    }
    url.searchParams.set('sort[0][field]', 'updatedAt')
    url.searchParams.set('sort[0][direction]', 'desc')

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Airtable error:', error)
      return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 })
    }

    const data = await response.json()
    
    const projects: BlocklyProject[] = data.records.map((record: any) => ({
      id: record.fields.id || record.id,
      odId: record.id,
      userId: record.fields.userId || '',
      userName: record.fields.userName || '',
      projectName: record.fields.projectName || 'Sin nombre',
      projectData: record.fields.projectData || '',
      levelId: record.fields.levelId || '',
      createdAt: record.fields.createdAt || new Date().toISOString(),
      updatedAt: record.fields.updatedAt || new Date().toISOString(),
      isPublic: record.fields.isPublic || false
    }))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, projectName, projectData, levelId, isPublic } = body

    if (!userId || !projectName || !projectData) {
      return NextResponse.json(
        { error: 'userId, projectName y projectData son requeridos' },
        { status: 400 }
      )
    }

    const projectId = `proj_${Date.now().toString(36)}`
    const now = new Date().toISOString()

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            id: projectId,
            userId,
            userName: userName || 'Anónimo',
            projectName,
            projectData,
            levelId: levelId || '',
            createdAt: now,
            updatedAt: now,
            isPublic: isPublic || false
          }
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Airtable error:', error)
      return NextResponse.json({ error: 'Error creating project' }, { status: 500 })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        odId: data.records[0].id,
        projectName,
        createdAt: now
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Actualizar proyecto existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, projectName, projectData, isPublic } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId es requerido' }, { status: 400 })
    }

    // Primero buscar el record por el id del proyecto
    const searchUrl = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`)
    searchUrl.searchParams.set('filterByFormula', `{id}='${projectId}'`)

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!searchResponse.ok) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const searchData = await searchResponse.json()
    if (!searchData.records || searchData.records.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const recordId = searchData.records[0].id
    const now = new Date().toISOString()

    const updateFields: any = { updatedAt: now }
    if (projectName) updateFields.projectName = projectName
    if (projectData) updateFields.projectData = projectData
    if (typeof isPublic === 'boolean') updateFields.isPublic = isPublic

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: updateFields })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Airtable error:', error)
      return NextResponse.json({ error: 'Error updating project' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Proyecto actualizado',
      updatedAt: now
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar proyecto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId es requerido' }, { status: 400 })
    }

    // Buscar el record
    const searchUrl = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`)
    searchUrl.searchParams.set('filterByFormula', `{id}='${projectId}'`)

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const searchData = await searchResponse.json()
    if (!searchData.records || searchData.records.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const recordId = searchData.records[0].id

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error deleting project' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Proyecto eliminado' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
