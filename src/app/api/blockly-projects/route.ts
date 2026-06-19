import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToProject(row: any) {
  return {
    id: row.id,
    userId: row.user_id || '',
    userName: row.user_name || '',
    projectName: row.project_name || '',
    projectData: row.project_data || {},
    levelId: row.level_id || '',
    isPublic: row.is_public || false,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userName = searchParams.get('userName')
    const levelId = searchParams.get('levelId')
    const publicOnly = searchParams.get('public') === 'true'

    let query = supabaseAdmin.from('blockly_projects').select('*').order('updated_at', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    if (userName) query = query.eq('user_name', userName)
    if (levelId) query = query.eq('level_id', levelId)
    if (publicOnly) query = query.eq('is_public', true)

    const { data, error } = await query
    if (error) return NextResponse.json({ projects: [] })
    return NextResponse.json({ success: true, projects: (data || []).map(rowToProject) })
  } catch (error) {
    return NextResponse.json({ projects: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, projectName, projectData, levelId, isPublic } = body
    if (!projectName) return NextResponse.json({ error: 'projectName requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('blockly_projects').insert({
      user_id: userId || null, user_name: userName || null,
      project_name: projectName, project_data: projectData || {},
      level_id: levelId || null, is_public: Boolean(isPublic),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, project: rowToProject(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, projectName, projectData, isPublic } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const fields: Record<string, any> = {}
    if (projectName !== undefined) fields.project_name = projectName
    if (projectData !== undefined) fields.project_data = projectData
    if (isPublic !== undefined) fields.is_public = Boolean(isPublic)

    const { error } = await supabaseAdmin.from('blockly_projects').update(fields).eq('id', id)
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

    const { error } = await supabaseAdmin.from('blockly_projects').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
