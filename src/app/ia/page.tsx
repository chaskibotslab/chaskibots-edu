'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { Brain, Camera, Upload, Mic, Lightbulb, Loader2, Sparkles } from 'lucide-react'
import MatrixRain from '@/components/MatrixRain'

const AILab = dynamic(() => import('@/components/AILab'), {
  loading: () => (
    <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
      <Loader2 className="w-8 h-8 animate-spin text-chaski-primary" />
      <span className="ml-2 text-slate-600">Cargando laboratorio de IA...</span>
    </div>
  ),
  ssr: false
})

const FEATURES = [
  { icon: Camera, color: 'chaski-primary', title: 'Detección', description: 'Objetos en tiempo real' },
  { icon: Upload, color: 'chaski-accent', title: 'Clasificación', description: 'Análisis de imágenes' },
  { icon: Mic, color: 'neon-green', title: 'Voz', description: 'Reconocimiento de voz' }
]

const TIPS = [
  { icon: Lightbulb, color: 'chaski-accent', title: 'COCO-SSD', description: 'Detecta 80 tipos de objetos en tiempo real' },
  { icon: Lightbulb, color: 'chaski-primary', title: 'MobileNet', description: 'Clasifica imágenes en 1000+ categorías' }
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
        <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 text-center shadow-2xl animate-fade-in">
            <MatrixRain count={10} className="opacity-30" />
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            <div className="absolute top-0 left-0 w-64 h-64 bg-chaski-accent/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-chaski-gold/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4 animate-slide-up">
                <span className="w-1.5 h-1.5 rounded-full bg-chaski-gold animate-pulse" />
                <span className="text-white/90 text-xs font-semibold tracking-wide">Visión por computadora en tiempo real</span>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 animate-scale-in">
                <Brain className="w-8 h-8 text-chaski-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 animate-slide-up" style={{ animationDelay: '0.05s' }}>Inteligencia Artificial</h1>
              <p className="text-white/70 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Reconocimiento de objetos, clasificación de imágenes y voz
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-chaski-primary/30 transition-all duration-300 text-center animate-scale-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* AI Lab */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <AILab />
          </div>

          {/* Tips */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-chaski-accent" />
              Modelos disponibles
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {TIPS.map((tip, i) => {
                const Icon = tip.icon
                return (
                  <div key={tip.title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-chaski-primary/30 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${i * 0.05}s` }}>
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
