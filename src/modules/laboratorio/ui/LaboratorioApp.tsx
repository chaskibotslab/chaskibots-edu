'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Play, Square, Pause, RotateCcw, Upload, Cpu, Gauge, Camera, Navigation, Map as MapIcon,
  Terminal, CircuitBoard, Cable, AlertTriangle, Loader2, Send, Trash2, RotateCw, Download, FileUp,
} from 'lucide-react'
import { Simulacion, type Telemetria } from '../engine/simulation'
import { PISTAS, type Pista } from '../engine/tracks'
import { GRAVEDADES, type Gravedad } from '../engine/physics'
import { SEGUIDOR_LINEA } from '../robots/seguidorLinea'
import { PLANTILLAS, SEGUIDOR_BASICO } from '../robots/plantillas'
import { componente } from '../catalogo'
import EditorCodigo, { type ErrorCompilacion } from './EditorCodigo'
import type { ModoCamara } from './Escena3D'

const Escena3D = dynamic(() => import('./Escena3D'), { ssr: false })

const CLAVE_CODIGO = 'chaskibots-lab:codigo'
const MAX_SERIAL = 20000

type Pestana = 'serial' | 'pines' | 'conexiones' | 'problemas'

function leerLocal(clave: string): string | null {
  try { return localStorage.getItem(clave) } catch { return null }
}
function guardarLocal(clave: string, valor: string) {
  try { localStorage.setItem(clave, valor) } catch { /* modo privado: no pasa nada */ }
}

export default function LaboratorioApp() {
  const [sim, setSim] = useState<Simulacion | null>(null)
  const [codigo, setCodigo] = useState(SEGUIDOR_BASICO)
  const [errores, setErrores] = useState<ErrorCompilacion[]>([])
  const [compilando, setCompilando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(null)
  const [tele, setTele] = useState<Telemetria | null>(null)
  const [serial, setSerial] = useState('')
  const [entrada, setEntrada] = useState('')
  const [pistaId, setPistaId] = useState(PISTAS[0].id)
  const [gravedad, setGravedad] = useState<Gravedad>('tierra')
  const [camara, setCamara] = useState<ModoCamara>('libre')
  const [versionPista, setVersionPista] = useState(0)
  const [pestana, setPestana] = useState<Pestana>('serial')
  const [pistaPropia, setPistaPropia] = useState<string | null>(null)
  const serialRef = useRef<HTMLPreElement>(null)
  const archivoPista = useRef<HTMLInputElement>(null)
  const archivoProyecto = useRef<HTMLInputElement>(null)

  // Crear la simulación una sola vez.
  useEffect(() => {
    const guardado = leerLocal(CLAVE_CODIGO)
    if (guardado) setCodigo(guardado)
    const s = new Simulacion(SEGUIDOR_LINEA)
    s.onTelemetria = setTele
    s.onSerial = t => setSerial(prev => (prev + t).slice(-MAX_SERIAL))
    s.onPistaCambiada = () => setVersionPista(v => v + 1)
    let vivo = true
    s.iniciar(PISTAS[0], 'tierra').then(() => { if (vivo) setSim(s) })
    return () => { vivo = false; s.liberar() }
  }, [])

  useEffect(() => { guardarLocal(CLAVE_CODIGO, codigo) }, [codigo])
  useEffect(() => { serialRef.current?.scrollTo({ top: serialRef.current.scrollHeight }) }, [serial])

  const compilarYEjecutar = useCallback(async () => {
    if (!sim || compilando) return
    setCompilando(true)
    setAviso({ tipo: 'info', texto: 'Compilando con avr-gcc…' })
    try {
      const res = await fetch('/api/lab/compile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ board: 'uno', code: codigo }),
      })
      const data = await res.json()
      if (!res.ok && !data.errors) throw new Error(data.error || `Error ${res.status}`)
      const errs: ErrorCompilacion[] = data.errors ?? []
      setErrores(errs)
      if (!data.ok) {
        setPestana('problemas')
        const n = errs.filter(e => e.severity === 'error').length
        setAviso({ tipo: 'error', texto: n ? `${n} error${n > 1 ? 'es' : ''} de compilación` : 'No se pudo compilar' })
        return
      }
      setSerial('')
      await sim.cargarPrograma(data.hex)
      setPestana('serial')
      setAviso({ tipo: 'ok', texto: `Programa cargado · ${data.size ?? '?'} bytes de 32 256${data.cached ? ' · (caché)' : ''}` })
    } catch (err) {
      setAviso({ tipo: 'error', texto: err instanceof Error ? err.message : 'Error al compilar' })
    } finally {
      setCompilando(false)
    }
  }, [sim, codigo, compilando])

  const detener = () => { sim?.detenerPrograma(); setAviso(null) }
  const pausarContinuar = () => { if (!sim) return; if (sim.pausado) sim.continuar(); else sim.pausar() }

  const cambiarPista = (id: string) => {
    const p = PISTAS.find(x => x.id === id)
    if (!p || !sim) return
    setPistaId(id)
    setPistaPropia(null)
    sim.cambiarPista(p)
  }

  const subirPista = (file: File) => {
    if (!sim) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // La imagen se estira a 3 × 2 m; el robot arranca en el centro.
      const propia: Pista = { id: 'propia', nombre: file.name, anchoM: 3, altoM: 2, inicio: { x: 0, z: 0, yaw: 0 } }
      sim.cambiarPista(propia, img)
      setPistaId('propia')
      setPistaPropia(file.name)
      URL.revokeObjectURL(url)
      setAviso({ tipo: 'info', texto: 'Pista cargada. Haz doble clic sobre la línea para colocar el robot.' })
    }
    img.src = url
  }

  const girarRobot = (delta: number) => {
    if (!sim) return
    const p = sim.fisica.pose()
    sim.colocarRobot({ x: p.pos.x, z: p.pos.z, yaw: p.yaw + delta })
  }

  const exportarProyecto = () => {
    const datos = { formato: 'chaskibots-lab', version: 1, robot: SEGUIDOR_LINEA.nombre, placa: 'uno', pista: pistaId, codigo }
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'proyecto-laboratorio.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importarProyecto = async (file: File) => {
    try {
      const datos = JSON.parse(await file.text())
      if (datos.formato !== 'chaskibots-lab' || typeof datos.codigo !== 'string') throw new Error()
      setCodigo(datos.codigo)
      if (PISTAS.some(p => p.id === datos.pista)) cambiarPista(datos.pista)
      setAviso({ tipo: 'ok', texto: `Proyecto "${file.name}" cargado` })
    } catch {
      setAviso({ tipo: 'error', texto: 'Ese archivo no es un proyecto del laboratorio' })
    }
  }

  const enviarSerial = () => {
    if (!sim || !entrada) return
    sim.enviarSerial(entrada + '\n')
    setEntrada('')
  }

  const corriendo = tele?.estado === 'corriendo' || tele?.estado === 'pausado'

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[600px] flex-col bg-labdark-void text-slate-200">
      {/* ---------- Barra superior ---------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-labdark-surface px-3 py-2">
        <div className="mr-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chaski-primary/15 text-chaski-primary">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Laboratorio de Robótica</div>
            <div className="text-[11px] text-slate-400">Arduino UNO · ATmega328P emulado</div>
          </div>
        </div>

        <select
          className="h-9 rounded-lg border border-white/10 bg-labdark-bg px-2 text-sm"
          value=""
          onChange={e => {
            const p = PLANTILLAS.find(x => x.id === e.target.value)
            if (p) { setCodigo(p.codigo); setErrores([]) }
          }}
          title="Cargar una plantilla de código"
        >
          <option value="" disabled>Plantillas…</option>
          {PLANTILLAS.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        <button
          onClick={compilarYEjecutar}
          disabled={!sim || compilando}
          className="flex h-9 items-center gap-2 rounded-lg bg-chaski-primary px-4 text-sm font-semibold text-white shadow-lg shadow-chaski-primary/20 transition hover:bg-chaski-secondary active:scale-[0.98] disabled:opacity-50"
          title="Compilar y ejecutar (Ctrl+Enter)"
        >
          {compilando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Compilar y ejecutar
        </button>
        {corriendo && (
          <>
            <button onClick={pausarContinuar} className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-labdark-bg px-3 text-sm hover:bg-white/5">
              {tele?.estado === 'pausado' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {tele?.estado === 'pausado' ? 'Seguir' : 'Pausa'}
            </button>
            <button onClick={detener} className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-labdark-bg px-3 text-sm hover:bg-white/5">
              <Square className="h-4 w-4" /> Detener
            </button>
          </>
        )}

        <div className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

        <button onClick={() => sim?.colocarRobot()} className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-labdark-bg px-3 text-sm hover:bg-white/5" title="Volver a la salida">
          <RotateCcw className="h-4 w-4" /> Salida
        </button>
        <button onClick={() => girarRobot(Math.PI / 12)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-labdark-bg hover:bg-white/5" title="Girar el robot 15° a la izquierda">
          <RotateCcw className="h-4 w-4 -scale-x-100 rotate-180" />
        </button>
        <button onClick={() => girarRobot(-Math.PI / 12)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-labdark-bg hover:bg-white/5" title="Girar el robot 15° a la derecha">
          <RotateCw className="h-4 w-4" />
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-labdark-bg pl-2 text-sm">
            <MapIcon className="h-4 w-4 text-slate-400" />
            <select className="h-full bg-transparent pr-2 outline-none" value={pistaId} onChange={e => cambiarPista(e.target.value)}>
              {PISTAS.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              {pistaPropia && <option value="propia">{pistaPropia}</option>}
            </select>
          </label>
          <button onClick={() => archivoPista.current?.click()} className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-labdark-bg px-3 text-sm hover:bg-white/5" title="Usar tu propia pista (imagen PNG/JPG, se estira a 3 × 2 m)">
            <Upload className="h-4 w-4" /> Pista
          </button>
          <input ref={archivoPista} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) subirPista(f); e.target.value = '' }} />
          <label className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-labdark-bg pl-2 text-sm" title="Gravedad">
            <Gauge className="h-4 w-4 text-slate-400" />
            <select className="h-full bg-transparent pr-2 outline-none" value={gravedad} onChange={e => { const g = e.target.value as Gravedad; setGravedad(g); sim?.cambiarGravedad(g) }}>
              {Object.entries(GRAVEDADES).map(([k, v]) => <option key={k} value={k}>{v.nombre} ({v.g} m/s²)</option>)}
            </select>
          </label>
          <div className="flex h-9 overflow-hidden rounded-lg border border-white/10 text-sm">
            {([['libre', 'Libre', Camera], ['seguir', 'Seguir', Navigation], ['arriba', 'Arriba', MapIcon]] as const).map(([id, txt, Icon]) => (
              <button key={id} onClick={() => setCamara(id)} className={`flex items-center gap-1 px-2.5 ${camara === id ? 'bg-chaski-primary/20 text-chaski-primary' : 'bg-labdark-bg hover:bg-white/5'}`}>
                <Icon className="h-3.5 w-3.5" /> {txt}
              </button>
            ))}
          </div>
          <button onClick={exportarProyecto} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-labdark-bg hover:bg-white/5" title="Descargar proyecto (.json)">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={() => archivoProyecto.current?.click()} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-labdark-bg hover:bg-white/5" title="Abrir proyecto (.json)">
            <FileUp className="h-4 w-4" />
          </button>
          <input ref={archivoProyecto} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importarProyecto(f); e.target.value = '' }} />
        </div>
      </div>

      {aviso && (
        <div className={`border-b px-4 py-1.5 text-xs ${aviso.tipo === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : aviso.tipo === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-sky-500/30 bg-sky-500/10 text-sky-300'}`}>
          {aviso.texto}
        </div>
      )}

      {/* ---------- Cuerpo ---------- */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Editor */}
        <div className="flex h-[45vh] min-h-0 flex-col border-white/10 lg:h-auto lg:w-[40%] lg:border-r">
          <div className="flex items-center justify-between border-b border-white/10 bg-labdark-bg2 px-3 py-1.5 text-xs text-slate-400">
            <span className="font-mono">sketch.ino</span>
            <span>Ctrl+Enter para ejecutar</span>
          </div>
          <div className="min-h-0 flex-1">
            <EditorCodigo codigo={codigo} onChange={setCodigo} errores={errores} onEjecutar={compilarYEjecutar} />
          </div>
        </div>

        {/* Simulación */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-[300px] flex-[3]">
            {sim ? (
              <Escena3D sim={sim} modoCamara={camara} versionPista={versionPista} />
            ) : (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Preparando física…
              </div>
            )}
            {sim && <HUD tele={tele} />}
            <div className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-slate-400/80">
              Doble clic en la pista para mover el robot · arrastra para girar la cámara
            </div>
          </div>

          {/* Paneles inferiores */}
          <div className="flex min-h-[200px] flex-[2] flex-col border-t border-white/10 bg-labdark-bg">
            <div className="flex border-b border-white/10 text-xs">
              {([
                ['serial', 'Monitor serial', Terminal],
                ['pines', 'Pines y sensores', CircuitBoard],
                ['conexiones', 'Conexiones', Cable],
                ['problemas', `Problemas${errores.length ? ` (${errores.length})` : ''}`, AlertTriangle],
              ] as const).map(([id, txt, Icon]) => (
                <button key={id} onClick={() => setPestana(id)} className={`flex items-center gap-1.5 border-b-2 px-3 py-2 ${pestana === id ? 'border-chaski-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                  <Icon className="h-3.5 w-3.5" /> {txt}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {pestana === 'serial' && (
                <div className="flex h-full flex-col">
                  <pre ref={serialRef} className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-xs text-emerald-300">
                    {serial || <span className="text-slate-500">Lo que tu programa envíe con Serial.print aparece aquí (9600 baudios).</span>}
                  </pre>
                  <div className="flex gap-2 border-t border-white/10 p-2">
                    <input
                      value={entrada}
                      onChange={e => setEntrada(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') enviarSerial() }}
                      placeholder="Enviar texto al Arduino…"
                      className="h-8 flex-1 rounded-md border border-white/10 bg-labdark-void px-2 font-mono text-xs outline-none focus:border-chaski-primary/50"
                    />
                    <button onClick={enviarSerial} className="flex h-8 items-center gap-1 rounded-md bg-white/10 px-3 text-xs hover:bg-white/15"><Send className="h-3.5 w-3.5" /> Enviar</button>
                    <button onClick={() => setSerial('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 hover:bg-white/10" title="Limpiar"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}
              {pestana === 'pines' && <PanelPines tele={tele} />}
              {pestana === 'conexiones' && <PanelConexiones avisos={tele?.avisos ?? []} />}
              {pestana === 'problemas' && (
                <div className="p-3 text-xs">
                  {errores.length === 0 ? (
                    <p className="text-slate-500">Sin problemas. Los errores del compilador aparecen aquí y subrayados en el editor.</p>
                  ) : errores.map((e, i) => (
                    <div key={i} className="flex gap-2 border-b border-white/5 py-1.5">
                      <span className={e.severity === 'error' ? 'text-red-400' : 'text-amber-400'}>{e.severity === 'error' ? 'Error' : 'Aviso'}</span>
                      <span className="font-mono text-slate-400">línea {e.line}</span>
                      <span className="text-slate-200">{e.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Indicadores sobre la escena ----------

function HUD({ tele }: { tele: Telemetria | null }) {
  if (!tele) return null
  const estado = {
    'sin-programa': { txt: 'Sin programa', cls: 'bg-slate-500' },
    cargando: { txt: 'Cargando…', cls: 'bg-sky-400' },
    corriendo: { txt: 'Ejecutando', cls: 'bg-emerald-400 animate-pulse' },
    pausado: { txt: 'En pausa', cls: 'bg-amber-400' },
    error: { txt: 'Error', cls: 'bg-red-500' },
  }[tele.estado]
  const lento = tele.estado === 'corriendo' && tele.velocidadPct > 0 && tele.velocidadPct < 90
  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${estado.cls}`} />
          <span className="font-medium text-white">{estado.txt}</span>
          {tele.estado !== 'sin-programa' && <span className="font-mono text-slate-400">t = {tele.tiempoSim.toFixed(1)} s</span>}
        </div>
        {tele.estado === 'corriendo' && (
          <div className={`rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 font-mono text-[11px] backdrop-blur ${lento ? 'text-amber-300' : 'text-slate-300'}`}>
            {tele.mhz.toFixed(1)} MHz · velocidad de simulación {tele.velocidadPct.toFixed(0)}%
          </div>
        )}
        {tele.error && <div className="rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs text-red-300">{tele.error}</div>}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 w-56 space-y-2 rounded-xl border border-white/10 bg-black/50 p-3 text-xs backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Velocidad</span>
          <span className="font-mono text-white">{(tele.velocidadRobot * 100).toFixed(1)} cm/s</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tele.sensores.map(s => (
            <div key={s.instancia} className="rounded-md bg-white/5 p-1.5">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className={`h-2.5 w-2.5 rounded-sm border border-white/30 ${s.reflectancia < 0.5 ? 'bg-black' : 'bg-white'}`} />
                IR {s.instancia.endsWith('izq') ? 'izq' : 'der'}
              </div>
              <div className="font-mono text-[11px]">
                <span className={s.digital ? 'text-chaski-primary' : 'text-slate-300'}>{s.pinDigital}={s.digital ? 1 : 0}</span>
                {s.adc !== null && <span className="ml-1 text-slate-400">{s.pinAnalogico}:{s.adc}</span>}
              </div>
            </div>
          ))}
        </div>
        {tele.motores.map(m => (
          <div key={m.instancia}>
            <div className="mb-0.5 flex justify-between text-[10px] text-slate-400">
              <span>Motor {m.lado}</span>
              <span className="font-mono">{m.volts.toFixed(1)} V · {m.rpm.toFixed(0)} rpm</span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`absolute top-0 h-full ${m.volts >= 0 ? 'left-1/2 bg-emerald-400' : 'right-1/2 bg-amber-400'}`}
                style={{ width: `${Math.min(50, (Math.abs(m.volts) / 5.4) * 50)}%` }}
              />
              <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function PanelPines({ tele }: { tele: Telemetria | null }) {
  const pines = tele?.pines ?? {}
  const nombres = useMemo(() => [...Array.from({ length: 14 }, (_, i) => `D${i}`), ...Array.from({ length: 6 }, (_, i) => `A${i}`)], [])
  const pwm = new Set(['D3', 'D5', 'D6', 'D9', 'D10', 'D11'])
  if (!tele || tele.estado === 'sin-programa') {
    return <p className="p-3 text-xs text-slate-500">Ejecuta un programa para ver el estado de cada pin en vivo.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-4 xl:grid-cols-5">
      {nombres.map(n => {
        const p = pines[n]
        const salida = p?.mode === 'output'
        const esPwm = salida && p.duty > 0.01 && p.duty < 0.99 && p.freqHz > 50
        return (
          <div key={n} className={`rounded-md border px-2 py-1.5 text-[11px] ${salida ? 'border-chaski-primary/30 bg-chaski-primary/5' : 'border-white/10 bg-white/[0.02]'}`}>
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-white">{n}{pwm.has(n) && <span className="ml-0.5 text-[9px] text-slate-500">~</span>}</span>
              <span className={`h-2 w-2 rounded-full ${p?.level ? 'bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400' : 'bg-slate-600'}`} />
            </div>
            <div className="text-slate-400">
              {!p ? '—' : salida ? (esPwm ? `PWM ${(p.duty * 100).toFixed(0)}% · ${p.freqHz.toFixed(0)} Hz` : p.level ? 'Salida HIGH' : 'Salida LOW') : p.mode === 'input_pullup' ? 'Entrada (pull-up)' : 'Entrada'}
            </div>
            {esPwm && (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-chaski-primary" style={{ width: `${p.duty * 100}%` }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PanelConexiones({ avisos }: { avisos: string[] }) {
  const robot = SEGUIDOR_LINEA
  const etiqueta = (id: string) => robot.instancias.find(i => i.id === id)?.etiqueta ?? id
  return (
    <div className="p-3 text-xs">
      {avisos.map((a, i) => (
        <div key={i} className="mb-2 flex items-center gap-2 rounded-md bg-amber-500/10 px-2 py-1.5 text-amber-300"><AlertTriangle className="h-3.5 w-3.5" /> {a}</div>
      ))}
      <p className="mb-2 text-slate-400">
        Cableado del robot <b className="text-slate-200">{robot.nombre}</b> · masa total {robot.instancias.reduce((s, i) => s + componente(i.tipo).masa_g, 0)} g.
        La simulación usa estas conexiones: si un sensor va a otro pin, cámbialo en tu código.
      </p>
      <table className="w-full">
        <tbody>
          {robot.conexiones.map((c, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-1 pr-2"><span className="inline-block h-2.5 w-2.5 rounded-full border border-white/20" style={{ background: c.color }} /></td>
              <td className="py-1 pr-2 text-slate-300">{etiqueta(c.de[0])}</td>
              <td className="py-1 pr-3 font-mono text-white">{c.de[1]}</td>
              <td className="py-1 pr-3 text-slate-500">→</td>
              <td className="py-1 pr-2 text-slate-300">{etiqueta(c.a[0])}</td>
              <td className="py-1 font-mono text-white">{c.a[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
