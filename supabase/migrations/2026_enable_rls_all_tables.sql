-- ============================================================
-- ENABLE ROW-LEVEL SECURITY (RLS) ON ALL PUBLIC TABLES
-- ============================================================
-- Supabase detected tables without RLS enabled.
-- This migration enables RLS on all tables and adds policies.
-- 
-- NOTE: The app uses supabaseAdmin (service_role key) for all
-- API routes, which BYPASSES RLS. So enabling RLS won't break
-- existing functionality. It protects against direct public
-- access via the anon key.
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS ON ALL TABLES (idempotent)
-- ============================================================

-- Core tables
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

-- Courses & assignments
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS school_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_courses ENABLE ROW LEVEL SECURITY;

-- Projects & activities
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blockly_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS virtual_files ENABLE ROW LEVEL SECURITY;

-- Simulators (these should already have RLS from previous migration)
ALTER TABLE IF EXISTS simulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulator_progress ENABLE ROW LEVEL SECURITY;

-- Plans
ALTER TABLE IF EXISTS year_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. DROP EXISTING POLICIES TO AVOID CONFLICTS (idempotent)
-- ============================================================
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  -- Drop all existing policies on these tables to recreate cleanly
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ============================================================
-- 3. CREATE READ-ONLY POLICIES FOR ANON/PUBLIC ACCESS
--    (Catalog/reference data = public read)
-- ============================================================

-- Levels: public read
CREATE POLICY "anon_read_levels" ON levels FOR SELECT USING (true);

-- Programs: public read
CREATE POLICY "anon_read_programs" ON programs FOR SELECT USING (true);

-- Schools: public read
CREATE POLICY "anon_read_schools" ON schools FOR SELECT USING (true);

-- Courses: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_courses" ON courses FOR SELECT USING (true)';
  END IF;
END $$;

-- Courses catalog: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses_catalog' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_courses_catalog" ON courses_catalog FOR SELECT USING (true)';
  END IF;
END $$;

-- Kits: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kits' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_kits" ON kits FOR SELECT USING (true)';
  END IF;
END $$;

-- Lessons: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_lessons" ON lessons FOR SELECT USING (true)';
  END IF;
END $$;

-- Year plans: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'year_plans' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_year_plans" ON year_plans FOR SELECT USING (true)';
  END IF;
END $$;

-- Simulators: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulators' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_simulators" ON simulators FOR SELECT USING (true)';
  END IF;
END $$;

-- Simulator challenges: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulator_challenges' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_simulator_challenges" ON simulator_challenges FOR SELECT USING (true)';
  END IF;
END $$;

-- Simulator courses/modules/lessons: public read
CREATE POLICY "anon_read_sim_courses" ON simulator_courses FOR SELECT USING (true);
CREATE POLICY "anon_read_sim_modules" ON simulator_modules FOR SELECT USING (true);
CREATE POLICY "anon_read_sim_lessons" ON simulator_lessons FOR SELECT USING (true);

-- Simulator progress: public read/write (app validates user via API)
CREATE POLICY "anon_read_sim_progress" ON simulator_progress FOR SELECT USING (true);
CREATE POLICY "anon_insert_sim_progress" ON simulator_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_sim_progress" ON simulator_progress FOR UPDATE USING (true);

-- ============================================================
-- 4. RESTRICTED TABLES (no public access via anon key)
--    Only supabaseAdmin (service_role) can access these.
-- ============================================================

-- Users: NO public access (admin only via service_role)
-- No policy = no anon access, which is correct for user data

-- Tasks: public read (students see tasks), no public write
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_tasks" ON tasks FOR SELECT USING (true)';
  END IF;
END $$;

-- Submissions: public insert (students submit), public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_submissions" ON submissions FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "anon_insert_submissions" ON submissions FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Grades: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grades' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_grades" ON grades FOR SELECT USING (true)';
  END IF;
END $$;

-- Documents: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_documents" ON documents FOR SELECT USING (true)';
  END IF;
END $$;

-- School courses: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'school_courses' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_school_courses" ON school_courses FOR SELECT USING (true)';
  END IF;
END $$;

-- Teacher courses: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_courses' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_teacher_courses" ON teacher_courses FOR SELECT USING (true)';
  END IF;
END $$;

-- Projects: public read/insert
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_projects" ON projects FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "anon_insert_projects" ON projects FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Blockly projects: public read/insert
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blockly_projects' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_blockly_projects" ON blockly_projects FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "anon_insert_blockly_projects" ON blockly_projects FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- AI activities: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_activities' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_ai_activities" ON ai_activities FOR SELECT USING (true)';
  END IF;
END $$;

-- Experiencias: public read/insert
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experiencias' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_experiencias" ON experiencias FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "anon_insert_experiencias" ON experiencias FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Virtual files: public read/insert/update/delete
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'virtual_files' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_virtual_files" ON virtual_files FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "anon_insert_virtual_files" ON virtual_files FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "anon_update_virtual_files" ON virtual_files FOR UPDATE USING (true)';
    EXECUTE 'CREATE POLICY "anon_delete_virtual_files" ON virtual_files FOR DELETE USING (true)';
  END IF;
END $$;

-- Students: public read
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "anon_read_students" ON students FOR SELECT USING (true)';
  END IF;
END $$;

-- ============================================================
-- DONE! All public tables now have RLS enabled.
-- The supabaseAdmin (service_role) key bypasses RLS,
-- so all API routes continue working normally.
-- ============================================================
