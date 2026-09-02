# Diseño: Panel de Mapeo de Red visual (HackingTerminal)

**Fecha:** 2026-09-02
**Estado:** Aprobado por el usuario en conversación

## Contexto

El usuario reportó que el contenido de Hacking es "texto tras texto" y pidió algo más aplicado,
mencionando específicamente "mapear redes" y "casos reales". Es el primero de tres sub-proyectos que
salieron de ese pedido (los otros dos — reescribir la teoría de Hacking, y reestructurar los ejercicios
de IA para explicar desde los imports — quedan para después, cada uno con su propio diseño).

`HackingTerminal.tsx` ya tiene un sistema de misiones CTF (`MISSIONS`, línea ~965) con pasos que el
alumno completa escribiendo comandos reales en la terminal simulada (`whois`, `nmap`, `sqli`, etc.),
validados por una función `validator(cmd, history)`. Cada paso ya revela información concreta en su
`successMessage` (IP, puertos, rutas ocultas, vulnerabilidad SQLi) pero **solo como texto en la
terminal** — no hay ninguna representación visual de lo que se va descubriendo.

Ya existe un mini-panel de progreso de misión (líneas ~1896-1905) que muestra el título de la misión,
una barra de progreso y el título del paso actual. Este proyecto lo reemplaza por algo más rico.

## Alcance

**Dentro de alcance:**
- Nuevo componente `src/components/activities/NetworkMapPanel.tsx`, aislado: recibe la misión activa y
  el índice del paso actual, y renderiza un diagrama de un solo nodo (el servidor objetivo) que se va
  revelando a medida que se completan pasos.
- Nuevo campo opcional `reveal?: NetworkReveal` en `MissionStep`, agregado **solo** a los pasos de las
  misiones `recon-target` (Reconocimiento) y `scan-exploit` (Escaneo y Explotación) — las dos que ya
  giran en torno a un único servidor objetivo (`target-corp.com` / `10.0.0.10`).
- El contenido revelado en el diagrama es el mismo que ya existe en cada `successMessage` — no se
  inventa información nueva, solo se visualiza la que ya se le muestra al alumno en texto.
- Reemplaza el mini-panel de progreso actual (mismo lugar en el layout).

**Fuera de alcance (explícito, para evitar ambigüedad):**
- Las misiones "Investigación Forense", "Fortificar el Servidor" y "Pentest Completo" no llevan este
  panel en esta pasada. Se puede extender después agregándoles el mismo campo `reveal` a sus pasos.
- Una red con múltiples equipos (firewall, servidor DB, PC de empleado, etc.) — decisión explícita del
  usuario de arrancar con un solo objetivo visualizado a fondo. Si más adelante se quiere expandir a una
  red real con varios nodos, va a hacer falta escribir misiones nuevas con esos hosts, y probablemente
  conviene reconsiderar si un solo `<div>`/SVG a mano alcanza o conviene una librería de diagramado
  (ej. react-flow) — esa decisión queda para cuando/si se aborde ese sub-proyecto.
- No se reescribe el texto de las misiones existentes (briefings, hints, debriefings) — eso es parte del
  sub-proyecto separado de "reescribir teoría de Hacking".
- No hay interacción nueva en el diagrama (no se puede hacer clic en los nodos/puertos) — es un
  read-only que refleja el progreso; el alumno sigue interactuando exclusivamente escribiendo comandos
  en la terminal de siempre.
- No se tocan las tablas de Supabase (`simulator_courses/modules/lessons`) — este panel es 100%
  independiente del sistema de lecciones de la Academia; vive enteramente en el array `MISSIONS`
  hardcodeado, igual que hoy.

## Modelo de datos

```ts
type NetworkReveal =
  | { kind: 'owner'; value: string }
  | { kind: 'ip'; value: string }
  | { kind: 'route'; values: string[] }
  | { kind: 'file'; value: string }
  | { kind: 'port'; port: number; service: string; version?: string }
  | { kind: 'vuln'; onPort: number; label: string }
  | { kind: 'breach'; label: string }

interface MissionStep {
  // ...campos existentes sin cambios (id, title, description, hint, validator, xp, successMessage)
  reveal?: NetworkReveal
}
```

Mapeo concreto paso → reveal (misión `recon-target`):
- `step-whois` → `{ kind: 'owner', value: 'Target Corp S.A.' }`
- `step-dns` → `{ kind: 'ip', value: '10.0.0.10' }`
- `step-robots` → `{ kind: 'route', values: ['/admin', '/backup', '/.git', '/admin-panel-x7'] }`
- `step-dork` → `{ kind: 'file', value: 'backup_passwords.txt' }`

Mapeo concreto paso → reveal (misión `scan-exploit`):
- `step-nmap` → cuatro reveals `port`: SSH/22, HTTP/80, HTTPS/443, MySQL/3306 (Apache 2.4.29 como
  `version` en el puerto 80)
- `step-dirb` → `{ kind: 'file', value: '.git (código fuente expuesto)' }`
- `step-sqli` → `{ kind: 'vuln', onPort: 80, label: 'SQL Injection en /admin/login' }`
- `step-extract` → `{ kind: 'breach', label: 'Credenciales de todos los usuarios extraídas' }`

Como un paso puede revelar más de una cosa (el nmap revela 4 puertos a la vez), `reveal` acepta un
valor único o un array — `NetworkReveal | NetworkReveal[]`.

## Componente `NetworkMapPanel`

```
<NetworkMapPanel mission={activeMission} currentStep={missionStep} />
```

- Si `mission` es `null` o la misión no tiene ningún paso con `reveal` (ej. Forense), no renderiza nada
  (el llamador decide si mostrar el mini-panel viejo como fallback para esas misiones, o nada).
- Internamente: `mission.steps.slice(0, currentStep)` → junta todos los `reveal` de los pasos ya
  completados → arma el estado acumulado del nodo (owner, ip, rutas, puertos, vulns, breach) → renderiza.
- Nodo central: círculo/tarjeta con el dominio (`target-corp.com`), muestra `???` hasta que llega el
  primer `ip` reveal, después muestra la IP debajo del nombre.
- Puertos: chips alrededor del nodo (`22 SSH`, `80 HTTP`, `443 HTTPS`, `3306 MySQL`), en gris hasta que
  se descubren, en rojo con ícono de alerta si tienen un `vuln` asociado.
- Rutas/archivos descubiertos: lista de etiquetas debajo del nodo.
- Breach: banner rojo debajo de todo cuando se completa la extracción.
- Sin librería de diagramas — divs + Tailwind, consistente con el resto de la UI del terminal.

## Integración en `HackingTerminal.tsx`

Reemplaza el bloque actual (líneas ~1896-1905) que muestra el mini-panel de progreso:

```tsx
{activeMission && (
  <NetworkMapPanel mission={activeMission} currentStep={missionStep} />
)}
```

Sin cambios en la lógica de `validator`, `missionStep`, XP, o el flujo de completar/avanzar misión —
el panel es puramente derivado del estado que ya existe, no le agrega estado propio al padre.

## Testing

Sin backend ni Supabase involucrados (todo el estado vive en memoria del componente, igual que hoy). Se
verifica en el navegador avanzando manualmente por los 4 pasos de `recon-target` y los 4 de
`scan-exploit` (escribiendo los comandos reales en la terminal simulada, sin necesidad de mocks) y
confirmando que el diagrama se va llenando en el orden correcto: nodo `???` → IP → rutas → archivo
(fin de recon-target) → puertos → archivo git → puerto 80 marcado vulnerable → banner de breach (fin de
scan-exploit).
