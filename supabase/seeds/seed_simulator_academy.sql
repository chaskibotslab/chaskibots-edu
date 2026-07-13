-- =========================================================
-- SEED: Python Academy Course
-- =========================================================

INSERT INTO simulator_courses (slug, title, description, icon, color, difficulty, total_modules, total_lessons, sort_order)
VALUES 
  ('python', 'Python Academy', 'Aprende Python desde cero hasta nivel avanzado. Programación real con proyectos prácticos, teoría completa y desafíos interactivos.', '🐍', '#3B82F6', 'beginner', 8, 32, 1),
  ('hacking-etico', 'Hacking Ético Academy', 'Domina la ciberseguridad de forma responsable. Redes, criptografía, pentesting y seguridad web con laboratorios prácticos.', '🛡️', '#10B981', 'intermediate', 7, 28, 2)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- PYTHON MODULES
-- =========================================================

INSERT INTO simulator_modules (course_id, slug, title, description, icon, sort_order)
VALUES
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'fundamentos', 'Fundamentos de Python', 'Variables, tipos de datos, operadores y tu primer programa', '📦', 1),
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'control-flujo', 'Control de Flujo', 'Condicionales if/elif/else y toma de decisiones', '🔀', 2),
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'bucles', 'Bucles y Repetición', 'Ciclos for, while, break, continue y comprehensions', '🔄', 3),
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'funciones', 'Funciones', 'Crear funciones reutilizables, parámetros, return y scope', '⚙️', 4),
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'estructuras-datos', 'Estructuras de Datos', 'Listas, tuplas, diccionarios, sets y sus métodos', '🗂️', 5),
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'poo', 'Programación Orientada a Objetos', 'Clases, objetos, herencia, polimorfismo y encapsulamiento', '🎮', 6),
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'archivos-errores', 'Archivos y Manejo de Errores', 'Lectura/escritura de archivos, try/except, logging', '📄', 7),
  ((SELECT id FROM simulator_courses WHERE slug='python'), 'proyectos', 'Proyectos Reales', 'Aplicaciones completas: calculadoras, juegos, APIs', '🚀', 8)
ON CONFLICT (course_id, slug) DO NOTHING;

-- =========================================================
-- PYTHON LESSONS - Module 1: Fundamentos
-- =========================================================

INSERT INTO simulator_lessons (module_id, slug, title, description, theory, examples, challenges, sort_order, difficulty, estimated_minutes)
VALUES
(
  (SELECT id FROM simulator_modules WHERE slug='fundamentos' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'hola-mundo',
  'Tu Primer Programa',
  'Escribe tu primer programa en Python y entiende cómo funciona print()',
  '# Tu Primer Programa en Python

## ¿Qué es Python?
Python es un lenguaje de programación creado por **Guido van Rossum** en 1991. Es uno de los lenguajes más populares del mundo por su simplicidad y poder.

## La función print()
`print()` es la forma de **mostrar información en pantalla**. Todo lo que pongas dentro de los paréntesis se mostrará en la consola.

### Reglas básicas:
- El texto (strings) va entre comillas: `"hola"` o `''hola''`
- Los números van sin comillas: `42`
- Puedes separar varios valores con comas
- Cada `print()` genera una nueva línea

## ¿Por qué es importante?
- **Depuración**: Ver qué está haciendo tu programa
- **Comunicación**: Mostrar resultados al usuario
- **Aprendizaje**: Entender el flujo del programa',
  '[
    {"title": "Hello World básico", "code": "print(\"¡Hola Mundo!\")\nprint(\"Bienvenido a Python\")\nprint(\"Mi nombre es ChaskiBot\")", "explanation": "Cada print() muestra una línea de texto en la consola"},
    {"title": "Imprimir números y operaciones", "code": "print(42)\nprint(10 + 5)\nprint(\"La respuesta es:\", 7 * 6)", "explanation": "Python puede calcular matemáticas dentro de print()"},
    {"title": "Texto multilínea", "code": "print(\"=\"*30)\nprint(\"  BIENVENIDO  \")\nprint(\"  A PYTHON    \")\nprint(\"=\"*30)", "explanation": "Puedes multiplicar strings para crear patrones"}
  ]',
  '[
    {"title": "Preséntate", "description": "Escribe un programa que imprima tu nombre, tu edad y tu comida favorita en 3 líneas separadas.", "starter_code": "# Escribe tu presentación\nprint(\"Mi nombre es ...\")\n# Completa las siguientes líneas", "expected_output": "Mi nombre es [nombre]\nTengo [edad] años\nMi comida favorita es [comida]", "hints": ["Usa un print() para cada línea", "Recuerda las comillas para el texto"]},
    {"title": "Arte ASCII", "description": "Crea un dibujo simple usando print() y caracteres como *, -, |, /", "starter_code": "# Dibuja una casa simple\nprint(\"   /\\\\\")\nprint(\"  /  \\\\\")\n# Completa el resto de la casa", "expected_output": "   /\\\\\n  /  \\\\\n |    |\n |____|\n", "hints": ["Usa espacios para alinear", "Los caracteres especiales como \\\\ necesitan doble barra"]}
  ]',
  1, 'easy', 8
),
(
  (SELECT id FROM simulator_modules WHERE slug='fundamentos' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'variables',
  'Variables y Tipos de Datos',
  'Aprende a almacenar información en variables y conoce los tipos de datos fundamentales',
  '# Variables y Tipos de Datos

## ¿Qué es una variable?
Una variable es un **contenedor con nombre** que almacena un valor en la memoria. Piensa en ellas como cajas etiquetadas donde guardas información.

## Reglas para nombres de variables:
- Deben empezar con letra o guión bajo `_`
- No pueden empezar con número
- Solo letras, números y `_` (no espacios ni caracteres especiales)
- Son **case-sensitive**: `nombre` ≠ `Nombre`
- No usar palabras reservadas: `if`, `for`, `while`, etc.

## Tipos de datos fundamentales:

| Tipo | Ejemplo | Descripción |
|------|---------|-------------|
| `str` | `"Hola"` | Texto (string) |
| `int` | `42` | Número entero |
| `float` | `3.14` | Número decimal |
| `bool` | `True`/`False` | Verdadero o Falso |

## Operador de asignación `=`
El signo `=` **asigna** un valor a una variable. No es "igual a" en sentido matemático.

```python
edad = 15  # Asignar 15 a la variable edad
```

## Función type()
Usa `type()` para saber qué tipo de dato tiene una variable.',
  '[
    {"title": "Crear variables de distintos tipos", "code": "nombre = \"Ana García\"\nedad = 14\naltura = 1.62\nes_estudiante = True\n\nprint(\"Nombre:\", nombre)\nprint(\"Edad:\", edad)\nprint(\"Altura:\", altura)\nprint(\"¿Estudiante?:\", es_estudiante)\nprint(\"Tipo de nombre:\", type(nombre))\nprint(\"Tipo de edad:\", type(edad))", "explanation": "Cada variable almacena un tipo de dato diferente. Python detecta el tipo automáticamente."},
    {"title": "Operaciones con variables", "code": "precio = 25.50\ncantidad = 3\ntotal = precio * cantidad\n\nnombre_producto = \"Cuaderno\"\nmensaje = \"Compraste \" + str(cantidad) + \" \" + nombre_producto + \"s\"\n\nprint(mensaje)\nprint(\"Total a pagar: $\" + str(total))", "explanation": "Las variables numéricas se pueden operar. Para unir texto con números, usa str() para convertir."},
    {"title": "Reasignación y f-strings", "code": "puntos = 0\nprint(f\"Puntos iniciales: {puntos}\")\n\npuntos = puntos + 10\nprint(f\"Después de ganar: {puntos}\")\n\npuntos += 5  # Atajo para sumar\nprint(f\"Bonus: {puntos}\")\n\nnombre = \"Carlos\"\nprint(f\"¡{nombre} tiene {puntos} puntos!\")", "explanation": "Las f-strings (f\"...\") permiten insertar variables dentro del texto usando {llaves}"}
  ]',
  '[
    {"title": "Ficha de estudiante", "description": "Crea variables para: nombre (str), edad (int), promedio (float), y aprobado (bool). Luego imprime todo usando f-strings.", "starter_code": "# Crea las variables\nnombre = \n edad = \npromedio = \naprobado = \n\n# Imprime la ficha\nprint(f\"Nombre: {nombre}\")\n# Completa...", "expected_output": "Nombre: [nombre]\nEdad: [edad]\nPromedio: [promedio]\nAprobado: [True/False]", "hints": ["Los strings van entre comillas", "Los booleanos son True o False (con mayúscula)", "Usa f-strings para imprimir"]},
    {"title": "Calculadora de IMC", "description": "Crea variables peso (kg) y altura (metros), calcula el IMC (peso / altura²) y muestra el resultado.", "starter_code": "# Datos\npeso = 65  # kg\naltura = 1.70  # metros\n\n# Calcula el IMC\nimc = \n\nprint(f\"Tu IMC es: {imc:.1f}\")", "expected_output": "Tu IMC es: 22.5", "hints": ["La fórmula es: peso / (altura ** 2)", "El ** es potencia en Python", ":.1f muestra 1 decimal"]}
  ]',
  2, 'easy', 12
),
(
  (SELECT id FROM simulator_modules WHERE slug='fundamentos' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'operadores',
  'Operadores y Expresiones',
  'Domina los operadores aritméticos, de comparación y lógicos',
  '# Operadores y Expresiones

## Operadores Aritméticos

| Operador | Nombre | Ejemplo | Resultado |
|----------|--------|---------|-----------|
| `+` | Suma | `5 + 3` | `8` |
| `-` | Resta | `10 - 4` | `6` |
| `*` | Multiplicación | `3 * 4` | `12` |
| `/` | División | `10 / 3` | `3.333...` |
| `//` | División entera | `10 // 3` | `3` |
| `%` | Módulo (residuo) | `10 % 3` | `1` |
| `**` | Potencia | `2 ** 3` | `8` |

## Operadores de Comparación
Devuelven `True` o `False`:

| Operador | Significado |
|----------|-------------|
| `==` | Igual a |
| `!=` | Diferente de |
| `>` | Mayor que |
| `<` | Menor que |
| `>=` | Mayor o igual |
| `<=` | Menor o igual |

## Operadores Lógicos
Combinan condiciones:

- `and` → Verdadero si AMBOS son verdaderos
- `or` → Verdadero si AL MENOS UNO es verdadero
- `not` → Invierte el valor (True→False, False→True)

## Precedencia de operadores
`**` → `*,/,//,%` → `+,-` → `==,!=,<,>` → `not` → `and` → `or`',
  '[
    {"title": "Todos los operadores aritméticos", "code": "a, b = 17, 5\n\nprint(f\"{a} + {b} = {a + b}\")\nprint(f\"{a} - {b} = {a - b}\")\nprint(f\"{a} * {b} = {a * b}\")\nprint(f\"{a} / {b} = {a / b}\")\nprint(f\"{a} // {b} = {a // b}\")\nprint(f\"{a} % {b} = {a % b}\")\nprint(f\"{a} ** {b} = {a ** b}\")", "explanation": "El // da la parte entera de la división, el % da el residuo"},
    {"title": "Comparaciones y lógica", "code": "edad = 16\ntiene_permiso = True\n\nprint(f\"¿Mayor de 18? {edad >= 18}\")\nprint(f\"¿Tiene permiso? {tiene_permiso}\")\nprint(f\"¿Puede entrar? {edad >= 18 or tiene_permiso}\")\nprint(f\"¿Cumple ambos? {edad >= 18 and tiene_permiso}\")", "explanation": "Los operadores lógicos combinan múltiples condiciones"},
    {"title": "Aplicación práctica: Tienda", "code": "precio = 45.00\ndescuento = 0.20  # 20%\nimpuesto = 0.12   # 12% IVA\n\nprecio_con_descuento = precio * (1 - descuento)\nimpuesto_total = precio_con_descuento * impuesto\ntotal = precio_con_descuento + impuesto_total\n\nprint(f\"Precio original: ${precio:.2f}\")\nprint(f\"Descuento (20%): -${precio * descuento:.2f}\")\nprint(f\"Subtotal: ${precio_con_descuento:.2f}\")\nprint(f\"IVA (12%): +${impuesto_total:.2f}\")\nprint(f\"TOTAL: ${total:.2f}\")", "explanation": "Ejemplo real de cálculos con operadores en una factura"}
  ]',
  '[
    {"title": "Par o Impar", "description": "Crea un programa que determine si un número es par o impar usando el operador módulo (%).", "starter_code": "numero = 23\n\n# Un número es par si su residuo al dividir por 2 es 0\nes_par = \n\nprint(f\"{numero} es par: {es_par}\")", "expected_output": "23 es par: False", "hints": ["Usa el operador %", "numero % 2 == 0 significa que es par"]},
    {"title": "Conversor de temperatura", "description": "Convierte 98.6°F a Celsius usando la fórmula: C = (F - 32) * 5/9", "starter_code": "fahrenheit = 98.6\n\n# Fórmula de conversión\ncelsius = \n\nprint(f\"{fahrenheit}°F = {celsius:.1f}°C\")", "expected_output": "98.6°F = 37.0°C", "hints": ["La fórmula es (fahrenheit - 32) * 5 / 9", "Usa paréntesis para el orden correcto"]}
  ]',
  3, 'easy', 10
),
(
  (SELECT id FROM simulator_modules WHERE slug='fundamentos' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'input-conversion',
  'Entrada de Datos y Conversión',
  'Recibe datos del usuario con input() y convierte entre tipos de datos',
  '# Entrada de Datos y Conversión de Tipos

## La función input()
`input()` **pausa el programa** y espera que el usuario escriba algo. Siempre devuelve un **string** (texto).

```python
respuesta = input("¿Cuál es tu nombre? ")
# El usuario escribe y presiona Enter
```

## ⚠️ Importante
`input()` SIEMPRE devuelve texto. Si necesitas un número, debes **convertirlo**:

## Funciones de conversión:

| Función | Convierte a | Ejemplo |
|---------|-------------|---------|
| `int()` | Entero | `int("5")` → `5` |
| `float()` | Decimal | `float("3.14")` → `3.14` |
| `str()` | Texto | `str(42)` → `"42"` |
| `bool()` | Booleano | `bool(1)` → `True` |

## Patrón común:
```python
edad = int(input("Tu edad: "))
# 1. input() muestra el mensaje y recibe texto
# 2. int() convierte ese texto a número
```

## Errores comunes:
- `int("hola")` → Error! No se puede convertir texto a número
- `int("3.5")` → Error! Usa float() primero para decimales',
  '[
    {"title": "Programa interactivo", "code": "nombre = input(\"¿Cómo te llamas? \")\nedad = int(input(\"¿Cuántos años tienes? \"))\nciudad = input(\"¿De qué ciudad eres? \")\n\nprint(f\"\\n--- Tu Perfil ---\")\nprint(f\"Nombre: {nombre}\")\nprint(f\"Edad: {edad}\")\nprint(f\"Ciudad: {ciudad}\")\nprint(f\"En 10 años tendrás {edad + 10} años\")", "explanation": "input() recibe texto, int() lo convierte a número para poder operar"},
    {"title": "Calculadora interactiva", "code": "print(\"=== CALCULADORA ===\")\nnum1 = float(input(\"Primer número: \"))\nnum2 = float(input(\"Segundo número: \"))\n\nprint(f\"\\n{num1} + {num2} = {num1 + num2}\")\nprint(f\"{num1} - {num2} = {num1 - num2}\")\nprint(f\"{num1} * {num2} = {num1 * num2}\")\nif num2 != 0:\n    print(f\"{num1} / {num2} = {num1 / num2:.2f}\")\nelse:\n    print(\"No se puede dividir por cero!\")", "explanation": "float() permite trabajar con decimales. Verificamos que no se divida por cero."}
  ]',
  '[
    {"title": "Conversor de moneda", "description": "Pide al usuario una cantidad en dólares y conviértela a tu moneda local (ejemplo: 1 USD = 4.50 de tu moneda).", "starter_code": "tasa_cambio = 4.50  # Ejemplo\n\ndolares = float(input(\"Cantidad en USD: \"))\n\n# Calcula la conversión\nmoneda_local = \n\nprint(f\"${dolares} USD = ${moneda_local:.2f} moneda local\")", "expected_output": "$10.0 USD = $45.00 moneda local", "hints": ["Multiplica dólares por la tasa de cambio", "Usa float() para el input por si ponen decimales"]}
  ]',
  4, 'easy', 10
);

-- =========================================================
-- PYTHON LESSONS - Module 2: Control de Flujo
-- =========================================================

INSERT INTO simulator_lessons (module_id, slug, title, description, theory, examples, challenges, sort_order, difficulty, estimated_minutes)
VALUES
(
  (SELECT id FROM simulator_modules WHERE slug='control-flujo' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'if-else',
  'Condicionales if/elif/else',
  'Toma decisiones en tu código basándote en condiciones',
  '# Condicionales: if / elif / else

## ¿Qué son los condicionales?
Los condicionales permiten que tu programa **tome decisiones**. Ejecutan diferentes bloques de código según si una condición es verdadera o falsa.

## Estructura básica:
```python
if condición:
    # Se ejecuta si la condición es True
elif otra_condición:
    # Se ejecuta si la primera es False y esta es True
else:
    # Se ejecuta si todas las anteriores son False
```

## Reglas importantes:
1. La condición debe evaluar a `True` o `False`
2. **Indentación** (4 espacios) define qué pertenece al bloque
3. `elif` y `else` son opcionales
4. Puedes tener múltiples `elif`
5. Solo UN bloque se ejecuta (el primero que sea True)

## Condiciones anidadas:
Puedes poner un if dentro de otro if para decisiones más complejas.',
  '[
    {"title": "Sistema de calificaciones", "code": "nota = 78\n\nif nota >= 90:\n    letra = \"A\"\n    estado = \"Excelente\"\nelif nota >= 80:\n    letra = \"B\"\n    estado = \"Muy Bien\"\nelif nota >= 70:\n    letra = \"C\"\n    estado = \"Bien\"\nelif nota >= 60:\n    letra = \"D\"\n    estado = \"Suficiente\"\nelse:\n    letra = \"F\"\n    estado = \"Reprobado\"\n\nprint(f\"Nota: {nota}/100\")\nprint(f\"Calificación: {letra}\")\nprint(f\"Estado: {estado}\")", "explanation": "Se evalúan las condiciones de arriba hacia abajo. La primera que sea True, ejecuta su bloque."},
    {"title": "Verificador de edad", "code": "edad = 16\ntiene_id = True\n\nif edad >= 18:\n    print(\"✅ Acceso permitido - Mayor de edad\")\nelif edad >= 15 and tiene_id:\n    print(\"⚠️ Acceso con supervisión\")\n    print(\"Necesita acompañante adulto\")\nelse:\n    print(\"❌ Acceso denegado\")\n    print(f\"Regresa en {18 - edad} años\")", "explanation": "Puedes combinar condiciones con and/or dentro del if"},
    {"title": "Calculadora con menú", "code": "num1 = 20\nnum2 = 4\noperacion = \"+\"\n\nif operacion == \"+\":\n    resultado = num1 + num2\nelif operacion == \"-\":\n    resultado = num1 - num2\nelif operacion == \"*\":\n    resultado = num1 * num2\nelif operacion == \"/\":\n    if num2 != 0:\n        resultado = num1 / num2\n    else:\n        resultado = \"Error: División por cero\"\nelse:\n    resultado = \"Operación no válida\"\n\nprint(f\"{num1} {operacion} {num2} = {resultado}\")", "explanation": "Ejemplo de condicional anidado: verificamos división por cero dentro del elif"}
  ]',
  '[
    {"title": "Clasificador de triángulos", "description": "Dados 3 lados, determina si el triángulo es equilátero (3 iguales), isósceles (2 iguales) o escaleno (todos diferentes).", "starter_code": "lado1 = 5\nlado2 = 5\nlado3 = 8\n\n# Clasifica el triángulo\nif lado1 == lado2 == lado3:\n    tipo = \"equilátero\"\n# Completa los demás casos...\n\nprint(f\"Triángulo {tipo}\")", "expected_output": "Triángulo isósceles", "hints": ["Usa elif para el caso isósceles", "Un triángulo es isósceles si al menos 2 lados son iguales", "Usa or para verificar: lado1==lado2 or lado1==lado3 or lado2==lado3"]},
    {"title": "Año bisiesto", "description": "Determina si un año es bisiesto. Reglas: divisible por 4 Y (no divisible por 100 O divisible por 400)", "starter_code": "anio = 2024\n\n# Determina si es bisiesto\n\nprint(f\"{anio} es bisiesto: {es_bisiesto}\")", "expected_output": "2024 es bisiesto: True", "hints": ["Un año es bisiesto si: (anio % 4 == 0 and anio % 100 != 0) or (anio % 400 == 0)", "2024 % 4 == 0 y 2024 % 100 != 0, entonces SÍ es bisiesto"]}
  ]',
  1, 'easy', 15
),
(
  (SELECT id FROM simulator_modules WHERE slug='control-flujo' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'match-case',
  'Match/Case y Patrones',
  'El nuevo switch-case de Python 3.10+ para código más limpio',
  '# Match/Case (Python 3.10+)

## ¿Qué es match/case?
Es una forma más limpia de manejar múltiples condiciones cuando comparas un valor con varios posibles. Similar al switch de otros lenguajes.

## Sintaxis:
```python
match variable:
    case valor1:
        # código
    case valor2:
        # código
    case _:
        # caso por defecto (como else)
```

## Ventajas sobre if/elif:
- Código más legible y organizado
- Soporta patrones complejos
- El `_` funciona como comodín (match anything)

## Patrones avanzados:
- `case valor1 | valor2:` → Múltiples valores
- `case [x, y]:` → Desempaquetar listas
- `case {"key": value}:` → Match en diccionarios',
  '[
    {"title": "Día de la semana", "code": "dia = 3\n\nmatch dia:\n    case 1:\n        nombre = \"Lunes\"\n    case 2:\n        nombre = \"Martes\"\n    case 3:\n        nombre = \"Miércoles\"\n    case 4:\n        nombre = \"Jueves\"\n    case 5:\n        nombre = \"Viernes\"\n    case 6 | 7:\n        nombre = \"Fin de semana\"\n    case _:\n        nombre = \"Día inválido\"\n\nprint(f\"Día {dia}: {nombre}\")", "explanation": "El | permite agrupar varios casos. El _ es el caso por defecto."},
    {"title": "Comando de juego", "code": "comando = \"atacar\"\nvida_enemigo = 100\n\nmatch comando:\n    case \"atacar\":\n        dano = 25\n        vida_enemigo -= dano\n        print(f\"⚔️ Atacaste! Daño: {dano}\")\n    case \"defender\":\n        print(\"🛡️ Te defiendes del siguiente ataque\")\n    case \"curar\":\n        print(\"💚 Recuperas 30 puntos de vida\")\n    case \"huir\":\n        print(\"🏃 Intentas escapar...\")\n    case _:\n        print(\"❓ Comando no reconocido\")\n\nprint(f\"Vida enemigo: {vida_enemigo}\")", "explanation": "Match/case es perfecto para sistemas de comandos en juegos"}
  ]',
  '[
    {"title": "Traductor de HTTP", "description": "Dado un código HTTP (200, 404, 500, etc.), muestra su significado usando match/case", "starter_code": "codigo = 404\n\nmatch codigo:\n    case 200:\n        mensaje = \"OK - Éxito\"\n    # Agrega más casos: 301, 404, 500, 503\n    case _:\n        mensaje = \"Código desconocido\"\n\nprint(f\"HTTP {codigo}: {mensaje}\")", "expected_output": "HTTP 404: No encontrado", "hints": ["301 = Redireccionado", "404 = No encontrado", "500 = Error del servidor", "503 = Servicio no disponible"]}
  ]',
  2, 'medium', 12
);

-- =========================================================
-- PYTHON LESSONS - Module 3: Bucles
-- =========================================================

INSERT INTO simulator_lessons (module_id, slug, title, description, theory, examples, challenges, sort_order, difficulty, estimated_minutes)
VALUES
(
  (SELECT id FROM simulator_modules WHERE slug='bucles' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'for-loop',
  'Bucle For',
  'Repite acciones un número definido de veces con for',
  '# El Bucle For

## ¿Cuándo usar for?
Usa `for` cuando **sabes cuántas veces** quieres repetir algo, o cuando quieres recorrer una colección de elementos.

## Sintaxis:
```python
for variable in iterable:
    # código que se repite
```

## range() - Generar secuencias de números:
- `range(5)` → 0, 1, 2, 3, 4
- `range(2, 8)` → 2, 3, 4, 5, 6, 7
- `range(0, 20, 5)` → 0, 5, 10, 15
- `range(10, 0, -1)` → 10, 9, 8, ... 1

## Iterar sobre colecciones:
```python
for fruta in ["manzana", "banana", "naranja"]:
    print(fruta)
```

## enumerate() - Índice + valor:
```python
for i, fruta in enumerate(frutas):
    print(f"{i}: {fruta}")
```',
  '[
    {"title": "Tabla de multiplicar", "code": "numero = 7\nprint(f\"📊 Tabla del {numero}\")\nprint(\"-\" * 20)\n\nfor i in range(1, 13):\n    resultado = numero * i\n    print(f\"{numero} × {i:2d} = {resultado:3d}\")", "explanation": ":2d y :3d formatean los números con ancho fijo para alinear"},
    {"title": "Patrón de estrellas", "code": "n = 5\nprint(\"Triángulo:\")\nfor i in range(1, n + 1):\n    print(\"⭐\" * i)\n\nprint(\"\\nTriángulo invertido:\")\nfor i in range(n, 0, -1):\n    print(\"⭐\" * i)\n\nprint(\"\\nDiamante:\")\nfor i in range(1, n + 1):\n    print(\" \" * (n - i) + \"⭐\" * (2*i - 1))\nfor i in range(n - 1, 0, -1):\n    print(\" \" * (n - i) + \"⭐\" * (2*i - 1))", "explanation": "Multiplicar strings y controlar espacios crea patrones visuales"},
    {"title": "Suma acumulativa", "code": "numeros = [10, 25, 8, 42, 15, 33]\n\nsuma = 0\nmaximo = numeros[0]\nminimo = numeros[0]\n\nfor num in numeros:\n    suma += num\n    if num > maximo:\n        maximo = num\n    if num < minimo:\n        minimo = num\n\npromedio = suma / len(numeros)\n\nprint(f\"Números: {numeros}\")\nprint(f\"Suma: {suma}\")\nprint(f\"Promedio: {promedio:.1f}\")\nprint(f\"Máximo: {maximo}\")\nprint(f\"Mínimo: {minimo}\")", "explanation": "El patrón acumulador es fundamental: inicializar variable, actualizar en cada iteración"}
  ]',
  '[
    {"title": "FizzBuzz", "description": "Del 1 al 30: si es divisible por 3 imprime Fizz, por 5 imprime Buzz, por ambos FizzBuzz, sino el número.", "starter_code": "for i in range(1, 31):\n    if i % 3 == 0 and i % 5 == 0:\n        print(\"FizzBuzz\")\n    # Completa los demás casos\n    else:\n        print(i)", "expected_output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n...", "hints": ["Verifica primero el caso de ambos (% 15 o % 3 and % 5)", "Luego % 3 para Fizz", "Luego % 5 para Buzz", "El orden importa!"]},
    {"title": "Números primos", "description": "Encuentra todos los números primos del 2 al 50.", "starter_code": "print(\"Números primos del 2 al 50:\")\n\nfor num in range(2, 51):\n    es_primo = True\n    for i in range(2, int(num**0.5) + 1):\n        if num % i == 0:\n            es_primo = False\n            break\n    if es_primo:\n        print(num, end=\" \")", "expected_output": "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47", "hints": ["Un primo solo es divisible por 1 y sí mismo", "Solo necesitas verificar hasta la raíz cuadrada", "break sale del bucle interno cuando encuentras un divisor"]}
  ]',
  1, 'easy', 15
),
(
  (SELECT id FROM simulator_modules WHERE slug='bucles' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'while-loop',
  'Bucle While',
  'Repite mientras una condición sea verdadera',
  '# El Bucle While

## ¿Cuándo usar while?
Usa `while` cuando **no sabes cuántas veces** necesitas repetir, y quieres continuar hasta que una condición cambie.

## Sintaxis:
```python
while condición:
    # código que se repite
    # ¡Importante! Algo debe cambiar la condición
```

## ⚠️ Bucle infinito
Si la condición nunca se vuelve False, el programa se queda atrapado para siempre. Siempre asegúrate de que algo modifique la condición.

## break y continue:
- `break` → Sale completamente del bucle
- `continue` → Salta a la siguiente iteración

## while True + break:
Un patrón muy común para menús y juegos:
```python
while True:
    opcion = input("Elige (q para salir): ")
    if opcion == "q":
        break
    # procesar opción
```',
  '[
    {"title": "Cuenta regresiva", "code": "import time\n\ncontador = 10\nprint(\"🚀 Cuenta regresiva:\")\n\nwhile contador > 0:\n    print(f\"  {contador}...\")\n    contador -= 1\n\nprint(\"🎉 ¡DESPEGUE!\")", "explanation": "El contador disminuye en cada iteración. Cuando llega a 0, la condición es False y el bucle termina."},
    {"title": "Juego de adivinanza", "code": "import random\n\nnumero_secreto = random.randint(1, 20)\nintentos = 0\nmax_intentos = 5\n\nprint(\"🎯 Adivina el número (1-20)\")\nprint(f\"Tienes {max_intentos} intentos\")\n\nwhile intentos < max_intentos:\n    intentos += 1\n    intento = random.randint(1, 20)  # Simulamos input\n    print(f\"\\nIntento {intentos}: {intento}\")\n    \n    if intento == numero_secreto:\n        print(f\"🎉 ¡Correcto! Lo lograste en {intentos} intentos\")\n        break\n    elif intento < numero_secreto:\n        print(\"📈 Más alto...\")\n    else:\n        print(\"📉 Más bajo...\")\nelse:\n    print(f\"\\n😢 Se acabaron los intentos. Era {numero_secreto}\")", "explanation": "El else del while se ejecuta solo si el bucle termina sin break. Patrón perfecto para juegos."},
    {"title": "Validación de entrada", "code": "# Simular validación\npassword = \"\"\nintentos = 0\npassword_correcta = \"python123\"\n\npasswords_intentadas = [\"hola\", \"123456\", \"python123\"]\n\nwhile intentos < len(passwords_intentadas):\n    password = passwords_intentadas[intentos]\n    print(f\"Intento: {password}\")\n    \n    if password == password_correcta:\n        print(\"✅ Acceso concedido\")\n        break\n    else:\n        print(\"❌ Contraseña incorrecta\")\n        intentos += 1\nelse:\n    print(\"🔒 Cuenta bloqueada\")", "explanation": "Patrón de validación: intentar hasta acertar o agotar intentos"}
  ]',
  '[
    {"title": "Suma hasta N", "description": "Suma todos los números del 1 hasta que la suma supere 100. ¿En qué número se pasa?", "starter_code": "suma = 0\nnumero = 0\n\nwhile suma <= 100:\n    numero += 1\n    suma += numero\n\nprint(f\"Al sumar hasta {numero}, el total es {suma}\")", "expected_output": "Al sumar hasta 14, el total es 105", "hints": ["Incrementa el número y súmalo en cada iteración", "La condición del while verifica si ya superó 100"]}
  ]',
  2, 'medium', 15
);

-- =========================================================
-- PYTHON LESSONS - Module 4: Funciones
-- =========================================================

INSERT INTO simulator_lessons (module_id, slug, title, description, theory, examples, challenges, sort_order, difficulty, estimated_minutes)
VALUES
(
  (SELECT id FROM simulator_modules WHERE slug='funciones' AND course_id=(SELECT id FROM simulator_courses WHERE slug='python')),
  'definir-funciones',
  'Definir y Llamar Funciones',
  'Crea bloques de código reutilizables con def',
  '# Funciones en Python

## ¿Qué es una función?
Una función es un **bloque de código reutilizable** que realiza una tarea específica. En vez de repetir código, lo encapsulas en una función y la llamas cuando la necesitas.

## Definir una función:
```python
def nombre_funcion(parametros):
    """Documentación (docstring)"""
    # código
    return resultado
```

## Anatomía:
- `def` → Palabra clave para definir
- `nombre` → Nombre descriptivo (snake_case)
- `(parametros)` → Valores que recibe (opcionales)
- `return` → Valor que devuelve (opcional)

## Parámetros vs Argumentos:
- **Parámetro**: Variable en la definición
- **Argumento**: Valor que pasas al llamar

## Tipos de parámetros:
- Posicionales: `def f(a, b)`
- Con valor por defecto: `def f(a, b=10)`
- Keyword: `f(a=1, b=2)`
- *args: `def f(*args)` → tupla de argumentos
- **kwargs: `def f(**kwargs)` → diccionario',
  '[
    {"title": "Funciones básicas", "code": "def saludar(nombre, hora=\"mañana\"):\n    \"\"\"Saluda al usuario según la hora\"\"\"\n    if hora == \"mañana\":\n        return f\"☀️ Buenos días, {nombre}!\"\n    elif hora == \"tarde\":\n        return f\"🌤️ Buenas tardes, {nombre}!\"\n    else:\n        return f\"🌙 Buenas noches, {nombre}!\"\n\n# Llamar la función\nprint(saludar(\"Ana\"))\nprint(saludar(\"Carlos\", \"tarde\"))\nprint(saludar(\"María\", \"noche\"))", "explanation": "hora tiene valor por defecto \"mañana\". Si no lo pasas, usa ese valor."},
    {"title": "Funciones con múltiples returns", "code": "def analizar_numero(n):\n    \"\"\"Analiza un número y devuelve información\"\"\"\n    info = {\n        \"valor\": n,\n        \"es_par\": n % 2 == 0,\n        \"es_positivo\": n > 0,\n        \"cuadrado\": n ** 2,\n        \"raiz\": n ** 0.5 if n >= 0 else None\n    }\n    return info\n\n# Usar la función\nresultado = analizar_numero(16)\nprint(f\"Número: {resultado[''valor'']}\")\nprint(f\"¿Es par? {resultado[''es_par'']}\")\nprint(f\"Cuadrado: {resultado[''cuadrado'']}\")\nprint(f\"Raíz: {resultado[''raiz'']}\")", "explanation": "Una función puede devolver cualquier tipo de dato, incluyendo diccionarios con múltiples valores"},
    {"title": "Funciones como bloques de construcción", "code": "def es_primo(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\ndef primos_hasta(limite):\n    return [n for n in range(2, limite+1) if es_primo(n)]\n\ndef suma_primos(limite):\n    return sum(primos_hasta(limite))\n\n# Usar funciones juntas\nprint(f\"Primos hasta 30: {primos_hasta(30)}\")\nprint(f\"Cantidad: {len(primos_hasta(30))}\")\nprint(f\"Suma: {suma_primos(30)}\")", "explanation": "Las funciones se pueden llamar dentro de otras funciones. Esto es composición."}
  ]',
  '[
    {"title": "Calculadora de propinas", "description": "Crea una función calcular_propina(total, porcentaje=15) que devuelva el monto de la propina y el total con propina.", "starter_code": "def calcular_propina(total, porcentaje=15):\n    # Calcula la propina\n    propina = \n    total_con_propina = \n    return propina, total_con_propina\n\n# Prueba\np, t = calcular_propina(50)\nprint(f\"Propina: ${p:.2f}\")\nprint(f\"Total: ${t:.2f}\")", "expected_output": "Propina: $7.50\nTotal: $57.50", "hints": ["propina = total * porcentaje / 100", "total_con_propina = total + propina", "Puedes retornar múltiples valores separados por coma"]}
  ]',
  1, 'medium', 15
);

-- =========================================================
-- HACKING ÉTICO MODULES
-- =========================================================

INSERT INTO simulator_modules (course_id, slug, title, description, icon, sort_order)
VALUES
  ((SELECT id FROM simulator_courses WHERE slug='hacking-etico'), 'linux-basico', 'Fundamentos de Linux', 'Terminal, sistema de archivos, permisos y comandos esenciales', '🐧', 1),
  ((SELECT id FROM simulator_courses WHERE slug='hacking-etico'), 'redes', 'Redes y Protocolos', 'TCP/IP, DNS, HTTP, puertos y análisis de tráfico', '🌐', 2),
  ((SELECT id FROM simulator_courses WHERE slug='hacking-etico'), 'criptografia', 'Criptografía', 'Cifrado, hashing, claves públicas y seguridad de datos', '🔐', 3),
  ((SELECT id FROM simulator_courses WHERE slug='hacking-etico'), 'reconocimiento', 'Reconocimiento', 'OSINT, escaneo de puertos, fingerprinting y gathering', '🔍', 4),
  ((SELECT id FROM simulator_courses WHERE slug='hacking-etico'), 'seguridad-web', 'Seguridad Web', 'XSS, SQL Injection, CSRF y vulnerabilidades comunes', '🕸️', 5),
  ((SELECT id FROM simulator_courses WHERE slug='hacking-etico'), 'forense', 'Análisis Forense', 'Recuperación de datos, logs, metadata y evidencia digital', '🔬', 6),
  ((SELECT id FROM simulator_courses WHERE slug='hacking-etico'), 'defensa', 'Defensa y Hardening', 'Firewalls, IDS/IPS, hardening de sistemas y buenas prácticas', '🛡️', 7)
ON CONFLICT (course_id, slug) DO NOTHING;

-- =========================================================
-- HACKING LESSONS - Module 1: Linux
-- =========================================================

INSERT INTO simulator_lessons (module_id, slug, title, description, theory, examples, challenges, sort_order, difficulty, estimated_minutes)
VALUES
(
  (SELECT id FROM simulator_modules WHERE slug='linux-basico' AND course_id=(SELECT id FROM simulator_courses WHERE slug='hacking-etico')),
  'terminal-comandos',
  'La Terminal y Comandos Básicos',
  'Domina la terminal de Linux: navegación, archivos y permisos',
  '# La Terminal de Linux

## ¿Por qué Linux para Hacking Ético?
Linux es el sistema operativo preferido por profesionales de ciberseguridad porque:
- **Control total** del sistema
- **Herramientas nativas** de seguridad
- **Open source** - puedes ver y modificar todo
- La mayoría de servidores del mundo usan Linux

## El Shell (Bash)
La terminal es tu interfaz con el sistema. El prompt típico:
```
usuario@hostname:~$
```
- `usuario` → Tu nombre de usuario
- `hostname` → Nombre del equipo
- `~` → Directorio actual (~ = home)
- `$` → Usuario normal (`#` = root/admin)

## Comandos de Navegación:
| Comando | Función | Ejemplo |
|---------|---------|---------|
| `pwd` | Directorio actual | `pwd` → `/home/usuario` |
| `ls` | Listar archivos | `ls -la` |
| `cd` | Cambiar directorio | `cd /etc` |
| `mkdir` | Crear carpeta | `mkdir proyecto` |
| `touch` | Crear archivo | `touch notas.txt` |
| `rm` | Eliminar | `rm archivo.txt` |
| `cp` | Copiar | `cp origen destino` |
| `mv` | Mover/Renombrar | `mv viejo.txt nuevo.txt` |

## Rutas:
- **Absoluta**: `/home/usuario/documentos` (desde la raíz)
- **Relativa**: `./documentos` o `../carpeta_arriba`

## Comodines:
- `*` → Cualquier texto: `*.txt` = todos los .txt
- `?` → Un carácter: `archivo?.txt`',
  '[
    {"title": "Navegación básica", "code": "pwd\nls -la\ncd /home/usuario\nls\nmkdir mi_proyecto\ncd mi_proyecto\ntouch README.md\ntouch main.py\nls -la", "explanation": "pwd muestra dónde estás, ls lista contenido, cd cambia directorio, mkdir crea carpetas, touch crea archivos"},
    {"title": "Permisos de archivos", "code": "ls -la\n# -rw-r--r-- 1 usuario grupo 1234 Jun 15 10:30 archivo.txt\n# Formato: [tipo][dueño][grupo][otros]\n# r=leer, w=escribir, x=ejecutar\n\nchmod 755 script.sh   # rwxr-xr-x\nchmod 644 datos.txt   # rw-r--r--\nchmod 600 secreto.txt # rw-------", "explanation": "Los 3 dígitos son: dueño, grupo, otros. 7=rwx, 6=rw-, 5=r-x, 4=r--"},
    {"title": "Pipes y redirección", "code": "# Pipe (|) envía la salida de un comando a otro\nls -la | grep .txt\ncat /etc/passwd | wc -l\nhistory | grep ssh\n\n# Redirección (> y >>)\necho \"Hola\" > archivo.txt    # Sobrescribe\necho \"Mundo\" >> archivo.txt  # Agrega al final\ncat archivo.txt\n\n# Buscar texto\ngrep -r \"password\" /etc/\nfind / -name \"*.conf\" -type f", "explanation": "Los pipes son fundamentales en Linux. Permiten encadenar comandos como bloques de construcción."}
  ]',
  '[
    {"title": "Crear estructura de proyecto", "description": "Crea la siguiente estructura usando solo comandos:\nproyecto/\n├── src/\n│   ├── main.py\n│   └── utils.py\n├── tests/\n│   └── test_main.py\n└── README.md", "starter_code": "mkdir proyecto\ncd proyecto\n# Crea las subcarpetas y archivos...", "expected_output": "Estructura creada correctamente", "hints": ["mkdir -p crea carpetas anidadas: mkdir -p src tests", "touch src/main.py src/utils.py", "touch tests/test_main.py", "touch README.md"]},
    {"title": "Encontrar archivos sospechosos", "description": "Usa find y grep para localizar archivos .log que contengan la palabra ERROR en /var/log/", "starter_code": "# Busca archivos .log\nfind /var/log -name \"*.log\"\n\n# Busca ERROR dentro de esos archivos\n# Tu comando aquí...", "expected_output": "Archivos con ERROR encontrados", "hints": ["grep -r \"ERROR\" /var/log/", "O combina: find /var/log -name \"*.log\" -exec grep -l \"ERROR\" {} \\;", "grep -l solo muestra nombres de archivo"]}
  ]',
  1, 'easy', 15
),
(
  (SELECT id FROM simulator_modules WHERE slug='linux-basico' AND course_id=(SELECT id FROM simulator_courses WHERE slug='hacking-etico')),
  'usuarios-procesos',
  'Usuarios, Procesos y Servicios',
  'Gestión de usuarios, procesos activos y servicios del sistema',
  '# Usuarios, Procesos y Servicios

## Gestión de Usuarios
Linux es multiusuario. Cada usuario tiene permisos específicos.

### Comandos de usuario:
| Comando | Función |
|---------|---------|
| `whoami` | Tu usuario actual |
| `id` | UID, GID y grupos |
| `sudo` | Ejecutar como root |
| `su - usuario` | Cambiar de usuario |
| `passwd` | Cambiar contraseña |

### Archivos importantes:
- `/etc/passwd` → Lista de usuarios
- `/etc/shadow` → Contraseñas (hasheadas)
- `/etc/group` → Grupos del sistema

## Procesos
Todo lo que se ejecuta en Linux es un **proceso** con un PID (Process ID).

### Comandos de procesos:
| Comando | Función |
|---------|---------|
| `ps aux` | Lista todos los procesos |
| `top` / `htop` | Monitor en tiempo real |
| `kill PID` | Terminar proceso |
| `kill -9 PID` | Forzar terminación |
| `bg` / `fg` | Segundo/primer plano |

## Servicios (Daemons)
Programas que corren en segundo plano:
```bash
systemctl status nginx
systemctl start ssh
systemctl stop apache2
```

## ¿Por qué es importante para seguridad?
- Identificar procesos sospechosos
- Detectar usuarios no autorizados
- Auditar servicios expuestos',
  '[
    {"title": "Investigar el sistema", "code": "whoami\nid\ncat /etc/passwd | grep -v nologin | grep -v false\nps aux | head -20\nnetstat -tlnp", "explanation": "Estos comandos revelan: quién eres, qué usuarios existen, qué procesos corren y qué puertos están abiertos"},
    {"title": "Monitoreo de procesos", "code": "# Ver procesos ordenados por uso de CPU\nps aux --sort=-%cpu | head -10\n\n# Ver conexiones de red activas\nss -tunap\n\n# Ver últimos logins\nlast -10\n\n# Ver intentos fallidos\nlastb -10", "explanation": "Monitorear procesos y conexiones es esencial para detectar actividad sospechosa"}
  ]',
  '[
    {"title": "Auditoría de usuarios", "description": "Examina /etc/passwd para encontrar: cuántos usuarios hay, cuáles tienen shell bash, y si hay algún usuario con UID 0 (root) además de root.", "starter_code": "# Contar usuarios\ncat /etc/passwd | wc -l\n\n# Usuarios con bash\ncat /etc/passwd | grep bash\n\n# Usuarios con UID 0 (peligroso si hay más de 1)\n# Tu comando aquí...", "expected_output": "Auditoría completada", "hints": ["awk -F: para separar campos del passwd", "El UID es el tercer campo: awk -F: ''$3==0{print $1}'' /etc/passwd", "Si hay más de un usuario con UID 0, es una señal de alarma"]}
  ]',
  2, 'medium', 12
);

-- =========================================================
-- HACKING LESSONS - Module 2: Redes
-- =========================================================

INSERT INTO simulator_lessons (module_id, slug, title, description, theory, examples, challenges, sort_order, difficulty, estimated_minutes)
VALUES
(
  (SELECT id FROM simulator_modules WHERE slug='redes' AND course_id=(SELECT id FROM simulator_courses WHERE slug='hacking-etico')),
  'tcp-ip',
  'Modelo TCP/IP y Protocolos',
  'Entiende cómo viajan los datos por Internet',
  '# Modelo TCP/IP y Protocolos

## ¿Cómo funciona Internet?
Cuando visitas una web, los datos viajan en **paquetes** a través de múltiples capas de protocolos.

## Las 4 Capas TCP/IP:

### 4️⃣ Capa de Aplicación
Protocolos que usas directamente:
- **HTTP/HTTPS** (puerto 80/443) → Web
- **DNS** (puerto 53) → Nombres de dominio
- **FTP** (puerto 21) → Transferencia de archivos
- **SSH** (puerto 22) → Acceso remoto seguro
- **SMTP** (puerto 25) → Email

### 3️⃣ Capa de Transporte
- **TCP** → Confiable, ordenado (web, email)
- **UDP** → Rápido, sin garantía (video, gaming)

### 2️⃣ Capa de Internet
- **IP** → Direccionamiento (IPv4: 192.168.1.1)
- **ICMP** → Diagnóstico (ping)

### 1️⃣ Capa de Acceso a Red
- Ethernet, WiFi, hardware

## Direcciones IP:
- **Privadas**: 192.168.x.x, 10.x.x.x, 172.16-31.x.x
- **Pública**: Tu IP en Internet
- **Loopback**: 127.0.0.1 (tú mismo)

## Puertos importantes para seguridad:
| Puerto | Servicio | Riesgo |
|--------|----------|--------|
| 21 | FTP | Credenciales en texto plano |
| 22 | SSH | Fuerza bruta |
| 23 | Telnet | Sin encriptación |
| 80 | HTTP | Sin encriptación |
| 443 | HTTPS | Relativamente seguro |
| 3306 | MySQL | Base de datos expuesta |
| 3389 | RDP | Escritorio remoto |',
  '[
    {"title": "Comandos de red básicos", "code": "# Ver tu configuración de red\nifconfig\n# o en sistemas nuevos:\nip addr show\n\n# Probar conectividad\nping -c 4 google.com\n\n# Ver ruta de los paquetes\ntraceroute google.com\n\n# Ver DNS\nnslookup google.com\ndig google.com", "explanation": "ifconfig muestra tu IP, ping verifica conexión, traceroute muestra el camino que toman los paquetes"},
    {"title": "Escaneo de puertos con Nmap", "code": "# Escaneo básico\nnmap 192.168.1.1\n\n# Escaneo completo con versiones\nnmap -sV -p- 192.168.1.1\n\n# Escaneo sigiloso (SYN)\nnmap -sS 192.168.1.0/24\n\n# Detectar SO\nnmap -O 192.168.1.1\n\n# Escaneo de vulnerabilidades\nnmap --script vuln 192.168.1.1", "explanation": "Nmap es LA herramienta de reconocimiento de red. -sV detecta versiones, -p- escanea todos los puertos, -sS es sigiloso"},
    {"title": "Captura de tráfico", "code": "# Capturar tráfico con tcpdump\ntcpdump -i eth0 -c 10\n\n# Solo tráfico HTTP\ntcpdump -i eth0 port 80\n\n# Guardar captura\ntcpdump -i eth0 -w captura.pcap\n\n# Analizar con Wireshark (GUI)\nwireshark captura.pcap", "explanation": "tcpdump captura paquetes en la terminal. Wireshark permite análisis visual detallado."}
  ]',
  '[
    {"title": "Identificar servicios", "description": "Dado el resultado de un escaneo nmap, identifica qué servicios están corriendo y cuáles representan un riesgo de seguridad.", "starter_code": "# Resultado del escaneo:\n# PORT     STATE  SERVICE\n# 22/tcp   open   ssh\n# 80/tcp   open   http\n# 443/tcp  open   https\n# 3306/tcp open   mysql\n# 8080/tcp open   http-proxy\n\n# ¿Cuáles son riesgosos y por qué?", "expected_output": "MySQL (3306) expuesto = riesgo alto\nHTTP sin HTTPS = datos sin cifrar", "hints": ["MySQL en puerto público es peligroso - base de datos accesible", "El puerto 8080 podría ser un panel de administración", "Verifica que 80 redirija a 443 (HTTPS)"]}
  ]',
  1, 'medium', 20
);

-- =========================================================
-- HACKING LESSONS - Module 3: Criptografía
-- =========================================================

INSERT INTO simulator_lessons (module_id, slug, title, description, theory, examples, challenges, sort_order, difficulty, estimated_minutes)
VALUES
(
  (SELECT id FROM simulator_modules WHERE slug='criptografia' AND course_id=(SELECT id FROM simulator_courses WHERE slug='hacking-etico')),
  'fundamentos-crypto',
  'Fundamentos de Criptografía',
  'Cifrado simétrico, asimétrico, hashing y su aplicación en seguridad',
  '# Fundamentos de Criptografía

## ¿Qué es la Criptografía?
Es la ciencia de **proteger información** transformándola en algo ilegible para quienes no tienen la clave.

## Conceptos clave:
- **Texto plano** → Mensaje original
- **Texto cifrado** → Mensaje encriptado
- **Clave** → Secreto para cifrar/descifrar
- **Algoritmo** → Método de transformación

## Tipos de Cifrado:

### 🔑 Cifrado Simétrico
Una misma clave para cifrar Y descifrar.
- **AES-256** → Estándar actual, muy seguro
- **DES** → Antiguo, inseguro (56 bits)
- Problema: ¿Cómo compartir la clave de forma segura?

### 🔐 Cifrado Asimétrico
Par de claves: pública (cifrar) + privada (descifrar).
- **RSA** → El más usado
- **ECC** → Más eficiente, claves más cortas
- Resuelve el problema de distribución de claves

### #️⃣ Hashing
Función unidireccional: convierte datos en un "fingerprint" fijo.
- **SHA-256** → 256 bits, seguro
- **MD5** → 128 bits, ¡INSEGURO! (colisiones)
- **bcrypt** → Para contraseñas (incluye salt)
- No se puede "deshashear" (solo comparar)

## Cifrado César (Histórico):
El más simple: desplaza cada letra N posiciones.
```
A B C D E F G ... (shift=3)
D E F G H I J ...
"HOLA" → "KROD"
```

## Aplicaciones reales:
- HTTPS → TLS con AES + RSA
- Contraseñas → bcrypt/argon2 + salt
- Bitcoin → SHA-256 + ECDSA
- WhatsApp → Signal Protocol (E2E)',
  '[
    {"title": "Cifrado César en Python", "code": "def cifrar_cesar(texto, desplazamiento):\n    resultado = \"\"\n    for char in texto:\n        if char.isalpha():\n            base = ord(''A'') if char.isupper() else ord(''a'')\n            resultado += chr((ord(char) - base + desplazamiento) % 26 + base)\n        else:\n            resultado += char\n    return resultado\n\nmensaje = \"Hacking Etico es genial\"\ncifrado = cifrar_cesar(mensaje, 7)\ndescifrado = cifrar_cesar(cifrado, -7)\n\nprint(f\"Original:   {mensaje}\")\nprint(f\"Cifrado:    {cifrado}\")\nprint(f\"Descifrado: {descifrado}\")", "explanation": "El cifrado César desplaza cada letra. Para descifrar, se desplaza en dirección opuesta."},
    {"title": "Hashing con hashlib", "code": "import hashlib\n\n# Hashear una contraseña\npassword = \"mi_password_segura\"\n\nmd5_hash = hashlib.md5(password.encode()).hexdigest()\nsha256_hash = hashlib.sha256(password.encode()).hexdigest()\n\nprint(f\"Texto: {password}\")\nprint(f\"MD5:    {md5_hash}\")\nprint(f\"SHA256: {sha256_hash}\")\nprint(f\"\\nLongitud MD5: {len(md5_hash)} chars\")\nprint(f\"Longitud SHA256: {len(sha256_hash)} chars\")\n\n# Verificar integridad\nprint(f\"\\n¿Match? {sha256_hash == hashlib.sha256(password.encode()).hexdigest()}\")", "explanation": "SHA-256 produce siempre 64 caracteres hex. El mismo input siempre da el mismo hash."},
    {"title": "Fuerza bruta en César", "code": "texto_cifrado = \"Krod Pxqgr\"\n\nprint(\"Intentando todas las combinaciones:\")\nprint(\"-\" * 40)\n\nfor shift in range(1, 26):\n    descifrado = \"\"\n    for char in texto_cifrado:\n        if char.isalpha():\n            base = ord(''A'') if char.isupper() else ord(''a'')\n            descifrado += chr((ord(char) - base - shift) % 26 + base)\n        else:\n            descifrado += char\n    print(f\"Shift {shift:2d}: {descifrado}\")", "explanation": "Con solo 25 posibilidades, el cifrado César se rompe fácilmente probando todas. Por eso es inseguro."}
  ]',
  '[
    {"title": "Descifrar mensaje", "description": "El mensaje \"Wklv lv d vhfuhw phvvdjh\" fue cifrado con César. Encuentra el desplazamiento y descífralo.", "starter_code": "cifrado = \"Wklv lv d vhfuhw phvvdjh\"\n\n# Prueba diferentes desplazamientos\nfor shift in range(1, 26):\n    # Descifra con este shift\n    pass\n\n# ¿Cuál tiene sentido en inglés?", "expected_output": "Shift 3: This is a secret message", "hints": ["El shift es 3 (el más clásico de César)", "Prueba restando el shift a cada letra", "Busca la salida que tenga sentido en inglés"]},
    {"title": "Verificador de integridad", "description": "Crea una función que reciba un archivo (texto) y devuelva su hash SHA-256. Luego verifica si el archivo fue modificado.", "starter_code": "import hashlib\n\ndef calcular_hash(contenido):\n    # Retorna el SHA-256 del contenido\n    pass\n\n# Contenido original\noriginal = \"Datos importantes del sistema\"\nhash_original = calcular_hash(original)\n\n# ¿Fue modificado?\nactual = \"Datos importantes del sistema\"\nhash_actual = calcular_hash(actual)\n\nprint(f\"Integridad: {''OK'' if hash_original == hash_actual else ''COMPROMETIDO''}\")", "expected_output": "Integridad: OK", "hints": ["hashlib.sha256(texto.encode()).hexdigest()", "Si el hash cambia, el contenido fue modificado"]}
  ]',
  1, 'medium', 20
);
