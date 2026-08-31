/**
 * Aplica la migration 2026_courses_catalog.sql a Supabase
 * Intenta usar la función exec_sql (si existe) o el endpoint pg de Supabase
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const env = {}
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split(/\r?\n/).forEach(line => {
    const m = line.match(/^([A-Z0-9_]+)=(.+)$/)
    if (m) env[m[1]] = m[2].trim().replace(/\r$/, '')
  })

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

async function checkTable(name) {
  const { error } = await supabase.from(name).select('id').limit(1)
  return !error
}

async function main() {
  console.log('=== Verificación de tablas en Supabase ===\n')

  // Check all important tables
  const tables = [
    'users', 'levels', 'programs', 'schools', 'lessons', 'tasks',
    'courses', 'school_courses', 'teacher_courses',
    'submissions', 'simulators', 'virtual_files',
  ]

  const missing = []
  for (const t of tables) {
    const exists = await checkTable(t)
    const status = exists ? 'OK' : 'FALTA'
    console.log(`  ${status.padEnd(6)} ${t}`)
    if (!exists) missing.push(t)
  }

  if (missing.length === 0) {
    console.log('\n✓ Todas las tablas existen.')
    return
  }

  console.log(`\n✗ Faltan ${missing.length} tabla(s): ${missing.join(', ')}`)
  console.log('\n*** ACCIÓN REQUERIDA ***')
  console.log('Ejecuta estos archivos SQL en el SQL Editor de Supabase Dashboard:')
  console.log('  https://supabase.com/dashboard/project/jfsyvcslzgjrvsoqleiz/sql/new\n')

  if (missing.includes('courses') || missing.includes('school_courses')) {
    console.log('  1. supabase/migrations/2026_courses_catalog.sql')
  }
  if (missing.includes('teacher_courses')) {
    console.log('  2. supabase/schema.sql (sección teacher_courses)')
  }

  console.log('\nSQL para courses:')
  console.log('─'.repeat(60))
  const sqlFile = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '2026_courses_catalog.sql'), 'utf8')
  console.log(sqlFile)
}

main().catch(e => { console.error(e); process.exit(1) })
