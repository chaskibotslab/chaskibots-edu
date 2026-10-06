'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { ArrowLeft, Loader2, AlertCircle, Save, Upload, Trash2, CheckCircle2, Image as ImageIcon, Code2 } from 'lucide-react'
import { KitFichaDetalle, KitFichaProyecto } from '@/components/KitFichaContent'

const TIPO_LABEL: Record<string, string> = { principal: 'Proyecto principal', adicional: 'Proyecto adicional', practica: 'Práctica' }

function ProyectoEditor({ kitId, proyecto, onSaved }: { kitId: string; proyecto: KitFichaProyecto; onSaved: () => void }) {
  const [titulo, setTitulo] = useState(proyecto.titulo)
  const [descripcion, setDescripcion] = useState(proyecto.descripcion || '')
  const [objetivos, setObjetivos] = useState((proyecto.objetivos || []).join('\n'))
  const [codigo, setCodigo] = useState(proyecto.codigo?.contenido || '')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const esquemaUrl = proyecto.esquema?.tipo === 'imagen' ? proyecto.esquema.url : null
  const esPdf = esquemaUrl?.toLowerCase().endsWith('.pdf')
  const esGenerado = proyecto.esquema?.tipo === 'svg'

  function markDirty() { setDirty(true); setMsg(null) }

  async function guardar() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/kits/${kitId}/proyectos/${proyecto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo, descripcion,
          objetivos: objetivos.split('\n').map(o => o.trim()).filter(Boolean),
          codigo,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Error al guardar')
      setMsg({ type: 'ok', text: 'Guardado' })
      setDirty(false)
      onSaved()
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function subirEsquema(file: File) {
    setUploading(true)
    setMsg(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/admin/kits/${kitId}/proyectos/${proyecto.id}/esquema`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Error al subir')
      setMsg({ type: 'ok', text: 'Esquema actualizado' })
      onSaved()
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message || 'Error al subir el archivo' })
    } finally {
      setUploading(false)
    }
  }

  async function borrarEsquema() {
    if (!confirm('¿Quitar el esquema subido? (si el diagrama automático existe, puedo volver a generarlo)')) return
    setUploading(true)
    try {
      const res = await fetch(`/api/admin/kits/${kitId}/proyectos/${proyecto.id}/esquema`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      onSaved()
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">{TIPO_LABEL[proyecto.tipo] || proyecto.tipo}</span>
        {msg && (
          <span className={`text-xs font-medium flex items-center gap-1 ${msg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
            {msg.type === 'ok' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {msg.text}
          </span>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">Título</label>
        <input value={titulo} onChange={e => { setTitulo(e.target.value); markDirty() }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">Descripción</label>
        <textarea value={descripcion} onChange={e => { setDescripcion(e.target.value); markDirty() }} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-y" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">Objetivos (uno por línea)</label>
        <textarea value={objetivos} onChange={e => { setObjetivos(e.target.value); markDirty() }} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-y font-mono" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> Código Arduino</label>
        <textarea value={codigo} onChange={e => { setCodigo(e.target.value); markDirty() }} rows={10} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono resize-y" spellCheck={false} />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Esquema de conexión</label>
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
          {esquemaUrl && !esPdf && <img src={esquemaUrl} alt="esquema" className="max-h-48 rounded-lg border border-slate-200" />}
          {esPdf && <a href={esquemaUrl!} target="_blank" rel="noopener noreferrer" className="text-chaski-primary text-sm underline">Ver PDF subido</a>}
          {esGenerado && <p className="text-xs text-slate-400 italic">Usando el diagrama generado automáticamente.</p>}
          {!proyecto.esquema && <p className="text-xs text-slate-400 italic">Sin esquema (usa el del proyecto principal si aplica).</p>}
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) subirEsquema(f) }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-50">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Subir imagen o PDF
            </button>
            {esquemaUrl && (
              <button onClick={borrarEsquema} disabled={uploading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 text-xs font-medium hover:bg-red-50 rounded-lg disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" /> Quitar
              </button>
            )}
          </div>
        </div>
      </div>

      <button onClick={guardar} disabled={!dirty || saving}
        className="inline-flex items-center gap-2 px-4 py-2 bg-chaski-primary text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-chaski-primary/90">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </button>
    </div>
  )
}

export default function KitEditarPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()

  const [kit, setKit] = useState<KitFichaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    if (!params?.id) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/kits/${params.id}`)
      const data = await res.json()
      if (!data.success) setError(data.error || 'No se pudo cargar el kit')
      else setKit(data.kit)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login?redirect=/admin/kits')
    if (!isLoading && isAuthenticated && !isAdmin) router.push('/')
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (!isAdmin) return
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, isAdmin])

  if (isLoading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-chaski-primary" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/admin/kits" className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="font-bold text-chaski-dark">{kit?.name || 'Editar kit'}</h1>
            <p className="text-xs text-slate-500">Edita texto, código y el esquema de cada proyecto (sin tocar la base de datos)</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-chaski-primary" /></div>}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
        {kit && (
          <div className="space-y-5">
            {kit.proyectos
              .slice()
              .sort((a, b) => a.orden - b.orden)
              .map(p => <ProyectoEditor key={p.id} kitId={kit.id} proyecto={p} onSaved={cargar} />)}
          </div>
        )}
      </main>
    </div>
  )
}
