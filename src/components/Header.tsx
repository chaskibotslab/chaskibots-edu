'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { Menu, X, User, LogOut, BookOpen, Bot, Brain, Shield, Zap, Settings } from 'lucide-react'

export default function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-neon-cyan/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/chaski.png" 
              alt="ChaskiBots Logo" 
              width={40} 
              height={40}
              className="rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white">ChaskiBots</span>
              <span className="text-[10px] text-neon-cyan tracking-widest">EDUCATION PLATFORM</span>
            </div>
          </Link>

          {/* Desktop Navigation - Oculto por solicitud del usuario */}

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
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
                  className="p-2 text-gray-500 hover:text-neon-pink transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold rounded-lg hover:shadow-neon-cyan transition-all duration-300 text-sm">
                Iniciar Sesión
              </Link>
            )}

            {/* Mobile menu button - Oculto */}
          </div>
        </div>

        {/* Mobile Navigation - Oculto por solicitud del usuario */}
      </div>
    </header>
  )
}
