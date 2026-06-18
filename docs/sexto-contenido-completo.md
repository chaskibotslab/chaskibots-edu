# 📚 SEXTO GRADO - ROBÓTICA: Contenido Completo

## Información General
- **Nivel:** sexto-egb
- **Programa:** robotica
- **Total lecciones:** 33

---

# MÓDULO 1: PROGRAMACIÓN CON ROBOTS (Lecciones 1-9)

## Lección 1: Prueba de entrada - Robótica
**Tipo:** activity | **Duración:** 15 min | **Imágenes:** page-07.png

### Contenido:
Antes de comenzar nuestro viaje por el mundo de la robótica, vamos a descubrir cuánto sabes. Esta evaluación diagnóstica nos ayudará a conocer tu punto de partida.

### Objetivos:
- Identificar conocimientos previos sobre robótica
- Familiarizarte con conceptos básicos de programación
- Conocer el robot Edison y EdScratch

### Preguntas de ejemplo:
1. ¿Qué es EdScratch? (Lenguaje de programación basado en bloques)
2. ¿Qué hace un sensor infrarrojo? (Detecta obstáculos)
3. ¿Qué es Scratch? (Lenguaje visual creado por MIT)

### 💡 Tip:
No te preocupes si no conoces todas las respuestas. ¡Aprenderemos juntos!

---

## Lección 2: Introducción a EdScratch
**Tipo:** video | **Duración:** 20 min | **Imágenes:** page-09.png, page-13.png

### Contenido:
EdScratch es un lenguaje de programación visual diseñado especialmente para el robot Edison. Funciona con bloques que se conectan como piezas de LEGO, haciendo la programación fácil y divertida.

### ¿Qué aprenderás?
- Qué es la programación por bloques
- Cómo funciona EdScratch
- La interfaz del programa
- Tus primeros bloques de código

### Conceptos clave:
- **Bloque:** Instrucción visual que le dice al robot qué hacer
- **Programa:** Conjunto de bloques conectados
- **Evento:** Acción que inicia el programa (ej: presionar botón)

### 🎯 Actividad práctica:
1. Ingresa a https://educatemas.com/Scb01
2. Explora la interfaz de EdScratch
3. Identifica las categorías de bloques
4. Arrastra tu primer bloque al área de trabajo

### 💡 Tip:
Los bloques del mismo color pertenecen a la misma categoría. ¡Explora cada color!

---

## Lección 3: Conociendo el Robot Edison
**Tipo:** video | **Duración:** 15 min | **Imágenes:** page-11.png, page-12.png

### Contenido:
Edison es un robot educativo compacto y versátil. Tiene sensores, LEDs, motores y un cerebro programable. ¡Vamos a conocer todas sus partes!

### Componentes del Edison:
1. **LEDs rojos:** Izquierdo y derecho, indican estado
2. **LED infrarrojo:** Emite luz invisible para detectar obstáculos
3. **Sensores de luz:** Detectan claridad/oscuridad
4. **Botón grabar:** Para cargar programas
5. **Motores:** Mueven las ruedas
6. **Altavoz:** Emite sonidos y pitidos

### ¿Qué es la luz infrarroja?
La luz infrarroja es invisible para nosotros pero los sensores la detectan. Se usa para:
- Detectar obstáculos
- Controles remotos de TV
- Cámaras de visión nocturna

### 🔬 Experimento:
Apunta un control remoto de TV hacia la cámara de tu celular y presiona un botón. ¡Verás la luz infrarroja!

### 💡 Tip:
El Edison puede detectar objetos hasta 10cm de distancia con su sensor IR.

---

## Lección 4: Interfaz de EdScratch
**Tipo:** tutorial | **Duración:** 20 min | **Imágenes:** page-13.png

### Contenido:
Vamos a explorar cada parte de la interfaz de EdScratch para que te sientas cómodo programando.

### Áreas de la interfaz:
1. **Paleta de bloques:** Izquierda - todos los bloques disponibles
2. **Área de programación:** Centro - donde armas tu código
3. **Menú superior:** Guardar, cargar, programar Edison
4. **Botón Program Edison:** Envía el código al robot

### Categorías de bloques:
- 🟡 **Eventos:** Inicio del programa
- 🔵 **Movimiento:** Avanzar, girar, detenerse
- 🟢 **Sonido:** Pitidos y melodías
- 🟣 **Luz:** Encender/apagar LEDs
- 🟠 **Control:** Repetir, esperar, condiciones
- 🔴 **Sensores:** Detectar obstáculos, luz

### 🎯 Práctica guiada:
1. Abre EdScratch
2. Arrastra el bloque "Start" al área
3. Conecta un bloque "beep"
4. Conecta un bloque "drive forward"
5. ¡Tu primer programa está listo!

---

## Lección 5: Primer programa con Edison
**Tipo:** activity | **Duración:** 25 min | **Imágenes:** page-13.png, page-14.png

### Contenido:
¡Es hora de programar! Crearemos un programa que haga que Edison emita tres pitidos y luego avance.

### Programa paso a paso:

```
[Start]
   ↓
[repeat 3]
   [beep]
   [wait 0.5 sec]
[end repeat]
   ↓
[turn obstacle detection beam on]
   ↓
[drive forward at speed 5]
```

### Instrucciones:
1. Arrastra el bloque **Start**
2. Agrega **repeat (3)**
3. Dentro del repeat: **beep** y **wait 0.5 sec**
4. Después del repeat: **turn obstacle detection beam on**
5. Finalmente: **drive forward at speed 5**

### Cargar al Edison:
1. Conecta el cable EdComm al Edison y a tu computador
2. Sube el volumen de tu computador al máximo
3. Presiona el botón redondo del Edison una vez
4. Haz clic en "Program Edison"

### 💡 Tip:
Si el programa no carga, verifica que el volumen esté al 100%.

---

## Lección 6: Edison en el laberinto
**Tipo:** activity | **Duración:** 30 min | **Imágenes:** page-14.png, page-16.png

### Contenido:
Programaremos a Edison para que avance hasta encontrar un obstáculo, encienda sus LEDs y emita un pitido.

### Programa:

```
[Start]
   ↓
[turn obstacle detection beam on]
   ↓
[repeat until obstacle detected anywhere]
   [set both motors to drive forward at speed 5]
[end repeat]
   ↓
[stop both motors]
[turn left LED on]
[turn right LED on]
[beep]
```

### Conceptos nuevos:
- **repeat until:** Repite hasta que algo suceda
- **obstacle detected:** El sensor detecta un obstáculo
- **stop both motors:** Detiene el movimiento

### 🎯 Desafío:
Crea un laberinto con libros o cajas y prueba tu programa. ¿Edison se detiene correctamente?

### 💡 Tip:
Los objetos oscuros son más difíciles de detectar. Usa objetos claros para mejores resultados.

---

## Lección 7: Evasión de obstáculos
**Tipo:** activity | **Duración:** 30 min | **Imágenes:** page-14.png

### Contenido:
Ahora haremos que Edison no solo detecte obstáculos, sino que los evite girando automáticamente.

### Programa mejorado:

```
[Start]
   ↓
[turn obstacle detection beam on]
   ↓
[forever]
   [if obstacle detected anywhere then]
      [stop both motors]
      [beep]
      [turn left LED on]
      [turn right LED on]
      [spin left for 90 degrees at speed 3]
      [turn left LED off]
      [turn right LED off]
   [end if]
   [set both motors to drive forward at speed 5]
[end forever]
```

### Lógica del programa:
1. Si detecta obstáculo → para, gira 90°
2. Si no hay obstáculo → sigue avanzando
3. Repite infinitamente

### 🎯 Desafío:
Modifica el ángulo de giro. ¿Qué pasa con 45°? ¿Y con 180°?

---

## Lección 8: Conectar Edison al computador
**Tipo:** tutorial | **Duración:** 15 min | **Imágenes:** page-15.png

### Contenido:
Guía paso a paso para conectar tu Edison y cargar programas correctamente.

### Pasos de conexión:
1. **Conecta el cable EdComm** al puerto de audio de tu computador
2. **Conecta el otro extremo** al Edison (puerto lateral)
3. **Sube el volumen** de tu computador al 100%
4. **Presiona el botón redondo** del Edison una vez
5. En EdScratch, haz clic en **"Program Edison"**
6. Espera a que aparezca "Ready" en la ventana
7. Haz clic en **"Program Edison"** en la ventana emergente

### Solución de problemas:
- **No carga:** Verifica el volumen al máximo
- **Error de conexión:** Revisa que el cable esté bien conectado
- **Edison no responde:** Cambia las baterías

### 💡 Tip:
El Edison usa sonido para recibir programas. Por eso necesitas el volumen al máximo.

---

## Lección 9: Práctica - Carrera de evasión
**Tipo:** project | **Duración:** 40 min | **Imágenes:** page-17.png, page-18.png

### Contenido:
¡Competencia en equipos! Programarán a Edison para completar una pista de obstáculos en el menor tiempo.

### Materiales:
- Robot Edison por equipo
- Control remoto (opcional)
- Cinta adhesiva para la pista
- Obstáculos (cajas, bloques, botellas)
- Cronómetro

### Reglas:
1. El robot debe ir de inicio a meta
2. Si choca, se penaliza con +5 segundos
3. Gana el equipo con menor tiempo total

### Procedimiento:
1. Diseñen la pista con curvas y rectas
2. Coloquen obstáculos estratégicamente
3. Programen a Edison para evadir obstáculos
4. Practiquen y mejoren el programa
5. ¡Compitan!

### Reflexión grupal:
- ¿Qué tan eficiente fue tu programa?
- ¿Qué desafíos encontraste?
- ¿Cómo podrías mejorar tu estrategia?

---

# MÓDULO 1 PARTE II: FIGURAS GEOMÉTRICAS (Lecciones 10-15)

## Lección 10: Figuras geométricas con Edison
**Tipo:** video | **Duración:** 20 min | **Imágenes:** page-19.png, page-21.png

### Contenido:
En esta unidad, Edison se convertirá en un artista robótico. Aprenderemos a programarlo para dibujar figuras geométricas precisas.

### ¿Qué aprenderás?
- Relación entre ángulos y figuras
- Programación de movimientos precisos
- Uso de variables para modificar figuras

### Figuras que dibujaremos:
- Cuadrado (4 lados, ángulos de 90°)
- Triángulo equilátero (3 lados, ángulos de 120°)
- Rectángulo (4 lados, 2 pares diferentes)

### Concepto clave: Ángulo externo
Para que Edison gire correctamente, usamos el **ángulo externo**:
- Cuadrado: gira 90°
- Triángulo: gira 120° (no 60°)
- Hexágono: gira 60°

### 💡 Tip:
Fórmula: Ángulo de giro = 360° ÷ número de lados

---

## Lección 11: Matemáticas y robótica
**Tipo:** tutorial | **Duración:** 20 min | **Imágenes:** page-21.png

### Contenido:
La robótica y las matemáticas van de la mano. Aprenderemos la teoría detrás de los movimientos geométricos.

### Conceptos matemáticos:
1. **Perímetro:** Suma de todos los lados
2. **Ángulo interno:** Ángulo dentro de la figura
3. **Ángulo externo:** Ángulo de giro del robot

### Tabla de ángulos:
| Figura | Lados | Ángulo interno | Ángulo de giro |
|--------|-------|----------------|----------------|
| Triángulo | 3 | 60° | 120° |
| Cuadrado | 4 | 90° | 90° |
| Pentágono | 5 | 108° | 72° |
| Hexágono | 6 | 120° | 60° |

### Fórmula mágica:
```
Ángulo de giro = 360° ÷ número de lados
```

### 🎯 Ejercicio:
¿Cuánto debe girar Edison para dibujar un octágono (8 lados)?
Respuesta: 360° ÷ 8 = 45°

---

## Lección 12: Programar un cuadrado
**Tipo:** activity | **Duración:** 25 min | **Imágenes:** page-21.png, page-22.png

### Contenido:
Programaremos a Edison para dibujar un cuadrado perfecto.

### Programa:

```
[Start]
   ↓
[repeat 4]
   [drive forward for 5 cm at speed 3]
   [spin left for 90 degrees at speed 3]
[end repeat]
```

### Explicación:
- **repeat 4:** Un cuadrado tiene 4 lados
- **drive forward 5 cm:** Avanza un lado
- **spin left 90°:** Gira para el siguiente lado

### 🎯 Desafíos:
1. Haz un cuadrado más grande (10 cm por lado)
2. Haz un cuadrado girando a la derecha
3. Haz dos cuadrados seguidos

### 💡 Tip:
Si el cuadrado no cierra bien, ajusta los grados de giro (prueba 89° o 91°).

---

## Lección 13: Programar un triángulo
**Tipo:** activity | **Duración:** 25 min | **Imágenes:** page-22.png

### Contenido:
Ahora dibujaremos un triángulo equilátero (3 lados iguales).

### Programa:

```
[Start]
   ↓
[repeat 3]
   [drive forward for 5 cm at speed 3]
   [spin left for 120 degrees at speed 3]
[end repeat]
```

### ¿Por qué 120° y no 60°?
El ángulo interno del triángulo es 60°, pero Edison gira por el **exterior**:
- Ángulo de giro = 180° - 60° = 120°
- O usando la fórmula: 360° ÷ 3 = 120°

### 🎯 Desafíos:
1. Dibuja un triángulo más grande
2. Dibuja un triángulo girando a la derecha
3. Dibuja una estrella de David (2 triángulos)

---

## Lección 14: Programar un rectángulo
**Tipo:** activity | **Duración:** 25 min | **Imágenes:** page-22.png

### Contenido:
El rectángulo tiene 2 pares de lados diferentes. Necesitamos un programa más elaborado.

### Programa:

```
[Start]
   ↓
[repeat 2]
   [drive forward for 8 cm at speed 3]
   [spin left for 90 degrees at speed 3]
   [drive forward for 4 cm at speed 3]
   [spin left for 90 degrees at speed 3]
[end repeat]
```

### Explicación:
- Lado largo: 8 cm
- Lado corto: 4 cm
- Repetimos 2 veces (largo-corto, largo-corto)

### 🎯 Desafíos:
1. Cambia las proporciones (10 cm x 3 cm)
2. Dibuja una "L" (rectángulo incompleto)
3. Dibuja una casa (cuadrado + triángulo)

---

## Lección 15: Proyecto - Artista robótico
**Tipo:** project | **Duración:** 45 min | **Imágenes:** page-22.png

### Contenido:
¡Proyecto creativo! Diseña y programa una figura o dibujo original usando lo aprendido.

### Ideas de proyectos:
1. **Casa:** Cuadrado + triángulo
2. **Flor:** Varios triángulos desde el centro
3. **Estrella:** 5 triángulos conectados
4. **Iniciales:** Tu nombre con líneas
5. **Robot:** Figuras combinadas

### Pasos del proyecto:
1. Diseña tu figura en papel
2. Calcula los ángulos necesarios
3. Escribe el programa en EdScratch
4. Prueba y ajusta
5. Presenta tu creación

### Rúbrica de evaluación:
- Creatividad del diseño: 25%
- Precisión del dibujo: 25%
- Complejidad del programa: 25%
- Presentación: 25%

---

# MÓDULO 2: EDCRANE - BRAZO ROBÓTICO (Lecciones 16-20)

## Lección 16: Introducción al brazo robótico
**Tipo:** video | **Duración:** 20 min | **Imágenes:** page-31.png

### Contenido:
EdCrane es un brazo robótico que se conecta al Edison. Aprenderemos sobre robótica industrial y automatización.

### ¿Qué es un brazo robótico?
Un brazo robótico imita los movimientos del brazo humano:
- **Base:** Como el hombro, permite girar
- **Brazo:** Como el codo, sube y baja
- **Pinza:** Como la mano, agarra objetos

### Aplicaciones reales:
- Fábricas de automóviles
- Cirugías de precisión
- Almacenes automatizados
- Exploración espacial

### 💡 Dato curioso:
El primer brazo robótico industrial se creó en 1961 y se llamaba "Unimate".

---

## Lección 17: Ensamblaje de EdCrane
**Tipo:** tutorial | **Duración:** 30 min | **Imágenes:** page-32.png, page-33.png

### Contenido:
Guía paso a paso para ensamblar tu brazo robótico EdCrane.

### Piezas necesarias:
- Base del brazo
- Segmentos del brazo (2)
- Pinza
- Servomotores (3)
- Tornillos y conectores
- Robot Edison

### Pasos de ensamblaje:
1. Conecta la base al Edison
2. Ensambla el primer segmento del brazo
3. Conecta el servomotor del codo
4. Ensambla el segundo segmento
5. Instala la pinza
6. Conecta los cables de los servos

### Verificación:
- Mueve cada articulación manualmente
- Verifica que no haya piezas sueltas
- Conecta al Edison y prueba

### 💡 Tip:
No aprietes demasiado los tornillos, podrían dañar el plástico.

---

## Lección 18: Programación del brazo
**Tipo:** activity | **Duración:** 30 min | **Imágenes:** page-34.png

### Contenido:
Aprenderemos a programar los movimientos básicos del brazo robótico.

### Movimientos disponibles:
- **Girar base:** Izquierda/derecha
- **Subir/bajar brazo:** Arriba/abajo
- **Abrir/cerrar pinza:** Agarrar/soltar

### Programa básico:

```
[Start]
   ↓
[set crane arm to position 50]
[wait 1 sec]
[set crane arm to position 0]
[wait 1 sec]
[set crane gripper to open]
[wait 1 sec]
[set crane gripper to closed]
```

### Valores de posición:
- 0 = Posición mínima
- 50 = Posición media
- 100 = Posición máxima

### 🎯 Práctica:
Programa una secuencia de "saludo" con el brazo.

---

## Lección 19: Control de la pinza
**Tipo:** activity | **Duración:** 25 min | **Imágenes:** page-35.png

### Contenido:
La pinza es la "mano" del robot. Aprenderemos a controlarla con precisión.

### Programa para agarrar objeto:

```
[Start]
   ↓
[set crane gripper to open]
[set crane arm to position 30]
[wait 1 sec]
[set crane gripper to closed]
[wait 0.5 sec]
[set crane arm to position 70]
[wait 1 sec]
[set crane base to position 50]
[wait 1 sec]
[set crane arm to position 30]
[set crane gripper to open]
```

### Secuencia:
1. Abrir pinza
2. Bajar brazo
3. Cerrar pinza (agarrar)
4. Subir brazo
5. Girar base
6. Bajar y soltar

### 💡 Tip:
Usa objetos livianos para practicar (cubos de espuma, pelotas pequeñas).

---

## Lección 20: Proyecto - Clasificador de objetos
**Tipo:** project | **Duración:** 45 min | **Imágenes:** page-36.png

### Contenido:
Construiremos un sistema automatizado que clasifica objetos en diferentes contenedores.

### Materiales:
- EdCrane ensamblado
- 3 contenedores pequeños
- Objetos para clasificar
- Cinta para marcar posiciones

### Diseño del sistema:
```
[Zona de entrada] → [EdCrane] → [Contenedor A]
                              → [Contenedor B]
                              → [Contenedor C]
```

### Programa:

```
[Start]
   ↓
[repeat 3]
   // Recoger objeto
   [set crane arm to position 20]
   [set crane gripper to closed]
   [set crane arm to position 80]
   
   // Mover a contenedor
   [set crane base to position X]  // Cambiar X cada vez
   [set crane arm to position 20]
   [set crane gripper to open]
   
   // Volver a inicio
   [set crane arm to position 80]
   [set crane base to position 0]
[end repeat]
```

### 🎯 Desafío avanzado:
Agrega un sensor para detectar el color del objeto y clasificar automáticamente.

---

# MÓDULO 3: SCRATCH (Lecciones 21-25)

## Lección 21: Mis primeros pasos en Scratch
**Tipo:** video | **Duración:** 20 min | **Imágenes:** page-54.png

### Contenido:
Scratch es un lenguaje de programación visual creado por el MIT. ¡Millones de niños lo usan para crear juegos y animaciones!

### ¿Qué es Scratch?
- Creado en 2007 por MIT Media Lab
- Gratuito y en español
- Funciona en navegador web
- Comunidad de millones de usuarios

### Interfaz de Scratch:
1. **Escenario:** Donde ves tu proyecto
2. **Sprites:** Personajes y objetos
3. **Bloques:** Instrucciones de código
4. **Área de código:** Donde programas

### Tu primer proyecto:
1. Ve a https://scratch.mit.edu
2. Haz clic en "Crear"
3. ¡Ya tienes un gato listo para programar!

### 💡 Tip:
Crea una cuenta gratuita para guardar tus proyectos.

---

## Lección 22: Creando animaciones
**Tipo:** activity | **Duración:** 25 min | **Imágenes:** page-55.png

### Contenido:
Haremos que el gato de Scratch camine, hable y cambie de apariencia.

### Programa de animación:

```
[al presionar bandera verde]
   ↓
[repetir 10 veces]
   [mover 10 pasos]
   [siguiente disfraz]
   [esperar 0.1 segundos]
[fin repetir]
   ↓
[decir "¡Hola!" por 2 segundos]
```

### Conceptos:
- **Disfraz:** Diferentes apariencias del sprite
- **Mover pasos:** Desplazamiento horizontal
- **Decir:** Muestra un globo de texto

### 🎯 Desafíos:
1. Haz que el gato camine hacia atrás
2. Agrega un sonido al caminar
3. Cambia el fondo del escenario

---

## Lección 23: Eventos y control
**Tipo:** tutorial | **Duración:** 20 min | **Imágenes:** page-56.png

### Contenido:
Los eventos son acciones que inician el código. El control determina cómo fluye el programa.

### Bloques de eventos:
- **Al presionar bandera verde:** Inicia el programa
- **Al presionar tecla:** Responde al teclado
- **Al hacer clic en sprite:** Responde al mouse

### Bloques de control:
- **Esperar X segundos:** Pausa
- **Repetir X veces:** Bucle finito
- **Por siempre:** Bucle infinito
- **Si... entonces:** Condición

### Programa interactivo:

```
[al presionar tecla flecha derecha]
   [mover 10 pasos]

[al presionar tecla flecha izquierda]
   [mover -10 pasos]

[al presionar tecla espacio]
   [decir "¡Salto!" por 1 segundo]
```

### 🎯 Práctica:
Crea un sprite que se mueva con las 4 flechas del teclado.

---

## Lección 24: Variables y operadores
**Tipo:** tutorial | **Duración:** 25 min | **Imágenes:** page-57.png

### Contenido:
Las variables guardan información que puede cambiar. Los operadores hacen cálculos.

### ¿Qué es una variable?
Una "caja" que guarda un valor:
- **Puntuación:** Guarda los puntos del jugador
- **Vidas:** Cuántas vidas quedan
- **Velocidad:** Qué tan rápido se mueve

### Crear una variable:
1. Ve a "Variables"
2. Haz clic en "Crear una variable"
3. Ponle nombre (ej: "puntos")

### Programa con puntuación:

```
[al presionar bandera verde]
   [fijar puntos a 0]

[al presionar tecla espacio]
   [cambiar puntos por 1]
   [tocar sonido pop]
```

### Operadores:
- **Suma:** puntos + 10
- **Resta:** vidas - 1
- **Comparación:** puntos > 100

---

## Lección 25: Proyecto - Mi primer juego
**Tipo:** project | **Duración:** 45 min | **Imágenes:** page-58.png

### Contenido:
¡Crearemos un juego completo! Un personaje que atrapa objetos que caen.

### Elementos del juego:
1. **Jugador:** Se mueve con flechas
2. **Objetos:** Caen desde arriba
3. **Puntuación:** Aumenta al atrapar
4. **Game Over:** Al perder todas las vidas

### Código del jugador:

```
[al presionar bandera verde]
   [ir a x: 0 y: -150]
   [por siempre]
      [si tecla flecha derecha presionada entonces]
         [cambiar x por 10]
      [fin si]
      [si tecla flecha izquierda presionada entonces]
         [cambiar x por -10]
      [fin si]
   [fin por siempre]
```

### Código del objeto:

```
[al presionar bandera verde]
   [por siempre]
      [ir a x: número al azar entre -200 y 200 y: 180]
      [deslizar en 2 segundos a x: posición x y: -180]
      [si tocando jugador entonces]
         [cambiar puntos por 1]
      [fin si]
   [fin por siempre]
```

---

# ANEXO: SCRATCH + INTELIGENCIA ARTIFICIAL (Lecciones 26-29)

## Lección 26: Machine Learning para niños
**Tipo:** video | **Duración:** 20 min | **Imágenes:** page-65.png

### Contenido:
Machine Learning (ML) es cómo las computadoras aprenden de ejemplos, igual que tú aprendes de experiencias.

### ¿Cómo aprende una máquina?
1. Le muestras muchos ejemplos
2. La máquina encuentra patrones
3. Puede reconocer cosas nuevas

### Tipos de clasificación:
- **Imágenes:** Reconoce fotos (perro vs gato)
- **Audio:** Reconoce sonidos (aplausos vs silbidos)
- **Texto:** Entiende palabras (positivo vs negativo)
- **Poses:** Reconoce gestos (mano arriba vs abajo)

### Ejemplo cotidiano:
- YouTube te recomienda videos → ML
- El celular reconoce tu cara → ML
- El correo filtra spam → ML

### 💡 Dato curioso:
Los asistentes como Alexa y Siri usan Machine Learning para entenderte.

---

## Lección 27: Clasificación de imágenes
**Tipo:** activity | **Duración:** 30 min | **Imágenes:** page-66.png

### Contenido:
Entrenaremos una IA para reconocer diferentes objetos usando Teachable Machine.

### Pasos:
1. Ve a https://teachablemachine.withgoogle.com
2. Selecciona "Image Project"
3. Crea 2 clases (ej: "Lápiz" y "Borrador")
4. Toma 30+ fotos de cada objeto
5. Haz clic en "Train Model"
6. ¡Prueba con objetos nuevos!

### Integrar con Scratch:
1. Exporta el modelo
2. Usa la extensión "Machine Learning for Kids"
3. Crea un proyecto que responda a lo que ve

### Proyecto ejemplo:
Un sprite que dice el nombre del objeto que le muestras a la cámara.

---

## Lección 28: Clasificación de audio
**Tipo:** activity | **Duración:** 30 min | **Imágenes:** page-67.png

### Contenido:
Entrenaremos una IA para reconocer diferentes sonidos.

### Pasos:
1. En Teachable Machine, selecciona "Audio Project"
2. Crea clases: "Aplauso", "Silbido", "Silencio"
3. Graba 20+ muestras de cada sonido
4. Entrena el modelo
5. Prueba haciendo los sonidos

### Proyecto con Scratch:
Un juego controlado por sonidos:
- Aplauso = Saltar
- Silbido = Disparar
- Voz = Moverse

### 💡 Tip:
Graba en un lugar silencioso para mejores resultados.

---

## Lección 29: Proyecto - Asistente inteligente
**Tipo:** project | **Duración:** 45 min | **Imágenes:** page-68.png

### Contenido:
Crearemos un asistente virtual que responde a comandos de voz o gestos.

### Funcionalidades:
1. Reconoce tu voz diciendo "Hola"
2. Responde con un saludo
3. Reconoce gestos con la mano
4. Ejecuta acciones según el gesto

### Componentes:
- Modelo de audio entrenado
- Modelo de imagen entrenado
- Proyecto de Scratch que los usa

### Código base:

```
[al presionar bandera verde]
   [por siempre]
      [si reconoce "hola" entonces]
         [decir "¡Hola! ¿En qué te ayudo?"]
      [fin si]
      [si reconoce "mano arriba" entonces]
         [subir volumen]
      [fin si]
      [si reconoce "mano abajo" entonces]
         [bajar volumen]
      [fin si]
   [fin por siempre]
```

---

# ANEXO: ELECTRICIDAD BÁSICA (Lecciones 30-33)

## Lección 30: Conceptos de electricidad
**Tipo:** video | **Duración:** 20 min | **Imágenes:** page-78.png

### Contenido:
La electricidad es la energía que hace funcionar nuestros dispositivos. Entenderemos sus conceptos básicos.

### Conceptos fundamentales:
- **Corriente (I):** Flujo de electrones, medida en Amperios (A)
- **Voltaje (V):** "Presión" eléctrica, medida en Voltios (V)
- **Resistencia (R):** Oposición al flujo, medida en Ohmios (Ω)

### Analogía del agua:
- Voltaje = Presión del agua
- Corriente = Cantidad de agua que fluye
- Resistencia = Grosor de la tubería

### Tipos de circuitos:
- **Circuito abierto:** No hay flujo (interruptor apagado)
- **Circuito cerrado:** Hay flujo (interruptor encendido)

### ⚠️ Seguridad:
- Nunca toques cables pelados
- No uses aparatos eléctricos cerca del agua
- Pide ayuda a un adulto

---

## Lección 31: Componentes electrónicos
**Tipo:** tutorial | **Duración:** 20 min | **Imágenes:** page-79.png

### Contenido:
Conoceremos los componentes básicos que forman los circuitos.

### Componentes principales:
1. **LED:** Luz pequeña, tiene polaridad (+/-)
2. **Resistencia:** Limita la corriente, protege componentes
3. **Batería:** Fuente de energía
4. **Interruptor:** Abre/cierra el circuito
5. **Cables:** Conducen la electricidad

### Símbolos electrónicos:
```
LED:        ─▷|─
Resistencia: ─/\/\/─
Batería:    ─|+  -|─
Interruptor: ─/ ─
```

### Polaridad del LED:
- Pata larga = Positivo (+)
- Pata corta = Negativo (-)
- Si lo conectas al revés, no enciende

### 💡 Tip:
Siempre usa una resistencia con el LED para no quemarlo.

---

## Lección 32: Mi primer circuito
**Tipo:** activity | **Duración:** 30 min | **Imágenes:** page-80.png

### Contenido:
¡Manos a la obra! Armaremos un circuito básico que enciende un LED.

### Materiales:
- 1 LED (cualquier color)
- 1 Resistencia de 220Ω
- 1 Batería de 9V o porta pilas
- Cables
- Protoboard (opcional)

### Diagrama del circuito:
```
Batería (+) → Resistencia → LED (+) → LED (-) → Batería (-)
```

### Pasos:
1. Conecta el cable rojo al positivo de la batería
2. Conecta el otro extremo a la resistencia
3. Conecta la resistencia a la pata larga del LED
4. Conecta la pata corta del LED al cable negro
5. Conecta el cable negro al negativo de la batería
6. ¡El LED debe encender!

### Solución de problemas:
- No enciende: Verifica la polaridad del LED
- Se quema: Falta la resistencia
- Luz débil: Batería descargada

---

## Lección 33: Prueba de salida
**Tipo:** activity | **Duración:** 20 min | **Imágenes:** page-07.png

### Contenido:
Evaluación final para medir todo lo aprendido durante el curso.

### Temas evaluados:
1. Programación con EdScratch
2. Robot Edison y sensores
3. Figuras geométricas
4. Brazo robótico EdCrane
5. Scratch básico
6. Machine Learning
7. Electricidad básica

### Formato:
- 20 preguntas de opción múltiple
- 2 preguntas de desarrollo
- 1 ejercicio práctico

### Preguntas ejemplo:
1. ¿Cuántos grados debe girar Edison para un triángulo? (120°)
2. ¿Qué componente limita la corriente? (Resistencia)
3. ¿Qué es Machine Learning? (Aprendizaje automático)

### 🎉 ¡Felicitaciones!
Has completado el curso de Robótica de Sexto Grado. ¡Ahora eres un programador y maker!

---

# MAPA DE IMÁGENES DEL LIBRO

| Lección | Páginas del libro |
|---------|-------------------|
| 1. Prueba de entrada | page-07.png |
| 2. Intro EdScratch | page-09.png, page-13.png |
| 3. Robot Edison | page-11.png, page-12.png |
| 4. Interfaz EdScratch | page-13.png |
| 5. Primer programa | page-13.png, page-14.png |
| 6. Laberinto | page-14.png, page-16.png |
| 7. Evasión | page-14.png |
| 8. Conectar Edison | page-15.png |
| 9. Carrera evasión | page-17.png, page-18.png |
| 10. Figuras geométricas | page-19.png, page-21.png |
| 11. Matemáticas | page-21.png |
| 12. Cuadrado | page-21.png, page-22.png |
| 13. Triángulo | page-22.png |
| 14. Rectángulo | page-22.png |
| 15. Artista robótico | page-22.png |
| 16-20. EdCrane | page-31.png a page-36.png |
| 21-25. Scratch | page-54.png a page-58.png |
| 26-29. IA | page-65.png a page-68.png |
| 30-33. Electricidad | page-78.png a page-80.png |
