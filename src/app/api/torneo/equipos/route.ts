import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { esJuez, vaciarCacheTorneo, texto, listaIntegrantes, MAX_INTEGRANTES } from '@/lib/torneo'

export const dynamic = 'force-dynamic'

const error = (mensaje: string, status = 400) => NextResponse.json({ success: false, error: mensaje }, { status })
const esId = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)

// Agregar un equipo a una categoría.
export async function POST(request: NextRequest) {
  if (!(await esJuez(request))) return error('No autorizado', 401)
  const c = await request.json().catch(() => null)
  if (!esId(c?.categoriaId)) return error('Falta la categoría')
  const robot = texto(c.robot, 80)
  if (!robot) return error('Escribe el nombre del robot')
  const integrantes = listaIntegrantes(c.integrantes ?? [], MAX_INTEGRANTES)
  if (!integrantes) return error(`Máximo ${MAX_INTEGRANTES} participantes`)

  const { data: ultimo } = await supabaseAdmin.from('torneo_equipos').select('numero')
    .eq('categoria_id', c.categoriaId).order('numero', { ascending: false }).limit(1).maybeSingle()
  const { data, error: e } = await supabaseAdmin.from('torneo_equipos').insert({
    categoria_id: c.categoriaId, numero: (ultimo?.numero || 0) + 1, robot,
    equipo: texto(c.equipo, 120), integrantes, nota: texto(c.nota, 300) || null,
  }).select('id').single()
  if (e) { console.error('[torneo] crear equipo', e); return error('No se pudo guardar', 500) }
  vaciarCacheTorneo()
  return NextResponse.json({ success: true, id: data.id })
}

// Modificar datos del equipo, moverlo de categoría o registrar su resultado.
export async function PATCH(request: NextRequest) {
  if (!(await esJuez(request))) return error('No autorizado', 401)
  const c = await request.json().catch(() => null)
  if (!esId(c?.id)) return error('Falta el equipo')
  const cambios: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if ('robot' in c) {
    const robot = texto(c.robot, 80)
    if (!robot) return error('Escribe el nombre del robot')
    cambios.robot = robot
  }
  if ('equipo' in c) cambios.equipo = texto(c.equipo, 120)
  if ('nota' in c) cambios.nota = texto(c.nota, 300) || null
  if ('puntaje' in c) cambios.puntaje = texto(c.puntaje, 60) || null
  if ('puesto' in c) {
    if (c.puesto !== null && ![1, 2, 3].includes(c.puesto)) return error('Puesto no válido')
    cambios.puesto = c.puesto
  }
  if ('categoriaId' in c) {
    if (!esId(c.categoriaId)) return error('Categoría no válida')
    cambios.categoria_id = c.categoriaId
  }
  if ('integrantes' in c) {
    // Los equipos que ya venían inscritos con más de 3 personas pueden conservarlas, pero no sumar más.
    const { data: actual } = await supabaseAdmin.from('torneo_equipos').select('integrantes').eq('id', c.id).maybeSingle()
    const tope = Math.max(MAX_INTEGRANTES, actual?.integrantes?.length || 0)
    const integrantes = listaIntegrantes(c.integrantes, tope)
    if (!integrantes) return error(`Máximo ${MAX_INTEGRANTES} participantes`)
    cambios.integrantes = integrantes
  }

  const { data, error: e } = await supabaseAdmin.from('torneo_equipos').update(cambios).eq('id', c.id).select('id')
  if (e) { console.error('[torneo] modificar equipo', e); return error('No se pudo guardar', 500) }
  if (!data?.length) return error('Ese equipo ya no existe', 404)
  vaciarCacheTorneo()
  return NextResponse.json({ success: true })
}

// Quitar un equipo.
export async function DELETE(request: NextRequest) {
  if (!(await esJuez(request))) return error('No autorizado', 401)
  const id = request.nextUrl.searchParams.get('id')
  if (!esId(id)) return error('Falta el equipo')
  const { error: e } = await supabaseAdmin.from('torneo_equipos').delete().eq('id', id)
  if (e) { console.error('[torneo] borrar equipo', e); return error('No se pudo borrar', 500) }
  vaciarCacheTorneo()
  return NextResponse.json({ success: true })
}
