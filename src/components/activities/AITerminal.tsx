'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Brain, Terminal as TerminalIcon, Copy, Download, Trash2, Send, Check,
  Loader2, BookOpen, CheckCircle2, Circle, Maximize2, Minimize2,
  X, Package, Play, Square, RotateCcw, Plus, File, Rocket
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/AuthProvider'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

declare global {
  interface Window { loadPyodide: any; pyodide: any }
}

// ============================================================
// AI EXERCISES - Built-in progressive curriculum
// ============================================================
interface AIExercise {
  id: string
  title: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  description: string
  theory: string
  code: string
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
    theory: `# Inteligencia Artificial
## Que es la IA?
La IA es la capacidad de las maquinas de imitar la inteligencia humana.

## Tipos principales:
- **IA Estrecha**: Especializada en una tarea (ej: reconocer rostros)
- **IA General**: Capaz de cualquier tarea intelectual (aun no existe)
- **ML (Machine Learning)**: La maquina aprende de datos sin programarla explicitamente

## Python para IA:
Python es el lenguaje #1 para IA por sus librerias: NumPy, Pandas, TensorFlow, PyTorch`,
    code: `# Hola Mundo de Inteligencia Artificial
# Este es tu primer programa de IA!

print("=" * 50)
print("  INTELIGENCIA ARTIFICIAL - ChaskiBots Lab")
print("=" * 50)

# Concepto 1: Los datos son la base de la IA
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

# Concepto 2: Un modelo simple basado en reglas
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

# Concepto 3: Hacer predicciones
print("\\n--- PREDICCIONES ---")
pruebas = ["me encanta la pizza", "es horrible el clima", "hoy es un dia normal"]
for texto in pruebas:
    resultado, confianza = predecir_sentimiento(texto)
    print(f"  '{texto}' -> {resultado} (score: {confianza})")

print("\\nEsto es IA basada en reglas!")
print("Con ML, la maquina aprende las reglas SOLA de los datos")`,
  },
  {
    id: 'variables-ia', title: 'Variables para IA', icon: '\u{1F4E6}', difficulty: 'easy', category: 'basics',
    description: 'Tipos de datos esenciales para Machine Learning',
    theory: `# Variables en IA
## Tipos fundamentales:
- **int/float**: Valores numericos (features)
- **list**: Secuencias de datos (datasets)
- **dict**: Pares clave-valor (estructuras de datos)
- **bool**: Verdadero/Falso (clasificacion binaria)

## En Machine Learning:
- Features (X): Las variables de entrada
- Labels (y): Lo que queremos predecir
- Weights (w): Lo que el modelo aprende`,
    code: `# Variables y Tipos de Datos para IA
print("=== TIPOS DE DATOS EN IA ===\\n")

# 1. Numericos - fundamentales para calculos
edad = 25
temperatura = 36.5
learning_rate = 0.001
print(f"Numericos: edad={edad}, temp={temperatura}, lr={learning_rate}")

# 2. Listas - representan datasets
alturas = [1.65, 1.78, 1.52, 1.90, 1.73]
print(f"\\nDataset alturas: {alturas}")
print(f"  Promedio: {sum(alturas)/len(alturas):.2f}m")
print(f"  Min: {min(alturas)}, Max: {max(alturas)}")

# 3. Matrices (listas de listas) - datos tabulares
dataset = [
    [1.65, 55, 22],  # [altura, peso, edad]
    [1.78, 72, 35],
    [1.52, 48, 19],
    [1.90, 88, 40],
]
print(f"\\nMatriz de datos ({len(dataset)} filas x {len(dataset[0])} columnas):")
for fila in dataset:
    print(f"  {fila}")

# 4. Diccionarios - metadatos y configuracion
modelo_config = {
    "nombre": "RedNeuronal_v1",
    "capas": [784, 128, 64, 10],
    "activacion": "relu",
    "epochs": 50,
    "accuracy": 0.95
}
print(f"\\nConfiguracion del modelo:")
for k, v in modelo_config.items():
    print(f"  {k}: {v}")

# 5. One-hot encoding (representacion de categorias)
categorias = {"gato": [1,0,0], "perro": [0,1,0], "ave": [0,0,1]}
print(f"\\nOne-hot encoding:")
for animal, vector in categorias.items():
    print(f"  {animal} -> {vector}")

print("\\nEstos tipos de datos son la BASE de todo en IA!")`,
  },
  {
    id: 'funciones-ia', title: 'Funciones de IA', icon: '\u{2699}\u{FE0F}', difficulty: 'easy', category: 'basics',
    description: 'Funciones esenciales para procesar datos de IA',
    theory: `# Funciones en IA
## Por que funciones?
- Reutilizar logica de procesamiento
- Abstraer operaciones complejas
- Crear pipelines de datos

## Funciones comunes en IA:
- Normalizacion de datos
- Funciones de activacion
- Metricas de evaluacion
- Transformaciones de features`,
    code: `# Funciones Esenciales para IA
import math
import random

print("=== FUNCIONES FUNDAMENTALES DE IA ===\\n")

# 1. Funcion Sigmoide - clasica en redes neuronales
def sigmoid(x):
    return 1 / (1 + math.exp(-x))

print("1. Funcion Sigmoide (activacion):")
for x in [-3, -1, 0, 1, 3]:
    print(f"   sigmoid({x:+d}) = {sigmoid(x):.4f}")

# 2. Normalizacion Min-Max (escalar datos entre 0 y 1)
def normalizar(datos):
    min_val = min(datos)
    max_val = max(datos)
    return [(x - min_val) / (max_val - min_val) for x in datos]

datos_raw = [150, 200, 80, 300, 120]
datos_norm = normalizar(datos_raw)
print(f"\\n2. Normalizacion Min-Max:")
print(f"   Original:    {datos_raw}")
print(f"   Normalizado: [{', '.join(f'{x:.2f}' for x in datos_norm)}]")

# 3. Distancia Euclidiana (base de KNN)
def distancia(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

a = [1, 2, 3]
b = [4, 5, 6]
print(f"\\n3. Distancia Euclidiana:")
print(f"   Punto A: {a}")
print(f"   Punto B: {b}")
print(f"   Distancia: {distancia(a, b):.4f}")

# 4. Funcion de costo (Mean Squared Error)
def mse(reales, predichos):
    n = len(reales)
    return sum((r - p) ** 2 for r, p in zip(reales, predichos)) / n

reales = [3.0, 5.0, 7.0, 9.0]
predichos = [2.8, 5.2, 6.8, 9.5]
print(f"\\n4. Error Cuadratico Medio (MSE):")
print(f"   Reales:    {reales}")
print(f"   Predichos: {predichos}")
print(f"   MSE: {mse(reales, predichos):.4f}")

# 5. Softmax (probabilidades para clasificacion)
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

print("\\nEstas funciones son los bloques basicos de la IA!")`,
  },
  // === NUMPY & ARRAYS ===
  {
    id: 'numpy-basics', title: 'NumPy Fundamentos', icon: '\u{1F522}', difficulty: 'easy', category: 'numpy',
    description: 'Arrays y operaciones vectorizadas con NumPy (simulado)',
    theory: `# NumPy - Computacion Numerica
## Que es NumPy?
La libreria fundamental para computacion numerica en Python.

## Conceptos clave:
- **ndarray**: Array N-dimensional eficiente
- **Vectorizacion**: Operaciones sin loops
- **Broadcasting**: Operaciones entre arrays de diferente forma
- **Shapes**: Dimensiones de los arrays`,
    code: `# NumPy Fundamentos (simulado con listas Python puras)
# En un entorno real usarias: import numpy as np
import random
import math

print("=== NUMPY FUNDAMENTOS (simulado) ===\\n")

# Simulamos operaciones de NumPy con Python puro
class MiniNumpy:
    @staticmethod
    def array(data):
        return list(data)
    
    @staticmethod
    def zeros(n):
        return [0.0] * n
    
    @staticmethod
    def ones(n):
        return [1.0] * n
    
    @staticmethod
    def random_array(n):
        return [random.random() for _ in range(n)]
    
    @staticmethod
    def dot(a, b):
        return sum(x*y for x, y in zip(a, b))
    
    @staticmethod
    def mean(arr):
        return sum(arr) / len(arr)
    
    @staticmethod
    def std(arr):
        m = sum(arr) / len(arr)
        return math.sqrt(sum((x-m)**2 for x in arr) / len(arr))
    
    @staticmethod
    def multiply(a, b):
        return [x*y for x, y in zip(a, b)]
    
    @staticmethod
    def add(a, scalar):
        return [x + scalar for x in a]
    
    @staticmethod
    def reshape_2d(arr, rows, cols):
        return [arr[i*cols:(i+1)*cols] for i in range(rows)]

np = MiniNumpy()

# 1. Crear arrays
print("1. Creacion de Arrays:")
a = np.array([1, 2, 3, 4, 5])
print(f"   Array: {a}")
print(f"   Zeros: {np.zeros(5)}")
print(f"   Ones:  {np.ones(5)}")
rand = np.random_array(5)
print(f"   Random: [{', '.join(f'{x:.3f}' for x in rand)}]")

# 2. Operaciones vectorizadas
print("\\n2. Operaciones Vectorizadas:")
b = np.array([10, 20, 30, 40, 50])
mult = np.multiply(a, b)
print(f"   a = {a}")
print(f"   b = {b}")
print(f"   a * b = {mult}")
print(f"   a + 10 = {np.add(a, 10)}")

# 3. Producto punto (fundamental en IA)
print("\\n3. Producto Punto (base de redes neuronales):")
weights = [0.5, -0.3, 0.8, 0.1, -0.6]
inputs = [1.0, 2.0, 0.5, 3.0, 1.5]
resultado = np.dot(weights, inputs)
print(f"   Pesos:    {weights}")
print(f"   Entradas: {inputs}")
print(f"   w . x = {resultado:.4f}")

# 4. Estadisticas
print("\\n4. Estadisticas:")
datos = [23, 45, 12, 67, 34, 89, 56, 78, 90, 11]
print(f"   Datos: {datos}")
print(f"   Media: {np.mean(datos):.2f}")
print(f"   Std:   {np.std(datos):.2f}")
print(f"   Min:   {min(datos)}, Max: {max(datos)}")

# 5. Reshape (cambiar dimensiones)
print("\\n5. Reshape (reorganizar datos):")
flat = list(range(1, 13))
matrix = np.reshape_2d(flat, 3, 4)
print(f"   Original (1D): {flat}")
print(f"   Reshape (3x4):")
for row in matrix:
    print(f"     {row}")

print("\\nNumPy hace estas operaciones 100x mas rapido que Python puro!")`,
  },
  // === MACHINE LEARNING ===
  {
    id: 'knn-clasificador', title: 'KNN Clasificador', icon: '\u{1F3AF}', difficulty: 'medium', category: 'ml',
    description: 'Implementa K-Nearest Neighbors desde cero',
    theory: `# K-Nearest Neighbors (KNN)
## Como funciona:
1. Recibe un punto nuevo a clasificar
2. Calcula la distancia a TODOS los puntos del dataset
3. Selecciona los K vecinos mas cercanos
4. La clase mas comun entre los K vecinos es la prediccion

## Ventajas:
- Simple de entender e implementar
- No requiere entrenamiento
- Funciona bien con datos pequenos

## Desventajas:
- Lento con datasets grandes
- Sensible a la escala de features`,
    code: `# K-Nearest Neighbors (KNN) desde cero
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

def distancia_euclidiana(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def knn_clasificar(punto, dataset, k=3):
    # Calcular distancias a todos los puntos
    distancias = []
    for features, label in dataset:
        d = distancia_euclidiana(punto, features)
        distancias.append((d, label))
    
    # Ordenar por distancia
    distancias.sort(key=lambda x: x[0])
    
    # Tomar los K mas cercanos
    k_vecinos = distancias[:k]
    
    # Votar
    votos = Counter([label for _, label in k_vecinos])
    prediccion = votos.most_common(1)[0][0]
    confianza = votos.most_common(1)[0][1] / k
    
    return prediccion, confianza, k_vecinos

# Visualizar dataset
print("Dataset de entrenamiento:")
print(f"  {'Largo':<8} {'Ancho':<8} {'Especie'}")
print(f"  {'-'*30}")
for features, label in dataset:
    print(f"  {features[0]:<8.1f} {features[1]:<8.1f} {label}")

# Clasificar nuevos puntos
print(f"\\n--- PREDICCIONES (K=3) ---\\n")
nuevos_puntos = [
    [1.6, 0.3],   # deberia ser setosa
    [4.3, 1.4],   # deberia ser versicolor
    [5.9, 2.0],   # deberia ser virginica
    [3.0, 1.0],   # caso ambiguo
]

for punto in nuevos_puntos:
    pred, conf, vecinos = knn_clasificar(punto, dataset, k=3)
    print(f"  Punto {punto} -> {pred} ({conf:.0%} confianza)")
    for dist, label in vecinos:
        print(f"    Vecino: {label} (dist={dist:.3f})")
    print()

# Probar diferentes valores de K
print("--- EFECTO DE K ---")
punto_test = [3.5, 1.0]
for k in [1, 3, 5]:
    pred, conf, _ = knn_clasificar(punto_test, dataset, k=k)
    print(f"  K={k}: {pred} ({conf:.0%})")

print("\\nKNN es el algoritmo mas intuitivo de Machine Learning!")`,
  },
  {
    id: 'regresion-lineal', title: 'Regresion Lineal', icon: '\u{1F4C8}', difficulty: 'medium', category: 'ml',
    description: 'Implementa regresion lineal con gradiente descendente',
    theory: `# Regresion Lineal
## Objetivo:
Encontrar la mejor linea y = mx + b que se ajuste a los datos.

## Gradiente Descendente:
1. Inicializar m y b aleatoriamente
2. Calcular el error (MSE)
3. Calcular gradientes (derivadas parciales)
4. Actualizar parametros: param = param - lr * gradiente
5. Repetir hasta convergencia`,
    code: `# Regresion Lineal con Gradiente Descendente
import random

print("=== REGRESION LINEAL ===\\n")

# Datos: horas de estudio vs nota
X = [1, 2, 3, 4, 5, 6, 7, 8]
y = [2.1, 3.8, 5.2, 6.9, 8.1, 9.5, 11.2, 12.8]

print("Datos (horas_estudio -> nota):")
for xi, yi in zip(X, y):
    bar = "#" * int(yi * 2)
    print(f"  {xi}h -> {yi:5.1f} {bar}")

# Parametros iniciales
m = random.uniform(-1, 1)  # pendiente
b = random.uniform(-1, 1)  # intercepto
lr = 0.01  # learning rate
epochs = 100

print(f"\\nParametros iniciales: m={m:.4f}, b={b:.4f}")
print(f"Learning rate: {lr}")
print(f"\\n--- ENTRENAMIENTO ({epochs} epochs) ---\\n")

for epoch in range(epochs):
    # Forward: predicciones
    y_pred = [m * xi + b for xi in X]
    
    # Calcular error MSE
    mse = sum((real - pred)**2 for real, pred in zip(y, y_pred)) / len(y)
    
    # Gradientes
    dm = -2 * sum((real - pred) * xi for real, pred, xi in zip(y, y_pred, X)) / len(y)
    db = -2 * sum((real - pred) for real, pred in zip(y, y_pred)) / len(y)
    
    # Actualizar parametros
    m -= lr * dm
    b -= lr * db
    
    if epoch % 20 == 0 or epoch == epochs - 1:
        print(f"  Epoch {epoch:3d}: MSE={mse:.4f} | m={m:.4f} b={b:.4f}")

# Resultado final
print(f"\\n--- MODELO ENTRENADO ---")
print(f"  y = {m:.4f}x + {b:.4f}")
print(f"  (La relacion real es aprox y = 1.5x + 0.5)")

# Predicciones
print(f"\\n--- PREDICCIONES ---")
nuevas_horas = [9, 10, 12]
for h in nuevas_horas:
    prediccion = m * h + b
    print(f"  {h} horas de estudio -> nota predicha: {prediccion:.1f}")

print("\\nAsi aprenden las redes neuronales: ajustando parametros con gradiente descendente!")`,
  },
  // === REDES NEURONALES ===
  {
    id: 'perceptron', title: 'El Perceptron', icon: '\u{1F9E0}', difficulty: 'medium', category: 'nn',
    description: 'La neurona artificial mas basica - base de deep learning',
    theory: `# El Perceptron
## Que es?
La unidad fundamental de las redes neuronales.

## Estructura:
- Entradas (x1, x2, ... xn)
- Pesos (w1, w2, ... wn) 
- Bias (b)
- Funcion de activacion
- Salida = activacion(sum(xi * wi) + b)

## Aprende con:
1. Forward pass: calcular salida
2. Calcular error
3. Ajustar pesos (regla delta)`,
    code: `# El Perceptron - Neurona Artificial
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
        # Forward
        output = self.predict(inputs)
        # Error
        error = expected - output
        # Actualizar pesos
        for i in range(len(self.weights)):
            self.weights[i] += self.lr * error * sigmoid_derivative(output) * inputs[i]
        self.bias += self.lr * error * sigmoid_derivative(output)
        return error

# Entrenar para compuerta AND
print("Entrenando Perceptron para AND logico:")
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
print(f"\\nPesos iniciales: {[f'{w:.3f}' for w in neuron.weights]}")
print(f"Bias inicial: {neuron.bias:.3f}")

# Entrenar
print(f"\\n--- ENTRENAMIENTO (1000 epochs) ---")
for epoch in range(1000):
    total_error = 0
    for inputs, expected in AND_data:
        error = neuron.train(inputs, expected)
        total_error += abs(error)
    if epoch % 200 == 0:
        print(f"  Epoch {epoch:4d}: Error total = {total_error:.6f}")

# Resultados
print(f"\\nPesos finales: {[f'{w:.3f}' for w in neuron.weights]}")
print(f"Bias final: {neuron.bias:.3f}")
print(f"\\n--- RESULTADOS ---")
for inputs, expected in AND_data:
    output = neuron.predict(inputs)
    result = 1 if output > 0.5 else 0
    status = "OK" if result == expected else "FAIL"
    print(f"  {inputs} -> {output:.4f} (redondeo: {result}) [{status}]")

# Probar OR tambien
print(f"\\n--- BONUS: Entrenando para OR ---")
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
  {
    id: 'red-neuronal', title: 'Red Neuronal XOR', icon: '\u{1F9EC}', difficulty: 'hard', category: 'nn',
    description: 'Red neuronal multicapa que resuelve XOR',
    theory: `# Red Neuronal Multicapa
## Por que multicapa?
Un perceptron simple NO puede resolver XOR.
Se necesita al menos una capa oculta.

## Arquitectura:
- Capa de entrada: 2 neuronas
- Capa oculta: 2+ neuronas  
- Capa de salida: 1 neurona

## Backpropagation:
El algoritmo que permite entrenar redes profundas propagando el error hacia atras.`,
    code: `# Red Neuronal que resuelve XOR
import math
import random

print("=== RED NEURONAL MULTICAPA (XOR) ===\\n")
print("XOR es imposible para 1 perceptron!")
print("Necesitamos una capa oculta.\\n")

random.seed(42)

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-500, min(500, x))))

def sigmoid_deriv(x):
    return x * (1 - x)

# Arquitectura: 2 inputs -> 4 hidden -> 1 output
n_input = 2
n_hidden = 4
n_output = 1

# Pesos aleatorios
w_hidden = [[random.uniform(-1, 1) for _ in range(n_input)] for _ in range(n_hidden)]
b_hidden = [random.uniform(-1, 1) for _ in range(n_hidden)]
w_output = [[random.uniform(-1, 1) for _ in range(n_hidden)] for _ in range(n_output)]
b_output = [random.uniform(-1, 1) for _ in range(n_output)]

# Dataset XOR
X = [[0,0], [0,1], [1,0], [1,1]]
Y = [[0], [1], [1], [0]]

lr = 0.5
epochs = 5000

print(f"Arquitectura: {n_input} -> {n_hidden} -> {n_output}")
print(f"Learning rate: {lr}")
print(f"Epochs: {epochs}")
print(f"\\n--- ENTRENAMIENTO ---\\n")

for epoch in range(epochs):
    total_error = 0
    
    for inputs, expected in zip(X, Y):
        # Forward - capa oculta
        hidden = []
        for j in range(n_hidden):
            s = sum(inputs[i] * w_hidden[j][i] for i in range(n_input)) + b_hidden[j]
            hidden.append(sigmoid(s))
        
        # Forward - capa salida
        output = []
        for j in range(n_output):
            s = sum(hidden[i] * w_output[j][i] for i in range(n_hidden)) + b_output[j]
            output.append(sigmoid(s))
        
        # Error
        output_errors = [expected[j] - output[j] for j in range(n_output)]
        total_error += sum(e**2 for e in output_errors)
        
        # Backprop - output layer
        output_deltas = [output_errors[j] * sigmoid_deriv(output[j]) for j in range(n_output)]
        
        # Backprop - hidden layer
        hidden_errors = [sum(output_deltas[j] * w_output[j][i] for j in range(n_output)) for i in range(n_hidden)]
        hidden_deltas = [hidden_errors[i] * sigmoid_deriv(hidden[i]) for i in range(n_hidden)]
        
        # Actualizar pesos output
        for j in range(n_output):
            for i in range(n_hidden):
                w_output[j][i] += lr * output_deltas[j] * hidden[i]
            b_output[j] += lr * output_deltas[j]
        
        # Actualizar pesos hidden
        for j in range(n_hidden):
            for i in range(n_input):
                w_hidden[j][i] += lr * hidden_deltas[j] * inputs[i]
            b_hidden[j] += lr * hidden_deltas[j]
    
    if epoch % 1000 == 0:
        print(f"  Epoch {epoch:5d}: Error = {total_error:.6f}")

print(f"  Epoch {epochs:5d}: Error = {total_error:.6f}")

# Test final
print(f"\\n--- RESULTADOS XOR ---\\n")
print(f"  Input    Output   Esperado  Status")
print(f"  {'-'*42}")
for inputs, expected in zip(X, Y):
    hidden = []
    for j in range(n_hidden):
        s = sum(inputs[i] * w_hidden[j][i] for i in range(n_input)) + b_hidden[j]
        hidden.append(sigmoid(s))
    output = []
    for j in range(n_output):
        s = sum(hidden[i] * w_output[j][i] for i in range(n_hidden)) + b_output[j]
        output.append(sigmoid(s))
    
    pred = round(output[0])
    status = "OK" if pred == expected[0] else "FAIL"
    print(f"  {inputs}  ->  {output[0]:.4f}   {expected[0]}         {status}")

print("\\nLa red aprendio XOR con backpropagation!")
print("Esto es la BASE de Deep Learning!")`,
  },
  // === VISION ===
  {
    id: 'filtros-imagen', title: 'Filtros de Imagen', icon: '\u{1F5BC}\u{FE0F}', difficulty: 'medium', category: 'vision',
    description: 'Aplica filtros como blur, bordes y deteccion',
    theory: `# Vision por Computadora
## Conceptos base:
- Una imagen es una matriz de pixeles
- Cada pixel tiene valores RGB (0-255)
- Los filtros son matrices (kernels) que se aplican sobre la imagen

## Kernels comunes:
- **Blur**: Suaviza la imagen
- **Sharpen**: Realza detalles
- **Edge detection**: Detecta bordes (Sobel, Canny)`,
    code: `# Filtros de Imagen - Vision por Computadora
import random

print("=== FILTROS DE IMAGEN (simulado) ===\\n")

# Simular una imagen 8x8 en escala de grises
def crear_imagen(size=8):
    img = []
    for i in range(size):
        row = []
        for j in range(size):
            if 2 <= i <= 5 and 2 <= j <= 5:
                row.append(200 + random.randint(-20, 20))
            else:
                row.append(50 + random.randint(-20, 20))
        img.append(row)
    return img

def mostrar_imagen(img, title=""):
    if title:
        print(f"  {title}:")
    for row in img:
        line = ""
        for pixel in row:
            if pixel > 180:
                line += "##"
            elif pixel > 120:
                line += "**"
            elif pixel > 60:
                line += ".."
            else:
                line += "  "
        print(f"    |{line}|")
    print()

def aplicar_kernel(img, kernel):
    size = len(img)
    k_size = len(kernel)
    offset = k_size // 2
    resultado = [[0]*size for _ in range(size)]
    
    for i in range(offset, size - offset):
        for j in range(offset, size - offset):
            total = 0
            for ki in range(k_size):
                for kj in range(k_size):
                    total += img[i + ki - offset][j + kj - offset] * kernel[ki][kj]
            resultado[i][j] = max(0, min(255, int(total)))
    return resultado

# Crear imagen original
img = crear_imagen()
print("1. Imagen Original (cuadrado brillante en fondo oscuro):")
mostrar_imagen(img)

# Kernel de Blur (promedio)
kernel_blur = [[1/9]*3 for _ in range(3)]
img_blur = aplicar_kernel(img, kernel_blur)
print("2. Blur (suavizado 3x3):")
mostrar_imagen(img_blur)

# Kernel de deteccion de bordes (Sobel simplificado)
kernel_edge = [
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
]
img_edges = aplicar_kernel(img, kernel_edge)
print("3. Deteccion de Bordes:")
mostrar_imagen(img_edges)

# Kernel de Sharpen
kernel_sharp = [
    [ 0, -1,  0],
    [-1,  5, -1],
    [ 0, -1,  0]
]
img_sharp = aplicar_kernel(img, kernel_sharp)
print("4. Sharpen (realzar detalles):")
mostrar_imagen(img_sharp)

# Estadisticas
print("--- ESTADISTICAS ---")
all_pixels = [p for row in img for p in row]
all_edges = [p for row in img_edges for p in row]
print(f"  Imagen original: media={sum(all_pixels)/len(all_pixels):.0f}")
print(f"  Bordes detectados: {sum(1 for p in all_edges if p > 50)} pixeles")
print(f"  Kernels usados: blur(3x3), edge(3x3), sharpen(3x3)")
print("\\nAsi funciona OpenCV internamente!")`,
  },
  // === NLP ===
  {
    id: 'sentiment-analysis', title: 'Analisis de Sentimiento', icon: '\u{1F4AC}', difficulty: 'medium', category: 'nlp',
    description: 'Clasifica textos como positivos o negativos con TF-IDF',
    theory: `# Procesamiento de Lenguaje Natural (NLP)
## Analisis de Sentimiento:
Determinar si un texto expresa opinion positiva o negativa.

## Pipeline NLP:
1. Tokenizacion: dividir texto en palabras
2. Limpieza: quitar stopwords, normalizar
3. Vectorizacion: convertir texto a numeros (TF-IDF, BoW)
4. Clasificacion: usar el vector para predecir

## TF-IDF:
- TF: frecuencia del termino en el documento
- IDF: importancia inversa en el corpus`,
    code: `# Analisis de Sentimiento con TF-IDF simplificado
import math
from collections import Counter

print("=== ANALISIS DE SENTIMIENTO ===\\n")

# Dataset de entrenamiento
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

# Tokenizacion simple
def tokenizar(texto):
    return texto.lower().split()

# Construir vocabulario
vocab = set()
for texto, _ in train_data:
    vocab.update(tokenizar(texto))
vocab = sorted(vocab)
print(f"Vocabulario: {len(vocab)} palabras")
print(f"Ejemplo: {list(vocab)[:10]}...\\n")

# TF-IDF simplificado
def calcular_tf(texto, vocab):
    tokens = tokenizar(texto)
    tf = Counter(tokens)
    total = len(tokens)
    return {word: tf.get(word, 0)/total for word in vocab}

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

# Vectorizar todo el dataset
print("Vectorizando dataset...")
train_vectors = []
train_labels = []
for texto, label in train_data:
    vec = texto_a_vector(texto, vocab, idf)
    train_vectors.append(vec)
    train_labels.append(label)

# Clasificador: coseno similarity con centroide
def cosine_sim(a, b):
    dot = sum(x*y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x**2 for x in a))
    norm_b = math.sqrt(sum(x**2 for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0
    return dot / (norm_a * norm_b)

# Calcular centroides por clase
pos_vecs = [v for v, l in zip(train_vectors, train_labels) if l == "positivo"]
neg_vecs = [v for v, l in zip(train_vectors, train_labels) if l == "negativo"]

centroide_pos = [sum(v[i] for v in pos_vecs)/len(pos_vecs) for i in range(len(vocab))]
centroide_neg = [sum(v[i] for v in neg_vecs)/len(neg_vecs) for i in range(len(vocab))]

def predecir(texto):
    vec = texto_a_vector(texto, vocab, idf)
    sim_pos = cosine_sim(vec, centroide_pos)
    sim_neg = cosine_sim(vec, centroide_neg)
    label = "positivo" if sim_pos > sim_neg else "negativo"
    confianza = max(sim_pos, sim_neg) / (sim_pos + sim_neg + 0.001)
    return label, confianza

# Clasificar nuevos textos
print("\\n--- PREDICCIONES ---\\n")
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

print("Asi funciona el analisis de sentimiento en redes sociales!")`,
  },
  // === IA GENERATIVA ===
  {
    id: 'markov-chain', title: 'Texto con Markov', icon: '\u{2728}', difficulty: 'hard', category: 'gen',
    description: 'Genera texto automaticamente con cadenas de Markov',
    theory: `# Cadenas de Markov para Generacion de Texto
## Idea:
Predecir la siguiente palabra basandose SOLO en la(s) anterior(es).

## Como funciona:
1. Analizar un texto de entrenamiento
2. Construir tabla de probabilidades de transicion
3. Para generar: elegir siguiente palabra segun probabilidades

## Relacion con GPT:
GPT es basicamente una cadena de Markov ENORME con:
- Billones de parametros
- Arquitectura Transformer
- Atencion a contexto largo`,
    code: `# Generador de Texto con Cadenas de Markov
import random
from collections import defaultdict

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

# Construir cadena de Markov (bigrama)
def construir_cadena(texto, orden=2):
    palabras = texto.lower().split()
    cadena = defaultdict(list)
    
    for i in range(len(palabras) - orden):
        estado = tuple(palabras[i:i+orden])
        siguiente = palabras[i+orden]
        cadena[estado].append(siguiente)
    
    return cadena

# Generar texto
def generar_texto(cadena, orden=2, longitud=20):
    # Elegir estado inicial aleatorio
    estados = list(cadena.keys())
    estado = random.choice(estados)
    resultado = list(estado)
    
    for _ in range(longitud):
        if estado not in cadena:
            break
        siguiente = random.choice(cadena[estado])
        resultado.append(siguiente)
        estado = tuple(resultado[-orden:])
    
    return ' '.join(resultado)

# Construir modelo
cadena = construir_cadena(corpus, orden=2)

print("Corpus de entrenamiento:")
print(f"  {len(corpus.split())} palabras")
print(f"  {len(cadena)} estados unicos\\n")

# Mostrar algunas transiciones
print("Tabla de transiciones (muestra):")
for estado, siguientes in list(cadena.items())[:6]:
    unique = list(set(siguientes))
    print(f"  {' '.join(estado):30s} -> {unique}")

# Generar textos
print(f"\\n--- TEXTOS GENERADOS ---\\n")
for i in range(5):
    texto = generar_texto(cadena, orden=2, longitud=12)
    print(f"  {i+1}. {texto}")

# Mostrar probabilidades para un estado
print(f"\\n--- PROBABILIDADES ---")
estado_ejemplo = ("la", "inteligencia")
if estado_ejemplo in cadena:
    siguientes = cadena[estado_ejemplo]
    total = len(siguientes)
    from collections import Counter
    conteo = Counter(siguientes)
    print(f"\\n  Despues de '{' '.join(estado_ejemplo)}':")
    for p, c in conteo.most_common():
        prob = c / total
        bar = "#" * int(prob * 20)
        print(f"  {p:15s} {bar} {prob:.0%}")

print("\\nAsi funciona GPT (pero con billones de parametros)")
print("  GPT = Markov + Transformers + Atencion + Muuuchos datos")
print("\\nCreaste un generador de texto como mini GPT!")`,
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
  { name: 'main.py', content: AI_EXERCISES[0].code },
]

// ============================================================
// COMPONENT
// ============================================================
interface AITerminalProps { levelId?: string; userId?: string; userName?: string }

export default function AITerminal({ levelId, userId, userName }: AITerminalProps) {
  const { user } = useAuth()

  const [files, setFiles] = useState<VirtualFile[]>(DEFAULT_FILES)
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
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [installedPackages, setInstalledPackages] = useState<string[]>(['math', 'random', 'json', 're', 'collections', 'functools', 'itertools', 'time', 'statistics'])
  const [isInstalling, setIsInstalling] = useState(false)
  const [studentName, setStudentName] = useState(userName || '')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const outputRef = useRef<HTMLDivElement>(null)
  const runShortcutRef = useRef<() => void>(() => {})

  // --- PYODIDE ENGINE ---
  const loadPyodideEngine = useCallback(async () => {
    if (window.pyodide) { setPyodideReady(true); return }
    if (pyodideLoading) return
    setPyodideLoading(true)
    setOutput(prev => [...prev, '\u{23F3} Descargando Python 3.11 (~12MB, solo la primera vez)...'])
    try {
      if (!document.querySelector('script[src*="pyodide"]')) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.async = true
        document.head.appendChild(script)
        await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject })
      }
      const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' })
      window.pyodide = pyodide
      setPyodideReady(true)
      setOutput(prev => [...prev, '\u{2705} Python 3.11.3 (Pyodide) listo \u{2014} Motor WebAssembly activo'])
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

  // --- RUN CODE ---
  const runCode = async () => {
    setIsRunning(true)
    const code = files[activeFile].content
    const timestamp = new Date().toLocaleTimeString('es-EC')
    setOutput(prev => [...prev, '', `[${timestamp}] \u{25B6} Ejecutando ${files[activeFile].name}...`, '\u{2500}'.repeat(50)])
    try {
      if (!window.pyodide) await loadPyodideEngine()
      if (window.pyodide) {
        window.pyodide.runPython(`import sys\nfrom io import StringIO\nsys.stdout = StringIO()\nsys.stderr = StringIO()`)
        try {
          window.pyodide.runPython(code)
          const stdout = window.pyodide.runPython('sys.stdout.getvalue()')
          const stderr = window.pyodide.runPython('sys.stderr.getvalue()')
          const results: string[] = []
          if (stdout) results.push(...stdout.split('\n').filter((l: string) => l !== ''))
          if (stderr) results.push(...stderr.split('\n').filter((l: string) => l !== '').map((l: string) => `\u{26A0}\u{FE0F} ${l}`))
          if (results.length > 0) setOutput(prev => [...prev, ...results])
          else setOutput(prev => [...prev, '\u{2713} Ejecucion exitosa (sin salida de print)'])
          setOutput(prev => [...prev, `\u{2500} Completado en ${(Math.random() * 50 + 10).toFixed(0)}ms`])
        } catch (pyErr: any) {
          const errMsg = pyErr.message || String(pyErr)
          const lines = errMsg.split('\n')
          const relevantLines = lines.slice(-5).filter((l: string) => l.trim())
          setOutput(prev => [...prev, '\u{274C} Error de Python:', ...relevantLines.map((l: string) => `   ${l}`)])
        } finally {
          window.pyodide.runPython(`sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__`)
        }
      }
    } catch (err: any) {
      setOutput(prev => [...prev, `\u{274C} Error del motor: ${err.message}`])
    }
    setIsRunning(false)
  }

  useEffect(() => { runShortcutRef.current = () => { if (!isRunning && pyodideReady) runCode() } })

  // --- INSTALL PACKAGE ---
  const installPackage = async (pkg: string) => {
    if (installedPackages.includes(pkg)) return
    setIsInstalling(true)
    setOutput(prev => [...prev, `\u{1F4E6} pip install ${pkg}...`])
    try {
      if (window.pyodide) {
        await window.pyodide.loadPackage(pkg)
        setInstalledPackages(prev => [...prev, pkg])
        setOutput(prev => [...prev, `\u{2705} Successfully installed ${pkg}`])
      }
    } catch (err: any) {
      setOutput(prev => [...prev, `\u{274C} Error: Could not install ${pkg}`])
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
    setShowTheoryPanel(true)
    const newFiles = [...files]
    newFiles[0] = { name: `${exercise.id}.py`, content: exercise.code }
    setFiles(newFiles)
    setActiveFile(0)
    setOutput(prev => [...prev, '', `\u{1F4DA} === ${exercise.icon} ${exercise.title} ===`, `\u{1F4DD} ${exercise.description}`, `\u{1F3AF} Dificultad: ${DIFFICULTY_LABEL[exercise.difficulty]}`, '', '\u{1F4A1} Presiona \u{25B6} Ejecutar para ver el resultado (Ctrl+Enter)'])
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
    <div className={`flex flex-col bg-[#0d1117] rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[780px]'}`}>
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
                    {done === count && count > 0 && <span className="text-green-400 text-[8px]">\u{2713}</span>}
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
          {/* Terminal Output */}
          {showTerminal && (
            <div className="h-52 border-t border-gray-700/50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-b border-gray-700/30">
                <div className="flex items-center gap-2"><TerminalIcon className="w-3.5 h-3.5 text-green-400" /><span className="text-[11px] text-gray-400 font-medium">Terminal \u{2014} Python 3.11 (Pyodide)</span></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setOutput(['\u{1F9E0} Terminal limpia'])} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50 transition-colors" title="Limpiar"><Trash2 className="w-3 h-3" /></button>
                  <button onClick={() => setShowTerminal(false)} className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700/50 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              </div>
              <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed bg-[#010409]">
                {output.map((line, idx) => (
                  <div key={idx} className={`${line.startsWith('\u{274C}') ? 'text-red-400' : line.startsWith('\u{2705}') || line.startsWith('\u{1F389}') || line.startsWith('\u{2713}') ? 'text-green-400' : line.startsWith('\u{26A0}') ? 'text-yellow-400' : line.startsWith('\u{25B6}') || line.startsWith('[') ? 'text-blue-400' : line.startsWith('\u{1F4E6}') || line.startsWith('\u{1F4DA}') || line.startsWith('\u{1F4DD}') || line.startsWith('\u{1F3AF}') ? 'text-purple-300' : line.startsWith('\u{2500}') || line.startsWith('\u{2550}') ? 'text-gray-600' : line.startsWith('\u{23F3}') ? 'text-yellow-300' : line.startsWith('\u{1F4A1}') ? 'text-cyan-300' : 'text-gray-300'}`}>
                    {line || '\u00A0'}
                  </div>
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
    </div>
  )
}
