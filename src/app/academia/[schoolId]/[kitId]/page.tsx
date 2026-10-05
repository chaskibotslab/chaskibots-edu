'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/AuthProvider'
import CourseAuthGuard from '@/components/CourseAuthGuard'
import {
  ArrowLeft, Printer, Loader2, AlertCircle, BookOpen, Package, Calendar,
  Brain, Cpu, FileText, Menu, X, Home, GraduationCap, Settings,
} from 'lucide-react'
import KitFichaContent, { KitFichaDetalle, KitHeaderMateriales } from '@/components/KitFichaContent'
import LeccionesProyectos from '@/components/LeccionesProyectos'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-chaski-primary" />
    <span className="ml-2 text-slate-400">Cargando...</span>
  </div>
)

const AILab = dynamic(() => import('@/components/AILab'), { loading: () => <LoadingSpinner />, ssr: false })
const SimulatorTabsDynamic = dynamic(() => import('@/components/SimulatorTabsDynamic'), { loading: () => <LoadingSpinner />, ssr: false })
const TasksPanel = dynamic(() => import('@/components/TasksPanel'), { loading: () => <LoadingSpinner />, ssr: false })

type Tab = 'lessons' | 'kit' | 'calendar' | 'ai' | 'simulators' | 'tasks'

function AcademiaKitPageInner({ kitId }: { kitId: string }) {
  const { user, isTeacher } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('lessons')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [kit, setKit] = useState<KitFichaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/academia/kit/${kitId}`)
        const data = await res.json()
        if (cancelled) return
        if (!data.success) setError(data.error || 'No se pudo cargar el curso')
        else setKit(data.kit)
      } catch {
        if (!cancelled) setError('Error de conexion')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [kitId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
      </div>
    )
  }

  if (error || !kit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold">{error || 'Curso no encontrado'}</p>
          <Link href="/niveles" className="inline-block mt-4 text-chaski-primary font-medium">Volver a niveles</Link>
        </div>
      </div>
    )
  }

  const levelId = kit.levelId

  return (
    <div className="min-h-screen bg-slate-50 flex animate-fade-in">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-chaski-dark border-r border-white/10 transition-all duration-300 overflow-hidden flex-shrink-0 relative`}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(229,115,97,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(229,115,97,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative h-full flex flex-col">
          <div className="p-4 border-b border-white/10">
            <Link href="/niveles" className="flex items-center gap-2 text-white/40 hover:text-chaski-primary mb-4 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Volver a niveles
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏫</div>
              <div className="min-w-0">
                <h2 className="font-bold text-white truncate">{kit.name}</h2>
                <p className="text-xs text-white/40 truncate">{kit.schoolName}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-0.5">
              {([
                { id: 'lessons', label: 'Lecciones', icon: BookOpen },
                { id: 'kit', label: 'Mi Kit', icon: Package },
                { id: 'calendar', label: 'Plan del Año', icon: Calendar },
                { id: 'ai', label: 'IA en Vivo', icon: Brain },
                { id: 'simulators', label: 'Simuladores', icon: Cpu },
                { id: 'tasks', label: 'Tareas', icon: FileText },
              ] as const).map(tab => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-all duration-150 active:scale-[0.98] ${
                      active ? 'bg-chaski-primary/10 text-chaski-primary' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-chaski-primary rounded-full shadow-glow" />}
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-chaski-primary' : 'text-white/30 group-hover:text-white/60'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Link
                href={`/academia/${kit.schoolId}/${kit.id}/imprimir`}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-all active:scale-[0.98] text-white/60 hover:bg-white/5 hover:text-white"
              >
                <Printer className="w-[18px] h-[18px] text-white/30" />
                <span>Ficha para imprimir</span>
              </Link>
            </div>

            {isTeacher && (
              <div className="mt-6 pt-4 border-t border-white/10 animate-fade-in">
                <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">Herramientas del Profesor</p>
                <Link href={`/admin/entregas?levelId=${levelId}`} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-all active:scale-[0.98] text-white/60 hover:bg-white/5 hover:text-white">
                  <GraduationCap className="w-[18px] h-[18px] text-white/30" />
                  <span>Ver Entregas</span>
                </Link>
                <Link href={`/admin/calificaciones?levelId=${levelId}`} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-all active:scale-[0.98] text-white/60 hover:bg-white/5 hover:text-white mt-0.5">
                  <GraduationCap className="w-[18px] h-[18px] text-white/30" />
                  <span>Calificaciones</span>
                </Link>
                <Link href={`/admin/tareas?levelId=${levelId}`} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-all active:scale-[0.98] text-white/60 hover:bg-white/5 hover:text-white mt-0.5">
                  <Settings className="w-[18px] h-[18px] text-white/30" />
                  <span>Gestionar Tareas</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-40 h-14 bg-chaski-dark border-b border-white/10 flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 transition-colors active:scale-[0.98]">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold truncate">{kit.name}</h1>
            <p className="text-xs text-white/40 truncate">{kit.schoolName} — Kit ${kit.price}</p>
          </div>
          <Link href="/" className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-chaski-primary transition-colors active:scale-[0.98]">
            <Home className="w-5 h-5" />
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'lessons' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="lessons">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-chaski-primary/10 border border-chaski-primary/30 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-chaski-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-chaski-dark">Proyectos del curso</h2>
                  <p className="text-slate-500">Proyecto principal + {kit.proyectos.length - 1} adicionales</p>
                </div>
              </div>
              <LeccionesProyectos proyectos={kit.proyectos} />
            </div>
          )}

          {activeTab === 'kit' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="kit">
              <KitHeaderMateriales kit={kit} />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="max-w-4xl mx-auto animate-slide-up text-center py-16" key="calendar">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Este curso de Academia todavía no tiene un plan del año propio.</p>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="ai">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-chaski-gold/10 border border-chaski-gold/30 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-chaski-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-chaski-dark">Inteligencia Artificial</h2>
                  <p className="text-slate-500">Aprende IA de forma interactiva</p>
                </div>
              </div>
              <AILab />
            </div>
          )}

          {activeTab === 'simulators' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="simulators">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-chaski-dark">Simuladores Online</h2>
                  <p className="text-slate-500">Practica programación y electrónica</p>
                </div>
              </div>
              <SimulatorTabsDynamic levelId={levelId} programId="robotica" />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="max-w-4xl mx-auto animate-slide-up" key="tasks">
              <TasksPanel levelId={levelId} studentName={user?.name || ''} studentEmail={user?.email || ''} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AcademiaKitPage() {
  const params = useParams<{ schoolId: string; kitId: string }>()
  const kitId = params?.kitId as string

  // CourseAuthGuard necesita el levelId para decidir el acceso -- lo
  // sacamos del propio kitId (ej. "kit-lv-octavo-egb" -> "octavo-egb")
  // de forma best-effort; si no calza, el guard igual deja pasar a
  // admin/teacher y pide clave a los demas, no rompe el flujo.
  const guessedLevelId = kitId?.replace(/^kit-(lv-)?/, '') || ''

  return (
    <CourseAuthGuard levelId={guessedLevelId} levelName="Curso de Academia">
      <AcademiaKitPageInner kitId={kitId} />
    </CourseAuthGuard>
  )
}
