import { NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE_NAME = 'experiencias'

export async function GET() {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Airtable not configured' }, { status: 500 })
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}?sort%5B0%5D%5Bfield%5D=orden&sort%5B0%5D%5Bdirection%5D=asc`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Airtable error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch experiencias', details: errorText }, { status: response.status })
    }

    const data = await response.json()
    
    const experiencias = data.records
      .filter((record: any) => record.fields.activo !== false)
      .map((record: any) => ({
        id: record.id,
        titulo: record.fields.titulo || '',
        descripcion: record.fields.descripcion || '',
        tipo: record.fields.tipo || 'foto',
        url: record.fields.url || '',
        institucion: record.fields.institucion || '',
        orden: record.fields.orden || 0,
      }))

    return NextResponse.json(experiencias)
  } catch (error) {
    console.error('Error fetching experiencias:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
