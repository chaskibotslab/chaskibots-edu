-- ============================================================
-- KITS ACADEMIA LIZARDO VILLAMARÍN (8vo EGB -> 3ro BGU)
-- ============================================================
-- No borra ni modifica nada existente. Reusa `levels` (octavo-egb,
-- noveno-egb, decimo-egb, primero-bach, segundo-bach, tercero-bach)
-- y extiende `kits` (ya existe) con columnas nuevas. Todo lo nuevo
-- queda scoped al colegio 'lizardo-villamarin' vía school_id, así
-- que no afecta el catálogo general ni a otros colegios.
--
-- Nombres de tabla con prefijo `kit_` para no chocar con la tabla
-- `projects` ya existente (que es "Proyectos Avanzados": Jetson,
-- Raspberry, Digispark — un concepto distinto).
--
-- Idempotente: se puede correr varias veces sin duplicar (upsert
-- por id/slug con ON CONFLICT).
-- ============================================================

-- ============================================================
-- 0. COLEGIO
-- ============================================================
INSERT INTO schools (id, name, code, country)
VALUES ('lizardo-villamarin', 'Academia Lizardo Villamarín', 'LV-001', 'Ecuador')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 1. PLACAS (catálogo técnico, reutilizable entre kits/colegios)
-- ============================================================
CREATE TABLE IF NOT EXISTS placas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  voltaje_logico TEXT,
  conector_usb TEXT,
  notas_tecnicas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO placas (id, nombre, voltaje_logico, conector_usb, notas_tecnicas) VALUES
  ('placa-uno-r3', 'Arduino UNO R3 (CH340)', '5V', 'USB-B',
   'Driver CH340. Evitar D0/D1 (serial). PWM en 3,5,6,9,10,11. Analógicos A0–A5.'),
  ('placa-nano-v3', 'Arduino Nano V3 (CH340)', '5V', 'Mini-USB',
   'Driver CH340. Igual pinout lógico que el UNO. VIN acepta 7–12 V.'),
  ('placa-nano-v3-microusb', 'Arduino Nano V3 Micro-USB (CH340)', '5V', 'Micro-USB (cable V8)',
   'Mismo pinout que el Nano V3. Permite alimentar con cargador de celular por cable V8.'),
  ('placa-esp32-c3-supermini', 'ESP32-C3 Super Mini', '3.3V', 'USB-C',
   'Pines de fábrica sin soldar (se sueldan en clase). Analógicos solo GPIO0–GPIO4. Evitar GPIO2, GPIO8 y GPIO9 como entradas (pines de arranque; GPIO8 tiene el LED integrado). En Arduino IDE activar "USB CDC On Boot: Enabled". No tolera 5V en los pines.'),
  ('placa-esp32-devkit-v1', 'ESP32 DevKit V1 30 pines', '3.3V', 'Micro-USB (cable V8)',
   'Con WiFi activo, los analógicos deben ir en ADC1 (GPIO32–39). GPIO34–39 son solo entrada. No usar GPIO6–11 (flash). Evitar GPIO0, 2, 12 y 15 (arranque). I2C: SDA 21, SCL 22. Módulos de 5V (relé, PIR, LCD) se alimentan desde VIN. No tolera 5V en los pines.')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, voltaje_logico = EXCLUDED.voltaje_logico,
  conector_usb = EXCLUDED.conector_usb, notas_tecnicas = EXCLUDED.notas_tecnicas;

-- ============================================================
-- 2. MATERIALES (catálogo único, reutilizable entre kits)
-- ============================================================
CREATE TABLE IF NOT EXISTS materiales (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('placa','sensor','actuador','componente','cable','herramienta','alimentacion')),
  especificacion TEXT,
  voltaje TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO materiales (id, nombre, categoria, especificacion) VALUES
  ('board-uno-r3', 'Arduino UNO R3 (CH340)', 'placa', NULL),
  ('board-nano-v3', 'Arduino Nano V3 (CH340) con pines soldados', 'placa', NULL),
  ('board-nano-v3-microusb', 'Arduino Nano V3 Micro-USB (CH340) con pines soldados', 'placa', NULL),
  ('board-esp32-c3', 'ESP32-C3 Super Mini (pines para soldar)', 'placa', NULL),
  ('board-esp32-devkit', 'ESP32 DevKit V1 30 pines', 'placa', NULL),
  ('protoboard-400', 'Protoboard 400 puntos', 'componente', NULL),
  ('sensor-ir-fc51', 'Sensor infrarrojo de obstáculos FC-51', 'sensor', NULL),
  ('servo-sg90', 'Servomotor SG90', 'actuador', NULL),
  ('buzzer-activo', 'Buzzer activo', 'actuador', NULL),
  ('led-rojo', 'LED rojo', 'componente', NULL),
  ('led-verde', 'LED verde', 'componente', NULL),
  ('led-amarillo', 'LED amarillo', 'componente', NULL),
  ('led-azul', 'LED azul', 'componente', NULL),
  ('led-blanco', 'LED blanco', 'componente', NULL),
  ('led-generico', 'LED (colores variados)', 'componente', NULL),
  ('pulsador', 'Pulsador', 'componente', NULL),
  ('potenciometro-10k', 'Potenciómetro 10 kΩ', 'componente', '10k'),
  ('resistencia-220-330', 'Resistencia 220 Ω / 330 Ω', 'componente', '220-330 ohm'),
  ('resistencia-surtida', 'Resistencias surtidas (varios valores)', 'componente', NULL),
  ('resistencia-1k', 'Resistencia 1 kΩ', 'componente', '1k'),
  ('jumper-mm', 'Jumper macho-macho', 'cable', NULL),
  ('jumper-mh', 'Jumper macho-hembra', 'cable', NULL),
  ('jumper-hh', 'Jumper hembra-hembra', 'cable', NULL),
  ('bateria-9v', 'Batería 9V', 'alimentacion', '9V'),
  ('portabateria-9v', 'Portabatería 9V con jack DC', 'alimentacion', NULL),
  ('conector-bateria-9v', 'Conector para batería 9V', 'alimentacion', NULL),
  ('cable-usb-ab', 'Cable USB A-B', 'cable', NULL),
  ('cable-usb-mini', 'Cable Mini-USB', 'cable', NULL),
  ('cable-usb-v8', 'Cable USB V8 (Micro-USB)', 'cable', NULL),
  ('cable-usbc-datos', 'Cable USB-C de datos', 'cable', NULL),
  ('cable-gemelo', 'Cable gemelo (dos hilos)', 'cable', NULL),
  ('sensor-ultrasonico-hcsr04', 'Sensor ultrasónico HC-SR04', 'sensor', '5V'),
  ('sensor-hcsr04p', 'Sensor ultrasónico HC-SR04P (3.3–5V)', 'sensor', '3.3-5V'),
  ('sensor-humedad-suelo', 'Sensor de humedad del suelo', 'sensor', NULL),
  ('sensor-dht11-modulo', 'Sensor DHT11 (módulo 3 pines)', 'sensor', NULL),
  ('sensor-ldr', 'Sensor LDR (fotoresistencia)', 'sensor', NULL),
  ('sensor-pir-hcsr501', 'Sensor PIR HC-SR501', 'sensor', '5V'),
  ('bomba-agua-5v', 'Bomba de agua 5V', 'actuador', '5V'),
  ('rele-1canal', 'Módulo relé 1 canal 5V', 'componente', '5V'),
  ('rele-1canal-opto', 'Módulo relé 1 canal con optoacoplador', 'componente', '5V'),
  ('manguera-silicona', 'Manguera de silicona', 'componente', NULL),
  ('portapilas-4aa', 'Portapilas 4×AA', 'alimentacion', '6V'),
  ('cargador-celular', 'Cargador de celular', 'alimentacion', NULL),
  ('cautin', 'Cautín', 'herramienta', NULL),
  ('estano', 'Estaño', 'herramienta', NULL),
  ('enchufe', 'Enchufe (clavija)', 'componente', NULL),
  ('boquilla-e27', 'Boquilla / portalámpara E27', 'componente', NULL),
  ('tomacorriente', 'Tomacorriente', 'componente', NULL),
  ('interruptor', 'Interruptor', 'componente', NULL),
  ('fuente-5v', 'Fuente de alimentación 5V', 'alimentacion', '5V'),
  ('foco', 'Foco', 'componente', NULL),
  ('lcd-16x2-i2c', 'LCD 16x2 con módulo I2C', 'componente', NULL),
  ('conversor-logico-i2c', 'Conversor de nivel lógico I2C 3.3–5V', 'componente', NULL)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre, categoria = EXCLUDED.categoria, especificacion = EXCLUDED.especificacion;

-- ============================================================
-- 3. KITS: extender tabla existente (no se crea tabla nueva)
-- ============================================================
ALTER TABLE kits
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS placa_id TEXT REFERENCES placas(id),
  ADD COLUMN IF NOT EXISTS proyecto_principal TEXT,
  ADD COLUMN IF NOT EXISTS alimentacion TEXT,
  ADD COLUMN IF NOT EXISTS advertencia_seguridad TEXT,
  ADD COLUMN IF NOT EXISTS notas TEXT,
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_kits_school ON kits(school_id);
CREATE INDEX IF NOT EXISTS idx_kits_placa ON kits(placa_id);

-- Seed: 6 kits de Lizardo Villamarín (precio $35 cada uno, confirmado)
INSERT INTO kits (id, level_id, school_id, placa_id, name, description, price, proyecto_principal, alimentacion, advertencia_seguridad, notas, activo) VALUES
  ('kit-lv-octavo-egb', 'octavo-egb', 'lizardo-villamarin', 'placa-uno-r3',
   'Electrónica y Programación con Arduino UNO', 'Kit 8vo EGB — Academia Lizardo Villamarín', 35,
   'Semáforo inteligente',
   'Cable USB A-B · Batería 9V con portabatería y jack de alimentación (directo al UNO)',
   NULL, 'Pulsadores con INPUT_PULLUP (sin resistencia). Solo 3 resistencias → máximo 3 LEDs encendidos a la vez.', true),
  ('kit-lv-noveno-egb', 'noveno-egb', 'lizardo-villamarin', 'placa-nano-v3',
   'Basurero Inteligente con Arduino Nano', 'Kit 9no EGB — Academia Lizardo Villamarín', 35,
   'Basurero inteligente con apertura automática',
   'Cable Mini-USB · Batería 9V con conector al pin VIN',
   NULL, NULL, true),
  ('kit-lv-decimo-egb', 'decimo-egb', 'lizardo-villamarin', 'placa-nano-v3-microusb',
   'Sistema de Riego Inteligente con Arduino Nano', 'Kit 10mo EGB — Academia Lizardo Villamarín', 35,
   'Sistema de riego automático para plantas',
   'Cable USB V8 para programar y alimentar con cargador de celular (cargador NO incluido) · Portapilas 4×AA solo para la bomba',
   NULL, 'El módulo relé ya trae transistor y diodo. La bomba va con su propia fuente (portapilas), GND común con el Nano.', true),
  ('kit-lv-primero-bach', 'primero-bach', 'lizardo-villamarin', 'placa-esp32-c3-supermini',
   'Estación Meteorológica IoT con ESP32-C3 Super Mini', 'Kit 1ro BGU — Academia Lizardo Villamarín', 35,
   'Estación meteorológica con monitoreo de variables ambientales',
   'Cable USB-C de datos para programar y alimentar con cargador de celular (cargador NO incluido)',
   NULL, 'Primera práctica = soldar los pines de la placa con supervisión docente. Todo a 3.3V.', true),
  ('kit-lv-segundo-bach', 'segundo-bach', 'lizardo-villamarin', 'placa-esp32-devkit-v1',
   'Domótica Inteligente con ESP32', 'Kit 2do BGU — Academia Lizardo Villamarín', 35,
   'Control inteligente de dispositivos eléctricos en el hogar',
   'Cable USB V8 · Fuente 5V con cable de alimentación',
   'Las prácticas con 110/220V se realizan únicamente bajo supervisión del docente y con relé con optoacoplador.', NULL, true),
  ('kit-lv-tercero-bach', 'tercero-bach', 'lizardo-villamarin', 'placa-esp32-devkit-v1',
   'IoT y Automatización Avanzada con ESP32', 'Kit 3ro BGU — Academia Lizardo Villamarín', 35,
   'Sistema inteligente de monitoreo y automatización completo',
   'Cable USB V8 · Fuente 5V',
   NULL, 'Sin módulo relé (no se trabaja con 110V en este curso).', true)
ON CONFLICT (id) DO UPDATE SET
  level_id = EXCLUDED.level_id, school_id = EXCLUDED.school_id, placa_id = EXCLUDED.placa_id,
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
  proyecto_principal = EXCLUDED.proyecto_principal, alimentacion = EXCLUDED.alimentacion,
  advertencia_seguridad = EXCLUDED.advertencia_seguridad, notas = EXCLUDED.notas, activo = EXCLUDED.activo;

-- ============================================================
-- 4. KIT_MATERIALES (qué trae cada kit, con cantidad e "incluido")
-- ============================================================
CREATE TABLE IF NOT EXISTS kit_materiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_id TEXT NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES materiales(id) ON DELETE RESTRICT,
  cantidad INT,
  nota TEXT,
  incluido BOOLEAN DEFAULT true,
  UNIQUE(kit_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_kit_materiales_kit ON kit_materiales(kit_id);

INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  -- 8vo EGB
  ('kit-lv-octavo-egb','board-uno-r3',1,NULL,true),
  ('kit-lv-octavo-egb','protoboard-400',1,NULL,true),
  ('kit-lv-octavo-egb','sensor-ir-fc51',1,NULL,true),
  ('kit-lv-octavo-egb','servo-sg90',1,NULL,true),
  ('kit-lv-octavo-egb','buzzer-activo',1,NULL,true),
  ('kit-lv-octavo-egb','led-rojo',1,NULL,true),
  ('kit-lv-octavo-egb','led-verde',1,NULL,true),
  ('kit-lv-octavo-egb','led-amarillo',1,NULL,true),
  ('kit-lv-octavo-egb','led-azul',1,NULL,true),
  ('kit-lv-octavo-egb','led-blanco',1,NULL,true),
  ('kit-lv-octavo-egb','pulsador',NULL,NULL,true),
  ('kit-lv-octavo-egb','potenciometro-10k',1,NULL,true),
  ('kit-lv-octavo-egb','resistencia-220-330',3,NULL,true),
  ('kit-lv-octavo-egb','jumper-mm',10,NULL,true),
  ('kit-lv-octavo-egb','jumper-mh',5,NULL,true),
  ('kit-lv-octavo-egb','jumper-hh',5,NULL,true),
  ('kit-lv-octavo-egb','bateria-9v',1,NULL,true),
  ('kit-lv-octavo-egb','portabateria-9v',1,NULL,true),
  ('kit-lv-octavo-egb','cable-usb-ab',1,NULL,true),

  -- 9no EGB
  ('kit-lv-noveno-egb','board-nano-v3',1,NULL,true),
  ('kit-lv-noveno-egb','protoboard-400',1,NULL,true),
  ('kit-lv-noveno-egb','sensor-ultrasonico-hcsr04',1,NULL,true),
  ('kit-lv-noveno-egb','servo-sg90',1,NULL,true),
  ('kit-lv-noveno-egb','buzzer-activo',1,NULL,true),
  ('kit-lv-noveno-egb','led-generico',NULL,NULL,true),
  ('kit-lv-noveno-egb','pulsador',NULL,NULL,true),
  ('kit-lv-noveno-egb','potenciometro-10k',1,NULL,true),
  ('kit-lv-noveno-egb','resistencia-surtida',NULL,NULL,true),
  ('kit-lv-noveno-egb','jumper-mm',NULL,NULL,true),
  ('kit-lv-noveno-egb','jumper-mh',NULL,NULL,true),
  ('kit-lv-noveno-egb','bateria-9v',1,NULL,true),
  ('kit-lv-noveno-egb','conector-bateria-9v',1,NULL,true),
  ('kit-lv-noveno-egb','cable-usb-mini',1,NULL,true),

  -- 10mo EGB
  ('kit-lv-decimo-egb','board-nano-v3-microusb',1,NULL,true),
  ('kit-lv-decimo-egb','protoboard-400',1,NULL,true),
  ('kit-lv-decimo-egb','sensor-humedad-suelo',1,NULL,true),
  ('kit-lv-decimo-egb','bomba-agua-5v',1,NULL,true),
  ('kit-lv-decimo-egb','rele-1canal',1,'Ya trae transistor y diodo',true),
  ('kit-lv-decimo-egb','manguera-silicona',1,NULL,true),
  ('kit-lv-decimo-egb','buzzer-activo',1,NULL,true),
  ('kit-lv-decimo-egb','led-generico',3,NULL,true),
  ('kit-lv-decimo-egb','resistencia-220-330',3,'330 ohm',true),
  ('kit-lv-decimo-egb','pulsador',1,NULL,true),
  ('kit-lv-decimo-egb','potenciometro-10k',1,NULL,true),
  ('kit-lv-decimo-egb','jumper-mm',NULL,NULL,true),
  ('kit-lv-decimo-egb','portapilas-4aa',1,'Solo para la bomba',true),
  ('kit-lv-decimo-egb','cable-usb-v8',1,NULL,true),
  ('kit-lv-decimo-egb','cargador-celular',1,NULL,false),

  -- 1ro BGU
  ('kit-lv-primero-bach','board-esp32-c3',1,NULL,true),
  ('kit-lv-primero-bach','protoboard-400',1,NULL,true),
  ('kit-lv-primero-bach','sensor-dht11-modulo',1,NULL,true),
  ('kit-lv-primero-bach','sensor-ir-fc51',1,NULL,true),
  ('kit-lv-primero-bach','sensor-ldr',1,NULL,true),
  ('kit-lv-primero-bach','potenciometro-10k',1,NULL,true),
  ('kit-lv-primero-bach','buzzer-activo',1,NULL,true),
  ('kit-lv-primero-bach','led-generico',3,NULL,true),
  ('kit-lv-primero-bach','pulsador',1,NULL,true),
  ('kit-lv-primero-bach','resistencia-220-330',3,NULL,true),
  ('kit-lv-primero-bach','resistencia-1k',1,'Divisor de voltaje del LDR',true),
  ('kit-lv-primero-bach','jumper-mm',NULL,NULL,true),
  ('kit-lv-primero-bach','jumper-mh',NULL,NULL,true),
  ('kit-lv-primero-bach','cautin',1,NULL,true),
  ('kit-lv-primero-bach','estano',1,NULL,true),
  ('kit-lv-primero-bach','cable-usbc-datos',1,NULL,true),
  ('kit-lv-primero-bach','cargador-celular',1,NULL,false),

  -- 2do BGU
  ('kit-lv-segundo-bach','board-esp32-devkit',1,NULL,true),
  ('kit-lv-segundo-bach','protoboard-400',1,NULL,true),
  ('kit-lv-segundo-bach','rele-1canal-opto',1,NULL,true),
  ('kit-lv-segundo-bach','sensor-pir-hcsr501',1,NULL,true),
  ('kit-lv-segundo-bach','sensor-ldr',1,NULL,true),
  ('kit-lv-segundo-bach','buzzer-activo',1,NULL,true),
  ('kit-lv-segundo-bach','led-generico',NULL,NULL,true),
  ('kit-lv-segundo-bach','pulsador',NULL,NULL,true),
  ('kit-lv-segundo-bach','cable-gemelo',1,NULL,true),
  ('kit-lv-segundo-bach','enchufe',1,NULL,true),
  ('kit-lv-segundo-bach','boquilla-e27',1,NULL,true),
  ('kit-lv-segundo-bach','tomacorriente',1,NULL,true),
  ('kit-lv-segundo-bach','interruptor',1,NULL,true),
  ('kit-lv-segundo-bach','resistencia-surtida',NULL,NULL,true),
  ('kit-lv-segundo-bach','jumper-mm',NULL,NULL,true),
  ('kit-lv-segundo-bach','fuente-5v',1,NULL,true),
  ('kit-lv-segundo-bach','cable-usb-v8',1,NULL,true),
  ('kit-lv-segundo-bach','foco',1,NULL,false),

  -- 3ro BGU
  ('kit-lv-tercero-bach','board-esp32-devkit',1,NULL,true),
  ('kit-lv-tercero-bach','protoboard-400',1,NULL,true),
  ('kit-lv-tercero-bach','lcd-16x2-i2c',1,NULL,true),
  ('kit-lv-tercero-bach','conversor-logico-i2c',1,NULL,true),
  ('kit-lv-tercero-bach','sensor-dht11-modulo',1,NULL,true),
  ('kit-lv-tercero-bach','sensor-humedad-suelo',1,NULL,true),
  ('kit-lv-tercero-bach','sensor-hcsr04p',1,NULL,true),
  ('kit-lv-tercero-bach','sensor-ldr',1,NULL,true),
  ('kit-lv-tercero-bach','buzzer-activo',1,NULL,true),
  ('kit-lv-tercero-bach','led-generico',NULL,NULL,true),
  ('kit-lv-tercero-bach','pulsador',NULL,NULL,true),
  ('kit-lv-tercero-bach','potenciometro-10k',1,NULL,true),
  ('kit-lv-tercero-bach','resistencia-surtida',NULL,NULL,true),
  ('kit-lv-tercero-bach','jumper-mm',NULL,NULL,true),
  ('kit-lv-tercero-bach','fuente-5v',1,NULL,true),
  ('kit-lv-tercero-bach','cable-usb-v8',1,NULL,true)
ON CONFLICT (kit_id, material_id) DO UPDATE SET
  cantidad = EXCLUDED.cantidad, nota = EXCLUDED.nota, incluido = EXCLUDED.incluido;

-- ============================================================
-- 5. ESTRUCTURA PARA CONTENIDO POR PROYECTO (fase 2 — vacío por ahora)
-- ============================================================
-- Prefijo kit_ para no chocar con la tabla `projects` ya existente
-- (esa es "Proyectos Avanzados": Jetson/Raspberry/Digispark, otro concepto).

CREATE TABLE IF NOT EXISTS kit_proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_id TEXT NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('principal','adicional')) DEFAULT 'adicional',
  descripcion TEXT,
  objetivos TEXT[],
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kit_id, slug)
);

CREATE TABLE IF NOT EXISTS kit_proyecto_materiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES kit_proyectos(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES materiales(id) ON DELETE RESTRICT,
  cantidad INT,
  UNIQUE(proyecto_id, material_id)
);

CREATE TABLE IF NOT EXISTS kit_conexiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES kit_proyectos(id) ON DELETE CASCADE,
  componente TEXT NOT NULL,
  pin_componente TEXT,
  pin_placa TEXT,
  nota TEXT,
  orden INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kit_esquemas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES kit_proyectos(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('svg','wokwi','imagen')) NOT NULL,
  url TEXT,
  contenido TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kit_codigos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES kit_proyectos(id) ON DELETE CASCADE,
  lenguaje TEXT DEFAULT 'arduino',
  contenido TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kit_proyectos_kit ON kit_proyectos(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_conexiones_proyecto ON kit_conexiones(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_kit_esquemas_proyecto ON kit_esquemas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_kit_codigos_proyecto ON kit_codigos(proyecto_id);

-- ============================================================
-- 6. RLS — mismo criterio que el resto del esquema (archivo
-- 2026_enable_rls_all_tables.sql): supabaseAdmin (service_role)
-- usado por el backend bypassa RLS siempre. Las tablas de catálogo
-- público (placas, materiales, kit_materiales) quedan con lectura
-- anónima igual que `kits`/`levels`. Las de contenido pedagógico
-- (kit_proyectos, kit_conexiones, kit_esquemas, kit_codigos) quedan
-- bloqueadas para anon hasta que exista una página pública que las
-- consuma — se abren más adelante cuando haga falta.
-- ============================================================
ALTER TABLE placas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_proyecto_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_conexiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_esquemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_codigos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'placas' AND policyname = 'anon_read_placas') THEN
    CREATE POLICY "anon_read_placas" ON placas FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materiales' AND policyname = 'anon_read_materiales') THEN
    CREATE POLICY "anon_read_materiales" ON materiales FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kit_materiales' AND policyname = 'anon_read_kit_materiales') THEN
    CREATE POLICY "anon_read_kit_materiales" ON kit_materiales FOR SELECT USING (true);
  END IF;
END $$;
