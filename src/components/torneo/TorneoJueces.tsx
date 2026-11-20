'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, KeyRound, Loader2, LogOut, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Categoria, Equipo, Estado, ESTADO_TEXTO, ESTILOS_TORNEO, TORNEO, plano, useTorneo } from './comun'
import { PanelCompetencia } from './Competencia'

const MAX = 3
const campo = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#E57361] focus:ring-2 focus:ring-[#E57361]/25'

async function enviar(url: string, method: string, cuerpo?: unknown): Promise<{ ok: boolean; error: string; status: number }> {
  try {
    const r = await fetch(url, { method, headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined, body: cuerpo ? JSON.stringify(cuerpo) : undefined })
    const d = await r.json().catch(() => null)
    return { ok: r.ok && !!d?.success, error: d?.error || 'No se pudo guardar. Revisa la conexión.', status: r.status }
  } catch {
    return { ok: false, error: 'Sin conexión. Inténtalo otra vez.', status: 0 }
  }
}

// ------------------------------------------------------------------ entrada con clave
function Entrada({ alEntrar }: { alEntrar: () => void }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const entrar = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!clave.trim() || ocupado) return
    setOcupado(true); setError('')
    const r = await enviar('/api/torneo/acceso', 'POST', { clave })
    setOcupado(false)
    if (r.ok) alEntrar(); else setError(r.error)
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={entrar} className="tn-entra w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E57361]/10 text-[#C4523F]"><KeyRound className="h-6 w-6" /></div>
        <h1 className="mt-4 text-xl font-black text-slate-900">Acceso de jueces</h1>
        <p className="mt-1 text-sm text-slate-600">{TORNEO.nombre}. Escribe la clave que te entregó la organización.</p>
        <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="clave-juez">Clave</label>
        <input id="clave-juez" type="password" autoComplete="off" autoFocus value={clave} onChange={e => setClave(e.target.value)} className={`mt-1 ${campo}`} />
        {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <button disabled={ocupado || !clave.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#E57361] px-4 py-2.5 text-[15px] font-bold text-white hover:bg-[#d4614f] disabled:opacity-60">
          {ocupado && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
        </button>
        <Link href="/torneo" className="mt-4 block text-center text-sm font-semibold text-slate-500 hover:text-slate-800">Volver a la página del torneo</Link>
      </form>
    </div>
  )
}

// ------------------------------------------------------------------ ventana: agregar o modificar equipo
function VentanaEquipo({ equipo, categoriaId, categorias, alCerrar, alGuardar }: {
  equipo: Equipo | null; categoriaId: string; categorias: Categoria[]; alCerrar: () => void; alGuardar: () => void
}) {
  const casillas = Math.max(MAX, equipo?.integrantes.length || 0)
  const [robot, setRobot] = useState(equipo?.robot || '')
  const [club, setClub] = useState(equipo?.equipo || '')
  const [integrantes, setIntegrantes] = useState<string[]>(() => Array.from({ length: casillas }, (_, i) => equipo?.integrantes[i] || ''))
  const [cat, setCat] = useState(categoriaId)
  const [nota, setNota] = useState(equipo?.nota || '')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [alCerrar])

  const guardar = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!robot.trim()) { setError('Escribe el nombre del robot.'); return }
    setOcupado(true); setError('')
    const datos = { robot, equipo: club, integrantes: integrantes.map(n => n.trim()).filter(Boolean), categoriaId: cat, nota }
    const r = equipo ? await enviar('/api/torneo/equipos', 'PATCH', { id: equipo.id, ...datos }) : await enviar('/api/torneo/equipos', 'POST', datos)
    setOcupado(false)
    if (r.ok) alGuardar(); else setError(r.error)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={e => { if (e.target === e.currentTarget) alCerrar() }}>
      <form onSubmit={guardar} role="dialog" aria-modal="true" aria-label={equipo ? 'Modificar equipo' : 'Agregar equipo'}
        className="tn-entra flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-lg font-black text-slate-900">{equipo ? 'Modificar equipo' : 'Agregar equipo'}</h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3.5 overflow-y-auto px-5 py-4">
          <label className="block text-sm font-bold text-slate-700">Nombre del robot
            <input autoFocus value={robot} onChange={e => setRobot(e.target.value)} maxLength={80} className={`mt-1 font-normal ${campo}`} />
          </label>
          <label className="block text-sm font-bold text-slate-700">Equipo, club o institución
            <input value={club} onChange={e => setClub(e.target.value)} maxLength={120} className={`mt-1 font-normal ${campo}`} />
          </label>
          <fieldset>
            <legend className="text-sm font-bold text-slate-700">Participantes <span className="font-normal text-slate-500">(máximo {MAX})</span></legend>
            <div className="mt-1 space-y-2">
              {integrantes.map((n, i) => (
                <input key={i} value={n} aria-label={`Participante ${i + 1}`} placeholder={`Participante ${i + 1}`} maxLength={80}
                  onChange={e => setIntegrantes(v => v.map((x, j) => j === i ? e.target.value : x))} className={campo} />
              ))}
            </div>
            {casillas > MAX && <p className="mt-1.5 text-xs text-slate-500">Este equipo se inscribió con {casillas} personas. Puedes dejarlas o quitar una, pero no agregar más.</p>}
          </fieldset>
          <label className="block text-sm font-bold text-slate-700">Categoría
            <select value={cat} onChange={e => setCat(e.target.value)} className={`mt-1 font-normal ${campo}`}>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </label>
          <label className="block text-sm font-bold text-slate-700">Nota interna <span className="font-normal text-slate-500">(solo la ven los jueces)</span>
            <input value={nota} onChange={e => setNota(e.target.value)} maxLength={300} className={`mt-1 font-normal ${campo}`} />
          </label>
          {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3.5">
          <button type="button" onClick={alCerrar} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">Cancelar</button>
          <button disabled={ocupado} className="flex items-center gap-2 rounded-lg bg-[#E57361] px-4 py-2 text-sm font-bold text-white hover:bg-[#d4614f] disabled:opacity-60">
            {ocupado && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

// ------------------------------------------------------------------ panel
export default function TorneoJueces() {
  const { categorias, juez, fallo, recargar } = useTorneo(30000)
  const [idCat, setIdCat] = useState('')
  const [filtro, setFiltro] = useState('')
  const [ventana, setVentana] = useState<{ equipo: Equipo | null } | null>(null)
  const [porBorrar, setPorBorrar] = useState('')
  const [aviso, setAviso] = useState('')
  const [nuevaCat, setNuevaCat] = useState<string | null>(null)

  const actual = useMemo(() => categorias?.find(c => c.id === idCat) || categorias?.[0] || null, [categorias, idCat])
  const lista = useMemo(() => {
    const q = plano(filtro.trim())
    return (categorias || []).filter(c => !q || plano(c.nombre).includes(q))
  }, [categorias, filtro])

  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(''), 5000); return () => clearTimeout(t) }, [aviso])

  const cambiar = async (url: string, method: string, cuerpo?: unknown) => {
    const r = await enviar(url, method, cuerpo)
    if (!r.ok) setAviso(r.status === 401 ? 'Tu acceso venció. Vuelve a entrar con la clave.' : r.error)
    await recargar()
    return r.ok
  }

  const salir = async () => { await enviar('/api/torneo/acceso', 'DELETE'); await recargar() }

  const crearCategoria = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!nuevaCat?.trim()) return
    if (await cambiar('/api/torneo/categorias', 'POST', { nombre: nuevaCat })) setNuevaCat(null)
  }

  if (!categorias) {
    return <div className="tn flex min-h-screen items-center justify-center bg-[#F4F3ED] text-slate-600"><style>{ESTILOS_TORNEO}</style>
      {fallo ? <p className="px-4 text-center text-sm font-semibold">No se pudo conectar. <button onClick={recargar} className="text-[#C4523F] underline">Reintentar</button></p> : <Loader2 className="h-6 w-6 animate-spin" />}
    </div>
  }
  if (!juez) return <div className="tn min-h-screen bg-[#F4F3ED]"><style>{ESTILOS_TORNEO}</style><Entrada alEntrar={recargar} /></div>

  return (
    <div className="tn min-h-screen bg-[#F4F3ED] text-slate-900">
      <style>{ESTILOS_TORNEO}</style>
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#E57361] to-[#EE8A64] text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chaski.png" alt="" className="h-10 w-auto object-contain" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black leading-tight">{TORNEO.nombre}</p>
            <p className="text-xs font-semibold text-white/90">Panel de jueces</p>
          </div>
          <Link href="/torneo" target="_blank" className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30"><ExternalLink className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Página pública</span></Link>
          <button onClick={salir} className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-bold hover:bg-slate-900"><LogOut className="h-3.5 w-3.5" /> Salir</button>
        </div>
      </header>

      {aviso && <p role={aviso.startsWith('ok:') ? 'status' : 'alert'} className="tn-entra pointer-events-none fixed inset-x-0 bottom-4 z-30 mx-auto max-w-xl px-4"><span className={`block rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${aviso.startsWith('ok:') ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{aviso.replace(/^ok:/, '')}</span></p>}

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[300px_1fr]">
        {/* Categorías: lista en computadora, menú desplegable en teléfono */}
        <aside className="lg:sticky lg:top-[68px] lg:max-h-[calc(100vh-84px)] lg:self-start">
          <label className="block lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Categoría</span>
            <select value={actual?.id || ''} onChange={e => { setIdCat(e.target.value); setPorBorrar('') }} className={`mt-1 font-semibold ${campo}`}>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.equipos.length})</option>)}
            </select>
          </label>
          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:flex lg:max-h-[calc(100vh-84px)] lg:flex-col">
            <label className="relative block border-b border-slate-100 p-2">
              <span className="sr-only">Filtrar categorías</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Filtrar categorías" className="w-full rounded-lg bg-slate-100 py-2 pl-8 pr-2 text-sm outline-none focus:ring-2 focus:ring-[#E57361]/30" />
            </label>
            <ul className="flex-1 overflow-y-auto p-1.5">
              {lista.map(c => (
                <li key={c.id}>
                  <button onClick={() => { setIdCat(c.id); setPorBorrar('') }} aria-current={c.id === actual?.id}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${c.id === actual?.id ? 'bg-[#E57361] font-bold text-white' : 'font-semibold text-slate-700 hover:bg-slate-100'}`}>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${c.estado === 'finalizada' ? 'bg-slate-800' : c.estado === 'en_curso' ? 'bg-emerald-500' : 'bg-slate-300'} ${c.id === actual?.id ? 'ring-2 ring-white/70' : ''}`} />
                    <span className="min-w-0 flex-1 break-words leading-snug">{c.nombre}</span>
                    <span className="shrink-0 text-xs tabular-nums opacity-80">{c.equipos.length}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-2">
              {nuevaCat === null ? (
                <button onClick={() => setNuevaCat('')} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-[#C4523F] hover:bg-[#E57361]/10"><Plus className="h-4 w-4" /> Nueva categoría</button>
              ) : (
                <form onSubmit={crearCategoria} className="flex gap-1.5">
                  <input autoFocus value={nuevaCat} onChange={e => setNuevaCat(e.target.value)} placeholder="Nombre" maxLength={100} aria-label="Nombre de la nueva categoría" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#E57361]" />
                  <button className="rounded-lg bg-[#E57361] px-2.5 text-sm font-bold text-white">Crear</button>
                  <button type="button" onClick={() => setNuevaCat(null)} aria-label="Cancelar" className="rounded-lg px-1.5 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </form>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {!actual ? <p className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">Todavía no hay categorías. Crea la primera desde una computadora.</p> : (
            <>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h1 className="break-words text-xl font-black leading-tight">{actual.nombre}</h1>
                    <p className="mt-0.5 text-sm text-slate-600">{actual.equipos.length} {actual.equipos.length === 1 ? 'robot inscrito' : 'robots inscritos'}</p>
                  </div>
                  <button onClick={() => setVentana({ equipo: null })} className="flex items-center gap-1.5 rounded-lg bg-[#E57361] px-3.5 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#d4614f]"><Plus className="h-4 w-4" /> Agregar equipo</button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado</span>
                  <div className="flex rounded-lg bg-slate-100 p-0.5">
                    {(Object.keys(ESTADO_TEXTO) as Estado[]).map(e => (
                      <button key={e} aria-pressed={actual.estado === e} onClick={() => actual.estado !== e && cambiar('/api/torneo/categorias', 'PATCH', { id: actual.id, estado: e })}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-bold ${actual.estado === e ? (e === 'en_curso' ? 'bg-emerald-500 text-white' : e === 'finalizada' ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-600 hover:text-slate-900'}`}>
                        {ESTADO_TEXTO[e]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <PanelCompetencia key={actual.id} cat={actual}
                  alActuar={accion => { cambiar('/api/torneo/competencia', 'POST', { categoriaId: actual.id, accion }) }}
                  alPodio={async () => { if (await cambiar('/api/torneo/competencia', 'POST', { categoriaId: actual.id, accion: { tipo: 'podio' } })) setAviso('ok:Podio pasado a resultados. Revísalo abajo en la lista de equipos.') }} />
              </div>

              <h2 className="mt-5 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Equipos inscritos y podio</h2>
              <ul className="mt-2 space-y-2.5">
                {actual.equipos.map(e => (
                  <li key={e.id} className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 w-6 shrink-0 text-center text-sm font-bold tabular-nums text-slate-400">{e.numero}</span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-base font-bold leading-snug">{e.robot}</p>
                        {e.equipo && <p className="break-words text-sm font-semibold text-[#C4523F]">{e.equipo}</p>}
                        <p className="break-words text-sm text-slate-600">{e.integrantes.length ? e.integrantes.join(' · ') : <span className="italic text-slate-400">Sin participantes registrados</span>}</p>
                        {e.nota && <p className="mt-1 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">{e.nota}</p>}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => setVentana({ equipo: e })} aria-label={`Modificar ${e.robot}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setPorBorrar(porBorrar === e.id ? '' : e.id)} aria-label={`Quitar ${e.robot}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    {porBorrar === e.id && (
                      <div className="tn-entra mt-2.5 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                        <span className="flex-1 text-sm font-semibold text-red-800">¿Quitar «{e.robot}» del torneo? No se puede deshacer.</span>
                        <button onClick={async () => { await cambiar(`/api/torneo/equipos?id=${e.id}`, 'DELETE'); setPorBorrar('') }} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">Sí, quitar</button>
                        <button onClick={() => setPorBorrar('')} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">No</button>
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Puesto</span>
                        {[1, 2, 3].map(p => (
                          <button key={p} aria-pressed={e.puesto === p} aria-label={`Puesto ${p}`} onClick={() => cambiar('/api/torneo/equipos', 'PATCH', { id: e.id, puesto: e.puesto === p ? null : p })}
                            className={`h-9 w-9 rounded-full text-sm font-black ${e.puesto === p ? (p === 1 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200' : p === 2 ? 'bg-slate-300 text-slate-800 ring-2 ring-slate-100' : 'bg-orange-700 text-white ring-2 ring-orange-200') : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <label className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Puntaje o tiempo</span>
                        <input key={`${e.id}:${e.puntaje || ''}`} defaultValue={e.puntaje || ''} maxLength={60} placeholder="opcional"
                          onKeyDown={ev => { if (ev.key === 'Enter') (ev.target as HTMLInputElement).blur() }}
                          onBlur={ev => { const v = ev.target.value.trim(); if (v !== (e.puntaje || '')) cambiar('/api/torneo/equipos', 'PATCH', { id: e.id, puntaje: v }) }}
                          className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#E57361] focus:ring-2 focus:ring-[#E57361]/25" />
                      </label>
                    </div>
                  </li>
                ))}
                {actual.equipos.length === 0 && <li className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">Esta categoría no tiene equipos. Usa «Agregar equipo».</li>}
              </ul>
            </>
          )}
        </main>
      </div>

      {ventana && actual && (
        <VentanaEquipo equipo={ventana.equipo} categoriaId={actual.id} categorias={categorias}
          alCerrar={() => setVentana(null)} alGuardar={() => { setVentana(null); recargar() }} />
      )}
    </div>
  )
}
