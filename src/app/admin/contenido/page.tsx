'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import {
  ArrowLeft, Save, Plus, Trash2, Edit, Video,
  FileText, ChevronDown, ChevronRight, ChevronUp,
  GripVertical, Eye, X, Check, ExternalLink, Loader2, RefreshCw
} from 'lucide-react'

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
  images: string[]
  content: string
  locked: boolean
}

interface EditFormData {
  title: string
  type: string
  duration: string
  videoUrl: string
  images: string[]
  content: string
  locked: boolean
}

export default function ContenidoAdminPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const [selectedLevel, setSelectedLevel] = useState<string>('inicial-1')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(true)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: '',
    type: 'video',
    duration: '5 min',
    videoUrl: '',
    images: [],
    content: '',
    locked: false
  })
  const [showNewLessonModal, setShowNewLessonModal] = useState(false)
  const [showNewModuleModal, setShowNewModuleModal] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [newModuleName, setNewModuleName] = useState('')
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    type: 'video',
    duration: '5 min',
    videoUrl: '',
    content: '',
    moduleId: '',
    moduleName: ''
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/contenido')
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    loadLessons()
  }, [selectedLevel])

  const loadLessons = async () => {
    setLoadingLessons(true)
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
    setLoadingLessons(false)
  }

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setEditFormData({
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl || '',
      images: lesson.images || [],
      content: lesson.content || '',
      locked: lesson.locked
    })
    setMessage(null)
  }

  const handleSaveLesson = async () => {
    if (!editingLesson) return
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLesson.id,
          ...editFormData
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Lección guardada correctamente' })
        loadLessons()
        setTimeout(() => {
          setEditingLesson(null)
        }, 1500)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Error al guardar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    }
    setSaving(false)
  }

  const handleCreateLesson = async () => {
    if (!newLessonData.title || !newLessonData.moduleId) {
      setMessage({ type: 'error', text: 'Título y módulo son requeridos' })
      return
    }
    setSaving(true)
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId: selectedLevel,
          ...newLessonData,
          order: lessons.filter(l => l.moduleId === newLessonData.moduleId).length + 1
        })
      })
      if (response.ok) {
        loadLessons()
        setShowNewLessonModal(false)
        setNewLessonData({ title: '', type: 'video', duration: '5 min', videoUrl: '', content: '', moduleId: '', moduleName: '' })
      } else {
        const error = await response.json()
        alert(error.message || 'Error al crear lección')
      }
    } catch (error) {
      alert('Error de conexión')
    }
    setSaving(false)
  }

  const handleCreateModule = async () => {
    if (!newModuleName.trim()) return
    setSaving(true)
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId: selectedLevel,
          moduleName: newModuleName,
          title: 'Nueva lección (editar)',
          type: 'video',
          duration: '5 min',
          order: modules.length + 1
        })
      })
      if (response.ok) {
        loadLessons()
        setShowNewModuleModal(false)
        setNewModuleName('')
      } else {
        const error = await response.json()
        alert(error.message || 'Error al crear módulo')
      }
    } catch (error) {
      alert('Error al crear módulo')
    }
    setSaving(false)
  }

  const handleMoveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return
    
    const moduleLessons = lessons
      .filter(l => l.moduleName === lesson.moduleName)
      .sort((a, b) => a.order - b.order)
    
    const currentIndex = moduleLessons.findIndex(l => l.id === lessonId)
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (swapIndex < 0 || swapIndex >= moduleLessons.length) return
    
    const swapLesson = moduleLessons[swapIndex]
    
    try {
      await Promise.all([
        fetch('/api/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lesson.id, order: swapLesson.order })
        }),
        fetch('/api/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: swapLesson.id, order: lesson.order })
        })
      ])
      loadLessons()
    } catch (error) {
      alert('Error al mover lección')
    }
  }

  const handleUpdateModuleName = async (moduleId: string, newName: string) => {
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId)
    try {
      for (const lesson of moduleLessons) {
        await fetch('/api/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lesson.id, moduleName: newName })
        })
      }
      loadLessons()
      setEditingModuleId(null)
    } catch (error) {
      alert('Error al actualizar módulo')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('¿Eliminar esta lección?')) return
    try {
      const response = await fetch(`/api/lessons?id=${lessonId}`, { method: 'DELETE' })
      if (response.ok) loadLessons()
    } catch (error) {
      alert('Error al eliminar')
    }
  }

  const openNewLessonModal = (moduleId: string, moduleName: string) => {
    setNewLessonData({ ...newLessonData, moduleId, moduleName })
    setShowNewLessonModal(true)
  }

  const lessonsByModule = lessons.reduce((acc, lesson) => {
    const moduleKey = lesson.moduleId || 'sin-modulo'
    if (!acc[moduleKey]) {
      acc[moduleKey] = {
        id: moduleKey,
        name: lesson.moduleName || 'Sin módulo',
        lessons: []
      }
    }
    acc[moduleKey].lessons.push(lesson)
    return acc
  }, {} as Record<string, { id: string; name: string; lessons: Lesson[] }>)

  const modules = Object.values(lessonsByModule)

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  const levels = EDUCATION_LEVELS
  const currentLevel = levels.find(l => l.id === selectedLevel)

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-400" />
      case 'activity': return <FileText className="w-4 h-4 text-green-400" />
      case 'tutorial': return <FileText className="w-4 h-4 text-purple-400" />
      case 'project': return <FileText className="w-4 h-4 text-orange-400" />
      default: return <FileText className="w-4 h-4 text-gray-400" />
    }
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
              <h1 className="text-xl font-bold text-white">Gestión de Contenido</h1>
              <p className="text-sm text-gray-400">Edita videos, imágenes y lecciones de cada curso</p>
            </div>
          </div>
          <button 
            onClick={loadLessons}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-dark-800 border-r border-dark-600 min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Niveles Educativos</h3>
            <div className="space-y-1">
              {levels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    selectedLevel === level.id
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                      : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{level.icon}</span>
                  <span className="text-sm">{level.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {loadingLessons ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Curso {currentLevel?.name || selectedLevel}
                    </h2>
                    <p className="text-gray-400">Contenido educativo para {currentLevel?.fullName || selectedLevel}</p>
                    <div className="flex gap-4 mt-4 text-sm">
                      <span className="text-gray-400">{modules.length} módulos</span>
                      <span className="text-gray-400">{lessons.length} lecciones</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Módulos y Lecciones</h3>
                  <button 
                    onClick={() => setShowNewModuleModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Módulo
                  </button>
                </div>

                {modules.length === 0 ? (
                  <div className="bg-dark-800 rounded-xl border border-dark-600 p-12 text-center">
                    <p className="text-gray-400 mb-4">No hay lecciones para este nivel aún.</p>
                    <p className="text-sm text-gray-500">Agrega lecciones en la tabla &quot;lessons&quot; de Airtable</p>
                  </div>
                ) : (
                  modules.map((module) => (
                    <div key={module.id} className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-dark-700/50"
                        onClick={() => toggleModule(module.id)}
                      >
                        <GripVertical className="w-4 h-4 text-gray-500" />
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                          {editingModuleId === module.id ? (
                            <input
                              type="text"
                              defaultValue={module.name}
                              autoFocus
                              className="bg-dark-600 border border-neon-cyan rounded px-2 py-1 text-white text-sm w-64"
                              onBlur={(e) => handleUpdateModuleName(module.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateModuleName(module.id, e.currentTarget.value)
                                if (e.key === 'Escape') setEditingModuleId(null)
                              }}
                            />
                          ) : (
                            <h4 className="text-white font-medium">{module.name}</h4>
                          )}
                          <p className="text-sm text-gray-400">{module.lessons.length} lecciones</p>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setEditingModuleId(module.id)}
                            className="p-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-600 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {expandedModules.has(module.id) && (
                        <div className="border-t border-dark-600">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-4 py-3 border-b border-dark-600/50 last:border-0 hover:bg-dark-700/30"
                            >
                              <GripVertical className="w-4 h-4 text-gray-600" />
                              <div className="w-8 h-8 bg-dark-600 rounded-lg flex items-center justify-center">
                                {getLessonTypeIcon(lesson.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{lesson.title}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>{lesson.type}</span>
                                  <span>{lesson.duration}</span>
                                  {lesson.videoUrl ? (
                                    <span className="text-green-400 flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Video
                                    </span>
                                  ) : (
                                    <span className="text-yellow-400">Sin video</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveLesson(lesson.id, 'up')}
                                  className="p-1 text-gray-500 hover:text-white hover:bg-dark-600 rounded"
                                  title="Mover arriba"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMoveLesson(lesson.id, 'down')}
                                  className="p-1 text-gray-500 hover:text-white hover:bg-dark-600 rounded"
                                  title="Mover abajo"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEditModal(lesson)}
                                  className="p-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-600 rounded-lg"
                                  title="Editar lección"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-dark-600 rounded-lg" title="Ver">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-lg" 
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => openNewLessonModal(module.id, module.name)}
                            className="w-full flex items-center justify-center gap-2 p-3 text-gray-400 hover:text-neon-cyan hover:bg-dark-700/30"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar Lección
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-xl font-semibold text-white">Editar Lección</h3>
              <button
                onClick={() => setEditingLesson(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`mx-6 mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Título de la Lección</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    <option value="video">Video</option>
                    <option value="activity">Actividad</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="project">Proyecto</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duración</label>
                  <input
                    type="text"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                    placeholder="ej: 15 min"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <Video className="w-4 h-4 inline mr-2" />
                  URL del Video (Google Drive o YouTube)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editFormData.videoUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/ID/preview"
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                  />
                  {editFormData.videoUrl && (
                    <a 
                      href={editFormData.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-3 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Para Google Drive: usa el formato <code className="text-neon-cyan">/preview</code> al final
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  🖼️ URLs de Imágenes (una por línea)
                </label>
                <textarea
                  rows={3}
                  value={editFormData.images.join('\n')}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    images: e.target.value.split('\n').map(url => url.trim()).filter(url => url) 
                  })}
                  placeholder="https://drive.google.com/uc?id=ID_IMAGEN&#10;https://otra-imagen.jpg"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Agrega múltiples URLs de imágenes, una por línea. Para Google Drive usa: <code className="text-neon-cyan">https://drive.google.com/uc?id=ID</code>
                </p>
                {editFormData.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editFormData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={img} 
                          alt={`Imagen ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-dark-600"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditFormData({
                            ...editFormData,
                            images: editFormData.images.filter((_, i) => i !== idx)
                          })}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Descripción / Contenido
                </label>
                <textarea
                  rows={4}
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  placeholder="Describe el contenido de esta lección..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={editFormData.locked}
                    onChange={(e) => setEditFormData({ ...editFormData, locked: e.target.checked })}
                    className="rounded bg-dark-700 border-dark-600"
                  />
                  Bloqueada (requiere completar anteriores)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveLesson}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Lección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Módulo */}
      {showNewModuleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-xl font-semibold text-white">Nuevo Módulo</h3>
              <button onClick={() => setShowNewModuleModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre del Módulo</label>
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="Ej: Módulo 1: Introducción"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
              <button onClick={() => setShowNewModuleModal(false)} className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600">
                Cancelar
              </button>
              <button onClick={handleCreateModule} disabled={saving || !newModuleName.trim()} className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Crear Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Lección */}
      {showNewLessonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-xl font-semibold text-white">Nueva Lección - {newLessonData.moduleName}</h3>
              <button onClick={() => setShowNewLessonModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Título de la Lección</label>
                <input
                  type="text"
                  value={newLessonData.title}
                  onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                  <select
                    value={newLessonData.type}
                    onChange={(e) => setNewLessonData({ ...newLessonData, type: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    <option value="video">Video</option>
                    <option value="activity">Actividad</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="project">Proyecto</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duración</label>
                  <input
                    type="text"
                    value={newLessonData.duration}
                    onChange={(e) => setNewLessonData({ ...newLessonData, duration: e.target.value })}
                    placeholder="ej: 3 min"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">URL del Video (opcional)</label>
                <input
                  type="url"
                  value={newLessonData.videoUrl}
                  onChange={(e) => setNewLessonData({ ...newLessonData, videoUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/ID/preview"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contenido / Descripción</label>
                <textarea
                  rows={3}
                  value={newLessonData.content}
                  onChange={(e) => setNewLessonData({ ...newLessonData, content: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
              <button onClick={() => setShowNewLessonModal(false)} className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600">
                Cancelar
              </button>
              <button onClick={handleCreateLesson} disabled={saving || !newLessonData.title.trim()} className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 rounded-lg font-medium hover:bg-neon-green/90 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Crear Lección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
