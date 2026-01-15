// ============================================
// AUTENTICACIÓN CON AIRTABLE - ChaskiBots EDU
// Sistema de claves personalizadas por curso
// ============================================

import Airtable from 'airtable'

// Configuración de Airtable - Lazy initialization para evitar errores durante build
let _base: ReturnType<typeof Airtable.prototype.base> | null = null

function getBase(): ReturnType<typeof Airtable.prototype.base> {
  if (!_base) {
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY environment variable is not set')
    }
    _base = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY 
    }).base(process.env.AIRTABLE_BASE_ID || '')
  }
  return _base
}


// Interfaces
export interface CourseUser {
  id: string
  accessCode: string      // Clave de acceso única
  name: string
  email?: string
  role: 'admin' | 'teacher' | 'student'
  courseId: string        // ID del curso/clase
  courseName: string      // Nombre del curso/clase
  programId: string       // ID del programa (ej: prog-inicial2-robotica)
  programName: string     // Nombre del programa (ej: Robótica Básica)
  levelId: string         // Nivel educativo
  isActive: boolean
  createdAt: string
  lastLogin?: string
  expiresAt?: string      // Fecha de expiración (opcional)
}

export interface Course {
  id: string
  name: string
  description?: string
  levelId: string
  teacherId: string
  teacherName: string
  accessCodes: string[]   // Lista de códigos de acceso del curso
  maxStudents: number
  currentStudents: number
  isActive: boolean
  createdAt: string
}

// Tabla de usuarios en Airtable
const USERS_TABLE = 'users'
const COURSES_TABLE = 'courses_catalog'

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

// Validar login con código de acceso
export async function validateAccessCode(accessCode: string): Promise<{
  success: boolean
  user?: CourseUser
  error?: string
}> {
  try {
    const records = await getBase()(USERS_TABLE)
      .select({
        filterByFormula: `AND({accessCode} = '${accessCode}', {isActive} = TRUE())`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length === 0) {
      return { success: false, error: 'Código de acceso inválido' }
    }

    const record = records[0]
    const fields = record.fields

    // Verificar si el código ha expirado
    if (fields.expiresAt) {
      const expirationDate = new Date(fields.expiresAt as string)
      if (expirationDate < new Date()) {
        return { success: false, error: 'El código de acceso ha expirado' }
      }
    }

    // Actualizar último login
    await getBase()(USERS_TABLE).update(record.id, {
      lastLogin: new Date().toISOString()
    })

    const user: CourseUser = {
      id: record.id,
      accessCode: fields.accessCode as string,
      name: fields.name as string,
      email: fields.email as string | undefined,
      role: fields.role as 'admin' | 'teacher' | 'student',
      courseId: fields.courseId as string,
      courseName: fields.courseName as string,
      programId: fields.programId as string || '',
      programName: fields.programName as string || '',
      levelId: fields.levelId as string,
      isActive: fields.isActive as boolean,
      createdAt: fields.createdAt as string,
      lastLogin: new Date().toISOString(),
      expiresAt: fields.expiresAt as string | undefined
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error validating access code:', error)
    return { success: false, error: 'Error de conexión con la base de datos' }
  }
}

// Validar login con email y password
export async function validateEmailPassword(email: string, password: string): Promise<{
  success: boolean
  user?: CourseUser
  error?: string
}> {
  try {
    // Buscar usuario solo por email (sin filtro isActive para evitar problemas)
    const records = await getBase()(USERS_TABLE)
      .select({
        filterByFormula: `{email} = '${email}'`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length === 0) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    const record = records[0]
    const fields = record.fields

    // Verificar password
    if (fields.password !== password) {
      return { success: false, error: 'Contrasena incorrecta' }
    }

    // Actualizar ultimo login (ignorar errores si falla)
    try {
      await getBase()(USERS_TABLE).update(record.id, {
        lastLogin: new Date().toISOString()
      })
    } catch {
      // Ignorar error de actualización
    }

    const user: CourseUser = {
      id: record.id,
      accessCode: (fields.accessCode as string) || '',
      name: (fields.name as string) || 'Usuario',
      email: fields.email as string | undefined,
      role: (fields.role as 'admin' | 'teacher' | 'student') || 'student',
      courseId: (fields.courseId as string) || '',
      courseName: (fields.courseName as string) || '',
      programId: (fields.programId as string) || '',
      programName: (fields.programName as string) || '',
      levelId: (fields.levelId as string) || '',
      isActive: true,
      createdAt: (fields.createdAt as string) || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      expiresAt: fields.expiresAt as string | undefined
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error validating email/password:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Error: ${errorMsg}` }
  }
}

// ============================================
// FUNCIONES DE ADMINISTRACIÓN DE USUARIOS
// ============================================

// Generar código de acceso único
function generateAccessCode(prefix: string = 'CK'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin caracteres confusos (0,O,1,I)
  let code = prefix
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Crear usuario con código de acceso
export async function createCourseUser(
  name: string,
  role: 'teacher' | 'student',
  courseId: string,
  courseName: string,
  levelId: string,
  email?: string,
  expiresAt?: string
): Promise<{ success: boolean; user?: CourseUser; error?: string }> {
  try {
    const accessCode = generateAccessCode(role === 'teacher' ? 'PR' : 'ES')

    const record = await getBase()(USERS_TABLE).create({
      accessCode,
      name,
      email: email || '',
      role,
      courseId,
      courseName,
      levelId,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || ''
    })

    const user: CourseUser = {
      id: record.id,
      accessCode,
      name,
      email,
      role,
      courseId,
      courseName,
      programId: '',
      programName: '',
      levelId,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Error al crear usuario' }
  }
}

// Crear múltiples usuarios para un curso
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
      const result = await createCourseUser(
        `${namePrefix} ${i}`,
        'student',
        courseId,
        courseName,
        levelId,
        undefined,
        expiresAt
      )
      if (result.success && result.user) {
        users.push(result.user)
      }
    }

    return { success: true, users }
  } catch (error) {
    console.error('Error creating bulk users:', error)
    return { success: false, error: 'Error al crear usuarios en lote' }
  }
}

// Obtener TODOS los usuarios
export async function getAllUsers(): Promise<CourseUser[]> {
  try {
    const records = await getBase()(USERS_TABLE)
      .select({})
      .all()

    return records.map(record => ({
      id: record.id,
      accessCode: record.fields.accessCode as string,
      name: record.fields.name as string,
      email: record.fields.email as string | undefined,
      role: record.fields.role as 'admin' | 'teacher' | 'student',
      courseId: record.fields.courseId as string || '',
      courseName: record.fields.courseName as string || '',
      programId: record.fields.programId as string || '',
      programName: record.fields.programName as string || '',
      levelId: record.fields.levelId as string,
      isActive: record.fields.isActive as boolean,
      createdAt: record.fields.createdAt as string,
      lastLogin: record.fields.lastLogin as string | undefined,
      expiresAt: record.fields.expiresAt as string | undefined
    }))
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

// Obtener usuarios de un curso
export async function getCourseUsers(courseId: string): Promise<CourseUser[]> {
  try {
    const records = await getBase()(USERS_TABLE)
      .select({
        filterByFormula: `{courseId} = '${courseId}'`
      })
      .all()

    return records.map(record => ({
      id: record.id,
      accessCode: record.fields.accessCode as string,
      name: record.fields.name as string,
      email: record.fields.email as string | undefined,
      role: record.fields.role as 'admin' | 'teacher' | 'student',
      courseId: record.fields.courseId as string || '',
      courseName: record.fields.courseName as string || '',
      programId: record.fields.programId as string || '',
      programName: record.fields.programName as string || '',
      levelId: record.fields.levelId as string,
      isActive: record.fields.isActive as boolean,
      createdAt: record.fields.createdAt as string,
      lastLogin: record.fields.lastLogin as string | undefined,
      expiresAt: record.fields.expiresAt as string | undefined
    }))
  } catch (error) {
    console.error('Error getting course users:', error)
    return []
  }
}

// Desactivar usuario
export async function deactivateUser(userId: string): Promise<boolean> {
  try {
    await getBase()(USERS_TABLE).update(userId, { isActive: false })
    return true
  } catch (error) {
    console.error('Error deactivating user:', error)
    return false
  }
}

// Regenerar código de acceso
export async function regenerateAccessCode(userId: string): Promise<{
  success: boolean
  newCode?: string
  error?: string
}> {
  try {
    const newCode = generateAccessCode()
    await getBase()(USERS_TABLE).update(userId, { accessCode: newCode })
    return { success: true, newCode }
  } catch (error) {
    console.error('Error regenerating access code:', error)
    return { success: false, error: 'Error al regenerar código' }
  }
}

// ============================================
// FUNCIONES DE ADMINISTRACIÓN DE CURSOS
// ============================================

// Crear curso
export async function createCourse(
  name: string,
  levelId: string,
  teacherId: string,
  teacherName: string,
  description?: string,
  maxStudents: number = 30
): Promise<{ success: boolean; course?: Course; error?: string }> {
  try {
    const record = await getBase()(COURSES_TABLE).create({
      name,
      description: description || '',
      levelId,
      teacherId,
      teacherName,
      maxStudents,
      currentStudents: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    })

    const course: Course = {
      id: record.id,
      name,
      description,
      levelId,
      teacherId,
      teacherName,
      accessCodes: [],
      maxStudents,
      currentStudents: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    return { success: true, course }
  } catch (error) {
    console.error('Error creating course:', error)
    return { success: false, error: 'Error al crear curso' }
  }
}

// Obtener todos los cursos
export async function getAllCourses(): Promise<Course[]> {
  try {
    const records = await getBase()(COURSES_TABLE)
      .select({
        filterByFormula: `{isActive} = TRUE()`
      })
      .all()

    return records.map(record => ({
      id: record.id,
      name: record.fields.name as string,
      description: record.fields.description as string | undefined,
      levelId: record.fields.levelId as string,
      teacherId: record.fields.teacherId as string,
      teacherName: record.fields.teacherName as string,
      accessCodes: [],
      maxStudents: record.fields.maxStudents as number,
      currentStudents: record.fields.currentStudents as number,
      isActive: record.fields.isActive as boolean,
      createdAt: record.fields.createdAt as string
    }))
  } catch (error) {
    console.error('Error getting courses:', error)
    return []
  }
}

// Obtener cursos de un profesor
export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  try {
    const records = await getBase()(COURSES_TABLE)
      .select({
        filterByFormula: `AND({teacherId} = '${teacherId}', {isActive} = TRUE())`
      })
      .all()

    return records.map(record => ({
      id: record.id,
      name: record.fields.name as string,
      description: record.fields.description as string | undefined,
      levelId: record.fields.levelId as string,
      teacherId: record.fields.teacherId as string,
      teacherName: record.fields.teacherName as string,
      accessCodes: [],
      maxStudents: record.fields.maxStudents as number,
      currentStudents: record.fields.currentStudents as number,
      isActive: record.fields.isActive as boolean,
      createdAt: record.fields.createdAt as string
    }))
  } catch (error) {
    console.error('Error getting teacher courses:', error)
    return []
  }
}
