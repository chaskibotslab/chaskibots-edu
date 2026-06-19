import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_TABLE = 'virtual_files'

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export interface VirtualFile {
  id: string
  recordId: string
  userId: string
  userName: string
  path: string
  name: string
  type: 'file' | 'dir'
  content: string
  mimeType: string
  size: number
  permissions: string
  createdAt: string
  updatedAt: string
}

// GET - Obtener archivos de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const path = searchParams.get('path')

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    let filterFormula = `{userId}="${userId}"`
    if (path) {
      filterFormula = `AND({userId}="${userId}", {path}="${path}")`
    }

    const url = `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=path&sort[0][direction]=asc`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Airtable error:', error)
      return NextResponse.json({ error: 'Error al cargar archivos' }, { status: 500 })
    }

    const data = await response.json()
    const files: VirtualFile[] = data.records.map((record: any) => ({
      id: record.fields.id || record.id,
      recordId: record.id,
      userId: record.fields.userId,
      userName: record.fields.userName,
      path: record.fields.path,
      name: record.fields.name,
      type: record.fields.type || 'file',
      content: record.fields.content || '',
      mimeType: record.fields.mimeType || 'text/plain',
      size: record.fields.size || 0,
      permissions: record.fields.permissions || 'rw-r--r--',
      createdAt: record.fields.createdAt || record.createdTime,
      updatedAt: record.fields.updatedAt || record.createdTime
    }))

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear archivo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, path, name, type, content, mimeType } = body

    if (!userId || !path || !name) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            id: fileId,
            userId,
            userName: userName || 'Usuario',
            path,
            name,
            type: type || 'file',
            content: content || '',
            mimeType: mimeType || 'text/plain',
            size: (content || '').length,
            permissions: 'rw-r--r--',
            createdAt: now,
            updatedAt: now
          }
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Airtable error:', error)
      return NextResponse.json({ error: 'Error al crear archivo' }, { status: 500 })
    }

    const data = await response.json()
    const record = data.records[0]

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        recordId: record.id,
        userId,
        userName,
        path,
        name,
        type: type || 'file',
        content: content || '',
        mimeType: mimeType || 'text/plain',
        size: (content || '').length,
        permissions: 'rw-r--r--',
        createdAt: now,
        updatedAt: now
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH - Actualizar archivo
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { recordId, content, name } = body

    if (!recordId) {
      return NextResponse.json({ error: 'recordId requerido' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const fields: any = { updatedAt: now }
    
    if (content !== undefined) {
      fields.content = content
      fields.size = content.length
    }
    if (name) fields.name = name

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          id: recordId,
          fields
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Airtable error:', error)
      return NextResponse.json({ error: 'Error al actualizar archivo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar archivo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId')

    if (!recordId) {
      return NextResponse.json({ error: 'recordId requerido' }, { status: 400 })
    }

    const response = await fetch(`${AIRTABLE_API_URL}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Airtable error:', error)
      return NextResponse.json({ error: 'Error al eliminar archivo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
