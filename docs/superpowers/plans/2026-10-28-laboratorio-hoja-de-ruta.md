# Laboratorio de Robótica: hoja de ruta y estado

Diseño completo: `docs/superpowers/specs/2026-10-27-laboratorio-robotica-taller-design.md`.
Cada fase se publica funcionando, con sus pruebas, antes de empezar la siguiente.

| Fase | Entrega | Estado |
|---|---|---|
| F1 | Arduino UNO emulado, física Rapier, editor C++ | Publicado 2026-10-27 |
| F2 | Taller por piezas, modelos 3D reales, 7 proyectos con su lógica, cables Dupont, TB6612 | Publicado 2026-10-27 |
| F3 | Cableado manual con verificación, bloques (Blockly → C++), Arduino Nano, «Mis robots» en la cuenta | Publicado 2026-10-28 (SQL de `lab_robots` pegado) |
| F4 | ESP32 programable (capa ESP32 sobre ATmega2560), robots ESP32, control remoto (teclado, táctil, gamepad, Bluetooth) | Publicado 2026-10-28 |
| F5 | Minisumo, sumo, soccer, rescate, lanzador, jueces, rivales, repeticiones | F5.1 minisumo publicado 2026-10-28; sigue F5.2 |
| E | Mesa de electrónica: protoboard, componentes y los proyectos de los kits (semáforo, basurero, riego, estación, domótica, monitoreo) | E1 semáforo (8vo) publicado; E2 basurero (9no) hecho |
| X | Cablear «como en la mesa» y explicaciones: cableado sobre las piezas 3D, qué hace cada pin y cada cable, guía paso a paso, «Qué vas a aprender» | Hecho 2026-11-12 (en la rama, sin publicar) |
| F6 | Retos del docente con entrega verificable, torneos por curso | Pendiente |
| F7 | Brazo robótico (servos articulados, pinza, paso a paso) | Pendiente |

## F5, por pasos

0. **Minisumo RC y placas que caben** (2026-10-30): prearmado «Minisumo RC» (ESP32, chasis de aluminio como lastre) manejado con teclado; plantilla RC para cualquier robot con driver; ninguna placa, driver o batería puede chocar o salirse de su base, tampoco al cambiarla por otra.
1. **F5.1 Minisumo** (hecho): chasis 10 × 10 cm con pala de acero (colisionador inclinado y de poca fricción), micromotor N20, rueda de silicona de 34 mm, LiPo 2S; dohyo de 77 cm (negro con borde blanco, elevado); rival de práctica en 3 niveles (quieto, empujador, cazador) con las mismas piezas y física, cerebro en TypeScript; juez (`engine/competencia.ts`): 5 s de espera con salida en falso, fuera del dohyo, tiempo de ronda, 2 de 3 con salidas frente a frente / de costado / de espaldas; revisión de reglamento (medidas y peso); prearmado «Minisumo» (Nano + TB6612) con su programa; prueba de lazo cerrado: gana 2-0 al rival quieto.
2. **F5.2 Sumo** (dohyo de 154 cm ya creado): chasis y rival de 20 × 20 cm / 3 kg.
3. **F5.3 Repeticiones**: grabar las poses de cada robot y volver a ver el combate.
4. **F5.4 Soccer**: pelota, arcos, juez de goles.
5. **F5.5 Rescate y lanzador**.

## E, mesa de electrónica, por pasos

Pedido del usuario (2026-10-28): muchos más componentes electrónicos y proyectos
como los de los kits (semáforo con microcontrolador y más). La mesa reutiliza
todo el taller: la protoboard es la «base» (como un chasis), los componentes se
pinchan en sus huecos, se cablean, se programan y se prueban con el micro
emulado. `engine/circuito.ts` resuelve el circuito por análisis nodal (LED que
se queman sin resistencia, pull-up, divisores de voltaje, PWM, tone).

1. **E1 Semáforo (8vo)** (publicado el 29/10): protoboard, LED de 5 colores, LED RGB, resistencias 220/330/1k/10k, pulsador, buzzer pasivo y activo, potenciómetro, LDR; panel «Tú controlas» (pulsadores con clic o teclas, perillas, luz), audio del buzzer; proyectos del kit (primer LED, pulsador, buzzer, tres LED, semáforo inteligente) y extra (perilla y brillo, luz nocturna, RGB, juego de reflejos); pruebas con el semáforo real compilado.
2. **E2 Basurero (9no)** (hecho): con Arduino Nano y los pines del kit. La protoboard tiene lugares para el HC-SR04 (borde derecho), un servo (detrás) y una maqueta (a la derecha). La maqueta del basurero lleva el sensor en el frente y el servo acostado en la bisagra; la tapa va en su eje (0° cerrada, 90° abierta). En «Probar», la mano se acerca o se aleja con un control y el sensor mide su distancia. Proyectos del kit: LED indicador, mide distancia, mueve el servo, basurero inteligente, contador de personas, dispensador, puerta automática y alarma de proximidad. La prueba corre el basurero real compilado.
3. **E3 Riego (10mo, ESP32)**: sensor de humedad del suelo, relé, bomba de agua (maceta que se seca y se riega).
4. **E4 Estación meteorológica (1ro BGU, ESP32-C3)**: DHT11 (protocolo de un cable emulado), temperatura y humedad ajustables.
5. **E5 Domótica (2do BGU)**: PIR, relé con foco, LDR.
6. **E6 Monitoreo (3ro BGU)**: pantalla LCD 16×2 I2C (TWI emulado).
7. **E7 Extras**: semáforo doble (cruce), display de 7 segmentos, dado, piano, tira NeoPixel, OLED.

Modelos 3D: los componentes simples se dibujan por código con medidas reales;
para los módulos (relé, DHT11, LCD…) conviene descargarlos de Sketchfab
(falta `SKETCHFAB_API_TOKEN` en `.env.local`).

## C, colecciones de Sketchfab, por pasos

Pedido del usuario (2026-10-30): que los modelos de roboticaparana (colecciones
«Robótica Educacional Módulo 1» y «Primeiros Passos Módulo 4») y «Robô WiFi»
(cleitonrosa) estén funcionales, ordenados y clasificados.

Revisado con la API de Sketchfab el 2026-10-30: 59 modelos distintos, todos gratis.
55 descargables con CC BY (hay que dar crédito). Otros 4 no se pueden descargar:
Aula 31 «em ação», Aula 21 Varal, Aula 18 y Aula 20 Plantas Felizes; esos se
reconstruyen con piezas propias y sin usar su modelo. Muchos repiten el mismo
proyecto con el kit 2021 y el 2023, así que quedan unos 30 proyectos.

Decisión: cada modelo es una escena completa ya armada, de 0,3 a 2,6 millones de
triángulos, y no se puede simular ni manejar como está. Se usan como referencia del
montaje y para recortar las piezas que falten (con su crédito). Cada proyecto se
arma con las piezas del catálogo y corre con el micro emulado, como los actuales.

| Paso | Categoría en la galería | Proyectos (número de Aula) | Piezas nuevas |
|---|---|---|---|
| C1 | Luces | LED y resistor (08), PWM y fade (18–20), Super Máquina (21–22), RGB y arcoíris (25–26) | Ninguna |
| C2 | Semáforos | Carros, cruce, peatones, con botón (09–12, 15) | Ninguna |
| C3 | Entradas y sonido | Pulsador (13), potenciómetro (23), buzzer (24), LDR (27), estacionamiento (35), distancia (34) | Ninguna |
| C4 | Pantallas | 7 segmentos de 1 y 4 dígitos (16), LCD 16×2 (36), OLED (36), trena digital (37) | Displays, LCD, OLED; emular I2C |
| C5 | Sensores | LM35 y DHT11 (29), obstáculo IR (30) | LM35, DHT11 |
| C6 | Robots (hecho) | Motores (31), chasis 2WD (32), seguidor (33), sumô (38), Robô WiFi, aspirador | Ninguna (arena `sala`, WebServer simulado) |
| C7 | Proyectos | Medidor de altura, Smartpot, casa inteligente, plantas felices, varal, macaco trapezista | Maquetas, relé, bomba, humedad |

Estado (2026-10-30): la galería ya se ordena por grupos (`robots/clasificacion.ts`).
Hechos en `robots/proyectosAulas.ts`: LED y resistencias, fade, Super Máquina, semáforo
de carros, de cruce, con peatones y botón, y sensor de estacionamiento. Los temas de
pulsador, potenciómetro, buzzer, LDR, distancia y RGB ya existían y quedaron clasificados.
Falta de C1–C3: las variantes de ánodo común (necesitan otra pieza de LED RGB) y mostrar
la serie completa de cada Aula.

C6 (2026-11-02): grupo nuevo «Motores y chasis» con «Mis primeros motores» (2WD sin
sensores que dibuja un cuadrado; Aulas 31–32). «Robot aspirador» en la arena nueva
`sala` (muebles, patas de mesa y silla, piso con polvo): `engine/limpieza.ts` cuenta las
celdas limpias, la escena dibuja el polvo y el HUD muestra el % limpio; el programa hace
espiral, curva con los IR, rebota con el ultrasonido y se destraba (33 % en 2 min en la
prueba). «Robô WiFi» (ESP32): la capa del ESP32 ahora trae un `WebServer` simulado en el
que cada letra del control remoto es una visita a «/<letra>». Seguidor y minisumo quedan
marcados con las Aulas 33 y 38.

C4, C5 y C7 se cruzan con E4–E7: se hacen juntos para no repetir piezas.
Descargar los modelos requiere `SKETCHFAB_API_TOKEN` en `.env.local` (todavía falta).

## X, cablear como en la mesa y explicar todo (2026-11-12)

Pedido del usuario: que el laboratorio sea «funcional, explicativo en todos los campos y como
real al conectar» (referencia: BenchTwin, capturas en `ejemplo/`).

1. **Cablear sobre las piezas** (`ui/Robot3D.tsx` → `Cableado3D`, `ui/Escena3D.tsx` → `EscenaCablear`):
   la pestaña Cablear abre en la vista «En las piezas». Cada pin es una bolita en su lugar real
   (`anclaPin`), del color de su tipo; los rieles de la protoboard son barras. Tocar una pieza
   acerca la cámara («Ver todo» vuelve); tocar un pin y luego otro pone el cable Dupont entre
   ellos (mientras tanto se ve un cable «fantasma»); tocar un cable lo elige y atenúa los demás.
   El pin gana el toque aunque un cable o la pieza estén delante (`hayPin`). La vista «Esquema»
   (la de antes) sigue ahí y comparte todo el estado.
2. **Explicaciones** (`engine/explicacion.ts`, puro y con pruebas): `explicarPin` (qué hace, a qué
   está unido, cómo se usa en el código, qué cuidar), `explicarCable` (para qué sirve ese cable;
   también explica un cortocircuito o un motor directo a la placa) y `pasosPendientes` (guía: qué
   cable falta y por qué, con «Poner este cable por mí»; sale del cableado automático de
   referencia y se adapta si el alumno usó otro pin u otra resistencia). Todo sale del catálogo:
   no hay textos por proyecto que mantener.
3. **Galería**: cada proyecto muestra «Qué vas a aprender» (`aprendizajes`, según sus piezas).

Pendiente de esta línea: los puntos de los pines del UNO quedan ~2 mm corridos respecto del
modelo GLB (son las anclas de cables de siempre); en la vida real un pin hembra acepta un solo
cable (hoy se dejan poner varios); llevar las mismas explicaciones a Armar (pieza elegida) y a
Probar (qué pasa por cada cable mientras corre).

## M, modelos profesionales de Sketchfab (2026-11-12)

Pedido del usuario: mejorar los robots y proyectos con los mejores modelos de
Sketchfab. Búsqueda hecha con la API pública (sin clave) el 2026-11-12: solo
gratis, descargables y con licencia CC BY (se da crédito en la ficha). Bajarlos
sigue necesitando `SKETCHFAB_API_TOKEN` en `.env.local`, que está vacío.

Elegidos (uid de Sketchfab), por orden de impacto:

| Para | Modelo | Autor | Caras | uid |
|---|---|---|---|---|
| Perro robot | Robot dog Unitree Go1 | cyamahat | 55 k | 926627f69b194b6da4fbf8a31df49303 |
| Perro robot (alternativa) | Robot dog Unitree Go2 | cyamahat | 556 k | 7af84eb9ba834f27bbac818a8b96e2da |
| Robots de combate | Abyss, RipTide, Fathom | FloatingCastleRobotics | 79 k (Fathom) | 0361f5fe…, 0edf3dc8…, afc8c574eb7e48e3b2589cfa11052fef |
| Robot de combate (hormiga) | Ant Weight Battle Bot | WilliamMezitis | 135 k | 8bee21300da44c60b300e325507b9591 |
| Minisumo | Paladino sumo robot, Micro sumo paladin | matheus.nfranca97 | 49 k, 36 k | 58b343517470464099b1ab5970b61805, c70f396029de4fc285f06e31b7400a9b |
| Seguidor de línea | Line Follower Robot | zoe.goodward | 176 k | 11bf9b71d5f34517b404d12c74ddb506 |
| Brazo robótico (F7) | WidowX MKII Robotic Arm | Interbotix | 465 k | 2270059391764e93aa01ad5d6a3000c1 |
| Brazo robótico (ligero) | 4-Axis Arm Assembly | samoubala | 20 k | c0a748faf37644288c1271e9a6f51057 |
| Arduino Nano | Arduino Nano | hackerman_den | 27 k | fa0e94f0c4b44b9e88295346b6cef068 |
| Arduino Nano (ligero) | Arduino Nano V3 Mini USB | rom35076 | 10 k | c32b69f84f874565b9f8ac9a86944ac0 |
| ESP32 | ESP32 WROOM 32, Low Poly Photorealistic | wojteX | 0,7 k | af0851c326ef4cbaa42439f801acbe98 |
| Raspberry Pi | Raspberry Pi 4B | mrdt.club | 52 k | 2e15503c0d0d465bb4d4301c4ba0b4b1 |
| Cámara | Raspberry Pi cam v2.1 | Fa_Sketch | 325 k | 1bbd00ae9d334f52b1b8e5f11063f63c |
| Pila 18650 | Li-ion 18650 (MidPoly) | damir_cgi | 20 k | eefe894897f746f689b899f80b15d325 |
| Batería 9 V | [CC0] Generic 9V Battery | literallylara | 1,7 k | 05e70a17e01a4be08381afe2128284e9 |
| Componentes de mesa | [CC0] Set of Electronic Components | literallylara | 28 k | f4cb777b4ea3490587008e24b61bcf75 |
| Rueda loca | Simple Caster wheel | Blender3D | 1,3 k | 7d9ca73cb40a4862a9d6b8a830803e7e |
| LCD 16×2 | LCD 2004 / 16x2 HD44780 | sinnervoncrawsz | 1,9 k | ea053f7f3c7045e4940769e17f48a0d0 |
| DHT | DHT22 Temperature Sensor Module | sinnervoncrawsz | 3,6 k | c46a658784034c679e4907bbddad0093 |
| Relé | Single Channel Relay Module | peddintiudaykiran176 | 8 k | 50e119a125544c7aa447ac254015594f |
| OLED | SSD1306 OLED Screen 128x32 | jamie3d | 2 k | 7c6f63e7a62b4b2a895b52778426a7ed |

Sin modelo bueno y gratis (siguen dibujados por código): Jetson Nano, Arduino
Mega, Raspberry Pi Pico, motor N20, chasis 2WD y 4WD, portapilas.
Descartados: licencias NonCommercial, réplicas de robots de TV y escenas de más
de 1 M de caras.

Avance 2026-11-12: la clave ya está en `.env.local` y los 22 modelos están en
`modelos-3d/sketchfab/` (carpeta fuera de git, con `licencias.json`). M2 hecho:
el perro usa el modelo real del Unitree Go1 (`public/lab/modelos/perro-go1.glb`,
33 k triángulos, 1,7 MB), separado en tronco, caderas, muslos y piernas con
`scripts/preparar-robots.mjs` y armado en `ui/modelos/Robots3D.tsx`. La física
no cambió: los tramos del modelo miden 130 mm (los de la física, 100 mm) y solo
se dobla más la rodilla. La cámara de Armar ahora se aleja con robots grandes.
M3 hecho (mismo día), tres robots de competencia con modelo real, cada uno
con sus piezas de catálogo, proyecto en la galería y prueba de física:
- «Abyss» (combate, Floating Castle Robotics): `catalogo/piezas/combatePro.ts`
  (carrocería, rueda de 60 mm y tambor de 170 mm que gira), proyecto
  `warbot-abyss`, `abyss.test.ts`. La electrónica va adentro: las piezas con
  `carcasa: true` se ven translúcidas en «Cablear».
- Seguidor de competencia (zoe.goodward): `catalogo/piezas/seguidorPro.ts`
  (chasis con barra de sensores, rueda de 42 mm, rueda loca chica, sensor de
  barra), proyecto `seguidor-pro`, `seguidorPro.test.ts` (óvalo a 0,45 m/s
  con 7 mm de desvío). El N20 del catálogo ahora usa el micromotor de ese modelo.
- Minisumo «Paladín» (matheus.nfranca97): `catalogo/piezas/minisumoPro.ts`
  (carrocería cerrada con rampa, rueda de 31 mm), proyecto `minisumo-paladin`,
  `paladin.test.ts` (mismo programa y cableado que el minisumo; gana 2 a 0).
Los modelos de Tinkercad (una malla por color) se separan por sólidos sueltos
(`dentro` / `fuera` en `preparar-robots.mjs`); los de CAD, por nombre de nodo.
Conexiones con PCB (mismo día, pedido del usuario para evitar la maraña de
cables): `RobotDoc.conexion: 'cables' | 'pcb'`. Con `pcb`, `ui/modelos/Pcb3D.tsx`
dibuja una placa bajo la placa y el driver, las conexiones entre ellos como
pistas, y un mazo plano por cada pieza de afuera hasta un conector en el borde.
El circuito no cambia (`doc.cables` es el mismo): en «Cablear» se sigue viendo
cable por cable. Botón en la barra de «Armar»; los tres robots de competencia
la traen puesta. Prueba: `pcb.test.ts`.
Más robots de combate (mismo día), en `catalogo/piezas/combatePro.ts`, con
PCB puesta y `combatePro.test.ts`:
- «RipTide» (Floating Castle Robotics): tambor de tres tramos entre dos brazos
  y patines al frente; proyecto `warbot-riptide` (mismo programa que el warbot
  de tambor).
- «Fathom» (Floating Castle Robotics): tiburón con arpón, cuatro ruedas con
  cuatro motores; proyecto `warbot-fathom` (radiocontrol, sin arma que gire).
- «Cuña» (Ant Weight Battle Bot, WilliamMezitis): caja con pala; proyecto
  `warbot-cuna` (radiocontrol; se mete debajo del rival y lo empuja).
Descartado: el minisumo «Paladino» grande (una sola malla gris, sin piezas
separables).
M4 revisado (mismo día): solo entra la pila de 9 V (modelo de literallylara,
`bateria-9v.glb`; el «+» del cable va del lado donde el modelo lo trae impreso).
Descartados: la rueda loca (es una rueda de mueble, no la de bola de los kits)
y el ESP32 (sin pines y con menos detalle que la placa hecha por código). Nano,
RPi 4B y 18650 quedan como están: las placas por código ya tienen los pines
alineados con el cableado y cambiarlas no mejora lo que se ve.
Falta: M5 (LCD, DHT22, relé, OLED), que necesita comportamientos nuevos en el
simulador, no solo el modelo.

Pasos:
1. M1: bajar la lista, medir cada modelo (tamaño real, caras) y descartar lo que no sirva.
2. M2: perro Unitree: separar cuerpo y patas para que la marcha siga moviéndolas.
3. M3: robots de combate y minisumo: separar chasis, ruedas y arma (el arma debe girar).
4. M4: placas y componentes: alinear los pines del modelo con `anclaPin`.
5. M5: módulos nuevos (LCD, DHT, relé, OLED), junto con E4–E7.
6. Miniaturas nuevas y créditos en `creditosModelos.ts`.

## F3, por pasos

1. `engine/verificacion.ts`: errores y advertencias eléctricas (con pruebas).
2. Pestaña Cablear interactiva: esquema 2D, tocar pin → tocar pin, quitar cables, conectar automáticamente, verificación en vivo.
3. Cableado manual que se conserva al agregar o quitar piezas (cada pieza nueva se conecta sola a pines libres).
4. Bloques: Blockly en español, bloques según las piezas del robot, generador C++ legible, «Pasar a código».
5. Arduino Nano (pines A6/A7 solo analógicos) y compilación según la placa del robot.
6. «Mis robots»: tablas `lab_robots` y `lab_robot_versiones` (SQL para pegar en Supabase), API y ventana para guardar y abrir.

## Decisión F4: ESP32 sobre ATmega2560

El ESP32 se simula a nivel de API Arduino compilando el sketch para un
ATmega2560 emulado (avr8js) con una capa que imita las funciones del ESP32
(`ledcAttach/ledcWrite`, `analogRead` de 12 bits, `ESP32Servo`, GPIO
numerados como en la placa, WiFi/Bluetooth simulados). Reutiliza el
compilador, el emulador y toda la física; reemplaza la idea de compilar a
WebAssembly del diseño. Límite conocido: `int` es de 16 bits (en el ESP32
real, 32); se explica al alumno.
