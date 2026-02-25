# Crear Tabla `students` en Airtable

## Paso 1: Crear la tabla en Airtable

1. Abre tu base de Airtable
2. Haz clic en **"+ Add or import"** (esquina inferior izquierda)
3. Selecciona **"Create blank table"**
4. Nombra la tabla: `students`

## Paso 2: Configurar los campos

Crea los siguientes campos con estos tipos:

| Campo | Tipo en Airtable | Descripción |
|-------|------------------|-------------|
| `name` | Single line text | Nombre del estudiante (CAMPO PRINCIPAL) |
| `levelId` | Single line text | ID del nivel educativo (ej: quinto-egb) |
| `courseId` | Single line text | ID del curso asignado |
| `schoolId` | Single line text | ID del colegio |
| `email` | Email | Correo electrónico |
| `accessCode` | Single line text | Código de acceso (ej: ES123456) |
| `createdAt` | Date | Fecha de creación |

## Paso 3: Importar datos

### Opción A: Importar CSV
1. En la tabla `students`, haz clic en **"..."** (menú de la tabla)
2. Selecciona **"Import data"** > **"CSV file"**
3. Sube el archivo: `students_para_importar.csv`
4. Mapea los campos correctamente
5. Haz clic en **"Import"**

### Opción B: Copiar y pegar desde Excel
1. Abre `students_para_importar.csv` en Excel
2. Copia todas las filas (sin encabezados)
3. En Airtable, pega directamente en la tabla

## Datos a importar

```csv
name,levelId,courseId,schoolId,email,accessCode,createdAt
"Pedro Palacios","quinto-egb","","","","","2026-02-01T00:00:00Z"
"Gabriel Zapata","","","","","","2026-02-04T00:00:00Z"
"Carlos Paneluisa","quinto-egb","","","","","2026-02-04T00:00:00Z"
"Juan Paz","","","","","","2026-02-07T00:00:00Z"
"Diego Padilla","quinto-egb","","","","","2026-02-19T00:00:00Z"
"Luis Romero","decimo-slm","","","","","2026-02-09T00:00:00Z"
"Hugo Chicaiza","primero-bach","","","","","2026-02-11T00:00:00Z"
```

## Verificación

Después de crear la tabla, verifica que:
- [x] La tabla se llama exactamente `students` (minúsculas)
- [x] El campo `name` es el campo principal
- [x] Todos los campos están creados con los tipos correctos

## Notas

- Esta tabla es **opcional** para el funcionamiento básico del sistema
- Los estudiantes también se pueden gestionar desde la tabla `users` con `role: student`
- La tabla `students` es útil para tener un registro separado de estudiantes sin credenciales de acceso
