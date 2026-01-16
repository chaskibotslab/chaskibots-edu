// ============================================
// SERVICIO DE CALIFICACIONES - ChaskiBots EDU
// ============================================
// Sistema de calificación y seguimiento por nivel académico
// Usa localStorage como almacenamiento (preparado para Airtable)
// ============================================

export interface Student {
  id: string
  name: string
  levelId: string
  email?: string
  createdAt: string
}

export interface Grade {
  id: string
  studentId: string
  lessonId: string
  levelId: string
  score: number // 0-10
  feedback?: string
  taskId?: string // ID único de tarea exportada
  submittedAt: string
  gradedAt?: string
  gradedBy?: string // teacher id
}

export interface GradeSummary {
  studentId: string
  studentName: string
  levelId: string
  totalGrades: number
  averageScore: number
  completedLessons: number
  lastActivity: string
}

export interface LessonGradeSummary {
  lessonId: string
  lessonTitle: string
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
}

// Keys para localStorage
const STORAGE_KEYS = {
  STUDENTS: 'chaskibots_students',
  GRADES: 'chaskibots_grades',
}

// ============================================
// FUNCIONES DE ESTUDIANTES
// ============================================

export function getStudents(): Student[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS)
  return data ? JSON.parse(data) : []
}

export function getStudentsByLevel(levelId: string): Student[] {
  return getStudents().filter(s => s.levelId === levelId)
}

export function getStudentById(id: string): Student | undefined {
  return getStudents().find(s => s.id === id)
}

export function addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
  const students = getStudents()
  const newStudent: Student = {
    ...student,
    id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  }
  students.push(newStudent)
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students))
  return newStudent
}

export function updateStudent(id: string, updates: Partial<Student>): Student | null {
  const students = getStudents()
  const index = students.findIndex(s => s.id === id)
  if (index === -1) return null
  
  students[index] = { ...students[index], ...updates }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students))
  return students[index]
}

export function deleteStudent(id: string): boolean {
  const students = getStudents()
  const filtered = students.filter(s => s.id !== id)
  if (filtered.length === students.length) return false
  
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered))
  // También eliminar calificaciones del estudiante
  const grades = getGrades().filter(g => g.studentId !== id)
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades))
  return true
}

// ============================================
// FUNCIONES DE CALIFICACIONES
// ============================================

export function getGrades(): Grade[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.GRADES)
  return data ? JSON.parse(data) : []
}

export function getGradesByStudent(studentId: string): Grade[] {
  return getGrades().filter(g => g.studentId === studentId)
}

export function getGradesByLevel(levelId: string): Grade[] {
  return getGrades().filter(g => g.levelId === levelId)
}

export function getGradesByLesson(lessonId: string): Grade[] {
  return getGrades().filter(g => g.lessonId === lessonId)
}

export function addGrade(grade: Omit<Grade, 'id'>): Grade {
  const grades = getGrades()
  const newGrade: Grade = {
    ...grade,
    id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  grades.push(newGrade)
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades))
  return newGrade
}

export function updateGrade(id: string, updates: Partial<Grade>): Grade | null {
  const grades = getGrades()
  const index = grades.findIndex(g => g.id === id)
  if (index === -1) return null
  
  grades[index] = { ...grades[index], ...updates }
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades))
  return grades[index]
}

export function deleteGrade(id: string): boolean {
  const grades = getGrades()
  const filtered = grades.filter(g => g.id !== id)
  if (filtered.length === grades.length) return false
  
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(filtered))
  return true
}

// ============================================
// FUNCIONES DE RESUMEN Y ESTADÍSTICAS
// ============================================

export function getStudentSummary(studentId: string): GradeSummary | null {
  const student = getStudentById(studentId)
  if (!student) return null
  
  const grades = getGradesByStudent(studentId)
  const totalGrades = grades.length
  const averageScore = totalGrades > 0 
    ? grades.reduce((sum, g) => sum + g.score, 0) / totalGrades 
    : 0
  const completedLessons = new Set(grades.map(g => g.lessonId)).size
  const lastActivity = grades.length > 0 
    ? grades.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0].submittedAt
    : student.createdAt

  return {
    studentId,
    studentName: student.name,
    levelId: student.levelId,
    totalGrades,
    averageScore: Math.round(averageScore * 10) / 10,
    completedLessons,
    lastActivity
  }
}

export function getLevelSummary(levelId: string): GradeSummary[] {
  const students = getStudentsByLevel(levelId)
  return students
    .map(s => getStudentSummary(s.id))
    .filter((s): s is GradeSummary => s !== null)
    .sort((a, b) => b.averageScore - a.averageScore)
}

export function getLessonSummary(lessonId: string): LessonGradeSummary {
  const grades = getGradesByLesson(lessonId)
  const scores = grades.map(g => g.score)
  
  return {
    lessonId,
    lessonTitle: '', // Se llenará desde el componente
    totalSubmissions: grades.length,
    averageScore: scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 
      : 0,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    lowestScore: scores.length > 0 ? Math.min(...scores) : 0
  }
}

// ============================================
// FUNCIONES DE IMPORTACIÓN/EXPORTACIÓN
// ============================================

export function exportGradesToCSV(levelId?: string): string {
  const grades = levelId ? getGradesByLevel(levelId) : getGrades()
  const students = getStudents()
  
  const headers = ['Estudiante', 'Nivel', 'Lección', 'Calificación', 'Feedback', 'ID Tarea', 'Fecha Entrega', 'Fecha Calificación']
  const rows = grades.map(g => {
    const student = students.find(s => s.id === g.studentId)
    return [
      student?.name || 'Desconocido',
      g.levelId,
      g.lessonId,
      g.score.toString(),
      g.feedback || '',
      g.taskId || '',
      g.submittedAt,
      g.gradedAt || ''
    ].join(',')
  })
  
  return [headers.join(','), ...rows].join('\n')
}

export function exportStudentsToCSV(levelId?: string): string {
  const students = levelId ? getStudentsByLevel(levelId) : getStudents()
  
  const headers = ['ID', 'Nombre', 'Nivel', 'Email', 'Fecha Registro']
  const rows = students.map(s => [
    s.id,
    s.name,
    s.levelId,
    s.email || '',
    s.createdAt
  ].join(','))
  
  return [headers.join(','), ...rows].join('\n')
}

// ============================================
// DATOS DE EJEMPLO (para desarrollo)
// ============================================

export function seedSampleData(): void {
  if (typeof window === 'undefined') return
  
  // Solo sembrar si no hay datos
  if (getStudents().length > 0) return
  
  const sampleStudents: Omit<Student, 'id' | 'createdAt'>[] = [
    { name: 'María García', levelId: 'quinto-egb', email: 'maria@ejemplo.com' },
    { name: 'Carlos López', levelId: 'quinto-egb', email: 'carlos@ejemplo.com' },
    { name: 'Ana Martínez', levelId: 'quinto-egb' },
    { name: 'Pedro Sánchez', levelId: 'sexto-egb', email: 'pedro@ejemplo.com' },
    { name: 'Lucía Fernández', levelId: 'sexto-egb' },
    { name: 'Diego Ramírez', levelId: 'septimo-egb', email: 'diego@ejemplo.com' },
  ]
  
  const createdStudents = sampleStudents.map(s => addStudent(s))
  
  // Agregar algunas calificaciones de ejemplo
  const sampleGrades: Omit<Grade, 'id'>[] = [
    { studentId: createdStudents[0].id, lessonId: 'lesson-1', levelId: 'quinto-egb', score: 9, feedback: 'Excelente trabajo', submittedAt: new Date().toISOString(), gradedAt: new Date().toISOString() },
    { studentId: createdStudents[0].id, lessonId: 'lesson-2', levelId: 'quinto-egb', score: 8, submittedAt: new Date().toISOString() },
    { studentId: createdStudents[1].id, lessonId: 'lesson-1', levelId: 'quinto-egb', score: 7, feedback: 'Buen esfuerzo', submittedAt: new Date().toISOString(), gradedAt: new Date().toISOString() },
    { studentId: createdStudents[2].id, lessonId: 'lesson-1', levelId: 'quinto-egb', score: 10, feedback: 'Perfecto!', submittedAt: new Date().toISOString(), gradedAt: new Date().toISOString() },
    { studentId: createdStudents[3].id, lessonId: 'lesson-1', levelId: 'sexto-egb', score: 8.5, submittedAt: new Date().toISOString() },
    { studentId: createdStudents[4].id, lessonId: 'lesson-1', levelId: 'sexto-egb', score: 9.5, feedback: 'Muy bien', submittedAt: new Date().toISOString(), gradedAt: new Date().toISOString() },
  ]
  
  sampleGrades.forEach(g => addGrade(g))
}
