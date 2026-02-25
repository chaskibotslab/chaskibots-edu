import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'projects'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')
  const category = searchParams.get('category')

  try {
    let url = AIRTABLE_API_URL + '?'
    const filters: string[] = []
    
    if (levelId) {
      filters.push(`{levelId}="${levelId}"`)
    }
    if (category) {
      filters.push(`{category}="${category}"`)
    }
    
    if (filters.length > 0) {
      const formula = filters.length === 1 
        ? filters[0] 
        : `AND(${filters.join(',')})`
      url += `filterByFormula=${encodeURIComponent(formula)}&`
    }
    
    url += 'sort[0][field]=difficulty&sort[0][direction]=asc'

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable projects error:', errorText)
      return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 })
    }

    const data = await response.json()
    
    const projects = data.records.map((record: any) => ({
      id: record.id,
      levelId: record.fields.levelId || '',
      projectName: record.fields.projectName || '',
      category: record.fields.category || 'ia',
      description: record.fields.description || '',
      hardware: record.fields.hardware || '',
      difficulty: record.fields.difficulty || 'medio',
      duration: record.fields.duration || '',
      videoUrl: record.fields.videoUrl || '',
      tutorialUrl: record.fields.tutorialUrl || '',
      resources: record.fields.resources || '',
    }))

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            levelId: body.levelId,
            projectName: body.projectName,
            category: body.category,
            description: body.description,
            hardware: body.hardware,
            difficulty: body.difficulty,
            duration: body.duration,
            videoUrl: body.videoUrl,
            tutorialUrl: body.tutorialUrl,
            resources: body.resources,
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating project' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, record: data.records[0] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const fields: Record<string, any> = {}
    if (body.levelId) fields.levelId = body.levelId
    if (body.projectName) fields.projectName = body.projectName
    if (body.category) fields.category = body.category
    if (body.description !== undefined) fields.description = body.description
    if (body.hardware) fields.hardware = body.hardware
    if (body.difficulty) fields.difficulty = body.difficulty
    if (body.duration) fields.duration = body.duration
    if (body.videoUrl !== undefined) fields.videoUrl = body.videoUrl
    if (body.tutorialUrl !== undefined) fields.tutorialUrl = body.tutorialUrl
    if (body.resources !== undefined) fields.resources = body.resources

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id: body.id,
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error updating project' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, record: data.records[0] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const response = await fetch(`${AIRTABLE_API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error deleting project' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
