'use client'

import { useMemo, useState } from 'react'
import { Package, Monitor, Users, Rocket, ClipboardCheck, ChevronDown, Printer, Target, CheckCircle2, MapPin } from 'lucide-react'
import { herramientaCorta, type PlanAnual, type TipoClase, type ClasePlan } from '@/data/planAnual'

const TIPOS: Record<TipoClase, { nombre: string; icono: typeof Package; chip: string; borde: string }> = {
  kit: { nombre: 'Kit', icono: Package, chip: 'bg-amber-100 text-amber-800', borde: 'border-l-amber-400' },
  simulador: { nombre: 'Simulador', icono: Monitor, chip: 'bg-sky-100 text-sky-800', borde: 'border-l-sky-400' },
  'sin-pantalla': { nombre: 'Sin pantalla', icono: Users, chip: 'bg-emerald-100 text-emerald-800', borde: 'border-l-emerald-400' },
  proyecto: { nombre: 'Proyecto', icono: Rocket, chip: 'bg-violet-100 text-violet-800', borde: 'border-l-violet-400' },
  evaluacion: { nombre: 'Evaluación', icono: ClipboardCheck, chip: 'bg-rose-100 text-rose-800', borde: 'border-l-rose-400' },
}

function Clase({ clase, abierta, alternar }: { clase: ClasePlan; abierta: boolean; alternar: () => void }) {
  const t = TIPOS[clase.tipo]
  const Icono = t.icono
  return (
    <div className={`plan-clase bg-white border border-slate-200 border-l-4 ${t.borde} rounded-xl overflow-hidden`}>
      <button type="button" onClick={alternar} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50" aria-expanded={abierta}>
        <span className="shrink-0 w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center tabular-nums">{clase.n}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-chaski-dark">{clase.titulo}</span>
          <span className="block text-sm text-slate-500 truncate">{clase.objetivo}</span>
        </span>
        <span className={`shrink-0 hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${t.chip}`}>
          <Icono className="w-3.5 h-3.5" />{t.nombre}
        </span>
        <ChevronDown className={`plan-flecha shrink-0 w-4 h-4 text-slate-400 transition-transform ${abierta ? 'rotate-180' : ''}`} />
      </button>
      <div className={`plan-detalle px-4 pb-4 pt-1 space-y-3 text-sm ${abierta ? '' : 'hidden'}`}>
        <p className="flex gap-2 text-slate-700"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" /><span><b>Con qué se trabaja:</b> {clase.herramienta}</span></p>
        <p className="flex gap-2 text-slate-700"><Target className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" /><span><b>Objetivo:</b> {clase.objetivo}</span></p>
        <div>
          <p className="font-semibold text-slate-700 mb-1">Qué se hace, en orden:</p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-600">
            {clase.pasos.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </div>
        <p className="flex gap-2 text-slate-700 bg-slate-50 rounded-lg p-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" /><span><b>Qué queda al terminar:</b> {clase.evidencia}</span></p>
      </div>
    </div>
  )
}

export default function PlanAnualView({ plan }: { plan: PlanAnual }) {
  const todas = useMemo(() => plan.trimestres.flatMap(t => t.clases), [plan])
  const [abiertas, setAbiertas] = useState<Set<number>>(new Set([1]))
  const [filtro, setFiltro] = useState<TipoClase | 'todas'>('todas')

  const uso = useMemo(() => {
    const mapa = new Map<string, number[]>()
    for (const c of todas) {
      const k = herramientaCorta(c.herramienta)
      if (k === 'Sin pantalla ni kit') continue
      mapa.set(k, [...(mapa.get(k) || []), c.n])
    }
    return Array.from(mapa.entries()).sort((a, b) => a[1][0] - b[1][0])
  }, [todas])

  const conteo = useMemo(() => {
    const c: Record<string, number> = {}
    for (const x of todas) c[x.tipo] = (c[x.tipo] || 0) + 1
    return c
  }, [todas])

  const alternar = (n: number) => setAbiertas(prev => {
    const s = new Set(prev)
    if (s.has(n)) s.delete(n); else s.add(n)
    return s
  })
  const todasAbiertas = abiertas.size === todas.length

  return (
    <div className="plan-anual space-y-6">
      <style>{`@media print {
        .plan-anual .plan-detalle { display: block !important; }
        .plan-anual .plan-no-imprimir, .plan-anual .plan-flecha { display: none !important; }
        .plan-anual .plan-clase { break-inside: avoid; }
      }`}</style>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-chaski-dark">Plan del año · {plan.grado}</h2>
            <p className="text-slate-500 text-sm">{todas.length} clases · {plan.trimestres.length} trimestres · clases de {plan.minutos} minutos (una por semana)</p>
          </div>
          <div className="plan-no-imprimir flex gap-2">
            <button type="button" onClick={() => setAbiertas(todasAbiertas ? new Set() : new Set(todas.map(c => c.n)))} className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
              {todasAbiertas ? 'Cerrar todas' : 'Abrir todas'}
            </button>
            <button type="button" onClick={() => window.print()} className="text-sm px-3 py-2 rounded-lg bg-chaski-dark text-white inline-flex items-center gap-2 hover:opacity-90">
              <Printer className="w-4 h-4" />Imprimir
            </button>
          </div>
        </div>
        <p className="mt-3 text-slate-700">{plan.resumen}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-chaski-dark mb-2">Cómo se trabaja con este grupo</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
            {plan.comoTrabajar.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-chaski-dark mb-2">Qué se usa y en qué clases</h3>
          <ul className="space-y-2 text-sm">
            {uso.map(([nombre, clases]) => (
              <li key={nombre} className="flex gap-3 justify-between border-b border-slate-100 pb-2 last:border-0">
                <span className="text-slate-700 font-medium">{nombre}</span>
                <span className="text-slate-500 text-right tabular-nums">clases {clases.join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="plan-no-imprimir flex flex-wrap gap-2">
        <button type="button" onClick={() => setFiltro('todas')} className={`text-sm px-3 py-1.5 rounded-full border ${filtro === 'todas' ? 'bg-chaski-dark text-white border-chaski-dark' : 'bg-white text-slate-600 border-slate-200'}`}>
          Todas ({todas.length})
        </button>
        {(Object.keys(TIPOS) as TipoClase[]).map(k => (
          <button key={k} type="button" onClick={() => setFiltro(k)} className={`text-sm px-3 py-1.5 rounded-full border ${filtro === k ? 'bg-chaski-dark text-white border-chaski-dark' : 'bg-white text-slate-600 border-slate-200'}`}>
            {TIPOS[k].nombre} ({conteo[k] || 0})
          </button>
        ))}
      </div>

      {plan.trimestres.map((t, i) => {
        const clases = t.clases.filter(c => filtro === 'todas' || c.tipo === filtro)
        if (!clases.length) return null
        return (
          <section key={i} className="space-y-2">
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trimestre {i + 1} · clases {t.clases[0].n} a {t.clases[t.clases.length - 1].n}</p>
              <h3 className="text-xl font-bold text-chaski-dark">{t.titulo}</h3>
              <p className="text-sm text-slate-500">{t.proposito}</p>
            </div>
            {clases.map(c => <Clase key={c.n} clase={c} abierta={abiertas.has(c.n)} alternar={() => alternar(c.n)} />)}
          </section>
        )
      })}
    </div>
  )
}
