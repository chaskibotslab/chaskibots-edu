-- Grupos de la Academia Lizardo Villamarín para Inicial 1 → 7mo EGB (sus kits
-- existían sin grupo, así que no se podía asignar a nadie) y reubicación de las
-- personas de la Academia cuyo grupo no existe o es de otro colegio.
-- Se puede ejecutar más de una vez.

-- 1. Los 9 grupos que faltaban
INSERT INTO courses_catalog (id, name, level_id, school_id, school_name, max_students, current_students, is_active, program_ids)
SELECT g.id, g.name, g.level_id, s.id, s.name, 30, 0, true, ARRAY['robotica']
FROM (VALUES
  ('grupo-lv-inicial-1',   'Inicial 1 Academia', 'inicial-1'),
  ('grupo-lv-inicial-2',   'Inicial 2 Academia', 'inicial-2'),
  ('grupo-lv-primero-egb', '1ro EGB Academia',   'primero-egb'),
  ('grupo-lv-segundo-egb', '2do EGB Academia',   'segundo-egb'),
  ('grupo-lv-tercero-egb', '3ro EGB Academia',   'tercero-egb'),
  ('grupo-lv-cuarto-egb',  '4to EGB Academia',   'cuarto-egb'),
  ('grupo-lv-quinto-egb',  '5to EGB Academia',   'quinto-egb'),
  ('grupo-lv-sexto-egb',   '6to EGB Academia',   'sexto-egb'),
  ('grupo-lv-septimo-egb', '7mo EGB Academia',   'septimo-egb')
) AS g(id, name, level_id)
CROSS JOIN schools s
WHERE s.id = 'school-amclav-mkr7awl9'
ON CONFLICT (id) DO NOTHING;

-- 2. Asignaciones de docentes de la Academia que apuntan a un grupo de otro
--    colegio → grupo de la Academia del mismo nivel (si no lo tiene ya)
UPDATE teacher_courses t
SET course_id = c.id, course_name = c.name, school_id = c.school_id, school_name = c.school_name
FROM users u, courses_catalog c
WHERE u.id = t.teacher_id
  AND u.school_id = 'school-amclav-mkr7awl9'
  AND c.school_id = 'school-amclav-mkr7awl9'
  AND c.level_id = t.level_id
  AND NOT EXISTS (SELECT 1 FROM courses_catalog o WHERE o.id = t.course_id AND o.school_id = 'school-amclav-mkr7awl9')
  AND NOT EXISTS (SELECT 1 FROM teacher_courses x WHERE x.teacher_id = t.teacher_id AND x.course_id = c.id);

-- 3. Estudiantes y docentes de la Academia cuyo grupo no existe o es de otro
--    colegio → grupo de la Academia de su nivel
UPDATE users u
SET course_id = c.id, course_name = c.name, school_name = c.school_name
FROM courses_catalog c
WHERE u.school_id = 'school-amclav-mkr7awl9'
  AND u.role IN ('student', 'teacher')
  AND c.school_id = 'school-amclav-mkr7awl9'
  AND c.level_id = u.level_id
  AND NOT EXISTS (SELECT 1 FROM courses_catalog o WHERE o.id = u.course_id AND o.school_id = 'school-amclav-mkr7awl9');

-- Comprobación: deben salir 15 grupos de la Academia
SELECT id, name, level_id FROM courses_catalog
WHERE school_id = 'school-amclav-mkr7awl9'
ORDER BY name;
