'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { Shield, Lock, Eye, Key, ArrowRight } from 'lucide-react'

export default function HackingPage() {
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

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Seguridad Básica</h3>
              <p className="text-gray-600 text-sm">
                Contraseñas seguras, privacidad y navegación segura en internet.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Análisis de Vulnerabilidades</h3>
              <p className="text-gray-600 text-sm">
                Detecta y comprende las debilidades en sistemas y aplicaciones.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Criptografía</h3>
              <p className="text-gray-600 text-sm">
                Cifrado, mensajes secretos y protección de datos.
              </p>
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
            {EDUCATION_LEVELS.map((level) => (
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
            ))}
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
