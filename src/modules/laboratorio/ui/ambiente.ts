'use client'

// Fondo de la escena al armar y cablear: «estudio» (plato claro con cuadrícula,
// como una foto de catálogo) o «taller» (la mesa de trabajo en el aula).
// Se recuerda en este navegador y se comparte entre Armar y Cablear.

import { useCallback, useEffect, useState } from 'react'

export type Ambiente = 'estudio' | 'taller'

const CLAVE = 'chaskibots-lab:ambiente'
const EVENTO = 'chaskibots-lab:ambiente'

function leer(): Ambiente {
  try { return localStorage.getItem(CLAVE) === 'taller' ? 'taller' : 'estudio' } catch { return 'estudio' }
}

export function useAmbiente(): [Ambiente, (a: Ambiente) => void] {
  const [ambiente, setAmbiente] = useState<Ambiente>('estudio')
  useEffect(() => {
    setAmbiente(leer())
    const oir = () => setAmbiente(leer())
    window.addEventListener(EVENTO, oir)
    return () => window.removeEventListener(EVENTO, oir)
  }, [])
  const cambiar = useCallback((a: Ambiente) => {
    try { localStorage.setItem(CLAVE, a) } catch { /* modo privado */ }
    setAmbiente(a)
    window.dispatchEvent(new Event(EVENTO))
  }, [])
  return [ambiente, cambiar]
}
