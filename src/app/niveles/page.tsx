'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { 
  ArrowRight, Sparkles, Rocket, Brain, Bot, Baby, Backpack, Pencil, 
  BookOpen, FlaskConical, Lightbulb, Zap, Gamepad2, Wrench, Settings, 
  Laptop, ShieldCheck, GraduationCap, Users, Code, Lock
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  Baby, Backpack, Pencil, BookOpen, FlaskConical, Bot, Lightbulb, 
  Zap, Gamepad2, Wrench, Settings, Laptop, Brain, ShieldCheck, Rocket
}

interface DynamicLevel {
  id: string
  name: string
  fullName: string
  category: string
  ageRange: string
  gradeNumber: number
  color: string
  neonColor: string
  icon: string
  kitPrice: number
  hasHacking: boolean
  hasAdvancedIA: boolean
}

export default function NivelesPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [userCourses, setUserCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [dynamicLevels, setDynamicLevels] = useState<DynamicLevel[]>([])
  const [levelsLoading, setLevelsLoading] = useState(true)

  // Cargar niveles desde Airtable
  useEffect(() => {
    const loadLevels = async () => {
      try {
        const res = await fetch('/api/admin/levels')
        const data = await res.json()
        if (data.levels && data.levels.length > 0) {
          setDynamicLevels(data.levels)
        }
      } catch (error) {
        console.error('Error loading levels from Airtable:', error)
      }
      setLevelsLoading(false)
    }
    loadLevels()
  }, [])

  // Combinar niveles: Airtable tiene prioridad, luego fallback a constantes locales
  const allLevels = useMemo(() => {
    if (dynamicLevels.length > 0) {
      // Crear un mapa de niveles de Airtable
      const airtableLevelIds = new Set(dynamicLevels.map(l => l.id))
      // Agregar niveles locales que no estén en Airtable
      const localOnlyLevels = EDUCATION_LEVELS.filter(l => !airtableLevelIds.has(l.id))
      return [...dynamicLevels, ...localOnlyLevels]
    }
    return EDUCATION_LEVELS
  }, [dynamicLevels])

  const loadUserCourses = async () => {
    try {
      if (!user) return
      console.log('[Niveles] Usuario:', user.name, 'Role:', user.role, 'LevelId:', user.levelId, 'AccessCode:', user.accessCode)
      
      if (user.role === 'teacher') {
        // Buscar asignaciones: primero por accessCode, luego por nombre
        let assignments: any[] = []
        
        if (user.accessCode) {
          console.log('[Niveles] Buscando asignaciones por teacherId:', user.accessCode)
          const res = await fetch(`/api/teacher-courses?teacherId=${user.accessCode}`)
          const data = await res.json()
          if (data.assignments && data.assignments.length > 0) {
            assignments = data.assignments
          }
        }
        
        // Si no hay asignaciones por accessCode, buscar por nombre
        if (assignments.length === 0 && user.name) {
          console.log('[Niveles] Buscando asignaciones por teacherName:', user.name)
          const res = await fetch(`/api/teacher-courses?teacherName=${encodeURIComponent(user.name)}`)
          const data = await res.json()
          if (data.assignments && data.assignments.length > 0) {
            assignments = data.assignments
          }
        }
        
        console.log('[Niveles] Asignaciones encontradas:', assignments.length)
        
        if (assignments.length > 0) {
          setUserCourses(assignments)
        } else if (user.levelId) {
          // Fallback: usar levelId del usuario
          console.log('[Niveles] Usando levelId del usuario:', user.levelId)
          setUserCourses([{ courseId: user.courseId || '', levelId: user.levelId }])
        } else {
          setUserCourses([])
        }
      } else if (user.role === 'student') {
        // Para estudiantes: solo su curso asignado
        if (user.levelId) {
          setUserCourses([{ courseId: user.courseId || '', levelId: user.levelId }])
        } else {
          setUserCourses([])
        }
      } else {
        setUserCourses([])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setCoursesLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role !== 'admin') {
      setCoursesLoading(true)
      loadUserCourses()
    }
    if (!isLoading && (!isAuthenticated || !user)) {
      setUserCourses([])
      setCoursesLoading(false)
    }
    // Admin no necesita cargar cursos
    if (!isLoading && user?.role === 'admin') {
      setCoursesLoading(false)
    }
  }, [isLoading, isAuthenticated, user])

  // Determinar qué niveles puede ver el usuario
  const allowedLevelIds = useMemo(() => {
    if (!user) return [] // No logueado, no ve nada
    if (user.role === 'admin') return allLevels.map(l => l.id) // Admin ve todo
    if (coursesLoading || levelsLoading) return [] // Mientras carga, no mostrar nada
    
    // Profesor/Estudiante: solo niveles permitidos
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
    
    console.log('[Niveles] Usuario:', user.name, 'Role:', user.role, 'LevelId:', user.levelId, 'Allowed:', Array.from(levelIds))
    
    return Array.from(levelIds)
  }, [user, userCourses, coursesLoading, levelsLoading, allLevels])

  const isAdmin = user?.role === 'admin'
  const canAccessLevel = (levelId: string) => isAdmin || allowedLevelIds.includes(levelId)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 overflow-x-hidden">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section con Parallax y Logo */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background con efecto zoom */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-dark-900 via-blue-900/50 to-purple-900/50"
            style={{ transform: `scale(${1 + scrollY * 0.0003})` }}
          >
            <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
          </div>
          
          {/* Efectos de luz animados */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[180px] animate-parallax"></div>
          
          {/* Contenido */}
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            {/* Logo animado */}
            <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/40 via-neon-purple/40 to-neon-pink/40 rounded-full blur-2xl animate-pulse scale-125"></div>
                <Image 
                  src="/chaski.png" 
                  alt="ChaskiBots Logo" 
                  width={150} 
                  height={150}
                  className="relative rounded-3xl shadow-2xl animate-float"
                  priority
                />
              </div>
            </div>
            
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="text-white">Niveles </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink animate-gradient">Educativos</span>
            </h1>
            
            <p className={`text-xl text-gray-300 max-w-2xl mx-auto mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Selecciona tu nivel y accede a contenido exclusivo de 
              <span className="text-neon-cyan font-semibold"> Robótica</span>, 
              <span className="text-neon-purple font-semibold"> IA</span> y 
              <span className="text-neon-green font-semibold"> Hacking Ético</span>
            </p>

            {/* Badges animados */}
            <div className={`flex flex-wrap justify-center gap-4 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-2">
                <Bot className="w-5 h-5 text-neon-cyan" />
                <span className="text-white text-sm">14 Kits de Robótica</span>
              </div>
              <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-2">
                <Brain className="w-5 h-5 text-neon-purple" />
                <span className="text-white text-sm">IA en el Navegador</span>
              </div>
              <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-2">
                <Rocket className="w-5 h-5 text-neon-green" />
                <span className="text-white text-sm">+30 Simuladores</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-neon-cyan rounded-full animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Secciones de Niveles con diseño profesional */}
        <div className="relative py-12">
          <div className="max-w-6xl mx-auto px-4">
            {/* Educación Inicial */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                  <Baby className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Educación Inicial</h2>
                  <p className="text-gray-500 text-sm">3-5 años • Primeros pasos en tecnología</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {allLevels.filter(l => l.category === 'inicial').map((level) => {
                  const IconComponent = ICON_MAP[level.icon] || Bot
                  const hasAccess = canAccessLevel(level.id)
                  
                  // Para docentes: no mostrar niveles sin acceso
                  if (!hasAccess && !isAdmin) {
                    return null
                  }
                  
                  return (
                    <Link
                      key={level.id}
                      href={`/nivel/${level.id}`}
                      className="group bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-pink-500/50 hover:bg-dark-700/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                          <IconComponent className="w-6 h-6 text-gray-400 group-hover:text-pink-400 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{level.name}</h3>
                          <p className="text-gray-500 text-sm">{level.ageRange}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Educación Básica Elemental */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Educación Básica Elemental</h2>
                  <p className="text-gray-500 text-sm">5-9 años • Fundamentos de programación</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allLevels.filter(l => l.category === 'elemental').map((level) => {
                  const IconComponent = ICON_MAP[level.icon] || Bot
                  const hasAccess = canAccessLevel(level.id)
                  
                  // Para docentes: no mostrar niveles sin acceso
                  if (!hasAccess && !isAdmin) {
                    return null
                  }
                  
                  return (
                    <Link
                      key={level.id}
                      href={`/nivel/${level.id}`}
                      className="group bg-dark-800 border border-dark-700 rounded-xl p-5 hover:border-cyan-500/50 hover:bg-dark-700/50 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-cyan-500/10 transition-colors">
                          <IconComponent className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <h3 className="font-semibold text-white text-sm">{level.name}</h3>
                        <p className="text-gray-500 text-xs mt-1">{level.ageRange}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Educación Básica Media y Superior */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Educación Básica Media y Superior</h2>
                  <p className="text-gray-500 text-sm">9-15 años • Proyectos avanzados</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allLevels.filter(l => l.category === 'media' || l.category === 'superior').map((level) => {
                  const IconComponent = ICON_MAP[level.icon] || Bot
                  const hasAccess = canAccessLevel(level.id)
                  
                  // Para docentes: no mostrar niveles sin acceso
                  if (!hasAccess && !isAdmin) {
                    return null
                  }
                  
                  return (
                    <Link
                      key={level.id}
                      href={`/nivel/${level.id}`}
                      className="group bg-dark-800 border border-dark-700 rounded-xl p-5 hover:border-purple-500/50 hover:bg-dark-700/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                          <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{level.name}</h3>
                          <p className="text-gray-500 text-xs">{level.ageRange}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Bachillerato */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Bachillerato</h2>
                  <p className="text-gray-500 text-sm">15-18 años • Especialización profesional</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allLevels.filter(l => l.category === 'bachillerato').map((level) => {
                  const IconComponent = ICON_MAP[level.icon] || Bot
                  const hasAccess = canAccessLevel(level.id)
                  
                  // Para docentes: no mostrar niveles sin acceso
                  if (!hasAccess && !isAdmin) {
                    return null
                  }
                  
                  return (
                    <Link
                      key={level.id}
                      href={`/nivel/${level.id}`}
                      className="group bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-green-500/50 hover:bg-dark-700/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                          <IconComponent className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{level.name}</h3>
                          <p className="text-gray-500 text-sm">{level.ageRange}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
