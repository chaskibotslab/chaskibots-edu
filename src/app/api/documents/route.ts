import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToDoc(row: any) {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    driveUrl: row.drive_url || '',
    levelId: row.level_id || '',
    moduleId: row.module_id || '',
    category: row.category || 'otro',
    tags: Array.isArray(row.tags) ? row.tags : (row.tags ? String(row.tags).split(',').map((t: string) => t.trim()) : []),
    createdAt: row.created_at || '',
    isActive: row.is_active !== false,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const category = searchParams.get('category')

    let query = supabaseAdmin.from('documents').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (levelId) query = query.eq('level_id', levelId)
    if (category) query = query.eq('category', category)

    const { data, error } = await query
    if (error) {
      console.error('[Documents] error:', error)
      return NextResponse.json({ success: true, documents: [] })
    }

    return NextResponse.json({ success: true, documents: (data || []).map(rowToDoc) })
  } catch (error) {
    return NextResponse.json({ success: true, documents: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, driveUrl, levelId, moduleId, category, tags } = body
    if (!title || !driveUrl || !levelId) {
      return NextResponse.json({ error: 'title, driveUrl y levelId son requeridos' }, { status: 400 })
    }

    const tagsArr = Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [])

    const { data, error } = await supabaseAdmin.from('documents').insert({
      title, description: description || null, drive_url: driveUrl, level_id: levelId,
      module_id: moduleId || null, category: category || 'otro', tags: tagsArr.length > 0 ? tagsArr : null,
      is_active: true,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, document: rowToDoc(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const fields: Record<string, any> = {}
    if (updates.title !== undefined) fields.title = updates.title
    if (updates.description !== undefined) fields.description = updates.description
    if (updates.driveUrl !== undefined) fields.drive_url = updates.driveUrl
    if (updates.levelId !== undefined) fields.level_id = updates.levelId
    if (updates.moduleId !== undefined) fields.module_id = updates.moduleId
    if (updates.category !== undefined) fields.category = updates.category
    if (updates.tags !== undefined) {
      fields.tags = Array.isArray(updates.tags) ? updates.tags : String(updates.tags).split(',').map((t: string) => t.trim())
    }
    if (updates.isActive !== undefined) fields.is_active = updates.isActive

    const { error } = await supabaseAdmin.from('documents').update(fields).eq('id', id)
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

    const { error } = await supabaseAdmin.from('documents').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
