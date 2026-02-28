# 🤖 TEMARIO COMPLETO DE ROBÓTICA - ChaskiBots EDU

## Descripción General

El programa de Robótica de ChaskiBots EDU está diseñado para estudiantes desde 4° EGB hasta 10° EGB, proporcionando una progresión gradual desde electrónica básica hasta programación de microcontroladores ESP32.

---

## �️ SIMULADORES Y HERRAMIENTAS POR NIVEL

| Nivel | Simulador Principal | Simuladores Secundarios | Uso en Robótica |
|-------|--------------------|-----------------------|-----------------|
| 4° EGB | **Scratch** | - | Conceptos básicos, secuencias |
| 5° EGB | **Scratch** | MakeCode | Lógica de control |
| 6° EGB | **MakeCode** | Scratch | Programación de sensores |
| 7° EGB | **MakeCode** | Scratch | Programación visual avanzada |
| 8° EGB | **Tinkercad** | **Wokwi** | Simulación de circuitos, ESP32 |
| 9° EGB | **Wokwi** | Tinkercad | ESP32 Super Mini, sensores IR |
| 10° EGB | **Wokwi** | Tinkercad | HC-SR04, algoritmos de evasión |

### Uso de Simuladores por Tipo de Lección

- **video**: No requiere simulador (contenido teórico)
- **tutorial**: Simulador recomendado para práctica previa
- **activity**: Simulador para probar antes de hardware real
- **project**: Hardware real + simulador para debugging

### Flujo de Trabajo Recomendado

1. **Simular primero** en Tinkercad/Wokwi
2. **Verificar código** funciona en simulador
3. **Transferir a hardware** real
4. **Depurar** con ayuda del simulador si hay problemas

---

## �📦 Hardware ChaskiBots

### Kit Extra (Componentes Básicos)
| Componente | Especificación |
|------------|----------------|
| LEDs | Varios colores (rojo, verde, amarillo, azul) |
| Resistencias | 220Ω para LEDs |
| Pulsadores | Momentáneos |
| Potenciómetro | 10kΩ |
| Buzzer | Pasivo |
| Transistor | 2N2222A |
| Cables Jumper | Macho-macho, macho-hembra |
| Cinta de Cobre | Para circuitos en papel |
| Porta Pila | CR2032 |
| Pila | CR2032 |

### PCB DRAGON RC V2.0 (Robot Radiocontrolado)
- **Microcontrolador**: ESP32 DevKit
- **Driver de Motores**: TB6612FNG
- **Regulador**: 7805 (5V)
- **LEDs**: D1-D6 en GPIO
- **Botones**: BOTON1, BOTON2
- **Conectores**: Motores, Sensores, Módulos
- **Alimentación**: VIN para baterías

### PCB RC DRAGON V2 (Seguidor de Línea)
- **Microcontrolador**: ESP32 Super Mini
- **Driver de Motores**: TB6612FNG integrado
- **Tamaño**: Compacto para robots pequeños
- **Conectores**: Sensores IR, Motores

---

## 📚 ESTRUCTURA POR GRADO

---

## 4° EGB - Introducción a Electrónica

**Objetivo**: Conocer componentes electrónicos básicos y construir circuitos simples.

### Distribución Semanal

| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Introducción | Conocer componentes, seguridad eléctrica |
| 3-4 | Kit Extra: LED Básico | LED con resistencia, polaridad |
| 5-6 | Kit Extra: Pulsador | Circuitos con interruptores |
| 7-8 | Kit Extra: Potenciómetro | Control de brillo |
| 9-10 | Kit Extra: Buzzer | Sonidos y alarmas |
| 11-12 | Kit Extra: Proyecto | Tarjeta Musical |
| 13-18 | Robot Pintor | Ensamblaje y competencia |

### Lecciones Detalladas

#### Módulo 1: Introducción a Componentes (Semanas 1-2)
1. **¿Qué es la electrónica?** - Video introductorio sobre circuitos
2. **Conociendo los componentes** - Identificación de LEDs, resistencias, cables
3. **Seguridad eléctrica** - Reglas básicas de seguridad
4. **Mi primer circuito** - Circuito simple con batería y LED

#### Módulo 2: LED Básico (Semanas 3-4)
1. **Polaridad del LED** - Ánodo y cátodo
2. **¿Por qué usar resistencia?** - Protección del LED
3. **Circuito LED completo** - Conexión correcta
4. **Experimentando con colores** - LEDs de diferentes colores

#### Módulo 3: Pulsador (Semanas 5-6)
1. **¿Qué es un pulsador?** - Interruptores momentáneos
2. **Circuito con pulsador** - Control de encendido
3. **Pulsador + LED** - Circuito interactivo
4. **Múltiples pulsadores** - Control de varios LEDs

#### Módulo 4: Potenciómetro (Semanas 7-8)
1. **¿Qué es un potenciómetro?** - Resistencia variable
2. **Control de brillo** - Dimmer para LED
3. **Experimentando valores** - Diferentes resistencias
4. **Aplicaciones prácticas** - Controles de volumen

#### Módulo 5: Buzzer (Semanas 9-10)
1. **¿Qué es un buzzer?** - Generador de sonido
2. **Buzzer activo vs pasivo** - Diferencias
3. **Circuito con buzzer** - Alarma simple
4. **Melodías simples** - Tonos diferentes

#### Módulo 6: Proyecto Tarjeta Musical (Semanas 11-12)
1. **Diseño de la tarjeta** - Planificación
2. **Construcción** - Ensamblaje de componentes
3. **Pruebas** - Verificación de funcionamiento
4. **Presentación** - Demostración del proyecto

#### Módulo 7: Robot Pintor (Semanas 13-18)
1. **¿Qué es un robot pintor?** - Introducción
2. **Componentes del robot** - Motor de vibración, marcadores
3. **Ensamblaje paso a paso** - Construcción guiada
4. **Decoración** - Personalización
5. **Pruebas de funcionamiento** - Ajustes
6. **Competencia de arte** - Exhibición de creaciones

**Proyecto Final**: Robot Pintor (vibración)

---

## 5° EGB - Electrónica Intermedia

**Objetivo**: Profundizar en componentes electrónicos y construir proyectos mecánicos.

### Distribución Semanal

| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Repaso | Circuitos más complejos |
| 3-4 | Kit Extra: Transistor | Switch electrónico |
| 5-6 | Kit Extra: Avanzado | Semáforo con LEDs |
| 7-10 | Carro Jet | Propulsión con hélice |
| 11-16 | Robot Perro | Biomimética, mecanismo de patas |

### Lecciones Detalladas

#### Módulo 1: Repaso y Circuitos Complejos (Semanas 1-2)
1. **Repaso de componentes** - Revisión de 4° grado
2. **Circuitos en serie** - LEDs en serie
3. **Circuitos en paralelo** - LEDs en paralelo
4. **Combinando circuitos** - Serie y paralelo

#### Módulo 2: Transistor (Semanas 3-4)
1. **¿Qué es un transistor?** - Switch electrónico
2. **Partes del transistor** - Base, colector, emisor
3. **Transistor como interruptor** - Control de corriente
4. **Circuito con transistor** - Amplificación simple

#### Módulo 3: Semáforo (Semanas 5-6)
1. **Diseño del semáforo** - Planificación
2. **Circuito del semáforo** - 3 LEDs con control
3. **Temporización manual** - Secuencia de luces
4. **Proyecto completo** - Semáforo funcional

#### Módulo 4: Carro Jet (Semanas 7-10)
1. **Introducción al Carro Jet** - Propulsión por aire
2. **Componentes del carro** - Motor, hélice, chasis
3. **Ensamblaje del chasis** - Construcción base
4. **Instalación del motor** - Conexiones eléctricas
5. **Montaje de la hélice** - Seguridad y balance
6. **Pruebas de velocidad** - Ajustes y mejoras
7. **Decoración** - Personalización
8. **Carrera de carros** - Competencia

#### Módulo 5: Robot Perro (Semanas 11-16)
1. **Biomimética** - Robots inspirados en animales
2. **Mecanismo de 4 patas** - Diseño mecánico
3. **Ensamblaje del cuerpo** - Estructura principal
4. **Instalación de patas** - Mecanismo de caminar
5. **Motor y transmisión** - Sistema de movimiento
6. **Pruebas de caminata** - Ajustes
7. **Decoración del perro** - Personalización
8. **Exhibición** - Presentación final

**Proyectos Finales**: Carro Jet, Robot Perro

---

## 6° EGB - Robots Autónomos Básicos

**Objetivo**: Construir robots que toman decisiones simples basadas en sensores.

### Distribución Semanal

| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Aplicaciones | Mini-proyectos creativos |
| 3-6 | Carro Solar | Energía fotovoltaica |
| 7-16 | Robot 4 en 1 | 4 modos de operación |

### Lecciones Detalladas

#### Módulo 1: Aplicaciones Creativas (Semanas 1-2)
1. **Repaso general** - Componentes y circuitos
2. **Mini-proyecto 1** - Luz nocturna automática
3. **Mini-proyecto 2** - Alarma de puerta
4. **Presentación de proyectos** - Exhibición

#### Módulo 2: Carro Solar (Semanas 3-6)
1. **Energía solar** - ¿Cómo funciona?
2. **Panel solar** - Componentes y conexiones
3. **Motor solar** - Sin baterías
4. **Ensamblaje del chasis** - Construcción
5. **Instalación del panel** - Orientación óptima
6. **Pruebas al sol** - Funcionamiento
7. **Optimización** - Mejoras de rendimiento
8. **Carrera solar** - Competencia

#### Módulo 3: Robot 4 en 1 (Semanas 7-16)
1. **Introducción al Robot 4 en 1** - Modos de operación
2. **Componentes del kit** - Inventario
3. **Ensamblaje base** - Chasis y motores

**Modo 1: Control por Sonido (Semanas 9-10)**
4. **Sensor de sonido** - Micrófono
5. **Programación por palmadas** - Lógica de control
6. **Pruebas de sonido** - Calibración

**Modo 2: Control Infrarrojo (Semanas 11-12)**
7. **Receptor IR** - ¿Cómo funciona?
8. **Control remoto** - Programación de botones
9. **Pruebas IR** - Control direccional

**Modo 3: Seguidor de Línea (Semanas 13-14)**
10. **Sensores IR** - Detección de línea
11. **Lógica de seguimiento** - Algoritmo básico
12. **Pista de pruebas** - Calibración

**Modo 4: Evita Obstáculos Táctil (Semanas 15-16)**
13. **Bumpers** - Sensores de contacto
14. **Lógica de evasión** - Retroceder y girar
15. **Pruebas de obstáculos** - Laberinto simple
16. **Competencia final** - Todos los modos

**Modos del Robot 4 en 1**:
1. Control por Sonido (palmadas)
2. Control Infrarrojo (control remoto)
3. Seguidor de Línea (sensores IR)
4. Evita Obstáculos Táctil (bumpers)

---

## 7° EGB - Programación Visual

**Objetivo**: Introducir conceptos de programación usando bloques visuales.

### Distribución Semanal

| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Experto | Prácticas rápidas |
| 3-7 | Programación Visual | Scratch/Blockly |
| 8-14 | Carro Robot Multi-Sensor | Construcción y lógica |
| 15-18 | Robot 4en1 Mejorado | Personalización con bloques |
| 19-21 | Preparación 8° | Intro a microcontroladores |

### Lecciones Detalladas

#### Módulo 1: Prácticas Rápidas (Semanas 1-2)
1. **Circuito rápido 1** - LED intermitente manual
2. **Circuito rápido 2** - Control de motor DC
3. **Circuito rápido 3** - Sensor de luz
4. **Circuito rápido 4** - Combinación de sensores

#### Módulo 2: Programación Visual (Semanas 3-7)
1. **¿Qué es Scratch?** - Introducción a bloques
2. **Interfaz de Scratch** - Conociendo el entorno
3. **Mi primer programa** - Mover un sprite
4. **Secuencias** - Pasos en orden
5. **Bucles** - Repetir acciones
6. **Condicionales** - Si-entonces
7. **Variables** - Guardar información
8. **Eventos** - Responder a acciones
9. **Proyecto animación** - Historia interactiva
10. **Proyecto juego** - Juego simple

#### Módulo 3: Carro Robot Multi-Sensor (Semanas 8-14)
1. **Introducción al proyecto** - Objetivos
2. **Componentes necesarios** - Lista de materiales
3. **Ensamblaje del chasis** - Construcción base
4. **Instalación de motores** - Conexiones
5. **Sensores múltiples** - IR, ultrasonido, luz
6. **Lógica de control** - Diseño en bloques
7. **Programación en Blockly** - Implementación
8. **Pruebas básicas** - Movimiento
9. **Pruebas de sensores** - Calibración
10. **Integración completa** - Sistema funcionando
11. **Optimización** - Mejoras
12. **Competencia** - Demostración

#### Módulo 4: Robot 4en1 Mejorado (Semanas 15-18)
1. **Reprogramación del robot** - Nuevas funciones
2. **Personalización de modos** - Ajustes
3. **Nuevos comportamientos** - Creatividad
4. **Presentación final** - Exhibición

#### Módulo 5: Preparación para 8° (Semanas 19-21)
1. **¿Qué es un microcontrolador?** - Introducción
2. **ESP32 vs Arduino** - Comparación
3. **Preparación para código** - Conceptos básicos

**Conceptos de Programación**:
- Secuencias
- Bucles (repetir)
- Condicionales (si-entonces)
- Variables

---

## 8° EGB - ESP32 y Robot RC ⭐

**Objetivo**: Programar microcontroladores ESP32 y construir un robot radiocontrolado.

### Distribución Semanal

| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-6 | Kit Extra: Componentes | 6 prácticas fundamentales |
| 7-10 | Arduino IDE | Instalación, Blink, variables |
| 11-14 | PCB DRAGON RC: LEDs | Encender, secuencias, semáforo |
| 15-18 | PCB DRAGON RC: Botones | Leer, toggle, contador |
| 19-24 | TB6612FNG: Motores | Control PWM, funciones movimiento |
| 25-28 | Bluetooth | Control inalámbrico desde celular |
| 29-34 | Proyecto RC | Ensamblaje y competencia |

### Lecciones Detalladas

#### Módulo 1: Prácticas con Componentes (Semanas 1-6)
1. **LED con resistencia** - Circuito básico
2. **LED con pulsador** - Control manual
3. **Potenciómetro** - Resistencia variable
4. **Buzzer con transistor** - Amplificación
5. **Circuito integrado** - Combinación de componentes
6. **Repaso general** - Preparación para programación

#### Módulo 2: Arduino IDE (Semanas 7-10)
1. **Instalación Arduino IDE** - Configuración
2. **Configurar ESP32** - Drivers y board
3. **Estructura del código** - setup() y loop()
4. **Primer programa: Blink** - LED intermitente
5. **Variables** - Tipos de datos
6. **Funciones** - Organización del código
7. **Serial Monitor** - Depuración
8. **Práctica integrada** - Ejercicios

#### Módulo 3: LEDs de la PCB (Semanas 11-14)
1. **Conociendo la PCB DRAGON RC** - Componentes
2. **Pines de los LEDs** - GPIO mapping
3. **Encender un LED** - digitalWrite
4. **Secuencia de LEDs** - Animación
5. **Knight Rider** - Efecto de barrido
6. **Semáforo programado** - Temporización
7. **PWM para brillo** - analogWrite
8. **Efectos de fade** - Transiciones suaves

#### Módulo 4: Botones de la PCB (Semanas 15-18)
1. **Pines de los botones** - Configuración
2. **Leer estado del botón** - digitalRead
3. **Debounce** - Eliminar rebotes
4. **Toggle con estado** - Encender/apagar
5. **Contador con botón** - Variables
6. **Dos botones** - Control múltiple
7. **Combinación LED + Botón** - Interacción
8. **Práctica integrada** - Ejercicios

#### Módulo 5: Control de Motores (Semanas 19-24)
1. **Driver TB6612FNG** - ¿Cómo funciona?
2. **Pines del driver** - Conexiones
3. **Control de UN motor** - Adelante/atrás
4. **PWM para velocidad** - Control de potencia
5. **Control de DOS motores** - Sincronización
6. **Funciones de movimiento** - adelante(), atras(), girar()
7. **Giros suaves** - Diferencial de velocidad
8. **Práctica de movimientos** - Coreografía
9. **Optimización** - Ajustes finos
10. **Integración completa** - LEDs + Botones + Motores

#### Módulo 6: Bluetooth (Semanas 25-28)
1. **Bluetooth en ESP32** - Capacidades
2. **BluetoothSerial** - Librería
3. **Configurar Bluetooth** - Nombre y conexión
4. **Recibir comandos** - Lectura de datos
5. **Procesar comandos** - Switch/case
6. **App de control** - Configuración del celular
7. **Control de velocidad** - Comandos avanzados
8. **Práctica de control** - Pruebas

#### Módulo 7: Proyecto Robot RC (Semanas 29-34)
1. **Planificación del proyecto** - Diseño
2. **Ensamblaje del chasis** - Construcción
3. **Instalación de motores** - Conexiones
4. **Montaje de la PCB** - Integración
5. **Programación final** - Código completo
6. **Pruebas de funcionamiento** - Depuración
7. **Ajustes y mejoras** - Optimización
8. **Decoración** - Personalización
9. **Práctica de manejo** - Entrenamiento
10. **Competencia de robots** - Carrera final

### Prácticas Previas al Proyecto RC
1. ✅ LED con resistencia
2. ✅ LED con pulsador
3. ✅ Potenciómetro
4. ✅ Buzzer con transistor
5. ✅ Circuito integrado
6. ✅ Blink en ESP32
7. ✅ LEDs de la PCB
8. ✅ Secuencia Knight Rider
9. ✅ Leer botones
10. ✅ Toggle con estado
11. ✅ Control de UN motor
12. ✅ Control de DOS motores
13. ✅ Bluetooth Serial
14. ✅ Recibir comandos
15. ✅ Control de velocidad

**Proyecto Final**: Robot Radiocontrolado con ESP32 + TB6612FNG

---

## 9° EGB - Seguidor de Línea ⭐

**Objetivo**: Construir un robot autónomo que sigue líneas usando sensores IR.

### Distribución Semanal

| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Repaso | Sensores IR |
| 3-5 | ESP32 Super Mini | Configuración, pines |
| 6-10 | Sensores IR | Fundamentos, conexiones, estados |
| 11-14 | Lógica Seguidor | Pseudocódigo, implementación |
| 15-17 | PCB RC DRAGON V2 | Conexiones, ensamblaje |
| 18-23 | Proyecto Seguidor | Ensamblaje, calibración |
| 24-29 | Competencia | Pista, práctica, carrera |

### Lecciones Detalladas

#### Módulo 1: Repaso de Sensores (Semanas 1-2)
1. **Repaso de componentes** - Revisión de 8° grado
2. **Sensores IR** - Principio de funcionamiento
3. **Reflexión de luz** - Blanco vs negro
4. **Práctica con sensores** - Lectura básica

#### Módulo 2: ESP32 Super Mini (Semanas 3-5)
1. **Conociendo el ESP32 Super Mini** - Características
2. **Diferencias con ESP32 DevKit** - Comparación
3. **Configuración en Arduino IDE** - Board y puerto
4. **Pines disponibles** - GPIO mapping
5. **Primer programa** - Blink en Super Mini
6. **Práctica de pines** - Entradas y salidas

#### Módulo 3: Sensores IR (Semanas 6-10)
1. **Sensor IR TCRT5000** - Componentes
2. **Conexión de UN sensor** - Cableado
3. **Lectura digital** - HIGH/LOW
4. **LED indicador** - Visualización de estado
5. **Conexión de DOS sensores** - Izquierdo y derecho
6. **Tabla de estados** - Combinaciones posibles
7. **Lectura analógica** - Valores continuos
8. **Calibración** - Ajuste de sensibilidad
9. **Práctica con línea** - Pruebas reales
10. **Integración** - Código completo de sensores

#### Módulo 4: Lógica del Seguidor (Semanas 11-14)
1. **Algoritmo de seguimiento** - Diseño
2. **Pseudocódigo** - Planificación
3. **Implementar if-else** - Decisiones
4. **Casos de borde** - Línea perdida
5. **Funciones de movimiento** - Reutilización
6. **Integrar sensores + motores** - Sistema completo
7. **Pruebas de lógica** - Depuración
8. **Optimización** - Mejoras de velocidad

#### Módulo 5: PCB RC DRAGON V2 (Semanas 15-17)
1. **Conociendo la PCB** - Componentes
2. **Pines de sensores** - Conexiones
3. **Pines de motores** - Driver integrado
4. **Ensamblaje de la PCB** - Soldadura
5. **Pruebas de la PCB** - Verificación
6. **Integración con código** - Adaptación

#### Módulo 6: Proyecto Seguidor (Semanas 18-23)
1. **Planificación del proyecto** - Diseño
2. **Ensamblaje del chasis** - Construcción
3. **Montaje de sensores** - Posicionamiento
4. **Instalación de motores** - Conexiones
5. **Montaje de la PCB** - Integración
6. **Programación final** - Código completo
7. **Calibración de sensores** - Ajustes
8. **Pruebas en pista** - Depuración
9. **Optimización de velocidad** - Mejoras
10. **Ajustes finales** - Preparación para competencia

#### Módulo 7: Competencia (Semanas 24-29)
1. **Diseño de pista** - Especificaciones
2. **Construcción de pista** - Materiales
3. **Práctica en pista** - Entrenamiento
4. **Ajustes de último momento** - Optimización
5. **Competencia clasificatoria** - Tiempos
6. **Final de competencia** - Carrera definitiva

### Prácticas Previas al Proyecto Seguidor
1. ✅ Repaso componentes
2. ✅ Configurar ESP32 Super Mini
3. ✅ Conectar UN sensor IR
4. ✅ LED indicador de sensor
5. ✅ Conectar DOS sensores
6. ✅ Tabla de estados
7. ✅ Pseudocódigo
8. ✅ Implementar if-else
9. ✅ Funciones de movimiento
10. ✅ Integrar sensores + motores

**Proyecto Final**: Robot Seguidor de Línea con ESP32 Super Mini

---

## 10° EGB - Evita Obstáculos ⭐

**Objetivo**: Construir un robot autónomo que detecta y evade obstáculos usando sensor ultrasónico.

### Distribución Semanal

| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Aplicaciones | Sensores y decisiones |
| 3-8 | Sensor HC-SR04 | Fundamentos, código, LEDs, buzzer |
| 9-12 | Algoritmo Evasión | Diseño, implementación, mejoras |
| 13-15 | PCB DRAGON RC | Integración sensor + motores |
| 16-18 | Proyecto Ensamblaje | Montar sensor, código final |
| 19-21 | Optimización | Ajustes, giros, aleatoriedad |
| 22-27 | Laberinto | Diseño, pruebas, competencia |

### Lecciones Detalladas

#### Módulo 1: Aplicaciones de Sensores (Semanas 1-2)
1. **Repaso de sensores** - IR, luz, sonido
2. **Sensores de distancia** - Tipos disponibles
3. **Ultrasonido** - Principio de funcionamiento
4. **Aplicaciones reales** - Robots comerciales

#### Módulo 2: Sensor HC-SR04 (Semanas 3-8)
1. **Conociendo el HC-SR04** - Componentes
2. **Principio de ultrasonido** - Eco y tiempo
3. **Conexiones del sensor** - Trigger y Echo
4. **Código para medir distancia** - pulseIn()
5. **Serial Monitor** - Visualizar mediciones
6. **Conversión a centímetros** - Fórmula
7. **LED según distancia** - Indicador visual
8. **Múltiples LEDs** - Semáforo de distancia
9. **Buzzer de alerta** - Alarma de proximidad
10. **Frecuencia variable** - Pitido según distancia
11. **Práctica integrada** - Sensor + LEDs + Buzzer
12. **Optimización de lecturas** - Filtrado de ruido

#### Módulo 3: Algoritmo de Evasión (Semanas 9-12)
1. **Diseño del algoritmo** - Lógica de decisión
2. **Pseudocódigo** - Planificación
3. **Implementar decisiones** - if-else
4. **Distancia de seguridad** - Umbral
5. **Acción de evasión** - Retroceder y girar
6. **Mejorar algoritmo** - Casos especiales
7. **Evitar esquinas** - Detección lateral
8. **Práctica de evasión** - Pruebas

#### Módulo 4: Integración con PCB (Semanas 13-15)
1. **Conexión del sensor a PCB** - Cableado
2. **Integración con motores** - Control combinado
3. **Código integrado** - Sensor + Motores
4. **Pruebas de integración** - Depuración
5. **Ajustes de velocidad** - Optimización
6. **Práctica completa** - Sistema funcionando

#### Módulo 5: Ensamblaje del Proyecto (Semanas 16-18)
1. **Planificación del montaje** - Diseño
2. **Ensamblaje del chasis** - Construcción
3. **Montaje del sensor** - Posicionamiento
4. **Instalación de motores** - Conexiones
5. **Montaje de la PCB** - Integración
6. **Código final** - Programación completa

#### Módulo 6: Optimización (Semanas 19-21)
1. **Ajustes de sensibilidad** - Calibración
2. **Giros optimizados** - Ángulos precisos
3. **Aleatoriedad en giros** - Evitar patrones
4. **Velocidad adaptativa** - Según distancia
5. **Pruebas exhaustivas** - Diferentes escenarios
6. **Mejoras finales** - Preparación para competencia

#### Módulo 7: Competencia Laberinto (Semanas 22-27)
1. **Diseño del laberinto** - Especificaciones
2. **Construcción del laberinto** - Materiales
3. **Práctica en laberinto** - Entrenamiento
4. **Estrategias de navegación** - Técnicas
5. **Ajustes de último momento** - Optimización
6. **Competencia clasificatoria** - Tiempos
7. **Final de competencia** - Carrera definitiva

### Prácticas Previas al Proyecto Evita Obstáculos
1. ✅ Concepto de ultrasonido
2. ✅ Conexiones HC-SR04
3. ✅ Código medir distancia
4. ✅ Serial Monitor
5. ✅ LED según distancia
6. ✅ Buzzer de alerta
7. ✅ Diseñar algoritmo
8. ✅ Implementar decisiones
9. ✅ Mejorar algoritmo
10. ✅ Evitar esquinas

**Proyecto Final**: Robot Evita Obstáculos con Sensor Ultrasónico

---

## 🔌 PINES DE LAS PCBs

### PCB DRAGON RC V2.0 (ESP32)

```
LEDs:
- D1: GPIO2
- D2: GPIO4
- D3: GPIO16
- D4: GPIO17
- D5: GPIO18
- D6: GPIO19

Botones:
- BOTON1: GPIO32
- BOTON2: GPIO33

TB6612FNG:
- AIN1: GPIO14
- AIN2: GPIO12
- PWMA: GPIO27
- BIN1: GPIO26
- BIN2: GPIO25
- PWMB: GPIO33
- STBY: GPIO5

Bluetooth: Integrado en ESP32
```

### PCB RC DRAGON V2 (ESP32 Super Mini)

```
Sensores IR:
- Sensor Izquierdo: GPIO18
- Sensor Derecho: GPIO19

TB6612FNG:
- Pines según diseño de PCB
- Verificar con esquemático

Alimentación:
- VIN: 7-12V
- Regulador interno a 3.3V
```

---

## 📊 RESUMEN ESTADÍSTICO

| Grado | Semanas | Lecciones | Proyectos Principales |
|-------|---------|-----------|----------------------|
| 4° EGB | 18 | ~24 | Robot Pintor |
| 5° EGB | 16 | ~28 | Carro Jet, Robot Perro |
| 6° EGB | 16 | ~28 | Carro Solar, Robot 4en1 |
| 7° EGB | 21 | ~32 | Carro Multi-Sensor |
| 8° EGB | 34 | ~50 | Robot RC Bluetooth |
| 9° EGB | 29 | ~40 | Robot Seguidor de Línea |
| 10° EGB | 27 | ~38 | Robot Evita Obstáculos |
| **TOTAL** | **161** | **~240** | **7 proyectos principales** |

---

## 📁 ARCHIVOS CSV RELACIONADOS

| Archivo | Contenido |
|---------|-----------|
| `lessons_robotica_primaria.csv` | Lecciones 4°-7° EGB |
| `lessons_robotica_expandido.csv` | Lecciones 8°-10° EGB |
| `tasks_robotica.csv` | Tareas de todos los grados |

---

*Documento generado para ChaskiBots EDU - Programa de Robótica*
