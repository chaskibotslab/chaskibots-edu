'use client'

/**
 * Simulador LEGO MINDSTORMS EV3: editor de bloques (Blockly) + robot 3D,
 * con clases por cursos (cada una con su solución) y modo libre. La física corre en la escena 3D.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Play, Square, RotateCcw, Maximize2, Minimize2, Trophy, Loader2, ChevronDown, ChevronUp, Lightbulb, Wand2, Eraser, Hammer, ChevronRight } from 'lucide-react'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'
import { LegoMotor } from './engine'
import { crearApiEV3 } from './apiEV3'
import { definirBloquesEV3, crearTemaEV3, crearGeneradorEV3, TOOLBOX_EV3 } from './bloquesEV3'
import { CURSOS, MISIONES_EV3 } from './misionesEV3'
import { GUIAS, GUIA_ROBOT, ROBOTS_SIMULABLES } from './guiasEV3'

const Escena3D = dynamic(() => import('./Escena3D'), { ssr: false })

const AsyncFunction = Object.getPrototypeOf(async function () { /* molde */ }).constructor
const PROGRAMA_INICIAL = { blocks: { languageVersion: 0, blocks: [{ type: 'ev3_inicio', x: 40, y: 40 }] } }
const VELOCIDADES = [1, 2, 4]

// Lo que se guarda en este navegador: el programa de cada actividad y cuáles ya se lograron
const CLAVE_LOGROS = 'ev3-logros'
const clavePrograma = (id: string) => 'ev3-programa-' + id
const leer = (clave: string): any => { try { return JSON.parse(localStorage.getItem(clave) || 'null') } catch { return null } }
const guardar = (clave: string, valor: unknown) => { try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ } }

/** Primera actividad pensada para un robot (o el modo libre). */
const misionDe = (robotId?: string) => Math.max(0, MISIONES_EV3.findIndex(m => m.robot === robotId && m.id !== 'libre'))

export default function EV3Lab({ robotInicial, onArmar }: { robotInicial?: string; onArmar?: (robotId: string) => void }) {
  const divBloques = useRef<HTMLDivElement>(null)
  const ws = useRef<any>(null)
  const libs = useRef<any>(null)
  const motorRef = useRef<LegoMotor>()
  if (!motorRef.current) motorRef.current = new LegoMotor()
  const motor = motorRef.current

  const { expanded, toggle } = useExpand()
  const [listo, setListo] = useState(false)
  const [misionIdx, setMisionIdx] = useState(() => (robotInicial ? misionDe(robotInicial) : 0))
  const mision = MISIONES_EV3[misionIdx]
  const [robotId, setRobotId] = useState(robotInicial && ROBOTS_SIMULABLES.some(r => r.id === robotInicial) ? robotInicial : mision.robot)
  const robot = ROBOTS_SIMULABLES.find(r => r.id === robotId) || GUIA_ROBOT
  const [version, setVersion] = useState(0)
  const [velocidad, setVelocidad] = useState(1)
  const [corriendo, setCorriendo] = useState(false)
  const [logrado, setLogrado] = useState(false)
  const [guiaAbierta, setGuiaAbierta] = useState(true)
  const [aviso, setAviso] = useState('')
  const [confirma, setConfirma] = useState<'' | 'solucion' | 'borrar'>('')
  const [logros, setLogros] = useState<string[]>([])
  const [hud, setHud] = useState({ color: 'blanco', lineas: [] as string[], distancia: 0, angulo: 0, tiempo: 0, mensaje: '' })
  const misionRef = useRef(mision)
  misionRef.current = mision

  useEffect(() => { const l = leer(CLAVE_LOGROS); if (Array.isArray(l)) setLogros(l) }, [])

  // El robot elegido define qué sensores de línea existen
  useEffect(() => { motor.lineas = robot.lineas; motor.alError = setAviso }, [motor, robot])

  // HUD en vivo (sensores + mensaje del robot)
  useEffect(() => {
    const id = setInterval(() => setHud({
      color: motor.color(), lineas: motor.lineas.map((_, i) => motor.colorLinea(i + 1)),
      distancia: motor.distancia(), angulo: motor.angulo(), tiempo: motor.tiempo, mensaje: motor.mensaje,
    }), 150)
    return () => clearInterval(id)
  }, [motor])

  const cargarPrograma = useCallback((prog: unknown) => {
    if (!ws.current || !libs.current) return
    const { Blockly } = libs.current
    try { ws.current.clear(); Blockly.serialization.workspaces.load(prog, ws.current) }
    catch { try { ws.current.clear(); Blockly.serialization.workspaces.load(PROGRAMA_INICIAL, ws.current) } catch { /* vacío */ } }
    ws.current.scrollCenter?.()
  }, [])

  // Iniciar Blockly
  useEffect(() => {
    let vivo = true
    let reloj: any
    ;(async () => {
      const Blockly: any = await import('blockly')
      const jsMod: any = await import('blockly/javascript')
      const Es: any = await import('blockly/msg/es')
      if (!vivo || !divBloques.current) return
      Blockly.setLocale(Es.default || Es)
      definirBloquesEV3(Blockly)
      libs.current = { Blockly, gen: crearGeneradorEV3(jsMod) }
      ws.current = Blockly.inject(divBloques.current, {
        toolbox: TOOLBOX_EV3, theme: crearTemaEV3(Blockly), renderer: 'zelos', media: '/blockly-media/',
        trashcan: true, zoom: { controls: true, wheel: true, startScale: 0.8, maxScale: 1.6, minScale: 0.4 },
        grid: { spacing: 26, length: 2, colour: '#e2e8f0', snap: true },
      })
      cargarPrograma(leer(clavePrograma(misionRef.current.id)) || PROGRAMA_INICIAL)
      // guardar el programa de la actividad actual cada vez que cambia
      ws.current.addChangeListener((e: any) => {
        if (e.isUiEvent) return
        clearTimeout(reloj)
        reloj = setTimeout(() => { if (ws.current) guardar(clavePrograma(misionRef.current.id), Blockly.serialization.workspaces.save(ws.current)) }, 400)
      })
      setListo(true)
    })()
    return () => { vivo = false; clearTimeout(reloj); motor.detener(); ws.current?.dispose(); ws.current = null }
  }, [motor, cargarPrograma])

  // Reajustar Blockly al cambiar tamaño (pantalla completa)
  useEffect(() => {
    const el = divBloques.current
    if (!el) return
    const ro = new ResizeObserver(() => { if (ws.current && libs.current) libs.current.Blockly.svgResize(ws.current) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const compilar = (): string => libs.current.gen.workspaceToCode(ws.current)

  const marcarLogro = useCallback((id: string) => {
    setLogrado(true)
    setLogros(l => { if (l.includes(id)) return l; const n = [...l, id]; guardar(CLAVE_LOGROS, n); return n })
  }, [])

  const ejecutar = useCallback(async () => {
    if (!listo || corriendo) return
    setAviso(''); setLogrado(false); setConfirma('')
    motor.detener(); motor.reiniciar()
    let codigo = ''
    try { codigo = compilar() } catch (e: any) { setAviso('No pude leer el programa: ' + (e?.message || e)); return }
    if (!codigo.trim()) { setAviso('Arrastra bloques debajo de «▶ al empezar» y pulsa Ejecutar. Si no sabes por dónde empezar, pulsa «Ver solución».'); return }
    setCorriendo(true)
    const token = motor.nuevaEjecucion()
    const api = crearApiEV3(motor, token)
    // Vigilar la actividad mientras corre: al lograrla (o al caer del ring) el robot se detiene
    motor.alPaso = () => {
      if (!motor.vivo(token)) return
      if (mision.logro(motor)) { marcarLogro(mision.id); motor.detener() }
      else if (motor.caido) { setAviso('¡Te saliste del ring! Mira el borde blanco con los sensores y retrocede a tiempo.'); motor.detener() }
    }
    try {
      const fn = new AsyncFunction('api', codigo)
      await fn(api)
    } catch (e: any) {
      if (e && e.name !== 'Detenido') setAviso('Error al ejecutar: ' + (e?.message || e))
    } finally {
      // el programa terminó solo: los motores se apagan y se revisa una última vez
      if (motor.vivo(token)) { motor.vL = motor.vR = 0; motor.alPaso = null; if (mision.logro(motor)) marcarLogro(mision.id) }
      setCorriendo(false)
    }
  }, [listo, corriendo, motor, mision, marcarLogro])

  const parar = () => { motor.detener(); setCorriendo(false) }
  const reiniciar = () => { motor.detener(); motor.reiniciar(); setCorriendo(false); setLogrado(false); setAviso('') }

  const elegirMision = (i: number) => {
    motor.detener()
    // guardar lo que hay antes de cambiar
    if (ws.current && libs.current) guardar(clavePrograma(mision.id), libs.current.Blockly.serialization.workspaces.save(ws.current))
    const m = MISIONES_EV3[i]
    misionRef.current = m
    setMisionIdx(i); setRobotId(m.robot); setVersion(v => v + 1); setCorriendo(false); setLogrado(false); setAviso(''); setConfirma(''); setGuiaAbierta(true)
    cargarPrograma(leer(clavePrograma(m.id)) || PROGRAMA_INICIAL)
  }

  const verSolucion = () => {
    if (confirma !== 'solucion') { setConfirma('solucion'); return }
    setConfirma('')
    if (mision.solucion) { reiniciar(); cargarPrograma(mision.solucion); setAviso('Cargué un programa que funciona. Pulsa ▶ Ejecutar, míralo y luego cámbiale números para ver qué pasa.') }
  }
  const borrar = () => {
    if (confirma !== 'borrar') { setConfirma('borrar'); return }
    setConfirma(''); reiniciar(); cargarPrograma(PROGRAMA_INICIAL)
  }

  const curso = CURSOS.find(c => c.id === mision.curso)
  const recomendado = GUIAS.find(g => g.id === mision.robot)
  const haySiguiente = misionIdx < MISIONES_EV3.length - 1
  const hechasCurso = MISIONES_EV3.filter(m => m.curso === mision.curso && logros.includes(m.id)).length
  const totalCurso = MISIONES_EV3.filter(m => m.curso === mision.curso && m.id !== 'libre').length

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-slate-100 text-slate-900 ${expanded ? 'fixed inset-0 z-[200] rounded-none' : 'relative h-full min-h-[560px]'}`}>
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-2 bg-[#E8A33D] px-3 py-1.5 text-white">
        <span className="text-sm font-extrabold tracking-tight">🤖 LEGO EV3</span>
        <select value={misionIdx} onChange={e => elegirMision(Number(e.target.value))} title="Elige una clase"
          className="max-w-[60vw] rounded-md border border-white/40 bg-white/15 px-2 py-1 text-xs font-semibold text-white focus:bg-white focus:text-slate-900 focus:outline-none">
          {CURSOS.map(c => (
            <optgroup key={c.id} label={`${c.emoji} ${c.nombre}`} className="text-slate-900">
              {MISIONES_EV3.map((m, i) => m.curso === c.id && (
                <option key={m.id} value={i} className="text-slate-900">{logros.includes(m.id) ? '✅' : m.emoji} {m.titulo}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold sm:inline">{mision.nivel}</span>
        <span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold md:inline" title="Actividades logradas en este curso">🏆 {hechasCurso}/{totalCurso}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <EnviarTarea
            simulador="LEGO EV3"
            sigla="EV3"
            botonClassName="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white disabled:opacity-80"
            obtenerEntrega={() => {
              let codigo = ''
              try { codigo = compilar() } catch { /* sin bloques */ }
              return {
                output: `LEGO EV3 — ${curso?.nombre || ''} · «${mision.titulo}» (${mision.nivel}) con ${robot.nombre}. ${logrado || logros.includes(mision.id) ? '✅ Lograda' : '⏳ En progreso'}.`,
                code: codigo || '(sin bloques)',
                files: { ev3: { mision: mision.id, curso: mision.curso, logrado: logrado || logros.includes(mision.id), robot: robot.id, logros } },
              }
            }}
          />
          <button onClick={toggle} title={expanded ? 'Salir de pantalla completa' : 'Pantalla completa'} className="rounded-md p-1.5 hover:bg-white/20">
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Editor de bloques */}
        <div className="relative min-h-[320px] flex-1 border-slate-300 lg:border-r">
          <div ref={divBloques} className="absolute inset-0" />
          {!listo && <div className="absolute inset-0 grid place-items-center bg-white text-sm text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {/* Programa: solución y borrar */}
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
            {mision.solucion && (
              <button onClick={verSolucion} title="Carga un programa que resuelve esta actividad"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-sm transition ${confirma === 'solucion' ? 'bg-amber-500 text-white' : 'bg-white text-amber-700 ring-1 ring-amber-300 hover:bg-amber-50'}`}>
                <Wand2 className="h-3.5 w-3.5" /> {confirma === 'solucion' ? '¿Reemplazar tu programa? Sí' : 'Ver solución'}
              </button>
            )}
            <button onClick={borrar} title="Borra todos los bloques"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-sm transition ${confirma === 'borrar' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'}`}>
              <Eraser className="h-3.5 w-3.5" /> {confirma === 'borrar' ? '¿Borrar todo? Sí' : 'Borrar'}
            </button>
            {confirma && <button onClick={() => setConfirma('')} className="rounded-lg bg-white px-2 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-300">No</button>}
          </div>
        </div>

        {/* Escena + panel */}
        <div className={`flex w-full shrink-0 flex-col gap-2 overflow-y-auto bg-slate-100 p-2 ${expanded ? 'lg:w-[520px]' : 'lg:w-[420px]'}`}>
          {/* Controles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={ejecutar} disabled={!listo || corriendo} title="Ejecutar" className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white transition ${corriendo ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}><Play className="h-4 w-4" /> Ejecutar</button>
            <button onClick={parar} title="Detener" className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white transition ${corriendo ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300'}`}><Square className="h-4 w-4" /> Parar</button>
            <div className="flex overflow-hidden rounded-lg ring-1 ring-slate-300" title="Velocidad de la simulación">
              {VELOCIDADES.map(v => (
                <button key={v} onClick={() => setVelocidad(v)} className={`px-2 py-1.5 text-xs font-bold ${velocidad === v ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>×{v}</button>
              ))}
            </div>
            <button onClick={reiniciar} title="Devuelve el robot al inicio" className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"><RotateCcw className="h-3.5 w-3.5" /> Reiniciar</button>
          </div>

          {/* Escena 3D */}
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm" style={{ aspectRatio: '1 / 1' }}>
            <Escena3D motor={motor} tapete={mision.tapete} version={version} robot={robot} velocidad={velocidad} />
            {/* HUD sensores */}
            <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col items-start gap-1 text-[11px] font-bold">
              {hud.lineas.length > 1 ? (
                <span className="flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">〰️
                  {hud.lineas.map((c, i) => <span key={i} title={`Sensor ${i + 1}: ${c}`} className={`grid h-4 w-4 place-items-center rounded-full border border-slate-400 text-[9px] ${c === 'negro' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{i + 1}</span>)}
                </span>
              ) : hud.lineas.length === 1 ? <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">🎨 {hud.color}</span> : null}
              <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">📏 {hud.distancia} cm</span>
              <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">🧭 {hud.angulo}°</span>
              <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">⏱️ {hud.tiempo.toFixed(1)} s</span>
            </div>
            {hud.mensaje && <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-xl border-2 border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-900 shadow">{hud.mensaje}</div>}
            {logrado && (
              <div className="absolute inset-x-0 top-2 mx-auto flex w-max items-center gap-2 rounded-full bg-green-600 py-1 pl-3 pr-1 text-xs font-bold text-white shadow-lg">
                <Trophy className="h-4 w-4" /> ¡Lograda!
                {haySiguiente && <button onClick={() => elegirMision(misionIdx + 1)} className="flex items-center rounded-full bg-white px-2 py-0.5 text-green-700 hover:bg-green-50">Siguiente <ChevronRight className="h-3.5 w-3.5" /></button>}
              </div>
            )}
          </div>

          {aviso && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">{aviso}</div>}

          {/* Guía de la actividad */}
          <div className="rounded-xl border border-slate-300 bg-white">
            <button onClick={() => setGuiaAbierta(a => !a)} className="flex w-full items-center gap-2 px-3 py-2 text-left">
              <span className="text-lg">{mision.emoji}</span>
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{curso?.nombre}</span>
                <span className="block text-sm font-bold text-slate-900">{mision.titulo}</span>
              </span>
              {guiaAbierta ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>
            {guiaAbierta && (
              <div className="border-t border-slate-200 px-3 py-2">
                <p className="mb-2 text-[13px] text-slate-800"><b className="text-[#b45309]">Objetivo:</b> {mision.objetivo}</p>
                {mision.pista.length > 0 && (
                  <ol className="space-y-1 text-[12px] text-slate-700">
                    {mision.pista.map((p, i) => (
                      <li key={i} className="flex gap-1.5"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /><span>{p}</span></li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* Robot */}
          <div className="rounded-xl border border-slate-300 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Robot</span>
              <select value={robotId} onChange={e => setRobotId(e.target.value)} title="Elige el robot que quieres simular"
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs font-semibold text-slate-700">
                {ROBOTS_SIMULABLES.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.nombre}</option>)}
              </select>
              {onArmar && <button onClick={() => onArmar(robot.id)} title="Ver cómo se arma este robot, pieza por pieza" className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"><Hammer className="h-3.5 w-3.5" /> Armarlo</button>}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{robot.equipo}.</p>
            {recomendado && recomendado.id !== robot.id && (
              <p className="mt-1 text-[11px] font-semibold text-amber-700">Esta actividad está pensada para «{recomendado.nombre}». <button onClick={() => setRobotId(recomendado.id)} className="underline">Usarlo</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
