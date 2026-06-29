/**
 * Verifica usuarios en Supabase (admins, teachers, students).
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

async function main() {
  console.log('Verificacion de usuarios en Supabase')
  console.log('Proyecto:', SUPABASE_URL)
  console.log('='.repeat(80))

  const { data: users, error } = await supabase.from('users').select('*').order('role')
  if (error) { console.log('ERROR:', error.message); return }

  console.log(`\nTotal usuarios: ${users.length}\n`)

  const byRole = {}
  for (const u of users) {
    const role = u.role || 'sin-rol'
    if (!byRole[role]) byRole[role] = []
    byRole[role].push(u)
  }

  for (const [role, list] of Object.entries(byRole)) {
    console.log(`\n=== ${role.toUpperCase()} (${list.length}) ===`)
    for (const u of list) {
      const hasPwd = !!(u.password || u.password_hash)
      const code = u.access_code || '-'
      const active = u.is_active !== false ? 'ACTIVO' : 'INACTIVO'
      const pwdInfo = u.password ? `pwd:${u.password === u.access_code ? '=code' : 'CUSTOM'}` : (u.password_hash ? 'hash' : 'NO')
      console.log(`  ${(u.email || u.name).padEnd(40)} | code: ${code.padEnd(20)} | ${pwdInfo.padEnd(12)} | ${active}`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('Estudiantes en tabla students:')
  const { data: students } = await supabase.from('students').select('id, name, email, access_code, level_id').limit(20)
  console.log(`Total: ${students?.length || 0}`)
  for (const s of (students || []).slice(0, 10)) {
    console.log(`  ${(s.name || '').padEnd(30)} | ${(s.email || '-').padEnd(30)} | code:${s.access_code || '-'}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
