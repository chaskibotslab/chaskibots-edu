'use client'

// Control remoto del robot (pestaña Probar). Dos modos, según haya programa:
//  - Sin programa: manejo directo de los motores (para probar la mecánica).
//  - Con programa: envía letras como una app de Bluetooth del celular
//    (F adelante, B atrás, L izquierda, R derecha, G I H J curvas, S parar,
//    0–9 velocidad; X / Y = arma a fondo / apagada en los battlebots), que el
//    programa lee con Serial.read() / SerialBT.read().
// Se maneja con los botones (mouse o dedo), el teclado de la compu (flechas o
// WASD, dos a la vez para curvar, Espacio frena, 0–9 velocidad) o un control
// de videojuego (Gamepad API). Con un control de PlayStation (PS4 o PS5 enlazado por
// Bluetooth o por cable a la compu) las palancas son analógicas: empujar poco = ir despacio.

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gamepad2, Square, X, Zap } from 'lucide-react'
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

/** Nombre legible del control y si es de PlayStation (para mostrar ✕ ○ en vez de A B). */
function describirMando(id: string): { nombre: string; ps: boolean } {
  const t = id.toLowerCase()
  if (t.includes('dualsense') || t.includes('0ce6') || t.includes('0df2')) return { nombre: 'Control PS5 (DualSense)', ps: true }
  if (t.includes('dualshock') || t.includes('09cc') || t.includes('05c4') || (t.includes('054c') && t.includes('wireless controller'))) return { nombre: 'Control PS4 (DualShock 4)', ps: true }
  if (t.includes('054c') || t.includes('playstation')) return { nombre: 'Control PlayStation', ps: true }
  if (t.includes('xbox') || t.includes('xinput')) return { nombre: 'Control Xbox', ps: false }
  return { nombre: id.split('(')[0].trim() || 'Control', ps: false }
}

const ZONA_MUERTA = 0.18
/** Quita el temblor del centro de la palanca y reescala el resto a 0–1. */
const palanca = (v: number) => (Math.abs(v) < ZONA_MUERTA ? 0 : Math.sign(v) * (Math.abs(v) - ZONA_MUERTA) / (1 - ZONA_MUERTA))

/** En sus campos de texto se escribe; el deslizador sí deja manejar con el teclado. */
function escribiendo(e: KeyboardEvent) {
  const t = e.target
  if (!(t instanceof HTMLElement)) return false
  if (t instanceof HTMLInputElement && t.type === 'range') return false
  return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || !!t.closest('.monaco-editor')
}

export default function ControlRemoto({ sim, conPrograma, leeLetras, conArma = false, fase, onCerrar }: {
  sim: Simulacion
  conPrograma: boolean
  /** El programa obedece las letras del control (si no, es autónomo y las ignora). */
  leeLetras: boolean
  /** El programa enciende un arma con X y la apaga con Y (battlebot). */
  conArma?: boolean
  /** Fase del combate, en las arenas de competencia. */
  fase?: EstadoCombate['fase']
  onCerrar: () => void
}) {
  const [dir, setDir] = useState<Dir>('S')
  const [vel, setVel] = useState(7)
  const [mando, setMando] = useState<{ nombre: string; ps: boolean } | null>(null)
  const [ayudaPs, setAyudaPs] = useState(false)
  const [arma, setArma] = useState(false)
  const ultimo = useRef<Dir>('S')
  const presionadas = useRef(new Set<Tecla>())
  const botonArma = useRef(false)
  // Lo último que leyó el control de videojuego (para no repetir órdenes en cada cuadro)
  const pad = useRef({ activo: false, l1: false, r1: false, nivel: -1 })
  const ahora = useRef({ conPrograma, quieto: false, vel })

  // Durante la cuenta y entre rondas el robot no obedece: moverse sería salida en falso.
  const quieto = conPrograma && !!fase && fase !== 'combate'
  const efectiva: Dir = quieto ? 'S' : dir
  ahora.current = { conPrograma, quieto, vel }

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
  // El arma, igual: X la enciende e Y la apaga (también al empezar cada ronda).
  useEffect(() => { if (conArma && conPrograma && !quieto) sim.enviarSerial(arma ? 'X' : 'Y') }, [arma, conArma, conPrograma, quieto, sim])
  useEffect(() => () => sim.manejar(0, 0), [sim])

  // Teclado de la compu.
  useEffect(() => {
    const abajo = (e: KeyboardEvent) => {
      if (escribiendo(e) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === ' ') { e.preventDefault(); presionadas.current.clear(); setDir('S'); return }
      if (/^[0-9]$/.test(e.key)) { setVel(Number(e.key)); return }
      if ((e.key === 'e' || e.key === 'E') && !e.repeat) { setArma(a => !a); return }
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

  // Control de videojuego (PS4/PS5, Xbox o genérico).
  //  - Palanca izquierda: dirección. Sin programa es analógica (mezcla acelerador y giro);
  //    con programa se convierte en las letras F B L R G I H J y en la velocidad 0–9.
  //  - R2 acelera y L2 retrocede (se combinan con la palanca para girar).
  //  - Cruceta: igual que las flechas. ✕/A: arma. ○/B: freno. L1/R1: bajar/subir velocidad.
  useEffect(() => {
    let raf = 0
    let nombre = ''
    const leer = () => {
      raf = requestAnimationFrame(leer)
      const g = Array.from(navigator.getGamepads?.() ?? []).find(Boolean)
      if (!g) { if (nombre) { nombre = ''; setMando(null) } return }
      if (g.id !== nombre) { nombre = g.id; setMando(describirMando(g.id)) }
      const b = (i: number) => !!g.buttons[i]?.pressed
      const gatillo = (i: number) => g.buttons[i]?.value ?? 0
      const st = pad.current
      const { conPrograma: conProg, quieto: parado, vel: velAhora } = ahora.current

      // Botones que cambian algo una sola vez al presionarlos
      const a = b(0)
      if (a && !botonArma.current) { setArma(v => !v); g.vibrationActuator?.playEffect?.('dual-rumble', { duration: 120, strongMagnitude: 0.6, weakMagnitude: 0.4 }).catch(() => { /* sin vibración */ }) }
      botonArma.current = a
      const l1 = b(4), r1 = b(5)
      if (l1 && !st.l1) setVel(v => Math.max(0, v - 1))
      if (r1 && !st.r1) setVel(v => Math.min(9, v + 1))
      st.l1 = l1; st.r1 = r1

      // Dirección: cruceta (todo o nada) o palanca + gatillos (analógico)
      const cruzX = Number(b(15)) - Number(b(14)), cruzY = Number(b(12)) - Number(b(13))
      let giro = palanca(g.axes[0] ?? 0)
      let avance = -palanca(g.axes[1] ?? 0)
      const gat = gatillo(7) - gatillo(6)
      if (Math.abs(gat) > 0.08) avance = Math.max(-1, Math.min(1, avance + gat))
      if (cruzX || cruzY) { giro = cruzX; avance = cruzY }
      const fuerza = Math.min(1, Math.hypot(giro, avance))
      const activo = fuerza > 0 && !b(1)

      if (presionadas.current.size > 0) { st.activo = false; return } // manda el teclado
      if (!activo) {
        if (st.activo || b(1)) { st.activo = false; st.nivel = -1; setDir('S'); if (!conProg) sim.manejar(0, 0) }
        return
      }
      st.activo = true
      // Dirección más cercana de las 8, para las letras y para iluminar el botón
      const v = avance > 0.35 ? 1 : avance < -0.35 ? -1 : 0
      const h = giro > 0.35 ? 1 : giro < -0.35 ? -1 : 0
      const d: Dir = v > 0 ? (h < 0 ? 'G' : h > 0 ? 'I' : 'F') : v < 0 ? (h < 0 ? 'H' : h > 0 ? 'J' : 'B') : h < 0 ? 'L' : h > 0 ? 'R' : 'S'
      setDir(prev => (prev === d ? prev : d))
      if (parado) return
      if (conProg) {
        // la fuerza de la palanca elige la velocidad (en 4 niveles, para no llenar de letras al programa)
        if (!cruzX && !cruzY) {
          const nivel = fuerza > 0.85 ? 9 : fuerza > 0.6 ? 7 : fuerza > 0.35 ? 5 : 3
          if (nivel !== st.nivel) { st.nivel = nivel; setVel(nivel) }
        }
      } else {
        // manejo directo y analógico: acelerador ± giro, como un carro a control remoto
        const tope = (velAhora + 1) / 10
        const izq = Math.max(-1, Math.min(1, avance + giro * (avance < 0 ? -0.7 : 0.7)))
        const der = Math.max(-1, Math.min(1, avance - giro * (avance < 0 ? -0.7 : 0.7)))
        sim.manejar(izq * tope, der * tope)
      }
    }
    raf = requestAnimationFrame(leer)
    return () => cancelAnimationFrame(raf)
  }, [sim])

  // El control vibra cuando empieza la ronda
  useEffect(() => {
    if (fase !== 'combate') return
    const g = Array.from(navigator.getGamepads?.() ?? []).find(Boolean)
    g?.vibrationActuator?.playEffect?.('dual-rumble', { duration: 300, strongMagnitude: 1, weakMagnitude: 0.6 }).catch(() => { /* sin vibración */ })
  }, [fase])

  const boton = (d: Dir, Icon: typeof ArrowUp, clase = '') => (
    <button
      onPointerDown={e => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDir(d) }}
      onPointerUp={() => setDir('S')}
      onPointerCancel={() => setDir('S')}
      className={`flex h-12 w-12 touch-none select-none items-center justify-center rounded-md border text-lab-tinta transition ${efectiva === d ? 'border-lab-acento bg-lab-acento/40' : 'border-lab-borde/20 bg-lab-tinta/[0.07] hover:bg-lab-tinta/[0.13]'} ${clase}`}
      aria-label={d}
    >
      <Icon className="h-6 w-6" />
    </button>
  )

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-10 max-h-[calc(100%-1.5rem)] w-56 overflow-y-auto rounded-md lab-vidrio p-3 text-xs text-lab-tinta">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-lab-tinta"><Gamepad2 className="h-4 w-4 text-lab-acento" /> Control remoto</span>
        <button onClick={onCerrar} className="rounded p-0.5 text-lab-suave hover:bg-lab-tinta/[0.07]" aria-label="Cerrar"><X className="h-4 w-4" /></button>
      </div>
      <p className="mb-2 leading-snug text-lab-suave">
        {quieto && fase === 'cuenta' ? <b className="text-amber-700">Espera la cuenta: el robot obedece cuando empiece la ronda.</b>
          : quieto ? <>La ronda terminó: el robot está detenido.</>
          : conPrograma && !leeLetras ? <b className="text-amber-700">Este programa es autónomo y no obedece al control. Para manejarlo, carga la plantilla «Manejar con el teclado (RC)».</b>
          : conPrograma ? <>Envía letras a tu programa (como una app del celular): <b className="text-lab-tinta">F B L R S</b> y la velocidad 0–9.</>
          : fase ? <>Práctica libre: para pelear con el rival, presiona «Compilar y ejecutar».</>
          : <>Manejo directo de los motores (no hay programa corriendo).</>}
      </p>
      <div className="mx-auto grid w-fit grid-cols-3 gap-1.5">
        <span />{boton('F', ArrowUp)}<span />
        {boton('L', ArrowLeft)}
        <button onClick={() => setDir('S')} className="flex h-12 w-12 items-center justify-center rounded-md border border-lab-borde/20 bg-lab-tinta/[0.04] text-lab-tinta2 hover:bg-lab-tinta/10" aria-label="Parar"><Square className="h-5 w-5" /></button>
        {boton('R', ArrowRight)}
        <span />{boton('B', ArrowDown)}<span />
      </div>
      {conArma && (
        <button
          onClick={() => setArma(a => !a)}
          aria-pressed={arma}
          disabled={!conPrograma}
          className={`mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-sm font-semibold disabled:opacity-40 ${arma ? 'bg-red-600 text-white' : 'lab-secundario'}`}
          title="Encender o apagar el arma (tecla E)"
        >
          <Zap className="h-4 w-4" /> {arma ? 'Arma girando' : 'Encender arma'}
        </button>
      )}
      <label className="mt-2 flex items-center gap-2">
        <span className="text-lab-suave">Velocidad</span>
        <input type="range" min={0} max={9} value={vel} onChange={e => setVel(Number(e.target.value))} className="flex-1 accent-[rgb(var(--lab-acento))]" />
        <span className="w-3 font-mono text-lab-tinta">{vel}</span>
      </label>
      <p className="mt-1.5 text-[10px] leading-snug text-lab-tenue">Teclado: flechas o WASD (dos a la vez: curva) · Espacio frena · 0–9 velocidad{conArma ? ' · E arma' : ''}</p>
      {mando ? (
        <div className="mt-2 rounded-md border border-emerald-600/30 bg-emerald-500/10 p-2 text-[10px] leading-snug">
          <p className="flex items-center gap-1 font-semibold text-emerald-800"><Gamepad2 className="h-3.5 w-3.5" /> {mando.nombre} conectado</p>
          <p className="mt-0.5 text-lab-suave">
            Palanca izquierda: manejar{conPrograma ? '' : ' (empuja poco = despacio)'} · R2 acelera, L2 retrocede · {mando.ps ? '○' : 'B'} frena · L1/R1 velocidad{conArma ? ` · ${mando.ps ? '✕' : 'A'} arma` : ''}
          </p>
        </div>
      ) : (
        <div className="mt-2 text-[10px] leading-snug">
          <button onClick={() => setAyudaPs(v => !v)} className="flex items-center gap-1 font-semibold text-lab-acento underline-offset-2 hover:underline" aria-expanded={ayudaPs}>
            <Gamepad2 className="h-3.5 w-3.5" /> Conectar un control de PlayStation
          </button>
          {ayudaPs && (
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-lab-suave">
              <li>Con el control apagado, mantén <b>PS + Share</b> (PS4) o <b>PS + Crear</b> (PS5) hasta que la luz parpadee rápido.</li>
              <li>En la compu abre <b>Bluetooth</b>, elige «Agregar dispositivo» y selecciona <b>Wireless Controller</b>. (También sirve con cable USB.)</li>
              <li>Vuelve aquí y <b>presiona cualquier botón</b> del control: aparecerá como conectado.</li>
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
