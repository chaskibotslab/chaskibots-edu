/**
 * Carga las guías de 6 etapas de un kit en kit_proyectos.guia.
 * Uso: node scripts/seed-kit-guias.js kit-lv-noveno-egb
 * Requiere haber ejecutado antes supabase/migrations/2026_10_kit_guia.sql.
 * Idempotente: vuelve a escribir la guía de cada proyecto del archivo.
 */
const fs = require('fs')
const path = require('path')

const kitId = process.argv[2]
if (!kitId) { console.error('Falta el id del kit, por ejemplo: kit-lv-noveno-egb'); process.exit(1) }
const guias = require(path.join(__dirname, 'guias', `${kitId}.js`))

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const base = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' }

// Etiquetas de pines sin tilde heredadas de la carga inicial.
const ETIQUETAS = [[/\bSenal\b/g, 'Señal'], [/\bAnodo\b/g, 'Ánodo'], [/\bCatodo\b/g, 'Cátodo']]

// Las fotos y videos se ponen desde el editor o con scripts/fotos-kits.js, no en
// los archivos de guías: al recargar una guía se conservan los que ya tenía.
// Piezas por nombre; pasos por posición.
function conservarFotos(nueva, actual) {
  if (!actual) return nueva
  const g = JSON.parse(JSON.stringify(nueva))
  const media = (a, b) => {
    if (!a || !b) return
    if (!a.fotoUrl && b.fotoUrl) a.fotoUrl = b.fotoUrl
    if (!a.videoUrl && b.videoUrl) a.videoUrl = b.videoUrl
  }
  media(g.reto, actual.reto)
  for (const pz of g.piezas || []) media(pz, (actual.piezas || []).find(x => x.nombre === pz.nombre))
  ;(g.pasos || []).forEach((paso, i) => media(paso, (actual.pasos || [])[i]))
  return g
}

;(async () => {
  const proyectos = await (await fetch(`${base}kit_proyectos?select=id,slug,guia&kit_id=eq.${kitId}`, { headers })).json()
  if (!Array.isArray(proyectos)) throw new Error(JSON.stringify(proyectos))

  for (const [slug, guiaArchivo] of Object.entries(guias)) {
    const p = proyectos.find(x => x.slug === slug)
    if (!p) { console.log('no existe el proyecto', slug); continue }
    const guia = conservarFotos(guiaArchivo, p.guia)
    const r = await fetch(`${base}kit_proyectos?id=eq.${p.id}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ guia }) })
    console.log(r.ok ? 'guía cargada ' : `ERROR ${r.status} ${(await r.text()).slice(0, 160)}`, slug)
  }

  const ids = proyectos.map(p => p.id).join(',')
  const conexiones = await (await fetch(`${base}kit_conexiones?select=id,pin_componente&proyecto_id=in.(${ids})`, { headers })).json()
  let corregidas = 0
  for (const c of conexiones) {
    const nuevo = ETIQUETAS.reduce((s, [re, to]) => s.replace(re, to), c.pin_componente || '')
    if (nuevo === c.pin_componente) continue
    await fetch(`${base}kit_conexiones?id=eq.${c.id}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ pin_componente: nuevo }) })
    corregidas++
  }
  console.log('etiquetas de pines corregidas:', corregidas)
})().catch(e => { console.error(e.message); process.exit(1) })
