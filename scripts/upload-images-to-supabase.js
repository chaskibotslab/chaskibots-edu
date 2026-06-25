/**
 * Sube las imágenes del libro de sexto a Supabase Storage
 * Bucket: lesson-images (público)
 * Path: libros/sexto/page-XX.png
 *
 * Requisitos: ejecutar primero schema_improvements.sql para crear el bucket
 *
 * Uso: node scripts/upload-images-to-supabase.js
 */

const fs = require('fs')
const path = require('path')

// Cargar .env.local
const env = {}
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split(/\r?\n/)
  .forEach(line => {
    const m = line.match(/^([A-Z0-9_]+)=(.+)$/)
    if (m) env[m[1]] = m[2].trim()
  })

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'lesson-images'
const IMAGES_DIR = path.join(__dirname, '..', 'libros', 'sexto-images')

async function uploadFile(filename) {
  const filePath = path.join(IMAGES_DIR, filename)
  const fileBuffer = fs.readFileSync(filePath)
  const storagePath = `libros/sexto/${filename}`

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true', // sobrescribe si existe
    },
    body: fileBuffer,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

async function main() {
  console.log(`📦 Subiendo imágenes a Supabase Storage`)
  console.log(`📍 ${SUPABASE_URL}`)
  console.log(`🪣 Bucket: ${BUCKET}\n`)

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ No existe: ${IMAGES_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png')).sort()
  console.log(`📊 ${files.length} archivos a subir\n`)

  const results = []
  let uploaded = 0
  let errors = 0

  for (const file of files) {
    try {
      const url = await uploadFile(file)
      results.push({ file, url })
      uploaded++
      if (uploaded % 10 === 0) console.log(`   ✅ ${uploaded}/${files.length}`)
    } catch (e) {
      console.error(`   ❌ ${file}: ${e.message}`)
      errors++
    }
  }

  console.log(`\n✅ ${uploaded} subidas, ${errors} errores`)

  // Guardar mapa de URLs para referencia futura
  const mapPath = path.join(__dirname, '..', 'libros', 'sexto-images-urls.json')
  fs.writeFileSync(mapPath, JSON.stringify(results, null, 2))
  console.log(`📄 URLs guardadas en: libros/sexto-images-urls.json`)
}

main().catch(e => { console.error(e); process.exit(1) })
