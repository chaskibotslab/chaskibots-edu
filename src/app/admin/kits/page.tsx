'use client'

import { useState, useEffect, useCallback, useMemo, DragEvent } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Save, Trash2, X, Search, Upload, Loader2,
  Package, Image as ImageIcon, Video, BookOpen, DollarSign,
  Sparkles, ChevronRight, AlertCircle, CheckCircle2, ArrowLeftRight
} from 'lucide-react'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useDynamicLevels } from '@/hooks/useDynamicLevels'

interface Kit {
  id: string
  levelId: string
  name: string
  description: string
  price: number
  components: string
  skills: string
  images: string // CSV
  videoUrl: string
  tutorialUrl: string
}

const BLANK: Omit<Kit, 'id'> = {
  levelId: '',
  name: '',
  description: '',
  price: 0,
  components: '',
  skills: '',
  images: '',
  videoUrl: '',
  tutorialUrl: '',
}

export default function KitsAdminPage() {
  const router = useRouter()
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth()
  const { levels: dynamicLevels } = useDynamicLevels()

  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login?redirect=/admin/kits')
  }, [isLoading, isAuthenticated, isAdmin, router])

  const loadKits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/kits')
      const data = await res.json()
      setKits(data.kits || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadKits() }, [loadKits])

  // Sync form
  useEffect(() => {
    if (isCreating) {
      setForm({ ...BLANK })
      setDirty(false)
      return
    }
    const k = kits.find(x => x.id === selectedId)
    if (k) {
      setForm({
        levelId: k.levelId,
        name: k.name,
        description: k.description,
        price: k.price,
        components: k.components,
        skills: k.skills,
        images: k.images || '',
        videoUrl: k.videoUrl || '',
        tutorialUrl: k.tutorialUrl || '',
      })
      setDirty(false)
    }
  }, [selectedId, isCreating, kits])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const imageUrls = useMemo(() => {
    return form.images.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
  }, [form.images])

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!form.name || !form.levelId) return showToast('error', 'Nombre y nivel son obligatorios')
    setSaving(true)
    try {
      const method = isCreating ? 'POST' : 'PUT'
      const payload = isCreating ? { ...form } : { ...form, id: selectedId }
      const res = await fetch('/api/kits', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        showToast('success', isCreating ? 'Kit creado' : 'Guardado')
        await loadKits()
        if (isCreating) {
          setIsCreating(false)
          setSelectedId(data.kit?.id || null)
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
    if (!selectedId || !confirm('¿Eliminar este kit?')) return
    try {
      await fetch(`/api/kits?id=${selectedId}`, { method: 'DELETE' })
      showToast('success', 'Kit eliminado')
      setSelectedId(null)
      loadKits()
    } catch {
      showToast('error', 'Error al eliminar')
    }
  }

  const handleNew = () => {
    setIsCreating(true)
    setSelectedId(null)
  }

  const filteredKits = useMemo(() => {
    return kits.filter(k =>
      !search || k.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [kits, search])

  const allLevels = dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS

  const addUploadedImages = (urls: string[]) => {
    const existing = form.images.trim()
    const next = existing ? `${existing},${urls.join(',')}` : urls.join(',')
    update('images', next)
  }

  const removeImage = (idx: number) => {
    const next = imageUrls.filter((_, i) => i !== idx).join(',')
    update('images', next)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    )
  }

  const hasSelection = isCreating || selectedId

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900">Kits Educativos</h1>
            <p className="text-xs text-slate-500">{kits.length} kits totales</p>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo kit</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LIST */}
        <aside className={`${hasSelection ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 lg:w-[400px] border-r border-slate-200 bg-white shrink-0`}>
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar kit..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
              </div>
            ) : filteredKits.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Package className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-700 font-semibold mb-1">Sin kits</p>
                <p className="text-slate-500 text-sm mb-3">Crea tu primer kit</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredKits.map(kit => (
                  <KitItem
                    key={kit.id}
                    kit={kit}
                    active={selectedId === kit.id}
                    onClick={() => { setSelectedId(kit.id); setIsCreating(false) }}
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
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-purple/20 to-brand-violet/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-brand-purple" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Selecciona un kit</h2>
                <p className="text-slate-500 text-sm mb-5">
                  Elige un kit de la lista o crea uno nuevo.
                </p>
                <button
                  onClick={handleNew}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Crear nuevo kit
                </button>
              </div>
            </div>
          ) : (
            <KitEditor
              form={form}
              setField={update}
              dirty={dirty}
              saving={saving}
              isCreating={isCreating}
              allLevels={allLevels}
              imageUrls={imageUrls}
              onAddImages={addUploadedImages}
              onRemoveImage={removeImage}
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

function KitItem({ kit, active, onClick }: { kit: Kit; active: boolean; onClick: () => void }) {
  const firstImage = kit.images?.split(/[,\n]/)[0]?.trim()
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left ${
        active ? 'bg-brand-purple/10 border-r-2 border-brand-purple' : 'hover:bg-slate-50'
      }`}
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
        {firstImage ? (
          <img src={firstImage} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
        ) : (
          <Package className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${active ? 'text-brand-purple' : 'text-slate-900'}`}>{kit.name}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
          <span className="truncate">{kit.levelId || 'sin nivel'}</span>
          {kit.price > 0 && <span className="font-semibold">${kit.price}</span>}
        </div>
      </div>
    </button>
  )
}

function KitEditor({ form, setField, dirty, saving, isCreating, allLevels, imageUrls, onAddImages, onRemoveImage, onClose, onSave, onDelete }: any) {
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
          <Package className="w-5 h-5 text-brand-purple shrink-0" />
          <h2 className="font-bold text-slate-900 truncate">
            {isCreating ? 'Nuevo kit' : form.name || 'Editando...'}
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
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2 rounded-full text-sm shadow-md disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isCreating ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Nombre del kit"
            className="w-full text-2xl sm:text-3xl font-black bg-transparent text-slate-900 placeholder-slate-300 border-none focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <FieldCompact label="Nivel">
              <select
                value={form.levelId}
                onChange={(e) => setField('levelId', e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccionar...</option>
                {allLevels.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </FieldCompact>
            <FieldCompact label="Precio (USD)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setField('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={selectClass}
              />
            </FieldCompact>
          </div>

          <ImageUploaderBlock
            imageUrls={imageUrls}
            onAdd={onAddImages}
            onRemove={onRemoveImage}
          />

          <FieldBlock label="Descripción" icon={BookOpen}>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Descripción del kit..."
              className={inputClass + ' resize-none'}
            />
          </FieldBlock>

          <FieldBlock label="Componentes" icon={Package}>
            <textarea
              rows={3}
              value={form.components}
              onChange={(e) => setField('components', e.target.value)}
              placeholder="LEDs, cables, resistencias..."
              className={inputClass + ' resize-none'}
            />
            <p className="text-xs text-slate-400 mt-1">Lista los componentes separados por comas</p>
          </FieldBlock>

          <FieldBlock label="Habilidades que desarrolla" icon={Sparkles}>
            <textarea
              rows={2}
              value={form.skills}
              onChange={(e) => setField('skills', e.target.value)}
              placeholder="Pensamiento lógico, electrónica básica..."
              className={inputClass + ' resize-none'}
            />
          </FieldBlock>

          <FieldBlock label="Video tutorial" icon={Video}>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) => setField('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputClass + ' font-mono text-sm'}
            />
          </FieldBlock>

          <FieldBlock label="Enlace de tutorial" icon={BookOpen}>
            <input
              type="text"
              value={form.tutorialUrl}
              onChange={(e) => setField('tutorialUrl', e.target.value)}
              placeholder="https://..."
              className={inputClass + ' font-mono text-sm'}
            />
          </FieldBlock>
        </div>
      </div>
    </>
  )
}

function ImageUploaderBlock({ imageUrls, onAdd, onRemove }: { imageUrls: string[]; onAdd: (urls: string[]) => void; onRemove: (idx: number) => void }) {
  const [drag, setDrag] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (list.length === 0) return
    setUploading(true)
    setError(null)
    const newUrls: string[] = []
    try {
      let done = 0
      for (const file of list) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('bucket', 'lesson-images')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error subiendo')
        newUrls.push(data.url)
        done++
        setProgress(Math.round((done / list.length) * 100))
      }
      onAdd(newUrls)
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

  return (
    <FieldBlock label={`Imágenes${imageUrls.length > 0 ? ` (${imageUrls.length})` : ''}`} icon={ImageIcon}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative block w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          drag ? 'border-brand-purple bg-brand-purple/5 scale-[1.01]' : 'border-slate-300 hover:border-brand-purple hover:bg-brand-purple/5'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
              <p className="font-semibold text-slate-700">Subiendo {progress}%</p>
              <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-purple transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-brand-purple" />
              </div>
              <p className="font-bold text-slate-900">Arrastra imágenes o haz clic</p>
              <p className="text-sm text-slate-400">PNG, JPG, WebP · máx 10MB</p>
            </>
          )}
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
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

      {imageUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.3')} />
              <button
                onClick={() => onRemove(idx)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-sm">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </FieldBlock>
  )
}

function FieldCompact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function FieldBlock({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-brand-purple" />}
        <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
      </div>
      {children}
    </div>
  )
}

const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all'
const selectClass = 'w-full px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-brand-purple'
