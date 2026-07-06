'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Save, Trash2, Search, Loader2, BookMarked,
  CheckCircle2, AlertCircle, Sparkles, Building2, Layers, Clock
} from 'lucide-react'
import { useDynamicLevels } from '@/hooks/useDynamicLevels'
import { EDUCATION_LEVELS } from '@/lib/constants'

interface Course {
  id: string
  name: string
  description: string
  levelId: string
  programId: string
  durationHours: number
  modality: string
  icon: string
  color: string
  coverImage: string
  isActive: boolean
}

const BLANK: Omit<Course, 'id'> = {
  name: '', description: '', levelId: '', programId: 'robotica',
  durationHours: 40, modality: 'presencial', icon: '📚',
  color: '#007AFF', coverImage: '', isActive: true,
}

const PROGRAMS = [
  { id: 'robotica', label: 'Robótica', emoji: '🤖', color: 'from-violet-500 to-purple-500' },
  { id: 'ia', label: 'IA', emoji: '🧠', color: 'from-pink-500 to-rose-500' },
  { id: 'hacking', label: 'Hacking Ético', emoji: '🛡️', color: 'from-emerald-500 to-green-500' },
]

const MODALITIES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hibrido', label: 'Híbrido' },
]

const ICONS = ['📚', '🤖', '🧠', '🛡️', '⚡', '🎯', '🚀', '🔥', '✨', '🌟', '🎨', '🔬', '💡', '🎮', '🏆']

export default function CursosCatalogoPage() {
  const router = useRouter()
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth()
  const { levels: dynamicLevels } = useDynamicLevels()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login?redirect=/admin/cursos')
  }, [isLoading, isAuthenticated, isAdmin, router])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (isCreating) {
      setForm({ ...BLANK })
      setDirty(false)
      return
    }
    const c = courses.find(x => x.id === selectedId)
    if (c) {
      setForm({
        name: c.name, description: c.description, levelId: c.levelId,
        programId: c.programId || 'robotica', durationHours: c.durationHours,
        modality: c.modality, icon: c.icon, color: c.color,
        coverImage: c.coverImage, isActive: c.isActive,
      })
      setDirty(false)
    }
  }, [selectedId, isCreating, courses])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!form.name) return showToast('error', 'El nombre es obligatorio')
    setSaving(true)
    try {
      const method = isCreating ? 'POST' : 'PUT'
      const payload = isCreating ? { ...form } : { ...form, id: selectedId }
      const res = await fetch('/api/courses', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      showToast('success', isCreating ? 'Curso creado' : 'Guardado')
      await load()
      if (isCreating) { setIsCreating(false); setSelectedId(data.course?.id || null) }
      setDirty(false)
    } catch (e: any) {
      showToast('error', e.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedId || !confirm('¿Eliminar este curso del catálogo?\n(También se eliminarán todas sus asignaciones a colegios)')) return
    try {
      await fetch(`/api/courses?id=${selectedId}`, { method: 'DELETE' })
      showToast('success', 'Curso eliminado')
      setSelectedId(null)
      load()
    } catch {
      showToast('error', 'Error al eliminar')
    }
  }

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (filter !== 'all' && c.programId !== filter) return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [courses, filter, search])

  const allLevels = dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS

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
      <header className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/colegios" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900">Catálogo de Cursos</h1>
            <p className="text-xs text-slate-500">{courses.length} cursos · reutilizables en múltiples colegios</p>
          </div>
        </div>
        <button
          onClick={() => { setIsCreating(true); setSelectedId(null) }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo curso</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`${hasSelection ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 lg:w-[400px] border-r border-slate-200 bg-white shrink-0`}>
          <div className="px-4 py-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar curso..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Todos
              </button>
              {PROGRAMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setFilter(p.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${filter === p.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-semibold mb-1">Sin cursos</p>
                <p className="text-slate-500 text-sm">Crea tu primer curso</p>
              </div>
            ) : (
              filteredCourses.map(c => (
                <CourseItem
                  key={c.id}
                  course={c}
                  active={selectedId === c.id}
                  onClick={() => { setSelectedId(c.id); setIsCreating(false) }}
                />
              ))
            )}
          </div>
        </aside>

        <main className={`${hasSelection ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {!hasSelection ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-purple/20 to-brand-violet/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <BookMarked className="w-10 h-10 text-brand-purple" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Catálogo de cursos</h2>
                <p className="text-slate-500 text-sm">
                  Crea cursos en el catálogo y luego asígnalos a uno o más colegios desde la sección Colegios.
                </p>
              </div>
            </div>
          ) : (
            <CourseEditor
              form={form}
              setField={update}
              dirty={dirty}
              saving={saving}
              isCreating={isCreating}
              allLevels={allLevels}
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

function CourseItem({ course, active, onClick }: { course: Course; active: boolean; onClick: () => void }) {
  const program = PROGRAMS.find(p => p.id === course.programId) || PROGRAMS[0]
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left ${
        active ? 'bg-brand-purple/10 border-r-2 border-brand-purple' : 'hover:bg-slate-50'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
        {course.icon || program.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${active ? 'text-brand-purple' : 'text-slate-900'}`}>{course.name}</p>
        <p className="text-xs text-slate-500 truncate">{course.description || program.label}</p>
      </div>
    </button>
  )
}

function CourseEditor({ form, setField, dirty, saving, isCreating, allLevels, onClose, onSave, onDelete }: any) {
  return (
    <>
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button onClick={onClose} className="md:hidden w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BookMarked className="w-5 h-5 text-brand-purple shrink-0" />
          <h2 className="font-bold text-slate-900 truncate">
            {isCreating ? 'Nuevo curso' : form.name || 'Editando...'}
          </h2>
          {dirty && <span className="text-xs text-amber-600 font-medium shrink-0">• Sin guardar</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isCreating && (
            <button onClick={onDelete} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500">
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
          {/* Preview tarjeta */}
          <div className="relative p-6 rounded-3xl text-white shadow-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${form.color}, ${form.color}DD)` }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-start gap-4">
              <div className="text-5xl">{form.icon}</div>
              <div className="min-w-0">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Nombre del curso"
                  className="w-full text-2xl font-black bg-transparent text-white placeholder-white/60 border-none focus:outline-none"
                />
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Descripción breve"
                  className="w-full text-white/90 bg-transparent placeholder-white/50 border-none focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <FieldBlock label="Configuración" icon={Sparkles}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <FieldCompact label="Programa">
                <select value={form.programId} onChange={(e) => setField('programId', e.target.value)} className={selectClass}>
                  {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
                </select>
              </FieldCompact>
              <FieldCompact label="Nivel">
                <select value={form.levelId} onChange={(e) => setField('levelId', e.target.value)} className={selectClass}>
                  <option value="">Sin nivel</option>
                  {allLevels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </FieldCompact>
              <FieldCompact label="Modalidad">
                <select value={form.modality} onChange={(e) => setField('modality', e.target.value)} className={selectClass}>
                  {MODALITIES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </FieldCompact>
              <FieldCompact label="Duración (horas)">
                <input type="number" value={form.durationHours} onChange={(e) => setField('durationHours', parseInt(e.target.value) || 0)} className={selectClass} />
              </FieldCompact>
              <FieldCompact label="Color">
                <input type="color" value={form.color} onChange={(e) => setField('color', e.target.value)} className="w-full h-10 rounded-xl border border-slate-200" />
              </FieldCompact>
              <FieldCompact label="Estado">
                <select value={form.isActive ? '1' : '0'} onChange={(e) => setField('isActive', e.target.value === '1')} className={selectClass}>
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </FieldCompact>
            </div>
          </FieldBlock>

          <FieldBlock label="Icono" icon={Sparkles}>
            <div className="grid grid-cols-8 sm:grid-cols-15 gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setField('icon', ic)}
                  className={`aspect-square text-2xl rounded-xl flex items-center justify-center transition-all ${
                    form.icon === ic ? 'bg-brand-purple text-white scale-110 shadow-lg' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </FieldBlock>
        </div>
      </div>
    </>
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

const selectClass = 'w-full px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-brand-purple'
