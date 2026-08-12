'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { useLevels, useUserCourses } from '@/hooks'
import { Bot, Cpu, Wrench, Lightbulb, ArrowRight, Sparkles } from 'lucide-react'
import MatrixRain from '@/components/MatrixRain'

const FEATURES = [
  { icon: Cpu, color: 'chaski-primary', title: 'Programación', description: 'Scratch, Python, C++' },
  { icon: Wrench, color: 'neon-green', title: 'Electrónica', description: 'Circuitos y sensores' },
  { icon: Lightbulb, color: 'chaski-accent', title: 'Diseño 3D', description: 'Modelado e impresión' }
]

const TOOLS = ['Scratch', 'Blockly', 'Arduino', 'ESP32', 'micro:bit', 'Tinkercad', 'Wokwi', 'Python', 'C++']

export default function RoboticaPage() {
  const { user } = useAuth()
  const { levels: allLevels } = useLevels()
  const { allowedLevelIds } = useUserCourses(allLevels)

  const isAdmin = user?.role === 'admin'
  const visibleLevels = useMemo(() => {
    if (isAdmin) return allLevels
    return allLevels.filter(level => allowedLevelIds.includes(level.id))
  }, [allLevels, allowedLevelIds, isAdmin])

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 text-center shadow-2xl animate-fade-in">
            <MatrixRain count={10} className="opacity-30" />
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            <div className="absolute top-0 left-0 w-64 h-64 bg-chaski-primary/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-brand-cyan/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Bot className="w-8 h-8 text-chaski-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Robótica Educativa</h1>
              <p className="text-white/70 max-w-lg mx-auto">
                Programación, electrónica y diseño de robots
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-chaski-primary/30 transition-all duration-300 text-center animate-scale-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Levels */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-hack-green" />
              Selecciona tu Nivel
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleLevels.map((level, idx) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}?area=robotica`}
                  className="group flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:border-chaski-primary/50 hover:shadow-md transition-all animate-scale-in"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{level.name}</h3>
                    <p className="text-slate-500 text-xs">{level.ageRange}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-chaski-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-center">Herramientas</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {TOOLS.map((tool) => (
                <span key={tool} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm border border-slate-200 hover:border-chaski-primary/30 hover:text-chaski-primary transition-colors cursor-default">
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
