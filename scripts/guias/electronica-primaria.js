// Guías (método de 6 etapas) del Programa de Electrónica Educativa: 9 kits de
// Inicial 1 a 7mo EGB de la Academia Lizardo Villamarín. Son circuitos sin
// programación (pila o batería), así que la etapa "Programa" queda vacía.
// Cada kit tiene 3 prácticas y un proyecto final, que son los 4 pasos del
// programa. Los kits y materiales se crean con scripts/seed-kits-lv-primaria.js.
//
// Clave de primer nivel = id del kit; dentro, clave = slug del proyecto.

const q = (pregunta, opciones, correcta, explicacion) => ({ pregunta, opciones, correcta, explicacion })
const circuito = n => `/kits/circuitos/kit-${n}.webp`

// ───────────── Piezas que se repiten ─────────────
const PILA = { nombre: 'Pila de botón CR2032', paraQue: 'Da la energía. Tiene dos caras: la lisa con letras es el lado + y la otra es el lado –.', cuidado: 'La pila la entrega y la recoge tu profe. Nunca se lleva a la boca.' }
const CINTA = { nombre: 'Cinta de cobre', paraQue: 'Es un camino brillante por donde viaja la energía, como una carretera para la luz.', cuidado: 'Pégala despacio y alísala con el dedo. Si se rompe, la energía no pasa.' }
const PINZA = { nombre: 'Pinza de papel', paraQue: 'Aprieta la pila contra el cobre para que no se mueva.' }
const BATERIA = { nombre: 'Batería de 9 V con portabatería', paraQue: 'Da la energía del circuito. El cable rojo es el positivo (+) y el negro es el negativo (–).', cuidado: 'Nunca juntes el cable rojo con el negro directamente: la batería se calienta y se gasta.' }
const PROTO = { nombre: 'Protoboard', paraQue: 'Es la base donde se arman los circuitos sin soldar. Las líneas largas de los bordes reparten el positivo (roja) y el negativo (azul o negra).', cuidado: 'Los agujeros de una misma fila corta están unidos por dentro: dos patas en la misma fila quedan conectadas.' }
const R470 = { nombre: 'Resistencia de 470 Ω', paraQue: 'Frena la corriente para que el LED no se queme.', cuidado: 'Sus franjas son amarillo, violeta y café. No tiene lado: puede ir en cualquier sentido.' }
const R1K = { nombre: 'Resistencia de 1 kΩ', paraQue: 'Protege la base del transistor: deja pasar solo un poco de corriente.', cuidado: 'Sus franjas son café, negro y rojo.' }
const TRANSISTOR = { nombre: 'Transistor 2N3904', paraQue: 'Es un interruptor que se acciona con electricidad: una corriente muy pequeña en la pata del centro deja pasar una corriente grande entre las otras dos.', cuidado: 'Míralo con la cara plana hacia ti y las patas hacia abajo: de izquierda a derecha son E (emisor), B (base) y C (colector).' }
const led = (color, extra) => ({ nombre: `LED ${color}`, paraQue: extra || 'Es la luz del circuito.', cuidado: 'La pata larga es el lado +. Si lo pones al revés no se daña, pero no enciende.' })

// ───────────── Pasos y problemas que se repiten ─────────────
const RIELES_9V = { titulo: 'Conecta la batería a la protoboard', texto: 'Lleva el cable rojo de la batería a la línea roja (+) de la protoboard y el cable negro a la línea negra o azul (–). Hazlo al final de cada cambio: mientras armas, deja un cable de la batería suelto.' }
const LED_AL_REVES = { problema: 'El LED no enciende', revisa: 'Gira el LED: la pata larga debe mirar hacia el lado positivo. Revisa también que cada pata esté bien metida en su fila.' }
const BATERIA_GASTADA = { problema: 'Todo está bien conectado y no enciende', revisa: 'Prueba con otra batería: puede estar gastada. Revisa que el broche del portabatería esté bien apretado.' }
const ALGO_CALIENTE = { problema: 'Algo se calienta', revisa: 'Desconecta la batería de inmediato y avisa a tu docente. Casi siempre es un cable que une el positivo con el negativo sin pasar por ninguna pieza.' }
const PILA_AL_REVES = { problema: 'La luz no enciende', revisa: 'Dale la vuelta a la pila o al LED. La pata larga del LED debe tocar el lado + de la pila (el liso, con letras).' }
const COBRE_ROTO = { problema: 'A veces enciende y a veces no', revisa: 'Aprieta el cobre con el dedo. Si la cinta está rota o arrugada, pega un pedacito encima para repararla.' }

// Encender un LED con su resistencia: primer paso de casi todos los kits de 9 V.
const primerLed = ({ color, resistencia = R470, destino }) => ({
  reto: {
    texto: `Vas a encender un LED ${color} con la batería de 9 V, usando una resistencia para protegerlo. ${destino}`,
    paraQue: 'Casi todos los aparatos tienen una luz que avisa que están encendidos: el cargador, el televisor, el router. Todas son un LED con su resistencia, igual que el que vas a armar.',
    duracion: '25 minutos',
  },
  piezas: [led(color), resistencia, BATERIA, PROTO],
  pasos: [
    { titulo: 'Coloca el LED', texto: 'Pon el LED en la protoboard con cada pata en una fila distinta. Fíjate cuál es la pata larga.' },
    { titulo: 'Coloca la resistencia', texto: 'Pon una pata de la resistencia en la misma fila que la pata larga del LED. Lleva la otra pata a la línea roja (+).', consejo: 'La resistencia y el LED quedan en fila, uno detrás del otro. A eso se le llama conexión en serie.' },
    { titulo: 'Cierra el camino', texto: 'Une la pata corta del LED con la línea negra (–).' },
    RIELES_9V,
  ],
  codigo: [],
  prueba: {
    queDebePasar: ['Al conectar la batería, el LED se enciende y se queda encendido.', 'Al soltar cualquier cable, el LED se apaga: el camino quedó abierto.'],
    siNoFunciona: [LED_AL_REVES, { problema: 'El LED brilla muy poco', revisa: 'Comprueba que usaste la resistencia correcta. Una resistencia con franja naranja o amarilla al final es mucho más grande y deja pasar muy poca corriente.' }, BATERIA_GASTADA, ALGO_CALIENTE],
  },
  demuestra: {
    reto: 'Cambia de lugar la resistencia: ponla entre la pata corta del LED y la línea negra. ¿Sigue encendiendo? Explica por qué.',
    preguntas: [
      q('¿Para qué sirve la resistencia?', ['Para que el LED brille más', 'Para frenar la corriente y que el LED no se queme', 'Para guardar energía'], 1, 'Sin resistencia, con 9 V pasaría demasiada corriente y el LED se dañaría.'),
      q('¿Cuál es la pata positiva del LED?', ['La larga', 'La corta', 'Las dos son iguales'], 0, 'La pata larga va hacia el positivo.'),
      q('¿Qué pasa si el camino queda abierto en algún punto?', ['El LED brilla más', 'El LED se apaga', 'La batería se carga'], 1, 'La corriente necesita un camino completo, de + a –, para circular.'),
    ],
  },
})

// Un transistor que enciende el LED: segundo paso de los kits 4, 6 y 7.
const unTransistor = ({ color, resistenciaLed = '470 Ω', base = '1 kΩ', destino }) => ({
  reto: {
    texto: `Vas a usar un transistor como interruptor: el LED ${color} se enciende solo cuando llega un poquito de corriente a la pata del centro. ${destino}`,
    paraQue: 'Dentro de un celular hay miles de millones de transistores. Cada uno hace lo mismo que el tuyo: una corriente pequeña decide si pasa o no una corriente grande.',
    duracion: '35 minutos',
  },
  piezas: [TRANSISTOR, led(color), { ...R470, nombre: `Resistencia de ${resistenciaLed} (para el LED)`, cuidado: 'No tiene lado: puede ir en cualquier sentido.' }, { ...R1K, nombre: `Resistencia de ${base} (para la base)`, cuidado: 'No tiene lado: puede ir en cualquier sentido.' }, BATERIA, PROTO],
  pasos: [
    { titulo: 'Coloca el transistor', texto: 'Pon el transistor con cada pata en una fila distinta y la cara plana hacia ti. De izquierda a derecha: E, B y C.' },
    { titulo: 'El emisor va al negativo', texto: 'Une la pata E con la línea negra (–).' },
    { titulo: 'El LED va en el colector', texto: `Desde la línea roja (+) pon la resistencia de ${resistenciaLed}, luego el LED (pata larga hacia la resistencia) y lleva la pata corta del LED a la pata C del transistor.` },
    { titulo: 'Prepara la base', texto: `Pon una pata de la resistencia de ${base} en la fila de la pata B. Deja la otra pata en una fila libre: ese extremo es tu "botón".` },
    RIELES_9V,
  ],
  codigo: [],
  prueba: {
    queDebePasar: [`Con el extremo libre de la resistencia de ${base} sin tocar nada, el LED está apagado.`, 'Al unir ese extremo con la línea roja (+), el LED se enciende.', 'Al soltarlo, se apaga.'],
    siNoFunciona: [
      { problema: 'El LED está siempre encendido', revisa: 'El transistor está al revés o la pata corta del LED quedó en la línea negra en lugar de la pata C.' },
      { problema: 'El LED nunca enciende', revisa: 'Revisa el orden de las patas (E, B, C con la cara plana hacia ti) y que la pata E llegue a la línea negra. Luego revisa el sentido del LED.' },
      BATERIA_GASTADA, ALGO_CALIENTE,
    ],
  },
  demuestra: {
    reto: 'En lugar de un cable, une el extremo libre de la resistencia con la línea roja usando tus dedos: un dedo en cada punto. ¿Se enciende? Anota lo que ves; lo vas a necesitar en el siguiente paso.',
    preguntas: [
      q('¿Qué pata del transistor recibe la corriente pequeña que lo activa?', ['El emisor (E)', 'La base (B)', 'El colector (C)'], 1, 'La base es la que "da la orden".'),
      q('¿Dónde se conecta el LED en este circuito?', ['Entre el positivo y el colector', 'Entre la base y el emisor', 'Directo a la batería'], 0, 'El LED y su resistencia van del positivo al colector.'),
      q('Un transistor se parece a…', ['Una pila', 'Un interruptor que se acciona con electricidad', 'Una resistencia'], 1, 'Deja pasar o corta la corriente según lo que llega a su base.'),
    ],
  },
})

module.exports = {
  // ═════════════ KIT 1 · Inicial 1 · La luciérnaga mágica ═════════════
  'kit-lv-inicial-1': {
    'luciernaga-led-y-pila': {
      reto: { texto: 'Vas a encender una lucecita usando solo una pila y tus dedos. ¡Como magia!', paraQue: 'Las luces de los juguetes y de los zapatos que brillan se encienden así: con una pila pequeña.', duracion: '15 minutos' },
      piezas: [led('verde o amarillo', 'Es la lucecita. Tiene dos patitas: una larga y una corta.'), PILA],
      pasos: [
        { titulo: 'Mira las patitas', texto: 'Busca la patita larga del LED. Esa es la que va con el lado + de la pila.' },
        { titulo: 'Abraza la pila', texto: 'Pon la pila en medio de las dos patitas: la patita larga toca el lado liso con letras (+) y la corta toca el otro lado.' },
        { titulo: 'Aprieta', texto: 'Aprieta las patitas contra la pila con tus dedos.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Al apretar, la lucecita se enciende.', 'Al soltar, se apaga.'], siNoFunciona: [PILA_AL_REVES] },
      demuestra: {
        reto: 'Enciende y apaga tu luz tres veces. Cuéntale a un amigo cuál patita es la larga.',
        preguntas: [
          q('¿Qué le da energía a la luz?', ['La pila', 'El papel', 'El dedo'], 0, 'La pila guarda la energía.'),
          q('¿Qué pasa si sueltas las patitas?', ['La luz se apaga', 'La luz brilla más', 'Nada'], 0, 'La energía ya no puede pasar.'),
        ],
      },
    },
    'luciernaga-pistas-de-cobre': {
      reto: { texto: 'Vas a pegar dos caminos brillantes de cobre en tu cartulina. Por ellos viajará la energía hasta la cola de la luciérnaga.', paraQue: 'Los cables de tu casa son caminos así: llevan la energía desde lejos hasta cada foco.', duracion: '20 minutos' },
      piezas: [CINTA, { nombre: 'Cartulina con la luciérnaga', paraQue: 'Es la base de tu circuito. Tiene marcado por dónde van los caminos.' }, led('verde o amarillo')],
      pasos: [
        { titulo: 'El camino +', texto: 'Con ayuda de tu profe, pega la cinta de cobre sobre la línea marcada como +: va desde la cola de la luciérnaga hasta la esquina de la hoja.' },
        { titulo: 'El camino –', texto: 'Pega otra cinta sobre la línea marcada como –: va desde la cola hasta el círculo donde se sentará la pila.' },
        { titulo: 'Coloca la luz', texto: 'Abre las patitas del LED y pégalas con cinta: la patita larga sobre el camino + y la corta sobre el camino –.', consejo: 'Los dos caminos no deben tocarse entre sí en ningún punto.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Los dos caminos de cobre están completos, sin cortes.', 'Los caminos no se tocan entre sí.', 'El LED está en la cola, con una patita en cada camino.'], siNoFunciona: [COBRE_ROTO] },
      demuestra: {
        reto: 'Sigue con tu dedo el camino + de principio a fin sin levantarlo. Luego haz lo mismo con el camino –.',
        preguntas: [
          q('¿Para qué sirve la cinta de cobre?', ['Para adornar', 'Para llevar la energía hasta la luz', 'Para pegar la hoja'], 1, 'El cobre deja pasar la energía.'),
          q('¿Pueden tocarse los dos caminos?', ['Sí', 'No'], 1, 'Si se tocan, la energía toma un atajo y no llega a la luz.'),
        ],
      },
    },
    'luciernaga-interruptor-de-papel': {
      reto: { texto: 'Vas a hacer un interruptor con la esquina de la hoja: al doblarla y apretar, la luz se enciende.', paraQue: 'Un interruptor abre y cierra el camino de la energía, igual que el de la pared de tu cuarto.', duracion: '15 minutos' },
      piezas: [PILA, PINZA, { nombre: 'Tu cartulina con los caminos', paraQue: 'Ya tiene el LED y las dos pistas de cobre.' }],
      pasos: [
        { titulo: 'Sienta la pila', texto: 'Pon la pila sobre el final del camino –, con el lado liso con letras (+) hacia arriba.' },
        { titulo: 'Dobla la esquina', texto: 'Dobla la esquina de la hoja por la línea punteada. El cuadrito de cobre de la esquina debe caer justo encima de la pila.' },
        { titulo: 'Aprieta', texto: 'Presiona la esquina con el dedo. Si quieres que la luz quede encendida, sujétala con la pinza.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Al apretar la esquina sobre la pila, la cola de la luciérnaga se enciende.', 'Al soltar, se apaga.'], siNoFunciona: [PILA_AL_REVES, COBRE_ROTO, { problema: 'La esquina no alcanza la pila', revisa: 'Mueve la pila un poquito hasta que el cobre de la esquina la toque al doblar.' }] },
      demuestra: {
        reto: 'Enseña a un compañero cómo se enciende tu luciérnaga sin decirle nada: solo con gestos.',
        preguntas: [
          q('¿Qué hace el interruptor de papel?', ['Abre y cierra el camino de la energía', 'Pinta la hoja', 'Guarda la pila'], 0, 'Al doblar, el camino se cierra y la luz se enciende.'),
          q('¿Qué lado de la pila queda hacia arriba?', ['El liso con letras (+)', 'El otro lado (–)'], 0, 'El cobre de la esquina debe tocar el lado +.'),
        ],
      },
    },
    'la-luciernaga-magica': {
      reto: { texto: 'Vas a terminar tu luciérnaga mágica: la colorearás y jugarás a encender la noche apretando la esquina de la hoja.', paraQue: 'Las luciérnagas de verdad brillan para llamarse entre ellas en la oscuridad. La tuya brilla con una pila y un camino de cobre.', duracion: '30 minutos', fotoUrl: circuito(1) },
      piezas: [led('verde o amarillo', 'Es la cola que brilla.'), CINTA, PILA, PINZA, { nombre: 'Cartulina y colores', paraQue: 'Para darle vida a tu luciérnaga.' }],
      pasos: [
        { titulo: 'Revisa tu circuito', texto: 'Mira que los dos caminos de cobre estén completos y que el LED siga bien pegado en la cola.' },
        { titulo: 'Colorea', texto: 'Pinta la luciérnaga, sus alas y el cielo de noche. No pintes encima del cobre.' },
        { titulo: 'Enciende la noche', texto: 'Con las luces del salón apagadas, dobla la esquina sobre la pila y presiona. ¡Tu luciérnaga brilla!' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['La cola se enciende cada vez que presionas la esquina.', 'Todas las luciérnagas del salón brillan juntas en la oscuridad.'], siNoFunciona: [PILA_AL_REVES, COBRE_ROTO] },
      demuestra: {
        reto: 'Juega a "encender la noche": cuando tu profe diga "¡noche!", todos encienden su luciérnaga; cuando diga "¡día!", todos la apagan.',
        preguntas: [
          q('¿Qué tres cosas necesita tu luciérnaga para brillar?', ['Pila, camino de cobre y LED', 'Agua, papel y lápiz', 'Solo la cartulina'], 0, 'La pila da la energía, el cobre la lleva y el LED la convierte en luz.'),
          q('¿A quién se le entrega la pila al terminar?', ['A mi profe', 'Me la llevo a casa', 'La guardo en el bolsillo'], 0, 'Las pilas de botón siempre las guarda el docente.'),
        ],
      },
    },
  },

  // ═════════════ KIT 2 · Inicial 2 · El monstruo de ojos brillantes ═════════════
  'kit-lv-inicial-2': {
    'monstruo-primer-ojo': {
      reto: { texto: 'Vas a hacer brillar el primer ojo de tu monstruo, con un camino de cobre que sube y otro que baja.', paraQue: 'Las luces de un carro de juguete o de una linterna funcionan igual: una pila, un camino y una luz.', duracion: '25 minutos' },
      piezas: [led('rojo', 'Es un ojo del monstruo.'), CINTA, PILA, { nombre: 'Cartulina', paraQue: 'Es la base donde dibujarás tu monstruo.' }],
      pasos: [
        { titulo: 'El camino –', texto: 'Con ayuda de tu profe, pega una cinta de cobre desde el lugar del ojo, hacia abajo, hasta el círculo de la pila.' },
        { titulo: 'El camino +', texto: 'Pega otra cinta desde el lugar del ojo, hacia arriba, y llévala por el borde hasta la esquina de la hoja.' },
        { titulo: 'Pega el ojo', texto: 'Abre las patitas del LED: la larga va sobre el camino + (el de arriba) y la corta sobre el camino – (el de abajo). Pégalas con cinta.' },
        { titulo: 'Prueba', texto: 'Pon la pila en su círculo con el lado + hacia arriba, dobla la esquina encima y presiona.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Al presionar la esquina sobre la pila, el ojo se enciende.', 'Al soltar, se apaga.'], siNoFunciona: [PILA_AL_REVES, COBRE_ROTO] },
      demuestra: {
        reto: 'Sigue con el dedo todo el recorrido: desde la pila, por el camino –, pasando por el ojo, y de regreso por el camino +.',
        preguntas: [
          q('¿Cuántos caminos de cobre necesita un ojo?', ['Uno', 'Dos', 'Ninguno'], 1, 'Uno lleva la energía y otro la trae de vuelta.'),
          q('¿Qué patita va en el camino +?', ['La larga', 'La corta'], 0, 'La patita larga siempre va con el +.'),
        ],
      },
    },
    'monstruo-dos-pistas': {
      reto: { texto: 'Vas a alargar los dos caminos de cobre para que pasen por arriba y por abajo de los dos ojos del monstruo.', paraQue: 'En tu casa un mismo par de cables pasa por varios focos. Así, una sola fuente de energía alcanza para muchas luces.', duracion: '20 minutos' },
      piezas: [CINTA, { nombre: 'Tu cartulina con el primer ojo', paraQue: 'Ya tiene un LED encendiendo.' }],
      pasos: [
        { titulo: 'Alarga el camino de arriba', texto: 'Pega más cinta de cobre para que el camino + pase también por encima del lugar del segundo ojo.' },
        { titulo: 'Alarga el camino de abajo', texto: 'Pega más cinta para que el camino – pase también por debajo del lugar del segundo ojo.', consejo: 'Donde una cinta se une con otra, monta un pedacito encima y aprieta fuerte con el dedo.' },
        { titulo: 'Revisa', texto: 'Mira que el camino de arriba y el de abajo no se toquen entre sí.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['El primer ojo sigue encendiendo igual que antes.', 'Los dos caminos pasan por el lugar del segundo ojo, uno arriba y otro abajo.'], siNoFunciona: [COBRE_ROTO, { problema: 'El primer ojo dejó de encender', revisa: 'Alguna unión de cinta quedó floja, o los dos caminos se están tocando.' }] },
      demuestra: {
        reto: 'Señala dónde pondrías un tercer ojo para que también se encienda. ¿Qué caminos tendría que tocar?',
        preguntas: [
          q('¿Por dónde pasa el camino +?', ['Por arriba de los ojos', 'Por abajo de los ojos'], 0, 'El + va por arriba y el – por abajo.'),
          q('¿Qué pasa si los dos caminos se tocan?', ['Los ojos brillan más', 'La energía toma un atajo y los ojos no encienden'], 1, 'Por eso los caminos nunca se cruzan.'),
        ],
      },
    },
    'monstruo-segundo-ojo': {
      reto: { texto: 'Vas a conectar el segundo ojo a los mismos caminos, para que los dos se enciendan juntos con una sola pila.', paraQue: 'Las luces de un árbol de Navidad o los focos de un pasillo se conectan así: todas al mismo par de cables.', duracion: '20 minutos' },
      piezas: [led('rojo', 'Es el segundo ojo.'), PILA, PINZA],
      pasos: [
        { titulo: 'Pega el segundo ojo', texto: 'Abre las patitas del segundo LED: la larga sobre el camino de arriba (+) y la corta sobre el camino de abajo (–). Pégalas con cinta.' },
        { titulo: 'Fíjate en el primero', texto: 'Compara: los dos LED deben estar puestos igual, con la patita larga hacia arriba.' },
        { titulo: 'Enciende', texto: 'Pon la pila, dobla la esquina encima y presiona.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Los dos ojos se encienden al mismo tiempo.', 'Al soltar la esquina, los dos se apagan.'], siNoFunciona: [{ problema: 'Solo enciende un ojo', revisa: 'El ojo apagado está al revés: despégalo y cambia las patitas de lugar.' }, COBRE_ROTO, PILA_AL_REVES] },
      demuestra: {
        reto: 'Tapa un ojo con el dedo. ¿El otro sigue encendido? Cuéntale a tu profe lo que pasó.',
        preguntas: [
          q('¿Cuántas pilas usan los dos ojos?', ['Una sola', 'Dos', 'Tres'], 0, 'Los dos ojos comparten la misma pila.'),
          q('¿Cómo deben ir las patitas de los dos LED?', ['Iguales: la larga hacia el camino +', 'Uno al revés del otro'], 0, 'Si uno está al revés, ese no enciende.'),
        ],
      },
    },
    'el-monstruo-de-ojos-brillantes': {
      reto: { texto: 'Vas a terminar tu monstruo de ojos brillantes: lo dibujarás alrededor de las luces y le pondrás nombre.', paraQue: 'Los juguetes con luces en los ojos tienen dentro un circuito como el tuyo, escondido bajo el dibujo.', duracion: '30 minutos', fotoUrl: circuito(2) },
      piezas: [led('rojo (2)', 'Son los dos ojos.'), CINTA, PILA, PINZA, { nombre: 'Cartulina y colores', paraQue: 'Para dibujar tu monstruo.' }],
      pasos: [
        { titulo: 'Revisa los ojos', texto: 'Presiona la esquina y comprueba que los dos ojos encienden.' },
        { titulo: 'Dibuja tu monstruo', texto: 'Dibuja la cara alrededor de los ojos: cuernos, boca, dientes, pelos. No pintes encima del cobre.' },
        { titulo: 'Ponle nombre', texto: 'Escribe (o dicta a tu profe) el nombre de tu monstruo en la hoja.' },
        { titulo: 'Preséntalo', texto: 'Con el salón a oscuras, enciende los ojos y presenta tu monstruo a tus compañeros.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Los dos ojos brillan al presionar la esquina.', 'El dibujo no tapa los caminos de cobre.'], siNoFunciona: [{ problema: 'Solo enciende un ojo', revisa: 'El ojo apagado está al revés o una de sus patitas se despegó del cobre.' }, COBRE_ROTO, PILA_AL_REVES] },
      demuestra: {
        reto: 'Inventa qué significa cuando tu monstruo enciende los ojos: ¿está contento, tiene hambre, saluda? Cuéntalo al grupo.',
        preguntas: [
          q('¿Por qué los dos ojos se encienden juntos?', ['Porque están conectados a los mismos dos caminos', 'Porque son rojos', 'Porque la hoja es grande'], 0, 'Comparten el camino + y el camino –.'),
          q('¿Qué haces con la pila al terminar?', ['Se la entrego a mi profe', 'La guardo en mi mochila'], 0, 'Las pilas de botón siempre las guarda el docente.'),
        ],
      },
    },
  },

  // ═════════════ KIT 3 · 1ro EGB · El semáforo de papel ═════════════
  'kit-lv-primero-egb': {
    'semaforo-papel-luz-con-boton': {
      reto: { texto: 'Vas a armar una luz que se enciende con un botón de papel: un camino de cobre cortado, y encima una tapita que lo une cuando la presionas.', paraQue: 'El timbre de una casa funciona así: mientras presionas, el camino se cierra y suena.', duracion: '30 minutos' },
      piezas: [led('rojo', 'Es la primera luz del semáforo.'), CINTA, { nombre: 'Botón de cartulina con cobre', paraQue: 'Es una tapita con cobre por debajo. Al presionarla, une las dos partes del camino cortado.' }, PILA],
      pasos: [
        { titulo: 'El camino –', texto: 'Pega una cinta de cobre larga por el lado izquierdo de la hoja, de arriba hacia abajo, y dóblala por abajo hasta el lugar de la pila.' },
        { titulo: 'El camino + cortado', texto: 'Por el lado derecho pega otra cinta de arriba hacia abajo, hasta el lugar de la pila. Desde ella saca un ramal hacia la luz roja, pero déjale un espacio vacío de un dedo de ancho: ese corte es el lugar del botón.' },
        { titulo: 'Pega la luz', texto: 'Pega el LED rojo: la pata larga hacia el ramal del lado derecho (+) y la corta hacia el camino del lado izquierdo (–).' },
        { titulo: 'Pon el botón', texto: 'Pega la tapita de cartulina por un solo borde, de modo que su cobre quede justo sobre el espacio vacío.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con la pila puesta, la luz está apagada.', 'Al presionar el botón de papel, la luz roja se enciende.', 'Al soltar, se apaga.'], siNoFunciona: [{ problema: 'La luz está siempre encendida', revisa: 'El espacio del botón quedó muy pequeño y las dos partes del camino se tocan. Sepáralas un poco.' }, PILA_AL_REVES, COBRE_ROTO] },
      demuestra: {
        reto: 'Envía un mensaje secreto a un compañero con tu luz: una presión larga y dos cortas. Que él lo repita.',
        preguntas: [
          q('¿Qué hace el botón de papel al presionarlo?', ['Une el camino cortado', 'Apaga la pila', 'Rompe el cobre'], 0, 'El cobre de la tapita completa el camino.'),
          q('¿Por qué la luz está apagada sin presionar?', ['Porque el camino está cortado', 'Porque la pila está vacía', 'Porque el LED es rojo'], 0, 'Sin camino completo, la energía no pasa.'),
        ],
      },
    },
    'semaforo-papel-pila-con-pinza': {
      reto: { texto: 'Vas a fijar la pila con una pinza para que se quede en su lugar y tengas las manos libres para los botones.', paraQue: 'En un control remoto, las pilas se sostienen con resortes que las aprietan contra el metal. Tu pinza hace lo mismo.', duracion: '15 minutos' },
      piezas: [PILA, PINZA, { nombre: 'Tu hoja con la primera luz', paraQue: 'Ya tiene el LED rojo y su botón.' }],
      pasos: [
        { titulo: 'Coloca la pila', texto: 'Pon la pila sobre el final del camino – con el lado liso con letras (+) hacia arriba.' },
        { titulo: 'Dobla el camino +', texto: 'El final del camino + debe quedar encima de la pila, tocando su lado +. Dobla la hoja o la cinta para que llegue.' },
        { titulo: 'Sujeta con la pinza', texto: 'Aprieta todo con la pinza de papel: hoja, cobre y pila.', consejo: 'La pinza no debe tocar a la vez el cobre de arriba y el de abajo.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['La pila no se mueve al levantar la hoja.', 'Al presionar el botón, la luz enciende igual que antes, sin sostener la pila.'], siNoFunciona: [{ problema: 'La luz ya no enciende', revisa: 'La pila se movió o quedó al revés. Suelta la pinza, acomódala y vuelve a apretar.' }, { problema: 'La luz quedó siempre encendida', revisa: 'La pinza está uniendo los dos caminos. Muévela un poco.' }] },
      demuestra: {
        reto: 'Levanta tu hoja, muévela con cuidado y presiona el botón. ¿Sigue funcionando? Si no, mejora tu sujeción.',
        preguntas: [
          q('¿Para qué sirve la pinza?', ['Para mantener la pila apretada contra el cobre', 'Para dar más energía', 'Para encender la luz'], 0, 'Si la pila se separa del cobre, el camino se abre.'),
          q('¿Qué lado de la pila va hacia arriba?', ['El + (liso, con letras)', 'El –'], 0, 'Así toca el camino +.'),
        ],
      },
    },
    'semaforo-papel-tres-luces': {
      reto: { texto: 'Vas a agregar la luz amarilla y la luz verde, cada una con su propio botón de papel.', paraQue: 'Un semáforo de verdad tiene tres luces que se controlan por separado. Con tres botones puedes encender la que quieras.', duracion: '35 minutos' },
      piezas: [led('amarillo'), led('verde'), { nombre: 'Dos botones de cartulina con cobre', paraQue: 'Uno para cada luz nueva.' }, CINTA],
      pasos: [
        { titulo: 'Ramal amarillo', texto: 'Desde el camino + del lado derecho saca un ramal hacia la luz del centro, dejando el espacio vacío para su botón.' },
        { titulo: 'Luz amarilla', texto: 'Pega el LED amarillo: pata larga al ramal (+), pata corta al camino del lado izquierdo (–). Pon su botón sobre el espacio.' },
        { titulo: 'Ramal y luz verde', texto: 'Repite lo mismo abajo con el LED verde y el tercer botón.' },
        { titulo: 'Revisa', texto: 'Los tres ramales salen del mismo camino + y las tres luces llegan al mismo camino –.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Cada botón enciende solo su luz: rojo arriba, amarillo en el centro y verde abajo.', 'Sin presionar nada, las tres luces están apagadas.'], siNoFunciona: [{ problema: 'Una luz no enciende', revisa: 'Ese LED está al revés, o su ramal no llega bien al camino +.' }, { problema: 'Al presionar dos botones, una luz brilla menos', revisa: 'Es normal: la pila reparte su energía y la luz roja se queda con más. Presiona un botón a la vez.' }, COBRE_ROTO] },
      demuestra: {
        reto: 'Haz la secuencia de un semáforo real con tus botones: verde, amarillo, rojo, y otra vez verde.',
        preguntas: [
          q('¿Cuántos botones tiene tu semáforo?', ['Uno', 'Dos', 'Tres'], 2, 'Uno por cada luz.'),
          q('¿Las tres luces comparten la pila?', ['Sí, una sola pila para las tres', 'No, cada una tiene su pila'], 0, 'Todas salen del mismo camino + y vuelven al mismo camino –.'),
        ],
      },
    },
    'el-semaforo-de-papel': {
      reto: { texto: 'Vas a usar tu semáforo de papel para jugar a cruzar la calle: tú decides con los botones quién pasa y quién espera.', paraQue: 'Los semáforos ordenan el paso de carros y peatones para que nadie choque. Saber qué significa cada color te cuida en la calle.', duracion: '35 minutos', fotoUrl: circuito(3) },
      piezas: [led('rojo, amarillo y verde', 'Son las tres luces.'), { nombre: 'Tres botones de cartulina', paraQue: 'Uno por cada luz.' }, CINTA, PILA, PINZA],
      pasos: [
        { titulo: 'Decora', texto: 'Dibuja la caja negra del semáforo alrededor de las tres luces y su poste. No pintes sobre el cobre.' },
        { titulo: 'Repasa los colores', texto: 'Rojo: detente. Amarillo: atento, va a cambiar. Verde: puedes pasar.' },
        { titulo: 'Arma la calle', texto: 'Con cinta en el piso o con cartulinas, marquen un paso de peatones en el salón.' },
        { titulo: 'Juega', texto: 'Un compañero es el semáforo y presiona un botón; los demás cruzan o esperan según la luz. Luego cambian de turno.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Cada botón enciende su color.', 'Todos cruzan solo con la luz verde y se detienen con la roja.'], siNoFunciona: [{ problema: 'Una luz no enciende', revisa: 'Revisa que ese LED tenga la pata larga hacia el ramal + y que su botón toque los dos lados del corte.' }, PILA_AL_REVES, COBRE_ROTO] },
      demuestra: {
        reto: 'Sin hablar, usa solo tu semáforo para dirigir a tres compañeros que cruzan la calle.',
        preguntas: [
          q('¿Qué significa la luz roja?', ['Pasa rápido', 'Detente', 'Cruza con cuidado'], 1, 'Rojo siempre es alto.'),
          q('¿Qué significa la luz amarilla?', ['Atento, va a cambiar', 'Corre', 'Nada'], 0, 'El amarillo avisa que viene el rojo.'),
          q('¿Qué cierra el camino de cada luz?', ['Su botón de papel', 'La pinza', 'El dibujo'], 0, 'Cada botón completa el camino de su propia luz.'),
        ],
      },
    },
  },

  // ═════════════ KIT 4 · 2do EGB · Interruptor táctil mágico ═════════════
  'kit-lv-segundo-egb': {
    'tactil-enciende-led': primerLed({ color: 'amarillo', destino: 'Es la luz que después encenderás con solo tocar dos plaquitas.' }),
    'tactil-un-transistor': unTransistor({ color: 'amarillo', destino: 'Es el primer paso para encender la luz con el dedo.' }),
    'tactil-par-darlington': {
      reto: { texto: 'Vas a unir dos transistores, uno detrás del otro, para que amplifiquen muchísimo más. Con ese "par Darlington" bastará una corriente diminuta para encender el LED.', paraQue: 'La corriente que deja pasar tu piel es demasiado pequeña para un solo transistor. Con dos en cadena, el primero amplifica y el segundo vuelve a amplificar: miles de veces en total.', duracion: '35 minutos' },
      piezas: [{ ...TRANSISTOR, nombre: 'Dos transistores 2N3904' }, led('amarillo'), R470, R1K, BATERIA, PROTO],
      pasos: [
        { titulo: 'Coloca el segundo transistor', texto: 'Deja armado el circuito de la práctica anterior y pon el segundo transistor al lado, también con la cara plana hacia ti.' },
        { titulo: 'Une los colectores', texto: 'Une la pata C del transistor nuevo con la pata C del primero. Los dos colectores van juntos a la pata corta del LED.' },
        { titulo: 'El emisor del primero a la base del segundo', texto: 'Cambia la conexión del primer transistor: su pata E ya no va a la línea negra, ahora va a la pata B del segundo transistor.' },
        { titulo: 'El emisor del segundo al negativo', texto: 'Une la pata E del segundo transistor con la línea negra (–).' },
        { titulo: 'La resistencia de 1 kΩ sigue en la primera base', texto: 'Comprueba que la resistencia de 1 kΩ sigue en la pata B del primer transistor, con su otro extremo libre.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con el extremo libre sin tocar nada, el LED está apagado.', 'Al tocar con un dedo el extremo libre de la resistencia y con otro dedo la línea roja (+), el LED se enciende.'], siNoFunciona: [{ problema: 'El LED no enciende al tocar', revisa: 'Revisa que el emisor del primer transistor vaya a la base del segundo, y no a la línea negra. Humedece un poco las yemas de los dedos y prueba de nuevo.' }, { problema: 'El LED está siempre encendido', revisa: 'Algún transistor está girado. Con la cara plana hacia ti, las patas son E, B y C.' }, BATERIA_GASTADA, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Compara con la práctica anterior: ¿con un solo transistor tu dedo encendía el LED? ¿Y con dos? Explica la diferencia con tus palabras.',
        preguntas: [
          q('¿Cuántos transistores forman un par Darlington?', ['Uno', 'Dos', 'Cuatro'], 1, 'Dos transistores conectados en cadena.'),
          q('¿A dónde va el emisor del primer transistor?', ['A la línea negra', 'A la base del segundo transistor', 'Al LED'], 1, 'Así, lo que amplifica el primero se vuelve a amplificar en el segundo.'),
          q('¿Para qué sirve usar dos transistores?', ['Para que el LED cambie de color', 'Para amplificar mucho más una corriente muy pequeña', 'Para gastar menos batería'], 1, 'La corriente de la piel es tan pequeña que un solo transistor no alcanza.'),
        ],
      },
    },
    'interruptor-tactil-magico': {
      reto: { texto: 'Vas a terminar tu interruptor táctil: dos plaquitas de cobre que encienden el LED cuando las tocas a la vez con el dedo. Después probarás la "cadena humana".', paraQue: 'Las pantallas táctiles, los botones de los ascensores modernos y las lámparas que se encienden al tocarlas detectan tu piel. Tu cuerpo conduce un poquito de electricidad, y la electrónica lo aprovecha.', duracion: '40 minutos', fotoUrl: circuito(4) },
      piezas: [{ nombre: 'Dos placas de cinta de cobre', paraQue: 'Son el lugar donde pones el dedo. Una va al positivo y la otra a la base del par Darlington.', cuidado: 'Deben quedar muy cerca una de otra, pero sin tocarse.' }, { ...TRANSISTOR, nombre: 'Dos transistores 2N3904 (par Darlington)' }, led('amarillo'), R470, R1K, BATERIA, PROTO],
      pasos: [
        { titulo: 'Haz las dos placas', texto: 'Corta dos pedazos de cinta de cobre de unos 4 cm y pégalos sobre un cartón, uno junto al otro, dejando 2 o 3 milímetros de separación.' },
        { titulo: 'Placa A al positivo', texto: 'Une la placa A con la línea roja (+).' },
        { titulo: 'Placa B a la resistencia', texto: 'Une la placa B con el extremo libre de la resistencia de 1 kΩ, la que llega a la base del primer transistor.' },
        { titulo: 'Conecta la batería', texto: 'Revisa todo con el dibujo del circuito y conecta la batería.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Sin tocar nada, el LED está apagado.', 'Al tocar las dos placas a la vez con un dedo, el LED se enciende.', 'Al retirar el dedo, se apaga.', 'Cadena humana: un compañero toca la placa A, otro la placa B, y al darse la mano el LED se enciende.'], siNoFunciona: [{ problema: 'No enciende al tocar', revisa: 'Las placas están muy separadas o tu piel está muy seca: humedece un poco el dedo. Comprueba que la placa A llega a la línea roja.' }, { problema: 'Está siempre encendido', revisa: 'Las dos placas se están tocando. Sepáralas.' }, BATERIA_GASTADA, ALGO_CALIENTE] },
      demuestra: {
        reto: '¿Cuántos compañeros pueden formar la cadena humana antes de que el LED deje de encender? Hagan la prueba y anoten el número.',
        preguntas: [
          q('¿Por qué el LED se enciende al tocar las placas?', ['Porque el dedo empuja el LED', 'Porque la piel deja pasar una corriente muy pequeña que los transistores amplifican', 'Porque el cobre se calienta'], 1, 'El cuerpo conduce un poco de electricidad; el par Darlington hace el resto.'),
          q('¿Qué pasa si las dos placas se tocan entre sí?', ['El LED queda siempre encendido', 'La batería se carga', 'Nada'], 0, 'El cobre une directamente el positivo con la base.'),
          q('¿Es peligroso tocar este circuito?', ['Sí, mucho', 'No: 9 V y una corriente tan pequeña no hacen daño', 'Solo de noche'], 1, 'Por eso estos experimentos se hacen con pilas y nunca con la corriente de la pared.'),
        ],
      },
    },
  },

  // ═════════════ KIT 5 · 3ro EGB · Casa iluminada ═════════════
  'kit-lv-tercero-egb': {
    'casa-enciende-led': primerLed({ color: 'de cualquier color', destino: 'Será la primera luz de tu casa iluminada.' }),
    'casa-serie-y-paralelo': {
      reto: { texto: 'Vas a conectar dos LED de dos maneras distintas, en serie y en paralelo, y a descubrir cuál conviene para iluminar una casa.', paraQue: 'En tu casa, si se quema un foco los demás siguen encendidos. Eso es porque están en paralelo. Las luces de Navidad antiguas estaban en serie: se dañaba una y se apagaban todas.', duracion: '40 minutos' },
      piezas: [{ ...led('(2)'), nombre: 'Dos LED' }, { ...R470, nombre: 'Dos resistencias de 470 Ω' }, BATERIA, PROTO],
      pasos: [
        { titulo: 'En serie: uno detrás del otro', texto: 'Desde la línea roja pon una resistencia, luego un LED y enseguida el otro LED (la pata corta del primero con la pata larga del segundo). La pata corta del segundo va a la línea negra.' },
        { titulo: 'Observa y anota', texto: 'Conecta la batería. Mira cuánto brillan. Luego saca un LED de su lugar: ¿qué pasa con el otro?' },
        { titulo: 'En paralelo: cada uno con su camino', texto: 'Desarma. Ahora arma dos caminos iguales, uno al lado del otro: línea roja, resistencia, LED, línea negra. Cada LED con su propia resistencia.' },
        { titulo: 'Observa y compara', texto: 'Conecta la batería. Mira cuánto brillan. Saca un LED: ¿el otro sigue encendido?' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['En serie: los dos LED encienden; al sacar uno, el otro se apaga.', 'En paralelo: los dos LED encienden; al sacar uno, el otro sigue encendido.'], siNoFunciona: [{ problema: 'En serie no enciende ninguno', revisa: 'Uno de los dos está al revés. En serie, basta un LED mal puesto para cortar todo el camino.' }, LED_AL_REVES, BATERIA_GASTADA, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Prueba tres LED en serie con una sola resistencia. ¿Brillan más o menos que dos? Explica por qué crees que pasa.',
        preguntas: [
          q('En serie, si sacas un LED…', ['El otro sigue encendido', 'El otro se apaga', 'El otro brilla más'], 1, 'Hay un solo camino: si se corta, nada funciona.'),
          q('En paralelo, cada LED tiene…', ['Su propio camino con su resistencia', 'Un camino compartido sin resistencia', 'Su propia batería'], 0, 'Por eso uno puede apagarse sin afectar a los demás.'),
          q('¿Cómo están conectados los focos de una casa?', ['En serie', 'En paralelo'], 1, 'Así cada foco se enciende y se apaga por separado.'),
        ],
      },
    },
    'casa-cuatro-luces': {
      reto: { texto: 'Vas a conectar cuatro luces en paralelo, una para cada cuarto de la casa: cocina, dormitorio, baño y sala.', paraQue: 'Así es la instalación eléctrica de una vivienda: dos líneas recorren toda la casa y de ellas se cuelga cada foco.', duracion: '40 minutos' },
      piezas: [{ ...led('(4)'), nombre: 'Cuatro LED' }, { ...R470, nombre: 'Cuatro resistencias de 470 Ω' }, BATERIA, PROTO],
      pasos: [
        { titulo: 'Primera luz', texto: 'Arma un camino: línea roja, resistencia de 470 Ω, LED (pata larga hacia la resistencia), línea negra.' },
        { titulo: 'Segunda y tercera luz', texto: 'Al lado arma dos caminos iguales, cada uno con su resistencia y su LED.' },
        { titulo: 'Cuarta luz', texto: 'Arma el cuarto camino. Deja un poco de espacio en este: después llevará el dímmer.' },
        RIELES_9V,
      ],
      codigo: [],
      prueba: { queDebePasar: ['Los cuatro LED se encienden a la vez.', 'Al sacar cualquiera de ellos, los otros tres siguen encendidos.'], siNoFunciona: [{ problema: 'Un LED no enciende', revisa: 'Ese LED está al revés, o su resistencia no llega a la línea roja.' }, { problema: 'Todos brillan muy poco', revisa: 'La batería está gastada: cuatro luces a la vez consumen más.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Convierte un cable en interruptor: saca y vuelve a poner el extremo de una resistencia en la línea roja para apagar y encender solo ese cuarto.',
        preguntas: [
          q('¿Cuántas resistencias necesitan cuatro LED en paralelo?', ['Una', 'Dos', 'Cuatro'], 2, 'Cada LED lleva su propia resistencia.'),
          q('¿Qué líneas comparten las cuatro luces?', ['La línea roja (+) y la línea negra (–)', 'Solo la roja', 'Ninguna'], 0, 'Las dos líneas recorren todo y cada luz se cuelga de ellas.'),
          q('¿Qué pasa con la batería al encender más luces?', ['Dura más', 'Se gasta más rápido', 'No cambia'], 1, 'Cada luz encendida consume un poco más de energía.'),
        ],
      },
    },
    'casa-iluminada': {
      reto: { texto: 'Vas a construir una casa de cartón con una luz en cada cuarto. La sala tendrá un dímmer: una perilla para subir y bajar el brillo.', paraQue: 'Un dímmer ahorra energía y cambia el ambiente de un cuarto. Además, cablear una maqueta es hacer en pequeño el trabajo de un electricista.', duracion: '60 minutos', fotoUrl: circuito(5) },
      piezas: [{ ...led('(4)'), nombre: 'Cuatro LED' }, { ...R470, nombre: 'Cuatro resistencias de 470 Ω' }, { nombre: 'Potenciómetro de 5 kΩ', paraQue: 'Es una resistencia que cambia al girar la perilla. Será el dímmer de la sala.', cuidado: 'Tiene 3 patas. Aquí se usan solo dos: la del centro y una de los extremos.' }, { nombre: 'Cinta de cobre y caja de cartón', paraQue: 'La caja es la casa. La cinta hace de cableado: una línea arriba para el positivo y una abajo para el negativo.' }, BATERIA],
      pasos: [
        { titulo: 'Prepara la casa', texto: 'Divide la caja en cuatro cuartos con cartón: cocina, dormitorio, baño y sala.' },
        { titulo: 'Las dos líneas de cobre', texto: 'Pega una cinta de cobre a lo largo de toda la parte alta de la casa: será el positivo (+). Pega otra a lo largo de toda la parte baja: será el negativo (–). No deben tocarse.' },
        { titulo: 'Cocina, dormitorio y baño', texto: 'En cada uno de estos tres cuartos pon una resistencia de 470 Ω desde la cinta de arriba y, a continuación, un LED cuya pata corta llegue a la cinta de abajo.' },
        { titulo: 'La sala con dímmer', texto: 'En la sala, desde la cinta de arriba pon primero el potenciómetro (pata del centro y una del extremo), luego la resistencia de 470 Ω, luego el LED, y lleva la pata corta a la cinta de abajo.', consejo: 'La resistencia de 470 Ω se queda aunque esté el potenciómetro: protege al LED cuando la perilla está al mínimo.' },
        { titulo: 'Conecta la batería', texto: 'Une el cable rojo de la batería con la cinta de arriba y el negro con la cinta de abajo.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Las cuatro luces se encienden.', 'Al girar la perilla, la luz de la sala sube y baja de brillo; las otras tres no cambian.', 'Si se saca la luz de un cuarto, las demás siguen encendidas.'], siNoFunciona: [{ problema: 'La luz de la sala no cambia al girar', revisa: 'Estás usando las dos patas de los extremos del potenciómetro. Cambia una de ellas por la pata del centro.' }, { problema: 'Una luz no enciende', revisa: 'Gira ese LED y aprieta bien sus patas contra la cinta de cobre.' }, { problema: 'Ninguna enciende', revisa: 'Las dos cintas se tocan en algún punto, o un cable de la batería se soltó.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Agrega un interruptor de papel (como el del semáforo de papel) a uno de los cuartos, para poder apagar solo esa luz.',
        preguntas: [
          q('¿Qué hace el potenciómetro en la sala?', ['Cambia el color de la luz', 'Aumenta o disminuye la resistencia y con eso el brillo', 'Apaga toda la casa'], 1, 'Más resistencia deja pasar menos corriente: el LED brilla menos.'),
          q('¿Por qué las luces están en paralelo?', ['Para que cada una funcione sola, sin depender de las otras', 'Para gastar más cinta', 'Porque es más bonito'], 0, 'Igual que en una casa real.'),
          q('¿Por qué la resistencia de 470 Ω se queda junto al potenciómetro?', ['Para proteger el LED cuando la perilla está al mínimo', 'Para adornar', 'No hace falta'], 0, 'Con la perilla en cero, sin esa resistencia el LED se quemaría.'),
        ],
      },
    },
  },

  // ═════════════ KIT 6 · 4to EGB · Farola inteligente ═════════════
  'kit-lv-cuarto-egb': {
    'farola-enciende-led': primerLed({ color: 'blanco', destino: 'Será la luz de tu farola, que después se encenderá sola al oscurecer.' }),
    'farola-un-transistor': unTransistor({ color: 'blanco', destino: 'Después, en lugar de tu mano, será un sensor de luz el que dé la orden.' }),
    'farola-divisor-con-ldr': {
      reto: { texto: 'Vas a armar un sensor de oscuridad con una LDR y a conectarlo a la base del transistor. Cuando tapes la LDR, el LED se encenderá solo.', paraQue: 'Las luces de la calle no las enciende una persona: tienen un sensor que nota cuándo oscurece. Así se encienden solas cada tarde y se apagan cada mañana.', duracion: '45 minutos' },
      piezas: [{ nombre: 'LDR (fotorresistencia)', paraQue: 'Es una resistencia que cambia con la luz: con mucha luz deja pasar la corriente con facilidad; a oscuras, casi no la deja pasar.', cuidado: 'Tiene 2 patas y no tiene lado: puede ir en cualquier sentido.' }, { nombre: 'Resistencia de 4,7 kΩ', paraQue: 'Junto con la LDR reparte el voltaje de la batería. A ese reparto se le llama divisor de voltaje.', cuidado: 'Sus franjas son amarillo, violeta y rojo.' }, R1K, TRANSISTOR, led('blanco'), R470, BATERIA, PROTO],
      pasos: [
        { titulo: 'Parte del circuito anterior', texto: 'Deja armado el transistor con el LED y su resistencia de 470 Ω en el colector, y el emisor en la línea negra.' },
        { titulo: 'La resistencia de 4,7 kΩ', texto: 'Pon una pata de la resistencia de 4,7 kΩ en la línea roja (+) y la otra en una fila libre. A esa fila la llamaremos "punto medio".' },
        { titulo: 'La LDR', texto: 'Pon una pata de la LDR en el punto medio y la otra en la línea negra (–).' },
        { titulo: 'Del punto medio a la base', texto: 'Une el punto medio con la pata B del transistor a través de la resistencia de 1 kΩ.' },
        RIELES_9V,
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con mucha luz sobre la LDR (junto a una ventana o con una linterna), el LED se apaga.', 'Al tapar la LDR con la mano, el LED se enciende.', 'Al volver a iluminarla, se apaga.'], siNoFunciona: [{ problema: 'El LED está siempre encendido', revisa: 'A la LDR le falta luz: este circuito necesita bastante para apagarse. Acércale una linterna o ve junto a una ventana. Si aun así no se apaga, revisa que la LDR llegue a la línea negra.' }, { problema: 'El LED nunca enciende', revisa: 'Comprueba que el punto medio llega a la base por la resistencia de 1 kΩ, y que la de 4,7 kΩ va a la línea roja.' }, BATERIA_GASTADA, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Intercambia de lugar la LDR y la resistencia de 4,7 kΩ. ¿Qué hace ahora el LED cuando tapas el sensor? Explica para qué podría servir ese circuito al revés.',
        preguntas: [
          q('¿Qué le pasa a la LDR en la oscuridad?', ['Deja pasar más corriente', 'Deja pasar menos corriente', 'Se apaga'], 1, 'A oscuras su resistencia es muy alta.'),
          q('¿Por qué se enciende el LED al oscurecer?', ['Porque la corriente ya no se va por la LDR y llega a la base del transistor', 'Porque la batería da más energía de noche', 'Porque el LED nota la oscuridad'], 0, 'Con luz, la LDR desvía la corriente a tierra; a oscuras, esa corriente activa el transistor.'),
          q('¿Cómo se llama el reparto de voltaje entre dos resistencias?', ['Par Darlington', 'Divisor de voltaje', 'Circuito en paralelo'], 1, 'El punto medio queda con una parte del voltaje, según el valor de cada resistencia.'),
        ],
      },
    },
    'farola-inteligente': {
      reto: { texto: 'Vas a terminar tu farola inteligente: se enciende sola cuando oscurece y tú eliges, con una perilla, a partir de qué momento lo hace.', paraQue: 'El alumbrado público automático ahorra muchísima energía en una ciudad: ninguna luz queda encendida de día por descuido.', duracion: '50 minutos', fotoUrl: circuito(6) },
      piezas: [{ nombre: 'Potenciómetro de 5 kΩ', paraQue: 'Ajusta la sensibilidad: con él decides con cuánta oscuridad se enciende la farola.', cuidado: 'Usa la pata del centro y una de los extremos.' }, { nombre: 'LDR', paraQue: 'Es el sensor de luz.' }, { nombre: 'Resistencias de 4,7 kΩ, 1 kΩ y 470 Ω', paraQue: 'La de 4,7 kΩ forma el divisor con la LDR, la de 1 kΩ protege la base y la de 470 Ω protege el LED.' }, TRANSISTOR, led('blanco'), BATERIA, PROTO],
      pasos: [
        { titulo: 'Agrega el potenciómetro', texto: 'Saca de la línea roja la pata de la resistencia de 4,7 kΩ. En su lugar pon el potenciómetro: una pata a la línea roja y la otra a la resistencia de 4,7 kΩ. Quedan en fila: positivo, potenciómetro, 4,7 kΩ, punto medio, LDR, negativo.' },
        { titulo: 'Revisa con el dibujo', texto: 'Compara tu armado con el circuito completo: el punto medio va a la base por la resistencia de 1 kΩ; el LED y su resistencia van del positivo al colector; el emisor va al negativo.' },
        { titulo: 'Arma la farola', texto: 'Con cartón o un sorbete construye un poste. Sube el LED a lo alto y deja la LDR mirando hacia arriba, donde le dé la luz del salón y no la de su propio LED.' },
        { titulo: 'Ajusta', texto: 'Pon la farola donde le dé buena luz (junto a una ventana o bajo una lámpara) y gira la perilla hasta que el LED quede apenas apagado. Ese es el punto justo.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con buena luz sobre la LDR, la farola está apagada.', 'Al tapar la LDR o apagar las luces, la farola se enciende sola.', 'Al girar la perilla cambia la cantidad de oscuridad necesaria para que encienda.'], siNoFunciona: [{ problema: 'La farola parpadea sin parar', revisa: 'La LDR está viendo la luz de su propio LED. Sepárala o ponle una pared de cartón en medio.' }, { problema: 'La perilla no cambia nada', revisa: 'Estás usando las dos patas de los extremos del potenciómetro. Usa la del centro y una del extremo.' }, { problema: 'Nunca se apaga', revisa: 'Gira la perilla hacia el otro lado. Si sigue igual, falta luz: este circuito necesita bastante para apagarse. Acerca una linterna a la LDR.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Calibra tu farola junto a una ventana para que se encienda al taparla por completo, pero no cuando solo pasa una sombra. Explica cómo encontraste ese punto.',
        preguntas: [
          q('¿Para qué sirve el potenciómetro en la farola?', ['Para cambiar el color de la luz', 'Para elegir con cuánta oscuridad se enciende', 'Para cargar la batería'], 1, 'Cambia el reparto del divisor y, con eso, el punto en que el transistor se activa.'),
          q('¿Por qué la LDR no debe ver la luz del propio LED?', ['Porque se quema', 'Porque al encenderse el LED creería que es de día y lo apagaría, una y otra vez', 'Porque gasta batería'], 1, 'Por eso las farolas reales tienen el sensor mirando al cielo.'),
          q('¿Qué pieza decide si pasa corriente por el LED?', ['La LDR directamente', 'El transistor', 'La batería'], 1, 'La LDR da la señal y el transistor hace de interruptor.'),
        ],
      },
    },
  },

  // ═════════════ KIT 7 · 5to EGB · Tanque de agua inteligente ═════════════
  'kit-lv-quinto-egb': {
    'tanque-enciende-led': primerLed({ color: 'rojo', resistencia: { nombre: 'Resistencia para el LED (1 kΩ, 220 Ω o 330 Ω)', paraQue: 'Frena la corriente para que el LED no se queme.', cuidado: 'Usa la que venga en tu kit. Con 1 kΩ el LED brilla un poco menos que con 220 Ω o 330 Ω, y la batería dura más.' }, destino: 'Será la luz de "nivel bajo" de tu tanque de agua.' }),
    'tanque-un-transistor': unTransistor({ color: 'rojo', resistenciaLed: '1 kΩ, 220 Ω o 330 Ω', base: '470 Ω', destino: 'Después será el agua la que dé la orden de encender.' }),
    'tanque-sondas-en-agua': {
      reto: { texto: 'Vas a descubrir que el agua con sal conduce la electricidad: al meter dos puntas en un vaso, el LED se enciende.', paraQue: 'Los tanques de las casas y los bebederos automáticos usan sondas así para saber si hay agua, sin que nadie tenga que subir a mirar.', duracion: '40 minutos' },
      piezas: [{ nombre: 'Dos sondas', paraQue: 'Son dos puntas de metal (cables o tiras de cinta de cobre) que se meten en el agua.', cuidado: 'No deben tocarse entre sí dentro del vaso.' }, { nombre: 'Resistencia de 470 Ω (sonda común)', paraQue: 'Va entre el positivo y la sonda común. Protege al transistor si las dos sondas llegan a tocarse.', cuidado: 'Sus franjas son amarillo, violeta y café.' }, TRANSISTOR, led('rojo'), BATERIA, PROTO, { nombre: 'Vaso con agua y una pizca de sal', paraQue: 'El agua con sal conduce mejor la electricidad que el agua sola.', cuidado: 'Mantén el vaso lejos de la batería y de la protoboard.' }],
      pasos: [
        { titulo: 'Parte del circuito anterior', texto: 'Deja armado el transistor con el LED y su resistencia en el colector y el emisor en la línea negra. Retira la resistencia de 470 Ω de la base: ahora irá en la sonda común.' },
        { titulo: 'La sonda común', texto: 'Pon la resistencia de 470 Ω desde la línea roja (+) hasta una fila libre. De esa fila saca un cable largo: es la sonda común.' },
        { titulo: 'La sonda de nivel', texto: 'De la pata B del transistor saca otro cable largo: es la sonda de nivel.' },
        { titulo: 'Al agua', texto: 'Conecta la batería y mete las dos puntas en el vaso con agua y sal, separadas.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con las puntas fuera del agua, el LED está apagado.', 'Con las dos puntas dentro del agua, el LED se enciende.', 'Al sacar cualquiera de las dos, se apaga.'], siNoFunciona: [{ problema: 'El LED enciende muy poco', revisa: 'Agrega un poco más de sal y revuelve. Acerca las puntas entre sí, sin que se toquen.' }, { problema: 'No enciende', revisa: 'Comprueba que una sonda sale de la base del transistor y la otra llega al positivo por la resistencia de 470 Ω.' }, BATERIA_GASTADA, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Prueba con agua sin sal, con agua con azúcar y con agua con sal. Anota en cuál brilla más el LED y ordénalos del que mejor conduce al que peor conduce.',
        preguntas: [
          q('¿Por qué se enciende el LED al meter las sondas en el agua?', ['Porque el agua con sal deja pasar una pequeña corriente hasta la base del transistor', 'Porque el agua empuja los cables', 'Porque el LED se moja'], 0, 'Esa corriente pequeña activa el transistor, y este enciende el LED.'),
          q('¿Para qué sirve la resistencia de 470 Ω en la sonda común?', ['Para proteger el transistor si las sondas se tocan', 'Para calentar el agua', 'Para que el LED cambie de color'], 0, 'Sin ella, al tocarse las sondas llegaría demasiada corriente a la base.'),
          q('¿Qué conduce mejor la electricidad?', ['El agua con sal', 'El agua sola', 'El aire'], 0, 'La sal disuelta ayuda a que la corriente pase.'),
        ],
      },
    },
    'tanque-de-agua-inteligente': {
      reto: { texto: 'Vas a construir un medidor de nivel para un tanque: cuatro LED de colores que se encienden uno a uno a medida que sube el agua: bajo, medio, alto y lleno.', paraQue: 'Con un indicador así, una familia sabe cuánta agua queda en el tanque del techo sin subir a mirar, y evita que se desborde o que se quede vacío.', duracion: '70 minutos', fotoUrl: circuito(7) },
      piezas: [{ ...TRANSISTOR, nombre: 'Cuatro transistores 2N3904' }, { nombre: 'Cuatro LED: rojo, amarillo, azul y verde', paraQue: 'Rojo: nivel bajo. Amarillo: medio. Azul: alto. Verde: lleno.', cuidado: 'La pata larga va al positivo.' }, { nombre: 'Cuatro resistencias para los LED (1 kΩ, 220 Ω o 330 Ω)', paraQue: 'Una para cada LED.' }, { nombre: 'Resistencia de 470 Ω', paraQue: 'Protege los transistores; va en la sonda común.' }, { nombre: 'Cinta de cobre y botella transparente', paraQue: 'La botella es el tanque. Cinco tiras de cobre hacen de sondas: una común en el fondo y cuatro a distintas alturas.' }, { nombre: 'Cables jumper', paraQue: 'Llevan cada sonda hasta la protoboard.' }, BATERIA, PROTO],
      pasos: [
        { titulo: 'Arma cuatro circuitos iguales', texto: 'Repite cuatro veces el circuito de la práctica anterior, uno al lado del otro: desde la línea roja, el LED (pata larga al positivo), su resistencia y el colector del transistor; el emisor a la línea negra.', consejo: 'Ordena los colores de abajo hacia arriba: rojo, amarillo, azul y verde.' },
        { titulo: 'La sonda común', texto: 'Pega una tira de cobre en el fondo de la botella. Únela con la línea roja (+) a través de la resistencia de 470 Ω.' },
        { titulo: 'Las cuatro sondas de nivel', texto: 'Pega cuatro tiras de cobre por dentro de la botella, a distintas alturas. Une cada una con la base de un transistor: la más baja con el del LED rojo, la siguiente con el amarillo, luego el azul, y la más alta con el verde.' },
        { titulo: 'Revisa', texto: 'Ninguna sonda debe tocar a otra. Compara con el dibujo del circuito completo.' },
        { titulo: 'Llena el tanque', texto: 'Conecta la batería y vierte agua con un poco de sal, despacio.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con el tanque vacío, todos los LED están apagados.', 'Al subir el agua se encienden en orden: rojo, amarillo, azul y verde.', 'Con el tanque lleno, los cuatro están encendidos.', 'Al vaciarlo, se apagan en orden inverso.'], siNoFunciona: [{ problema: 'Un LED se enciende fuera de orden', revisa: 'Esa sonda está a una altura equivocada o conectada a la base de otro transistor.' }, { problema: 'Un LED no enciende nunca', revisa: 'Revisa ese circuito por separado: sentido del LED, patas del transistor y que su sonda llegue a la base.' }, { problema: 'Encienden muy poco', revisa: 'Agrega una pizca de sal al agua.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Usa el pulsador del kit como botón de "consultar nivel": ponlo entre el cable rojo de la batería y la línea roja, para que el indicador funcione solo mientras lo presionas. ¿Por qué eso haría durar más la batería?',
        preguntas: [
          q('¿Qué LED se enciende primero al llenar el tanque?', ['El verde', 'El rojo', 'Todos a la vez'], 1, 'El rojo corresponde a la sonda más baja.'),
          q('¿Cuántas sondas tiene el tanque en total?', ['Cuatro', 'Cinco', 'Ocho'], 1, 'Cuatro de nivel y una común en el fondo.'),
          q('Si están encendidos el rojo y el amarillo, el tanque está…', ['Vacío', 'A la mitad', 'Lleno'], 1, 'El agua llegó a la sonda del medio, pero no a la alta.'),
        ],
      },
    },
  },

  // ═════════════ KIT 8 · 6to EGB · Semáforo automático ═════════════
  'kit-lv-sexto-egb': {
    'semaforo-auto-condensador': {
      reto: { texto: 'Vas a descubrir una pieza que guarda energía por un momento: el condensador. Lo cargarás con la batería y verás cómo mantiene encendido un LED aunque la batería ya no esté.', paraQue: 'El flash de una cámara y la luz que tarda en apagarse al desconectar un cargador usan condensadores. También sirven para medir el tiempo en un circuito, y eso es lo que hará tu semáforo.', duracion: '35 minutos' },
      piezas: [{ nombre: 'Condensador de 470 μF', paraQue: 'Guarda energía eléctrica y la entrega poco a poco.', cuidado: 'Tiene polaridad: la franja con signos – marca la pata negativa. Conectarlo al revés lo daña.' }, led('rojo'), R1K, BATERIA, PROTO],
      pasos: [
        { titulo: 'Coloca el condensador', texto: 'Pon el condensador con la pata positiva (la larga) en una fila y la negativa (la de la franja) en la línea negra (–).' },
        { titulo: 'El LED con su resistencia', texto: 'Desde la fila de la pata positiva del condensador pon la resistencia de 1 kΩ, luego el LED (pata larga hacia la resistencia) y lleva la pata corta a la línea negra.' },
        { titulo: 'Carga', texto: 'Conecta el negro de la batería a la línea negra. Toca con el cable rojo la fila de la pata positiva del condensador durante dos segundos: el LED se enciende.' },
        { titulo: 'Retira la batería', texto: 'Separa el cable rojo y observa el LED.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Mientras el cable rojo toca, el LED está encendido.', 'Al retirarlo, el LED no se apaga de golpe: sigue encendido un momento y se va apagando poco a poco.'], siNoFunciona: [{ problema: 'El LED se apaga de inmediato', revisa: 'El condensador no está en la misma fila que la resistencia, o está al revés.' }, LED_AL_REVES, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Repite la prueba con el condensador de 100 μF y cuenta cuánto dura la luz con cada uno. ¿Cuál la mantiene más tiempo?',
        preguntas: [
          q('¿Qué hace un condensador?', ['Guarda energía por un momento', 'Produce energía como una batería', 'Frena la corriente'], 0, 'Se carga y luego entrega esa energía.'),
          q('¿Cuál mantiene el LED encendido más tiempo?', ['El de 100 μF', 'El de 470 μF', 'Los dos igual'], 1, 'A más microfaradios, más energía guarda.'),
          q('¿Cómo se reconoce la pata negativa?', ['Es la más larga', 'Está del lado de la franja con signos –', 'No tiene'], 1, 'La pata larga es la positiva.'),
        ],
      },
    },
    'semaforo-auto-tres-etapas': {
      reto: { texto: 'Vas a armar tres etapas iguales, una por cada color. Cada etapa tiene un transistor, dos resistencias y un LED.', paraQue: 'Los circuitos grandes se construyen repitiendo bloques pequeños. Aprender a armar una etapa y copiarla es la forma en que trabajan los ingenieros.', duracion: '50 minutos' },
      piezas: [{ ...TRANSISTOR, nombre: 'Tres transistores 2N3904' }, { ...R1K, nombre: 'Tres resistencias de 1 kΩ', paraQue: 'Van del positivo al colector de cada transistor.' }, { nombre: 'Tres resistencias de 22 kΩ', paraQue: 'Van del positivo a la base de cada transistor.', cuidado: 'Sus franjas son rojo, rojo y naranja.' }, { nombre: 'LED rojo, amarillo y verde', paraQue: 'Las tres luces del semáforo.', cuidado: 'La pata larga va hacia el colector.' }, BATERIA, PROTO, { nombre: 'Cables jumper', paraQue: 'Unen las piezas que no quedan en la misma fila.' }],
      pasos: [
        { titulo: 'Etapa roja: el transistor', texto: 'Coloca un transistor con la cara plana hacia ti. Une su pata E con la línea negra (–).' },
        { titulo: 'Etapa roja: las resistencias', texto: 'Pon la resistencia de 1 kΩ entre la línea roja (+) y la pata C. Pon la resistencia de 22 kΩ entre la línea roja y la pata B.' },
        { titulo: 'Etapa roja: el LED', texto: 'Pon el LED rojo entre la pata C y la línea negra: la pata larga hacia el colector y la corta al negativo.', consejo: 'En este circuito el LED va del colector a tierra, al revés que en otros kits. Por eso se enciende cuando su transistor está apagado.' },
        { titulo: 'Etapas amarilla y verde', texto: 'Arma al lado dos etapas idénticas, una con el LED amarillo y otra con el verde.' },
        RIELES_9V,
      ],
      codigo: [],
      prueba: { queDebePasar: ['Al conectar la batería, los tres LED quedan apagados o brillan muy poco: cada transistor está activado por su resistencia de 22 kΩ.', 'Si retiras la resistencia de 22 kΩ de una etapa, el LED de esa etapa se enciende.'], siNoFunciona: [{ problema: 'Un LED está encendido con todo conectado', revisa: 'A esa etapa le falta la resistencia de 22 kΩ en la base, o el emisor no llega a la línea negra.' }, { problema: 'Al quitar la resistencia de 22 kΩ, el LED no enciende', revisa: 'El LED está al revés o no está en la fila del colector.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Explica a un compañero por qué el LED se enciende cuando el transistor se apaga. Pista: piensa por dónde prefiere ir la corriente que baja por la resistencia de 1 kΩ.',
        preguntas: [
          q('¿Cuántas resistencias tiene cada etapa?', ['Una', 'Dos', 'Tres'], 1, 'Una de 1 kΩ al colector y una de 22 kΩ a la base.'),
          q('En este circuito, el LED se enciende cuando su transistor está…', ['Activado', 'Apagado'], 1, 'Con el transistor activado, la corriente se va por él y no por el LED.'),
          q('¿Dónde va el LED en cada etapa?', ['Del colector a la línea negra', 'Del positivo al colector', 'En la base'], 0, 'Pata larga al colector, pata corta al negativo.'),
        ],
      },
    },
    'semaforo-auto-condensadores': {
      reto: { texto: 'Vas a unir las tres etapas con condensadores para que se pasen el turno una a otra, en círculo. Las luces empezarán a cambiar solas.', paraQue: 'Antes de las computadoras, muchas máquinas marcaban el tiempo así, con condensadores que se cargan y descargan. Es la idea detrás de las luces intermitentes y de los relojes electrónicos.', duracion: '45 minutos' },
      piezas: [{ nombre: 'Dos condensadores de 470 μF y uno de 100 μF', paraQue: 'Cada uno une el colector de una etapa con la base de la siguiente. Su tamaño decide cuánto dura cada luz.', cuidado: 'La pata positiva (larga) va siempre hacia el colector.' }, { nombre: 'Tus tres etapas armadas', paraQue: 'Roja, amarilla y verde.' }, { nombre: 'Cables jumper', paraQue: 'El último condensador necesita un cable largo para volver a la primera etapa.' }],
      pasos: [
        { titulo: 'De la roja a la amarilla', texto: 'Con la batería desconectada, pon un condensador de 470 μF: pata positiva en el colector de la etapa roja, pata negativa en la base de la etapa amarilla.' },
        { titulo: 'De la amarilla a la verde', texto: 'Pon el condensador de 100 μF: pata positiva en el colector de la etapa amarilla, pata negativa en la base de la etapa verde.' },
        { titulo: 'De la verde a la roja', texto: 'Pon el otro condensador de 470 μF: pata positiva en el colector de la etapa verde, pata negativa en la base de la etapa roja. Usa un cable largo para cerrar el círculo.' },
        { titulo: 'Revisa la polaridad', texto: 'Mira los tres condensadores: la franja con signos – debe estar siempre del lado de la base.' },
        RIELES_9V,
      ],
      codigo: [],
      prueba: { queDebePasar: ['Unos segundos después de conectar la batería, las luces empiezan a encenderse una tras otra, solas.', 'La secuencia se repite sin parar.', 'Una de las luces dura menos que las otras dos.'], siNoFunciona: [{ problema: 'Las tres luces quedan apagadas y no arranca', revisa: 'Desconecta y vuelve a conectar la batería. Si sigue igual, revisa que cada condensador vaya de un colector a la base de la etapa siguiente.' }, { problema: 'Una luz queda fija', revisa: 'Un condensador está al revés o suelto. La pata positiva va hacia el colector.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Intercambia el condensador de 100 μF con uno de 470 μF. ¿Qué luz dura menos ahora? Anota la regla que descubriste.',
        preguntas: [
          q('¿Qué une cada condensador?', ['El colector de una etapa con la base de la siguiente', 'Los tres LED entre sí', 'La batería con los LED'], 0, 'Así cada etapa le pasa el turno a la que sigue.'),
          q('¿De qué depende cuánto dura cada luz?', ['Del color del LED', 'Del tamaño del condensador', 'De la protoboard'], 1, 'Un condensador más grande tarda más en cargarse.'),
          q('¿Hacia dónde va la pata positiva del condensador?', ['Hacia la base', 'Hacia el colector', 'Da igual'], 1, 'Los condensadores electrolíticos tienen polaridad.'),
        ],
      },
    },
    'semaforo-automatico': {
      reto: { texto: 'Vas a montar tu circuito en un semáforo de cartón que cambia solo: rojo, amarillo y verde, cada uno con su tiempo, sin botones ni programas.', paraQue: 'Los primeros semáforos automáticos funcionaban con circuitos de tiempo, mucho antes de que existieran los microcontroladores. El tuyo demuestra que se puede automatizar algo usando solo transistores y condensadores.', duracion: '60 minutos', fotoUrl: circuito(8) },
      piezas: [{ ...TRANSISTOR, nombre: 'Tres transistores 2N3904' }, { nombre: 'Tres resistencias de 1 kΩ y tres de 22 kΩ', paraQue: 'Las de 1 kΩ van al colector; las de 22 kΩ, a la base.' }, { nombre: 'Dos condensadores de 470 μF y uno de 100 μF', paraQue: 'Marcan el tiempo de cada luz.', cuidado: 'Pata positiva hacia el colector.' }, { nombre: 'LED rojo, amarillo y verde', paraQue: 'Las tres luces.' }, BATERIA, PROTO, { nombre: 'Cartón y cables jumper', paraQue: 'El cartón es el cuerpo del semáforo; los cables llevan las luces hasta él.' }],
      pasos: [
        { titulo: 'Comprueba que funciona', texto: 'Conecta la batería y verifica que las tres luces se turnan solas. Compara tu armado con el dibujo del circuito completo.' },
        { titulo: 'Ordena los tiempos', texto: 'El condensador de 100 μF hace que una luz dure menos. Fíjate cuál es, y cambia los LED de lugar si hace falta, para que la luz corta sea la amarilla.' },
        { titulo: 'Construye el semáforo', texto: 'Recorta una caja de cartón con tres ventanas y un poste. Píntala de negro o gris.' },
        { titulo: 'Sube las luces', texto: 'Saca los tres LED de la protoboard y llévalos a las ventanas con cables jumper: el rojo arriba, el amarillo al centro y el verde abajo. Cada LED conserva sus dos conexiones.', consejo: 'Marca con cinta la pata larga de cada LED antes de sacarlo, para no confundirte al alargar los cables.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['El semáforo cambia solo, en secuencia, y se repite sin parar.', 'El amarillo dura menos que el rojo y el verde.', 'Solo hay una luz encendida con claridad a la vez.'], siNoFunciona: [{ problema: 'Dejó de funcionar al subir los LED', revisa: 'Un cable quedó flojo o un LED se invirtió al alargarlo.' }, { problema: 'El orden de colores no es el de un semáforo', revisa: 'Intercambia dos LED de lugar hasta lograr la secuencia que quieres.' }, { problema: 'No arranca', revisa: 'Desconecta y reconecta la batería. Revisa la polaridad de los tres condensadores.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Mide con un cronómetro cuánto dura cada luz y anótalo. Luego explica qué cambiarías para que el rojo dure el doble.',
        preguntas: [
          q('¿Qué hace que el semáforo cambie solo?', ['Un programa', 'Los condensadores, que se cargan y descargan pasándose el turno', 'Un botón escondido'], 1, 'No hay ningún programa: solo tiempos de carga.'),
          q('¿Por qué el amarillo dura menos?', ['Porque su etapa tiene el condensador más pequeño (100 μF)', 'Porque el LED amarillo es más débil', 'Por casualidad'], 0, 'Menos capacidad significa menos tiempo.'),
          q('¿Cuántos transistores usa el semáforo?', ['Uno', 'Tres', 'Seis'], 1, 'Uno por cada etapa de color.'),
        ],
      },
    },
  },

  // ═════════════ KIT 9 · 7mo EGB · Números secretos ═════════════
  'kit-lv-septimo-egb': {
    'display-enciende-segmento': {
      reto: { texto: 'Vas a encender una sola barrita de un display de 7 segmentos, la pantalla que forma números con siete luces.', paraQue: 'Los relojes digitales, las calculadoras, los microondas y los marcadores de las canchas usan displays así. Cada número que ves es una combinación de siete LED en forma de barra.', duracion: '30 minutos' },
      piezas: [{ nombre: 'Display de 7 segmentos (cátodo común)', paraQue: 'Tiene dentro ocho LED: siete barritas, llamadas segmentos, y un punto. Todos comparten la misma pata negativa.', cuidado: 'Tiene 10 patas, 5 arriba y 5 abajo. La pata del centro de cada lado es la común (–).' }, R1K, BATERIA, PROTO],
      pasos: [
        { titulo: 'Coloca el display', texto: 'Pon el display a caballo sobre el canal central de la protoboard, de modo que cada pata quede en una fila distinta.' },
        { titulo: 'La pata común al negativo', texto: 'Une la pata del centro de uno de los lados con la línea negra (–).' },
        { titulo: 'Un segmento con su resistencia', texto: 'Pon una resistencia de 1 kΩ entre la línea roja (+) y cualquier otra pata del display.' },
        RIELES_9V,
      ],
      codigo: [],
      prueba: { queDebePasar: ['Se enciende una sola barrita del display (o el punto).', 'Al mover la resistencia a otra pata, se enciende una barrita distinta.'], siNoFunciona: [{ problema: 'No se enciende nada', revisa: 'Prueba la pata del centro del otro lado como común. Si tampoco enciende, tu display puede ser de ánodo común: avisa a tu docente.' }, { problema: 'Se encienden dos barritas a la vez', revisa: 'Dos patas quedaron en la misma fila. El display debe ir sobre el canal central.' }, BATERIA_GASTADA, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Sin mirar tus apuntes, predice qué barrita se encenderá al mover la resistencia a la pata de al lado. Luego compruébalo.',
        preguntas: [
          q('¿Cuántas barritas forman un número en el display?', ['Cinco', 'Siete', 'Diez'], 1, 'Por eso se llama display de 7 segmentos.'),
          q('¿Qué significa "cátodo común"?', ['Que todos los segmentos comparten la pata negativa', 'Que todos comparten la pata positiva', 'Que no necesita resistencia'], 0, 'Basta una sola conexión al negativo para todos.'),
          q('¿Por qué cada segmento lleva resistencia?', ['Porque cada segmento es un LED y hay que protegerlo', 'Para que cambie de color', 'No hace falta'], 0, 'Con 9 V directos, el segmento se quemaría.'),
        ],
      },
    },
    'display-mapa-de-pines': {
      reto: { texto: 'Vas a hacer el mapa de tu display: descubrir qué pata enciende cada segmento y anotarlo en una tabla.', paraQue: 'Ningún técnico conecta una pieza sin saber qué hace cada pata. Si no se tiene la hoja de datos, se investiga probando, como vas a hacer tú.', duracion: '35 minutos' },
      piezas: [{ nombre: 'Display de 7 segmentos', paraQue: 'Sus segmentos se nombran con letras: a arriba, b y c a la derecha, d abajo, e y f a la izquierda, y g en el centro.' }, R1K, BATERIA, PROTO, { nombre: 'Papel y lápiz', paraQue: 'Para dibujar el display y anotar tu mapa.' }],
      pasos: [
        { titulo: 'Dibuja el display', texto: 'En tu hoja dibuja un 8 hecho con siete barritas y ponles letras: a arriba; b arriba a la derecha; c abajo a la derecha; d abajo; e abajo a la izquierda; f arriba a la izquierda; g en el centro.' },
        { titulo: 'Numera las patas', texto: 'Dibuja también las 10 patas y numéralas. La común ya la conoces.' },
        { titulo: 'Prueba una por una', texto: 'Lleva la resistencia de 1 kΩ desde el positivo a cada pata, de una en una. Anota junto a cada número de pata la letra del segmento que se enciende.' },
        { titulo: 'El punto', texto: 'Una de las patas enciende el punto decimal. Anótala también.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Tu tabla tiene ocho patas con su segmento (siete barritas y el punto) y dos patas marcadas como común.', 'Un compañero puede encender el segmento que tú le pidas usando solo tu tabla.'], siNoFunciona: [{ problema: 'Dos patas encienden el mismo segmento', revisa: 'Revisa que el display no se haya movido. Vuelve a probar con calma y corrige la tabla.' }, { problema: 'Una pata no enciende nada', revisa: 'Es la otra pata común.' }] },
      demuestra: {
        reto: 'Usando tu mapa, escribe qué patas habría que encender para formar el número 7. Compruébalo con tres resistencias.',
        preguntas: [
          q('¿Qué segmento está arriba del todo?', ['a', 'd', 'g'], 0, 'Las letras empiezan arriba y giran como las agujas del reloj.'),
          q('¿Qué segmento es la barrita del centro?', ['a', 'f', 'g'], 2, 'La g es la que distingue un 0 de un 8.'),
          q('¿Qué segmentos forman el número 1?', ['a y d', 'b y c', 'e y f'], 1, 'Las dos barritas del lado derecho.'),
        ],
      },
    },
    'display-un-interruptor-por-segmento': {
      reto: { texto: 'Vas a conectar un interruptor a cada segmento usando un DIP switch: una fila de ocho palanquitas. Cada palanca encenderá su barrita.', paraQue: 'Los DIP switch se usan para configurar equipos: el canal de un control de garaje o las opciones de una placa. Aquí serán el teclado de tu pantalla.', duracion: '50 minutos' },
      piezas: [{ nombre: 'DIP switch de 8 interruptores', paraQue: 'Son ocho interruptores pequeños en una sola pieza. Cada uno une la pata de arriba con la de abajo cuando está en ON.', cuidado: 'Va a caballo sobre el canal central. Usa la punta de un lápiz para mover las palancas.' }, { ...R1K, nombre: 'Ocho resistencias de 1 kΩ', paraQue: 'Una para cada segmento y una para el punto.' }, { nombre: 'Display de 7 segmentos', paraQue: 'Con tu mapa de patas a la mano.' }, BATERIA, PROTO],
      pasos: [
        { titulo: 'Coloca el DIP switch', texto: 'Ponlo a caballo sobre el canal central, lejos del display, con todas las palancas en OFF.' },
        { titulo: 'El positivo a un lado', texto: 'Une las ocho patas de un lado del DIP switch con la línea roja (+).' },
        { titulo: 'Las resistencias al otro lado', texto: 'En cada una de las ocho patas del otro lado pon una resistencia de 1 kΩ.' },
        { titulo: 'De cada resistencia a un segmento', texto: 'Con tu mapa, une el extremo libre de cada resistencia con un segmento, en orden: interruptor 1 con a, 2 con b, 3 con c, 4 con d, 5 con e, 6 con f, 7 con g y 8 con el punto.' },
        { titulo: 'La común y la batería', texto: 'Comprueba que la pata común del display va a la línea negra (–) y conecta la batería.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con todas las palancas en OFF, el display está apagado.', 'Cada palanca enciende solo su segmento: la 1 enciende a, la 2 enciende b, y así hasta la 8, que enciende el punto.'], siNoFunciona: [{ problema: 'Una palanca enciende el segmento equivocado', revisa: 'Ese cable llegó a otra pata del display. Corrígelo con tu mapa.' }, { problema: 'Una palanca no enciende nada', revisa: 'Revisa su resistencia y que esa pata del DIP switch llegue a la línea roja.' }, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Con los ojos cerrados, pide a un compañero que suba tres palancas. Abre los ojos y di, solo mirando el display, cuáles subió.',
        preguntas: [
          q('¿Cuántos interruptores necesita el display completo?', ['Siete', 'Ocho, contando el punto', 'Diez'], 1, 'Siete segmentos más el punto decimal.'),
          q('¿Qué hace una palanca en ON?', ['Une sus dos patas y deja pasar la corriente', 'Apaga la batería', 'Cambia el segmento de color'], 0, 'Es un interruptor como cualquier otro, solo que muy pequeño.'),
          q('¿Qué segmento enciende el interruptor 7?', ['a', 'd', 'g'], 2, 'Siguen el orden a, b, c, d, e, f, g.'),
        ],
      },
    },
    'numeros-secretos': {
      reto: { texto: 'Vas a formar números y letras en el display moviendo los interruptores, y a usarlos para enviar mensajes en clave a tus compañeros.', paraQue: 'Una computadora guarda cada número como una combinación de encendidos y apagados. Al formar un dígito con ocho interruptores estás haciendo, a mano, lo mismo que hace un chip.', duracion: '50 minutos', fotoUrl: circuito(9) },
      piezas: [{ nombre: 'Display de 7 segmentos', paraQue: 'Es tu pantalla.' }, { nombre: 'DIP switch', paraQue: 'Es tu teclado: un interruptor por segmento.' }, { ...R1K, nombre: 'Ocho resistencias de 1 kΩ' }, BATERIA, PROTO],
      pasos: [
        { titulo: 'Forma el número 2', texto: 'Sube los interruptores 1, 2, 4, 5 y 7 (segmentos a, b, d, e y g). Deja los demás en OFF.' },
        { titulo: 'Haz tu tabla de números', texto: 'Descubre y anota qué interruptores forman cada número del 0 al 9.' },
        { titulo: 'Ahora letras', texto: 'Prueba a formar letras: A, C, E, F, H, L, P y U salen bien en un display.' },
        { titulo: 'Mensajes en clave', texto: 'Escribe en un papel solo los números de los interruptores, por ejemplo "1-2-4-5-7". Pásalo a un compañero: él debe subirlos y leer el número secreto.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con los interruptores 1, 2, 4, 5 y 7 aparece el número 2.', 'Puedes formar los diez números, del 0 al 9.', 'Tu compañero descifra tu mensaje en clave usando su propio display.'], siNoFunciona: [{ problema: 'El número sale deformado', revisa: 'Un interruptor está conectado al segmento equivocado. Sube las palancas de una en una para encontrarlo.' }, { problema: 'Falta una barrita', revisa: 'Revisa la resistencia y el cable de ese segmento.' }, BATERIA_GASTADA, ALGO_CALIENTE] },
      demuestra: {
        reto: 'Envía a un compañero un número de tres cifras, cifra por cifra, usando solo combinaciones de interruptores. Gana el equipo que lo descifre más rápido.',
        preguntas: [
          q('¿Qué número usa los siete segmentos?', ['El 0', 'El 8', 'El 1'], 1, 'El 8 enciende todas las barritas.'),
          q('¿Qué número usa menos segmentos?', ['El 1', 'El 7', 'El 4'], 0, 'Solo dos: b y c.'),
          q('¿Qué interruptores forman el número 1?', ['1 y 4', '2 y 3', '5 y 6'], 1, 'Los segmentos b y c, que están en los interruptores 2 y 3.'),
        ],
      },
    },
  },
}
