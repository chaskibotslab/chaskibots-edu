-- =========================================================
-- SIMULATOR ACADEMY: Professional Python & Hacking Education
-- =========================================================

-- Courses (Python, Hacking Ético)
CREATE TABLE IF NOT EXISTS simulator_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color for UI
  difficulty TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  total_modules INT DEFAULT 0,
  total_lessons INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules within a course
CREATE TABLE IF NOT EXISTS simulator_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES simulator_courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

-- Lessons within a module
CREATE TABLE IF NOT EXISTS simulator_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES simulator_modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  theory TEXT, -- markdown theory content
  examples JSONB DEFAULT '[]', -- [{title, code, explanation}]
  challenges JSONB DEFAULT '[]', -- [{title, description, starter_code, expected_output, hints}]
  sort_order INT DEFAULT 0,
  difficulty TEXT DEFAULT 'easy', -- easy, medium, hard
  estimated_minutes INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS simulator_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id UUID REFERENCES simulator_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INT DEFAULT 0, -- 0-100
  code_submitted TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_simulator_modules_course ON simulator_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_simulator_lessons_module ON simulator_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_simulator_progress_user ON simulator_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_simulator_progress_lesson ON simulator_progress(lesson_id);

-- Enable RLS
ALTER TABLE simulator_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_progress ENABLE ROW LEVEL SECURITY;

-- Public read for courses/modules/lessons
CREATE POLICY "Public read courses" ON simulator_courses FOR SELECT USING (true);
CREATE POLICY "Public read modules" ON simulator_modules FOR SELECT USING (true);
CREATE POLICY "Public read lessons" ON simulator_lessons FOR SELECT USING (true);

-- Users can read/write their own progress
CREATE POLICY "Users read own progress" ON simulator_progress FOR SELECT USING (true);
CREATE POLICY "Users insert own progress" ON simulator_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own progress" ON simulator_progress FOR UPDATE USING (true);
