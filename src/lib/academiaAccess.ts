import { supabaseAdmin } from '@/lib/supabase'
import type { SessionPayload } from '@/lib/session'

// Pares "colegio|nivel" de los cursos de Academia que una persona puede ver.
//   - admin: todo
//   - estudiante: el colegio y nivel de su grupo (y los de su ficha)
//   - docente: los grupos asignados en teacher_courses, más su ficha
// Lo usan la lista de cursos (/api/academia/instituciones) y la ficha de
// cada curso (/api/academia/kit/[id]): lo que no aparece en la lista
// tampoco se puede abrir escribiendo el enlace a mano.
export async function academiaAccessFor(session: SessionPayload): Promise<'all' | Set<string>> {
  if (session.role === 'admin') return 'all'
  const pairs = new Set<string>()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('name, school_id, level_id, course_id')
    .eq('id', session.id)
    .maybeSingle()
  if (!user) return pairs
  if (user.school_id && user.level_id) pairs.add(`${user.school_id}|${user.level_id}`)

  const groupIds: string[] = user.course_id ? [user.course_id] : []
  if (session.role === 'teacher') {
    const { data: assignments } = await supabaseAdmin
      .from('teacher_courses')
      .select('course_id, school_id, level_id')
      .eq('teacher_id', session.id)
    for (const a of assignments || []) {
      if (a.school_id && a.level_id) pairs.add(`${a.school_id}|${a.level_id}`)
      if (a.course_id) groupIds.push(a.course_id)
    }
  }

  if (groupIds.length) {
    const { data: groups } = await supabaseAdmin
      .from('courses_catalog')
      .select('school_id, level_id')
      .in('id', groupIds)
    for (const g of groups || []) {
      if (g.school_id && g.level_id) pairs.add(`${g.school_id}|${g.level_id}`)
    }
  }
  return pairs
}

// Colegios cuyo plan del año usa también los proyectos «adicionales» del kit.
// En el resto de academias se muestran solo el proyecto principal y sus prácticas.
export const ACADEMIAS_CON_ADICIONALES = new Set(['school-copol'])

// ---------------------------------------------------------------------------
// Tareas y entregas por colegio
// ---------------------------------------------------------------------------
// Una tarea (o una entrega) es de un grado y, opcionalmente, de un colegio
// (school_id). Sin colegio = "general".
//   - Quien tiene ese grado como curso de su institución ve solo lo de su colegio.
//   - Quien tiene ese grado sin institución ve solo lo general.
//   - El administrador ve todo.

export interface AlcanceColegio {
  esAdmin: boolean
  /** Pares "colegio|nivel" de sus cursos de institución. */
  pares: Set<string>
  /** Niveles que tiene por cualquier vía (ficha, asignaciones, grupos). */
  niveles: Set<string>
  /** Niveles en los que su colegio tiene un curso de Academia publicado. */
  nivelesInstitucion: Set<string>
}

export async function alcanceColegio(session: SessionPayload | null): Promise<AlcanceColegio> {
  const vacio = { esAdmin: false, pares: new Set<string>(), niveles: new Set<string>(), nivelesInstitucion: new Set<string>() }
  if (!session) return vacio
  if (session.role === 'admin') return { ...vacio, esAdmin: true }

  const acceso = await academiaAccessFor(session)
  const pares = acceso === 'all' ? new Set<string>() : acceso
  const niveles = new Set<string>()
  pares.forEach(p => niveles.add(p.slice(p.indexOf('|') + 1)))
  // "De institución" = su colegio tiene un curso de Academia publicado para ese
  // grado (lo mismo que decide qué tarjetas ve en /niveles). Un colegio sin
  // cursos de Academia sigue usando los niveles y las tareas generales.
  const nivelesInstitucion = new Set<string>()
  if (pares.size > 0) {
    const { data: kits } = await supabaseAdmin.from('kits').select('school_id, level_id').eq('visible', true).not('curso_id', 'is', null)
    for (const k of kits || []) if (pares.has(k.school_id + '|' + k.level_id)) nivelesInstitucion.add(k.level_id)
  }

  const { data: user } = await supabaseAdmin.from('users').select('level_id').eq('id', session.id).maybeSingle()
  if (user?.level_id) niveles.add(user.level_id)
  if (session.role === 'teacher') {
    const { data: asignaciones } = await supabaseAdmin.from('teacher_courses').select('level_id').eq('teacher_id', session.id)
    for (const a of asignaciones || []) if (a.level_id) niveles.add(a.level_id)
  }
  return { esAdmin: false, pares, niveles, nivelesInstitucion }
}

/** ¿Puede esta persona ver algo de ese grado y colegio (colegio vacío = general)? */
export function puedeVer(a: AlcanceColegio, levelId: string | null | undefined, schoolId: string | null | undefined): boolean {
  if (a.esAdmin) return true
  if (!levelId) return false
  if (schoolId) return a.pares.has(schoolId + '|' + levelId)
  return a.niveles.has(levelId) && !a.nivelesInstitucion.has(levelId)
}

/**
 * Igual que puedeVer, pero para entregas: una entrega sin colegio guardado se
 * atribuye al colegio de quien la envió (las antiguas no lo guardaban).
 */
export async function filtrarEntregas(a: AlcanceColegio, filas: any[]): Promise<any[]> {
  if (a.esAdmin) return filas
  const sinColegio = Array.from(new Set(filas.filter(r => !r.school_id && r.user_id).map(r => r.user_id as string)))
  const colegioDe = new Map<string, string>()
  if (sinColegio.length) {
    const { data: us } = await supabaseAdmin.from('users').select('id, school_id').in('id', sinColegio)
    for (const u of us || []) if (u.school_id) colegioDe.set(u.id, u.school_id)
  }
  return filas.filter(r => puedeVer(a, r.level_id, r.school_id || colegioDe.get(r.user_id) || null))
}

/** Colegios en los que la persona tiene ese grado. */
export function colegiosDelNivel(a: AlcanceColegio, levelId: string): string[] {
  const out: string[] = []
  a.pares.forEach(p => { if (p.endsWith('|' + levelId)) out.push(p.slice(0, p.indexOf('|'))) })
  return out
}
