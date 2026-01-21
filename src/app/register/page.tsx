'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, ArrowLeft, MessageCircle } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chaski-dark via-blue-900 to-indigo-900 px-4 py-12">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-chaski-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image 
              src="/chaski.png" 
              alt="ChaskiBots Logo" 
              width={80} 
              height={80}
              className="rounded-2xl shadow-lg"
            />
          </div>

          <h1 className="text-2xl font-bold text-chaski-dark mb-2">
            ¡Únete a ChaskiBots!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Para registrarte en nuestra plataforma educativa, contáctanos directamente
          </p>

          {/* Información de contacto */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              📚 Contáctanos para inscribirte
            </h2>

            {/* Teléfono */}
            <a 
              href="tel:+593968653593" 
              className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl mb-4 transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="w-5 h-5" />
              <span className="text-lg">0968653593</span>
            </a>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/593968653593?text=Hola,%20me%20interesa%20inscribirme%20en%20ChaskiBots%20EDU" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-xl mb-4 transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Escríbenos por WhatsApp</span>
            </a>

            {/* Ubicación */}
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Machachi - Ecuador</span>
            </div>
          </div>

          {/* Qué ofrecemos */}
          <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">🤖 ¿Qué aprenderás?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Robótica desde nivel inicial
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Programación con Arduino y ESP32
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Inteligencia Artificial básica
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Proyectos prácticos y divertidos
              </li>
            </ul>
          </div>

          {/* Volver al login */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-chaski-blue hover:text-chaski-dark font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-sm mt-6">
          © 2024 ChaskiBots. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
