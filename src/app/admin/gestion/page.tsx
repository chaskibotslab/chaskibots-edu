'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  Users, BookOpen, GraduationCap, Shield, Home, LogOut,
  BarChart3, Layers, FolderOpen
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Cargar componentes dinámicamente
const LevelsManager = dynamic(() => import('@/components/admin/LevelsManager'), { ssr: false })
const ProgramsManager = dynamic(() => import('@/components/admin/ProgramsManager'), { ssr: false })
const UsersManager = dynamic(() => import('@/components/admin/UsersManager'), { ssr: false })
const TeacherCoursesManager = dynamic(() => import('@/components/admin/TeacherCoursesManager'), { ssr: false })

type GestionTab = 'levels' | 'programs' | 'users' | 'assignments'

export default function GestionPage() {
  const router = useRouter()
  const { user, isAdmin, isAuthenticated, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<GestionTab>('levels')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/gestion')
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chaski-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const tabs = [
    { id: 'levels' as GestionTab, label: 'Niveles', icon: GraduationCap, color: 'brand-purple' },
    { id: 'programs' as GestionTab, label: 'Programas', icon: FolderOpen, color: 'brand-violet' },
    { id: 'users' as GestionTab, label: 'Usuarios', icon: Users, color: 'neon-green' },
    { id: 'assignments' as GestionTab, label: 'Asignaciones', icon: BookOpen, color: 'brand-cyan' }
  ]

  return (
    <div className="min-h-screen bg-white flex animate-fade-in">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-violet rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-slate-900 font-bold">ChaskiBots</h1>
              <p className="text-xs text-brand-purple">Gestión Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <div className="pt-4 pb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider px-4">Gestión</p>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}/20 text-${tab.color} border border-${tab.color}/30`
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-violet to-neon-pink rounded-full flex items-center justify-center">
              <span className="text-slate-900 font-bold">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-600 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 hover:text-slate-900 active:scale-[0.98] transition-all"
            >
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                logout()
                router.push('/')
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-slate-50/50 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === 'levels' && 'Gestión de Niveles Educativos'}
              {activeTab === 'programs' && 'Gestión de Programas'}
              {activeTab === 'users' && 'Gestión de Usuarios y Códigos'}
              {activeTab === 'assignments' && 'Asignación de Cursos a Profesores'}
            </h2>
            <p className="text-sm text-slate-600">
              {activeTab === 'levels' && 'Crea y administra niveles desde Inicial hasta Universidad'}
              {activeTab === 'programs' && 'Configura programas para cada nivel educativo'}
              {activeTab === 'users' && 'Genera códigos de acceso y administra usuarios'}
              {activeTab === 'assignments' && 'Asigna múltiples cursos a cada profesor con multi-select'}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'levels' && <LevelsManager />}
          {activeTab === 'programs' && <ProgramsManager />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'assignments' && <TeacherCoursesManager />}
        </div>
      </main>
    </div>
  )
}
