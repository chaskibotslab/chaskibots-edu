'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Download, Trash2, Copy, Check, FileCode, FileText, RotateCcw } from 'lucide-react'

declare global {
  interface Window {
    loadPyodide: () => Promise<any>
    pyodide: any
  }
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

  const exportBoth = () => {
    const filename = studentName 
      ? `${studentName.replace(/\s+/g, '_')}_tarea.txt`
      : 'tarea_python.txt'
    
    const content = `╔════════════════════════════════════════════════════════════╗
║              TAREA DE PYTHON - CHASKIBOTS                  ║
╚════════════════════════════════════════════════════════════╝

📝 Estudiante: ${studentName || '_______________'}
📅 Fecha: ${new Date().toLocaleString('es-EC')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 CÓDIGO PYTHON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${code}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖥️ RESULTADO DE EJECUCIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${output}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Generado con ChaskiBots Education Platform
🌐 https://edu.chaskibots.com
`
    downloadFile(content, filename, 'text/plain')
  }

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-dark-900 px-4 py-3 border-b border-dark-600 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-sm font-mono">codigo.py</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tu nombre (opcional)"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white placeholder:text-gray-500 w-40"
          />
          <button
            onClick={resetCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Restaurar código inicial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={clearCode}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
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
              className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded text-gray-400 hover:text-white transition-colors"
              title="Copiar código"
            >
              {copied === 'code' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 p-4 bg-dark-900 text-gray-200 font-mono text-sm resize-none focus:outline-none"
            placeholder="Escribe tu código Python aquí..."
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="relative bg-dark-900/50">
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">▶ Salida</span>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => copyToClipboard(output, 'output')}
              className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded text-gray-400 hover:text-white transition-colors"
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
      <div className="bg-dark-900 px-4 py-3 border-t border-dark-600 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={!isPyodideReady || isRunning}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Ejecutando...' : 'Ejecutar'}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCode}
            className="bg-dark-700 hover:bg-dark-600 text-gray-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            title="Descargar código .py"
          >
            <FileCode className="w-4 h-4" />
            Código .py
          </button>
          <button
            onClick={exportOutput}
            disabled={!output}
            className="bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            title="Descargar resultado .txt"
          >
            <FileText className="w-4 h-4" />
            Resultado .txt
          </button>
          <button
            onClick={exportBoth}
            disabled={!output}
            className="bg-neon-cyan hover:bg-neon-cyan/80 disabled:opacity-50 disabled:cursor-not-allowed text-dark-900 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            title="Descargar tarea completa"
          >
            <Download className="w-4 h-4" />
            Exportar Tarea
          </button>
        </div>
      </div>

      {/* Example Exercises */}
      <div className="px-4 py-3 border-t border-dark-600 bg-dark-800/50">
        <p className="text-xs text-gray-500 mb-2">Ejercicios de ejemplo:</p>
        <div className="flex gap-2 flex-wrap">
          {EXAMPLE_EXERCISES.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example.code)}
              className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white text-xs rounded-lg transition-colors"
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="px-4 py-2 bg-blue-900/20 border-t border-blue-500/30">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> Escribe tu nombre arriba para que aparezca en los archivos exportados. 
          El botón "Exportar Tarea" genera un archivo con tu código y resultado para entregar al profesor.
        </p>
      </div>
    </div>
  )
}
