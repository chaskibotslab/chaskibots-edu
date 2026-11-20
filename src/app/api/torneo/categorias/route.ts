import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { esJuez, vaciarCacheTorneo, texto, ESTADOS } from '@/lib/torneo'

export const dynamic = 'force-dynamic'

const error = (mensaje: string, status = 400) => NextResponse.json({ success: false, error: mensaje }, { status })

// Crear una categoría nueva (queda al final de la lista).
export async function POST(request: NextRequest) {
  if (!(await esJuez(request))) return error('No autorizado', 401)
  const c = await request.json().catch(() => null)
  const nombre = texto(c?.nombre, 100)
  if (!nombre) return error('Escribe el nombre de la categoría')
  const { data: ultima } = await supabaseAdmin.from('torneo_categorias').select('orden').order('orden', { ascending: false }).limit(1).maybeSingle()
  const { data, error: e } = await supabaseAdmin.from('torneo_categorias').insert({ nombre, orden: (ultima?.orden || 0) + 1 }).select('id').single()
  if (e) return error(e.code === '23505' ? 'Ya existe una categoría con ese nombre' : 'No se pudo guardar', e.code === '23505' ? 409 : 500)
  vaciarCacheTorneo()
  return NextResponse.json({ success: true, id: data.id })
}

// Cambiar el estado (pendiente, en curso, finalizada) o el nombre.
export async function PATCH(request: NextRequest) {
  if (!(await esJuez(request))) return error('No autorizado', 401)
  const c = await request.json().catch(() => null)
  if (typeof c?.id !== 'string') return error('Falta la categoría')
  const cambios: Record<string, unknown> = {}
  if ('estado' in c) {
    if (!ESTADOS.includes(c.estado)) return error('Estado no válido')
    cambios.estado = c.estado
  }
  if ('nombre' in c) {
    const nombre = texto(c.nombre, 100)
    if (!nombre) return error('Escribe el nombre de la categoría')
    cambios.nombre = nombre
  }
  if (!Object.keys(cambios).length) return error('Nada que cambiar')
  const { error: e } = await supabaseAdmin.from('torneo_categorias').update(cambios).eq('id', c.id)
  if (e) return error(e.code === '23505' ? 'Ya existe una categoría con ese nombre' : 'No se pudo guardar', e.code === '23505' ? 409 : 500)
  vaciarCacheTorneo()
  return NextResponse.json({ success: true })
}
