'use client'

import { useState, useEffect, useMemo } from 'react'
import { EDUCATION_LEVELS } from '@/lib/constants'
import { useAuth } from '@/components/AuthProvider'

interface TeacherCourseAssignment {
  courseId: string
  levelId: string
  courseName: string
}

// Interfaces para datos de Airtable
interface Student {
  id: string
  name: string
  levelId: string
  courseId?: string
  email?: string
  createdAt: string
}

interface Grade {
  id: string
  studentId: string
  studentName: string
  lessonId: string
  levelId: string
  courseId?: string
  score: number
  feedback?: string
  taskId?: string
  submittedAt: string
  gradedAt?: string
  gradedBy?: string
}

interface GradeSummary {
  studentId: string
  studentName: string
  levelId: string
  totalGrades: number
  averageScore: number
  completedLessons: number
  lastActivity: string
}
import {
  Users, Plus, Edit, Trash2, Save, X, Search,
  GraduationCap, Award, FileText, Download, ChevronDown,
  ChevronRight, Star, TrendingUp, Clock, CheckCircle,
  AlertCircle, Filter, BarChart3, UserPlus, Send
} from 'lucide-react'
import SubmissionsPanel from './SubmissionsPanel'

type ViewMode = 'students' | 'grades' | 'summary' | 'submissions'

interface GradingPanelProps {
  initialLevelId?: string
}

export default function GradingPanel({ initialLevelId = '' }: GradingPanelProps) {
  const { user, isAdmin, isTeacher } = useAuth()
  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevelId)
  const [viewMode, setViewMode] = useState<ViewMode>('students')
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [summaries, setSummaries] = useState<GradeSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourseAssignment[]>([])
  
  // Modal states
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddGrade, setShowAddGrade] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  // Form states
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [newGradeScore, setNewGradeScore] = useState<number>(10)
  const [newGradeFeedback, setNewGradeFeedback] = useState('')
  const [newGradeLesson, setNewGradeLesson] = useState('')
  const [newGradeTaskId, setNewGradeTaskId] = useState('')

  // Sincronizar selectedLevel con initialLevelId cuando cambie
  useEffect(() => {
    if (initialLevelId && initialLevelId !== selectedLevel) {
      setSelectedLevel(initialLevelId)
    }
  }, [initialLevelId])

  // Cargar asignaciones de cursos para profesores
  useEffect(() => {
    async function loadTeacherCourses() {
      if (isTeacher && !isAdmin && user?.accessCode) {
        try {
          const res = await fetch(`/api/teacher-courses?teacherId=${user.accessCode}`)
          const data = await res.json()
          if (data.assignments && data.assignments.length > 0) {
            setTeacherCourses(data.assignments)
            // Si no hay nivel seleccionado y no viene de URL, usar el primero asignado
            if (!selectedLevel && !initialLevelId && data.assignments[0]?.levelId) {
              setSelectedLevel(data.assignments[0].levelId)
            }
          }
        } catch (error) {
          console.error('Error loading teacher courses:', error)
        }
      }
    }
    loadTeacherCourses()
  }, [isTeacher, isAdmin, user, initialLevelId])

  // Niveles permitidos para el usuario
  const allowedLevels = useMemo(() => {
    if (isAdmin) return EDUCATION_LEVELS
    if (isTeacher && teacherCourses.length > 0) {
      const allowedIds = new Set(teacherCourses.map(tc => tc.levelId))
      return EDUCATION_LEVELS.filter(l => allowedIds.has(l.id))
    }
    // Fallback: si viene levelId de la URL, mostrar ese nivel
    if (initialLevelId) {
      return EDUCATION_LEVELS.filter(l => l.id === initialLevelId)
    }
    // Fallback: usar levelId del usuario
    if (user?.levelId) {
      return EDUCATION_LEVELS.filter(l => l.id === user.levelId)
    }
    return []
  }, [isAdmin, isTeacher, teacherCourses, user, initialLevelId])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadData()
  }, [selectedLevel])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar calificaciones desde Airtable
      let gradesUrl = '/api/grades'
      const params = new URLSearchParams()
      
      if (selectedLevel) {
        params.append('levelId', selectedLevel)
      }
      
      // Si es profesor (no admin), filtrar por su schoolId y courseId
      if (isTeacher && !isAdmin) {
        if (user?.schoolId) {
          params.append('schoolId', user.schoolId)
        }
        if (user?.courseId) {
          params.append('courseId', user.courseId)
        }
      }
      
      if (params.toString()) {
        gradesUrl += `?${params.toString()}`
      }
      
      const gradesRes = await fetch(gradesUrl)
      const gradesData = await gradesRes.json()
      
      if (gradesData.success && gradesData.grades) {
        setGrades(gradesData.grades)
        
        // Generar lista de estudiantes únicos desde las calificaciones
        const uniqueStudents = new Map<string, Student>()
        gradesData.grades.forEach((g: Grade) => {
          if (g.studentName && !uniqueStudents.has(g.studentName)) {
            uniqueStudents.set(g.studentName, {
              id: g.studentId || g.studentName,
              name: g.studentName,
              levelId: g.levelId,
              courseId: g.courseId,
              createdAt: g.submittedAt
            })
          }
        })
        setStudents(Array.from(uniqueStudents.values()))
        
        // Generar resúmenes por estudiante
        const summaryMap = new Map<string, GradeSummary>()
        gradesData.grades.forEach((g: Grade) => {
          const key = g.studentName
          if (!summaryMap.has(key)) {
            summaryMap.set(key, {
              studentId: g.studentId || g.studentName,
              studentName: g.studentName,
              levelId: g.levelId,
              totalGrades: 0,
              averageScore: 0,
              completedLessons: 0,
              lastActivity: g.submittedAt
            })
          }
          const summary = summaryMap.get(key)!
          summary.totalGrades++
          summary.averageScore = ((summary.averageScore * (summary.totalGrades - 1)) + g.score) / summary.totalGrades
          summary.completedLessons++
          if (new Date(g.submittedAt) > new Date(summary.lastActivity)) {
            summary.lastActivity = g.submittedAt
          }
        })
        setSummaries(Array.from(summaryMap.values()))
      } else {
        setGrades([])
        setStudents([])
        setSummaries([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setGrades([])
      setStudents([])
      setSummaries([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !selectedLevel) return
    
    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName.trim(),
          levelId: selectedLevel,
          email: newStudentEmail.trim() || undefined
        })
      })
      
      setNewStudentName('')
      setNewStudentEmail('')
      setShowAddStudent(false)
      loadData()
    } catch (error) {
      alert('Error al agregar estudiante')
    }
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent || !newStudentName.trim()) return
    // Por ahora solo cerrar el modal - la edición se puede implementar después
    setEditingStudent(null)
    setNewStudentName('')
    setNewStudentEmail('')
  }

  const handleDeleteStudent = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      try {
        await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
        loadData()
      } catch (error) {
        alert('Error al eliminar estudiante')
      }
    }
  }

  const handleAddGrade = async () => {
    if (!selectedStudent || !newGradeLesson.trim()) return
    
    try {
      await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          lessonId: newGradeLesson.trim(),
          levelId: selectedStudent.levelId,
          score: newGradeScore,
          feedback: newGradeFeedback.trim() || undefined,
          taskId: newGradeTaskId.trim() || undefined,
          submittedAt: new Date().toISOString()
        })
      })
      
      setNewGradeScore(10)
      setNewGradeFeedback('')
      setNewGradeLesson('')
      setNewGradeTaskId('')
      setShowAddGrade(false)
      setSelectedStudent(null)
      loadData()
    } catch (error) {
      alert('Error al agregar calificación')
    }
  }

  const handleUpdateGrade = async () => {
    if (!editingGrade) return
    // Por ahora solo cerrar el modal
    setEditingGrade(null)
    setNewGradeScore(10)
    setNewGradeFeedback('')
  }

  const handleDeleteGrade = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta calificación?')) {
      try {
        await fetch(`/api/grades?id=${id}`, { method: 'DELETE' })
        loadData()
      } catch (error) {
        alert('Error al eliminar calificación')
      }
    }
  }

  const handleExportCSV = (type: 'students' | 'grades' | 'summary') => {
    // Generar archivo Excel-compatible (TSV con extensión .xls)
    // Usamos tabulador como separador que Excel interpreta correctamente
    let content = ''
    let filename = ''
    const levelName = EDUCATION_LEVELS.find(l => l.id === selectedLevel)?.name || 'Todos'
    const dateStr = new Date().toISOString().slice(0, 10)
    const SEP = '\t' // Tabulador para Excel
    
    if (type === 'students') {
      content = `Nombre${SEP}Nivel${SEP}Email${SEP}Promedio${SEP}Total Calificaciones\n`
      students.forEach(s => {
        const summary = summaries.find(sum => sum.studentName === s.name)
        const lvlName = EDUCATION_LEVELS.find(l => l.id === s.levelId)?.name || s.levelId
        content += `${s.name}${SEP}${lvlName}${SEP}${s.email || ''}${SEP}${summary?.averageScore.toFixed(1) || 'N/A'}${SEP}${summary?.totalGrades || 0}\n`
      })
      filename = `estudiantes_${levelName}_${dateStr}.xls`
    } else if (type === 'grades') {
      content = `Estudiante${SEP}Nivel${SEP}Tarea ID${SEP}Calificación${SEP}Feedback${SEP}Fecha Entrega${SEP}Fecha Calificación${SEP}Calificado Por\n`
      grades.forEach(g => {
        const levelNameG = EDUCATION_LEVELS.find(l => l.id === g.levelId)?.name || g.levelId
        const feedback = (g.feedback || '').replace(/\t/g, ' ').replace(/\n/g, ' ')
        content += `${g.studentName}${SEP}${levelNameG}${SEP}${g.taskId || g.lessonId}${SEP}${g.score}${SEP}${feedback}${SEP}${g.submittedAt}${SEP}${g.gradedAt || ''}${SEP}${g.gradedBy || ''}\n`
      })
      filename = `calificaciones_${levelName}_${dateStr}.xls`
    } else if (type === 'summary') {
      content = `Posición${SEP}Estudiante${SEP}Nivel${SEP}Promedio${SEP}Total Calificaciones${SEP}Lecciones Completadas${SEP}Última Actividad\n`
      const sortedSummaries = [...summaries].sort((a, b) => b.averageScore - a.averageScore)
      sortedSummaries.forEach((s, idx) => {
        const levelNameS = EDUCATION_LEVELS.find(l => l.id === s.levelId)?.name || s.levelId
        content += `${idx + 1}${SEP}${s.studentName}${SEP}${levelNameS}${SEP}${s.averageScore.toFixed(1)}${SEP}${s.totalGrades}${SEP}${s.completedLessons}${SEP}${s.lastActivity}\n`
      })
      filename = `resumen_ranking_${levelName}_${dateStr}.xls`
    }
    
    // Agregar BOM para Excel y usar tipo application/vnd.ms-excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + content], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-400'
    if (score >= 7) return 'text-yellow-400'
    if (score >= 5) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 9) return 'bg-green-500/20 border-green-500/30'
    if (score >= 7) return 'bg-yellow-500/20 border-yellow-500/30'
    if (score >= 5) return 'bg-orange-500/20 border-orange-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-neon-cyan" />
            Sistema de Calificaciones
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Gestiona estudiantes y calificaciones por nivel académico
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExportCSV('students')}
            className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Estudiantes
          </button>
          <button
            onClick={() => handleExportCSV('grades')}
            className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Calificaciones
          </button>
          <button
            onClick={() => handleExportCSV('summary')}
            className="px-3 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Ranking
          </button>
        </div>
      </div>

      {/* Level Selector */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
        <label className="block text-sm text-gray-400 mb-2">Seleccionar Nivel Académico</label>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              onClick={() => setSelectedLevel('')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedLevel === ''
                  ? 'bg-neon-cyan text-dark-900 font-medium'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              Todos
            </button>
          )}
          {allowedLevels.map(level => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedLevel === level.id
                  ? 'bg-neon-cyan text-dark-900 font-medium'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-dark-600 pb-2">
        <button
          onClick={() => setViewMode('students')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${
            viewMode === 'students'
              ? 'bg-dark-700 text-white border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Estudiantes ({filteredStudents.length})
        </button>
        <button
          onClick={() => setViewMode('grades')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${
            viewMode === 'grades'
              ? 'bg-dark-700 text-white border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Calificaciones ({grades.length})
        </button>
        <button
          onClick={() => setViewMode('summary')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${
            viewMode === 'summary'
              ? 'bg-dark-700 text-white border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Resumen
        </button>
        <button
          onClick={() => setViewMode('submissions')}
          className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${
            viewMode === 'submissions'
              ? 'bg-dark-700 text-white border-b-2 border-neon-green'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          Entregas
        </button>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan"
          />
        </div>
        {selectedLevel && viewMode === 'students' && (
          <button
            onClick={() => setShowAddStudent(true)}
            className="px-4 py-2 bg-neon-cyan text-dark-900 font-medium rounded-lg flex items-center gap-2 hover:bg-neon-cyan/80 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Agregar Estudiante
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
        </div>
      ) : (
        <>
          {/* Students View */}
          {viewMode === 'students' && (
            <div className="grid gap-4">
              {filteredStudents.length === 0 ? (
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    {selectedLevel 
                      ? 'No hay estudiantes en este nivel. Agrega uno nuevo.'
                      : 'Selecciona un nivel para ver los estudiantes.'}
                  </p>
                </div>
              ) : (
                filteredStudents.map(student => {
                  const summary = summaries.find(s => s.studentName === student.name)
                  const studentGrades = grades.filter(g => g.studentName === student.name)
                  
                  return (
                    <div
                      key={student.id}
                      className="bg-dark-800 border border-dark-600 rounded-xl p-4 hover:border-dark-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{student.name}</h3>
                            <p className="text-gray-500 text-sm">
                              {student.email || 'Sin email'} • {EDUCATION_LEVELS.find(l => l.id === student.levelId)?.name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setShowAddGrade(true)
                            }}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Agregar calificación"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(student)
                              setNewStudentName(student.name)
                              setNewStudentEmail(student.email || '')
                            }}
                            className="p-2 text-gray-400 hover:bg-dark-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      {summary && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-neon-cyan">{summary.averageScore}</p>
                            <p className="text-xs text-gray-500">Promedio</p>
                          </div>
                          <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-neon-purple">{summary.totalGrades}</p>
                            <p className="text-xs text-gray-500">Calificaciones</p>
                          </div>
                          <div className="bg-dark-900/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-neon-green">{summary.completedLessons}</p>
                            <p className="text-xs text-gray-500">Lecciones</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Recent Grades */}
                      {studentGrades.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 mb-2">Últimas calificaciones:</p>
                          <div className="flex gap-2 flex-wrap">
                            {studentGrades.slice(-5).map(grade => (
                              <span
                                key={grade.id}
                                className={`px-2 py-1 rounded text-sm font-medium border ${getScoreBg(grade.score)} ${getScoreColor(grade.score)}`}
                              >
                                {grade.score}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Grades View */}
          {viewMode === 'grades' && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estudiante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Lección</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Nota</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Feedback</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID Tarea</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No hay calificaciones registradas
                      </td>
                    </tr>
                  ) : (
                    grades.map(grade => {
                      const student = students.find(s => s.id === grade.studentId || s.name === grade.studentName)
                      return (
                        <tr key={grade.id} className="hover:bg-dark-700/50">
                          <td className="px-4 py-3 text-white">{grade.studentName || student?.name || 'Desconocido'}</td>
                          <td className="px-4 py-3 text-gray-400">{grade.lessonId}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full font-bold ${getScoreBg(grade.score)} ${getScoreColor(grade.score)}`}>
                              {grade.score}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{grade.feedback || '-'}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{grade.taskId || '-'}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {new Date(grade.submittedAt).toLocaleDateString('es-EC')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingGrade(grade)
                                  setNewGradeScore(grade.score)
                                  setNewGradeFeedback(grade.feedback || '')
                                }}
                                className="p-1.5 text-gray-400 hover:bg-dark-600 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGrade(grade.id)}
                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary View */}
          {viewMode === 'summary' && (
            <div className="space-y-4">
              {!selectedLevel ? (
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Selecciona un nivel para ver el resumen de calificaciones.</p>
                </div>
              ) : summaries.length === 0 ? (
                <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No hay datos de calificaciones para este nivel.</p>
                </div>
              ) : (
                <>
                  {/* Level Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon-cyan/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-neon-cyan" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{summaries.length}</p>
                          <p className="text-xs text-gray-500">Estudiantes</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon-purple/20 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{grades.length}</p>
                          <p className="text-xs text-gray-500">Calificaciones</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {summaries.length > 0 
                              ? (summaries.reduce((a, b) => a + b.averageScore, 0) / summaries.length).toFixed(1)
                              : '0'}
                          </p>
                          <p className="text-xs text-gray-500">Promedio General</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {summaries.length > 0 ? Math.max(...summaries.map(s => s.averageScore)).toFixed(1) : '0'}
                          </p>
                          <p className="text-xs text-gray-500">Mejor Promedio</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ranking */}
                  <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Ranking de Estudiantes
                    </h3>
                    <div className="space-y-2">
                      {summaries.map((summary, index) => (
                        <div
                          key={summary.studentId}
                          className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg"
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-dark-900' :
                            index === 1 ? 'bg-gray-400 text-dark-900' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-dark-700 text-gray-400'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-white font-medium">{summary.studentName}</p>
                            <p className="text-xs text-gray-500">
                              {summary.totalGrades} calificaciones • {summary.completedLessons} lecciones
                            </p>
                          </div>
                          <div className={`text-xl font-bold ${getScoreColor(summary.averageScore)}`}>
                            {summary.averageScore}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Submissions View */}
          {viewMode === 'submissions' && (
            <SubmissionsPanel />
          )}
        </>
      )}

      {/* Add Student Modal */}
      {(showAddStudent || editingStudent) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-neon-cyan" />
              {editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email (opcional)</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan"
                />
              </div>
              {!editingStudent && (
                <div className="bg-dark-900/50 rounded-lg p-3">
                  <p className="text-sm text-gray-400">
                    Nivel: <span className="text-white font-medium">
                      {EDUCATION_LEVELS.find(l => l.id === selectedLevel)?.fullName}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStudent(false)
                  setEditingStudent(null)
                  setNewStudentName('')
                  setNewStudentEmail('')
                }}
                className="flex-1 px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
                disabled={!newStudentName.trim()}
                className="flex-1 px-4 py-2 bg-neon-cyan text-dark-900 font-medium rounded-lg hover:bg-neon-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingStudent ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {(showAddGrade || editingGrade) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-neon-cyan" />
              {editingGrade ? 'Editar Calificación' : 'Nueva Calificación'}
            </h3>
            
            {selectedStudent && !editingGrade && (
              <div className="bg-dark-900/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-400">
                  Estudiante: <span className="text-white font-medium">{selectedStudent.name}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              {!editingGrade && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Lección / Actividad *</label>
                  <input
                    type="text"
                    value={newGradeLesson}
                    onChange={(e) => setNewGradeLesson(e.target.value)}
                    placeholder="Ej: Lección 1 - Variables"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Calificación (0-10) *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={newGradeScore}
                  onChange={(e) => setNewGradeScore(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-neon-cyan"
                />
                <div className="flex justify-between mt-1">
                  {[0, 2.5, 5, 7.5, 10].map(score => (
                    <button
                      key={score}
                      onClick={() => setNewGradeScore(score)}
                      className={`px-2 py-1 rounded text-xs ${
                        newGradeScore === score 
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
                  value={newGradeFeedback}
                  onChange={(e) => setNewGradeFeedback(e.target.value)}
                  placeholder="Comentarios sobre el trabajo..."
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan resize-none"
                />
              </div>

              {!editingGrade && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID de Tarea (opcional)</label>
                  <input
                    type="text"
                    value={newGradeTaskId}
                    onChange={(e) => setNewGradeTaskId(e.target.value)}
                    placeholder="Ej: CB-250116-A3F2B1"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El ID de verificación del simulador Python
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddGrade(false)
                  setEditingGrade(null)
                  setSelectedStudent(null)
                  setNewGradeScore(10)
                  setNewGradeFeedback('')
                  setNewGradeLesson('')
                  setNewGradeTaskId('')
                }}
                className="flex-1 px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingGrade ? handleUpdateGrade : handleAddGrade}
                disabled={!editingGrade && !newGradeLesson.trim()}
                className="flex-1 px-4 py-2 bg-neon-cyan text-dark-900 font-medium rounded-lg hover:bg-neon-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingGrade ? 'Guardar' : 'Calificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
