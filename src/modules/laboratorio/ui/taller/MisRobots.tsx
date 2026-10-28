'use client'

// Ventana «Mis robots»: los robots guardados en la cuenta, con su historial.

import { useEffect, useState } from 'react'
import { Bot, Clock, FolderOpen, History, Loader2, Trash2, X } from 'lucide-react'
import type { RobotDoc } from '../../robots/doc'

interface Fila { id: string; nombre: string; actualizado: string; piezas: number }

const fecha = (iso: string) => new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })

export default function MisRobots({ actual, onAbrir, onCerrar }: { actual: string | null; onAbrir: (doc: RobotDoc, id: string) => void; onCerrar: () => void }) {
  const [robots, setRobots] = useState<Fila[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [versiones, setVersiones] = useState<{ robot: string; lista: { id: string; creado: string }[] } | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  const cargar = async () => {
    setError(null)
    const r = await fetch('/api/lab/robots')
    const d = await r.json().catch(() => ({}))
    if (!r.ok) { setError(d.error ?? 'No se pudo cargar la lista'); setRobots([]); return }
    setRobots(d.robots)
  }
  useEffect(() => { cargar() }, [])

  const abrir = async (id: string, version?: string) => {
    setOcupado(id + (version ?? ''))
    const r = await fetch(`/api/lab/robots/${id}${version ? `?version=${version}` : ''}`)
    const d = await r.json().catch(() => ({}))
    setOcupado(null)
    if (!r.ok) { setError(d.error ?? 'No se pudo abrir'); return }
    onAbrir({ ...d.doc, nombre: d.nombre }, id)
  }

  const borrar = async (f: Fila) => {
    if (!window.confirm(`¿Borrar «${f.nombre}» y todo su historial? No se puede deshacer.`)) return
    setOcupado(f.id)
    const r = await fetch(`/api/lab/robots/${f.id}`, { method: 'DELETE' })
    setOcupado(null)
    if (!r.ok) { setError('No se pudo borrar'); return }
    setRobots(rs => (rs ?? []).filter(x => x.id !== f.id))
  }

  const verVersiones = async (id: string) => {
    if (versiones?.robot === id) { setVersiones(null); return }
    const r = await fetch(`/api/lab/robots/${id}?versiones`)
    const d = await r.json().catch(() => ({}))
    if (r.ok) setVersiones({ robot: id, lista: d.versiones })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onCerrar}>
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-labdark-surface p-4 shadow-2xl sm:rounded-2xl sm:p-6" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Mis robots</h2>
          <button onClick={onCerrar} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{error}</div>}
        {robots === null ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
        ) : robots.length === 0 && !error ? (
          <p className="py-8 text-center text-sm text-slate-400">Todavía no guardaste robots. Usa «Guardar» para guardar el que estás armando.</p>
        ) : (
          <ul className="space-y-2">
            {robots.map(f => (
              <li key={f.id} className={`rounded-xl border p-3 ${f.id === actual ? 'border-chaski-primary/50 bg-chaski-primary/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 shrink-0 text-chaski-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-white">{f.nombre}{f.id === actual && <span className="ml-2 text-[10px] text-chaski-primary">(abierto)</span>}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400"><Clock className="h-3 w-3" /> {fecha(f.actualizado)} · {f.piezas} piezas</div>
                  </div>
                  <button onClick={() => verVersiones(f.id)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" title="Versiones anteriores"><History className="h-4 w-4" /></button>
                  <button onClick={() => abrir(f.id)} disabled={!!ocupado} className="flex items-center gap-1 rounded-lg bg-chaski-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                    {ocupado === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderOpen className="h-3.5 w-3.5" />} Abrir
                  </button>
                  <button onClick={() => borrar(f)} disabled={!!ocupado} className="rounded-lg p-2 text-red-300 hover:bg-red-500/10" title="Borrar"><Trash2 className="h-4 w-4" /></button>
                </div>
                {versiones?.robot === f.id && (
                  <div className="mt-2 border-t border-white/5 pt-2">
                    <div className="mb-1 text-[11px] text-slate-500">Versiones guardadas (las últimas 20):</div>
                    <div className="flex flex-wrap gap-1.5">
                      {versiones.lista.map((v, i) => (
                        <button key={v.id} onClick={() => abrir(f.id, v.id)} className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5">
                          {i === 0 ? 'Última · ' : ''}{fecha(v.creado)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
