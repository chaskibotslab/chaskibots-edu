'use client'

// Pestaña «Armar»: cajón de piezas, escena del taller y panel de la pieza
// elegida. Las piezas se arrastran desde el cajón y encastran en los puntos
// verdes (funciona con mouse y con el dedo); también se puede tocar una
// pieza del cajón y luego tocar el punto donde va.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  AlertTriangle, ChevronDown, ChevronUp, Expand, Info, Loader2, Package, RotateCw, Search, Shrink, Trash2, Undo2, Redo2, X, Cable as IconCable,
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
  const [cables, setCables] = useState(true)
  const [cajonAbierto, setCajonAbierto] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const lienzo = useRef<HTMLDivElement>(null)
  const posMarcadores = useRef(new Map<string, { x: number; y: number }>())

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

  return (
    <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ---------- Cajón de piezas ---------- */}
      <aside className={`order-2 lab-panel flex flex-col border-t border-lab-borde/20 lg:order-1 lg:w-80 lg:border-r lg:border-t-0 ${cajonAbierto ? 'max-h-[46vh] lg:max-h-none' : ''}`}>
        <div className="border-b border-lab-borde/20 px-3 pb-3 pt-3">
          <button onClick={() => setCajonAbierto(a => !a)} className="flex w-full items-center justify-between lg:pointer-events-none">
            <span className="lab-seccion">Piezas</span>
            <span className="text-lab-suave lg:hidden">{cajonAbierto ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</span>
          </button>
          {cajonAbierto && (<>
            <p className="mt-0.5 text-xs text-lab-tenue">Arrastra una pieza al {banco ? 'circuito' : 'robot'}, o tócala y elige dónde va.</p>
            <div className="relative mt-2.5">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lab-tenue" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar: LED, motor, sensor…" className="h-8 w-full rounded-md border border-lab-borde/30 bg-lab-superficie pl-8 pr-7 text-sm text-lab-tinta outline-none placeholder:text-lab-tenue focus:border-lab-acento focus:ring-1 focus:ring-lab-acento" />
              {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-lab-tenue hover:text-lab-tinta" aria-label="Borrar búsqueda"><X className="h-3.5 w-3.5" /></button>}
            </div>
            {!busqueda && (
              <label className="relative mt-2 block">
                <span className="sr-only">Qué piezas mostrar</span>
                <select value={familia} onChange={e => setFamilia(e.target.value as Familia | 'robot')} className="h-8 w-full appearance-none rounded-md border border-lab-borde/30 bg-lab-superficie pl-2.5 pr-8 text-sm text-lab-tinta outline-none focus:border-lab-acento focus:ring-1 focus:ring-lab-acento">
                  <option value="robot">{banco ? 'Puestas en el circuito' : 'Puestas en el robot'} ({doc.piezas.length - 1})</option>
                  {FAMILIAS.map(f => <option key={f.id} value={f.id}>{f.nombre} ({deFamilia(f.id).length})</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lab-tenue" />
              </label>
            )}
          </>)}
        </div>
        {cajonAbierto && (
          familia === 'robot' && !busqueda ? (
            // Piezas montadas: tocar = seleccionar; papelera = quitar (con lo que cuelga de ella).
            <ul className="min-h-0 flex-1 overflow-y-auto">
              {doc.piezas.filter(p => p.padre).map(p => (
                <li key={p.id} className={`flex items-center gap-2.5 border-b border-lab-borde/10 px-3 py-1.5 ${seleccion === p.id ? 'bg-lab-fondo2' : 'hover:bg-lab-fondo'}`}>
                  <button onClick={() => { setSeleccion(p.id); setElegida(null) }} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                    <Miniatura nombre={`pieza-${p.pieza}`} className="h-9 w-9 shrink-0 rounded border border-lab-borde/15" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-lab-tinta">{p.etiqueta}</span>
                      <span className="block truncate text-[11px] text-lab-tenue">{pieza(p.pieza).nombre}</span>
                    </span>
                  </button>
                  <button onClick={() => quitarPieza(p.id)} className="rounded p-1.5 text-lab-tenue hover:bg-red-50 hover:text-red-600" title={`Quitar ${p.etiqueta}`} aria-label={`Quitar ${p.etiqueta}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              <li className="px-3 py-2 text-[11px] leading-snug text-lab-tenue">Para cambiar la base, elige otra en «Chasis y bases». Ctrl+Z deshace.</li>
            </ul>
          ) : (
            <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto p-3 sm:grid-cols-4 lg:grid-cols-2">
              {visibles.length === 0 && <p className="col-span-full text-xs text-lab-suave">No hay piezas con «{busqueda}».</p>}
              {visibles.map(def => (
                <TarjetaPieza
                  key={def.id}
                  def={def}
                  elegida={elegida === def.id}
                  enUso={doc.piezas.some(x => x.pieza === def.id)}
                  onTocar={() => { if (!recienArrastrado.current) elegirPieza(def) }}
                  onArrastrar={(x, y) => {
                    if (!esBase(def)) setArrastre({ pieza: def.id, x, y, x0: x, y0: y, iniciado: false })
                  }}
                />
              ))}
            </div>
          )
        )}
      </aside>

      {/* ---------- Escena ---------- */}
      <div ref={lienzo} className="relative order-1 min-h-[280px] flex-1 touch-none lg:order-2">
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

        {/* Barra de herramientas */}
        <div className="absolute left-3 top-3 flex items-center gap-0.5 rounded-md border border-lab-borde/20 bg-lab-superficie p-1 shadow-sm">
          <BotonIcono titulo="Deshacer (Ctrl+Z)" onClick={p.deshacer} disabled={!p.puedeDeshacer}><Undo2 className="h-4 w-4" /></BotonIcono>
          <BotonIcono titulo="Rehacer (Ctrl+Y)" onClick={p.rehacer} disabled={!p.puedeRehacer}><Redo2 className="h-4 w-4" /></BotonIcono>
          <span aria-hidden className="mx-1 h-5 w-px bg-lab-borde/20" />
          <BotonIcono titulo={explosion ? 'Juntar piezas' : 'Vista explosionada'} onClick={() => setExplosion(e => !e)} activo={explosion}>{explosion ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}</BotonIcono>
          <BotonIcono titulo={cables ? 'Ocultar cables' : 'Mostrar cables'} onClick={() => setCables(c => !c)} activo={cables}><IconCable className="h-4 w-4" /></BotonIcono>
          <BotonIcono titulo="Lista de materiales" onClick={p.onListaMateriales}><Package className="h-4 w-4" /></BotonIcono>
        </div>

        {/* Datos en vivo */}
        <div className="pointer-events-none absolute right-3 top-3 hidden w-64 rounded-md border border-lab-borde/20 bg-lab-superficie/95 px-3 py-2.5 text-xs shadow-sm sm:block">
          <div className="lab-seccion mb-1.5">{banco ? 'Circuito' : 'Robot'}</div>
          <Dato k="Peso" v={`${res.masa_g.toFixed(0)} g`} />
          <Dato k="Medidas" v={`${(res.medidas.largo / 10).toFixed(1)} × ${(res.medidas.ancho / 10).toFixed(1)} × ${(res.medidas.alto / 10).toFixed(1)} cm`} />
          <Dato k="Centro de gravedad" v={`${Math.abs(res.cg.x).toFixed(0)} mm ${res.cg.x >= 0 ? 'adelante' : 'atrás'}`} />
          <Dato k="Piezas" v={String(res.piezas)} />
          {avisos.map((a, i) => (
            <div key={i} className="mt-2 flex gap-1.5 border-t border-lab-borde/15 pt-2 text-[11px] leading-snug text-amber-700"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {a}</div>
          ))}
        </div>

        {elegida && !arrastre?.iniciado && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md border border-lab-borde/20 bg-lab-superficie px-3 py-1.5 text-xs text-lab-tinta shadow-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            {marcadores.length ? <>Toca un punto verde para poner <b>{pieza(elegida).nombre}</b></> : <>No hay lugar libre para <b>{pieza(elegida).nombre}</b></>}
            <button onClick={() => setElegida(null)} className="rounded-full p-0.5 hover:bg-lab-tinta/[0.07]"><X className="h-3.5 w-3.5" /></button>
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

      {/* Pieza que se está arrastrando */}
      {arrastre?.iniciado && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-md border border-lab-acento bg-lab-superficie px-2.5 py-1.5 text-xs font-medium text-lab-tinta shadow-lg" style={{ left: arrastre.x, top: arrastre.y }}>
          {pieza(arrastre.pieza).nombre}
        </div>
      )}
    </div>
  )
}

function BotonIcono({ titulo, onClick, disabled, activo, children }: { titulo: string; onClick: () => void; disabled?: boolean; activo?: boolean; children: React.ReactNode }) {
  return (
    <button title={titulo} aria-label={titulo} aria-pressed={activo} onClick={onClick} disabled={disabled} className={`flex h-8 w-8 items-center justify-center rounded transition disabled:opacity-30 ${activo ? 'bg-lab-acento/10 text-lab-acento' : 'text-lab-tinta2 hover:bg-lab-fondo2'}`}>
      {children}
    </button>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2 py-0.5"><span className="text-lab-tenue">{k}</span><span className="text-right tabular-nums text-lab-tinta">{v}</span></div>
}

function TarjetaPieza({ def, elegida, enUso, onTocar, onArrastrar }: { def: PiezaDef; elegida: boolean; enUso: boolean; onTocar: () => void; onArrastrar: (x: number, y: number) => void }) {
  return (
    <button
      onClick={onTocar}
      onPointerDown={e => { if (e.button === 0 && !def.proximamente) onArrastrar(e.clientX, e.clientY) }}
      data-elegida={elegida}
      title={def.descripcion}
      className={`lab-tarjeta flex touch-none select-none flex-col p-1.5 text-left ${def.proximamente ? 'border-dashed opacity-60' : ''}`}
    >
      <Miniatura nombre={`pieza-${def.id}`} icono={Package} className="aspect-[4/3] w-full rounded-[3px]" />
      <span className="mt-1.5 line-clamp-2 min-h-[2rem] px-0.5 text-center text-xs font-medium leading-4 text-lab-tinta">{def.nombre}</span>
      <span className="mt-1 flex items-center justify-between gap-1 px-0.5">
        {def.proximamente ? <span className="lab-etiqueta">Pronto</span> : def.enKits ? <span className="lab-etiqueta">En kits</span> : <span />}
        <span className="flex items-center gap-1 text-[10px] tabular-nums text-lab-tenue">
          {enUso && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Ya está puesta" />}
          {def.masa_g} g
        </span>
      </span>
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
    <aside className="absolute inset-x-0 bottom-0 z-20 max-h-[60vh] overflow-y-auto rounded-t-lg border-t border-lab-borde/20 bg-lab-superficie p-4 shadow-2xl lg:static lab-panel lg:order-3 lg:max-h-none lg:w-80 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none">
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
