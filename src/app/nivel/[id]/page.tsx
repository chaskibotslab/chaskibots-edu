'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { EDUCATION_LEVELS, LEVEL_CONTENT, SIMULATORS } from '@/lib/constants'
import { ALL_COURSES, calculateProgress, Module, Lesson, AssemblyStep, YearPlanItem } from '@/data/courses'
import {
  Bot, Brain, Shield, Play, BookOpen, Wrench, ArrowLeft,
  ChevronRight, CheckCircle, Lock, Clock, Package,
  Calendar, Video, FileText, Zap, Home, Settings,
  GraduationCap, Cpu, Menu, X, Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import CourseAuthGuard from '@/components/CourseAuthGuard'
import { useAuth } from '@/components/AuthProvider'
import ModuleAccordion from '@/components/ModuleAccordion'
import { logger } from '@/lib/logger'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-hack-green" />
    <span className="ml-2 text-slate-400">Cargando...</span>
  </div>
)

const AILab = dynamic(() => import('@/components/AILab'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const SimulatorTabsDynamic = dynamic(() => import('@/components/SimulatorTabsDynamic'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const KitDisplay = dynamic(() => import('@/components/KitDisplay'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const TasksPanel = dynamic(() => import('@/components/TasksPanel'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const LessonViewerModern = dynamic(() => import('@/components/LessonViewerModern'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

interface APILesson {
  id: string
  levelId: string
  moduleId: string
  moduleName: string
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
  duration: string
  order: number
  videoUrl: string
  videoEmbedUrl: string
  videos: string[]
  images: string[]
  content: string
  locked: boolean
  pdfUrl?: string
}

export default function NivelPage() {
  const params = useParams()
  const levelId = params.id as string
  const { user, isTeacher, isAdmin } = useAuth()

  // Debug: mostrar info del usuario en consola (solo en desarrollo)
  useEffect(() => {
    logger.debug('[Nivel] Usuario:', user?.name, 'Role:', user?.role, 'isTeacher:', isTeacher, 'isAdmin:', isAdmin)
  }, [user, isTeacher, isAdmin])

  const [activeTab, setActiveTab] = useState<'lessons' | 'kit' | 'calendar' | 'ai' | 'simulators' | 'tasks'>('lessons')
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [apiLessons, setApiLessons] = useState<APILesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [yearPlan, setYearPlan] = useState<{month: string, topic: string, project: string}[]>([])
  const [yearPlanLoading, setYearPlanLoading] = useState(true)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [dynamicLevel, setDynamicLevel] = useState<any>(null)
  const [levelLoading, setLevelLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<'robotica' | 'ia' | 'hacking'>('robotica')

  // Buscar primero en constantes, luego en Airtable
  const staticLevel = EDUCATION_LEVELS.find(l => l.id === levelId)
  const level = staticLevel || dynamicLevel
  const content = LEVEL_CONTENT[levelId]
  const availableSimulators = SIMULATORS.filter(s => s.levels.includes(levelId))
  const courseData = ALL_COURSES[levelId] || ALL_COURSES['inicial-1']
  const progress = calculateProgress(courseData.modules)

  // Cargar nivel desde Airtable si no existe en constantes
  useEffect(() => {
    async function loadLevel() {
      if (staticLevel) {
        setLevelLoading(false)
        return
      }
      setLevelLoading(true)
      try {
        const response = await fetch('/api/admin/levels')
        if (response.ok) {
          const data = await response.json()
          if (data.levels) {
            const found = data.levels.find((l: any) => l.id === levelId)
            if (found) {
              setDynamicLevel({
                id: found.id,
                name: found.name,
                fullName: found.fullName || found.name,
                ageRange: found.ageRange || '',
                icon: found.icon || '📚',
                category: found.category || 'elemental',
                color: found.color || 'from-blue-500 to-cyan-600',
                neonColor: found.neonColor || '#00d4ff',
                kitPrice: found.kitPrice || 50,
                hasHacking: found.hasHacking || false,
                hasAdvancedIA: found.hasAdvancedIA || false
              })
            }
          }
        }
      } catch (error) {
        console.error('Error loading level:', error)
      }
      setLevelLoading(false)
    }
    loadLevel()
  }, [levelId, staticLevel])

  // Cargar lecciones desde API según programa seleccionado
  useEffect(() => {
    async function loadLessons() {
      logger.debug('Cargando lecciones para:', { levelId, selectedProgram })
      setLessonsLoading(true)
      setApiLessons([])
      try {
        const url = `/api/lessons?levelId=${levelId}&programId=${selectedProgram}&nocache=1`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          logger.debug('Lecciones cargadas:', data.length)
          if (Array.isArray(data) && data.length > 0) {
            setApiLessons(data)
          }
        } else {
          logger.debug('Error en respuesta:', response.status)
        }
      } catch (error) {
        logger.debug('Error cargando lecciones:', error)
      }
      setLessonsLoading(false)
    }
    loadLessons()
  }, [levelId, selectedProgram])

  // Cargar plan del año desde API (filtrado por programa seleccionado)
  useEffect(() => {
    async function loadYearPlan() {
      setYearPlanLoading(true)
      try {
        const response = await fetch(`/api/year-plans?levelId=${levelId}&programId=${selectedProgram}`)
        if (response.ok) {
          const data = await response.json()
          const plans = Array.isArray(data.plans) ? data.plans : []
          if (plans.length > 0) {
            setYearPlan(plans)
          } else {
            // Fallback a datos locales si no hay datos cargados para este nivel/programa
            setYearPlan(courseData.yearPlan || [])
          }
        } else {
          setYearPlan(courseData.yearPlan || [])
        }
      } catch (error) {
        console.log('Using local year plan data')
        setYearPlan(courseData.yearPlan || [])
      }
      setYearPlanLoading(false)
    }
    loadYearPlan()
  }, [levelId, selectedProgram, courseData.yearPlan])

  // Agrupar lecciones de API por módulo
  const groupedApiLessons = apiLessons.reduce((acc, lesson) => {
    const key = lesson.moduleName || 'Módulo 1'
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {} as Record<string, APILesson[]>)

  // Encontrar la lección seleccionada
  const currentLesson = apiLessons.find(l => l.id === selectedLesson)

  // Navegación entre lecciones
  const currentLessonIndex = apiLessons.findIndex(l => l.id === selectedLesson)
  const handleNextLesson = () => {
    if (currentLessonIndex < apiLessons.length - 1) {
      setSelectedLesson(apiLessons[currentLessonIndex + 1].id)
    }
  }
  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setSelectedLesson(apiLessons[currentLessonIndex - 1].id)
    }
  }

  if (levelLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-chaski-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Cargando nivel...</p>
        </div>
      </div>
    )
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-white mb-4">Nivel no encontrado</h1>
          <Link href="/niveles" className="btn-primary active:scale-[0.98] transition-all">
            Ver todos los niveles
          </Link>
        </div>
      </div>
    )
  }

  // Helper para obtener icono de tipo de lección
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'activity': return <Zap className="w-4 h-4" />
      case 'tutorial': return <FileText className="w-4 h-4" />
      case 'project': return <Package className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <CourseAuthGuard levelId={levelId} levelName={level.name}>
      <div className="min-h-screen bg-chaski-dark flex animate-fade-in">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-[#0a0f1a] backdrop-blur-sm border-r border-white/10 transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Header del Sidebar */}
          <div className="p-4 border-b border-white/10">
            <Link href="/niveles" className="flex items-center gap-2 text-slate-400 hover:text-hack-green mb-4 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Volver a niveles
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{level.icon}</div>
              <div>
                <h2 className="font-bold text-white">{level.name}</h2>
                <p className="text-xs text-slate-500">{level.ageRange}</p>
              </div>
            </div>
          </div>

          {/* Navegación del Sidebar */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('lessons')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] ${activeTab === 'lessons' ? 'bg-hack-green/10 text-hack-green border border-hack-green/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Lecciones</span>
              </button>
              <button
                onClick={() => setActiveTab('kit')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] ${activeTab === 'kit' ? 'bg-chaski-primary/10 text-chaski-primary border border-chaski-primary/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Package className="w-5 h-5" />
                <span>Mi Kit</span>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] ${activeTab === 'calendar' ? 'bg-chaski-gold/10 text-chaski-gold border border-chaski-gold/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Calendar className="w-5 h-5" />
                <span>Plan del Año</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] ${activeTab === 'ai' ? 'bg-chaski-accent/10 text-chaski-accent border border-chaski-accent/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Brain className="w-5 h-5" />
                <span>IA en Vivo</span>
              </button>
              <button
                onClick={() => setActiveTab('simulators')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] ${activeTab === 'simulators' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Cpu className="w-5 h-5" />
                <span>Simuladores</span>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] ${activeTab === 'tasks' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <FileText className="w-5 h-5" />
                <span>Tareas</span>
              </button>
            </div>

            {/* Progreso */}
            <div className="mt-6 p-3 bg-white/[0.03] rounded-lg border border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Progreso</span>
                <span className="text-hack-green">{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-hack-green to-emerald-400 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Opciones de Profesor */}
            {isTeacher && (
              <div className="mt-6 pt-4 border-t border-white/10 animate-fade-in">
                <p className="text-xs text-slate-500 mb-2 px-1">Herramientas del Profesor</p>
                <Link
                  href={`/admin/entregas?levelId=${levelId}`}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Ver Entregas</span>
                  <span className="ml-auto text-xs bg-purple-500/30 px-1.5 py-0.5 rounded">Nuevo</span>
                </Link>
                <Link
                  href={`/admin/calificaciones?levelId=${levelId}`}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] text-green-400 hover:bg-green-500/10 mt-1"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Calificaciones</span>
                </Link>
                <Link
                  href={`/admin/tareas?levelId=${levelId}`}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] text-slate-600 hover:bg-slate-100 mt-1"
                >
                  <Settings className="w-5 h-5" />
                  <span>Gestionar Tareas</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#0a0f1a]/80 backdrop-blur border-b border-white/10 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors active:scale-[0.98]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold">{courseData.title}</h1>
            <p className="text-xs text-slate-500">{courseData.description}</p>
          </div>
          <Link href="/" className="p-2 text-slate-400 hover:text-hack-green transition-colors active:scale-[0.98]">
            <Home className="w-5 h-5" />
          </Link>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-chaski-dark">
          {/* Lecciones Tab */}
          {activeTab === 'lessons' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="lessons">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-hack-green/10 border border-hack-green/30 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-hack-green" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Lecciones del Curso</h2>
                  <p className="text-slate-400">
                    {apiLessons.length > 0 ? `${apiLessons.length} lecciones` : `${courseData.totalLessons} lecciones`} • {courseData.duration}
                  </p>
                </div>
              </div>

              {/* Selector de Programa - Diseño mejorado */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <button
                  onClick={() => setSelectedProgram('robotica')}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl font-medium transition-all duration-300 overflow-hidden active:scale-[0.98] ${
                    selectedProgram === 'robotica'
                      ? 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 text-white border border-cyan-500/40 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                      : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedProgram === 'robotica' ? 'bg-cyan-500/20' : 'bg-blue-500/10'
                  }`}>
                    <Bot className={`w-6 h-6 ${selectedProgram === 'robotica' ? 'text-cyan-400' : 'text-blue-400'}`} />
                  </div>
                  <span className="font-semibold">Robótica</span>
                  <span className={`text-xs ${selectedProgram === 'robotica' ? 'text-cyan-300' : 'text-slate-500'}`}>
                    Construye y programa
                  </span>
                  {selectedProgram === 'robotica' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedProgram('ia')}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl font-medium transition-all duration-300 overflow-hidden active:scale-[0.98] ${
                    selectedProgram === 'ia'
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-600/20 text-white border border-purple-500/40 shadow-lg shadow-purple-500/10 scale-[1.02]'
                      : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedProgram === 'ia' ? 'bg-purple-500/20' : 'bg-purple-500/10'
                  }`}>
                    <Brain className={`w-6 h-6 ${selectedProgram === 'ia' ? 'text-purple-400' : 'text-purple-400/60'}`} />
                  </div>
                  <span className="font-semibold">Inteligencia Artificial</span>
                  <span className={`text-xs ${selectedProgram === 'ia' ? 'text-purple-300' : 'text-slate-500'}`}>
                    Machine Learning
                  </span>
                  {selectedProgram === 'ia' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedProgram('hacking')}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl font-medium transition-all duration-300 overflow-hidden active:scale-[0.98] ${
                    selectedProgram === 'hacking'
                      ? 'bg-gradient-to-br from-hack-green/20 to-emerald-600/20 text-white border border-hack-green/40 shadow-lg shadow-hack-green/10 scale-[1.02]'
                      : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedProgram === 'hacking' ? 'bg-hack-green/20' : 'bg-hack-green/10'
                  }`}>
                    <Shield className={`w-6 h-6 ${selectedProgram === 'hacking' ? 'text-hack-green' : 'text-hack-green/60'}`} />
                  </div>
                  <span className="font-semibold">Ciberseguridad</span>
                  <span className={`text-xs ${selectedProgram === 'hacking' ? 'text-hack-green/80' : 'text-slate-500'}`}>
                    Hacking Ético
                  </span>
                  {selectedProgram === 'hacking' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-hack-green rounded-full animate-pulse" />
                  )}
                </button>
              </div>

              {/* Estadísticas del programa seleccionado */}
              {apiLessons.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/[0.03] rounded-xl border border-white/10 animate-fade-in">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{apiLessons.length}</p>
                    <p className="text-xs text-slate-500">Lecciones</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-2xl font-bold text-white">{Object.keys(groupedApiLessons).length}</p>
                    <p className="text-xs text-slate-500">Módulos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {Math.round(apiLessons.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0) / 60)}h
                    </p>
                    <p className="text-xs text-slate-500">Duración</p>
                  </div>
                </div>
              )}

              {/* Módulos y Lecciones - Usar API si hay datos, sino usar locales */}
              {lessonsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hack-green"></div>
                  <p className="text-slate-400 animate-pulse">Cargando lecciones...</p>
                </div>
              ) : apiLessons.length > 0 ? (
                /* Lecciones desde API (Airtable) - Nueva interfaz mejorada */
                <div className="space-y-4">
                  {Object.entries(groupedApiLessons).map(([moduleName, lessons], modIdx) => (
                    <div key={moduleName} className="animate-slide-up" style={{ animationDelay: `${modIdx * 0.05}s` }}>
                      <ModuleAccordion
                        moduleName={moduleName}
                        lessons={lessons}
                        moduleIndex={modIdx + 1}
                        selectedLesson={selectedLesson}
                        onSelectLesson={setSelectedLesson}
                        defaultOpen={modIdx === 0}
                        programColor={selectedProgram === 'robotica' ? 'blue' : selectedProgram === 'ia' ? 'purple' : 'green'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Lecciones locales (fallback) */
                <div className="space-y-4">
                  {courseData.modules.map((module, modIdx) => (
                    <div key={module.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 animate-slide-up" style={{ animationDelay: `${modIdx * 0.05}s` }}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-hack-green/10 border border-hack-green/30 rounded-lg flex items-center justify-center text-hack-green font-bold">
                          {modIdx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{module.title}</h3>
                          <p className="text-sm text-slate-500">{module.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-14">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => !lesson.locked && setSelectedLesson(lesson.id)}
                            disabled={lesson.locked}
                            className={`group w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all active:scale-[0.98] ${
                              lesson.locked
                                ? 'bg-white/[0.02] text-slate-600 cursor-not-allowed'
                                : selectedLesson === lesson.id
                                  ? 'bg-hack-green/10 border border-hack-green/30 text-white'
                                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                              lesson.completed ? 'bg-hack-green/20 text-hack-green' :
                              lesson.locked ? 'bg-white/5 text-slate-600' :
                              'bg-white/5 text-slate-400'
                            }`}>
                              {lesson.completed ? <CheckCircle className="w-4 h-4" /> :
                               lesson.locked ? <Lock className="w-4 h-4" /> :
                               getLessonIcon(lesson.type)}
                            </div>
                            <div className="flex-1">
                              <p className={lesson.locked ? 'text-slate-600' : 'text-white/90'}>{lesson.title}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {lesson.duration}
                                <span className="capitalize">• {lesson.type}</span>
                              </div>
                            </div>
                            {!lesson.locked && <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kit Tab - Datos desde la base de datos */}
          {activeTab === 'kit' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="kit">
              <KitDisplay levelId={levelId} />
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="calendar">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-chaski-gold/10 border border-chaski-gold/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-chaski-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Plan del Año Escolar</h2>
                  <p className="text-slate-400">Lo que aprenderás mes a mes</p>
                </div>
              </div>

              {yearPlanLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-chaski-gold"></div>
                </div>
              ) : yearPlan.length > 0 ? (
                <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Mes</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Tema</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Proyecto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearPlan.map((plan, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                            <td className="py-3 px-4">
                              <span className="text-chaski-gold font-semibold">{plan.month}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-300">{plan.topic}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-chaski-primary/10 text-chaski-primary text-sm rounded-lg border border-chaski-primary/20">
                                {plan.project}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.03] border border-white/10 rounded-xl text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No hay plan del año configurado para este nivel</p>
                  <p className="text-slate-500 text-sm mt-1">Agrega el plan en la tabla year_plans de Airtable</p>
                </div>
              )}
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="ai">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-chaski-accent/10 border border-chaski-accent/30 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-chaski-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Inteligencia Artificial</h2>
                  <p className="text-slate-400">Aprende IA de forma interactiva</p>
                </div>
              </div>
              <AILab />
            </div>
          )}

          {/* Simulators Tab */}
          {activeTab === 'simulators' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="simulators">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Simuladores Online</h2>
                  <p className="text-slate-400">Practica programación y electrónica</p>
                </div>
              </div>
              <SimulatorTabsDynamic levelId={levelId} programId={selectedProgram} />
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="tasks">
              <TasksPanel levelId={levelId} studentName={user?.name || ''} studentEmail={user?.email || ''} />
            </div>
          )}
        </div>
        </main>
      </div>

      {/* Modal de Lección con Video */}
      {selectedLesson && (() => {
        const lesson = apiLessons.find(l => l.id === selectedLesson) ||
                       courseData.modules.flatMap(m => m.lessons).find(l => l.id === selectedLesson)
        if (!lesson) return null
        const videoUrl = 'videoEmbedUrl' in lesson ? lesson.videoEmbedUrl : lesson.videoUrl
        return (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedLesson(null)}
          >
            <div
              className="bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-purple/20 rounded-lg flex items-center justify-center">
                    <Play className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{lesson.title}</h3>
                    <p className="text-sm text-slate-600">{lesson.duration} • {lesson.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors active:scale-[0.98]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Video */}
                {videoUrl && (
                  <div className="aspect-video bg-white rounded-xl overflow-hidden">
                    <iframe
                      src={videoUrl}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {/* Galería de imágenes */}
                {'images' in lesson && Array.isArray(lesson.images) && lesson.images.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-3">📷 Galería ({lesson.images.length} {lesson.images.length === 1 ? 'imagen' : 'imágenes'})</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {lesson.images.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-40 h-28 bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-purple transition-all animate-scale-in"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                          onClick={() => setZoomImage(img)}
                        >
                          <img
                            src={img}
                            alt={`Imagen ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder.png'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {'content' in lesson && lesson.content && (
                  <div className="bg-slate-100/50 rounded-xl p-4">
                    <p className="text-slate-700 whitespace-pre-line">{lesson.content}</p>
                  </div>
                )}

                {/* Botón de PDF */}
                {'pdfUrl' in lesson && lesson.pdfUrl && (
                  <div className="flex items-center gap-3 p-4 bg-slate-100/50 rounded-xl">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">Documento PDF</p>
                      <p className="text-sm text-slate-600">Material de apoyo para esta lección</p>
                    </div>
                    <a
                      href={lesson.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center gap-2 transition-colors active:scale-[0.98]"
                    >
                      <FileText className="w-4 h-4" />
                      Ver PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modal de Lección Detallada */}
      {currentLesson && selectedLesson && (
        <LessonViewerModern
          lesson={{
            id: currentLesson.id,
            title: currentLesson.title,
            moduleName: currentLesson.moduleName,
            type: currentLesson.type,
            duration: currentLesson.duration,
            content: currentLesson.content,
            videoUrl: currentLesson.videoUrl,
            images: currentLesson.images,
            pdfUrl: (currentLesson as any).pdfUrl
          }}
          programId={selectedProgram}
          onClose={() => setSelectedLesson(null)}
          onNext={handleNextLesson}
          onPrev={handlePrevLesson}
          totalLessons={apiLessons.length}
          currentIndex={apiLessons.findIndex(l => l.id === currentLesson.id)}
        />
      )}

      {/* Modal de Zoom para Imágenes */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-hack-green p-2 z-10 active:scale-[0.98] transition-all"
            onClick={() => setZoomImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={zoomImage}
            alt="Imagen ampliada"
            className="max-w-full max-h-[90vh] object-contain rounded-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </CourseAuthGuard>
  )
}
