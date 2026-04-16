'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import GradingPanel from '@/components/GradingPanel'
import { ArrowLeft, Shield, GraduationCap } from 'lucide-react'

function CalificacionesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlLevelId = searchParams.get('levelId') || ''
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${isAdmin ? 'from-brand-purple to-brand-violet' : 'from-green-500 to-emerald-600'} rounded-lg flex items-center justify-center`}>
                {isAdmin ? <Shield className="w-6 h-6 text-gray-900" /> : <GraduationCap className="w-6 h-6 text-gray-900" />}
              </div>
              <div>
                <h1 className="text-gray-900 font-bold">
                  {isAdmin ? 'ChaskiBots Admin' : `Profesor: ${user?.name || 'Panel'}`}
                </h1>
                <p className="text-xs text-brand-purple">Sistema de Calificaciones</p>
              </div>
            </div>
          </div>
          
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            Volver al sitio
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <GradingPanel initialLevelId={urlLevelId} />
      </main>
    </div>
  )
}

// Wrapper con Suspense para useSearchParams
export default function CalificacionesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    }>
      <CalificacionesContent />
    </Suspense>
  )
}
