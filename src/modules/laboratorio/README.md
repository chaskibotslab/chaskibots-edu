# Laboratorio de Robótica

Laboratorio virtual en el navegador. El estudiante programa un robot en C++ (Arduino). El código se **compila de verdad** con avr-gcc y el binario se **ejecuta en un ATmega328P emulado** (avr8js), conectado a un robot con física 3D (Rapier).

## Arquitectura

```
Navegador                                                  Railway
┌────────────────────────────────────────────────────┐     ┌───────────────────────────┐
│ Editor Monaco ──Compilar──► /api/lab/compile ──────┼────►│ lab-compiler (Docker)     │
│                               (Next.js, agrega     │     │ arduino-cli + core AVR    │
│                                la clave secreta)   │◄────┤ → devuelve .hex + errores │
│                                                    │     └───────────────────────────┘
│  Web Worker: AvrRunner (ATmega328P a 16 MHz)       │
│      ▲ pines de entrada        │ pines de salida   │
│      │ (sensores)              ▼ (PWM, niveles)    │
│  Simulacion (hilo principal, pasos sincronizados)  │
│      ├─ sensores IR: raycast al piso → color pista │
│      ├─ L298N → voltaje → motor DC (inercia)       │
│      └─ Rapier: cuerpo rígido + modelo de ruedas   │
│  Escena 3D (React Three Fiber)                     │
└────────────────────────────────────────────────────┘
```

**Sincronización.** Por cada cuadro, la interfaz le pide al worker *N* ciclos de CPU (16 000 000 ciclos = 1 s). El worker devuelve el estado de los pines. Después la física avanza exactamente *N* / 16 MHz segundos. Si el navegador no alcanza, la simulación va más lenta pero no se desincroniza. El indicador «velocidad de simulación» muestra el porcentaje.

## Carpetas

| Ruta | Qué hay |
|---|---|
| `engine/avrRunner.ts` | CPU emulado: timers 0/1/2, GPIO, USART, ADC. Mide el PWM de cada pin. |
| `engine/avr.worker.ts` | Web Worker que corre el CPU |
| `engine/bridge.ts` | Funciones puras pin ↔ física: PWM, L298N, motor, IR, ADC, HC-SR04, servo |
| `engine/netlist.ts` | Convierte el cableado en «qué pin maneja qué» |
| `engine/nucleo.ts` | Un paso de simulación (lo comparten el navegador y los tests) |
| `engine/physics.ts` | Rapier: chasis, ruedas, gravedad, raycast |
| `engine/tracks.ts` | Pistas: generadas por código o PNG del usuario |
| `engine/simulation.ts` | Orquestador: worker + física + telemetría |
| `catalogo/*.json` | Componentes (un JSON cada uno) |
| `robots/` | Robot predefinido y plantillas de código |
| `ui/` | Interfaz (editor, escena 3D, paneles) |
| `server/acceso.ts` | Flag `LAB_ENABLED` + sesión (reutiliza `@/lib/session`) |
| `__tests__/` | Tests unitarios, de emulación y de lazo cerrado |
| `scripts/smoke-rutas.mjs` | Verifica que las rutas existentes no cambiaron |

Rutas nuevas: `src/app/laboratorio/page.tsx` y `src/app/api/lab/compile/route.ts`. Son archivos delgados que solo montan el módulo.

El servicio compilador está en `services/lab-compiler/`.

## Cómo agregar un componente nuevo

1. Crea `catalogo/mi-componente.json`:

```json
{
  "id": "mi-componente",
  "nombre": "Nombre visible",
  "categoria": "sensor",
  "modelo3D": "proc:mi-componente",
  "masa_g": 10,
  "dimensiones_mm": [20, 10, 5],
  "pines": [ { "nombre": "OUT", "tipo": "digital" }, { "nombre": "VCC", "tipo": "alim" } ],
  "comportamiento": { "tipo": "ir-reflectivo", "umbral": 0.5 }
}
```

2. Agrégalo a la lista de `catalogo/index.ts`.
3. Si `comportamiento.tipo` ya existe (`ir-reflectivo`, `motor-dc`, `l298n`, `bateria`…), no hay que tocar el motor. Basta con conectarlo en el robot (`conexiones`). Si es un comportamiento nuevo, se agrega su lógica en `engine/netlist.ts` y `engine/nucleo.ts`, con su función pura en `bridge.ts` y su test.

## Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `LAB_ENABLED` | plataforma | `true` activa `/laboratorio`. Con cualquier otro valor, la ruta da 404 y la plataforma queda idéntica. |
| `NEXT_PUBLIC_LAB_ENABLED` | plataforma | `true` muestra «Laboratorio» en el menú superior. Se lee al compilar, así que hay que redeployar al cambiarla. |
| `LAB_COMPILER_URL` | plataforma | URL del servicio compilador, por ejemplo la URL privada de Railway |
| `LAB_COMPILER_KEY` | plataforma **y** compilador | Clave compartida (larga y aleatoria) |
| `MAX_CONCURRENT`, `RATE_LIMIT_PER_MIN` | compilador | Opcionales: compilaciones simultáneas (2) y por usuario por minuto (12) |

## Desplegar el compilador en Railway

1. Crea un servicio nuevo desde este repo con **Root Directory** `services/lab-compiler`. Railway detecta el Dockerfile.
2. Configura la variable `LAB_COMPILER_KEY`.
3. Activa **Serverless / App Sleeping**: el servicio se duerme cuando no se usa y casi no cobra. La primera compilación después de dormir tarda unos segundos más.
4. En la plataforma, configura `LAB_COMPILER_URL`, `LAB_COMPILER_KEY` y `LAB_ENABLED=true`.

## Tests

```
npx vitest run src/modules/laboratorio
```

| Grupo | Qué prueba |
|---|---|
| `bridge.test.ts` | PWM 50 % → 2,5 V; eco del HC-SR04 a 20 cm = 1160 µs; L298N; motor; ADC; servo |
| `avrRunner.test.ts` | Binarios reales (`fixtures/*.hex`): PWM a ~976 Hz, digitalRead, analogRead, Serial en ambos sentidos, millis |
| `physics.test.ts` | Avanza recto a ω·R, gira hacia el lado correcto, no avanza en gravedad cero, raycast |
| `lazoCerrado.test.ts` | El sketch real del seguidor recorre el óvalo y las curvas sin salirse más de 3 cm |

Para regenerar los `.hex`, compila con el servicio compilador las plantillas de `robots/plantillas.ts`.

## Cómo revertir todo

- **Apagar sin borrar nada:** `LAB_ENABLED=false` (o quitar la variable) y redeploy.
- **Borrar el módulo:** quitar la línea de `src/modules` en `tailwind.config.ts` y la entrada «Laboratorio» de `src/components/Header.tsx`, eliminar `src/modules/laboratorio/`, `src/app/laboratorio/`, `src/app/api/lab/` y `services/lab-compiler/`. Luego quitar `avr8js` y `@dimforge/rapier3d-compat` de `package.json` y borrar el servicio compilador en Railway.
- **Base de datos:** F1 no crea tablas. Las tablas `lab_*` de fases futuras traen su script `down`.
