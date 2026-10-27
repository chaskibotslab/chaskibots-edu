# Plan F2: piezas y taller de ensamblaje

Diseño: `docs/superpowers/specs/2026-10-27-laboratorio-robotica-taller-design.md` (§1, §2, §7 y la fila F2 de §9).

**Resultado visible de F2**: en `/laboratorio` el alumno abre el **taller**, elige un chasis (2WD o 4WD, en acrílico, MDF, aluminio o PLA), encastra motores, ruedas, servos y sensores, cambia llantas en un toque y ve en vivo peso, centro de gravedad y medidas. Puede abrir los prearmados **seguidor de línea** y **evita obstáculos**, programarlos en C++ y probarlos en las pistas de F1 o en el **campo libre** con obstáculos. Se ve en alta definición con calidad adaptable en celular, tablet y laptop.

**Fuera de F2** (por fase): cableado manual, bloques y guardado en cuenta → F3; ESP32 y RC → F4; competencias → F5. En F2 los cables se generan automáticamente (visibles en la pestaña Cablear, solo lectura) y el robot en edición se guarda como borrador en el navegador.

**Archivos**: todo dentro de `src/modules/laboratorio`. No se toca ningún archivo existente fuera del módulo. No se agregan dependencias.

## Tareas

### T1. Tipos de pieza y migración del catálogo
- `catalogo/tipos.ts`: `PiezaDef`, `PuntoMontaje`, `TipoMontaje`, `PinDef` (con voltaje), `Comportamiento` (unión discriminada), `MaterialFisico` con tabla de fricción por par de materiales.
- `catalogo/piezas/*.ts`: las 8 piezas de F1 pasan de JSON a TS, con montajes y colisionadores. Se borran los JSON.
- `catalogo/index.ts`: `CATALOGO`, `pieza(id)`, `piezasPorFamilia()`; `componente()` queda como alias mientras dure la migración.
- Test `catalogo.test.ts`: ids únicos, pines únicos por pieza, cada `encaja` existe como tipo de montaje en alguna pieza, masas > 0, colisionadores válidos.

### T2. Piezas nuevas de F2
Servo SG90 y MG90S; HC-SR04; FC-51; rueda 65 mm plástico; rueda 43 mm goma; chasis 4WD; variantes de material del chasis (acrílico, MDF, aluminio, PLA: cambian masa, color/textura y fricción); batería 9 V con portapilas; soporte de sensor frontal; soporte de servo (para el «radar» del evita obstáculos).
- Cada pieza con datos reales (masa, medidas, torque, rpm, rango del sensor) y la fuente anotada en un comentario.
- `enKits`: marcado para las piezas que existen en `materiales` (SG90, HC-SR04, FC-51, UNO, batería 9 V).

### T3. Documento de robot y ensamblaje
- `robots/doc.ts`: `RobotDoc` v2 (árbol de piezas + cables + programa).
- `engine/ensamblaje.ts` (puro): recorre el árbol y calcula la pose de cada pieza, masa total, centro de gravedad, caja envolvente; `puedeEncastrar(doc, pieza, montaje)`; `encastrar`, `quitar` (con descendientes), `reemplazar` (conserva hijos compatibles), `rotar`.
- Seguidor de F1 reescrito como `RobotDoc` (`robots/prearmados/seguidor.ts`) con las mismas posiciones efectivas.
- Test `ensamblaje.test.ts`: poses del seguidor iguales a las de F1 (± 0,5 mm), masa igual, quitar un motor quita su rueda, reemplazar rueda 65→43 conserva el motor, montaje incompatible rechazado.

### T4. Cableado automático y netlist general
- Cada pieza declara `cableadoTipico` (qué pin suyo va a qué clase de pin de la placa: PWM, digital, analógico, alimentación).
- `engine/autocableado.ts` (puro): asigna pines libres de la placa respetando capacidades (PWM para ENA/ENB y servos; ADC para analógicos; pines con interrupción preferidos para ECHO) y genera cables con colores por función; produce la **tabla de pines**.
- `engine/netlist.ts` generalizado a `RobotDoc`: N motores (lado y posición según la pose), servos, HC-SR04, FC-51, IR de línea.
- Tests: el seguidor autocableado usa pines válidos; agregar un servo toma un pin PWM libre; 4WD con L298N agrupa motores por lado; quitar una pieza libera sus pines.

### T5. Física desde el ensamblaje
- `engine/fisica/robotFisico.ts`: cuerpo con colisionador compuesto (colisionadores de las piezas en su pose, masa por pieza → centro de masa real).
- Ruedas: modelo de neumático de F1 generalizado a N ruedas; normal por rueda medida con rayo de suspensión corta (no 40 % fijo); μ según material de rueda × material de piso.
- Servos: cuerpo hijo unido con articulación de revolución con motor de posición limitado por el torque del servo; lo que cuelga del servo se mueve con él (sensor sobre servo).
- `physics.ts` de F1 queda como envoltorio de compatibilidad hasta terminar T8.
- Tests: los de `physics.test.ts` adaptados (recto a ω·R, gira al lado correcto, gravedad cero no avanza); 4WD avanza recto; rueda de goma acelera más que la de plástico en el mismo piso; servo llega a 90° en < 0,3 s sin carga.

### T6. Sensores nuevos
- `bridge.ts`: `fc51Digital(distancia)` (LOW con obstáculo a 2–30 cm según umbral); `hcsr04EchoMicros` ya existe; `servoPulseToAngle` ya existe.
- Física: rayos hacia adelante desde la pose del sensor (HC-SR04: cono de 5 rayos, 15°; FC-51: 1 rayo) contra obstáculos y paredes.
- Worker AVR: el HC-SR04 se resuelve **dentro del worker** con `EdgeListener`: flanco de bajada en TRIG → tras 450 µs ECHO en ALTO durante `hcsr04EchoMicros(distancia)`. La distancia más reciente llega en cada mensaje `step`.
- Servo: ancho de pulso = `duty / freqHz` del pin → ángulo → objetivo de la articulación.
- Fixtures nuevos compilados con el `lab-compiler` local (`C:\labdev`): `ultrasonido.hex` (pulseIn + Serial), `servo.hex` (Servo.h barrido).
- Tests: con `ultrasonido.hex` y distancia simulada 20 cm, el sketch imprime 19–21 cm; con `servo.hex` el ángulo medido sigue el barrido ± 3°.

### T7. Núcleo y simulación genéricos
- `engine/nucleo.ts` y `engine/simulation.ts` pasan de `RobotDef` a `RobotDoc` + plan; lecturas de todos los sensores; voltajes a N motores; objetivos de servos.
- Protocolo del worker: `step` agrega `distancias` por instancia de ultrasonido.
- Tests de lazo cerrado: el seguidor (prearmado nuevo) recorre óvalo y curvas con las mismas tolerancias de F1; el **evita obstáculos** corre 60 s simulados en el campo libre sin tocar ningún obstáculo y recorriendo > 3 m.

### T8. Arenas de F2
- `arenas/tipos.ts`: `ArenaDef` (piso y su material, objetos estáticos/móviles, salidas, reglamento opcional).
- `arenas/pistas.ts`: envuelve las pistas de F1 (incluida la imagen subida por el usuario).
- `arenas/campoLibre.ts`: piso amplio, cajas y paredes; disposición aleatoria con semilla.

### T9. Prearmados y plantillas
- `robots/prearmados/evitaObstaculos.ts`: 2WD, UNO, L298N, HC-SR04 sobre SG90 al frente, batería.
- `robots/prearmados/index.ts`: galería con miniatura, descripción, dificultad y plantillas de código.
- Plantillas: código comentado en español que usa la tabla de pines del autocableado (constantes al inicio), para que funcione aunque el alumno haya cambiado piezas.

### T10. Realismo visual y calidad adaptable
- `ui/modelos/`: modelos procedurales detallados con medidas reales (PCB con componentes, motor TT con caja amarilla y eje, rueda con dibujo de goma, servo con tornillos, HC-SR04 con los dos transductores) y materiales PBR por material físico.
- Soporte de `.glb` (Draco/Meshopt, `useGLTF` de drei ya instalado) para cuando haya modelos con licencia libre; la ficha elige `proc:` o URL.
- Escena: entorno de estudio, sombras suaves, ACES, antialiasing; mesa de trabajo para el taller.
- `ui/calidad.ts`: nivel alto/medio/bajo por GPU detectado y fps medidos (ajusta DPR, sombras y post-proceso); selector manual.

### T11. Taller de ensamblaje (UI)
- `ui/taller/Taller.tsx` con pestañas **Armar · Cablear · Programar · Probar** (Programar y Probar reutilizan la UI de F1 adaptada).
- **Armar**: cajón de piezas por familia (lateral en ≥ 1024 px, bandeja inferior en celular) con etiqueta «En kits»; arrastrar (pointer events, válido para mouse y táctil) → se iluminan los montajes compatibles → encastre al soltar; panel de la pieza seleccionada (ficha, cambiar por compatible, girar, quitar); datos en vivo (peso, CG, medidas); deshacer/rehacer; vista explosionada; lista de materiales imprimible.
- **Cablear** (solo lectura en F2): cables autogenerados en 3D y tabla de pines.
- Galería de prearmados al entrar: «Empezar desde cero» o abrir un prearmado.
- Borrador del robot en `localStorage` (con try/catch); guardado en cuenta en F3.

### T12. Verificación y publicación
- `npx vitest run src/modules/laboratorio` en verde (F1 + F2).
- `tsc --noEmit` y `next build` desde un worktree limpio (sin archivos ignorados).
- Smoke test de rutas existentes (`scripts/smoke-rutas.mjs`).
- Prueba manual en el navegador: armar un 4WD desde cero, cambiar llantas, abrir y correr ambos prearmados; perfil de fps con calidad alta y en modo celular (DevTools, CPU 4× más lento).
- Mostrar al usuario funcionando en local; con su aprobación, merge a `main` y despliegue.
