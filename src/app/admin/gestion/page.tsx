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

type GestionTab = 'levels' | 'programs' | 'users'

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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const tabs = [
    { id: 'levels' as GestionTab, label: 'Niveles', icon: GraduationCap, color: 'neon-cyan' },
    { id: 'programs' as GestionTab, label: 'Programas', icon: FolderOpen, color: 'neon-purple' },
    { id: 'users' as GestionTab, label: 'Usuarios', icon: Users, color: 'neon-green' }
  ]

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
              <p className="text-xs text-neon-cyan">Gestión Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <div className="pt-4 pb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider px-4">Gestión</p>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}/20 text-${tab.color} border border-${tab.color}/30`
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
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
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                logout()
                router.push('/')
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-dark-800/50 backdrop-blur border-b border-dark-600 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'levels' && 'Gestión de Niveles Educativos'}
              {activeTab === 'programs' && 'Gestión de Programas'}
              {activeTab === 'users' && 'Gestión de Usuarios y Códigos'}
            </h2>
            <p className="text-sm text-gray-400">
              {activeTab === 'levels' && 'Crea y administra niveles desde Inicial hasta Universidad'}
              {activeTab === 'programs' && 'Configura programas para cada nivel educativo'}
              {activeTab === 'users' && 'Genera códigos de acceso y administra usuarios'}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'levels' && <LevelsManager />}
          {activeTab === 'programs' && <ProgramsManager />}
          {activeTab === 'users' && <UsersManager />}
        </div>
      </main>
    </div>
  )
}
