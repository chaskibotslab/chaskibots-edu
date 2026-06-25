/**
 * Reemplaza URLs de Google Drive que ya fueron migradas a Supabase Storage
 * en archivos fuente (src) y datos (airtable CSVs).
 *
 * Uso: node scripts/replace-migrated-drive-urls.js [--dry-run]
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
  console.warn('⚠️ No se pudo cargar .env.local')
}

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const DRY_RUN = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const BUCKET = 'lesson-images'
const PREFIX = 'drive-migrated'

function walk(dir, extensions) {
  const files = []
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    const s = fs.statSync(p)
    if (s.isDirectory()) {
      if (f === 'node_modules' || f === '.next' || f === '.git') continue
      files.push(...walk(p, extensions))
    } else if (extensions.some(ext => p.endsWith(ext))) {
      files.push(p)
    }
  }
  return files
}

async function listMigratedFiles() {
  const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX)
  if (error) {
    console.error('❌ Error listando bucket:', error.message)
    return []
  }
  return (data || [])
    .filter(item => item.id) // archivos, no carpetas
    .map(item => ({
      fileId: item.name,
      publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${PREFIX}/${item.name}`
    }))
}

async function main() {
  console.log(`🚀 Reemplazo de URLs de Drive migradas`)
  console.log(DRY_RUN ? '👀 Modo DRY-RUN\n' : '')

  const migrated = await listMigratedFiles()
  if (migrated.length === 0) {
    console.log('⚠️ No hay archivos migrados en el bucket')
    return
  }
  console.log(`📦 ${migrated.length} archivos migrados encontrados\n`)

  const replacements = []
  for (const { fileId, publicUrl } of migrated) {
    // Variantes comunes de URLs de Drive
    const driveUrlPatterns = [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
      `https://drive.google.com/file/d/${fileId}/view`,
      `https://drive.google.com/file/d/${fileId}/preview`,
      `https://drive.google.com/file/d/${fileId}`,
    ]
    for (const durl of driveUrlPatterns) {
      replacements.push({ from: durl, to: publicUrl })
    }
  }

  const targetDirs = ['src', 'airtable']
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.csv']

  let filesScanned = 0
  let filesModified = 0
  let totalReplacements = 0

  for (const dir of targetDirs) {
    const base = path.join(__dirname, '..', dir)
    if (!fs.existsSync(base)) continue
    const files = walk(base, extensions)
    for (const file of files) {
      filesScanned++
      const content = fs.readFileSync(file, 'utf8')
      let newContent = content
      let changed = 0
      for (const { from, to } of replacements) {
        let idx = newContent.indexOf(from)
        while (idx !== -1) {
          changed++
          newContent = newContent.replace(from, to)
          idx = newContent.indexOf(from)
        }
      }
      if (changed > 0) {
        filesModified++
        totalReplacements += changed
        if (!DRY_RUN) {
          fs.writeFileSync(file, newContent, 'utf8')
        }
        console.log(`   ${DRY_RUN ? '👀' : '✅'} ${file} (${changed} reemplazo${changed > 1 ? 's' : ''})`)
      }
    }
  }

  console.log(`\n📊 ${filesScanned} archivos escaneados, ${filesModified} modificados, ${totalReplacements} reemplazos`)
  if (DRY_RUN) {
    console.log('👀 Dry-run finalizado. Para aplicar quita --dry-run.')
  } else {
    console.log('✅ Reemplazo completado.')
  }
}

main().catch(e => {
  console.error('💥 Error fatal:', e)
  process.exit(1)
})
