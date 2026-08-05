'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

/**
 * Resolves the logged-in user's numeric grade (levels.grade_number) from
 * their assigned levelId, for use with src/lib/programGating.ts. Admins
 * get `null` (treated as "not blocked" by isProgramAvailable).
 */
export function useUserGrade() {
  const { user } = useAuth()
  const [gradeNumber, setGradeNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function resolve() {
      if (!user?.levelId || user.role === 'admin') {
        if (!cancelled) { setGradeNumber(null); setLoading(false) }
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/levels')
        const levels = await res.json()
        const match = Array.isArray(levels) ? levels.find((l: any) => l.id === user.levelId) : null
        if (!cancelled) setGradeNumber(typeof match?.gradeNumber === 'number' ? match.gradeNumber : null)
      } catch {
        if (!cancelled) setGradeNumber(null)
      }
      if (!cancelled) setLoading(false)
    }
    resolve()
    return () => { cancelled = true }
  }, [user?.levelId, user?.role])

  return { gradeNumber, loading, isAdmin: user?.role === 'admin' }
}
