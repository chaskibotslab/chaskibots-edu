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

const files = ['kits.csv', 'kits_para_importar.csv']
for (const f of files) {
  const p = path.join(__dirname, '..', 'airtable', f)
  if (!fs.existsSync(p)) continue
  console.log(`\n=== ${f} ===`)
  const rows = parseCsv(fs.readFileSync(p, 'utf8'))
  console.log('HEADER:', rows[0].join(' | '))
  console.log(`Filas: ${rows.length - 1}\n`)
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (row.length < 2) continue
    const obj = {}
    rows[0].forEach((h, i) => obj[h] = row[i])
    const imgs = obj.images || obj.image_urls || ''
    const vid = obj.videoUrl || ''
    const tut = obj.tutorialUrl || ''
    if (imgs || vid || tut) {
      console.log(`  ${obj.id || obj.Name || 'fila' + r}`)
      if (imgs) console.log(`    images: ${imgs.slice(0, 200)}`)
      if (vid) console.log(`    video: ${vid.slice(0, 100)}`)
      if (tut) console.log(`    tutorial: ${tut.slice(0, 100)}`)
    }
  }
}
