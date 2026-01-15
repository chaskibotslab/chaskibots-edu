'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { ALL_COURSES } from '@/data/courses'
import {
  Users, BookOpen, Settings, LogOut, Home, Bell,
  Plus, Edit, Trash2, Eye, Lock, Unlock, Search,
  ChevronRight, Clock, Shield, GraduationCap,
  BarChart3, Activity, Key, Mail, Save, X, Package, Brain
} from 'lucide-react'

type AdminTab = 'dashboard' | 'courses' | 'users' | 'logs' | 'settings'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, isAuthenticated, isLoading, logout, accessLogs } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin')
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const stats = {
    totalUsers: 3,
    totalCourses: Object.keys(ALL_COURSES).length,
    totalLevels: EDUCATION_LEVELS.length,
    recentLogins: accessLogs.filter(log => log.action === 'login').length
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col">
        <div className="p-4 border-b border-dark-600">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">ChaskiBots</h1>
              <p className="text-xs text-neon-cyan">Panel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'courses'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Cursos</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Usuarios</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Actividad</span>
            {accessLogs.length > 0 && (
              <span className="ml-auto bg-neon-purple/30 text-neon-purple text-xs px-2 py-0.5 rounded-full">
                {accessLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Configuración</span>
          </button>
        </nav>

        <div className="p-4 border-t border-dark-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-dark-800/50 backdrop-blur border-b border-dark-600 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'courses' && 'Gestión de Cursos'}
              {activeTab === 'users' && 'Gestión de Usuarios'}
              {activeTab === 'logs' && 'Registro de Actividad'}
              {activeTab === 'settings' && 'Configuración'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Ver Sitio</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <span className="text-green-400 text-sm">+12%</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{stats.totalUsers}</h3>
                  <p className="text-gray-400">Usuarios Totales</p>
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-neon-purple" />
                    </div>
                    <span className="text-green-400 text-sm">+2</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{stats.totalCourses}</h3>
                  <p className="text-gray-400">Cursos Activos</p>
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-neon-pink/20 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-neon-pink" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{stats.totalLevels}</h3>
                  <p className="text-gray-400">Niveles Educativos</p>
                </div>

                <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{stats.recentLogins}</h3>
                  <p className="text-gray-400">Accesos Recientes</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-dark-800 rounded-xl border border-dark-600">
                <div className="p-4 border-b border-dark-600 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-neon-cyan text-sm hover:underline"
                  >
                    Ver todo
                  </button>
                </div>
                <div className="p-4">
                  {accessLogs.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No hay actividad reciente</p>
                  ) : (
                    <div className="space-y-3">
                      {accessLogs.slice(0, 5).map((log, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            log.action === 'login' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {log.action === 'login' ? (
                              <Unlock className="w-5 h-5 text-green-400" />
                            ) : (
                              <Lock className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{log.name}</p>
                            <p className="text-gray-400 text-sm">{log.email}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm ${log.action === 'login' ? 'text-green-400' : 'text-red-400'}`}>
                              {log.action === 'login' ? 'Inició sesión' : 'Cerró sesión'}
                            </p>
                            <p className="text-gray-500 text-xs">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link
                  href="/admin/contenido"
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-green/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center group-hover:bg-neon-green/30 transition-colors">
                      <BookOpen className="w-6 h-6 text-neon-green" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Editar Contenido</h4>
                      <p className="text-gray-400 text-sm">Videos, imágenes, lecciones</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/kits"
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-cyan/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center group-hover:bg-neon-cyan/30 transition-colors">
                      <Package className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Gestionar Kits</h4>
                      <p className="text-gray-400 text-sm">Kits, imágenes, precios</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/gestion"
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-purple/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center group-hover:bg-neon-purple/30 transition-colors">
                      <GraduationCap className="w-6 h-6 text-neon-purple" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Niveles y Programas</h4>
                      <p className="text-gray-400 text-sm">Niveles, programas, usuarios</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/ia"
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-pink/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-pink/20 rounded-lg flex items-center justify-center group-hover:bg-neon-pink/30 transition-colors">
                      <Brain className="w-6 h-6 text-neon-pink" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">IA y Hacking Ético</h4>
                      <p className="text-gray-400 text-sm">Actividades de IA por nivel</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/proyectos"
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-cyan/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center group-hover:bg-neon-cyan/30 transition-colors">
                      <Activity className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Proyectos Avanzados</h4>
                      <p className="text-gray-400 text-sm">Jetson, Raspberry, Digispark</p>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setActiveTab('courses')}
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-purple/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center group-hover:bg-neon-purple/30 transition-colors">
                      <Plus className="w-6 h-6 text-neon-purple" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Agregar Curso</h4>
                      <p className="text-gray-400 text-sm">Crear nuevo contenido</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-purple/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center group-hover:bg-neon-purple/30 transition-colors">
                      <Users className="w-6 h-6 text-neon-purple" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Gestionar Usuarios</h4>
                      <p className="text-gray-400 text-sm">Crear y editar usuarios</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-neon-pink/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neon-pink/20 rounded-lg flex items-center justify-center group-hover:bg-neon-pink/30 transition-colors">
                      <Settings className="w-6 h-6 text-neon-pink" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Configuración</h4>
                      <p className="text-gray-400 text-sm">Ajustes del sistema</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <CoursesManager />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UsersManager />
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-dark-800 rounded-xl border border-dark-600">
              <div className="p-4 border-b border-dark-600">
                <h3 className="text-lg font-semibold text-white">Registro de Actividad</h3>
                <p className="text-gray-400 text-sm">Historial de accesos al sistema</p>
              </div>
              <div className="p-4">
                {accessLogs.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">No hay registros de actividad</p>
                ) : (
                  <div className="space-y-2">
                    {accessLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors">
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
                          <p className="text-white font-medium">{log.name}</p>
                          <p className="text-gray-400 text-sm">{log.email}</p>
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
              <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Configuración General</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Nombre de la Plataforma</label>
                    <input
                      type="text"
                      defaultValue="ChaskiBots EDU"
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Email de Notificaciones</label>
                    <input
                      type="email"
                      defaultValue="admin@chaskibots.com"
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Notificaciones de Acceso</p>
                      <p className="text-gray-400 text-sm">Recibir email cuando alguien inicia sesión</p>
                    </div>
                    <button className="w-12 h-6 bg-neon-cyan rounded-full relative">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Credenciales de Prueba</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-dark-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Administrador</p>
                        <p className="text-gray-400 text-sm">admin@chaskibots.com</p>
                      </div>
                      <code className="bg-dark-600 px-3 py-1 rounded text-neon-cyan text-sm">admin2024</code>
                    </div>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Profesor</p>
                        <p className="text-gray-400 text-sm">profesor@chaskibots.com</p>
                      </div>
                      <code className="bg-dark-600 px-3 py-1 rounded text-neon-purple text-sm">profe123</code>
                    </div>
                  </div>
                  <div className="p-4 bg-dark-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Estudiante</p>
                        <p className="text-gray-400 text-sm">estudiante@chaskibots.com</p>
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

// Componente para gestionar cursos
function CoursesManager() {
  const courses = Object.entries(ALL_COURSES)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:border-neon-cyan focus:outline-none w-64"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Nuevo Curso</span>
        </button>
      </div>

      <div className="grid gap-4">
        {courses.map(([id, course]) => (
          <div key={id} className="bg-dark-800 rounded-xl border border-dark-600 p-6 hover:border-neon-cyan/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-4">{course.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-400">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    {course.modules.length} módulos
                  </span>
                  <span className="text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {course.totalLessons} lecciones
                  </span>
                  <span className="text-neon-cyan">
                    ${course.kit.price} kit
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-700 rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/50 border-2 border-dashed border-dark-600 rounded-xl p-8 text-center">
        <Plus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h4 className="text-white font-medium mb-2">Agregar Nuevo Curso</h4>
        <p className="text-gray-400 text-sm mb-4">
          Para agregar un nuevo curso, crea un archivo en<br />
          <code className="text-neon-cyan">src/data/courses/[nivel].ts</code>
        </p>
        <button className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors">
          Ver Documentación
        </button>
      </div>
    </div>
  )
}

// Componente para gestionar usuarios
function UsersManager() {
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [users] = useState([
    { id: 'admin-1', name: 'Administrador', email: 'admin@chaskibots.com', role: 'admin', levelId: null },
    { id: 'teacher-1', name: 'Profesor Demo', email: 'profesor@chaskibots.com', role: 'teacher', levelId: 'inicial-1' },
    { id: 'student-1', name: 'Estudiante Demo', email: 'estudiante@chaskibots.com', role: 'student', levelId: 'inicial-1' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:border-neon-cyan focus:outline-none w-64"
          />
        </div>
        <button
          onClick={() => setShowNewUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left p-4 text-gray-400 font-medium">Usuario</th>
              <th className="text-left p-4 text-gray-400 font-medium">Rol</th>
              <th className="text-left p-4 text-gray-400 font-medium">Nivel</th>
              <th className="text-right p-4 text-gray-400 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-dark-600/50 hover:bg-dark-700/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.role === 'admin' ? 'bg-neon-cyan/20' :
                      user.role === 'teacher' ? 'bg-neon-purple/20' : 'bg-neon-pink/20'
                    }`}>
                      <span className={`font-bold ${
                        user.role === 'admin' ? 'text-neon-cyan' :
                        user.role === 'teacher' ? 'text-neon-purple' : 'text-neon-pink'
                      }`}>
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-neon-cyan/20 text-neon-cyan' :
                    user.role === 'teacher' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-neon-pink/20 text-neon-pink'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' :
                     user.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                  </span>
                </td>
                <td className="p-4 text-gray-400">
                  {user.levelId || '-'}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-700 rounded-lg transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-dark-700 rounded-lg transition-colors" title="Resetear contraseña">
                      <Key className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para nuevo usuario */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Nuevo Usuario</h3>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nombre</label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Rol</label>
                <select className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none">
                  <option value="student">Estudiante</option>
                  <option value="teacher">Profesor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nivel Asignado</label>
                <select className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none">
                  <option value="">Sin nivel asignado</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 px-4 py-3 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
