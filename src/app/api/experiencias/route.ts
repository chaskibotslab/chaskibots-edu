import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function rowToExp(row: any) {
  return {
    id: row.id,
    titulo: row.titulo || '',
    descripcion: row.descripcion || '',
    tipo: row.tipo || '',
    url: row.url || '',
    institucion: row.institucion || '',
    orden: row.orden || 0,
    activo: row.activo !== false,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    let query = supabaseAdmin.from('experiencias').select('*').order('orden')
    if (!all) query = query.eq('activo', true)

    const { data, error } = await query
    if (error) return NextResponse.json({ experiencias: [] })
    return NextResponse.json({ success: true, experiencias: (data || []).map(rowToExp) })
  } catch (error) {
    return NextResponse.json({ experiencias: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titulo, descripcion, tipo, url, institucion, orden } = body
    if (!titulo) return NextResponse.json({ error: 'titulo requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('experiencias').insert({
      titulo, descripcion: descripcion || null, tipo: tipo || null,
      url: url || null, institucion: institucion || null, orden: orden || 0, activo: true,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, experiencia: rowToExp(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, titulo, descripcion, tipo, url, institucion, orden, activo } = body
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    if (!titulo) return NextResponse.json({ error: 'titulo requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('experiencias')
      .update({
        titulo,
        descripcion: descripcion || null,
        tipo: tipo || null,
        url: url || null,
        institucion: institucion || null,
        orden: orden || 0,
        activo: activo !== false,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, experiencia: rowToExp(data) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const { error } = await supabaseAdmin.from('experiencias').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
