-- ============================================================
-- ChaskiBots EDU - Esquema Supabase
-- Migración desde Airtable
-- ============================================================
-- Ejecutar en SQL Editor de Supabase Dashboard
-- ============================================================

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROGRAMS (robotica, ia, hacking)
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level_id TEXT,
  level_name TEXT,
  type TEXT,
  duration TEXT,
  price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. LEVELS (sexto-egb, septimo-egb, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  category TEXT,
  age_range TEXT,
  grade_number INT,
  kit_price NUMERIC,
  has_hacking BOOLEAN DEFAULT false,
  has_advanced_ia BOOLEAN DEFAULT false,
  color TEXT,
  neon_color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. SCHOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  max_students INT,
  max_teachers INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  level_id TEXT REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id TEXT REFERENCES levels(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
  module_name TEXT,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('video', 'activity', 'tutorial', 'project')) DEFAULT 'video',
  duration TEXT DEFAULT '10 min',
  display_order INT DEFAULT 0,
  video_url TEXT,
  pdf_url TEXT,
  content TEXT,
  locked BOOLEAN DEFAULT false,
  images TEXT[], -- Array de URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_level_program ON lessons(level_id, program_id);
CREATE INDEX idx_lessons_order ON lessons(display_order);

-- ============================================================
-- 6. USERS (Usuarios del sistema - profesores, admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_code TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- bcrypt
  name TEXT NOT NULL,
  level_id TEXT REFERENCES levels(id),
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
  course_id TEXT,
  course_name TEXT,
  school_id TEXT REFERENCES schools(id),
  school_name TEXT,
  program_id TEXT REFERENCES programs(id),
  program_name TEXT,
  progress NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_access_code ON users(access_code);

-- ============================================================
-- 7. STUDENTS (Estudiantes)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  level_id TEXT REFERENCES levels(id),
  course_id TEXT,
  school_id TEXT REFERENCES schools(id),
  email TEXT,
  access_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_level ON students(level_id);

-- ============================================================
-- 8. TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id TEXT REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  category TEXT,
  difficulty TEXT,
  points INT DEFAULT 10,
  due_date DATE,
  is_active BOOLEAN DEFAULT true,
  questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. SUBMISSIONS (Entregas de estudiantes)
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  student_name TEXT,
  student_email TEXT,
  level_id TEXT,
  lesson_id UUID,
  course_id TEXT,
  school_id TEXT,
  code TEXT,
  output TEXT,
  drawing TEXT,
  files JSONB,
  status TEXT DEFAULT 'pending',
  grade NUMERIC,
  feedback TEXT,
  graded_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ
);

CREATE INDEX idx_submissions_student ON submissions(student_email);
CREATE INDEX idx_submissions_status ON submissions(status);

-- ============================================================
-- 10. GRADES (Calificaciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT,
  student_id TEXT,
  lesson_id UUID,
  level_id TEXT,
  course_id TEXT,
  school_id TEXT,
  task_id UUID,
  score NUMERIC,
  feedback TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  graded_by TEXT
);

-- ============================================================
-- 11. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id TEXT REFERENCES levels(id),
  project_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  hardware TEXT,
  difficulty TEXT,
  duration TEXT,
  video_url TEXT,
  tutorial_url TEXT,
  resources TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. SIMULATORS
-- ============================================================
CREATE TABLE IF NOT EXISTS simulators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  url TEXT,
  levels TEXT[], -- Array de niveles
  enabled BOOLEAN DEFAULT true
);

-- ============================================================
-- 13. KITS
-- ============================================================
CREATE TABLE IF NOT EXISTS kits (
  id TEXT PRIMARY KEY,
  level_id TEXT REFERENCES levels(id),
  name TEXT NOT NULL,
  description TEXT,
  components TEXT,
  skills TEXT,
  images TEXT,
  video_url TEXT,
  tutorial_url TEXT
);

-- ============================================================
-- 14. EXPERIENCIAS (Recursos externos)
-- ============================================================
CREATE TABLE IF NOT EXISTS experiencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT,
  url TEXT,
  institucion TEXT,
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. AI_ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id TEXT REFERENCES levels(id),
  activity_name TEXT NOT NULL,
  activity_type TEXT,
  description TEXT,
  difficulty TEXT,
  icon TEXT,
  enabled BOOLEAN DEFAULT true
);

-- ============================================================
-- 16. BLOCKLY_PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blockly_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name TEXT,
  project_name TEXT NOT NULL,
  project_data JSONB,
  level_id TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 17. VIRTUAL_FILES (Sistema de archivos del terminal)
-- ============================================================
CREATE TABLE IF NOT EXISTS virtual_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name TEXT,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT, -- 'file' | 'directory'
  content TEXT,
  mime_type TEXT,
  size INT DEFAULT 0,
  permissions TEXT DEFAULT 'rw-r--r--',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_virtual_files_user ON virtual_files(user_id);

-- ============================================================
-- 18. YEAR_PLANS (Planificación anual)
-- ============================================================
CREATE TABLE IF NOT EXISTS year_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id TEXT REFERENCES levels(id),
  month TEXT,
  topic TEXT,
  project TEXT,
  display_order INT DEFAULT 0
);

-- ============================================================
-- 19. TEACHER_COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID,
  teacher_name TEXT,
  course_id TEXT,
  course_name TEXT,
  level_id TEXT,
  school_id TEXT,
  school_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 20. SIMULATOR_CHALLENGES
-- ============================================================
CREATE TABLE IF NOT EXISTS simulator_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  simulator_id TEXT REFERENCES simulators(id),
  level_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  points INT DEFAULT 10,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS para updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_virtual_files_updated_at BEFORE UPDATE ON virtual_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blockly_projects_updated_at BEFORE UPDATE ON blockly_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Configurar después
-- ============================================================
-- ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- (Configurar políticas según roles)

-- ============================================================
-- DATOS INICIALES - Programs
-- ============================================================
INSERT INTO programs (id, name, description, is_active) VALUES
  ('robotica', 'Robótica', 'Programa de robótica con Edison y EdScratch', true),
  ('ia', 'Inteligencia Artificial', 'Machine Learning y aplicaciones de IA', true),
  ('hacking', 'Ciberseguridad', 'Ethical hacking y seguridad informática', true)
ON CONFLICT (id) DO NOTHING;
