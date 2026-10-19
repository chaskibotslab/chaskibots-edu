'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useDynamicLevels } from '@/hooks/useDynamicLevels'
import { ALL_COURSES } from '@/data/courses'
import {
  Users, BookOpen, Settings, LogOut, Home, Bell,
  Plus, Edit, Trash2, Eye, Lock, Unlock, Search,
  ChevronRight, Clock, Shield, GraduationCap,
  BarChart3, Activity, Key, Mail, Save, X, Package, Brain, FileText, Monitor, Zap, Award
} from 'lucide-react'

type AdminTab = 'dashboard' | 'logs'

// Lookup estático de clases Tailwind completas y literales por color —
// nunca interpolar `bg-${color}` en runtime, Tailwind JIT no lo compila.
type ColorKey = 'coral' | 'gold' | 'green' | 'slate'

const COLOR_STYLES: Record<ColorKey, { bg10: string; bg5: string; text: string; borderHover: string }> = {
  coral: { bg10: 'bg-chaski-primary/10', bg5: 'bg-chaski-primary/5', text: 'text-chaski-primary', borderHover: 'hover:border-chaski-primary/50' },
  gold: { bg10: 'bg-chaski-gold/10', bg5: 'bg-chaski-gold/5', text: 'text-chaski-gold', borderHover: 'hover:border-chaski-gold/50' },
  green: { bg10: 'bg-hack-green/10', bg5: 'bg-hack-green/5', text: 'text-hack-green', borderHover: 'hover:border-hack-green/50' },
  slate: { bg10: 'bg-slate-500/10', bg5: 'bg-slate-500/5', text: 'text-slate-600', borderHover: 'hover:border-slate-400/50' },
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: ColorKey
  trend?: string
}) {
  const c = COLOR_STYLES[color]
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg10} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
      <div className="relative flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${c.bg10} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        {trend && (
          <span className={`text-xs font-bold ${c.bg10} ${c.text} px-2 py-1 rounded-lg`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <p className={`text-sm font-medium ${c.text}`}>{label}</p>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  color,
  title,
  description
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: ColorKey
  title: string
  description: string
}) {
  const c = COLOR_STYLES[color]
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md ${c.borderHover} transition-all duration-300`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${c.bg5} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${c.bg10} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        <div>
          <h4 className="text-slate-900 font-semibold">{title}</h4>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, isAuthenticated, isLoading, logout, accessLogs } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: Object.keys(ALL_COURSES).length,
    totalLevels: EDUCATION_LEVELS.length,
    recentLogins: 0
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin')
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  // Cargar estadísticas reales de Airtable
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          const users = data.users || []
          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            recentLogins: accessLogs.filter((log: any) => log.action === 'login').length
          }))
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    if (isAdmin) {
      loadStats()
    }
  }, [isAdmin, accessLogs])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chaski-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'logs', label: 'Actividad', icon: Activity },
  ]

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="animate-slide-in-left">
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'logs' && 'Registro de Actividad'}
            </h1>
            <p className="text-sm text-slate-400">Resumen general de la plataforma</p>
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex gap-1 border-b border-slate-200 -mb-px overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-chaski-primary text-chaski-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.id === 'logs' && accessLogs.length > 0 && (
                  <span className="bg-chaski-primary/10 text-chaski-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {accessLogs.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main>
        <div className="p-6 animate-fade-in" key={activeTab}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Usuarios Totales"
                  value={stats.totalUsers}
                  icon={Users}
                  color="coral"
                  trend="+12%"
                />
                <StatCard
                  label="Cursos Activos"
                  value={stats.totalCourses}
                  icon={BookOpen}
                  color="gold"
                  trend="+2"
                />
                <StatCard
                  label="Niveles Educativos"
                  value={stats.totalLevels}
                  icon={GraduationCap}
                  color="slate"
                />
                <StatCard
                  label="Accesos Recientes"
                  value={stats.recentLogins}
                  icon={Activity}
                  color="green"
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-chaski-primary/10 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-chaski-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Actividad Reciente</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-sm font-medium text-chaski-primary hover:text-chaski-secondary transition-colors px-3 py-1.5 rounded-lg hover:bg-chaski-primary/10"
                  >
                    Ver todo
                  </button>
                </div>
                <div className="p-4">
                  {accessLogs.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No hay actividad reciente</p>
                  ) : (
                    <div className="space-y-2">
                      {accessLogs.slice(0, 5).map((log, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            log.action === 'login' ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}>
                            {log.action === 'login' ? (
                              <Unlock className="w-5 h-5 text-green-600" />
                            ) : (
                              <Lock className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-medium truncate">{log.name}</p>
                            <p className="text-slate-500 text-sm truncate">{log.email}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-medium ${log.action === 'login' ? 'text-green-600' : 'text-red-600'}`}>
                              {log.action === 'login' ? 'Inició sesión' : 'Cerró sesión'}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {new Date(log.timestamp).toLocaleString('es-EC')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-chaski-primary" />
                  Herramientas de administración
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-6 first:mt-0">Personas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <QuickAction href="/admin/estructura" icon={GraduationCap} color="coral" title="Estructura académica" description="Grupos de cada colegio, sus docentes y estudiantes" />
                  <QuickAction href="/admin/gestion" icon={Users} color="coral" title="Usuarios y códigos" description="Crear cuentas y entregar códigos de acceso" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-6 first:mt-0">Contenido para todos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <QuickAction href="/admin/lecciones" icon={BookOpen} color="coral" title="Lecciones generales por grado" description="Robótica, IA y Hacking. Las ve todo estudiante de ese grado, de cualquier colegio" />
                  <QuickAction href="/admin/gestion?tab=levels" icon={Settings} color="slate" title="Grados y módulos" description="Qué grados existen y si muestran IA y Ciberseguridad" />
                  <QuickAction href="/admin/simuladores" icon={Monitor} color="coral" title="Simuladores" description="Herramientas de práctica por grado y programa" />
                  <QuickAction href="/admin/ia" icon={Brain} color="green" title="Actividades de IA" description="Actividades de inteligencia artificial por grado" />
                  <QuickAction href="/admin/academy" icon={GraduationCap} color="gold" title="Cursos en línea" description="Python, Hacking e IA paso a paso, fuera de los grados" />
                  <QuickAction href="/admin/proyectos" icon={Activity} color="coral" title="Proyectos avanzados" description="Jetson, Raspberry Pi, Digispark" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-6 first:mt-0">Kits de los colegios</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <QuickAction href="/admin/academia" icon={BookOpen} color="coral" title="Proyectos del kit por colegio" description="Circuito, código y guía. Solo los ve ese colegio y grado, en Mi kit" />
                  <QuickAction href="/admin/kits" icon={Package} color="green" title="Kits y materiales" description="Piezas, placa, imágenes y precio de cada kit" />
                  <QuickAction href="/admin/colegios" icon={GraduationCap} color="slate" title="Colegios" description="Datos del colegio y qué cursos con kit tiene" />
                  <QuickAction href="/admin/cursos" icon={BookOpen} color="slate" title="Catálogo de cursos con kit" description="Lista de cursos (ej. 8vo EGB Academia) que luego se asignan a un colegio" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-6 first:mt-0">Evaluación</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <QuickAction href="/admin/tareas" icon={FileText} color="gold" title="Tareas" description="Crear y publicar tareas" />
                  <QuickAction href="/admin/calificar" icon={Award} color="gold" title="Entregas y calificación" description="Ver lo que entregaron los estudiantes y poner nota" />
                  <QuickAction href="/admin/calificaciones" icon={Award} color="slate" title="Libreta de notas" description="Notas de cada estudiante por grado" />
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-chaski-primary/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-chaski-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registro de Actividad</h3>
                  <p className="text-slate-400 text-sm">Historial de accesos al sistema</p>
                </div>
              </div>
              <div className="p-4">
                {accessLogs.length === 0 ? (
                  <p className="text-slate-500 text-center py-12">No hay registros de actividad</p>
                ) : (
                  <div className="space-y-2">
                    {accessLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors animate-slide-up"
                        style={{ animationDelay: `${idx * 0.03}s` }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.action === 'login' ? 'bg-green-500/10' : log.action === 'logout' ? 'bg-red-500/10' : 'bg-chaski-primary/10'
                        }`}>
                          {log.action === 'login' ? (
                            <Unlock className="w-5 h-5 text-green-600" />
                          ) : log.action === 'logout' ? (
                            <Lock className="w-5 h-5 text-red-600" />
                          ) : (
                            <Eye className="w-5 h-5 text-chaski-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-medium truncate">{log.name}</p>
                          <p className="text-slate-500 text-sm truncate">{log.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-medium ${
                            log.action === 'login' ? 'text-green-600' :
                            log.action === 'logout' ? 'text-red-600' : 'text-chaski-primary'
                          }`}>
                            {log.action === 'login' ? 'Inició sesión' :
                             log.action === 'logout' ? 'Cerró sesión' : 'Visitó página'}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {new Date(log.timestamp).toLocaleString('es-EC')}
                          </p>
                          {log.details && (
                            <p className="text-slate-400 text-xs">{log.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
        </div>
      </main>
    </div>
  )
}

// Componente para gestionar cursos desde Airtable