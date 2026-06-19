import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToPlan(row: any) {
  return {
    id: row.id,
    levelId: row.level_id || '',
    month: row.month || '',
    topic: row.topic || '',
    project: row.project || '',
    order: row.display_order || 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')

    let query = supabaseAdmin.from('year_plans').select('*').order('display_order')
    if (levelId) query = query.eq('level_id', levelId)

    const { data, error } = await query
    if (error) return NextResponse.json({ plans: [] })
    return NextResponse.json({ success: true, plans: (data || []).map(rowToPlan) })
  } catch (error) {
    return NextResponse.json({ plans: [] })
  }
}
