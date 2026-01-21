'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, Shield, Rocket, Key } from 'lucide-react'

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
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-chaski-dark via-blue-900 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-chaski-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-4">
            <Image 
              src="/chaski.png" 
              alt="ChaskiBots Logo" 
              width={60} 
              height={60}
              className="rounded-2xl"
            />
            <span className="text-3xl font-bold text-white">ChaskiBots EDU</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Aprende robótica, IA y programación de forma divertida
          </h2>
          <p className="text-xl text-blue-200">
            Plataforma educativa interactiva para estudiantes de todas las edades
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6" />
              </div>
              <span className="text-lg">Cursos interactivos paso a paso</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-lg">Proyectos prácticos y divertidos</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-lg">Ambiente seguro para aprender</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-blue-300 text-sm">
          © 2024 ChaskiBots. Todos los derechos reservados.
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image 
                src="/chaski.png" 
                alt="ChaskiBots Logo" 
                width={50} 
                height={50}
                className="rounded-xl"
              />
              <span className="text-2xl font-bold text-chaski-dark">ChaskiBots EDU</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-chaski-dark text-center mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Ingresa tus credenciales para continuar
          </p>

          {/* Tabs para cambiar modo de login */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMode === 'email' 
                  ? 'bg-white text-chaski-dark shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('code')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMode === 'code' 
                  ? 'bg-white text-chaski-dark shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Key className="w-4 h-4 inline mr-2" />
              Código
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {loginMode === 'code' ? (
              /* Login con código de acceso */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Acceso
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chaski-accent focus:border-transparent transition-all placeholder:text-gray-400 font-mono text-lg tracking-wider"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chaski-accent focus:border-transparent transition-all placeholder:text-gray-300"
                      placeholder=""
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chaski-accent focus:border-transparent transition-all placeholder:text-gray-300"
                      placeholder=""
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Recordarme</span>
                  </label>
                  <a href="#" className="text-chaski-blue hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <p className="text-gray-700 font-medium mb-2">
              ¿No tienes cuenta?
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Para registrarte, contáctanos:
            </p>
            <div className="flex items-center justify-center gap-2 text-chaski-dark font-bold">
              <span className="text-xl">📞</span>
              <a href="tel:+593968653593" className="text-lg hover:text-chaski-blue">0968653593</a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📍 Machachi - Ecuador
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Image src="/chaski.png" alt="ChaskiBots" width={24} height={24} className="rounded" />
              <span className="text-sm font-semibold text-chaski-dark">ChaskiBots</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Al iniciar sesión, aceptas nuestros{' '}
              <a href="#" className="text-chaski-blue hover:underline">Términos de Servicio</a>
              {' '}y{' '}
              <a href="#" className="text-chaski-blue hover:underline">Política de Privacidad</a>
            </p>
          </div>
        </div>

        {/* Info de acceso */}
        <div className="mt-6 bg-gradient-to-r from-chaski-dark to-blue-900 rounded-xl p-4 text-white text-sm">
          <p className="font-semibold mb-2 text-center">🔐 Acceso a la plataforma</p>
          <p className="text-xs text-center opacity-90">
            Ingresa con tu correo y contraseña proporcionados por tu institución.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
