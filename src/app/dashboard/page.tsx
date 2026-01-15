'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { Bot, Brain, Shield, BookOpen, Trophy, Clock, ArrowRight, Play } from 'lucide-react'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-chaski-blue border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const currentLevel = EDUCATION_LEVELS.find(l => l.id === user?.levelId) || EDUCATION_LEVELS[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-chaski-blue to-chaski-accent rounded-3xl p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  ¡Hola, {user?.name}! 👋
                </h1>
                <p className="text-white/80">
                  Bienvenido a tu panel de aprendizaje. Continúa donde lo dejaste.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-sm opacity-80">Nivel actual</p>
                  <p className="font-bold">{currentLevel.name}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-sm opacity-80">Progreso</p>
                  <p className="font-bold">{user?.progress || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href={`/nivel/${currentLevel.id}`} className="card group hover:border-chaski-accent">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${currentLevel.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {currentLevel.icon}
                </div>
                <div>
                  <h3 className="font-bold text-chaski-dark">Continuar Aprendiendo</h3>
                  <p className="text-sm text-gray-600">{currentLevel.name}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-chaski-blue font-semibold">
                <Play className="w-4 h-4 mr-1" />
                Ir al curso
                <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/simuladores" className="card group hover:border-chaski-accent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-chaski-dark">Simuladores</h3>
                  <p className="text-sm text-gray-600">Practica en línea</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-chaski-blue font-semibold">
                Explorar
                <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/niveles" className="card group hover:border-chaski-accent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-chaski-dark">Todos los Niveles</h3>
                  <p className="text-sm text-gray-600">Explora el contenido</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-chaski-blue font-semibold">
                Ver niveles
                <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Areas de Estudio */}
          <h2 className="text-2xl font-bold text-chaski-dark mb-4">Áreas de Estudio</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/robotica" className="card group hover:border-blue-400">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-chaski-dark mb-2">Robótica</h3>
              <p className="text-gray-600 text-sm mb-4">
                Programación, diseño y electrónica para crear robots increíbles.
              </p>
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                Explorar
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/ia" className="card group hover:border-purple-400">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-chaski-dark mb-2">Inteligencia Artificial</h3>
              <p className="text-gray-600 text-sm mb-4">
                Reconocimiento de imágenes, voz y machine learning.
              </p>
              <div className="flex items-center text-purple-600 font-semibold text-sm">
                Explorar
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/hacking" className="card group hover:border-green-400">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-chaski-dark mb-2">Hacking Ético</h3>
              <p className="text-gray-600 text-sm mb-4">
                Seguridad informática y ciberseguridad responsable.
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm">
                Explorar
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Stats */}
          <h2 className="text-2xl font-bold text-chaski-dark mb-4">Tu Progreso</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-chaski-dark">0</p>
              <p className="text-sm text-gray-600">Logros</p>
            </div>
            <div className="card text-center">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-chaski-dark">0</p>
              <p className="text-sm text-gray-600">Lecciones</p>
            </div>
            <div className="card text-center">
              <Bot className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-chaski-dark">0</p>
              <p className="text-sm text-gray-600">Proyectos</p>
            </div>
            <div className="card text-center">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-chaski-dark">0h</p>
              <p className="text-sm text-gray-600">Tiempo</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
