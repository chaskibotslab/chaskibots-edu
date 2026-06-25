-- ============================================================
-- FIX USERS TABLE + COURSES_CATALOG
-- Ejecutar en SQL Editor Supabase
-- ============================================================

-- 1. Permitir email NULL (muchos usuarios solo tienen accessCode)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 2. Renombrar password_hash a password (almacena plain text por ahora, hashearemos después)
ALTER TABLE users RENAME COLUMN password_hash TO password;

-- 3. Crear courses_catalog
CREATE TABLE IF NOT EXISTS courses_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level_id TEXT REFERENCES levels(id),
  teacher_id TEXT,
  teacher_name TEXT,
  school_id TEXT REFERENCES schools(id),
  school_name TEXT,
  max_students INTEGER DEFAULT 30,
  current_students INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses_catalog(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_school ON courses_catalog(school_id);
