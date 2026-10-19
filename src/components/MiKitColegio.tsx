'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Loader2, Printer, School, Wrench, Package } from 'lucide-react'
import { KitFichaDetalle, KitHeaderMateriales } from '@/components/KitFichaContent'
import LeccionesProyectos from '@/components/LeccionesProyectos'

const KitDisplay = dynamic(() => import('@/components/KitDisplay'), {
  loading: () => <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-chaski-primary" /></div>,
  ssr: false,
})

interface KitDeColegio { kitId: string; courseName: string; schoolId: string; schoolName: string }

// Pestaña "Mi kit" de /nivel/[id]. Si el colegio de la persona tiene un kit
// para este grado, muestra sus proyectos (circuito, código y guía) aquí mismo:
// el estudiante entra por su grado y no tiene que buscar el curso aparte.
// Si no hay kit de colegio, queda el kit general del grado (KitDisplay).
// /api/academia/instituciones ya filtra por la persona: el estudiante solo
// recibe el kit de su colegio y grado; el admin, los de todos los colegios.
export default function MiKitColegio({ levelId }: { levelId: string }) {
  const [kits, setKits] = useState<KitDeColegio[] | null>(null)
  const [selected, setSelected] = useState<string>('')
  const [kit, setKit] = useState<KitFichaDetalle | null>(null)
  const [loadingKit, setLoadingKit] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/academia/instituciones')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        const list: KitDeColegio[] = (data.success ? data.instituciones : []).flatMap((inst: any) =>
          inst.cursos
            .filter((c: any) => c.levelId === levelId)
            .map((c: any) => ({ kitId: c.kitId, courseName: c.courseName, schoolId: inst.schoolId, schoolName: inst.schoolName })),
        )
        setKits(list)
        if (list.length > 0) setSelected(list[0].kitId)
      })
      .catch(() => { if (!cancelled) setKits([]) })
    return () => { cancelled = true }
  }, [levelId])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setLoadingKit(true)
    setError('')
    fetch(`/api/academia/kit/${selected}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        if (data.success) setKit(data.kit)
        else setError(data.error || 'No se pudo cargar el kit')
      })
      .catch(() => { if (!cancelled) setError('Error de conexión') })
      .finally(() => { if (!cancelled) setLoadingKit(false) })
    return () => { cancelled = true }
  }, [selected])

  if (kits === null) {
    return <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-chaski-primary" /></div>
  }

  if (kits.length === 0) return <KitDisplay levelId={levelId} />

  const current = kits.find(k => k.kitId === selected)
  const practicas = kit?.proyectos.filter((p: any) => p.tipo === 'practica').length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-chaski-gold/10 border border-chaski-gold/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <Wrench className="w-6 h-6 text-chaski-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-chaski-dark">Proyectos de tu kit</h2>
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            <School className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{current?.schoolName} · {current?.courseName}</span>
          </p>
          {kit && (
            <p className="text-xs text-slate-400 mt-0.5">
              Empieza por {practicas > 0 ? `las ${practicas} prácticas` : 'el proyecto principal'}; cada una prepara una parte del proyecto principal.
            </p>
          )}
        </div>
        {kit && (
          <Link
            href={`/academia/${kit.schoolId}/${kit.id}/imprimir`}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-chaski-primary hover:opacity-80 flex-shrink-0"
          >
            <Printer className="w-4 h-4" /> Imprimir ficha
          </Link>
        )}
      </div>

      {/* Solo el admin (o un docente de varios colegios) recibe más de un kit para el mismo grado */}
      {kits.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {kits.map(k => (
            <button
              key={k.kitId}
              onClick={() => setSelected(k.kitId)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                k.kitId === selected ? 'bg-chaski-primary text-white shadow-sm' : 'bg-white border border-border-soft text-slate-600 hover:bg-slate-100'
              }`}
            >
              {k.schoolName}
            </button>
          ))}
        </div>
      )}

      {loadingKit && <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-chaski-primary" /></div>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      {kit && !loadingKit && (
        <>
          <LeccionesProyectos proyectos={kit.proyectos} boardName={kit.placa?.nombre} />
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold text-chaski-dark mb-3">
              <Package className="w-5 h-5 text-chaski-primary" /> Materiales del kit
            </h3>
            <KitHeaderMateriales kit={kit} />
          </section>
        </>
      )}
    </div>
  )
}
