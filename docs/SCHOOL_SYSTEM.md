# Sistema de Colegios - ChaskiBots EDU

## Descripción

El sistema de colegios permite separar los datos por institución educativa, asegurando que:
- Los **profesores** solo vean estudiantes, entregas y calificaciones de su colegio y curso asignado
- Los **administradores** puedan ver todos los datos de todos los colegios
- Los **estudiantes** solo vean su propio progreso

## Configuración en Airtable

### 1. Crear tabla `schools`

Importa el archivo `airtable/schools.csv` o crea la tabla manualmente con estos campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Single line text | ID único del colegio (ej: `school-001`) |
| `name` | Single line text | Nombre completo del colegio |
| `code` | Single line text | Código corto (ej: `UESF`) |
| `address` | Single line text | Dirección física |
| `city` | Single line text | Ciudad |
| `country` | Single line text | País (default: Ecuador) |
| `phone` | Single line text | Teléfono de contacto |
| `email` | Email | Email de contacto |
| `isActive` | Checkbox | Si el colegio está activo |
| `createdAt` | Date | Fecha de creación |
| `maxStudents` | Number | Máximo de estudiantes permitidos |
| `maxTeachers` | Number | Máximo de profesores permitidos |

### 2. Agregar campos a tabla `users`

Agrega estos campos a la tabla `users` existente:

| Campo | Tipo |
|-------|------|
| `schoolId` | Single line text |
| `schoolName` | Single line text |

### 3. Agregar campos a tabla `grades`

Agrega este campo a la tabla `grades`:

| Campo | Tipo |
|-------|------|
| `schoolId` | Single line text |

### 4. Agregar campos a tabla `submissions`

Agrega estos campos a la tabla `submissions`:

| Campo | Tipo |
|-------|------|
| `schoolId` | Single line text |
| `courseId` | Single line text |

## Uso del Sistema

### Panel de Administración

1. Accede a `/admin/colegios` para gestionar colegios
2. Crea nuevos colegios con nombre, código, ciudad, etc.
3. Los colegios aparecerán en el selector al crear usuarios

### Asignar Usuarios a Colegios

1. Ve a `/admin` → Usuarios
2. Al crear o editar un usuario, selecciona el colegio en el campo "Colegio/Institución"
3. El `schoolId` y `schoolName` se guardarán automáticamente

### Filtrado Automático

Cuando un **profesor** inicia sesión:
- Su `schoolId` y `courseId` se cargan desde Airtable
- Las entregas (`/admin/entregas`) se filtran por su colegio y curso
- Las calificaciones (`/admin/calificaciones`) se filtran por su colegio y curso

## Archivos Modificados

### APIs
- `src/app/api/schools/route.ts` - CRUD de colegios
- `src/app/api/grades/route.ts` - Filtro por schoolId
- `src/app/api/submissions/route.ts` - Filtro por schoolId

### Componentes
- `src/components/GradingPanel.tsx` - Filtro por schoolId para profesores
- `src/components/SubmissionsPanel.tsx` - Filtro por schoolId para profesores
- `src/components/admin/UsersManager.tsx` - Selector de colegio

### Autenticación
- `src/lib/airtable-auth.ts` - schoolId/schoolName en todas las funciones de usuario
- `src/components/AuthProvider.tsx` - schoolId en interfaz User

### Páginas
- `src/app/admin/colegios/page.tsx` - UI de gestión de colegios
- `src/app/admin/page.tsx` - Enlace a colegios en menú

## Ejemplo de Flujo

1. Admin crea colegio "Unidad Educativa San Francisco" (código: UESF)
2. Admin crea profesor "Prof. García" asignado a UESF y curso "8vo-A"
3. Admin crea estudiantes asignados a UESF y curso "8vo-A"
4. Prof. García inicia sesión → solo ve entregas/calificaciones de 8vo-A de UESF
5. Si existe otro 8vo-A en otro colegio, Prof. García NO lo verá

## Notas Importantes

- Los administradores (`role: admin`) siempre ven todos los datos
- Si un usuario no tiene `schoolId`, verá todos los datos (comportamiento legacy)
- El filtro combina `schoolId` AND `courseId` para máxima seguridad
