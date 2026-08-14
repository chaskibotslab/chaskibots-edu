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
    color: 'coral',
    columns: 'grid-cols-2 md:grid-cols-3'
  },
  {
    id: 'elemental',
    title: 'Educación Básica Elemental',
    subtitle: '5-9 años • Fundamentos de programación',
    icon: BookOpen,
    color: 'gold',
    columns: 'grid-cols-2 md:grid-cols-4'
  },
  {
    id: 'media',
    title: 'Educación Básica Media y Superior',
    subtitle: '9-15 años • Proyectos avanzados',
    icon: Code,
    color: 'slate',
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
  coral: {
    icon: 'text-chaski-primary',
    bg: 'bg-chaski-primary/10',
    border: 'border-chaski-primary/20',
    hover: 'hover:border-chaski-primary/40 hover:bg-chaski-primary/5',
    light: 'bg-chaski-primary/5'
  },
  gold: {
    icon: 'text-chaski-gold',
    bg: 'bg-chaski-gold/10',
    border: 'border-chaski-gold/20',
    hover: 'hover:border-chaski-gold/40 hover:bg-chaski-gold/5',
    light: 'bg-chaski-gold/5'
  },
  slate: {
    icon: 'text-slate-300',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
    hover: 'hover:border-slate-400/40 hover:bg-slate-400/5',
    light: 'bg-slate-400/5'
  },
  green: {
    icon: 'text-hack-green',
    bg: 'bg-hack-green/10',
    border: 'border-hack-green/20',
    hover: 'hover:border-hack-green/40 hover:bg-hack-green/5',
    light: 'bg-hack-green/5'
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
      <div className="min-h-screen flex flex-col bg-chaski-dark">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col bg-chaski-dark transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Header */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 bg-chaski-primary/10 rounded-full px-4 py-2 mb-4 border border-chaski-primary/25">
              <Sparkles className="w-4 h-4 text-chaski-primary" />
              <span className="text-sm font-medium text-chaski-primary">Plataforma Educativa</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              Niveles Educativos
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
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
              <section key={category.id} className="animate-slide-up">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 ${styles.bg} rounded-2xl flex items-center justify-center border ${styles.border}`}>
                    <CatIcon className={`w-6 h-6 ${styles.icon}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                    <p className="text-white/50 text-sm">{category.subtitle}</p>
                  </div>
                </div>

                <div className={`grid ${category.columns} gap-4`}>
                  {levels.map((level, levelIdx) => {
                    const IconComponent = (level.icon && ICON_MAP[level.icon]) || Bot
                    const hasAccess = canAccessLevel(level.id)
                    if (!hasAccess && !isAdmin) return null

                    return (
                      <Link
                        key={level.id}
                        href={`/nivel/${level.id}`}
                        className={`group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-5 transition-all duration-300 animate-scale-in hover:shadow-lg hover:shadow-white/5 ${styles.hover}`}
                        style={{ animationDelay: `${levelIdx * 0.05}s` }}
                      >
                        <div className={`absolute top-0 right-0 w-20 h-20 ${styles.light} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
                        <div className="relative flex items-center gap-4">
                          <div className={`w-12 h-12 ${styles.bg} rounded-xl flex items-center justify-center flex-shrink-0 border ${styles.border} group-hover:scale-110 transition-transform`}>
                            <IconComponent className={`w-6 h-6 ${styles.icon}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-sm leading-tight">{level.name}</h3>
                            <p className="text-slate-500 text-xs mt-0.5">{level.ageRange}</p>
                          </div>
                          {hasAccess ? (
                            <ArrowRight className={`w-5 h-5 ${styles.icon} group-hover:translate-x-1 transition-transform flex-shrink-0`} />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
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
