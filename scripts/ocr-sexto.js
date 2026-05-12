// OCR para extraer texto de las imágenes del libro de sexto
const fs = require('fs')
const path = require('path')
const Tesseract = require('tesseract.js')

const IMAGES_DIR = path.join(__dirname, '..', 'libros', 'sexto-images')
const OUTPUT_FILE = path.join(__dirname, '..', 'libros', 'sexto-ocr-final.txt')

async function main() {
  console.log('🔍 Iniciando OCR del libro de Sexto Grado')
  console.log('─'.repeat(50))
  
  // Obtener lista de imágenes ordenadas
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.match(/\d+/)?.[0] || '0')
      return numA - numB
    })
  
  console.log(`📄 Total páginas: ${files.length}`)
  console.log('⏳ Esto tomará varios minutos...\n')
  
  // Crear worker de Tesseract con español
  const worker = await Tesseract.createWorker('spa')
  
  let fullText = ''
  const startTime = Date.now()
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const pageNum = i + 1
    const imagePath = path.join(IMAGES_DIR, file)
    
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    const eta = i > 0 ? Math.round((elapsed / i) * (files.length - i)) : '?'
    
    process.stdout.write(`\r📝 Página ${pageNum}/${files.length} (${Math.round(pageNum/files.length*100)}%) - ETA: ${eta}s   `)
    
    try {
      const { data: { text } } = await worker.recognize(imagePath)
      fullText += `\n\n${'='.repeat(20)} PÁGINA ${pageNum} ${'='.repeat(20)}\n\n${text}`
    } catch (err) {
      fullText += `\n\n${'='.repeat(20)} PÁGINA ${pageNum} ${'='.repeat(20)}\n\n[Error: ${err.message}]`
    }
  }
  
  await worker.terminate()
  
  // Guardar resultado
  fs.writeFileSync(OUTPUT_FILE, fullText)
  
  const totalTime = Math.round((Date.now() - startTime) / 1000)
  console.log(`\n\n✅ OCR completado en ${totalTime} segundos`)
  console.log(`💾 Guardado en: ${OUTPUT_FILE}`)
  console.log(`📝 Total caracteres: ${fullText.length}`)
  
  // Mostrar muestra del contenido
  const lines = fullText.split('\n').filter(l => l.trim()).slice(0, 40)
  console.log('\n📋 Primeras 40 líneas:')
  console.log('─'.repeat(50))
  lines.forEach(line => console.log(line.substring(0, 80)))
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
