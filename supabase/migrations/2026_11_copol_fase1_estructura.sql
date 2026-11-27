-- ============================================================
-- COPOL — Fase 1: institución, grupos, cursos y kits con precio
-- ============================================================
-- Crea la institución COPOL con sus 9 grados (Inicial 1 → 7mo EGB):
--   1. La institución.
--   2. Un curso y un grupo por grado (el grupo es lo que se asigna a
--      docentes y estudiantes; cada docente ve solo sus grupos).
--   3. Un kit por grado con su precio.
--   4. 1ro, 2do y 3ro EGB: copia de los proyectos y materiales de los
--      kits de la Academia Lizardo Villamarín (mismo contenido).
--
-- Los kits de Inicial 1, Inicial 2, 4to, 5to, 6to y 7mo quedan creados
-- pero OCULTOS (visible = false) hasta que se carguen sus lecciones.
--   5. Asigna a cada docente sus grados (paso 6), si su cuenta ya existe.
--
-- No crea cuentas ni claves: las 3 cuentas de docente se crean en el
-- panel admin (colegio COPOL) con estos nombres exactos:
--     Emilio Pérez   → Inicial 1 e Inicial 2
--     Emilio Copol   → 1ro, 2do y 3ro EGB
--     David Camacho  → 4to, 5to, 6to y 7mo EGB
-- Después se vuelve a ejecutar este archivo y el paso 6 les asigna sus
-- grados. No toca datos de otros colegios. Se puede ejecutar más de una vez.
-- ============================================================

-- 1. Institución
INSERT INTO schools (id, name, code, city, country, max_students, max_teachers)
VALUES ('school-copol', 'Institución Educativa COPOL', 'COPOL', NULL, 'Ecuador', 400, 5)
ON CONFLICT (id) DO NOTHING;

-- 2. Cursos (lo que se ve en /admin/cursos y /admin/colegios)
INSERT INTO courses (id, name, description, level_id, program_id, modality, icon, color, is_active) VALUES
  ('curso-copol-inicial-1',   'Inicial 1 COPOL', 'Generador eólico de madera y circuitos con cinta de cobre — COPOL',        'inicial-1',   'robotica', 'presencial', '🌬️', '#43a047', true),
  ('curso-copol-inicial-2',   'Inicial 2 COPOL', 'Carro solar y circuitos con cinta de cobre — COPOL',                        'inicial-2',   'robotica', 'presencial', '☀️', '#7cb342', true),
  ('curso-copol-primero-egb', '1ro EGB COPOL',   'El semáforo de papel — COPOL',                                              'primero-egb', 'robotica', 'presencial', '🚦', '#c0ca33', true),
  ('curso-copol-segundo-egb', '2do EGB COPOL',   'Interruptor táctil mágico — COPOL',                                         'segundo-egb', 'robotica', 'presencial', '✋', '#fdd835', true),
  ('curso-copol-tercero-egb', '3ro EGB COPOL',   'Casa iluminada — COPOL',                                                    'tercero-egb', 'robotica', 'presencial', '🏠', '#ffb300', true),
  ('curso-copol-cuarto-egb',  '4to EGB COPOL',   'Tragamonedas de madera — COPOL',                                            'cuarto-egb',  'robotica', 'presencial', '🎰', '#fb8c00', true),
  ('curso-copol-quinto-egb',  '5to EGB COPOL',   'Carro radiocontrolado de madera — COPOL',                                   'quinto-egb',  'robotica', 'presencial', '🚗', '#f4511e', true),
  ('curso-copol-sexto-egb',   '6to EGB COPOL',   'Electrónica y programación con ESP32 (30 pines) — COPOL',                   'sexto-egb',   'robotica', 'presencial', '💡', '#039be5', true),
  ('curso-copol-septimo-egb', '7mo EGB COPOL',   'Basurero inteligente con ESP32 (30 pines) — COPOL',                         'septimo-egb', 'robotica', 'presencial', '🗑️', '#1e88e5', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, level_id = EXCLUDED.level_id,
  program_id = EXCLUDED.program_id, modality = EXCLUDED.modality, icon = EXCLUDED.icon,
  color = EXCLUDED.color, is_active = EXCLUDED.is_active;

-- classroom va en '' (no NULL) para que ON CONFLICT detecte la fila repetida.
INSERT INTO school_courses (school_id, course_id, classroom, academic_year, is_active)
SELECT 'school-copol', c.id, '', '2026', true
FROM courses c
WHERE c.id LIKE 'curso-copol-%'
ON CONFLICT (school_id, course_id, classroom, academic_year) DO UPDATE SET is_active = EXCLUDED.is_active;

-- 3. Grupos (lo que se asigna a cada docente y a cada estudiante)
INSERT INTO courses_catalog (id, name, level_id, school_id, school_name, max_students, current_students, is_active, program_ids)
SELECT g.id, g.name, g.level_id, s.id, s.name, 30, 0, true, ARRAY['robotica']
FROM (VALUES
  ('grupo-copol-inicial-1',   'Inicial 1 COPOL', 'inicial-1'),
  ('grupo-copol-inicial-2',   'Inicial 2 COPOL', 'inicial-2'),
  ('grupo-copol-primero-egb', '1ro EGB COPOL',   'primero-egb'),
  ('grupo-copol-segundo-egb', '2do EGB COPOL',   'segundo-egb'),
  ('grupo-copol-tercero-egb', '3ro EGB COPOL',   'tercero-egb'),
  ('grupo-copol-cuarto-egb',  '4to EGB COPOL',   'cuarto-egb'),
  ('grupo-copol-quinto-egb',  '5to EGB COPOL',   'quinto-egb'),
  ('grupo-copol-sexto-egb',   '6to EGB COPOL',   'sexto-egb'),
  ('grupo-copol-septimo-egb', '7mo EGB COPOL',   'septimo-egb')
) AS g(id, name, level_id)
CROSS JOIN schools s
WHERE s.id = 'school-copol'
ON CONFLICT (id) DO NOTHING;

-- 4. Kits nuevos de COPOL (sin lecciones todavía: ocultos)
INSERT INTO kits (id, level_id, name, description, price, school_id, placa_id, proyecto_principal, alimentacion, advertencia_seguridad, notas, activo, curso_id, visible) VALUES
  ('kit-copol-inicial-1', 'inicial-1', 'Generador eólico y caminos de cobre',
   'Kit Inicial 1 — COPOL. Kit de madera con un generador eólico y circuitos de cinta de cobre.',
   32, 'school-copol', NULL, 'Generador eólico', 'Pila de botón CR2032 (3 V) y cinta de cobre',
   'Las pilas de botón las cuenta, entrega y recoge el docente en cada clase.',
   'Sin programación y sin lectura: todo con dibujos. Incluye simulación muy básica.', true, 'curso-copol-inicial-1', false),
  ('kit-copol-inicial-2', 'inicial-2', 'Carro solar y caminos de cobre',
   'Kit Inicial 2 — COPOL. Carro solar y circuitos de cinta de cobre.',
   32, 'school-copol', NULL, 'Carro solar', 'Panel solar del carro; pila de botón CR2032 (3 V) y cinta de cobre',
   'Las pilas de botón las cuenta, entrega y recoge el docente en cada clase.',
   'Sin programación y sin lectura: todo con dibujos. Incluye simulación muy básica.', true, 'curso-copol-inicial-2', false),
  ('kit-copol-cuarto-egb', 'cuarto-egb', 'Tragamonedas',
   'Kit 4to EGB — COPOL. Kit de madera: tragamonedas.',
   45, 'school-copol', NULL, 'Tragamonedas', NULL, NULL,
   'Kit de madera para armar.', true, 'curso-copol-cuarto-egb', false),
  ('kit-copol-quinto-egb', 'quinto-egb', 'Carro radiocontrolado',
   'Kit 5to EGB — COPOL. Kit de madera: carro radiocontrolado.',
   45, 'school-copol', NULL, 'Carro radiocontrolado', NULL, NULL,
   'Kit de madera para armar.', true, 'curso-copol-quinto-egb', false),
  ('kit-copol-sexto-egb', 'sexto-egb', 'Electrónica y programación con ESP32',
   'Kit 6to EGB — COPOL. El kit de 8vo de la Academia con ESP32 de 30 pines en lugar de Arduino UNO.',
   45, 'school-copol', NULL, 'Semáforo inteligente con paso peatonal', 'USB de la computadora (5 V)', NULL,
   'Mismo contenido que 8vo de la Academia, adaptado a ESP32 de 30 pines.', true, 'curso-copol-sexto-egb', false),
  ('kit-copol-septimo-egb', 'septimo-egb', 'Basurero inteligente con ESP32',
   'Kit 7mo EGB — COPOL. El kit de 9no de la Academia con ESP32 de 30 pines en lugar de Arduino Nano.',
   45, 'school-copol', NULL, 'Basurero inteligente con apertura automática', 'USB de la computadora (5 V)', NULL,
   'Mismo contenido que 9no de la Academia, adaptado a ESP32 de 30 pines.', true, 'curso-copol-septimo-egb', false)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name, description = EXCLUDED.description, curso_id = EXCLUDED.curso_id;

-- 5. Kits de 1ro, 2do y 3ro EGB: los mismos de la Academia, con el precio de COPOL
INSERT INTO kits (id, level_id, name, description, components, skills, images, video_url, tutorial_url, price, image_url, school_id, placa_id, proyecto_principal, alimentacion, advertencia_seguridad, notas, activo, curso_id, visible)
SELECT m.nuevo, k.level_id, k.name,
       replace(replace(k.description, 'Academia Lizardo Villamarín', 'COPOL'), 'Academia', 'COPOL'),
       k.components, k.skills, k.images, k.video_url, k.tutorial_url, m.precio, k.image_url,
       'school-copol', k.placa_id, k.proyecto_principal, k.alimentacion, k.advertencia_seguridad, k.notas, true, m.curso, true
FROM (VALUES
  ('kit-lv-primero-egb', 'kit-copol-primero-egb', 35, 'curso-copol-primero-egb'),
  ('kit-lv-segundo-egb', 'kit-copol-segundo-egb', 42, 'curso-copol-segundo-egb'),
  ('kit-lv-tercero-egb', 'kit-copol-tercero-egb', 45, 'curso-copol-tercero-egb')
) AS m(origen, nuevo, precio, curso)
JOIN kits k ON k.id = m.origen
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, curso_id = EXCLUDED.curso_id;

-- 5a. Sus materiales
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido)
SELECT replace(km.kit_id, 'kit-lv-', 'kit-copol-'), km.material_id, km.cantidad, km.nota, km.incluido
FROM kit_materiales km
WHERE km.kit_id IN ('kit-lv-primero-egb', 'kit-lv-segundo-egb', 'kit-lv-tercero-egb')
  AND NOT EXISTS (
    SELECT 1 FROM kit_materiales x
    WHERE x.kit_id = replace(km.kit_id, 'kit-lv-', 'kit-copol-') AND x.material_id = km.material_id
  );

-- 5b. Sus proyectos (las 4 lecciones de cada kit, con su guía)
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia)
SELECT replace(p.kit_id, 'kit-lv-', 'kit-copol-'), p.titulo, 'copol-' || p.slug, p.tipo, p.descripcion, p.objetivos, p.orden, p.guia
FROM kit_proyectos p
WHERE p.kit_id IN ('kit-lv-primero-egb', 'kit-lv-segundo-egb', 'kit-lv-tercero-egb')
  AND NOT EXISTS (SELECT 1 FROM kit_proyectos x WHERE x.slug = 'copol-' || p.slug);

-- 6. Grados de cada docente (solo los ve si su cuenta ya existe en COPOL)
--    El nombre se compara sin tildes ni mayúsculas.
INSERT INTO teacher_courses (teacher_id, teacher_name, course_id, course_name, level_id, school_id, school_name, program_ids)
SELECT u.id, u.name, g.id, g.name, g.level_id, g.school_id, g.school_name, g.program_ids
FROM (VALUES
  ('emilio perez',  'grupo-copol-inicial-1'),
  ('emilio perez',  'grupo-copol-inicial-2'),
  ('emilio copol',  'grupo-copol-primero-egb'),
  ('emilio copol',  'grupo-copol-segundo-egb'),
  ('emilio copol',  'grupo-copol-tercero-egb'),
  ('david camacho', 'grupo-copol-cuarto-egb'),
  ('david camacho', 'grupo-copol-quinto-egb'),
  ('david camacho', 'grupo-copol-sexto-egb'),
  ('david camacho', 'grupo-copol-septimo-egb')
) AS a(docente, grupo)
JOIN users u ON u.role = 'teacher' AND u.school_id = 'school-copol'
            AND translate(lower(trim(u.name)), 'áéíóú', 'aeiou') = a.docente
JOIN courses_catalog g ON g.id = a.grupo
WHERE NOT EXISTS (SELECT 1 FROM teacher_courses x WHERE x.teacher_id = u.id AND x.course_id = g.id);

-- 6a. Quita a esos docentes cualquier grupo que no sea de los suyos en COPOL
DELETE FROM teacher_courses t
USING users u
WHERE u.id = t.teacher_id AND u.role = 'teacher' AND u.school_id = 'school-copol'
  AND (
    (translate(lower(trim(u.name)), 'áéíóú', 'aeiou') = 'emilio perez'  AND t.course_id NOT IN ('grupo-copol-inicial-1', 'grupo-copol-inicial-2')) OR
    (translate(lower(trim(u.name)), 'áéíóú', 'aeiou') = 'emilio copol'  AND t.course_id NOT IN ('grupo-copol-primero-egb', 'grupo-copol-segundo-egb', 'grupo-copol-tercero-egb')) OR
    (translate(lower(trim(u.name)), 'áéíóú', 'aeiou') = 'david camacho' AND t.course_id NOT IN ('grupo-copol-cuarto-egb', 'grupo-copol-quinto-egb', 'grupo-copol-sexto-egb', 'grupo-copol-septimo-egb'))
  );

-- Comprobación de docentes: debe salir cada uno con sus grados
SELECT u.name AS docente, string_agg(t.course_name, ', ' ORDER BY t.course_name) AS grados
FROM users u
LEFT JOIN teacher_courses t ON t.teacher_id = u.id
WHERE u.role = 'teacher' AND u.school_id = 'school-copol'
GROUP BY u.name;

-- Comprobación: 9 grupos y 9 kits de COPOL con su precio
SELECT g.name AS grupo, k.name AS kit, k.price AS precio, k.visible,
       (SELECT count(*) FROM kit_proyectos p WHERE p.kit_id = k.id) AS lecciones
FROM courses_catalog g
LEFT JOIN kits k ON k.school_id = g.school_id AND k.level_id = g.level_id
WHERE g.school_id = 'school-copol'
ORDER BY k.price, g.name;
