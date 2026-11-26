// Caja envolvente de piezas LDraw (en LDU, coords locales de la pieza).
// Sirve para colocar piezas sin que se atraviesen. Uso: node bbox.js <raizLib> <pieza.dat>...
const fs = require('fs'), path = require('path')
const [, , libRoot, ...parts] = process.argv
const dirs = ['parts', 'p', 'models']
const cache = new Map()
function leer(ref) {
  const n = ref.split('\\').join('/').toLowerCase()
  if (cache.has(n)) return cache.get(n)
  let c = null
  for (const d of dirs) {
    const fp = path.join(libRoot, d, n)
    if (fs.existsSync(fp)) { c = fs.readFileSync(fp, 'latin1').split(/\r?\n/).map(l => l.trim().split(/\s+/)); break }
  }
  cache.set(n, c)
  return c
}
function rec(ref, M, bb) {
  const L = leer(ref)
  if (!L) return
  for (const t of L) {
    const k = t[0]
    if (k === '1' && t.length >= 15) {
      const [x, y, z, a, b, c, d, e, f, g, h, i] = t.slice(2, 14).map(Number)
      const N = [
        M[0] * a + M[1] * d + M[2] * g, M[0] * b + M[1] * e + M[2] * h, M[0] * c + M[1] * f + M[2] * i, M[0] * x + M[1] * y + M[2] * z + M[3],
        M[4] * a + M[5] * d + M[6] * g, M[4] * b + M[5] * e + M[6] * h, M[4] * c + M[5] * f + M[6] * i, M[4] * x + M[5] * y + M[6] * z + M[7],
        M[8] * a + M[9] * d + M[10] * g, M[8] * b + M[9] * e + M[10] * h, M[8] * c + M[9] * f + M[10] * i, M[8] * x + M[9] * y + M[10] * z + M[11]]
      rec(t.slice(14).join(' '), N, bb)
    } else if (k === '3' || k === '4' || k === '2') {
      const n = +k
      for (let j = 0; j < n; j++) {
        const x = +t[2 + j * 3], y = +t[3 + j * 3], z = +t[4 + j * 3]
        const p = [M[0] * x + M[1] * y + M[2] * z + M[3], M[4] * x + M[5] * y + M[6] * z + M[7], M[8] * x + M[9] * y + M[10] * z + M[11]]
        for (let q = 0; q < 3; q++) { bb.min[q] = Math.min(bb.min[q], p[q]); bb.max[q] = Math.max(bb.max[q], p[q]) }
      }
    }
  }
}
for (const p of parts) {
  const bb = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }
  rec(p, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], bb)
  const desc = (leer(p) || [[]])[0].slice(1).join(' ')
  const r = q => bb.min[q].toFixed(0) + ' ' + bb.max[q].toFixed(0)
  console.log(p.padEnd(14), 'x', r(0), ' y', r(1), ' z', r(2), ' |', desc)
}
