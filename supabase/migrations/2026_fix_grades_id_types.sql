-- ============================================================
-- FIX: grades.lesson_id y grades.task_id eran UUID, pero la app
-- (SubmissionsPanel.syncGradeToAirtable -> POST /api/grades) guarda
-- identificadores tipo "PY-MSQKDLCL", "sim-basic", "TASK-XXXX" (no-UUID)
-- en esas columnas, causando: invalid input syntax for type uuid: "..."
--
-- Efecto en producción: CADA calificación puesta desde "Entregas" fallaba
-- silenciosamente al sincronizarse a la tabla `grades` (el error solo se
-- registraba en la consola del navegador), por lo que las pestañas
-- "Estudiantes", "Calificaciones" y "Resumen" del panel de profesores
-- siempre aparecían vacías aunque las entregas sí estaban calificadas
-- en la tabla `submissions`.
--
-- Mismo patrón ya corregido antes en submissions.task_id, ver:
-- 2026_fix_submissions_task_id_type.sql
-- ============================================================

ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_lesson_id_fkey;
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_task_id_fkey;
ALTER TABLE grades ALTER COLUMN lesson_id TYPE TEXT;
ALTER TABLE grades ALTER COLUMN task_id TYPE TEXT;
