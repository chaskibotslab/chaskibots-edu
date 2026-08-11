'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useDynamicLevels } from '@/hooks/useDynamicLevels'
import { ALL_COURSES } from '@/data/courses'
import UsersManagerComponent from '@/components/admin/UsersManager'
import {
  Users, BookOpen, Settings, LogOut, Home, Bell,
  Plus, Edit, Trash2, Eye, Lock, Unlock, Search,
  ChevronRight, Clock, Shield, GraduationCap,
  BarChart3, Activity, Key, Mail, Save, X, Package, Brain, FileText, Monitor, Zap, Award
} from 'lucide-react'

type AdminTab = 'dashboard' | 'courses' | 'users' | 'logs' | 'settings'

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
  color: string
  trend?: string
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
      <div className="relative flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        {trend && (
          <span className={`text-xs font-bold bg-${color}/10 text-${color} px-2 py-1 rounded-lg`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <p className={`text-sm font-medium text-${color}`}>{label}</p>
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
  color: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-${color}/50 transition-all duration-300`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 text-${color}`} />
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'logs', label: 'Actividad', icon: Activity },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="animate-slide-in-left">
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'courses' && 'Gestión de Cursos'}
              {activeTab === 'users' && 'Gestión de Usuarios'}
              {activeTab === 'logs' && 'Registro de Actividad'}
              {activeTab === 'settings' && 'Configuración'}
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
                  color="brand-purple"
                  trend="+12%"
                />
                <StatCard
                  label="Cursos Activos"
                  value={stats.totalCourses}
                  icon={BookOpen}
                  color="brand-cyan"
                  trend="+2"
                />
                <StatCard
                  label="Niveles Educativos"
                  value={stats.totalLevels}
                  icon={GraduationCap}
                  color="brand-violet"
                />
                <StatCard
                  label="Accesos Recientes"
                  value={stats.recentLogins}
                  icon={Activity}
                  color="neon-green"
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-brand-purple" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Actividad Reciente</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-sm font-medium text-brand-purple hover:text-brand-violet transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-purple/10"
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
                              <Unlock className="w-5 h-5 text-green-500" />
                            ) : (
                              <Lock className="w-5 h-5 text-red-500" />
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
                  <Zap className="w-5 h-5 text-brand-cyan" />
                  Herramientas de administración
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <QuickAction href="/admin/colegios" icon={GraduationCap} color="brand-violet" title="Colegios y Cursos" description="Asignar cursos a colegios" />
                  <QuickAction href="/admin/cursos" icon={BookOpen} color="pink-500" title="Catálogo de Cursos" description="Cursos reutilizables" />
                  <QuickAction href="/admin/calificar" icon={Award} color="amber-500" title="Calificar Entregas" description="Panel realtime de calificación" />
                  <QuickAction href="/admin/lecciones" icon={BookOpen} color="brand-cyan" title="Lecciones" description="Editor con imágenes drag-drop" />
                  <QuickAction href="/admin/kits" icon={Package} color="brand-purple" title="Gestionar Kits" description="Kits, imágenes, precios" />
                  <QuickAction href="/admin/simuladores" icon={Monitor} color="cyan-500" title="Simuladores" description="Por nivel y programa" />
                  <QuickAction href="/admin/gestion" icon={Settings} color="slate-500" title="Niveles y Programas" description="Niveles, programas, usuarios" />
                  <QuickAction href="/admin/ia" icon={Brain} color="pink-500" title="IA y Hacking Ético" description="Actividades de IA por nivel" />
                  <QuickAction href="/admin/proyectos" icon={Activity} color="brand-purple" title="Proyectos Avanzados" description="Jetson, Raspberry, Digispark" />
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="text-left group rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-brand-violet/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-brand-violet" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-semibold">Agregar Curso</h4>
                        <p className="text-slate-500 text-sm">Crear nuevo contenido</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-left group rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-brand-violet/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-brand-violet" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-semibold">Gestionar Usuarios</h4>
                        <p className="text-slate-500 text-sm">Crear y editar usuarios</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-left group rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-pink-500/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings className="w-6 h-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-semibold">Configuración</h4>
                        <p className="text-slate-500 text-sm">Ajustes del sistema</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <CoursesManager />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UsersManagerComponent />
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-gray-50 rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Registro de Actividad</h3>
                <p className="text-gray-600 text-sm">Historial de accesos al sistema</p>
              </div>
              <div className="p-4">
                {accessLogs.length === 0 ? (
                  <p className="text-gray-600 text-center py-12">No hay registros de actividad</p>
                ) : (
                  <div className="space-y-2">
                    {accessLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gray-100/50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.action === 'login' ? 'bg-green-500/20' : log.action === 'logout' ? 'bg-red-500/20' : 'bg-blue-500/20'
                        }`}>
                          {log.action === 'login' ? (
                            <Unlock className="w-5 h-5 text-green-400" />
                          ) : log.action === 'logout' ? (
                            <Lock className="w-5 h-5 text-red-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{log.name}</p>
                          <p className="text-gray-600 text-sm">{log.email}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            log.action === 'login' ? 'text-green-400' : 
                            log.action === 'logout' ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            {log.action === 'login' ? 'Inició sesión' : 
                             log.action === 'logout' ? 'Cerró sesión' : 'Visitó página'}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(log.timestamp).toLocaleString('es-EC')}
                          </p>
                          {log.details && (
                            <p className="text-gray-500 text-xs">{log.details}</p>
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
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Nombre de la Plataforma</label>
                    <input
                      type="text"
                      defaultValue="ChaskiBots EDU"
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-brand-purple focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Email de Notificaciones</label>
                    <input
                      type="email"
                      defaultValue="admin@chaskibots.com"
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-brand-purple focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100/50 rounded-lg">
                    <div>
                      <p className="text-gray-900 font-medium">Notificaciones de Acceso</p>
                      <p className="text-gray-600 text-sm">Recibir email cuando alguien inicia sesión</p>
                    </div>
                    <button className="w-12 h-6 bg-brand-purple rounded-full relative">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Credenciales de Prueba</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-100/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Administrador</p>
                        <p className="text-gray-600 text-sm">admin@chaskibots.com</p>
                      </div>
                      <code className="bg-dark-600 px-3 py-1 rounded text-brand-purple text-sm">admin2024</code>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Profesor</p>
                        <p className="text-gray-600 text-sm">profesor@chaskibots.com</p>
                      </div>
                      <code className="bg-dark-600 px-3 py-1 rounded text-brand-violet text-sm">profe123</code>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Estudiante</p>
                        <p className="text-gray-600 text-sm">estudiante@chaskibots.com</p>
                      </div>
                      <code className="bg-dark-600 px-3 py-1 rounded text-neon-pink text-sm">estudiante123</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Componente para gestionar cursos desde Airtable
function CoursesManager() {
  const { levels: dynamicLevels } = useDynamicLevels()
  const [courses, setCourses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    levelId: '',
    programId: '',
    teacherName: '',
    maxStudents: 30
  })

  useEffect(() => {
    loadCourses()
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) {
        // Filtrar solo profesores
        const teachersList = data.users.filter((u: any) => 
          u.role === 'teacher' || u.role === 'profesor' || u.role === 'prof'
        )
        setTeachers(teachersList)
      }
    } catch (error) {
      console.error('Error loading teachers:', error)
    }
  }

  const loadCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/courses')
      const data = await res.json()
      if (data.courses) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = '/api/admin/courses'
      const method = editingCourse ? 'PATCH' : 'POST'
      const body = editingCourse 
        ? { ...formData, courseId: editingCourse.id, action: 'update' }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        loadCourses()
        resetForm()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al guardar curso')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Error al guardar curso')
    }
    setSaving(false)
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })
      if (res.ok) {
        loadCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const handleEdit = (course: any) => {
    setEditingCourse(course)
    setFormData({
      name: course.name || '',
      description: course.description || '',
      levelId: course.levelId || '',
      programId: course.programId || '',
      teacherName: course.teacherName || '',
      maxStudents: course.maxStudents || 30
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCourse(null)
    setFormData({
      name: '',
      description: '',
      levelId: '',
      programId: '',
      teacherName: '',
      maxStudents: 30
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-brand-purple focus:outline-none w-64"
          />
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-dark-900 rounded-lg font-medium hover:bg-brand-purple/90 transition-colors"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showForm ? 'Cancelar' : 'Nuevo Curso'}</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre del Curso</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nivel</label>
              <select
                value={formData.levelId}
                onChange={(e) => setFormData({...formData, levelId: e.target.value})}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                required
              >
                <option value="">Seleccionar...</option>
                {(dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS).map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Profesor</label>
              <select
                value={formData.teacherName}
                onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
              >
                <option value="">Seleccionar profesor...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name} {teacher.email ? `(${teacher.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Máx. Estudiantes</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-neon-green text-dark-900 font-semibold rounded-lg hover:bg-neon-green/90 disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {editingCourse ? 'Actualizar' : 'Crear'} Curso
            </button>
          </div>
        </form>
      )}

      {/* Lista de cursos */}
      <div className="grid gap-4">
        {courses.length === 0 ? (
          <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <Plus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-gray-900 font-medium mb-2">No hay cursos</h4>
            <p className="text-gray-600 text-sm">Crea tu primer curso usando el botón "Nuevo Curso"</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:border-brand-purple/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.name}</h3>
                  <p className="text-gray-600 mb-4">{course.description || 'Sin descripción'}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-600">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      {course.levelId}
                    </span>
                    <span className="text-gray-600">
                      <Users className="w-4 h-4 inline mr-1" />
                      {course.currentStudents || 0}/{course.maxStudents || 30} estudiantes
                    </span>
                    {course.teacherName && (
                      <span className="text-brand-purple">
                        👨‍🏫 {course.teacherName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(course)}
                    className="p-2 text-gray-600 hover:text-brand-purple hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Componente UsersManager ahora se importa de @/components/admin/UsersManager
