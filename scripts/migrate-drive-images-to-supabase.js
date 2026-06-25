/**
 * Migra imágenes/PDFs de Google Drive a Supabase Storage.
 * Escanea las tablas con columnas que suelen contener URLs de Drive.
 * Sube archivos de imagen/PDF al bucket público 'lesson-images' y actualiza la BD.
 *
 * Uso:
 *   node scripts/migrate-drive-images-to-supabase.js           # ejecuta migración
 *   node scripts/migrate-drive-images-to-supabase.js --dry-run  # solo escanea y cuenta
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Cargar variables de entorno
const env = {}
try {
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
    .split(/\r?\n/)
    .forEach(line => {
      const m = line.match(/^([A-Z0-9_]+)=(.+)$/)
      if (m) env[m[1]] = m[2].trim().replace(/\r$/, '')
    })
} catch (e) {
  console.warn('⚠️ No se pudo cargar .env.local')
}

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'lesson-images'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const DRY_RUN = process.argv.includes('--dry-run')

// ============================================================
// Utilidades
// ============================================================
function extractDriveId(url) {
  if (!url) return null
  const u = url.toString()
  const m1 = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (m1) return m1[1]
  const m2 = u.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (m2) return m2[1]
  return null
}

function isDriveUrl(url) {
  return !!url && url.includes('drive.google.com')
}

function isImageOrPdfUrl(url) {
  if (!url) return false
  const lower = url.toLowerCase()
  if (lower.includes('.pdf')) return true
  if (lower.includes('export=download')) return true
  if (lower.includes('export=view')) return true
  if (lower.includes('thumbnail')) return true
  if (lower.match(/\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/)) return true
  return false
}

function guessMimeType(url, buffer) {
  const lower = (url || '').toLowerCase()
  if (lower.includes('.pdf')) return 'application/pdf'
  if (lower.includes('.png')) return 'image/png'
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg'
  if (lower.includes('.gif')) return 'image/gif'
  if (lower.includes('.webp')) return 'image/webp'
  if (lower.includes('.svg')) return 'image/svg+xml'
  // Heurística por magic bytes
  if (buffer) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png'
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg'
    if (buffer[0] === 0x25 && buffer[1] === 0x50) return 'application/pdf'
    if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif'
    if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp'
  }
  return 'application/octet-stream'
}

async function ensureBucket() {
  if (DRY_RUN) return true
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = (buckets || []).some(b => b.id === BUCKET)
    if (exists) return true
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) throw error
    console.log(`🪣 Bucket '${BUCKET}' creado`)
    return true
  } catch (err) {
    console.error(`❌ Error verificando/creando bucket '${BUCKET}':`, err.message)
    return false
  }
}

async function downloadDriveFile(fileId) {
  // Primero intentar export=download (calidad original)
  let url = `https://drive.google.com/uc?export=download&id=${fileId}`
  let response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`HTTP ${response.status} descargando Drive`)
  let buffer = Buffer.from(await response.arrayBuffer())
  let mime = response.headers.get('content-type') || guessMimeType(url, buffer)

  // Si devuelve HTML de confirmación, intentar thumbnail como fallback
  if (mime.includes('text/html') || buffer.toString('utf8', 0, 500).toLowerCase().includes('<!doctype html')) {
    url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
    response = await fetch(url, { redirect: 'follow' })
    if (!response.ok) throw new Error(`HTTP ${response.status} descargando thumbnail`)
    buffer = Buffer.from(await response.arrayBuffer())
    mime = response.headers.get('content-type') || guessMimeType(url, buffer)
  }

  return { buffer, mime }
}

async function uploadToSupabase(fileId, buffer, mime) {
  const storagePath = `drive-migrated/${fileId}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: mime, upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function migrateUrl(url) {
  const fileId = extractDriveId(url)
  if (!fileId) throw new Error('No se pudo extraer fileId')
  const { buffer, mime } = await downloadDriveFile(fileId)
  const newUrl = await uploadToSupabase(fileId, buffer, mime)
  return newUrl
}

// ============================================================
// Escaneo y migración por tabla
// ============================================================
async function processLessons() {
  console.log('\n📦 Procesando lessons...')
  const { data, error } = await supabase.from('lessons').select('id, images, video_url, pdf_url')
  if (error) {
    console.error('❌ Error leyendo lessons:', error.message)
    return { scanned: 0, migrated: 0, errors: 0 }
  }

  let migrated = 0, errors = 0, skipped = 0
  for (const row of data || []) {
    const updates = {}

    // images (TEXT[])
    if (Array.isArray(row.images) && row.images.length > 0) {
      const newImages = []
      for (const url of row.images) {
        if (isDriveUrl(url) && isImageOrPdfUrl(url)) {
          if (DRY_RUN) {
            newImages.push(url)
            migrated++
          } else {
            try {
              const newUrl = await migrateUrl(url)
              newImages.push(newUrl)
              migrated++
              console.log(`   ✅ ${extractDriveId(url)} → ${newUrl}`)
            } catch (e) {
              errors++
              newImages.push(url) // mantener original si falla
              console.error(`   ❌ ${extractDriveId(url)}: ${e.message}`)
            }
          }
        } else {
          newImages.push(url)
          if (isDriveUrl(url)) skipped++
        }
      }
      if (newImages.length !== row.images.length || newImages.some((u, i) => u !== row.images[i])) {
        updates.images = newImages
      }
    }

    // pdf_url
    if (row.pdf_url && isDriveUrl(row.pdf_url) && isImageOrPdfUrl(row.pdf_url)) {
      if (DRY_RUN) {
        migrated++
      } else {
        try {
          const newUrl = await migrateUrl(row.pdf_url)
          updates.pdf_url = newUrl
          migrated++
          console.log(`   ✅ PDF ${extractDriveId(row.pdf_url)} → ${newUrl}`)
        } catch (e) {
          errors++
          console.error(`   ❌ PDF ${extractDriveId(row.pdf_url)}: ${e.message}`)
        }
      }
    }

    // video_url: no migramos por ahora (archivos grandes y bucket no definido)
    if (row.video_url && isDriveUrl(row.video_url)) {
      skipped++
    }

    if (Object.keys(updates).length > 0 && !DRY_RUN) {
      const { error: upError } = await supabase.from('lessons').update(updates).eq('id', row.id)
      if (upError) {
        console.error(`   ❌ Error actualizando lesson ${row.id}:`, upError.message)
        errors++
      }
    }
  }

  console.log(`   📊 ${data.length} lecciones escaneadas, ${migrated} URLs migradas, ${skipped} videos omitidos, ${errors} errores`)
  return { scanned: data.length, migrated, skipped, errors }
}

async function processKits() {
  console.log('\n📦 Procesando kits...')
  const { data, error } = await supabase.from('kits').select('id, images, video_url, tutorial_url')
  if (error) {
    console.error('❌ Error leyendo kits:', error.message)
    return { scanned: 0, migrated: 0, errors: 0 }
  }

  let migrated = 0, errors = 0, skipped = 0
  for (const row of data || []) {
    const updates = {}

    // images puede ser un string (CSV) o un array
    const images = Array.isArray(row.images)
      ? row.images
      : (row.images ? row.images.split(',').map(s => s.trim()).filter(Boolean) : [])

    if (images.length > 0) {
      const newImages = []
      for (const url of images) {
        if (isDriveUrl(url) && isImageOrPdfUrl(url)) {
          if (DRY_RUN) {
            newImages.push(url)
            migrated++
          } else {
            try {
              const newUrl = await migrateUrl(url)
              newImages.push(newUrl)
              migrated++
              console.log(`   ✅ kit ${extractDriveId(url)} → ${newUrl}`)
            } catch (e) {
              errors++
              newImages.push(url)
              console.error(`   ❌ kit ${extractDriveId(url)}: ${e.message}`)
            }
          }
        } else {
          newImages.push(url)
          if (isDriveUrl(url)) skipped++
        }
      }
      const updatedString = newImages.join(', ')
      if (updatedString !== row.images) updates.images = updatedString
    }

    for (const field of ['video_url', 'tutorial_url']) {
      if (row[field] && isDriveUrl(row[field]) && isImageOrPdfUrl(row[field])) {
        if (DRY_RUN) {
          migrated++
        } else {
          try {
            const newUrl = await migrateUrl(row[field])
            updates[field] = newUrl
            migrated++
          } catch (e) {
            errors++
            console.error(`   ❌ kit ${field} ${extractDriveId(row[field])}: ${e.message}`)
          }
        }
      }
      if (row[field] && isDriveUrl(row[field]) && !isImageOrPdfUrl(row[field])) {
        skipped++
      }
    }

    if (Object.keys(updates).length > 0 && !DRY_RUN) {
      const { error: upError } = await supabase.from('kits').update(updates).eq('id', row.id)
      if (upError) {
        console.error(`   ❌ Error actualizando kit ${row.id}:`, upError.message)
        errors++
      }
    }
  }

  console.log(`   📊 ${data.length} kits escaneados, ${migrated} URLs migradas, ${skipped} videos omitidos, ${errors} errores`)
  return { scanned: data.length, migrated, skipped, errors }
}

async function processExperiencias() {
  console.log('\n📦 Procesando experiencias...')
  const { data, error } = await supabase.from('experiencias').select('id, url')
  if (error) {
    console.error('❌ Error leyendo experiencias:', error.message)
    return { scanned: 0, migrated: 0, errors: 0 }
  }

  let migrated = 0, errors = 0, skipped = 0
  for (const row of data || []) {
    if (row.url && isDriveUrl(row.url) && isImageOrPdfUrl(row.url)) {
      if (DRY_RUN) {
        migrated++
      } else {
        try {
          const newUrl = await migrateUrl(row.url)
          const { error: upError } = await supabase.from('experiencias').update({ url: newUrl }).eq('id', row.id)
          if (upError) throw upError
          migrated++
        } catch (e) {
          errors++
          console.error(`   ❌ experiencia ${extractDriveId(row.url)}: ${e.message}`)
        }
      }
    } else if (row.url && isDriveUrl(row.url)) {
      skipped++
    }
  }
  console.log(`   📊 ${data.length} experiencias escaneadas, ${migrated} URLs migradas, ${skipped} omitidas, ${errors} errores`)
  return { scanned: data.length, migrated, skipped, errors }
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log(`🚀 Migración de imágenes Google Drive → Supabase Storage`)
  console.log(`📍 ${SUPABASE_URL}`)
  console.log(`🪣 Bucket: ${BUCKET}`)
  console.log(DRY_RUN ? '👀 Modo DRY-RUN: solo escanea y cuenta\n' : '\n')

  const bucketReady = await ensureBucket()
  if (!bucketReady) {
    console.error('❌ No se pudo preparar el bucket. Abortando.')
    process.exit(1)
  }

  const stats = {
    lessons: await processLessons(),
    kits: await processKits(),
    experiencias: await processExperiencias(),
  }

  console.log('\n📊 RESUMEN')
  console.log('───────────')
  for (const [table, s] of Object.entries(stats)) {
    console.log(`  ${table}: ${s.scanned} escaneados, ${s.migrated} migrados, ${s.skipped || 0} omitidos, ${s.errors} errores`)
  }
  console.log(DRY_RUN ? '\n👀 Dry-run finalizado. Para migrar de verdad quita --dry-run.' : '\n✅ Migración de imágenes completada.')
}

main().catch(e => {
  console.error('💥 Error fatal:', e)
  process.exit(1)
})
