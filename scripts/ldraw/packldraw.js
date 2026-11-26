// Empaqueta un modelo LDraw (.ldr) + todas sus piezas referenciadas (recursivo)
// en un solo .mpd autocontenido, para cargarlo con LDrawLoader sin la biblioteca.
// Uso: node packldraw.js <modelo.ldr> <raizLib> <salida.mpd>
const fs = require('fs')
const path = require('path')

const [, , modelPath, libRoot, outPath] = process.argv
const searchDirs = ['parts', 'p', 'parts/s', 'p/48', 'p/8', 'models']
const included = new Map() // nombreNormalizado -> contenido

// LDrawLoader busca s/x como parts/s/x y 48/x como p/48/x: los embebidos deben llamarse igual
const nombreEmbebido = n => (n.startsWith('s/') ? 'parts/' + n : n.startsWith('48/') ? 'p/' + n : n)

function findFile(ref) {
  const norm = ref.replace(/\\/g, '/').toLowerCase()
  for (const d of searchDirs) {
    const fp = path.join(libRoot, d, norm)
    if (fs.existsSync(fp)) return fs.readFileSync(fp, 'latin1')
  }
  return null
}

function refsDe(content) {
  const refs = []
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (t.startsWith('1 ')) {
      const parts = t.split(/\s+/)
      if (parts.length >= 15) refs.push(parts.slice(14).join(' '))
    }
  }
  return refs
}

function incluir(ref) {
  const norm = ref.replace(/\\/g, '/').toLowerCase()
  if (included.has(norm)) return
  const content = findFile(ref)
  if (!content) { console.error('NO ENCONTRADO:', ref); return }
  included.set(norm, content)
  for (const r of refsDe(content)) incluir(r)
}

const ldconfig = fs.readFileSync(path.join(libRoot, 'LDConfig.ldr'), 'latin1')
const model = fs.readFileSync(modelPath, 'latin1')
for (const r of refsDe(model)) incluir(r)

let out = '0 FILE main.ldr\n' + ldconfig + '\n' + model + '\n'
for (const [name, content] of included) out += '0 FILE ' + nombreEmbebido(name) + '\n' + content + '\n'
fs.writeFileSync(outPath, out, 'latin1')
console.log('Piezas incluidas:', included.size, '→', outPath, '(' + (out.length / 1024 / 1024).toFixed(2) + ' MB)')
