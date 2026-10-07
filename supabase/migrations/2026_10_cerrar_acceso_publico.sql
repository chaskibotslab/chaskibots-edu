-- ============================================================
-- CERRAR EL ACCESO PÚBLICO DIRECTO A LA BASE DE DATOS
-- ============================================================
-- Problema: con la clave pública (anon) de Supabase, que viaja dentro del
-- sitio web, se podía leer la tabla `users` completa (incluidos password y
-- access_code), además de students, submissions y tasks.
--
-- La app NO necesita ese acceso: todas las rutas /api usan la clave de
-- servicio (service_role), que no pasa por RLS. Así que se cierra todo:
--   1. RLS activado en todas las tablas del esquema public.
--   2. Se eliminan todas las políticas existentes (varias daban lectura y
--      escritura a cualquiera con USING (true)).
--   3. Se quitan los permisos de anon y authenticated.
--
-- Es idempotente: se puede ejecutar más de una vez sin problema.
-- Cómo aplicarlo: Supabase > SQL Editor > pegar todo > Run.
-- ============================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;

  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Tablas nuevas creadas a futuro tampoco quedan abiertas por defecto.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- Verificación: todas las filas deben decir rls_activo = true y politicas = 0.
SELECT t.tablename,
       t.rowsecurity AS rls_activo,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.tablename) AS politicas
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;
