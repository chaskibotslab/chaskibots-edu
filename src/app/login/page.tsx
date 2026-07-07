'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Mail, Lock, Eye, EyeOff, Loader2, Key, ArrowRight, Bot, Sparkles } from 'lucide-react'

interface Particle {
  left: number
  top: number
  size: number
  duration: number
  delay: number
  color: string
}

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
  const [particles, setParticles] = useState<Particle[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    const colors = ['#007AFF', '#339DFF', '#5E5CE6', '#30B0C7']
    setParticles(
      Array.from({ length: 26 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 12 + 10,
        delay: Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    )
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10 bg-slate-950">
      {/* Fondo animado: gradiente en movimiento + grid + orbes */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#050a18] to-slate-950" />
      <div className="absolute inset-0 bg-cyber-grid opacity-[0.15]" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[550px] h-[550px] bg-[#007AFF]/25 rounded-full blur-[150px] animate-orbit-slow" />
        <div className="absolute bottom-0 right-1/4 w-[550px] h-[550px] bg-[#30B0C7]/20 rounded-full blur-[150px] animate-orbit-slow" style={{ animationDelay: '-6s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-[#5E5CE6]/15 rounded-full blur-[170px] animate-pulse-slow" />
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full animate-particle-float"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: 0.5,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Contenido: tarjeta centrada */}
      <div className={`relative z-10 w-full flex justify-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* Tarjeta principal con tilt 3D */}
        <div className="w-full max-w-sm animate-card-float" style={{ perspective: '1200px' }}>
          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="relative"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#007AFF] via-[#5E5CE6] to-[#30B0C7] rounded-3xl opacity-40 blur-md animate-gradient bg-[length:200%_auto]" />
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/40 p-6 border border-white/40">

              {/* Header */}
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center mb-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#30B0C7] rounded-2xl blur-lg opacity-60 animate-pulse-slow"></div>
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                    <Image src="/chaski.png" alt="ChaskiBots" fill className="object-cover" />
                  </div>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  <Bot className="w-6 h-6 text-brand-purple" />
                  ChaskiBots
                </h1>
                <p className="text-slate-500 text-xs mt-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                  Educación del Futuro
                </p>
              </div>

              {/* Tabs con indicador deslizante */}
              <div className="relative flex gap-2 p-1 bg-slate-100 rounded-2xl mb-5">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ transform: loginMode === 'code' ? 'translateX(0%)' : 'translateX(calc(100% + 8px))' }}
                />
                <button
                  type="button"
                  onClick={() => setLoginMode('code')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                    loginMode === 'code' ? 'text-brand-purple' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  Código
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('email')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                    loginMode === 'email' ? 'text-brand-purple' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>

              {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-purple focus:ring-0 transition-all placeholder:text-slate-400 font-mono text-lg tracking-[0.2em] text-center text-slate-900 uppercase"
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
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-purple focus:ring-0 transition-all placeholder:text-slate-400 text-slate-900"
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
                      className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-brand-purple focus:ring-0 transition-all placeholder:text-slate-400 text-slate-900"
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
              className="relative w-full py-3.5 bg-gradient-to-r from-[#007AFF] to-[#0051D5] text-white font-bold rounded-2xl hover:scale-[1.02] hover:shadow-xl hover:shadow-[#007AFF]/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
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
              <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                <p className="text-slate-500 text-xs mb-1">¿Necesitas ayuda?</p>
                <a href="tel:+593968653593" className="text-brand-purple font-semibold hover:text-brand-violet transition-colors text-sm">
                  0968653593
                </a>
              </div>
            </div>
          </div>

          <p className="text-center text-white/40 text-xs mt-6">
            © {new Date().getFullYear()} ChaskiBots EDU
          </p>
        </div>
      </div>
    </div>
  )
}
