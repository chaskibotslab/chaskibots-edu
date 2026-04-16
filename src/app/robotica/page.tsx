'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { useLevels, useUserCourses } from '@/hooks'
import { Bot, Cpu, Wrench, Lightbulb } from 'lucide-react'

export default function RoboticaPage() {
  const { user } = useAuth()
  
  // Usar hooks modulares
  const { levels: allLevels } = useLevels()
  const { allowedLevelIds } = useUserCourses(allLevels)

  const isAdmin = user?.role === 'admin'
  
  // Filtrar niveles que el usuario puede ver
  const visibleLevels = useMemo(() => {
    if (isAdmin) return allLevels
    return allLevels.filter(level => allowedLevelIds.includes(level.id))
  }, [allLevels, allowedLevelIds, isAdmin])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-purple/30">
              <Bot className="w-8 h-8 text-brand-purple" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Robótica Educativa</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Programación, electrónica y diseño de robots
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-brand-purple/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Cpu className="w-6 h-6 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Programación</h3>
              <p className="text-gray-500 text-sm">Scratch, Python, C++</p>
            </div>
            <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Electrónica</h3>
              <p className="text-gray-500 text-sm">Circuitos y sensores</p>
            </div>
            <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-brand-violet/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-brand-violet" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Diseño 3D</h3>
              <p className="text-gray-500 text-sm">Modelado e impresión</p>
            </div>
          </div>

          {/* Levels */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu Nivel</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleLevels.map((level) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}?area=robotica`}
                  className="group bg-gray-50/80 backdrop-blur rounded-xl p-4 border border-gray-200 hover:border-brand-purple/50 transition-all"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{level.name}</h3>
                  <p className="text-gray-500 text-xs">{level.ageRange}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-gray-50/80 backdrop-blur rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Herramientas</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {['Scratch', 'Blockly', 'Arduino', 'ESP32', 'micro:bit', 'Tinkercad', 'Wokwi', 'Python', 'C++'].map((tool) => (
                <span key={tool} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm border border-gray-200">
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
