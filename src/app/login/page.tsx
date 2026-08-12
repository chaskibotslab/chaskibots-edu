'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Mail, Lock, Eye, EyeOff, Loader2, Key, ArrowRight, Terminal, Bot } from 'lucide-react'

const MATRIX_CHARS = '01アカサタナハマヤラワ<>/{}[]#$%01アイウエオ'

function useMatrixColumns(count: number) {
  const [columns, setColumns] = useState<{ left: number; delay: number; duration: number; chars: string[] }[]>([])
  useEffect(() => {
    setColumns(
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
        chars: Array.from({ length: 14 + Math.floor(Math.random() * 10) }).map(
          () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ),
      }))
    )
  }, [count])
  return columns
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
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const matrixColumns = useMatrixColumns(28)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -5, y: x * 6 })
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
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center px-4 py-10">
      {/* ─── Fondo hacker a pantalla completa ─── */}
      <div className="absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-chaski-primary/20 blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-hack-green/10 blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-chaski-accent/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
      </div>

      {/* Matrix code rain, pantalla completa */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {matrixColumns.map((col, i) => (
          <div
            key={i}
            className="absolute top-0 flex flex-col items-center font-mono text-hack-green/60 text-xs leading-4 animate-matrix-fall"
            style={{ left: `${col.left}%`, animationDelay: `${col.delay}s`, animationDuration: `${col.duration}s` }}
          >
            {col.chars.map((c, j) => (
              <span key={j} style={{ opacity: 1 - j / col.chars.length }}>{c}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Scanline sweep + textura CRT */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-hack-green/40 to-transparent animate-scan-line" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 2px, #fff 3px)' }} />

      {/* ─── Contenido centrado ─── */}
      <div className={`relative z-10 w-full max-w-md flex flex-col items-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Robot mascota animado */}
        <div className="relative mb-5 animate-float">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-hack-green/30 animate-spin-slow" style={{ width: '104px', height: '104px', left: '-4px', top: '-4px' }} />
          <div className="absolute -inset-2 rounded-full bg-hack-green/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-hack-green/50 shadow-hack-green bg-black">
            <Image src="/chaski.png" alt="ChaskiBots Bot" width={96} height={96} className="w-full h-full object-cover" priority />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-hack-green flex items-center justify-center ring-4 ring-black">
            <Bot className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* Terminal strip compacto */}
        <div className="w-full rounded-xl bg-black/60 border border-hack-green/25 backdrop-blur-sm overflow-hidden mb-5 animate-fade-in">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-hack-green/20 bg-white/[0.02]">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            <span className="w-2 h-2 rounded-full bg-hack-amber/70" />
            <span className="w-2 h-2 rounded-full bg-hack-green/70" />
            <span className="ml-2 flex items-center gap-1.5 text-hack-green/50 text-[10px] font-mono">
              <Terminal className="w-3 h-3" /> access.sh
            </span>
          </div>
          <div className="px-3 py-2 font-mono text-[11px]">
            <p className="text-hack-green/80"><span className="text-hack-green">$</span> access --level=full<span className="inline-block w-1.5 h-3 bg-hack-green ml-1 animate-cursor-blink align-middle" /></p>
          </div>
        </div>

        {/* Título con glitch */}
        <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight text-center mb-2">
          El futuro se{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-hack-green via-emerald-300 to-chaski-primary animate-glitch">construye</span>{' '}
          aquí
        </h1>
        <p className="text-white/50 text-sm text-center max-w-sm mb-6">
          Robótica, inteligencia artificial y hacking ético con laboratorios interactivos y proyectos reales.
        </p>

        {/* ─── Card de login, oscura y centrada ─── */}
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 0.2s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="w-full"
        >
          <div className="relative w-full bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl shadow-hack-green/10 p-7 border border-hack-green/20 overflow-hidden">
            {/* Borde animado sutil */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(57,255,20,0.4), transparent 30%)' }} />

            <div className="relative">
              {/* Status badge */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-hack-green/10 border border-hack-green/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-hack-green animate-pulse" />
                  <span className="text-hack-green text-[10px] font-mono font-semibold tracking-wide">SYSTEM ONLINE</span>
                </div>
              </div>

              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-white">Bienvenido</h2>
                <p className="text-white/40 text-sm mt-1">Ingresa a tu cuenta para continuar</p>
              </div>

              {/* Tabs */}
              <div className="relative flex p-1 bg-white/5 border border-white/10 rounded-xl mb-5">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-hack-green/15 border border-hack-green/30 rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ transform: loginMode === 'code' ? 'translateX(0%)' : 'translateX(calc(100% + 8px))' }}
                />
                <button
                  type="button"
                  onClick={() => setLoginMode('code')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                    loginMode === 'code' ? 'text-hack-green' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Código
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('email')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                    loginMode === 'email' ? 'text-hack-green' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-xl text-sm text-center animate-scale-in">
                    {error}
                  </div>
                )}

                {loginMode === 'code' ? (
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-1.5">Código de acceso</label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:border-hack-green focus:ring-2 focus:ring-hack-green/20 focus:outline-none transition-all placeholder:text-white/20 font-mono text-lg tracking-[0.15em] text-center text-white uppercase"
                      placeholder="ABCD1234"
                      maxLength={10}
                      autoFocus
                      required
                    />
                    <p className="text-[11px] text-white/30 mt-1.5 text-center">
                      Pide el código a tu profesor
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white/50 mb-1.5">Correo electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:border-hack-green focus:ring-2 focus:ring-hack-green/20 focus:outline-none transition-all placeholder:text-white/20 text-white text-sm"
                          placeholder="tu@email.com"
                          autoFocus
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/50 mb-1.5">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/15 rounded-xl focus:border-hack-green focus:ring-2 focus:ring-hack-green/20 focus:outline-none transition-all placeholder:text-white/20 text-white text-sm"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-hack-green transition-colors"
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
                  className="relative w-full py-3.5 bg-gradient-to-r from-chaski-primary via-chaski-secondary to-hack-green text-white font-bold rounded-xl hover:shadow-glow-lg active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
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
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <p className="text-white/30 text-[11px]">¿Necesitas ayuda? <a href="tel:+593968653593" className="text-hack-green font-medium hover:underline">0968653593</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Python IDE', 'Lab de IA', 'CAD 3D', 'Terminal Linux'].map((f, i) => (
            <span key={f} className="px-3 py-1.5 rounded-lg bg-hack-green/5 border border-hack-green/20 text-hack-green/70 text-xs font-mono font-medium animate-fade-in hover:bg-hack-green/10 hover:border-hack-green/40 hover:scale-105 transition-all" style={{ animationDelay: `${i * 0.1}s` }}>
              {f}
            </span>
          ))}
        </div>

        <p className="text-center text-white/25 text-[11px] mt-6 font-mono">© {new Date().getFullYear()} ChaskiBots EDU — Educación del Futuro</p>
      </div>
    </div>
  )
}
