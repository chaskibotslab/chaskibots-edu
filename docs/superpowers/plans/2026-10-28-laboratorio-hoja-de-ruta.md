# Laboratorio de Robótica: hoja de ruta y estado

Diseño completo: `docs/superpowers/specs/2026-10-27-laboratorio-robotica-taller-design.md`.
Cada fase se publica funcionando, con sus pruebas, antes de empezar la siguiente.

| Fase | Entrega | Estado |
|---|---|---|
| F1 | Arduino UNO emulado, física Rapier, editor C++ | Publicado 2026-10-27 |
| F2 | Taller por piezas, modelos 3D reales, 7 proyectos con su lógica, cables Dupont, TB6612 | Publicado 2026-10-27 |
| F3 | Cableado manual con verificación, bloques (Blockly → C++), Arduino Nano, «Mis robots» en la cuenta | Publicado 2026-10-28 (falta pegar el SQL de `lab_robots`) |
| F4 | ESP32 programable (capa ESP32 sobre ATmega2560), robots ESP32, control remoto (teclado, táctil, gamepad, Bluetooth) | Publicado 2026-10-28 |
| F5 | Minisumo, sumo, soccer, rescate, lanzador, jueces, rivales, repeticiones | Pendiente |
| F6 | Retos del docente con entrega verificable, torneos por curso | Pendiente |
| F7 | Brazo robótico (servos articulados, pinza, paso a paso) | Pendiente |

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
