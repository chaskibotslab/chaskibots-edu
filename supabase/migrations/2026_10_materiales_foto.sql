-- Foto de cada material del catálogo (se muestra en "Materiales del kit").
-- La llena scripts/fotos-kits.js con las fotos de la carpeta materiales/.
-- Se puede ejecutar más de una vez.
ALTER TABLE materiales ADD COLUMN IF NOT EXISTS foto_url text;

-- Comprobación: debe salir la columna foto_url
SELECT column_name FROM information_schema.columns
WHERE table_name = 'materiales' AND column_name = 'foto_url';
