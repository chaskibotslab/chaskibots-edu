'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { Shield, Lock, Eye, Key, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react'

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

const FEATURES = [
  { icon: Lock, color: 'neon-green', title: 'Seguridad', description: 'Contraseñas y privacidad' },
  { icon: Eye, color: 'brand-purple', title: 'Análisis', description: 'Vulnerabilidades' },
  { icon: Key, color: 'brand-violet', title: 'Criptografía', description: 'Cifrado de datos' }
]

const TOOLS = ['CrypTool', 'Wireshark', 'Nmap', 'OWASP', 'Kali Linux', 'HackTheBox']

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-brand-cyan/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Hacking Ético</h1>
              <p className="text-white/70 max-w-lg mx-auto">
                Seguridad informática y ciberseguridad responsable
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-sm">
              El hacking ético se practica solo con autorización y fines educativos.
            </p>
          </div>

          {/* Levels */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              Selecciona tu Nivel
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleLevels.map((level) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}?area=hacking`}
                  className="group flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:border-green-500/50 hover:shadow-md transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{level.name}</h3>
                    <p className="text-slate-500 text-xs">{level.ageRange}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-center">Herramientas</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {TOOLS.map((tool) => (
                <span key={tool} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm border border-slate-200 hover:border-green-500/30 hover:text-green-600 transition-colors cursor-default">
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
