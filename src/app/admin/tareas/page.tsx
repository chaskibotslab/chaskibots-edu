'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useDynamicLevels } from '@/hooks/useDynamicLevels'
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
  { id: 'robotica', name: 'Robótica', icon: Bot, color: 'text-brand-purple' },
  { id: 'electronica', name: 'Electrónica', icon: CircuitBoard, color: 'text-yellow-400' },
  { id: 'programacion', name: 'Programación', icon: Code, color: 'text-neon-green' },
  { id: 'ia', name: 'Inteligencia Artificial', icon: Lightbulb, color: 'text-neon-pink' },
  { id: 'general', name: 'General', icon: BookOpen, color: 'text-gray-600' },
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

interface TeacherCourseAssignment {
  courseId: string
  levelId: string
  courseName: string
}

function AdminTareasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlLevelId = searchParams.get('levelId') || ''
  const { user, isAdmin, isTeacher } = useAuth()
  const { levels: dynamicLevels, loading: levelsLoading } = useDynamicLevels()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(urlLevelId)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourseAssignment[]>([])
  
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
    attachmentType: 'none' as 'none' | 'drive' | 'link' | 'upload',
    attachmentData: '',
    attachmentName: '',
    attachmentMimeType: ''
  })

  // Sincronizar selectedLevel con urlLevelId cuando cambie
  useEffect(() => {
    if (urlLevelId && urlLevelId !== selectedLevel) {
      setSelectedLevel(urlLevelId)
    }
  }, [urlLevelId])

  // Cargar asignaciones de cursos para profesores
  useEffect(() => {
    async function loadTeacherCourses() {
      if (isTeacher && !isAdmin && (user?.accessCode || user?.name)) {
        try {
          const params = new URLSearchParams()
          if (user.accessCode) params.append('teacherId', user.accessCode)
          if (user.name) params.append('teacherName', user.name)
          console.log('[Tareas] Loading teacher courses for:', params.toString())
          const res = await fetch(`/api/teacher-courses?${params.toString()}`)
          const data = await res.json()
          console.log('[Tareas] Teacher courses loaded:', data.assignments?.length || 0)
          if (data.assignments && data.assignments.length > 0) {
            setTeacherCourses(data.assignments)
            // Solo establecer nivel por defecto si NO viene de la URL y no hay selección
            if (!selectedLevel && !urlLevelId) {
              const firstLevel = data.assignments[0]?.levelId
              if (firstLevel) {
                console.log('[Tareas] Setting default level:', firstLevel)
                setSelectedLevel(firstLevel)
              }
            }
          }
        } catch (error) {
          console.error('Error loading teacher courses:', error)
        }
      }
    }
    loadTeacherCourses()
  }, [isTeacher, isAdmin, user, urlLevelId])

  // Niveles permitidos para el usuario
  const allowedLevels = useMemo(() => {
    const levels = dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS
    if (isAdmin) return levels
    if (isTeacher && teacherCourses.length > 0) {
      const allowedIds = new Set(teacherCourses.map(tc => tc.levelId))
      return levels.filter(l => allowedIds.has(l.id))
    }
    // Fallback: si viene levelId de la URL, mostrar ese nivel
    if (urlLevelId) {
      return levels.filter(l => l.id === urlLevelId)
    }
    // Fallback: usar levelId del usuario
    if (user?.levelId) {
      return levels.filter(l => l.id === user.levelId)
    }
    return []
  }, [isAdmin, isTeacher, teacherCourses, user, urlLevelId, dynamicLevels])

  useEffect(() => {
    if (user !== null) {
      loadTasks()
    }
  }, [selectedLevel, showInactive, user, teacherCourses])

  const loadTasks = async () => {
    setLoading(true)
    try {
      let url = `/api/tasks?activeOnly=${!showInactive}`
      
      // Siempre filtrar por nivel seleccionado si hay uno
      if (selectedLevel) {
        url += `&levelId=${selectedLevel}`
      } else if (!isAdmin && isTeacher && teacherCourses.length > 0) {
        // Profesor sin nivel seleccionado: usar el primer nivel asignado
        url += `&levelId=${teacherCourses[0].levelId}`
      }
      // Admin sin nivel seleccionado: obtiene todas las tareas
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.tasks) {
        // Para profesores, filtrar adicionalmente por niveles permitidos
        if (!isAdmin && isTeacher && teacherCourses.length > 0) {
          const allowedLevelIds = new Set(teacherCourses.map(tc => tc.levelId))
          setTasks(data.tasks.filter((t: Task) => allowedLevelIds.has(t.levelId)))
        } else {
          setTasks(data.tasks)
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
    setLoading(false)
  }

  const openCreateModal = () => {
    setEditingTask(null)
    // Usar el nivel seleccionado, o el de la URL, o el primero permitido
    const defaultLevel = selectedLevel || urlLevelId || (allowedLevels.length > 0 ? allowedLevels[0].id : '')
    setFormData({
      levelId: defaultLevel,
      title: '',
      description: '',
      type: 'concept',
      category: 'robotica',
      difficulty: 'basico',
      points: 10,
      dueDate: '',
      questions: [{ text: '', type: 'text', options: [] }],
      attachmentUrl: '',
      attachmentType: 'none',
      attachmentData: '',
      attachmentName: '',
      attachmentMimeType: ''
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
      attachmentType: (task as any).attachmentType || 'none',
      attachmentData: '',
      attachmentName: '',
      attachmentMimeType: ''
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

  // Filtrar tareas por nivel seleccionado y búsqueda
  const filteredTasks = tasks.filter(task => {
    // Filtro por nivel (si hay nivel seleccionado)
    if (selectedLevel && task.levelId !== selectedLevel) {
      return false
    }
    // Filtro por búsqueda de texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return task.title.toLowerCase().includes(search) ||
             task.description.toLowerCase().includes(search)
    }
    return true
  })

  // Group tasks by level (solo para mostrar agrupado)
  const tasksByLevel = filteredTasks.reduce((acc, task) => {
    const level = task.levelId || 'sin-nivel'
    if (!acc[level]) acc[level] = []
    acc[level].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-gray-600 hover:text-brand-purple text-sm flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Volver al panel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-yellow-400" />
              Gestión de Tareas
            </h1>
            <p className="text-gray-600 mt-1">Crea y administra tareas para cada nivel educativo</p>
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
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
            
            {/* Selector de nivel basado en permisos */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
            >
              {isAdmin && <option value="">Todos los niveles</option>}
              {allowedLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-100 border-gray-200"
              />
              Mostrar inactivas
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-600 text-sm">Total Tareas</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-600 text-sm">Activas</p>
            <p className="text-2xl font-bold text-neon-green">{tasks.filter(t => t.isActive).length}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-600 text-sm">Niveles con tareas</p>
            <p className="text-2xl font-bold text-brand-purple">{Object.keys(tasksByLevel).length}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-600 text-sm">Total Puntos</p>
            <p className="text-2xl font-bold text-yellow-400">{tasks.reduce((sum, t) => sum + t.points, 0)}</p>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay tareas</p>
            <p className="text-gray-500 mt-1">Crea tu primera tarea para comenzar</p>
            <button
              onClick={openCreateModal}
              className="mt-4 bg-brand-purple text-dark-900 px-6 py-2 rounded-lg font-medium"
            >
              Crear Tarea
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByLevel).map(([levelId, levelTasks]) => {
              const level = (dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS).find(l => l.id === levelId)
              return (
                <div key={levelId} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{level?.icon || '📚'}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{level?.name || levelId}</h3>
                        <p className="text-xs text-gray-500">{levelTasks.length} tareas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-dark-600">
                    {levelTasks.map(task => (
                      <div key={task.id} className={`p-4 ${!task.isActive ? 'opacity-50' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            {getCategoryIcon(task.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                DIFFICULTIES.find(d => d.id === task.difficulty)?.color || ''
                              }`}>
                                {task.difficulty}
                              </span>
                              <span className="px-2 py-0.5 bg-dark-600 text-gray-600 rounded-full text-xs">
                                {task.type}
                              </span>
                              {!task.isActive && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                                  Inactiva
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
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
                                  : 'text-gray-500 hover:bg-gray-200'
                              }`}
                              title={task.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {task.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-2 text-brand-purple hover:bg-brand-purple/20 rounded-lg transition-colors"
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
          <div className="bg-gray-50 border border-gray-200 rounded-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Level & Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nivel *</label>
                  <select
                    value={formData.levelId}
                    onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                  >
                    <option value="">Seleccionar nivel...</option>
                    {allowedLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la tarea"
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la tarea..."
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 resize-none"
                />
              </div>

              {/* Type, Category, Difficulty */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Task['type'] }))}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                  >
                    {TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Task['difficulty'] }))}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
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
                  <label className="block text-sm text-gray-600 mb-1">Puntos</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Fecha límite de entrega</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              {/* Attachment / Document */}
              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30">
                <label className="block text-sm text-gray-900 font-medium mb-3">📎 Material de Apoyo (opcional)</label>
                
                {/* Botones de selección de tipo */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachmentType: 'none', attachmentUrl: '', attachmentData: '', attachmentName: '' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.attachmentType === 'none' 
                        ? 'bg-gray-600 text-gray-900' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Sin adjunto
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachmentType: 'drive', attachmentData: '', attachmentName: '' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      formData.attachmentType === 'drive' 
                        ? 'bg-blue-600 text-gray-900' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Google Drive (Recomendado)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachmentType: 'upload', attachmentUrl: '' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.attachmentType === 'upload' 
                        ? 'bg-green-600 text-gray-900' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Archivo pequeño (&lt;100KB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachmentType: 'link', attachmentData: '', attachmentName: '' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.attachmentType === 'link' 
                        ? 'bg-purple-600 text-gray-900' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Otro enlace
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.attachmentType === 'upload' && (
                    <div className="col-span-2">
                      <div 
                        className="border-2 border-dashed border-dark-500 rounded-lg p-4 text-center hover:border-brand-purple/50 transition-colors cursor-pointer"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            // Validar tamaño máximo: 100KB (límite de Airtable)
                            if (file.size > 100 * 1024) {
                              alert('⚠️ El archivo es muy grande. Máximo permitido: 100KB.\n\nPara archivos más grandes:\n1. Sube el archivo a Google Drive manualmente\n2. Selecciona "Enlace de Google Drive"\n3. Pega el enlace compartido');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              const base64 = reader.result as string;
                              setFormData(prev => ({ 
                                ...prev, 
                                attachmentData: base64,
                                attachmentName: file.name,
                                attachmentType: 'upload',
                                attachmentMimeType: file.type || 'application/octet-stream'
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              // Validar tamaño máximo: 100KB (límite de Airtable)
                              if (file.size > 100 * 1024) {
                                alert('⚠️ El archivo es muy grande. Máximo permitido: 100KB.\n\nPara archivos más grandes:\n1. Sube el archivo a Google Drive manualmente\n2. Selecciona "Enlace de Google Drive"\n3. Pega el enlace compartido');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                const base64 = reader.result as string;
                                setFormData(prev => ({ 
                                  ...prev, 
                                  attachmentData: base64,
                                  attachmentName: file.name,
                                  attachmentType: 'upload',
                                  attachmentMimeType: file.type || 'application/octet-stream'
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        {(formData as any).attachmentName ? (
                          <div className="text-neon-green">
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">{(formData as any).attachmentName}</p>
                            <p className="text-xs text-gray-600 mt-1">Clic para cambiar</p>
                          </div>
                        ) : (
                          <div className="text-gray-600">
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">Arrastra un archivo aquí o haz clic para seleccionar</p>
                            <p className="text-xs mt-1">PDF, Word, imagen, etc. <span className="text-yellow-400">(máx. 100KB)</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {formData.attachmentType === 'drive' && (
                    <div className="bg-blue-900/30 border border-blue-500/40 rounded-lg p-4">
                      <p className="text-sm text-blue-200 mb-3 font-medium">📋 Pasos para compartir desde Google Drive:</p>
                      <ol className="text-xs text-blue-300 space-y-1 mb-4 list-decimal list-inside">
                        <li>Sube tu archivo a Google Drive</li>
                        <li>Clic derecho → <strong>Compartir</strong></li>
                        <li>Cambia a <strong>"Cualquier persona con el enlace"</strong></li>
                        <li>Copia el enlace y pégalo aquí abajo</li>
                      </ol>
                      <input
                        type="url"
                        value={formData.attachmentUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, attachmentUrl: e.target.value }))}
                        placeholder="Pega aquí el enlace de Google Drive..."
                        className="w-full px-4 py-3 bg-gray-100 border border-blue-500/50 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:outline-none"
                      />
                      {formData.attachmentUrl && (
                        <p className="text-xs text-neon-green mt-2 flex items-center gap-1">✓ Enlace guardado correctamente</p>
                      )}
                    </div>
                  )}
                  {formData.attachmentType === 'link' && (
                    <div className="bg-purple-900/30 border border-purple-500/40 rounded-lg p-4">
                      <p className="text-sm text-purple-200 mb-3">🔗 Pega cualquier enlace externo:</p>
                      <input
                        type="url"
                        value={formData.attachmentUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, attachmentUrl: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-gray-100 border border-purple-500/50 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-400 focus:outline-none"
                      />
                      {formData.attachmentUrl && (
                        <p className="text-xs text-neon-green mt-2">✓ Enlace guardado</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-600">Preguntas / Actividades</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-brand-purple text-sm hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Agregar pregunta
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-100/50 rounded-lg border border-gray-200">
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
                                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/50' 
                                      : 'bg-dark-600 text-gray-600 hover:bg-dark-500'
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
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 text-sm"
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
                                    className="flex-1 px-2 py-1 bg-dark-600 border border-dark-500 rounded text-gray-900 text-sm"
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
                                className="text-xs text-brand-purple hover:underline flex items-center gap-1"
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

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-300 rounded-lg hover:bg-gray-200"
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

// Wrapper con Suspense para useSearchParams
export default function AdminTareasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    }>
      <AdminTareasContent />
    </Suspense>
  )
}
