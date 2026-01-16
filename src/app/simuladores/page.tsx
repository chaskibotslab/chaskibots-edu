'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SimulatorTabs from '@/components/SimulatorTabs'
import PythonSimulator from '@/components/PythonSimulator'
import { Code, Copy, Check, Terminal, Lightbulb, BookOpen, Download } from 'lucide-react'

export default function SimuladoresPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const pythonExamples = [
    {
      id: 'variables',
      title: '1. Variables - Guardar información',
      description: 'Las variables son como cajas donde guardamos datos. Pueden ser números, texto o valores verdadero/falso.',
      code: `# Variables en Python
# Una variable guarda información

nombre = "María"      # Texto (string)
edad = 12             # Número entero (int)
altura = 1.45         # Número decimal (float)
le_gusta_robotica = True  # Verdadero o Falso (boolean)

# Mostrar las variables
print("Hola, me llamo", nombre)
print("Tengo", edad, "años")
print("Mido", altura, "metros")`
    },
    {
      id: 'print',
      title: '2. Imprimir - Mostrar mensajes',
      description: 'print() muestra mensajes en la pantalla. Es como hablar con la computadora.',
      code: `# La función print() muestra texto en pantalla

print("¡Hola Mundo!")
print("Bienvenido a Python")

# Puedes imprimir números
print(10)
print(5 + 3)

# Puedes combinar texto y números
nombre = "Carlos"
print("Hola", nombre, "¿cómo estás?")`
    },
    {
      id: 'sumas',
      title: '3. Operaciones matemáticas',
      description: 'Python puede hacer cálculos como una calculadora súper poderosa.',
      code: `# Operaciones básicas en Python

a = 10
b = 5

suma = a + b          # Suma: 15
resta = a - b         # Resta: 5
multiplicacion = a * b # Multiplicación: 50
division = a / b      # División: 2.0

print("Suma:", suma)
print("Resta:", resta)
print("Multiplicación:", multiplicacion)
print("División:", division)

# También puedes hacer esto directamente
print("10 + 20 =", 10 + 20)`
    },
    {
      id: 'input',
      title: '4. Pedir datos al usuario',
      description: 'input() permite que el usuario escriba algo y lo guardamos en una variable.',
      code: `# Pedir información al usuario

nombre = input("¿Cómo te llamas? ")
print("¡Hola", nombre + "!")

# Para números, convertimos el texto a número
edad_texto = input("¿Cuántos años tienes? ")
edad = int(edad_texto)  # Convertir a número

print("En 5 años tendrás", edad + 5, "años")`
    },
    {
      id: 'condicionales',
      title: '5. Decisiones con if',
      description: 'if permite que el programa tome decisiones según condiciones.',
      code: `# Tomar decisiones con if

edad = 12

if edad >= 18:
    print("Eres mayor de edad")
else:
    print("Eres menor de edad")

# Ejemplo con nota
nota = 85

if nota >= 90:
    print("¡Excelente! Tienes A")
elif nota >= 80:
    print("¡Muy bien! Tienes B")
elif nota >= 70:
    print("Bien, tienes C")
else:
    print("Necesitas estudiar más")`
    },
    {
      id: 'bucles',
      title: '6. Repetir con for',
      description: 'for repite acciones varias veces. Muy útil para no escribir lo mismo muchas veces.',
      code: `# Repetir acciones con for

# Contar del 1 al 5
for numero in range(1, 6):
    print("Número:", numero)

print("---")

# Recorrer una lista
frutas = ["manzana", "banana", "naranja"]
for fruta in frutas:
    print("Me gusta la", fruta)

print("---")

# Tabla de multiplicar del 3
for i in range(1, 11):
    print("3 x", i, "=", 3 * i)`
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Simuladores Online
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Practica programación, electrónica y robótica con estos simuladores interactivos. 
              ¡Todos sin necesidad de registro para empezar!
            </p>
          </div>

          {/* Guía Básica de Python para Principiantes */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Code className="w-7 h-7 text-green-400" />
              Aprende Python desde Cero
            </h2>
            <p className="text-gray-400 mb-6">
              Python es el lenguaje más fácil para empezar a programar. Aquí tienes los conceptos básicos 
              que necesitas. <strong className="text-green-400">¡Copia el código y pruébalo en los simuladores de abajo!</strong>
            </p>

            <div className="space-y-6">
              {pythonExamples.map((example) => (
                <div key={example.id} className="bg-dark-800/70 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-dark-600">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      {example.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{example.description}</p>
                  </div>
                  <div className="relative">
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto bg-dark-900/50">
                      <code>{example.code}</code>
                    </pre>
                    <button
                      onClick={() => copyCode(example.code, example.id)}
                      className="absolute top-2 right-2 p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                      title="Copiar código"
                    >
                      {copiedCode === example.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-dark-700/50 rounded-xl p-4 flex items-start gap-3">
              <Terminal className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">¿Dónde practicar?</p>
                <p className="text-gray-400 text-sm">
                  Usa <strong className="text-cyan-400">Trinket Python</strong> o <strong className="text-cyan-400">Programiz Python</strong> 
                  en las pestañas de abajo. ¡No necesitas crear cuenta! Solo copia el código, pégalo y presiona "Run".
                </p>
              </div>
            </div>
          </div>

          {/* Sección Educativa - Qué Aprenderás */}
          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-cyan-400" />
              Categorías de Simuladores
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-cyan mb-2">Python</h4>
                <p className="text-gray-400 text-sm">Variables, bucles, funciones. El lenguaje más usado en IA.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-green mb-2">MicroPython</h4>
                <p className="text-gray-400 text-sm">Python para microcontroladores ESP32 y Raspberry Pi Pico.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-purple mb-2">Arduino/Electrónica</h4>
                <p className="text-gray-400 text-sm">Circuitos, sensores y programación de hardware.</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4">
                <h4 className="font-semibold text-neon-orange mb-2">CNC/Industrial</h4>
                <p className="text-gray-400 text-sm">G-Code, robótica industrial y manufactura digital.</p>
              </div>
            </div>
          </div>

          {/* Simulador Python Propio con Exportación */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Simulador Python ChaskiBots</h2>
                <p className="text-gray-400 text-sm">Ejecuta código y exporta tu tarea (código + resultado)</p>
              </div>
            </div>
            <PythonSimulator />
          </div>

          <SimulatorTabs />

          <div className="mt-8 bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-2">
              💡 Consejo
            </h3>
            <p className="text-gray-400">
              Si algún simulador externo no carga correctamente, usa el botón 
              "Abrir en su web" para acceder directamente. El simulador Python de ChaskiBots 
              funciona completamente en tu navegador sin necesidad de conexión externa.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
