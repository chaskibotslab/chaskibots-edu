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
  Bot, Brain, Shield, BookOpen, Trophy, Clock, ArrowRight, Play, 
  Zap, Cpu, Loader2, Sparkles
} from 'lucide-react'
import BadgesDisplay from '@/components/BadgesDisplay'

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

  return (
    <div className={`min-h-screen flex flex-col bg-transparent transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Welcome Card */}
          <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 flex items-center justify-center border border-brand-purple/30">
                  <Image src="/chaski.png" alt="ChaskiBots" width={40} height={40} className="rounded-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Bienvenido</p>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-brand-purple text-sm">{currentLevel.name}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-gray-100 rounded-xl px-4 py-2 border border-gray-200">
                  <p className="text-xs text-gray-500">Progreso</p>
                  <p className="text-lg font-bold text-neon-green">{user?.progress || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href={`/nivel/${currentLevel.id}`} className="group bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 hover:border-brand-purple/50 transition-all hover:shadow-glow">
              <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Continuar</h3>
              <p className="text-sm text-gray-500 mb-3">{currentLevel.name}</p>
              <span className="text-brand-purple text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Ir al curso <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link href="/simuladores" className="group bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 hover:border-brand-cyan/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-brand-cyan" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Simuladores</h3>
              <p className="text-sm text-gray-500 mb-3">Laboratorio virtual</p>
              <span className="text-brand-cyan text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Explorar <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link href="/niveles" className="group bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 hover:border-brand-violet/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-violet/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-brand-violet" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Niveles</h3>
              <p className="text-sm text-gray-500 mb-3">Ver todos los cursos</p>
              <span className="text-brand-violet text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Ver más <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Study Areas */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-pink" />
              Áreas de Estudio
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/robotica" className="group bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 hover:border-brand-purple/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-3">
                  <Bot className="w-5 h-5 text-brand-purple" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Robótica</h3>
                <p className="text-sm text-gray-500">Programación y electrónica</p>
              </Link>

              <Link href="/ia" className="group bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 hover:border-brand-violet/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-brand-violet/10 flex items-center justify-center mb-3">
                  <Brain className="w-5 h-5 text-brand-violet" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Inteligencia Artificial</h3>
                <p className="text-sm text-gray-500">Machine learning</p>
              </Link>

              <Link href="/hacking" className="group bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 hover:border-neon-green/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-neon-green" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Hacking Ético</h3>
                <p className="text-sm text-gray-500">Ciberseguridad</p>
              </Link>
            </div>
          </div>

          {/* Badges/Insignias */}
          <BadgesDisplay 
            completedLessons={user?.completedLessons || 0}
            streak={user?.streak || 0}
            programsCompleted={user?.programsCompleted || []}
          />

        </div>
      </main>

      <Footer />
    </div>
  )
}
