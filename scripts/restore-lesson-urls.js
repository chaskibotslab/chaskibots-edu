/**
 * Restaura videoUrl, imageUrl y pdfUrl desde los CSVs de Airtable hacia Supabase.
 * Hace match por (level_id + title + order|moduleName).
 *
 * Uso:
 *   node scripts/restore-lesson-urls.js           # aplica
 *   node scripts/restore-lesson-urls.js --dry-run # solo simula
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

function normalize(str) {
  return String(str || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function loadCsvData(filename) {
  const p = path.join(__dirname, '..', 'airtable', filename)
  if (!fs.existsSync(p)) return []
  const text = fs.readFileSync(p, 'utf8')
  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const head = rows[0]
  const idx = {
    levelId: head.findIndex(h => h === 'levelId'),
    title: head.findIndex(h => h === 'title'),
    order: head.findIndex(h => h === 'order'),
    moduleName: head.findIndex(h => h === 'moduleName'),
    videoUrl: head.findIndex(h => h === 'videoUrl'),
    imageUrl: head.findIndex(h => h === 'imageUrl'),
    pdfUrl: head.findIndex(h => h === 'pdfUrl'),
  }
  const items = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row[idx.title]) continue
    const item = {
      levelId: row[idx.levelId] || '',
      title: row[idx.title] || '',
      order: row[idx.order] || '',
      moduleName: row[idx.moduleName] || '',
      videoUrl: idx.videoUrl >= 0 ? (row[idx.videoUrl] || '') : '',
      imageUrl: idx.imageUrl >= 0 ? (row[idx.imageUrl] || '') : '',
      pdfUrl: idx.pdfUrl >= 0 ? (row[idx.pdfUrl] || '') : '',
    }
    // Solo incluir si tiene al menos una URL útil
    if (item.videoUrl.startsWith('http') || item.imageUrl.startsWith('http') || item.pdfUrl.startsWith('http')) {
      items.push(item)
    }
  }
  return items
}

async function main() {
  console.log(`Restauracion de URLs Lessons - ${DRY_RUN ? 'DRY-RUN' : 'APLICAR'}`)
  console.log(`Supabase: ${SUPABASE_URL}\n`)

  // 1. Cargar todos los CSVs candidatos
  const csvs = [
    'lessons_all_levels.csv',
    'lessons_dinamico_completo.csv',
    'lessons_mejoradas_sistemas_embebidos.csv',
    'lessons_para_importar.csv',
    'lessons_premium_sample.csv',
  ]

  const allCsvItems = []
  for (const f of csvs) {
    const items = loadCsvData(f)
    console.log(`  ${f}: ${items.length} con URLs`)
    allCsvItems.push(...items)
  }

  console.log(`\nTotal CSV items con URLs: ${allCsvItems.length}\n`)

  // 2. Cargar lecciones de Supabase
  const { data: lessons, error } = await supabase.from('lessons').select('id, level_id, title, display_order, module_name, video_url, images, pdf_url').limit(2000)
  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`Lecciones en Supabase: ${lessons.length}\n`)

  // 3. Indexar lecciones para match
  const indexByKey = new Map()
  for (const l of lessons) {
    const key = `${l.level_id}|${normalize(l.title)}`
    if (!indexByKey.has(key)) indexByKey.set(key, [])
    indexByKey.get(key).push(l)
  }

  // 4. Match y actualizar
  let matched = 0, notFound = 0, ambiguous = 0
  let updates = { video: 0, image: 0, pdf: 0 }
  const errors = []

  for (const item of allCsvItems) {
    const key = `${item.levelId}|${normalize(item.title)}`
    const candidates = indexByKey.get(key)
    if (!candidates || candidates.length === 0) {
      notFound++
      continue
    }

    // Si hay varios, intentar refinar por order
    let lesson = candidates[0]
    if (candidates.length > 1 && item.order) {
      const refined = candidates.find(c => String(c.display_order) === String(item.order))
      if (refined) lesson = refined
      else { ambiguous++; continue }
    }

    matched++

    const updateFields = {}
    if (item.videoUrl.startsWith('http') && !lesson.video_url) {
      updateFields.video_url = item.videoUrl
      updates.video++
    }
    if (item.imageUrl.startsWith('http') && (!lesson.images || lesson.images.length === 0)) {
      updateFields.images = [item.imageUrl]
      updates.image++
    }
    if (item.pdfUrl.startsWith('http') && !lesson.pdf_url) {
      updateFields.pdf_url = item.pdfUrl
      updates.pdf++
    }

    if (Object.keys(updateFields).length > 0) {
      if (!DRY_RUN) {
        const { error: upErr } = await supabase.from('lessons').update(updateFields).eq('id', lesson.id)
        if (upErr) errors.push({ id: lesson.id, error: upErr.message })
      }
    }
  }

  console.log('Resultados:')
  console.log(`  Coincidencias encontradas: ${matched}`)
  console.log(`  No encontradas (titulo+nivel): ${notFound}`)
  console.log(`  Ambiguas: ${ambiguous}`)
  console.log(`  URLs aplicadas:`)
  console.log(`    videos: ${updates.video}`)
  console.log(`    imagenes: ${updates.image}`)
  console.log(`    pdfs: ${updates.pdf}`)
  if (errors.length) {
    console.log(`\nErrores (${errors.length}):`)
    errors.slice(0, 5).forEach(e => console.log(`  ${e.id}: ${e.error}`))
  }
  if (DRY_RUN) console.log('\nDRY-RUN. Para aplicar quita --dry-run')
}

main().catch(e => { console.error(e); process.exit(1) })
