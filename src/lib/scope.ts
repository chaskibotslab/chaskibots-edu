// Alcance del usuario logueado: a qué grupos pertenece (estudiante) o
// enseña (docente) y qué programas le corresponden. Sale siempre de la
// sesión, nunca de parámetros que mande el navegador.
//
// Regla de compatibilidad: `programIds === null` significa "sin
// restricción" (admin, o usuarios que todavía no están enlazados a un
// grupo), para no dejar a nadie sin contenido mientras se ordenan los datos.

import { supabaseAdmin } from './supabase'
import type { SessionPayload } from './session'

export interface ScopeGroup {
  id: string
  name: string
  levelId: string
  schoolId: string
  programIds: string[]
}

export interface UserScope {
  role: SessionPayload['role']
  levelIds: string[]
  groups: ScopeGroup[]
  programIds: string[] | null
}

const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)))

function toGroup(row: any, programIds?: string[]): ScopeGroup {
  return {
    id: row.id,
    name: row.name || '',
    levelId: row.level_id || '',
    schoolId: row.school_id || '',
    programIds: programIds && programIds.length > 0 ? programIds : list(row.program_ids),
  }
}

export async function getUserScope(session: SessionPayload): Promise<UserScope> {
  if (session.role === 'admin') return { role: 'admin', levelIds: [], groups: [], programIds: null }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('level_id, course_id')
    .eq('id', session.id)
    .maybeSingle()
  const ownLevel = user?.level_id ? [user.level_id as string] : []

  if (session.role === 'student') {
    const { data: group } = user?.course_id
      ? await supabaseAdmin.from('courses_catalog').select('*').eq('id', user.course_id).maybeSingle()
      : { data: null }
    if (!group) return { role: 'student', levelIds: ownLevel, groups: [], programIds: null }
    const g = toGroup(group)
    return {
      role: 'student',
      levelIds: unique([g.levelId, ...ownLevel]),
      groups: [g],
      programIds: g.programIds.length > 0 ? g.programIds : null,
    }
  }

  const { data: assignments } = await supabaseAdmin.from('teacher_courses').select('*').eq('teacher_id', session.id)
  const rows = assignments || []
  if (rows.length === 0) return { role: 'teacher', levelIds: ownLevel, groups: [], programIds: null }

  const { data: groupRows } = await supabaseAdmin
    .from('courses_catalog')
    .select('*')
    .in('id', unique(rows.map(a => a.course_id)))
  const groups = (groupRows || []).map(g => toGroup(g, list(rows.find(a => a.course_id === g.id)?.program_ids)))
  const programs = unique(groups.flatMap(g => g.programIds))

  return {
    role: 'teacher',
    levelIds: unique([...groups.map(g => g.levelId), ...rows.map(a => a.level_id)]),
    groups,
    programIds: programs.length > 0 ? programs : null,
  }
}
