'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Edit, Save, X, ExternalLink, Video, Image as ImageIcon, 
  Link2, FileText, ChevronDown, ChevronUp, Filter, RefreshCw,
  Bot, Brain, Shield, Play, BookOpen, Wrench, Trophy, FileQuestion,
  Plus, Trash2, Check, AlertCircle
} from 'lucide-react'

interface Resource {
  title: string
  url: string
  type?: string
}

interface ExternalLink {
  title: string
  url: string
  desc?: string
}

interface Lesson {
  id: string
  levelId: string
  moduleName: string
  title: string
  type: string
  duration: string
  order: number
  videoUrl?: string
  content?: string
  locked: boolean
  programId: string
  simulatorId?: string
  imageUrl?: string
  resources?: string | Resource[]
  externalLinks?: string | ExternalLink[]
}

const programConfig = {
  robotica: { color: 'blue', icon: Bot, name: 'Robótica' },
  ia: { color: 'purple', icon: Brain, name: 'IA' },
  hacking: { color: 'red', icon: Shield, name: 'Hacking' }
}

const typeConfig = {
  video: { icon: Play, color: 'text-red-400' },
  activity: { icon: Wrench, color: 'text-yellow-400' },
  tutorial: { icon: BookOpen, color: 'text-blue-400' },
  project: { icon: Trophy, color: 'text-purple-400' },
  quiz: { icon: FileQuestion, color: 'text-green-400' }
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state for editing
  const [formData, setFormData] = useState({
    videoUrl: '',
    imageUrl: '',
    resources: [] as Resource[],
    externalLinks: [] as ExternalLink[]
  })

  // Fetch lessons
  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/lessons')
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
        setFilteredLessons(data)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
    setLoading(false)
  }

  // Filter lessons
  useEffect(() => {
    let filtered = lessons
    
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterLevel) {
      filtered = filtered.filter(l => l.levelId === filterLevel)
    }
    
    if (filterProgram) {
      filtered = filtered.filter(l => l.programId === filterProgram)
    }
    
    setFilteredLessons(filtered)
  }, [searchTerm, filterLevel, filterProgram, lessons])

  // Parse JSON fields
  const parseJsonField = <T,>(field: string | T[] | undefined): T[] => {
    if (!field) return []
    if (Array.isArray(field)) return field
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }

  // Start editing a lesson
  const startEditing = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      videoUrl: lesson.videoUrl || '',
      imageUrl: lesson.imageUrl || '',
      resources: parseJsonField<Resource>(lesson.resources),
      externalLinks: parseJsonField<ExternalLink>(lesson.externalLinks)
    })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingLesson(null)
    setFormData({
      videoUrl: '',
      imageUrl: '',
      resources: [],
      externalLinks: []
    })
  }

  // Save lesson
  const saveLesson = async () => {
    if (!editingLesson) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: formData.videoUrl || null,
          imageUrl: formData.imageUrl || null,
          resources: JSON.stringify(formData.resources),
          externalLinks: JSON.stringify(formData.externalLinks)
        })
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: '¡Lección actualizada correctamente!' })
        // Update local state
        setLessons(prev => prev.map(l => 
          l.id === editingLesson.id 
            ? { ...l, ...formData, resources: formData.resources, externalLinks: formData.externalLinks }
            : l
        ))
        cancelEditing()
      } else {
        setMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión. Intenta de nuevo.' })
    }
    setSaving(false)
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  // Add resource
  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { title: '', url: '', type: 'pdf' }]
    }))
  }

  // Remove resource
  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }))
  }

  // Update resource
  const updateResource = (index: number, field: keyof Resource, value: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }))
  }

  // Add external link
  const addExternalLink = () => {
    setFormData(prev => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { title: '', url: '', desc: '' }]
    }))
  }

  // Remove external link
  const removeExternalLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index)
    }))
  }

  // Update external link
  const updateExternalLink = (index: number, field: keyof ExternalLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.map((l, i) => 
        i === index ? { ...l, [field]: value } : l
      )
    }))
  }

  // Get unique levels
  const levels = [...new Set(lessons.map(l => l.levelId))].sort()

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Administrar Lecciones</h1>
            <p className="text-gray-400 mt-1">Edita videos, imágenes y recursos de las lecciones</p>
          </div>
          <button 
            onClick={fetchLessons}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-dark-800 rounded-2xl p-4 mb-6 border border-dark-600">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar lección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Level filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos los niveles</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            {/* Program filter */}
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos los programas</option>
              <option value="robotica">Robótica</option>
              <option value="ia">IA</option>
              <option value="hacking">Hacking</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <p className="text-gray-400 text-sm">Total lecciones</p>
            <p className="text-2xl font-bold text-white">{lessons.length}</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <p className="text-gray-400 text-sm">Con video</p>
            <p className="text-2xl font-bold text-green-400">
              {lessons.filter(l => l.videoUrl).length}
            </p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <p className="text-gray-400 text-sm">Con imagen</p>
            <p className="text-2xl font-bold text-blue-400">
              {lessons.filter(l => l.imageUrl).length}
            </p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <p className="text-gray-400 text-sm">Con recursos</p>
            <p className="text-2xl font-bold text-purple-400">
              {lessons.filter(l => l.resources && parseJsonField(l.resources).length > 0).length}
            </p>
          </div>
        </div>

        {/* Lessons list */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando lecciones...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLessons.map(lesson => {
              const program = programConfig[lesson.programId as keyof typeof programConfig] || programConfig.robotica
              const lessonType = typeConfig[lesson.type as keyof typeof typeConfig] || typeConfig.video
              const ProgramIcon = program.icon
              const TypeIcon = lessonType.icon
              const isEditing = editingLesson?.id === lesson.id
              const hasVideo = !!lesson.videoUrl
              const hasImage = !!lesson.imageUrl
              const resourceCount = parseJsonField(lesson.resources).length
              const linkCount = parseJsonField(lesson.externalLinks).length

              return (
                <div 
                  key={lesson.id}
                  className={`bg-dark-800 rounded-xl border transition-all ${
                    isEditing ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-dark-600 hover:border-dark-500'
                  }`}
                >
                  {/* Lesson header */}
                  <div className="p-4 flex items-center gap-4">
                    {/* Program icon */}
                    <div className={`w-10 h-10 bg-${program.color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <ProgramIcon className={`w-5 h-5 text-${program.color}-400`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon className={`w-4 h-4 ${lessonType.color}`} />
                        <span className="text-white font-medium truncate">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{lesson.levelId}</span>
                        <span>•</span>
                        <span>{lesson.moduleName}</span>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2">
                      {hasVideo && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video
                        </span>
                      )}
                      {hasImage && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Imagen
                        </span>
                      )}
                      {resourceCount > 0 && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {resourceCount}
                        </span>
                      )}
                      {linkCount > 0 && (
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {linkCount}
                        </span>
                      )}
                    </div>

                    {/* Edit button */}
                    {!isEditing ? (
                      <button
                        onClick={() => startEditing(lesson)}
                        className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={cancelEditing}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Edit form */}
                  {isEditing && (
                    <div className="border-t border-dark-600 p-4 space-y-6">
                      {/* Video URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Video className="w-4 h-4 inline mr-2" />
                          URL del Video (YouTube o Google Drive)
                        </label>
                        <input
                          type="text"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                          placeholder="https://www.youtube.com/watch?v=... o https://drive.google.com/..."
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Soporta: YouTube, Google Drive (compartido públicamente)
                        </p>
                      </div>

                      {/* Image URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <ImageIcon className="w-4 h-4 inline mr-2" />
                          URL de la Imagen
                        </label>
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://images.unsplash.com/... o https://drive.google.com/..."
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Usa Unsplash, Google Drive (link directo), o cualquier URL de imagen
                        </p>
                      </div>

                      {/* Resources */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">
                            <FileText className="w-4 h-4 inline mr-2" />
                            Recursos (PDFs, Videos, Código)
                          </label>
                          <button
                            onClick={addResource}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.resources.map((resource, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={resource.title}
                                onChange={(e) => updateResource(idx, 'title', e.target.value)}
                                placeholder="Título"
                                className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                              />
                              <input
                                type="text"
                                value={resource.url}
                                onChange={(e) => updateResource(idx, 'url', e.target.value)}
                                placeholder="URL (Google Drive, etc.)"
                                className="flex-[2] px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                              />
                              <select
                                value={resource.type || 'pdf'}
                                onChange={(e) => updateResource(idx, 'type', e.target.value)}
                                className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                              >
                                <option value="pdf">PDF</option>
                                <option value="video">Video</option>
                                <option value="code">Código</option>
                                <option value="image">Imagen</option>
                              </select>
                              <button
                                onClick={() => removeResource(idx)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {formData.resources.length === 0 && (
                            <p className="text-gray-500 text-sm py-2">No hay recursos. Haz clic en "Agregar" para añadir uno.</p>
                          )}
                        </div>
                      </div>

                      {/* External Links */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">
                            <Link2 className="w-4 h-4 inline mr-2" />
                            Enlaces Externos
                          </label>
                          <button
                            onClick={addExternalLink}
                            className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.externalLinks.map((link, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => updateExternalLink(idx, 'title', e.target.value)}
                                placeholder="Título"
                                className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                              />
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => updateExternalLink(idx, 'url', e.target.value)}
                                placeholder="URL"
                                className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                              />
                              <input
                                type="text"
                                value={link.desc || ''}
                                onChange={(e) => updateExternalLink(idx, 'desc', e.target.value)}
                                placeholder="Descripción"
                                className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                              />
                              <button
                                onClick={() => removeExternalLink(idx)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {formData.externalLinks.length === 0 && (
                            <p className="text-gray-500 text-sm py-2">No hay enlaces. Haz clic en "Agregar" para añadir uno.</p>
                          )}
                        </div>
                      </div>

                      {/* Save button */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-300 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={saveLesson}
                          disabled={saving}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                        >
                          {saving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Guardar cambios
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredLessons.length === 0 && (
              <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-600">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No se encontraron lecciones</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
