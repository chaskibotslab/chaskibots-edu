/**
 * Reporte completo de imágenes en TODAS las tablas relevantes de Supabase.
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

const TABLES = [
  { name: 'lessons', cols: ['images', 'video_url', 'pdf_url'] },
  { name: 'kits', cols: ['images', 'video_url', 'tutorial_url'] },
  { name: 'projects', cols: ['video_url', 'tutorial_url', 'resources'] },
  { name: 'experiencias', cols: ['url'] },
  { name: 'simulators', cols: ['icon', 'url'] },
  { name: 'levels', cols: ['icon'] },
  { name: 'ai_activities', cols: ['icon'] },
]

function classify(url) {
  if (!url || typeof url !== 'string') return 'empty'
  if (url.includes('drive.google.com')) return 'drive'
  if (url.includes('/storage/v1/object/')) return 'supabase'
  if (url.startsWith('http://') || url.startsWith('https://')) return 'external'
  return 'other'
}

async function main() {
  console.log('REPORTE COMPLETO DE IMÁGENES Y RECURSOS')
  console.log('Proyecto:', SUPABASE_URL)
  console.log('='.repeat(80))

  for (const { name, cols } of TABLES) {
    const { data, error } = await supabase.from(name).select('*').limit(5000)
    if (error) {
      console.log(`\n[${name}] ERROR: ${error.message}`)
      continue
    }
    console.log(`\n=== TABLA: ${name} (${data.length} filas) ===`)
    for (const col of cols) {
      const stats = { empty: 0, drive: 0, supabase: 0, external: 0, other: 0 }
      const samples = { external: [], drive: [], supabase: [] }
      for (const row of data) {
        const val = row[col]
        if (Array.isArray(val)) {
          if (val.length === 0) stats.empty++
          for (const v of val) {
            const c = classify(v)
            stats[c] = (stats[c] || 0) + 1
            if (samples[c] && samples[c].length < 2) samples[c].push(v.slice(0, 80))
          }
        } else {
          const c = classify(val)
          stats[c]++
          if (samples[c] && samples[c].length < 2) samples[c].push(String(val || '').slice(0, 80))
        }
      }
      const parts = Object.entries(stats).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join('  ')
      console.log(`  ${col.padEnd(15)} ${parts}`)
      if (samples.external.length) samples.external.forEach(s => console.log(`     ext: ${s}`))
      if (samples.supabase.length) samples.supabase.forEach(s => console.log(`     sup: ${s}`))
      if (samples.drive.length) samples.drive.forEach(s => console.log(`     drv: ${s}`))
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('ANALISIS BUCKET')
  const { data: buckets } = await supabase.storage.listBuckets()
  for (const b of buckets || []) {
    const { data: items } = await supabase.storage.from(b.id).list('', { limit: 100 })
    console.log(`  bucket "${b.id}" (public:${b.public}) - ${items?.length || 0} items en raiz`)
    if (items) {
      for (const item of items.slice(0, 10)) {
        console.log(`     - ${item.name}`)
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
