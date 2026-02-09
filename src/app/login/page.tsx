'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, Shield, Rocket, Key, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginMode, setLoginMode] = useState<'email' | 'code'>('email')
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
        // Login con código de acceso
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
        // Login con email/password
        result = await login(email, password)
      }
      
      if (result.success) {
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect') || '/niveles'
        router.push(redirect)
      } else {
        setError(result.error || 'Credenciales incorrectas. Intenta de nuevo.')
      }
    } catch {
      setError('Error al iniciar sesión. Intenta más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Panel izquierdo - Branding Futurista */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-50"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/40 rounded-2xl blur-md group-hover:bg-neon-cyan/60 transition-all"></div>
              <Image 
                src="/chaski.png" 
                alt="ChaskiBots Logo" 
                width={70} 
                height={70}
                className="rounded-2xl relative border-2 border-neon-cyan/50 group-hover:border-neon-cyan transition-all"
              />
            </div>
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white via-neon-cyan to-white bg-clip-text text-transparent">ChaskiBots</span>
              <span className="block text-neon-cyan text-sm font-medium tracking-widest">PLATAFORMA EDUCATIVA</span>
            </div>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Aprende <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">robótica, IA</span> y programación de forma divertida
          </h2>
          <p className="text-xl text-gray-400">
            Plataforma educativa interactiva para estudiantes de todas las edades
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white group">
              <div className="w-14 h-14 bg-neon-cyan/20 rounded-xl flex items-center justify-center border border-neon-cyan/30 group-hover:bg-neon-cyan/30 group-hover:border-neon-cyan/50 transition-all">
                <Rocket className="w-7 h-7 text-neon-cyan" />
              </div>
              <span className="text-lg">Cursos interactivos paso a paso</span>
            </div>
            <div className="flex items-center gap-4 text-white group">
              <div className="w-14 h-14 bg-neon-purple/20 rounded-xl flex items-center justify-center border border-neon-purple/30 group-hover:bg-neon-purple/30 group-hover:border-neon-purple/50 transition-all">
                <Sparkles className="w-7 h-7 text-neon-purple" />
              </div>
              <span className="text-lg">Proyectos prácticos y divertidos</span>
            </div>
            <div className="flex items-center gap-4 text-white group">
              <div className="w-14 h-14 bg-neon-green/20 rounded-xl flex items-center justify-center border border-neon-green/30 group-hover:bg-neon-green/30 group-hover:border-neon-green/50 transition-all">
                <Shield className="w-7 h-7 text-neon-green" />
              </div>
              <span className="text-lg">Ambiente seguro para aprender</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-neon-cyan/60 text-sm">
          © 2024 ChaskiBots. Todos los derechos reservados.
        </div>
      </div>

      {/* Panel derecho - Formulario Futurista */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-6 py-12 relative overflow-hidden">
        {/* Efectos de fondo en móvil */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-10 right-10 w-48 h-48 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan/40 rounded-xl blur-md"></div>
                <Image 
                  src="/chaski.png" 
                  alt="ChaskiBots Logo" 
                  width={50} 
                  height={50}
                  className="rounded-xl relative border-2 border-neon-cyan/50"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-neon-cyan bg-clip-text text-transparent">ChaskiBots</span>
            </Link>
          </div>

          {/* Login Card - Futurista */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-pink/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-dark-800/90 backdrop-blur-xl rounded-3xl p-8 border border-neon-cyan/20">
              {/* Línea decorativa superior */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent rounded-full"></div>
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-neon-cyan animate-pulse" />
                <h1 className="text-2xl font-bold text-white text-center">
                  ¡Bienvenido de vuelta!
                </h1>
              </div>
              <p className="text-gray-400 text-center mb-6">
                Ingresa tus credenciales para continuar
              </p>

          {/* Tabs para cambiar modo de login - Futurista */}
          <div className="flex mb-6 bg-dark-700/50 rounded-xl p-1 border border-dark-600">
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                loginMode === 'email' 
                  ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 shadow-lg shadow-neon-cyan/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('code')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                loginMode === 'code' 
                  ? 'bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 text-neon-purple border border-neon-purple/30 shadow-lg shadow-neon-purple/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4 inline mr-2" />
              Código
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {loginMode === 'code' ? (
              /* Login con código de acceso */
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Código de Acceso
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-purple" />
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 bg-dark-700/50 border border-neon-purple/30 rounded-xl focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all placeholder:text-gray-500 font-mono text-lg tracking-wider text-white"
                    placeholder="Ej: ES7A1V6W"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ingresa el código proporcionado por tu profesor o institución
                </p>
              </div>
            ) : (
              /* Login con email/password */
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition-all placeholder:text-gray-500 text-white"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-dark-700/50 border border-dark-600 rounded-xl focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition-all placeholder:text-gray-500 text-white"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-cyan transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-dark-600 bg-dark-700 text-neon-cyan focus:ring-neon-cyan/50" />
                    <span className="text-gray-400">Recordarme</span>
                  </label>
                  <a href="#" className="text-neon-cyan hover:text-white transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-neon-cyan/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20 rounded-xl p-4">
            <p className="text-white font-medium mb-2">
              ¿No tienes cuenta?
            </p>
            <p className="text-sm text-gray-400 mb-3">
              Para registrarte, contáctanos:
            </p>
            <div className="flex items-center justify-center gap-2 text-neon-cyan font-bold">
              <span className="text-xl">📞</span>
              <a href="tel:+593968653593" className="text-lg hover:text-white transition-colors">0968653593</a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📍 Machachi - Ecuador
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Image src="/chaski.png" alt="ChaskiBots" width={24} height={24} className="rounded" />
              <span className="text-sm font-semibold text-white">ChaskiBots</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-dark-600">
            <p className="text-xs text-gray-500 text-center">
              Al iniciar sesión, aceptas nuestros{' '}
              <a href="#" className="text-neon-cyan hover:text-white transition-colors">Términos de Servicio</a>
              {' '}y{' '}
              <a href="#" className="text-neon-cyan hover:text-white transition-colors">Política de Privacidad</a>
            </p>
          </div>
            </div>
          </div>

          {/* Info de acceso */}
          <div className="mt-6 bg-gradient-to-r from-dark-700/80 to-dark-600/80 backdrop-blur-xl rounded-xl p-4 border border-neon-cyan/20">
            <p className="font-semibold mb-2 text-center text-neon-cyan">🔐 Acceso a la plataforma</p>
            <p className="text-xs text-center text-gray-400">
              Ingresa con tu correo y contraseña proporcionados por tu institución.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
