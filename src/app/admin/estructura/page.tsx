'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, GraduationCap, Plus, School, Trash2, UserRound, Users, X } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface Ref { id: string; name: string }
interface TeacherLink { assignmentId: string; teacherId: string; name: string; programIds: string[] }
interface Group {
  id: string
  name: string
  levelId: string
  schoolId: string
  isActive: boolean
  programIds: string[]
  teachers: TeacherLink[]
  students: { id: string; name: string; isActive: boolean }[]
}
interface SchoolRef extends Ref { kitCourses?: { id: string; name: string; levelId: string }[] }
interface Estructura {
  migrated: boolean
  schools: SchoolRef[]
  levels: Ref[]
  programs: Ref[]
  groups: Group[]
  teachers: Ref[]
  unassignedStudents: { id: string; name: string; levelId: string; schoolId: string; reason: string }[]
}

const NO_SCHOOL = '__sin_colegio__'

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])

function ProgramChips({ programs, selected, onToggle, disabled }: {
  programs: Ref[]
  selected: string[]
  onToggle: (id: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {programs.map(p => {
        const on = selected.includes(p.id)
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(p.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 disabled:opacity-50 ${
              on
                ? 'bg-chaski-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {p.name}
          </button>
        )
      })}
    </div>
  )
}

export default function EstructuraPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const [data, setData] = useState<Estructura | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [newGroup, setNewGroup] = useState<{ schoolId: string; name: string; levelId: string } | null>(null)
  const [teacherPick, setTeacherPick] = useState<Record<string, string>>({})
  const [openTeacher, setOpenTeacher] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.push('/login?redirect=/admin/estructura')
    else if (!isAdmin) router.push('/admin')
  }, [isLoading, isAuthenticated, isAdmin, router])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/estructura')
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'No se pudo cargar la estructura')
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    }
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const send = async (url: string, method: string, body: Record<string, unknown>) => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'No se pudo guardar')
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
      return false
    } finally {
      setSaving(false)
    }
  }
  const act = (body: Record<string, unknown>) => send('/api/admin/estructura', 'POST', body)

  const levelName = useMemo(() => {
    const map = new Map((data?.levels || []).map(l => [l.id, l.name]))
    return (id: string) => map.get(id) || id || 'Sin nivel'
  }, [data])

  // Los niveles llegan ordenados por grado (Inicial 1 → 3ro BGU).
  const levelOrder = useMemo(() => {
    const map = new Map((data?.levels || []).map((l, i) => [l.id, i]))
    return (id: string) => map.get(id) ?? 999
  }, [data])

  const sections = useMemo(() => {
    if (!data) return []
    const known = new Set(data.schools.map(s => s.id))
    const list = data.schools.map(s => ({ ...s, groups: data.groups.filter(g => g.schoolId === s.id) }))
    const orphans = data.groups.filter(g => !known.has(g.schoolId))
    if (orphans.length > 0) list.push({ id: NO_SCHOOL, name: 'Grupos sin colegio', kitCourses: [], groups: orphans })
    return list
  }, [data])

  // Opciones de grupo agrupadas por colegio: varios colegios tienen grupos
  // del mismo nivel y con la lista plana no se distinguían.
  const groupOptions = (exclude?: string) =>
    sections.map(s => {
      const list = s.groups.filter(g => g.id !== exclude)
      if (list.length === 0) return null
      return (
        <optgroup key={s.id} label={s.name}>
          {list.map(g => <option key={g.id} value={g.id}>{g.name} · {levelName(g.levelId)}</option>)}
        </optgroup>
      )
    })

  const createGroup = async () => {
    if (!newGroup || !newGroup.name.trim() || !newGroup.levelId) return
    const school = data?.schools.find(s => s.id === newGroup.schoolId)
    const ok = await send('/api/admin/courses', 'POST', {
      name: newGroup.name.trim(),
      levelId: newGroup.levelId,
      schoolId: school?.id,
      schoolName: school?.name,
    })
    if (ok) setNewGroup(null)
  }

  if (isLoading || !isAdmin || (!data && !error)) {
    return (
      <div className="min-h-screen bg-chaski-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-chaski-primary border-t-transparent" />
      </div>
    )
  }

  const totalStudents = data ? data.groups.reduce((n, g) => n + g.students.length, 0) : 0

  return (
    <div className="min-h-screen bg-chaski-light animate-fade-in">
      <header className="sticky top-0 z-10 bg-chaski-light/80 backdrop-blur-xl border-b border-border-soft">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="p-2 -ml-2 rounded-full text-chaski-primary hover:bg-chaski-primary/10 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-chaski-dark leading-tight">Estructura académica</h1>
            <p className="text-xs text-slate-500">Colegios, grupos, programas y docentes</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {data && !data.migrated && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl px-4 py-3">
            Para guardar programas por grupo y por docente falta ejecutar en Supabase la migración
            <span className="font-mono text-xs"> 2026_10_estructura_academica_paso1.sql</span>.
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Colegios', value: data.schools.length, icon: School },
                { label: 'Grupos', value: data.groups.length, icon: GraduationCap },
                { label: 'Docentes', value: data.teachers.length, icon: UserRound },
                { label: 'Estudiantes en grupo', value: totalStudents, icon: Users },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-border-soft px-4 py-3">
                  <s.icon className="w-4 h-4 text-chaski-primary mb-2" />
                  <p className="text-2xl font-semibold text-chaski-dark leading-none">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {data.teachers.length > 0 && (
              <section className="bg-white rounded-2xl border border-border-soft overflow-hidden">
                <div className="px-4 py-3 border-b border-border-soft">
                  <h2 className="text-sm font-semibold text-chaski-dark">Docentes y sus grados</h2>
                  <p className="text-xs text-slate-500">Toca un docente y marca los grados que enseña en cada colegio.</p>
                </div>
                <ul className="divide-y divide-border-soft">
                  {data.teachers.map(t => {
                    const open = openTeacher === t.id
                    const assigned = data.groups.filter(g => g.teachers.some(x => x.teacherId === t.id))
                    return (
                      <li key={t.id}>
                        <button
                          onClick={() => setOpenTeacher(open ? null : t.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          <UserRound className="w-4 h-4 text-chaski-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-chaski-dark truncate">{t.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {assigned.length === 0 ? 'Sin grados asignados' : assigned.map(g => g.name).join(', ')}
                            </p>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>
                        {open && (
                          <div className="px-4 pb-4 pt-1 space-y-3 bg-slate-50/60">
                            {sections.filter(s => s.groups.length > 0).map(s => (
                              <div key={s.id}>
                                <p className="text-xs font-medium text-slate-500 mb-1.5">{s.name}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {[...s.groups].sort((a, b) => levelOrder(a.levelId) - levelOrder(b.levelId)).map(g => {
                                    const link = g.teachers.find(x => x.teacherId === t.id)
                                    return (
                                      <button
                                        key={g.id}
                                        type="button"
                                        disabled={saving}
                                        onClick={() => link
                                          ? act({ action: 'unassignTeacher', assignmentId: link.assignmentId })
                                          : act({ action: 'assignTeacher', groupId: g.id, teacherId: t.id, programIds: g.programIds })}
                                        title={link ? 'Quitar este grado' : 'Asignar este grado'}
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 disabled:opacity-50 ${
                                          link ? 'bg-chaski-primary text-white shadow-sm' : 'bg-white border border-border-soft text-slate-500 hover:bg-slate-100'
                                        }`}
                                      >
                                        {link ? '✓' : '+'} {g.name}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                            <p className="text-[11px] text-slate-400">Al asignar un grado, el docente enseña todos los programas activos de ese grupo. Puedes afinarlo abriendo el grupo abajo.</p>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {data.unassignedStudents.length > 0 && (
              <section className="bg-white rounded-2xl border border-border-soft overflow-hidden">
                <div className="px-4 py-3 border-b border-border-soft">
                  <h2 className="text-sm font-semibold text-chaski-dark">Estudiantes por ubicar ({data.unassignedStudents.length})</h2>
                  <p className="text-xs text-slate-500">Sin grupo, o en un grupo de otro colegio o nivel. Asígnalos al grupo correcto: su colegio y nivel se toman del grupo.</p>
                </div>
                <ul className="divide-y divide-border-soft">
                  {data.unassignedStudents.map(s => (
                    <li key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-chaski-dark truncate">{s.name}</p>
                        <p className="text-xs text-slate-400">{levelName(s.levelId)} · {data.schools.find(x => x.id === s.schoolId)?.name || 'sin colegio'} · <span className="text-amber-700">{s.reason}</span></p>
                      </div>
                      <select
                        disabled={saving}
                        value=""
                        onChange={e => e.target.value && act({ action: 'moveStudent', userId: s.id, groupId: e.target.value })}
                        className="text-sm bg-slate-100 rounded-full px-3 py-1.5 text-slate-600 border-0 focus:ring-2 focus:ring-chaski-primary/30"
                      >
                        <option value="">Asignar a grupo…</option>
                        {groupOptions()}
                      </select>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {sections.map(school => (
              <section key={school.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{school.name}</h2>
                  {school.id !== NO_SCHOOL && (
                    <button
                      onClick={() => setNewGroup({ schoolId: school.id, name: '', levelId: '' })}
                      className="flex items-center gap-1 text-sm font-medium text-chaski-primary hover:opacity-80 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Nuevo grupo
                    </button>
                  )}
                </div>

                {(school.kitCourses?.length || 0) > 0 && (
                  <div className="px-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-500">Cursos con kit:</span>
                    {school.kitCourses!.map(c => {
                      const hasGroup = school.groups.some(g => g.levelId === c.levelId)
                      if (hasGroup) {
                        return (
                          <span key={c.id} title="Hay un grupo de este nivel" className="text-[11px] rounded-full px-2 py-0.5 bg-slate-100 text-slate-600">
                            {c.name}
                          </span>
                        )
                      }
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={saving}
                          onClick={() => send('/api/admin/courses', 'POST', { name: c.name, levelId: c.levelId, schoolId: school.id, schoolName: school.name })}
                          title="Crear el grupo de este nivel para poder asignar docentes y estudiantes"
                          className="inline-flex items-center gap-0.5 text-[11px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" /> {c.name} · crear grupo
                        </button>
                      )
                    })}
                  </div>
                )}

                {newGroup?.schoolId === school.id && (
                  <div className="bg-white rounded-2xl border border-chaski-primary/30 p-4 flex flex-col sm:flex-row gap-2">
                    <input
                      autoFocus
                      placeholder="Nombre del grupo (ej. 8vo A)"
                      value={newGroup.name}
                      onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="flex-1 text-sm bg-slate-100 rounded-xl px-3 py-2 border-0 focus:ring-2 focus:ring-chaski-primary/30"
                    />
                    <select
                      value={newGroup.levelId}
                      onChange={e => setNewGroup({ ...newGroup, levelId: e.target.value })}
                      className="text-sm bg-slate-100 rounded-xl px-3 py-2 border-0 focus:ring-2 focus:ring-chaski-primary/30"
                    >
                      <option value="">Nivel…</option>
                      {data.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <button
                      onClick={createGroup}
                      disabled={saving || !newGroup.name.trim() || !newGroup.levelId}
                      className="px-4 py-2 rounded-xl bg-chaski-primary text-white text-sm font-medium disabled:opacity-40 active:scale-95 transition-all"
                    >
                      Crear
                    </button>
                    <button onClick={() => setNewGroup(null)} className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100">
                      Cancelar
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-border-soft divide-y divide-border-soft overflow-hidden">
                  {school.groups.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">Este colegio aún no tiene grupos.</p>}
                  {school.groups.map(g => {
                    const open = openGroup === g.id
                    const available = data.teachers.filter(t => !g.teachers.some(x => x.teacherId === t.id))
                    return (
                      <div key={g.id}>
                        <button
                          onClick={() => setOpenGroup(open ? null : g.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-chaski-dark truncate">{g.name}</p>
                            <p className="text-xs text-slate-500">
                              {levelName(g.levelId)} · {g.teachers.length} docente{g.teachers.length === 1 ? '' : 's'} · {g.students.length} estudiante{g.students.length === 1 ? '' : 's'}
                            </p>
                          </div>
                          {g.teachers.length === 0 && (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Sin docente</span>
                          )}
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>

                        {open && (
                          <div className="px-4 pb-4 pt-1 space-y-4 bg-slate-50/60">
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1.5">Programas del grupo</p>
                              <ProgramChips
                                programs={data.programs}
                                selected={g.programIds}
                                disabled={saving}
                                onToggle={id => act({ action: 'setGroupPrograms', groupId: g.id, programIds: toggle(g.programIds, id) })}
                              />
                            </div>

                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1.5">Docentes y qué enseñan aquí</p>
                              <div className="space-y-2">
                                {g.teachers.map(t => (
                                  <div key={t.assignmentId} className="bg-white rounded-xl border border-border-soft px-3 py-2 flex items-center gap-3">
                                    <p className="text-sm text-chaski-dark w-36 truncate">{t.name}</p>
                                    <div className="flex-1">
                                      <ProgramChips
                                        programs={data.programs.filter(p => g.programIds.includes(p.id))}
                                        selected={t.programIds}
                                        disabled={saving}
                                        onToggle={id => act({ action: 'assignTeacher', groupId: g.id, teacherId: t.teacherId, programIds: toggle(t.programIds, id) })}
                                      />
                                    </div>
                                    <button
                                      disabled={saving}
                                      onClick={() => act({ action: 'unassignTeacher', assignmentId: t.assignmentId })}
                                      className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                                      title="Quitar docente del grupo"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                {available.length > 0 && (
                                  <div className="flex gap-2">
                                    <select
                                      value={teacherPick[g.id] || ''}
                                      onChange={e => setTeacherPick({ ...teacherPick, [g.id]: e.target.value })}
                                      className="flex-1 text-sm bg-white rounded-xl px-3 py-2 border border-border-soft focus:ring-2 focus:ring-chaski-primary/30"
                                    >
                                      <option value="">Elegir docente…</option>
                                      {available.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <button
                                      disabled={saving || !teacherPick[g.id]}
                                      onClick={async () => {
                                        const ok = await act({ action: 'assignTeacher', groupId: g.id, teacherId: teacherPick[g.id], programIds: g.programIds })
                                        if (ok) setTeacherPick({ ...teacherPick, [g.id]: '' })
                                      }}
                                      className="px-4 py-2 rounded-xl bg-chaski-primary text-white text-sm font-medium disabled:opacity-40 active:scale-95 transition-all"
                                    >
                                      Asignar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1.5">Estudiantes ({g.students.length})</p>
                              {g.students.length === 0 ? (
                                <p className="text-sm text-slate-400">Ningún estudiante en este grupo.</p>
                              ) : (
                                <ul className="bg-white rounded-xl border border-border-soft divide-y divide-border-soft">
                                  {g.students.map(s => (
                                    <li key={s.id} className="px-3 py-2 flex items-center gap-3">
                                      <p className={`flex-1 text-sm truncate ${s.isActive ? 'text-chaski-dark' : 'text-slate-400 line-through'}`}>{s.name}</p>
                                      <select
                                        disabled={saving}
                                        value=""
                                        onChange={e => e.target.value && act({ action: 'moveStudent', userId: s.id, groupId: e.target.value })}
                                        className="text-xs bg-slate-100 rounded-full px-2.5 py-1 text-slate-500 border-0"
                                      >
                                        <option value="">Mover a…</option>
                                        {groupOptions(g.id)}
                                      </select>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="pt-1">
                              <button
                                disabled={saving || g.students.length > 0 || g.teachers.length > 0}
                                onClick={() => { if (window.confirm(`¿Eliminar el grupo "${g.name}"?`)) send('/api/admin/courses', 'DELETE', { courseId: g.id }) }}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 disabled:text-slate-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar grupo
                              </button>
                              {(g.students.length > 0 || g.teachers.length > 0) && (
                                <p className="text-[11px] text-slate-400 mt-1">Para eliminarlo, primero quita sus docentes y mueve sus estudiantes.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
