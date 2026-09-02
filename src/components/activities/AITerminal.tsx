'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Brain, Terminal as TerminalIcon, Copy, Download, Trash2, Send, Check,
  Loader2, BookOpen, CheckCircle2, Circle, Maximize2, Minimize2,
  X, Package, Play, Square, RotateCcw, Plus, File, Rocket, Camera, VideoOff, Upload, Usb, Unplug,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/AuthProvider'
import {
  ensurePyodide, runPython, installPyPackage, IMG_PREFIX, RELOAD_BUTTON_MARKER, isInputBlockedError,
  registerCameraVideoElement, onCameraStateChange, stopCamera as stopSharedCamera,
  onImageUploaded, onSerialStateChange, onSerialLine, connectSerial, disconnectSerial,
} from '@/lib/pythonRunner'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

// ============================================================
// AI EXERCISES - Built-in progressive curriculum
// ============================================================
interface ExerciseStep {
  title: string
  explanation: string
  code: string
}

interface AIExercise {
  id: string
  title: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  description: string
  theory: string
  steps: ExerciseStep[]
  expected_output?: string
}

const EXERCISE_CATEGORIES = [
  { id: 'basics', name: 'Python + IA Basico', icon: '\u{1F9E0}', color: 'text-green-400' },
  { id: 'numpy', name: 'NumPy & Arrays', icon: '\u{1F522}', color: 'text-blue-400' },
  { id: 'data', name: 'Datos & Estadistica', icon: '\u{1F4CA}', color: 'text-yellow-400' },
  { id: 'ml', name: 'Machine Learning', icon: '\u{1F916}', color: 'text-purple-400' },
  { id: 'nn', name: 'Redes Neuronales', icon: '\u{1F9EC}', color: 'text-pink-400' },
  { id: 'vision', name: 'Vision & Imagenes', icon: '\u{1F4F7}', color: 'text-cyan-400' },
  { id: 'nlp', name: 'Lenguaje Natural', icon: '\u{1F4AC}', color: 'text-orange-400' },
  { id: 'gen', name: 'IA Generativa', icon: '\u{2728}', color: 'text-rose-400' },
]

const AI_EXERCISES: AIExercise[] = [
  // === PYTHON + IA BASICO ===
  {
    id: 'intro-ia', title: 'Hola Mundo IA', icon: '\u{1F44B}', difficulty: 'easy', category: 'basics',
    description: 'Tu primer programa de IA - conceptos fundamentales',
    theory: `# Tu primer día en una startup de IA

## El caso

Te acaban de contratar en una startup que vende zapatillas online. El dueño te dice:
"recibimos cientos de comentarios de clientes por día y nadie tiene tiempo de leerlos todos
— necesito saber rápido cuáles son quejas y cuáles son elogios". Tu primera tarea: armar la
versión más simple posible de un clasificador de sentimiento, sin ninguna librería todavía,
solo para entender la idea antes de usar herramientas más potentes.

## Lo que vas a aprender

- **IA Estrecha** vs **IA General**: tu clasificador va a ser bueno en UNA sola tarea (esto es
  IA Estrecha — como casi todo lo que existe hoy).
- **Machine Learning**: acá vas a programar las reglas vos mismo; en ML, la máquina las
  aprendería sola a partir de ejemplos. Es el siguiente paso natural.
- Python es el lenguaje #1 de IA por librerías como NumPy, Pandas, TensorFlow — las vas a usar
  en los próximos ejercicios.`,
    steps: [
      {
        title: 'Paso 1: Tus primeros ejemplos etiquetados',
        explanation: 'Todo modelo de IA arranca con datos ya clasificados por un humano — esto se llama dataset de entrenamiento.',
        code: `# Hola Mundo de Inteligencia Artificial
print("=" * 50)
print("  INTELIGENCIA ARTIFICIAL - ChaskiBots Lab")
print("=" * 50)

# Los datos son la base de la IA: comentarios de clientes ya etiquetados
datos_entrenamiento = [
    {"texto": "me encanta", "sentimiento": "positivo"},
    {"texto": "es horrible", "sentimiento": "negativo"},
    {"texto": "que genial", "sentimiento": "positivo"},
    {"texto": "no me gusta", "sentimiento": "negativo"},
]

print(f"\\nDataset: {len(datos_entrenamiento)} muestras")
print("\\nDatos de entrenamiento:")
for d in datos_entrenamiento:
    emoji = "+" if d["sentimiento"] == "positivo" else "-"
    print(f"  [{emoji}] '{d['texto']}' -> {d['sentimiento']}")`,
      },
      {
        title: 'Paso 2: Un modelo simple basado en reglas',
        explanation: 'Antes de aprender de datos, probá con la forma más simple: contar palabras positivas y negativas.',
        code: `# Hola Mundo de Inteligencia Artificial
print("=" * 50)
print("  INTELIGENCIA ARTIFICIAL - ChaskiBots Lab")
print("=" * 50)

# Los datos son la base de la IA: comentarios de clientes ya etiquetados
datos_entrenamiento = [
    {"texto": "me encanta", "sentimiento": "positivo"},
    {"texto": "es horrible", "sentimiento": "negativo"},
    {"texto": "que genial", "sentimiento": "positivo"},
    {"texto": "no me gusta", "sentimiento": "negativo"},
]

print(f"\\nDataset: {len(datos_entrenamiento)} muestras")
print("\\nDatos de entrenamiento:")
for d in datos_entrenamiento:
    emoji = "+" if d["sentimiento"] == "positivo" else "-"
    print(f"  [{emoji}] '{d['texto']}' -> {d['sentimiento']}")

# Un modelo simple basado en reglas escritas a mano
palabras_positivas = ["encanta", "genial", "bueno", "excelente", "amor"]
palabras_negativas = ["horrible", "malo", "gusta no", "odio", "terrible"]

def predecir_sentimiento(texto):
    texto = texto.lower()
    score = 0
    for p in palabras_positivas:
        if p in texto:
            score += 1
    for n in palabras_negativas:
        if n in texto:
            score -= 1
    if score > 0:
        return "positivo", score
    elif score < 0:
        return "negativo", score
    return "neutral", score

print("\\nModelo de reglas listo — probemos con comentarios nuevos en el siguiente paso.")`,
      },
      {
        title: 'Paso 3: Clasificar comentarios que nunca viste',
        explanation: 'La prueba real de un modelo: ¿funciona con textos que no estaban en el dataset de entrenamiento?',
        code: `# Hola Mundo de Inteligencia Artificial
print("=" * 50)
print("  INTELIGENCIA ARTIFICIAL - ChaskiBots Lab")
print("=" * 50)

datos_entrenamiento = [
    {"texto": "me encanta", "sentimiento": "positivo"},
    {"texto": "es horrible", "sentimiento": "negativo"},
    {"texto": "que genial", "sentimiento": "positivo"},
    {"texto": "no me gusta", "sentimiento": "negativo"},
]

print(f"\\nDataset: {len(datos_entrenamiento)} muestras")

palabras_positivas = ["encanta", "genial", "bueno", "excelente", "amor"]
palabras_negativas = ["horrible", "malo", "gusta no", "odio", "terrible"]

def predecir_sentimiento(texto):
    texto = texto.lower()
    score = 0
    for p in palabras_positivas:
        if p in texto:
            score += 1
    for n in palabras_negativas:
        if n in texto:
            score -= 1
    if score > 0:
        return "positivo", score
    elif score < 0:
        return "negativo", score
    return "neutral", score

# Comentarios NUEVOS de clientes reales de la tienda de zapatillas
print("\\n--- COMENTARIOS DE CLIENTES (nuevos) ---")
pruebas = ["me encanta la pizza", "es horrible el clima", "hoy es un dia normal"]
for texto in pruebas:
    resultado, confianza = predecir_sentimiento(texto)
    print(f"  '{texto}' -> {resultado} (score: {confianza})")

print("\\nEsto es IA basada en reglas que programaste a mano.")
print("Con Machine Learning, la maquina aprenderia esas reglas SOLA de los datos.")`,
      },
    ],
  },
  {
    id: 'variables-ia', title: 'Variables para IA', icon: '\u{1F4E6}', difficulty: 'easy', category: 'basics',
    description: 'Tipos de datos esenciales para Machine Learning',
    theory: `# El sistema de un hospital

## El caso

Un hospital te contrata para digitalizar los datos de sus pacientes: edades, alturas, pesos,
historiales completos. Cada tipo de dato necesita una estructura distinta en Python — usar la
incorrecta puede hacer que tu sistema de IA para diagnóstico falle sin que te des cuenta.

## Lo que vas a aprender

- **Features (X)**: las variables de entrada de un modelo (edad, altura, peso...)
- **Labels (y)**: lo que queremos predecir (diagnóstico, riesgo...)
- Los 4 tipos de datos que vas a usar en TODO proyecto de IA: numéricos, listas, tablas
  (matrices) y diccionarios.`,
    steps: [
      {
        title: 'Paso 1: Datos numéricos de un paciente',
        explanation: 'Edad, temperatura, dosis — todo lo que se puede medir con un número.',
        code: `# Variables y Tipos de Datos para un sistema hospitalario
print("=== TIPOS DE DATOS EN IA ===\\n")

# Numericos - fundamentales para calculos
edad = 25
temperatura = 36.5
learning_rate = 0.001
print(f"Numericos: edad={edad}, temp={temperatura}, lr={learning_rate}")`,
      },
      {
        title: 'Paso 2: Una lista de mediciones',
        explanation: 'Los datos de muchos pacientes juntos forman un dataset — una lista de Python.',
        code: `# Variables y Tipos de Datos para un sistema hospitalario
print("=== TIPOS DE DATOS EN IA ===\\n")

edad = 25
temperatura = 36.5
learning_rate = 0.001
print(f"Numericos: edad={edad}, temp={temperatura}, lr={learning_rate}")

# Listas - representan datasets (alturas de varios pacientes)
alturas = [1.65, 1.78, 1.52, 1.90, 1.73]
print(f"\\nDataset alturas: {alturas}")
print(f"  Promedio: {sum(alturas)/len(alturas):.2f}m")
print(f"  Min: {min(alturas)}, Max: {max(alturas)}")`,
      },
      {
        title: 'Paso 3: Una tabla completa de pacientes',
        explanation: 'Un hospital real no tiene una sola medida por paciente — necesitás una tabla (matriz).',
        code: `# Variables y Tipos de Datos para un sistema hospitalario
print("=== TIPOS DE DATOS EN IA ===\\n")

edad = 25
alturas = [1.65, 1.78, 1.52, 1.90, 1.73]
print(f"Dataset alturas: {alturas}")

# Matrices (listas de listas) - la ficha de cada paciente en una fila
dataset = [
    [1.65, 55, 22],  # [altura, peso, edad]
    [1.78, 72, 35],
    [1.52, 48, 19],
    [1.90, 88, 40],
]
print(f"\\nMatriz de pacientes ({len(dataset)} filas x {len(dataset[0])} columnas):")
for fila in dataset:
    print(f"  {fila}")`,
      },
      {
        title: 'Paso 4: Configuración y categorías',
        explanation: 'Los diccionarios guardan configuración (como la de un modelo), y el one-hot encoding convierte categorías (como diagnósticos) en números que un modelo puede usar.',
        code: `# Variables y Tipos de Datos para un sistema hospitalario
print("=== TIPOS DE DATOS EN IA ===\\n")

dataset = [
    [1.65, 55, 22],
    [1.78, 72, 35],
    [1.52, 48, 19],
    [1.90, 88, 40],
]
print(f"Matriz de pacientes: {len(dataset)} filas")

# Diccionarios - metadatos y configuracion del modelo de diagnostico
modelo_config = {
    "nombre": "DiagnosticoIA_v1",
    "capas": [784, 128, 64, 10],
    "activacion": "relu",
    "epochs": 50,
    "accuracy": 0.95
}
print(f"\\nConfiguracion del modelo:")
for k, v in modelo_config.items():
    print(f"  {k}: {v}")

# One-hot encoding (representacion de categorias, ej: tipo de diagnostico)
categorias = {"gato": [1,0,0], "perro": [0,1,0], "ave": [0,0,1]}
print(f"\\nOne-hot encoding (mismo principio para diagnosticos, especies, etc):")
for animal, vector in categorias.items():
    print(f"  {animal} -> {vector}")

print("\\nEstos tipos de datos son la BASE de todo sistema de IA real!")`,
      },
    ],
  },
  {
    id: 'funciones-ia', title: 'Funciones de IA', icon: '\u{2699}\u{FE0F}', difficulty: 'easy', category: 'basics',
    description: 'Funciones esenciales para procesar datos de IA',
    theory: `# La caja de herramientas de cualquier red neuronal

## El caso

Vas a programar una red neuronal en las próximas lecciones — pero antes necesitás las piezas
matemáticas que CUALQUIER modelo de IA usa por dentro, una y otra vez. En vez de escribirlas
sueltas cuando las necesites, las armás ahora como funciones reutilizables: tu propia caja de
herramientas de IA.

## Lo que vas a aprender

Cinco funciones que vas a reconocer en cada ejercicio de acá en adelante: activación,
normalización, distancia, error, y probabilidades.`,
    steps: [
      {
        title: 'Paso 1: La función de activación (sigmoide)',
        explanation: 'Convierte cualquier número en un valor entre 0 y 1 — así "decide" una neurona si se activa o no.',
        code: `# Funciones Esenciales para IA
import math

print("=== FUNCIONES FUNDAMENTALES DE IA ===\\n")

# Funcion Sigmoide - clasica en redes neuronales
def sigmoid(x):
    return 1 / (1 + math.exp(-x))

print("1. Funcion Sigmoide (activacion):")
for x in [-3, -1, 0, 1, 3]:
    print(f"   sigmoid({x:+d}) = {sigmoid(x):.4f}")`,
      },
      {
        title: 'Paso 2: Normalizar datos a la misma escala',
        explanation: 'Si mezclás edades (0-100) con salarios (0-100000), el modelo le da más peso al salario solo por ser un número más grande. Normalizar lo evita.',
        code: `# Funciones Esenciales para IA
import math

print("=== FUNCIONES FUNDAMENTALES DE IA ===\\n")

def sigmoid(x):
    return 1 / (1 + math.exp(-x))
print("1. Sigmoide lista.")

# Normalizacion Min-Max (escalar datos entre 0 y 1)
def normalizar(datos):
    min_val = min(datos)
    max_val = max(datos)
    return [(x - min_val) / (max_val - min_val) for x in datos]

datos_raw = [150, 200, 80, 300, 120]
datos_norm = normalizar(datos_raw)
print(f"\\n2. Normalizacion Min-Max:")
print(f"   Original:    {datos_raw}")
print(f"   Normalizado: [{', '.join(f'{x:.2f}' for x in datos_norm)}]")`,
      },
      {
        title: 'Paso 3: Medir qué tan parecidos son dos puntos',
        explanation: 'La distancia euclidiana es la base de KNN (la vas a usar en un ejercicio próximo) para saber qué tan "cerca" está un dato de otro.',
        code: `# Funciones Esenciales para IA
import math

print("=== FUNCIONES FUNDAMENTALES DE IA ===\\n")

def normalizar(datos):
    min_val, max_val = min(datos), max(datos)
    return [(x - min_val) / (max_val - min_val) for x in datos]
print("Normalizacion lista.")

# Distancia Euclidiana (base de KNN)
def distancia(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

a = [1, 2, 3]
b = [4, 5, 6]
print(f"\\n3. Distancia Euclidiana:")
print(f"   Punto A: {a}")
print(f"   Punto B: {b}")
print(f"   Distancia: {distancia(a, b):.4f}")`,
      },
      {
        title: 'Paso 4: Medir qué tan equivocado está el modelo',
        explanation: 'El MSE (error cuadrático medio) le dice a un modelo qué tan lejos están sus predicciones de la realidad — es lo que va a intentar minimizar en Regresión Lineal.',
        code: `# Funciones Esenciales para IA
import math

print("=== FUNCIONES FUNDAMENTALES DE IA ===\\n")

def distancia(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))
print("Distancia lista.")

# Funcion de costo (Mean Squared Error)
def mse(reales, predichos):
    n = len(reales)
    return sum((r - p) ** 2 for r, p in zip(reales, predichos)) / n

reales = [3.0, 5.0, 7.0, 9.0]
predichos = [2.8, 5.2, 6.8, 9.5]
print(f"\\n4. Error Cuadratico Medio (MSE):")
print(f"   Reales:    {reales}")
print(f"   Predichos: {predichos}")
print(f"   MSE: {mse(reales, predichos):.4f}")`,
      },
      {
        title: 'Paso 5: Convertir puntajes en probabilidades',
        explanation: 'Softmax convierte números sueltos (logits) en probabilidades que suman 100% — así un clasificador dice "80% gato, 15% perro, 5% ave".',
        code: `# Funciones Esenciales para IA
import math

print("=== FUNCIONES FUNDAMENTALES DE IA ===\\n")

def mse(reales, predichos):
    return sum((r-p)**2 for r,p in zip(reales, predichos)) / len(reales)
print("MSE listo.")

# Softmax (probabilidades para clasificacion)
def softmax(x):
    exp_x = [math.exp(i) for i in x]
    total = sum(exp_x)
    return [e/total for e in exp_x]

logits = [2.0, 1.0, 0.1]
probs = softmax(logits)
clases = ["gato", "perro", "ave"]
print(f"\\n5. Softmax (clasificacion):")
print(f"   Logits: {logits}")
print(f"   Probabilidades:")
for clase, prob in zip(clases, probs):
    bar = "#" * int(prob * 30)
    print(f"   {clase:6s} {bar} {prob:.1%}")

print("\\nEstas 5 funciones son los bloques basicos de la IA - las vas a reusar!")`,
      },
    ],
  },
  {
    id: 'chatbot-interactivo', title: 'Chatbot Interactivo', icon: '\u{1F5E8}\u{FE0F}', difficulty: 'easy', category: 'basics',
    description: 'Usa input() para crear un chatbot que conversa contigo',
    theory: `# El bot de soporte de una tienda online

## El caso

Una tienda online te pide armar el primer borrador de su bot de atención al cliente — algo que
responda preguntas frecuentes sin que un humano tenga que estar ahí las 24 horas. Vas a
construir la misma estructura que usa cualquier chatbot, incluido ChatGPT: **recibir texto
(input), procesarlo, generar una respuesta.**

## Cómo funciona \`input()\`

- \`respuesta = input("Pregunta: ")\` — muestra el mensaje y espera lo que escribas.
- Siempre devuelve texto (string), aunque escribas un número.`,
    steps: [
      {
        title: 'Paso 1: La base de conocimiento del bot',
        explanation: 'Antes de conversar, el bot necesita saber qué responder — un diccionario de preguntas frecuentes.',
        code: `# Chatbot de soporte - usa input() real!
print("=" * 45)
print("  CHASKI-BOT: Soporte de la tienda")
print("=" * 45)

# Base de conocimiento del bot
respuestas = {
    "hola": "Hola! Soy Chaski-Bot, tu asistente de soporte",
    "como estas": "Excelente! Procesando pedidos a toda velocidad",
    "que es la ia": "La IA es la capacidad de las maquinas de aprender y razonar",
    "que es python": "Python es el lenguaje #1 para Inteligencia Artificial",
    "quien te creo": "Me programaron en ChaskiBots Lab, Ecuador",
    "chiste": "Por que Python no usa corbata? Porque ya tiene su propia clase!",
}

def responder(mensaje):
    mensaje = mensaje.lower().strip()
    for clave, respuesta in respuestas.items():
        if clave in mensaje:
            return respuesta
    return "Interesante... aun estoy aprendiendo sobre eso. Prueba: 'que es la ia'"

print("\\nBase de conocimiento lista - en el siguiente paso hablamos con el bot.")`,
      },
      {
        title: 'Paso 2: La conversación real con input()',
        explanation: 'Ahora sí — un bucle que recibe tu texto, lo procesa, y responde, igual que cualquier chatbot real.',
        code: `# Chatbot de soporte - usa input() real!
print("=" * 45)
print("  CHASKI-BOT: Soporte de la tienda")
print("=" * 45)
print("(escribe 'adios' para terminar)\\n")

respuestas = {
    "hola": "Hola! Soy Chaski-Bot, tu asistente de soporte",
    "como estas": "Excelente! Procesando pedidos a toda velocidad",
    "que es la ia": "La IA es la capacidad de las maquinas de aprender y razonar",
    "que es python": "Python es el lenguaje #1 para Inteligencia Artificial",
    "quien te creo": "Me programaron en ChaskiBots Lab, Ecuador",
    "chiste": "Por que Python no usa corbata? Porque ya tiene su propia clase!",
}

def responder(mensaje):
    mensaje = mensaje.lower().strip()
    for clave, respuesta in respuestas.items():
        if clave in mensaje:
            return respuesta
    return "Interesante... aun estoy aprendiendo sobre eso. Prueba: 'que es la ia'"

# Bucle de conversacion (maximo 5 turnos)
nombre = input("Como te llamas? ")
print(f"\\nMucho gusto, {nombre}! Preguntame algo.\\n")

for turno in range(5):
    mensaje = input(f"{nombre}: ")
    if "adios" in mensaje.lower():
        print(f"Chaski-Bot: Hasta pronto, {nombre}!")
        break
    print(f"Chaski-Bot: {responder(mensaje)}\\n")
else:
    print("\\nChaski-Bot: Se acabaron los turnos. Hasta pronto!")

print("\\nAsi funciona la estructura basica de TODO chatbot, incluido ChatGPT!")`,
      },
    ],
  },
  {
    id: 'adivina-numero', title: 'IA que Adivina', icon: '\u{1F3B2}', difficulty: 'easy', category: 'basics',
    description: 'Busqueda binaria: la IA adivina tu numero en 7 intentos',
    theory: `# El mismo truco que usa el buscador de contactos de tu celular

## El caso

Pensá un número del 1 al 100. Vas a programar una IA que lo adivina en **máximo 7 intentos**
— no por suerte, sino con el mismo algoritmo que usa tu celular para encontrar un contacto en
una lista ordenada de miles de nombres, sin revisarlos uno por uno.

## Cómo lo logra

Divide el rango a la mitad en cada intento: 100 → 50 → 25 → 12 → 6 → 3 → 1. Esto es **búsqueda
binaria**, la base de los árboles de decisión en Machine Learning: log2(100) ≈ 6.6 intentos
como máximo, sin importar qué número hayas pensado.`,
    steps: [
      {
        title: 'Paso 1: El rango inicial',
        explanation: 'Todo arranca sabiendo el rango completo posible: del 1 al 100.',
        code: `# La IA adivina tu numero con busqueda binaria
print("=" * 45)
print("  LA IA ADIVINA TU NUMERO")
print("=" * 45)
print("Piensa un numero del 1 al 100.\\n")

bajo, alto = 1, 100
medio = (bajo + alto) // 2
print(f"Primer intento: le apuesto a que tu numero es {medio}")
print("(en el siguiente paso, la IA sigue preguntando hasta adivinar)")`,
      },
      {
        title: 'Paso 2: El juego completo',
        explanation: 'Cada vez que respondés "mayor" o "menor", la IA descarta la mitad del rango — así llega a tu número en pocos intentos.',
        code: `# La IA adivina tu numero con busqueda binaria
# Piensa un numero del 1 al 100!
print("=" * 45)
print("  LA IA ADIVINA TU NUMERO")
print("=" * 45)
print("Piensa un numero del 1 al 100.")
print("Responde: 'mayor', 'menor' o 'si' si adivine\\n")

bajo, alto = 1, 100
intentos = 0

while bajo <= alto:
    intentos += 1
    medio = (bajo + alto) // 2
    print(f"Intento {intentos}: Tu numero es {medio}?")
    respuesta = input("Es 'mayor', 'menor' o 'si'? ").lower().strip()

    if "si" in respuesta:
        print(f"\\nLo adivine en {intentos} intentos!")
        print(f"Busqueda binaria: log2(100) = 6.6 intentos maximo")
        print("Asi de eficiente es el pensamiento algoritmico!")
        break
    elif "mayor" in respuesta:
        bajo = medio + 1
    elif "menor" in respuesta:
        alto = medio - 1
    else:
        print("   (no entendi, asumire 'mayor')")
        bajo = medio + 1
else:
    print("\\nMmm, creo que cambiaste tu numero! El rango quedo vacio.")

print(f"\\nLa IA uso BUSQUEDA BINARIA: dividir el problema a la mitad cada vez")`,
      },
    ],
  },
  // === NUMPY & ARRAYS ===
  {
    id: 'numpy-basics', title: 'NumPy Fundamentos', icon: '\u{1F522}', difficulty: 'easy', category: 'numpy',
    description: 'Arrays y operaciones vectorizadas con NumPy real',
    theory: `# El cerebro de un robot que sigue líneas

## El caso

Estás programando el "cerebro" de un robot que sigue una línea usando sensores de luz. Cada
sensor manda un número muchas veces por segundo, y tenés que combinarlos matemáticamente para
decidir cuánto girar los motores — en tiempo real, sin que el robot "piense" y choque. Con
listas de Python comunes, hacer esto para cientos de sensores por segundo sería demasiado
lento. Por eso casi toda la IA real usa **NumPy**.

## Por qué NumPy y no listas de Python

Una lista de Python es una lista de objetos genéricos. Un \`ndarray\` de NumPy es un bloque de
memoria contiguo de un solo tipo — por eso es mucho más rápido, y es lo que hace viable
procesar miles de sensores (o entrenar redes con millones de números) en tiempo real.`,
    steps: [
      {
        title: 'Paso 1: Tu primer array — lecturas de sensores',
        explanation: 'Un array de NumPy representa las lecturas de varios sensores de una sola vez.',
        code: `# NumPy Fundamentos - el cerebro de un robot que sigue lineas
import numpy as np

print("=== NUMPY FUNDAMENTOS (real) ===\\n")

# Lecturas de 5 sensores de luz del robot
print("1. Creacion de Arrays:")
sensores = np.array([1, 2, 3, 4, 5])
print(f"   Sensores: {sensores}  (dtype={sensores.dtype}, shape={sensores.shape})")
print(f"   Zeros: {np.zeros(5)}")
print(f"   Ones:  {np.ones(5)}")
np.random.seed(42)
rand = np.random.random(5)
print(f"   Random: {np.round(rand, 3)}")`,
      },
      {
        title: 'Paso 2: Combinar todos los sensores a la vez',
        explanation: 'Vectorización: operás sobre los 5 sensores en una sola línea, sin loops — así se combinan en tiempo real.',
        code: `# NumPy Fundamentos - el cerebro de un robot que sigue lineas
import numpy as np

print("=== NUMPY FUNDAMENTOS (real) ===\\n")

sensores = np.array([1, 2, 3, 4, 5])
print(f"1. Sensores: {sensores}")

# Operaciones vectorizadas (SIN for loops) - calibracion de sensores
print("\\n2. Operaciones Vectorizadas:")
calibracion = np.array([10, 20, 30, 40, 50])
print(f"   sensores = {sensores}")
print(f"   calibracion = {calibracion}")
print(f"   sensores * calibracion = {sensores * calibracion}")
print(f"   sensores + 10 = {sensores + 10}   <- broadcasting: suma 10 a CADA sensor")
print(f"   calibracion / sensores = {calibracion / sensores}")`,
      },
      {
        title: 'Paso 3: Cómo decide el robot cuánto girar',
        explanation: 'El producto punto combina las lecturas de los sensores con "pesos" para dar UN solo número de decisión — exactamente lo que calcula una neurona.',
        code: `# NumPy Fundamentos - el cerebro de un robot que sigue lineas
import numpy as np

print("=== NUMPY FUNDAMENTOS (real) ===\\n")

sensores = np.array([1, 2, 3, 4, 5])
print(f"1-2. Sensores y operaciones listas.")

# Producto punto (fundamental en redes neuronales y en el robot)
print("\\n3. Producto Punto (como decide el robot cuanto girar):")
weights = np.array([0.5, -0.3, 0.8, 0.1, -0.6])
inputs = np.array([1.0, 2.0, 0.5, 3.0, 1.5])
resultado = np.dot(weights, inputs)
print(f"   Pesos:    {weights}")
print(f"   Entradas: {inputs}")
print(f"   w . x = {resultado:.4f}   <- exactamente lo que calcula UNA neurona")`,
      },
      {
        title: 'Paso 4: Estadísticas de una vuelta completa',
        explanation: 'Con métodos del array podés saber, tras una vuelta al circuito, el promedio y los extremos de las lecturas.',
        code: `# NumPy Fundamentos - el cerebro de un robot que sigue lineas
import numpy as np

print("=== NUMPY FUNDAMENTOS (real) ===\\n")
print("1-3. Arrays, vectorizacion y producto punto listos.")

# Estadisticas (metodos del array, no funciones sueltas)
print("\\n4. Estadisticas de una vuelta al circuito:")
datos = np.array([23, 45, 12, 67, 34, 89, 56, 78, 90, 11])
print(f"   Lecturas: {datos}")
print(f"   Media: {datos.mean():.2f}")
print(f"   Std:   {datos.std():.2f}")
print(f"   Min:   {datos.min()}, Max: {datos.max()}")
print(f"   Ordenado: {np.sort(datos)}")`,
      },
      {
        title: 'Paso 5: Una grilla de sensores en 2D',
        explanation: 'Si el robot tiene sensores en filas y columnas (una grilla), reshape organiza los mismos datos sin copiarlos.',
        code: `# NumPy Fundamentos - el cerebro de un robot que sigue lineas
import numpy as np

print("=== NUMPY FUNDAMENTOS (real) ===\\n")
print("1-4. Arrays, vectorizacion, producto punto y estadisticas listos.")

# Reshape (cambiar dimensiones sin copiar los datos)
print("\\n5. Reshape (grilla de sensores 3x4):")
flat = np.arange(1, 13)
matrix = flat.reshape(3, 4)
print(f"   Original (1D): {flat}  shape={flat.shape}")
print(f"   Reshape (3x4): shape={matrix.shape}")
print(matrix)`,
      },
      {
        title: 'Paso 6: Por qué esto importa a gran escala',
        explanation: 'Con miles de sensores por segundo, la diferencia entre listas de Python y NumPy deja de ser cosmética.',
        code: `# NumPy Fundamentos - el cerebro de un robot que sigue lineas
import numpy as np
import time

print("=== NUMPY FUNDAMENTOS (real) ===\\n")
print("1-5. Todo lo anterior listo.")

# Comparacion de velocidad real: NumPy vs Python puro
print("\\n6. NumPy vs Python puro (100,000 lecturas de sensores):")
n = 100_000
py_list = list(range(n))
np_array = np.arange(n)

t0 = time.time()
py_result = [x * 2 for x in py_list]
t_python = time.time() - t0

t0 = time.time()
np_result = np_array * 2
t_numpy = time.time() - t0

print(f"   Python puro: {t_python*1000:.2f} ms")
print(f"   NumPy:       {t_numpy*1000:.2f} ms")
print(f"   NumPy fue {t_python/max(t_numpy, 0.0001):.0f}x mas rapido")
print("\\nPor esto NINGUN robot ni red neuronal real usa listas de Python puras.")`,
      },
    ],
  },
  // === DATOS & ESTADISTICA ===
  {
    id: 'graficos-datos', title: 'Graficos con Matplotlib', icon: '\u{1F4C8}', difficulty: 'medium', category: 'data',
    description: 'Visualiza datos con graficos REALES de matplotlib',
    theory: `# El reporte que tu jefe realmente va a leer

## El caso

Entrenaste un modelo (como el Perceptrón o la Regresión Lineal de otras lecciones) y tu jefe
te pide un reporte del entrenamiento. Le mandás una tabla con 20 números… y no la abre. Le
mandás un gráfico… y lo entiende en 2 segundos. "Una imagen vale más que mil filas de datos".

## Matplotlib

La librería de gráficos #1 de Python: \`plt.plot()\` (líneas), \`plt.bar()\` (barras),
\`plt.scatter()\` (dispersión). En este simulador, el gráfico aparece directo en la terminal.`,
    steps: [
      {
        title: 'Paso 1: Los datos del entrenamiento',
        explanation: 'Simulamos cómo evolucionan accuracy (precisión) y loss (error) mientras un modelo se entrena — subiendo y bajando, como en la vida real.',
        code: `# Graficos REALES con matplotlib - reporte de entrenamiento
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import random
import math

print("Generando datos de entrenamiento...")

# Precision (accuracy) y error (loss) de un modelo durante el entrenamiento
epochs = list(range(1, 21))
accuracy = [0.5 + 0.45 * (1 - math.exp(-e/5)) + random.uniform(-0.02, 0.02) for e in epochs]
loss = [2.0 * math.exp(-e/4) + random.uniform(0, 0.05) for e in epochs]

print(f"Accuracy final: {accuracy[-1]:.2%}")
print(f"Loss final: {loss[-1]:.4f}")
print("Datos listos - en el siguiente paso armamos el grafico.")`,
      },
      {
        title: 'Paso 2: Armar la figura con estilo',
        explanation: 'Una figura con 2 gráficos lado a lado (subplots), con el estilo dark que combina con el resto del simulador.',
        code: `# Graficos REALES con matplotlib - reporte de entrenamiento
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import random
import math

epochs = list(range(1, 21))
accuracy = [0.5 + 0.45 * (1 - math.exp(-e/5)) + random.uniform(-0.02, 0.02) for e in epochs]
loss = [2.0 * math.exp(-e/4) + random.uniform(0, 0.05) for e in epochs]

# Crear figura con 2 subgraficos, estilo dark
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
fig.patch.set_facecolor('#0d1117')

for ax in (ax1, ax2):
    ax.set_facecolor('#161b22')
    ax.tick_params(colors='white')
    for spine in ax.spines.values():
        spine.set_color('gray')

print("Figura armada - en el siguiente paso dibujamos las curvas.")`,
      },
      {
        title: 'Paso 3: El gráfico completo',
        explanation: 'Dibujamos accuracy subiendo y loss bajando — el patrón clásico de un modelo que está aprendiendo bien.',
        code: `# Graficos REALES con matplotlib - reporte de entrenamiento
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import random
import math

print("Generando datos y graficos...")

epochs = list(range(1, 21))
accuracy = [0.5 + 0.45 * (1 - math.exp(-e/5)) + random.uniform(-0.02, 0.02) for e in epochs]
loss = [2.0 * math.exp(-e/4) + random.uniform(0, 0.05) for e in epochs]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
fig.patch.set_facecolor('#0d1117')
for ax in (ax1, ax2):
    ax.set_facecolor('#161b22')
    ax.tick_params(colors='white')
    for spine in ax.spines.values():
        spine.set_color('gray')

# Grafico de accuracy
ax1.plot(epochs, accuracy, 'o-', color='#10B981', linewidth=2, markersize=4)
ax1.set_title('Accuracy del Modelo', color='white', fontweight='bold')
ax1.set_xlabel('Epoch', color='white')
ax1.set_ylabel('Accuracy', color='white')
ax1.grid(True, alpha=0.2)

# Grafico de loss
ax2.plot(epochs, loss, 'o-', color='#EF4444', linewidth=2, markersize=4)
ax2.set_title('Loss del Modelo', color='white', fontweight='bold')
ax2.set_xlabel('Epoch', color='white')
ax2.set_ylabel('Loss', color='white')
ax2.grid(True, alpha=0.2)

plt.tight_layout()

print(f"Accuracy final: {accuracy[-1]:.2%}")
print(f"Loss final: {loss[-1]:.4f}")
print("\\nMira el grafico abajo! Asi se monitorea el entrenamiento de una IA real")`,
      },
    ],
  },
  {
    id: 'estadistica-basica', title: 'Estadistica para IA', icon: '\u{1F4CA}', difficulty: 'easy', category: 'data',
    description: 'Media, mediana, desviacion: la base de todo modelo de ML',
    theory: `# ¿Cómo le fue a tu curso en el examen?

## El caso

Sos profe de un curso de 30 estudiantes y acabás de cargar las notas del examen. Antes de
entregarlas, querés saber: ¿la clase entendió el tema en general? ¿hay alguna nota tan rara
que capaz fue un error de carga? Esto es exactamente lo primero que hace cualquier proyecto de
Machine Learning antes de entrenar nada: entender los datos.

## Medidas fundamentales

**Media** (promedio), **mediana** (valor central, ignora outliers), **moda** (más frecuente),
**desviación estándar** (qué tan dispersos están los datos) — las cuatro preguntas que le hacés
a cualquier dataset antes de usarlo.`,
    steps: [
      {
        title: 'Paso 1: Las notas del curso',
        explanation: 'Simulamos 30 notas realistas (con variación natural, como un curso de verdad).',
        code: `# Estadistica para IA - notas de un curso
import statistics as stats
import random

print("=== ESTADISTICA PARA IA ===\\n")

# Simular calificaciones de 30 estudiantes
random.seed(42)
notas = [round(random.gauss(7.5, 1.5), 1) for _ in range(30)]
notas = [max(0, min(10, n)) for n in notas]  # limitar 0-10

print(f"Notas de 30 estudiantes:")
print(f"  {notas}")`,
      },
      {
        title: 'Paso 2: Las 4 medidas fundamentales',
        explanation: 'Media, mediana, moda y desviación estándar te dan un resumen completo del curso en 4 números.',
        code: `# Estadistica para IA - notas de un curso
import statistics as stats
import random

print("=== ESTADISTICA PARA IA ===\\n")

random.seed(42)
notas = [round(random.gauss(7.5, 1.5), 1) for _ in range(30)]
notas = [max(0, min(10, n)) for n in notas]
print(f"Notas: {notas}\\n")

# Medidas de tendencia central
media = stats.mean(notas)
mediana = stats.median(notas)
moda = stats.mode(notas)
std = stats.stdev(notas)

print(f"Media:    {media:.2f}")
print(f"Mediana:  {mediana:.2f}")
print(f"Moda:     {moda}")
print(f"Desv Std: {std:.2f}")`,
      },
      {
        title: 'Paso 3: Ver la distribución completa',
        explanation: 'Un histograma muestra de un vistazo si la mayoría aprobó, o si hay dos grupos muy distintos.',
        code: `# Estadistica para IA - notas de un curso
import statistics as stats
import random

print("=== ESTADISTICA PARA IA ===\\n")

random.seed(42)
notas = [round(random.gauss(7.5, 1.5), 1) for _ in range(30)]
notas = [max(0, min(10, n)) for n in notas]
media, std = stats.mean(notas), stats.stdev(notas)
print(f"Media: {media:.2f}, Desv Std: {std:.2f}\\n")

# Histograma ASCII
print("Distribucion (histograma):")
rangos = [(0,4), (4,5), (5,6), (6,7), (7,8), (8,9), (9,10.1)]
for lo, hi in rangos:
    count = sum(1 for n in notas if lo <= n < hi)
    bar = "#" * count * 2
    print(f"  [{lo:4.1f}-{hi:4.1f}) {bar} {count}")`,
      },
      {
        title: 'Paso 4: ¿Hay alguna nota sospechosa?',
        explanation: 'Una nota muy alejada del promedio (más de 2 desviaciones) puede ser un error de carga — o un caso genuinamente extremo que vale la pena revisar.',
        code: `# Estadistica para IA - notas de un curso
import statistics as stats
import random

print("=== ESTADISTICA PARA IA ===\\n")

random.seed(42)
notas = [round(random.gauss(7.5, 1.5), 1) for _ in range(30)]
notas = [max(0, min(10, n)) for n in notas]
media, std = stats.mean(notas), stats.stdev(notas)
print(f"Media: {media:.2f}, Desv Std: {std:.2f}\\n")

# Deteccion de anomalias (regla de 2 desviaciones)
print("Deteccion de anomalias (|z| > 2):")
anomalias = [n for n in notas if abs(n - media) > 2 * std]
if anomalias:
    for a in anomalias:
        z = (a - media) / std
        print(f"  Nota {a} -> z-score = {z:+.2f} (ANOMALIA)")
else:
    print("  Sin anomalias detectadas")

# Normalizacion Z-score (preprocesamiento tipico de ML)
print("\\nNormalizacion Z-score (primeras 5 notas):")
for n in notas[:5]:
    z = (n - media) / std
    print(f"  {n:5.1f} -> {z:+.3f}")

print("\\nTodo modelo de ML empieza con este analisis de datos!")`,
      },
    ],
  },
  // === MACHINE LEARNING ===
  {
    id: 'knn-clasificador', title: 'KNN Clasificador', icon: '\u{1F3AF}', difficulty: 'medium', category: 'ml',
    description: 'Implementa K-Nearest Neighbors desde cero',
    theory: `# La app que identifica flores por foto

## El caso

Trabajás en una app de jardinería que identifica especies de flores. Antes de meterle fotos
(eso viene con vision por computadora, en otra lección), empezás con el mismo dataset que usa
el mundo real para aprender clasificación: medidas de pétalos de 3 especies distintas.

## Cómo funciona KNN (K-Nearest Neighbors)

1. Llega una flor nueva a clasificar.
2. Calculás la distancia a TODAS las flores que ya conocés.
3. Mirás los K vecinos más cercanos.
4. La especie más común entre esos K vecinos es tu predicción.

Simple, no necesita entrenamiento previo, y es sorprendentemente efectivo con datasets chicos.`,
    steps: [
      {
        title: 'Paso 1: El dataset de flores conocidas',
        explanation: 'Cada flor es un punto (largo y ancho de pétalo) con su especie ya identificada por un botánico.',
        code: `# KNN - identificador de flores por medidas de petalo
import math
from collections import Counter

print("=== KNN - K NEAREST NEIGHBORS ===\\n")

# Dataset: flores (largo_petalo, ancho_petalo) -> especie
dataset = [
    ([1.4, 0.2], "setosa"),
    ([1.3, 0.3], "setosa"),
    ([1.5, 0.2], "setosa"),
    ([1.7, 0.4], "setosa"),
    ([4.5, 1.5], "versicolor"),
    ([4.2, 1.3], "versicolor"),
    ([4.7, 1.4], "versicolor"),
    ([4.0, 1.3], "versicolor"),
    ([6.0, 2.5], "virginica"),
    ([5.8, 2.2], "virginica"),
    ([6.3, 1.8], "virginica"),
    ([5.5, 2.1], "virginica"),
]

print("Dataset de entrenamiento (flores ya identificadas):")
print(f"  {'Largo':<8} {'Ancho':<8} {'Especie'}")
print(f"  {'-'*30}")
for features, label in dataset:
    print(f"  {features[0]:<8.1f} {features[1]:<8.1f} {label}")`,
      },
      {
        title: 'Paso 2: El algoritmo de clasificación',
        explanation: 'La función que mide distancias, encuentra los K vecinos más cercanos, y vota por la especie más común entre ellos.',
        code: `# KNN - identificador de flores por medidas de petalo
import math
from collections import Counter

print("=== KNN - K NEAREST NEIGHBORS ===\\n")

dataset = [
    ([1.4, 0.2], "setosa"), ([1.3, 0.3], "setosa"), ([1.5, 0.2], "setosa"), ([1.7, 0.4], "setosa"),
    ([4.5, 1.5], "versicolor"), ([4.2, 1.3], "versicolor"), ([4.7, 1.4], "versicolor"), ([4.0, 1.3], "versicolor"),
    ([6.0, 2.5], "virginica"), ([5.8, 2.2], "virginica"), ([6.3, 1.8], "virginica"), ([5.5, 2.1], "virginica"),
]
print(f"Dataset con {len(dataset)} flores listo.")

def distancia_euclidiana(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def knn_clasificar(punto, dataset, k=3):
    distancias = []
    for features, label in dataset:
        d = distancia_euclidiana(punto, features)
        distancias.append((d, label))
    distancias.sort(key=lambda x: x[0])
    k_vecinos = distancias[:k]
    votos = Counter([label for _, label in k_vecinos])
    prediccion = votos.most_common(1)[0][0]
    confianza = votos.most_common(1)[0][1] / k
    return prediccion, confianza, k_vecinos

print("Algoritmo KNN listo - en el siguiente paso clasificamos flores nuevas.")`,
      },
      {
        title: 'Paso 3: Clasificar flores que llegan por la app',
        explanation: 'Un usuario mide una flor nueva y la app debe decir a qué especie pertenece.',
        code: `# KNN - identificador de flores por medidas de petalo
import math
from collections import Counter

print("=== KNN - K NEAREST NEIGHBORS ===\\n")

dataset = [
    ([1.4, 0.2], "setosa"), ([1.3, 0.3], "setosa"), ([1.5, 0.2], "setosa"), ([1.7, 0.4], "setosa"),
    ([4.5, 1.5], "versicolor"), ([4.2, 1.3], "versicolor"), ([4.7, 1.4], "versicolor"), ([4.0, 1.3], "versicolor"),
    ([6.0, 2.5], "virginica"), ([5.8, 2.2], "virginica"), ([6.3, 1.8], "virginica"), ([5.5, 2.1], "virginica"),
]

def distancia_euclidiana(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def knn_clasificar(punto, dataset, k=3):
    distancias = [(distancia_euclidiana(punto, f), l) for f, l in dataset]
    distancias.sort(key=lambda x: x[0])
    k_vecinos = distancias[:k]
    votos = Counter([label for _, label in k_vecinos])
    prediccion = votos.most_common(1)[0][0]
    confianza = votos.most_common(1)[0][1] / k
    return prediccion, confianza, k_vecinos

# Flores nuevas que un usuario midio con la app
print(f"--- FLORES NUEVAS QUE LLEGAN A LA APP (K=3) ---\\n")
nuevos_puntos = [
    [1.6, 0.3],   # deberia ser setosa
    [4.3, 1.4],   # deberia ser versicolor
    [5.9, 2.0],   # deberia ser virginica
    [3.0, 1.0],   # caso ambiguo
]

for punto in nuevos_puntos:
    pred, conf, vecinos = knn_clasificar(punto, dataset, k=3)
    print(f"  Flor medida {punto} -> {pred} ({conf:.0%} confianza)")
    for dist, label in vecinos:
        print(f"    Vecino: {label} (dist={dist:.3f})")
    print()`,
      },
      {
        title: 'Paso 4: ¿Cuántos vecinos consultar?',
        explanation: 'El valor de K cambia la predicción en casos ambiguos — muy pocos vecinos son ruidosos, demasiados diluyen el resultado.',
        code: `# KNN - identificador de flores por medidas de petalo
import math
from collections import Counter

print("=== KNN - K NEAREST NEIGHBORS ===\\n")

dataset = [
    ([1.4, 0.2], "setosa"), ([1.3, 0.3], "setosa"), ([1.5, 0.2], "setosa"), ([1.7, 0.4], "setosa"),
    ([4.5, 1.5], "versicolor"), ([4.2, 1.3], "versicolor"), ([4.7, 1.4], "versicolor"), ([4.0, 1.3], "versicolor"),
    ([6.0, 2.5], "virginica"), ([5.8, 2.2], "virginica"), ([6.3, 1.8], "virginica"), ([5.5, 2.1], "virginica"),
]

def distancia_euclidiana(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def knn_clasificar(punto, dataset, k=3):
    distancias = [(distancia_euclidiana(punto, f), l) for f, l in dataset]
    distancias.sort(key=lambda x: x[0])
    votos = Counter([label for _, label in distancias[:k]])
    prediccion = votos.most_common(1)[0][0]
    confianza = votos.most_common(1)[0][1] / k
    return prediccion, confianza, distancias[:k]

# Un caso ambiguo, justo entre dos especies
print("--- EFECTO DE K en un caso ambiguo ---")
punto_test = [3.5, 1.0]
for k in [1, 3, 5]:
    pred, conf, _ = knn_clasificar(punto_test, dataset, k=k)
    print(f"  K={k}: {pred} ({conf:.0%})")

print("\\nKNN es el algoritmo mas intuitivo de Machine Learning - y ya lo programaste!")`,
      },
    ],
  },
  {
    id: 'regresion-lineal', title: 'Regresion Lineal', icon: '\u{1F4C8}', difficulty: 'medium', category: 'ml',
    description: 'Implementa regresion lineal con gradiente descendente',
    theory: `# El sistema de alerta temprana de un profesor

## El caso

Un profesor quiere anticipar qué estudiantes van a tener problemas en el examen, ANTES de que
lo rindan — usando solo un dato: cuántas horas estudiaron. Te pide un modelo que prediga la
nota a partir de las horas de estudio. Vas a encontrar la mejor línea \`y = mx + b\` que
describe esa relación, usando **gradiente descendente** — el mismo mecanismo con el que
aprenden las redes neuronales.

## Cómo funciona el gradiente descendente

1. Arrancás con \`m\` y \`b\` al azar (una línea cualquiera, mala a propósito).
2. Medís qué tan mal predice (error MSE).
3. Calculás en qué dirección moverte para mejorar (el gradiente).
4. Ajustás \`m\` y \`b\` un poquito en esa dirección. Repetís cientos de veces.`,
    steps: [
      {
        title: 'Paso 1: Los datos históricos',
        explanation: 'Horas de estudio vs. nota obtenida, de estudiantes de años anteriores.',
        code: `# Regresion Lineal - prediciendo notas por horas de estudio
import random

print("=== REGRESION LINEAL ===\\n")

# Datos historicos: horas de estudio vs nota
X = [1, 2, 3, 4, 5, 6, 7, 8]
y = [2.1, 3.8, 5.2, 6.9, 8.1, 9.5, 11.2, 12.8]

print("Datos (horas_estudio -> nota):")
for xi, yi in zip(X, y):
    bar = "#" * int(yi * 2)
    print(f"  {xi}h -> {yi:5.1f} {bar}")`,
      },
      {
        title: 'Paso 2: Arrancar con una línea mala (a propósito)',
        explanation: 'El modelo arranca sin saber nada — parámetros al azar. El entrenamiento los va a ir corrigiendo.',
        code: `# Regresion Lineal - prediciendo notas por horas de estudio
import random

print("=== REGRESION LINEAL ===\\n")

X = [1, 2, 3, 4, 5, 6, 7, 8]
y = [2.1, 3.8, 5.2, 6.9, 8.1, 9.5, 11.2, 12.8]
print("Datos historicos listos.")

# Parametros iniciales - al azar, sin ningun conocimiento todavia
m = random.uniform(-1, 1)  # pendiente
b = random.uniform(-1, 1)  # intercepto
lr = 0.01  # learning rate

print(f"\\nParametros iniciales (al azar): m={m:.4f}, b={b:.4f}")
print(f"Con esto, la prediccion para 5 horas seria: {m*5+b:.2f} (una nota sin sentido)")`,
      },
      {
        title: 'Paso 3: Entrenar — ajustar de a poquito',
        explanation: 'En cada epoch, el modelo mide su error y corrige m y b un poquito en la dirección correcta.',
        code: `# Regresion Lineal - prediciendo notas por horas de estudio
import random

print("=== REGRESION LINEAL ===\\n")

X = [1, 2, 3, 4, 5, 6, 7, 8]
y = [2.1, 3.8, 5.2, 6.9, 8.1, 9.5, 11.2, 12.8]
m = random.uniform(-1, 1)
b = random.uniform(-1, 1)
lr = 0.01
epochs = 100

print(f"Parametros iniciales: m={m:.4f}, b={b:.4f}")
print(f"\\n--- ENTRENAMIENTO ({epochs} epochs) ---\\n")

for epoch in range(epochs):
    y_pred = [m * xi + b for xi in X]
    mse = sum((real - pred)**2 for real, pred in zip(y, y_pred)) / len(y)

    # Gradientes: en que direccion ajustar m y b
    dm = -2 * sum((real - pred) * xi for real, pred, xi in zip(y, y_pred, X)) / len(y)
    db = -2 * sum((real - pred) for real, pred in zip(y, y_pred)) / len(y)

    m -= lr * dm
    b -= lr * db

    if epoch % 20 == 0 or epoch == epochs - 1:
        print(f"  Epoch {epoch:3d}: MSE={mse:.4f} | m={m:.4f} b={b:.4f}")`,
      },
      {
        title: 'Paso 4: Usar el modelo entrenado para predecir',
        explanation: 'Con el modelo ya entrenado, el profesor puede anticipar la nota de un estudiante que todavía no rindió el examen.',
        code: `# Regresion Lineal - prediciendo notas por horas de estudio
import random

print("=== REGRESION LINEAL ===\\n")

X = [1, 2, 3, 4, 5, 6, 7, 8]
y = [2.1, 3.8, 5.2, 6.9, 8.1, 9.5, 11.2, 12.8]
m, b, lr, epochs = random.uniform(-1, 1), random.uniform(-1, 1), 0.01, 100

for epoch in range(epochs):
    y_pred = [m * xi + b for xi in X]
    dm = -2 * sum((r-p)*xi for r,p,xi in zip(y, y_pred, X)) / len(y)
    db = -2 * sum((r-p) for r,p in zip(y, y_pred)) / len(y)
    m -= lr * dm
    b -= lr * db

print(f"--- MODELO ENTRENADO ---")
print(f"  y = {m:.4f}x + {b:.4f}")
print(f"  (La relacion real de los datos es aprox y = 1.5x + 0.5)")

# El profesor quiere anticipar estos 3 casos, antes del examen
print(f"\\n--- ALERTA TEMPRANA: estudiantes que aun no rindieron ---")
nuevas_horas = [9, 10, 12]
for h in nuevas_horas:
    prediccion = m * h + b
    print(f"  Estudio {h}h -> nota predicha: {prediccion:.1f}")

print("\\nAsi aprenden las redes neuronales: ajustando parametros con gradiente descendente!")`,
      },
    ],
  },
  // === REDES NEURONALES ===
  {
    id: 'perceptron', title: 'El Perceptron', icon: '\u{1F9E0}', difficulty: 'medium', category: 'nn',
    description: 'La neurona artificial mas basica - base de deep learning',
    theory: `# Una neurona que aprende su propia compuerta lógica

## El caso

Querés que un circuito prenda una luz solo cuando DOS interruptores están activados a la vez
(una compuerta lógica AND). Podrías escribir la regla vos mismo con un \`if\` — pero en vez de
eso, vas a hacer que **una sola neurona artificial la aprenda sola**, mostrándole ejemplos.
Esto es el Perceptrón: la unidad fundamental de toda red neuronal.

## Estructura de una neurona

Entradas (x1, x2) → cada una multiplicada por un peso (w1, w2) → se suman con un bias (b) →
pasan por una función de activación → esa es la salida. La neurona "aprende" ajustando sus
pesos cada vez que se equivoca (regla delta).`,
    steps: [
      {
        title: 'Paso 1: La clase Perceptrón',
        explanation: 'Una neurona con pesos al azar, que sabe predecir (forward) y corregirse a sí misma (train).',
        code: `# El Perceptron - Neurona Artificial que aprende AND
import random
import math

print("=== EL PERCEPTRON ===\\n")

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))

def sigmoid_derivative(x):
    return x * (1 - x)

class Perceptron:
    def __init__(self, n_inputs):
        self.weights = [random.uniform(-1, 1) for _ in range(n_inputs)]
        self.bias = random.uniform(-1, 1)
        self.lr = 0.5

    def predict(self, inputs):
        total = sum(w * x for w, x in zip(self.weights, inputs)) + self.bias
        return sigmoid(total)

    def train(self, inputs, expected):
        output = self.predict(inputs)
        error = expected - output
        for i in range(len(self.weights)):
            self.weights[i] += self.lr * error * sigmoid_derivative(output) * inputs[i]
        self.bias += self.lr * error * sigmoid_derivative(output)
        return error

print("Clase Perceptron lista - en el siguiente paso le enseniamos AND.")`,
      },
      {
        title: 'Paso 2: Los ejemplos de la compuerta AND',
        explanation: 'Le mostramos a la neurona las 4 combinaciones posibles de dos interruptores, y qué debería responder cada una.',
        code: `# El Perceptron - Neurona Artificial que aprende AND
import random
import math

print("=== EL PERCEPTRON ===\\n")

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))

def sigmoid_derivative(x):
    return x * (1 - x)

class Perceptron:
    def __init__(self, n_inputs):
        self.weights = [random.uniform(-1, 1) for _ in range(n_inputs)]
        self.bias = random.uniform(-1, 1)
        self.lr = 0.5

    def predict(self, inputs):
        total = sum(w * x for w, x in zip(self.weights, inputs)) + self.bias
        return sigmoid(total)

    def train(self, inputs, expected):
        output = self.predict(inputs)
        error = expected - output
        for i in range(len(self.weights)):
            self.weights[i] += self.lr * error * sigmoid_derivative(output) * inputs[i]
        self.bias += self.lr * error * sigmoid_derivative(output)
        return error

# Los 4 casos posibles de dos interruptores, con la salida esperada de AND
print("Casos de la compuerta AND:")
print("  Entrada1  Entrada2  Salida_esperada")
AND_data = [
    ([0, 0], 0),
    ([0, 1], 0),
    ([1, 0], 0),
    ([1, 1], 1),
]
for inputs, expected in AND_data:
    print(f"  {inputs[0]:^8} {inputs[1]:^8} {expected:^15}")

neuron = Perceptron(2)
print(f"\\nPesos iniciales (al azar): {[f'{w:.3f}' for w in neuron.weights]}")
print(f"Bias inicial: {neuron.bias:.3f}")`,
      },
      {
        title: 'Paso 3: Entrenar la neurona',
        explanation: 'Le mostramos los 4 casos una y otra vez (1000 epochs) — cada vez que se equivoca, ajusta sus pesos un poquito.',
        code: `# El Perceptron - Neurona Artificial que aprende AND
import random
import math

print("=== EL PERCEPTRON ===\\n")

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))
def sigmoid_derivative(x):
    return x * (1 - x)

class Perceptron:
    def __init__(self, n_inputs):
        self.weights = [random.uniform(-1, 1) for _ in range(n_inputs)]
        self.bias = random.uniform(-1, 1)
        self.lr = 0.5
    def predict(self, inputs):
        total = sum(w * x for w, x in zip(self.weights, inputs)) + self.bias
        return sigmoid(total)
    def train(self, inputs, expected):
        output = self.predict(inputs)
        error = expected - output
        for i in range(len(self.weights)):
            self.weights[i] += self.lr * error * sigmoid_derivative(output) * inputs[i]
        self.bias += self.lr * error * sigmoid_derivative(output)
        return error

AND_data = [([0, 0], 0), ([0, 1], 0), ([1, 0], 0), ([1, 1], 1)]
neuron = Perceptron(2)
print(f"Pesos iniciales: {[f'{w:.3f}' for w in neuron.weights]}")

# Entrenar mostrando los 4 casos una y otra vez
print(f"\\n--- ENTRENAMIENTO (1000 epochs) ---")
for epoch in range(1000):
    total_error = 0
    for inputs, expected in AND_data:
        error = neuron.train(inputs, expected)
        total_error += abs(error)
    if epoch % 200 == 0:
        print(f"  Epoch {epoch:4d}: Error total = {total_error:.6f}")

print(f"\\nPesos finales: {[f'{w:.3f}' for w in neuron.weights]}")
print(f"Bias final: {neuron.bias:.3f}")`,
      },
      {
        title: 'Paso 4: ¿Aprendió de verdad?',
        explanation: 'Probamos la neurona ya entrenada contra los 4 casos — y de bonus, entrenamos una segunda neurona para OR, para confirmar que el mismo método sirve para cualquier compuerta simple.',
        code: `# El Perceptron - Neurona Artificial que aprende AND
import random
import math

print("=== EL PERCEPTRON ===\\n")

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))
def sigmoid_derivative(x):
    return x * (1 - x)

class Perceptron:
    def __init__(self, n_inputs):
        self.weights = [random.uniform(-1, 1) for _ in range(n_inputs)]
        self.bias = random.uniform(-1, 1)
        self.lr = 0.5
    def predict(self, inputs):
        total = sum(w * x for w, x in zip(self.weights, inputs)) + self.bias
        return sigmoid(total)
    def train(self, inputs, expected):
        output = self.predict(inputs)
        error = expected - output
        for i in range(len(self.weights)):
            self.weights[i] += self.lr * error * sigmoid_derivative(output) * inputs[i]
        self.bias += self.lr * error * sigmoid_derivative(output)
        return error

AND_data = [([0, 0], 0), ([0, 1], 0), ([1, 0], 0), ([1, 1], 1)]
neuron = Perceptron(2)
for _ in range(1000):
    for inputs, expected in AND_data:
        neuron.train(inputs, expected)

print(f"--- RESULTADOS AND ---")
for inputs, expected in AND_data:
    output = neuron.predict(inputs)
    result = 1 if output > 0.5 else 0
    status = "OK" if result == expected else "FAIL"
    print(f"  {inputs} -> {output:.4f} (redondeo: {result}) [{status}]")

# BONUS: la misma clase, entrenada para OR en vez de AND
print(f"\\n--- BONUS: la misma neurona, entrenada para OR ---")
OR_data = [([0,0], 0), ([0,1], 1), ([1,0], 1), ([1,1], 1)]
neuron_or = Perceptron(2)
for _ in range(1000):
    for inputs, expected in OR_data:
        neuron_or.train(inputs, expected)

for inputs, expected in OR_data:
    output = neuron_or.predict(inputs)
    print(f"  {inputs} -> {output:.4f} (esperado: {expected})")

print("\\nEl perceptron es la base de TODAS las redes neuronales!")`,
      },
    ],
  },
  {
    id: 'red-neuronal', title: 'Red Neuronal XOR', icon: '\u{1F9EC}', difficulty: 'hard', category: 'nn',
    description: 'Red neuronal multicapa que resuelve XOR',
    theory: `# El problema que una sola neurona no puede resolver

## El caso

En la lección del Perceptrón, una sola neurona aprendió AND y OR sin problema. Ahora intentá
lo mismo con **XOR** — la compuerta que se usa en circuitos sumadores, que se activa cuando
las entradas son DIFERENTES (0,1 o 1,0), pero no cuando son iguales. Vas a descubrir que un
perceptrón simple **no puede** aprenderla, sin importar cuánto lo entrenes — y vas a resolverlo
agregando una capa oculta entre la entrada y la salida.

## Arquitectura

Entrada (2 neuronas) → capa oculta (4 neuronas) → salida (1 neurona). El algoritmo que permite
entrenar esto se llama **backpropagation**: propaga el error desde la salida hacia atrás, capa
por capa, ajustando los pesos de cada una.`,
    steps: [
      {
        title: 'Paso 1: La arquitectura y los datos',
        explanation: 'Definimos las 3 capas (2→4→1) con pesos al azar, y el dataset de XOR: las 4 combinaciones posibles.',
        code: `# Red Neuronal que resuelve XOR
import math
import random

print("=== RED NEURONAL MULTICAPA (XOR) ===\\n")
print("XOR es imposible para 1 perceptron - necesitamos una capa oculta.\\n")

random.seed(42)

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))
def sigmoid_deriv(x):
    return x * (1 - x)

# Arquitectura: 2 inputs -> 4 hidden -> 1 output
n_input, n_hidden, n_output = 2, 4, 1

# Pesos aleatorios de cada capa
w_hidden = [[random.uniform(-1, 1) for _ in range(n_input)] for _ in range(n_hidden)]
b_hidden = [random.uniform(-1, 1) for _ in range(n_hidden)]
w_output = [[random.uniform(-1, 1) for _ in range(n_hidden)] for _ in range(n_output)]
b_output = [random.uniform(-1, 1) for _ in range(n_output)]

# Dataset XOR: se activa solo cuando las entradas son DIFERENTES
X = [[0,0], [0,1], [1,0], [1,1]]
Y = [[0], [1], [1], [0]]

print(f"Arquitectura: {n_input} -> {n_hidden} -> {n_output}")
print("Pesos inicializados al azar - todavia no sabe nada de XOR.")`,
      },
      {
        title: 'Paso 2: Un forward pass, paso a paso',
        explanation: 'Antes de entrenar, veamos qué hace la red con un solo ejemplo: los datos avanzan de la entrada, por la capa oculta, hasta la salida.',
        code: `# Red Neuronal que resuelve XOR
import math
import random

print("=== RED NEURONAL MULTICAPA (XOR) ===\\n")
random.seed(42)

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))
def sigmoid_deriv(x):
    return x * (1 - x)

n_input, n_hidden, n_output = 2, 4, 1
w_hidden = [[random.uniform(-1, 1) for _ in range(n_input)] for _ in range(n_hidden)]
b_hidden = [random.uniform(-1, 1) for _ in range(n_hidden)]
w_output = [[random.uniform(-1, 1) for _ in range(n_hidden)] for _ in range(n_output)]
b_output = [random.uniform(-1, 1) for _ in range(n_output)]
X = [[0,0], [0,1], [1,0], [1,1]]
Y = [[0], [1], [1], [0]]

# Forward pass de UN solo ejemplo: [0,1] deberia dar 1
inputs, expected = X[1], Y[1]
hidden = []
for j in range(n_hidden):
    s = sum(inputs[i] * w_hidden[j][i] for i in range(n_input)) + b_hidden[j]
    hidden.append(sigmoid(s))
output = []
for j in range(n_output):
    s = sum(hidden[i] * w_output[j][i] for i in range(n_hidden)) + b_output[j]
    output.append(sigmoid(s))

print(f"Entrada: {inputs}  (esperado: {expected[0]})")
print(f"Activaciones capa oculta: {[round(h,3) for h in hidden]}")
print(f"Salida (sin entrenar todavia): {output[0]:.4f}")
print("\\nSin entrenamiento, la salida es basicamente al azar - por eso hace falta entrenar.")`,
      },
      {
        title: 'Paso 3: Entrenar con backpropagation',
        explanation: 'Repetimos el forward pass para los 4 casos, medimos el error, y lo propagamos hacia atrás para ajustar ambas capas — 5000 veces.',
        code: `# Red Neuronal que resuelve XOR
import math
import random

print("=== RED NEURONAL MULTICAPA (XOR) ===\\n")
random.seed(42)

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))
def sigmoid_deriv(x):
    return x * (1 - x)

n_input, n_hidden, n_output = 2, 4, 1
w_hidden = [[random.uniform(-1, 1) for _ in range(n_input)] for _ in range(n_hidden)]
b_hidden = [random.uniform(-1, 1) for _ in range(n_hidden)]
w_output = [[random.uniform(-1, 1) for _ in range(n_hidden)] for _ in range(n_output)]
b_output = [random.uniform(-1, 1) for _ in range(n_output)]
X = [[0,0], [0,1], [1,0], [1,1]]
Y = [[0], [1], [1], [0]]
lr, epochs = 0.5, 5000

print(f"--- ENTRENAMIENTO ({epochs} epochs) ---\\n")
for epoch in range(epochs):
    total_error = 0
    for inputs, expected in zip(X, Y):
        # Forward
        hidden = [sigmoid(sum(inputs[i]*w_hidden[j][i] for i in range(n_input)) + b_hidden[j]) for j in range(n_hidden)]
        output = [sigmoid(sum(hidden[i]*w_output[j][i] for i in range(n_hidden)) + b_output[j]) for j in range(n_output)]

        # Error
        output_errors = [expected[j] - output[j] for j in range(n_output)]
        total_error += sum(e**2 for e in output_errors)

        # Backprop: primero la capa de salida, despues la oculta
        output_deltas = [output_errors[j] * sigmoid_deriv(output[j]) for j in range(n_output)]
        hidden_errors = [sum(output_deltas[j] * w_output[j][i] for j in range(n_output)) for i in range(n_hidden)]
        hidden_deltas = [hidden_errors[i] * sigmoid_deriv(hidden[i]) for i in range(n_hidden)]

        # Actualizar pesos de ambas capas
        for j in range(n_output):
            for i in range(n_hidden):
                w_output[j][i] += lr * output_deltas[j] * hidden[i]
            b_output[j] += lr * output_deltas[j]
        for j in range(n_hidden):
            for i in range(n_input):
                w_hidden[j][i] += lr * hidden_deltas[j] * inputs[i]
            b_hidden[j] += lr * hidden_deltas[j]

    if epoch % 1000 == 0:
        print(f"  Epoch {epoch:5d}: Error = {total_error:.6f}")

print(f"  Epoch {epochs:5d}: Error = {total_error:.6f}")
print("\\nEl error bajo mucho - la red esta aprendiendo XOR.")`,
      },
      {
        title: 'Paso 4: ¿Aprendió XOR de verdad?',
        explanation: 'Entrenamos completo y probamos los 4 casos — donde el perceptrón simple fallaba, la red con capa oculta acierta.',
        code: `# Red Neuronal que resuelve XOR
import math
import random

print("=== RED NEURONAL MULTICAPA (XOR) ===\\n")
random.seed(42)

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))
def sigmoid_deriv(x):
    return x * (1 - x)

n_input, n_hidden, n_output = 2, 4, 1
w_hidden = [[random.uniform(-1, 1) for _ in range(n_input)] for _ in range(n_hidden)]
b_hidden = [random.uniform(-1, 1) for _ in range(n_hidden)]
w_output = [[random.uniform(-1, 1) for _ in range(n_hidden)] for _ in range(n_output)]
b_output = [random.uniform(-1, 1) for _ in range(n_output)]
X = [[0,0], [0,1], [1,0], [1,1]]
Y = [[0], [1], [1], [0]]
lr, epochs = 0.5, 5000

for epoch in range(epochs):
    for inputs, expected in zip(X, Y):
        hidden = [sigmoid(sum(inputs[i]*w_hidden[j][i] for i in range(n_input)) + b_hidden[j]) for j in range(n_hidden)]
        output = [sigmoid(sum(hidden[i]*w_output[j][i] for i in range(n_hidden)) + b_output[j]) for j in range(n_output)]
        output_errors = [expected[j] - output[j] for j in range(n_output)]
        output_deltas = [output_errors[j] * sigmoid_deriv(output[j]) for j in range(n_output)]
        hidden_errors = [sum(output_deltas[j] * w_output[j][i] for j in range(n_output)) for i in range(n_hidden)]
        hidden_deltas = [hidden_errors[i] * sigmoid_deriv(hidden[i]) for i in range(n_hidden)]
        for j in range(n_output):
            for i in range(n_hidden):
                w_output[j][i] += lr * output_deltas[j] * hidden[i]
            b_output[j] += lr * output_deltas[j]
        for j in range(n_hidden):
            for i in range(n_input):
                w_hidden[j][i] += lr * hidden_deltas[j] * inputs[i]
            b_hidden[j] += lr * hidden_deltas[j]

print(f"--- RESULTADOS XOR ---\\n")
print(f"  Input    Output   Esperado  Status")
print(f"  {'-'*42}")
for inputs, expected in zip(X, Y):
    hidden = [sigmoid(sum(inputs[i]*w_hidden[j][i] for i in range(n_input)) + b_hidden[j]) for j in range(n_hidden)]
    output = [sigmoid(sum(hidden[i]*w_output[j][i] for i in range(n_hidden)) + b_output[j]) for j in range(n_output)]
    pred = round(output[0])
    status = "OK" if pred == expected[0] else "FAIL"
    print(f"  {inputs}  ->  {output[0]:.4f}   {expected[0]}         {status}")

print("\\nLa red aprendio XOR con backpropagation - la base de Deep Learning!")`,
      },
    ],
  },
  // === VISION ===
  {
    id: 'filtros-imagen', title: 'Filtros de Imagen', icon: '\u{1F5BC}\u{FE0F}', difficulty: 'medium', category: 'vision',
    description: 'Aplica filtros REALES (blur, bordes, sharpen) con Pillow, y a tu propia foto',
    theory: `# Cómo funciona el modo "retrato" de tu cámara

## El caso

Cada vez que usás el modo blanco y negro, blur o "bordes" de una app de fotos, hay matemática
real pasando por debajo: una imagen es una matriz de píxeles (cada uno con valores RGB de
0-255), y los filtros son matrices pequeñas (kernels) que se "deslizan" sobre la imagen
combinando cada píxel con sus vecinos. Vas a programar los mismos filtros que usa cualquier
editor de fotos real, con Pillow (PIL) — nada de simulación con texto.

## Kernels comunes

- **Blur**: promedia cada píxel con sus vecinos → suaviza.
- **Sharpen**: exagera la diferencia con los vecinos → realza detalles.
- **Edge detection**: resalta donde el brillo cambia bruscamente → bordes.`,
    steps: [
      {
        title: 'Paso 1: Crear una imagen de prueba',
        explanation: 'Un gradiente de color con un círculo — así los filtros se notan claramente, sin depender de tu cámara todavía.',
        code: `# Filtros de Imagen REALES con Pillow (PIL) - no es simulacion
from PIL import Image, ImageDraw, ImageFilter

print("=== FILTROS DE IMAGEN (real) ===\\n")

# Imagen de ejemplo: fondo con gradiente + un circulo
img = Image.new("RGB", (200, 200))
for y in range(200):
    for x in range(200):
        img.putpixel((x, y), (x, y, 255 - x))
draw = ImageDraw.Draw(img)
draw.ellipse((60, 60, 140, 140), fill=(255, 255, 255))

print(f"Imagen de prueba creada: {img.size[0]}x{img.size[1]} pixeles")`,
      },
      {
        title: 'Paso 2: Aplicar los filtros reales',
        explanation: 'Los mismos filtros que usa cualquier editor de fotos, aplicados con PIL.ImageFilter.',
        code: `# Filtros de Imagen REALES con Pillow (PIL) - no es simulacion
from PIL import Image, ImageDraw, ImageFilter

print("=== FILTROS DE IMAGEN (real) ===\\n")

img = Image.new("RGB", (200, 200))
for y in range(200):
    for x in range(200):
        img.putpixel((x, y), (x, y, 255 - x))
draw = ImageDraw.Draw(img)
draw.ellipse((60, 60, 140, 140), fill=(255, 255, 255))

# Aplicar filtros REALES de Pillow
filtros = {
    "Original": img,
    "Blur": img.filter(ImageFilter.GaussianBlur(radius=4)),
    "Bordes (FIND_EDGES)": img.filter(ImageFilter.FIND_EDGES),
    "Sharpen": img.filter(ImageFilter.SHARPEN),
    "Contour": img.filter(ImageFilter.CONTOUR),
    "Emboss": img.filter(ImageFilter.EMBOSS),
}
print(f"{len(filtros)} filtros aplicados - en el siguiente paso los vemos todos juntos.")`,
      },
      {
        title: 'Paso 3: Comparar todos los resultados',
        explanation: 'Una sola grilla con los 6 resultados lado a lado, para comparar de un vistazo.',
        code: `# Filtros de Imagen REALES con Pillow (PIL) - no es simulacion
from PIL import Image, ImageDraw, ImageFilter
import matplotlib.pyplot as plt

print("=== FILTROS DE IMAGEN (real) ===\\n")

img = Image.new("RGB", (200, 200))
for y in range(200):
    for x in range(200):
        img.putpixel((x, y), (x, y, 255 - x))
draw = ImageDraw.Draw(img)
draw.ellipse((60, 60, 140, 140), fill=(255, 255, 255))

filtros = {
    "Original": img,
    "Blur": img.filter(ImageFilter.GaussianBlur(radius=4)),
    "Bordes (FIND_EDGES)": img.filter(ImageFilter.FIND_EDGES),
    "Sharpen": img.filter(ImageFilter.SHARPEN),
    "Contour": img.filter(ImageFilter.CONTOUR),
    "Emboss": img.filter(ImageFilter.EMBOSS),
}

fig, axes = plt.subplots(2, 3, figsize=(9, 6))
for ax, (nombre, imagen) in zip(axes.flat, filtros.items()):
    ax.imshow(imagen)
    ax.set_title(nombre, fontsize=10)
    ax.axis("off")
plt.tight_layout()
plt.show()

print("Listo! Cada filtro de arriba es exactamente lo que usa un editor de fotos real.")
print("\\nSiguiente ejercicio: aplica estos mismos filtros a TU cara con activar_camara().")`,
      },
    ],
  },
  {
    id: 'camara-filtros-ia', title: 'Tu Camara con Filtros de IA', icon: '\u{1F4F8}', difficulty: 'medium', category: 'vision',
    description: 'Usa tu camara real y aplicale filtros de vision por computadora a TU foto',
    theory: `# El modo retrato, pero a TU cara

## El caso

En la lección anterior aplicaste filtros a una imagen de prueba. Ahora vas a hacer lo mismo
pero con tu propia cámara, en vivo — exactamente como el modo retrato o blanco y negro de una
app de fotos real.

## Por qué 2 pasos

Pedir permiso de cámara toma un instante (vos decidís si aceptar), así que hace falta un
momento antes de poder tomar la foto. Es la misma razón por la que una app real primero "abre"
la cámara y después "captura" — no son dos cosas que puedan pasar en el mismo instante.`,
    steps: [
      {
        title: 'Paso 1: Activar tu cámara',
        explanation: 'Le pedís permiso al navegador — aceptalo, y vas a verte en vivo debajo de la terminal.',
        code: `# PASO 1: activa tu camara (dale Ejecutar, acepta el permiso)
activar_camara()
print("Camara solicitada. Espera a verte en el panel de abajo.")
print("Cuando te veas, pasa al Paso 2 con el navegador de pasos de arriba.")`,
      },
      {
        title: 'Paso 2: Tomar la foto y aplicar filtros',
        explanation: 'Con la cámara ya activa, tomás una foto real y le aplicás los mismos filtros de la lección anterior.',
        code: `# PASO 2: con la camara ya activa, toma la foto y aplicale filtros
from PIL import ImageFilter
import matplotlib.pyplot as plt

foto = tomar_foto()
if foto is None:
    print("No se detecto la camara activa - volve al Paso 1 y corre activar_camara()")
else:
    foto = foto.convert("RGB")
    filtros = {
        "Tu foto": foto,
        "Blanco y negro": foto.convert("L"),
        "Bordes": foto.filter(ImageFilter.FIND_EDGES),
        "Blur": foto.filter(ImageFilter.GaussianBlur(radius=5)),
        "Sharpen": foto.filter(ImageFilter.SHARPEN),
        "Emboss": foto.filter(ImageFilter.EMBOSS),
    }
    fig, axes = plt.subplots(2, 3, figsize=(9, 6))
    for ax, (nombre, imagen) in zip(axes.flat, filtros.items()):
        ax.imshow(imagen, cmap="gray" if imagen.mode == "L" else None)
        ax.set_title(nombre, fontsize=10)
        ax.axis("off")
    plt.tight_layout()
    plt.show()
    cerrar_camara()
    print("Listo! Los mismos filtros de vision por computadora, aplicados a TU cara.")`,
      },
    ],
  },
  {
    id: 'subir-foto-filtros', title: 'Sube tu Foto y Aplicale Filtros', icon: '\u{1F4C1}', difficulty: 'easy', category: 'vision',
    description: 'Sube una foto desde tu computadora (sin camara) y procesala con IA',
    theory: `# Cuando ya tenés la foto (no hace falta cámara)

## El caso

No siempre querés usar la cámara en vivo — a veces ya tenés una foto guardada (del celular, de
internet, de un proyecto) y querés procesarla con Python. Vas a subir un archivo real de tu
computadora y aplicarle los mismos filtros que ya conocés.

## Ideas para experimentar

Blanco y negro (\`foto.convert("L")\`), voltear (\`foto.transpose(...)\`), rotar
(\`foto.rotate(45)\`), cambiar tamaño (\`foto.resize((200,200))\`).`,
    steps: [
      {
        title: 'Paso 1: Subir el archivo',
        explanation: 'Se abre el selector de archivos de tu computadora — elegí cualquier imagen (jpg, png...).',
        code: `# PASO 1: sube una imagen desde tu computadora
subir_imagen()
print("Elige un archivo en el cuadro que se abrio.")
print("Cuando termines, pasa al Paso 2 con el navegador de pasos de arriba.")`,
      },
      {
        title: 'Paso 2: Procesarla con filtros reales',
        explanation: 'Con la imagen ya subida, la convertís, rotás, volteás y filtrás — todo con tu propia foto.',
        code: `# PASO 2: con la imagen ya subida, procesala
from PIL import Image, ImageFilter
import matplotlib.pyplot as plt

foto = obtener_imagen()
if foto is None:
    print("No se detecto ninguna imagen subida - volve al Paso 1 y corre subir_imagen()")
else:
    foto = foto.convert("RGB")
    versiones = {
        "Original": foto,
        "Blanco y negro": foto.convert("L"),
        "Volteada": foto.transpose(Image.FLIP_LEFT_RIGHT),
        "Rotada 45°": foto.rotate(45, expand=True, fillcolor=(30,30,30)),
        "Bordes": foto.filter(ImageFilter.FIND_EDGES),
        "Posterizado": foto.filter(ImageFilter.SMOOTH_MORE),
    }
    fig, axes = plt.subplots(2, 3, figsize=(10, 7))
    for ax, (nombre, imagen) in zip(axes.flat, versiones.items()):
        ax.imshow(imagen, cmap="gray" if imagen.mode == "L" else None)
        ax.set_title(nombre, fontsize=10)
        ax.axis("off")
    plt.tight_layout()
    plt.show()
    print(f"Tu foto original mide {foto.size[0]}x{foto.size[1]} pixeles")`,
      },
    ],
  },
  // === NLP ===
  {
    id: 'sentiment-analysis', title: 'Analisis de Sentimiento', icon: '\u{1F4AC}', difficulty: 'medium', category: 'nlp',
    description: 'Clasifica textos como positivos o negativos con TF-IDF',
    theory: `# Miles de reseñas, cero tiempo para leerlas

## El caso

Una tienda online recibe miles de reseñas de productos por semana. Nadie tiene tiempo de
leerlas todas a mano — pero necesitan saber rápido cuáles son quejas graves que hay que
atender ya. Vas a construir un clasificador de sentimiento real con **TF-IDF**, la misma
técnica que usan buscadores y sistemas de recomendación para entender texto.

## El pipeline de NLP

1. **Tokenización**: dividir el texto en palabras.
2. **Vectorización (TF-IDF)**: convertir texto a números — TF mide qué tan frecuente es una
   palabra en un texto, IDF mide qué tan rara es en general (las palabras raras son más
   informativas que "el" o "la").
3. **Clasificación**: comparar el vector del texto nuevo con los patrones ya conocidos.`,
    steps: [
      {
        title: 'Paso 1: Reseñas ya clasificadas por un humano',
        explanation: 'Para entrenar el modelo, necesitamos ejemplos donde ya sabemos si la reseña es positiva o negativa.',
        code: `# Analisis de Sentimiento con TF-IDF - reseñas de una tienda online
import math
from collections import Counter

print("=== ANALISIS DE SENTIMIENTO ===\\n")

# Dataset de entrenamiento: reseñas ya clasificadas
train_data = [
    ("me encanta esta pelicula es genial", "positivo"),
    ("excelente producto muy bueno", "positivo"),
    ("increible experiencia lo recomiendo", "positivo"),
    ("es lo mejor que he visto", "positivo"),
    ("que maravilla me fascina", "positivo"),
    ("es horrible no me gusto nada", "negativo"),
    ("pesimo servicio muy malo", "negativo"),
    ("terrible experiencia nunca mas", "negativo"),
    ("no lo recomiendo es basura", "negativo"),
    ("que asco lo peor del mundo", "negativo"),
]

print(f"Dataset: {len(train_data)} reseñas ya clasificadas")
for texto, label in train_data[:3]:
    print(f"  [{label}] '{texto}'")`,
      },
      {
        title: 'Paso 2: Convertir texto en números (TF-IDF)',
        explanation: 'Una computadora no entiende palabras — necesita vectores. TF-IDF le da más peso a las palabras que realmente distinguen positivo de negativo.',
        code: `# Analisis de Sentimiento con TF-IDF - reseñas de una tienda online
import math
from collections import Counter

print("=== ANALISIS DE SENTIMIENTO ===\\n")

train_data = [
    ("me encanta esta pelicula es genial", "positivo"),
    ("excelente producto muy bueno", "positivo"),
    ("increible experiencia lo recomiendo", "positivo"),
    ("es lo mejor que he visto", "positivo"),
    ("que maravilla me fascina", "positivo"),
    ("es horrible no me gusto nada", "negativo"),
    ("pesimo servicio muy malo", "negativo"),
    ("terrible experiencia nunca mas", "negativo"),
    ("no lo recomiendo es basura", "negativo"),
    ("que asco lo peor del mundo", "negativo"),
]

def tokenizar(texto):
    return texto.lower().split()

# Construir vocabulario de todas las palabras que aparecen
vocab = set()
for texto, _ in train_data:
    vocab.update(tokenizar(texto))
vocab = sorted(vocab)
print(f"Vocabulario: {len(vocab)} palabras -> {list(vocab)[:10]}...")

# TF-IDF simplificado
def calcular_tf(texto, vocab):
    tokens = tokenizar(texto)
    tf = Counter(tokens)
    return {word: tf.get(word, 0)/len(tokens) for word in vocab}

def calcular_idf(train_data, vocab):
    n_docs = len(train_data)
    idf = {}
    for word in vocab:
        count = sum(1 for texto, _ in train_data if word in tokenizar(texto))
        idf[word] = math.log(n_docs / (count + 1)) + 1
    return idf

idf = calcular_idf(train_data, vocab)

def texto_a_vector(texto, vocab, idf):
    tf = calcular_tf(texto, vocab)
    return [tf[w] * idf[w] for w in vocab]

print("\\nCada reseña ahora es un vector de numeros - listo para comparar.")`,
      },
      {
        title: 'Paso 3: El clasificador por similitud',
        explanation: 'Calculamos un "vector promedio" de las reseñas positivas y otro de las negativas — un texto nuevo se clasifica según a cuál se parece más.',
        code: `# Analisis de Sentimiento con TF-IDF - reseñas de una tienda online
import math
from collections import Counter

print("=== ANALISIS DE SENTIMIENTO ===\\n")

train_data = [
    ("me encanta esta pelicula es genial", "positivo"),
    ("excelente producto muy bueno", "positivo"),
    ("increible experiencia lo recomiendo", "positivo"),
    ("es lo mejor que he visto", "positivo"),
    ("que maravilla me fascina", "positivo"),
    ("es horrible no me gusto nada", "negativo"),
    ("pesimo servicio muy malo", "negativo"),
    ("terrible experiencia nunca mas", "negativo"),
    ("no lo recomiendo es basura", "negativo"),
    ("que asco lo peor del mundo", "negativo"),
]

def tokenizar(texto):
    return texto.lower().split()
vocab = sorted(set(w for texto, _ in train_data for w in tokenizar(texto)))

def calcular_tf(texto, vocab):
    tokens = tokenizar(texto)
    tf = Counter(tokens)
    return {word: tf.get(word, 0)/len(tokens) for word in vocab}
def calcular_idf(train_data, vocab):
    n_docs = len(train_data)
    return {word: math.log(n_docs / (sum(1 for t,_ in train_data if word in tokenizar(t)) + 1)) + 1 for word in vocab}
idf = calcular_idf(train_data, vocab)
def texto_a_vector(texto, vocab, idf):
    tf = calcular_tf(texto, vocab)
    return [tf[w] * idf[w] for w in vocab]

train_vectors = [texto_a_vector(t, vocab, idf) for t, _ in train_data]
train_labels = [l for _, l in train_data]

def cosine_sim(a, b):
    dot = sum(x*y for x, y in zip(a, b))
    norm_a, norm_b = math.sqrt(sum(x**2 for x in a)), math.sqrt(sum(x**2 for x in b))
    return 0 if norm_a == 0 or norm_b == 0 else dot / (norm_a * norm_b)

pos_vecs = [v for v, l in zip(train_vectors, train_labels) if l == "positivo"]
neg_vecs = [v for v, l in zip(train_vectors, train_labels) if l == "negativo"]
centroide_pos = [sum(v[i] for v in pos_vecs)/len(pos_vecs) for i in range(len(vocab))]
centroide_neg = [sum(v[i] for v in neg_vecs)/len(neg_vecs) for i in range(len(vocab))]

def predecir(texto):
    vec = texto_a_vector(texto, vocab, idf)
    sim_pos, sim_neg = cosine_sim(vec, centroide_pos), cosine_sim(vec, centroide_neg)
    label = "positivo" if sim_pos > sim_neg else "negativo"
    confianza = max(sim_pos, sim_neg) / (sim_pos + sim_neg + 0.001)
    return label, confianza

print("Clasificador listo - en el siguiente paso lo probamos con reseñas nuevas.")`,
      },
      {
        title: 'Paso 4: Clasificar reseñas nuevas de clientes',
        explanation: 'La prueba real: reseñas que nunca vio el modelo, escritas como las escribiría un cliente de verdad.',
        code: `# Analisis de Sentimiento con TF-IDF - reseñas de una tienda online
import math
from collections import Counter

print("=== ANALISIS DE SENTIMIENTO ===\\n")

train_data = [
    ("me encanta esta pelicula es genial", "positivo"),
    ("excelente producto muy bueno", "positivo"),
    ("increible experiencia lo recomiendo", "positivo"),
    ("es lo mejor que he visto", "positivo"),
    ("que maravilla me fascina", "positivo"),
    ("es horrible no me gusto nada", "negativo"),
    ("pesimo servicio muy malo", "negativo"),
    ("terrible experiencia nunca mas", "negativo"),
    ("no lo recomiendo es basura", "negativo"),
    ("que asco lo peor del mundo", "negativo"),
]

def tokenizar(texto):
    return texto.lower().split()
vocab = sorted(set(w for texto, _ in train_data for w in tokenizar(texto)))
def calcular_tf(texto, vocab):
    tokens = tokenizar(texto)
    tf = Counter(tokens)
    return {word: tf.get(word, 0)/len(tokens) for word in vocab}
def calcular_idf(train_data, vocab):
    n_docs = len(train_data)
    return {word: math.log(n_docs / (sum(1 for t,_ in train_data if word in tokenizar(t)) + 1)) + 1 for word in vocab}
idf = calcular_idf(train_data, vocab)
def texto_a_vector(texto, vocab, idf):
    tf = calcular_tf(texto, vocab)
    return [tf[w] * idf[w] for w in vocab]

train_vectors = [texto_a_vector(t, vocab, idf) for t, _ in train_data]
train_labels = [l for _, l in train_data]
def cosine_sim(a, b):
    dot = sum(x*y for x, y in zip(a, b))
    norm_a, norm_b = math.sqrt(sum(x**2 for x in a)), math.sqrt(sum(x**2 for x in b))
    return 0 if norm_a == 0 or norm_b == 0 else dot / (norm_a * norm_b)
pos_vecs = [v for v, l in zip(train_vectors, train_labels) if l == "positivo"]
neg_vecs = [v for v, l in zip(train_vectors, train_labels) if l == "negativo"]
centroide_pos = [sum(v[i] for v in pos_vecs)/len(pos_vecs) for i in range(len(vocab))]
centroide_neg = [sum(v[i] for v in neg_vecs)/len(neg_vecs) for i in range(len(vocab))]
def predecir(texto):
    vec = texto_a_vector(texto, vocab, idf)
    sim_pos, sim_neg = cosine_sim(vec, centroide_pos), cosine_sim(vec, centroide_neg)
    label = "positivo" if sim_pos > sim_neg else "negativo"
    confianza = max(sim_pos, sim_neg) / (sim_pos + sim_neg + 0.001)
    return label, confianza

# Reseñas NUEVAS que llegaron hoy a la tienda
print("--- RESEÑAS NUEVAS DE CLIENTES ---\\n")
textos_test = [
    "esta pelicula es excelente me encanto",
    "horrible servicio nunca regresare",
    "es un producto muy bueno lo amo",
    "que terrible no sirve para nada",
    "nada especial es normal",
]

for texto in textos_test:
    pred, conf = predecir(texto)
    emoji = "[+]" if pred == "positivo" else "[-]"
    print(f"  {emoji} '{texto}'")
    print(f"      -> {pred} ({conf:.0%} confianza)\\n")

print("Asi funciona el analisis de sentimiento en tiendas online y redes sociales!")`,
      },
    ],
  },
  // === IA GENERATIVA ===
  {
    id: 'markov-chain', title: 'Texto con Markov', icon: '\u{2728}', difficulty: 'hard', category: 'gen',
    description: 'Genera texto automaticamente con cadenas de Markov',
    theory: `# El mismo truco detrás del teclado de tu celular

## El caso

¿Cómo hace el teclado de tu celular para sugerirte la siguiente palabra mientras escribís? La
idea de base es simple: mirar qué palabra sigue MÁS SEGUIDO después de las anteriores, en
muchísimo texto ya escrito. Vas a construir tu propio mini-generador con **cadenas de Markov**
— la misma idea de fondo detrás de GPT (que es básicamente esto, pero con billones de
parámetros, arquitectura Transformer, y atención a contexto larguísimo).

## Cómo funciona

1. Analizás un texto de entrenamiento (el "corpus").
2. Construís una tabla: después de estas 2 palabras, ¿cuáles suelen seguir?
3. Para generar texto nuevo, elegís la siguiente palabra según esas probabilidades.`,
    steps: [
      {
        title: 'Paso 1: El corpus de entrenamiento',
        explanation: 'Un texto de ejemplo sobre IA — de ahí va a "aprender" el modelo qué palabras suelen ir juntas.',
        code: `# Generador de Texto con Cadenas de Markov
print("=== GENERADOR DE TEXTO (Cadenas de Markov) ===\\n")

# Corpus de entrenamiento
corpus = """
la inteligencia artificial es el futuro de la tecnologia.
la inteligencia artificial puede resolver problemas complejos.
el machine learning es una rama de la inteligencia artificial.
las redes neuronales son modelos de machine learning.
el deep learning usa redes neuronales profundas.
la inteligencia artificial esta cambiando el mundo.
el futuro de la tecnologia depende de la inteligencia artificial.
las redes neuronales pueden aprender de los datos.
el machine learning necesita muchos datos para funcionar.
la tecnologia avanza gracias a la inteligencia artificial.
los datos son el combustible del machine learning.
el deep learning revoluciono la inteligencia artificial.
"""

print(f"Corpus: {len(corpus.split())} palabras")
print("En el siguiente paso construimos la tabla de que palabra sigue a cual.")`,
      },
      {
        title: 'Paso 2: La tabla de "qué palabra sigue"',
        explanation: 'Para cada par de palabras (bigrama), guardamos todas las palabras que lo siguieron en el corpus.',
        code: `# Generador de Texto con Cadenas de Markov
from collections import defaultdict

print("=== GENERADOR DE TEXTO (Cadenas de Markov) ===\\n")

corpus = """
la inteligencia artificial es el futuro de la tecnologia.
la inteligencia artificial puede resolver problemas complejos.
el machine learning es una rama de la inteligencia artificial.
las redes neuronales son modelos de machine learning.
el deep learning usa redes neuronales profundas.
la inteligencia artificial esta cambiando el mundo.
el futuro de la tecnologia depende de la inteligencia artificial.
las redes neuronales pueden aprender de los datos.
el machine learning necesita muchos datos para funcionar.
la tecnologia avanza gracias a la inteligencia artificial.
los datos son el combustible del machine learning.
el deep learning revoluciono la inteligencia artificial.
"""

# Construir cadena de Markov (bigrama: mirar 2 palabras para predecir la 3ra)
def construir_cadena(texto, orden=2):
    palabras = texto.lower().split()
    cadena = defaultdict(list)
    for i in range(len(palabras) - orden):
        estado = tuple(palabras[i:i+orden])
        siguiente = palabras[i+orden]
        cadena[estado].append(siguiente)
    return cadena

cadena = construir_cadena(corpus, orden=2)
print(f"Tabla construida: {len(cadena)} estados unicos (pares de palabras)\\n")

# Mostrar algunas transiciones de ejemplo
print("Tabla de transiciones (muestra):")
for estado, siguientes in list(cadena.items())[:6]:
    unique = list(set(siguientes))
    print(f"  {' '.join(estado):30s} -> {unique}")`,
      },
      {
        title: 'Paso 3: Generar texto nuevo',
        explanation: 'Arrancamos de un par de palabras al azar y vamos eligiendo la siguiente palabra según la tabla — así se arma texto nuevo, palabra por palabra.',
        code: `# Generador de Texto con Cadenas de Markov
import random
from collections import defaultdict

print("=== GENERADOR DE TEXTO (Cadenas de Markov) ===\\n")

corpus = """
la inteligencia artificial es el futuro de la tecnologia.
la inteligencia artificial puede resolver problemas complejos.
el machine learning es una rama de la inteligencia artificial.
las redes neuronales son modelos de machine learning.
el deep learning usa redes neuronales profundas.
la inteligencia artificial esta cambiando el mundo.
el futuro de la tecnologia depende de la inteligencia artificial.
las redes neuronales pueden aprender de los datos.
el machine learning necesita muchos datos para funcionar.
la tecnologia avanza gracias a la inteligencia artificial.
los datos son el combustible del machine learning.
el deep learning revoluciono la inteligencia artificial.
"""

def construir_cadena(texto, orden=2):
    palabras = texto.lower().split()
    cadena = defaultdict(list)
    for i in range(len(palabras) - orden):
        cadena[tuple(palabras[i:i+orden])].append(palabras[i+orden])
    return cadena

def generar_texto(cadena, orden=2, longitud=20):
    estado = random.choice(list(cadena.keys()))
    resultado = list(estado)
    for _ in range(longitud):
        if estado not in cadena:
            break
        siguiente = random.choice(cadena[estado])
        resultado.append(siguiente)
        estado = tuple(resultado[-orden:])
    return ' '.join(resultado)

cadena = construir_cadena(corpus, orden=2)

print(f"--- TEXTOS GENERADOS ---\\n")
for i in range(5):
    texto = generar_texto(cadena, orden=2, longitud=12)
    print(f"  {i+1}. {texto}")`,
      },
      {
        title: 'Paso 4: Las probabilidades detrás de la magia',
        explanation: 'No es magia — es contar. Vemos exactamente qué tan probable es cada palabra siguiente después de un par dado.',
        code: `# Generador de Texto con Cadenas de Markov
import random
from collections import defaultdict, Counter

print("=== GENERADOR DE TEXTO (Cadenas de Markov) ===\\n")

corpus = """
la inteligencia artificial es el futuro de la tecnologia.
la inteligencia artificial puede resolver problemas complejos.
el machine learning es una rama de la inteligencia artificial.
las redes neuronales son modelos de machine learning.
el deep learning usa redes neuronales profundas.
la inteligencia artificial esta cambiando el mundo.
el futuro de la tecnologia depende de la inteligencia artificial.
las redes neuronales pueden aprender de los datos.
el machine learning necesita muchos datos para funcionar.
la tecnologia avanza gracias a la inteligencia artificial.
los datos son el combustible del machine learning.
el deep learning revoluciono la inteligencia artificial.
"""

def construir_cadena(texto, orden=2):
    palabras = texto.lower().split()
    cadena = defaultdict(list)
    for i in range(len(palabras) - orden):
        cadena[tuple(palabras[i:i+orden])].append(palabras[i+orden])
    return cadena

cadena = construir_cadena(corpus, orden=2)

print(f"--- PROBABILIDADES REALES ---")
estado_ejemplo = ("la", "inteligencia")
if estado_ejemplo in cadena:
    siguientes = cadena[estado_ejemplo]
    total = len(siguientes)
    conteo = Counter(siguientes)
    print(f"\\n  Despues de '{' '.join(estado_ejemplo)}':")
    for p, c in conteo.most_common():
        prob = c / total
        bar = "#" * int(prob * 20)
        print(f"  {p:15s} {bar} {prob:.0%}")

print("\\nAsi funciona GPT (pero con billones de parametros):")
print("  GPT = Markov + Transformers + Atencion + Muuuchos datos")
print("\\nCreaste un generador de texto como mini GPT!")`,
      },
    ],
  },
]

const DIFFICULTY_LABEL: Record<string, string> = { easy: '\u{1F7E2} Facil', medium: '\u{1F7E1} Medio', hard: '\u{1F534} Dificil' }
const DIFFICULTY_COLOR: Record<string, string> = { easy: 'bg-green-500/10 text-green-400 border border-green-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', hard: 'bg-red-500/10 text-red-400 border border-red-500/20' }

// ============================================================
// RENDER THEORY HELPER
// ============================================================
function renderTheory(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null
    if (line.startsWith('# ')) return <h1 key={i} className="text-gray-100 text-sm font-bold mt-3 mb-1.5">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-gray-200 text-[13px] font-bold mt-3 mb-1">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-gray-300 text-xs font-semibold mt-2 mb-1">{line.slice(4)}</h3>
    if (line.startsWith('- ')) return <li key={i} className="text-gray-400 text-[11px] ml-3 mb-0.5 list-disc">{line.slice(2)}</li>
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return <p key={i} className="text-gray-400 text-[11px] leading-relaxed mb-1">{line}</p>
  })
}

// ============================================================
// DEFAULT FILES
// ============================================================
interface VirtualFile { name: string; content: string }

const DEFAULT_FILES: VirtualFile[] = [
  { name: 'main.py', content: AI_EXERCISES[0].steps[0].code },
]

// ============================================================
// COMPONENT
// ============================================================
interface AITerminalProps { levelId?: string; userId?: string; userName?: string }

export default function AITerminal({ levelId, userId, userName }: AITerminalProps) {
  const { user } = useAuth()

  const [files, setFiles] = useState<VirtualFile[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_FILES
    try {
      const saved = localStorage.getItem('ai-lab-files')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return DEFAULT_FILES
  })
  const [activeFile, setActiveFile] = useState(0)
  const [output, setOutput] = useState<string[]>(['\u{1F9E0} AI Lab Professional v2.0 \u{2014} Motor: Pyodide (CPython 3.11 WebAssembly)'])
  const [isRunning, setIsRunning] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)
  const [pyodideLoading, setPyodideLoading] = useState(false)
  const [showCurriculum, setShowCurriculum] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [showTheoryPanel, setShowTheoryPanel] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('basics')
  const [activeExercise, setActiveExercise] = useState<AIExercise | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [installedPackages, setInstalledPackages] = useState<string[]>(['math', 'random', 'json', 're', 'collections', 'functools', 'itertools', 'time', 'statistics'])
  const [isInstalling, setIsInstalling] = useState(false)
  const [studentName, setStudentName] = useState(userName || '')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const outputRef = useRef<HTMLDivElement>(null)
  const runShortcutRef = useRef<() => void>(() => {})

  // --- CAMARA WEB (activar_camara/tomar_foto/cerrar_camara) ---
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    registerCameraVideoElement(cameraVideoRef.current)
    const unsubscribe = onCameraStateChange(setCameraActive)
    return () => {
      unsubscribe()
      registerCameraVideoElement(null)
      stopSharedCamera()
    }
  }, [])

  // --- SUBIR IMAGEN (subir_imagen/obtener_imagen) ---
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  useEffect(() => onImageUploaded(setUploadedFileName), [])

  // --- PUENTE SERIAL (conectar_arduino/enviar_dato/leer_linea) ---
  const [serialState, setSerialState] = useState<{ connected: boolean; baudRate: number }>({ connected: false, baudRate: 0 })
  const [serialLines, setSerialLines] = useState<string[]>([])
  useEffect(() => {
    const unsubState = onSerialStateChange(setSerialState)
    const unsubLine = onSerialLine(line => setSerialLines(prev => [...prev.slice(-199), line]))
    return () => {
      unsubState()
      unsubLine()
      disconnectSerial()
    }
  }, [])

  const handleToggleSerial = useCallback(async () => {
    if (serialState.connected) {
      await disconnectSerial()
      setOutput(prev => [...prev, '🔌 Placa desconectada'])
      return
    }
    const res = await connectSerial(9600)
    if (res.ok) setOutput(prev => [...prev, '🔌 Conectado a la placa (9600 baud)'])
    else setOutput(prev => [...prev, `⚠️ ${res.error}`])
  }, [serialState.connected])

  // --- LIGHTBOX (ampliar imagenes/graficos de la terminal) ---
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  // --- PYODIDE ENGINE (motor compartido: @/lib/pythonRunner) ---
  const loadPyodideEngine = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).pyodide) { setPyodideReady(true); return }
    if (pyodideLoading) return
    setPyodideLoading(true)
    try {
      await ensurePyodide((msg) => setOutput(prev => [...prev, `\u{23F3} ${msg}`]))
      setPyodideReady(true)
      setOutput(prev => [...prev, '\u{2705} Python 3.11.3 (Pyodide) listo \u{2014} Motor WebAssembly activo', '\u{1F4A1} input() habilitado \u{B7} gr\u00e1ficos matplotlib \u{B7} auto-instalaci\u00f3n de paquetes \u{B7} activar_camara() \u{B7} subir_imagen() \u{B7} conectar_arduino()'])
    } catch (err: any) {
      console.error('Pyodide load error:', err)
      setOutput(prev => [...prev, '\u{274C} Error: No se pudo cargar Python. Verifica tu conexion.'])
    }
    setPyodideLoading(false)
  }, [pyodideLoading])

  useEffect(() => { loadPyodideEngine() }, [])
  useEffect(() => { if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight }, [output])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-lab-progress')
      if (saved) setCompletedExercises(new Set(JSON.parse(saved)))
      const savedName = localStorage.getItem('ai-lab-student')
      if (savedName) setStudentName(savedName)
      else if (user?.name) setStudentName(user.name)
    } catch {}
  }, [user?.name])

  useEffect(() => {
    try {
      localStorage.setItem('ai-lab-progress', JSON.stringify(Array.from(completedExercises)))
      if (studentName) localStorage.setItem('ai-lab-student', studentName)
    } catch {}
  }, [completedExercises, studentName])

  useEffect(() => {
    try {
      localStorage.setItem('ai-lab-files', JSON.stringify(files))
    } catch {}
  }, [files])

  // --- RUN CODE (motor robusto: input, matplotlib, streaming) ---
  const runCode = async () => {
    if (isRunning) return
    setIsRunning(true)
    const code = files[activeFile].content
    const timestamp = new Date().toLocaleTimeString('es-EC')
    setOutput(prev => [...prev, '', `[${timestamp}] \u{25B6} Ejecutando ${files[activeFile].name}...`, '\u{2500}'.repeat(50)])
    try {
      const result = await runPython(code, {
        onLine: (line, type) => {
          setOutput(prev => [...prev, type === 'stderr' ? `\u{26A0}\u{FE0F} ${line}` : line])
        },
      })

      if (result.images.length > 0) {
        setOutput(prev => [...prev, ...result.images.map(img => `${IMG_PREFIX}${img}`), `\u{1F4CA} ${result.images.length} gr\u00e1fico(s) generado(s)`])
      }

      if (result.error) {
        setOutput(prev => [...prev, '\u{274C} Error de Python:', ...result.error!.split('\n').map(l => `   ${l}`)])
        if (isInputBlockedError(result.error)) {
          setOutput(prev => [...prev, RELOAD_BUTTON_MARKER])
        }
      } else if (result.lines.length === 0 && result.images.length === 0) {
        setOutput(prev => [...prev, '\u{2713} Ejecucion exitosa (sin salida de print)'])
      }

      setOutput(prev => [...prev, `\u{2500} Completado en ${result.elapsedMs.toFixed(0)}ms`])
    } catch (err: any) {
      setOutput(prev => [...prev, `\u{274C} Error del motor: ${err.message}`])
    }
    setIsRunning(false)
  }

  useEffect(() => { runShortcutRef.current = () => { if (!isRunning && pyodideReady) runCode() } })

  // --- INSTALL PACKAGE (pyodide + micropip fallback) ---
  const installPackage = async (pkg: string) => {
    if (installedPackages.includes(pkg)) return
    setIsInstalling(true)
    setOutput(prev => [...prev, `\u{1F4E6} pip install ${pkg}...`])
    const { ok, error } = await installPyPackage(pkg)
    if (ok) {
      setInstalledPackages(prev => [...prev, pkg])
      setOutput(prev => [...prev, `\u{2705} Successfully installed ${pkg}`])
    } else {
      setOutput(prev => [...prev, `\u{274C} Error: No se pudo instalar ${pkg}${error ? ` \u{2014} ${error}` : ''}`])
    }
    setIsInstalling(false)
  }

  // --- FILE OPERATIONS ---
  const updateFileContent = (content: string | undefined) => {
    if (content === undefined) return
    const newFiles = [...files]
    newFiles[activeFile] = { ...newFiles[activeFile], content }
    setFiles(newFiles)
  }

  const createFile = () => {
    const name = prompt('Nombre del archivo (con .py):')
    if (!name) return
    const fileName = name.endsWith('.py') ? name : `${name}.py`
    setFiles([...files, { name: fileName, content: `# ${fileName}\n\n` }])
    setActiveFile(files.length)
  }

  const deleteFile = (idx: number) => {
    if (files.length <= 1) return
    const newFiles = files.filter((_, i) => i !== idx)
    setFiles(newFiles)
    if (activeFile >= newFiles.length) setActiveFile(newFiles.length - 1)
  }

  const downloadFile = () => {
    const file = files[activeFile]
    const blob = new Blob([file.content], { type: 'text/x-python' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  // --- EXERCISE NAVIGATION ---
  const loadExercise = (exercise: AIExercise) => {
    setActiveExercise(exercise)
    setCurrentStepIndex(0)
    setShowTheoryPanel(true)
    const newFiles = [...files]
    newFiles[0] = { name: `${exercise.id}.py`, content: exercise.steps[0].code }
    setFiles(newFiles)
    setActiveFile(0)
    setOutput(prev => [...prev, '', `\u{1F4DA} === ${exercise.icon} ${exercise.title} ===`, `\u{1F4DD} ${exercise.description}`, `\u{1F3AF} Dificultad: ${DIFFICULTY_LABEL[exercise.difficulty]}`, '', '\u{1F4A1} Presiona \u{25B6} Ejecutar para ver el resultado (Ctrl+Enter)'])
  }

  // --- STEP NAVIGATION (dentro de un ejercicio) ---
  const goToStep = (index: number) => {
    if (!activeExercise) return
    if (index < 0 || index >= activeExercise.steps.length) return
    setCurrentStepIndex(index)
    const newFiles = [...files]
    newFiles[0] = { name: `${activeExercise.id}.py`, content: activeExercise.steps[index].code }
    setFiles(newFiles)
    setActiveFile(0)
  }

  const markExerciseComplete = () => {
    if (!activeExercise) return
    const newCompleted = new Set(completedExercises)
    newCompleted.add(activeExercise.id)
    setCompletedExercises(newCompleted)
    setOutput(prev => [...prev, '', '\u{1F389} Ejercicio completado! +\u{2B50}'])
  }

  // --- SEND TO TEACHER ---
  const handleSendToTeacher = async () => {
    if (!studentName.trim()) { setOutput(prev => [...prev, '\u{26A0}\u{FE0F} Escribe tu nombre para enviar']); return }
    setIsSending(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: `AI-${Date.now().toString(36).toUpperCase()}`, studentName, studentEmail: user?.email || undefined, code: files[activeFile].content, output: output.slice(-20).join('\n'), levelId: user?.levelId || levelId, lessonId: activeExercise?.id || undefined })
      })
      if (res.ok) { setSendSuccess(true); setOutput(prev => [...prev, '\u{2705} Codigo enviado al profesor']); setTimeout(() => setSendSuccess(false), 4000) }
    } catch { setOutput(prev => [...prev, '\u{274C} Error de conexion al enviar']) }
    setIsSending(false)
  }

  const filteredExercises = AI_EXERCISES.filter(e => e.category === activeCategory)
  const totalExercises = AI_EXERCISES.length
  const progressPct = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0

  return (
    <div className={`flex flex-col bg-[#0d1117] rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[850px]'}`}>
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[#0d1117] via-[#130d1a] to-[#0d1117] border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:brightness-125" onClick={() => setIsFullscreen(false)} />
            <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer hover:brightness-125" />
            <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:brightness-125" onClick={() => setIsFullscreen(!isFullscreen)} />
          </div>
          <div className="flex items-center gap-2">
            <Image src="/chaski.png" alt="ChaskiBots" width={24} height={24} className="rounded-md" />
            <div className="flex flex-col">
              <span className="text-gray-200 text-sm font-bold leading-tight">AI Lab</span>
              <span className="text-[9px] text-gray-500 leading-tight">by ChaskiBots Lab</span>
            </div>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${pyodideReady ? 'bg-green-500/20 text-green-400 border border-green-500/30' : pyodideLoading ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
            {pyodideReady ? '\u{25CF} Python 3.11 Listo' : pyodideLoading ? '\u{25CC} Cargando...' : '\u{25CB} Desconectado'}
          </span>
          {completedExercises.size > 0 && <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">{`\u{2B50} ${completedExercises.size}/${totalExercises}`}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={downloadFile} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Descargar .py"><Download className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-700/50 mx-0.5" />
          <button onClick={handleToggleSerial} className={`p-2 rounded-lg transition-colors ${serialState.connected ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title={serialState.connected ? `Placa conectada (${serialState.baudRate} baud) - clic para desconectar` : 'Conectar placa (Arduino/ESP32/Pico) por USB'}><Usb className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-700/50 mx-0.5" />
          <button onClick={() => setShowCurriculum(!showCurriculum)} className={`p-2 rounded-lg transition-colors ${showCurriculum ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Ejercicios"><Brain className="w-4 h-4" /></button>
          <button onClick={() => setShowTerminal(!showTerminal)} className={`p-2 rounded-lg transition-colors ${showTerminal ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Terminal"><TerminalIcon className="w-4 h-4" /></button>
          <button onClick={() => { if (activeExercise) setShowTheoryPanel(!showTheoryPanel) }} className={`p-2 rounded-lg transition-colors ${showTheoryPanel ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`} title="Teoria"><BookOpen className="w-4 h-4" /></button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        {showCurriculum && (
          <div className="w-72 bg-[#0d1117] border-r border-gray-700/50 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-bold flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400" /> Ejercicios IA</h3>
                <span className="text-[11px] text-gray-500">{completedExercises.size}/{totalExercises}</span>
              </div>
              <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} /></div>
            </div>
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700/30">
              {EXERCISE_CATEGORIES.map(cat => {
                const count = AI_EXERCISES.filter(e => e.category === cat.id).length
                const done = AI_EXERCISES.filter(e => e.category === cat.id && completedExercises.has(e.id)).length
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${activeCategory === cat.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/30 border border-transparent'}`}>
                    <span>{cat.icon}</span>
                    <span className="hidden sm:inline">{cat.name.split(' ')[0]}</span>
                    {done === count && count > 0 && <span className="text-green-400 text-[8px]">{'\u2713'}</span>}
                  </button>
                )
              })}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredExercises.map(exercise => {
                const isComplete = completedExercises.has(exercise.id)
                const isActive = activeExercise?.id === exercise.id
                return (
                  <button key={exercise.id} onClick={() => loadExercise(exercise)} className={`w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left transition-all ${isActive ? 'bg-purple-500/20 border border-purple-500/40 shadow-sm shadow-purple-500/10' : 'hover:bg-gray-700/30 border border-transparent'}`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-medium truncate ${isActive ? 'text-purple-300' : 'text-gray-300'}`}>{exercise.icon} {exercise.title}</div>
                      <div className="text-[10px] text-gray-600 truncate">{exercise.description}</div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${DIFFICULTY_COLOR[exercise.difficulty]}`}>{exercise.difficulty === 'easy' ? 'Facil' : exercise.difficulty === 'medium' ? 'Medio' : 'Dificil'}</span>
                  </button>
                )
              })}
            </div>
            <div className="p-3 border-t border-gray-700/50">
              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Package className="w-3 h-3" /> Paquetes pip</h4>
              <div className="flex flex-wrap gap-1.5">
                {['numpy', 'pandas', 'matplotlib', 'scipy', 'sympy', 'networkx'].map(pkg => (
                  <button key={pkg} onClick={() => installPackage(pkg)} disabled={isInstalling} className={`text-[10px] px-2 py-1 rounded-md transition-all ${installedPackages.includes(pkg) ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500'}`}>
                    {installedPackages.includes(pkg) ? '\u{2713}' : '\u{2193}'} {pkg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CENTER: EDITOR */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center bg-[#161b22] border-b border-gray-700/50 overflow-x-auto scrollbar-hide">
            {files.map((file, idx) => (
              <button key={idx} onClick={() => setActiveFile(idx)} className={`group flex items-center gap-1.5 px-4 py-2 text-xs border-r border-gray-700/30 min-w-0 transition-colors ${idx === activeFile ? 'bg-[#0d1117] text-white border-t-2 border-t-purple-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#0d1117]/50'}`}>
                <File className="w-3 h-3 text-purple-400 flex-shrink-0" />
                <span className="truncate max-w-[100px]">{file.name}</span>
                {files.length > 1 && <span onClick={(e) => { e.stopPropagation(); deleteFile(idx) }} className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"><X className="w-3 h-3" /></span>}
              </button>
            ))}
            <button onClick={createFile} className="px-3 py-2 text-gray-600 hover:text-gray-300 hover:bg-gray-700/30 transition-colors" title="Nuevo archivo"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          {activeExercise && activeExercise.steps.length > 1 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-[#0d1117] border-b border-gray-700/50">
              <button onClick={() => goToStep(currentStepIndex - 1)} disabled={currentStepIndex === 0} className="p-1 rounded text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-purple-400 font-bold whitespace-nowrap">Paso {currentStepIndex + 1} de {activeExercise.steps.length}</span>
              <button onClick={() => goToStep(currentStepIndex + 1)} disabled={currentStepIndex === activeExercise.steps.length - 1} className="p-1 rounded text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-gray-200 font-medium truncate">{activeExercise.steps[currentStepIndex].title}</div>
                <div className="text-[10px] text-gray-500 truncate">{activeExercise.steps[currentStepIndex].explanation}</div>
              </div>
            </div>
          )}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language="python"
              theme="vs-dark"
              value={files[activeFile]?.content || ''}
              onChange={updateFileContent}
              onMount={(editor, monaco) => { editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runShortcutRef.current()) }}
              options={{ fontSize: 14, fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace", minimap: { enabled: false }, lineNumbers: 'on', wordWrap: 'on', automaticLayout: true, padding: { top: 16, bottom: 16 }, scrollBeyondLastLine: false, tabSize: 4, insertSpaces: true, suggestOnTriggerCharacters: true, quickSuggestions: true, renderWhitespace: 'selection', bracketPairColorization: { enabled: true }, guides: { bracketPairs: true }, smoothScrolling: true, cursorBlinking: 'smooth', cursorSmoothCaretAnimation: 'on' }}
            />
          </div>
          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <button onClick={runCode} disabled={isRunning || !pyodideReady} className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-green-600/20 hover:shadow-green-500/30">
                {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {isRunning ? 'Ejecutando...' : 'Ejecutar'}
              </button>
              {isRunning && <button onClick={() => setIsRunning(false)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-xs transition-colors"><Square className="w-3 h-3" /> Stop</button>}
              <div className="w-px h-5 bg-gray-700 mx-1" />
              <button onClick={() => navigator.clipboard.writeText(files[activeFile].content)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors" title="Copiar"><Copy className="w-3.5 h-3.5" /></button>
              <button onClick={() => { setFiles([...DEFAULT_FILES]); setActiveFile(0) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors" title="Reiniciar"><RotateCcw className="w-3.5 h-3.5" /></button>
              {activeExercise && <><div className="w-px h-5 bg-gray-700 mx-1" /><button onClick={markExerciseComplete} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors"><CheckCircle2 className="w-3.5 h-3.5" /> Completar</button></>}
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Tu nombre..." className="px-3 py-1.5 bg-gray-800/80 border border-gray-600/50 rounded-lg text-xs text-gray-300 w-32 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none transition-colors" />
              <button onClick={handleSendToTeacher} disabled={isSending || sendSuccess || !studentName.trim()} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sendSuccess ? 'bg-green-600 text-white' : 'bg-purple-600/80 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'}`}>
                {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : sendSuccess ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                {sendSuccess ? 'Enviado' : 'Enviar'}
              </button>
            </div>
          </div>
          {/* Camara web (activar_camara()/tomar_foto()/cerrar_camara()) */}
          <div className={`px-4 py-2 border-t border-gray-700/50 bg-[#161b22] items-center gap-3 ${cameraActive ? 'flex' : 'hidden'}`}>
            <video ref={cameraVideoRef} autoPlay playsInline muted className="w-40 h-28 rounded-lg border border-green-500/40 bg-black object-cover" />
            <div className="flex-1">
              <div className="text-green-400 text-xs font-bold flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Camara activa</div>
              <p className="text-gray-500 text-[10px] mt-0.5">Usa tomar_foto() en tu codigo para capturarla, o apagala aqui</p>
            </div>
            <button onClick={() => stopSharedCamera()} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors">
              <VideoOff className="w-3.5 h-3.5" /> Apagar camara
            </button>
          </div>

          {/* Imagen subida (subir_imagen() / obtener_imagen()) */}
          {uploadedFileName && (
            <div className="px-4 py-1.5 border-t border-gray-700/50 bg-[#161b22] flex items-center gap-2 text-[11px] text-cyan-300">
              <Upload className="w-3.5 h-3.5" /> Imagen subida: <span className="font-medium text-gray-200">{uploadedFileName}</span>
              <span className="text-gray-500">- usa obtener_imagen() en tu codigo</span>
            </div>
          )}

          {/* Monitor Serial (conectar_arduino() / enviar_dato() / leer_linea()) */}
          {serialState.connected && (
            <div className="border-t border-gray-700/50 bg-[#161b22]">
              <div className="px-4 py-1.5 flex items-center gap-2">
                <Usb className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 text-[11px] font-bold">● Conectado - {serialState.baudRate} baud</span>
                <span className="text-gray-500 text-[10px] flex-1">usa enviar_dato()/leer_linea() en tu codigo</span>
                <button onClick={() => disconnectSerial()} className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-[11px] font-medium transition-colors">
                  <Unplug className="w-3 h-3" /> Desconectar
                </button>
              </div>
              <div className="h-20 overflow-y-auto px-4 pb-2 font-mono text-[11px] text-gray-400 leading-relaxed">
                {serialLines.length === 0
                  ? <span className="text-gray-600">Esperando datos de la placa...</span>
                  : serialLines.map((line, idx) => <div key={idx}>{line}</div>)
                }
              </div>
            </div>
          )}

          {/* Terminal Output */}
          {showTerminal && (
            <div className="h-72 border-t border-gray-700/50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-b border-gray-700/30">
                <div className="flex items-center gap-2"><TerminalIcon className="w-3.5 h-3.5 text-green-400" /><span className="text-[11px] text-gray-400 font-medium">Terminal {'\u2014'} Python 3.11 (Pyodide)</span></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setOutput(['\u{1F9E0} Terminal limpia'])} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50 transition-colors" title="Limpiar"><Trash2 className="w-3 h-3" /></button>
                  <button onClick={() => setShowTerminal(false)} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              </div>
              <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed bg-[#010409]">
                {output.map((line, idx) => (
                  line === RELOAD_BUTTON_MARKER ? (
                    <button
                      key={idx}
                      onClick={() => window.location.reload()}
                      className="my-2 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold transition-colors animate-pulse"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Recargar página (tu código no se pierde)
                    </button>
                  ) : line.startsWith(IMG_PREFIX) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={idx}
                      src={`data:image/png;base64,${line.slice(IMG_PREFIX.length)}`}
                      alt="Grafico matplotlib"
                      onClick={() => setLightboxImg(line.slice(IMG_PREFIX.length))}
                      className="my-2 max-w-full rounded-lg border border-gray-700/50 cursor-zoom-in hover:border-blue-500/50 transition-colors"
                      title="Clic para ampliar"
                    />
                  ) : (
                  <div key={idx} className={`${line.startsWith('\u{274C}') ? 'text-red-400' : line.startsWith('\u{2705}') || line.startsWith('\u{1F389}') || line.startsWith('\u{2713}') ? 'text-green-400' : line.startsWith('\u{26A0}') ? 'text-yellow-400' : line.startsWith('\u{25B6}') || line.startsWith('[') ? 'text-blue-400' : line.startsWith('\u{1F4E6}') || line.startsWith('\u{1F4DA}') || line.startsWith('\u{1F4DD}') || line.startsWith('\u{1F3AF}') || line.startsWith('\u{1F4CA}') ? 'text-purple-300' : line.startsWith('\u{2500}') || line.startsWith('\u{2550}') ? 'text-gray-600' : line.startsWith('\u{23F3}') ? 'text-yellow-300' : line.startsWith('\u{1F4A1}') ? 'text-cyan-300' : 'text-gray-300'}`}>
                    {line || '\u00A0'}
                  </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: THEORY PANEL */}
        {showTheoryPanel && activeExercise && (
          <div className="w-80 bg-[#0d1117] border-l border-gray-700/50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
              <h3 className="text-white text-sm font-bold truncate">{activeExercise.icon} {activeExercise.title}</h3>
              <button onClick={() => setShowTheoryPanel(false)} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 pt-3 pb-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLOR[activeExercise.difficulty]}`}>{DIFFICULTY_LABEL[activeExercise.difficulty]}</span>
                <p className="text-gray-500 text-xs mt-2">{activeExercise.description}</p>
              </div>
              <div className="p-3 border-t border-gray-700/30">
                <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-purple-400" /> Teoria</h4>
                <div className="leading-relaxed">{renderTheory(activeExercise.theory)}</div>
              </div>
              <div className="p-3 border-t border-gray-700/30">
                <h4 className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Rocket className="w-3 h-3 text-orange-400" /> Acciones</h4>
                <div className="space-y-2">
                  <button onClick={runCode} disabled={isRunning || !pyodideReady} className="w-full flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-[11px] text-green-400 font-medium transition-all disabled:opacity-50"><Play className="w-3.5 h-3.5" /> Ejecutar codigo</button>
                  <button onClick={() => { loadExercise(activeExercise) }} className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-[11px] text-blue-400 font-medium transition-all"><RotateCcw className="w-3.5 h-3.5" /> Reiniciar ejercicio</button>
                  <button onClick={markExerciseComplete} className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-[11px] text-purple-400 font-medium transition-all"><CheckCircle2 className="w-3.5 h-3.5" /> Marcar completado</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox: ampliar graficos/imagenes de la terminal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${lightboxImg}`} alt="Vista ampliada" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  )
}
