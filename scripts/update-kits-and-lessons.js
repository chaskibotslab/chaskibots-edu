const fs = require('fs')
const path = require('path')

// Leer variables de entorno
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const AIRTABLE_API_KEY = envVars.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = envVars.AIRTABLE_BASE_ID

// Información detallada de kits por nivel (extraída de las imágenes)
const kitsDetallados = {
  'inicial-2': {
    name: 'Kit Inicial 2',
    components: 'LED, Cables jumper, Pila CR 2032, Adhesivo Temático de robótica y circuitos, Cinta de cobre, Generador eólico, Caja de Herramientas Plástica',
    skills: 'Kit Inicial, Cinta y Generador eólico. Introducción a circuitos básicos.',
    practicas: [
      { titulo: 'Mi primer circuito con LED', descripcion: 'Conecta el LED con la pila CR2032 usando cables jumper', componentes: 'LED, Pila CR2032, Cables jumper' },
      { titulo: 'Circuito con cinta de cobre', descripcion: 'Crea un circuito usando cinta conductora de cobre', componentes: 'Cinta de cobre, LED, Pila' },
      { titulo: 'Generador eólico', descripcion: 'Arma y prueba el generador eólico', componentes: 'Generador eólico' }
    ]
  },
  'primero-egb': {
    name: 'Kit 3 Robots Preparatoria',
    components: 'Robot con articulaciones (Motor, engranajes plásticos, porta pila, cables de conexión, topes plásticos), Robot pintor, Robot 4x4, Caja de Herramientas Plástica',
    skills: 'Lectoescritura inicial con enfoque en vocabulario STEM. Comprensión de números y operaciones básicas, conceptos de medición y lógica. Uso de kits de robótica sencillos para ensamblar y controlar robots básicos.',
    practicas: [
      { titulo: 'Armando mi Robot con articulaciones', descripcion: 'Ensambla el robot con motor y engranajes', componentes: 'Motor, engranajes plásticos, cables' },
      { titulo: 'Robot Pintor creativo', descripcion: 'Arma el robot pintor y crea dibujos', componentes: 'Robot pintor completo' },
      { titulo: 'Robot 4x4 en acción', descripcion: 'Construye y prueba el robot 4x4', componentes: 'Robot 4x4' }
    ]
  },
  'segundo-egb': {
    name: 'Kit 3 Robots Elemental',
    components: 'Robot radiocontrolado, Robot navegación acuática, Lámpara Moderna, Caja de Herramientas Plástica',
    skills: 'Fortalecimiento de la lectoescritura y habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples y resolución de problemas a través de proyectos STEM.',
    practicas: [
      { titulo: 'Robot Radiocontrolado', descripcion: 'Arma y controla el robot por radio', componentes: 'Robot radiocontrolado' },
      { titulo: 'Robot Acuático', descripcion: 'Construye el robot de navegación acuática', componentes: 'Robot navegación acuática' },
      { titulo: 'Lámpara Moderna LED', descripcion: 'Arma la lámpara moderna con LEDs', componentes: 'Lámpara Moderna' }
    ]
  },
  'tercero-egb': {
    name: 'Kit 3 Robots Elemental',
    components: 'Robot Escalador, Carucel, Robot Heólico, Caja de Herramientas Plástica',
    skills: 'Fortalecimiento de la lectoescritura y habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples y resolución de problemas a través de proyectos STEM.',
    practicas: [
      { titulo: 'Robot Escalador', descripcion: 'Construye el robot que escala superficies', componentes: 'Robot Escalador' },
      { titulo: 'Carucel mecánico', descripcion: 'Arma el carucel con motor', componentes: 'Carucel' },
      { titulo: 'Robot Eólico', descripcion: 'Construye el robot impulsado por viento', componentes: 'Robot Heólico' }
    ]
  },
  'cuarto-egb': {
    name: 'Kit Rueda de la Fortuna + FM',
    components: 'Rueda de la fortuna, Radio FM 76-108MHz, Caja de Herramientas Plástica, Potenciómetro, LEDs, Resistencias, Cables jumper',
    skills: 'Fortalecimiento de la lectoescritura y habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples y resolución de problemas a través de proyectos STEM.',
    practicas: [
      { titulo: 'Rueda de la Fortuna', descripcion: 'Arma la rueda de la fortuna con motor', componentes: 'Rueda de la fortuna' },
      { titulo: 'Radio FM', descripcion: 'Construye tu propia radio FM 76-108MHz', componentes: 'Radio FM' },
      { titulo: 'Control con Potenciómetro', descripcion: 'Aprende a usar el potenciómetro para controlar LEDs', componentes: 'Potenciómetro, LEDs, Resistencias' },
      { titulo: 'Circuito con LEDs', descripcion: 'Crea circuitos con múltiples LEDs', componentes: 'LEDs, Resistencias, Cables' }
    ]
  },
  'quinto-egb': {
    name: 'Kit Rueda + Radio RF-FM',
    components: 'Rueda de la fortuna, Radio RF-FM, Caja de Herramientas Plástica, Potenciómetro, LEDs, Transistor 2N2222A, Resistencias',
    skills: 'Fortalecimiento de habilidades de comunicación. Aplicación de conceptos matemáticos en proyectos de robótica y electrónica. Programación de robots para realizar tareas simples.',
    practicas: [
      { titulo: 'Rueda de la Fortuna mejorada', descripcion: 'Arma la rueda con control de velocidad', componentes: 'Rueda de la fortuna, Potenciómetro' },
      { titulo: 'Radio RF-FM', descripcion: 'Construye radio con frecuencia RF y FM', componentes: 'Radio RF-FM' },
      { titulo: 'Transistor como interruptor', descripcion: 'Usa el transistor 2N2222A para controlar LEDs', componentes: 'Transistor 2N2222A, LEDs, Resistencias' },
      { titulo: 'Dimmer con potenciómetro', descripcion: 'Controla el brillo de LEDs con potenciómetro', componentes: 'Potenciómetro, LEDs' }
    ]
  },
  'sexto-egb': {
    name: 'Kit Robot 4 en 1 + Circuito',
    components: 'Robot 4 en 1, Circuito electrónico generador aleatorio con micrófono, Avión DIY, Caja de Herramientas Plástica',
    skills: 'Lectura comprensiva y producción de textos relacionados con STEM. Resolución de problemas matemáticos aplicados a proyectos de robótica. Construcción y programación de robots más complejos y experimentación con circuitos electrónicos.',
    practicas: [
      { titulo: 'Robot 4 en 1 - Configuración 1', descripcion: 'Arma la primera configuración del robot', componentes: 'Robot 4 en 1' },
      { titulo: 'Robot 4 en 1 - Configuración 2', descripcion: 'Transforma el robot a su segunda forma', componentes: 'Robot 4 en 1' },
      { titulo: 'Circuito con micrófono', descripcion: 'Construye el generador aleatorio activado por sonido', componentes: 'Circuito con micrófono' },
      { titulo: 'Avión DIY', descripcion: 'Arma el avión de bricolaje', componentes: 'Avión DIY' }
    ]
  },
  'septimo-egb': {
    name: 'Kit Robot 4 en 1 + Avión',
    components: 'Robot 4 en 1, Circuito electrónico generador aleatorio con micrófono, Avión DIY, Caja de Herramientas Plástica',
    skills: 'Lectura comprensiva y producción de textos relacionados con STEM. Resolución de problemas matemáticos aplicados a proyectos de robótica. Construcción y programación de robots más complejos y experimentación con circuitos electrónicos.',
    practicas: [
      { titulo: 'Robot 4 en 1 completo', descripcion: 'Domina las 4 configuraciones del robot', componentes: 'Robot 4 en 1' },
      { titulo: 'Circuito generador aleatorio', descripcion: 'Programa el generador con micrófono', componentes: 'Circuito con micrófono' },
      { titulo: 'Avión DIY motorizado', descripcion: 'Construye y prueba el avión', componentes: 'Avión DIY' }
    ]
  },
  'octavo-egb': {
    name: 'Carro Bluetooth WiFi ESP32',
    components: 'TB6612FNG, ESP32 30 pines, Adaptador de batería, Switch 3 terminales, Cables jumper M_M/M-H/H-H, 2 Motores reductores TT, Placa electrónica controladora de motores, Chassis impreso en 3D, Juegos de tornillos m3, Juegos de tuercas m3, Caja de Herramientas Plástica',
    skills: 'Carro Bluetooth con WiFi. Seguidor de línea 2. Programación avanzada con ESP32 y control de motores.',
    practicas: [
      { titulo: 'Ensamblaje del Carro ESP32', descripcion: 'Arma el chassis y conecta los motores', componentes: 'Chassis 3D, Motores TT, Tornillos' },
      { titulo: 'Programación ESP32 básica', descripcion: 'Configura el ESP32 y prueba conexión WiFi', componentes: 'ESP32, Cables jumper' },
      { titulo: 'Control Bluetooth', descripcion: 'Programa el control por Bluetooth desde el celular', componentes: 'ESP32, TB6612FNG, Motores' },
      { titulo: 'Control WiFi', descripcion: 'Controla el carro por WiFi', componentes: 'ESP32, TB6612FNG, Motores' }
    ]
  },
  'noveno-egb': {
    name: 'Seguidor de Línea 2 Sensores',
    components: '2 Sensores infrarrojos, TB6612FNG, ESP Super Mini, Adaptador de batería, Switch 3 terminales, Cables jumper M_M/M-H/H-H, 2 Motores reductores TT, Placa electrónica controladora de motores, Chassis impreso en 3D, Juegos de tornillos m3, Juegos de tuercas m3, Caja de Herramientas Plástica',
    skills: 'Seguidor de línea 2. Programación de sensores infrarrojos con ESP32. Control PID básico.',
    practicas: [
      { titulo: 'Ensamblaje Seguidor de Línea', descripcion: 'Arma el robot con sensores infrarrojos', componentes: 'Chassis, Sensores IR, Motores' },
      { titulo: 'Calibración de Sensores IR', descripcion: 'Calibra los sensores para detectar línea negra', componentes: 'Sensores infrarrojos' },
      { titulo: 'Programación del Seguidor', descripcion: 'Programa la lógica de seguimiento de línea', componentes: 'ESP Super Mini, Sensores IR, Motores' },
      { titulo: 'Optimización con PID', descripcion: 'Mejora el seguimiento con control PID', componentes: 'Todo el kit' }
    ]
  },
  'decimo-egb': {
    name: 'Robot Evita Obstáculos',
    components: 'Sensor ultrasónico, TB6612FNG, ESP32 30 pines, Adaptador de batería, Switch 3 terminales, Cables jumper M_M/M-H/H-H, 2 Motores reductores TT, Placa electrónica controladora de motores, Chassis impreso en 3D, Juegos de tornillos m3, Juegos de tuercas m3, Caja de Herramientas Plástica',
    skills: 'Robot Evita Obstáculos. Programación de sensores ultrasónicos. Navegación autónoma.',
    practicas: [
      { titulo: 'Ensamblaje Robot Evita Obstáculos', descripcion: 'Arma el robot con sensor ultrasónico', componentes: 'Chassis, Sensor ultrasónico, Motores' },
      { titulo: 'Sensor Ultrasónico HC-SR04', descripcion: 'Aprende a medir distancias con ultrasonido', componentes: 'Sensor ultrasónico, ESP32' },
      { titulo: 'Lógica de Evasión', descripcion: 'Programa la detección y evasión de obstáculos', componentes: 'ESP32, Sensor, Motores' },
      { titulo: 'Navegación Autónoma', descripcion: 'Combina sensores para navegación inteligente', componentes: 'Todo el kit' }
    ]
  },
  'primero-bach': {
    name: 'Robot Otto + Kit Práctico',
    components: '4 Servo motores, Impresión 3D, Shield de Arduino Nano, Arduino Nano, Cable de conexión, Cables jumper M_M/M-H/H-H, Sensor ultrasónico, Buzzer, Porta pilas AA×4, Caja de Herramientas Plástica',
    skills: 'Robot Otto + Kit Práctico. Programación avanzada con Arduino Nano. Robótica bípeda.',
    practicas: [
      { titulo: 'Impresión y Ensamblaje Otto', descripcion: 'Arma el robot Otto con piezas 3D', componentes: 'Piezas 3D, Servos, Arduino Nano' },
      { titulo: 'Programación de Servos', descripcion: 'Controla los 4 servomotores para caminar', componentes: 'Servos, Arduino Nano' },
      { titulo: 'Otto con Sensor Ultrasónico', descripcion: 'Agrega detección de obstáculos a Otto', componentes: 'Sensor ultrasónico, Arduino' },
      { titulo: 'Otto Musical', descripcion: 'Programa melodías con el buzzer', componentes: 'Buzzer, Arduino Nano' }
    ]
  },
  'segundo-bach': {
    name: 'Kit Robot Soccer y Mini Sumo',
    components: 'TB6612FNG, ESP32 30 pines, Adaptador de batería, Switch 3 terminales, Cables jumper M_M/M-H/H-H, 2 Motores reductores TT, Placa electrónica controladora de motores unida con ESP32, Chassis impreso en 3D, Juegos de tornillos m3, Juegos de tuercas m3, Caja de Herramientas Plástica',
    skills: 'Profundización en áreas específicas de STEM, robótica y electrónica. Desarrollo de proyectos integrados que combinan múltiples disciplinas STEM. Preparación para la educación superior o el mercado laboral con habilidades prácticas en programación y robótica avanzada.',
    practicas: [
      { titulo: 'Robot Soccer', descripcion: 'Construye robot para competencias de fútbol', componentes: 'Chassis, Motores, ESP32' },
      { titulo: 'Robot Mini Sumo', descripcion: 'Arma robot para competencias de sumo', componentes: 'Chassis, Motores, Sensores' },
      { titulo: 'Estrategias de Competencia', descripcion: 'Programa tácticas para soccer y sumo', componentes: 'ESP32, Sensores, Motores' },
      { titulo: 'Torneo de Robots', descripcion: 'Prepara tu robot para competir', componentes: 'Todo el kit' }
    ]
  },
  'tercero-bach': {
    name: 'Kit IoT ESP32',
    components: 'ESP32, Sensor de temperatura, Sensor de luz, Sensor de humedad, Relé, PCB, Protoboard, Cables jumper M_M/M-H/H-H, 6 LEDs, 1 RGB, Interruptor, Caja de Herramientas Plástica',
    skills: 'Profundización en IoT, Internet de las cosas con Telegram. Proyectos de domótica y automatización.',
    practicas: [
      { titulo: 'Estación Meteorológica IoT', descripcion: 'Mide temperatura, luz y humedad', componentes: 'ESP32, Sensores, Protoboard' },
      { titulo: 'Control por Telegram', descripcion: 'Controla dispositivos desde Telegram', componentes: 'ESP32, Relé, LEDs' },
      { titulo: 'Domótica Básica', descripcion: 'Automatiza luces y dispositivos', componentes: 'ESP32, Relé, Sensores' },
      { titulo: 'Dashboard IoT', descripcion: 'Crea panel de control web para tu sistema', componentes: 'ESP32, Todos los sensores' }
    ]
  }
}

// Videos de YouTube verificados para prácticas
const videosPracticas = {
  'led': 'https://www.youtube.com/watch?v=G9xDSFhiSBY',
  'circuito': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'arduino': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'esp32': 'https://www.youtube.com/watch?v=k_D_Qu0cgu8',
  'motor': 'https://www.youtube.com/watch?v=LXURLvga8bQ',
  'servo': 'https://www.youtube.com/watch?v=LXURLvga8bQ',
  'sensor': 'https://www.youtube.com/watch?v=UoBP1JIDN7I',
  'ultrasónico': 'https://www.youtube.com/watch?v=UoBP1JIDN7I',
  'infrarrojo': 'https://www.youtube.com/watch?v=UoBP1JIDN7I',
  'bluetooth': 'https://www.youtube.com/watch?v=DbQnbrjQQZc',
  'wifi': 'https://www.youtube.com/watch?v=k_D_Qu0cgu8',
  'iot': 'https://www.youtube.com/watch?v=k_D_Qu0cgu8',
  'robot': 'https://www.youtube.com/watch?v=7rcjRfNFGBk',
  'potenciómetro': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'transistor': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'default': 'https://www.youtube.com/watch?v=J335gEfDdWk'
}

function getVideoForPractica(titulo) {
  const tituloLower = titulo.toLowerCase()
  for (const [keyword, url] of Object.entries(videosPracticas)) {
    if (keyword !== 'default' && tituloLower.includes(keyword)) {
      return url
    }
  }
  return videosPracticas.default
}

async function updateKits() {
  const KITS_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/kits`
  
  console.log('📦 Actualizando kits en Airtable...\n')
  
  // Obtener kits existentes
  const response = await fetch(KITS_URL, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    console.log('❌ Error obteniendo kits:', await response.text())
    return
  }
  
  const data = await response.json()
  const kitsExistentes = data.records
  
  console.log(`📦 Encontrados ${kitsExistentes.length} kits\n`)
  
  let updated = 0
  
  for (const kit of kitsExistentes) {
    const levelId = kit.fields.levelId
    const kitInfo = kitsDetallados[levelId]
    
    if (kitInfo) {
      console.log(`📦 Actualizando kit: ${levelId}`)
      
      try {
        const updateResponse = await fetch(KITS_URL, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: [{
              id: kit.id,
              fields: {
                name: kitInfo.name,
                components: kitInfo.components,
                skills: kitInfo.skills
              }
            }]
          })
        })
        
        if (updateResponse.ok) {
          console.log(`   ✅ Kit actualizado`)
          updated++
        } else {
          console.log(`   ❌ Error:`, await updateResponse.text())
        }
      } catch (err) {
        console.log(`   ❌ Error:`, err.message)
      }
      
      await new Promise(r => setTimeout(r, 200))
    }
  }
  
  console.log(`\n📦 Kits actualizados: ${updated}`)
  return kitsExistentes
}

async function createPracticalLessons() {
  const LESSONS_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`
  
  console.log('\n📚 Creando lecciones prácticas basadas en kits...\n')
  
  let created = 0
  
  for (const [levelId, kitInfo] of Object.entries(kitsDetallados)) {
    if (!kitInfo.practicas) continue
    
    console.log(`\n📚 Nivel: ${levelId}`)
    
    for (let i = 0; i < kitInfo.practicas.length; i++) {
      const practica = kitInfo.practicas[i]
      const videoUrl = getVideoForPractica(practica.titulo)
      
      const lessonData = {
        levelId: levelId,
        programId: 'robotica',
        moduleName: 'Prácticas con Kit',
        title: `Práctica: ${practica.titulo}`,
        type: 'activity',
        duration: '45 min',
        order: 100 + i,
        videoUrl: videoUrl,
        content: `## 🔧 ${practica.titulo}

### 📦 Materiales del Kit
${practica.componentes}

### 📋 Descripción
${practica.descripcion}

### 📺 Video Tutorial
Mira el video para ver cómo realizar esta práctica.

### 🎮 Simulador
Practica primero en **Wokwi** o **Tinkercad** antes de usar los componentes físicos.

### 💡 Pasos
1. Reúne los materiales necesarios
2. Mira el video tutorial completo
3. Sigue las instrucciones paso a paso
4. Prueba tu circuito/robot
5. Experimenta con variaciones

### ⚠️ Precauciones
- Maneja los componentes con cuidado
- Verifica las conexiones antes de encender
- Pide ayuda al profesor si tienes dudas

### ✅ Objetivos
- Aplicar conocimientos teóricos en práctica
- Desarrollar habilidades de ensamblaje
- Experimentar con los componentes del kit`
      }
      
      try {
        const response = await fetch(LESSONS_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: [{ fields: lessonData }] })
        })
        
        if (response.ok) {
          console.log(`   ✅ ${practica.titulo}`)
          created++
        } else {
          const error = await response.text()
          // Si ya existe, no es error
          if (!error.includes('duplicate')) {
            console.log(`   ⚠️ ${practica.titulo}: ${error.substring(0, 50)}`)
          }
        }
      } catch (err) {
        console.log(`   ❌ ${practica.titulo}: ${err.message}`)
      }
      
      await new Promise(r => setTimeout(r, 250))
    }
  }
  
  console.log(`\n📚 Lecciones prácticas creadas: ${created}`)
}

async function main() {
  console.log('🚀 Actualizando plataforma con información de kits...\n')
  console.log('=' .repeat(50))
  
  // 1. Actualizar kits
  await updateKits()
  
  // 2. Crear lecciones prácticas
  await createPracticalLessons()
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Proceso completado!')
  console.log('\nRecuerda refrescar la página con Ctrl+F5 para ver los cambios.')
}

main().catch(console.error)
