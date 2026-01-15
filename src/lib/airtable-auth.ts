// ============================================
// AUTENTICACIÓN CON AIRTABLE - ChaskiBots EDU
// Sistema de claves personalizadas por curso
// Versión: 2.0 - REST API
// ============================================

// Usar API REST directa en lugar de librería airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`

interface AirtableRecord {
  id: string
  fields: Record<string, unknown>
  createdTime: string
}

interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

async function fetchTable(tableName: string, filterFormula?: string): Promise<AirtableRecord[]> {
  const url = new URL(`${AIRTABLE_API_URL}/${tableName}`)
  if (filterFormula) {
    url.searchParams.append('filterByFormula', filterFormula)
    url.searchParams.append('maxRecords', '1')
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Airtable API error: ${response.status} - ${errorText}`)
  }
  
  const data: AirtableResponse = await response.json()
  return data.records
}

async function updateRecord(tableName: string, recordId: string, fields: Record<string, unknown>): Promise<void> {
  const url = `${AIRTABLE_API_URL}/${tableName}/${recordId}`
  
  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
}

async function createRecord(tableName: string, fields: Record<string, unknown>): Promise<AirtableRecord> {
  const url = `${AIRTABLE_API_URL}/${tableName}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Airtable create error: ${response.status} - ${errorText}`)
  }
  
  return await response.json()
}

async function deleteRecord(tableName: string, recordId: string): Promise<void> {
  const url = `${AIRTABLE_API_URL}/${tableName}/${recordId}`
  
  await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    },
  })
}

async function fetchAllRecords(tableName: string): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = []
  let offset: string | undefined
  
  do {
    const url = new URL(`${AIRTABLE_API_URL}/${tableName}`)
    if (offset) {
      url.searchParams.append('offset', offset)
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }
    
    const data: AirtableResponse = await response.json()
    allRecords.push(...data.records)
    offset = data.offset
  } while (offset)
  
  return allRecords
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
    const records = await fetchTable(USERS_TABLE, `{accessCode} = '${accessCode}'`)

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
    try {
      await updateRecord(USERS_TABLE, record.id, { lastLogin: new Date().toISOString() })
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
    console.error('Error validating access code:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Error: ${errorMsg}` }
  }
}

// Validar login con email y password
export async function validateEmailPassword(email: string, password: string): Promise<{
  success: boolean
  user?: CourseUser
  error?: string
}> {
  try {
    // Buscar usuario solo por email
    const records = await fetchTable(USERS_TABLE, `{email} = '${email}'`)

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
      await updateRecord(USERS_TABLE, record.id, { lastLogin: new Date().toISOString() })
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

    const record = await createRecord(USERS_TABLE, {
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
    const records = await fetchAllRecords(USERS_TABLE)

    return records.map((record: AirtableRecord) => ({
      id: record.id,
      accessCode: (record.fields.accessCode as string) || '',
      name: (record.fields.name as string) || '',
      email: record.fields.email as string | undefined,
      role: (record.fields.role as 'admin' | 'teacher' | 'student') || 'student',
      courseId: (record.fields.courseId as string) || '',
      courseName: (record.fields.courseName as string) || '',
      programId: (record.fields.programId as string) || '',
      programName: (record.fields.programName as string) || '',
      levelId: (record.fields.levelId as string) || '',
      isActive: Boolean(record.fields.isActive),
      createdAt: (record.fields.createdAt as string) || '',
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
    const records = await fetchTable(USERS_TABLE, `{courseId} = '${courseId}'`)

    return records.map((record: AirtableRecord) => ({
      id: record.id,
      accessCode: (record.fields.accessCode as string) || '',
      name: (record.fields.name as string) || '',
      email: record.fields.email as string | undefined,
      role: (record.fields.role as 'admin' | 'teacher' | 'student') || 'student',
      courseId: (record.fields.courseId as string) || '',
      courseName: (record.fields.courseName as string) || '',
      programId: (record.fields.programId as string) || '',
      programName: (record.fields.programName as string) || '',
      levelId: (record.fields.levelId as string) || '',
      isActive: Boolean(record.fields.isActive),
      createdAt: (record.fields.createdAt as string) || '',
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
    await updateRecord(USERS_TABLE, userId, { isActive: false })
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
    await updateRecord(USERS_TABLE, userId, { accessCode: newCode })
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
    const record = await createRecord(COURSES_TABLE, {
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
    const records = await fetchAllRecords(COURSES_TABLE)

    return records.map((record: AirtableRecord) => ({
      id: record.id,
      name: (record.fields.name as string) || '',
      description: record.fields.description as string | undefined,
      levelId: (record.fields.levelId as string) || '',
      teacherId: (record.fields.teacherId as string) || '',
      teacherName: (record.fields.teacherName as string) || '',
      accessCodes: [],
      maxStudents: (record.fields.maxStudents as number) || 30,
      currentStudents: (record.fields.currentStudents as number) || 0,
      isActive: Boolean(record.fields.isActive),
      createdAt: (record.fields.createdAt as string) || ''
    }))
  } catch (error) {
    console.error('Error getting courses:', error)
    return []
  }
}

// Obtener cursos de un profesor
export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  try {
    const records = await fetchTable(COURSES_TABLE, `{teacherId} = '${teacherId}'`)

    return records.map((record: AirtableRecord) => ({
      id: record.id,
      name: (record.fields.name as string) || '',
      description: record.fields.description as string | undefined,
      levelId: (record.fields.levelId as string) || '',
      teacherId: (record.fields.teacherId as string) || '',
      teacherName: (record.fields.teacherName as string) || '',
      accessCodes: [],
      maxStudents: (record.fields.maxStudents as number) || 30,
      currentStudents: (record.fields.currentStudents as number) || 0,
      isActive: Boolean(record.fields.isActive),
      createdAt: (record.fields.createdAt as string) || ''
    }))
  } catch (error) {
    console.error('Error getting teacher courses:', error)
    return []
  }
}
