-- ============================================================
-- FUSION: institucion duplicada de la Academia Militar
-- ============================================================
-- Ya existia una institucion para esta misma academia, creada antes de
-- este trabajo (school-amclav-mkr7awl9, con 4 usuarios reales: 2
-- profesores y 2 estudiantes desde 2026-06-25). No la encontre cuando
-- empezamos y cree una segunda (lizardo-villamarin) para los 6 kits.
--
-- Se fusiona a favor de la institucion PREEXISTENTE (tiene gente real
-- registrada; la que yo cree no tenia nada mas que mis propios kits).
-- Verificado antes de borrar: lizardo-villamarin no tenia estudiantes,
-- usuarios ni submissions propias -- solo los 6 kits y los 6
-- school_courses que yo mismo inserte.
--
-- Ya aplicado en Supabase (verificado en caliente). Este archivo deja
-- la operacion documentada y es seguro de re-ejecutar: los UPDATE son
-- idempotentes y el DELETE con WHERE id=... no falla si ya no existe.
-- ============================================================

-- 1. Nombre/ciudad oficiales (segun los datos del Ing. Zapata) en la
--    institucion que se queda.
UPDATE schools
SET name = 'Academia Militar "Lizardo Alfonzo Villamarín"', city = 'Machachi'
WHERE id = 'school-amclav-mkr7awl9';

-- 2. Mover los 6 kits a la institucion canonica
UPDATE kits SET school_id = 'school-amclav-mkr7awl9' WHERE school_id = 'lizardo-villamarin';

-- 3. Mover las 6 asignaciones curso-colegio a la institucion canonica
UPDATE school_courses SET school_id = 'school-amclav-mkr7awl9' WHERE school_id = 'lizardo-villamarin';

-- 4. Borrar la institucion duplicada (ya verificado: nada mas la referencia)
DELETE FROM schools WHERE id = 'lizardo-villamarin';
