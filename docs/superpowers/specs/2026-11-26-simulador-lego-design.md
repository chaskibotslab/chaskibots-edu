# Simulador LEGO (EV3 + WeDo 2.0) — Diseño

Fecha: 2026-11-26
Autor: ChaskiBots (con Claude)

## Objetivo

Dos simuladores profesionales de robótica LEGO dentro de la plataforma:
**LEGO MINDSTORMS EV3** y **LEGO WeDo 2.0**. Programación por bloques
(Blockly) + robot virtual en 3D que responde en tiempo real, con **misiones
guiadas** y **modo libre**.

## Decisiones aprobadas por el usuario

- Experiencia: **misiones guiadas + modo libre**.
- Vista: **3D** (react-three-fiber, ya usado en el Lab CAD).
- Un **motor compartido** alimenta ambos simuladores; cambian robot, bloques y misiones.

## Arquitectura

Carpeta `src/components/lego/`:

- `engine.ts` — `LegoMotor`: simulación cinemática (tracción diferencial) y
  lectura de sensores. Framework-agnóstico. Expone el estado del robot
  (x, z, ángulo, velocidades de rueda, lápiz de rastro) y una API que usan
  los bloques compilados. Bucle de integración por `dt` fijo.
- `bloquesEV3.ts` / `bloquesWedo.ts` — definición de bloques Blockly + toolbox
  + generador que produce llamadas `api.*` (patrón de ChaskiBlocks:
  `AsyncFunction('api', codigo)`).
- `misionesEV3.ts` / `misionesWedo.ts` — misiones (tapete, obstáculos, metas,
  objetivo, pasos de guía y función de logro) + modo libre.
- `Escena3D.tsx` — escena react-three-fiber: tapete (textura de pista por
  canvas), robot (chasis + ruedas + sensores low-poly), obstáculos, zona meta,
  cámara orbitable.
- `EV3Lab.tsx` / `WedoLab.tsx` — componente principal: editor Blockly +
  escena 3D + controles (ejecutar/parar/reiniciar) + selector de misiones +
  pantalla completa (`useExpand`) + `EnviarTarea`.

Integración: 2 simuladores internos nuevos en `SimulatorTabsDynamic`
(`lego-ev3`, `lego-wedo`), categoría "robotica". Sin cambios de base de datos.

## Motor de simulación

- Estado: posición (x,z), ángulo, velocidad de cada rueda, grados girados por rueda.
- Tracción diferencial: v=(vI+vD)/2, ω=(vD−vI)/distanciaEntreRuedas; integra x,z,ángulo por dt.
- API para los bloques (async, como ChaskiBlocks con `pausa`):
  - EV3: `motores(potI, potD)` continuo; `porSegundos`, `porGrados`, `porRotaciones`;
    `avanzar`, `retroceder`, `girar(grados)`, `parar`; `esperar(seg)`;
    sonido/pantalla (texto en el HUD).
  - Sensores (lectura en cada tick): `color()` (muestrea el color del tapete bajo
    el sensor), `distancia()` (raycast al obstáculo/pared más cercano al frente),
    `tactil()` (colisión), `angulo()` (giroscopio).
  - WeDo: `motor(potencia, dir)`, `motorPorSegundos`, `motorParar`, luces, sonido;
    sensores `inclinacion()` y `distancia()`.
- Bucles/condiciones: nativos JS (repetir→for, por siempre→while con `await tick`,
  si/sino→if). Parada cooperativa (como ChaskiBlocks) al pulsar Detener.

## Sensores (sin motor de físicas pesado)

- Color: el tapete se define como un canvas 2D (líneas/zonas de color); el sensor
  lee el pixel bajo su posición proyectada.
- Distancia/ultrasónico: raycast 2D desde el frente del robot a obstáculos y paredes.
- Táctil: colisión AABB/círculo con obstáculos o borde.
- Giroscopio/inclinación: del estado (ángulo).

## Misiones (ejemplos)

- EV3: "Sigue la línea" (color), "Frena antes del muro" (ultrasónico),
  "Estaciona en la zona" (llegar a meta), "Laberinto" (táctil/ultrasónico).
- WeDo: "Haz avanzar a Milo", "Detente ante el objeto" (distancia),
  "Inclina para avanzar" (inclinación).
- Cada misión: tapete, objetivo, pasos de guía y `logro(estado)` → boolean.
  Modo libre: tapete abierto sin objetivo.

## Entrega y UI

- `EnviarTarea` (componente unificado) con resumen (misión, código, logro) + mensaje.
- Pantalla completa con `useExpand`. Tema claro consistente con la plataforma.
- Rendimiento: robot low-poly, cámara fija-orbitable, integración ligera → fluido
  en máquinas modestas.

## Fases de construcción

- **Fase 1:** `engine.ts` + bloques EV3 + 3–4 misiones + modo libre + `EV3Lab` +
  integración + envío de tarea.
- **Fase 2:** WeDo 2.0 (reusa motor; bloques y robot más simples + sus misiones).

## Fuera de alcance (YAGNI)

- Motor de físicas realista (colisiones blandas, fricción avanzada).
- Importar/exportar programas a ladrillos reales.
- Multijugador.
