'use client'

// Control remoto del robot (pestaña Probar). Dos modos, según haya programa:
//  - Sin programa: manejo directo de los motores (para probar la mecánica).
//  - Con programa: envía letras como una app de Bluetooth del celular
//    (F adelante, B atrás, L izquierda, R derecha, G I H J curvas, S parar,
//    0–9 velocidad), que el programa lee con Serial.read() / SerialBT.read().
// Se maneja con los botones (mouse o dedo), el teclado de la compu (flechas o
// WASD, dos a la vez para curvar, Espacio frena, 0–9 velocidad) o un control
// de videojuego (Gamepad API).

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gamepad2, Square, X } from 'lucide-react'
import type { Simulacion } from '../../engine/simulation'
import type { EstadoCombate } from '../../engine/competencia'

type Tecla = 'F' | 'B' | 'L' | 'R'
type Dir = Tecla | 'G' | 'I' | 'H' | 'J' | 'S'

const LADOS: Record<Dir, [number, number]> = {
  F: [1, 1], B: [-1, -1], L: [-0.5, 1], R: [1, -0.5], S: [0, 0],
  G: [0.4, 1], I: [1, 0.4], H: [-0.4, -1], J: [-1, -0.4],
}
const TECLAS: Record<string, Tecla> = { ArrowUp: 'F', ArrowDown: 'B', ArrowLeft: 'L', ArrowRight: 'R', w: 'F', s: 'B', a: 'L', d: 'R', W: 'F', S: 'B', A: 'L', D: 'R' }

/** Las teclas apretadas a la vez dan una dirección (arriba + izquierda = curva). */
function direccion(p: Set<Tecla>): Dir {
  const v = Number(p.has('F')) - Number(p.has('B'))
  const h = Number(p.has('R')) - Number(p.has('L'))
  if (v > 0) return h < 0 ? 'G' : h > 0 ? 'I' : 'F'
  if (v < 0) return h < 0 ? 'H' : h > 0 ? 'J' : 'B'
  return h < 0 ? 'L' : h > 0 ? 'R' : 'S'
}

/** En sus campos de texto se escribe; el deslizador sí deja manejar con el teclado. */
function escribiendo(e: KeyboardEvent) {
  const t = e.target
  if (!(t instanceof HTMLElement)) return false
  if (t instanceof HTMLInputElement && t.type === 'range') return false
  return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || !!t.closest('.monaco-editor')
}

export default function ControlRemoto({ sim, conPrograma, leeLetras, fase, onCerrar }: {
  sim: Simulacion
  conPrograma: boolean
  /** El programa obedece las letras del control (si no, es autónomo y las ignora). */
  leeLetras: boolean
  /** Fase del combate, en las arenas de competencia. */
  fase?: EstadoCombate['fase']
  onCerrar: () => void
}) {
  const [dir, setDir] = useState<Dir>('S')
  const [vel, setVel] = useState(7)
  const [mando, setMando] = useState<string | null>(null)
  const ultimo = useRef<Dir>('S')
  const presionadas = useRef(new Set<Tecla>())

  // Durante la cuenta y entre rondas el robot no obedece: moverse sería salida en falso.
  const quieto = conPrograma && !!fase && fase !== 'combate'
  const efectiva: Dir = quieto ? 'S' : dir

  // Aplicar la dirección: letra al programa o voltaje directo a los motores.
  useEffect(() => {
    if (conPrograma) {
      sim.manejar(0, 0)
      if (ultimo.current !== efectiva) sim.enviarSerial(efectiva)
    } else {
      const [i, d] = LADOS[efectiva]
      const f = (vel + 1) / 10
      sim.manejar(i * f, d * f)
    }
    ultimo.current = efectiva
  }, [efectiva, vel, conPrograma, sim])

  // Cada ronda reinicia el programa: al empezar a pelear se le repite la velocidad.
  useEffect(() => { if (conPrograma && !quieto) sim.enviarSerial(String(vel)) }, [vel, conPrograma, quieto, sim])
  useEffect(() => () => sim.manejar(0, 0), [sim])

  // Teclado de la compu.
  useEffect(() => {
    const abajo = (e: KeyboardEvent) => {
      if (escribiendo(e) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === ' ') { e.preventDefault(); presionadas.current.clear(); setDir('S'); return }
      if (/^[0-9]$/.test(e.key)) { setVel(Number(e.key)); return }
      const t = TECLAS[e.key]
      if (!t) return
      e.preventDefault() // que las flechas no muevan la página ni el deslizador
      presionadas.current.add(t)
      setDir(direccion(presionadas.current))
    }
    const arriba = (e: KeyboardEvent) => {
      const t = TECLAS[e.key]
      if (!t) return
      presionadas.current.delete(t)
      setDir(direccion(presionadas.current))
    }
    // Si la ventana pierde el foco no llega el «soltar»: el robot no debe seguir solo.
    const soltarTodo = () => { presionadas.current.clear(); setDir('S') }
    window.addEventListener('keydown', abajo)
    window.addEventListener('keyup', arriba)
    window.addEventListener('blur', soltarTodo)
    return () => {
      window.removeEventListener('keydown', abajo)
      window.removeEventListener('keyup', arriba)
      window.removeEventListener('blur', soltarTodo)
    }
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
      className={`flex h-12 w-12 touch-none select-none items-center justify-center rounded-xl border text-white transition ${efectiva === d ? 'border-lab-acento bg-lab-acento/40' : 'border-lab-borde/20 bg-white/10 hover:bg-white/20'} ${clase}`}
      aria-label={d}
    >
      <Icon className="h-6 w-6" />
    </button>
  )

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-10 max-h-[calc(100%-1.5rem)] w-56 overflow-y-auto rounded-2xl lab-vidrio p-3 text-xs text-slate-200 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-white"><Gamepad2 className="h-4 w-4 text-lab-acento" /> Control remoto</span>
        <button onClick={onCerrar} className="rounded p-0.5 text-slate-400 hover:bg-white/10" aria-label="Cerrar"><X className="h-4 w-4" /></button>
      </div>
      <p className="mb-2 leading-snug text-slate-400">
        {quieto && fase === 'cuenta' ? <b className="text-amber-300">Espera la cuenta: el robot obedece cuando empiece la ronda.</b>
          : quieto ? <>La ronda terminó: el robot está detenido.</>
          : conPrograma && !leeLetras ? <b className="text-amber-300">Este programa es autónomo y no obedece al control. Para manejarlo, carga la plantilla «Manejar con el teclado (RC)».</b>
          : conPrograma ? <>Envía letras a tu programa (como una app del celular): <b className="text-slate-200">F B L R S</b> y la velocidad 0–9.</>
          : fase ? <>Práctica libre: para pelear con el rival, presiona «Compilar y ejecutar».</>
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
      <p className="mt-1.5 text-[10px] leading-snug text-slate-500">Teclado: flechas o WASD (dos a la vez: curva) · Espacio frena · 0–9 velocidad{mando ? ` · Control: ${mando}` : ' · o conecta un control de videojuego'}</p>
    </div>
  )
}
