/**
 * Fotos de los kits desde las carpetas fotos/ y materiales/ del proyecto.
 *
 * materiales/: fotos con el nombre de la tienda; DESDE_MATERIALES dice a qué pieza y
 * material va cada una (ver abajo). fotos/: nombres de LISTA.md; si coinciden, mandan.
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

const EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
const MATERIALES_DIR = path.join(ROOT, 'materiales')

// Carpeta materiales/: fotos con el nombre que traían de la tienda. Cada una va a las
// piezas de las guías (pieza-…) y a los materiales del catálogo (columna materiales.foto_url).
// [archivo sin extensión, en minúsculas] → [piezas de guía, materiales del catálogo]
const DESDE_MATERIALES = [
  ['ar0355-buzzer-pasivo-v1-1-1024x1024', ['buzzer-pasivo'], ['buzzer-pasivo']],
  ['micro-servo-9g-sg90', ['servo-sg90'], ['servo-sg90']],
  ['supermini-esp32-c3', ['esp32-c3'], ['board-esp32-c3']],
  ['esp32', ['esp32-devkit'], ['board-esp32-devkit']],
  ['arduino nano', ['arduino-nano'], ['board-nano-v3', 'board-nano-v3-microusb']],
  ['arduino uno', ['arduino-uno'], ['board-uno-r3']],
  ['bateria', [], ['bateria-9v']],
  ['portabateria', [], ['portabateria-9v-broche', 'conector-bateria-9v']],
  ['portabateriaconjack', [], ['portabateria-9v']],
  ['boquilla', [], ['boquilla-e27']],
  ['cable gemelo', [], ['cable-gemelo']],
  ['cables jumper ok', ['cables-jumper'], ['jumper-mm', 'jumper-mh', 'jumper-hh']],
  ['cable-usb-tipo-arduinouno', [], ['cable-usb-ab']],
  ['cabletipoc', [], ['cable-usbc-datos']],
  ['cablev8', [], ['cable-usb-v8']],
  ['cautin', [], ['cautin']],
  ['estaño', [], ['estano']],
  ['enchufe', [], ['enchufe']],
  ['dht11', ['sensor-dht11'], ['sensor-dht11-modulo']],
  ['hc-sr501-pir-motion-sensor', ['sensor-pir'], ['sensor-pir-hcsr501']],
  ['lcd16x2', ['lcd-16x2-i2c'], ['lcd-16x2-i2c']],
  ['ldr', ['ldr'], ['ldr-2-patas']],
  ['leds', ['leds-colores', 'led'], ['led-generico']],
  ['manguera', [], ['manguera-silicona']],
  ['md-rele-5v-1ch-optoacoplador', ['rele-optoacoplador', 'rele-1-canal'], ['rele-1canal-opto', 'rele-1canal']],
  ['potenciometro ok', ['potenciometro-10k', 'potenciometro-5k'], ['potenciometro-10k', 'potenciometro-5k']],
  ['protoboard', ['protoboard'], ['protoboard-400', 'protoboard']],
  ['pulsador', ['pulsador'], ['pulsador']],
  ['resistencia', ['resistencia-470', 'resistencia-1k', 'resistencia-330', 'resistencia-4k7', 'resistencia-22k', 'resistencias-surtidas'],
    ['resistencia-470', 'resistencia-1k', 'resistencia-330', 'resistencia-4k7', 'resistencia-22k', 'resistencia-10k', 'resistencia-220-330', 'resistencia-led-kit7', 'resistencia-surtida']],
  ['sensordehumedad', ['sensor-humedad-suelo'], ['sensor-humedad-suelo']],
  ['sensorinfrarojo', [], ['sensor-ir-fc51']],
  ['3904', ['transistor-2n3904'], ['transistor-2n3904']],
  ['cr2032', ['pila-cr2032'], ['pila-cr2032']],
  ['led', ['led-blanco'], ['led-blanco']], // LED transparente: el blanco apagado
  ['display 7 segmentos', ['display-7-segmentos'], ['display-7seg']],
  ['dipswitch', ['dip-switch'], ['dip-switch']],
  ['capacitor', ['condensadores'], ['condensador-470uf', 'condensador-100uf']],
  ['cinta de cobre', ['cinta-cobre'], ['cinta-cobre']],
  ['baso de agua', ['vaso-agua-sal'], []],
  ['sensorultrasonico',['sensor-ultrasonico-hcsr04', 'sensor-ultrasonico-hcsr04p'], ['sensor-ultrasonico-hcsr04', 'sensor-hcsr04p']],
]
// Versiones repetidas que no se usan: vale la que termina en "ok".
const IGNORAR = ['cable-jumper-dupont-hembra-a-macho-20cm-20und', 'potenciometro']

// Fotos armadas a partir de otras de materiales/.
// La de los LED trae 5 colores en fila: se recorta cada uno (izq, der, alto en fracción de la foto).
const RECORTES_LED = { rojo: [0.585, 0.765, 0.58], verde: [0.245, 0.425, 0.6], amarillo: [0.435, 0.59, 0.6], azul: [0.02, 0.235, 0.58] }
const DERIVADAS = [
  ...Object.entries(RECORTES_LED).map(([color, recorte]) => ({
    id: `led-${color}`, de: ['leds'], recorte, materiales: [`led-${color}`],
    // Ninguna guía nombra un LED azul suelto: ese solo va a la lista de materiales
    piezas: color === 'azul' ? [] : [`led-${color}`],
  })),
  // La guía dice "Batería de 9 V con portabatería": las dos piezas juntas
  { id: 'bateria-con-portabateria', de: ['bateria', 'portabateria'], piezas: ['bateria-9v'], materiales: [] },
]

function archivosEn(dir) {
  const map = new Map()
  if (!fs.existsSync(dir)) return map
  for (const f of fs.readdirSync(dir)) {
    if (!EXT.includes(path.extname(f).toLowerCase())) continue
    map.set(path.basename(f, path.extname(f)).toLowerCase(), path.join(dir, f))
  }
  return map
}

const optimizar = img => img.rotate()
  .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
  .flatten({ background: '#ffffff' })
  .webp({ quality: 80 })
  .toBuffer()

// Todas las fotos a subir: { id, cargar(sharp) → Buffer, nombres: ['pieza-…', 'material-…', 'kit-…'] }
function fuentes() {
  const enMateriales = archivosEn(MATERIALES_DIR)
  const lista = []
  const ocupados = new Set()
  // fotos/ manda: si tienes pieza-led-rojo.jpg ahí, gana sobre el recorte de materiales/
  for (const [nombre, archivo] of archivosEn(DIR)) {
    lista.push({ id: nombre, cargar: sharp => optimizar(sharp(archivo)), nombres: [nombre] })
    ocupados.add(nombre)
  }
  const libres = ns => ns.filter(n => !ocupados.has(n))
  for (const [archivo, piezas, mats] of DESDE_MATERIALES) {
    const ruta = enMateriales.get(archivo)
    if (!ruta) continue
    const nombres = libres([...piezas.map(k => `pieza-${k}`), ...mats.map(m => `material-${m}`)])
    if (nombres.length) lista.push({ id: `mat-${archivo.replace(/[^a-z0-9]+/g, '-')}`, cargar: sharp => optimizar(sharp(ruta)), nombres })
  }
  for (const d of DERIVADAS) {
    const rutas = d.de.map(n => enMateriales.get(n))
    if (rutas.some(r => !r)) continue
    const nombres = libres([...d.piezas.map(k => `pieza-${k}`), ...d.materiales.map(m => `material-${m}`)])
    if (!nombres.length) continue
    lista.push({
      id: `mat-${d.id}`,
      nombres,
      cargar: async sharp => {
        if (d.recorte) {
          const [izq, der, alto] = d.recorte
          const m = await sharp(rutas[0]).metadata()
          const width = Math.round((der - izq) * m.width)
          return optimizar(sharp(await sharp(rutas[0])
            .extract({ left: Math.round(izq * m.width), top: 0, width, height: Math.round(alto * m.height) })
            .extend({ left: 40, right: 40, top: 10, bottom: 10, background: '#ffffff' })
            .png().toBuffer()))
        }
        // Lado a lado, a la misma altura, sobre fondo blanco
        const partes = await Promise.all(rutas.map(r => sharp(r).flatten({ background: '#ffffff' }).resize({ height: 700 }).png().toBuffer()))
        const anchos = await Promise.all(partes.map(async b => (await sharp(b).metadata()).width))
        const sep = 40
        const total = anchos.reduce((a, w) => a + w, 0) + sep * (partes.length + 1)
        let x = sep
        const capas = partes.map((input, i) => { const c = { input, left: x, top: 40 }; x += anchos[i] + sep; return c })
        return optimizar(sharp(await sharp({ create: { width: total, height: 780, channels: 3, background: '#ffffff' } }).composite(capas).png().toBuffer()))
      },
    })
  }
  const sinUsar = [...enMateriales.keys()].filter(n =>
    !IGNORAR.includes(n) && !DESDE_MATERIALES.some(([a]) => a === n) && !DERIVADAS.some(d => d.de.includes(n)))
  const descargasIncompletas = fs.existsSync(MATERIALES_DIR)
    ? fs.readdirSync(MATERIALES_DIR).filter(f => /\.(crdownload|part|tmp)$/i.test(f)) : []
  return { lista, sinUsar, descargasIncompletas }
}

// Solo se reemplaza una foto vacía o puesta por este script; nunca una puesta a mano.
const esNuestra = url => !url || url.startsWith(PUBLIC_PREFIX)

async function main() {
  const proyectos = await rest('GET', 'kit_proyectos?select=id,kit_id,slug,titulo,tipo,orden,guia&kit_id=like.kit-lv-*&order=kit_id,orden')
  const kits = await rest('GET', 'kits?select=id,name,image_url&id=like.kit-lv-*')
  const { lista, sinUsar, descargasIncompletas } = fuentes()
  const disponibles = new Set(lista.flatMap(f => f.nombres))

  const avisos = () => {
    if (sinUsar.length) console.log(`\nATENCIÓN, fotos de materiales/ que no sé a qué pieza corresponden (avísale a Claude):\n  ${sinUsar.join('\n  ')}`)
    if (descargasIncompletas.length) console.log(`\nDescargas sin terminar en materiales/ (se ignoran): ${descargasIncompletas.join(', ')}`)
  }

  if (LISTA) { escribirLista(proyectos, kits, disponibles); return avisos() }
  if (lista.length === 0) return console.log('No hay fotos en fotos/ ni en materiales/. Usa --lista para ver los nombres.')

  // --prueba <carpeta>: procesa todo y deja los .webp ahí, sin subir nada
  const iPrueba = process.argv.indexOf('--prueba')
  if (iPrueba > -1) {
    const destino = process.argv[iPrueba + 1]
    fs.mkdirSync(destino, { recursive: true })
    const sharp = require('sharp')
    for (const f of lista) {
      const buf = await f.cargar(sharp)
      fs.writeFileSync(path.join(destino, `${f.id}.webp`), buf)
      console.log(`${f.id}.webp  ${Math.round(buf.length / 1024)} KB → ${f.nombres.join(', ')}`)
    }
    return avisos()
  }

  // ¿Existe ya la columna materiales.foto_url? (supabase/migrations/2026_10_materiales_foto.sql)
  let materiales = null
  try { materiales = await rest('GET', 'materiales?select=id,foto_url') } catch {
    console.log('AVISO: falta la columna de fotos de materiales. Ejecuta en Supabase supabase/migrations/2026_10_materiales_foto.sql y vuelve a correr este script. Por ahora solo se ponen las fotos de las guías.\n')
  }

  const sharp = require('sharp')
  await asegurarBucket()

  const urls = new Map()
  for (const f of lista) {
    const buf = await f.cargar(sharp)
    const huella = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8)
    const destino = `${f.id}-${huella}.webp`
    const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${encodeURIComponent(destino)}`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'image/webp', 'x-upsert': 'true', 'Cache-Control': 'max-age=31536000' },
      body: buf,
    })
    if (!res.ok) throw new Error(`No se pudo subir ${f.id}: ${res.status} ${(await res.text()).slice(0, 200)}`)
    for (const n of f.nombres) urls.set(n, PUBLIC_PREFIX + encodeURIComponent(destino))
    console.log(`subida  ${f.id}  (${Math.round(buf.length / 1024)} KB) → ${f.nombres.length} ${f.nombres.length === 1 ? 'lugar' : 'lugares'}`)
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
      if (!url || !obj) return
      usadas.add(nombre)
      if (!esNuestra(obj.fotoUrl) || obj.fotoUrl === url) return
      obj.fotoUrl = url
      cambio = true
    }
    for (const pz of g.piezas || []) {
      const { key } = fotoDePieza(pz.nombre)
      if (key) poner(pz, `pieza-${key}`)
    }
    poner(g.reto, `proyecto-${base}`)
    ;(g.pasos || []).forEach((paso, i) => poner(paso, `paso-${base}--${i + 1}`))
    if (cambio) cambiosGuia.push({ id: p.id, antes: p.guia, guia: g })
  }

  const cambiosKit = []
  for (const k of kits) {
    const nombre = `kit-${grado(k.id)}`
    const url = urls.get(nombre)
    if (!url) continue
    usadas.add(nombre)
    if (esNuestra(k.image_url) && k.image_url !== url) cambiosKit.push({ id: k.id, antes: k.image_url, image_url: url })
  }

  const cambiosMaterial = []
  for (const m of materiales || []) {
    const nombre = `material-${m.id}`
    const url = urls.get(nombre)
    if (!url) continue
    usadas.add(nombre)
    if (esNuestra(m.foto_url) && m.foto_url !== url) cambiosMaterial.push({ id: m.id, antes: m.foto_url, foto_url: url })
  }

  const dir = path.join(ROOT, 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const copia = path.join(dir, `fotos-kits-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(copia, JSON.stringify({
    guias: cambiosGuia.map(c => ({ id: c.id, guia: c.antes })),
    kits: cambiosKit.map(c => ({ id: c.id, image_url: c.antes })),
    materiales: cambiosMaterial.map(c => ({ id: c.id, foto_url: c.antes })),
  }))

  for (const c of cambiosGuia) await rest('PATCH', `kit_proyectos?id=eq.${c.id}`, { guia: c.guia })
  for (const c of cambiosKit) await rest('PATCH', `kits?id=eq.${c.id}`, { image_url: c.image_url })
  for (const c of cambiosMaterial) await rest('PATCH', `materiales?id=eq.${encodeURIComponent(c.id)}`, { foto_url: c.foto_url })

  console.log(`\nGuías actualizadas: ${cambiosGuia.length} · portadas de kit: ${cambiosKit.length} · materiales con foto: ${cambiosMaterial.length}`)
  const sinLugar = [...urls.keys()].filter(n => !usadas.has(n) && !(n.startsWith('material-') && !materiales))
  if (sinLugar.length) console.log(`\nATENCIÓN, estos nombres no coinciden con ningún lugar (revisa cómo se escriben):\n  ${sinLugar.join('\n  ')}`)
  avisos()
  console.log(`\nCopia de lo anterior: ${path.relative(ROOT, copia)}`)
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

function escribirLista(proyectos, kits, disponibles) {
  fs.mkdirSync(DIR, { recursive: true })
  const tiene = n => (disponibles.has(n) ? '✅' : '⬜')

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
  console.log(`${piezas.size} fotos de piezas · ${kits.length} portadas · fotos disponibles: ${disponibles.size}`)
  if (sinMapa.size) console.log(`Piezas sin nombre de foto: ${[...sinMapa.keys()].join(' | ')}`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
