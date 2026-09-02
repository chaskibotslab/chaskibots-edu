# Diseño: Navegador de pasos con casos reales para ejercicios de IA

**Fecha:** 2026-09-02
**Estado:** Aprobado por el usuario en conversación

## Contexto

Tercer y último sub-proyecto del pedido original de contenido más aplicado (los otros dos: mapa de red
visual en Hacking, y reescritura de la teoría de Hacking en formato de caso real — ambos ya en
producción). El usuario reportó que en `AITerminal.tsx` (AI Lab) "ya se pone un script grande" —
confirmé muestreando `numpy-basics` (68 líneas en un solo bloque) y `red-neuronal` (121 líneas) que las
17 actividades de `AI_EXERCISES` siguen el mismo patrón: un único `code: string` que el alumno ejecuta
completo de una sola vez, sin construcción incremental.

El usuario pidió explícitamente, además de partir el código en pasos, que cada ejercicio arranque de un
**caso real y enganchante** — no una lista de conceptos técnicos sueltos.

## Alcance

**Dentro de alcance:**
- Nueva interfaz `ExerciseStep` y cambio de `AIExercise.code: string` a `AIExercise.steps: ExerciseStep[]`.
- Nuevo navegador de pasos en la UI de `AITerminal.tsx` (`◀ Paso X de N ▶`, con título y explicación del
  paso actual), que carga el código de cada paso en el editor al navegar.
- Reescritura de las 17 actividades: cada una arranca con un caso/escenario real y concreto, y sus pasos
  construyen hacia resolverlo (mismo contenido técnico que hoy, nueva narrativa + segmentación).

**Fuera de alcance:**
- Los cursos de `PythonIDE` (Fundamentos de Python, etc., backed por Supabase `simulator_lessons`) — es
  un sistema de contenido distinto y no fue parte del pedido ("el simulador de ia" se refiere a
  `AITerminal`/AI Lab).
- El panel de "Teoría" existente no cambia de rol — sigue explicando el concepto general del ejercicio;
  el navegador de pasos es contenido nuevo y separado ("qué estoy construyendo ahora"), no un reemplazo.
- Ejecución automática al avanzar de paso: "Siguiente" carga el código en el editor, pero el alumno
  sigue decidiendo cuándo darle "Ejecutar" — se mantiene el control explícito que ya tiene el resto de
  la plataforma.

## Modelo de datos

```ts
interface ExerciseStep {
  title: string        // "Paso 1: Tu primer sensor como array"
  explanation: string  // 1-2 frases: qué hace este paso y por qué, en términos del caso
  code: string          // código COMPLETO y ejecutable acumulado hasta este paso
}

interface AIExercise {
  id: string
  title: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  description: string
  theory: string
  steps: ExerciseStep[]   // reemplaza el campo `code` único
  expected_output?: string
}
```

Cada paso trae el código **acumulado** (el Paso 3 incluye lo del Paso 1 y 2 más lo nuevo), nunca un
fragmento suelto — así siempre es ejecutable de punta a punta, igual que hoy.

## UI en `AITerminal.tsx`

- Nuevo estado `currentStepIndex` (se resetea a 0 cada vez que se carga un ejercicio distinto).
- Barra de navegación entre la descripción del ejercicio y el editor: `◀  Paso 2 de 6  ▶` +
  título/explicación del paso actual.
- "Siguiente"/"Anterior" reemplazan el contenido del archivo activo con `exercise.steps[i].code` (mismo
  mecanismo que ya usa `loadExercise` hoy, solo que apuntando al paso en vez de al ejercicio completo).
- "Siguiente" deshabilitado en el último paso, "Anterior" deshabilitado en el primero.
- Cambiar de ejercicio en la barra lateral reinicia `currentStepIndex` a 0 y carga `steps[0].code`.

## Principio de contenido: caso real antes que lista de conceptos

Cada uno de los 17 ejercicios arranca con 2-4 líneas describiendo una situación concreta y relatable
(ideal: conectada a robótica/IA aplicada, coherente con la marca ChaskiBots) — nunca "¿Qué es NumPy?".
Ejemplo ya aprobado (`numpy-basics`): un robot que sigue líneas con sensores de luz, que necesita
combinar lecturas de sensores en tiempo real — de ahí surge la necesidad real de arrays y vectorización,
no como conceptos abstractos sino como la solución a un problema concreto planteado primero. Los pasos
resuelven ese caso progresivamente; el contenido técnico (qué se enseña) no cambia respecto a hoy, solo
el orden de presentación (motivación → concepto, no concepto → motivación) y el empaquetado (varios
pasos ejecutables en vez de uno).

## Testing

Sin backend involucrado (todo el estado vive en el componente, igual que hoy). Se verifica montando
`AITerminal` en una ruta de prueba descartable: cargar un ejercicio, confirmar que arranca en Paso 1,
navegar con "Siguiente"/"Anterior" y confirmar que el código del editor cambia correctamente en cada
paso, y que el código de cada paso corre sin errores en Pyodide real. A diferencia del puente serial,
esta función no usa ninguna API del navegador restringida (sin diálogos nativos), así que se puede
probar con clics reales sin mocks.
