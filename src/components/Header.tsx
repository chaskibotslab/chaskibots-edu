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
      <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-neon-cyan/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button + Logo */}
            <div className="flex items-center gap-2">
              {!isHomePage && !isLoginPage && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg bg-dark-800 border border-dark-600 hover:border-neon-cyan/50 hover:bg-dark-700 transition-all duration-200 group"
                  title="Volver"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan transition-colors" />
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
                  <span className="font-bold text-xl text-white">ChaskiBots</span>
                  <span className="text-[10px] text-neon-cyan tracking-widest">EDUCATION PLATFORM</span>
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
                      className="hidden sm:flex items-center gap-2 px-3 py-2 bg-neon-purple/20 border border-neon-purple/30 rounded-lg hover:border-neon-purple/60 hover:bg-neon-purple/30 transition-all"
                    >
                      <Settings className="w-4 h-4 text-neon-purple" />
                      <span className="text-sm font-medium text-neon-purple">Admin</span>
                    </Link>
                  )}
                  <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-dark-700 border border-neon-cyan/30 rounded-lg hover:border-neon-cyan/60 transition-all">
                    <User className="w-4 h-4 text-neon-cyan" />
                    <span className="text-sm font-medium text-white">{user?.name}</span>
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
                    className="sm:hidden p-2 rounded-lg bg-dark-800 border border-dark-600 hover:border-neon-cyan/50 transition-all"
                  >
                    {menuOpen ? (
                      <X className="w-6 h-6 text-neon-cyan" />
                    ) : (
                      <Menu className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-5 py-2 bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold rounded-lg hover:shadow-neon-cyan transition-all duration-300 text-sm">
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
        <div className={`absolute right-0 top-0 h-full w-72 bg-dark-900 border-l border-neon-cyan/20 shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header del menú */}
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-neon-cyan/30">
                <User className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <p className="font-semibold text-white">{user?.name}</p>
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
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' 
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
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
                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30' 
                    : 'text-gray-400 hover:bg-dark-800 hover:text-neon-purple'
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
