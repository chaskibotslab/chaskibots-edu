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

function normalizeRole(input: unknown): 'admin' | 'teacher' | 'student' {
  const raw = String(input ?? '').trim().toLowerCase()

  if (!raw) return 'student'

  // Admin variants
  if (raw === 'admin' || raw === 'administrator' || raw === 'administrador') return 'admin'
  if (raw.includes('admin')) return 'admin'
  if (raw.includes('administr')) return 'admin'

  // Teacher variants
  if (raw === 'teacher' || raw === 'profesor' || raw === 'professora' || raw === 'prof') return 'teacher'
  if (raw.includes('teacher')) return 'teacher'
  if (raw.includes('prof')) return 'teacher'
  if (raw.includes('docente')) return 'teacher'

  // Student variants
  if (raw === 'student' || raw === 'estudiante' || raw === 'alumno' || raw === 'alumna') return 'student'

  return 'student'
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
    // Mensaje amigable para límite de API
    if (response.status === 429) {
      if (errorText.includes('PUBLIC_API_BILLING_LIMIT_EXCEEDED')) {
        throw new Error('⚠️ Se ha alcanzado el límite mensual de solicitudes. Por favor, espera a que se reinicie o contacta al administrador.')
      }
      throw new Error('⏳ Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.')
    }
    throw new Error(`Error de conexión: ${response.status}`)
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
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Airtable API error for ${tableName}:`, response.status, errorText)
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`)
    }
    
    const data: AirtableResponse = await response.json()
    allRecords.push(...data.records)
    offset = data.offset
  } while (offset)
  
  console.log(`[Airtable] Fetched ${allRecords.length} records from ${tableName}`)
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
  schoolId: string        // ID del colegio/institución
  schoolName: string      // Nombre del colegio
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
  schoolId?: string       // ID del colegio/institución
  schoolName?: string     // Nombre del colegio
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
      role: normalizeRole(fields.role),
      courseId: (fields.courseId as string) || '',
      courseName: (fields.courseName as string) || '',
      schoolId: (fields.schoolId as string) || '',
      schoolName: (fields.schoolName as string) || '',
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
    // Buscar usuario solo por email en Airtable
    const records = await fetchTable(USERS_TABLE, `{email} = '${email}'`)

    if (records.length === 0) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    const record = records[0]
    const fields = record.fields

    // Verificar password - puede ser el campo password o el accessCode
    const storedPassword = fields.password || fields.accessCode
    if (storedPassword !== password) {
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
      role: normalizeRole(fields.role),
      courseId: (fields.courseId as string) || '',
      courseName: (fields.courseName as string) || '',
      schoolId: (fields.schoolId as string) || '',
      schoolName: (fields.schoolName as string) || '',
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

    // Formato de fecha para Airtable (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]
    
    // Construir objeto de datos - solo incluir campos con valores válidos
    const recordData: Record<string, unknown> = {
      accessCode,
      name,
      role,
      levelId,
      isActive: true,
      createdAt: today
    }
    
    // Solo agregar campos opcionales si tienen valor válido (no vacío)
    if (email && email.trim() !== '') {
      recordData.email = email
    }
    if (courseId && courseId.trim() !== '' && courseId !== 'Sin asignar') {
      recordData.courseId = courseId
    }
    if (courseName && courseName.trim() !== '' && courseName !== 'Sin asignar') {
      recordData.courseName = courseName
    }
    if (schoolId && schoolId.trim() !== '') {
      recordData.schoolId = schoolId
    }
    if (schoolName && schoolName.trim() !== '') {
      recordData.schoolName = schoolName
    }
    if (programId && programId.trim() !== '') {
      recordData.programId = programId
    }
    if (programName && programName.trim() !== '') {
      recordData.programName = programName
    }
    if (expiresAt && expiresAt.trim() !== '') {
      recordData.expiresAt = expiresAt
    }
    
    const record = await createRecord(USERS_TABLE, recordData)

    const user: CourseUser = {
      id: record.id,
      accessCode,
      name,
      email,
      role,
      courseId,
      courseName,
      schoolId: schoolId || '',
      schoolName: schoolName || '',
      programId: programId || '',
      programName: programName || '',
      levelId,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Error al crear usuario: ${errorMsg}` }
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
    console.log('[Airtable] Fetching all users from table:', USERS_TABLE)
    const records = await fetchAllRecords(USERS_TABLE)
    console.log('[Airtable] Got', records.length, 'user records')

    return records.map((record: AirtableRecord) => ({
      id: record.id,
      accessCode: (record.fields.accessCode as string) || '',
      name: (record.fields.name as string) || '',
      email: record.fields.email as string | undefined,
      role: normalizeRole(record.fields.role),
      courseId: (record.fields.courseId as string) || '',
      courseName: (record.fields.courseName as string) || '',
      schoolId: (record.fields.schoolId as string) || '',
      schoolName: (record.fields.schoolName as string) || '',
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
      role: normalizeRole(record.fields.role),
      courseId: (record.fields.courseId as string) || '',
      courseName: (record.fields.courseName as string) || '',
      schoolId: (record.fields.schoolId as string) || '',
      schoolName: (record.fields.schoolName as string) || '',
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

// Actualizar usuario
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
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined && data.name.trim() !== '') updateData.name = data.name
    if (data.email !== undefined && data.email.trim() !== '') updateData.email = data.email
    if (data.levelId !== undefined && data.levelId.trim() !== '') updateData.levelId = data.levelId
    if (data.role !== undefined && data.role.trim() !== '') updateData.role = data.role
    // Solo actualizar courseId si tiene un valor válido (no vacío ni "Sin asignar")
    if (data.courseId !== undefined && data.courseId.trim() !== '' && data.courseId !== 'Sin asignar') {
      updateData.courseId = data.courseId
    }
    if (data.courseName !== undefined && data.courseName.trim() !== '' && data.courseName !== 'Sin asignar') {
      updateData.courseName = data.courseName
    }
    if (data.schoolId !== undefined && data.schoolId.trim() !== '') {
      updateData.schoolId = data.schoolId
    }
    if (data.schoolName !== undefined && data.schoolName.trim() !== '') {
      updateData.schoolName = data.schoolName
    }
    if (data.programId !== undefined && data.programId.trim() !== '') updateData.programId = data.programId
    if (data.programName !== undefined && data.programName.trim() !== '') updateData.programName = data.programName
    if (data.expiresAt !== undefined && data.expiresAt.trim() !== '') updateData.expiresAt = data.expiresAt
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    await updateRecord(USERS_TABLE, userId, updateData)
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Error al actualizar usuario' }
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
  maxStudents: number = 30,
  schoolId?: string,
  schoolName?: string
): Promise<{ success: boolean; course?: Course; error?: string }> {
  try {
    // Nota: courses_catalog NO tiene campo teacherId, solo teacherName
    // Solo enviar campos con valores para evitar error INVALID_MULTIPLE_CHOICE_OPTIONS
    const courseId = `curso-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const fields: Record<string, unknown> = {
      id: courseId,
      name,
      levelId,
      maxStudents,
      currentStudents: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    // Solo agregar campos opcionales si tienen valor
    if (description && description.trim() !== '') fields.description = description
    if (teacherName && teacherName.trim() !== '') fields.teacherName = teacherName
    if (schoolId && schoolId.trim() !== '') fields.schoolId = schoolId
    if (schoolName && schoolName.trim() !== '') fields.schoolName = schoolName
    
    const record = await createRecord(COURSES_TABLE, fields)

    const course: Course = {
      id: record.id,
      name,
      description,
      levelId,
      teacherId,
      teacherName,
      schoolId,
      schoolName,
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
      schoolId: (record.fields.schoolId as string) || '',
      schoolName: (record.fields.schoolName as string) || '',
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
      schoolId: (record.fields.schoolId as string) || '',
      schoolName: (record.fields.schoolName as string) || '',
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

// Actualizar curso
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
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.levelId !== undefined) updateData.levelId = data.levelId
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId
    if (data.teacherName !== undefined) updateData.teacherName = data.teacherName
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId
    if (data.schoolName !== undefined) updateData.schoolName = data.schoolName
    if (data.maxStudents !== undefined) updateData.maxStudents = data.maxStudents
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    await updateRecord(COURSES_TABLE, courseId, updateData)
    return { success: true }
  } catch (error) {
    console.error('Error updating course:', error)
    return { success: false, error: 'Error al actualizar curso' }
  }
}

// Eliminar curso
export async function deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteRecord(COURSES_TABLE, courseId)
    return { success: true }
  } catch (error) {
    console.error('Error deleting course:', error)
    return { success: false, error: 'Error al eliminar curso' }
  }
}
