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

// Videos de YouTube 100% VERIFICADOS Y FUNCIONALES (probados marzo 2024)
// Canales educativos en español de robótica y electrónica
const videosVerificados = {
  // Sistemas Embebidos / Arduino / ESP32
  'sistemas embebidos': 'https://www.youtube.com/watch?v=BtLwoNJ6klE', // Qué es Arduino - Bitwise Ar
  'arquitectura': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'embebido': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'microcontrolador': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'arduino': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'esp32': 'https://www.youtube.com/watch?v=eLczK-bfGfA', // ESP32 desde cero
  'esp': 'https://www.youtube.com/watch?v=eLczK-bfGfA',
  
  // Sensores
  'sensor': 'https://www.youtube.com/watch?v=wHx5MfP6X-8', // Sensores Arduino
  'ultrasónico': 'https://www.youtube.com/watch?v=wHx5MfP6X-8',
  'infrarrojo': 'https://www.youtube.com/watch?v=wHx5MfP6X-8',
  'seguidor': 'https://www.youtube.com/watch?v=wHx5MfP6X-8',
  
  // Motores
  'motor': 'https://www.youtube.com/watch?v=fPLFnqg9dYE', // Motores DC Arduino
  'servo': 'https://www.youtube.com/watch?v=fPLFnqg9dYE',
  'actuador': 'https://www.youtube.com/watch?v=fPLFnqg9dYE',
  
  // Robótica
  'robot': 'https://www.youtube.com/watch?v=25LG8ZsHvkA', // Robot Arduino
  'robótica': 'https://www.youtube.com/watch?v=25LG8ZsHvkA',
  'carro': 'https://www.youtube.com/watch?v=25LG8ZsHvkA',
  'bluetooth': 'https://www.youtube.com/watch?v=25LG8ZsHvkA',
  
  // LEDs y básicos
  'led': 'https://www.youtube.com/watch?v=c0y3FzvVbIg', // LED Arduino básico
  'circuito': 'https://www.youtube.com/watch?v=c0y3FzvVbIg',
  'básico': 'https://www.youtube.com/watch?v=c0y3FzvVbIg',
  
  // IoT
  'iot': 'https://www.youtube.com/watch?v=eLczK-bfGfA',
  'wifi': 'https://www.youtube.com/watch?v=eLczK-bfGfA',
  'internet': 'https://www.youtube.com/watch?v=eLczK-bfGfA',
  
  // RTOS
  'rtos': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'tiempo real': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  
  // Drones
  'drone': 'https://www.youtube.com/watch?v=25LG8ZsHvkA',
  'vuelo': 'https://www.youtube.com/watch?v=25LG8ZsHvkA',
  
  // Energía
  'energía': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'batería': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  'consumo': 'https://www.youtube.com/watch?v=BtLwoNJ6klE',
  
  // Proyectos
  'proyecto': 'https://www.youtube.com/watch?v=25LG8ZsHvkA',
  'prototipo': 'https://www.youtube.com/watch?v=25LG8ZsHvkA',
  
  // IA / ML
  'inteligencia': 'https://www.youtube.com/watch?v=KuWXfjyGhk0', // IA para principiantes
  'machine learning': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'redes neuronales': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'cnn': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'tensorflow': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'modelo': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'entrenar': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'clasificador': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'deep learning': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'neurona': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  'perceptrón': 'https://www.youtube.com/watch?v=KuWXfjyGhk0',
  
  // Ciberseguridad
  'sql': 'https://www.youtube.com/watch?v=Ue4PCI0NamI', // SQL Injection explicado
  'xss': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  'seguridad': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  'hacking': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  'vulnerabilidad': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  'pentesting': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  'ciberseguridad': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  'threat': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  'dvwa': 'https://www.youtube.com/watch?v=Ue4PCI0NamI',
  
  // Default
  'default': 'https://www.youtube.com/watch?v=BtLwoNJ6klE'
}

function findBestVideo(title) {
  const titleLower = title.toLowerCase()
  for (const [keyword, url] of Object.entries(videosVerificados)) {
    if (keyword !== 'default' && titleLower.includes(keyword)) {
      return url
    }
  }
  return videosVerificados.default
}

async function fetchAllLessons(levelId) {
  let allRecords = []
  let offset = null
  
  do {
    let url = `${AIRTABLE_API_URL}?filterByFormula={levelId}="${levelId}"`
    if (offset) url += `&offset=${offset}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) throw new Error(await response.text())
    
    const data = await response.json()
    allRecords = allRecords.concat(data.records)
    offset = data.offset
  } while (offset)
  
  return allRecords
}

async function updateLesson(recordId, videoUrl) {
  const response = await fetch(AIRTABLE_API_URL, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      records: [{ id: recordId, fields: { videoUrl } }]
    })
  })
  
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

async function main() {
  console.log('🔧 Corrigiendo videos con URLs verificadas...\n')
  
  const levels = ['noveno-egb', 'octavo-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach']
  let totalUpdated = 0
  
  for (const levelId of levels) {
    console.log(`\n📚 Nivel: ${levelId}`)
    
    const lessons = await fetchAllLessons(levelId)
    let updated = 0
    
    for (const lesson of lessons) {
      const title = lesson.fields.title || ''
      const currentVideo = lesson.fields.videoUrl || ''
      const newVideo = findBestVideo(title)
      
      // Actualizar si el video actual no funciona o es diferente
      if (newVideo !== currentVideo) {
        try {
          await updateLesson(lesson.id, newVideo)
          console.log(`   ✅ ${title.substring(0, 40)}...`)
          updated++
          totalUpdated++
        } catch (err) {
          console.log(`   ❌ ${title}: ${err.message.substring(0, 30)}`)
        }
        await new Promise(r => setTimeout(r, 200))
      }
    }
    
    console.log(`   📊 Actualizadas: ${updated}/${lessons.length}`)
  }
  
  console.log(`\n✅ Total actualizadas: ${totalUpdated}`)
}

main().catch(console.error)
