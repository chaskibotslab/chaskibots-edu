// ============================================
// CURSO: INICIAL 2 - Exploradores Tecnológicos
// Edad: 4-5 años
// ============================================

import type { CourseData } from './types'

export const INICIAL_2: CourseData = {
  id: 'inicial-2',
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
        { id: 'i2-l1', title: 'Bienvenidos de vuelta', type: 'video', duration: '5 min', completed: false, locked: false, videoUrl: '' },
        { id: 'i2-l2', title: 'Repaso: ¿Qué es un circuito?', type: 'video', duration: '8 min', completed: false, locked: false, videoUrl: '' },
        { id: 'i2-l3', title: 'Mis logros del año pasado', type: 'activity', duration: '10 min', completed: false, locked: false },
      ]
    },
    {
      id: 'mod-i2-2',
      title: 'Módulo 2: Mi Nuevo Kit',
      description: 'Conociendo los nuevos componentes',
      lessons: [
        { id: 'i2-l4', title: 'Unboxing Kit Inicial 2', type: 'video', duration: '12 min', completed: false, locked: true, videoUrl: '' },
        { id: 'i2-l5', title: 'El generador eólico', type: 'video', duration: '10 min', completed: false, locked: true, videoUrl: '' },
        { id: 'i2-l6', title: 'Cinta de cobre conductora', type: 'tutorial', duration: '15 min', completed: false, locked: true },
        { id: 'i2-l7', title: 'Nuevos LEDs y componentes', type: 'video', duration: '10 min', completed: false, locked: true, videoUrl: '' },
      ]
    },
    {
      id: 'mod-i2-3',
      title: 'Módulo 3: Energía del Viento',
      description: 'Aprendemos sobre energía renovable',
      lessons: [
        { id: 'i2-l8', title: '¿Qué es la energía eólica?', type: 'video', duration: '10 min', completed: false, locked: true, videoUrl: '' },
        { id: 'i2-l9', title: 'Armando el generador', type: 'tutorial', duration: '25 min', completed: false, locked: true },
        { id: 'i2-l10', title: '¡Mi generador funciona!', type: 'project', duration: '30 min', completed: false, locked: true },
      ]
    },
    {
      id: 'mod-i2-4',
      title: 'Módulo 4: Circuitos con Cinta',
      description: 'Creamos circuitos usando cinta de cobre',
      lessons: [
        { id: 'i2-l11', title: 'La cinta mágica conductora', type: 'video', duration: '8 min', completed: false, locked: true, videoUrl: '' },
        { id: 'i2-l12', title: 'Dibujando circuitos', type: 'tutorial', duration: '20 min', completed: false, locked: true },
        { id: 'i2-l13', title: 'Tarjeta con circuito', type: 'project', duration: '35 min', completed: false, locked: true },
      ]
    },
    {
      id: 'mod-i2-5',
      title: 'Módulo 5: Proyectos Creativos',
      description: 'Proyectos avanzados del año',
      lessons: [
        { id: 'i2-l14', title: 'Proyecto: Casa iluminada', type: 'project', duration: '45 min', completed: false, locked: true },
        { id: 'i2-l15', title: 'Proyecto: Molino de viento', type: 'project', duration: '50 min', completed: false, locked: true },
        { id: 'i2-l16', title: 'Proyecto: Libro interactivo', type: 'project', duration: '60 min', completed: false, locked: true },
      ]
    },
    {
      id: 'mod-i2-6',
      title: 'Módulo 6: IA y Reconocimiento',
      description: 'Jugamos con inteligencia artificial',
      lessons: [
        { id: 'i2-l17', title: 'La IA reconoce colores', type: 'activity', duration: '15 min', completed: false, locked: true },
        { id: 'i2-l18', title: 'Clasificando objetos', type: 'activity', duration: '15 min', completed: false, locked: true },
        { id: 'i2-l19', title: 'Comandos de voz', type: 'activity', duration: '20 min', completed: false, locked: true },
        { id: 'i2-l20', title: 'Mi asistente robot', type: 'project', duration: '25 min', completed: false, locked: true },
      ]
    }
  ],

  kit: {
    name: 'Kit Inicial 2 - Exploradores',
    price: 35,
    components: [
      'LEDs de colores variados - 10 unidades',
      'Cables jumper de conexión - 10 unidades',
      'Pila CR2032 - 3 unidades',
      'Porta pila con switch',
      'Adhesivos temáticos de robótica y circuitos',
      'Cinta de cobre conductora - 2 metros',
      'Generador eólico mini',
      'Aspas para generador - 3 juegos',
      'Motor pequeño DC',
      'Tarjetas de proyectos - 12 tarjetas',
      'Caja de Herramientas Plástica'
    ],
    assemblySteps: [
      { step: 1, title: 'Abrir el kit', description: 'Abre la caja y revisa que todos los componentes estén completos' },
      { step: 2, title: 'Identificar componentes nuevos', description: 'Encuentra el generador eólico y la cinta de cobre' },
      { step: 3, title: 'Armar el generador', description: 'Sigue las instrucciones para ensamblar el generador eólico' },
      { step: 4, title: 'Probar el motor', description: 'Conecta el motor y sopla las aspas para ver cómo genera energía' },
      { step: 5, title: 'Organizar todo', description: 'Guarda cada componente en su lugar de la caja organizadora' },
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
