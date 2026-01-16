'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AIModule from '@/components/AIModule'
import { Brain, Camera, Upload, Mic, Lightbulb } from 'lucide-react'

export default function IAPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-chaski-dark mb-4">
              Aprende Inteligencia Artificial
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explora cómo la IA puede <strong>reconocer objetos con la cámara</strong>, 
              <strong> clasificar imágenes</strong> y <strong>entender tu voz</strong>. 
              Autoriza el uso de cámara y micrófono cuando el navegador lo solicite.
            </p>
          </div>

          {/* Sección Educativa - Qué Aprenderás */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🎯</span> ¿Qué destrezas desarrollarás?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-cyan mb-2">Pensamiento Computacional</h4>
                <p className="text-gray-400 text-sm">Entenderás cómo las máquinas "ven" y procesan información visual, descomponiendo problemas complejos en pasos simples.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-purple mb-2">Reconocimiento de Patrones</h4>
                <p className="text-gray-400 text-sm">Aprenderás cómo la IA identifica características en imágenes para clasificar objetos, similar a como tu cerebro reconoce caras.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-green mb-2">Análisis de Datos</h4>
                <p className="text-gray-400 text-sm">Comprenderás cómo los modelos fueron entrenados con miles de imágenes para aprender a reconocer objetos.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-orange mb-2">Aplicaciones Prácticas</h4>
                <p className="text-gray-400 text-sm">Descubrirás cómo esta tecnología se usa en autos autónomos, cámaras de seguridad, filtros de redes sociales y más.</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Detección de Objetos</h3>
              <p className="text-gray-600 text-sm mb-3">
                Usa tu cámara para detectar objetos en tiempo real con COCO-SSD.
              </p>
              <div className="bg-blue-50 rounded-lg p-3 text-left">
                <p className="text-xs text-blue-700"><strong>¿Cómo funciona?</strong> El modelo analiza cada frame de video, busca patrones aprendidos y dibuja rectángulos alrededor de los objetos que reconoce.</p>
              </div>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Clasificación de Imágenes</h3>
              <p className="text-gray-600 text-sm mb-3">
                Sube una imagen y MobileNet te dirá qué contiene.
              </p>
              <div className="bg-purple-50 rounded-lg p-3 text-left">
                <p className="text-xs text-purple-700"><strong>¿Cómo funciona?</strong> La red neuronal compara tu imagen con millones de ejemplos que aprendió y te dice qué objeto es más probable.</p>
              </div>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mic className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-chaski-dark mb-2">Reconocimiento de Voz</h3>
              <p className="text-gray-600 text-sm mb-3">
                Habla y la IA transcribirá lo que dices en texto.
              </p>
              <div className="bg-green-50 rounded-lg p-3 text-left">
                <p className="text-xs text-green-700"><strong>¿Cómo funciona?</strong> Convierte ondas de sonido en texto analizando patrones de frecuencia y comparándolos con modelos de lenguaje.</p>
              </div>
            </div>
          </div>

          {/* AI Module */}
          <AIModule />

          {/* Tips */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-chaski-dark mb-2">¿Qué es COCO-SSD?</h3>
                  <p className="text-gray-600 text-sm">
                    Es un modelo de IA entrenado para detectar 80 tipos de objetos comunes 
                    como personas, animales, vehículos, muebles y más. Funciona en tiempo real 
                    directamente en tu navegador.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-chaski-dark mb-2">¿Qué es MobileNet?</h3>
                  <p className="text-gray-600 text-sm">
                    Es una red neuronal ligera que puede clasificar imágenes en más de 1000 
                    categorías. Está optimizada para funcionar rápidamente en dispositivos 
                    móviles y navegadores web.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
