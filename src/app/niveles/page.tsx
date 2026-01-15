'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { ArrowRight } from 'lucide-react'

export default function NivelesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-chaski-dark mb-4">
              Niveles Educativos
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Selecciona tu nivel educativo para acceder a contenido personalizado de robótica, 
              inteligencia artificial y hacking ético adaptado a tu edad.
            </p>
          </div>

          {/* Educación Inicial */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-chaski-dark mb-6 flex items-center gap-2">
              🎒 Educación Inicial
              <span className="text-sm font-normal text-gray-500">(3-5 años)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {EDUCATION_LEVELS.slice(0, 2).map((level) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}`}
                  className={`level-card bg-gradient-to-br ${level.color} text-white group`}
                >
                  <div className="text-4xl mb-3">{level.icon}</div>
                  <h3 className="font-bold text-lg">{level.name}</h3>
                  <p className="text-sm opacity-80 mb-3">{level.ageRange}</p>
                  <div className="flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorar <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Educación General Básica */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-chaski-dark mb-6 flex items-center gap-2">
              📚 Educación General Básica
              <span className="text-sm font-normal text-gray-500">(5-15 años)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {EDUCATION_LEVELS.slice(2, 12).map((level) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}`}
                  className={`level-card bg-gradient-to-br ${level.color} text-white group`}
                >
                  <div className="text-3xl mb-2">{level.icon}</div>
                  <h3 className="font-bold">{level.name}</h3>
                  <p className="text-xs opacity-80 mb-2">{level.ageRange}</p>
                  <div className="flex items-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorar <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Bachillerato */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-chaski-dark mb-6 flex items-center gap-2">
              🎓 Bachillerato
              <span className="text-sm font-normal text-gray-500">(15-18 años)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EDUCATION_LEVELS.slice(12, 15).map((level) => (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}`}
                  className={`level-card bg-gradient-to-br ${level.color} text-white group`}
                >
                  <div className="text-4xl mb-3">{level.icon}</div>
                  <h3 className="font-bold text-lg">{level.name}</h3>
                  <p className="text-sm opacity-80 mb-3">{level.ageRange}</p>
                  <div className="flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorar <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-chaski-dark text-lg mb-2">
              📖 Contenido Adaptado a Cada Nivel
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada nivel incluye videos, tutoriales, proyectos prácticos y acceso a simuladores 
              apropiados para la edad. El contenido sigue una progresión pedagógica diseñada 
              para maximizar el aprendizaje.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
