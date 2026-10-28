// «Mis robots»: guardar y abrir robots del alumno (tablas lab_robots y
// lab_robot_versiones, ver supabase/migrations/2026_10_lab_robots.sql).
// Solo el servidor toca la base (service role); cada consulta filtra por el
// dueño, así nadie puede leer ni cambiar robots ajenos.

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { SessionPayload } from '@/lib/session'
import { laboratorioActivo, sesionLaboratorio } from './acceso'

const MAX_BYTES = 300 * 1024
const MAX_VERSIONES = 20

type ConSesion = { sesion: SessionPayload; error: null } | { sesion: null; error: NextResponse }

export async function exigirSesion(): Promise<ConSesion> {
  if (!laboratorioActivo()) return { sesion: null, error: NextResponse.json({ error: 'No encontrado' }, { status: 404 }) }
  const sesion = await sesionLaboratorio()
  if (!sesion) return { sesion: null, error: NextResponse.json({ error: 'Inicia sesión para guardar tus robots' }, { status: 401 }) }
  return { sesion, error: null }
}

/** Respuesta clara si todavía no se pegó el SQL de las tablas. */
export function errorBase(error: { code?: string; message?: string } | null) {
  if (error?.code === '42P01' || /lab_robots/.test(error?.message ?? '')) {
    return NextResponse.json({ error: 'El guardado en la cuenta todavía no está activado (faltan las tablas lab_robots).' }, { status: 503 })
  }
  console.error('[lab] error de base de datos:', error)
  return NextResponse.json({ error: 'No se pudo guardar. Intenta de nuevo.' }, { status: 500 })
}

/** Valida el robot que llega del navegador (forma y tamaño). */
export function docValido(doc: unknown): string | null {
  if (!doc || typeof doc !== 'object') return 'Robot inválido'
  const d = doc as { version?: unknown; piezas?: unknown; cables?: unknown; programa?: unknown }
  if (d.version !== 2 || !Array.isArray(d.piezas) || !Array.isArray(d.cables) || typeof d.programa !== 'object') return 'Robot inválido'
  if (JSON.stringify(doc).length > MAX_BYTES) return 'El robot es demasiado grande para guardarlo'
  return null
}

export async function guardarVersion(robotId: string, doc: unknown) {
  await supabaseAdmin.from('lab_robot_versiones').insert({ robot_id: robotId, doc })
  // Conservar solo las últimas versiones.
  const { data } = await supabaseAdmin
    .from('lab_robot_versiones').select('id').eq('robot_id', robotId)
    .order('creado', { ascending: false }).range(MAX_VERSIONES, MAX_VERSIONES + 100)
  if (data?.length) await supabaseAdmin.from('lab_robot_versiones').delete().in('id', data.map(v => v.id))
}

export { supabaseAdmin }
