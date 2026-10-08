'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Eye, Loader2, Pencil } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

// Entrada única para editar el contenido de los cursos con kit: lista cada
// colegio con sus cursos y lleva directo al editor de lecciones.

interface Curso { kitId: string; courseName: string; levelId: string }
interface Institucion { schoolId: string; schoolName: string; cursos: Curso[] }

export default function AdminAcademiaPage() {
  const router = useRouter()
  const { isAdmin: isTeacher, isAuthenticated, isLoading } = useAuth()
  const [instituciones, setInstituciones] = useState<Institucion[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.push('/login?redirect=/admin/academia')
    else if (!isTeacher) router.push('/')
  }, [isLoading, isAuthenticated, isTeacher, router])

  useEffect(() => {
    if (!isTeacher) return
    fetch('/api/academia/instituciones')
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error(data.error || 'No se pudo cargar')
        setInstituciones(data.instituciones)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error de conexión'))
  }, [isTeacher])

  return (
    <div className="min-h-screen bg-chaski-light animate-fade-in">
      <header className="sticky top-0 z-10 bg-chaski-light/80 backdrop-blur-xl border-b border-border-soft">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="p-2 -ml-2 rounded-full text-chaski-primary hover:bg-chaski-primary/10 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-chaski-dark leading-tight">Lecciones de cursos con kit</h1>
            <p className="text-xs text-slate-500">Elige un curso para editar sus lecciones, fotos y video</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">{error}</div>}
        {!instituciones && !error && (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-chaski-primary" /></div>
        )}
        {instituciones?.length === 0 && <p className="text-sm text-slate-500 text-center py-16">Todavía no hay cursos con kit.</p>}

        {instituciones?.map(inst => (
          <section key={inst.schoolId} className="space-y-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{inst.schoolName}</h2>
            <div className="bg-white rounded-2xl border border-border-soft divide-y divide-border-soft overflow-hidden">
              {inst.cursos
                .slice()
                .sort((a, b) => a.courseName.localeCompare(b.courseName, 'es', { numeric: true }))
                .map(curso => (
                  <div key={curso.kitId} className="px-4 py-3 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-chaski-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-chaski-primary" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-chaski-dark truncate">{curso.courseName}</p>
                      <p className="text-xs text-slate-500">{curso.levelId}</p>
                    </div>
                    <Link
                      href={`/academia/${inst.schoolId}/${curso.kitId}`}
                      target="_blank"
                      className="p-2 rounded-full text-slate-400 hover:text-chaski-primary hover:bg-chaski-primary/10"
                      title="Ver como estudiante"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/kits/${curso.kitId}/editar`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-chaski-primary text-white text-sm font-semibold active:scale-95 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </Link>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
