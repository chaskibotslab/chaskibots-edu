'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BookOpen, ChevronRight, Clock, Zap, Lock, CheckCircle2, Loader2, ArrowLeft, Code, Shield } from 'lucide-react'

interface Lesson {
  id: string
  slug: string
  title: string
  description: string
  difficulty: string
  estimated_minutes: number
  sort_order: number
}

interface Module {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  sort_order: number
  lessons: Lesson[]
}

interface Course {
  id: string
  slug: string
  title: string
  description: string
  color: string
  icon: string
}

export default function CoursePage() {
  const params = useParams()
  const courseSlug = params.courseSlug as string
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/academy?course=${courseSlug}`)
      .then(r => r.json())
      .then(data => {
        setCourse(data.course)
        setModules(data.modules || [])
        if (data.modules?.length > 0) {
          setExpandedModule(data.modules[0].id)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [courseSlug])

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'text-emerald-600 bg-emerald-50'
      case 'medium': return 'text-amber-600 bg-amber-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const difficultyLabel = (d: string) => {
    switch (d) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Medio'
      case 'hard': return 'Difícil'
      default: return d
    }
  }

  const courseGradient = courseSlug === 'python' 
    ? 'from-blue-500 to-indigo-600' 
    : 'from-emerald-500 to-teal-600'

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Curso no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <main className="flex-1 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/academy" className="hover:text-slate-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Academy
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">{course.title}</span>
          </div>

          {/* Course Header */}
          <div className={`bg-gradient-to-r ${courseGradient} rounded-2xl p-8 text-white mb-8 shadow-lg`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                {course.icon}
              </div>
              <div>
                <h1 className="text-3xl font-black">{course.title}</h1>
                <p className="text-white/80 mt-1">{modules.length} módulos · {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lecciones</p>
              </div>
            </div>
            <p className="text-white/90 max-w-2xl">{course.description}</p>
          </div>

          {/* Modules accordion */}
          <div className="space-y-3">
            {modules.map((module, moduleIdx) => (
              <div key={module.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Module header */}
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-bold text-slate-400">
                    {moduleIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{module.icon}</span>
                      {module.title}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 hidden sm:block">{module.lessons?.length || 0} lecciones</span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedModule === module.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Lessons list */}
                {expandedModule === module.id && module.lessons && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    {module.lessons.map((lesson, lessonIdx) => (
                      <Link
                        key={lesson.id}
                        href={`/academy/${courseSlug}/${module.slug}/${lesson.slug}`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50/50 transition-colors border-b border-slate-100 last:border-b-0 group"
                      >
                        <div className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-blue-300 group-hover:text-blue-500 transition-colors">
                          {lessonIdx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{lesson.title}</h4>
                          <p className="text-xs text-slate-400 truncate">{lesson.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(lesson.difficulty)}`}>
                            {difficultyLabel(lesson.difficulty)}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 hidden sm:flex">
                            <Clock className="w-3 h-3" />
                            {lesson.estimated_minutes}m
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
