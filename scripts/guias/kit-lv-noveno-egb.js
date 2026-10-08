// Guías (método de 6 etapas) del kit de 9no EGB — Basurero Inteligente.
// Clave = slug del proyecto en kit_proyectos. Se cargan con scripts/seed-kit-guias.js.
module.exports = {
  "practica-led-tapa": {
    "reto": {
      "texto": "Vas a hacer que un LED se encienda y se apague solo, una vez por segundo. Es el primer programa que escribe cualquier persona que aprende Arduino, y es la luz que después avisará que la tapa del basurero está abierta.",
      "paraQue": "Las luces indicadoras están en todas partes: el foco rojo del televisor en espera, la luz del cargador, el intermitente de un carro. Todas funcionan igual que lo que vas a armar: un programa decide cuándo dejar pasar la corriente.",
      "duracion": "25 minutos"
    },
    "piezas": [
      {
        "nombre": "Arduino Nano",
        "paraQue": "Es el cerebro. Guarda tu programa y decide cuándo enviar corriente por cada uno de sus pines.",
        "cuidado": "Sujétalo por los bordes; no dobles sus patitas al ponerlo en la protoboard."
      },
      {
        "nombre": "Protoboard",
        "paraQue": "Es la base donde se conectan las piezas sin soldar. Los agujeros de una misma fila están unidos por dentro, y las dos líneas largas del borde (roja y negra) sirven para repartir corriente y tierra."
      },
      {
        "nombre": "LED",
        "paraQue": "Es una luz pequeña que se enciende cuando la corriente pasa en el sentido correcto.",
        "cuidado": "Tiene dos patas distintas: la larga es el positivo (ánodo) y la corta el negativo (cátodo). Al revés no se daña, pero no enciende."
      },
      {
        "nombre": "Resistencia de 330 Ω",
        "paraQue": "Frena la corriente para que el LED no se queme. Va siempre en serie con el LED.",
        "cuidado": "Nunca conectes un LED directo a 5V sin resistencia."
      },
      {
        "nombre": "Cables jumper",
        "paraQue": "Llevan la corriente de un punto a otro de la protoboard."
      }
    ],
    "pasos": [
      {
        "titulo": "Coloca el Arduino Nano",
        "texto": "Pon el Nano a caballo sobre el canal central de la protoboard, con el conector USB hacia afuera. Presiona parejo hasta que todas las patitas entren.",
        "consejo": "Si queda a caballo sobre el canal, las patitas de la izquierda y de la derecha no se tocan entre sí."
      },
      {
        "titulo": "Lleva tierra a la línea negra",
        "texto": "Con un cable negro une el pin GND del Nano con la línea negra (–) del borde de la protoboard. Desde ahora, cualquier pieza que necesite tierra la toma de esa línea.",
        "rieles": [
          "GND"
        ]
      },
      {
        "titulo": "Conecta el LED con su resistencia",
        "texto": "Pon el LED en la protoboard con cada pata en una fila distinta. Une la pata larga (ánodo) con un extremo de la resistencia de 330 Ω, y el otro extremo de la resistencia con el pin D8 del Nano.",
        "conexiones": [
          0
        ],
        "consejo": "La resistencia no tiene lado: puede ir en cualquier sentido."
      },
      {
        "titulo": "Cierra el circuito",
        "texto": "Une la pata corta del LED (cátodo) con la línea negra (–). Así la corriente tiene un camino completo: sale de D8, cruza la resistencia y el LED, y vuelve a tierra.",
        "conexiones": [
          1
        ]
      },
      {
        "titulo": "Conecta el cable USB",
        "texto": "Conecta el Nano a la computadora con el cable Mini-USB. Debe encenderse una luz pequeña en la placa: eso indica que tiene energía."
      }
    ],
    "codigo": [
      {
        "titulo": "Dale un nombre al pin",
        "texto": "En lugar de escribir el número 8 por todo el programa, se guarda en una constante llamada LED. Si un día cambias de pin, corriges una sola línea.",
        "fragmento": "const int LED = 8;"
      },
      {
        "titulo": "setup(): se ejecuta una sola vez",
        "texto": "Cuando el Arduino enciende, ejecuta setup() una vez. Aquí le dices que el pin del LED es una salida, es decir, que por ahí va a enviar corriente.",
        "fragmento": "void setup() {\n  pinMode(LED, OUTPUT);\n}"
      },
      {
        "titulo": "loop(): se repite para siempre",
        "texto": "HIGH enciende el LED (5V en el pin) y LOW lo apaga (0V). delay(500) espera 500 milisegundos, que es medio segundo. Al terminar, loop() vuelve a empezar solo.",
        "fragmento": "void loop() {\n  digitalWrite(LED, HIGH);\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}"
      }
    ],
    "prueba": {
      "queDebePasar": [
        "Al subir el programa, el LED se enciende medio segundo y se apaga medio segundo, sin parar.",
        "Si desconectas y vuelves a conectar el USB, el parpadeo empieza de nuevo solo: el programa quedó guardado en el Arduino."
      ],
      "siNoFunciona": [
        {
          "problema": "El LED no enciende nunca",
          "revisa": "Gira el LED: lo más probable es que esté al revés. La pata larga va hacia la resistencia y la corta hacia tierra."
        },
        {
          "problema": "Sigue sin encender",
          "revisa": "Comprueba que el cable de la resistencia llega al pin D8 y no al de al lado, y que la línea negra de la protoboard está unida al GND del Nano."
        },
        {
          "problema": "El programa no se sube",
          "revisa": "En el menú Herramientas elige Placa: Arduino Nano y el Puerto que aparece al conectar el cable. Si da error, cambia Procesador a ATmega328P (Old Bootloader)."
        },
        {
          "problema": "La computadora no detecta el Nano",
          "revisa": "Esta placa usa el chip CH340 y puede necesitar su controlador. Pide ayuda a tu docente para instalarlo y prueba con otro cable USB."
        }
      ]
    },
    "demuestra": {
      "reto": "Haz que el LED parpadee como una señal de auxilio: tres destellos rápidos, una pausa larga, y que se repita. Pista: copia las líneas de encender y apagar, y cambia los números de delay().",
      "preguntas": [
        {
          "pregunta": "¿Para qué sirve la resistencia de 330 Ω?",
          "opciones": [
            "Para que el LED brille más",
            "Para limitar la corriente y que el LED no se queme",
            "Para que el programa corra más rápido"
          ],
          "correcta": 1,
          "explicacion": "La resistencia frena la corriente. Sin ella pasaría demasiada y el LED se dañaría."
        },
        {
          "pregunta": "¿Cuántas veces se ejecuta loop()?",
          "opciones": [
            "Una sola vez",
            "Diez veces",
            "Se repite sin parar mientras haya energía"
          ],
          "correcta": 2,
          "explicacion": "setup() corre una vez al encender; loop() se repite para siempre."
        },
        {
          "pregunta": "Si cambias los dos delay(500) por delay(100), ¿qué pasa?",
          "opciones": [
            "El LED parpadea más rápido",
            "El LED parpadea más lento",
            "El LED queda apagado"
          ],
          "correcta": 0,
          "explicacion": "Menos espera entre encender y apagar significa un parpadeo más rápido."
        }
      ]
    }
  },
  "practica-sensor-distancia": {
    "reto": {
      "texto": "Vas a medir a qué distancia está tu mano sin tocarla, y a ver el número en la pantalla de la computadora cambiando en vivo mientras la acercas y la alejas.",
      "paraQue": "Así funcionan los sensores de estacionamiento de los carros y los robots que esquivan obstáculos. El sensor lanza un sonido que no escuchamos, espera el eco y calcula la distancia, igual que un murciélago.",
      "duracion": "35 minutos"
    },
    "piezas": [
      {
        "nombre": "Sensor ultrasónico HC-SR04",
        "paraQue": "Mide distancias entre 2 cm y unos 4 metros. Uno de sus \"ojos\" emite el sonido y el otro escucha el eco.",
        "cuidado": "Tiene 4 pines en este orden: VCC, Trig, Echo, GND. Léelos impresos en la placa antes de conectar."
      },
      {
        "nombre": "Arduino Nano",
        "paraQue": "Le ordena al sensor disparar el sonido, mide cuánto tarda el eco y convierte ese tiempo en centímetros."
      },
      {
        "nombre": "Protoboard y cables jumper",
        "paraQue": "Sostienen el sensor y llevan corriente, tierra y las dos señales."
      }
    ],
    "pasos": [
      {
        "titulo": "Reparte corriente y tierra",
        "texto": "Une el pin 5V del Nano con la línea roja (+) de la protoboard y el pin GND con la línea negra (–). Usa cable rojo para 5V y negro para tierra: así nunca los confundes.",
        "rieles": [
          "5V",
          "GND"
        ]
      },
      {
        "titulo": "Coloca el sensor y dale energía",
        "texto": "Pon el sensor en la protoboard con los \"ojos\" mirando hacia afuera. Une su pin VCC con la línea roja y su pin GND con la línea negra.",
        "conexiones": [
          0,
          1
        ],
        "consejo": "VCC y GND están en los extremos del sensor. Si los cruzas, el sensor se calienta: desconecta de inmediato."
      },
      {
        "titulo": "Conecta Trig (el disparo)",
        "texto": "Une el pin Trig del sensor con el pin D9 del Nano. Por este cable el Arduino le dice al sensor: \"lanza el sonido ahora\".",
        "conexiones": [
          2
        ]
      },
      {
        "titulo": "Conecta Echo (la respuesta)",
        "texto": "Une el pin Echo del sensor con el pin D10 del Nano. Por este cable el sensor avisa cuánto tardó en volver el eco.",
        "conexiones": [
          3
        ]
      },
      {
        "titulo": "Conecta el USB y abre el Monitor Serial",
        "texto": "Conecta el Nano a la computadora. Después de subir el programa, abre el Monitor Serial (el ícono de lupa, arriba a la derecha) y elige 9600 baudios abajo a la derecha."
      }
    ],
    "codigo": [
      {
        "titulo": "Nombres para los dos pines",
        "texto": "Trig es por donde el Arduino habla y Echo por donde escucha.",
        "fragmento": "const int TRIG = 9;\nconst int ECHO = 10;"
      },
      {
        "titulo": "Preparar pines y pantalla",
        "texto": "TRIG es salida porque el Arduino envía la orden; ECHO es entrada porque recibe la respuesta. Serial.begin(9600) abre la comunicación con la computadora.",
        "fragmento": "pinMode(TRIG, OUTPUT);\npinMode(ECHO, INPUT);\nSerial.begin(9600);"
      },
      {
        "titulo": "Disparar el sonido",
        "texto": "Se apaga Trig un instante para empezar limpio, se enciende durante 10 microsegundos y se apaga otra vez. Ese pulso corto es la orden de disparo.",
        "fragmento": "digitalWrite(TRIG, LOW);\ndelayMicroseconds(2);\ndigitalWrite(TRIG, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(TRIG, LOW);"
      },
      {
        "titulo": "Medir el eco y convertirlo a centímetros",
        "texto": "pulseIn() mide cuántos microsegundos tarda en volver el eco. El sonido recorre 1 cm de ida y 1 cm de vuelta en unos 58 microsegundos; por eso se divide para 58.",
        "fragmento": "long duracion = pulseIn(ECHO, HIGH, 25000);\nlong distanciaCm = duracion / 58;"
      },
      {
        "titulo": "Mostrar el resultado",
        "texto": "Serial.print escribe en la pantalla de la computadora. La pausa de 300 ms evita que los números pasen demasiado rápido para leerlos.",
        "fragmento": "Serial.print(\"Distancia: \");\nSerial.print(distanciaCm);\nSerial.println(\" cm\");\ndelay(300);"
      }
    ],
    "prueba": {
      "queDebePasar": [
        "En el Monitor Serial aparece una línea nueva unas tres veces por segundo: \"Distancia: 23 cm\".",
        "Al acercar la mano el número baja; al alejarla, sube.",
        "Con una regla, la distancia que marca se parece a la real (puede variar 1 o 2 cm)."
      ],
      "siNoFunciona": [
        {
          "problema": "Siempre marca 0 cm",
          "revisa": "El eco no está llegando. Revisa que Echo vaya a D10 y Trig a D9: es muy común tenerlos cruzados."
        },
        {
          "problema": "Salen símbolos raros en lugar de números",
          "revisa": "La velocidad del Monitor Serial no coincide. Elige 9600 baudios abajo a la derecha."
        },
        {
          "problema": "Los números saltan mucho",
          "revisa": "Apunta el sensor a una superficie plana y dura, como un cuaderno. La ropa y las superficies inclinadas devuelven mal el eco."
        },
        {
          "problema": "No aparece nada en el Monitor Serial",
          "revisa": "Comprueba que el sensor tiene energía: VCC a la línea roja y GND a la línea negra, y que esas líneas llegan a 5V y GND del Nano."
        }
      ]
    },
    "demuestra": {
      "reto": "Agrega una condición: si la distancia es menor a 10 cm, que además escriba \"¡Muy cerca!\". Pista: usa if (distanciaCm < 10) { ... } antes del delay.",
      "preguntas": [
        {
          "pregunta": "¿Qué hace el pin Trig?",
          "opciones": [
            "Recibe el eco",
            "Le da la orden al sensor de lanzar el sonido",
            "Le da energía al sensor"
          ],
          "correcta": 1,
          "explicacion": "Trig dispara el sonido; Echo es el que devuelve la respuesta."
        },
        {
          "pregunta": "¿Por qué se divide la duración para 58?",
          "opciones": [
            "Porque el sonido tarda unos 58 microsegundos en ir y volver 1 cm",
            "Porque el sensor tiene 58 pines",
            "Es un número al azar"
          ],
          "correcta": 0,
          "explicacion": "El tiempo medido incluye la ida y la vuelta del sonido. 58 microsegundos equivalen a 1 cm de distancia."
        },
        {
          "pregunta": "¿Para qué sirve el Monitor Serial?",
          "opciones": [
            "Para darle energía al Arduino",
            "Para ver en la computadora los datos que envía el Arduino",
            "Para subir el programa"
          ],
          "correcta": 1,
          "explicacion": "Es una ventana para leer lo que el Arduino escribe con Serial.print."
        }
      ]
    }
  },
  "practica-servomotor": {
    "reto": {
      "texto": "Vas a hacer que un motor gire exactamente hasta donde tú le digas y regrese: de 0 a 90 grados, una y otra vez. Ese movimiento es el que después abrirá y cerrará la tapa del basurero.",
      "paraQue": "Un servomotor no gira sin parar como el motor de un ventilador: se mueve a un ángulo exacto y se queda ahí. Por eso se usa en brazos robóticos, en el timón de los aviones a control remoto y en cerraduras electrónicas.",
      "duracion": "30 minutos"
    },
    "piezas": [
      {
        "nombre": "Servomotor SG90",
        "paraQue": "Motor pequeño que gira entre 0 y 180 grados y mantiene la posición que le ordenas.",
        "cuidado": "Tiene 3 cables: café es tierra, rojo es 5V y naranja es la señal. No lo gires a la fuerza con la mano: se dañan sus engranajes."
      },
      {
        "nombre": "Brazo del servo",
        "paraQue": "La pieza plástica blanca que se encaja en el eje. Es la que empujará la tapa del basurero."
      },
      {
        "nombre": "Arduino Nano",
        "paraQue": "Le envía al servo la orden de a qué ángulo moverse por el pin D6."
      },
      {
        "nombre": "Protoboard y cables jumper",
        "paraQue": "Como el conector del servo es hembra, necesitas tres jumper macho-macho para unirlo a la protoboard."
      }
    ],
    "pasos": [
      {
        "titulo": "Reparte corriente y tierra",
        "texto": "Une el pin 5V del Nano con la línea roja (+) de la protoboard y el pin GND con la línea negra (–).",
        "rieles": [
          "5V",
          "GND"
        ]
      },
      {
        "titulo": "Dale energía al servo",
        "texto": "Inserta un jumper en cada agujero del conector del servo. El del cable rojo va a la línea roja (+) y el del cable café va a la línea negra (–).",
        "conexiones": [
          1,
          2
        ],
        "consejo": "Guíate siempre por el color del cable del servo, no por la posición."
      },
      {
        "titulo": "Conecta la señal",
        "texto": "Une el cable naranja del servo con el pin D6 del Nano. Por ahí viaja la orden del ángulo.",
        "conexiones": [
          0
        ]
      },
      {
        "titulo": "Coloca el brazo y conecta el USB",
        "texto": "Encaja el brazo plástico en el eje del servo, sin atornillarlo todavía. Conecta el Nano a la computadora."
      }
    ],
    "codigo": [
      {
        "titulo": "Incluir la librería Servo",
        "texto": "Una librería es código ya hecho por otras personas. Esta sabe cómo hablarle a un servomotor, así tú solo escribes el ángulo.",
        "fragmento": "#include <Servo.h>"
      },
      {
        "titulo": "Crear el servo",
        "texto": "Se guarda el número del pin y se crea un objeto llamado motor. A partir de aquí, motor representa a tu servo.",
        "fragmento": "const int SERVO_PIN = 6;\nServo motor;"
      },
      {
        "titulo": "Decir en qué pin está",
        "texto": "attach() conecta el objeto motor con el pin D6. Se hace una sola vez, en setup().",
        "fragmento": "void setup() {\n  motor.attach(SERVO_PIN);\n}"
      },
      {
        "titulo": "Moverlo",
        "texto": "write(0) lo lleva a 0 grados y write(90) a 90 grados. La pausa de 800 ms le da tiempo de llegar antes de la siguiente orden.",
        "fragmento": "void loop() {\n  motor.write(0);\n  delay(800);\n  motor.write(90);\n  delay(800);\n}"
      }
    ],
    "prueba": {
      "queDebePasar": [
        "El brazo del servo gira un cuarto de vuelta, espera, regresa y repite.",
        "El movimiento es firme y siempre llega al mismo punto."
      ],
      "siNoFunciona": [
        {
          "problema": "El servo no se mueve",
          "revisa": "Revisa los colores: rojo a la línea roja, café a la línea negra y naranja a D6. Comprueba que las líneas roja y negra llegan a 5V y GND del Nano."
        },
        {
          "problema": "El servo vibra o tiembla sin girar bien",
          "revisa": "Le falta corriente. Prueba con otro puerto USB o conecta la batería de 9V al pin VIN y a GND con ayuda de tu docente."
        },
        {
          "problema": "El Arduino se reinicia cuando el servo arranca",
          "revisa": "El motor consume mucho al empezar a moverse. Usa un cable USB corto y en buen estado, o la batería de 9V."
        },
        {
          "problema": "Da error \"Servo.h: No such file\"",
          "revisa": "Falta la librería. En el programa Arduino abre Herramientas > Administrar bibliotecas, busca Servo e instálala."
        }
      ]
    },
    "demuestra": {
      "reto": "Haz que el servo recorra tres posiciones: 0, 90 y 180 grados, con una pausa de un segundo en cada una. Luego marca con un lápiz hasta dónde llega el brazo en cada posición.",
      "preguntas": [
        {
          "pregunta": "¿Qué cable del servo lleva la orden del ángulo?",
          "opciones": [
            "El rojo",
            "El café",
            "El naranja"
          ],
          "correcta": 2,
          "explicacion": "Rojo es 5V, café es tierra y naranja es la señal."
        },
        {
          "pregunta": "¿Qué hace motor.write(90)?",
          "opciones": [
            "Hace girar el motor 90 vueltas",
            "Lleva el brazo a la posición de 90 grados",
            "Apaga el motor durante 90 segundos"
          ],
          "correcta": 1,
          "explicacion": "write() recibe un ángulo entre 0 y 180 y el servo se mueve a esa posición."
        },
        {
          "pregunta": "¿En qué se diferencia un servomotor de un motor común?",
          "opciones": [
            "Gira más rápido",
            "Se mueve a un ángulo exacto y se queda ahí",
            "No necesita energía"
          ],
          "correcta": 1,
          "explicacion": "Un motor común gira sin parar; un servo va a una posición exacta."
        }
      ]
    }
  },
  "basurero-inteligente": {
    "reto": {
      "texto": "Vas a construir un basurero que abre su tapa solo cuando acercas la mano, la mantiene abierta tres segundos y la vuelve a cerrar. Une todo lo que practicaste: el sensor mide, el servo mueve la tapa y el LED avisa.",
      "paraQue": "Los basureros sin contacto se usan en hospitales, cocinas y baños públicos porque evitan tocar la tapa y pasar gérmenes de una persona a otra. Es un ejemplo real de automatización: un sensor detecta algo y una máquina responde sola.",
      "duracion": "60 minutos"
    },
    "piezas": [
      {
        "nombre": "Sensor ultrasónico HC-SR04",
        "paraQue": "Detecta si hay una mano cerca midiendo la distancia. Es el \"ojo\" del basurero.",
        "cuidado": "Pines en orden: VCC, Trig, Echo, GND."
      },
      {
        "nombre": "Servomotor SG90",
        "paraQue": "Empuja la tapa para abrirla y la suelta para cerrarla. Es el \"músculo\".",
        "cuidado": "Café es tierra, rojo es 5V y naranja es la señal. No lo fuerces con la mano."
      },
      {
        "nombre": "LED con resistencia de 330 Ω",
        "paraQue": "Parpadea tres veces al abrir y queda encendido mientras la tapa está abierta.",
        "cuidado": "Pata larga hacia la resistencia, pata corta hacia tierra."
      },
      {
        "nombre": "Arduino Nano",
        "paraQue": "Lee el sensor muchas veces por segundo y decide cuándo mover el servo y encender el LED."
      },
      {
        "nombre": "Protoboard y cables jumper",
        "paraQue": "Sostienen las piezas y reparten corriente y tierra a las tres."
      }
    ],
    "pasos": [
      {
        "titulo": "Reparte corriente y tierra",
        "texto": "Une el pin 5V del Nano con la línea roja (+) de la protoboard y el pin GND con la línea negra (–). Las tres piezas tomarán energía de estas dos líneas.",
        "rieles": [
          "5V",
          "GND"
        ],
        "consejo": "Cable rojo para 5V y negro para tierra. Hazlo siempre igual y evitarás la mayoría de errores."
      },
      {
        "titulo": "Dale energía al sensor",
        "texto": "Coloca el sensor con los \"ojos\" hacia el frente del basurero. Une VCC con la línea roja y GND con la línea negra.",
        "conexiones": [
          0,
          1
        ]
      },
      {
        "titulo": "Conecta las señales del sensor",
        "texto": "Une Trig con el pin D9 y Echo con el pin D10 del Nano.",
        "conexiones": [
          2,
          3
        ],
        "consejo": "Usa dos colores distintos para no cruzarlos."
      },
      {
        "titulo": "Dale energía al servo",
        "texto": "Con dos jumper, lleva el cable rojo del servo a la línea roja y el cable café a la línea negra.",
        "conexiones": [
          5,
          6
        ]
      },
      {
        "titulo": "Conecta la señal del servo",
        "texto": "Une el cable naranja del servo con el pin D6 del Nano.",
        "conexiones": [
          4
        ]
      },
      {
        "titulo": "Conecta el LED con su resistencia",
        "texto": "Une la pata larga del LED con la resistencia de 330 Ω y el otro extremo de la resistencia con el pin D8. La pata corta va a la línea negra.",
        "conexiones": [
          7,
          8
        ]
      },
      {
        "titulo": "Monta todo en el basurero",
        "texto": "Pega el sensor en el frente, mirando hacia donde se acerca la mano. Fija el servo junto a la bisagra de modo que su brazo, al subir, levante la tapa. Prueba el recorrido a mano antes de pegar definitivamente.",
        "consejo": "Usa cinta primero y pegamento después: es normal tener que ajustar la posición del servo."
      }
    ],
    "codigo": [
      {
        "titulo": "Los ajustes están arriba",
        "texto": "Todos los números que quizá quieras cambiar están juntos al inicio: a qué distancia abre, hasta dónde gira la tapa y cuánto tiempo queda abierta. Para ajustar el basurero cambias aquí, sin tocar el resto.",
        "fragmento": "const int DISTANCIA_APERTURA_CM = 15;\nconst int ANGULO_CERRADO = 0;\nconst int ANGULO_ABIERTO = 90;\nconst unsigned long TIEMPO_ABIERTA_MS = 3000;"
      },
      {
        "titulo": "Preparar todo al encender",
        "texto": "Se configuran los pines, se conecta el servo y se cierra la tapa, para empezar siempre en la misma posición.",
        "fragmento": "pinMode(TRIG, OUTPUT);\npinMode(ECHO, INPUT);\npinMode(LED_TAPA, OUTPUT);\ntapa.attach(SERVO_PIN);\ntapa.write(ANGULO_CERRADO);"
      },
      {
        "titulo": "La decisión: medir y comparar",
        "texto": "Esta es la idea central del proyecto. El Arduino mide la distancia y, solo si hay algo a 15 cm o menos, abre la tapa. La condición \"mayor que 0\" descarta las lecturas fallidas.",
        "fragmento": "long distancia = medirDistanciaCm();\nif (distancia > 0 && distancia <= DISTANCIA_APERTURA_CM) {\n  abrirTapa();\n}"
      },
      {
        "titulo": "Una función para medir",
        "texto": "Es lo mismo que hiciste en la práctica del sensor, guardado dentro de una función con nombre. Si el eco no vuelve, devuelve -1 para avisar que la lectura no sirve.",
        "fragmento": "long duracion = pulseIn(ECHO, HIGH, 25000);\nif (duracion == 0) return -1;\nreturn duracion / 58;"
      },
      {
        "titulo": "Una función para abrir y cerrar",
        "texto": "Abre la tapa, avisa con el LED, espera tres segundos, cierra y apaga el LED. La pausa final de medio segundo evita que se vuelva a abrir de inmediato si la mano sigue ahí.",
        "fragmento": "tapa.write(ANGULO_ABIERTO);\nparpadearConfirmacion();\ndelay(TIEMPO_ABIERTA_MS);\ntapa.write(ANGULO_CERRADO);\ndigitalWrite(LED_TAPA, LOW);\ndelay(500);"
      },
      {
        "titulo": "El aviso con el LED",
        "texto": "Un bucle for repite tres veces encender y apagar rápido. Al terminar deja el LED encendido mientras la tapa sigue abierta.",
        "fragmento": "for (int i = 0; i < 3; i++) {\n  digitalWrite(LED_TAPA, HIGH);\n  delay(100);\n  digitalWrite(LED_TAPA, LOW);\n  delay(100);\n}\ndigitalWrite(LED_TAPA, HIGH);"
      }
    ],
    "prueba": {
      "queDebePasar": [
        "Al conectar el USB, la tapa se cierra y el LED está apagado.",
        "Al acercar la mano a menos de 15 cm, la tapa se abre y el LED parpadea tres veces y queda encendido.",
        "Tres segundos después la tapa se cierra sola y el LED se apaga.",
        "Si no hay nada cerca, la tapa permanece cerrada."
      ],
      "siNoFunciona": [
        {
          "problema": "La tapa no se abre al acercar la mano",
          "revisa": "Prueba primero el sensor solo con la práctica 2. Si ahí marca 0 cm, Trig y Echo están cruzados o el sensor no tiene energía."
        },
        {
          "problema": "La tapa se abre sola, sin nadie cerca",
          "revisa": "El sensor está viendo algo fijo: el borde del basurero, la mesa o la propia tapa. Muévelo o inclínalo, o baja DISTANCIA_APERTURA_CM a 10."
        },
        {
          "problema": "El servo se mueve pero la tapa no sube",
          "revisa": "El brazo no está empujando en el punto correcto. Acércalo a la bisagra y prueba con ANGULO_ABIERTO en 120."
        },
        {
          "problema": "La tapa abre al revés",
          "revisa": "Intercambia los valores: ANGULO_CERRADO en 90 y ANGULO_ABIERTO en 0."
        },
        {
          "problema": "El Arduino se reinicia al abrir",
          "revisa": "El servo pide más corriente de la que da el USB cuando levanta peso. Aligera la tapa o alimenta el Nano con la batería de 9V por el pin VIN."
        },
        {
          "problema": "El LED no enciende",
          "revisa": "Gira el LED y comprueba que la resistencia llega al pin D8."
        }
      ]
    },
    "demuestra": {
      "reto": "Mejora tu basurero: cambia los ajustes para que abra a 25 cm y quede abierto cinco segundos. Después explica a un compañero qué número cambiaste y por qué.",
      "preguntas": [
        {
          "pregunta": "¿Qué pieza decide cuándo se abre la tapa?",
          "opciones": [
            "El sensor, él solo",
            "El Arduino, comparando la distancia medida con 15 cm",
            "El servomotor"
          ],
          "correcta": 1,
          "explicacion": "El sensor solo mide. El Arduino compara esa medida con el límite y da la orden al servo."
        },
        {
          "pregunta": "¿Para qué sirve la condición distancia > 0?",
          "opciones": [
            "Para ignorar las lecturas fallidas del sensor",
            "Para que abra más rápido",
            "Para encender el LED"
          ],
          "correcta": 0,
          "explicacion": "Cuando el eco no vuelve, la función devuelve -1. Sin esa condición, una lectura fallida abriría la tapa."
        },
        {
          "pregunta": "Quieres que la tapa quede abierta más tiempo. ¿Qué cambias?",
          "opciones": [
            "DISTANCIA_APERTURA_CM",
            "ANGULO_ABIERTO",
            "TIEMPO_ABIERTA_MS"
          ],
          "correcta": 2,
          "explicacion": "TIEMPO_ABIERTA_MS es la espera, en milisegundos, antes de cerrar. 5000 serían cinco segundos."
        }
      ]
    }
  }
}
