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
  { id: 'robotica', name: 'Robótica', icon: Bot, color: 'text-chaski-primary' },
  { id: 'electronica', name: 'Electrónica', icon: CircuitBoard, color: 'text-amber-500' },
  { id: 'programacion', name: 'Programación', icon: Code, color: 'text-hack-green' },
  { id: 'ia', name: 'Inteligencia Artificial', icon: Lightbulb, color: 'text-purple-500' },
  { id: 'general', name: 'General', icon: BookOpen, color: 'text-slate-600' },
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
  { id: 'basico', name: 'Básico', color: 'bg-green-500/10 text-green-600' },
  { id: 'intermedio', name: 'Intermedio', color: 'bg-amber-500/10 text-amber-600' },
  { id: 'avanzado', name: 'Avanzado', color: 'bg-red-500/10 text-red-600' },
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
    <div className="min-h-screen bg-white p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-slate-600 hover:text-chaski-primary text-sm flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Volver al panel
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-chaski-gold" />
              Gestión de Tareas
            </h1>
            <p className="text-slate-600 mt-1">Crea y administra tareas para cada nivel educativo</p>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-chaski-primary hover:bg-chaski-primary/90 active:scale-[0.98] text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarea
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Selector de nivel basado en permisos */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
            >
              {isAdmin && <option value="">Todos los niveles</option>}
              {allowedLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-50 border-slate-200 text-chaski-primary focus:ring-chaski-primary/10"
              />
              Mostrar inactivas
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0s' }}>
            <p className="text-slate-600 text-sm">Total Tareas</p>
            <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <p className="text-slate-600 text-sm">Activas</p>
            <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.isActive).length}</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-slate-600 text-sm">Niveles con tareas</p>
            <p className="text-2xl font-bold text-chaski-primary">{Object.keys(tasksByLevel).length}</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <p className="text-slate-600 text-sm">Total Puntos</p>
            <p className="text-2xl font-bold text-chaski-gold">{tasks.reduce((sum, t) => sum + t.points, 0)}</p>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No hay tareas</p>
            <p className="text-slate-500 mt-1">Crea tu primera tarea para comenzar</p>
            <button
              onClick={openCreateModal}
              className="mt-4 bg-chaski-primary hover:bg-chaski-primary/90 active:scale-[0.98] text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Crear Tarea
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByLevel).map(([levelId, levelTasks], groupIndex) => {
              const level = (dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS).find(l => l.id === levelId)
              return (
                <div key={levelId} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: `${groupIndex * 0.05}s` }}>
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{level?.icon || '📚'}</span>
                      <div>
                        <h3 className="font-medium text-slate-900">{level?.name || levelId}</h3>
                        <p className="text-xs text-slate-500">{levelTasks.length} tareas</p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {levelTasks.map(task => (
                      <div key={task.id} className={`p-4 hover:bg-slate-50 transition-colors ${!task.isActive ? 'opacity-50' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            {getCategoryIcon(task.category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-medium text-slate-900">{task.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                DIFFICULTIES.find(d => d.id === task.difficulty)?.color || ''
                              }`}>
                                {task.difficulty}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                                {task.type}
                              </span>
                              {!task.isActive && (
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-600 rounded-full text-xs">
                                  Inactiva
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
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
                                  ? 'text-green-600 hover:bg-green-500/10'
                                  : 'text-slate-500 hover:bg-slate-200'
                              }`}
                              title={task.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {task.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-2 text-chaski-primary hover:bg-chaski-primary/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl max-w-2xl w-full my-8 animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Level & Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Nivel *</label>
                  <select
                    value={formData.levelId}
                    onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                  >
                    <option value="">Seleccionar nivel...</option>
                    {allowedLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la tarea"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la tarea..."
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                />
              </div>

              {/* Type, Category, Difficulty */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Task['type'] }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                  >
                    {TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Task['difficulty'] }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
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
                  <label className="block text-sm text-slate-600 mb-1">Puntos</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Fecha límite de entrega</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Attachment / Document */}
              <div className="p-4 bg-gradient-to-r from-chaski-primary/5 to-chaski-gold/5 rounded-xl border border-chaski-primary/20">
                <label className="block text-sm text-slate-900 font-medium mb-3">📎 Material de Apoyo (opcional)</label>

                {/* Botones de selección de tipo */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachmentType: 'none', attachmentUrl: '', attachmentData: '', attachmentName: '' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                      formData.attachmentType === 'none'
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sin adjunto
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachmentType: 'drive', attachmentData: '', attachmentName: '' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-2 ${
                      formData.attachmentType === 'drive'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                      formData.attachmentType === 'upload'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Archivo pequeño (&lt;100KB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachmentType: 'link', attachmentData: '', attachmentName: '' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                      formData.attachmentType === 'link'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Otro enlace
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.attachmentType === 'upload' && (
                    <div className="col-span-2">
                      <div
                        className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-chaski-primary/50 transition-colors cursor-pointer"
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
                          <div className="text-green-600">
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">{(formData as any).attachmentName}</p>
                            <p className="text-xs text-slate-600 mt-1">Clic para cambiar</p>
                          </div>
                        ) : (
                          <div className="text-slate-600">
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">Arrastra un archivo aquí o haz clic para seleccionar</p>
                            <p className="text-xs mt-1">PDF, Word, imagen, etc. <span className="text-chaski-gold">(máx. 100KB)</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {formData.attachmentType === 'drive' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700 mb-3 font-medium">📋 Pasos para compartir desde Google Drive:</p>
                      <ol className="text-xs text-blue-600 space-y-1 mb-4 list-decimal list-inside">
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
                        className="w-full px-4 py-3 bg-white border border-blue-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                      />
                      {formData.attachmentUrl && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">✓ Enlace guardado correctamente</p>
                      )}
                    </div>
                  )}
                  {formData.attachmentType === 'link' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-700 mb-3">🔗 Pega cualquier enlace externo:</p>
                      <input
                        type="url"
                        value={formData.attachmentUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, attachmentUrl: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10 transition-all"
                      />
                      {formData.attachmentUrl && (
                        <p className="text-xs text-green-600 mt-2">✓ Enlace guardado</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-slate-600">Preguntas / Actividades</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-chaski-primary text-sm hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Agregar pregunta
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-slate-500 text-sm mt-2 font-bold">{index + 1}.</span>
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
                                      ? 'bg-chaski-primary/10 text-chaski-primary border border-chaski-primary/50'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                          />

                          {/* Opciones para opción múltiple */}
                          {question.type === 'multiple' && (
                            <div className="pl-4 space-y-2">
                              <p className="text-xs text-slate-500">Opciones de respuesta:</p>
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex gap-2 items-center">
                                  <span className="text-slate-500 text-xs">{String.fromCharCode(65 + optIndex)}.</span>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                    placeholder={`Opción ${String.fromCharCode(65 + optIndex)}`}
                                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 text-sm focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOption(index, optIndex)}
                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(index)}
                                className="text-xs text-chaski-primary hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Agregar opción
                              </button>
                            </div>
                          )}

                          {/* Indicador de tipo */}
                          <p className="text-xs text-slate-500">
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
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
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

            <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-chaski-primary hover:bg-chaski-primary/90 active:scale-[0.98] text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 transition-all"
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
        <Loader2 className="w-8 h-8 text-chaski-primary animate-spin" />
      </div>
    }>
      <AdminTareasContent />
    </Suspense>
  )
}
