/**
 * Script para enriquecer TODAS las lecciones con contenido tipo libro de texto
 * Basado en el nivel, programa y tipo de lección
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// Información de kits por nivel (tu contenido original)
const KITS_INFO = {
  'inicial-1': {
    nombre: 'Kit Inicial 1 - Mis Primeras Luces',
    componentes: ['LEDs de colores', 'Cables de conexión', 'Pila CR2032', 'Porta pila', 'Stickers conductores', 'Cinta conductora', 'Tarjetas ilustradas', 'Guía para padres'],
    habilidades: 'Introducción a circuitos básicos, Reconocimiento de colores, Motricidad fina'
  },
  'inicial-2': {
    nombre: 'Kit Inicial 2',
    componentes: ['LED', 'Cables jumper', 'Pila CR 2032', 'Adhesivo temático de robótica', 'Cinta de cobre', 'Generador eólico', 'Caja de Herramientas Plástica'],
    habilidades: 'Circuitos básicos, Energía eólica, Generador de electricidad'
  },
  'primero-egb': {
    nombre: 'Kit 3 Robots Preparatoria',
    componentes: ['Robot con articulaciones', 'Motor con engranajes plásticos', 'Porta pila', 'Cables de conexión', 'Topes plásticos', 'Robot pintor', 'Robot 4x4'],
    habilidades: 'Construcción de robots, Motores y engranajes'
  },
  'segundo-egb': {
    nombre: 'Kit 3 Robots Elemental',
    componentes: ['Robot radiocontrolado', 'Robot navegación acuática', 'Lámpara Moderna'],
    habilidades: 'Control remoto, Circuitos en paralelo, Diseño de lámparas'
  },
  'tercero-egb': {
    nombre: 'Kit 3 Robots Elemental',
    componentes: ['Robot Escalador', 'Carrusel', 'Robot Eólico'],
    habilidades: 'Mecanismos de movimiento, Energía renovable'
  },
  'cuarto-egb': {
    nombre: 'Kit Rueda de la Fortuna + FM',
    componentes: ['Rueda de la fortuna', 'Radio FM 76-108MHz'],
    habilidades: 'Electrónica básica, Transmisión de radio'
  },
  'quinto-egb': {
    nombre: 'Kit Rueda + Radio RF-FM',
    componentes: ['Rueda de la fortuna', 'Radio RF-FM'],
    habilidades: 'Radiofrecuencia, Circuitos de audio'
  },
  'sexto-egb': {
    nombre: 'Kit Robot 4 en 1 + Circuito',
    componentes: ['Robot 4 en 1', 'Circuito generador aleatorio con micrófono', 'Avión DIY'],
    habilidades: 'Robots transformables, Circuitos con sensores'
  },
  'septimo-egb': {
    nombre: 'Kit Robot 4 en 1 + Avión',
    componentes: ['Robot 4 en 1', 'Circuito generador aleatorio', 'Avión DIY'],
    habilidades: 'Aerodinámica, Circuitos complejos'
  },
  'octavo-egb': {
    nombre: 'Carro Bluetooth WiFi ESP32',
    componentes: ['ESP32 30 pines', 'TB6612FNG', '2 Motores reductores TT', 'Adaptador batería', 'Switch', 'Cables jumper', 'Placa controladora', 'Chassis 3D'],
    habilidades: 'Programación ESP32, WiFi, Bluetooth, Control de motores'
  },
  'noveno-egb': {
    nombre: 'Seguidor de Línea 2 Sensores',
    componentes: ['2 Sensores infrarrojos', 'TB6612FNG', 'ESP Super Mini', 'Adaptador batería', '2 Motores TT', 'Chassis 3D'],
    habilidades: 'Sensores IR, Lógica de control, Seguimiento de línea'
  },
  'decimo-egb': {
    nombre: 'Robot Evita Obstáculos',
    componentes: ['Sensor ultrasónico HC-SR04', 'TB6612FNG', 'ESP32 30 pines', '2 Motores TT', 'Chassis 3D'],
    habilidades: 'Sensores ultrasónicos, Detección de obstáculos, Navegación autónoma'
  },
  'primero-bach': {
    nombre: 'Robot Otto + Kit Práctico',
    componentes: ['4 Servo motores SG90', 'Arduino Nano', 'Shield Arduino Nano', 'Sensor ultrasónico', 'Buzzer', 'Porta pilas AA×4', 'Piezas 3D'],
    habilidades: 'Arduino Nano, Servomotores, Robot bípedo, Programación avanzada'
  },
  'primero-bgu': {
    nombre: 'Robot Otto + Kit Práctico',
    componentes: ['4 Servo motores SG90', 'Arduino Nano', 'Shield Arduino Nano', 'Sensor ultrasónico', 'Buzzer', 'Porta pilas AA×4', 'Piezas 3D'],
    habilidades: 'Arduino Nano, Servomotores, Robot bípedo'
  },
  'segundo-bach': {
    nombre: 'Kit Robot Soccer y Mini Sumo',
    componentes: ['TB6612FNG', 'ESP32 30 pines', '2 Motores TT', 'Chassis 3D', 'Tornillos M3'],
    habilidades: 'Competencias de robots, Estrategia, Programación avanzada'
  },
  'segundo-bgu': {
    nombre: 'Kit Robot Soccer y Mini Sumo',
    componentes: ['TB6612FNG', 'ESP32 30 pines', '2 Motores TT', 'Chassis 3D'],
    habilidades: 'Competencias de robots, Estrategia'
  },
  'tercero-bach': {
    nombre: 'Kit IoT ESP32',
    componentes: ['ESP32', 'Sensor temperatura', 'Sensor luz', 'Sensor humedad', 'Relé', 'PCB', 'Protoboard', '6 LEDs', '1 RGB'],
    habilidades: 'Internet de las Cosas, Domótica, Telegram Bot'
  },
  'tercero-bgu': {
    nombre: 'Kit IoT ESP32',
    componentes: ['ESP32', 'Sensor temperatura', 'Sensor luz', 'Sensor humedad', 'Relé', 'Protoboard'],
    habilidades: 'IoT, Domótica, Automatización'
  }
};

function generateRichContent(lesson) {
  const fields = lesson.fields;
  const title = fields.title || 'Lección';
  const moduleName = fields.moduleName || '';
  const type = fields.type || 'video';
  const duration = fields.duration || '30 min';
  const levelId = fields.levelId || '';
  const programId = fields.programId || 'robotica';
  const existingContent = fields.content || '';
  
  // Si ya tiene contenido largo (más de 200 caracteres), no modificar
  if (existingContent.length > 200) {
    return null;
  }
  
  const kit = KITS_INFO[levelId];
  
  let content = '';
  
  // Encabezado
  content += `📚 ${title.toUpperCase()}\n\n`;
  
  // Descripción basada en contenido existente
  if (existingContent && existingContent.length > 10) {
    content += `📝 DESCRIPCIÓN:\n${existingContent}\n\n`;
  }
  
  // Objetivos de aprendizaje
  content += `🎯 OBJETIVOS DE APRENDIZAJE:\n`;
  content += `• Comprender los conceptos fundamentales de esta lección\n`;
  content += `• Aplicar lo aprendido en ejercicios prácticos\n`;
  content += `• Desarrollar habilidades técnicas y de resolución de problemas\n\n`;
  
  // Información del kit (solo para robótica)
  if (programId === 'robotica' && kit) {
    content += `📦 TU KIT: ${kit.nombre}\n`;
    content += `Componentes: ${kit.componentes.slice(0, 5).join(', ')}\n`;
    content += `Habilidades: ${kit.habilidades}\n\n`;
  }
  
  // Contenido según tipo de lección
  if (type === 'video') {
    content += `🎬 CONTENIDO DEL VIDEO:\n`;
    content += `Este video te enseñará los conceptos clave de forma visual y práctica.\n`;
    content += `Duración aproximada: ${duration}\n\n`;
    content += `📝 TOMA NOTAS DE:\n`;
    content += `• Los conceptos principales explicados\n`;
    content += `• Los pasos demostrados\n`;
    content += `• Las preguntas que te surjan\n\n`;
  } else if (type === 'activity') {
    content += `🔧 ACTIVIDAD PRÁCTICA:\n`;
    content += `Tiempo estimado: ${duration}\n\n`;
    content += `📋 INSTRUCCIONES:\n`;
    content += `1. Lee todas las instrucciones antes de comenzar\n`;
    content += `2. Prepara los materiales necesarios\n`;
    content += `3. Sigue los pasos en orden\n`;
    content += `4. Pide ayuda si tienes dudas\n\n`;
  } else if (type === 'tutorial') {
    content += `📖 TUTORIAL PASO A PASO:\n`;
    content += `Tiempo estimado: ${duration}\n\n`;
    content += `⚠️ ANTES DE COMENZAR:\n`;
    content += `• Asegúrate de tener todos los materiales\n`;
    content += `• Trabaja en un espacio limpio y ordenado\n`;
    content += `• Si usas herramientas, pide supervisión de un adulto\n\n`;
  } else if (type === 'project') {
    content += `🏆 PROYECTO:\n`;
    content += `Tiempo estimado: ${duration}\n\n`;
    content += `Este proyecto te permitirá aplicar todo lo aprendido.\n\n`;
    content += `📋 FASES DEL PROYECTO:\n`;
    content += `1. Planificación - Define qué vas a construir\n`;
    content += `2. Construcción - Arma tu proyecto paso a paso\n`;
    content += `3. Pruebas - Verifica que funcione correctamente\n`;
    content += `4. Presentación - Muestra tu trabajo\n\n`;
  }
  
  // Tips según programa
  if (programId === 'robotica') {
    content += `💡 TIPS DE ROBÓTICA:\n`;
    content += `• Verifica las conexiones antes de encender\n`;
    content += `• Si algo no funciona, revisa los cables\n`;
    content += `• Guarda tus componentes ordenados\n`;
  } else if (programId === 'ia') {
    content += `💡 TIPS DE IA:\n`;
    content += `• La IA aprende de ejemplos, mientras más mejor\n`;
    content += `• Experimenta con diferentes datos\n`;
    content += `• No te frustres si no funciona a la primera\n`;
  } else if (programId === 'hacking') {
    content += `💡 TIPS DE CIBERSEGURIDAD:\n`;
    content += `• Siempre practica de forma ética y legal\n`;
    content += `• Protege tu información personal\n`;
    content += `• Aprende para defender, no para atacar\n`;
  }
  
  content += `\n\n✅ LISTA DE VERIFICACIÓN:\n`;
  content += `□ Completé la lección\n`;
  content += `□ Entendí los conceptos principales\n`;
  content += `□ Practiqué lo aprendido\n`;
  content += `□ Tengo preguntas para el profesor\n`;
  
  return content;
}

async function fetchAllLessons() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?pageSize=100`;
  let allRecords = [];
  let offset = null;
  
  do {
    const fetchUrl = offset ? `${url}&offset=${offset}` : url;
    const response = await fetch(fetchUrl, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
    
    await new Promise(resolve => setTimeout(resolve, 200));
  } while (offset);
  
  return allRecords;
}

async function updateLesson(recordId, content) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons/${recordId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: { content } }),
  });
  
  return response.ok;
}

async function main() {
  console.log('📚 Enriqueciendo contenido de TODAS las lecciones...\n');
  console.log('📦 Incluyendo información de tus kits originales\n');
  
  const lessons = await fetchAllLessons();
  console.log(`Total lecciones: ${lessons.length}\n`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const lesson of lessons) {
    const newContent = generateRichContent(lesson);
    
    if (newContent) {
      const success = await updateLesson(lesson.id, newContent);
      if (success) {
        updated++;
        if (updated % 50 === 0) {
          console.log(`✅ Procesadas: ${updated} lecciones...`);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      skipped++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMEN:`);
  console.log(`   ✅ Enriquecidas: ${updated}`);
  console.log(`   ⏭️  Ya tenían contenido: ${skipped}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
