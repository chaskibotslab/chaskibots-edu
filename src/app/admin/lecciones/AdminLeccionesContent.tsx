'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit2, Trash2, Save, X, 
  Video, Zap, FileText, Package, BookOpen,
  Clock, GripVertical, ChevronDown
} from 'lucide-react'
import { EDUCATION_LEVELS } from '@/lib/constants'

interface Lesson {
  id: string
  levelId: string
  moduleId: string
  moduleName: string
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
  duration: string
  order: number
  videoUrl: string
  content: string
  locked: boolean
}

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'activity', label: 'Actividad', icon: Zap },
  { value: 'tutorial', label: 'Tutorial', icon: FileText },
  { value: 'project', label: 'Proyecto', icon: Package },
  { value: 'quiz', label: 'Quiz', icon: BookOpen },
]

export default function AdminLeccionesContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'admin'

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    levelId: '',
    moduleId: '',
    moduleName: '',
    title: '',
    type: 'video' as Lesson['type'],
    duration: '5 min',
    order: 0,
    videoUrl: '',
    content: '',
    locked: false,
  })

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    loadLessons()
  }, [selectedLevel])

  const loadLessons = async () => {
    setLoading(true)
    try {
      let url = '/api/lessons'
      if (selectedLevel) {
        url += `?levelId=${selectedLevel}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLessons(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
    setLoading(false)
  }

  const openCreateModal = () => {
    setIsCreating(true)
    setEditingLesson(null)
    setFormData({
      levelId: selectedLevel || '',
      moduleId: '',
      moduleName: '',
      title: '',
      type: 'video',
      duration: '5 min',
      order: lessons.length,
      videoUrl: '',
      content: '',
      locked: false,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (lesson: Lesson) => {
    setIsCreating(false)
    setEditingLesson(lesson)
    setFormData({
      levelId: lesson.levelId,
      moduleId: lesson.moduleId,
      moduleName: lesson.moduleName,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      order: lesson.order,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      locked: lesson.locked,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLesson(null)
    setMessage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const method = isCreating ? 'POST' : 'PUT'
      const response = await fetch('/api/lessons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLesson?.id,
          ...formData
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: isCreating ? 'Leccion creada' : 'Leccion actualizada' })
        loadLessons()
        setTimeout(() => {
          closeModal()
        }, 1000)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Error al guardar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexion' })
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta leccion?')) return

    try {
      const response = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        loadLessons()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const getLessonIcon = (type: string) => {
    const typeInfo = LESSON_TYPES.find(t => t.value === type)
    if (typeInfo) {
      const Icon = typeInfo.icon
      return <Icon className="w-4 h-4" />
    }
    return <BookOpen className="w-4 h-4" />
  }

  const groupedLessons = lessons.reduce((acc, lesson) => {
    const key = lesson.moduleName || 'Sin modulo'
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {} as Record<string, Lesson[]>)

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Gestion de Lecciones</h1>
              <p className="text-sm text-gray-400">Administra las lecciones de cada nivel</p>
            </div>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Leccion
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Filtrar por nivel:</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
          >
            <option value="">Todos los niveles</option>
            {EDUCATION_LEVELS.map(level => (
              <option key={level.id} value={level.id}>
                {level.icon} {level.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay lecciones{selectedLevel ? ' para este nivel' : ''}</p>
            <button onClick={openCreateModal} className="mt-4 text-neon-cyan hover:underline">
              Crear primera leccion
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLessons).map(([moduleName, moduleLessons]) => (
              <div key={moduleName} className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
                <div className="bg-dark-700 px-4 py-3 border-b border-dark-600">
                  <h3 className="font-semibold text-white">{moduleName}</h3>
                  <p className="text-sm text-gray-400">{moduleLessons.length} lecciones</p>
                </div>
                <div className="divide-y divide-dark-600">
                  {moduleLessons.sort((a, b) => a.order - b.order).map(lesson => (
                    <div key={lesson.id} className="px-4 py-3 flex items-center gap-4 hover:bg-dark-700/50">
                      <div className="w-8 h-8 bg-dark-600 rounded-lg flex items-center justify-center text-gray-400">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{lesson.title}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                          <span className="capitalize">{lesson.type}</span>
                          {lesson.locked && <span className="text-yellow-500">🔒 Bloqueada</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(lesson)}
                          className="p-2 text-gray-400 hover:text-neon-cyan transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-800 border-b border-dark-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isCreating ? 'Nueva Leccion' : 'Editar Leccion'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nivel *</label>
                  <select
                    value={formData.levelId}
                    onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    <option value="">Seleccionar nivel</option>
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.icon} {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre del Modulo *</label>
                  <input
                    type="text"
                    value={formData.moduleName}
                    onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                    placeholder="Ej: Modulo 1: Introduccion"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Titulo de la Leccion *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Hola! Bienvenidos al curso"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Lesson['type'] })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {LESSON_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duracion</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ej: 10 min"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Orden</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">URL del Video (Google Drive o YouTube)</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pega el enlace de Google Drive o YouTube. El video se mostrara embebido.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Contenido / Descripcion</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Descripcion o contenido de la leccion..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="locked"
                  checked={formData.locked}
                  onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-neon-cyan focus:ring-neon-cyan"
                />
                <label htmlFor="locked" className="text-gray-300">
                  Leccion bloqueada (requiere completar anteriores)
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-800 border-t border-dark-600 px-6 py-4 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-gray-400 hover:text-white">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.levelId}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
