'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Bot, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        // Redirigir según el rol o a la página solicitada
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chaski-dark via-blue-900 to-indigo-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-chaski-accent to-blue-400 rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ChaskiBots EDU</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-chaski-dark text-center mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chaski-accent focus:border-transparent transition-all"
                  placeholder="tu@correo.com"
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chaski-accent focus:border-transparent transition-all"
                  placeholder="••••••••"
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

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-chaski-blue font-semibold hover:underline">
                Regístrate aquí
              </Link>
            </p>
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

        {/* Demo credentials */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white text-sm">
          <p className="font-semibold mb-3 text-center">🎓 Credenciales de Prueba</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2">
              <span className="text-cyan-300">Admin:</span>
              <span className="opacity-80">admin@chaskibots.com / admin2024</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2">
              <span className="text-purple-300">Profesor:</span>
              <span className="opacity-80">profesor@chaskibots.com / profe123</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2">
              <span className="text-pink-300">Estudiante:</span>
              <span className="opacity-80">estudiante@chaskibots.com / estudiante123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
