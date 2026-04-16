'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import {
  ArrowLeft, Save, Plus, Trash2, Edit, Video,
  FileText, ChevronDown, ChevronRight, X, Loader2, 
  Download, Play
} from 'lucide-react'

interface Lesson {
  id: string
  levelId: string
  moduleName: string
  title: string
  type: string
  duration: string
  order: number
  videoUrl: string
  pdfUrl?: string
  programId?: string
}

const PROGRAMS = [
  { value: 'robotica', label: '🤖 Robótica', color: 'bg-cyan-600' },
  { value: 'ia', label: '🧠 Inteligencia Artificial', color: 'bg-purple-600' },
  { value: 'hacking', label: '🔐 Ciberseguridad', color: 'bg-green-600' },
]

export default function ContenidoAdminPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('robotica')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    moduleName: '',
    videoUrl: '',
    pdfUrl: '',
    order: 1
  })

  useEffect(() => {
    if (!selectedLevel && EDUCATION_LEVELS.length > 0) {
      setSelectedLevel(EDUCATION_LEVELS[0].id)
    }
  }, [selectedLevel])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/contenido')
    }
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (selectedLevel) loadLessons()
  }, [selectedLevel, selectedProgram])

  const loadLessons = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/lessons?levelId=${selectedLevel}&programId=${selectedProgram}`)
      if (res.ok) {
        const data = await res.json()
        setLessons(Array.isArray(data) ? data : [])
        const moduleNames = new Set(data.map((l: Lesson) => l.moduleName))
        setExpandedModules(moduleNames as Set<string>)
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  const modules = lessons.reduce((acc, lesson) => {
    const key = lesson.moduleName || 'Sin módulo'
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {} as Record<string, Lesson[]>)

  Object.keys(modules).forEach(key => {
    modules[key].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const toggleModule = (name: string) => {
    const newSet = new Set(expandedModules)
    if (newSet.has(name)) newSet.delete(name)
    else newSet.add(name)
    setExpandedModules(newSet)
  }

  const openCreateModal = (moduleName?: string) => {
    setFormData({
      id: '',
      title: '',
      moduleName: moduleName || '',
      videoUrl: '',
      pdfUrl: '',
      order: moduleName ? (modules[moduleName]?.length || 0) + 1 : 1
    })
    setModalMode('create')
    setError('')
    setShowModal(true)
  }

  const openEditModal = (lesson: Lesson) => {
    setFormData({
      id: lesson.id,
      title: lesson.title,
      moduleName: lesson.moduleName,
      videoUrl: lesson.videoUrl || '',
      pdfUrl: lesson.pdfUrl || '',
      order: lesson.order || 1
    })
    setModalMode('edit')
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('El título es requerido')
      return
    }
    if (!formData.moduleName.trim()) {
      setError('El módulo es requerido')
      return
    }

    setSaving(true)
    setError('')

    try {
      const body = {
        ...(modalMode === 'edit' ? { id: formData.id } : {}),
        levelId: selectedLevel,
        programId: selectedProgram,
        moduleName: formData.moduleName,
        title: formData.title,
        type: 'video',
        duration: '10 min',
        videoUrl: formData.videoUrl,
        pdfUrl: formData.pdfUrl,
        order: formData.order
      }

      const res = await fetch('/api/lessons', {
        method: modalMode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        loadLessons()
        setShowModal(false)
      } else {
        const err = await res.json()
        setError(err.message || 'Error al guardar')
      }
    } catch {
      setError('Error de conexión')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return
    try {
      const res = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' })
      if (res.ok) loadLessons()
    } catch {
      alert('Error al eliminar')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (!isAdmin) return null

  const currentLevel = EDUCATION_LEVELS.find(l => l.id === selectedLevel)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold">Lecciones</h1>
          </div>
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Selectors */}
        <div className="flex gap-3 mb-4">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
          >
            {EDUCATION_LEVELS.map(level => (
              <option key={level.id} value={level.id}>
                {level.icon} {level.name} - {level.fullName}
              </option>
            ))}
          </select>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-48 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
          >
            {PROGRAMS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-gray-300">{currentLevel?.fullName}</span>
          <span className="text-sm text-gray-500">
            {PROGRAMS.find(p => p.value === selectedProgram)?.label} • {lessons.length} lecciones
          </span>
        </div>

        {/* Lessons */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : Object.keys(modules).length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No hay lecciones</p>
            <button
              onClick={() => openCreateModal()}
              className="px-4 py-2 bg-cyan-600 rounded-lg text-sm"
            >
              Crear primera lección
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(modules).map(([moduleName, moduleLessons]) => (
              <div key={moduleName} className="bg-gray-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(moduleName)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-gray-700/50 text-left"
                >
                  {expandedModules.has(moduleName) ? (
                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="flex-1 font-medium text-sm">{moduleName}</span>
                  <span className="text-xs text-gray-500">{moduleLessons.length}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openCreateModal(moduleName) }}
                    className="p-1 hover:bg-gray-600 rounded text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </button>

                {expandedModules.has(moduleName) && (
                  <div className="border-t border-gray-700">
                    {moduleLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700/30 border-b border-gray-700/50 last:border-0"
                      >
                        <span className="text-gray-500 text-xs w-5">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {lesson.videoUrl && (
                              <span className="text-green-400 flex items-center gap-1">
                                <Play className="w-3 h-3" /> Video
                              </span>
                            )}
                            {lesson.pdfUrl && (
                              <span className="text-blue-400 flex items-center gap-1">
                                <Download className="w-3 h-3" /> PDF
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => openEditModal(lesson)}
                          className="p-1.5 hover:bg-gray-600 rounded text-gray-600 hover:text-cyan-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id, lesson.title)}
                          className="p-1.5 hover:bg-gray-600 rounded text-gray-600 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold">
                {modalMode === 'edit' ? 'Editar' : 'Nueva Lección'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-2 bg-red-500/20 text-red-400 rounded text-sm">
                {error}
              </div>
            )}

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Módulo *</label>
                <input
                  type="text"
                  value={formData.moduleName}
                  onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                  placeholder="Ej: Módulo 1: Introducción"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Circuito LED en Serie"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  <Video className="w-3 h-3 inline mr-1" />
                  URL Video (YouTube o Drive)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  <Download className="w-3 h-3 inline mr-1" />
                  URL PDF (código)
                </label>
                <input
                  type="url"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
