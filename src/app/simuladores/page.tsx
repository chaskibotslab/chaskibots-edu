'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Code, Copy, Check, Terminal, Lightbulb, BookOpen, Download, Loader2 } from 'lucide-react'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
    <span className="ml-2 text-gray-600">Cargando simulador...</span>
  </div>
)

const SimulatorTabs = dynamic(() => import('@/components/SimulatorTabs'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const PythonSimulator = dynamic(() => import('@/components/PythonSimulator'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

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
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-purple/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-brand-cyan/15 rounded-full blur-[90px]"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4">
                <Terminal className="w-4 h-4 text-brand-cyan" />
                <span className="text-white/90 text-sm font-medium">Aprende Programando</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">
                Simuladores Online
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto text-lg">
                Practica programación, electrónica y robótica con simuladores interactivos.
                <span className="text-brand-cyan font-medium"> ¡Sin necesidad de registro!</span>
              </p>
            </div>
          </div>

          {/* Python Guide */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Aprende Python desde Cero</h2>
                <p className="text-slate-500 text-sm">
                  Conceptos básicos. <strong className="text-green-600">Copia el código y pruébalo abajo.</strong>
                </p>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              {pythonExamples.map((example) => (
                <div key={example.id} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-green-500/30 transition-all">
                  <div className="p-4 border-b border-slate-200 bg-white">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      {example.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">{example.description}</p>
                  </div>
                  <div className="relative">
                    <pre className="p-4 text-sm text-slate-700 overflow-x-auto bg-slate-50">
                      <code>{example.code}</code>
                    </pre>
                    <button
                      onClick={() => copyCode(example.code, example.id)}
                      className="absolute top-2 right-2 p-2 bg-white hover:bg-green-50 border border-slate-200 hover:border-green-500/50 rounded-lg transition-all"
                      title="Copiar código"
                    >
                      {copiedCode === example.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Terminal className="w-5 h-5 text-brand-purple" />
              </div>
              <div>
                <p className="text-slate-900 font-semibold">¿Dónde practicar?</p>
                <p className="text-slate-600 text-sm">
                  Usa <strong className="text-brand-purple">Trinket Python</strong> o <strong className="text-brand-purple">Programiz Python</strong>
                  {' '}en las pestañas de abajo. Solo copia, pega y presiona "Run".
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-purple" />
              </div>
              Categorías de Simuladores
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Code, color: 'brand-purple', title: 'Python', description: 'Variables, bucles, funciones. El lenguaje más usado en IA.' },
                { icon: Terminal, color: 'neon-green', title: 'MicroPython', description: 'Python para microcontroladores ESP32 y Raspberry Pi Pico.' },
                { icon: Lightbulb, color: 'brand-violet', title: 'Arduino/Electrónica', description: 'Circuitos, sensores y programación de hardware.' },
                { icon: BookOpen, color: 'orange-500', title: 'CNC/Industrial', description: 'G-Code, robótica industrial y manufactura digital.' }
              ].map((cat) => {
                const Icon = cat.icon
                return (
                  <div key={cat.title} className="group bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all">
                    <div className={`w-12 h-12 bg-${cat.color}/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 text-${cat.color}`} />
                    </div>
                    <h4 className={`font-semibold text-${cat.color} mb-2`}>{cat.title}</h4>
                    <p className="text-slate-600 text-sm">{cat.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Python Simulator */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Simulador Python ChaskiBots</h2>
                <p className="text-slate-500 text-sm">Ejecuta código y exporta tu tarea</p>
              </div>
            </div>
            <PythonSimulator />
          </div>

          <SimulatorTabs />

          {/* Tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Consejo Pro</h3>
                <p className="text-slate-600">
                  Si algún simulador externo no carga, usa el botón
                  <span className="text-brand-purple font-medium"> "Abrir en su web"</span>.
                  El simulador de ChaskiBots funciona completamente en tu navegador.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
