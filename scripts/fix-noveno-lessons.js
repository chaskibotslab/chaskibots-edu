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

// Videos educativos de YouTube en español para Sistemas Embebidos y Robótica (9no EGB)
const videosNoveno = {
  // Sistemas Embebidos
  'arquitectura de sistemas embebidos': 'https://www.youtube.com/watch?v=WVLhszqVVoI', // Sistemas embebidos explicación
  'rtos': 'https://www.youtube.com/watch?v=F321087yYy4', // RTOS explicación
  'sistemas operativos': 'https://www.youtube.com/watch?v=F321087yYy4',
  'microcontroladores avanzados': 'https://www.youtube.com/watch?v=TKhCr-dQMBY', // ESP32 tutorial
  'esp32': 'https://www.youtube.com/watch?v=TKhCr-dQMBY',
  'comunicación inalámbrica': 'https://www.youtube.com/watch?v=TKhCr-dQMBY',
  'wifi': 'https://www.youtube.com/watch?v=TKhCr-dQMBY',
  'bluetooth': 'https://www.youtube.com/watch?v=aop4kSfOLvE',
  'iot': 'https://www.youtube.com/watch?v=TKhCr-dQMBY',
  'internet de las cosas': 'https://www.youtube.com/watch?v=TKhCr-dQMBY',
  
  // Programación
  'programación': 'https://www.youtube.com/watch?v=DLikpfc64cA', // Arduino programación
  'arduino': 'https://www.youtube.com/watch?v=DLikpfc64cA',
  'sensores': 'https://www.youtube.com/watch?v=nKFg9LgpL6o', // Sensores Arduino
  'actuadores': 'https://www.youtube.com/watch?v=Y1StKv-Z8Ks', // Motores y actuadores
  'motores': 'https://www.youtube.com/watch?v=Y1StKv-Z8Ks',
  'servo': 'https://www.youtube.com/watch?v=Y1StKv-Z8Ks',
  
  // Electrónica
  'circuitos': 'https://www.youtube.com/watch?v=VVsLlGbGzDk', // Circuitos básicos
  'electrónica': 'https://www.youtube.com/watch?v=VVsLlGbGzDk',
  'led': 'https://www.youtube.com/watch?v=G9xDSFhiSBY', // LED Arduino
  'resistencia': 'https://www.youtube.com/watch?v=VVsLlGbGzDk',
  
  // Robótica
  'robot': 'https://www.youtube.com/watch?v=srMmZt5I7PU', // Robot Arduino
  'robótica': 'https://www.youtube.com/watch?v=srMmZt5I7PU',
  'brazo robótico': 'https://www.youtube.com/watch?v=_B3gWd3A_SI',
  'seguidor de línea': 'https://www.youtube.com/watch?v=GHVK-DuWnH8',
  
  // Proyectos
  'proyecto': 'https://www.youtube.com/watch?v=srMmZt5I7PU',
  'prototipo': 'https://www.youtube.com/watch?v=srMmZt5I7PU',
}

// Simuladores recomendados por tema
const simuladoresPorTema = {
  'sistemas embebidos': 'Wokwi (ESP32/Arduino)',
  'microcontroladores': 'Wokwi, Tinkercad',
  'esp32': 'Wokwi',
  'arduino': 'Tinkercad, Wokwi',
  'circuitos': 'Tinkercad, Falstad',
  'electrónica': 'Falstad, CircuitVerse',
  'programación': 'Scratch, MakeCode',
  'robot': 'Tinkercad, Wokwi',
  'iot': 'Wokwi',
}

function findBestVideo(title) {
  const titleLower = title.toLowerCase()
  for (const [keyword, url] of Object.entries(videosNoveno)) {
    if (titleLower.includes(keyword)) {
      return url
    }
  }
  // Video por defecto de sistemas embebidos
  return 'https://www.youtube.com/watch?v=WVLhszqVVoI'
}

function findSimulator(title) {
  const titleLower = title.toLowerCase()
  for (const [keyword, sim] of Object.entries(simuladoresPorTema)) {
    if (titleLower.includes(keyword)) {
      return sim
    }
  }
  return 'Wokwi, Tinkercad'
}

async function fetchLessons() {
  const url = `${AIRTABLE_API_URL}?filterByFormula={levelId}="noveno-egb"&sort[0][field]=order&sort[0][direction]=asc`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error fetching: ${error}`)
  }
  
  const data = await response.json()
  return data.records
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
    const error = await response.text()
    throw new Error(`Error updating ${recordId}: ${error}`)
  }
  
  return await response.json()
}

async function main() {
  console.log('🔍 Buscando lecciones de 9no EGB...\n')
  
  const lessons = await fetchLessons()
  console.log(`📚 Encontradas ${lessons.length} lecciones\n`)
  
  let updated = 0
  let skipped = 0
  
  for (const lesson of lessons) {
    const { id, fields } = lesson
    const title = fields.title || 'Sin título'
    const currentVideo = fields.videoUrl || ''
    
    console.log(`\n📖 ${title}`)
    console.log(`   Video actual: ${currentVideo ? currentVideo.substring(0, 50) + '...' : 'Sin video'}`)
    
    // Buscar mejor video
    const newVideo = findBestVideo(title)
    const simulator = findSimulator(title)
    
    // Solo actualizar si no tiene video o el video no funciona (Google Drive)
    const needsUpdate = !currentVideo || 
                        currentVideo.includes('drive.google.com') ||
                        currentVideo.includes('unavailable')
    
    if (needsUpdate) {
      console.log(`   ✅ Nuevo video: ${newVideo}`)
      console.log(`   🎮 Simulador: ${simulator}`)
      
      // Mejorar el contenido para que sea más práctico
      const improvedContent = `## 🎯 Objetivos
- Comprender los conceptos de ${title}
- Aplicar conocimientos en práctica con simuladores
- Desarrollar habilidades técnicas

## 📺 Video Tutorial
Mira el video explicativo y toma notas de los puntos importantes.

## 🎮 Práctica con Simulador
Usa **${simulator}** para practicar lo aprendido.

## 💡 Actividad
1. Ve el video completo
2. Abre el simulador recomendado
3. Replica el ejercicio del video
4. Experimenta con variaciones

## ✨ Reto
Modifica el proyecto para agregar una función nueva.`
      
      try {
        await updateLesson(id, {
          videoUrl: newVideo,
          content: improvedContent
        })
        updated++
        console.log(`   ✅ Actualizado!`)
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`)
      }
      
      // Esperar para no exceder límites de API
      await new Promise(r => setTimeout(r, 250))
    } else {
      console.log(`   ⏭️ Video YouTube existente, saltando`)
      skipped++
    }
  }
  
  console.log(`\n\n📊 Resumen:`)
  console.log(`   ✅ Actualizadas: ${updated}`)
  console.log(`   ⏭️ Saltadas: ${skipped}`)
  console.log(`   📚 Total: ${lessons.length}`)
}

main().catch(console.error)
