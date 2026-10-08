'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload, Trash2, Video } from 'lucide-react'
import type { KitGuia } from '@/lib/kitGuia'

// Editor de la parte visual de una guía: video, foto del proyecto
// terminado, foto de cada pieza y de cada paso, y el texto de los pasos.

async function subirFoto(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('bucket', 'lesson-images')
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'No se pudo subir la foto')
  return data.url as string
}

function FotoCampo({ url, onChange }: { url?: string; onChange: (url: string | undefined) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const elegir = async (file: File) => {
    setSubiendo(true)
    setError('')
    try {
      onChange(await subirFoto(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {url && <img src={url} alt="" className="h-14 w-20 object-cover rounded-lg border border-slate-200" />}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) elegir(f); e.target.value = '' }} />
      <button type="button" onClick={() => ref.current?.click()} disabled={subiendo}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-50">
        {subiendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {url ? 'Cambiar foto' : 'Subir foto'}
      </button>
      {url && (
        <button type="button" onClick={() => onChange(undefined)} className="inline-flex items-center gap-1 px-2 py-1.5 text-red-600 text-xs font-medium hover:bg-red-50 rounded-lg">
          <Trash2 className="w-3.5 h-3.5" /> Quitar
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}

export default function GuiaEditor({ guia, onChange }: { guia: KitGuia; onChange: (guia: KitGuia) => void }) {
  const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm'

  return (
    <div className="border border-chaski-primary/20 rounded-xl p-4 bg-chaski-primary/5 space-y-5">
      <div>
        <p className="text-sm font-bold text-slate-800">Guía paso a paso: video y fotos</p>
        <p className="text-xs text-slate-500">Lo que subas aquí aparece en la lección del estudiante. Recuerda pulsar «Guardar cambios».</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Video del proyecto (enlace de YouTube o Drive)</label>
        <input value={guia.reto.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=..." className={input}
          onChange={e => onChange({ ...guia, reto: { ...guia.reto, videoUrl: e.target.value || undefined } })} />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">Foto del proyecto terminado</label>
        <FotoCampo url={guia.reto.fotoUrl} onChange={url => onChange({ ...guia, reto: { ...guia.reto, fotoUrl: url } })} />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-2 block">Fotos de las piezas</label>
        <div className="space-y-2">
          {guia.piezas.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 bg-white rounded-lg border border-slate-200 px-3 py-2">
              <span className="text-sm text-slate-700">{p.nombre}</span>
              <FotoCampo url={p.fotoUrl} onChange={url => onChange({ ...guia, piezas: guia.piezas.map((x, j) => (j === i ? { ...x, fotoUrl: url } : x)) })} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-2 block">Pasos del armado</label>
        <div className="space-y-3">
          {guia.pasos.map((p, i) => {
            const set = (patch: Partial<typeof p>) => onChange({ ...guia, pasos: guia.pasos.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
            return (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-chaski-primary">Paso {i + 1}</p>
                <input value={p.titulo} onChange={e => set({ titulo: e.target.value })} className={input} />
                <textarea value={p.texto} onChange={e => set({ texto: e.target.value })} rows={2} className={`${input} resize-y`} />
                <FotoCampo url={p.fotoUrl} onChange={url => set({ fotoUrl: url })} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
