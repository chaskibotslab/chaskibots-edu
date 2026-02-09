'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Save, X, Users, Loader2, RefreshCw, 
  BookOpen, GraduationCap, School, Check
} from 'lucide-react'
import { EDUCATION_LEVELS } from '@/lib/constants'

interface Teacher {
  id: string
  accessCode: string
  name: string
  email?: string
  schoolId?: string
  schoolName?: string
}

interface Course {
  id: string
  name: string
  levelId: string
}

interface TeacherCourse {
  id: string
  recordId: string
  teacherId: string
  teacherName: string
  courseId: string
  courseName: string
  levelId: string
  schoolId: string
  schoolName: string
}

interface School {
  id: string
  name: string
  code: string
}

export default function TeacherCoursesManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [assignments, setAssignments] = useState<TeacherCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Estado para el formulario de asignación
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  
  // Filtros
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, coursesRes, programsRes, schoolsRes, assignmentsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/programs'),
        fetch('/api/schools'),
        fetch('/api/teacher-courses')
      ])
      
      const usersData = await usersRes.json()
      const coursesData = await coursesRes.json()
      const programsData = await programsRes.json()
      const schoolsData = await schoolsRes.json()
      const assignmentsData = await assignmentsRes.json()
      
      // Filtrar solo profesores
      if (usersData.users) {
        const teachersList = usersData.users.filter((u: any) => u.role === 'teacher')
        setTeachers(teachersList)
      }
      
      // Combinar cursos y programas
      const allCourses: Course[] = []
      
      if (coursesData.courses) {
        coursesData.courses.forEach((c: any) => {
          allCourses.push({
            id: c.id,
            name: c.name,
            levelId: c.levelId || ''
          })
        })
      }
      
      // Agregar programas como cursos asignables
      if (programsData.programs) {
        programsData.programs.forEach((p: any) => {
          // Evitar duplicados por ID
          if (!allCourses.find(c => c.id === p.id)) {
            allCourses.push({
              id: p.id,
              name: p.name,
              levelId: p.levelId || ''
            })
          }
        })
      }
      
      setCourses(allCourses)
      
      if (schoolsData.success && schoolsData.schools) {
        setSchools(schoolsData.schools)
      }
      
      if (assignmentsData.success && assignmentsData.assignments) {
        setAssignments(assignmentsData.assignments)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  // Obtener cursos asignados a un profesor
  const getTeacherCourses = (teacherId: string) => {
    return assignments.filter(a => a.teacherId === teacherId)
  }

  // Manejar selección de profesor
  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacher(teacherId)
    // Cargar cursos ya asignados
    const currentAssignments = getTeacherCourses(teacherId)
    setSelectedCourses(currentAssignments.map(a => a.courseId))
  }

  // Toggle curso en la selección
  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  // Guardar asignaciones
  const handleSaveAssignments = async () => {
    if (!selectedTeacher) return
    
    setSaving(true)
    try {
      const teacher = teachers.find(t => t.accessCode === selectedTeacher)
      if (!teacher) {
        alert('Profesor no encontrado')
        setSaving(false)
        return
      }

      const currentAssignments = getTeacherCourses(selectedTeacher)
      const currentCourseIds = currentAssignments.map(a => a.courseId)
      
      // Cursos a agregar (están seleccionados pero no asignados)
      const toAdd = selectedCourses.filter(cId => !currentCourseIds.includes(cId))
      
      // Cursos a eliminar (están asignados pero no seleccionados)
      const toRemove = currentAssignments.filter(a => !selectedCourses.includes(a.courseId))

      // Agregar nuevas asignaciones
      for (const courseId of toAdd) {
        const course = courses.find(c => c.id === courseId)
        if (course) {
          await fetch('/api/teacher-courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teacherId: teacher.accessCode,
              teacherName: teacher.name,
              courseId: course.id,
              courseName: course.name,
              levelId: course.levelId,
              schoolId: teacher.schoolId || '',
              schoolName: teacher.schoolName || ''
            })
          })
        }
      }

      // Eliminar asignaciones removidas
      for (const assignment of toRemove) {
        await fetch(`/api/teacher-courses?recordId=${assignment.recordId}`, {
          method: 'DELETE'
        })
      }

      await loadData()
      setShowForm(false)
      setSelectedTeacher('')
      setSelectedCourses([])
      alert('Asignaciones guardadas correctamente')
    } catch (error) {
      console.error('Error saving assignments:', error)
      alert('Error al guardar asignaciones')
    }
    setSaving(false)
  }

  // Eliminar una asignación individual
  const handleDeleteAssignment = async (assignment: TeacherCourse) => {
    if (!confirm(`¿Eliminar asignación de "${assignment.courseName}" para ${assignment.teacherName}?`)) {
      return
    }
    
    try {
      await fetch(`/api/teacher-courses?recordId=${assignment.recordId}`, {
        method: 'DELETE'
      })
      await loadData()
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

  // Filtrar asignaciones
  const filteredAssignments = assignments.filter(a => {
    if (filterSchool !== 'all' && a.schoolId !== filterSchool) return false
    if (filterTeacher !== 'all' && a.teacherId !== filterTeacher) return false
    return true
  })

  // Agrupar asignaciones por profesor
  const groupedByTeacher = filteredAssignments.reduce((acc, a) => {
    if (!acc[a.teacherId]) {
      acc[a.teacherId] = {
        teacherId: a.teacherId,
        teacherName: a.teacherName,
        schoolName: a.schoolName,
        courses: []
      }
    }
    acc[a.teacherId].courses.push(a)
    return acc
  }, {} as Record<string, { teacherId: string; teacherName: string; schoolName: string; courses: TeacherCourse[] }>)

  // Obtener nombre del nivel
  const getLevelName = (levelId: string) => {
    const level = EDUCATION_LEVELS.find(l => l.id === levelId)
    return level?.name || levelId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Asignación de Cursos a Profesores</h3>
          <p className="text-sm text-gray-400">
            {assignments.length} asignaciones · {teachers.length} profesores · {courses.length} cursos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (!showForm) {
                setSelectedTeacher('')
                setSelectedCourses([])
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancelar' : 'Asignar Cursos'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 flex-wrap">
        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
        >
          <option value="all">Todos los colegios</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
        >
          <option value="all">Todos los profesores</option>
          {teachers
            .filter(t => filterSchool === 'all' || t.schoolId === filterSchool)
            .map(teacher => (
              <option key={teacher.accessCode} value={teacher.accessCode}>{teacher.name}</option>
            ))}
        </select>
      </div>

      {/* Formulario de asignación */}
      {showForm && (
        <div className="bg-dark-800 rounded-xl p-6 border border-neon-cyan/30 space-y-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-cyan" />
            Asignar Cursos a Profesor
          </h4>
          
          {/* Selector de profesor */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Seleccionar Profesor</label>
            <select
              value={selectedTeacher}
              onChange={(e) => handleTeacherSelect(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
            >
              <option value="">-- Seleccionar profesor --</option>
              {teachers
                .filter(t => filterSchool === 'all' || t.schoolId === filterSchool)
                .map(teacher => (
                  <option key={teacher.accessCode} value={teacher.accessCode}>
                    {teacher.name} {teacher.schoolName ? `(${teacher.schoolName})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Multi-select de cursos */}
          {selectedTeacher && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Seleccionar Cursos (click para marcar/desmarcar)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-dark-700 rounded-lg border border-dark-600">
                {courses.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center py-4">No hay cursos disponibles</p>
                ) : (
                  courses.map(course => {
                    const isSelected = selectedCourses.includes(course.id)
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourse(course.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-neon-green/20 border border-neon-green/50 text-neon-green'
                            : 'bg-dark-600 border border-dark-500 text-gray-300 hover:bg-dark-500'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-neon-green border-neon-green' : 'border-gray-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-dark-900" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{course.name}</p>
                          <p className="text-xs opacity-70">{getLevelName(course.levelId)}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedCourses.length} curso(s) seleccionado(s)
              </p>
            </div>
          )}

          {/* Botón guardar */}
          {selectedTeacher && (
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setSelectedTeacher('')
                  setSelectedCourses([])
                }}
                className="px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAssignments}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Asignaciones
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista de asignaciones agrupadas por profesor */}
      <div className="space-y-4">
        {Object.keys(groupedByTeacher).length === 0 ? (
          <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-600">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay asignaciones de cursos</p>
            <p className="text-sm text-gray-500 mt-1">
              Usa el botón "Asignar Cursos" para comenzar
            </p>
          </div>
        ) : (
          Object.values(groupedByTeacher).map(group => (
            <div key={group.teacherId} className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
              {/* Header del profesor */}
              <div className="px-4 py-3 bg-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{group.teacherName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{group.teacherName}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <School className="w-3 h-3" />
                      {group.schoolName || 'Sin colegio'}
                      <span className="mx-1">·</span>
                      <span className="text-neon-cyan">{group.courses.length} curso(s)</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleTeacherSelect(group.teacherId)
                    setShowForm(true)
                  }}
                  className="px-3 py-1 text-sm bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors"
                >
                  Editar
                </button>
              </div>
              
              {/* Lista de cursos */}
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {group.courses.map(assignment => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg border border-dark-600"
                    >
                      <GraduationCap className="w-4 h-4 text-neon-cyan" />
                      <div>
                        <p className="text-sm text-white">{assignment.courseName}</p>
                        <p className="text-xs text-gray-500">{getLevelName(assignment.levelId)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAssignment(assignment)}
                        className="ml-2 p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Eliminar asignación"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
