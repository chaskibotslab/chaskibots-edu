/**
 * COPOL — lecciones de los seis kits que no tenían (Inicial 1, Inicial 2, 4to, 5to, 6to, 7mo).
 *
 *   6to EGB  = kit de 8vo de la Academia (semáforo) pasado a ESP32 DevKit V1 de 30 pines.
 *   7mo EGB  = kit de 9no de la Academia (basurero) pasado a ESP32 DevKit V1 de 30 pines.
 *   Inicial 1/2 = lecciones de cinta de cobre de la Academia + kit de madera (eólico / carro solar).
 *   4to / 5to   = kits de madera (tragamonedas / carro radiocontrolado), en scripts/guias/copol-madera.js.
 *
 * Reglas del paso a ESP32:
 *   - Los pines de señal trabajan a 3,3 V: sensores y potenciómetro van a 3V3 (línea roja).
 *   - El servomotor es la única pieza que va a VIN (5 V del USB), directo, sin pasar por la línea roja.
 *   - Lecturas analógicas de 0 a 4095, Serial a 115200, librería ESP32Servo.
 *   - Sin batería de 9 V: se alimenta por el cable V8 (computadora o cargador de celular).
 *   - Las conexiones conservan su orden: los pasos de las guías siguen apuntando bien.
 *
 * Uso (el volcado de la Academia se saca en solo lectura; ver cabecera de cada kit en el JSON):
 *   node scripts/copol-lecciones.js <volcado.json> [carpeta-para-sketches]
 * Genera supabase/migrations/2026_11_copol_fase2_lecciones.sql para pegarlo en Supabase.
 */
const fs = require('fs')
const path = require('path')
const MADERA = require('./guias/copol-madera.js')

const dump = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const sketchDir = process.argv[3]

const ESP = {
  'kit-lv-octavo-egb': { grado: '6to', pines: { 8: 'GPIO25', 9: 'GPIO26', 10: 'GPIO33', 2: 'GPIO27', 7: 'GPIO13', 4: 'GPIO14', 5: 'GPIO32', 6: 'GPIO18', A0: 'GPIO34' } },
  'kit-lv-noveno-egb': { grado: '7mo', pines: { 8: 'GPIO25', 9: 'GPIO22', 10: 'GPIO23', 6: 'GPIO18', 2: 'GPIO27', A0: 'GPIO34' } },
}

const SUBIR = 'En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en "Connecting…", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.'
const COLOCA = { titulo: 'Coloca el ESP32', texto: 'Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.', consejo: 'Si ya quedó puesto de la clase anterior, déjalo donde está.' }

// ---- Código ---------------------------------------------------------------
function codigo(src, cfg) {
  const gpio = v => cfg.pines[v].replace('GPIO', '')
  let s = src
    .replace(/^(\s*)Kit (8vo|9no) EGB - Arduino (UNO R3|Nano V3)/m, `$1Kit ${cfg.grado} EGB - ESP32 DevKit V1 (30 pines)`)
    .replace(/^\s*Academia Militar Lizardo Alfonzo Villamarin\r?\n/m, '  En Arduino IDE: Placa "ESP32 Dev Module".\n')
    .replace(/#include <Servo\.h>/g, '#include <ESP32Servo.h>  // instala la libreria ESP32Servo')
    .replace(/Serial\.begin\(9600\)/g, 'Serial.begin(115200)')
    .replace(/0, 1023,/g, '0, 4095,')
    .replace(/^(const int (\w+) = )(\d+|A0);/gm, (m, pre, nombre, v) =>
      /DISTANCIA|ANGULO|TIEMPO|_CM|_MS|PAUSA|UMBRAL/.test(nombre) || !(v in cfg.pines) ? m : `${pre}${gpio(v)};`)
  return s
}

// ---- Texto de las guías ---------------------------------------------------
function texto(s, cfg) {
  const pin = v => cfg.pines[v] || `D${v}`
  return s
    .replace(/Conecta el Arduino UNO a la computadora con el cable USB\. Debe encenderse la luz verde marcada ON en la placa/g, 'Conecta el ESP32 a la computadora con el cable V8 (Micro-USB). Debe encenderse una luz roja en la placa')
    .replace(/con el cable Mini-USB\. Debe encenderse una luz pequeña/g, 'con el cable V8 (Micro-USB). Debe encenderse una luz roja')
    .replace(/programa Arduino/g, 'Arduino¤IDE').replace(/Arduino IDE/g, 'Arduino¤IDE')
    .replace(/aprende Arduino/g, 'aprende a programar placas electrónicas')
    .replace(/Arduino (UNO|Uno|Nano)/g, 'ESP32').replace(/\bNano\b/g, 'ESP32').replace(/\bArduino\b/g, 'ESP32')
    .replace(/Arduino¤IDE/g, 'Arduino IDE')
    .replace(/\b(pin|pines) D?(\d+)\b/g, (m, p, v) => `${p} ${pin(v)}`)
    .replace(/\bD(\d+)\b/g, (m, v) => pin(v))
    .replace(/\bA0\b/g, cfg.pines.A0)
    .replace(/\(5V en el pin\)/g, '(3,3 V en el pin)').replace(/\(0V\)/g, '(0 V)')
    .replace(/directo a 5V sin resistencia/g, 'directo a la placa sin resistencia')
    .replace(/pin 5V/g, 'pin 3V3').replace(/para 5V/g, 'para 3,3 V').replace(/a 5V y GND/g, 'a 3V3 y GND')
    .replace(/rojo es 5V/gi, m => `${m[0] === 'R' ? 'Rojo' : 'rojo'} es 5 V (pin VIN)`)
    .replace(/9600/g, '115200').replace(/1023/g, '4095')
}

const mapa = (o, f) => typeof o === 'string' ? f(o) : Array.isArray(o) ? o.map(x => mapa(x, f)) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k === 'fotoUrl' ? v : mapa(v, f)])) : o

// Ajustes a mano donde cambia el montaje (servo a VIN, sensor a 3V3).
const AJUSTES = {
  'practica-servomotor': g => {
    g.pasos[0] = { ...g.pasos[0], titulo: 'Lleva tierra a la línea negra', texto: 'Con un cable negro une un pin GND del ESP32 con la línea negra (–) de la protoboard.', rieles: ['GND'] }
    g.pasos[1].texto = 'Inserta un jumper en cada agujero del conector del servo. El del cable rojo va directo al pin VIN del ESP32 (por ahí salen los 5 V del USB) y el del cable café va a la línea negra (–).'
    g.pasos[1].consejo = 'El servo es la única pieza que va a VIN: necesita 5 V. Si lo conectas a 3V3 le falta fuerza y la placa se reinicia.'
    const sn = g.prueba.siNoFunciona
    sn[0].revisa = 'Revisa los colores: rojo al pin VIN, café a la línea negra y naranja a GPIO18. Comprueba que la línea negra llega a GND del ESP32.'
    sn[1].revisa = 'Le falta corriente. Comprueba que el cable rojo va a VIN y no a 3V3, y prueba con otro puerto USB o con un cargador de celular de al menos 1 A.'
    sn[2].revisa = 'El motor consume mucho al empezar a moverse. Usa un cable USB corto y en buen estado, o un cargador de celular de al menos 1 A.'
    sn[3] = { problema: 'Da error "ESP32Servo.h: No such file"', revisa: 'Falta la librería. En Arduino IDE abre Herramientas > Administrar bibliotecas, busca ESP32Servo e instálala.' }
  },
  'practica-sensor-distancia': g => {
    g.piezas[0].cuidado = 'Aquí se alimenta con 3,3 V, no con 5 V: así su respuesta (Echo) no daña al ESP32.'
    g.prueba.siNoFunciona[0].revisa += ' Si están bien y sigue en 0, tu sensor puede ser un modelo que solo trabaja con 5 V: avisa a tu docente.'
  },
  'basurero-inteligente': g => {
    g.pasos[0].texto = 'Une el pin 3V3 del ESP32 con la línea roja (+) de la protoboard y un pin GND con la línea negra (–). El sensor tomará energía de la línea roja. El servo no: él va directo a VIN.'
    g.pasos[0].consejo = 'Cable rojo para corriente y negro para tierra. Hazlo siempre igual y evitarás la mayoría de errores.'
    g.pasos[3].texto = 'Con dos jumper, lleva el cable rojo del servo directo al pin VIN del ESP32 (5 V del USB) y el cable café a la línea negra.'
    g.pasos[3].consejo = 'El servo nunca va a la línea roja de 3,3 V: se queda sin fuerza.'
    g.piezas[0].cuidado = 'Pines en orden: VCC, Trig, Echo, GND. Aquí se alimenta con 3,3 V, no con 5 V.'
    g.piezas[4].paraQue = 'Sostienen las piezas y reparten 3,3 V y tierra.'
    const r = g.prueba.siNoFunciona.find(x => /reinicia/.test(x.problema))
    r.revisa = 'El servo pide más corriente de la que da el USB cuando levanta peso. Aligera la tapa y alimenta la placa con un cargador de celular de al menos 1 A.'
  },
}

function guia(slug, g0, cfg) {
  const g = mapa(JSON.parse(JSON.stringify(g0)), s => texto(s, cfg))
  for (const p of g.piezas || []) if (p.nombre === 'ESP32') {
    p.nombre = 'ESP32 DevKit V1 (30 pines)'
    delete p.fotoUrl
    if (!p.cuidado) p.cuidado = 'Sus pines trabajan a 3,3 V. Nunca conectes 5 V a un pin de señal.'
  }
  for (const p of g.pasos || []) if (p.rieles) p.rieles = p.rieles.map(r => r === '5V' ? '3V3' : r)
  for (const c of g.codigo || []) if (c.fragmento) c.fragmento = codigo(c.fragmento, cfg)
  for (const x of g.prueba?.siNoFunciona || []) {
    if (x.problema === 'El programa no se sube') x.revisa = SUBIR
    if (/no detecta el ESP32/.test(x.problema)) x.revisa = 'Instala el controlador CP210x o CH340 con ayuda de tu docente y prueba con otro cable: algunos cables V8 solo cargan.'
  }
  AJUSTES[slug]?.(g)
  if (!/^Coloca el/.test(g.pasos[0].titulo)) g.pasos.unshift({ ...COLOCA })
  return g
}

function conexion(c, cfg) {
  let pin = c.pin_placa, nota = c.nota
  const m = /^D(\d+)$/.exec(pin)
  if (m) pin = cfg.pines[m[1]]
  else if (pin === 'A0') { pin = cfg.pines.A0; nota = nota || 'solo entrada' }
  else if (pin === '5V') pin = /SERVO/.test(c.componente) ? 'VIN' : '3V3'
  if (nota === 'PWM') nota = /SERVO/.test(c.componente) ? '5 V del USB solo en VCC' : null
  if (nota) nota = nota.replace(/^PWM, /, '')
  if (pin === 'VIN') nota = '5 V del USB'
  return [c.componente, c.pin_componente, pin, nota || null, c.orden]
}

// ---- Armado de los seis kits ---------------------------------------------
const slugCopol = s => s.startsWith('copol-') ? s : `copol-${s}`
const KITS = {}

for (const [lv, destino] of [['kit-lv-octavo-egb', 'kit-copol-sexto-egb'], ['kit-lv-noveno-egb', 'kit-copol-septimo-egb']]) {
  const cfg = ESP[lv]
  KITS[destino] = dump[lv].proyectos.map(p => ({
    slug: slugCopol(p.slug), titulo: p.titulo, tipo: p.tipo, orden: p.orden,
    descripcion: texto(p.descripcion || '', cfg), objetivos: (p.objetivos || []).map(o => texto(o, cfg)),
    guia: p.guia ? guia(p.slug, p.guia, cfg) : null,
    conexiones: p.conexiones.map(c => conexion(c, cfg)),
    codigo: p.codigos[0] ? codigo(p.codigos[0].contenido, cfg) : null,
  }))
}

// Inicial: primero las 4 lecciones de cobre de la Academia (todas como práctica), luego el kit de madera.
for (const [lv, destino] of [['kit-lv-inicial-1', 'kit-copol-inicial-1'], ['kit-lv-inicial-2', 'kit-copol-inicial-2']]) {
  KITS[destino] = dump[lv].proyectos.map((p, i) => ({
    slug: slugCopol(p.slug), titulo: p.titulo, tipo: 'practica', orden: -7 + i,
    descripcion: p.descripcion, objetivos: p.objetivos || [], guia: p.guia, conexiones: [], codigo: null,
  }))
}
// En copol-madera.js la respuesta correcta se escribe siempre primera; aquí se reparte
// entre las posiciones para que el estudiante no la adivine por el lugar.
let turno = 0
for (const lista of Object.values(MADERA)) for (const p of lista) for (const pr of p[6].demuestra.preguntas) {
  const pos = turno++ % pr.opciones.length
  const [buena] = pr.opciones.splice(pr.correcta, 1)
  pr.opciones.splice(pos, 0, buena)
  pr.correcta = pos
}
for (const [kit, lista] of Object.entries(MADERA)) {
  KITS[kit] = (KITS[kit] || []).concat(lista.map(([slug, titulo, tipo, orden, descripcion, objetivos, g]) => ({
    slug: slugCopol(slug), titulo, tipo, orden, descripcion, objetivos, guia: g, conexiones: [], codigo: null,
  })))
}

const NUEVOS = [
  ['kit-madera-eolico', 'Kit de madera: generador eólico', 'componente'],
  ['kit-madera-carro-solar', 'Kit de madera: carro solar', 'componente'],
  ['kit-madera-tragamonedas', 'Kit de madera: tragamonedas', 'componente'],
  ['kit-madera-carro-rc', 'Kit de madera: carro radiocontrolado', 'componente'],
]
const CAJA = 'Contenido según el instructivo de la caja'
const cobre = lv => dump[lv].materiales.map(m => [m.material_id, m.cantidad, m.nota])
const esp = (lv, fuera, cable) => dump[lv].materiales
  .filter(m => !fuera.includes(m.material_id))
  .map(m => /^board-/.test(m.material_id) ? ['board-esp32-devkit', 1, null] : m.material_id === cable ? ['cable-usb-v8', 1, null] : [m.material_id, m.cantidad ?? 1, m.nota])

const MATERIALES = {
  'kit-copol-inicial-1': [['kit-madera-eolico', 1, CAJA], ...cobre('kit-lv-inicial-1')],
  'kit-copol-inicial-2': [['kit-madera-carro-solar', 1, CAJA], ...cobre('kit-lv-inicial-2')],
  'kit-copol-cuarto-egb': [['kit-madera-tragamonedas', 1, CAJA]],
  'kit-copol-quinto-egb': [['kit-madera-carro-rc', 1, CAJA + ' (pilas no incluidas, salvo que la caja diga lo contrario)']],
  'kit-copol-sexto-egb': esp('kit-lv-octavo-egb', ['bateria-9v', 'portabateria-9v'], 'cable-usb-ab'),
  'kit-copol-septimo-egb': esp('kit-lv-noveno-egb', ['bateria-9v', 'conector-bateria-9v'], 'cable-usb-mini'),
}

const SEG_COBRE = dump['kit-lv-inicial-1'].kit.advertencia_seguridad
const ESP_ALIM = 'Cable USB V8 (Micro-USB): se programa y se alimenta desde la computadora o desde un cargador de celular de al menos 1 A (cargador NO incluido).'
const ESP_NOTA = 'ESP32 DevKit V1 de 30 pines. Sus pines de señal trabajan a 3,3 V: sensores y potenciómetro van a 3V3. El servomotor es la única pieza que va a VIN (5 V del USB). Pulsadores con INPUT_PULLUP (sin resistencia). En Arduino IDE: placa "ESP32 Dev Module", Monitor Serial a 115200.'
const CAMPOS = {
  'kit-copol-inicial-1': { alimentacion: 'El viento mueve el generador. Pila de botón CR2032 (3 V) para las lecciones de cinta de cobre.', advertencia_seguridad: SEG_COBRE + ' El ventilador o el secador los maneja solo el docente.', notas: 'Primero las 4 lecciones de cinta de cobre y después el kit de madera. Las lecciones de madera siguen el instructivo de la caja.' },
  'kit-copol-inicial-2': { alimentacion: 'Panel solar (luz directa del sol). Pila de botón CR2032 (3 V) para las lecciones de cinta de cobre.', advertencia_seguridad: SEG_COBRE + ' Al patio con gorra; nunca se mira directo al sol.', notas: 'Primero las 4 lecciones de cinta de cobre y después el kit de madera. Las lecciones de madera siguen el instructivo de la caja.' },
  'kit-copol-cuarto-egb': { alimentacion: 'No usa electricidad: funciona con el peso de la moneda.', advertencia_seguridad: 'Las piezas pequeñas se guardan en la caja. La goma y la lija se usan con supervisión.', notas: 'Las lecciones siguen el instructivo de la caja para el orden exacto de las piezas.' },
  'kit-copol-quinto-egb': { alimentacion: 'Pilas en el portapilas del carro y en el control remoto.', advertencia_seguridad: 'Las pilas las entrega y las recoge el docente. Si algo se calienta, se apaga y se sacan las pilas.', notas: 'Las lecciones siguen el instructivo de la caja para el cableado del receptor.' },
  'kit-copol-sexto-egb': { placa_id: 'placa-esp32-devkit-v1', alimentacion: ESP_ALIM, advertencia_seguridad: 'Nunca conectes 5 V a un pin de señal del ESP32.', notas: ESP_NOTA + ' Solo 3 resistencias: máximo 3 LEDs encendidos a la vez.' },
  'kit-copol-septimo-egb': { placa_id: 'placa-esp32-devkit-v1', alimentacion: ESP_ALIM, advertencia_seguridad: 'Nunca conectes 5 V a un pin de señal del ESP32. El sensor ultrasónico va a 3V3.', notas: ESP_NOTA + ' El sensor HC-SR04 se alimenta a 3V3 para que su pin Echo no entregue 5 V a la placa.' },
}

// ---- SQL ------------------------------------------------------------------
const q = s => s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`
const dq = s => { if (s.includes('$cp$')) throw new Error('delimitador en el contenido'); return `$cp$${s}$cp$` }
const arr = a => a.length ? `ARRAY[${a.map(q).join(', ')}]::text[]` : `'{}'::text[]`
const ids = Object.keys(KITS).map(q).join(', ')
const L = []
L.push('-- COPOL fase 2: lecciones de Inicial 1, Inicial 2, 4to, 5to, 6to y 7mo.')
L.push('-- Generado por scripts/copol-lecciones.js. Se puede ejecutar más de una vez:')
L.push('-- OJO: reescribe las lecciones de estos seis kits (se pierden las fotos o cambios hechos a mano en ellos).')
L.push('BEGIN;', '')
L.push(`INSERT INTO materiales (id, nombre, categoria) VALUES\n${NUEVOS.map(m => `  (${m.map(q).join(', ')})`).join(',\n')}\nON CONFLICT (id) DO NOTHING;`, '')
L.push(`DELETE FROM kit_conexiones WHERE proyecto_id IN (SELECT id FROM kit_proyectos WHERE kit_id IN (${ids}));`)
L.push(`DELETE FROM kit_codigos WHERE proyecto_id IN (SELECT id FROM kit_proyectos WHERE kit_id IN (${ids}));`)
L.push(`DELETE FROM kit_proyectos WHERE kit_id IN (${ids});`)
L.push(`DELETE FROM kit_materiales WHERE kit_id IN (${ids});`, '')

for (const [kit, proyectos] of Object.entries(KITS)) {
  L.push(`-- ===== ${kit} =====`)
  const c = CAMPOS[kit]
  L.push(`UPDATE kits SET ${Object.entries(c).map(([k, v]) => `${k} = ${q(v)}`).join(', ')}, visible = true WHERE id = ${q(kit)};`)
  L.push(`INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES\n${MATERIALES[kit].map(([m, n, nota]) => `  (${q(kit)}, ${q(m)}, ${n == null ? 'NULL' : n}, ${q(nota)}, true)`).join(',\n')};`)
  for (const p of proyectos) {
    L.push(`INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES (${q(kit)}, ${q(p.titulo)}, ${q(p.slug)}, ${q(p.tipo)}, ${q(p.descripcion)}, ${arr(p.objetivos)}, ${p.orden}, ${p.guia ? dq(JSON.stringify(p.guia)) + '::jsonb' : 'NULL'});`)
    const pid = `(SELECT id FROM kit_proyectos WHERE kit_id = ${q(kit)} AND slug = ${q(p.slug)})`
    if (p.conexiones.length) L.push(`INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES\n${p.conexiones.map(([a, b, pin, nota, o]) => `  (${pid}, ${q(a)}, ${q(b)}, ${q(pin)}, ${q(nota)}, ${o})`).join(',\n')};`)
    if (p.codigo) L.push(`INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES (${pid}, 'arduino', ${dq(p.codigo)}, 1);`)
  }
  L.push('')
}
L.push('COMMIT;', '')
L.push('-- Comprobación')
L.push(`SELECT k.id, k.price, k.visible, k.placa_id,
  (SELECT count(*) FROM kit_proyectos p WHERE p.kit_id = k.id) AS lecciones,
  (SELECT count(*) FROM kit_proyectos p WHERE p.kit_id = k.id AND p.guia IS NOT NULL) AS con_guia,
  (SELECT count(*) FROM kit_materiales m WHERE m.kit_id = k.id) AS materiales
FROM kits k WHERE k.school_id = 'school-copol' ORDER BY k.level_id;`)

const out = path.join(__dirname, '..', 'supabase', 'migrations', '2026_11_copol_fase2_lecciones.sql')
fs.writeFileSync(out, L.join('\n') + '\n')

// ---- Informe y sketches para compilar ------------------------------------
for (const [kit, ps] of Object.entries(KITS)) {
  console.log(`${kit}: ${ps.length} lecciones (${ps.filter(p => p.guia).length} con guía), ${MATERIALES[kit].length} materiales`)
  for (const p of ps) {
    const dup = p.conexiones.map(c => c[4]); if (new Set(dup).size !== dup.length) console.log('   ¡orden repetido!', p.slug)
    if (p.codigo && sketchDir) {
      const n = `${kit.replace('kit-copol-', '')}_${p.slug.replace(/-/g, '_')}`
      fs.mkdirSync(path.join(sketchDir, n), { recursive: true })
      fs.writeFileSync(path.join(sketchDir, n, `${n}.ino`), p.codigo)
    }
  }
}
if (process.argv.includes('--revisar')) {
  const ver = (o, f, p = '') => typeof o === 'string' ? f(o, p) : Array.isArray(o) ? o.forEach((x, i) => ver(x, f, `${p}[${i}]`)) : o && typeof o === 'object' ? Object.entries(o).forEach(([k, v]) => ver(v, f, `${p}.${k}`)) : 0
  for (const kit of ['kit-copol-sexto-egb', 'kit-copol-septimo-egb']) for (const p of KITS[kit]) {
    ver({ d: p.descripcion, o: p.objetivos, g: p.guia }, (s, pth) => { if (!/fotoUrl|fragmento/.test(pth) && /5 ?V\b|9 ?V\b|Mini|UNO|Nano|Arduino(?! IDE)|PWM|VIN|3V3|GPIO|\bD\d|pin \d|CH340|bater/i.test(s)) console.log(`  ${p.slug}${pth}: ${s}`) })
    console.log(`  ${p.slug} PINES: ${p.conexiones.map(c => `${c[0].split(' ')[0]}.${c[1].split(' ')[0]}→${c[2]}`).join(' ')}`)
    if (p.codigo) console.log('  CODIGO: ' + p.codigo.split(/\r?\n/).filter(l => /Kit |Placa|#include|^const int|Serial.begin|4095|1023/.test(l)).map(l => l.trim()).join(' ¦ '))
  }
}
console.log('SQL:', out, Math.round(fs.statSync(out).size / 1024) + ' KB')
