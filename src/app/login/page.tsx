'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Mail, Lock, Eye, EyeOff, Loader2, Key, ArrowRight, ChevronDown } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginMode, setLoginMode] = useState<'email' | 'code'>('code')
  const [showForm, setShowForm] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      let result
      if (loginMode === 'code') {
        const response = await fetch('/api/auth/login-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessCode })
        })
        result = await response.json()
        if (result.success && result.user) {
          localStorage.setItem('chaskibots_user', JSON.stringify(result.user))
          window.location.href = '/niveles'
          return
        }
      } else {
        result = await login(email, password)
      }
      
      if (result.success) {
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect') || '/niveles'
        router.push(redirect)
      } else {
        setError(result.error || 'Credenciales incorrectas')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-dark-900 relative overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Fondo animado */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Contenido principal */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-700 ${showForm ? 'translate-y-0' : 'translate-y-0'}`}>
        
        {/* Hero Section - Logo grande y animado */}
        <div className={`text-center transition-all duration-700 ease-out ${showForm ? 'scale-75 -translate-y-8 opacity-90' : 'scale-100 translate-y-0'}`}>
          {/* Logo animado */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-3xl blur-2xl opacity-60 animate-pulse scale-110"></div>
            <div className="relative">
              <Image 
                src="/chaski.png" 
                alt="ChaskiBots" 
                width={showForm ? 100 : 140} 
                height={showForm ? 100 : 140}
                className="rounded-3xl border-4 border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-3"
              />
            </div>
          </div>
          
          {/* Título */}
          <h1 className={`font-black bg-gradient-to-r from-white via-neon-cyan to-white bg-clip-text text-transparent transition-all duration-500 ${showForm ? 'text-3xl mb-2' : 'text-5xl md:text-6xl mb-4'}`}>
            ChaskiBots
          </h1>
          <p className={`text-neon-cyan font-medium tracking-[0.3em] uppercase transition-all duration-500 ${showForm ? 'text-xs mb-4' : 'text-sm mb-8'}`}>
            Educación del Futuro
          </p>

          {/* Botón para mostrar formulario */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="group flex flex-col items-center gap-2 mx-auto animate-bounce"
            >
              <span className="text-gray-400 text-sm">Iniciar Sesión</span>
              <ChevronDown className="w-6 h-6 text-neon-cyan group-hover:text-white transition-colors" />
            </button>
          )}
        </div>

        {/* Formulario deslizable */}
        <div className={`w-full max-w-sm transition-all duration-700 ease-out ${showForm ? 'opacity-100 translate-y-0 mt-4' : 'opacity-0 translate-y-20 pointer-events-none absolute'}`}>
          
          {/* Card del formulario */}
          <div className="bg-dark-800/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
            
            {/* Tabs minimalistas */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setLoginMode('code')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginMode === 'code' 
                    ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-lg' 
                    : 'bg-dark-700/50 text-gray-400 hover:text-white'
                }`}
              >
                <Key className="w-4 h-4 inline mr-2" />
                Código
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('email')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginMode === 'email' 
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-blue text-white shadow-lg' 
                    : 'bg-dark-700/50 text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              {loginMode === 'code' ? (
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-4 bg-dark-700/50 border-2 border-dark-600 rounded-2xl focus:border-neon-purple focus:ring-0 transition-all placeholder:text-gray-500 font-mono text-xl tracking-[0.2em] text-center text-white uppercase"
                      placeholder="TU CÓDIGO"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Código de tu profesor
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-dark-700/50 border-2 border-dark-600 rounded-2xl focus:border-neon-cyan focus:ring-0 transition-all placeholder:text-gray-500 text-white"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-dark-700/50 border-2 border-dark-600 rounded-2xl focus:border-neon-cyan focus:ring-0 transition-all placeholder:text-gray-500 text-white"
                      placeholder="Contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple text-white font-bold rounded-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-cyan/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Contacto minimalista */}
            <div className="mt-6 pt-4 border-t border-dark-600 text-center">
              <p className="text-gray-500 text-xs mb-2">¿Necesitas ayuda?</p>
              <a href="tel:+593968653593" className="text-neon-cyan font-semibold hover:text-white transition-colors">
                📞 0968653593
              </a>
            </div>
          </div>

          {/* Botón para ocultar formulario */}
          <button
            onClick={() => setShowForm(false)}
            className="w-full mt-4 py-2 text-gray-500 text-sm hover:text-white transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  )
}
