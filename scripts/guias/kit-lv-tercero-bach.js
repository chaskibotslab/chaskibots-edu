// Guías (método de 6 etapas) del kit de 3ro BGU — Monitoreo y automatización con ESP32 y pantalla LCD.
// Clave = slug del proyecto en kit_proyectos. Se cargan con scripts/seed-kit-guias.js.

const ESP = { nombre: 'ESP32 DevKit V1', paraQue: 'Es el cerebro. Lee todos los sensores, decide si hay alerta y escribe en la pantalla.', cuidado: 'Sus pines de señal trabajan a 3,3 V. El pin VIN entrega los 5 V del USB y sirve solo para alimentar módulos.' }
const PROTO = { nombre: 'Protoboard y cables jumper', paraQue: 'Sostienen las piezas y reparten energía y tierra.' }

const PLACA = { titulo: 'Coloca el ESP32', texto: 'Pon el ESP32 a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Si de un lado no queda ninguna fila libre, conecta ese lado con jumper macho-hembra directo a los pines.' }
const R33 = { titulo: 'Reparte 3,3 V y tierra', texto: 'Une el pin 3V3 del ESP32 con la línea roja (+) de la protoboard y un pin GND con la línea negra (–).', rieles: ['3V3', 'GND'] }
const USB_SERIAL = { titulo: 'Conecta el USB y abre el Monitor Serial', texto: 'Conecta el ESP32 a la computadora. Después de subir el programa, abre el Monitor Serial y elige 115200 baudios.' }

const NO_SUBE = { problema: 'El programa no se sube', revisa: 'En Herramientas elige Placa: ESP32 Dev Module (o DOIT ESP32 DEVKIT V1) y el puerto correcto. Si se queda en "Connecting…", mantén presionado el botón BOOT de la placa hasta que empiece a subir.' }
const SIMBOLOS = { problema: 'Salen símbolos raros en el Monitor Serial', revisa: 'Elige 115200 baudios abajo a la derecha.' }

module.exports = {
  'practica-dht11-monitoreo': {
    reto: {
      texto: 'Vas a medir la temperatura y la humedad del aire y a verlas en la computadora, actualizadas cada dos segundos. Son los primeros datos de tu sistema de monitoreo.',
      paraQue: 'En una sala de servidores, una bodega de medicinas o un invernadero, la temperatura y la humedad se vigilan todo el día. Un sistema que las mide solo evita pérdidas costosas.',
      duracion: '30 minutos',
    },
    piezas: [
      { nombre: 'Sensor DHT11 (módulo de 3 pines)', paraQue: 'Mide temperatura (0 a 50 °C) y humedad del aire (20 a 90 %) y las envía por un solo cable de datos.', cuidado: 'Lee las letras junto a cada pin: el orden cambia según el fabricante. Solo mide una vez cada dos segundos.' },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      R33,
      { titulo: 'Dale energía al sensor', texto: 'Une VCC (o +) del sensor con la línea roja (3,3 V) y GND (o –) con la línea negra.', conexiones: [0, 1] },
      { titulo: 'Conecta el cable de datos', texto: 'Une el pin DATA (u OUT) con el pin GPIO4 del ESP32.', conexiones: [2] },
      { titulo: 'Instala la librería y conecta', texto: 'En Herramientas > Administrar bibliotecas busca «DHT sensor library» de Adafruit e instálala con sus dependencias. Luego conecta el USB y abre el Monitor Serial a 115200 baudios.' },
    ],
    codigo: [
      { titulo: 'Crear el sensor', texto: 'Se incluye la librería y se le indica el pin y el modelo.', fragmento: '#include <DHT.h>\n\nconst int PIN_DHT = 4;\n#define DHTTYPE DHT11\nDHT dht(PIN_DHT, DHTTYPE);' },
      { titulo: 'Pedir las dos medidas', texto: 'El tipo float guarda decimales. Cada función devuelve una medida.', fragmento: 'float temperatura = dht.readTemperature();\nfloat humedad = dht.readHumidity();' },
      { titulo: 'Mostrar y esperar', texto: 'Se escribe una línea y se esperan dos segundos, porque el DHT11 no puede medir más rápido.', fragmento: 'Serial.print("Temp: "); Serial.print(temperatura);\nSerial.print(" C  Humedad: "); Serial.print(humedad);\nSerial.println(" %");\ndelay(2000);' },
    ],
    prueba: {
      queDebePasar: ['Cada dos segundos aparece una línea como "Temp: 22.50 C  Humedad: 58.00 %".', 'Al soplar aire caliente y húmedo sobre el sensor, la humedad sube en pocas lecturas.'],
      siNoFunciona: [
        { problema: 'Aparece "nan"', revisa: 'El sensor no responde: revisa DATA en GPIO4 y que VCC y GND no estén invertidos.' },
        { problema: 'Error "DHT.h: No such file"', revisa: 'Falta instalar «DHT sensor library» de Adafruit.' },
        SIMBOLOS, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Calcula y muestra también la temperatura en grados Fahrenheit. Pista: F = C × 9 / 5 + 32.',
      preguntas: [
        { pregunta: '¿Qué significa "nan"?', opciones: ['Temperatura cero', 'Que no llegó un número válido del sensor', 'Fin del programa'], correcta: 1, explicacion: 'nan es "no es un número": la lectura falló.' },
        { pregunta: '¿Cada cuánto puede medir el DHT11?', opciones: ['Mil veces por segundo', 'Una vez cada dos segundos', 'Una vez por minuto'], correcta: 1, explicacion: 'Es un sensor lento; por eso el programa espera.' },
        { pregunta: '¿Por qué se usa float y no int?', opciones: ['Para guardar decimales', 'Porque ocupa menos memoria', 'Porque es más rápido'], correcta: 0, explicacion: 'Un int perdería los decimales de la medida.' },
      ],
    },
  },

  'practica-distancia': {
    reto: {
      texto: 'Vas a medir sin tocar a qué distancia está un objeto y a ver el número cambiando en vivo mientras lo acercas y lo alejas.',
      paraQue: 'Los sensores de distancia miden el nivel de un tanque de agua, detectan si un estacionamiento está ocupado y ayudan a los robots a no chocar.',
      duracion: '35 minutos',
    },
    piezas: [
      { nombre: 'Sensor ultrasónico HC-SR04P', paraQue: 'Lanza un sonido que no escuchamos y mide cuánto tarda el eco en volver. Con eso calcula la distancia, entre 2 cm y unos 4 metros.', cuidado: 'Pines en orden: VCC, Trig, Echo, GND. La versión "P" de este sensor acepta de 3,3 a 5 V.' },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      { titulo: 'Lleva tierra a la línea negra', texto: 'Une un pin GND del ESP32 con la línea negra (–).', rieles: ['GND'] },
      { titulo: 'Dale energía al sensor', texto: 'Une el pin GND del sensor con la línea negra y el pin VCC con la alimentación indicada para tu kit.', conexiones: [0, 1], consejo: 'Confirma con tu docente de dónde tomar la energía de este sensor. Si se alimenta con 5 V, su pin Echo también devuelve 5 V, y los pines del ESP32 están hechos para 3,3 V.' },
      { titulo: 'Conecta Trig (el disparo)', texto: 'Une el pin Trig con el pin GPIO17. Por ahí el ESP32 ordena lanzar el sonido.', conexiones: [2] },
      { titulo: 'Conecta Echo (la respuesta)', texto: 'Une el pin Echo con el pin GPIO16. Por ahí vuelve el aviso de cuánto tardó el eco.', conexiones: [3] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Una salida y una entrada', texto: 'Trig es salida porque el ESP32 da la orden; Echo es entrada porque recibe la respuesta.', fragmento: 'pinMode(PIN_TRIG, OUTPUT);\npinMode(PIN_ECHO, INPUT);' },
      { titulo: 'Disparar el sonido', texto: 'Un pulso de 10 microsegundos en Trig es la orden de disparo.', fragmento: 'digitalWrite(PIN_TRIG, LOW);\ndelayMicroseconds(2);\ndigitalWrite(PIN_TRIG, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(PIN_TRIG, LOW);' },
      { titulo: 'Medir el eco y convertir', texto: 'pulseIn() mide en microsegundos cuánto tarda el eco. El sonido recorre 1 cm de ida y 1 cm de vuelta en unos 58 microsegundos; por eso se divide para 58.', fragmento: 'long duracion = pulseIn(PIN_ECHO, HIGH, 25000);\nlong distanciaCm = duracion / 58;' },
    ],
    prueba: {
      queDebePasar: ['Aparece "Distancia: 23 cm" unas tres veces por segundo.', 'Al acercar la mano el número baja; al alejarla, sube.', 'Comparado con una regla, el error es de 1 o 2 cm.'],
      siNoFunciona: [
        { problema: 'Siempre marca 0 cm', revisa: 'El eco no llega: Trig y Echo pueden estar cruzados (Trig a GPIO17, Echo a GPIO16), o el sensor no tiene energía.' },
        { problema: 'Los números saltan mucho', revisa: 'Apunta a una superficie plana y dura. La ropa y las superficies inclinadas devuelven mal el eco.' },
        SIMBOLOS, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Haz que escriba "¡MUY CERCA!" cuando la distancia sea menor a 20 cm. Ese será el límite de alerta de tu sistema.',
      preguntas: [
        { pregunta: '¿Qué hace el pin Trig?', opciones: ['Recibe el eco', 'Ordena lanzar el sonido', 'Alimenta el sensor'], correcta: 1, explicacion: 'Trig dispara; Echo responde.' },
        { pregunta: '¿Por qué se divide para 58?', opciones: ['Porque el sonido tarda unos 58 microsegundos en ir y volver 1 cm', 'Porque el sensor tiene 58 piezas', 'Es un número arbitrario'], correcta: 0, explicacion: 'El tiempo medido incluye ida y vuelta.' },
        { pregunta: '¿A qué voltaje trabajan los pines de señal del ESP32?', opciones: ['3,3 V', '5 V', '12 V'], correcta: 0, explicacion: 'Por eso hay que cuidar que ningún sensor les envíe 5 V.' },
      ],
    },
  },

  'practica-lcd': {
    reto: {
      texto: 'Vas a escribir un mensaje en una pantalla: dos líneas de texto que quedan fijas aunque desconectes la computadora. Tu proyecto dejará de depender del Monitor Serial.',
      paraQue: 'Una pantalla convierte un circuito en un aparato: un termómetro, una balanza, un microondas. Con ella, cualquier persona puede leer los datos sin necesidad de una computadora.',
      duracion: '40 minutos',
    },
    piezas: [
      { nombre: 'Pantalla LCD 16x2 con módulo I2C', paraQue: 'Muestra 2 líneas de 16 caracteres. El módulo I2C soldado atrás reduce las conexiones a solo 4 cables.', cuidado: 'En la parte de atrás hay una perilla azul pequeña que ajusta el contraste. Si no se ve texto, casi siempre es eso.' },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      { titulo: 'Reparte 5 V y tierra', texto: 'Une el pin VIN del ESP32 con la línea roja (+) y un pin GND con la línea negra (–). La pantalla necesita 5 V para que su luz de fondo se vea bien.', rieles: ['VIN', 'GND'] },
      { titulo: 'Dale energía a la pantalla', texto: 'Con jumper macho-hembra, une VCC del módulo con la línea roja y GND con la línea negra.', conexiones: [2, 3] },
      { titulo: 'Conecta SDA y SCL', texto: 'Une SDA con el pin GPIO21 y SCL con el pin GPIO22. Son los dos cables por donde viaja la información.', conexiones: [0, 1], consejo: 'SDA lleva los datos y SCL marca el ritmo. Si los cruzas no se daña nada, pero la pantalla no muestra texto.' },
      { titulo: 'Instala la librería y conecta', texto: 'En Herramientas > Administrar bibliotecas busca «LiquidCrystal I2C» e instálala. Luego conecta el USB y sube el programa.' },
    ],
    codigo: [
      { titulo: 'Crear la pantalla', texto: '0x27 es la dirección de la pantalla, como el número de una casa: con ella el ESP32 sabe a quién le habla. 16 y 2 son las columnas y las filas.', fragmento: '#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);' },
      { titulo: 'Encender la pantalla', texto: 'init() la prepara y backlight() enciende la luz de fondo.', fragmento: 'lcd.init();\nlcd.backlight();' },
      { titulo: 'Elegir dónde escribir', texto: 'setCursor(columna, fila) mueve el punto de escritura. Las cuentas empiezan en 0: la fila 0 es la de arriba y la fila 1 la de abajo.', fragmento: 'lcd.setCursor(0, 0);\nlcd.print("Hola, Academia!");\nlcd.setCursor(0, 1);\nlcd.print("LCD funcionando");' },
      { titulo: 'Un loop vacío', texto: 'Como el mensaje se escribe una sola vez en setup(), loop() no tiene nada que hacer. La pantalla conserva el texto sola.', fragmento: 'void loop() {\n}' },
    ],
    prueba: {
      queDebePasar: ['La pantalla se ilumina.', 'Arriba dice "Hola, Academia!" y abajo "LCD funcionando".'],
      siNoFunciona: [
        { problema: 'Se ilumina pero no se ve texto', revisa: 'Gira despacio la perilla azul de atrás con un destornillador pequeño hasta que aparezcan las letras.' },
        { problema: 'Aparecen cuadros negros en la fila de arriba', revisa: 'La dirección no coincide. Cambia 0x27 por 0x3F en el programa y vuelve a subirlo.' },
        { problema: 'No se ilumina', revisa: 'Revisa VCC a la línea roja (VIN) y GND a la negra. Comprueba que el puente de la luz de fondo, en el módulo de atrás, esté puesto.' },
        { problema: 'Error "LiquidCrystal_I2C.h: No such file"', revisa: 'Falta instalar la librería «LiquidCrystal I2C».' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Escribe tu nombre en la fila de arriba y tu curso en la de abajo, centrados. Pista: cuenta las letras y calcula en qué columna empezar.',
      preguntas: [
        { pregunta: '¿Qué hace lcd.setCursor(0, 1)?', opciones: ['Borra la pantalla', 'Coloca la escritura al inicio de la fila de abajo', 'Enciende la luz'], correcta: 1, explicacion: 'El primer número es la columna y el segundo la fila; la fila 1 es la segunda.' },
        { pregunta: '¿Qué ventaja da el módulo I2C?', opciones: ['Usa solo 4 cables en lugar de más de 10', 'Hace la pantalla más grande', 'Le da color'], correcta: 0, explicacion: 'I2C envía todo por dos cables de datos más los dos de energía.' },
        { pregunta: 'La pantalla se ilumina pero no muestra letras. ¿Qué revisas primero?', opciones: ['El cable USB', 'La perilla de contraste', 'El programa completo'], correcta: 1, explicacion: 'Es la causa más frecuente y se arregla en segundos.' },
      ],
    },
  },

  'practica-ldr-monitoreo': {
    reto: {
      texto: 'Vas a medir la luz del ambiente con un número. Será el cuarto dato de tu sistema de monitoreo.',
      paraQue: 'Medir la luz permite saber si un espacio está bien iluminado, si un panel solar recibe sol, o si es de día o de noche.',
      duracion: '25 minutos',
    },
    piezas: [
      { nombre: 'Módulo sensor de luz (LDR)', paraQue: 'Entrega por su pin AOUT un voltaje que cambia con la iluminación.', cuidado: 'Usa AOUT (analógico), no DOUT.' },
      ESP, PROTO,
    ],
    pasos: [
      PLACA,
      R33,
      { titulo: 'Dale energía al módulo', texto: 'Une VCC con la línea roja (3,3 V) y GND con la línea negra.', conexiones: [0, 1] },
      { titulo: 'Conecta la señal', texto: 'Une AOUT con el pin GPIO32 del ESP32.', conexiones: [2] },
      USB_SERIAL,
    ],
    codigo: [
      { titulo: 'Leer la luz', texto: 'analogRead devuelve un número entre 0 y 4095.', fragmento: 'const int PIN_LDR = 32;\n\nint luz = analogRead(PIN_LDR);' },
      { titulo: 'Mostrar el valor', texto: 'Una línea nueva unas tres veces por segundo.', fragmento: 'Serial.print("Luz (0-4095): ");\nSerial.println(luz);\ndelay(300);' },
    ],
    prueba: {
      queDebePasar: ['Aparece un número entre 0 y 4095 que cambia al tapar el sensor.', 'Anota el valor con luz normal y con el sensor tapado.'],
      siNoFunciona: [
        { problema: 'El número no cambia', revisa: 'Comprueba que usas AOUT y que llega a GPIO32.' },
        { problema: 'Siempre marca 0 o 4095', revisa: 'El módulo no tiene energía: VCC a 3,3 V y GND a la línea negra.' },
        SIMBOLOS, NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Convierte la lectura a porcentaje (0 a 100) con map() y muéstrala con el símbolo %.',
      preguntas: [
        { pregunta: '¿Entre qué valores lee analogRead en el ESP32?', opciones: ['0 y 255', '0 y 1023', '0 y 4095'], correcta: 2, explicacion: 'El ESP32 mide con 12 bits.' },
        { pregunta: '¿Qué pin del módulo se usa aquí?', opciones: ['DOUT', 'AOUT', 'Ninguno'], correcta: 1, explicacion: 'AOUT entrega el valor analógico.' },
        { pregunta: '¿Qué hace map(luz, 0, 4095, 0, 100)?', opciones: ['Convierte la lectura a una escala de 0 a 100', 'Borra la lectura', 'La multiplica por 100'], correcta: 0, explicacion: 'Traslada el valor de un rango a otro manteniendo la proporción.' },
      ],
    },
  },

  'monitoreo-automatizacion-iot': {
    reto: {
      texto: 'Vas a construir un panel de monitoreo completo: mide temperatura, humedad, distancia y luz, y lo muestra en una pantalla que alterna sola entre dos vistas cada tres segundos. Si algo se acerca demasiado o la temperatura sube mucho, enciende una luz y una alarma.',
      paraQue: 'Así funcionan los tableros de una fábrica, una estación de bombeo o un centro de datos: muchos sensores, una pantalla que resume todo y alarmas que avisan cuando algo sale de lo normal. Es el proyecto más completo de la Academia.',
      duracion: '120 minutos',
    },
    piezas: [
      { nombre: 'Pantalla LCD 16x2 con I2C', paraQue: 'Muestra los datos sin necesidad de computadora.', cuidado: 'Ajusta el contraste con la perilla azul de atrás.' },
      { nombre: 'Sensor DHT11', paraQue: 'Mide temperatura y humedad.', cuidado: 'Lee las letras de sus pines.' },
      { nombre: 'Sensor ultrasónico HC-SR04P', paraQue: 'Mide la distancia al objeto más cercano.', cuidado: 'Pines en orden: VCC, Trig, Echo, GND.' },
      { nombre: 'Módulo sensor de luz', paraQue: 'Mide la iluminación.', cuidado: 'La señal sale por AOUT.' },
      { nombre: 'LED de alerta con resistencia de 330 Ω y buzzer activo', paraQue: 'Avisan con luz y sonido cuando hay una alerta.', cuidado: 'En ambos, el positivo va al pin del ESP32.' },
      ESP,
    ],
    pasos: [
      { titulo: 'Reparte las líneas de energía', texto: 'Une un pin GND con la línea negra (–). Lleva 3V3 a la línea roja de un lado de la protoboard y VIN (5 V) a la línea roja del otro lado.', rieles: ['3V3', 'VIN', 'GND'], consejo: 'Marca con cinta cuál línea roja es de 3,3 V y cuál de 5 V.' },
      { titulo: 'Conecta la pantalla LCD', texto: 'VCC a la línea de 5 V (VIN), GND a la línea negra, SDA al pin GPIO21 y SCL al pin GPIO22.', conexiones: [1, 3, 5, 6] },
      { titulo: 'Conecta el sensor DHT11', texto: 'VCC a la línea de 3,3 V, GND a la línea negra y DATA al pin GPIO4.', conexiones: [7, 8, 9] },
      { titulo: 'Conecta el sensor de luz', texto: 'VCC a la línea de 3,3 V, GND a la línea negra y AOUT al pin GPIO32.', conexiones: [0, 2, 4] },
      { titulo: 'Conecta el sensor de distancia', texto: 'GND a la línea negra, Trig al pin GPIO17 y Echo al pin GPIO16. Para VCC, usa la alimentación que te indique tu docente.', conexiones: [10, 11, 12, 13], consejo: 'Si este sensor se alimenta con 5 V, su pin Echo devuelve 5 V y los pines del ESP32 son de 3,3 V. Confírmalo con tu docente antes de conectar.' },
      { titulo: 'Conecta el buzzer', texto: 'La pata marcada con + al pin GPIO19 y la otra a la línea negra.', conexiones: [14, 15] },
      { titulo: 'Arma el LED de alerta', texto: 'Pata larga al pin GPIO18 pasando por la resistencia de 330 Ω. Pata corta a la línea negra.', conexiones: [16, 17] },
      { titulo: 'Conecta el USB', texto: 'Revisa una vez más cada cable contra el diagrama y conecta el ESP32 a la computadora.' },
    ],
    codigo: [
      { titulo: 'Los límites están arriba', texto: 'A qué distancia y a qué temperatura se dispara la alerta, y cada cuánto cambia la pantalla.', fragmento: 'const int UMBRAL_DISTANCIA_CM = 20;\nconst float UMBRAL_TEMPERATURA_C = 32.0;\nconst unsigned long INTERVALO_PANTALLA_MS = 3000;' },
      { titulo: 'Cambiar de vista sin detener el programa', texto: 'En lugar de delay(3000), que congelaría los sensores, se usa millis() como reloj. Cuando pasan 3 segundos, se cambia de vista y se limpia la pantalla. El % 2 hace que el contador alterne entre 0 y 1.', fragmento: 'if (millis() - ultimoCambioPantalla >= INTERVALO_PANTALLA_MS) {\n  ultimoCambioPantalla = millis();\n  pantallaActual = (pantallaActual + 1) % 2;\n  lcd.clear();\n}' },
      { titulo: 'Leer los cuatro datos', texto: 'En cada vuelta se leen todos los sensores, aunque solo se muestren dos a la vez. Así la alerta siempre tiene datos actuales.', fragmento: 'float temperatura = dht.readTemperature();\nfloat humedad = dht.readHumidity();\nlong distanciaCm = medirDistanciaCm();\nint luz = analogRead(PIN_LDR);' },
      { titulo: 'Escribir la vista que toca', texto: 'Según el valor de pantallaActual se muestran temperatura y humedad, o distancia y luz. El número después de la coma indica cuántos decimales mostrar.', fragmento: 'if (pantallaActual == 0) {\n  lcd.print("Temp:"); lcd.print(temperatura, 1); lcd.print("C");\n  lcd.setCursor(0, 1);\n  lcd.print("Hum:"); lcd.print(humedad, 0); lcd.print("%");\n}' },
      { titulo: 'La decisión de alerta', texto: 'Hay alerta si algo está a menos de 20 cm, o si la temperatura pasa de 32 grados. Las comprobaciones > 0 e isnan() descartan lecturas fallidas.', fragmento: 'bool alerta = (distanciaCm > 0 && distanciaCm < UMBRAL_DISTANCIA_CM) ||\n              (!isnan(temperatura) && temperatura > UMBRAL_TEMPERATURA_C);' },
      { titulo: 'Avisar', texto: 'El LED sigue el estado de la alerta y el buzzer da un pitido corto en cada vuelta mientras dure.', fragmento: 'digitalWrite(LED_ALERTA, alerta ? HIGH : LOW);\nif (alerta) tone(PIN_BUZZER, 1800, 150);' },
    ],
    prueba: {
      queDebePasar: [
        'La pantalla muestra temperatura y humedad durante 3 segundos, luego distancia y luz, y alterna sola.',
        'Al acercar la mano a menos de 20 cm del sensor de distancia, se enciende el LED y suena el buzzer.',
        'Al retirar la mano, la alerta se apaga.',
        'Los valores de la pantalla cambian al tapar el sensor de luz o al soplar sobre el DHT11.',
      ],
      siNoFunciona: [
        { problema: 'La pantalla se ilumina pero no muestra texto', revisa: 'Ajusta la perilla azul de contraste. Si aparecen cuadros negros, cambia 0x27 por 0x3F en el programa.' },
        { problema: 'Temp y Hum muestran "nan"', revisa: 'El DHT11 no responde: revisa DATA en GPIO4 y su alimentación.' },
        { problema: 'Dist marca -1 todo el tiempo', revisa: 'El eco no llega: revisa Trig en GPIO17, Echo en GPIO16 y la energía del sensor.' },
        { problema: 'La alarma suena sin parar', revisa: 'Hay algo fijo a menos de 20 cm del sensor de distancia, o la temperatura supera 32 grados. Despeja el frente del sensor o sube los límites.' },
        { problema: 'Quedan letras sobrantes en la pantalla', revisa: 'Un número más corto no borra al anterior. Agrega espacios al final de cada lcd.print, por ejemplo "cm  ".' },
        NO_SUBE,
      ],
    },
    demuestra: {
      reto: 'Agrega una tercera vista a la pantalla que muestre solo el estado: "TODO NORMAL" o "ALERTA". Pista: cambia % 2 por % 3 y añade un caso más.',
      preguntas: [
        { pregunta: '¿Por qué se usa millis() para cambiar de vista en lugar de delay(3000)?', opciones: ['Porque durante un delay el programa no puede leer sensores ni activar la alerta', 'Porque millis() es más corto de escribir', 'Porque delay() no funciona en el ESP32'], correcta: 0, explicacion: 'Con millis() el programa mide el tiempo y sigue trabajando.' },
        { pregunta: '¿Qué hace (pantallaActual + 1) % 2?', opciones: ['Cuenta hasta 2 y se detiene', 'Alterna entre 0 y 1', 'Suma 2 cada vez'], correcta: 1, explicacion: 'El resto de dividir para 2 solo puede ser 0 o 1.' },
        { pregunta: '¿Por qué la condición incluye distanciaCm > 0?', opciones: ['Para ignorar lecturas fallidas, que devuelven -1', 'Para medir más lejos', 'Para ahorrar energía'], correcta: 0, explicacion: 'Sin esa comprobación, una lectura fallida se tomaría como un objeto muy cercano.' },
      ],
    },
  },
}
