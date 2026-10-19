'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Entregas y Calificar eran dos páginas con lo mismo. Ahora todo está en
// /admin/calificar; esta ruta se mantiene para los enlaces viejos.
export default function EntregasRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace(`/admin/calificar${window.location.search}`)
  }, [router])
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
    </div>
  )
}
