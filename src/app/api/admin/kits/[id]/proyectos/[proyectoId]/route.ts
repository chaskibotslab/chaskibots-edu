import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/requireAdmin'

export const dynamic = 'force-dynamic'

// Edita el texto y el codigo de un proyecto de kit (principal, adicional o
// practica): titulo, descripcion, objetivos y el codigo Arduino. El
// esquema (diagrama/imagen) se edita aparte en el sub-recurso /esquema.
export async function PATCH(request: NextRequest, { params }: { params: { id: string; proyectoId: string } }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const { titulo, descripcion, objetivos, codigo } = body

    const { data: proyecto, error: proyErr } = await supabaseAdmin
      .from('kit_proyectos')
      .select('id, kit_id')
      .eq('id', params.proyectoId)
      .eq('kit_id', params.id)
      .maybeSingle()
    if (proyErr) return NextResponse.json({ success: false, error: proyErr.message }, { status: 500 })
    if (!proyecto) return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 })

    const updateFields: Record<string, any> = {}
    if (titulo !== undefined) updateFields.titulo = titulo
    if (descripcion !== undefined) updateFields.descripcion = descripcion
    if (objetivos !== undefined) updateFields.objetivos = objetivos

    if (Object.keys(updateFields).length > 0) {
      const { error: updErr } = await supabaseAdmin.from('kit_proyectos').update(updateFields).eq('id', proyecto.id)
      if (updErr) return NextResponse.json({ success: false, error: updErr.message }, { status: 500 })
    }

    if (codigo !== undefined) {
      const { data: existing } = await supabaseAdmin.from('kit_codigos').select('id').eq('proyecto_id', proyecto.id).maybeSingle()
      if (existing) {
        const { error: codErr } = await supabaseAdmin.from('kit_codigos').update({ contenido: codigo }).eq('id', existing.id)
        if (codErr) return NextResponse.json({ success: false, error: codErr.message }, { status: 500 })
      } else {
        const { error: codErr } = await supabaseAdmin.from('kit_codigos').insert({ proyecto_id: proyecto.id, lenguaje: 'arduino', contenido: codigo, version: 1 })
        if (codErr) return NextResponse.json({ success: false, error: codErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error interno' }, { status: 500 })
  }
}
