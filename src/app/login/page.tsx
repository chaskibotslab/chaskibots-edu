'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Mail, Lock, Eye, EyeOff, Loader2, Key, ArrowRight } from 'lucide-react'

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
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -6, y: x * 8 })
  }

  const handleCardMouseLeave = () => setTilt({ x: 0, y: 0 })

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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ─── LEFT: Brand panel (desktop) ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative bg-chaski-dark p-12 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-chaski-primary/20 blur-[130px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-chaski-gold/10 blur-[110px]" />
          {/* Circuit-like grid */}
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 animate-slide-in-left">
          <div className="w-11 h-11 rounded-xl overflow-hidden ring-1 ring-white/20">
            <Image src="/chaski.png" alt="ChaskiBots" width={44} height={44} className="w-full h-full object-cover" priority />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">ChaskiBots</p>
            <p className="text-white/40 text-[11px] tracking-[0.2em] uppercase">Edu Platform</p>
          </div>
        </div>

        {/* Message */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-chaski-gold/15 border border-chaski-gold/30 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-chaski-gold animate-pulse" />
            <span className="text-chaski-gold text-xs font-semibold tracking-wide">Robótica · IA · Programación</span>
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight">
            El futuro se<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-chaski-gold via-amber-300 to-chaski-gold">construye</span> aquí
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Aprende robótica, inteligencia artificial y programación con laboratorios interactivos, simuladores 3D y proyectos reales.
          </p>
          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {['Python IDE', 'Lab de IA', 'CAD 3D', 'Simuladores'].map((f, i) => (
              <span key={f} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-[11px]">© {new Date().getFullYear()} ChaskiBots EDU — Educación del Futuro</p>
      </div>

      {/* ─── RIGHT: Form ─── */}
      <div className="flex-1 flex items-center justify-center relative bg-chaski-light px-4 py-8">
        {/* Subtle ambient */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-chaski-primary/8 blur-[100px] pointer-events-none" />

      {/* Card */}
      <div className={`relative z-10 w-full max-w-[400px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div>
          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.2s ease-out',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-300/40 p-7 border border-slate-100">
              {/* Logo + Title */}
              <div className="text-center mb-6">
                <div className="lg:hidden relative mx-auto w-16 h-16 mb-3">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-lg shadow-chaski-primary/20">
                    <Image src="/chaski.png" alt="ChaskiBots" width={64} height={64} className="w-full h-full object-cover" priority />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-chaski-dark">Bienvenido</h1>
                <p className="text-slate-400 text-sm mt-1">Ingresa a tu cuenta para continuar</p>
              </div>

              {/* Tabs */}
              <div className="relative flex p-1 bg-slate-100/80 rounded-xl mb-5">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ transform: loginMode === 'code' ? 'translateX(0%)' : 'translateX(calc(100% + 8px))' }}
                />
                <button
                  type="button"
                  onClick={() => setLoginMode('code')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                    loginMode === 'code' ? 'text-chaski-primary' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Código
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('email')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                    loginMode === 'email' ? 'text-chaski-primary' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-500 px-3 py-2.5 rounded-xl text-sm text-center">
                    {error}
                  </div>
                )}

                {loginMode === 'code' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Código de acceso</label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all placeholder:text-slate-300 font-mono text-lg tracking-[0.15em] text-center text-slate-900 uppercase"
                      placeholder="ABCD1234"
                      maxLength={10}
                      autoFocus
                      required
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                      Pide el código a tu profesor
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Correo electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all placeholder:text-slate-300 text-slate-900 text-sm"
                          placeholder="tu@email.com"
                          autoFocus
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all placeholder:text-slate-300 text-slate-900 text-sm"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3 bg-gradient-to-r from-chaski-primary to-chaski-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-chaski-primary/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-[11px]">¿Necesitas ayuda? <a href="tel:+593968653593" className="text-chaski-primary font-medium hover:underline">0968653593</a></p>
              </div>
            </div>
          </div>
        </div>

        <p className="lg:hidden text-center text-slate-400 text-[11px] mt-5">
          © {new Date().getFullYear()} ChaskiBots EDU
        </p>
      </div>
      </div>
    </div>
  )
}
