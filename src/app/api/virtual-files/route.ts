import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToFile(row: any) {
  return {
    id: row.id,
    userId: row.user_id || '',
    userName: row.user_name || '',
    path: row.path,
    name: row.name,
    type: row.type || 'file',
    content: row.content || '',
    mimeType: row.mime_type || 'text/plain',
    size: row.size || 0,
    permissions: row.permissions || 'rw-r--r--',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userName = searchParams.get('userName')

    let query = supabaseAdmin.from('virtual_files').select('*').order('path')
    if (userId) query = query.eq('user_id', userId)
    if (userName) query = query.eq('user_name', userName)

    const { data, error } = await query
    if (error) {
      console.error('[VirtualFiles] error:', error)
      return NextResponse.json({ files: [] })
    }

    return NextResponse.json({ success: true, files: (data || []).map(rowToFile) })
  } catch (error) {
    return NextResponse.json({ files: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, path, name, type, content, mimeType, permissions } = body

    if (!path || !name) {
      return NextResponse.json({ error: 'path y name son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from('virtual_files').insert({
      user_id: userId || null,
      user_name: userName || null,
      path,
      name,
      type: type || 'file',
      content: content || '',
      mime_type: mimeType || 'text/plain',
      size: (content || '').length,
      permissions: permissions || 'rw-r--r--',
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, file: rowToFile(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, content, name, permissions } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const fields: Record<string, any> = {}
    if (content !== undefined) {
      fields.content = content
      fields.size = String(content).length
    }
    if (name !== undefined) fields.name = name
    if (permissions !== undefined) fields.permissions = permissions

    const { error } = await supabaseAdmin.from('virtual_files').update(fields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const { error } = await supabaseAdmin.from('virtual_files').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
