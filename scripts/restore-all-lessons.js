const fs = require('fs')
const path = require('path')

// Leer configuración de .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const AIRTABLE_API_KEY = envContent.match(/AIRTABLE_API_KEY=(.+)/)?.[1]?.trim()
const AIRTABLE_BASE_ID = envContent.match(/AIRTABLE_BASE_ID=(.+)/)?.[1]?.trim()

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Error: No se encontraron las credenciales de Airtable')
  process.exit(1)
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`

// Valores válidos de duración en Airtable
const VALID_DURATIONS = ['5 min', '8 min', '10 min', '15 min', '20 min', '25 min', '30 min', '35 min', '40 min', '45 min', '50 min', '60 min']

function cleanDuration(duration) {
  if (!duration) return '30 min'
  // Limpiar comillas extras
  const clean = duration.replace(/"/g, '').trim()
  // Si es válido, usarlo
  if (VALID_DURATIONS.includes(clean)) return clean
  // Extraer número y redondear a valor válido
  const num = parseInt(clean.match(/\d+/)?.[0] || '30')
  if (num <= 5) return '5 min'
  if (num <= 10) return '10 min'
  if (num <= 15) return '15 min'
  if (num <= 20) return '20 min'
  if (num <= 25) return '25 min'
  if (num <= 30) return '30 min'
  if (num <= 35) return '35 min'
  if (num <= 40) return '40 min'
  if (num <= 45) return '45 min'
  if (num <= 50) return '50 min'
  return '60 min'
}

// Parsear CSV
function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim())
  const headers = lines[0].split(',')
  
  return lines.slice(1).map(line => {
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const obj = {}
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i] || ''
    })
    return obj
  })
}

// Obtener lecciones existentes
async function getExistingLessons() {
  const lessons = []
  let offset = null
  
  do {
    const url = offset ? `${AIRTABLE_URL}?offset=${offset}` : AIRTABLE_URL
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    })
    const data = await response.json()
    lessons.push(...(data.records || []))
    offset = data.offset
  } while (offset)
  
  return lessons
}

// Crear lecciones en lotes
async function createLessons(lessons) {
  const batchSize = 10
  let created = 0
  
  for (let i = 0; i < lessons.length; i += batchSize) {
    const batch = lessons.slice(i, i + batchSize)
    
    const response = await fetch(AIRTABLE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: batch.map(lesson => ({
          fields: {
            levelId: lesson.levelId,
            moduleName: lesson.moduleName,
            title: lesson.title,
            type: lesson.type,
            duration: cleanDuration(lesson.duration),
            order: parseInt(lesson.order) || 0,
            videoUrl: lesson.videoUrl || '',
            content: lesson.content || '',
            locked: lesson.locked === 'true',
            programId: lesson.programId || 'robotica'
          }
        }))
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`Error en lote ${i/batchSize + 1}:`, error)
    } else {
      created += batch.length
      console.log(`✓ Creadas ${created}/${lessons.length} lecciones`)
    }
    
    // Esperar para no exceder límite de API
    await new Promise(r => setTimeout(r, 250))
  }
  
  return created
}

async function main() {
  console.log('=== RESTAURAR LECCIONES ORIGINALES ===\n')
  
  // Leer CSV
  const csvPath = path.join(__dirname, '..', 'airtable', 'lessons_robotica_completo.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf8')
  const csvLessons = parseCSV(csvContent)
  console.log(`📄 Lecciones en CSV: ${csvLessons.length}`)
  
  // Obtener existentes
  console.log('\n🔍 Obteniendo lecciones existentes en Airtable...')
  const existing = await getExistingLessons()
  console.log(`📊 Lecciones en Airtable: ${existing.length}`)
  
  // Crear mapa de existentes por levelId + title
  const existingMap = new Set()
  existing.forEach(r => {
    const key = `${r.fields.levelId}|${r.fields.title}|${r.fields.programId || 'robotica'}`
    existingMap.add(key)
  })
  
  // Filtrar lecciones nuevas
  const newLessons = csvLessons.filter(l => {
    const key = `${l.levelId}|${l.title}|${l.programId || 'robotica'}`
    return !existingMap.has(key)
  })
  
  console.log(`\n🆕 Lecciones nuevas a crear: ${newLessons.length}`)
  
  if (newLessons.length === 0) {
    console.log('\n✅ No hay lecciones nuevas que crear')
    return
  }
  
  // Mostrar resumen por nivel
  const byLevel = {}
  newLessons.forEach(l => {
    byLevel[l.levelId] = (byLevel[l.levelId] || 0) + 1
  })
  console.log('\nPor nivel:')
  Object.entries(byLevel).sort().forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`)
  })
  
  // Crear lecciones
  console.log('\n📤 Creando lecciones...\n')
  const created = await createLessons(newLessons)
  
  console.log(`\n✅ Proceso completado: ${created} lecciones creadas`)
}

main().catch(console.error)
