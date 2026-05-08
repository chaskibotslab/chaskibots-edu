// ============================================
// SCRIPT: Agregar lecciones a niveles SLM
// Copia lecciones de niveles EGB equivalentes a niveles SLM
// ============================================

require('dotenv').config({ path: '.env.local' })

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Faltan variables de entorno AIRTABLE_API_KEY o AIRTABLE_BASE_ID')
  process.exit(1)
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`

// Mapeo de niveles SLM a niveles EGB equivalentes
const SLM_TO_EGB_MAP = {
  'septimo-slm': 'septimo-egb',
  'octavo-slm': 'octavo-egb',
  'noveno-slm': 'noveno-egb',
  'decimo-slm': 'decimo-egb',
  'primero-slm-bgu': 'primero-bach',
  'segundo-slm-bgu': 'segundo-bach',
  'tercero-slm-bgu': 'tercero-bach'
}

async function fetchLessons(levelId) {
  const url = `${AIRTABLE_URL}?filterByFormula={levelId}="${levelId}"&sort[0][field]=order&sort[0][direction]=asc`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error fetching lessons: ${error}`)
  }
  
  const data = await response.json()
  return data.records || []
}

async function createLesson(fields) {
  const response = await fetch(AIRTABLE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      records: [{ fields }]
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error creating lesson: ${error}`)
  }
  
  return await response.json()
}

async function copyLessonsToSLM(slmLevelId, egbLevelId) {
  console.log(`\n📚 Copiando lecciones de ${egbLevelId} a ${slmLevelId}...`)
  
  // Verificar si ya existen lecciones para el nivel SLM
  const existingLessons = await fetchLessons(slmLevelId)
  if (existingLessons.length > 0) {
    console.log(`   ⚠️ ${slmLevelId} ya tiene ${existingLessons.length} lecciones. Saltando...`)
    return 0
  }
  
  // Obtener lecciones del nivel EGB equivalente
  const sourceLessons = await fetchLessons(egbLevelId)
  if (sourceLessons.length === 0) {
    console.log(`   ⚠️ ${egbLevelId} no tiene lecciones. Saltando...`)
    return 0
  }
  
  console.log(`   📖 Encontradas ${sourceLessons.length} lecciones en ${egbLevelId}`)
  
  let created = 0
  for (const lesson of sourceLessons) {
    const fields = lesson.fields
    
    // Crear nueva lección con levelId actualizado
    const newFields = {
      title: fields.title || fields.Name,
      levelId: slmLevelId,
      moduleId: fields.moduleId,
      moduleName: fields.moduleName,
      programId: fields.programId || 'robotica',
      type: fields.type || 'video',
      duration: fields.duration || '10 min',
      order: fields.order || 1,
      videoUrl: fields.videoUrl || '',
      content: fields.content || '',
      locked: false
    }
    
    // Solo incluir campos con valores válidos
    if (fields.images) newFields.images = fields.images
    if (fields.videos) newFields.videos = fields.videos
    if (fields.pdfUrl) newFields.pdfUrl = fields.pdfUrl
    
    try {
      await createLesson(newFields)
      created++
      process.stdout.write(`   ✅ ${created}/${sourceLessons.length}\r`)
      
      // Pequeña pausa para evitar rate limits
      await new Promise(r => setTimeout(r, 250))
    } catch (error) {
      console.error(`   ❌ Error creando lección "${newFields.title}":`, error.message)
    }
  }
  
  console.log(`   ✅ Creadas ${created} lecciones para ${slmLevelId}`)
  return created
}

async function main() {
  console.log('🚀 Iniciando copia de lecciones a niveles SLM...\n')
  console.log('Mapeo de niveles:')
  for (const [slm, egb] of Object.entries(SLM_TO_EGB_MAP)) {
    console.log(`   ${slm} ← ${egb}`)
  }
  
  let totalCreated = 0
  
  for (const [slmLevel, egbLevel] of Object.entries(SLM_TO_EGB_MAP)) {
    try {
      const created = await copyLessonsToSLM(slmLevel, egbLevel)
      totalCreated += created
    } catch (error) {
      console.error(`❌ Error procesando ${slmLevel}:`, error.message)
    }
  }
  
  console.log(`\n✅ Proceso completado. Total de lecciones creadas: ${totalCreated}`)
}

main().catch(console.error)
