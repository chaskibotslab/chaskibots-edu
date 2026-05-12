// Script para extraer contenido del PDF y convertirlo a lecciones
const fs = require('fs')
const path = require('path')

const PDF_PATH = path.join(__dirname, '..', 'libros', 'sexto.pdf')
const OUTPUT_PATH = path.join(__dirname, '..', 'libros', 'sexto-contenido.txt')

async function extractPDF() {
  console.log('📖 Leyendo PDF:', PDF_PATH)
  
  // Importar dinámicamente
  const pdfParseModule = await import('pdf-parse')
  const pdfParse = pdfParseModule.default
  
  const dataBuffer = fs.readFileSync(PDF_PATH)
  
  console.log('🔍 Extrayendo texto...')
  const data = await pdfParse(dataBuffer)
  
  console.log(`📄 Páginas: ${data.numpages}`)
  console.log(`📝 Caracteres: ${data.text.length}`)
  
  // Guardar texto extraído
  fs.writeFileSync(OUTPUT_PATH, data.text)
  console.log(`✅ Contenido guardado en: ${OUTPUT_PATH}`)
  
  // Mostrar primeras líneas para verificar
  const lines = data.text.split('\n').filter(l => l.trim())
  console.log('\n📋 Primeras 50 líneas:')
  console.log('─'.repeat(60))
  lines.slice(0, 50).forEach((line, i) => {
    console.log(`${i + 1}: ${line.substring(0, 100)}`)
  })
  
  return data
}

extractPDF().catch(console.error)
