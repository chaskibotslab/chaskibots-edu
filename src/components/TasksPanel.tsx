'use client'

import { useState, useEffect } from 'react'
import { 
  Send, CheckCircle, Clock, FileText, Code, Cpu, Zap, 
  BookOpen, Loader2, ChevronDown, ChevronUp, Award,
  Lightbulb, Wrench, CircuitBoard, Bot
} from 'lucide-react'

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
}

interface TaskQuestion {
  id: string
  question: string
  type: 'text' | 'multiple' | 'code'
  options?: string[]
  correctAnswer?: string
}

interface TaskSubmission {
  taskId: string
  answers: Record<string, string>
  code?: string
}

// Tareas de ejemplo por nivel
const SAMPLE_TASKS: Record<string, Task[]> = {
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
    case 'robotica': return 'text-neon-cyan bg-neon-cyan/20'
    case 'electronica': return 'text-yellow-400 bg-yellow-500/20'
    case 'programacion': return 'text-neon-green bg-neon-green/20'
    case 'ia': return 'text-neon-pink bg-neon-pink/20'
    default: return 'text-gray-400 bg-gray-500/20'
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
}

export default function TasksPanel({ levelId, studentName = '' }: TasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<string[]>([])
  const [name, setName] = useState(studentName)

  useEffect(() => {
    // Cargar tareas del nivel
    const levelTasks = SAMPLE_TASKS[levelId] || getDefaultTasks(levelId)
    setTasks(levelTasks)
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

  const handleSubmit = async (task: Task) => {
    if (!name.trim()) {
      alert('Por favor escribe tu nombre')
      return
    }

    const taskAnswers = answers[task.id] || {}
    const unanswered = task.questions?.filter(q => !taskAnswers[q.id]?.trim())
    
    if (unanswered && unanswered.length > 0) {
      alert('Por favor responde todas las preguntas')
      return
    }

    setSubmitting(task.id)

    try {
      // Formatear respuestas para enviar
      const formattedAnswers = task.questions?.map(q => 
        `${q.question}\nRespuesta: ${taskAnswers[q.id] || ''}`
      ).join('\n\n') || ''

      const taskId = `TASK-${Date.now().toString(36).toUpperCase()}`

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          studentName: name,
          levelId,
          lessonId: task.id,
          code: formattedAnswers,
          output: `Tarea: ${task.title}\nCategoría: ${task.category}\nPuntos: ${task.points}`
        })
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
      {/* Header */}
      <div className="bg-gradient-to-r from-neon-cyan/10 to-neon-green/10 border border-neon-cyan/30 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-neon-cyan" />
              Tareas y Actividades
            </h3>
            <p className="text-sm text-gray-400">Completa las tareas y envíalas al profesor</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder:text-gray-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`bg-dark-800 border rounded-xl overflow-hidden transition-all ${
              submitted.includes(task.id) 
                ? 'border-green-500/50' 
                : expandedTask === task.id 
                  ? 'border-neon-cyan/50' 
                  : 'border-dark-600 hover:border-dark-500'
            }`}
          >
            {/* Task Header */}
            <button
              onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              className="w-full p-4 flex items-center gap-4 text-left"
              disabled={submitted.includes(task.id)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(task.category)}`}>
                {submitted.includes(task.id) ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  getCategoryIcon(task.category)
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-white">{task.title}</h4>
                  {getDifficultyBadge(task.difficulty)}
                  {submitted.includes(task.id) && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Enviado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">{task.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="capitalize">{task.category}</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" /> {task.points} pts
                  </span>
                  <span>{task.questions?.length || 0} preguntas</span>
                </div>
              </div>

              {!submitted.includes(task.id) && (
                expandedTask === task.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )
              )}
            </button>

            {/* Task Content */}
            {expandedTask === task.id && !submitted.includes(task.id) && (
              <div className="px-4 pb-4 border-t border-dark-600">
                <div className="pt-4 space-y-4">
                  {task.questions?.map((question, idx) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm text-white">
                        <span className="text-neon-cyan font-medium">{idx + 1}.</span> {question.question}
                      </label>
                      {question.type === 'code' ? (
                        <textarea
                          value={answers[task.id]?.[question.id] || ''}
                          onChange={(e) => handleAnswerChange(task.id, question.id, e.target.value)}
                          placeholder="Escribe tu código aquí..."
                          rows={6}
                          className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-neon-cyan"
                        />
                      ) : (
                        <textarea
                          value={answers[task.id]?.[question.id] || ''}
                          onChange={(e) => handleAnswerChange(task.id, question.id, e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          rows={3}
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white resize-none focus:outline-none focus:border-neon-cyan"
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
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
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay tareas disponibles para este nivel</p>
        </div>
      )}
    </div>
  )
}
