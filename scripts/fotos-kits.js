/**
 * Fotos de los kits desde la carpeta fotos/ del proyecto.
 *
 *   node scripts/fotos-kits.js --lista   crea fotos/LISTA.md con el nombre exacto de cada foto
 *                                        (solo lee la plataforma; marca las que ya tienes)
 *   node scripts/fotos-kits.js           reduce, sube y coloca las fotos que haya en fotos/
 *
 * Nombres (jpg, jpeg, png o webp; da igual mayúsculas):
 *   pieza-<pieza>.jpg                 en TODAS las guías que usan esa pieza, de cualquier curso
 *   kit-<grado>.jpg                   portada del kit de ese grado
 *   proyecto-<grado>--<proyecto>.jpg  foto del proyecto terminado (etapa "El reto")
 *   paso-<grado>--<proyecto>--<n>.jpg foto del paso n de la etapa "Arma"
 *
 * Cada foto se reduce a 1200 px en WebP y se sube al almacenamiento público "kit-fotos".
 * El nombre subido lleva una huella del contenido: si cambias la foto, cambia la dirección
 * y nadie ve la vieja guardada en caché. Las fotos puestas a mano desde el editor no se tocan.
 * Antes de escribir guarda una copia en backups/.
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = path.join(__dirname, '..')
const DIR = path.join(ROOT, 'fotos')
const BUCKET = 'kit-fotos'
const LISTA = process.argv.includes('--lista')

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
const auth = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const PUBLIC_PREFIX = `${URL_BASE}/storage/v1/object/public/${BUCKET}/`

async function rest(method, pathname, body) {
  const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
    method,
    headers: { ...auth, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${pathname}: ${res.status} ${text.slice(0, 200)}`)
  return text ? JSON.parse(text) : null
}

// kit-lv-decimo-egb → 10mo-egb
const GRADOS = {
  'inicial-1': 'inicial-1', 'inicial-2': 'inicial-2',
  'primero-egb': '1ro-egb', 'segundo-egb': '2do-egb', 'tercero-egb': '3ro-egb', 'cuarto-egb': '4to-egb',
  'quinto-egb': '5to-egb', 'sexto-egb': '6to-egb', 'septimo-egb': '7mo-egb', 'octavo-egb': '8vo-egb',
  'noveno-egb': '9no-egb', 'decimo-egb': '10mo-egb',
  'primero-bach': '1ro-bgu', 'segundo-bach': '2do-bgu', 'tercero-bach': '3ro-bgu',
}
const grado = kitId => GRADOS[kitId.replace(/^kit-lv-/, '')] || kitId.replace(/^kit-lv-/, '')

// Nombre de pieza en la guía → nombre de la foto. Varias formas de escribir la misma
// pieza comparten foto. null = no lleva foto (es el trabajo del estudiante o algo obvio).
const PIEZAS = [
  [/ESP32 DevKit/i, 'esp32-devkit'],
  [/ESP32-C3/i, 'esp32-c3'],
  [/Arduino Nano/i, 'arduino-nano'],
  [/Arduino UNO/i, 'arduino-uno'],
  [/Luz azul de la placa/i, null],
  [/^Protoboard/i, 'protoboard'], // con o sin cables: la misma foto sirve
  [/^Cart[oó]n y cables jumper/i, 'carton-y-cables'],
  [/^Cables jumper/i, 'cables-jumper'],
  [/Bater[ií]a de 9 V/i, 'bateria-9v'],
  [/CR2032/i, 'pila-cr2032'],
  [/botella/i, 'cinta-cobre-y-botella'],
  [/caja de cart[oó]n/i, 'cinta-cobre-y-caja'],
  [/bot[oó]n(es)? de cartulina/i, 'boton-cartulina'],
  [/cinta de cobre/i, 'cinta-cobre'],
  [/^Tu |^Tus |luci[eé]rnaga|^Papel y l[aá]piz|^Un celular/i, null],
  [/^Cartulina/i, 'cartulina'],
  [/Pinza de papel/i, 'pinza-papel'],
  [/Vaso con agua/i, 'vaso-agua-sal'],
  [/sondas/i, 'sondas'],
  [/Display de 7 segmentos/i, 'display-7-segmentos'],
  [/DIP switch/i, 'dip-switch'],
  [/LCD 16x2/i, 'lcd-16x2-i2c'],
  [/Servo/i, 'servo-sg90'],
  [/rel[eé] con optoacoplador/i, 'rele-optoacoplador'],
  [/rel[eé] y bomba/i, 'rele-y-bomba'],
  [/rel[eé]/i, 'rele-1-canal'],
  [/Buzzer activo/i, 'buzzer-activo'],
  [/Buzzer pasivo/i, 'buzzer-pasivo'],
  [/humedad del suelo/i, 'sensor-humedad-suelo'],
  [/DHT11/i, 'sensor-dht11'],
  [/PIR/i, 'sensor-pir'],
  [/HC-SR04P/i, 'sensor-ultrasonico-hcsr04p'],
  [/HC-SR04/i, 'sensor-ultrasonico-hcsr04'],
  [/M[oó]dulo sensor de luz/i, 'sensor-luz-modulo'],
  [/^LDR/i, 'ldr'],
  [/2N3904/i, 'transistor-2n3904'],
  [/condensador/i, 'condensadores'],
  [/Potenci[oó]metro de 10/i, 'potenciometro-10k'],
  [/Potenci[oó]metro de 5/i, 'potenciometro-5k'],
  [/Pulsador/i, 'pulsador'],
  [/alerta.*buzzer/i, 'led-y-buzzer'],
  [/^(Cuatro|Dos|Tres) LED|LED rojo,|LED rojo y LED verde/i, 'leds-colores'],
  [/^LED rojo/i, 'led-rojo'],
  [/^LED verde o amarillo/i, 'led-amarillo'],
  [/^LED verde/i, 'led-verde'],
  [/^LED amarillo/i, 'led-amarillo'],
  [/^LED blanco/i, 'led-blanco'],
  [/^LED/i, 'led'],
  [/Resistencias de 4,7|Tres resistencias de 1 k.*22|\(1 k.*220|1 k.*220 .*330|para el LED \(/i, 'resistencias-surtidas'],
  [/4,7 k/i, 'resistencia-4k7'],
  [/22 k/i, 'resistencia-22k'],
  [/330/i, 'resistencia-330'],
  [/470 Ω|470 ohm/i, 'resistencia-470'],
  [/1 kΩ/i, 'resistencia-1k'],
]
const fotoDePieza = nombre => {
  for (const [re, key] of PIEZAS) if (re.test(nombre)) return { key }
  return { key: undefined }
}

const EXT = ['.jpg', '.jpeg', '.png', '.webp']
function fotosEnCarpeta() {
  if (!fs.existsSync(DIR)) return new Map()
  const map = new Map()
  for (const f of fs.readdirSync(DIR)) {
    const ext = path.extname(f).toLowerCase()
    if (!EXT.includes(ext)) continue
    map.set(path.basename(f, path.extname(f)).toLowerCase(), path.join(DIR, f))
  }
  return map
}

// Solo se reemplaza una foto vacía o puesta por este script; nunca una puesta a mano.
const esNuestra = url => !url || url.startsWith(PUBLIC_PREFIX)

async function main() {
  const proyectos = await rest('GET', 'kit_proyectos?select=id,kit_id,slug,titulo,tipo,orden,guia&kit_id=like.kit-lv-*&order=kit_id,orden')
  const kits = await rest('GET', 'kits?select=id,name,image_url&id=like.kit-lv-*')
  const fotos = fotosEnCarpeta()

  if (LISTA) return escribirLista(proyectos, kits, fotos)
  if (fotos.size === 0) return console.log('La carpeta fotos/ no tiene fotos todavía. Usa --lista para ver los nombres.')

  const sharp = require('sharp')
  await asegurarBucket()

  const urls = new Map()
  for (const [nombre, archivo] of fotos) {
    const buf = await sharp(archivo).rotate().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    const huella = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8)
    const destino = `${nombre}-${huella}.webp`
    const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${destino}`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'image/webp', 'x-upsert': 'true', 'Cache-Control': 'max-age=31536000' },
      body: buf,
    })
    if (!res.ok) throw new Error(`No se pudo subir ${nombre}: ${res.status} ${(await res.text()).slice(0, 200)}`)
    urls.set(nombre, PUBLIC_PREFIX + destino)
    console.log(`subida  ${nombre}  (${Math.round(buf.length / 1024)} KB)`)
  }

  const cambiosGuia = []
  const usadas = new Set()
  for (const p of proyectos) {
    if (!p.guia) continue
    const g = JSON.parse(JSON.stringify(p.guia))
    const base = `${grado(p.kit_id)}--${p.slug}`
    let cambio = false
    const poner = (obj, nombre) => {
      const url = urls.get(nombre)
      if (!url || !obj || !esNuestra(obj.fotoUrl) || obj.fotoUrl === url) { if (url) usadas.add(nombre); return }
      obj.fotoUrl = url
      usadas.add(nombre)
      cambio = true
    }
    for (const pz of g.piezas || []) {
      const { key } = fotoDePieza(pz.nombre)
      if (key) poner(pz, `pieza-${key}`)
    }
    poner(g.reto, `proyecto-${base}`)
    ;(g.pasos || []).forEach((paso, i) => poner(paso, `paso-${base}--${i + 1}`))
    if (cambio) cambiosGuia.push({ id: p.id, slug: p.slug, antes: p.guia, guia: g })
  }

  const cambiosKit = []
  for (const k of kits) {
    const nombre = `kit-${grado(k.id)}`
    const url = urls.get(nombre)
    if (!url) continue
    usadas.add(nombre)
    if (esNuestra(k.image_url) && k.image_url !== url) cambiosKit.push({ id: k.id, antes: k.image_url, image_url: url })
  }

  const dir = path.join(ROOT, 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const copia = path.join(dir, `fotos-kits-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(copia, JSON.stringify({ guias: cambiosGuia.map(c => ({ id: c.id, guia: c.antes })), kits: cambiosKit.map(c => ({ id: c.id, image_url: c.antes })) }))

  for (const c of cambiosGuia) await rest('PATCH', `kit_proyectos?id=eq.${c.id}`, { guia: c.guia })
  for (const c of cambiosKit) await rest('PATCH', `kits?id=eq.${c.id}`, { image_url: c.image_url })

  console.log(`\nGuías actualizadas: ${cambiosGuia.length} · portadas de kit: ${cambiosKit.length}`)
  const sinUso = [...fotos.keys()].filter(n => !usadas.has(n))
  if (sinUso.length) console.log(`\nATENCIÓN, estas fotos no coinciden con ningún nombre de la lista (revisa cómo se escriben):\n  ${sinUso.join('\n  ')}`)
  console.log(`Copia de lo anterior: ${path.relative(ROOT, copia)}`)
}

async function asegurarBucket() {
  const res = await fetch(`${URL_BASE}/storage/v1/bucket/${BUCKET}`, { headers: auth })
  if (res.ok) return
  const crear = await fetch(`${URL_BASE}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 5 * 1024 * 1024, allowed_mime_types: ['image/webp'] }),
  })
  if (!crear.ok) throw new Error(`No se pudo crear el almacenamiento ${BUCKET}: ${(await crear.text()).slice(0, 200)}`)
}

function escribirLista(proyectos, kits, fotos) {
  fs.mkdirSync(DIR, { recursive: true })
  const tiene = n => (fotos.has(n) ? '✅' : '⬜')

  const piezas = new Map() // key → { nombres, lugares, grados }
  const sinMapa = new Map()
  for (const p of proyectos) {
    for (const pz of p.guia?.piezas || []) {
      const { key } = fotoDePieza(pz.nombre)
      if (key === null) continue
      if (key === undefined) { sinMapa.set(pz.nombre, (sinMapa.get(pz.nombre) || 0) + 1); continue }
      const e = piezas.get(key) || { nombres: new Set(), lugares: 0, grados: new Set() }
      e.nombres.add(pz.nombre)
      e.lugares++
      e.grados.add(grado(p.kit_id))
      piezas.set(key, e)
    }
  }

  const ORDEN = Object.values(GRADOS)
  const porGrado = (a, b) => ORDEN.indexOf(a) - ORDEN.indexOf(b)
  let md = `# Fotos de los kits

Guarda cada foto en esta carpeta (\`fotos/\`) con el **nombre exacto** de la lista.
Sirve .jpg, .png o .webp, de cualquier tamaño: el script las achica solo.
No hace falta tenerlas todas: sube las que tengas y vuelve a ejecutarlo cuando agregues más.

Cuando tengas fotos, ejecuta en la ventana de Claude:

\`\`\`
! node scripts/fotos-kits.js
\`\`\`

Y para actualizar esta lista (marca con ✅ las que ya están en la carpeta):

\`\`\`
! node scripts/fotos-kits.js --lista
\`\`\`

Consejos: fondo blanco o liso, buena luz, la pieza ocupando casi toda la foto.

## 1. Piezas (una foto sirve para todos los cursos que la usan)

| | Nombre del archivo | Qué fotografiar | Se usa en |
|---|---|---|---|
`
  for (const [key, e] of [...piezas.entries()].sort((a, b) => b[1].lugares - a[1].lugares)) {
    const grados = [...e.grados].sort(porGrado)
    md += `| ${tiene(`pieza-${key}`)} | \`pieza-${key}.jpg\` | ${[...e.nombres].slice(0, 3).join(' / ')} | ${e.lugares} ${e.lugares === 1 ? 'guía' : 'guías'} (${grados.join(', ')}) |\n`
  }

  md += `\n## 2. Portada de cada kit\n\nFoto del kit completo, con todas sus piezas a la vista.\n\n| | Nombre del archivo | Kit |\n|---|---|---|\n`
  for (const k of [...kits].sort((a, b) => porGrado(grado(a.id), grado(b.id)))) {
    md += `| ${tiene(`kit-${grado(k.id)}`)} | \`kit-${grado(k.id)}.jpg\` | ${k.name} |\n`
  }

  md += `\n## 3. Proyectos y pasos (opcional, una por curso)\n\n- **proyecto-…**: el proyecto ya terminado y funcionando. Sale al inicio de la guía.\n- **paso-…**: cómo debe verse la protoboard al terminar ese paso.\n`
  for (const g of [...new Set(proyectos.map(p => grado(p.kit_id)))].sort(porGrado)) {
    md += `\n### ${g}\n\n`
    for (const p of proyectos.filter(x => grado(x.kit_id) === g && x.guia)) {
      const base = `${g}--${p.slug}`
      md += `**${p.titulo}** (${p.tipo})\n\n- ${tiene(`proyecto-${base}`)} \`proyecto-${base}.jpg\`\n`
      ;(p.guia.pasos || []).forEach((paso, i) => {
        md += `- ${tiene(`paso-${base}--${i + 1}`)} \`paso-${base}--${i + 1}.jpg\` — ${paso.titulo}\n`
      })
      md += '\n'
    }
  }

  if (sinMapa.size) {
    md += `\n## Piezas sin nombre de foto asignado\n\nAvísale a Claude para agregarlas a la lista:\n\n`
    for (const [n, c] of sinMapa) md += `- ${n} (${c})\n`
  }

  const out = path.join(DIR, 'LISTA.md')
  fs.writeFileSync(out, md)
  console.log(`Lista creada: ${path.relative(ROOT, out)}`)
  console.log(`${piezas.size} fotos de piezas · ${kits.length} portadas · fotos ya en la carpeta: ${fotos.size}`)
  if (sinMapa.size) console.log(`Piezas sin nombre de foto: ${[...sinMapa.keys()].join(' | ')}`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
