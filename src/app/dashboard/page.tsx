'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import {
  Bot, Brain, Shield, BookOpen, ArrowRight, Play,
  Cpu, Loader2, Sparkles, Trophy, Zap, Target, Crown, ClipboardList
} from 'lucide-react'
import BadgesDisplay from '@/components/BadgesDisplay'

type Action = {
  id: string
  href: (levelId?: string) => string
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
  description: (levelName: string) => string
}

const QUICK_ACTIONS: Action[] = [
  {
    id: 'continue',
    href: (levelId) => `/nivel/${levelId}`,
    icon: Play,
    color: 'brand-purple',
    title: 'Continuar',
    description: (levelName) => levelName
  },
  {
    id: 'tareas',
    href: () => '/tareas',
    icon: ClipboardList,
    color: 'brand-cyan',
    title: 'Mis Tareas',
    description: () => 'Entregar y ver calificaciones'
  },
  {
    id: 'simulators',
    href: () => '/simuladores',
    icon: Cpu,
    color: 'brand-violet',
    title: 'Simuladores',
    description: () => 'Laboratorio virtual'
  },
  {
    id: 'levels',
    href: () => '/niveles',
    icon: BookOpen,
    color: 'neon-green',
    title: 'Niveles',
    description: () => 'Ver todos los cursos'
  }
]

const STUDY_AREAS = [
  { id: 'robotica', href: '/robotica', icon: Bot, color: 'brand-purple', title: 'Robótica', description: 'Programación y electrónica' },
  { id: 'ia', href: '/ia', icon: Brain, color: 'brand-violet', title: 'Inteligencia Artificial', description: 'Machine learning' },
  { id: 'hacking', href: '/hacking', icon: Shield, color: 'neon-green', title: 'Hacking Ético', description: 'Ciberseguridad' }
]

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const currentLevel = EDUCATION_LEVELS.find(l => l.id === user?.levelId) || EDUCATION_LEVELS[0]
  const progress = user?.progress || 0

  return (
    <div className={`min-h-screen flex flex-col bg-transparent transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Hero Welcome */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-brand-cyan/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg">
                  <Image src="/chaski.png" alt="ChaskiBots" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">Bienvenido de vuelta</p>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
                  <p className="text-brand-cyan text-sm font-medium flex items-center gap-1 mt-1">
                    <Sparkles className="w-4 h-4" />
                    {currentLevel.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Progreso general</p>
                  <p className="text-xl font-bold text-white">{progress}%</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative z-10 mt-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-purple" />
              Accesos rápidos
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                const href = action.href(currentLevel.id)
                return (
                  <Link
                    key={action.id}
                    href={href}
                    className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:shadow-${action.color}/10 hover:border-${action.color}/40 transition-all duration-300`}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${action.color}/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
                    <div className={`relative w-12 h-12 rounded-xl bg-${action.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 text-${action.color}`} />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-slate-500 mb-3">{action.description(currentLevel.name)}</p>
                    <span className={`text-sm font-medium text-${action.color} flex items-center gap-2 group-hover:gap-3 transition-all`}>
                      {action.id === 'continue' ? 'Ir al curso' : action.id === 'simulators' ? 'Explorar' : 'Ver más'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Study Areas */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-cyan" />
              Áreas de estudio
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {STUDY_AREAS.map((area) => {
                const Icon = area.icon
                return (
                  <Link
                    key={area.id}
                    href={area.href}
                    className={`group flex items-center gap-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-${area.color}/40 transition-all duration-300`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-${area.color}/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 text-${area.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{area.title}</h3>
                      <p className="text-sm text-slate-500">{area.description}</p>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-slate-300 group-hover:text-${area.color} ml-auto transition-colors`} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Badges */}
          <BadgesDisplay
            completedLessons={user?.completedLessons || 0}
            streak={user?.streak || 0}
            programsCompleted={user?.programsCompleted || []}
          />

          {/* Motivational footer card */}
          <div className="rounded-2xl bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/20 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Crown className="w-6 h-6 text-brand-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Sigue aprendiendo</h3>
              <p className="text-sm text-slate-600">
                Completa más lecciones para ganar insignias y desbloquear nuevos desafíos.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
