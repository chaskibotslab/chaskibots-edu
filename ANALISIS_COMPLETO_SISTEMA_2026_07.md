# 🔍 Análisis Completo del Sistema - ChaskiBots EDU

**Fecha:** 4 de Julio, 2026  
**Revisión:** Post-migración a Supabase  
**Estado:** Producción activa con usuarios reales

---

## 📋 Resumen Ejecutivo

ChaskiBots EDU es una plataforma educativa de robótica, IA y hacking ético para niveles Inicial 1 hasta 3° Bachillerato. Migró recientemente de **Airtable + Google Drive** a **Supabase (PostgreSQL + Storage)**. El frontend usa Next.js 14 con App Router, React y TailwindCSS.

**Estado general:** Funcional, pero con deuda técnica acumulada y duplicidad de componentes/rutas que genera confusión y bugs recurrentes.

---

## 🏗️ Arquitectura Técnica

### Stack actual
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 14.2.35 | App Router + API routes |
| React | 18.3.1 | UI |
| TypeScript | 5.4.5 | Tipado |
| TailwindCSS | 3.4.3 | Estilos |
| Supabase | @supabase/supabase-js 2.108.2 | Base de datos + Storage |
| Zod | 4.3.6 | Validación (poco usada) |
| Three.js / @react-three | 0.160.0 | Simulador 3D |
| Blockly | 12.3.1 | Programación visual |
| TensorFlow.js | 4.21.0 | IA / visión |
| xlsx | 0.18.5 | Exportar Excel |

### Dependencias muertas (siguen en `package.json` pero no se usan en código activo)
- `airtable` — migración completada a Supabase
- `googleapis` — reemplazado por Supabase Storage
- `next-auth` — el login es propio (`/api/auth/login`, `AuthProvider`)

### Variables de entorno necesarias
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 🗄️ Base de Datos (Supabase)

### Tablas principales
| Tabla | Propósito | Notas |
|-------|-----------|-------|
| `programs` | Robótica, IA, Hacking | IDs fijos: `robotica`, `ia`, `hacking` |
| `levels` | Niveles educativos | `kit_price`, `icon`, `color`, `neon_color` |
| `schools` | Colegios/instituciones | Sin campo `logo` en schema actual |
| `modules` | Módulos por nivel | `display_order` |
| `lessons` | Lecciones | `images TEXT[]`, `video_url`, `program_id` |
| `users` | Admin, teachers, students | `access_code`, `role`, `school_id` |
| `students` | Registro separado de estudiantes | **Redundante con `users` (role='student')** |
| `courses` | Catálogo de cursos reutilizables | `cover_image`, `color`, `is_active` |
| `school_courses` | Relación M:N colegios-cursos | Nueva tabla del catálogo |
| `kits` | Kits de robótica | `components`, `skills`, `images` como texto/CSV |
| `tasks` | Tareas | `attachment_url`, `questions_text` |
| `submissions` | Entregas de estudiantes | `drawing_url`, `attachment_urls` |
| `grades` | Calificaciones | Vinculada a submissions |
| `simulators` | Simuladores | `programs TEXT[]` |
| `year_plans` | Plan anual por nivel | `display_order` |
| `documents` | Documentos descargables | `drive_url` (aún referencia Drive) |
| `experiencias` | Galería/testimonios | |
| `blockly_projects` | Proyectos guardados | |

### Problemas de schema
1. **`students` duplica `users`**. Sugerencia: usar solo `users` con `role='student'`.
2. **`documents.drive_url`**: aún apunta a Google Drive en lugar de Supabase Storage.
3. **`lessons` vs `courses`**: hay contenido estático duplicado en `src/data/courses` que puede chocar con lecciones dinámicas.

---

## 📡 APIs (34 endpoints)

### Rutas activas con Supabase
Todas las rutas en `src/app/api/` usan `supabaseAdmin` excepto archivos `.airtable.backup.ts`.

### Rutas de backup que deben eliminarse
Hay **19 archivos `*.airtable.backup.ts`** en `src/app/api/` que contienen código muerto de Airtable. Aumentan el bundle, confunden búsquedas y arrastran dependencias obsoletas.

### Inconsistencias de endpoints
| Endpoint | Estado | Problema |
|----------|--------|----------|
| `/api/lessons` | ✅ Activo | Usa `video_url`, `images[]` |
| `/api/admin/lessons/[id]` | ⚠️ Activo | Schema actual no tiene `resources`, `externalLinks`, `imageUrl` |
| `/api/admin/levels` | ✅ Activo | Usa tabla `levels` |
| `/api/admin/courses` | ✅ Activo | Administra catálogo de cursos |
| `/api/admin/users` | ✅ Activo | CRUD usuarios |
| `/api/admin/programs` | ✅ Activo | |
| `/api/admin/sync-teacher-courses` | ✅ Activo | |
| `/api/school-courses` | ✅ Activo | M:N colegios-cursos |
| `/api/upload` | ✅ Activo | Subida a Supabase Storage |
| `/api/image-proxy` | ⚠️ Activo | Ya no necesario con Supabase Storage (URLs públicas) |
| `/api/virtual-files` | ⚠️ Revisar | Posiblemente heredado de Drive |

---

## 🖥️ Panel de Administración

### Páginas existentes
| Ruta | Estado | Observación |
|------|--------|-------------|
| `/admin` | ✅ | Dashboard general |
| `/admin/kits` | ✅ **Recién reparado** | Normaliza arrays CSV correctamente |
| `/admin/lecciones` | ✅ **Recién reparado** | Usa `AuthProvider` correcto |
| `/admin/lessons` | ⚠️ **Confusión** | Página vieja que edita campos (`resources`, `externalLinks`, `imageUrl`) que no existen en schema actual |
| `/admin/contenido` | ✅ | Redirige a `/admin/lecciones` |
| `/admin/cursos` | ✅ | Catálogo de cursos con `coverImage` |
| `/admin/colegios` | ✅ | Gestión de colegios |
| `/admin/gestion` | ✅ | Niveles, programas, usuarios, asignaciones |
| `/admin/tareas` | ✅ | Tareas |
| `/admin/entregas` | ✅ | Entregas |
| `/admin/calificaciones` / `/admin/calificar` | ✅ | Calificación (dos rutas similares) |
| `/admin/simuladores` | ✅ | Simuladores |
| `/admin/ia` | ✅ **Recién reparado** | `AuthProvider` correcto |
| `/admin/proyectos` | ✅ **Recién reparado** | `AuthProvider` correcto |

### Bug crítico reciente resuelto
Tres páginas admin (`/admin/lecciones`, `/admin/ia`, `/admin/proyectos`) importaban `useAuth` de `@/context/AuthContext` en lugar de `@/components/AuthProvider`. Como el layout principal solo envuelve `AuthProvider` de `components`, esas páginas se quedaban cargando infinitamente. **Ya corregido.**

### Otro bug crítico resuelto
`/admin/kits` crasheaba con `TypeError: s.split is not a function` porque el API devuelve `components`, `skills` e `images` como arrays, pero la página los trataba como strings CSV. **Ya corregido** con `normalizeCsv()`.

---

## 🎓 Área Pública / Estudiante

### Rutas principales
- `/` — landing
- `/login` — login moderno iPhone-like
- `/register` — registro
- `/niveles` — lista de niveles
- `/nivel/[id]` — contenido del nivel
- `/dashboard` — panel estudiante
- `/robotica`, `/ia`, `/hacking` — secciones programáticas
- `/simuladores` — simuladores
- `/tareas` — tareas del estudiante

### Problema de doble fuente de datos
`/nivel/[id]` mezcla:
1. Datos estáticos de `src/data/courses/` (`ALL_COURSES`, `LEVEL_CONTENT`, `EDUCATION_LEVELS`).
2. Lecciones dinámicas desde `/api/lessons`.
3. Plan anual desde `/api/year-plans` con fallback a datos estáticos.

Esto causa que el contenido cargado en `/admin/lecciones` no siempre coincida con lo que ve el estudiante, o que aparezca contenido duplicado. **Recomendación:** eliminar `src/data/courses` y confiar 100% en Supabase.

### Reproductor de video
`LessonViewerModern` ahora convierte automáticamente YouTube y Google Drive `/view` a `/preview`. **Recomendación:** migrar todos los videos a YouTube o Supabase Storage para evitar restricciones de iframe.

---

## ⚠️ Bugs y Deuda Técnica Actual

### Críticos (ya solucionados en este ciclo)
1. Admin lecciones/ia/proyectos: `useAuth` del contexto equivocado.
2. Admin kits: `split` sobre arrays de Supabase.
3. Google Drive en videos: se convertía a `/preview` para embeber.

### Críticos pendientes
1. **Duplicidad de admin de lecciones**: `/admin/lessons` y `/admin/lecciones` hacen cosas diferentes y pueden generar datos rotos. Eliminar `/admin/lessons` o unificarla.
2. **Datos estáticos vs dinámicos**: `src/data/courses` y `src/lib/constants` contienen lecciones y niveles que no vienen de Supabase.
3. **Tabla `students` duplicada**: la app consulta tanto `users` como `students` en distintos lugares.
4. **Dependencias muertas**: `airtable`, `googleapis`, `next-auth` aumentan build y riesgo de vulnerabilidades.
5. **Archivos `.airtable.backup.ts`**: 19 archivos de código muerto.
6. **`AuthContext` duplicado**: `src/context/AuthContext.tsx` no se usa.
7. **`image-proxy` obsoleto**: ahora las imágenes son URLs públicas de Supabase Storage.
8. **Colores inconsistentes**: aunque se corrigió `tailwind.config.ts` y `globals.css`, quedan componentes con clases Tailwind como `bg-dark-600`, `text-gray-300` sobre fondos claros que no contrastan bien.
9. **Manejo de errores en frontend**: muchos `catch` solo hacen `console.error` y no muestran feedback al usuario.
10. **TypeScript `any`**: ~180 usos de `any`, especialmente en componentes grandes y backups.

### Medios
11. **No hay paginación**: listas grandes (lecciones, entregas, usuarios) cargan todo.
12. **No hay caché**: todas las APIs usan `cache: 'no-store'` o `force-dynamic`.
13. **Cobertura de tests**: solo 3 tests en `src/__tests__`.
14. **Validación Zod**: existe en `lib/validation.ts` pero no se usa en todos los endpoints.
15. **Middleware solo revisa cookie**: la cookie `chaskibots_session` se setea en el cliente; si el usuario borra localStorage pero no la cookie, o viceversa, quedan estados inconsistentes.

### Bajos
16. **UX iPhone-like**: se inició la migración de UI (login, admin kits, admin cursos) pero no está terminada en todos los admin pages.
17. **PWA / offline**: no implementado.
18. **Notificaciones**: no hay sistema de notificaciones push/email.
19. **Gamificación**: componentes `BadgesDisplay` y `CertificateGenerator` existen pero no están integrados al flujo.

---

## 🎯 Recomendaciones Priorizadas

### 🔴 Alta prioridad (hacer esta semana)
1. **Eliminar código muerto**
   - Borrar `src/app/api/**/*.airtable.backup.ts` (19 archivos).
   - Borrar `src/context/AuthContext.tsx`.
   - Remover dependencias `airtable`, `googleapis`, `next-auth` de `package.json`.
   - Borrar `src/lib/googleDrive.ts` y `src/lib/airtable*.ts` si no se usan.
2. **Unificar admin de lecciones**
   - Eliminar `/admin/lessons` o adaptarla para que use `/api/lessons` y el mismo schema.
   - Dejar `/admin/lecciones` como única página de gestión de lecciones.
3. **Eliminar `src/data/courses` y `LEVEL_CONTENT` estático**
   - Migrar todo a `lessons` + `modules` + `year_plans` en Supabase.
   - `/nivel/[id]` debe depender 100% de `/api/lessons` y `/api/year-plans`.
4. **Unificar `students` y `users`**
   - Usar `users` con `role='student'`.
   - Migrar datos de `students` a `users` y eliminar la tabla o dejarla solo para lectura.

### 🟡 Media prioridad (próximas 2-4 semanas)
5. **Mejorar manejo de errores**
   - Mostrar toast de error en todos los `catch` de admin.
   - No dejar pantallas cargando infinitamente si falla una API.
6. **Agregar validación Zod en endpoints**
   - Especialmente en `/api/lessons`, `/api/tasks`, `/api/kits`, `/api/courses`.
7. **Paginación en listas grandes**
   - Usar paginación de Supabase (`range`) en entregas, usuarios, lecciones.
8. **Limpiar colores y contraste**
   - Revisar todas las páginas admin para usar `text-slate-900` / `text-slate-600` en lugar de `text-gray-300` sobre fondos claros.
9. **Eliminar `image-proxy` si no se usa**
   - Con Supabase Storage las URLs son públicas directamente.

### 🟢 Baja prioridad (futuro)
10. **Caché selectiva** para niveles, programas, kits.
11. **Tests unitarios** para APIs y componentes críticos.
12. **PWA offline** para lecciones ya vistas.
13. **Notificaciones** cuando se publica tarea o se califica.
14. **Gamificación completa** con badges y certificados.

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Páginas | 26 |
| Endpoints API | 34 (15 son backups) |
| Componentes React | 35 |
| Archivos backup muertos | 19 |
| Dependencias muertas | 3 |
| Tablas Supabase | 20+ |
| Tests | 3 |
| Usos de `any` | ~180 |

---

## ✅ Conclusión

La plataforma **funciona en producción** y la migración a Supabase está completa. Sin embargo, la deuda técnica acumulada (código muerto, duplicidad de rutas admin, datos estáticos) hace que pequeños cambios generen bugs inesperados. Las últimas 3 incidencias reportadas (kits, lecciones, Drive) fueron causadas directamente por esta duplicidad.

**Recomendación principal:** invertir una jornada en limpiar código muerto y unificar fuentes de datos. Esto reducirá drásticamente los bugs futuros y el costo de mantenimiento.

---

*Análisis generado el 4 de julio de 2026 tras revisión directa del código.*
