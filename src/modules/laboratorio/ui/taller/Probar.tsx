'use client'

// Pestaña «Probar»: la escena 3D ocupa todo el paso. Arriba, una barra corta
// con el estado del programa y Ejecutar / Pausa / Detener / Reiniciar; los
// ajustes de la escena (arena, pista propia, terreno, cámara, zoom) van en el
// menú «Escena». Abajo, un cajón plegable con el monitor serie, los pines y los
// problemas de ejecución. «Ver código» abre el programa de solo lectura al lado.

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  AlertTriangle, Camera, ChevronDown, ChevronUp, CircuitBoard, Code2, Eye, Gamepad2, Gauge, Loader2, Map as MapIcon, Maximize2, Minimize2,
  Navigation, Pause, Pencil, Play, Power, RotateCcw, RotateCw, Send, Square, Terminal, Timer, Trash2, Upload, Video, X, ZoomIn, ZoomOut,
} from 'lucide-react'
import { pieza } from '../../catalogo/piezas'
import { GRAVEDADES, type Gravedad } from '../../engine/fisica/mundo'
import type { RobotDoc } from '../../robots/doc'
import EditorCodigo from '../EditorCodigo'
import type { ModoCamara, PedidoZoom } from '../Escena3D'
import type { NivelCalidad } from '../calidad'
import { infoPlaca } from '../../engine/placa'
import ControlRemoto from './ControlRemoto'
import PanelCircuito from './PanelCircuito'
import { Carrera, Combate, HUD, PanelPines } from './Indicadores'
import type { SimulacionTaller } from './useSimulacion'

const EscenaArena = dynamic(() => import('../Escena3D').then(m => m.EscenaArena), { ssr: false })

type Pestana = 'serial' | 'pines' | 'problemas'
const CLAVE_CAJON = 'chaskibots-lab:cajon'
const CLAVE_SENSORES = 'chaskibots-lab:sensores'

interface Props {
  doc: RobotDoc
  s: SimulacionTaller
  nivel: NivelCalidad
  onNivel: (n: NivelCalidad) => void
  onIrA: (paso: 'programar') => void
}

export default function Probar({ doc, s, nivel, onNivel, onIrA }: Props) {
  const { sim, tele, banco, sinPlaca, python } = s
  const codigo = doc.programa.cpp
  const [zoom, setZoom] = useState<PedidoZoom>({ n: 0, factor: 1 })
  const [ampliada, setAmpliada] = useState(false)
  const [verCodigo, setVerCodigo] = useState(false)
  const [escena, setEscena] = useState(false)
  const [pestana, setPestana] = useState<Pestana>('serial')
  const [cajon, setCajon] = useState(() => { try { return localStorage.getItem(CLAVE_CAJON) === '1' } catch { return false } })
  // «Sensores»: dibujar en la arena lo que ve cada sensor; se recuerda entre sesiones.
  const [sensores, setSensores] = useState(() => { try { return localStorage.getItem(CLAVE_SENSORES) === '1' } catch { return false } })
  const verSensores = (si: boolean) => { setSensores(si); try { localStorage.setItem(CLAVE_SENSORES, si ? '1' : '0') } catch { /* modo privado */ } }
  const abiertoSolo = useRef(false)
  const [entrada, setEntrada] = useState('')
  const serialRef = useRef<HTMLPreElement>(null)
  const archivoPista = useRef<HTMLInputElement>(null)
  // El control remoto se abre solo si el programa obedece letras (Bluetooth o la plantilla RC).
  const leeLetras = /SerialBT|Serial\.read\(\)|handleClient\(\)/.test(codigo)
  const [control, setControl] = useState(leeLetras)
  useEffect(() => { if (leeLetras) setControl(true) }, [leeLetras])
  const conPulsador = doc.piezas.some(p => ['pulsador', 'joystick'].includes(pieza(p.pieza).comportamiento.tipo))

  // Esc sale de la pantalla completa.
  useEffect(() => {
    if (!ampliada) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAmpliada(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [ampliada])

  // El cajón se abre solo la primera vez que el programa imprime algo; después se recuerda cómo lo dejó el alumno.
  useEffect(() => {
    if (s.serial && !abiertoSolo.current) { abiertoSolo.current = true; setCajon(true); setPestana('serial') }
  }, [s.serial])
  const abrirCajon = (si: boolean) => { setCajon(si); try { localStorage.setItem(CLAVE_CAJON, si ? '1' : '0') } catch { /* modo privado */ } }
  useEffect(() => { serialRef.current?.scrollTo?.({ top: serialRef.current.scrollHeight }) }, [s.serial, cajon])

  const ejecutar = async () => {
    const ok = await s.ejecutar()
    // Con errores (de compilación o de cableado) se vuelve a Programar, donde se ven y se arreglan.
    if (!ok) onIrA('programar')
  }
  const enviar = () => { s.enviarSerial(entrada); setEntrada('') }

  const corriendo = s.estado === 'corriendo' || s.estado === 'pausado'
  const avisos = tele?.avisos ?? []
  const nProblemas = avisos.length + (s.estado === 'error' && tele?.error ? 1 : 0)
  const boton = 'lab-secundario flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium disabled:opacity-50'
  const icono = 'lab-secundario flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-50'

  return (
    <div className={ampliada ? 'lab-tema fixed inset-0 z-50 flex flex-col' : 'flex min-h-0 flex-1 flex-col'}>
      {/* ---------- Barra ---------- */}
      <div className="lab-panel flex h-12 shrink-0 items-center gap-2 border-b border-lab-borde/20 px-3">
        <EstadoPrograma s={s} doc={doc} />

        <div className="mx-auto flex items-center gap-1.5">
          {sinPlaca ? (
            <button
              onClick={() => s.encender(!s.encendido)}
              disabled={!sim}
              className={`flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50 ${s.encendido ? 'border border-red-500/40 bg-red-500/15 text-red-700 hover:bg-red-500/25' : 'lab-primario'}`}
              title={s.encendido ? 'Desconectar la pila' : 'Conectar la pila y encender el circuito'}
            >
              <Power className="h-4 w-4" /> {s.encendido ? 'Apagar' : 'Encender'}
            </button>
          ) : (
            <>
              {(!corriendo || s.codigoModificado) && (
                <button onClick={ejecutar} disabled={!sim || s.compilando} className="lab-primario flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50" title={python ? 'Ejecutar el programa en Python' : 'Compilar y ejecutar'}>
                  {s.compilando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {s.codigoModificado ? 'Ejecutar de nuevo' : 'Ejecutar'}
                </button>
              )}
              {corriendo && (
                <>
                  <button onClick={() => (s.estado === 'pausado' ? s.reanudar() : s.pausar())} className={boton} title={s.estado === 'pausado' ? 'Seguir' : 'Pausa'}>
                    {s.estado === 'pausado' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} {s.estado === 'pausado' ? 'Seguir' : 'Pausa'}
                  </button>
                  <button onClick={s.detener} className={boton} title="Detener el programa (los motores se apagan)"><Square className="h-4 w-4" /> Detener</button>
                </>
              )}
              {!banco && (
                <button onClick={s.reiniciar} disabled={!sim} className={boton} title={s.arena.competencia ? 'Empezar el combate otra vez: 0 a 0, robots a la salida y el programa desde el principio' : 'Volver a la salida y reiniciar el programa (como apretar RESET)'}>
                  <RotateCcw className="h-4 w-4" /> Reiniciar
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!banco && (
            <button onClick={() => verSensores(!sensores)} aria-pressed={sensores} className={`${boton} ${sensores ? '!bg-lab-acento/10 text-lab-acento' : ''}`} title="Ver qué lee cada sensor: la mancha de los sensores de línea, el cono del ultrasonido, los rayos infrarrojos y la pirámide de la cámara">
              <Eye className="h-4 w-4" /> Sensores
            </button>
          )}
          {!banco && (
            <button onClick={() => setControl(c => !c)} className={`${boton} ${control ? '!bg-lab-acento/10 text-lab-acento' : ''}`} title="Control remoto: manejar el robot con teclado, botones o un control">
              <Gamepad2 className="h-4 w-4" /> Control
            </button>
          )}
          {!sinPlaca && (
            <button onClick={() => setVerCodigo(v => !v)} className={`${boton} ${verCodigo ? '!bg-lab-acento/10 text-lab-acento' : ''}`} title="Ver el programa sin salir de la prueba">
              <Code2 className="h-4 w-4" /> Ver código
            </button>
          )}
          <div className="relative">
            <button onClick={() => setEscena(a => !a)} aria-expanded={escena} className={`${boton} ${escena ? '!bg-lab-acento/10 text-lab-acento' : ''}`} title="Arena, pista propia, terreno, cámara y zoom">
              <MapIcon className="h-4 w-4" /> Escena <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {escena && <MenuEscena s={s} zoom={f => setZoom(z => ({ n: z.n + 1, factor: f }))} onSubirPista={() => archivoPista.current?.click()} onCerrar={() => setEscena(false)} />}
          </div>
          <input ref={archivoPista} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) s.subirPista(f); e.target.value = '' }} />
          <button onClick={() => setAmpliada(x => !x)} className={icono} title={ampliada ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'} aria-label={ampliada ? 'Salir de pantalla completa' : 'Pantalla completa'}>
            {ampliada ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ---------- Escena + código ---------- */}
      <div className="flex min-h-0 flex-1">
        <div className="lab-escena relative min-h-0 min-w-0 flex-1 overflow-hidden">
          {sim ? (
            <EscenaArena sim={sim} modoCamara={s.camara} versionArena={s.versionArena} nivel={nivel} onNivel={onNivel} zoom={zoom} sensores={sensores} />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-lab-suave">
              <Loader2 className="h-5 w-5 animate-spin" /> Preparando física…
            </div>
          )}
          {sim && <HUD tele={tele} robot={!banco} python={python} />}
          {sim && banco && <PanelCircuito sim={sim} tele={tele} silencio={s.silencio} onSilencio={s.setSilencio} onGesto={s.activarSonido} />}
          {sim && tele?.carrera && <Carrera carrera={tele.carrera} onReiniciar={s.reiniciar} />}
          {sim && s.arena.competencia && <Combate sim={sim} tele={tele} reglamento={s.arena.competencia} doc={doc} onReiniciar={s.reiniciar} />}

          {sim && !sinPlaca && s.estado === 'sin-programa' && !s.compilando && (
            <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 flex justify-center px-4">
              <div className="lab-vidrio pointer-events-auto flex max-w-md items-center gap-3 rounded-md px-4 py-3 text-sm">
                <div className="min-w-0">
                  <div className="font-semibold text-lab-tinta">{s.robotCambio ? 'El robot cambió: vuelve a ejecutar el programa' : 'Todavía no hay programa corriendo'}</div>
                  <div className="text-xs text-lab-suave">{s.robotCambio ? 'Cambiaste piezas o cables, así que la placa se reinició.' : 'Escribe o elige una plantilla en Programar y ejecútala.'}</div>
                </div>
                {codigo.trim() ? (
                  <button onClick={ejecutar} disabled={s.compilando} className="lab-primario h-8 shrink-0 rounded-md px-3 text-xs font-semibold">Ejecutar</button>
                ) : (
                  <button onClick={() => onIrA('programar')} className="lab-primario h-8 shrink-0 rounded-md px-3 text-xs font-semibold">Ir a Programar</button>
                )}
              </div>
            </div>
          )}

          {sim && (
            <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5">
              {([['Acercar', ZoomIn, 0.75], ['Alejar', ZoomOut, 1 / 0.75]] as const).map(([txt, Icon, f]) => (
                <button key={txt} onClick={() => setZoom(z => ({ n: z.n + 1, factor: f }))} title={txt} aria-label={txt} className="lab-vidrio flex h-8 w-8 items-center justify-center rounded-md text-lab-tinta">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
          {sim && control && !banco && <ControlRemoto sim={sim} conPrograma={corriendo} leeLetras={leeLetras} conArma={/case 'X'/.test(codigo)} fase={tele?.combate?.fase} onCerrar={() => setControl(false)} />}
          <div className={`pointer-events-none absolute bottom-2 left-3 rounded-md bg-lab-superficie/85 px-2 py-0.5 text-[11px] text-lab-suave ${control ? 'hidden' : ''}`}>
            {banco
              ? `${conPulsador ? 'Haz clic en el pulsador para presionarlo · ' : ''}arrastra para girar la cámara`
              : corriendo && s.estado !== 'pausado' ? 'Pausa el programa para mover el robot · arrastra el fondo para girar la cámara'
                : 'Arrastra el robot para moverlo (o doble clic en el piso) · arrastra el fondo para girar la cámara'}
          </div>
        </div>

        {verCodigo && !sinPlaca && (
          <aside className="flex w-[36%] min-w-[22rem] flex-col border-l border-lab-borde/20 bg-lab-superficie">
            <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-lab-borde/20 bg-lab-fondo2 px-3 text-xs text-lab-suave">
              <span className="truncate font-mono">{doc.nombre}.{python ? 'py' : 'ino'} · solo lectura</span>
              <div className="flex items-center gap-1">
                <button onClick={() => onIrA('programar')} className="flex items-center gap-1 rounded px-2 py-0.5 font-medium text-lab-tinta hover:bg-lab-superficie"><Pencil className="h-3 w-3" /> Editar en Programar</button>
                <button onClick={() => setVerCodigo(false)} className="rounded p-1 hover:bg-lab-superficie" aria-label="Cerrar código"><X className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <EditorCodigo codigo={codigo} lenguaje={python ? 'python' : 'cpp'} onChange={() => {}} errores={s.errores} onEjecutar={ejecutar} soloLectura />
            </div>
          </aside>
        )}
      </div>

      {/* ---------- Cajón: monitor serie, pines y problemas ---------- */}
      {!sinPlaca && (
        <div className={`flex shrink-0 flex-col border-t border-lab-borde/20 bg-lab-fondo ${cajon ? 'h-[32%] max-h-72 min-h-[10rem]' : 'h-9'}`}>
          <div className="flex h-9 shrink-0 items-center border-b border-lab-borde/20 text-xs">
            {([
              ['serial', 'Monitor serie', Terminal, 0],
              ['pines', 'Pines y sensores', CircuitBoard, 0],
              ['problemas', 'Problemas', AlertTriangle, nProblemas],
            ] as const).map(([id, txt, Icon, n]) => (
              <button key={id} onClick={() => { if (!cajon) abrirCajon(true); else if (pestana === id) abrirCajon(false); setPestana(id) }} className={`flex h-full items-center gap-1.5 border-b-2 px-3 ${cajon && pestana === id ? 'border-lab-acento text-lab-tinta' : 'border-transparent text-lab-suave hover:text-lab-tinta'}`}>
                <Icon className="h-3.5 w-3.5" /> {txt}{n > 0 && <span className="rounded-full bg-amber-500/15 px-1.5 font-mono text-[10px] text-amber-700">{n}</span>}
              </button>
            ))}
            <button onClick={() => abrirCajon(!cajon)} className="ml-auto flex h-full items-center gap-1 px-3 text-lab-suave hover:text-lab-tinta" aria-label={cajon ? 'Cerrar el cajón' : 'Abrir el cajón'} aria-expanded={cajon}>
              {cajon ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
          {cajon && (
            <div className="min-h-0 flex-1 overflow-auto">
              {pestana === 'serial' && (
                <div className="flex h-full flex-col">
                  <pre ref={serialRef} className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-xs text-emerald-700">
                    {s.serial || <span className="text-lab-tenue">{python ? 'Lo que tu programa imprima con print() aparece aquí.' : 'Lo que tu programa envíe con Serial.print aparece aquí.'}</span>}
                  </pre>
                  <div className="flex gap-2 border-t border-lab-borde/20 p-2">
                    <input
                      value={entrada}
                      onChange={e => setEntrada(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') enviar() }}
                      placeholder="Enviar texto a la placa…"
                      className="h-8 min-w-0 flex-1 rounded-md border border-lab-borde/20 bg-lab-vacio px-2 font-mono text-xs outline-none focus:border-lab-acento/50"
                    />
                    <button onClick={enviar} className="flex h-8 items-center gap-1 rounded-md bg-lab-tinta/[0.07] px-3 text-xs hover:bg-lab-tinta/10"><Send className="h-3.5 w-3.5" /> Enviar</button>
                    <button onClick={s.limpiarSerial} className="flex h-8 w-8 items-center justify-center rounded-md bg-lab-tinta/[0.04] hover:bg-lab-tinta/[0.07]" title="Limpiar" aria-label="Limpiar"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}
              {pestana === 'pines' && <PanelPines tele={tele} />}
              {pestana === 'problemas' && (
                <div className="space-y-1.5 p-3 text-xs">
                  {s.estado === 'error' && tele?.error && (
                    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-red-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="whitespace-pre-wrap font-mono">{tele.error}</span></div>
                  )}
                  {avisos.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-amber-700"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {a}</div>
                  ))}
                  {nProblemas === 0 && <p className="text-lab-tenue">Sin problemas de ejecución. Los errores del compilador se ven en Programar.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Punto de color y texto con lo que hace el programa ahora. */
function EstadoPrograma({ s, doc }: { s: SimulacionTaller; doc: RobotDoc }) {
  const placa = infoPlaca(doc).nombre
  const e = s.sinPlaca
    ? (s.encendido ? { txt: 'Encendido · pila conectada', cls: 'bg-emerald-500' } : { txt: 'Apagado', cls: 'bg-slate-400' })
    : s.compilando ? { txt: s.python ? 'Cargando Python…' : 'Compilando…', cls: 'bg-sky-400 animate-pulse' }
      : {
        preparando: { txt: 'Preparando física…', cls: 'bg-slate-400' },
        'sin-programa': { txt: s.robotCambio ? 'Sin programa · el robot cambió' : 'Sin programa', cls: 'bg-slate-400' },
        cargando: { txt: 'Cargando…', cls: 'bg-sky-400' },
        corriendo: s.codigoModificado ? { txt: 'Corriendo · código modificado', cls: 'bg-amber-400' } : { txt: `Corriendo · ${placa}`, cls: 'bg-emerald-500 animate-pulse' },
        pausado: { txt: 'Pausado', cls: 'bg-amber-400' },
        error: { txt: 'Detenido · error', cls: 'bg-red-500' },
      }[s.estado]
  const aviso = s.aviso?.tipo === 'error' ? s.aviso.texto : null
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm" title={aviso ?? undefined}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${e.cls}`} />
      <span className="truncate font-medium text-lab-tinta">{e.txt}</span>
      {s.tele && (s.estado === 'corriendo' || s.estado === 'pausado') && <span className="hidden shrink-0 font-mono text-xs text-lab-suave xl:inline">t = {s.tele.tiempoSim.toFixed(1)} s</span>}
    </div>
  )
}

const Titulo = ({ children }: { children: React.ReactNode }) => <div className="lab-seccion mb-1.5 mt-3 first:mt-0">{children}</div>

/** Menú «Escena»: ajustes que se tocan una vez (arena, pista propia, terreno, cámara, zoom, giro del robot). */
function MenuEscena({ s, zoom, onSubirPista, onCerrar }: { s: SimulacionTaller; zoom: (factor: number) => void; onSubirPista: () => void; onCerrar: () => void }) {
  const caja = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node) && !(e.target as Element).closest('[aria-expanded]')) onCerrar() }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('pointerdown', fuera)
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('pointerdown', fuera); window.removeEventListener('keydown', esc) }
  }, [onCerrar])
  const camaras = useMemo(() => ([['libre', 'Libre', Camera], ['seguir', 'Seguir', Navigation], ['robot', 'Robot', Video], ['arriba', 'Arriba', MapIcon]] as const).filter(([id]) => !s.banco || (id !== 'seguir' && id !== 'robot')), [s.banco])
  return (
    <div ref={caja} role="menu" className="lab-vidrio absolute right-0 top-10 z-50 w-72 rounded-md p-3 text-xs">
      {!s.banco && (
        <>
          <Titulo>Arena</Titulo>
          <ul className="max-h-48 space-y-0.5 overflow-y-auto">
            {s.arenas.map(a => {
              const sel = !s.imagenPropia && s.arena.id === a.id
              return (
                <li key={a.id}>
                  <button onClick={() => s.cambiarArena(a.id)} aria-pressed={sel} className={`flex w-full flex-col rounded px-2 py-1 text-left ${sel ? 'bg-lab-acento/10 text-lab-acento' : 'hover:bg-lab-fondo2'}`}>
                    <span className="font-medium">{a.nombre}</span>
                    <span className={`truncate text-[11px] ${sel ? 'text-lab-acento/80' : 'text-lab-tenue'}`}>{a.descripcion}</span>
                  </button>
                </li>
              )
            })}
            {s.imagenPropia && (
              <li><button aria-pressed className="flex w-full flex-col rounded bg-lab-acento/10 px-2 py-1 text-left text-lab-acento"><span className="font-medium">{s.imagenPropia.nombre}</span><span className="text-[11px] text-lab-acento/80">Tu pista (3 × 2 m)</span></button></li>
            )}
          </ul>
          <button onClick={() => { onSubirPista(); onCerrar() }} className="lab-secundario mt-1.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-md font-medium"><Upload className="h-3.5 w-3.5" /> Subir mi pista (PNG o JPG)</button>

          <Titulo>Terreno</Titulo>
          <label className="lab-secundario flex h-8 items-center gap-1.5 rounded-md pl-2">
            <Gauge className="h-3.5 w-3.5 text-lab-suave" />
            <select className="h-full flex-1 bg-transparent pr-2 text-lab-tinta outline-none [&_option]:bg-lab-superficie" value={s.gravedad} onChange={e => s.setGravedad(e.target.value as Gravedad)}>
              {Object.entries(GRAVEDADES).map(([k, v]) => <option key={k} value={k}>{v.nombre}</option>)}
            </select>
          </label>

          <Titulo>Robot</Titulo>
          <div className="flex gap-1.5">
            <button onClick={() => s.girarRobot(Math.PI / 12)} className="lab-secundario flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md" title="Girar 15° a la izquierda"><RotateCcw className="h-3.5 w-3.5" /> Girar izq.</button>
            <button onClick={() => s.girarRobot(-Math.PI / 12)} className="lab-secundario flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md" title="Girar 15° a la derecha"><RotateCw className="h-3.5 w-3.5" /> Girar der.</button>
          </div>
        </>
      )}

      <Titulo>Cámara</Titulo>
      <div className="flex h-8 rounded-md bg-lab-fondo2 p-0.5">
        {camaras.map(([id, txt, Icon]) => (
          <button key={id} onClick={() => s.setCamara(id as ModoCamara)} className={`flex flex-1 items-center justify-center gap-1 rounded ${s.camara === id ? 'bg-lab-superficie font-medium text-lab-tinta shadow-sm' : 'text-lab-suave hover:text-lab-tinta'}`}>
            <Icon className="h-3.5 w-3.5" /> {txt}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <button onClick={() => zoom(0.75)} className="lab-secundario flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md"><ZoomIn className="h-3.5 w-3.5" /> Acercar</button>
        <button onClick={() => zoom(1 / 0.75)} className="lab-secundario flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md"><ZoomOut className="h-3.5 w-3.5" /> Alejar</button>
      </div>

      <Titulo>Velocidad</Titulo>
      <div className="flex h-8 rounded-md bg-lab-fondo2 p-0.5" title="Cámara lenta: la simulación avanza más despacio que el reloj, pero el programa sigue sincronizado">
        {([[1, '×1'], [0.5, '×0,5'], [0.25, '×0,25']] as const).map(([v, txt]) => (
          <button key={v} onClick={() => s.setVelocidadSim(v)} aria-pressed={s.velocidadSim === v} className={`flex flex-1 items-center justify-center gap-1 rounded ${s.velocidadSim === v ? 'bg-lab-superficie font-medium text-lab-tinta shadow-sm' : 'text-lab-suave hover:text-lab-tinta'}`}>
            {v === 1 ? <Timer className="h-3.5 w-3.5" /> : null} {txt}
          </button>
        ))}
      </div>
    </div>
  )
}
