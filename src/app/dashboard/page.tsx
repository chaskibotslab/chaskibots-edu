'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { 
  Bot, Brain, Shield, BookOpen, Trophy, Clock, ArrowRight, Play, 
  Sparkles, Zap, Star, Rocket, Baby, Backpack, Pencil, Cpu, Code,
  GraduationCap, Laptop, Terminal, Gamepad2, CircuitBoard
} from 'lucide-react'

// Helper para convertir string de icono a componente
const getIconComponent = (iconName: string, className: string = "w-8 h-8") => {
  const icons: Record<string, React.ReactNode> = {
    'Baby': <Baby className={className} />,
    'Backpack': <Backpack className={className} />,
    'Pencil': <Pencil className={className} />,
    'BookOpen': <BookOpen className={className} />,
    'Bot': <Bot className={className} />,
    'Brain': <Brain className={className} />,
    'Cpu': <Cpu className={className} />,
    'Code': <Code className={className} />,
    'Rocket': <Rocket className={className} />,
    'GraduationCap': <GraduationCap className={className} />,
    'Laptop': <Laptop className={className} />,
    'Terminal': <Terminal className={className} />,
    'Gamepad2': <Gamepad2 className={className} />,
    'CircuitBoard': <CircuitBoard className={className} />,
    'Shield': <Shield className={className} />,
  }
  return icons[iconName] || <Rocket className={className} />
}

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
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] relative overflow-hidden">
      {/* Grid de fondo tech */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent"></div>
      </div>
      
      <Header />
      
      <main className="flex-1 py-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section - Tech Panel Style */}
          <div className="relative mb-8">
            {/* Esquinas decorativas */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-neon-cyan"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-neon-cyan"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-neon-purple"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-neon-purple"></div>
            
            <div className="bg-[#0d0d15]/90 backdrop-blur-sm border border-neon-cyan/20 p-6">
              {/* Header bar */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neon-cyan/20">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                <span className="text-neon-cyan text-xs font-mono uppercase tracking-widest">Sistema Activo</span>
                <div className="flex-1 h-px bg-gradient-to-r from-neon-cyan/50 to-transparent ml-4"></div>
                <span className="text-gray-500 text-xs font-mono">{new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon-cyan/30 blur-md"></div>
                    <div className="relative w-16 h-16 border-2 border-neon-cyan/50 bg-[#0a0a0f] p-1">
                      <Image src="/chaski.png" alt="ChaskiBots" width={60} height={60} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border border-[#0a0a0f]"></div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-1">Usuario Conectado</p>
                    <h1 className="text-2xl md:text-3xl font-bold text-white font-mono">
                      {user?.name}
                    </h1>
                    <p className="text-neon-cyan/70 text-sm font-mono">
                      Nivel: {currentLevel.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {/* Stat Box - Nivel */}
                  <div className="relative">
                    <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-neon-purple"></div>
                    <div className="absolute -top-px -right-px w-2 h-2 border-r border-t border-neon-purple"></div>
                    <div className="absolute -bottom-px -left-px w-2 h-2 border-l border-b border-neon-purple"></div>
                    <div className="absolute -bottom-px -right-px w-2 h-2 border-r border-b border-neon-purple"></div>
                    <div className="bg-neon-purple/10 border border-neon-purple/30 px-4 py-2">
                      <p className="text-[10px] text-neon-purple font-mono uppercase tracking-wider">Nivel</p>
                      <p className="font-bold text-white text-lg font-mono">{currentLevel.name}</p>
                    </div>
                  </div>
                  {/* Stat Box - Progreso */}
                  <div className="relative">
                    <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-neon-green"></div>
                    <div className="absolute -top-px -right-px w-2 h-2 border-r border-t border-neon-green"></div>
                    <div className="absolute -bottom-px -left-px w-2 h-2 border-l border-b border-neon-green"></div>
                    <div className="absolute -bottom-px -right-px w-2 h-2 border-r border-b border-neon-green"></div>
                    <div className="bg-neon-green/10 border border-neon-green/30 px-4 py-2">
                      <p className="text-[10px] text-neon-green font-mono uppercase tracking-wider">Progreso</p>
                      <p className="font-bold text-white text-lg font-mono">{user?.progress || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Tech Panel Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Card: Continuar Curso */}
            <Link href={`/nivel/${currentLevel.id}`} className="group relative">
              <div className="absolute -top-px -left-px w-3 h-3 border-l-2 border-t-2 border-neon-cyan group-hover:w-full group-hover:h-full transition-all duration-300"></div>
              <div className="absolute -bottom-px -right-px w-3 h-3 border-r-2 border-b-2 border-neon-cyan group-hover:w-full group-hover:h-full transition-all duration-300"></div>
              
              <div className="bg-[#0d0d15]/80 border border-gray-800 group-hover:border-neon-cyan/50 p-5 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                    {getIconComponent(currentLevel.icon, "w-7 h-7 text-neon-cyan")}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Curso Actual</p>
                    <h3 className="font-bold text-white font-mono">{currentLevel.name}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-neon-cyan text-sm font-mono">
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" /> Continuar
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card: Simuladores */}
            <Link href="/simuladores" className="group relative">
              <div className="absolute -top-px -left-px w-3 h-3 border-l-2 border-t-2 border-orange-500 group-hover:w-full group-hover:h-full transition-all duration-300"></div>
              <div className="absolute -bottom-px -right-px w-3 h-3 border-r-2 border-b-2 border-orange-500 group-hover:w-full group-hover:h-full transition-all duration-300"></div>
              
              <div className="bg-[#0d0d15]/80 border border-gray-800 group-hover:border-orange-500/50 p-5 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <Cpu className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Laboratorio</p>
                    <h3 className="font-bold text-white font-mono">Simuladores</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-orange-400 text-sm font-mono">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Explorar
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card: Niveles */}
            <Link href="/niveles" className="group relative">
              <div className="absolute -top-px -left-px w-3 h-3 border-l-2 border-t-2 border-neon-purple group-hover:w-full group-hover:h-full transition-all duration-300"></div>
              <div className="absolute -bottom-px -right-px w-3 h-3 border-r-2 border-b-2 border-neon-purple group-hover:w-full group-hover:h-full transition-all duration-300"></div>
              
              <div className="bg-[#0d0d15]/80 border border-gray-800 group-hover:border-neon-purple/50 p-5 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Catálogo</p>
                    <h3 className="font-bold text-white font-mono">Todos los Niveles</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-neon-purple text-sm font-mono">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" /> Ver más
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Areas de Estudio - Tech Style */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-neon-pink"></div>
              <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wider">Áreas de Estudio</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-neon-pink/50 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Robótica */}
              <Link href="/robotica" className="group relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-[#0d0d15]/80 border border-gray-800 group-hover:border-blue-500/50 p-5 transition-all">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2 font-mono">Robótica</h3>
                  <p className="text-gray-500 text-sm mb-4">Programación y electrónica para robots.</p>
                  <span className="text-blue-400 text-sm font-mono flex items-center gap-2">
                    Explorar <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>

              {/* IA */}
              <Link href="/ia" className="group relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-[#0d0d15]/80 border border-gray-800 group-hover:border-purple-500/50 p-5 transition-all">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2 font-mono">Inteligencia Artificial</h3>
                  <p className="text-gray-500 text-sm mb-4">Machine learning y visión por computadora.</p>
                  <span className="text-purple-400 text-sm font-mono flex items-center gap-2">
                    Explorar <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>

              {/* Hacking */}
              <Link href="/hacking" className="group relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-[#0d0d15]/80 border border-gray-800 group-hover:border-neon-green/50 p-5 transition-all">
                  <div className="w-12 h-12 bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-neon-green" />
                  </div>
                  <h3 className="font-bold text-white mb-2 font-mono">Hacking Ético</h3>
                  <p className="text-gray-500 text-sm mb-4">Ciberseguridad y seguridad informática.</p>
                  <span className="text-neon-green text-sm font-mono flex items-center gap-2">
                    Explorar <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats - Tech Panel */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-yellow-500"></div>
              <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wider">Estadísticas</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#0d0d15]/80 border border-gray-800 p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white font-mono">0</p>
                <p className="text-xs text-gray-500 font-mono uppercase">Logros</p>
              </div>
              <div className="bg-[#0d0d15]/80 border border-gray-800 p-4 text-center">
                <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white font-mono">0</p>
                <p className="text-xs text-gray-500 font-mono uppercase">Lecciones</p>
              </div>
              <div className="bg-[#0d0d15]/80 border border-gray-800 p-4 text-center">
                <Bot className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white font-mono">0</p>
                <p className="text-xs text-gray-500 font-mono uppercase">Proyectos</p>
              </div>
              <div className="bg-[#0d0d15]/80 border border-gray-800 p-4 text-center">
                <Clock className="w-6 h-6 text-neon-green mx-auto mb-2" />
                <p className="text-2xl font-bold text-white font-mono">0h</p>
                <p className="text-xs text-gray-500 font-mono uppercase">Tiempo</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
