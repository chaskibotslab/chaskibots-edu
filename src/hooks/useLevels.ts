'use client'

import { useState, useEffect, useMemo } from 'react'
import { levelsApi } from '@/services/api'
import { EDUCATION_LEVELS } from '@/lib/constants'
import type { Level } from '@/types'

interface UseLevelsReturn {
  levels: Level[]
  loading: boolean
  error: string | null
  getLevelById: (id: string) => Level | undefined
  getLevelName: (id: string) => string
  refetch: () => Promise<void>
}

/**
 * Hook para obtener niveles educativos
 * Combina niveles de Airtable con fallback a constantes locales
 */
export function useLevels(): UseLevelsReturn {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLevels = async () => {
    setLoading(true)
    setError(null)

    try {
      const airtableLevels = await levelsApi.getAll()

      if (airtableLevels.length > 0) {
        // Combinar: Airtable tiene prioridad
        const airtableLevelIds = new Set(airtableLevels.map(l => l.id))
        const localOnlyLevels = EDUCATION_LEVELS
          .filter(l => !airtableLevelIds.has(l.id))
          .map(l => ({
            id: l.id,
            name: l.name,
            fullName: l.fullName,
            category: l.category,
            ageRange: l.ageRange,
            gradeNumber: l.gradeNumber,
            icon: l.icon,
            color: l.color,
            neonColor: l.neonColor,
            kitPrice: l.kitPrice,
            hasHacking: l.hasHacking,
            hasAdvancedIA: l.hasAdvancedIA,
          }))

        setLevels([...airtableLevels, ...localOnlyLevels])
      } else {
        // Fallback completo a niveles locales
        setLevels(EDUCATION_LEVELS.map(l => ({
          id: l.id,
          name: l.name,
          fullName: l.fullName,
          category: l.category,
          ageRange: l.ageRange,
          gradeNumber: l.gradeNumber,
          icon: l.icon,
          color: l.color,
          neonColor: l.neonColor,
          kitPrice: l.kitPrice,
          hasHacking: l.hasHacking,
          hasAdvancedIA: l.hasAdvancedIA,
        })))
      }
    } catch (err) {
      console.error('[useLevels] Error:', err)
      setError('Error al cargar niveles')
      // Fallback a niveles locales
      setLevels(EDUCATION_LEVELS.map(l => ({
        id: l.id,
        name: l.name,
        fullName: l.fullName,
        category: l.category,
        ageRange: l.ageRange,
        gradeNumber: l.gradeNumber,
        icon: l.icon,
        color: l.color,
        neonColor: l.neonColor,
        kitPrice: l.kitPrice,
        hasHacking: l.hasHacking,
        hasAdvancedIA: l.hasAdvancedIA,
      })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLevels()
  }, [])

  // Memoizar funciones de utilidad
  const getLevelById = useMemo(() => {
    const levelMap = new Map(levels.map(l => [l.id, l]))
    return (id: string) => levelMap.get(id)
  }, [levels])

  const getLevelName = useMemo(() => {
    const levelMap = new Map(levels.map(l => [l.id, l.name]))
    return (id: string) => levelMap.get(id) || id
  }, [levels])

  return {
    levels,
    loading,
    error,
    getLevelById,
    getLevelName,
    refetch: loadLevels,
  }
}
