/**
 * Completa los huecos del currículo de Python detectados en agosto 2026:
 *  - 'funciones' tenía una sola lección (def básico) — le faltaba *args/**kwargs,
 *    lambda/map/filter/reduce, recursión y scope/decoradores.
 *  - 'archivos-errores' no tenía NINGUNA lección (aparecía como "Próximamente").
 * Sigue el mismo patrón/esquema que scripts/seed-empty-academy-modules.js.
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
let supabaseUrl = '', supabaseKey = ''
envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim()
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=').slice(1).join('=').trim()
})

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const LESSONS = [
  // ─────────────────────────────────────────────────────────
  // FUNCIONES (ya existía 'definir-funciones' en sort_order 1)
  // ─────────────────────────────────────────────────────────
  {
    moduleSlug: 'funciones',
    slug: 'args-kwargs',
    title: '*args y **kwargs',
    description: 'Funciones que aceptan una cantidad variable de argumentos',
    difficulty: 'medium',
    estimated_minutes: 15,
    sort_order: 2,
    theory: `# *args y **kwargs

## El problema
¿Qué pasa si no sabes cuántos argumentos va a recibir tu función? Por ejemplo, una función \`sumar\` que sume 2, 3 o 10 números.

## \`*args\` — argumentos posicionales variables
Agrupa cualquier cantidad de argumentos posicionales en una **tupla**.
\`\`\`python
def sumar(*numeros):
    return sum(numeros)

sumar(1, 2)        # numeros = (1, 2)
sumar(1, 2, 3, 4)  # numeros = (1, 2, 3, 4)
\`\`\`

## \`**kwargs\` — argumentos con nombre variables
Agrupa cualquier cantidad de argumentos \`clave=valor\` en un **diccionario**.
\`\`\`python
def perfil(**datos):
    for clave, valor in datos.items():
        print(f"{clave}: {valor}")

perfil(nombre="Ana", edad=25, ciudad="Quito")
\`\`\`

## Combinando todo
El orden siempre es: \`posicionales, *args, keyword=valor, **kwargs\`
\`\`\`python
def resumen(titulo, *items, separador="-", **extra):
    print(titulo)
    print(separador * len(titulo))
    for i in items:
        print(f"  {i}")
    print(extra)
\`\`\`

## Desempaquetar (el operador inverso)
También puedes usar \`*\` y \`**\` para **desempaquetar** al llamar una función:
\`\`\`python
valores = [1, 2, 3]
sumar(*valores)        # equivale a sumar(1, 2, 3)

datos = {"nombre": "Luis", "edad": 30}
perfil(**datos)         # equivale a perfil(nombre="Luis", edad=30)
\`\`\``,
    example: {
      title: 'Sumar cualquier cantidad de números',
      explanation: '*args convierte todos los argumentos posicionales en una tupla dentro de la función',
      code: `def sumar(*numeros):
    print(f"Recibidos: {numeros} (tipo {type(numeros).__name__})")
    return sum(numeros)

print("Suma de 2 números:", sumar(3, 4))
print("Suma de 5 números:", sumar(1, 2, 3, 4, 5))
print("Suma de 0 números:", sumar())

def crear_perfil(nombre, **datos):
    print(f"\\n👤 Perfil de {nombre}:")
    for clave, valor in datos.items():
        print(f"  {clave}: {valor}")

crear_perfil("Ana", edad=25, ciudad="Quito", lenguaje_favorito="Python")

# Desempaquetar una lista/diccionario al llamar
valores = [10, 20, 30]
print("\\nDesempaquetando lista:", sumar(*valores))

datos_luis = {"edad": 30, "profesion": "ingeniero"}
crear_perfil("Luis", **datos_luis)`
    },
    challenge: {
      title: 'Calculadora de estadísticas',
      description: 'Crea una función estadisticas(*numeros) que devuelva un diccionario con "suma", "promedio", "maximo" y "minimo" de los números recibidos.',
      starter_code: `def estadisticas(*numeros):
    # Calcula suma, promedio, maximo y minimo
    resultado = {
        "suma": ,
        "promedio": ,
        "maximo": ,
        "minimo":
    }
    return resultado

r = estadisticas(4, 8, 15, 16, 23, 42)
print(f"Suma: {r['suma']}")
print(f"Promedio: {r['promedio']:.2f}")
print(f"Maximo: {r['maximo']}")
print(f"Minimo: {r['minimo']}")`,
      expected_output: 'Suma: 108\nMaximo: 42\nMinimo: 4',
      hints: [
        'sum(numeros) suma todos los elementos de la tupla',
        'sum(numeros) / len(numeros) da el promedio',
        'max(numeros) y min(numeros) dan el máximo y mínimo'
      ]
    }
  },
  {
    moduleSlug: 'funciones',
    slug: 'lambda-orden-superior',
    title: 'Lambda y Funciones de Orden Superior',
    description: 'Funciones anónimas y map, filter, reduce, sorted con key',
    difficulty: 'medium',
    estimated_minutes: 15,
    sort_order: 3,
    theory: `# Funciones Lambda y de Orden Superior

## ¿Qué es una función lambda?
Una función anónima de una sola línea, útil cuando necesitas una función pequeña y rápida sin darle nombre con \`def\`.
\`\`\`python
cuadrado = lambda x: x ** 2
cuadrado(5)   # 25

# Equivale a:
def cuadrado(x):
    return x ** 2
\`\`\`

## Funciones de orden superior
Son funciones que reciben **otras funciones** como argumento.

### \`map(funcion, iterable)\`
Aplica una función a cada elemento y devuelve un iterador con los resultados.
\`\`\`python
numeros = [1, 2, 3, 4]
dobles = list(map(lambda x: x * 2, numeros))   # [2, 4, 6, 8]
\`\`\`

### \`filter(funcion, iterable)\`
Deja pasar solo los elementos donde la función devuelve \`True\`.
\`\`\`python
pares = list(filter(lambda x: x % 2 == 0, numeros))   # [2, 4]
\`\`\`

### \`functools.reduce(funcion, iterable)\`
Combina todos los elementos en un solo valor, acumulando de a dos.
\`\`\`python
from functools import reduce
total = reduce(lambda a, b: a + b, numeros)   # 10
\`\`\`

### \`sorted(iterable, key=funcion)\`
Ordena usando el resultado de \`key\` como criterio.
\`\`\`python
palabras = ["banana", "kiwi", "manzana"]
sorted(palabras, key=len)   # ordenadas por longitud
\`\`\`

## ¿Lambda o list comprehension?
En Python, casi siempre una **list comprehension** es más legible que \`map\`/\`filter\`:
\`\`\`python
dobles = [x * 2 for x in numeros]           # preferido
pares  = [x for x in numeros if x % 2 == 0]  # preferido
\`\`\`
Pero \`sorted(..., key=...)\` con lambda sigue siendo muy común y útil.`,
    example: {
      title: 'map, filter, reduce y sorted con key',
      explanation: 'Las cuatro herramientas funcionales más usadas en Python, todas con lambda',
      code: `from functools import reduce

numeros = [5, 12, 8, 1, 19, 3, 7]

dobles = list(map(lambda x: x * 2, numeros))
print(f"Original: {numeros}")
print(f"Dobles:   {dobles}")

pares = list(filter(lambda x: x % 2 == 0, numeros))
print(f"Pares:    {pares}")

total = reduce(lambda a, b: a + b, numeros)
maximo = reduce(lambda a, b: a if a > b else b, numeros)
print(f"Suma (reduce):    {total}")
print(f"Máximo (reduce):  {maximo}")

# sorted con key
estudiantes = [
    {"nombre": "Ana", "nota": 85},
    {"nombre": "Luis", "nota": 92},
    {"nombre": "Marta", "nota": 78},
]
por_nota = sorted(estudiantes, key=lambda e: e["nota"], reverse=True)
print("\\n🏆 Ranking por nota:")
for i, e in enumerate(por_nota, 1):
    print(f"  {i}. {e['nombre']} - {e['nota']}")

# Equivalente con list comprehension (más pythonico)
dobles_comp = [x * 2 for x in numeros]
pares_comp = [x for x in numeros if x % 2 == 0]
print(f"\\nCon comprehension -> Dobles: {dobles_comp}, Pares: {pares_comp}")`
    },
    challenge: {
      title: 'Filtrar y ordenar productos',
      description: 'Dada una lista de productos (dict con "nombre" y "precio"), usa filter para quedarte solo con los que cuestan menos de 50, y sorted para ordenarlos de más barato a más caro.',
      starter_code: `productos = [
    {"nombre": "Mouse", "precio": 25},
    {"nombre": "Teclado", "precio": 60},
    {"nombre": "Monitor", "precio": 180},
    {"nombre": "Cable USB", "precio": 8},
    {"nombre": "Mousepad", "precio": 12},
]

# 1. Filtra los que cuestan menos de 50
baratos = list(filter(lambda p: , productos))

# 2. Ordénalos por precio (de menor a mayor)
baratos_ordenados = sorted(baratos, key=lambda p: )

for p in baratos_ordenados:
    print(f"{p['nombre']}: \${p['precio']}")`,
      expected_output: 'Cable USB: $8\nMousepad: $12\nMouse: $25',
      hints: [
        'filter(lambda p: p["precio"] < 50, productos)',
        'sorted(..., key=lambda p: p["precio"])',
        'No olvides envolver filter() en list() para poder iterarlo más de una vez'
      ]
    }
  },
  {
    moduleSlug: 'funciones',
    slug: 'recursion',
    title: 'Recursión',
    description: 'Funciones que se llaman a sí mismas: caso base y caso recursivo',
    difficulty: 'medium',
    estimated_minutes: 18,
    sort_order: 4,
    theory: `# Recursión

## ¿Qué es la recursión?
Una función **recursiva** es una función que se llama a sí misma para resolver un problema dividiéndolo en subproblemas más pequeños del mismo tipo.

## Las dos partes obligatorias
1. **Caso base**: la condición que detiene la recursión (sin esto, la función nunca termina).
2. **Caso recursivo**: la función se llama a sí misma con un problema más pequeño.

\`\`\`python
def factorial(n):
    if n <= 1:        # caso base
        return 1
    return n * factorial(n - 1)   # caso recursivo
\`\`\`

## Cómo pensarlo
Para \`factorial(4)\`:
\`\`\`
factorial(4) = 4 * factorial(3)
             = 4 * (3 * factorial(2))
             = 4 * (3 * (2 * factorial(1)))
             = 4 * (3 * (2 * 1))
             = 24
\`\`\`
Cada llamada espera el resultado de la siguiente — se van "apilando" hasta llegar al caso base, y luego se resuelven de vuelta hacia arriba.

## Cuidado con la recursión infinita
Si el caso base nunca se cumple, Python lanza \`RecursionError: maximum recursion depth exceeded\`.

## Fibonacci: recursión simple vs memoización
La recursión "ingenua" de Fibonacci recalcula los mismos valores muchas veces (es lenta). Guardando resultados ya calculados (**memoización**) se vuelve mucho más rápida.
\`\`\`python
def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
\`\`\`

## ¿Recursión o bucle?
Casi todo lo recursivo se puede escribir con un bucle \`while\`/\`for\`, y suele ser más eficiente en Python (que no optimiza la "tail recursion"). Usa recursión cuando el problema es naturalmente recursivo (árboles, backtracking, divide y vencerás).`,
    example: {
      title: 'Factorial, suma recursiva y Fibonacci con memoización',
      explanation: 'Tres funciones recursivas clásicas, incluyendo el conteo de llamadas para ver cuánto ayuda la memoización',
      code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("Factoriales:")
for i in range(1, 7):
    print(f"  {i}! = {factorial(i)}")

def suma_lista(lista):
    if not lista:            # caso base: lista vacía
        return 0
    return lista[0] + suma_lista(lista[1:])

print(f"\\nSuma recursiva de [1,2,3,4,5]: {suma_lista([1, 2, 3, 4, 5])}")

# Fibonacci sin memoización (cuenta llamadas)
llamadas_simple = 0
def fib_simple(n):
    global llamadas_simple
    llamadas_simple += 1
    if n <= 1:
        return n
    return fib_simple(n - 1) + fib_simple(n - 2)

# Fibonacci con memoización
llamadas_memo = 0
def fib_memo(n, memo={}):
    global llamadas_memo
    llamadas_memo += 1
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

n = 20
print(f"\\nFibonacci({n}) simple: {fib_simple(n)}  -> {llamadas_simple} llamadas")
print(f"Fibonacci({n}) memo:   {fib_memo(n)}  -> {llamadas_memo} llamadas")`
    },
    challenge: {
      title: 'Suma de dígitos y potencia recursivas',
      description: 'Implementa suma_digitos(n) que sume los dígitos de un número usando recursión (ej: 1234 -> 1+2+3+4=10), y potencia(base, exp) que calcule base**exp de forma recursiva.',
      starter_code: `def suma_digitos(n):
    if n < 10:
        return n
    return

def potencia(base, exp):
    if exp == 0:
        return 1
    return

print(f"suma_digitos(1234) = {suma_digitos(1234)}")
print(f"potencia(2, 10) = {potencia(2, 10)}")`,
      expected_output: 'suma_digitos(1234) = 10\npotencia(2, 10) = 1024',
      hints: [
        'suma_digitos: el caso base es n < 10 (un solo dígito)',
        'El último dígito es n % 10, el resto es n // 10',
        'return n % 10 + suma_digitos(n // 10)',
        'potencia: return base * potencia(base, exp - 1)'
      ]
    }
  },
  {
    moduleSlug: 'funciones',
    slug: 'scope-decoradores',
    title: 'Scope, Closures y Decoradores Básicos',
    description: 'Alcance de variables, funciones anidadas y tu primer decorador',
    difficulty: 'hard',
    estimated_minutes: 20,
    sort_order: 5,
    theory: `# Scope, Closures y Decoradores

## Scope (alcance) de variables
Una variable definida **dentro** de una función es **local**: solo existe ahí.
\`\`\`python
def f():
    x = 10   # local a f
    print(x)

f()
print(x)   # ❌ NameError: x no existe fuera de f
\`\`\`

Una variable definida fuera de cualquier función es **global**, y se puede leer (pero no reasignar) desde adentro de una función sin usar \`global\`:
\`\`\`python
contador = 0

def incrementar():
    global contador   # sin esto, "contador += 1" daría error
    contador += 1
\`\`\`

## Funciones anidadas y closures
Una función definida dentro de otra puede "recordar" las variables de la función exterior, incluso después de que esta termine. Eso es un **closure**.
\`\`\`python
def crear_multiplicador(factor):
    def multiplicar(x):
        return x * factor   # "recuerda" factor
    return multiplicar

duplicar = crear_multiplicador(2)
triplicar = crear_multiplicador(3)
duplicar(5)    # 10
triplicar(5)   # 15
\`\`\`

## Decoradores
Un decorador es una función que **envuelve** a otra función para agregarle comportamiento sin modificar su código.
\`\`\`python
def mi_decorador(func):
    def envoltura(*args, **kwargs):
        print(f"Llamando a {func.__name__}...")
        resultado = func(*args, **kwargs)
        print(f"{func.__name__} terminó")
        return resultado
    return envoltura

@mi_decorador
def saludar(nombre):
    print(f"Hola, {nombre}")

saludar("Ana")
# Llamando a saludar...
# Hola, Ana
# saludar terminó
\`\`\`
\`@mi_decorador\` encima de \`def saludar\` equivale a escribir \`saludar = mi_decorador(saludar)\`.

## Un decorador útil de verdad: medir tiempo
\`\`\`python
import time

def medir_tiempo(func):
    def envoltura(*args, **kwargs):
        inicio = time.time()
        resultado = func(*args, **kwargs)
        print(f"⏱️ {func.__name__} tardó {time.time()-inicio:.4f}s")
        return resultado
    return envoltura
\`\`\``,
    example: {
      title: 'Closures y un decorador de logging',
      explanation: 'Una fábrica de funciones (closure) y un decorador que registra cada llamada',
      code: `def crear_multiplicador(factor):
    def multiplicar(x):
        return x * factor
    return multiplicar

duplicar = crear_multiplicador(2)
triplicar = crear_multiplicador(3)
print(f"duplicar(5) = {duplicar(5)}")
print(f"triplicar(5) = {triplicar(5)}")
print(f"duplicar(100) = {duplicar(100)}")

# Decorador que cuenta cuántas veces se llamó una función
def contar_llamadas(func):
    contador = {"veces": 0}
    def envoltura(*args, **kwargs):
        contador["veces"] += 1
        print(f"📞 Llamada #{contador['veces']} a {func.__name__}")
        return func(*args, **kwargs)
    return envoltura

@contar_llamadas
def saludar(nombre):
    return f"Hola, {nombre}!"

print(saludar("Ana"))
print(saludar("Luis"))
print(saludar("Marta"))

# Decorador que valida argumentos
def solo_positivos(func):
    def envoltura(n):
        if n < 0:
            print(f"⚠️ {func.__name__} recibió un número negativo, se ignora")
            return None
        return func(n)
    return envoltura

@solo_positivos
def raiz_cuadrada(n):
    return n ** 0.5

print(f"\\nraiz_cuadrada(16) = {raiz_cuadrada(16)}")
print(f"raiz_cuadrada(-4) = {raiz_cuadrada(-4)}")`
    },
    challenge: {
      title: 'Decorador de reintentos',
      description: 'Completa el decorador reintentar(func) que ejecuta la función, y si lanza una excepción, la vuelve a intentar hasta 3 veces antes de fallar definitivamente.',
      starter_code: `def reintentar(func):
    def envoltura(*args, **kwargs):
        intentos = 0
        while intentos < 3:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                intentos += 1
                print(f"Intento {intentos} falló: {e}")
        print("Se agotaron los intentos")
    return envoltura

contador_fallos = {"n": 0}

@reintentar
def operacion_inestable():
    contador_fallos["n"] += 1
    if contador_fallos["n"] < 3:
        raise ValueError("fallo simulado")
    return "¡Éxito!"

resultado = operacion_inestable()
print(resultado)`,
      expected_output: '¡Éxito!',
      hints: [
        'El try/except ya está armado, revisa que estés incrementando "intentos" en el lugar correcto',
        'La función de prueba falla las primeras 2 veces y funciona a la 3ra',
        'Solo necesitas completar la lógica que ya está casi lista — ejecútala primero para ver qué falla'
      ]
    }
  },

  // ─────────────────────────────────────────────────────────
  // ARCHIVOS Y MANEJO DE ERRORES (módulo vacío -> 0 lecciones)
  // ─────────────────────────────────────────────────────────
  {
    moduleSlug: 'archivos-errores',
    slug: 'excepciones',
    title: 'Manejo de Excepciones (try/except)',
    description: 'Atrapa errores en tiempo de ejecución sin que tu programa se caiga',
    difficulty: 'medium',
    estimated_minutes: 18,
    sort_order: 1,
    theory: `# Manejo de Excepciones

## ¿Qué es una excepción?
Es un error que ocurre **mientras el programa se ejecuta** (a diferencia de un error de sintaxis, que Python detecta antes de correr nada). Si no se maneja, detiene el programa.
\`\`\`python
10 / 0          # ZeroDivisionError
int("hola")     # ValueError
lista[99]       # IndexError
diccionario["x"] # KeyError
\`\`\`

## try / except
\`\`\`python
try:
    resultado = 10 / 0
except ZeroDivisionError:
    print("No se puede dividir entre cero")
\`\`\`

## Atrapar varios tipos de error
\`\`\`python
try:
    numero = int(input("Número: "))
    resultado = 100 / numero
except ValueError:
    print("Eso no es un número válido")
except ZeroDivisionError:
    print("No puedes dividir entre cero")
except Exception as e:
    print(f"Error inesperado: {e}")
\`\`\`
**Importante**: Python revisa los \`except\` en orden y ejecuta el primero que coincida — por eso los más específicos van primero y \`Exception\` (el más general) al final.

## else y finally
\`\`\`python
try:
    numero = int("42")
except ValueError:
    print("Error")
else:
    print("Se ejecuta SOLO si no hubo excepción")
finally:
    print("Se ejecuta SIEMPRE, haya error o no (para limpieza)")
\`\`\`

## Lanzar tus propias excepciones: raise
\`\`\`python
def retirar(saldo, monto):
    if monto > saldo:
        raise ValueError("Fondos insuficientes")
    return saldo - monto
\`\`\`

## Buenas prácticas
- Nunca uses \`except:\` a secas (atrapa TODO, incluso errores de programación que deberías ver). Usa \`except Exception:\` como máximo.
- Atrapa solo las excepciones que realmente sabes manejar.
- Usa mensajes de error claros en \`raise\`.`,
    example: {
      title: 'Validación robusta con try/except/else/finally',
      explanation: 'Una función que valida entrada de usuario, distinguiendo cada tipo de error posible',
      code: `def dividir_seguro(a, b):
    try:
        resultado = a / b
    except ZeroDivisionError:
        print(f"  ❌ No se puede dividir {a} entre 0")
        return None
    except TypeError:
        print(f"  ❌ Los valores deben ser números")
        return None
    else:
        print(f"  ✅ {a} / {b} = {resultado}")
        return resultado
    finally:
        print(f"  (intento de división {a} / {b} procesado)")

print("Pruebas de división segura:")
dividir_seguro(10, 2)
dividir_seguro(5, 0)
dividir_seguro(10, "dos")

# raise: lanzar tu propia excepción
def retirar(saldo, monto):
    if monto <= 0:
        raise ValueError("El monto debe ser positivo")
    if monto > saldo:
        raise ValueError(f"Fondos insuficientes (saldo: {saldo})")
    return saldo - monto

print("\\nSimulación de cajero:")
saldo = 100
for monto in [30, -5, 200]:
    try:
        saldo = retirar(saldo, monto)
        print(f"  ✅ Retiro de {monto} exitoso. Saldo: {saldo}")
    except ValueError as e:
        print(f"  ❌ Retiro de {monto} rechazado: {e}")`
    },
    challenge: {
      title: 'Procesador de pedidos a prueba de errores',
      description: 'Completa procesar_pedido(cantidad, precio) para que atrape ValueError (si cantidad no es un número entero válido) y devuelva el total, o un mensaje de error claro si algo falla.',
      starter_code: `def procesar_pedido(cantidad_str, precio):
    try:
        cantidad = int(cantidad_str)
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        total = cantidad * precio
        return total
    except ValueError as e:
        return f"Error: {e}"

print(procesar_pedido("3", 15.5))
print(procesar_pedido("abc", 15.5))
print(procesar_pedido("-2", 15.5))`,
      expected_output: '46.5',
      hints: [
        'int("3") funciona, int("abc") lanza ValueError automáticamente',
        'raise ValueError("mensaje") lo lanzas tú cuando la cantidad es <= 0',
        'El código ya está completo, solo ejecútalo para ver los 3 casos'
      ]
    }
  },
  {
    moduleSlug: 'archivos-errores',
    slug: 'archivos-texto',
    title: 'Leer y Escribir Archivos',
    description: 'open(), modos de apertura, el bloque with y procesamiento línea por línea',
    difficulty: 'medium',
    estimated_minutes: 16,
    sort_order: 2,
    theory: `# Leer y Escribir Archivos

## Abrir un archivo: open()
\`\`\`python
archivo = open("datos.txt", "r")   # r = read (lectura)
contenido = archivo.read()
archivo.close()   # ¡No lo olvides!
\`\`\`

## El bloque \`with\` (la forma correcta)
\`with\` cierra el archivo automáticamente aunque ocurra un error — nunca lo olvidas.
\`\`\`python
with open("datos.txt", "r") as archivo:
    contenido = archivo.read()
# el archivo ya está cerrado aquí, incluso si hubo una excepción
\`\`\`

## Modos de apertura
| Modo | Significado |
|------|-------------|
| \`"r"\` | Leer (falla si no existe) |
| \`"w"\` | Escribir (crea o **sobrescribe** todo el archivo) |
| \`"a"\` | Agregar al final (append), sin borrar lo existente |
| \`"x"\` | Crear, falla si ya existe |

## Formas de leer
\`\`\`python
with open("datos.txt") as f:
    todo = f.read()            # todo el contenido como un solo string
    lineas = f.readlines()     # lista de líneas (con \\n al final)

with open("datos.txt") as f:
    for linea in f:             # iterar línea por línea (eficiente en memoria)
        print(linea.strip())    # strip() quita el \\n
\`\`\`

## Escribir
\`\`\`python
with open("salida.txt", "w") as f:
    f.write("Primera línea\\n")
    f.writelines(["Línea 2\\n", "Línea 3\\n"])
\`\`\`

## Nota sobre este simulador
Aquí el código corre en un sistema de archivos **virtual dentro del navegador** (no toca tu disco real) — perfecto para practicar \`open()\`, \`write()\` y \`read()\` sin riesgo, pero los archivos se pierden al recargar la página.`,
    example: {
      title: 'Escribir un archivo, agregar líneas y leerlo de vuelta',
      explanation: 'Ciclo completo: escribir, agregar (append) y leer, usando siempre with',
      code: `# 1) Escribir un archivo nuevo (modo "w" sobrescribe)
with open("notas.txt", "w") as f:
    f.write("Lista de tareas\\n")
    f.write("================\\n")

# 2) Agregar líneas sin borrar lo anterior (modo "a")
tareas = ["Comprar pan", "Estudiar Python", "Hacer ejercicio"]
with open("notas.txt", "a") as f:
    for tarea in tareas:
        f.write(f"- {tarea}\\n")

# 3) Leer todo el contenido
with open("notas.txt", "r") as f:
    contenido = f.read()
print("📄 Contenido completo:")
print(contenido)

# 4) Leer línea por línea, contando
print("📋 Línea por línea:")
with open("notas.txt", "r") as f:
    for numero, linea in enumerate(f, 1):
        print(f"  {numero}: {linea.strip()}")

# 5) Manejo de errores al leer un archivo que no existe
try:
    with open("no-existe.txt", "r") as f:
        f.read()
except FileNotFoundError:
    print("\\n⚠️ El archivo 'no-existe.txt' no existe (esto es esperado)")`
    },
    challenge: {
      title: 'Registro de calificaciones',
      description: 'Escribe en "calificaciones.txt" una línea por cada estudiante con el formato "nombre: nota", luego léelo de vuelta y calcula el promedio de las notas.',
      starter_code: `estudiantes = [("Ana", 90), ("Luis", 78), ("Marta", 85)]

# 1. Escribe cada estudiante en calificaciones.txt como "nombre: nota"
with open("calificaciones.txt", "w") as f:
    for nombre, nota in estudiantes:
        f.write()

# 2. Lee el archivo y calcula el promedio
notas = []
with open("calificaciones.txt", "r") as f:
    for linea in f:
        # separa por ": " y convierte la nota a int
        partes = linea.strip().split(": ")
        notas.append(int(partes[1]))

promedio = sum(notas) / len(notas)
print(f"Promedio: {promedio:.2f}")`,
      expected_output: 'Promedio: 84.33',
      hints: [
        'f.write(f"{nombre}: {nota}\\n")',
        '"Ana: 90".split(": ") da ["Ana", "90"]',
        'No olvides convertir partes[1] a int antes de sumarlo'
      ]
    }
  },
  {
    moduleSlug: 'archivos-errores',
    slug: 'json-csv',
    title: 'Trabajar con JSON y CSV',
    description: 'Guardar y cargar datos estructurados con los módulos json y csv',
    difficulty: 'medium',
    estimated_minutes: 16,
    sort_order: 3,
    theory: `# JSON y CSV

## ¿Por qué no solo texto plano?
Cuando tus datos tienen estructura (listas, diccionarios anidados), guardarlos como texto plano obliga a "parsear" a mano. **JSON** y **CSV** son formatos estándar para esto.

## El módulo \`json\`
JSON (JavaScript Object Notation) mapea casi 1 a 1 con listas y diccionarios de Python.
\`\`\`python
import json

datos = {"nombre": "Ana", "edad": 25, "cursos": ["Python", "IA"]}

# Python -> JSON (string)
texto = json.dumps(datos, indent=2, ensure_ascii=False)

# Python -> archivo JSON
with open("datos.json", "w") as f:
    json.dump(datos, f, indent=2, ensure_ascii=False)

# JSON (string) -> Python
datos_leidos = json.loads(texto)

# archivo JSON -> Python
with open("datos.json") as f:
    datos_leidos = json.load(f)
\`\`\`
Truco para recordar: \`dump\`**s** = *string* (dumps/loads trabajan con strings), sin la "s" trabajan con archivos (dump/load).

## El módulo \`csv\`
CSV (Comma-Separated Values) es el formato típico de hojas de cálculo: una fila por línea, columnas separadas por comas.
\`\`\`python
import csv

filas = [["nombre", "edad"], ["Ana", 25], ["Luis", 30]]

with open("datos.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(filas)

with open("datos.csv") as f:
    reader = csv.reader(f)
    for fila in reader:
        print(fila)
\`\`\`

### \`csv.DictReader\` / \`DictWriter\`
Más cómodo cuando quieres trabajar con cada fila como diccionario (usando la primera fila como encabezados):
\`\`\`python
with open("datos.csv") as f:
    for fila in csv.DictReader(f):
        print(fila["nombre"], fila["edad"])
\`\`\``,
    example: {
      title: 'Guardar configuración en JSON y una tabla en CSV',
      explanation: 'json.dump/load para datos anidados, csv.DictWriter/DictReader para tablas',
      code: `import json, csv

# ─── JSON: datos anidados ───
config = {
    "usuario": "ana_dev",
    "nivel": 3,
    "insignias": ["Python I", "Python II"],
    "activo": True
}

with open("config.json", "w") as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

with open("config.json") as f:
    config_leida = json.load(f)

print("📦 Config leída desde JSON:")
print(f"  Usuario: {config_leida['usuario']}")
print(f"  Insignias: {config_leida['insignias']}")

# ─── CSV: tabla de estudiantes ───
estudiantes = [
    {"nombre": "Ana", "nota": 90},
    {"nombre": "Luis", "nota": 78},
    {"nombre": "Marta", "nota": 85},
]

with open("estudiantes.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["nombre", "nota"])
    writer.writeheader()
    writer.writerows(estudiantes)

print("\\n📊 Leyendo estudiantes.csv:")
with open("estudiantes.csv") as f:
    for fila in csv.DictReader(f):
        print(f"  {fila['nombre']}: {fila['nota']}")

notas = [int(e["nota"]) for e in estudiantes]
print(f"\\nPromedio del curso: {sum(notas)/len(notas):.1f}")`
    },
    challenge: {
      title: 'Convertir CSV a JSON',
      description: 'Lee productos.csv (ya generado) con csv.DictReader, arma una lista de diccionarios y guárdala como productos.json con json.dump.',
      starter_code: `import json, csv

# Se genera el CSV de partida (no lo modifiques)
with open("productos.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["nombre", "precio"])
    writer.writeheader()
    writer.writerows([
        {"nombre": "Mouse", "precio": "25"},
        {"nombre": "Teclado", "precio": "60"},
    ])

# 1. Lee productos.csv con csv.DictReader y arma una lista de dicts
productos = []
with open("productos.csv") as f:
    for fila in csv.DictReader(f):
        productos.append(fila)

# 2. Guarda "productos" como productos.json (indent=2)
with open("productos.json", "w") as f:
    json.dump()

# 3. Verifica leyendo el JSON de vuelta
with open("productos.json") as f:
    resultado = json.load(f)
print(resultado)`,
      expected_output: "[{'nombre': 'Mouse', 'precio': '25'}, {'nombre': 'Teclado', 'precio': '60'}]",
      hints: [
        'json.dump(productos, f, indent=2)',
        'csv.DictReader ya te da cada fila como diccionario — solo agrégala a la lista',
        'productos.append(fila) dentro del for'
      ]
    }
  },
  {
    moduleSlug: 'archivos-errores',
    slug: 'excepciones-personalizadas',
    title: 'Excepciones Personalizadas y Logging',
    description: 'Crea tus propios tipos de error y registra eventos con el módulo logging',
    difficulty: 'hard',
    estimated_minutes: 18,
    sort_order: 4,
    theory: `# Excepciones Personalizadas y Logging

## ¿Por qué crear tus propias excepciones?
\`ValueError\` o \`Exception\` genéricos no dicen nada sobre **tu** dominio. Una excepción personalizada hace el código más claro y permite atrapar justo ese error.

## Crear una excepción personalizada
Toda excepción hereda de \`Exception\` (directa o indirectamente):
\`\`\`python
class SaldoInsuficienteError(Exception):
    """Se lanza cuando se intenta retirar más de lo disponible"""
    pass

class CuentaBloqueadaError(Exception):
    def __init__(self, cuenta_id):
        self.cuenta_id = cuenta_id
        super().__init__(f"La cuenta {cuenta_id} está bloqueada")
\`\`\`

## Usarlas
\`\`\`python
def retirar(saldo, monto):
    if monto > saldo:
        raise SaldoInsuficienteError(f"Saldo: {saldo}, solicitado: {monto}")
    return saldo - monto

try:
    retirar(100, 500)
except SaldoInsuficienteError as e:
    print(f"Operación rechazada: {e}")
\`\`\`

## Jerarquías de excepciones
Puedes crear una excepción "base" para tu aplicación y que las demás hereden de ella, así puedes atrapar todas juntas o cada una por separado:
\`\`\`python
class ErrorDeBanco(Exception): pass
class SaldoInsuficienteError(ErrorDeBanco): pass
class CuentaBloqueadaError(ErrorDeBanco): pass

try:
    ...
except ErrorDeBanco as e:   # atrapa CUALQUIER error del banco
    print(f"Error bancario: {e}")
\`\`\`

## El módulo \`logging\`
En vez de \`print()\` para depurar, \`logging\` da niveles de severidad, y es el estándar en proyectos reales.
\`\`\`python
import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

logging.debug("Detalle técnico (no se ve con level=INFO)")
logging.info("Operación normal")
logging.warning("Algo raro, pero no es un error")
logging.error("Algo falló")
logging.critical("El programa no puede continuar")
\`\`\`
Niveles, de menor a mayor severidad: \`DEBUG < INFO < WARNING < ERROR < CRITICAL\`. Solo se muestran los mensajes de nivel igual o mayor al configurado en \`basicConfig\`.`,
    example: {
      title: 'Sistema bancario con excepciones propias + logging',
      explanation: 'Jerarquía de excepciones personalizadas y registro de cada operación con logging',
      code: `import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

class ErrorDeBanco(Exception):
    """Excepción base para todos los errores del banco"""
    pass

class SaldoInsuficienteError(ErrorDeBanco):
    pass

class MontoInvalidoError(ErrorDeBanco):
    pass

class CuentaBancaria:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self.saldo = saldo

    def retirar(self, monto):
        if monto <= 0:
            raise MontoInvalidoError("El monto debe ser positivo")
        if monto > self.saldo:
            raise SaldoInsuficienteError(
                f"Saldo: {self.saldo}, solicitado: {monto}"
            )
        self.saldo -= monto
        logging.info(f"Retiro de {monto} exitoso. Nuevo saldo: {self.saldo}")
        return self.saldo

cuenta = CuentaBancaria("Ana", saldo=100)

for monto in [30, -5, 500]:
    try:
        cuenta.retirar(monto)
    except MontoInvalidoError as e:
        logging.warning(f"Monto inválido rechazado: {e}")
    except SaldoInsuficienteError as e:
        logging.error(f"Fondos insuficientes: {e}")
    except ErrorDeBanco as e:
        logging.critical(f"Error bancario no manejado específicamente: {e}")

print(f"\\nSaldo final de {cuenta.titular}: {cuenta.saldo}")`
    },
    challenge: {
      title: 'Validador de edad con excepción personalizada',
      description: 'Crea la excepción EdadInvalidaError y una función validar_edad(edad) que la lance si edad < 0 o edad > 120, y devuelva la edad si es válida.',
      starter_code: `class EdadInvalidaError(Exception):
    pass

def validar_edad(edad):
    if edad < 0 or edad > 120:
        raise EdadInvalidaError(f"Edad fuera de rango: {edad}")
    return edad

for edad in [25, -5, 150, 80]:
    try:
        resultado = validar_edad(edad)
        print(f"Edad {edad}: válida")
    except EdadInvalidaError as e:
        print(f"Edad {edad}: {e}")`,
      expected_output: 'Edad 25: válida\nEdad -5: Edad fuera de rango: -5\nEdad 150: Edad fuera de rango: 150\nEdad 80: válida',
      hints: [
        'El código ya está completo — ejecútalo primero para ver el comportamiento esperado',
        'class EdadInvalidaError(Exception): pass es toda la definición que necesitas',
        'raise EdadInvalidaError(f"...") crea y lanza la excepción en un solo paso'
      ]
    }
  },
]

async function main() {
  console.log('🌱 Seeding Academy: funciones (ampliación) + archivos-errores (nuevo)\n')

  const { data: course, error: courseErr } = await supabase
    .from('simulator_courses')
    .select('id')
    .eq('slug', 'python')
    .single()

  if (courseErr || !course) {
    console.error('❌ No se encontró el curso "python":', courseErr?.message)
    process.exit(1)
  }

  const { data: modules, error: modErr } = await supabase
    .from('simulator_modules')
    .select('id, slug')
    .eq('course_id', course.id)

  if (modErr) {
    console.error('❌ Error obteniendo módulos:', modErr.message)
    process.exit(1)
  }

  const moduleIdBySlug = Object.fromEntries(modules.map(m => [m.slug, m.id]))

  let ok = 0, skip = 0, fail = 0

  for (const lesson of LESSONS) {
    const moduleId = moduleIdBySlug[lesson.moduleSlug]
    if (!moduleId) {
      console.log(`  ⏭️  ${lesson.slug}: módulo "${lesson.moduleSlug}" no existe, skip`)
      skip++
      continue
    }

    const { data: existing } = await supabase
      .from('simulator_lessons')
      .select('id')
      .eq('module_id', moduleId)
      .eq('slug', lesson.slug)
      .maybeSingle()

    if (existing) {
      console.log(`  ⏭️  ${lesson.moduleSlug}/${lesson.slug}: ya existe, skip`)
      skip++
      continue
    }

    const { error } = await supabase.from('simulator_lessons').insert({
      module_id: moduleId,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      theory: lesson.theory,
      examples: [lesson.example],
      challenges: [lesson.challenge],
      sort_order: lesson.sort_order,
      difficulty: lesson.difficulty,
      estimated_minutes: lesson.estimated_minutes,
    })

    if (error) {
      console.log(`  ❌ ${lesson.moduleSlug}/${lesson.slug}: ${error.message}`)
      fail++
    } else {
      console.log(`  ✅ ${lesson.moduleSlug}/${lesson.slug}`)
      ok++
    }
  }

  console.log(`\n==========================================`)
  console.log(`✅ Insertadas: ${ok}  ⏭️  Omitidas: ${skip}  ❌ Fallidas: ${fail}`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('❌', err.message)
  process.exit(1)
})
