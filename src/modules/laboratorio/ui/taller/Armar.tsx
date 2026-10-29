'use client'

// Pestaña «Armar»: cajón de piezas, escena del taller y panel de la pieza
// elegida. Las piezas se arrastran desde el cajón y encastran en los puntos
// verdes (funciona con mouse y con el dedo); también se puede tocar una
// pieza del cajón y luego tocar el punto donde va.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  AlertTriangle, Boxes, ChevronDown, ChevronUp, Expand, Info, Loader2, Package, RotateCw, Scale, Shrink, Trash2, Undo2, Redo2, X, Cable as IconCable,
} from 'lucide-react'
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
  loading: () => <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /> Preparando el taller…</div>,
})

const ICONO_FAMILIA: Record<Familia, string> = { chasis: '🛠️', placa: '🧠', movimiento: '⚙️', servo: '🦾', sensor: '👁️', electronica: '🔋', circuito: '💡' }

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
    if (def.familia === 'chasis') {
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
  const avisos = useMemo(() => avisosEnsamblaje(doc), [doc])
  const sel = seleccion ? doc.piezas.find(x => x.id === seleccion) ?? null : null

  return (
    <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ---------- Cajón de piezas ---------- */}
      <aside className={`order-2 lab-panel flex flex-col border-lab-borde/15 lg:order-1 lg:w-72 lg:border-r ${cajonAbierto ? 'max-h-[44vh] lg:max-h-none' : ''}`}>
        <button onClick={() => setCajonAbierto(a => !a)} className="flex items-center justify-between border-b border-lab-borde/15 px-3 py-2 text-sm font-semibold text-white lg:pointer-events-none">
          <span className="flex items-center gap-2"><span className="lab-primario flex h-6 w-6 items-center justify-center rounded-md"><Boxes className="h-3.5 w-3.5" /></span> Cajón de piezas</span>
          <span className="lg:hidden">{cajonAbierto ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</span>
        </button>
        {cajonAbierto && (
          <>
            <div className="flex gap-1 overflow-x-auto border-b border-lab-borde/15 p-2">
              <button onClick={() => setFamilia('robot')} data-fam="robot" aria-pressed={familia === 'robot'} className="lab-fam lab-fam-chip shrink-0 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="mr-1">🤖</span>En el robot ({doc.piezas.length - 1})
              </button>
              {FAMILIAS.map(f => (
                <button key={f.id} onClick={() => setFamilia(f.id)} data-fam={f.id} aria-pressed={familia === f.id} className="lab-fam lab-fam-chip shrink-0 rounded-lg px-2.5 py-1.5 text-xs">
                  <span className="mr-1">{ICONO_FAMILIA[f.id]}</span>{f.nombre}
                </button>
              ))}
            </div>
            {familia === 'robot' ? (
              // Piezas montadas: tocar = seleccionar; papelera = quitar (con lo que cuelga de ella).
              <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                {doc.piezas.filter(p => p.padre).map(p => (
                  <li key={p.id} data-fam={pieza(p.pieza).familia} data-elegida={seleccion === p.id} className="lab-fam lab-tarjeta flex items-center gap-2 rounded-lg py-1.5 pl-3 pr-2 text-xs">
                    <button onClick={() => { setSeleccion(p.id); setElegida(null) }} className="min-w-0 flex-1 text-left">
                      <div className="truncate font-medium text-white">{p.etiqueta}</div>
                      <div className="truncate text-[10px] text-slate-500">{pieza(p.pieza).nombre}</div>
                    </button>
                    <button onClick={() => quitarPieza(p.id)} className="rounded-md p-1.5 text-red-300 hover:bg-red-500/15" title={`Quitar ${p.etiqueta}`} aria-label={`Quitar ${p.etiqueta}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                <li className="px-1 pt-1 text-[10px] leading-snug text-slate-500">Para cambiar el chasis, elige otro en la pestaña «Chasis». Ctrl+Z deshace.</li>
              </ul>
            ) : (
            <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto p-2 sm:grid-cols-3 lg:grid-cols-1">
              {[...piezasDe(familia)].sort((a, b) => Number(!!b.enKits) - Number(!!a.enKits)).map(def => (
                <TarjetaPieza
                  key={def.id}
                  def={def}
                  elegida={elegida === def.id}
                  enUso={doc.piezas.some(x => x.pieza === def.id)}
                  onTocar={() => { if (!recienArrastrado.current) elegirPieza(def) }}
                  onArrastrar={(x, y) => {
                    if (def.familia !== 'chasis') setArrastre({ pieza: def.id, x, y, x0: x, y0: y, iniciado: false })
                  }}
                />
              ))}
            </div>
            )}
          </>
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
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <BotonIcono titulo="Deshacer" onClick={p.deshacer} disabled={!p.puedeDeshacer}><Undo2 className="h-4 w-4" /></BotonIcono>
          <BotonIcono titulo="Rehacer" onClick={p.rehacer} disabled={!p.puedeRehacer}><Redo2 className="h-4 w-4" /></BotonIcono>
          <BotonIcono titulo={explosion ? 'Juntar piezas' : 'Vista explosionada'} onClick={() => setExplosion(e => !e)} activo={explosion}>{explosion ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}</BotonIcono>
          <BotonIcono titulo={cables ? 'Ocultar cables' : 'Mostrar cables'} onClick={() => setCables(c => !c)} activo={cables}><IconCable className="h-4 w-4" /></BotonIcono>
          <BotonIcono titulo="Lista de materiales" onClick={p.onListaMateriales}><Package className="h-4 w-4" /></BotonIcono>
        </div>

        {/* Datos en vivo */}
        <div className="pointer-events-none absolute right-2 top-2 w-48 rounded-xl lab-vidrio p-2.5 text-xs backdrop-blur sm:w-56">
          <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-white"><Scale className="h-3.5 w-3.5 text-lab-acento" /> {doc.nombre}</div>
          <Dato k="Peso" v={`${res.masa_g.toFixed(0)} g`} />
          <Dato k="Medidas" v={`${(res.medidas.largo / 10).toFixed(1)} × ${(res.medidas.ancho / 10).toFixed(1)} × ${(res.medidas.alto / 10).toFixed(1)} cm`} />
          <Dato k="Centro de gravedad" v={`${res.cg.x >= 0 ? '+' : ''}${res.cg.x.toFixed(0)} mm ${res.cg.x >= 0 ? 'adelante' : 'atrás'}`} />
          <Dato k="Piezas" v={String(res.piezas)} />
          {avisos.map((a, i) => (
            <div key={i} className="mt-1.5 flex gap-1 rounded-md bg-amber-500/15 px-1.5 py-1 text-[11px] leading-snug text-amber-200"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {a}</div>
          ))}
        </div>

        {elegida && !arrastre?.iniciado && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-400/30 bg-black/70 px-3 py-1.5 text-xs text-emerald-200 backdrop-blur">
            {marcadores.length ? <>Toca un punto verde para poner <b>{pieza(elegida).nombre}</b></> : <>No hay lugar libre para <b>{pieza(elegida).nombre}</b></>}
            <button onClick={() => setElegida(null)} className="rounded-full p-0.5 hover:bg-white/10"><X className="h-3.5 w-3.5" /></button>
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
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-emerald-400/60 bg-lab-superficie/90 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl" style={{ left: arrastre.x, top: arrastre.y }}>
          {pieza(arrastre.pieza).nombre}
        </div>
      )}
    </div>
  )
}

function BotonIcono({ titulo, onClick, disabled, activo, children }: { titulo: string; onClick: () => void; disabled?: boolean; activo?: boolean; children: React.ReactNode }) {
  return (
    <button title={titulo} aria-label={titulo} onClick={onClick} disabled={disabled} className={`flex h-9 w-9 items-center justify-center rounded-lg border border-lab-borde/15 backdrop-blur transition disabled:opacity-35 ${activo ? 'bg-lab-acento/25 text-lab-acento shadow-[0_0_14px_-4px] shadow-lab-acento' : 'bg-lab-superficie/75 text-slate-200 hover:bg-lab-elevado'}`}>
      {children}
    </button>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2 py-0.5"><span className="text-slate-400">{k}</span><span className="text-right font-mono text-white">{v}</span></div>
}

function TarjetaPieza({ def, elegida, enUso, onTocar, onArrastrar }: { def: PiezaDef; elegida: boolean; enUso: boolean; onTocar: () => void; onArrastrar: (x: number, y: number) => void }) {
  return (
    <button
      onClick={onTocar}
      onPointerDown={e => { if (e.button === 0 && !def.proximamente) onArrastrar(e.clientX, e.clientY) }}
      data-fam={def.familia}
      data-elegida={elegida}
      className={`lab-fam touch-none select-none rounded-xl p-2 pl-3 text-left ${def.proximamente ? 'rounded-xl border border-dashed border-lab-borde/15 bg-white/[0.02] opacity-60' : 'lab-tarjeta'}`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-semibold leading-tight text-white">{def.nombre}</span>
        {def.proximamente
          ? <span className="shrink-0 rounded bg-sky-500/20 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sky-300">Próximamente</span>
          : def.enKits && <span className="shrink-0 rounded bg-chaski-primary/20 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-chaski-primary">En kits</span>}
      </div>
      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-400">{def.descripcion}</p>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
        <span className="lab-dato font-mono">{def.masa_g} g</span>
        {enUso && <span className="text-emerald-400">● en el robot</span>}
      </div>
    </button>
  )
}

function PanelPieza({ doc, id, onCerrar, cambiar, avisar }: { doc: RobotDoc; id: string; onCerrar: () => void; cambiar: (d: RobotDoc, t?: string) => void; avisar: (t: 'ok' | 'error' | 'info', s: string) => void }) {
  const inst = doc.piezas.find(x => x.id === id)!
  const def = pieza(inst.pieza)
  const mt = montajeDe(doc, inst)
  const v = datosVariante(def, inst.variante)
  const alternativas = LISTA_PIEZAS.filter(x => x.id !== def.id && !x.proximamente && (mt ? x.encaja.includes(mt.tipo) : x.familia === 'chasis'))
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
    <aside className="absolute inset-x-0 bottom-0 z-20 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-lab-borde/15 bg-lab-superficie/95 p-3 shadow-2xl backdrop-blur lg:static lab-panel lg:order-3 lg:max-h-none lg:w-80 lg:rounded-none lg:border-l lg:border-t-0">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{inst.etiqueta}</div>
          <h3 className="text-sm font-semibold text-white">{v.nombre}</h3>
        </div>
        <button onClick={onCerrar} className="rounded-lg p-1 text-slate-400 hover:bg-white/10" aria-label="Cerrar"><X className="h-4 w-4" /></button>
      </div>
      <p className="mb-2 text-xs leading-relaxed text-slate-300">{def.descripcion}</p>
      {def.enKits && <div className="mb-2 inline-block rounded bg-chaski-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-chaski-primary">Viene en los kits ChaskiBots</div>}
      {credito && (
        <p className="mb-2 text-[10px] leading-snug text-slate-500">
          Modelo 3D: <a href={credito.fuente} target="_blank" rel="noreferrer" className="underline hover:text-slate-300">«{credito.titulo}»</a> de {credito.autor.replace(/ (.*)$/, '')} · {credito.licencia.replace(/ (.*)$/, '')}
        </p>
      )}

      {def.datos && (
        <table className="mb-3 w-full text-xs">
          <tbody>
            {[['Peso', `${v.masa_g} g`] as [string, string], ...def.datos].map(([k, val]) => (
              <tr key={k} className="border-b border-lab-borde/10"><td className="py-1 pr-2 text-slate-400">{k}</td><td className="py-1 text-right text-slate-100">{val}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {def.variantes && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] font-semibold text-slate-400">Material</div>
          <div className="grid grid-cols-2 gap-1.5">
            {def.variantes.map(x => (
              <button key={x.id} onClick={() => cambiar(cambiarVariante(doc, id, x.id), `Material: ${x.nombre}`)} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11px] ${(inst.variante ?? def.variantes![0].id) === x.id ? 'border-lab-acento/60 bg-lab-acento/10 text-white' : 'border-lab-borde/15 text-slate-300 hover:bg-white/5'}`}>
                <span className="h-3 w-3 shrink-0 rounded-full border border-lab-borde/25" style={{ background: x.color }} />
                <span>{x.nombre}<span className="block text-slate-500">{x.masa_g} g</span></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {alternativas.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] font-semibold text-slate-400">Cambiar por</div>
          <div className="flex flex-col gap-1">
            {alternativas.map(a => (
              <button key={a.id} onClick={() => reemplazarPor(a.id)} className="flex items-center justify-between rounded-lg border border-lab-borde/15 px-2 py-1.5 text-left text-xs text-slate-200 hover:bg-white/5">
                <span>{a.nombre}</span><span className="text-[10px] text-slate-500">{a.masa_g} g</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {mt?.rotacionesPermitidas && mt.rotacionesPermitidas.length > 1 && (
          <button onClick={() => cambiar(girar(doc, id), `Girar ${inst.etiqueta}`)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-lab-borde/15 py-2 text-xs hover:bg-white/5"><RotateCw className="h-3.5 w-3.5" /> Girar</button>
        )}
        {inst.padre && (
          <button
            onClick={() => {
              if (colgando > 0 && !window.confirm(`También se quitarán ${colgando} pieza${colgando > 1 ? 's' : ''} que van montadas en ${inst.etiqueta}. ¿Seguir?`)) return
              cambiar(quitar(doc, id), `Quitar ${inst.etiqueta}`)
              onCerrar()
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 py-2 text-xs text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Quitar
          </button>
        )}
      </div>
      {!inst.padre && <p className="mt-2 flex gap-1 text-[11px] text-slate-500"><Info className="h-3 w-3 shrink-0" /> El chasis es la base: se cambia, no se quita.</p>}
    </aside>
  )
}
