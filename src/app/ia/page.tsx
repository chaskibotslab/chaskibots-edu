'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { Brain, Camera, Upload, Mic, Lightbulb, Loader2, Sparkles } from 'lucide-react'

const AIModule = dynamic(() => import('@/components/AIModule'), {
  loading: () => (
    <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
      <Loader2 className="w-8 h-8 animate-spin text-brand-violet" />
      <span className="ml-2 text-slate-600">Cargando módulo de IA...</span>
    </div>
  ),
  ssr: false
})

const FEATURES = [
  { icon: Camera, color: 'brand-purple', title: 'Detección', description: 'Objetos en tiempo real' },
  { icon: Upload, color: 'brand-violet', title: 'Clasificación', description: 'Análisis de imágenes' },
  { icon: Mic, color: 'neon-green', title: 'Voz', description: 'Reconocimiento de voz' }
]

const TIPS = [
  { icon: Lightbulb, color: 'brand-violet', title: 'COCO-SSD', description: 'Detecta 80 tipos de objetos en tiempo real' },
  { icon: Lightbulb, color: 'brand-purple', title: 'MobileNet', description: 'Clasifica imágenes en 1000+ categorías' }
]

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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-violet animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-violet/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-brand-cyan/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Brain className="w-8 h-8 text-brand-violet" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Inteligencia Artificial</h1>
              <p className="text-white/70 max-w-lg mx-auto">
                Reconocimiento de objetos, clasificación de imágenes y voz
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* AI Module */}
          <AIModule />

          {/* Tips */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-violet" />
              Modelos disponibles
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {TIPS.map((tip) => {
                const Icon = tip.icon
                return (
                  <div key={tip.title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-${tip.color}/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${tip.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{tip.title}</h3>
                        <p className="text-slate-500 text-sm">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
