'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { useUserGrade } from '@/hooks/useUserGrade'
import { isProgramAvailable, minGradeLabel } from '@/lib/programGating'
import { Box, Ruler, Wrench, Loader2, Lock, Sparkles } from 'lucide-react'
import MatrixRain from '@/components/MatrixRain'

const CADLab = dynamic(() => import('@/components/CADLab'), {
  loading: () => (
    <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
      <Loader2 className="w-8 h-8 animate-spin text-chaski-accent" />
      <span className="ml-2 text-slate-600">Cargando laboratorio de diseño...</span>
    </div>
  ),
  ssr: false
})

const FEATURES = [
  { icon: Box, color: 'chaski-primary', title: 'Visor 3D', description: 'Explora modelos interactivos' },
  { icon: Wrench, color: 'chaski-accent', title: 'Constructor', description: 'Compón formas paramétricas' },
  { icon: Ruler, color: 'neon-green', title: 'Medidas reales', description: 'Piensa en escala y proporción' }
]

export default function DisenoPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const { gradeNumber, loading: gradeLoading, isAdmin } = useUserGrade()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/diseno')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-chaski-accent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const available = isAdmin || gradeLoading || isProgramAvailable('diseno_visor', gradeNumber)

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
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-brand-cyan/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Box className="w-8 h-8 text-chaski-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Diseño 3D</h1>
              <p className="text-white/70 max-w-lg mx-auto">
                Explora, construye y compón modelos 3D reales
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-chaski-primary/30 transition-all duration-300 text-center animate-scale-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Gated content */}
          {!available ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center animate-scale-in">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Disponible desde {minGradeLabel('diseno_visor')}</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                El laboratorio de diseño 3D requiere manejo de formas y medidas que se trabaja a partir de {minGradeLabel('diseno_visor')}.
                Sigue avanzando en Robótica e IA, que están disponibles para todos los grados.
              </p>
            </div>
          ) : (
            <>
              <CADLab />
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-rose-700 text-sm">
                  ¿Quieres generar modelos 3D describiéndolos con palabras? Esa función usa IA generativa y está en tu{' '}
                  <a href="/ia" className="font-semibold underline">Laboratorio de IA</a>, disponible desde {minGradeLabel('diseno_ia')}.
                </p>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
