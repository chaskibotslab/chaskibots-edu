/**
 * Script para agregar videos educativos a lecciones sin contenido multimedia
 * IMPORTANTE: NO modifica lecciones que ya tienen videoUrl
 * 
 * Uso: node scripts/add-educational-videos.js
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno manualmente
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

// Videos educativos de calidad por tema y nivel
const EDUCATIONAL_VIDEOS = {
  robotica: {
    // Niveles iniciales (3-6 años)
    'inicial-1': [
      { keywords: ['robot', 'bienvenida'], url: 'https://www.youtube.com/watch?v=8wHJjLMnikU' },
      { keywords: ['colores', 'led'], url: 'https://www.youtube.com/watch?v=Ng5SlVXrXl8' },
      { keywords: ['formas', 'geometr'], url: 'https://www.youtube.com/watch?v=WTeqUejf3D0' },
    ],
    'inicial-2': [
      { keywords: ['circuito', 'electric'], url: 'https://www.youtube.com/watch?v=HOFp8bHTN30' },
      { keywords: ['motor'], url: 'https://www.youtube.com/watch?v=CWulQ1ZSE3c' },
    ],
    // Primaria (6-12 años)
    'primero-egb': [
      { keywords: ['scratch', 'bloques'], url: 'https://www.youtube.com/watch?v=jXUZaf5D12A' },
      { keywords: ['robot', 'programa'], url: 'https://www.youtube.com/watch?v=3XGKrPBIIjo' },
    ],
    'segundo-egb': [
      { keywords: ['scratch'], url: 'https://www.youtube.com/watch?v=jXUZaf5D12A' },
      { keywords: ['sensor'], url: 'https://www.youtube.com/watch?v=wNQVo4ochj4' },
    ],
    'tercero-egb': [
      { keywords: ['makecode', 'arcade'], url: 'https://www.youtube.com/watch?v=GUKVhDAjHTA' },
      { keywords: ['led', 'circuito'], url: 'https://www.youtube.com/watch?v=HOFp8bHTN30' },
    ],
    'cuarto-egb': [
      { keywords: ['electr', 'circuito'], url: 'https://www.youtube.com/watch?v=mc979OhitAg' },
      { keywords: ['arduino', 'led'], url: 'https://www.youtube.com/watch?v=nPOKOi1jIK0' },
    ],
    'quinto-egb': [
      { keywords: ['arduino', 'básico'], url: 'https://www.youtube.com/watch?v=nPOKOi1jIK0' },
      { keywords: ['sensor', 'ultrasónico'], url: 'https://www.youtube.com/watch?v=ZejQOX69K5M' },
    ],
    'sexto-egb': [
      { keywords: ['arduino', 'motor'], url: 'https://www.youtube.com/watch?v=fPLEncYrl4Q' },
      { keywords: ['servo'], url: 'https://www.youtube.com/watch?v=kUHmYKWwuWs' },
    ],
    'septimo-egb': [
      { keywords: ['arduino', 'proyecto'], url: 'https://www.youtube.com/watch?v=BtLwoNJ6klE' },
      { keywords: ['bluetooth'], url: 'https://www.youtube.com/watch?v=sXs7S048eIo' },
    ],
    // Secundaria (12-15 años)
    'octavo-egb': [
      { keywords: ['esp32', 'introducción'], url: 'https://www.youtube.com/watch?v=k_D_Qu0cgu8' },
      { keywords: ['pid', 'control'], url: 'https://www.youtube.com/watch?v=wkfEZmsQqiA' },
      { keywords: ['brazo', 'robótico'], url: 'https://www.youtube.com/watch?v=_B3gWd3A_SI' },
    ],
    'noveno-egb': [
      { keywords: ['embebido', 'sistema'], url: 'https://www.youtube.com/watch?v=K3e8Hn3HYXE' },
      { keywords: ['rtos'], url: 'https://www.youtube.com/watch?v=F321087yYy4' },
      { keywords: ['industrial'], url: 'https://www.youtube.com/watch?v=P7fi4hP_y80' },
    ],
    'decimo-egb': [
      { keywords: ['ros', 'robot'], url: 'https://www.youtube.com/watch?v=Qk4vLFhvfbI' },
      { keywords: ['visión', 'computadora'], url: 'https://www.youtube.com/watch?v=oXlwWbU8l2o' },
    ],
    // Bachillerato (15-18 años)
    'primero-bach': [
      { keywords: ['machine learning', 'robot'], url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU' },
      { keywords: ['slam', 'navegación'], url: 'https://www.youtube.com/watch?v=saVZtgPyyJQ' },
    ],
    'segundo-bach': [
      { keywords: ['deep learning'], url: 'https://www.youtube.com/watch?v=VyWAvY2CF9c' },
      { keywords: ['reinforcement'], url: 'https://www.youtube.com/watch?v=JgvyzIkgxF0' },
    ],
    'tercero-bach': [
      { keywords: ['investigación', 'robótica'], url: 'https://www.youtube.com/watch?v=fn3KWM1kuAw' },
      { keywords: ['futuro', 'robot'], url: 'https://www.youtube.com/watch?v=8vIT2da6N_o' },
    ],
  },
  ia: {
    'inicial-1': [
      { keywords: ['inteligencia', 'artificial', 'niños'], url: 'https://www.youtube.com/watch?v=mJeNghZXtMo' },
    ],
    'inicial-2': [
      { keywords: ['robot', 'aprende'], url: 'https://www.youtube.com/watch?v=a0_lo_GXe-8' },
    ],
    'cuarto-egb': [
      { keywords: ['scratch', 'ia'], url: 'https://www.youtube.com/watch?v=UZd6gVsLOHw' },
      { keywords: ['teachable', 'machine'], url: 'https://www.youtube.com/watch?v=kwcillcWOg0' },
    ],
    'quinto-egb': [
      { keywords: ['machine learning', 'niños'], url: 'https://www.youtube.com/watch?v=f_uwKZIAeM0' },
    ],
    'sexto-egb': [
      { keywords: ['visión', 'computadora'], url: 'https://www.youtube.com/watch?v=oXlwWbU8l2o' },
      { keywords: ['reconocimiento', 'imagen'], url: 'https://www.youtube.com/watch?v=aircAruvnKk' },
    ],
    'septimo-egb': [
      { keywords: ['chatgpt', 'prompt'], url: 'https://www.youtube.com/watch?v=_ZvnD96BbJI' },
      { keywords: ['dall-e', 'imagen'], url: 'https://www.youtube.com/watch?v=U1cF9QCu1rQ' },
    ],
    'octavo-egb': [
      { keywords: ['python', 'ia'], url: 'https://www.youtube.com/watch?v=DkpYj0GCWIU' },
      { keywords: ['tensorflow'], url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk' },
    ],
    'noveno-egb': [
      { keywords: ['redes', 'neuronales'], url: 'https://www.youtube.com/watch?v=MRIv2IwFTPg' },
      { keywords: ['deep learning'], url: 'https://www.youtube.com/watch?v=VyWAvY2CF9c' },
    ],
    'decimo-egb': [
      { keywords: ['nlp', 'procesamiento'], url: 'https://www.youtube.com/watch?v=fOvTtapxa9c' },
      { keywords: ['transformer'], url: 'https://www.youtube.com/watch?v=SZorAJ4I-sA' },
    ],
    'primero-bach': [
      { keywords: ['pytorch'], url: 'https://www.youtube.com/watch?v=EMXfZB8FVUA' },
      { keywords: ['cnn', 'convolucional'], url: 'https://www.youtube.com/watch?v=YRhxdVk_sIs' },
    ],
    'segundo-bach': [
      { keywords: ['gpt', 'llm'], url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g' },
      { keywords: ['ética', 'ia'], url: 'https://www.youtube.com/watch?v=UwsrzCVZAb8' },
    ],
    'tercero-bach': [
      { keywords: ['agi', 'futuro'], url: 'https://www.youtube.com/watch?v=ad79nYk2keg' },
      { keywords: ['startup', 'ia'], url: 'https://www.youtube.com/watch?v=SEkGLj0bwAU' },
    ],
  },
  hacking: {
    'cuarto-egb': [
      { keywords: ['contraseña', 'segura'], url: 'https://www.youtube.com/watch?v=3NjQ9b3pgIg' },
      { keywords: ['phishing'], url: 'https://www.youtube.com/watch?v=XBkzBrXlle0' },
    ],
    'quinto-egb': [
      { keywords: ['internet', 'seguro'], url: 'https://www.youtube.com/watch?v=yrln8nyVBLU' },
      { keywords: ['privacidad'], url: 'https://www.youtube.com/watch?v=yiKeLOKc1tw' },
    ],
    'sexto-egb': [
      { keywords: ['ciberseguridad', 'básico'], url: 'https://www.youtube.com/watch?v=inWWhr5tnEA' },
      { keywords: ['malware'], url: 'https://www.youtube.com/watch?v=n8mbzU0X2nQ' },
    ],
    'septimo-egb': [
      { keywords: ['linux', 'básico'], url: 'https://www.youtube.com/watch?v=wBp0Rb-ZJak' },
      { keywords: ['terminal', 'comandos'], url: 'https://www.youtube.com/watch?v=s3ii48qYBxA' },
    ],
    'octavo-egb': [
      { keywords: ['criptografía'], url: 'https://www.youtube.com/watch?v=jhXCTbFnK8o' },
      { keywords: ['hash', 'cifrado'], url: 'https://www.youtube.com/watch?v=b4b8ktEV4Bg' },
    ],
    'noveno-egb': [
      { keywords: ['kali', 'linux'], url: 'https://www.youtube.com/watch?v=lZAoFs75_cs' },
      { keywords: ['nmap', 'escaneo'], url: 'https://www.youtube.com/watch?v=4t4kBkMsDbQ' },
    ],
    'decimo-egb': [
      { keywords: ['pentesting'], url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE' },
      { keywords: ['metasploit'], url: 'https://www.youtube.com/watch?v=8lR27r8Y_ik' },
    ],
    'primero-bach': [
      { keywords: ['burp', 'suite'], url: 'https://www.youtube.com/watch?v=G3hpAeoZ4ek' },
      { keywords: ['owasp', 'web'], url: 'https://www.youtube.com/watch?v=rWHvp7rUka8' },
    ],
    'segundo-bach': [
      { keywords: ['ctf', 'capture'], url: 'https://www.youtube.com/watch?v=Lus7aNf2xDg' },
      { keywords: ['forense', 'digital'], url: 'https://www.youtube.com/watch?v=fZc3cCPJgLY' },
    ],
    'tercero-bach': [
      { keywords: ['red team'], url: 'https://www.youtube.com/watch?v=pL9q2lOZ1Fw' },
      { keywords: ['ciso', 'seguridad'], url: 'https://www.youtube.com/watch?v=bZe5J8SVCYQ' },
    ],
  }
};

// Videos genéricos por programa (fallback)
const GENERIC_VIDEOS = {
  robotica: [
    'https://www.youtube.com/watch?v=3XGKrPBIIjo', // Qué es un robot
    'https://www.youtube.com/watch?v=nPOKOi1jIK0', // Arduino básico
    'https://www.youtube.com/watch?v=k_D_Qu0cgu8', // ESP32 intro
  ],
  ia: [
    'https://www.youtube.com/watch?v=mJeNghZXtMo', // IA para niños
    'https://www.youtube.com/watch?v=aircAruvnKk', // Redes neuronales
    'https://www.youtube.com/watch?v=VyWAvY2CF9c', // Deep learning
  ],
  hacking: [
    'https://www.youtube.com/watch?v=inWWhr5tnEA', // Ciberseguridad básica
    'https://www.youtube.com/watch?v=lZAoFs75_cs', // Kali Linux
    'https://www.youtube.com/watch?v=3Kq1MIfTWCE', // Pentesting
  ]
};

async function fetchAllLessons() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`;
  let allRecords = [];
  let offset = null;

  do {
    const fetchUrl = offset ? `${url}?offset=${offset}` : url;
    const response = await fetch(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching lessons: ${response.statusText}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

function findVideoForLesson(lesson, programId, levelId) {
  const title = (lesson.title || '').toLowerCase();
  const content = (lesson.content || '').toLowerCase();
  const searchText = `${title} ${content}`;

  // Buscar en videos específicos del programa y nivel
  const programVideos = EDUCATIONAL_VIDEOS[programId];
  if (programVideos && programVideos[levelId]) {
    for (const video of programVideos[levelId]) {
      const matches = video.keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
      if (matches) {
        return video.url;
      }
    }
  }

  // Fallback a video genérico del programa
  const genericVideos = GENERIC_VIDEOS[programId];
  if (genericVideos && genericVideos.length > 0) {
    // Seleccionar basado en el orden de la lección
    const index = (lesson.order || 0) % genericVideos.length;
    return genericVideos[index];
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
      fields: {
        videoUrl: videoUrl
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error updating lesson ${recordId}: ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('🎬 Agregando videos educativos a lecciones...\n');
  console.log('⚠️  IMPORTANTE: Solo se modificarán lecciones SIN video existente\n');

  try {
    const lessons = await fetchAllLessons();
    console.log(`📚 Total de lecciones encontradas: ${lessons.length}`);

    // Filtrar lecciones sin video
    const lessonsWithoutVideo = lessons.filter(record => {
      const videoUrl = record.fields.videoUrl;
      return !videoUrl || videoUrl.trim() === '';
    });

    console.log(`🎯 Lecciones sin video: ${lessonsWithoutVideo.length}`);
    console.log(`✅ Lecciones con video (no se tocarán): ${lessons.length - lessonsWithoutVideo.length}\n`);

    let updated = 0;
    let skipped = 0;

    for (const record of lessonsWithoutVideo) {
      const { programId, levelId, title } = record.fields;
      
      if (!programId || !levelId) {
        console.log(`⏭️  Saltando "${title}" - falta programId o levelId`);
        skipped++;
        continue;
      }

      const videoUrl = findVideoForLesson(record.fields, programId, levelId);
      
      if (videoUrl) {
        try {
          await updateLesson(record.id, videoUrl);
          console.log(`✅ "${title}" (${levelId}/${programId}) → Video agregado`);
          updated++;
          
          // Esperar un poco para no exceder límites de API
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.error(`❌ Error actualizando "${title}": ${error.message}`);
        }
      } else {
        console.log(`⏭️  "${title}" - No se encontró video apropiado`);
        skipped++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ⏭️  Saltadas: ${skipped}`);
    console.log(`   📹 Con video previo: ${lessons.length - lessonsWithoutVideo.length}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
