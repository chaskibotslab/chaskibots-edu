'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin, CalendarDays, Search, Trophy, Users, LayoutGrid, X } from 'lucide-react'
import { Categoria, Equipo, InsigniaEstado, Medalla, TORNEO, ESTILOS_TORNEO, plano, useTorneo } from './comun'
import { VistaCompetencia } from './Competencia'
import { FORMATO_TEXTO } from '@/lib/torneoCompetencia'

type Vista = 'categorias' | 'resultados' | 'equipos'

// Cuando el robot lleva el nombre de su único participante, no se repite debajo.
const personas = (e: Equipo) => e.integrantes.length === 1 && plano(e.integrantes[0]) === plano(e.robot) ? '' : e.integrantes.join(' · ')

function FilaEquipo({ e, numero }: { e: Equipo; numero?: boolean }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      {e.puesto ? <Medalla puesto={e.puesto} /> : numero ? <span className="mt-0.5 w-6 shrink-0 text-center text-xs font-bold tabular-nums text-slate-400">{e.numero}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="break-words text-[15px] font-bold leading-snug text-slate-900">{e.robot}</p>
        {e.equipo && <p className="break-words text-sm font-semibold text-[#C4523F]">{e.equipo}</p>}
        {personas(e) && <p className="break-words text-sm text-slate-600">{personas(e)}</p>}
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

  const enCurso = useMemo(() => (categorias || []).filter(c => c.estado === 'en_curso'), [categorias])
  const irA = (id: string) => {
    setVista('categorias'); setBusca('')
    setAbiertas(v => new Set(v).add(id))
    setTimeout(() => document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const alternar = (id: string) => setAbiertas(v => { const n = new Set(v); n.has(id) ? n.delete(id) : n.add(id); return n })

  const pestañas: { id: Vista; texto: string; icono: typeof Trophy }[] = [
    { id: 'categorias', texto: 'Categorías', icono: LayoutGrid },
    { id: 'resultados', texto: 'Resultados', icono: Trophy },
    { id: 'equipos', texto: 'Equipos', icono: Users },
  ]

  return (
    <div className="tn min-h-screen bg-[#F4F3ED] text-slate-900">
      <style>{ESTILOS_TORNEO}</style>

      <header className="relative overflow-hidden bg-[#282A36] text-white">
        {/* Brillos coral y engranaje, como en el logo */}
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#E57361]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#E57361]/10 blur-3xl" />
        <svg aria-hidden viewBox="0 0 100 100" className="tn-gira pointer-events-none absolute -right-10 top-6 h-56 w-56 text-white/[0.06] sm:h-72 sm:w-72">
          <path fill="currentColor" fillRule="evenodd" d="M43 4h14l2 11 9 4 9-7 10 10-7 9 4 9 11 2v14l-11 2-4 9 7 9-10 10-9-7-9 4-2 11H43l-2-11-9-4-9 7-10-10 7-9-4-9-11-2V43l11-2 4-9-7-9 10-10 9 7 9-4zM50 32a18 18 0 100 36 18 18 0 000-36z" />
        </svg>
        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/torneo/chaski-icono.jpg" alt="Chaski Bots" className="h-14 w-14 rounded-2xl object-cover shadow-lg ring-2 ring-white/20 sm:h-16 sm:w-16" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F0A092]">Edición 10</p>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/85">{TORNEO.titulo}</p>
            </div>
          </div>
          <h1 className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">
            <span>Chaski</span>
            <span className="text-[#E57361]">Bots</span>
            <span className="rounded-2xl border-[3px] border-[#E57361] px-3 py-0.5 text-4xl sm:text-6xl">10</span>
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold text-white/85">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#E57361]" /> {TORNEO.lugar}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-[#E57361]" /> {TORNEO.fechas}</span>
          </div>
          <dl className="mt-7 grid max-w-xl grid-cols-4 gap-2">
            {[['Categorías', totales.categorias], ['Robots', totales.robots], ['Equipos', totales.clubes], ['Finalizadas', totales.finalizadas]].map(([t, n]) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/[0.07] px-2 py-2.5 text-center">
                <dd className="text-2xl font-black tabular-nums leading-none">{categorias ? n : '–'}</dd>
                <dt className="mt-1 text-[11px] font-semibold text-white/70">{t}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div aria-hidden className="h-1.5 bg-gradient-to-r from-[#E57361] via-[#F0A092] to-[#E57361]" />
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
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar robot, equipo o participante"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[15px] shadow-sm outline-none placeholder:text-slate-400 focus:border-[#E57361] focus:ring-2 focus:ring-[#E57361]/25" />
            {busca && <button onClick={() => setBusca('')} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </label>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        {fallo && <p role="alert" className="mb-4 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900">No se pudo actualizar la información. Se reintenta automáticamente.</p>}

        {enCurso.length > 0 && (
          <section aria-label="En competencia ahora" className="tn-entra mb-4 rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]"><span className="tn-vivo h-2 w-2 rounded-full bg-white" /> En competencia ahora</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {enCurso.map(c => (
                <button key={c.id} onClick={() => irA(c.id)} className="rounded-full bg-white px-3 py-1.5 text-left text-sm font-bold text-emerald-800 hover:bg-emerald-50">{c.nombre}</button>
              ))}
            </div>
          </section>
        )}

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
                  <section key={c.id} id={`cat-${c.id}`} className={`scroll-mt-36 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 sm:scroll-mt-24 ${abierta && c.competencia && !q ? 'sm:col-span-2' : ''} ${c.estado === 'en_curso' ? 'ring-2 ring-emerald-500' : 'ring-slate-200'}`}>
                    <button onClick={() => alternar(c.id)} aria-expanded={abierta} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#282A36] text-sm font-black tabular-nums text-white">{c.equipos.length}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-[15px] font-bold leading-snug text-slate-900">{c.nombre}</span>
                        {(c.estado !== 'pendiente' || c.competencia) && (
                          <span className="mt-1 flex flex-wrap items-center gap-1.5">
                            {c.estado !== 'pendiente' && <InsigniaEstado estado={c.estado} />}
                            {c.competencia && <span className="rounded-full bg-[#E57361]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#C4523F]">{FORMATO_TEXTO[c.competencia.formato]}</span>}
                          </span>
                        )}
                      </span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${abierta ? 'rotate-180' : ''}`} />
                    </button>
                    {abierta && c.competencia && !q && (
                      <div className="tn-entra border-t border-slate-100 bg-slate-50/60 px-3 py-3">
                        <VistaCompetencia cat={c} />
                      </div>
                    )}
                    {abierta && c.competencia && !q && c.equipos.length > 0 && <p className="border-t border-slate-100 px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Inscritos</p>}
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
                  {c.competencia && <button onClick={() => irA(c.id)} className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-bold text-[#C4523F] hover:bg-slate-50">Ver {c.competencia.formato === 'tiempos' ? 'tiempos' : c.competencia.formato === 'puntos' ? 'puntajes' : 'llaves'} completos</button>}
                </section>
              ))}
            </div>
          )
        ) : (
          clubes.length === 0 ? <Vacio texto="No encontramos nada con esa búsqueda." /> : (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              {clubes.map(k => {
                const clave = `club:${plano(k.nombre)}`
                const abierta = !!q || abiertas.has(clave)
                const medallas = k.robots.filter(r => r.e.puesto).length
                return (
                <section key={clave} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <button onClick={() => alternar(clave)} aria-expanded={abierta} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-[15px] font-bold leading-snug text-slate-900">{k.nombre}</span>
                      {medallas > 0 && <span className="mt-0.5 block text-xs font-semibold text-amber-700">{medallas} {medallas === 1 ? 'podio' : 'podios'}</span>}
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${abierta ? 'rotate-180' : ''}`} />
                  </button>
                  {abierta && <ul className="tn-entra divide-y divide-slate-100 border-t border-slate-100">
                    {k.robots.map(({ e, categoria }) => (
                      <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                        {e.puesto ? <Medalla puesto={e.puesto} /> : <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />}
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-bold text-slate-900">{e.robot}</p>
                          <p className="break-words text-xs font-semibold text-slate-500">{categoria}</p>
                          {personas(e) && <p className="break-words text-xs text-slate-600">{personas(e)}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>}
                </section>
              )})}
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
