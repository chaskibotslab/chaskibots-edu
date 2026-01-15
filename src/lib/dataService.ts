// ============================================
// SERVICIO DE DATOS - ChaskiBots EDU
// ============================================
// Este servicio carga datos desde la "base de datos"
// Actualmente usa localStorage como mock, pero está preparado
// para conectar con Airtable en producción
// ============================================

export interface KitData {
  id: string
  levelId: string
  name: string
  description: string
  components: string[]
  skills: string[]
  images: string[]
  videoUrl?: string
  tutorialUrl?: string
  price?: number
}

export interface LessonData {
  id: string
  levelId: string
  moduleId: string
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
  duration: string
  order: number
  locked: boolean
  completed: boolean
  videoUrl?: string
  thumbnailUrl?: string
  content?: string
  resources?: string[]
}

export interface ModuleData {
  id: string
  levelId: string
  title: string
  description: string
  order: number
  lessons: LessonData[]
}

export interface CourseDataFromDB {
  id: string
  levelId: string
  title: string
  description: string
  duration: string
  modules: ModuleData[]
  kit: KitData | null
  yearPlan: YearPlanData[]
}

export interface YearPlanData {
  month: string
  topic: string
  project: string
  objectives?: string[]
}

// ============================================
// DATOS INICIALES (se cargan en localStorage si no existen)
// Estos datos vienen de los CSVs de Airtable
// ============================================

const INITIAL_KITS: KitData[] = [
  {
    id: 'kit-inicial-1',
    levelId: 'inicial-1',
    name: 'Kit Inicial 1 - Mis Primeras Luces',
    description: 'Kit para niños de 3-4 años con LEDs, cables y componentes seguros',
    components: [
      'LEDs de colores (rojo, verde, amarillo, azul) - 8 unidades',
      'Cables de conexión seguros para niños - 6 unidades',
      'Pila botón CR2032 - 2 unidades',
      'Porta pila seguro con switch',
      'Stickers temáticos de robótica',
      'Cinta conductora de cobre - 1 metro',
      'Tarjetas de actividades ilustradas - 10 tarjetas',
      'Caja organizadora con compartimentos',
      'Guía para padres y maestros'
    ],
    skills: ['Introducción a circuitos básicos', 'Reconocimiento de colores', 'Motricidad fina'],
    images: [
      'https://drive.google.com/uc?export=view&id=1j9PC18mcxTK1iG0jKpomPItKS3W2oFta',
      'https://drive.google.com/uc?export=view&id=1lqvCi1lTfcN-lI5X8vkq6r3Jk9QO1_lm',
      'https://drive.google.com/uc?export=view&id=1i42AvvZQx6D4H5Nqqi5H0LRKc1Qqsh6z',
      'https://drive.google.com/uc?export=view&id=1bj-aUrpPBqkYAukYxs7bHM-O_FovrhOz',
      'https://drive.google.com/uc?export=view&id=1MaME0PjBkqvVsKmsamlUlNrGX2Ih8hjJ',
      'https://drive.google.com/uc?export=view&id=1STa9iqY6p_TZR8z6CeZpcXj4qeEddpuR',
    ],
    price: 30
  },
  {
    id: 'kit-inicial-2',
    levelId: 'inicial-2',
    name: 'Kit Inicial 2',
    description: 'Kit Inicial: Led, cables jumper, pila CR 2032, Adhesivo Temático, Cinta de cobre y Generador eólico',
    components: ['LED', 'Cables jumper', 'Pila CR 2032', 'Adhesivo temático', 'Cinta de cobre', 'Generador eólico', 'Caja de Herramientas Plástica'],
    skills: ['Kit Inicial', 'Cinta y Generador eólico', 'Introducción a circuitos básicos'],
    images: [],
    price: 35
  }
]

const INITIAL_LESSONS: LessonData[] = [
  // Inicial 1 - Módulo 1
  { id: 'l1', levelId: 'inicial-1', moduleId: 'mod-i1-1', title: '¡Hola! Bienvenidos al curso', type: 'video', duration: '5 min', order: 1, locked: false, completed: false, videoUrl: '', content: 'Introducción al curso de tecnología para niños' },
  { id: 'l2', levelId: 'inicial-1', moduleId: 'mod-i1-1', title: '¿Qué es un robot?', type: 'video', duration: '8 min', order: 2, locked: false, completed: false, videoUrl: '', content: 'Explicación sencilla de qué son los robots' },
  { id: 'l3', levelId: 'inicial-1', moduleId: 'mod-i1-1', title: 'Robots en nuestra vida', type: 'activity', duration: '15 min', order: 3, locked: false, completed: false, content: 'Identificar robots en casa y la escuela' },
  { id: 'l4', levelId: 'inicial-1', moduleId: 'mod-i1-1', title: 'Colores de la tecnología', type: 'activity', duration: '10 min', order: 4, locked: true, completed: false, content: 'Aprender los colores de los componentes' },
  // Inicial 1 - Módulo 2
  { id: 'l5', levelId: 'inicial-1', moduleId: 'mod-i1-2', title: 'Abriendo mi kit (Unboxing)', type: 'video', duration: '10 min', order: 1, locked: true, completed: false, videoUrl: '', content: 'Video de unboxing del kit' },
  { id: 'l6', levelId: 'inicial-1', moduleId: 'mod-i1-2', title: 'Los LEDs: Luces mágicas', type: 'video', duration: '8 min', order: 2, locked: true, completed: false, videoUrl: '', content: 'Conociendo los LEDs de colores' },
  { id: 'l7', levelId: 'inicial-1', moduleId: 'mod-i1-2', title: 'Cables y conexiones', type: 'tutorial', duration: '15 min', order: 3, locked: true, completed: false, content: 'Cómo conectar cables de forma segura' },
  { id: 'l8', levelId: 'inicial-1', moduleId: 'mod-i1-2', title: 'La pila: Energía para todo', type: 'video', duration: '8 min', order: 4, locked: true, completed: false, videoUrl: '', content: 'Entendiendo la fuente de energía' },
]

const INITIAL_MODULES: ModuleData[] = [
  { id: 'mod-i1-1', levelId: 'inicial-1', title: 'Módulo 1: Bienvenida al Mundo Tech', description: 'Conociendo qué es la tecnología y los robots', order: 1, lessons: [] },
  { id: 'mod-i1-2', levelId: 'inicial-1', title: 'Módulo 2: Conociendo Mi Kit', description: 'Explorando los componentes del kit de robótica', order: 2, lessons: [] },
  { id: 'mod-i1-3', levelId: 'inicial-1', title: 'Módulo 3: Mis Primeros Circuitos', description: 'Aprendiendo a conectar LEDs y crear circuitos simples', order: 3, lessons: [] },
  { id: 'mod-i1-4', levelId: 'inicial-1', title: 'Módulo 4: Proyectos del Año', description: 'Proyectos creativos para todo el año escolar', order: 4, lessons: [] },
  { id: 'mod-i1-5', levelId: 'inicial-1', title: 'Módulo 5: IA para Pequeños', description: 'Introducción a la inteligencia artificial', order: 5, lessons: [] },
]

// ============================================
// FUNCIONES DE ACCESO A DATOS
// ============================================

const STORAGE_KEYS = {
  KITS: 'chaskibots_kits',
  LESSONS: 'chaskibots_lessons',
  MODULES: 'chaskibots_modules',
}

// Inicializar datos si no existen
function initializeData() {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem(STORAGE_KEYS.KITS)) {
    localStorage.setItem(STORAGE_KEYS.KITS, JSON.stringify(INITIAL_KITS))
  }
  if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS))
  }
  if (!localStorage.getItem(STORAGE_KEYS.MODULES)) {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(INITIAL_MODULES))
  }
}

// ============================================
// KITS
// ============================================

export function getAllKits(): KitData[] {
  if (typeof window === 'undefined') return INITIAL_KITS
  initializeData()
  const data = localStorage.getItem(STORAGE_KEYS.KITS)
  return data ? JSON.parse(data) : INITIAL_KITS
}

export function getKitByLevelId(levelId: string): KitData | null {
  const kits = getAllKits()
  return kits.find(k => k.levelId === levelId) || null
}

export function updateKit(kit: KitData): void {
  if (typeof window === 'undefined') return
  const kits = getAllKits()
  const index = kits.findIndex(k => k.id === kit.id)
  if (index >= 0) {
    kits[index] = kit
  } else {
    kits.push(kit)
  }
  localStorage.setItem(STORAGE_KEYS.KITS, JSON.stringify(kits))
}

export function deleteKit(kitId: string): void {
  if (typeof window === 'undefined') return
  const kits = getAllKits().filter(k => k.id !== kitId)
  localStorage.setItem(STORAGE_KEYS.KITS, JSON.stringify(kits))
}

// ============================================
// LESSONS
// ============================================

export function getAllLessons(): LessonData[] {
  if (typeof window === 'undefined') return INITIAL_LESSONS
  initializeData()
  const data = localStorage.getItem(STORAGE_KEYS.LESSONS)
  return data ? JSON.parse(data) : INITIAL_LESSONS
}

export function getLessonsByLevelId(levelId: string): LessonData[] {
  return getAllLessons().filter(l => l.levelId === levelId)
}

export function getLessonsByModuleId(moduleId: string): LessonData[] {
  return getAllLessons().filter(l => l.moduleId === moduleId)
}

export function updateLesson(lesson: LessonData): void {
  if (typeof window === 'undefined') return
  const lessons = getAllLessons()
  const index = lessons.findIndex(l => l.id === lesson.id)
  if (index >= 0) {
    lessons[index] = lesson
  } else {
    lessons.push(lesson)
  }
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons))
}

export function deleteLesson(lessonId: string): void {
  if (typeof window === 'undefined') return
  const lessons = getAllLessons().filter(l => l.id !== lessonId)
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons))
}

// ============================================
// MODULES
// ============================================

export function getAllModules(): ModuleData[] {
  if (typeof window === 'undefined') return INITIAL_MODULES
  initializeData()
  const data = localStorage.getItem(STORAGE_KEYS.MODULES)
  return data ? JSON.parse(data) : INITIAL_MODULES
}

export function getModulesByLevelId(levelId: string): ModuleData[] {
  const modules = getAllModules().filter(m => m.levelId === levelId)
  const lessons = getLessonsByLevelId(levelId)
  
  // Agregar lecciones a cada módulo
  return modules.map(mod => ({
    ...mod,
    lessons: lessons.filter(l => l.moduleId === mod.id).sort((a, b) => a.order - b.order)
  })).sort((a, b) => a.order - b.order)
}

export function updateModule(module: ModuleData): void {
  if (typeof window === 'undefined') return
  const modules = getAllModules()
  const index = modules.findIndex(m => m.id === module.id)
  if (index >= 0) {
    modules[index] = { ...module, lessons: [] } // No guardar lessons aquí
  } else {
    modules.push({ ...module, lessons: [] })
  }
  localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules))
}

// ============================================
// CURSO COMPLETO (combina todo)
// ============================================

export function getCourseData(levelId: string): CourseDataFromDB | null {
  const modules = getModulesByLevelId(levelId)
  const kit = getKitByLevelId(levelId)
  
  if (modules.length === 0 && !kit) {
    return null
  }

  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0)

  return {
    id: levelId,
    levelId,
    title: `Curso ${levelId}`,
    description: '',
    duration: '9 meses (año escolar)',
    modules,
    kit,
    yearPlan: []
  }
}

// ============================================
// RESET (para desarrollo)
// ============================================

export function resetAllData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.KITS)
  localStorage.removeItem(STORAGE_KEYS.LESSONS)
  localStorage.removeItem(STORAGE_KEYS.MODULES)
  initializeData()
}
