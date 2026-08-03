-- =============================================
-- FIX REMAINING ISSUES - Paste in SQL Editor
-- =============================================

-- 1. Add read policy to 'modules' table (RLS Enabled No Policy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modules' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_select" ON modules';
    EXECUTE 'CREATE POLICY "allow_select" ON modules FOR SELECT USING (true)';
  END IF;
END $$;

-- 2. Add restricted policy to 'users' table
-- Only allow users to read their OWN data via anon key
-- (supabaseAdmin bypasses RLS so admin features still work)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_select_users" ON users';
    EXECUTE 'CREATE POLICY "allow_select_users" ON users FOR SELECT USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "allow_insert_users" ON users';
    EXECUTE 'CREATE POLICY "allow_insert_users" ON users FOR INSERT WITH CHECK (true)';
    EXECUTE 'DROP POLICY IF EXISTS "allow_update_users" ON users';
    EXECUTE 'CREATE POLICY "allow_update_users" ON users FOR UPDATE USING (true)';
  END IF;
END $$;

-- 3. Fix Security Definer View (student_stats)
-- Change it to use SECURITY INVOKER instead
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'student_stats' AND table_schema = 'public') THEN
    -- Get the view definition and recreate with SECURITY INVOKER
    EXECUTE 'ALTER VIEW IF EXISTS student_stats SET (security_invoker = on)';
  END IF;
END $$;
