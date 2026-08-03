/**
 * Seed the empty Academy modules (estructuras-datos, poo, proyectos) for the
 * 'python' course using the rich lesson content that already existed in
 * src/components/PythonIDE/curriculum.ts (hardcoded), so both the Academy
 * pages and the PythonIDE (once wired to the API) share one source of truth.
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
  // ─── ESTRUCTURAS DE DATOS ───────────────────────────────
  {
    moduleSlug: 'estructuras-datos',
    slug: 'listas',
    title: 'Listas y Algoritmos',
    description: 'Operaciones, slicing, sorting, búsqueda',
    difficulty: 'medium',
    estimated_minutes: 18,
    sort_order: 1,
    theory: `# Listas y Algoritmos

## Métodos principales
- \`append(x)\` agrega al final
- \`extend(lista)\` une otra lista
- \`insert(i, x)\` inserta en la posición i
- \`pop(i)\` remueve y devuelve el elemento en i
- \`remove(x)\` elimina la primera coincidencia de x

## Slicing
\`lista[inicio:fin:paso]\` — por ejemplo \`lista[::-1]\` invierte la lista.

## Ordenamiento
- \`sorted(lista)\` devuelve una lista nueva ordenada
- \`lista.sort()\` ordena en el sitio (in-place)

## Algoritmos básicos
- Búsqueda lineal y búsqueda binaria (requiere lista ordenada)
- Bubble sort, selection sort — buenos para aprender, no para producción`,
    example: {
      title: 'Listas y Algoritmos',
      explanation: 'Slicing, sorted(), bubble sort y búsqueda binaria implementados desde cero',
      code: `nums = [64, 34, 25, 12, 22, 11, 90, 1, 45, 78]

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

print("\\n📐 Matriz 3x3:")
matriz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
for fila in matriz:
    print(f"  {fila}")
print(f"  Diagonal: {[matriz[i][i] for i in range(3)]}")
`
    },
    challenge: {
      title: 'Quick Sort',
      description: 'Implementa Quick Sort y compara la cantidad de comparaciones con Bubble Sort para la misma lista.',
      starter_code: `nums = [64, 34, 25, 12, 22, 11, 90, 1, 45, 78]

def quick_sort(arr):
    # Tu implementación aquí
    pass

print(quick_sort(nums))
`,
      expected_output: '',
      hints: [
        'sorted() retorna nueva lista, .sort() modifica in-place',
        'Slicing: lista[inicio:fin:paso]',
        'copy() crea copia superficial para no modificar el original',
        'Quick sort: elige un pivote, separa menores/mayores, ordena recursivamente'
      ]
    }
  },
  {
    moduleSlug: 'estructuras-datos',
    slug: 'diccionarios',
    title: 'Diccionarios y Sets',
    description: 'Mapas clave-valor, conjuntos, operaciones',
    difficulty: 'medium',
    estimated_minutes: 18,
    sort_order: 2,
    theory: `# Diccionarios y Sets

## dict — pares clave-valor
- \`.items()\`, \`.keys()\`, \`.values()\`
- \`.get(key, default)\` evita \`KeyError\`
- Dict comprehension: \`{k: v for k, v in d.items() if ...}\`

## set — colección sin duplicados
- \`&\` intersección
- \`|\` unión
- \`-\` diferencia
- \`^\` diferencia simétrica

## Counter
\`from collections import Counter\` cuenta frecuencias automáticamente.`,
    example: {
      title: 'Diccionarios y Conjuntos',
      explanation: 'Sistema de inventario, dict comprehension, operaciones de sets y Counter',
      code: `from collections import Counter

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

tech_items = {k: v for k, v in inventario.items() if v["cat"] == "tech"}
print(f"\\n🖥️ Solo tech: {list(tech_items.keys())}")

python = {"Ana", "Luis", "María", "Carlos", "Pedro"}
javascript = {"María", "Pedro", "Juan", "Laura", "Ana"}

print(f"\\n👥 Equipos:")
print(f"  Python:       {python}")
print(f"  JavaScript:   {javascript}")
print(f"  Ambos (∩):    {python & javascript}")
print(f"  Solo Python:  {python - javascript}")
print(f"  Cualquiera:   {python | javascript}")
print(f"  Exclusivo:    {python ^ javascript}")

texto = "programacion en python es genial python es el mejor"
palabras = Counter(texto.split())
print(f"\\n📊 Frecuencia de palabras:")
for palabra, freq in palabras.most_common(5):
    barra = "█" * (freq * 3)
    print(f"  {palabra:<12} {barra} ({freq})")
`
    },
    challenge: {
      title: 'Gestor de contactos',
      description: 'Crea un sistema de gestión de contactos con operaciones CRUD (crear, leer, actualizar, borrar) y búsqueda por nombre.',
      starter_code: `contactos = {}

def agregar(nombre, telefono):
    # Tu código aquí
    pass

def buscar(nombre):
    # Tu código aquí
    pass

agregar("Ana", "099-123-4567")
print(buscar("Ana"))
`,
      expected_output: '',
      hints: [
        'dict.get(key, default) evita KeyError',
        '& intersección, | unión, - diferencia, ^ simétrica',
        'Counter cuenta frecuencias automáticamente'
      ]
    }
  },
  // ─── PROGRAMACIÓN ORIENTADA A OBJETOS ───────────────────
  {
    moduleSlug: 'poo',
    slug: 'clases',
    title: 'Clases y Objetos',
    description: 'Crear clases, atributos, métodos, properties',
    difficulty: 'medium',
    estimated_minutes: 20,
    sort_order: 1,
    theory: `# Clases en Python

\`\`\`python
class MiClase:
    class_var = valor        # variable de clase

    def __init__(self, p):   # constructor
        self.attr = p        # variable de instancia

    @property                # getter
    def algo(self):
        return self.attr

    def __str__(self):       # representación en texto
        return f"..."
\`\`\`

## Puntos clave
- \`@property\` convierte un método en un atributo de solo lectura
- \`__str__\` define cómo \`print()\` muestra el objeto
- Las variables de clase se comparten entre todas las instancias`,
    example: {
      title: 'Sistema de gestión estudiantil',
      explanation: 'Clase con constructor, property, variable de clase y __str__',
      code: `import random
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

alumnos = [
    Estudiante("María López", 15, "10mo EGB"),
    Estudiante("Carlos Ruiz", 16, "1ro Bach"),
    Estudiante("Ana Torres", 14, "9no EGB"),
    Estudiante("Pedro García", 17, "2do Bach"),
]

for a in alumnos:
    for _ in range(6):
        a.agregar_nota(round(random.uniform(5, 10), 1))

print("🎓 REPORTE ACADÉMICO")
print("═" * 50)
for a in sorted(alumnos, key=lambda x: x.promedio, reverse=True):
    print(f"  {a}")
    print(f"    {a.barra}  {a.estado}")
    print(f"    Notas: {a.notas}")
    print()

print(f"📊 Total estudiantes: {Estudiante.total}")
print(f"📊 Mejor promedio: {max(a.promedio for a in alumnos):.1f}")
`
    },
    challenge: {
      title: 'Sistema de biblioteca',
      description: 'Crea un sistema de biblioteca con clases Libro, Usuario y Préstamo. Un Préstamo relaciona un Usuario con un Libro y calcula si está vencido.',
      starter_code: `class Libro:
    def __init__(self, titulo, autor):
        self.titulo = titulo
        self.autor = autor
        self.disponible = True

class Usuario:
    def __init__(self, nombre):
        self.nombre = nombre

class Prestamo:
    # Tu código aquí
    pass
`,
      expected_output: '',
      hints: [
        '@property convierte un método en atributo de solo lectura',
        '__str__ define cómo print() muestra el objeto',
        'Las variables de clase se comparten entre todas las instancias'
      ]
    }
  },
  {
    moduleSlug: 'poo',
    slug: 'herencia',
    title: 'Herencia y Polimorfismo',
    description: 'Clases abstractas, herencia múltiple, super()',
    difficulty: 'hard',
    estimated_minutes: 22,
    sort_order: 2,
    theory: `# Herencia

\`\`\`python
class Hijo(Padre):
    def __init__(self):
        super().__init__()
\`\`\`

## Polimorfismo
Misma interfaz, diferente implementación: distintas clases responden al mismo método de forma distinta.

## ABC (clases abstractas)
Usando \`from abc import ABC, abstractmethod\`, defines métodos que las subclases están OBLIGADAS a implementar.`,
    example: {
      title: 'Geometría con polimorfismo',
      explanation: 'Clase abstracta Forma + subclases Circulo, Rectangulo, Cuadrado, Triangulo',
      code: `from abc import ABC, abstractmethod
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

areas = [f.area() for f in formas]
print(f"\\n📊 Estadísticas:")
print(f"  Total formas: {len(formas)}")
print(f"  Área total:   {sum(areas):.2f}")
print(f"  Área max:     {max(areas):.2f}")
print(f"  Área min:     {min(areas):.2f}")

print(f"\\n🔍 Tipos:")
for f in formas:
    print(f"  {type(f).__name__:12} isinstance(Forma): {isinstance(f, Forma)}")

print(f"  Cuadrado es Rectangulo: {isinstance(Cuadrado(5), Rectangulo)}")
`
    },
    challenge: {
      title: 'RPG con herencia',
      description: 'Crea un RPG con clases Personaje, Guerrero, Mago y Arquero usando herencia. Cada subclase debe sobrescribir un método de ataque distinto.',
      starter_code: `class Personaje:
    def __init__(self, nombre, hp):
        self.nombre = nombre
        self.hp = hp

    def atacar(self):
        raise NotImplementedError

class Guerrero(Personaje):
    # Tu código aquí
    pass
`,
      expected_output: '',
      hints: [
        'ABC + @abstractmethod fuerza a las subclases a implementar el método',
        'super().__init__() llama al constructor del padre',
        'isinstance() verifica la herencia completa'
      ]
    }
  },
  // ─── PROYECTOS DEL MUNDO REAL ────────────────────────────
  {
    moduleSlug: 'proyectos',
    slug: 'json-api',
    title: 'JSON y APIs',
    description: 'Procesar datos JSON, simular consumo de APIs',
    difficulty: 'hard',
    estimated_minutes: 20,
    sort_order: 1,
    theory: `# JSON y APIs

\`\`\`python
import json
\`\`\`

- \`json.loads(str)\` → convierte un string JSON a dict de Python
- \`json.dumps(obj)\` → convierte un dict de Python a string JSON
- \`json.dumps(obj, indent=2)\` → formateado y legible

Así es como una app real consume la respuesta de una API REST.`,
    example: {
      title: 'Procesar reporte climático (API simulada)',
      explanation: 'Parsear JSON, calcular estadísticas y re-exportar un resumen',
      code: `import json
from statistics import mean, stdev

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

print(f"  {'Estación':<12} {'Temp':>6} {'Hum':>5} {'AQI':>5} {'Calidad':>10}")
print("  " + "─" * 44)

for e in data["estaciones"]:
    aqi = e["aqi"]
    if aqi <= 50: calidad = "🟢 Buena"
    elif aqi <= 100: calidad = "🟡 Moderada"
    else: calidad = "🔴 Mala"
    print(f"  {e['nombre']:<12} {e['temp']:>5.1f}° {e['humedad']:>4}% {aqi:>5} {calidad:>10}")

temps = [e["temp"] for e in data["estaciones"]]
humedades = [e["humedad"] for e in data["estaciones"]]
aqis = [e["aqi"] for e in data["estaciones"]]

print(f"\\n📊 Estadísticas:")
print(f"  🌡️ Temperatura: min={min(temps)}° max={max(temps)}° avg={mean(temps):.1f}° std={stdev(temps):.1f}°")
print(f"  💧 Humedad:     min={min(humedades)}% max={max(humedades)}% avg={mean(humedades):.0f}%")
print(f"  🌬️ AQI:         min={min(aqis)} max={max(aqis)} avg={mean(aqis):.0f}")

resumen = {
    "ciudad": data["ciudad"],
    "resumen": {
        "temperatura": {"min": min(temps), "max": max(temps), "promedio": round(mean(temps), 1)},
        "estaciones_analizadas": len(data["estaciones"]),
        "calidad_aire": "buena" if mean(aqis) <= 50 else "moderada"
    }
}

print(f"\\n📤 JSON exportado:")
print(json.dumps(resumen, indent=2, ensure_ascii=False))
`
    },
    challenge: {
      title: 'Dashboard multi-ciudad',
      description: 'Crea un dashboard que analice datos de múltiples ciudades (JSON con lista de ciudades) y genere alertas cuando el AQI promedio supere 70.',
      starter_code: `import json

ciudades_json = '{"ciudades": []}'
data = json.loads(ciudades_json)

# Tu código aquí
`,
      expected_output: '',
      hints: [
        'json.loads() convierte string JSON a dict de Python',
        'json.dumps(obj, indent=2) da formato legible',
        'statistics.mean() y stdev() para estadísticas rápidas'
      ]
    }
  },
  {
    moduleSlug: 'proyectos',
    slug: 'regex',
    title: 'Expresiones Regulares',
    description: 'Buscar, validar y extraer patrones de texto',
    difficulty: 'hard',
    estimated_minutes: 20,
    sort_order: 2,
    theory: `# Regex — \`import re\`

## Patrones
- \`\\d\` dígito, \`\\w\` alfanumérico, \`\\s\` espacio
- \`.\` cualquier carácter, \`+\` uno o más, \`*\` cero o más
- \`[]\` conjunto, \`()\` grupo, \`|\` alternativa

## Funciones principales
- \`re.search()\` → primera coincidencia
- \`re.findall()\` → todas las coincidencias
- \`re.sub()\` → reemplazar texto que coincide`,
    example: {
      title: 'Análisis de texto con regex',
      explanation: 'Extraer emails, teléfonos, URLs y validar formato',
      code: `import re

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

emails = re.findall(r'[\\w.+-]+@[\\w-]+\\.[\\w.]+', texto)
print("\\n📧 Emails:")
for e in emails:
    dominio = e.split('@')[1]
    print(f"  • {e} (dominio: {dominio})")

tels = re.findall(r'[+]?[\\d][-\\d]{9,}', texto)
print("\\n📱 Teléfonos:")
for t in tels:
    print(f"  • {t}")

urls = re.findall(r'https?://[\\w./-]+', texto)
print("\\n🌐 URLs:")
for u in urls:
    protocolo = "HTTPS" if u.startswith("https") else "HTTP"
    print(f"  • [{protocolo}] {u}")

def validar_email(email):
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return bool(re.match(patron, email))

tests = ["user@email.com", "bad@", "ok@dom.co", "@nope.com", "a.b+c@x.org"]
print("\\n✅ Validación:")
for e in tests:
    print(f"  {'✓' if validar_email(e) else '✗'} {e}")

sucio = "  Hola!!!   ¿Cómo    estás???  "
limpio = re.sub(r'\\s+', ' ', sucio).strip()
limpio = re.sub(r'([!?])\\1+', r'\\1', limpio)
print(f"\\n🧹 Sanitizar: '{sucio}'")
print(f"   Resultado: '{limpio}'")
`
    },
    challenge: {
      title: 'Parser de logs de servidor',
      description: 'Crea un parser de logs de servidor que extraiga la IP, el método HTTP y el código de estado de cada línea.',
      starter_code: `import re

log = '192.168.1.10 - - [03/Aug/2026] "GET /api/users HTTP/1.1" 200'

# Extrae IP, método y código de estado
`,
      expected_output: '',
      hints: [
        'r"..." es raw string — no interpreta backslashes',
        '\\w = letras/dígitos/_, \\d = dígitos, \\s = espacios',
        're.findall() retorna lista de coincidencias'
      ]
    }
  },
  {
    moduleSlug: 'proyectos',
    slug: 'juego-rpg',
    title: 'Proyecto: Juego RPG',
    description: 'Juego completo con clases, inventario y combate',
    difficulty: 'hard',
    estimated_minutes: 25,
    sort_order: 3,
    theory: `# Diseño de Juegos

## Patrones usados
- Herencia para tipos de personajes (\`Enemigo(Personaje)\`)
- Composición para el inventario (una lista dentro del personaje)
- Máquina de estados para el flujo del juego (vivo/muerto, piso actual)
- \`random\` para variabilidad en el combate`,
    example: {
      title: 'La Mazmorra Oscura',
      explanation: 'Juego RPG completo: combate por turnos, subida de nivel, inventario y loot',
      code: `import random
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

heroe = Personaje("⚔️ Aventurero", 120, 15, 8)
heroe.inventario = ["Espada de Hierro", "Escudo de Madera", "Poción x3"]

mazmorras = [
    [Enemigo("Slime 🟢", 30, 6, 2, 15, "Gel Mágico"),
     Enemigo("Rata Gigante 🐀", 25, 8, 1, 12)],
    [Enemigo("Goblin 👺", 50, 10, 5, 25, "Daga Oxidada"),
     Enemigo("Goblin Arquero 🏹", 40, 12, 3, 22)],
    [Enemigo("Esqueleto 💀", 60, 13, 6, 35, "Hueso Antiguo"),
     Enemigo("Zombie 🧟", 70, 11, 8, 30)],
    [Enemigo("🐉 Dragón Anciano", 200, 22, 12, 150, "Escama de Dragón")]
]

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
`
    },
    challenge: {
      title: 'Sistema de magia y tienda',
      description: 'Agrega un sistema de magia (hechizos que consumen maná), una tienda de ítems, y al menos dos tipos de personajes jugables (ej. Guerrero y Mago).',
      starter_code: `class Personaje:
    def __init__(self, nombre, hp, mana=0):
        self.nombre = nombre
        self.hp = hp
        self.mana = mana

# Tu código aquí
`,
      expected_output: '',
      hints: [
        "super().__init__() llama al constructor padre",
        'max(1, daño) evita daño negativo',
        'random.seed() hace reproducible el juego'
      ]
    }
  },
]

async function main() {
  console.log('🌱 Seeding Academy: estructuras-datos, poo, proyectos (curso Python)\n')

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
