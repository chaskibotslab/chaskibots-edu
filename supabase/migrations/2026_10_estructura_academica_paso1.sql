-- ============================================================
-- ESTRUCTURA ACADÉMICA — PASO 1 (no borra nada)
-- ============================================================
-- Añade los enlaces que faltaban:
--   * Grupo  -> programas contratados   (courses_catalog.program_ids)
--   * Docente -> programas que enseña   (teacher_courses.program_ids)
--   * Tarea  -> grupo y programa        (tasks.course_id, tasks.program_id)
-- y los rellena con los datos actuales.
--
-- Es idempotente: se puede ejecutar más de una vez sin problema.
-- Cómo aplicarlo: Supabase > SQL Editor > pegar todo > Run.
-- ============================================================

ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS program_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE teacher_courses ADD COLUMN IF NOT EXISTS program_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS program_id TEXT;

CREATE INDEX IF NOT EXISTS idx_teacher_courses_teacher ON teacher_courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_courses_course ON teacher_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_users_course ON users(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_course ON tasks(course_id);

-- Programas de cada grupo: los que tienen lecciones para el nivel del grupo.
-- Solo se rellenan los grupos que aún no tienen programas definidos.
UPDATE courses_catalog g
SET program_ids = sub.programas
FROM (
  SELECT level_id, array_agg(DISTINCT program_id ORDER BY program_id) AS programas
  FROM lessons
  WHERE program_id IN ('robotica', 'ia', 'hacking', 'diseno')
  GROUP BY level_id
) sub
WHERE g.level_id = sub.level_id
  AND g.program_ids = '{}';

-- Grupos de niveles sin lecciones propias (copias por colegio): Robótica por defecto.
UPDATE courses_catalog SET program_ids = ARRAY['robotica'] WHERE program_ids = '{}';

-- Las asignaciones de docente heredan los programas de su grupo.
UPDATE teacher_courses tc
SET program_ids = g.program_ids
FROM courses_catalog g
WHERE tc.course_id = g.id
  AND tc.program_ids = '{}';

-- Verificación
SELECT 'grupos con programas' AS dato, count(*) FILTER (WHERE program_ids <> '{}') AS con, count(*) AS total FROM courses_catalog
UNION ALL
SELECT 'asignaciones con programas', count(*) FILTER (WHERE program_ids <> '{}'), count(*) FROM teacher_courses;
