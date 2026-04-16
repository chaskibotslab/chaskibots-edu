'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { Menu, X, User, LogOut, Settings, ChevronLeft, Home, BookOpen, Bot, Brain, Shield } from 'lucide-react'

export default function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isHomePage = pathname === '/' || pathname === '/dashboard'
  const isLoginPage = pathname === '/login'

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push(isAuthenticated ? '/dashboard' : '/')
    }
  }

  const menuItems = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/niveles', label: 'Niveles', icon: BookOpen },
    { href: '/robotica', label: 'Robótica', icon: Bot },
    { href: '/hacking', label: 'Hacking Ético', icon: Shield },
    { href: '/ia', label: 'IA', icon: Brain },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button + Logo */}
            <div className="flex items-center gap-2">
              {!isHomePage && !isLoginPage && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-brand-purple/50 hover:bg-gray-100 transition-all duration-200 group"
                  title="Volver"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-brand-purple transition-colors" />
                </button>
              )}
              
              <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
                <Image 
                  src="/chaski.png" 
                  alt="ChaskiBots Logo" 
                  width={40} 
                  height={40}
                  className="rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold text-xl text-gray-900">ChaskiBots</span>
                  <span className="text-[10px] text-brand-purple tracking-widest">EDUCATION PLATFORM</span>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="hidden sm:flex items-center gap-2 px-3 py-2 bg-brand-violet/20 border border-brand-violet/30 rounded-lg hover:border-brand-violet/60 hover:bg-brand-violet/30 transition-all"
                    >
                      <Settings className="w-4 h-4 text-brand-violet" />
                      <span className="text-sm font-medium text-brand-violet">Admin</span>
                    </Link>
                  )}
                  <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 border border-brand-purple/30 rounded-lg hover:border-brand-purple/60 transition-all">
                    <User className="w-4 h-4 text-brand-purple" />
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="hidden sm:block p-2 text-gray-500 hover:text-neon-pink transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  
                  {/* Menú hamburguesa móvil */}
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="sm:hidden p-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-brand-purple/50 transition-all"
                  >
                    {menuOpen ? (
                      <X className="w-6 h-6 text-brand-purple" />
                    ) : (
                      <Menu className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-5 py-2 bg-gradient-to-r from-brand-purple to-neon-blue text-dark-900 font-semibold rounded-lg hover:shadow-brand-purple transition-all duration-300 text-sm">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil deslizable */}
      <div className={`fixed inset-0 z-40 sm:hidden transition-all duration-300 ${menuOpen ? 'visible' : 'invisible'}`}>
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMenuOpen(false)}
        />
        
        {/* Panel del menú */}
        <div className={`absolute right-0 top-0 h-full w-72 bg-white border-l border-brand-purple/20 shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header del menú */}
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-violet/20 flex items-center justify-center border border-brand-purple/30">
                <User className="w-6 h-6 text-brand-purple" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrador' : user?.role === 'teacher' ? 'Profesor' : 'Estudiante'}</p>
              </div>
            </div>
          </div>

          {/* Links del menú */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
            
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === '/admin' 
                    ? 'bg-brand-violet/20 text-brand-violet border border-brand-violet/30' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-brand-violet'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}
          </nav>

          {/* Cerrar sesión */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
            <button
              onClick={() => {
                logout()
                setMenuOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
