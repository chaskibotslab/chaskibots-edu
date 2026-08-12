'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { Menu, X, User, LogOut, Settings, ChevronLeft, Home, BookOpen, Bot, Brain, Shield, GraduationCap, Box } from 'lucide-react'

export default function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 })

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
    { href: '/academy', label: 'Academy', icon: GraduationCap },
    { href: '/niveles', label: 'Niveles', icon: BookOpen },
    { href: '/robotica', label: 'Robótica', icon: Bot },
    { href: '/hacking', label: 'Hacking Ético', icon: Shield },
    { href: '/ia', label: 'IA', icon: Brain },
    { href: '/diseno', label: 'Diseño 3D', icon: Box },
  ]

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const activeEl = nav.querySelector<HTMLElement>('[data-active="true"]')
    if (activeEl) {
      setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth, opacity: 1 })
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }))
    }
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-50 bg-chaski-dark/90 backdrop-blur-md border-b border-white/10 relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-chaski-primary/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button + Logo */}
            <div className="flex items-center gap-2">
              {!isHomePage && !isLoginPage && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-chaski-primary/50 hover:bg-white/10 transition-all duration-200 group"
                  title="Volver"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-chaski-primary transition-colors" />
                </button>
              )}

              <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
                <div className="relative">
                  <Image
                    src="/chaski.png"
                    alt="ChaskiBots Logo"
                    width={38}
                    height={38}
                    className="rounded-xl group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
                    priority
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-hack-green ring-2 ring-white animate-pulse" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold text-lg text-white leading-tight">ChaskiBots</span>
                  <span className="text-[9px] text-chaski-primary tracking-[0.2em] font-mono font-medium">&gt; EDUCATION</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav - estilo iOS segmented tabs con indicador deslizante */}
            {isAuthenticated && (
              <nav ref={navRef} className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full p-1 relative">
                <div
                  className="absolute top-1 bottom-1 bg-white/10 rounded-full shadow-sm ring-1 ring-chaski-primary/30 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
                />
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-active={isActive}
                      className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                        isActive
                          ? 'text-chaski-primary'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="hidden sm:flex items-center gap-2 px-3 py-2 bg-chaski-accent/10 border border-chaski-accent/20 rounded-lg hover:border-chaski-accent/40 hover:bg-chaski-accent/20 transition-all"
                    >
                      <Settings className="w-4 h-4 text-chaski-accent" />
                      <span className="text-sm font-medium text-chaski-accent">Admin</span>
                    </Link>
                  )}
                  <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-chaski-primary/40 transition-all">
                    <User className="w-4 h-4 text-chaski-primary" />
                    <span className="text-sm font-medium text-white">{user?.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="hidden sm:block p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  
                  {/* Menú hamburguesa móvil */}
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="sm:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:border-chaski-primary/50 transition-all"
                  >
                    {menuOpen ? (
                      <X className="w-6 h-6 text-chaski-primary" />
                    ) : (
                      <Menu className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-5 py-2 bg-gradient-to-r from-chaski-primary to-chaski-secondary text-white font-semibold rounded-lg hover:shadow-glow-lg active:scale-[0.98] transition-all duration-300 text-sm">
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
        <div className={`absolute right-0 top-0 h-full w-72 bg-chaski-dark border-l border-white/10 shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header del menú */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chaski-primary/20 to-chaski-secondary/20 flex items-center justify-center border border-chaski-primary/30">
                <User className="w-6 h-6 text-chaski-primary" />
              </div>
              <div>
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.role === 'admin' ? 'Administrador' : user?.role === 'teacher' ? 'Profesor' : 'Estudiante'}</p>
              </div>
            </div>
          </div>

          {/* Links del menú */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item, i) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    menuOpen ? 'animate-reveal-up opacity-0' : ''
                  } ${
                    isActive 
                      ? 'bg-chaski-primary/15 text-chaski-primary border border-chaski-primary/30' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
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
                    ? 'bg-chaski-accent/15 text-chaski-accent border border-chaski-accent/30' 
                    : 'text-white hover:bg-chaski-dark/20 hover:text-chaski-accent'
                }`}
              >
                <Settings className="w-5 h-5 text-white" />
                <span className="font-medium text-white">Admin</span>
              </Link>
            )}
          </nav>

          {/* Cerrar sesión */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button
              onClick={() => {
                logout()
                setMenuOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 active:scale-[0.98] transition-all"
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
