// ============================================
// TIPOS CENTRALIZADOS - ChaskiBots EDU
// ============================================

// Usuario
export interface User {
  id: string
  accessCode?: string
  name: string
  email?: string
  role: 'admin' | 'teacher' | 'student'
  levelId?: string
  courseId?: string
  schoolId?: string
  schoolName?: string
  progress?: number
  createdAt?: string
  lastLogin?: string
}

// Nivel educativo
export interface Level {
  id: string
  name: string
  fullName: string
  category: 'inicial' | 'preparatoria' | 'elemental' | 'media' | 'superior' | 'bachillerato' | 'universidad' | 'curso-libre' | string
  ageRange: string
  gradeNumber: number
  color?: string
  neonColor?: string
  icon?: string
  kitPrice?: number
  hasHacking?: boolean
  hasAdvancedIA?: boolean
}

// Curso/Programa
export interface Course {
  id: string
  name: string
  description?: string
  levelId: string
  teacherId?: string
  teacherName?: string
  schoolId?: string
  schoolName?: string
}

// Asignación profesor-curso
export interface TeacherCourse {
  id: string
  recordId: string
  teacherId: string
  teacherName: string
  courseId: string
  courseName: string
  levelId: string
  schoolId?: string
  schoolName?: string
  createdAt?: string
}

// Colegio/Institución
export interface School {
  id: string
  name: string
  code: string
  address?: string
  city?: string
  country?: string
  email?: string
  logo?: string
  isActive?: boolean
  maxStudents?: number
  maxTeachers?: number
}

// Lección
export interface Lesson {
  id: string
  levelId: string
  moduleName: string
  title: string
  type: 'video' | 'lectura' | 'actividad' | 'quiz'
  duration?: string
  order: number
  videoUrl?: string
  content?: string
  pdfUrl?: string
  locked?: boolean
}

// Tarea
export interface Task {
  id: string
  levelId: string
  title: string
  description: string
  points: number
  dueDate?: string
  isActive: boolean
  questions?: string[]
  type?: string
  category?: string
  difficulty?: string
  attachmentUrl?: string
}

// Entrega de estudiante
export interface Submission {
  id: string
  recordId?: string
  taskId: string
  studentName: string
  studentEmail?: string
  levelId: string
  lessonId?: string
  courseId?: string
  schoolId?: string
  code?: string
  output?: string
  submittedAt: string
  status: 'pending' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: string
  drawing?: string
  files?: string
}

// Calificación
export interface Grade {
  id: string
  studentId: string
  studentName: string
  lessonId?: string
  levelId: string
  courseId?: string
  schoolId?: string
  score: number
  feedback?: string
  taskId?: string
  submittedAt?: string
  gradedAt?: string
  gradedBy?: string
}

// Respuesta genérica de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Paginación
export interface PaginatedResponse<T> extends ApiResponse<T> {
  total?: number
  page?: number
  pageSize?: number
  hasMore?: boolean
}
