'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AIModule from '@/components/AIModule'
import { useAuth } from '@/components/AuthProvider'
import { Brain, Camera, Upload, Mic, Lightbulb, Loader2 } from 'lucide-react'

export default function IAPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/ia')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Header />
      
      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-neon-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neon-purple/30">
              <Brain className="w-8 h-8 text-neon-purple" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Inteligencia Artificial</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Reconocimiento de objetos, clasificación de imágenes y voz
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-dark-800/80 backdrop-blur rounded-2xl p-5 border border-dark-600 text-center">
              <div className="w-12 h-12 bg-neon-cyan/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-neon-cyan" />
              </div>
              <h3 className="font-semibold text-white mb-1">Detección</h3>
              <p className="text-gray-500 text-sm">Objetos en tiempo real</p>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-2xl p-5 border border-dark-600 text-center">
              <div className="w-12 h-12 bg-neon-purple/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-neon-purple" />
              </div>
              <h3 className="font-semibold text-white mb-1">Clasificación</h3>
              <p className="text-gray-500 text-sm">Análisis de imágenes</p>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-2xl p-5 border border-dark-600 text-center">
              <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="font-semibold text-white mb-1">Voz</h3>
              <p className="text-gray-500 text-sm">Reconocimiento de voz</p>
            </div>
          </div>

          {/* AI Module */}
          <AIModule />

          {/* Tips */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-dark-800/80 backdrop-blur rounded-2xl p-5 border border-dark-600">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-neon-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">COCO-SSD</h3>
                  <p className="text-gray-500 text-sm">Detecta 80 tipos de objetos en tiempo real</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-800/80 backdrop-blur rounded-2xl p-5 border border-dark-600">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-neon-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">MobileNet</h3>
                  <p className="text-gray-500 text-sm">Clasifica imágenes en 1000+ categorías</p>
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
