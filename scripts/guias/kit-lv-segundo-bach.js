// Guías (método de 6 etapas) del kit de 2do BGU — Domótica inteligente con ESP32.
// Clave = slug del proyecto en kit_proyectos. Se cargan con scripts/seed-kit-guias.js.

const ESP = { nombre: 'ESP32 DevKit V1', paraQue: 'Es el cerebro. Lee los sensores y decide cuándo accionar el relé. Trae WiFi y Bluetooth integrados.', cuidado: 'Sus pines de señal trabajan a 3,3 V. El pin VIN entrega los 5 V que llegan por el USB y sirve solo para alimentar módulos, nunca como señal.' }
const PROTO = { nombre: 'Protoboard y cables jumper', paraQue: 'Sostienen las piezas y reparten energía y tierra.' }

const PLACA = { titulo: 'Coloca el ESP32', texto: 'Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Es una placa ancha: debe quedar al menos una fila de agujeros libre a cada lado.', consejo: 'Si no queda ninguna fila libre de un lado, conecta en ese lado usando jumper macho-hembra directamente a los pines.' }
const TIERRA = { titulo: 'Lleva tierra a la línea negra', texto: 'Une un pin GND del ESP32 con la línea negra (–) de la protoboard.', rieles: ['GND'] }
const USB_SERIAL = { titulo: 'Conecta el USB y abre el Monitor Serial', texto: 'Conecta el ESP32 a la computadora. Después de subir el programa, abre el Monitor Serial y elige 115200 baudios.' }

const NO_SUBE = { problema: 'El programa no se sube', revisa: 'En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto correcto. Si se queda en "Connecting…", mantén presionado el botón BOOT de la placa hasta que empiece a subir.' }
const SIMBOLOS = { problema: 'Salen símbolos raros en el Monitor Serial', revisa: 'Elige 115200 baudios abajo a la derecha.' }

const AVISO_110 = 'Todo lo que lleve 110 V (enchufe, cable gemelo, boquilla y foco) lo conecta únicamente tu docente. Tú trabajas solo con el lado de bajo voltaje.'

module.exports = {
  'practica-pir': {
    reto: {
      texto: 'Vas a hacer que tu placa "vea" cuando alguien se mueve cerca, sin cámara. La pantalla mostrará "Movimiento detectado" cuando pases la mano frente al sensor.',
      paraQue: 'Los sensores de movimiento encienden la luz de un pasillo cuando entras, activan alarmas y abren puertas automáticas. Detectan el calor que emite el cuerpo humano al moverse.',
      duracion: '35 minutos',
    },
    piezas: [
      { nombre: 'Sensor PIR HC-SR501', paraQue: 'Detecta el calor en movimiento de personas y animales, hasta unos 6 metros. Su salida pasa a HIGH cuando detecta algo.', cuidado: 'Al encenderlo necesita cerca de un minuto para estabilizarse. Tiene dos perillas naranjas: una ajusta el alcance y la otra cuánto tiempo mantiene la señal.' },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      { titulo: 'Reparte 5 V y tierra', texto: 'Une el pin VIN del ESP32 con la línea roja (+) de la protoboard y un pin GND con la línea negra (–). El PIR necesita 5 V para funcionar bien.', rieles: ['VIN', 'GND'] },
      { titulo: 'Dale energía al sensor', texto: 'Con jumper macho-hembra, une el pin VCC del PIR con la línea roja y el pin GND con la línea negra.', conexiones: [0, 1], consejo: 'Los nombres de los pines suelen estar debajo de la cúpula blanca; puedes retirarla con cuidado para leerlos.' },
      { titulo: 'Conecta la señal', texto: 'Une el pin OUT del PIR (el del centro) con el pin GPIO27 del ESP32.', conexiones: [2] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'El sensor es una entrada digital', texto: 'El PIR solo dice sí o no: hay movimiento o no lo hay.', fragmento: 'const int PIN_PIR = 27;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(PIN_PIR, INPUT);\n}' },
      { titulo: 'Leer y guardar la respuesta', texto: 'La comparación devuelve verdadero o falso, y ese resultado se guarda en una variable con un nombre claro.', fragmento: 'bool movimiento = digitalRead(PIN_PIR) == HIGH;' },
      { titulo: 'Escribir un mensaje según el caso', texto: 'La forma condición ? A : B elige entre dos textos en una sola línea.', fragmento: 'Serial.println(movimiento ? "Movimiento detectado" : "Sin movimiento");\ndelay(300);' },
    ],
    prueba: {
      queDebePasar: [
        'Durante el primer minuto el sensor puede marcar movimiento sin motivo: es normal mientras se estabiliza.',
        'Después, con todos quietos, aparece "Sin movimiento".',
        'Al pasar la mano frente a la cúpula aparece "Movimiento detectado" y se mantiene unos segundos.',
      ],
      siNoFunciona: [
        { problema: 'Siempre dice "Movimiento detectado"', revisa: 'Espera un minuto completo sin moverte. Si sigue, gira la perilla de tiempo al mínimo (en sentido contrario al reloj).' },
        { problema: 'Nunca detecta', revisa: 'Comprueba que el PIR recibe 5 V desde VIN y no 3,3 V, y que OUT va a GPIO27.' },
        { problema: 'Tarda mucho en volver a "Sin movimiento"', revisa: 'Es la perilla de tiempo del sensor. Gírala hacia el mínimo.' },
        SIMBOLOS, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Cuenta cuántas veces se detecta movimiento y muestra el total. Pista: usa una variable contador y súmale 1 solo cuando pasa de "sin movimiento" a "movimiento".',
      preguntas: [
        { pregunta: '¿Qué detecta un sensor PIR?', opciones: ['La luz visible', 'El calor de un cuerpo que se mueve', 'El sonido'], correcta: 1, explicacion: 'PIR significa infrarrojo pasivo: capta los cambios de radiación de calor.' },
        { pregunta: '¿Por qué hay que esperar un minuto al encenderlo?', opciones: ['Para que se cargue la batería', 'Para que el sensor se estabilice y aprenda cómo es el ambiente', 'Para que se suba el programa'], correcta: 1, explicacion: 'Necesita medir el calor de fondo antes de poder notar cambios.' },
        { pregunta: '¿Por qué el PIR se alimenta desde VIN y no desde 3V3?', opciones: ['Porque necesita 5 V para funcionar de forma estable', 'Porque VIN está más cerca', 'No hay diferencia'], correcta: 0, explicacion: 'El módulo HC-SR501 está diseñado para alimentarse con 5 V; su salida, en cambio, es segura para el ESP32.' },
      ],
    },
  },

  'practica-ldr-domotica': {
    reto: {
      texto: 'Vas a medir la luz del ambiente con un número, para que tu casa inteligente sepa si es de día o de noche.',
      paraQue: 'No tiene sentido encender una lámpara a mediodía. Con un sensor de luz, el sistema enciende solo cuando hace falta y ahorra energía.',
      duracion: '25 minutos',
    },
    piezas: [
      { nombre: 'Módulo sensor de luz (LDR)', paraQue: 'Entrega por su pin AOUT un voltaje que cambia con la iluminación.', cuidado: 'Usa el pin AOUT (analógico). Si tu módulo también tiene DOUT, ese no se usa aquí.' },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      { titulo: 'Reparte 3,3 V y tierra', texto: 'Une el pin 3V3 del ESP32 con la línea roja (+) y un pin GND con la línea negra (–).', rieles: ['3V3', 'GND'] },
      { titulo: 'Dale energía al módulo', texto: 'Une VCC del módulo con la línea roja (3,3 V) y GND con la línea negra.', conexiones: [0, 1] },
      { titulo: 'Conecta la señal', texto: 'Une el pin AOUT con el pin GPIO34 del ESP32.', conexiones: [2], consejo: 'GPIO34 es un pin solo de entrada: sirve para leer sensores, pero no puede encender un LED.' },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Leer la luz', texto: 'analogRead devuelve un número entre 0 y 4095 según el voltaje que llega al pin.', fragmento: 'const int PIN_LDR = 34;\n\nint luz = analogRead(PIN_LDR);' },
      { titulo: 'Mostrar el valor', texto: 'Se escribe una línea nueva unas tres veces por segundo.', fragmento: 'Serial.print("Luz (0-4095): ");\nSerial.println(luz);\ndelay(300);' },
    ],
    prueba: {
      queDebePasar: [
        'Aparece un número entre 0 y 4095 que cambia al tapar el sensor con la mano.',
        'Anota dos valores: con luz normal y con el sensor tapado. Los usarás para definir el límite de "oscuro".',
      ],
      siNoFunciona: [
        { problema: 'El número no cambia', revisa: 'Comprueba que usas AOUT y no DOUT, y que llega a GPIO34.' },
        { problema: 'Siempre marca 0 o 4095', revisa: 'El módulo no tiene energía: VCC a 3,3 V y GND a la línea negra.' },
        SIMBOLOS, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Define un límite entre tus dos valores anotados y haz que el programa escriba "OSCURO" o "CLARO".',
      preguntas: [
        { pregunta: '¿Qué tiene de especial el pin GPIO34?', opciones: ['Es solo de entrada', 'Entrega 5 V', 'No se puede usar'], correcta: 0, explicacion: 'Los pines 34 a 39 del ESP32 solo pueden leer.' },
        { pregunta: '¿Para qué sirve saber si está oscuro?', opciones: ['Para encender la luz solo cuando hace falta', 'Para medir la temperatura', 'Para detectar personas'], correcta: 0, explicacion: 'Así el sistema no enciende luces durante el día.' },
        { pregunta: '¿Qué pin del módulo entrega el valor entre 0 y 4095?', opciones: ['VCC', 'AOUT', 'GND'], correcta: 1, explicacion: 'AOUT es la salida analógica.' },
      ],
    },
  },

  'practica-rele-domotica': {
    reto: {
      texto: 'Vas a hacer que tu placa accione un interruptor: escucharás un "clic" cada segundo. Ese interruptor es el que permitirá controlar una lámpara real desde un programa.',
      paraQue: 'El relé es la pieza que une el mundo de la electrónica con el de los aparatos de la casa. Una señal de 3,3 V controla un interruptor por el que puede pasar la corriente de un foco, sin que ambos circuitos se toquen.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'Módulo relé con optoacoplador', paraQue: 'Interruptor que se acciona con electricidad. El optoacoplador separa con luz el circuito del ESP32 del circuito de potencia, para proteger la placa.', cuidado: `En esta práctica no se conecta nada a los bornes con tornillo. ${AVISO_110}` },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      { titulo: 'Reparte 5 V y tierra', texto: 'Une el pin VIN del ESP32 con la línea roja (+) y un pin GND con la línea negra (–).', rieles: ['VIN', 'GND'] },
      { titulo: 'Dale energía al relé', texto: 'Une VCC del módulo con la línea roja (5 V) y GND con la línea negra.', conexiones: [1, 2] },
      { titulo: 'Conecta la señal', texto: 'Une el pin IN del módulo con el pin GPIO26 del ESP32.', conexiones: [0] },
      { titulo: 'Conecta el USB', texto: 'Conecta el ESP32 a la computadora y sube el programa.' },
    ],
    codigo: [
      { titulo: 'El relé es una salida', texto: 'Para el programa, accionar un relé es igual que encender un LED.', fragmento: 'const int PIN_RELE = 26;\n\nvoid setup() {\n  pinMode(PIN_RELE, OUTPUT);\n}' },
      { titulo: 'Encender y apagar', texto: 'Cada cambio produce el "clic": un electroimán mueve un contacto metálico dentro del relé.', fragmento: 'digitalWrite(PIN_RELE, HIGH);\ndelay(1000);\ndigitalWrite(PIN_RELE, LOW);\ndelay(1000);' },
    ],
    prueba: {
      queDebePasar: ['Se escucha un "clic" cada segundo.', 'La luz del módulo se enciende y se apaga al mismo ritmo.'],
      siNoFunciona: [
        { problema: 'No hay clic ni luz', revisa: 'Revisa VCC a la línea roja (VIN), GND a la negra e IN a GPIO26.' },
        { problema: 'La luz cambia pero el relé no hace clic', revisa: 'Le falta corriente. Alimenta el ESP32 con la fuente de 5 V del kit en lugar del USB de la computadora.' },
        { problema: 'Funciona al revés (activo con LOW)', revisa: 'Algunos módulos se activan con LOW. No es un error: en ese caso intercambia HIGH y LOW en el programa.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Haz que el relé se encienda 5 segundos y se apague 2, y explica en una frase para qué podría servir ese ritmo en una casa.',
      preguntas: [
        { pregunta: '¿Para qué sirve el optoacoplador del módulo?', opciones: ['Para separar el circuito del ESP32 del circuito de potencia y proteger la placa', 'Para que el relé suene más', 'Para medir la luz'], correcta: 0, explicacion: 'Transmite la orden con luz, sin conexión eléctrica directa entre ambos lados.' },
        { pregunta: '¿Quién conecta el lado de 110 V del relé?', opciones: ['Cualquier estudiante', 'Únicamente el docente', 'Nadie'], correcta: 1, explicacion: 'El voltaje de la red es peligroso. Ese cableado lo hace y lo revisa solo el docente.' },
        { pregunta: '¿Qué produce el "clic"?', opciones: ['El programa', 'Un contacto metálico que se mueve dentro del relé', 'El optoacoplador'], correcta: 1, explicacion: 'Es el sonido mecánico del interruptor al cerrarse o abrirse.' },
      ],
    },
  },

  'practica-pulsador-domotica': {
    reto: {
      texto: 'Vas a hacer que tu placa reconozca cuándo presionas un botón y lo avise en pantalla. Será el control manual de tu casa inteligente.',
      paraQue: 'Una casa automática no puede depender solo de sensores: si quieres la luz encendida aunque estés quieto leyendo, necesitas poder mandarla tú.',
      duracion: '20 minutos',
    },
    piezas: [
      { nombre: 'Pulsador', paraQue: 'Interruptor que solo deja pasar corriente mientras lo presionas.', cuidado: 'Colócalo a caballo sobre el canal central y usa dos patas de lados opuestos.' },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      TIERRA,
      { titulo: 'Conecta el pulsador', texto: 'Une una pata con el pin GPIO14 y la pata del lado opuesto con la línea negra (–).', conexiones: [0, 1] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Configurar el botón', texto: 'INPUT_PULLUP activa una resistencia interna que mantiene el pin en HIGH mientras nadie presiona.', fragmento: 'pinMode(PULSADOR, INPUT_PULLUP);' },
      { titulo: 'Leer y avisar', texto: 'Presionado se lee como LOW, porque el pin queda unido a tierra. El mensaje se escribe solo en ese caso.', fragmento: 'bool presionado = (digitalRead(PULSADOR) == LOW);\nif (presionado) Serial.println("Control manual activado");\ndelay(200);' },
    ],
    prueba: {
      queDebePasar: ['Con el botón suelto la pantalla no escribe nada.', 'Mientras lo presionas aparece "Control manual activado".'],
      siNoFunciona: [
        { problema: 'El mensaje aparece sin presionar', revisa: 'Estás usando dos patas del pulsador que ya están unidas por dentro. Gíralo un cuarto de vuelta.' },
        { problema: 'Nunca aparece', revisa: 'Comprueba que una pata va a GPIO14 y la otra a la línea negra.' },
        SIMBOLOS, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Convierte el botón en un interruptor: una pulsación escribe "ENCENDIDO" y la siguiente "APAGADO". Pista: usa una variable bool y el signo ! para invertirla.',
      preguntas: [
        { pregunta: 'Con INPUT_PULLUP, ¿qué se lee al presionar?', opciones: ['HIGH', 'LOW', '4095'], correcta: 1, explicacion: 'El pin queda unido a tierra.' },
        { pregunta: '¿Por qué un sistema automático necesita control manual?', opciones: ['Para poder decidir uno mismo cuando el sensor no acierta', 'Para gastar más energía', 'No lo necesita'], correcta: 0, explicacion: 'Los sensores no conocen tus intenciones; el botón sí.' },
        { pregunta: '¿Qué hace el signo ! delante de una variable bool?', opciones: ['La borra', 'La invierte', 'La duplica'], correcta: 1, explicacion: 'Convierte verdadero en falso y falso en verdadero.' },
      ],
    },
  },

  'domotica-inteligente': {
    reto: {
      texto: 'Vas a construir el control de luz de una casa inteligente: enciende sola cuando alguien entra y está oscuro, se apaga 10 segundos después de que no haya movimiento, y tiene un botón para mandarla a mano. Por seguridad, primero la probarás con el clic del relé y un LED.',
      paraQue: 'La domótica hace las casas más cómodas y ahorra energía: luces que no se quedan encendidas, pasillos que se iluminan al pasar. Tu proyecto combina dos condiciones, movimiento y oscuridad, como los sistemas reales.',
      duracion: '90 minutos',
    },
    piezas: [
      { nombre: 'Sensor PIR HC-SR501', paraQue: 'Detecta si hay alguien moviéndose.', cuidado: 'Necesita 5 V (VIN) y un minuto para estabilizarse.' },
      { nombre: 'Módulo sensor de luz', paraQue: 'Indica si está oscuro.', cuidado: 'Se alimenta con 3,3 V; la señal sale por AOUT.' },
      { nombre: 'Módulo relé con optoacoplador', paraQue: 'Es el interruptor que enciende la carga.', cuidado: AVISO_110 },
      { nombre: 'LED de confirmación con resistencia de 330 Ω', paraQue: 'Parpadea dos veces cuando cambias entre modo manual y automático.', cuidado: 'Pata larga hacia la resistencia; pata corta a tierra.' },
      { nombre: 'Pulsador', paraQue: 'Cambia entre control automático y manual.' },
      ESP,
    ],
    pasos: [
      { titulo: 'Reparte las tres líneas de energía', texto: 'Este proyecto usa dos voltajes. Une un pin GND con la línea negra (–). Lleva VIN (5 V) a la línea roja de un lado de la protoboard y 3V3 a la línea roja del otro lado.', rieles: ['VIN', '3V3', 'GND'], consejo: 'Marca con cinta cuál línea roja es de 5 V y cuál de 3,3 V. Confundirlas puede dañar el sensor de luz.' },
      { titulo: 'Conecta el sensor de luz', texto: 'VCC a la línea de 3,3 V, GND a la línea negra y AOUT al pin GPIO34.', conexiones: [0, 2, 4] },
      { titulo: 'Conecta el sensor de movimiento', texto: 'VCC a la línea de 5 V (VIN), GND a la línea negra y OUT al pin GPIO27.', conexiones: [1, 3, 5] },
      { titulo: 'Conecta el relé', texto: 'VCC a la línea de 5 V (VIN), GND a la línea negra e IN al pin GPIO26.', conexiones: [6, 7, 8] },
      { titulo: 'Arma el LED de confirmación', texto: 'Pata larga al pin GPIO25 pasando por la resistencia de 330 Ω. Pata corta a la línea negra.', conexiones: [9, 10] },
      { titulo: 'Conecta el pulsador', texto: 'Una pata al pin GPIO14 y la pata del lado opuesto a la línea negra.', conexiones: [11, 12] },
      { titulo: 'La lámpara de 110 V: solo tu docente', texto: `Prueba todo el sistema escuchando el clic del relé. ${AVISO_110} Cuando el circuito de bajo voltaje funcione bien, tu docente conectará el foco a los bornes del relé con todo desenchufado.` },
    ],
    codigo: [
      { titulo: 'Dos ajustes para calibrar', texto: 'El límite de oscuridad depende de tu salón: usa los valores que anotaste en la práctica del sensor de luz. El tiempo es cuánto queda encendida la luz después del último movimiento.', fragmento: 'const int UMBRAL_OSCURIDAD = 2000;\nconst unsigned long TIEMPO_LUZ_ENCENDIDA_MS = 10000;' },
      { titulo: 'El botón cambia de modo', texto: 'Cada pulsación invierte el modo y el estado de la luz: la primera pasa a manual con la luz encendida; la segunda vuelve a automático. El LED parpadea para confirmar.', fragmento: 'if (digitalRead(PIN_PULSADOR) == LOW) {\n  modoManual = !modoManual;\n  manualEncendido = !manualEncendido;\n  parpadearConfirmacion();\n  delay(300);\n}' },
      { titulo: 'En modo manual, los sensores no deciden', texto: 'Si está en manual, se aplica el estado elegido y return termina esta vuelta de loop() sin mirar los sensores.', fragmento: 'if (modoManual) {\n  digitalWrite(PIN_RELE, manualEncendido ? HIGH : LOW);\n  return;\n}' },
      { titulo: 'Dos condiciones a la vez', texto: 'Las dos && significan "y": la luz se enciende solo si hay movimiento y además está oscuro. Se anota el momento con millis().', fragmento: 'if (hayMovimiento && estaOscuro) {\n  ultimoMovimiento = millis();\n  digitalWrite(PIN_RELE, HIGH);\n}' },
      { titulo: 'Apagar cuando pasa el tiempo', texto: 'millis() es un reloj que cuenta los milisegundos desde que encendió la placa. Si pasaron más de 10 segundos desde el último movimiento, la luz se apaga.', fragmento: 'if (millis() - ultimoMovimiento > TIEMPO_LUZ_ENCENDIDA_MS) {\n  digitalWrite(PIN_RELE, LOW);\n}' },
    ],
    prueba: {
      queDebePasar: [
        'Con el sensor de luz tapado (oscuro) y moviendo la mano frente al PIR, el relé hace clic y se enciende.',
        'Diez segundos después del último movimiento, el relé se apaga solo.',
        'Con buena luz, el relé no se enciende aunque haya movimiento.',
        'Al presionar el botón, el LED parpadea dos veces y el relé queda encendido en modo manual; al presionarlo otra vez, vuelve a automático.',
      ],
      siNoFunciona: [
        { problema: 'Nunca enciende', revisa: 'Con la práctica del sensor de luz, mira qué valor marca tapado. Si al tapar el número sube en lugar de bajar, cambia luzAmbiente < UMBRAL_OSCURIDAD por luzAmbiente > UMBRAL_OSCURIDAD.' },
        { problema: 'Enciende aunque haya luz', revisa: 'El límite está muy alto. Baja UMBRAL_OSCURIDAD a un valor entre tus dos lecturas anotadas.' },
        { problema: 'No se apaga nunca', revisa: 'El PIR sigue detectando: aléjate y gira su perilla de tiempo al mínimo. Comprueba también que no quedó en modo manual.' },
        { problema: 'El relé se activa al revés', revisa: 'Tu módulo se activa con LOW. Intercambia HIGH y LOW en las líneas de PIN_RELE.' },
        SIMBOLOS, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Calibra tu sistema para tu salón: elige el límite de oscuridad a partir de tus mediciones y cambia el tiempo de encendido a 30 segundos. Explica cómo decidiste cada valor.',
      preguntas: [
        { pregunta: '¿Qué significa hayMovimiento && estaOscuro?', opciones: ['Que basta una de las dos condiciones', 'Que deben cumplirse las dos a la vez', 'Que ninguna debe cumplirse'], correcta: 1, explicacion: '&& significa "y": movimiento y oscuridad al mismo tiempo.' },
        { pregunta: '¿Para qué se guarda millis() en ultimoMovimiento?', opciones: ['Para saber cuánto tiempo ha pasado desde el último movimiento', 'Para contar personas', 'Para medir la luz'], correcta: 0, explicacion: 'Restando ese valor del reloj actual se sabe cuándo apagar.' },
        { pregunta: '¿Qué hace return dentro del modo manual?', opciones: ['Reinicia la placa', 'Termina esa vuelta de loop() sin revisar los sensores', 'Apaga el relé'], correcta: 1, explicacion: 'Así, en manual, los sensores no pueden cambiar lo que tú elegiste.' },
      ],
    },
  },
}
