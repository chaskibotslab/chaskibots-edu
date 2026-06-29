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

const dir = path.join(__dirname, '..', 'airtable')
const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'))

console.log('CSV files in airtable/:\n')
console.log('FILE | rows | videoUrl count | imageUrl count | pdfUrl count | columns')
console.log('-'.repeat(120))

for (const f of files) {
  if (f.includes('OLD') || f.includes('backup')) continue
  const text = fs.readFileSync(path.join(dir, f), 'utf8')
  const rows = parseCsv(text)
  if (rows.length < 2) continue
  const head = rows[0]
  const idxVideo = head.findIndex(h => /video.*url|videourl/i.test(h))
  const idxImg = head.findIndex(h => /image.*url|imageurl|images|image$/i.test(h))
  const idxPdf = head.findIndex(h => /pdf.*url|pdfurl/i.test(h))

  let vC = 0, iC = 0, pC = 0
  for (let r = 1; r < rows.length; r++) {
    if (idxVideo >= 0 && rows[r][idxVideo] && rows[r][idxVideo].trim().startsWith('http')) vC++
    if (idxImg >= 0 && rows[r][idxImg] && rows[r][idxImg].trim().length > 5) iC++
    if (idxPdf >= 0 && rows[r][idxPdf] && rows[r][idxPdf].trim().startsWith('http')) pC++
  }
  if (vC + iC + pC > 0 || f.startsWith('lessons')) {
    console.log(`${f.padEnd(50)} | ${String(rows.length-1).padStart(4)} | ${String(vC).padStart(5)} | ${String(iC).padStart(5)} | ${String(pC).padStart(5)} | ${head.join(',').slice(0,80)}`)
  }
}
