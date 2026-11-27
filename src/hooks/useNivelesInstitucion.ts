'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

// Niveles que la persona ya tiene como curso de su institución (Academia).
// Esos grados se ven desde el curso de la institución, así que no deben
// aparecer además como nivel genérico (en /niveles, /robotica, /hacking).
// null = todavía cargando. Los administradores no se filtran: siempre [].
const cache = new Map<string, Promise<string[]>>()

function cargar(userId: string): Promise<string[]> {
  let p = cache.get(userId)
  if (!p) {
    p = fetch('/api/academia/instituciones')
      .then(r => r.json())
      .then(d => {
        const insts: { cursos: { levelId: string }[] }[] = d?.success ? d.instituciones : []
        return Array.from(new Set(insts.flatMap(i => i.cursos.map(c => c.levelId)).filter(Boolean)))
      })
      .catch(() => { cache.delete(userId); return [] as string[] })
    cache.set(userId, p)
  }
  return p
}

export function useNivelesInstitucion(): string[] | null {
  const { user, isLoading } = useAuth()
  const [niveles, setNiveles] = useState<string[] | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role === 'admin') { setNiveles([]); return }
    let vivo = true
    setNiveles(null)
    cargar(user.id).then(n => { if (vivo) setNiveles(n) })
    return () => { vivo = false }
  }, [isLoading, user?.id, user?.role])

  return niveles
}
