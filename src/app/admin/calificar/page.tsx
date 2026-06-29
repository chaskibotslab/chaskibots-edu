'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Search, Loader2, Clock, CheckCircle2, Award,
  User, FileText, ChevronRight, X, Star, Send,
  Image as ImageIcon, ExternalLink, Sparkles, Filter,
  MessageSquare, Calendar, AlertCircle, Zap
} from 'lucide-react'

interface Submission {
  id: string
  taskId: string
  studentName: string
  studentEmail: string
  levelId: string
  output: string
  code: string
  drawing: string
  drawingUrl: string
  attachmentUrls: string[]
  status: 'pending' | 'graded' | string
  grade?: number | null
  feedback?: string
  submittedAt: string
  gradedAt?: string
}

interface Task {
  id: string
  title: string
  points: number
  category?: string
}

type Filter = 'pending' | 'graded' | 'all'

const FILTERS: { id: Filter; label: string; icon: any }[] = [
  { id: 'pending', label: 'Pendientes', icon: Clock },
  { id: 'graded', label: 'Calificadas', icon: CheckCircle2 },
  { id: 'all', label: 'Todas', icon: FileText },
]

const QUICK_GRADES = [
  { value: 100, label: '💯', color: 'green-500' },
  { value: 90, label: '🌟', color: 'green-400' },
  { value: 80, label: '👍', color: 'lime-500' },
  { value: 70, label: '✅', color: 'amber-500' },
  { value: 60, label: '⚠️', color: 'orange-500' },
  { value: 50, label: '❌', color: 'red-500' },
]

const QUICK_FEEDBACK = [
  '¡Excelente trabajo! 🎉',
  'Muy bien hecho 👏',
  'Buen trabajo, sigue así',
  'Revisa este punto y vuelve a entregar',
  'Necesitas explicar mejor tu respuesta',
  'Falta evidencia/archivo',
]

export default function CalificarPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, isTeacher } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [tasks, setTasks] = useState<Record<string, Task>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isTeacher)) {
      router.push('/login?redirect=/admin/calificar')
    }
  }, [isLoading, isAuthenticated, isTeacher, router])

  const loadData = useCallback(async () => {
    try {
      const [subsRes, tasksRes] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/tasks?activeOnly=false')
      ])
      const subsData = await subsRes.json()
      const tasksData = await tasksRes.json()

      setSubmissions(subsData.submissions || [])
      const taskMap: Record<string, Task> = {}
      for (const t of tasksData.tasks || []) {
        taskMap[t.id] = { id: t.id, title: t.title, points: t.points, category: t.category }
      }
      setTasks(taskMap)
    } catch (err) {
      console.error('[Calificar] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  // Realtime subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('submissions-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, () => {
        setNewCount(c => c + 1)
        loadData()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'submissions' }, () => {
        loadData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, loadData])

  const stats = useMemo(() => ({
    pending: submissions.filter(s => s.status !== 'graded').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    today: submissions.filter(s => {
      const d = new Date(s.submittedAt)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    }).length,
    total: submissions.length,
  }), [submissions])

  const filtered = useMemo(() => {
    return submissions
      .filter(s => {
        if (filter === 'pending' && s.status === 'graded') return false
        if (filter === 'graded' && s.status !== 'graded') return false
        if (search) {
          const q = search.toLowerCase()
          const taskTitle = tasks[s.taskId]?.title?.toLowerCase() || ''
          return (
            s.studentName?.toLowerCase().includes(q) ||
            s.studentEmail?.toLowerCase().includes(q) ||
            taskTitle.includes(q)
          )
        }
        return true
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }, [submissions, tasks, filter, search])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">Calificar entregas</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                En vivo · {stats.pending} pendientes
              </p>
            </div>
          </div>
          {newCount > 0 && (
            <button
              onClick={() => setNewCount(0)}
              className="flex items-center gap-2 bg-brand-purple/10 text-brand-purple font-semibold px-4 py-2 rounded-full text-sm animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              {newCount} nueva{newCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Clock} label="Pendientes" value={stats.pending} color="amber-500" />
          <StatCard icon={CheckCircle2} label="Calificadas" value={stats.graded} color="green-500" />
          <StatCard icon={Calendar} label="Hoy" value={stats.today} color="brand-purple" />
          <StatCard icon={FileText} label="Total" value={stats.total} color="brand-cyan" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por estudiante, email o tarea..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => {
            const Icon = f.icon
            const active = filter === f.id
            const count = f.id === 'pending' ? stats.pending : f.id === 'graded' ? stats.graded : stats.total
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border whitespace-nowrap ${
                  active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">
              {filter === 'pending' ? '¡Todo al día!' : 'Sin resultados'}
            </h3>
            <p className="text-slate-500 text-sm">
              {filter === 'pending'
                ? 'No hay entregas pendientes por calificar'
                : 'No hay entregas que coincidan con tu búsqueda'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => (
              <SubmissionRow
                key={sub.id}
                submission={sub}
                task={tasks[sub.taskId]}
                onClick={() => setSelected(sub)}
              />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <GradingSheet
          submission={selected}
          task={tasks[selected.taskId]}
          gradedBy={user.name}
          onClose={() => setSelected(null)}
          onGraded={() => {
            setSelected(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <p className="text-slate-500 text-xs font-medium">{label}</p>
      <p className="text-slate-900 text-2xl font-black">{value}</p>
    </div>
  )
}

function SubmissionRow({ submission, task, onClick }: { submission: Submission; task?: Task; onClick: () => void }) {
  const isGraded = submission.status === 'graded'
  const initial = submission.studentName?.[0]?.toUpperCase() || '?'
  const timeAgo = formatTimeAgo(submission.submittedAt)
  const hasAttachments = submission.attachmentUrls?.length > 0

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-lg hover:border-brand-purple/40 transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 ${
          isGraded ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-brand-purple to-brand-violet'
        }`}>
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-slate-900 truncate">{submission.studentName || 'Sin nombre'}</p>
            {isGraded && submission.grade != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                {submission.grade}/100
              </span>
            )}
          </div>
          <p className="text-slate-600 text-sm truncate mb-1">
            {task?.title || <span className="text-slate-400 italic">Tarea desconocida</span>}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            {hasAttachments && (
              <span className="flex items-center gap-1 text-brand-cyan">
                <ImageIcon className="w-3 h-3" />
                {submission.attachmentUrls.length} archivo{submission.attachmentUrls.length > 1 ? 's' : ''}
              </span>
            )}
            {submission.code && (
              <span className="flex items-center gap-1 text-purple-600">
                <FileText className="w-3 h-3" />
                Código
              </span>
            )}
            {!isGraded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
                Pendiente
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-purple group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </button>
  )
}

function GradingSheet({ submission, task, gradedBy, onClose, onGraded }: {
  submission: Submission
  task?: Task
  gradedBy: string
  onClose: () => void
  onGraded: () => void
}) {
  const [grade, setGrade] = useState<number>(submission.grade ?? 100)
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          grade,
          feedback,
          status: 'graded',
          gradedBy,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al calificar')
      onGraded()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl max-h-[94vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Handle mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-violet flex items-center justify-center text-white font-bold shrink-0">
              {submission.studentName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-lg truncate">{submission.studentName}</h2>
              <p className="text-slate-500 text-sm truncate">{task?.title || 'Tarea desconocida'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Submission details */}
          {submission.output && (
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Respuestas</p>
              <div className="bg-slate-50 rounded-2xl p-4 whitespace-pre-wrap text-slate-800 text-sm leading-relaxed">
                {submission.output}
              </div>
            </div>
          )}

          {submission.code && (
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Código</p>
              <pre className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs overflow-x-auto font-mono">
                {submission.code}
              </pre>
            </div>
          )}

          {submission.attachmentUrls?.length > 0 && (
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Archivos adjuntos ({submission.attachmentUrls.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {submission.attachmentUrls.map((url, i) => {
                  const isImg = /\.(jpg|jpeg|png|gif|webp)/i.test(url)
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-brand-purple transition-all"
                    >
                      {isImg ? (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-500">
                          <FileText className="w-8 h-8" />
                          <span className="text-xs font-medium">Archivo {i + 1}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grading panel */}
          <div className="bg-gradient-to-br from-brand-purple/5 to-brand-violet/5 border border-brand-purple/20 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-purple" />
              <h3 className="font-bold text-slate-900">Calificar</h3>
              {task?.points && (
                <span className="text-xs text-slate-500 ml-auto">Tarea vale {task.points} pts</span>
              )}
            </div>

            {/* Slider de nota */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Nota</label>
                <span className="text-3xl font-black text-brand-purple">{grade}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-purple"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Quick grades */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rápidos</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_GRADES.map(qg => (
                  <button
                    key={qg.value}
                    onClick={() => setGrade(qg.value)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      grade === qg.value
                        ? 'bg-slate-900 text-white border-slate-900 scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{qg.label}</span>
                    {qg.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-purple" />
                Comentarios
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Escribe tu retroalimentación al estudiante..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none"
              />

              {/* Quick feedback chips */}
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_FEEDBACK.map(fb => (
                  <button
                    key={fb}
                    onClick={() => setFeedback(prev => prev ? `${prev}\n${fb}` : fb)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:border-brand-purple hover:text-brand-purple transition-all"
                  >
                    {fb}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 bg-white flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 rounded-2xl shadow-lg shadow-brand-purple/30 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {submission.status === 'graded' ? 'Actualizar calificación' : 'Calificar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Ahora'
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}d`
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
