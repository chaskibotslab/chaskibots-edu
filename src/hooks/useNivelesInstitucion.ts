'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

export interface CursoInstitucion {
  schoolId: string
  schoolName: string
  kitId: string
  courseName: string
  levelId: string
}

// Cursos que la persona tiene en su institución (Academia), tal como los
// entrega /api/academia/instituciones: ya filtrados por sus asignaciones.
// Un docente puede tener varios; la ficha del usuario solo guarda uno, por
// eso las pantallas no deben guiarse por user.levelId para saber "su curso".
const cache = new Map<string, Promise<CursoInstitucion[]>>()

function cargar(userId: string): Promise<CursoInstitucion[]> {
  let p = cache.get(userId)
  if (!p) {
    p = fetch('/api/academia/instituciones')
      .then(r => r.json())
      .then(d => {
        const insts: any[] = d?.success ? d.instituciones : []
        return insts.flatMap(i => (i.cursos || []).map((c: any) => ({
          schoolId: i.schoolId, schoolName: i.schoolName, kitId: c.kitId, courseName: c.courseName, levelId: c.levelId,
        })))
      })
      .catch(() => { cache.delete(userId); return [] as CursoInstitucion[] })
    cache.set(userId, p)
  }
  return p
}

/** Cursos de institución de la persona. null = cargando. Admin: siempre [] (no se le filtra nada). */
export function useCursosInstitucion(): CursoInstitucion[] | null {
  const { user, isLoading } = useAuth()
  const [cursos, setCursos] = useState<CursoInstitucion[] | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role === 'admin') { setCursos([]); return }
    let vivo = true
    setCursos(null)
    cargar(user.id).then(c => { if (vivo) setCursos(c) })
    return () => { vivo = false }
  }, [isLoading, user?.id, user?.role])

  return cursos
}

/**
 * Niveles que la persona ya tiene como curso de su institución: no deben
 * aparecer además como nivel genérico (/niveles, /robotica, /hacking).
 */
export function useNivelesInstitucion(): string[] | null {
  const cursos = useCursosInstitucion()
  return useMemo(() => cursos && Array.from(new Set(cursos.map(c => c.levelId).filter(Boolean))), [cursos])
}
