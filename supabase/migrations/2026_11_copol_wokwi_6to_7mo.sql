-- COPOL: 6to y 7mo trabajan con ESP32, así que necesitan el simulador Wokwi ESP32
-- (antes solo aparecía desde 8vo). No quita nada a los demás niveles.
UPDATE simulators
SET levels = (
  SELECT array_agg(DISTINCT n)
  FROM unnest(levels || ARRAY['sexto-egb', 'septimo-egb']) AS n
)
WHERE name ILIKE '%wokwi%';

-- Comprobación: debe listar sexto-egb y septimo-egb.
SELECT name, enabled, levels FROM simulators WHERE name ILIKE '%wokwi%';
