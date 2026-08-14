'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import TypedText from '@/components/TypedText'
import { Mail, Lock, Eye, EyeOff, Loader2, GraduationCap, Building2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginMode, setLoginMode] = useState<'code' | 'email'>('code')
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
    setTilt({ x: y * -2, y: x * 3 })
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
          // Debe coincidir con la duración de la cookie httpOnly que puso el servidor (7 días)
          localStorage.setItem('chaskibots_session_exp', String(Date.now() + 7 * 24 * 60 * 60 * 1000))
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
    <div className="min-h-screen relative bg-chaski-light flex items-start justify-center px-4 pt-10 pb-10">
      {/* Fondo suave con acentos coral */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-chaski-primary/15 blur-[130px] animate-mesh-1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-chaski-gold/15 blur-[120px] animate-mesh-2" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-hack-green/10 blur-[110px] animate-mesh-3" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(229,115,97,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(229,115,97,0.6) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        {/* Chispas de código, eco hacking en colores de marca */}
        <span className="absolute top-[12%] left-[8%] font-mono text-xs text-chaski-primary/25 animate-float">&lt;robot/&gt;</span>
        <span className="absolute top-[22%] right-[10%] font-mono text-xs text-hack-green/25 animate-float" style={{ animationDelay: '1s' }}>01001</span>
        <span className="absolute bottom-[15%] right-[14%] font-mono text-xs text-chaski-gold/30 animate-float" style={{ animationDelay: '2s' }}>sudo access</span>
        <span className="absolute bottom-[10%] left-[10%] font-mono text-xs text-chaski-primary/25 animate-float" style={{ animationDelay: '1.6s' }}>{'{ ia: true }'}</span>
      </div>

      {/* Contenido centrado */}
      <div className={`relative z-10 w-full max-w-md flex flex-col items-center ${mounted ? 'animate-login-enter' : 'opacity-0'}`}>

        {/* Logo oficial Chaski Bots LAB */}
        <div className="relative mb-4 animate-float" style={{ animationDelay: '0.1s' }}>
          <div className="absolute -inset-3 bg-gradient-to-br from-chaski-primary/25 to-chaski-gold/15 rounded-[1.75rem] blur-xl animate-pulse-slow" />
          <div className="relative bg-white rounded-2xl shadow-xl border border-border-soft p-3 animate-card-float overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chaski-primary/[0.08] to-transparent animate-scan-line pointer-events-none" style={{ animationDuration: '3s' }} />
            <Image
              src="/logo.jpg"
              alt="Chaski Bots LAB"
              width={170}
              height={170}
              className="relative w-[110px] sm:w-[125px] h-auto"
              priority
            />
          </div>
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md ring-2 ring-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hack-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-hack-green" />
            </span>
            <span className="text-[10px] font-semibold text-slate-600">online</span>
          </div>
        </div>

        {/* Título con palabras que entran deslizando */}
        <h1 className="text-chaski-dark text-2xl sm:text-3xl font-black leading-tight text-center mb-1 overflow-hidden">
          <span className="inline-block animate-slide-in-left" style={{ animationDelay: '0.15s' }}>El</span>{' '}
          <span className="inline-block animate-slide-in-right" style={{ animationDelay: '0.25s' }}>futuro</span>{' '}
          <span className="inline-block animate-slide-in-left" style={{ animationDelay: '0.35s' }}>se</span>{' '}
          <span className="inline-block animate-slide-in-right text-chaski-primary" style={{ animationDelay: '0.45s' }}>construye</span>{' '}
          <span className="inline-block animate-slide-in-left" style={{ animationDelay: '0.55s' }}>aquí</span>
        </h1>
        <p className={`text-slate-500 text-sm text-center max-w-sm mb-4 ${mounted ? 'animate-stagger-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          Robótica, inteligencia artificial y hacking ético con laboratorios interactivos y proyectos reales.
        </p>

        {/* Panel terminal, entorno hacking en colores de marca */}
        <div className="inline-flex items-center gap-2 bg-chaski-dark px-3.5 py-2 rounded-lg mb-6 shadow-md relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chaski-primary/15 to-transparent animate-scan-line pointer-events-none" />
          <span className="text-chaski-primary font-mono text-xs font-bold relative">&gt;_</span>
          <TypedText
            className="text-slate-300 font-mono text-xs relative"
            lines={['verificando_acceso...', 'autenticando_usuario', 'bienvenido_de_vuelta']}
          />
        </div>

        {/* Card de login */}
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 0.2s ease-out',
            transformStyle: 'preserve-3d',
            animationDelay: '0.4s',
          }}
          className={`w-full ${mounted ? 'animate-login-card' : 'opacity-0'}`}
        >
          <div className="w-full bg-white rounded-2xl shadow-xl p-6 border border-border-soft">
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-chaski-dark">Bienvenido</h2>
              <p className="text-slate-500 text-sm mt-0.5">Elige tu perfil para continuar</p>
            </div>

            {/* Selector de perfil */}
            <div className="relative flex p-1 bg-chaski-light border border-border-soft rounded-xl mb-5">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ transform: loginMode === 'code' ? 'translateX(0%)' : 'translateX(calc(100% + 8px))' }}
              />
              <button
                type="button"
                onClick={() => setLoginMode('code')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                  loginMode === 'code' ? 'text-chaski-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Estudiante
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('email')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                  loginMode === 'email' ? 'text-chaski-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Instructor · Institución
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-sm text-center animate-scale-in">
                  {error}
                </div>
              )}

              {loginMode === 'code' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Código de acceso</label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-white border border-border-soft rounded-xl focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/15 focus:outline-none transition-all placeholder:text-slate-300 font-mono text-base tracking-[0.15em] text-center text-chaski-dark uppercase"
                    placeholder="ABCD1234"
                    maxLength={10}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Pide el código a tu profesor
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-border-soft rounded-xl focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/15 focus:outline-none transition-all placeholder:text-slate-300 text-chaski-dark text-sm"
                        placeholder="tu@email.com"
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-white border border-border-soft rounded-xl focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/15 focus:outline-none transition-all placeholder:text-slate-300 text-chaski-dark text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-chaski-light text-slate-400 hover:text-chaski-primary transition-all active:scale-90"
                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
                className="w-full py-3 bg-chaski-primary text-white font-bold rounded-xl hover:bg-chaski-secondary hover:shadow-glow active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 text-sm"
              >
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
            <div className="mt-4 pt-4 border-t border-border-soft text-center">
              <p className="text-slate-400 text-xs">¿Necesitas ayuda? <a href="tel:+593968653593" className="text-chaski-primary font-medium hover:underline">0968653593</a></p>
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {['Python IDE', 'Lab de IA', 'CAD 3D', 'Terminal Linux'].map((f, i) => (
            <span key={f} className={`px-3 py-1.5 rounded-lg bg-white border border-border-soft text-slate-500 text-xs font-medium hover:border-chaski-primary/40 hover:text-chaski-primary transition-all ${mounted ? 'animate-stagger-in' : 'opacity-0'}`} style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              {f}
            </span>
          ))}
        </div>

        <p className="text-center text-slate-400 text-xs mt-4">© {new Date().getFullYear()} ChaskiBots EDU</p>
      </div>
    </div>
  )
}
