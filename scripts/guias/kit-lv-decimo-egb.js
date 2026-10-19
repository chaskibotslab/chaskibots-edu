// Guías (método de 6 etapas) del kit de 10mo EGB — Sistema de riego inteligente con ESP32 DevKit V1.
// Clave = slug del proyecto en kit_proyectos. Se cargan con scripts/seed-kit-guias.js
// (o con el SQL que genera scripts/decimo-esp32.js).

const ESP = { nombre: 'ESP32 DevKit V1', paraQue: 'Es el cerebro. Lee los sensores y decide cuándo encender la bomba y las luces.', cuidado: 'Sus pines de señal trabajan a 3,3 V. El pin VIN entrega los 5 V que llegan por el USB y sirve solo para alimentar módulos, nunca como señal.' }
const PROTO = { nombre: 'Protoboard y cables jumper', paraQue: 'Sostienen las piezas y reparten corriente (línea roja) y tierra (línea negra) a todas.' }

const ESP_EN_PROTO = { titulo: 'Coloca el ESP32', texto: 'Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.', consejo: 'El ESP32 es ancho: en una protoboard de 400 puntos queda libre una sola fila de agujeros a cada lado. Conecta los cables en esa fila.' }
const RIELES_3V3 = { titulo: 'Reparte 3,3 V y tierra', texto: 'Une el pin 3V3 del ESP32 con la línea roja (+) de la protoboard y un pin GND con la línea negra (–). Usa cable rojo para 3,3 V y negro para tierra: así nunca los confundes.', rieles: ['3V3', 'GND'] }
const RIELES_VIN = { titulo: 'Reparte 5 V y tierra', texto: 'Une el pin VIN del ESP32 con la línea roja (+) y un pin GND con la línea negra (–). El relé necesita 5 V para mover su interruptor.', rieles: ['VIN', 'GND'] }
const TIERRA = { titulo: 'Lleva tierra a la línea negra', texto: 'Une un pin GND del ESP32 con la línea negra (–) de la protoboard.', rieles: ['GND'] }
const USB_SERIAL = { titulo: 'Conecta el USB y abre el Monitor Serial', texto: 'Conecta el ESP32 a la computadora con el cable V8. Después de subir el programa, abre el Monitor Serial (el ícono de lupa, arriba a la derecha) y elige 115200 baudios abajo a la derecha.' }

const NO_SUBE = { problema: 'El programa no se sube', revisa: 'En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto que aparece al conectar el cable. Si se queda en "Connecting…", mantén presionado el botón BOOT de la placa hasta que empiece a subir. Si no aparece ningún puerto, instala el controlador CP210x o CH340 y prueba otro cable: algunos cables V8 solo cargan.' }
const SIMBOLOS = { problema: 'Salen símbolos raros en lugar de números', revisa: 'La velocidad del Monitor Serial no coincide. Elige 115200 baudios abajo a la derecha.' }

module.exports = {
  'practica-humedad-suelo': {
    reto: {
      texto: 'Vas a convertir la humedad de la tierra en un número. Verás en la pantalla cómo cambia el valor cuando el sensor está al aire, en tierra seca y en tierra mojada.',
      paraQue: 'Los agricultores usan sensores de humedad para saber cuándo regar sin desperdiciar agua. Medir antes de actuar es la base de cualquier sistema automático.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'Sensor de humedad del suelo', paraQue: 'Tiene una punta que se entierra. Entrega un voltaje distinto según cuánta agua hay en la tierra.', cuidado: 'Entierra solo la punta, hasta la línea marcada. La parte de arriba, donde están los componentes y los pines, no debe mojarse.' },
      ESP, PROTO,
    ],
    pasos: [
      ESP_EN_PROTO,
      RIELES_3V3,
      { titulo: 'Dale energía al sensor', texto: 'Une el pin VCC del sensor con la línea roja (3,3 V) y el pin GND con la línea negra.', conexiones: [0, 1] },
      { titulo: 'Conecta la señal', texto: 'Une el pin AOUT del sensor con el pin GPIO34 del ESP32. Por ahí llega la medida.', conexiones: [2], consejo: 'GPIO34 es una entrada analógica: lee valores intermedios, no solo encendido o apagado. El sensor va a 3,3 V y no a 5 V para que su señal nunca pase de lo que aguanta el ESP32.' },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Un pin analógico', texto: 'En el ESP32 los pines se nombran con su número de GPIO. El 34 es una entrada analógica y no hace falta pinMode para leerla.', fragmento: 'const int SENSOR = 34;' },
      { titulo: 'analogRead(): leer un valor entre 0 y 4095', texto: 'A diferencia de digitalRead, que solo distingue HIGH o LOW, analogRead devuelve un número entre 0 y 4095 según el voltaje que llega al pin. El ESP32 mide con más detalle que un Arduino UNO, que llega solo a 1023.', fragmento: 'int valor = analogRead(SENSOR);' },
      { titulo: 'Mostrarlo en pantalla', texto: 'Se llama "crudo" porque es el número tal como lo entrega el sensor, sin convertir a porcentaje.', fragmento: 'Serial.print("Humedad (crudo): ");\nSerial.println(valor);\ndelay(300);' },
    ],
    prueba: {
      queDebePasar: [
        'En el Monitor Serial aparece una línea nueva unas tres veces por segundo con un número.',
        'Con el sensor al aire el número es alto; al meterlo en tierra mojada o en un vaso con agua, baja.',
        'Anota tres valores: al aire, en tierra seca y en tierra mojada. Los vas a necesitar en el proyecto.',
      ],
      siNoFunciona: [
        { problema: 'El número no cambia nunca', revisa: 'Comprueba que AOUT va al pin GPIO34, y que el sensor tiene energía (VCC a la línea roja y GND a la negra).' },
        { problema: 'El número sube cuando mojas en lugar de bajar', revisa: 'Algunos sensores funcionan al revés. No es un error: solo anótalo, porque en el proyecto habrá que invertir la comparación.' },
        SIMBOLOS,
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Haz que el programa escriba la palabra "SECO" cuando el valor pase del número que anotaste para tierra seca. Pista: usa if (valor > tuNumero) antes del delay.',
      preguntas: [
        { pregunta: '¿Qué diferencia hay entre analogRead y digitalRead?', opciones: ['analogRead da un número entre 0 y 4095; digitalRead solo HIGH o LOW', 'Son lo mismo', 'analogRead es más lento'], correcta: 0, explicacion: 'Una lectura analógica mide cuánto; una digital solo sí o no.' },
        { pregunta: '¿Por qué solo se entierra la punta del sensor?', opciones: ['Para que mida más rápido', 'Porque la parte de arriba tiene electrónica que se daña con el agua', 'Porque es más fácil de sacar'], correcta: 1, explicacion: 'El agua en los componentes o en los pines provoca cortocircuitos.' },
        { pregunta: 'Con este sensor, un valor alto significa que la tierra está…', opciones: ['Mojada', 'Seca', 'Caliente'], correcta: 1, explicacion: 'Menos agua entrega una lectura más alta. Por eso el riego se activa cuando el valor supera el límite.' },
      ],
    },
  },

  'practica-potenciometro': {
    reto: {
      texto: 'Vas a usar una perilla para enviarle un número al ESP32: al girarla, el valor en pantalla sube o baja entre 0 y 4095. La usarás en el proyecto Mini invernadero, para ajustar cuándo regar sin volver a programar.',
      paraQue: 'El control de volumen de un parlante, la perilla de una cocina o el regulador de luz de un cuarto funcionan así. Una perilla permite ajustar una máquina sin volver a programarla.',
      duracion: '25 minutos',
    },
    piezas: [
      { nombre: 'Potenciómetro de 10 kΩ', paraQue: 'Es una resistencia que cambia al girar la perilla. La pata del centro entrega un voltaje entre 0 y 3,3 V según la posición.', cuidado: 'Tiene 3 patas. Las de los extremos van a 3,3 V y a tierra; la del centro es la señal.' },
      ESP, PROTO,
    ],
    pasos: [
      ESP_EN_PROTO,
      RIELES_3V3,
      { titulo: 'Conecta los extremos', texto: 'Coloca el potenciómetro con cada pata en una fila distinta. Une una pata del extremo con la línea roja (3,3 V) y la del otro extremo con la línea negra (–).', conexiones: [0, 2] },
      { titulo: 'Conecta la pata del centro', texto: 'Une la pata del centro con el pin GPIO35 del ESP32.', conexiones: [1], consejo: 'Si luego el valor sube al girar hacia el lado contrario al que esperabas, intercambia los dos cables de los extremos.' },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'El pin de la perilla', texto: 'Se usa el GPIO35 porque el 34 ya lo ocupa el sensor de humedad.', fragmento: 'const int POT = 35;' },
      { titulo: 'Leer la posición', texto: 'Con la perilla en un extremo lee cerca de 0; en el otro, cerca de 4095; a la mitad, alrededor de 2048.', fragmento: 'int valor = analogRead(POT);' },
      { titulo: 'Mostrar el valor', texto: 'El texto dice "Umbral" porque en el Mini invernadero este número será el límite que decide cuándo regar.', fragmento: 'Serial.print("Umbral (0-4095): ");\nSerial.println(valor);\ndelay(300);' },
    ],
    prueba: {
      queDebePasar: [
        'Al girar la perilla, el número cambia de forma suave entre 0 y 4095.',
        'Si no tocas la perilla, el número se queda casi quieto (puede variar 1 o 2 unidades).',
      ],
      siNoFunciona: [
        { problema: 'Siempre marca 0 o siempre 4095', revisa: 'La pata del centro no está llegando a GPIO35, o conectaste al centro uno de los cables de energía.' },
        { problema: 'El número salta sin tocar la perilla', revisa: 'Falta uno de los extremos: revisa que uno va a la línea roja y el otro a la negra.' },
        SIMBOLOS,
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Convierte el valor a porcentaje: que la pantalla muestre de 0 a 100. Pista: usa map(valor, 0, 4095, 0, 100).',
      preguntas: [
        { pregunta: '¿Qué pata del potenciómetro va al pin analógico?', opciones: ['La de la izquierda', 'La del centro', 'La de la derecha'], correcta: 1, explicacion: 'La pata del centro entrega el voltaje que cambia al girar.' },
        { pregunta: '¿Qué valor lee el ESP32 con la perilla a la mitad?', opciones: ['Cerca de 0', 'Cerca de 2048', 'Cerca de 4095'], correcta: 1, explicacion: 'El rango va de 0 a 4095; la mitad es aproximadamente 2048.' },
        { pregunta: '¿Qué ventaja tiene usar una perilla para ajustar el riego?', opciones: ['Se puede cambiar el límite sin volver a programar', 'Gasta menos agua', 'Hace que el sensor mida mejor'], correcta: 0, explicacion: 'Cada planta necesita distinta humedad. Con la perilla ajustas el sistema en el momento.' },
      ],
    },
  },

  'practica-rele': {
    reto: {
      texto: 'Vas a hacer que el ESP32 accione un interruptor: escucharás un "clic" cada segundo y verás encenderse la luz del módulo. Ese interruptor es el que después encenderá la bomba de agua.',
      paraQue: 'Una placa como el ESP32 solo puede entregar muy poca corriente; no puede mover un motor directamente. El relé resuelve eso: una señal pequeña controla un interruptor por donde pasa una corriente grande. Así se encienden focos, bombas y electrodomésticos desde un programa.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'Módulo relé de 1 canal', paraQue: 'Es un interruptor que se acciona con electricidad. De un lado tiene 3 pines para la placa (VCC, GND, IN) y del otro 3 bornes con tornillo para lo que se quiere encender.', cuidado: 'En esta práctica solo se usa el lado de los 3 pines. No conectes nada a los bornes con tornillo todavía.' },
      ESP, PROTO,
    ],
    pasos: [
      ESP_EN_PROTO,
      RIELES_VIN,
      { titulo: 'Dale energía al relé', texto: 'Une el pin VCC del módulo con la línea roja (5 V) y el pin GND con la línea negra.', conexiones: [1, 2] },
      { titulo: 'Conecta la señal', texto: 'Une el pin IN del módulo con el pin GPIO26 del ESP32. Por ahí llega la orden de encender o apagar.', conexiones: [0] },
      { titulo: 'Conecta el USB', texto: 'Conecta el ESP32 a la computadora y sube el programa.' },
    ],
    codigo: [
      { titulo: 'El relé es una salida', texto: 'Para el ESP32, accionar un relé es igual que encender un LED: enviar HIGH o LOW por un pin.', fragmento: 'const int RELE = 26;\n\nvoid setup() {\n  pinMode(RELE, OUTPUT);\n}' },
      { titulo: 'Encender y apagar', texto: 'Cada cambio hace sonar el "clic": es una lámina de metal moviéndose dentro del relé para cerrar o abrir el interruptor.', fragmento: 'digitalWrite(RELE, HIGH);\ndelay(1000);\ndigitalWrite(RELE, LOW);\ndelay(1000);' },
    ],
    prueba: {
      queDebePasar: [
        'Se escucha un "clic" cada segundo.',
        'La luz del módulo se enciende y se apaga al mismo ritmo.',
      ],
      siNoFunciona: [
        { problema: 'No hay clic ni luz', revisa: 'El módulo no tiene energía o la señal no llega: VCC a la línea roja (VIN, 5 V), GND a la negra e IN al pin GPIO26.' },
        { problema: 'La luz cambia pero no suena', revisa: 'Al relé le falta corriente. Usa otro puerto USB o el cargador de celular.' },
        { problema: 'El ESP32 se reinicia con cada clic', revisa: 'La bobina del relé consume mucho al activarse. Usa un cable USB corto y en buen estado.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Cambia los tiempos para que el relé quede encendido 4 segundos y apagado 10. Así riega tu sistema: unos segundos de agua y una pausa larga.',
      preguntas: [
        { pregunta: '¿Por qué no se conecta la bomba directo a un pin del ESP32?', opciones: ['Porque la bomba necesita más corriente de la que un pin puede dar', 'Porque la bomba es muy pequeña', 'Porque el ESP32 no tiene suficientes pines'], correcta: 0, explicacion: 'Un pin entrega muy poca corriente. Conectar un motor directo puede dañar la placa.' },
        { pregunta: '¿Qué produce el "clic" del relé?', opciones: ['Un parlante', 'Una lámina de metal que se mueve para cerrar o abrir el interruptor', 'El programa'], correcta: 1, explicacion: 'Dentro hay un electroimán que mueve un contacto metálico.' },
        { pregunta: 'Para el programa, accionar un relé se parece a…', opciones: ['Leer un sensor', 'Encender un LED', 'Abrir el Monitor Serial'], correcta: 1, explicacion: 'En ambos casos se usa digitalWrite con HIGH o LOW sobre una salida.' },
      ],
    },
  },

  'practica-pulsador-manual': {
    reto: {
      texto: 'Vas a encender una luz con un botón: mientras lo mantienes presionado, el LED rojo se enciende; al soltarlo, se apaga. Ese LED será la luz de "regando" de tu sistema de riego.',
      paraQue: 'Un timbre, el botón de un ascensor o el control de un juego funcionan así: una entrada (el botón) decide lo que hace una salida (la luz). Es la base de cualquier máquina que responde a una persona.',
      duracion: '25 minutos',
    },
    piezas: [
      { nombre: 'Pulsador', paraQue: 'Es un interruptor que solo deja pasar corriente mientras lo presionas.', cuidado: 'Tiene 4 patas unidas de dos en dos. Colócalo a caballo sobre el canal central y usa dos patas de lados opuestos.' },
      { nombre: 'LED rojo con resistencia de 330 Ω', paraQue: 'El LED da la luz. La resistencia limita la corriente para que no se queme.', cuidado: 'El LED tiene una pata larga (+) y una corta (–). Si lo pones al revés no enciende.' },
      ESP, PROTO,
    ],
    pasos: [
      ESP_EN_PROTO,
      TIERRA,
      { titulo: 'Conecta el pulsador', texto: 'Pon el pulsador a caballo sobre el canal central. Une una pata con el pin GPIO27 del ESP32 y la pata del lado opuesto con la línea negra (–).', conexiones: [0, 1], consejo: 'No necesitas resistencia para el pulsador: el programa activa una que el ESP32 ya trae por dentro.' },
      { titulo: 'Arma el LED rojo', texto: 'Une el pin GPIO25 con la pata larga del LED pasando por la resistencia de 330 Ω. Une la pata corta con la línea negra (–).', conexiones: [2, 3] },
      { titulo: 'Conecta el USB', texto: 'Conecta el ESP32 a la computadora y sube el programa.' },
    ],
    codigo: [
      { titulo: 'Una entrada y una salida', texto: 'El pulsador es una entrada: el ESP32 lo lee. El LED es una salida: el ESP32 lo enciende. INPUT_PULLUP activa una resistencia interna que mantiene el pin en HIGH mientras nadie presiona.', fragmento: 'pinMode(PULSADOR, INPUT_PULLUP);\npinMode(LED, OUTPUT);' },
      { titulo: 'Leer el botón', texto: 'Con INPUT_PULLUP, presionado se lee como LOW, porque al presionar el pin queda unido a tierra.', fragmento: 'bool presionado = (digitalRead(PULSADOR) == LOW);' },
      { titulo: 'Encender según el botón', texto: 'El signo ? elige entre dos opciones: si presionado es verdadero se envía HIGH (encendido); si no, LOW (apagado).', fragmento: 'digitalWrite(LED, presionado ? HIGH : LOW);' },
    ],
    prueba: {
      queDebePasar: [
        'Con el botón suelto, el LED está apagado.',
        'Mientras lo mantienes presionado, el LED rojo se enciende.',
        'Al soltarlo, el LED se apaga de inmediato.',
      ],
      siNoFunciona: [
        { problema: 'El LED está siempre encendido', revisa: 'Estás usando dos patas del pulsador que ya están unidas por dentro. Gíralo un cuarto de vuelta.' },
        { problema: 'El LED nunca enciende', revisa: 'Gira el LED: la pata larga va hacia la resistencia. Comprueba que la resistencia llega al pin GPIO25 y que la línea negra llega a GND.' },
        { problema: 'El botón no hace nada', revisa: 'Comprueba que una pata va al pin GPIO27 y la del lado opuesto a la línea negra.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Invierte el comportamiento: que el LED esté encendido siempre y se apague mientras presionas. Pista: intercambia HIGH y LOW.',
      preguntas: [
        { pregunta: 'Con INPUT_PULLUP, ¿qué se lee al presionar?', opciones: ['HIGH', 'LOW', 'Un número entre 0 y 4095'], correcta: 1, explicacion: 'El pin queda unido a tierra y se lee LOW.' },
        { pregunta: '¿Para qué sirve la resistencia de 330 Ω?', opciones: ['Para que el LED brille más', 'Para limitar la corriente y que el LED no se queme', 'Para que el botón funcione'], correcta: 1, explicacion: 'Sin resistencia pasaría demasiada corriente por el LED.' },
        { pregunta: '¿Cuál de estas piezas es una entrada?', opciones: ['El LED', 'El pulsador', 'La resistencia'], correcta: 1, explicacion: 'El ESP32 lee el pulsador (entrada) y enciende el LED (salida).' },
      ],
    },
  },

  'sistema-riego-automatico': {
    reto: {
      texto: 'Vas a construir un sistema que cuida una planta solo: mide la humedad de la tierra, y cuando está seca enciende una bomba que la riega durante 4 segundos. Una luz roja avisa que está regando y una verde que la planta tiene suficiente agua.',
      paraQue: 'El riego automático se usa en invernaderos y cultivos para dar a cada planta el agua justa. Ahorra agua, evita que las plantas se sequen cuando nadie está y es un ejemplo completo de automatización: medir, decidir y actuar.',
      duracion: '70 minutos',
    },
    piezas: [
      { nombre: 'Sensor de humedad del suelo', paraQue: 'Mide cuánta agua hay en la tierra. Es el "sentido" del sistema.', cuidado: 'Entierra solo la punta; la parte de arriba no debe mojarse.' },
      { nombre: 'Módulo relé y bomba de agua', paraQue: 'El relé es el interruptor que el ESP32 acciona; la bomba impulsa el agua por la manguera.', cuidado: 'La bomba debe estar sumergida antes de encenderla: en seco se daña. Mantén el recipiente de agua lejos de la protoboard y del ESP32.' },
      { nombre: 'LED rojo y LED verde', paraQue: 'Rojo: está regando. Verde: la tierra tiene suficiente agua.', cuidado: 'Pata larga hacia la resistencia de 330 Ω; pata corta a tierra.' },
      ESP,
    ],
    pasos: [
      { titulo: 'Reparte las tres líneas de energía', texto: 'Este proyecto usa dos voltajes. Une un pin GND con la línea negra (–). Lleva VIN (5 V) a la línea roja de un lado de la protoboard y 3V3 a la línea roja del otro lado.', rieles: ['VIN', '3V3', 'GND'], consejo: 'Marca con cinta cuál línea roja es de 5 V y cuál de 3,3 V. El sensor va a 3,3 V y el relé a 5 V.' },
      { titulo: 'Conecta el sensor de humedad', texto: 'VCC a la línea de 3,3 V, GND a la línea negra y AOUT al pin GPIO34.', conexiones: [0, 1, 2] },
      { titulo: 'Conecta el módulo relé', texto: 'VCC a la línea de 5 V (VIN), GND a la línea negra e IN al pin GPIO26.', conexiones: [3, 4, 5] },
      { titulo: 'Arma el LED rojo', texto: 'Pata larga al pin GPIO25 pasando por una resistencia de 330 Ω. Pata corta a la línea negra.', conexiones: [8, 9] },
      { titulo: 'Arma el LED verde', texto: 'Pata larga al pin GPIO33 pasando por una resistencia de 330 Ω. Pata corta a la línea negra.', conexiones: [10, 11] },
      { titulo: 'Conecta la bomba con ayuda de tu docente', texto: 'El positivo de la bomba no va directo a su fuente de energía: pasa por los bornes con tornillo del relé (COM y NO), que funcionan como un interruptor. El negativo de la bomba va a tierra, junto con el GND del ESP32. Hazlo con todo desconectado y pide a tu docente que lo revise antes de encender.', conexiones: [6, 7], consejo: 'Prueba primero todo el sistema sin agua: debes escuchar el clic del relé. Solo después sumerge la bomba.' },
    ],
    codigo: [
      { titulo: 'El límite de "tierra seca"', texto: 'Este número decide cuándo regar. Cámbialo por el valor que anotaste en la práctica del sensor para tierra seca.', fragmento: 'const int UMBRAL_SECO = 2400;' },
      { titulo: 'Medir', texto: 'En cada vuelta se lee el sensor y se muestra el valor en el Monitor Serial. Es la mejor herramienta para entender por qué riega o no riega.', fragmento: 'int humedad = analogRead(SENSOR_HUMEDAD);\nSerial.print("Humedad: ");\nSerial.println(humedad);' },
      { titulo: 'Decidir y regar', texto: 'Si la tierra está más seca que el límite, se apaga el verde, se enciende el rojo y se activa el relé. La bomba funciona 4 segundos y se apaga.', fragmento: 'if (humedad > UMBRAL_SECO) {\n  digitalWrite(LED_VERDE, LOW);\n  digitalWrite(LED_ROJO, HIGH);\n  digitalWrite(RELE_BOMBA, HIGH);\n  delay(TIEMPO_RIEGO_MS);\n  digitalWrite(RELE_BOMBA, LOW);\n  digitalWrite(LED_ROJO, LOW);' },
      { titulo: 'Esperar a que el agua llegue', texto: 'El agua tarda unos segundos en repartirse por la tierra. Sin esta pausa el sensor seguiría marcando "seco" y la bomba volvería a regar enseguida.', fragmento: '  delay(TIEMPO_ESPERA_MS);\n}' },
      { titulo: 'Todo bien', texto: 'Si la tierra no está seca, la planta tiene suficiente agua: luz verde.', fragmento: 'else {\n  digitalWrite(LED_VERDE, HIGH);\n}' },
    ],
    prueba: {
      queDebePasar: [
        'Con el sensor en tierra húmeda se enciende el LED verde y la bomba está apagada.',
        'Al sacar el sensor al aire, se apaga el verde, se enciende el rojo, el relé hace clic y la bomba funciona 4 segundos.',
        'Después de regar espera 5 segundos antes de volver a medir.',
        'En el Monitor Serial aparece el valor de humedad en cada vuelta.',
      ],
      siNoFunciona: [
        { problema: 'Riega sin parar', revisa: 'El límite está muy bajo. Abre el Monitor Serial, mira el valor en tierra húmeda y pon en UMBRAL_SECO un número mayor que ese.' },
        { problema: 'Nunca riega', revisa: 'El límite está muy alto, o tu sensor funciona al revés (el número sube al mojar). En ese caso cambia humedad > UMBRAL_SECO por humedad < UMBRAL_SECO.' },
        { problema: 'El relé hace clic pero la bomba no gira', revisa: 'Revisa los bornes con tornillo del relé (COM y NO) y la fuente de la bomba. Comprueba que la bomba está sumergida.' },
        { problema: 'El ESP32 se reinicia al encender la bomba', revisa: 'La bomba consume demasiado para compartir la energía del USB. Usa un cargador de celular de al menos 1 A. Pide a tu docente alimentarla con una fuente aparte, uniendo las tierras.' },
        { problema: 'Un LED no enciende', revisa: 'Gíralo y revisa su resistencia. Rojo al GPIO25 y verde al GPIO33.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Calibra tu sistema para una planta real: anota la lectura con la tierra recién regada y con la tierra seca, y pon en UMBRAL_SECO el punto intermedio. Explica a un compañero cómo elegiste ese valor.',
      preguntas: [
        { pregunta: '¿Qué hace el sistema cuando humedad > UMBRAL_SECO?', opciones: ['Enciende el LED verde', 'Enciende la bomba y el LED rojo', 'Se apaga'], correcta: 1, explicacion: 'Un valor mayor que el límite significa tierra seca: hay que regar.' },
        { pregunta: '¿Para qué sirve la pausa después de regar?', opciones: ['Para ahorrar energía', 'Para dar tiempo a que el agua llegue al sensor antes de volver a medir', 'Para que el LED descanse'], correcta: 1, explicacion: 'Sin esa pausa el sensor seguiría marcando seco y se regaría de más.' },
        { pregunta: '¿Por qué la bomba se enciende a través de un relé?', opciones: ['Porque el ESP32 no puede entregar la corriente que necesita un motor', 'Para que haga ruido', 'Porque es más barato'], correcta: 0, explicacion: 'El relé permite que una señal pequeña controle una corriente grande.' },
      ],
    },
  },
}
