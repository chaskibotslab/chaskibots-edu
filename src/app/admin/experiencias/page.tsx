'use client'

import { useState, useEffect, useCallback, useMemo, DragEvent } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Save, Trash2, Search, Upload, Loader2,
  Camera, Image as ImageIcon, Video, Building2, Hash,
  AlertCircle, CheckCircle2, Eye, EyeOff
} from 'lucide-react'

interface Experiencia {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  url: string
  institucion: string
  orden: number
  activo: boolean
}

type ExpForm = Omit<Experiencia, 'id'>

const BLANK: ExpForm = {
  titulo: '',
  descripcion: '',
  tipo: 'foto',
  url: '',
  institucion: '',
  orden: 0,
  activo: true,
}

export default function ExperienciasAdminPage() {
  const router = useRouter()
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth()

  const [items, setItems] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState<ExpForm>({ ...BLANK })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login?redirect=/admin/experiencias')
  }, [isLoading, isAuthenticated, isAdmin, router])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/experiencias?all=true')
      const data = await res.json()
      setItems(data.experiencias || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  useEffect(() => {
    if (isCreating) {
      setForm({ ...BLANK, orden: items.length })
      setDirty(false)
      return
    }
    const it = items.find(x => x.id === selectedId)
    if (it) {
      setForm({
        titulo: it.titulo,
        descripcion: it.descripcion,
        tipo: it.tipo || 'foto',
        url: it.url,
        institucion: it.institucion,
        orden: it.orden,
        activo: it.activo,
      })
      setDirty(false)
    }
  }, [selectedId, isCreating, items])

  const update = <K extends keyof ExpForm>(key: K, value: ExpForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!form.titulo) return showToast('error', 'El título es obligatorio')
    if (!form.url) return showToast('error', 'Sube una foto o video primero')
    setSaving(true)
    try {
      const method = isCreating ? 'POST' : 'PUT'
      const payload = isCreating ? { ...form } : { ...form, id: selectedId }
      const res = await fetch('/api/experiencias', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        showToast('success', isCreating ? 'Experiencia creada' : 'Guardado')
        await loadItems()
        if (isCreating) {
          setIsCreating(false)
          setSelectedId(data.experiencia?.id || null)
        }
        setDirty(false)
      } else {
        const err = await res.json()
        showToast('error', err.error || 'Error al guardar')
      }
    } catch {
      showToast('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedId || !confirm('¿Eliminar esta experiencia de la galería?')) return
    try {
      await fetch(`/api/experiencias?id=${selectedId}`, { method: 'DELETE' })
      showToast('success', 'Experiencia eliminada')
      setSelectedId(null)
      loadItems()
    } catch {
      showToast('error', 'Error al eliminar')
    }
  }

  const handleNew = () => {
    setIsCreating(true)
    setSelectedId(null)
  }

  const filtered = useMemo(() => {
    return items.filter(it =>
      !search ||
      it.titulo.toLowerCase().includes(search.toLowerCase()) ||
      it.institucion.toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
      </div>
    )
  }

  const hasSelection = isCreating || selectedId

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden animate-fade-in">
      <header className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900">Galería de Experiencias</h1>
            <p className="text-xs text-slate-500">{items.length} elementos · fotos y videos que se muestran en la home</p>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 bg-chaski-primary text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm hover:bg-chaski-primary/90 hover:shadow-lg active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Subir foto o video</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LIST */}
        <aside className={`${hasSelection ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 lg:w-[420px] border-r border-slate-200 bg-white shrink-0`}>
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título o institución..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-chaski-primary animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-700 font-semibold mb-1">Sin experiencias todavía</p>
                <p className="text-slate-500 text-sm mb-3">Sube tu primera foto o video</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                {filtered.map((it, i) => (
                  <ExpItem
                    key={it.id}
                    item={it}
                    index={i}
                    active={selectedId === it.id}
                    onClick={() => { setSelectedId(it.id); setIsCreating(false) }}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* DETAIL */}
        <main className={`${hasSelection ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {!hasSelection ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-sm animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-chaski-primary/20 to-chaski-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-chaski-primary" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Selecciona un elemento</h2>
                <p className="text-slate-500 text-sm mb-5">
                  Elegí una foto o video de la lista, o subí uno nuevo.
                </p>
                <button
                  onClick={handleNew}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-chaski-primary to-chaski-secondary text-white font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:shadow-chaski-primary/25 active:scale-[0.98] transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Subir foto o video
                </button>
              </div>
            </div>
          ) : (
            <ExpEditor
              form={form}
              setField={update}
              dirty={dirty}
              saving={saving}
              isCreating={isCreating}
              onClose={() => { setSelectedId(null); setIsCreating(false) }}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-slate-900/90 text-white' : 'bg-red-500/95 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpItem({ item, active, onClick, index }: { item: Experiencia; active: boolean; onClick: () => void; index?: number }) {
  return (
    <button
      onClick={onClick}
      style={index !== undefined ? { animationDelay: `${index * 0.03}s` } : undefined}
      className={`relative aspect-square rounded-xl overflow-hidden border-2 text-left animate-fade-in ${
        active ? 'border-chaski-primary' : 'border-transparent hover:border-slate-200'
      }`}
    >
      {item.tipo === 'video' ? (
        <video src={item.url} className="w-full h-full object-cover" muted />
      ) : (
        <img src={item.url} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.2')} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
      {item.tipo === 'video' && (
        <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1">
          <Video className="w-3 h-3 text-white" />
        </div>
      )}
      {!item.activo && (
        <div className="absolute top-1.5 left-1.5 bg-amber-500 rounded-full p-1">
          <EyeOff className="w-3 h-3 text-white" />
        </div>
      )}
      <p className="absolute bottom-1.5 left-2 right-2 text-white text-xs font-semibold truncate">{item.titulo}</p>
    </button>
  )
}

function ExpEditor({ form, setField, dirty, saving, isCreating, onClose, onSave, onDelete }: any) {
  return (
    <>
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="md:hidden w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Camera className="w-5 h-5 text-chaski-primary shrink-0" />
          <h2 className="font-bold text-slate-900 truncate">
            {isCreating ? 'Nueva experiencia' : form.titulo || 'Editando...'}
          </h2>
          {dirty && <span className="text-xs text-amber-600 font-medium shrink-0">• Sin guardar</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isCreating && (
            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-chaski-primary text-white font-semibold px-4 py-2 rounded-full text-sm shadow-md hover:bg-chaski-primary/90 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isCreating ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
          <MediaUploaderBlock
            url={form.url}
            tipo={form.tipo}
            onUploaded={(url: string, tipo: string) => {
              setField('url', url)
              setField('tipo', tipo)
            }}
            onRemove={() => setField('url', '')}
          />

          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setField('titulo', e.target.value)}
            placeholder="Título (ej: Taller de robótica en Colegio San José)"
            className="w-full text-xl sm:text-2xl font-black bg-transparent text-slate-900 placeholder-slate-300 border-b-2 border-transparent focus:outline-none focus:border-chaski-primary transition-all"
          />

          <FieldBlock label="Institución" icon={Building2}>
            <input
              type="text"
              value={form.institucion}
              onChange={(e) => setField('institucion', e.target.value)}
              placeholder="Nombre del colegio o institución"
              className={inputClass}
            />
          </FieldBlock>

          <FieldBlock label="Descripción" icon={ImageIcon}>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) => setField('descripcion', e.target.value)}
              placeholder="Breve descripción de la experiencia..."
              className={inputClass + ' resize-none'}
            />
          </FieldBlock>

          <div className="grid grid-cols-2 gap-3">
            <FieldBlock label="Orden" icon={Hash}>
              <input
                type="number"
                value={form.orden}
                onChange={(e) => setField('orden', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </FieldBlock>
            <FieldBlock label="Visibilidad" icon={form.activo ? Eye : EyeOff}>
              <button
                type="button"
                onClick={() => setField('activo', !form.activo)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  form.activo ? 'bg-hack-green/10 text-hack-green border border-hack-green/30' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {form.activo ? 'Visible en la home' : 'Oculto'}
              </button>
            </FieldBlock>
          </div>
        </div>
      </div>
    </>
  )
}

function MediaUploaderBlock({ url, tipo, onUploaded, onRemove }: { url: string; tipo: string; onUploaded: (url: string, tipo: string) => void; onRemove: () => void }) {
  const [drag, setDrag] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (files: FileList | File[]) => {
    const file = Array.from(files)[0]
    if (!file) return
    setUploading(true)
    setError(null)
    setProgress(30)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'experiencias')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error subiendo')
      setProgress(100)
      onUploaded(data.url, file.type.startsWith('video/') ? 'video' : 'foto')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDrag(false)
    if (e.dataTransfer.files) upload(e.dataTransfer.files)
  }

  if (url) {
    return (
      <FieldBlock label="Foto o video" icon={tipo === 'video' ? Video : ImageIcon}>
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video">
          {tipo === 'video' ? (
            <video src={url} className="w-full h-full object-contain bg-black" controls />
          ) : (
            <img src={url} alt="" className="w-full h-full object-contain" />
          )}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </FieldBlock>
    )
  }

  return (
    <FieldBlock label="Foto o video" icon={Upload}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative block w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          drag ? 'border-chaski-primary bg-chaski-primary/5 scale-[1.01]' : 'border-slate-300 hover:border-chaski-primary hover:bg-chaski-primary/5'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
              <p className="font-semibold text-slate-700">Subiendo...</p>
              <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-chaski-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-chaski-primary/10 rounded-2xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-chaski-primary" />
              </div>
              <p className="font-bold text-slate-900">Arrastra una foto o video, o haz clic</p>
              <p className="text-sm text-slate-400">JPG, PNG, WebP (máx 10MB) · MP4, WebM, MOV (máx 100MB)</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => e.target.files && upload(e.target.files)}
          className="hidden"
        />
      </label>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </FieldBlock>
  )
}

function FieldBlock({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-chaski-primary" />}
        <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
      </div>
      {children}
    </div>
  )
}

const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all'
