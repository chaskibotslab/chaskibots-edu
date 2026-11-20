'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Categoria, Equipo } from './comun'
import {
  Accion, Competencia, Grupo, Llaves, Partido,
  clasificacion, clasificados, jugado, leerMarca, nombreRonda, tablaGrupo, tamanosGrupos, verMarca,
} from '@/lib/torneoCompetencia'

// Si se pasa `alActuar`, la vista es editable (panel de jueces). Sin ella es solo lectura (página pública).
type Actuar = (accion: Accion) => void
type Nombres = Map<string, Equipo>
// De qué grupo viene cada clasificado ("1.º Grupo A"), para que se entienda la fase final.
type Origen = Map<string, string>

const robot = (n: Nombres, id: string | null) => (id ? n.get(id)?.robot || 'Retirado' : '')
const subtitulo = (n: Nombres, origen: Origen | undefined, id: string) => origen?.get(id) || n.get(id)?.equipo || ''
const casilla = 'h-8 w-10 rounded-md border border-slate-300 bg-white text-center text-sm font-bold tabular-nums outline-none focus:border-[#E57361] focus:ring-2 focus:ring-[#E57361]/25'

function Marcador({ p, lado, nombres, alActuar }: { p: Partido; lado: 'a' | 'b'; nombres: Nombres; alActuar: Actuar }) {
  const goles = lado === 'a' ? p.ga : p.gb
  return (
    <input key={`${p.id}${lado}${goles ?? ''}`} defaultValue={goles ?? ''} inputMode="numeric" maxLength={3} aria-label={`Marcador de ${robot(nombres, p[lado])}`}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      onBlur={e => {
        const t = e.target.value.trim(); const v = t === '' ? null : Number(t)
        if (v !== null && !(Number.isInteger(v) && v >= 0)) { e.target.value = goles === null ? '' : String(goles); return }
        if (v !== goles) alActuar(lado === 'a' ? { tipo: 'partido', partidoId: p.id, ga: v } : { tipo: 'partido', partidoId: p.id, gb: v })
      }}
      className={casilla} />
  )
}

function BotonGano({ p, lado, nombres, alActuar }: { p: Partido; lado: 'a' | 'b'; nombres: Nombres; alActuar: Actuar }) {
  const id = p[lado]; const gano = !!id && p.ganador === id
  return (
    <button aria-pressed={gano} aria-label={`Ganó ${robot(nombres, id)}`} title="Marcar ganador"
      onClick={() => alActuar({ tipo: 'partido', partidoId: p.id, ganador: gano ? null : id })}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${gano ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700'}`}>
      <Check className="h-4 w-4" strokeWidth={3} />
    </button>
  )
}

// ------------------------------------------------------------------ un cruce de llaves (dos renglones)
function Lado({ p, lado, nombres, origen, alActuar }: { p: Partido; lado: 'a' | 'b'; nombres: Nombres; origen?: Origen; alActuar?: Actuar }) {
  const id = p[lado]
  const goles = lado === 'a' ? p.ga : p.gb
  const gano = !!id && p.ganador === id
  const perdio = !!p.ganador && !gano
  const listo = !!p.a && !!p.b
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 ${gano ? 'bg-emerald-50' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm leading-tight ${!id ? 'italic text-slate-400' : gano ? 'font-black text-emerald-900' : perdio ? 'font-semibold text-slate-400' : 'font-bold text-slate-800'}`}>
          {id ? robot(nombres, id) : 'Por definir'}
        </p>
        {id && subtitulo(nombres, origen, id) && <p className={`truncate text-[11px] leading-tight ${origen?.has(id) ? 'font-semibold text-[#C4523F]' : 'text-slate-500'}`}>{subtitulo(nombres, origen, id)}</p>}
      </div>
      {alActuar && listo ? (
        <><Marcador p={p} lado={lado} nombres={nombres} alActuar={alActuar} /><BotonGano p={p} lado={lado} nombres={nombres} alActuar={alActuar} /></>
      ) : (
        <>
          {goles !== null && <span className={`w-6 shrink-0 text-center text-sm tabular-nums ${gano ? 'font-black text-emerald-900' : 'font-bold text-slate-600'}`}>{goles}</span>}
          {gano && goles === null && <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-label="Ganador" />}
        </>
      )}
    </div>
  )
}

function Cruce({ p, nombres, origen, alActuar }: { p: Partido; nombres: Nombres; origen?: Origen; alActuar?: Actuar }) {
  // Cruce de primera ronda sin rival: pasa directo.
  if ((p.a === null) !== (p.b === null) && p.ganador) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-2">
        <p className="truncate text-sm font-bold text-slate-800">{robot(nombres, p.ganador)}</p>
        <p className="text-[11px] font-semibold text-slate-500">Pasa directo a la siguiente ronda</p>
      </div>
    )
  }
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Lado p={p} lado="a" nombres={nombres} origen={origen} alActuar={alActuar} />
      <Lado p={p} lado="b" nombres={nombres} origen={origen} alActuar={alActuar} />
    </div>
  )
}

// ------------------------------------------------------------------ llaves
function VistaLlaves({ l, nombres, origen, alActuar }: { l: Llaves; nombres: Nombres; origen?: Origen; alActuar?: Actuar }) {
  const ancho = alActuar ? 'w-64' : 'w-48'
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-2">
      <div className="flex min-w-max gap-3">
        {l.rondas.map((ronda, r) => (
          <div key={r} className={`flex shrink-0 flex-col ${ancho}`}>
            <p className="mb-1.5 rounded-md bg-[#282A36] px-2 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-white">{nombreRonda(r, l.rondas.length)}</p>
            <div className="flex flex-1 flex-col justify-around gap-2">
              {ronda.map(p => <Cruce key={p.id} p={p} nombres={nombres} origen={origen} alActuar={alActuar} />)}
            </div>
            {r === l.rondas.length - 1 && l.tercero && (
              <div className="mt-3">
                <p className="mb-1.5 rounded-md bg-slate-200 px-2 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-700">Tercer lugar</p>
                <Cruce p={l.tercero} nombres={nombres} origen={origen} alActuar={alActuar} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ grupos
// Un partido de grupo en un solo renglón: Robot A  2 – 1  Robot B
function PartidoGrupo({ p, numero, nombres, alActuar }: { p: Partido; numero: number; nombres: Nombres; alActuar?: Actuar }) {
  const estilo = (id: string | null) => (p.ganador === id ? 'font-black text-emerald-800' : p.ganador ? 'font-semibold text-slate-400' : 'font-bold text-slate-800')
  const empate = jugado(p) && !p.ganador
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
      <span className="w-4 shrink-0 text-center text-[11px] font-bold tabular-nums text-slate-400">{numero}</span>
      {alActuar && <BotonGano p={p} lado="a" nombres={nombres} alActuar={alActuar} />}
      <span className={`min-w-0 flex-1 truncate text-right text-sm ${estilo(p.a)}`}>{robot(nombres, p.a)}</span>
      {alActuar ? (
        <><Marcador p={p} lado="a" nombres={nombres} alActuar={alActuar} /><span className="text-slate-400">–</span><Marcador p={p} lado="b" nombres={nombres} alActuar={alActuar} /></>
      ) : (
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-center text-sm font-black tabular-nums ${jugado(p) ? 'bg-[#282A36] text-white' : 'bg-slate-100 text-slate-400'}`}>
          {p.ga !== null && p.gb !== null ? `${p.ga} – ${p.gb}` : jugado(p) ? (empate ? 'Empate' : 'Jugado') : 'vs'}
        </span>
      )}
      <span className={`min-w-0 flex-1 truncate text-sm ${estilo(p.b)}`}>{robot(nombres, p.b)}</span>
      {alActuar && <BotonGano p={p} lado="b" nombres={nombres} alActuar={alActuar} />}
    </div>
  )
}

function VistaGrupo({ g, pasan, nombres, alActuar }: { g: Grupo; pasan: Set<string>; nombres: Nombres; alActuar?: Actuar }) {
  const tabla = useMemo(() => tablaGrupo(g), [g])
  const conGoles = g.partidos.some(p => p.ga !== null || p.gb !== null)
  const th = 'w-7 text-center font-bold'
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between bg-[#282A36] px-3 py-2 text-white">
        <p className="text-sm font-black">{g.nombre}</p>
        <p className="text-[11px] font-semibold text-white/75">{g.equipos.length} robots · juegan solo entre ellos</p>
      </div>
      <div className="p-2.5">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Posiciones</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase text-slate-500">
              <th className="py-1 text-left font-bold">Robot</th>
              <th className={th} title="Partidos jugados">J</th><th className={th} title="Ganados">G</th><th className={th} title="Empatados">E</th><th className={th} title="Perdidos">P</th>
              {conGoles && <th className="w-8 text-center font-bold" title="Diferencia de goles">DG</th>}
              <th className="w-8 text-center font-bold" title="Puntos">Pts</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((f, i) => (
              <tr key={f.id} className={`border-t border-slate-200 ${pasan.has(f.id) ? 'bg-emerald-50' : ''}`}>
                <td className="max-w-0 py-1.5 pr-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 shrink-0 text-xs font-bold tabular-nums text-slate-400">{i + 1}</span>
                    <span className="truncate font-bold text-slate-800">{robot(nombres, f.id)}</span>
                    {pasan.has(f.id) && <span className="shrink-0 rounded-full bg-emerald-600 px-1.5 py-px text-[10px] font-bold text-white">Clasifica</span>}
                  </span>
                </td>
                <td className="text-center tabular-nums text-slate-600">{f.pj}</td><td className="text-center tabular-nums text-slate-600">{f.g}</td>
                <td className="text-center tabular-nums text-slate-600">{f.e}</td><td className="text-center tabular-nums text-slate-600">{f.p}</td>
                {conGoles && <td className="text-center tabular-nums text-slate-600">{f.gf - f.gc > 0 ? `+${f.gf - f.gc}` : f.gf - f.gc}</td>}
                <td className="text-center font-black tabular-nums text-slate-900">{f.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Partidos del {g.nombre.toLowerCase()}</p>
        <div className="grid gap-1.5">
          {g.partidos.map((p, i) => <PartidoGrupo key={p.id} p={p} numero={i + 1} nombres={nombres} alActuar={alActuar} />)}
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ tiempos o puntaje
function VistaMarcas({ c, equipos, nombres, alActuar }: { c: Competencia; equipos: Equipo[]; nombres: Nombres; alActuar?: Actuar }) {
  const intentos = c.intentos || 1
  const orden = useMemo(() => clasificacion(c, equipos.map(e => e.id)), [c, equipos])
  // En el panel de jueces la lista no salta de lugar mientras se escribe: va en orden de inscripción.
  const filas = alActuar ? equipos.map(e => ({ id: e.id, mejor: orden.find(o => o.id === e.id)?.mejor ?? null })) : orden
  const lugar = (id: string) => { const i = orden.findIndex(o => o.id === id); return orden[i]?.mejor === null ? null : i + 1 }
  const esTiempo = c.formato === 'tiempos'
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="text-[11px] font-bold uppercase text-slate-500">
            <th className="w-8 py-1 text-center font-bold">#</th>
            <th className="py-1 text-left font-bold">Robot</th>
            {Array.from({ length: intentos }, (_, i) => <th key={i} className="px-1 text-center font-bold">{intentos === 1 ? (esTiempo ? 'Tiempo' : 'Puntaje') : `${esTiempo ? 'Vuelta' : 'Intento'} ${i + 1}`}</th>)}
            {intentos > 1 && <th className="px-1 text-center font-bold">Mejor</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map(f => {
            const marcas = c.marcas?.[f.id] || []
            const puesto = lugar(f.id)
            return (
              <tr key={f.id} className="border-t border-slate-200">
                <td className="text-center"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black tabular-nums ${puesto === 1 ? 'bg-amber-400 text-amber-950' : puesto === 2 ? 'bg-slate-300 text-slate-800' : puesto === 3 ? 'bg-orange-700 text-white' : 'text-slate-500'}`}>{puesto ?? '–'}</span></td>
                <td className="max-w-[11rem] py-1.5 pr-2">
                  <p className="truncate font-bold text-slate-800">{robot(nombres, f.id)}</p>
                  {nombres.get(f.id)?.equipo && <p className="truncate text-[11px] text-slate-500">{nombres.get(f.id)!.equipo}</p>}
                </td>
                {Array.from({ length: intentos }, (_, i) => {
                  const v = marcas[i] ?? null
                  return (
                    <td key={i} className="px-1 text-center tabular-nums">
                      {alActuar ? (
                        <input key={`${f.id}:${i}:${v ?? ''}`} defaultValue={verMarca(v, c.formato, false)} inputMode="decimal" placeholder={esTiempo ? '0.00' : '0'} aria-label={`${robot(nombres, f.id)}, intento ${i + 1}`}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                          onBlur={e => {
                            const leido = leerMarca(e.target.value)
                            if (leido === undefined) { e.target.value = verMarca(v, c.formato, false); return }
                            if (leido !== v) alActuar({ tipo: 'marca', equipoId: f.id, intento: i, valor: leido })
                          }}
                          className="h-9 w-20 rounded-md border border-slate-300 bg-white text-center text-sm font-semibold tabular-nums outline-none focus:border-[#E57361] focus:ring-2 focus:ring-[#E57361]/25" />
                      ) : (
                        <span className={v !== null && v === f.mejor && intentos > 1 ? 'font-bold text-slate-900' : 'text-slate-600'}>{verMarca(v, c.formato, false) || '–'}</span>
                      )}
                    </td>
                  )
                })}
                {intentos > 1 && <td className="px-1 text-center font-black tabular-nums text-slate-900">{verMarca(f.mejor, c.formato) || '–'}</td>}
              </tr>
            )
          })}
        </tbody>
      </table>
      {alActuar && esTiempo && <p className="mt-2 text-xs text-slate-500">Escribe el tiempo en segundos (12.35) o en minutos y segundos (1:05.30). Deja vacío si no terminó. Gana el menor tiempo.</p>}
      {alActuar && !esTiempo && <p className="mt-2 text-xs text-slate-500">Gana el mayor puntaje.</p>}
    </div>
  )
}

// ------------------------------------------------------------------ vista completa de una categoría
export function VistaCompetencia({ cat, alActuar }: { cat: Categoria; alActuar?: Actuar }) {
  const c = cat.competencia
  const nombres = useMemo(() => new Map(cat.equipos.map(e => [e.id, e])), [cat.equipos])
  // Clasificados de los grupos, una vez armada la fase final.
  const pasan = useMemo(() => (c?.grupos && c.llaves ? clasificados(c.grupos, c.clasifican || 2) : []), [c])
  const origen = useMemo(() => new Map(pasan.map(p => [p.id, `${p.puesto}.º del ${p.grupo}`])), [pasan])
  const idsPasan = useMemo(() => new Set(pasan.map(p => p.id)), [pasan])
  if (!c) return null
  if (c.formato === 'tiempos' || c.formato === 'puntos') return <VistaMarcas c={c} equipos={cat.equipos} nombres={nombres} alActuar={alActuar} />
  const hayGrupos = !!c.grupos?.length
  return (
    <div className="space-y-4">
      {hayGrupos && (
        <section>
          <p className="mb-2 text-sm font-black text-slate-900">1. Fase de grupos <span className="font-semibold text-slate-500">· cada robot juega solo contra los de su grupo</span></p>
          <div className="grid gap-2.5 lg:grid-cols-2">
            {c.grupos!.map(g => <VistaGrupo key={g.nombre} g={g} pasan={idsPasan} nombres={nombres} alActuar={alActuar} />)}
          </div>
        </section>
      )}
      {c.llaves && (
        <section>
          {hayGrupos && <p className="mb-2 text-sm font-black text-slate-900">2. Fase final <span className="font-semibold text-slate-500">· aquí se cruzan los clasificados de los distintos grupos</span></p>}
          <VistaLlaves l={c.llaves} nombres={nombres} origen={hayGrupos ? origen : undefined} alActuar={alActuar} />
        </section>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ panel de jueces: crear y administrar
const boton = 'rounded-lg px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50'
const lista = (v: number[]) => (v.length <= 1 ? String(v[0] ?? '') : `${v.slice(0, -1).join(', ')} y ${v[v.length - 1]}`)

export function PanelCompetencia({ cat, alActuar, alPodio }: { cat: Categoria; alActuar: Actuar; alPodio: () => void }) {
  const c = cat.competencia
  const [formato, setFormato] = useState<'tiempos' | 'puntos' | 'llaves' | 'grupos'>('tiempos')
  const [intentos, setIntentos] = useState(3)
  const [tamGrupo, setTamGrupo] = useState(4)
  const [sorteo, setSorteo] = useState(true)
  const [confirmar, setConfirmar] = useState(false)
  const n = cat.equipos.length

  if (!c) {
    const opciones = [
      { id: 'tiempos', titulo: 'Tiempos', texto: 'Vueltas o intentos cronometrados. Gana el menor tiempo.' },
      { id: 'puntos', titulo: 'Puntaje', texto: 'Calificación del jurado. Gana el mayor puntaje.' },
      { id: 'llaves', titulo: 'Llaves 1 vs 1', texto: 'Eliminación directa hasta la final.' },
      { id: 'grupos', titulo: 'Grupos y llaves', texto: 'Todos contra todos dentro de cada grupo y luego llaves.' },
    ] as const
    const tamanos = tamanosGrupos(n, tamGrupo)
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-black">Armar la competencia</h2>
        <p className="mt-0.5 text-sm text-slate-600">Elige cómo se compite en esta categoría.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {opciones.map(o => (
            <button key={o.id} aria-pressed={formato === o.id} onClick={() => setFormato(o.id)}
              className={`rounded-xl border-2 p-3 text-left ${formato === o.id ? 'border-[#E57361] bg-[#E57361]/5' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className="block text-sm font-black text-slate-900">{o.titulo}</span>
              <span className="mt-0.5 block text-xs text-slate-600">{o.texto}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {(formato === 'tiempos' || formato === 'puntos') && (
            <label className="flex items-center gap-2 font-semibold text-slate-700">{formato === 'tiempos' ? 'Vueltas por robot' : 'Calificaciones por robot'}
              <select value={intentos} onChange={e => setIntentos(Number(e.target.value))} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-bold">
                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          )}
          {formato === 'grupos' && (
            <label className="flex items-center gap-2 font-semibold text-slate-700">Grupos de
              <select value={tamGrupo} onChange={e => setTamGrupo(Number(e.target.value))} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-bold">
                <option value={3}>3</option><option value={4}>4</option>
              </select>
            </label>
          )}
          {(formato === 'llaves' || formato === 'grupos') && (
            <label className="flex items-center gap-2 font-semibold text-slate-700">
              <input type="checkbox" checked={sorteo} onChange={e => setSorteo(e.target.checked)} className="h-4 w-4 accent-[#E57361]" /> Sortear al azar
            </label>
          )}
        </div>
        {formato === 'grupos' && n >= 3 && (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Con {n} robots {tamanos.length === 1 ? `sale 1 grupo de ${tamanos[0]}` : `salen ${tamanos.length} grupos: de ${lista(tamanos)} robots`}.
            {tamanos.some(t => t === 2) && ' En el grupo de 2 se juega un solo partido y pasa el ganador.'}
            {' '}Al terminar los grupos decides si pasa 1 o pasan 2 por grupo.
          </p>
        )}
        {(formato === 'llaves' || formato === 'grupos') && !sorteo && <p className="mt-1.5 text-xs text-slate-500">Sin sorteo se usa el orden de inscripción.</p>}
        <button onClick={() => alActuar({ tipo: 'crear', formato, intentos, tamGrupo, sorteo })} className={`${boton} mt-3 bg-[#E57361] text-white hover:bg-[#d4614f]`}>Crear competencia</button>
      </div>
    )
  }

  const esGrupos = c.formato === 'grupos'
  const faltan = esGrupos ? (c.grupos || []).reduce((s, g) => s + g.partidos.filter(p => !jugado(p)).length, 0) : 0
  const enLlave = c.llaves ? new Set(c.llaves.rondas[0].flatMap(p => [p.a, p.b])) : null
  const enGrupos = c.grupos ? new Set(c.grupos.flatMap(g => g.equipos)) : null
  const fuera = c.formato === 'llaves' ? cat.equipos.filter(e => !enLlave!.has(e.id)) : esGrupos ? cat.equipos.filter(e => !enGrupos!.has(e.id)) : []
  const titulo = c.formato === 'tiempos' ? 'Tiempos' : c.formato === 'puntos' ? 'Puntaje' : c.formato === 'llaves' ? 'Llaves' : 'Grupos y llaves'
  const hayGrupoDe2 = esGrupos && !!c.grupos?.some(g => g.equipos.length === 2)

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-base font-black">{titulo}</h2>
        <button onClick={alPodio} className={`${boton} bg-amber-400 text-amber-950 hover:bg-amber-300`}>Pasar podio a resultados</button>
        <button onClick={() => setConfirmar(v => !v)} className={`${boton} border border-slate-300 text-slate-700 hover:bg-slate-100`}>Reiniciar</button>
      </div>
      {confirmar && (
        <div className="tn-entra mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
          <span className="flex-1 text-sm font-semibold text-red-800">¿Borrar esta competencia y todo lo registrado en ella? No se puede deshacer.</span>
          <button onClick={() => { setConfirmar(false); alActuar({ tipo: 'borrar' }) }} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">Sí, borrar</button>
          <button onClick={() => setConfirmar(false)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">No</button>
        </div>
      )}
      {fuera.length > 0 && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">Hay {fuera.length === 1 ? 'un robot inscrito' : `${fuera.length} robots inscritos`} después del sorteo que no está{fuera.length === 1 ? '' : 'n'} en la competencia: {fuera.map(e => e.robot).join(', ')}. Para incluirlos hay que reiniciar y volver a sortear.</p>}

      <VistaCompetencia cat={cat} alActuar={alActuar} />

      {esGrupos && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-slate-300 p-3">
          <p className="text-sm font-black text-slate-900">{c.llaves ? 'Volver a armar la fase final' : 'Armar la fase final'}</p>
          <p className="mt-0.5 text-sm text-slate-600">
            {faltan > 0 ? `Primero termina los grupos: ${faltan === 1 ? 'falta 1 partido' : `faltan ${faltan} partidos`}.` : 'Grupos terminados. Elige cuántos robots pasan por grupo.'}
            {hayGrupoDe2 && ' Del grupo de 2 robots siempre pasa solo el ganador.'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button disabled={faltan > 0} onClick={() => alActuar({ tipo: 'fase_final', clasifican: 1 })} className={`${boton} bg-[#282A36] text-white hover:bg-[#3a3d4d]`}>Pasa solo el 1.º de cada grupo</button>
            <button disabled={faltan > 0} onClick={() => alActuar({ tipo: 'fase_final', clasifican: 2 })} className={`${boton} bg-[#282A36] text-white hover:bg-[#3a3d4d]`}>Pasan el 1.º y el 2.º</button>
          </div>
          {c.llaves && <p className="mt-2 text-xs text-slate-500">Ahora {c.clasifican === 1 ? 'pasa solo el 1.º' : 'pasan el 1.º y el 2.º'}. Si lo cambias, la fase final se arma de nuevo y se borran sus resultados.</p>}
        </div>
      )}
      {(c.formato === 'llaves' || esGrupos) && <p className="mt-2 text-xs text-slate-500">Escribe el marcador y el ganador se marca solo. Si no llevas marcador, o hay empate en llaves, toca el visto del que ganó.</p>}
    </div>
  )
}
