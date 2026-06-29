'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import {
  ClipboardList, Clock, CheckCircle2, Award, Search,
  Loader2, AlertCircle, X, Upload, Paperclip,
  Sparkles, ChevronRight, FileText, Calendar, Star,
  Send, Image as ImageIcon, Trash2, ExternalLink
} from 'lucide-react'

interface Task {
  id: string
  levelId: string
  title: string
  description: string
  type: string
  category: string
  difficulty: string
  points: number
  dueDate?: string
  questions: string[]
  attachmentUrl?: string
}

interface Submission {
  id: string
  taskId: string
  status: 'pending' | 'graded' | string
  grade?: number | null
  feedback?: string
  submittedAt: string
  gradedAt?: string
  attachmentUrls?: string[]
}

interface UploadedFile {
  name: string
  url: string
  type: string
  size: number
}

type FilterStatus = 'all' | 'pending' | 'submitted' | 'graded'

const FILTERS: { id: FilterStatus; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'Todas', icon: ClipboardList, color: 'brand-purple' },
  { id: 'pending', label: 'Pendientes', icon: Clock, color: 'amber-500' },
  { id: 'submitted', label: 'Enviadas', icon: Send, color: 'brand-cyan' },
  { id: 'graded', label: 'Calificadas', icon: Award, color: 'green-500' }
]

const DIFFICULTY_STYLES: Record<string, string> = {
  basico: 'bg-green-100 text-green-700 border-green-200',
  intermedio: 'bg-amber-100 text-amber-700 border-amber-200',
  avanzado: 'bg-red-100 text-red-700 border-red-200'
}

const CATEGORY_EMOJI: Record<string, string> = {
  robotica: '🤖',
  electronica: '⚡',
  programacion: '💻',
  ia: '🧠',
  general: '📚'
}

export default function TareasPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/tareas')
    }
  }, [isLoading, isAuthenticated, router])

  const loadData = useCallback(async () => {
    if (!user?.levelId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [tasksRes, subsRes] = await Promise.all([
        fetch(`/api/tasks?levelId=${user.levelId}`),
        fetch(`/api/submissions?studentEmail=${encodeURIComponent(user.email || '')}`)
      ])
      const tasksData = await tasksRes.json()
      const subsData = await subsRes.json()
      setTasks(tasksData.tasks || [])
      setSubmissions(subsData.submissions || [])
    } catch (err) {
      console.error('[Tareas] Error loading:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.levelId, user?.email])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const submissionByTaskId = useMemo(() => {
    const map = new Map<string, Submission>()
    for (const s of submissions) {
      // mantener la más reciente
      const existing = map.get(s.taskId)
      if (!existing || new Date(s.submittedAt) > new Date(existing.submittedAt)) {
        map.set(s.taskId, s)
      }
    }
    return map
  }, [submissions])

  const stats = useMemo(() => {
    let pending = 0, submitted = 0, graded = 0, totalPoints = 0, earnedPoints = 0
    for (const task of tasks) {
      const sub = submissionByTaskId.get(task.id)
      totalPoints += task.points || 0
      if (!sub) pending++
      else if (sub.status === 'graded') {
        graded++
        const g = Number(sub.grade) || 0
        // grade is 0-100, scale to points
        earnedPoints += Math.round((g / 100) * (task.points || 0))
      } else submitted++
    }
    return { pending, submitted, graded, totalPoints, earnedPoints, total: tasks.length }
  }, [tasks, submissionByTaskId])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const sub = submissionByTaskId.get(task.id)
      // filter
      if (filter === 'pending' && sub) return false
      if (filter === 'submitted' && (!sub || sub.status === 'graded')) return false
      if (filter === 'graded' && (!sub || sub.status !== 'graded')) return false
      // search
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, submissionByTaskId, filter, search])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />

      <main className="flex-1 py-6 px-4 pb-24">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-8 shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-purple/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-brand-cyan/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                  <span className="text-white/90 text-xs font-medium">Hola, {user.name.split(' ')[0]}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-1">Mis Tareas</h1>
                <p className="text-white/70 text-sm">Organiza y entrega tu trabajo</p>
              </div>
              <div className="flex gap-3">
                <StatChip label="Pendientes" value={stats.pending} color="amber-300" />
                <StatChip label="Calificadas" value={stats.graded} color="green-300" />
                <StatChip label="Puntos" value={`${stats.earnedPoints}/${stats.totalPoints}`} color="brand-cyan" />
              </div>
            </div>
          </div>

          {/* Filtros + Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tarea..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
              />
            </div>
          </div>

          {/* Filtros pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {FILTERS.map((f) => {
              const Icon = f.icon
              const isActive = filter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Lista */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState filter={filter} hasLevelId={!!user.levelId} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  submission={submissionByTaskId.get(task.id)}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Sheet modal */}
      {selectedTask && (
        <TaskSheet
          task={selectedTask}
          submission={submissionByTaskId.get(selectedTask.id)}
          user={user}
          onClose={() => setSelectedTask(null)}
          onSubmitted={() => {
            setSelectedTask(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5">
      <p className="text-white/60 text-xs">{label}</p>
      <p className={`text-${color} font-bold text-lg leading-tight`}>{value}</p>
    </div>
  )
}

function EmptyState({ filter, hasLevelId }: { filter: FilterStatus; hasLevelId: boolean }) {
  if (!hasLevelId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-900 mb-1">Sin nivel asignado</h3>
        <p className="text-slate-600 text-sm">Pide a tu profesor que te asigne a un curso para ver tus tareas.</p>
      </div>
    )
  }
  const messages: Record<FilterStatus, { title: string; description: string }> = {
    all: { title: 'No hay tareas todavía', description: 'Cuando tu profesor cree tareas aparecerán aquí.' },
    pending: { title: '¡Estás al día!', description: 'No tienes tareas pendientes.' },
    submitted: { title: 'Nada esperando revisión', description: 'No tienes entregas en espera.' },
    graded: { title: 'Aún no hay calificaciones', description: 'Cuando tu profesor revise tu trabajo aparecerá aquí.' }
  }
  const msg = messages[filter]
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ClipboardList className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{msg.title}</h3>
      <p className="text-slate-500 text-sm">{msg.description}</p>
    </div>
  )
}

function TaskCard({ task, submission, onClick }: { task: Task; submission?: Submission; onClick: () => void }) {
  const status = submission?.status === 'graded' ? 'graded' : submission ? 'submitted' : 'pending'
  const statusConfig = {
    pending: { label: 'Pendiente', color: 'amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock },
    submitted: { label: 'Enviada', color: 'brand-cyan', bg: 'bg-cyan-50 border-cyan-200', icon: Send },
    graded: { label: 'Calificada', color: 'green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 }
  }[status]
  const StatusIcon = statusConfig.icon
  const emoji = CATEGORY_EMOJI[task.category] || '📚'

  const dueText = task.dueDate ? formatDate(task.dueDate) : null
  const isOverdue = task.dueDate && status === 'pending' && new Date(task.dueDate) < new Date()

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-brand-purple/40 transition-all duration-300 active:scale-[0.98]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{task.title}</h3>
          <p className="text-slate-500 text-sm line-clamp-1">{task.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-purple group-hover:translate-x-1 transition-all shrink-0 mt-1" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} text-${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${DIFFICULTY_STYLES[task.difficulty] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
          {task.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-brand-purple/20 bg-brand-purple/5 text-brand-purple">
          <Star className="w-3 h-3" />
          {task.points} pts
        </span>
        {status === 'graded' && submission?.grade != null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200 bg-green-50 text-green-700">
            {submission.grade}/100
          </span>
        )}
        {dueText && status === 'pending' && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${isOverdue ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
            <Calendar className="w-3 h-3" />
            {dueText}
          </span>
        )}
      </div>
    </button>
  )
}

function TaskSheet({ task, submission, user, onClose, onSubmitted }: {
  task: Task
  submission?: Submission
  user: any
  onClose: () => void
  onSubmitted: () => void
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const alreadySubmitted = !!submission
  const isGraded = submission?.status === 'graded'

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = event.target.files
    if (!filesList || filesList.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(filesList)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', 'submissions')
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error subiendo archivo')
        setFiles(prev => [...prev, { name: file.name, url: data.url, type: file.type, size: file.size }])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const answersText = task.questions
        .map((q, i) => answers[i] ? `${q}\n→ ${answers[i]}` : null)
        .filter(Boolean)
        .join('\n\n')

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          studentName: user.name,
          studentEmail: user.email,
          levelId: user.levelId,
          courseId: user.courseId,
          schoolId: user.schoolId,
          output: answersText,
          attachmentUrls: files.map(f => f.url)
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error enviando entrega')
      onSubmitted()
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
              {CATEGORY_EMOJI[task.category] || '📚'}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-lg truncate">{task.title}</h2>
              <p className="text-slate-500 text-sm">{task.points} puntos · {task.difficulty}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {task.description && (
            <p className="text-slate-600 leading-relaxed">{task.description}</p>
          )}

          {task.attachmentUrl && (
            <a
              href={task.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-brand-purple/5 border border-brand-purple/20 rounded-2xl hover:bg-brand-purple/10 transition-colors"
            >
              <Paperclip className="w-5 h-5 text-brand-purple" />
              <span className="font-medium text-brand-purple flex-1">Material adjunto</span>
              <ExternalLink className="w-4 h-4 text-brand-purple" />
            </a>
          )}

          {/* Graded feedback */}
          {isGraded && submission && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-slate-900">Tu calificación</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-green-600">{submission.grade}</span>
                <span className="text-slate-500 font-medium">/100</span>
              </div>
              {submission.feedback && (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">Comentarios</p>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Already submitted */}
          {alreadySubmitted && !isGraded && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 flex items-center gap-3">
              <Send className="w-6 h-6 text-brand-cyan shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Entrega recibida</p>
                <p className="text-slate-600 text-sm">Esperando revisión del profesor</p>
              </div>
            </div>
          )}

          {/* Form (only if not submitted) */}
          {!alreadySubmitted && (
            <>
              {/* Questions */}
              {task.questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-purple" />
                    Preguntas
                  </h3>
                  {task.questions.map((q, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {i + 1}. {q}
                      </label>
                      <textarea
                        value={answers[i] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        rows={3}
                        placeholder="Escribe tu respuesta..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* File upload */}
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-brand-cyan" />
                  Archivos
                  <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                </h3>
                <label className={`flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  uploading ? 'border-slate-300 bg-slate-50' : 'border-slate-300 hover:border-brand-purple hover:bg-brand-purple/5'
                }`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                      <span className="text-slate-500 font-medium">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-600 font-medium">Subir archivos</span>
                      <span className="text-slate-400 text-sm">(imágenes, PDF, máx 10MB)</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-brand-purple shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-brand-cyan shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate text-sm">{file.name}</p>
                          <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!alreadySubmitted && (
          <div className="border-t border-slate-100 px-6 py-4 bg-white">
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet hover:from-brand-violet hover:to-brand-purple text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-purple/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar entrega
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays === -1) return 'Ayer'
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`
    if (diffDays < 7) return `En ${diffDays} días`
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
