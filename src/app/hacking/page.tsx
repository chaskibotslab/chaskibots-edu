'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { Shield, Lock, Eye, Key, ArrowRight } from 'lucide-react'

export default function HackingPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [userCourses, setUserCourses] = useState<any[]>([])

  const loadUserCourses = async () => {
    try {
      if (!user) return
      if (user.role === 'teacher') {
        const teacherId = user.accessCode || ''
        const res = await fetch(`/api/teacher-courses?teacherId=${teacherId}`)
        const data = await res.json()
        if (data.assignments && data.assignments.length > 0) {
          setUserCourses(data.assignments)
        } else {
          if (user.courseId) setUserCourses([{ courseId: user.courseId, levelId: user.levelId }])
        }
      } else if (user.role === 'student') {
        if (user.courseId) setUserCourses([{ courseId: user.courseId, levelId: user.levelId }])
      } else {
        setUserCourses([])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role !== 'admin') {
      loadUserCourses()
    }
    if (!isLoading && (!isAuthenticated || !user)) {
      setUserCourses([])
    }
  }, [isLoading, isAuthenticated, user])

  const allowedLevelIds = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') return EDUCATION_LEVELS.map(l => l.id)
    const levelIds = new Set<string>()

    if (user.role === 'teacher') {
      if (userCourses.length > 0) {
        userCourses.forEach(course => {
          if (course.levelId) levelIds.add(course.levelId)
        })
      } else {
        if (user.levelId) levelIds.add(user.levelId)
      }
    } else {
      if (user.levelId) levelIds.add(user.levelId)
    }

    return Array.from(levelIds)
  }, [user, userCourses])

  const isAdmin = user?.role === 'admin'
  const canAccessLevel = (levelId: string) => isAdmin || allowedLevelIds.includes(levelId)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-chaski-dark mb-4">
              Hacking Ético
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Aprende seguridad informática de forma responsable. Protege sistemas, 
              detecta vulnerabilidades y conviértete en un experto en ciberseguridad.
            </p>
          </div>

          {/* Sección Educativa - Qué Aprenderás */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🎯</span> ¿Qué destrezas desarrollarás?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-green mb-2">Pensamiento Crítico</h4>
                <p className="text-gray-400 text-sm">Aprenderás a analizar sistemas desde la perspectiva de un atacante para encontrar y corregir debilidades antes que otros.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-cyan mb-2">Resolución de Problemas</h4>
                <p className="text-gray-400 text-sm">Desarrollarás habilidades para identificar vulnerabilidades y crear soluciones de seguridad efectivas.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-purple mb-2">Ética Digital</h4>
                <p className="text-gray-400 text-sm">Comprenderás la responsabilidad que conlleva el conocimiento técnico y cómo usarlo para proteger, no para dañar.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-orange mb-2">Habilidades Profesionales</h4>
                <p className="text-gray-400 text-sm">La ciberseguridad es una de las carreras más demandadas. Estas habilidades te preparan para el futuro laboral.</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Seguridad Básica</h3>
              <p className="text-gray-600 text-sm mb-3">
                Contraseñas seguras, privacidad y navegación segura en internet.
              </p>
              <div className="bg-green-50 rounded-lg p-3 text-left">
                <p className="text-xs text-green-700"><strong>¿Cómo funciona?</strong> Aprenderás a crear contraseñas fuertes, usar autenticación de dos factores y reconocer sitios web falsos.</p>
              </div>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Análisis de Vulnerabilidades</h3>
              <p className="text-gray-600 text-sm mb-3">
                Detecta y comprende las debilidades en sistemas y aplicaciones.
              </p>
              <div className="bg-blue-50 rounded-lg p-3 text-left">
                <p className="text-xs text-blue-700"><strong>¿Cómo funciona?</strong> Usarás herramientas para escanear sistemas, identificar puertos abiertos y encontrar configuraciones inseguras.</p>
              </div>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Criptografía</h3>
              <p className="text-gray-600 text-sm mb-3">
                Cifrado, mensajes secretos y protección de datos.
              </p>
              <div className="bg-purple-50 rounded-lg p-3 text-left">
                <p className="text-xs text-purple-700"><strong>¿Cómo funciona?</strong> Aprenderás algoritmos de cifrado como AES y RSA, y cómo se protegen las comunicaciones en internet.</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-6 mb-12">
            <h3 className="font-bold text-amber-800 text-lg mb-2 flex items-center gap-2">
              ⚠️ Importante: Ética en la Seguridad
            </h3>
            <p className="text-amber-700">
              El hacking ético se practica <strong>solo con autorización</strong> y con fines 
              educativos o de mejora de seguridad. Nunca uses estos conocimientos para 
              actividades ilegales o dañinas. Siempre respeta la privacidad y los sistemas ajenos.
            </p>
          </div>

          {/* Levels */}
          <h2 className="text-2xl font-bold text-chaski-dark mb-6 text-center">
            Selecciona tu Nivel
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
            {EDUCATION_LEVELS.map((level) => {
              const hasAccess = canAccessLevel(level.id)

              if (!hasAccess && !isAdmin) {
                return (
                  <div
                    key={level.id}
                    className="level-card bg-dark-800/60 text-white text-center opacity-50 cursor-not-allowed border border-dark-700"
                  >
                    <div className="text-2xl mb-2">
                      <Lock className="w-6 h-6 mx-auto text-gray-400" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-300">{level.name}</h3>
                    <p className="text-xs text-gray-400">Sin acceso</p>
                  </div>
                )
              }

              return (
                <Link
                  key={level.id}
                  href={`/nivel/${level.id}?area=hacking`}
                  className={`level-card bg-gradient-to-br ${level.color} text-white text-center group`}
                >
                  <div className="text-2xl mb-1">{level.icon}</div>
                  <h3 className="font-bold text-sm">{level.name}</h3>
                  <p className="text-xs opacity-80">{level.ageRange}</p>
                  <div className="mt-2 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Tools */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-bold text-chaski-dark text-lg mb-4 text-center">
              🔧 Herramientas que Aprenderás
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['CrypTool', 'Wireshark', 'Nmap', 'Burp Suite', 'OWASP', 'Kali Linux', 'Metasploit', 'HackTheBox'].map((tool) => (
                <span key={tool} className="badge badge-green">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
