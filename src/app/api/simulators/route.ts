import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToSimulator(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    icon: row.icon || '🎮',
    url: row.url || '',
    levels: row.levels || [],
    programs: row.programs || ['robotica', 'ia', 'hacking'],
    enabled: row.enabled !== false,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')
    const programId = searchParams.get('programId')

    let query = supabaseAdmin.from('simulators').select('*').eq('enabled', true).order('name')

    const { data, error } = await query
    if (error) {
      console.error('[Simulators] Supabase error:', error)
      return NextResponse.json({ simulators: [] })
    }

    let simulators = (data || []).map(rowToSimulator)

    // Filtrar en memoria por arrays (Supabase puede hacerlo, pero esto es más simple)
    if (levelId) simulators = simulators.filter((s: any) => s.levels.length === 0 || s.levels.includes(levelId))
    if (programId) simulators = simulators.filter((s: any) => s.programs.length === 0 || s.programs.includes(programId))

    return NextResponse.json({ success: true, simulators })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ simulators: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, icon, url, levels, programs } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'id y name son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from('simulators').insert({
      id,
      name,
      description: description || '',
      icon: icon || '🎮',
      url: url || '',
      levels: Array.isArray(levels) ? levels : (typeof levels === 'string' ? levels.split(',').map((s: string) => s.trim()) : []),
      programs: Array.isArray(programs) ? programs : ['robotica', 'ia', 'hacking'],
      enabled: true,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, simulator: rowToSimulator(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const fields: Record<string, any> = {}
    if (updates.name !== undefined) fields.name = updates.name
    if (updates.description !== undefined) fields.description = updates.description
    if (updates.icon !== undefined) fields.icon = updates.icon
    if (updates.url !== undefined) fields.url = updates.url
    if (updates.levels !== undefined) fields.levels = Array.isArray(updates.levels) ? updates.levels : []
    if (updates.programs !== undefined) fields.programs = Array.isArray(updates.programs) ? updates.programs : []
    if (updates.enabled !== undefined) fields.enabled = Boolean(updates.enabled)

    const { error } = await supabaseAdmin.from('simulators').update(fields).eq('id', id)
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

    const { error } = await supabaseAdmin.from('simulators').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
