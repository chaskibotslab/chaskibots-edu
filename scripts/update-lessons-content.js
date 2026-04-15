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

// Parsear CSV con soporte para campos con comillas y comas
function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim())
  const headers = parseCSVLine(lines[0])
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i] || ''
    })
    return obj
  })
}

function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
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
  return values
}

// Obtener todas las lecciones existentes de Airtable
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

// Actualizar lecciones en lotes
async function updateLessons(updates) {
  const batchSize = 10
  let updated = 0
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    
    const response = await fetch(AIRTABLE_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records: batch })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`Error en lote ${Math.floor(i/batchSize) + 1}:`, error)
    } else {
      updated += batch.length
      console.log(`✓ Actualizadas ${updated}/${updates.length} lecciones`)
    }
    
    // Esperar para no exceder límite de API
    await new Promise(r => setTimeout(r, 250))
  }
  
  return updated
}

async function main() {
  console.log('=== ACTUALIZAR CONTENIDO DE LECCIONES ===\n')
  
  // Leer CSV con contenido completo
  const csvPath = path.join(__dirname, '..', 'airtable', 'lessons_dinamico_completo.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf8')
  const csvLessons = parseCSV(csvContent)
  console.log(`📄 Lecciones en CSV con contenido: ${csvLessons.length}`)
  
  // Filtrar solo las que tienen videoUrl o content
  const lessonsWithContent = csvLessons.filter(l => l.videoUrl || l.content)
  console.log(`🎬 Lecciones con video/contenido: ${lessonsWithContent.length}`)
  
  // Obtener lecciones existentes de Airtable
  console.log('\n🔍 Obteniendo lecciones de Airtable...')
  const existing = await getExistingLessons()
  console.log(`📊 Lecciones en Airtable: ${existing.length}`)
  
  // Crear mapa de lecciones existentes por levelId + title + programId
  const existingMap = new Map()
  existing.forEach(r => {
    const key = `${r.fields.levelId}|${r.fields.title}|${r.fields.programId || 'robotica'}`
    existingMap.set(key, r)
  })
  
  // Preparar actualizaciones
  const updates = []
  
  for (const csvLesson of lessonsWithContent) {
    const key = `${csvLesson.levelId}|${csvLesson.title}|${csvLesson.programId || 'robotica'}`
    const existingRecord = existingMap.get(key)
    
    if (existingRecord) {
      const fieldsToUpdate = {}
      
      // Solo actualizar si el campo está vacío en Airtable pero tiene valor en CSV
      if (csvLesson.videoUrl && !existingRecord.fields.videoUrl) {
        fieldsToUpdate.videoUrl = csvLesson.videoUrl
      }
      if (csvLesson.content && (!existingRecord.fields.content || existingRecord.fields.content.length < csvLesson.content.length)) {
        fieldsToUpdate.content = csvLesson.content
      }
      
      if (Object.keys(fieldsToUpdate).length > 0) {
        updates.push({
          id: existingRecord.id,
          fields: fieldsToUpdate
        })
      }
    }
  }
  
  console.log(`\n🔄 Lecciones a actualizar: ${updates.length}`)
  
  if (updates.length === 0) {
    console.log('\n✅ No hay lecciones que actualizar')
    return
  }
  
  // Mostrar algunas actualizaciones de ejemplo
  console.log('\nEjemplos de actualizaciones:')
  updates.slice(0, 3).forEach(u => {
    console.log(`  - ID: ${u.id}`)
    console.log(`    Campos: ${Object.keys(u.fields).join(', ')}`)
  })
  
  // Ejecutar actualizaciones
  console.log('\n📤 Actualizando lecciones...\n')
  const updated = await updateLessons(updates)
  
  console.log(`\n✅ Proceso completado: ${updated} lecciones actualizadas`)
}

main().catch(console.error)
