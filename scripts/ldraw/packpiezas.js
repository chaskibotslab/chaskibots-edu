// Uso: node packpiezas.js <carpeta ldraw>
// Empaqueta cada pieza EV3 por separado en public/ldraw/piezas/<id>.mpd
const fs = require('fs'), path = require('path')
const libRoot = process.argv[2] // carpeta ldraw de la biblioteca descomprimida
const outDir = path.join(__dirname, '../../public/ldraw/piezas')
const searchDirs = ['parts', 'p', 'parts/s', 'p/48', 'p/8', 'models']

// LDrawLoader busca s/x como parts/s/x y 48/x como p/48/x: los embebidos deben llamarse igual
const nombreEmbebido = n => (n.startsWith('s/') ? 'parts/' + n : n.startsWith('48/') ? 'p/' + n : n)

function findFile(ref) {
  const norm = ref.replace(/\\/g, '/').toLowerCase()
  for (const d of searchDirs) { const fp = path.join(libRoot, d, norm); if (fs.existsSync(fp)) return fs.readFileSync(fp, 'latin1') }
  return null
}
function refsDe(content) {
  const refs = []
  for (const line of content.split(/\r?\n/)) { const t = line.trim(); if (t.startsWith('1 ')) { const p = t.split(/\s+/); if (p.length >= 15) refs.push(p.slice(14).join(' ')) } }
  return refs
}
function pack(modelLines) {
  const included = new Map()
  const incluir = ref => { const norm = ref.replace(/\\/g, '/').toLowerCase(); if (included.has(norm)) return; const c = findFile(ref); if (!c) { console.error('NO:', ref); return } included.set(norm, c); for (const r of refsDe(c)) incluir(r) }
  const model = modelLines.join('\n') + '\n'
  for (const r of refsDe(model)) incluir(r)
  const ldconfig = fs.readFileSync(path.join(libRoot, 'LDConfig.ldr'), 'latin1')
  let out = '0 FILE main.ldr\n' + ldconfig + '\n' + model
  for (const [name, content] of included) out += '0 FILE ' + nombreEmbebido(name) + '\n' + content + '\n'
  return out
}

const I = '1 0 0 0 1 0 0 0 1' // matriz identidad
const piezas = {
  brick: [`1 15 0 0 0 ${I} 95646c01.dat`],
  motor_grande: [`1 15 0 0 0 ${I} 95658.dat`],
  motor_mediano: [`1 15 0 0 0 ${I} 99455.dat`],
  sensor_color: [`1 15 0 0 0 ${I} 95650.dat`],
  sensor_ir: [`1 15 0 0 0 ${I} 95654.dat`],
  sensor_tactil: [`1 15 0 0 0 ${I} 95648.dat`],
  sensor_giro: [`1 15 0 0 0 ${I} 99380.dat`],
  rueda: [`1 71 0 0 0 ${I} 56908.dat`, `1 0 0 0 0 ${I} 41897.dat`],
  viga_11: [`1 4 0 0 0 ${I} 32525.dat`],
  viga_7: [`1 71 0 0 0 ${I} 32524.dat`],
  viga_3: [`1 14 0 0 0 ${I} 32523.dat`],
  pin: [`1 1 0 0 0 ${I} 32054.dat`],
  rueda_loca: [`1 71 0 0 0 1 0 0 0 0 -1 0 1 0 92911c01.dat`],
  viga_15: [`1 0 0 0 0 ${I} 32278.dat`],
  marco: [`1 71 0 0 0 ${I} 64179.dat`],
  eje: [`1 0 0 0 0 ${I} 3706.dat`],
}

fs.mkdirSync(outDir, { recursive: true })
let tot = 0
for (const [id, lines] of Object.entries(piezas)) {
  const mpd = pack(lines)
  fs.writeFileSync(path.join(outDir, id + '.mpd'), mpd, 'latin1')
  tot += mpd.length
  console.log(id, (mpd.length / 1024).toFixed(0) + ' KB')
}
console.log('TOTAL', (tot / 1024 / 1024).toFixed(2) + ' MB')
