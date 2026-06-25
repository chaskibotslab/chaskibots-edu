'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, ArrowLeft, MessageCircle, Bot, Sparkles, Check } from 'lucide-react'

const FEATURES = [
  'Robótica desde nivel inicial',
  'Programación con Arduino y ESP32',
  'Inteligencia Artificial básica',
  'Proyectos prácticos y divertidos'
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-cyan/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-brand-purple/10 p-8 text-center border border-white/20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-2xl blur-lg opacity-60"></div>
              <Image
                src="/chaski.png"
                alt="ChaskiBots Logo"
                width={80}
                height={80}
                className="relative rounded-2xl border-4 border-white shadow-xl"
              />
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1 flex items-center justify-center gap-2">
            <Bot className="w-6 h-6 text-brand-purple" />
            ¡Únete a ChaskiBots!
          </h1>
          <p className="text-slate-500 text-sm mb-6 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            Educación del Futuro
          </p>

          <p className="text-slate-600 mb-6">
            Para registrarte en nuestra plataforma educativa, contáctanos directamente
          </p>

          {/* Contacto */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Contáctanos para inscribirte
            </h2>

            <a
              href="tel:+593968653593"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl mb-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <Phone className="w-5 h-5" />
              <span className="text-lg">0968653593</span>
            </a>

            <a
              href="https://wa.me/593968653593?text=Hola,%20me%20interesa%20inscribirme%20en%20ChaskiBots%20EDU"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-xl mb-4 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Escríbenos por WhatsApp</span>
            </a>

            <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Machachi - Ecuador</span>
            </div>
          </div>

          {/* Qué ofrecemos */}
          <div className="text-left bg-slate-50 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-slate-900 mb-3">¿Qué aprenderás?</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-brand-purple hover:text-brand-violet font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} ChaskiBots. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
