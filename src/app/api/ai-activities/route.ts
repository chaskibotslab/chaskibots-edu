import { NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'ai_activities'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')

  try {
    let url = AIRTABLE_API_URL
    
    if (levelId) {
      url += `?filterByFormula={levelId}="${levelId}"&sort[0][field]=activityType&sort[0][direction]=asc`
    } else {
      url += `?sort[0][field]=levelId&sort[0][direction]=asc`
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
      console.error('Airtable ai_activities error:', errorText)
      return NextResponse.json({ error: 'Error fetching AI activities' }, { status: 500 })
    }

    const data = await response.json()
    
    const activities = data.records.map((record: any) => ({
      id: record.id,
      levelId: record.fields.levelId || '',
      activityName: record.fields.activityName || '',
      activityType: record.fields.activityType || 'camera',
      description: record.fields.description || '',
      difficulty: record.fields.difficulty || 'medio',
      icon: record.fields.icon || 'brain',
      enabled: record.fields.enabled !== false,
    }))

    return NextResponse.json(activities)
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
            activityName: body.activityName,
            activityType: body.activityType,
            description: body.description,
            difficulty: body.difficulty,
            icon: body.icon,
            enabled: body.enabled !== false,
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating activity', message: errorText }, { status: 500 })
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
    if (body.activityName) fields.activityName = body.activityName
    if (body.activityType) fields.activityType = body.activityType
    if (body.description !== undefined) fields.description = body.description
    if (body.difficulty) fields.difficulty = body.difficulty
    if (body.icon) fields.icon = body.icon
    if (body.enabled !== undefined) fields.enabled = body.enabled

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
      return NextResponse.json({ error: 'Error updating activity', message: errorText }, { status: 500 })
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
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error deleting activity' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
