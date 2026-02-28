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
  BarChart3, Activity, Key, Mail, Save, X, Package, Brain, FileText, Monitor
} from 'lucide-react'

type AdminTab = 'dashboard' | 'courses' | 'users' | 'logs' | 'settings'

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex relative overflow-hidden">
      {/* Fondo futurista con efectos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-pink/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800/80 backdrop-blur-xl border-r border-neon-cyan/10 flex flex-col relative z-10">
        {/* Logo Header con efecto glow */}
        <div className="p-4 border-b border-neon-cyan/20 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/30 rounded-xl blur-md group-hover:bg-neon-cyan/50 transition-all"></div>
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-neon-cyan/50 group-hover:border-neon-cyan transition-all">
                <Image 
                  src="/chaski.png" 
                  alt="ChaskiBots" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-wide">ChaskiBots</h1>
              <p className="text-xs text-neon-cyan font-medium tracking-widest uppercase">Panel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 text-neon-cyan border border-neon-cyan/40 shadow-lg shadow-neon-cyan/20'
                : 'text-gray-400 hover:bg-dark-700/50 hover:text-white hover:border-white/10 border border-transparent'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'courses'
                ? 'bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 text-neon-purple border border-neon-purple/40 shadow-lg shadow-neon-purple/20'
                : 'text-gray-400 hover:bg-dark-700/50 hover:text-white hover:border-white/10 border border-transparent'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Cursos</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-neon-pink/20 to-neon-pink/10 text-neon-pink border border-neon-pink/40 shadow-lg shadow-neon-pink/20'
                : 'text-gray-400 hover:bg-dark-700/50 hover:text-white hover:border-white/10 border border-transparent'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Usuarios</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-neon-green/20 to-neon-green/10 text-neon-green border border-neon-green/40 shadow-lg shadow-neon-green/20'
                : 'text-gray-400 hover:bg-dark-700/50 hover:text-white hover:border-white/10 border border-transparent'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Actividad</span>
            {accessLogs.length > 0 && (
              <span className="ml-auto bg-neon-green/30 text-neon-green text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {accessLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-400 border border-orange-500/40 shadow-lg shadow-orange-500/20'
                : 'text-gray-400 hover:bg-dark-700/50 hover:text-white hover:border-white/10 border border-transparent'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configuración</span>
          </button>

          <div className="mt-4 pt-4 border-t border-neon-cyan/10">
            <p className="text-xs text-neon-cyan/60 mb-3 px-4 font-semibold tracking-wider uppercase">Herramientas</p>
            <Link
              href="/admin/colegios"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300 border border-transparent hover:border-blue-500/30 group"
            >
              <Shield className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Colegios</span>
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Nuevo</span>
            </Link>
            <Link
              href="/admin/calificaciones"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-neon-green/10 hover:text-neon-green transition-all duration-300 border border-transparent hover:border-neon-green/30 group"
            >
              <GraduationCap className="w-5 h-5 text-neon-green group-hover:scale-110 transition-transform" />
              <span className="font-medium">Calificaciones</span>
            </Link>
            <Link
              href="/admin/entregas"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all duration-300 border border-transparent hover:border-purple-500/30 group"
            >
              <FileText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Entregas</span>
            </Link>
            <Link
              href="/admin/tareas"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400 transition-all duration-300 border border-transparent hover:border-yellow-500/30 group"
            >
              <BookOpen className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Gestión de Tareas</span>
            </Link>
            <Link
              href="/admin/contenido"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-all duration-300 border border-transparent hover:border-neon-cyan/30 group"
            >
              <Brain className="w-5 h-5 text-neon-cyan group-hover:scale-110 transition-transform" />
              <span className="font-medium">Contenido</span>
            </Link>
          </div>
        </nav>

        {/* Footer del sidebar con usuario y logo pequeño */}
        <div className="p-4 border-t border-neon-cyan/10 bg-gradient-to-r from-dark-800/50 to-dark-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-purple/30 rounded-full blur-sm"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center border border-neon-purple/50">
                <span className="text-white font-bold">{user?.name?.charAt(0) || 'A'}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-neon-cyan/60 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-xl hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 border border-red-500/30 hover:border-red-500/50 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        {/* Header futurista */}
        <header className="h-20 bg-dark-800/60 backdrop-blur-xl border-b border-neon-cyan/10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            {/* Logo pequeño en header */}
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-neon-cyan/30 hidden lg:block">
              <Image src="/chaski.png" alt="ChaskiBots" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'courses' && 'Gestión de Cursos'}
                {activeTab === 'users' && 'Gestión de Usuarios'}
                {activeTab === 'logs' && 'Registro de Actividad'}
                {activeTab === 'settings' && 'Configuración'}
              </h2>
              <p className="text-neon-cyan/60 text-sm">Panel de Administración ChaskiBots</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 text-neon-cyan hover:text-white transition-all duration-300 rounded-xl border border-neon-cyan/30 hover:border-neon-cyan/60 font-medium"
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
            <div className="space-y-8">
              {/* Stats Cards con efectos futuristas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card Usuarios */}
                <div className="group relative bg-gradient-to-br from-dark-800/80 to-dark-700/50 rounded-2xl p-6 border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl group-hover:bg-neon-cyan/20 transition-all duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/10 rounded-xl flex items-center justify-center border border-neon-cyan/30 shadow-lg shadow-neon-cyan/20">
                        <Users className="w-7 h-7 text-neon-cyan" />
                      </div>
                      <span className="text-neon-green text-sm font-bold bg-neon-green/20 px-2 py-1 rounded-lg">+12%</span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-1">{stats.totalUsers}</h3>
                    <p className="text-neon-cyan/70 font-medium">Usuarios Totales</p>
                  </div>
                </div>

                {/* Card Cursos */}
                <div className="group relative bg-gradient-to-br from-dark-800/80 to-dark-700/50 rounded-2xl p-6 border border-neon-purple/20 hover:border-neon-purple/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/10 rounded-full blur-2xl group-hover:bg-neon-purple/20 transition-all duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-neon-purple/30 to-neon-purple/10 rounded-xl flex items-center justify-center border border-neon-purple/30 shadow-lg shadow-neon-purple/20">
                        <BookOpen className="w-7 h-7 text-neon-purple" />
                      </div>
                      <span className="text-neon-green text-sm font-bold bg-neon-green/20 px-2 py-1 rounded-lg">+2</span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-1">{stats.totalCourses}</h3>
                    <p className="text-neon-purple/70 font-medium">Cursos Activos</p>
                  </div>
                </div>

                {/* Card Niveles */}
                <div className="group relative bg-gradient-to-br from-dark-800/80 to-dark-700/50 rounded-2xl p-6 border border-neon-pink/20 hover:border-neon-pink/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-pink/10 rounded-full blur-2xl group-hover:bg-neon-pink/20 transition-all duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-neon-pink/30 to-neon-pink/10 rounded-xl flex items-center justify-center border border-neon-pink/30 shadow-lg shadow-neon-pink/20">
                        <GraduationCap className="w-7 h-7 text-neon-pink" />
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-1">{stats.totalLevels}</h3>
                    <p className="text-neon-pink/70 font-medium">Niveles Educativos</p>
                  </div>
                </div>

                {/* Card Accesos */}
                <div className="group relative bg-gradient-to-br from-dark-800/80 to-dark-700/50 rounded-2xl p-6 border border-neon-green/20 hover:border-neon-green/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-green/10 rounded-full blur-2xl group-hover:bg-neon-green/20 transition-all duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-neon-green/30 to-neon-green/10 rounded-xl flex items-center justify-center border border-neon-green/30 shadow-lg shadow-neon-green/20">
                        <Activity className="w-7 h-7 text-neon-green" />
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-1">{stats.recentLogins}</h3>
                    <p className="text-neon-green/70 font-medium">Accesos Recientes</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity con estilo futurista */}
              <div className="bg-gradient-to-br from-dark-800/80 to-dark-700/50 rounded-2xl border border-neon-cyan/10 overflow-hidden">
                <div className="p-5 border-b border-neon-cyan/10 flex items-center justify-between bg-gradient-to-r from-neon-cyan/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neon-cyan/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Actividad Reciente</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-neon-cyan text-sm font-medium hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-neon-cyan/10"
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
                  href="/admin/simuladores"
                  className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-green-500/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                      <Monitor className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Simuladores</h4>
                      <p className="text-gray-400 text-sm">Por nivel y programa</p>
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
            <UsersManagerComponent />
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

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
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 transition-colors"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showForm ? 'Cancelar' : 'Nuevo Curso'}</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl border border-dark-600 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre del Curso</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nivel</label>
              <select
                value={formData.levelId}
                onChange={(e) => setFormData({...formData, levelId: e.target.value})}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              >
                <option value="">Seleccionar...</option>
                {(dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS).map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Profesor</label>
              <select
                value={formData.teacherName}
                onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
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
              <label className="block text-sm text-gray-400 mb-1">Máx. Estudiantes</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-400 hover:text-white">
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
          <div className="bg-dark-800/50 border-2 border-dashed border-dark-600 rounded-xl p-8 text-center">
            <Plus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No hay cursos</h4>
            <p className="text-gray-400 text-sm">Crea tu primer curso usando el botón "Nuevo Curso"</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-dark-800 rounded-xl border border-dark-600 p-6 hover:border-neon-cyan/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{course.name}</h3>
                  <p className="text-gray-400 mb-4">{course.description || 'Sin descripción'}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-400">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      {course.levelId}
                    </span>
                    <span className="text-gray-400">
                      <Users className="w-4 h-4 inline mr-1" />
                      {course.currentStudents || 0}/{course.maxStudents || 30} estudiantes
                    </span>
                    {course.teacherName && (
                      <span className="text-neon-cyan">
                        👨‍🏫 {course.teacherName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(course)}
                    className="p-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
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
