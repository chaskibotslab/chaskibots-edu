-- ============================================================
-- PROYECTOS ADICIONALES + CODIGOS ARDUINO (fase 3)
-- Kits Academia Lizardo Villamarin
-- ============================================================
-- Depende de 2026_kit_lizardo_villamarin.sql y
-- 2026_kit_lv_proyectos_esquemas.sql (ya aplicadas).
--
-- Agrega los 25 proyectos adicionales de los 6 kits, con su tabla
-- de conexiones y su codigo Arduino (.ino). Cuando un adicional usa
-- exactamente el mismo armado fisico que el proyecto principal de su
-- kit (misma mano de obra, distinto programa -- asi funcionan estos
-- kits en la practica), NO se duplica el esquema SVG: se deja una
-- nota en pin_componente/descripcion diciendo "mismo que el
-- principal". Solo se genera un esquema nuevo cuando el proyecto usa
-- un componente o cableado que el principal no tiene.
--
-- Tambien agrega kit_codigos para los 6 proyectos PRINCIPALES (en la
-- fase 2 solo se cargo su esquema y conexiones, el codigo faltaba).
--
-- Idempotente: usa ON CONFLICT en todo.

-- ============================================================
-- 1. KIT_PROYECTOS (adicionales)
-- ============================================================
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden) VALUES
  ('kit-lv-octavo-egb', 'Detector de obstaculos', 'detector-obstaculos', 'adicional', 'Un sensor infrarrojo detecta objetos cercanos y enciende un LED con una alarma sonora.', ARRAY['Leer una senal digital de un sensor infrarrojo FC-51.', 'Relacionar una entrada digital con dos salidas (LED y buzzer).'], 2),
  ('kit-lv-octavo-egb', 'Alarma de puerta', 'alarma', 'adicional', 'Simula una alarma de puerta: si el sensor (pulsador) se abre, suena el buzzer y parpadea el LED rojo.', ARRAY['Detectar un cambio de estado en una entrada digital.', 'Mantener un estado (armada/disparada) usando una variable booleana.'], 3),
  ('kit-lv-octavo-egb', 'Control de servomotor con potenciometro', 'control-servomotor', 'adicional', 'El angulo de un servomotor se controla en vivo girando un potenciometro.', ARRAY['Leer un valor analogico y convertirlo (map) a otro rango de salida.', 'Controlar la posicion de un servomotor con la libreria Servo.'], 4),
  ('kit-lv-octavo-egb', 'Piano con pulsadores', 'piano-pulsadores', 'adicional', 'Tres pulsadores suenan tres notas distintas en el buzzer, como un mini piano.', ARRAY['Usar varias entradas digitales con INPUT_PULLUP al mismo tiempo.', 'Generar tonos de distinta frecuencia con la funcion tone().'], 5),
  ('kit-lv-noveno-egb', 'Contador de personas', 'contador-personas', 'adicional', 'Cada vez que algo pasa frente al sensor ultrasonico, suma 1 al contador y lo muestra por el Monitor Serial.', ARRAY['Detectar un evento (no solo un estado) comparando la lectura actual con la anterior.', 'Usar el Monitor Serial para mostrar datos cuando no hay pantalla.'], 2),
  ('kit-lv-noveno-egb', 'Dispensador automatico', 'dispensador-automatico', 'adicional', 'Al acercar la mano, el servomotor abre la compuerta del dispensador un momento y la vuelve a cerrar.', ARRAY['Controlar un servomotor como compuerta temporal (abre y cierra solo).', 'Evitar que el sensor dispare el mecanismo varias veces seguidas.'], 3),
  ('kit-lv-noveno-egb', 'Puerta automatica', 'puerta-automatica', 'adicional', 'La puerta (servo) se abre cuando alguien se acerca y se mantiene abierta mientras siga cerca; un LED indica que esta abierta.', ARRAY['Mantener un actuador en una posicion mientras una condicion siga siendo verdadera.', 'Sincronizar una salida digital (LED) con el estado de un servomotor.'], 4),
  ('kit-lv-noveno-egb', 'Alarma de proximidad', 'alarma-proximidad', 'adicional', 'Suena mas seguido mientras mas cerca esta un objeto del sensor. El potenciometro ajusta la sensibilidad y el pulsador enciende/apaga la alarma.', ARRAY['Convertir una distancia en un ritmo de sonido (entre mas cerca, mas rapido pita).', 'Encender y apagar una funcion con un pulsador que alterna un estado (toggle).'], 5),
  ('kit-lv-decimo-egb', 'Control de nivel de agua', 'control-nivel-agua', 'adicional', 'Usa el sensor como si midiera el nivel de un tanque: si el nivel esta bajo, activa la bomba hasta volver a un nivel correcto.', ARRAY['Reinterpretar un sensor para medir algo distinto a su uso original.', 'Controlar un actuador de alta corriente con un relé de forma segura.'], 2),
  ('kit-lv-decimo-egb', 'Mini invernadero inteligente', 'mini-invernadero', 'adicional', 'Riega automaticamente segun el umbral ajustado con el potenciometro, o manualmente con el pulsador.', ARRAY['Combinar una decision automatica con una opcion de control manual.', 'Ajustar en vivo un parametro del sistema con un potenciometro.'], 3),
  ('kit-lv-decimo-egb', 'Automatizacion de cultivos', 'automatizacion-cultivos', 'adicional', 'En vez de regar todo el tiempo que la tierra este seca, riega por pulsos cortos cada cierto intervalo, sin bloquear el programa con delay().', ARRAY['Usar millis() para repetir una tarea cada cierto tiempo sin usar delay() largo.', 'Disenar un riego por pulsos en vez de continuo, para no desperdiciar agua.'], 4),
  ('kit-lv-primero-bach', 'Luz automatica', 'luz-automatica', 'adicional', 'Enciende un LED cuando detecta poca luz ambiental, usando el sensor LDR.', ARRAY['Leer un sensor analogico de luz (LDR) en un microcontrolador de 3.3V.', 'Definir y ajustar un umbral de activacion por prueba y error.'], 2),
  ('kit-lv-primero-bach', 'Contador de visitas', 'contador-visitas', 'adicional', 'Usa el sensor infrarrojo FC-51 para contar cuantas veces pasa algo frente a el. El total se muestra por el Monitor Serial.', ARRAY['Reutilizar la logica de deteccion de eventos en una placa distinta (ESP32-C3).', 'Practicar el uso del Monitor Serial a 115200 baudios.'], 3),
  ('kit-lv-primero-bach', 'Alarma de temperatura', 'alarma-temperatura', 'adicional', 'Si la temperatura supera el umbral (ajustable con el potenciometro), enciende el LED rojo y el buzzer.', ARRAY['Comparar una lectura de sensor contra un umbral ajustable.', 'Reforzar el uso de DHT11 para temperatura en un contexto distinto al de monitoreo general.'], 4),
  ('kit-lv-primero-bach', 'Registro de datos en la nube', 'registro-datos-nube', 'adicional', 'Envia temperatura, humedad y luz a un servidor propio cada cierto tiempo, usando WiFi.', ARRAY['Conectar un ESP32 a una red WiFi.', 'Enviar datos por HTTP (POST) a un servidor en formato JSON.'], 5),
  ('kit-lv-segundo-bach', 'Encendido remoto de luces', 'encendido-remoto-luces', 'adicional', 'Crea una pagina web dentro del propio ESP32 con un boton para encender y apagar la luz desde cualquier navegador conectado a la misma red WiFi.', ARRAY['Levantar un servidor web basico en el ESP32 con la libreria WebServer.', 'Controlar una salida digital (el rele) desde una pagina HTML.'], 2),
  ('kit-lv-segundo-bach', 'Control de tomacorrientes con apagado automatico', 'control-tomacorrientes', 'adicional', 'Como el control remoto de luces, pero pensado para un tomacorriente: ademas se apaga solo despues de un tiempo maximo por seguridad.', ARRAY['Reforzar el control remoto de un rele desde una pagina web.', 'Agregar un limite de tiempo de seguridad usando millis().'], 3),
  ('kit-lv-segundo-bach', 'Automatizacion de ventiladores', 'automatizacion-ventiladores', 'adicional', 'Enciende el "ventilador" (representado por el rele) mientras detecta a alguien en la habitacion, y lo apaga unos segundos despues de que se va.', ARRAY['Mantener una salida activa mientras un sensor PIR siga detectando presencia.', 'Agregar un retardo de apagado para evitar encendidos/apagados constantes.'], 4),
  ('kit-lv-segundo-bach', 'Timbre inteligente', 'timbre-inteligente', 'adicional', 'Al presionar el boton del timbre suena el buzzer y parpadea un LED como notificacion visual.', ARRAY['Disenar una respuesta compuesta (sonido + luz) ante un solo evento.', 'Evitar que un solo toque dispare el timbre varias veces seguidas.'], 5),
  ('kit-lv-segundo-bach', 'Control desde celular', 'control-desde-celular', 'adicional', 'Pagina web con el estado del sensor PIR en vivo y un boton para controlar el rele manualmente desde el navegador del celular.', ARRAY['Mostrar el valor de un sensor en tiempo real en una pagina web.', 'Combinar lectura de sensores y control de actuadores en un mismo panel.'], 6),
  ('kit-lv-tercero-bach', 'Casa inteligente (simulada)', 'casa-inteligente-simulada', 'adicional', 'Usa el LED rojo y el LED verde para representar dos habitaciones que se encienden segun la luz ambiental, y el buzzer como timbre.', ARRAY['Representar un sistema real (una casa) con componentes simples (LEDs).', 'Combinar una regla automatica (luz) con una entrada manual (pulsador).'], 2),
  ('kit-lv-tercero-bach', 'Sistema de seguridad IoT', 'sistema-seguridad-iot', 'adicional', 'Si el sensor ultrasonico detecta que algo se acerca demasiado, activa una alarma (LED + buzzer) y publica el evento por el Monitor Serial.', ARRAY['Definir una distancia de seguridad y reaccionar cuando se viola.', 'Preparar el codigo para conectarse mas adelante a WiFi/MQTT.'], 3),
  ('kit-lv-tercero-bach', 'Monitoreo remoto por Internet', 'monitoreo-remoto-internet', 'adicional', 'Publica temperatura, humedad y humedad del suelo a un servidor propio cada cierto tiempo usando WiFi, para verlos desde cualquier lugar.', ARRAY['Enviar varias lecturas de sensores juntas en un solo mensaje JSON.', 'Repetir una tarea de red cada cierto intervalo sin bloquear el programa.'], 4),
  ('kit-lv-tercero-bach', 'Dashboard con MQTT', 'dashboard-mqtt', 'adicional', 'Publica las lecturas de temperatura y humedad a un broker MQTT para verlas en un dashboard (Node-RED, MQTT Explorer, etc).', ARRAY['Entender el patron publicar/suscribir (MQTT) frente al modelo HTTP tradicional.', 'Conectar el ESP32 a un broker MQTT publico de pruebas.'], 5),
  ('kit-lv-tercero-bach', 'Automatizacion de sensores', 'automatizacion-sensores', 'adicional', 'Combina varios sensores en una sola regla de decision: enciende el LED de alerta si la tierra esta seca o hay algo muy cerca.', ARRAY['Combinar varias condiciones de distintos sensores con un operador logico (OR).', 'Disenar una sola alerta que resuma el estado de todo el sistema.'], 6)
ON CONFLICT (kit_id, slug) DO UPDATE SET
  titulo = EXCLUDED.titulo, descripcion = EXCLUDED.descripcion, objetivos = EXCLUDED.objetivos, orden = EXCLUDED.orden;

-- ============================================================
-- 2. KIT_CONEXIONES (adicionales)
-- ============================================================
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'SENSOR IR FC-51', 'OUT', 'D4', 'LOW = detecta', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'LED AZUL (alerta)', 'Anodo (+) via R220', 'D5', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'LED AZUL (alerta)', 'Catodo (-)', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'BUZZER ACTIVO', '+', 'D7', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'BUZZER ACTIVO', '-', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'alarma'), 'PULSADOR (sensor puerta)', 'Pin 1', 'D2', 'INPUT_PULLUP, igual que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'alarma'), 'LED ROJO', 'Anodo (+)', 'D8', 'mismo pin que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'alarma'), 'BUZZER ACTIVO', '+', 'D7', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'POTENCIOMETRO', 'Terminal A', '5V', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'POTENCIOMETRO', 'Wiper', 'A0', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'POTENCIOMETRO', 'Terminal B', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'PWM', 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'SERVOMOTOR SG90', 'VCC', '5V', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'PULSADOR DO', 'Pin 1', 'D2', 'INPUT_PULLUP', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'PULSADOR RE', 'Pin 1', 'D3', 'INPUT_PULLUP', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'PULSADOR MI', 'Pin 1', 'D4', 'INPUT_PULLUP', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'BUZZER ACTIVO', '+', 'D8', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'SENSOR HC-SR04', 'Trig', 'D9', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'SENSOR HC-SR04', 'Echo', 'D10', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'LED (contador)', 'Anodo (+)', 'D8', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'contador-personas'), 'BUZZER ACTIVO', '+', 'D7', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'SENSOR HC-SR04', 'Trig', 'D9', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'SENSOR HC-SR04', 'Echo', 'D10', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'dispensador-automatico'), 'BUZZER ACTIVO', '+', 'D7', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'SENSOR HC-SR04', 'Trig', 'D9', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'SENSOR HC-SR04', 'Echo', 'D10', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'puerta-automatica'), 'LED (puerta abierta)', 'Anodo (+)', 'D8', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'SENSOR HC-SR04', 'Trig', 'D9', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'SENSOR HC-SR04', 'Echo', 'D10', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'BUZZER ACTIVO', '+', 'D7', NULL, 3),
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
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'control-tomacorrientes'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'automatizacion-ventiladores'), 'SENSOR PIR HC-SR501', 'OUT', 'GPIO27', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'automatizacion-ventiladores'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'timbre-inteligente'), 'PULSADOR (timbre)', 'Pin 1', 'GPIO14', 'INPUT_PULLUP, mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'timbre-inteligente'), 'BUZZER ACTIVO', '+', 'GPIO25', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'timbre-inteligente'), 'LED (notificacion)', 'Anodo (+)', 'GPIO33', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'timbre-inteligente'), 'LED (notificacion)', 'Catodo (-)', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'control-desde-celular'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'control-desde-celular'), 'SENSOR PIR HC-SR501', 'OUT', 'GPIO27', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'LDR + R1K (divisor)', 'Punto medio', 'GPIO32', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'LED ROJO (habitacion 1)', 'Anodo (+)', 'GPIO18', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'LED VERDE (habitacion 2)', 'Anodo (+)', 'GPIO5', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'PULSADOR (timbre)', 'Pin 1', 'GPIO27', 'INPUT_PULLUP', 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'casa-inteligente-simulada'), 'BUZZER ACTIVO', '+', 'GPIO19', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'SENSOR HC-SR04P', 'Trig', 'GPIO17', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'SENSOR HC-SR04P', 'Echo', 'GPIO16', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'LED ROJO (alarma)', 'Anodo (+)', 'GPIO18', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'sistema-seguridad-iot'), 'BUZZER ACTIVO', '+', 'GPIO19', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-remoto-internet'), 'SENSOR DHT11', 'DATA', 'GPIO4', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-remoto-internet'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'GPIO35', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'dashboard-mqtt'), 'SENSOR DHT11', 'DATA', 'GPIO4', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'GPIO35', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'SENSOR HC-SR04P', 'Trig', 'GPIO17', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'SENSOR HC-SR04P', 'Echo', 'GPIO16', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'LED ROJO (alerta)', 'Anodo (+)', 'GPIO18', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'automatizacion-sensores'), 'BUZZER ACTIVO', '+', 'GPIO19', NULL, 5)
ON CONFLICT (proyecto_id, componente, pin_componente) DO UPDATE SET
  pin_placa = EXCLUDED.pin_placa, nota = EXCLUDED.nota, orden = EXCLUDED.orden;

-- ============================================================
-- 3. KIT_ESQUEMAS (solo adicionales con armado distinto al principal)
-- ============================================================
INSERT INTO kit_esquemas (proyecto_id, tipo, contenido, version) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'detector-obstaculos'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="440" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Detector de obstaculos</text><rect x="30" y="60" width="160" height="320" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="300" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="342" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="354" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="330" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="220" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR IR FC-51</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">OUT</text><rect x="760" y="150" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED AZUL (alerta)</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">Anodo (+) via R220</text><circle cx="760" cy="214" r="3.5" fill="#1f2937"/><text x="770" y="218" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><rect x="760" y="260" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="280" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="304" r="3.5" fill="#1f2937"/><text x="770" y="308" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="760" cy="324" r="3.5" fill="#1f2937"/><text x="770" y="328" font-size="10" font-style="normal" fill="#44403c">-</text><circle cx="190" cy="113.33333333333334" r="3.5" fill="#2563eb"/><path d="M 190 113.33333333333334 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="108.33333333333334" font-size="10" font-weight="bold" fill="#2563eb">D4</text><text x="216" y="108.66666666666667" font-size="8.5" fill="#57534e">LOW = detecta</text><circle cx="190" cy="166.66666666666669" r="3.5" fill="#16a34a"/><path d="M 190 166.66666666666669 H 214 V 194 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="161.66666666666669" font-size="10" font-weight="bold" fill="#16a34a">D5</text><circle cx="190" cy="220" r="3.5" fill="#111827"/><path d="M 190 220 H 218 V 214 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="215" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="273.33333333333337" r="3.5" fill="#9333ea"/><path d="M 190 273.33333333333337 H 222 V 304 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="268.33333333333337" font-size="10" font-weight="bold" fill="#9333ea">D7</text><circle cx="190" cy="326.6666666666667" r="3.5" fill="#111827"/><path d="M 190 326.6666666666667 H 226 V 324 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="321.6666666666667" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="410" width="14" height="14" fill="#dc2626"/><text x="50" y="422" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="410" width="14" height="14" fill="#111827"/><text x="250" y="422" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="410" width="14" height="14" fill="#2563eb"/><text x="400" y="422" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'control-servomotor'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="440" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Control de servomotor con potenciometro</text><rect x="30" y="60" width="160" height="320" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="300" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="342" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="354" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="330" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="220" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">POTENCIOMETRO</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Terminal A</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">Wiper</text><circle cx="760" cy="144" r="3.5" fill="#1f2937"/><text x="770" y="148" font-size="10" font-style="normal" fill="#44403c">Terminal B</text><rect x="760" y="190" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="210" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SERVOMOTOR SG90</text><circle cx="760" cy="234" r="3.5" fill="#1f2937"/><text x="770" y="238" font-size="10" font-style="normal" fill="#44403c">Senal</text><circle cx="760" cy="254" r="3.5" fill="#1f2937"/><text x="770" y="258" font-size="10" font-style="normal" fill="#44403c">VCC</text><circle cx="760" cy="274" r="3.5" fill="#1f2937"/><text x="770" y="278" font-size="10" font-style="normal" fill="#44403c">GND</text><circle cx="190" cy="105.71428571428572" r="3.5" fill="#dc2626"/><path d="M 190 105.71428571428572 H 210 V 104 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="100.71428571428572" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="151.42857142857144" r="3.5" fill="#16a34a"/><path d="M 190 151.42857142857144 H 214 V 124 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="146.42857142857144" font-size="10" font-weight="bold" fill="#16a34a">A0</text><circle cx="190" cy="197.14285714285714" r="3.5" fill="#111827"/><path d="M 190 197.14285714285714 H 218 V 144 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="192.14285714285714" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="242.85714285714286" r="3.5" fill="#9333ea"/><path d="M 190 242.85714285714286 H 222 V 234 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="237.85714285714286" font-size="10" font-weight="bold" fill="#9333ea">D6</text><text x="228" y="238.42857142857144" font-size="8.5" fill="#57534e">PWM</text><circle cx="190" cy="288.57142857142856" r="3.5" fill="#dc2626"/><path d="M 190 288.57142857142856 H 226 V 254 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="283.57142857142856" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="334.2857142857143" r="3.5" fill="#111827"/><path d="M 190 334.2857142857143 H 210 V 274 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="329.2857142857143" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="410" width="14" height="14" fill="#dc2626"/><text x="50" y="422" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="410" width="14" height="14" fill="#111827"/><text x="250" y="422" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="410" width="14" height="14" fill="#2563eb"/><text x="400" y="422" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'piano-pulsadores'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 460" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="460" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Piano con pulsadores</text><rect x="30" y="60" width="160" height="340" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="320" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="362" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="374" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="350" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="350" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="230" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR DO</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><rect x="760" y="150" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR RE</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><rect x="760" y="240" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="260" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR MI</text><circle cx="760" cy="284" r="3.5" fill="#1f2937"/><text x="770" y="288" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><rect x="760" y="330" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="350" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="374" r="3.5" fill="#1f2937"/><text x="770" y="378" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="190" cy="128" r="3.5" fill="#2563eb"/><path d="M 190 128 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="123" font-size="10" font-weight="bold" fill="#2563eb">D2</text><text x="216" y="116" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="196" r="3.5" fill="#16a34a"/><path d="M 190 196 H 214 V 194 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="191" font-size="10" font-weight="bold" fill="#16a34a">D3</text><text x="220" y="195" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="264" r="3.5" fill="#ea580c"/><path d="M 190 264 H 218 V 284 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="259" font-size="10" font-weight="bold" fill="#ea580c">D4</text><text x="224" y="274" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><circle cx="190" cy="332" r="3.5" fill="#9333ea"/><path d="M 190 332 H 222 V 374 H 760" fill="none" stroke="#9333ea" stroke-width="2.2"/><text x="196" y="327" font-size="10" font-weight="bold" fill="#9333ea">D8</text><rect x="30" y="430" width="14" height="14" fill="#dc2626"/><text x="50" y="442" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="430" width="14" height="14" fill="#111827"/><text x="250" y="442" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="430" width="14" height="14" fill="#2563eb"/><text x="400" y="442" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'alarma-proximidad'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 520" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="520" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Alarma de proximidad</text><rect x="30" y="60" width="160" height="400" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">(CH340)</text><rect x="300" y="70" width="400" height="380" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="422" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="434" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="410" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="410" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="260" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR HC-SR04</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Trig</text><circle cx="760" cy="124" r="3.5" fill="#1f2937"/><text x="770" y="128" font-size="10" font-style="normal" fill="#44403c">Echo</text><rect x="760" y="170" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="190" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="214" r="3.5" fill="#1f2937"/><text x="770" y="218" font-size="10" font-style="normal" fill="#44403c">+</text><rect x="760" y="260" width="210" height="108" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="280" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">POTENCIOMETRO (sensibilidad)</text><circle cx="760" cy="304" r="3.5" fill="#1f2937"/><text x="770" y="308" font-size="10" font-style="normal" fill="#44403c">Terminal A</text><circle cx="760" cy="324" r="3.5" fill="#1f2937"/><text x="770" y="328" font-size="10" font-style="normal" fill="#44403c">Wiper</text><circle cx="760" cy="344" r="3.5" fill="#1f2937"/><text x="770" y="348" font-size="10" font-style="normal" fill="#44403c">Terminal B</text><rect x="760" y="390" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="410" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR (on/off)</text><circle cx="760" cy="434" r="3.5" fill="#1f2937"/><text x="770" y="438" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><circle cx="190" cy="110" r="3.5" fill="#2563eb"/><path d="M 190 110 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="105" font-size="10" font-weight="bold" fill="#2563eb">D9</text><circle cx="190" cy="160" r="3.5" fill="#16a34a"/><path d="M 190 160 H 214 V 124 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="155" font-size="10" font-weight="bold" fill="#16a34a">D10</text><circle cx="190" cy="210" r="3.5" fill="#ea580c"/><path d="M 190 210 H 218 V 214 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="205" font-size="10" font-weight="bold" fill="#ea580c">D7</text><circle cx="190" cy="260" r="3.5" fill="#dc2626"/><path d="M 190 260 H 222 V 304 H 760" fill="none" stroke="#dc2626" stroke-width="2.2"/><text x="196" y="255" font-size="10" font-weight="bold" fill="#dc2626">5V</text><circle cx="190" cy="310" r="3.5" fill="#0891b2"/><path d="M 190 310 H 226 V 324 H 760" fill="none" stroke="#0891b2" stroke-width="2.2"/><text x="196" y="305" font-size="10" font-weight="bold" fill="#0891b2">A0</text><circle cx="190" cy="360" r="3.5" fill="#111827"/><path d="M 190 360 H 210 V 344 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="355" font-size="10" font-weight="bold" fill="#111827">GND</text><circle cx="190" cy="410" r="3.5" fill="#db2777"/><path d="M 190 410 H 214 V 434 H 760" fill="none" stroke="#db2777" stroke-width="2.2"/><text x="196" y="405" font-size="10" font-weight="bold" fill="#db2777">D2</text><text x="220" y="422" font-size="8.5" fill="#57534e">INPUT_PULLUP</text><rect x="30" y="490" width="14" height="14" fill="#dc2626"/><text x="50" y="502" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="490" width="14" height="14" fill="#111827"/><text x="250" y="502" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="490" width="14" height="14" fill="#2563eb"/><text x="400" y="502" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'contador-visitas'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="440" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Contador de visitas</text><rect x="30" y="60" width="160" height="320" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">3.3V logic</text><rect x="300" y="70" width="400" height="300" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="342" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="354" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="330" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="220" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">SENSOR IR FC-51</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">OUT</text><rect x="760" y="150" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">+</text><circle cx="190" cy="166.66666666666669" r="3.5" fill="#2563eb"/><path d="M 190 166.66666666666669 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="161.66666666666669" font-size="10" font-weight="bold" fill="#2563eb">GPIO3</text><text x="216" y="135.33333333333334" font-size="8.5" fill="#57534e">LOW = detecta</text><circle cx="190" cy="273.33333333333337" r="3.5" fill="#16a34a"/><path d="M 190 273.33333333333337 H 214 V 194 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="268.33333333333337" font-size="10" font-weight="bold" fill="#16a34a">GPIO4</text><text x="220" y="233.66666666666669" font-size="8.5" fill="#57534e">mismo que el principal</text><rect x="30" y="410" width="14" height="14" fill="#dc2626"/><text x="50" y="422" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="410" width="14" height="14" fill="#111827"/><text x="250" y="422" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="410" width="14" height="14" fill="#2563eb"/><text x="400" y="422" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'timbre-inteligente'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 440" font-family="Verdana, Arial, sans-serif"><rect x="0" y="0" width="1000" height="440" fill="#ffffff"/><text x="500" y="28" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Timbre inteligente</text><rect x="30" y="60" width="160" height="320" rx="10" fill="#0ea5e9" fill-opacity="0.12" stroke="#0369a1" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="13" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="110" y="100" text-anchor="middle" font-size="10" fill="#0c4a6e">30 pines</text><rect x="300" y="70" width="400" height="300" rx="6" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2"/><rect x="310" y="80" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="92" width="380" height="6" fill="#111827" fill-opacity="0.55"/><rect x="310" y="342" width="380" height="6" fill="#dc2626" fill-opacity="0.55"/><rect x="310" y="354" width="380" height="6" fill="#111827" fill-opacity="0.55"/><line x1="320" y1="110" x2="320" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="334" y1="110" x2="334" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="348" y1="110" x2="348" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="362" y1="110" x2="362" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="376" y1="110" x2="376" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="390" y1="110" x2="390" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="404" y1="110" x2="404" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="418" y1="110" x2="418" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="432" y1="110" x2="432" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="446" y1="110" x2="446" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="460" y1="110" x2="460" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="474" y1="110" x2="474" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="488" y1="110" x2="488" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="502" y1="110" x2="502" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="516" y1="110" x2="516" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="530" y1="110" x2="530" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="544" y1="110" x2="544" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="558" y1="110" x2="558" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="572" y1="110" x2="572" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="586" y1="110" x2="586" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="600" y1="110" x2="600" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="614" y1="110" x2="614" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="628" y1="110" x2="628" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="642" y1="110" x2="642" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="656" y1="110" x2="656" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="670" y1="110" x2="670" y2="330" stroke="#e7e5e4" stroke-width="1"/><line x1="684" y1="110" x2="684" y2="330" stroke="#e7e5e4" stroke-width="1"/><text x="500" y="220" text-anchor="middle" font-size="11" fill="#a8a29e">PROTOBOARD 400 PUNTOS</text><rect x="760" y="60" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="80" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">PULSADOR (timbre)</text><circle cx="760" cy="104" r="3.5" fill="#1f2937"/><text x="770" y="108" font-size="10" font-style="normal" fill="#44403c">Pin 1</text><rect x="760" y="150" width="210" height="68" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="170" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">BUZZER ACTIVO</text><circle cx="760" cy="194" r="3.5" fill="#1f2937"/><text x="770" y="198" font-size="10" font-style="normal" fill="#44403c">+</text><rect x="760" y="240" width="210" height="88" rx="8" fill="#fef3c7" fill-opacity="0.5" stroke="#b45309" stroke-width="1.6"/><text x="865" y="260" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#78350f">LED (notificacion)</text><circle cx="760" cy="284" r="3.5" fill="#1f2937"/><text x="770" y="288" font-size="10" font-style="normal" fill="#44403c">Anodo (+)</text><circle cx="760" cy="304" r="3.5" fill="#1f2937"/><text x="770" y="308" font-size="10" font-style="normal" fill="#44403c">Catodo (-)</text><circle cx="190" cy="124" r="3.5" fill="#2563eb"/><path d="M 190 124 H 210 V 104 H 760" fill="none" stroke="#2563eb" stroke-width="2.2"/><text x="196" y="119" font-size="10" font-weight="bold" fill="#2563eb">GPIO14</text><text x="216" y="114" font-size="8.5" fill="#57534e">INPUT_PULLUP, mismo que el principal</text><circle cx="190" cy="188" r="3.5" fill="#16a34a"/><path d="M 190 188 H 214 V 194 H 760" fill="none" stroke="#16a34a" stroke-width="2.2"/><text x="196" y="183" font-size="10" font-weight="bold" fill="#16a34a">GPIO25</text><text x="220" y="191" font-size="8.5" fill="#57534e">mismo que el principal</text><circle cx="190" cy="252" r="3.5" fill="#ea580c"/><path d="M 190 252 H 218 V 284 H 760" fill="none" stroke="#ea580c" stroke-width="2.2"/><text x="196" y="247" font-size="10" font-weight="bold" fill="#ea580c">GPIO33</text><circle cx="190" cy="316" r="3.5" fill="#111827"/><path d="M 190 316 H 222 V 304 H 760" fill="none" stroke="#111827" stroke-width="2.2"/><text x="196" y="311" font-size="10" font-weight="bold" fill="#111827">GND</text><rect x="30" y="410" width="14" height="14" fill="#dc2626"/><text x="50" y="422" font-size="11" fill="#1c1917">Rojo = VCC / 5V / 3.3V</text><rect x="230" y="410" width="14" height="14" fill="#111827"/><text x="250" y="422" font-size="11" fill="#1c1917">Negro = GND</text><rect x="380" y="410" width="14" height="14" fill="#2563eb"/><text x="400" y="422" font-size="11" fill="#1c1917">Otros colores = senal digital / analogica</text></svg>', 1)
ON CONFLICT (proyecto_id, tipo, version) DO UPDATE SET contenido = EXCLUDED.contenido;

-- ============================================================
-- 4. KIT_CODIGOS (6 principales + 25 adicionales = 31 sketches)
-- ============================================================
-- Constraint de idempotencia que faltaba para kit_codigos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kit_codigos_unico') THEN
    ALTER TABLE kit_codigos ADD CONSTRAINT kit_codigos_unico UNIQUE (proyecto_id, lenguaje, version);
  END IF;
END $$;

INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'semaforo-inteligente'), 'arduino', '/*
  Semaforo inteligente con paso peatonal
  Kit 8vo EGB - Arduino UNO R3
  Academia Lizardo Villamarin

  El semaforo cicla rojo -> verde -> amarillo -> rojo. Si un peaton
  presiona el pulsador mientras el semaforo esta en verde, se corta
  el ciclo, pasa a amarillo y luego a rojo para dejar cruzar,
  avisando con el buzzer.
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
  // INPUT_PULLUP: el pin esta en HIGH por defecto y baja a LOW al presionar.
  // No se necesita resistencia externa en el pulsador.
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
    digitalWrite(BUZZER, HIGH);
    delay(150);
    digitalWrite(BUZZER, LOW);
    delay(150);
  }
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
  Academia Lizardo Villamarin

  Un sensor ultrasonico mide la distancia a la mano o al objeto. Si
  esta lo bastante cerca, el servomotor abre la tapa, suena el buzzer
  para confirmar y se enciende un LED mientras la tapa esta abierta.
*/

#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int BUZZER = 7;
const int LED_TAPA = 8;

const int DISTANCIA_APERTURA_CM = 15;
const int ANGULO_CERRADO = 0;
const int ANGULO_ABIERTO = 90;
const unsigned long TIEMPO_ABIERTA_MS = 3000;

Servo tapa;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
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
  tone(BUZZER, 1000, 150);
  digitalWrite(LED_TAPA, HIGH);
  delay(TIEMPO_ABIERTA_MS);
  tapa.write(ANGULO_CERRADO);
  digitalWrite(LED_TAPA, LOW);
  delay(500);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'sistema-riego-automatico'), 'arduino', '/*
  Sistema de riego automatico para plantas
  Kit 10mo EGB - Arduino Nano V3 (Micro-USB)
  Academia Lizardo Villamarin

  Lee la humedad de la tierra. Si esta por debajo del umbral (ajustable
  con el potenciometro), enciende la bomba de agua a traves del rele
  durante unos segundos. El pulsador fuerza un riego manual. Los LEDs
  muestran el estado: rojo = regando, amarillo = humedad baja, verde =
  humedad correcta.

  IMPORTANTE: la bomba y el rele llevan su propia alimentacion
  (portapilas 4xAA). El Nano solo controla el rele; el GND debe ser
  comun entre el Nano y la alimentacion de la bomba.

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
  Academia Lizardo Villamarin

  Lee temperatura y humedad (DHT11) y nivel de luz (LDR), y clasifica
  las lecturas con 3 LEDs: verde = normal, amarillo = humedad alta,
  rojo = temperatura alta. El pulsador cambia entre mostrar
  temperatura/humedad o luz por el Monitor Serial.

  Requiere instalar en el Arduino IDE: "DHT sensor library" (Adafruit)
  y su dependencia "Adafruit Unified Sensor".

  IMPORTANTE: ESP32-C3 trabaja a 3.3V. No conectar ningun componente
  de 5V directo a sus pines.
*/

#include <DHT.h>

const int PIN_LDR = 0;
const int PIN_POT = 1;
const int PIN_DHT = 3;
const int BUZZER = 4;
const int LED_ROJO = 5;
const int LED_AMARILLO = 6;
const int LED_VERDE = 7;
const int PULSADOR = 10;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

bool mostrarLuz = false;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
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

  bool alertaTemp = (!isnan(temperatura) && temperatura > sensibilidad);
  bool alertaHumedad = (!isnan(humedad) && humedad > 70);

  digitalWrite(LED_ROJO, alertaTemp ? HIGH : LOW);
  digitalWrite(LED_AMARILLO, alertaHumedad ? HIGH : LOW);
  digitalWrite(LED_VERDE, (!alertaTemp && !alertaHumedad) ? HIGH : LOW);

  if (alertaTemp) tone(BUZZER, 2000, 200);

  delay(2000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'domotica-inteligente'), 'arduino', '/*
  Control inteligente de dispositivos electricos en el hogar
  Kit 2do BGU - ESP32 DevKit V1 (30 pines)
  Academia Lizardo Villamarin

  Enciende automaticamente una "luz" (representada con un LED en el
  diagrama por seguridad) cuando detecta movimiento Y hay poca luz
  ambiental. El pulsador permite forzar el encendido/apagado manual.

  SEGURIDAD: el rele con optoacoplador es el que realmente conmuta
  110V (enchufe -> interruptor -> rele -> boquilla). Esa parte del
  circuito SOLO se arma y se prueba con el docente presente. En este
  sketch, el ESP32 nunca toca 110V directamente: solo activa la
  bobina del rele a traves de GPIO26.
*/

const int PIN_PIR = 27;
const int PIN_LDR = 34;
const int PIN_RELE = 26;
const int PIN_BUZZER = 25;
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
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_PULSADOR, INPUT_PULLUP);
  digitalWrite(PIN_RELE, LOW);
}

void loop() {
  if (digitalRead(PIN_PULSADOR) == LOW) {
    modoManual = !modoManual;
    manualEncendido = !manualEncendido;
    tone(PIN_BUZZER, 1000, 100);
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
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'monitoreo-automatizacion-iot'), 'arduino', '/*
  Sistema inteligente de monitoreo y automatizacion completo
  Kit 3ro BGU - ESP32 DevKit V1 (30 pines)
  Academia Lizardo Villamarin

  Muestra temperatura, humedad, humedad del suelo y distancia en una
  pantalla LCD 16x2 (via I2C, a traves del conversor de nivel logico
  3.3V-5V). El pulsador cambia entre pantallas. Un LED y un buzzer
  avisan si algun valor sale de rango.

  Requiere instalar: "LiquidCrystal I2C" y "DHT sensor library"
  (Adafruit) + su dependencia "Adafruit Unified Sensor".

  No se usa rele en este kit (no se trabaja con 110V).
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

const int PIN_DHT = 4;
const int PIN_SOIL = 35;
const int PIN_TRIG = 17;
const int PIN_ECHO = 16;
const int PIN_LDR = 32;
const int PIN_POT = 33;
const int PIN_BUZZER = 19;
const int LED_ROJO = 18;
const int LED_VERDE = 5;
const int PIN_PULSADOR = 27;

#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2); // si no aparece nada, prueba con 0x3F

int pantallaActual = 0;
const int TOTAL_PANTALLAS = 3;

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.init();
  lcd.backlight();
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(PIN_PULSADOR, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(PIN_PULSADOR) == LOW) {
    pantallaActual = (pantallaActual + 1) % TOTAL_PANTALLAS;
    lcd.clear();
    delay(300);
  }

  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  int humedadSuelo = analogRead(PIN_SOIL);
  long distanciaCm = medirDistanciaCm();
  int luz = analogRead(PIN_LDR);
  int umbralDistancia = map(analogRead(PIN_POT), 0, 4095, 5, 100);

  lcd.setCursor(0, 0);
  if (pantallaActual == 0) {
    lcd.print("Temp:"); lcd.print(temperatura, 1); lcd.print("C");
    lcd.setCursor(0, 1);
    lcd.print("Hum:"); lcd.print(humedad, 0); lcd.print("%");
  } else if (pantallaActual == 1) {
    lcd.print("Suelo:"); lcd.print(humedadSuelo);
    lcd.setCursor(0, 1);
    lcd.print("Luz:"); lcd.print(luz);
  } else {
    lcd.print("Distancia:");
    lcd.setCursor(0, 1);
    lcd.print(distanciaCm); lcd.print(" cm");
  }

  bool alerta = (distanciaCm > 0 && distanciaCm < umbralDistancia) ||
                (!isnan(temperatura) && temperatura > 32);
  digitalWrite(LED_ROJO, alerta ? HIGH : LOW);
  digitalWrite(LED_VERDE, alerta ? LOW : HIGH);
  if (alerta) tone(PIN_BUZZER, 1800, 150);

  delay(800);
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
  enciende un LED y suena el buzzer.
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
  buzzer). Si el pulsador se suelta (simula que la puerta se abre),
  dispara la alarma.

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
  // LOW = pulsador presionado = "puerta cerrada"
  // HIGH = pulsador suelto = simula "puerta abierta"
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
  Cada pulsador suena una nota distinta en el buzzer.
*/
const int PULSADOR_DO = 2;
const int PULSADOR_RE = 3;
const int PULSADOR_MI = 4;
const int BUZZER = 8;

const int NOTA_DO = 262;
const int NOTA_RE = 294;
const int NOTA_MI = 330;

void setup() {
  pinMode(PULSADOR_DO, INPUT_PULLUP);
  pinMode(PULSADOR_RE, INPUT_PULLUP);
  pinMode(PULSADOR_MI, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(PULSADOR_DO) == LOW) {
    tone(BUZZER, NOTA_DO);
  } else if (digitalRead(PULSADOR_RE) == LOW) {
    tone(BUZZER, NOTA_RE);
  } else if (digitalRead(PULSADOR_MI) == LOW) {
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
  algo pasa frente al sensor, suma 1 al contador y lo muestra por el
  Monitor Serial (no hay pantalla en este kit).
*/
const int TRIG = 9;
const int ECHO = 10;
const int LED_CONTADOR = 8;
const int BUZZER = 7;

const int DISTANCIA_DETECCION_CM = 20;
int contador = 0;
bool detectadoAntes = false;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_CONTADOR, OUTPUT);
  pinMode(BUZZER, OUTPUT);
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
    tone(BUZZER, 1500, 80);
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
  servomotor abre la compuerta un momento y la vuelve a cerrar.
*/
#include <Servo.h>

const int TRIG = 9;
const int ECHO = 10;
const int SERVO_PIN = 6;
const int BUZZER = 7;

const int DISTANCIA_CM = 10;
const unsigned long TIEMPO_ABIERTO_MS = 1000;

Servo compuerta;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  compuerta.attach(SERVO_PIN);
  compuerta.write(0);
}

void loop() {
  long distancia = medirDistanciaCm();
  if (distancia > 0 && distancia <= DISTANCIA_CM) {
    compuerta.write(90);
    tone(BUZZER, 1000, 100);
    delay(TIEMPO_ABIERTO_MS);
    compuerta.write(0);
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
  Alarma de proximidad
  Kit 9no EGB - Arduino Nano V3 - Proyecto adicional
  Suena mas seguido mientras mas cerca esta un objeto del sensor. El
  potenciometro ajusta la sensibilidad y el pulsador enciende/apaga
  la alarma.
*/
const int TRIG = 9;
const int ECHO = 10;
const int BUZZER = 7;
const int POTENCIOMETRO = A0;
const int PULSADOR_ON_OFF = 2;

bool alarmaEncendida = true;
bool pulsadorAntes = false;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
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
    noTone(BUZZER);
    return;
  }

  long distancia = medirDistanciaCm();
  int sensibilidadCm = map(analogRead(POTENCIOMETRO), 0, 1023, 10, 100);

  if (distancia > 0 && distancia <= sensibilidadCm) {
    int pausa = map(distancia, 0, sensibilidadCm, 50, 400);
    tone(BUZZER, 2000, 80);
    delay(pausa);
  } else {
    noTone(BUZZER);
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
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'control-tomacorrientes'), 'arduino', '/*
  Control de tomacorrientes con apagado automatico
  Kit 2do BGU - ESP32 DevKit V1 - Proyecto adicional
  Mismo armado de la domotica inteligente. Como el control remoto de
  luces, pero pensado para un tomacorriente: ademas, se apaga solo
  despues de un tiempo maximo por seguridad (evita dejar un aparato
  encendido olvidado).
*/
#include <WiFi.h>
#include <WebServer.h>

const char* RED_WIFI = "NOMBRE_DE_TU_WIFI";
const char* CLAVE_WIFI = "CLAVE_DE_TU_WIFI";
const int PIN_RELE = 26;
const unsigned long TIEMPO_MAXIMO_MS = 2UL * 60UL * 60UL * 1000UL; // 2 horas

WebServer servidor(80);
bool encendido = false;
unsigned long momentoEncendido = 0;

void manejarRaiz() {
  String html = "<html><body><h1>Control de tomacorriente</h1>";
  html += "<p>Estado: " + String(encendido ? "ENCENDIDO" : "APAGADO") + "</p>";
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
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println();
  Serial.println("IP del ESP32: " + WiFi.localIP().toString());

  servidor.on("/", manejarRaiz);
  servidor.on("/on", []() {
    encendido = true;
    momentoEncendido = millis();
    digitalWrite(PIN_RELE, HIGH);
    manejarRaiz();
  });
  servidor.on("/off", []() {
    encendido = false;
    digitalWrite(PIN_RELE, LOW);
    manejarRaiz();
  });
  servidor.begin();
}

void loop() {
  servidor.handleClient();
  if (encendido && millis() - momentoEncendido > TIEMPO_MAXIMO_MS) {
    encendido = false;
    digitalWrite(PIN_RELE, LOW);
    Serial.println("Apagado automatico por tiempo maximo.");
  }
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
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'timbre-inteligente'), 'arduino', '/*
  Timbre inteligente
  Kit 2do BGU - ESP32 DevKit V1 - Proyecto adicional
  Al presionar el pulsador (boton del timbre), suena el buzzer y
  parpadea un LED como notificacion visual para personas con
  dificultad auditiva.
*/
const int PIN_PULSADOR = 14;
const int PIN_BUZZER = 25;
const int LED_NOTIFICACION = 33;

void setup() {
  pinMode(PIN_PULSADOR, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(LED_NOTIFICACION, OUTPUT);
}

void loop() {
  if (digitalRead(PIN_PULSADOR) == LOW) {
    for (int i = 0; i < 4; i++) {
      digitalWrite(LED_NOTIFICACION, HIGH);
      tone(PIN_BUZZER, 1800, 150);
      delay(200);
      digitalWrite(LED_NOTIFICACION, LOW);
      delay(150);
    }
    delay(500);
  }
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
  Mismo armado del sistema de monitoreo principal. Usa el LED rojo y
  el LED verde para representar dos "habitaciones" que se encienden
  segun la luz ambiental (LDR), y el buzzer como timbre de la casa
  simulada mediante el pulsador.
*/
const int PIN_LDR = 32;
const int LED_HABITACION_1 = 18;
const int LED_HABITACION_2 = 5;
const int PIN_PULSADOR = 27;
const int BUZZER = 19;

const int UMBRAL_OSCURIDAD = 1800;

void setup() {
  pinMode(LED_HABITACION_1, OUTPUT);
  pinMode(LED_HABITACION_2, OUTPUT);
  pinMode(PIN_PULSADOR, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  bool oscuro = luz < UMBRAL_OSCURIDAD;

  digitalWrite(LED_HABITACION_1, oscuro ? HIGH : LOW);
  digitalWrite(LED_HABITACION_2, oscuro ? HIGH : LOW);

  if (digitalRead(PIN_PULSADOR) == LOW) {
    tone(BUZZER, 1800, 200);
  }

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
  temperatura, humedad y humedad del suelo a un servidor propio cada
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
const int PIN_SOIL = 35;
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
    int suelo = analogRead(PIN_SOIL);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(URL_SERVIDOR);
      http.addHeader("Content-Type", "application/json");
      String json = "{\"temperatura\":" + String(t) + ",\"humedad\":" + String(h) +
                    ",\"humedad_suelo\":" + String(suelo) + "}";
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
  Mismo armado del sistema de monitoreo principal. Combina varios
  sensores en una sola regla de decision: enciende el LED de alerta
  si la tierra esta seca, o si hay algo muy cerca - lo que pase
  primero.
*/
const int PIN_SOIL = 35;
const int PIN_TRIG = 17;
const int PIN_ECHO = 16;
const int LED_ALERTA = 18;
const int BUZZER = 19;

// ESP32 usa un ADC de 12 bits (0-4095). Prueba tu sensor y ajusta
// este umbral: valores mas altos suelen indicar tierra mas seca.
const int UMBRAL_SUELO_SECO = 2400;
const int DISTANCIA_CERCA_CM = 15;

void setup() {
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(LED_ALERTA, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  int suelo = analogRead(PIN_SOIL);
  long distancia = medirDistanciaCm();

  bool sueloSeco = suelo > UMBRAL_SUELO_SECO;
  bool algoCerca = (distancia > 0 && distancia <= DISTANCIA_CERCA_CM);
  bool alerta = sueloSeco || algoCerca;

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
', 1)
ON CONFLICT (proyecto_id, lenguaje, version) DO UPDATE SET contenido = EXCLUDED.contenido;
