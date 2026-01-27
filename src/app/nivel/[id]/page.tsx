'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EDUCATION_LEVELS, LEVEL_CONTENT, SIMULATORS } from '@/lib/constants'
import { ALL_COURSES, calculateProgress, Module, Lesson, AssemblyStep, YearPlanItem } from '@/data/courses'
import { 
  Bot, Brain, Shield, Play, BookOpen, Wrench, ArrowLeft, 
  ChevronRight, CheckCircle, Lock, Clock, Package, 
  Calendar, Video, FileText, Zap, Home, Settings,
  GraduationCap, Cpu, Menu, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import AIModule from '@/components/AIModule'
import AIActivities from '@/components/AIActivities'
import SimulatorTabs from '@/components/SimulatorTabs'
import KitDisplay from '@/components/KitDisplay'
import CourseAuthGuard from '@/components/CourseAuthGuard'
import TasksPanel from '@/components/TasksPanel'
import { useAuth } from '@/components/AuthProvider'

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
}

export default function NivelPage() {
  const params = useParams()
  const levelId = params.id as string
  const { user } = useAuth()
  const isTeacher = user?.role === 'admin' || user?.role === 'teacher'
  const [activeTab, setActiveTab] = useState<'lessons' | 'kit' | 'calendar' | 'ai' | 'simulators' | 'tasks'>('lessons')
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [apiLessons, setApiLessons] = useState<APILesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [yearPlan, setYearPlan] = useState<{month: string, topic: string, project: string}[]>([])
  const [yearPlanLoading, setYearPlanLoading] = useState(true)
  const [zoomImage, setZoomImage] = useState<string | null>(null)

  const level = EDUCATION_LEVELS.find(l => l.id === levelId)
  const content = LEVEL_CONTENT[levelId]
  const availableSimulators = SIMULATORS.filter(s => s.levels.includes(levelId))
  const courseData = ALL_COURSES[levelId] || ALL_COURSES['inicial-1']
  const progress = calculateProgress(courseData.modules)

  // Cargar lecciones desde API
  useEffect(() => {
    async function loadLessons() {
      setLessonsLoading(true)
      try {
        const response = await fetch(`/api/lessons?levelId=${levelId}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setApiLessons(data)
          }
        }
      } catch (error) {
        console.log('Using local lessons data')
      }
      setLessonsLoading(false)
    }
    loadLessons()
  }, [levelId])

  // Cargar plan del año desde API
  useEffect(() => {
    async function loadYearPlan() {
      setYearPlanLoading(true)
      try {
        const response = await fetch(`/api/year-plans?levelId=${levelId}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setYearPlan(data)
          } else {
            // Fallback a datos locales si no hay datos en Airtable
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
  }, [levelId, courseData.yearPlan])

  // Agrupar lecciones de API por módulo
  const groupedApiLessons = apiLessons.reduce((acc, lesson) => {
    const key = lesson.moduleName || 'Módulo 1'
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {} as Record<string, APILesson[]>)

  if (!level) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Nivel no encontrado</h1>
          <Link href="/niveles" className="btn-primary">
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
      <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-dark-800 border-r border-dark-600 transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Header del Sidebar */}
          <div className="p-4 border-b border-dark-600">
            <Link href="/niveles" className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Volver a niveles
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{level.icon}</div>
              <div>
                <h2 className="font-bold text-white">{level.name}</h2>
                <p className="text-xs text-gray-500">{level.ageRange}</p>
              </div>
            </div>
          </div>

          {/* Navegación del Sidebar */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('lessons')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === 'lessons' ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30' : 'text-gray-400 hover:bg-dark-700'}`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Lecciones</span>
              </button>
              <button
                onClick={() => setActiveTab('kit')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === 'kit' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30' : 'text-gray-400 hover:bg-dark-700'}`}
              >
                <Package className="w-5 h-5" />
                <span>Mi Kit</span>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === 'calendar' ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : 'text-gray-400 hover:bg-dark-700'}`}
              >
                <Calendar className="w-5 h-5" />
                <span>Plan del Año</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === 'ai' ? 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30' : 'text-gray-400 hover:bg-dark-700'}`}
              >
                <Brain className="w-5 h-5" />
                <span>IA en Vivo</span>
              </button>
              <button
                onClick={() => setActiveTab('simulators')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === 'simulators' ? 'bg-neon-orange/10 text-neon-orange border border-neon-orange/30' : 'text-gray-400 hover:bg-dark-700'}`}
              >
                <Cpu className="w-5 h-5" />
                <span>Simuladores</span>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeTab === 'tasks' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:bg-dark-700'}`}
              >
                <FileText className="w-5 h-5" />
                <span>Tareas</span>
              </button>
            </div>

            {/* Progreso */}
            <div className="mt-6 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progreso</span>
                <span className="text-neon-cyan">{progress}%</span>
              </div>
              <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Opciones de Profesor */}
            {isTeacher && (
              <div className="mt-6 pt-4 border-t border-dark-600">
                <p className="text-xs text-gray-500 mb-2 px-1">Herramientas del Profesor</p>
                <Link
                  href="/admin/entregas"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Ver Entregas</span>
                  <span className="ml-auto text-xs bg-purple-500/30 px-1.5 py-0.5 rounded">Nuevo</span>
                </Link>
                <Link
                  href="/admin/calificaciones"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-green-400 hover:bg-green-500/10 mt-1"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Calificaciones</span>
                </Link>
                <Link
                  href="/admin/tareas"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-gray-400 hover:bg-dark-700 mt-1"
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
        <header className="h-14 bg-dark-800/80 backdrop-blur border-b border-dark-600 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold">{courseData.title}</h1>
            <p className="text-xs text-gray-500">{courseData.description}</p>
          </div>
          <Link href="/" className="p-2 text-gray-400 hover:text-neon-cyan transition-colors">
            <Home className="w-5 h-5" />
          </Link>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Lecciones Tab */}
          {activeTab === 'lessons' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Lecciones del Curso</h2>
                  <p className="text-gray-400">
                    {apiLessons.length > 0 ? `${apiLessons.length} lecciones` : `${courseData.totalLessons} lecciones`} • {courseData.duration}
                  </p>
                </div>
              </div>

              {/* Mostrar lección seleccionada con video embebido */}
              {selectedLesson && (
                <div className="mb-6 card">
                  {(() => {
                    const lesson = apiLessons.find(l => l.id === selectedLesson) || 
                                   courseData.modules.flatMap(m => m.lessons).find(l => l.id === selectedLesson)
                    if (!lesson) return null
                    const videoUrl = 'videoEmbedUrl' in lesson ? lesson.videoEmbedUrl : lesson.videoUrl
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                          <button 
                            onClick={() => setSelectedLesson(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        {videoUrl && (
                          <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden mb-4">
                            <iframe
                              src={videoUrl}
                              className="w-full h-full"
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                        {'images' in lesson && Array.isArray(lesson.images) && lesson.images.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-2">📷 Galería ({lesson.images.length} {lesson.images.length === 1 ? 'imagen' : 'imágenes'})</p>
                            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800">
                              {lesson.images.map((img: string, idx: number) => {
                                const proxyUrl = img.includes('drive.google.com') 
                                  ? `/api/image-proxy?url=${encodeURIComponent(img)}`
                                  : img
                                return (
                                  <div 
                                    key={idx} 
                                    className="flex-shrink-0 w-48 h-36 bg-dark-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-neon-cyan transition-all"
                                    onClick={() => setZoomImage(proxyUrl)}
                                  >
                                    <img 
                                      src={proxyUrl} 
                                      alt={`Imagen ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/placeholder.png'
                                      }}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {'content' in lesson && lesson.content && (
                          <p className="text-gray-300">{lesson.content}</p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Módulos y Lecciones - Usar API si hay datos, sino usar locales */}
              {lessonsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
                </div>
              ) : apiLessons.length > 0 ? (
                /* Lecciones desde API (Airtable) */
                <div className="space-y-4">
                  {Object.entries(groupedApiLessons).map(([moduleName, lessons], modIdx) => (
                    <div key={moduleName} className="card">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-neon-cyan/10 rounded-lg flex items-center justify-center text-neon-cyan font-bold">
                          {modIdx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{moduleName}</h3>
                          <p className="text-sm text-gray-500">{lessons.length} lecciones</p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-14">
                        {lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => !lesson.locked && setSelectedLesson(lesson.id)}
                            disabled={lesson.locked}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                              lesson.locked 
                                ? 'bg-dark-700/30 text-gray-600 cursor-not-allowed' 
                                : selectedLesson === lesson.id
                                  ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white'
                                  : 'bg-dark-700/50 text-gray-300 hover:bg-dark-600'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              lesson.locked ? 'bg-dark-600 text-gray-600' : 'bg-dark-600 text-gray-400'
                            }`}>
                              {lesson.locked ? <Lock className="w-4 h-4" /> : getLessonIcon(lesson.type)}
                            </div>
                            <div className="flex-1">
                              <p className={lesson.locked ? 'text-gray-600' : 'text-white'}>{lesson.title}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {lesson.duration}
                                <span className="capitalize">• {lesson.type}</span>
                              </div>
                            </div>
                            {!lesson.locked && <ChevronRight className="w-4 h-4 text-gray-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Lecciones locales (fallback) */
                <div className="space-y-4">
                  {courseData.modules.map((module, modIdx) => (
                    <div key={module.id} className="card">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-neon-cyan/10 rounded-lg flex items-center justify-center text-neon-cyan font-bold">
                          {modIdx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{module.title}</h3>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-14">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => !lesson.locked && setSelectedLesson(lesson.id)}
                            disabled={lesson.locked}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                              lesson.locked 
                                ? 'bg-dark-700/30 text-gray-600 cursor-not-allowed' 
                                : selectedLesson === lesson.id
                                  ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white'
                                  : 'bg-dark-700/50 text-gray-300 hover:bg-dark-600'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              lesson.completed ? 'bg-neon-green/20 text-neon-green' :
                              lesson.locked ? 'bg-dark-600 text-gray-600' :
                              'bg-dark-600 text-gray-400'
                            }`}>
                              {lesson.completed ? <CheckCircle className="w-4 h-4" /> :
                               lesson.locked ? <Lock className="w-4 h-4" /> :
                               getLessonIcon(lesson.type)}
                            </div>
                            <div className="flex-1">
                              <p className={lesson.locked ? 'text-gray-600' : 'text-white'}>{lesson.title}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {lesson.duration}
                                <span className="capitalize">• {lesson.type}</span>
                              </div>
                            </div>
                            {!lesson.locked && <ChevronRight className="w-4 h-4 text-gray-500" />}
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
            <div className="max-w-4xl mx-auto">
              <KitDisplay levelId={levelId} />
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neon-green/10 border border-neon-green/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Plan del Año Escolar</h2>
                  <p className="text-gray-400">Lo que aprenderás mes a mes</p>
                </div>
              </div>

              {yearPlanLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-green"></div>
                </div>
              ) : yearPlan.length > 0 ? (
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-600">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Mes</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Tema</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Proyecto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearPlan.map((plan, idx) => (
                          <tr key={idx} className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                            <td className="py-3 px-4">
                              <span className="text-neon-green font-semibold">{plan.month}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{plan.topic}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-neon-purple/10 text-neon-purple text-sm rounded-lg">
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
                <div className="card text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No hay plan del año configurado para este nivel</p>
                  <p className="text-gray-500 text-sm mt-1">Agrega el plan en la tabla year_plans de Airtable</p>
                </div>
              )}
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neon-pink/10 border border-neon-pink/30 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-neon-pink" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Inteligencia Artificial</h2>
                  <p className="text-gray-400">Aprende IA de forma interactiva</p>
                </div>
              </div>
              <AIActivities levelId={levelId} />
            </div>
          )}

          {/* Simulators Tab */}
          {activeTab === 'simulators' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neon-orange/10 border border-neon-orange/30 rounded-xl flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-neon-orange" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Simuladores Online</h2>
                  <p className="text-gray-400">Practica programación y electrónica</p>
                </div>
              </div>
              <SimulatorTabs />
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="max-w-4xl mx-auto">
              <TasksPanel levelId={levelId} studentName={user?.name || ''} studentEmail={user?.email || ''} />
            </div>
          )}
        </div>
        </main>
      </div>

      {/* Modal de Zoom para Imágenes */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-neon-cyan p-2"
            onClick={() => setZoomImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={zoomImage} 
            alt="Imagen ampliada"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </CourseAuthGuard>
  )
}
