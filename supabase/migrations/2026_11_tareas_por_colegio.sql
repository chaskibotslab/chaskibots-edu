-- Tareas por colegio.
--
-- Hasta ahora una tarea era solo "de un grado": la veían los estudiantes de ese grado de
-- TODOS los colegios. Con esta columna cada tarea puede pertenecer a un colegio:
--   school_id = NULL      → tarea general (la ven solo quienes NO tienen curso de institución)
--   school_id = un colegio → la ven solo los docentes y estudiantes de ese colegio y grado
--
-- Las 104 tareas que existen hoy quedan como generales (nadie de COPOL ni de la Academia
-- las verá mezcladas con las suyas). No se borra nada.
-- Se puede ejecutar más de una vez.
BEGIN;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS school_id TEXT;
CREATE INDEX IF NOT EXISTS idx_tasks_school_level ON tasks (school_id, level_id);

-- Las tareas generales están cargadas dos veces (18 y 25 de junio, mismo grado y título).
-- Se desactiva la copia más nueva de cada par; NO se borra: se puede reactivar en «Gestionar Tareas».
UPDATE tasks t
SET is_active = false
WHERE t.school_id IS NULL
  AND EXISTS (
    SELECT 1 FROM tasks o
    WHERE o.level_id = t.level_id
      AND o.title = t.title
      AND o.school_id IS NULL
      AND (o.created_at < t.created_at OR (o.created_at = t.created_at AND o.id::text < t.id::text))
  );

-- Las entregas antiguas no guardaban el colegio: se completa con el colegio de quien la envió,
-- para que cada docente vea solo las entregas de su colegio.
UPDATE submissions s
SET school_id = u.school_id
FROM users u
WHERE s.school_id IS NULL
  AND u.school_id IS NOT NULL
  AND s.user_id::text = u.id::text;

COMMIT;

-- Comprobación: cuántas tareas hay por colegio (NULL = generales) y cuántas activas.
-- Esperado ahora: una sola fila, school_id vacío, 104 en total y 52 activas.
SELECT school_id, count(*) AS total, count(*) FILTER (WHERE is_active) AS activas
FROM tasks
GROUP BY school_id
ORDER BY school_id NULLS FIRST;
