import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToAct(row: any) {
  return {
    id: row.id,
    levelId: row.level_id || '',
    activityName: row.activity_name || '',
    activityType: row.activity_type || '',
    description: row.description || '',
    difficulty: row.difficulty || '',
    icon: row.icon || '🤖',
    enabled: row.enabled !== false,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')

    let query = supabaseAdmin.from('ai_activities').select('*').eq('enabled', true).order('activity_name')
    if (levelId) query = query.eq('level_id', levelId)

    const { data, error } = await query
    if (error) return NextResponse.json({ activities: [] })
    return NextResponse.json({ success: true, activities: (data || []).map(rowToAct) })
  } catch (error) {
    return NextResponse.json({ activities: [] })
  }
}
