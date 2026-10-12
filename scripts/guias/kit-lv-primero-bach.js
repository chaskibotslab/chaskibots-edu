// Guías (método de 6 etapas) del kit de 1ro BGU — Estación meteorológica con ESP32-C3 Super Mini.
// Clave = slug del proyecto en kit_proyectos. Se cargan con scripts/seed-kit-guias.js.

const C3 = { nombre: 'ESP32-C3 Super Mini', paraQue: 'Es el cerebro. Es más potente que un Arduino clásico y trae WiFi y Bluetooth integrados.', cuidado: 'Trabaja a 3,3 V, no a 5 V. Nunca conectes 5 V a sus pines de señal: se daña.' }
const PROTO = { nombre: 'Protoboard y cables jumper', paraQue: 'Sostienen las piezas y reparten 3,3 V (línea roja) y tierra (línea negra).' }

const PLACA = { titulo: 'Coloca la placa', texto: 'Con los pines ya soldados, pon el ESP32-C3 a caballo sobre el canal central de la protoboard, con el conector USB-C hacia afuera.' }
const RIELES = { titulo: 'Reparte 3,3 V y tierra', texto: 'Une el pin 3V3 de la placa con la línea roja (+) de la protoboard y el pin GND con la línea negra (–).', rieles: ['3V3', 'GND'], consejo: 'En este kit la línea roja lleva 3,3 V, no 5 V. No uses el pin marcado 5V para alimentar sensores.' }
const TIERRA = { titulo: 'Lleva tierra a la línea negra', texto: 'Une el pin GND de la placa con la línea negra (–) de la protoboard.', rieles: ['GND'] }
const USB_SERIAL = { titulo: 'Conecta el USB-C y abre el Monitor Serial', texto: 'Conecta la placa a la computadora con el cable USB-C de datos. Después de subir el programa, abre el Monitor Serial y elige 115200 baudios.' }

const NO_SUBE = { problema: 'El programa no se sube', revisa: 'En Herramientas elige Placa: ESP32C3 Dev Module y el puerto correcto. Si falla, mantén presionado el botón BOOT de la placa mientras conectas el cable y vuelve a intentar. Comprueba que el cable sea de datos y no solo de carga.' }
const NO_SERIAL = { problema: 'El Monitor Serial queda en blanco', revisa: 'En Herramientas activa «USB CDC On Boot: Enabled», vuelve a subir el programa y elige 115200 baudios.' }

module.exports = {
  'practica-ldr': {
    reto: {
      texto: 'Vas a medir la luz de tu salón con un número. Verás cómo cambia el valor en pantalla cuando tapas el sensor con la mano o lo acercas a una ventana.',
      paraQue: 'Los sensores de luz encienden solos los postes de la calle al anochecer y ajustan el brillo de la pantalla de tu celular. En una estación meteorológica indican si el día está despejado o nublado.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'LDR y resistencia de 1 kΩ', paraQue: 'La LDR es una resistencia que cambia con la luz. Puesta en fila con la resistencia de 1 kΩ, entre 3,3 V y tierra, entrega en la unión de las dos un voltaje que depende de la iluminación.', cuidado: 'La LDR tiene 2 patas y no tiene polaridad: puede ir en cualquier sentido. Lo importante es que una de sus patas comparta fila con una pata de la resistencia.' },
      C3, PROTO,
    ],
    pasos: [
      PLACA,
      RIELES,
      { titulo: 'Arma la LDR con su resistencia', texto: 'Pon la LDR con cada pata en una fila distinta. Pon la resistencia de 1 kΩ con una pata en la misma fila que una pata de la LDR, y la otra pata en una fila nueva. Une la pata libre de la LDR con la línea roja (3,3 V) y la pata libre de la resistencia con la línea negra.', conexiones: [0, 2], consejo: 'A este armado se le llama divisor de voltaje: reparte los 3,3 V entre la LDR y la resistencia.' },
      { titulo: 'Conecta la señal', texto: 'Une la fila donde se juntan la LDR y la resistencia con el pin GPIO0 de la placa. Ese pin puede leer valores analógicos.', conexiones: [1] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'El pin y la comunicación', texto: 'En el ESP32 los pines se nombran por su número de GPIO. La comunicación con la computadora va a 115200 baudios, más rápida que en un Arduino clásico.', fragmento: 'const int PIN_LDR = 0;\n\nvoid setup() {\n  Serial.begin(115200);\n}' },
      { titulo: 'Leer la luz', texto: 'analogRead devuelve un número entre 0 y 4095. El rango es cuatro veces mayor que en un Arduino UNO (0 a 1023) porque el ESP32 mide con más precisión.', fragmento: 'int luz = analogRead(PIN_LDR);' },
      { titulo: 'Mostrar el valor', texto: 'Se escribe una línea nueva unas tres veces por segundo.', fragmento: 'Serial.print("Luz (0-4095): ");\nSerial.println(luz);\ndelay(300);' },
    ],
    prueba: {
      queDebePasar: [
        'Aparece un número entre 0 y 4095 que se actualiza varias veces por segundo.',
        'Al tapar el sensor con la mano el número cambia claramente, y vuelve al soltarlo.',
        'Anota el valor con luz normal y con el sensor tapado. Con este armado, más luz da un número más alto.',
      ],
      siNoFunciona: [
        { problema: 'El número no cambia al tapar el sensor', revisa: 'La señal no sale de la unión. Revisa que el cable de GPIO0 esté en la fila donde se juntan la LDR y la resistencia, y no en un extremo.' },
        { problema: 'Siempre marca 0 o 4095', revisa: 'Falta uno de los extremos: uno debe ir a 3,3 V y el otro a tierra.' },
        NO_SERIAL, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Haz que el programa escriba "DE DÍA" o "DE NOCHE" según la lectura. Elige el número límite a partir de los dos valores que anotaste.',
      preguntas: [
        { pregunta: '¿Entre qué valores lee analogRead en el ESP32-C3?', opciones: ['0 y 255', '0 y 1023', '0 y 4095'], correcta: 2, explicacion: 'El ESP32 usa 12 bits para medir: 4096 valores posibles.' },
        { pregunta: '¿A qué voltaje trabaja esta placa?', opciones: ['3,3 V', '5 V', '9 V'], correcta: 0, explicacion: 'Por eso todos los sensores de este kit se alimentan desde el pin 3V3.' },
        { pregunta: '¿Qué mide un LDR?', opciones: ['Temperatura', 'Luz', 'Distancia'], correcta: 1, explicacion: 'Su resistencia cambia según la luz que recibe.' },
      ],
    },
  },

  'practica-dht11': {
    reto: {
      texto: 'Vas a medir la temperatura y la humedad del aire de tu salón y a verlas en pantalla, actualizadas cada dos segundos. Es el corazón de la estación meteorológica.',
      paraQue: 'Temperatura y humedad son los dos datos básicos del clima. Se miden en aeropuertos, invernaderos, bodegas de alimentos y hospitales, donde un cambio pequeño puede ser importante.',
      duracion: '35 minutos',
    },
    piezas: [
      { nombre: 'Sensor DHT11 (módulo de 3 pines)', paraQue: 'Mide temperatura (0 a 50 °C) y humedad del aire (20 a 90 %) y las envía por un solo cable de datos.', cuidado: 'Lee las letras impresas junto a cada pin: el orden cambia según el fabricante. Solo puede medir una vez cada dos segundos.' },
      C3, PROTO,
    ],
    pasos: [
      PLACA,
      RIELES,
      { titulo: 'Dale energía al sensor', texto: 'Une el pin VCC (o +) del sensor con la línea roja (3,3 V) y el pin GND (o –) con la línea negra.', conexiones: [0, 1] },
      { titulo: 'Conecta el cable de datos', texto: 'Une el pin DATA (u OUT) del sensor con el pin GPIO3 de la placa.', conexiones: [2] },
      { titulo: 'Instala la librería y conecta', texto: 'En el programa Arduino abre Herramientas > Administrar bibliotecas, busca «DHT sensor library» de Adafruit e instálala (acepta instalar también sus dependencias). Luego conecta el USB-C y abre el Monitor Serial a 115200 baudios.' },
    ],
    codigo: [
      { titulo: 'Incluir la librería y crear el sensor', texto: 'La librería DHT sabe cómo interpretar la señal del sensor. Se le indica el pin y el modelo (DHT11).', fragmento: '#include <DHT.h>\n\nconst int PIN_DHT = 3;\n#define DHTTYPE DHT11\nDHT dht(PIN_DHT, DHTTYPE);' },
      { titulo: 'Iniciar el sensor', texto: 'dht.begin() prepara el sensor. Se hace una sola vez.', fragmento: 'Serial.begin(115200);\ndht.begin();' },
      { titulo: 'Pedir las dos medidas', texto: 'El tipo float permite guardar decimales, como 23.50. Cada función devuelve una de las dos medidas.', fragmento: 'float temperatura = dht.readTemperature();\nfloat humedad = dht.readHumidity();' },
      { titulo: 'Esperar dos segundos', texto: 'El DHT11 es lento: si se le pregunta más seguido, repite el dato anterior o falla.', fragmento: 'delay(2000);' },
    ],
    prueba: {
      queDebePasar: [
        'Cada dos segundos aparece una línea como "Temp: 22.50 C  Humedad: 58.00 %".',
        'Si soplas aire caliente y húmedo sobre el sensor, la humedad sube en pocas lecturas.',
      ],
      siNoFunciona: [
        { problema: 'Aparece "nan" en lugar de números', revisa: 'El sensor no responde. Revisa que DATA vaya a GPIO3 y que VCC y GND no estén invertidos.' },
        { problema: 'Error "DHT.h: No such file"', revisa: 'Falta la librería. Instala «DHT sensor library» de Adafruit desde Administrar bibliotecas.' },
        { problema: 'La temperatura parece muy alta', revisa: 'El sensor está cerca de algo caliente o lo estás tocando. Aléjalo de la placa y espera un minuto.' },
        NO_SERIAL, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Agrega un aviso: si la temperatura pasa de 28 grados, que escriba "¡Hace calor!". Pista: if (temperatura > 28).',
      preguntas: [
        { pregunta: '¿Por qué el programa espera 2 segundos entre lecturas?', opciones: ['Porque el DHT11 no puede medir más rápido', 'Para ahorrar batería', 'Porque el Monitor Serial es lento'], correcta: 0, explicacion: 'El DHT11 necesita unos dos segundos entre una medida y la siguiente.' },
        { pregunta: '¿Qué significa "nan" en la pantalla?', opciones: ['Que la temperatura es cero', 'Que no se recibió un número válido del sensor', 'Que el programa terminó'], correcta: 1, explicacion: 'nan significa "no es un número": la lectura falló.' },
        { pregunta: '¿Para qué sirve el tipo float?', opciones: ['Para guardar texto', 'Para guardar números con decimales', 'Para guardar verdadero o falso'], correcta: 1, explicacion: 'La temperatura puede ser 22.5; un int solo guardaría 22.' },
      ],
    },
  },

  'practica-pulsador-modo': {
    reto: {
      texto: 'Vas a convertir un botón en un interruptor: una pulsación enciende el LED y la siguiente lo apaga. En tu estación, ese mismo botón activará o silenciará el sonido de la alarma.',
      paraQue: 'El botón de encendido de un televisor o de una lámpara de mesa funciona así: no hay que mantenerlo presionado, cada toque cambia el estado. Para lograrlo, el programa tiene que recordar cómo estaba antes.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'Pulsador', paraQue: 'Es un interruptor que solo deja pasar corriente mientras lo presionas.', cuidado: 'Colócalo a caballo sobre el canal central y usa dos patas de lados opuestos.' },
      { nombre: 'LED rojo con resistencia de 330 Ω', paraQue: 'Muestra si el modo está encendido o apagado.', cuidado: 'Pata larga hacia la resistencia; pata corta a tierra.' },
      C3, PROTO,
    ],
    pasos: [
      PLACA,
      TIERRA,
      { titulo: 'Conecta el pulsador', texto: 'Une una pata del pulsador con el pin GPIO10 y la pata del lado opuesto con la línea negra (–).', conexiones: [0, 1], consejo: 'No necesitas resistencia para el pulsador: el programa activa una que la placa ya trae por dentro.' },
      { titulo: 'Arma el LED rojo', texto: 'Une el pin GPIO5 con la pata larga del LED pasando por la resistencia de 330 Ω. Une la pata corta con la línea negra (–).', conexiones: [2, 3] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Dos variables que recuerdan', texto: 'encendido guarda el estado del LED. anterior guarda cómo estaba el botón en la vuelta pasada: empieza en HIGH, es decir, suelto.', fragmento: 'bool encendido = false;\nbool anterior = HIGH;' },
      { titulo: 'Detectar el momento de presionar', texto: 'No basta con saber si está presionado: hay que detectar el instante en que pasa de suelto a presionado. Así, mantener el dedo no cuenta varias veces.', fragmento: 'bool actual = digitalRead(PULSADOR);\nif (actual == LOW && anterior == HIGH) {' },
      { titulo: 'Invertir el estado', texto: 'El signo ! significa "lo contrario de": convierte falso en verdadero y verdadero en falso. Luego se aplica al LED.', fragmento: 'encendido = !encendido;\ndigitalWrite(LED, encendido ? HIGH : LOW);' },
      { titulo: 'Guardar el estado para la próxima vuelta', texto: 'Al final de cada vuelta, lo actual pasa a ser lo anterior. La pausa de 50 ms evita que la vibración del contacto cuente como dos pulsaciones.', fragmento: 'anterior = actual;\ndelay(50);' },
    ],
    prueba: {
      queDebePasar: [
        'Al presionar una vez, el LED se enciende y queda encendido aunque sueltes el botón.',
        'Al presionar otra vez, el LED se apaga.',
        'Mantener el botón presionado no hace que el LED cambie varias veces.',
      ],
      siNoFunciona: [
        { problema: 'Con una pulsación el LED cambia dos veces', revisa: 'Es el "rebote" del botón: al presionar, el contacto vibra. Sube la pausa final de delay(50) a delay(100).' },
        { problema: 'El LED no enciende nunca', revisa: 'Gira el LED y comprueba que la resistencia llega a GPIO5. Revisa también que una pata del pulsador va a GPIO10 y la otra a la línea negra.' },
        { problema: 'El LED cambia solo', revisa: 'Falta INPUT_PULLUP en pinMode, o usaste dos patas del pulsador que ya están unidas.' },
        NO_SERIAL, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Agrega un tercer estado: apagado, encendido fijo y parpadeando. Pista: cambia la variable bool por un int modo y usa modo = (modo + 1) % 3.',
      preguntas: [
        { pregunta: '¿Para qué sirve la variable anterior?', opciones: ['Para contar segundos', 'Para saber si el botón acaba de ser presionado y no solo si está presionado', 'Para encender el LED'], correcta: 1, explicacion: 'Comparar el estado actual con el anterior permite detectar el instante del cambio.' },
        { pregunta: '¿Qué hace encendido = !encendido?', opciones: ['Apaga el LED', 'Invierte el valor: de falso a verdadero y de verdadero a falso', 'Borra la variable'], correcta: 1, explicacion: 'El signo ! significa "lo contrario de".' },
        { pregunta: '¿Qué es el "rebote" de un botón?', opciones: ['Que el botón salta de la protoboard', 'Que el contacto vibra y se lee como varias pulsaciones', 'Que el programa se reinicia'], correcta: 1, explicacion: 'Es un efecto mecánico; se corrige con una pausa corta.' },
      ],
    },
  },

  'practica-buzzer-meteo': {
    reto: {
      texto: 'Vas a hacer sonar una alarma intermitente: un pitido, un silencio, y otra vez. Será el aviso de tu estación cuando la temperatura o la humedad salgan de lo normal.',
      paraQue: 'Una estación que mide pero no avisa sirve de poco. Las alarmas sonoras protegen cultivos de las heladas, alimentos en bodegas y equipos en salas de servidores.',
      duracion: '20 minutos',
    },
    piezas: [
      { nombre: 'Buzzer activo', paraQue: 'Emite un pitido cuando recibe corriente.', cuidado: 'La pata marcada con + (o la más larga) va al pin de la placa; la otra, a tierra.' },
      C3, PROTO,
    ],
    pasos: [
      PLACA,
      TIERRA,
      { titulo: 'Conecta el buzzer', texto: 'Une la pata marcada con + con el pin GPIO4 y la otra pata con la línea negra (–).', conexiones: [0, 1] },
      { titulo: 'Conecta el USB-C', texto: 'Conecta la placa a la computadora y sube el programa.' },
    ],
    codigo: [
      { titulo: 'El buzzer es una salida', texto: 'Igual que un LED: la placa le envía corriente.', fragmento: 'const int BUZZER = 4;\n\nvoid setup() {\n  pinMode(BUZZER, OUTPUT);\n}' },
      { titulo: 'Sonar y callar', texto: 'tone() inicia el sonido a 1200 hercios y noTone() lo detiene. Los dos delay marcan el ritmo: 400 ms de sonido y 800 ms de silencio.', fragmento: 'tone(BUZZER, 1200);\ndelay(400);\nnoTone(BUZZER);\ndelay(800);' },
    ],
    prueba: {
      queDebePasar: ['Se escucha un pitido corto que se repite con una pausa entre cada uno.'],
      siNoFunciona: [
        { problema: 'No suena', revisa: 'Invierte las patas del buzzer y comprueba que llega a GPIO4 y que la línea negra está unida a GND.' },
        { problema: 'Suena sin parar', revisa: 'Falta noTone(BUZZER) dentro de loop().' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Crea una alarma de dos tonos, como una sirena: alterna entre 1200 y 800 hercios cada 300 milisegundos.',
      preguntas: [
        { pregunta: '¿Qué controla el número 1200 en tone()?', opciones: ['El volumen', 'La frecuencia: qué tan agudo es el sonido', 'La duración'], correcta: 1, explicacion: 'Un número más alto da un sonido más agudo.' },
        { pregunta: '¿Qué hace noTone()?', opciones: ['Detiene el sonido', 'Baja el volumen', 'Cambia de nota'], correcta: 0, explicacion: 'Sin noTone() el buzzer seguiría sonando.' },
        { pregunta: '¿Por qué una estación meteorológica necesita una alarma?', opciones: ['Para verse más completa', 'Para avisar cuando un valor sale de lo normal, aunque nadie esté mirando', 'Para medir mejor'], correcta: 1, explicacion: 'Medir es útil solo si alguien se entera a tiempo.' },
      ],
    },
  },

  'estacion-meteorologica-iot': {
    reto: {
      texto: 'Vas a construir una estación que vigila el ambiente: mide temperatura, humedad y luz, y muestra los datos en tu celular con una página web que crea la propia placa. La luz azul de la placa indica que todo está normal; una luz roja y una alarma avisan cuando hace demasiado calor o hay demasiada humedad.',
      paraQue: 'Las estaciones meteorológicas alimentan los pronósticos del clima y alertan sobre heladas, olas de calor y tormentas. Hoy casi todas envían sus datos por red para verlos desde lejos. La tuya usa los mismos principios: sensores, un límite, una alarma y una pantalla remota.',
      duracion: '100 minutos',
    },
    piezas: [
      { nombre: 'Sensor DHT11', paraQue: 'Mide temperatura y humedad del aire.', cuidado: 'Lee las letras de sus pines; solo mide una vez cada dos segundos.' },
      { nombre: 'LDR con resistencia de 1 kΩ', paraQue: 'Mide cuánta luz hay en el ambiente.', cuidado: 'La señal sale de la fila donde se juntan la LDR y la resistencia.' },
      { nombre: 'Luz azul de la placa', paraQue: 'Ya viene soldada en el ESP32-C3. Encendida significa que todo está normal.', cuidado: 'No hay que conectar nada: el programa la controla por el pin GPIO8.' },
      { nombre: 'LED rojo con resistencia de 330 Ω', paraQue: 'Se enciende cuando algún valor está fuera de rango.', cuidado: 'Pata larga hacia la resistencia; pata corta a tierra.' },
      { nombre: 'Buzzer activo', paraQue: 'Suena junto con el LED rojo.', cuidado: 'La pata marcada con + va al pin de la placa.' },
      { nombre: 'Pulsador', paraQue: 'Activa o silencia el sonido de la alarma.' },
      { nombre: 'Un celular', paraQue: 'Es la pantalla de tu estación: se conecta por WiFi a la placa y muestra los datos.' },
      C3,
    ],
    pasos: [
      RIELES,
      { titulo: 'Conecta el sensor DHT11', texto: 'VCC a la línea roja, GND a la línea negra y DATA al pin GPIO3.', conexiones: [0, 1, 2] },
      { titulo: 'Conecta el sensor de luz', texto: 'Arma la LDR en fila con la resistencia de 1 kΩ, como en la práctica: pata libre de la LDR a la línea roja, pata libre de la resistencia a la línea negra y la unión de las dos al pin GPIO0.', conexiones: [3, 4, 5] },
      { titulo: 'Conecta el buzzer', texto: 'La pata marcada con + al pin GPIO4 y la otra a la línea negra.', conexiones: [6, 7] },
      { titulo: 'Arma el LED rojo', texto: 'Pata larga al pin GPIO5 pasando por la resistencia de 330 Ω. Pata corta a la línea negra.', conexiones: [8, 9] },
      { titulo: 'Conecta el pulsador', texto: 'Una pata al pin GPIO10 y la pata del lado opuesto a la línea negra.', conexiones: [10, 11] },
      { titulo: 'Ponle nombre a tu red y sube el programa', texto: 'En el programa cambia "Estacion-Grupo1" por el número de tu grupo, para no confundirte con las redes de tus compañeros. Conecta el USB-C, sube el programa y abre el Monitor Serial a 115200 baudios.' },
      { titulo: 'Abre la estación en el celular', texto: 'En el celular abre los ajustes de WiFi, conéctate a la red de tu grupo con la clave clima1234 y luego escribe 192.168.4.1 en el navegador.', consejo: 'Esa red no tiene Internet: el celular puede avisarlo y preguntar si quieres seguir conectado. Dile que sí. Si la página no abre, apaga los datos móviles un momento.' },
    ],
    codigo: [
      { titulo: 'La placa crea su propia red WiFi', texto: 'softAP convierte al ESP32 en un punto de acceso, como un router pequeño. No hace falta el WiFi del colegio ni Internet.', fragmento: 'WiFi.mode(WIFI_AP);\nWiFi.softAP(NOMBRE_RED, CLAVE_RED);' },
      { titulo: 'Una página web dentro de la placa', texto: 'servidor.on indica qué función responde cuando el celular pide la página. Esa función arma un texto en HTML con los datos del momento y lo envía.', fragmento: 'servidor.on("/", paginaPrincipal);\nservidor.begin();' },
      { titulo: 'Atender al celular sin detenerse', texto: 'handleClient revisa si alguien pidió la página. Debe ejecutarse muchas veces por segundo; por eso este programa no usa delay(2000).', fragmento: 'servidor.handleClient();' },
      { titulo: 'Medir cada 2 segundos con millis()', texto: 'millis() dice cuántos milisegundos lleva encendida la placa. Si ya pasaron 2000 desde la última lectura, se mide otra vez. Mientras tanto el programa sigue atendiendo al celular y al botón.', fragmento: 'if (millis() - ultimaLectura >= INTERVALO_MS) {\n  ultimaLectura = millis();\n  temperatura = dht.readTemperature();\n  humedad = dht.readHumidity();\n  luz = analogRead(PIN_LDR);' },
      { titulo: 'La decisión de alerta', texto: 'Hay alerta si la temperatura pasa de 28 grados, o si la humedad pasa de 70 %. isnan() descarta las lecturas fallidas para que un error del sensor no dispare la alarma.', fragmento: 'alerta = (!isnan(temperatura) && temperatura > TEMP_MAXIMA)\n      || (!isnan(humedad) && humedad > HUMEDAD_MAXIMA);' },
      { titulo: 'Avisar con luces y sonido', texto: 'Solo una de las dos luces está encendida a la vez. La luz azul de la placa funciona al revés que un LED normal: se enciende con LOW. El buzzer suena únicamente si hay alerta y el sonido no fue silenciado con el botón.', fragmento: 'digitalWrite(LED_ROJO, alerta ? HIGH : LOW);\ndigitalWrite(LED_PLACA, alerta ? HIGH : LOW);\nif (alerta && sonido) tone(BUZZER, 2000, 200);' },
    ],
    prueba: {
      queDebePasar: [
        'En la lista de redes WiFi del celular aparece la red de tu grupo.',
        'Al abrir 192.168.4.1 se ven la temperatura, la humedad y la luz, y la página se actualiza sola cada 3 segundos.',
        'Con valores normales está encendida la luz azul de la placa y la página dice "Todo normal".',
        'Al soplar aire caliente y húmedo sobre el DHT11, se apaga la luz azul, se enciende el LED rojo, suena el buzzer y la página dice "ALERTA".',
        'Al presionar el botón durante una alerta, el buzzer deja de sonar pero el LED rojo sigue encendido.',
      ],
      siNoFunciona: [
        { problema: 'La red no aparece en el celular', revisa: 'Comprueba en el Monitor Serial que el programa arrancó y muestra el nombre de la red. Acerca el celular a la placa: su antena es pequeña y alcanza pocos metros.' },
        { problema: 'El celular se conecta pero la página no abre', revisa: 'Escribe exactamente 192.168.4.1 en la barra de direcciones (no en el buscador) y apaga los datos móviles un momento.' },
        { problema: 'Temperatura y humedad salen como "nan"', revisa: 'El DHT11 no responde: revisa DATA en GPIO3 y que VCC y GND no estén invertidos.' },
        { problema: 'El LED rojo está siempre encendido', revisa: 'La temperatura del salón pasa de 28 grados o la humedad de 70 %. Sube TEMP_MAXIMA o HUMEDAD_MAXIMA en el programa.' },
        { problema: 'El LED rojo no enciende durante la alerta', revisa: 'Gíralo y comprueba que la resistencia de 330 Ω llega a GPIO5.' },
        { problema: 'La luz azul de la placa nunca enciende', revisa: 'Algunas placas traen esa luz en otro pin. Pide a tu docente que revise el número impreso junto a la luz y cambia LED_PLACA en el programa.' },
        NO_SERIAL, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Mejora tu página: agrega una línea que diga "Día" o "Noche" según la lectura de luz, usando los valores que anotaste en la práctica del sensor. Muéstrala funcionando en el celular de un compañero.',
      preguntas: [
        { pregunta: '¿Por qué la estación funciona sin Internet?', opciones: ['Porque usa Bluetooth', 'Porque la placa crea su propia red WiFi y el celular se conecta directo a ella', 'Porque guarda los datos en el celular'], correcta: 1, explicacion: 'softAP convierte al ESP32 en un punto de acceso, como un router pequeño.' },
        { pregunta: '¿Por qué se usa millis() en lugar de delay(2000)?', opciones: ['Porque es más corto de escribir', 'Porque con delay el programa se detiene y no puede atender al celular ni al botón', 'Porque el DHT11 lo exige'], correcta: 1, explicacion: 'millis() permite esperar sin detener el resto del programa.' },
        { pregunta: '¿Para qué sirve isnan() en la condición de alerta?', opciones: ['Para ignorar lecturas fallidas del sensor', 'Para medir más rápido', 'Para encender el LED'], correcta: 0, explicacion: 'Si el sensor falla devuelve "nan". Sin esa comprobación, el programa compararía con un valor inválido.' },
      ],
    },
  },
}
