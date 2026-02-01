'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import {
  ArrowLeft, Save, Plus, Trash2, Edit, Video,
  FileText, ChevronDown, ChevronRight, ChevronUp,
  GripVertical, Eye, X, Check, ExternalLink, Loader2, RefreshCw,
  Download, Code, BookOpen, FileCode
} from 'lucide-react'

// Función para convertir URLs de Google Drive al formato de imagen directa
function convertGoogleDriveUrl(url: string): string {
  if (!url) return ''
  // Si ya está en formato uc?id=, devolverlo tal cual
  if (url.includes('drive.google.com/uc?id=')) return url
  // Convertir formato /file/d/ID/view o /file/d/ID/preview
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}`
  }
  // Formato ?id=ID
  const idMatch = url.match(/[?&]id=([^&]+)/)
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/uc?id=${idMatch[1]}`
  }
  return url
}

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
  pdfUrl?: string
}

interface Document {
  id: string
  title: string
  description: string
  driveUrl: string
  levelId: string
  moduleId?: string
  category: 'codigo' | 'tutorial' | 'ejercicio' | 'referencia' | 'otro'
  tags: string[]
  createdAt: string
  isActive: boolean
}

interface EditFormData {
  title: string
  type: string
  duration: string
  videoUrl: string
  content: string
  locked: boolean
  pdfUrl: string
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
    content: '',
    locked: false,
    pdfUrl: ''
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
  
  // Estados para documentos
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [showDocModal, setShowDocModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [activeTab, setActiveTab] = useState<'lessons' | 'documents'>('lessons')
  const [docFormData, setDocFormData] = useState({
    title: '',
    description: '',
    driveUrl: '',
    category: 'codigo' as 'codigo' | 'tutorial' | 'ejercicio' | 'referencia' | 'otro',
    tags: ''
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
    loadDocuments()
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

  const loadDocuments = async () => {
    setLoadingDocs(true)
    try {
      let url = '/api/documents'
      if (selectedLevel) {
        url += `?levelId=${selectedLevel}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
    setLoadingDocs(false)
  }

  const handleSaveDocument = async () => {
    setSaving(true)
    try {
      const payload = {
        ...docFormData,
        levelId: selectedLevel,
        tags: docFormData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      if (editingDoc) {
        const response = await fetch('/api/documents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingDoc.id, ...payload })
        })
        if (response.ok) {
          loadDocuments()
          setShowDocModal(false)
          setEditingDoc(null)
        }
      } else {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (response.ok) {
          loadDocuments()
          setShowDocModal(false)
        }
      }
    } catch (error) {
      alert('Error al guardar documento')
    }
    setSaving(false)
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      const response = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
      if (response.ok) loadDocuments()
    } catch (error) {
      alert('Error al eliminar')
    }
  }

  const openDocModal = (doc?: Document) => {
    if (doc) {
      setEditingDoc(doc)
      setDocFormData({
        title: doc.title,
        description: doc.description,
        driveUrl: doc.driveUrl,
        category: doc.category,
        tags: doc.tags.join(', ')
      })
    } else {
      setEditingDoc(null)
      setDocFormData({ title: '', description: '', driveUrl: '', category: 'codigo', tags: '' })
    }
    setShowDocModal(true)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'codigo': return <Code className="w-4 h-4 text-green-400" />
      case 'tutorial': return <BookOpen className="w-4 h-4 text-blue-400" />
      case 'ejercicio': return <FileCode className="w-4 h-4 text-orange-400" />
      case 'referencia': return <FileText className="w-4 h-4 text-purple-400" />
      default: return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      codigo: 'Código',
      tutorial: 'Tutorial',
      ejercicio: 'Ejercicio',
      referencia: 'Referencia',
      otro: 'Otro'
    }
    return labels[category] || category
  }

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setEditFormData({
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl || '',
      content: lesson.content || '',
      locked: lesson.locked,
      pdfUrl: lesson.pdfUrl || ''
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
                      <span className="text-gray-400">{documents.length} documentos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-dark-600 pb-2">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'lessons'
                      ? 'bg-dark-700 text-neon-cyan border-b-2 border-neon-cyan'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Lecciones
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'documents'
                      ? 'bg-dark-700 text-neon-green border-b-2 border-neon-green'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-4 h-4 inline mr-2" />
                  Documentos PDF
                </button>
              </div>

              {activeTab === 'lessons' && (
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
                                  {lesson.pdfUrl && (
                                    <span className="text-blue-400 flex items-center gap-1">
                                      <Download className="w-3 h-3" /> PDF
                                    </span>
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
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Documentos y Códigos</h3>
                  <button 
                    onClick={() => openDocModal()}
                    className="flex items-center gap-2 px-3 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Documento
                  </button>
                </div>

                <div className="bg-dark-800/50 rounded-xl border border-dark-600 p-4">
                  <p className="text-sm text-gray-400 mb-2">
                    📁 Sube tus archivos PDF a Google Drive, luego pega el enlace aquí para que los estudiantes puedan descargarlos.
                  </p>
                </div>

                {loadingDocs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="bg-dark-800 rounded-xl border border-dark-600 p-12 text-center">
                    <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No hay documentos para este nivel</p>
                    <p className="text-sm text-gray-500">Agrega códigos, tutoriales y ejercicios en PDF</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-dark-800 rounded-xl border border-dark-600 p-4 hover:border-dark-500 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center">
                            {getCategoryIcon(doc.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium">{doc.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2">{doc.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-dark-700 text-xs text-gray-300 rounded">
                                {getCategoryLabel(doc.category)}
                              </span>
                              {doc.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-dark-600 text-xs text-gray-400 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={doc.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-neon-green hover:bg-neon-green/20 rounded-lg"
                              title="Descargar"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                            <button
                              onClick={() => openDocModal(doc)}
                              className="p-2 text-gray-400 hover:text-neon-cyan hover:bg-dark-600 rounded-lg"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-lg"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
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
                  URLs de Videos e Imágenes (una por línea)
                </label>
                <textarea
                  rows={4}
                  value={editFormData.videoUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/ID/preview&#10;https://drive.google.com/file/d/IMAGEN_ID/view"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Videos:</strong> usa <code className="text-neon-cyan">/preview</code> al final • 
                  <strong> Imágenes:</strong> pega el link normal de Google Drive
                </p>
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

              <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/30">
                <label className="block text-sm text-white font-medium mb-2">
                  <Download className="w-4 h-4 inline mr-2" />
                  📄 Documento PDF (opcional)
                </label>
                <input
                  type="url"
                  value={editFormData.pdfUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, pdfUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Sube el PDF a Google Drive → Compartir → Cualquier persona con el enlace → Pega el enlace aquí
                </p>
                {editFormData.pdfUrl && (
                  <a 
                    href={editFormData.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg"
                  >
                    <Download className="w-4 h-4" /> Ver PDF
                  </a>
                )}
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

      {/* Modal Documento */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-xl font-semibold text-white">
                {editingDoc ? 'Editar Documento' : 'Nuevo Documento'}
              </h3>
              <button onClick={() => { setShowDocModal(false); setEditingDoc(null); }} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Título del Documento *</label>
                <input
                  type="text"
                  value={docFormData.title}
                  onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                  placeholder="Ej: Código Arduino - LED Blink"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Enlace de Google Drive *</label>
                <input
                  type="url"
                  value={docFormData.driveUrl}
                  onChange={(e) => setDocFormData({ ...docFormData, driveUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sube el PDF a tu Drive, haz clic derecho → Compartir → Cualquier persona con el enlace → Copiar enlace
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Categoría</label>
                <select
                  value={docFormData.category}
                  onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value as any })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                >
                  <option value="codigo">📝 Código</option>
                  <option value="tutorial">📖 Tutorial</option>
                  <option value="ejercicio">✏️ Ejercicio</option>
                  <option value="referencia">📚 Referencia</option>
                  <option value="otro">📄 Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Descripción (opcional)</label>
                <textarea
                  rows={2}
                  value={docFormData.description}
                  onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                  placeholder="Breve descripción del contenido..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  value={docFormData.tags}
                  onChange={(e) => setDocFormData({ ...docFormData, tags: e.target.value })}
                  placeholder="arduino, led, básico"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
              <button onClick={() => { setShowDocModal(false); setEditingDoc(null); }} className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600">
                Cancelar
              </button>
              <button 
                onClick={handleSaveDocument} 
                disabled={saving || !docFormData.title.trim() || !docFormData.driveUrl.trim()} 
                className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 rounded-lg font-medium hover:bg-neon-green/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingDoc ? 'Guardar Cambios' : 'Crear Documento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
