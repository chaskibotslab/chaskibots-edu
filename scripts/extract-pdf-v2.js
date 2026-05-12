// Script para extraer texto del PDF usando pdf2pic + Tesseract.js
const fs = require('fs')
const path = require('path')
const { fromPath } = require('pdf2pic')
const Tesseract = require('tesseract.js')

const PDF_PATH = path.join(__dirname, '..', 'libros', 'sexto.pdf')
const OUTPUT_DIR = path.join(__dirname, '..', 'libros', 'sexto-images')
const OUTPUT_TEXT = path.join(__dirname, '..', 'libros', 'sexto-ocr.txt')

async function main() {
  console.log('📖 Procesando libro de Sexto Grado')
  console.log('─'.repeat(50))
  console.log('PDF:', PDF_PATH)
  
  // Crear directorio de salida
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  
  // Configurar pdf2pic
  const options = {
    density: 150,           // DPI
    saveFilename: 'page',
    savePath: OUTPUT_DIR,
    format: 'png',
    width: 1200,
    height: 1600
  }
  
  const convert = fromPath(PDF_PATH, options)
  
  console.log('\n📄 Convirtiendo PDF a imágenes...')
  
  // Obtener número de páginas primero
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const pdfData = new Uint8Array(fs.readFileSync(PDF_PATH))
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise
  const numPages = pdf.numPages
  
  console.log(`📄 Total páginas: ${numPages}`)
  
  // Convertir páginas a imágenes
  const imagePaths = []
  for (let i = 1; i <= numPages; i++) {
    process.stdout.write(`\r📸 Convirtiendo página ${i}/${numPages}`)
    try {
      const result = await convert(i, { responseType: 'image' })
      imagePaths.push(result.path)
    } catch (err) {
      console.error(`\n❌ Error en página ${i}:`, err.message)
    }
  }
  
  console.log(`\n✅ ${imagePaths.length} imágenes generadas`)
  
  // Extraer texto con OCR
  console.log('\n🔍 Extrayendo texto con OCR...')
  console.log('⏳ Esto tomará varios minutos...\n')
  
  const worker = await Tesseract.createWorker('spa')
  let fullText = ''
  
  for (let i = 0; i < imagePaths.length; i++) {
    const pageNum = i + 1
    process.stdout.write(`\r📝 OCR página ${pageNum}/${imagePaths.length} (${Math.round(pageNum/imagePaths.length*100)}%)`)
    
    try {
      const { data: { text } } = await worker.recognize(imagePaths[i])
      fullText += `\n\n========== PÁGINA ${pageNum} ==========\n\n${text}`
    } catch (err) {
      fullText += `\n\n========== PÁGINA ${pageNum} ==========\n\n[Error: ${err.message}]`
    }
  }
  
  await worker.terminate()
  
  // Guardar texto
  fs.writeFileSync(OUTPUT_TEXT, fullText)
  console.log(`\n\n✅ Texto guardado en: ${OUTPUT_TEXT}`)
  console.log(`📝 Total caracteres: ${fullText.length}`)
  
  // Mostrar muestra
  const lines = fullText.split('\n').filter(l => l.trim()).slice(0, 30)
  console.log('\n📋 Primeras 30 líneas:')
  console.log('─'.repeat(50))
  lines.forEach(line => console.log(line.substring(0, 80)))
}

main().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
