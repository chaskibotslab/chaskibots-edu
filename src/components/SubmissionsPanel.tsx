'use client'

import { useState, useEffect, useMemo } from 'react'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useAuth } from '@/components/AuthProvider'
import {
  FileCode, Clock, CheckCircle, AlertCircle, Eye, X,
  Award, Send, Filter, RefreshCw, Trash2, ChevronDown, Download, FileText
} from 'lucide-react'

interface Submission {
  id: string
  taskId: string
  studentName: string
  levelId: string
  courseId?: string
  code: string
  output: string
  submittedAt: string
  status: 'pending' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  gradedAt?: string
}

interface TeacherCourseAssignment {
  courseId: string
  levelId: string
  courseName: string
}

export default function SubmissionsPanel() {
  const { user, isAdmin, isTeacher } = useAuth()
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourseAssignment[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeInput, setGradeInput] = useState<number>(10)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Cargar cursos asignados al profesor
  useEffect(() => {
    async function loadTeacherCourses() {
      if (isTeacher && !isAdmin && user?.accessCode) {
        try {
          const res = await fetch(`/api/teacher-courses?teacherId=${user.accessCode}`)
          const data = await res.json()
          if (data.assignments && data.assignments.length > 0) {
            setTeacherCourses(data.assignments)
          }
        } catch (error) {
          console.error('Error loading teacher courses:', error)
        }
      }
    }
    loadTeacherCourses()
  }, [isTeacher, isAdmin, user])

  // Niveles permitidos
  const allowedLevels = useMemo(() => {
    if (isAdmin) return EDUCATION_LEVELS
    if (isTeacher && teacherCourses.length > 0) {
      const allowedIds = new Set(teacherCourses.map(tc => tc.levelId))
      return EDUCATION_LEVELS.filter(l => allowedIds.has(l.id))
    }
    return EDUCATION_LEVELS
  }, [isAdmin, isTeacher, teacherCourses])

  useEffect(() => {
    loadSubmissions()
  }, [selectedLevel, statusFilter, selectedCourse, teacherCourses])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      let url = '/api/submissions?'
      if (selectedLevel) url += `levelId=${selectedLevel}&`
      if (statusFilter) url += `status=${statusFilter}&`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.submissions) {
        let filteredSubmissions = data.submissions
        
        // Si es profesor, filtrar por sus cursos asignados
        if (isTeacher && !isAdmin && teacherCourses.length > 0) {
          const allowedLevelIds = new Set(teacherCourses.map(tc => tc.levelId))
          filteredSubmissions = data.submissions.filter((s: Submission) => 
            allowedLevelIds.has(s.levelId)
          )
          
          // Si hay curso seleccionado, filtrar más
          if (selectedCourse) {
            const courseLevel = teacherCourses.find(tc => tc.courseId === selectedCourse)?.levelId
            if (courseLevel) {
              filteredSubmissions = filteredSubmissions.filter((s: Submission) => 
                s.levelId === courseLevel
              )
            }
          }
        }
        
        setSubmissions(filteredSubmissions)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
    setLoading(false)
  }

  const handleGrade = async () => {
    if (!selectedSubmission) return
    setSaving(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          grade: gradeInput,
          feedback: feedbackInput,
          gradedBy: user?.email || 'admin'
        })
      })
      if (res.ok) {
        // Sincronizar con Airtable (tabla grades)
        await syncGradeToAirtable(selectedSubmission, gradeInput, feedbackInput)
        
        loadSubmissions()
        setSelectedSubmission(null)
        setGradeInput(10)
        setFeedbackInput('')
      }
    } catch (error) {
      alert('Error al guardar calificación')
    }
    setSaving(false)
  }
  
  // Sincronizar calificación con Airtable (tabla grades)
  const syncGradeToAirtable = async (submission: Submission, grade: number, feedback: string) => {
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: submission.studentName,
          lessonId: submission.taskId,
          levelId: submission.levelId || '',
          score: grade,
          feedback: feedback,
          taskId: submission.taskId,
          submittedAt: submission.submittedAt || new Date().toISOString(),
          gradedBy: user?.email || 'admin'
        })
      })
      
      if (!response.ok) {
        console.error('Error syncing grade to Airtable')
      }
    } catch (error) {
      console.error('Error syncing grade to Airtable:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta entrega?')) return
    try {
      await fetch('/api/submissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id })
      })
      loadSubmissions()
    } catch (error) {
      alert('Error al eliminar')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Pendiente
        </span>
      case 'graded':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Calificado
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
          {status}
        </span>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-400 bg-green-500/20'
    if (score >= 7) return 'text-yellow-400 bg-yellow-500/20'
    if (score >= 5) return 'text-orange-400 bg-orange-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const gradedCount = submissions.filter(s => s.status === 'graded').length
  
  // Sincronizar TODAS las entregas calificadas al sistema local
  const syncAllGradedSubmissions = async () => {
    const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.grade !== undefined)
    
    if (gradedSubmissions.length === 0) {
      alert('No hay entregas calificadas para sincronizar')
      return
    }
    
    setSyncing(true)
    let synced = 0
    
    for (const submission of gradedSubmissions) {
      try {
        await syncGradeToAirtable(submission, submission.grade!, submission.feedback || '')
        synced++
      } catch (error) {
        console.error('Error syncing submission:', submission.id, error)
      }
    }
    
    setSyncing(false)
    alert(`✅ Se sincronizaron ${synced} calificaciones al sistema de estudiantes.\n\nAhora puedes ver los estudiantes y sus calificaciones en las pestañas "Estudiantes" y "Calificaciones".`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Send className="w-7 h-7 text-neon-green" />
            Entregas de Estudiantes
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isTeacher && !isAdmin ? 'Entregas de tus cursos asignados' : 'Tareas enviadas desde los simuladores'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
              {pendingCount} pendientes
            </span>
          )}
          {gradedCount > 0 && (
            <button
              onClick={syncAllGradedSubmissions}
              disabled={syncing}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              title="Sincronizar todas las calificaciones al sistema de estudiantes"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Sincronizar {gradedCount}
            </button>
          )}
          <button
            onClick={loadSubmissions}
            className="p-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Selector de curso para profesores */}
        {isTeacher && !isAdmin && teacherCourses.length > 0 && (
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value)
              const course = teacherCourses.find(tc => tc.courseId === e.target.value)
              if (course) setSelectedLevel(course.levelId)
            }}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
          >
            <option value="">Todos mis cursos</option>
            {teacherCourses.map(tc => (
              <option key={tc.courseId} value={tc.courseId}>{tc.courseName}</option>
            ))}
          </select>
        )}
        
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
        >
          <option value="">Todos los niveles</option>
          {allowedLevels.map(level => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="graded">Calificados</option>
        </select>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
          <Send className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay entregas aún</p>
          <p className="text-gray-500 text-sm mt-1">
            {isTeacher && !isAdmin && teacherCourses.length === 0 
              ? 'No tienes cursos asignados. Contacta al administrador.'
              : 'Los estudiantes pueden enviar tareas desde los simuladores'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map(submission => (
            <div
              key={submission.id}
              className="bg-dark-800 border border-dark-600 rounded-xl p-4 hover:border-dark-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{submission.studentName}</h3>
                    {getStatusBadge(submission.status)}
                    {submission.grade !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(submission.grade)}`}>
                        {submission.grade}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileCode className="w-4 h-4" />
                      {submission.taskId}
                    </span>
                    <span>
                      {EDUCATION_LEVELS.find(l => l.id === submission.levelId)?.name || submission.levelId}
                    </span>
                    <span>
                      {new Date(submission.submittedAt).toLocaleString('es-EC')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubmission(submission)
                      setGradeInput(submission.grade || 10)
                      setFeedbackInput(submission.feedback || '')
                    }}
                    className="p-2 text-neon-cyan hover:bg-neon-cyan/20 rounded-lg transition-colors"
                    title="Ver y calificar"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-4xl w-full my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSubmission.studentName}</h3>
                <p className="text-sm text-gray-400">
                  {selectedSubmission.taskId} • {new Date(selectedSubmission.submittedAt).toLocaleString('es-EC')}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dark-600">
              {/* Code */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <FileCode className="w-4 h-4" /> Código Python
                </h4>
                <pre className="bg-dark-900 rounded-lg p-4 text-sm text-gray-300 overflow-auto max-h-64 font-mono">
                  {selectedSubmission.code}
                </pre>
              </div>

              {/* Output */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Resultado</h4>
                <pre className="bg-dark-900 rounded-lg p-4 text-sm text-green-400 overflow-auto max-h-64 font-mono">
                  {selectedSubmission.output || '(Sin salida)'}
                </pre>
              </div>
            </div>

            {/* Grading Section */}
            <div className="p-4 border-t border-dark-600 bg-dark-900/50">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" /> Calificar
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Calificación (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-xl font-bold text-center"
                  />
                  <div className="flex justify-between mt-2">
                    {[0, 2.5, 5, 7.5, 10].map(score => (
                      <button
                        key={score}
                        onClick={() => setGradeInput(score)}
                        className={`px-2 py-1 rounded text-xs ${
                          gradeInput === score 
                            ? 'bg-neon-cyan text-dark-900' 
                            : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Feedback (opcional)</label>
                  <textarea
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Comentarios para el estudiante..."
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleGrade}
                disabled={saving}
                className="px-6 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/80 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Guardar Calificación</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
