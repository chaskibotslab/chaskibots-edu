'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, validateLogin, logAccess, LoginCredentials } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('chaskibots_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('chaskibots_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    const result = validateLogin(credentials)
    
    if (result.success && result.user) {
      setUser(result.user)
      localStorage.setItem('chaskibots_user', JSON.stringify(result.user))
      logAccess(result.user, 'login')
      setIsLoading(false)
      return { success: true }
    }
    
    setIsLoading(false)
    return { success: false, error: result.error }
  }

  const logout = () => {
    if (user) {
      logAccess(user, 'logout')
    }
    setUser(null)
    localStorage.removeItem('chaskibots_user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
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
