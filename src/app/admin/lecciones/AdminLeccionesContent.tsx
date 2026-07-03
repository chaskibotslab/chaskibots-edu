'use client'

import { useState, useEffect, useCallback, useMemo, DragEvent } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Trash2, Save, X, Search,
  Video, FileText, Package, BookOpen, Zap,
  Clock, Lock, Image as ImageIcon, Upload, Loader2,
  Sparkles, Filter, ChevronDown, CheckCircle2, AlertCircle,
  Folder, ChevronRight, Eye
} from 'lucide-react'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useDynamicLevels } from '@/hooks/useDynamicLevels'

interface Lesson {
  id: string
  levelId: string
  programId?: string
  moduleId: string
  moduleName: string
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
  duration: string
  order: number
  videoUrl: string
  pdfUrl?: string
  content: string
  locked: boolean
  images?: string[]
}

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: Video, accent: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'activity', label: 'Actividad', icon: Zap, accent: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'tutorial', label: 'Tutorial', icon: FileText, accent: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'project', label: 'Proyecto', icon: Package, accent: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'quiz', label: 'Quiz', icon: BookOpen, accent: 'bg-green-100 text-green-700 border-green-200' },
]

const PROGRAMS = [
  { id: 'robotica', label: 'Robótica', emoji: '🤖', color: 'from-violet-500 to-purple-500' },
  { id: 'ia', label: 'IA', emoji: '🧠', color: 'from-pink-500 to-rose-500' },
  { id: 'hacking', label: 'Hacking', emoji: '🛡️', color: 'from-emerald-500 to-green-500' },
]

const BLANK_FORM: Omit<Lesson, 'id' | 'moduleId'> = {
  levelId: '',
  programId: 'robotica',
  moduleName: '',
  title: '',
  type: 'video',
  duration: '10 min',
  order: 0,
  videoUrl: '',
  pdfUrl: '',
  content: '',
  locked: false,
  images: [],
}

export default function AdminLeccionesContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'admin'
  const { levels: dynamicLevels } = useDynamicLevels()

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('robotica')
  const [search, setSearch] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ ...BLANK_FORM })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/login')
  }, [isLoading, isAdmin, router])

  const loadLessons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedLevel) params.set('levelId', selectedLevel)
      if (selectedProgram) params.set('programId', selectedProgram)
      const res = await fetch(`/api/lessons?${params.toString()}`)
      const data = await res.json()
      setLessons(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [selectedLevel, selectedProgram])

  useEffect(() => { loadLessons() }, [loadLessons])

  // Sync form when lesson selected
  useEffect(() => {
    if (isCreating) {
      setForm({
        ...BLANK_FORM,
        levelId: selectedLevel || '',
        programId: selectedProgram,
        order: lessons.length,
      })
      setDirty(false)
      return
    }
    const lesson = lessons.find(l => l.id === selectedLessonId)
    if (lesson) {
      setForm({
        levelId: lesson.levelId,
        programId: lesson.programId || 'robotica',
        moduleName: lesson.moduleName,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        order: lesson.order,
        videoUrl: lesson.videoUrl || '',
        pdfUrl: lesson.pdfUrl || '',
        content: lesson.content || '',
        locked: lesson.locked,
        images: lesson.images || [],
      })
      setDirty(false)
    }
  }, [selectedLessonId, isCreating, lessons, selectedLevel, selectedProgram])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!form.title || !form.levelId) return showToast('error', 'Título y nivel son obligatorios')
    setSaving(true)
    try {
      const method = isCreating ? 'POST' : 'PUT'
      const lesson = lessons.find(l => l.id === selectedLessonId)
      const res = await fetch('/api/lessons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lesson?.id, ...form })
      })
      if (res.ok) {
        const data = await res.json()
        showToast('success', isCreating ? 'Lección creada' : 'Guardado')
        await loadLessons()
        if (isCreating) {
          setIsCreating(false)
          setSelectedLessonId(data.record?.id || null)
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
    if (!selectedLessonId || !confirm('¿Eliminar esta lección?')) return
    try {
      await fetch(`/api/lessons?id=${selectedLessonId}`, { method: 'DELETE' })
      showToast('success', 'Lección eliminada')
      setSelectedLessonId(null)
      loadLessons()
    } catch {
      showToast('error', 'Error al eliminar')
    }
  }

  const handleNew = () => {
    setIsCreating(true)
    setSelectedLessonId(null)
  }

  const filteredLessons = useMemo(() => {
    return lessons.filter(l =>
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.moduleName?.toLowerCase().includes(search.toLowerCase())
    )
  }, [lessons, search])

  const grouped = useMemo(() => {
    const map = new Map<string, Lesson[]>()
    for (const l of filteredLessons) {
      const key = l.moduleName || 'Sin módulo'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(l)
    }
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.order - b.order),
    }))
  }, [filteredLessons])

  const allLevels = dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    )
  }

  const hasSelection = isCreating || selectedLessonId

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900">Lecciones</h1>
              <p className="text-xs text-slate-500">{lessons.length} en {PROGRAMS.find(p => p.id === selectedProgram)?.label}</p>
            </div>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm hover:shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>

        {/* Program tabs */}
        <div className="px-4 sm:px-6 pb-2 flex gap-1">
          {PROGRAMS.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedProgram(p.id); setSelectedLessonId(null); setIsCreating(false) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedProgram === p.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main 2-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LIST SIDEBAR */}
        <aside className={`${hasSelection ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 lg:w-[400px] border-r border-slate-200 bg-white shrink-0`}>
          {/* Filters */}
          <div className="px-4 py-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar lección..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-brand-purple"
            >
              <option value="">📚 Todos los niveles</option>
              {allLevels.map(l => (
                <option key={l.id} value={l.id}>{l.icon || '📚'} {l.name}</option>
              ))}
            </select>
          </div>

          {/* Lessons list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
              </div>
            ) : grouped.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-700 font-semibold mb-1">Sin lecciones</p>
                <p className="text-slate-500 text-sm mb-3">
                  {selectedLevel ? 'Este nivel no tiene contenido.' : 'Elige un nivel para empezar.'}
                </p>
                <button onClick={handleNew} className="text-brand-purple font-semibold text-sm hover:underline">
                  Crear primera lección
                </button>
              </div>
            ) : (
              <div className="py-2">
                {grouped.map(group => (
                  <ModuleGroup
                    key={group.name}
                    name={group.name}
                    items={group.items}
                    selectedId={selectedLessonId}
                    onSelect={(id) => { setSelectedLessonId(id); setIsCreating(false) }}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* DETAIL PANEL */}
        <main className={`${hasSelection ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden bg-slate-50`}>
          {!hasSelection ? (
            <EmptyDetail onNew={handleNew} />
          ) : (
            <LessonEditor
              form={form}
              setField={update}
              dirty={dirty}
              saving={saving}
              isCreating={isCreating}
              allLevels={allLevels}
              onClose={() => {
                setSelectedLessonId(null)
                setIsCreating(false)
              }}
              onSave={handleSave}
              onDelete={handleDelete}
              onUpload={(urls: string[]) => {
                update('images', [...(form.images || []), ...urls])
              }}
              onRemoveImage={(idx: number) => {
                update('images', (form.images || []).filter((_: string, i: number) => i !== idx))
              }}
            />
          )}
        </main>
      </div>

      {/* Toast */}
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

function ModuleGroup({ name, items, selectedId, onSelect }: { name: string; items: Lesson[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:bg-slate-50 transition-colors"
      >
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
        <Folder className="w-3.5 h-3.5" />
        <span className="flex-1 text-left truncate">{name}</span>
        <span className="text-slate-400 normal-case">{items.length}</span>
      </button>
      {open && (
        <div>
          {items.map(l => (
            <LessonListItem
              key={l.id}
              lesson={l}
              active={selectedId === l.id}
              onClick={() => onSelect(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LessonListItem({ lesson, active, onClick }: { lesson: Lesson; active: boolean; onClick: () => void }) {
  const typeCfg = LESSON_TYPES.find(t => t.value === lesson.type) || LESSON_TYPES[0]
  const Icon = typeCfg.icon
  const hasImage = lesson.images && lesson.images.length > 0
  const thumb = hasImage ? lesson.images![0] : null

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left ${
        active ? 'bg-brand-purple/10 border-r-2 border-brand-purple' : 'hover:bg-slate-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center shrink-0 ${typeCfg.accent}`}>
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${active ? 'text-brand-purple' : 'text-slate-900'}`}>{lesson.title}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {lesson.duration}
          </span>
          {lesson.videoUrl && <Video className="w-3 h-3 text-red-500" />}
          {hasImage && <ImageIcon className="w-3 h-3 text-green-500" />}
          {lesson.locked && <Lock className="w-3 h-3 text-amber-500" />}
        </div>
      </div>
    </button>
  )
}

function EmptyDetail({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-purple/20 to-brand-violet/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-brand-purple" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Selecciona una lección</h2>
        <p className="text-slate-500 text-sm mb-5">
          Elige una lección de la lista o crea una nueva para empezar a editar.
        </p>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Crear nueva lección
        </button>
      </div>
    </div>
  )
}

function LessonEditor({ form, setField, dirty, saving, isCreating, allLevels, onClose, onSave, onDelete, onUpload, onRemoveImage }: any) {
  const typeCfg = LESSON_TYPES.find(t => t.value === form.type) || LESSON_TYPES[0]
  const TypeIcon = typeCfg.icon

  return (
    <>
      {/* Detail header */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="md:hidden w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${typeCfg.accent}`}>
            <TypeIcon className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-900 truncate">
            {isCreating ? 'Nueva lección' : form.title || 'Editando...'}
          </h2>
          {dirty && <span className="text-xs text-amber-600 font-medium shrink-0">• Sin guardar</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isCreating && (
            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving || !dirty && !isCreating}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2 rounded-full text-sm shadow-md disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isCreating ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
          {/* Title - inline big */}
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Título de la lección"
              className="w-full text-2xl sm:text-3xl font-black bg-transparent text-slate-900 placeholder-slate-300 border-none focus:outline-none"
            />
          </div>

          {/* Quick props */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            <FieldCompact label="Tipo">
              <select
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                className={selectClass}
              >
                {LESSON_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FieldCompact>
            <FieldCompact label="Duración">
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setField('duration', e.target.value)}
                placeholder="10 min"
                className={selectClass}
              />
            </FieldCompact>
            <FieldCompact label="Orden">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setField('order', parseInt(e.target.value) || 0)}
                className={selectClass}
              />
            </FieldCompact>
          </div>

          <FieldCompact label="Módulo">
            <input
              type="text"
              value={form.moduleName}
              onChange={(e) => setField('moduleName', e.target.value)}
              placeholder="Ej: Módulo 1: Introducción"
              className={selectClass}
            />
          </FieldCompact>

          {/* Image uploader (prominent!) */}
          <ImageUploaderBlock
            images={form.images || []}
            onUpload={onUpload}
            onRemove={onRemoveImage}
          />

          {/* Video URL */}
          <FieldBlock label="Video (YouTube)" icon={Video}>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) => setField('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputClass + ' font-mono text-sm'}
            />
            {form.videoUrl && form.videoUrl.includes('youtube') && (
              <div className="mt-2 aspect-video bg-slate-900 rounded-2xl overflow-hidden">
                <iframe
                  src={getYouTubeEmbed(form.videoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </FieldBlock>

          {/* PDF */}
          <FieldBlock label="PDF" icon={FileText}>
            <input
              type="text"
              value={form.pdfUrl}
              onChange={(e) => setField('pdfUrl', e.target.value)}
              placeholder="https://..."
              className={inputClass + ' font-mono text-sm'}
            />
          </FieldBlock>

          {/* Content */}
          <FieldBlock label="Contenido" icon={BookOpen}>
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setField('content', e.target.value)}
              placeholder="Descripción y contenido detallado de la lección..."
              className={inputClass + ' resize-none leading-relaxed'}
            />
          </FieldBlock>

          {/* Locked toggle */}
          <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Lección bloqueada</p>
                <p className="text-xs text-slate-500">Requiere completar las anteriores</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.locked}
              onChange={(e) => setField('locked', e.target.checked)}
              className="w-5 h-5 rounded text-brand-purple"
            />
          </label>
        </div>
      </div>
    </>
  )
}

function ImageUploaderBlock({ images, onUpload, onRemove }: { images: string[]; onUpload: (urls: string[]) => void; onRemove: (idx: number) => void }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList)
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    setProgress(0)
    const newUrls: string[] = []
    try {
      let done = 0
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('bucket', 'lesson-images')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error subiendo')
        newUrls.push(data.url)
        done++
        setProgress(Math.round((done / files.length) * 100))
      }
      onUpload(newUrls)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) upload(e.dataTransfer.files)
  }

  return (
    <FieldBlock label={`Imágenes${images.length > 0 ? ` (${images.length})` : ''}`} icon={ImageIcon}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative block w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          dragActive
            ? 'border-brand-purple bg-brand-purple/5 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-purple hover:bg-brand-purple/5'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
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
              <p className="text-sm text-slate-400">PNG, JPG, GIF, WebP · máx 10MB</p>
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

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, idx) => (
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

function getYouTubeEmbed(url: string): string {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`
  return url
}

const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all'
const selectClass = 'w-full px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-brand-purple'
