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
