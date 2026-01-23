# 📊 Configuración de Tablas en Airtable - ChaskiBots EDU

## ⚠️ IMPORTANTE: Tipos de Campo

**TODOS los campos de texto deben ser "Single line text", NO "Single Select".**
Esto evita errores como `INVALID_MULTIPLE_CHOICE_OPTIONS`.

## 📋 Tablas a Importar (en orden)

| # | Tabla | Archivo CSV | Registros | Descripción |
|---|-------|-------------|-----------|-------------|
| 1 | `schools` | schools.csv | 1 | **🏫 Colegios/Instituciones** |
| 2 | `levels` | levels.csv | 17 | Niveles educativos |
| 3 | `programs` | programs.csv | 26 | Programas por nivel |
| 4 | `courses_catalog` | courses_catalog.csv | 18 | Cursos/clases |
| 5 | `users` | users.csv | 11 | Usuarios y códigos |
| 6 | `lessons` | lessons.csv | 62 | Lecciones |
| 7 | `kits` | kits.csv | 16 | Kits de robótica |
| 8 | `ai_activities` | ai_activities.csv | 52 | Actividades IA |
| 9 | `simulators` | simulators.csv | 7 | Simuladores |
| 10 | `year_plans` | year_plans.csv | 136 | Plan anual |
| 11 | `projects` | projects.csv | 22 | Proyectos avanzados |
| 12 | `experiencias` | experiencias.csv | 8 | Galería |
| 13 | `grades` | grades.csv | 1 | Calificaciones |
| 14 | `submissions` | submissions.csv | 1 | Entregas de estudiantes |

## 🎯 Estructura del Sistema

```
COLEGIOS (schools) - Instituciones educativas
    └── NIVELES (levels) - Niveles educativos
            └── PROGRAMAS (programs) - Múltiples programas por nivel
                    └── CURSOS/CLASES (courses_catalog) - Grupos de estudiantes
                            └── USUARIOS (users) - Estudiantes con código de acceso
```

---

## 🏫 Tabla: `schools` (Colegios/Instituciones)

Esta tabla almacena los colegios e instituciones educativas. **IMPORTAR PRIMERO**.

### Campos:

| Campo | Tipo en Airtable | Descripción | Requerido |
|-------|------------------|-------------|-----------|
| `id` | Single line text | ID único del colegio (ej: school-001) | ✅ |
| `name` | Single line text | Nombre completo del colegio | ✅ |
| `code` | Single line text | Código corto (ej: UESF) | ✅ |
| `address` | Single line text | Dirección física | ❌ |
| `city` | Single line text | Ciudad | ❌ |
| `country` | Single line text | País (default: Ecuador) | ❌ |
| `phone` | Single line text | Teléfono de contacto | ❌ |
| `email` | Email | Email de contacto | ❌ |
| `logo` | Attachment | Logo del colegio | ❌ |
| `isActive` | Checkbox | Si el colegio está activo | ✅ |
| `createdAt` | Date | Fecha de creación | ✅ |
| `maxStudents` | Number | Máximo de estudiantes permitidos | ❌ |
| `maxTeachers` | Number | Máximo de profesores permitidos | ❌ |

### Datos de ejemplo:
```csv
id,name,code,address,city,country,phone,email,logo,isActive,createdAt,maxStudents,maxTeachers
school-demo,Colegio Demo ChaskiBots,DEMO,Av. Principal 123,Quito,Ecuador,+593999999999,contacto@colegiodemo.edu.ec,,true,2024-01-01,100,10
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
| `accessCode` | Single line text | **Código de acceso único** (ej: ES4X8P3Q) | ✅ |
| `email` | Email | Email del usuario (opcional para estudiantes) | ❌ |
| `password` | Single line text | Contraseña (solo para login tradicional) | ❌ |
| `name` | Single line text | Nombre completo | ✅ |
| `levelId` | **Single line text** | ID del nivel educativo (NO usar Single Select) | ✅ |
| `role` | **Single line text** | admin, teacher, student (NO usar Single Select) | ✅ |
| `courseId` | Single line text | ID del curso/clase asignado | ❌ |
| `courseName` | Single line text | Nombre del curso/clase | ❌ |
| `schoolId` | Single line text | **🏫 ID del colegio** (ej: school-demo) | ❌ |
| `schoolName` | Single line text | **🏫 Nombre del colegio** | ❌ |
| `programId` | Single line text | **ID del programa** (ej: prog-inicial2-robotica) | ❌ |
| `programName` | Single line text | **Nombre del programa** (ej: Robótica Básica) | ❌ |
| `progress` | Number | Porcentaje de progreso (0-100) | ❌ |
| `createdAt` | Date | Fecha de creación (formato: YYYY-MM-DD) | ✅ |
| `lastLogin` | Date | Último acceso | ❌ |
| `expiresAt` | Date | Fecha de expiración del acceso | ❌ |
| `isActive` | Checkbox | Si el usuario está activo | ✅ |

### ⚠️ IMPORTANTE: 
- `levelId` y `role` deben ser **Single line text**, NO Single Select
- Airtable genera automáticamente un ID interno, no necesitas campo `id`
- **`schoolId` y `schoolName`** son necesarios para filtrar datos por colegio

### Formato de Códigos de Acceso:
- **Admin**: `AD` + 6 caracteres (ej: `AD1ADMIN`)
- **Profesor**: `PR` + 6 caracteres (ej: `PR7K9M2N`)
- **Estudiante**: `ES` + 6 caracteres (ej: `ES4X8P3Q`)

### Datos de ejemplo:
```csv
accessCode,email,password,name,levelId,role,courseId,courseName,schoolId,schoolName,programId,programName,progress,createdAt,lastLogin,expiresAt,isActive
AD1ADMIN,admin@chaskibots.com,1234,Administrador,tercero-bach,admin,,,,,,,100,2024-01-01,2024-01-15,,true
PR7K9M2N,profesor1@chaskibots.com,111,Profesor Demo,octavo-egb,teacher,curso-robotica-8vo,Robótica 8vo EGB,school-demo,Colegio Demo ChaskiBots,prog-8egb-robotica,Robótica Avanzada,0,2024-01-01,2024-01-15,,true
ES4X8P3Q,,,María García,inicial-2,student,curso-inicial-2,Tecnología Inicial 2,school-demo,Colegio Demo ChaskiBots,prog-inicial2-robotica,Robótica Básica,25,2024-01-01,2024-01-15,2025-12-31,true
```

---

## 2️⃣ Tabla: `courses_catalog` (Catálogo de Cursos)

Esta tabla almacena los cursos disponibles. **Los cursos pertenecen a un colegio específico.**

### Campos:

| Campo | Tipo en Airtable | Descripción | Requerido |
|-------|------------------|-------------|-----------|
| `id` | Single line text | ID único del curso | ✅ |
| `name` | Single line text | Nombre del curso | ✅ |
| `description` | Long text | Descripción del curso | ❌ |
| `levelId` | Single line text | Nivel educativo del curso | ✅ |
| `teacherId` | Single line text | ID del profesor asignado | ❌ |
| `teacherName` | Single line text | Nombre del profesor | ❌ |
| `schoolId` | Single line text | **🏫 ID del colegio** | ❌ |
| `schoolName` | Single line text | **🏫 Nombre del colegio** | ❌ |
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

---

## 📝 Tabla: `grades` (Calificaciones)

Esta tabla almacena las calificaciones de los estudiantes.

### Campos:

| Campo | Tipo en Airtable | Descripción | Requerido |
|-------|------------------|-------------|-----------|
| `studentName` | Single line text | Nombre del estudiante | ✅ |
| `studentId` | Single line text | ID del estudiante | ❌ |
| `lessonId` | Single line text | ID de la lección | ✅ |
| `levelId` | Single line text | ID del nivel | ❌ |
| `courseId` | Single line text | ID del curso | ❌ |
| `schoolId` | Single line text | **🏫 ID del colegio** | ❌ |
| `score` | Number | Calificación (0-10) | ✅ |
| `feedback` | Long text | Retroalimentación del profesor | ❌ |
| `taskId` | Single line text | ID de la tarea | ❌ |
| `submittedAt` | Date | Fecha de entrega | ✅ |
| `gradedAt` | Date | Fecha de calificación | ❌ |
| `gradedBy` | Single line text | Email del profesor que calificó | ❌ |

### Datos de ejemplo:
```csv
studentName,studentId,lessonId,levelId,courseId,schoolId,score,feedback,taskId,submittedAt,gradedAt,gradedBy
"María García","est-001","leccion-1","inicial-2","curso-inicial-2","school-demo","9","Excelente trabajo","tarea-001","2024-01-15T10:00:00Z","2024-01-15T12:00:00Z","profesor@ejemplo.com"
```

---

## 📤 Tabla: `submissions` (Entregas de Estudiantes)

Esta tabla almacena las entregas de tareas de los estudiantes desde los simuladores.

### Campos:

| Campo | Tipo en Airtable | Descripción | Requerido |
|-------|------------------|-------------|-----------|
| `taskId` | Single line text | ID de la tarea | ✅ |
| `studentName` | Single line text | Nombre del estudiante | ✅ |
| `studentEmail` | Email | Email del estudiante | ❌ |
| `levelId` | Single line text | ID del nivel | ✅ |
| `lessonId` | Single line text | ID de la lección | ❌ |
| `courseId` | Single line text | ID del curso | ❌ |
| `schoolId` | Single line text | **🏫 ID del colegio** | ❌ |
| `code` | Long text | Código enviado | ✅ |
| `output` | Long text | Salida del código | ❌ |
| `submittedAt` | Date | Fecha de entrega | ✅ |
| `status` | Single line text | pending, graded, returned | ✅ |
| `grade` | Number | Calificación asignada | ❌ |
| `feedback` | Long text | Retroalimentación | ❌ |
| `gradedBy` | Single line text | Profesor que calificó | ❌ |
| `drawing` | Long text | Dibujo en base64 | ❌ |
| `files` | Long text | Archivos adjuntos JSON | ❌ |

### Datos de ejemplo:
```csv
taskId,studentName,studentEmail,levelId,lessonId,courseId,schoolId,code,output,submittedAt,status,grade,feedback,gradedBy,drawing,files
TAREA-001,María García,maria@test.com,inicial-2,lesson-1,curso-inicial-2,school-demo,print('Hola'),Hola,2024-01-20T10:00:00Z,pending,,,,,
```

---

## 🏫 Sistema de Colegios

El sistema permite separar datos por colegio/institución:

1. **Crear colegio** en `/admin/colegios`
2. **Asignar usuarios** al colegio al crearlos
3. **Los profesores** solo ven datos de su colegio y curso
4. **Los admins** ven todos los datos

### Flujo:
```
Admin crea Colegio "UESF" (school-demo)
    └── Admin crea Profesor asignado a UESF + curso "8vo-A"
            └── Admin crea Estudiantes asignados a UESF + curso "8vo-A"
                    └── Profesor solo ve entregas/calificaciones de 8vo-A de UESF
```
