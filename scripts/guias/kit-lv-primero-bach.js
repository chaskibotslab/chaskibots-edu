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
      { nombre: 'Sensor de luz (LDR)', paraQue: 'Es una resistencia que cambia con la luz. Conectada a 3,3 V y a tierra, entrega en su punto medio un voltaje que depende de la iluminación.', cuidado: 'Tiene tres conexiones: una a 3,3 V, una a tierra y la del medio, que es la señal.' },
      C3, PROTO,
    ],
    pasos: [
      PLACA,
      RIELES,
      { titulo: 'Dale energía al sensor', texto: 'Une el terminal superior del sensor con la línea roja (3,3 V) y el terminal inferior con la línea negra.', conexiones: [0, 2] },
      { titulo: 'Conecta la señal', texto: 'Une el punto medio del sensor con el pin GPIO0 de la placa. Ese pin puede leer valores analógicos.', conexiones: [1] },
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
        'Anota el valor con luz normal y con el sensor tapado.',
      ],
      siNoFunciona: [
        { problema: 'El número no cambia al tapar el sensor', revisa: 'La señal no sale del punto medio. Revisa que el cable de GPIO0 esté en la conexión central y no en un extremo.' },
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
      texto: 'Vas a hacer que un solo botón recorra tres opciones: cada vez que lo presionas, la pantalla muestra Modo 0, Modo 1, Modo 2 y vuelve a 0. Así podrás elegir qué dato muestra tu estación.',
      paraQue: 'Muchos aparatos tienen un botón "modo": un reloj digital, un ventilador con tres velocidades, una linterna con varias intensidades. Un botón y un contador bastan para manejar varias funciones.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'Pulsador', paraQue: 'Es un interruptor que solo deja pasar corriente mientras lo presionas.', cuidado: 'Colócalo a caballo sobre el canal central y usa dos patas de lados opuestos.' },
      C3, PROTO,
    ],
    pasos: [
      PLACA,
      TIERRA,
      { titulo: 'Conecta el pulsador', texto: 'Une una pata del pulsador con el pin GPIO10 y la pata del lado opuesto con la línea negra (–).', conexiones: [0, 1] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Dos variables que recuerdan', texto: 'modo guarda en qué opción estás. anterior guarda cómo estaba el botón en la vuelta pasada: empieza en HIGH, es decir, suelto.', fragmento: 'int modo = 0;\nbool anterior = HIGH;' },
      { titulo: 'Detectar el momento de presionar', texto: 'No basta con saber si está presionado: hay que detectar el instante en que pasa de suelto a presionado. Así, mantener el dedo no cuenta varias veces.', fragmento: 'bool actual = digitalRead(PULSADOR);\nif (actual == LOW && anterior == HIGH) {' },
      { titulo: 'Avanzar y dar la vuelta', texto: 'El símbolo % da el resto de una división. Al sumar 1 y tomar el resto entre 3, el contador hace 0, 1, 2, 0, 1, 2…', fragmento: 'modo = (modo + 1) % 3;' },
      { titulo: 'Guardar el estado para la próxima vuelta', texto: 'Al final de cada vuelta, lo actual pasa a ser lo anterior.', fragmento: 'anterior = actual;' },
    ],
    prueba: {
      queDebePasar: [
        'Al presionar una vez aparece "Modo: 1"; otra vez, "Modo: 2"; otra, "Modo: 0".',
        'Mantener el botón presionado no hace avanzar el modo.',
      ],
      siNoFunciona: [
        { problema: 'Con una pulsación avanza dos o tres modos', revisa: 'Es el "rebote" del botón: al presionar, el contacto vibra. Agrega delay(50) al final de loop().' },
        { problema: 'No aparece nada al presionar', revisa: 'Comprueba que una pata va a GPIO10 y la otra a la línea negra.' },
        { problema: 'El modo cambia solo', revisa: 'Falta INPUT_PULLUP en pinMode, o usaste dos patas del pulsador que ya están unidas.' },
        NO_SERIAL, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Cambia el programa para que tenga cinco modos en lugar de tres, y que escriba un nombre para cada uno (por ejemplo "Temperatura", "Humedad", "Luz"…).',
      preguntas: [
        { pregunta: '¿Para qué sirve la variable anterior?', opciones: ['Para contar segundos', 'Para saber si el botón acaba de ser presionado y no solo si está presionado', 'Para encender un LED'], correcta: 1, explicacion: 'Comparar el estado actual con el anterior permite detectar el instante del cambio.' },
        { pregunta: '¿Cuánto vale (2 + 1) % 3?', opciones: ['0', '1', '3'], correcta: 0, explicacion: '3 dividido para 3 da resto 0. Por eso después del modo 2 vuelve al 0.' },
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
      texto: 'Vas a construir una estación que vigila el ambiente: mide temperatura, humedad y luz, lo muestra en pantalla, y enciende una luz y una alarma cuando hace demasiado calor o hay demasiada humedad. Con una perilla ajustas a partir de qué temperatura avisa, y con un botón eliges qué dato ver.',
      paraQue: 'Las estaciones meteorológicas alimentan los pronósticos del clima y alertan sobre heladas, olas de calor y tormentas. La tuya usa los mismos principios: sensores, un límite y una alarma.',
      duracion: '90 minutos',
    },
    piezas: [
      { nombre: 'Sensor DHT11', paraQue: 'Mide temperatura y humedad del aire.', cuidado: 'Lee las letras de sus pines; solo mide una vez cada dos segundos.' },
      { nombre: 'Sensor de luz (LDR)', paraQue: 'Mide cuánta luz hay en el ambiente.', cuidado: 'La señal sale de la conexión central.' },
      { nombre: 'Potenciómetro', paraQue: 'Ajusta la temperatura a partir de la cual suena la alarma, entre 20 y 35 grados.', cuidado: 'Extremos a 3,3 V y tierra; centro a la señal.' },
      { nombre: 'LED de alerta con resistencia de 330 Ω', paraQue: 'Se enciende cuando algún valor está fuera de rango.', cuidado: 'Pata larga hacia la resistencia; pata corta a tierra.' },
      { nombre: 'Buzzer activo', paraQue: 'Suena junto con el LED de alerta.', cuidado: 'La pata marcada con + va al pin de la placa.' },
      { nombre: 'Pulsador', paraQue: 'Cambia entre ver temperatura y humedad, o ver el nivel de luz.' },
      C3,
    ],
    pasos: [
      RIELES,
      { titulo: 'Conecta el sensor de luz', texto: 'Terminal superior a la línea roja, terminal inferior a la línea negra y punto medio al pin GPIO0.', conexiones: [0, 1, 3] },
      { titulo: 'Conecta el potenciómetro', texto: 'Un extremo a la línea roja, el otro a la línea negra y la pata del centro al pin GPIO1.', conexiones: [2, 4, 5] },
      { titulo: 'Conecta el sensor DHT11', texto: 'VCC a la línea roja, GND a la línea negra y DATA al pin GPIO3.', conexiones: [6, 7, 8] },
      { titulo: 'Conecta el buzzer', texto: 'La pata marcada con + al pin GPIO4 y la otra a la línea negra.', conexiones: [9, 10] },
      { titulo: 'Arma el LED de alerta', texto: 'Pata larga al pin GPIO5 pasando por la resistencia de 330 Ω. Pata corta a la línea negra.', conexiones: [11, 12] },
      { titulo: 'Conecta el pulsador', texto: 'Una pata al pin GPIO10 y la pata del lado opuesto a la línea negra.', conexiones: [13, 14] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Leer todos los sensores', texto: 'En cada vuelta se piden las tres medidas: dos al DHT11 y una al sensor de luz.', fragmento: 'float temperatura = dht.readTemperature();\nfloat humedad = dht.readHumidity();\nint luz = analogRead(PIN_LDR);' },
      { titulo: 'La perilla define el límite', texto: 'map() convierte el giro de la perilla (0 a 4095) en una temperatura entre 20 y 35 grados. Ese será el límite de la alarma.', fragmento: 'int sensibilidad = map(analogRead(PIN_POT), 0, 4095, 20, 35);' },
      { titulo: 'El botón cambia lo que se muestra', texto: 'mostrarLuz es un interruptor en el programa. El signo ! lo invierte: de falso a verdadero y al revés. La pausa de 300 ms evita que una sola pulsación cuente dos veces.', fragmento: 'if (digitalRead(PULSADOR) == LOW) {\n  mostrarLuz = !mostrarLuz;\n  delay(300);\n}' },
      { titulo: 'La decisión de alerta', texto: 'Hay alerta si la temperatura supera el límite de la perilla, o si la humedad pasa de 70 %. isnan() descarta las lecturas fallidas para que un error del sensor no dispare la alarma.', fragmento: 'bool alerta = (!isnan(temperatura) && temperatura > sensibilidad)\n           || (!isnan(humedad) && humedad > 70);' },
      { titulo: 'Avisar', texto: 'El LED queda encendido mientras dure la alerta y el buzzer da un pitido corto en cada lectura.', fragmento: 'digitalWrite(LED_ALERTA, alerta ? HIGH : LOW);\nif (alerta) tone(BUZZER, 2000, 200);' },
    ],
    prueba: {
      queDebePasar: [
        'Cada dos segundos aparece la temperatura y la humedad en el Monitor Serial.',
        'Al presionar el botón, la pantalla pasa a mostrar el nivel de luz; al presionarlo otra vez, vuelve a temperatura y humedad.',
        'Al girar la perilla hasta un límite menor que la temperatura actual, se enciende el LED y suena el buzzer.',
        'Al subir el límite por encima de la temperatura, la alerta se apaga.',
      ],
      siNoFunciona: [
        { problema: 'Temperatura y humedad salen como "nan"', revisa: 'El DHT11 no responde: revisa DATA en GPIO3 y que VCC y GND no estén invertidos.' },
        { problema: 'La alarma suena todo el tiempo', revisa: 'El límite está por debajo de la temperatura del salón, o la humedad pasa de 70 %. Gira la perilla; si sigue, sube el 70 del programa a 85.' },
        { problema: 'El botón tarda en responder', revisa: 'Es normal: el programa espera 2 segundos en cada vuelta. Mantén presionado hasta que cambie.' },
        { problema: 'El LED no enciende durante la alerta', revisa: 'Gira el LED y comprueba que la resistencia llega a GPIO5.' },
        NO_SERIAL, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Registra tu estación durante un recreo: anota la temperatura y la humedad cada cinco minutos y dibuja un gráfico. ¿En qué momento cambió más y por qué?',
      preguntas: [
        { pregunta: '¿Para qué sirve isnan() en la condición de alerta?', opciones: ['Para ignorar lecturas fallidas del sensor', 'Para medir más rápido', 'Para encender el LED'], correcta: 0, explicacion: 'Si el sensor falla devuelve "nan". Sin esa comprobación, el programa compararía con un valor inválido.' },
        { pregunta: '¿Qué hace mostrarLuz = !mostrarLuz?', opciones: ['Apaga la luz', 'Invierte el valor: de falso a verdadero y de verdadero a falso', 'Borra la variable'], correcta: 1, explicacion: 'El signo ! significa "lo contrario de".' },
        { pregunta: '¿Qué ajusta la perilla en este proyecto?', opciones: ['El volumen del buzzer', 'La temperatura a partir de la cual se activa la alerta', 'La velocidad de lectura'], correcta: 1, explicacion: 'map() convierte su posición en un límite entre 20 y 35 grados.' },
      ],
    },
  },
}
