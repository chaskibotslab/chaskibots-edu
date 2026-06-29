const fs = require('fs')
const path = require('path')

function parseCsv(text) {
  const rows = []
  let i = 0, row = [], cell = '', inQ = false
  while (i < text.length) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 2; continue }
        inQ = false; i++; continue
      }
      cell += ch; i++; continue
    }
    if (ch === '"') { inQ = true; i++; continue }
    if (ch === ',') { row.push(cell); cell = ''; i++; continue }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''; i++; continue
    }
    cell += ch; i++
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows
}

const files = [
  'lessons.csv',
  'lessons_unified.csv',
  'lessons_dinamico_completo.csv',
  'lessons_all_levels.csv',
  'lessons_todos_programas.csv',
  'lessons_todos_programas_v2.csv',
  'lessons_para_importar.csv',
  'lessons_robotica_completo.csv',
  'lessons_robotica_expandido.csv',
  'lessons_ia_completo.csv',
  'lessons_hacking_completo.csv',
]

console.log('CSV | rows | hasImageCol | imagesNonEmpty | sample')
console.log('-'.repeat(80))
for (const f of files) {
  const p = path.join(__dirname, '..', 'airtable', f)
  if (!fs.existsSync(p)) continue
  const text = fs.readFileSync(p, 'utf8')
  const rows = parseCsv(text)
  if (rows.length === 0) continue
  const head = rows[0]
  const idxImg = head.findIndex(h => /image/i.test(h))
  let nonEmpty = 0
  let sample = ''
  if (idxImg >= 0) {
    for (let i = 1; i < rows.length; i++) {
      const v = rows[i][idxImg]
      if (v && v.trim().startsWith('http')) {
        nonEmpty++
        if (!sample) sample = v.slice(0, 90)
      }
    }
  }
  console.log(`${f.padEnd(45)} | ${String(rows.length - 1).padStart(4)} | ${idxImg >= 0 ? 'YES (' + head[idxImg] + ')' : 'no'.padEnd(20)} | ${nonEmpty} | ${sample}`)
}
