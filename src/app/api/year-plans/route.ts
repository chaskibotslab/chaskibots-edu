import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'year_plans'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')

  try {
    let url = AIRTABLE_API_URL
    
    if (levelId) {
      url += `?filterByFormula={levelId}="${levelId}"&sort[0][field]=order&sort[0][direction]=asc`
    } else {
      url += `?sort[0][field]=levelId&sort[0][direction]=asc&sort[1][field]=order&sort[1][direction]=asc`
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
      console.error('Airtable year_plans error:', errorText)
      return NextResponse.json({ error: 'Error fetching year plans' }, { status: 500 })
    }

    const data = await response.json()
    
    const plans = data.records.map((record: any) => ({
      id: record.id,
      levelId: record.fields.levelId || '',
      month: record.fields.month || '',
      topic: record.fields.topic || '',
      project: record.fields.project || '',
      order: record.fields.order || 0,
    }))

    return NextResponse.json(plans)
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
            month: body.month,
            topic: body.topic,
            project: body.project,
            order: body.order || 0,
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating year plan', message: errorText }, { status: 500 })
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
    if (body.month) fields.month = body.month
    if (body.topic !== undefined) fields.topic = body.topic
    if (body.project !== undefined) fields.project = body.project
    if (body.order !== undefined) fields.order = body.order

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
      return NextResponse.json({ error: 'Error updating year plan', message: errorText }, { status: 500 })
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
      return NextResponse.json({ error: 'Error deleting year plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
