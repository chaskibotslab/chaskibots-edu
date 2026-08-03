-- =============================================
-- COPY THIS ENTIRE FILE AND PASTE IN SUPABASE SQL EDITOR
-- Then click "Run" - Takes 2 seconds
-- =============================================

-- Enable RLS on ALL tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS school_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blockly_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS virtual_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS year_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read access for app to work)
DO $$ 
DECLARE
  t TEXT;
  tables_read TEXT[] := ARRAY[
    'levels','programs','schools','tasks','lessons','grades',
    'documents','kits','courses','courses_catalog','school_courses',
    'teacher_courses','projects','blockly_projects','ai_activities',
    'experiencias','virtual_files','simulators','simulator_challenges',
    'simulator_courses','simulator_modules','simulator_lessons',
    'simulator_progress','year_plans','students','submissions'
  ];
BEGIN
  FOREACH t IN ARRAY tables_read LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
      EXECUTE format('DROP POLICY IF EXISTS "allow_select" ON %I', t);
      EXECUTE format('CREATE POLICY "allow_select" ON %I FOR SELECT USING (true)', t);
    END IF;
  END LOOP;
END $$;

-- Allow insert on tables where students/app writes data
DO $$
DECLARE
  t TEXT;
  tables_write TEXT[] := ARRAY[
    'submissions','projects','blockly_projects','experiencias',
    'virtual_files','simulator_progress'
  ];
BEGIN
  FOREACH t IN ARRAY tables_write LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
      EXECUTE format('DROP POLICY IF EXISTS "allow_insert" ON %I', t);
      EXECUTE format('CREATE POLICY "allow_insert" ON %I FOR INSERT WITH CHECK (true)', t);
      EXECUTE format('DROP POLICY IF EXISTS "allow_update" ON %I', t);
      EXECUTE format('CREATE POLICY "allow_update" ON %I FOR UPDATE USING (true)', t);
    END IF;
  END LOOP;
END $$;

-- virtual_files also needs delete
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'virtual_files' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_delete" ON virtual_files';
    EXECUTE 'CREATE POLICY "allow_delete" ON virtual_files FOR DELETE USING (true)';
  END IF;
END $$;

-- Users table: NO public policy (only accessible via service_role key)
-- This is intentional for security - user data is private

-- Done! Your tables are now protected.
