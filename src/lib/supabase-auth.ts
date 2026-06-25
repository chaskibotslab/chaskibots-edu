// ============================================
// AUTENTICACIÓN CON SUPABASE - ChaskiBots EDU
// Drop-in replacement de airtable-auth.ts
// Mantiene mismas firmas e interfaces
// ============================================

import { supabaseAdmin } from './supabase'

function normalizeRole(input: unknown): 'admin' | 'teacher' | 'student' {
  const raw = String(input ?? '').trim().toLowerCase()
  if (!raw) return 'student'
  if (raw.includes('admin') || raw.includes('administr')) return 'admin'
  if (raw.includes('teacher') || raw.includes('prof') || raw.includes('docente')) return 'teacher'
  return 'student'
}

export interface CourseUser {
  id: string
  accessCode: string
  name: string
  email?: string
  role: 'admin' | 'teacher' | 'student'
  courseId: string
  courseName: string
  schoolId: string
  schoolName: string
  programId: string
  programName: string
  levelId: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
  expiresAt?: string
}

export interface Course {
  id: string
  name: string
  description?: string
  levelId: string
  teacherId: string
  teacherName: string
  schoolId?: string
  schoolName?: string
  accessCodes: string[]
  maxStudents: number
  currentStudents: number
  isActive: boolean
  createdAt: string
}

function rowToUser(row: any): CourseUser {
  return {
    id: row.id,
    accessCode: row.access_code || '',
    name: row.name || 'Usuario',
    email: row.email || undefined,
    role: normalizeRole(row.role),
    courseId: row.course_id || '',
    courseName: row.course_name || '',
    schoolId: row.school_id || '',
    schoolName: row.school_name || '',
    programId: row.program_id || '',
    programName: row.program_name || '',
    levelId: row.level_id || '',
    isActive: row.is_active !== false,
    createdAt: row.created_at || new Date().toISOString(),
    lastLogin: row.last_login || undefined,
    expiresAt: row.expires_at || undefined,
  }
}

function rowToCourse(row: any): Course {
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || undefined,
    levelId: row.level_id || '',
    teacherId: row.teacher_id || '',
    teacherName: row.teacher_name || '',
    schoolId: row.school_id || '',
    schoolName: row.school_name || '',
    accessCodes: [],
    maxStudents: row.max_students || 30,
    currentStudents: row.current_students || 0,
    isActive: row.is_active !== false,
    createdAt: row.created_at || '',
  }
}

// ============================================
// AUTENTICACIÓN
// ============================================

export async function validateAccessCode(accessCode: string): Promise<{
  success: boolean
  user?: CourseUser
  error?: string
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('access_code', accessCode)
      .limit(1)

    if (error || !data || data.length === 0) {
      return { success: false, error: 'Código de acceso inválido' }
    }

    const row = data[0]

    // Verificar expiración
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return { success: false, error: 'El código de acceso ha expirado' }
    }

    if (row.is_active === false) {
      return { success: false, error: 'Usuario desactivado' }
    }

    // Actualizar último login (best-effort)
    supabaseAdmin.from('users').update({ last_login: new Date().toISOString() }).eq('id', row.id).then(() => {})

    return { success: true, user: rowToUser(row) }
  } catch (error) {
    console.error('Error validating access code:', error)
    return { success: false, error: 'Error de conexión' }
  }
}

export async function validateEmailPassword(email: string, password: string): Promise<{
  success: boolean
  user?: CourseUser
  error?: string
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error || !data || data.length === 0) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    const row = data[0]
    const stored = row.password || row.access_code || ''
    if (stored !== password) {
      return { success: false, error: 'Contraseña incorrecta' }
    }

    if (row.is_active === false) {
      return { success: false, error: 'Usuario desactivado' }
    }

    supabaseAdmin.from('users').update({ last_login: new Date().toISOString() }).eq('id', row.id).then(() => {})

    return { success: true, user: rowToUser(row) }
  } catch (error) {
    console.error('Error validating email/password:', error)
    return { success: false, error: 'Error de conexión' }
  }
}

// ============================================
// USUARIOS
// ============================================

function generateAccessCode(prefix: string = 'CK'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = prefix
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  return code
}

export async function createCourseUser(
  name: string,
  role: 'admin' | 'teacher' | 'student',
  courseId: string,
  courseName: string,
  levelId: string,
  email?: string,
  expiresAt?: string,
  programId?: string,
  programName?: string,
  schoolId?: string,
  schoolName?: string
): Promise<{ success: boolean; user?: CourseUser; error?: string }> {
  try {
    const prefix = role === 'admin' ? 'AD' : role === 'teacher' ? 'PR' : 'ES'
    const accessCode = generateAccessCode(prefix)

    const insert: Record<string, any> = {
      access_code: accessCode,
      name,
      role,
      level_id: levelId || null,
      is_active: true,
      password: accessCode, // por defecto = accessCode
    }

    if (email && email.trim()) insert.email = email.trim()
    if (courseId && courseId !== 'Sin asignar') insert.course_id = courseId
    if (courseName && courseName !== 'Sin asignar') insert.course_name = courseName
    if (schoolId) insert.school_id = schoolId
    if (schoolName) insert.school_name = schoolName
    if (programId) insert.program_id = programId
    if (programName) insert.program_name = programName
    if (expiresAt) insert.expires_at = expiresAt

    const { data, error } = await supabaseAdmin.from('users').insert(insert).select().single()

    if (error) return { success: false, error: error.message }

    return { success: true, user: rowToUser(data) }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Error al crear usuario: ${msg}` }
  }
}

export async function createBulkUsers(
  courseId: string,
  courseName: string,
  levelId: string,
  count: number,
  namePrefix: string = 'Estudiante',
  expiresAt?: string
): Promise<{ success: boolean; users?: CourseUser[]; error?: string }> {
  try {
    const users: CourseUser[] = []
    for (let i = 1; i <= count; i++) {
      const r = await createCourseUser(
        `${namePrefix} ${i}`, 'student', courseId, courseName, levelId, undefined, expiresAt
      )
      if (r.success && r.user) users.push(r.user)
    }
    return { success: true, users }
  } catch (error) {
    return { success: false, error: 'Error al crear usuarios en lote' }
  }
}

export async function getAllUsers(): Promise<CourseUser[]> {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false })
    if (error || !data) return []
    return data.map(rowToUser)
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

export async function getCourseUsers(courseId: string): Promise<CourseUser[]> {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('course_id', courseId)
    if (error || !data) return []
    return data.map(rowToUser)
  } catch (error) {
    return []
  }
}

export async function updateUser(
  userId: string,
  data: {
    name?: string
    email?: string
    levelId?: string
    role?: 'admin' | 'teacher' | 'student'
    courseId?: string
    courseName?: string
    schoolId?: string
    schoolName?: string
    programId?: string
    programName?: string
    expiresAt?: string
    isActive?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const fields: Record<string, any> = {}
    if (data.name !== undefined && data.name.trim()) fields.name = data.name
    if (data.email !== undefined && data.email.trim()) fields.email = data.email
    if (data.levelId !== undefined && data.levelId.trim()) fields.level_id = data.levelId
    if (data.role !== undefined && data.role.trim()) fields.role = data.role
    if (data.courseId !== undefined && data.courseId.trim() && data.courseId !== 'Sin asignar') fields.course_id = data.courseId
    if (data.courseName !== undefined && data.courseName.trim() && data.courseName !== 'Sin asignar') fields.course_name = data.courseName
    if (data.schoolId !== undefined && data.schoolId.trim()) fields.school_id = data.schoolId
    if (data.schoolName !== undefined && data.schoolName.trim()) fields.school_name = data.schoolName
    if (data.programId !== undefined && data.programId.trim()) fields.program_id = data.programId
    if (data.programName !== undefined && data.programName.trim()) fields.program_name = data.programName
    if (data.expiresAt !== undefined && data.expiresAt.trim()) fields.expires_at = data.expiresAt
    if (data.isActive !== undefined) fields.is_active = data.isActive

    const { error } = await supabaseAdmin.from('users').update(fields).eq('id', userId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al actualizar usuario' }
  }
}

export async function deactivateUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('users').update({ is_active: false }).eq('id', userId)
    return !error
  } catch {
    return false
  }
}

export async function regenerateAccessCode(userId: string): Promise<{
  success: boolean
  newCode?: string
  error?: string
}> {
  try {
    const newCode = generateAccessCode()
    const { error } = await supabaseAdmin.from('users').update({ access_code: newCode, password: newCode }).eq('id', userId)
    if (error) return { success: false, error: error.message }
    return { success: true, newCode }
  } catch (error) {
    return { success: false, error: 'Error al regenerar código' }
  }
}

// ============================================
// CURSOS
// ============================================

export async function createCourse(
  name: string,
  levelId: string,
  teacherId: string,
  teacherName: string,
  description?: string,
  maxStudents: number = 30,
  schoolId?: string,
  schoolName?: string
): Promise<{ success: boolean; course?: Course; error?: string }> {
  try {
    const courseId = `curso-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const insert: Record<string, any> = {
      id: courseId,
      name,
      level_id: levelId,
      max_students: maxStudents,
      current_students: 0,
      is_active: true,
    }
    if (description?.trim()) insert.description = description
    if (teacherId?.trim()) insert.teacher_id = teacherId
    if (teacherName?.trim()) insert.teacher_name = teacherName
    if (schoolId?.trim()) insert.school_id = schoolId
    if (schoolName?.trim()) insert.school_name = schoolName

    const { data, error } = await supabaseAdmin.from('courses_catalog').insert(insert).select().single()
    if (error) return { success: false, error: error.message }
    return { success: true, course: rowToCourse(data) }
  } catch (error) {
    return { success: false, error: 'Error al crear curso' }
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabaseAdmin.from('courses_catalog').select('*').order('name')
    if (error || !data) return []
    return data.map(rowToCourse)
  } catch {
    return []
  }
}

export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  try {
    const { data, error } = await supabaseAdmin.from('courses_catalog').select('*').eq('teacher_id', teacherId)
    if (error || !data) return []
    return data.map(rowToCourse)
  } catch {
    return []
  }
}

export async function updateCourse(
  courseId: string,
  data: {
    name?: string
    description?: string
    levelId?: string
    teacherId?: string
    teacherName?: string
    schoolId?: string
    schoolName?: string
    maxStudents?: number
    isActive?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const fields: Record<string, any> = {}
    if (data.name !== undefined) fields.name = data.name
    if (data.description !== undefined) fields.description = data.description
    if (data.levelId !== undefined) fields.level_id = data.levelId
    if (data.teacherId !== undefined) fields.teacher_id = data.teacherId
    if (data.teacherName !== undefined) fields.teacher_name = data.teacherName
    if (data.schoolId !== undefined) fields.school_id = data.schoolId
    if (data.schoolName !== undefined) fields.school_name = data.schoolName
    if (data.maxStudents !== undefined) fields.max_students = data.maxStudents
    if (data.isActive !== undefined) fields.is_active = data.isActive

    const { error } = await supabaseAdmin.from('courses_catalog').update(fields).eq('id', courseId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: 'Error al actualizar curso' }
  }
}

export async function deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from('courses_catalog').delete().eq('id', courseId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar curso' }
  }
}
