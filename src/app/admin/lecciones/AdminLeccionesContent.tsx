'use client'

import { useState, useEffect, useCallback, DragEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Plus, Edit2, Trash2, Save, X,
  Video, Zap, FileText, Package, BookOpen,
  Clock, Search, Loader2, Upload, Image as ImageIcon,
  Lock, Eye, CheckCircle2, AlertCircle, ChevronRight,
  Sparkles, GripVertical, Folder
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
  { value: 'video', label: 'Video', icon: Video, color: 'bg-red-50 text-red-600 border-red-200' },
  { value: 'activity', label: 'Actividad', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'tutorial', label: 'Tutorial', icon: FileText, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'project', label: 'Proyecto', icon: Package, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'quiz', label: 'Quiz', icon: BookOpen, color: 'bg-green-50 text-green-600 border-green-200' },
]

const PROGRAMS = [
  { id: 'robotica', label: 'Robótica', emoji: '🤖' },
  { id: 'ia', label: 'IA', emoji: '🧠' },
  { id: 'hacking', label: 'Hacking', emoji: '🛡️' },
]

export default function AdminLeccionesContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'admin'
  const { levels: dynamicLevels } = useDynamicLevels()

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('robotica')
  const [search, setSearch] = useState('')
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const blankForm = {
    levelId: '',
    programId: 'robotica',
    moduleName: '',
    title: '',
    type: 'video' as Lesson['type'],
    duration: '10 min',
    order: 0,
    videoUrl: '',
    pdfUrl: '',
    content: '',
    locked: false,
    images: [] as string[],
  }

  const [formData, setFormData] = useState(blankForm)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
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
    } catch (e) {
      console.error('Error loading lessons:', e)
    } finally {
      setLoading(false)
    }
  }, [selectedLevel, selectedProgram])

  useEffect(() => { loadLessons() }, [loadLessons])

  const openCreateModal = () => {
    setIsCreating(true)
    setEditingLesson(null)
    setFormData({
      ...blankForm,
      levelId: selectedLevel || '',
      programId: selectedProgram || 'robotica',
      order: lessons.length,
    })
  }

  const openEditModal = (lesson: Lesson) => {
    setIsCreating(false)
    setEditingLesson(lesson)
    setFormData({
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
  }

  const closeModal = () => {
    setEditingLesson(null)
    setIsCreating(false)
    setMessage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const method = isCreating ? 'POST' : 'PUT'
      const res = await fetch('/api/lessons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLesson?.id, ...formData })
      })
      if (res.ok) {
        setMessage({ type: 'success', text: isCreating ? 'Lección creada' : 'Lección actualizada' })
        await loadLessons()
        setTimeout(() => closeModal(), 800)
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.message || err.error || 'Error al guardar' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' })
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta lección?')) return
    try {
      const res = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadLessons()
    } catch (e) { console.error(e) }
  }

  const filteredLessons = lessons.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.moduleName?.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filteredLessons.reduce((acc, l) => {
    const key = l.moduleName || 'Sin módulo'
    if (!acc[key]) acc[key] = []
    acc[key].push(l)
    return acc
  }, {} as Record<string, Lesson[]>)

  const stats = {
    total: lessons.length,
    videos: lessons.filter(l => l.videoUrl).length,
    images: lessons.filter(l => l.images && l.images.length > 0).length,
    locked: lessons.filter(l => l.locked).length,
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">Lecciones</h1>
              <p className="text-xs text-slate-500">Administra el contenido del curso</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2.5 rounded-2xl shadow-lg shadow-brand-purple/30 hover:shadow-xl transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={BookOpen} label="Total" value={stats.total} color="brand-purple" />
          <StatCard icon={Video} label="Con video" value={stats.videos} color="red-500" />
          <StatCard icon={ImageIcon} label="Con imágenes" value={stats.images} color="green-500" />
          <StatCard icon={Lock} label="Bloqueadas" value={stats.locked} color="amber-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título o módulo..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-brand-purple"
            >
              <option value="">Todos los niveles</option>
              {(dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS).map(level => (
                <option key={level.id} value={level.id}>{level.icon || '📚'} {level.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {PROGRAMS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProgram(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedProgram === p.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Sin lecciones</h3>
            <p className="text-slate-500 text-sm mb-4">
              {selectedLevel ? 'Este nivel no tiene lecciones todavía.' : 'Selecciona un nivel para ver sus lecciones.'}
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 text-brand-purple font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" />
              Crear primera lección
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([moduleName, moduleLessons]) => (
              <div key={moduleName} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
                  <Folder className="w-4 h-4 text-brand-purple" />
                  <h3 className="font-bold text-slate-900 flex-1">{moduleName}</h3>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {moduleLessons.length}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {moduleLessons.sort((a, b) => a.order - b.order).map(lesson => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={() => openEditModal(lesson)}
                      onDelete={() => handleDelete(lesson.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {(isCreating || editingLesson) && (
        <LessonModal
          formData={formData}
          setFormData={setFormData}
          isCreating={isCreating}
          saving={saving}
          message={message}
          onSave={handleSave}
          onClose={closeModal}
          levels={dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <p className="text-slate-500 text-xs font-medium">{label}</p>
      <p className="text-slate-900 text-xl font-black">{value}</p>
    </div>
  )
}

function LessonRow({ lesson, onEdit, onDelete }: { lesson: Lesson; onEdit: () => void; onDelete: () => void }) {
  const typeConfig = LESSON_TYPES.find(t => t.value === lesson.type) || LESSON_TYPES[0]
  const TypeIcon = typeConfig.icon
  const hasImage = lesson.images && lesson.images.length > 0
  const firstImage = hasImage ? lesson.images![0] : null

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
      {/* Thumb */}
      <div className={`w-14 h-14 rounded-2xl overflow-hidden border ${typeConfig.color} flex items-center justify-center shrink-0 relative`}>
        {firstImage ? (
          <img src={firstImage} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <TypeIcon className="w-6 h-6" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">{lesson.title}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lesson.duration}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${typeConfig.color}`}>
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </span>
          {lesson.videoUrl && (
            <span className="flex items-center gap-1 text-red-600">
              <Video className="w-3 h-3" />
              Video
            </span>
          )}
          {hasImage && (
            <span className="flex items-center gap-1 text-green-600">
              <ImageIcon className="w-3 h-3" />
              {lesson.images!.length}
            </span>
          )}
          {lesson.locked && (
            <span className="flex items-center gap-1 text-amber-600">
              <Lock className="w-3 h-3" />
              Bloqueada
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="w-9 h-9 rounded-full hover:bg-brand-purple/10 flex items-center justify-center transition-colors"
        >
          <Edit2 className="w-4 h-4 text-brand-purple" />
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  )
}

function LessonModal({ formData, setFormData, isCreating, saving, message, onSave, onClose, levels }: any) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadFiles = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList)
    if (files.length === 0) return
    setUploading(true)
    setUploadError(null)
    const newUrls: string[] = []
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('bucket', 'lesson-images')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error subiendo')
        newUrls.push(data.url)
      }
      setFormData((prev: any) => ({ ...prev, images: [...(prev.images || []), ...newUrls] }))
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files)
  }

  const removeImage = (idx: number) => {
    setFormData((prev: any) => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== idx) }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full sm:max-w-3xl max-h-[94vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{isCreating ? 'Nueva lección' : 'Editar lección'}</h2>
              <p className="text-slate-500 text-xs">Carga imágenes y video fácilmente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-2xl ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          {/* Título */}
          <Field label="Título" required>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Mi primera lección"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nivel" required>
              <select
                value={formData.levelId}
                onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                className={inputClass}
              >
                <option value="">Seleccionar...</option>
                {levels.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.icon || '📚'} {l.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Programa">
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className={inputClass}
              >
                {PROGRAMS.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Módulo">
            <input
              type="text"
              value={formData.moduleName}
              onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
              placeholder="Ej: Módulo 1: Introducción"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Tipo">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={inputClass}
              >
                {LESSON_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Duración">
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="10 min"
                className={inputClass}
              />
            </Field>
            <Field label="Orden">
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Video URL */}
          <Field label="URL de Video (YouTube)" icon={Video}>
            <input
              type="text"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputClass + ' font-mono text-sm'}
            />
          </Field>

          {/* Image Uploader */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-purple" />
                Imágenes
                <span className="text-slate-400 font-normal">({formData.images?.length || 0})</span>
              </label>
            </div>

            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                dragActive
                  ? 'border-brand-purple bg-brand-purple/5 scale-[1.01]'
                  : uploading
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-300 hover:border-brand-purple hover:bg-brand-purple/5'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
                  <span className="text-slate-600 font-medium">Subiendo a Supabase...</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-brand-purple" />
                  </div>
                  <p className="text-slate-700 font-semibold">Arrastra imágenes aquí o haz clic</p>
                  <p className="text-slate-400 text-sm">PNG, JPG, GIF, WebP · máx 10MB cada una</p>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploadError && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {uploadError}
              </div>
            )}

            {/* Preview grid */}
            {formData.images && formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {formData.images.map((url: string, idx: number) => (
                  <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '' }} />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-1 left-1 text-white text-xs font-bold bg-black/50 rounded-full w-6 h-6 flex items-center justify-center backdrop-blur-sm">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PDF */}
          <Field label="URL de PDF" icon={FileText}>
            <input
              type="text"
              value={formData.pdfUrl}
              onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
              placeholder="https://..."
              className={inputClass + ' font-mono text-sm'}
            />
          </Field>

          {/* Contenido */}
          <Field label="Contenido / Descripción">
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Descripción detallada de la lección..."
              className={inputClass + ' resize-none'}
            />
          </Field>

          {/* Locked toggle */}
          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Lección bloqueada</p>
                <p className="text-slate-500 text-xs">Requiere completar lecciones anteriores</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.locked}
              onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
              className="w-5 h-5 rounded text-brand-purple focus:ring-brand-purple"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 bg-white flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving || uploading || !formData.title || !formData.levelId}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 rounded-2xl shadow-lg shadow-brand-purple/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isCreating ? 'Crear lección' : 'Guardar cambios'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, icon: Icon, children }: { label: string; required?: boolean; icon?: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-brand-purple" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all'
