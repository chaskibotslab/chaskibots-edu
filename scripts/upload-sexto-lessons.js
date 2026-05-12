// Script para cargar lecciones de sexto grado a Airtable
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
let AIRTABLE_API_KEY = ''
let AIRTABLE_BASE_ID = ''

try {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  envContent.split('\n').forEach(line => {
    if (line.startsWith('AIRTABLE_API_KEY=')) AIRTABLE_API_KEY = line.split('=')[1].trim()
    if (line.startsWith('AIRTABLE_BASE_ID=')) AIRTABLE_BASE_ID = line.split('=')[1].trim()
  })
} catch (e) {
  console.error('Error leyendo .env.local:', e.message)
  process.exit(1)
}

const CSV_PATH = path.join(__dirname, '..', 'airtable', 'lessons_sexto_robotica.csv')

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim())
  const headers = lines[0].split(',')
  const records = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = []
    let current = ''
    let inQuotes = false
    
    for (const char of lines[i]) {
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
    
    const record = {}
    headers.forEach((header, idx) => {
      // Ignorar campo simulatorId que no existe en Airtable
      if (header === 'simulatorId') return
      
      const value = values[idx] || ''
      // Convertir booleanos
      if (value === 'true') record[header] = true
      else if (value === 'false') record[header] = false
      // Convertir números
      else if (header === 'order' && value) record[header] = parseInt(value)
      else record[header] = value
    })
    records.push(record)
  }
  
  return records
}

async function createLesson(lesson) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: lesson
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(JSON.stringify(error))
  }
  
  return await response.json()
}

async function main() {
  console.log('📚 Cargando lecciones de Sexto Grado a Airtable')
  console.log('─'.repeat(50))
  
  // Leer CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8')
  const lessons = parseCSV(csvContent)
  
  console.log(`📄 Total lecciones: ${lessons.length}`)
  console.log(`📍 Nivel: sexto-egb`)
  console.log(`🤖 Programa: robotica\n`)
  
  let created = 0
  let errors = 0
  
  for (const lesson of lessons) {
    process.stdout.write(`\r📝 Creando ${created + 1}/${lessons.length}: ${lesson.title.substring(0, 40)}...`)
    
    try {
      await createLesson(lesson)
      created++
    } catch (err) {
      console.error(`\n❌ Error en "${lesson.title}":`, err.message)
      errors++
    }
    
    // Pequeña pausa para no exceder límites de API
    await new Promise(r => setTimeout(r, 200))
  }
  
  console.log(`\n\n✅ Completado: ${created} lecciones creadas`)
  if (errors > 0) console.log(`⚠️ Errores: ${errors}`)
}

main().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
