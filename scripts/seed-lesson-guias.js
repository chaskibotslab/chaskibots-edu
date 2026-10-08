/**
 * Carga guías por etapas en las lecciones normales (tabla lessons).
 * Uso: node scripts/seed-lesson-guias.js lecciones-inicial-2-robotica
 * Requiere haber ejecutado antes supabase/migrations/2026_10_lessons_guia.sql.
 * Busca cada lección por nivel + programa + título. Idempotente.
 */
const fs = require('fs')
const path = require('path')

const nombre = process.argv[2]
if (!nombre) { console.error('Falta el archivo, por ejemplo: lecciones-inicial-2-robotica'); process.exit(1) }
const { levelId, programId, guias } = require(path.join(__dirname, 'guias', `${nombre}.js`))

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const base = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }

;(async () => {
  const lecciones = await (await fetch(`${base}lessons?select=id,title&level_id=eq.${levelId}&program_id=eq.${programId}`, { headers })).json()
  if (!Array.isArray(lecciones)) throw new Error(JSON.stringify(lecciones))

  for (const [titulo, guia] of Object.entries(guias)) {
    const filas = lecciones.filter(l => l.title === titulo)
    if (filas.length === 0) { console.log('no existe la lección:', titulo); continue }
    for (const f of filas) {
      const r = await fetch(`${base}lessons?id=eq.${f.id}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ guia }) })
      console.log(r.ok ? 'guía cargada ' : `ERROR ${r.status} ${(await r.text()).slice(0, 160)}`, titulo)
    }
  }
  const sin = lecciones.filter(l => !Object.keys(guias).includes(l.title))
  if (sin.length) console.log('lecciones de este nivel sin guía en el archivo:', sin.map(l => l.title).join(' | '))
})().catch(e => { console.error(e.message); process.exit(1) })
