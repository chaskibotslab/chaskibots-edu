'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Competencia } from '@/lib/torneoCompetencia'

export interface Equipo {
  id: string; numero: number; robot: string; equipo: string; integrantes: string[]
  puesto: number | null; puntaje: string | null; nota?: string | null
}
export type Estado = 'pendiente' | 'en_curso' | 'finalizada'
export interface Categoria { id: string; nombre: string; orden: number; estado: Estado; competencia: Competencia | null; equipos: Equipo[] }

export const TORNEO = { nombre: 'Chaski Bots 10', titulo: 'Torneo Internacional de Robótica', lugar: 'El Chaco, Ecuador', fechas: '20 y 21 de noviembre de 2026' }

export const ESTADO_TEXTO: Record<Estado, string> = { pendiente: 'Por competir', en_curso: 'En competencia', finalizada: 'Finalizada' }

export function InsigniaEstado({ estado }: { estado: Estado }) {
  const estilo = estado === 'en_curso' ? 'bg-emerald-100 text-emerald-800' : estado === 'finalizada' ? 'bg-[#282A36] text-white' : 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${estilo}`}>
      {estado === 'en_curso' && <span className="tn-vivo h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {ESTADO_TEXTO[estado]}
    </span>
  )
}

const MEDALLA = ['', 'bg-amber-400 text-amber-950 ring-amber-200', 'bg-slate-300 text-slate-800 ring-slate-100', 'bg-orange-700 text-white ring-orange-200']
export function Medalla({ puesto, grande }: { puesto: number; grande?: boolean }) {
  return (
    <span aria-label={`Puesto ${puesto}`} className={`inline-flex shrink-0 items-center justify-center rounded-full font-black ring-2 ${MEDALLA[puesto] || ''} ${grande ? 'h-9 w-9 text-base' : 'h-6 w-6 text-xs'}`}>
      {puesto}
    </span>
  )
}

// Para buscar sin importar tildes ni mayúsculas.
export const plano = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Lee el torneo y lo vuelve a leer cada cierto tiempo mientras la pestaña está a la vista.
export function useTorneo(cadaMs: number) {
  const [categorias, setCategorias] = useState<Categoria[] | null>(null)
  const [juez, setJuez] = useState(false)
  const [fallo, setFallo] = useState(false)
  const [hora, setHora] = useState<Date | null>(null)
  const pedido = useRef(0)

  const recargar = useCallback(async () => {
    const n = ++pedido.current
    try {
      const r = await fetch('/api/torneo', { cache: 'no-store' })
      const d = await r.json()
      if (n !== pedido.current) return
      if (!r.ok || !d.success) throw new Error('lectura')
      setCategorias(d.categorias); setJuez(!!d.juez); setFallo(false); setHora(new Date())
    } catch {
      if (n === pedido.current) setFallo(true)
    }
  }, [])

  useEffect(() => {
    recargar()
    if (!cadaMs) return
    const t = setInterval(() => { if (!document.hidden) recargar() }, cadaMs)
    const alVolver = () => { if (!document.hidden) recargar() }
    document.addEventListener('visibilitychange', alVolver)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', alVolver) }
  }, [recargar, cadaMs])

  return { categorias, juez, fallo, hora, recargar }
}

export const ESTILOS_TORNEO = `
.tn { --tn-suave: cubic-bezier(0.23, 1, 0.32, 1); }
.tn button { transition: transform 140ms var(--tn-suave), background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease; }
.tn button:active:not(:disabled) { transform: scale(0.97); }
.tn .tn-entra { animation: tn-entra 260ms var(--tn-suave) both; }
.tn .tn-vivo { animation: tn-vivo 1.4s ease-in-out infinite; }
.tn .tn-gira { animation: tn-gira 40s linear infinite; transform-origin: center; }
@keyframes tn-entra { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes tn-gira { to { transform: rotate(360deg); } }
@keyframes tn-vivo { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
@media (prefers-reduced-motion: reduce) { .tn *, .tn *::before, .tn *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; } }
`
