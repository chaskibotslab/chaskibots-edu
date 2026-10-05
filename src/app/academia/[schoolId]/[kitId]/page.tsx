'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ArrowLeft, Printer, Loader2, AlertCircle } from 'lucide-react'
import KitFichaContent, { KitFichaDetalle } from '@/components/KitFichaContent'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AcademiaKitPage() {
  const params = useParams<{ schoolId: string; kitId: string }>()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  const [kit, setKit] = useState<KitFichaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push(`/login?redirect=/academia/${params?.schoolId}/${params?.kitId}`)
  }, [isLoading, isAuthenticated, router, params?.schoolId, params?.kitId])

  useEffect(() => {
    if (!isAuthenticated || !params?.kitId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/academia/kit/${params.kitId}`)
        const data = await res.json()
        if (cancelled) return
        if (!data.success) setError(data.error || 'No se pudo cargar el curso')
        else setKit(data.kit)
      } catch {
        if (!cancelled) setError('Error de conexion')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [params?.kitId, isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chaski-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="no-print border-b border-slate-200 px-4 py-3 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          href="/niveles"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a niveles
        </Link>
        {kit && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-chaski-primary text-white text-sm font-semibold hover:bg-chaski-primary/90 transition-colors active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" /> Imprimir / Guardar como PDF
          </button>
        )}
      </div>

      <main className="flex-1 px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 text-chaski-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto mt-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">{error}</p>
          </div>
        ) : kit ? (
          <KitFichaContent kit={kit} printableId="ficha-imprimible" />
        ) : null}
      </main>

      <Footer />

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #ficha-imprimible, #ficha-imprimible * { visibility: visible; }
          #ficha-imprimible { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          .no-print { display: none !important; }
          .proyecto-imprimible { break-before: page; }
          .proyecto-imprimible:first-of-type { break-before: auto; }
        }
      `}</style>
    </div>
  )
}
