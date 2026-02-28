import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'simulators'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const levelId = searchParams.get('levelId')
  const programId = searchParams.get('programId')

  try {
    let url = AIRTABLE_API_URL + '?sort[0][field]=name&sort[0][direction]=asc'

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable simulators error:', errorText)
      return NextResponse.json({ error: 'Error fetching simulators' }, { status: 500 })
    }

    const data = await response.json()
    
    let simulators = data.records.map((record: any) => ({
      id: record.fields.id || record.id,
      recordId: record.id,
      name: record.fields.name || '',
      description: record.fields.description || '',
      icon: record.fields.icon || 'code',
      url: record.fields.url || '',
      levels: record.fields.levels ? record.fields.levels.split(',').map((l: string) => l.trim()) : [],
      programs: record.fields.programs ? record.fields.programs.split(',').map((p: string) => p.trim()) : ['robotica', 'ia', 'hacking'],
      enabled: record.fields.enabled !== false,
    }))

    // Filtrar por nivel si se especifica
    if (levelId) {
      simulators = simulators.filter((sim: any) => sim.levels.includes(levelId) && sim.enabled)
    }

    // Filtrar por programa si se especifica
    if (programId) {
      simulators = simulators.filter((sim: any) => sim.programs.includes(programId) && sim.enabled)
    }

    return NextResponse.json(simulators)
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
            id: body.id,
            name: body.name,
            description: body.description,
            icon: body.icon,
            url: body.url,
            levels: Array.isArray(body.levels) ? body.levels.join(',') : body.levels,
            programs: Array.isArray(body.programs) ? body.programs.join(',') : (body.programs || 'robotica,ia,hacking'),
            enabled: body.enabled !== false,
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error creating simulator', message: errorText }, { status: 500 })
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
    
    if (!body.recordId) {
      return NextResponse.json({ error: 'recordId is required' }, { status: 400 })
    }

    const fields: Record<string, any> = {}
    if (body.id) fields.id = body.id
    if (body.name) fields.name = body.name
    if (body.description !== undefined) fields.description = body.description
    if (body.icon) fields.icon = body.icon
    if (body.url) fields.url = body.url
    if (body.levels !== undefined) fields.levels = Array.isArray(body.levels) ? body.levels.join(',') : body.levels
    if (body.programs !== undefined) fields.programs = Array.isArray(body.programs) ? body.programs.join(',') : body.programs
    if (body.enabled !== undefined) fields.enabled = body.enabled

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id: body.recordId,
          fields
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Error updating simulator', message: errorText }, { status: 500 })
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
      return NextResponse.json({ error: 'Error deleting simulator' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
