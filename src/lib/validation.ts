// ============================================
// VALIDACIÓN CON ZOD - ChaskiBots EDU
// Esquemas de validación centralizados
// ============================================

import { z } from 'zod'

// ============================================
// ESQUEMAS BASE
// ============================================

// ID genérico
export const idSchema = z.string().min(1, 'ID es requerido')

// Email
export const emailSchema = z.string().email('Email inválido').optional().or(z.literal(''))

// Fecha ISO
export const dateSchema = z.string().datetime().optional()

// ============================================
// USUARIOS
// ============================================

export const userRoleSchema = z.enum(['admin', 'teacher', 'student'])

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: emailSchema,
  password: z.string().min(4, 'Contraseña debe tener al menos 4 caracteres').optional(),
  role: userRoleSchema,
  levelId: z.string().optional(),
  courseId: z.string().optional(),
  schoolId: z.string().optional(),
  accessCode: z.string().optional(),
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: idSchema,
})

export const loginSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  accessCode: z.string().optional(),
}).refine(
  data => (data.email && data.password) || data.accessCode,
  { message: 'Proporciona email/contraseña o código de acceso' }
)

// ============================================
// ESTUDIANTES
// ============================================

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  levelId: z.string().optional(),
  courseId: z.string().optional(),
  schoolId: z.string().optional(),
  email: emailSchema,
  accessCode: z.string().optional(),
})

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: idSchema,
})

// ============================================
// NIVELES
// ============================================

export const levelCategorySchema = z.enum([
  'inicial', 'preparatoria', 'elemental', 'media', 'superior', 'bachillerato', 'universidad', 'curso-libre'
])

export const createLevelSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  fullName: z.string().min(2, 'Nombre completo es requerido'),
  category: levelCategorySchema,
  ageRange: z.string().optional(),
  gradeNumber: z.number().int().min(-1).max(20),
  color: z.string().optional(),
  neonColor: z.string().optional(),
  icon: z.string().optional(),
  kitPrice: z.number().min(0).optional(),
  hasHacking: z.boolean().optional(),
  hasAdvancedIA: z.boolean().optional(),
})

export const updateLevelSchema = createLevelSchema.partial().extend({
  id: idSchema,
})

// ============================================
// TAREAS
// ============================================

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  levelId: z.string().min(1, 'Nivel es requerido'),
  courseId: z.string().optional(),
  points: z.number().int().min(0).max(100).default(10),
  dueDate: dateSchema,
  isActive: z.boolean().default(true),
  type: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questions: z.array(z.string()).optional(),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: idSchema,
})

// ============================================
// ENTREGAS (SUBMISSIONS)
// ============================================

export const submissionStatusSchema = z.enum(['pending', 'graded', 'returned'])

export const createSubmissionSchema = z.object({
  taskId: z.string().min(1, 'ID de tarea es requerido'),
  studentName: z.string().min(2, 'Nombre del estudiante es requerido'),
  studentEmail: emailSchema,
  levelId: z.string().optional(),
  lessonId: z.string().optional(),
  courseId: z.string().optional(),
  schoolId: z.string().optional(),
  code: z.string().optional(),
  output: z.string().optional(),
  drawing: z.string().optional(), // base64
  files: z.string().optional(), // JSON string
})

export const gradeSubmissionSchema = z.object({
  id: idSchema,
  grade: z.number().min(0).max(10),
  feedback: z.string().optional(),
  gradedBy: z.string().optional(),
  status: submissionStatusSchema.default('graded'),
})

// ============================================
// CALIFICACIONES
// ============================================

export const createGradeSchema = z.object({
  studentName: z.string().min(2, 'Nombre del estudiante es requerido'),
  studentId: z.string().optional(),
  taskId: z.string().optional(),
  lessonId: z.string().optional(),
  levelId: z.string().min(1, 'Nivel es requerido'),
  courseId: z.string().optional(),
  schoolId: z.string().optional(),
  score: z.number().min(0).max(10),
  feedback: z.string().optional(),
  gradedBy: z.string().optional(),
})

// ============================================
// COLEGIOS
// ============================================

export const createSchoolSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  code: z.string().min(2, 'Código debe tener al menos 2 caracteres'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Ecuador'),
  email: emailSchema,
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  maxStudents: z.number().int().min(1).optional(),
  maxTeachers: z.number().int().min(1).optional(),
})

export const updateSchoolSchema = createSchoolSchema.partial().extend({
  id: idSchema,
})

// ============================================
// LECCIONES
// ============================================

export const lessonTypeSchema = z.enum(['video', 'lectura', 'actividad', 'quiz', 'tutorial', 'project'])

export const createLessonSchema = z.object({
  levelId: z.string().min(1, 'Nivel es requerido'),
  moduleName: z.string().min(2, 'Nombre del módulo es requerido'),
  title: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
  type: lessonTypeSchema,
  duration: z.string().optional(),
  order: z.number().int().min(0),
  videoUrl: z.string().url().optional().or(z.literal('')),
  content: z.string().optional(),
  pdfUrl: z.string().url().optional().or(z.literal('')),
  locked: z.boolean().default(false),
})

export const updateLessonSchema = createLessonSchema.partial().extend({
  id: idSchema,
})

// ============================================
// PROGRAMAS
// ============================================

export const createProgramSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  levelId: z.string().min(1, 'Nivel es requerido'),
  description: z.string().optional(),
  duration: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const updateProgramSchema = createProgramSchema.partial().extend({
  id: idSchema,
})

// ============================================
// CURSOS
// ============================================

export const createCourseSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  levelId: z.string().min(1, 'Nivel es requerido'),
  teacherId: z.string().optional(),
  teacherName: z.string().optional(),
  schoolId: z.string().optional(),
  schoolName: z.string().optional(),
  maxStudents: z.number().int().min(1).default(30),
  isActive: z.boolean().default(true),
})

export const updateCourseSchema = createCourseSchema.partial().extend({
  id: idSchema,
})

// ============================================
// HELPER: Validar y retornar errores formateados
// ============================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string>
}

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  // Formatear errores - compatible con Zod v4
  const errors: Record<string, string> = {}
  
  // Zod v4 usa result.error.issues en lugar de result.error.errors
  const issues = (result.error as any).issues || (result.error as any).errors || []
  issues.forEach((err: any) => {
    const path = Array.isArray(err.path) ? err.path.join('.') : ''
    errors[path || 'general'] = err.message
  })
  
  // Si no hay issues, usar el mensaje general
  if (Object.keys(errors).length === 0 && result.error) {
    errors['general'] = result.error.message || 'Error de validación'
  }
  
  return { success: false, errors }
}

// ============================================
// TIPOS INFERIDOS
// ============================================

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>
export type CreateGradeInput = z.infer<typeof createGradeSchema>
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type CreateLevelInput = z.infer<typeof createLevelSchema>
export type CreateProgramInput = z.infer<typeof createProgramSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
