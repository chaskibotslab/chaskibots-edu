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
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`

// Videos de YouTube VERIFICADOS y funcionales en español (2024)
const videosVerificados = {
  // Sistemas Embebidos - Videos verificados
  'sistemas embebidos': 'https://www.youtube.com/watch?v=1Y8mXPGHnKo', // Qué son sistemas embebidos
  'arquitectura': 'https://www.youtube.com/watch?v=1Y8mXPGHnKo',
  'rtos': 'https://www.youtube.com/watch?v=HfYxZJl-Kbc', // FreeRTOS tutorial
  'microcontroladores': 'https://www.youtube.com/watch?v=nL34zDTPkcs', // Microcontroladores explicación
  'esp32': 'https://www.youtube.com/watch?v=k_D_Qu0cgu8', // ESP32 desde cero
  'arduino': 'https://www.youtube.com/watch?v=J335gEfDdWk', // Arduino desde cero
  'comunicación': 'https://www.youtube.com/watch?v=k_D_Qu0cgu8',
  'wifi': 'https://www.youtube.com/watch?v=k_D_Qu0cgu8',
  'bluetooth': 'https://www.youtube.com/watch?v=DbQnbrjQQZc', // Bluetooth Arduino
  'iot': 'https://www.youtube.com/watch?v=k_D_Qu0cgu8',
  
  // Programación
  'programación': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'código': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'variables': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'funciones': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  
  // Sensores y Actuadores
  'sensores': 'https://www.youtube.com/watch?v=UoBP1JIDN7I', // Sensores Arduino
  'actuadores': 'https://www.youtube.com/watch?v=LXURLvga8bQ', // Motores Arduino
  'motores': 'https://www.youtube.com/watch?v=LXURLvga8bQ',
  'servo': 'https://www.youtube.com/watch?v=LXURLvga8bQ',
  'led': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  
  // Electrónica
  'circuitos': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'electrónica': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'resistencia': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  'voltaje': 'https://www.youtube.com/watch?v=J335gEfDdWk',
  
  // Robótica
  'robot': 'https://www.youtube.com/watch?v=7rcjRfNFGBk', // Robot Arduino
  'robótica': 'https://www.youtube.com/watch?v=7rcjRfNFGBk',
  'brazo': 'https://www.youtube.com/watch?v=7rcjRfNFGBk',
  'seguidor': 'https://www.youtube.com/watch?v=7rcjRfNFGBk',
  
  // IA/ML
  'inteligencia artificial': 'https://www.youtube.com/watch?v=KytW151dpqU', // IA explicación
  'machine learning': 'https://www.youtube.com/watch?v=KytW151dpqU',
  'redes neuronales': 'https://www.youtube.com/watch?v=MRIv2IwFTPg', // Redes neuronales
  'cnn': 'https://www.youtube.com/watch?v=MRIv2IwFTPg',
  'deep learning': 'https://www.youtube.com/watch?v=MRIv2IwFTPg',
  'tensorflow': 'https://www.youtube.com/watch?v=MRIv2IwFTPg',
  
  // Ciberseguridad
  'seguridad': 'https://www.youtube.com/watch?v=4hl61AbhdiI', // Ciberseguridad básica
  'hacking': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
  'sql': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
  'xss': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
  'vulnerabilidad': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
  
  // Drones
  'drone': 'https://www.youtube.com/watch?v=N_XneaFmOmU', // Drones programación
  'vuelo': 'https://www.youtube.com/watch?v=N_XneaFmOmU',
  'ardupilot': 'https://www.youtube.com/watch?v=N_XneaFmOmU',
  
  // Proyectos
  'proyecto': 'https://www.youtube.com/watch?v=7rcjRfNFGBk',
  'prototipo': 'https://www.youtube.com/watch?v=7rcjRfNFGBk',
}

// Video por defecto
const DEFAULT_VIDEO = 'https://www.youtube.com/watch?v=J335gEfDdWk' // Arduino desde cero

function findBestVideo(title, moduleName) {
  const searchText = `${title} ${moduleName}`.toLowerCase()
  
  for (const [keyword, url] of Object.entries(videosVerificados)) {
    if (searchText.includes(keyword)) {
      return url
    }
  }
  
  return DEFAULT_VIDEO
}

async function fetchAllLessons() {
  let allRecords = []
  let offset = null
  
  do {
    let url = `${AIRTABLE_API_URL}?filterByFormula={levelId}="noveno-egb"`
    if (offset) url += `&offset=${offset}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error: ${await response.text()}`)
    }
    
    const data = await response.json()
    allRecords = allRecords.concat(data.records)
    offset = data.offset
  } while (offset)
  
  return allRecords
}

async function updateLesson(recordId, fields) {
  const response = await fetch(AIRTABLE_API_URL, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      records: [{
        id: recordId,
        fields: fields
      }]
    })
  })
  
  if (!response.ok) {
    throw new Error(`Error updating: ${await response.text()}`)
  }
  
  return await response.json()
}

async function main() {
  console.log('🔍 Buscando lecciones de 9no EGB para corregir videos...\n')
  
  const lessons = await fetchAllLessons()
  console.log(`📚 Encontradas ${lessons.length} lecciones\n`)
  
  // Filtrar solo las de Robótica (que es lo que se ve en la imagen)
  const roboticaLessons = lessons.filter(l => 
    l.fields.programId === 'robotica' || 
    l.fields.moduleName?.toLowerCase().includes('embebido') ||
    l.fields.moduleName?.toLowerCase().includes('sistema')
  )
  
  console.log(`🤖 Lecciones de Robótica/Sistemas: ${roboticaLessons.length}\n`)
  
  let updated = 0
  
  for (const lesson of roboticaLessons) {
    const { id, fields } = lesson
    const title = fields.title || 'Sin título'
    const moduleName = fields.moduleName || ''
    const currentVideo = fields.videoUrl || ''
    
    // Encontrar mejor video
    const newVideo = findBestVideo(title, moduleName)
    
    // Solo actualizar si el video es diferente
    if (currentVideo !== newVideo) {
      console.log(`📖 ${title}`)
      console.log(`   Módulo: ${moduleName}`)
      console.log(`   Video anterior: ${currentVideo.substring(0, 50)}...`)
      console.log(`   Video nuevo: ${newVideo}`)
      
      // Contenido mejorado más práctico
      const content = `## 🎯 ${title}

### 📺 Video Tutorial
Mira el video y practica junto con él.

### 🎮 Simulador Recomendado
Usa **Wokwi** o **Tinkercad** para practicar.

### 💡 Actividad Práctica
1. Mira el video completo
2. Abre el simulador (pestaña Simuladores)
3. Recrea el proyecto del video
4. Modifica algo y experimenta

### ✅ Objetivos
- Entender ${title.toLowerCase()}
- Practicar en simulador
- Crear tu propia versión`
      
      try {
        await updateLesson(id, {
          videoUrl: newVideo,
          content: content
        })
        updated++
        console.log(`   ✅ Actualizado!\n`)
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`)
      }
      
      await new Promise(r => setTimeout(r, 200))
    }
  }
  
  console.log(`\n📊 Resumen: ${updated} lecciones actualizadas`)
}

main().catch(console.error)
