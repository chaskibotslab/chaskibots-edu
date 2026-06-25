'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { useLevels, useUserCourses } from '@/hooks'
import {
  ArrowRight, Sparkles, Bot, Baby, BookOpen, Code,
  GraduationCap, Rocket, Loader2, Lock
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  BookOpen,
  Code,
  GraduationCap,
  Rocket,
  Bot
}

const CATEGORIES = [
  {
    id: 'inicial',
    title: 'Educación Inicial',
    subtitle: '3-5 años • Primeros pasos en tecnología',
    icon: Baby,
    color: 'pink',
    columns: 'grid-cols-2 md:grid-cols-3'
  },
  {
    id: 'elemental',
    title: 'Educación Básica Elemental',
    subtitle: '5-9 años • Fundamentos de programación',
    icon: BookOpen,
    color: 'cyan',
    columns: 'grid-cols-2 md:grid-cols-4'
  },
  {
    id: 'media',
    title: 'Educación Básica Media y Superior',
    subtitle: '9-15 años • Proyectos avanzados',
    icon: Code,
    color: 'violet',
    columns: 'grid-cols-2 md:grid-cols-3',
    filter: (l: { category: string }) => l.category === 'media' || l.category === 'superior'
  },
  {
    id: 'bachillerato',
    title: 'Bachillerato',
    subtitle: '15-18 años • Especialización profesional',
    icon: GraduationCap,
    color: 'green',
    columns: 'grid-cols-1 md:grid-cols-3'
  }
]

const COLOR_STYLES: Record<string, { icon: string; bg: string; border: string; hover: string; light: string }> = {
  pink: {
    icon: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    hover: 'hover:border-pink-500/50 hover:bg-pink-50/50',
    light: 'bg-pink-500/5'
  },
  cyan: {
    icon: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    hover: 'hover:border-cyan-500/50 hover:bg-cyan-50/50',
    light: 'bg-cyan-500/5'
  },
  violet: {
    icon: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    hover: 'hover:border-violet-500/50 hover:bg-violet-50/50',
    light: 'bg-violet-500/5'
  },
  green: {
    icon: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    hover: 'hover:border-green-500/50 hover:bg-green-50/50',
    light: 'bg-green-500/5'
  }
}

export default function NivelesPage() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const { levels: allLevels, loading: levelsLoading } = useLevels()
  const { allowedLevelIds, loading: coursesLoading } = useUserCourses(allLevels)

  const isAdmin = user?.role === 'admin'
  const canAccessLevel = (levelId: string) => isAdmin || allowedLevelIds.includes(levelId)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (levelsLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-transparent">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col bg-transparent transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Header */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 bg-brand-purple/10 rounded-full px-4 py-2 mb-4 border border-brand-purple/20">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              <span className="text-sm font-medium text-brand-purple">Plataforma Educativa</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              Niveles Educativos
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Selecciona tu nivel para acceder a contenido de Robótica, IA y Hacking Ético
            </p>
          </div>

          {/* Categories */}
          {CATEGORIES.map((category) => {
            const CatIcon = category.icon
            const styles = COLOR_STYLES[category.color]
            const filter = category.filter || ((l: { category: string }) => l.category === category.id)
            const levels = allLevels.filter(filter)
            if (levels.length === 0) return null

            return (
              <section key={category.id}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 ${styles.bg} rounded-2xl flex items-center justify-center border ${styles.border}`}>
                    <CatIcon className={`w-6 h-6 ${styles.icon}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                    <p className="text-slate-500 text-sm">{category.subtitle}</p>
                  </div>
                </div>

                <div className={`grid ${category.columns} gap-4`}>
                  {levels.map((level) => {
                    const IconComponent = (level.icon && ICON_MAP[level.icon]) || Bot
                    const hasAccess = canAccessLevel(level.id)
                    if (!hasAccess && !isAdmin) return null

                    return (
                      <Link
                        key={level.id}
                        href={`/nivel/${level.id}`}
                        className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm transition-all duration-300 ${styles.hover}`}
                      >
                        <div className={`absolute top-0 right-0 w-20 h-20 ${styles.light} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
                        <div className="relative flex items-center gap-4">
                          <div className={`w-12 h-12 ${styles.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-6 h-6 ${styles.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{level.name}</h3>
                            <p className="text-slate-500 text-xs mt-0.5">{level.ageRange}</p>
                          </div>
                          {hasAccess ? (
                            <ArrowRight className={`w-5 h-5 ${styles.icon} group-hover:translate-x-1 transition-transform flex-shrink-0`} />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}

        </div>
      </main>

      <Footer />
    </div>
  )
}
