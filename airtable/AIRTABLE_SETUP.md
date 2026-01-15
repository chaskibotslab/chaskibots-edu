# 📊 Configuración de Tablas en Airtable

## Tablas Necesarias para ChaskiBots EDU

Debes crear estas tablas en tu base de Airtable (`appGayG3c8NkjCjav`).

## 📋 Resumen de Tablas

| Tabla | Archivo CSV | Descripción |
|-------|-------------|-------------|
| `kits_para_importar` | kits_para_importar.csv | Kits de robótica por nivel |
| `lessons` | lessons.csv | Lecciones y videos |
| `year_plans` | year_plans.csv | Plan del año escolar |
| `ai_activities` | ai_activities.csv | Actividades de IA |
| `simulators` | simulators.csv | Simuladores disponibles |
| `levels` | levels.csv | Niveles educativos |
| `programs` | programs.csv | Programas por nivel |
| `users` | users.csv | Usuarios y códigos de acceso |
| `courses_catalog` | courses_catalog.csv | Catálogo de cursos |

## 🎯 Estructura del Sistema

```
NIVELES (levels)
    └── PROGRAMAS (programs) - Múltiples programas por nivel
            └── CURSOS/CLASES (courses_catalog) - Grupos de estudiantes
                    └── USUARIOS (users) - Estudiantes con código de acceso
```

**Ejemplo:**
- Nivel: `Inicial 2`
  - Programa: `Robótica Básica`
    - Curso: `Inicial 2 - Robótica Matutino`
      - Estudiante: María García (código: `ES4X8P3Q`)
  - Programa: `Programación Visual`
    - Curso: `Inicial 2 - Programación Vespertino`
      - Estudiante: Carlos López (código: `ES5Y9R4S`)

---

## 1️⃣ Tabla: `users` (Usuarios)

Esta tabla almacena todos los usuarios del sistema con sus códigos de acceso.

### Campos:

| Campo | Tipo en Airtable | Descripción | Requerido |
|-------|------------------|-------------|-----------|
| `id` | Single line text | ID único del usuario | ✅ |
| `accessCode` | Single line text | **Código de acceso único** (ej: ES4X8P3Q) | ✅ |
| `email` | Email | Email del usuario (opcional para estudiantes) | ❌ |
| `password` | Single line text | Contraseña (solo para login tradicional) | ❌ |
| `name` | Single line text | Nombre completo | ✅ |
| `levelId` | Single line text | ID del nivel educativo | ✅ |
| `role` | Single select | Opciones: `admin`, `teacher`, `student` | ✅ |
| `courseId` | Single line text | ID del curso/clase asignado | ❌ |
| `courseName` | Single line text | Nombre del curso/clase | ❌ |
| `programId` | Single line text | **ID del programa** (ej: prog-inicial2-robotica) | ✅ |
| `programName` | Single line text | **Nombre del programa** (ej: Robótica Básica) | ✅ |
| `progress` | Number | Porcentaje de progreso (0-100) | ❌ |
| `createdAt` | Date | Fecha de creación | ✅ |
| `lastLogin` | Date | Último acceso | ❌ |
| `expiresAt` | Date | Fecha de expiración del acceso | ❌ |
| `isActive` | Checkbox | Si el usuario está activo | ✅ |

### Formato de Códigos de Acceso:
- **Admin**: `AD` + 6 caracteres (ej: `AD1ADMIN`)
- **Profesor**: `PR` + 6 caracteres (ej: `PR7K9M2N`)
- **Estudiante**: `ES` + 6 caracteres (ej: `ES4X8P3Q`)

### Datos de ejemplo:
```csv
id,accessCode,email,password,name,levelId,role,courseId,courseName,progress,createdAt,lastLogin,expiresAt,isActive
user-admin,AD1ADMIN,admin@chaskibots.com,admin2024,Administrador,tercero-bach,admin,,,100,2024-01-01,2024-01-15,,true
user-profesor-1,PR7K9M2N,profesor1@chaskibots.com,profe123,Profesor Demo,primero-bach,teacher,curso-robotica-8vo,Robótica 8vo EGB,0,2024-01-01,2024-01-15,,true
user-8egb-demo1,ES7A1V6W,,,Estudiante 1 - 8vo,octavo-egb,student,curso-robotica-8vo,Robótica 8vo EGB,0,2024-01-01,,,true
```

---

## 2️⃣ Tabla: `courses_catalog` (Catálogo de Cursos)

Esta tabla almacena los cursos disponibles.

### Campos:

| Campo | Tipo en Airtable | Descripción | Requerido |
|-------|------------------|-------------|-----------|
| `id` | Single line text | ID único del curso | ✅ |
| `name` | Single line text | Nombre del curso | ✅ |
| `description` | Long text | Descripción del curso | ❌ |
| `levelId` | Single line text | Nivel educativo del curso | ✅ |
| `teacherId` | Single line text | ID del profesor asignado | ✅ |
| `teacherName` | Single line text | Nombre del profesor | ✅ |
| `maxStudents` | Number | Máximo de estudiantes | ✅ |
| `currentStudents` | Number | Estudiantes actuales | ❌ |
| `startDate` | Date | Fecha de inicio | ❌ |
| `endDate` | Date | Fecha de fin | ❌ |
| `isActive` | Checkbox | Si el curso está activo | ✅ |
| `createdAt` | Date | Fecha de creación | ✅ |

### Datos de ejemplo:
```csv
id,name,description,levelId,teacherId,teacherName,maxStudents,currentStudents,startDate,endDate,isActive,createdAt
curso-robotica-8vo,Robótica 8vo EGB,Robótica avanzada con Arduino,octavo-egb,user-profesor-1,Profesor Demo,30,3,2024-02-01,2024-12-15,true,2024-01-15
```

---

## 3️⃣ Tabla: `levels` (Niveles Educativos)

Ya existe. Contiene los niveles desde Inicial 1 hasta 3° Bachillerato.

---

## 4️⃣ Tabla: `kits_para_importar` (Kits)

Ya existe. Contiene los kits de robótica disponibles.

---

## 5️⃣ Tabla: `lessons` (Lecciones)

Ya existe (actualmente en `courses.csv`). Contiene las lecciones de cada nivel.

---

## 🔧 Cómo Crear las Tablas en Airtable

### Paso 1: Ir a tu base
1. Ve a [airtable.com](https://airtable.com)
2. Abre tu base `appGayG3c8NkjCjav`

### Paso 2: Crear tabla `users`
1. Clic en `+ Add a table`
2. Nombre: `users`
3. Agrega los campos según la tabla de arriba
4. Para `role`, crea un campo "Single select" con opciones: admin, teacher, student

### Paso 3: Crear tabla `courses_catalog`
1. Clic en `+ Add a table`
2. Nombre: `courses_catalog`
3. Agrega los campos según la tabla de arriba

### Paso 4: Importar datos de ejemplo
1. Puedes copiar los datos de los archivos CSV en esta carpeta
2. O usar la opción "Import" de Airtable

---

## 🔐 Cómo Funciona el Sistema de Acceso

### Para Estudiantes:
1. El profesor crea códigos de acceso en Airtable
2. El estudiante recibe su código (ej: `ES7A1V6W`)
3. En la app, el estudiante ingresa solo el código
4. El sistema valida y da acceso al contenido de su nivel

### Para Profesores:
1. El admin crea el código del profesor
2. El profesor puede ver todos los estudiantes de sus cursos
3. Puede generar nuevos códigos para estudiantes

### Para Admin:
1. Acceso total al sistema
2. Puede crear profesores, cursos y estudiantes
3. Puede ver estadísticas de uso

---

## 📝 Notas Importantes

1. **Los códigos de acceso son únicos** - No puede haber dos usuarios con el mismo código
2. **Los códigos no distinguen mayúsculas/minúsculas** - `ES7A1V6W` = `es7a1v6w`
3. **Los códigos pueden expirar** - Usa el campo `expiresAt` para accesos temporales
4. **Desactivar usuarios** - Cambia `isActive` a false en lugar de eliminar

---

## 🆕 Tabla: `programs` (Programas)

Esta tabla permite tener **múltiples programas por nivel** (ej: 4 programas para Inicial 2).

### Campos:

| Campo | Tipo en Airtable | Descripción | Requerido |
|-------|------------------|-------------|-----------|
| `id` | Single line text | ID único (ej: prog-inicial2-robotica) | ✅ |
| `name` | Single line text | Nombre del programa | ✅ |
| `description` | Long text | Descripción del programa | ❌ |
| `levelId` | Single line text | ID del nivel (ej: inicial-2) | ✅ |
| `levelName` | Single line text | Nombre del nivel (ej: Inicial 2) | ❌ |
| `type` | Single select | Tipo: robotica, programacion, electronica, ia, hacking | ✅ |
| `duration` | Single line text | Duración (ej: 6 meses) | ❌ |
| `price` | Number | Precio del programa | ❌ |
| `isActive` | Checkbox | Si está activo | ✅ |
| `createdAt` | Date | Fecha de creación | ✅ |

### Ejemplo de programas para Inicial 2:
```csv
prog-inicial2-robotica,Robótica Básica,inicial-2,robotica
prog-inicial2-programacion,Programación Visual,inicial-2,programacion
prog-inicial2-electronica,Electrónica Creativa,inicial-2,electronica
prog-inicial2-ia,IA para Niños,inicial-2,ia
```

---

## 🎓 Cómo Agregar Niveles Personalizados (Universidad, Cursos)

### Paso 1: Agregar el nivel en la tabla `levels`

Para agregar un nivel de **Universidad**:
```csv
universidad,Universidad,Cursos Universitarios y Profesionales,universidad,18+ años,20,100,true,true,from-slate-500 to-gray-700,#475569,🎓
```

Para agregar **Cursos Libres**:
```csv
curso-libre,Curso Libre,Cursos Cortos y Talleres,curso-libre,Todas las edades,99,50,true,true,from-amber-500 to-orange-600,#f59e0b,📚
```

### Paso 2: Crear programas para ese nivel

En la tabla `programs`, agrega los programas:
```csv
prog-universidad-python,Python Profesional,universidad,programacion
prog-universidad-ml,Machine Learning,universidad,ia
prog-curso-arduino,Arduino Maker,curso-libre,robotica
prog-curso-roblox,Desarrollo Roblox,curso-libre,programacion
```

### Paso 3: Crear usuarios con acceso a esos programas

En la tabla `users`:
```csv
user-uni-python,ESCD6F7G,,,Roberto Vega,universidad,student,curso-uni-ds,Data Science 2024,prog-universidad-python,Python Profesional,60,2024-01-01,,,true
```

### Campos importantes para niveles personalizados:

| Campo | Valor para Universidad | Valor para Curso Libre |
|-------|------------------------|------------------------|
| `id` | `universidad` | `curso-libre` |
| `category` | `universidad` | `curso-libre` |
| `gradeNumber` | `20` (alto para ordenar al final) | `99` |
| `hasHacking` | `true` | depende del curso |
| `hasAdvancedIA` | `true` | depende del curso |

---

## 🔄 Flujo Completo: Cómo Funciona

1. **Admin crea nivel** (si es nuevo) → tabla `levels`
2. **Admin crea programas** para ese nivel → tabla `programs`
3. **Admin/Profesor crea curso/clase** → tabla `courses_catalog`
4. **Admin/Profesor crea usuarios** con código de acceso → tabla `users`
5. **Estudiante ingresa código** → Sistema valida y redirige al programa correcto

### Ejemplo completo:

```
Nivel: Universidad
  └── Programa: Python Profesional (prog-universidad-python)
        └── Curso: Data Science 2024 (curso-uni-ds)
              └── Usuario: Roberto Vega
                    └── Código: ESCD6F7G
                          └── Al ingresar código → Ve contenido de Python Profesional
```
