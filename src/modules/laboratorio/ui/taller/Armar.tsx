'use client'

// Pestaña «Armar»: cajón de piezas, escena del taller y panel de la pieza
// elegida. Las piezas se arrastran desde el cajón y encastran en los puntos
// verdes (funciona con mouse y con el dedo); también se puede tocar una
// pieza del cajón y luego tocar el punto donde va.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  AlertTriangle, Armchair, ChevronDown, ChevronUp, Expand, Info, Loader2, Package, RotateCw, Search, Shrink, Trash2, Undo2, Redo2, X, Cable as IconCable, CircuitBoard,
} from 'lucide-react'
import Miniatura from './Miniatura'
import { FAMILIAS, type Familia, type PiezaDef } from '../../catalogo/tipos'
import { LISTA_PIEZAS, datosVariante, pieza, piezasDe } from '../../catalogo/piezas'
import {
  avisosEnsamblaje, descendientes, esBanco, encastrar, girar, montajeDe, montajesLibres, motivoNoEncastra, quitar, reemplazar, resumen, cambiarVariante,
} from '../../engine/ensamblaje'
import type { RobotDoc } from '../../robots/doc'
import { CREDITOS_MODELOS } from '../../catalogo/creditosModelos'
import type { MarcadorMontaje } from '../Robot3D'
import type { NivelCalidad } from '../calidad'
import { useAmbiente } from '../ambiente'

const EscenaTaller = dynamic(() => import('../Escena3D').then(m => m.EscenaTaller), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center gap-2 text-sm text-lab-suave"><Loader2 className="h-5 w-5 animate-spin" /> Preparando el taller…</div>,
})

interface Props {
  doc: RobotDoc
  cambiar: (d: RobotDoc, texto?: string) => void
  deshacer: () => void
  rehacer: () => void
  puedeDeshacer: boolean
  puedeRehacer: boolean
  nivel: NivelCalidad
  onNivel: (n: NivelCalidad) => void
  avisar: (tipo: 'ok' | 'error' | 'info', texto: string) => void
  onListaMateriales: () => void
  /** Pedido de la misión guiada: buscar esta pieza en el cajón (`n` cambia en cada pedido). */
  buscar?: { texto: string; n: number } | null
}

/** En la mesa, la pila de 9 V y el joystick también aparecen en «Componentes». */
const EXTRAS_MESA = [pieza('bateria-9v'), pieza('joystick')]

/** Base del robot (chasis o protoboard): se cambia, no se encastra. El «piso de arriba» es de la familia pero se encastra. */
const esBase = (def: PiezaDef) => def.familia === 'chasis' && !def.encaja.length

export default function Armar(p: Props) {
  const { doc, cambiar, avisar } = p
  const banco = esBanco(doc)
  const [familia, setFamilia] = useState<Familia | 'robot'>(banco ? 'circuito' : 'movimiento')
  // Al abrir otro proyecto, el cajón se abre en lo que más se usa: componentes o motores.
  useEffect(() => { setFamilia(f => (f === 'robot' ? f : banco ? 'circuito' : f === 'circuito' ? 'movimiento' : f)) }, [banco])
  const [elegida, setElegida] = useState<string | null>(null)
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [arrastre, setArrastre] = useState<{ pieza: string; x: number; y: number; x0: number; y0: number; iniciado: boolean } | null>(null)
  // Al soltar sobre la tarjeta, el navegador puede disparar un clic: se ignora.
  const recienArrastrado = useRef(false)
  const [activo, setActivo] = useState<string | null>(null)
  const [explosion, setExplosion] = useState(false)
  const [ambiente, setAmbiente] = useAmbiente()
  const [cables, setCables] = useState(true)
  const [cajonAbierto, setCajonAbierto] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  useEffect(() => { if (p.buscar) { setBusqueda(p.buscar.texto); setCajonAbierto(true) } }, [p.buscar]) // eslint-disable-line react-hooks/exhaustive-deps
  const lienzo = useRef<HTMLDivElement>(null)
  const posMarcadores = useRef(new Map<string, { x: number; y: number }>())
  const tira = useRef<HTMLDivElement>(null)

  // Si la pieza seleccionada desaparece (deshacer, quitar), se limpia la selección.
  useEffect(() => { if (seleccion && !doc.piezas.some(x => x.id === seleccion)) setSeleccion(null) }, [doc, seleccion])

  // Quita una pieza montada (y lo que cuelga de ella, avisando antes). El chasis no se quita.
  const quitarPieza = useCallback((id: string) => {
    const inst = doc.piezas.find(x => x.id === id)
    if (!inst?.padre) return
    const colgando = descendientes(doc, id).length - 1
    if (colgando > 0 && !window.confirm(`También se quitarán ${colgando} pieza${colgando > 1 ? 's' : ''} que van montadas en ${inst.etiqueta}. ¿Seguir?`)) return
    cambiar(quitar(doc, id), `Quitar ${inst.etiqueta}`)
  }, [doc, cambiar])

  // Supr / Retroceso quita la pieza seleccionada (salvo si se está escribiendo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!seleccion || (e.key !== 'Delete' && e.key !== 'Backspace')) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      e.preventDefault()
      quitarPieza(seleccion)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seleccion, quitarPieza])

  const marcadores = useMemo<MarcadorMontaje[]>(() => {
    if (!elegida) return []
    return montajesLibres(doc)
      .filter(m => motivoNoEncastra(doc, elegida, m.instancia, m.montaje.id) === null)
      .map(m => ({ clave: `${m.instancia}/${m.montaje.id}`, instancia: m.instancia, montaje: m.montaje }))
  }, [doc, elegida])

  const poner = useCallback((piezaId: string, mk: MarcadorMontaje) => {
    try {
      const r = encastrar(doc, piezaId, mk.instancia, mk.montaje.id)
      cambiar(r.doc, `${pieza(piezaId).nombre} → ${mk.montaje.nombre}`)
      setSeleccion(r.id)
      setElegida(null)
      setActivo(null)
    } catch (e) {
      avisar('error', (e as Error).message)
    }
  }, [doc, cambiar, avisar])

  const elegirPieza = (def: PiezaDef) => {
    if (def.proximamente) { avisar('info', `${def.nombre}: ${def.proximamente}`); return }
    if (esBase(def)) {
      const raiz = doc.piezas.find(x => !x.padre)!
      if (raiz.pieza === def.id) { setSeleccion(raiz.id); return }
      const { doc: d, quitadas } = reemplazar(doc, raiz.id, def.id)
      if (quitadas.length && !window.confirm(`El ${def.nombre} no tiene lugar para: ${quitadas.join(', ')}. ¿Cambiar igual?`)) return
      cambiar(d, `Chasis → ${def.nombre}`)
      setSeleccion(raiz.id)
      return
    }
    setSeleccion(null)
    setElegida(e => (e === def.id ? null : def.id))
  }

  // ---------- Arrastrar desde el cajón ----------
  const masCercano = useCallback((x: number, y: number) => {
    const r = lienzo.current?.getBoundingClientRect()
    if (!r) return null
    let mejor: string | null = null, dMin = 70
    posMarcadores.current.forEach((pos, clave) => {
      const d = Math.hypot(r.left + pos.x - x, r.top + pos.y - y)
      if (d < dMin) { dMin = d; mejor = clave }
    })
    return mejor
  }, [])

  useEffect(() => {
    if (!arrastre) return
    const mover = (e: PointerEvent) => {
      const iniciado = arrastre.iniciado || Math.hypot(e.clientX - arrastre.x0, e.clientY - arrastre.y0) > 10
      if (iniciado && !arrastre.iniciado) { setSeleccion(null); setElegida(arrastre.pieza) }
      setArrastre(a => (a ? { ...a, x: e.clientX, y: e.clientY, iniciado } : a))
      if (iniciado) setActivo(masCercano(e.clientX, e.clientY))
    }
    const soltar = (e: PointerEvent) => {
      if (arrastre.iniciado) {
        recienArrastrado.current = true
        setTimeout(() => { recienArrastrado.current = false }, 300)
        const clave = masCercano(e.clientX, e.clientY)
        const mk = marcadores.find(m => m.clave === clave)
        if (mk) poner(arrastre.pieza, mk)
        else setElegida(null)
      }
      setArrastre(null)
      setActivo(null)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
    }
  }, [arrastre, marcadores, masCercano, poner])

  const res = useMemo(() => resumen(doc), [doc])
  // Lo que ofrece el cajón: en la mesa, la pila de 9 V y el joystick también van en «Componentes».
  const deFamilia = (f: Familia) => [...piezasDe(f), ...(banco && f === 'circuito' ? EXTRAS_MESA : [])].sort((a, b) => Number(!!b.enKits) - Number(!!a.enKits))
  const q = busqueda.trim().toLowerCase()
  const visibles = q
    ? LISTA_PIEZAS.filter(d => `${d.nombre} ${d.descripcion}`.toLowerCase().includes(q))
    : familia === 'robot' ? [] : deFamilia(familia)
  const avisos = useMemo(() => avisosEnsamblaje(doc), [doc])
  const sel = seleccion ? doc.piezas.find(x => x.id === seleccion) ?? null : null

  const familias: [Familia | 'robot', string, number][] = [
    ['robot', 'Puestas', doc.piezas.length - 1],
    ...FAMILIAS.map(f => [f.id, f.nombre, deFamilia(f.id).length] as [Familia, string, number]),
  ]

  return (
    <div className="relative flex min-h-0 flex-1">
      {/* ---------- Escena: ocupa toda la pantalla ---------- */}
      <div ref={lienzo} className="absolute inset-0 touch-none">
        <EscenaTaller
          doc={doc}
          seleccion={seleccion}
          onSeleccionar={id => { setSeleccion(id); if (id) setElegida(null) }}
          marcadores={marcadores}
          marcadorActivo={activo}
          onMarcador={mk => elegida && poner(elegida, mk)}
          posMarcadores={posMarcadores}
          explosion={explosion ? 0.9 : 0}
          cables={cables}
          nivel={p.nivel}
          onNivel={p.onNivel}
        />
      </div>

      {/* ---------- Herramientas (isla flotante) ---------- */}
      <div className="lab-isla absolute left-3 top-[var(--lab-arriba)] z-10 flex h-11 items-center gap-0.5 px-1.5">
        <BotonIcono titulo="Deshacer (Ctrl+Z)" onClick={p.deshacer} disabled={!p.puedeDeshacer}><Undo2 className="h-4 w-4" /></BotonIcono>
        <BotonIcono titulo="Rehacer (Ctrl+Y)" onClick={p.rehacer} disabled={!p.puedeRehacer}><Redo2 className="h-4 w-4" /></BotonIcono>
        <span aria-hidden className="mx-1 h-5 w-px bg-lab-borde/20" />
        <BotonIcono titulo={explosion ? 'Juntar piezas' : 'Vista explosionada'} texto="Separar" onClick={() => setExplosion(e => !e)} activo={explosion}>{explosion ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}</BotonIcono>
        <BotonIcono titulo={cables ? 'Ocultar cables' : 'Mostrar cables'} texto="Cables" onClick={() => setCables(c => !c)} activo={cables}><IconCable className="h-4 w-4" /></BotonIcono>
        {!banco && (
          <BotonIcono
            titulo={doc.conexion === 'pcb' ? 'Conexiones con PCB (toca para volver a los cables sueltos)' : 'Usar una PCB en lugar de cables sueltos'}
            onClick={() => cambiar({ ...doc, conexion: doc.conexion === 'pcb' ? 'cables' : 'pcb' }, doc.conexion === 'pcb' ? 'Conexiones con cables sueltos' : 'Conexiones con PCB: las mismas conexiones, en pistas y mazos ordenados')}
            activo={doc.conexion === 'pcb'} texto="PCB"
          ><CircuitBoard className="h-4 w-4" /></BotonIcono>
        )}
        <BotonIcono titulo="Lista de materiales" texto="Materiales" onClick={p.onListaMateriales}><Package className="h-4 w-4" /></BotonIcono>
        <span aria-hidden className="mx-1 h-5 w-px bg-lab-borde/20" />
        <BotonIcono titulo={ambiente === 'taller' ? 'Fondo: mesa del aula (toca para el fondo de estudio)' : 'Fondo: estudio (toca para ver la mesa del aula)'} texto="Aula" onClick={() => setAmbiente(ambiente === 'taller' ? 'estudio' : 'taller')} activo={ambiente === 'taller'}><Armchair className="h-4 w-4" /></BotonIcono>
      </div>

      {/* ---------- Datos en vivo ---------- */}
      {!sel && (
        <div className="lab-vidrio pointer-events-none absolute right-3 top-[var(--lab-arriba)] hidden w-64 px-4 py-3 text-xs lg:block">
          <div className="lab-seccion mb-1.5">{banco ? 'Circuito' : 'Robot'}</div>
          <Dato k="Peso" v={`${res.masa_g.toFixed(0)} g`} />
          <Dato k="Medidas" v={`${(res.medidas.largo / 10).toFixed(1)} × ${(res.medidas.ancho / 10).toFixed(1)} × ${(res.medidas.alto / 10).toFixed(1)} cm`} />
          <Dato k="Centro de gravedad" v={`${Math.abs(res.cg.x).toFixed(0)} mm ${res.cg.x >= 0 ? 'adelante' : 'atrás'}`} />
          <Dato k="Piezas" v={String(res.piezas)} />
          {avisos.map((a, i) => (
            <div key={i} className="mt-2 flex gap-1.5 border-t border-lab-borde/15 pt-2 text-[11px] leading-snug text-amber-700"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {a}</div>
          ))}
        </div>
      )}

      {elegida && !arrastre?.iniciado && (
        <div className="lab-vidrio lab-aviso-punto absolute bottom-[12.5rem] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap px-4 py-2 text-xs font-medium text-lab-tinta">
          <i className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
          {marcadores.length ? <span>Toca un punto verde para poner <b>{pieza(elegida).nombre}</b></span> : <span>No hay lugar libre para <b>{pieza(elegida).nombre}</b></span>}
          <button onClick={() => setElegida(null)} className="lab-boton-icono p-1" aria-label="Cancelar"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ---------- Repisa de piezas: una tira al pie, como el dock ---------- */}
      <div className="lab-dock absolute inset-x-3 bottom-3 z-10 mx-auto max-w-6xl" onWheel={e => { if (tira.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) tira.current.scrollLeft += e.deltaY }}>
        <div className="lab-dock-fondo" />
        <div className={`relative flex h-[42px] items-center gap-2 px-3 pt-1 ${cajonAbierto ? '' : 'mb-1'}`}>
          <div className="relative w-36 shrink-0 sm:w-44">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-lab-tenue" />
            <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setCajonAbierto(true) }} placeholder="Buscar pieza…" aria-label="Buscar pieza" className="h-8 w-full rounded-full bg-[rgb(118_124_140/0.14)] pl-8 pr-7 text-xs text-lab-tinta outline-none placeholder:text-lab-tenue focus:ring-2 focus:ring-lab-acento/50" />
            {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-lab-tenue hover:text-lab-tinta" aria-label="Borrar búsqueda"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <div className="lab-sin-barra flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto" role="group" aria-label="Qué piezas mostrar">
            {familias.map(([id, nombre, n]) => (
              <button key={id} onClick={() => { setFamilia(id); setBusqueda(''); setCajonAbierto(true) }} aria-pressed={!q && familia === id} className="lab-chip shrink-0 px-3 py-1.5 text-xs font-semibold">
                {nombre} <span className="lab-chip-n">{n}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setCajonAbierto(a => !a)} className="lab-boton-icono flex h-8 w-8 shrink-0 items-center justify-center" title={cajonAbierto ? 'Esconder las piezas' : 'Mostrar las piezas'} aria-label={cajonAbierto ? 'Esconder las piezas' : 'Mostrar las piezas'} aria-expanded={cajonAbierto}>
            {cajonAbierto ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
        {cajonAbierto && (
          <div ref={tira} key={q ? 'busqueda' : familia} className="lab-dock-tira lab-sin-barra relative">
            {familia === 'robot' && !q ? (<>
              {doc.piezas.filter(x => x.padre).map((x, i) => (
                <button key={x.id} onClick={() => { setSeleccion(x.id); setElegida(null) }} data-elegida={seleccion === x.id} style={{ '--i': i } as React.CSSProperties} title={`${x.etiqueta} · ${pieza(x.pieza).nombre}`} className="lab-dock-item text-left">
                  <Miniatura nombre={`pieza-${x.pieza}`} icono={Package} className="aspect-square w-full rounded-[13px]" />
                  <span className="mt-1 block h-6 overflow-hidden px-0.5 text-center text-[10px] font-semibold leading-3 text-lab-tinta">{x.etiqueta}</span>
                </button>
              ))}
              {doc.piezas.length < 2 && <p className="pointer-events-auto px-2 pb-6 text-xs text-lab-suave">Todavía no hay piezas puestas. Elige un grupo y arrastra una pieza al {banco ? 'circuito' : 'robot'}.</p>}
            </>) : (<>
              {visibles.length === 0 && <p className="pointer-events-auto px-2 pb-6 text-xs text-lab-suave">No hay piezas con «{busqueda}».</p>}
              {visibles.map((def, i) => (
                <TarjetaPieza
                  key={def.id}
                  def={def}
                  i={i}
                  elegida={elegida === def.id}
                  enUso={doc.piezas.some(x => x.pieza === def.id)}
                  onTocar={() => { if (!recienArrastrado.current) elegirPieza(def) }}
                  onArrastrar={(x, y) => {
                    if (!esBase(def)) setArrastre({ pieza: def.id, x, y, x0: x, y0: y, iniciado: false })
                  }}
                />
              ))}
            </>)}
          </div>
        )}
      </div>

      {/* ---------- Pieza seleccionada ---------- */}
      {sel && (
        <PanelPieza
          doc={doc}
          id={sel.id}
          onCerrar={() => setSeleccion(null)}
          cambiar={cambiar}
          avisar={avisar}
        />
      )}

      {/* Pieza que se está arrastrando: su foto sigue al cursor. */}
      {arrastre?.iniciado && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2" style={{ left: arrastre.x, top: arrastre.y }}>
          <div className="lab-vidrio flex w-24 rotate-[-4deg] flex-col items-center p-1.5">
            <Miniatura nombre={`pieza-${arrastre.pieza}`} icono={Package} className="aspect-square w-full rounded-[16px]" />
            <span className="mt-1 max-w-full truncate text-[10px] font-semibold text-lab-tinta">{pieza(arrastre.pieza).nombre}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function BotonIcono({ titulo, texto, onClick, disabled, activo, children }: { titulo: string; /** Rótulo corto junto al icono (en pantallas anchas). */ texto?: string; onClick: () => void; disabled?: boolean; activo?: boolean; children: React.ReactNode }) {
  return (
    <button title={titulo} aria-label={titulo} aria-pressed={activo} onClick={onClick} disabled={disabled} className={`lab-boton-icono flex h-8 items-center justify-center gap-1.5 text-xs font-semibold disabled:opacity-30 ${texto ? 'w-8 xl:w-auto xl:px-2.5' : 'w-8'}`}>
      {children}
      {texto && <span className="hidden xl:inline">{texto}</span>}
    </button>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2 py-0.5"><span className="text-lab-tenue">{k}</span><span className="text-right font-medium tabular-nums text-lab-tinta">{v}</span></div>
}

function TarjetaPieza({ def, i, elegida, enUso, onTocar, onArrastrar }: { def: PiezaDef; i: number; elegida: boolean; enUso: boolean; onTocar: () => void; onArrastrar: (x: number, y: number) => void }) {
  return (
    <button
      onClick={onTocar}
      onPointerDown={e => { if (e.button === 0 && !def.proximamente) onArrastrar(e.clientX, e.clientY) }}
      data-elegida={elegida}
      style={{ '--i': i } as React.CSSProperties}
      title={`${def.nombre} · ${def.masa_g} g\n${def.proximamente ? `Pronto: ${def.proximamente}` : def.descripcion}`}
      className={`lab-dock-item text-left ${def.proximamente ? 'opacity-55' : ''}`}
    >
      <span className="relative block">
        <Miniatura nombre={`pieza-${def.id}`} icono={Package} className="aspect-square w-full rounded-[13px]" />
        {enUso && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Ya está puesta" />}
        {def.enKits && <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1 text-[7px] font-bold uppercase leading-[11px] tracking-wide text-lab-acento">Kit</span>}
      </span>
      <span className="mt-1 block h-6 overflow-hidden px-0.5 text-center text-[10px] font-semibold leading-3 text-lab-tinta">{def.nombre}</span>
    </button>
  )
}

function PanelPieza({ doc, id, onCerrar, cambiar, avisar }: { doc: RobotDoc; id: string; onCerrar: () => void; cambiar: (d: RobotDoc, t?: string) => void; avisar: (t: 'ok' | 'error' | 'info', s: string) => void }) {
  const inst = doc.piezas.find(x => x.id === id)!
  const def = pieza(inst.pieza)
  const mt = montajeDe(doc, inst)
  const v = datosVariante(def, inst.variante)
  const alternativas = LISTA_PIEZAS.filter(x => x.id !== def.id && !x.proximamente && (mt ? x.encaja.includes(mt.tipo) : esBase(x)))
  const colgando = descendientes(doc, id).length - 1
  const credito = def.glb ? CREDITOS_MODELOS[def.glb.split('/').pop()!] : undefined

  const reemplazarPor = (nueva: string) => {
    try {
      const { doc: d, quitadas } = reemplazar(doc, id, nueva)
      if (quitadas.length && !window.confirm(`Se quitarán: ${quitadas.join(', ')}. ¿Seguir?`)) return
      cambiar(d, `${def.nombre} → ${pieza(nueva).nombre}`)
    } catch (e) { avisar('error', (e as Error).message) }
  }

  return (
    <aside className="lab-vidrio absolute inset-x-0 bottom-0 z-30 max-h-[60vh] overflow-y-auto p-4 lg:inset-x-auto lg:bottom-auto lg:right-3 lg:top-[var(--lab-arriba)] lg:max-h-[calc(100dvh-var(--lab-arriba)-13rem)] lg:w-80">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="lab-seccion">{inst.etiqueta}</div>
          <h3 className="mt-0.5 text-base font-semibold text-lab-tinta">{v.nombre}</h3>
        </div>
        <button onClick={onCerrar} className="rounded-md p-1 text-lab-suave hover:bg-lab-fondo2" aria-label="Cerrar"><X className="h-4 w-4" /></button>
      </div>
      <Miniatura nombre={`pieza-${def.id}`} icono={Package} className="mb-3 aspect-[16/10] w-full rounded-md border border-lab-borde/15" />
      <p className="mb-2 text-xs leading-relaxed text-lab-tinta2">{def.descripcion}</p>
      {def.enKits && <div className="mb-2"><span className="lab-etiqueta">Viene en los kits ChaskiBots</span></div>}
      {credito && (
        <p className="mb-2 text-[10px] leading-snug text-lab-tenue">
          Modelo 3D: <a href={credito.fuente} target="_blank" rel="noreferrer" className="underline hover:text-lab-tinta2">«{credito.titulo}»</a> de {credito.autor.replace(/ (.*)$/, '')} · {credito.licencia.replace(/ (.*)$/, '')}
        </p>
      )}

      {def.datos && (
        <table className="mb-3 w-full text-xs">
          <tbody>
            {[['Peso', `${v.masa_g} g`] as [string, string], ...def.datos].map(([k, val]) => (
              <tr key={k} className="border-b border-lab-borde/10"><td className="py-1 pr-2 text-lab-suave">{k}</td><td className="py-1 text-right text-lab-tinta">{val}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {def.variantes && (
        <div className="mb-3">
          <div className="lab-seccion mb-1.5">Material</div>
          <div className="grid grid-cols-2 gap-1.5">
            {def.variantes.map(x => (
              <button key={x.id} onClick={() => cambiar(cambiarVariante(doc, id, x.id), `Material: ${x.nombre}`)} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11px] ${(inst.variante ?? def.variantes![0].id) === x.id ? 'border-lab-acento/60 bg-lab-acento/10 text-lab-tinta' : 'border-lab-borde/15 text-lab-tinta2 hover:bg-lab-tinta/[0.04]'}`}>
                <span className="h-3 w-3 shrink-0 rounded-full border border-lab-borde/25" style={{ background: x.color }} />
                <span>{x.nombre}<span className="block text-lab-tenue">{x.masa_g} g</span></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {alternativas.length > 0 && (
        <div className="mb-3">
          <div className="lab-seccion mb-1.5">Cambiar por</div>
          <div className="flex flex-col gap-1">
            {alternativas.map(a => (
              <button key={a.id} onClick={() => reemplazarPor(a.id)} className="flex items-center justify-between rounded-lg border border-lab-borde/15 px-2 py-1.5 text-left text-xs text-lab-tinta hover:bg-lab-tinta/[0.04]">
                <span>{a.nombre}</span><span className="text-[10px] text-lab-tenue">{a.masa_g} g</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {mt?.rotacionesPermitidas && mt.rotacionesPermitidas.length > 1 && (
          <button onClick={() => cambiar(girar(doc, id), `Girar ${inst.etiqueta}`)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-lab-borde/30 py-2 text-xs hover:bg-lab-fondo2"><RotateCw className="h-3.5 w-3.5" /> Girar</button>
        )}
        {inst.padre && (
          <button
            onClick={() => {
              if (colgando > 0 && !window.confirm(`También se quitarán ${colgando} pieza${colgando > 1 ? 's' : ''} que van montadas en ${inst.etiqueta}. ¿Seguir?`)) return
              cambiar(quitar(doc, id), `Quitar ${inst.etiqueta}`)
              onCerrar()
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-300 py-2 text-xs text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Quitar
          </button>
        )}
      </div>
      {!inst.padre && <p className="mt-2 flex gap-1 text-[11px] text-lab-tenue"><Info className="h-3 w-3 shrink-0" /> El chasis es la base: se cambia, no se quita.</p>}
    </aside>
  )
}
