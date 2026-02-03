'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { Bot, Brain, Shield, BookOpen, Trophy, Clock, ArrowRight, Play, Sparkles, Zap, Star, Rocket } from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-cyan/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative animate-spin w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const currentLevel = EDUCATION_LEVELS.find(l => l.id === user?.levelId) || EDUCATION_LEVELS[0]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-neon-pink/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        {/* Partículas flotantes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-neon-purple rounded-full animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-neon-pink rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
      </div>
      
      <Header />
      
      <main className="flex-1 py-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section - Futurista */}
          <div className="relative group mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-pink/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-r from-dark-800/90 via-dark-700/90 to-dark-800/90 backdrop-blur-xl rounded-3xl p-8 border border-neon-cyan/30 overflow-hidden">
              {/* Líneas decorativas animadas */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-50"></div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-5">
                  {/* Avatar con logo */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon-cyan/40 rounded-2xl blur-md animate-pulse"></div>
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-neon-cyan/50">
                      <Image src="/chaski.png" alt="ChaskiBots" width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
                      <span className="text-neon-cyan text-sm font-medium tracking-wider uppercase">Bienvenido de vuelta</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      ¡Hola, <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">{user?.name}</span>! 
                    </h1>
                    <p className="text-gray-400">
                      Tu aventura de aprendizaje continúa. ¡Vamos a crear algo increíble!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="group/stat relative">
                    <div className="absolute inset-0 bg-neon-purple/20 rounded-xl blur-sm group-hover/stat:bg-neon-purple/30 transition-all"></div>
                    <div className="relative bg-dark-700/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-neon-purple/30">
                      <p className="text-xs text-neon-purple/80 font-medium uppercase tracking-wider">Nivel actual</p>
                      <p className="font-bold text-white text-lg">{currentLevel.name}</p>
                    </div>
                  </div>
                  <div className="group/stat relative">
                    <div className="absolute inset-0 bg-neon-green/20 rounded-xl blur-sm group-hover/stat:bg-neon-green/30 transition-all"></div>
                    <div className="relative bg-dark-700/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-neon-green/30">
                      <p className="text-xs text-neon-green/80 font-medium uppercase tracking-wider">Progreso</p>
                      <p className="font-bold text-white text-lg">{user?.progress || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Futurista */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Link href={`/nivel/${currentLevel.id}`} className="group relative">
              <div className="absolute inset-0 bg-neon-cyan/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-neon-cyan/20 group-hover:border-neon-cyan/50 transition-all duration-300 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl group-hover:bg-neon-cyan/20 transition-all"></div>
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/10 rounded-xl flex items-center justify-center text-3xl border border-neon-cyan/30 shadow-lg shadow-neon-cyan/20">
                    {currentLevel.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Continuar Aprendiendo</h3>
                    <p className="text-neon-cyan/70">{currentLevel.name}</p>
                  </div>
                </div>
                <div className="flex items-center text-neon-cyan font-semibold">
                  <Play className="w-5 h-5 mr-2" />
                  Ir al curso
                  <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            <Link href="/simuladores" className="group relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 group-hover:border-orange-500/50 transition-all duration-300 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500/30 to-amber-500/10 rounded-xl flex items-center justify-center border border-orange-500/30 shadow-lg shadow-orange-500/20">
                    <Bot className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Simuladores</h3>
                    <p className="text-orange-400/70">Practica en línea</p>
                  </div>
                </div>
                <div className="flex items-center text-orange-400 font-semibold">
                  <Zap className="w-5 h-5 mr-2" />
                  Explorar
                  <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            <Link href="/niveles" className="group relative">
              <div className="absolute inset-0 bg-neon-purple/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-neon-purple/20 group-hover:border-neon-purple/50 transition-all duration-300 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/10 rounded-full blur-2xl group-hover:bg-neon-purple/20 transition-all"></div>
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-purple/30 to-violet-500/10 rounded-xl flex items-center justify-center border border-neon-purple/30 shadow-lg shadow-neon-purple/20">
                    <BookOpen className="w-8 h-8 text-neon-purple" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Todos los Niveles</h3>
                    <p className="text-neon-purple/70">Explora el contenido</p>
                  </div>
                </div>
                <div className="flex items-center text-neon-purple font-semibold">
                  <Star className="w-5 h-5 mr-2" />
                  Ver niveles
                  <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>

          {/* Areas de Estudio - Futurista */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neon-pink/20 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-neon-pink" />
            </div>
            <h2 className="text-2xl font-bold text-white">Áreas de Estudio</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Link href="/robotica" className="group relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/30 to-blue-600/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Robótica</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Programación, diseño y electrónica para crear robots increíbles.
                </p>
                <div className="flex items-center text-blue-400 font-semibold text-sm">
                  Explorar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            <Link href="/ia" className="group relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 group-hover:border-purple-500/50 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-xl flex items-center justify-center mb-4 border border-purple-500/30 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Inteligencia Artificial</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Reconocimiento de imágenes, voz y machine learning.
                </p>
                <div className="flex items-center text-purple-400 font-semibold text-sm">
                  Explorar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            <Link href="/hacking" className="group relative">
              <div className="absolute inset-0 bg-neon-green/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-neon-green/20 group-hover:border-neon-green/50 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-neon-green/30 to-green-600/10 rounded-xl flex items-center justify-center mb-4 border border-neon-green/30 shadow-lg shadow-neon-green/20 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-neon-green" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Hacking Ético</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Seguridad informática y ciberseguridad responsable.
                </p>
                <div className="flex items-center text-neon-green font-semibold text-sm">
                  Explorar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>

          {/* Stats - Futurista */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Tu Progreso</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 group-hover:border-yellow-500/40 transition-all text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">0</p>
                <p className="text-sm text-yellow-400/70">Logros</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 group-hover:border-blue-500/40 transition-all text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">0</p>
                <p className="text-sm text-blue-400/70">Lecciones</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 group-hover:border-purple-500/40 transition-all text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">0</p>
                <p className="text-sm text-purple-400/70">Proyectos</p>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-neon-green/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 border border-neon-green/20 group-hover:border-neon-green/40 transition-all text-center">
                <div className="w-12 h-12 bg-neon-green/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-neon-green" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">0h</p>
                <p className="text-sm text-neon-green/70">Tiempo</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
