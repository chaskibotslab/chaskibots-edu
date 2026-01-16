// Tipos para TypeScript
export interface EducationLevel {
  id: string
  name: string
  fullName: string
  category: 'inicial' | 'preparatoria' | 'elemental' | 'media' | 'superior' | 'bachillerato'
  ageRange: string
  gradeNumber: number
  color: string
  neonColor: string
  icon: string
  kitPrice: number
  hasHacking: boolean
  hasAdvancedIA: boolean
}

export interface KitInfo {
  levelId: string
  kitName: string
  description: string
  components: string[]
  skills: string[]
  imageUrl: string
  videoUrl: string
}

export interface AIModel {
  id: string
  name: string
  description: string
  minLevel: number
  type: 'vision' | 'audio' | 'nlp' | 'multimodal'
}

// Niveles educativos con información completa basada en planificación ChaskiBots
export const EDUCATION_LEVELS: EducationLevel[] = [
  { 
    id: 'inicial-1', 
    name: 'Inicial 1', 
    fullName: 'Educación Inicial 1',
    category: 'inicial',
    ageRange: '3-4 años', 
    gradeNumber: -1,
    color: 'from-fuchsia-500 to-pink-600', 
    neonColor: '#e879f9',
    icon: 'Baby',
    kitPrice: 30,
    hasHacking: false,
    hasAdvancedIA: false
  },
  { 
    id: 'inicial-2', 
    name: 'Inicial 2', 
    fullName: 'Educación Inicial 2',
    category: 'inicial',
    ageRange: '4-5 años', 
    gradeNumber: 0,
    color: 'from-pink-500 to-rose-600', 
    neonColor: '#ff6b9d',
    icon: 'Backpack',
    kitPrice: 35,
    hasHacking: false,
    hasAdvancedIA: false
  },
  { 
    id: 'primero-egb', 
    name: '1° EGB', 
    fullName: 'Primero de EGB - Preparatoria',
    category: 'preparatoria',
    ageRange: '5-6 años', 
    gradeNumber: 1,
    color: 'from-orange-500 to-amber-600', 
    neonColor: '#ffa726',
    icon: 'Pencil',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false
  },
  { 
    id: 'segundo-egb', 
    name: '2° EGB', 
    fullName: 'Segundo de EGB - Elemental',
    category: 'elemental',
    ageRange: '6-7 años', 
    gradeNumber: 2,
    color: 'from-amber-500 to-yellow-600', 
    neonColor: '#ffca28',
    icon: 'BookOpen',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false
  },
  { 
    id: 'tercero-egb', 
    name: '3° EGB', 
    fullName: 'Tercero de EGB - Elemental',
    category: 'elemental',
    ageRange: '7-8 años', 
    gradeNumber: 3,
    color: 'from-yellow-500 to-lime-600', 
    neonColor: '#c0ca33',
    icon: 'FlaskConical',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false
  },
  { 
    id: 'cuarto-egb', 
    name: '4° EGB', 
    fullName: 'Cuarto de EGB - Elemental',
    category: 'elemental',
    ageRange: '8-9 años', 
    gradeNumber: 4,
    color: 'from-lime-500 to-green-600', 
    neonColor: '#7cb342',
    icon: 'Bot',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false
  },
  { 
    id: 'quinto-egb', 
    name: '5° EGB', 
    fullName: 'Quinto de EGB - Media',
    category: 'media',
    ageRange: '9-10 años', 
    gradeNumber: 5,
    color: 'from-green-500 to-emerald-600', 
    neonColor: '#43a047',
    icon: 'Lightbulb',
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false
  },
  { 
    id: 'sexto-egb', 
    name: '6° EGB', 
    fullName: 'Sexto de EGB - Media',
    category: 'media',
    ageRange: '10-11 años', 
    gradeNumber: 6,
    color: 'from-emerald-500 to-teal-600', 
    neonColor: '#26a69a',
    icon: 'Zap',
    kitPrice: 70,
    hasHacking: false,
    hasAdvancedIA: true
  },
  { 
    id: 'septimo-egb', 
    name: '7° EGB', 
    fullName: 'Séptimo de EGB - Media',
    category: 'media',
    ageRange: '11-12 años', 
    gradeNumber: 7,
    color: 'from-teal-500 to-cyan-600', 
    neonColor: '#00acc1',
    icon: 'Gamepad2',
    kitPrice: 70,
    hasHacking: false,
    hasAdvancedIA: true
  },
  { 
    id: 'octavo-egb', 
    name: '8° EGB', 
    fullName: 'Octavo de EGB - Superior',
    category: 'superior',
    ageRange: '12-13 años', 
    gradeNumber: 8,
    color: 'from-cyan-500 to-sky-600', 
    neonColor: '#039be5',
    icon: 'Wrench',
    kitPrice: 75,
    hasHacking: true,
    hasAdvancedIA: true
  },
  { 
    id: 'noveno-egb', 
    name: '9° EGB', 
    fullName: 'Noveno de EGB - Superior',
    category: 'superior',
    ageRange: '13-14 años', 
    gradeNumber: 9,
    color: 'from-sky-500 to-blue-600', 
    neonColor: '#1e88e5',
    icon: 'Settings',
    kitPrice: 75,
    hasHacking: true,
    hasAdvancedIA: true
  },
  { 
    id: 'decimo-egb', 
    name: '10° EGB', 
    fullName: 'Décimo de EGB - Superior',
    category: 'superior',
    ageRange: '14-15 años', 
    gradeNumber: 10,
    color: 'from-blue-500 to-indigo-600', 
    neonColor: '#3949ab',
    icon: 'Laptop',
    kitPrice: 75,
    hasHacking: true,
    hasAdvancedIA: true
  },
  { 
    id: 'primero-bach', 
    name: '1° BGU', 
    fullName: 'Primero de Bachillerato General Unificado',
    category: 'bachillerato',
    ageRange: '15-16 años', 
    gradeNumber: 11,
    color: 'from-indigo-500 to-violet-600', 
    neonColor: '#5e35b1',
    icon: 'Brain',
    kitPrice: 80,
    hasHacking: true,
    hasAdvancedIA: true
  },
  { 
    id: 'segundo-bach', 
    name: '2° BGU', 
    fullName: 'Segundo de Bachillerato General Unificado',
    category: 'bachillerato',
    ageRange: '16-17 años', 
    gradeNumber: 12,
    color: 'from-violet-500 to-purple-600', 
    neonColor: '#8e24aa',
    icon: 'ShieldCheck',
    kitPrice: 75,
    hasHacking: true,
    hasAdvancedIA: true
  },
  { 
    id: 'tercero-bach', 
    name: '3° BGU', 
    fullName: 'Tercero de Bachillerato General Unificado',
    category: 'bachillerato',
    ageRange: '17-18 años', 
    gradeNumber: 13,
    color: 'from-purple-500 to-fuchsia-600', 
    neonColor: '#d81b60',
    icon: 'Rocket',
    kitPrice: 40,
    hasHacking: true,
    hasAdvancedIA: true
  },
]

export const SUBJECT_AREAS = [
  {
    id: 'robotica',
    name: 'Robótica',
    description: 'Programación, diseño y electrónica',
    icon: '🤖',
    color: 'bg-blue-500',
    topics: ['Programación por bloques', 'Arduino', 'Sensores', 'Motores', 'Diseño 3D']
  },
  {
    id: 'inteligencia-artificial',
    name: 'Inteligencia Artificial',
    description: 'Reconocimiento de imágenes, voz y machine learning',
    icon: '🧠',
    color: 'bg-purple-500',
    topics: ['Reconocimiento de objetos', 'Clasificación de imágenes', 'Reconocimiento de voz', 'Chatbots']
  },
  {
    id: 'hacking-etico',
    name: 'Hacking Ético',
    description: 'Seguridad informática y ciberseguridad',
    icon: '🔐',
    color: 'bg-green-500',
    topics: ['Seguridad básica', 'Contraseñas seguras', 'Redes', 'Pentesting básico']
  },
]

export const SIMULATORS = [
  // Programación por bloques (sin registro)
  {
    id: 'blockly',
    name: 'Blockly Games',
    description: 'Juegos de programación por bloques - Sin registro',
    url: 'https://blockly.games/?lang=es',
    icon: 'Puzzle',
    levels: ['inicial-1', 'inicial-2', 'primero-egb', 'segundo-egb', 'tercero-egb', 'cuarto-egb'],
    category: 'bloques',
    requiresLogin: false
  },
  {
    id: 'scratch',
    name: 'Scratch',
    description: 'Editor de proyectos con bloques - Sin registro para probar',
    url: 'https://scratch.mit.edu/projects/editor/',
    icon: 'Cat',
    levels: ['tercero-egb', 'cuarto-egb', 'quinto-egb', 'sexto-egb', 'septimo-egb'],
    category: 'bloques',
    requiresLogin: false
  },
  {
    id: 'makecode-arcade',
    name: 'MakeCode Arcade',
    description: 'Crea videojuegos 2D - Sin registro',
    url: 'https://arcade.makecode.com/#editor',
    icon: 'Gamepad2',
    levels: ['quinto-egb', 'sexto-egb', 'septimo-egb', 'octavo-egb'],
    category: 'bloques',
    requiresLogin: false
  },
  {
    id: 'makecode-microbit',
    name: 'MakeCode micro:bit',
    description: 'Programa micro:bit con bloques o JavaScript - Sin registro',
    url: 'https://makecode.microbit.org/',
    icon: 'Cpu',
    levels: ['cuarto-egb', 'quinto-egb', 'sexto-egb', 'septimo-egb', 'octavo-egb'],
    category: 'bloques',
    requiresLogin: false
  },
  // Python (sin registro)
  {
    id: 'trinket-python',
    name: 'Trinket Python',
    description: 'Ejecuta Python en el navegador - Sin registro',
    url: 'https://trinket.io/python',
    icon: 'Code',
    levels: ['sexto-egb', 'septimo-egb', 'octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'python',
    requiresLogin: false
  },
  {
    id: 'programiz-python',
    name: 'Programiz Python',
    description: 'Compilador Python online - Sin registro',
    url: 'https://www.programiz.com/python-programming/online-compiler/',
    icon: 'Terminal',
    levels: ['sexto-egb', 'septimo-egb', 'octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'python',
    requiresLogin: false
  },
  {
    id: 'replit-python',
    name: 'Replit Python',
    description: 'IDE Python completo en la nube',
    url: 'https://replit.com/languages/python3',
    icon: 'Code2',
    levels: ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'python',
    requiresLogin: false
  },
  // MicroPython (sin registro)
  {
    id: 'micropython-simulator',
    name: 'MicroPython Simulator',
    description: 'Simula MicroPython en ESP32/Pico - Sin registro',
    url: 'https://wokwi.com/projects/new/micropython-esp32',
    icon: 'Microchip',
    levels: ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'micropython',
    requiresLogin: false
  },
  {
    id: 'micropython-pico',
    name: 'Raspberry Pi Pico Simulator',
    description: 'Simula Raspberry Pi Pico con MicroPython - Sin registro',
    url: 'https://wokwi.com/projects/new/micropython-pi-pico',
    icon: 'CircuitBoard',
    levels: ['noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'micropython',
    requiresLogin: false
  },
  // Arduino y Electrónica (sin registro)
  {
    id: 'wokwi',
    name: 'Wokwi Arduino',
    description: 'Simulador de Arduino y ESP32 - Sin registro',
    url: 'https://wokwi.com/projects/new/arduino-uno',
    icon: 'Zap',
    levels: ['septimo-egb', 'octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'electronica',
    requiresLogin: false
  },
  {
    id: 'tinkercad',
    name: 'Tinkercad Circuits',
    description: 'Simulación de electrónica y Arduino',
    url: 'https://www.tinkercad.com/circuits',
    icon: 'Cable',
    levels: ['sexto-egb', 'septimo-egb', 'octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'electronica',
    requiresLogin: true
  },
  {
    id: 'falstad-circuit',
    name: 'Falstad Circuit Simulator',
    description: 'Simulador de circuitos electrónicos - Sin registro',
    url: 'https://www.falstad.com/circuit/circuitjs.html',
    icon: 'Activity',
    levels: ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'electronica',
    requiresLogin: false
  },
  // Robótica Industrial y CNC (sin registro)
  {
    id: 'robot-virtual',
    name: 'Robot Virtual Works',
    description: 'Simulador de brazos robóticos industriales - Sin registro',
    url: 'https://www.robotvirtualworlds.com/virtualbrick/',
    icon: 'Bot',
    levels: ['noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'robotica-industrial',
    requiresLogin: false
  },
  {
    id: 'openbuilds-cam',
    name: 'OpenBuilds CAM',
    description: 'Generador de G-Code para CNC - Sin registro',
    url: 'https://cam.openbuilds.com/',
    icon: 'Cog',
    levels: ['decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'cnc',
    requiresLogin: false
  },
  {
    id: 'ncviewer',
    name: 'NC Viewer',
    description: 'Visualizador de código G-Code CNC - Sin registro',
    url: 'https://ncviewer.com/',
    icon: 'Eye',
    levels: ['decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'cnc',
    requiresLogin: false
  },
  {
    id: 'jscut',
    name: 'JSCut',
    description: 'CAM para CNC desde SVG - Sin registro',
    url: 'http://jscut.org/jscut.html',
    icon: 'Scissors',
    levels: ['primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'cnc',
    requiresLogin: false
  },
  // Diseño 3D (sin registro para probar)
  {
    id: 'tinkercad-3d',
    name: 'Tinkercad 3D',
    description: 'Diseño 3D para impresión - Fácil de usar',
    url: 'https://www.tinkercad.com/3d-design',
    icon: 'Box',
    levels: ['sexto-egb', 'septimo-egb', 'octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: '3d',
    requiresLogin: true
  },
  {
    id: 'blockscad',
    name: 'BlocksCAD',
    description: 'Diseño 3D con bloques de programación - Sin registro',
    url: 'https://www.blockscad3d.com/editor/',
    icon: 'Boxes',
    levels: ['quinto-egb', 'sexto-egb', 'septimo-egb', 'octavo-egb', 'noveno-egb'],
    category: '3d',
    requiresLogin: false
  },
  // Simuladores de lógica y compuertas
  {
    id: 'logic-gates',
    name: 'Logic Gate Simulator',
    description: 'Simulador de compuertas lógicas - Sin registro',
    url: 'https://logic.ly/demo/',
    icon: 'GitBranch',
    levels: ['septimo-egb', 'octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'logica',
    requiresLogin: false
  },
  {
    id: 'circuitverse',
    name: 'CircuitVerse',
    description: 'Simulador de circuitos digitales - Sin registro para probar',
    url: 'https://circuitverse.org/simulator',
    icon: 'Network',
    levels: ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'],
    category: 'logica',
    requiresLogin: false
  },
]

export const LEVEL_CONTENT: Record<string, {
  robotica: { description: string; projects: string[]; tools: string[] };
  ia: { description: string; activities: string[]; tools: string[] };
  hacking: { description: string; topics: string[]; tools: string[] };
}> = {
  'inicial-1': {
    robotica: {
      description: 'Introducción a la robótica con juguetes programables y bloques de construcción',
      projects: ['Coche seguidor de colores', 'Robot pintador básico', 'Bloques de construcción'],
      tools: ['Coding Buddy', 'Bloques compatibles LEGO']
    },
    ia: {
      description: 'Reconocimiento de objetos y colores con la cámara',
      activities: ['Identificar objetos cotidianos', 'Reconocer colores', 'Juegos de voz'],
      tools: ['COCO-SSD', 'Reconocimiento de voz']
    },
    hacking: {
      description: 'Conceptos básicos de seguridad digital',
      topics: ['Privacidad en internet', 'Contraseñas seguras', 'Información personal'],
      tools: ['Juegos interactivos de seguridad']
    }
  },
  'inicial-2': {
    robotica: {
      description: 'Secuencias básicas y programación sin pantalla',
      projects: ['Bee-Bot rutas', 'Robot seguidor de línea', 'Construcciones con sensores'],
      tools: ['Bee-Bot', 'Coding Buddy', 'Bloques magnéticos']
    },
    ia: {
      description: 'Clasificación de imágenes y comandos de voz',
      activities: ['Clasificar animales', 'Comandos de voz simples', 'Reconocer emociones'],
      tools: ['MobileNet', 'Speech Recognition']
    },
    hacking: {
      description: 'Navegación segura y huella digital',
      topics: ['Navegación segura', 'No hablar con extraños online', 'Pedir ayuda a adultos'],
      tools: ['Videos educativos', 'Juegos de seguridad']
    }
  },
  'primero-egb': {
    robotica: {
      description: 'Programación por bloques nivel inicial',
      projects: ['Laberintos con Blockly', 'Secuencias de movimiento', 'Robot bailarín'],
      tools: ['Blockly Games', 'Code.org', 'Scratch Jr']
    },
    ia: {
      description: 'Entrenamiento básico de modelos',
      activities: ['Entrenar clasificador de gestos', 'Reconocer formas', 'Juegos de predicción'],
      tools: ['Teachable Machine', 'COCO-SSD']
    },
    hacking: {
      description: 'Contraseñas y datos personales',
      topics: ['Crear contraseñas fuertes', 'Información que no compartir', 'Phishing básico'],
      tools: ['Password games', 'Simuladores de seguridad']
    }
  },
  'segundo-egb': {
    robotica: {
      description: 'Algoritmos y secuencias más complejas',
      projects: ['Historias animadas', 'Juegos simples', 'Robot con sensores'],
      tools: ['Scratch Jr', 'Blockly', 'LEGO Education']
    },
    ia: {
      description: 'Reconocimiento de patrones',
      activities: ['Clasificar objetos por características', 'Predicciones simples', 'Chatbot básico'],
      tools: ['Teachable Machine', 'MobileNet']
    },
    hacking: {
      description: 'Redes sociales y privacidad',
      topics: ['Configuración de privacidad', 'Qué publicar y qué no', 'Cyberbullying'],
      tools: ['Simuladores de redes sociales']
    }
  },
  'tercero-egb': {
    robotica: {
      description: 'Introducción a Scratch y proyectos creativos',
      projects: ['Animaciones interactivas', 'Juegos con puntuación', 'Historias con múltiples escenas'],
      tools: ['Scratch', 'Blockly', 'micro:bit']
    },
    ia: {
      description: 'Machine Learning para niños',
      activities: ['Entrenar modelos de imagen', 'Reconocimiento de sonidos', 'IA en juegos'],
      tools: ['Machine Learning for Kids', 'Teachable Machine']
    },
    hacking: {
      description: 'Seguridad en dispositivos',
      topics: ['Actualizaciones de seguridad', 'Antivirus', 'Descargas seguras'],
      tools: ['Simuladores de malware educativo']
    }
  },
  'cuarto-egb': {
    robotica: {
      description: 'Proyectos Scratch avanzados y electrónica básica',
      projects: ['Juegos multijugador', 'Animaciones con física', 'Circuitos LED'],
      tools: ['Scratch', 'Makey Makey', 'Circuitos básicos']
    },
    ia: {
      description: 'Visión por computadora',
      activities: ['Detección de poses', 'Filtros de cámara', 'Reconocimiento facial básico'],
      tools: ['PoseNet', 'Teachable Machine', 'Scratch + ML']
    },
    hacking: {
      description: 'Ingeniería social',
      topics: ['Reconocer engaños', 'Verificar información', 'Fake news'],
      tools: ['Juegos de detección de phishing']
    }
  },
  'quinto-egb': {
    robotica: {
      description: 'MakeCode y micro:bit',
      projects: ['Termómetro digital', 'Podómetro', 'Juegos en LED matrix'],
      tools: ['MakeCode', 'micro:bit', 'Scratch']
    },
    ia: {
      description: 'Procesamiento de lenguaje natural',
      activities: ['Chatbots simples', 'Análisis de sentimientos', 'Traducción automática'],
      tools: ['Dialogflow', 'Scratch + NLP']
    },
    hacking: {
      description: 'Redes y comunicaciones',
      topics: ['Cómo funciona internet', 'WiFi seguro', 'VPN básico'],
      tools: ['Simuladores de red']
    }
  },
  'sexto-egb': {
    robotica: {
      description: 'Introducción a Arduino con bloques',
      projects: ['Semáforo', 'Sensor de luz', 'Alarma básica'],
      tools: ['Tinkercad Circuits', 'mBlock', 'Arduino']
    },
    ia: {
      description: 'Redes neuronales visuales',
      activities: ['Entender neuronas artificiales', 'Entrenar redes simples', 'Reconocimiento de dígitos'],
      tools: ['TensorFlow Playground', 'Neural Network Playground']
    },
    hacking: {
      description: 'Criptografía básica',
      topics: ['Cifrado César', 'Mensajes secretos', 'Historia de la criptografía'],
      tools: ['CrypTool', 'Juegos de cifrado']
    }
  },
  'septimo-egb': {
    robotica: {
      description: 'Arduino y sensores',
      projects: ['Estación meteorológica', 'Robot evita obstáculos', 'Control por Bluetooth'],
      tools: ['Arduino IDE', 'Tinkercad', 'Wokwi']
    },
    ia: {
      description: 'Proyectos de IA aplicada',
      activities: ['Clasificador de basura', 'Detector de mascarillas', 'Asistente de voz'],
      tools: ['TensorFlow.js', 'Teachable Machine', 'Python básico']
    },
    hacking: {
      description: 'Análisis de vulnerabilidades',
      topics: ['OWASP Top 10 para niños', 'SQL Injection básico', 'XSS explicado'],
      tools: ['OWASP WebGoat Jr', 'Hack The Box Kids']
    }
  },
  'octavo-egb': {
    robotica: {
      description: 'Programación textual con Arduino',
      projects: ['Brazo robótico', 'Carro controlado por app', 'Sistema de riego'],
      tools: ['Arduino IDE', 'Wokwi', 'App Inventor']
    },
    ia: {
      description: 'Python para IA',
      activities: ['Introducción a Python', 'Librerías de ML', 'Proyectos con datos'],
      tools: ['Google Colab', 'Jupyter', 'Scikit-learn']
    },
    hacking: {
      description: 'Pentesting básico',
      topics: ['Reconocimiento', 'Escaneo de puertos', 'Herramientas básicas'],
      tools: ['Nmap básico', 'Wireshark educativo']
    }
  },
  'noveno-egb': {
    robotica: {
      description: 'ESP32 e IoT',
      projects: ['Casa inteligente', 'Monitoreo remoto', 'Bot de Telegram'],
      tools: ['ESP32', 'Wokwi', 'MQTT', 'Node-RED']
    },
    ia: {
      description: 'Deep Learning introducción',
      activities: ['Redes convolucionales', 'Transfer learning', 'Generación de imágenes'],
      tools: ['TensorFlow', 'Keras', 'Google Colab']
    },
    hacking: {
      description: 'Seguridad en redes',
      topics: ['Análisis de tráfico', 'Man in the middle', 'Firewalls'],
      tools: ['Wireshark', 'pfSense virtual']
    }
  },
  'decimo-egb': {
    robotica: {
      description: 'Robótica avanzada y ROS',
      projects: ['Robot autónomo', 'Dron básico', 'Visión robótica'],
      tools: ['ROS', 'Gazebo', 'OpenCV']
    },
    ia: {
      description: 'Proyectos de ML completos',
      activities: ['Pipeline de datos', 'Modelos de producción', 'APIs de IA'],
      tools: ['FastAPI', 'Docker', 'TensorFlow Serving']
    },
    hacking: {
      description: 'Web Security',
      topics: ['OWASP completo', 'Burp Suite', 'Bug bounty intro'],
      tools: ['Burp Suite', 'DVWA', 'HackTheBox']
    }
  },
  'primero-bach': {
    robotica: {
      description: 'Diseño 3D y fabricación digital',
      projects: ['Diseño de piezas', 'Impresión 3D', 'CNC básico'],
      tools: ['Fusion 360', 'Cura', 'FreeCAD']
    },
    ia: {
      description: 'NLP avanzado',
      activities: ['Transformers', 'GPT y LLMs', 'Chatbots avanzados'],
      tools: ['Hugging Face', 'LangChain', 'OpenAI API']
    },
    hacking: {
      description: 'Pentesting profesional',
      topics: ['Metodología PTES', 'Metasploit', 'Reportes de seguridad'],
      tools: ['Kali Linux', 'Metasploit', 'Nessus']
    }
  },
  'segundo-bach': {
    robotica: {
      description: 'Sistemas embebidos avanzados',
      projects: ['FPGA básico', 'Sistemas en tiempo real', 'Comunicaciones industriales'],
      tools: ['Raspberry Pi', 'FPGA', 'PLC simulado']
    },
    ia: {
      description: 'Computer Vision avanzada',
      activities: ['YOLO', 'Segmentación', 'Tracking'],
      tools: ['OpenCV', 'PyTorch', 'Detectron2']
    },
    hacking: {
      description: 'Red Team operations',
      topics: ['Active Directory', 'Privilege escalation', 'Lateral movement'],
      tools: ['BloodHound', 'Mimikatz', 'Cobalt Strike (educativo)']
    }
  },
  'tercero-bach': {
    robotica: {
      description: 'Proyectos de graduación',
      projects: ['Robot de competencia', 'Startup de robótica', 'Investigación aplicada'],
      tools: ['Todas las anteriores', 'Metodología de proyectos']
    },
    ia: {
      description: 'IA de producción',
      activities: ['MLOps', 'Deployment', 'Ética en IA'],
      tools: ['MLflow', 'Kubernetes', 'AWS/GCP']
    },
    hacking: {
      description: 'Certificaciones y carrera',
      topics: ['Preparación CEH', 'OSCP intro', 'Carrera en ciberseguridad'],
      tools: ['Labs de certificación', 'CTF avanzados']
    }
  }
}
