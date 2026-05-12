// Script para eliminar las lecciones de sexto que subí incorrectamente
const fs = require('fs')

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

async function fetchLessons() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?filterByFormula=AND({levelId}="sexto-egb",{programId}="robotica")&maxRecords=100`
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  })
  
  return (await response.json()).records || []
}

async function deleteLesson(id) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons/${id}`
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  })
  
  return response.ok
}

async function main() {
  console.log('🗑️ Buscando lecciones de sexto-egb robotica para eliminar...')
  
  const lessons = await fetchLessons()
  console.log(`📄 Encontradas: ${lessons.length} lecciones`)
  
  // Filtrar solo las que tienen moduleName (las que yo subí)
  const toDelete = lessons.filter(l => l.fields.moduleName && l.fields.moduleName.includes('Módulo'))
  
  console.log(`🎯 A eliminar: ${toDelete.length} lecciones (las que subí con el script)`)
  
  if (toDelete.length === 0) {
    console.log('✅ No hay lecciones para eliminar')
    return
  }
  
  let deleted = 0
  for (const lesson of toDelete) {
    process.stdout.write(`\r🗑️ Eliminando ${deleted + 1}/${toDelete.length}...`)
    
    if (await deleteLesson(lesson.id)) {
      deleted++
    }
    
    await new Promise(r => setTimeout(r, 200))
  }
  
  console.log(`\n✅ Eliminadas: ${deleted} lecciones`)
}

main().catch(console.error)
