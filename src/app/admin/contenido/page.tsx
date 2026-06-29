'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ContenidoRedirectPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/lecciones') }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin mx-auto mb-3" />
        <p className="text-slate-600 text-sm">Redirigiendo al editor de lecciones...</p>
      </div>
    </div>
  )
}
