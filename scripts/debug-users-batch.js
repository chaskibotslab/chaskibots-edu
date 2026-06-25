const fs = require('fs')
const path = require('path')

const env = {}
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split(/\r?\n/)
  .forEach(line => {
    const m = line.match(/^([A-Z0-9_]+)=(.+)$/)
    if (m) env[m[1]] = m[2].trim()
  })

const SB = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/(rest\/v1)?\/?$/, '').replace(/\/+$/, '')
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

async function main() {
  const r = await fetch('https://api.airtable.com/v0/' + ATBASE + '/users', { headers: { Authorization: 'Bearer ' + ATKEY } })
  const d = await r.json()
  const seen = new Set()
  const rows = []
  for (const rec of d.records) {
    const f = rec.fields
    const email = (f.email || '').trim() || null
    const accessCode = (f.accessCode || '').trim() || null
    const key = email || accessCode || rec.id
    if (seen.has(key)) continue
    seen.add(key)
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
  console.log('Total rows:', rows.length)
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    const rr = await fetch(SB + '/rest/v1/users', {
      method: 'POST',
      headers: { apikey: SK, Authorization: 'Bearer ' + SK, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify(batch),
    })
    if (!rr.ok) {
      console.log('Batch', i, 'status', rr.status)
      console.log('Error:', await rr.text())
      console.log('Batch keys:', batch.map(u => u.access_code || u.email))
    } else {
      console.log('Batch', i, 'OK')
    }
  }
}
main().catch(e => { console.error(e); process.exit(1) })
