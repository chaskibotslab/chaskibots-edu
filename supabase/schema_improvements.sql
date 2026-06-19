-- ============================================================
-- MEJORAS AL ESQUEMA - Ejecutar en SQL Editor Supabase
-- ============================================================

-- 1. TASKS: Agregar columnas que estaban "hackeadas" en description
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT,
  ADD COLUMN IF NOT EXISTS questions_text TEXT; -- texto pipe-separado para retrocompatibilidad

-- 2. SUBMISSIONS: Mejorar campos
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS drawing_url TEXT, -- URL en Supabase Storage
  ADD COLUMN IF NOT EXISTS attachment_urls TEXT[]; -- URLs en Storage

-- 3. SIMULATORS: programs como array también
ALTER TABLE simulators
  ADD COLUMN IF NOT EXISTS programs TEXT[] DEFAULT ARRAY['robotica','ia','hacking'];

-- 4. USERS: Mejor estructura para sesiones
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

-- 5. KITS: Agregar campos faltantes
ALTER TABLE kits
  ADD COLUMN IF NOT EXISTS price NUMERIC,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. DOCUMENTS - Tabla faltante
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  drive_url TEXT NOT NULL,
  level_id TEXT REFERENCES levels(id) ON DELETE CASCADE,
  module_id TEXT,
  category TEXT DEFAULT 'otro',
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_level ON documents(level_id);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_level_active ON tasks(level_id, is_active);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_blockly_user ON blockly_projects(user_id);

-- 7. Storage buckets (ejecutar DESPUÉS en Storage UI o aquí)
-- Bucket: lesson-images (público)
-- Bucket: submissions (privado)
-- Bucket: task-attachments (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('lesson-images', 'lesson-images', true),
  ('submissions', 'submissions', false),
  ('task-attachments', 'task-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Vista útil: estadísticas de estudiantes
CREATE OR REPLACE VIEW student_stats AS
SELECT 
  s.id,
  s.name,
  s.email,
  s.level_id,
  s.school_id,
  COUNT(DISTINCT sub.id) as total_submissions,
  COUNT(DISTINCT CASE WHEN sub.status = 'graded' THEN sub.id END) as graded_submissions,
  AVG(sub.grade) as average_grade
FROM students s
LEFT JOIN submissions sub ON sub.student_email = s.email OR sub.student_name = s.name
GROUP BY s.id, s.name, s.email, s.level_id, s.school_id;
