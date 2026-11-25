'use client'

/**
 * Botón + ventana única para enviar una tarea desde cualquier simulador.
 * - La entrega queda ligada a la cuenta del alumno (la identidad la pone el servidor desde la sesión).
 * - El alumno puede escribir un mensaje y, si su nivel tiene tareas, elegir a cuál corresponde.
 * - El profesor la ve en /admin/calificar (filtrada por los niveles de sus grupos).
 */
import { useState } from 'react'
import { Send, Loader2, X, GraduationCap } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export interface Entrega {
  /** Resumen legible de lo que hizo el alumno (va a "Respuestas" que ve el profesor). */
  output: string
  /** Código o programa generado (opcional). */
  code?: string
  /** Datos estructurados del trabajo (opcional). */
  files?: any
}

interface TareaLite { id: string; title: string; points: number }

export default function EnviarTarea({
  simulador,
  sigla,
  obtenerEntrega,
  botonClassName,
}: {
  simulador: string
  /** Prefijo corto para el código automático de la entrega, ej. "CB", "IA", "3D", "ROBLOX". */
  sigla: string
  /** Se llama al momento de enviar para construir la entrega con el estado actual. */
  obtenerEntrega: () => Entrega
  /** Clases del botón para que combine con el tema de cada simulador. */
  botonClassName?: string
}) {
  const { user } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tareas, setTareas] = useState<TareaLite[]>([])
  const [tareaId, setTareaId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  if (!user?.name) return null

  const abrir = async () => {
    setError('')
    setAbierto(true)
    if (user.levelId && tareas.length === 0) {
      try {
        const r = await fetch(`/api/tasks?levelId=${encodeURIComponent(user.levelId)}`)
        const d = await r.json()
        if (Array.isArray(d.tasks)) setTareas(d.tasks.map((t: any) => ({ id: t.id, title: t.title, points: t.points })))
      } catch { /* sin tareas del profesor: se envía igual */ }
    }
  }

  const enviar = async () => {
    setEnviando(true)
    setError('')
    try {
      const e = obtenerEntrega()
      const tarea = tareas.find(t => t.id === tareaId)
      const nota = mensaje.trim()
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: tarea ? tarea.id : `${sigla}-${Date.now().toString(36).toUpperCase()}`,
          lessonId: tarea?.id,
          output: [nota && `📝 ${nota}`, tarea && `Tarea: ${tarea.title} (${tarea.points} pts)`, e.output].filter(Boolean).join('\n\n'),
          code: e.code,
          files: e.files,
        }),
      })
      if (res.ok) { setEnviado(true); setAbierto(false); setMensaje(''); setTareaId(''); setTimeout(() => setEnviado(false), 4000) }
      else setError('No se pudo enviar. Inicia sesión e inténtalo de nuevo.')
    } catch { setError('No se pudo enviar. Revisa tu conexión.') }
    setEnviando(false)
  }

  return (
    <>
      <button onClick={abrir} disabled={enviado} title={`Enviar la tarea como ${user.name}`}
        className={botonClassName || 'flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/20 px-2.5 py-1 text-[11px] font-medium text-green-300 transition-colors hover:bg-green-500/30 disabled:opacity-70'}>
        <Send className="h-3.5 w-3.5" /> {enviado ? '✓ Enviado' : 'Enviar tarea'}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 p-4" onPointerDown={() => !enviando && setAbierto(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-slate-900 shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-green-100 text-green-700"><Send className="h-4 w-4" /></span>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900">Enviar tarea a tu profesor</h3>
                <p className="truncate text-[11px] text-slate-500">Desde {simulador} · como <b>{user.name}</b></p>
              </div>
              <button onClick={() => setAbierto(false)} disabled={enviando} aria-label="Cerrar" className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
            </div>

            {tareas.length > 0 && (
              <div className="mb-3">
                <label className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400"><GraduationCap className="h-3.5 w-3.5" /> ¿A qué tarea corresponde? (opcional)</label>
                <select value={tareaId} onChange={e => setTareaId(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-green-500 focus:outline-none">
                  <option value="">— Entrega libre (sin tarea específica) —</option>
                  {tareas.map(t => <option key={t.id} value={t.id}>{t.title} · {t.points} pts</option>)}
                </select>
              </div>
            )}

            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Mensaje para tu profesor (opcional)</label>
            <textarea value={mensaje} onChange={e => setMensaje(e.target.value.slice(0, 500))} rows={4} autoFocus
              placeholder="Cuéntale qué hiciste, qué aprendiste o qué te costó…"
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-green-500 focus:outline-none" />
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Se adjunta tu trabajo automáticamente.</span>
              <span>{mensaje.length}/500</span>
            </div>

            {error && <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAbierto(false)} disabled={enviando} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50">Cancelar</button>
              <button onClick={enviar} disabled={enviando} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60">
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {enviando ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
