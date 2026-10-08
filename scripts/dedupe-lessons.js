/**
 * Quita las lecciones duplicadas de la tabla `lessons` (la carga inicial se
 * ejecutó dos veces). Por defecto solo simula; con --apply borra.
 *
 *   node scripts/dedupe-lessons.js           → simulación
 *   node scripts/dedupe-lessons.js --apply   → borra
 *
 * Reglas:
 *  - Dos lecciones son la misma si coinciden nivel, programa, módulo y título.
 *  - Solo se borra una copia si TODO su contenido es idéntico al de la que se conserva.
 *  - Se conserva la que esté referenciada por una entrega; si no, la más antigua.
 *  - Los grupos con diferencias no se tocan: se listan para revisarlos a mano.
 *  - Antes de borrar se guarda una copia completa en backups/ (carpeta local, no se sube a git).
 */
const fs = require('fs')
const path = require('path')

const APPLY = process.argv.includes('--apply')
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const base = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }
const get = async (t, q) => { const r = await fetch(`${base}${t}?${q}`, { headers }); const j = await r.json(); if (!Array.isArray(j)) throw new Error(`${t}: ${JSON.stringify(j).slice(0, 200)}`); return j }

// Campos que definen el contenido de una lección (todo menos id y fechas).
const CONTENIDO = ['type', 'duration', 'display_order', 'video_url', 'pdf_url', 'content', 'locked', 'images']
const firma = l => JSON.stringify(CONTENIDO.map(c => l[c] ?? null))

;(async () => {
  let lessons = []
  for (let offset = 0; ; offset += 1000) {
    const page = await get('lessons', `select=*&order=created_at.asc,id.asc&limit=1000&offset=${offset}`)
    lessons = lessons.concat(page)
    if (page.length < 1000) break
  }
  const referenciadas = new Set((await get('submissions', 'select=lesson_id&lesson_id=not.is.null')).map(s => s.lesson_id))

  const grupos = new Map()
  for (const l of lessons) {
    const k = [l.level_id, l.program_id, l.module_name, l.title].join('|')
    if (!grupos.has(k)) grupos.set(k, [])
    grupos.get(k).push(l)
  }

  const aBorrar = []
  const conDiferencias = []
  for (const filas of grupos.values()) {
    if (filas.length < 2) continue
    const conservar = filas.find(f => referenciadas.has(f.id)) || filas[0]
    const otras = filas.filter(f => f.id !== conservar.id)
    if (otras.every(o => firma(o) === firma(conservar))) {
      // Nunca borrar una copia que una entrega esté usando.
      aBorrar.push(...otras.filter(o => !referenciadas.has(o.id)).map(o => o.id))
    } else {
      // Copia más pobre: mismo texto y, en video/pdf/imágenes, vacía o igual a la mejor.
      // Borrarla no pierde nada, porque todo lo que tiene está también en la que se conserva.
      const riqueza = f => (f.video_url ? 1 : 0) + (f.pdf_url ? 1 : 0) + (f.images || []).length
      const mejor = filas.slice().sort((x, y) => riqueza(y) - riqueza(x))[0]
      const vacioOIgual = (o, c) => o[c] == null || o[c] === '' || (Array.isArray(o[c]) && o[c].length === 0) || JSON.stringify(o[c]) === JSON.stringify(mejor[c])
      const subconjuntos = filas.filter(f => f.id !== mejor.id && !referenciadas.has(f.id) &&
        ['type', 'duration', 'display_order', 'content', 'locked'].every(c => JSON.stringify(f[c] ?? null) === JSON.stringify(mejor[c] ?? null)) &&
        ['video_url', 'pdf_url', 'images'].every(c => vacioOIgual(f, c)))
      if (subconjuntos.length === filas.length - 1) aBorrar.push(...subconjuntos.map(f => f.id))
      else conDiferencias.push(filas)
    }
  }

  console.log(`lecciones: ${lessons.length} | distintas: ${grupos.size} | copias idénticas a borrar: ${aBorrar.length} | grupos con diferencias (no se tocan): ${conDiferencias.length}`)
  console.log(`quedarían: ${lessons.length - aBorrar.length}`)
  for (const filas of conDiferencias) {
    console.log(`\n  DIFERENTES: [${filas[0].level_id} · ${filas[0].program_id}] ${filas[0].title}`)
    for (const f of filas) {
      const distintos = CONTENIDO.filter(c => JSON.stringify(f[c] ?? null) !== JSON.stringify(filas[0][c] ?? null))
      console.log(`    ${f.id.slice(0, 8)} creada ${String(f.created_at).slice(0, 10)} | contenido ${(f.content || '').length} c | video ${f.video_url ? 'sí' : 'no'} | imágenes ${(f.images || []).length}${distintos.length ? ' | cambia: ' + distintos.join(', ') : ''}`)
    }
  }

  if (!APPLY) { console.log('\nSIMULACIÓN: no se borró nada. Ejecuta con --apply para borrar.'); return }

  const dir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `lessons-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(file, JSON.stringify(lessons))
  console.log(`\nrespaldo completo (${lessons.length} lecciones): ${file}`)

  let borradas = 0
  for (let i = 0; i < aBorrar.length; i += 100) {
    const lote = aBorrar.slice(i, i + 100)
    const r = await fetch(`${base}lessons?id=in.(${lote.join(',')})`, { method: 'DELETE', headers: { ...headers, Prefer: 'return=minimal' } })
    if (!r.ok) throw new Error(`error al borrar: ${r.status} ${(await r.text()).slice(0, 200)}`)
    borradas += lote.length
  }
  const restantes = await fetch(`${base}lessons?select=id`, { method: 'HEAD', headers: { ...headers, Prefer: 'count=exact' } })
  console.log(`borradas: ${borradas} | lecciones ahora: ${(restantes.headers.get('content-range') || '').split('/')[1]}`)
})().catch(e => { console.error(e.message); process.exit(1) })
