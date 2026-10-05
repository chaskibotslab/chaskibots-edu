'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { School, ArrowRight, Loader2 } from 'lucide-react'

interface CursoResumen {
  kitId: string
  courseId: string | null
  courseName: string
  levelId: string
  price: number | null
}

interface InstitucionResumen {
  schoolId: string
  schoolName: string
  city: string | null
  cursos: CursoResumen[]
}

// Seccion de /niveles que agrupa por institucion los cursos de Academia
// (kits con colegio asignado). Genérica: cualquier colegio con kits
// visibles aparece aqui solo, no esta hardcodeada a ninguna academia.
export default function InstitucionesSection() {
  const [instituciones, setInstituciones] = useState<InstitucionResumen[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/academia/instituciones')
        const data = await res.json()
        if (!cancelled) setInstituciones(data.success ? data.instituciones : [])
      } catch {
        if (!cancelled) setInstituciones([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (instituciones === null) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 text-chaski-primary animate-spin" />
      </div>
    )
  }

  if (instituciones.length === 0) return null

  return (
    <>
      {instituciones.map((inst, i) => (
        <section key={inst.schoolId} className="animate-slide-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-chaski-dark to-slate-800 p-5 sm:p-6 mb-5 shadow-lg">
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-chaski-gold/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-chaski-gold/20 rounded-2xl flex items-center justify-center border border-chaski-gold/30 flex-shrink-0">
                <School className="w-6 h-6 text-chaski-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{inst.schoolName}</h2>
                <p className="text-white/60 text-sm">
                  {inst.city ? `${inst.city} · ` : ''}{inst.cursos.length} {inst.cursos.length === 1 ? 'curso' : 'cursos'} de tu institución
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inst.cursos.map((curso, idx) => (
              <Link
                key={curso.kitId}
                href={`/academia/${inst.schoolId}/${curso.kitId}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 transition-all duration-300 animate-scale-in hover:shadow-md hover:border-chaski-gold/40 hover:-translate-y-0.5"
                style={{ animationDelay: `${(i * 6 + idx) * 0.04}s` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-chaski-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center gap-4">
                  <div className="w-11 h-11 bg-chaski-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-chaski-gold/20 group-hover:scale-110 transition-transform">
                    <School className="w-5 h-5 text-chaski-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-chaski-dark text-sm leading-tight group-hover:text-chaski-gold transition-colors">{curso.courseName}</h3>
                    {curso.price != null && <p className="text-slate-400 text-xs mt-0.5">Kit ${curso.price}</p>}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-chaski-gold group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
