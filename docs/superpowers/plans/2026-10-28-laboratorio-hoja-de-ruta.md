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
| E | Mesa de electrónica: protoboard, componentes y los proyectos de los kits (semáforo, basurero, riego, estación, domótica, monitoreo) | En curso: E1 semáforo (8vo) |
| F6 | Retos del docente con entrega verificable, torneos por curso | Pendiente |
| F7 | Brazo robótico (servos articulados, pinza, paso a paso) | Pendiente |

## F5, por pasos

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

1. **E1 Semáforo (8vo)** (hecho, sin publicar): protoboard, LED de 5 colores, LED RGB, resistencias 220/330/1k/10k, pulsador, buzzer pasivo y activo, potenciómetro, LDR; panel «Tú controlas» (pulsadores con clic o teclas, perillas, luz), audio del buzzer; proyectos del kit (primer LED, pulsador, buzzer, tres LED, semáforo inteligente) y extra (perilla y brillo, luz nocturna, RGB, juego de reflejos); pruebas con el semáforo real compilado.
2. **E2 Basurero (9no)**: HC-SR04 y servo en la mesa (montajes para módulos), tapa que se abre, mano que se acerca.
3. **E3 Riego (10mo, ESP32)**: sensor de humedad del suelo, relé, bomba de agua (maceta que se seca y se riega).
4. **E4 Estación meteorológica (1ro BGU, ESP32-C3)**: DHT11 (protocolo de un cable emulado), temperatura y humedad ajustables.
5. **E5 Domótica (2do BGU)**: PIR, relé con foco, LDR.
6. **E6 Monitoreo (3ro BGU)**: pantalla LCD 16×2 I2C (TWI emulado).
7. **E7 Extras**: semáforo doble (cruce), display de 7 segmentos, dado, piano, tira NeoPixel, OLED.

Modelos 3D: los componentes simples se dibujan por código con medidas reales;
para los módulos (relé, DHT11, LCD…) conviene descargarlos de Sketchfab
(falta `SKETCHFAB_API_TOKEN` en `.env.local`).

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
