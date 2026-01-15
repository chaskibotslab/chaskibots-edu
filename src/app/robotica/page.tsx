'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { Bot, Cpu, Wrench, Lightbulb, ArrowRight } from 'lucide-react'

export default function RoboticaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-chaski-dark mb-4">
              Robótica Educativa
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Aprende a programar, diseñar y construir robots. Desde bloques de programación 
              hasta Arduino y sistemas embebidos avanzados.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Programación</h3>
              <p className="text-gray-600 text-sm">
                Desde Scratch y Blockly hasta Python y C++ para microcontroladores.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Electrónica</h3>
              <p className="text-gray-600 text-sm">
                Circuitos, sensores, motores y componentes electrónicos.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Diseño</h3>
              <p className="text-gray-600 text-sm">
                Modelado 3D, impresión 3D y fabricación digital.
              </p>
            </div>
          </div>

          {/* Levels */}
          <h2 className="text-2xl font-bold text-chaski-dark mb-6 text-center">
            Selecciona tu Nivel
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
            {EDUCATION_LEVELS.map((level) => (
              <Link
                key={level.id}
                href={`/nivel/${level.id}?area=robotica`}
                className={`level-card bg-gradient-to-br ${level.color} text-white text-center group`}
              >
                <div className="text-2xl mb-1">{level.icon}</div>
                <h3 className="font-bold text-sm">{level.name}</h3>
                <p className="text-xs opacity-80">{level.ageRange}</p>
                <div className="mt-2 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Tools */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-chaski-dark text-lg mb-4 text-center">
              🛠️ Herramientas que Aprenderás
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Scratch', 'Blockly', 'Arduino', 'ESP32', 'micro:bit', 'Tinkercad', 'Wokwi', 'MakeCode', 'Python', 'C++'].map((tool) => (
                <span key={tool} className="badge badge-blue">
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
