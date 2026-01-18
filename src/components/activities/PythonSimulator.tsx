'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Play, RotateCcw, Copy, Check, ChevronRight, ChevronDown,
  BookOpen, Code, Terminal, Lightbulb, Zap, Send, Loader2
} from 'lucide-react'

interface PythonSimulatorProps {
  levelId: string
}

interface Example {
  title: string
  code: string
  description: string
}

interface Guide {
  title: string
  content: string
  examples: Example[]
}

const PYTHON_GUIDES: Record<string, Guide[]> = {
  'basico': [
    {
      title: '🎯 Variables y Tipos de Datos',
      content: 'Las variables son como cajas donde guardamos información.',
      examples: [
        {
          title: 'Crear variables',
          code: `# Variables en Python
nombre = "Ana"
edad = 12
altura = 1.45
es_estudiante = True

print("Hola, soy", nombre)
print("Tengo", edad, "años")`,
          description: 'Aprende a crear variables de texto, números y booleanos'
        },
        {
          title: 'Operaciones matemáticas',
          code: `# Calculadora simple
a = 10
b = 3

suma = a + b
resta = a - b
multiplicacion = a * b
division = a / b

print("Suma:", suma)
print("Resta:", resta)
print("Multiplicación:", multiplicacion)
print("División:", division)`,
          description: 'Realiza operaciones básicas con números'
        }
      ]
    },
    {
      title: '🔄 Condicionales (if/else)',
      content: 'Los condicionales permiten tomar decisiones en tu código.',
      examples: [
        {
          title: 'Verificar edad',
          code: `edad = 15

if edad >= 18:
    print("Eres mayor de edad")
else:
    print("Eres menor de edad")
    print("Te faltan", 18 - edad, "años")`,
          description: 'Usa if/else para tomar decisiones'
        },
        {
          title: 'Calificaciones',
          code: `nota = 85

if nota >= 90:
    print("Excelente! 🌟")
elif nota >= 80:
    print("Muy bien! 👍")
elif nota >= 70:
    print("Bien 😊")
else:
    print("Necesitas estudiar más 📚")`,
          description: 'Usa elif para múltiples condiciones'
        }
      ]
    },
    {
      title: '🔁 Bucles (for/while)',
      content: 'Los bucles repiten acciones múltiples veces.',
      examples: [
        {
          title: 'Contar del 1 al 5',
          code: `# Bucle for
for i in range(1, 6):
    print("Número:", i)

print("¡Terminé de contar!")`,
          description: 'Usa for para repetir un número específico de veces'
        },
        {
          title: 'Tabla de multiplicar',
          code: `numero = 7

print(f"Tabla del {numero}:")
for i in range(1, 11):
    resultado = numero * i
    print(f"{numero} x {i} = {resultado}")`,
          description: 'Genera tablas de multiplicar automáticamente'
        }
      ]
    }
  ],
  'intermedio': [
    {
      title: '📦 Listas y Diccionarios',
      content: 'Estructuras para almacenar múltiples datos.',
      examples: [
        {
          title: 'Trabajar con listas',
          code: `# Lista de frutas
frutas = ["manzana", "banana", "naranja"]

# Agregar elemento
frutas.append("uva")

# Recorrer lista
print("Mis frutas favoritas:")
for fruta in frutas:
    print("- " + fruta)

print(f"Total: {len(frutas)} frutas")`,
          description: 'Crea y manipula listas de elementos'
        },
        {
          title: 'Diccionarios',
          code: `# Diccionario de estudiante
estudiante = {
    "nombre": "Carlos",
    "edad": 14,
    "grado": "9no",
    "materias": ["Matemáticas", "Ciencias", "Arte"]
}

print(f"Nombre: {estudiante['nombre']}")
print(f"Edad: {estudiante['edad']}")
print("Materias:")
for materia in estudiante['materias']:
    print(f"  - {materia}")`,
          description: 'Usa diccionarios para datos estructurados'
        }
      ]
    },
    {
      title: '🔧 Funciones',
      content: 'Las funciones son bloques de código reutilizables.',
      examples: [
        {
          title: 'Crear funciones',
          code: `def saludar(nombre):
    return f"¡Hola, {nombre}! 👋"

def calcular_area(base, altura):
    return base * altura / 2

# Usar las funciones
mensaje = saludar("María")
print(mensaje)

area = calcular_area(10, 5)
print(f"El área del triángulo es: {area}")`,
          description: 'Define y usa tus propias funciones'
        },
        {
          title: 'Función con validación',
          code: `def es_par(numero):
    if numero % 2 == 0:
        return True
    return False

def clasificar_numeros(lista):
    pares = []
    impares = []
    for n in lista:
        if es_par(n):
            pares.append(n)
        else:
            impares.append(n)
    return pares, impares

numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pares, impares = clasificar_numeros(numeros)
print(f"Pares: {pares}")
print(f"Impares: {impares}")`,
          description: 'Funciones que trabajan juntas'
        }
      ]
    }
  ],
  'avanzado': [
    {
      title: '🎮 Programación Orientada a Objetos',
      content: 'Crea tus propias clases y objetos.',
      examples: [
        {
          title: 'Clase Mascota',
          code: `class Mascota:
    def __init__(self, nombre, tipo):
        self.nombre = nombre
        self.tipo = tipo
        self.energia = 100
        self.felicidad = 50
    
    def alimentar(self):
        self.energia = min(100, self.energia + 20)
        print(f"{self.nombre} comió. Energía: {self.energia}")
    
    def jugar(self):
        if self.energia >= 10:
            self.energia -= 10
            self.felicidad = min(100, self.felicidad + 15)
            print(f"{self.nombre} jugó. Felicidad: {self.felicidad}")
        else:
            print(f"{self.nombre} está muy cansado")
    
    def estado(self):
        print(f"=== {self.nombre} ({self.tipo}) ===")
        print(f"Energía: {'🟢' * (self.energia // 20)}")
        print(f"Felicidad: {'❤️' * (self.felicidad // 20)}")

# Crear mascota
mi_gato = Mascota("Michi", "Gato")
mi_gato.estado()
mi_gato.alimentar()
mi_gato.jugar()
mi_gato.estado()`,
          description: 'Crea una clase con métodos y atributos'
        },
        {
          title: 'Herencia',
          code: `class Animal:
    def __init__(self, nombre):
        self.nombre = nombre
    
    def hablar(self):
        pass

class Perro(Animal):
    def hablar(self):
        return f"{self.nombre} dice: ¡Guau guau!"

class Gato(Animal):
    def hablar(self):
        return f"{self.nombre} dice: ¡Miau!"

class Pato(Animal):
    def hablar(self):
        return f"{self.nombre} dice: ¡Cuac cuac!"

# Crear animales
animales = [
    Perro("Firulais"),
    Gato("Michi"),
    Pato("Donald")
]

for animal in animales:
    print(animal.hablar())`,
          description: 'Usa herencia para extender clases'
        }
      ]
    },
    {
      title: '📊 Algoritmos',
      content: 'Implementa algoritmos clásicos.',
      examples: [
        {
          title: 'Búsqueda binaria',
          code: `def busqueda_binaria(lista, objetivo):
    izquierda = 0
    derecha = len(lista) - 1
    pasos = 0
    
    while izquierda <= derecha:
        pasos += 1
        medio = (izquierda + derecha) // 2
        print(f"Paso {pasos}: Buscando en posición {medio}")
        
        if lista[medio] == objetivo:
            return medio, pasos
        elif lista[medio] < objetivo:
            izquierda = medio + 1
        else:
            derecha = medio - 1
    
    return -1, pasos

# Lista ordenada
numeros = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
buscar = 13

pos, pasos = busqueda_binaria(numeros, buscar)
if pos != -1:
    print(f"\\n¡Encontrado {buscar} en posición {pos}!")
    print(f"Solo tomó {pasos} pasos")
else:
    print(f"{buscar} no está en la lista")`,
          description: 'Algoritmo eficiente de búsqueda'
        },
        {
          title: 'Ordenamiento burbuja',
          code: `def ordenar_burbuja(lista):
    n = len(lista)
    pasos = 0
    
    for i in range(n):
        for j in range(0, n-i-1):
            pasos += 1
            if lista[j] > lista[j+1]:
                lista[j], lista[j+1] = lista[j+1], lista[j]
                print(f"Intercambio: {lista}")
    
    return lista, pasos

numeros = [64, 34, 25, 12, 22, 11, 90]
print(f"Lista original: {numeros}")
print("\\nOrdenando...")

ordenada, pasos = ordenar_burbuja(numeros.copy())
print(f"\\nLista ordenada: {ordenada}")
print(f"Total de comparaciones: {pasos}")`,
          description: 'Visualiza cómo funciona el ordenamiento'
        }
      ]
    }
  ]
}

interface Task {
  id: string
  title: string
}

export default function PythonSimulator({ levelId }: PythonSimulatorProps) {
  const [code, setCode] = useState('# Escribe tu código Python aquí\nprint("¡Hola Mundo!")')
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeGuide, setActiveGuide] = useState<number | null>(null)
  const [showGuides, setShowGuides] = useState(true)
  const [studentName, setStudentName] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  // Cargar tareas del nivel
  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch(`/api/tasks?levelId=${levelId}`)
        const data = await res.json()
        if (data.tasks) {
          setTasks(data.tasks.map((t: any) => ({ id: t.id, title: t.title })))
        }
      } catch (error) {
        console.log('No tasks available')
      }
    }
    loadTasks()
  }, [levelId])

  const getLevel = (): 'basico' | 'intermedio' | 'avanzado' => {
    if (['primero-bach', 'segundo-bach', 'tercero-bach'].includes(levelId)) return 'avanzado'
    if (['octavo-egb', 'noveno-egb', 'decimo-egb'].includes(levelId)) return 'intermedio'
    return 'basico'
  }

  const guides = PYTHON_GUIDES[getLevel()]

  const simulatePython = (sourceCode: string): string[] => {
    const results: string[] = []
    const variables: Record<string, any> = {}
    const functions: Record<string, { params: string[], body: string[] }> = {}
    const classes: Record<string, any> = {}
    
    const lines = sourceCode.split('\n')
    let i = 0
    
    const evaluateExpression = (expr: string): any => {
      expr = expr.trim()
      
      // String
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1)
      }
      
      // f-string
      if (expr.startsWith('f"') || expr.startsWith("f'")) {
        let str = expr.slice(2, -1)
        str = str.replace(/\{([^}]+)\}/g, (_, varName) => {
          return String(evaluateExpression(varName))
        })
        return str
      }
      
      // Number
      if (!isNaN(Number(expr))) {
        return Number(expr)
      }
      
      // Boolean
      if (expr === 'True') return true
      if (expr === 'False') return false
      
      // List
      if (expr.startsWith('[') && expr.endsWith(']')) {
        const items = expr.slice(1, -1).split(',').map(item => evaluateExpression(item.trim()))
        return items
      }
      
      // Variable
      if (variables[expr] !== undefined) {
        return variables[expr]
      }
      
      // len()
      if (expr.startsWith('len(')) {
        const inner = expr.slice(4, -1)
        const val = evaluateExpression(inner)
        return Array.isArray(val) ? val.length : String(val).length
      }
      
      // range()
      if (expr.startsWith('range(')) {
        const inner = expr.slice(6, -1)
        const parts = inner.split(',').map(p => evaluateExpression(p.trim()))
        if (parts.length === 1) return Array.from({ length: parts[0] }, (_, i) => i)
        if (parts.length === 2) return Array.from({ length: parts[1] - parts[0] }, (_, i) => i + parts[0])
        return Array.from({ length: Math.ceil((parts[1] - parts[0]) / parts[2]) }, (_, i) => parts[0] + i * parts[2])
      }
      
      // min/max
      if (expr.startsWith('min(')) {
        const inner = expr.slice(4, -1)
        const parts = inner.split(',').map(p => evaluateExpression(p.trim()))
        return Math.min(...parts)
      }
      if (expr.startsWith('max(')) {
        const inner = expr.slice(4, -1)
        const parts = inner.split(',').map(p => evaluateExpression(p.trim()))
        return Math.max(...parts)
      }
      
      // Arithmetic
      if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/') || expr.includes('%') || expr.includes('//')) {
        try {
          let evalExpr = expr
          Object.keys(variables).forEach(v => {
            evalExpr = evalExpr.replace(new RegExp(`\\b${v}\\b`, 'g'), JSON.stringify(variables[v]))
          })
          evalExpr = evalExpr.replace(/\/\//g, '/')
          return eval(evalExpr)
        } catch {
          return expr
        }
      }
      
      // Dictionary access
      if (expr.includes('[') && expr.includes(']')) {
        const match = expr.match(/(\w+)\[['"]?(\w+)['"]?\]/)
        if (match) {
          const [, varName, key] = match
          if (variables[varName] && typeof variables[varName] === 'object') {
            return variables[varName][key]
          }
        }
      }
      
      // Attribute access
      if (expr.includes('.')) {
        const parts = expr.split('.')
        let obj = variables[parts[0]]
        for (let i = 1; i < parts.length && obj; i++) {
          obj = obj[parts[i]]
        }
        return obj
      }
      
      return expr
    }
    
    const processLine = (line: string, indent: number = 0): void => {
      line = line.trim()
      if (!line || line.startsWith('#')) return
      
      // print statement
      if (line.startsWith('print(')) {
        const content = line.slice(6, -1)
        const parts = content.split(',').map(p => {
          const val = evaluateExpression(p.trim())
          return String(val)
        })
        results.push(parts.join(' '))
        return
      }
      
      // Variable assignment
      if (line.includes('=') && !line.includes('==') && !line.startsWith('if') && !line.startsWith('elif') && !line.startsWith('while') && !line.startsWith('for')) {
        const [varName, ...valueParts] = line.split('=')
        const value = valueParts.join('=').trim()
        
        // Dictionary
        if (value.startsWith('{')) {
          try {
            const jsonStr = value.replace(/'/g, '"')
            variables[varName.trim()] = JSON.parse(jsonStr)
          } catch {
            variables[varName.trim()] = value
          }
        } else {
          variables[varName.trim()] = evaluateExpression(value)
        }
        return
      }
    }
    
    try {
      for (i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmed = line.trim()
        
        if (!trimmed || trimmed.startsWith('#')) continue
        
        // For loop
        if (trimmed.startsWith('for ')) {
          const match = trimmed.match(/for\s+(\w+)\s+in\s+(.+):/)
          if (match) {
            const [, varName, iterableExpr] = match
            const iterable = evaluateExpression(iterableExpr)
            const bodyLines: string[] = []
            i++
            while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].trim() === '')) {
              if (lines[i].trim()) bodyLines.push(lines[i])
              i++
            }
            i--
            
            if (Array.isArray(iterable)) {
              for (const item of iterable) {
                variables[varName] = item
                for (const bodyLine of bodyLines) {
                  processLine(bodyLine)
                }
              }
            }
          }
          continue
        }
        
        // If statement (simplified)
        if (trimmed.startsWith('if ')) {
          const condition = trimmed.slice(3, -1).trim()
          let conditionResult = false
          
          if (condition.includes('>=')) {
            const [left, right] = condition.split('>=')
            conditionResult = evaluateExpression(left.trim()) >= evaluateExpression(right.trim())
          } else if (condition.includes('<=')) {
            const [left, right] = condition.split('<=')
            conditionResult = evaluateExpression(left.trim()) <= evaluateExpression(right.trim())
          } else if (condition.includes('==')) {
            const [left, right] = condition.split('==')
            conditionResult = evaluateExpression(left.trim()) == evaluateExpression(right.trim())
          } else if (condition.includes('>')) {
            const [left, right] = condition.split('>')
            conditionResult = evaluateExpression(left.trim()) > evaluateExpression(right.trim())
          } else if (condition.includes('<')) {
            const [left, right] = condition.split('<')
            conditionResult = evaluateExpression(left.trim()) < evaluateExpression(right.trim())
          }
          
          const bodyLines: string[] = []
          i++
          while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t'))) {
            bodyLines.push(lines[i])
            i++
          }
          i--
          
          if (conditionResult) {
            for (const bodyLine of bodyLines) {
              processLine(bodyLine)
            }
          }
          continue
        }
        
        processLine(trimmed)
      }
    } catch (err: any) {
      results.push(`Error: ${err.message}`)
    }
    
    return results.length > 0 ? results : ['(Sin salida)']
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput(['⏳ Ejecutando...'])
    
    setTimeout(() => {
      const results = simulatePython(code)
      setOutput(results)
      setIsRunning(false)
    }, 500)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadExample = (example: Example) => {
    setCode(example.code)
    setOutput([])
  }

  const handleSendToTeacher = async () => {
    if (!studentName.trim()) {
      alert('Por favor escribe tu nombre')
      return
    }
    if (output.length === 0) {
      alert('Primero ejecuta tu código')
      return
    }

    setIsSending(true)
    try {
      // Usar tarea seleccionada o generar ID único
      const taskId = selectedTask || `PY-${Date.now().toString(36).toUpperCase()}`
      const taskTitle = tasks.find(t => t.id === selectedTask)?.title || 'Código Python'
      
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          studentName,
          levelId,
          lessonId: selectedTask,
          code,
          output: `Tarea: ${taskTitle}\n\n${output.join('\n')}`
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
  }

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">Simulador Python</h3>
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
            {getLevel().charAt(0).toUpperCase() + getLevel().slice(1)}
          </span>
        </div>
        <button
          onClick={() => setShowGuides(!showGuides)}
          className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
        >
          <BookOpen className="w-4 h-4" />
          {showGuides ? 'Ocultar' : 'Mostrar'} Guías
        </button>
      </div>

      {/* Guides */}
      {showGuides && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Guías y Ejemplos</span>
          </div>
          <div className="space-y-2">
            {guides.map((guide, idx) => (
              <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveGuide(activeGuide === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-white">{guide.title}</span>
                  {activeGuide === idx ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {activeGuide === idx && (
                  <div className="p-3 bg-gray-900/50 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-3">{guide.content}</p>
                    <div className="grid gap-2">
                      {guide.examples.map((example, exIdx) => (
                        <button
                          key={exIdx}
                          onClick={() => loadExample(example)}
                          className="flex items-center justify-between p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                        >
                          <div>
                            <div className="text-sm font-medium text-white">{example.title}</div>
                            <div className="text-xs text-gray-500">{example.description}</div>
                          </div>
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-gray-400">codigo.py</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Copiar código"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setCode('# Escribe tu código Python aquí\n')}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Limpiar"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="# Escribe tu código Python aquí"
          />
        </div>

        {/* Output */}
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Salida</span>
            </div>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Ejecutando...' : 'Ejecutar'}
            </button>
          </div>
          <div
            ref={outputRef}
            className="h-64 p-4 overflow-y-auto font-mono text-sm"
          >
            {output.map((line, idx) => (
              <div key={idx} className="text-white">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enviar al Profesor */}
      {output.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  Enviar al Profesor
                </p>
                <p className="text-xs text-gray-400">Tu código y resultado se enviarán para calificación</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Tu nombre..."
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white"
              />
              
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white"
              >
                <option value="">Selecciona tarea (opcional)</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
                <option value="">Práctica libre</option>
              </select>
              
              <button
                onClick={handleSendToTeacher}
                disabled={isSending || sendSuccess}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
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
            <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm text-center">
                ✅ Tu código fue enviado correctamente. El profesor lo verá en su panel de calificaciones.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-300">
            <strong>Tip:</strong> Este es un simulador educativo. Soporta variables, print, bucles for, 
            condicionales if/else, y operaciones básicas. ¡Perfecto para aprender los fundamentos!
          </div>
        </div>
      </div>
    </div>
  )
}
