# 📋 Tablas para Importar en Airtable

## ⚠️ IMPORTANTE: Orden de Importación

Importa las tablas en este orden para evitar errores:

1. **schools** (primero - es la tabla base)
2. **users** 
3. **courses_catalog**
4. **grades**
5. **submissions**

---

## 🏫 Tabla: `schools`

**Archivo:** `schools.csv`

### Campos requeridos en Airtable:

| Campo | Tipo en Airtable |
|-------|------------------|
| id | Single line text |
| name | Single line text |
| code | Single line text |
| address | Single line text |
| city | Single line text |
| country | Single line text |
| phone | Single line text |
| email | Email |
| maxStudents | Number |
| maxTeachers | Number |

---

## 👥 Tabla: `users`

**Archivo:** `users.csv`

### Campos requeridos en Airtable:

| Campo | Tipo en Airtable |
|-------|------------------|
| accessCode | Single line text |
| email | Email |
| password | Single line text |
| name | Single line text |
| levelId | Single line text |
| role | Single line text |
| courseId | Single line text |
| courseName | Single line text |
| schoolId | Single line text |
| schoolName | Single line text |
| programId | Single line text |
| programName | Single line text |
| progress | Number |
| createdAt | Single line text |
| lastLogin | Single line text |
| expiresAt | Single line text |
| isActive | Checkbox |

---

## 📚 Tabla: `courses_catalog`

**Archivo:** `courses_catalog.csv`

### Campos requeridos en Airtable:

| Campo | Tipo en Airtable |
|-------|------------------|
| id | Single line text |
| name | Single line text |
| description | Long text |
| levelId | Single line text |
| programId | Single line text |
| teacherName | Single line text |
| schoolId | Single line text |
| schoolName | Single line text |
| maxStudents | Number |
| currentStudents | Number |
| startDate | Single line text |
| endDate | Single line text |
| isActive | Checkbox |
| createdAt | Single line text |

---

## ⭐ Tabla: `grades`

**Archivo:** `grades.csv`

### Campos requeridos en Airtable:

| Campo | Tipo en Airtable |
|-------|------------------|
| studentName | Single line text |
| studentId | Single line text |
| lessonId | Single line text |
| levelId | Single line text |
| courseId | Single line text |
| schoolId | Single line text |
| score | Number |
| feedback | Long text |
| taskId | Single line text |
| submittedAt | Single line text |
| gradedAt | Single line text |
| gradedBy | Single line text |

---

## 📝 Tabla: `submissions`

**Archivo:** `submissions.csv`

### Campos requeridos en Airtable:

| Campo | Tipo en Airtable |
|-------|------------------|
| taskId | Single line text |
| studentName | Single line text |
| studentEmail | Email |
| levelId | Single line text |
| lessonId | Single line text |
| courseId | Single line text |
| schoolId | Single line text |
| code | Long text |
| output | Long text |
| submittedAt | Single line text |
| status | Single line text |
| grade | Number |
| feedback | Long text |
| gradedBy | Single line text |
| drawing | Long text |
| files | Long text |

---

## 🔧 Cómo Importar

1. Ve a tu base de Airtable
2. Haz clic en **"+ Add or import"** → **"CSV file"**
3. Selecciona el archivo CSV correspondiente
4. Airtable creará la tabla automáticamente
5. **Verifica que los tipos de campo sean correctos** (especialmente Number y Checkbox)

## ⚡ Si ya tienes la tabla creada

Si la tabla ya existe pero le faltan campos:
1. Abre la tabla en Airtable
2. Haz clic en **"+"** para agregar un nuevo campo
3. Nombra el campo exactamente como aparece en la lista
4. Selecciona el tipo correcto

---

## 🎯 Verificación

Después de importar, verifica que puedas:
- ✅ Crear un nuevo colegio desde `/admin/colegios`
- ✅ Crear usuarios con colegio asignado desde `/admin/gestion`
- ✅ Ver las calificaciones filtradas por colegio
