'use client'

import { useState, useEffect } from 'react'
import { 
  Star, Clock, CheckCircle, MessageSquare, FileText, 
  Loader2, ChevronDown, ChevronUp, Award, Calendar,
  AlertCircle, TrendingUp
} from 'lucide-react'

interface Submission {
  id: string
  taskId: string
  studentName: string
  levelId: string
  lessonId: string
  code: string
  output: string
  submittedAt: string
  status: 'pending' | 'graded' | 'returned'
  grade?: string
  feedback?: string
  gradedBy?: string
}

interface MisCalificacionesProps {
  studentName: string
  levelId: string
}

export default function MisCalificaciones({ studentName, levelId }: MisCalificacionesProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadMySubmissions()
  }, [studentName, levelId])

  const loadMySubmissions = async () => {
    if (!studentName || !studentName.trim()) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`/api/submissions?levelId=${levelId}`)
      const data = await res.json()
      if (data.submissions) {
        // Filtrar solo las entregas de este estudiante
        const mySubmissions = data.submissions.filter(
          (s: Submission) => s.studentName.toLowerCase().trim() === studentName.toLowerCase().trim()
        )
        setSubmissions(mySubmissions)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente de revisión
          </span>
        )
      case 'graded':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Calificado
          </span>
        )
      case 'returned':
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Con comentarios
          </span>
        )
      default:
        return null
    }
  }

  const getGradeColor = (grade: string) => {
    const num = parseFloat(grade)
    if (num >= 9) return 'text-green-400'
    if (num >= 7) return 'text-yellow-400'
    if (num >= 5) return 'text-orange-400'
    return 'text-red-400'
  }

  // Calcular promedio
  const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.grade)
  const average = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((sum, s) => sum + parseFloat(s.grade || '0'), 0) / gradedSubmissions.length).toFixed(1)
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
      </div>
    )
  }

  // Si no hay nombre, mostrar mensaje
  if (!studentName || !studentName.trim()) {
    return (
      <div className="bg-dark-800 border border-yellow-500/30 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-white font-medium">Ingresa tu nombre primero</p>
        <p className="text-sm text-gray-400 mt-1">Escribe tu nombre completo en el campo de arriba para ver tus calificaciones</p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-center">
        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No tienes entregas registradas aún</p>
        <p className="text-sm text-gray-500 mt-1">Completa una tarea para ver tu progreso aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Mi Progreso
            </h3>
            <p className="text-sm text-gray-400">
              {submissions.length} tareas enviadas • {gradedSubmissions.length} calificadas
            </p>
          </div>
          {average && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Promedio</p>
              <p className={`text-2xl font-bold ${getGradeColor(average)}`}>
                {average}/10
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de entregas */}
      <div className="space-y-3">
        {submissions.map(submission => (
          <div
            key={submission.id}
            className={`bg-dark-800 border rounded-xl overflow-hidden transition-all ${
              submission.status === 'graded' 
                ? 'border-green-500/30' 
                : 'border-dark-600'
            }`}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-dark-700/50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                submission.status === 'graded' 
                  ? 'bg-green-500/20' 
                  : 'bg-yellow-500/20'
              }`}>
                {submission.status === 'graded' ? (
                  <span className={`text-xl font-bold ${getGradeColor(submission.grade || '0')}`}>
                    {submission.grade}
                  </span>
                ) : (
                  <Clock className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-white">{submission.taskId}</h4>
                  {getStatusBadge(submission.status)}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(submission.submittedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {submission.gradedBy && (
                    <span>Calificado por: {submission.gradedBy}</span>
                  )}
                </div>
              </div>

              {expandedId === submission.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Contenido expandido */}
            {expandedId === submission.id && (
              <div className="px-4 pb-4 border-t border-dark-600">
                <div className="pt-4 space-y-4">
                  {/* Calificación grande */}
                  {submission.status === 'graded' && submission.grade && (
                    <div className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg">
                      <div className={`text-4xl font-bold ${getGradeColor(submission.grade)}`}>
                        {submission.grade}
                        <span className="text-lg text-gray-500">/10</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full ${
                                i < parseFloat(submission.grade || '0')
                                  ? parseFloat(submission.grade || '0') >= 7 
                                    ? 'bg-green-500' 
                                    : parseFloat(submission.grade || '0') >= 5 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                  : 'bg-dark-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Retroalimentación del profesor */}
                  {submission.feedback && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Retroalimentación del Profesor
                      </h5>
                      <p className="text-white whitespace-pre-wrap">{submission.feedback}</p>
                    </div>
                  )}

                  {/* Estado pendiente */}
                  {submission.status === 'pending' && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Tu tarea está siendo revisada</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        El profesor revisará tu entrega pronto. Recibirás tu calificación y retroalimentación aquí.
                      </p>
                    </div>
                  )}

                  {/* Resumen de lo enviado */}
                  <div className="p-3 bg-dark-900 rounded-lg">
                    <h5 className="text-xs font-medium text-gray-400 mb-2">Tu respuesta:</h5>
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                      {submission.code.slice(0, 500)}
                      {submission.code.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
