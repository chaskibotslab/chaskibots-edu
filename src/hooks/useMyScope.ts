'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import type { UserScope } from '@/lib/scope'

/**
 * Grupos y programas del usuario logueado (ver src/lib/scope.ts).
 * `allows(programId)` es true mientras carga o si no hay restricción, para
 * no ocultar contenido por error; el servidor aplica la regla de verdad.
 */
export function useMyScope() {
  const { user } = useAuth()
  const [scope, setScope] = useState<UserScope | null>(null)
  const [loading, setLoading] = useState(true)
  const userId = user?.id

  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setScope(null)
      setLoading(false)
      return
    }
    setLoading(true)
    fetch('/api/me/scope')
      .then(res => res.json())
      .then(data => { if (!cancelled) setScope(data.success ? data.scope : null) })
      .catch(() => { if (!cancelled) setScope(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  const programIds = scope?.programIds ?? null
  const allows = useCallback(
    (programId: string) => programIds === null || programIds.includes(programId),
    [programIds]
  )

  return { scope, loading, allows }
}
