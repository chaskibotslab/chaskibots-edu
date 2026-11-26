'use client'

/**
 * Simulador LEGO MINDSTORMS EV3: editor de bloques (Blockly) + robot 3D,
 * con misiones guiadas y modo libre. La física corre en la escena 3D.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Play, Square, RotateCcw, Maximize2, Minimize2, Trophy, Loader2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'
import { LegoMotor } from './engine'
import { crearApiEV3 } from './apiEV3'
import { definirBloquesEV3, crearTemaEV3, crearGeneradorEV3, TOOLBOX_EV3 } from './bloquesEV3'
import { MISIONES_EV3 } from './misionesEV3'

import { GUIA_ROBOT, ROBOTS_SIMULABLES } from './guiasEV3'
const Escena3D = dynamic(() => import('./Escena3D'), { ssr: false })

const AsyncFunction = Object.getPrototypeOf(async function () { /* molde */ }).constructor
const PROGRAMA_INICIAL = { blocks: { languageVersion: 0, blocks: [{ type: 'ev3_inicio', x: 40, y: 40 }] } }

export default function EV3Lab() {
  const divBloques = useRef<HTMLDivElement>(null)
  const ws = useRef<any>(null)
  const libs = useRef<any>(null)
  const motorRef = useRef<LegoMotor>()
  if (!motorRef.current) motorRef.current = new LegoMotor()
  const motor = motorRef.current

  const { expanded, toggle } = useExpand()
  const [listo, setListo] = useState(false)
  const [misionIdx, setMisionIdx] = useState(0)
  const [robotId, setRobotId] = useState(GUIA_ROBOT.id)
  const robot = ROBOTS_SIMULABLES.find(r => r.id === robotId) || GUIA_ROBOT
  const [version, setVersion] = useState(0)
  const [corriendo, setCorriendo] = useState(false)
  const [logrado, setLogrado] = useState(false)
  const [guiaAbierta, setGuiaAbierta] = useState(true)
  const [aviso, setAviso] = useState('')
  const [hud, setHud] = useState({ color: 'blanco', distancia: 0, angulo: 0, mensaje: '' })

  const mision = MISIONES_EV3[misionIdx]

  // HUD en vivo (sensores + mensaje del robot)
  useEffect(() => {
    const id = setInterval(() => setHud({ color: motor.color(), distancia: motor.distancia(), angulo: motor.angulo(), mensaje: motor.mensaje }), 150)
    return () => clearInterval(id)
  }, [motor])

  // Iniciar Blockly
  useEffect(() => {
    let vivo = true
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
        trashcan: true, zoom: { controls: true, wheel: true, startScale: 0.85, maxScale: 1.6, minScale: 0.4 },
        grid: { spacing: 26, length: 2, colour: '#e2e8f0', snap: true },
      })
      try { Blockly.serialization.workspaces.load(PROGRAMA_INICIAL, ws.current) } catch { /* vacío */ }
      setListo(true)
    })()
    return () => { vivo = false; motor.detener(); ws.current?.dispose(); ws.current = null }
  }, [motor])

  // Reajustar Blockly al cambiar tamaño (pantalla completa)
  useEffect(() => {
    const el = divBloques.current
    if (!el) return
    const ro = new ResizeObserver(() => { if (ws.current && libs.current) libs.current.Blockly.svgResize(ws.current) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const compilar = (): string => {
    const { gen } = libs.current
    return gen.workspaceToCode(ws.current)
  }

  const ejecutar = useCallback(async () => {
    if (!listo || corriendo) return
    setAviso(''); setLogrado(false)
    motor.reiniciar()
    let codigo = ''
    try { codigo = compilar() } catch (e: any) { setAviso('No pude leer el programa: ' + (e?.message || e)); return }
    if (!codigo.trim()) { setAviso('Arrastra bloques debajo de «▶ al empezar» y pulsa Ejecutar.'); return }
    setCorriendo(true)
    const token = motor.nuevaEjecucion()
    const api = crearApiEV3(motor, token)
    // Vigilar el logro de la misión mientras corre
    const vig = setInterval(() => { if (mision.logro(motor)) { setLogrado(true) } }, 150)
    try {
      const fn = new AsyncFunction('api', codigo)
      await fn(api)
    } catch (e: any) {
      if (e && e.name !== 'Detenido') setAviso('Error al ejecutar: ' + (e?.message || e))
    } finally {
      clearInterval(vig)
      if (mision.logro(motor)) setLogrado(true)
      motor.vL = motor.vR = 0
      setCorriendo(false)
    }
  }, [listo, corriendo, motor, mision])

  const parar = () => { motor.detener(); setCorriendo(false) }
  const reiniciar = () => { motor.detener(); motor.reiniciar(); setCorriendo(false); setLogrado(false); setAviso('') }

  const elegirMision = (i: number) => {
    motor.detener()
    setMisionIdx(i); setVersion(v => v + 1); setCorriendo(false); setLogrado(false); setAviso('')
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-300 bg-slate-100 text-slate-900 ${expanded ? 'fixed inset-0 z-[200] rounded-none' : 'relative h-full min-h-[560px]'}`}>
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-2 bg-[#E8A33D] px-3 py-1.5 text-white">
        <span className="text-sm font-extrabold tracking-tight">🤖 LEGO EV3</span>
        <select value={misionIdx} onChange={e => elegirMision(Number(e.target.value))}
          className="rounded-md border border-white/40 bg-white/15 px-2 py-1 text-xs font-semibold text-white focus:bg-white focus:text-slate-900 focus:outline-none">
          {MISIONES_EV3.map((m, i) => <option key={m.id} value={i} className="text-slate-900">{m.emoji} {m.titulo}</option>)}
        </select>
        <span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold sm:inline">{mision.nivel}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <EnviarTarea
            simulador="LEGO EV3"
            sigla="EV3"
            botonClassName="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white disabled:opacity-80"
            obtenerEntrega={() => {
              let codigo = ''
              try { codigo = compilar() } catch { /* sin bloques */ }
              return {
                output: `LEGO EV3 — misión «${mision.titulo}» (${mision.nivel}). ${logrado ? '✅ Lograda' : '⏳ En progreso'}.`,
                code: codigo || '(sin bloques)',
                files: { ev3: { mision: mision.id, logrado, robot: robot.id } },
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
        </div>

        {/* Escena + panel */}
        <div className={`flex w-full shrink-0 flex-col gap-2 overflow-y-auto bg-slate-100 p-2 ${expanded ? 'lg:w-[520px]' : 'lg:w-[420px]'}`}>
          {/* Controles */}
          <div className="flex items-center gap-1.5">
            <button onClick={ejecutar} disabled={!listo || corriendo} title="Ejecutar" className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white transition ${corriendo ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}><Play className="h-4 w-4" /> Ejecutar</button>
            <button onClick={parar} title="Detener" className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white transition ${corriendo ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300'}`}><Square className="h-4 w-4" /> Parar</button>
            <select value={robotId} onChange={e => setRobotId(e.target.value)} title="Elige el robot que quieres simular"
              className="ml-auto min-w-0 max-w-[150px] rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs font-semibold text-slate-700">
              {ROBOTS_SIMULABLES.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.nombre}</option>)}
            </select>
            <button onClick={reiniciar} title="Reiniciar el robot" className=" flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"><RotateCcw className="h-3.5 w-3.5" /> Reiniciar</button>
          </div>

          {/* Escena 3D */}
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm" style={{ aspectRatio: '1 / 1' }}>
            <Escena3D motor={motor} tapete={mision.tapete} version={version} robot={robot} />
            {/* HUD sensores */}
            <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col gap-1 text-[11px] font-bold">
              <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">🎨 {hud.color}</span>
              <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">📏 {hud.distancia} cm</span>
              <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-slate-700 shadow-sm">🧭 {hud.angulo}°</span>
            </div>
            {hud.mensaje && <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-xl border-2 border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-900 shadow">{hud.mensaje}</div>}
            {logrado && (
              <div className="absolute inset-x-0 top-2 mx-auto w-max rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1 animate-bounce"><Trophy className="h-4 w-4" /> ¡Misión lograda!</div>
            )}
          </div>

          {aviso && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">{aviso}</div>}

          {/* Guía de la misión */}
          <div className="rounded-xl border border-slate-300 bg-white">
            <button onClick={() => setGuiaAbierta(o => !o)} className="flex w-full items-center gap-2 px-3 py-2 text-left">
              <span className="text-lg">{mision.emoji}</span>
              <span className="flex-1 text-sm font-bold text-slate-900">{mision.titulo}</span>
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
        </div>
      </div>
    </div>
  )
}
