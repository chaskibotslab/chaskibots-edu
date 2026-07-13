'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Code, Terminal, Shield, BookOpen, ChevronRight, Loader2, Sparkles, GraduationCap } from 'lucide-react'

interface Course {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  difficulty: string
  total_modules: number
  total_lessons: number
}

export default function AcademyPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/academy')
      .then(r => r.json())
      .then(data => {
        setCourses(data.courses || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const courseIcons: Record<string, any> = {
    'python': <Code className="w-8 h-8" />,
    'hacking-etico': <Shield className="w-8 h-8" />,
  }

  const courseColors: Record<string, string> = {
    'python': 'from-blue-500 to-indigo-600',
    'hacking-etico': 'from-emerald-500 to-teal-600',
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-full mb-4">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Plataforma Profesional</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Academy
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> ChaskiBots</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Cursos profesionales con teoría completa, ejemplos prácticos y desafíos interactivos.
              Aprende a tu ritmo con un currículo estructurado.
            </p>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Los cursos se están preparando...</p>
              <p className="text-sm text-slate-400 mt-2">Ejecuta la migración de base de datos para cargar el contenido.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/academy/${course.slug}`}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-r ${courseColors[course.slug] || 'from-slate-500 to-slate-600'} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          {courseIcons[course.slug] || <BookOpen className="w-8 h-8" />}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{course.title}</h2>
                          <span className="text-white/80 text-sm capitalize">{course.difficulty}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.total_modules} módulos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Sparkles className="w-4 h-4" />
                        <span>{course.total_lessons} lecciones</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              { icon: <BookOpen className="w-6 h-6 text-blue-600" />, title: 'Teoría Completa', desc: 'Explicaciones claras con ejemplos detallados' },
              { icon: <Terminal className="w-6 h-6 text-emerald-600" />, title: 'Práctica Interactiva', desc: 'Ejecuta código directamente en el navegador' },
              { icon: <Sparkles className="w-6 h-6 text-purple-600" />, title: 'Desafíos Reales', desc: 'Problemas progresivos para afianzar conceptos' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
