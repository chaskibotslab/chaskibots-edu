'use client'

import { useEffect, useState } from 'react'

/**
 * Pantalla completa / ampliar para simuladores.
 * Devuelve el estado y las clases para el contenedor raíz.
 * - Esc cierra la vista ampliada.
 * - Bloquea el scroll del fondo mientras está ampliado.
 */
export function useExpand() {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [expanded])

  // Clase para el contenedor raíz: ocupa toda la pantalla cuando está ampliado.
  const shellClass = expanded
    ? 'fixed inset-0 z-50 overflow-auto rounded-none border-0'
    : ''

  return { expanded, setExpanded, toggle: () => setExpanded(v => !v), shellClass }
}
