'use client'

// Laboratorio de Robótica (F2): taller con pestañas Armar · Cablear ·
// Programar · Probar. El robot es un RobotDoc (árbol de piezas + cables +
// programa); cada cambio de piezas recablea solo y se puede deshacer.
// El borrador se guarda en este navegador (en F3, en la cuenta).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Bot, Target, Cable, ChevronRight, CloudUpload, Code2, Download, FileUp, FolderOpen, Hammer, LayoutGrid, Lightbulb, Loader2, MoreHorizontal, Pencil, Play, Plus, Printer, Search, X } from 'lucide-react'
import { datosVariante, pieza } from '../../catalogo/piezas'
import { autocablear } from '../../engine/autocableado'
import { aprendizajes } from '../../engine/explicacion'
import { bancoVacio, esBanco, robotVacio, validar } from '../../engine/ensamblaje'
import type { RobotDoc } from '../../robots/doc'
import { PREARMADOS, construirSeguidor, plantillasDe, programaConPinesNuevos } from '../../robots/prearmados'
import { GRUPOS, grupoDe, ordenEnGrupo } from '../../robots/clasificacion'
import { calidadInicial, type NivelCalidad } from '../calidad'
import Armar from './Armar'
import Miniatura from './Miniatura'
import MisRobots from './MisRobots'
import { generarArduino } from '../../bloques/generador'
import { PROGRAMA_VACIO } from '../../bloques/definiciones'
import Cablear from './Cablear'
import Programar from './Programar'
import Probar from './Probar'
import { useSimulacion, estructura } from './useSimulacion'
import PanelMision from './PanelMision'
import { avanceNuevo, crearMision, etapasMision, pruebaCumplida, type Avance } from '../../engine/mision'

type Pestana = 'armar' | 'cablear' | 'programar' | 'probar'

const CLAVE_BORRADOR = 'chaskibots-lab:robot-v2'
const MAX_HISTORIAL = 80

/** `arena`: la que eligió el alumno en Probar (si no es la del proyecto). */
interface Borrador { doc: RobotDoc; prearmado: string | null; nubeId?: string | null; arena?: string; mision?: MisionEnCurso | null }
/** Misión guiada en curso: de qué proyecto y qué lleva hecho el alumno. */
interface MisionEnCurso { id: string; avance: Avance }

function leerBorrador(): Borrador | null {
  try {
    const b = JSON.parse(localStorage.getItem(CLAVE_BORRADOR) ?? 'null') as Borrador | null
    if (b?.doc?.version === 2 && validar(b.doc).length === 0) return b
  } catch { /* borrador dañado o almacenamiento bloqueado */ }
  return null
}

function guardarBorrador(b: Borrador) {
  try { localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(b)) } catch { /* modo privado: no pasa nada */ }
}

// Automático: se recablea todo. A mano: se respetan los cables y solo se conectan las piezas nuevas.
const conCables = (d: RobotDoc): RobotDoc => sincronizar({ ...d, cables: autocablear(d, { conservar: d.cableado === 'manual' }).cables })

/** En modo bloques, el código C++ se rehace con los pines actuales (cambian si cambian los cables). */
function sincronizar(d: RobotDoc): RobotDoc {
  if (d.programa.modo !== 'bloques') return d
  const { cpp } = generarArduino(d.programa.bloques, d, autocablear(d, { conservar: true }).tabla)
  return cpp === d.programa.cpp ? d : { ...d, programa: { ...d.programa, cpp } }
}

export default function Taller() {
  const [doc, setDoc] = useState<RobotDoc | null>(null)
  const [prearmado, setPrearmado] = useState<string | null>(null)
  const [pasado, setPasado] = useState<RobotDoc[]>([])
  const [futuro, setFuturo] = useState<RobotDoc[]>([])
  const [pestana, setPestana] = useState<Pestana>('armar')
  const [galeria, setGaleria] = useState(false)
  const [materiales, setMateriales] = useState(false)
  const [misRobots, setMisRobots] = useState(false)
  const [nubeId, setNubeId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [nivel, setNivel] = useState<NivelCalidad>('media')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(null)
  const [arenaGuardada, setArenaGuardada] = useState<string | null>(null)
  const [mision, setMision] = useState<MisionEnCurso | null>(null)
  const [buscarPieza, setBuscarPieza] = useState<{ texto: string; n: number } | null>(null)
  const archivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setNivel(calidadInicial())
    const b = leerBorrador()
    if (b) { setDoc(b.doc); setPrearmado(b.prearmado); setNubeId(b.nubeId ?? null); setArenaGuardada(b.arena ?? null); setMision(b.mision && PREARMADOS.some(p => p.id === b.mision!.id) ? b.mision : null) }
    else { setDoc(construirSeguidor()); setPrearmado('seguidor'); setGaleria(true) }
  }, [])

  // Arena del proyecto (o la que el alumno dejó elegida en este navegador).
  const arenaInicial = arenaGuardada ?? (!doc ? 'ovalo' : PREARMADOS.find(p => p.id === prearmado)?.arena
    ?? (esBanco(doc) ? 'mesa-electronica' : doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'ultrasonido') ? 'campo-libre' : 'ovalo'))

  // La simulación vive aquí para que siga corriendo al pasar de Programar a Probar y volver.
  const s = useSimulacion(doc, arenaInicial, pestana === 'programar' || pestana === 'probar')

  // Guardar el borrador (con una pequeña espera para no escribir en cada tecla).
  useEffect(() => {
    if (!doc) return
    const arena = s.sim && !s.imagenPropia && s.arena.id !== arenaInicial ? s.arena.id : arenaGuardada ?? undefined
    const t = setTimeout(() => guardarBorrador({ doc, prearmado, nubeId, arena, mision }), 400)
    return () => clearTimeout(t)
  }, [doc, prearmado, nubeId, s.sim, s.arena.id, s.imagenPropia, arenaInicial, arenaGuardada, mision])

  // ---------- Misión guiada ----------
  const defMision = useMemo(() => {
    const p = mision ? PREARMADOS.find(x => x.id === mision.id) : null
    return p ? crearMision(p) : null
  }, [mision?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const claveRobot = doc ? estructura(doc) : ''
  const hayPrograma = !!doc && doc.programa.cpp.trim().length > 0
  // Las etapas dependen de las piezas, los cables y de si hay programa (no de cada tecla del código).
  const etapas = useMemo(
    () => (defMision && mision && doc ? etapasMision(defMision, doc, mision.avance) : null),
    [defMision, mision?.avance, claveRobot, hayPrograma], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const avanzar = useCallback((cambio: Partial<Avance>) => setMision(m => (m ? { ...m, avance: { ...m.avance, ...cambio } } : m)), [])
  const listoParaCorrer = !!etapas && etapas[2].completa && etapas[3].completa
  // «Compila y ejecuta»: vale cuando corre con el robot ya armado y conectado.
  useEffect(() => {
    if (mision && !mision.avance.corrio && listoParaCorrer && s.estado === 'corriendo') avanzar({ corrio: true })
  }, [mision, listoParaCorrer, s.estado, avanzar])
  // «Prueba»: segundos corriendo y metros recorridos desde que se ejecutó.
  const prueba = useRef({ t: 0, seg: 0, m: 0 })
  useEffect(() => {
    if (!mision || !defMision || mision.avance.probado || !listoParaCorrer || !s.tele) return
    const p = prueba.current
    const t = s.tele.tiempoSim
    if (s.estado !== 'corriendo' || t < p.t) { if (t < p.t) { p.seg = 0; p.m = 0 } p.t = t; return }
    const dt = Math.min(0.5, t - p.t)
    p.t = t; p.seg += dt; p.m += Math.abs(s.tele.velocidadRobot) * dt
    if (pruebaCumplida(defMision, p.seg, p.m)) avanzar({ probado: true })
  }, [mision, defMision, listoParaCorrer, s.tele, s.estado, avanzar])
  // Al completar todo, se anota la hora de término (para la ficha).
  useEffect(() => {
    if (mision && etapas && !mision.avance.fin && etapas.every(e => e.completa)) avanzar({ fin: Date.now() })
  }, [mision, etapas, avanzar])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(t)
  }, [aviso])

  const avisar = useCallback((tipo: 'ok' | 'error' | 'info', texto: string) => setAviso({ tipo, texto }), [])

  const docActual = useRef<RobotDoc | null>(null)
  docActual.current = doc

  /** Cambia el robot (con deshacer). `recablear`: conectar solas las piezas nuevas (no al editar cables a mano). */
  const cambiar = useCallback((d: RobotDoc, texto?: string, recablear = true) => {
    const actual = docActual.current
    if (actual) setPasado(p => [...p.slice(-MAX_HISTORIAL + 1), actual])
    const nuevo = recablear ? conCables(d) : sincronizar(d)
    const r = actual && recablear ? programaConPinesNuevos(actual, nuevo, prearmado) : { doc: nuevo, desactualizado: false }
    setDoc(r.doc)
    setFuturo([])
    if (r.desactualizado) setAviso({ tipo: 'info', texto: `${texto ? `${texto}. ` : ''}Cambiaron los pines: revisa los de tu código o carga una plantilla en «Programar».` })
    else if (texto) setAviso({ tipo: 'info', texto })
  }, [prearmado])

  const deshacer = () => {
    if (!doc || !pasado.length) return
    setFuturo(f => [doc, ...f])
    setDoc(pasado[pasado.length - 1])
    setPasado(p => p.slice(0, -1))
  }
  const rehacer = () => {
    if (!doc || !futuro.length) return
    setPasado(p => [...p, doc])
    setDoc(futuro[0])
    setFuturo(f => f.slice(1))
  }

  // Guardar en la cuenta («Mis robots»): crea la primera vez y después actualiza.
  const guardarNube = async () => {
    if (!doc || guardando) return
    setGuardando(true)
    try {
      const r = await fetch(nubeId ? `/api/lab/robots/${nubeId}` : '/api/lab/robots', {
        method: nubeId ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombre: doc.nombre, doc }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.status === 404 && nubeId) { setNubeId(null); avisar('info', 'Ese robot ya no estaba en tu cuenta: vuelve a guardar para crearlo de nuevo.'); return }
      if (!r.ok) { avisar('error', d.error ?? 'No se pudo guardar'); return }
      setNubeId(d.id)
      avisar('ok', `«${doc.nombre}» guardado en tu cuenta`)
    } catch {
      avisar('error', 'Sin conexión: el robot sigue guardado en este navegador')
    } finally {
      setGuardando(false)
    }
  }

  // Atajos: Ctrl+S guardar; Ctrl+Z / Ctrl+Y deshacer y rehacer en el taller.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 's') { e.preventDefault(); guardarNube(); return }
      if (pestana !== 'armar') return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); deshacer() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); rehacer() }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  })

  /** Empieza la misión guiada de un proyecto: solo la base, sin cables ni programa. */
  const empezarMision = (id: string) => {
    const p = PREARMADOS.find(x => x.id === id)
    if (!p) return
    setDoc(crearMision(p).inicio)
    setMision({ id, avance: avanceNuevo() })
    prueba.current = { t: 0, seg: 0, m: 0 }
    setNubeId(null); setPrearmado(id); setArenaGuardada(null)
    setPasado([]); setFuturo([])
    setGaleria(false)
    setPestana('armar')
  }
  const confirmarPaso = (id: string, si: boolean) => setMision(m => (m ? { ...m, avance: { ...m.avance, confirmados: si ? [...m.avance.confirmados.filter(x => x !== id), id] : m.avance.confirmados.filter(x => x !== id) } } : m))

  const abrir = (d: RobotDoc, id: string | null, idNube: string | null = null) => {
    setMision(null)
    setDoc(conCables(d))
    setNubeId(idNube)
    setPrearmado(id)
    setArenaGuardada(null)
    setPasado([]); setFuturo([])
    setGaleria(false)
    setPestana('armar')
  }

  const plantillas = useMemo(() => {
    if (!doc) return []
    return plantillasDe(doc, prearmado)
  }, [doc, prearmado])

  const exportar = () => {
    if (!doc) return
    const datos = { formato: 'chaskibots-lab', version: 2, prearmado, robot: doc }
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${doc.nombre.normalize('NFD').replace(/[^\w]+/g, '_') || 'robot'}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importar = async (file: File) => {
    try {
      const datos = JSON.parse(await file.text())
      if (datos.formato !== 'chaskibots-lab') throw new Error()
      if (datos.version === 2 && validar(datos.robot).length === 0) {
        abrir(datos.robot, datos.prearmado ?? null)
      } else if (typeof datos.codigo === 'string') {
        // Proyecto de F1: el seguidor de línea con el código guardado.
        const d = construirSeguidor()
        abrir({ ...d, programa: { modo: 'codigo', cpp: datos.codigo } }, 'seguidor')
      } else throw new Error()
      avisar('ok', `Proyecto «${file.name}» cargado`)
    } catch {
      avisar('error', 'Ese archivo no es un proyecto del laboratorio')
    }
  }

  if (!doc) return <div className="lab-tema h-dvh" />

  const pestanas: [Pestana, string, typeof Hammer][] = [
    ['armar', 'Armar', Hammer], ['cablear', 'Cablear', Cable], ['programar', 'Programar', Code2], ['probar', 'Probar', Play],
  ]

  return (
    <div data-paso={pestana} className="lab-tema lab-cabina h-dvh min-h-[520px] overflow-hidden text-lab-tinta [--lab-arriba:7.5rem] sm:[--lab-arriba:4.75rem]">
      {/* ---------- Encabezado ---------- */}
      {/* Tres islas de vidrio que flotan sobre la escena: proyecto, pasos y acciones. */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex flex-wrap items-center justify-between gap-2">
        <div className="lab-isla pointer-events-auto flex h-12 min-w-0 items-center gap-2 pl-2 pr-3">
        <a href="/" title="Volver a ChaskiBots" className="lab-boton-icono flex h-9 shrink-0 items-center gap-1.5 px-1.5">
          <ArrowLeft className="h-4 w-4" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chaski.png" alt="" className="h-7 w-7 rounded-[10px] bg-[rgb(var(--lab-acento))] object-contain p-0.5" />
        </a>
        <label className="group hidden min-w-0 items-center gap-1.5 md:flex" title="Cambiar el nombre">
          <input
            value={doc.nombre}
            onChange={e => setDoc({ ...doc, nombre: e.target.value.slice(0, 40) })}
            size={Math.max(8, doc.nombre.length)}
            className="min-w-0 max-w-[12rem] truncate rounded bg-transparent px-1 py-1 text-sm font-semibold text-lab-tinta outline-none hover:bg-lab-fondo2 focus:bg-lab-fondo2 focus:ring-1 focus:ring-lab-acento/40 lg:max-w-[16rem]"
            aria-label="Nombre del robot"
          />
          <Pencil className="hidden h-3.5 w-3.5 shrink-0 text-lab-tenue group-hover:block" />
        </label>
        </div>
        <nav aria-label="Pasos" style={{ '--i': pestanas.findIndex(x => x[0] === pestana) } as React.CSSProperties} className="lab-isla lab-pasos pointer-events-auto order-3 h-12 w-full sm:order-none sm:w-auto">
          {pestanas.map(([id, txt, I]) => (
            <button key={id} data-id={id} aria-current={pestana === id ? 'step' : undefined} onClick={() => setPestana(id)} title={txt} className="lab-paso flex items-center justify-center gap-2 px-3 text-sm font-semibold lg:w-[8rem]">
              <I className="h-4 w-4 shrink-0" />
              <span className="sm:hidden lg:inline">{txt}</span>
            </button>
          ))}
        </nav>
        <div className="lab-isla pointer-events-auto flex h-12 items-center gap-1.5 px-2">
          <button onClick={() => setGaleria(true)} className="lab-secundario flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium" title="Proyectos listos o empezar de cero">
            <LayoutGrid className="h-4 w-4" /> <span className="hidden md:inline">Proyectos</span>
          </button>
          <MenuMas
            opciones={[
              { icono: FolderOpen, texto: 'Mis robots guardados', accion: () => setMisRobots(true) },
              { icono: Download, texto: 'Descargar proyecto (.json)', accion: exportar },
              { icono: FileUp, texto: 'Abrir proyecto (.json)', accion: () => archivo.current?.click() },
            ]}
          />
          <button onClick={guardarNube} disabled={guardando} className="lab-primario lab-b-marino flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold disabled:opacity-50" title="Guardar en tu cuenta (Ctrl+S)">
            {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />} <span className="hidden sm:inline">Guardar</span>
          </button>
          <input ref={archivo} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = '' }} />
        </div>
      </div>

      {/* Aviso flotante: no empuja el contenido hacia abajo. */}
      {aviso && (
        <div role="status" className="pointer-events-none fixed inset-x-0 top-[calc(var(--lab-arriba)+0.25rem)] z-40 flex justify-center px-4">
          <div className={`lab-vidrio flex max-w-xl items-start gap-2 border px-4 py-2.5 text-xs font-medium text-lab-tinta ${aviso.tipo === 'error' ? 'border-red-300' : aviso.tipo === 'ok' ? 'border-emerald-300' : 'border-lab-borde/25'}`}>
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${aviso.tipo === 'error' ? 'bg-red-500' : aviso.tipo === 'ok' ? 'bg-emerald-500' : 'bg-lab-acento'}`} />
            {aviso.texto}
          </div>
        </div>
      )}

      {/* ---------- Contenido (cada pestaña entra deslizándose) ---------- */}
      <div key={pestana} className={`lab-entra absolute inset-0 flex flex-col ${pestana === 'armar' ? '' : `px-3 pt-[var(--lab-arriba)] ${mision ? 'pb-[5rem]' : 'pb-3'}`}`}>
      <div className={pestana === 'armar' ? 'flex min-h-0 flex-1 flex-col' : 'lab-ventana flex min-h-0 flex-1 flex-col'}>
      {pestana === 'armar' && (
        <Armar
          // En una misión los cables los pone el alumno: las piezas nuevas no se conectan solas.
          doc={doc} cambiar={mision ? (d, t) => cambiar(d, t, false) : cambiar} deshacer={deshacer} rehacer={rehacer}
          buscar={buscarPieza}
          puedeDeshacer={pasado.length > 0} puedeRehacer={futuro.length > 0}
          nivel={nivel} onNivel={setNivel} avisar={avisar} onListaMateriales={() => setMateriales(true)}
        />
      )}
      {pestana === 'cablear' && <Cablear doc={doc} cambiar={(d, t, r) => { if (mision && d.cableado === 'auto') avanzar({ ayudaCables: true }); cambiar(d, t, r) }} nivel={nivel} onNivel={setNivel} />}
      {pestana === 'programar' && (
        <Programar
          doc={doc}
          s={s}
          plantillas={plantillas}
          onPrograma={p => setDoc(d => (d ? sincronizar({ ...d, programa: p }) : d))}
          onIrA={setPestana}
        />
      )}
      {pestana === 'probar' && <Probar doc={doc} s={s} nivel={nivel} onNivel={setNivel} onIrA={setPestana} />}
      </div>
      </div>

      {mision && defMision && etapas && (
        <PanelMision
          mision={defMision} etapas={etapas} avance={mision.avance} pestana={pestana}
          onIrA={setPestana} onConfirmar={confirmarPaso}
          onBuscarPieza={texto => { setPestana('armar'); setBuscarPieza(b => ({ texto, n: (b?.n ?? 0) + 1 })) }}
          onSalir={() => setMision(null)}
        />
      )}

      {galeria && <Galeria onAbrir={abrir} onMision={empezarMision} onCerrar={() => setGaleria(false)} />}
      {materiales && <ListaMateriales doc={doc} onCerrar={() => setMateriales(false)} />}
      {misRobots && <MisRobots actual={nubeId} onCerrar={() => setMisRobots(false)} onAbrir={(d, id) => { abrir(d, null, id); setMisRobots(false); avisar('ok', `«${d.nombre}» abierto`) }} />}
    </div>
  )
}

// ---------------------------------------------------------------------------

function Modal({ titulo, onCerrar, children, ancho = 'max-w-3xl' }: { titulo: string; onCerrar: () => void; children: React.ReactNode; ancho?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" onClick={onCerrar}>
      <div className={`max-h-[90dvh] w-full ${ancho} overflow-y-auto rounded-t-lg lab-vidrio p-4 sm:rounded-lg sm:p-6`} onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-lab-tinta">{titulo}</h2>
          <button onClick={onCerrar} className="rounded-md p-1.5 text-lab-suave hover:bg-lab-fondo2" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Menú «⋯» de la barra: las acciones que se usan poco, fuera de la vista. */
function MenuMas({ opciones }: { opciones: { icono: typeof Hammer; texto: string; accion: () => void }[] }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!abierto) return
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    window.addEventListener('pointerdown', fuera)
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('pointerdown', fuera); window.removeEventListener('keydown', esc) }
  }, [abierto])
  return (
    <div ref={caja} className="relative">
      <button onClick={() => setAbierto(a => !a)} aria-expanded={abierto} aria-label="Más opciones" title="Más opciones" className="lab-secundario flex h-8 w-8 items-center justify-center rounded-md">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {abierto && (
        <div role="menu" className="lab-vidrio absolute right-0 top-12 z-50 w-64 overflow-hidden py-1.5">
          {opciones.map(({ icono: I, texto, accion }) => (
            <button key={texto} role="menuitem" onClick={() => { setAbierto(false); accion() }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-lab-tinta hover:bg-lab-acento/10">
              <I className="h-4 w-4 text-lab-suave" /> {texto}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

type PlacaGaleria = 'arduino' | 'esp32' | 'pico' | 'mega'
/** Placa de un proyecto de la galería, por su id ('rc-esp32', 'pico-perilla'…). */
const placaDe = (id: string): PlacaGaleria => (id.includes('esp32') ? 'esp32' : id.startsWith('pico') ? 'pico' : id.startsWith('mega') ? 'mega' : 'arduino')

const NIVEL = { inicial: ['Inicial', 1], intermedio: ['Intermedio', 2], avanzado: ['Avanzado', 3] } as const

/** Nivel con tres rayitas: una = inicial, tres = avanzado. */
function Nivel({ nivel }: { nivel: keyof typeof NIVEL }) {
  const [txt, n] = NIVEL[nivel]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-lab-suave">
      <span className="flex gap-0.5">{[1, 2, 3].map(i => <span key={i} className={`h-2.5 w-1.5 rounded-[1px] ${i <= n ? (n === 1 ? 'bg-emerald-400' : n === 2 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-lab-borde/25'}`} />)}</span>
      {txt}
    </span>
  )
}

type Proyecto = (typeof PREARMADOS)[number]
interface FichaProyecto { p: Proyecto; placa: string; piezas: number; aprende: string[] }

const INICIOS_ROBOT = [
  ['chasis-2wd', 'Chasis 2WD', 'Dos ruedas y rueda loca: gira fácil'],
  ['chasis-4wd', 'Chasis 4WD', 'Cuatro ruedas: más fuerza y tracción'],
  ['chasis-minisumo', 'Chasis minisumo', '10 × 10 cm con pala: para competir en el dohyo'],
] as const
const INICIOS_BANCO = [
  ['arduino-uno', 'Protoboard + Arduino UNO', 'Como en el kit de 8vo'],
  ['arduino-nano', 'Protoboard + Arduino Nano', 'La misma placa, más chiquita'],
  ['esp32-devkit', 'Protoboard + ESP32', 'Trabaja con 3,3 V'],
  ['raspberry-pico', 'Protoboard + Raspberry Pi Pico', 'RP2040, 3,3 V, en C++'],
  ['arduino-mega', 'Protoboard + Arduino Mega', '54 pines y 16 analógicas'],
] as const

function Galeria({ onAbrir, onMision, onCerrar }: { onAbrir: (d: RobotDoc, id: string | null) => void; onMision: (id: string) => void; onCerrar: () => void }) {
  const [categoria, setCategoria] = useState<'robot' | 'electronica'>('robot')
  const [placa, setPlaca] = useState<'todas' | PlacaGaleria>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [elegido, setElegido] = useState<string | null>(null)
  // En el celular la ficha tapa la lista; en pantallas anchas van lado a lado.
  const [verFicha, setVerFicha] = useState(false)

  const fichas = useMemo<FichaProyecto[]>(() => PREARMADOS.map(p => {
    const d = p.construir()
    const mcu = d.piezas.find(x => pieza(x.pieza).familia === 'placa')
    return { p, placa: mcu ? pieza(mcu.pieza).nombre : 'Sin placa', piezas: d.piezas.length, aprende: aprendizajes(d) }
  }), [])

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onCerrar])

  const q = busqueda.trim().toLowerCase()
  const deCategoria = fichas.filter(f => (f.p.categoria ?? 'robot') === categoria)
  const lista = deCategoria
    .filter(f => placa === 'todas' || placaDe(f.p.id) === placa)
    .filter(f => !q || `${f.p.nombre} ${f.p.descripcion} ${f.p.tema ?? ''} ${f.placa}`.toLowerCase().includes(q))
  const grupos = GRUPOS
    .map(g => ({ nombre: g, fichas: lista.filter(f => grupoDe(f.p.id) === g).sort((a, b) => ordenEnGrupo(a.p.id) - ordenEnGrupo(b.p.id)) }))
    .filter(g => g.fichas.length > 0)
  const actual = lista.find(f => f.p.id === elegido) ?? grupos[0]?.fichas[0] ?? null
  const Icono = categoria === 'robot' ? Bot : Lightbulb
  const cuenta = (id: 'todas' | PlacaGaleria) => deCategoria.filter(f => id === 'todas' || placaDe(f.p.id) === id).length

  const elegir = (id: string) => { setElegido(id); setVerFicha(true) }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" onClick={onCerrar}>
      <div className="lab-vidrio flex h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-lg sm:h-[86dvh] sm:rounded-lg" onClick={e => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="flex items-center gap-3 border-b border-lab-borde/20 px-4 py-3 sm:px-5">
          <h2 className="text-base font-semibold text-lab-tinta">Proyectos</h2>
          <div className="flex rounded-md bg-lab-fondo2 p-0.5 text-sm">
            {([['robot', 'Robots', Bot], ['electronica', 'Electrónica', Lightbulb]] as const).map(([id, txt, I]) => (
              <button key={id} onClick={() => { setCategoria(id); setPlaca('todas'); setElegido(null); setVerFicha(false) }} className={`flex items-center gap-1.5 rounded px-3 py-1 font-medium ${categoria === id ? 'bg-lab-superficie text-lab-tinta shadow-sm' : 'text-lab-suave hover:text-lab-tinta'}`}>
                <I className="h-4 w-4" /> {txt}
              </button>
            ))}
          </div>
          <button onClick={onCerrar} className="ml-auto rounded-md p-1.5 text-lab-suave hover:bg-lab-fondo2" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Lista */}
          <div className={`min-h-0 w-full flex-col border-lab-borde/20 md:flex md:w-[44%] md:border-r ${verFicha ? 'hidden' : 'flex'}`}>
            <div className="space-y-2.5 border-b border-lab-borde/20 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lab-tenue" />
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder={categoria === 'robot' ? 'Buscar: seguidor, sumo, aspiradora…' : 'Buscar: semáforo, LED, sensor…'} className="h-9 w-full rounded-md border border-lab-borde/30 bg-lab-superficie pl-8 pr-3 text-sm text-lab-tinta outline-none placeholder:text-lab-tenue focus:border-lab-acento focus:ring-1 focus:ring-lab-acento" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {([['todas', 'Todas'], ['arduino', 'Arduino'], ['esp32', 'ESP32'], ['pico', 'Pico'], ['mega', 'Mega']] as const).map(([id, txt]) => cuenta(id) > 0 && (
                  <button key={id} onClick={() => setPlaca(id)} aria-pressed={placa === id} className="lab-chip px-2.5 py-1 text-xs font-medium">
                    {txt} <span className="lab-chip-n">{cuenta(id)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {lista.length === 0 && <p className="p-4 text-sm text-lab-suave">No hay proyectos con ese filtro.</p>}
              {grupos.map(g => (
                <section key={g.nombre}>
                  <h3 className="lab-seccion sticky top-0 z-[1] border-b border-lab-borde/15 bg-lab-fondo px-4 py-1.5">{g.nombre} <span className="font-normal text-lab-tenue">· {g.fichas.length}</span></h3>
                  <ul>
                    {g.fichas.map((f, n) => {
                      const sel = actual?.p.id === f.p.id
                      return (
                        <li key={f.p.id}>
                          <button onClick={() => elegir(f.p.id)} onDoubleClick={() => onAbrir(f.p.construir(), f.p.id)} data-sel={sel} style={{ '--i': n } as React.CSSProperties} className="lab-fila relative flex w-full items-center gap-3 border-b border-lab-borde/10 px-4 py-2.5 text-left hover:bg-lab-fondo2/60">
                            {sel && <span className="lab-fila-marca absolute inset-y-0 left-0 w-[3px] bg-lab-acento" />}
                            <Miniatura nombre={`proyecto-${f.p.id}`} icono={Icono} className="h-16 w-24 shrink-0 rounded-md border border-lab-borde/20" />
                            <span className="min-w-0 flex-1">
                              <span className="lab-rotulo block truncate text-sm font-semibold text-lab-tinta">{f.p.nombre}</span>
                              <span className="mt-0.5 block truncate text-xs text-lab-tenue">{f.placa} · {f.piezas} piezas</span>
                              <span className="mt-1 block"><Nivel nivel={f.p.dificultad} /></span>
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-lab-tenue md:hidden" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
              {/* Empezar de cero */}
              <section>
                <h3 className="lab-seccion sticky top-0 z-[1] border-b border-lab-borde/15 bg-lab-fondo px-4 py-1.5">Empezar de cero</h3>
                <ul>
                  {(categoria === 'robot' ? INICIOS_ROBOT : INICIOS_BANCO).map(([id, n, d]) => (
                    <li key={id}>
                      <button
                        onClick={() => onAbrir(categoria === 'robot'
                          ? { ...robotVacio(id, id === 'chasis-minisumo' ? 'pla' : 'acrilico', 'Mi robot'), programa: { modo: 'bloques', bloques: PROGRAMA_VACIO, cpp: '' } }
                          : bancoVacio(id, 'Mi circuito'), null)}
                        className="flex w-full items-center gap-3 border-b border-lab-borde/10 px-4 py-2.5 text-left hover:bg-lab-fondo"
                      >
                        <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded border border-dashed border-lab-borde/40 text-lab-tenue"><Plus className="h-5 w-5" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-lab-tinta">{n}</span>
                          <span className="block truncate text-xs text-lab-tenue">{d}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Ficha del proyecto elegido */}
          {actual && (
            <div className={`min-h-0 flex-1 overflow-y-auto md:block ${verFicha ? 'block' : 'hidden'}`}>
              <div key={actual.p.id} className="lab-ficha mx-auto max-w-2xl p-4 sm:p-6">
                <button onClick={() => setVerFicha(false)} className="mb-3 flex items-center gap-1 text-sm text-lab-suave hover:text-lab-tinta md:hidden"><ArrowLeft className="h-4 w-4" /> Proyectos</button>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-lab-tenue">{grupoDe(actual.p.id)}</span>
                  {actual.p.kit && <span className="lab-etiqueta">{actual.p.kit}</span>}
                </div>
                <h3 className="mb-4 text-2xl font-bold tracking-tight text-lab-tinta">{actual.p.nombre}</h3>
                <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
                  <div className="lab-marco self-start"><Miniatura nombre={`proyecto-${actual.p.id}`} icono={Icono} className="aspect-[4/3] w-full" /></div>
                  <div className="flex flex-col">
                    <button onClick={() => onMision(actual.p.id)} className="lab-primario lab-b-coral flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold"><Target className="h-4 w-4" /> Hacer la misión guiada</button>
                    <p className="mt-2 text-xs leading-relaxed text-lab-tenue">Empiezas con la base vacía y lo construyes paso a paso: armar, conectar, programar y probar. El laboratorio revisa cada paso.</p>
                    <button onClick={() => onAbrir(actual.p.construir(), actual.p.id)} className="lab-secundario mt-3 h-9 w-full rounded-md text-sm font-medium">Abrir ya armado</button>
                    <p className="mt-1.5 text-xs leading-relaxed text-lab-tenue">Para explorarlo, modificarlo o mostrarlo en clase.</p>
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="lab-dato-caja col-span-2 px-2.5 py-1.5"><dt className="text-[10px] uppercase tracking-[0.1em] text-lab-tenue">Placa</dt><dd className="font-mono font-semibold text-lab-tinta">{actual.placa}</dd></div>
                      <div className="lab-dato-caja px-2.5 py-1.5"><dt className="text-[10px] uppercase tracking-[0.1em] text-lab-tenue">Piezas</dt><dd className="font-mono text-base font-semibold text-lab-dato">{actual.piezas}</dd></div>
                      <div className="lab-dato-caja px-2.5 py-1.5"><dt className="text-[10px] uppercase tracking-[0.1em] text-lab-tenue">Nivel</dt><dd className="pt-0.5"><Nivel nivel={actual.p.dificultad} /></dd></div>
                    </dl>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-lab-tinta2">{actual.p.descripcion}</p>
                {actual.p.tema && <p className="mt-1 text-xs text-lab-tenue">{actual.p.tema}</p>}
                <h4 className="mt-5 text-sm font-semibold text-lab-tinta">Cómo piensa</h4>
                <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-lab-tinta2">
                  {actual.p.logica.map((l, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-lab-suave ring-1 ring-lab-borde/40">{i + 1}</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ol>
                {actual.aprende.length > 0 && (<>
                  <h4 className="mt-5 text-sm font-semibold text-lab-tinta">Qué vas a aprender</h4>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-lab-tinta2">
                    {actual.aprende.map(a => (
                      <li key={a} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lab-acento" /><span>{a}</span></li>
                    ))}
                  </ul>
                </>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ListaMateriales({ doc, onCerrar }: { doc: RobotDoc; onCerrar: () => void }) {
  const filas = useMemo(() => {
    const mapa = new Map<string, { nombre: string; cantidad: number; masa: number; enKits: boolean }>()
    for (const p of doc.piezas) {
      const def = pieza(p.pieza)
      const v = datosVariante(def, p.variante)
      const k = `${p.pieza}/${p.variante ?? ''}`
      const f = mapa.get(k) ?? { nombre: v.nombre, cantidad: 0, masa: v.masa_g, enKits: !!def.enKits }
      f.cantidad++
      mapa.set(k, f)
    }
    return Array.from(mapa.values())
  }, [doc])
  const total = filas.reduce((s, f) => s + f.cantidad * f.masa, 0)
  return (
    <Modal titulo={`Lista de materiales · ${doc.nombre}`} onCerrar={onCerrar} ancho="max-w-xl">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-lab-suave"><tr><th className="py-1.5">Cant.</th><th>Pieza</th><th className="text-right">Peso</th></tr></thead>
        <tbody>
          {filas.map(f => (
            <tr key={f.nombre} className="border-t border-lab-borde/10">
              <td className="py-1.5 font-mono text-lab-tinta">{f.cantidad}×</td>
              <td className="text-lab-tinta">{f.nombre}{f.enKits && <span className="ml-2 rounded bg-chaski-primary/15 px-1 py-0.5 text-[9px] font-bold uppercase text-chaski-primary">En kits</span>}</td>
              <td className="text-right font-mono text-lab-suave">{(f.cantidad * f.masa).toFixed(0)} g</td>
            </tr>
          ))}
          <tr className="border-t border-lab-borde/15 font-semibold"><td /><td className="py-2 text-lab-tinta">Total</td><td className="text-right font-mono text-lab-tinta">{total.toFixed(0)} g</td></tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-lab-tenue">Más los cables Dupont: {doc.cables.length} conexiones.</p>
      <button onClick={() => window.print()} className="mt-4 flex items-center gap-2 rounded-lg border border-lab-borde/15 px-3 py-2 text-sm hover:bg-lab-tinta/[0.04]"><Printer className="h-4 w-4" /> Imprimir</button>
    </Modal>
  )
}
