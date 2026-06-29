'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Save, Trash2, Search, Loader2, Building2,
  Users, GraduationCap, MapPin, Phone, Mail, Hash, BookMarked,
  CheckCircle2, AlertCircle, X, Plus as PlusIcon, Calendar,
  Clock, UserCheck, Sparkles
} from 'lucide-react'

interface School {
  id: string
  name: string
  code: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  maxStudents: number
  maxTeachers: number
  createdAt?: string
}

interface Course {
  id: string
  name: string
  description: string
  levelId: string
  programId: string
  icon: string
  color: string
  modality: string
  isActive: boolean
}

interface SchoolCourse {
  id: string
  schoolId: string
  courseId: string
  customName: string
  classroom: string
  schedule: string
  academicYear: string
  startDate: string | null
  endDate: string | null
  maxStudents: number
  teacherName: string
  notes: string
  isActive: boolean
  course?: any
}

const BLANK_SCHOOL: Omit<School, 'id'> = {
  name: '', code: '', address: '', city: '', country: 'Ecuador',
  phone: '', email: '', maxStudents: 100, maxTeachers: 10,
}

const PROGRAM_COLORS: Record<string, string> = {
  robotica: 'from-violet-500 to-purple-500',
  ia: 'from-pink-500 to-rose-500',
  hacking: 'from-emerald-500 to-green-500',
}

export default function ColegiosPage() {
  const router = useRouter()
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth()

  const [schools, setSchools] = useState<School[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schoolCourses, setSchoolCourses] = useState<SchoolCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ ...BLANK_SCHOOL })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login?redirect=/admin/colegios')
  }, [isLoading, isAuthenticated, isAdmin, router])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [schoolsRes, coursesRes, scRes] = await Promise.all([
        fetch('/api/schools').then(r => r.json()),
        fetch('/api/courses').then(r => r.json()),
        fetch('/api/school-courses').then(r => r.json())
      ])
      setSchools(schoolsRes.schools || [])
      setCourses(coursesRes.courses || [])
      setSchoolCourses(scRes.items || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Sync form
  useEffect(() => {
    if (isCreating) {
      setForm({ ...BLANK_SCHOOL })
      setDirty(false)
      return
    }
    const s = schools.find(x => x.id === selectedSchoolId)
    if (s) {
      setForm({
        name: s.name, code: s.code, address: s.address, city: s.city,
        country: s.country, phone: s.phone, email: s.email,
        maxStudents: s.maxStudents, maxTeachers: s.maxTeachers,
      })
      setDirty(false)
    }
  }, [selectedSchoolId, isCreating, schools])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!form.name) return showToast('error', 'El nombre es obligatorio')
    setSaving(true)
    try {
      if (isCreating) {
        const res = await fetch('/api/schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error')
        showToast('success', 'Colegio creado')
        await loadAll()
        setIsCreating(false)
        setSelectedSchoolId(data.school?.id || null)
      } else {
        const res = await fetch('/api/schools', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedSchoolId, ...form }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error')
        showToast('success', 'Guardado')
        await loadAll()
      }
      setDirty(false)
    } catch (e: any) {
      showToast('error', e.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedSchoolId || !confirm('¿Eliminar este colegio y todas sus asignaciones de cursos?')) return
    try {
      await fetch(`/api/schools?id=${selectedSchoolId}`, { method: 'DELETE' })
      showToast('success', 'Colegio eliminado')
      setSelectedSchoolId(null)
      loadAll()
    } catch {
      showToast('error', 'Error al eliminar')
    }
  }

  const handleUnassignCourse = async (assignmentId: string) => {
    if (!confirm('¿Quitar este curso del colegio?')) return
    try {
      await fetch(`/api/school-courses?id=${assignmentId}`, { method: 'DELETE' })
      showToast('success', 'Curso desasignado')
      loadAll()
    } catch {
      showToast('error', 'Error')
    }
  }

  const filteredSchools = useMemo(() => {
    return schools.filter(s =>
      !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase())
    )
  }, [schools, search])

  const selectedSchool = schools.find(s => s.id === selectedSchoolId)
  const assignedCourses = useMemo(() => {
    return schoolCourses.filter(sc => sc.schoolId === selectedSchoolId)
  }, [schoolCourses, selectedSchoolId])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    )
  }

  const hasSelection = isCreating || selectedSchoolId

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900">Colegios y Cursos</h1>
            <p className="text-xs text-slate-500">{schools.length} colegios · {courses.length} cursos en catálogo · {schoolCourses.length} asignaciones</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/cursos"
            className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-full text-sm transition-all"
          >
            <BookMarked className="w-4 h-4" />
            Catálogo de cursos
          </Link>
          <button
            onClick={() => { setIsCreating(true); setSelectedSchoolId(null) }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm hover:shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo colegio</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LIST */}
        <aside className={`${hasSelection ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 lg:w-[400px] border-r border-slate-200 bg-white shrink-0`}>
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar colegio o ciudad..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-700 font-semibold mb-1">Sin colegios</p>
                <p className="text-slate-500 text-sm">Crea tu primer colegio</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredSchools.map(s => {
                  const courseCount = schoolCourses.filter(sc => sc.schoolId === s.id).length
                  return (
                    <SchoolItem
                      key={s.id}
                      school={s}
                      courseCount={courseCount}
                      active={selectedSchoolId === s.id}
                      onClick={() => { setSelectedSchoolId(s.id); setIsCreating(false) }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        {/* DETAIL */}
        <main className={`${hasSelection ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {!hasSelection ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-purple/20 to-brand-violet/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-brand-purple" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Selecciona un colegio</h2>
                <p className="text-slate-500 text-sm mb-5">
                  Elige un colegio para ver y gestionar sus cursos asignados.
                </p>
              </div>
            </div>
          ) : (
            <SchoolEditor
              form={form}
              setField={update}
              dirty={dirty}
              saving={saving}
              isCreating={isCreating}
              school={selectedSchool}
              assignedCourses={assignedCourses}
              courses={courses}
              onClose={() => { setSelectedSchoolId(null); setIsCreating(false) }}
              onSave={handleSave}
              onDelete={handleDelete}
              onAssignClick={() => setShowAssignModal(true)}
              onUnassign={handleUnassignCourse}
            />
          )}
        </main>
      </div>

      {/* Assign course modal */}
      {showAssignModal && selectedSchoolId && (
        <AssignCourseModal
          schoolId={selectedSchoolId}
          schoolName={selectedSchool?.name || ''}
          courses={courses}
          existingAssignments={assignedCourses}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            setShowAssignModal(false)
            loadAll()
            showToast('success', 'Curso asignado')
          }}
          onError={(msg: string) => showToast('error', msg)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-slate-900/90 text-white' : 'bg-red-500/95 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function SchoolItem({ school, courseCount, active, onClick }: { school: School; courseCount: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-3 flex items-center gap-3 transition-colors text-left ${
        active ? 'bg-brand-purple/10 border-r-2 border-brand-purple' : 'hover:bg-slate-50'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        active ? 'bg-gradient-to-br from-brand-purple to-brand-violet text-white' : 'bg-slate-100 text-slate-600'
      }`}>
        <Building2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${active ? 'text-brand-purple' : 'text-slate-900'}`}>{school.name}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
          {school.city && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3" />
              {school.city}
            </span>
          )}
          {courseCount > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple font-bold">
              <BookMarked className="w-3 h-3" />
              {courseCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function SchoolEditor({ form, setField, dirty, saving, isCreating, school, assignedCourses, courses, onClose, onSave, onDelete, onAssignClick, onUnassign }: any) {
  return (
    <>
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button onClick={onClose} className="md:hidden w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Building2 className="w-5 h-5 text-brand-purple shrink-0" />
          <h2 className="font-bold text-slate-900 truncate">
            {isCreating ? 'Nuevo colegio' : form.name || 'Editando...'}
          </h2>
          {dirty && <span className="text-xs text-amber-600 font-medium shrink-0">• Sin guardar</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isCreating && (
            <button onClick={onDelete} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-semibold px-4 py-2 rounded-full text-sm shadow-md disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isCreating ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Nombre del colegio"
            className="w-full text-2xl sm:text-3xl font-black bg-transparent text-slate-900 placeholder-slate-300 border-none focus:outline-none"
          />

          {/* Datos básicos */}
          <FieldBlock label="Información general" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldCompact label="Código"><input type="text" value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="CHASKI-001" className={selectClass} /></FieldCompact>
              <FieldCompact label="Email"><input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={selectClass} /></FieldCompact>
              <FieldCompact label="Teléfono"><input type="text" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={selectClass} /></FieldCompact>
              <FieldCompact label="Ciudad"><input type="text" value={form.city} onChange={(e) => setField('city', e.target.value)} className={selectClass} /></FieldCompact>
              <FieldCompact label="País"><input type="text" value={form.country} onChange={(e) => setField('country', e.target.value)} className={selectClass} /></FieldCompact>
              <FieldCompact label="Dirección"><input type="text" value={form.address} onChange={(e) => setField('address', e.target.value)} className={selectClass} /></FieldCompact>
            </div>
          </FieldBlock>

          <FieldBlock label="Capacidad" icon={Users}>
            <div className="grid grid-cols-2 gap-3">
              <FieldCompact label="Max. estudiantes"><input type="number" value={form.maxStudents} onChange={(e) => setField('maxStudents', parseInt(e.target.value) || 0)} className={selectClass} /></FieldCompact>
              <FieldCompact label="Max. profesores"><input type="number" value={form.maxTeachers} onChange={(e) => setField('maxTeachers', parseInt(e.target.value) || 0)} className={selectClass} /></FieldCompact>
            </div>
          </FieldBlock>

          {/* Cursos asignados (solo en modo edición) */}
          {!isCreating && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-brand-purple" />
                  <h3 className="font-bold text-slate-900 text-sm">Cursos asignados ({assignedCourses.length})</h3>
                </div>
                <button
                  onClick={onAssignClick}
                  className="flex items-center gap-1.5 bg-brand-purple text-white text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-brand-purple/90 active:scale-95 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Asignar curso
                </button>
              </div>

              {assignedCourses.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Este colegio aún no tiene cursos asignados</p>
                  <button
                    onClick={onAssignClick}
                    className="mt-3 text-brand-purple text-sm font-semibold hover:underline"
                  >
                    Asignar el primer curso
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedCourses.map((sc: SchoolCourse) => (
                    <AssignedCourseRow
                      key={sc.id}
                      assignment={sc}
                      onUnassign={() => onUnassign(sc.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function AssignedCourseRow({ assignment, onUnassign }: { assignment: SchoolCourse; onUnassign: () => void }) {
  const c = assignment.course
  const icon = c?.icon || '📚'
  const programId = c?.program_id || ''
  const color = PROGRAM_COLORS[programId] || 'from-slate-400 to-slate-500'
  const courseName = assignment.customName || c?.name || 'Curso'

  return (
    <div className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-brand-purple/40 hover:bg-slate-50 transition-all">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm truncate">{courseName}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
          {assignment.classroom && (
            <span className="inline-flex items-center gap-0.5">
              <Hash className="w-3 h-3" />
              {assignment.classroom}
            </span>
          )}
          {assignment.academicYear && (
            <span className="inline-flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {assignment.academicYear}
            </span>
          )}
          {assignment.teacherName && (
            <span className="inline-flex items-center gap-0.5">
              <UserCheck className="w-3 h-3" />
              {assignment.teacherName}
            </span>
          )}
          {assignment.schedule && (
            <span className="inline-flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {assignment.schedule}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onUnassign}
        className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500 opacity-60 group-hover:opacity-100 transition-all"
        title="Desasignar curso"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function AssignCourseModal({ schoolId, schoolName, courses, existingAssignments, onClose, onAssigned, onError }: any) {
  const [step, setStep] = useState<'pick' | 'details'>('pick')
  const [pickedCourseId, setPickedCourseId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [details, setDetails] = useState({
    customName: '',
    classroom: '',
    schedule: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    teacherName: '',
    maxStudents: 30,
    notes: '',
  })

  const filteredCourses = useMemo(() => {
    return courses.filter((c: Course) =>
      !search || c.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [courses, search])

  const handleAssign = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/school-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          courseId: pickedCourseId,
          ...details,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      onAssigned()
    } catch (e: any) {
      onError(e.message)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl max-h-[94vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
        </div>

        <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-lg truncate">
              {step === 'pick' ? 'Asignar curso' : 'Detalles de asignación'}
            </h2>
            <p className="text-slate-500 text-sm truncate">{schoolName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {step === 'pick' ? (
          <>
            <div className="px-6 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar curso..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-3">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">No hay cursos en el catálogo. <Link href="/admin/cursos" className="text-brand-purple font-semibold">Crear cursos</Link></p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCourses.map((c: Course) => {
                    const alreadyAssigned = existingAssignments.some((sc: SchoolCourse) => sc.courseId === c.id)
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setPickedCourseId(c.id); setStep('details') }}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                          pickedCourseId === c.id
                            ? 'border-brand-purple bg-brand-purple/5'
                            : 'border-slate-200 hover:border-brand-purple/40'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${PROGRAM_COLORS[c.programId] || 'from-slate-400 to-slate-500'} flex items-center justify-center text-xl shrink-0`}>
                          {c.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                          <p className="text-xs text-slate-500 truncate">{c.description}</p>
                        </div>
                        {alreadyAssigned && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full shrink-0">
                            Ya asignado
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <p className="text-sm text-slate-500 mb-3">
                Puedes asignar el mismo curso múltiples veces con diferentes paralelos/horarios.
              </p>
              <FieldCompact label="Nombre personalizado (opcional)">
                <input type="text" value={details.customName} onChange={(e) => setDetails(p => ({ ...p, customName: e.target.value }))} placeholder="Ej: Robótica 6to A Matutina" className={selectClass} />
              </FieldCompact>
              <div className="grid grid-cols-2 gap-3">
                <FieldCompact label="Paralelo / Aula">
                  <input type="text" value={details.classroom} onChange={(e) => setDetails(p => ({ ...p, classroom: e.target.value }))} placeholder="6to A" className={selectClass} />
                </FieldCompact>
                <FieldCompact label="Año académico">
                  <input type="text" value={details.academicYear} onChange={(e) => setDetails(p => ({ ...p, academicYear: e.target.value }))} placeholder="2025-2026" className={selectClass} />
                </FieldCompact>
                <FieldCompact label="Horario">
                  <input type="text" value={details.schedule} onChange={(e) => setDetails(p => ({ ...p, schedule: e.target.value }))} placeholder="Lun/Mié 14h-15h" className={selectClass} />
                </FieldCompact>
                <FieldCompact label="Max. estudiantes">
                  <input type="number" value={details.maxStudents} onChange={(e) => setDetails(p => ({ ...p, maxStudents: parseInt(e.target.value) || 0 }))} className={selectClass} />
                </FieldCompact>
              </div>
              <FieldCompact label="Profesor asignado">
                <input type="text" value={details.teacherName} onChange={(e) => setDetails(p => ({ ...p, teacherName: e.target.value }))} placeholder="Nombre del profesor" className={selectClass} />
              </FieldCompact>
              <FieldCompact label="Notas">
                <textarea rows={2} value={details.notes} onChange={(e) => setDetails(p => ({ ...p, notes: e.target.value }))} className={inputClass + ' resize-none'} />
              </FieldCompact>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={() => setStep('pick')} className="px-5 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100">
                Atrás
              </button>
              <button
                onClick={handleAssign}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold py-3 rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Asignar curso
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FieldCompact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function FieldBlock({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-brand-purple" />}
        <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
      </div>
      {children}
    </div>
  )
}

const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all'
const selectClass = 'w-full px-3 py-2 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-brand-purple'
