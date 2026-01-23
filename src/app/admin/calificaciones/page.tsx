'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import GradingPanel from '@/components/GradingPanel'
import { ArrowLeft, Shield, GraduationCap } from 'lucide-react'

export default function CalificacionesPage() {
  const router = useRouter()
  const { isAdmin, isTeacher, isAuthenticated, isLoading, user } = useAuth()

  // Permitir acceso a admins Y profesores
  const hasAccess = isAdmin || isTeacher

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/calificaciones')
    }
    if (!isLoading && isAuthenticated && !hasAccess) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, hasAccess, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${isAdmin ? 'from-neon-cyan to-neon-purple' : 'from-green-500 to-emerald-600'} rounded-lg flex items-center justify-center`}>
                {isAdmin ? <Shield className="w-6 h-6 text-white" /> : <GraduationCap className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-white font-bold">
                  {isAdmin ? 'ChaskiBots Admin' : `Profesor: ${user?.name || 'Panel'}`}
                </h1>
                <p className="text-xs text-neon-cyan">Sistema de Calificaciones</p>
              </div>
            </div>
          </div>
          
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Volver al sitio
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <GradingPanel />
      </main>
    </div>
  )
}
