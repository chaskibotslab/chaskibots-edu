'use client'

// Pestañas «Programar» y «Probar»: editor de código + simulación del robot
// armado en la arena elegida. En pantallas grandes se ven lado a lado; en
// celular, una a la vez (la simulación sigue viva al cambiar de pestaña).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Play, Square, Pause, RotateCcw, Upload, Gauge, Camera, Navigation, Map as MapIcon,
  CheckCircle2, Power, Terminal, CircuitBoard, AlertTriangle, Loader2, Send, Trash2, RotateCw, FileCode2, Download, Puzzle, Gamepad2,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Eye, EyeOff,
} from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import { Simulacion, type Telemetria } from '../../engine/simulation'
import { GRAVEDADES, type Gravedad } from '../../engine/fisica/mundo'
import { arenaDePista, listaArenas } from '../../arenas'
import type { ArenaDef } from '../../arenas/tipos'
import type { Pista } from '../../engine/tracks'
import type { RobotDoc } from '../../robots/doc'
import type { PlantillaCodigo } from '../../robots/prearmados'
import EditorCodigo, { type ErrorCompilacion } from '../EditorCodigo'
import type { ModoCamara, PedidoZoom } from '../Escena3D'
import type { NivelCalidad } from '../calidad'
import { explicarError } from '../erroresCompilador'
import { partesDe } from '../../bloques/generador'
import { PROGRAMA_VACIO, SEGUIDOR_EN_BLOQUES } from '../../bloques/definiciones'

const EditorBloques = dynamic(() => import('../../bloques/EditorBloques'), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-lab-fondo2" /> })
import { verificar } from '../../engine/verificacion'
import { infoPlaca, mcuDe } from '../../engine/placa'
import ControlRemoto from './ControlRemoto'
import { NIVELES_RIVAL, revisarReglamento, type NivelRival } from '../../engine/competencia'
import { esBanco, resumen } from '../../engine/ensamblaje'
import PanelCircuito from './PanelCircuito'
import { SonidoBuzzers } from '../sonido'
import type { ReglamentoSumo } from '../../arenas/tipos'

const EscenaArena = dynamic(() => import('../Escena3D').then(m => m.EscenaArena), { ssr: false })

const MAX_SERIAL = 20000
type Pestana = 'serial' | 'pines' | 'problemas'

interface Props {
  doc: RobotDoc
  vista: 'programar' | 'probar'
  arenaInicial: string
  plantillas: PlantillaCodigo[]
  onPrograma: (p: RobotDoc['programa']) => void
  nivel: NivelCalidad
  onNivel: (n: NivelCalidad) => void
}

/** Clave de la estructura del robot (sin el programa): si cambia, hay que rearmar la simulación. */
const estructura = (d: RobotDoc) => JSON.stringify([d.piezas, d.cables])

export default function ProgramarProbar({ doc, vista, arenaInicial, plantillas, onPrograma, nivel, onNivel }: Props) {
  const codigo = doc.programa.cpp
  const partes = useMemo(() => partesDe(doc), [doc])
  const [versionBloques, setVersionBloques] = useState(0)
  // Plantillas en bloques (🧩) solo en modo bloques, y las de código en modo código.
  const plantillasVisibles = useMemo(() => {
    const deBloques = [
      { id: 'bloques-vacio', nombre: 'Empezar en blanco', descripcion: '', codigo: '', bloques: PROGRAMA_VACIO },
      ...(partes.motores && partes.lineaIzq && partes.lineaDer ? [{ id: 'bloques-seguidor', nombre: 'Seguidor de línea', descripcion: '', codigo: '', bloques: SEGUIDOR_EN_BLOQUES }] : []),
    ]
    return doc.programa.modo === 'bloques' ? deBloques : plantillas
  }, [doc.programa.modo, partes, plantillas])

  const cambiarModo = (modo: 'bloques' | 'codigo') => {
    if (modo === doc.programa.modo) return
    if (modo === 'codigo') {
      if (window.confirm('Vas a seguir en código C++. Los bloques no se pueden recuperar desde el código. ¿Seguir?')) onPrograma({ modo: 'codigo', cpp: codigo })
      return
    }
    if (codigo.trim() && !window.confirm('Vas a empezar un programa nuevo con bloques (tu código actual se reemplaza). ¿Seguir?')) return
    onPrograma({ modo: 'bloques', bloques: PROGRAMA_VACIO, cpp: '' })
    setVersionBloques(v => v + 1)
  }
  const [sim, setSim] = useState<Simulacion | null>(null)
  const [errores, setErrores] = useState<ErrorCompilacion[]>([])
  const [compilando, setCompilando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(null)
  const [tele, setTele] = useState<Telemetria | null>(null)
  const [serial, setSerial] = useState('')
  const [entrada, setEntrada] = useState('')
  // Mesa de electrónica: solo su escritorio; robots: las pistas y arenas.
  const banco = esBanco(doc)
  // Circuito sin placa (pila o fuente + componentes): no hay nada que programar, ya funciona.
  const sinPlaca = banco && !mcuDe(doc)
  const [encendido, setEncendido] = useState(false)
  useEffect(() => { setEncendido(false) }, [sim])
  const conPulsador = doc.piezas.some(p => ['pulsador', 'joystick'].includes(pieza(p.pieza).comportamiento.tipo))
  const arenas = useMemo(() => listaArenas().filter(a => !!a.banco === banco), [banco])
  const [arena, setArena] = useState<ArenaDef>(() => arenas.find(a => a.id === arenaInicial) ?? arenas[0])
  const sonido = useRef<SonidoBuzzers | null>(null)
  const [silencio, setSilencio] = useState(false)
  const activarSonido = useCallback(() => { (sonido.current ??= new SonidoBuzzers()).activar() }, [])
  useEffect(() => () => { sonido.current?.cerrar(); sonido.current = null }, [])
  useEffect(() => { if (sonido.current) sonido.current.silencio = silencio }, [silencio])
  const [imagenPropia, setImagenPropia] = useState<{ nombre: string; img: HTMLImageElement } | null>(null)
  const [gravedad, setGravedad] = useState<Gravedad>('tierra')
  const [camara, setCamara] = useState<ModoCamara>('libre')
  const [zoom, setZoom] = useState<PedidoZoom>({ n: 0, factor: 1 })
  // Vista ampliada: la escena ocupa todo (sin editor ni monitor). Datos: recuadros sobre la escena;
  // en pantallas chicas empiezan ocultos para que se vea la arena.
  const [ampliada, setAmpliada] = useState(false)
  const [datos, setDatos] = useState(() => typeof window === 'undefined' || window.innerWidth >= 1500)
  const [versionArena, setVersionArena] = useState(0)
  const [pestana, setPestana] = useState<Pestana>('serial')
  // El control remoto se abre solo si el programa obedece letras (Bluetooth o la plantilla RC).
  const leeLetras = /SerialBT|Serial\.read\(\)|handleClient\(\)/.test(codigo)
  const [control, setControl] = useState(leeLetras)
  useEffect(() => { if (leeLetras) setControl(true) }, [leeLetras])
  const serialRef = useRef<HTMLPreElement>(null)
  const archivoPista = useRef<HTMLInputElement>(null)
  const clave = estructura(doc)

  // Rearmar la simulación cuando cambia la estructura del robot.
  useEffect(() => {
    const s = new Simulacion(doc)
    s.onTelemetria = setTele
    s.onSerial = t => setSerial(prev => (prev + t).slice(-MAX_SERIAL))
    s.onArenaCambiada = () => setVersionArena(v => v + 1)
    s.onSonidos = l => sonido.current?.actualizar(l)
    let vivo = true
    s.iniciar(arena, gravedad, imagenPropia?.img).then(() => { if (vivo) { setSim(s); setVersionArena(v => v + 1) } })
    return () => { vivo = false; s.liberar(); setSim(null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  useEffect(() => { serialRef.current?.scrollTo({ top: serialRef.current.scrollHeight }) }, [serial])

  const compilarYEjecutar = useCallback(async () => {
    if (!sim || compilando) return
    const errorElectrico = verificar(doc).find(p => p.nivel === 'error')
    if (errorElectrico) {
      setAviso({ tipo: 'error', texto: `No se puede encender el robot: ${errorElectrico.texto} Corrígelo en la pestaña «Cablear».` })
      return
    }
    setCompilando(true)
    activarSonido()
    setAviso({ tipo: 'info', texto: 'Compilando con avr-gcc… (la primera vez puede tardar unos segundos)' })
    try {
      const res = await fetch('/api/lab/compile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ board: infoPlaca(doc).compilador, code: codigo }),
      })
      const data = await res.json()
      if (!res.ok && !data.errors) throw new Error(data.error || `Error ${res.status}`)
      const errs: ErrorCompilacion[] = (data.errors ?? []).map((e: ErrorCompilacion) => ({ ...e, message: explicarError(e.message) }))
      setErrores(errs)
      if (!data.ok) {
        setPestana('problemas')
        const reales = errs.filter(e => e.severity === 'error')
        const primero = reales[0]
        setAviso({
          tipo: 'error',
          texto: primero
            ? `Tu código tiene ${reales.length} error${reales.length > 1 ? 'es' : ''}. Línea ${primero.line}: ${primero.message}${reales.length > 1 ? ' (mira la pestaña «Problemas»)' : ''}`
            : data.error || 'No se pudo compilar',
        })
        return
      }
      setSerial('')
      await sim.cargarPrograma(data.hex)
      setPestana('serial')
      // Si se ejecutó con Ctrl+Enter, el foco sigue en el editor y las teclas de manejo se escribirían en el código.
      if (leeLetras && document.activeElement instanceof HTMLElement) document.activeElement.blur()
      const capacidad = infoPlaca(doc).chip === 'atmega328p' ? ' de 32 256' : ''
      setAviso({ tipo: 'ok', texto: `Programa cargado · ${data.size ?? '?'} bytes${capacidad}${data.cached ? ' · (caché)' : ''}` })
    } catch (err) {
      setAviso({ tipo: 'error', texto: err instanceof Error ? err.message : 'Error al compilar' })
    } finally {
      setCompilando(false)
    }
  }, [sim, codigo, compilando, doc, activarSonido, leeLetras])

  const cambiarArena = (id: string) => {
    if (id === 'propia' && imagenPropia) return
    const a = arenas.find(x => x.id === id)
    if (!a || !sim) return
    setArena(a)
    setImagenPropia(null)
    sim.cambiarArena(a)
  }

  const subirPista = (file: File) => {
    if (!sim) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // La imagen se estira a 3 × 2 m; el robot arranca en el centro.
      const propia: Pista = { id: 'propia', nombre: file.name, anchoM: 3, altoM: 2, inicio: { x: 0, z: 0, yaw: 0 } }
      const a = arenaDePista(propia)
      sim.cambiarArena(a, img)
      setArena(a)
      setImagenPropia({ nombre: file.name, img })
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

  const descargarIno = () => {
    const blob = new Blob([codigo], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${doc.nombre.normalize('NFD').replace(/[^\w]+/g, '_') || 'robot'}.ino`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const enviarSerial = () => {
    if (!sim || !entrada) return
    sim.enviarSerial(entrada + '\n')
    setEntrada('')
  }

  const corriendo = tele?.estado === 'corriendo' || tele?.estado === 'pausado'
  const boton = 'lab-secundario flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ---------- Barra ---------- */}
      <div className="lab-panel flex flex-wrap items-center gap-2 border-b border-lab-borde/20 px-3 py-2">
        {sinPlaca ? (<>
          <button
            onClick={() => { if (!sim) return; activarSonido(); sim.conectarPila(!!sim.controles.pilaApagada); setEncendido(!sim.controles.pilaApagada) }}
            disabled={!sim}
            className={`flex h-8 items-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50 ${encendido ? 'border border-red-500/40 bg-red-500/15 text-red-700 hover:bg-red-500/25' : 'lab-primario'}`}
            title={encendido ? 'Desconectar la pila' : 'Conectar la pila y encender el circuito'}
          >
            <Power className="h-4 w-4" /> {encendido ? 'Apagar' : 'Encender'}
          </button>
          <span className="text-xs text-lab-suave">Circuito sin placa: no lleva programa. {encendido ? 'La pila está conectada.' : 'Presiona «Encender» para conectar la pila.'}</span>
        </>) : (<>
        <select
          className="h-8 max-w-[11rem] rounded-md border border-lab-borde/30 bg-lab-superficie px-2 text-sm text-lab-tinta [&_option]:bg-lab-superficie"
          value=""
          onChange={e => {
            const p = plantillas.find(x => x.id === e.target.value)
            if (p && (codigo.trim() === '' || window.confirm(`¿Reemplazar tu programa por la plantilla «${p.nombre}»?`))) {
              if (p.bloques) { onPrograma({ modo: 'bloques', bloques: p.bloques, cpp: '' }); setVersionBloques(v => v + 1) }
              else onPrograma({ modo: 'codigo', cpp: p.codigo })
              setErrores([])
            }
          }}
          title="Cargar una plantilla (usa los pines de tu robot)"
        >
          <option value="" disabled>Plantillas…</option>
          {plantillasVisibles.map(p => <option key={p.id} value={p.id}>{p.bloques ? '🧩 ' : ''}{p.nombre}</option>)}
        </select>

        <button
          onClick={compilarYEjecutar}
          disabled={!sim || compilando}
          className="lab-primario flex h-8 items-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50"
          title="Compilar y ejecutar (Ctrl+Enter)"
        >
          {compilando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          <span className="hidden sm:inline">Compilar y ejecutar</span><span className="sm:hidden">Ejecutar</span>
        </button>
        {corriendo && (
          <>
            <button onClick={() => { if (!sim) return; if (sim.pausado) sim.continuar(); else sim.pausar() }} className={boton}>
              {tele?.estado === 'pausado' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              <span className="hidden sm:inline">{tele?.estado === 'pausado' ? 'Seguir' : 'Pausa'}</span>
            </button>
            <button onClick={() => { sim?.detenerPrograma(); setAviso(null) }} className={boton}>
              <Square className="h-4 w-4" /> <span className="hidden sm:inline">Detener</span>
            </button>
          </>
        )}
        {!banco && (
          <button onClick={() => setControl(c => !c)} className={`${boton} ${control ? '!bg-lab-acento/10 text-lab-acento' : ''}`} title="Control remoto: manejar el robot con teclado, botones o un control">
            <Gamepad2 className="h-4 w-4" /> <span className="hidden md:inline">Control</span>
          </button>
        )}
        <button onClick={descargarIno} className={boton} title="Descargar el programa (.ino) para abrirlo en el Arduino IDE">
          <Download className="h-4 w-4" /> <span className="hidden md:inline">.ino</span>
        </button>
        </>)}

      </div>

      {aviso && (
        <div className={`flex items-center gap-2 border-b px-4 py-1.5 text-xs ${aviso.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-800' : aviso.tipo === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-lab-borde/20 bg-lab-superficie text-lab-tinta2'}`}>
          <span className={`h-2 w-2 shrink-0 rounded-full ${aviso.tipo === 'error' ? 'bg-red-500' : aviso.tipo === 'ok' ? 'bg-emerald-500' : 'bg-lab-acento'}`} />
          {aviso.texto}
        </div>
      )}

      {/* ---------- Cuerpo ---------- */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {sinPlaca ? (
          <div className={`min-h-0 flex-col gap-3 overflow-y-auto border-lab-borde/20 p-4 text-sm text-lab-tinta2 lg:w-[32%] lg:border-r ${ampliada ? 'hidden' : `lg:flex ${vista === 'programar' ? 'flex flex-1 lg:flex-none' : 'hidden'}`}`}>
            <h3 className="text-base font-semibold text-lab-tinta">Este circuito no tiene placa</h3>
            <p>La pila (o la fuente) le da la corriente directo: no hay Arduino que programar. Presiona <b className="text-lab-tinta">Encender</b>: es como conectar el clip de la pila (o el interruptor de la fuente).</p>
            <div className="rounded-md bg-lab-fondo2 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-lab-tenue">Cómo va la corriente</div>
              <ol className="list-decimal space-y-1 pl-4 text-[13px]">
                <li>Sale del <b className="text-red-700">+</b> de la pila al <b className="text-red-700">riel + (línea roja)</b> de la protoboard.</li>
                <li>Del riel pasa por los componentes: resistencia, LED{conPulsador ? ', pulsador' : ''}…</li>
                <li>Vuelve por el <b className="text-sky-700">riel − (línea azul)</b> al <b className="text-sky-700">−</b> de la pila.</li>
              </ol>
            </div>
            <div className="rounded-md bg-lab-fondo2 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-lab-tenue">Prueba</div>
              <ul className="list-disc space-y-1 pl-4 text-[13px]">
                {conPulsador && <li>Presiona el pulsador (en la escena o en el panel).</li>}
                <li>En «Armar», cambia la resistencia por otra: con menos ohmios el LED brilla más; sin resistencia se quema.</li>
                <li>En «Cablear», quita el cable del riel −: el circuito se abre y el LED se apaga.</li>
                <li>Si quieres programarlo, agrega una placa (Arduino, ESP32, Pico…) desde «Armar».</li>
              </ul>
            </div>
          </div>
        ) : (
        <div className={`min-h-0 flex-col border-lab-borde/20 lg:w-[40%] lg:border-r ${ampliada ? 'hidden' : `lg:flex ${vista === 'programar' ? 'flex flex-1 lg:flex-none' : 'hidden'}`}`}>
          <div className="flex items-center justify-between gap-2 border-b border-lab-borde/20 bg-lab-fondo2 px-3 py-1.5 text-xs text-lab-suave">
            <div className="flex rounded-md bg-lab-superficie/0 p-0.5 ring-1 ring-lab-borde/20">
              {([['bloques', 'Bloques', Puzzle], ['codigo', 'Código', FileCode2]] as const).map(([modo, txt, Icon]) => (
                <button key={modo} onClick={() => cambiarModo(modo)} className={`flex items-center gap-1 rounded px-2.5 py-0.5 ${doc.programa.modo === modo ? 'bg-lab-superficie font-medium text-lab-tinta shadow-sm' : 'hover:text-lab-tinta'}`}>
                  <Icon className="h-3.5 w-3.5" /> {txt}
                </button>
              ))}
            </div>
            <span className="truncate font-mono">{doc.nombre}.ino</span>
            <span className="hidden xl:inline">Ctrl+Enter para ejecutar</span>
          </div>
          {doc.programa.modo === 'bloques' ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-[260px] flex-[3]">
                <EditorBloques
                  key={versionBloques}
                  programa={doc.programa.bloques}
                  partes={partes}
                  onCambio={bloques => onPrograma({ modo: 'bloques', bloques, cpp: codigo })}
                />
              </div>
              <div className="flex min-h-[120px] flex-[2] flex-col border-t border-lab-borde/20 bg-lab-fondo">
                <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-lab-suave">
                  <span>Código Arduino que generan tus bloques</span>
                  <button
                    onClick={() => { if (window.confirm('Vas a seguir en código C++. Los bloques no se pueden recuperar desde el código. ¿Seguir?')) onPrograma({ modo: 'codigo', cpp: codigo }) }}
                    className="rounded-md border border-lab-borde/20 px-2 py-0.5 text-lab-tinta hover:bg-lab-tinta/[0.04]"
                  >Pasar a código →</button>
                </div>
                <pre className="min-h-0 flex-1 overflow-auto px-3 pb-2 font-mono text-[11px] leading-relaxed text-emerald-700/90">{codigo}</pre>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <EditorCodigo codigo={codigo} onChange={cpp => onPrograma({ modo: 'codigo', cpp })} errores={errores} onEjecutar={compilarYEjecutar} />
            </div>
          )}
        </div>
        )}

        <div className={`min-h-0 flex-1 flex-col ${vista === 'probar' || ampliada ? 'flex' : 'hidden lg:flex'}`}>
          {/* Barra de la escena: salida, pista, gravedad y cámara. */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-lab-borde/20 bg-lab-superficie px-2 py-1.5">
          {!banco && <>
            <button onClick={() => sim?.colocarRobot()} className={boton} title="Volver a la salida">
              <RotateCcw className="h-4 w-4" /> <span className="hidden md:inline">Salida</span>
            </button>
            <button onClick={() => girarRobot(Math.PI / 12)} className="lab-secundario flex h-8 w-8 items-center justify-center rounded-md" title="Girar el robot 15° a la izquierda">
              <RotateCcw className="h-4 w-4 -scale-x-100 rotate-180" />
            </button>
            <button onClick={() => girarRobot(-Math.PI / 12)} className="lab-secundario flex h-8 w-8 items-center justify-center rounded-md" title="Girar el robot 15° a la derecha">
              <RotateCw className="h-4 w-4" />
            </button>
            <label className="lab-secundario flex h-8 items-center gap-1.5 rounded-md pl-2 text-sm">
              <MapIcon className="h-4 w-4 text-lab-suave" />
              <select className="h-full max-w-[10rem] bg-transparent pr-2 text-lab-tinta outline-none [&_option]:bg-lab-superficie" value={imagenPropia ? 'propia' : arena.id} onChange={e => cambiarArena(e.target.value)}>
                {arenas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                {imagenPropia && <option value="propia">{imagenPropia.nombre}</option>}
              </select>
            </label>
            <button onClick={() => archivoPista.current?.click()} className={boton} title="Usar tu propia pista (imagen PNG/JPG, se estira a 3 × 2 m)">
              <Upload className="h-4 w-4" /> <span className="hidden md:inline">Pista</span>
            </button>
            <input ref={archivoPista} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) subirPista(f); e.target.value = '' }} />
            <label className="lab-secundario flex h-8 items-center gap-1.5 rounded-md pl-2 text-sm" title="Gravedad">
              <Gauge className="h-4 w-4 text-lab-suave" />
              <select className="h-full bg-transparent pr-2 text-lab-tinta outline-none [&_option]:bg-lab-superficie" value={gravedad} onChange={e => { const g = e.target.value as Gravedad; setGravedad(g); sim?.cambiarGravedad(g) }}>
                {Object.entries(GRAVEDADES).map(([k, v]) => <option key={k} value={k}>{v.nombre}</option>)}
              </select>
            </label>
            </>}
            <div className="ml-auto flex h-8 rounded-md bg-lab-fondo2 p-0.5 text-sm">
              {([['libre', 'Libre', Camera], ['seguir', 'Seguir', Navigation], ['arriba', 'Arriba', MapIcon]] as const).filter(([id]) => !banco || id !== 'seguir').map(([id, txt, Icon]) => (
                <button key={id} onClick={() => setCamara(id)} title={`Cámara: ${txt}`} className={`flex items-center gap-1 rounded px-2.5 ${camara === id ? 'bg-lab-superficie font-medium text-lab-tinta shadow-sm' : 'text-lab-suave hover:text-lab-tinta'}`}>
                  <Icon className="h-3.5 w-3.5" /> <span className="hidden xl:inline">{txt}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="relative min-h-[300px] flex-[3]">
            {sim ? (
              <EscenaArena sim={sim} modoCamara={camara} versionArena={versionArena} nivel={nivel} onNivel={onNivel} zoom={zoom} />
            ) : (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-lab-suave">
                <Loader2 className="h-5 w-5 animate-spin" /> Preparando física…
              </div>
            )}
            {sim && <HUD tele={tele} robot={!banco && datos} sinPlaca={sinPlaca} encendido={encendido} />}
            {sim && banco && <PanelCircuito sim={sim} tele={tele} silencio={silencio} onSilencio={setSilencio} onGesto={activarSonido} />}
            {sim && arena.competencia && <Combate sim={sim} tele={tele} reglamento={arena.competencia} doc={doc} compacto={!datos} />}
            {sim && (
              <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5">
                {([
                  ['Acercar', ZoomIn, () => setZoom(z => ({ n: z.n + 1, factor: 0.75 }))],
                  ['Alejar', ZoomOut, () => setZoom(z => ({ n: z.n + 1, factor: 1 / 0.75 }))],
                  ...(!banco ? [[datos ? 'Ocultar datos' : 'Mostrar datos', datos ? EyeOff : Eye, () => setDatos(x => !x)] as const] : []),
                  [ampliada ? 'Achicar la vista' : 'Ampliar la vista', ampliada ? Minimize2 : Maximize2, () => setAmpliada(x => !x)],
                ] as const).map(([txt, Icon, accion]) => (
                  <button key={txt} onClick={accion} title={txt} aria-label={txt} className="flex h-8 w-8 items-center justify-center rounded-md lab-vidrio text-lab-tinta hover:text-lab-tinta">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            )}
            {sim && control && <ControlRemoto sim={sim} conPrograma={tele?.estado === 'corriendo' || tele?.estado === 'pausado'} leeLetras={leeLetras} fase={tele?.combate?.fase} onCerrar={() => setControl(false)} />}
            <div className={`pointer-events-none absolute bottom-2 left-3 hidden rounded-md bg-lab-superficie/85 px-2 py-0.5 text-[11px] text-lab-suave ${control ? '' : 'sm:block'}`}>
              {banco ? `${conPulsador ? 'Haz clic en el pulsador para presionarlo · ' : ''}arrastra para girar la cámara` : 'Doble clic en el piso para mover el robot · arrastra para girar la cámara'}
            </div>
          </div>

          <div className={`min-h-[180px] flex-[2] flex-col border-t border-lab-borde/20 bg-lab-fondo ${ampliada || sinPlaca ? 'hidden' : 'flex'}`}>
            <div className="flex border-b border-lab-borde/20 text-xs">
              {([
                ['serial', 'Monitor serie', Terminal],
                ['pines', 'Pines y sensores', CircuitBoard],
                ['problemas', `Problemas${errores.length || tele?.avisos.length ? ` (${errores.length + (tele?.avisos.length ?? 0)})` : ''}`, AlertTriangle],
              ] as const).map(([id, txt, Icon]) => (
                <button key={id} onClick={() => setPestana(id)} className={`flex items-center gap-1.5 border-b-2 px-3 py-2 ${pestana === id ? 'border-lab-acento text-lab-tinta' : 'border-transparent text-lab-suave hover:text-lab-tinta'}`}>
                  <Icon className="h-3.5 w-3.5" /> {txt}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {pestana === 'serial' && (
                <div className="flex h-full flex-col">
                  <pre ref={serialRef} className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-xs text-emerald-700">
                    {serial || <span className="text-lab-tenue">Lo que tu programa envíe con Serial.print aparece aquí.</span>}
                  </pre>
                  <div className="flex gap-2 border-t border-lab-borde/20 p-2">
                    <input
                      value={entrada}
                      onChange={e => setEntrada(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') enviarSerial() }}
                      placeholder="Enviar texto a la placa…"
                      className="h-8 min-w-0 flex-1 rounded-md border border-lab-borde/20 bg-lab-vacio px-2 font-mono text-xs outline-none focus:border-lab-acento/50"
                    />
                    <button onClick={enviarSerial} className="flex h-8 items-center gap-1 rounded-md bg-lab-tinta/[0.07] px-3 text-xs hover:bg-lab-tinta/10"><Send className="h-3.5 w-3.5" /> Enviar</button>
                    <button onClick={() => setSerial('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-lab-tinta/[0.04] hover:bg-lab-tinta/[0.07]" title="Limpiar"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}
              {pestana === 'pines' && <PanelPines tele={tele} />}
              {pestana === 'problemas' && (
                <div className="p-3 text-xs">
                  {(tele?.avisos ?? []).map((a, i) => (
                    <div key={i} className="mb-1.5 flex items-center gap-2 rounded-md bg-amber-500/10 px-2 py-1.5 text-amber-700"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {a}</div>
                  ))}
                  {errores.length === 0 && !tele?.avisos.length ? (
                    <p className="text-lab-tenue">Sin problemas. Los errores del compilador aparecen aquí y subrayados en el editor.</p>
                  ) : errores.map((e, i) => (
                    <div key={i} className="flex gap-2 border-b border-lab-borde/10 py-1.5">
                      <span className={e.severity === 'error' ? 'text-red-600' : 'text-amber-600'}>{e.severity === 'error' ? 'Error' : 'Aviso'}</span>
                      <span className="font-mono text-lab-suave">línea {e.line}</span>
                      <span className="text-lab-tinta">{e.message}</span>
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

function HUD({ tele, robot = true, sinPlaca = false, encendido = false }: { tele: Telemetria | null; robot?: boolean; sinPlaca?: boolean; encendido?: boolean }) {
  if (!tele) return null
  const sinProgramaTxt = !sinPlaca ? { txt: 'Sin programa', cls: 'bg-slate-500' } : encendido ? { txt: 'Encendido (pila conectada)', cls: 'bg-emerald-500' } : { txt: 'Apagado: presiona «Encender»', cls: 'bg-slate-500' }
  const estado = {
    'sin-programa': sinProgramaTxt,
    cargando: { txt: 'Cargando…', cls: 'bg-sky-400' },
    corriendo: { txt: 'Ejecutando', cls: 'bg-emerald-500 animate-pulse' },
    pausado: { txt: 'En pausa', cls: 'bg-amber-400' },
    error: { txt: 'Error', cls: 'bg-red-500' },
  }[tele.estado]
  const lento = tele.estado === 'corriendo' && tele.velocidadPct > 0 && tele.velocidadPct < 90
  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 space-y-1.5">
        <div className="flex items-center gap-2 rounded-md lab-vidrio px-2.5 py-1.5 text-xs">
          <span className={`h-2 w-2 rounded-full ${estado.cls}`} />
          <span className="font-medium text-lab-tinta">{estado.txt}</span>
          {tele.estado !== 'sin-programa' && <span className="font-mono text-lab-suave">t = {tele.tiempoSim.toFixed(1)} s</span>}
        </div>
        {tele.estado === 'corriendo' && (
          <div className={`rounded-md lab-vidrio px-2.5 py-1.5 font-mono text-[11px] ${lento ? 'text-amber-700' : 'text-lab-tinta2'}`}>
            {tele.mhz.toFixed(1)} MHz · velocidad {tele.velocidadPct.toFixed(0)}%
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
        {tele.error && <div className="rounded-md bg-red-500/20 px-2.5 py-1.5 text-xs text-red-700">{tele.error}</div>}
      </div>

      {robot && <div className="pointer-events-none absolute right-3 top-3 hidden w-56 space-y-2 rounded-md lab-vidrio p-3 text-xs sm:block">
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

function PanelPines({ tele }: { tele: Telemetria | null }) {
  const pines = tele?.pines ?? {}
  const nombres = useMemo(() => [...Array.from({ length: 14 }, (_, i) => `D${i}`), ...Array.from({ length: 6 }, (_, i) => `A${i}`)], [])
  const pwm = new Set(['D3', 'D5', 'D6', 'D9', 'D10', 'D11'])
  if (!tele || tele.estado === 'sin-programa') {
    return <p className="p-3 text-xs text-lab-tenue">Ejecuta un programa para ver el estado de cada pin en vivo.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-4 xl:grid-cols-5">
      {nombres.map(n => {
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

// ---------------------------------------------------------------------------
// Combate (sumo / minisumo): marcador, cuenta regresiva, rival y reglamento
// ---------------------------------------------------------------------------

/** Marcador del combate. `compacto`: solo una línea arriba, para que se vea el dohyo. */
function Combate({ sim, tele, reglamento, doc, compacto = false }: { sim: Simulacion; tele: Telemetria | null; reglamento: ReglamentoSumo; doc: RobotDoc; compacto?: boolean }) {
  const [rival, setRival] = useState<NivelRival>(sim.rival)
  const reglas = useMemo(() => {
    const r = resumen(doc)
    return revisarReglamento(reglamento, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
  }, [doc, reglamento])
  const c = tele?.combate
  if (!c) return null
  const valido = reglas.every(x => x.ok)
  const fase =
    c.fase === 'espera' ? 'Compila y ejecuta tu programa para empezar el combate'
      : c.fase === 'cuenta' ? `Esperando… el robot no debe moverse (${Math.ceil(c.restante)} s)`
        : c.fase === 'combate' ? `¡En juego! Quedan ${Math.ceil(c.restante)} s`
          : c.fase === 'pausa' ? c.ultima?.motivo ?? ''
            : c.ganador === 'alumno' ? '¡Ganaste el combate! 🏆' : c.ganador === 'rival' ? 'Ganó el rival. Mejora tu programa y prueba otra vez.' : 'Empate'
  const cuenta = c.fase === 'cuenta' && c.restante > 0 && (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div key={Math.ceil(c.restante)} className="lab-dato animate-ping-once font-mono text-8xl font-black drop-shadow-[0_0_24px_rgba(94,234,212,0.6)]">{Math.ceil(c.restante)}</div>
    </div>
  )
  if (compacto) return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2.5 rounded-full lab-vidrio px-3 py-1 text-xs">
        <span className="lab-dato font-mono text-base font-bold">{c.marcador.alumno}</span>
        <span className="truncate text-lab-tinta">{c.fase === 'final' ? (c.ganador === 'alumno' ? '¡Ganaste! 🏆' : c.ganador === 'rival' ? 'Ganó el rival' : 'Empate') : `Ronda ${c.ronda}/${reglamento.salidas.length}`}</span>
        <span className="font-mono text-base font-bold text-red-700">{c.marcador.rival}</span>
      </div>
      {cuenta}
    </>
  )
  return (
    <>
      <div className="absolute left-1/2 top-3 z-10 w-[min(22rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-md lab-vidrio p-2.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wide text-lab-suave">Tú</div>
            <div className="lab-dato font-mono text-2xl font-bold leading-none">{c.marcador.alumno}</div>
          </div>
          <div className="min-w-0 flex-1 text-center">
            <div className="font-semibold text-lab-tinta">{c.fase === 'final' ? 'Fin del combate' : `Ronda ${c.ronda} de ${reglamento.salidas.length}`}</div>
            <div className="truncate text-[11px] text-lab-suave">{c.fase === 'final' ? `Gana quien llega a ${reglamento.puntosParaGanar}` : c.salida}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wide text-red-700/80">Rival</div>
            <div className="font-mono text-2xl font-bold leading-none text-red-700">{c.marcador.rival}</div>
          </div>
        </div>
        <div className={`mt-2 rounded-md px-2 py-1.5 text-center ${c.fase === 'final' ? (c.ganador === 'alumno' ? 'bg-emerald-500/20 font-semibold text-emerald-700' : 'bg-red-500/15 text-red-700') : 'bg-lab-tinta/[0.04] text-lab-tinta'}`}>{fase}</div>
        <div className="mt-2 flex items-center gap-2">
          <label className="flex flex-1 items-center gap-1.5 text-[11px] text-lab-suave">
            Rival
            <select
              value={rival}
              onChange={e => { const n = e.target.value as NivelRival; setRival(n); sim.elegirRival(n) }}
              className="h-7 flex-1 rounded-md border border-lab-borde/20 bg-lab-fondo px-1.5 text-xs text-lab-tinta [&_option]:bg-lab-superficie"
              title={NIVELES_RIVAL[rival].descripcion}
            >
              {(Object.keys(NIVELES_RIVAL) as NivelRival[]).map(n => <option key={n} value={n}>{NIVELES_RIVAL[n].nombre}</option>)}
            </select>
          </label>
          <span className={`rounded-md px-1.5 py-1 text-[10px] font-semibold ${valido ? 'bg-emerald-500/15 text-emerald-700' : 'bg-red-500/15 text-red-700'}`} title={reglas.map(x => (x.ok ? '✓ ' : '✗ ') + x.texto).join(' · ')}>
            {valido ? '✓ Reglamento' : '✗ Fuera de reglamento'}
          </span>
        </div>
        {!valido && <ul className="mt-1.5 space-y-0.5 text-[11px] text-red-700">{reglas.filter(x => !x.ok).map(x => <li key={x.texto}>✗ {x.texto}</li>)}</ul>}
      </div>
      {cuenta}
    </>
  )
}
