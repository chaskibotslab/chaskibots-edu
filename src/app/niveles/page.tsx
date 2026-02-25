'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { useLevels, useUserCourses } from '@/hooks'
import { 
  ArrowRight, Sparkles, Bot, Baby, Backpack, Pencil, 
  BookOpen, FlaskConical, Lightbulb, Zap, Gamepad2, Wrench, Settings, 
  Laptop, Brain, ShieldCheck, Rocket, GraduationCap, Code
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  Baby, Backpack, Pencil, BookOpen, FlaskConical, Bot, Lightbulb, 
  Zap, Gamepad2, Wrench, Settings, Laptop, Brain, ShieldCheck, Rocket
}

export default function NivelesPage() {
  const { user } = useAuth()
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  // Usar hooks modulares
  const { levels: allLevels, loading: levelsLoading } = useLevels()
  const { allowedLevelIds, loading: coursesLoading } = useUserCourses(allLevels)

  const isAdmin = user?.role === 'admin'
  const canAccessLevel = (levelId: string) => isAdmin || allowedLevelIds.includes(levelId)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`min-h-screen flex flex-col bg-transparent transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 bg-dark-800 rounded-full px-4 py-2 mb-4 border border-dark-600">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-gray-400">Plataforma Educativa</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Niveles Educativos
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Selecciona tu nivel para acceder a contenido de Robótica, IA y Hacking Ético
            </p>
          </div>
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
                  const IconComponent = (level.icon && ICON_MAP[level.icon]) || Bot
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
                  const IconComponent = (level.icon && ICON_MAP[level.icon]) || Bot
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
                  const IconComponent = (level.icon && ICON_MAP[level.icon]) || Bot
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
                  const IconComponent = (level.icon && ICON_MAP[level.icon]) || Bot
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
      </main>

      <Footer />
    </div>
  )
}
