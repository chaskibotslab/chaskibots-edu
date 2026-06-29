/**
 * Restaura images de kits desde airtable/kits.csv.
 * Match por id (los IDs coinciden entre CSV y Supabase).
 * Si la URL es de Drive, intenta mapear al archivo ya migrado en lesson-images/drive-migrated/.
 *
 * Uso: node scripts/restore-kit-images.js [--dry-run]
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

const DRY_RUN = process.argv.includes('--dry-run')

function parseCsv(text) {
  const rows = []
  let i = 0, row = [], cell = '', inQ = false
  while (i < text.length) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 2; continue }
        inQ = false; i++; continue
      }
      cell += ch; i++; continue
    }
    if (ch === '"') { inQ = true; i++; continue }
    if (ch === ',') { row.push(cell); cell = ''; i++; continue }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''; i++; continue
    }
    cell += ch; i++
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows
}

function extractDriveId(url) {
  if (!url) return null
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (m1) return m1[1]
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (m2) return m2[1]
  return null
}

async function main() {
  console.log(`Restore Kit Images - ${DRY_RUN ? 'DRY-RUN' : 'APLICAR'}\n`)

  const csvText = fs.readFileSync(path.join(__dirname, '..', 'airtable', 'kits.csv'), 'utf8')
  const rows = parseCsv(csvText)
  const head = rows[0]
  const idxId = head.indexOf('id')
  const idxImages = head.indexOf('images')
  const idxVideo = head.indexOf('videoUrl')
  const idxTutorial = head.indexOf('tutorialUrl')

  const { data: bucketFiles } = await supabase.storage.from('lesson-images').list('drive-migrated', { limit: 200 })
  const bucketSet = new Set((bucketFiles || []).map(f => f.name))
  console.log(`Bucket drive-migrated/: ${bucketSet.size} archivos`)

  const csvItems = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const id = row[idxId]
    if (!id) continue
    csvItems.push({
      id,
      images: row[idxImages] || '',
      videoUrl: row[idxVideo] || '',
      tutorialUrl: row[idxTutorial] || '',
    })
  }

  console.log(`Items en CSV: ${csvItems.length}\n`)

  let restored = 0, mapped = 0, missing = 0
  for (const item of csvItems) {
    if (!item.images || !item.images.trim()) continue
    const urls = item.images.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
    const newUrls = []

    for (const u of urls) {
      const fileId = extractDriveId(u)
      if (fileId && bucketSet.has(fileId)) {
        const { data } = supabase.storage.from('lesson-images').getPublicUrl(`drive-migrated/${fileId}`)
        newUrls.push(data.publicUrl)
        mapped++
      } else if (u.startsWith('http')) {
        // URL externa o ya migrada -> conservar
        newUrls.push(u)
      } else if (fileId) {
        // Drive URL pero NO está migrada al bucket
        missing++
        console.log(`  Missing in bucket: ${item.id} -> ${fileId}`)
      }
    }

    if (newUrls.length === 0) continue

    const updates = { images: newUrls }
    if (item.videoUrl.startsWith('http')) updates.video_url = item.videoUrl
    if (item.tutorialUrl.startsWith('http')) updates.tutorial_url = item.tutorialUrl

    console.log(`  ${item.id}: ${newUrls.length} URLs`)
    newUrls.forEach(u => console.log(`     ${u.slice(0, 100)}`))

    if (!DRY_RUN) {
      const { error } = await supabase.from('kits').update(updates).eq('id', item.id)
      if (error) console.log(`     ERROR: ${error.message}`)
      else restored++
    } else {
      restored++
    }
  }

  console.log(`\nTotal kits actualizados: ${restored}`)
  console.log(`URLs mapeadas a Supabase: ${mapped}`)
  console.log(`URLs faltantes en bucket: ${missing}`)
  if (DRY_RUN) console.log('\nDRY-RUN. Para aplicar quita --dry-run')
}

main().catch(e => { console.error(e); process.exit(1) })
