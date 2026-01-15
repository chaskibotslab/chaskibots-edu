// ============================================
// TIPOS PARA CURSOS - ChaskiBots EDU
// ============================================

export interface Lesson {
  id: string
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
  duration: string
  completed: boolean
  locked: boolean
  videoUrl?: string
  content?: string
  steps?: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

export interface AssemblyStep {
  step: number
  title: string
  description: string
  image?: string
  videoUrl?: string
}

export interface YearPlanItem {
  month: string
  topic: string
  project: string
  objectives?: string[]
}

export interface Kit {
  name: string
  price: number
  images?: string[]  // URLs de imágenes del kit (Google Drive o locales)
  components: string[]
  assemblySteps: AssemblyStep[]
}

export interface CourseData {
  id: string
  title: string
  description: string
  duration: string
  totalLessons: number
  modules: Module[]
  kit: Kit
  yearPlan: YearPlanItem[]
}

// Función para calcular progreso
export function calculateProgress(modules: Module[]): number {
  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0)
  const completedLessons = modules.reduce((acc, mod) => 
    acc + mod.lessons.filter(l => l.completed).length, 0
  )
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
}
