'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Play, RotateCcw, Copy, Check, ChevronRight, ChevronDown,
  BookOpen, Code, Terminal, Lightbulb, Zap, Send, Loader2,
  Camera, Image as ImageIcon, Cpu, Sparkles, Download, Square
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

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

declare global {
  interface Window {
    loadPyodide: any
    pyodide: any
  }
}

const PYTHON_GUIDES: Record<string, Guide[]> = {
  'basico': [
    {
      title: '🎯 Variables y Tipos de Datos',
      content: 'Las variables son contenedores de información con tipos: str, int, float, bool, list, dict.',
      examples: [
        {
          title: 'Crear variables',
          code: `# Variables en Python - Todos los tipos
nombre = "Ana García"
edad = 14
altura = 1.62
es_estudiante = True
materias = ["Matemáticas", "Ciencias", "Arte"]
perfil = {"nombre": nombre, "edad": edad}

print(f"Nombre: {nombre} (tipo: {type(nombre).__name__})")
print(f"Edad: {edad} (tipo: {type(edad).__name__})")
print(f"Altura: {altura} (tipo: {type(altura).__name__})")
print(f"Estudiante: {es_estudiante} (tipo: {type(es_estudiante).__name__})")
print(f"Materias: {materias}")
print(f"Perfil: {perfil}")`,
          description: 'Todos los tipos de datos fundamentales con type()'
        },
        {
          title: 'Operaciones y f-strings',
          code: `# Calculadora completa con formateo
import math

radio = 5
area_circulo = math.pi * radio ** 2
circunferencia = 2 * math.pi * radio

print(f"{'='*35}")
print(f"{'CALCULADORA DE CÍRCULOS':^35}")
print(f"{'='*35}")
print(f"Radio: {radio} unidades")
print(f"Área: {area_circulo:.2f} u²")
print(f"Circunferencia: {circunferencia:.2f} u")
print(f"Pi: {math.pi:.10f}")
print(f"{'='*35}")`,
          description: 'Math, formateo avanzado y f-strings'
        },
        {
          title: 'Strings: métodos útiles',
          code: `# Métodos de strings - ¡Muy usados!
texto = "  Hola Mundo Python  "

print(f"Original: '{texto}'")
print(f"strip(): '{texto.strip()}'")
print(f"lower(): '{texto.strip().lower()}'")
print(f"upper(): '{texto.strip().upper()}'")
print(f"replace(): '{texto.strip().replace('Python', '🐍')}'")
print(f"split(): {texto.strip().split()}")
print(f"startswith('  H'): {texto.startswith('  H')}")
print(f"Longitud: {len(texto.strip())} caracteres")

# Slicing
palabra = "Python"
print(f"\\n'{palabra}' → slicing:")
print(f"  [0:3] = '{palabra[0:3]}'")
print(f"  [-3:] = '{palabra[-3:]}'")
print(f"  [::-1] = '{palabra[::-1]}'")`,
          description: 'Manipulación avanzada de texto'
        }
      ]
    },
    {
      title: '🔄 Condicionales Completos',
      content: 'if/elif/else con operadores lógicos and, or, not y ternario.',
      examples: [
        {
          title: 'Sistema de calificaciones',
          code: `# Sistema profesional de calificaciones
def calificar(nota):
    if nota >= 90:
        return "A", "Excelente 🌟"
    elif nota >= 80:
        return "B", "Muy Bien 👍"
    elif nota >= 70:
        return "C", "Bien 😊"
    elif nota >= 60:
        return "D", "Suficiente ⚠️"
    else:
        return "F", "Reprobado ❌"

notas = [95, 82, 67, 73, 58, 91, 88]
print(f"{'Nota':>6} {'Letra':>6} {'Estado':<15}")
print("-" * 30)
for nota in notas:
    letra, estado = calificar(nota)
    print(f"{nota:>6} {letra:>6} {estado:<15}")

promedio = sum(notas) / len(notas)
letra_prom, estado_prom = calificar(promedio)
print(f"\\nPromedio: {promedio:.1f} → {letra_prom} ({estado_prom})")`,
          description: 'Funciones con múltiples returns y formateo de tablas'
        },
        {
          title: 'Validador completo',
          code: `# Validador de contraseñas profesional
def validar_password(password):
    errores = []
    
    if len(password) < 8:
        errores.append("Mínimo 8 caracteres")
    if not any(c.isupper() for c in password):
        errores.append("Necesita mayúscula")
    if not any(c.islower() for c in password):
        errores.append("Necesita minúscula")
    if not any(c.isdigit() for c in password):
        errores.append("Necesita número")
    if not any(c in "!@#$%^&*" for c in password):
        errores.append("Necesita carácter especial")
    
    fuerza = 5 - len(errores)
    barra = "█" * fuerza + "░" * (5 - fuerza)
    
    return errores, fuerza, barra

passwords = ["abc", "Password1", "Str0ng!Pass", "12345678"]
for pwd in passwords:
    errores, fuerza, barra = validar_password(pwd)
    print(f"\\n'{pwd}'")
    print(f"  Fuerza: [{barra}] {fuerza}/5")
    if errores:
        for e in errores:
            print(f"  ❌ {e}")
    else:
        print(f"  ✅ Contraseña segura!")`,
          description: 'Validación con any(), all() y comprensiones'
        }
      ]
    },
    {
      title: '🔁 Bucles Avanzados',
      content: 'for, while, enumerate, zip, comprehensions, break/continue.',
      examples: [
        {
          title: 'Patrones y visualización',
          code: `# Generar patrones visuales
n = 7

# Triángulo
print("TRIÁNGULO:")
for i in range(1, n+1):
    print(" " * (n-i) + "⭐" * i)

# Diamante
print("\\nDIAMANTE:")
for i in range(1, n+1):
    print(" " * (n-i) + "◆ " * i)
for i in range(n-1, 0, -1):
    print(" " * (n-i) + "◆ " * i)

# Espiral numérica
print("\\nSECUENCIA FIBONACCI:")
a, b = 0, 1
fib = []
while a < 100:
    fib.append(a)
    a, b = b, a + b
print(fib)`,
          description: 'Patrones complejos con bucles anidados'
        },
        {
          title: 'Comprehensions',
          code: `# List/Dict/Set Comprehensions - Poder de Python

# List comprehension
cuadrados = [x**2 for x in range(1, 11)]
print(f"Cuadrados: {cuadrados}")

# Con filtro
pares = [x for x in range(1, 21) if x % 2 == 0]
print(f"Pares: {pares}")

# Dict comprehension
tabla = {x: x**2 for x in range(1, 6)}
print(f"Tabla: {tabla}")

# Anidado
matrix = [[i*j for j in range(1, 4)] for i in range(1, 4)]
print(f"\\nMatriz 3x3:")
for fila in matrix:
    print(f"  {fila}")

# enumerate y zip
nombres = ["Ana", "Carlos", "María"]
notas = [95, 87, 92]
for i, (nombre, nota) in enumerate(zip(nombres, notas), 1):
    print(f"  {i}. {nombre}: {nota}")`,
          description: 'Comprehensions: la forma Pythónica de crear colecciones'
        }
      ]
    }
  ],
  'intermedio': [
    {
      title: '⚙️ Funciones Avanzadas',
      content: 'args, kwargs, decoradores, lambda, closures y funciones de orden superior.',
      examples: [
        {
          title: 'Funciones de orden superior',
          code: `# Map, Filter, Reduce, Lambda
from functools import reduce

numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# map - transformar
cuadrados = list(map(lambda x: x**2, numeros))
print(f"Cuadrados: {cuadrados}")

# filter - filtrar
mayores_5 = list(filter(lambda x: x > 5, numeros))
print(f"Mayores a 5: {mayores_5}")

# reduce - acumular
suma = reduce(lambda a, b: a + b, numeros)
producto = reduce(lambda a, b: a * b, numeros[:5])
print(f"Suma total: {suma}")
print(f"Producto (1-5): {producto}")

# sorted con key
palabras = ["Python", "es", "genial", "para", "programar"]
por_largo = sorted(palabras, key=len)
por_alfa = sorted(palabras, key=str.lower)
print(f"\\nPor longitud: {por_largo}")
print(f"Alfabético: {por_alfa}")`,
          description: 'Programación funcional: map, filter, reduce, lambda'
        },
        {
          title: 'Decoradores',
          code: `# Decoradores - modificar comportamiento de funciones
import time

def medir_tiempo(func):
    def wrapper(*args, **kwargs):
        inicio = time.time()
        resultado = func(*args, **kwargs)
        fin = time.time()
        print(f"⏱ {func.__name__} tardó {(fin-inicio)*1000:.2f}ms")
        return resultado
    return wrapper

def repetir(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for i in range(n):
                resultado = func(*args, **kwargs)
            return resultado
        return wrapper
    return decorator

@medir_tiempo
def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n+1):
        a, b = b, a+b
    return b

@repetir(3)
def saludar(nombre):
    print(f"¡Hola, {nombre}!")

print(f"Fibonacci(30) = {fibonacci(30)}")
print()
saludar("Mundo")`,
          description: 'Decoradores con parámetros y sin parámetros'
        }
      ]
    },
    {
      title: '🏗️ POO Profesional',
      content: 'Clases, herencia, polimorfismo, métodos estáticos, propiedades.',
      examples: [
        {
          title: 'Sistema de inventario',
          code: `# Sistema de inventario con POO
class Producto:
    _total_productos = 0
    
    def __init__(self, nombre, precio, stock):
        self.nombre = nombre
        self._precio = precio
        self.stock = stock
        Producto._total_productos += 1
        self.id = Producto._total_productos
    
    @property
    def precio(self):
        return self._precio
    
    @precio.setter
    def precio(self, valor):
        if valor < 0:
            raise ValueError("Precio no puede ser negativo")
        self._precio = valor
    
    def vender(self, cantidad=1):
        if cantidad > self.stock:
            return f"❌ Stock insuficiente ({self.stock} disponibles)"
        self.stock -= cantidad
        return f"✅ Vendido {cantidad}x {self.nombre}"
    
    def __repr__(self):
        return f"[{self.id}] {self.nombre} - \${self.precio:.2f} ({self.stock} uds)"

class Inventario:
    def __init__(self):
        self.productos = []
    
    def agregar(self, producto):
        self.productos.append(producto)
    
    def buscar(self, nombre):
        return [p for p in self.productos if nombre.lower() in p.nombre.lower()]
    
    def reporte(self):
        total = sum(p.precio * p.stock for p in self.productos)
        print(f"{'='*45}")
        print(f"{'REPORTE DE INVENTARIO':^45}")
        print(f"{'='*45}")
        for p in self.productos:
            print(f"  {p}")
        print(f"{'='*45}")
        print(f"  Valor total: \${total:,.2f}")
        print(f"  Total productos: {len(self.productos)}")

# Usar el sistema
inv = Inventario()
inv.agregar(Producto("Laptop HP", 899.99, 15))
inv.agregar(Producto("Mouse Gamer", 45.50, 100))
inv.agregar(Producto("Teclado Mecánico", 120.00, 50))
inv.agregar(Producto("Monitor 27\"", 350.00, 20))

inv.reporte()
print(f"\\n{inv.productos[0].vender(3)}")
print(f"{inv.productos[1].vender(200)}")`,
          description: 'OOP completa: properties, class methods, dunder methods'
        },
        {
          title: 'Herencia y polimorfismo',
          code: `# Sistema de formas geométricas
import math

class Forma:
    def area(self):
        raise NotImplementedError
    
    def perimetro(self):
        raise NotImplementedError
    
    def info(self):
        print(f"\\n{'─'*30}")
        print(f"  {self.__class__.__name__}")
        print(f"  Área: {self.area():.2f}")
        print(f"  Perímetro: {self.perimetro():.2f}")

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

class Triangulo(Forma):
    def __init__(self, a, b, c):
        self.a, self.b, self.c = a, b, c
    def area(self):
        s = (self.a + self.b + self.c) / 2
        return math.sqrt(s * (s-self.a) * (s-self.b) * (s-self.c))
    def perimetro(self):
        return self.a + self.b + self.c

# Polimorfismo en acción
formas = [Circulo(5), Rectangulo(4, 6), Triangulo(3, 4, 5)]
print("CALCULADORA DE FORMAS")
for forma in formas:
    forma.info()

# Comparar áreas
mayor = max(formas, key=lambda f: f.area())
print(f"\\n🏆 Forma con mayor área: {mayor.__class__.__name__}")`,
          description: 'Herencia, métodos abstractos y polimorfismo'
        }
      ]
    },
    {
      title: '📊 Datos y Algoritmos',
      content: 'Algoritmos de ordenamiento, búsqueda, estructuras de datos avanzadas.',
      examples: [
        {
          title: 'Análisis de datos',
          code: `# Análisis estadístico sin librerías externas
import math
from collections import Counter

datos = [23, 45, 12, 67, 34, 89, 23, 45, 12, 56, 
         78, 34, 45, 67, 89, 23, 56, 78, 90, 12]

# Estadísticas básicas
n = len(datos)
media = sum(datos) / n
datos_sorted = sorted(datos)
mediana = (datos_sorted[n//2-1] + datos_sorted[n//2]) / 2 if n%2==0 else datos_sorted[n//2]
moda = Counter(datos).most_common(1)[0]
varianza = sum((x - media)**2 for x in datos) / n
desviacion = math.sqrt(varianza)

print(f"{'ANÁLISIS ESTADÍSTICO':^40}")
print(f"{'='*40}")
print(f"  Datos: {n} valores")
print(f"  Rango: [{min(datos)}, {max(datos)}]")
print(f"  Media: {media:.2f}")
print(f"  Mediana: {mediana:.2f}")
print(f"  Moda: {moda[0]} (aparece {moda[1]} veces)")
print(f"  Varianza: {varianza:.2f}")
print(f"  Desv. Estándar: {desviacion:.2f}")

# Histograma simple
print(f"\\n{'HISTOGRAMA':^40}")
rangos = [(0,25), (25,50), (50,75), (75,100)]
for lo, hi in rangos:
    count = sum(1 for x in datos if lo <= x < hi)
    bar = "█" * count
    print(f"  {lo:>3}-{hi:<3} | {bar} ({count})")`,
          description: 'Estadística completa sin librerías externas'
        },
        {
          title: 'Algoritmos de ordenamiento',
          code: `# Comparativa de algoritmos de ordenamiento
import time
import random

def bubble_sort(arr):
    arr = arr.copy()
    n = len(arr)
    comparaciones = 0
    for i in range(n):
        for j in range(0, n-i-1):
            comparaciones += 1
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr, comparaciones

def quick_sort(arr):
    comparaciones = [0]
    def _qs(a):
        if len(a) <= 1:
            return a
        pivot = a[len(a)//2]
        izq = [x for x in a if x < pivot]
        mid = [x for x in a if x == pivot]
        der = [x for x in a if x > pivot]
        comparaciones[0] += len(a)
        return _qs(izq) + mid + _qs(der)
    resultado = _qs(arr.copy())
    return resultado, comparaciones[0]

# Generar datos aleatorios
random.seed(42)
datos = [random.randint(1, 1000) for _ in range(200)]
print(f"Ordenando {len(datos)} elementos...\\n")

# Bubble Sort
t1 = time.time()
_, comp1 = bubble_sort(datos)
t1 = time.time() - t1

# Quick Sort
t2 = time.time()
_, comp2 = quick_sort(datos)
t2 = time.time() - t2

print(f"{'Algoritmo':<15} {'Comparaciones':>14} {'Tiempo':>10}")
print(f"{'-'*40}")
print(f"{'Bubble Sort':<15} {comp1:>14,} {t1*1000:>8.2f}ms")
print(f"{'Quick Sort':<15} {comp2:>14,} {t2*1000:>8.2f}ms")
print(f"\\n🏆 Quick Sort es {comp1/comp2:.1f}x más eficiente")`,
          description: 'Comparativa de algoritmos con medición de rendimiento'
        }
      ]
    }
  ],
  'avanzado': [
    {
      title: '🌐 APIs y Web',
      content: 'Hacer requests HTTP, parsear JSON, web scraping simulado.',
      examples: [
        {
          title: 'Simular API REST',
          code: `# Simulador de API REST
import json
from datetime import datetime

class APIServer:
    def __init__(self):
        self.db = {
            "users": [
                {"id": 1, "name": "Ana", "role": "admin"},
                {"id": 2, "name": "Carlos", "role": "user"},
                {"id": 3, "name": "María", "role": "user"},
            ],
            "posts": [
                {"id": 1, "user_id": 1, "title": "Intro a Python", "likes": 42},
                {"id": 2, "user_id": 2, "title": "Machine Learning", "likes": 28},
            ]
        }
    
    def get(self, endpoint, params=None):
        parts = endpoint.strip("/").split("/")
        collection = parts[0]
        
        if collection not in self.db:
            return {"status": 404, "error": "Not found"}
        
        data = self.db[collection]
        
        if len(parts) > 1:
            item_id = int(parts[1])
            item = next((x for x in data if x["id"] == item_id), None)
            if item:
                return {"status": 200, "data": item}
            return {"status": 404, "error": "Item not found"}
        
        return {"status": 200, "data": data, "count": len(data)}
    
    def post(self, endpoint, body):
        collection = endpoint.strip("/")
        if collection in self.db:
            body["id"] = len(self.db[collection]) + 1
            self.db[collection].append(body)
            return {"status": 201, "data": body}
        return {"status": 400, "error": "Invalid endpoint"}

# Usar la API
api = APIServer()

print("GET /users")
resp = api.get("/users")
print(json.dumps(resp, indent=2, ensure_ascii=False))

print("\\nGET /users/1")
resp = api.get("/users/1")
print(json.dumps(resp, indent=2, ensure_ascii=False))

print("\\nPOST /users")
resp = api.post("/users", {"name": "Pedro", "role": "user"})
print(json.dumps(resp, indent=2, ensure_ascii=False))`,
          description: 'Simular una API REST completa con CRUD'
        },
        {
          title: 'Procesamiento de texto NLP',
          code: `# Procesamiento de Lenguaje Natural básico
import re
from collections import Counter

texto = """Python es un lenguaje de programación de alto nivel.
Python es usado en inteligencia artificial, ciencia de datos,
desarrollo web y automatización. Python es fácil de aprender
y tiene una comunidad muy grande. El desarrollo con Python
es rápido y eficiente."""

# Tokenización
palabras = re.findall(r'\\b\\w+\\b', texto.lower())
print(f"Total palabras: {len(palabras)}")
print(f"Palabras únicas: {len(set(palabras))}")

# Frecuencia
freq = Counter(palabras)
print(f"\\nTop 10 palabras más frecuentes:")
for palabra, count in freq.most_common(10):
    bar = "█" * count
    print(f"  {palabra:<15} {bar} ({count})")

# Análisis de sentimiento simple
positivas = {"fácil", "rápido", "eficiente", "grande", "alto"}
negativas = {"difícil", "lento", "complejo", "error"}
score = sum(1 for p in palabras if p in positivas) - sum(1 for p in palabras if p in negativas)
sentimiento = "Positivo 😊" if score > 0 else "Negativo 😟" if score < 0 else "Neutral 😐"
print(f"\\nSentimiento: {sentimiento} (score: {score})")

# N-gramas
bigramas = [f"{palabras[i]} {palabras[i+1]}" for i in range(len(palabras)-1)]
print(f"\\nBigramas más comunes:")
for bg, c in Counter(bigramas).most_common(5):
    print(f"  '{bg}' → {c} veces")`,
          description: 'NLP: tokenización, frecuencia, sentimiento y n-gramas'
        }
      ]
    },
    {
      title: '🤖 Machine Learning Básico',
      content: 'Implementar algoritmos de ML desde cero sin librerías.',
      examples: [
        {
          title: 'K-Nearest Neighbors',
          code: `# K-Nearest Neighbors desde cero
import math
import random

# Dataset: [altura_cm, peso_kg] -> clase (0=gato, 1=perro)
dataset = [
    ([25, 3], 0), ([30, 4], 0), ([28, 3.5], 0),
    ([20, 2.5], 0), ([35, 5], 0), ([22, 2.8], 0),
    ([60, 25], 1), ([65, 30], 1), ([55, 22], 1),
    ([70, 35], 1), ([58, 28], 1), ([62, 32], 1),
]

def distancia(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def knn_predict(dataset, nuevo_punto, k=3):
    # Calcular distancias
    distancias = []
    for punto, clase in dataset:
        d = distancia(punto, nuevo_punto)
        distancias.append((d, clase))
    
    # Ordenar por distancia y tomar k vecinos
    distancias.sort(key=lambda x: x[0])
    vecinos = distancias[:k]
    
    # Votar
    votos = {}
    for d, clase in vecinos:
        votos[clase] = votos.get(clase, 0) + 1
    
    prediccion = max(votos, key=votos.get)
    confianza = votos[prediccion] / k * 100
    return prediccion, confianza, vecinos

# Predecir nuevos animales
print(f"{'='*50}")
print(f"{'KNN CLASIFICADOR: ¿GATO O PERRO?':^50}")
print(f"{'='*50}")

pruebas = [[27, 3.2], [63, 28], [40, 12], [22, 2.5]]
nombres_clase = {0: "🐱 Gato", 1: "🐕 Perro"}

for punto in pruebas:
    pred, conf, vecinos = knn_predict(dataset, punto, k=3)
    print(f"\\n  Punto: altura={punto[0]}cm, peso={punto[1]}kg")
    print(f"  Predicción: {nombres_clase[pred]} ({conf:.0f}% confianza)")
    print(f"  Vecinos: {[(f'{d:.1f}', nombres_clase[c]) for d, c in vecinos]}")`,
          description: 'Algoritmo KNN implementado desde cero'
        },
        {
          title: 'Red neuronal simple',
          code: `# Red Neuronal Simple (Perceptrón) desde cero
import math
import random

random.seed(42)

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))

def sigmoid_derivative(x):
    return x * (1 - x)

class NeuralNetwork:
    def __init__(self, inputs, hidden, outputs):
        # Inicializar pesos aleatorios
        self.w_hidden = [[random.uniform(-1, 1) for _ in range(inputs)] for _ in range(hidden)]
        self.b_hidden = [random.uniform(-1, 1) for _ in range(hidden)]
        self.w_output = [[random.uniform(-1, 1) for _ in range(hidden)] for _ in range(outputs)]
        self.b_output = [random.uniform(-1, 1) for _ in range(outputs)]
    
    def forward(self, inputs):
        # Capa oculta
        self.hidden = []
        for i in range(len(self.w_hidden)):
            total = sum(inputs[j] * self.w_hidden[i][j] for j in range(len(inputs)))
            self.hidden.append(sigmoid(total + self.b_hidden[i]))
        
        # Capa de salida
        outputs = []
        for i in range(len(self.w_output)):
            total = sum(self.hidden[j] * self.w_output[i][j] for j in range(len(self.hidden)))
            outputs.append(sigmoid(total + self.b_output[i]))
        
        return outputs
    
    def train(self, X, Y, epochs=1000, lr=0.5):
        for epoch in range(epochs):
            total_error = 0
            for inputs, expected in zip(X, Y):
                output = self.forward(inputs)
                error = [(expected[i] - output[i]) for i in range(len(output))]
                total_error += sum(e**2 for e in error)
                
                # Backprop simplificado
                for i in range(len(self.w_output)):
                    delta = error[i] * sigmoid_derivative(output[i])
                    for j in range(len(self.hidden)):
                        self.w_output[i][j] += lr * delta * self.hidden[j]
                    self.b_output[i] += lr * delta
            
            if epoch % 200 == 0:
                print(f"  Epoch {epoch}: error = {total_error:.4f}")

# Entrenar XOR (problema clásico)
print("🧠 ENTRENANDO RED NEURONAL (XOR)")
print("-" * 35)
nn = NeuralNetwork(2, 4, 1)

X = [[0,0], [0,1], [1,0], [1,1]]
Y = [[0], [1], [1], [0]]

nn.train(X, Y, epochs=1000)

print(f"\\n📊 RESULTADOS:")
for inputs, expected in zip(X, Y):
    output = nn.forward(inputs)
    pred = round(output[0])
    status = "✅" if pred == expected[0] else "❌"
    print(f"  {inputs} → {output[0]:.3f} (pred: {pred}) {status}")`,
          description: 'Red neuronal con backpropagation desde cero'
        }
      ]
    },
    {
      title: '👁️ Visión por Computadora',
      content: 'Procesamiento de imágenes y detección usando Python puro.',
      examples: [
        {
          title: 'Procesamiento de imagen ASCII',
          code: `# Visión por computadora: Procesamiento de imágenes ASCII
import random

# Simular una imagen como matriz de píxeles (0-255)
random.seed(42)
WIDTH, HEIGHT = 20, 15

# Crear imagen con un círculo
imagen = [[0]*WIDTH for _ in range(HEIGHT)]
cx, cy, r = WIDTH//2, HEIGHT//2, 5

for y in range(HEIGHT):
    for x in range(WIDTH):
        dist = ((x-cx)**2 + (y-cy)**2) ** 0.5
        if dist < r:
            imagen[y][x] = 255
        elif dist < r + 2:
            imagen[y][x] = 128

# Convertir a ASCII art
chars = " .:-=+*#%@"
print("IMAGEN ORIGINAL:")
for fila in imagen:
    line = ""
    for pixel in fila:
        idx = min(len(chars)-1, pixel * len(chars) // 256)
        line += chars[idx] * 2
    print(f"  {line}")

# Detección de bordes (Sobel simplificado)
print("\\nDETECCIÓN DE BORDES:")
bordes = [[0]*WIDTH for _ in range(HEIGHT)]
for y in range(1, HEIGHT-1):
    for x in range(1, WIDTH-1):
        gx = imagen[y-1][x+1] - imagen[y-1][x-1] + \\
             2*(imagen[y][x+1] - imagen[y][x-1]) + \\
             imagen[y+1][x+1] - imagen[y+1][x-1]
        gy = imagen[y+1][x-1] - imagen[y-1][x-1] + \\
             2*(imagen[y+1][x] - imagen[y-1][x]) + \\
             imagen[y+1][x+1] - imagen[y-1][x+1]
        bordes[y][x] = min(255, int((gx**2 + gy**2)**0.5))

for fila in bordes:
    line = ""
    for pixel in fila:
        idx = min(len(chars)-1, pixel * len(chars) // 256)
        line += chars[idx] * 2
    print(f"  {line}")

# Estadísticas
total_pixels = WIDTH * HEIGHT
blancos = sum(1 for y in range(HEIGHT) for x in range(WIDTH) if imagen[y][x] > 128)
print(f"\\n📊 Análisis:")
print(f"  Tamaño: {WIDTH}x{HEIGHT} = {total_pixels} píxeles")
print(f"  Objeto detectado: {blancos} píxeles ({blancos/total_pixels*100:.1f}%)")
print(f"  Centro estimado: ({cx}, {cy})")`,
          description: 'Procesamiento de imágenes con Sobel y ASCII art'
        },
        {
          title: 'Detector de patrones',
          code: `# Detector de patrones en datos - Visión por computadora simplificada
import random
import math

random.seed(123)

# Simular datos de sensores (como una cámara de seguridad)
class MotionDetector:
    def __init__(self, width=30, height=15):
        self.w = width
        self.h = height
        self.threshold = 50
    
    def generate_frame(self, has_motion=False, mx=0, my=0):
        """Genera un frame con ruido y opcionalmente movimiento"""
        frame = [[random.randint(0, 30) for _ in range(self.w)] for _ in range(self.h)]
        if has_motion:
            for dy in range(-2, 3):
                for dx in range(-3, 4):
                    ny, nx = my+dy, mx+dx
                    if 0 <= ny < self.h and 0 <= nx < self.w:
                        frame[ny][nx] = random.randint(180, 255)
        return frame
    
    def detect_motion(self, frame1, frame2):
        """Detecta movimiento comparando dos frames"""
        diff = [[abs(frame2[y][x] - frame1[y][x]) for x in range(self.w)] for y in range(self.h)]
        
        # Encontrar región con movimiento
        motion_pixels = 0
        sum_x, sum_y = 0, 0
        for y in range(self.h):
            for x in range(self.w):
                if diff[y][x] > self.threshold:
                    motion_pixels += 1
                    sum_x += x
                    sum_y += y
        
        if motion_pixels > 0:
            center_x = sum_x // motion_pixels
            center_y = sum_y // motion_pixels
            return True, (center_x, center_y), motion_pixels
        return False, None, 0
    
    def visualize(self, frame, label=""):
        chars = " ░▒▓█"
        print(f"  {label}")
        for fila in frame:
            line = ""
            for pixel in fila:
                idx = min(len(chars)-1, pixel * len(chars) // 256)
                line += chars[idx]
            print(f"  |{line}|")

# Simular detección
detector = MotionDetector()

print("🎥 SISTEMA DE DETECCIÓN DE MOVIMIENTO")
print("=" * 40)

# Frame sin movimiento
frame1 = detector.generate_frame(has_motion=False)
detector.visualize(frame1, "Frame 1 (sin movimiento):")

# Frame con movimiento
frame2 = detector.generate_frame(has_motion=True, mx=15, my=7)
detector.visualize(frame2, "\\nFrame 2 (con movimiento):")

# Detectar
detected, center, pixels = detector.detect_motion(frame1, frame2)
print(f"\\n{'─'*40}")
print(f"  🔍 Movimiento detectado: {'SÍ ⚠️' if detected else 'NO ✅'}")
if detected:
    print(f"  📍 Centro del movimiento: {center}")
    print(f"  📊 Píxeles afectados: {pixels}")
    print(f"  🎯 Alerta: Objeto en cuadrante {'superior' if center[1] < 7 else 'inferior'}-{'izquierdo' if center[0] < 15 else 'derecho'}")`,
          description: 'Detector de movimiento tipo cámara de seguridad'
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
  const { user } = useAuth()
  const [code, setCode] = useState('# Escribe tu código Python aquí\nprint("¡Hola Mundo!")\nprint(f"2 + 2 = {2 + 2}")')
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
  const [pyodideReady, setPyodideReady] = useState(false)
  const [pyodideLoading, setPyodideLoading] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  // Load Pyodide (real Python in WebAssembly)
  const loadPyodideEngine = useCallback(async () => {
    if (window.pyodide) {
      setPyodideReady(true)
      return
    }
    if (pyodideLoading) return
    setPyodideLoading(true)
    
    try {
      // Load Pyodide script
      if (!document.querySelector('script[src*="pyodide"]')) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.async = true
        document.head.appendChild(script)
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }
      
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      })
      window.pyodide = pyodide
      setPyodideReady(true)
    } catch (err) {
      console.error('Failed to load Pyodide:', err)
    }
    setPyodideLoading(false)
  }, [pyodideLoading])

  // Auto-load Pyodide on mount
  useEffect(() => {
    loadPyodideEngine()
  }, [])

  // Pre-llenar nombre del estudiante si está autenticado
  useEffect(() => {
    if (user?.name && !studentName) {
      setStudentName(user.name)
    }
  }, [user])

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

  const runCode = async () => {
    setIsRunning(true)
    setOutput(['⏳ Ejecutando con Python real (Pyodide)...'])

    try {
      if (!window.pyodide) {
        setOutput(['⏳ Cargando Python (primera vez tarda ~5s)...'])
        await loadPyodideEngine()
      }

      if (window.pyodide) {
        // Redirect stdout/stderr
        window.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`)
        
        try {
          window.pyodide.runPython(code)
          const stdout = window.pyodide.runPython('sys.stdout.getvalue()')
          const stderr = window.pyodide.runPython('sys.stderr.getvalue()')
          
          const results: string[] = []
          if (stdout) {
            results.push(...stdout.split('\n').filter((l: string) => l !== ''))
          }
          if (stderr) {
            results.push(...stderr.split('\n').filter((l: string) => l !== '').map((l: string) => `⚠️ ${l}`))
          }
          
          setOutput(results.length > 0 ? results : ['(Programa ejecutado sin salida)'])
        } catch (pyErr: any) {
          // Extract meaningful error message
          const errMsg = pyErr.message || String(pyErr)
          const lines = errMsg.split('\n')
          // Get last few lines which usually contain the actual error
          const relevantLines = lines.slice(-3).filter((l: string) => l.trim())
          setOutput(['❌ Error de Python:', ...relevantLines])
        } finally {
          // Reset stdout/stderr
          window.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`)
        }
      } else {
        setOutput(['❌ No se pudo cargar el motor Python. Verifica tu conexión a internet.'])
      }
    } catch (err: any) {
      setOutput([`❌ Error: ${err.message}`])
    }
    
    setIsRunning(false)
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
          studentEmail: user?.email || '',
          levelId,
          lessonId: selectedTask,
          courseId: user?.courseId || '',
          schoolId: user?.schoolId || '',
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
          <h3 className="font-bold text-gray-900">Simulador Python</h3>
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
            {getLevel().charAt(0).toUpperCase() + getLevel().slice(1)}
          </span>
        </div>
        <button
          onClick={() => setShowGuides(!showGuides)}
          className="flex items-center gap-1 px-3 py-1 bg-[#558C89]/20 text-[#558C89] rounded-lg hover:bg-[#558C89]/30 transition-colors text-sm font-medium"
        >
          <BookOpen className="w-4 h-4" />
          {showGuides ? 'Ocultar' : 'Mostrar'} Guías
        </button>
      </div>

      {/* Guides */}
      {showGuides && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-[#D9853B]" />
            <span className="text-sm text-gray-700 font-medium">Guías y Ejemplos</span>
          </div>
          <div className="space-y-2">
            {guides.map((guide, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveGuide(activeGuide === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 bg-[#558C89]/10 hover:bg-[#558C89]/20 transition-colors"
                >
                  <span className="font-medium text-gray-800">{guide.title}</span>
                  {activeGuide === idx ? (
                    <ChevronDown className="w-4 h-4 text-[#558C89]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#558C89]" />
                  )}
                </button>
                {activeGuide === idx && (
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">{guide.content}</p>
                    <div className="grid gap-2">
                      {guide.examples.map((example, exIdx) => (
                        <button
                          key={exIdx}
                          onClick={() => loadExample(example)}
                          className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:bg-[#D9853B]/10 hover:border-[#D9853B] transition-colors text-left"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-800">{example.title}</div>
                            <div className="text-xs text-gray-500">{example.description}</div>
                          </div>
                          <Zap className="w-4 h-4 text-[#D9853B]" />
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
        <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-gray-300 shadow-md">
          <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d3d] border-b border-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-gray-300">codigo.py</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="p-1.5 hover:bg-gray-600 rounded transition-colors"
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
                className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                title="Limpiar"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 bg-[#1e1e2e] text-[#9cdcfe] font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder="# Escribe tu código Python aquí"
          />
        </div>

        {/* Output */}
        <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-gray-300 shadow-md">
          <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d3d] border-b border-gray-600">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-300">Salida</span>
            </div>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#558C89] hover:bg-[#4a7a78] disabled:bg-gray-500 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Ejecutando...' : 'Ejecutar'}
            </button>
          </div>
          <div
            ref={outputRef}
            className="h-64 p-4 overflow-y-auto font-mono text-sm bg-[#1e1e2e]"
          >
            {output.map((line, idx) => (
              <div key={idx} className="text-[#4ec9b0]">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enviar al Profesor */}
      {output.length > 0 && (
        <div className="bg-gradient-to-r from-[#558C89]/10 to-[#D9853B]/10 border border-[#558C89]/30 rounded-xl p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800 font-medium flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#D9853B]" />
                  Enviar al Profesor
                </p>
                <p className="text-xs text-gray-500">Tu código y resultado se enviarán para calificación</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Tu nombre..."
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400"
              />
              
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
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
                className="bg-[#D9853B] hover:bg-[#c77835] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
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
            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm text-center">
                ✅ Tu código fue enviado correctamente. El profesor lo verá en su panel de calificaciones.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-[#558C89]/10 border border-[#558C89]/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-[#558C89] mt-0.5" />
          <div className="text-sm text-gray-600">
            <strong className="text-gray-800">Tip:</strong> Este es un simulador educativo. Soporta variables, print, bucles for, 
            condicionales if/else, y operaciones básicas. ¡Perfecto para aprender los fundamentos!
          </div>
        </div>
      </div>
    </div>
  )
}
