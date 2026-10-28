'use client'

// Control remoto del robot (pestaña Probar). Dos modos, según haya programa:
//  - Sin programa: manejo directo de los motores (para probar la mecánica).
//  - Con programa: envía letras como una app de Bluetooth del celular
//    (F adelante, B atrás, L izquierda, R derecha, S parar, 0–9 velocidad),
//    que el programa lee con Serial.read() / SerialBT.read().
// Se maneja con los botones (mouse o dedo), las flechas o WASD del teclado o
// un control de videojuego (Gamepad API).

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gamepad2, Square, X } from 'lucide-react'
import type { Simulacion } from '../../engine/simulation'

type Dir = 'F' | 'B' | 'L' | 'R' | 'S'

const LADOS: Record<Dir, [number, number]> = { F: [1, 1], B: [-1, -1], L: [-0.5, 1], R: [1, -0.5], S: [0, 0] }
const TECLAS: Record<string, Dir> = { ArrowUp: 'F', ArrowDown: 'B', ArrowLeft: 'L', ArrowRight: 'R', w: 'F', s: 'B', a: 'L', d: 'R', W: 'F', S: 'B', A: 'L', D: 'R' }

export default function ControlRemoto({ sim, conPrograma, onCerrar }: { sim: Simulacion; conPrograma: boolean; onCerrar: () => void }) {
  const [dir, setDir] = useState<Dir>('S')
  const [vel, setVel] = useState(7)
  const [mando, setMando] = useState<string | null>(null)
  const ultimo = useRef<Dir>('S')
  const presionadas = useRef(new Set<Dir>())

  // Aplicar la dirección: letra al programa o voltaje directo a los motores.
  useEffect(() => {
    if (conPrograma) {
      sim.manejar(0, 0)
      if (ultimo.current !== dir) sim.enviarSerial(dir)
    } else {
      const [i, d] = LADOS[dir]
      const f = (vel + 1) / 10
      sim.manejar(i * f, d * f)
    }
    ultimo.current = dir
  }, [dir, vel, conPrograma, sim])

  useEffect(() => { if (conPrograma) sim.enviarSerial(String(vel)) }, [vel, conPrograma, sim])
  useEffect(() => () => sim.manejar(0, 0), [sim])

  // Teclado (sin interferir cuando se escribe en un campo o en el editor).
  useEffect(() => {
    const escribiendo = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || !!t.closest('.monaco-editor'))
    }
    const abajo = (e: KeyboardEvent) => {
      const d = TECLAS[e.key]
      if (!d || escribiendo(e)) return
      e.preventDefault()
      presionadas.current.add(d)
      setDir(d)
    }
    const arriba = (e: KeyboardEvent) => {
      const d = TECLAS[e.key]
      if (!d) return
      presionadas.current.delete(d)
      const otra = Array.from(presionadas.current).pop()
      setDir(otra ?? 'S')
    }
    window.addEventListener('keydown', abajo)
    window.addEventListener('keyup', arriba)
    return () => { window.removeEventListener('keydown', abajo); window.removeEventListener('keyup', arriba) }
  }, [])

  // Control de videojuego: palanca izquierda o cruceta.
  useEffect(() => {
    let raf = 0
    const leer = () => {
      raf = requestAnimationFrame(leer)
      const g = Array.from(navigator.getGamepads?.() ?? []).find(Boolean)
      if (!g) { setMando(null); return }
      setMando(g.id.split('(')[0].trim() || 'Control')
      const x = g.axes[0] ?? 0, y = g.axes[1] ?? 0
      const b = (i: number) => !!g.buttons[i]?.pressed
      let d: Dir = 'S'
      if (b(12) || y < -0.5) d = 'F'
      else if (b(13) || y > 0.5) d = 'B'
      else if (b(14) || x < -0.5) d = 'L'
      else if (b(15) || x > 0.5) d = 'R'
      if (presionadas.current.size === 0) setDir(prev => (prev === d ? prev : d))
    }
    raf = requestAnimationFrame(leer)
    return () => cancelAnimationFrame(raf)
  }, [])

  const boton = (d: Dir, Icon: typeof ArrowUp, clase = '') => (
    <button
      onPointerDown={e => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDir(d) }}
      onPointerUp={() => setDir('S')}
      onPointerCancel={() => setDir('S')}
      className={`flex h-12 w-12 touch-none select-none items-center justify-center rounded-xl border text-white transition ${dir === d ? 'border-lab-acento bg-lab-acento/40' : 'border-lab-borde/20 bg-white/10 hover:bg-white/20'} ${clase}`}
      aria-label={d}
    >
      <Icon className="h-6 w-6" />
    </button>
  )

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-10 w-56 rounded-2xl lab-vidrio p-3 text-xs text-slate-200 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-white"><Gamepad2 className="h-4 w-4 text-lab-acento" /> Control remoto</span>
        <button onClick={onCerrar} className="rounded p-0.5 text-slate-400 hover:bg-white/10" aria-label="Cerrar"><X className="h-4 w-4" /></button>
      </div>
      <p className="mb-2 leading-snug text-slate-400">
        {conPrograma
          ? <>Envía letras a tu programa (como una app Bluetooth): <b className="text-slate-200">F B L R S</b> y la velocidad 0–9.</>
          : <>Manejo directo de los motores (no hay programa corriendo).</>}
      </p>
      <div className="mx-auto grid w-fit grid-cols-3 gap-1.5">
        <span />{boton('F', ArrowUp)}<span />
        {boton('L', ArrowLeft)}
        <button onClick={() => setDir('S')} className="flex h-12 w-12 items-center justify-center rounded-xl border border-lab-borde/20 bg-white/5 text-slate-300 hover:bg-white/15" aria-label="Parar"><Square className="h-5 w-5" /></button>
        {boton('R', ArrowRight)}
        <span />{boton('B', ArrowDown)}<span />
      </div>
      <label className="mt-2 flex items-center gap-2">
        <span className="text-slate-400">Velocidad</span>
        <input type="range" min={0} max={9} value={vel} onChange={e => setVel(Number(e.target.value))} className="flex-1 accent-[#E57361]" />
        <span className="w-3 font-mono text-white">{vel}</span>
      </label>
      <p className="mt-1.5 text-[10px] text-slate-500">Teclado: flechas o WASD{mando ? ` · Control: ${mando}` : ' · o conecta un control de videojuego'}</p>
    </div>
  )
}
