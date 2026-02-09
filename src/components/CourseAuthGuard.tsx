'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface CourseAuthGuardProps {
  levelId: string
  levelName: string
  children: React.ReactNode
}

export default function CourseAuthGuard({ levelId, levelName, children }: CourseAuthGuardProps) {
  const { isAuthenticated, user } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Verificar si ya está autenticado para este curso
  useEffect(() => {
    async function checkAccess() {
      setIsCheckingAccess(true)
      
      if (!isAuthenticated || !user) {
        setIsCheckingAccess(false)
        return
      }

      // Admin siempre tiene acceso a todos los cursos
      if (user.role === 'admin') {
        setIsAuthorized(true)
        setIsCheckingAccess(false)
        return
      }

      // Teacher: verificar acceso
      if (user.role === 'teacher') {
        // Primero verificar si el levelId del usuario coincide
        if (user.levelId === levelId) {
          setIsAuthorized(true)
          setIsCheckingAccess(false)
          return
        }
        
        // Solo buscar asignaciones si tiene accessCode
        if (user.accessCode) {
          try {
            const res = await fetch(`/api/teacher-courses?teacherId=${user.accessCode}`)
            const data = await res.json()
            
            if (data.assignments && data.assignments.length > 0) {
              const hasAccess = data.assignments.some((a: any) => a.levelId === levelId)
              if (hasAccess) {
                setIsAuthorized(true)
                setIsCheckingAccess(false)
                return
              }
            }
          } catch (error) {
            console.error('Error checking teacher access:', error)
          }
        }
        
        setIsCheckingAccess(false)
        return
      }
      
      // Estudiante: verificar si su levelId coincide con el curso
      const userLevel = user.levelId || ''
      if (userLevel === levelId) {
        setIsAuthorized(true)
        setIsCheckingAccess(false)
        return
      }
      
      // También verificar si ya tiene acceso guardado en sesión
      const courseAccess = sessionStorage.getItem(`course_access_${levelId}`)
      if (courseAccess === 'granted') {
        setIsAuthorized(true)
      }
      
      setIsCheckingAccess(false)
    }
    
    checkAccess()
  }, [isAuthenticated, user, levelId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Verificar contraseña con la API
      const response = await fetch('/api/auth/course-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelId, password })
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem(`course_access_${levelId}`, 'granted')
        setIsAuthorized(true)
      } else {
        setError(data.error || 'Contraseña incorrecta')
      }
    } catch {
      setError('Error al verificar acceso. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras se verifica acceso
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chaski-dark via-blue-900 to-indigo-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si ya está autorizado, mostrar el contenido
  if (isAuthorized) {
    return <>{children}</>
  }

  // Si no está logueado, redirigir al login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chaski-dark via-blue-900 to-indigo-900 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Image 
            src="/chaski.png" 
            alt="ChaskiBots Logo" 
            width={80} 
            height={80}
            className="mx-auto mb-6 rounded-2xl"
          />
          <h2 className="text-2xl font-bold text-chaski-dark mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para acceder a este curso.
          </p>
          <a 
            href={`/login?redirect=/nivel/${levelId}`}
            className="btn-primary inline-block px-8 py-3"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    )
  }

  // Mostrar mensaje de acceso denegado o formulario de contraseña
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chaski-dark via-blue-900 to-indigo-900 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-chaski-accent to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-chaski-dark mb-2">
            Acceso al Curso
          </h2>
          <p className="text-gray-600">
            <span className="font-semibold text-chaski-blue">{levelName}</span>
          </p>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm mb-6">
          <p className="font-medium mb-1">Tu cuenta está registrada para:</p>
          <p className="text-amber-700">{user?.levelId || 'Sin nivel asignado'}</p>
          <p className="mt-2 text-xs">Si necesitas acceso a este curso, contacta a tu profesor o administrador.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O ingresa la contraseña del curso
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chaski-accent focus:border-transparent transition-all"
                placeholder="Contraseña del curso"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Acceder al Curso
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            La contraseña fue proporcionada por tu profesor o institución.
          </p>
        </div>
      </div>
    </div>
  )
}
