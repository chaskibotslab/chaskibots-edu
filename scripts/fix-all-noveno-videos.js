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

// Videos verificados por programa
const videosPorPrograma = {
  ia: {
    'redes neuronales': 'https://www.youtube.com/watch?v=MRIv2IwFTPg',
    'cnn': 'https://www.youtube.com/watch?v=ysqpl6w6Wzg',
    'convolucional': 'https://www.youtube.com/watch?v=ysqpl6w6Wzg',
    'deep learning': 'https://www.youtube.com/watch?v=MRIv2IwFTPg',
    'tensorflow': 'https://www.youtube.com/watch?v=Y5QqLrSuJGw',
    'keras': 'https://www.youtube.com/watch?v=Y5QqLrSuJGw',
    'machine learning': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'clasificador': 'https://www.youtube.com/watch?v=ysqpl6w6Wzg',
    'transfer learning': 'https://www.youtube.com/watch?v=ysqpl6w6Wzg',
    'recomendación': 'https://www.youtube.com/watch?v=1JRrCEgiyHM',
    'filtrado': 'https://www.youtube.com/watch?v=1JRrCEgiyHM',
    'explicabilidad': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'shap': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'lime': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'modelo': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'entrenar': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'dataset': 'https://www.youtube.com/watch?v=KytW151dpqU',
    'default': 'https://www.youtube.com/watch?v=KytW151dpqU'
  },
  hacking: {
    'sql': 'https://www.youtube.com/watch?v=C-FiImhUviM',
    'sqli': 'https://www.youtube.com/watch?v=C-FiImhUviM',
    'inyección': 'https://www.youtube.com/watch?v=C-FiImhUviM',
    'xss': 'https://www.youtube.com/watch?v=EoaDgUgS6QA',
    'cross-site': 'https://www.youtube.com/watch?v=EoaDgUgS6QA',
    'vulnerabilidad': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'seguridad': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'ciberseguridad': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'hacking': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'pentesting': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'dvwa': 'https://www.youtube.com/watch?v=C-FiImhUviM',
    'owasp': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'threat': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'amenaza': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'inteligencia': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'indicador': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'compromiso': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'hunting': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'certificación': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'carrera': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'profesional': 'https://www.youtube.com/watch?v=4hl61AbhdiI',
    'default': 'https://www.youtube.com/watch?v=4hl61AbhdiI'
  }
}

const simuladoresPorPrograma = {
  ia: 'Google Colab, Teachable Machine',
  hacking: 'DVWA, OverTheWire'
}

function findBestVideo(title, programId) {
  const videos = videosPorPrograma[programId]
  if (!videos) return null
  
  const titleLower = title.toLowerCase()
  for (const [keyword, url] of Object.entries(videos)) {
    if (keyword !== 'default' && titleLower.includes(keyword)) {
      return url
    }
  }
  return videos.default
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
    
    if (!response.ok) throw new Error(`Error: ${await response.text()}`)
    
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
      records: [{ id: recordId, fields }]
    })
  })
  
  if (!response.ok) throw new Error(`Error: ${await response.text()}`)
  return await response.json()
}

async function main() {
  console.log('🔍 Actualizando videos de IA y Hacking en 9no EGB...\n')
  
  const lessons = await fetchAllLessons()
  
  // Filtrar IA y Hacking
  const iaLessons = lessons.filter(l => l.fields.programId === 'ia')
  const hackingLessons = lessons.filter(l => l.fields.programId === 'hacking')
  
  console.log(`🤖 IA: ${iaLessons.length} lecciones`)
  console.log(`🔒 Hacking: ${hackingLessons.length} lecciones\n`)
  
  let updated = 0
  
  // Actualizar IA
  console.log('--- INTELIGENCIA ARTIFICIAL ---\n')
  for (const lesson of iaLessons) {
    const { id, fields } = lesson
    const title = fields.title || ''
    const newVideo = findBestVideo(title, 'ia')
    
    if (newVideo && fields.videoUrl !== newVideo) {
      const simulator = simuladoresPorPrograma.ia
      const content = `## 🎯 ${title}

### 📺 Video Tutorial
Mira el video para entender los conceptos.

### 🎮 Herramientas
Usa **${simulator}** para experimentar.

### 💡 Actividad
1. Ve el video completo
2. Abre ${simulator.split(',')[0]}
3. Practica con ejemplos
4. Crea tu propio modelo

### ✅ Objetivos
- Entender ${title.toLowerCase()}
- Aplicar en práctica
- Experimentar con variaciones`

      try {
        await updateLesson(id, { videoUrl: newVideo, content })
        console.log(`✅ ${title}`)
        updated++
      } catch (err) {
        console.log(`❌ ${title}: ${err.message}`)
      }
      await new Promise(r => setTimeout(r, 200))
    }
  }
  
  // Actualizar Hacking
  console.log('\n--- CIBERSEGURIDAD ---\n')
  for (const lesson of hackingLessons) {
    const { id, fields } = lesson
    const title = fields.title || ''
    const newVideo = findBestVideo(title, 'hacking')
    
    if (newVideo && fields.videoUrl !== newVideo) {
      const simulator = simuladoresPorPrograma.hacking
      const content = `## 🔒 ${title}

### 📺 Video Tutorial
Aprende los conceptos de seguridad.

### 🎮 Práctica Segura
Usa **${simulator}** en entorno controlado.

### ⚠️ Importante
Solo practica en entornos autorizados.

### 💡 Actividad
1. Ve el video completo
2. Configura tu entorno de práctica
3. Sigue los ejercicios guiados
4. Documenta tus hallazgos

### ✅ Objetivos
- Entender ${title.toLowerCase()}
- Practicar éticamente
- Aprender a proteger sistemas`

      try {
        await updateLesson(id, { videoUrl: newVideo, content })
        console.log(`✅ ${title}`)
        updated++
      } catch (err) {
        console.log(`❌ ${title}: ${err.message}`)
      }
      await new Promise(r => setTimeout(r, 200))
    }
  }
  
  console.log(`\n📊 Total actualizadas: ${updated}`)
}

main().catch(console.error)
