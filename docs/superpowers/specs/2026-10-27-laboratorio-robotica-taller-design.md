# Laboratorio de Robótica: taller, competencias y brazo (F2–F7)

Fecha: 2026-10-27 · Estado: diseño aprobado por partes en conversación, pendiente de revisión del documento.

F1 (publicado el 2026-10-27) ofrece un solo robot fijo: seguidor de línea 2WD con Arduino UNO emulado (avr8js), física Rapier y editor Monaco. Este documento define cómo pasar a un simulador realista donde el alumno **arma** sus robots, los **cablea**, los **programa** con bloques o C++ y los **prueba o compite** en arenas, con retos del docente y torneos entre compañeros.

## Decisiones tomadas con el usuario

| Tema | Decisión |
|---|---|
| Alcance | Todo, por fases, coherente: un solo sistema de piezas sobre el que se construyen todas las funciones |
| Piezas | Piezas de los kits reales (marcadas «En tu kit», enlazadas a `materiales`) + catálogo amplio del mercado |
| Ensamblaje | Encastrar en puntos de montaje (no colocación libre, no configurador por menús) |
| Cableado | Pin a pin con verificación en vivo + botón «Conectar automáticamente» |
| Placas | Arduino UNO y Nano (emulación exacta avr8js) + ESP32 DevKit y ESP32-C3 (simulación a nivel de API Arduino) |
| Programación | Bloques (Blockly) que generan C++ visible + modo código C++. Bloques → código es de una sola vía |
| Guardado | Guardar en la cuenta, retos del docente con entrega, competir contra compañeros del mismo curso |
| Equipos | Celulares, tablets y laptops, con alta definición y calidad adaptable |
| Tecnología | Ampliar la base de F1 (React Three Fiber + Rapier + avr8js). Se descartaron Babylon.js (reescritura) y Unity WebGL (pesado en celulares) |

Reglas de F1 que se mantienen: rama `feature/laboratorio-robotica`; todo detrás de `LAB_ENABLED`; código nuevo solo dentro de `src/modules/laboratorio` (más rutas delgadas en `src/app/laboratorio`, `src/app/api/lab` y `services/`); tablas nuevas solo con prefijo `lab_` y script `down`; dependencias se agregan, nunca se actualizan; **cualquier cambio a un archivo existente fuera del módulo se muestra como diff y espera aprobación**.

## 1. Sistema de piezas

Hoy `RobotDef` mezcla piezas con una geometría fija de 2 ruedas (`vias_mm`, `radio_rueda_mm`) y `physics.ts` asume exactamente dos ruedas motrices y una rueda loca. Se reemplaza por un modelo donde **todo se deriva de las fichas de las piezas**.

### Ficha de pieza (`PiezaDef`, evolución de `ComponenteDef`)

```ts
interface PiezaDef {
  id: string; nombre: string; familia: Familia; descripcion: string
  kit?: { materialId: string }                 // enlaza con materiales.id → «En tu kit»
  visual: { modelo: string; material?: MaterialVisual; escala?: number }  // .glb comprimido o "proc:<nombre>"
  fisica: {
    masa_g: number
    colisionador: Colisionador[]               // cajas/cilindros/esferas simples, separado del modelo visual
    material?: MaterialFisico                  // goma, plástico, acrílico, MDF, aluminio, PLA → fricción/rebote
  }
  montajes: PuntoMontaje[]                     // dónde se le puede encastrar algo
  encaja: TipoMontaje[]                        // en qué tipos de punto se puede encastrar ella
  pines: PinDef[]                              // con tipo y voltaje (3.3 / 5 / VIN / potencia)
  comportamiento: Comportamiento               // unión discriminada por `tipo`
  variantes?: { material?: MaterialVisualFisico[]; color?: string[] }      // p. ej. chasis en acrílico/MDF/aluminio/PLA
}

interface PuntoMontaje {
  id: string; tipo: TipoMontaje               // 'soporte-motor' | 'eje-rueda' | 'eje-servo' | 'placa' | 'sensor-frontal' | 'pala' | 'eslabon' ...
  posicion: [number, number, number]           // mm, marco de la pieza
  orientacion: [number, number, number]        // grados
  rotacionesPermitidas?: number[]              // giros permitidos al encastrar (p. ej. [0, 180])
}
```

`Comportamiento` es una unión cerrada con su lógica pura en `engine/bridge.ts` y su test: `mcu`, `motor-dc`, `servo`, `driver-puente-h` (L298N, TB6612), `driver-servos` (PCA9685), `bateria`, `ir-reflectivo`, `ir-obstaculo`, `ultrasonido`, `color`, `receptor-rc`, `rueda`, `rueda-loca`, `oruga`, `estructura` (chasis, soportes, palas, eslabones), `pinza`.

Las fichas se escriben como **módulos TypeScript** (`catalogo/piezas/*.ts`), no JSON. Así se evita el problema de `*.json` en `.gitignore` que rompió el primer despliegue de F1 y se tipan las fichas. Los 8 JSON de F1 se migran.

### Familias y piezas por fase

| Familia | F2 | Después |
|---|---|---|
| Placas | Arduino UNO | Nano (F3), ESP32 DevKit V1 30 pines y ESP32-C3 Super Mini (F4) |
| Chasis | 2WD, 4WD; variantes acrílico, MDF, aluminio, PLA | Minisumo 10×10, sumo 20×20, soccer redondo, tanque (F5); base de brazo (F7) |
| Movimiento | Motor TT, ruedas 65 mm goma / 65 mm plástico / 43 mm goma, rueda loca | N20, oruga, omnidireccional (F5) |
| Servos | SG90, MG90S | MG996R, articulaciones (F7) |
| Sensores | TCRT5000, FC-51, HC-SR04 | Color, receptor RC / HC-05 (F4) |
| Electrónica | L298N, batería 2×18650, batería 9 V | TB6612 (F3), PCA9685 (F7), LiPo (F5) |
| Mecánica | Soporte de sensor, soporte de servo | Pala de sumo (F5), eslabones y pinza (F7) |

### Robot = árbol de piezas + cables + programa

```ts
interface RobotDoc {
  version: 2
  nombre: string
  placa: 'uno' | 'nano' | 'esp32' | 'esp32c3'
  raiz: string                                 // instancia del chasis
  piezas: { id: string; pieza: string; variante?: string; etiqueta: string
            padre?: { instancia: string; montaje: string; rotacion: number } }[]
  cables: { de: [string, string]; a: [string, string]; color: string }[]
  programa: { modo: 'bloques'; blockly: object; cpp: string } | { modo: 'codigo'; cpp: string }
}
```

La posición de cada pieza **no se guarda**: se calcula recorriendo el árbol de montajes (`engine/ensamblaje.ts`). Esto hace imposible un robot con piezas flotando y permite cambiar una rueda sin recalcular nada a mano. De ahí salen también la masa total, el centro de gravedad y la caja que lo envuelve (para reglas de peso y medidas).

### Física construida desde el árbol (`engine/fisica/`)

- **Cuerpo principal**: un cuerpo rígido con un colisionador compuesto (los colisionadores de todas las piezas fijas, cada uno con su masa y material). El centro de masa y la inercia salen solos.
- **Ruedas motrices**: se generaliza el modelo de neumático de F1 de 2 a N ruedas. Cada rueda tiene su motor, su radio, su μ (material de la rueda contra el material del piso) y su **normal medida** con un rayo de suspensión corta (en vez del 40 % fijo de F1). Así funcionan 2WD, 4WD, volcaduras y ruedas en el aire.
- **Orugas**: varias ruedas virtuales por lado con el mismo motor.
- **Servos y articulaciones**: cuerpos rígidos unidos con articulaciones de revolución de Rapier con motor de posición (PD) limitado por el torque real del servo. Una pinza agarra por fricción real.
- **Contactos entre robots y objetos** (sumo, soccer, rescate): con los colisionadores y materiales reales. Se usa el paquete `@dimforge/rapier3d-deterministic-compat` (mismo autor, misma versión) con paso fijo de 1/240 s para que **el mismo robot con el mismo programa dé exactamente el mismo resultado** en cualquier equipo: es la base de las entregas verificables (§6).

Compatibilidad: el seguidor de F1 se reescribe como robot prearmado con este sistema. Los tests de F1 (`bridge`, `avrRunner`, `physics`, `lazoCerrado`) se mantienen y se adaptan; el de lazo cerrado debe seguir pasando con las mismas tolerancias.

## 2. Taller de ensamblaje

Pestañas: **Armar → Cablear → Programar → Probar**.

- Escena 3D con mesa de trabajo e iluminación de estudio; órbita, zoom y encuadre con mouse o gestos táctiles.
- **Cajón de piezas** por familia (barra lateral en laptop, bandeja inferior deslizable en celular). Las piezas del kit del alumno aparecen primero con la etiqueta «En tu kit» (kit del curso del alumno según su sesión).
- **Encastre**: se empieza por un chasis (o un prearmado). Al arrastrar una pieza se iluminan solo los puntos compatibles; al soltar cerca de uno, la pieza se encastra. Rotaciones solo entre las permitidas.
- **Pieza seleccionada**: ficha, cambiar por otra compatible del mismo montaje (cambiar llantas en un toque), girar, quitar (quita también lo que cuelga de ella, con confirmación).
- **Datos en vivo**: peso, centro de gravedad, medidas; avisos de reglamento de la arena elegida («Excede 500 g: no válido para minisumo»); avisos de física («Ruedas muy pequeñas para este peso»).
- Deshacer/rehacer sin límite (historial de `RobotDoc`), vista explosionada, lista de materiales imprimible con marcas de qué trae el kit.
- Celular: puntos de encastre agrandados; mantener presionado = ficha.

## 3. Cableado

- Vista 3D (cables sobre el robot) y **vista de esquema** plana (la preferida en celular), alternables.
- Tocar pin → tocar pin = cable; color por función. Cada pin explica su uso.
- **Conectar automáticamente**: cada pieza declara su cableado típico por placa; el alumno ve y puede cambiar cada cable.
- **Tabla de pines** (`Sensor izquierdo → D2`), que alimenta los bloques y el inicio del código.
- **Verificación** (`engine/verificacion.ts`, funciones puras con tests):
  - Errores que bloquean probar: motor directo a la placa sin driver, cortocircuito VCC–GND, pieza alimentada sin tierra común.
  - Advertencias que dejan probar y se reflejan en la simulación: 5 V en pin de 3,3 V (ESP32), velocidad en pin sin PWM, batería insuficiente para la corriente de los motores, pin de entrada sin conectar.
  - Coherencia código–cables: el código usa un pin que no tiene cable.
- Lo que no está conectado no funciona en la simulación (la netlist de F1 ya trabaja así).
- Cada placa declara sus pines reales, voltaje lógico y capacidades (PWM, ADC, I2C). Cambiar de placa reasigna cables equivalentes y avisa los que no tienen equivalente.

## 4. Programación y ejecución

### Bloques

- Blockly (ya está en `package.json`) con bloques en español: movimiento, servos, sensores, control, matemáticas, serie y radio.
- **Bloques generados desde el robot**: solo aparecen sensores y actuadores presentes, con sus etiquetas («sensor izquierdo», no «pin 2»).
- Generador propio a C++ Arduino, legible y comentado, visible en vivo debajo del área de bloques. «Pasar a código» copia el C++ al modo código (una sola vía, con aviso).
- Los bloques de alto nivel («avanzar 70 %») se traducen a código según el driver cableado (L298N o TB6612) usando la tabla de pines.

### Código

- Editor Monaco de F1, autocompletado de la API Arduino y de las librerías permitidas, errores del compilador traducidos a mensajes en español en la línea correspondiente.

### Ejecución

- **UNO y Nano**: como F1. `lab-compiler` compila con arduino-cli (core AVR) y el `.hex` corre en avr8js dentro de un Web Worker, sincronizado ciclo a ciclo con la física.
- **ESP32 y ESP32-C3**: el sketch se compila en `lab-compiler` a **WebAssembly** (clang/emscripten) contra una **biblioteca que imita la API Arduino-ESP32** (`pinMode`, `digitalWrite/Read`, `analogRead` 12 bits, `ledcAttach/ledcWrite`, `ESP32Servo`, `Serial`, `millis/delay`, `BluetoothSerial` y WiFi simulados). `delay()` y `millis()` usan un reloj virtual que avanza con la física (Asyncify), de modo que el sistema sigue siendo determinista. Diferencias aceptadas y explicadas al alumno: tiempos aproximados (no ciclo a ciclo), WiFi/Bluetooth solo dentro del simulador.
- Interfaz común `Ejecutor` (`engine/ejecutores/avr.ts`, `engine/ejecutores/wasm.ts`): recibe entradas de pines, avanza N µs, devuelve el estado de pines y la salida serie. La simulación no sabe qué placa corre.
- Durante la prueba: Monitor Serie, panel de pines en vivo con PWM, gráfica de sensores, pausa, paso a paso, cámara lenta, reiniciar posición.
- **Llevar al robot real**: descargar `.ino` y la lista de cables / materiales.

## 5. Arenas, competencias y radiocontrol

Cada arena es un módulo (`arenas/<id>.ts`) con: geometría y materiales del piso, objetos, posiciones de salida, reglamento (límites de peso y medidas) y **juez** (función pura que observa el estado de la simulación y devuelve eventos y puntaje).

| Arena | Contenido | Juez |
|---|---|---|
| Pistas de línea | Óvalo, curvas, intersecciones, imagen del docente (F1) | Tiempo de vuelta, salidas de pista |
| Obstáculos / laberinto | Cajas, paredes, laberintos generados o elegidos | Llegar a la meta sin chocar, tiempo |
| Carrera de velocidad | Recta y circuito, carriles paralelos | Tiempo, contra reloj o contra compañero |
| Rescate | Línea por salas, víctima (lata o pelota), zona segura | Puntos por etapa, tiempo |
| Minisumo | Dojo 77 cm, borde blanco; robot ≤ 10×10 cm, ≤ 500 g | Sacar al rival, 2 de 3, cuenta regresiva de 5 s |
| Sumo | Dojo 154 cm; robot ≤ 20×20 cm, ≤ 3 kg | Igual que minisumo |
| Soccer | Cancha, arcos, pelota; 1 vs 1 o 2 vs 2 | Goles, dos tiempos |
| Lanzador | Servo o catapulta, canastas y blancos con distinto puntaje | Puntos por lanzamiento |
| Mesa del brazo | Objetos de distintas formas y pesos, cajas de destino | Objetos bien ubicados, tiempo |
| Campo libre | Piso amplio, rampas, obstáculos movibles | Sin juez (exploración, RC) |

- **Rivales de práctica**: robots prearmados con programas en 3 niveles por arena.
- **Repetición**: se graba la entrada de cada paso (no video); con física determinista se reproduce exacta, también en cámara lenta y con cualquier cámara.
- **Cámaras**: general, seguimiento, desde el robot.
- **Radiocontrol**:
  1. Manejo directo: joystick táctil, teclado (flechas / WASD) o gamepad (Gamepad API). Mueve los motores sin programa.
  2. Robot RC programado: pieza receptor (HC-05 o Bluetooth del ESP32). El mando en pantalla envía bytes que el programa lee con `Serial.read()` o con bloques «si el botón A…». El mismo código sirve en el robot real con una app de control Bluetooth.

## 6. Guardado, retos y torneos

Todo pasa por rutas API del servidor con el cliente service-role (como el resto de la plataforma); RLS cerrada, sin acceso anon. Tablas nuevas `lab_*`, cada migración con su `down`, entregadas como SQL para pegar en Supabase.

| Tabla | Para qué |
|---|---|
| `lab_robots` | Robot del alumno: dueño, nombre, `RobotDoc` (JSONB), miniatura, marca «campeón» por arena |
| `lab_robot_versiones` | Historial (últimas N versiones por robot) |
| `lab_retos` | Reto del docente: curso, arena, condiciones (solo kit, solo bloques, placa, presupuesto), criterio, fecha límite; retos de plantilla con curso nulo |
| `lab_entregas` | Robot congelado (copia del `RobotDoc`), resultado declarado, resultado verificado, repetición |
| `lab_torneos`, `lab_combates` | Llaves o liga por curso, combates con semilla y resultado |

- **Entrega verificable**: el servidor vuelve a correr la prueba con el `RobotDoc` congelado, la misma semilla y el mismo motor (AVR en JS; ESP32 con el mismo `.wasm`), sin navegador. Se ejecuta en un servicio aparte (`services/lab-juez`, mismo patrón que `lab-compiler`: Docker, clave compartida, se duerme sin uso) para no cargar la web. El resultado verificado es el que vale.
- **Torneos y desafíos**: solo entre alumnos del mismo curso y colegio. Se muestra nombre del robot y del alumno. El código de otro alumno nunca se envía al navegador de un compañero: los combates se simulan en `lab-juez` y el navegador recibe la repetición (entradas y estados), no el programa.
- Las entregas aparecen con las demás tareas del curso (la integración con la vista existente del docente se propone como diff aparte en F6).

## 7. Realismo y rendimiento

- **Modelos 3D**: `.glb` con compresión Draco/Meshopt y texturas KTX2, de bibliotecas con licencia libre (CC0 / CC-BY, con créditos en la ficha) o generados por código con medidas reales. Cada pieza se descarga al usarse.
- **Render**: materiales PBR, mapa de entorno de estudio, sombras suaves, tone mapping ACES, antialiasing.
- **Calidad adaptable** (`ui/calidad.ts`): nivel alto / medio / bajo según el GPU detectado y los cuadros por segundo medidos; ajusta resolución de render, sombras y post-proceso. La física y el resultado nunca dependen de la calidad.
- Metas: 60 fps en laptop con calidad alta; ≥ 30 fps en celular de gama media; primera carga de escena < 10 MB en celular.

## 8. Pruebas

- Tests unitarios por comportamiento: velocidad del motor, ángulo del servo, distancia del ultrasonido, verificaciones de cableado, cálculo de ensamblaje (posiciones, masa, centro de gravedad).
- **Test de determinismo**: mismo robot + programa + semilla → estado final idéntico bit a bit, dos veces seguidas.
- **Lazo cerrado por prearmado**: el seguidor termina la pista, el evita obstáculos no choca, el minisumo vence al rival fácil, el brazo deja el objeto en la caja.
- Generador de bloques: cada bloque produce C++ que compila (contra `lab-compiler` en local).
- Smoke test de rutas existentes (como F1).
- Antes de cada publicación: `git status --ignored` del módulo y build desde un worktree limpio.

## 9. Fases

Cada fase se publica funcionando detrás de `LAB_ENABLED` y espera la revisión del usuario antes de la siguiente.

| Fase | Entrega |
|---|---|
| **F2 Piezas y taller** | `PiezaDef` + `RobotDoc` + ensamblaje + física desde el árbol (N ruedas, servos simples) + taller con encastre + calidad adaptable + modelos realistas de las piezas de F2. Prearmados: seguidor de línea (migrado) y evita obstáculos (HC-SR04 sobre servo). Arenas: pistas de F1 y campo libre |
| **F3 Cableado, bloques y guardado** | Cableado manual con verificación y vista de esquema, Arduino Nano, TB6612, Blockly con generador C++, `lab_robots` + versiones |
| **F4 ESP32 y radiocontrol** | Ejecutor WASM para ESP32 / ESP32-C3, manejo directo, receptor RC programable, arenas obstáculos/laberinto y carrera |
| **F5 Competencias** | Física determinista, minisumo, sumo, soccer, rescate, lanzador, jueces, rivales de práctica, repeticiones |
| **F6 Retos y torneos** | `lab-juez`, retos y entregas verificables, torneos, desafíos, tablas de posiciones |
| **F7 Brazo robótico** | Eslabones, servos articulados, PCA9685, pinza, mesa del brazo, prearmado de brazo |

## Fuera de alcance

- Colocación libre de piezas y modelado 3D de piezas por el alumno (el `CADLab` existente no se toca).
- Emulación ciclo a ciclo del ESP32; WiFi o Bluetooth reales hacia fuera del simulador.
- Competencias entre colegios distintos o abiertas al público.
- Cargar programas al robot físico desde el navegador (se descarga el `.ino`).

## Riesgos

- **Rendimiento en celulares** con varios robots y contactos (sumo, soccer): se mide en F2 con el perfil de calidad y se limita el número de colisionadores por pieza.
- **Simulación ESP32 por API**: código que usa registros directos o librerías fuera de la lista no compila; el mensaje debe decirlo claro.
- **Tamaño de la imagen de `lab-compiler`** al agregar emscripten: se mide en F4; si crece demasiado, se separa en `lab-compiler-esp32`.
- **Licencias de modelos 3D**: solo CC0/CC-BY, con créditos guardados en la ficha.
