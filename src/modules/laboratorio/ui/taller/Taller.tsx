'use client'

// Laboratorio de Robótica (F2): taller con pestañas Armar · Cablear ·
// Programar · Probar. El robot es un RobotDoc (árbol de piezas + cables +
// programa); cada cambio de piezas recablea solo y se puede deshacer.
// El borrador se guarda en este navegador (en F3, en la cuenta).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Cable, Code2, Download, FileUp, FlaskConical, Hammer, LayoutGrid, Play, Printer, X } from 'lucide-react'
import { datosVariante, pieza } from '../../catalogo/piezas'
import { autocablear } from '../../engine/autocableado'
import { robotVacio, validar } from '../../engine/ensamblaje'
import type { RobotDoc } from '../../robots/doc'
import { PREARMADOS, construirSeguidor, plantillasGenericas } from '../../robots/prearmados'
import { calidadInicial, type NivelCalidad } from '../calidad'
import Armar from './Armar'
import Cablear from './Cablear'
import ProgramarProbar from './ProgramarProbar'

type Pestana = 'armar' | 'cablear' | 'programar' | 'probar'

const CLAVE_BORRADOR = 'chaskibots-lab:robot-v2'
const MAX_HISTORIAL = 80

interface Borrador { doc: RobotDoc; prearmado: string | null }

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

const conCables = (d: RobotDoc): RobotDoc => ({ ...d, cables: autocablear(d).cables })

export default function Taller() {
  const [doc, setDoc] = useState<RobotDoc | null>(null)
  const [prearmado, setPrearmado] = useState<string | null>(null)
  const [pasado, setPasado] = useState<RobotDoc[]>([])
  const [futuro, setFuturo] = useState<RobotDoc[]>([])
  const [pestana, setPestana] = useState<Pestana>('armar')
  const [galeria, setGaleria] = useState(false)
  const [materiales, setMateriales] = useState(false)
  const [nivel, setNivel] = useState<NivelCalidad>('media')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(null)
  const archivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setNivel(calidadInicial())
    const b = leerBorrador()
    if (b) { setDoc(b.doc); setPrearmado(b.prearmado) }
    else { setDoc(construirSeguidor()); setPrearmado('seguidor'); setGaleria(true) }
  }, [])

  // Guardar el borrador (con una pequeña espera para no escribir en cada tecla).
  useEffect(() => {
    if (!doc) return
    const t = setTimeout(() => guardarBorrador({ doc, prearmado }), 400)
    return () => clearTimeout(t)
  }, [doc, prearmado])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(t)
  }, [aviso])

  const avisar = useCallback((tipo: 'ok' | 'error' | 'info', texto: string) => setAviso({ tipo, texto }), [])

  const docActual = useRef<RobotDoc | null>(null)
  docActual.current = doc

  const cambiar = useCallback((d: RobotDoc, texto?: string) => {
    const actual = docActual.current
    if (actual) setPasado(p => [...p.slice(-MAX_HISTORIAL + 1), actual])
    setDoc(conCables(d))
    setFuturo([])
    if (texto) setAviso({ tipo: 'info', texto })
  }, [])

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

  // Ctrl+Z / Ctrl+Y en el taller
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (pestana !== 'armar' || !(e.ctrlKey || e.metaKey)) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); deshacer() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); rehacer() }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  })

  const abrir = (d: RobotDoc, id: string | null) => {
    setDoc(conCables(d))
    setPrearmado(id)
    setPasado([]); setFuturo([])
    setGaleria(false)
    setPestana('armar')
  }

  const plantillas = useMemo(() => {
    if (!doc) return []
    const { tabla } = autocablear(doc)
    const pre = PREARMADOS.find(p => p.id === prearmado)
    return pre ? pre.plantillas(doc, tabla) : plantillasGenericas(doc, tabla)
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

  if (!doc) return <div className="h-[calc(100dvh-4rem)] bg-labdark-void" />

  const pestanas: [Pestana, string, typeof Hammer][] = [
    ['armar', 'Armar', Hammer], ['cablear', 'Cablear', Cable], ['programar', 'Programar', Code2], ['probar', 'Probar', Play],
  ]
  const arenaInicial = PREARMADOS.find(p => p.id === prearmado)?.arena ?? (doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'ultrasonido') ? 'campo-libre' : 'ovalo')

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[560px] flex-col bg-labdark-void text-slate-200">
      {/* ---------- Encabezado ---------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-labdark-surface px-3 py-2">
        <div className="mr-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chaski-primary/15 text-chaski-primary"><FlaskConical className="h-4 w-4" /></div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold text-white">Laboratorio de Robótica</div>
            <div className="text-[11px] text-slate-400">Arma, cablea, programa y prueba</div>
          </div>
        </div>
        <input
          value={doc.nombre}
          onChange={e => setDoc({ ...doc, nombre: e.target.value.slice(0, 40) })}
          className="h-9 w-36 rounded-lg border border-white/10 bg-labdark-bg px-2 text-sm font-medium text-white outline-none focus:border-chaski-primary/50 sm:w-44"
          aria-label="Nombre del robot"
        />
        <nav className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {pestanas.map(([id, txt, Icon], i) => (
            <button key={id} onClick={() => setPestana(id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm ${pestana === id ? 'bg-chaski-primary text-white shadow-lg shadow-chaski-primary/20' : 'text-slate-300 hover:bg-white/5'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${pestana === id ? 'bg-white/20' : 'bg-white/10'}`}>{i + 1}</span>
              <Icon className="h-4 w-4" /> {txt}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setGaleria(true)} className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-labdark-bg px-3 text-sm hover:bg-white/5" title="Robots prearmados o empezar de cero">
            <LayoutGrid className="h-4 w-4" /> <span className="hidden md:inline">Robots</span>
          </button>
          <button onClick={exportar} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-labdark-bg hover:bg-white/5" title="Descargar proyecto (.json)"><Download className="h-4 w-4" /></button>
          <button onClick={() => archivo.current?.click()} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-labdark-bg hover:bg-white/5" title="Abrir proyecto (.json)"><FileUp className="h-4 w-4" /></button>
          <input ref={archivo} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = '' }} />
        </div>
      </div>

      {aviso && (
        <div className={`border-b px-4 py-1.5 text-xs ${aviso.tipo === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : aviso.tipo === 'ok' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-sky-500/30 bg-sky-500/10 text-sky-300'}`}>
          {aviso.texto}
        </div>
      )}

      {/* ---------- Contenido ---------- */}
      {pestana === 'armar' && (
        <Armar
          doc={doc} cambiar={cambiar} deshacer={deshacer} rehacer={rehacer}
          puedeDeshacer={pasado.length > 0} puedeRehacer={futuro.length > 0}
          nivel={nivel} onNivel={setNivel} avisar={avisar} onListaMateriales={() => setMateriales(true)}
        />
      )}
      {pestana === 'cablear' && <Cablear doc={doc} />}
      {(pestana === 'programar' || pestana === 'probar') && (
        <ProgramarProbar
          doc={doc}
          vista={pestana}
          arenaInicial={arenaInicial}
          plantillas={plantillas}
          onCodigo={cpp => setDoc(d => (d ? { ...d, programa: { modo: 'codigo', cpp } } : d))}
          nivel={nivel}
          onNivel={setNivel}
        />
      )}

      {galeria && <Galeria onAbrir={abrir} onCerrar={() => setGaleria(false)} />}
      {materiales && <ListaMateriales doc={doc} onCerrar={() => setMateriales(false)} />}
    </div>
  )
}

// ---------------------------------------------------------------------------

function Modal({ titulo, onCerrar, children, ancho = 'max-w-3xl' }: { titulo: string; onCerrar: () => void; children: React.ReactNode; ancho?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onCerrar}>
      <div className={`max-h-[90dvh] w-full ${ancho} overflow-y-auto rounded-t-2xl border border-white/10 bg-labdark-surface p-4 shadow-2xl sm:rounded-2xl sm:p-6`} onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">{titulo}</h2>
          <button onClick={onCerrar} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const DIFICULTAD = { inicial: 'bg-emerald-500/15 text-emerald-300', intermedio: 'bg-amber-500/15 text-amber-300', avanzado: 'bg-red-500/15 text-red-300' }

function Galeria({ onAbrir, onCerrar }: { onAbrir: (d: RobotDoc, id: string | null) => void; onCerrar: () => void }) {
  return (
    <Modal titulo="¿Con qué robot empezamos?" onCerrar={onCerrar}>
      <div className="grid gap-3 sm:grid-cols-2">
        {PREARMADOS.map(p => (
          <button key={p.id} onClick={() => onAbrir(p.construir(), p.id)} className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-chaski-primary/50 hover:bg-chaski-primary/5">
            <div className="mb-2 flex items-center justify-between">
              <Bot className="h-6 w-6 text-chaski-primary" />
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${DIFICULTAD[p.dificultad]}`}>{p.dificultad}</span>
            </div>
            <div className="font-semibold text-white">{p.nombre}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{p.descripcion}</p>
            <div className="mt-3 text-xs font-medium text-chaski-primary group-hover:underline">Abrir y modificar →</div>
          </button>
        ))}
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-2 text-sm font-semibold text-white">Empezar desde cero</div>
        <p className="mb-3 text-xs text-slate-400">Elige el chasis; después arrastra las piezas desde el cajón.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[['chasis-2wd', 'Chasis 2WD', 'Dos ruedas y rueda loca: gira fácil'], ['chasis-4wd', 'Chasis 4WD', 'Cuatro ruedas: más fuerza y tracción']].map(([id, n, d]) => (
            <button key={id} onClick={() => onAbrir(robotVacio(id, 'acrilico', 'Mi robot'), null)} className="rounded-xl border border-dashed border-white/20 p-3 text-left hover:border-chaski-primary/50 hover:bg-white/[0.03]">
              <div className="text-sm font-semibold text-white">{n}</div>
              <div className="text-xs text-slate-400">{d}</div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
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
        <thead className="text-left text-xs text-slate-400"><tr><th className="py-1.5">Cant.</th><th>Pieza</th><th className="text-right">Peso</th></tr></thead>
        <tbody>
          {filas.map(f => (
            <tr key={f.nombre} className="border-t border-white/5">
              <td className="py-1.5 font-mono text-white">{f.cantidad}×</td>
              <td className="text-slate-200">{f.nombre}{f.enKits && <span className="ml-2 rounded bg-chaski-primary/15 px-1 py-0.5 text-[9px] font-bold uppercase text-chaski-primary">En kits</span>}</td>
              <td className="text-right font-mono text-slate-400">{(f.cantidad * f.masa).toFixed(0)} g</td>
            </tr>
          ))}
          <tr className="border-t border-white/10 font-semibold"><td /><td className="py-2 text-white">Total</td><td className="text-right font-mono text-white">{total.toFixed(0)} g</td></tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500">Más los cables Dupont: {doc.cables.length} conexiones.</p>
      <button onClick={() => window.print()} className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><Printer className="h-4 w-4" /> Imprimir</button>
    </Modal>
  )
}
