'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  accessCode?: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'teacher' | 'student'
  levelId?: string
  courseId?: string
  schoolId?: string
  progress: number
  createdAt: string
  lastLogin?: string
  completedLessons?: number
  streak?: number
  programsCompleted?: string[]
}

export interface AccessLog {
  userId: string
  email: string
  name: string
  timestamp: string
  action: 'login' | 'logout' | 'page_view'
  details?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isTeacher: boolean
  accessLogs: AccessLog[]
  addAccessLog: (action: 'login' | 'logout' | 'page_view', details?: string) => void
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Debe coincidir con SESSION_MAX_AGE_SECONDS en src/lib/session.ts (7 días)
const SESSION_CLIENT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])

  // Función para refrescar datos del usuario desde Airtable
  const refreshUserData = async (identifier: { accessCode?: string; email?: string }) => {
    try {
      const body = identifier.accessCode 
        ? { accessCode: identifier.accessCode }
        : { email: identifier.email, password: '' } // Usamos API de refresh
      
      // Usar endpoint de refresh si existe, o login con accessCode
      const endpoint = identifier.accessCode ? '/api/auth/login' : '/api/auth/refresh'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(identifier.accessCode ? { accessCode: identifier.accessCode } : { email: identifier.email })
      })
      const data = await response.json()
      if (data.success && data.user) {
        const refreshedUser: User = {
          id: data.user.id,
          accessCode: data.user.accessCode,
          name: data.user.name,
          email: data.user.email || '',
          role: data.user.role,
          levelId: data.user.levelId,
          courseId: data.user.courseId,
          schoolId: data.user.schoolId,
          progress: 0,
          createdAt: data.user.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
        setUser(refreshedUser)
        localStorage.setItem('chaskibots_user', JSON.stringify(refreshedUser))
        console.log('[Auth] Usuario refrescado desde Airtable:', refreshedUser.name, 'levelId:', refreshedUser.levelId, 'accessCode:', refreshedUser.accessCode)
      }
    } catch (error) {
      console.error('[Auth] Error refrescando usuario:', error)
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('chaskibots_user')
    const savedExp = localStorage.getItem('chaskibots_session_exp')
    const savedLogs = localStorage.getItem('chaskibots_access_logs')

    // La sesión real (cookie httpOnly firmada) la gestiona el servidor.
    // Este `exp` es solo para que el cliente no siga mostrando un usuario
    // "logueado" en la UI (ej. el botón Admin) más allá de la duración de
    // esa cookie server-side — antes localStorage no expiraba nunca, así
    // que en una computadora compartida el siguiente visitante heredaba
    // visualmente la sesión del usuario anterior.
    const isExpired = !savedExp || Number(savedExp) < Date.now()

    if (savedUser && !isExpired) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)

        // Refrescar datos del usuario desde Airtable
        if (parsedUser.accessCode) {
          refreshUserData({ accessCode: parsedUser.accessCode })
        } else if (parsedUser.email) {
          refreshUserData({ email: parsedUser.email })
        }
      } catch {
        localStorage.removeItem('chaskibots_user')
        localStorage.removeItem('chaskibots_session_exp')
      }
    } else if (savedUser) {
      // Había un usuario guardado pero la sesión ya venció
      localStorage.removeItem('chaskibots_user')
      localStorage.removeItem('chaskibots_session_exp')
    }

    if (savedLogs) {
      try {
        setAccessLogs(JSON.parse(savedLogs))
      } catch {
        localStorage.removeItem('chaskibots_access_logs')
      }
    }

    setIsLoading(false)
  }, [])

  const addAccessLog = (action: 'login' | 'logout' | 'page_view', details?: string) => {
    if (!user) return
    
    const newLog: AccessLog = {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
      action,
      details
    }
    
    const updatedLogs = [newLog, ...accessLogs].slice(0, 100) // Mantener últimos 100 logs
    setAccessLogs(updatedLogs)
    localStorage.setItem('chaskibots_access_logs', JSON.stringify(updatedLogs))
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      // Llamar a la API de login que conecta con Airtable
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setIsLoading(false)
        return { success: false, error: data.error || 'Credenciales incorrectas' }
      }
      
      const loggedUser: User = {
        id: data.user.id,
        accessCode: data.user.accessCode,
        name: data.user.name,
        email: data.user.email || email,
        role: data.user.role,
        levelId: data.user.levelId,
        courseId: data.user.courseId,
        schoolId: data.user.schoolId,
        progress: 0,
        createdAt: data.user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
      
      setUser(loggedUser)
      localStorage.setItem('chaskibots_user', JSON.stringify(loggedUser))
      // La cookie de sesión (httpOnly, firmada) ya la puso el servidor en la
      // respuesta de /api/auth/login. Solo guardamos su vencimiento para que
      // el cliente deje de mostrar al usuario "logueado" cuando expire.
      localStorage.setItem('chaskibots_session_exp', String(Date.now() + SESSION_CLIENT_MAX_AGE_MS))

      // Registrar acceso
      const loginLog: AccessLog = {
        userId: loggedUser.id,
        email: loggedUser.email,
        name: loggedUser.name,
        timestamp: new Date().toISOString(),
        action: 'login'
      }
      const updatedLogs = [loginLog, ...accessLogs].slice(0, 100)
      setAccessLogs(updatedLogs)
      localStorage.setItem('chaskibots_access_logs', JSON.stringify(updatedLogs))
      
      setIsLoading(false)
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return { success: false, error: 'Error de conexion' }
    }
  }

  const logout = () => {
    if (user) {
      const logoutLog: AccessLog = {
        userId: user.id,
        email: user.email,
        name: user.name,
        timestamp: new Date().toISOString(),
        action: 'logout'
      }
      const updatedLogs = [logoutLog, ...accessLogs].slice(0, 100)
      setAccessLogs(updatedLogs)
      localStorage.setItem('chaskibots_access_logs', JSON.stringify(updatedLogs))
    }
    
    setUser(null)
    localStorage.removeItem('chaskibots_user')
    localStorage.removeItem('chaskibots_session_exp')
    // Borrar la cookie httpOnly de sesión (el cliente no puede tocarla directamente)
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isTeacher: user?.role === 'teacher' || user?.role === 'admin',
      accessLogs,
      addAccessLog
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
