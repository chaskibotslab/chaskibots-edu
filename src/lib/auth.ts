// ============================================
// SISTEMA DE AUTENTICACIÓN - ChaskiBots EDU
// ============================================

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  levelId?: string
  createdAt: string
  lastLogin?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// En producción, todos los usuarios vienen de Airtable
// Este objeto solo se usa como fallback para desarrollo local
const USERS_DB: Record<string, { password: string; user: User }> = {}

// Cargar usuarios de desarrollo desde variables de entorno (opcional)
if (process.env.DEV_ADMIN_EMAIL && process.env.DEV_ADMIN_PASSWORD) {
  USERS_DB[process.env.DEV_ADMIN_EMAIL] = {
    password: process.env.DEV_ADMIN_PASSWORD,
    user: {
      id: 'dev-admin',
      email: process.env.DEV_ADMIN_EMAIL,
      name: 'Admin Dev',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  }
}

// Función para validar login
export function validateLogin(credentials: LoginCredentials): { success: boolean; user?: User; error?: string } {
  const userRecord = USERS_DB[credentials.email.toLowerCase()]
  
  if (!userRecord) {
    return { success: false, error: 'Usuario no encontrado' }
  }
  
  if (userRecord.password !== credentials.password) {
    return { success: false, error: 'Contraseña incorrecta' }
  }
  
  return { 
    success: true, 
    user: {
      ...userRecord.user,
      lastLogin: new Date().toISOString()
    }
  }
}

// Función para verificar si es admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

// Función para verificar si es profesor o admin
export function isTeacherOrAdmin(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'teacher'
}

// Función para obtener todos los usuarios (solo admin)
export function getAllUsers(): User[] {
  return Object.values(USERS_DB).map(record => record.user)
}

// Función para crear usuario
export function createUser(email: string, password: string, name: string, role: 'admin' | 'teacher' | 'student', levelId?: string): { success: boolean; user?: User; error?: string } {
  if (USERS_DB[email.toLowerCase()]) {
    return { success: false, error: 'El email ya está registrado' }
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    name,
    role,
    levelId,
    createdAt: new Date().toISOString()
  }
  
  USERS_DB[email.toLowerCase()] = {
    password,
    user: newUser
  }
  
  return { success: true, user: newUser }
}

// Función para resetear contraseña
export function resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
  const userRecord = USERS_DB[email.toLowerCase()]
  
  if (!userRecord) {
    return { success: false, error: 'Usuario no encontrado' }
  }
  
  USERS_DB[email.toLowerCase()].password = newPassword
  return { success: true }
}

// Función para registrar acceso (para notificaciones)
export interface AccessLog {
  userId: string
  email: string
  name: string
  timestamp: string
  action: 'login' | 'logout' | 'page_view'
  details?: string
}

const ACCESS_LOGS: AccessLog[] = []

export function logAccess(user: User, action: 'login' | 'logout' | 'page_view', details?: string): void {
  ACCESS_LOGS.push({
    userId: user.id,
    email: user.email,
    name: user.name,
    timestamp: new Date().toISOString(),
    action,
    details
  })
}

export function getAccessLogs(): AccessLog[] {
  return [...ACCESS_LOGS].reverse() // Más recientes primero
}
