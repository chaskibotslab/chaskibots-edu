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

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('experiencias').select('*').eq('activo', true).order('orden')
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
