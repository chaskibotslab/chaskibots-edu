# Plantillas para Airtable - ChaskiBots EDU

## Instrucciones de Importación

### 1. Tabla `grades` (Calificaciones)

1. Ve a tu base de Airtable
2. Clic en **"+ Add or import"** → **"Import data"** → **"CSV file"**
3. Selecciona el archivo `grades.csv`
4. Nombra la tabla como: **`grades`** (exactamente así, en minúsculas)
5. Después de importar, puedes eliminar la fila de ejemplo

**Campos de la tabla grades:**
| Campo | Descripción |
|-------|-------------|
| studentName | Nombre del estudiante |
| studentId | ID único del estudiante |
| lessonId | ID de la lección |
| levelId | Nivel educativo (primaria, secundaria, etc.) |
| courseId | ID del curso (para filtrar por profesor) |
| score | Calificación numérica (1-10) |
| feedback | Retroalimentación del profesor |
| taskId | ID de la tarea |
| submittedAt | Fecha de entrega |
| gradedAt | Fecha de calificación |
| gradedBy | Email del profesor que calificó |

### 2. Tabla `students` (Estudiantes) - Opcional

1. Importa `students.csv` de la misma manera
2. Nombra la tabla como: **`students`**

**Campos de la tabla students:**
| Campo | Descripción |
|-------|-------------|
| name | Nombre del estudiante |
| levelId | Nivel educativo |
| courseId | ID del curso asignado |
| email | Email del estudiante |
| createdAt | Fecha de creación |

## Después de Importar

1. Ve a **Admin → Calificaciones → Entregas**
2. Haz clic en el botón **"Sincronizar X calificaciones"**
3. Las calificaciones existentes se guardarán en Airtable
4. Ahora aparecerán en las pestañas "Estudiantes" y "Calificaciones"

## Notas Importantes

- Los nombres de las tablas deben ser exactamente `grades` y `students` (minúsculas)
- Puedes eliminar las filas de ejemplo después de importar
- El campo `courseId` es importante para filtrar por profesor
