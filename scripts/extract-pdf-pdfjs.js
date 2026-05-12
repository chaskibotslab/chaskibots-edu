// Script para extraer contenido del PDF usando pdfjs-dist
const fs = require('fs')
const path = require('path')

const PDF_PATH = path.join(__dirname, '..', 'libros', 'sexto.pdf')
const OUTPUT_PATH = path.join(__dirname, '..', 'libros', 'sexto-contenido.txt')

async function extractPDF() {
  console.log('📖 Leyendo PDF:', PDF_PATH)
  
  // Importar pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  
  const data = new Uint8Array(fs.readFileSync(PDF_PATH))
  
  console.log('🔍 Cargando documento...')
  const loadingTask = pdfjsLib.getDocument({ data })
  const pdf = await loadingTask.promise
  
  console.log(`📄 Páginas: ${pdf.numPages}`)
  
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    process.stdout.write(`\r📝 Procesando página ${i}/${pdf.numPages}`)
    
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ')
    
    fullText += `\n\n=== PÁGINA ${i} ===\n\n${pageText}`
  }
  
  console.log('\n')
  
  // Guardar texto extraído
  fs.writeFileSync(OUTPUT_PATH, fullText)
  console.log(`✅ Contenido guardado en: ${OUTPUT_PATH}`)
  console.log(`📝 Total caracteres: ${fullText.length}`)
  
  // Mostrar primeras líneas
  const lines = fullText.split('\n').filter(l => l.trim())
  console.log('\n📋 Primeras 30 líneas:')
  console.log('─'.repeat(60))
  lines.slice(0, 30).forEach((line, i) => {
    console.log(`${line.substring(0, 100)}`)
  })
}

extractPDF().catch(console.error)
