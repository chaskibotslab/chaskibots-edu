// Script para extraer texto del PDF usando OCR (Tesseract.js)
const fs = require('fs')
const path = require('path')
const Tesseract = require('tesseract.js')

const PDF_PATH = path.join(__dirname, '..', 'libros', 'sexto.pdf')
const OUTPUT_DIR = path.join(__dirname, '..', 'libros', 'sexto-pages')
const OUTPUT_TEXT = path.join(__dirname, '..', 'libros', 'sexto-ocr.txt')

async function convertPdfToImages() {
  console.log('📄 Convirtiendo PDF a imágenes...')
  
  // Crear directorio de salida
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  
  // Usar pdf-poppler para convertir
  const pdfPoppler = require('pdf-poppler')
  
  const opts = {
    format: 'png',
    out_dir: OUTPUT_DIR,
    out_prefix: 'page',
    page: null // todas las páginas
  }
  
  await pdfPoppler.convert(PDF_PATH, opts)
  console.log('✅ PDF convertido a imágenes')
  
  // Listar imágenes generadas
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.match(/\d+/)?.[0] || '0')
      return numA - numB
    })
  
  return files.map(f => path.join(OUTPUT_DIR, f))
}

async function extractTextWithOCR(imagePaths) {
  console.log(`\n🔍 Extrayendo texto con OCR de ${imagePaths.length} páginas...`)
  console.log('⏳ Esto puede tomar varios minutos...\n')
  
  let fullText = ''
  
  // Crear worker de Tesseract
  const worker = await Tesseract.createWorker('spa') // Español
  
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i]
    const pageNum = i + 1
    
    process.stdout.write(`\r📝 Procesando página ${pageNum}/${imagePaths.length} (${Math.round(pageNum/imagePaths.length*100)}%)`)
    
    try {
      const { data: { text } } = await worker.recognize(imagePath)
      fullText += `\n\n========== PÁGINA ${pageNum} ==========\n\n${text}`
    } catch (err) {
      console.error(`\n❌ Error en página ${pageNum}:`, err.message)
      fullText += `\n\n========== PÁGINA ${pageNum} ==========\n\n[Error al procesar esta página]`
    }
  }
  
  await worker.terminate()
  
  console.log('\n\n✅ OCR completado')
  return fullText
}

async function main() {
  console.log('📖 Procesando libro de Sexto Grado')
  console.log('─'.repeat(50))
  
  try {
    // Paso 1: Convertir PDF a imágenes
    const imagePaths = await convertPdfToImages()
    console.log(`📸 ${imagePaths.length} imágenes generadas`)
    
    // Paso 2: Extraer texto con OCR
    const text = await extractTextWithOCR(imagePaths)
    
    // Paso 3: Guardar texto
    fs.writeFileSync(OUTPUT_TEXT, text)
    console.log(`\n💾 Texto guardado en: ${OUTPUT_TEXT}`)
    console.log(`📝 Total caracteres: ${text.length}`)
    
    // Mostrar primeras líneas
    const lines = text.split('\n').filter(l => l.trim()).slice(0, 50)
    console.log('\n📋 Primeras 50 líneas del contenido:')
    console.log('─'.repeat(50))
    lines.forEach(line => console.log(line.substring(0, 100)))
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

main()
