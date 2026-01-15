// ============================================
// ESTRUCTURA DE CURSOS - ADMINISTRABLE DESDE AIRTABLE
// ============================================
// Este archivo contiene la estructura de datos de los cursos
// En producción, estos datos vendrán de Airtable

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

export interface KitComponent {
  name: string
  quantity?: number
  image?: string
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

export interface CourseData {
  title: string
  description: string
  duration: string
  totalLessons: number
  modules: Module[]
  kit: {
    name: string
    price: number
    components: string[]
    assemblySteps: AssemblyStep[]
  }
  yearPlan: YearPlanItem[]
}

// ============================================
// DATOS DE CURSOS POR NIVEL
// ============================================

export const COURSES: Record<string, CourseData> = {
  'inicial-1': {
    title: 'Curso Inicial 1 - Mis Primeros Pasos en Tecnología',
    description: 'Introducción al mundo de la tecnología y robótica para niños de 3-4 años',
    duration: '9 meses (año escolar)',
    totalLessons: 18,
    modules: [
      {
        id: 'mod-i1-1',
        title: 'Módulo 1: Bienvenida al Mundo Tech',
        description: 'Conociendo qué es la tecnología y los robots',
        lessons: [
          { id: 'l1', title: '¡Hola! Bienvenidos al curso', type: 'video', duration: '5 min', completed: false, locked: false },
          { id: 'l2', title: '¿Qué es un robot?', type: 'video', duration: '8 min', completed: false, locked: false },
          { id: 'l3', title: 'Robots en nuestra vida', type: 'activity', duration: '15 min', completed: false, locked: false },
          { id: 'l4', title: 'Colores de la tecnología', type: 'activity', duration: '10 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i1-2',
        title: 'Módulo 2: Conociendo Mi Kit',
        description: 'Exploramos los componentes del kit de robótica',
        lessons: [
          { id: 'l5', title: 'Abriendo mi kit (Unboxing)', type: 'video', duration: '10 min', completed: false, locked: true },
          { id: 'l6', title: 'Los LEDs: Luces mágicas', type: 'video', duration: '8 min', completed: false, locked: true },
          { id: 'l7', title: 'Cables y conexiones', type: 'tutorial', duration: '15 min', completed: false, locked: true },
          { id: 'l8', title: 'La pila: Energía para todo', type: 'video', duration: '8 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i1-3',
        title: 'Módulo 3: Mi Primer Circuito',
        description: 'Aprendemos a encender un LED',
        lessons: [
          { id: 'l9', title: '¿Qué es un circuito?', type: 'video', duration: '10 min', completed: false, locked: true },
          { id: 'l10', title: 'Conectando el LED', type: 'tutorial', duration: '20 min', completed: false, locked: true },
          { id: 'l11', title: '¡Mi LED enciende!', type: 'project', duration: '25 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i1-4',
        title: 'Módulo 4: Proyectos del Año',
        description: 'Proyectos creativos para todo el año escolar',
        lessons: [
          { id: 'l12', title: 'Proyecto: Luz Mágica', type: 'project', duration: '30 min', completed: false, locked: true },
          { id: 'l13', title: 'Proyecto: Semáforo de Colores', type: 'project', duration: '45 min', completed: false, locked: true },
          { id: 'l14', title: 'Proyecto: Tarjeta Luminosa', type: 'project', duration: '40 min', completed: false, locked: true },
          { id: 'l15', title: 'Proyecto: Árbol de Navidad', type: 'project', duration: '50 min', completed: false, locked: true },
          { id: 'l16', title: 'Proyecto: Robot Amigo', type: 'project', duration: '60 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i1-5',
        title: 'Módulo 5: IA para Pequeños',
        description: 'Introducción a la inteligencia artificial',
        lessons: [
          { id: 'l17', title: '¿Qué es la IA?', type: 'video', duration: '8 min', completed: false, locked: true },
          { id: 'l18', title: 'Jugando con colores (IA)', type: 'activity', duration: '15 min', completed: false, locked: true },
        ]
      }
    ],
    kit: {
      name: 'Kit Inicial 1 - Mis Primeras Luces',
      price: 30,
      components: [
        'LEDs de colores (rojo, verde, amarillo, azul)',
        'Cables de conexión seguros para niños',
        'Pila botón CR2032 (2 unidades)',
        'Porta pila seguro',
        'Stickers temáticos de robótica',
        'Cinta conductora de cobre',
        'Tarjetas de actividades ilustradas',
        'Caja organizadora con compartimentos',
        'Guía para padres y maestros'
      ],
      assemblySteps: [
        { 
          step: 1, 
          title: 'Abrir la caja con cuidado', 
          description: 'Pide ayuda a un adulto para abrir la caja. Saca todos los componentes y colócalos sobre la mesa.',
          image: ''
        },
        { 
          step: 2, 
          title: 'Identificar cada pieza', 
          description: 'Usa las tarjetas ilustradas para identificar cada componente. ¿Puedes encontrar los LEDs de colores?',
          image: ''
        },
        { 
          step: 3, 
          title: 'Organizar en la caja', 
          description: 'Cada pieza tiene su lugar en la caja organizadora. Coloca los LEDs juntos, los cables en otro compartimento.',
          image: ''
        },
        { 
          step: 4, 
          title: 'Revisar la guía', 
          description: 'Lee con un adulto la guía para padres. Ahí encontrarás consejos de seguridad importantes.',
          image: ''
        },
        { 
          step: 5, 
          title: '¡Listo para empezar!', 
          description: 'Ya tienes todo organizado. Ahora puedes comenzar con las lecciones del curso.',
          image: ''
        }
      ]
    },
    yearPlan: [
      { month: 'Septiembre', topic: 'Bienvenida y conociendo el kit', project: 'Encender mi primer LED' },
      { month: 'Octubre', topic: 'Colores y circuitos básicos', project: 'Semáforo de colores' },
      { month: 'Noviembre', topic: 'Formas y patrones luminosos', project: 'Figuras con LEDs' },
      { month: 'Diciembre', topic: 'Proyecto especial navideño', project: 'Árbol de navidad LED' },
      { month: 'Enero', topic: 'Repaso y práctica libre', project: 'Creación libre' },
      { month: 'Febrero', topic: 'Secuencias de luces', project: 'Luces intermitentes' },
      { month: 'Marzo', topic: 'Creatividad y diseño', project: 'Tarjeta luminosa' },
      { month: 'Abril', topic: 'Trabajo en equipo', project: 'Proyecto grupal' },
      { month: 'Mayo', topic: 'Presentación final', project: 'Expo de proyectos' },
    ]
  },

  'inicial-2': {
    title: 'Curso Inicial 2 - Exploradores Tecnológicos',
    description: 'Continuamos explorando la tecnología y robótica para niños de 4-5 años',
    duration: '9 meses (año escolar)',
    totalLessons: 20,
    modules: [
      {
        id: 'mod-i2-1',
        title: 'Módulo 1: Recordando lo Aprendido',
        description: 'Repaso de conceptos básicos de tecnología',
        lessons: [
          { id: 'l1', title: 'Bienvenidos de vuelta', type: 'video', duration: '5 min', completed: false, locked: false },
          { id: 'l2', title: 'Repaso: ¿Qué es un circuito?', type: 'video', duration: '8 min', completed: false, locked: false },
          { id: 'l3', title: 'Mis logros del año pasado', type: 'activity', duration: '10 min', completed: false, locked: false },
        ]
      },
      {
        id: 'mod-i2-2',
        title: 'Módulo 2: Mi Nuevo Kit',
        description: 'Conociendo los nuevos componentes',
        lessons: [
          { id: 'l4', title: 'Unboxing Kit Inicial 2', type: 'video', duration: '12 min', completed: false, locked: true },
          { id: 'l5', title: 'El generador eólico', type: 'video', duration: '10 min', completed: false, locked: true },
          { id: 'l6', title: 'Cinta de cobre conductora', type: 'tutorial', duration: '15 min', completed: false, locked: true },
          { id: 'l7', title: 'Nuevos LEDs y componentes', type: 'video', duration: '10 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i2-3',
        title: 'Módulo 3: Energía del Viento',
        description: 'Aprendemos sobre energía renovable',
        lessons: [
          { id: 'l8', title: '¿Qué es la energía eólica?', type: 'video', duration: '10 min', completed: false, locked: true },
          { id: 'l9', title: 'Armando el generador', type: 'tutorial', duration: '25 min', completed: false, locked: true },
          { id: 'l10', title: '¡Mi generador funciona!', type: 'project', duration: '30 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i2-4',
        title: 'Módulo 4: Circuitos con Cinta',
        description: 'Creamos circuitos usando cinta de cobre',
        lessons: [
          { id: 'l11', title: 'La cinta mágica conductora', type: 'video', duration: '8 min', completed: false, locked: true },
          { id: 'l12', title: 'Dibujando circuitos', type: 'tutorial', duration: '20 min', completed: false, locked: true },
          { id: 'l13', title: 'Tarjeta con circuito', type: 'project', duration: '35 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i2-5',
        title: 'Módulo 5: Proyectos Creativos',
        description: 'Proyectos avanzados del año',
        lessons: [
          { id: 'l14', title: 'Proyecto: Casa iluminada', type: 'project', duration: '45 min', completed: false, locked: true },
          { id: 'l15', title: 'Proyecto: Molino de viento', type: 'project', duration: '50 min', completed: false, locked: true },
          { id: 'l16', title: 'Proyecto: Libro interactivo', type: 'project', duration: '60 min', completed: false, locked: true },
        ]
      },
      {
        id: 'mod-i2-6',
        title: 'Módulo 6: IA y Reconocimiento',
        description: 'Jugamos con inteligencia artificial',
        lessons: [
          { id: 'l17', title: 'La IA reconoce colores', type: 'activity', duration: '15 min', completed: false, locked: true },
          { id: 'l18', title: 'Clasificando objetos', type: 'activity', duration: '15 min', completed: false, locked: true },
          { id: 'l19', title: 'Comandos de voz', type: 'activity', duration: '20 min', completed: false, locked: true },
          { id: 'l20', title: 'Mi asistente robot', type: 'project', duration: '25 min', completed: false, locked: true },
        ]
      }
    ],
    kit: {
      name: 'Kit Inicial 2 - Exploradores',
      price: 35,
      components: [
        'LEDs de colores variados',
        'Cables jumper de conexión',
        'Pila CR2032 (3 unidades)',
        'Porta pila con switch',
        'Adhesivos temáticos de robótica y circuitos',
        'Cinta de cobre conductora (rollo)',
        'Generador eólico mini',
        'Aspas para generador',
        'Motor pequeño DC',
        'Tarjetas de proyectos',
        'Caja de Herramientas Plástica'
      ],
      assemblySteps: [
        { step: 1, title: 'Abrir el kit', description: 'Abre la caja y revisa que todos los componentes estén completos', image: '' },
        { step: 2, title: 'Identificar componentes nuevos', description: 'Encuentra el generador eólico y la cinta de cobre', image: '' },
        { step: 3, title: 'Armar el generador', description: 'Sigue las instrucciones para ensamblar el generador eólico', image: '' },
        { step: 4, title: 'Probar el motor', description: 'Conecta el motor y sopla las aspas para ver cómo genera energía', image: '' },
        { step: 5, title: 'Organizar todo', description: 'Guarda cada componente en su lugar de la caja organizadora', image: '' },
      ]
    },
    yearPlan: [
      { month: 'Septiembre', topic: 'Repaso y nuevo kit', project: 'Circuito de bienvenida' },
      { month: 'Octubre', topic: 'Energía eólica', project: 'Mi generador de viento' },
      { month: 'Noviembre', topic: 'Circuitos con cinta', project: 'Tarjeta luminosa' },
      { month: 'Diciembre', topic: 'Proyecto navideño', project: 'Decoración con LEDs' },
      { month: 'Enero', topic: 'Creatividad libre', project: 'Diseño propio' },
      { month: 'Febrero', topic: 'Construcciones', project: 'Casa iluminada' },
      { month: 'Marzo', topic: 'Energías renovables', project: 'Molino funcional' },
      { month: 'Abril', topic: 'Libros interactivos', project: 'Mi libro con luces' },
      { month: 'Mayo', topic: 'Expo final', project: 'Presentación de proyectos' },
    ]
  }
}

// Función para obtener datos del curso por nivel
export function getCourseData(levelId: string): CourseData | null {
  return COURSES[levelId] || null
}

// Función para calcular progreso
export function calculateProgress(modules: Module[]): number {
  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0)
  const completedLessons = modules.reduce((acc, mod) => 
    acc + mod.lessons.filter(l => l.completed).length, 0
  )
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
}
