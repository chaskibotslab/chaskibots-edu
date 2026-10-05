-- ============================================================
-- CONTENIDO FINAL de los 6 kits (fase 4 -- reemplaza fases 2 y 3)
-- Academia Militar Lizardo Alfonzo Villamarin
-- ============================================================
-- Datos "finales y actualizados" entregados por el Ing. Zapata:
--   - 8vo: buzzer PASIVO (no activo), resistencias 330/1k/10k
--   - 9no: SIN buzzer (alarmas visuales con LED)
--   - 10mo: sin bateria aparte para la bomba (comparte USB-V8)
--   - 1ro: una sola resistencia 330 (un LED de alerta, no tres)
--   - 2do: SIN buzzer ni tomacorriente; 3 adicionales (no 5)
--   - 3ro: sin rele/potenciometro/pulsador/conversor/humedad
--
-- Reemplaza por completo kit_materiales y kit_proyectos (con sus
-- conexiones/esquemas/codigos en cascada) de los 6 kits via DELETE +
-- INSERT, scoped estrictamente a estos 6 kit_id. No toca ninguna
-- otra tabla ni dato de la plataforma.
-- Depende de: 2026_kit_lizardo_villamarin.sql,
-- 2026_kit_lv_proyectos_esquemas.sql, 2026_kit_lv_adicionales.sql,
-- 2026_kit_lv_cursos.sql (todas ya aplicadas).

-- ============================================================
-- 1. MATERIALES: filas nuevas / texto actualizado
-- ============================================================
INSERT INTO materiales (id, nombre, categoria, especificacion) VALUES
  ('buzzer-pasivo', 'Buzzer pasivo', 'actuador', NULL),
  ('resistencia-330', 'Resistencia 330 Ω', 'componente', '330 ohm'),
  ('resistencia-10k', 'Resistencia 10 kΩ', 'componente', '10k')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, categoria = EXCLUDED.categoria, especificacion = EXCLUDED.especificacion;

UPDATE materiales SET nombre = v.nombre, categoria = v.categoria FROM (VALUES
  ('sensor-ldr', 'Sensor LDR (módulo con salida analógica)', 'sensor')
) AS v(id, nombre, categoria) WHERE materiales.id = v.id;

-- ============================================================
-- 2. KIT_MATERIALES: reemplazo completo (listas finales)
-- ============================================================
DELETE FROM kit_materiales WHERE kit_id IN ('kit-lv-octavo-egb', 'kit-lv-noveno-egb', 'kit-lv-decimo-egb', 'kit-lv-primero-bach', 'kit-lv-segundo-bach', 'kit-lv-tercero-bach');

INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  ('kit-lv-octavo-egb', 'board-uno-r3', 1, NULL, true),
  ('kit-lv-octavo-egb', 'protoboard-400', 1, NULL, true),
  ('kit-lv-octavo-egb', 'sensor-ir-fc51', 1, NULL, true),
  ('kit-lv-octavo-egb', 'servo-sg90', 1, NULL, true),
  ('kit-lv-octavo-egb', 'buzzer-pasivo', 1, NULL, true),
  ('kit-lv-octavo-egb', 'led-rojo', 1, NULL, true),
  ('kit-lv-octavo-egb', 'led-verde', 1, NULL, true),
  ('kit-lv-octavo-egb', 'led-amarillo', 1, NULL, true),
  ('kit-lv-octavo-egb', 'led-azul', 1, NULL, true),
  ('kit-lv-octavo-egb', 'led-blanco', 1, NULL, true),
  ('kit-lv-octavo-egb', 'pulsador', NULL, NULL, true),
  ('kit-lv-octavo-egb', 'potenciometro-10k', 1, NULL, true),
  ('kit-lv-octavo-egb', 'resistencia-330', 3, NULL, true),
  ('kit-lv-octavo-egb', 'resistencia-1k', 1, 'Repuesto / experimentacion libre', true),
  ('kit-lv-octavo-egb', 'resistencia-10k', 1, 'Pull-down de un pulsador', true),
  ('kit-lv-octavo-egb', 'jumper-mm', 10, NULL, true),
  ('kit-lv-octavo-egb', 'jumper-mh', 5, NULL, true),
  ('kit-lv-octavo-egb', 'jumper-hh', 5, NULL, true),
  ('kit-lv-octavo-egb', 'bateria-9v', 1, NULL, true),
  ('kit-lv-octavo-egb', 'portabateria-9v', 1, NULL, true),
  ('kit-lv-octavo-egb', 'cable-usb-ab', 1, NULL, true),
  ('kit-lv-noveno-egb', 'board-nano-v3', 1, NULL, true),
  ('kit-lv-noveno-egb', 'protoboard-400', 1, NULL, true),
  ('kit-lv-noveno-egb', 'sensor-ultrasonico-hcsr04', 1, NULL, true),
  ('kit-lv-noveno-egb', 'servo-sg90', 1, NULL, true),
  ('kit-lv-noveno-egb', 'led-generico', 3, NULL, true),
  ('kit-lv-noveno-egb', 'pulsador', NULL, NULL, true),
  ('kit-lv-noveno-egb', 'potenciometro-10k', 1, NULL, true),
  ('kit-lv-noveno-egb', 'resistencia-330', 1, NULL, true),
  ('kit-lv-noveno-egb', 'resistencia-1k', 1, 'Repuesto / experimentacion libre', true),
  ('kit-lv-noveno-egb', 'jumper-mm', 10, NULL, true),
  ('kit-lv-noveno-egb', 'jumper-mh', 5, NULL, true),
  ('kit-lv-noveno-egb', 'jumper-hh', 5, NULL, true),
  ('kit-lv-noveno-egb', 'bateria-9v', 1, NULL, true),
  ('kit-lv-noveno-egb', 'conector-bateria-9v', 1, NULL, true),
  ('kit-lv-noveno-egb', 'cable-usb-mini', 1, NULL, true),
  ('kit-lv-decimo-egb', 'board-nano-v3-microusb', 1, NULL, true),
  ('kit-lv-decimo-egb', 'protoboard-400', 1, NULL, true),
  ('kit-lv-decimo-egb', 'sensor-humedad-suelo', 1, NULL, true),
  ('kit-lv-decimo-egb', 'bomba-agua-5v', 1, NULL, true),
  ('kit-lv-decimo-egb', 'rele-1canal', 1, 'Ya trae transistor y diodo', true),
  ('kit-lv-decimo-egb', 'manguera-silicona', 1, NULL, true),
  ('kit-lv-decimo-egb', 'buzzer-activo', 1, NULL, true),
  ('kit-lv-decimo-egb', 'led-generico', 3, NULL, true),
  ('kit-lv-decimo-egb', 'resistencia-330', 3, NULL, true),
  ('kit-lv-decimo-egb', 'pulsador', 1, NULL, true),
  ('kit-lv-decimo-egb', 'potenciometro-10k', 1, NULL, true),
  ('kit-lv-decimo-egb', 'jumper-mm', 10, NULL, true),
  ('kit-lv-decimo-egb', 'jumper-mh', 5, NULL, true),
  ('kit-lv-decimo-egb', 'jumper-hh', 5, NULL, true),
  ('kit-lv-decimo-egb', 'cable-usb-v8', 1, NULL, true),
  ('kit-lv-decimo-egb', 'cargador-celular', 1, 'Minimo 1A, alimenta placa y bomba', false),
  ('kit-lv-primero-bach', 'board-esp32-c3', 1, NULL, true),
  ('kit-lv-primero-bach', 'protoboard-400', 1, NULL, true),
  ('kit-lv-primero-bach', 'sensor-dht11-modulo', 1, NULL, true),
  ('kit-lv-primero-bach', 'sensor-ir-fc51', 1, NULL, true),
  ('kit-lv-primero-bach', 'sensor-ldr', 1, NULL, true),
  ('kit-lv-primero-bach', 'potenciometro-10k', 1, NULL, true),
  ('kit-lv-primero-bach', 'buzzer-activo', 1, NULL, true),
  ('kit-lv-primero-bach', 'led-generico', 3, NULL, true),
  ('kit-lv-primero-bach', 'pulsador', 1, NULL, true),
  ('kit-lv-primero-bach', 'resistencia-330', 1, NULL, true),
  ('kit-lv-primero-bach', 'resistencia-1k', 1, 'Divisor de voltaje del LDR', true),
  ('kit-lv-primero-bach', 'jumper-mm', NULL, NULL, true),
  ('kit-lv-primero-bach', 'jumper-mh', NULL, NULL, true),
  ('kit-lv-primero-bach', 'cautin', 1, NULL, true),
  ('kit-lv-primero-bach', 'estano', 1, NULL, true),
  ('kit-lv-primero-bach', 'cable-usbc-datos', 1, NULL, true),
  ('kit-lv-primero-bach', 'cargador-celular', 1, NULL, false),
  ('kit-lv-segundo-bach', 'board-esp32-devkit', 1, NULL, true),
  ('kit-lv-segundo-bach', 'protoboard-400', 1, NULL, true),
  ('kit-lv-segundo-bach', 'rele-1canal-opto', 1, NULL, true),
  ('kit-lv-segundo-bach', 'sensor-pir-hcsr501', 1, NULL, true),
  ('kit-lv-segundo-bach', 'sensor-ldr', 1, NULL, true),
  ('kit-lv-segundo-bach', 'led-generico', 3, NULL, true),
  ('kit-lv-segundo-bach', 'pulsador', 1, NULL, true),
  ('kit-lv-segundo-bach', 'resistencia-330', 1, NULL, true),
  ('kit-lv-segundo-bach', 'cable-gemelo', 1, NULL, true),
  ('kit-lv-segundo-bach', 'enchufe', 1, NULL, true),
  ('kit-lv-segundo-bach', 'boquilla-e27', 1, NULL, true),
  ('kit-lv-segundo-bach', 'interruptor', 1, NULL, true),
  ('kit-lv-segundo-bach', 'jumper-mm', 5, NULL, true),
  ('kit-lv-segundo-bach', 'jumper-mh', 10, NULL, true),
  ('kit-lv-segundo-bach', 'jumper-hh', 10, NULL, true),
  ('kit-lv-segundo-bach', 'fuente-5v', 1, NULL, true),
  ('kit-lv-segundo-bach', 'cable-usb-v8', 1, NULL, true),
  ('kit-lv-segundo-bach', 'foco', 1, NULL, false),
  ('kit-lv-tercero-bach', 'board-esp32-devkit', 1, NULL, true),
  ('kit-lv-tercero-bach', 'protoboard-400', 1, NULL, true),
  ('kit-lv-tercero-bach', 'lcd-16x2-i2c', 1, NULL, true),
  ('kit-lv-tercero-bach', 'sensor-dht11-modulo', 1, NULL, true),
  ('kit-lv-tercero-bach', 'sensor-hcsr04p', 1, NULL, true),
  ('kit-lv-tercero-bach', 'sensor-ldr', 1, NULL, true),
  ('kit-lv-tercero-bach', 'buzzer-activo', 1, NULL, true),
  ('kit-lv-tercero-bach', 'led-generico', 3, NULL, true),
  ('kit-lv-tercero-bach', 'resistencia-330', 1, NULL, true),
  ('kit-lv-tercero-bach', 'jumper-mm', 5, NULL, true),
  ('kit-lv-tercero-bach', 'jumper-mh', 12, NULL, true),
  ('kit-lv-tercero-bach', 'jumper-hh', 12, NULL, true),
  ('kit-lv-tercero-bach', 'fuente-5v', 1, NULL, true),
  ('kit-lv-tercero-bach', 'cable-usb-v8', 1, NULL, true);

-- ============================================================
-- 3. KIT_PROYECTOS: reemplazo completo (29 proyectos finales)
-- La cascada (ON DELETE CASCADE) limpia automaticamente las
-- conexiones, esquemas y codigos de los proyectos viejos de estos
-- 6 kits (incluye los 2 adicionales de 2do BGU que ya no aplican).
-- ============================================================
DELETE FROM kit_proyectos WHERE kit_id IN ('kit-lv-octavo-egb', 'kit-lv-noveno-egb', 'kit-lv-decimo-egb', 'kit-lv-primero-bach', 'kit-lv-segundo-bach', 'kit-lv-tercero-bach');

INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden) VALUES
  ('kit-lv-octavo-egb', 'Semáforo inteligente con paso peatonal', 'semaforo-inteligente', 'principal', 'Un semáforo de 3 luces que cambia en secuencia y se detiene en rojo cuando un peatón presiona el botón para cruzar, avisando con el buzzer.', ARRAY['Controlar varias salidas digitales (LEDs) con una secuencia de tiempo usando digitalWrite y delay.', 'Usar un pulsador con INPUT_PULLUP para que un evento externo interrumpa la secuencia normal del programa.', 'Generar un aviso sonoro con tone(), la forma correcta de usar un buzzer pasivo.', 'Calcular y aplicar la resistencia limitadora de corriente correcta para no quemar un LED.'], 1),
  ('kit-lv-noveno-egb', 'Basurero inteligente con apertura automática', 'basurero-inteligente', 'principal', 'La tapa del basurero se abre sola cuando detecta una mano o un objeto cerca, usando un sensor ultrasónico y un servomotor. Este kit no trae buzzer: la confirmación es con un LED.', ARRAY['Medir distancia con un sensor ultrasónico HC-SR04 e interpretar el resultado en centímetros.', 'Controlar la posición de un servomotor para abrir y cerrar una tapa.', 'Diseñar una condición (if) que active una acción solo cuando se cumple una regla de distancia.', 'Dar retroalimentación visual (no sonora) al usuario con un LED.'], 1),
  ('kit-lv-decimo-egb', 'Sistema de riego automático para plantas', 'sistema-riego-automatico', 'principal', 'Un sensor mide la humedad de la tierra y enciende automáticamente una bomba de agua cuando la planta lo necesita, con un umbral ajustable y aviso sonoro.', ARRAY['Leer un sensor analógico de humedad del suelo y relacionar el valor con el estado real de la tierra.', 'Controlar un actuador de mayor corriente (bomba de agua) de forma segura usando un módulo relé.', 'Ajustar un umbral de activación en tiempo real con un potenciómetro.', 'Combinar varias entradas y salidas (sensor, pulsador, bomba, LEDs, buzzer) en un solo sistema automático.'], 1),
  ('kit-lv-primero-bach', 'Estación meteorológica con monitoreo ambiental', 'estacion-meteorologica-iot', 'principal', 'Mide temperatura, humedad y luz ambiental, y enciende un LED de alerta cuando algún valor sale de rango (este kit trae una sola resistencia, así que hay un solo LED de estado).', ARRAY['Soldar correctamente los pines de una placa ESP32-C3 con supervisión docente.', 'Leer temperatura y humedad ambiental con un sensor digital (DHT11).', 'Usar un divisor de voltaje para leer un sensor resistivo (LDR) con un microcontrolador de 3.3V.', 'Combinar dos condiciones (temperatura y humedad) en una sola alerta con el operador OR.'], 1),
  ('kit-lv-segundo-bach', 'Control inteligente de dispositivos del hogar', 'domotica-inteligente', 'principal', 'Detecta movimiento y nivel de luz para encender automáticamente una carga de 110V (representada con un LED por seguridad) a través de un relé con optoacoplador. Sin buzzer: la confirmación es con un LED.', ARRAY['Controlar una carga de 110V de forma segura mediante un relé con optoacoplador.', 'Detectar movimiento con un sensor PIR y accionar un dispositivo automáticamente.', 'Explicar por qué nunca se debe manipular 110V sin supervisión ni aislamiento adecuado.', 'Combinar un sensor de luz (LDR) con un sensor de presencia (PIR) para automatizar el encendido de una luz.'], 1),
  ('kit-lv-tercero-bach', 'Sistema inteligente de monitoreo y automatización', 'monitoreo-automatizacion-iot', 'principal', 'Integra temperatura, humedad, distancia y luz en una pantalla LCD que alterna sola entre dos vistas (este kit no trae pulsador), con alerta visual y sonora.', ARRAY['Integrar varios sensores (temperatura, humedad, distancia, luz) en un solo sistema de monitoreo.', 'Mostrar información en tiempo real en una pantalla LCD mediante el protocolo I2C.', 'Usar millis() para alternar automáticamente entre pantallas sin bloquear el programa.', 'Diseñar una alerta que combine dos condiciones distintas con el operador OR.'], 1),
  ('kit-lv-octavo-egb', 'Detector de obstáculos', 'detector-obstaculos', NULL, 'Un sensor infrarrojo detecta objetos cercanos y enciende un LED con una alarma sonora.', ARRAY['Leer una señal digital de un sensor infrarrojo FC-51.', 'Relacionar una entrada digital con dos salidas (LED y buzzer).'], 2),
  ('kit-lv-octavo-egb', 'Alarma de puerta', 'alarma', NULL, 'Simula una alarma de puerta: si el sensor (pulsador) se abre, suena el buzzer y parpadea el LED rojo.', ARRAY['Detectar un cambio de estado en una entrada digital.', 'Mantener un estado (armada/disparada) usando una variable booleana.'], 3),
  ('kit-lv-octavo-egb', 'Control de servomotor con potenciómetro', 'control-servomotor', NULL, 'El ángulo de un servomotor se controla en vivo girando un potenciómetro.', ARRAY['Leer un valor analógico y convertirlo (map) a otro rango de salida.', 'Controlar un servomotor con la librería Servo.'], 4),
  ('kit-lv-octavo-egb', 'Piano con pulsadores', 'piano-pulsadores', NULL, 'Dos pulsadores usan resistencia pull-up interna y el tercero usa una resistencia pull-down externa de 10 kΩ, para comparar ambas formas de leer un botón. Cada uno suena una nota distinta.', ARRAY['Comparar la lectura de un pulsador con pull-up interna (INPUT_PULLUP) contra pull-down externa.', 'Usar varias entradas digitales al mismo tiempo.', 'Generar tonos de distinta frecuencia con la función tone(), ideal para el buzzer pasivo de este kit.'], 5),
  ('kit-lv-noveno-egb', 'Contador de personas', 'contador-personas', NULL, 'Cada vez que algo pasa frente al sensor ultrasónico, suma 1 al contador y lo muestra por el Monitor Serial; el LED parpadea como confirmación (sin buzzer).', ARRAY['Detectar un evento comparando la lectura actual con la anterior.', 'Usar el Monitor Serial para mostrar datos cuando no hay pantalla ni buzzer.'], 2),
  ('kit-lv-noveno-egb', 'Dispensador automático', 'dispensador-automatico', NULL, 'Al acercar la mano, el servomotor abre la compuerta del dispensador un momento y el LED confirma (sin buzzer).', ARRAY['Controlar un servomotor como compuerta temporal (abre y cierra solo).', 'Evitar que el sensor dispare el mecanismo varias veces seguidas.'], 3),
  ('kit-lv-noveno-egb', 'Puerta automática', 'puerta-automatica', NULL, 'La puerta (servo) se abre cuando alguien se acerca y se mantiene abierta mientras siga cerca; un LED indica que está abierta.', ARRAY['Mantener un actuador en una posición mientras una condición siga siendo verdadera.', 'Sincronizar una salida digital (LED) con el estado de un servomotor.'], 4),
  ('kit-lv-noveno-egb', 'Alarma de proximidad (visual con LEDs)', 'alarma-proximidad', NULL, 'Un LED parpadea más rápido mientras más cerca está un objeto del sensor (este kit no tiene buzzer: la alarma es 100% visual). El potenciómetro ajusta la sensibilidad y el pulsador enciende/apaga la alarma.', ARRAY['Convertir una distancia en un ritmo de parpadeo (entre más cerca, más rápido).', 'Encender y apagar una función con un pulsador que alterna un estado (toggle).'], 5),
  ('kit-lv-decimo-egb', 'Control de nivel de agua', 'control-nivel-agua', NULL, 'Usa el sensor como si midiera el nivel de un tanque: si el nivel está bajo, activa la bomba hasta volver a un nivel correcto.', ARRAY['Reinterpretar un sensor para medir algo distinto a su uso original.', 'Controlar un actuador de alta corriente con un relé de forma segura.'], 2),
  ('kit-lv-decimo-egb', 'Mini invernadero inteligente', 'mini-invernadero', NULL, 'Riega automáticamente según el umbral ajustado con el potenciómetro, o manualmente con el pulsador.', ARRAY['Combinar una decisión automática con una opción de control manual.', 'Ajustar en vivo un parámetro del sistema con un potenciómetro.'], 3),
  ('kit-lv-decimo-egb', 'Automatización de cultivos', 'automatizacion-cultivos', NULL, 'En vez de regar todo el tiempo que la tierra esté seca, riega por pulsos cortos cada cierto intervalo, sin bloquear el programa con delay().', ARRAY['Usar millis() para repetir una tarea cada cierto tiempo sin usar delay() largo.', 'Diseñar un riego por pulsos en vez de continuo, para no desperdiciar agua.'], 4),
  ('kit-lv-primero-bach', 'Luz automática', 'luz-automatica', NULL, 'Enciende un LED cuando detecta poca luz ambiental, usando el sensor LDR.', ARRAY['Leer un sensor analógico de luz (LDR) en un microcontrolador de 3.3V.', 'Definir y ajustar un umbral de activación por prueba y error.'], 2),
  ('kit-lv-primero-bach', 'Contador de visitas', 'contador-visitas', NULL, 'Usa el sensor infrarrojo FC-51 para contar cuántas veces pasa algo frente a él. El total se muestra por el Monitor Serial.', ARRAY['Reutilizar la lógica de detección de eventos en una placa distinta (ESP32-C3).', 'Practicar el uso del Monitor Serial a 115200 baudios.'], 3),
  ('kit-lv-primero-bach', 'Alarma de temperatura', 'alarma-temperatura', NULL, 'Si la temperatura supera el umbral (ajustable con el potenciómetro), enciende el LED rojo y el buzzer.', ARRAY['Comparar una lectura de sensor contra un umbral ajustable.', 'Reforzar el uso de DHT11 para temperatura en un contexto distinto al de monitoreo general.'], 4),
  ('kit-lv-primero-bach', 'Registro de datos en la nube', 'registro-datos-nube', NULL, 'Envía temperatura, humedad y luz a un servidor propio cada cierto tiempo, usando WiFi.', ARRAY['Conectar un ESP32 a una red WiFi.', 'Enviar datos por HTTP (POST) a un servidor en formato JSON.'], 5),
  ('kit-lv-segundo-bach', 'Encendido remoto de luces', 'encendido-remoto-luces', NULL, 'Crea una página web dentro del propio ESP32 con un botón para encender y apagar la luz desde cualquier navegador conectado a la misma red WiFi.', ARRAY['Levantar un servidor web básico en el ESP32 con la librería WebServer.', 'Controlar una salida digital (el relé) desde una página HTML.'], 2),
  ('kit-lv-segundo-bach', 'Automatización de ventiladores', 'automatizacion-ventiladores', NULL, 'Enciende el "ventilador" (representado por el relé) mientras detecta a alguien en la habitación, y lo apaga unos segundos después de que se va.', ARRAY['Mantener una salida activa mientras un sensor PIR siga detectando presencia.', 'Agregar un retardo de apagado para evitar encendidos/apagados constantes.'], 3),
  ('kit-lv-segundo-bach', 'Control desde celular', 'control-desde-celular', NULL, 'Página web con el estado del sensor PIR en vivo y un botón para controlar el relé manualmente desde el navegador del celular.', ARRAY['Mostrar el valor de un sensor en tiempo real en una página web.', 'Combinar lectura de sensores y control de actuadores en un mismo panel.'], 4),
  ('kit-lv-tercero-bach', 'Casa inteligente (simulada)', 'casa-inteligente-simulada', NULL, 'Un LED representa la luz de la casa: se enciende solo cuando oscurece (según el LDR). El buzzer suena una vez, como timbre de bienvenida, cada vez que la luz cambia de estado (este kit no tiene pulsador).', ARRAY['Representar un sistema real (una casa) con componentes simples (LED y buzzer).', 'Detectar un cambio de estado (no solo el estado actual) para disparar una acción una sola vez.'], 2),
  ('kit-lv-tercero-bach', 'Sistema de seguridad IoT', 'sistema-seguridad-iot', NULL, 'Si el sensor ultrasónico detecta que algo se acerca demasiado, activa una alarma (LED + buzzer) y publica el evento por el Monitor Serial.', ARRAY['Definir una distancia de seguridad y reaccionar cuando se viola.', 'Preparar el código para conectarse más adelante a WiFi/MQTT.'], 3),
  ('kit-lv-tercero-bach', 'Monitoreo remoto por Internet', 'monitoreo-remoto-internet', NULL, 'Publica temperatura, humedad y nivel de luz a un servidor propio cada cierto tiempo usando WiFi, para verlos desde cualquier lugar.', ARRAY['Enviar varias lecturas de sensores juntas en un solo mensaje JSON.', 'Repetir una tarea de red cada cierto intervalo sin bloquear el programa.'], 4),
  ('kit-lv-tercero-bach', 'Dashboard con MQTT', 'dashboard-mqtt', NULL, 'Publica las lecturas de temperatura y humedad a un broker MQTT para verlas en un dashboard (Node-RED, MQTT Explorer, etc).', ARRAY['Entender el patrón publicar/suscribir (MQTT) frente al modelo HTTP tradicional.', 'Conectar el ESP32 a un broker MQTT público de pruebas.'], 5),
  ('kit-lv-tercero-bach', 'Automatización de sensores', 'automatizacion-sensores', NULL, 'Combina dos sensores en una sola regla de decisión: enciende el LED de alerta si hace mucho calor o si hay algo muy cerca - lo que pase primero.', ARRAY['Combinar varias condiciones de distintos sensores con un operador lógico (OR).', 'Diseñar una sola alerta que resuma el estado del sistema.'], 6);

-- ============================================================
-- 4. KIT_CONEXIONES
-- ============================================================
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'LED ROJO', 'Anodo (+)', 'D8', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'LED ROJO', 'Catodo (-) via R330', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'LED AMARILLO', 'Anodo (+)', 'D9', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'LED AMARILLO', 'Catodo (-) via R330', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'LED VERDE', 'Anodo (+)', 'D10', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'LED VERDE', 'Catodo (-) via R330', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'PULSADOR PEATON', 'Pin 1', 'D2', 'INPUT_PULLUP', 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'PULSADOR PEATON', 'Pin 2', 'GND', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'BUZZER PASIVO', '+', 'D7', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'BUZZER PASIVO', '-', 'GND', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'SENSOR HC-SR04', 'VCC', '5V', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'SENSOR HC-SR04', 'Trig', 'D9', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'SENSOR HC-SR04', 'Echo', 'D10', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'PWM', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'SERVOMOTOR SG90', 'VCC', '5V', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'LED (tapa abierta)', 'Anodo (+) via R330', 'D8', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'LED (tapa abierta)', 'Catodo (-)', 'GND', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'SENSOR HUMEDAD SUELO', 'VCC', '5V', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'SENSOR HUMEDAD SUELO', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'A0', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'MODULO RELE 1 CANAL', 'IN', 'D7', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'MODULO RELE 1 CANAL', 'VCC', '5V', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'MODULO RELE 1 CANAL', 'GND', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'BOMBA DE AGUA 5V', '+ : va al NO del rele (comparte el USB-V8 con la placa)', 'USB-V8 compartido', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'BOMBA DE AGUA 5V', '- (GND comun con el Nano)', 'GND', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'BUZZER ACTIVO', '+', 'D8', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'BUZZER ACTIVO', '-', 'GND', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'LED ROJO (riego activo)', 'Anodo (+) via R330', 'D9', NULL, 11),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'LED ROJO (riego activo)', 'Catodo (-)', 'GND', NULL, 12),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'LED AMARILLO (alerta)', 'Anodo (+) via R330', 'D10', NULL, 13),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'LED AMARILLO (alerta)', 'Catodo (-)', 'GND', NULL, 14),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'LED VERDE (humedad ok)', 'Anodo (+) via R330', 'D11', NULL, 15),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'LED VERDE (humedad ok)', 'Catodo (-)', 'GND', NULL, 16),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'PULSADOR MANUAL', 'Pin 1', 'D2', 'INPUT_PULLUP', 17),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'PULSADOR MANUAL', 'Pin 2', 'GND', NULL, 18),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'POTENCIOMETRO (umbral)', 'Terminal A', '5V', NULL, 19),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'POTENCIOMETRO (umbral)', 'Wiper', 'A1', NULL, 20),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'POTENCIOMETRO (umbral)', 'Terminal B', 'GND', NULL, 21),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'LDR + R1K (divisor)', 'Punto medio', 'GPIO0', 'ADC', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'POTENCIOMETRO', 'Terminal A', '3V3', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'POTENCIOMETRO', 'Wiper', 'GPIO1', 'ADC', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'POTENCIOMETRO', 'Terminal B', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'SENSOR DHT11', 'VCC', '3V3', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'SENSOR DHT11', 'GND', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'SENSOR DHT11', 'DATA', 'GPIO3', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'BUZZER ACTIVO', '+', 'GPIO4', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'BUZZER ACTIVO', '-', 'GND', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'LED DE ALERTA', 'Anodo (+) via R330', 'GPIO5', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'LED DE ALERTA', 'Catodo (-)', 'GND', NULL, 11),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'PULSADOR (modo)', 'Pin 1', 'GPIO10', 'INPUT_PULLUP', 12),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'PULSADOR (modo)', 'Pin 2', 'GND', NULL, 13),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'SENSOR PIR HC-SR501', 'VCC', 'VIN (5V)', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'SENSOR PIR HC-SR501', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'SENSOR PIR HC-SR501', 'OUT', 'GPIO27', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'SENSOR LDR (modulo)', 'AOUT', 'GPIO34', 'ADC1, solo entrada', 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'RELE C/OPTOACOPLADOR', 'VCC', 'VIN (5V)', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'RELE C/OPTOACOPLADOR', 'GND', 'GND', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'LED DE CONFIRMACION', 'Anodo (+) via R330', 'GPIO25', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'LED DE CONFIRMACION', 'Catodo (-)', 'GND', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'PULSADOR MANUAL', 'Pin 1', 'GPIO14', 'INPUT_PULLUP', 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'PULSADOR MANUAL', 'Pin 2', 'GND', NULL, 11),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'LCD 16x2 + I2C', 'SDA', 'GPIO21', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'LCD 16x2 + I2C', 'SCL', 'GPIO22', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'LCD 16x2 + I2C', 'VCC', 'VIN (5V)', 'sin conversor de nivel, directo', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'LCD 16x2 + I2C', 'GND', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR DHT11', 'VCC', '3V3', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR DHT11', 'GND', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR DHT11', 'DATA', 'GPIO4', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR HC-SR04P', 'VCC', '5V', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR HC-SR04P', 'GND', 'GND', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR HC-SR04P', 'Trig', 'GPIO17', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR HC-SR04P', 'Echo', 'GPIO16', NULL, 11),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'SENSOR LDR (modulo)', 'AOUT', 'GPIO32', 'ADC1', 12),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'BUZZER ACTIVO', '+', 'GPIO19', NULL, 13),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'BUZZER ACTIVO', '-', 'GND', NULL, 14),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'LED DE ALERTA', 'Anodo (+) via R330', 'GPIO18', NULL, 15),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'LED DE ALERTA', 'Catodo (-)', 'GND', NULL, 16),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'SENSOR IR FC-51', 'OUT', 'D4', 'LOW = detecta', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'LED AZUL (alerta)', 'Anodo (+) via R330', 'D5', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'LED AZUL (alerta)', 'Catodo (-)', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'BUZZER PASIVO', '+', 'D7', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'BUZZER PASIVO', '-', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'alarma'), 'PULSADOR (sensor puerta)', 'Pin 1', 'D2', 'INPUT_PULLUP, igual que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'alarma'), 'LED ROJO', 'Anodo (+)', 'D8', 'mismo pin que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'alarma'), 'BUZZER PASIVO', '+', 'D7', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'POTENCIOMETRO', 'Terminal A', '5V', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'POTENCIOMETRO', 'Wiper', 'A0', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'POTENCIOMETRO', 'Terminal B', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'PWM', 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'SERVOMOTOR SG90', 'VCC', '5V', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'PULSADOR DO', 'Pin 1 (pin 2 a GND)', 'D2', 'INPUT_PULLUP', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'PULSADOR RE', 'Pin 1 (pin 2 a GND)', 'D3', 'INPUT_PULLUP', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'PULSADOR MI (pull-down)', 'Pin 1 + R10k a GND', 'D4', 'INPUT, presionado = HIGH', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'PULSADOR MI (pull-down)', 'Pin 2', '5V', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'BUZZER PASIVO', '+', 'D8', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'SENSOR HC-SR04', 'Trig', 'D9', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'SENSOR HC-SR04', 'Echo', 'D10', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'LED (contador)', 'Anodo (+)', 'D8', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'SENSOR HC-SR04', 'Trig', 'D9', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'SENSOR HC-SR04', 'Echo', 'D10', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'LED (confirmacion)', 'Anodo (+)', 'D8', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'SENSOR HC-SR04', 'Trig', 'D9', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'SENSOR HC-SR04', 'Echo', 'D10', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'LED (puerta abierta)', 'Anodo (+)', 'D8', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'SENSOR HC-SR04', 'Trig', 'D9', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'SENSOR HC-SR04', 'Echo', 'D10', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'LED (alarma)', 'Anodo (+)', 'D8', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'POTENCIOMETRO (sensibilidad)', 'Terminal A', '5V', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'POTENCIOMETRO (sensibilidad)', 'Wiper', 'A0', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'POTENCIOMETRO (sensibilidad)', 'Terminal B', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'PULSADOR (on/off)', 'Pin 1', 'D2', 'INPUT_PULLUP', 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'SENSOR DE NIVEL (humedad)', 'AOUT', 'A0', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'MODULO RELE 1 CANAL', 'IN', 'D7', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'LED ROJO (nivel bajo)', 'Anodo (+)', 'D9', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'LED VERDE (nivel ok)', 'Anodo (+)', 'D11', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'A0', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'POTENCIOMETRO (umbral)', 'Wiper', 'A1', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'MODULO RELE 1 CANAL', 'IN', 'D7', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'LED (estado)', 'Anodo (+)', 'D9', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'PULSADOR MANUAL', 'Pin 1', 'D2', 'INPUT_PULLUP', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'A0', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'MODULO RELE 1 CANAL', 'IN', 'D7', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'LED VERDE (cultivo ok)', 'Anodo (+)', 'D11', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'luz-automatica'), 'LDR + R1K (divisor)', 'Punto medio', 'GPIO0', 'ADC, mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'luz-automatica'), 'LED (lampara)', 'Anodo (+)', 'GPIO5', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'contador-visitas'), 'SENSOR IR FC-51', 'OUT', 'GPIO3', 'LOW = detecta', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'contador-visitas'), 'BUZZER ACTIVO', '+', 'GPIO4', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'alarma-temperatura'), 'SENSOR DHT11', 'DATA', 'GPIO3', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'alarma-temperatura'), 'POTENCIOMETRO (umbral)', 'Wiper', 'GPIO1', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'alarma-temperatura'), 'LED ROJO', 'Anodo (+)', 'GPIO5', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'alarma-temperatura'), 'BUZZER ACTIVO', '+', 'GPIO4', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'registro-datos-nube'), 'SENSOR DHT11', 'DATA', 'GPIO3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'registro-datos-nube'), 'LDR + R1K (divisor)', 'Punto medio', 'GPIO0', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'encendido-remoto-luces'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'automatizacion-ventiladores'), 'SENSOR PIR HC-SR501', 'OUT', 'GPIO27', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'automatizacion-ventiladores'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'control-desde-celular'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'control-desde-celular'), 'SENSOR PIR HC-SR501', 'OUT', 'GPIO27', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'SENSOR LDR (modulo)', 'AOUT', 'GPIO32', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'LED (luz de la casa)', 'Anodo (+)', 'GPIO18', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'BUZZER ACTIVO', '+', 'GPIO19', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'SENSOR HC-SR04P', 'Trig', 'GPIO17', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'SENSOR HC-SR04P', 'Echo', 'GPIO16', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'LED ROJO (alarma)', 'Anodo (+)', 'GPIO18', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'BUZZER ACTIVO', '+', 'GPIO19', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-remoto-internet'), 'SENSOR DHT11', 'DATA', 'GPIO4', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-remoto-internet'), 'SENSOR LDR (modulo)', 'AOUT', 'GPIO32', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'dashboard-mqtt'), 'SENSOR DHT11', 'DATA', 'GPIO4', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'SENSOR DHT11', 'DATA', 'GPIO4', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'SENSOR HC-SR04P', 'Trig', 'GPIO17', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'SENSOR HC-SR04P', 'Echo', 'GPIO16', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'LED ROJO (alerta)', 'Anodo (+)', 'GPIO18', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'BUZZER ACTIVO', '+', 'GPIO19', NULL, 5);

-- ============================================================
-- 5. KIT_ESQUEMAS
-- ============================================================
INSERT INTO kit_esquemas (proyecto_id, tipo, contenido, version) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="650" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Semáforo inteligente con paso peatonal</text><rect x="30" y="60" width="160" height="530" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="510" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="552" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="564" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="540" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="540" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="325" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED ROJO</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Anodo (+)</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">Catodo (-) via R330</text><rect x="760" y="170" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="190" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED AMARILLO</text><circle cx="760" cy="214" r="3.5" fill="#1f2937"/><text x="770" y="218" font-size="10" font-style="normal" fill="#44403c">Anodo (+)</text><circle cx="760" cy="234" r="3.5" fill="#1f2937"/><text x="770" y="238" font-size="10" font-style="normal" fill="#44403c">Catodo (-) via R330</text><rect x="760" y="280" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="300" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED VERDE</text><circle cx="760" cy="324" r="3.5" fill="#1f2937"/><text x="770" y="328" font-size="10" font-style="normal" fill="#44403c">Anodo (+)</text><circle cx="760" cy="344" r="3.5" fill="#1f2937"/><text x="770" y="348" font-size="10" font-style="normal" fill="#44403c">Catodo (-) via R330</text><rect x="760" y="390" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="410" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR PEATON</text><circle cx="760" cy="434" r="3.5" fill="#1f2937"/><text x="770" y="438" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><circle cx="760" cy="454" r="3.5" fill="#1f2937"/><text x="770" y="458" font-size="10" font-style="normal" fill="#44403c">Pin 2</text><rect x="760" y="500" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="520" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER PASIVO</text><circle cx="760" cy="544" r="3.5" fill="#1f2937"/><text x="770" y="548" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="760" cy="564" r="3.5" fill="#1f2937"/><text x="770" y="568" font-size="10" font-style="normal" fill="#44403c">-</text><circle cx="190" cy="108.18181818181819" r="3.5" fill="#2563eb"/><path d="M 190 108.18181818181819 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="103.18181818181819" font-size="10" font-weight="bold" fill="#2563eb">D8</text><circle cx="190" cy="156.36363636363637" r="3.5" fill="#111827"/><path d="M 190 156.36363636363637 H 214 V 124 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="151.36363636363637" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="204.54545454545453" r="3.5" fill="#ea580c"/><path d="M 190 204.54545454545453 H 218 V 214 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="199.54545454545453" font-size="10" font-weight="bold" fill="#ea580c">D9</text><circle cx="190" cy="252.72727272727272" r="3.5" fill="#111827"/><path d="M 190 252.72727272727272 H 222 V 234 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="247.72727272727272" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="300.9090909090909" r="3.5" fill="#0891b2"/><path d="M 190 300.9090909090909 H 226 V 324 H 760" fill="none" stroke="#0891b2" stroke-width="2.2"/><text x="196" y="295.9090909090909" font-size="10" font-weight="bold" fill="#0891b2">D10</text><circle cx="190" cy="349.09090909090907" r="3.5" fill="#111827"/><path d="M 190 349.09090909090907 H 210 V 344 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="344.09090909090907" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="397.27272727272725" r="3.5" fill="#db2777"/><path d="M 190 397.27272727272725 H 214 V 434 H 760" fill="none" stroke="#db2777" stroke-width="2.2"/><text x="196" y="392.27272727272725" font-size="10" font-weight="bold" fill="#db2777">D2</text><text x="220" y="415.6363636363636" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="445.45454545454544" r="3.5" fill="#111827"/><path d="M 190 445.45454545454544 H 218 V 454 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="440.45454545454544" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="493.6363636363636" r="3.5" fill="#2563eb"/><path d="M 190 493.6363636363636 H 222 V 544 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="488.6363636363636" font-size="10" font-weight="bold" fill="#2563eb">D7</text><circle cx="190" cy="541.8181818181818" r="3.5" fill="#111827"/><path d="M 190 541.8181818181818 H 226 V 564 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="536.8181818181818" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="620" width="14" height="14" fill="#dc2626"/><text x="50" y="632" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="620" width="14" height="14" fill="#111827"/><text x="250" y="632" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="620" width="14" height="14" fill="#2563eb"/><text x="400" y="632" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 490" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="490" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Basurero inteligente con apertura automática</text><rect x="30" y="60" width="160" height="370" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="350" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="392" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="404" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="380" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="380" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="245" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="128" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR HC-SR04</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="760" cy="144" r="3.5" fill="#1f2937"/><text x="770" y="148" font-size="10" font-style="normal" fill="#44403c">Trig</text><circle cx="760" cy="164" r="3.5" fill="#1f2937"/><text x="770" y="168" font-size="10" font-style="normal" fill="#44403c">Echo</text><rect x="760" y="210" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="230" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SERVOMOTOR SG90</text><circle cx="760" cy="254" r="3.5" fill="#1f2937"/><text x="770" y="258" font-size="10" font-style="normal" fill="#44403c">Senal</text><circle cx="760" cy="274" r="3.5" fill="#1f2937"/><text x="770" y="278" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="294" r="3.5" fill="#1f2937"/><text x="770" y="298" font-size="10" font-style="normal" fill="#44403c">GND</text><rect x="760" y="340" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="360" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED (tapa abierta)</text><circle cx="760" cy="384" r="3.5" fill="#1f2937"/><text x="770" y="388" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="404" r="3.5" fill="#1f2937"/><text x="770" y="408" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><circle cx="190" cy="97" r="3.5" fill="#dc2626"/><path d="M 190 97 H 210 V 104 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="92" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="134" r="3.5" fill="#111827"/><path d="M 190 134 H 214 V 124 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="129" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="171" r="3.5" fill="#ea580c"/><path d="M 190 171 H 218 V 144 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="166" font-size="10" font-weight="bold" fill="#ea580c">D9</text><circle cx="190" cy="208" r="3.5" fill="#9333ea"/><path d="M 190 208 H 222 V 164 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="203" font-size="10" font-weight="bold" fill="#9333ea">D10</text><circle cx="190" cy="245" r="3.5" fill="#0891b2"/><path d="M 190 245 H 226 V 254 H 760" fill="none" stroke="#0891b2" stroke-width="2.2"/><text x="196" y="240" font-size="10" font-weight="bold" fill="#0891b2">D6</text><text x="232" y="249.5" font-size="8.5" fill="#57534e">PWM</text><circle cx="190" cy="282" r="3.5" fill="#dc2626"/><path d="M 190 282 H 210 V 274 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="277" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="319" r="3.5" fill="#111827"/><path d="M 190 319 H 214 V 294 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="314" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="356" r="3.5" fill="#4f46e5"/><path d="M 190 356 H 218 V 384 H 760" fill="none" stroke="#4f46e5" stroke-width="2.2"/><text x="196" y="351" font-size="10" font-weight="bold" fill="#4f46e5">D8</text><circle cx="190" cy="393" r="3.5" fill="#111827"/><path d="M 190 393 H 222 V 404 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="388" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="460" width="14" height="14" fill="#dc2626"/><text x="50" y="472" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="460" width="14" height="14" fill="#111827"/><text x="250" y="472" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="460" width="14" height="14" fill="#2563eb"/><text x="400" y="472" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1150" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="1150" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Sistema de riego automático para plantas</text><rect x="30" y="60" width="160" height="1030" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">Micro-USB (CH340)</text><rect x="300" y="70" width="400" height="1010" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="1052" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="1064" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="1040" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="1040" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="575" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR HUMEDAD SUELO</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="760" cy="144" r="3.5" fill="#1f2937"/><text x="770" y="148" font-size="10" font-style="normal" fill="#44403c">AOUT</text><rect x="760" y="190" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="210" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">MODULO RELE 1 CANAL</text><circle cx="760" cy="234" r="3.5" fill="#1f2937"/><text x="770" y="238" font-size="10" font-style="normal" fill="#44403c">IN</text><circle cx="760" cy="254" r="3.5" fill="#1f2937"/><text x="770" y="258" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="274" r="3.5" fill="#1f2937"/><text x="770" y="278" font-size="10" font-style="normal" fill="#44403c">GND</text><rect x="760" y="320" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="340" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BOMBA DE AGUA 5V</text><text x="770" y="368" font-size="10" font-style="italic" fill="#44403c">+ : va al NO del rele (comparte el USB-V8 con la placa)</text><circle cx="760" cy="384" r="3.5" fill="#1f2937"/><text x="770" y="388" font-size="10" font-style="normal" fill="#44403c">- (GND comun con el Nano)</text><rect x="760" y="430" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="450" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="474" r="3.5" fill="#1f2937"/><text x="770" y="478" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="760" cy="494" r="3.5" fill="#1f2937"/><text x="770" y="498" font-size="10" font-style="normal" fill="#44403c">-</text><rect x="760" y="540" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="560" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED ROJO (riego activo)</text><circle cx="760" cy="584" r="3.5" fill="#1f2937"/><text x="770" y="588" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="604" r="3.5" fill="#1f2937"/><text x="770" y="608" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><rect x="760" y="650" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="670" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED AMARILLO (alerta)</text><circle cx="760" cy="694" r="3.5" fill="#1f2937"/><text x="770" y="698" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="714" r="3.5" fill="#1f2937"/><text x="770" y="718" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><rect x="760" y="760" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="780" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED VERDE (humedad ok)</text><circle cx="760" cy="804" r="3.5" fill="#1f2937"/><text x="770" y="808" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="824" r="3.5" fill="#1f2937"/><text x="770" y="828" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><rect x="760" y="870" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="890" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR MANUAL</text><circle cx="760" cy="914" r="3.5" fill="#1f2937"/><text x="770" y="918" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><circle cx="760" cy="934" r="3.5" fill="#1f2937"/><text x="770" y="938" font-size="10" font-style="normal" fill="#44403c">Pin 2</text><rect x="760" y="980" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="1000" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">POTENCIOMETRO (umbral)</text><circle cx="760" cy="1024" r="3.5" fill="#1f2937"/><text x="770" y="1028" font-size="10" font-style="normal" fill="#44403c">Terminal A</text><circle cx="760" cy="1044" r="3.5" fill="#1f2937"/><text x="770" y="1048" font-size="10" font-style="normal" fill="#44403c">Wiper</text><circle cx="760" cy="1064" r="3.5" fill="#1f2937"/><text x="770" y="1068" font-size="10" font-style="normal" fill="#44403c">Terminal B</text><circle cx="190" cy="109.04761904761905" r="3.5" fill="#dc2626"/><path d="M 190 109.04761904761905 H 210 V 104 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="104.04761904761905" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="158.0952380952381" r="3.5" fill="#111827"/><path d="M 190 158.0952380952381 H 214 V 124 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="153.0952380952381" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="207.14285714285717" r="3.5" fill="#ea580c"/><path d="M 190 207.14285714285717 H 218 V 144 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="202.14285714285717" font-size="10" font-weight="bold" fill="#ea580c">A0</text><circle cx="190" cy="256.1904761904762" r="3.5" fill="#9333ea"/><path d="M 190 256.1904761904762 H 222 V 234 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="251.1904761904762" font-size="10" font-weight="bold" fill="#9333ea">D7</text><circle cx="190" cy="305.23809523809524" r="3.5" fill="#dc2626"/><path d="M 190 305.23809523809524 H 226 V 254 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="300.23809523809524" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="354.28571428571433" r="3.5" fill="#111827"/><path d="M 190 354.28571428571433 H 210 V 274 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="349.28571428571433" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="403.33333333333337" r="3.5" fill="#111827"/><path d="M 190 403.33333333333337 H 214 V 384 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="398.33333333333337" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="452.3809523809524" r="3.5" fill="#4f46e5"/><path d="M 190 452.3809523809524 H 218 V 474 H 760" fill="none" stroke="#4f46e5" stroke-width="2.2"/><text x="196" y="447.3809523809524" font-size="10" font-weight="bold" fill="#4f46e5">D8</text><circle cx="190" cy="501.42857142857144" r="3.5" fill="#111827"/><path d="M 190 501.42857142857144 H 222 V 494 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="496.42857142857144" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="550.4761904761905" r="3.5" fill="#16a34a"/><path d="M 190 550.4761904761905 H 226 V 584 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="545.4761904761905" font-size="10" font-weight="bold" fill="#16a34a">D9</text><circle cx="190" cy="599.5238095238095" r="3.5" fill="#111827"/><path d="M 190 599.5238095238095 H 210 V 604 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="594.5238095238095" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="648.5714285714287" r="3.5" fill="#9333ea"/><path d="M 190 648.5714285714287 H 214 V 694 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="643.5714285714287" font-size="10" font-weight="bold" fill="#9333ea">D10</text><circle cx="190" cy="697.6190476190477" r="3.5" fill="#111827"/><path d="M 190 697.6190476190477 H 218 V 714 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="692.6190476190477" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="746.6666666666667" r="3.5" fill="#ca8a04"/><path d="M 190 746.6666666666667 H 222 V 804 H 760" fill="none" stroke="#ca8a04" stroke-width="2.2"/><text x="196" y="741.6666666666667" font-size="10" font-weight="bold" fill="#ca8a04">D11</text><circle cx="190" cy="795.7142857142858" r="3.5" fill="#111827"/><path d="M 190 795.7142857142858 H 226 V 824 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="790.7142857142858" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="844.7619047619048" r="3.5" fill="#4f46e5"/><path d="M 190 844.7619047619048 H 210 V 914 H 760" fill="none" stroke="#4f46e5" stroke-width="2.2"/><text x="196" y="839.7619047619048" font-size="10" font-weight="bold" fill="#4f46e5">D2</text><text x="216" y="879.3809523809524" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="893.8095238095239" r="3.5" fill="#111827"/><path d="M 190 893.8095238095239 H 214 V 934 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="888.8095238095239" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="942.8571428571429" r="3.5" fill="#dc2626"/><path d="M 190 942.8571428571429 H 218 V 1024 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="937.8571428571429" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="991.9047619047619" r="3.5" fill="#ea580c"/><path d="M 190 991.9047619047619 H 222 V 1044 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="986.9047619047619" font-size="10" font-weight="bold" fill="#ea580c">A1</text><circle cx="190" cy="1040.952380952381" r="3.5" fill="#111827"/><path d="M 190 1040.952380952381 H 226 V 1064 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="1035.952380952381" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="1120" width="14" height="14" fill="#dc2626"/><text x="50" y="1132" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="1120" width="14" height="14" fill="#111827"/><text x="250" y="1132" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="1120" width="14" height="14" fill="#2563eb"/><text x="400" y="1132" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 780" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="780" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Estación meteorológica con monitoreo ambiental</text><rect x="30" y="60" width="160" height="660" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">3.3V logic</text><rect x="300" y="70" width="400" height="640" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="682" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="694" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="670" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="670" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="390" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LDR + R1K (divisor)</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Punto medio</text><rect x="760" y="150" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">POTENCIOMETRO</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">Terminal A</text><circle cx="760" cy="214" r="3.5" fill="#1f2937"/><text x="770" y="218" font-size="10" font-style="normal" fill="#44403c">Wiper</text><circle cx="760" cy="234" r="3.5" fill="#1f2937"/><text x="770" y="238" font-size="10" font-style="normal" fill="#44403c">Terminal B</text><rect x="760" y="280" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="300" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR DHT11</text><circle cx="760" cy="324" r="3.5" fill="#1f2937"/><text x="770" y="328" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="344" r="3.5" fill="#1f2937"/><text x="770" y="348" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="760" cy="364" r="3.5" fill="#1f2937"/><text x="770" y="368" font-size="10" font-style="normal" fill="#44403c">DATA</text><rect x="760" y="410" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="430" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="454" r="3.5" fill="#1f2937"/><text x="770" y="458" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="760" cy="474" r="3.5" fill="#1f2937"/><text x="770" y="478" font-size="10" font-style="normal" fill="#44403c">-</text><rect x="760" y="520" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="540" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED DE ALERTA</text><circle cx="760" cy="564" r="3.5" fill="#1f2937"/><text x="770" y="568" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="584" r="3.5" fill="#1f2937"/><text x="770" y="588" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><rect x="760" y="630" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="650" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR (modo)</text><circle cx="760" cy="674" r="3.5" fill="#1f2937"/><text x="770" y="678" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><circle cx="760" cy="694" r="3.5" fill="#1f2937"/><text x="770" y="698" font-size="10" font-style="normal" fill="#44403c">Pin 2</text><circle cx="190" cy="107.14285714285714" r="3.5" fill="#2563eb"/><path d="M 190 107.14285714285714 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="102.14285714285714" font-size="10" font-weight="bold" fill="#2563eb">GPIO0</text><text x="216" y="105.57142857142857" font-size="8.5" fill="#57534e">ADC</text><circle cx="190" cy="154.28571428571428" r="3.5" fill="#dc2626"/><path d="M 190 154.28571428571428 H 214 V 194 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="149.28571428571428" font-size="10" font-weight="bold" fill="#dc2626">3V3</text><circle cx="190" cy="201.42857142857144" r="3.5" fill="#ea580c"/><path d="M 190 201.42857142857144 H 218 V 214 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="196.42857142857144" font-size="10" font-weight="bold" fill="#ea580c">GPIO1</text><text x="224" y="207.71428571428572" font-size="8.5" fill="#57534e">ADC</text><circle cx="190" cy="248.57142857142858" r="3.5" fill="#111827"/><path d="M 190 248.57142857142858 H 222 V 234 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="243.57142857142858" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="295.7142857142857" r="3.5" fill="#dc2626"/><path d="M 190 295.7142857142857 H 226 V 324 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="290.7142857142857" font-size="10" font-weight="bold" fill="#dc2626">3V3</text><circle cx="190" cy="342.8571428571429" r="3.5" fill="#111827"/><path d="M 190 342.8571428571429 H 210 V 344 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="337.8571428571429" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="390" r="3.5" fill="#db2777"/><path d="M 190 390 H 214 V 364 H 760" fill="none" stroke="#db2777" stroke-width="2.2"/><text x="196" y="385" font-size="10" font-weight="bold" fill="#db2777">GPIO3</text><circle cx="190" cy="437.14285714285717" r="3.5" fill="#4f46e5"/><path d="M 190 437.14285714285717 H 218 V 454 H 760" fill="none" stroke="#4f46e5" stroke-width="2.2"/><text x="196" y="432.14285714285717" font-size="10" font-weight="bold" fill="#4f46e5">GPIO4</text><circle cx="190" cy="484.28571428571433" r="3.5" fill="#111827"/><path d="M 190 484.28571428571433 H 222 V 474 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="479.28571428571433" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="531.4285714285714" r="3.5" fill="#16a34a"/><path d="M 190 531.4285714285714 H 226 V 564 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="526.4285714285714" font-size="10" font-weight="bold" fill="#16a34a">GPIO5</text><circle cx="190" cy="578.5714285714286" r="3.5" fill="#111827"/><path d="M 190 578.5714285714286 H 210 V 584 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="573.5714285714286" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="625.7142857142858" r="3.5" fill="#9333ea"/><path d="M 190 625.7142857142858 H 214 V 674 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="620.7142857142858" font-size="10" font-weight="bold" fill="#9333ea">GPIO10</text><text x="220" y="649.8571428571429" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="672.8571428571429" r="3.5" fill="#111827"/><path d="M 190 672.8571428571429 H 218 V 694 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="667.8571428571429" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="750" width="14" height="14" fill="#dc2626"/><text x="50" y="762" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="750" width="14" height="14" fill="#111827"/><text x="250" y="762" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="750" width="14" height="14" fill="#2563eb"/><text x="400" y="762" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 670" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="670" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Control inteligente de dispositivos del hogar</text><rect x="30" y="60" width="160" height="550" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">30 pines</text><rect x="300" y="70" width="400" height="530" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="572" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="584" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="560" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="560" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="335" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR PIR HC-SR501</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="760" cy="144" r="3.5" fill="#1f2937"/><text x="770" y="148" font-size="10" font-style="normal" fill="#44403c">OUT</text><rect x="760" y="190" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="210" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR LDR (modulo)</text><circle cx="760" cy="234" r="3.5" fill="#1f2937"/><text x="770" y="238" font-size="10" font-style="normal" fill="#44403c">AOUT</text><rect x="760" y="280" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="300" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">RELE C/OPTOACOPLADOR</text><circle cx="760" cy="324" r="3.5" fill="#1f2937"/><text x="770" y="328" font-size="10" font-style="normal" fill="#44403c">IN</text><circle cx="760" cy="344" r="3.5" fill="#1f2937"/><text x="770" y="348" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="364" r="3.5" fill="#1f2937"/><text x="770" y="368" font-size="10" font-style="normal" fill="#44403c">GND</text><rect x="760" y="410" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="430" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED DE CONFIRMACION</text><circle cx="760" cy="454" r="3.5" fill="#1f2937"/><text x="770" y="458" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="474" r="3.5" fill="#1f2937"/><text x="770" y="478" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><rect x="760" y="520" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="540" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR MANUAL</text><circle cx="760" cy="564" r="3.5" fill="#1f2937"/><text x="770" y="568" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><circle cx="760" cy="584" r="3.5" fill="#1f2937"/><text x="770" y="588" font-size="10" font-style="normal" fill="#44403c">Pin 2</text><circle cx="190" cy="105.83333333333334" r="3.5" fill="#dc2626"/><path d="M 190 105.83333333333334 H 210 V 104 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="100.83333333333334" font-size="10" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="190" cy="151.66666666666669" r="3.5" fill="#111827"/><path d="M 190 151.66666666666669 H 214 V 124 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="146.66666666666669" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="197.5" r="3.5" fill="#ea580c"/><path d="M 190 197.5 H 218 V 144 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="192.5" font-size="10" font-weight="bold" fill="#ea580c">GPIO27</text><circle cx="190" cy="243.33333333333334" r="3.5" fill="#9333ea"/><path d="M 190 243.33333333333334 H 222 V 234 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="238.33333333333334" font-size="10" font-weight="bold" fill="#9333ea">GPIO34</text><text x="228" y="238.66666666666669" font-size="8.5" fill="#57534e">ADC1, solo entrada</text><circle cx="190" cy="289.1666666666667" r="3.5" fill="#0891b2"/><path d="M 190 289.1666666666667 H 226 V 324 H 760" fill="none" stroke="#0891b2" stroke-width="2.2"/><text x="196" y="284.1666666666667" font-size="10" font-weight="bold" fill="#0891b2">GPIO26</text><circle cx="190" cy="335" r="3.5" fill="#dc2626"/><path d="M 190 335 H 210 V 344 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="330" font-size="10" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="190" cy="380.83333333333337" r="3.5" fill="#111827"/><path d="M 190 380.83333333333337 H 214 V 364 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="375.83333333333337" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="426.6666666666667" r="3.5" fill="#4f46e5"/><path d="M 190 426.6666666666667 H 218 V 454 H 760" fill="none" stroke="#4f46e5" stroke-width="2.2"/><text x="196" y="421.6666666666667" font-size="10" font-weight="bold" fill="#4f46e5">GPIO25</text><circle cx="190" cy="472.5" r="3.5" fill="#111827"/><path d="M 190 472.5 H 222 V 474 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="467.5" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="518.3333333333334" r="3.5" fill="#16a34a"/><path d="M 190 518.3333333333334 H 226 V 564 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="513.3333333333334" font-size="10" font-weight="bold" fill="#16a34a">GPIO14</text><text x="232" y="541.1666666666667" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="564.1666666666667" r="3.5" fill="#111827"/><path d="M 190 564.1666666666667 H 210 V 584 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="559.1666666666667" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="640" width="14" height="14" fill="#dc2626"/><text x="50" y="652" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="640" width="14" height="14" fill="#111827"/><text x="250" y="652" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="640" width="14" height="14" fill="#2563eb"/><text x="400" y="652" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 840" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="840" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Sistema inteligente de monitoreo y automatización</text><rect x="30" y="60" width="160" height="720" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">30 pines</text><rect x="300" y="70" width="400" height="700" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="742" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="754" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="730" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="730" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="420" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="128" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LCD 16x2 + I2C</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">SDA</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">SCL</text><circle cx="760" cy="144" r="3.5" fill="#1f2937"/><text x="770" y="148" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="164" r="3.5" fill="#1f2937"/><text x="770" y="168" font-size="10" font-style="normal" fill="#44403c">GND</text><rect x="760" y="210" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="230" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR DHT11</text><circle cx="760" cy="254" r="3.5" fill="#1f2937"/><text x="770" y="258" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="274" r="3.5" fill="#1f2937"/><text x="770" y="278" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="760" cy="294" r="3.5" fill="#1f2937"/><text x="770" y="298" font-size="10" font-style="normal" fill="#44403c">DATA</text><rect x="760" y="340" width="210" height="128" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="360" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR HC-SR04P</text><circle cx="760" cy="384" r="3.5" fill="#1f2937"/><text x="770" y="388" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="404" r="3.5" fill="#1f2937"/><text x="770" y="408" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="760" cy="424" r="3.5" fill="#1f2937"/><text x="770" y="428" font-size="10" font-style="normal" fill="#44403c">Trig</text><circle cx="760" cy="444" r="3.5" fill="#1f2937"/><text x="770" y="448" font-size="10" font-style="normal" fill="#44403c">Echo</text><rect x="760" y="490" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="510" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR LDR (modulo)</text><circle cx="760" cy="534" r="3.5" fill="#1f2937"/><text x="770" y="538" font-size="10" font-style="normal" fill="#44403c">AOUT</text><rect x="760" y="580" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="600" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="624" r="3.5" fill="#1f2937"/><text x="770" y="628" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="760" cy="644" r="3.5" fill="#1f2937"/><text x="770" y="648" font-size="10" font-style="normal" fill="#44403c">-</text><rect x="760" y="690" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="710" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED DE ALERTA</text><circle cx="760" cy="734" r="3.5" fill="#1f2937"/><text x="770" y="738" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="754" r="3.5" fill="#1f2937"/><text x="770" y="758" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><circle cx="190" cy="102.35294117647058" r="3.5" fill="#2563eb"/><path d="M 190 102.35294117647058 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="97.35294117647058" font-size="10" font-weight="bold" fill="#2563eb">GPIO21</text><circle cx="190" cy="144.70588235294116" r="3.5" fill="#16a34a"/><path d="M 190 144.70588235294116 H 214 V 124 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="139.70588235294116" font-size="10" font-weight="bold" fill="#16a34a">GPIO22</text><circle cx="190" cy="187.05882352941177" r="3.5" fill="#dc2626"/><path d="M 190 187.05882352941177 H 218 V 144 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="182.05882352941177" font-size="10" font-weight="bold" fill="#dc2626">VIN (5V)</text><text x="224" y="165.52941176470588" font-size="8.5" fill="#57534e">sin conversor de nivel, directo</text><circle cx="190" cy="229.41176470588235" r="3.5" fill="#111827"/><path d="M 190 229.41176470588235 H 222 V 164 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="224.41176470588235" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="271.7647058823529" r="3.5" fill="#dc2626"/><path d="M 190 271.7647058823529 H 226 V 254 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="266.7647058823529" font-size="10" font-weight="bold" fill="#dc2626">3V3</text><circle cx="190" cy="314.11764705882354" r="3.5" fill="#111827"/><path d="M 190 314.11764705882354 H 210 V 274 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="309.11764705882354" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="356.4705882352941" r="3.5" fill="#db2777"/><path d="M 190 356.4705882352941 H 214 V 294 H 760" fill="none" stroke="#db2777" stroke-width="2.2"/><text x="196" y="351.4705882352941" font-size="10" font-weight="bold" fill="#db2777">GPIO4</text><circle cx="190" cy="398.8235294117647" r="3.5" fill="#dc2626"/><path d="M 190 398.8235294117647 H 218 V 384 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="393.8235294117647" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="441.1764705882353" r="3.5" fill="#111827"/><path d="M 190 441.1764705882353 H 222 V 404 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="436.1764705882353" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="483.52941176470586" r="3.5" fill="#16a34a"/><path d="M 190 483.52941176470586 H 226 V 424 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="478.52941176470586" font-size="10" font-weight="bold" fill="#16a34a">GPIO17</text><circle cx="190" cy="525.8823529411765" r="3.5" fill="#ea580c"/><path d="M 190 525.8823529411765 H 210 V 444 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="520.8823529411765" font-size="10" font-weight="bold" fill="#ea580c">GPIO16</text><circle cx="190" cy="568.2352941176471" r="3.5" fill="#9333ea"/><path d="M 190 568.2352941176471 H 214 V 534 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="563.2352941176471" font-size="10" font-weight="bold" fill="#9333ea">GPIO32</text><text x="220" y="551.1176470588235" font-size="8.5" fill="#57534e">ADC1</text><circle cx="190" cy="610.5882352941177" r="3.5" fill="#0891b2"/><path d="M 190 610.5882352941177 H 218 V 624 H 760" fill="none" stroke="#0891b2" stroke-width="2.2"/><text x="196" y="605.5882352941177" font-size="10" font-weight="bold" fill="#0891b2">GPIO19</text><circle cx="190" cy="652.9411764705882" r="3.5" fill="#111827"/><path d="M 190 652.9411764705882 H 222 V 644 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="647.9411764705882" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="695.2941176470588" r="3.5" fill="#db2777"/><path d="M 190 695.2941176470588 H 226 V 734 H 760" fill="none" stroke="#db2777" stroke-width="2.2"/><text x="196" y="690.2941176470588" font-size="10" font-weight="bold" fill="#db2777">GPIO18</text><circle cx="190" cy="737.6470588235294" r="3.5" fill="#111827"/><path d="M 190 737.6470588235294 H 210 V 754 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="732.6470588235294" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="810" width="14" height="14" fill="#dc2626"/><text x="50" y="822" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="810" width="14" height="14" fill="#111827"/><text x="250" y="822" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="810" width="14" height="14" fill="#2563eb"/><text x="400" y="822" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="440" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Detector de obstáculos</text><rect x="30" y="60" width="160" height="320" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="300" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="342" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="354" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="330" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="220" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR IR FC-51</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">OUT</text><rect x="760" y="150" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED AZUL (alerta)</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R330</text><circle cx="760" cy="214" r="3.5" fill="#1f2937"/><text x="770" y="218" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><rect x="760" y="260" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="280" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER PASIVO</text><circle cx="760" cy="304" r="3.5" fill="#1f2937"/><text x="770" y="308" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="760" cy="324" r="3.5" fill="#1f2937"/><text x="770" y="328" font-size="10" font-style="normal" fill="#44403c">-</text><circle cx="190" cy="113.33333333333334" r="3.5" fill="#2563eb"/><path d="M 190 113.33333333333334 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="108.33333333333334" font-size="10" font-weight="bold" fill="#2563eb">D4</text><text x="216" y="108.66666666666667" font-size="8.5" fill="#57534e">LOW = detecta</text><circle cx="190" cy="166.66666666666669" r="3.5" fill="#16a34a"/><path d="M 190 166.66666666666669 H 214 V 194 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="161.66666666666669" font-size="10" font-weight="bold" fill="#16a34a">D5</text><circle cx="190" cy="220" r="3.5" fill="#111827"/><path d="M 190 220 H 218 V 214 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="215" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="273.33333333333337" r="3.5" fill="#9333ea"/><path d="M 190 273.33333333333337 H 222 V 304 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="268.33333333333337" font-size="10" font-weight="bold" fill="#9333ea">D7</text><circle cx="190" cy="326.6666666666667" r="3.5" fill="#111827"/><path d="M 190 326.6666666666667 H 226 V 324 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="321.6666666666667" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="410" width="14" height="14" fill="#dc2626"/><text x="50" y="422" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="410" width="14" height="14" fill="#111827"/><text x="250" y="422" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="410" width="14" height="14" fill="#2563eb"/><text x="400" y="422" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="440" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Control de servomotor con potenciómetro</text><rect x="30" y="60" width="160" height="320" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="300" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="342" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="354" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="330" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="220" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">POTENCIOMETRO</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Terminal A</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">Wiper</text><circle cx="760" cy="144" r="3.5" fill="#1f2937"/><text x="770" y="148" font-size="10" font-style="normal" fill="#44403c">Terminal B</text><rect x="760" y="190" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="210" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SERVOMOTOR SG90</text><circle cx="760" cy="234" r="3.5" fill="#1f2937"/><text x="770" y="238" font-size="10" font-style="normal" fill="#44403c">Senal</text><circle cx="760" cy="254" r="3.5" fill="#1f2937"/><text x="770" y="258" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="274" r="3.5" fill="#1f2937"/><text x="770" y="278" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="190" cy="105.71428571428572" r="3.5" fill="#dc2626"/><path d="M 190 105.71428571428572 H 210 V 104 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="100.71428571428572" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="151.42857142857144" r="3.5" fill="#16a34a"/><path d="M 190 151.42857142857144 H 214 V 124 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="146.42857142857144" font-size="10" font-weight="bold" fill="#16a34a">A0</text><circle cx="190" cy="197.14285714285714" r="3.5" fill="#111827"/><path d="M 190 197.14285714285714 H 218 V 144 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="192.14285714285714" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="242.85714285714286" r="3.5" fill="#9333ea"/><path d="M 190 242.85714285714286 H 222 V 234 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="237.85714285714286" font-size="10" font-weight="bold" fill="#9333ea">D6</text><text x="228" y="238.42857142857144" font-size="8.5" fill="#57534e">PWM</text><circle cx="190" cy="288.57142857142856" r="3.5" fill="#dc2626"/><path d="M 190 288.57142857142856 H 226 V 254 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="283.57142857142856" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="334.2857142857143" r="3.5" fill="#111827"/><path d="M 190 334.2857142857143 H 210 V 274 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="329.2857142857143" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="410" width="14" height="14" fill="#dc2626"/><text x="50" y="422" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="410" width="14" height="14" fill="#111827"/><text x="250" y="422" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="410" width="14" height="14" fill="#2563eb"/><text x="400" y="422" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 480" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="480" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Piano con pulsadores</text><rect x="30" y="60" width="160" height="360" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="340" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="382" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="394" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="370" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="370" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="240" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR DO</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Pin 1 (pin 2 a GND)</text><rect x="760" y="150" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR RE</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">Pin 1 (pin 2 a GND)</text><rect x="760" y="240" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="260" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR MI (pull-down)</text><circle cx="760" cy="284" r="3.5" fill="#1f2937"/><text x="770" y="288" font-size="10" font-style="normal" fill="#44403c">Pin 1 + R10k a GND</text><circle cx="760" cy="304" r="3.5" fill="#1f2937"/><text x="770" y="308" font-size="10" font-style="normal" fill="#44403c">Pin 2</text><rect x="760" y="350" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="370" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER PASIVO</text><circle cx="760" cy="394" r="3.5" fill="#1f2937"/><text x="770" y="398" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="190" cy="120" r="3.5" fill="#2563eb"/><path d="M 190 120 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="115" font-size="10" font-weight="bold" fill="#2563eb">D2</text><text x="216" y="112" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="180" r="3.5" fill="#16a34a"/><path d="M 190 180 H 214 V 194 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="175" font-size="10" font-weight="bold" fill="#16a34a">D3</text><text x="220" y="187" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="240" r="3.5" fill="#ea580c"/><path d="M 190 240 H 218 V 284 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="235" font-size="10" font-weight="bold" fill="#ea580c">D4</text><text x="224" y="262" font-size="8.5" fill="#57534e">INPUT, presionado = HIGH</text><circle cx="190" cy="300" r="3.5" fill="#dc2626"/><path d="M 190 300 H 222 V 304 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="295" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="360" r="3.5" fill="#0891b2"/><path d="M 190 360 H 226 V 394 H 760" fill="none" stroke="#0891b2" stroke-width="2.2"/><text x="196" y="355" font-size="10" font-weight="bold" fill="#0891b2">D8</text><rect x="30" y="450" width="14" height="14" fill="#dc2626"/><text x="50" y="462" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="450" width="14" height="14" fill="#111827"/><text x="250" y="462" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="450" width="14" height="14" fill="#2563eb"/><text x="400" y="462" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 520" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="520" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Alarma de proximidad (visual con LEDs)</text><rect x="30" y="60" width="160" height="400" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="380" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="422" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="434" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="410" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="260" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR HC-SR04</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Trig</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">Echo</text><rect x="760" y="170" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="190" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED (alarma)</text><circle cx="760" cy="214" r="3.5" fill="#1f2937"/><text x="770" y="218" font-size="10" font-style="normal" fill="#44403c">Anodo (+)</text><rect x="760" y="260" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="280" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">POTENCIOMETRO (sensibilidad)</text><circle cx="760" cy="304" r="3.5" fill="#1f2937"/><text x="770" y="308" font-size="10" font-style="normal" fill="#44403c">Terminal A</text><circle cx="760" cy="324" r="3.5" fill="#1f2937"/><text x="770" y="328" font-size="10" font-style="normal" fill="#44403c">Wiper</text><circle cx="760" cy="344" r="3.5" fill="#1f2937"/><text x="770" y="348" font-size="10" font-style="normal" fill="#44403c">Terminal B</text><rect x="760" y="390" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="410" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR (on/off)</text><circle cx="760" cy="434" r="3.5" fill="#1f2937"/><text x="770" y="438" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><circle cx="190" cy="110" r="3.5" fill="#2563eb"/><path d="M 190 110 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="105" font-size="10" font-weight="bold" fill="#2563eb">D9</text><circle cx="190" cy="160" r="3.5" fill="#16a34a"/><path d="M 190 160 H 214 V 124 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="155" font-size="10" font-weight="bold" fill="#16a34a">D10</text><circle cx="190" cy="210" r="3.5" fill="#ea580c"/><path d="M 190 210 H 218 V 214 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="205" font-size="10" font-weight="bold" fill="#ea580c">D8</text><circle cx="190" cy="260" r="3.5" fill="#dc2626"/><path d="M 190 260 H 222 V 304 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="255" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="310" r="3.5" fill="#0891b2"/><path d="M 190 310 H 226 V 324 H 760" fill="none" stroke="#0891b2" stroke-width="2.2"/><text x="196" y="305" font-size="10" font-weight="bold" fill="#0891b2">A0</text><circle cx="190" cy="360" r="3.5" fill="#111827"/><path d="M 190 360 H 210 V 344 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="355" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="410" r="3.5" fill="#db2777"/><path d="M 190 410 H 214 V 434 H 760" fill="none" stroke="#db2777" stroke-width="2.2"/><text x="196" y="405" font-size="10" font-weight="bold" fill="#db2777">D2</text><text x="220" y="422" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><rect x="30" y="490" width="14" height="14" fill="#dc2626"/><text x="50" y="502" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="490" width="14" height="14" fill="#111827"/><text x="250" y="502" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="490" width="14" height="14" fill="#2563eb"/><text x="400" y="502" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'contador-visitas'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="440" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Contador de visitas</text><rect x="30" y="60" width="160" height="320" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">3.3V logic</text><rect x="300" y="70" width="400" height="300" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="342" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="354" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="330" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="220" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR IR FC-51</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">OUT</text><rect x="760" y="150" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="190" cy="166.66666666666669" r="3.5" fill="#2563eb"/><path d="M 190 166.66666666666669 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="161.66666666666669" font-size="10" font-weight="bold" fill="#2563eb">GPIO3</text><text x="216" y="135.33333333333334" font-size="8.5" fill="#57534e">LOW = detecta</text><circle cx="190" cy="273.33333333333337" r="3.5" fill="#16a34a"/><path d="M 190 273.33333333333337 H 214 V 194 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="268.33333333333337" font-size="10" font-weight="bold" fill="#16a34a">GPIO4</text><text x="220" y="233.66666666666669" font-size="8.5" fill="#57534e">mismo que el principal</text><rect x="30" y="410" width="14" height="14" fill="#dc2626"/><text x="50" y="422" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="410" width="14" height="14" fill="#111827"/><text x="250" y="422" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="410" width="14" height="14" fill="#2563eb"/><text x="400" y="422" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1);

-- ============================================================
-- 6. KIT_CODIGOS (29 sketches: 6 principales + 23 adicionales)
-- ============================================================
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'arduino', '/*
  Semaforo inteligente con paso peatonal
  Kit 8vo EGB - Arduino UNO R3
  Academia Militar Lizardo Alfonzo Villamarin

  El semaforo cicla rojo -> verde -> amarillo -> rojo. Si un peaton
  presiona el pulsador mientras el semaforo esta en verde, se corta
  el ciclo, pasa a amarillo y luego a rojo para dejar cruzar,
  avisando con el buzzer.

  IMPORTANTE: el buzzer de este kit es PASIVO. Un buzzer pasivo solo
  suena con tone()/noTone() (necesita una señal oscilante); si le
  mandas digitalWrite(HIGH) se queda en silencio o hace un clic.
*/

const int LED_ROJO = 8;
const int LED_AMARILLO = 9;
const int LED_VERDE = 10;
const int PULSADOR_PEATON = 2;
const int BUZZER = 7;

const unsigned long TIEMPO_VERDE = 5000;
const unsigned long TIEMPO_AMARILLO = 1500;
const unsigned long TIEMPO_ROJO = 4000;

bool peatonEsperando = false;

void setup() {
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(PULSADOR_PEATON, INPUT_PULLUP);

  apagarTodo();
  digitalWrite(LED_ROJO, HIGH);
}

void loop() {
  cicloVerdeConInterrupcion();

  apagarTodo();
  digitalWrite(LED_AMARILLO, HIGH);
  delay(TIEMPO_AMARILLO);

  apagarTodo();
  digitalWrite(LED_ROJO, HIGH);
  if (peatonEsperando) {
    avisoSonoroCruce();
    peatonEsperando = false;
  }
  delay(TIEMPO_ROJO);
}

void cicloVerdeConInterrupcion() {
  apagarTodo();
  digitalWrite(LED_VERDE, HIGH);

  unsigned long inicio = millis();
  while (millis() - inicio < TIEMPO_VERDE) {
    if (digitalRead(PULSADOR_PEATON) == LOW) {
      peatonEsperando = true;
      break;
    }
  }
}

void avisoSonoroCruce() {
  for (int i = 0; i < 3; i++) {
    tone(BUZZER, 1500, 150);
    delay(300);
  }
  noTone(BUZZER);
}

void apagarTodo() {
  digitalWrite(LED_ROJO, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_VERDE, LOW);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'basurero-inteligente'), 'arduino', '/*
  Basurero inteligente con apertura automatica
  Kit 9no EGB - Arduino Nano V3
  Academia Militar Lizardo Alfonzo Villamarin

  Un sensor ultrasonico mide la distancia a la mano o al objeto. Si
  esta lo bastante cerca, el servomotor abre la tapa y un LED
  parpadea para confirmar (este kit no incluye buzzer: la
  confirmacion es visual).
*/

#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int LED_TAPA = 8;

const int DISTANCIA_APERTURA_CM = 15;
const int ANGULO_CERRADO = 0;
const int ANGULO_ABIERTO = 90;
const unsigned long TIEMPO_ABIERTA_MS = 3000;

Servo tapa;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_TAPA, OUTPUT);
  tapa.attach(SERVO_PIN);
  tapa.write(ANGULO_CERRADO);
  Serial.begin(9600);
}

void loop() {
  long distancia = medirDistanciaCm();
  if (distancia > 0 && distancia <= DISTANCIA_APERTURA_CM) {
    abrirTapa();
  }
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}

void abrirTapa() {
  tapa.write(ANGULO_ABIERTO);
  parpadearConfirmacion();
  delay(TIEMPO_ABIERTA_MS);
  tapa.write(ANGULO_CERRADO);
  digitalWrite(LED_TAPA, LOW);
  delay(500);
}

void parpadearConfirmacion() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_TAPA, HIGH);
    delay(100);
    digitalWrite(LED_TAPA, LOW);
    delay(100);
  }
  digitalWrite(LED_TAPA, HIGH);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'arduino', '/*
  Sistema de riego automatico para plantas
  Kit 10mo EGB - Arduino Nano V3 (Micro-USB)
  Academia Militar Lizardo Alfonzo Villamarin

  Lee la humedad de la tierra. Si esta por debajo del umbral (ajustable
  con el potenciometro), enciende la bomba de agua a traves del rele
  durante unos segundos. El pulsador fuerza un riego manual. Los LEDs
  muestran el estado: rojo = regando, amarillo = humedad baja, verde =
  humedad correcta.

  ALIMENTACION: la placa y la bomba comparten el mismo cable USB-V8,
  conectado a un cargador de celular de al menos 1A (no incluido). El
  rele solo conmuta; no necesita fuente aparte.

  NOTA: el valor crudo del sensor de humedad puede variar segun el
  modelo (algunos dan un numero MAS ALTO cuando la tierra esta mas
  SECA, y otros al reves). Prueba el tuyo e invierte la comparacion
  si hace falta.
*/

const int SENSOR_HUMEDAD = A0;
const int POTENCIOMETRO = A1;
const int RELE_BOMBA = 7;
const int BUZZER = 8;
const int LED_ROJO = 9;
const int LED_AMARILLO = 10;
const int LED_VERDE = 11;
const int PULSADOR_MANUAL = 2;

const unsigned long TIEMPO_RIEGO_MS = 4000;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(PULSADOR_MANUAL, INPUT_PULLUP);
  digitalWrite(RELE_BOMBA, LOW);
  Serial.begin(9600);
}

void loop() {
  int humedad = analogRead(SENSOR_HUMEDAD);
  int umbral = map(analogRead(POTENCIOMETRO), 0, 1023, 300, 800);
  bool riegoManual = (digitalRead(PULSADOR_MANUAL) == LOW);

  Serial.print("Humedad: "); Serial.print(humedad);
  Serial.print(" Umbral: "); Serial.println(umbral);

  if (humedad > umbral || riegoManual) {
    digitalWrite(LED_AMARILLO, LOW);
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_ROJO, HIGH);
    digitalWrite(RELE_BOMBA, HIGH);
    tone(BUZZER, 1500, 100);
    delay(TIEMPO_RIEGO_MS);
    digitalWrite(RELE_BOMBA, LOW);
    digitalWrite(LED_ROJO, LOW);
  } else if (humedad > umbral - 100) {
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_AMARILLO, HIGH);
  } else {
    digitalWrite(LED_AMARILLO, LOW);
    digitalWrite(LED_VERDE, HIGH);
  }

  delay(500);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'estacion-meteorologica-iot'), 'arduino', '/*
  Estacion meteorologica con monitoreo de variables ambientales
  Kit 1ro BGU - ESP32-C3 Super Mini
  Academia Militar Lizardo Alfonzo Villamarin

  Lee temperatura y humedad (DHT11) y nivel de luz (LDR), y enciende
  un LED de alerta cuando la temperatura o la humedad salen de rango
  (este kit trae una sola resistencia, asi que solo hay un LED de
  estado). El pulsador cambia que dato se muestra por el Monitor
  Serial.

  Requiere instalar: "DHT sensor library" (Adafruit) + "Adafruit
  Unified Sensor".

  IMPORTANTE: ESP32-C3 trabaja a 3.3V. No conectar ningun componente
  de 5V directo a sus pines.
*/

#include <DHT.h>

const int PIN_LDR = 0;
const int PIN_POT = 1;
const int PIN_DHT = 3;
const int BUZZER = 4;
const int LED_ALERTA = 5;
const int PULSADOR = 10;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

bool mostrarLuz = false;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ALERTA, OUTPUT);
  pinMode(PULSADOR, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(PULSADOR) == LOW) {
    mostrarLuz = !mostrarLuz;
    delay(300);
  }

  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  int luz = analogRead(PIN_LDR);
  int sensibilidad = map(analogRead(PIN_POT), 0, 4095, 20, 35);

  if (mostrarLuz) {
    Serial.print("Nivel de luz (LDR): ");
    Serial.println(luz);
  } else {
    Serial.print("Temp: "); Serial.print(temperatura);
    Serial.print(" C  Humedad: "); Serial.print(humedad);
    Serial.println(" %");
  }

  bool alerta = (!isnan(temperatura) && temperatura > sensibilidad) || (!isnan(humedad) && humedad > 70);
  digitalWrite(LED_ALERTA, alerta ? HIGH : LOW);
  if (alerta) tone(BUZZER, 2000, 200);

  delay(2000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'arduino', '/*
  Control inteligente de dispositivos electricos en el hogar
  Kit 2do BGU - ESP32 DevKit V1 (30 pines)
  Academia Militar Lizardo Alfonzo Villamarin

  Enciende automaticamente una "luz" (representada con un LED en el
  diagrama por seguridad) cuando detecta movimiento Y hay poca luz
  ambiental. El pulsador permite forzar el encendido/apagado manual
  (este kit no trae buzzer: la confirmacion es con un LED que
  parpadea).

  SEGURIDAD: el rele con optoacoplador es el que realmente conmuta
  110V (enchufe -> interruptor -> rele -> boquilla). Esa parte del
  circuito SOLO se arma y se prueba con el docente presente. En este
  sketch, el ESP32 nunca toca 110V directamente: solo activa la
  bobina del rele a traves de GPIO26.
*/

const int PIN_PIR = 27;
const int PIN_LDR = 34;
const int PIN_RELE = 26;
const int LED_CONFIRMA = 25;
const int PIN_PULSADOR = 14;

const int UMBRAL_OSCURIDAD = 2000; // 0-4095, ajustar segun el ambiente
const unsigned long TIEMPO_LUZ_ENCENDIDA_MS = 10000;

bool modoManual = false;
bool manualEncendido = false;
unsigned long ultimoMovimiento = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_LDR, INPUT);
  pinMode(PIN_RELE, OUTPUT);
  pinMode(LED_CONFIRMA, OUTPUT);
  pinMode(PIN_PULSADOR, INPUT_PULLUP);
  digitalWrite(PIN_RELE, LOW);
}

void loop() {
  if (digitalRead(PIN_PULSADOR) == LOW) {
    modoManual = !modoManual;
    manualEncendido = !manualEncendido;
    parpadearConfirmacion();
    delay(300);
  }

  if (modoManual) {
    digitalWrite(PIN_RELE, manualEncendido ? HIGH : LOW);
    return;
  }

  bool hayMovimiento = digitalRead(PIN_PIR) == HIGH;
  int luzAmbiente = analogRead(PIN_LDR);
  bool estaOscuro = luzAmbiente < UMBRAL_OSCURIDAD;

  if (hayMovimiento && estaOscuro) {
    ultimoMovimiento = millis();
    digitalWrite(PIN_RELE, HIGH);
  }

  if (millis() - ultimoMovimiento > TIEMPO_LUZ_ENCENDIDA_MS) {
    digitalWrite(PIN_RELE, LOW);
  }

  delay(200);
}

void parpadearConfirmacion() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(LED_CONFIRMA, HIGH);
    delay(100);
    digitalWrite(LED_CONFIRMA, LOW);
    delay(100);
  }
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'arduino', '/*
  Sistema inteligente de monitoreo y automatizacion completo
  Kit 3ro BGU - ESP32 DevKit V1 (30 pines)
  Academia Militar Lizardo Alfonzo Villamarin

  Muestra temperatura, humedad, distancia y luz en una pantalla LCD
  16x2 (I2C), alternando automaticamente entre dos pantallas cada 3
  segundos (este kit no trae pulsador para cambiarlas a mano). Un LED
  y un buzzer avisan si la temperatura es alta o algo esta muy cerca.

  Requiere instalar: "LiquidCrystal I2C" y "DHT sensor library"
  (Adafruit) + su dependencia "Adafruit Unified Sensor".

  El modulo LCD I2C se alimenta desde VIN (5V) y se conecta directo a
  SDA 21 / SCL 22 (sin conversor de nivel logico). Sin rele, sin
  potenciometro, sin pulsador y sin sensor de humedad en este kit.
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

const int PIN_DHT = 4;
const int PIN_TRIG = 17;
const int PIN_ECHO = 16;
const int PIN_LDR = 32;
const int PIN_BUZZER = 19;
const int LED_ALERTA = 18;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2); // si no aparece nada, prueba con 0x3F

const int UMBRAL_DISTANCIA_CM = 20;
const float UMBRAL_TEMPERATURA_C = 32.0;
const unsigned long INTERVALO_PANTALLA_MS = 3000;

int pantallaActual = 0;
unsigned long ultimoCambioPantalla = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.init();
  lcd.backlight();
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(LED_ALERTA, OUTPUT);
}

void loop() {
  if (millis() - ultimoCambioPantalla >= INTERVALO_PANTALLA_MS) {
    ultimoCambioPantalla = millis();
    pantallaActual = (pantallaActual + 1) % 2;
    lcd.clear();
  }

  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  long distanciaCm = medirDistanciaCm();
  int luz = analogRead(PIN_LDR);

  lcd.setCursor(0, 0);
  if (pantallaActual == 0) {
    lcd.print("Temp:"); lcd.print(temperatura, 1); lcd.print("C");
    lcd.setCursor(0, 1);
    lcd.print("Hum:"); lcd.print(humedad, 0); lcd.print("%");
  } else {
    lcd.print("Dist:"); lcd.print(distanciaCm); lcd.print("cm");
    lcd.setCursor(0, 1);
    lcd.print("Luz:"); lcd.print(luz);
  }

  bool alerta = (distanciaCm > 0 && distanciaCm < UMBRAL_DISTANCIA_CM) ||
                (!isnan(temperatura) && temperatura > UMBRAL_TEMPERATURA_C);
  digitalWrite(LED_ALERTA, alerta ? HIGH : LOW);
  if (alerta) tone(PIN_BUZZER, 1800, 150);

  delay(300);
}

long medirDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duracion = pulseIn(PIN_ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'arduino', '/*
  Detector de obstaculos
  Kit 8vo EGB - Arduino UNO R3 - Proyecto adicional
  Usa el sensor infrarrojo FC-51: si detecta un objeto cerca,
  enciende un LED y suena el buzzer (pasivo, con tone()).
*/
const int SENSOR_IR = 4;
const int LED_ALERTA = 5;
const int BUZZER = 7;

void setup() {
  pinMode(SENSOR_IR, INPUT);
  pinMode(LED_ALERTA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  bool hayObstaculo = (digitalRead(SENSOR_IR) == LOW); // el FC-51 da LOW al detectar
  digitalWrite(LED_ALERTA, hayObstaculo ? HIGH : LOW);
  if (hayObstaculo) {
    tone(BUZZER, 1200, 100);
  }
  delay(100);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'alarma'), 'arduino', '/*
  Alarma de puerta
  Kit 8vo EGB - Arduino UNO R3 - Proyecto adicional
  Mismo armado del semaforo (reutiliza el pulsador, el LED rojo y el
  buzzer pasivo). Si el pulsador se suelta (simula que la puerta se
  abre), dispara la alarma.

  NOTA: para simplificar, esta version no tiene forma de desactivar
  la alarma sin reiniciar la placa. En un proyecto real agregarias un
  segundo pulsador o una clave para apagarla.
*/
const int SENSOR_PUERTA = 2;
const int LED_ALARMA = 8;
const int BUZZER = 7;

bool alarmaActiva = false;

void setup() {
  pinMode(SENSOR_PUERTA, INPUT_PULLUP);
  pinMode(LED_ALARMA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  if (digitalRead(SENSOR_PUERTA) == HIGH) {
    alarmaActiva = true;
  }

  if (alarmaActiva) {
    digitalWrite(LED_ALARMA, HIGH);
    tone(BUZZER, 2000, 200);
    delay(200);
    digitalWrite(LED_ALARMA, LOW);
    delay(200);
  }
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'arduino', '/*
  Control de servomotor con potenciometro
  Kit 8vo EGB - Arduino UNO R3 - Proyecto adicional
  Gira un servomotor a la posicion que indica el potenciometro.
*/
#include <Servo.h>

const int POTENCIOMETRO = A0;
const int SERVO_PIN = 6;

Servo motor;

void setup() {
  motor.attach(SERVO_PIN);
}

void loop() {
  int valor = analogRead(POTENCIOMETRO);
  int angulo = map(valor, 0, 1023, 0, 180);
  motor.write(angulo);
  delay(15);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'arduino', '/*
  Piano con pulsadores
  Kit 8vo EGB - Arduino UNO R3 - Proyecto adicional
  Dos pulsadores usan la resistencia pull-up interna (INPUT_PULLUP) y
  el tercero usa una resistencia pull-down externa de 10 kOhm hacia
  GND, para comparar las dos formas de leer un pulsador. Cada uno
  suena una nota distinta en el buzzer pasivo.
*/
const int PULSADOR_DO = 2; // pull-up interna: presionado = LOW
const int PULSADOR_RE = 3; // pull-up interna: presionado = LOW
const int PULSADOR_MI = 4; // pull-down externa (R10k a GND): presionado = HIGH
const int BUZZER = 8;

const int NOTA_DO = 262;
const int NOTA_RE = 294;
const int NOTA_MI = 330;

void setup() {
  pinMode(PULSADOR_DO, INPUT_PULLUP);
  pinMode(PULSADOR_RE, INPUT_PULLUP);
  pinMode(PULSADOR_MI, INPUT); // la resistencia pull-down ya esta en la protoboard
}

void loop() {
  if (digitalRead(PULSADOR_DO) == LOW) {
    tone(BUZZER, NOTA_DO);
  } else if (digitalRead(PULSADOR_RE) == LOW) {
    tone(BUZZER, NOTA_RE);
  } else if (digitalRead(PULSADOR_MI) == HIGH) {
    tone(BUZZER, NOTA_MI);
  } else {
    noTone(BUZZER);
  }
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'arduino', '/*
  Contador de personas
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Mismo armado del basurero inteligente (sin el servo). Cada vez que
  algo pasa frente al sensor, suma 1 al contador, lo muestra por el
  Monitor Serial y el LED confirma (este kit no trae buzzer).
*/
const int TRIG = 9;
const int ECHO = 10;
const int LED_CONTADOR = 8;

const int DISTANCIA_DETECCION_CM = 20;
int contador = 0;
bool detectadoAntes = false;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_CONTADOR, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long distancia = medirDistanciaCm();
  bool detectadoAhora = (distancia > 0 && distancia <= DISTANCIA_DETECCION_CM);

  if (detectadoAhora && !detectadoAntes) {
    contador++;
    Serial.print("Personas contadas: ");
    Serial.println(contador);
    digitalWrite(LED_CONTADOR, HIGH);
  } else if (!detectadoAhora) {
    digitalWrite(LED_CONTADOR, LOW);
  }

  detectadoAntes = detectadoAhora;
  delay(150);
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'arduino', '/*
  Dispensador automatico
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Mismo armado del basurero inteligente. Al acercar la mano, el
  servomotor abre la compuerta un momento y el LED confirma (sin
  buzzer).
*/
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int LED_CONFIRMA = 8;

const int DISTANCIA_CM = 10;
const unsigned long TIEMPO_ABIERTO_MS = 1000;

Servo compuerta;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_CONFIRMA, OUTPUT);
  compuerta.attach(SERVO_PIN);
  compuerta.write(0);
}

void loop() {
  long distancia = medirDistanciaCm();
  if (distancia > 0 && distancia <= DISTANCIA_CM) {
    compuerta.write(90);
    digitalWrite(LED_CONFIRMA, HIGH);
    delay(TIEMPO_ABIERTO_MS);
    compuerta.write(0);
    digitalWrite(LED_CONFIRMA, LOW);
    delay(1000);
  }
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'arduino', '/*
  Puerta automatica
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Mismo armado del basurero inteligente. La puerta se abre cuando
  alguien se acerca y se mantiene abierta mientras siga cerca.
*/
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int LED_PUERTA_ABIERTA = 8;

const int DISTANCIA_CM = 30;

Servo puerta;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_PUERTA_ABIERTA, OUTPUT);
  puerta.attach(SERVO_PIN);
  puerta.write(0);
}

void loop() {
  long distancia = medirDistanciaCm();
  bool hayAlguien = (distancia > 0 && distancia <= DISTANCIA_CM);

  puerta.write(hayAlguien ? 90 : 0);
  digitalWrite(LED_PUERTA_ABIERTA, hayAlguien ? HIGH : LOW);
  delay(200);
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'arduino', '/*
  Alarma de proximidad (visual con LEDs)
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Un LED parpadea mas rapido mientras mas cerca esta un objeto del
  sensor (este kit no tiene buzzer: la alarma es 100% visual). El
  potenciometro ajusta la sensibilidad y el pulsador enciende/apaga
  la alarma.
*/
const int TRIG = 9;
const int ECHO = 10;
const int LED_ALARMA = 8;
const int POTENCIOMETRO = A0;
const int PULSADOR_ON_OFF = 2;

bool alarmaEncendida = true;
bool pulsadorAntes = false;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_ALARMA, OUTPUT);
  pinMode(PULSADOR_ON_OFF, INPUT_PULLUP);
}

void loop() {
  bool pulsadorAhora = (digitalRead(PULSADOR_ON_OFF) == LOW);
  if (pulsadorAhora && !pulsadorAntes) {
    alarmaEncendida = !alarmaEncendida;
    delay(50);
  }
  pulsadorAntes = pulsadorAhora;

  if (!alarmaEncendida) {
    digitalWrite(LED_ALARMA, LOW);
    return;
  }

  long distancia = medirDistanciaCm();
  int sensibilidadCm = map(analogRead(POTENCIOMETRO), 0, 1023, 10, 100);

  if (distancia > 0 && distancia <= sensibilidadCm) {
    int pausa = map(distancia, 0, sensibilidadCm, 50, 400); // mas cerca = parpadeo mas rapido
    digitalWrite(LED_ALARMA, HIGH);
    delay(pausa / 2);
    digitalWrite(LED_ALARMA, LOW);
    delay(pausa / 2);
  } else {
    digitalWrite(LED_ALARMA, LOW);
  }
}

long medirDistanciaCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duracion = pulseIn(ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'control-nivel-agua'), 'arduino', '/*
  Control de nivel de agua
  Kit 10mo EGB - Arduino Nano V3 Micro-USB - Proyecto adicional
  Mismo armado del sistema de riego. Usa el sensor como si midiera
  el nivel de un tanque: si el nivel (humedad) esta bajo, activa la
  bomba para "llenar" hasta que vuelva a un nivel correcto.
*/
const int SENSOR_NIVEL = A0;
const int RELE_BOMBA = 7;
const int BUZZER = 8;
const int LED_ROJO = 9;
const int LED_VERDE = 11;

const int UMBRAL_BAJO = 600;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
}

void loop() {
  int nivel = analogRead(SENSOR_NIVEL);
  bool nivelBajo = (nivel > UMBRAL_BAJO); // valor alto = nivel mas bajo, en este sensor

  digitalWrite(RELE_BOMBA, nivelBajo ? HIGH : LOW);
  digitalWrite(LED_ROJO, nivelBajo ? HIGH : LOW);
  digitalWrite(LED_VERDE, nivelBajo ? LOW : HIGH);
  if (nivelBajo) tone(BUZZER, 1200, 100);

  delay(500);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'mini-invernadero'), 'arduino', '/*
  Mini invernadero inteligente
  Kit 10mo EGB - Arduino Nano V3 Micro-USB - Proyecto adicional
  Mismo armado del sistema de riego. Riega automaticamente segun el
  umbral del potenciometro, o manualmente con el pulsador.
*/
const int SENSOR_HUMEDAD = A0;
const int POTENCIOMETRO = A1;
const int RELE_BOMBA = 7;
const int LED_ESTADO = 9;
const int PULSADOR_MANUAL = 2;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(LED_ESTADO, OUTPUT);
  pinMode(PULSADOR_MANUAL, INPUT_PULLUP);
}

void loop() {
  int humedad = analogRead(SENSOR_HUMEDAD);
  int umbral = map(analogRead(POTENCIOMETRO), 0, 1023, 300, 800);
  bool riego = (humedad > umbral) || (digitalRead(PULSADOR_MANUAL) == LOW);

  digitalWrite(RELE_BOMBA, riego ? HIGH : LOW);
  digitalWrite(LED_ESTADO, riego ? HIGH : LOW);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'automatizacion-cultivos'), 'arduino', '/*
  Automatizacion de cultivos
  Kit 10mo EGB - Arduino Nano V3 Micro-USB - Proyecto adicional
  Mismo armado del sistema de riego. En vez de regar todo el tiempo
  que la tierra este seca, riega por pulsos cortos cada cierto
  intervalo usando millis() (sin bloquear el programa con delay()).
*/
const int SENSOR_HUMEDAD = A0;
const int RELE_BOMBA = 7;
const int BUZZER = 8;
const int LED_VERDE = 11;

const unsigned long INTERVALO_REVISION_MS = 5000;
const unsigned long DURACION_RIEGO_MS = 1500;
const int UMBRAL_SECO = 600;

unsigned long ultimaRevision = 0;

void setup() {
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
}

void loop() {
  if (millis() - ultimaRevision >= INTERVALO_REVISION_MS) {
    ultimaRevision = millis();
    int humedad = analogRead(SENSOR_HUMEDAD);

    if (humedad > UMBRAL_SECO) {
      digitalWrite(RELE_BOMBA, HIGH);
      tone(BUZZER, 1000, 150);
      delay(DURACION_RIEGO_MS);
      digitalWrite(RELE_BOMBA, LOW);
      digitalWrite(LED_VERDE, LOW);
    } else {
      digitalWrite(LED_VERDE, HIGH);
    }
  }
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'luz-automatica'), 'arduino', '/*
  Luz automatica
  Kit 1ro BGU - ESP32-C3 Super Mini - Proyecto adicional
  Mismo armado de la estacion meteorologica (usa solo el LDR y un
  LED). Enciende el LED cuando detecta poca luz ambiental.
*/
const int PIN_LDR = 0;
const int LED_LUZ = 5;

const int UMBRAL_OSCURIDAD = 1500; // 0-4095, ajustar segun el ambiente

void setup() {
  pinMode(LED_LUZ, OUTPUT);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  digitalWrite(LED_LUZ, luz < UMBRAL_OSCURIDAD ? HIGH : LOW);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'contador-visitas'), 'arduino', '/*
  Contador de visitas
  Kit 1ro BGU - ESP32-C3 Super Mini - Proyecto adicional
  Usa el sensor infrarrojo FC-51 para contar cuantas veces pasa algo
  frente a el. El total se muestra por el Monitor Serial.
*/
const int SENSOR_IR = 3;
const int BUZZER = 4;

int visitas = 0;
bool detectadoAntes = false;

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_IR, INPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  bool detectadoAhora = (digitalRead(SENSOR_IR) == LOW);

  if (detectadoAhora && !detectadoAntes) {
    visitas++;
    Serial.print("Visitas: ");
    Serial.println(visitas);
    tone(BUZZER, 1500, 100);
  }
  detectadoAntes = detectadoAhora;
  delay(150);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'alarma-temperatura'), 'arduino', '/*
  Alarma de temperatura
  Kit 1ro BGU - ESP32-C3 Super Mini - Proyecto adicional
  Mismo armado de la estacion meteorologica. Si la temperatura supera
  el umbral (ajustable con el potenciometro), enciende el LED rojo y
  el buzzer.

  Requiere instalar: "DHT sensor library" (Adafruit) + "Adafruit
  Unified Sensor".
*/
#include <DHT.h>

const int PIN_DHT = 3;
const int PIN_POT = 1;
const int BUZZER = 4;
const int LED_ROJO = 5;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
}

void loop() {
  float temperatura = dht.readTemperature();
  int umbral = map(analogRead(PIN_POT), 0, 4095, 20, 35);

  if (!isnan(temperatura) && temperatura > umbral) {
    digitalWrite(LED_ROJO, HIGH);
    tone(BUZZER, 2000, 200);
  } else {
    digitalWrite(LED_ROJO, LOW);
  }

  Serial.print("Temp: "); Serial.print(temperatura);
  Serial.print(" Umbral: "); Serial.println(umbral);
  delay(2000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'registro-datos-nube'), 'arduino', '/*
  Registro de datos en la nube
  Kit 1ro BGU - ESP32-C3 Super Mini - Proyecto adicional
  Mismo armado de la estacion meteorologica. Envia temperatura,
  humedad y luz a un servidor propio (por ejemplo, un Google Apps
  Script o un pequeno backend) cada cierto tiempo, usando WiFi.

  IMPORTANTE: reemplaza RED_WIFI, CLAVE_WIFI y URL_SERVIDOR con tus
  propios datos. Este sketch no envia datos a ningun servicio real
  por defecto: la URL es un marcador de posicion.

  Requiere instalar: "DHT sensor library" (Adafruit) + su dependencia
  "Adafruit Unified Sensor".
*/
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const char* RED_WIFI = "NOMBRE_DE_TU_WIFI";
const char* CLAVE_WIFI = "CLAVE_DE_TU_WIFI";
const char* URL_SERVIDOR = "https://tu-servidor.example.com/registrar";

const int PIN_DHT = 3;
const int PIN_LDR = 0;
const unsigned long INTERVALO_ENVIO_MS = 60000;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);
unsigned long ultimoEnvio = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(RED_WIFI, CLAVE_WIFI);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Conectado, IP: " + WiFi.localIP().toString());
}

void loop() {
  if (millis() - ultimoEnvio >= INTERVALO_ENVIO_MS) {
    ultimoEnvio = millis();
    enviarLectura();
  }
}

void enviarLectura() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  int luz = analogRead(PIN_LDR);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sin WiFi, no se pudo enviar.");
    return;
  }

  HTTPClient http;
  http.begin(URL_SERVIDOR);
  http.addHeader("Content-Type", "application/json");

  String json = "{\"temperatura\":" + String(temperatura) +
                ",\"humedad\":" + String(humedad) +
                ",\"luz\":" + String(luz) + "}";

  int codigo = http.POST(json);
  Serial.print("Respuesta del servidor: ");
  Serial.println(codigo);
  http.end();
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'encendido-remoto-luces'), 'arduino', '/*
  Encendido remoto de luces
  Kit 2do BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado de la domotica inteligente (solo el rele). Crea una
  pagina web dentro del propio ESP32 con un boton para encender y
  apagar la luz desde cualquier navegador conectado a la misma red
  WiFi (celular, laptop, etc).

  IMPORTANTE: reemplaza RED_WIFI y CLAVE_WIFI con los datos de tu red.
  Luego de subir el programa, abre el Monitor Serial para ver la
  direccion IP y escribela en el navegador.
*/
#include <WiFi.h>
#include <WebServer.h>

const char* RED_WIFI = "NOMBRE_DE_TU_WIFI";
const char* CLAVE_WIFI = "CLAVE_DE_TU_WIFI";
const int PIN_RELE = 26;

WebServer servidor(80);
bool luzEncendida = false;

void manejarRaiz() {
  String html = "<html><body><h1>Control de luz</h1>";
  html += "<p>Estado: " + String(luzEncendida ? "ENCENDIDA" : "APAGADA") + "</p>";
  html += "<a href=\"/on\"><button>Encender</button></a> ";
  html += "<a href=\"/off\"><button>Apagar</button></a>";
  html += "</body></html>";
  servidor.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELE, OUTPUT);
  digitalWrite(PIN_RELE, LOW);

  WiFi.begin(RED_WIFI, CLAVE_WIFI);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("IP del ESP32: " + WiFi.localIP().toString());

  servidor.on("/", manejarRaiz);
  servidor.on("/on", []() {
    luzEncendida = true;
    digitalWrite(PIN_RELE, HIGH);
    manejarRaiz();
  });
  servidor.on("/off", []() {
    luzEncendida = false;
    digitalWrite(PIN_RELE, LOW);
    manejarRaiz();
  });
  servidor.begin();
}

void loop() {
  servidor.handleClient();
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'automatizacion-ventiladores'), 'arduino', '/*
  Automatizacion de ventiladores
  Kit 2do BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado de la domotica inteligente (PIR + rele). Enciende el
  "ventilador" (representado por el rele) mientras detecta a alguien
  en la habitacion, y lo apaga unos segundos despues de que se va.
*/
const int PIN_PIR = 27;
const int PIN_RELE = 26;

const unsigned long TIEMPO_APAGADO_MS = 8000;
unsigned long ultimoMovimiento = 0;

void setup() {
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_RELE, OUTPUT);
  digitalWrite(PIN_RELE, LOW);
}

void loop() {
  if (digitalRead(PIN_PIR) == HIGH) {
    ultimoMovimiento = millis();
    digitalWrite(PIN_RELE, HIGH);
  }

  if (millis() - ultimoMovimiento > TIEMPO_APAGADO_MS) {
    digitalWrite(PIN_RELE, LOW);
  }
  delay(200);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'control-desde-celular'), 'arduino', '/*
  Control desde celular
  Kit 2do BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado de la domotica inteligente. Pagina web con el estado
  del sensor PIR en vivo y un boton para controlar el rele
  manualmente desde el navegador del celular (conectado a la misma
  red WiFi que el ESP32).
*/
#include <WiFi.h>
#include <WebServer.h>

const char* RED_WIFI = "NOMBRE_DE_TU_WIFI";
const char* CLAVE_WIFI = "CLAVE_DE_TU_WIFI";
const int PIN_RELE = 26;
const int PIN_PIR = 27;

WebServer servidor(80);
bool releEncendido = false;

void manejarRaiz() {
  bool movimiento = digitalRead(PIN_PIR) == HIGH;
  String html = "<html><body><h1>Panel de control</h1>";
  html += "<p>Rele: " + String(releEncendido ? "ENCENDIDO" : "APAGADO") + "</p>";
  html += "<p>Movimiento detectado: " + String(movimiento ? "SI" : "NO") + "</p>";
  html += "<a href=\"/on\"><button>Encender</button></a> ";
  html += "<a href=\"/off\"><button>Apagar</button></a> ";
  html += "<a href=\"/\"><button>Actualizar</button></a>";
  html += "</body></html>";
  servidor.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELE, OUTPUT);
  pinMode(PIN_PIR, INPUT);
  digitalWrite(PIN_RELE, LOW);

  WiFi.begin(RED_WIFI, CLAVE_WIFI);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println();
  Serial.println("IP del ESP32: " + WiFi.localIP().toString());

  servidor.on("/", manejarRaiz);
  servidor.on("/on", []() { releEncendido = true; digitalWrite(PIN_RELE, HIGH); manejarRaiz(); });
  servidor.on("/off", []() { releEncendido = false; digitalWrite(PIN_RELE, LOW); manejarRaiz(); });
  servidor.begin();
}

void loop() {
  servidor.handleClient();
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'arduino', '/*
  Casa inteligente (simulada)
  Kit 3ro BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado del sistema de monitoreo principal. Un LED representa
  la luz de la casa: se enciende solo cuando oscurece (segun el LDR).
  El buzzer suena una vez, como timbre de bienvenida, cada vez que la
  luz cambia de estado (este kit no tiene pulsador fisico).
*/
const int PIN_LDR = 32;
const int LED_CASA = 18;
const int BUZZER = 19;

const int UMBRAL_OSCURIDAD = 1800;
bool oscuroAntes = false;

void setup() {
  pinMode(LED_CASA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  bool oscuro = luz < UMBRAL_OSCURIDAD;

  digitalWrite(LED_CASA, oscuro ? HIGH : LOW);

  if (oscuro != oscuroAntes) {
    tone(BUZZER, 1800, 200);
  }
  oscuroAntes = oscuro;

  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'arduino', '/*
  Sistema de seguridad IoT
  Kit 3ro BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado del sistema de monitoreo principal. Si el sensor
  ultrasonico detecta que algo se acerca demasiado, activa una
  alarma (LED + buzzer) y publica el evento por el Monitor Serial
  (listo para conectarse luego a WiFi/MQTT).
*/
const int PIN_TRIG = 17;
const int PIN_ECHO = 16;
const int LED_ALARMA = 18;
const int BUZZER = 19;

const int DISTANCIA_INTRUSO_CM = 25;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(LED_ALARMA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  long distancia = medirDistanciaCm();
  bool intrusion = (distancia > 0 && distancia <= DISTANCIA_INTRUSO_CM);

  digitalWrite(LED_ALARMA, intrusion ? HIGH : LOW);
  if (intrusion) {
    tone(BUZZER, 2200, 150);
    Serial.println("ALERTA: posible intrusion detectada");
  }
  delay(300);
}

long medirDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duracion = pulseIn(PIN_ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-remoto-internet'), 'arduino', '/*
  Monitoreo remoto por Internet
  Kit 3ro BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado del sistema de monitoreo principal. Publica
  temperatura, humedad y nivel de luz a un servidor propio cada
  cierto tiempo usando WiFi, para poder verlos desde cualquier lugar.

  IMPORTANTE: reemplaza RED_WIFI, CLAVE_WIFI y URL_SERVIDOR con tus
  propios datos. La URL es un marcador de posicion.

  Requiere instalar: "DHT sensor library" (Adafruit) + "Adafruit
  Unified Sensor".
*/
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const char* RED_WIFI = "NOMBRE_DE_TU_WIFI";
const char* CLAVE_WIFI = "CLAVE_DE_TU_WIFI";
const char* URL_SERVIDOR = "https://tu-servidor.example.com/registrar";

const int PIN_DHT = 4;
const int PIN_LDR = 32;
const unsigned long INTERVALO_MS = 60000;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);
unsigned long ultimoEnvio = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(RED_WIFI, CLAVE_WIFI);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println();
  Serial.println("IP: " + WiFi.localIP().toString());
}

void loop() {
  if (millis() - ultimoEnvio >= INTERVALO_MS) {
    ultimoEnvio = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    int luz = analogRead(PIN_LDR);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(URL_SERVIDOR);
      http.addHeader("Content-Type", "application/json");
      String json = "{\"temperatura\":" + String(t) + ",\"humedad\":" + String(h) +
                    ",\"luz\":" + String(luz) + "}";
      int codigo = http.POST(json);
      Serial.print("Respuesta servidor: ");
      Serial.println(codigo);
      http.end();
    }
  }
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'dashboard-mqtt'), 'arduino', '/*
  Dashboard con MQTT
  Kit 3ro BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado del sistema de monitoreo principal. Publica las
  lecturas de los sensores a un broker MQTT (por ejemplo, uno propio
  o un servicio publico de pruebas), para verlas en un dashboard
  (Node-RED, MQTT Explorer, etc).

  IMPORTANTE: reemplaza RED_WIFI, CLAVE_WIFI y SERVIDOR_MQTT con tus
  propios datos.

  Requiere instalar las librerias: "PubSubClient" y "DHT sensor
  library" (Adafruit) + "Adafruit Unified Sensor".
*/
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

const char* RED_WIFI = "NOMBRE_DE_TU_WIFI";
const char* CLAVE_WIFI = "CLAVE_DE_TU_WIFI";
const char* SERVIDOR_MQTT = "broker.hivemq.com"; // broker publico de pruebas
const int PUERTO_MQTT = 1883;
const char* TEMA_TEMPERATURA = "chaskibots/lv/3ro-bgu/temperatura";
const char* TEMA_HUMEDAD = "chaskibots/lv/3ro-bgu/humedad";

const int PIN_DHT = 4;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);
WiFiClient clienteWifi;
PubSubClient mqtt(clienteWifi);

unsigned long ultimoEnvio = 0;

void conectarWifi() {
  WiFi.begin(RED_WIFI, CLAVE_WIFI);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println();
  Serial.println("WiFi conectado");
}

void conectarMqtt() {
  while (!mqtt.connected()) {
    Serial.println("Conectando a MQTT...");
    if (mqtt.connect("esp32-lv-3ro-bgu")) {
      Serial.println("Conectado al broker MQTT");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  conectarWifi();
  mqtt.setServer(SERVIDOR_MQTT, PUERTO_MQTT);
}

void loop() {
  if (!mqtt.connected()) conectarMqtt();
  mqtt.loop();

  if (millis() - ultimoEnvio >= 10000) {
    ultimoEnvio = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    mqtt.publish(TEMA_TEMPERATURA, String(t).c_str());
    mqtt.publish(TEMA_HUMEDAD, String(h).c_str());
  }
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'arduino', '/*
  Automatizacion de sensores
  Kit 3ro BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado del sistema de monitoreo principal. Combina dos
  sensores en una sola regla de decision: enciende el LED de alerta
  si hace mucho calor, o si hay algo muy cerca - lo que pase primero.
*/
#include <DHT.h>

const int PIN_DHT = 4;
const int PIN_TRIG = 17;
const int PIN_ECHO = 16;
const int LED_ALERTA = 18;
const int BUZZER = 19;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

const float UMBRAL_TEMPERATURA_C = 32.0;
const int DISTANCIA_CERCA_CM = 15;

void setup() {
  dht.begin();
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(LED_ALERTA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  float temperatura = dht.readTemperature();
  long distancia = medirDistanciaCm();

  bool haceCalor = (!isnan(temperatura) && temperatura > UMBRAL_TEMPERATURA_C);
  bool algoCerca = (distancia > 0 && distancia <= DISTANCIA_CERCA_CM);
  bool alerta = haceCalor || algoCerca;

  digitalWrite(LED_ALERTA, alerta ? HIGH : LOW);
  if (alerta) tone(BUZZER, 1500, 100);

  delay(500);
}

long medirDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duracion = pulseIn(PIN_ECHO, HIGH, 25000);
  if (duracion == 0) return -1;
  return duracion / 58;
}
', 1);
