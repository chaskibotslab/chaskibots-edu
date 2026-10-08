-- ============================================================
-- CERRAR EL ACCESO PÚBLICO DIRECTO A LA BASE DE DATOS
-- ============================================================
-- Problema: con la clave pública (anon) de Supabase, que viaja dentro del
-- sitio web, se podía leer la tabla `users` completa (incluidos password y
-- access_code), además de students, submissions y tasks.
--
-- La app NO necesita ese acceso: todas las rutas /api usan la clave de
-- servicio (service_role), que no pasa por RLS. Así que se cierra todo:
--   1. Se eliminan todas las políticas existentes (varias daban lectura y
--      escritura a cualquiera con USING (true)).
--   2. RLS activado en todas las tablas del esquema public.
--   3. Se quitan los permisos de anon y authenticated sobre cada tabla.
--
-- Cada tabla se procesa por separado: si una falla, las demás se cierran
-- igual y el fallo aparece en la columna `nota` del resultado.
--
-- Es idempotente: se puede ejecutar más de una vez sin problema.
-- Cómo aplicarlo: Supabase > SQL Editor > pegar todo > Run.
-- ============================================================

CREATE TEMP TABLE IF NOT EXISTS _cierre_notas (tabla TEXT, nota TEXT);
TRUNCATE _cierre_notas;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO _cierre_notas VALUES (r.tablename, 'política ' || r.policyname || ': ' || SQLERRM);
    END;
  END LOOP;

  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', r.tablename);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO _cierre_notas VALUES (r.tablename, SQLERRM);
    END;
  END LOOP;
END $$;

-- Verificación: todas las filas deben decir rls_activo = true, politicas = 0
-- y anon_puede_leer = false. La columna nota debe quedar vacía.
SELECT t.tablename,
       t.rowsecurity AS rls_activo,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.tablename) AS politicas,
       has_table_privilege('anon', format('public.%I', t.tablename), 'SELECT') AS anon_puede_leer,
       (SELECT string_agg(n.nota, ' | ') FROM _cierre_notas n WHERE n.tabla = t.tablename) AS nota
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.rowsecurity, t.tablename;
