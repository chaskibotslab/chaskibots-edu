'use client'

// Panel de la mesa de electrónica en «Probar»: lo que el alumno toca (pulsadores,
// perillas, luz sobre la LDR, la mano frente al sensor ultrasónico) y lo que el
// circuito muestra (LED, buzzers, distancia medida y ángulo de cada servo).
// Los pulsadores también se presionan haciendo clic sobre ellos en 3D, o con
// las teclas 1, 2, 3… mientras se mantienen apretadas.

import { useEffect, useMemo, useState } from 'react'
import { Hand, Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import { LUZ_INICIAL, MANO_MAX_CM, MANO_MIN_CM, PERILLA_INICIAL } from '../../engine/circuito'
import type { Simulacion, Telemetria } from '../../engine/simulation'

interface Props {
  sim: Simulacion
  tele: Telemetria | null
  silencio: boolean
  onSilencio: (s: boolean) => void
  /** Se llama al tocar un control (habilita el audio del navegador). */
  onGesto: () => void
}

export default function PanelCircuito({ sim, tele, silencio, onSilencio, onGesto }: Props) {
  const plan = sim.circuito
  const [, refrescar] = useState(0)
  const botones = useMemo(() => plan?.controles.filter(c => c.tipo === 'pulsador') ?? [], [plan])

  // Teclas 1–9: mantener presionado el pulsador correspondiente.
  useEffect(() => {
    if (!botones.length) return
    const tecla = (abajo: boolean) => (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const i = Number(e.key) - 1
      const b = botones[i]
      if (!b || e.repeat) return
      if (abajo) onGesto()
      sim.presionar(b.inst, abajo)
      refrescar(x => x + 1)
    }
    const bajar = tecla(true), subir = tecla(false)
    window.addEventListener('keydown', bajar)
    window.addEventListener('keyup', subir)
    return () => { window.removeEventListener('keydown', bajar); window.removeEventListener('keyup', subir) }
  }, [sim, botones, onGesto])

  const ultrasonido = sim.plan.ultrasonidos[0]
  const servos = sim.plan.servos
  if (!plan && !ultrasonido && !servos.length) return null
  const controles = plan?.controles ?? []
  const estado = tele?.circuito
  const etiqueta = new Map(sim.doc.piezas.map(p => [p.id, p]))
  const leds = sim.doc.piezas.filter(p => ['led', 'led-rgb'].includes(pieza(p.pieza).comportamiento.tipo))
  const buzzers = sim.doc.piezas.filter(p => pieza(p.pieza).comportamiento.tipo === 'buzzer')

  return (
    <div className="absolute right-3 top-3 z-10 w-60 max-w-[calc(100%-1.5rem)] space-y-2.5 rounded-xl lab-vidrio p-3 text-xs">
      {(controles.length > 0 || ultrasonido) && (
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tú controlas</div>
          {ultrasonido && <ControlMano sim={sim} tele={tele} onGesto={onGesto} onCambio={() => refrescar(x => x + 1)} />}
          {controles.map(c => {
            if (c.tipo === 'pulsador') {
              const n = botones.indexOf(c) + 1
              const presionado = !!sim.controles.botones[c.inst]
              const cambiar = (v: boolean) => { if (v) onGesto(); sim.presionar(c.inst, v); refrescar(x => x + 1) }
              return (
                <button
                  key={c.inst}
                  onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); cambiar(true) }}
                  onPointerUp={() => cambiar(false)}
                  onPointerCancel={() => cambiar(false)}
                  className={`flex w-full touch-none select-none items-center justify-between gap-2 rounded-lg border px-2.5 py-2 font-medium transition ${presionado ? 'translate-y-px border-red-400/60 bg-red-500/25 text-white' : 'border-lab-borde/20 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-3.5 w-3.5 rounded-full border-2 ${presionado ? 'border-red-300 bg-red-500' : 'border-red-400/70 bg-red-500/40'}`} />
                    {c.etiqueta}
                  </span>
                  <span className="text-[10px] text-slate-400">{presionado ? 'presionado' : `mantén · tecla ${n}`}</span>
                </button>
              )
            }
            const luz = c.tipo === 'ldr'
            const valor = sim.controles.perillas[c.inst] ?? (luz ? LUZ_INICIAL : PERILLA_INICIAL)
            return (
              <label key={c.inst} className="block">
                <div className="mb-1 flex items-center justify-between text-slate-300">
                  <span>{luz ? 'Luz sobre la LDR' : c.etiqueta}</span>
                  <span className="font-mono text-slate-400">{Math.round(valor * 100)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {luz && <Moon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  <input
                    type="range" min={0} max={1} step={0.01} value={valor}
                    onChange={e => { onGesto(); sim.ajustar(c.inst, Number(e.target.value)); refrescar(x => x + 1) }}
                    className="h-1.5 w-full cursor-pointer accent-[rgb(var(--lab-acento))]"
                    aria-label={luz ? 'Luz sobre la LDR' : `Giro de ${c.etiqueta}`}
                  />
                  {luz && <Sun className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
                </div>
              </label>
            )
          })}
        </div>
      )}

      {leds.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">LED</div>
          <div className="flex flex-wrap gap-2">
            {leds.map(l => {
              const c = pieza(l.pieza).comportamiento
              const b = estado?.leds[l.id] ?? [0, 0, 0]
              const quemado = estado?.quemados.includes(l.id) || tele?.avisos.some(a => a.startsWith(`${l.etiqueta}: se quemó`))
              const color = c.tipo === 'led'
                ? c.color
                : `rgb(${Math.round((b[0] ?? 0) * 255)}, ${Math.round((b[1] ?? 0) * 255)}, ${Math.round((b[2] ?? 0) * 255)})`
              const brillo = Math.max(...b.map(x => x ?? 0), 0)
              return (
                <div key={l.id} className="flex items-center gap-1.5 rounded-md bg-white/5 px-1.5 py-1" title={etiqueta.get(l.id)?.etiqueta}>
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ background: quemado ? '#3f2a1d' : color, opacity: quemado ? 1 : 0.25 + 0.75 * brillo, boxShadow: brillo > 0.05 && !quemado ? `0 0 ${4 + brillo * 10}px ${color}` : 'none' }}
                  />
                  <span className="max-w-[6.5rem] truncate text-[11px] text-slate-300">{quemado ? `${l.etiqueta} · quemado` : l.etiqueta}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {servos.length > 0 && (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Servo</div>
          {servos.map(sv => {
            const a = tele?.servos.find(x => x.instancia === sv.instancia)?.angulo ?? 90
            return (
              <div key={sv.instancia} className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="min-w-0 flex-1 truncate">{etiqueta.get(sv.instancia)?.etiqueta}</span>
                <span className="relative h-3 w-6 shrink-0 overflow-hidden" aria-hidden>
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-3 origin-left rounded bg-lab-acento" style={{ transform: `rotate(${-a}deg)` }} />
                </span>
                <span className="w-9 text-right font-mono text-slate-200">{Math.round(a)}°</span>
              </div>
            )
          })}
        </div>
      )}

      {buzzers.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Buzzer</div>
            <div className="truncate font-mono text-[11px] text-slate-200">
              {estado?.sonidos.length ? estado.sonidos.map(s => `♪ ${Math.round(s.freq)} Hz`).join(' · ') : 'en silencio'}
            </div>
          </div>
          <button onClick={() => { onGesto(); onSilencio(!silencio) }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-lab-borde/20 bg-white/5 hover:bg-white/10" title={silencio ? 'Activar sonido' : 'Silenciar'}>
            {silencio ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-lab-acento" />}
          </button>
        </div>
      )}
    </div>
  )
}

/** La mano frente al sensor ultrasónico: a la derecha del todo no hay mano («lejos»). */
function ControlMano({ sim, tele, onGesto, onCambio }: { sim: Simulacion; tele: Telemetria | null; onGesto: () => void; onCambio: () => void }) {
  const mano = sim.controles.mano ?? null
  const lejos = MANO_MAX_CM + 1
  const medida = tele?.sensores.find(l => l.tipo === 'ultrasonido')
  const cm = medida?.tipo === 'ultrasonido' ? medida.cm : null
  const poner = (v: number | null) => { onGesto(); sim.ponerMano(v); onCambio() }
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-slate-300">
        <span className="flex items-center gap-1.5"><Hand className="h-3.5 w-3.5 text-amber-300" /> Mano frente al sensor</span>
        <span className="font-mono text-slate-400">{mano === null ? 'lejos' : `${mano} cm`}</span>
      </div>
      <input
        type="range" min={MANO_MIN_CM} max={lejos} step={1} value={mano ?? lejos}
        onChange={e => { const v = Number(e.target.value); poner(v >= lejos ? null : v) }}
        className="h-1.5 w-full cursor-pointer accent-[rgb(var(--lab-acento))]"
        aria-label="Distancia de la mano al sensor"
      />
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-400">
        <span>El sensor mide: <span className="font-mono text-slate-200">{cm === null ? 'sin eco' : `${cm.toFixed(0)} cm`}</span></span>
        <button onClick={() => poner(mano === null ? 10 : null)} className="rounded border border-lab-borde/20 bg-white/5 px-1.5 py-0.5 text-slate-200 hover:bg-white/10">
          {mano === null ? 'Acercar' : 'Quitar'}
        </button>
      </div>
    </div>
  )
}
