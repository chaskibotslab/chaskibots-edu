// ============================================
// ESTRUCTURA DE BASE DE DATOS PARA AIRTABLE
// ============================================
// Este archivo define la estructura que debes crear en Airtable
// y proporciona los datos iniciales para importar

export interface User {
  id: string
  email: string
  password: string // En producción usar hash
  name: string
  levelId: string
  role: 'student' | 'teacher' | 'admin'
  progress: number
  createdAt: string
  lastLogin: string
}

export interface Level {
  id: string
  name: string
  fullName: string
  category: string
  ageRange: string
  gradeNumber: number
  kitPrice: number
  hasHacking: boolean
  hasAdvancedIA: boolean
  color: string
  icon: string
}

export interface Kit {
  id: string
  levelId: string
  name: string
  description: string
  components: string
  skills: string
  imageUrl: string
  videoUrl: string
  tutorialUrl: string
}

export interface Lesson {
  id: string
  levelId: string
  area: 'robotica' | 'ia' | 'hacking'
  title: string
  description: string
  videoUrl: string
  duration: number
  order: number
  isLocked: boolean
}

export interface Progress {
  id: string
  odUserId: string
  lessonId: string
  completed: boolean
  score: number
  completedAt: string
}

// ============================================
// DATOS DE KITS POR NIVEL (basado en planificación real)
// ============================================

export const KITS_DATA: Kit[] = [
  {
    id: 'kit-inicial-2',
    levelId: 'inicial-2',
    name: 'Kit Inicial',
    description: 'Kit Inicial: Led, cables jumper, pila CR 2032, Adhesivo Temático de robótica y circuitos, Cinta de cobre y Generador heólico',
    components: 'LED, Cables jumper, Pila CR 2032, Adhesivo temático, Cinta de cobre, Generador eólico, Caja de Herramientas Plástica',
    skills: 'Kit Inicial, Cinta y Generador heólico. Introducción a circuitos básicos.',
    imageUrl: '', // Agregar URL de Google Drive
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-primero-egb',
    levelId: 'primero-egb',
    name: 'Kit 3 Robots Preparatoria',
    description: 'Kit 3 Robots: Robot Con articulaciones (Motor - engranajes plásticos, port apila, cables de conexión, topes plásticos), Robot pintor, robot 4x4',
    components: 'Robot con articulaciones, Motor con engranajes plásticos, Port apila, Cables de conexión, Topes plásticos, Robot pintor, Robot 4x4, Caja de Herramientas Plástica',
    skills: 'Lectoescritura inicial con enfoque en vocabulario STEM. Comprensión de números y operaciones básicas, incluyendo conceptos de medición y lógica. Uso de kits de robótica sencillos para ensamblar y controlar robots básicos.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-segundo-egb',
    levelId: 'segundo-egb',
    name: 'Kit 3 Robots Elemental',
    description: 'Kit 3 robots: Robot radiocontrolado, Robot navegación acuática, Lámpara Moderna',
    components: 'Robot radiocontrolado, Robot navegación acuática, Lámpara Moderna, Caja de Herramientas Plástica',
    skills: 'Fortalecimiento de la lectoescritura y habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples y resolución de problemas a través de proyectos STEM.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-tercero-egb',
    levelId: 'tercero-egb',
    name: 'Kit 3 Robots Elemental',
    description: 'Kit 3 robots: Robot Escalador, Carucel, Robot Heólico',
    components: 'Robot Escalador, Carucel, Robot Heólico, Caja de Herramientas Plástica',
    skills: 'Fortalecimiento de la lectoescritura y habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples y resolución de problemas a través de proyectos STEM.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-cuarto-egb',
    levelId: 'cuarto-egb',
    name: 'Kit Rueda de la Fortuna + FM',
    description: 'Kit Rueda de la fortuna, FM 76-108MHz',
    components: 'Rueda de la fortuna, Radio FM 76-108MHz, Caja de Herramientas Plástica',
    skills: 'Fortalecimiento de la lectoescritura y habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples y resolución de problemas a través de proyectos STEM.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-quinto-egb',
    levelId: 'quinto-egb',
    name: 'Kit Rueda + Radio RF-FM',
    description: 'Kit Rueda de la fortuna, Radio RF - FM',
    components: 'Rueda de la fortuna, Radio RF-FM, Caja de Herramientas Plástica',
    skills: 'Fortalecimiento de la lectoescritura y habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples y resolución de problemas a través de proyectos STEM.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-sexto-egb',
    levelId: 'sexto-egb',
    name: 'Kit Robot 4 en 1 + Circuito',
    description: 'Kit: Robot 4 en 1, Circuito electrónico generador aleatorio con micrófono, Avión DIY',
    components: 'Robot 4 en 1, Circuito electrónico generador aleatorio con micrófono, Avión DIY, Caja de Herramientas Plástica',
    skills: 'Lectura comprensiva y producción de textos relacionados con STEM. Resolución de problemas matemáticos aplicados a proyectos de robótica. Construcción y programación de robots más complejos y experimentación con circuitos electrónicos.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-septimo-egb',
    levelId: 'septimo-egb',
    name: 'Kit Robot 4 en 1 + Avión',
    description: 'Kit: Robot 4 en 1, Circuito electrónico generador aleatorio con micrófono, Avión DIY',
    components: 'Robot 4 en 1, Circuito electrónico generador aleatorio con micrófono, Avión DIY, Caja de Herramientas Plástica',
    skills: 'Lectura comprensiva y producción de textos relacionados con STEM. Resolución de problemas matemáticos aplicados a proyectos de robótica. Construcción y programación de robots más complejos y experimentación con circuitos electrónicos.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-octavo-egb',
    levelId: 'octavo-egb',
    name: 'Carro Bluetooth WiFi ESP32',
    description: 'Carro Bluetooth con tb6612fng, Esp32 de 30 pines, adaptador de batería, switch 3 terminales, Cables jumper de conexión M_M, M-H, H-H, 2 motores reductores TT, Placa electrónica controladora de motores, unida con esp32, chassis impreso en 3D, juegos de tornillos m3',
    components: 'TB6612FNG, ESP32 30 pines, Adaptador batería, Switch 3 terminales, Cables jumper M_M/M-H/H-H, 2 Motores reductores TT, Placa controladora, Chassis 3D, Tornillos m3, Caja de Herramientas Plástica',
    skills: 'Carro Bluetooth con WiFi. Programación avanzada con ESP32.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-noveno-egb',
    levelId: 'noveno-egb',
    name: 'Seguidor de Línea 2 Sensores',
    description: 'Seguidor de línea 2 sensores/2 Sensores infrarrojos, tb6612fng, Esp super mini, adaptador de batería, switch 3 terminales, Cables jumper de conexión M_M, M-H, H-H, 2 motores reductores TT, Placa electrónica controladora de motores, unida con esp super mini, chassis impreso en 3D',
    components: '2 Sensores infrarrojos, TB6612FNG, ESP Super Mini, Adaptador batería, Switch, Cables jumper, 2 Motores TT, Placa controladora, Chassis 3D, Tornillos m3, Caja de Herramientas Plástica',
    skills: 'Seguidor de línea 2. Programación de sensores infrarrojos.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-decimo-egb',
    levelId: 'decimo-egb',
    name: 'Robot Evita Obstáculos',
    description: 'Robot Evita Obstáculos con 1 Sensor ultrasónico, tb6612fng, Esp32 de 30 pines, adaptador de batería, switch 3 terminales, Cables jumper de conexión M_M, M-H, H-H, 2 motores reductores TT, Placa electrónica controladora de motores, unida con esp32, chassis impreso en 3D',
    components: 'Sensor ultrasónico, TB6612FNG, ESP32 30 pines, Adaptador batería, Switch, Cables jumper, 2 Motores TT, Placa controladora, Chassis 3D, Tornillos m3, Caja de Herramientas Plástica',
    skills: 'Robot Evita Obstáculos. Programación de sensores ultrasónicos.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-primero-bach',
    levelId: 'primero-bach',
    name: 'Robot Otto + Kit Práctico',
    description: 'Robot otto (4 servo motores, impresión 3d, shield de arduino nano, arduino nano, cable de conexión, Cables jumper de conexión M_M, M-H, H-H, sensor ultrasónico, buzzer, porta pilas AA×4)',
    components: '4 Servo motores, Impresión 3D, Shield Arduino Nano, Arduino Nano, Cable conexión, Cables jumper, Sensor ultrasónico, Buzzer, Porta pilas AA×4, Caja de Herramientas Plástica',
    skills: 'Robot Otto + Kit Práctico. Programación avanzada con Arduino.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-segundo-bach',
    levelId: 'segundo-bach',
    name: 'Kit Robot Soccer y Mini Sumo',
    description: 'Kit Robot soccer y mini sumo: tb6612fng, Esp32 de 30 pines, adaptador de batería, switch 3 terminales, Cables jumper de conexión M_M, M-H, H-H, 2 motores reductores TT, Placa electrónica controladora de motores, unida con esp32, chassis impreso en 3D, juegos de tornillos m3, juegos de tuercas 3m',
    components: 'TB6612FNG, ESP32 30 pines, Adaptador batería, Switch, Cables jumper, 2 Motores TT, Placa controladora, Chassis 3D impreso, Tornillos y tuercas m3, Caja de Herramientas Plástica',
    skills: 'Profundización en áreas específicas de STEM, robótica y electrónica. Desarrollo de proyectos integrados que combinan múltiples disciplinas STEM. Preparación para la educación superior o el mercado laboral con habilidades prácticas en programación y robótica avanzada.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  },
  {
    id: 'kit-tercero-bach',
    levelId: 'tercero-bach',
    name: 'Kit IoT ESP32',
    description: 'ESP32, sensor de temperatura, sensor de luz, sensor de humedad, relé, PCB, protoboard, Cables jumper de conexión M_M, M-H, H-H, 6 LEDS, 1 RGB, interruptor',
    components: 'ESP32, Sensor temperatura, Sensor luz, Sensor humedad, Relé, PCB, Protoboard, Cables jumper, 6 LEDs, 1 RGB, Interruptor, Caja de Herramientas Plástica',
    skills: 'Profundización en áreas específicas IOT, Internet de las cosas con Telegram. Proyectos de domótica y automatización.',
    imageUrl: '',
    videoUrl: '',
    tutorialUrl: ''
  }
]

// ============================================
// MODELOS DE IA POR NIVEL
// ============================================

export const AI_MODELS_BY_LEVEL = {
  // Niveles básicos (Inicial - 4° EGB): Modelos simples y visuales
  basic: {
    minGrade: 0,
    maxGrade: 4,
    models: [
      { id: 'color-detection', name: 'Detector de Colores', description: 'Identifica colores básicos en la cámara' },
      { id: 'shape-recognition', name: 'Reconocedor de Formas', description: 'Detecta círculos, cuadrados, triángulos' },
      { id: 'face-detection', name: 'Detector de Caras', description: 'Encuentra caras en la imagen (sin identificar)' },
    ]
  },
  // Niveles intermedios (5° - 7° EGB): COCO-SSD y clasificación
  intermediate: {
    minGrade: 5,
    maxGrade: 7,
    models: [
      { id: 'coco-ssd', name: 'COCO-SSD', description: 'Detecta 80 tipos de objetos comunes' },
      { id: 'mobilenet', name: 'MobileNet', description: 'Clasifica imágenes en 1000 categorías' },
      { id: 'posenet', name: 'PoseNet', description: 'Detecta poses del cuerpo humano' },
    ]
  },
  // Niveles avanzados (8° EGB - 3° BGU): Modelos completos
  advanced: {
    minGrade: 8,
    maxGrade: 13,
    models: [
      { id: 'coco-ssd', name: 'COCO-SSD', description: 'Detecta 80 tipos de objetos comunes' },
      { id: 'mobilenet', name: 'MobileNet', description: 'Clasifica imágenes en 1000 categorías' },
      { id: 'posenet', name: 'PoseNet', description: 'Detecta poses del cuerpo humano' },
      { id: 'handpose', name: 'HandPose', description: 'Detecta gestos de las manos' },
      { id: 'facemesh', name: 'FaceMesh', description: 'Malla facial 3D con 468 puntos' },
      { id: 'speech-commands', name: 'Speech Commands', description: 'Reconoce comandos de voz' },
    ]
  }
}

// ============================================
// FUNCIÓN HELPER PARA OBTENER MODELOS POR NIVEL
// ============================================

export function getAIModelsForLevel(gradeNumber: number) {
  if (gradeNumber <= 4) return AI_MODELS_BY_LEVEL.basic.models
  if (gradeNumber <= 7) return AI_MODELS_BY_LEVEL.intermediate.models
  return AI_MODELS_BY_LEVEL.advanced.models
}

export function canAccessHacking(gradeNumber: number): boolean {
  return gradeNumber >= 8 // Desde 8° EGB
}

export function canAccessAdvancedIA(gradeNumber: number): boolean {
  return gradeNumber >= 6 // Desde 6° EGB
}
