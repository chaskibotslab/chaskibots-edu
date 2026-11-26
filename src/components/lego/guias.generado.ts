// GENERADO por scripts/ldraw/modelos.js — no editar a mano.
const datos = [
  {
    "id": "carrito",
    "nombre": "Carrito de dos motores",
    "emoji": "🚗",
    "descripcion": "Tu primer chasis: dos motores unidos por ejes y bujes, rueda loca y dos ruedas.",
    "archivo": "/ldraw/carrito.mpd",
    "simulable": false,
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
    "id": "explorador",
    "nombre": "Robot explorador EV3",
    "emoji": "🤖",
    "descripcion": "El robot completo: ladrillo, sensor infrarrojo al frente y sensor de color al piso, todo sujeto con pines.",
    "archivo": "/ldraw/ev3-robot.mpd",
    "simulable": true,
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
  }
]

export default datos
