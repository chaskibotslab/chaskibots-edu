-- ============================================================
-- FASE 12: 4 practicas por kit (3 en 9no EGB, que solo tiene 3
-- materiales reales en su proyecto principal -- forzar una 4ta
-- hubiera sido relleno sin sentido pedagogico).
-- ============================================================

INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden) VALUES
  ('kit-lv-octavo-egb', 'Enciende tu primer LED', 'practica-primer-led', 'practica', 'Antes de armar el semáforo completo, practica con una sola pieza: hacer que un LED parpadee.', ARRAY['Usar pinMode() y digitalWrite() para controlar una salida digital.', 'Entender por qué un LED necesita una resistencia en serie.'], -4),
  ('kit-lv-octavo-egb', 'Lee un pulsador', 'practica-pulsador', 'practica', 'Practica con el pulsador solo: enciende el LED mientras lo mantienes presionado.', ARRAY['Leer una entrada digital con digitalRead().', 'Usar INPUT_PULLUP para no necesitar una resistencia externa en el pulsador.'], -3),
  ('kit-lv-octavo-egb', 'Haz sonar el buzzer', 'practica-buzzer', 'practica', 'Practica con el buzzer solo: hazlo sonar antes de usarlo como aviso sonoro del semáforo.', ARRAY['Generar un sonido con tone() en un buzzer pasivo.', 'Detener un sonido con noTone().'], -2),
  ('kit-lv-octavo-egb', 'Enciende los 3 LEDs en secuencia', 'practica-tres-leds', 'practica', 'Último paso antes del semáforo: enciende los 3 colores uno tras otro, como el semáforo real.', ARRAY['Controlar varios pines de salida en el mismo programa.', 'Usar una secuencia ordenada de digitalWrite() y delay() como base del semáforo.'], -1),
  ('kit-lv-noveno-egb', 'Enciende el LED indicador', 'practica-led-tapa', 'practica', 'Antes del basurero completo, practica con el LED solo: es el que avisa que la tapa está abierta.', ARRAY['Usar pinMode() y digitalWrite() para controlar una salida digital.', 'Entender por qué un LED necesita una resistencia en serie.'], -3),
  ('kit-lv-noveno-egb', 'Mide distancia con el sensor ultrasónico', 'practica-sensor-distancia', 'practica', 'Antes del basurero inteligente, practica con el sensor solo: mide la distancia y míralo en el Monitor Serial.', ARRAY['Entender como un sensor ultrasonico mide distancia con un pulso de sonido.', 'Usar el Monitor Serial para ver datos en tiempo real.'], -2),
  ('kit-lv-noveno-egb', 'Mueve el servomotor', 'practica-servomotor', 'practica', 'Practica con el servomotor solo: hazlo girar de un lado a otro antes de usarlo como tapa del basurero.', ARRAY['Controlar la posicion de un servomotor con la libreria Servo.', 'Entender el rango de movimiento de 0 a 180 grados.'], -1),
  ('kit-lv-decimo-egb', 'Lee la humedad del suelo', 'practica-humedad-suelo', 'practica', 'Antes del sistema de riego, practica con el sensor de humedad solo: mira sus valores en el Monitor Serial.', ARRAY['Leer un sensor analogico con analogRead().', 'Relacionar el valor numerico con tierra humeda o seca.'], -4),
  ('kit-lv-decimo-egb', 'Ajusta el umbral con el potenciómetro', 'practica-potenciometro', 'practica', 'Practica con el potenciómetro solo: gíralo y mira cómo cambia el valor en el Monitor Serial.', ARRAY['Leer un potenciómetro con analogRead().', 'Entender cómo un potenciómetro deja ajustar un umbral sin reprogramar el Arduino.'], -3),
  ('kit-lv-decimo-egb', 'Enciende la bomba con el relé', 'practica-rele', 'practica', 'Practica con el relé solo: enciéndelo y apágalo cada segundo antes de conectarlo al sensor.', ARRAY['Entender que un rele es un interruptor controlado por una señal digital.', 'Controlar un actuador de mayor corriente de forma segura.'], -2),
  ('kit-lv-decimo-egb', 'Riega manualmente con el pulsador', 'practica-pulsador-manual', 'practica', 'Último paso antes del sistema completo: practica el botón que fuerza el riego manual.', ARRAY['Leer una entrada digital con INPUT_PULLUP.', 'Combinar una entrada manual con la logica automatica del riego.'], -1),
  ('kit-lv-primero-bach', 'Lee temperatura y humedad', 'practica-dht11', 'practica', 'Antes de la estación meteorológica completa, practica con el sensor DHT11 solo.', ARRAY['Usar una libreria externa (DHT sensor library) por primera vez.', 'Leer dos datos distintos (temperatura y humedad) del mismo sensor.'], -3),
  ('kit-lv-primero-bach', 'Lee el sensor de luz', 'practica-ldr', 'practica', 'Practica con el LDR solo: mira cómo cambia el valor al tapar el sensor con la mano.', ARRAY['Leer un sensor analogico en un microcontrolador de 3.3V (rango 0-4095).', 'Relacionar el valor con mas luz o menos luz.'], -4),
  ('kit-lv-primero-bach', 'Lee el pulsador de modo', 'practica-pulsador-modo', 'practica', 'Practica con el pulsador solo: cada vez que lo presionas, cambia de modo en el Monitor Serial.', ARRAY['Leer una entrada digital con INPUT_PULLUP en un ESP32.', 'Detectar un cambio de estado (flanco) para contar presiones, no solo leer el nivel actual.'], -2),
  ('kit-lv-primero-bach', 'Haz sonar la alarma', 'practica-buzzer-meteo', 'practica', 'Último paso antes de la estación completa: practica el buzzer que avisará cuando un valor salga de rango.', ARRAY['Generar un sonido con tone() en un microcontrolador de 3.3V.', 'Detener un sonido con noTone().'], -1),
  ('kit-lv-segundo-bach', 'Detecta movimiento', 'practica-pir', 'practica', 'Antes de automatizar la luz, practica con el sensor PIR solo: mira cuándo detecta movimiento.', ARRAY['Leer una señal digital de un sensor de movimiento (PIR).', 'Entender que el PIR necesita unos segundos para calibrarse al encender.'], -4),
  ('kit-lv-segundo-bach', 'Lee el sensor de luz', 'practica-ldr-domotica', 'practica', 'Practica con el sensor de luz solo: mira cómo cambia el valor al tapar el sensor con la mano.', ARRAY['Leer un sensor analogico de luz en un ESP32 (rango 0-4095).', 'Relacionar el valor con mas luz o menos luz ambiental.'], -3),
  ('kit-lv-segundo-bach', 'Prueba el relé', 'practica-rele-domotica', 'practica', 'Practica con el relé solo: enciéndelo y apágalo antes de conectarlo al sensor de movimiento.', ARRAY['Controlar un rele con optoacoplador desde un ESP32.', 'Entender que el ESP32 solo activa la bobina del rele, nunca toca 110V directamente.'], -2),
  ('kit-lv-segundo-bach', 'Prueba el control manual', 'practica-pulsador-domotica', 'practica', 'Último paso antes de la domótica completa: practica el botón que enciende el dispositivo manualmente.', ARRAY['Leer una entrada digital con INPUT_PULLUP en un ESP32.', 'Entender por que un control manual sigue siendo util aunque todo sea automatico.'], -1),
  ('kit-lv-tercero-bach', 'Lee temperatura y humedad', 'practica-dht11-monitoreo', 'practica', 'Antes del sistema completo, practica con el sensor DHT11 solo.', ARRAY['Usar la libreria DHT sensor library por primera vez.', 'Leer dos datos distintos (temperatura y humedad) del mismo sensor.'], -4),
  ('kit-lv-tercero-bach', 'Muestra texto en la pantalla LCD', 'practica-lcd', 'practica', 'Antes del sistema completo, practica con la pantalla LCD sola: escribe un mensaje fijo.', ARRAY['Inicializar una pantalla LCD por el protocolo I2C.', 'Escribir texto en una posicion especifica de la pantalla.'], -2),
  ('kit-lv-tercero-bach', 'Mide la distancia', 'practica-distancia', 'practica', 'Practica con el sensor ultrasónico solo antes de combinarlo con el resto del sistema.', ARRAY['Medir distancia con un sensor ultrasonico tolerante a 3.3-5V.', 'Mostrar el resultado por el Monitor Serial.'], -3),
  ('kit-lv-tercero-bach', 'Lee el sensor de luz', 'practica-ldr-monitoreo', 'practica', 'Último paso antes del sistema completo: practica el sensor de luz que se mostrará en la pantalla LCD.', ARRAY['Leer un sensor analogico de luz en un ESP32 (rango 0-4095).', 'Relacionar el valor con mas luz o menos luz ambiental.'], -1)
ON CONFLICT (kit_id, slug) DO UPDATE SET
  titulo = EXCLUDED.titulo, descripcion = EXCLUDED.descripcion, objetivos = EXCLUDED.objetivos, orden = EXCLUDED.orden;

DELETE FROM kit_conexiones WHERE proyecto_id IN (
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-pulsador-manual') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-buzzer-meteo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pulsador-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo')
);

INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'LED ROJO', 'Anodo (+)', 'D8', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'LED ROJO', 'Catodo (-) via R330', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'PULSADOR PEATON', 'Pin 1', 'D2', 'INPUT_PULLUP, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'PULSADOR PEATON', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'LED ROJO', 'Anodo (+)', 'D8', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'LED ROJO', 'Catodo (-) via R330', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'BUZZER PASIVO', '+', 'D7', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'BUZZER PASIVO', '-', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'LED ROJO', 'Anodo (+)', 'D8', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'LED ROJO', 'Catodo (-) via R330', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'LED AMARILLO', 'Anodo (+)', 'D9', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'LED AMARILLO', 'Catodo (-) via R330', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'LED VERDE', 'Anodo (+)', 'D10', 'mismo pin que el principal', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'LED VERDE', 'Catodo (-) via R330', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'LED (tapa abierta)', 'Anodo (+) via R330', 'D8', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'LED (tapa abierta)', 'Catodo (-)', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'VCC', '5V', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'Trig', 'D9', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'Echo', 'D10', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'PWM, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'SERVOMOTOR SG90', 'VCC', '5V', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'SENSOR HUMEDAD SUELO', 'VCC', '5V', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'SENSOR HUMEDAD SUELO', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'A0', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'POTENCIOMETRO (umbral)', 'Terminal A', '5V', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'POTENCIOMETRO (umbral)', 'Wiper', 'A1', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'POTENCIOMETRO (umbral)', 'Terminal B', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'MODULO RELE 1 CANAL', 'IN', 'D7', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'MODULO RELE 1 CANAL', 'VCC', '5V', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'MODULO RELE 1 CANAL', 'GND', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-pulsador-manual'), 'PULSADOR MANUAL', 'Pin 1', 'D2', 'INPUT_PULLUP, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-pulsador-manual'), 'PULSADOR MANUAL', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'SENSOR DHT11', 'VCC', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'SENSOR DHT11', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'SENSOR DHT11', 'DATA', 'GPIO3', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'LDR + R1K (divisor)', 'Terminal superior', '3V3', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'LDR + R1K (divisor)', 'Punto medio', 'GPIO0', 'ADC', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'LDR + R1K (divisor)', 'Terminal inferior', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'PULSADOR (modo)', 'Pin 1', 'GPIO10', 'INPUT_PULLUP, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'PULSADOR (modo)', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-buzzer-meteo'), 'BUZZER ACTIVO', '+', 'GPIO4', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-buzzer-meteo'), 'BUZZER ACTIVO', '-', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'SENSOR PIR HC-SR501', 'VCC', 'VIN (5V)', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'SENSOR PIR HC-SR501', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'SENSOR PIR HC-SR501', 'OUT', 'GPIO27', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'SENSOR LDR (modulo)', 'VCC', '3V3', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'SENSOR LDR (modulo)', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'SENSOR LDR (modulo)', 'AOUT', 'GPIO34', 'ADC1, solo entrada', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'RELE C/OPTOACOPLADOR', 'VCC', 'VIN (5V)', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'RELE C/OPTOACOPLADOR', 'GND', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pulsador-domotica'), 'PULSADOR MANUAL', 'Pin 1', 'GPIO14', 'INPUT_PULLUP, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pulsador-domotica'), 'PULSADOR MANUAL', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'SENSOR DHT11', 'VCC', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'SENSOR DHT11', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'SENSOR DHT11', 'DATA', 'GPIO4', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'SDA', 'GPIO21', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'SCL', 'GPIO22', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'VCC', 'VIN (5V)', 'sin conversor de nivel, directo', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'GND', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'VCC', '5V', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'Trig', 'GPIO17', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'Echo', 'GPIO16', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo'), 'SENSOR LDR (modulo)', 'VCC', '3V3', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo'), 'SENSOR LDR (modulo)', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo'), 'SENSOR LDR (modulo)', 'AOUT', 'GPIO32', 'ADC1', 3)
ON CONFLICT (proyecto_id, componente, pin_componente) DO UPDATE SET pin_placa = EXCLUDED.pin_placa, nota = EXCLUDED.nota, orden = EXCLUDED.orden;

DELETE FROM kit_esquemas WHERE proyecto_id IN (
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-pulsador-manual') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-buzzer-meteo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pulsador-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo')
);

INSERT INTO kit_esquemas (proyecto_id, tipo, contenido) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Enciende tu primer LED</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED ROJO</text>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="#f87171" stroke="#b91c1c" stroke-width="2"/>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="url(#gradDome)"/>
      <rect x="881" y="153" width="38" height="6" rx="2" fill="#b91c1c"/>
      <ellipse cx="894" cy="142" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 159 L 892 180 L 892 192" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 159 L 908 184" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="128" font-size="9" fill="#a8a29e">+</text><text x="892" y="217" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="197" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><circle cx="200" cy="186.66666666666669" r="4" fill="#111827"/><rect x="204" y="171.66666666666669" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="303.33333333333337" r="4" fill="#2563eb"/><rect x="204" y="288.33333333333337" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#2563eb">D8</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 908 184" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 892 192" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 550" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="550" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee un pulsador</text><rect x="30" y="70" width="170" height="410" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR PEATON</text>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="152" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="187" r="2.6" fill="#1f2937"/><rect x="910.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="187" r="2.6" fill="#1f2937"/><text x="888" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED ROJO</text>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="#f87171" stroke="#b91c1c" stroke-width="2"/>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="url(#gradDome)"/>
      <rect x="881" y="368" width="38" height="6" rx="2" fill="#b91c1c"/>
      <ellipse cx="894" cy="357" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 374 L 892 395 L 892 407" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 374 L 908 399" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="343" font-size="9" fill="#a8a29e">+</text><text x="892" y="432" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="412" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><circle cx="200" cy="172.5" r="4" fill="#2563eb"/><rect x="204" y="157.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="168.5" font-size="12" font-weight="bold" fill="#2563eb">D2</text><circle cx="200" cy="275" r="4" fill="#111827"/><rect x="204" y="260" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="271" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="377.5" r="4" fill="#ea580c"/><rect x="204" y="362.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="373.5" font-size="12" font-weight="bold" fill="#ea580c">D8</text><path d="M 200 172.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 172.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">INPUT_PULLUP, mismo pin que el principal</text><path d="M 200 275 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 275 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 912 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 275 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 275 V 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 332 L 742 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 908 399" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 377.5 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 377.5 V 348" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 348 L 742 348" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 892 407" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="342" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="521" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="531" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="521" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="531" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="514" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="521" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="531" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Haz sonar el buzzer</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER PASIVO</text>
      <rect x="881" y="140" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="140" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="140" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="168" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="179" r="2.6" fill="#1f2937"/><rect x="909.6" y="168" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="179" r="2.6" fill="#1f2937"/><text x="889" y="192" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="204" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><circle cx="200" cy="186.66666666666669" r="4" fill="#2563eb"/><rect x="204" y="171.66666666666669" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#2563eb">D7</text><circle cx="200" cy="303.33333333333337" r="4" fill="#111827"/><rect x="204" y="288.33333333333337" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 889 179" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 911 179" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 765" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="765" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Enciende los 3 LEDs en secuencia</text><rect x="30" y="70" width="170" height="625" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED ROJO</text>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="#f87171" stroke="#b91c1c" stroke-width="2"/>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="url(#gradDome)"/>
      <rect x="881" y="153" width="38" height="6" rx="2" fill="#b91c1c"/>
      <ellipse cx="894" cy="142" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 159 L 892 180 L 892 192" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 159 L 908 184" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="128" font-size="9" fill="#a8a29e">+</text><text x="892" y="217" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="197" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED AMARILLO</text>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="url(#gradDome)"/>
      <rect x="881" y="368" width="38" height="6" rx="2" fill="#ca8a04"/>
      <ellipse cx="894" cy="357" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 374 L 892 395 L 892 407" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 374 L 908 399" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="343" font-size="9" fill="#a8a29e">+</text><text x="892" y="432" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="412" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED VERDE</text>
      <path d="M 883 586 L 883 566 A 17 20 0 0 1 917 566 L 917 586 Z" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
      <path d="M 883 586 L 883 566 A 17 20 0 0 1 917 566 L 917 586 Z" fill="url(#gradDome)"/>
      <rect x="881" y="583" width="38" height="6" rx="2" fill="#15803d"/>
      <ellipse cx="894" cy="572" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 589 L 892 610 L 892 622" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 589 L 908 614" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="558" font-size="9" fill="#a8a29e">+</text><text x="892" y="647" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="627" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><circle cx="200" cy="195" r="4" fill="#2563eb"/><rect x="204" y="180" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="191" font-size="12" font-weight="bold" fill="#2563eb">D8</text><circle cx="200" cy="320" r="4" fill="#111827"/><rect x="204" y="305" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="316" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="445" r="4" fill="#9333ea"/><rect x="204" y="430" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="441" font-size="12" font-weight="bold" fill="#9333ea">D9</text><circle cx="200" cy="570" r="4" fill="#9333ea"/><rect x="204" y="555" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="566" font-size="12" font-weight="bold" fill="#9333ea">D10</text><path d="M 200 195 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 195 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 892 192" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 320 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 320 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 908 184" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 320 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 320 V 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 332 L 245 332 A 5 5 0 0 1 255 332 L 742 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 908 399" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 320 H 250" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 320 V 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 547 L 742 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 908 614" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 445 H 226" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 445 V 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 348 L 245 348 A 5 5 0 0 1 255 348 L 742 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 892 407" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="342" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 570 H 226" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 570 V 563" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 563 L 742 563" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 563 L 892 622" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="557" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="729" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="736" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="746" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="729" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="736" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="746" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="729" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="736" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="746" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Enciende el LED indicador</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED (tapa abierta)</text>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="url(#gradDome)"/>
      <rect x="881" y="153" width="38" height="6" rx="2" fill="#9ca3af"/>
      <ellipse cx="894" cy="142" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 159 L 892 180 L 892 192" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 159 L 908 184" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="128" font-size="9" fill="#a8a29e">+</text><text x="892" y="217" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="197" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><circle cx="200" cy="186.66666666666669" r="4" fill="#111827"/><rect x="204" y="171.66666666666669" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="303.33333333333337" r="4" fill="#2563eb"/><rect x="204" y="288.33333333333337" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#2563eb">D8</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 908 184" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 892 192" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Mide distancia con el sensor ultrasónico</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HC-SR04</text>
      <rect x="856" y="138" width="88" height="32" rx="3" fill="url(#gradPcbGreen)" stroke="#14532d" stroke-width="1.5"/>
      <circle cx="880" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="880" cy="153" r="6" fill="#1e293b"/>
      <circle cx="920" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="920" cy="153" r="6" fill="#1e293b"/>
      <rect x="865.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="867" cy="182" r="2.6" fill="#1f2937"/><rect x="887.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="182" r="2.6" fill="#1f2937"/><rect x="909.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="182" r="2.6" fill="#1f2937"/><rect x="931.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="933" cy="182" r="2.6" fill="#1f2937"/><text x="867" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="889" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="911" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Trig</text><text x="933" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Echo</text><circle cx="200" cy="140" r="4" fill="#dc2626"/><rect x="204" y="125" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="136" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="210" r="4" fill="#111827"/><rect x="204" y="195" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="206" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="280" r="4" fill="#2563eb"/><rect x="204" y="265" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="276" font-size="12" font-weight="bold" fill="#2563eb">D9</text><circle cx="200" cy="350" r="4" fill="#2563eb"/><rect x="204" y="335" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="346" font-size="12" font-weight="bold" fill="#2563eb">D10</text><path d="M 200 140 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 140 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 867 182" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo que el principal</text><path d="M 200 210 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 210 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 889 182" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 280 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 280 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 911 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 350 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 350 V 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 933 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Mueve el servomotor</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SERVOMOTOR SG90</text>
      <rect x="879" y="146" width="42" height="34" rx="3.5" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="146" width="42" height="34" rx="3.5" fill="url(#gradPlastic)"/>
      <rect x="873" y="156" width="54" height="9" rx="2" fill="#1e3a8a"/>
      <circle cx="878" cy="160.5" r="2.2" fill="#0f172a"/>
      <circle cx="922" cy="160.5" r="2.2" fill="#0f172a"/>
      <rect x="887" y="133" width="26" height="14" rx="2" fill="#f8fafc" stroke="#475569" stroke-width="1.3"/>
      <circle cx="900" cy="140" r="3.2" fill="#334155"/>
      <path d="M 884 139 L 916 139 M 900 124 L 900 154.5" stroke="#1e293b" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="884" cy="139" r="2" fill="#1e293b"/>
      <circle cx="916" cy="139" r="2" fill="#1e293b"/>
      <circle cx="900" cy="124" r="2" fill="#1e293b"/><path d="M 879 166 Q 870 170 866 193" fill="none" stroke="#334155" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="193" r="2.6" fill="#334155"/><path d="M 879 169 Q 870 173 866 204" fill="none" stroke="#dc2626" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="204" r="2.6" fill="#dc2626"/><path d="M 879 172 Q 870 176 866 215" fill="none" stroke="#1c1917" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="215" r="2.6" fill="#1c1917"/><text x="866" y="206" text-anchor="middle" font-size="9.5" fill="#57534e">Senal</text><text x="866" y="229" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="866" y="228" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="157.5" r="4" fill="#2563eb"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#2563eb">D6</text><circle cx="200" cy="245" r="4" fill="#dc2626"/><rect x="204" y="230" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 866 193" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">PWM, mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 866 204" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 866 215" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee la humedad del suelo</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HUMEDAD SUELO</text>
      <rect x="876" y="139" width="48" height="30" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="888" y="146" width="18" height="15" rx="1.5" fill="#0f172a"/>
      <circle cx="914" cy="148" r="2.6" fill="#4ade80"/>
      <rect x="880.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="180" r="2.6" fill="#1f2937"/><rect x="898.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="180" r="2.6" fill="#1f2937"/><rect x="916.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="180" r="2.6" fill="#1f2937"/><text x="882" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="205" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">A0</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 882 180" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 180" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 918 180" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Ajusta el umbral con el potenciómetro</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">POTENCIOMETRO (umbral)</text>
      <rect x="879" y="137" width="42" height="34" rx="3" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="137" width="42" height="34" rx="3" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="12" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>
      <line x1="892.5" y1="148.5" x2="907.5" y2="155.5" stroke="#92400e" stroke-width="2.2"/>
      <rect x="886.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="182" r="2.6" fill="#1f2937"/><rect x="898.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="182" r="2.6" fill="#1f2937"/><rect x="910.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="182" r="2.6" fill="#1f2937"/><text x="888" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal A</text><text x="900" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Wiper</text><text x="912" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal B</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="245" r="4" fill="#2563eb"/><rect x="204" y="230" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#2563eb">A1</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 182" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 912 182" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Enciende la bomba con el relé</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">MODULO RELE 1 CANAL</text>
      <rect x="873" y="137" width="54" height="35" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="#18181b"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="url(#gradPlastic)"/>
      <rect x="878" y="144" width="14" height="20" rx="1.5" fill="#0891b2"/>
      <circle cx="881" cy="166" r="2.3" fill="#4ade80"/>
      <rect x="878.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="880" cy="183" r="2.6" fill="#1f2937"/><rect x="898.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="183" r="2.6" fill="#1f2937"/><rect x="918.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="920" cy="183" r="2.6" fill="#1f2937"/><text x="880" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">IN</text><text x="900" y="208" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="920" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="157.5" r="4" fill="#2563eb"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#2563eb">D7</text><circle cx="200" cy="245" r="4" fill="#dc2626"/><rect x="204" y="230" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 880 183" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 183" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 920 183" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-pulsador-manual'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Riega manualmente con el pulsador</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR MANUAL</text>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="152" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="187" r="2.6" fill="#1f2937"/><rect x="910.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="187" r="2.6" fill="#1f2937"/><text x="888" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><circle cx="200" cy="186.66666666666669" r="4" fill="#2563eb"/><rect x="204" y="171.66666666666669" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#2563eb">D2</text><circle cx="200" cy="303.33333333333337" r="4" fill="#111827"/><rect x="204" y="288.33333333333337" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">INPUT_PULLUP, mismo pin que el principal</text><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 912 187" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee temperatura y humedad</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR DHT11</text>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="url(#gradPlastic)"/>
      <rect x="887" y="137" width="26" height="26" rx="2" fill="#1d4ed8"/>
      <line x1="891" y1="141" x2="891" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="897" y1="141" x2="897" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="903" y1="141" x2="903" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="909" y1="141" x2="909" y2="161" stroke="#93c5fd" stroke-width="1.6"/>
      <rect x="883" y="169" width="34" height="9" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="885.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="887" cy="190" r="2.6" fill="#1f2937"/><rect x="898.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="190" r="2.6" fill="#1f2937"/><rect x="911.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="913" cy="190" r="2.6" fill="#1f2937"/><text x="887" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="215" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="913" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">DATA</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO3</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 887 190" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 190" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 913 190" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee el sensor de luz</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LDR + R1K (divisor)</text>
      <line x1="900" y1="120" x2="900" y2="134" stroke="#a8a29e" stroke-width="2.2"/>
      <circle cx="900" cy="141" r="13" fill="#fef9c3" stroke="#a16207" stroke-width="1.8"/>
      <circle cx="900" cy="141" r="13" fill="url(#gradDome)"/>
      <path d="M 892 137 L 897 137 L 894 141 L 899 141 L 897 145 L 901 145 L 899 141 L 903 141 L 901 137 L 906 137" fill="none" stroke="#a16207" stroke-width="1.2" stroke-linejoin="round"/>
      <line x1="900" y1="153" x2="900" y2="155" stroke="#a8a29e" stroke-width="2.2"/>
      <circle cx="900" cy="155" r="3.4" fill="#2563eb"/>
      <line x1="904" y1="155" x2="920" y2="155" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,2"/>
      <text x="923" y="159" font-size="9" fill="#2563eb">ADC</text>
      <line x1="900" y1="158" x2="900" y2="165" stroke="#a8a29e" stroke-width="2.2"/>
      <rect x="892" y="165" width="16" height="18" rx="2" fill="#e7cfa0" stroke="#92612a" stroke-width="1.3"/>
      <rect x="892" y="167.5" width="16" height="2.4" fill="#78350f"/>
      <rect x="892" y="171.5" width="16" height="2.4" fill="#ef4444"/>
      <rect x="892" y="175.5" width="16" height="2.4" fill="#854d0e"/>
      <line x1="900" y1="183" x2="900" y2="190" stroke="#a8a29e" stroke-width="2.2"/><text x="900" y="133" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal superior</text><text x="900" y="180" text-anchor="middle" font-size="9.5" fill="#57534e">Punto medio</text><text x="900" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal inferior</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#2563eb"/><rect x="204" y="230" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#2563eb">GPIO0</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 900 120" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 155" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">ADC</text><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 900 190" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee el pulsador de modo</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR (modo)</text>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="152" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="187" r="2.6" fill="#1f2937"/><rect x="910.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="187" r="2.6" fill="#1f2937"/><text x="888" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><circle cx="200" cy="186.66666666666669" r="4" fill="#2563eb"/><rect x="204" y="171.66666666666669" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#2563eb">GPIO10</text><circle cx="200" cy="303.33333333333337" r="4" fill="#111827"/><rect x="204" y="288.33333333333337" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">INPUT_PULLUP, mismo pin que el principal</text><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 912 187" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-buzzer-meteo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Haz sonar la alarma</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER ACTIVO</text>
      <rect x="881" y="140" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="140" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="140" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="168" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="179" r="2.6" fill="#1f2937"/><rect x="909.6" y="168" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="179" r="2.6" fill="#1f2937"/><text x="889" y="192" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="204" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><circle cx="200" cy="186.66666666666669" r="4" fill="#2563eb"/><rect x="204" y="171.66666666666669" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#2563eb">GPIO4</text><circle cx="200" cy="303.33333333333337" r="4" fill="#111827"/><rect x="204" y="288.33333333333337" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 889 179" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 911 179" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Detecta movimiento</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR PIR HC-SR501</text>
      <path d="M 878 162 A 22 22 0 0 1 922 162 Z" fill="#f8fafc" stroke="#64748b" stroke-width="1.6"/>
      <path d="M 878 162 A 22 22 0 0 1 922 162 Z" fill="url(#gradDome)"/>
      <path d="M 887 162 A 13 13 0 0 1 913 162" fill="none" stroke="#94a3b8" stroke-width="1.3"/>
      <path d="M 894 162 A 6 6 0 0 1 906 162" fill="none" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="875" y="160" width="50" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>
      <rect x="881.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="883" cy="187" r="2.6" fill="#1f2937"/><rect x="898.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="187" r="2.6" fill="#1f2937"/><rect x="915.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="917" cy="187" r="2.6" fill="#1f2937"/><text x="883" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="917" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">OUT</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO27</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 883 187" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 187" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 917 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee el sensor de luz</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR LDR (modulo)</text>
      <rect x="876" y="136" width="48" height="38" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <circle cx="900" cy="150" r="12" fill="#fef9c3" stroke="#a16207" stroke-width="1.6"/>
      <circle cx="900" cy="150" r="12" fill="url(#gradDome)"/>
      <path d="M 893 145 L 898 145 L 895 150 L 900 150 L 898 155 L 902 155 L 900 150 L 905 150 L 902 145 L 907 145" fill="none" stroke="#a16207" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="880.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="185" r="2.6" fill="#1f2937"/><rect x="898.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="185" r="2.6" fill="#1f2937"/><rect x="916.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="185" r="2.6" fill="#1f2937"/><text x="882" y="198" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="198" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO34</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 882 185" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 185" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 918 185" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">ADC1, solo entrada</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Prueba el relé</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">RELE C/OPTOACOPLADOR</text>
      <rect x="873" y="137" width="54" height="35" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="#18181b"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="url(#gradPlastic)"/>
      <rect x="878" y="144" width="14" height="20" rx="1.5" fill="#0891b2"/>
      <circle cx="881" cy="166" r="2.3" fill="#4ade80"/>
      <rect x="878.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="880" cy="183" r="2.6" fill="#1f2937"/><rect x="898.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="183" r="2.6" fill="#1f2937"/><rect x="918.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="920" cy="183" r="2.6" fill="#1f2937"/><text x="880" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">IN</text><text x="900" y="208" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="920" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="157.5" r="4" fill="#2563eb"/><rect x="204" y="142.5" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO26</text><circle cx="200" cy="245" r="4" fill="#dc2626"/><rect x="204" y="230" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 880 183" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 183" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 920 183" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pulsador-domotica'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Prueba el control manual</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR MANUAL</text>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="152" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="187" r="2.6" fill="#1f2937"/><rect x="910.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="187" r="2.6" fill="#1f2937"/><text x="888" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><circle cx="200" cy="186.66666666666669" r="4" fill="#2563eb"/><rect x="204" y="171.66666666666669" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#2563eb">GPIO14</text><circle cx="200" cy="303.33333333333337" r="4" fill="#111827"/><rect x="204" y="288.33333333333337" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">INPUT_PULLUP, mismo pin que el principal</text><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 912 187" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee temperatura y humedad</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR DHT11</text>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="url(#gradPlastic)"/>
      <rect x="887" y="137" width="26" height="26" rx="2" fill="#1d4ed8"/>
      <line x1="891" y1="141" x2="891" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="897" y1="141" x2="897" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="903" y1="141" x2="903" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="909" y1="141" x2="909" y2="161" stroke="#93c5fd" stroke-width="1.6"/>
      <rect x="883" y="169" width="34" height="9" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="885.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="887" cy="190" r="2.6" fill="#1f2937"/><rect x="898.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="190" r="2.6" fill="#1f2937"/><rect x="911.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="913" cy="190" r="2.6" fill="#1f2937"/><text x="887" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="215" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="913" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">DATA</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO4</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 887 190" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 190" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 913 190" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Muestra texto en la pantalla LCD</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LCD 16x2 + I2C</text>
      <rect x="864" y="136" width="72" height="36" rx="3" fill="#15803d" stroke="#14532d" stroke-width="1.8"/>
      <rect x="870" y="142" width="60" height="24" rx="1.5" fill="#166534"/>
      <rect x="873" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="880.4" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="887.8" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="895.2" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="902.6" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="910" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="917.4" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="924.8" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="873" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="880.4" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="887.8" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="895.2" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="902.6" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="910" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="917.4" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="924.8" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/>
      <rect x="880" y="172" width="20" height="11" rx="2" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1.2"/>
      <circle cx="890" cy="177.5" r="3.6" fill="#fbbf24" stroke="#92400e" stroke-width="1"/>
      <rect x="873.6" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="875" cy="197" r="2.6" fill="#1f2937"/><rect x="890.2666666666667" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="891.6666666666666" cy="197" r="2.6" fill="#1f2937"/><rect x="906.9333333333334" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="908.3333333333334" cy="197" r="2.6" fill="#1f2937"/><rect x="923.6" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="925" cy="197" r="2.6" fill="#1f2937"/><text x="875" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">SDA</text><text x="891.6666666666666" y="222" text-anchor="middle" font-size="9.5" fill="#57534e">SCL</text><text x="908.3333333333334" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="925" y="222" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="140" r="4" fill="#2563eb"/><rect x="204" y="125" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="136" font-size="12" font-weight="bold" fill="#2563eb">GPIO21</text><circle cx="200" cy="210" r="4" fill="#2563eb"/><rect x="204" y="195" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="206" font-size="12" font-weight="bold" fill="#2563eb">GPIO22</text><circle cx="200" cy="280" r="4" fill="#dc2626"/><rect x="204" y="265" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="276" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="350" r="4" fill="#111827"/><rect x="204" y="335" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="346" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 140 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 140 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 875 197" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo que el principal</text><path d="M 200 210 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 210 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 891.6666666666666 197" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 280 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 280 V 149" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 908.3333333333334 197" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">sin conversor de nivel, directo</text><path d="M 200 350 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 350 V 165" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 925 197" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Mide la distancia</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HC-SR04P</text>
      <rect x="856" y="138" width="88" height="32" rx="3" fill="url(#gradPcbGreen)" stroke="#14532d" stroke-width="1.5"/>
      <circle cx="880" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="880" cy="153" r="6" fill="#1e293b"/>
      <circle cx="920" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="920" cy="153" r="6" fill="#1e293b"/>
      <rect x="865.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="867" cy="182" r="2.6" fill="#1f2937"/><rect x="887.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="182" r="2.6" fill="#1f2937"/><rect x="909.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="182" r="2.6" fill="#1f2937"/><rect x="931.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="933" cy="182" r="2.6" fill="#1f2937"/><text x="867" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="889" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="911" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Trig</text><text x="933" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Echo</text><circle cx="200" cy="140" r="4" fill="#dc2626"/><rect x="204" y="125" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="136" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="210" r="4" fill="#111827"/><rect x="204" y="195" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="206" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="280" r="4" fill="#2563eb"/><rect x="204" y="265" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="276" font-size="12" font-weight="bold" fill="#2563eb">GPIO17</text><circle cx="200" cy="350" r="4" fill="#2563eb"/><rect x="204" y="335" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="346" font-size="12" font-weight="bold" fill="#2563eb">GPIO16</text><path d="M 200 140 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 140 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 867 182" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo que el principal</text><path d="M 200 210 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 210 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 889 182" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 280 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 280 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 911 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 350 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 350 V 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 933 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee el sensor de luz</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR LDR (modulo)</text>
      <rect x="876" y="136" width="48" height="38" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <circle cx="900" cy="150" r="12" fill="#fef9c3" stroke="#a16207" stroke-width="1.6"/>
      <circle cx="900" cy="150" r="12" fill="url(#gradDome)"/>
      <path d="M 893 145 L 898 145 L 895 150 L 900 150 L 898 155 L 902 155 L 900 150 L 905 150 L 902 145 L 907 145" fill="none" stroke="#a16207" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="880.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="185" r="2.6" fill="#1f2937"/><rect x="898.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="185" r="2.6" fill="#1f2937"/><rect x="916.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="185" r="2.6" fill="#1f2937"/><text x="882" y="198" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="198" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO32</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 882 185" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 185" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 918 185" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">ADC1</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>');

DELETE FROM kit_codigos WHERE proyecto_id IN (
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-pulsador-manual') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-buzzer-meteo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pulsador-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo')
);

INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'arduino', '/*
  Practica: enciende tu primer LED
  Kit 8vo EGB - Arduino UNO R3
  Mismo pin que usara el semaforo (D8). Antes de armar el proyecto
  completo, practica lo basico: encender y apagar un LED.
*/
const int LED = 8;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'arduino', '/*
  Practica: lee un pulsador
  Kit 8vo EGB - Arduino UNO R3
  Mismos pines que usara el semaforo (D2 y D8). El LED se enciende
  solo mientras mantienes presionado el pulsador.
*/
const int PULSADOR = 2;
const int LED = 8;

void setup() {
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  digitalWrite(LED, presionado ? HIGH : LOW);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'arduino', '/*
  Practica: haz sonar el buzzer
  Kit 8vo EGB - Arduino UNO R3
  Mismo pin que usara el semaforo (D7). El buzzer suena medio
  segundo y se apaga un segundo, una y otra vez.
*/
const int BUZZER = 7;

void setup() {
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  tone(BUZZER, 1000);
  delay(500);
  noTone(BUZZER);
  delay(1000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-tres-leds'), 'arduino', '/*
  Practica: enciende los 3 LEDs en secuencia
  Kit 8vo EGB - Arduino UNO R3
  Mismos pines que usara el semaforo (D8, D9, D10). Enciende cada
  color por turno, como el primer paso hacia el semaforo real.
*/
const int ROJO = 8;
const int AMARILLO = 9;
const int VERDE = 10;

void setup() {
  pinMode(ROJO, OUTPUT);
  pinMode(AMARILLO, OUTPUT);
  pinMode(VERDE, OUTPUT);
}

void loop() {
  digitalWrite(ROJO, HIGH);
  delay(1000);
  digitalWrite(ROJO, LOW);

  digitalWrite(AMARILLO, HIGH);
  delay(500);
  digitalWrite(AMARILLO, LOW);

  digitalWrite(VERDE, HIGH);
  delay(1000);
  digitalWrite(VERDE, LOW);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'arduino', '/*
  Practica: enciende el LED indicador
  Kit 9no EGB - Arduino Nano V3
  Mismo pin que usara el basurero inteligente (D8).
*/
const int LED = 8;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'arduino', '/*
  Practica: mide distancia con el sensor ultrasonico
  Kit 9no EGB - Arduino Nano V3
  Mismos pines que usara el basurero inteligente (D9 y D10). Abre el
  Monitor Serial (9600 baudios) para ver la distancia en centimetros.
*/
const int TRIG = 9;
const int ECHO = 10;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duracion = pulseIn(ECHO, HIGH, 25000);
  long distanciaCm = duracion / 58;

  Serial.print("Distancia: ");
  Serial.print(distanciaCm);
  Serial.println(" cm");
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'arduino', '/*
  Practica: mueve el servomotor
  Kit 9no EGB - Arduino Nano V3
  Mismo pin que usara el basurero inteligente (D6). El servo gira de
  0 a 90 grados y vuelve, una y otra vez.
*/
#include <Servo.h>

const int SERVO_PIN = 6;
Servo motor;

void setup() {
  motor.attach(SERVO_PIN);
}

void loop() {
  motor.write(0);
  delay(800);
  motor.write(90);
  delay(800);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'arduino', '/*
  Practica: lee la humedad del suelo
  Kit 10mo EGB - Arduino Nano V3 Micro-USB
  Mismo pin que usara el sistema de riego (A0). Abre el Monitor
  Serial para ver el valor crudo del sensor (0-1023).
*/
const int SENSOR = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(SENSOR);
  Serial.print("Humedad (crudo): ");
  Serial.println(valor);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'arduino', '/*
  Practica: ajusta el umbral con el potenciometro
  Kit 10mo EGB - Arduino Nano V3 Micro-USB
  Mismo pin que usara el sistema de riego (A1).
*/
const int POT = A1;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(POT);
  Serial.print("Umbral (0-1023): ");
  Serial.println(valor);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'arduino', '/*
  Practica: enciende la bomba con el rele
  Kit 10mo EGB - Arduino Nano V3 Micro-USB
  Mismo pin que usara el sistema de riego (D7). El rele se activa y
  desactiva cada segundo.
*/
const int RELE = 7;

void setup() {
  pinMode(RELE, OUTPUT);
}

void loop() {
  digitalWrite(RELE, HIGH);
  delay(1000);
  digitalWrite(RELE, LOW);
  delay(1000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-pulsador-manual'), 'arduino', '/*
  Practica: riega manualmente con el pulsador
  Kit 10mo EGB - Arduino Nano V3 Micro-USB
  Mismo pin que usara el sistema de riego (D2).
*/
const int PULSADOR = 2;

void setup() {
  Serial.begin(9600);
  pinMode(PULSADOR, INPUT_PULLUP);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  if (presionado) Serial.println("Riego manual activado");
  delay(200);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'arduino', '/*
  Practica: lee temperatura y humedad
  Kit 1ro BGU - ESP32-C3 Super Mini
  Mismo pin que usara la estacion meteorologica (GPIO3). Requiere
  instalar: "DHT sensor library" (Adafruit) + "Adafruit Unified
  Sensor".
*/
#include <DHT.h>

const int PIN_DHT = 3;
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(temperatura);
  Serial.print(" C  Humedad: "); Serial.print(humedad);
  Serial.println(" %");
  delay(2000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'arduino', '/*
  Practica: lee el sensor de luz
  Kit 1ro BGU - ESP32-C3 Super Mini
  Mismo pin que usara la estacion meteorologica (GPIO0). El ESP32
  tiene un ADC de 12 bits: los valores van de 0 a 4095.
*/
const int PIN_LDR = 0;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  Serial.print("Luz (0-4095): ");
  Serial.println(luz);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'arduino', '/*
  Practica: lee el pulsador de modo
  Kit 1ro BGU - ESP32-C3 Super Mini
  Mismo pin que usara la estacion meteorologica (GPIO10).
*/
const int PULSADOR = 10;
int modo = 0;
bool anterior = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(PULSADOR, INPUT_PULLUP);
}

void loop() {
  bool actual = digitalRead(PULSADOR);
  if (actual == LOW && anterior == HIGH) {
    modo = (modo + 1) % 3;
    Serial.print("Modo: ");
    Serial.println(modo);
  }
  anterior = actual;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-buzzer-meteo'), 'arduino', '/*
  Practica: haz sonar la alarma
  Kit 1ro BGU - ESP32-C3 Super Mini
  Mismo pin que usara la estacion meteorologica (GPIO4).
*/
const int BUZZER = 4;

void setup() {
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  tone(BUZZER, 1200);
  delay(400);
  noTone(BUZZER);
  delay(800);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'arduino', '/*
  Practica: detecta movimiento
  Kit 2do BGU - ESP32 DevKit V1
  Mismo pin que usara la domotica inteligente (GPIO27). El sensor PIR
  tarda unos segundos en calibrarse al encender: espera un momento
  antes de moverte frente a el.
*/
const int PIN_PIR = 27;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);
}

void loop() {
  bool movimiento = digitalRead(PIN_PIR) == HIGH;
  Serial.println(movimiento ? "Movimiento detectado" : "Sin movimiento");
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'arduino', '/*
  Practica: lee el sensor de luz
  Kit 2do BGU - ESP32 DevKit V1
  Mismo pin que usara la domotica inteligente (GPIO34).
*/
const int PIN_LDR = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  Serial.print("Luz (0-4095): ");
  Serial.println(luz);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'arduino', '/*
  Practica: prueba el rele
  Kit 2do BGU - ESP32 DevKit V1
  Mismo pin que usara la domotica inteligente (GPIO26). El rele se
  activa y desactiva cada segundo (sin nada de 110V conectado todavia).
*/
const int PIN_RELE = 26;

void setup() {
  pinMode(PIN_RELE, OUTPUT);
}

void loop() {
  digitalWrite(PIN_RELE, HIGH);
  delay(1000);
  digitalWrite(PIN_RELE, LOW);
  delay(1000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pulsador-domotica'), 'arduino', '/*
  Practica: prueba el control manual
  Kit 2do BGU - ESP32 DevKit V1
  Mismo pin que usara la domotica inteligente (GPIO14).
*/
const int PULSADOR = 14;

void setup() {
  Serial.begin(115200);
  pinMode(PULSADOR, INPUT_PULLUP);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  if (presionado) Serial.println("Control manual activado");
  delay(200);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'arduino', '/*
  Practica: lee temperatura y humedad
  Kit 3ro BGU - ESP32 DevKit V1
  Mismo pin que usara el sistema de monitoreo (GPIO4). Requiere
  instalar: "DHT sensor library" (Adafruit) + "Adafruit Unified
  Sensor".
*/
#include <DHT.h>

const int PIN_DHT = 4;
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(temperatura);
  Serial.print(" C  Humedad: "); Serial.print(humedad);
  Serial.println(" %");
  delay(2000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'arduino', '/*
  Practica: muestra texto en la pantalla LCD
  Kit 3ro BGU - ESP32 DevKit V1
  Mismos pines que usara el sistema de monitoreo (GPIO21 y GPIO22).
  Requiere instalar: "LiquidCrystal I2C".
*/
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); // si no aparece nada, prueba con 0x3F

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hola, Academia!");
  lcd.setCursor(0, 1);
  lcd.print("LCD funcionando");
}

void loop() {
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'arduino', '/*
  Practica: mide la distancia
  Kit 3ro BGU - ESP32 DevKit V1
  Mismos pines que usara el sistema de monitoreo (GPIO17 y GPIO16).
*/
const int PIN_TRIG = 17;
const int PIN_ECHO = 16;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
}

void loop() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duracion = pulseIn(PIN_ECHO, HIGH, 25000);
  long distanciaCm = duracion / 58;

  Serial.print("Distancia: ");
  Serial.print(distanciaCm);
  Serial.println(" cm");
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-ldr-monitoreo'), 'arduino', '/*
  Practica: lee el sensor de luz
  Kit 3ro BGU - ESP32 DevKit V1
  Mismo pin que usara el sistema de monitoreo (GPIO32).
*/
const int PIN_LDR = 32;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  Serial.print("Luz (0-4095): ");
  Serial.println(luz);
  delay(300);
}
', 1);

-- Bucket publico para imagenes/PDF de esquemas subidos a mano desde
-- el nuevo editor de admin (/admin/kits/[id]/editar). Si ya existe,
-- no hace nada (tambien se crea automaticamente la primera vez que
-- se sube un archivo, esto es solo para que quede documentado).
-- INSERT INTO storage.buckets (id, name, public) VALUES ('kit-esquemas', 'kit-esquemas', true) ON CONFLICT (id) DO NOTHING;
