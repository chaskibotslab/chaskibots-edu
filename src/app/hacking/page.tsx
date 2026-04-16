'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { Shield, Lock, Eye, Key } from 'lucide-react'

interface Level {
  id: string
  name: string
  ageRange?: string
}

export default function HackingPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [userCourses, setUserCourses] = useState<any[]>([])
  const [allLevels, setAllLevels] = useState<Level[]>([])

  // Cargar niveles desde Airtable
  const loadLevels = async () => {
    try {
      const res = await fetch('/api/admin/levels')
      const data = await res.json()
      if (data.levels) {
        setAllLevels(data.levels)
      }
    } catch (error) {
      console.error('Error loading levels:', error)
    }
  }

  const loadUserCourses = async () => {
    try {
      if (!user) return
      if (user.role === 'teacher') {
        let assignments: any[] = []
        
        // Buscar por accessCode Y nombre (OR en API)
        const params = new URLSearchParams()
        if (user.accessCode) params.append('teacherId', user.accessCode)
        if (user.name) params.append('teacherName', user.name)
        
        const res = await fetch(`/api/teacher-courses?${params.toString()}`)
        const data = await res.json()
        if (data.assignments?.length > 0) assignments = data.assignments
        
        if (assignments.length > 0) setUserCourses(assignments)
        else if (user.levelId) setUserCourses([{ courseId: user.courseId || '', levelId: user.levelId }])
        else setUserCourses([])
      } else if (user.role === 'student') {
        if (user.levelId) setUserCourses([{ courseId: user.courseId || '', levelId: user.levelId }])
        else setUserCourses([])
      } else {
        setUserCourses([])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  useEffect(() => {
    loadLevels()
  }, [])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role !== 'admin') {
      loadUserCourses()
    }
    if (!isLoading && (!isAuthenticated || !user)) {
      setUserCourses([])
    }
  }, [isLoading, isAuthenticated, user])

  const allowedLevelIds = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') return allLevels.map(l => l.id)
    const levelIds = new Set<string>()

    // SIEMPRE usar el levelId del usuario si existe (prioridad máxima)
    if (user.levelId) {
      levelIds.add(user.levelId)
    }

    // Para profesores: también agregar niveles de asignaciones
    if (user.role === 'teacher' && userCourses.length > 0) {
      userCourses.forEach(course => {
        if (course.levelId) levelIds.add(course.levelId)
      })
    }

    return Array.from(levelIds)
  }, [user, userCourses, allLevels])

  const isAdmin = user?.role === 'admin'
  
  // Filtrar niveles que el usuario puede ver
  const visibleLevels = useMemo(() => {
    if (isAdmin) return allLevels
    return allLevels.filter(level => allowedLevelIds.includes(level.id))
  }, [allLevels, allowedLevelIds, isAdmin])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-neon-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neon-green/30">
              <Shield className="w-8 h-8 text-neon-green" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hacking Ético</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Seguridad informática y ciberseguridad responsable
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Seguridad</h3>
              <p className="text-gray-500 text-sm">Contraseñas y privacidad</p>
            </div>
            <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-brand-purple/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Análisis</h3>
              <p className="text-gray-500 text-sm">Vulnerabilidades</p>
            </div>
            <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-brand-violet/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-brand-violet" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Criptografía</h3>
              <p className="text-gray-500 text-sm">Cifrado de datos</p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl p-4">
            <p className="text-brand-cyan text-sm text-center">
              ⚠️ El hacking ético se practica solo con autorización y fines educativos
            </p>
          </div>

          {/* Levels */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu Nivel</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleLevels.map((level) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}?area=hacking`}
                  className="group bg-gray-50/80 backdrop-blur rounded-xl p-4 border border-gray-200 hover:border-neon-green/50 transition-all"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{level.name}</h3>
                  <p className="text-gray-500 text-xs">{level.ageRange}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Herramientas</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {['CrypTool', 'Wireshark', 'Nmap', 'OWASP', 'Kali Linux', 'HackTheBox'].map((tool) => (
                <span key={tool} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm border border-gray-200">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
