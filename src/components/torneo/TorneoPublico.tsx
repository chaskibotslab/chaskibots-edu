'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin, CalendarDays, Search, Trophy, Users, LayoutGrid, X } from 'lucide-react'
import { Categoria, Equipo, InsigniaEstado, Medalla, TORNEO, ESTILOS_TORNEO, plano, useTorneo } from './comun'

type Vista = 'categorias' | 'resultados' | 'equipos'

function FilaEquipo({ e, numero }: { e: Equipo; numero?: boolean }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      {e.puesto ? <Medalla puesto={e.puesto} /> : numero ? <span className="mt-0.5 w-6 shrink-0 text-center text-xs font-bold tabular-nums text-slate-400">{e.numero}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="break-words text-[15px] font-bold leading-snug text-slate-900">{e.robot}</p>
        {e.equipo && <p className="break-words text-sm font-semibold text-[#C4523F]">{e.equipo}</p>}
        {e.integrantes.length > 0 && <p className="break-words text-sm text-slate-600">{e.integrantes.join(' · ')}</p>}
      </div>
      {e.puntaje && <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-700">{e.puntaje}</span>}
    </li>
  )
}

export default function TorneoPublico() {
  const { categorias, fallo, hora } = useTorneo(20000)
  const [vista, setVista] = useState<Vista>('categorias')
  const [busca, setBusca] = useState('')
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set())
  const q = plano(busca.trim())

  // Con búsqueda: solo las categorías y equipos que coinciden.
  const filtradas = useMemo(() => {
    if (!categorias) return []
    if (!q) return categorias
    return categorias.map(c => {
      if (plano(c.nombre).includes(q)) return c
      const equipos = c.equipos.filter(e => plano(`${e.robot} ${e.equipo} ${e.integrantes.join(' ')}`).includes(q))
      return { ...c, equipos }
    }).filter(c => c.equipos.length > 0 || plano(c.nombre).includes(q))
  }, [categorias, q])

  const conResultados = useMemo(() => filtradas
    .map(c => ({ ...c, equipos: c.equipos.filter(e => e.puesto).sort((a, b) => (a.puesto! - b.puesto!)) }))
    .filter(c => c.equipos.length > 0), [filtradas])

  const clubes = useMemo(() => {
    const mapa = new Map<string, { nombre: string; robots: { e: Equipo; categoria: string }[] }>()
    for (const c of filtradas) for (const e of c.equipos) {
      const nombre = e.equipo || 'Independiente'
      const clave = plano(nombre)
      if (!mapa.has(clave)) mapa.set(clave, { nombre, robots: [] })
      mapa.get(clave)!.robots.push({ e, categoria: c.nombre })
    }
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [filtradas])

  const totales = useMemo(() => {
    const cats = categorias || []
    const clubesTodos = new Set(cats.flatMap(c => c.equipos.map(e => plano(e.equipo || 'Independiente'))))
    return { categorias: cats.length, robots: cats.reduce((n, c) => n + c.equipos.length, 0), clubes: clubesTodos.size, finalizadas: cats.filter(c => c.estado === 'finalizada').length }
  }, [categorias])

  const alternar = (id: string) => setAbiertas(v => { const n = new Set(v); n.has(id) ? n.delete(id) : n.add(id); return n })

  const pestañas: { id: Vista; texto: string; icono: typeof Trophy }[] = [
    { id: 'categorias', texto: 'Categorías', icono: LayoutGrid },
    { id: 'resultados', texto: 'Resultados', icono: Trophy },
    { id: 'equipos', texto: 'Equipos', icono: Users },
  ]

  return (
    <div className="tn min-h-screen bg-[#F4F3ED] text-slate-900">
      <style>{ESTILOS_TORNEO}</style>

      <header className="relative overflow-hidden bg-gradient-to-br from-[#E57361] via-[#E9806A] to-[#F2A65A] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chaski.png" alt="" className="h-11 w-11 rounded-xl bg-white object-contain p-1 shadow-sm" />
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/90">{TORNEO.titulo}</p>
          </div>
          <h1 className="mt-5 text-5xl font-black leading-none tracking-tight sm:text-7xl">{TORNEO.nombre}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold text-white/95">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {TORNEO.lugar}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {TORNEO.fechas}</span>
          </div>
          <dl className="mt-7 grid max-w-xl grid-cols-4 gap-2">
            {[['Categorías', totales.categorias], ['Robots', totales.robots], ['Equipos', totales.clubes], ['Finalizadas', totales.finalizadas]].map(([t, n]) => (
              <div key={t} className="rounded-xl bg-white/15 px-2 py-2.5 text-center backdrop-blur-sm">
                <dd className="text-2xl font-black tabular-nums leading-none">{categorias ? n : '–'}</dd>
                <dt className="mt-1 text-[11px] font-semibold text-white/90">{t}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-[#F4F3ED]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:px-6">
          <div role="tablist" className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {pestañas.map(p => (
              <button key={p.id} role="tab" aria-selected={vista === p.id} onClick={() => setVista(p.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold sm:flex-none ${vista === p.id ? 'bg-[#E57361] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                <p.icono className="h-4 w-4" /> {p.texto}
              </button>
            ))}
          </div>
          <label className="relative flex-1">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar robot, equipo, participante o categoría"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[15px] shadow-sm outline-none placeholder:text-slate-400 focus:border-[#E57361] focus:ring-2 focus:ring-[#E57361]/25" />
            {busca && <button onClick={() => setBusca('')} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </label>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        {fallo && <p role="alert" className="mb-4 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900">No se pudo actualizar la información. Se reintenta automáticamente.</p>}

        {!categorias ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Cargando">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/70" />)}
          </div>
        ) : vista === 'categorias' ? (
          filtradas.length === 0 ? <Vacio texto="No encontramos nada con esa búsqueda." /> : (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              {filtradas.map((c: Categoria) => {
                const abierta = !!q || abiertas.has(c.id)
                return (
                  <section key={c.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <button onClick={() => alternar(c.id)} aria-expanded={abierta} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E57361]/10 text-sm font-black tabular-nums text-[#C4523F]">{c.equipos.length}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-[15px] font-bold leading-snug text-slate-900">{c.nombre}</span>
                        <span className="mt-1 block"><InsigniaEstado estado={c.estado} /></span>
                      </span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${abierta ? 'rotate-180' : ''}`} />
                    </button>
                    {abierta && (
                      c.equipos.length === 0
                        ? <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">Sin robots inscritos.</p>
                        : <ul className="tn-entra divide-y divide-slate-100 border-t border-slate-100">{c.equipos.map(e => <FilaEquipo key={e.id} e={e} numero />)}</ul>
                    )}
                  </section>
                )
              })}
            </div>
          )
        ) : vista === 'resultados' ? (
          conResultados.length === 0 ? <Vacio texto={q ? 'No hay resultados con esa búsqueda.' : 'Todavía no hay resultados. Aparecerán aquí en cuanto los jueces los registren.'} /> : (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              {conResultados.map(c => (
                <section key={c.id} className="tn-entra overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                    <h2 className="min-w-0 flex-1 break-words text-[15px] font-bold leading-snug">{c.nombre}</h2>
                    <InsigniaEstado estado={c.estado} />
                  </div>
                  <ul className="divide-y divide-slate-100">{c.equipos.map(e => <FilaEquipo key={e.id} e={e} />)}</ul>
                </section>
              ))}
            </div>
          )
        ) : (
          clubes.length === 0 ? <Vacio texto="No encontramos nada con esa búsqueda." /> : (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              {clubes.map(k => (
                <section key={k.nombre} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                    <h2 className="min-w-0 flex-1 break-words text-[15px] font-bold leading-snug">{k.nombre}</h2>
                    <span className="shrink-0 rounded-full bg-[#E57361]/10 px-2.5 py-0.5 text-xs font-bold text-[#C4523F]">{k.robots.length} {k.robots.length === 1 ? 'robot' : 'robots'}</span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {k.robots.map(({ e, categoria }) => (
                      <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                        {e.puesto ? <Medalla puesto={e.puesto} /> : <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />}
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-bold text-slate-900">{e.robot}</p>
                          <p className="break-words text-xs font-semibold text-slate-500">{categoria}</p>
                          {e.integrantes.length > 0 && <p className="break-words text-xs text-slate-600">{e.integrantes.join(' · ')}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )
        )}
      </main>

      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 pb-8 pt-2 text-xs text-slate-500 sm:px-6">
        <span>{hora ? `Actualizado a las ${hora.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}. Se actualiza solo.` : ''}</span>
        <Link href="/torneo/jueces" className="font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">Acceso jueces</Link>
      </footer>
    </div>
  )
}

function Vacio({ texto }: { texto: string }) {
  return <p className="rounded-2xl bg-white px-5 py-10 text-center text-[15px] text-slate-600 shadow-sm ring-1 ring-slate-200">{texto}</p>
}
