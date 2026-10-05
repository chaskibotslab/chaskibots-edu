-- ============================================================
-- CURSOS VISIBLES: Academia Militar "Lizardo Alfonzo Villamarín"
-- ============================================================
-- Hasta ahora el contenido de los kits (kits, kit_materiales,
-- kit_proyectos, etc.) nunca estuvo conectado al sistema de `courses`
-- que usa el resto de la plataforma (/admin/colegios, /admin/cursos).
-- Por eso no aparecian como "curso" en ningun lado. Esta migracion:
--
--   1. Corrige nombre/ciudad de la institucion.
--   2. Crea 6 filas en `courses` con el nombre EXACTO pedido
--      ("8vo EGB Academia", etc.) -- esto es lo que hace que se vean
--      en /admin/cursos.
--   3. Las asigna al colegio via `school_courses` -- esto es lo que
--      hace que se vean en /admin/colegios -> Academia Militar... ->
--      cursos asignados.
--   4. Conecta cada curso con su kit tecnico (kits.curso_id) para que
--      desde ahi se pueda llegar a la ficha completa (materiales,
--      proyectos, esquemas, codigo).
--
-- Idempotente (ON CONFLICT). No borra nada.
-- ============================================================

-- 1. Institucion: nombre y ciudad correctos
UPDATE schools
SET name = 'Academia Militar "Lizardo Alfonzo Villamarín"', city = 'Machachi'
WHERE id = 'lizardo-villamarin';

-- 2. Columnas nuevas en kits
ALTER TABLE kits
  ADD COLUMN IF NOT EXISTS curso_id TEXT REFERENCES courses(id),
  ADD COLUMN IF NOT EXISTS kits_entregados INT,
  ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_kits_curso ON kits(curso_id);

-- 3. Cursos (nombre EXACTO pedido)
INSERT INTO courses (id, name, description, level_id, program_id, modality, icon, color, is_active) VALUES
  ('curso-lv-octavo-egb', '8vo EGB Academia', 'Electrónica y Programación con Arduino UNO — Academia Militar Lizardo Alfonzo Villamarín', 'octavo-egb', 'robotica', 'presencial', '🚦', '#039be5', true),
  ('curso-lv-noveno-egb', '9no EGB Academia', 'Basurero Inteligente con Arduino Nano — Academia Militar Lizardo Alfonzo Villamarín', 'noveno-egb', 'robotica', 'presencial', '🗑️', '#1e88e5', true),
  ('curso-lv-decimo-egb', '10mo EGB Academia', 'Sistema de Riego Inteligente con Arduino Nano — Academia Militar Lizardo Alfonzo Villamarín', 'decimo-egb', 'robotica', 'presencial', '💧', '#3949ab', true),
  ('curso-lv-primero-bach', '1ro BGU Academia', 'Estación Meteorológica IoT con ESP32-C3 Super Mini — Academia Militar Lizardo Alfonzo Villamarín', 'primero-bach', 'robotica', 'presencial', '🌦️', '#5e35b1', true),
  ('curso-lv-segundo-bach', '2do BGU Academia', 'Domótica Inteligente con ESP32 — Academia Militar Lizardo Alfonzo Villamarín', 'segundo-bach', 'robotica', 'presencial', '🏠', '#8e24aa', true),
  ('curso-lv-tercero-bach', '3ro BGU Academia', 'IoT y Automatización Avanzada con ESP32 — Academia Militar Lizardo Alfonzo Villamarín', 'tercero-bach', 'robotica', 'presencial', '📡', '#d81b60', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, level_id = EXCLUDED.level_id,
  program_id = EXCLUDED.program_id, modality = EXCLUDED.modality, icon = EXCLUDED.icon,
  color = EXCLUDED.color, is_active = EXCLUDED.is_active;

-- 4. Asignacion al colegio (visible en /admin/colegios)
-- classroom se deja en '' (vacio) en vez de NULL a proposito: la UNIQUE
-- constraint de school_courses incluye classroom, y en Postgres NULL
-- nunca es igual a NULL dentro de una constraint -- con NULL, ON CONFLICT
-- no detectaria el duplicado y correr este archivo dos veces insertaria
-- la fila otra vez.
INSERT INTO school_courses (school_id, course_id, classroom, academic_year, is_active) VALUES
  ('lizardo-villamarin', 'curso-lv-octavo-egb', '', '2026', true),
  ('lizardo-villamarin', 'curso-lv-noveno-egb', '', '2026', true),
  ('lizardo-villamarin', 'curso-lv-decimo-egb', '', '2026', true),
  ('lizardo-villamarin', 'curso-lv-primero-bach', '', '2026', true),
  ('lizardo-villamarin', 'curso-lv-segundo-bach', '', '2026', true),
  ('lizardo-villamarin', 'curso-lv-tercero-bach', '', '2026', true)
ON CONFLICT (school_id, course_id, classroom, academic_year) DO UPDATE SET is_active = EXCLUDED.is_active;

-- 5. Enlazar kit <-> curso + cantidad de kits entregados + visibilidad
UPDATE kits SET curso_id = 'curso-lv-octavo-egb',   kits_entregados = 6,  visible = true WHERE id = 'kit-lv-octavo-egb';
UPDATE kits SET curso_id = 'curso-lv-noveno-egb',   kits_entregados = 5,  visible = true WHERE id = 'kit-lv-noveno-egb';
UPDATE kits SET curso_id = 'curso-lv-decimo-egb',   kits_entregados = 6,  visible = true WHERE id = 'kit-lv-decimo-egb';
UPDATE kits SET curso_id = 'curso-lv-primero-bach', kits_entregados = 20, visible = true WHERE id = 'kit-lv-primero-bach';
UPDATE kits SET curso_id = 'curso-lv-segundo-bach', kits_entregados = 6,  visible = true WHERE id = 'kit-lv-segundo-bach';
UPDATE kits SET curso_id = 'curso-lv-tercero-bach', kits_entregados = 5,  visible = true WHERE id = 'kit-lv-tercero-bach';
