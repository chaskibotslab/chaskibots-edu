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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Mesh gradient background - light & modern */}
      <div className="absolute inset-0 bg-[#f0f4ff]" />
      <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-[#007AFF]/30 to-[#5E5CE6]/25 blur-[120px] animate-mesh-1" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-tl from-[#30B0C7]/25 to-[#10b981]/15 blur-[120px] animate-mesh-2" />
      <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] max-w-[350px] max-h-[350px] rounded-full bg-gradient-to-bl from-[#ec4899]/15 to-[#5E5CE6]/10 blur-[100px] animate-mesh-3" />

      {/* Floating geometric shapes */}
      <div className="absolute top-16 left-16 w-16 h-16 border border-[#007AFF]/20 rounded-xl animate-spin-slow opacity-60" />
      <div className="absolute bottom-24 right-20 w-12 h-12 border border-[#5E5CE6]/20 rounded-full animate-float opacity-50" />
      <div className="absolute top-1/4 right-[15%] w-8 h-8 bg-[#007AFF]/10 rounded-lg animate-bounce opacity-60" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 left-[12%] w-6 h-6 bg-[#5E5CE6]/10 rounded-full animate-ping opacity-40" />
      <div className="absolute top-[60%] right-[8%] w-3 h-3 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[15%] left-[40%] w-20 h-20 border border-[#30B0C7]/10 rounded-2xl rotate-45 animate-float" style={{ animationDelay: '2s' }} />

      {/* Card */}
      <div className={`relative z-10 w-full max-w-[380px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="animate-card-float" style={{ perspective: '1200px' }}>
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
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-white/60">
              {/* Logo + Title */}
              <div className="text-center mb-5">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#007AFF] via-[#5E5CE6] to-[#30B0C7] rounded-3xl opacity-50 blur-lg animate-pulse-slow" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#007AFF] via-[#5E5CE6] to-[#30B0C7] rounded-2xl animate-spin-border opacity-70" />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-2xl shadow-[#007AFF]/30">
                    <Image
                      src="/chaski.png"
                      alt="ChaskiBots"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-slate-900">ChaskiBots</h1>
                <p className="text-slate-400 text-xs mt-0.5">Educación del Futuro</p>
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
                    loginMode === 'code' ? 'text-[#007AFF]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Código
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('email')}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                    loginMode === 'email' ? 'text-[#007AFF]' : 'text-slate-400 hover:text-slate-600'
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
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all placeholder:text-slate-300 font-mono text-lg tracking-[0.15em] text-center text-slate-900 uppercase"
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
                          className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all placeholder:text-slate-300 text-slate-900 text-sm"
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
                          className="w-full pl-10 pr-10 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all placeholder:text-slate-300 text-slate-900 text-sm"
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
                  className="relative w-full py-3 bg-[#007AFF] text-white font-semibold rounded-xl hover:bg-[#0066DD] hover:shadow-lg hover:shadow-[#007AFF]/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 overflow-hidden"
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
                <p className="text-slate-400 text-[11px]">¿Necesitas ayuda? <a href="tel:+593968653593" className="text-[#007AFF] font-medium hover:underline">0968653593</a></p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[11px] mt-5">
          © {new Date().getFullYear()} ChaskiBots EDU
        </p>
      </div>
    </div>
  )
}
