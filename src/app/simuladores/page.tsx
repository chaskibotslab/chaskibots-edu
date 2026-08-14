'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Code, Copy, Check, Terminal, Lightbulb, BookOpen, Download, Loader2, Brain, Cog, ChevronDown, Hash, PlayCircle } from 'lucide-react'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-chaski-primary" />
    <span className="ml-2 text-slate-400">Cargando simulador...</span>
  </div>
)

const SimulatorTabsDynamic = dynamic(() => import('@/components/SimulatorTabsDynamic'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const PythonIDE = dynamic(() => import('@/components/PythonIDE'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const AILab = dynamic(() => import('@/components/AILab'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const CADLab = dynamic(() => import('@/components/CADLab'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

const pythonChapters = [
  {
    id: 'ch1',
    chapter: 1,
    title: 'Variables y Tipos de Datos',
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
    id: 'ch2',
    chapter: 2,
    title: 'Imprimir - Mostrar mensajes',
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
    id: 'ch3',
    chapter: 3,
    title: 'Operaciones Matemáticas',
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
    id: 'ch4',
    chapter: 4,
    title: 'Pedir Datos al Usuario',
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
    id: 'ch5',
    chapter: 5,
    title: 'Decisiones con if / elif / else',
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
    id: 'ch6',
    chapter: 6,
    title: 'Bucles - Repetir con for',
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

export default function SimuladoresPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [openChapter, setOpenChapter] = useState<string | null>('ch1')

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleChapter = (id: string) => {
    setOpenChapter(openChapter === id ? null : id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-chaski-dark">
      <Header />

      <main className="flex-1 py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-chaski-dark text-white p-8 text-center shadow-2xl animate-fade-in border border-white/5">
            <div className="absolute top-0 left-0 w-64 h-64 bg-chaski-primary/15 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-chaski-gold/10 rounded-full blur-[90px]"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-4 animate-slide-up">
                <span className="w-1.5 h-1.5 rounded-full bg-chaski-primary animate-pulse" />
                <Terminal className="w-4 h-4 text-chaski-primary" />
                <span className="text-white/80 text-sm font-medium">Aprende Programando</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                Simuladores Online
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Practica programación, electrónica y robótica con simuladores interactivos.
                <span className="text-chaski-primary font-medium"> ¡Sin necesidad de registro!</span>
              </p>
            </div>
          </div>

          {/* ═══ LIBRO DE PYTHON ═══ */}
          <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {/* Book header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-hack-green/10 rounded-2xl flex items-center justify-center border border-hack-green/20">
                <BookOpen className="w-7 h-7 text-hack-green" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Libro de Python</h2>
                <p className="text-slate-400 text-sm">
                  6 capítulos · Desde cero · <span className="text-hack-green font-medium">Copia el código y pruébalo abajo</span>
                </p>
              </div>
              <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-slate-500">
                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-hack-green rounded-full" style={{ width: '100%' }} />
                </div>
                6/6 lecciones
              </div>
            </div>

            {/* Chapter list - book style */}
            <div className="space-y-2">
              {pythonChapters.map((ch, i) => {
                const isOpen = openChapter === ch.id
                return (
                  <div key={ch.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-white/[0.04] border-hack-green/30 shadow-lg shadow-hack-green/5' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}>
                    {/* Chapter header - clickable */}
                    <button
                      onClick={() => toggleChapter(ch.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left group"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-all shrink-0 ${isOpen ? 'bg-hack-green/20 text-hack-green border border-hack-green/30' : 'bg-white/5 text-slate-500 border border-white/10 group-hover:text-white'}`}>
                        {ch.chapter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm transition-colors ${isOpen ? 'text-hack-green' : 'text-white/80 group-hover:text-white'}`}>
                          {ch.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{ch.description}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-hack-green' : ''}`} />
                    </button>

                    {/* Chapter content - collapsible */}
                    {isOpen && (
                      <div className="px-5 pb-5 animate-fade-in">
                        <div className="bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden">
                          {/* Code header bar */}
                          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 ml-2">cap{ch.chapter}.py</span>
                            </div>
                            <button
                              onClick={() => copyCode(ch.code, ch.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-hack-green/15 border border-white/10 hover:border-hack-green/30 text-xs text-slate-400 hover:text-hack-green transition-all active:scale-95"
                              title="Copiar código"
                            >
                              {copiedCode === ch.id ? (
                                <><Check className="w-3.5 h-3.5 text-hack-green" /> Copiado</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copiar</>
                              )}
                            </button>
                          </div>
                          {/* Code block */}
                          <pre className="p-4 text-sm text-slate-300 overflow-x-auto font-mono leading-relaxed">
                            <code>{ch.code}</code>
                          </pre>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                          <PlayCircle className="w-3.5 h-3.5 text-hack-green" />
                          Copia el código y ejecútalo en el IDE de abajo o en las pestañas de Trinket/Programiz
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Practice tip */}
            <div className="mt-4 bg-chaski-primary/5 border border-chaski-primary/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-chaski-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Terminal className="w-5 h-5 text-chaski-primary" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">¿Dónde practicar?</p>
                <p className="text-slate-400 text-sm">
                  Usa <strong className="text-chaski-primary">Trinket Python</strong> o <strong className="text-chaski-primary">Programiz Python</strong>
                  {' '}en las pestañas de abajo. Solo copia, pega y presiona &quot;Run&quot;.
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 md:p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-chaski-primary/10 rounded-xl flex items-center justify-center border border-chaski-primary/20">
                <Hash className="w-5 h-5 text-chaski-primary" />
              </div>
              Categorías de Simuladores
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Code, color: 'text-hack-green', bg: 'bg-hack-green/10 border-hack-green/20', title: 'Python', description: 'Variables, bucles, funciones. El lenguaje más usado en IA.' },
                { icon: Terminal, color: 'text-hack-green', bg: 'bg-hack-green/10 border-hack-green/20', title: 'MicroPython', description: 'Python para microcontroladores ESP32 y Raspberry Pi Pico.' },
                { icon: Lightbulb, color: 'text-chaski-primary', bg: 'bg-chaski-primary/10 border-chaski-primary/20', title: 'Arduino/Electrónica', description: 'Circuitos, sensores y programación de hardware.' },
                { icon: BookOpen, color: 'text-chaski-gold', bg: 'bg-chaski-gold/10 border-chaski-gold/20', title: 'CNC/Industrial', description: 'G-Code, robótica industrial y manufactura digital.' }
              ].map((cat, i) => {
                const Icon = cat.icon
                return (
                  <div key={cat.title} className="group bg-white/[0.02] rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={`w-12 h-12 ${cat.bg} border rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${cat.color}`} />
                    </div>
                    <h4 className={`font-semibold ${cat.color} mb-2`}>{cat.title}</h4>
                    <p className="text-slate-500 text-sm">{cat.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Python IDE Professional */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-hack-green/10 rounded-xl flex items-center justify-center border border-hack-green/20">
                <Code className="w-6 h-6 text-hack-green" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Python IDE Professional</h2>
                <p className="text-white/50 text-sm">Editor profesional con curriculum completo, terminal y ejecución real</p>
              </div>
            </div>
            <PythonIDE />
          </div>

          {/* AI Lab */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-chaski-gold/10 rounded-xl flex items-center justify-center border border-chaski-gold/20">
                <Brain className="w-6 h-6 text-chaski-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Laboratorio de IA Visual</h2>
                <p className="text-white/50 text-sm">Anotador, segmentación, desafío IA, cámara en vivo y modelos reales en la nube</p>
              </div>
            </div>
            <AILab />
          </div>

          {/* CAD Lab 3D */}
          <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-chaski-primary/10 rounded-xl flex items-center justify-center border border-chaski-primary/20">
                <Cog className="w-6 h-6 text-chaski-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Laboratorio CAD 3D</h2>
                <p className="text-white/50 text-sm">Visor 3D interactivo, constructor paramétrico y texto a 3D</p>
              </div>
            </div>
            <CADLab />
          </div>

          <SimulatorTabsDynamic />

          {/* Tip */}
          <div className="bg-chaski-gold/5 border border-chaski-gold/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-chaski-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-chaski-gold/20">
                <Lightbulb className="w-6 h-6 text-chaski-gold" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2">Consejo Pro</h3>
                <p className="text-slate-400">
                  Si algún simulador externo no carga, usa el botón
                  <span className="text-chaski-primary font-medium"> &quot;Abrir en su web&quot;</span>.
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
