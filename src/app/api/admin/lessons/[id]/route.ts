import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = 'lessons'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    // Build fields to update
    const fields: Record<string, any> = {}
    
    if (body.videoUrl !== undefined) {
      fields.videoUrl = body.videoUrl || ''
    }
    
    if (body.imageUrl !== undefined) {
      fields.imageUrl = body.imageUrl || ''
    }
    
    if (body.resources !== undefined) {
      fields.resources = body.resources || ''
    }
    
    if (body.externalLinks !== undefined) {
      fields.externalLinks = body.externalLinks || ''
    }

    // Update in Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Airtable error:', error)
      return NextResponse.json(
        { error: 'Failed to update lesson in Airtable' },
        { status: response.status }
      )
    }

    const updatedRecord = await response.json()
    
    return NextResponse.json({
      success: true,
      id: updatedRecord.id,
      fields: updatedRecord.fields
    })

  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const record = await response.json()
    
    return NextResponse.json({
      id: record.id,
      ...record.fields
    })

  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
