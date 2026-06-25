'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Mail, Lock, Eye, EyeOff, Loader2, Key, ArrowRight, Bot, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginMode, setLoginMode] = useState<'email' | 'code'>('code')
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
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden px-4 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Fondo con gradiente y blobs animados */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-cyan/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-violet/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Tarjeta principal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-brand-purple/10 p-8 border border-white/20">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-2xl blur-lg opacity-60"></div>
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                <Image src="/chaski.png" alt="ChaskiBots" fill className="object-cover" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <Bot className="w-8 h-8 text-brand-purple" />
              ChaskiBots
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              Educación del Futuro
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setLoginMode('code')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                loginMode === 'code'
                  ? 'bg-white text-brand-purple shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Key className="w-4 h-4" />
              Código
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                loginMode === 'email'
                  ? 'bg-white text-brand-purple shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
              </div>
            )}

            {loginMode === 'code' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Código de acceso
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-purple focus:ring-0 transition-all placeholder:text-slate-400 font-mono text-xl tracking-[0.2em] text-center text-slate-900 uppercase"
                  placeholder="ABCD1234"
                  maxLength={10}
                  autoFocus
                  required
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Pide el código a tu profesor o administrador
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-purple focus:ring-0 transition-all placeholder:text-slate-400 text-slate-900"
                      placeholder="tu@email.com"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-purple focus:ring-0 transition-all placeholder:text-slate-400 text-slate-900"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold rounded-2xl hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-purple/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
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

          {/* Contacto */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-slate-500 text-xs mb-1">¿Necesitas ayuda?</p>
            <a href="tel:+593968653593" className="text-brand-purple font-semibold hover:text-brand-violet transition-colors text-sm">
              0968653593
            </a>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} ChaskiBots EDU
        </p>
      </div>
    </div>
  )
}
