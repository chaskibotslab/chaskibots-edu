// Descarga modelos GRATUITOS de Sketchfab (GLB) con su licencia, para el
// laboratorio. La clave de API se lee de .env.local (SKETCHFAB_API_TOKEN) y
// nunca se imprime. Solo baja modelos descargables con licencia que permita
// usarlos en la plataforma (CC0, CC BY, CC BY-SA); los NC/ND se informan y
// se saltan.
//
// Uso (desde la raíz del proyecto):
//   node --env-file=.env.local src/modules/laboratorio/scripts/descargar-sketchfab.mjs coleccion <uid>   → lista
//   node --env-file=.env.local src/modules/laboratorio/scripts/descargar-sketchfab.mjs modelo <uid> [<uid>…]  → descarga
//   node --env-file=.env.local src/modules/laboratorio/scripts/descargar-sketchfab.mjs coleccion <uid> --bajar → lista y descarga todo lo permitido

import fs from 'fs'
import path from 'path'

const API = 'https://api.sketchfab.com/v3'
const TOKEN = process.env.SKETCHFAB_API_TOKEN
const DESTINO = path.resolve('modelos-3d', 'sketchfab')
const PERMITIDAS = new Set(['cc0', 'by', 'by-sa'])

if (!TOKEN) {
  console.error('Falta SKETCHFAB_API_TOKEN en .env.local (sketchfab.com/settings/password → API Token).')
  process.exit(1)
}

async function api(ruta) {
  const r = await fetch(ruta.startsWith('http') ? ruta : API + ruta, { headers: { Authorization: `Token ${TOKEN}` } })
  if (r.status === 401) throw new Error('La clave de Sketchfab no es válida (401)')
  if (!r.ok) throw new Error(`Sketchfab respondió ${r.status} en ${ruta}`)
  return r.json()
}

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function modelosDeColeccion(uid) {
  const out = []
  let url = `/collections/${uid}/models?count=24`
  while (url) {
    const d = await api(url)
    out.push(...d.results)
    url = d.next
  }
  return out
}

function registrarLicencia(m, archivo) {
  const reg = path.join(DESTINO, 'licencias.json')
  const lista = fs.existsSync(reg) ? JSON.parse(fs.readFileSync(reg, 'utf8')) : {}
  lista[path.basename(archivo)] = {
    titulo: m.name, autor: m.user?.displayName || m.user?.username, perfil: m.user?.profileUrl,
    licencia: m.license?.label, url: m.viewerUrl, uid: m.uid, triangulos: m.faceCount,
  }
  fs.writeFileSync(reg, JSON.stringify(lista, null, 2))
}

async function bajar(uid) {
  const m = await api(`/models/${uid}`)
  const lic = m.license?.slug
  if (!m.isDownloadable) return console.log(`  ✗ ${m.name}: no es descargable`)
  if (!PERMITIDAS.has(lic)) return console.log(`  ✗ ${m.name}: licencia ${m.license?.label ?? '?'} (no permitida para la plataforma)`)
  const d = await api(`/models/${uid}/download`)
  if (!d.glb?.url) return console.log(`  ✗ ${m.name}: no tiene versión GLB`)
  fs.mkdirSync(DESTINO, { recursive: true })
  const archivo = path.join(DESTINO, `${slug(m.name)}.glb`)
  const r = await fetch(d.glb.url)
  if (!r.ok) throw new Error(`No se pudo bajar ${m.name} (${r.status})`)
  fs.writeFileSync(archivo, Buffer.from(await r.arrayBuffer()))
  registrarLicencia(m, archivo)
  console.log(`  ✓ ${m.name} → ${path.relative(process.cwd(), archivo)} (${(d.glb.size / 1e6).toFixed(1)} MB, ${m.license?.label})`)
}

const [modo, ...args] = process.argv.slice(2)
if (modo === 'coleccion') {
  const lista = await modelosDeColeccion(args[0])
  console.log(`${lista.length} modelos en la colección:`)
  for (const m of lista) {
    console.log(`  ${m.isDownloadable ? '⬇' : '·'} ${m.uid}  ${String(m.faceCount ?? '?').padStart(8)} tri  ${m.license?.label ?? m.license ?? '?'}  ${m.name}`)
  }
  if (args.includes('--bajar')) for (const m of lista) await bajar(m.uid).catch(e => console.log(`  ✗ ${m.name}: ${e.message}`))
} else if (modo === 'modelo') {
  for (const uid of args) await bajar(uid).catch(e => console.log(`  ✗ ${uid}: ${e.message}`))
} else {
  console.log('Uso: coleccion <uid> [--bajar] | modelo <uid> [<uid>…]')
}
