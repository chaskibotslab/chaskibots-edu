'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  ArrowLeft, Plus, Trash2, Edit, X, Save, RefreshCw,
  ChevronRight, ChevronDown, GraduationCap, BookOpen, FileText
} from 'lucide-react'

interface AcademyLesson {
  id: string
  module_id: string
  slug: string
  title: string
  description: string
  theory?: string
  examples?: any[]
  challenges?: any[]
  difficulty: string
  estimated_minutes: number
  sort_order: number
  is_active: boolean
}

interface AcademyModule {
  id: string
  course_id: string
  slug: string
  title: string
  description: string
  icon: string
  level_id: string | null
  sort_order: number
  is_active: boolean
  lessons: AcademyLesson[]
}

interface AcademyCourse {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  difficulty: string
  sort_order: number
  is_active: boolean
  modules: AcademyModule[]
}

type Entity = 'course' | 'module' | 'lesson'

interface ModalState {
  entity: Entity
  mode: 'create' | 'edit'
  parentId?: string // course_id (para module) o module_id (para lesson)
  data: Record<string, any>
}

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const LESSON_DIFFICULTIES = ['easy', 'medium', 'hard']

const emptyLessonForm = () => ({
  slug: '', title: '', description: '', theory: '',
  examples: '[]', challenges: '[]',
  difficulty: 'easy', estimated_minutes: 10, sort_order: 1, is_active: true,
})
const emptyModuleForm = () => ({
  slug: '', title: '', description: '', icon: '📘', level_id: '', sort_order: 1, is_active: true,
})
const emptyCourseForm = () => ({
  slug: '', title: '', description: '', icon: '📚', color: '#3B82F6', difficulty: 'beginner', sort_order: 1, is_active: true,
})

export default function AdminAcademyPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const [courses, setCourses] = useState<AcademyCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login?redirect=/admin/academy')
    if (!isLoading && isAuthenticated && !isAdmin) router.push('/')
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/academy')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch {
      setError('No se pudo cargar la Academia')
    }
    setLoading(false)
  }

  const openCreate = (entity: Entity, parentId?: string) => {
    setError(null)
    const data = entity === 'course' ? emptyCourseForm() : entity === 'module' ? emptyModuleForm() : emptyLessonForm()
    setModal({ entity, mode: 'create', parentId, data })
  }

  const openEdit = (entity: Entity, item: any) => {
    setError(null)
    const data = entity === 'lesson'
      ? {
          ...item,
          examples: JSON.stringify(item.examples || [], null, 2),
          challenges: JSON.stringify(item.challenges || [], null, 2),
        }
      : { ...item }
    setModal({ entity, mode: 'edit', parentId: entity === 'module' ? item.course_id : entity === 'lesson' ? item.module_id : undefined, data })
  }

  const closeModal = () => { setModal(null); setError(null) }

  const handleSave = async () => {
    if (!modal) return
    const { entity, mode, parentId, data } = modal

    if (!data.title || (entity !== 'lesson' && !data.slug)) {
      setError('Título' + (entity !== 'lesson' ? ' y slug son requeridos' : ' es requerido'))
      return
    }

    let payload: Record<string, any> = { ...data }
    if (entity === 'lesson') {
      try {
        payload.examples = JSON.parse(data.examples || '[]')
        payload.challenges = JSON.parse(data.challenges || '[]')
      } catch {
        setError('Ejemplos o retos no son JSON válido. Formato: [{"title":"","code":"","explanation":""}]')
        return
      }
      if (mode === 'create') payload.module_id = parentId
    }
    if (entity === 'module' && mode === 'create') payload.course_id = parentId
    if (entity !== 'lesson' && !payload.slug) payload.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/academy', {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'create' ? { entity, ...payload } : { entity, id: data.id, ...payload }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al guardar')
      await load()
      closeModal()
    } catch (e: any) {
      setError(e.message || 'Error al guardar')
    }
    setSaving(false)
  }

  const handleDelete = async (entity: Entity, item: any) => {
    const label = entity === 'course' ? 'este curso (y todos sus módulos/lecciones)' : entity === 'module' ? 'este módulo (y todas sus lecciones)' : 'esta lección'
    if (!confirm(`¿Eliminar ${label}? "${item.title}"`)) return
    setDeleting(item.id)
    try {
      const res = await fetch(`/api/admin/academy?entity=${entity}&id=${item.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      await load()
    } catch {
      alert('Error al eliminar')
    }
    setDeleting(null)
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chaski-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gestión de Academia</h1>
              <p className="text-sm text-slate-600">Cursos, módulos y lecciones que consumen Python IDE, Terminal Linux y /academy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all">
              <RefreshCw className="w-4 h-4" /> Recargar
            </button>
            <button onClick={() => openCreate('course')} className="flex items-center gap-2 px-4 py-2 bg-chaski-primary text-white rounded-xl font-medium hover:bg-chaski-primary/90 active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4" /> Nuevo curso
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-chaski-primary"></div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {courses.map((course, courseIdx) => {
              const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${courseIdx * 0.05}s` }}
                >
                  <div className="flex items-center justify-between p-4">
                    <button
                      onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <span className="text-2xl">{course.icon}</span>
                      <div>
                        <h2 className="font-bold text-slate-900">{course.title}</h2>
                        <p className="text-xs text-slate-500">{course.modules.length} módulos · {totalLessons} lecciones</p>
                      </div>
                      {expandedCourse === course.id ? <ChevronDown className="w-4 h-4 text-slate-400 ml-2" /> : <ChevronRight className="w-4 h-4 text-slate-400 ml-2" />}
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openCreate('module', course.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                        <Plus className="w-3.5 h-3.5" /> Módulo
                      </button>
                      <button onClick={() => openEdit('course', course)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete('course', course)} disabled={deleting === course.id} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="border-t border-slate-200 divide-y divide-slate-200">
                      {course.modules.length === 0 && <p className="p-4 text-sm text-slate-400">Sin módulos todavía.</p>}
                      {course.modules.map(mod => (
                        <div key={mod.id} className="bg-white">
                          <div className="flex items-center justify-between p-3 pl-8">
                            <button
                              onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                              className="flex items-center gap-2 flex-1 text-left"
                            >
                              <BookOpen className="w-4 h-4 text-chaski-primary" />
                              <span className="text-sm font-semibold text-slate-800">{mod.title}</span>
                              {mod.level_id && <span className="text-[10px] px-1.5 py-0.5 bg-chaski-primary/10 text-chaski-primary rounded-full">{mod.level_id}</span>}
                              <span className="text-xs text-slate-400">({mod.lessons.length} lecciones)</span>
                              {expandedModule === mod.id ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openCreate('lesson', mod.id)} className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                                <Plus className="w-3 h-3" /> Lección
                              </button>
                              <button onClick={() => openEdit('module', mod)} className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete('module', mod)} disabled={deleting === mod.id} className="p-1 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {expandedModule === mod.id && (
                            <div className="pl-14 pr-3 pb-3 space-y-1.5">
                              {mod.lessons.length === 0 && <p className="text-xs text-slate-400 py-1">Sin lecciones todavía — módulo vacío.</p>}
                              {mod.lessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-xs text-slate-700 truncate">{lesson.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded shrink-0">{lesson.difficulty}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => openEdit('lesson', lesson)} className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded">
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete('lesson', lesson)} disabled={deleting === lesson.id} className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-chaski-primary" />
                {modal.mode === 'create' ? 'Nuevo' : 'Editar'} {modal.entity === 'course' ? 'curso' : modal.entity === 'module' ? 'módulo' : 'lección'}
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Título</label>
                  <input
                    type="text" value={modal.data.title}
                    onChange={e => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                  />
                </div>
                {modal.entity !== 'lesson' && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Slug</label>
                    <input
                      type="text" value={modal.data.slug}
                      onChange={e => setModal({ ...modal, data: { ...modal.data, slug: e.target.value.toLowerCase().replace(/\s/g, '-') } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                    />
                  </div>
                )}
                {modal.entity === 'lesson' && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Dificultad</label>
                    <select
                      value={modal.data.difficulty}
                      onChange={e => setModal({ ...modal, data: { ...modal.data, difficulty: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                    >
                      {LESSON_DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Descripción</label>
                <textarea
                  value={modal.data.description}
                  onChange={e => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                />
              </div>

              {modal.entity === 'module' && (
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Nivel (level_id) — vacío = todos los grados asignados al curso</label>
                  <input
                    type="text" value={modal.data.level_id || ''}
                    placeholder="ej: octavo-egb"
                    onChange={e => setModal({ ...modal, data: { ...modal.data, level_id: e.target.value || null } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                  />
                </div>
              )}

              {modal.entity === 'course' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Icono (emoji)</label>
                    <input type="text" value={modal.data.icon} onChange={e => setModal({ ...modal, data: { ...modal.data, icon: e.target.value } })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Color</label>
                    <input type="text" value={modal.data.color} onChange={e => setModal({ ...modal, data: { ...modal.data, color: e.target.value } })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Dificultad</label>
                    <select value={modal.data.difficulty} onChange={e => setModal({ ...modal, data: { ...modal.data, difficulty: e.target.value } })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all">
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {modal.entity === 'lesson' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Slug</label>
                    <input
                      type="text" value={modal.data.slug}
                      onChange={e => setModal({ ...modal, data: { ...modal.data, slug: e.target.value.toLowerCase().replace(/\s/g, '-') } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Teoría (markdown: #, ##, **negrita**, `código`, - listas)</label>
                    <textarea
                      value={modal.data.theory || ''}
                      onChange={e => setModal({ ...modal, data: { ...modal.data, theory: e.target.value } })}
                      rows={8}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Ejemplos (JSON): [{'{'}"title","code","explanation"{'}'}]</label>
                    <textarea
                      value={modal.data.examples}
                      onChange={e => setModal({ ...modal, data: { ...modal.data, examples: e.target.value } })}
                      rows={6}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Retos (JSON): [{'{'}"title","description","starter_code","expected_output","hints":[]{'}'}]</label>
                    <textarea
                      value={modal.data.challenges}
                      onChange={e => setModal({ ...modal, data: { ...modal.data, challenges: e.target.value } })}
                      rows={6}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Minutos estimados</label>
                    <input
                      type="number" value={modal.data.estimated_minutes}
                      onChange={e => setModal({ ...modal, data: { ...modal.data, estimated_minutes: Number(e.target.value) } })}
                      className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-slate-600 mb-1">Orden (sort_order)</label>
                <input
                  type="number" value={modal.data.sort_order}
                  onChange={e => setModal({ ...modal, data: { ...modal.data, sort_order: Number(e.target.value) } })}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, data: { ...modal.data, is_active: !modal.data.is_active } })}
                  className={`w-12 h-6 rounded-full transition-all ${modal.data.is_active ? 'bg-chaski-primary' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${modal.data.is_active ? 'ml-6' : 'ml-0.5'}`} />
                </button>
                <span className="text-sm text-slate-700">{modal.data.is_active ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Cancelar</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-chaski-primary text-white rounded-lg font-medium hover:bg-chaski-primary/90 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {modal.mode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
