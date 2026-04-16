'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Download, Trash2, Copy, Check, FileCode, FileText, RotateCcw, QrCode, Hash, Send, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'

declare global {
  interface Window {
    loadPyodide: () => Promise<any>
    pyodide: any
  }
}

// Generar ID único basado en contenido y timestamp
const generateTaskId = (code: string, studentName: string): string => {
  const timestamp = Date.now()
  const content = `${studentName}-${code}-${timestamp}`
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const uniqueId = Math.abs(hash).toString(36).toUpperCase()
  const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  return `CB-${dateCode}-${uniqueId.slice(0, 6)}`
}

const DEFAULT_CODE = `# Calculadora simple
# Escribe tu código Python aquí

a = 10
b = 5

suma = a + b
resta = a - b
multiplicacion = a * b
division = a / b

print("Suma:", suma)
print("Resta:", resta)
print("Multiplicación:", multiplicacion)
print("División:", division)`

const EXAMPLE_EXERCISES = [
  {
    title: 'Suma de 5 números',
    code: `# Suma de 5 números
num1 = 10
num2 = 20
num3 = 30
num4 = 40
num5 = 50

total = num1 + num2 + num3 + num4 + num5
promedio = total / 5

print("Números:", num1, num2, num3, num4, num5)
print("Suma total:", total)
print("Promedio:", promedio)`
  },
  {
    title: 'Tabla de multiplicar',
    code: `# Tabla de multiplicar
numero = 7

print("Tabla del", numero)
print("-" * 15)

for i in range(1, 11):
    resultado = numero * i
    print(numero, "x", i, "=", resultado)`
  },
  {
    title: 'Calculadora de edad',
    code: `# Calculadora de edad
nombre = "María"
año_nacimiento = 2012
año_actual = 2025

edad = año_actual - año_nacimiento

print("Hola", nombre)
print("Naciste en", año_nacimiento)
print("Tienes", edad, "años")

if edad >= 18:
    print("Eres mayor de edad")
else:
    print("Eres menor de edad")`
  },
  {
    title: 'Números pares e impares',
    code: `# Números pares e impares del 1 al 20
print("Números del 1 al 20:")
print("-" * 25)

pares = []
impares = []

for num in range(1, 21):
    if num % 2 == 0:
        pares.append(num)
    else:
        impares.append(num)

print("Pares:", pares)
print("Impares:", impares)
print("Total pares:", len(pares))
print("Total impares:", len(impares))`
  },
  {
    title: 'Área y perímetro',
    code: `# Calcular área y perímetro de un rectángulo
base = 8
altura = 5

area = base * altura
perimetro = 2 * (base + altura)

print("Rectángulo")
print("-" * 20)
print("Base:", base, "cm")
print("Altura:", altura, "cm")
print("Área:", area, "cm²")
print("Perímetro:", perimetro, "cm")`
  }
]

export default function PythonSimulator() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isPyodideReady, setIsPyodideReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('')
  const [lastTaskId, setLastTaskId] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const loadPyodideScript = async () => {
      if (window.pyodide) {
        setIsPyodideReady(true)
        setIsLoading(false)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
      script.async = true
      
      script.onload = async () => {
        try {
          window.pyodide = await window.loadPyodide()
          setIsPyodideReady(true)
          setIsLoading(false)
        } catch (error) {
          console.error('Error loading Pyodide:', error)
          setOutput('Error al cargar Python. Recarga la página.')
          setIsLoading(false)
        }
      }

      script.onerror = () => {
        setOutput('Error al cargar Python. Verifica tu conexión.')
        setIsLoading(false)
      }

      document.head.appendChild(script)
    }

    loadPyodideScript()
  }, [])

  const runCode = async () => {
    if (!isPyodideReady || isRunning) return

    setIsRunning(true)
    setOutput('Ejecutando...')

    try {
      window.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `)

      await window.pyodide.runPythonAsync(code)

      const stdout = window.pyodide.runPython('sys.stdout.getvalue()')
      const stderr = window.pyodide.runPython('sys.stderr.getvalue()')

      if (stderr) {
        setOutput(`${stdout}\n⚠️ Errores:\n${stderr}`)
      } else {
        setOutput(stdout || '(Sin salida)')
      }
    } catch (error: any) {
      setOutput(`❌ Error:\n${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const clearCode = () => {
    setCode('')
    setOutput('')
  }

  const resetCode = () => {
    setCode(DEFAULT_CODE)
    setOutput('')
  }

  const loadExample = (exampleCode: string) => {
    setCode(exampleCode)
    setOutput('')
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportCode = () => {
    const filename = studentName 
      ? `${studentName.replace(/\s+/g, '_')}_codigo.py`
      : 'mi_codigo.py'
    downloadFile(code, filename, 'text/x-python')
  }

  const exportOutput = () => {
    const filename = studentName 
      ? `${studentName.replace(/\s+/g, '_')}_resultado.txt`
      : 'resultado.txt'
    
    const content = `=== RESULTADO DE EJECUCIÓN ===
Estudiante: ${studentName || 'Sin nombre'}
Fecha: ${new Date().toLocaleString('es-EC')}

=== CÓDIGO ===
${code}

=== SALIDA ===
${output}
`
    downloadFile(content, filename, 'text/plain')
  }

  const prepareExport = async () => {
    const taskId = generateTaskId(code, studentName)
    setLastTaskId(taskId)
    
    // Generar QR con la información de verificación
    const qrData = JSON.stringify({
      id: taskId,
      student: studentName || 'Anónimo',
      date: new Date().toISOString(),
      platform: 'ChaskiBots',
      verify: `https://edu.chaskibots.com/verify/${taskId}`
    })
    
    try {
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: { dark: '#00D9FF', light: '#1a1a2e' }
      })
      setQrDataUrl(qrUrl)
    } catch (err) {
      console.error('Error generating QR:', err)
    }
    
    setShowExportModal(true)
  }

  const exportBoth = async () => {
    const taskId = lastTaskId || generateTaskId(code, studentName)
    const filename = studentName 
      ? `${studentName.replace(/\s+/g, '_')}_${taskId}.txt`
      : `tarea_${taskId}.txt`
    
    const content = `╔════════════════════════════════════════════════════════════════════╗
║                  TAREA DE PYTHON - CHASKIBOTS                      ║
║                    CERTIFICADO DE EJECUCIÓN                        ║
╚════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│  🔐 ID DE VERIFICACIÓN: ${taskId.padEnd(43)}│
└─────────────────────────────────────────────────────────────────────┘

📝 Estudiante: ${studentName || '_______________'}
📅 Fecha: ${new Date().toLocaleString('es-EC')}
🕐 Timestamp: ${Date.now()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 CÓDIGO PYTHON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${code}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖥️ RESULTADO DE EJECUCIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${output}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────┐
│  ✅ CERTIFICADO GENERADO POR CHASKIBOTS EDUCATION PLATFORM         │
│  🌐 https://edu.chaskibots.com                                      │
│  🔐 ID: ${taskId.padEnd(58)}│
│                                                                     │
│  Este documento contiene un código único que puede ser verificado  │
│  por el docente escaneando el código QR o ingresando el ID en:     │
│  https://edu.chaskibots.com/verify/${taskId.padEnd(32)}│
└─────────────────────────────────────────────────────────────────────┘
`
    downloadFile(content, filename, 'text/plain')
    setShowExportModal(false)
  }

  const exportWithQR = async () => {
    const taskId = lastTaskId || generateTaskId(code, studentName)
    
    // Crear un canvas para combinar texto y QR
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 1200

    // Fondo
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Título
    ctx.fillStyle = '#00D9FF'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('TAREA DE PYTHON - CHASKIBOTS', canvas.width / 2, 50)

    // ID
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 18px monospace'
    ctx.fillText(`ID: ${taskId}`, canvas.width / 2, 90)

    // Info estudiante
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Estudiante: ${studentName || 'Sin nombre'}`, 30, 140)
    ctx.fillText(`Fecha: ${new Date().toLocaleString('es-EC')}`, 30, 165)

    // Código
    ctx.fillStyle = '#00D9FF'
    ctx.font = 'bold 16px Arial'
    ctx.fillText('CÓDIGO PYTHON:', 30, 210)
    
    ctx.fillStyle = '#2d2d4a'
    ctx.fillRect(20, 220, canvas.width - 40, 300)
    
    ctx.fillStyle = '#E0E0E0'
    ctx.font = '12px monospace'
    const codeLines = code.split('\n').slice(0, 20)
    codeLines.forEach((line, i) => {
      ctx.fillText(line.substring(0, 80), 30, 245 + i * 14)
    })

    // Resultado
    ctx.fillStyle = '#00FF88'
    ctx.font = 'bold 16px Arial'
    ctx.fillText('RESULTADO:', 30, 550)
    
    ctx.fillStyle = '#1a3a1a'
    ctx.fillRect(20, 560, canvas.width - 40, 200)
    
    ctx.fillStyle = '#00FF88'
    ctx.font = '12px monospace'
    const outputLines = output.split('\n').slice(0, 12)
    outputLines.forEach((line, i) => {
      ctx.fillText(line.substring(0, 80), 30, 585 + i * 14)
    })

    // QR Code
    if (qrDataUrl) {
      const qrImg = new Image()
      qrImg.onload = () => {
        ctx.drawImage(qrImg, canvas.width / 2 - 100, 780, 200, 200)
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Escanea para verificar', canvas.width / 2, 1000)
        ctx.fillText(`ID: ${taskId}`, canvas.width / 2, 1020)
        
        // Footer
        ctx.fillStyle = '#666666'
        ctx.font = '12px Arial'
        ctx.fillText('Generado por ChaskiBots Education Platform', canvas.width / 2, 1060)
        ctx.fillText('https://edu.chaskibots.com', canvas.width / 2, 1080)

        // Descargar imagen
        const link = document.createElement('a')
        link.download = studentName 
          ? `${studentName.replace(/\s+/g, '_')}_${taskId}.png`
          : `tarea_${taskId}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setShowExportModal(false)
      }
      qrImg.src = qrDataUrl
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-600 text-sm font-mono">codigo.py</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tu nombre (opcional)"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 w-40"
          />
          <button
            onClick={resetCode}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Restaurar código inicial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={clearCode}
            className="p-2 text-gray-600 hover:text-red-400 hover:bg-gray-100 rounded-lg transition-colors"
            title="Limpiar todo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 divide-x divide-dark-600">
        {/* Code Editor */}
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => copyToClipboard(code, 'code')}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
              title="Copiar código"
            >
              {copied === 'code' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 p-4 bg-white text-gray-200 font-mono text-sm resize-none focus:outline-none"
            placeholder="Escribe tu código Python aquí..."
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="relative bg-white/50">
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">▶ Salida</span>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => copyToClipboard(output, 'output')}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
              title="Copiar resultado"
            >
              {copied === 'output' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <pre className="w-full h-80 p-4 pt-8 text-green-400 font-mono text-sm overflow-auto whitespace-pre-wrap">
            {isLoading ? (
              <span className="text-yellow-400">⏳ Cargando Python...</span>
            ) : output || (
              <span className="text-gray-500">La salida aparecerá aquí...</span>
            )}
          </pre>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={!isPyodideReady || isRunning}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Ejecutando...' : 'Ejecutar'}
          </button>
          
          {/* Botón Enviar al Profesor - Siempre visible */}
          {output && (
            <button
              onClick={async () => {
                if (!studentName.trim()) {
                  alert('Por favor escribe tu nombre en el campo de arriba')
                  return
                }
                if (!selectedLevel) {
                  alert('Por favor selecciona tu nivel del menú')
                  return
                }
                setIsSending(true)
                try {
                  const taskId = generateTaskId(code, studentName)
                  const res = await fetch('/api/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      taskId,
                      studentName,
                      levelId: selectedLevel,
                      code,
                      output
                    })
                  })
                  if (res.ok) {
                    setSendSuccess(true)
                    setTimeout(() => setSendSuccess(false), 5000)
                  } else {
                    alert('Error al enviar. Inténtalo de nuevo.')
                  }
                } catch (error) {
                  alert('Error de conexión')
                }
                setIsSending(false)
              }}
              disabled={isSending || sendSuccess}
              className="bg-brand-violet hover:bg-brand-violet/80 disabled:bg-gray-600 text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {isSending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
              ) : sendSuccess ? (
                <><Check className="w-4 h-4" /> ¡Enviado!</>
              ) : (
                <><Send className="w-4 h-4" /> Enviar al Profesor</>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {output && (
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900"
            >
              <option value="">Tu nivel...</option>
              <option value="inicial-1">Inicial 1</option>
              <option value="inicial-2">Inicial 2</option>
              <option value="primero-egb">1° EGB</option>
              <option value="segundo-egb">2° EGB</option>
              <option value="tercero-egb">3° EGB</option>
              <option value="cuarto-egb">4° EGB</option>
              <option value="quinto-egb">5° EGB</option>
              <option value="sexto-egb">6° EGB</option>
              <option value="septimo-egb">7° EGB</option>
              <option value="octavo-egb">8° EGB</option>
              <option value="noveno-egb">9° EGB</option>
              <option value="decimo-egb">10° EGB</option>
              <option value="primero-bach">1° Bach</option>
              <option value="segundo-bach">2° Bach</option>
              <option value="tercero-bach">3° Bach</option>
            </select>
          )}
          <button
            onClick={exportCode}
            className="bg-gray-100 hover:bg-gray-200 text-gray-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            title="Descargar código .py"
          >
            <FileCode className="w-4 h-4" />
            .py
          </button>
          <button
            onClick={prepareExport}
            disabled={!output}
            className="bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-dark-900 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            title="Exportar tarea con ID único y QR"
          >
            <QrCode className="w-4 h-4" />
            QR
          </button>
        </div>
      </div>

      {/* Send Success Message */}
      {sendSuccess && (
        <div className="px-4 py-2 bg-green-500/20 border-t border-green-500/30">
          <p className="text-green-400 text-sm text-center">
            ✅ Tu código fue enviado al profesor. Lo verá en su panel de calificaciones.
          </p>
        </div>
      )}

      {/* Send to Teacher Section - Hidden, keeping for backwards compatibility */}
      {false && output && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium flex items-center gap-2">
                <Send className="w-4 h-4 text-green-400" />
                Enviar al Profesor
              </p>
              <p className="text-xs text-gray-600">Tu código y resultado se enviarán para calificación</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900 flex-1 sm:flex-none"
              >
                <option value="">Selecciona tu nivel...</option>
                <option value="inicial-1">Inicial 1</option>
                <option value="inicial-2">Inicial 2</option>
                <option value="primero-egb">1° EGB</option>
                <option value="segundo-egb">2° EGB</option>
                <option value="tercero-egb">3° EGB</option>
                <option value="cuarto-egb">4° EGB</option>
                <option value="quinto-egb">5° EGB</option>
                <option value="sexto-egb">6° EGB</option>
                <option value="septimo-egb">7° EGB</option>
                <option value="octavo-egb">8° EGB</option>
                <option value="noveno-egb">9° EGB</option>
                <option value="decimo-egb">10° EGB</option>
                <option value="primero-bach">1° Bachillerato</option>
                <option value="segundo-bach">2° Bachillerato</option>
                <option value="tercero-bach">3° Bachillerato</option>
              </select>
              <button
                onClick={async () => {
                  if (!studentName.trim()) {
                    alert('Por favor escribe tu nombre arriba')
                    return
                  }
                  if (!selectedLevel) {
                    alert('Por favor selecciona tu nivel')
                    return
                  }
                  setIsSending(true)
                  try {
                    const taskId = generateTaskId(code, studentName)
                    const res = await fetch('/api/submissions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        taskId,
                        studentName,
                        levelId: selectedLevel,
                        code,
                        output
                      })
                    })
                    if (res.ok) {
                      setSendSuccess(true)
                      setTimeout(() => setSendSuccess(false), 5000)
                    } else {
                      alert('Error al enviar. Inténtalo de nuevo.')
                    }
                  } catch (error) {
                    alert('Error de conexión')
                  }
                  setIsSending(false)
                }}
                disabled={isSending || sendSuccess}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                {isSending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : sendSuccess ? (
                  <><Check className="w-4 h-4" /> ¡Enviado!</>
                ) : (
                  <><Send className="w-4 h-4" /> Enviar</>
                )}
              </button>
            </div>
          </div>
          {sendSuccess && (
            <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ Tu tarea fue enviada correctamente. El profesor la verá en su panel de calificaciones.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-brand-purple" />
              Exportar Tarea
            </h3>
            
            {/* Task ID */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">ID de Verificación:</p>
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-yellow-400" />
                <code className="text-yellow-400 font-mono text-lg">{lastTaskId}</code>
                <button
                  onClick={() => copyToClipboard(lastTaskId || '', 'taskId')}
                  className="ml-auto p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {copied === 'taskId' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* QR Code Preview */}
            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl">
                  <img src={qrDataUrl} alt="QR Code" className="w-40 h-40" />
                  <p className="text-xs text-gray-500 text-center mt-2">Escanea para verificar</p>
                </div>
              </div>
            )}

            {/* Student Info */}
            <div className="bg-white/50 rounded-xl p-3 mb-4 text-sm">
              <p className="text-gray-600">
                <span className="text-gray-500">Estudiante:</span> {studentName || 'Sin nombre'}
              </p>
              <p className="text-gray-600">
                <span className="text-gray-500">Fecha:</span> {new Date().toLocaleString('es-EC')}
              </p>
            </div>

            {/* Export Options */}
            <div className="space-y-2">
              <button
                onClick={exportBoth}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium">Descargar .TXT</p>
                  <p className="text-xs text-gray-500">Archivo de texto con código y resultado</p>
                </div>
              </button>
              
              <button
                onClick={exportWithQR}
                className="w-full bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/50 text-gray-900 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"
              >
                <QrCode className="w-5 h-5 text-brand-purple" />
                <div className="text-left">
                  <p className="font-medium text-brand-purple">Descargar Imagen con QR</p>
                  <p className="text-xs text-gray-600">Imagen PNG con código QR de verificación</p>
                </div>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-4 text-gray-500 hover:text-gray-900 text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Example Exercises */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50">
        <p className="text-xs text-gray-500 mb-2">Ejercicios de ejemplo:</p>
        <div className="flex gap-2 flex-wrap">
          {EXAMPLE_EXERCISES.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example.code)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xs rounded-lg transition-colors"
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="px-4 py-2 bg-blue-900/20 border-t border-blue-500/30">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> Escribe tu nombre arriba. Al exportar, recibirás un <strong>ID único</strong> y 
          <strong> código QR</strong> que el profesor puede usar para verificar tu tarea.
        </p>
      </div>
    </div>
  )
}
