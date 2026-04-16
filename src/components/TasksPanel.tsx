'use client'

import { useState, useEffect } from 'react'
import { 
  Send, CheckCircle, Clock, FileText, Code, Cpu, Zap, 
  BookOpen, Loader2, ChevronDown, ChevronUp, Award,
  Lightbulb, Wrench, CircuitBoard, Bot, Calendar, AlertCircle,
  Pencil, Upload, Image, Star, ClipboardList, Download
} from 'lucide-react'
import dynamic from 'next/dynamic'
import DrawingCanvas from './DrawingCanvas'
import FileUpload from './FileUpload'
import MisCalificaciones from './MisCalificaciones'

const BlocklyEditor = dynamic(() => import('./BlocklyEditor'), { ssr: false })

interface Task {
  id: string
  levelId: string
  title: string
  description: string
  type: 'concept' | 'code' | 'project' | 'quiz'
  category: 'robotica' | 'electronica' | 'programacion' | 'ia' | 'general'
  difficulty: 'basico' | 'intermedio' | 'avanzado'
  questions?: TaskQuestion[]
  dueDate?: string
  points: number
  allowDrawing?: boolean
  allowFiles?: boolean
  attachmentUrl?: string
  attachmentType?: 'none' | 'drive' | 'link' | 'pdf'
}

interface TaskQuestion {
  id: string
  question: string
  type: 'text' | 'multiple' | 'code' | 'drawing' | 'upload' | 'image' | 'blocks'
  options?: string[]
  correctAnswer?: string
}

interface UploadedFile {
  name: string
  type: string
  size: number
  url: string
  base64?: string
}

interface TaskSubmission {
  taskId: string
  answers: Record<string, string>
  code?: string
}

interface APITask {
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

// Tareas de fallback si no hay conexión a Airtable
const FALLBACK_TASKS: Record<string, Task[]> = {
  'inicial-1': [
    {
      id: 'task-ini1-1',
      levelId: 'inicial-1',
      title: '¿Qué es un Robot?',
      description: 'Aprende los conceptos básicos de robótica',
      type: 'concept',
      category: 'robotica',
      difficulty: 'basico',
      points: 10,
      questions: [
        { id: 'q1', question: '¿Qué es un robot?', type: 'text' },
        { id: 'q2', question: 'Dibuja un robot y describe sus partes', type: 'text' },
      ]
    },
    {
      id: 'task-ini1-2',
      levelId: 'inicial-1',
      title: 'Materiales Electrónicos Básicos',
      description: 'Conoce los componentes que usaremos',
      type: 'concept',
      category: 'electronica',
      difficulty: 'basico',
      points: 10,
      questions: [
        { id: 'q1', question: '¿Para qué sirve un LED?', type: 'text' },
        { id: 'q2', question: '¿Qué colores de LED conoces?', type: 'text' },
      ]
    },
  ],
  'inicial-2': [
    {
      id: 'task-ini2-1',
      levelId: 'inicial-2',
      title: 'Partes de un Robot',
      description: 'Identifica las partes principales de un robot',
      type: 'concept',
      category: 'robotica',
      difficulty: 'basico',
      points: 15,
      questions: [
        { id: 'q1', question: '¿Cuáles son las 3 partes principales de un robot?', type: 'text' },
        { id: 'q2', question: '¿Qué hace el "cerebro" del robot?', type: 'text' },
        { id: 'q3', question: '¿Qué son los sensores?', type: 'text' },
      ]
    },
    {
      id: 'task-ini2-2',
      levelId: 'inicial-2',
      title: 'Circuito Simple con LED',
      description: 'Aprende cómo funciona un circuito básico',
      type: 'concept',
      category: 'electronica',
      difficulty: 'basico',
      points: 15,
      questions: [
        { id: 'q1', question: '¿Qué necesitas para encender un LED?', type: 'text' },
        { id: 'q2', question: '¿Por qué usamos una resistencia?', type: 'text' },
      ]
    },
  ],
  'primero-egb': [
    {
      id: 'task-1egb-1',
      levelId: 'primero-egb',
      title: 'Introducción a la Electrónica',
      description: 'Conceptos básicos de electricidad y componentes',
      type: 'concept',
      category: 'electronica',
      difficulty: 'basico',
      points: 20,
      questions: [
        { id: 'q1', question: '¿Qué es la electricidad?', type: 'text' },
        { id: 'q2', question: 'Nombra 3 componentes electrónicos', type: 'text' },
        { id: 'q3', question: '¿Qué es un circuito cerrado?', type: 'text' },
      ]
    },
  ],
  'segundo-egb': [
    {
      id: 'task-2egb-1',
      levelId: 'segundo-egb',
      title: 'Sensores y Actuadores',
      description: 'Aprende la diferencia entre sensores y actuadores',
      type: 'concept',
      category: 'robotica',
      difficulty: 'basico',
      points: 20,
      questions: [
        { id: 'q1', question: '¿Qué es un sensor? Da un ejemplo', type: 'text' },
        { id: 'q2', question: '¿Qué es un actuador? Da un ejemplo', type: 'text' },
        { id: 'q3', question: '¿Cómo trabajan juntos sensores y actuadores?', type: 'text' },
      ]
    },
  ],
  'tercero-egb': [
    {
      id: 'task-3egb-1',
      levelId: 'tercero-egb',
      title: 'Programación con Bloques',
      description: 'Conceptos de programación visual',
      type: 'concept',
      category: 'programacion',
      difficulty: 'basico',
      points: 25,
      questions: [
        { id: 'q1', question: '¿Qué es un algoritmo?', type: 'text' },
        { id: 'q2', question: '¿Qué es un bucle o loop?', type: 'text' },
        { id: 'q3', question: 'Explica qué es una condición IF', type: 'text' },
      ]
    },
  ],
}

// Generar tareas genéricas para niveles sin tareas específicas
const getDefaultTasks = (levelId: string): Task[] => {
  const levelNumber = levelId.match(/\d+/)?.[0] || '1'
  const isAdvanced = levelId.includes('bach') || parseInt(levelNumber) > 7
  
  return [
    {
      id: `task-${levelId}-default-1`,
      levelId,
      title: isAdvanced ? 'Proyecto de Robótica' : 'Conceptos de Robótica',
      description: isAdvanced ? 'Diseña y documenta un proyecto' : 'Responde sobre lo aprendido',
      type: isAdvanced ? 'project' : 'concept',
      category: 'robotica',
      difficulty: isAdvanced ? 'avanzado' : 'intermedio',
      points: isAdvanced ? 50 : 25,
      questions: [
        { id: 'q1', question: '¿Qué aprendiste en la última clase?', type: 'text' },
        { id: 'q2', question: 'Describe el proyecto o actividad que realizaste', type: 'text' },
        { id: 'q3', question: '¿Qué dificultades encontraste y cómo las resolviste?', type: 'text' },
      ]
    },
    {
      id: `task-${levelId}-default-2`,
      levelId,
      title: isAdvanced ? 'Código Python' : 'Componentes Electrónicos',
      description: isAdvanced ? 'Envía tu código para revisión' : 'Identifica componentes',
      type: isAdvanced ? 'code' : 'concept',
      category: isAdvanced ? 'programacion' : 'electronica',
      difficulty: isAdvanced ? 'avanzado' : 'intermedio',
      points: isAdvanced ? 40 : 20,
      questions: isAdvanced ? [
        { id: 'q1', question: 'Escribe tu código Python aquí:', type: 'code' },
        { id: 'q2', question: 'Explica qué hace tu código', type: 'text' },
      ] : [
        { id: 'q1', question: 'Nombra los componentes que usaste hoy', type: 'text' },
        { id: 'q2', question: '¿Para qué sirve cada uno?', type: 'text' },
      ]
    },
  ]
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'robotica': return <Bot className="w-5 h-5" />
    case 'electronica': return <CircuitBoard className="w-5 h-5" />
    case 'programacion': return <Code className="w-5 h-5" />
    case 'ia': return <Lightbulb className="w-5 h-5" />
    default: return <BookOpen className="w-5 h-5" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'robotica': return 'text-brand-purple bg-brand-purple/20'
    case 'electronica': return 'text-yellow-400 bg-yellow-500/20'
    case 'programacion': return 'text-neon-green bg-neon-green/20'
    case 'ia': return 'text-neon-pink bg-neon-pink/20'
    default: return 'text-gray-600 bg-gray-500/20'
  }
}

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'basico': return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Básico</span>
    case 'intermedio': return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Intermedio</span>
    case 'avanzado': return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Avanzado</span>
    default: return null
  }
}

interface TasksPanelProps {
  levelId: string
  studentName?: string
  studentEmail?: string
}

export default function TasksPanel({ levelId, studentName = '', studentEmail = '' }: TasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({})
  const [drawings, setDrawings] = useState<Record<string, string>>({}) // taskId -> base64 image
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({}) // taskId -> files
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<string[]>([])
  const [submittedTaskIds, setSubmittedTaskIds] = useState<Set<string>>(new Set()) // IDs de tareas ya enviadas desde API
  const [activeTab, setActiveTab] = useState<'tareas' | 'calificaciones'>('tareas')

  const [loading, setLoading] = useState(true)

  // Cargar entregas previas del estudiante para saber qué tareas ya envió
  useEffect(() => {
    async function loadMySubmissions() {
      if (!studentName || !studentName.trim()) return
      try {
        const res = await fetch(`/api/submissions?levelId=${levelId}`)
        const data = await res.json()
        if (data.submissions) {
          const mySubmissions = data.submissions.filter(
            (s: any) => s.studentName.toLowerCase() === studentName.toLowerCase()
          )
          // Guardar los lessonId (que es el task.id) de las tareas ya enviadas
          const taskIds = new Set(mySubmissions.map((s: any) => s.lessonId))
          setSubmittedTaskIds(taskIds as Set<string>)
        }
      } catch (error) {
        console.error('Error loading submissions:', error)
      }
    }
    loadMySubmissions()
  }, [studentName, levelId])

  useEffect(() => {
    // Cargar tareas desde Airtable
    async function loadTasks() {
      setLoading(true)
      try {
        const res = await fetch(`/api/tasks?levelId=${levelId}`)
        const data = await res.json()
        if (data.tasks && data.tasks.length > 0) {
          // Convertir APITask a Task con questions como objetos
          const convertedTasks: Task[] = data.tasks.map((t: APITask) => {
            // Parsear preguntas - pueden ser JSON o texto plano
            const parsedQuestions = t.questions.map((q, idx) => {
              // Intentar parsear como JSON (nuevo formato)
              if (q.startsWith('{')) {
                try {
                  const parsed = JSON.parse(q)
                  return {
                    id: `q${idx + 1}`,
                    question: parsed.text || parsed.question || q,
                    type: parsed.type || 'text',
                    options: parsed.options || []
                  }
                } catch {
                  // Si falla el parse, usar como texto plano
                }
              }
              // Formato antiguo: texto plano
              return {
                id: `q${idx + 1}`,
                question: q,
                type: t.type === 'code' ? 'code' : 'text' as const
              }
            })
            
            return {
              ...t,
              questions: parsedQuestions
            }
          })
          setTasks(convertedTasks)
        } else {
          // Fallback a tareas locales
          const levelTasks = FALLBACK_TASKS[levelId] || getDefaultTasks(levelId)
          setTasks(levelTasks)
        }
      } catch (error) {
        console.log('Using fallback tasks')
        const levelTasks = FALLBACK_TASKS[levelId] || getDefaultTasks(levelId)
        setTasks(levelTasks)
      }
      setLoading(false)
    }
    loadTasks()
  }, [levelId])

  const handleAnswerChange = (taskId: string, questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [questionId]: value
      }
    }))
  }

  const handleDrawingSave = (taskId: string, imageData: string) => {
    setDrawings(prev => ({ ...prev, [taskId]: imageData }))
  }

  const handleFilesUpload = (taskId: string, files: UploadedFile[]) => {
    setUploadedFiles(prev => ({ ...prev, [taskId]: files }))
  }

  // Función para subir archivo a Google Drive
  const uploadFileToGoogleDrive = async (file: UploadedFile): Promise<{ name: string, url: string } | null> => {
    try {
      // Convertir base64 a Blob
      const base64Data = file.base64?.split(',')[1] || ''
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: file.type })
      
      // Crear FormData
      const formData = new FormData()
      formData.append('file', blob, file.name)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (res.ok) {
        const data = await res.json()
        return { name: file.name, url: data.url || data.thumbnailUrl }
      }
      return null
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error)
      return null
    }
  }

  const handleSubmit = async (task: Task) => {
    if (!studentName || !studentName.trim()) {
      alert('Debes iniciar sesión para enviar tareas')
      return
    }

    const taskAnswers = answers[task.id] || {}
    const taskDrawing = drawings[task.id]
    const taskFiles = uploadedFiles[task.id] || []
    
    // Verificar respuestas de texto
    const textQuestions = task.questions?.filter(q => q.type === 'text' || q.type === 'code') || []
    const unansweredText = textQuestions.filter(q => !taskAnswers[q.id]?.trim())
    
    if (unansweredText.length > 0) {
      alert('Por favor responde todas las preguntas de texto')
      return
    }

    setSubmitting(task.id)

    try {
      // Formatear respuestas para enviar
      const formattedAnswers = task.questions?.map(q => 
        `${q.question}\nRespuesta: ${taskAnswers[q.id] || ''}`
      ).join('\n\n') || ''

      // Subir archivos a Google Drive primero, si falla usar base64
      let processedFiles: { name: string, type: string, url?: string, data?: string }[] = []
      if (taskFiles.length > 0) {
        for (const file of taskFiles) {
          const uploaded = await uploadFileToGoogleDrive(file)
          if (uploaded) {
            processedFiles.push({ name: file.name, type: file.type, url: uploaded.url })
          } else {
            // Si Drive falla, guardar como base64
            processedFiles.push({ name: file.name, type: file.type, data: file.base64 || '' })
          }
        }
      }

      // Agregar info de dibujo y archivos
      let attachmentsInfo = ''
      if (taskDrawing) {
        attachmentsInfo += '\n\n📎 DIBUJO ADJUNTO: [imagen incluida]'
      }
      if (processedFiles.length > 0) {
        attachmentsInfo += `\n\n📎 ARCHIVOS ADJUNTOS (${processedFiles.length}):\n`
        attachmentsInfo += processedFiles.map(f => `- ${f.name}`).join('\n')
      }

      const taskId = `TASK-${Date.now().toString(36).toUpperCase()}`

      // Preparar datos con archivos adjuntos
      const submissionData: any = {
        taskId,
        studentName: studentName,
        studentEmail: studentEmail,
        levelId,
        lessonId: task.id,
        code: formattedAnswers + attachmentsInfo,
        output: `Tarea: ${task.title}\nCategoría: ${task.category}\nPuntos: ${task.points}`
      }

      // Si hay dibujo, agregarlo como campo separado
      if (taskDrawing) {
        submissionData.drawing = taskDrawing
      }

      // Si hay archivos, enviarlos (con URL de Drive o base64)
      if (processedFiles.length > 0) {
        submissionData.files = processedFiles
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      if (res.ok) {
        setSubmitted(prev => [...prev, task.id])
        setExpandedTask(null)
      } else {
        alert('Error al enviar. Inténtalo de nuevo.')
      }
    } catch (error) {
      alert('Error de conexión')
    }

    setSubmitting(null)
  }

  return (
    <div className="space-y-6">
      {/* Header con pestañas */}
      <div className="bg-gradient-to-r from-brand-purple/10 to-neon-green/10 border border-brand-purple/30 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-purple" />
              Tareas y Actividades
            </h3>
            <p className="text-sm text-gray-600">Completa las tareas y envíalas al profesor</p>
          </div>
          {studentName && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Estudiante:</span>
              <span className="text-sm text-gray-900 font-medium">{studentName}</span>
            </div>
          )}
        </div>
        
        {/* Pestañas */}
        <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
          <button
            onClick={() => setActiveTab('tareas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tareas'
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/50'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Tareas Pendientes
          </button>
          <button
            onClick={() => setActiveTab('calificaciones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calificaciones'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent'
            }`}
          >
            <Star className="w-4 h-4" />
            Mis Calificaciones
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'calificaciones' ? (
        <MisCalificaciones studentName={studentName} levelId={levelId} />
      ) : (
      <>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
        </div>
      ) : (
      <div className="space-y-4">
        {tasks.map(task => {
          const isExpired = task.dueDate && new Date(task.dueDate) < new Date()
          const isAlreadySubmitted = submitted.includes(task.id) || submittedTaskIds.has(task.id)
          return (
          <div
            key={task.id}
            className={`bg-gray-50 border rounded-xl overflow-hidden transition-all ${
              isAlreadySubmitted 
                ? 'border-green-500/50' 
                : expandedTask === task.id 
                  ? 'border-brand-purple/50' 
                  : 'border-gray-200 hover:border-dark-500'
            }`}
          >
            {/* Task Header */}
            <button
              onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              className="w-full p-4 flex items-center gap-4 text-left"
              disabled={isAlreadySubmitted}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(task.category)}`}>
                {isAlreadySubmitted ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  getCategoryIcon(task.category)
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  {getDifficultyBadge(task.difficulty)}
                  {isAlreadySubmitted && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Enviado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{task.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="capitalize">{task.category}</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" /> {task.points} pts
                  </span>
                  <span>{task.questions?.length || 0} preguntas</span>
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : 'text-gray-500'}`}>
                      <Calendar className="w-3 h-3" /> 
                      {isExpired ? 'Vencida' : `Entrega: ${task.dueDate}`}
                    </span>
                  )}
                </div>
              </div>

              {!isAlreadySubmitted && (
                expandedTask === task.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )
              )}
            </button>

            {/* Task Content */}
            {expandedTask === task.id && !isAlreadySubmitted && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="pt-4 space-y-4">
                  {/* Archivo adjunto del docente */}
                  {task.attachmentUrl && (
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 rounded-xl">
                      <p className="text-sm text-blue-200 mb-3 flex items-center gap-2 font-medium">
                        <FileText className="w-5 h-5" />
                        📎 Material adjunto del profesor
                      </p>
                      <a
                        href={task.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-blue-500 hover:bg-blue-400 text-gray-900 font-medium rounded-lg transition-colors shadow-lg"
                      >
                        <Download className="w-5 h-5" />
                        Descargar archivo adjunto
                      </a>
                    </div>
                  )}
                  
                  {task.questions?.map((question, idx) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm text-gray-900">
                        <span className="text-brand-purple font-medium">{idx + 1}.</span> {question.question}
                      </label>
                      
                      {/* Tipo: Texto */}
                      {question.type === 'text' && (
                        <textarea
                          value={answers[task.id]?.[question.id] || ''}
                          onChange={(e) => handleAnswerChange(task.id, question.id, e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 resize-none focus:outline-none focus:border-brand-purple"
                        />
                      )}
                      
                      {/* Tipo: Código */}
                      {question.type === 'code' && (
                        <textarea
                          value={answers[task.id]?.[question.id] || ''}
                          onChange={(e) => handleAnswerChange(task.id, question.id, e.target.value)}
                          placeholder="Escribe tu código aquí..."
                          rows={6}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-mono text-sm resize-none focus:outline-none focus:border-brand-purple"
                        />
                      )}
                      
                      {/* Tipo: Opción múltiple */}
                      {question.type === 'multiple' && question.options && (
                        <div className="space-y-2 pl-4">
                          {question.options.map((option, optIdx) => (
                            <label key={optIdx} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="radio"
                                name={`${task.id}-${question.id}`}
                                value={option}
                                checked={answers[task.id]?.[question.id] === option}
                                onChange={(e) => handleAnswerChange(task.id, question.id, e.target.value)}
                                className="w-4 h-4 text-brand-purple bg-gray-100 border-dark-500 focus:ring-brand-purple"
                              />
                              <span className="text-gray-300 group-hover:text-gray-900 transition-colors">
                                {String.fromCharCode(65 + optIdx)}. {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {/* Tipo: Dibujo */}
                      {question.type === 'drawing' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">🎨 Dibuja tu respuesta en el canvas</p>
                          <DrawingCanvas onSave={(data) => handleDrawingSave(task.id, data)} />
                          {drawings[task.id] && (
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Dibujo guardado
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Tipo: Subir archivo */}
                      {question.type === 'upload' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">📎 Sube tu archivo (PDF, documento, código)</p>
                          <FileUpload onUpload={(files) => handleFilesUpload(task.id, files)} />
                        </div>
                      )}
                      
                      {/* Tipo: Foto/Imagen */}
                      {question.type === 'image' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">📷 Toma o sube una foto de tu proyecto</p>
                          <FileUpload 
                            onUpload={(files) => handleFilesUpload(task.id, files)} 
                            acceptedTypes={['image/*']}
                          />
                        </div>
                      )}
                      
                      {/* Tipo: Bloques (ChaskiBlocks) */}
                      {question.type === 'blocks' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">🧩 Programa con bloques usando ChaskiBlocks</p>
                          <div className="h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                            <BlocklyEditor 
                              onCodeChange={(code) => handleAnswerChange(task.id, question.id, code)}
                            />
                          </div>
                          {answers[task.id]?.[question.id] && (
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Código generado
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Sección de Dibujo opcional - solo si NO hay preguntas tipo drawing */}
                  {!task.questions?.some(q => q.type === 'drawing') && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-900">
                        <Pencil className="w-4 h-4 text-brand-violet" />
                        <span className="font-medium">Dibujo (opcional)</span>
                      </div>
                      <p className="text-xs text-gray-600">Puedes hacer un dibujo para complementar tu respuesta</p>
                      <DrawingCanvas onSave={(data) => handleDrawingSave(task.id, data)} />
                      {drawings[task.id] && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Dibujo guardado
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sección de Archivos opcional - solo si NO hay preguntas tipo upload/image */}
                  {!task.questions?.some(q => q.type === 'upload' || q.type === 'image') && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-900">
                        <Upload className="w-4 h-4 text-brand-cyan" />
                        <span className="font-medium">Archivos adjuntos (opcional)</span>
                      </div>
                      <p className="text-xs text-gray-600">Sube fotos, PDFs, documentos Word o Excel</p>
                      <FileUpload onUpload={(files) => handleFilesUpload(task.id, files)} />
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => handleSubmit(task)}
                      disabled={submitting === task.id}
                      className="bg-neon-green hover:bg-neon-green/80 disabled:bg-gray-600 text-dark-900 font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      {submitting === task.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Enviar Tarea</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )})}
      </div>
      )}

      {tasks.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600">No hay tareas disponibles para este nivel</p>
        </div>
      )}
      </>
      )}
    </div>
  )
}
