import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cache } from '@/lib/cache'
import { requireAdmin } from '@/lib/requireAdmin'

export const dynamic = 'force-dynamic'

// Las 4 áreas reales. El resto de filas de `programs` (prog-<nivel>-<tipo>)
// son combinaciones nivel×área que ninguna lección usa.
const BASE_PROGRAM_IDS = ['robotica', 'ia', 'hacking', 'diseno']

const MIGRATION_HINT =
  'Falta ejecutar la migración 2026_10_estructura_academica_paso1.sql en Supabase (SQL Editor).'

const roleOf = (raw: unknown): 'admin' | 'teacher' | 'student' => {
  const r = String(raw ?? '').toLowerCase()
  if (r.includes('admin')) return 'admin'
  if (r.includes('teacher') || r.includes('prof') || r.includes('docente')) return 'teacher'
  return 'student'
}

const cleanPrograms = (input: unknown): string[] =>
  Array.isArray(input) ? input.filter((p): p is string => BASE_PROGRAM_IDS.includes(p)) : []

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status })

// La columna program_ids no existe hasta ejecutar la migración del paso 1.
const friendly = (message: string) => (message.includes('program_ids') ? MIGRATION_HINT : message)

// GET — árbol completo: colegios → grupos → docentes y estudiantes
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  try {
    const [schoolsRes, levelsRes, programsRes, groupsRes, assignRes, usersRes] = await Promise.all([
      supabaseAdmin.from('schools').select('id, name').order('name'),
      supabaseAdmin.from('levels').select('id, name, grade_number').order('grade_number', { ascending: true }),
      supabaseAdmin.from('programs').select('id, name').in('id', BASE_PROGRAM_IDS),
      supabaseAdmin.from('courses_catalog').select('*').order('name'),
      supabaseAdmin.from('teacher_courses').select('*'),
      supabaseAdmin.from('users').select('id, name, role, course_id, school_id, level_id, is_active').order('name'),
    ])

    const firstError = [schoolsRes, levelsRes, programsRes, groupsRes, assignRes, usersRes].find(r => r.error)?.error
    if (firstError) return fail(firstError.message, 500)

    const users = (usersRes.data || []).map(u => ({ ...u, role: roleOf(u.role) }))
    const userById = new Map(users.map(u => [u.id, u]))
    const groupRows = groupsRes.data || []
    const groupIds = new Set(groupRows.map(g => g.id))
    const migrated = groupRows.length === 0 || 'program_ids' in groupRows[0]

    const groups = groupRows.map(g => ({
      id: g.id as string,
      name: g.name as string,
      levelId: (g.level_id || '') as string,
      schoolId: (g.school_id || '') as string,
      isActive: g.is_active !== false,
      programIds: cleanPrograms(g.program_ids),
      teachers: (assignRes.data || [])
        .filter(a => a.course_id === g.id)
        .map(a => ({
          assignmentId: a.id as string,
          teacherId: a.teacher_id as string,
          name: userById.get(a.teacher_id)?.name || a.teacher_name || 'Docente',
          programIds: cleanPrograms(a.program_ids),
        })),
      students: users
        .filter(u => u.role === 'student' && u.course_id === g.id)
        .map(u => ({ id: u.id as string, name: u.name as string, isActive: u.is_active !== false })),
    }))

    const programs = BASE_PROGRAM_IDS
      .map(id => (programsRes.data || []).find(p => p.id === id))
      .filter((p): p is { id: string; name: string } => !!p)

    return NextResponse.json({
      success: true,
      migrated,
      schools: schoolsRes.data || [],
      levels: levelsRes.data || [],
      programs,
      groups,
      teachers: users.filter(u => u.role === 'teacher').map(u => ({ id: u.id, name: u.name })),
      // Estudiantes cuyo curso no existe: hoy no heredan colegio ni programas.
      unassignedStudents: users
        .filter(u => u.role === 'student' && !groupIds.has(u.course_id))
        .map(u => ({ id: u.id, name: u.name, levelId: u.level_id || '' })),
    })
  } catch (error) {
    console.error('[Estructura] GET error:', error)
    return fail('Error al cargar la estructura', 500)
  }
}

// POST — acciones sobre la estructura (solo admin)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response
  if (auth.session.role !== 'admin') return fail('Solo un administrador puede cambiar la estructura', 403)

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'setGroupPrograms') {
      const { groupId } = body
      if (!groupId) return fail('groupId es requerido')
      const { error } = await supabaseAdmin
        .from('courses_catalog')
        .update({ program_ids: cleanPrograms(body.programIds) })
        .eq('id', groupId)
      if (error) return fail(friendly(error.message))
    } else if (action === 'assignTeacher') {
      const { groupId, teacherId } = body
      if (!groupId || !teacherId) return fail('groupId y teacherId son requeridos')

      const [{ data: group }, { data: teacher }] = await Promise.all([
        supabaseAdmin.from('courses_catalog').select('*').eq('id', groupId).maybeSingle(),
        supabaseAdmin.from('users').select('id, name, role').eq('id', teacherId).maybeSingle(),
      ])
      if (!group) return fail('El grupo no existe', 404)
      if (!teacher || roleOf(teacher.role) !== 'teacher') return fail('El usuario no es docente', 400)

      const programIds = cleanPrograms(body.programIds)
      const { data: existing } = await supabaseAdmin
        .from('teacher_courses')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('course_id', groupId)
        .limit(1)

      const { error } = existing && existing.length > 0
        ? await supabaseAdmin.from('teacher_courses').update({ program_ids: programIds }).eq('id', existing[0].id)
        : await supabaseAdmin.from('teacher_courses').insert({
            teacher_id: teacherId,
            teacher_name: teacher.name,
            course_id: groupId,
            course_name: group.name,
            level_id: group.level_id || null,
            school_id: group.school_id || null,
            school_name: group.school_name || null,
            program_ids: programIds,
          })
      if (error) return fail(friendly(error.message))
    } else if (action === 'unassignTeacher') {
      const { assignmentId } = body
      if (!assignmentId) return fail('assignmentId es requerido')
      const { error } = await supabaseAdmin.from('teacher_courses').delete().eq('id', assignmentId)
      if (error) return fail(error.message)
    } else if (action === 'moveStudent') {
      const { userId, groupId } = body
      if (!userId || !groupId) return fail('userId y groupId son requeridos')
      const { data: group } = await supabaseAdmin.from('courses_catalog').select('*').eq('id', groupId).maybeSingle()
      if (!group) return fail('El grupo no existe', 404)

      // El estudiante hereda nivel y colegio de su grupo.
      const fields: Record<string, string | null> = { course_id: group.id, course_name: group.name }
      if (group.level_id) fields.level_id = group.level_id
      if (group.school_id) {
        fields.school_id = group.school_id
        fields.school_name = group.school_name || null
      }
      const { error } = await supabaseAdmin.from('users').update(fields).eq('id', userId)
      if (error) return fail(error.message)
    } else {
      return fail('Acción no válida')
    }

    cache.invalidateByPrefix('users:')
    cache.invalidateByPrefix('courses:')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Estructura] POST error:', error)
    return fail('Error al guardar', 500)
  }
}
