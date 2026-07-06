-- ============================================================
-- FIX: submissions.task_id era UUID, pero /api/simulator-challenges
-- guarda identificadores tipo "sim-basic" (no-UUID) en esa columna,
-- causando: invalid input syntax for type uuid: "sim-basic"
--
-- Solución: cambiar el tipo a TEXT (quitando el FK estricto a tasks.id).
-- Las tareas reales siguen guardando su UUID como texto sin problema,
-- y los retos de simulador ("sim-{challengeId}") ahora sí se pueden insertar.
-- ============================================================

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_task_id_fkey;
ALTER TABLE submissions ALTER COLUMN task_id TYPE TEXT;
