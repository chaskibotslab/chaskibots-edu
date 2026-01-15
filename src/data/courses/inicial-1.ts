// ============================================
// CURSO: INICIAL 1 - Mis Primeros Pasos en Tecnología
// Edad: 3-4 años
// ============================================

import type { CourseData } from './types'

export const INICIAL_1: CourseData = {
  id: 'inicial-1',
  title: 'Curso Inicial 1 - Mis Primeros Pasos en Tecnología',
  description: 'Introducción al mundo de la tecnología y robótica para niños de 3-4 años',
  duration: '9 meses (año escolar)',
  totalLessons: 18,
  
  // ============================================
  // MÓDULOS Y LECCIONES
  // ============================================
  modules: [
    {
      id: 'mod-i1-1',
      title: 'Módulo 1: Bienvenida al Mundo Tech',
      description: 'Conociendo qué es la tecnología y los robots',
      lessons: [
        { 
          id: 'i1-l1', 
          title: '¡Hola! Bienvenidos al curso', 
          type: 'video', 
          duration: '5 min', 
          completed: false, 
          locked: false,
          videoUrl: '', // Agregar URL de video aquí
          content: 'Introducción al curso de tecnología para niños'
        },
        { 
          id: 'i1-l2', 
          title: '¿Qué es un robot?', 
          type: 'video', 
          duration: '8 min', 
          completed: false, 
          locked: false,
          videoUrl: '',
          content: 'Explicación sencilla de qué son los robots'
        },
        { 
          id: 'i1-l3', 
          title: 'Robots en nuestra vida', 
          type: 'activity', 
          duration: '15 min', 
          completed: false, 
          locked: false,
          content: 'Identificar robots en casa y la escuela'
        },
        { 
          id: 'i1-l4', 
          title: 'Colores de la tecnología', 
          type: 'activity', 
          duration: '10 min', 
          completed: false, 
          locked: true,
          content: 'Aprender los colores de los componentes electrónicos'
        },
      ]
    },
    {
      id: 'mod-i1-2',
      title: 'Módulo 2: Conociendo Mi Kit',
      description: 'Exploramos los componentes del kit de robótica',
      lessons: [
        { 
          id: 'i1-l5', 
          title: 'Abriendo mi kit (Unboxing)', 
          type: 'video', 
          duration: '10 min', 
          completed: false, 
          locked: true,
          videoUrl: '',
          content: 'Video de unboxing del kit Inicial 1'
        },
        { 
          id: 'i1-l6', 
          title: 'Los LEDs: Luces mágicas', 
          type: 'video', 
          duration: '8 min', 
          completed: false, 
          locked: true,
          videoUrl: '',
          content: 'Conociendo los LEDs de colores'
        },
        { 
          id: 'i1-l7', 
          title: 'Cables y conexiones', 
          type: 'tutorial', 
          duration: '15 min', 
          completed: false, 
          locked: true,
          content: 'Cómo conectar cables de forma segura',
          steps: [
            'Identifica el cable rojo (positivo)',
            'Identifica el cable negro (negativo)',
            'Conecta con cuidado sin forzar'
          ]
        },
        { 
          id: 'i1-l8', 
          title: 'La pila: Energía para todo', 
          type: 'video', 
          duration: '8 min', 
          completed: false, 
          locked: true,
          videoUrl: '',
          content: 'Entendiendo la fuente de energía'
        },
      ]
    },
    {
      id: 'mod-i1-3',
      title: 'Módulo 3: Mi Primer Circuito',
      description: 'Aprendemos a encender un LED',
      lessons: [
        { 
          id: 'i1-l9', 
          title: '¿Qué es un circuito?', 
          type: 'video', 
          duration: '10 min', 
          completed: false, 
          locked: true,
          videoUrl: '',
          content: 'Concepto básico de circuito eléctrico para niños'
        },
        { 
          id: 'i1-l10', 
          title: 'Conectando el LED', 
          type: 'tutorial', 
          duration: '20 min', 
          completed: false, 
          locked: true,
          content: 'Paso a paso para conectar un LED',
          steps: [
            'Toma el LED y observa sus patitas',
            'La patita larga es el positivo (+)',
            'Conecta la patita larga al cable rojo',
            'Conecta la patita corta al cable negro',
            'Conecta a la pila y ¡observa!'
          ]
        },
        { 
          id: 'i1-l11', 
          title: '¡Mi LED enciende!', 
          type: 'project', 
          duration: '25 min', 
          completed: false, 
          locked: true,
          content: 'Proyecto de encender el primer LED'
        },
      ]
    },
    {
      id: 'mod-i1-4',
      title: 'Módulo 4: Proyectos del Año',
      description: 'Proyectos creativos para todo el año escolar',
      lessons: [
        { 
          id: 'i1-l12', 
          title: 'Proyecto: Luz Mágica', 
          type: 'project', 
          duration: '30 min', 
          completed: false, 
          locked: true,
          content: 'Crear una luz que cambia de color'
        },
        { 
          id: 'i1-l13', 
          title: 'Proyecto: Semáforo de Colores', 
          type: 'project', 
          duration: '45 min', 
          completed: false, 
          locked: true,
          content: 'Construir un semáforo con LEDs rojo, amarillo y verde'
        },
        { 
          id: 'i1-l14', 
          title: 'Proyecto: Tarjeta Luminosa', 
          type: 'project', 
          duration: '40 min', 
          completed: false, 
          locked: true,
          content: 'Tarjeta de cumpleaños con LED'
        },
        { 
          id: 'i1-l15', 
          title: 'Proyecto: Árbol de Navidad', 
          type: 'project', 
          duration: '50 min', 
          completed: false, 
          locked: true,
          content: 'Decoración navideña con LEDs de colores'
        },
        { 
          id: 'i1-l16', 
          title: 'Proyecto: Robot Amigo', 
          type: 'project', 
          duration: '60 min', 
          completed: false, 
          locked: true,
          content: 'Crear un robot simple con luces'
        },
      ]
    },
    {
      id: 'mod-i1-5',
      title: 'Módulo 5: IA para Pequeños',
      description: 'Introducción a la inteligencia artificial',
      lessons: [
        { 
          id: 'i1-l17', 
          title: '¿Qué es la IA?', 
          type: 'video', 
          duration: '8 min', 
          completed: false, 
          locked: true,
          videoUrl: '',
          content: 'Introducción a inteligencia artificial para niños'
        },
        { 
          id: 'i1-l18', 
          title: 'Jugando con colores (IA)', 
          type: 'activity', 
          duration: '15 min', 
          completed: false, 
          locked: true,
          content: 'Usar IA para reconocer colores con la cámara'
        },
      ]
    }
  ],

  // ============================================
  // KIT DE ROBÓTICA
  // ============================================
  kit: {
    name: 'Kit Inicial 1 - Mis Primeras Luces',
    price: 30,
    // Imágenes del kit desde Google Drive
    images: [
      'https://drive.google.com/uc?export=view&id=1j9PC18mcxTK1iG0jKpomPItKS3W2oFta',
      'https://drive.google.com/uc?export=view&id=1lqvCi1lTfcN-lI5X8vkq6r3Jk9QO1_lm',
      'https://drive.google.com/uc?export=view&id=1i42AvvZQx6D4H5Nqqi5H0LRKc1Qqsh6z',
      'https://drive.google.com/uc?export=view&id=1bj-aUrpPBqkYAukYxs7bHM-O_FovrhOz',
      'https://drive.google.com/uc?export=view&id=1MaME0PjBkqvVsKmsamlUlNrGX2Ih8hjJ',
      'https://drive.google.com/uc?export=view&id=1STa9iqY6p_TZR8z6CeZpcXj4qeEddpuR',
    ],
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
    assemblySteps: [
      { 
        step: 1, 
        title: 'Abrir la caja con cuidado', 
        description: 'Pide ayuda a un adulto para abrir la caja. Saca todos los componentes y colócalos sobre la mesa.',
        image: 'https://drive.google.com/uc?export=view&id=1j9PC18mcxTK1iG0jKpomPItKS3W2oFta'
      },
      { 
        step: 2, 
        title: 'Identificar cada pieza', 
        description: 'Usa las tarjetas ilustradas para identificar cada componente. ¿Puedes encontrar los LEDs de colores?',
        image: 'https://drive.google.com/uc?export=view&id=1lqvCi1lTfcN-lI5X8vkq6r3Jk9QO1_lm'
      },
      { 
        step: 3, 
        title: 'Organizar en la caja', 
        description: 'Cada pieza tiene su lugar en la caja organizadora. Coloca los LEDs juntos, los cables en otro compartimento.',
        image: 'https://drive.google.com/uc?export=view&id=1i42AvvZQx6D4H5Nqqi5H0LRKc1Qqsh6z'
      },
      { 
        step: 4, 
        title: 'Revisar la guía', 
        description: 'Lee con un adulto la guía para padres. Ahí encontrarás consejos de seguridad importantes.',
        image: 'https://drive.google.com/uc?export=view&id=1bj-aUrpPBqkYAukYxs7bHM-O_FovrhOz'
      },
      { 
        step: 5, 
        title: '¡Listo para empezar!', 
        description: 'Ya tienes todo organizado. Ahora puedes comenzar con las lecciones del curso.',
        image: 'https://drive.google.com/uc?export=view&id=1MaME0PjBkqvVsKmsamlUlNrGX2Ih8hjJ'
      }
    ]
  },

  // ============================================
  // PLAN DEL AÑO ESCOLAR
  // ============================================
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
}
