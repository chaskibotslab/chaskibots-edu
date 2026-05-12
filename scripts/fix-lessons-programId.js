// Script para verificar y arreglar lecciones sin programId en Airtable
// Ejecutar con: node scripts/fix-lessons-programId.js

const fs = require('fs')
const path = require('path')

// Cargar variables de entorno manualmente
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim()
  }
})

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Faltan variables de entorno AIRTABLE_API_KEY o AIRTABLE_BASE_ID')
  process.exit(1)
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`

async function fetchAllLessons() {
  const allRecords = []
  let offset = null
  
  do {
    const url = offset 
      ? `${AIRTABLE_URL}?offset=${offset}`
      : AIRTABLE_URL
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    
    const data = await response.json()
    allRecords.push(...data.records)
    offset = data.offset
  } while (offset)
  
  return allRecords
}

async function updateLesson(recordId, programId) {
  const response = await fetch(AIRTABLE_URL, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      records: [{
        id: recordId,
        fields: { programId }
      }]
    })
  })
  
  return response.ok
}

async function main() {
  console.log('🔍 Obteniendo todas las lecciones de Airtable...')
  
  const lessons = await fetchAllLessons()
  console.log(`📊 Total de lecciones: ${lessons.length}`)
  
  // Agrupar por programId
  const byProgram = {}
  const withoutProgram = []
  const duplicates = new Map() // levelId + title -> records
  
  for (const record of lessons) {
    const { levelId, title, programId, moduleName } = record.fields
    const key = `${levelId}|${title}`
    
    if (!duplicates.has(key)) {
      duplicates.set(key, [])
    }
    duplicates.set(key, [...duplicates.get(key), { id: record.id, programId, moduleName }])
    
    if (!programId) {
      withoutProgram.push({
        id: record.id,
        levelId,
        title,
        moduleName
      })
    } else {
      if (!byProgram[programId]) byProgram[programId] = []
      byProgram[programId].push({ levelId, title })
    }
  }
  
  console.log('\n📈 Distribución por programa:')
  for (const [prog, items] of Object.entries(byProgram)) {
    console.log(`  ${prog}: ${items.length} lecciones`)
  }
  
  console.log(`\n⚠️ Lecciones SIN programId: ${withoutProgram.length}`)
  if (withoutProgram.length > 0) {
    console.log('Primeras 10:')
    withoutProgram.slice(0, 10).forEach(l => {
      console.log(`  - [${l.levelId}] ${l.title}`)
    })
  }
  
  // Buscar duplicados
  const realDuplicates = []
  for (const [key, records] of duplicates.entries()) {
    if (records.length > 1) {
      realDuplicates.push({ key, records })
    }
  }
  
  console.log(`\n🔄 Lecciones DUPLICADAS (mismo levelId + title): ${realDuplicates.length}`)
  if (realDuplicates.length > 0) {
    console.log('Primeros 10:')
    realDuplicates.slice(0, 10).forEach(d => {
      console.log(`  - ${d.key}`)
      d.records.forEach(r => console.log(`      ID: ${r.id}, programId: ${r.programId || 'NINGUNO'}`))
    })
  }
  
  // Preguntar si quiere arreglar
  if (withoutProgram.length > 0) {
    console.log('\n💡 Para arreglar lecciones sin programId, ejecuta:')
    console.log('   node scripts/fix-lessons-programId.js --fix')
  }
  
  if (process.argv.includes('--fix') && withoutProgram.length > 0) {
    console.log('\n🔧 Arreglando lecciones sin programId...')
    console.log('   Asignando programId="robotica" por defecto')
    
    let fixed = 0
    for (const lesson of withoutProgram) {
      const success = await updateLesson(lesson.id, 'robotica')
      if (success) {
        fixed++
        process.stdout.write(`\r   Arregladas: ${fixed}/${withoutProgram.length}`)
      }
      // Rate limiting
      await new Promise(r => setTimeout(r, 200))
    }
    console.log(`\n✅ Arregladas ${fixed} lecciones`)
  }
  
  if (process.argv.includes('--delete-duplicates') && realDuplicates.length > 0) {
    console.log('\n🗑️ Eliminando duplicados (manteniendo el primero)...')
    let deleted = 0
    
    for (const dup of realDuplicates) {
      // Mantener el primero, eliminar los demás
      const toDelete = dup.records.slice(1)
      for (const record of toDelete) {
        const response = await fetch(`${AIRTABLE_URL}/${record.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        })
        if (response.ok) {
          deleted++
          process.stdout.write(`\r   Eliminados: ${deleted}`)
        }
        await new Promise(r => setTimeout(r, 200))
      }
    }
    console.log(`\n✅ Eliminados ${deleted} duplicados`)
  }
}

main().catch(console.error)
