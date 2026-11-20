// Torneo Chaski Bots 10: acceso de jueces con una clave compartida y lectura pública.
//
// La cookie del juez NO usa el mismo formato que la sesión de la plataforma
// (src/lib/session.ts): se firma con un prefijo propio, así que copiar su valor
// a `chaskibots_session` no sirve para entrar al resto de la plataforma.

import { createHmac, createHash, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'

export const COOKIE_JUEZ = 'torneo_juez'
export const JUEZ_MAX_AGE_SECONDS = 4 * 24 * 60 * 60 // cubre los días del torneo
export const MAX_INTEGRANTES = 3
export const ESTADOS = ['pendiente', 'en_curso', 'finalizada'] as const

function firma(exp: string): string | null {
  const secreto = process.env.SESSION_SECRET
  if (!secreto) return null
  return createHmac('sha256', secreto).update(`torneo-juez:${exp}`).digest('hex')
}

function iguales(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function crearCookieJuez(): string | null {
  const exp = String(Date.now() + JUEZ_MAX_AGE_SECONDS * 1000)
  const f = firma(exp)
  return f ? `${exp}.${f}` : null
}

function cookieJuezValida(valor: string | undefined): boolean {
  if (!valor) return false
  const [exp, f] = valor.split('.')
  if (!exp || !f || !(Number(exp) > Date.now())) return false
  const esperada = firma(exp)
  return !!esperada && iguales(esperada, f)
}

// Juez = quien entró con la clave del torneo, o un administrador/docente de la plataforma.
export async function esJuez(request: NextRequest): Promise<boolean> {
  if (cookieJuezValida(request.cookies.get(COOKIE_JUEZ)?.value)) return true
  const sesion = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  return sesion?.role === 'admin' || sesion?.role === 'teacher'
}

export async function claveCorrecta(clave: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.from('torneo_config').select('clave_hash').eq('id', 1).maybeSingle()
  if (error || !data?.clave_hash) return false
  const hash = createHash('sha256').update(clave, 'utf8').digest('hex')
  return iguales(hash, String(data.clave_hash))
}

// ------------------------------------------------------------------ datos
export interface EquipoTorneo {
  id: string; numero: number; robot: string; equipo: string; integrantes: string[]
  puesto: number | null; puntaje: string | null; nota?: string | null
}
export interface CategoriaTorneo {
  id: string; nombre: string; orden: number; estado: typeof ESTADOS[number]; equipos: EquipoTorneo[]
}

// La página pública la consultan muchos teléfonos a la vez y se refresca sola:
// se guarda la respuesta unos segundos para no ir a la base en cada visita.
const CACHE_MS = 8000
let cache: { t: number; datos: CategoriaTorneo[] } | null = null
export function vaciarCacheTorneo() { cache = null }

export async function leerTorneo(): Promise<CategoriaTorneo[]> {
  if (cache && Date.now() - cache.t < CACHE_MS) return cache.datos
  const [cats, eqs] = await Promise.all([
    supabaseAdmin.from('torneo_categorias').select('id, nombre, orden, estado').order('orden').order('nombre'),
    supabaseAdmin.from('torneo_equipos').select('id, categoria_id, numero, robot, equipo, integrantes, puesto, puntaje, nota').order('numero').order('created_at'),
  ])
  if (cats.error) throw cats.error
  if (eqs.error) throw eqs.error
  const porCat = new Map<string, EquipoTorneo[]>()
  for (const e of eqs.data || []) {
    const lista = porCat.get(e.categoria_id) || []
    lista.push({ id: e.id, numero: e.numero, robot: e.robot, equipo: e.equipo, integrantes: e.integrantes || [], puesto: e.puesto, puntaje: e.puntaje, nota: e.nota })
    porCat.set(e.categoria_id, lista)
  }
  const datos = (cats.data || []).map(c => ({ ...c, equipos: porCat.get(c.id) || [] })) as CategoriaTorneo[]
  cache = { t: Date.now(), datos }
  return datos
}

// Lo que ve el público: sin las notas internas de los jueces.
export function sinNotas(cats: CategoriaTorneo[]): CategoriaTorneo[] {
  return cats.map(c => ({ ...c, equipos: c.equipos.map(({ nota, ...e }) => e) }))
}

// ------------------------------------------------------------- validación
export function texto(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

export function listaIntegrantes(v: unknown, tope: number): string[] | null {
  if (!Array.isArray(v)) return null
  const nombres = v.map(n => texto(n, 80)).filter(Boolean)
  return nombres.length <= tope ? nombres : null
}
