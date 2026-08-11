# Diseño: Reconectar simuladores al motor de Academia (piloto)

**Fecha:** 2026-08-11
**Estado:** Propuesto

## Contexto

La plataforma tiene 12 simuladores (7 iframes externos, 4 herramientas internas, ChaskiBlocks) gestionados por nivel/programa desde `/admin/simuladores`. El pedido original era "mejorar todos los simuladores, bien planteados, bien explicados, más funcionales, pensando como docente y como estudiante, por curso".

Al investigar antes de diseñar algo nuevo, se encontró que **ya existe un motor de currículo completo** (`simulator_courses` → `simulator_modules` → `simulator_lessons` → `simulator_progress` en Supabase, con API en `/api/academy` y `/api/academy/progress`, RLS habilitado) que resuelve gran parte de lo pedido — pero está subutilizado y desconectado de las herramientas que debería alimentar.

### Estado real del motor de Academia

| Curso | Slug | Módulos | Lecciones reales | Graduado por grado (`level_id`) |
|---|---|---|---|---|
| Python Academy | `python` | 8 | 17 de 32 (módulo `archivos-errores` vacío) | No |
| Hacking Ético Academy | `hacking-etico` | 7 | 4 de 28 (`reconocimiento`, `seguridad-web`, `forense`, `defensa` vacíos) | No |
| IA Academy | `ia` | 5 | 10 de 10 (completo) | **Sí** — 1 módulo por franja de grado |

IA Academy es el patrón de referencia: `src/app/academy/[courseSlug]/page.tsx` resalta con badge "Tu nivel" y auto-expande el módulo cuyo `level_id` coincide con `user.levelId`.

### Problemas concretos encontrados

1. **Dos UIs redundantes para Python** que no se sincronizan: la página pública `/academy/python/...` (enlazada en el header, permite leer teoría y "Ejecutar" ejemplos/retos) **nunca llama a `/api/academy/progress`**; solo el componente `PythonIDE` (dentro de la pestaña Simuladores de `/nivel/[id]`) guarda avance. Un estudiante puede completar una lección en `/academy` y no quedar registrado.
2. **Terminal Linux y Terminal Hacking están desconectados de su propio contenido**: el módulo `linux-basico` de Hacking Ético Academy ya tiene 2 lecciones con teoría real, pero `LinuxTerminal.tsx` es solo una terminal-sandbox libre con un panel de comandos de referencia estático — no tiene ningún sistema de lecciones/retos, y el `levelId` que recibe como prop no se usa en ningún lado. `HackingTerminal.tsx` no llama a `/api/academy` en absoluto.
3. **No hay panel de administración** para `simulator_courses/modules/lessons` — todo el contenido se cargó vía scripts de un solo uso (`seed-empty-academy-modules.js`, `seed-ia-academy-pilot.js`, `migrate-academy.ts`). Un profesor o admin no puede hoy agregar/editar una lección sin pedirle a un desarrollador que corra un script.
4. **Ningún simulador externo** (Scratch, Wokwi, etc.) tiene marco pedagógico propio — se embeben en iframe con un texto genérico ("Practica lo aprendido..."), sin objetivo de aprendizaje explícito.

## Alcance de este piloto

Se eligió **Terminal Linux** (herramienta interna, con contenido real ya esperando en `linux-basico`) como piloto para validar el patrón completo, más el arreglo del bug de guardado de progreso que afecta a Python hoy mismo.

### Dentro de alcance
1. `LinuxTerminal.tsx` (hoy: una terminal-sandbox libre con sistema de archivos virtual `INITIAL_FS` y un panel de referencia estático `TERMINAL_GUIDES` — **no tiene ningún sistema de retos o progreso hoy**) gana un panel nuevo "Lecciones" que consume `/api/academy?course=hacking-etico&module=linux-basico` y muestra, por cada una de las 2 lecciones reales: la teoría, los ejemplos, y los retos (título, descripción, pistas) — todo junto a la terminal real, para que el estudiante resuelva el reto ejecutando comandos de verdad en el mismo panel. El panel `TERMINAL_GUIDES` existente se mantiene como referencia rápida (cheat-sheet), no se elimina.
2. Como los `expected_output` guardados en las lecciones son descripciones del resultado esperado (ej. "Estructura creada correctamente"), no strings exactas para comparar, la validación automática completa queda fuera de alcance del piloto: el estudiante marca el reto como resuelto ("Marcar como completado") después de intentarlo en la terminal real. Esto dispara el guardado de progreso.
3. Guarda ese progreso vía `POST /api/academy/progress` (mismo mecanismo que ya usa `PythonIDE`), usando el `lessonId` de la lección de Academia.
4. Fix del bug #1: la página `/academy/[courseSlug]/[moduleSlug]/[lessonSlug]/page.tsx` también llama a `/api/academy/progress` al ejecutar/completar un reto, para que ambas entradas (sitio de lectura y herramienta embebida) mantengan el mismo registro de avance.
5. Nueva página `/admin/academy` (CRUD de cursos → módulos → lecciones), reemplazando la dependencia de scripts. Resuelve la "vista docente" de forma más útil que una vista de solo-lectura: el profesor/admin puede gestionar contenido y ver cuántos módulos/lecciones tiene cada curso.

### Fuera de alcance (explícitamente, para siguientes iteraciones)
- Validación automática de retos de terminal contra el sistema de archivos virtual (ej. verificar que los archivos/carpetas descritos realmente existan) — el piloto usa marcado manual del estudiante; la validación automática es una mejora de fidelidad para después.
- Escribir contenido nuevo para los 5 módulos vacíos (`archivos-errores`, `reconocimiento`, `seguridad-web`, `forense`, `defensa`) — es trabajo de autoría de contenido, no de ingeniería; se hace después, con este mismo panel de admin como herramienta.
- Dividir `linux-basico` en sub-módulos por franja de grado y reutilizar el patrón de graduación por grado (badge "Tu nivel", auto-expandir) que ya usa IA Academy — el piloto valida el flujo con el único módulo existente; con un solo módulo ese patrón no tiene nada que resaltar. Graduar por grado es una decisión de contenido futura, una vez que haya más de un módulo en `hacking-etico`.
- Migrar `HackingTerminal.tsx` (usa su propio sistema de archivos virtual vía `virtual_files`, es un caso más complejo) y `RobloxEditor.tsx` al motor de Academia — se hace en una siguiente iteración replicando el patrón validado aquí.
- Marco pedagógico ligero para los 7 simuladores externos tipo iframe (Scratch, Wokwi, etc.) — no tienen motor de currículo detrás; es un patrón distinto (objetivo/instrucciones como texto editable desde `/admin/simuladores`, ya con columnas `category` en curso de otra tarea) que se diseña por separado.
- Vista de progreso agregada por curso/nivel para el profesor (ej. "12 de 20 estudiantes completaron Linux básico") — el CRUD de admin resuelve gestión de contenido; el reporting de progreso queda para una siguiente iteración una vez que haya datos reales acumulándose en `simulator_progress`.

## Arquitectura

No se crean tablas nuevas — se reutiliza `simulator_courses/modules/lessons/progress`, ya con RLS. Cambios:

- **`LinuxTerminal.tsx`**: agrega fetch a `/api/academy?course=hacking-etico&module=linux-basico` al montar; agrega un panel nuevo (pestaña o sección lateral) que renderiza las `lessons` recibidas (teoría, ejemplos, retos con `starter_code` como punto de partida sugerido y `hints` como ayudas progresivas), junto al terminal real y sin tocar `TERMINAL_GUIDES`/`INITIAL_FS` existentes; al marcar un reto como completado, hace `POST /api/academy/progress` con `userId`, `lessonId`, `completed: true`.
- **`/api/academy/route.ts`**: el `GET` con `course` + `module` ya soporta este uso (`return NextResponse.json({ course, module, lessons })`) — no requiere cambios de API, solo de consumo.
- **`/academy/[courseSlug]/[moduleSlug]/[lessonSlug]/page.tsx`**: se agrega la llamada a `POST /api/academy/progress` (mismo payload que usa `PythonIDE`) en el handler de "Ejecutar" del reto, condicionada a `user?.id`.
- **`/admin/academy/page.tsx`** (nuevo) + **`/api/admin/academy/route.ts`** (nuevo, usa `supabaseAdmin`, CRUD sobre las 3 tablas): listar cursos con conteo de módulos/lecciones, expandir módulo → ver/crear/editar/eliminar lecciones (theory, examples, challenges, difficulty, estimated_minutes). Sigue el mismo patrón de modal que ya usa `/admin/simuladores/page.tsx`.

## Manejo de errores

Si `/api/academy` falla al cargar `linux-basico` (red, Supabase caído), el panel de Lecciones muestra un estado de error con botón de reintentar; la terminal-sandbox y el panel `TERMINAL_GUIDES` (que no dependen de esta llamada) siguen funcionando con normalidad — el simulador nunca queda en blanco. Un fallo al guardar progreso (`POST /api/academy/progress`) no bloquea al estudiante — se reintenta una vez y si falla se ignora silenciosamente (igual que hoy en `PythonIDE`).

## Testing

Se usa vitest (`src/__tests__`). Se agregan:
- Test unitario para el parseo/orden de `lessons` (con `examples`/`challenges` JSONB) que consume el nuevo panel de Lecciones de `LinuxTerminal`.
- Test unitario para el endpoint `/api/admin/academy` (creación/edición/borrado de una lección, validando campos requeridos).

Prueba manual en navegador: como estudiante, abrir Terminal Linux dentro de un nivel, ver el panel de Lecciones con las 2 lecciones reales de `linux-basico`, intentar un reto en la terminal real, marcarlo como completado y confirmar que persiste tras recargar; como admin, entrar a `/admin/academy`, editar una lección existente y crear una nueva en un módulo vacío; confirmar que `/academy/hacking-etico/linux-basico/...` también registra progreso al ejecutar/completar un reto.
