// Guías (método de 6 etapas) del kit de 8vo EGB — Semáforo inteligente con Arduino UNO.
// Clave = slug del proyecto en kit_proyectos. Se cargan con scripts/seed-kit-guias.js.

const UNO = { nombre: 'Arduino UNO', paraQue: 'Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines.', cuidado: 'No lo apoyes sobre objetos metálicos mientras está conectado: la parte de abajo tiene soldaduras expuestas.' }
const PROTO = { nombre: 'Protoboard', paraQue: 'Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y la línea larga negra (–) del borde sirve para repartir la tierra.' }
const RES = { nombre: 'Resistencia de 330 Ω', paraQue: 'Frena la corriente para que el LED no se queme. Va siempre en serie con el LED.', cuidado: 'Nunca conectes un LED directo al Arduino sin resistencia.' }
const JUMPER = { nombre: 'Cables jumper', paraQue: 'Llevan la corriente de un punto a otro.' }
const LED = (color) => ({ nombre: `LED ${color}`, paraQue: 'Es una luz pequeña que se enciende cuando la corriente pasa en el sentido correcto.', cuidado: 'La pata larga es el positivo (ánodo) y la corta el negativo (cátodo). Al revés no se daña, pero no enciende.' })

const TIERRA = { titulo: 'Lleva tierra a la línea negra', texto: 'Con un cable negro une uno de los pines GND del Arduino UNO con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.', rieles: ['GND'] }
const USB = { titulo: 'Conecta el cable USB', texto: 'Conecta el Arduino UNO a la computadora con el cable USB. Debe encenderse la luz verde marcada ON en la placa: eso indica que tiene energía.' }

const NO_SUBE = { problema: 'El programa no se sube', revisa: 'En el menú Herramientas elige Placa: Arduino Uno y el Puerto que aparece al conectar el cable. Si el puerto no aparece, esta placa usa el chip CH340 y puede necesitar su controlador: pide ayuda a tu docente.' }

module.exports = {
  'practica-primer-led': {
    reto: {
      texto: 'Vas a hacer que un LED rojo se encienda y se apague solo, una vez por segundo. Es el primer programa que escribe cualquier persona que aprende Arduino, y es la primera luz de tu semáforo.',
      paraQue: 'Las luces indicadoras están en todas partes: el foco del televisor en espera, la luz del cargador, el intermitente de un carro. Todas funcionan igual que lo que vas a armar: un programa decide cuándo dejar pasar la corriente.',
      duracion: '25 minutos',
    },
    piezas: [UNO, PROTO, LED('rojo'), RES, JUMPER],
    pasos: [
      TIERRA,
      { titulo: 'Coloca el LED y llévalo al pin 8', texto: 'Pon el LED rojo en la protoboard con cada pata en una fila distinta. Con un cable une la fila de la pata larga (ánodo) con el pin 8 del Arduino.', conexiones: [0] },
      { titulo: 'Cierra el circuito con la resistencia', texto: 'Conecta un extremo de la resistencia de 330 Ω en la fila de la pata corta del LED y el otro extremo en la línea negra (–). La corriente sale del pin 8, cruza el LED y la resistencia, y vuelve a tierra.', conexiones: [1], consejo: 'La resistencia no tiene lado: puede ir en cualquier sentido.' },
      USB,
    ],
    codigo: [
      { titulo: 'Dale un nombre al pin', texto: 'En lugar de escribir el número 8 por todo el programa, se guarda en una constante llamada LED. Si un día cambias de pin, corriges una sola línea.', fragmento: 'const int LED = 8;' },
      { titulo: 'setup(): se ejecuta una sola vez', texto: 'Cuando el Arduino enciende, ejecuta setup() una vez. Aquí le dices que el pin del LED es una salida, es decir, que por ahí va a enviar corriente.', fragmento: 'void setup() {\n  pinMode(LED, OUTPUT);\n}' },
      { titulo: 'loop(): se repite para siempre', texto: 'HIGH enciende el LED y LOW lo apaga. delay(500) espera 500 milisegundos, que es medio segundo. Al terminar, loop() vuelve a empezar solo.', fragmento: 'void loop() {\n  digitalWrite(LED, HIGH);\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}' },
    ],
    prueba: {
      queDebePasar: [
        'Al subir el programa, el LED se enciende medio segundo y se apaga medio segundo, sin parar.',
        'Si desconectas y vuelves a conectar el USB, el parpadeo empieza de nuevo solo: el programa quedó guardado en el Arduino.',
      ],
      siNoFunciona: [
        { problema: 'El LED no enciende nunca', revisa: 'Gira el LED: lo más probable es que esté al revés. La pata larga va hacia el pin 8 y la corta hacia la resistencia.' },
        { problema: 'Sigue sin encender', revisa: 'Comprueba que el cable llega al pin 8 y no al de al lado, y que la línea negra de la protoboard está unida a un pin GND del Arduino.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Haz que el LED parpadee como una señal de auxilio: tres destellos rápidos, una pausa larga, y que se repita. Pista: copia las líneas de encender y apagar, y cambia los números de delay().',
      preguntas: [
        { pregunta: '¿Para qué sirve la resistencia de 330 Ω?', opciones: ['Para que el LED brille más', 'Para limitar la corriente y que el LED no se queme', 'Para que el programa corra más rápido'], correcta: 1, explicacion: 'La resistencia frena la corriente. Sin ella pasaría demasiada y el LED se dañaría.' },
        { pregunta: '¿Cuántas veces se ejecuta loop()?', opciones: ['Una sola vez', 'Diez veces', 'Se repite sin parar mientras haya energía'], correcta: 2, explicacion: 'setup() corre una vez al encender; loop() se repite para siempre.' },
        { pregunta: 'Si cambias los dos delay(500) por delay(100), ¿qué pasa?', opciones: ['El LED parpadea más rápido', 'El LED parpadea más lento', 'El LED queda apagado'], correcta: 0, explicacion: 'Menos espera entre encender y apagar significa un parpadeo más rápido.' },
      ],
    },
  },

  'practica-pulsador': {
    reto: {
      texto: 'Vas a controlar el LED con tu dedo: se enciende mientras mantienes presionado un botón y se apaga cuando lo sueltas. Es la primera vez que tu Arduino recibe una orden tuya en lugar de solo ejecutar un programa.',
      paraQue: 'Un botón es la forma más simple de decirle algo a una máquina: el timbre de una casa, el teclado, el botón del ascensor. En el semáforo será el botón que presiona el peatón para pedir el paso.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'Pulsador', paraQue: 'Es un interruptor que solo deja pasar corriente mientras lo presionas.', cuidado: 'Tiene 4 patas unidas de dos en dos. Colócalo a caballo sobre el canal central de la protoboard y usa dos patas de lados opuestos.' },
      LED('rojo'), RES, UNO, PROTO,
    ],
    pasos: [
      TIERRA,
      { titulo: 'Coloca el pulsador', texto: 'Pon el pulsador a caballo sobre el canal central de la protoboard. Une una pata con el pin 2 del Arduino y la pata del lado opuesto con la línea negra (–).', conexiones: [0, 1], consejo: 'No necesitas resistencia para el pulsador: el programa activa una que el Arduino ya trae por dentro.' },
      { titulo: 'Conecta el LED', texto: 'Igual que en la práctica anterior: la pata larga del LED al pin 8, y la pata corta a la línea negra pasando por la resistencia de 330 Ω.', conexiones: [2, 3] },
      USB,
    ],
    codigo: [
      { titulo: 'Dos pines con nombre', texto: 'Uno para el botón y otro para el LED.', fragmento: 'const int PULSADOR = 2;\nconst int LED = 8;' },
      { titulo: 'Una entrada y una salida', texto: 'El LED es salida porque el Arduino envía corriente. El pulsador es entrada porque el Arduino lee. INPUT_PULLUP activa una resistencia interna que mantiene el pin en HIGH mientras nadie presiona.', fragmento: 'pinMode(PULSADOR, INPUT_PULLUP);\npinMode(LED, OUTPUT);' },
      { titulo: 'Leer el botón', texto: 'Aquí hay una trampa: con INPUT_PULLUP el botón presionado se lee como LOW, no como HIGH, porque al presionarlo el pin queda unido a tierra. La variable presionado vale verdadero cuando la lectura es LOW.', fragmento: 'bool presionado = (digitalRead(PULSADOR) == LOW);' },
      { titulo: 'Decidir qué hacer con el LED', texto: 'Esta línea es una pregunta corta: ¿está presionado? Si sí, enciende (HIGH); si no, apaga (LOW).', fragmento: 'digitalWrite(LED, presionado ? HIGH : LOW);' },
    ],
    prueba: {
      queDebePasar: [
        'Con el botón suelto, el LED está apagado.',
        'Al presionar el botón, el LED se enciende de inmediato y se apaga al soltarlo.',
      ],
      siNoFunciona: [
        { problema: 'El LED está siempre encendido', revisa: 'Las dos patas que usaste del pulsador están unidas por dentro. Gíralo un cuarto de vuelta o usa dos patas en diagonal.' },
        { problema: 'El LED nunca enciende al presionar', revisa: 'Comprueba que una pata del pulsador llega al pin 2 y la otra a la línea negra. Luego revisa el LED con el programa de la práctica anterior.' },
        { problema: 'El LED parpadea solo, sin tocar nada', revisa: 'Falta INPUT_PULLUP en el programa. Sin esa resistencia interna el pin queda "flotando" y lee valores al azar.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Invierte el comportamiento: que el LED esté encendido siempre y se apague solo mientras presionas. Pista: intercambia HIGH y LOW en la última línea.',
      preguntas: [
        { pregunta: 'Con INPUT_PULLUP, ¿qué lee el Arduino cuando presionas el botón?', opciones: ['HIGH', 'LOW', 'Nada'], correcta: 1, explicacion: 'Al presionar, el pin queda unido a tierra y se lee LOW. Suelto, la resistencia interna lo mantiene en HIGH.' },
        { pregunta: '¿Por qué el pulsador no necesita una resistencia externa aquí?', opciones: ['Porque el Arduino ya trae una resistencia interna que se activa con INPUT_PULLUP', 'Porque los pulsadores nunca necesitan resistencia', 'Porque usa muy poca corriente'], correcta: 0, explicacion: 'INPUT_PULLUP conecta una resistencia que está dentro del Arduino. Por eso el circuito queda más simple.' },
        { pregunta: '¿Qué diferencia hay entre una entrada y una salida?', opciones: ['Ninguna', 'Por una salida el Arduino envía corriente; por una entrada lee lo que pasa afuera', 'Las entradas son más rápidas'], correcta: 1, explicacion: 'El LED es una salida (el Arduino actúa) y el pulsador una entrada (el Arduino escucha).' },
      ],
    },
  },

  'practica-buzzer': {
    reto: {
      texto: 'Vas a hacer que tu Arduino emita un sonido: un pitido de medio segundo, un silencio de un segundo, y otra vez. Es el aviso que escuchará el peatón cuando pueda cruzar.',
      paraQue: 'Los avisos sonoros sirven cuando no estamos mirando: la alarma del microondas, el pitido de un carro en reversa, o los semáforos sonoros que ayudan a cruzar a las personas con discapacidad visual.',
      duracion: '25 minutos',
    },
    piezas: [
      { nombre: 'Buzzer pasivo', paraQue: 'Es un parlante muy pequeño. Suena cuando el Arduino le envía corriente que se enciende y se apaga muchas veces por segundo.', cuidado: 'Tiene polaridad: la pata marcada con + (o la más larga) va al pin del Arduino y la otra a tierra.' },
      UNO, PROTO, JUMPER,
    ],
    pasos: [
      TIERRA,
      { titulo: 'Conecta el positivo del buzzer', texto: 'Coloca el buzzer en la protoboard con cada pata en una fila distinta. Une la pata marcada con + con el pin 7 del Arduino.', conexiones: [0] },
      { titulo: 'Conecta el negativo', texto: 'Une la otra pata del buzzer con la línea negra (–).', conexiones: [1] },
      USB,
    ],
    codigo: [
      { titulo: 'Nombre del pin y configuración', texto: 'El buzzer es una salida, igual que un LED: el Arduino le envía corriente.', fragmento: 'const int BUZZER = 7;\n\nvoid setup() {\n  pinMode(BUZZER, OUTPUT);\n}' },
      { titulo: 'tone(): empezar a sonar', texto: 'tone() recibe el pin y la frecuencia en hercios. 1000 significa que el buzzer vibra mil veces por segundo. Un número más alto da un sonido más agudo.', fragmento: 'tone(BUZZER, 1000);\ndelay(500);' },
      { titulo: 'noTone(): callar', texto: 'El sonido no se detiene solo: hay que apagarlo con noTone(). Después se espera un segundo en silencio antes de repetir.', fragmento: 'noTone(BUZZER);\ndelay(1000);' },
    ],
    prueba: {
      queDebePasar: [
        'Se escucha un pitido de medio segundo, luego un segundo de silencio, y se repite.',
        'El sonido es siempre el mismo tono.',
      ],
      siNoFunciona: [
        { problema: 'No suena nada', revisa: 'Invierte las patas del buzzer y comprueba que el cable llega al pin 7. Verifica también que la línea negra está unida a GND.' },
        { problema: 'Suena muy bajito', revisa: 'Es normal en un buzzer pasivo pequeño. Prueba con una frecuencia entre 2000 y 3000, donde suele sonar más fuerte.' },
        { problema: 'Suena sin parar', revisa: 'Falta la línea noTone(BUZZER) o quedó fuera de loop().' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Toca una melodía de tres notas: 262, 330 y 392 hercios (do, mi y sol), cada una durante 300 milisegundos. Pista: repite tone() y delay() tres veces con números distintos.',
      preguntas: [
        { pregunta: '¿Qué significa el 1000 en tone(BUZZER, 1000)?', opciones: ['Que suena 1000 segundos', 'La frecuencia: el buzzer vibra 1000 veces por segundo', 'El volumen'], correcta: 1, explicacion: 'Es la frecuencia en hercios. Determina qué tan grave o agudo es el sonido.' },
        { pregunta: 'Si cambias 1000 por 2000, el sonido será…', opciones: ['Más grave', 'Más agudo', 'Igual'], correcta: 1, explicacion: 'A mayor frecuencia, sonido más agudo.' },
        { pregunta: '¿Para qué sirve noTone()?', opciones: ['Para subir el volumen', 'Para detener el sonido', 'Para cambiar de nota'], correcta: 1, explicacion: 'tone() deja el buzzer sonando hasta que noTone() lo apaga.' },
      ],
    },
  },

  'practica-tres-leds': {
    reto: {
      texto: 'Vas a encender tres luces en orden, una después de otra: roja, amarilla y verde. Con esto ya tienes el cuerpo del semáforo; solo faltará darle inteligencia.',
      paraQue: 'Casi todas las máquinas funcionan por secuencias: una lavadora llena, lava, enjuaga y centrifuga; un semáforo pasa de verde a amarillo y a rojo. Programar es, muchas veces, ordenar pasos en el tiempo.',
      duracion: '35 minutos',
    },
    piezas: [
      { nombre: 'LED rojo, amarillo y verde', paraQue: 'Las tres luces del semáforo. Funcionan igual; solo cambia el color.', cuidado: 'En los tres, la pata larga es el positivo.' },
      { nombre: '3 resistencias de 330 Ω', paraQue: 'Una para cada LED. Cada luz necesita su propia resistencia.', cuidado: 'El kit trae exactamente tres: no las pierdas.' },
      UNO, PROTO, JUMPER,
    ],
    pasos: [
      TIERRA,
      { titulo: 'Conecta el LED rojo', texto: 'Pata larga al pin 8. Pata corta a la línea negra (–) pasando por una resistencia de 330 Ω.', conexiones: [0, 1] },
      { titulo: 'Conecta el LED amarillo', texto: 'Colócalo debajo del rojo. Pata larga al pin 9. Pata corta a la línea negra pasando por otra resistencia.', conexiones: [2, 3] },
      { titulo: 'Conecta el LED verde', texto: 'Colócalo debajo del amarillo. Pata larga al pin 10. Pata corta a la línea negra pasando por la tercera resistencia.', conexiones: [4, 5], consejo: 'Ponlos en línea y en el mismo orden que un semáforo real: rojo arriba, amarillo al medio y verde abajo.' },
      USB,
    ],
    codigo: [
      { titulo: 'Tres pines con nombre', texto: 'Usar el nombre del color en lugar del número hace que el programa se lea casi como una frase.', fragmento: 'const int ROJO = 8;\nconst int AMARILLO = 9;\nconst int VERDE = 10;' },
      { titulo: 'Los tres son salidas', texto: 'Cada LED necesita su propia línea pinMode.', fragmento: 'pinMode(ROJO, OUTPUT);\npinMode(AMARILLO, OUTPUT);\npinMode(VERDE, OUTPUT);' },
      { titulo: 'El patrón: encender, esperar, apagar', texto: 'Mira el patrón que se repite tres veces: enciendo un color, espero, lo apago y enciendo el siguiente. El rojo y el verde duran un segundo; el amarillo, medio.', fragmento: 'digitalWrite(ROJO, HIGH);\ndelay(1000);\ndigitalWrite(ROJO, LOW);\ndigitalWrite(AMARILLO, HIGH);\ndelay(500);\ndigitalWrite(AMARILLO, LOW);' },
    ],
    prueba: {
      queDebePasar: [
        'Se enciende el rojo un segundo, luego el amarillo medio segundo, luego el verde un segundo, y vuelve a empezar.',
        'Nunca hay dos luces encendidas al mismo tiempo.',
      ],
      siNoFunciona: [
        { problema: 'Un LED no enciende', revisa: 'Gira ese LED y revisa que su cable llega al pin correcto: rojo al 8, amarillo al 9 y verde al 10.' },
        { problema: 'Los colores salen en otro orden', revisa: 'Los cables están cruzados entre pines. Sigue cada cable desde el LED hasta el Arduino.' },
        { problema: 'Dos LEDs encienden a la vez', revisa: 'Falta una línea digitalWrite(..., LOW) antes de encender el siguiente color.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Los semáforos reales pasan de verde a amarillo y luego a rojo. Reordena tu programa para que siga ese orden: verde, amarillo, rojo.',
      preguntas: [
        { pregunta: '¿Por qué cada LED tiene su propia resistencia?', opciones: ['Para que cada uno reciba la corriente correcta sin depender de los otros', 'Porque así se ven más bonitos', 'No hace falta: con una basta para los tres'], correcta: 0, explicacion: 'Cada LED es un circuito aparte y necesita su propio límite de corriente.' },
        { pregunta: '¿Qué pasa si olvidas apagar el rojo antes de encender el amarillo?', opciones: ['El programa se detiene', 'Quedan los dos encendidos al mismo tiempo', 'El rojo se quema'], correcta: 1, explicacion: 'Un pin queda en el último estado que le diste hasta que lo cambies.' },
        { pregunta: '¿Cuánto dura una vuelta completa de la secuencia?', opciones: ['1 segundo', '2,5 segundos', '5 segundos'], correcta: 1, explicacion: '1000 + 500 + 1000 milisegundos = 2500 milisegundos, es decir, 2,5 segundos.' },
      ],
    },
  },

  'semaforo-inteligente': {
    reto: {
      texto: 'Vas a construir un semáforo que reacciona a las personas: funciona en secuencia, pero si un peatón presiona el botón, corta el verde antes de tiempo, pasa a rojo y avisa con tres pitidos que ya se puede cruzar. Une todo lo que practicaste.',
      paraQue: 'Los semáforos con botón existen en cruces escolares y avenidas: dan paso a los carros la mayor parte del tiempo y solo se detienen cuando alguien lo pide. Es un sistema que toma decisiones según lo que pasa a su alrededor.',
      duracion: '60 minutos',
    },
    piezas: [
      { nombre: 'LED rojo, amarillo y verde con sus resistencias', paraQue: 'Las tres luces para los carros.', cuidado: 'Pata larga al pin; pata corta a tierra pasando por la resistencia de 330 Ω.' },
      { nombre: 'Pulsador', paraQue: 'El botón que presiona el peatón para pedir el paso.', cuidado: 'Colócalo a caballo sobre el canal central y usa patas de lados opuestos.' },
      { nombre: 'Buzzer pasivo', paraQue: 'Avisa con tres pitidos que el semáforo está en rojo y se puede cruzar.', cuidado: 'La pata marcada con + va al pin del Arduino.' },
      UNO, PROTO,
    ],
    pasos: [
      TIERRA,
      { titulo: 'Arma el LED rojo', texto: 'Pata larga al pin 8. Pata corta a la línea negra pasando por una resistencia de 330 Ω.', conexiones: [0, 1] },
      { titulo: 'Arma el LED amarillo', texto: 'Pata larga al pin 9. Pata corta a la línea negra pasando por otra resistencia.', conexiones: [2, 3] },
      { titulo: 'Arma el LED verde', texto: 'Pata larga al pin 10. Pata corta a la línea negra pasando por la tercera resistencia.', conexiones: [4, 5] },
      { titulo: 'Coloca el pulsador del peatón', texto: 'Una pata al pin 2 y la pata del lado opuesto a la línea negra.', conexiones: [6, 7], consejo: 'Déjalo en un borde de la protoboard, donde sea fácil presionarlo.' },
      { titulo: 'Conecta el buzzer', texto: 'La pata marcada con + al pin 7 y la otra a la línea negra.', conexiones: [8, 9] },
      USB,
    ],
    codigo: [
      { titulo: 'Los tiempos están arriba', texto: 'Cuánto dura cada luz está definido al inicio, en milisegundos. Para ajustar el semáforo cambias estos números, sin tocar el resto.', fragmento: 'const unsigned long TIEMPO_VERDE = 5000;\nconst unsigned long TIEMPO_AMARILLO = 1500;\nconst unsigned long TIEMPO_ROJO = 4000;' },
      { titulo: 'Una variable que recuerda', texto: 'peatonEsperando guarda si alguien presionó el botón. Empieza en falso. Es la memoria del semáforo.', fragmento: 'bool peatonEsperando = false;' },
      { titulo: 'El verde que se puede interrumpir', texto: 'Esta es la idea central. En lugar de delay(), que deja al Arduino "sordo", se usa millis() para medir el tiempo mientras se sigue leyendo el botón. Si alguien presiona, se anota y se sale del verde con break.', fragmento: 'unsigned long inicio = millis();\nwhile (millis() - inicio < TIEMPO_VERDE) {\n  if (digitalRead(PULSADOR_PEATON) == LOW) {\n    peatonEsperando = true;\n    break;\n  }\n}' },
      { titulo: 'El orden del ciclo', texto: 'loop() describe una vuelta completa: verde (interrumpible), amarillo y rojo. Antes de cambiar de luz se apagan todas con apagarTodo().', fragmento: 'cicloVerdeConInterrupcion();\napagarTodo();\ndigitalWrite(LED_AMARILLO, HIGH);\ndelay(TIEMPO_AMARILLO);\napagarTodo();\ndigitalWrite(LED_ROJO, HIGH);' },
      { titulo: 'Avisar solo si alguien pidió el paso', texto: 'Ya en rojo, el semáforo revisa su memoria. Si había un peatón esperando, suena el aviso y borra el pedido para la siguiente vuelta.', fragmento: 'if (peatonEsperando) {\n  avisoSonoroCruce();\n  peatonEsperando = false;\n}\ndelay(TIEMPO_ROJO);' },
      { titulo: 'Funciones pequeñas con nombre', texto: 'apagarTodo() y avisoSonoroCruce() agrupan varias líneas bajo un nombre claro. Así loop() se lee casi como una lista de instrucciones.', fragmento: 'void avisoSonoroCruce() {\n  for (int i = 0; i < 3; i++) {\n    tone(BUZZER, 1500, 150);\n    delay(300);\n  }\n  noTone(BUZZER);\n}' },
    ],
    prueba: {
      queDebePasar: [
        'Sin tocar nada: verde 5 segundos, amarillo 1,5 segundos, rojo 4 segundos, y se repite. No suena el buzzer.',
        'Si presionas el botón durante el verde, pasa a amarillo de inmediato.',
        'Al llegar al rojo después de presionar, suenan tres pitidos cortos.',
        'En la vuelta siguiente, si nadie presiona, el semáforo vuelve a su ritmo normal y no suena.',
      ],
      siNoFunciona: [
        { problema: 'El verde se corta enseguida, sin presionar', revisa: 'El pin 2 está leyendo LOW todo el tiempo. Gira el pulsador un cuarto de vuelta: estás usando dos patas que ya están unidas por dentro.' },
        { problema: 'Presiono el botón y no pasa nada', revisa: 'Solo responde durante el verde. Comprueba que una pata va al pin 2 y la otra a la línea negra.' },
        { problema: 'No suena el buzzer', revisa: 'Invierte sus patas y revisa que llegue al pin 7. Pruébalo solo con la práctica del buzzer.' },
        { problema: 'Una luz no enciende', revisa: 'Gira ese LED y revisa su resistencia. Rojo al 8, amarillo al 9 y verde al 10.' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Mejora tu semáforo: haz que el verde dure 8 segundos y que el aviso tenga cinco pitidos en lugar de tres. Después explica a un compañero qué dos números cambiaste.',
      preguntas: [
        { pregunta: '¿Por qué el verde no usa delay(TIEMPO_VERDE)?', opciones: ['Porque delay() no funciona con LEDs verdes', 'Porque durante un delay() el Arduino no puede leer el botón', 'Porque delay() gasta más energía'], correcta: 1, explicacion: 'delay() detiene todo. Con millis() el Arduino mide el tiempo y sigue atento al pulsador.' },
        { pregunta: '¿Para qué sirve la variable peatonEsperando?', opciones: ['Para recordar que alguien presionó el botón hasta que el semáforo llegue al rojo', 'Para contar cuántos carros pasan', 'Para encender el LED verde'], correcta: 0, explicacion: 'El botón se presiona en verde, pero el aviso suena después, en rojo. La variable guarda ese pedido.' },
        { pregunta: 'Quieres que los carros tengan más tiempo para pasar. ¿Qué cambias?', opciones: ['TIEMPO_ROJO', 'TIEMPO_VERDE', 'TIEMPO_AMARILLO'], correcta: 1, explicacion: 'TIEMPO_VERDE es cuánto dura la luz verde, en milisegundos.' },
      ],
    },
  },
}
