/**
 * Lista los archivos en drive-migrated/ y los kits sin imagen.
 * Permite identificar si se pueden asociar manualmente.
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
  console.log('Archivos en bucket lesson-images/drive-migrated/:')
  const { data: items } = await supabase.storage.from('lesson-images').list('drive-migrated', { limit: 100 })
  for (const item of items || []) {
    const { data } = supabase.storage.from('lesson-images').getPublicUrl(`drive-migrated/${item.name}`)
    console.log(`  ${item.name}  =>  ${data.publicUrl}`)
  }

  console.log('\nKits:')
  const { data: kits } = await supabase.from('kits').select('id, name, level_id, images')
  for (const k of kits || []) {
    const imgs = Array.isArray(k.images) ? k.images : (k.images ? [k.images] : [])
    const status = imgs.length > 0 ? 'TIENE' : 'VACIO'
    console.log(`  [${status}] ${k.id.padEnd(20)} | level:${(k.level_id||'').padEnd(15)} | ${k.name}`)
    if (imgs.length > 0) imgs.forEach(u => console.log(`         img: ${String(u).slice(0, 100)}`))
  }

  // CSV de kits con images
  console.log('\nKits desde CSV:')
  const csvText = fs.readFileSync(path.join(__dirname, '..', 'airtable', 'kits.csv'), 'utf8')
  const lines = csvText.split(/\r?\n/)
  console.log('  HEADER:', lines[0])
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length > 5 && /https/.test(lines[i])) {
      console.log(`  row ${i}: ${lines[i].slice(0, 200)}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
