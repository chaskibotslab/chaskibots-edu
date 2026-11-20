import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { esJuez, vaciarCacheTorneo } from '@/lib/torneo'
import { aplicar, podio, Competencia } from '@/lib/torneoCompetencia'

export const dynamic = 'force-dynamic'

const error = (mensaje: string, status = 400) => NextResponse.json({ success: false, error: mensaje }, { status })

// Acciones de los jueces sobre la competencia de una categoría: crearla, registrar
// tiempos o resultados de enfrentamientos, armar la fase final y pasar el podio a resultados.
export async function POST(request: NextRequest) {
  if (!(await esJuez(request))) return error('No autorizado', 401)
  const c = await request.json().catch(() => null)
  if (typeof c?.categoriaId !== 'string' || typeof c?.accion?.tipo !== 'string') return error('Faltan datos')

  const [cat, eqs] = await Promise.all([
    supabaseAdmin.from('torneo_categorias').select('id, competencia').eq('id', c.categoriaId).maybeSingle(),
    supabaseAdmin.from('torneo_equipos').select('id').eq('categoria_id', c.categoriaId).order('numero').order('created_at'),
  ])
  if (cat.error) {
    console.error('[torneo] competencia', cat.error)
    return error('Falta preparar la base de datos para las competencias (columna «competencia»).', 500)
  }
  if (!cat.data) return error('Esa categoría ya no existe', 404)
  const ids = (eqs.data || []).map(e => e.id as string)
  const actual = (cat.data.competencia as Competencia | null) || null

  // Quita puestos y puntajes escritos a mano en todos los equipos de la categoría.
  const quitarPodio = () => supabaseAdmin.from('torneo_equipos').update({ puesto: null, puntaje: null, updated_at: new Date().toISOString() }).eq('categoria_id', c.categoriaId).or('puesto.not.is.null,puntaje.not.is.null')

  // Borrar los resultados de la categoría: puestos 1.º, 2.º y 3.º y puntajes o tiempos escritos a mano.
  if (c.accion.tipo === 'borrar_podio') {
    const r = await quitarPodio()
    if (r.error) return error('No se pudo guardar', 500)
    vaciarCacheTorneo()
    return NextResponse.json({ success: true })
  }

  // Pasar el podio de la competencia a los puestos que ve el público.
  if (c.accion.tipo === 'podio') {
    const puestos = actual ? podio(actual, ids) : null
    if (!puestos) return error('Todavía no se puede sacar el podio: falta terminar la competencia.')
    const ahora = new Date().toISOString()
    const limpiar = await supabaseAdmin.from('torneo_equipos').update({ puesto: null, updated_at: ahora }).eq('categoria_id', c.categoriaId).not('puesto', 'is', null)
    if (limpiar.error) return error('No se pudo guardar', 500)
    for (const [id, puesto] of Object.entries(puestos)) {
      const r = await supabaseAdmin.from('torneo_equipos').update({ puesto, updated_at: ahora }).eq('id', id)
      if (r.error) return error('No se pudo guardar', 500)
    }
    vaciarCacheTorneo()
    return NextResponse.json({ success: true })
  }

  let nueva: Competencia | null
  try {
    nueva = aplicar(actual, c.accion, ids)
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Acción no válida')
  }
  const { error: e } = await supabaseAdmin.from('torneo_categorias').update({ competencia: nueva }).eq('id', c.categoriaId)
  if (e) { console.error('[torneo] guardar competencia', e); return error('No se pudo guardar', 500) }
  // Al reiniciar la competencia, el podio anterior deja de valer: se borra también.
  if (c.accion.tipo === 'borrar') await quitarPodio()
  vaciarCacheTorneo()
  return NextResponse.json({ success: true })
}
