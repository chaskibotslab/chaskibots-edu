import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToProject(row: any) {
  return {
    id: row.id,
    levelId: row.level_id || '',
    projectName: row.project_name || '',
    category: row.category || '',
    description: row.description || '',
    hardware: row.hardware || '',
    difficulty: row.difficulty || '',
    duration: row.duration || '',
    videoUrl: row.video_url || '',
    tutorialUrl: row.tutorial_url || '',
    resources: row.resources || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')

    let query = supabaseAdmin.from('projects').select('*').order('project_name')
    if (levelId) query = query.eq('level_id', levelId)

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
    const { levelId, projectName, category, description, hardware, difficulty, duration, videoUrl, tutorialUrl, resources } = body
    if (!projectName) return NextResponse.json({ error: 'projectName requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('projects').insert({
      level_id: levelId, project_name: projectName,
      category: category || null, description: description || null, hardware: hardware || null,
      difficulty: difficulty || null, duration: duration || null,
      video_url: videoUrl || null, tutorial_url: tutorialUrl || null, resources: resources || null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, project: rowToProject(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
