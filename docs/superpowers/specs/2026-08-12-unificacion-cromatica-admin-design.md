# Diseño: Unificar cromática, animación y login en toda la app

**Fecha:** 2026-08-12
**Estado:** Aprobado (autoaprobado a pedido explícito del usuario: "haz todo y acepta tú mismo")

## Contexto

El 2026-08-11 se estableció una paleta nueva ("ultramarine + dorado Inca") en `tailwind.config.ts`
(`chaski.primary #3A4FD8`, `chaski.gold #E9A13B`, `chaski.dark #0D1321`, `chaski.light #F6F7FB`) y se
rediseñó `/login` (split-screen, tilt 3D, gradientes, tabs animados) y `AdminShell` (sidebar
colapsable, breadcrumbs, animaciones `fade-in`/`slide-in-left`/`pop`). Esos dos son el patrón de
referencia — el "hilo conductor" — pero nunca se propagó al contenido de las 14 páginas que vive
*dentro* del shell: siguen en `gray-*` genérico de Tailwind (no `slate-*`, que es lo que usa el resto),
colores sueltos sin sistema (`pink-500`, `cyan-500`, `slate-500`, `amber-500` elegidos al azar por
página), casi sin animación (`grep` confirma 230 usos de colores ad-hoc contra solo 8 de las clases de
animación ya definidas en Tailwind), y al menos un bug visual real: en `admin/page.tsx` pestaña
Configuración, `bg-neon-green text-dark-900` (fondo verde, texto casi negro sobre fondo oscuro — en
realidad el problema es `bg-dark-600` como fondo de un `<code>` dentro de una tarjeta blanca, deja el
texto ilegible).

## Alcance

Unificar cromática + animaciones en las 16 páginas de `/admin/*` (dashboard, academy ya hecho, y las
14 restantes) usando exclusivamente los tokens ya existentes en `tailwind.config.ts` — no se agregan
colores nuevos. `/login` y `AdminShell` quedan como están (ya son el estándar a replicar); se revisan
solo si al pasar por ahí se nota una inconsistencia puntual.

Fuera de alcance: páginas públicas del sitio (`/`, `/academy`, `/niveles`, etc.) — no se tocan en esta
pasada; lógica funcional de cada página admin (fetch, estado, validaciones) — solo cambia JSX/className,
cero cambios de comportamiento; `/admin/lessons/page.tsx` (617 líneas) — confirmado código huérfano, no
enlazado desde `AdminShell` ni desde ningún otro archivo, se deja intacto sin tocar.

## Sistema de diseño (tokens ya existentes, solo se aplican consistentemente)

- **Texto/fondo neutro**: `slate-*` en vez de `gray-*` en todo — mezclar ambos es la causa visible de
  que páginas contiguas en el mismo sidebar se vean "distintas".
- **Acción primaria**: `bg-chaski-primary` sólido para botones normales; gradiente
  `bg-gradient-to-r from-chaski-primary to-chaski-accent` reservado para CTAs hero (como el submit de
  login) — no todos los botones necesitan gradiente.
- **Acento**: `chaski-gold` solo para insignias/logros/destacados puntuales, no como color de acción.
- **Semántica de estado sin cambios**: verde=éxito/activo, rojo=destructivo/error, ámbar=advertencia —
  siempre como chip `bg-{color}-500/10 text-{color}-600`, nunca sólido con texto blanco salvo en
  botones de confirmación explícita.
- **Inputs**: `focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10` (patrón ya usado
  en login) en vez de `focus:outline-none` sin ring.
- **Tarjetas**: `bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md
  transition-all duration-300`; interactivas suman `hover:border-chaski-primary/30` y el ícono interno
  `group-hover:scale-110 transition-transform` (patrón ya usado en `QuickAction`).
- **Animación de entrada**: contenedor de página con `animate-fade-in`; listas/grids con stagger vía
  `style={{ animationDelay: '${i * 0.05}s' }}` + `animate-slide-up` o `animate-scale-in` por ítem;
  modales: overlay `animate-fade-in` + panel `animate-scale-in`.
- **Botones**: `active:scale-[0.98] transition-all` en todos, no solo en login.
- **Spinners**: siempre `border-chaski-primary`, nunca `border-blue-500`/`border-gray-900` sueltos.
- **Eliminar** cualquier `bg-dark-*`/`text-dark-*` (paleta oscura de las tools de laboratorio) filtrado
  dentro de superficies claras de admin — es el origen del bug de contraste encontrado.

## Ejecución

Reparto por tamaño/dominio para paralelizar sin solaparse:
1. `admin/page.tsx` (pestañas Cursos/Actividad/Configuración — Dashboard y Quick Actions ya están bien)
2. `colegios` + `cursos`
3. `entregas` + `calificar` + `calificaciones`
4. `kits` + `simuladores`
5. `tareas` + `gestion`
6. `AdminIAContent.tsx` + `AdminLeccionesContent.tsx` + `AdminProyectosContent.tsx` (contenido real
   detrás de los wrappers de 16 líneas en `ia`/`lecciones`/`proyectos`)

Cada grupo se retoca solo en `className` — sin agregar dependencias, sin tocar `fetch`/estado/props.

## Testing

No hay tests automatizados de estilos visuales; se verifica con `tsc --noEmit` (que no se rompa
tipado) y build de Next.js. Verificación visual manual queda pendiente para cuando el usuario revise
en el navegador — se le avisará al terminar con la lista de páginas tocadas.
