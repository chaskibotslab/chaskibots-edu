/**
 * Script para actualizar videos con contenido en ESPAÑOL
 * - Restaura videos originales de Google Drive del usuario
 * - Agrega videos educativos en español de canales reconocidos
 * - Fortalece contenido de ESP32, Arduino Nano y kits armables
 * 
 * Uso: node scripts/update-videos-spanish.js
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
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

// Videos educativos EN ESPAÑOL por programa y nivel
// Canales: Programador Novato, BettaTech, Código Facilito, EDteam, Platzi, etc.
const VIDEOS_ESPAÑOL = {
  robotica: {
    // Niveles iniciales - Videos para niños en español
    'inicial-1': 'https://www.youtube.com/watch?v=R9OHn5ZF4Uo', // Robots para niños
    'inicial-2': 'https://www.youtube.com/watch?v=R9OHn5ZF4Uo',
    'primero-egb': 'https://www.youtube.com/watch?v=Y1qxiIqNqWQ', // Qué es un robot
    'segundo-egb': 'https://www.youtube.com/watch?v=Y1qxiIqNqWQ',
    'tercero-egb': 'https://www.youtube.com/watch?v=Y1qxiIqNqWQ',
    
    // Arduino básico en español
    'cuarto-egb': 'https://www.youtube.com/watch?v=J335gEmnDTs', // Arduino desde cero - Programador Novato
    'quinto-egb': 'https://www.youtube.com/watch?v=J335gEmnDTs',
    'sexto-egb': 'https://www.youtube.com/watch?v=PbgEpbMkIaE', // Arduino LED
    
    // ESP32 y Arduino avanzado
    'septimo-egb': 'https://www.youtube.com/watch?v=eUtoWxqPuRA', // ESP32 desde cero
    'octavo-egb': 'https://www.youtube.com/watch?v=eUtoWxqPuRA', // ESP32 WiFi Bluetooth
    'noveno-egb': 'https://www.youtube.com/watch?v=KJFRjlBR5_s', // Seguidor de línea Arduino
    'decimo-egb': 'https://www.youtube.com/watch?v=enCdpRghVzw', // Sensor ultrasónico Arduino
    
    // Arduino Nano y proyectos avanzados
    'primero-bach': 'https://www.youtube.com/watch?v=BtLwoNJ6klE', // Arduino Nano tutorial
    'primero-bgu': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
    'segundo-bach': 'https://www.youtube.com/watch?v=GrvvkYTW_0k', // Robot con ESP32
    'segundo-bgu': 'https://www.youtube.com/watch?v=GrvvkYTW_0k',
    'tercero-bach': 'https://www.youtube.com/watch?v=GrvvkYTW_0k', // IoT con ESP32
    'tercero-bgu': 'https://www.youtube.com/watch?v=GrvvkYTW_0k',
  },
  
  ia: {
    // IA para niños en español
    'inicial-1': 'https://www.youtube.com/watch?v=WoYCpLPCCV0', // IA para niños
    'inicial-2': 'https://www.youtube.com/watch?v=WoYCpLPCCV0',
    'primero-egb': 'https://www.youtube.com/watch?v=WoYCpLPCCV0',
    'segundo-egb': 'https://www.youtube.com/watch?v=WoYCpLPCCV0',
    'tercero-egb': 'https://www.youtube.com/watch?v=WoYCpLPCCV0',
    
    // Machine Learning básico
    'cuarto-egb': 'https://www.youtube.com/watch?v=KytW151dpqU', // Qué es Machine Learning
    'quinto-egb': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'sexto-egb': 'https://www.youtube.com/watch?v=DRkO_r-7Yhc', // Redes neuronales explicadas
    
    // Python y ML
    'septimo-egb': 'https://www.youtube.com/watch?v=Kp4Mvapo5kc', // Python desde cero
    'octavo-egb': 'https://www.youtube.com/watch?v=DRkO_r-7Yhc', // Redes neuronales
    'noveno-egb': 'https://www.youtube.com/watch?v=w2RJ1D6kz-o', // TensorFlow español
    'decimo-egb': 'https://www.youtube.com/watch?v=w2RJ1D6kz-o',
    
    // IA avanzada
    'primero-bach': 'https://www.youtube.com/watch?v=CbpsDMwFG2g', // ChatGPT y LLMs
    'primero-bgu': 'https://www.youtube.com/watch?v=CbpsDMwFG2g',
    'segundo-bach': 'https://www.youtube.com/watch?v=CbpsDMwFG2g',
    'segundo-bgu': 'https://www.youtube.com/watch?v=CbpsDMwFG2g',
    'tercero-bach': 'https://www.youtube.com/watch?v=CbpsDMwFG2g',
    'tercero-bgu': 'https://www.youtube.com/watch?v=CbpsDMwFG2g',
  },
  
  hacking: {
    // Seguridad para niños
    'inicial-1': 'https://www.youtube.com/watch?v=yrln8nyVBLU', // Seguridad internet niños
    'inicial-2': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'primero-egb': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'segundo-egb': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'tercero-egb': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    
    // Ciberseguridad básica
    'cuarto-egb': 'https://www.youtube.com/watch?v=t7uuP4FJKdM', // Contraseñas seguras
    'quinto-egb': 'https://www.youtube.com/watch?v=t7uuP4FJKdM',
    'sexto-egb': 'https://www.youtube.com/watch?v=DSKqHlpq-2c', // Qué es hacking ético
    
    // Hacking ético
    'septimo-egb': 'https://www.youtube.com/watch?v=DSKqHlpq-2c', // Introducción hacking ético
    'octavo-egb': 'https://www.youtube.com/watch?v=Y-ENkAP4kpU', // Kali Linux básico
    'noveno-egb': 'https://www.youtube.com/watch?v=Y-ENkAP4kpU',
    'decimo-egb': 'https://www.youtube.com/watch?v=Y-ENkAP4kpU',
    
    // Pentesting avanzado
    'primero-bach': 'https://www.youtube.com/watch?v=tHd8k54kVs8', // Pentesting web
    'primero-bgu': 'https://www.youtube.com/watch?v=tHd8k54kVs8',
    'segundo-bach': 'https://www.youtube.com/watch?v=tHd8k54kVs8',
    'segundo-bgu': 'https://www.youtube.com/watch?v=tHd8k54kVs8',
    'tercero-bach': 'https://www.youtube.com/watch?v=tHd8k54kVs8',
    'tercero-bgu': 'https://www.youtube.com/watch?v=tHd8k54kVs8',
  }
};

// Videos específicos por tema (keywords en título)
const VIDEOS_POR_TEMA = {
  // ESP32
  'esp32': 'https://www.youtube.com/watch?v=eUtoWxqPuRA',
  'esp': 'https://www.youtube.com/watch?v=eUtoWxqPuRA',
  'wifi': 'https://www.youtube.com/watch?v=eUtoWxqPuRA',
  'bluetooth': 'https://www.youtube.com/watch?v=eUtoWxqPuRA',
  
  // Arduino
  'arduino': 'https://www.youtube.com/watch?v=J335gEmnDTs',
  'nano': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'led': 'https://www.youtube.com/watch?v=PbgEpbMkIaE',
  'blink': 'https://www.youtube.com/watch?v=PbgEpbMkIaE',
  
  // Sensores
  'sensor': 'https://www.youtube.com/watch?v=enCdpRghVzw',
  'ultrasónico': 'https://www.youtube.com/watch?v=enCdpRghVzw',
  'ultrasonico': 'https://www.youtube.com/watch?v=enCdpRghVzw',
  'infrarrojo': 'https://www.youtube.com/watch?v=KJFRjlBR5_s',
  
  // Robots
  'seguidor': 'https://www.youtube.com/watch?v=KJFRjlBR5_s',
  'línea': 'https://www.youtube.com/watch?v=KJFRjlBR5_s',
  'linea': 'https://www.youtube.com/watch?v=KJFRjlBR5_s',
  'obstáculo': 'https://www.youtube.com/watch?v=enCdpRghVzw',
  'obstaculo': 'https://www.youtube.com/watch?v=enCdpRghVzw',
  'servo': 'https://www.youtube.com/watch?v=aFHu65LiFok',
  'motor': 'https://www.youtube.com/watch?v=fPLEncYrl4Q',
  
  // IA
  'machine learning': 'https://www.youtube.com/watch?v=KytW151dpqU',
  'red neuronal': 'https://www.youtube.com/watch?v=DRkO_r-7Yhc',
  'tensorflow': 'https://www.youtube.com/watch?v=w2RJ1D6kz-o',
  'python': 'https://www.youtube.com/watch?v=Kp4Mvapo5kc',
  'chatgpt': 'https://www.youtube.com/watch?v=CbpsDMwFG2g',
  
  // Hacking
  'kali': 'https://www.youtube.com/watch?v=Y-ENkAP4kpU',
  'linux': 'https://www.youtube.com/watch?v=Y-ENkAP4kpU',
  'contraseña': 'https://www.youtube.com/watch?v=t7uuP4FJKdM',
  'password': 'https://www.youtube.com/watch?v=t7uuP4FJKdM',
  'pentesting': 'https://www.youtube.com/watch?v=tHd8k54kVs8',
  'seguridad': 'https://www.youtube.com/watch?v=DSKqHlpq-2c',
};

async function fetchAllLessons() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?pageSize=100`;
  let allRecords = [];
  let offset = null;
  
  do {
    const fetchUrl = offset ? `${url}&offset=${offset}` : url;
    const response = await fetch(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching lessons: ${response.status}`);
    }
    
    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
    
    // Esperar para no exceder límites
    await new Promise(resolve => setTimeout(resolve, 200));
  } while (offset);
  
  return allRecords;
}

function getVideoForLesson(lesson) {
  const fields = lesson.fields;
  const title = (fields.title || '').toLowerCase();
  const programId = fields.programId || 'robotica';
  const levelId = fields.levelId || '';
  const existingVideo = fields.videoUrl || '';
  
  // Si ya tiene video de Google Drive (del usuario), NO modificar
  if (existingVideo && existingVideo.includes('drive.google.com')) {
    return null; // No cambiar
  }
  
  // Buscar video específico por tema
  for (const [keyword, videoUrl] of Object.entries(VIDEOS_POR_TEMA)) {
    if (title.includes(keyword)) {
      return videoUrl;
    }
  }
  
  // Usar video por programa y nivel
  const programVideos = VIDEOS_ESPAÑOL[programId];
  if (programVideos && programVideos[levelId]) {
    return programVideos[levelId];
  }
  
  // Fallback por programa
  if (programId === 'robotica') {
    return 'https://www.youtube.com/watch?v=J335gEmnDTs';
  } else if (programId === 'ia') {
    return 'https://www.youtube.com/watch?v=KytW151dpqU';
  } else if (programId === 'hacking') {
    return 'https://www.youtube.com/watch?v=DSKqHlpq-2c';
  }
  
  return null;
}

async function updateLesson(recordId, videoUrl) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons/${recordId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: { videoUrl }
    }),
  });
  
  return response.ok;
}

async function main() {
  console.log('🎬 Actualizando videos a ESPAÑOL...\n');
  console.log('📌 Videos de Google Drive del usuario serán PRESERVADOS\n');
  
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ Error: Faltan variables de entorno');
    process.exit(1);
  }
  
  // Obtener todas las lecciones
  console.log('📥 Obteniendo lecciones de Airtable...');
  const lessons = await fetchAllLessons();
  console.log(`   Total: ${lessons.length} lecciones\n`);
  
  let updated = 0;
  let preserved = 0;
  let skipped = 0;
  
  for (const lesson of lessons) {
    const fields = lesson.fields;
    const existingVideo = fields.videoUrl || '';
    
    // Preservar videos de Google Drive
    if (existingVideo.includes('drive.google.com')) {
      preserved++;
      console.log(`🔒 "${fields.title}" → Video de Drive PRESERVADO`);
      continue;
    }
    
    const newVideo = getVideoForLesson(lesson);
    
    if (!newVideo) {
      skipped++;
      continue;
    }
    
    // Solo actualizar si es diferente
    if (newVideo !== existingVideo) {
      const success = await updateLesson(lesson.id, newVideo);
      if (success) {
        updated++;
        console.log(`✅ "${fields.title}" → Video en español agregado`);
      }
      
      // Esperar para no exceder límites
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      skipped++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN:');
  console.log(`   🔒 Videos de Drive preservados: ${preserved}`);
  console.log(`   ✅ Videos actualizados a español: ${updated}`);
  console.log(`   ⏭️  Sin cambios: ${skipped}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
