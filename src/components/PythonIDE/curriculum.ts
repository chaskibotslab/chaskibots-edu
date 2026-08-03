import {
  Code, Zap, Rocket, Brain, Database, Globe, Trophy,
  Terminal, Cpu, Eye, RotateCcw
} from 'lucide-react'

// ============================================================
// TYPES
// ============================================================

export interface LessonData {
  id: string
  title: string
  description: string
  difficulty: 'principiante' | 'intermedio' | 'avanzado'
  starterCode: string
  theory: string
  hints: string[]
  expectedConcepts: string[]
  challenge?: string
}

export interface ModuleData {
  id: string
  title: string
  description: string
  icon: any
  color: string
  lessons: LessonData[]
}

// ============================================================
// CURRICULUM DATA — 6 Modules, 18+ Lessons
// ============================================================

export const CURRICULUM: ModuleData[] = [
  // ─── MODULE 1: FUNDAMENTOS ──────────────────────────────
  {
    id: 'fundamentos',
    title: 'Fundamentos de Python',
    description: 'Variables, tipos, operadores, entrada/salida',
    icon: Code,
    color: '#3B82F6',
    lessons: [
      {
        id: 'variables',
        title: 'Variables y Tipos',
        description: 'Declarar variables, tipos de datos str, int, float, bool, list, dict',
        difficulty: 'principiante',
        theory: `Variables en Python\n\nUna variable almacena un valor en memoria.\nPython detecta el tipo automáticamente (tipado dinámico).\n\nTipos principales:\n• str  → Texto: "Hola"\n• int  → Enteros: 42\n• float → Decimales: 3.14\n• bool → True / False\n• list → Listas: [1, 2, 3]\n• dict → Diccionarios: {"a": 1}`,
        starterCode: `# ═══ VARIABLES Y TIPOS DE DATOS ═══
# Python detecta el tipo automáticamente

nombre = "Ana García"
edad = 15
altura = 1.65
es_estudiante = True
materias = ["Matemáticas", "Ciencias", "Arte"]
perfil = {"nombre": nombre, "edad": edad}

# Mostrar información con f-strings
print("=" * 40)
print("   PERFIL DEL ESTUDIANTE")
print("=" * 40)
print(f"  Nombre: {nombre}")
print(f"  Edad: {edad} años")
print(f"  Altura: {altura}m")
print(f"  Estudiante: {'Sí' if es_estudiante else 'No'}")
print(f"  Materias: {', '.join(materias)}")
print()
print(f"  Tipo de 'nombre': {type(nombre).__name__}")
print(f"  Tipo de 'edad': {type(edad).__name__}")
print(f"  Tipo de 'altura': {type(altura).__name__}")
print(f"  Tipo de 'perfil': {type(perfil).__name__}")
print("=" * 40)

# RETO: Crea tu propia variable "hobby" y muéstrala
`,
        hints: [
          'type(x).__name__ muestra el tipo como texto',
          'f-strings: f"Hola {variable}" permite insertar variables en texto',
          'join() une una lista en un solo string',
        ],
        expectedConcepts: ['variables', 'tipos', 'print', 'f-string'],
        challenge: 'Crea un diccionario con tus datos personales (nombre, edad, hobby, ciudad) y muéstralos con formato'
      },
      {
        id: 'operadores',
        title: 'Operadores y Expresiones',
        description: 'Aritméticos, comparación, lógicos, asignación',
        difficulty: 'principiante',
        theory: `Operadores en Python\n\nAritméticos: + - * / // % **\n• // → división entera\n• % → módulo (resto)\n• ** → potencia\n\nComparación: == != < > <= >=\n\nLógicos: and or not\n\nAsignación: = += -= *= /=`,
        starterCode: `# ═══ OPERADORES EN PYTHON ═══

a, b = 17, 5

print("Operaciones Aritméticas")
print("─" * 30)
print(f"  {a} + {b}  = {a + b}")
print(f"  {a} - {b}  = {a - b}")
print(f"  {a} * {b}  = {a * b}")
print(f"  {a} / {b}  = {a / b:.2f}")
print(f"  {a} // {b} = {a // b}  (div. entera)")
print(f"  {a} % {b}  = {a % b}   (módulo)")
print(f"  {a} ** {b} = {a ** b}  (potencia)")

# Comparaciones
print("\\nComparaciones")
print("─" * 30)
print(f"  {a} > {b}:  {a > b}")
print(f"  {a} == {b}: {a == b}")
print(f"  {a} != {b}: {a != b}")

# Lógicos
x, y = True, False
print("\\nOperadores Lógicos")
print("─" * 30)
print(f"  True and False = {x and y}")
print(f"  True or False  = {x or y}")
print(f"  not True       = {not x}")

# RETO: Calcula el área de un círculo
import math
radio = 7
area = math.pi * radio ** 2
print(f"\\n🔵 Área del círculo (r={radio}): {area:.2f}")
`,
        hints: [
          'math.pi da el valor de π (3.14159...)',
          'Área del círculo = π × r²',
          ':.2f formatea a 2 decimales',
        ],
        expectedConcepts: ['aritmetica', 'comparacion', 'logica', 'math'],
        challenge: 'Crea una calculadora que muestre TODAS las operaciones entre dos números ingresados'
      },
      {
        id: 'strings',
        title: 'Strings y Formato',
        description: 'Manipulación de texto, métodos, f-strings avanzados',
        difficulty: 'principiante',
        theory: `Strings en Python\n\nMétodos útiles:\n• .upper() .lower() .title()\n• .strip() .split() .join()\n• .replace() .find() .count()\n• .startswith() .endswith()\n• len() para longitud\n\nf-strings avanzados:\n• {valor:.2f} → decimales\n• {valor:>10} → alinear derecha\n• {valor:<10} → alinear izquierda\n• {valor:^10} → centrar`,
        starterCode: `# ═══ STRINGS Y FORMATO AVANZADO ═══

texto = "   Hola Mundo, Python es Genial!   "

print("Métodos de String")
print("─" * 40)
print(f"  Original:   '{texto}'")
print(f"  .strip():   '{texto.strip()}'")
print(f"  .upper():   '{texto.strip().upper()}'")
print(f"  .lower():   '{texto.strip().lower()}'")
print(f"  .title():   '{texto.strip().title()}'")
print(f"  Longitud:   {len(texto.strip())}")

# Split y Join
frase = "Python,Java,JavaScript,C++,Go"
lenguajes = frase.split(",")
print(f"\\nSplit: {lenguajes}")
print(f"Join:  {' | '.join(lenguajes)}")

# Búsqueda y reemplazo
email = "usuario@correo.com"
print(f"\\n'{email}' contiene '@': {('@' in email)}")
print(f"Termina en .com: {email.endswith('.com')}")
print(f"Replace: {email.replace('@', ' [arroba] ')}")

# Tabla formateada
print("\\n📊 Tabla de Calificaciones")
print(f"  {'Materia':<15} {'Nota':>6} {'Estado':>12}")
print("  " + "─" * 35)
datos = [("Matemáticas", 9.2), ("Ciencias", 8.5), ("Historia", 6.8), ("Arte", 9.8)]
for materia, nota in datos:
    estado = "✅ Aprobado" if nota >= 7 else "❌ Reprobado"
    print(f"  {materia:<15} {nota:>6.1f} {estado:>12}")

# Slicing de strings
palabra = "PYTHON"
print(f"\\nSlicing de '{palabra}':")
print(f"  [0:3]   = {palabra[0:3]}")
print(f"  [-3:]   = {palabra[-3:]}")
print(f"  [::-1]  = {palabra[::-1]}")
`,
        hints: [
          ':<15 alinea a la izquierda con 15 espacios',
          ':>6 alinea a la derecha con 6 espacios',
          '[::-1] invierte un string o lista',
        ],
        expectedConcepts: ['strings', 'metodos', 'formato', 'slicing'],
        challenge: 'Crea un programa que cuente vocales, consonantes y espacios de un texto'
      }
    ]
  },

  // ─── MODULE 2: CONTROL DE FLUJO ────────────────────────
  {
    id: 'control-flujo',
    title: 'Control de Flujo',
    description: 'Condicionales, bucles for/while, control de ejecución',
    icon: Zap,
    color: '#F59E0B',
    lessons: [
      {
        id: 'condicionales',
        title: 'Condicionales if/elif/else',
        description: 'Toma de decisiones, operador ternario, match-case',
        difficulty: 'principiante',
        theory: `Condicionales\n\nEstructura:\nif condición:\n    código\nelif otra_condición:\n    código\nelse:\n    código\n\nOperador ternario:\nresultado = valor_si_true if condición else valor_si_false`,
        starterCode: `# ═══ CONDICIONALES ═══

# Sistema de calificación
nota = 8.5

print("📋 Sistema de Calificación")
print("═" * 35)

if nota >= 9.5:
    grado = "Sobresaliente 🌟"
    color = "dorado"
elif nota >= 8.5:
    grado = "Muy Bueno 🎯"
    color = "azul"
elif nota >= 7.0:
    grado = "Bueno ✅"
    color = "verde"
elif nota >= 5.0:
    grado = "Regular ⚠️"
    color = "amarillo"
else:
    grado = "Insuficiente ❌"
    color = "rojo"

print(f"  Nota: {nota}/10")
print(f"  Calificación: {grado}")
print(f"  Color: {color}")

# Operador ternario
aprobado = "Sí ✓" if nota >= 7 else "No ✗"
print(f"  ¿Aprobado?: {aprobado}")

# Múltiples condiciones
edad = 16
tiene_permiso = True
es_feriado = False

puede_salir = edad >= 15 and (tiene_permiso or es_feriado)
print(f"\\n👤 Edad: {edad}, Permiso: {tiene_permiso}")
print(f"  ¿Puede salir?: {'Sí' if puede_salir else 'No'}")

# Clasificador de triángulos
a, b, c = 5, 5, 8
print(f"\\n📐 Triángulo ({a}, {b}, {c}):")
if a == b == c:
    print("  Tipo: Equilátero")
elif a == b or b == c or a == c:
    print("  Tipo: Isósceles")
else:
    print("  Tipo: Escaleno")
`,
        hints: [
          'elif = "else if" → múltiples condiciones',
          'Operador ternario: x if cond else y (una línea)',
          'and/or combinan condiciones lógicas',
        ],
        expectedConcepts: ['if', 'elif', 'else', 'ternario', 'logica'],
        challenge: 'Crea un calculador de descuentos: 20% si compra > $100, 10% si > $50, 5% si > $20'
      },
      {
        id: 'bucles-for',
        title: 'Bucles For',
        description: 'Iteración con range, enumerate, zip, comprensión de listas',
        difficulty: 'principiante',
        theory: `Bucle For\n\nfor item in secuencia:\n    # código\n\nFunciones útiles:\n• range(n) → 0 a n-1\n• range(a, b) → a a b-1\n• range(a, b, paso)\n• enumerate(seq) → (índice, valor)\n• zip(a, b) → pares\n\nList comprehension:\n[expr for x in seq if cond]`,
        starterCode: `# ═══ BUCLES FOR ═══

# range() básico
print("Conteo del 1 al 10:")
for i in range(1, 11):
    print(f"  {i}", end="")
print()

# enumerate - obtener índice y valor
frutas = ["🍎 Manzana", "🍌 Banana", "🍊 Naranja", "🍇 Uva", "🍓 Fresa"]
print("\\n🛒 Lista de Frutas:")
for i, fruta in enumerate(frutas, 1):
    print(f"  {i}. {fruta}")

# zip - iterar en paralelo
nombres = ["Ana", "Luis", "María"]
notas = [9.5, 7.8, 8.9]
print("\\n📊 Notas:")
for nombre, nota in zip(nombres, notas):
    emoji = "🏆" if nota >= 9 else "✅" if nota >= 7 else "⚠️"
    print(f"  {emoji} {nombre}: {nota}")

# Tabla de multiplicar
n = 7
print(f"\\n✖️ Tabla del {n}:")
for i in range(1, 11):
    print(f"  {n} × {i:2d} = {n*i:3d}")

# List comprehension
cuadrados = [x**2 for x in range(1, 11)]
pares = [x for x in range(1, 21) if x % 2 == 0]
print(f"\\n📐 Cuadrados 1-10: {cuadrados}")
print(f"📐 Pares 1-20: {pares}")

# Patrón pirámide
print("\\n🔺 Pirámide:")
for i in range(1, 6):
    print(f"  {'  ' * (5-i)}{'⭐ ' * i}")
`,
        hints: [
          'enumerate(lista, 1) empieza desde 1',
          'zip() combina dos listas elemento a elemento',
          'List comprehension: [x**2 for x in range(10)]',
        ],
        expectedConcepts: ['for', 'range', 'enumerate', 'zip', 'comprehension'],
        challenge: 'Genera los primeros 20 números de Fibonacci usando for'
      },
      {
        id: 'bucles-while',
        title: 'While, Break y Continue',
        description: 'Bucles condicionales, control de flujo avanzado',
        difficulty: 'intermedio',
        theory: `While y Control\n\nwhile condición:\n    código\n    if algo: break      # salir\n    if otro: continue   # siguiente\n\nfor...else:\n  El else se ejecuta si el for NO usó break`,
        starterCode: `# ═══ WHILE Y CONTROL DE FLUJO ═══

import random
random.seed(42)

# Juego de adivinanza (simulado)
secreto = random.randint(1, 100)
intentos = 0
guesses = [50, 75, 63, 69, 72, 70, 71]

print("🎮 Adivina el Número (1-100)")
print("═" * 35)

for guess in guesses:
    intentos += 1
    if guess == secreto:
        print(f"  #{intentos}: {guess} → ¡CORRECTO! 🎉")
        break
    elif guess < secreto:
        print(f"  #{intentos}: {guess} → Más alto ⬆️")
    else:
        print(f"  #{intentos}: {guess} → Más bajo ⬇️")
else:
    print(f"\\n  No adivinaste. Era {secreto}")

# While con condición
print("\\n🔢 Secuencia de Collatz (n=27):")
n = 27
pasos = 0
secuencia = [n]
while n != 1:
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    secuencia.append(n)
    pasos += 1

print(f"  Pasos: {pasos}")
print(f"  Máximo: {max(secuencia)}")
print(f"  Primeros 15: {secuencia[:15]}...")

# Break y continue
print("\\n🔍 Buscar primer múltiplo de 7 y 11:")
for num in range(1, 1000):
    if num % 7 != 0: continue
    if num % 11 != 0: continue
    print(f"  Encontrado: {num}")
    break

# Pirámide con while
print("\\n🔺 Pirámide:")
fila = 1
while fila <= 5:
    print(f"  {'  ' * (5-fila)}{'★ ' * fila}")
    fila += 1
`,
        hints: [
          'break sale del bucle completamente',
          'continue salta a la siguiente iteración',
          'for...else: el else corre si no hubo break',
        ],
        expectedConcepts: ['while', 'break', 'continue', 'for-else'],
        challenge: 'Implementa búsqueda binaria para adivinar un número del 1 al 1000'
      }
    ]
  },

  // ─── MODULE 3: FUNCIONES ────────────────────────────────
  {
    id: 'funciones',
    title: 'Funciones y Módulos',
    description: 'Definir funciones, parámetros, decoradores, recursión',
    icon: Rocket,
    color: '#8B5CF6',
    lessons: [
      {
        id: 'funciones-basicas',
        title: 'Funciones Básicas',
        description: 'def, return, parámetros, valores por defecto, lambda',
        difficulty: 'intermedio',
        theory: `Funciones\n\ndef nombre(param1, param2="default"):\n    '''Documentación'''\n    return resultado\n\n• Parámetros posicionales y nombrados\n• Valores por defecto\n• Return múltiple con tuplas\n• Lambda: funciones anónimas`,
        starterCode: `# ═══ FUNCIONES EN PYTHON ═══

def saludar(nombre, idioma="es"):
    """Saluda en el idioma dado."""
    saludos = {
        "es": f"¡Hola, {nombre}! 👋",
        "en": f"Hello, {nombre}! 👋",
        "fr": f"Bonjour, {nombre}! 👋",
        "de": f"Hallo, {nombre}! 👋",
    }
    return saludos.get(idioma, saludos["es"])

def calcular_imc(peso, altura):
    """Calcula IMC y categoría."""
    imc = peso / (altura ** 2)
    if imc < 18.5: cat = "Bajo peso"
    elif imc < 25: cat = "Normal"
    elif imc < 30: cat = "Sobrepeso"
    else: cat = "Obesidad"
    return round(imc, 1), cat

def fibonacci(n):
    """Genera n números de Fibonacci."""
    if n <= 0: return []
    if n == 1: return [0]
    fib = [0, 1]
    for _ in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

# Uso de funciones
print("🌍 Saludos:")
for lang in ["es", "en", "fr", "de"]:
    print(f"  {saludar('Carlos', lang)}")

imc, categoria = calcular_imc(70, 1.75)
print(f"\\n🏥 IMC: {imc} → {categoria}")

print(f"\\n🔢 Fibonacci(12): {fibonacci(12)}")

# Lambda y funciones de orden superior
cuadrado = lambda x: x ** 2
numeros = [3, 1, 4, 1, 5, 9, 2, 6]
print(f"\\n📊 Números: {numeros}")
print(f"  Cuadrados: {list(map(cuadrado, numeros))}")
print(f"  Pares: {list(filter(lambda x: x % 2 == 0, numeros))}")
print(f"  Suma: {sum(numeros)}")
print(f"  Ordenados: {sorted(numeros)}")
print(f"  Reverso: {sorted(numeros, reverse=True)}")
`,
        hints: [
          'Las funciones pueden retornar múltiples valores: return a, b',
          'lambda x: x**2 → función anónima de una línea',
          'map(func, lista) aplica func a cada elemento',
          'filter(func, lista) filtra elementos donde func retorna True',
        ],
        expectedConcepts: ['def', 'return', 'lambda', 'map', 'filter'],
        challenge: 'Crea una función que valide contraseñas (mín 8 chars, mayúscula, número, símbolo)'
      },
      {
        id: 'funciones-avanzadas',
        title: 'Funciones Avanzadas',
        description: '*args, **kwargs, decoradores, generadores, recursión',
        difficulty: 'avanzado',
        theory: `Funciones Avanzadas\n\n• *args: argumentos variables posicionales\n• **kwargs: argumentos variables nombrados\n• Decoradores: @decorator modifica función\n• Generadores: yield produce valores uno a uno\n• Recursión: función que se llama a sí misma`,
        starterCode: `# ═══ FUNCIONES AVANZADAS ═══

import time
from functools import lru_cache

# *args y **kwargs
def crear_perfil(nombre, *habilidades, **datos):
    return {
        "nombre": nombre,
        "habilidades": list(habilidades),
        **datos
    }

perfil = crear_perfil("Ana", "Python", "SQL", "ML", edad=25, ciudad="Quito")
print("👤 Perfil:", perfil)

# Decorador: medir tiempo
def medir_tiempo(func):
    def wrapper(*args, **kwargs):
        inicio = time.time()
        resultado = func(*args, **kwargs)
        ms = (time.time() - inicio) * 1000
        print(f"  ⏱️ {func.__name__}: {ms:.2f}ms")
        return resultado
    return wrapper

# Recursión con memoización
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n - 1) + fib(n - 2)

@medir_tiempo
def calcular_fib_grande():
    return [fib(i) for i in range(30)]

print("\\n🔢 Fibonacci(0-29):")
result = calcular_fib_grande()
print(f"  Últimos 5: {result[-5:]}")

# Generador
def primos(limite):
    """Genera primos hasta el límite."""
    for num in range(2, limite):
        if all(num % i != 0 for i in range(2, int(num**0.5) + 1)):
            yield num

print(f"\\n🔢 Primos < 50: {list(primos(50))}")

# Decorador con parámetros
def repetir(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for i in range(n):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repetir(3)
def saludar():
    print("  ¡Hola! 👋")

print("\\n🔁 Repetir 3 veces:")
saludar()
`,
        hints: [
          '@lru_cache memoriza resultados automáticamente',
          'yield convierte una función en generador (lazy)',
          'Los decoradores reciben y retornan funciones',
        ],
        expectedConcepts: ['args', 'kwargs', 'decoradores', 'generadores', 'recursion', 'lru_cache'],
        challenge: 'Crea un decorador @retry(n) que reintente una función n veces si falla'
      }
    ]
  },

  // ─── MODULE 4: ESTRUCTURAS DE DATOS ────────────────────
  {
    id: 'estructuras',
    title: 'Estructuras de Datos',
    description: 'Listas, diccionarios, sets, tuplas, algoritmos',
    icon: Database,
    color: '#10B981',
    lessons: [
      {
        id: 'listas',
        title: 'Listas y Algoritmos',
        description: 'Operaciones, slicing, sorting, búsqueda',
        difficulty: 'intermedio',
        theory: `Listas\n\nMétodos: append, extend, insert, pop, remove\nSlicing: lista[inicio:fin:paso]\nOrdenamiento: sorted(), .sort()\n\nAlgoritmos básicos:\n• Búsqueda lineal y binaria\n• Bubble sort, selection sort`,
        starterCode: `# ═══ LISTAS Y ALGORITMOS ═══

nums = [64, 34, 25, 12, 22, 11, 90, 1, 45, 78]

print("📊 Análisis de Lista")
print("═" * 40)
print(f"  Original:  {nums}")
print(f"  Ordenada:  {sorted(nums)}")
print(f"  Reversa:   {sorted(nums, reverse=True)}")
print(f"  Máximo:    {max(nums)}")
print(f"  Mínimo:    {min(nums)}")
print(f"  Suma:      {sum(nums)}")
print(f"  Promedio:  {sum(nums)/len(nums):.1f}")

# Slicing
print(f"\\n✂️ Slicing:")
print(f"  [:3]    = {nums[:3]}  (primeros 3)")
print(f"  [-3:]   = {nums[-3:]}  (últimos 3)")
print(f"  [::2]   = {nums[::2]}  (cada 2)")
print(f"  [::-1]  = {nums[::-1]}  (invertida)")

# Bubble Sort implementado
def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)
    swaps = 0
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swaps += 1
    return arr, swaps

ordenada, intercambios = bubble_sort(nums)
print(f"\\n🔄 Bubble Sort:")
print(f"  Resultado:      {ordenada}")
print(f"  Intercambios:   {intercambios}")

# Búsqueda binaria
def busqueda_binaria(arr, objetivo):
    izq, der = 0, len(arr) - 1
    pasos = 0
    while izq <= der:
        pasos += 1
        medio = (izq + der) // 2
        if arr[medio] == objetivo:
            return medio, pasos
        elif arr[medio] < objetivo:
            izq = medio + 1
        else:
            der = medio - 1
    return -1, pasos

arr_sorted = sorted(nums)
idx, pasos = busqueda_binaria(arr_sorted, 45)
print(f"\\n🔍 Búsqueda binaria de 45 en {arr_sorted}:")
print(f"  Encontrado en índice {idx} ({pasos} pasos)")

# Matrices
print("\\n📐 Matriz 3x3:")
matriz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
for fila in matriz:
    print(f"  {fila}")
print(f"  Diagonal: {[matriz[i][i] for i in range(3)]}")
`,
        hints: [
          'sorted() retorna nueva lista, .sort() modifica in-place',
          'Slicing: lista[inicio:fin:paso]',
          'copy() crea copia superficial para no modificar original',
        ],
        expectedConcepts: ['listas', 'slicing', 'bubble_sort', 'busqueda_binaria'],
        challenge: 'Implementa Quick Sort y compara velocidad con Bubble Sort'
      },
      {
        id: 'diccionarios',
        title: 'Diccionarios y Sets',
        description: 'Mapas clave-valor, conjuntos, operaciones',
        difficulty: 'intermedio',
        theory: `Diccionarios y Sets\n\ndict: pares clave-valor\n• .items() .keys() .values()\n• .get(key, default)\n• dict comprehension\n\nset: colección sin duplicados\n• & intersección\n• | unión\n• - diferencia`,
        starterCode: `# ═══ DICCIONARIOS Y CONJUNTOS ═══

from collections import Counter

# Sistema de inventario
inventario = {
    "laptop":       {"precio": 899.99, "stock": 15, "cat": "tech"},
    "mouse":        {"precio": 29.99,  "stock": 50, "cat": "tech"},
    "libro_python": {"precio": 45.00,  "stock": 30, "cat": "edu"},
    "mochila":      {"precio": 59.99,  "stock": 20, "cat": "acc"},
    "tablet":       {"precio": 449.99, "stock": 10, "cat": "tech"},
}

print("📦 INVENTARIO")
print("═" * 55)
print(f"  {'Producto':<15} {'Precio':>8} {'Stock':>6} {'Valor Total':>12}")
print("  " + "─" * 47)

total = 0
for nombre, datos in inventario.items():
    valor = datos["precio"] * datos["stock"]
    total += valor
    print(f"  {nombre:<15} \${datos['precio']:>7.2f} {datos['stock']:>6} \${valor:>11.2f}")

print("  " + "─" * 47)
print(f"  {'TOTAL':<15} {'':>8} {'':>6} \${total:>11.2f}")

# Dict comprehension
tech_items = {k: v for k, v in inventario.items() if v["cat"] == "tech"}
print(f"\\n🖥️ Solo tech: {list(tech_items.keys())}")

# Conjuntos (Sets)
python = {"Ana", "Luis", "María", "Carlos", "Pedro"}
javascript = {"María", "Pedro", "Juan", "Laura", "Ana"}

print(f"\\n👥 Equipos:")
print(f"  Python:       {python}")
print(f"  JavaScript:   {javascript}")
print(f"  Ambos (∩):    {python & javascript}")
print(f"  Solo Python:  {python - javascript}")
print(f"  Cualquiera:   {python | javascript}")
print(f"  Exclusivo:    {python ^ javascript}")

# Counter
texto = "programacion en python es genial python es el mejor"
palabras = Counter(texto.split())
print(f"\\n📊 Frecuencia de palabras:")
for palabra, freq in palabras.most_common(5):
    barra = "█" * (freq * 3)
    print(f"  {palabra:<12} {barra} ({freq})")
`,
        hints: [
          'dict.get(key, default) evita KeyError',
          '& intersección, | unión, - diferencia, ^ simétrica',
          'Counter cuenta frecuencias automáticamente',
        ],
        expectedConcepts: ['diccionarios', 'sets', 'comprehension', 'Counter'],
        challenge: 'Crea un sistema de gestión de contactos con CRUD y búsqueda'
      }
    ]
  },

  // ─── MODULE 5: POO ─────────────────────────────────────
  {
    id: 'poo',
    title: 'Programación Orientada a Objetos',
    description: 'Clases, herencia, polimorfismo, decoradores',
    icon: Brain,
    color: '#EC4899',
    lessons: [
      {
        id: 'clases',
        title: 'Clases y Objetos',
        description: 'Crear clases, atributos, métodos, properties',
        difficulty: 'intermedio',
        theory: `Clases en Python\n\nclass MiClase:\n    class_var = valor        # variable de clase\n    \n    def __init__(self, p):   # constructor\n        self.attr = p        # variable de instancia\n    \n    @property                # getter\n    def algo(self):\n        return self.attr\n    \n    def __str__(self):       # representación texto\n        return f"..."`,
        starterCode: `# ═══ PROGRAMACIÓN ORIENTADA A OBJETOS ═══

import random
random.seed(42)

class Estudiante:
    """Sistema de gestión estudiantil."""
    total = 0
    
    def __init__(self, nombre, edad, grado):
        self.nombre = nombre
        self.edad = edad
        self.grado = grado
        self.notas = []
        Estudiante.total += 1
        self._id = Estudiante.total
    
    def agregar_nota(self, nota):
        if 0 <= nota <= 10:
            self.notas.append(nota)
            return True
        return False
    
    @property
    def promedio(self):
        return sum(self.notas) / len(self.notas) if self.notas else 0
    
    @property
    def estado(self):
        if not self.notas: return "Sin notas"
        return "✅ Aprobado" if self.promedio >= 7 else "❌ Reprobado"
    
    @property
    def barra(self):
        pct = min(self.promedio / 10, 1.0)
        lleno = int(pct * 15)
        return f"[{'█' * lleno}{'░' * (15-lleno)}] {self.promedio:.1f}"
    
    def __str__(self):
        return f"#{self._id} {self.nombre} ({self.grado})"
    
    def __repr__(self):
        return f"Estudiante('{self.nombre}', {self.edad}, '{self.grado}')"

# Crear estudiantes
alumnos = [
    Estudiante("María López", 15, "10mo EGB"),
    Estudiante("Carlos Ruiz", 16, "1ro Bach"),
    Estudiante("Ana Torres", 14, "9no EGB"),
    Estudiante("Pedro García", 17, "2do Bach"),
]

# Generar notas aleatorias
for a in alumnos:
    for _ in range(6):
        a.agregar_nota(round(random.uniform(5, 10), 1))

# Reporte
print("🎓 REPORTE ACADÉMICO")
print("═" * 50)
for a in sorted(alumnos, key=lambda x: x.promedio, reverse=True):
    print(f"  {a}")
    print(f"    {a.barra}  {a.estado}")
    print(f"    Notas: {a.notas}")
    print()

print(f"📊 Total estudiantes: {Estudiante.total}")
print(f"📊 Mejor promedio: {max(a.promedio for a in alumnos):.1f}")
`,
        hints: [
          '@property convierte método en atributo de solo lectura',
          '__str__ define cómo print() muestra el objeto',
          'Variables de clase se comparten entre todas las instancias',
        ],
        expectedConcepts: ['class', 'init', 'self', 'property', 'dunder'],
        challenge: 'Crea un sistema de biblioteca con clases Libro, Usuario y Préstamo'
      },
      {
        id: 'herencia',
        title: 'Herencia y Polimorfismo',
        description: 'Clases abstractas, herencia múltiple, super()',
        difficulty: 'avanzado',
        theory: `Herencia\n\nclass Hijo(Padre):\n    def __init__(self):\n        super().__init__()\n\nPolimorfismo: misma interfaz, diferente implementación\nABC: clases abstractas con @abstractmethod`,
        starterCode: `# ═══ HERENCIA Y POLIMORFISMO ═══

from abc import ABC, abstractmethod
import math

class Forma(ABC):
    """Clase abstracta para formas geométricas."""
    
    @abstractmethod
    def area(self) -> float: pass
    
    @abstractmethod
    def perimetro(self) -> float: pass
    
    def info(self):
        nombre = self.__class__.__name__
        return f"{nombre}: A={self.area():.2f}, P={self.perimetro():.2f}"

class Circulo(Forma):
    def __init__(self, radio):
        self.radio = radio
    
    def area(self):
        return math.pi * self.radio ** 2
    
    def perimetro(self):
        return 2 * math.pi * self.radio

class Rectangulo(Forma):
    def __init__(self, ancho, alto):
        self.ancho = ancho
        self.alto = alto
    
    def area(self):
        return self.ancho * self.alto
    
    def perimetro(self):
        return 2 * (self.ancho + self.alto)

class Cuadrado(Rectangulo):
    def __init__(self, lado):
        super().__init__(lado, lado)

class Triangulo(Forma):
    def __init__(self, a, b, c):
        self.a, self.b, self.c = a, b, c
    
    def area(self):
        s = self.perimetro() / 2
        return math.sqrt(s * (s-self.a) * (s-self.b) * (s-self.c))
    
    def perimetro(self):
        return self.a + self.b + self.c

# Polimorfismo en acción
formas = [
    Circulo(5),
    Rectangulo(4, 6),
    Cuadrado(7),
    Triangulo(3, 4, 5),
    Circulo(10),
    Rectangulo(8, 3),
]

print("📐 GEOMETRÍA — Polimorfismo")
print("═" * 50)
for f in formas:
    print(f"  {f.info()}")

# Estadísticas polimórficas
areas = [f.area() for f in formas]
print(f"\\n📊 Estadísticas:")
print(f"  Total formas: {len(formas)}")
print(f"  Área total:   {sum(areas):.2f}")
print(f"  Área max:     {max(areas):.2f}")
print(f"  Área min:     {min(areas):.2f}")

# Verificación de tipos
print(f"\\n🔍 Tipos:")
for f in formas:
    print(f"  {type(f).__name__:12} isinstance(Forma): {isinstance(f, Forma)}")

print(f"  Cuadrado es Rectangulo: {isinstance(Cuadrado(5), Rectangulo)}")
`,
        hints: [
          'ABC + @abstractmethod fuerza a las subclases a implementar el método',
          'super().__init__() llama al constructor del padre',
          'isinstance() verifica la herencia completa',
        ],
        expectedConcepts: ['herencia', 'ABC', 'polimorfismo', 'super', 'isinstance'],
        challenge: 'Crea un RPG con clases Personaje, Guerrero, Mago y Arquero usando herencia'
      }
    ]
  },

  // ─── MODULE 6: PROYECTOS ───────────────────────────────
  {
    id: 'proyectos',
    title: 'Proyectos del Mundo Real',
    description: 'APIs, JSON, juegos, análisis de datos, regex',
    icon: Trophy,
    color: '#F43F5E',
    lessons: [
      {
        id: 'json-api',
        title: 'JSON y APIs',
        description: 'Procesar datos JSON, simular consumo de APIs',
        difficulty: 'avanzado',
        theory: `JSON y APIs\n\nimport json\n\n• json.loads(str) → Python dict\n• json.dumps(obj) → JSON string\n• json.dumps(obj, indent=2) → formateado`,
        starterCode: `# ═══ PROCESAMIENTO JSON / APIs ═══

import json
from collections import Counter
from statistics import mean, stdev

# Datos de API simulada
api_data = '''
{
  "ciudad": "Quito",
  "estaciones": [
    {"nombre": "Centro",     "temp": 18.5, "humedad": 72, "aqi": 45},
    {"nombre": "Norte",      "temp": 20.1, "humedad": 65, "aqi": 62},
    {"nombre": "Sur",        "temp": 17.8, "humedad": 78, "aqi": 38},
    {"nombre": "Valle",      "temp": 22.3, "humedad": 55, "aqi": 71},
    {"nombre": "Aeropuerto", "temp": 19.0, "humedad": 68, "aqi": 55},
    {"nombre": "Cumbayá",    "temp": 21.5, "humedad": 60, "aqi": 48}
  ]
}
'''

data = json.loads(api_data)

print(f"🌤️ REPORTE CLIMÁTICO — {data['ciudad']}")
print("═" * 55)

# Tabla de estaciones
print(f"  {'Estación':<12} {'Temp':>6} {'Hum':>5} {'AQI':>5} {'Calidad':>10}")
print("  " + "─" * 44)

for e in data["estaciones"]:
    aqi = e["aqi"]
    if aqi <= 50: calidad = "🟢 Buena"
    elif aqi <= 100: calidad = "🟡 Moderada"
    else: calidad = "🔴 Mala"
    print(f"  {e['nombre']:<12} {e['temp']:>5.1f}° {e['humedad']:>4}% {aqi:>5} {calidad:>10}")

# Análisis estadístico
temps = [e["temp"] for e in data["estaciones"]]
humedades = [e["humedad"] for e in data["estaciones"]]
aqis = [e["aqi"] for e in data["estaciones"]]

print(f"\\n📊 Estadísticas:")
print(f"  🌡️ Temperatura: min={min(temps)}° max={max(temps)}° avg={mean(temps):.1f}° std={stdev(temps):.1f}°")
print(f"  💧 Humedad:     min={min(humedades)}% max={max(humedades)}% avg={mean(humedades):.0f}%")
print(f"  🌬️ AQI:         min={min(aqis)} max={max(aqis)} avg={mean(aqis):.0f}")

# Exportar resumen como JSON
resumen = {
    "ciudad": data["ciudad"],
    "fecha": "2026-08-03",
    "resumen": {
        "temperatura": {"min": min(temps), "max": max(temps), "promedio": round(mean(temps), 1)},
        "estaciones_analizadas": len(data["estaciones"]),
        "calidad_aire": "buena" if mean(aqis) <= 50 else "moderada"
    }
}

print(f"\\n📤 JSON exportado:")
print(json.dumps(resumen, indent=2, ensure_ascii=False))
`,
        hints: [
          'json.loads() convierte string JSON a dict Python',
          'json.dumps(obj, indent=2) da formato legible',
          'statistics.mean() y stdev() para estadísticas rápidas',
        ],
        expectedConcepts: ['json', 'api', 'estadisticas', 'procesamiento'],
        challenge: 'Crea un dashboard que analice datos de múltiples ciudades y genere alertas'
      },
      {
        id: 'regex',
        title: 'Expresiones Regulares',
        description: 'Buscar, validar y extraer patrones de texto',
        difficulty: 'avanzado',
        theory: `Regex — import re\n\nPatrones:\n• \\d dígito, \\w alfanumérico, \\s espacio\n• . cualquier char, + 1 o más, * 0 o más\n• [] conjunto, () grupo, | alternativa\n\nFunciones:\n• re.search() → primera coincidencia\n• re.findall() → todas las coincidencias\n• re.sub() → reemplazar`,
        starterCode: `# ═══ EXPRESIONES REGULARES ═══

import re

texto = """
Equipo de desarrollo:
- Ana García: ana.garcia@empresa.com (Tel: +593-99-123-4567)
- Carlos López: carlos@gmail.com (Tel: +593-98-765-4321)
- María Torres: m.torres@universidad.edu.ec (Tel: 02-234-5678)
- Pedro Ruiz: pedro123@outlook.com (Tel: +1-555-123-4567)
Web: https://www.empresa.com/equipo
API: http://api.empresa.com/v2/users
Versiones: Python 3.11.3, Node 18.17.0, Go 1.21
"""

print("🔍 ANÁLISIS CON REGEX")
print("═" * 50)

# Extraer emails
emails = re.findall(r'[\\w.+-]+@[\\w-]+\\.[\\w.]+', texto)
print("\\n📧 Emails:")
for e in emails:
    dominio = e.split('@')[1]
    print(f"  • {e} (dominio: {dominio})")

# Extraer teléfonos
tels = re.findall(r'[+]?[\\d][-\\d]{9,}', texto)
print("\\n📱 Teléfonos:")
for t in tels:
    print(f"  • {t}")

# Extraer URLs
urls = re.findall(r'https?://[\\w./-]+', texto)
print("\\n🌐 URLs:")
for u in urls:
    protocolo = "HTTPS" if u.startswith("https") else "HTTP"
    print(f"  • [{protocolo}] {u}")

# Extraer versiones de software
versiones = re.findall(r'(\\w+)\\s+(\\d+\\.\\d+\\.?\\d*)', texto)
print("\\n⚙️ Versiones:")
for soft, ver in versiones:
    print(f"  • {soft} v{ver}")

# Validador de email
def validar_email(email):
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return bool(re.match(patron, email))

tests = ["user@email.com", "bad@", "ok@dom.co", "@nope.com", "a.b+c@x.org"]
print("\\n✅ Validación:")
for e in tests:
    print(f"  {'✓' if validar_email(e) else '✗'} {e}")

# Sanitizar
sucio = "  Hola!!!   ¿Cómo    estás???  "
limpio = re.sub(r'\\s+', ' ', sucio).strip()
limpio = re.sub(r'([!?])\\1+', r'\\1', limpio)
print(f"\\n🧹 Sanitizar: '{sucio}'")
print(f"   Resultado: '{limpio}'")
`,
        hints: [
          'r"..." es raw string — no interpreta backslashes',
          '\\w = letras/dígitos/_, \\d = dígitos, \\s = espacios',
          're.findall() retorna lista de coincidencias',
        ],
        expectedConcepts: ['regex', 'findall', 'match', 'sub', 'validacion'],
        challenge: 'Crea un parser de logs de servidor que extraiga IP, método HTTP y código de estado'
      },
      {
        id: 'juego-rpg',
        title: 'Proyecto: Juego RPG',
        description: 'Juego completo con clases, inventario y combate',
        difficulty: 'avanzado',
        theory: `Diseño de Juegos\n\nPatrones:\n• Herencia para tipos de personajes\n• Composición para inventario\n• State machine para estados del juego\n• Random para variabilidad`,
        starterCode: `# ═══ PROYECTO: JUEGO RPG ═══

import random
random.seed(42)

class Personaje:
    def __init__(self, nombre, hp, atk, defensa):
        self.nombre = nombre
        self.hp = hp
        self.hp_max = hp
        self.atk = atk
        self.defensa = defensa
        self.nivel = 1
        self.exp = 0
        self.inventario = []
    
    def esta_vivo(self): return self.hp > 0
    
    def atacar(self, otro):
        daño = max(1, self.atk - otro.defensa + random.randint(-2, 4))
        otro.hp = max(0, otro.hp - daño)
        return daño
    
    def curar(self, cant):
        self.hp = min(self.hp_max, self.hp + cant)
    
    def ganar_exp(self, cant):
        self.exp += cant
        if self.exp >= self.nivel * 50:
            self.exp = 0
            self.nivel += 1
            self.hp_max += 15
            self.atk += 3
            self.defensa += 2
            self.hp = self.hp_max
            return True
        return False
    
    def barra_hp(self):
        pct = self.hp / self.hp_max
        n = int(pct * 20)
        color = "🟢" if pct > 0.5 else "🟡" if pct > 0.25 else "🔴"
        return f"{color} [{'█'*n}{'░'*(20-n)}] {self.hp}/{self.hp_max}"

class Enemigo(Personaje):
    def __init__(self, nombre, hp, atk, defensa, exp_drop, loot=None):
        super().__init__(nombre, hp, atk, defensa)
        self.exp_drop = exp_drop
        self.loot = loot

# Crear héroe
heroe = Personaje("⚔️ Aventurero", 120, 15, 8)
heroe.inventario = ["Espada de Hierro", "Escudo de Madera", "Poción x3"]

# Enemigos de la mazmorra
mazmorras = [
    [Enemigo("Slime 🟢", 30, 6, 2, 15, "Gel Mágico"),
     Enemigo("Rata Gigante 🐀", 25, 8, 1, 12)],
    [Enemigo("Goblin 👺", 50, 10, 5, 25, "Daga Oxidada"),
     Enemigo("Goblin Arquero 🏹", 40, 12, 3, 22)],
    [Enemigo("Esqueleto 💀", 60, 13, 6, 35, "Hueso Antiguo"),
     Enemigo("Zombie 🧟", 70, 11, 8, 30)],
    [Enemigo("🐉 Dragón Anciano", 200, 22, 12, 150, "Escama de Dragón")]
]

# ═══ AVENTURA ═══
print("⚔️ LA MAZMORRA OSCURA")
print("═" * 50)
print(f"  {heroe.nombre} Lv.{heroe.nivel}")
print(f"  {heroe.barra_hp()}")
print(f"  ATK: {heroe.atk} | DEF: {heroe.defensa}")
print(f"  🎒 {', '.join(heroe.inventario)}")

for piso, enemigos in enumerate(mazmorras, 1):
    print(f"\\n{'━' * 50}")
    print(f"  📍 PISO {piso}")
    print(f"{'━' * 50}")
    
    for enemigo in enemigos:
        print(f"\\n  ⚡ ¡{enemigo.nombre} apareció! (HP:{enemigo.hp} ATK:{enemigo.atk})")
        ronda = 0
        
        while heroe.esta_vivo() and enemigo.esta_vivo():
            ronda += 1
            # Héroe ataca
            dmg_h = heroe.atacar(enemigo)
            log = f"    R{ronda}: Tu ataque → {dmg_h} dmg"
            
            if enemigo.esta_vivo():
                dmg_e = enemigo.atacar(heroe)
                log += f" | {enemigo.nombre} → {dmg_e} dmg"
                print(log)
            else:
                print(f"{log} | ¡{enemigo.nombre} derrotado! 💥")
                subio = heroe.ganar_exp(enemigo.exp_drop)
                if subio:
                    print(f"    🆙 ¡NIVEL {heroe.nivel}! ATK:{heroe.atk} DEF:{heroe.defensa} HP:{heroe.hp_max}")
                if enemigo.loot:
                    heroe.inventario.append(enemigo.loot)
                    print(f"    🎁 Obtenido: {enemigo.loot}")
                heroe.curar(20)
        
        if not heroe.esta_vivo():
            break
    
    if not heroe.esta_vivo():
        print(f"\\n💀 GAME OVER en Piso {piso}")
        break

if heroe.esta_vivo():
    print(f"\\n{'═' * 50}")
    print(f"  🏆 ¡VICTORIA TOTAL!")
    print(f"  {heroe.nombre} Lv.{heroe.nivel}")
    print(f"  {heroe.barra_hp()}")
    print(f"  🎒 {', '.join(heroe.inventario)}")
    print(f"{'═' * 50}")
`,
        hints: [
          'super().__init__() llama al constructor padre',
          'max(1, daño) evita daño negativo',
          'random.seed() hace reproducible el juego',
        ],
        expectedConcepts: ['clases', 'herencia', 'game_loop', 'random', 'inventario'],
        challenge: 'Agrega sistema de magia, tienda de ítems y múltiples tipos de personajes'
      }
    ]
  }
]
