-- COPOL fase 3: prácticas de electrónica en 4to y 5to + dibujo del circuito de Inicial 1 a 5to.
--
--  1. 4to recibe las 4 lecciones «Farola inteligente» y 5to las 4 de «Tanque de agua inteligente»
--     (las mismas de la Academia), antes de las lecciones del kit de madera.
--  2. Sus materiales se suman a la lista del kit.
--  3. Cada lección de electrónica de Inicial 1 a 5to muestra el dibujo del circuito completo.
--
-- Se puede ejecutar más de una vez: no duplica nada.
BEGIN;

-- 1. Lecciones de electrónica para 4to y 5to (orden -7 a -4; el kit de madera queda de -3 a 1).
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia)
SELECT v.copol, p.titulo, 'copol-' || p.slug, 'practica', p.descripcion, p.objetivos,
       CASE WHEN p.orden = 1 THEN -4 ELSE p.orden - 4 END, p.guia
FROM kit_proyectos p
JOIN (VALUES ('kit-lv-cuarto-egb', 'kit-copol-cuarto-egb'), ('kit-lv-quinto-egb', 'kit-copol-quinto-egb')) AS v(lv, copol) ON v.lv = p.kit_id
WHERE NOT EXISTS (SELECT 1 FROM kit_proyectos c WHERE c.kit_id = v.copol AND c.slug = 'copol-' || p.slug);

-- 2. Materiales de esas prácticas.
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido)
SELECT v.copol, m.material_id, m.cantidad, m.nota, m.incluido
FROM kit_materiales m
JOIN (VALUES ('kit-lv-cuarto-egb', 'kit-copol-cuarto-egb'), ('kit-lv-quinto-egb', 'kit-copol-quinto-egb')) AS v(lv, copol) ON v.lv = m.kit_id
WHERE NOT EXISTS (SELECT 1 FROM kit_materiales c WHERE c.kit_id = v.copol AND c.material_id = m.material_id);

UPDATE kits SET
  alimentacion = 'Batería de 9 V para las prácticas de electrónica. El tragamonedas no usa electricidad: funciona con el peso de la moneda.',
  advertencia_seguridad = 'Solo batería de 9 V; nunca la red eléctrica. Revisar la polaridad de los LEDs antes de conectar. Si algo se calienta, desconectar de inmediato. Las piezas pequeñas se guardan en la caja. La goma y la lija se usan con supervisión.'
WHERE id = 'kit-copol-cuarto-egb';

UPDATE kits SET
  alimentacion = 'Batería de 9 V para las prácticas de electrónica. Pilas en el portapilas del carro y en el control remoto.',
  advertencia_seguridad = 'Solo batería de 9 V o pilas; nunca la red eléctrica. Revisar la polaridad de los LEDs antes de conectar. Las pilas y la batería las entrega y las recoge el docente. Si algo se calienta, se apaga y se desconecta.'
WHERE id = 'kit-copol-quinto-egb';

-- 3. Dibujo del circuito completo en cada lección de electrónica (Inicial 1 a 5to).
INSERT INTO kit_esquemas (proyecto_id, tipo, url, contenido, version)
SELECT cp.id, 'imagen', e.url, NULL, 1
FROM kit_esquemas e
JOIN kit_proyectos lp ON lp.id = e.proyecto_id AND lp.tipo = 'principal'
JOIN kit_proyectos ls ON ls.kit_id = lp.kit_id
JOIN kit_proyectos cp ON cp.kit_id = replace(lp.kit_id, 'kit-lv-', 'kit-copol-') AND cp.slug = 'copol-' || ls.slug
WHERE e.tipo = 'imagen'
  AND lp.kit_id IN ('kit-lv-inicial-1', 'kit-lv-inicial-2', 'kit-lv-primero-egb', 'kit-lv-segundo-egb',
                    'kit-lv-tercero-egb', 'kit-lv-cuarto-egb', 'kit-lv-quinto-egb')
  AND NOT EXISTS (SELECT 1 FROM kit_esquemas x WHERE x.proyecto_id = cp.id);

COMMIT;

-- Comprobación: lecciones, lecciones con dibujo de circuito y materiales por curso.
-- Esperado  →  Inicial 1 y 2: 7 / 4 / 6   ·   1ro: 4 / 4 / 7   ·   2do y 3ro: 4 / 4 / 8
--              4to: 8 / 4 / 11   ·   5to: 8 / 4 / 17
SELECT k.id,
  (SELECT count(*) FROM kit_proyectos p WHERE p.kit_id = k.id) AS lecciones,
  (SELECT count(*) FROM kit_proyectos p JOIN kit_esquemas e ON e.proyecto_id = p.id WHERE p.kit_id = k.id) AS con_circuito,
  (SELECT count(*) FROM kit_materiales m WHERE m.kit_id = k.id) AS materiales
FROM kits k
WHERE k.school_id = 'school-copol'
ORDER BY k.id;
