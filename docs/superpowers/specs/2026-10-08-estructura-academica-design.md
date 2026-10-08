# Diseño: Estructura académica unificada (niveles, programas, grupos, docentes)

Fecha: 2026-10-08

## Contexto

Los enlaces entre niveles, programas, cursos y docentes existen en las tablas pero casi no se usan en los datos:

- `programs` mezcla 4 áreas base (`robotica`, `ia`, `hacking`, `diseno`) con 27 entradas `prog-<nivel>-<tipo>` que ninguna lección usa. Las lecciones ya guardan `level_id` y `program_id` por separado.
- Hay dos tablas de "cursos": `courses` (catálogo de Academia, 16 filas) y `courses_catalog` (27 filas, que en realidad son grupos de un colegio).
- De 4 docentes hay 1 asignación en `teacher_courses`. Ningún grupo tiene docente.
- No existe enlace docente → programa.
- De 12 usuarios, 5 tienen un `course_id` que existe y 3 un `program_id` válido.
- `levels` tiene copias por colegio (`sexto-slm`, …) y niveles de prueba.
- `students` duplica a `users` con `role = 'student'`.

## Modelo

Cuatro conceptos, cada uno con un solo significado:

| Concepto | Qué es | Dónde vive |
|---|---|---|
| Nivel | El grado (Inicial 1 … 3ro BGU, Universidad, Curso libre) | `levels` |
| Programa | Una de las 4 áreas: Robótica, IA, Hacking, Diseño | `programs` (solo ids base) |
| Grupo | Paralelo de un colegio: colegio + nivel + nombre + programas contratados | `courses_catalog` + `program_ids TEXT[]` |
| Asignación | Docente → grupo + programas que enseña ahí | `teacher_courses` + `program_ids TEXT[]` |

- El estudiante pertenece a un grupo (`users.course_id` → `courses_catalog.id`) y hereda de él colegio, nivel y programas.
- `teacher_courses.teacher_id` es siempre `users.id`.
- Una tarea puede dirigirse a un grupo y a un programa (`tasks.course_id`, `tasks.program_id`); vacío significa "todo el nivel", que es el comportamiento actual.
- `courses` (Academia) no cambia; en pantalla se llama "Cursos de Academia".

Se conserva el nombre de tabla `courses_catalog` para no romper las rutas existentes; en pantalla se llama "Grupos".

## Fases

1. **Preparar (no destructivo).** Migración `2026_10_estructura_academica_paso1.sql`: añade las columnas y las rellena. Los programas de cada grupo se derivan de las lecciones que existen para su nivel; las asignaciones heredan los programas de su grupo.
2. **Pantalla de admin `/admin/estructura`.** Colegio → Grupos → Docentes y Estudiantes. Permite elegir programas del grupo, asignar docentes con sus programas y mover estudiantes de grupo. API en `/api/admin/estructura` (GET árbol, POST acciones; mutaciones solo admin).
3. **Aplicar permisos.** El docente ve solo sus grupos y programas en entregas, tareas y calificaciones; el estudiante ve solo los programas de su grupo. Regla de compatibilidad: un grupo o asignación sin programas definidos equivale a "todos".
4. **Limpieza (destructivo, con respaldo y confirmación).** Reasignar y borrar niveles duplicados y de prueba, borrar los 27 programas derivados, fusionar `students` en `users`, retirar `LevelsManager`/`ProgramsManager`/`TeacherCoursesManager` en favor de la pantalla nueva.

## Errores y compatibilidad

- La API lee con `select('*')` y trata `program_ids` ausente como `[]`, de modo que la pantalla carga aunque la migración no se haya ejecutado; al guardar programas devuelve un mensaje claro pidiendo ejecutarla.
- Ninguna fase antes de la 4 borra datos.

## Pruebas

- Verificación local por rol (sin sesión, estudiante, docente, admin) de `/api/admin/estructura`.
- Tras la migración: comprobar conteos de grupos con programas y asignaciones con programas.
- Fase 3: un docente asignado solo a Robótica no ve entregas de IA de su grupo; un estudiante de un grupo sin Hacking no ve Hacking.
