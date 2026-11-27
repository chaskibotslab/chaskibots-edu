// GENERADO por scripts/ldraw/modelos.js — no editar a mano.
const datos = [
  {
    "id": "carrito",
    "nombre": "Carrito de dos motores",
    "emoji": "🚗",
    "descripcion": "Tu primer chasis: dos motores unidos por ejes y bujes, rueda loca y dos ruedas.",
    "archivo": "/ldraw/carrito.mpd",
    "simulable": false,
    "lineas": [],
    "equipo": "Sin ladrillo ni sensores",
    "ruedas": [
      7,
      8
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "basico",
    "nombre": "Robot básico",
    "emoji": "🚙",
    "descripcion": "El primer robot que se puede programar: chasis, ladrillo y dos ruedas. Sin sensores.",
    "archivo": "/ldraw/basico.mpd",
    "simulable": true,
    "lineas": [],
    "equipo": "Solo motores y ladrillo: el más fácil para empezar",
    "ruedas": [
      11,
      12
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "guardian",
    "nombre": "Robot guardián",
    "emoji": "👁️",
    "descripcion": "Un robot con un solo «ojo»: el sensor infrarrojo que mide la distancia a lo que tiene enfrente.",
    "archivo": "/ldraw/guardian.mpd",
    "simulable": true,
    "lineas": [],
    "equipo": "Sensor infrarrojo al frente",
    "ruedas": [
      15,
      16
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_7",
        "titulo": "Vigas verticales de 7 (2)",
        "info": "Dos vigas paradas por dentro de los brazos de los motores. Sus agujeros miran de lado, igual que los del brazo.",
        "piezas": 2
      },
      {
        "tipo": "viga_3",
        "titulo": "Vigas verticales de 3 (2)",
        "info": "Dos vigas cortas, más atrás, también por dentro de los brazos: son el segundo apoyo del sensor.",
        "piezas": 2
      },
      {
        "tipo": "sensor_ir",
        "titulo": "Sensor infrarrojo",
        "info": "Va entre los brazos de los motores, mirando al frente: mide la distancia a los obstáculos.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "explorador",
    "nombre": "Robot explorador EV3",
    "emoji": "🤖",
    "descripcion": "El robot completo: ladrillo, sensor infrarrojo al frente y sensor de color al piso, todo sujeto con pines.",
    "archivo": "/ldraw/ev3-robot.mpd",
    "simulable": true,
    "lineas": [
      0
    ],
    "equipo": "Infrarrojo al frente + 1 sensor de color",
    "ruedas": [
      17,
      18
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_7",
        "titulo": "Vigas verticales de 7 (2)",
        "info": "Dos vigas paradas por dentro de los brazos de los motores. Sus agujeros miran de lado, igual que los del brazo.",
        "piezas": 2
      },
      {
        "tipo": "viga_3",
        "titulo": "Vigas verticales de 3 (2)",
        "info": "Dos vigas cortas, más atrás, también por dentro de los brazos: son el segundo apoyo del sensor.",
        "piezas": 2
      },
      {
        "tipo": "sensor_ir",
        "titulo": "Sensor infrarrojo",
        "info": "Va entre los brazos de los motores, mirando al frente: mide la distancia a los obstáculos.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensor de color",
        "info": "Entre las dos vigas verticales, mirando al piso: verá líneas y colores.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del sensor de color (4)",
        "info": "Dos pines por lado sujetan el sensor a las vigas verticales. Con dos pines una pieza no puede girar.",
        "piezas": 4
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "seguidor",
    "nombre": "Seguidor de línea",
    "emoji": "〰️",
    "descripcion": "Ladrillo y un sensor de color mirando al piso, listo para seguir una línea negra.",
    "archivo": "/ldraw/seguidor.mpd",
    "simulable": true,
    "lineas": [
      0
    ],
    "equipo": "1 sensor de color al piso",
    "ruedas": [
      15,
      16
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_7",
        "titulo": "Vigas verticales de 7 (2)",
        "info": "Dos vigas paradas por dentro de los brazos de los motores. Sus agujeros miran de lado, igual que los del brazo.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las vigas (2)",
        "info": "Un pin negro une cada viga vertical con el brazo de su motor. El pin negro aprieta: la viga ya no gira.",
        "piezas": 2
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensor de color",
        "info": "Entre las dos vigas verticales, mirando al piso: verá líneas y colores.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del sensor de color (4)",
        "info": "Dos pines por lado sujetan el sensor a las vigas verticales. Con dos pines una pieza no puede girar.",
        "piezas": 4
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "parachoques",
    "nombre": "Robot con parachoques",
    "emoji": "🛡️",
    "descripcion": "Un sensor táctil al frente con un eje y un buje de parachoques: el robot sabe cuándo chocó.",
    "archivo": "/ldraw/parachoques.mpd",
    "simulable": true,
    "lineas": [],
    "equipo": "Sensor táctil con parachoques",
    "ruedas": [
      17,
      18
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_7",
        "titulo": "Vigas verticales de 7 (2)",
        "info": "Dos vigas paradas por dentro de los brazos de los motores. Sus agujeros miran de lado, igual que los del brazo.",
        "piezas": 2
      },
      {
        "tipo": "viga_3",
        "titulo": "Vigas verticales de 3 (2)",
        "info": "Dos vigas cortas, más atrás, también por dentro de los brazos: son el segundo apoyo del sensor.",
        "piezas": 2
      },
      {
        "tipo": "sensor_tactil",
        "titulo": "Sensor táctil",
        "info": "Va entre los brazos de los motores, con el botón rojo hacia adelante.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "eje_3",
        "titulo": "Eje del parachoques",
        "info": "El botón rojo del sensor táctil tiene un agujero en cruz: ahí entra un eje de 3.",
        "piezas": 1
      },
      {
        "tipo": "buje",
        "titulo": "Buje del parachoques",
        "info": "Un buje en la punta del eje: es lo primero que toca la pared y empuja el botón.",
        "piezas": 1
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "giroscopio",
    "nombre": "Robot con giroscopio",
    "emoji": "🧭",
    "descripcion": "Un giroscopio entre los motores para girar ángulos exactos, y sensor de color al piso.",
    "archivo": "/ldraw/giroscopio.mpd",
    "simulable": true,
    "lineas": [
      0
    ],
    "equipo": "Giroscopio + 1 sensor de color",
    "ruedas": [
      17,
      18
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_7",
        "titulo": "Vigas verticales de 7 (2)",
        "info": "Dos vigas paradas por dentro de los brazos de los motores. Sus agujeros miran de lado, igual que los del brazo.",
        "piezas": 2
      },
      {
        "tipo": "viga_3",
        "titulo": "Vigas verticales de 3 (2)",
        "info": "Dos vigas cortas, más atrás, también por dentro de los brazos: son el segundo apoyo del sensor.",
        "piezas": 2
      },
      {
        "tipo": "sensor_giro",
        "titulo": "Giroscopio",
        "info": "Va entre los brazos de los motores. Siente cuánto ha girado el robot.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensor de color",
        "info": "Entre las dos vigas verticales, mirando al piso: verá líneas y colores.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del sensor de color (4)",
        "info": "Dos pines por lado sujetan el sensor a las vigas verticales. Con dos pines una pieza no puede girar.",
        "piezas": 4
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "seguidor2",
    "nombre": "Seguidor de 2 sensores",
    "emoji": "👀",
    "descripcion": "Dos sensores de color al frente, uno a cada lado de la línea: sigue pistas con curvas mucho más rápido.",
    "archivo": "/ldraw/seguidor2.mpd",
    "simulable": true,
    "lineas": [
      -3.6,
      3.6
    ],
    "equipo": "2 sensores de color al frente + infrarrojo",
    "ruedas": [
      19,
      20
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_9",
        "titulo": "Vigas de 9 hacia adelante (2)",
        "info": "Dos vigas largas acostadas por dentro de los brazos de los motores, apuntando al frente. Serán los «brazos» que sostienen los sensores de línea.",
        "piezas": 2
      },
      {
        "tipo": "sensor_ir",
        "titulo": "Sensor infrarrojo",
        "info": "Va entre los brazos de los motores, mirando al frente: mide la distancia a los obstáculos.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "viga_L35",
        "titulo": "Vigas en L 3×5 (2)",
        "info": "En la punta de cada brazo, una viga en L: su parte corta se apoya en el brazo y su parte larga baja hacia el piso.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las L (4)",
        "info": "Dos pines por cada L. Con dos pines la L queda rígida: no puede balancearse.",
        "piezas": 4
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensores de color izquierdo y derecho (2)",
        "info": "Dos sensores mirando al piso, uno a cada lado. La línea negra pasará entre los dos.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de los sensores (4)",
        "info": "Dos pines sujetan cada sensor a su viga en L.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Eje de 8 que une los sensores",
        "info": "Un eje largo atraviesa el centro en cruz de los dos sensores y las dos L: todo el frente queda como una sola pieza.",
        "piezas": 1
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "seguidor4",
    "nombre": "Seguidor de 4 sensores",
    "emoji": "🏁",
    "descripcion": "Cuatro sensores de color en fila: el robot de competencia que ve curvas cerradas y cruces.",
    "archivo": "/ldraw/seguidor4.mpd",
    "simulable": true,
    "lineas": [
      -7.2,
      -3.6,
      3.6,
      7.2
    ],
    "equipo": "4 sensores de color al frente + infrarrojo",
    "ruedas": [
      21,
      22
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_9",
        "titulo": "Vigas de 9 hacia adelante (2)",
        "info": "Dos vigas largas acostadas por dentro de los brazos de los motores, apuntando al frente. Serán los «brazos» que sostienen los sensores de línea.",
        "piezas": 2
      },
      {
        "tipo": "sensor_ir",
        "titulo": "Sensor infrarrojo",
        "info": "Va entre los brazos de los motores, mirando al frente: mide la distancia a los obstáculos.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "viga_L35",
        "titulo": "Vigas en L 3×5 (2)",
        "info": "En la punta de cada brazo, una viga en L: su parte corta se apoya en el brazo y su parte larga baja hacia el piso.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las L (4)",
        "info": "Dos pines por cada L. Con dos pines la L queda rígida: no puede balancearse.",
        "piezas": 4
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensores de color izquierdo y derecho (2)",
        "info": "Dos sensores mirando al piso, uno a cada lado. La línea negra pasará entre los dos.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de los sensores (4)",
        "info": "Dos pines sujetan cada sensor a su viga en L.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Eje de 8 que une los sensores",
        "info": "Un eje largo atraviesa el centro en cruz de los dos sensores y las dos L: todo el frente queda como una sola pieza.",
        "piezas": 1
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensores de color exteriores (2)",
        "info": "Dos sensores más, por fuera de los primeros. Con cuatro «ojos» el robot ve curvas cerradas y cruces.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros entre sensores (4)",
        "info": "Cada sensor exterior se une a su vecino con dos pines, lado con lado.",
        "piezas": 4
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "sumo",
    "nombre": "Robot sumo",
    "emoji": "🥋",
    "descripcion": "Robot de combate: infrarrojo para encontrar al rival, dos sensores para no salirse del ring y un embestidor al frente.",
    "archivo": "/ldraw/sumo.mpd",
    "simulable": true,
    "lineas": [
      -3.6,
      3.6
    ],
    "equipo": "Infrarrojo para buscar al rival + 2 sensores de borde + embestidor",
    "ruedas": [
      21,
      22
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_15",
        "titulo": "Vigas de 15 hacia adelante (2)",
        "info": "Dos vigas largas acostadas por dentro de los brazos de los motores, apuntando al frente. Serán los «brazos» que sostienen los sensores de línea.",
        "piezas": 2
      },
      {
        "tipo": "sensor_ir",
        "titulo": "Sensor infrarrojo",
        "info": "Va entre los brazos de los motores, mirando al frente: mide la distancia a los obstáculos.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "viga_L35",
        "titulo": "Vigas en L 3×5 (2)",
        "info": "En la punta de cada brazo, una viga en L: su parte corta se apoya en el brazo y su parte larga baja hacia el piso.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las L (4)",
        "info": "Dos pines por cada L. Con dos pines la L queda rígida: no puede balancearse.",
        "piezas": 4
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensores de color izquierdo y derecho (2)",
        "info": "Dos sensores mirando al piso, uno a cada lado. La línea negra pasará entre los dos.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de los sensores (4)",
        "info": "Dos pines sujetan cada sensor a su viga en L.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Eje de 8 que une los sensores",
        "info": "Un eje largo atraviesa el centro en cruz de los dos sensores y las dos L: todo el frente queda como una sola pieza.",
        "piezas": 1
      },
      {
        "tipo": "eje_5",
        "titulo": "Eje del embestidor",
        "info": "Un eje de 5 cruza la punta de los dos brazos largos: es la barra que empuja al rival.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes del embestidor (2)",
        "info": "Un medio buje por dentro de cada brazo para que el eje no se salga.",
        "piezas": 2
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "sumo_tactil",
    "nombre": "Sumo táctil",
    "emoji": "🤼",
    "descripcion": "Un sumo que no ve al rival: lo siente con el sensor táctil. Dos sensores cuidan el borde del ring.",
    "archivo": "/ldraw/sumo-tactil.mpd",
    "simulable": true,
    "lineas": [
      -3.6,
      3.6
    ],
    "equipo": "Sensor táctil + 2 sensores de borde + embestidor",
    "ruedas": [
      21,
      22
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_15",
        "titulo": "Vigas de 15 hacia adelante (2)",
        "info": "Dos vigas largas acostadas por dentro de los brazos de los motores, apuntando al frente. Serán los «brazos» que sostienen los sensores de línea.",
        "piezas": 2
      },
      {
        "tipo": "sensor_tactil",
        "titulo": "Sensor táctil",
        "info": "Va entre los brazos de los motores, con el botón rojo hacia adelante.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "viga_L35",
        "titulo": "Vigas en L 3×5 (2)",
        "info": "En la punta de cada brazo, una viga en L: su parte corta se apoya en el brazo y su parte larga baja hacia el piso.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las L (4)",
        "info": "Dos pines por cada L. Con dos pines la L queda rígida: no puede balancearse.",
        "piezas": 4
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensores de color izquierdo y derecho (2)",
        "info": "Dos sensores mirando al piso, uno a cada lado. La línea negra pasará entre los dos.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de los sensores (4)",
        "info": "Dos pines sujetan cada sensor a su viga en L.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Eje de 8 que une los sensores",
        "info": "Un eje largo atraviesa el centro en cruz de los dos sensores y las dos L: todo el frente queda como una sola pieza.",
        "piezas": 1
      },
      {
        "tipo": "eje_5",
        "titulo": "Eje del embestidor",
        "info": "Un eje de 5 cruza la punta de los dos brazos largos: es la barra que empuja al rival.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes del embestidor (2)",
        "info": "Un medio buje por dentro de cada brazo para que el eje no se salga.",
        "piezas": 2
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  },
  {
    "id": "competencia",
    "nombre": "Robot de competencia",
    "emoji": "🏆",
    "descripcion": "El más completo: cuatro sensores de línea y un giroscopio para girar ángulos exactos.",
    "archivo": "/ldraw/competencia.mpd",
    "simulable": true,
    "lineas": [
      -7.2,
      -3.6,
      3.6,
      7.2
    ],
    "equipo": "Giroscopio + 4 sensores de color al frente",
    "ruedas": [
      21,
      22
    ],
    "pasos": [
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande izquierdo",
        "info": "Empezamos por la fuerza del robot: el motor grande que moverá la rueda izquierda.",
        "piezas": 1
      },
      {
        "tipo": "motor_grande",
        "titulo": "Motor grande derecho",
        "info": "El segundo motor, paralelo al primero. Cada motor mueve una rueda.",
        "piezas": 1
      },
      {
        "tipo": "rueda_loca",
        "titulo": "Rueda loca",
        "info": "La bola de acero va entre los dos motores, atrás. Sus dos agujeros quedan en línea con los agujeros de los motores.",
        "piezas": 1
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes separadores (4)",
        "info": "Cuatro medios bujes amarillos rellenan el espacio entre la rueda loca y cada motor, para que no se mueva de lado.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Ejes de 8 (2)",
        "info": "Dos ejes largos atraviesan motor, buje, rueda loca, buje y motor. ¡Ahora los dos motores son un solo chasis firme!",
        "piezas": 2
      },
      {
        "tipo": "viga_9",
        "titulo": "Vigas de 9 hacia adelante (2)",
        "info": "Dos vigas largas acostadas por dentro de los brazos de los motores, apuntando al frente. Serán los «brazos» que sostienen los sensores de línea.",
        "piezas": 2
      },
      {
        "tipo": "sensor_giro",
        "titulo": "Giroscopio",
        "info": "Va entre los brazos de los motores. Siente cuánto ha girado el robot.",
        "piezas": 1
      },
      {
        "tipo": "pin_largo",
        "titulo": "Pines largos azules (4)",
        "info": "Cada pin largo atraviesa tres piezas: el brazo del motor, la viga vertical y el sensor. Así el sensor une los dos motores por delante.",
        "piezas": 4
      },
      {
        "tipo": "viga_L35",
        "titulo": "Vigas en L 3×5 (2)",
        "info": "En la punta de cada brazo, una viga en L: su parte corta se apoya en el brazo y su parte larga baja hacia el piso.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las L (4)",
        "info": "Dos pines por cada L. Con dos pines la L queda rígida: no puede balancearse.",
        "piezas": 4
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensores de color izquierdo y derecho (2)",
        "info": "Dos sensores mirando al piso, uno a cada lado. La línea negra pasará entre los dos.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de los sensores (4)",
        "info": "Dos pines sujetan cada sensor a su viga en L.",
        "piezas": 4
      },
      {
        "tipo": "eje_8",
        "titulo": "Eje de 8 que une los sensores",
        "info": "Un eje largo atraviesa el centro en cruz de los dos sensores y las dos L: todo el frente queda como una sola pieza.",
        "piezas": 1
      },
      {
        "tipo": "sensor_color",
        "titulo": "Sensores de color exteriores (2)",
        "info": "Dos sensores más, por fuera de los primeros. Con cuatro «ojos» el robot ve curvas cerradas y cruces.",
        "piezas": 2
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros entre sensores (4)",
        "info": "Cada sensor exterior se une a su vecino con dos pines, lado con lado.",
        "piezas": 4
      },
      {
        "tipo": "viga_11",
        "titulo": "Vigas laterales de 11 (4)",
        "info": "Cuatro vigas rojas paradas por fuera de los brazos: son las columnas que sostienen el ladrillo.",
        "piezas": 4
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros de las columnas (4)",
        "info": "Un pin negro une cada columna con el brazo del motor, por fuera.",
        "piezas": 4
      },
      {
        "tipo": "brick",
        "titulo": "Ladrillo inteligente EV3",
        "info": "El cerebro del robot baja entre las cuatro columnas. Sus agujeros laterales quedan frente a los de las columnas.",
        "piezas": 1
      },
      {
        "tipo": "pin_negro",
        "titulo": "Pines negros del ladrillo (4)",
        "info": "Cuatro pines fijan el ladrillo a las columnas. ¡Ya no se cae aunque voltees el robot!",
        "piezas": 4
      },
      {
        "tipo": "eje_5",
        "titulo": "Ejes de las ruedas (2)",
        "info": "Un eje de 5 entra en el centro rojo de cada motor: es lo que hará girar la rueda.",
        "piezas": 2
      },
      {
        "tipo": "buje_medio",
        "titulo": "Medios bujes de las ruedas (2)",
        "info": "Un medio buje en cada eje separa la rueda del motor para que gire sin rozar.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda izquierda",
        "info": "Llanta y neumático se meten en el eje izquierdo.",
        "piezas": 2
      },
      {
        "tipo": "rueda",
        "titulo": "Rueda derecha",
        "info": "¡Último! La rueda derecha. Con dos ruedas motrices el robot avanza y gira.",
        "piezas": 2
      }
    ]
  }
]

export default datos
