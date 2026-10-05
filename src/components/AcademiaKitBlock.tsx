'use client'

import { useEffect, useState } from 'react'
import { Loader2, School } from 'lucide-react'
import KitFichaContent, { KitFichaDetalle } from '@/components/KitFichaContent'

// Muestra, dentro de /nivel/[id], el curso completo (materiales,
// proyectos, esquemas, codigo) de cada colegio que tenga un kit de
// Academia asignado a ese nivel. Si no hay ninguno, no renderiza nada
// (no todos los niveles tienen un colegio con kit propio).
export default function AcademiaKitBlock({ levelId }: { levelId: string }) {
  const [kits, setKits] = useState<KitFichaDetalle[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/kits/academia?levelId=${encodeURIComponent(levelId)}`)
        const data = await res.json()
        if (!cancelled) setKits(data.success ? data.kits : [])
      } catch {
        if (!cancelled) setKits([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [levelId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 text-chaski-primary animate-spin" />
      </div>
    )
  }

  if (!kits || kits.length === 0) return null

  return (
    <div className="space-y-16 mt-10">
      {kits.map(kit => (
        <div key={kit.id}>
          <div className="flex items-center gap-2 mb-6 pb-3 border-b-2 border-chaski-primary/20">
            <School className="w-5 h-5 text-chaski-primary" />
            <h2 className="text-lg font-bold text-chaski-dark">
              Curso de tu Academia{kit.schoolName ? `: ${kit.schoolName}` : ''}
            </h2>
          </div>
          <KitFichaContent kit={kit} />
        </div>
      ))}
    </div>
  )
}
