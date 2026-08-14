# Diseño: Rebranding cromático "Chaski Bots LAB" (coral + slate + crema)

**Fecha:** 2026-08-13
**Estado:** Aprobado por el usuario en conversación

## Contexto

El 2026-08-12 se escribió `2026-08-12-unificacion-cromatica-admin-design.md`, que asumía una paleta
"ultramarine + dorado Inca" (`chaski.primary #3A4FD8`, `chaski.dark #0D1321`, `chaski.gold #E9A13B`)
como estándar ya vigente a replicar en admin. Ese estándar quedó obsoleto: el commit siguiente
(`a63eedf feat: dark hacker theme`) reescribió `/login`, `/dashboard`, `/niveles` y `/nivel/[id]` con
una estética "dark hacker" (lluvia Matrix, texto glitch, verde neón `#39FF14` sobre negro,
`chaski.primary` real en `tailwind.config.ts` es `#6366F1` índigo, `chaski.dark` es `#030712`). Ese es
el estado actual en producción.

Este documento **reemplaza** la paleta de referencia de ambos diseños anteriores. La marca oficial de
Chaski Bots LAB pasa a ser una paleta clara y cálida, tipo EdTech, sin estética hacker:

- Dark Slate Grey `#22252A` — principal/navbar/tarjetas oscuras
- Warm Cream `#F4F3ED` — fondo de tarjetas secundarias
- Tech Coral `#E57361` — botones CTA, badges, acentos
- Pure White `#FFFFFF` — fondo principal de la app
- Light Border Gray `#E0E2E5` — bordes de inputs/tarjetas

## Alcance

Todo el sitio (`edu.chaskibots.com`): páginas públicas de estudiante, autenticación, y panel admin.
Se ejecuta en fases (ver "Ejecución"), no todo en un solo cambio.

**Dentro de alcance:**
- Redefinir tokens de color en `tailwind.config.ts` (no se crean tokens nuevos con otro nombre; se
  reasignan los valores de los tokens `chaski.*`, `hack.green`, `brand.light` para que la cascada
  llegue a las ~25 páginas que ya los consumen).
- Eliminar del uso visual: lluvia Matrix (`<MatrixRain />`), `animate-glitch`, `animate-matrix-fall`,
  `animate-scan-line`, fondos `bg-black`/`bg-chaski-dark` usados como fondo de página completa fuera
  del header/sidebar.
- Reescribir `/login` (quitar Matrix/glitch, tarjeta blanca sobre crema, selector de perfil
  re-etiquetado).
- Reskin de `/dashboard`, `/register`, `/niveles`, `/nivel/[id]`, `/academy/**` (incluida la vista de
  lección), `/robotica`, `/ia`, `/hacking`, `/simuladores`, `/tareas`, `/` (home), `/diseno`.
- Reskin de `/admin/**` vía cascada de tokens + limpieza puntual de literales oscuros hardcoded
  (`bg-black`, hex sueltos) que no pasen por token.

**Fuera de alcance:**
- Lógica funcional (fetch, estado, validaciones, auth) — solo cambia `className`/JSX de presentación.
- Estructura de la vista de lección (`academy/[courseSlug]/[moduleSlug]/[lessonSlug]`): se mantienen
  las tabs actuales Teoría/Ejemplos/Desafíos sin sidebar ni tabs Recursos/Descargables/Simulador/Dudas
  — decisión explícita del usuario para no ampliar el alcance estructural en esta pasada.
  Podría revisitarse como proyecto aparte.
- Paletas internas de herramientas de laboratorio (`labdark.*` en Blockly/CAD/PythonIDE, `neon.*` en
  editores de código) — son cromática interna de herramientas, no chrome de marca; no se tocan.
- Selector de perfil como sistema de roles nuevo: no se agrega un rol "Institución"; es solo
  re-etiquetado de las pestañas de login existentes (ver más abajo).

## Sistema de tokens (`tailwind.config.ts`)

| Token | Valor actual | Nuevo valor | Uso principal |
|---|---|---|---|
| `chaski.dark` | `#030712` | `#22252A` | Header, sidebars, tarjetas oscuras |
| `chaski.primary` | `#6366F1` | `#E57361` | Botones CTA, links/tabs activos, acentos |
| `chaski.secondary` | `#818CF8` | `#EE8F81` | Gradientes, hover de CTA |
| `chaski.accent` | `#F43F5E` | `#E57361` | Unificado con primary (ya no hay dos acentos) |
| `chaski.light` | `#F8FAFC` | `#F4F3ED` | Fondos de tarjetas secundarias |
| `brand.light` | `#F8FAFC` | `#F4F3ED` | Igual que `chaski.light`, mismo valor |
| `light.50` | `#FFFFFF` | `#FFFFFF` (sin cambio) | Fondo principal de la app |
| `hack.green` | `#39FF14` (neón) | `#22C55E` (verde suave) | Solo puntos de estado "online"/activo, sin glow neón |
| *(nuevo)* `border.soft` | — | `#E0E2E5` | Bordes de inputs y tarjetas |

`chaski.gold` (`#F59E0B`) se conserva sin cambios para insignias/logros (no forma parte de la paleta
de marca pedida, pero no colisiona con ella y ya se usa así en admin). Tipografía: se mantiene Inter
(`fontFamily.sans`), ya coincide con la marca. Radios: se mantienen `rounded-xl`/`rounded-2xl`
(12–16px), ya es el patrón dominante.

Tokens que quedan **definidos pero sin uso** tras esta pasada (no se borran del config para no romper
imports involuntarios, simplemente dejan de aplicarse en JSX): `neon.*`, `dark.*` (950–500),
`animate-glitch`, `animate-matrix-fall`, `animate-scan-line`, `animate-cursor-blink`.

## Diseño por página

### `/login`
Se reescribe el componente. Fondo `#F4F3ED`, tarjeta central `#FFFFFF` con `rounded-2xl` y sombra
suave, sin Matrix rain/glitch/scanlines/CRT texture. Inputs con borde `#E0E2E5`, foco en coral. Botón
principal sólido `#E57361` con texto blanco. El selector de perfil pedido por el usuario se implementa
re-etiquetando las pestañas funcionales existentes — no se crea un tercer modo de login:
- "Estudiante" → modo actual `code` (POST a `/api/auth/login-code`)
- "Instructor / Institución" → modo actual `email` (POST via `useAuth().login`, mismo endpoint para
  `teacher`/`admin`)

Se conserva el robot mascota (`/chaski.png`) sin el anillo con glow verde neón.

### `/dashboard`
El `<Header />` compartido ya usa `bg-chaski-dark`, por lo que el cambio de token lo lleva a `#22252A`
automáticamente — sin cambios estructurales ahí. El banner de bienvenida deja de usar `<MatrixRain />`
y el fondo `slate-900`; pasa a `#22252A` liso con blobs de acento coral (`bg-chaski-primary/20 blur`).
Tarjetas de cursos activos: `bg-[#F4F3ED]` con badge/acento coral y texto `#22252A`. Barra de nivel,
insignias (`BadgesDisplay`) y XP se conservan tal cual, solo recoloreadas vía tokens.

### `/academy/[courseSlug]/[moduleSlug]/[lessonSlug]` (aula virtual)
Sin cambios estructurales (ver "Fuera de alcance"). Reskin: `chaski-primary` → coral en tabs activos,
botón "Ejecutar", bordes de acento; fondo de página `#FFFFFF`/`#F4F3ED` en vez de `#f8fafc` genérico;
bordes de tarjetas a `#E0E2E5`. El editor de código (fondo `#1e1e2e`) no es chrome de marca — se deja
igual.

## Ejecución (fases)

Se implementa como un solo plan con fases secuenciales, para poder verificar `tsc --noEmit` y build
entre cada una sin dejar el sitio en un estado visualmente mixto por mucho tiempo:

1. **Fundamentos** — `tailwind.config.ts` (tabla de tokens de arriba) + componentes compartidos:
   `Header`, `Footer`, `AuthProvider` (solo estados de loading/UI), `BadgesDisplay`, `LessonCard`,
   `ModuleAccordion`.
2. **Entrada** — `/login` (reescritura), `/register` (reskin).
3. **Home de estudiante** — `/dashboard`, `/niveles`, `/nivel/[id]`, `/academy` (lista y módulo),
   `/academy/.../[lessonSlug]` (aula virtual, solo reskin).
4. **Áreas temáticas** — `/robotica`, `/ia`, `/hacking`, `/simuladores`, `/tareas`, `/` (home
   pública), `/diseno`.
5. **Admin** — `AdminShell` + las 16 páginas de `/admin/**`: cascada de tokens ya cubre la mayoría;
   pasada adicional para `bg-black`/hex sueltos que no pasen por token (mismo criterio que el spec de
   2026-08-12, ahora contra la nueva paleta).

Cada fase toca solo `className`/JSX, sin agregar dependencias ni cambiar `fetch`/estado/props.

## Hallazgos durante la ejecución

Varias páginas armaban clases Tailwind por interpolación de variable en runtime (p. ej.
`` `bg-${color}/10` ``, `` `text-${program.color}-400` ``). Tailwind JIT solo genera CSS para clases
que aparecen completas como texto literal en el archivo fuente; estos patrones nunca compilaban y
dejaban el elemento sin color en producción — bugs preexistentes, no introducidos por este
rebranding. Se corrigieron en cada archivo donde aparecieron (`dashboard/page.tsx`, `tareas/page.tsx`,
`LessonViewerModern.tsx`, entre otros) reemplazándolos por objetos de lookup estático con strings de
clase completos y literales. Se recomienda tenerlo presente si aparecen más casos en fases futuras o
en código nuevo.

## Testing

No hay tests automatizados de estilos visuales. Verificación por fase: `tsc --noEmit` (tipado no se
rompe) y `next build` (sin errores de compilación). Verificación visual manual la hace el usuario en
navegador al terminar cada fase o al final, según prefiera cuando se le presente el plan.
