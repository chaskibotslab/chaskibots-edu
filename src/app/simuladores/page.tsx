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
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Header />
      
      <main className="flex-1 py-12 px-4 relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-neon-green/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full px-4 py-2 mb-4">
              <Terminal className="w-4 h-4 text-neon-cyan" />
              <span className="text-neon-cyan text-sm font-medium">Aprende Programando</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Simuladores </span>
              <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">Online</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Practica programación, electrónica y robótica con estos simuladores interactivos. 
              <span className="text-neon-green font-medium"> ¡Todos sin necesidad de registro!</span>
            </p>
          </div>

          {/* Guía Básica de Python para Principiantes - Futurista */}
          <div className="relative group mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-dark-800/80 backdrop-blur-xl border border-neon-green/30 rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-50"></div>
              
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-green/20 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-neon-green" />
                </div>
                Aprende Python desde Cero
              </h2>
              <p className="text-gray-400 mb-6">
                Python es el lenguaje más fácil para empezar a programar. Aquí tienes los conceptos básicos 
                que necesitas. <strong className="text-neon-green">¡Copia el código y pruébalo en los simuladores de abajo!</strong>
              </p>

            <div className="space-y-6">
              {pythonExamples.map((example) => (
                <div key={example.id} className="group/card bg-dark-700/50 rounded-xl overflow-hidden border border-dark-600 hover:border-neon-green/30 transition-all duration-300">
                  <div className="p-4 border-b border-dark-600 bg-dark-800/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      {example.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{example.description}</p>
                  </div>
                  <div className="relative">
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto bg-dark-900/70">
                      <code>{example.code}</code>
                    </pre>
                    <button
                      onClick={() => copyCode(example.code, example.id)}
                      className="absolute top-2 right-2 p-2.5 bg-dark-600 hover:bg-neon-green/20 border border-dark-500 hover:border-neon-green/50 rounded-lg transition-all duration-300"
                      title="Copiar código"
                    >
                      {copiedCode === example.id ? (
                        <Check className="w-4 h-4 text-neon-green" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

              <div className="mt-6 bg-gradient-to-r from-neon-cyan/10 to-neon-cyan/5 border border-neon-cyan/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-neon-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-5 h-5 text-neon-cyan" />
                </div>
                <div>
                  <p className="text-white font-semibold">¿Dónde practicar?</p>
                  <p className="text-gray-400 text-sm">
                    Usa <strong className="text-neon-cyan">Trinket Python</strong> o <strong className="text-neon-cyan">Programiz Python</strong> 
                    en las pestañas de abajo. ¡No necesitas crear cuenta! Solo copia el código, pégalo y presiona "Run".
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Educativa - Categorías Futuristas */}
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-dark-800/60 backdrop-blur-xl border border-neon-cyan/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-cyan/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-neon-cyan" />
                </div>
                Categorías de Simuladores
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="group bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-neon-cyan/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-neon-cyan/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-neon-cyan/20 transition-colors">
                    <Code className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <h4 className="font-semibold text-neon-cyan mb-2">Python</h4>
                  <p className="text-gray-400 text-sm">Variables, bucles, funciones. El lenguaje más usado en IA.</p>
                </div>
                <div className="group bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-neon-green/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-neon-green/20 transition-colors">
                    <Terminal className="w-6 h-6 text-neon-green" />
                  </div>
                  <h4 className="font-semibold text-neon-green mb-2">MicroPython</h4>
                  <p className="text-gray-400 text-sm">Python para microcontroladores ESP32 y Raspberry Pi Pico.</p>
                </div>
                <div className="group bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-neon-purple/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-neon-purple/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-neon-purple/20 transition-colors">
                    <Lightbulb className="w-6 h-6 text-neon-purple" />
                  </div>
                  <h4 className="font-semibold text-neon-purple mb-2">Arduino/Electrónica</h4>
                  <p className="text-gray-400 text-sm">Circuitos, sensores y programación de hardware.</p>
                </div>
                <div className="group bg-dark-700/50 rounded-xl p-5 border border-dark-600 hover:border-orange-500/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-orange-400" />
                  </div>
                  <h4 className="font-semibold text-orange-400 mb-2">CNC/Industrial</h4>
                  <p className="text-gray-400 text-sm">G-Code, robótica industrial y manufactura digital.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulador Python Propio con Exportación - Futurista */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-green/20 to-emerald-500/10 rounded-xl flex items-center justify-center border border-neon-green/30">
                <Download className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Simulador Python ChaskiBots</h2>
                <p className="text-gray-400 text-sm">Ejecuta código y exporta tu tarea (código + resultado)</p>
              </div>
            </div>
            <PythonSimulator />
          </div>

          <SimulatorTabs />

          <div className="mt-10 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-dark-800/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Consejo Pro</h3>
                  <p className="text-gray-400">
                    Si algún simulador externo no carga correctamente, usa el botón 
                    <span className="text-neon-cyan font-medium"> "Abrir en su web"</span> para acceder directamente. 
                    El simulador Python de ChaskiBots funciona completamente en tu navegador sin necesidad de conexión externa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
