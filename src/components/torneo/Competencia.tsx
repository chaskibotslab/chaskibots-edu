'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Categoria, Equipo } from './comun'
import {
  Accion, Competencia, Grupo, Llaves, Partido,
  clasificacion, jugado, leerMarca, nombreRonda, tablaGrupo, verMarca,
} from '@/lib/torneoCompetencia'

// Si se pasa `alActuar`, la vista es editable (panel de jueces). Sin ella es solo lectura (página pública).
type Actuar = (accion: Accion) => void
type Nombres = Map<string, Equipo>

const robot = (n: Nombres, id: string | null) => (id ? n.get(id)?.robot || 'Retirado' : '')

// ------------------------------------------------------------------ un enfrentamiento
function Lado({ p, lado, nombres, alActuar }: { p: Partido; lado: 'a' | 'b'; nombres: Nombres; alActuar?: Actuar }) {
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
        {id && nombres.get(id)?.equipo && <p className="truncate text-[11px] leading-tight text-slate-500">{nombres.get(id)!.equipo}</p>}
      </div>
      {alActuar && listo ? (
        <>
          <input key={`${p.id}${lado}${goles ?? ''}`} defaultValue={goles ?? ''} inputMode="numeric" maxLength={3} aria-label={`Marcador de ${robot(nombres, id)}`}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            onBlur={e => {
              const t = e.target.value.trim(); const v = t === '' ? null : Number(t)
              if (v !== null && !(Number.isInteger(v) && v >= 0)) { e.target.value = goles === null ? '' : String(goles); return }
              if (v !== goles) alActuar(lado === 'a' ? { tipo: 'partido', partidoId: p.id, ga: v } : { tipo: 'partido', partidoId: p.id, gb: v })
            }}
            className="h-8 w-10 rounded-md border border-slate-300 bg-white text-center text-sm font-bold tabular-nums outline-none focus:border-[#E57361] focus:ring-2 focus:ring-[#E57361]/25" />
          <button aria-pressed={gano} aria-label={`Ganó ${robot(nombres, id)}`} title="Marcar ganador"
            onClick={() => alActuar({ tipo: 'partido', partidoId: p.id, ganador: gano ? null : id })}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${gano ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700'}`}>
            <Check className="h-4 w-4" strokeWidth={3} />
          </button>
        </>
      ) : (
        <>
          {goles !== null && <span className={`w-6 shrink-0 text-center text-sm tabular-nums ${gano ? 'font-black text-emerald-900' : 'font-bold text-slate-600'}`}>{goles}</span>}
          {gano && goles === null && <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} aria-label="Ganador" />}
        </>
      )}
    </div>
  )
}

function Cruce({ p, nombres, alActuar }: { p: Partido; nombres: Nombres; alActuar?: Actuar }) {
  // Cruce de primera ronda sin rival: pasa directo.
  if ((p.a === null) !== (p.b === null) && p.ganador) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-2">
        <p className="truncate text-sm font-bold text-slate-800">{robot(nombres, p.ganador)}</p>
        <p className="text-[11px] font-semibold text-slate-500">Pasa directo</p>
      </div>
    )
  }
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Lado p={p} lado="a" nombres={nombres} alActuar={alActuar} />
      <Lado p={p} lado="b" nombres={nombres} alActuar={alActuar} />
    </div>
  )
}

// ------------------------------------------------------------------ llaves
function VistaLlaves({ l, nombres, alActuar }: { l: Llaves; nombres: Nombres; alActuar?: Actuar }) {
  const ancho = alActuar ? 'w-64' : 'w-48'
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-2">
      <div className="flex min-w-max gap-3">
        {l.rondas.map((ronda, r) => (
          <div key={r} className={`flex shrink-0 flex-col ${ancho}`}>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">{nombreRonda(r, l.rondas.length)}</p>
            <div className="flex flex-1 flex-col justify-around gap-2">
              {ronda.map(p => <Cruce key={p.id} p={p} nombres={nombres} alActuar={alActuar} />)}
            </div>
            {r === l.rondas.length - 1 && l.tercero && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Tercer lugar</p>
                <Cruce p={l.tercero} nombres={nombres} alActuar={alActuar} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ grupos
function VistaGrupo({ g, nombres, alActuar }: { g: Grupo; nombres: Nombres; alActuar?: Actuar }) {
  const tabla = useMemo(() => tablaGrupo(g), [g])
  const conGoles = g.partidos.some(p => p.ga !== null || p.gb !== null)
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <p className="mb-1.5 text-sm font-black text-slate-800">{g.nombre}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] font-bold uppercase text-slate-500">
            <th className="py-1 text-left font-bold">Robot</th>
            <th className="w-7 text-center font-bold" title="Jugados">J</th>
            <th className="w-7 text-center font-bold" title="Ganados">G</th>
            <th className="w-7 text-center font-bold" title="Empatados">E</th>
            <th className="w-7 text-center font-bold" title="Perdidos">P</th>
            {conGoles && <th className="w-8 text-center font-bold" title="Diferencia de goles">DG</th>}
            <th className="w-8 text-center font-bold" title="Puntos">Pts</th>
          </tr>
        </thead>
        <tbody>
          {tabla.map((f, i) => (
            <tr key={f.id} className="border-t border-slate-200">
              <td className="max-w-0 py-1.5 pr-1"><span className="flex items-center gap-1.5"><span className="w-3 shrink-0 text-xs font-bold tabular-nums text-slate-400">{i + 1}</span><span className="truncate font-bold text-slate-800">{robot(nombres, f.id)}</span></span></td>
              <td className="text-center tabular-nums text-slate-600">{f.pj}</td>
              <td className="text-center tabular-nums text-slate-600">{f.g}</td>
              <td className="text-center tabular-nums text-slate-600">{f.e}</td>
              <td className="text-center tabular-nums text-slate-600">{f.p}</td>
              {conGoles && <td className="text-center tabular-nums text-slate-600">{f.gf - f.gc > 0 ? `+${f.gf - f.gc}` : f.gf - f.gc}</td>}
              <td className="text-center font-black tabular-nums text-slate-900">{f.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 grid gap-1.5">
        {g.partidos.map(p => <Cruce key={p.id} p={p} nombres={nombres} alActuar={alActuar} />)}
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
            <th className="w-7 py-1 text-center font-bold">#</th>
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
                <td className="text-center text-xs font-black tabular-nums text-slate-500">{puesto ?? '–'}</td>
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
  if (!c) return null
  if (c.formato === 'tiempos' || c.formato === 'puntos') return <VistaMarcas c={c} equipos={cat.equipos} nombres={nombres} alActuar={alActuar} />
  return (
    <div className="space-y-3">
      {c.grupos && c.grupos.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {c.grupos.map(g => <VistaGrupo key={g.nombre} g={g} nombres={nombres} alActuar={alActuar} />)}
        </div>
      )}
      {c.llaves && (
        <div>
          {c.formato === 'grupos' && <p className="mb-1.5 text-sm font-black text-slate-800">Fase final</p>}
          <VistaLlaves l={c.llaves} nombres={nombres} alActuar={alActuar} />
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ panel de jueces: crear y administrar
const boton = 'rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-60'

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
      { id: 'grupos', titulo: 'Grupos y llaves', texto: 'Todos contra todos en grupos y luego llaves.' },
    ] as const
    const numGrupos = Math.ceil(n / tamGrupo)
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
              {n >= 3 && <span className="font-normal text-slate-500">({numGrupos} {numGrupos === 1 ? 'grupo' : 'grupos'} con {n} robots)</span>}
            </label>
          )}
          {(formato === 'llaves' || formato === 'grupos') && (
            <label className="flex items-center gap-2 font-semibold text-slate-700">
              <input type="checkbox" checked={sorteo} onChange={e => setSorteo(e.target.checked)} className="h-4 w-4 accent-[#E57361]" /> Sortear al azar
            </label>
          )}
        </div>
        {(formato === 'llaves' || formato === 'grupos') && !sorteo && <p className="mt-1.5 text-xs text-slate-500">Sin sorteo se usa el orden de inscripción: el 1 contra el último, y así.</p>}
        <button onClick={() => alActuar({ tipo: 'crear', formato, intentos, tamGrupo, sorteo })} className={`${boton} mt-3 bg-[#E57361] text-white hover:bg-[#d4614f]`}>Crear competencia</button>
      </div>
    )
  }

  const esGrupos = c.formato === 'grupos'
  const gruposListos = esGrupos && !!c.grupos?.every(g => g.partidos.every(jugado))
  const enLlave = c.llaves ? new Set(c.llaves.rondas[0].flatMap(p => [p.a, p.b])) : null
  const enGrupos = c.grupos ? new Set(c.grupos.flatMap(g => g.equipos)) : null
  const fuera = c.formato === 'llaves' ? cat.equipos.filter(e => !enLlave!.has(e.id)) : esGrupos ? cat.equipos.filter(e => !enGrupos!.has(e.id)) : []
  const titulo = c.formato === 'tiempos' ? 'Tiempos' : c.formato === 'puntos' ? 'Puntaje' : c.formato === 'llaves' ? 'Llaves' : 'Grupos'

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
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
          <span className="flex-1 text-sm font-semibold text-slate-700">{c.llaves ? 'Volver a armar la fase final con la tabla actual:' : gruposListos ? 'Grupos terminados. Arma la fase final:' : 'Cuando terminen los grupos, arma la fase final:'}</span>
          <button onClick={() => alActuar({ tipo: 'fase_final', clasifican: 1 })} className={`${boton} bg-slate-800 text-white hover:bg-slate-700`}>Pasa el 1.º de cada grupo</button>
          <button onClick={() => alActuar({ tipo: 'fase_final', clasifican: 2 })} className={`${boton} bg-slate-800 text-white hover:bg-slate-700`}>Pasan 1.º y 2.º</button>
        </div>
      )}
      {(c.formato === 'llaves' || esGrupos) && <p className="mt-2 text-xs text-slate-500">Escribe el marcador y el ganador se marca solo. Si no llevas marcador, o hay empate en llaves, toca el visto del que ganó.</p>}
    </div>
  )
}
