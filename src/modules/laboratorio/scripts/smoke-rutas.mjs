// Smoke test: confirma que las rutas EXISTENTES de la plataforma responden
// igual que antes de agregar el laboratorio.
//
// Uso:
//   node src/modules/laboratorio/scripts/smoke-rutas.mjs http://localhost:3000 --guardar   (en main: guarda la línea base)
//   node src/modules/laboratorio/scripts/smoke-rutas.mjs http://localhost:3000             (en la rama: compara)
//
// Compara el código HTTP y la redirección de cada ruta sin sesión.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const guardar = process.argv.includes('--guardar')
const archivo = path.join(path.dirname(fileURLToPath(import.meta.url)), 'smoke-base.json')

const RUTAS = [
  '/', '/login', '/register', '/dashboard', '/academy', '/academia', '/niveles', '/robotica',
  '/simuladores', '/ia', '/diseno', '/hacking', '/tareas', '/admin',
  '/api/simulators', '/api/levels',
]

async function medir(ruta) {
  const res = await fetch(base + ruta, { redirect: 'manual' })
  const destino = res.headers.get('location')
  return { status: res.status, redirect: destino ? new URL(destino, base).pathname + new URL(destino, base).search : null }
}

const actual = {}
for (const r of RUTAS) {
  try { actual[r] = await medir(r) } catch (e) { actual[r] = { status: 'sin respuesta', redirect: String(e) } }
}

if (guardar) {
  fs.writeFileSync(archivo, JSON.stringify(actual, null, 2))
  console.log(`Línea base guardada en ${archivo}`)
  console.table(actual)
  process.exit(0)
}

if (!fs.existsSync(archivo)) {
  console.table(actual)
  console.log('No hay línea base: córrelo primero en main con --guardar.')
  process.exit(0)
}

const antes = JSON.parse(fs.readFileSync(archivo, 'utf8'))
let fallas = 0
for (const r of RUTAS) {
  const a = antes[r], b = actual[r]
  const igual = a && a.status === b.status && a.redirect === b.redirect
  if (!igual) fallas++
  console.log(`${igual ? 'OK   ' : 'CAMBIO'} ${r.padEnd(18)} ${JSON.stringify(a)} → ${JSON.stringify(b)}`)
}
console.log(fallas ? `\n${fallas} ruta(s) cambiaron` : '\nTodas las rutas existentes responden igual')
process.exit(fallas ? 1 : 0)
