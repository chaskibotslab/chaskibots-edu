/**
 * Script de migración: Airtable → Supabase
 * 
 * Lee los CSVs de la carpeta /airtable y los inserta en Supabase
 * 
 * Uso:
 *   node scripts/migrate-airtable-to-supabase.js [tabla]
 *   node scripts/migrate-airtable-to-supabase.js lessons
 *   node scripts/migrate-airtable-to-supabase.js all
 * 
 * Requiere variables en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
try {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([A-Z0-9_]+)=(.+)$/)
    if (match) process.env[match[1]] = match[2].trim().replace(/\r$/, '')
  })
} catch (e) {
  console.warn('⚠️ No se pudo cargar .env.local')
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan variables: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// ============================================================
// Parser CSV simple (maneja comillas y comas dentro de campos)
// ============================================================
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }

  const parseLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  }

  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map(line => {
    const values = parseLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i] || '' })
    return obj
  })

  return { headers, rows }
}

// ============================================================
// Insertar registros en Supabase via REST API
// ============================================================
async function insertBatch(table, records) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal,resolution=merge-duplicates',
    },
    body: JSON.stringify(records),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }
}

// ============================================================
// Mappers: convierte filas CSV (Airtable) → schema Supabase
// ============================================================
const mappers = {
  programs: (row) => ({
    id: row.id,
    name: row.name,
    description: row.description || null,
    level_id: row.levelId || null,
    level_name: row.levelName || null,
    type: row.type || null,
    duration: row.duration || null,
    price: row.price ? parseFloat(row.price) : null,
    is_active: row.isActive === 'true' || row.isActive === '1',
  }),

  levels: (row) => ({
    id: row.id,
    name: row.name,
    full_name: row.fullName || null,
    category: row.category || null,
    age_range: row.ageRange || null,
    grade_number: row.gradeNumber ? parseInt(row.gradeNumber) : null,
    kit_price: row.kitPrice ? parseFloat(row.kitPrice) : null,
    has_hacking: row.hasHacking === 'true',
    has_advanced_ia: row.hasAdvancedIA === 'true',
    color: row.color || null,
    neon_color: row.neonColor || null,
    icon: row.icon || null,
  }),

  schools: (row) => ({
    id: row.id || row.code,
    name: row.name,
    code: row.code || null,
    address: row.address || null,
    city: row.city || null,
    country: row.country || null,
    phone: row.phone || null,
    email: row.email || null,
    max_students: row.maxStudents ? parseInt(row.maxStudents) : null,
    max_teachers: row.maxTeachers ? parseInt(row.maxTeachers) : null,
  }),

  lessons: (row) => ({
    level_id: row.levelId,
    program_id: row.programId || 'robotica',
    module_name: row.moduleName || null,
    title: row.title,
    type: ['video', 'activity', 'tutorial', 'project'].includes(row.type) ? row.type : 'video',
    duration: row.duration || '10 min',
    display_order: row.order ? parseInt(row.order) : 0,
    video_url: row.videoUrl || null,
    pdf_url: row.pdfUrl || null,
    content: row.content || null,
    locked: row.locked === 'true',
  }),

  modules: (row) => ({
    id: row.id || `${row.levelId}-${(row.title || '').toLowerCase().replace(/\s+/g, '-')}`,
    level_id: row.levelId,
    title: row.title,
    description: row.description || null,
    display_order: row.order ? parseInt(row.order) : 0,
  }),

  students: (row) => ({
    name: row.name,
    level_id: row.levelId || null,
    course_id: row.courseId || null,
    school_id: row.schoolId || null,
    email: row.email || null,
    access_code: row.accessCode || null,
  }),

  tasks: (row) => ({
    level_id: row.levelId,
    title: row.title,
    description: row.description || null,
    type: row.type || null,
    category: row.category || null,
    difficulty: row.difficulty || null,
    points: row.points ? parseInt(row.points) : 10,
    is_active: row.isActive !== 'false',
    questions: row.questions ? safeJSON(row.questions) : null,
  }),

  projects: (row) => ({
    level_id: row.levelId,
    project_name: row.projectName,
    category: row.category || null,
    description: row.description || null,
    hardware: row.hardware || null,
    difficulty: row.difficulty || null,
    duration: row.duration || null,
    video_url: row.videoUrl || null,
    tutorial_url: row.tutorialUrl || null,
    resources: row.resources || null,
  }),

  simulators: (row) => ({
    id: row.id,
    name: row.name,
    description: row.description || null,
    icon: row.icon || null,
    url: row.url || null,
    levels: row.levels ? row.levels.split(',').map(s => s.trim()) : [],
    enabled: row.enabled !== 'false',
  }),

  kits: (row) => ({
    id: row.id,
    level_id: row.levelId,
    name: row.name,
    description: row.description || null,
    components: row.components || null,
    skills: row.skills || null,
    images: row.images || null,
    video_url: row.videoUrl || null,
    tutorial_url: row.tutorialUrl || null,
  }),

  experiencias: (row) => ({
    titulo: row.titulo,
    descripcion: row.descripcion || null,
    tipo: row.tipo || null,
    url: row.url || null,
    institucion: row.institucion || null,
    orden: row.orden ? parseInt(row.orden) : 0,
    activo: row.activo !== 'false',
  }),

  ai_activities: (row) => ({
    level_id: row.levelId,
    activity_name: row.activityName,
    activity_type: row.activityType || null,
    description: row.description || null,
    difficulty: row.difficulty || null,
    icon: row.icon || null,
    enabled: row.enabled !== 'false',
  }),

  year_plans: (row) => ({
    level_id: row.levelId,
    month: row.month || null,
    topic: row.topic || null,
    project: row.project || null,
    display_order: row.order ? parseInt(row.order) : 0,
  }),
}

function safeJSON(str) {
  try { return JSON.parse(str) } catch { return null }
}

// ============================================================
// Configuración: archivos CSV → tablas
// ============================================================
const migrations = [
  // Orden importa por foreign keys
  { csv: 'levels.csv', table: 'levels' },
  { csv: 'programs.csv', table: 'programs' },
  { csv: 'schools.csv', table: 'schools' },
  { csv: 'modules.csv', table: 'modules' },
  { csv: 'simulators.csv', table: 'simulators' },
  { csv: 'kits.csv', table: 'kits' },
  { csv: 'lessons_todos_programas_v2.csv', table: 'lessons' }, // CSV principal
  { csv: 'students.csv', table: 'students' },
  { csv: 'tasks.csv', table: 'tasks' },
  { csv: 'projects.csv', table: 'projects' },
  { csv: 'experiencias.csv', table: 'experiencias' },
  { csv: 'ai_activities.csv', table: 'ai_activities' },
  { csv: 'year_plans.csv', table: 'year_plans' },
]

// ============================================================
// Migración principal
// ============================================================
async function migrateTable(csvFile, tableName) {
  const csvPath = path.join('airtable', csvFile)
  
  if (!fs.existsSync(csvPath)) {
    console.log(`   ⚠️ ${csvFile} no encontrado, saltando`)
    return { success: 0, errors: 0 }
  }

  const content = fs.readFileSync(csvPath, 'utf8')
  const { rows } = parseCSV(content)
  
  if (rows.length === 0) {
    console.log(`   ⚠️ ${csvFile} vacío`)
    return { success: 0, errors: 0 }
  }

  const mapper = mappers[tableName]
  if (!mapper) {
    console.log(`   ⚠️ No hay mapper para ${tableName}`)
    return { success: 0, errors: 0 }
  }

  const records = rows.map(mapper).filter(r => r && Object.keys(r).length > 0)
  console.log(`   📊 ${records.length} registros a insertar`)

  // Insertar en batches de 100
  const BATCH_SIZE = 100
  let success = 0
  let errors = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    try {
      await insertBatch(tableName, batch)
      success += batch.length
      process.stdout.write(`\r   ✅ ${success}/${records.length}`)
    } catch (err) {
      errors += batch.length
      console.error(`\n   ❌ Error batch ${i}: ${err.message.slice(0, 200)}`)
    }
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\n   ✅ ${success} insertados, ${errors} errores`)
  return { success, errors }
}

async function main() {
  const target = process.argv[2] || 'all'
  console.log(`🚀 Migración Airtable → Supabase`)
  console.log(`📍 ${SUPABASE_URL}\n`)

  const toRun = target === 'all' 
    ? migrations 
    : migrations.filter(m => m.table === target)

  if (toRun.length === 0) {
    console.error(`❌ Tabla no encontrada: ${target}`)
    console.log(`   Disponibles: ${migrations.map(m => m.table).join(', ')}`)
    process.exit(1)
  }

  for (const m of toRun) {
    console.log(`\n📦 ${m.table} (${m.csv})`)
    await migrateTable(m.csv, m.table)
  }

  console.log('\n✅ Migración completa')
}

main().catch(err => {
  console.error('💥 Error fatal:', err)
  process.exit(1)
})
