'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EDUCATION_LEVELS } from '@/lib/constants'
import {
  FileText, Plus, Edit, Trash2, Save, X, Search,
  ArrowLeft, Calendar, Award, CheckCircle, Clock,
  Bot, CircuitBoard, Code, Lightbulb, BookOpen,
  ChevronDown, ChevronUp, Eye, EyeOff, Filter, Loader2,
  Type, ListChecks, Pencil, Upload, Image
} from 'lucide-react'

// Tipos de pregunta disponibles
const QUESTION_TYPES = [
  { id: 'text', name: 'Texto', icon: Type, desc: 'Respuesta escrita' },
  { id: 'multiple', name: 'Opción Múltiple', icon: ListChecks, desc: 'Seleccionar respuesta' },
  { id: 'drawing', name: 'Dibujo', icon: Pencil, desc: 'Dibujar o esquema' },
  { id: 'upload', name: 'Subir Archivo', icon: Upload, desc: 'PDF, imagen, documento' },
  { id: 'image', name: 'Foto/Captura', icon: Image, desc: 'Tomar o subir foto' },
]

interface Question {
  text: string
  type: 'text' | 'multiple' | 'drawing' | 'upload' | 'image'
  options: string[]
}

interface Task {
  id: string
  levelId: string
  title: string
  description: string
  type: 'concept' | 'code' | 'project' | 'quiz'
  category: 'robotica' | 'electronica' | 'programacion' | 'ia' | 'general'
  difficulty: 'basico' | 'intermedio' | 'avanzado'
  points: number
  dueDate?: string
  isActive: boolean
  questions: string[]
  createdAt: string
}

const CATEGORIES = [
  { id: 'robotica', name: 'Robótica', icon: Bot, color: 'text-neon-cyan' },
  { id: 'electronica', name: 'Electrónica', icon: CircuitBoard, color: 'text-yellow-400' },
  { id: 'programacion', name: 'Programación', icon: Code, color: 'text-neon-green' },
  { id: 'ia', name: 'Inteligencia Artificial', icon: Lightbulb, color: 'text-neon-pink' },
  { id: 'general', name: 'General', icon: BookOpen, color: 'text-gray-400' },
]

const TYPES = [
  { id: 'concept', name: 'Conceptual', desc: 'Preguntas teóricas' },
  { id: 'code', name: 'Código', desc: 'Ejercicios de programación' },
  { id: 'project', name: 'Proyecto', desc: 'Proyecto práctico' },
  { id: 'quiz', name: 'Quiz', desc: 'Evaluación rápida' },
  { id: 'drawing', name: 'Dibujo', desc: 'Diagramas y esquemas' },
  { id: 'upload', name: 'Subir Archivo', desc: 'Documentos, fotos, etc.' },
]

const DIFFICULTIES = [
  { id: 'basico', name: 'Básico', color: 'bg-green-500/20 text-green-400' },
  { id: 'intermedio', name: 'Intermedio', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'avanzado', name: 'Avanzado', color: 'bg-red-500/20 text-red-400' },
]

export default function AdminTareasPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  
  // Usuario logueado
  const [currentUser, setCurrentUser] = useState<{ role: string; levelId: string; courseId: string } | null>(null)
  const isAdmin = currentUser?.role === 'admin'
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    levelId: '',
    title: '',
    description: '',
    type: 'concept' as string,
    category: 'robotica' as Task['category'],
    difficulty: 'basico' as Task['difficulty'],
    points: 10,
    dueDate: '',
    questions: [{ text: '', type: 'text' as Question['type'], options: [] as string[] }],
    attachmentUrl: '',
    attachmentType: 'none' as 'none' | 'drive' | 'link' | 'pdf'
  })

  // Cargar usuario logueado
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
        // Si es profesor, fijar su nivel
        if (user.role === 'teacher' && user.levelId) {
          setSelectedLevel(user.levelId)
        }
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser !== null) {
      loadTasks()
    }
  }, [selectedLevel, showInactive, currentUser])

  const loadTasks = async () => {
    setLoading(true)
    try {
      let url = `/api/tasks?activeOnly=${!showInactive}`
      
      // Si es profesor, filtrar por su nivel
      if (!isAdmin && currentUser?.levelId) {
        url += `&levelId=${currentUser.levelId}`
      } else if (selectedLevel) {
        url += `&levelId=${selectedLevel}`
      }
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.tasks) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
    setLoading(false)
  }

  const openCreateModal = () => {
    setEditingTask(null)
    setFormData({
      levelId: selectedLevel || '',
      title: '',
      description: '',
      type: 'concept',
      category: 'robotica',
      difficulty: 'basico',
      points: 10,
      dueDate: '',
      questions: [{ text: '', type: 'text', options: [] }],
      attachmentUrl: '',
      attachmentType: 'none'
    })
    setShowModal(true)
  }

  // Convertir preguntas antiguas (string[]) a nuevo formato
  const parseQuestions = (questions: string[]): Question[] => {
    if (!questions || questions.length === 0) {
      return [{ text: '', type: 'text', options: [] }]
    }
    return questions.map(q => {
      // Intentar parsear si es JSON
      if (typeof q === 'string' && q.startsWith('{')) {
        try {
          return JSON.parse(q)
        } catch {
          return { text: q, type: 'text', options: [] }
        }
      }
      return { text: q, type: 'text', options: [] }
    })
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormData({
      levelId: task.levelId,
      title: task.title,
      description: task.description,
      type: task.type,
      category: task.category,
      difficulty: task.difficulty,
      points: task.points,
      dueDate: task.dueDate || '',
      questions: parseQuestions(task.questions),
      attachmentUrl: (task as any).attachmentUrl || '',
      attachmentType: (task as any).attachmentType || 'none'
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.levelId || !formData.title) {
      alert('Nivel y título son requeridos')
      return
    }

    setSaving(true)
    try {
      // Convertir preguntas a formato string para guardar
      const questionsToSave = formData.questions
        .filter(q => q.text.trim())
        .map(q => JSON.stringify(q))
      
      const payload = {
        ...formData,
        questions: questionsToSave,
        ...(editingTask ? { taskId: editingTask.id } : {})
      }

      const res = await fetch('/api/tasks', {
        method: editingTask ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        loadTasks()
        setShowModal(false)
      } else {
        alert('Error al guardar')
      }
    } catch (error) {
      alert('Error de conexión')
    }
    setSaving(false)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    
    try {
      await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      })
      loadTasks()
    } catch (error) {
      alert('Error al eliminar')
    }
  }

  const handleToggleActive = async (task: Task) => {
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, isActive: !task.isActive })
      })
      loadTasks()
    } catch (error) {
      alert('Error al actualizar')
    }
  }

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', type: 'text' as Question['type'], options: [] }]
    }))
  }

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }))
  }

  const addOption = (questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...(q.options || []), ''] }
          : q
      )
    }))
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options?.map((o, oi) => oi === optionIndex ? value : o) || [] }
          : q
      )
    }))
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options?.filter((_, oi) => oi !== optionIndex) || [] }
          : q
      )
    }))
  }

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category)
    if (!cat) return <BookOpen className="w-5 h-5" />
    const Icon = cat.icon
    return <Icon className={`w-5 h-5 ${cat.color}`} />
  }

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group tasks by level
  const tasksByLevel = filteredTasks.reduce((acc, task) => {
    const level = task.levelId || 'sin-nivel'
    if (!acc[level]) acc[level] = []
    acc[level].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-gray-400 hover:text-neon-cyan text-sm flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Volver al panel
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-yellow-400" />
              Gestión de Tareas
            </h1>
            <p className="text-gray-400 mt-1">Crea y administra tareas para cada nivel educativo</p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="bg-neon-green hover:bg-neon-green/80 text-dark-900 font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarea
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            
            {/* Solo admin puede cambiar nivel, profesores ven solo su nivel */}
            {isAdmin ? (
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                <option value="">Todos los niveles</option>
                {EDUCATION_LEVELS.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white">
                {EDUCATION_LEVELS.find(l => l.id === currentUser?.levelId)?.name || 'Mi nivel'}
              </div>
            )}

            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 rounded bg-dark-700 border-dark-600"
              />
              Mostrar inactivas
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Tareas</p>
            <p className="text-2xl font-bold text-white">{tasks.length}</p>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Activas</p>
            <p className="text-2xl font-bold text-neon-green">{tasks.filter(t => t.isActive).length}</p>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Niveles con tareas</p>
            <p className="text-2xl font-bold text-neon-cyan">{Object.keys(tasksByLevel).length}</p>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Puntos</p>
            <p className="text-2xl font-bold text-yellow-400">{tasks.reduce((sum, t) => sum + t.points, 0)}</p>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay tareas</p>
            <p className="text-gray-500 mt-1">Crea tu primera tarea para comenzar</p>
            <button
              onClick={openCreateModal}
              className="mt-4 bg-neon-cyan text-dark-900 px-6 py-2 rounded-lg font-medium"
            >
              Crear Tarea
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByLevel).map(([levelId, levelTasks]) => {
              const level = EDUCATION_LEVELS.find(l => l.id === levelId)
              return (
                <div key={levelId} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                  <div className="bg-dark-700 px-4 py-3 border-b border-dark-600 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{level?.icon || '📚'}</span>
                      <div>
                        <h3 className="font-medium text-white">{level?.name || levelId}</h3>
                        <p className="text-xs text-gray-500">{levelTasks.length} tareas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-dark-600">
                    {levelTasks.map(task => (
                      <div key={task.id} className={`p-4 ${!task.isActive ? 'opacity-50' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                            {getCategoryIcon(task.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-medium text-white">{task.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                DIFFICULTIES.find(d => d.id === task.difficulty)?.color || ''
                              }`}>
                                {task.difficulty}
                              </span>
                              <span className="px-2 py-0.5 bg-dark-600 text-gray-400 rounded-full text-xs">
                                {task.type}
                              </span>
                              {!task.isActive && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                                  Inactiva
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" /> {task.points} pts
                              </span>
                              <span>{task.questions.length} preguntas</span>
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(task)}
                              className={`p-2 rounded-lg transition-colors ${
                                task.isActive 
                                  ? 'text-green-400 hover:bg-green-500/20' 
                                  : 'text-gray-500 hover:bg-dark-600'
                              }`}
                              title={task.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {task.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-2 text-neon-cyan hover:bg-neon-cyan/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-xl font-bold text-white">
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Level & Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nivel *</label>
                  <select
                    value={formData.levelId}
                    onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  >
                    <option value="">Seleccionar nivel...</option>
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la tarea"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la tarea..."
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white resize-none"
                />
              </div>

              {/* Type, Category, Difficulty */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Task['type'] }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  >
                    {TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Task['difficulty'] }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  >
                    {DIFFICULTIES.map(diff => (
                      <option key={diff.id} value={diff.id}>{diff.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Points & Due Date */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Puntos</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Fecha límite de entrega</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Attachment / Document */}
              <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                <label className="block text-sm text-gray-400 mb-2">📎 Material de Apoyo (opcional)</label>
                <div className="grid md:grid-cols-2 gap-3">
                  <select
                    value={formData.attachmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, attachmentType: e.target.value as any }))}
                    className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  >
                    <option value="none">Sin adjunto</option>
                    <option value="drive">Google Drive</option>
                    <option value="link">Enlace externo</option>
                    <option value="pdf">PDF / Documento</option>
                  </select>
                  {formData.attachmentType !== 'none' && (
                    <input
                      type="url"
                      value={formData.attachmentUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, attachmentUrl: e.target.value }))}
                      placeholder={
                        formData.attachmentType === 'drive' 
                          ? 'https://drive.google.com/...' 
                          : formData.attachmentType === 'pdf'
                          ? 'URL del PDF o documento'
                          : 'https://...'
                      }
                      className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Puedes adjuntar un enlace a Google Drive, un PDF o cualquier recurso externo para los estudiantes.
                </p>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-400">Preguntas / Actividades</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-neon-cyan text-sm hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Agregar pregunta
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-gray-500 text-sm mt-2 font-bold">{index + 1}.</span>
                        <div className="flex-1 space-y-2">
                          {/* Tipo de pregunta */}
                          <div className="flex gap-2 flex-wrap">
                            {QUESTION_TYPES.map(qt => {
                              const Icon = qt.icon
                              return (
                                <button
                                  key={qt.id}
                                  type="button"
                                  onClick={() => updateQuestion(index, 'type', qt.id)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                    question.type === qt.id 
                                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' 
                                      : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
                                  }`}
                                  title={qt.desc}
                                >
                                  <Icon className="w-3 h-3" />
                                  {qt.name}
                                </button>
                              )
                            })}
                          </div>
                          
                          {/* Texto de la pregunta */}
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                            placeholder={
                              question.type === 'drawing' ? 'Ej: Dibuja el circuito del LED...' :
                              question.type === 'upload' ? 'Ej: Sube tu código o documento...' :
                              question.type === 'image' ? 'Ej: Toma una foto de tu proyecto...' :
                              question.type === 'multiple' ? 'Escribe la pregunta de opción múltiple...' :
                              'Escribe la pregunta...'
                            }
                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                          />
                          
                          {/* Opciones para opción múltiple */}
                          {question.type === 'multiple' && (
                            <div className="pl-4 space-y-2">
                              <p className="text-xs text-gray-500">Opciones de respuesta:</p>
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex gap-2 items-center">
                                  <span className="text-gray-500 text-xs">{String.fromCharCode(65 + optIndex)}.</span>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                    placeholder={`Opción ${String.fromCharCode(65 + optIndex)}`}
                                    className="flex-1 px-2 py-1 bg-dark-600 border border-dark-500 rounded text-white text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOption(index, optIndex)}
                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(index)}
                                className="text-xs text-neon-cyan hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Agregar opción
                              </button>
                            </div>
                          )}
                          
                          {/* Indicador de tipo */}
                          <p className="text-xs text-gray-500">
                            {question.type === 'text' && '📝 El estudiante escribirá su respuesta'}
                            {question.type === 'multiple' && '☑️ El estudiante seleccionará una opción'}
                            {question.type === 'drawing' && '🎨 El estudiante dibujará su respuesta'}
                            {question.type === 'upload' && '📎 El estudiante subirá un archivo'}
                            {question.type === 'image' && '📷 El estudiante tomará o subirá una foto'}
                          </p>
                        </div>
                        
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/80 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
