/**
 * Migra users + courses_catalog desde Airtable a Supabase
 * Ejecutar DESPUÉS de aplicar schema_users_fix.sql
 *
 * Uso: node scripts/migrate-users-from-airtable.js
 */

const fs = require('fs')
const path = require('path')

const env = {}
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split(/\r?\n/)
  .forEach(line => {
    const m = line.match(/^([A-Z0-9_]+)=(.+)$/)
    if (m) env[m[1]] = m[2].trim()
  })

const SB = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const SK = env.SUPABASE_SERVICE_ROLE_KEY
const ATKEY = env.AIRTABLE_API_KEY
const ATBASE = env.AIRTABLE_BASE_ID

function normalizeRole(input) {
  const raw = String(input || '').trim().toLowerCase()
  if (!raw) return 'student'
  if (raw.includes('admin') || raw.includes('administr')) return 'admin'
  if (raw.includes('teacher') || raw.includes('prof') || raw.includes('docente')) return 'teacher'
  return 'student'
}

async function fetchAllAirtable(table) {
  const all = []
  let offset
  do {
    const url = new URL(`https://api.airtable.com/v0/${ATBASE}/${table}`)
    if (offset) url.searchParams.append('offset', offset)
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + ATKEY } })
    if (!r.ok) throw new Error(`Airtable ${table} err: ${r.status}`)
    const d = await r.json()
    all.push(...d.records)
    offset = d.offset
  } while (offset)
  return all
}

async function migrateUsers() {
  console.log('\n📦 Migrando users...')
  const records = await fetchAllAirtable('users')
  console.log(`   📊 ${records.length} usuarios en Airtable`)

  // Convertir a formato Supabase, deduplicar por email y access_code
  const seenEmail = new Set()
  const seenAccessCode = new Set()
  const rows = []
  for (const r of records) {
    const f = r.fields
    const email = (f.email || '').trim() || null
    const accessCode = (f.accessCode || '').trim() || null
    if (email && seenEmail.has(email)) continue
    if (accessCode && seenAccessCode.has(accessCode)) continue
    if (email) seenEmail.add(email)
    if (accessCode) seenAccessCode.add(accessCode)

    rows.push({
      access_code: accessCode,
      email,
      password: (f.password || accessCode || '').toString(),
      name: (f.name || 'Usuario').toString(),
      level_id: (f.levelId || '').toString() || null,
      role: normalizeRole(f.role),
      course_id: (f.courseId || '').toString() || null,
      course_name: (f.courseName || '').toString() || null,
      school_id: (f.schoolId || '').toString() || null,
      school_name: (f.schoolName || '').toString() || null,
      program_id: (f.programId || '').toString() || null,
      program_name: (f.programName || '').toString() || null,
      progress: Number(f.progress) || 0,
      is_active: f.isActive !== false,
      last_login: f.lastLogin || null,
      expires_at: f.expiresAt || null,
    })
  }

  console.log(`   📊 ${rows.length} únicos a insertar`)

  // Insert en batches de 100, ignorando duplicados en Supabase por access_code
  let inserted = 0, errors = 0
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    const r = await fetch(SB + '/rest/v1/users?on_conflict=access_code', {
      method: 'POST',
      headers: {
        apikey: SK,
        Authorization: 'Bearer ' + SK,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    })
    if (!r.ok) {
      const t = await r.text()
      console.error(`   ❌ Batch ${i}: ${t.substring(0, 200)}`)
      errors += batch.length
    } else {
      // Prefer return=minimal no devuelve filas; contamos el batch como exitoso
      inserted += batch.length
      process.stdout.write(`   ✅ ${inserted}/${rows.length}\r`)
    }
  }
  console.log(`\n   ✅ ${inserted} procesados, ${errors} errores`)
}

async function migrateCourses() {
  console.log('\n📦 Migrando courses_catalog...')
  let records
  try {
    records = await fetchAllAirtable('courses_catalog')
  } catch (e) {
    console.log('   ⚠️ Tabla no existe en Airtable, omitiendo')
    return
  }
  console.log(`   📊 ${records.length} cursos en Airtable`)

  const levelIdMap = {
    '1--bg': 'primero-bach',
  }
  const rows = records.map(r => {
    const f = r.fields
    const levelId = (f.levelId || '').toString()
    return {
      id: f.id || r.id,
      name: (f.name || '').toString(),
      description: f.description || null,
      level_id: levelIdMap[levelId] || levelId || null,
      teacher_id: f.teacherId || null,
      teacher_name: f.teacherName || null,
      school_id: f.schoolId || null,
      school_name: f.schoolName || null,
      max_students: Number(f.maxStudents) || 30,
      current_students: Number(f.currentStudents) || 0,
      is_active: f.isActive !== false,
    }
  })

  let inserted = 0, errors = 0
  for (const row of rows) {
    const r = await fetch(SB + '/rest/v1/courses_catalog', {
      method: 'POST',
      headers: {
        apikey: SK,
        Authorization: 'Bearer ' + SK,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
    })
    if (!r.ok) {
      const t = await r.text()
      console.error(`   ❌ Curso ${row.id}: ${t.substring(0, 120)}`)
      errors++
    } else {
      inserted++
      process.stdout.write(`   ✅ ${inserted}/${rows.length}\r`)
    }
  }
  console.log(`\n   ✅ ${inserted} insertados, ${errors} errores`)
}

(async () => {
  console.log('🚀 Migración Users/Courses Airtable → Supabase')
  console.log('📍', SB)
  await migrateUsers()
  await migrateCourses()
  console.log('\n✅ Listo')
})().catch(e => { console.error(e); process.exit(1) })
