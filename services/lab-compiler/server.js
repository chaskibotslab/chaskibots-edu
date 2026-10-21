// Servicio compilador del Laboratorio de Robótica (servicio SEPARADO en Railway).
//
// Recibe el sketch del estudiante, lo compila con arduino-cli a un .hex real
// y lo devuelve. El navegador carga ese .hex en un ATmega328P emulado
// (avr8js), así que lo que corre es el mismo binario que correría en la placa.
//
// Sin dependencias npm a propósito: solo módulos de Node. Menos superficie,
// imagen más chica y nada que actualizar.
//
// Seguridad:
//   - Clave compartida (LAB_COMPILER_KEY): el repo es público, sin esto
//     cualquiera podría usar el compilador gratis a costa de Railway.
//   - Límite de tamaño del código, de tiempo (20 s) y de compilaciones
//     simultáneas; rate limit por usuario.
//   - Solo #include <...> de una lista blanca: un #include "/etc/passwd"
//     filtraría el contenido del archivo en los mensajes de error.
//   - Corre como usuario sin privilegios (ver Dockerfile) y con un proxy
//     inexistente para que arduino-cli no pueda salir a internet al compilar.
//   - Caché por hash del código: el mismo sketch no se compila dos veces.

const http = require('http')
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')

const PORT = Number(process.env.PORT || 8080)
const KEY = process.env.LAB_COMPILER_KEY || ''
const CLI = process.env.ARDUINO_CLI || 'arduino-cli'
const MAX_CODE_BYTES = 64 * 1024
const COMPILE_TIMEOUT_MS = 20_000
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT || 2)
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN || 12)
const CACHE_MAX = 300

const BOARDS = {
  uno: 'arduino:avr:uno',
  nano: 'arduino:avr:nano:cpu=atmega328',
  mega: 'arduino:avr:mega:cpu=atmega2560',
}

// Cabeceras permitidas: las del core AVR + las librerías preinstaladas.
const ALLOWED_INCLUDES = new Set([
  'Arduino.h', 'avr/io.h', 'avr/interrupt.h', 'avr/pgmspace.h', 'util/delay.h',
  'stdint.h', 'stdlib.h', 'string.h', 'math.h', 'EEPROM.h', 'SPI.h', 'Wire.h',
  'SoftwareSerial.h', 'Servo.h', 'NewPing.h', 'DHT.h', 'DHT_U.h',
  'Adafruit_Sensor.h', 'Adafruit_GFX.h', 'Adafruit_SSD1306.h', 'Adafruit_I2CDevice.h',
])

if (!KEY) {
  // Falla cerrado: sin clave no aceptamos peticiones.
  console.warn('[lab-compiler] LAB_COMPILER_KEY no configurada: se rechazarán todas las peticiones')
}

// ---------- utilidades ----------

const cache = new Map() // hash -> resultado (Map conserva orden = LRU simple)
function cacheGet(k) {
  const v = cache.get(k)
  if (v) { cache.delete(k); cache.set(k, v) }
  return v
}
function cacheSet(k, v) {
  cache.set(k, v)
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value)
}

const hits = new Map() // usuario -> [timestamps]
function rateLimited(user) {
  const now = Date.now()
  const list = (hits.get(user) || []).filter(t => now - t < 60_000)
  if (list.length >= RATE_LIMIT_PER_MIN) { hits.set(user, list); return true }
  list.push(now)
  hits.set(user, list)
  return false
}

let running = 0
const waiting = []
function acquire() {
  if (running < MAX_CONCURRENT) { running++; return Promise.resolve() }
  return new Promise(resolve => waiting.push(resolve))
}
function release() {
  const next = waiting.shift()
  if (next) next()
  else running--
}

function safeEqual(a, b) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb)
}

// Devuelve un mensaje de error si el código incluye algo fuera de la lista blanca.
function checkIncludes(code) {
  const re = /^\s*#\s*include\s*([<"])([^>"]*)[>"]/gm
  let m
  while ((m = re.exec(code))) {
    const line = code.slice(0, m.index).split('\n').length
    if (m[1] === '"') return { line, message: `Usa #include <...>; los archivos locales no están permitidos en el laboratorio` }
    if (!ALLOWED_INCLUDES.has(m[2].trim())) {
      return { line, message: `La librería <${m[2]}> no está disponible. Permitidas: Servo, Wire, NewPing, DHT, Adafruit_SSD1306, Adafruit_GFX` }
    }
  }
  return null
}

// Convierte la salida de gcc en errores por línea para marcar el editor.
function parseDiagnostics(output) {
  const out = []
  const re = /sketch\.ino:(\d+):(\d+):\s*(fatal error|error|warning|note):\s*(.*)$/gm
  let m
  while ((m = re.exec(output))) {
    if (m[3] === 'note') continue
    out.push({ line: Number(m[1]), col: Number(m[2]), severity: m[3] === 'warning' ? 'warning' : 'error', message: m[4].trim() })
  }
  return out
}

function runCli(args, cwd) {
  return new Promise(resolve => {
    const child = spawn(CLI, args, { cwd, env: process.env })
    let output = ''
    child.stdout.on('data', d => { output += d })
    child.stderr.on('data', d => { output += d })
    const timer = setTimeout(() => { child.kill('SIGKILL'); resolve({ code: -1, output: output + '\nTiempo de compilación agotado (20 s)', timedOut: true }) }, COMPILE_TIMEOUT_MS)
    child.on('close', code => { clearTimeout(timer); resolve({ code, output }) })
    child.on('error', err => { clearTimeout(timer); resolve({ code: -1, output: String(err) }) })
  })
}

async function compile(board, code) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-'))
  const sketchDir = path.join(dir, 'sketch')
  const outDir = path.join(dir, 'out')
  fs.mkdirSync(sketchDir)
  fs.writeFileSync(path.join(sketchDir, 'sketch.ino'), code)
  try {
    const res = await runCli(['compile', '--fqbn', BOARDS[board], '--output-dir', outDir, '--warnings', 'default', sketchDir], dir)
    // Quitar rutas internas del servidor antes de devolver el log.
    const log = res.output.split(dir).join('').split(sketchDir).join('').slice(-8000)
    const diagnostics = parseDiagnostics(res.output)
    if (res.code !== 0) {
      return { ok: false, internal: diagnostics.length === 0, errors: diagnostics.length ? diagnostics : [{ line: 1, col: 1, severity: 'error', message: res.timedOut ? 'Tiempo de compilación agotado' : 'No se pudo compilar' }], log }
    }
    const hexPath = path.join(outDir, 'sketch.ino.hex')
    const hex = fs.readFileSync(hexPath, 'utf8')
    const sizeMatch = /usa (\d+) bytes|uses (\d+) bytes/.exec(res.output)
    return { ok: true, hex, errors: diagnostics, size: sizeMatch ? Number(sizeMatch[1] || sizeMatch[2]) : null, log }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

// ---------- servidor HTTP ----------

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true, cached: cache.size, running })

  if (req.method !== 'POST' || req.url !== '/compile') return send(res, 404, { error: 'No encontrado' })
  if (!KEY || !safeEqual(String(req.headers['x-lab-key'] || ''), KEY)) return send(res, 401, { error: 'No autorizado' })

  const user = String(req.headers['x-user-id'] || 'anon').slice(0, 64)
  if (rateLimited(user)) return send(res, 429, { error: 'Demasiadas compilaciones, espera un minuto' })

  let body = ''
  let tooBig = false
  req.on('data', chunk => {
    body += chunk
    if (body.length > MAX_CODE_BYTES * 2) { tooBig = true; req.destroy() }
  })
  req.on('end', async () => {
    if (tooBig) return
    let parsed
    try { parsed = JSON.parse(body) } catch { return send(res, 400, { error: 'JSON inválido' }) }
    const board = String(parsed.board || 'uno')
    const code = String(parsed.code || '')
    if (!BOARDS[board]) return send(res, 400, { error: `Placa no soportada: ${board}` })
    if (!code.trim()) return send(res, 400, { error: 'El código está vacío' })
    if (Buffer.byteLength(code) > MAX_CODE_BYTES) return send(res, 413, { error: 'El código supera 64 KB' })

    const bad = checkIncludes(code)
    if (bad) return send(res, 200, { ok: false, errors: [{ ...bad, col: 1, severity: 'error' }], log: '' })

    const hash = crypto.createHash('sha256').update(board + '\0' + code).digest('hex')
    const cached = cacheGet(hash)
    if (cached) return send(res, 200, { ...cached, cached: true })

    await acquire()
    try {
      const result = await compile(board, code)
      // Solo se cachean resultados reales del compilador, no fallos internos.
      if (!result.internal) cacheSet(hash, result)
      send(res, 200, result)
    } catch (err) {
      console.error('[lab-compiler]', err)
      send(res, 500, { error: 'Error interno del compilador' })
    } finally {
      release()
    }
  })
})

server.listen(PORT, () => console.log(`[lab-compiler] escuchando en :${PORT}`))
