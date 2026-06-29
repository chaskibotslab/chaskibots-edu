/**
 * Aplica la migration 2026_courses_catalog.sql
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
  console.log('Aplicando migration 2026_courses_catalog.sql...')
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '2026_courses_catalog.sql'), 'utf8')

  // Probar con RPC exec_sql si existe, o usar PostgREST schema directo
  // Como Supabase JS no permite SQL directo, usamos fetch al endpoint de SQL via service role
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql_query: sql })
  })

  if (!res.ok) {
    console.log('No existe rpc exec_sql. Aplica manualmente en Supabase SQL Editor.')
    console.log('Archivo:', path.join(__dirname, '..', 'supabase', 'migrations', '2026_courses_catalog.sql'))
    console.log('\nVerificando si las tablas ya existen...')
    const { error: e1 } = await supabase.from('courses').select('id').limit(1)
    const { error: e2 } = await supabase.from('school_courses').select('id').limit(1)
    console.log('  courses:', e1 ? 'NO EXISTE - ' + e1.message : 'EXISTE')
    console.log('  school_courses:', e2 ? 'NO EXISTE - ' + e2.message : 'EXISTE')
    return
  }

  console.log('Migration aplicada con éxito')
}

main().catch(e => { console.error(e); process.exit(1) })
