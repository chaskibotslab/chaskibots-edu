'use client'

import { useState, useEffect } from 'react'
import { EDUCATION_LEVELS } from '@/lib/constants'

export interface DynamicLevel {
  id: string
  name: string
  fullName: string
  category: string
  ageRange: string
  gradeNumber: number
  icon?: string
  color?: string
  neonColor?: string
  kitPrice?: number
  hasHacking?: boolean
  hasAdvancedIA?: boolean
}

export function useDynamicLevels() {
  const [levels, setLevels] = useState<DynamicLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const res = await fetch('/api/admin/levels')
        const data = await res.json()
        
        if (data.levels && data.levels.length > 0) {
          // Combinar niveles de Airtable con locales (Airtable tiene prioridad)
          const airtableLevelIds = new Set(data.levels.map((l: DynamicLevel) => l.id))
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
              hasAdvancedIA: l.hasAdvancedIA
            }))
          
          setLevels([...data.levels, ...localOnlyLevels])
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
            hasAdvancedIA: l.hasAdvancedIA
          })))
        }
      } catch (err) {
        console.error('Error loading levels:', err)
        setError('Error al cargar niveles')
        // Fallback a niveles locales en caso de error
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
          hasAdvancedIA: l.hasAdvancedIA
        })))
      }
      setLoading(false)
    }

    loadLevels()
  }, [])

  return { levels, loading, error }
}
