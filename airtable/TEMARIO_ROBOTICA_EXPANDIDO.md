# 🤖 TEMARIO ROBÓTICA EXPANDIDO - ChaskiBots EDU

## Hardware ChaskiBots

### Kit Extra (Componentes Básicos)
- **LEDs** (varios colores)
- **Resistencias** 220Ω
- **Pulsadores** momentáneos
- **Potenciómetro** 10kΩ
- **Buzzer** pasivo
- **Transistor** 2N2222A
- **Cables Jumper**
- **Cinta de Cobre**
- **Porta Pila** CR2032
- **Pila** CR2032

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

## 📚 Estructura del Temario por Grado

### 4° EGB - Introducción a Electrónica
| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Introducción | Conocer componentes, seguridad |
| 3-4 | Kit Extra: LED Básico | LED con resistencia, polaridad |
| 5-6 | Kit Extra: Pulsador | Circuitos con interruptores |
| 7-8 | Kit Extra: Potenciómetro | Control de brillo |
| 9-10 | Kit Extra: Buzzer | Sonidos y alarmas |
| 11-12 | Kit Extra: Proyecto | Tarjeta Musical |
| 13-18 | Robot Pintor | Ensamblaje y competencia |

**Proyecto Final**: Robot Pintor (vibración)

---

### 5° EGB - Electrónica Intermedia
| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Repaso | Circuitos más complejos |
| 3-4 | Kit Extra: Transistor | Switch electrónico |
| 5-6 | Kit Extra: Avanzado | Semáforo con LEDs |
| 7-10 | Carro Jet | Propulsión con hélice |
| 11-16 | Robot Perro | Biomimética, mecanismo de patas |

**Proyectos**: Carro Jet, Robot Perro

---

### 6° EGB - Robots Autónomos Básicos
| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Aplicaciones | Mini-proyectos creativos |
| 3-6 | Carro Solar | Energía fotovoltaica |
| 7-16 | Robot 4 en 1 | 4 modos de operación |

**Modos del Robot 4 en 1**:
1. Control por Sonido (palmadas)
2. Control Infrarrojo (control remoto)
3. Seguidor de Línea (sensores IR)
4. Evita Obstáculos Táctil (bumpers)

---

### 7° EGB - Programación Visual
| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Experto | Prácticas rápidas |
| 3-7 | Programación Visual | Scratch/Blockly |
| 8-14 | Carro Robot Multi-Sensor | Construcción y lógica |
| 15-18 | Robot 4en1 Mejorado | Personalización con bloques |
| 19-21 | Preparación 8° | Intro a microcontroladores |

**Conceptos de Programación**:
- Secuencias
- Bucles (repetir)
- Condicionales (si-entonces)
- Variables

---

### 8° EGB - ESP32 y Robot RC ⭐
| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-6 | Kit Extra: Componentes | 6 prácticas fundamentales |
| 7-10 | Arduino IDE | Instalación, Blink, variables |
| 11-14 | PCB DRAGON RC: LEDs | Encender, secuencias, semáforo |
| 15-18 | PCB DRAGON RC: Botones | Leer, toggle, contador |
| 19-24 | TB6612FNG: Motores | Control PWM, funciones movimiento |
| 25-28 | Bluetooth | Control inalámbrico desde celular |
| 29-34 | Proyecto RC | Ensamblaje y competencia |

**Prácticas Previas al Proyecto RC**:
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

### 9° EGB - Seguidor de Línea ⭐
| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Repaso | Sensores IR |
| 3-5 | ESP32 Super Mini | Configuración, pines |
| 6-10 | Sensores IR | Fundamentos, conexiones, estados |
| 11-14 | Lógica Seguidor | Pseudocódigo, implementación |
| 15-17 | PCB RC DRAGON V2 | Conexiones, ensamblaje |
| 18-23 | Proyecto Seguidor | Ensamblaje, calibración |
| 24-29 | Competencia | Pista, práctica, carrera |

**Prácticas Previas al Proyecto Seguidor**:
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

### 10° EGB - Evita Obstáculos ⭐
| Semana | Módulo | Contenido |
|--------|--------|-----------|
| 1-2 | Kit Extra: Aplicaciones | Sensores y decisiones |
| 3-8 | Sensor HC-SR04 | Fundamentos, código, LEDs, buzzer |
| 9-12 | Algoritmo Evasión | Diseño, implementación, mejoras |
| 13-15 | PCB DRAGON RC | Integración sensor + motores |
| 16-18 | Proyecto Ensamblaje | Montar sensor, código final |
| 19-21 | Optimización | Ajustes, giros, aleatoriedad |
| 22-27 | Laberinto | Diseño, pruebas, competencia |

**Prácticas Previas al Proyecto Evita Obstáculos**:
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

## 📁 Archivos CSV Generados

| Archivo | Contenido | Registros |
|---------|-----------|-----------|
| `lessons_robotica_primaria.csv` | 4°-7° EGB | 85 lecciones |
| `lessons_robotica_expandido.csv` | 8°-10° EGB | 88 lecciones |
| `tasks_robotica.csv` | Tareas todos los grados | 32 tareas |

---

## 🔌 Pines de las PCBs

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

## 📋 Cómo Importar a Airtable

1. **Abrir Airtable** → Base de ChaskiBots
2. **Importar CSV** → Seleccionar archivo
3. **Mapear columnas**:
   - `levelId` → ID del nivel
   - `moduleName` → Nombre del módulo
   - `title` → Título de la lección
   - `type` → Tipo (video/activity/tutorial/project)
   - `duration` → Duración
   - `order` → Orden
   - `videoUrl` → URL del video (agregar después)
   - `content` → Descripción
   - `locked` → Bloqueado (true/false)
   - `programId` → robotica

4. **Agregar videos** después de importar

---

## ✅ Resumen

| Categoría | Cantidad |
|-----------|----------|
| Lecciones 4°-7° EGB | 85 |
| Lecciones 8°-10° EGB | 88 |
| **Total Lecciones Robótica** | **173** |
| Tareas Robótica | 32 |
| Proyectos Principales | 3 (RC, Seguidor, Evita Obstáculos) |

