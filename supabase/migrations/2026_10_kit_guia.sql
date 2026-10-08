-- ============================================================
-- GUÍA DE 6 ETAPAS POR PROYECTO DE KIT (no borra nada)
-- ============================================================
-- Añade a cada proyecto un campo para su guía paso a paso:
-- el reto, las piezas, el armado cable por cable, el código
-- explicado, la prueba y las preguntas finales.
--
-- Es idempotente: se puede ejecutar más de una vez sin problema.
-- Cómo aplicarlo: Supabase > SQL Editor > pegar todo > Run.
-- ============================================================

ALTER TABLE kit_proyectos ADD COLUMN IF NOT EXISTS guia JSONB;

-- Verificación: debe mostrar el total de proyectos.
SELECT count(*) AS proyectos, count(guia) AS con_guia FROM kit_proyectos;
