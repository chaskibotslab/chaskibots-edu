-- COPOL fase 2: lecciones de Inicial 1, Inicial 2, 4to, 5to, 6to y 7mo.
-- Generado por scripts/copol-lecciones.js. Se puede ejecutar más de una vez:
-- OJO: reescribe las lecciones de estos seis kits (se pierden las fotos o cambios hechos a mano en ellos).
BEGIN;

INSERT INTO materiales (id, nombre, categoria) VALUES
  ('kit-madera-eolico', 'Kit de madera: generador eólico', 'componente'),
  ('kit-madera-carro-solar', 'Kit de madera: carro solar', 'componente'),
  ('kit-madera-tragamonedas', 'Kit de madera: tragamonedas', 'componente'),
  ('kit-madera-carro-rc', 'Kit de madera: carro radiocontrolado', 'componente')
ON CONFLICT (id) DO NOTHING;

DELETE FROM kit_conexiones WHERE proyecto_id IN (SELECT id FROM kit_proyectos WHERE kit_id IN ('kit-copol-sexto-egb', 'kit-copol-septimo-egb', 'kit-copol-inicial-1', 'kit-copol-inicial-2', 'kit-copol-cuarto-egb', 'kit-copol-quinto-egb'));
DELETE FROM kit_codigos WHERE proyecto_id IN (SELECT id FROM kit_proyectos WHERE kit_id IN ('kit-copol-sexto-egb', 'kit-copol-septimo-egb', 'kit-copol-inicial-1', 'kit-copol-inicial-2', 'kit-copol-cuarto-egb', 'kit-copol-quinto-egb'));
DELETE FROM kit_proyectos WHERE kit_id IN ('kit-copol-sexto-egb', 'kit-copol-septimo-egb', 'kit-copol-inicial-1', 'kit-copol-inicial-2', 'kit-copol-cuarto-egb', 'kit-copol-quinto-egb');
DELETE FROM kit_materiales WHERE kit_id IN ('kit-copol-sexto-egb', 'kit-copol-septimo-egb', 'kit-copol-inicial-1', 'kit-copol-inicial-2', 'kit-copol-cuarto-egb', 'kit-copol-quinto-egb');

-- ===== kit-copol-sexto-egb =====
UPDATE kits SET placa_id = 'placa-esp32-devkit-v1', alimentacion = 'Cable USB V8 (Micro-USB): se programa y se alimenta desde la computadora o desde un cargador de celular de al menos 1 A (cargador NO incluido).', advertencia_seguridad = 'Nunca conectes 5 V a un pin de señal del ESP32.', notas = 'ESP32 DevKit V1 de 30 pines. Sus pines de señal trabajan a 3,3 V: sensores y potenciómetro van a 3V3. El servomotor es la única pieza que va a VIN (5 V del USB). Pulsadores con INPUT_PULLUP (sin resistencia). En Arduino IDE: placa "ESP32 Dev Module", Monitor Serial a 115200. Solo 3 resistencias: máximo 3 LEDs encendidos a la vez.', visible = true WHERE id = 'kit-copol-sexto-egb';
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  ('kit-copol-sexto-egb', 'board-esp32-devkit', 1, NULL, true),
  ('kit-copol-sexto-egb', 'protoboard-400', 1, NULL, true),
  ('kit-copol-sexto-egb', 'sensor-ir-fc51', 1, NULL, true),
  ('kit-copol-sexto-egb', 'servo-sg90', 1, NULL, true),
  ('kit-copol-sexto-egb', 'buzzer-pasivo', 1, NULL, true),
  ('kit-copol-sexto-egb', 'led-rojo', 1, NULL, true),
  ('kit-copol-sexto-egb', 'led-verde', 1, NULL, true),
  ('kit-copol-sexto-egb', 'led-amarillo', 1, NULL, true),
  ('kit-copol-sexto-egb', 'led-azul', 1, NULL, true),
  ('kit-copol-sexto-egb', 'led-blanco', 1, NULL, true),
  ('kit-copol-sexto-egb', 'pulsador', 1, NULL, true),
  ('kit-copol-sexto-egb', 'potenciometro-10k', 1, NULL, true),
  ('kit-copol-sexto-egb', 'resistencia-330', 3, NULL, true),
  ('kit-copol-sexto-egb', 'resistencia-1k', 1, 'Repuesto / experimentacion libre', true),
  ('kit-copol-sexto-egb', 'resistencia-10k', 1, 'Repuesto / experimentación libre', true),
  ('kit-copol-sexto-egb', 'jumper-mm', 10, NULL, true),
  ('kit-copol-sexto-egb', 'jumper-mh', 5, NULL, true),
  ('kit-copol-sexto-egb', 'jumper-hh', 5, NULL, true),
  ('kit-copol-sexto-egb', 'cable-usb-v8', 1, NULL, true);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Enciende tu primer LED', 'copol-practica-primer-led', 'practica', 'Antes de armar el semáforo completo, practica con una sola pieza: hacer que un LED parpadee.', ARRAY['Usar pinMode() y digitalWrite() para controlar una salida digital.', 'Entender por qué un LED necesita una resistencia en serie.']::text[], -4, $cp${"reto":{"texto":"Vas a hacer que un LED rojo se encienda y se apague solo, una vez por segundo. Es el primer programa que escribe cualquier persona que aprende a programar placas electrónicas, y es la primera luz de tu semáforo.","paraQue":"Las luces indicadoras están en todas partes: el foco del televisor en espera, la luz del cargador, el intermitente de un carro. Todas funcionan igual que lo que vas a armar: un programa decide cuándo dejar pasar la corriente.","duracion":"25 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Con un cable negro une uno de los pines GND del ESP32 con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.","rieles":["GND"],"titulo":"Lleva tierra a la línea negra"},{"texto":"Pon el LED rojo en la protoboard con cada pata en una fila distinta. Con un cable une la fila de la pata larga (ánodo) con el pin GPIO25 del ESP32.","titulo":"Coloca el LED y llévalo al pin GPIO25","conexiones":[0]},{"texto":"Conecta un extremo de la resistencia de 330 Ω en la fila de la pata corta del LED y el otro extremo en la línea negra (–). La corriente sale del pin GPIO25, cruza el LED y la resistencia, y vuelve a tierra.","titulo":"Cierra el circuito con la resistencia","consejo":"La resistencia no tiene lado: puede ir en cualquier sentido.","conexiones":[1]},{"texto":"Conecta el ESP32 a la computadora con el cable V8 (Micro-USB). Debe encenderse una luz roja en la placa: eso indica que tiene energía.","titulo":"Conecta el cable USB"}],"codigo":[{"texto":"En lugar de escribir el número 8 por todo el programa, se guarda en una constante llamada LED. Si un día cambias de pin, corriges una sola línea.","titulo":"Dale un nombre al pin","fragmento":"const int LED = 25;"},{"texto":"Cuando el ESP32 enciende, ejecuta setup() una vez. Aquí le dices que el pin del LED es una salida, es decir, que por ahí va a enviar corriente.","titulo":"setup(): se ejecuta una sola vez","fragmento":"void setup() {\n  pinMode(LED, OUTPUT);\n}"},{"texto":"HIGH enciende el LED y LOW lo apaga. delay(500) espera 500 milisegundos, que es medio segundo. Al terminar, loop() vuelve a empezar solo.","titulo":"loop(): se repite para siempre","fragmento":"void loop() {\n  digitalWrite(LED, HIGH);\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}"}],"piezas":[{"nombre":"ESP32 DevKit V1 (30 pines)","cuidado":"No lo apoyes sobre objetos metálicos mientras está conectado: la parte de abajo tiene soldaduras expuestas.","paraQue":"Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines."},{"nombre":"Protoboard","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y la línea larga negra (–) del borde sirve para repartir la tierra."},{"nombre":"LED rojo","cuidado":"La pata larga es el positivo (ánodo) y la corta el negativo (cátodo). Al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-rojo-feade231.webp","paraQue":"Es una luz pequeña que se enciende cuando la corriente pasa en el sentido correcto."},{"nombre":"Resistencia de 330 Ω","cuidado":"Nunca conectes un LED directo al ESP32 sin resistencia.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-resistencia-5e4b0d9c.webp","paraQue":"Frena la corriente para que el LED no se queme. Va siempre en serie con el LED."},{"nombre":"Cables jumper","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cables-jumper-ok-fbd4e0c8.webp","paraQue":"Llevan la corriente de un punto a otro."}],"prueba":{"queDebePasar":["Al subir el programa, el LED se enciende medio segundo y se apaga medio segundo, sin parar.","Si desconectas y vuelves a conectar el USB, el parpadeo empieza de nuevo solo: el programa quedó guardado en el ESP32."],"siNoFunciona":[{"revisa":"Gira el LED: lo más probable es que esté al revés. La pata larga va hacia el pin GPIO25 y la corta hacia la resistencia.","problema":"El LED no enciende nunca"},{"revisa":"Comprueba que el cable llega al pin GPIO25 y no al de al lado, y que la línea negra de la protoboard está unida a un pin GND del ESP32.","problema":"Sigue sin encender"},{"revisa":"En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en \"Connecting…\", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.","problema":"El programa no se sube"}]},"demuestra":{"reto":"Haz que el LED parpadee como una señal de auxilio: tres destellos rápidos, una pausa larga, y que se repita. Pista: copia las líneas de encender y apagar, y cambia los números de delay().","preguntas":[{"correcta":1,"opciones":["Para que el LED brille más","Para limitar la corriente y que el LED no se queme","Para que el programa corra más rápido"],"pregunta":"¿Para qué sirve la resistencia de 330 Ω?","explicacion":"La resistencia frena la corriente. Sin ella pasaría demasiada y el LED se dañaría."},{"correcta":2,"opciones":["Una sola vez","Diez veces","Se repite sin parar mientras haya energía"],"pregunta":"¿Cuántas veces se ejecuta loop()?","explicacion":"setup() corre una vez al encender; loop() se repite para siempre."},{"correcta":0,"opciones":["El LED parpadea más rápido","El LED parpadea más lento","El LED queda apagado"],"pregunta":"Si cambias los dos delay(500) por delay(100), ¿qué pasa?","explicacion":"Menos espera entre encender y apagar significa un parpadeo más rápido."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-primer-led'), 'LED ROJO', 'Ánodo (+)', 'GPIO25', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-primer-led'), 'LED ROJO', 'Cátodo (-) via R330', 'GND', NULL, 2);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-primer-led'), 'arduino', $cp$/*
  Practica: enciende tu primer LED
  Kit 6to EGB - ESP32 DevKit V1 (30 pines)
  Mismo pin que usara el semaforo (D8). Antes de armar el proyecto
  completo, practica lo basico: encender y apagar un LED.
*/
const int LED = 25;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Lee un pulsador', 'copol-practica-pulsador', 'practica', 'Practica con el pulsador solo: enciende el LED mientras lo mantienes presionado.', ARRAY['Leer una entrada digital con digitalRead().', 'Usar INPUT_PULLUP para no necesitar una resistencia externa en el pulsador.']::text[], -3, $cp${"reto":{"texto":"Vas a controlar el LED con tu dedo: se enciende mientras mantienes presionado un botón y se apaga cuando lo sueltas. Es la primera vez que tu ESP32 recibe una orden tuya en lugar de solo ejecutar un programa.","paraQue":"Un botón es la forma más simple de decirle algo a una máquina: el timbre de una casa, el teclado, el botón del ascensor. En el semáforo será el botón que presiona el peatón para pedir el paso.","duracion":"30 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Con un cable negro une uno de los pines GND del ESP32 con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.","rieles":["GND"],"titulo":"Lleva tierra a la línea negra"},{"texto":"Pon el pulsador a caballo sobre el canal central de la protoboard. Une una pata con el pin GPIO27 del ESP32 y la pata del lado opuesto con la línea negra (–).","titulo":"Coloca el pulsador","consejo":"No necesitas resistencia para el pulsador: el programa activa una que el ESP32 ya trae por dentro.","conexiones":[0,1]},{"texto":"Igual que en la práctica anterior: la pata larga del LED al pin GPIO25, y la pata corta a la línea negra pasando por la resistencia de 330 Ω.","titulo":"Conecta el LED","conexiones":[2,3]},{"texto":"Conecta el ESP32 a la computadora con el cable V8 (Micro-USB). Debe encenderse una luz roja en la placa: eso indica que tiene energía.","titulo":"Conecta el cable USB"}],"codigo":[{"texto":"Uno para el botón y otro para el LED.","titulo":"Dos pines con nombre","fragmento":"const int PULSADOR = 27;\nconst int LED = 25;"},{"texto":"El LED es salida porque el ESP32 envía corriente. El pulsador es entrada porque el ESP32 lee. INPUT_PULLUP activa una resistencia interna que mantiene el pin en HIGH mientras nadie presiona.","titulo":"Una entrada y una salida","fragmento":"pinMode(PULSADOR, INPUT_PULLUP);\npinMode(LED, OUTPUT);"},{"texto":"Aquí hay una trampa: con INPUT_PULLUP el botón presionado se lee como LOW, no como HIGH, porque al presionarlo el pin queda unido a tierra. La variable presionado vale verdadero cuando la lectura es LOW.","titulo":"Leer el botón","fragmento":"bool presionado = (digitalRead(PULSADOR) == LOW);"},{"texto":"Esta línea es una pregunta corta: ¿está presionado? Si sí, enciende (HIGH); si no, apaga (LOW).","titulo":"Decidir qué hacer con el LED","fragmento":"digitalWrite(LED, presionado ? HIGH : LOW);"}],"piezas":[{"nombre":"Pulsador","cuidado":"Tiene 4 patas unidas de dos en dos. Colócalo a caballo sobre el canal central de la protoboard y usa dos patas de lados opuestos.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-pulsador-32276b41.webp","paraQue":"Es un interruptor que solo deja pasar corriente mientras lo presionas."},{"nombre":"LED rojo","cuidado":"La pata larga es el positivo (ánodo) y la corta el negativo (cátodo). Al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-rojo-feade231.webp","paraQue":"Es una luz pequeña que se enciende cuando la corriente pasa en el sentido correcto."},{"nombre":"Resistencia de 330 Ω","cuidado":"Nunca conectes un LED directo al ESP32 sin resistencia.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-resistencia-5e4b0d9c.webp","paraQue":"Frena la corriente para que el LED no se queme. Va siempre en serie con el LED."},{"nombre":"ESP32 DevKit V1 (30 pines)","cuidado":"No lo apoyes sobre objetos metálicos mientras está conectado: la parte de abajo tiene soldaduras expuestas.","paraQue":"Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines."},{"nombre":"Protoboard","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y la línea larga negra (–) del borde sirve para repartir la tierra."}],"prueba":{"queDebePasar":["Con el botón suelto, el LED está apagado.","Al presionar el botón, el LED se enciende de inmediato y se apaga al soltarlo."],"siNoFunciona":[{"revisa":"Las dos patas que usaste del pulsador están unidas por dentro. Gíralo un cuarto de vuelta o usa dos patas en diagonal.","problema":"El LED está siempre encendido"},{"revisa":"Comprueba que una pata del pulsador llega al pin GPIO27 y la otra a la línea negra. Luego revisa el LED con el programa de la práctica anterior.","problema":"El LED nunca enciende al presionar"},{"revisa":"Falta INPUT_PULLUP en el programa. Sin esa resistencia interna el pin queda \"flotando\" y lee valores al azar.","problema":"El LED parpadea solo, sin tocar nada"},{"revisa":"En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en \"Connecting…\", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.","problema":"El programa no se sube"}]},"demuestra":{"reto":"Invierte el comportamiento: que el LED esté encendido siempre y se apague solo mientras presionas. Pista: intercambia HIGH y LOW en la última línea.","preguntas":[{"correcta":1,"opciones":["HIGH","LOW","Nada"],"pregunta":"Con INPUT_PULLUP, ¿qué lee el ESP32 cuando presionas el botón?","explicacion":"Al presionar, el pin queda unido a tierra y se lee LOW. Suelto, la resistencia interna lo mantiene en HIGH."},{"correcta":0,"opciones":["Porque el ESP32 ya trae una resistencia interna que se activa con INPUT_PULLUP","Porque los pulsadores nunca necesitan resistencia","Porque usa muy poca corriente"],"pregunta":"¿Por qué el pulsador no necesita una resistencia externa aquí?","explicacion":"INPUT_PULLUP conecta una resistencia que está dentro del ESP32. Por eso el circuito queda más simple."},{"correcta":1,"opciones":["Ninguna","Por una salida el ESP32 envía corriente; por una entrada lee lo que pasa afuera","Las entradas son más rápidas"],"pregunta":"¿Qué diferencia hay entre una entrada y una salida?","explicacion":"El LED es una salida (el ESP32 actúa) y el pulsador una entrada (el ESP32 escucha)."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-pulsador'), 'PULSADOR PEATON', 'Pin 1', 'GPIO27', 'INPUT_PULLUP, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-pulsador'), 'PULSADOR PEATON', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-pulsador'), 'LED ROJO', 'Ánodo (+)', 'GPIO25', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-pulsador'), 'LED ROJO', 'Cátodo (-) via R330', 'GND', NULL, 4);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-pulsador'), 'arduino', $cp$/*
  Practica: lee un pulsador
  Kit 6to EGB - ESP32 DevKit V1 (30 pines)
  Mismos pines que usara el semaforo (D2 y D8). El LED se enciende
  solo mientras mantienes presionado el pulsador.
*/
const int PULSADOR = 27;
const int LED = 25;

void setup() {
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  digitalWrite(LED, presionado ? HIGH : LOW);
}
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Haz sonar el buzzer', 'copol-practica-buzzer', 'practica', 'Practica con el buzzer solo: hazlo sonar antes de usarlo como aviso sonoro del semáforo.', ARRAY['Generar un sonido con tone() en un buzzer pasivo.', 'Detener un sonido con noTone().']::text[], -2, $cp${"reto":{"texto":"Vas a hacer que tu ESP32 emita un sonido: un pitido de medio segundo, un silencio de un segundo, y otra vez. Es el aviso que escuchará el peatón cuando pueda cruzar.","paraQue":"Los avisos sonoros sirven cuando no estamos mirando: la alarma del microondas, el pitido de un carro en reversa, o los semáforos sonoros que ayudan a cruzar a las personas con discapacidad visual.","duracion":"25 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Con un cable negro une uno de los pines GND del ESP32 con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.","rieles":["GND"],"titulo":"Lleva tierra a la línea negra"},{"texto":"Coloca el buzzer en la protoboard con cada pata en una fila distinta. Une la pata marcada con + con el pin GPIO13 del ESP32.","titulo":"Conecta el positivo del buzzer","conexiones":[0]},{"texto":"Une la otra pata del buzzer con la línea negra (–).","titulo":"Conecta el negativo","conexiones":[1]},{"texto":"Conecta el ESP32 a la computadora con el cable V8 (Micro-USB). Debe encenderse una luz roja en la placa: eso indica que tiene energía.","titulo":"Conecta el cable USB"}],"codigo":[{"texto":"El buzzer es una salida, igual que un LED: el ESP32 le envía corriente.","titulo":"Nombre del pin y configuración","fragmento":"const int BUZZER = 13;\n\nvoid setup() {\n  pinMode(BUZZER, OUTPUT);\n}"},{"texto":"tone() recibe el pin y la frecuencia en hercios. 1000 significa que el buzzer vibra mil veces por segundo. Un número más alto da un sonido más agudo.","titulo":"tone(): empezar a sonar","fragmento":"tone(BUZZER, 1000);\ndelay(500);"},{"texto":"El sonido no se detiene solo: hay que apagarlo con noTone(). Después se espera un segundo en silencio antes de repetir.","titulo":"noTone(): callar","fragmento":"noTone(BUZZER);\ndelay(1000);"}],"piezas":[{"nombre":"Buzzer pasivo","cuidado":"Tiene polaridad: la pata marcada con + (o la más larga) va al pin del ESP32 y la otra a tierra.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-ar0355-buzzer-pasivo-v1-1-1024x1024-379ffe43.webp","paraQue":"Es un parlante muy pequeño. Suena cuando el ESP32 le envía corriente que se enciende y se apaga muchas veces por segundo."},{"nombre":"ESP32 DevKit V1 (30 pines)","cuidado":"No lo apoyes sobre objetos metálicos mientras está conectado: la parte de abajo tiene soldaduras expuestas.","paraQue":"Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines."},{"nombre":"Protoboard","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y la línea larga negra (–) del borde sirve para repartir la tierra."},{"nombre":"Cables jumper","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cables-jumper-ok-fbd4e0c8.webp","paraQue":"Llevan la corriente de un punto a otro."}],"prueba":{"queDebePasar":["Se escucha un pitido de medio segundo, luego un segundo de silencio, y se repite.","El sonido es siempre el mismo tono."],"siNoFunciona":[{"revisa":"Invierte las patas del buzzer y comprueba que el cable llega al pin GPIO13. Verifica también que la línea negra está unida a GND.","problema":"No suena nada"},{"revisa":"Es normal en un buzzer pasivo pequeño. Prueba con una frecuencia entre 2000 y 3000, donde suele sonar más fuerte.","problema":"Suena muy bajito"},{"revisa":"Falta la línea noTone(BUZZER) o quedó fuera de loop().","problema":"Suena sin parar"},{"revisa":"En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en \"Connecting…\", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.","problema":"El programa no se sube"}]},"demuestra":{"reto":"Toca una melodía de tres notas: 262, 330 y 392 hercios (do, mi y sol), cada una durante 300 milisegundos. Pista: repite tone() y delay() tres veces con números distintos.","preguntas":[{"correcta":1,"opciones":["Que suena 1000 segundos","La frecuencia: el buzzer vibra 1000 veces por segundo","El volumen"],"pregunta":"¿Qué significa el 1000 en tone(BUZZER, 1000)?","explicacion":"Es la frecuencia en hercios. Determina qué tan grave o agudo es el sonido."},{"correcta":1,"opciones":["Más grave","Más agudo","Igual"],"pregunta":"Si cambias 1000 por 2000, el sonido será…","explicacion":"A mayor frecuencia, sonido más agudo."},{"correcta":1,"opciones":["Para subir el volumen","Para detener el sonido","Para cambiar de nota"],"pregunta":"¿Para qué sirve noTone()?","explicacion":"tone() deja el buzzer sonando hasta que noTone() lo apaga."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-buzzer'), 'BUZZER PASIVO', '+', 'GPIO13', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-buzzer'), 'BUZZER PASIVO', '-', 'GND', NULL, 2);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-buzzer'), 'arduino', $cp$/*
  Practica: haz sonar el buzzer
  Kit 6to EGB - ESP32 DevKit V1 (30 pines)
  Mismo pin que usara el semaforo (D7). El buzzer suena medio
  segundo y se apaga un segundo, una y otra vez.
*/
const int BUZZER = 13;

void setup() {
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  tone(BUZZER, 1000);
  delay(500);
  noTone(BUZZER);
  delay(1000);
}
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Enciende los 3 LEDs en secuencia', 'copol-practica-tres-leds', 'practica', 'Último paso antes del semáforo: enciende los 3 colores uno tras otro, como el semáforo real.', ARRAY['Controlar varios pines de salida en el mismo programa.', 'Usar una secuencia ordenada de digitalWrite() y delay() como base del semáforo.']::text[], -1, $cp${"reto":{"texto":"Vas a encender tres luces en orden, una después de otra: roja, amarilla y verde. Con esto ya tienes el cuerpo del semáforo; solo faltará darle inteligencia.","paraQue":"Casi todas las máquinas funcionan por secuencias: una lavadora llena, lava, enjuaga y centrifuga; un semáforo pasa de verde a amarillo y a rojo. Programar es, muchas veces, ordenar pasos en el tiempo.","duracion":"35 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Con un cable negro une uno de los pines GND del ESP32 con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.","rieles":["GND"],"titulo":"Lleva tierra a la línea negra"},{"texto":"Pata larga al pin GPIO25. Pata corta a la línea negra (–) pasando por una resistencia de 330 Ω.","titulo":"Conecta el LED rojo","conexiones":[0,1]},{"texto":"Colócalo debajo del rojo. Pata larga al pin GPIO26. Pata corta a la línea negra pasando por otra resistencia.","titulo":"Conecta el LED amarillo","conexiones":[2,3]},{"texto":"Colócalo debajo del amarillo. Pata larga al pin GPIO33. Pata corta a la línea negra pasando por la tercera resistencia.","titulo":"Conecta el LED verde","consejo":"Ponlos en línea y en el mismo orden que un semáforo real: rojo arriba, amarillo al medio y verde abajo.","conexiones":[4,5]},{"texto":"Conecta el ESP32 a la computadora con el cable V8 (Micro-USB). Debe encenderse una luz roja en la placa: eso indica que tiene energía.","titulo":"Conecta el cable USB"}],"codigo":[{"texto":"Usar el nombre del color en lugar del número hace que el programa se lea casi como una frase.","titulo":"Tres pines con nombre","fragmento":"const int ROJO = 25;\nconst int AMARILLO = 26;\nconst int VERDE = 33;"},{"texto":"Cada LED necesita su propia línea pinMode.","titulo":"Los tres son salidas","fragmento":"pinMode(ROJO, OUTPUT);\npinMode(AMARILLO, OUTPUT);\npinMode(VERDE, OUTPUT);"},{"texto":"Mira el patrón que se repite tres veces: enciendo un color, espero, lo apago y enciendo el siguiente. El rojo y el verde duran un segundo; el amarillo, medio.","titulo":"El patrón: encender, esperar, apagar","fragmento":"digitalWrite(ROJO, HIGH);\ndelay(1000);\ndigitalWrite(ROJO, LOW);\ndigitalWrite(AMARILLO, HIGH);\ndelay(500);\ndigitalWrite(AMARILLO, LOW);"}],"piezas":[{"nombre":"LED rojo, amarillo y verde","cuidado":"En los tres, la pata larga es el positivo.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-leds-d9ed2606.webp","paraQue":"Las tres luces del semáforo. Funcionan igual; solo cambia el color."},{"nombre":"3 resistencias de 330 Ω","cuidado":"El kit trae exactamente tres: no las pierdas.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-resistencia-5e4b0d9c.webp","paraQue":"Una para cada LED. Cada luz necesita su propia resistencia."},{"nombre":"ESP32 DevKit V1 (30 pines)","cuidado":"No lo apoyes sobre objetos metálicos mientras está conectado: la parte de abajo tiene soldaduras expuestas.","paraQue":"Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines."},{"nombre":"Protoboard","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y la línea larga negra (–) del borde sirve para repartir la tierra."},{"nombre":"Cables jumper","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cables-jumper-ok-fbd4e0c8.webp","paraQue":"Llevan la corriente de un punto a otro."}],"prueba":{"queDebePasar":["Se enciende el rojo un segundo, luego el amarillo medio segundo, luego el verde un segundo, y vuelve a empezar.","Nunca hay dos luces encendidas al mismo tiempo."],"siNoFunciona":[{"revisa":"Gira ese LED y revisa que su cable llega al pin correcto: rojo al 8, amarillo al 9 y verde al 10.","problema":"Un LED no enciende"},{"revisa":"Los cables están cruzados entre pines. Sigue cada cable desde el LED hasta el ESP32.","problema":"Los colores salen en otro orden"},{"revisa":"Falta una línea digitalWrite(..., LOW) antes de encender el siguiente color.","problema":"Dos LEDs encienden a la vez"},{"revisa":"En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en \"Connecting…\", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.","problema":"El programa no se sube"}]},"demuestra":{"reto":"Los semáforos reales pasan de verde a amarillo y luego a rojo. Reordena tu programa para que siga ese orden: verde, amarillo, rojo.","preguntas":[{"correcta":0,"opciones":["Para que cada uno reciba la corriente correcta sin depender de los otros","Porque así se ven más bonitos","No hace falta: con una basta para los tres"],"pregunta":"¿Por qué cada LED tiene su propia resistencia?","explicacion":"Cada LED es un circuito aparte y necesita su propio límite de corriente."},{"correcta":1,"opciones":["El programa se detiene","Quedan los dos encendidos al mismo tiempo","El rojo se quema"],"pregunta":"¿Qué pasa si olvidas apagar el rojo antes de encender el amarillo?","explicacion":"Un pin queda en el último estado que le diste hasta que lo cambies."},{"correcta":1,"opciones":["1 segundo","2,5 segundos","5 segundos"],"pregunta":"¿Cuánto dura una vuelta completa de la secuencia?","explicacion":"1000 + 500 + 1000 milisegundos = 2500 milisegundos, es decir, 2,5 segundos."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-tres-leds'), 'LED ROJO', 'Ánodo (+)', 'GPIO25', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-tres-leds'), 'LED ROJO', 'Cátodo (-) via R330', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-tres-leds'), 'LED AMARILLO', 'Ánodo (+)', 'GPIO26', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-tres-leds'), 'LED AMARILLO', 'Cátodo (-) via R330', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-tres-leds'), 'LED VERDE', 'Ánodo (+)', 'GPIO33', 'mismo pin que el principal', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-tres-leds'), 'LED VERDE', 'Cátodo (-) via R330', 'GND', NULL, 6);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-practica-tres-leds'), 'arduino', $cp$/*
  Practica: enciende los 3 LEDs en secuencia
  Kit 6to EGB - ESP32 DevKit V1 (30 pines)
  Mismos pines que usara el semaforo (D8, D9, D10). Enciende cada
  color por turno, como el primer paso hacia el semaforo real.
*/
const int ROJO = 25;
const int AMARILLO = 26;
const int VERDE = 33;

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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Semáforo inteligente con paso peatonal', 'copol-semaforo-inteligente', 'principal', 'Un semáforo de 3 luces que cambia en secuencia y se detiene en rojo cuando un peatón presiona el botón para cruzar, avisando con el buzzer.', ARRAY['Controlar varias salidas digitales (LEDs) con una secuencia de tiempo usando digitalWrite y delay.', 'Usar un pulsador con INPUT_PULLUP para que un evento externo interrumpa la secuencia normal del programa.', 'Generar un aviso sonoro con tone(), la forma correcta de usar un buzzer pasivo.', 'Calcular y aplicar la resistencia limitadora de corriente correcta para no quemar un LED.']::text[], 1, $cp${"reto":{"texto":"Vas a construir un semáforo que reacciona a las personas: funciona en secuencia, pero si un peatón presiona el botón, corta el verde antes de tiempo, pasa a rojo y avisa con tres pitidos que ya se puede cruzar. Une todo lo que practicaste.","paraQue":"Los semáforos con botón existen en cruces escolares y avenidas: dan paso a los carros la mayor parte del tiempo y solo se detienen cuando alguien lo pide. Es un sistema que toma decisiones según lo que pasa a su alrededor.","duracion":"60 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Con un cable negro une uno de los pines GND del ESP32 con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.","rieles":["GND"],"titulo":"Lleva tierra a la línea negra"},{"texto":"Pata larga al pin GPIO25. Pata corta a la línea negra pasando por una resistencia de 330 Ω.","titulo":"Arma el LED rojo","conexiones":[0,1]},{"texto":"Pata larga al pin GPIO26. Pata corta a la línea negra pasando por otra resistencia.","titulo":"Arma el LED amarillo","conexiones":[2,3]},{"texto":"Pata larga al pin GPIO33. Pata corta a la línea negra pasando por la tercera resistencia.","titulo":"Arma el LED verde","conexiones":[4,5]},{"texto":"Una pata al pin GPIO27 y la pata del lado opuesto a la línea negra.","titulo":"Coloca el pulsador del peatón","consejo":"Déjalo en un borde de la protoboard, donde sea fácil presionarlo.","conexiones":[6,7]},{"texto":"La pata marcada con + al pin GPIO13 y la otra a la línea negra.","titulo":"Conecta el buzzer","conexiones":[8,9]},{"texto":"Conecta el ESP32 a la computadora con el cable V8 (Micro-USB). Debe encenderse una luz roja en la placa: eso indica que tiene energía.","titulo":"Conecta el cable USB"}],"codigo":[{"texto":"Cuánto dura cada luz está definido al inicio, en milisegundos. Para ajustar el semáforo cambias estos números, sin tocar el resto.","titulo":"Los tiempos están arriba","fragmento":"const unsigned long TIEMPO_VERDE = 5000;\nconst unsigned long TIEMPO_AMARILLO = 1500;\nconst unsigned long TIEMPO_ROJO = 4000;"},{"texto":"peatonEsperando guarda si alguien presionó el botón. Empieza en falso. Es la memoria del semáforo.","titulo":"Una variable que recuerda","fragmento":"bool peatonEsperando = false;"},{"texto":"Esta es la idea central. En lugar de delay(), que deja al ESP32 \"sordo\", se usa millis() para medir el tiempo mientras se sigue leyendo el botón. Si alguien presiona, se anota y se sale del verde con break.","titulo":"El verde que se puede interrumpir","fragmento":"unsigned long inicio = millis();\nwhile (millis() - inicio < TIEMPO_VERDE) {\n  if (digitalRead(PULSADOR_PEATON) == LOW) {\n    peatonEsperando = true;\n    break;\n  }\n}"},{"texto":"loop() describe una vuelta completa: verde (interrumpible), amarillo y rojo. Antes de cambiar de luz se apagan todas con apagarTodo().","titulo":"El orden del ciclo","fragmento":"cicloVerdeConInterrupcion();\napagarTodo();\ndigitalWrite(LED_AMARILLO, HIGH);\ndelay(TIEMPO_AMARILLO);\napagarTodo();\ndigitalWrite(LED_ROJO, HIGH);"},{"texto":"Ya en rojo, el semáforo revisa su memoria. Si había un peatón esperando, suena el aviso y borra el pedido para la siguiente vuelta.","titulo":"Avisar solo si alguien pidió el paso","fragmento":"if (peatonEsperando) {\n  avisoSonoroCruce();\n  peatonEsperando = false;\n}\ndelay(TIEMPO_ROJO);"},{"texto":"apagarTodo() y avisoSonoroCruce() agrupan varias líneas bajo un nombre claro. Así loop() se lee casi como una lista de instrucciones.","titulo":"Funciones pequeñas con nombre","fragmento":"void avisoSonoroCruce() {\n  for (int i = 0; i < 3; i++) {\n    tone(BUZZER, 1500, 150);\n    delay(300);\n  }\n  noTone(BUZZER);\n}"}],"piezas":[{"nombre":"LED rojo, amarillo y verde con sus resistencias","cuidado":"Pata larga al pin; pata corta a tierra pasando por la resistencia de 330 Ω.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-leds-d9ed2606.webp","paraQue":"Las tres luces para los carros."},{"nombre":"Pulsador","cuidado":"Colócalo a caballo sobre el canal central y usa patas de lados opuestos.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-pulsador-32276b41.webp","paraQue":"El botón que presiona el peatón para pedir el paso."},{"nombre":"Buzzer pasivo","cuidado":"La pata marcada con + va al pin del ESP32.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-ar0355-buzzer-pasivo-v1-1-1024x1024-379ffe43.webp","paraQue":"Avisa con tres pitidos que el semáforo está en rojo y se puede cruzar."},{"nombre":"ESP32 DevKit V1 (30 pines)","cuidado":"No lo apoyes sobre objetos metálicos mientras está conectado: la parte de abajo tiene soldaduras expuestas.","paraQue":"Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines."},{"nombre":"Protoboard","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y la línea larga negra (–) del borde sirve para repartir la tierra."}],"prueba":{"queDebePasar":["Sin tocar nada: verde 5 segundos, amarillo 1,5 segundos, rojo 4 segundos, y se repite. No suena el buzzer.","Si presionas el botón durante el verde, pasa a amarillo de inmediato.","Al llegar al rojo después de presionar, suenan tres pitidos cortos.","En la vuelta siguiente, si nadie presiona, el semáforo vuelve a su ritmo normal y no suena."],"siNoFunciona":[{"revisa":"El pin GPIO27 está leyendo LOW todo el tiempo. Gira el pulsador un cuarto de vuelta: estás usando dos patas que ya están unidas por dentro.","problema":"El verde se corta enseguida, sin presionar"},{"revisa":"Solo responde durante el verde. Comprueba que una pata va al pin GPIO27 y la otra a la línea negra.","problema":"Presiono el botón y no pasa nada"},{"revisa":"Invierte sus patas y revisa que llegue al pin GPIO13. Pruébalo solo con la práctica del buzzer.","problema":"No suena el buzzer"},{"revisa":"Gira ese LED y revisa su resistencia. Rojo al 8, amarillo al 9 y verde al 10.","problema":"Una luz no enciende"},{"revisa":"En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en \"Connecting…\", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.","problema":"El programa no se sube"}]},"demuestra":{"reto":"Mejora tu semáforo: haz que el verde dure 8 segundos y que el aviso tenga cinco pitidos en lugar de tres. Después explica a un compañero qué dos números cambiaste.","preguntas":[{"correcta":1,"opciones":["Porque delay() no funciona con LEDs verdes","Porque durante un delay() el ESP32 no puede leer el botón","Porque delay() gasta más energía"],"pregunta":"¿Por qué el verde no usa delay(TIEMPO_VERDE)?","explicacion":"delay() detiene todo. Con millis() el ESP32 mide el tiempo y sigue atento al pulsador."},{"correcta":0,"opciones":["Para recordar que alguien presionó el botón hasta que el semáforo llegue al rojo","Para contar cuántos carros pasan","Para encender el LED verde"],"pregunta":"¿Para qué sirve la variable peatonEsperando?","explicacion":"El botón se presiona en verde, pero el aviso suena después, en rojo. La variable guarda ese pedido."},{"correcta":1,"opciones":["TIEMPO_ROJO","TIEMPO_VERDE","TIEMPO_AMARILLO"],"pregunta":"Quieres que los carros tengan más tiempo para pasar. ¿Qué cambias?","explicacion":"TIEMPO_VERDE es cuánto dura la luz verde, en milisegundos."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'LED ROJO', 'Ánodo (+)', 'GPIO25', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'LED ROJO', 'Cátodo (-) via R330', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'LED AMARILLO', 'Ánodo (+)', 'GPIO26', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'LED AMARILLO', 'Cátodo (-) via R330', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'LED VERDE', 'Ánodo (+)', 'GPIO33', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'LED VERDE', 'Cátodo (-) via R330', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'PULSADOR PEATON', 'Pin 1', 'GPIO27', 'INPUT_PULLUP', 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'PULSADOR PEATON', 'Pin 2', 'GND', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'BUZZER PASIVO', '+', 'GPIO13', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'BUZZER PASIVO', '-', 'GND', NULL, 10);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-semaforo-inteligente'), 'arduino', $cp$/*
  Semaforo inteligente con paso peatonal
  Kit 6to EGB - ESP32 DevKit V1 (30 pines)  En Arduino IDE: Placa "ESP32 Dev Module".

  El semaforo cicla rojo -> verde -> amarillo -> rojo. Si un peaton
  presiona el pulsador mientras el semaforo esta en verde, se corta
  el ciclo, pasa a amarillo y luego a rojo para dejar cruzar,
  avisando con el buzzer.

  IMPORTANTE: el buzzer de este kit es PASIVO. Un buzzer pasivo solo
  suena con tone()/noTone() (necesita una señal oscilante); si le
  mandas digitalWrite(HIGH) se queda en silencio o hace un clic.
*/

const int LED_ROJO = 25;
const int LED_AMARILLO = 26;
const int LED_VERDE = 33;
const int PULSADOR_PEATON = 27;
const int BUZZER = 13;

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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Detector de obstáculos', 'copol-detector-obstaculos', 'adicional', 'Un sensor infrarrojo detecta objetos cercanos y enciende un LED con una alarma sonora.', ARRAY['Leer una señal digital de un sensor infrarrojo FC-51.', 'Relacionar una entrada digital con dos salidas (LED y buzzer).']::text[], 2, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'SENSOR IR FC-51', 'OUT', 'GPIO14', 'LOW = detecta', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'LED AZUL (alerta)', 'Ánodo (+) via R330', 'GPIO32', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'LED AZUL (alerta)', 'Cátodo (-)', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'BUZZER PASIVO', '+', 'GPIO13', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'BUZZER PASIVO', '-', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'SENSOR IR FC-51', 'VCC', '3V3', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'SENSOR IR FC-51', 'GND', 'GND', NULL, 7);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-detector-obstaculos'), 'arduino', $cp$/*
  Detector de obstaculos
  Kit 6to EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  Usa el sensor infrarrojo FC-51: si detecta un objeto cerca,
  enciende un LED y suena el buzzer (pasivo, con tone()).
*/
const int SENSOR_IR = 14;
const int LED_ALERTA = 32;
const int BUZZER = 13;

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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Alarma de puerta', 'copol-alarma', 'adicional', 'Simula una alarma de puerta: si el sensor (pulsador) se abre, suena el buzzer y parpadea el LED rojo.', ARRAY['Detectar un cambio de estado en una entrada digital.', 'Mantener un estado (armada/disparada) usando una variable booleana.']::text[], 3, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-alarma'), 'PULSADOR (sensor puerta)', 'Pin 1', 'GPIO27', 'INPUT_PULLUP, igual que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-alarma'), 'LED ROJO', 'Ánodo (+)', 'GPIO25', 'mismo pin que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-alarma'), 'BUZZER PASIVO', '+', 'GPIO13', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-alarma'), 'PULSADOR (sensor puerta)', 'Pin 2', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-alarma'), 'LED ROJO', 'Cátodo (-) via R330', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-alarma'), 'BUZZER PASIVO', '-', 'GND', NULL, 6);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-alarma'), 'arduino', $cp$/*
  Alarma de puerta
  Kit 6to EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  Mismo armado del semaforo (reutiliza el pulsador, el LED rojo y el
  buzzer pasivo). Si el pulsador se suelta (simula que la puerta se
  abre), dispara la alarma.

  NOTA: para simplificar, esta version no tiene forma de desactivar
  la alarma sin reiniciar la placa. En un proyecto real agregarias un
  segundo pulsador o una clave para apagarla.
*/
const int SENSOR_PUERTA = 27;
const int LED_ALARMA = 25;
const int BUZZER = 13;

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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Control de servomotor con potenciómetro', 'copol-control-servomotor', 'adicional', 'El ángulo de un servomotor se controla en vivo girando un potenciómetro.', ARRAY['Leer un valor analógico y convertirlo (map) a otro rango de salida.', 'Controlar un servomotor con la librería Servo.']::text[], 4, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-control-servomotor'), 'POTENCIOMETRO', 'Terminal A', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-control-servomotor'), 'POTENCIOMETRO', 'Wiper', 'GPIO34', 'solo entrada', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-control-servomotor'), 'POTENCIOMETRO', 'Terminal B', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-control-servomotor'), 'SERVOMOTOR SG90', 'Señal', 'GPIO18', '5 V del USB solo en VCC', 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-control-servomotor'), 'SERVOMOTOR SG90', 'VCC', 'VIN', '5 V del USB', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-control-servomotor'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 6);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-control-servomotor'), 'arduino', $cp$/*
  Control de servomotor con potenciometro
  Kit 6to EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  Gira un servomotor a la posicion que indica el potenciometro.
*/
#include <ESP32Servo.h>  // instala la libreria ESP32Servo

const int POTENCIOMETRO = 34;
const int SERVO_PIN = 18;

Servo motor;

void setup() {
  motor.attach(SERVO_PIN);
}

void loop() {
  int valor = analogRead(POTENCIOMETRO);
  int angulo = map(valor, 0, 4095, 0, 180);
  motor.write(angulo);
  delay(15);
}
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-sexto-egb', 'Piano con pulsador y potenciómetro', 'copol-piano-pulsadores', 'adicional', 'Un piano de una sola tecla: giras el potenciómetro para elegir la nota y presionas el pulsador para que suene en el buzzer.', ARRAY['Leer una entrada analógica (potenciómetro) y una digital (pulsador) en el mismo programa.', 'Convertir un rango de valores en posiciones de una lista con map().', 'Generar tonos de distinta frecuencia con la función tone(), ideal para el buzzer pasivo de este kit.']::text[], 5, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'PULSADOR (tecla)', 'Pin 1', 'GPIO27', 'INPUT_PULLUP', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'PULSADOR (tecla)', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'POTENCIOMETRO (nota)', 'Terminal A', '3V3', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'POTENCIOMETRO (nota)', 'Wiper', 'GPIO34', 'solo entrada', 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'POTENCIOMETRO (nota)', 'Terminal B', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'BUZZER PASIVO', '+', 'GPIO25', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'BUZZER PASIVO', '-', 'GND', NULL, 7);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-sexto-egb' AND slug = 'copol-piano-pulsadores'), 'arduino', $cp$/*
  Piano con pulsador y potenciometro
  Kit 6to EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  El potenciometro elige la nota (do, re, mi, fa, sol, la, si, do)
  y el pulsador la hace sonar en el buzzer pasivo. El pulsador usa
  la resistencia interna del Arduino (INPUT_PULLUP): presionado = LOW.
*/
const int PULSADOR = 27;
const int POTENCIOMETRO = 34;
const int BUZZER = 25;

const int NOTAS[8] = {262, 294, 330, 349, 392, 440, 494, 523};

void setup() {
  pinMode(PULSADOR, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  int posicion = map(analogRead(POTENCIOMETRO), 0, 4095, 0, 7);

  if (digitalRead(PULSADOR) == LOW) {
    tone(BUZZER, NOTAS[posicion]);
    Serial.print("Nota numero: ");
    Serial.println(posicion + 1);
  } else {
    noTone(BUZZER);
  }

  delay(20);
}
$cp$, 1);

-- ===== kit-copol-septimo-egb =====
UPDATE kits SET placa_id = 'placa-esp32-devkit-v1', alimentacion = 'Cable USB V8 (Micro-USB): se programa y se alimenta desde la computadora o desde un cargador de celular de al menos 1 A (cargador NO incluido).', advertencia_seguridad = 'Nunca conectes 5 V a un pin de señal del ESP32. El sensor ultrasónico va a 3V3.', notas = 'ESP32 DevKit V1 de 30 pines. Sus pines de señal trabajan a 3,3 V: sensores y potenciómetro van a 3V3. El servomotor es la única pieza que va a VIN (5 V del USB). Pulsadores con INPUT_PULLUP (sin resistencia). En Arduino IDE: placa "ESP32 Dev Module", Monitor Serial a 115200. El sensor HC-SR04 se alimenta a 3V3 para que su pin Echo no entregue 5 V a la placa.', visible = true WHERE id = 'kit-copol-septimo-egb';
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  ('kit-copol-septimo-egb', 'board-esp32-devkit', 1, NULL, true),
  ('kit-copol-septimo-egb', 'protoboard-400', 1, NULL, true),
  ('kit-copol-septimo-egb', 'sensor-ultrasonico-hcsr04', 1, NULL, true),
  ('kit-copol-septimo-egb', 'servo-sg90', 1, NULL, true),
  ('kit-copol-septimo-egb', 'led-generico', 3, NULL, true),
  ('kit-copol-septimo-egb', 'pulsador', 1, NULL, true),
  ('kit-copol-septimo-egb', 'potenciometro-10k', 1, NULL, true),
  ('kit-copol-septimo-egb', 'resistencia-330', 1, NULL, true),
  ('kit-copol-septimo-egb', 'resistencia-1k', 1, 'Repuesto / experimentacion libre', true),
  ('kit-copol-septimo-egb', 'jumper-mm', 10, NULL, true),
  ('kit-copol-septimo-egb', 'jumper-mh', 5, NULL, true),
  ('kit-copol-septimo-egb', 'jumper-hh', 5, NULL, true),
  ('kit-copol-septimo-egb', 'cable-usb-v8', 1, NULL, true);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Enciende el LED indicador', 'copol-practica-led-tapa', 'practica', 'Antes del basurero completo, practica con el LED solo: es el que avisa que la tapa está abierta.', ARRAY['Usar pinMode() y digitalWrite() para controlar una salida digital.', 'Entender por qué un LED necesita una resistencia en serie.']::text[], -3, $cp${"reto":{"texto":"Vas a hacer que un LED se encienda y se apague solo, una vez por segundo. Es el primer programa que escribe cualquier persona que aprende a programar placas electrónicas, y es la luz que después avisará que la tapa del basurero está abierta.","paraQue":"Las luces indicadoras están en todas partes: el foco rojo del televisor en espera, la luz del cargador, el intermitente de un carro. Todas funcionan igual que lo que vas a armar: un programa decide cuándo dejar pasar la corriente.","duracion":"25 minutos"},"pasos":[{"texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","titulo":"Coloca el ESP32","consejo":"Si queda a caballo sobre el canal, las patitas de la izquierda y de la derecha no se tocan entre sí."},{"texto":"Con un cable negro une el pin GND del ESP32 con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.","rieles":["GND"],"titulo":"Lleva tierra a la línea negra"},{"texto":"Pon el LED en la protoboard con cada pata en una fila distinta. Une la pata larga (ánodo) con un extremo de la resistencia de 330 Ω, y el otro extremo de la resistencia con el pin GPIO25 del ESP32.","titulo":"Conecta el LED con su resistencia","consejo":"La resistencia no tiene lado: puede ir en cualquier sentido.","conexiones":[0]},{"texto":"Une la pata corta del LED (cátodo) con la línea negra (–). Así la corriente tiene un camino completo: sale de GPIO25, cruza la resistencia y el LED, y vuelve a tierra.","titulo":"Cierra el circuito","conexiones":[1]},{"texto":"Conecta el ESP32 a la computadora con el cable V8 (Micro-USB). Debe encenderse una luz roja en la placa: eso indica que tiene energía.","titulo":"Conecta el cable USB"}],"codigo":[{"texto":"En lugar de escribir el número 8 por todo el programa, se guarda en una constante llamada LED. Si un día cambias de pin, corriges una sola línea.","titulo":"Dale un nombre al pin","fragmento":"const int LED = 25;"},{"texto":"Cuando el ESP32 enciende, ejecuta setup() una vez. Aquí le dices que el pin del LED es una salida, es decir, que por ahí va a enviar corriente.","titulo":"setup(): se ejecuta una sola vez","fragmento":"void setup() {\n  pinMode(LED, OUTPUT);\n}"},{"texto":"HIGH enciende el LED (3,3 V en el pin) y LOW lo apaga (0 V). delay(500) espera 500 milisegundos, que es medio segundo. Al terminar, loop() vuelve a empezar solo.","titulo":"loop(): se repite para siempre","fragmento":"void loop() {\n  digitalWrite(LED, HIGH);\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}"}],"piezas":[{"nombre":"ESP32 DevKit V1 (30 pines)","cuidado":"Sujétalo por los bordes; no dobles sus patitas al ponerlo en la protoboard.","paraQue":"Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines."},{"nombre":"Protoboard","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y las dos líneas largas del borde (roja y negra) sirven para repartir corriente y tierra."},{"nombre":"LED","cuidado":"Tiene dos patas distintas: la larga es el positivo (ánodo) y la corta el negativo (cátodo). Al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-leds-d9ed2606.webp","paraQue":"Es una luz pequeña que se enciende cuando la corriente pasa en el sentido correcto."},{"nombre":"Resistencia de 330 Ω","cuidado":"Nunca conectes un LED directo a la placa sin resistencia.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-resistencia-5e4b0d9c.webp","paraQue":"Frena la corriente para que el LED no se queme. Va siempre en serie con el LED."},{"nombre":"Cables jumper","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cables-jumper-ok-fbd4e0c8.webp","paraQue":"Llevan la corriente de un punto a otro de la protoboard."}],"prueba":{"queDebePasar":["Al subir el programa, el LED se enciende medio segundo y se apaga medio segundo, sin parar.","Si desconectas y vuelves a conectar el USB, el parpadeo empieza de nuevo solo: el programa quedó guardado en el ESP32."],"siNoFunciona":[{"revisa":"Gira el LED: lo más probable es que esté al revés. La pata larga va hacia la resistencia y la corta hacia tierra.","problema":"El LED no enciende nunca"},{"revisa":"Comprueba que el cable de la resistencia llega al pin GPIO25 y no al de al lado, y que la línea negra de la protoboard está unida al GND del ESP32.","problema":"Sigue sin encender"},{"revisa":"En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en \"Connecting…\", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.","problema":"El programa no se sube"},{"revisa":"Instala el controlador CP210x o CH340 con ayuda de tu docente y prueba con otro cable: algunos cables V8 solo cargan.","problema":"La computadora no detecta el ESP32"}]},"demuestra":{"reto":"Haz que el LED parpadee como una señal de auxilio: tres destellos rápidos, una pausa larga, y que se repita. Pista: copia las líneas de encender y apagar, y cambia los números de delay().","preguntas":[{"correcta":1,"opciones":["Para que el LED brille más","Para limitar la corriente y que el LED no se queme","Para que el programa corra más rápido"],"pregunta":"¿Para qué sirve la resistencia de 330 Ω?","explicacion":"La resistencia frena la corriente. Sin ella pasaría demasiada y el LED se dañaría."},{"correcta":2,"opciones":["Una sola vez","Diez veces","Se repite sin parar mientras haya energía"],"pregunta":"¿Cuántas veces se ejecuta loop()?","explicacion":"setup() corre una vez al encender; loop() se repite para siempre."},{"correcta":0,"opciones":["El LED parpadea más rápido","El LED parpadea más lento","El LED queda apagado"],"pregunta":"Si cambias los dos delay(500) por delay(100), ¿qué pasa?","explicacion":"Menos espera entre encender y apagar significa un parpadeo más rápido."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-led-tapa'), 'LED (tapa abierta)', 'Ánodo (+) via R330', 'GPIO25', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-led-tapa'), 'LED (tapa abierta)', 'Cátodo (-)', 'GND', NULL, 2);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-led-tapa'), 'arduino', $cp$/*
  Practica: enciende el LED indicador
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines)
  Mismo pin que usara el basurero inteligente (D8).
*/
const int LED = 25;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Mide distancia con el sensor ultrasónico', 'copol-practica-sensor-distancia', 'practica', 'Antes del basurero inteligente, practica con el sensor solo: mide la distancia y míralo en el Monitor Serial.', ARRAY['Entender como un sensor ultrasonico mide distancia con un pulso de sonido.', 'Usar el Monitor Serial para ver datos en tiempo real.']::text[], -2, $cp${"reto":{"texto":"Vas a medir a qué distancia está tu mano sin tocarla, y a ver el número en la pantalla de la computadora cambiando en vivo mientras la acercas y la alejas.","paraQue":"Así funcionan los sensores de estacionamiento de los carros y los robots que esquivan obstáculos. El sensor lanza un sonido que no escuchamos, espera el eco y calcula la distancia, igual que un murciélago.","duracion":"35 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Une el pin 3V3 del ESP32 con la línea roja (+) de la protoboard y el pin GND con la línea negra (–). Usa cable rojo para 3,3 V y negro para tierra: así nunca los confundes.","rieles":["3V3","GND"],"titulo":"Reparte corriente y tierra"},{"texto":"Pon el sensor en la protoboard con los \"ojos\" mirando hacia afuera. Une su pin VCC con la línea roja y su pin GND con la línea negra.","titulo":"Coloca el sensor y dale energía","consejo":"VCC y GND están en los extremos del sensor. Si los cruzas, el sensor se calienta: desconecta de inmediato.","conexiones":[0,1]},{"texto":"Une el pin Trig del sensor con el pin GPIO22 del ESP32. Por este cable el ESP32 le dice al sensor: \"lanza el sonido ahora\".","titulo":"Conecta Trig (el disparo)","conexiones":[2]},{"texto":"Une el pin Echo del sensor con el pin GPIO23 del ESP32. Por este cable el sensor avisa cuánto tardó en volver el eco.","titulo":"Conecta Echo (la respuesta)","conexiones":[3]},{"texto":"Conecta el ESP32 a la computadora. Después de subir el programa, abre el Monitor Serial (el ícono de lupa, arriba a la derecha) y elige 115200 baudios abajo a la derecha.","titulo":"Conecta el USB y abre el Monitor Serial"}],"codigo":[{"texto":"Trig es por donde el ESP32 habla y Echo por donde escucha.","titulo":"Nombres para los dos pines","fragmento":"const int TRIG = 22;\nconst int ECHO = 23;"},{"texto":"TRIG es salida porque el ESP32 envía la orden; ECHO es entrada porque recibe la respuesta. Serial.begin(115200) abre la comunicación con la computadora.","titulo":"Preparar pines y pantalla","fragmento":"pinMode(TRIG, OUTPUT);\npinMode(ECHO, INPUT);\nSerial.begin(115200);"},{"texto":"Se apaga Trig un instante para empezar limpio, se enciende durante 10 microsegundos y se apaga otra vez. Ese pulso corto es la orden de disparo.","titulo":"Disparar el sonido","fragmento":"digitalWrite(TRIG, LOW);\ndelayMicroseconds(2);\ndigitalWrite(TRIG, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(TRIG, LOW);"},{"texto":"pulseIn() mide cuántos microsegundos tarda en volver el eco. El sonido recorre 1 cm de ida y 1 cm de vuelta en unos 58 microsegundos; por eso se divide para 58.","titulo":"Medir el eco y convertirlo a centímetros","fragmento":"long duracion = pulseIn(ECHO, HIGH, 25000);\nlong distanciaCm = duracion / 58;"},{"texto":"Serial.print escribe en la pantalla de la computadora. La pausa de 300 ms evita que los números pasen demasiado rápido para leerlos.","titulo":"Mostrar el resultado","fragmento":"Serial.print(\"Distancia: \");\nSerial.print(distanciaCm);\nSerial.println(\" cm\");\ndelay(300);"}],"piezas":[{"nombre":"Sensor ultrasónico HC-SR04","cuidado":"Aquí se alimenta con 3,3 V, no con 5 V: así su respuesta (Echo) no daña al ESP32.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-sensorultrasonico-98453462.webp","paraQue":"Mide distancias entre 2 cm y unos 4 metros. Uno de sus \"ojos\" emite el sonido y el otro escucha el eco."},{"nombre":"ESP32 DevKit V1 (30 pines)","paraQue":"Le ordena al sensor disparar el sonido, mide cuánto tarda el eco y convierte ese tiempo en centímetros.","cuidado":"Sus pines trabajan a 3,3 V. Nunca conectes 5 V a un pin de señal."},{"nombre":"Protoboard y cables jumper","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Sostienen el sensor y llevan corriente, tierra y las dos señales."}],"prueba":{"queDebePasar":["En el Monitor Serial aparece una línea nueva unas tres veces por segundo: \"Distancia: 23 cm\".","Al acercar la mano el número baja; al alejarla, sube.","Con una regla, la distancia que marca se parece a la real (puede variar 1 o 2 cm)."],"siNoFunciona":[{"revisa":"El eco no está llegando. Revisa que Echo vaya a GPIO23 y Trig a GPIO22: es muy común tenerlos cruzados. Si están bien y sigue en 0, tu sensor puede ser un modelo que solo trabaja con 5 V: avisa a tu docente.","problema":"Siempre marca 0 cm"},{"revisa":"La velocidad del Monitor Serial no coincide. Elige 115200 baudios abajo a la derecha.","problema":"Salen símbolos raros en lugar de números"},{"revisa":"Apunta el sensor a una superficie plana y dura, como un cuaderno. La ropa y las superficies inclinadas devuelven mal el eco.","problema":"Los números saltan mucho"},{"revisa":"Comprueba que el sensor tiene energía: VCC a la línea roja y GND a la línea negra, y que esas líneas llegan a 3V3 y GND del ESP32.","problema":"No aparece nada en el Monitor Serial"}]},"demuestra":{"reto":"Agrega una condición: si la distancia es menor a 10 cm, que además escriba \"¡Muy cerca!\". Pista: usa if (distanciaCm < 10) { ... } antes del delay.","preguntas":[{"correcta":1,"opciones":["Recibe el eco","Le da la orden al sensor de lanzar el sonido","Le da energía al sensor"],"pregunta":"¿Qué hace el pin Trig?","explicacion":"Trig dispara el sonido; Echo es el que devuelve la respuesta."},{"correcta":0,"opciones":["Porque el sonido tarda unos 58 microsegundos en ir y volver 1 cm","Porque el sensor tiene 58 pines","Es un número al azar"],"pregunta":"¿Por qué se divide la duración para 58?","explicacion":"El tiempo medido incluye la ida y la vuelta del sonido. 58 microsegundos equivalen a 1 cm de distancia."},{"correcta":1,"opciones":["Para darle energía al ESP32","Para ver en la computadora los datos que envía el ESP32","Para subir el programa"],"pregunta":"¿Para qué sirve el Monitor Serial?","explicacion":"Es una ventana para leer lo que el ESP32 escribe con Serial.print."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-sensor-distancia'), 'SENSOR HC-SR04', 'VCC', '3V3', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-sensor-distancia'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-sensor-distancia'), 'SENSOR HC-SR04', 'Trig', 'GPIO22', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-sensor-distancia'), 'SENSOR HC-SR04', 'Echo', 'GPIO23', NULL, 4);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-sensor-distancia'), 'arduino', $cp$/*
  Practica: mide distancia con el sensor ultrasonico
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines)
  Mismos pines que usara el basurero inteligente (D9 y D10). Abre el
  Monitor Serial (9600 baudios) para ver la distancia en centimetros.
*/
const int TRIG = 22;
const int ECHO = 23;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(115200);
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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Mueve el servomotor', 'copol-practica-servomotor', 'practica', 'Practica con el servomotor solo: hazlo girar de un lado a otro antes de usarlo como tapa del basurero.', ARRAY['Controlar la posicion de un servomotor con la libreria Servo.', 'Entender el rango de movimiento de 0 a 180 grados.']::text[], -1, $cp${"reto":{"texto":"Vas a hacer que un motor gire exactamente hasta donde tú le digas y regrese: de 0 a 90 grados, una y otra vez. Ese movimiento es el que después abrirá y cerrará la tapa del basurero.","paraQue":"Un servomotor no gira sin parar como el motor de un ventilador: se mueve a un ángulo exacto y se queda ahí. Por eso se usa en brazos robóticos, en el timón de los aviones a control remoto y en cerraduras electrónicas.","duracion":"30 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Con un cable negro une un pin GND del ESP32 con la línea negra (–) de la protoboard.","rieles":["GND"],"titulo":"Lleva tierra a la línea negra"},{"texto":"Inserta un jumper en cada agujero del conector del servo. El del cable rojo va directo al pin VIN del ESP32 (por ahí salen los 5 V del USB) y el del cable café va a la línea negra (–).","titulo":"Dale energía al servo","consejo":"El servo es la única pieza que va a VIN: necesita 5 V. Si lo conectas a 3V3 le falta fuerza y la placa se reinicia.","conexiones":[1,2]},{"texto":"Une el cable naranja del servo con el pin GPIO18 del ESP32. Por ahí viaja la orden del ángulo.","titulo":"Conecta la señal","conexiones":[0]},{"texto":"Encaja el brazo plástico en el eje del servo, sin atornillarlo todavía. Conecta el ESP32 a la computadora.","titulo":"Coloca el brazo y conecta el USB"}],"codigo":[{"texto":"Una librería es código ya hecho por otras personas. Esta sabe cómo hablarle a un servomotor, así tú solo escribes el ángulo.","titulo":"Incluir la librería Servo","fragmento":"#include <ESP32Servo.h>  // instala la libreria ESP32Servo"},{"texto":"Se guarda el número del pin y se crea un objeto llamado motor. A partir de aquí, motor representa a tu servo.","titulo":"Crear el servo","fragmento":"const int SERVO_PIN = 18;\nServo motor;"},{"texto":"attach() conecta el objeto motor con el pin GPIO18. Se hace una sola vez, en setup().","titulo":"Decir en qué pin está","fragmento":"void setup() {\n  motor.attach(SERVO_PIN);\n}"},{"texto":"write(0) lo lleva a 0 grados y write(90) a 90 grados. La pausa de 800 ms le da tiempo de llegar antes de la siguiente orden.","titulo":"Moverlo","fragmento":"void loop() {\n  motor.write(0);\n  delay(800);\n  motor.write(90);\n  delay(800);\n}"}],"piezas":[{"nombre":"Servomotor SG90","cuidado":"Tiene 3 cables: café es tierra, rojo es 5 V (pin VIN) y naranja es la señal. No lo gires a la fuerza con la mano: se dañan sus engranajes.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-micro-servo-9g-sg90-d148eb51.webp","paraQue":"Motor pequeño que gira entre 0 y 180 grados y mantiene la posición que le ordenas."},{"nombre":"Brazo del servo","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-micro-servo-9g-sg90-d148eb51.webp","paraQue":"La pieza plástica blanca que se encaja en el eje. Es la que empujará la tapa del basurero."},{"nombre":"ESP32 DevKit V1 (30 pines)","paraQue":"Le envía al servo la orden de a qué ángulo moverse por el pin GPIO18.","cuidado":"Sus pines trabajan a 3,3 V. Nunca conectes 5 V a un pin de señal."},{"nombre":"Protoboard y cables jumper","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Como el conector del servo es hembra, necesitas tres jumper macho-macho para unirlo a la protoboard."}],"prueba":{"queDebePasar":["El brazo del servo gira un cuarto de vuelta, espera, regresa y repite.","El movimiento es firme y siempre llega al mismo punto."],"siNoFunciona":[{"revisa":"Revisa los colores: rojo al pin VIN, café a la línea negra y naranja a GPIO18. Comprueba que la línea negra llega a GND del ESP32.","problema":"El servo no se mueve"},{"revisa":"Le falta corriente. Comprueba que el cable rojo va a VIN y no a 3V3, y prueba con otro puerto USB o con un cargador de celular de al menos 1 A.","problema":"El servo vibra o tiembla sin girar bien"},{"revisa":"El motor consume mucho al empezar a moverse. Usa un cable USB corto y en buen estado, o un cargador de celular de al menos 1 A.","problema":"El ESP32 se reinicia cuando el servo arranca"},{"problema":"Da error \"ESP32Servo.h: No such file\"","revisa":"Falta la librería. En Arduino IDE abre Herramientas > Administrar bibliotecas, busca ESP32Servo e instálala."}]},"demuestra":{"reto":"Haz que el servo recorra tres posiciones: 0, 90 y 180 grados, con una pausa de un segundo en cada una. Luego marca con un lápiz hasta dónde llega el brazo en cada posición.","preguntas":[{"correcta":2,"opciones":["El rojo","El café","El naranja"],"pregunta":"¿Qué cable del servo lleva la orden del ángulo?","explicacion":"Rojo es 5 V (pin VIN), café es tierra y naranja es la señal."},{"correcta":1,"opciones":["Hace girar el motor 90 vueltas","Lleva el brazo a la posición de 90 grados","Apaga el motor durante 90 segundos"],"pregunta":"¿Qué hace motor.write(90)?","explicacion":"write() recibe un ángulo entre 0 y 180 y el servo se mueve a esa posición."},{"correcta":1,"opciones":["Gira más rápido","Se mueve a un ángulo exacto y se queda ahí","No necesita energía"],"pregunta":"¿En qué se diferencia un servomotor de un motor común?","explicacion":"Un motor común gira sin parar; un servo va a una posición exacta."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-servomotor'), 'SERVOMOTOR SG90', 'Señal', 'GPIO18', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-servomotor'), 'SERVOMOTOR SG90', 'VCC', 'VIN', '5 V del USB', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-servomotor'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 3);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-practica-servomotor'), 'arduino', $cp$/*
  Practica: mueve el servomotor
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines)
  Mismo pin que usara el basurero inteligente (D6). El servo gira de
  0 a 90 grados y vuelve, una y otra vez.
*/
#include <ESP32Servo.h>  // instala la libreria ESP32Servo

const int SERVO_PIN = 18;
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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Basurero inteligente con apertura automática', 'copol-basurero-inteligente', 'principal', 'La tapa del basurero se abre sola cuando detecta una mano o un objeto cerca, usando un sensor ultrasónico y un servomotor. Este kit no trae buzzer: la confirmación es con un LED.', ARRAY['Medir distancia con un sensor ultrasónico HC-SR04 e interpretar el resultado en centímetros.', 'Controlar la posición de un servomotor para abrir y cerrar una tapa.', 'Diseñar una condición (if) que active una acción solo cuando se cumple una regla de distancia.', 'Dar retroalimentación visual (no sonora) al usuario con un LED.']::text[], 1, $cp${"reto":{"texto":"Vas a construir un basurero que abre su tapa solo cuando acercas la mano, la mantiene abierta tres segundos y la vuelve a cerrar. Une todo lo que practicaste: el sensor mide, el servo mueve la tapa y el LED avisa.","paraQue":"Los basureros sin contacto se usan en hospitales, cocinas y baños públicos porque evitan tocar la tapa y pasar gérmenes de una persona a otra. Es un ejemplo real de automatización: un sensor detecta algo y una máquina responde sola.","duracion":"60 minutos"},"pasos":[{"titulo":"Coloca el ESP32","texto":"Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.","consejo":"Si ya quedó puesto de la clase anterior, déjalo donde está."},{"texto":"Une el pin 3V3 del ESP32 con la línea roja (+) de la protoboard y un pin GND con la línea negra (–). El sensor tomará energía de la línea roja. El servo no: él va directo a VIN.","rieles":["3V3","GND"],"titulo":"Reparte corriente y tierra","consejo":"Cable rojo para corriente y negro para tierra. Hazlo siempre igual y evitarás la mayoría de errores."},{"texto":"Coloca el sensor con los \"ojos\" hacia el frente del basurero. Une VCC con la línea roja y GND con la línea negra.","titulo":"Dale energía al sensor","conexiones":[0,1]},{"texto":"Une Trig con el pin GPIO22 y Echo con el pin GPIO23 del ESP32.","titulo":"Conecta las señales del sensor","consejo":"Usa dos colores distintos para no cruzarlos.","conexiones":[2,3]},{"texto":"Con dos jumper, lleva el cable rojo del servo directo al pin VIN del ESP32 (5 V del USB) y el cable café a la línea negra.","titulo":"Dale energía al servo","conexiones":[5,6],"consejo":"El servo nunca va a la línea roja de 3,3 V: se queda sin fuerza."},{"texto":"Une el cable naranja del servo con el pin GPIO18 del ESP32.","titulo":"Conecta la señal del servo","conexiones":[4]},{"texto":"Une la pata larga del LED con la resistencia de 330 Ω y el otro extremo de la resistencia con el pin GPIO25. La pata corta va a la línea negra.","titulo":"Conecta el LED con su resistencia","conexiones":[7,8]},{"texto":"Pega el sensor en el frente, mirando hacia donde se acerca la mano. Fija el servo junto a la bisagra de modo que su brazo, al subir, levante la tapa. Prueba el recorrido a mano antes de pegar definitivamente.","titulo":"Monta todo en el basurero","consejo":"Usa cinta primero y pegamento después: es normal tener que ajustar la posición del servo."}],"codigo":[{"texto":"Todos los números que quizá quieras cambiar están juntos al inicio: a qué distancia abre, hasta dónde gira la tapa y cuánto tiempo queda abierta. Para ajustar el basurero cambias aquí, sin tocar el resto.","titulo":"Los ajustes están arriba","fragmento":"const int DISTANCIA_APERTURA_CM = 15;\nconst int ANGULO_CERRADO = 0;\nconst int ANGULO_ABIERTO = 90;\nconst unsigned long TIEMPO_ABIERTA_MS = 3000;"},{"texto":"Se configuran los pines, se conecta el servo y se cierra la tapa, para empezar siempre en la misma posición.","titulo":"Preparar todo al encender","fragmento":"pinMode(TRIG, OUTPUT);\npinMode(ECHO, INPUT);\npinMode(LED_TAPA, OUTPUT);\ntapa.attach(SERVO_PIN);\ntapa.write(ANGULO_CERRADO);"},{"texto":"Esta es la idea central del proyecto. El ESP32 mide la distancia y, solo si hay algo a 15 cm o menos, abre la tapa. La condición \"mayor que 0\" descarta las lecturas fallidas.","titulo":"La decisión: medir y comparar","fragmento":"long distancia = medirDistanciaCm();\nif (distancia > 0 && distancia <= DISTANCIA_APERTURA_CM) {\n  abrirTapa();\n}"},{"texto":"Es lo mismo que hiciste en la práctica del sensor, guardado dentro de una función con nombre. Si el eco no vuelve, devuelve -1 para avisar que la lectura no sirve.","titulo":"Una función para medir","fragmento":"long duracion = pulseIn(ECHO, HIGH, 25000);\nif (duracion == 0) return -1;\nreturn duracion / 58;"},{"texto":"Abre la tapa, avisa con el LED, espera tres segundos, cierra y apaga el LED. La pausa final de medio segundo evita que se vuelva a abrir de inmediato si la mano sigue ahí.","titulo":"Una función para abrir y cerrar","fragmento":"tapa.write(ANGULO_ABIERTO);\nparpadearConfirmacion();\ndelay(TIEMPO_ABIERTA_MS);\ntapa.write(ANGULO_CERRADO);\ndigitalWrite(LED_TAPA, LOW);\ndelay(500);"},{"texto":"Un bucle for repite tres veces encender y apagar rápido. Al terminar deja el LED encendido mientras la tapa sigue abierta.","titulo":"El aviso con el LED","fragmento":"for (int i = 0; i < 3; i++) {\n  digitalWrite(LED_TAPA, HIGH);\n  delay(100);\n  digitalWrite(LED_TAPA, LOW);\n  delay(100);\n}\ndigitalWrite(LED_TAPA, HIGH);"}],"piezas":[{"nombre":"Sensor ultrasónico HC-SR04","cuidado":"Pines en orden: VCC, Trig, Echo, GND. Aquí se alimenta con 3,3 V, no con 5 V.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-sensorultrasonico-98453462.webp","paraQue":"Detecta si hay una mano cerca midiendo la distancia. Es el \"ojo\" del basurero."},{"nombre":"Servomotor SG90","cuidado":"Café es tierra, rojo es 5 V (pin VIN) y naranja es la señal. No lo fuerces con la mano.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-micro-servo-9g-sg90-d148eb51.webp","paraQue":"Empuja la tapa para abrirla y la suelta para cerrarla. Es el \"músculo\"."},{"nombre":"LED con resistencia de 330 Ω","cuidado":"Pata larga hacia la resistencia, pata corta hacia tierra.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-leds-d9ed2606.webp","paraQue":"Parpadea tres veces al abrir y queda encendido mientras la tapa está abierta."},{"nombre":"ESP32 DevKit V1 (30 pines)","paraQue":"Lee el sensor muchas veces por segundo y decide cuándo mover el servo y encender el LED.","cuidado":"Sus pines trabajan a 3,3 V. Nunca conectes 5 V a un pin de señal."},{"nombre":"Protoboard y cables jumper","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-protoboard-35f60aea.webp","paraQue":"Sostienen las piezas y reparten 3,3 V y tierra."}],"prueba":{"queDebePasar":["Al conectar el USB, la tapa se cierra y el LED está apagado.","Al acercar la mano a menos de 15 cm, la tapa se abre y el LED parpadea tres veces y queda encendido.","Tres segundos después la tapa se cierra sola y el LED se apaga.","Si no hay nada cerca, la tapa permanece cerrada."],"siNoFunciona":[{"revisa":"Prueba primero el sensor solo con la práctica 2. Si ahí marca 0 cm, Trig y Echo están cruzados o el sensor no tiene energía.","problema":"La tapa no se abre al acercar la mano"},{"revisa":"El sensor está viendo algo fijo: el borde del basurero, la mesa o la propia tapa. Muévelo o inclínalo, o baja DISTANCIA_APERTURA_CM a 10.","problema":"La tapa se abre sola, sin nadie cerca"},{"revisa":"El brazo no está empujando en el punto correcto. Acércalo a la bisagra y prueba con ANGULO_ABIERTO en 120.","problema":"El servo se mueve pero la tapa no sube"},{"revisa":"Intercambia los valores: ANGULO_CERRADO en 90 y ANGULO_ABIERTO en 0.","problema":"La tapa abre al revés"},{"revisa":"El servo pide más corriente de la que da el USB cuando levanta peso. Aligera la tapa y alimenta la placa con un cargador de celular de al menos 1 A.","problema":"El ESP32 se reinicia al abrir"},{"revisa":"Gira el LED y comprueba que la resistencia llega al pin GPIO25.","problema":"El LED no enciende"}]},"demuestra":{"reto":"Mejora tu basurero: cambia los ajustes para que abra a 25 cm y quede abierto cinco segundos. Después explica a un compañero qué número cambiaste y por qué.","preguntas":[{"correcta":1,"opciones":["El sensor, él solo","El ESP32, comparando la distancia medida con 15 cm","El servomotor"],"pregunta":"¿Qué pieza decide cuándo se abre la tapa?","explicacion":"El sensor solo mide. El ESP32 compara esa medida con el límite y da la orden al servo."},{"correcta":0,"opciones":["Para ignorar las lecturas fallidas del sensor","Para que abra más rápido","Para encender el LED"],"pregunta":"¿Para qué sirve la condición distancia > 0?","explicacion":"Cuando el eco no vuelve, la función devuelve -1. Sin esa condición, una lectura fallida abriría la tapa."},{"correcta":2,"opciones":["DISTANCIA_APERTURA_CM","ANGULO_ABIERTO","TIEMPO_ABIERTA_MS"],"pregunta":"Quieres que la tapa quede abierta más tiempo. ¿Qué cambias?","explicacion":"TIEMPO_ABIERTA_MS es la espera, en milisegundos, antes de cerrar. 5000 serían cinco segundos."}]}}$cp$::jsonb);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'SENSOR HC-SR04', 'VCC', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'SENSOR HC-SR04', 'Trig', 'GPIO22', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'SENSOR HC-SR04', 'Echo', 'GPIO23', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'SERVOMOTOR SG90', 'Señal', 'GPIO18', '5 V del USB solo en VCC', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'SERVOMOTOR SG90', 'VCC', 'VIN', '5 V del USB', 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'LED (tapa abierta)', 'Ánodo (+) via R330', 'GPIO25', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'LED (tapa abierta)', 'Cátodo (-)', 'GND', NULL, 9);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-basurero-inteligente'), 'arduino', $cp$/*
  Basurero inteligente con apertura automatica
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines)  En Arduino IDE: Placa "ESP32 Dev Module".

  Un sensor ultrasonico mide la distancia a la mano o al objeto. Si
  esta lo bastante cerca, el servomotor abre la tapa y un LED
  parpadea para confirmar (este kit no incluye buzzer: la
  confirmacion es visual).
*/

#include <ESP32Servo.h>  // instala la libreria ESP32Servo

const int TRIG = 22;
const int ECHO = 23;
const int SERVO_PIN = 18;
const int LED_TAPA = 25;

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
  Serial.begin(115200);
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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Contador de personas', 'copol-contador-personas', 'adicional', 'Cada vez que algo pasa frente al sensor ultrasónico, suma 1 al contador y lo muestra por el Monitor Serial; el LED parpadea como confirmación (sin buzzer).', ARRAY['Detectar un evento comparando la lectura actual con la anterior.', 'Usar el Monitor Serial para mostrar datos cuando no hay pantalla ni buzzer.']::text[], 2, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-contador-personas'), 'SENSOR HC-SR04', 'Trig', 'GPIO22', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-contador-personas'), 'SENSOR HC-SR04', 'Echo', 'GPIO23', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-contador-personas'), 'LED (contador)', 'Ánodo (+) via R330', 'GPIO25', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-contador-personas'), 'SENSOR HC-SR04', 'VCC', '3V3', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-contador-personas'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-contador-personas'), 'LED (contador)', 'Cátodo (-)', 'GND', NULL, 6);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-contador-personas'), 'arduino', $cp$/*
  Contador de personas
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  Mismo armado del basurero inteligente (sin el servo). Cada vez que
  algo pasa frente al sensor, suma 1 al contador, lo muestra por el
  Monitor Serial y el LED confirma (este kit no trae buzzer).
*/
const int TRIG = 22;
const int ECHO = 23;
const int LED_CONTADOR = 25;

const int DISTANCIA_DETECCION_CM = 20;
int contador = 0;
bool detectadoAntes = false;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_CONTADOR, OUTPUT);
  Serial.begin(115200);
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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Dispensador automático', 'copol-dispensador-automatico', 'adicional', 'Al acercar la mano, el servomotor abre la compuerta del dispensador un momento y el LED confirma (sin buzzer).', ARRAY['Controlar un servomotor como compuerta temporal (abre y cierra solo).', 'Evitar que el sensor dispare el mecanismo varias veces seguidas.']::text[], 3, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'SENSOR HC-SR04', 'Trig', 'GPIO22', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'SENSOR HC-SR04', 'Echo', 'GPIO23', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'SERVOMOTOR SG90', 'Señal', 'GPIO18', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'LED (confirmacion)', 'Ánodo (+) via R330', 'GPIO25', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'SENSOR HC-SR04', 'VCC', '3V3', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'SERVOMOTOR SG90', 'VCC', 'VIN', '5 V del USB', 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'LED (confirmacion)', 'Cátodo (-)', 'GND', NULL, 9);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-dispensador-automatico'), 'arduino', $cp$/*
  Dispensador automatico
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  Mismo armado del basurero inteligente. Al acercar la mano, el
  servomotor abre la compuerta un momento y el LED confirma (sin
  buzzer).
*/
#include <ESP32Servo.h>  // instala la libreria ESP32Servo

const int TRIG = 22;
const int ECHO = 23;
const int SERVO_PIN = 18;
const int LED_CONFIRMA = 25;

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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Puerta automática', 'copol-puerta-automatica', 'adicional', 'La puerta (servo) se abre cuando alguien se acerca y se mantiene abierta mientras siga cerca; un LED indica que está abierta.', ARRAY['Mantener un actuador en una posición mientras una condición siga siendo verdadera.', 'Sincronizar una salida digital (LED) con el estado de un servomotor.']::text[], 4, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'SENSOR HC-SR04', 'Trig', 'GPIO22', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'SENSOR HC-SR04', 'Echo', 'GPIO23', 'mismo que el principal', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'SERVOMOTOR SG90', 'Señal', 'GPIO18', 'mismo que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'LED (puerta abierta)', 'Ánodo (+) via R330', 'GPIO25', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'SENSOR HC-SR04', 'VCC', '3V3', NULL, 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'SERVOMOTOR SG90', 'VCC', 'VIN', '5 V del USB', 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'LED (puerta abierta)', 'Cátodo (-)', 'GND', NULL, 9);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-puerta-automatica'), 'arduino', $cp$/*
  Puerta automatica
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  Mismo armado del basurero inteligente. La puerta se abre cuando
  alguien se acerca y se mantiene abierta mientras siga cerca.
*/
#include <ESP32Servo.h>  // instala la libreria ESP32Servo

const int TRIG = 22;
const int ECHO = 23;
const int SERVO_PIN = 18;
const int LED_PUERTA_ABIERTA = 25;

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
$cp$, 1);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-septimo-egb', 'Alarma de proximidad (visual con LEDs)', 'copol-alarma-proximidad', 'adicional', 'Un LED parpadea más rápido mientras más cerca está un objeto del sensor (este kit no tiene buzzer: la alarma es 100% visual). El potenciómetro ajusta la sensibilidad y el pulsador enciende/apaga la alarma.', ARRAY['Convertir una distancia en un ritmo de parpadeo (entre más cerca, más rápido).', 'Encender y apagar una función con un pulsador que alterna un estado (toggle).']::text[], 5, NULL);
INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'SENSOR HC-SR04', 'Trig', 'GPIO22', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'SENSOR HC-SR04', 'Echo', 'GPIO23', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'LED (alarma)', 'Ánodo (+) via R330', 'GPIO25', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'POTENCIOMETRO (sensibilidad)', 'Terminal A', '3V3', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'POTENCIOMETRO (sensibilidad)', 'Wiper', 'GPIO34', 'solo entrada', 5),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'POTENCIOMETRO (sensibilidad)', 'Terminal B', 'GND', NULL, 6),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'PULSADOR (on/off)', 'Pin 1', 'GPIO27', 'INPUT_PULLUP', 7),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'SENSOR HC-SR04', 'VCC', '3V3', NULL, 8),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 9),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'LED (alarma)', 'Cátodo (-)', 'GND', NULL, 10),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'PULSADOR (on/off)', 'Pin 2', 'GND', NULL, 11);
INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-copol-septimo-egb' AND slug = 'copol-alarma-proximidad'), 'arduino', $cp$/*
  Alarma de proximidad (visual con LEDs)
  Kit 7mo EGB - ESP32 DevKit V1 (30 pines) - Proyecto adicional
  Un LED parpadea mas rapido mientras mas cerca esta un objeto del
  sensor (este kit no tiene buzzer: la alarma es 100% visual). El
  potenciometro ajusta la sensibilidad y el pulsador enciende/apaga
  la alarma.
*/
const int TRIG = 22;
const int ECHO = 23;
const int LED_ALARMA = 25;
const int POTENCIOMETRO = 34;
const int PULSADOR_ON_OFF = 27;

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
  int sensibilidadCm = map(analogRead(POTENCIOMETRO), 0, 4095, 10, 100);

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
$cp$, 1);

-- ===== kit-copol-inicial-1 =====
UPDATE kits SET alimentacion = 'El viento mueve el generador. Pila de botón CR2032 (3 V) para las lecciones de cinta de cobre.', advertencia_seguridad = 'Las pilas de botón CR2032 las cuenta, entrega y recoge el docente en cada clase: tragadas son peligrosas. El ventilador o el secador los maneja solo el docente.', notas = 'Primero las 4 lecciones de cinta de cobre y después el kit de madera. Las lecciones de madera siguen el instructivo de la caja.', visible = true WHERE id = 'kit-copol-inicial-1';
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  ('kit-copol-inicial-1', 'kit-madera-eolico', 1, 'Contenido según el instructivo de la caja', true),
  ('kit-copol-inicial-1', 'cinta-cobre', NULL, '40 cm', true),
  ('kit-copol-inicial-1', 'led-generico', 1, 'Verde o amarillo', true),
  ('kit-copol-inicial-1', 'pila-cr2032', 1, NULL, true),
  ('kit-copol-inicial-1', 'pinza-papel', 1, NULL, true),
  ('kit-copol-inicial-1', 'cartulina', 1, 'Con la luciérnaga', true);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-1', 'Enciende el LED con la pila', 'copol-luciernaga-led-y-pila', 'practica', 'Vas a encender una lucecita usando solo una pila y tus dedos.', ARRAY['Reconocer la pata larga del LED y el lado + de la pila.', 'Descubrir que la luz se enciende solo cuando las dos patas tocan la pila.']::text[], -7, $cp${"reto":{"texto":"Vas a encender una lucecita usando solo una pila y tus dedos. ¡Como magia!","paraQue":"Las luces de los juguetes y de los zapatos que brillan se encienden así: con una pila pequeña.","duracion":"15 minutos"},"pasos":[{"texto":"Busca la patita larga del LED. Esa es la que va con el lado + de la pila.","titulo":"Mira las patitas"},{"texto":"Pon la pila en medio de las dos patitas: la patita larga toca el lado liso con letras (+) y la corta toca el otro lado.","titulo":"Abraza la pila"},{"texto":"Aprieta las patitas contra la pila con tus dedos.","titulo":"Aprieta"}],"codigo":[],"piezas":[{"nombre":"LED verde o amarillo","cuidado":"La pata larga es el lado +. Si lo pones al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-amarillo-3917dbdf.webp","paraQue":"Es la lucecita. Tiene dos patitas: una larga y una corta."},{"nombre":"Pila de botón CR2032","cuidado":"La pila la entrega y la recoge tu profe. Nunca se lleva a la boca.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cr2032-9f5b8ba2.webp","paraQue":"Da la energía. Tiene dos caras: la lisa con letras es el lado + y la otra es el lado –."}],"prueba":{"queDebePasar":["Al apretar, la lucecita se enciende.","Al soltar, se apaga."],"siNoFunciona":[{"revisa":"Dale la vuelta a la pila o al LED. La pata larga del LED debe tocar el lado + de la pila (el liso, con letras).","problema":"La luz no enciende"}]},"demuestra":{"reto":"Enciende y apaga tu luz tres veces. Cuéntale a un amigo cuál patita es la larga.","preguntas":[{"correcta":0,"opciones":["La pila","El papel","El dedo"],"pregunta":"¿Qué le da energía a la luz?","explicacion":"La pila guarda la energía."},{"correcta":0,"opciones":["La luz se apaga","La luz brilla más","Nada"],"pregunta":"¿Qué pasa si sueltas las patitas?","explicacion":"La energía ya no puede pasar."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-1', 'Pega los caminos de cobre', 'copol-luciernaga-pistas-de-cobre', 'practica', 'Vas a pegar dos caminos brillantes de cobre en tu cartulina.', ARRAY['Seguir un trazo con cinta de cobre.', 'Entender que la energía viaja por un camino.']::text[], -6, $cp${"reto":{"texto":"Vas a pegar dos caminos brillantes de cobre en tu cartulina. Por ellos viajará la energía hasta la cola de la luciérnaga.","paraQue":"Los cables de tu casa son caminos así: llevan la energía desde lejos hasta cada foco.","duracion":"20 minutos"},"pasos":[{"texto":"Con ayuda de tu profe, pega la cinta de cobre sobre la línea marcada como +: va desde la cola de la luciérnaga hasta la esquina de la hoja.","titulo":"El camino +"},{"texto":"Pega otra cinta sobre la línea marcada como –: va desde la cola hasta el círculo donde se sentará la pila.","titulo":"El camino –"},{"texto":"Abre las patitas del LED y pégalas con cinta: la patita larga sobre el camino + y la corta sobre el camino –.","titulo":"Coloca la luz","consejo":"Los dos caminos no deben tocarse entre sí en ningún punto."}],"codigo":[],"piezas":[{"nombre":"Cinta de cobre","cuidado":"Pégala despacio y alísala con el dedo. Si se rompe, la energía no pasa.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cinta-de-cobre-3c1da25f.webp","paraQue":"Es un camino brillante por donde viaja la energía, como una carretera para la luz."},{"nombre":"Cartulina con la luciérnaga","paraQue":"Es la base de tu circuito. Tiene marcado por dónde van los caminos."},{"nombre":"LED verde o amarillo","cuidado":"La pata larga es el lado +. Si lo pones al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-amarillo-3917dbdf.webp","paraQue":"Es la luz del circuito."}],"prueba":{"queDebePasar":["Los dos caminos de cobre están completos, sin cortes.","Los caminos no se tocan entre sí.","El LED está en la cola, con una patita en cada camino."],"siNoFunciona":[{"revisa":"Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.","problema":"A veces enciende y a veces no"}]},"demuestra":{"reto":"Sigue con tu dedo el camino + de principio a fin sin levantarlo. Luego haz lo mismo con el camino –.","preguntas":[{"correcta":1,"opciones":["Para adornar","Para llevar la energía hasta la luz","Para pegar la hoja"],"pregunta":"¿Para qué sirve la cinta de cobre?","explicacion":"El cobre deja pasar la energía."},{"correcta":1,"opciones":["Sí","No"],"pregunta":"¿Pueden tocarse los dos caminos?","explicacion":"Si se tocan, la energía toma un atajo y no llega a la luz."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-1', 'El interruptor de papel', 'copol-luciernaga-interruptor-de-papel', 'practica', 'Vas a hacer un interruptor con la esquina de la hoja: al doblarla y apretar, la luz se enciende.', ARRAY['Abrir y cerrar un circuito doblando la hoja.']::text[], -5, $cp${"reto":{"texto":"Vas a hacer un interruptor con la esquina de la hoja: al doblarla y apretar, la luz se enciende.","paraQue":"Un interruptor abre y cierra el camino de la energía, igual que el de la pared de tu cuarto.","duracion":"15 minutos"},"pasos":[{"texto":"Pon la pila sobre el final del camino –, con el lado liso con letras (+) hacia arriba.","titulo":"Sienta la pila"},{"texto":"Dobla la esquina de la hoja por la línea punteada. El cuadrito de cobre de la esquina debe caer justo encima de la pila.","titulo":"Dobla la esquina"},{"texto":"Presiona la esquina con el dedo. Si quieres que la luz quede encendida, sujétala con la pinza.","titulo":"Aprieta"}],"codigo":[],"piezas":[{"nombre":"Pila de botón CR2032","cuidado":"La pila la entrega y la recoge tu profe. Nunca se lleva a la boca.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cr2032-9f5b8ba2.webp","paraQue":"Da la energía. Tiene dos caras: la lisa con letras es el lado + y la otra es el lado –."},{"nombre":"Pinza de papel","paraQue":"Aprieta la pila contra el cobre para que no se mueva."},{"nombre":"Tu cartulina con los caminos","paraQue":"Ya tiene el LED y las dos pistas de cobre."}],"prueba":{"queDebePasar":["Al apretar la esquina sobre la pila, la cola de la luciérnaga se enciende.","Al soltar, se apaga."],"siNoFunciona":[{"revisa":"Dale la vuelta a la pila o al LED. La pata larga del LED debe tocar el lado + de la pila (el liso, con letras).","problema":"La luz no enciende"},{"revisa":"Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.","problema":"A veces enciende y a veces no"},{"revisa":"Mueve la pila un poquito hasta que el cobre de la esquina la toque al doblar.","problema":"La esquina no alcanza la pila"}]},"demuestra":{"reto":"Enseña a un compañero cómo se enciende tu luciérnaga sin decirle nada: solo con gestos.","preguntas":[{"correcta":0,"opciones":["Abre y cierra el camino de la energía","Pinta la hoja","Guarda la pila"],"pregunta":"¿Qué hace el interruptor de papel?","explicacion":"Al doblar, el camino se cierra y la luz se enciende."},{"correcta":0,"opciones":["El liso con letras (+)","El otro lado (–)"],"pregunta":"¿Qué lado de la pila queda hacia arriba?","explicacion":"El cobre de la esquina debe tocar el lado +."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-1', 'La luciérnaga mágica', 'copol-la-luciernaga-magica', 'practica', 'Circuito de papel: la cola de la luciérnaga se enciende al doblar y presionar la esquina de la hoja.', ARRAY['Armar un circuito de papel completo con pila, camino e interruptor.', 'Cuidar las pilas de botón y devolverlas al docente.']::text[], -4, $cp${"reto":{"texto":"Vas a terminar tu luciérnaga mágica: la colorearás y jugarás a encender la noche apretando la esquina de la hoja.","fotoUrl":"/kits/circuitos/kit-1.webp","paraQue":"Las luciérnagas de verdad brillan para llamarse entre ellas en la oscuridad. La tuya brilla con una pila y un camino de cobre.","duracion":"30 minutos"},"pasos":[{"texto":"Mira que los dos caminos de cobre estén completos y que el LED siga bien pegado en la cola.","titulo":"Revisa tu circuito"},{"texto":"Pinta la luciérnaga, sus alas y el cielo de noche. No pintes encima del cobre.","titulo":"Colorea"},{"texto":"Con las luces del salón apagadas, dobla la esquina sobre la pila y presiona. ¡Tu luciérnaga brilla!","titulo":"Enciende la noche"}],"codigo":[],"piezas":[{"nombre":"LED verde o amarillo","cuidado":"La pata larga es el lado +. Si lo pones al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-amarillo-3917dbdf.webp","paraQue":"Es la cola que brilla."},{"nombre":"Cinta de cobre","cuidado":"Pégala despacio y alísala con el dedo. Si se rompe, la energía no pasa.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cinta-de-cobre-3c1da25f.webp","paraQue":"Es un camino brillante por donde viaja la energía, como una carretera para la luz."},{"nombre":"Pila de botón CR2032","cuidado":"La pila la entrega y la recoge tu profe. Nunca se lleva a la boca.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cr2032-9f5b8ba2.webp","paraQue":"Da la energía. Tiene dos caras: la lisa con letras es el lado + y la otra es el lado –."},{"nombre":"Pinza de papel","paraQue":"Aprieta la pila contra el cobre para que no se mueva."},{"nombre":"Cartulina y colores","paraQue":"Para darle vida a tu luciérnaga."}],"prueba":{"queDebePasar":["La cola se enciende cada vez que presionas la esquina.","Todas las luciérnagas del salón brillan juntas en la oscuridad."],"siNoFunciona":[{"revisa":"Dale la vuelta a la pila o al LED. La pata larga del LED debe tocar el lado + de la pila (el liso, con letras).","problema":"La luz no enciende"},{"revisa":"Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.","problema":"A veces enciende y a veces no"}]},"demuestra":{"reto":"Juega a \"encender la noche\": cuando tu profe diga \"¡noche!\", todos encienden su luciérnaga; cuando diga \"¡día!\", todos la apagan.","preguntas":[{"correcta":0,"opciones":["Pila, camino de cobre y LED","Agua, papel y lápiz","Solo la cartulina"],"pregunta":"¿Qué tres cosas necesita tu luciérnaga para brillar?","explicacion":"La pila da la energía, el cobre la lleva y el LED la convierte en luz."},{"correcta":0,"opciones":["A mi profe","Me la llevo a casa","La guardo en el bolsillo"],"pregunta":"¿A quién se le entrega la pila al terminar?","explicacion":"Las pilas de botón siempre las guarda el docente."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-1', 'Conoce las piezas del generador de viento', 'copol-eolico-conoce-las-piezas', 'practica', 'Antes de armar, los niños reconocen cada pieza de madera del generador de viento y dicen para qué creen que sirve.', ARRAY['Reconocer y nombrar las piezas del kit.', 'Separar las piezas por forma y tamaño.']::text[], -2, $cp${"reto":{"texto":"Vas a conocer las piezas de tu molino de viento. ¡Cada una tiene un trabajo!","paraQue":"Los molinos de viento de verdad usan el viento para hacer luz para las casas.","duracion":"20 minutos"},"piezas":[{"nombre":"Piezas de madera","paraQue":"Forman la torre y la base del molino.","cuidado":"Se sacan de la plancha con cuidado, empujando con el dedo. Si una pieza no sale, la ayuda el profe."},{"nombre":"Aspas (hélice)","paraQue":"Son los brazos que giran cuando sopla el viento.","cuidado":"Son delgadas: no se doblan ni se muerden."},{"nombre":"Motorcito","paraQue":"Cuando las aspas lo hacen girar, fabrica un poquito de electricidad."},{"nombre":"Lucecita (LED)","paraQue":"Se enciende con la electricidad que fabrica el motorcito."}],"pasos":[{"titulo":"Abre la caja","texto":"Saca todas las piezas y ponlas sobre la mesa, sin que se monten unas sobre otras."},{"titulo":"Busca las que giran","texto":"Encuentra las aspas. Hazlas girar con el dedo, como un ventilador."},{"titulo":"Busca la luz","texto":"Encuentra la lucecita y el motorcito con sus dos cablecitos."},{"titulo":"Ordena","texto":"Pon juntas las piezas grandes y juntas las pequeñas. Cuenta cuántas hay de cada grupo.","consejo":"El docente compara con el dibujo del instructivo de la caja que no falte ninguna pieza."}],"codigo":[],"prueba":{"queDebePasar":["Todas las piezas están sobre la mesa, ordenadas.","Cada niño señala las aspas, el motorcito y la lucecita."],"siNoFunciona":[{"problema":"Falta una pieza","revisa":"Revisa dentro de la caja y debajo de la plancha de madera. Si no aparece, avisa al docente."}]},"demuestra":{"reto":"Muéstrale a un amigo cuál pieza gira con el viento.","preguntas":[{"pregunta":"¿Qué pieza gira con el viento?","opciones":["Las aspas","La base","La caja"],"correcta":0,"explicacion":"Las aspas son como los brazos de un ventilador."},{"pregunta":"¿Qué se enciende al final?","opciones":["La madera","La lucecita","El cable"],"correcta":1,"explicacion":"La lucecita se enciende con la electricidad."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-1', 'Arma la torre y las aspas', 'copol-eolico-arma-la-torre', 'practica', 'Los niños arman la base y la torre de madera, y colocan las aspas en el eje del motorcito, con ayuda del docente.', ARRAY['Encajar piezas de madera siguiendo un dibujo.', 'Trabajar con cuidado y por turnos.']::text[], -1, $cp${"reto":{"texto":"Vas a armar la torre de tu molino y a ponerle sus aspas.","paraQue":"Una torre alta atrapa mejor el viento.","duracion":"30 minutos"},"piezas":[{"nombre":"Base y torre de madera","paraQue":"Sostienen el molino de pie."},{"nombre":"Motorcito","paraQue":"Va arriba de la torre. En su puntita (el eje) se ponen las aspas.","cuidado":"Los cablecitos no se jalan."},{"nombre":"Aspas","paraQue":"Se encajan en la puntita del motorcito."}],"pasos":[{"titulo":"Arma la base","texto":"Encaja las piezas de la base como muestra el dibujo del instructivo. Deben quedar firmes sobre la mesa."},{"titulo":"Levanta la torre","texto":"Encaja la torre en la base. Empuja despacio hasta que no se mueva.","consejo":"Si una pieza queda floja, el docente pone una gotita de goma blanca."},{"titulo":"Pon el motorcito arriba","texto":"Coloca el motorcito en su lugar, en lo alto de la torre, con la puntita hacia afuera."},{"titulo":"Pon las aspas","texto":"Empuja las aspas en la puntita del motorcito hasta que queden apretadas."},{"titulo":"Prueba que giren","texto":"Dale un empujoncito a las aspas con el dedo. Deben girar libres, sin rozar la torre."}],"codigo":[],"prueba":{"queDebePasar":["El molino se queda de pie solo.","Las aspas giran al empujarlas con el dedo."],"siNoFunciona":[{"problema":"El molino se cae","revisa":"La base no está bien encajada. Aprieta cada unión otra vez."},{"problema":"Las aspas rozan la torre","revisa":"Sácalas un poquito hacia afuera, sin sacarlas del todo."}]},"demuestra":{"reto":"Sopla suave y cuenta cuántas vueltas dan las aspas.","preguntas":[{"pregunta":"¿Dónde se ponen las aspas?","opciones":["En la base","En el suelo","En la puntita del motorcito"],"correcta":2,"explicacion":"Así, cuando las aspas giran, el motorcito también gira."},{"pregunta":"¿Para qué sirve la base?","opciones":["Para que el molino no se caiga","Para que gire","Para que brille"],"correcta":0,"explicacion":"La base lo mantiene de pie."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-1', 'El generador de viento enciende una luz', 'copol-el-generador-eolico', 'principal', 'Con el molino armado, los niños conectan la lucecita y descubren que el viento puede encender una luz.', ARRAY['Descubrir que el viento puede producir electricidad.', 'Comparar: viento suave, viento fuerte y sin viento.']::text[], 1, $cp${"reto":{"texto":"¡Vas a encender una luz usando solo viento!","paraQue":"Así se hace electricidad limpia: sin humo y sin gastar pilas.","duracion":"30 minutos"},"piezas":[{"nombre":"Molino armado","paraQue":"Atrapa el viento con sus aspas."},{"nombre":"Lucecita (LED)","paraQue":"Se enciende cuando el motorcito gira rápido.","cuidado":"Tiene una patita larga y una corta. Si no enciende, se le da la vuelta."},{"nombre":"Viento","paraQue":"Un ventilador, un secador en frío o soplar fuerte.","cuidado":"El ventilador y el secador solo los maneja el docente."}],"pasos":[{"titulo":"Conecta la lucecita","texto":"Une los dos cablecitos del motorcito con las dos patitas de la lucecita, como muestra el instructivo.","consejo":"En muchos kits la lucecita ya viene conectada: en ese caso solo se revisa que no esté suelta."},{"titulo":"Sopla suave","texto":"Sopla despacito hacia las aspas. Mira qué pasa con la luz."},{"titulo":"Dale viento fuerte","texto":"El docente acerca el ventilador. Mira las aspas y mira la luz."},{"titulo":"Quita el viento","texto":"El docente apaga el ventilador. Mira qué pasa con la luz cuando las aspas se detienen."}],"codigo":[],"prueba":{"queDebePasar":["Con viento fuerte, las aspas giran rápido y la lucecita se enciende.","Sin viento, la lucecita se apaga."],"siNoFunciona":[{"problema":"Las aspas giran pero la luz no enciende","revisa":"Dale la vuelta a la lucecita (cambia las patitas de cable). Si sigue apagada, acerca más el ventilador: necesita girar rápido."},{"problema":"Las aspas no giran","revisa":"Pon el molino de frente al viento y revisa que las aspas no rocen la torre."}]},"demuestra":{"reto":"Dibuja tu molino con la luz encendida y cuéntale a tu familia de dónde salió la electricidad.","preguntas":[{"pregunta":"¿Qué enciende la luz del molino?","opciones":["Una pila","El viento","El sol"],"correcta":1,"explicacion":"El viento hace girar las aspas y el motorcito fabrica la electricidad."},{"pregunta":"¿Qué pasa cuando no hay viento?","opciones":["La luz brilla más","El molino se rompe","La luz se apaga"],"correcta":2,"explicacion":"Sin viento las aspas no giran y no hay electricidad."}]}}$cp$::jsonb);

-- ===== kit-copol-inicial-2 =====
UPDATE kits SET alimentacion = 'Panel solar (luz directa del sol). Pila de botón CR2032 (3 V) para las lecciones de cinta de cobre.', advertencia_seguridad = 'Las pilas de botón CR2032 las cuenta, entrega y recoge el docente en cada clase: tragadas son peligrosas. Al patio con gorra; nunca se mira directo al sol.', notas = 'Primero las 4 lecciones de cinta de cobre y después el kit de madera. Las lecciones de madera siguen el instructivo de la caja.', visible = true WHERE id = 'kit-copol-inicial-2';
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  ('kit-copol-inicial-2', 'kit-madera-carro-solar', 1, 'Contenido según el instructivo de la caja', true),
  ('kit-copol-inicial-2', 'cinta-cobre', NULL, '60 cm', true),
  ('kit-copol-inicial-2', 'led-rojo', 2, NULL, true),
  ('kit-copol-inicial-2', 'pila-cr2032', 1, NULL, true),
  ('kit-copol-inicial-2', 'pinza-papel', 1, NULL, true),
  ('kit-copol-inicial-2', 'cartulina', 1, NULL, true);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-2', 'Arma el primer ojo', 'copol-monstruo-primer-ojo', 'practica', 'Vas a hacer brillar el primer ojo de tu monstruo, con un camino de cobre que sube y otro que baja.', ARRAY['Armar un circuito de papel con un LED.', 'Distinguir el camino + del camino –.']::text[], -7, $cp${"reto":{"texto":"Vas a hacer brillar el primer ojo de tu monstruo, con un camino de cobre que sube y otro que baja.","paraQue":"Las luces de un carro de juguete o de una linterna funcionan igual: una pila, un camino y una luz.","duracion":"25 minutos"},"pasos":[{"texto":"Con ayuda de tu profe, pega una cinta de cobre desde el lugar del ojo, hacia abajo, hasta el círculo de la pila.","titulo":"El camino –"},{"texto":"Pega otra cinta desde el lugar del ojo, hacia arriba, y llévala por el borde hasta la esquina de la hoja.","titulo":"El camino +"},{"texto":"Abre las patitas del LED: la larga va sobre el camino + (el de arriba) y la corta sobre el camino – (el de abajo). Pégalas con cinta.","titulo":"Pega el ojo"},{"texto":"Pon la pila en su círculo con el lado + hacia arriba, dobla la esquina encima y presiona.","titulo":"Prueba"}],"codigo":[],"piezas":[{"nombre":"LED rojo","cuidado":"La pata larga es el lado +. Si lo pones al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-rojo-feade231.webp","paraQue":"Es un ojo del monstruo."},{"nombre":"Cinta de cobre","cuidado":"Pégala despacio y alísala con el dedo. Si se rompe, la energía no pasa.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cinta-de-cobre-3c1da25f.webp","paraQue":"Es un camino brillante por donde viaja la energía, como una carretera para la luz."},{"nombre":"Pila de botón CR2032","cuidado":"La pila la entrega y la recoge tu profe. Nunca se lleva a la boca.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cr2032-9f5b8ba2.webp","paraQue":"Da la energía. Tiene dos caras: la lisa con letras es el lado + y la otra es el lado –."},{"nombre":"Cartulina","paraQue":"Es la base donde dibujarás tu monstruo."}],"prueba":{"queDebePasar":["Al presionar la esquina sobre la pila, el ojo se enciende.","Al soltar, se apaga."],"siNoFunciona":[{"revisa":"Dale la vuelta a la pila o al LED. La pata larga del LED debe tocar el lado + de la pila (el liso, con letras).","problema":"La luz no enciende"},{"revisa":"Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.","problema":"A veces enciende y a veces no"}]},"demuestra":{"reto":"Sigue con el dedo todo el recorrido: desde la pila, por el camino –, pasando por el ojo, y de regreso por el camino +.","preguntas":[{"correcta":1,"opciones":["Uno","Dos","Ninguno"],"pregunta":"¿Cuántos caminos de cobre necesita un ojo?","explicacion":"Uno lleva la energía y otro la trae de vuelta."},{"correcta":0,"opciones":["La larga","La corta"],"pregunta":"¿Qué patita va en el camino +?","explicacion":"La patita larga siempre va con el +."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-2', 'Un camino arriba y otro abajo', 'copol-monstruo-dos-pistas', 'practica', 'Vas a alargar los dos caminos de cobre para que pasen por arriba y por abajo de los dos ojos del monstruo.', ARRAY['Prolongar dos pistas de cobre sin que se toquen.']::text[], -6, $cp${"reto":{"texto":"Vas a alargar los dos caminos de cobre para que pasen por arriba y por abajo de los dos ojos del monstruo.","paraQue":"En tu casa un mismo par de cables pasa por varios focos. Así, una sola fuente de energía alcanza para muchas luces.","duracion":"20 minutos"},"pasos":[{"texto":"Pega más cinta de cobre para que el camino + pase también por encima del lugar del segundo ojo.","titulo":"Alarga el camino de arriba"},{"texto":"Pega más cinta para que el camino – pase también por debajo del lugar del segundo ojo.","titulo":"Alarga el camino de abajo","consejo":"Donde una cinta se une con otra, monta un pedacito encima y aprieta fuerte con el dedo."},{"texto":"Mira que el camino de arriba y el de abajo no se toquen entre sí.","titulo":"Revisa"}],"codigo":[],"piezas":[{"nombre":"Cinta de cobre","cuidado":"Pégala despacio y alísala con el dedo. Si se rompe, la energía no pasa.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cinta-de-cobre-3c1da25f.webp","paraQue":"Es un camino brillante por donde viaja la energía, como una carretera para la luz."},{"nombre":"Tu cartulina con el primer ojo","paraQue":"Ya tiene un LED encendiendo."}],"prueba":{"queDebePasar":["El primer ojo sigue encendiendo igual que antes.","Los dos caminos pasan por el lugar del segundo ojo, uno arriba y otro abajo."],"siNoFunciona":[{"revisa":"Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.","problema":"A veces enciende y a veces no"},{"revisa":"Alguna unión de cinta quedó floja, o los dos caminos se están tocando.","problema":"El primer ojo dejó de encender"}]},"demuestra":{"reto":"Señala dónde pondrías un tercer ojo para que también se encienda. ¿Qué caminos tendría que tocar?","preguntas":[{"correcta":0,"opciones":["Por arriba de los ojos","Por abajo de los ojos"],"pregunta":"¿Por dónde pasa el camino +?","explicacion":"El + va por arriba y el – por abajo."},{"correcta":1,"opciones":["Los ojos brillan más","La energía toma un atajo y los ojos no encienden"],"pregunta":"¿Qué pasa si los dos caminos se tocan?","explicacion":"Por eso los caminos nunca se cruzan."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-2', 'Conecta el segundo ojo', 'copol-monstruo-segundo-ojo', 'practica', 'Vas a conectar el segundo ojo a los mismos caminos, para que los dos se enciendan juntos con una sola pila.', ARRAY['Conectar dos LED a las mismas pistas (en paralelo).']::text[], -5, $cp${"reto":{"texto":"Vas a conectar el segundo ojo a los mismos caminos, para que los dos se enciendan juntos con una sola pila.","paraQue":"Las luces de un árbol de Navidad o los focos de un pasillo se conectan así: todas al mismo par de cables.","duracion":"20 minutos"},"pasos":[{"texto":"Abre las patitas del segundo LED: la larga sobre el camino de arriba (+) y la corta sobre el camino de abajo (–). Pégalas con cinta.","titulo":"Pega el segundo ojo"},{"texto":"Compara: los dos LED deben estar puestos igual, con la patita larga hacia arriba.","titulo":"Fíjate en el primero"},{"texto":"Pon la pila, dobla la esquina encima y presiona.","titulo":"Enciende"}],"codigo":[],"piezas":[{"nombre":"LED rojo","cuidado":"La pata larga es el lado +. Si lo pones al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-rojo-feade231.webp","paraQue":"Es el segundo ojo."},{"nombre":"Pila de botón CR2032","cuidado":"La pila la entrega y la recoge tu profe. Nunca se lleva a la boca.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cr2032-9f5b8ba2.webp","paraQue":"Da la energía. Tiene dos caras: la lisa con letras es el lado + y la otra es el lado –."},{"nombre":"Pinza de papel","paraQue":"Aprieta la pila contra el cobre para que no se mueva."}],"prueba":{"queDebePasar":["Los dos ojos se encienden al mismo tiempo.","Al soltar la esquina, los dos se apagan."],"siNoFunciona":[{"revisa":"El ojo apagado está al revés: despégalo y cambia las patitas de lugar.","problema":"Solo enciende un ojo"},{"revisa":"Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.","problema":"A veces enciende y a veces no"},{"revisa":"Dale la vuelta a la pila o al LED. La pata larga del LED debe tocar el lado + de la pila (el liso, con letras).","problema":"La luz no enciende"}]},"demuestra":{"reto":"Tapa un ojo con el dedo. ¿El otro sigue encendido? Cuéntale a tu profe lo que pasó.","preguntas":[{"correcta":0,"opciones":["Una sola","Dos","Tres"],"pregunta":"¿Cuántas pilas usan los dos ojos?","explicacion":"Los dos ojos comparten la misma pila."},{"correcta":0,"opciones":["Iguales: la larga hacia el camino +","Uno al revés del otro"],"pregunta":"¿Cómo deben ir las patitas de los dos LED?","explicacion":"Si uno está al revés, ese no enciende."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-2', 'El monstruo de ojos brillantes', 'copol-el-monstruo-de-ojos-brillantes', 'practica', 'Circuito de papel con dos ojos LED que se encienden juntos con una sola pila.', ARRAY['Encender dos luces con una sola pila.', 'Crear y presentar un personaje propio.']::text[], -4, $cp${"reto":{"texto":"Vas a terminar tu monstruo de ojos brillantes: lo dibujarás alrededor de las luces y le pondrás nombre.","fotoUrl":"/kits/circuitos/kit-2.webp","paraQue":"Los juguetes con luces en los ojos tienen dentro un circuito como el tuyo, escondido bajo el dibujo.","duracion":"30 minutos"},"pasos":[{"texto":"Presiona la esquina y comprueba que los dos ojos encienden.","titulo":"Revisa los ojos"},{"texto":"Dibuja la cara alrededor de los ojos: cuernos, boca, dientes, pelos. No pintes encima del cobre.","titulo":"Dibuja tu monstruo"},{"texto":"Escribe (o dicta a tu profe) el nombre de tu monstruo en la hoja.","titulo":"Ponle nombre"},{"texto":"Con el salón a oscuras, enciende los ojos y presenta tu monstruo a tus compañeros.","titulo":"Preséntalo"}],"codigo":[],"piezas":[{"nombre":"LED rojo (2)","cuidado":"La pata larga es el lado +. Si lo pones al revés no se daña, pero no enciende.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-led-rojo-feade231.webp","paraQue":"Son los dos ojos."},{"nombre":"Cinta de cobre","cuidado":"Pégala despacio y alísala con el dedo. Si se rompe, la energía no pasa.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cinta-de-cobre-3c1da25f.webp","paraQue":"Es un camino brillante por donde viaja la energía, como una carretera para la luz."},{"nombre":"Pila de botón CR2032","cuidado":"La pila la entrega y la recoge tu profe. Nunca se lleva a la boca.","fotoUrl":"https://jfsyvcslzgjrvsoqleiz.supabase.co/storage/v1/object/public/kit-fotos/mat-cr2032-9f5b8ba2.webp","paraQue":"Da la energía. Tiene dos caras: la lisa con letras es el lado + y la otra es el lado –."},{"nombre":"Pinza de papel","paraQue":"Aprieta la pila contra el cobre para que no se mueva."},{"nombre":"Cartulina y colores","paraQue":"Para dibujar tu monstruo."}],"prueba":{"queDebePasar":["Los dos ojos brillan al presionar la esquina.","El dibujo no tapa los caminos de cobre."],"siNoFunciona":[{"revisa":"El ojo apagado está al revés o una de sus patitas se despegó del cobre.","problema":"Solo enciende un ojo"},{"revisa":"Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.","problema":"A veces enciende y a veces no"},{"revisa":"Dale la vuelta a la pila o al LED. La pata larga del LED debe tocar el lado + de la pila (el liso, con letras).","problema":"La luz no enciende"}]},"demuestra":{"reto":"Inventa qué significa cuando tu monstruo enciende los ojos: ¿está contento, tiene hambre, saluda? Cuéntalo al grupo.","preguntas":[{"correcta":0,"opciones":["Porque están conectados a los mismos dos caminos","Porque son rojos","Porque la hoja es grande"],"pregunta":"¿Por qué los dos ojos se encienden juntos?","explicacion":"Comparten el camino + y el camino –."},{"correcta":0,"opciones":["Se la entrego a mi profe","La guardo en mi mochila"],"pregunta":"¿Qué haces con la pila al terminar?","explicacion":"Las pilas de botón siempre las guarda el docente."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-2', 'Conoce las piezas del carro solar', 'copol-solar-conoce-las-piezas', 'practica', 'Los niños reconocen las piezas del carro solar: el panel, el motorcito, las ruedas y el cuerpo de madera.', ARRAY['Reconocer y nombrar las piezas del kit.', 'Descubrir que el panel solar «come» luz.']::text[], -2, $cp${"reto":{"texto":"Vas a conocer las piezas de un carro que camina con la luz del sol.","paraQue":"Hay casas y carros de verdad que usan paneles solares para tener electricidad.","duracion":"20 minutos"},"piezas":[{"nombre":"Panel solar","paraQue":"Es la placa oscura y brillante. Cuando le da la luz, fabrica electricidad.","cuidado":"No se raya ni se dobla. Se agarra por los bordes."},{"nombre":"Motorcito","paraQue":"Hace girar las ruedas.","cuidado":"Los cablecitos no se jalan."},{"nombre":"Ruedas y ejes","paraQue":"Los ejes son los palitos que atraviesan el carro; en sus puntas van las ruedas."},{"nombre":"Cuerpo de madera","paraQue":"Es el carro: sostiene todo lo demás."}],"pasos":[{"titulo":"Abre la caja","texto":"Saca todas las piezas y ponlas sobre la mesa."},{"titulo":"Busca el panel","texto":"Encuentra la placa oscura y brillante. Ese es el panel solar."},{"titulo":"Cuenta las ruedas","texto":"Cuenta cuántas ruedas tiene tu carro."},{"titulo":"Ordena","texto":"Pon las piezas de madera a un lado y las demás al otro.","consejo":"El docente compara con el dibujo del instructivo que no falte ninguna pieza."}],"codigo":[],"prueba":{"queDebePasar":["Todas las piezas están sobre la mesa, ordenadas.","Cada niño señala el panel solar, el motorcito y las ruedas."],"siNoFunciona":[{"problema":"Falta una pieza","revisa":"Revisa dentro de la caja y debajo de la plancha de madera. Si no aparece, avisa al docente."}]},"demuestra":{"reto":"Muéstrale a un amigo cuál pieza necesita luz para trabajar.","preguntas":[{"pregunta":"¿Qué pieza necesita luz?","opciones":["El panel solar","La rueda","La madera"],"correcta":0,"explicacion":"El panel convierte la luz en electricidad."},{"pregunta":"¿Qué pieza hace girar las ruedas?","opciones":["El panel","El motorcito","La caja"],"correcta":1,"explicacion":"El motorcito gira cuando recibe electricidad."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-2', 'Arma el carro', 'copol-solar-arma-el-carro', 'practica', 'Los niños arman el cuerpo de madera, colocan los ejes y las ruedas, y ponen el motorcito y el panel en su lugar.', ARRAY['Encajar piezas de madera siguiendo un dibujo.', 'Comprobar que las ruedas giran libres.']::text[], -1, $cp${"reto":{"texto":"Vas a armar tu carro: su cuerpo, sus ruedas y su panel.","paraQue":"Un carro bien armado rueda derecho y no se traba.","duracion":"35 minutos"},"piezas":[{"nombre":"Cuerpo de madera","paraQue":"Sostiene las ruedas, el motorcito y el panel."},{"nombre":"Ejes y ruedas","paraQue":"Hacen que el carro ruede."},{"nombre":"Motorcito con su engranaje o polea","paraQue":"Mueve las ruedas de atrás."},{"nombre":"Panel solar","paraQue":"Va arriba, mirando al cielo."}],"pasos":[{"titulo":"Arma el cuerpo","texto":"Encaja las piezas de madera del carro como muestra el dibujo del instructivo."},{"titulo":"Pon los ejes y las ruedas","texto":"Pasa cada palito (eje) por sus agujeros y empuja una rueda en cada punta.","consejo":"Las ruedas no deben apretar el cuerpo del carro: deja un espacio del ancho de una uña."},{"titulo":"Coloca el motorcito","texto":"Pon el motorcito en su lugar para que mueva las ruedas de atrás, como en el dibujo."},{"titulo":"Coloca el panel","texto":"Pon el panel solar arriba del carro, con la cara oscura mirando hacia el cielo."},{"titulo":"Une los cablecitos","texto":"El docente une los dos cablecitos del panel con los dos del motorcito, como indica el instructivo."},{"titulo":"Rueda de prueba","texto":"Empuja el carro con la mano sobre la mesa. Debe rodar derecho y sin trabarse."}],"codigo":[],"prueba":{"queDebePasar":["Al empujarlo con la mano, el carro rueda derecho.","Ninguna rueda roza el cuerpo del carro."],"siNoFunciona":[{"problema":"El carro se va de lado","revisa":"Un eje está chueco o una rueda está más metida que la otra. Empareja las ruedas."},{"problema":"Una rueda no gira","revisa":"Está apretando el cuerpo del carro. Sepárala un poquito."}]},"demuestra":{"reto":"Haz rodar tu carro hasta un amigo empujándolo una sola vez.","preguntas":[{"pregunta":"¿Hacia dónde mira el panel?","opciones":["Hacia el piso","Hacia atrás","Hacia el cielo"],"correcta":2,"explicacion":"Así le llega la luz."},{"pregunta":"¿Qué pasa si una rueda aprieta el carro?","opciones":["El carro se traba","El carro vuela","Nada"],"correcta":0,"explicacion":"Las ruedas necesitan espacio para girar."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-inicial-2', 'El carro solar corre con el sol', 'copol-el-carro-solar', 'principal', 'Los niños llevan el carro al sol y descubren que se mueve solo; comparan sol, sombra y la mano tapando el panel.', ARRAY['Descubrir que la luz del sol puede mover un carro.', 'Comparar: sol, sombra y panel tapado.']::text[], 1, $cp${"reto":{"texto":"¡Vas a hacer caminar un carro usando solo la luz del sol!","paraQue":"El sol nos da energía gratis y limpia todos los días.","duracion":"30 minutos"},"piezas":[{"nombre":"Carro solar armado","paraQue":"Corre cuando su panel recibe luz fuerte."},{"nombre":"Sol","paraQue":"Es quien da la energía.","cuidado":"Se sale al patio con gorra. Nunca se mira directo al sol."}],"pasos":[{"titulo":"Sal al sol","texto":"Lleva tu carro al patio, a un piso liso. Ponlo en el suelo con el panel mirando al sol."},{"titulo":"Suéltalo","texto":"Suelta el carro y mira cómo empieza a caminar solo."},{"titulo":"Tapa el panel","texto":"Pon tu mano sobre el panel, sin tocarlo. Mira qué pasa con el carro."},{"titulo":"Llévalo a la sombra","texto":"Pon el carro en la sombra y mira si camina.","consejo":"En un día nublado se puede usar una lámpara fuerte muy cerca del panel; la maneja el docente."}],"codigo":[],"prueba":{"queDebePasar":["Al sol, el carro camina solo.","Al tapar el panel o en la sombra, el carro se detiene."],"siNoFunciona":[{"problema":"El carro no se mueve al sol","revisa":"Levántalo: si las ruedas giran en el aire, el piso es muy áspero; prueba en un piso liso. Si no giran, el docente revisa que los cablecitos estén bien unidos."},{"problema":"El carro va hacia atrás","revisa":"El docente intercambia los dos cablecitos del motorcito."}]},"demuestra":{"reto":"Haz una carrera: ¿qué carro llega más lejos al sol?","preguntas":[{"pregunta":"¿Qué le da energía al carro?","opciones":["Una pila","El sol","El viento"],"correcta":1,"explicacion":"El panel convierte la luz del sol en electricidad."},{"pregunta":"¿Qué pasa si tapas el panel?","opciones":["El carro corre más","Se enciende una luz","El carro se detiene"],"correcta":2,"explicacion":"Sin luz, el panel no fabrica electricidad."}]}}$cp$::jsonb);

-- ===== kit-copol-cuarto-egb =====
UPDATE kits SET alimentacion = 'No usa electricidad: funciona con el peso de la moneda.', advertencia_seguridad = 'Las piezas pequeñas se guardan en la caja. La goma y la lija se usan con supervisión.', notas = 'Las lecciones siguen el instructivo de la caja para el orden exacto de las piezas.', visible = true WHERE id = 'kit-copol-cuarto-egb';
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  ('kit-copol-cuarto-egb', 'kit-madera-tragamonedas', 1, 'Contenido según el instructivo de la caja', true);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-cuarto-egb', 'Las piezas y el plano', 'copol-tragamonedas-piezas-y-plano', 'practica', 'Antes de armar, se revisa que el kit esté completo y se lee el plano: qué pieza va con cuál y en qué orden.', ARRAY['Leer un plano de armado e identificar cada pieza.', 'Organizar el puesto de trabajo antes de construir.']::text[], -3, $cp${"reto":{"texto":"Vas a preparar todo para construir tu tragamonedas: revisar las piezas y entender el plano.","paraQue":"En cualquier taller, primero se revisa el material y el plano; después se arma. Así no sobran ni faltan piezas.","duracion":"30 minutos"},"piezas":[{"nombre":"Planchas de madera cortadas","paraQue":"De ellas salen las paredes, la tapa y las piezas del mecanismo.","cuidado":"Saca cada pieza empujando desde atrás. Si un borde quedó áspero, líjalo suave."},{"nombre":"Piezas del mecanismo","paraQue":"Son las que se mueven cuando entra la moneda: palanca, rampa, ejes o engranajes, según tu kit."},{"nombre":"Tornillos, ligas o pasadores","paraQue":"Unen las piezas que giran o que deben quedar firmes.","cuidado":"Son pequeños: guárdalos en la tapa de la caja para no perderlos."},{"nombre":"Instructivo (plano)","paraQue":"Muestra el orden del armado, paso por paso."}],"pasos":[{"titulo":"Saca y separa","texto":"Saca las piezas de las planchas y ponlas sobre la mesa. Separa las grandes (paredes y tapas) de las pequeñas (mecanismo)."},{"titulo":"Cuenta contra el plano","texto":"Compara tus piezas con la lista o el dibujo del instructivo. Marca con un visto cada pieza que encuentres."},{"titulo":"Numera","texto":"Si las piezas no traen número, escríbelo suave con lápiz en una cara que quede hacia adentro."},{"titulo":"Lee el recorrido de la moneda","texto":"En el plano, sigue con el dedo el camino de la moneda: por dónde entra, qué pieza empuja y dónde cae.","consejo":"Explícaselo a tu compañero con tus palabras: si puedes explicarlo, lo entendiste."}],"codigo":[],"prueba":{"queDebePasar":["Todas las piezas del plano están sobre la mesa y marcadas.","Puedes señalar en el plano por dónde entra la moneda y qué pieza mueve."],"siNoFunciona":[{"problema":"Falta una pieza","revisa":"Revisa los sobrantes de la plancha: a veces una pieza pequeña queda pegada. Si no aparece, avisa al docente."},{"problema":"No entiendo el plano","revisa":"Busca primero las piezas más grandes en el dibujo y úsalas como guía para ubicar las demás."}]},"demuestra":{"reto":"Dibuja en tu cuaderno el camino que seguirá la moneda dentro de la máquina.","preguntas":[{"pregunta":"¿Por qué se revisan las piezas antes de armar?","opciones":["Para saber si el kit está completo y no parar a medio trabajo","Para que la madera se seque","No hace falta revisarlas"],"correcta":0,"explicacion":"Si falta una pieza, es mejor saberlo antes de empezar."},{"pregunta":"¿Qué muestra el plano?","opciones":["El precio del kit","El orden y la posición de cada pieza","El color de la pintura"],"correcta":1,"explicacion":"El plano es la guía del armado."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-cuarto-egb', 'Arma la caja', 'copol-tragamonedas-arma-la-caja', 'practica', 'Se arma el cuerpo de la máquina: base, paredes y la pieza con la ranura para la moneda. Todavía sin la tapa, para poder trabajar adentro.', ARRAY['Unir piezas por encastre formando una estructura firme.', 'Comprobar escuadra y firmeza antes de seguir.']::text[], -2, $cp${"reto":{"texto":"Vas a levantar el cuerpo de tu tragamonedas: la caja donde vivirá el mecanismo.","paraQue":"Toda máquina necesita un cuerpo firme: si la caja se tuerce, las piezas de adentro se traban.","duracion":"40 minutos"},"piezas":[{"nombre":"Base y paredes","paraQue":"Forman la caja."},{"nombre":"Pieza con la ranura","paraQue":"Por la ranura entra la moneda.","cuidado":"La ranura debe quedar en la posición que indica el plano: de eso depende que la moneda caiga donde debe."},{"nombre":"Goma blanca","paraQue":"Fija las uniones que quedan flojas.","cuidado":"Solo una gota. No pegues todavía la tapa ni la pared que el plano deja para el final."}],"pasos":[{"titulo":"Prueba en seco","texto":"Encaja la base y las paredes sin goma, siguiendo el plano. Comprueba que todas las pestañas entran."},{"titulo":"Revisa la ranura","texto":"Coloca la pieza de la ranura y deja caer una moneda: debe pasar sin trabarse.","consejo":"Si roza, lija apenas los bordes de la ranura."},{"titulo":"Fija las uniones","texto":"Desarma una unión a la vez, pon una gota de goma y vuelve a encajar. Limpia lo que sobre."},{"titulo":"Deja abierta la caja","texto":"No pongas la tapa ni la pared de atrás: por ahí vas a meter el mecanismo en la siguiente clase."},{"titulo":"Deja secar","texto":"Apoya la caja sobre la mesa, derecha, y no la muevas hasta el final de la clase."}],"codigo":[],"prueba":{"queDebePasar":["La caja se queda derecha y no se tambalea.","Una moneda pasa por la ranura sin trabarse."],"siNoFunciona":[{"problema":"Una pared queda torcida","revisa":"La pestaña no entró hasta el fondo. Sácala y vuelve a encajar antes de que seque la goma."},{"problema":"La moneda se traba en la ranura","revisa":"Lija suave los bordes de la ranura y prueba otra vez."}]},"demuestra":{"reto":"Prueba la ranura con tres monedas de distinto tamaño. ¿Cuáles pasan?","preguntas":[{"pregunta":"¿Por qué se arma primero sin goma?","opciones":["Para gastar menos goma","Porque la goma mancha","Para comprobar que todo encaja antes de pegar"],"correcta":2,"explicacion":"Si algo va mal, todavía se puede corregir."},{"pregunta":"¿Por qué se deja la caja abierta?","opciones":["Para poder colocar el mecanismo adentro","Para que se vea bonita","Porque faltan piezas"],"correcta":0,"explicacion":"El mecanismo se monta desde el lado abierto."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-cuarto-egb', 'El mecanismo de la moneda', 'copol-tragamonedas-el-mecanismo', 'practica', 'Se monta dentro de la caja el mecanismo que la moneda acciona con su peso, y se ajusta hasta que funcione siempre.', ARRAY['Reconocer una palanca: punto de apoyo, fuerza y movimiento.', 'Ajustar un mecanismo probando y corrigiendo.']::text[], -1, $cp${"reto":{"texto":"Vas a montar el corazón de la máquina: el mecanismo que se mueve cuando entra la moneda.","paraQue":"Las alcancías, las máquinas de chicles y los torniquetes usan el mismo truco: el peso de una moneda mueve una palanca.","duracion":"40 minutos"},"piezas":[{"nombre":"Rampa o canal","paraQue":"Guía la moneda desde la ranura hasta la palanca."},{"nombre":"Palanca","paraQue":"La moneda cae sobre un extremo; el otro extremo se levanta y mueve algo.","cuidado":"Debe girar libre en su eje: ni muy apretada ni tan floja que se salga."},{"nombre":"Eje o pasador","paraQue":"Es el punto de apoyo de la palanca."},{"nombre":"Piezas restantes del mecanismo","paraQue":"Según tu kit: una compuerta, un tambor o un cajón que se abre. Sigue el plano."}],"pasos":[{"titulo":"Arma la palanca sola","texto":"Fuera de la caja, pasa el eje por la palanca. Empuja un extremo con el dedo: el otro debe subir."},{"titulo":"Coloca la rampa","texto":"Fija la rampa en el lugar que indica el plano, debajo de la ranura."},{"titulo":"Monta la palanca","texto":"Coloca el eje con la palanca en sus agujeros dentro de la caja. Comprueba que gira sin rozar las paredes."},{"titulo":"Monta lo que la palanca mueve","texto":"Coloca la pieza que la palanca acciona (compuerta, tambor o cajón) siguiendo el plano."},{"titulo":"Prueba con la moneda","texto":"Deja caer una moneda por la ranura y observa todo el recorrido. Repite cinco veces.","consejo":"Anota cuántas veces de cinco funciona. Ajusta y vuelve a contar."}],"codigo":[],"prueba":{"queDebePasar":["La moneda baja por la rampa y cae sobre la palanca.","La palanca se mueve y acciona la otra pieza.","Funciona cinco veces seguidas."],"siNoFunciona":[{"problema":"La moneda se queda en la rampa","revisa":"La rampa quedó muy plana o tiene goma seca. Dale más inclinación o límpiala."},{"problema":"La moneda cae pero la palanca no se mueve","revisa":"El eje está apretado o la moneda cae muy cerca del punto de apoyo. Afloja el eje y revisa la posición de la rampa."},{"problema":"La palanca no vuelve a su sitio","revisa":"Falta el contrapeso o la liga que la regresa. Revisa el plano."}]},"demuestra":{"reto":"Prueba con una moneda más liviana y con una más pesada. ¿Con cuál funciona mejor y por qué?","preguntas":[{"pregunta":"¿Qué fuerza mueve la palanca?","opciones":["Una pila","El peso de la moneda","El viento"],"correcta":1,"explicacion":"La moneda cae y su peso empuja un extremo de la palanca."},{"pregunta":"¿Qué es el punto de apoyo?","opciones":["La ranura","La tapa de la caja","El eje sobre el que gira la palanca"],"correcta":2,"explicacion":"Toda palanca gira alrededor de un punto de apoyo."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-cuarto-egb', 'El tragamonedas', 'copol-el-tragamonedas', 'principal', 'Se cierra la caja, se hacen las pruebas finales y cada estudiante presenta su máquina explicando cómo funciona.', ARRAY['Terminar y probar una máquina simple completa.', 'Explicar el funcionamiento usando las palabras palanca, peso y punto de apoyo.']::text[], 1, $cp${"reto":{"texto":"Vas a terminar tu tragamonedas, decorarlo y demostrar que funciona.","paraQue":"Construir una máquina que funciona siempre, y saber explicarla, es lo que hace un ingeniero.","duracion":"40 minutos"},"piezas":[{"nombre":"Caja con el mecanismo montado","paraQue":"Es tu máquina casi terminada."},{"nombre":"Tapa y pared final","paraQue":"Cierran la caja.","cuidado":"Antes de pegarlas, prueba el mecanismo una última vez: después ya no podrás meter la mano."},{"nombre":"Marcadores o pintura","paraQue":"Para decorar.","cuidado":"No pintes la ranura ni las piezas que se mueven: la pintura las traba."}],"pasos":[{"titulo":"Última prueba abierta","texto":"Con la caja todavía abierta, deja caer la moneda cinco veces. Debe funcionar las cinco."},{"titulo":"Cierra la caja","texto":"Coloca la pared final y la tapa. Si tu kit tiene una puerta para sacar las monedas, déjala sin pegar."},{"titulo":"Prueba cerrada","texto":"Repite la prueba con la caja cerrada. Escucha el recorrido de la moneda."},{"titulo":"Decora","texto":"Ponle nombre a tu máquina y decórala por fuera."},{"titulo":"Presenta","texto":"Muestra tu máquina a la clase: deja caer una moneda y explica qué pasa adentro."}],"codigo":[],"prueba":{"queDebePasar":["La moneda entra, acciona el mecanismo y queda guardada.","Funciona varias veces seguidas con la caja cerrada.","Las monedas se pueden recuperar."],"siNoFunciona":[{"problema":"Funcionaba abierta y cerrada no","revisa":"La tapa está rozando el mecanismo. Ábrela y mira dónde toca."},{"problema":"A veces funciona y a veces no","revisa":"La moneda no cae siempre en el mismo punto. Corrige la rampa para que la guíe mejor."}]},"demuestra":{"reto":"Cambia algo para que tu máquina funcione solo con un tamaño de moneda. Explica qué cambiaste.","preguntas":[{"pregunta":"¿Qué tipo de máquina simple usa tu tragamonedas?","opciones":["Una palanca","Una polea","Un tornillo"],"correcta":0,"explicacion":"La moneda mueve una palanca con su peso."},{"pregunta":"¿Por qué no se pintan las piezas que se mueven?","opciones":["Porque se ven feas","Porque la pintura las puede trabar","Porque la madera se moja"],"correcta":1,"explicacion":"La pintura aumenta el roce entre las piezas."},{"pregunta":"Si la palanca no se mueve con una moneda liviana, ¿qué puedes hacer?","opciones":["Pintar la palanca","Cerrar la caja","Hacer que la moneda caiga más lejos del punto de apoyo"],"correcta":2,"explicacion":"Más lejos del punto de apoyo, la misma fuerza mueve más."}]}}$cp$::jsonb);

-- ===== kit-copol-quinto-egb =====
UPDATE kits SET alimentacion = 'Pilas en el portapilas del carro y en el control remoto.', advertencia_seguridad = 'Las pilas las entrega y las recoge el docente. Si algo se calienta, se apaga y se sacan las pilas.', notas = 'Las lecciones siguen el instructivo de la caja para el cableado del receptor.', visible = true WHERE id = 'kit-copol-quinto-egb';
INSERT INTO kit_materiales (kit_id, material_id, cantidad, nota, incluido) VALUES
  ('kit-copol-quinto-egb', 'kit-madera-carro-rc', 1, 'Contenido según el instructivo de la caja (pilas no incluidas, salvo que la caja diga lo contrario)', true);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-quinto-egb', 'Las piezas y el plano', 'copol-carro-rc-piezas-y-plano', 'practica', 'Se revisa el kit y se identifican las partes de un carro a control remoto: chasis, motores, ruedas, portapilas, receptor y control.', ARRAY['Identificar las partes de un vehículo a control remoto y su función.', 'Leer un plano de armado.']::text[], -3, $cp${"reto":{"texto":"Vas a conocer cada parte de tu carro a control remoto antes de armarlo.","paraQue":"Los drones, los carros de juguete y los robots de rescate se manejan igual: un control envía órdenes y el vehículo las recibe.","duracion":"30 minutos"},"piezas":[{"nombre":"Chasis de madera","paraQue":"Es el cuerpo del carro: sostiene todo."},{"nombre":"Motores","paraQue":"Hacen girar las ruedas.","cuidado":"No dobles ni jales sus cables: las soldaduras son frágiles."},{"nombre":"Ruedas","paraQue":"Las que van en los motores empujan el carro; las demás solo lo sostienen."},{"nombre":"Portapilas","paraQue":"Guarda las pilas y entrega la energía.","cuidado":"Las pilas las entrega y las recoge el docente. Si una pila se calienta, se saca de inmediato."},{"nombre":"Receptor","paraQue":"Es la plaquita que va en el carro: escucha al control y enciende los motores."},{"nombre":"Control remoto","paraQue":"Envía tus órdenes por el aire."}],"pasos":[{"titulo":"Saca y separa","texto":"Pon todas las piezas sobre la mesa. Separa la madera, las piezas eléctricas y los tornillos."},{"titulo":"Cuenta contra el plano","texto":"Compara con la lista o el dibujo del instructivo y marca cada pieza que encuentres."},{"titulo":"Sigue la energía","texto":"En el plano, sigue con el dedo el camino de la energía: de las pilas al receptor y del receptor a los motores."},{"titulo":"Reconoce los cables","texto":"Mira cuántos cables salen del receptor y hacia dónde va cada uno según el plano. Fíjate en los colores.","consejo":"Rojo casi siempre es positivo (+) y negro es negativo (–)."}],"codigo":[],"prueba":{"queDebePasar":["Todas las piezas del plano están sobre la mesa.","Puedes explicar el camino de la energía: pilas → receptor → motores."],"siNoFunciona":[{"problema":"Falta una pieza","revisa":"Revisa el fondo de la caja y las bolsitas. Si no aparece, avisa al docente."}]},"demuestra":{"reto":"Dibuja tu carro visto desde arriba y señala dónde irá cada parte.","preguntas":[{"pregunta":"¿Qué hace el receptor?","opciones":["Recibe las órdenes del control y enciende los motores","Guarda las pilas","Hace girar las ruedas con la mano"],"correcta":0,"explicacion":"Es el «oído» del carro."},{"pregunta":"¿De dónde sale la energía de los motores?","opciones":["Del control remoto","De las pilas","De las ruedas"],"correcta":1,"explicacion":"El control solo envía órdenes; la energía la ponen las pilas del carro."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-quinto-egb', 'Arma el chasis y los motores', 'copol-carro-rc-chasis-y-motores', 'practica', 'Se arma el chasis de madera, se fijan los motores y se colocan las ruedas, comprobando que el carro rueda derecho.', ARRAY['Construir una estructura firme y alineada.', 'Fijar motores y ruedas de modo que giren libres.']::text[], -2, $cp${"reto":{"texto":"Vas a armar el cuerpo de tu carro y a ponerle sus motores y ruedas.","paraQue":"Si el chasis queda torcido o un motor queda flojo, el carro se va de lado aunque lo manejes bien.","duracion":"40 minutos"},"piezas":[{"nombre":"Chasis de madera","paraQue":"La base donde se monta todo."},{"nombre":"Motores con sus soportes","paraQue":"Van a los lados o atrás, según el plano."},{"nombre":"Ruedas","paraQue":"Se empujan en el eje de cada motor."},{"nombre":"Tornillos y destornillador","paraQue":"Fijan los motores al chasis.","cuidado":"Aprieta hasta que quede firme, sin forzar: la madera se raja."}],"pasos":[{"titulo":"Arma el chasis","texto":"Encaja las piezas de madera siguiendo el plano. Prueba primero sin goma y luego fija las uniones."},{"titulo":"Fija los motores","texto":"Coloca cada motor en su soporte y atorníllalo. Los dos deben quedar a la misma altura y mirando hacia el mismo lado.","consejo":"Deja los cables de los motores hacia el centro del carro: así llegarán al receptor."},{"titulo":"Pon las ruedas","texto":"Empuja una rueda en el eje de cada motor, hasta el fondo."},{"titulo":"Pon la rueda de apoyo","texto":"Coloca la rueda loca o las ruedas delanteras que trae tu kit."},{"titulo":"Prueba de rodado","texto":"Empuja el carro con la mano sobre la mesa. Debe rodar derecho y sin trabarse."}],"codigo":[],"prueba":{"queDebePasar":["El carro rueda derecho al empujarlo con la mano.","Las ruedas no rozan el chasis.","Los motores no se mueven al tocarlos."],"siNoFunciona":[{"problema":"El carro se va hacia un lado","revisa":"Un motor quedó más adelante o más inclinado que el otro. Aflójalo, alinéalo y vuelve a apretar."},{"problema":"Una rueda se sale","revisa":"No entró hasta el fondo del eje. Empújala con firmeza."}]},"demuestra":{"reto":"Empuja tu carro una sola vez y mide con una regla cuánto se desvía en un metro.","preguntas":[{"pregunta":"¿Por qué los motores deben quedar alineados?","opciones":["Para que gasten menos pilas","Para que se vean iguales","Para que el carro avance derecho"],"correcta":2,"explicacion":"Si un motor queda torcido, esa rueda empuja hacia otro lado."},{"pregunta":"¿Qué pasa si aprietas demasiado un tornillo en la madera?","opciones":["La madera se puede rajar","El motor gira más rápido","Nada"],"correcta":0,"explicacion":"La madera delgada se parte con facilidad."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-quinto-egb', 'Conecta el receptor y prueba el control', 'copol-carro-rc-conecta-el-control', 'practica', 'Se conectan el portapilas, el receptor y los motores, y se comprueba con el carro en el aire que cada orden del control mueve las ruedas correctas.', ARRAY['Conectar un circuito siguiendo un plano, respetando la polaridad.', 'Probar un sistema por partes antes de usarlo.']::text[], -1, $cp${"reto":{"texto":"Vas a darle vida a tu carro: conectar las pilas, el receptor y los motores, y probar el control.","paraQue":"Todo sistema a control remoto tiene tres partes: quien manda (control), quien escucha (receptor) y quien actúa (motores).","duracion":"40 minutos"},"piezas":[{"nombre":"Portapilas con pilas","paraQue":"La energía del carro.","cuidado":"Pon las pilas al final, cuando todo esté conectado. Respeta el + y el – marcados en el portapilas. Las pilas las entrega y las recoge el docente. Si una pila se calienta, se saca de inmediato."},{"nombre":"Receptor","paraQue":"Recibe las órdenes y enciende los motores.","cuidado":"No lo apoyes sobre partes metálicas: puede hacer cortocircuito."},{"nombre":"Control remoto","paraQue":"Envía las órdenes.","cuidado":"Usa sus propias pilas. Revisa que estén puestas."},{"nombre":"Interruptor","paraQue":"Enciende y apaga el carro sin sacar las pilas."}],"pasos":[{"titulo":"Fija el receptor y el portapilas","texto":"Coloca el receptor y el portapilas en el chasis, en el lugar que indica el plano. El peso debe quedar repartido."},{"titulo":"Conecta los motores","texto":"Une los cables de cada motor a las salidas del receptor marcadas para motor, como muestra el plano."},{"titulo":"Conecta la energía","texto":"Une el cable rojo del portapilas a la entrada positiva (+) del receptor y el negro a la negativa (–), pasando por el interruptor si tu kit lo trae.","consejo":"Antes de poner las pilas, pídele al docente que revise el rojo y el negro."},{"titulo":"Pon las pilas y enciende","texto":"Con el carro levantado en la mano (ruedas en el aire), pon las pilas y enciende el interruptor."},{"titulo":"Prueba cada orden","texto":"Presiona adelante, atrás, izquierda y derecha en el control, una a la vez. Mira qué ruedas giran y hacia dónde."},{"titulo":"Corrige el sentido","texto":"Si al presionar adelante una rueda gira hacia atrás, apaga e intercambia los dos cables de ese motor."}],"codigo":[],"prueba":{"queDebePasar":["Adelante: las ruedas motrices giran hacia adelante.","Atrás: giran hacia atrás.","Izquierda y derecha: el carro gira hacia el lado que pides."],"siNoFunciona":[{"problema":"No pasa nada al encender","revisa":"Revisa que las pilas estén en el sentido correcto, que el interruptor esté encendido y que el rojo y el negro lleguen al receptor."},{"problema":"El carro enciende pero no obedece al control","revisa":"Revisa las pilas del control y acércalo al carro. Algunos kits piden encender primero el carro y después el control para que se enlacen."},{"problema":"Una rueda gira al revés","revisa":"Apaga e intercambia los dos cables de ese motor."},{"problema":"Algo se calienta","revisa":"Apaga y saca las pilas de inmediato. Hay un cable mal conectado: avisa al docente."}]},"demuestra":{"reto":"Llena una tabla: para cada botón del control, anota qué ruedas giran y en qué sentido.","preguntas":[{"pregunta":"¿Por qué se prueba con las ruedas en el aire?","opciones":["Para gastar menos pilas","Para ver qué hace cada rueda sin que el carro se escape","Porque el piso está sucio"],"correcta":1,"explicacion":"Probar por partes evita golpes y permite corregir."},{"pregunta":"Si un motor gira al revés, ¿qué se hace?","opciones":["Cambiar las pilas","Quitar la rueda","Intercambiar sus dos cables"],"correcta":2,"explicacion":"Al invertir los cables se invierte el giro."}]}}$cp$::jsonb);
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden, guia) VALUES ('kit-copol-quinto-egb', 'El carro radiocontrolado', 'copol-el-carro-radiocontrolado', 'principal', 'Con el carro terminado, los estudiantes aprenden a manejarlo, miden su alcance y completan un circuito de conos.', ARRAY['Manejar un vehículo a control remoto con precisión.', 'Medir y comparar: alcance del control y tiempo en un recorrido.']::text[], 1, $cp${"reto":{"texto":"Vas a manejar tu carro por un circuito y a medir qué tan lejos obedece al control.","paraQue":"Manejar a distancia con precisión es lo que hacen los pilotos de drones y los operadores de robots.","duracion":"40 minutos"},"piezas":[{"nombre":"Carro terminado","paraQue":"Listo para rodar.","cuidado":"Apágalo siempre que no lo uses: así duran las pilas."},{"nombre":"Conos, vasos o tapas","paraQue":"Marcan el circuito."},{"nombre":"Metro y cronómetro","paraQue":"Para medir el alcance y el tiempo."}],"pasos":[{"titulo":"Asegura los cables","texto":"Sujeta los cables sueltos con cinta para que no rocen las ruedas."},{"titulo":"Primera rodada","texto":"En un piso liso, avanza un metro, frena y retrocede. Repite hasta que te salga derecho."},{"titulo":"Aprende a girar","texto":"Dibuja un ocho con dos conos y recórrelo despacio."},{"titulo":"Mide el alcance","texto":"Aléjate del carro de metro en metro y prueba si todavía obedece. Anota la distancia máxima."},{"titulo":"El circuito","texto":"Arma un circuito con cinco conos. Mide tu tiempo en tres intentos y anota el mejor."}],"codigo":[],"prueba":{"queDebePasar":["El carro avanza, retrocede y gira hacia donde le ordenas.","Completa el circuito sin tumbar conos.","Tienes anotado el alcance del control y tu mejor tiempo."],"siNoFunciona":[{"problema":"El carro va lento o se detiene","revisa":"Las pilas están gastadas o un cable roza una rueda."},{"problema":"No va derecho","revisa":"Revisa que las dos ruedas motrices estén a fondo en sus ejes y que nada las roce."},{"problema":"Deja de obedecer de lejos","revisa":"Llegaste al alcance máximo del control. Acércate."}]},"demuestra":{"reto":"Compite contra tu propio tiempo: baja tu marca en el circuito sin tumbar ningún cono.","preguntas":[{"pregunta":"¿Cómo viaja la orden del control al carro?","opciones":["Por el aire, sin cables","Por un cable escondido","Por las ruedas"],"correcta":0,"explicacion":"El control la emite y el receptor del carro la capta."},{"pregunta":"¿Por qué el carro deja de obedecer cuando está muy lejos?","opciones":["Porque se le acaban las ruedas","Porque la señal del control llega muy débil","Porque el piso cambia"],"correcta":1,"explicacion":"Toda señal tiene un alcance máximo."},{"pregunta":"¿Qué conviene hacer al terminar la clase?","opciones":["Dejarlo encendido","Sacarle las ruedas","Apagar el carro y el control"],"correcta":2,"explicacion":"Así las pilas duran más."}]}}$cp$::jsonb);

COMMIT;

-- Comprobación
SELECT k.id, k.price, k.visible, k.placa_id,
  (SELECT count(*) FROM kit_proyectos p WHERE p.kit_id = k.id) AS lecciones,
  (SELECT count(*) FROM kit_proyectos p WHERE p.kit_id = k.id AND p.guia IS NOT NULL) AS con_guia,
  (SELECT count(*) FROM kit_materiales m WHERE m.kit_id = k.id) AS materiales
FROM kits k WHERE k.school_id = 'school-copol' ORDER BY k.level_id;
