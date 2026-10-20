-- 10mo EGB: los 3 proyectos adicionales muestran la bomba en el diagrama.
-- Solo cambia kit_conexiones de esos 3 proyectos (no toca guías, fotos ni código).
-- Se puede ejecutar más de una vez.

BEGIN;

-- control-nivel-agua
DELETE FROM kit_conexiones WHERE proyecto_id = (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua');
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'SENSOR DE NIVEL (humedad)', 'VCC', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'SENSOR DE NIVEL (humedad)', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'SENSOR DE NIVEL (humedad)', 'AOUT', 'GPIO34', 'ADC1, solo entrada', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'MODULO RELE 1 CANAL', 'VCC', 'VIN (5V)', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'MODULO RELE 1 CANAL', 'GND', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'MODULO RELE 1 CANAL', 'IN', 'GPIO26', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'BOMBA DE AGUA 5V', '+ : va al NO del rele (comparte el USB-V8 con la placa)', 'USB-V8 compartido', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'BOMBA DE AGUA 5V', '- (GND comun con el ESP32)', 'GND', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'BUZZER ACTIVO', '+', 'GPIO13', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'BUZZER ACTIVO', '-', 'GND', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'LED ROJO (nivel bajo)', 'Ánodo (+) via R330', 'GPIO25', NULL, 11),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'LED ROJO (nivel bajo)', 'Cátodo (-)', 'GND', NULL, 12),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'LED VERDE (nivel ok)', 'Ánodo (+) via R330', 'GPIO33', NULL, 13),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'LED VERDE (nivel ok)', 'Cátodo (-)', 'GND', NULL, 14);

-- mini-invernadero
DELETE FROM kit_conexiones WHERE proyecto_id = (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero');
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'GPIO34', 'ADC1, solo entrada', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'POTENCIOMETRO (umbral)', 'Wiper', 'GPIO35', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'MODULO RELE 1 CANAL', 'IN', 'GPIO26', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'LED (estado)', 'Ánodo (+) via R330', 'GPIO25', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'PULSADOR MANUAL', 'Pin 1', 'GPIO27', 'INPUT_PULLUP', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'SENSOR HUMEDAD SUELO', 'VCC', '3V3', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'SENSOR HUMEDAD SUELO', 'GND', 'GND', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'POTENCIOMETRO (umbral)', 'Terminal A', '3V3', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'POTENCIOMETRO (umbral)', 'Terminal B', 'GND', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'MODULO RELE 1 CANAL', 'VCC', 'VIN (5V)', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'MODULO RELE 1 CANAL', 'GND', 'GND', NULL, 11),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'LED (estado)', 'Cátodo (-)', 'GND', NULL, 12),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'PULSADOR MANUAL', 'Pin 2', 'GND', NULL, 13),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'BOMBA DE AGUA 5V', '+ : va al NO del rele (comparte el USB-V8 con la placa)', 'USB-V8 compartido', NULL, 14),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'BOMBA DE AGUA 5V', '- (GND comun con el ESP32)', 'GND', NULL, 15);

-- automatizacion-cultivos
DELETE FROM kit_conexiones WHERE proyecto_id = (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos');
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'SENSOR HUMEDAD SUELO', 'VCC', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'SENSOR HUMEDAD SUELO', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'GPIO34', 'ADC1, solo entrada', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'MODULO RELE 1 CANAL', 'VCC', 'VIN (5V)', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'MODULO RELE 1 CANAL', 'GND', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'MODULO RELE 1 CANAL', 'IN', 'GPIO26', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'BOMBA DE AGUA 5V', '+ : va al NO del rele (comparte el USB-V8 con la placa)', 'USB-V8 compartido', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'BOMBA DE AGUA 5V', '- (GND comun con el ESP32)', 'GND', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'BUZZER ACTIVO', '+', 'GPIO13', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'BUZZER ACTIVO', '-', 'GND', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'LED VERDE (cultivo ok)', 'Ánodo (+) via R330', 'GPIO33', NULL, 11),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'LED VERDE (cultivo ok)', 'Cátodo (-)', 'GND', NULL, 12);

COMMIT;

-- Comprobación: debe salir 2 en cada proyecto
SELECT p.titulo, count(*) AS filas_bomba FROM kit_conexiones c JOIN kit_proyectos p ON p.id = c.proyecto_id
WHERE p.kit_id = 'kit-lv-decimo-egb' AND c.componente LIKE 'BOMBA%' GROUP BY p.titulo;
