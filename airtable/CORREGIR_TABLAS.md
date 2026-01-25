# ⚠️ CONFIGURACIÓN DE TABLAS EN AIRTABLE

## 🆕 NUEVA TABLA: `teacher_courses`

Esta tabla permite asignar **múltiples cursos** a cada profesor de forma escalable.

### Campos de la tabla `teacher_courses`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Single line text | ID único de la asignación |
| `teacherId` | Single line text | accessCode del profesor |
| `teacherName` | Single line text | Nombre del profesor |
| `courseId` | Single line text | ID del curso asignado |
| `courseName` | Single line text | Nombre del curso |
| `levelId` | Single line text | Nivel del curso |
| `schoolId` | Single line text | ID del colegio |
| `schoolName` | Single line text | Nombre del colegio |
| `createdAt` | Single line text | Fecha de asignación |

### Cómo crear la tabla:

1. Ve a tu base de Airtable
2. Haz clic en **"+ Add or import"** → **"CSV file"**
3. Selecciona el archivo `airtable/teacher_courses.csv`
4. Airtable creará la tabla automáticamente

### Ejemplo de asignación:

| teacherId | teacherName | courseId | levelId | schoolId |
|-----------|-------------|----------|---------|----------|
| PRB23SLL | Hugo Chicaiza | curso-inicial-2 | inicial-2 | school-uepslm |
| PRB23SLL | Hugo Chicaiza | curso-robotica-8vo | octavo-egb | school-uepslm |

Con esta tabla, Hugo Chicaiza solo verá los niveles `inicial-2` y `octavo-egb`.

---

## El Problema con campos "Single select"

El error `INVALID_MULTIPLE_CHOICE_OPTIONS` ocurre porque algunos campos en tus tablas de Airtable están configurados como **"Single select"** o **"Multiple select"** en lugar de **"Single line text"**.

Airtable NO permite crear nuevas opciones de select desde la API, por eso falla al crear usuarios.

---

## 🔧 SOLUCIÓN: Cambiar tipos de campos

### Tabla: `users`

**Campos que DEBEN ser "Single line text" (NO select):**

| Campo | Tipo CORRECTO | ❌ Tipo INCORRECTO |
|-------|---------------|-------------------|
| `levelId` | Single line text | Single select |
| `role` | Single line text | Single select |
| `courseId` | Single line text | Single select |
| `courseName` | Single line text | Single select |
| `schoolId` | Single line text | Single select |
| `schoolName` | Single line text | Single select |
| `programId` | Single line text | Single select |
| `programName` | Single line text | Single select |

### Tabla: `schools`

| Campo | Tipo CORRECTO |
|-------|---------------|
| `id` | Single line text |
| `name` | Single line text |
| `code` | Single line text |
| `address` | Single line text |
| `city` | Single line text |
| `country` | Single line text |
| `phone` | Single line text |
| `email` | Single line text |
| `maxStudents` | Number |
| `maxTeachers` | Number |

### Tabla: `courses_catalog`

| Campo | Tipo CORRECTO |
|-------|---------------|
| `id` | Single line text |
| `name` | Single line text |
| `description` | Long text |
| `levelId` | Single line text |
| `programId` | Single line text |
| `teacherName` | Single line text |
| `schoolId` | Single line text |
| `schoolName` | Single line text |
| `maxStudents` | Number |
| `currentStudents` | Number |
| `startDate` | Single line text |
| `endDate` | Single line text |
| `isActive` | Checkbox |
| `createdAt` | Single line text |

### Tabla: `grades`

| Campo | Tipo CORRECTO |
|-------|---------------|
| `studentName` | Single line text |
| `studentId` | Single line text |
| `lessonId` | Single line text |
| `levelId` | Single line text |
| `courseId` | Single line text |
| `schoolId` | Single line text |
| `score` | Number |
| `feedback` | Long text |
| `taskId` | Single line text |
| `submittedAt` | Single line text |
| `gradedAt` | Single line text |
| `gradedBy` | Single line text |

### Tabla: `submissions`

| Campo | Tipo CORRECTO |
|-------|---------------|
| `taskId` | Single line text |
| `studentName` | Single line text |
| `studentEmail` | Single line text |
| `levelId` | Single line text |
| `lessonId` | Single line text |
| `courseId` | Single line text |
| `schoolId` | Single line text |
| `code` | Long text |
| `output` | Long text |
| `submittedAt` | Single line text |
| `status` | Single line text |
| `grade` | Number |
| `feedback` | Long text |
| `gradedBy` | Single line text |
| `drawing` | Long text |
| `files` | Long text |

---

## 📋 Cómo cambiar el tipo de campo en Airtable

1. Abre la tabla en Airtable
2. Haz clic en el nombre del campo (ej: `levelId`)
3. Selecciona **"Customize field type"**
4. Cambia de "Single select" a **"Single line text"**
5. Confirma el cambio
6. Repite para todos los campos listados arriba

---

## 🔄 Alternativa: Eliminar y reimportar tablas

Si prefieres empezar de cero:

1. Elimina las tablas problemáticas en Airtable
2. Importa los archivos CSV de la carpeta `airtable/`
3. Airtable creará los campos como "Single line text" por defecto

**Orden de importación:**
1. `schools.csv`
2. `users.csv`
3. `courses_catalog.csv`
4. `grades.csv`
5. `submissions.csv`

---

## ✅ Verificación

Después de corregir los tipos de campo:
- Intenta crear un usuario desde `/admin/gestion`
- Intenta crear un colegio desde `/admin/colegios`
- Ambos deberían funcionar sin errores
