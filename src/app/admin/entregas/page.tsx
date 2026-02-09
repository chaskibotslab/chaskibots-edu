'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useDynamicLevels } from '@/hooks/useDynamicLevels'
import {
  ArrowLeft, FileText, Search, Filter, Check, X, Clock,
  Eye, Trash2, Download, ChevronDown, Loader2, Code,
  Calendar, User, GraduationCap, Star, MessageSquare,
  Image, Paperclip, Edit3, RotateCcw, Gamepad2
} from 'lucide-react'
import SimulatorChallengesPanel from '@/components/SimulatorChallengesPanel'

interface Submission {
  id: string
  taskId: string
  studentName: string
  studentEmail: string
  levelId: string
  lessonId: string
  code: string
  output: string
  submittedAt: string
  status: 'pending' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: string
  drawing?: string
  files?: string
}

interface TeacherCourseAssignment {
  courseId: string
  levelId: string
  courseName: string
}

function EntregasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlLevelId = searchParams.get('levelId') || ''
  const urlTab = searchParams.get('tab') || 'tareas'
  const { user, isAdmin, isTeacher, isLoading } = useAuth()
  const { levels: dynamicLevels } = useDynamicLevels()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState(urlLevelId)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeInput, setGradeInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourseAssignment[]>([])
  const [activeTab, setActiveTab] = useState<'tareas' | 'simulador'>(urlTab as 'tareas' | 'simulador')

  // Sincronizar selectedLevel con urlLevelId cuando cambie
  useEffect(() => {
    if (urlLevelId && urlLevelId !== selectedLevel) {
      setSelectedLevel(urlLevelId)
    }
  }, [urlLevelId])

  // Cargar cursos asignados al profesor
  useEffect(() => {
    async function loadTeacherCourses() {
      if (isTeacher && !isAdmin && user?.accessCode) {
        try {
          const res = await fetch(`/api/teacher-courses?teacherId=${user.accessCode}`)
          const data = await res.json()
          if (data.assignments && data.assignments.length > 0) {
            setTeacherCourses(data.assignments)
            // Si no hay nivel seleccionado y no viene de URL, usar el primero asignado
            if (!selectedLevel && !urlLevelId && data.assignments[0]?.levelId) {
              setSelectedLevel(data.assignments[0].levelId)
            }
          }
        } catch (error) {
          console.error('Error loading teacher courses:', error)
        }
      }
    }
    loadTeacherCourses()
  }, [isTeacher, isAdmin, user, urlLevelId])

  useEffect(() => {
    // Permitir acceso a admin y profesores
    if (!isLoading && !user) {
      router.push('/')
    }
    // Si no es admin ni profesor, redirigir
    if (!isLoading && user && !isAdmin && !isTeacher) {
      router.push('/')
    }
  }, [user, isLoading, isAdmin, isTeacher, router])

  useEffect(() => {
    loadSubmissions()
  }, [teacherCourses])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/submissions')
      const data = await res.json()
      if (data.submissions) {
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
    setLoading(false)
  }

  const handleGrade = async () => {
    if (!selectedSubmission) return
    
    const grade = parseFloat(gradeInput)
    if (isNaN(grade) || grade < 0 || grade > 10) {
      alert('La calificación debe ser un número entre 0 y 10')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSubmission.id,
          grade,
          feedback: feedbackInput,
          status: 'graded',
          gradedBy: user?.name || 'Profesor',
          gradedAt: new Date().toISOString()
        })
      })

      if (res.ok) {
        await loadSubmissions()
        setSelectedSubmission(null)
        setGradeInput('')
        setFeedbackInput('')
      } else {
        alert('Error al guardar la calificación')
      }
    } catch (error) {
      alert('Error de conexión')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta entrega?')) return

    try {
      const res = await fetch(`/api/submissions?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await loadSubmissions()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  // Niveles permitidos para el profesor
  const levels = dynamicLevels.length > 0 ? dynamicLevels : EDUCATION_LEVELS
  const allowedLevelIds = isAdmin 
    ? levels.map(l => l.id) 
    : teacherCourses.map(tc => tc.levelId)

  const filteredSubmissions = submissions.filter(sub => {
    // Filtrar por cursos del profesor (si no es admin)
    if (!isAdmin && teacherCourses.length > 0) {
      if (!allowedLevelIds.includes(sub.levelId)) return false
    }
    if (selectedLevel && sub.levelId !== selectedLevel) return false
    if (selectedStatus && sub.status !== selectedStatus) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        sub.studentName.toLowerCase().includes(search) ||
        sub.taskId.toLowerCase().includes(search) ||
        sub.code.toLowerCase().includes(search)
      )
    }
    return true
  })

  const getLevelName = (levelId: string) => {
    const level = levels.find(l => l.id === levelId)
    return level?.name || levelId
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>
      case 'graded':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Calificado</span>
      case 'returned':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Devuelto</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">{status}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                Entregas de Estudiantes
              </h1>
              <p className="text-sm text-gray-400">
                {submissions.length} entregas totales • {submissions.filter(s => s.status === 'pending').length} pendientes
              </p>
            </div>
          </div>
          {activeTab === 'tareas' && (
            <button
              onClick={loadSubmissions}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
            >
              Actualizar
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tareas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tareas'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              Tareas y Lecciones
            </button>
            <button
              onClick={() => setActiveTab('simulador')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'simulador'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Retos Simulador 3D
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab: Simulador 3D */}
        {activeTab === 'simulador' && (
          <SimulatorChallengesPanel />
        )}

        {/* Tab: Tareas */}
        {activeTab === 'tareas' && (
          <>
            {/* Filters */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, código..."
                      className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                >
                  <option value="">Todos los niveles</option>
                  {(isAdmin ? levels : levels.filter(l => allowedLevelIds.includes(l.id))).map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="graded">Calificados</option>
                  <option value="returned">Devueltos</option>
                </select>
              </div>
            </div>

            {/* Submissions List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No hay entregas</h3>
                <p className="text-gray-400">
                  {searchTerm || selectedLevel || selectedStatus
                    ? 'No se encontraron entregas con los filtros seleccionados'
                    : 'Aún no hay entregas de estudiantes'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map(submission => (
                  <div
                    key={submission.id}
                    className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden hover:border-purple-500/30 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{submission.studentName}</h3>
                              <p className="text-sm text-gray-400">{submission.taskId}</p>
                            </div>
                            {getStatusBadge(submission.status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {getLevelName(submission.levelId)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(submission.submittedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {submission.grade !== undefined && (
                              <span className="flex items-center gap-1 text-green-400">
                                <Star className="w-4 h-4" />
                                {submission.grade}/10
                              </span>
                            )}
                          </div>

                          {/* Code Preview */}
                          <div className="bg-dark-900 rounded-lg p-3 max-h-32 overflow-hidden">
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                              {submission.code.slice(0, 300)}
                              {submission.code.length > 300 && '...'}
                            </pre>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setGradeInput(submission.grade?.toString() || '')
                              setFeedbackInput(submission.feedback || '')
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              submission.status === 'graded'
                                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                                : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
                            }`}
                            title={submission.status === 'graded' ? 'Editar calificación' : 'Calificar'}
                          >
                            {submission.status === 'graded' ? (
                              <Edit3 className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Grade Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-dark-600 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Calificar Entrega</h3>
                <p className="text-sm text-gray-400">
                  {selectedSubmission.studentName} • {selectedSubmission.taskId}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-400" />
                    Código / Respuestas
                  </h4>
                  <div className="bg-dark-900 rounded-lg p-4 h-64 overflow-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {selectedSubmission.code.replace(/\[DIBUJO_ADJUNTO_BASE64\]/g, '').replace(/\[ARCHIVOS:[^\]]+\]/g, '')}
                    </pre>
                  </div>
                </div>

                {/* Output */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Salida / Info</h4>
                  <div className="bg-dark-900 rounded-lg p-4 h-64 overflow-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                      {selectedSubmission.output || 'Sin salida'}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Adjuntos - Dibujo y Archivos */}
              {(selectedSubmission.drawing || selectedSubmission.files || 
                selectedSubmission.output?.includes('📁 ADJUNTOS')) && (
                <div className="mt-4 p-4 bg-dark-700 rounded-lg border border-dark-600">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-green-400" />
                    Archivos Adjuntos del Estudiante
                  </h4>
                  
                  {/* Mostrar dibujo como imagen */}
                  {selectedSubmission.drawing && (
                    <div className="mb-4">
                      <p className="text-sm text-purple-300 mb-2 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        🎨 Dibujo del estudiante:
                      </p>
                      <div className="bg-white rounded-lg p-2 inline-block">
                        <img 
                          src={selectedSubmission.drawing} 
                          alt="Dibujo del estudiante"
                          className="max-w-full max-h-64 rounded"
                        />
                      </div>
                      <a
                        href={selectedSubmission.drawing}
                        download={`dibujo_${selectedSubmission.studentName}.png`}
                        className="mt-2 flex items-center gap-2 p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors w-fit"
                      >
                        <Download className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">Descargar dibujo</span>
                      </a>
                    </div>
                  )}
                  
                  {/* Mostrar archivos */}
                  {selectedSubmission.files && (() => {
                    try {
                      const filesArray = JSON.parse(selectedSubmission.files)
                      
                      return (
                        <div className="space-y-2">
                          <p className="text-sm text-blue-300 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            📎 Archivos adjuntos ({filesArray.length}):
                          </p>
                          {filesArray.map((file: any, idx: number) => {
                            // Si tiene URL de Google Drive
                            if (file.url) {
                              return (
                                <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/30"
                                >
                                  <Download className="w-5 h-5 text-blue-400" />
                                  <span className="text-sm text-blue-300 flex-1">{file.name}</span>
                                  <span className="text-xs text-gray-400">Ver en Google Drive →</span>
                                </a>
                              )
                            }
                            // Si tiene datos base64
                            if (file.data) {
                              const dataUrl = file.data.startsWith('data:') 
                                ? file.data 
                                : `data:${file.type || 'application/octet-stream'};base64,${file.data}`
                              return (
                                <a
                                  key={idx}
                                  href={dataUrl}
                                  download={file.name}
                                  className="flex items-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/30"
                                >
                                  <Download className="w-5 h-5 text-green-400" />
                                  <span className="text-sm text-green-300 flex-1">{file.name}</span>
                                  <span className="text-xs text-gray-400">Descargar archivo</span>
                                </a>
                              )
                            }
                            // Sin URL ni datos
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-3 bg-gray-500/10 rounded-lg border border-gray-500/30"
                              >
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-300 flex-1">{file.name}</span>
                                <span className="text-xs text-gray-500">({file.type || 'archivo'})</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    } catch {
                      return null
                    }
                  })()}
                  
                  {/* Fallback si no hay datos pero hay indicadores en output */}
                  {!selectedSubmission.drawing && !selectedSubmission.files && 
                   selectedSubmission.output?.includes('📁 ADJUNTOS') && (
                    <p className="text-sm text-gray-400">
                      Los archivos fueron enviados pero no se pudieron guardar en la base de datos.
                      Por favor, crea los campos "drawing" y "files" en tu tabla de Airtable.
                    </p>
                  )}
                </div>
              )}

              {/* Grading Form */}
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Calificación (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ej: 8.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Retroalimentación
                  </label>
                  <textarea
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white resize-none focus:outline-none focus:border-purple-500"
                    placeholder="Comentarios para el estudiante..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-dark-600 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGrade}
                disabled={saving || !gradeInput}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Check className="w-4 h-4" /> Guardar Calificación</>
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
export default function EntregasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    }>
      <EntregasContent />
    </Suspense>
  )
}
