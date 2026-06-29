-- ============================================================
-- COURSES (Catálogo de cursos reutilizables)
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  level_id TEXT REFERENCES levels(id) ON DELETE SET NULL,
  program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
  duration_hours INT,
  modality TEXT, -- presencial | virtual | hibrido
  icon TEXT,
  color TEXT,
  cover_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level_id);
CREATE INDEX IF NOT EXISTS idx_courses_program ON courses(program_id);

-- ============================================================
-- SCHOOL_COURSES (Asignación M:N entre colegios y cursos)
-- ============================================================
CREATE TABLE IF NOT EXISTS school_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  -- Customización por escuela
  custom_name TEXT,        -- Nombre alternativo en esa escuela ej "Robótica 6to A"
  classroom TEXT,          -- Paralelo / aula
  schedule TEXT,           -- Horario
  academic_year TEXT,      -- 2025-2026
  start_date DATE,
  end_date DATE,
  max_students INT,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  teacher_name TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, course_id, classroom, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_school_courses_school ON school_courses(school_id);
CREATE INDEX IF NOT EXISTS idx_school_courses_course ON school_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_school_courses_teacher ON school_courses(teacher_id);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
    CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_school_courses_updated_at') THEN
    CREATE TRIGGER update_school_courses_updated_at BEFORE UPDATE ON school_courses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================
-- Datos iniciales: cursos del catálogo basados en niveles
-- ============================================================
INSERT INTO courses (id, name, description, level_id, program_id, modality, icon, color, is_active)
VALUES
  ('curso-rob-inicial-1', 'Robótica Inicial 1', 'Mis primeras luces - 3 a 4 años', 'inicial-1', 'robotica', 'presencial', '🌟', '#7C3AED', true),
  ('curso-rob-inicial-2', 'Robótica Inicial 2', 'Construyendo mi primer robot - 4 a 5 años', 'inicial-2', 'robotica', 'presencial', '✨', '#7C3AED', true),
  ('curso-rob-prep', 'Robótica Preparatoria', 'Kit 3 robots - 5 a 6 años', 'primero-egb', 'robotica', 'presencial', '🤖', '#06B6D4', true),
  ('curso-rob-elem', 'Robótica Elemental', 'Kit 3 robots avanzados - 7 a 9 años', 'segundo-egb', 'robotica', 'presencial', '🎯', '#06B6D4', true),
  ('curso-rob-media', 'Robótica Media', 'Robots de competencia - 10 a 12 años', 'sexto-egb', 'robotica', 'presencial', '⚡', '#10B981', true),
  ('curso-rob-superior', 'Robótica Superior', 'IoT y ESP32 - 13 a 15 años', 'octavo-egb', 'robotica', 'hibrido', '🔥', '#F59E0B', true),
  ('curso-ia-basico', 'IA Básica', 'Introducción a Machine Learning', 'septimo-egb', 'ia', 'virtual', '🧠', '#EC4899', true),
  ('curso-ia-avanzado', 'IA Avanzada', 'Redes neuronales y visión por computadora', 'primero-bach', 'ia', 'hibrido', '🚀', '#EC4899', true),
  ('curso-hack-basico', 'Hacking Ético Básico', 'Fundamentos de ciberseguridad', 'primero-bach', 'hacking', 'virtual', '🛡️', '#10B981', true)
ON CONFLICT (id) DO NOTHING;
