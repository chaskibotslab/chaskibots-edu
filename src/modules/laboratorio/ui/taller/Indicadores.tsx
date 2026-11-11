'use client'

// Indicadores que se dibujan sobre la escena 3D en «Probar»: lecturas del
// robot (HUD), lo que ve la cámara, el estado de cada pin, el cronómetro de la
// carrera y el marcador del combate.

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import type { Simulacion, Telemetria } from '../../engine/simulation'
import type { RobotDoc } from '../../robots/doc'
import type { ReglamentoSumo } from '../../arenas/tipos'
import { NIVELES_RIVAL, NIVELES_RIVAL_COMBATE, revisarReglamento, type NivelRival } from '../../engine/competencia'
import { resumen } from '../../engine/ensamblaje'

/** Lecturas del robot: tiempo y velocidad de simulación arriba a la izquierda; sensores y motores a la derecha. */
export function HUD({ tele, robot = true, python = false }: { tele: Telemetria | null; robot?: boolean; python?: boolean }) {
  if (!tele) return null
  const lento = tele.estado === 'corriendo' && tele.velocidadPct > 0 && tele.velocidadPct < 90
  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 space-y-1.5">
        {(tele.estado === 'corriendo' || tele.estado === 'pausado') && (
          <div className={`rounded-md lab-vidrio px-2.5 py-1.5 font-mono text-[11px] ${lento ? 'text-amber-700' : 'text-lab-tinta2'}`}>
            t = {tele.tiempoSim.toFixed(1)} s · {python ? 'Python' : `${tele.mhz.toFixed(1)} MHz`} · {tele.velocidadPct.toFixed(0)}%
          </div>
        )}
        {tele.limpieza !== undefined && (
          <div className="w-44 rounded-md lab-vidrio px-2.5 py-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-lab-tinta2">Piso limpio</span>
              <span className="font-mono font-semibold text-lab-tinta">{tele.limpieza.toFixed(0)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-lab-tinta/[0.07]">
              <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${tele.limpieza}%` }} />
            </div>
          </div>
        )}
        {tele.error && <div className="max-w-xs rounded-md bg-red-500/20 px-2.5 py-1.5 text-xs text-red-700">{tele.error}</div>}
      </div>

      {robot && <div className="pointer-events-none absolute right-3 top-3 w-56 space-y-2 rounded-md lab-vidrio p-3 text-xs">
        {tele.camara && <VistaCamara imagen={tele.camara} />}
        {tele.perro && (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ['Postura', NOMBRE_POSTURA[tele.perro.postura]],
              ['Distancia', tele.perro.distancia === null ? 'libre' : `${tele.perro.distancia.toFixed(0)} cm`],
              ['Giro', `${tele.perro.orientacion.toFixed(0)}°`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md bg-lab-tinta/[0.04] p-1.5">
                <div className="mb-0.5 text-[10px] text-lab-suave">{k}</div>
                <div className="font-mono text-[11px] text-lab-tinta">{v}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lab-suave">Velocidad</span>
          <span className="font-mono text-lab-tinta">{(tele.velocidadRobot * 100).toFixed(1)} cm/s</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tele.sensores.map(s => (
            <div key={s.instancia} className="rounded-md bg-lab-tinta/[0.04] p-1.5">
              {s.tipo === 'linea' && (
                <>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] text-lab-suave">
                    <span className={`h-2.5 w-2.5 rounded-sm border border-lab-borde/40 ${s.reflectancia < 0.5 ? 'bg-black' : 'bg-white'}`} />
                    Línea
                  </div>
                  <div className="font-mono text-[11px]">
                    <span className={s.digital ? 'text-lab-acento' : 'text-lab-tinta2'}>{s.pinDigital ?? '—'}={s.digital ? 1 : 0}</span>
                    {s.adc !== null && <span className="ml-1 text-lab-suave">{s.adc}</span>}
                  </div>
                </>
              )}
              {s.tipo === 'ultrasonido' && (
                <>
                  <div className="mb-1 text-[10px] text-lab-suave">Ultrasonido</div>
                  <div className="font-mono text-[11px] text-lab-tinta">{s.cm === null ? 'sin eco' : `${s.cm.toFixed(0)} cm`}</div>
                </>
              )}
              {s.tipo === 'obstaculo' && (
                <>
                  <div className="mb-1 text-[10px] text-lab-suave">IR obstáculo</div>
                  <div className={`font-mono text-[11px] ${s.detecta ? 'text-lab-acento' : 'text-lab-tinta2'}`}>{s.detecta ? 'detecta' : 'libre'}</div>
                </>
              )}
            </div>
          ))}
          {tele.servos.map(s => (
            <div key={s.instancia} className="rounded-md bg-lab-tinta/[0.04] p-1.5">
              <div className="mb-1 text-[10px] text-lab-suave">Servo</div>
              <div className="font-mono text-[11px] text-lab-tinta">{s.angulo.toFixed(0)}°</div>
            </div>
          ))}
        </div>
        {tele.motores.map(m => (
          <div key={m.instancia}>
            <div className="mb-0.5 flex justify-between gap-2 text-[10px] text-lab-suave">
              <span className="truncate">{m.etiqueta}</span>
              <span className="shrink-0 font-mono">{m.volts.toFixed(1)} V · {m.rpm.toFixed(0)} rpm</span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-lab-tinta/[0.07]">
              <div
                className={`absolute top-0 h-full ${m.volts >= 0 ? 'left-1/2 bg-emerald-500' : 'right-1/2 bg-amber-400'}`}
                style={{ width: `${Math.min(50, (Math.abs(m.volts) / 6) * 50)}%` }}
              />
              <div className="absolute left-1/2 top-0 h-full w-px bg-lab-tinta/20" />
            </div>
          </div>
        ))}
      </div>}
    </>
  )
}

const NOMBRE_POSTURA: Record<NonNullable<Telemetria['perro']>['postura'], string> = { echado: 'echado', parado: 'de pie', sentado: 'sentado', saludo: 'saluda' }

/** Lo que ve la cámara del robot, píxel por píxel (la misma tabla de números que lee el programa). */
function VistaCamara({ imagen }: { imagen: NonNullable<Telemetria['camara']> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    const datos = ctx.createImageData(imagen.ancho, imagen.alto)
    imagen.px.forEach((b, i) => { datos.data.set([b, b, b, 255], i * 4) })
    ctx.putImageData(datos, 0, 0)
  }, [imagen])
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] text-lab-suave">
        <span>Cámara</span>
        <span className="font-mono">{imagen.ancho} × {imagen.alto} px</span>
      </div>
      <canvas ref={ref} width={imagen.ancho} height={imagen.alto} className="w-full rounded-sm border border-lab-borde/30" style={{ imageRendering: 'pixelated', aspectRatio: `${imagen.ancho} / ${imagen.alto}` }} />
    </div>
  )
}

/** Estado de cada pin de la placa en vivo (entrada, salida, PWM, servo). */
export function PanelPines({ tele }: { tele: Telemetria | null }) {
  const pines = tele?.pines ?? {}
  const nombres = useMemo(() => [...Array.from({ length: 14 }, (_, i) => `D${i}`), ...Array.from({ length: 6 }, (_, i) => `A${i}`)], [])
  const pwm = new Set(['D3', 'D5', 'D6', 'D9', 'D10', 'D11'])
  if (!tele || tele.estado === 'sin-programa') {
    return <p className="p-3 text-xs text-lab-tenue">Ejecuta un programa para ver el estado de cada pin en vivo.</p>
  }
  // Raspberry Pi y Jetson: sus pines (GPIO17, PIN32…) son los que usa el programa.
  const claves = Object.keys(pines)
  const lista = claves.every(k => /^[DA]\d+$/.test(k)) ? nombres : claves.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  return (
    <div className="grid grid-cols-3 gap-1.5 p-3 md:grid-cols-5 xl:grid-cols-7">
      {lista.map(n => {
        const p = pines[n]
        const salida = p?.mode === 'output'
        const esPwm = salida && p.duty > 0.01 && p.duty < 0.99 && p.freqHz > 50
        const esServo = salida && p.pulsoUs > 400 && p.pulsoUs < 2600 && p.freqHz > 30 && p.freqHz < 70
        return (
          <div key={n} className={`rounded-md border px-2 py-1.5 text-[11px] ${salida ? 'border-lab-acento/30 bg-lab-acento/5' : 'border-lab-borde/20 bg-lab-superficie'}`}>
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-lab-tinta">{n}{pwm.has(n) && <span className="ml-0.5 text-[9px] text-lab-tenue">~</span>}</span>
              <span className={`h-2 w-2 rounded-full ${p?.level ? 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-400' : 'bg-slate-300'}`} />
            </div>
            <div className="text-lab-suave">
              {!p ? '—' : esServo ? `Servo · pulso ${p.pulsoUs.toFixed(0)} µs` : salida ? (esPwm ? `PWM ${(p.duty * 100).toFixed(0)}% · ${p.freqHz.toFixed(0)} Hz` : p.level ? 'Salida HIGH' : 'Salida LOW') : p.mode === 'input_pullup' ? 'Entrada (pull-up)' : 'Entrada'}
            </div>
            {esPwm && !esServo && (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-lab-tinta/[0.07]">
                <div className="h-full bg-lab-acento" style={{ width: `${p.duty * 100}%` }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Competencia de velocidad: vuelta, cronómetro y mejor vuelta; al tocarla, los tiempos de cada vuelta. */
export function Carrera({ carrera: c, onReiniciar }: { carrera: NonNullable<Telemetria['carrera']>; onReiniciar: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const seg = (s: number) => `${s.toFixed(1)} s`
  const linea = c.fase === 'espera' ? 'Ejecuta tu programa para largar'
    : c.fase === 'final' ? c.motivo ?? 'Fin de la carrera'
      : `Vuelta ${seg(c.tiempoVuelta)}${c.salidas ? ` · ${c.salidas} salida${c.salidas > 1 ? 's' : ''}` : ''}`
  return (
    <div className="absolute left-1/2 top-3 z-10 w-[min(19rem,calc(100%-1.5rem))] -translate-x-1/2">
      <button onClick={() => setAbierto(a => !a)} aria-expanded={abierto} title="Ver los tiempos de cada vuelta" className="lab-vidrio flex w-full items-center gap-2 rounded-md px-2.5 py-1 text-xs">
        <span className="w-14 text-left font-mono text-base font-bold text-lab-tinta">{seg(c.tiempo)}</span>
        <span className="min-w-0 flex-1 text-center leading-tight">
          <span className="block font-semibold text-lab-tinta">{c.fase === 'final' ? 'Llegada' : `Vuelta ${Math.min(c.vuelta, c.totalVueltas)} de ${c.totalVueltas}`}</span>
          <span className={`block truncate text-[11px] ${c.fase === 'final' && c.vueltas.length >= c.totalVueltas ? 'font-semibold text-emerald-700' : 'text-lab-suave'}`}>{linea}</span>
        </span>
        <span className="w-14 text-right leading-tight"><span className="block text-[10px] uppercase text-lab-tenue">Mejor</span><span className="lab-dato font-mono text-sm font-semibold">{c.mejor === null ? '—' : seg(c.mejor)}</span></span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-lab-tenue transition ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div className="lab-vidrio mt-1 space-y-2 rounded-md p-2.5 text-xs">
          {c.vueltas.length === 0 ? <p className="text-lab-suave">Todavía no hay vueltas completas.</p> : (
            <ol className="space-y-0.5">
              {c.vueltas.map((v, i) => (
                <li key={i} className="flex justify-between"><span className="text-lab-suave">Vuelta {i + 1}</span><span className={`font-mono ${v === c.mejor ? 'font-semibold text-lab-acento' : 'text-lab-tinta'}`}>{seg(v)}</span></li>
              ))}
            </ol>
          )}
          <p className="text-[11px] leading-snug text-lab-suave">Si el robot se aleja de la línea más de 1 s, la vuelta se anula y vuelve a la salida.</p>
          <button onClick={onReiniciar} className="lab-secundario flex h-7 w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium"><RotateCcw className="h-3.5 w-3.5" /> Largar otra vez</button>
        </div>
      )}
    </div>
  )
}

/** Vida de un robot de combate: número y barra (verde → ámbar → rojo). */
function BarraVida({ valor, lado }: { valor: number; lado: 'alumno' | 'rival' }) {
  const color = valor > 50 ? 'bg-emerald-500' : valor > 25 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <span className={`flex w-16 shrink-0 flex-col gap-0.5 ${lado === 'rival' ? 'items-end' : 'items-start'}`} title={`${lado === 'alumno' ? 'Tu vida' : 'Vida del rival'}: ${valor.toFixed(0)}`}>
      <span className={`text-[10px] font-semibold uppercase ${lado === 'alumno' ? 'text-lab-acento' : 'text-red-700'}`}>{lado === 'alumno' ? 'Tú' : 'Rival'} {valor.toFixed(0)}</span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-lab-tinta/10">
        <span className={`block h-full ${color} transition-[width] ${lado === 'rival' ? 'ml-auto' : ''}`} style={{ width: `${Math.max(0, valor)}%` }} />
      </span>
    </span>
  )
}

/**
 * Marcador del combate: una tira chica arriba al centro (para no tapar la arena
 * ni los datos). Al tocarla se despliega el detalle: rival, reglamento y reiniciar.
 */
export function Combate({ sim, tele, reglamento, doc, onReiniciar }: { sim: Simulacion; tele: Telemetria | null; reglamento: ReglamentoSumo; doc: RobotDoc; onReiniciar: () => void }) {
  const [rival, setRival] = useState<NivelRival>(sim.rival)
  const [abierto, setAbierto] = useState(false)
  const reglas = useMemo(() => {
    const r = resumen(doc)
    return revisarReglamento(reglamento, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
  }, [doc, reglamento])
  const c = tele?.combate
  if (!c) return null
  const valido = reglas.every(x => x.ok)
  const niveles = reglamento.tipo === 'battlebot' ? NIVELES_RIVAL_COMBATE : NIVELES_RIVAL
  const vida = c.vida
  const fase =
    c.fase === 'espera' ? 'Ejecuta tu programa para empezar'
      : c.fase === 'cuenta' ? `Espera: no te muevas (${Math.ceil(c.restante)} s)`
        : c.fase === 'combate' ? `¡En juego! ${Math.ceil(c.restante)} s`
          : c.fase === 'pausa' ? c.ultima?.motivo ?? ''
            : c.ganador === 'alumno' ? '¡Ganaste el combate! 🏆' : c.ganador === 'rival' ? 'Ganó el rival: mejora tu programa' : 'Empate'
  return (
    <>
      <div className="absolute left-1/2 top-3 z-10 w-[min(19rem,calc(100%-1.5rem))] -translate-x-1/2">
        <button onClick={() => setAbierto(a => !a)} aria-expanded={abierto} title="Ver rival y reglamento" className="lab-vidrio flex w-full items-center gap-2 rounded-md px-2.5 py-1 text-xs">
          {vida ? <BarraVida valor={vida.alumno} lado="alumno" /> : <span className="lab-dato w-6 text-left font-mono text-base font-bold">{c.marcador.alumno}</span>}
          <span className="min-w-0 flex-1 text-center leading-tight">
            <span className="block font-semibold text-lab-tinta">{c.fase === 'final' ? 'Fin del combate' : vida ? 'Combate' : `Ronda ${c.ronda} de ${reglamento.salidas.length}`}</span>
            <span className={`block truncate text-[11px] ${c.fase === 'final' && c.ganador === 'alumno' ? 'font-semibold text-emerald-700' : 'text-lab-suave'}`}>{c.fase === 'final' && c.ultima ? `${fase} · ${c.ultima.motivo}` : fase}</span>
          </span>
          {vida ? <BarraVida valor={vida.rival} lado="rival" /> : <span className="w-6 text-right font-mono text-base font-bold text-red-700">{c.marcador.rival}</span>}
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-lab-tenue transition ${abierto ? 'rotate-180' : ''}`} />
        </button>
        {abierto && (
          <div className="lab-vidrio mt-1 space-y-2 rounded-md p-2.5 text-xs">
            <div className="flex justify-between text-[10px] uppercase tracking-wide"><span className="text-lab-acento">Tú</span><span className="text-lab-tenue">{c.salida}</span><span className="text-red-700">Rival</span></div>
            <label className="flex items-center gap-1.5 text-[11px] text-lab-suave">
              Rival
              <select
                value={rival}
                onChange={e => { const n = e.target.value as NivelRival; setRival(n); sim.elegirRival(n) }}
                className="h-7 flex-1 rounded-md border border-lab-borde/30 bg-lab-superficie px-1.5 text-xs text-lab-tinta"
                title={niveles[rival].descripcion}
              >
                {(Object.keys(niveles) as NivelRival[]).map(n => <option key={n} value={n}>{niveles[n].nombre}</option>)}
              </select>
            </label>
            <p className="text-[11px] leading-snug text-lab-suave">{niveles[rival].descripcion}</p>
            <div className={valido ? 'text-emerald-700' : 'text-red-700'}>
              {valido ? '✓ Tu robot cumple el reglamento' : <ul className="space-y-0.5">{reglas.filter(x => !x.ok).map(x => <li key={x.texto}>✗ {x.texto}</li>)}</ul>}
            </div>
            <button onClick={onReiniciar} className="lab-secundario flex h-7 w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium"><RotateCcw className="h-3.5 w-3.5" /> {vida ? 'Empezar otra vez' : 'Empezar otra vez (0 a 0)'}</button>
          </div>
        )}
      </div>
      {c.fase === 'cuenta' && c.restante > 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div key={Math.ceil(c.restante)} className="lab-dato animate-ping-once font-mono text-8xl font-black drop-shadow-[0_0_24px_rgba(15,110,120,0.35)]">{Math.ceil(c.restante)}</div>
        </div>
      )}
    </>
  )
}
