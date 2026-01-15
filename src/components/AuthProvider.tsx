'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'teacher' | 'student'
  levelId?: string
  progress: number
  createdAt: string
  lastLogin?: string
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

// Base de datos de usuarios (en producción vendrá de Airtable)
const USERS_DB: Record<string, { password: string; user: User }> = {
  'admin@chaskibots.com': {
    password: 'admin2024',
    user: {
      id: 'admin-1',
      email: 'admin@chaskibots.com',
      name: 'Administrador',
      role: 'admin',
      progress: 100,
      createdAt: '2024-01-01'
    }
  },
  'profesor@chaskibots.com': {
    password: 'profe123',
    user: {
      id: 'teacher-1',
      email: 'profesor@chaskibots.com',
      name: 'Profesor Demo',
      role: 'teacher',
      levelId: 'inicial-1',
      progress: 50,
      createdAt: '2024-01-01'
    }
  },
  'estudiante@chaskibots.com': {
    password: 'estudiante123',
    user: {
      id: 'student-1',
      email: 'estudiante@chaskibots.com',
      name: 'Estudiante Demo',
      role: 'student',
      levelId: 'inicial-1',
      progress: 25,
      createdAt: '2024-01-01'
    }
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem('chaskibots_user')
    const savedLogs = localStorage.getItem('chaskibots_access_logs')
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('chaskibots_user')
      }
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
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const userRecord = USERS_DB[email.toLowerCase()]
    
    if (!userRecord) {
      setIsLoading(false)
      return { success: false, error: 'Usuario no encontrado' }
    }
    
    if (userRecord.password !== password) {
      setIsLoading(false)
      return { success: false, error: 'Contraseña incorrecta' }
    }
    
    const loggedUser = {
      ...userRecord.user,
      lastLogin: new Date().toISOString()
    }
    
    setUser(loggedUser)
    localStorage.setItem('chaskibots_user', JSON.stringify(loggedUser))
    
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
