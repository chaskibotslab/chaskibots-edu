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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-chaski-gold/10 rounded-2xl flex items-center justify-center border border-chaski-gold/25">
              <School className="w-6 h-6 text-chaski-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-chaski-dark">{inst.schoolName}</h2>
              <p className="text-slate-500 text-sm">
                {inst.city ? `${inst.city} • ` : ''}Cursos de tu institución
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inst.cursos.map((curso, idx) => (
              <Link
                key={curso.kitId}
                href={`/academia/${inst.schoolId}/${curso.kitId}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-border-soft shadow-sm p-5 transition-all duration-300 animate-scale-in hover:shadow-lg hover:border-chaski-gold/40 hover:bg-chaski-gold/5"
                style={{ animationDelay: `${(i * 6 + idx) * 0.04}s` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-chaski-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 bg-chaski-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-chaski-gold/25 group-hover:scale-110 transition-transform">
                    <School className="w-6 h-6 text-chaski-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-chaski-dark text-sm leading-tight">{curso.courseName}</h3>
                    {curso.price != null && <p className="text-slate-500 text-xs mt-0.5">Kit ${curso.price}</p>}
                  </div>
                  <ArrowRight className="w-5 h-5 text-chaski-gold group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
