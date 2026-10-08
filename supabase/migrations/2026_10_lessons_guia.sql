-- ============================================================
-- GUÍA POR ETAPAS EN LAS LECCIONES NORMALES (no borra nada)
-- ============================================================
-- Añade a cada lección el mismo campo de guía que ya tienen los
-- proyectos de kit, para que toda la plataforma use un solo
-- formato de lección.
--
-- Es idempotente: se puede ejecutar más de una vez sin problema.
-- Cómo aplicarlo: Supabase > SQL Editor > pegar todo > Run.
-- ============================================================

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS guia JSONB;

-- Verificación: debe mostrar el total de lecciones.
SELECT count(*) AS lecciones, count(guia) AS con_guia FROM lessons;
