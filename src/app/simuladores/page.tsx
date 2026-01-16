'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SimulatorTabs from '@/components/SimulatorTabs'

export default function SimuladoresPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-chaski-dark mb-4">
              Simuladores Online
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Practica programación, electrónica y robótica con estos simuladores interactivos. 
              Usa las pestañas para elegir un simulador.
            </p>
          </div>

          {/* Sección Educativa - Qué Aprenderás */}
          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🎯</span> ¿Qué destrezas desarrollarás?
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-cyan mb-2">🐍 Python</h4>
                <p className="text-gray-400 text-sm">Aprende lógica de programación, variables, bucles y funciones. Python es el lenguaje más usado en IA y ciencia de datos.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-green mb-2">⚡ Tinkercad</h4>
                <p className="text-gray-400 text-sm">Diseña circuitos electrónicos y programa Arduino virtualmente. Perfecto para aprender electrónica sin componentes físicos.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-purple mb-2">🤖 Wokwi</h4>
                <p className="text-gray-400 text-sm">Simula microcontroladores ESP32 y Arduino con sensores reales. Ideal para proyectos IoT y robótica avanzada.</p>
              </div>
            </div>
            <div className="mt-4 bg-dark-700/50 rounded-xl p-4">
              <p className="text-gray-300 text-sm">
                <strong className="text-neon-orange">💡 ¿Por qué usar simuladores?</strong> Te permiten experimentar, cometer errores y aprender sin riesgo de dañar componentes. 
                Puedes probar tu código antes de cargarlo en hardware real, ahorrando tiempo y recursos.
              </p>
            </div>
          </div>

          <SimulatorTabs />

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-chaski-dark text-lg mb-2">
              💡 Consejo
            </h3>
            <p className="text-gray-600">
              Si algún simulador no carga correctamente dentro de la página, usa el botón 
              "Abrir en su web" para acceder directamente. Algunos sitios tienen restricciones 
              de seguridad que impiden cargar en iframes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
