'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { Menu, X, User, LogOut, BookOpen, Bot, Brain, Shield, Zap } from 'lucide-react'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/niveles" className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-700/50 rounded-lg transition-all duration-200">
              <BookOpen className="w-4 h-4" />
              Niveles
            </Link>
            <Link href="/robotica" className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-700/50 rounded-lg transition-all duration-200">
              <Bot className="w-4 h-4" />
              Robótica
            </Link>
            <Link href="/ia" className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-neon-purple hover:bg-dark-700/50 rounded-lg transition-all duration-200">
              <Brain className="w-4 h-4" />
              IA
            </Link>
            <Link href="/simuladores" className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-neon-green hover:bg-dark-700/50 rounded-lg transition-all duration-200">
              <Zap className="w-4 h-4" />
              Simuladores
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
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

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-neon-cyan transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-dark-600 animate-fadeIn">
            <nav className="flex flex-col gap-1">
              <Link href="/niveles" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-neon-cyan hover:bg-dark-700/50 rounded-lg transition-all">
                <BookOpen className="w-5 h-5" />
                Niveles Educativos
              </Link>
              <Link href="/robotica" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-neon-cyan hover:bg-dark-700/50 rounded-lg transition-all">
                <Bot className="w-5 h-5" />
                Robótica
              </Link>
              <Link href="/ia" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-neon-purple hover:bg-dark-700/50 rounded-lg transition-all">
                <Brain className="w-5 h-5" />
                Inteligencia Artificial
              </Link>
              <Link href="/simuladores" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-neon-green hover:bg-dark-700/50 rounded-lg transition-all">
                <Zap className="w-5 h-5" />
                Simuladores
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
