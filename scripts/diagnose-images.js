/**
 * Diagnóstico: revisa el estado de las URLs de imágenes en Supabase
 * - Cuenta cuántas siguen apuntando a Google Drive
 * - Cuenta cuántas ya están en Supabase Storage
 * - Verifica que el bucket lesson-images sea público
 * - Lista cuántos archivos hay migrados
 *
 * Uso: node scripts/diagnose-images.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const env = {}
try {
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
    .split(/\r?\n/)
    .forEach(line => {
      const m = line.match(/^([A-Z0-9_]+)=(.+)$/)
      if (m) env[m[1]] = m[2].trim().replace(/\r$/, '')
    })
} catch (e) {
  console.warn('No se pudo cargar .env.local')
}

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function isDrive(url) { return typeof url === 'string' && url.includes('drive.google.com') }
function isSupabase(url) { return typeof url === 'string' && url.includes('/storage/v1/object/') }

async function checkBucket() {
  console.log('\n=== BUCKET: lesson-images ===')
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) {
    console.log('  ERROR listando buckets:', error.message)
    return
  }
  const b = buckets.find(x => x.id === 'lesson-images')
  if (!b) {
    console.log('  El bucket NO EXISTE')
    return
  }
  console.log(`  Existe: SI`)
  console.log(`  Publico: ${b.public ? 'SI' : 'NO (las imagenes no se veran sin signed URLs)'}`)

  const { data: items, error: listErr } = await supabase.storage.from('lesson-images').list('drive-migrated', { limit: 1000 })
  if (listErr) {
    console.log('  ERROR listando drive-migrated:', listErr.message)
  } else {
    console.log(`  Archivos en drive-migrated/: ${items?.length || 0}`)
  }

  const { data: rootItems } = await supabase.storage.from('lesson-images').list('', { limit: 100 })
  console.log(`  Carpetas/archivos en raiz: ${rootItems?.length || 0}`)
  if (rootItems && rootItems.length > 0) {
    console.log('  Primeros items:', rootItems.slice(0, 5).map(x => x.name).join(', '))
  }
}

async function checkLessons() {
  console.log('\n=== LESSONS ===')
  const { data, error } = await supabase.from('lessons').select('id, images, video_url, pdf_url').limit(2000)
  if (error) { console.log('  ERROR:', error.message); return }

  let drive = 0, supa = 0, otros = 0, vacios = 0
  let drivePdf = 0, supaPdf = 0
  let driveVideo = 0
  const samples = []
  for (const row of data) {
    const imgs = Array.isArray(row.images) ? row.images : []
    if (imgs.length === 0) vacios++
    for (const u of imgs) {
      if (isDrive(u)) { drive++; if (samples.length < 3) samples.push(u) }
      else if (isSupabase(u)) supa++
      else otros++
    }
    if (row.pdf_url) {
      if (isDrive(row.pdf_url)) drivePdf++
      else if (isSupabase(row.pdf_url)) supaPdf++
    }
    if (row.video_url && isDrive(row.video_url)) driveVideo++
  }
  console.log(`  Total: ${data.length} lecciones`)
  console.log(`  Lecciones sin imagenes: ${vacios}`)
  console.log(`  Imagenes en Drive (PROBLEMA): ${drive}`)
  console.log(`  Imagenes en Supabase: ${supa}`)
  console.log(`  Otras URLs: ${otros}`)
  console.log(`  PDFs en Drive: ${drivePdf} | en Supabase: ${supaPdf}`)
  console.log(`  Videos en Drive: ${driveVideo}`)
  if (samples.length) {
    console.log('  Ejemplos de URLs Drive:')
    samples.forEach(s => console.log('   ', s))
  }
}

async function checkKits() {
  console.log('\n=== KITS ===')
  const { data, error } = await supabase.from('kits').select('id, images, video_url, tutorial_url')
  if (error) { console.log('  ERROR:', error.message); return }
  let drive = 0, supa = 0
  for (const row of data) {
    const imgs = Array.isArray(row.images) ? row.images : (row.images ? String(row.images).split(',').map(s => s.trim()) : [])
    for (const u of imgs) {
      if (isDrive(u)) drive++
      else if (isSupabase(u)) supa++
    }
  }
  console.log(`  Total: ${data.length} kits | URLs Drive: ${drive} | URLs Supabase: ${supa}`)
}

async function main() {
  console.log('Diagnostico de imagenes - Supabase:', SUPABASE_URL)
  await checkBucket()
  await checkLessons()
  await checkKits()
  console.log('\nLISTO')
}

main().catch(e => { console.error('Error:', e); process.exit(1) })
