-- Estudiantes de Chaski Bots LAb con nivel "chaski1" que estaban dentro de un
-- grupo del Colegio Demo (Ciberseguridad Bachillerato, 1° BGU) o sin grupo.
-- Se crea el grupo "chaski1" de Chaski Bots LAb con los mismos programas que
-- tenían y se los pasa ahí: colegio, nivel y grupo quedan iguales.
-- Se puede ejecutar más de una vez.

-- 1. Grupo chaski1 de Chaski Bots LAb
INSERT INTO courses_catalog (id, name, level_id, school_id, school_name, max_students, current_students, is_active, program_ids)
SELECT 'grupo-chaski-chaski1', 'chaski1', 'chaski007', s.id, s.name, 30, 0, true, ARRAY['robotica', 'ia', 'hacking']
FROM schools s
WHERE s.id = 'Chaski-07'
ON CONFLICT (id) DO NOTHING;

-- 2. Estudiantes de Chaski Bots LAb con nivel chaski1 cuyo grupo no es de su colegio (o no existe)
UPDATE users u
SET course_id = c.id, course_name = c.name, school_name = c.school_name
FROM courses_catalog c
WHERE c.id = 'grupo-chaski-chaski1'
  AND u.role = 'student'
  AND u.school_id = 'Chaski-07'
  AND u.level_id = 'chaski007'
  AND NOT EXISTS (SELECT 1 FROM courses_catalog o WHERE o.id = u.course_id AND o.school_id = 'Chaski-07');

-- Comprobación: estudiantes que quedaron en el grupo chaski1
SELECT count(*) AS estudiantes_en_chaski1 FROM users WHERE course_id = 'grupo-chaski-chaski1';
