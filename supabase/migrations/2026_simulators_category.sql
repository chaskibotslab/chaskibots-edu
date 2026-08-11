-- ============================================================
-- SIMULATORS: agregar columna `category` (usada por las pestañas
-- de SimulatorTabsDynamic, que hasta ahora no existía en la tabla
-- y hacía que TODOS los simuladores cayeran en "bloques").
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

ALTER TABLE simulators
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'bloques';

-- Backfill de los simuladores existentes con su categoría correcta
UPDATE simulators SET category = 'bloques' WHERE id IN ('scratch', 'makecode');
UPDATE simulators SET category = 'electronica' WHERE id IN ('wokwi', 'tinkercad');
UPDATE simulators SET category = 'python' WHERE id IN ('colab', 'python', 'python-ide');
UPDATE simulators SET category = 'ia' WHERE id IN ('teachable');
UPDATE simulators SET category = 'hacking' WHERE id IN ('hacking-terminal', 'linux-terminal');
UPDATE simulators SET category = 'roblox' WHERE id IN ('roblox-editor');
