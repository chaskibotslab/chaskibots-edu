// Guías por etapas de las lecciones de Robótica de Inicial 1 (3 a 4 años).
// Escritas para el docente o el adulto que acompaña; las actividades son cortas y con mucho juego.
// Clave = título de la lección. Se cargan con scripts/seed-lesson-guias.js.

const q = (pregunta, opciones, correcta, explicacion) => ({ pregunta, opciones, correcta, explicacion })
const guia = ({ reto, paraQue, duracion, piezas, pasos, pasa, falla = [], extra, preguntas }) => ({
  reto: { texto: reto, paraQue, duracion },
  piezas,
  pasos,
  codigo: [],
  prueba: { queDebePasar: pasa, siNoFunciona: falla },
  demuestra: { reto: extra, preguntas },
})

const PILA = { nombre: 'Pila CR2032 en su porta pila', paraQue: 'Guarda la energía que enciende la luz.', cuidado: 'Es pequeña y peligrosa si se traga. La coloca, la entrega y la recoge siempre el adulto, y se cuenta al empezar y al terminar.' }
const LED = { nombre: 'LED de colores', paraQue: 'Es una luz pequeñita. Tiene dos patitas: una larga y una corta.', cuidado: 'Solo enciende de un lado. Si no enciende, se le da la vuelta.' }

module.exports = {
  levelId: 'inicial-1',
  programId: 'robotica',
  guias: {
    '¡Hola! Bienvenidos al curso': guia({
      reto: 'Hoy empezamos una aventura: vamos a conocer las luces, los robots y las cosas que funcionan con tecnología.',
      paraQue: 'La tecnología nos rodea: el teléfono, la tele, la luz de la casa. Este año vamos a descubrir cómo funcionan algunas de esas cosas, jugando.',
      duracion: '5 minutos',
      piezas: [
        { nombre: 'Un muñeco o títere de robot', paraQue: 'Será el amigo que nos acompaña en cada clase.' },
        { nombre: 'La caja del kit, cerrada', paraQue: 'Para despertar la curiosidad: ¿qué habrá adentro?' },
      ],
      pasos: [
        { titulo: 'Nos saludamos', texto: 'Presenta al robot amigo con una voz especial. Cada niño lo saluda y dice su nombre.' },
        { titulo: 'La caja misteriosa', texto: 'Muestra la caja del kit y agítala suavemente. Pregunta qué creen que hay dentro.' },
        { titulo: 'Nuestras reglas', texto: 'Con gestos, practiquen tres reglas: escuchamos, cuidamos los materiales y pedimos ayuda.' },
      ],
      pasa: ['Los niños saludan al robot amigo.', 'Repiten las tres reglas con gestos.'],
      extra: 'En casa, cuenta que tienes un nuevo amigo robot y cómo se llama.',
      preguntas: [
        q('¿Quién nos acompaña en las clases?', ['El robot amigo', 'Un gato'], 0, 'Nuestro robot amigo viene a todas las clases.'),
        q('¿Cuidamos los materiales?', ['Sí', 'No'], 0, 'Los materiales son de todos y los cuidamos.'),
      ],
    }),

    '¿Qué es un robot?': guia({
      reto: 'Hoy vamos a conocer a los robots: máquinas que se mueven y hacen cosas para ayudarnos.',
      paraQue: 'Hay robots que barren el piso, robots que arman carros y robots que exploran otros planetas. Los hacen las personas.',
      duracion: '8 minutos',
      piezas: [
        { nombre: 'Imágenes o un video corto de robots', paraQue: 'Una aspiradora robot, un brazo robot, un robot de juguete.' },
        { nombre: 'El robot amigo', paraQue: 'Para comparar con los robots de las imágenes.' },
      ],
      pasos: [
        { titulo: 'Miramos robots', texto: 'Muestra las imágenes una por una. Pregunta: ¿qué está haciendo este robot?' },
        { titulo: 'Nos movemos como robots', texto: 'Caminen con brazos y piernas tiesas, haciendo "bip, bip". Al decir "alto", todos se congelan.' },
        { titulo: 'Los robots ayudan', texto: 'Explica con palabras sencillas: un robot es una máquina que hace tareas para ayudarnos.' },
      ],
      pasa: ['Los niños señalan un robot en las imágenes.', 'Se mueven como robots y se detienen al escuchar "alto".'],
      falla: [{ problema: 'Creen que los robots están vivos', revisa: 'Aclara que son máquinas: no comen ni duermen, y funcionan con energía.' }],
      extra: 'Muévete como un robot para tu familia.',
      preguntas: [
        q('¿Un robot es una máquina?', ['Sí', 'No'], 0, 'Los robots son máquinas hechas por personas.'),
        q('¿Para qué sirven los robots?', ['Para ayudarnos', 'Para dormir'], 0, 'Los robots hacen tareas que nos ayudan.'),
      ],
    }),

    'Robots en nuestra vida': guia({
      reto: 'Hoy vamos a ser exploradores y a buscar máquinas que nos ayudan en la casa y en la escuela.',
      paraQue: 'Muchas máquinas trabajan para nosotros todos los días: la lavadora lava la ropa, la licuadora hace jugo, el semáforo ordena los carros.',
      duracion: '15 minutos',
      piezas: [
        { nombre: 'Tarjetas con máquinas de la casa', paraQue: 'Lavadora, licuadora, refrigeradora, aspiradora, ventilador.' },
        { nombre: 'Tarjetas con cosas que no son máquinas', paraQue: 'Una manzana, un árbol, una pelota.' },
      ],
      pasos: [
        { titulo: 'Paseo de exploradores', texto: 'Caminen por el aula buscando cosas que funcionan con energía: el foco, el ventilador, el reloj.' },
        { titulo: 'Jugamos con las tarjetas', texto: 'Muestra una tarjeta. Si es una máquina que ayuda, los niños levantan las manos; si no, se tocan la cabeza.' },
        { titulo: '¿Qué hace?', texto: 'Para cada máquina, imiten con el cuerpo lo que hace: la lavadora gira, la licuadora vibra.' },
      ],
      pasa: ['Los niños reconocen al menos dos máquinas del aula o de la casa.', 'Imitan con el cuerpo qué hace cada una.'],
      extra: 'Busca en casa una máquina que ayude a tu familia y cuéntalo mañana.',
      preguntas: [
        q('¿Cuál es una máquina que nos ayuda?', ['La lavadora', 'Una manzana'], 0, 'La lavadora lava la ropa por nosotros.'),
        q('¿El ventilador funciona con energía?', ['Sí', 'No'], 0, 'Necesita electricidad para girar.'),
      ],
    }),

    'Colores de la tecnología': guia({
      reto: 'Hoy vamos a descubrir las luces de colores de nuestro kit y a decir el nombre de cada color.',
      paraQue: 'Las luces de colores nos avisan cosas: el rojo del semáforo dice "alto" y el verde dice "pasa".',
      duracion: '10 minutos',
      piezas: [
        LED,
        { nombre: 'Tarjetas de colores', paraQue: 'Rojo, verde, azul y amarillo, para emparejar con las luces.' },
      ],
      pasos: [
        { titulo: 'Miramos las luces', texto: 'El adulto muestra los LED de uno en uno, sin encender. Los niños dicen su color.' },
        { titulo: 'Emparejamos', texto: 'Cada niño recibe una tarjeta de color y busca el LED que tiene el mismo color.' },
        { titulo: 'El juego del semáforo', texto: 'Muestra el rojo: todos se detienen. Muestra el verde: todos caminan. Muestra el amarillo: caminan despacito.' },
      ],
      pasa: ['Los niños nombran al menos dos colores.', 'Responden bien al rojo y al verde en el juego.'],
      falla: [{ problema: 'Confunden los colores', revisa: 'Trabaja solo con rojo y verde hasta que los distingan; luego agrega los demás.' }],
      extra: 'Busca en la calle una luz roja y una verde con tu familia.',
      preguntas: [
        q('¿Qué hacemos con la luz roja?', ['Nos detenemos', 'Corremos'], 0, 'El rojo significa alto.'),
        q('¿Qué hacemos con la luz verde?', ['Pasamos', 'Dormimos'], 0, 'El verde significa que podemos pasar.'),
      ],
    }),

    'Mi caja de herramientas': guia({
      reto: 'Hoy abrimos la caja del kit para conocer cada cosa que trae y aprender a guardarla en su lugar.',
      paraQue: 'Los ingenieros cuidan y ordenan sus herramientas para encontrarlas siempre. Nosotros también.',
      duracion: '10 minutos',
      piezas: [
        { nombre: 'Caja organizadora del kit', paraQue: 'Guarda todos los materiales.' },
        LED,
        { nombre: 'Cinta conductora y stickers', paraQue: 'La cinta es un camino para la energía; los stickers decoran.' },
        PILA,
      ],
      pasos: [
        { titulo: 'Abrimos la caja', texto: 'Abran la caja juntos y miren sin sacar nada. ¿Qué ven? ¿Qué colores hay?' },
        { titulo: 'Conocemos cada cosa', texto: 'El adulto saca un material a la vez, dice su nombre y los niños lo repiten. La pila solo la muestra y la guarda.' },
        { titulo: 'Tocamos con cuidado', texto: 'Cada niño toca un LED y un pedacito de cinta. Conversen: ¿es suave?, ¿es duro?, ¿brilla?' },
        { titulo: 'Guardamos', texto: 'Cada cosa vuelve a su lugar. Canten una canción de ordenar mientras guardan.' },
      ],
      pasa: ['Los niños nombran el LED y la pila.', 'Guardan los materiales en la caja.'],
      extra: 'Ordena tus juguetes en casa como ordenamos el kit.',
      preguntas: [
        q('¿Quién toca la pila?', ['El adulto', 'Los niños'], 0, 'La pila es peligrosa: solo la usa el adulto.'),
        q('¿Qué hacemos al terminar?', ['Guardamos todo', 'Lo dejamos en el piso'], 0, 'Guardar cuida los materiales.'),
      ],
    }),

    'LEDs mágicos': guia({
      reto: 'Hoy vamos a hacer magia: ¡encender una luz de verdad con nuestras manos!',
      paraQue: 'Así se enciende la linterna y la luz de un juguete: una pila le da energía a una lucecita.',
      duracion: '15 minutos',
      piezas: [LED, PILA],
      pasos: [
        { titulo: 'Preparamos', texto: 'Sentados en ronda, el adulto muestra un LED y la pila en su porta pila.' },
        { titulo: 'Las patitas abrazan la pila', texto: 'El adulto pone el LED sobre la pila, con una patita a cada lado, como un abrazo. ¡Se enciende!' },
        { titulo: 'Cada uno lo intenta', texto: 'Con la mano del adulto sosteniendo la pila, cada niño aprieta las patitas del LED y lo ve encenderse.' },
        { titulo: 'La luz se esconde', texto: 'Den la vuelta al LED: se apaga. Otra vuelta: se enciende. La luz solo funciona de un lado.' },
      ],
      pasa: ['Cada niño ve encenderse el LED al apretar.', 'Observan que al darle la vuelta se apaga.'],
      falla: [
        { problema: 'El LED no enciende', revisa: 'Dale la vuelta. Si sigue sin encender, prueba con otro LED o revisa la pila.' },
      ],
      extra: 'Cuenta en casa de qué color fue tu luz mágica.',
      preguntas: [
        q('¿Qué le da energía a la luz?', ['La pila', 'El viento'], 0, 'La pila guarda la energía.'),
        q('Si no enciende, ¿qué hacemos?', ['Le damos la vuelta', 'Lo botamos'], 0, 'El LED solo enciende de un lado.'),
      ],
    }),

    'Circuito con stickers': guia({
      reto: 'Hoy vamos a hacer un dibujo con una luz que se enciende, usando cinta brillante y stickers.',
      paraQue: 'La cinta brillante es un caminito por donde la energía viaja de la pila a la luz.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Tarjeta ilustrada del kit', paraQue: 'Tiene dibujado el caminito para la cinta.' },
        { nombre: 'Cinta conductora', paraQue: 'El camino de la energía.', cuidado: 'El adulto la corta y ayuda a pegarla.' },
        LED, PILA,
        { nombre: 'Stickers', paraQue: 'Para decorar el dibujo.' },
      ],
      pasos: [
        { titulo: 'Seguimos el camino con el dedo', texto: 'En la tarjeta, sigan con el dedo la línea dibujada, de la pila a la luz y de vuelta.' },
        { titulo: 'Pegamos el camino', texto: 'El adulto entrega tiras de cinta ya cortadas. Los niños las pegan sobre la línea, presionando con el dedo.' },
        { titulo: 'Ponemos la luz', texto: 'El adulto coloca el LED en su lugar y lo sujeta con cinta adhesiva.' },
        { titulo: 'Encendemos', texto: 'El adulto pone la pila. Los niños presionan donde indica la tarjeta y la luz se enciende.' },
        { titulo: 'Decoramos', texto: 'Con stickers y crayones, cada niño decora su tarjeta.' },
      ],
      pasa: ['La luz se enciende al presionar.', 'Cada niño decora su tarjeta.'],
      falla: [
        { problema: 'La luz no enciende', revisa: 'El adulto da la vuelta al LED y presiona bien toda la cinta: si quedó un espacio, el camino está cortado.' },
      ],
      extra: 'Muestra tu tarjeta en casa y enseña dónde hay que presionar.',
      preguntas: [
        q('¿Por dónde viaja la energía?', ['Por la cinta brillante', 'Por el crayón'], 0, 'La cinta es el camino de la energía.'),
        q('¿Quién pone la pila?', ['El adulto', 'Yo solo'], 0, 'La pila siempre la maneja el adulto.'),
      ],
    }),

    'Mi primer robot de papel': guia({
      reto: 'Hoy vamos a construir nuestro primer robot con cajas y papel. ¡Y tú eliges cómo se ve!',
      paraQue: 'Los inventores primero imaginan y luego construyen. Con materiales que ya no usamos podemos crear algo nuevo.',
      duracion: '25 minutos',
      piezas: [
        { nombre: 'Cajas pequeñas y tubos de cartón', paraQue: 'El cuerpo, la cabeza y los brazos del robot.' },
        { nombre: 'Papel de colores, tapas y botones grandes', paraQue: 'Para los ojos, la boca y los botones del robot.', cuidado: 'Usa piezas grandes que no puedan tragarse.' },
        { nombre: 'Pegamento y cinta adhesiva', paraQue: 'Para unir las partes.' },
      ],
      pasos: [
        { titulo: 'Imaginamos', texto: 'Pregunta: ¿cómo es tu robot? ¿Es alto, es pequeño, tiene antenas?' },
        { titulo: 'Armamos el cuerpo', texto: 'Con ayuda, peguen una caja pequeña (cabeza) sobre una grande (cuerpo). Los tubos son los brazos.' },
        { titulo: 'Le ponemos cara', texto: 'Peguen tapas como ojos y papel como boca. Agreguen botones de colores en el pecho.' },
        { titulo: 'Le damos un nombre', texto: 'Cada niño dice cómo se llama su robot y qué le gusta hacer.' },
      ],
      pasa: ['Cada niño termina un robot con cabeza, cuerpo y cara.', 'Dice el nombre de su robot.'],
      falla: [{ problema: 'Las piezas se despegan', revisa: 'Usa cinta adhesiva ancha además del pegamento y deja secar antes de moverlo.' }],
      extra: 'Presenta tu robot a tu familia y cuéntales en qué te ayuda.',
      preguntas: [
        q('¿Con qué hicimos el robot?', ['Con cajas y papel', 'Con agua'], 0, 'Usamos materiales reciclados.'),
        q('¿Quién inventó tu robot?', ['Yo', 'Nadie'], 0, '¡Tú lo imaginaste y lo construiste!'),
      ],
    }),
  },
}
