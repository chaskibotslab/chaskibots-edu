// Lista los agujeros (de pin y de eje) de una pieza LDraw: posición y dirección, en LDU.
// Sirve para unir piezas de verdad: dos agujeros alineados y pegados aceptan un pin.
// Uso: node agujeros.js <carpeta ldraw> <pieza.dat> [matriz de colocación: x y z a b c d e f g h i]
const fs = require('fs'), path = require('path')
const [, , libRoot, pieza, ...m] = process.argv
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
// primitivas que representan un agujero; su eje local es Y
const TIPOS = [
  [/^(beamhole|peghole\d*|npeghol\d*\w*|connhole|confric\d*)\.dat$/, 'pin'],
  [/^(axlehole|axlehol\d+|axl\dhole|axl\dhol\d)\.dat$/, 'eje'],
]
const hallados = []
function rec(ref, M) {
  const L = leer(ref)
  if (!L) return
  for (const t of L) {
    if (t[0] !== '1' || t.length < 15) continue
    const [x, y, z, a, b, c, d, e, f, g, h, i] = t.slice(2, 14).map(Number)
    const N = [
      M[0] * a + M[1] * d + M[2] * g, M[0] * b + M[1] * e + M[2] * h, M[0] * c + M[1] * f + M[2] * i, M[0] * x + M[1] * y + M[2] * z + M[3],
      M[4] * a + M[5] * d + M[6] * g, M[4] * b + M[5] * e + M[6] * h, M[4] * c + M[5] * f + M[6] * i, M[4] * x + M[5] * y + M[6] * z + M[7],
      M[8] * a + M[9] * d + M[10] * g, M[8] * b + M[9] * e + M[10] * h, M[8] * c + M[9] * f + M[10] * i, M[8] * x + M[9] * y + M[10] * z + M[11]]
    const nombre = t.slice(14).join(' ').split('\\').join('/').toLowerCase()
    const tipo = TIPOS.find(([re]) => re.test(nombre))
    if (tipo) {
      const lon = Math.hypot(N[1], N[5], N[9]) || 1
      hallados.push({ tipo: tipo[1], prim: nombre, pos: [N[3], N[7], N[11]], eje: [N[1] / lon, N[5] / lon, N[9] / lon], largo: lon })
    } else rec(nombre, N)
  }
}
const M0 = m.length === 12
  ? (([x, y, z, a, b, c, d, e, f, g, h, i]) => [a, b, c, x, d, e, f, y, g, h, i, z])(m.map(Number))
  : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]
rec(pieza, M0)
// agrupar por eje y por línea (los dos extremos de un agujero salen como primitivas separadas)
const r = v => Math.round(v * 10) / 10 + 0
const ejeN = e => { const k = e.map(v => Math.round(Math.abs(v))); return k[0] ? 'X' : k[1] ? 'Y' : 'Z' }
const grupos = new Map()
for (const h of hallados) {
  const E = ejeN(h.eje), i = 'XYZ'.indexOf(E)
  const otros = [0, 1, 2].filter(q => q !== i).map(q => r(h.pos[q]))
  const k = `${h.tipo} ${E} ${otros.join(',')}`
  const g = grupos.get(k) || { tipo: h.tipo, E, otros, a: [] }
  g.a.push(r(h.pos[i]))
  grupos.set(k, g)
}
console.log(pieza, '—', hallados.length, 'primitivas de agujero;', grupos.size, 'agujeros')
const N = 'xyz'
for (const g of [...grupos.values()].sort((p, q) => (p.E + p.otros).localeCompare(q.E + q.otros))) {
  const i = 'XYZ'.indexOf(g.E), o = [0, 1, 2].filter(q => q !== i)
  console.log(`${g.tipo} eje ${g.E}  ${N[o[0]]}=${g.otros[0]} ${N[o[1]]}=${g.otros[1]}  ${N[i]}: ${Math.min(...g.a)}..${Math.max(...g.a)}`)
}
