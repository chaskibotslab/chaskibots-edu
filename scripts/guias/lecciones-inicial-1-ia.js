// Guías por etapas de las lecciones de Inteligencia Artificial de Inicial 1 (3 a 4 años).
// Actividades sin pantallas: qué hace "inteligente" a un robot (reconocer, escuchar, ver).
// Escritas para el docente o el adulto que acompaña.
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

const TITERE = { nombre: 'Títere o muñeco de robot', paraQue: 'El robot amigo del grupo.' }

module.exports = {
  levelId: 'inicial-1',
  programId: 'ia',
  guias: {
    'Bienvenida al mundo de la IA': guia({
      reto: 'Hoy conocemos a un robot muy especial: un robot que puede aprender cosas nuevas, igual que tú.',
      paraQue: 'Algunas máquinas aprenden: un teléfono que reconoce tu cara, un juguete que responde cuando le hablas.',
      duracion: '8 minutos',
      piezas: [TITERE],
      pasos: [
        { titulo: 'Llega el robot', texto: 'Presenta al robot amigo. Dile al grupo que este robot todavía no sabe muchas cosas y que ellos le van a enseñar.' },
        { titulo: 'Le enseñamos algo', texto: 'Enséñenle al robot a saludar: todos mueven la mano y el robot los imita.' },
        { titulo: '¡Aprendió!', texto: 'Celebren: el robot aprendió porque ustedes le enseñaron. Así aprenden también algunas máquinas.' },
      ],
      pasa: ['Los niños le enseñan un saludo al robot.', 'Dicen que el robot aprendió.'],
      extra: 'Enséñale algo nuevo a alguien de tu familia, como hiciste con el robot.',
      preguntas: [
        q('¿El robot aprendió a saludar?', ['Sí, porque le enseñamos', 'No'], 0, 'Aprendió porque se lo enseñamos.'),
        q('¿Tú también aprendes cosas nuevas?', ['Sí', 'No'], 0, 'Todos los días aprendemos algo.'),
      ],
    }),

    '¿Qué es un robot inteligente?': guia({
      reto: 'Hoy vamos a descubrir la diferencia entre un robot que siempre hace lo mismo y un robot que piensa antes de actuar.',
      paraQue: 'Un carrito de cuerda siempre va recto. Una aspiradora robot, en cambio, se da cuenta de que hay una pared y gira.',
      duracion: '10 minutos',
      piezas: [
        { nombre: 'Un juguete de cuerda o a pilas', paraQue: 'Siempre hace lo mismo.' },
        TITERE,
        { nombre: 'Un obstáculo', paraQue: 'Una caja o una almohada.' },
      ],
      pasos: [
        { titulo: 'El robot que no piensa', texto: 'Suelta el juguete hacia la caja: choca y sigue empujando. No se da cuenta.' },
        { titulo: 'El robot que piensa', texto: 'Ahora mueve al robot amigo hacia la caja. Se detiene, "mira" la caja y gira para rodearla.' },
        { titulo: 'Jugamos', texto: 'Los niños caminan como robots. Al encontrar un obstáculo se detienen, lo miran y giran.' },
      ],
      pasa: ['Los niños se detienen y giran al encontrar un obstáculo.', 'Dicen cuál robot "pensó".'],
      extra: 'Camina como un robot inteligente por tu casa sin chocar con nada.',
      preguntas: [
        q('¿Qué hizo el robot inteligente con la caja?', ['Giró', 'Chocó y siguió'], 0, 'Se dio cuenta y cambió de camino.'),
        q('¿Un robot inteligente mira antes de avanzar?', ['Sí', 'No'], 0, 'Primero mira y después decide.'),
      ],
    }),

    'Robots que reconocen caras': guia({
      reto: 'Hoy el robot amigo va a aprender a reconocer a las personas mirando sus caras.',
      paraQue: 'Hay teléfonos que se abren al ver la cara de su dueño. Primero alguien les enseñó cómo es esa cara.',
      duracion: '15 minutos',
      piezas: [
        TITERE,
        { nombre: 'Fotos de los niños o de sus familias', paraQue: 'Para que el robot aprenda a reconocerlas.', cuidado: 'Usa solo fotos que las familias hayan autorizado.' },
      ],
      pasos: [
        { titulo: 'Le enseñamos al robot', texto: 'Muestra una foto al robot y di: "Robot, ella es Ana". Repitan con tres o cuatro fotos.' },
        { titulo: 'El robot adivina', texto: 'Muestra una foto sin decir el nombre. El robot "piensa" y dice quién es. Los niños confirman.' },
        { titulo: 'El robot se equivoca', texto: 'Haz que el robot diga un nombre equivocado. Los niños lo corrigen y le enseñan otra vez.', consejo: 'Equivocarse y corregir es parte de aprender, también para las máquinas.' },
      ],
      pasa: ['Los niños corrigen al robot cuando se equivoca.', 'Reconocen las fotos de sus compañeros.'],
      extra: 'Mira una foto de tu familia y di el nombre de cada persona.',
      preguntas: [
        q('¿Cómo aprendió el robot las caras?', ['Le mostramos fotos', 'Durmiendo'], 0, 'Aprendió mirando muchas fotos.'),
        q('Si el robot se equivoca, ¿qué hacemos?', ['Le enseñamos otra vez', 'Lo guardamos'], 0, 'Se aprende practicando.'),
      ],
    }),

    'Mi robot favorito': guia({
      reto: 'Hoy vas a dibujar a tu robot inteligente favorito y a contar qué sabe hacer.',
      paraQue: 'Todos los inventos empezaron como una idea que alguien dibujó.',
      duracion: '12 minutos',
      piezas: [
        { nombre: 'Hojas y crayones gruesos', paraQue: 'Para dibujar.' },
        { nombre: 'Figuras de papel recortadas', paraQue: 'Círculos y cuadrados para armar el robot pegando.' },
      ],
      pasos: [
        { titulo: 'Pensamos', texto: 'Pregunta: ¿qué te gustaría que hiciera tu robot? ¿Cantar, jugar, ayudar a guardar?' },
        { titulo: 'Dibujamos o pegamos', texto: 'Cada niño dibuja su robot o lo arma pegando un cuadrado para el cuerpo y un círculo para la cabeza.' },
        { titulo: 'Lo contamos', texto: 'Cada niño muestra su robot y dice una cosa que sabe hacer.' },
      ],
      pasa: ['Cada niño hace su robot.', 'Dice una cosa que su robot sabe hacer.'],
      extra: 'Pega tu dibujo en casa donde todos lo vean.',
      preguntas: [
        q('¿Tu robot sabe hacer algo?', ['Sí, yo lo inventé', 'No'], 0, 'Tú decidiste qué sabe hacer.'),
        q('¿Primero pensamos y después dibujamos?', ['Sí', 'No'], 0, 'Las buenas ideas empiezan pensando.'),
      ],
    }),

    'Robots que entienden palabras': guia({
      reto: 'Hoy vamos a conocer robots que escuchan y entienden lo que les decimos.',
      paraQue: 'Hay parlantes y teléfonos a los que puedes pedirles una canción con tu voz, y la ponen.',
      duracion: '10 minutos',
      piezas: [
        TITERE,
        { nombre: 'Un parlante o teléfono con asistente de voz (opcional)', paraQue: 'Para una demostración corta hecha por el adulto.' },
      ],
      pasos: [
        { titulo: 'El robot escucha', texto: 'Acerca la "oreja" del robot a un niño. El niño le dice una palabra y el robot la repite.' },
        { titulo: 'Hablamos claro', texto: 'Susurra muy bajito al robot: no entiende. Luego habla claro y fuerte: ¡ahora sí! Practiquen todos.' },
        { titulo: 'Demostración', texto: 'Si hay un asistente de voz, el adulto le pide una canción infantil y todos escuchan cómo responde.' },
      ],
      pasa: ['Los niños dicen una palabra clara al robot.', 'Notan que hablando bajito el robot no entiende.'],
      extra: 'Di tu nombre fuerte y claro, como si se lo dijeras al robot.',
      preguntas: [
        q('¿Cómo le hablamos al robot?', ['Claro y fuerte', 'Muy bajito'], 0, 'Así puede entendernos.'),
        q('¿Con qué escucha el robot?', ['Con sus oídos de robot', 'Con los pies'], 0, 'Tiene un micrófono, que es como su oído.'),
      ],
    }),

    'Dar órdenes al robot': guia({
      reto: 'Hoy tú eres el robot. Solo te mueves cuando alguien te da una orden.',
      paraQue: 'Los robots no hacen nada por su cuenta: siguen las órdenes que alguien les da, una por una.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Espacio libre para moverse', paraQue: 'Para caminar sin chocar.' },
        { nombre: 'Tarjetas con flechas y dibujos', paraQue: 'Adelante, girar, saltar, alto.' },
      ],
      pasos: [
        { titulo: 'Aprendemos las órdenes', texto: 'Muestra cada tarjeta y practiquen juntos: adelante (un paso), girar, saltar y alto.' },
        { titulo: 'El adulto manda', texto: 'El adulto muestra tarjetas y todos los "robots" obedecen.' },
        { titulo: 'Un niño manda', texto: 'Un niño elige las tarjetas y los demás son los robots. Cambien de turno.' },
        { titulo: 'Sin orden, no me muevo', texto: 'Quédate en silencio unos segundos: los robots esperan quietos hasta la siguiente orden.' },
      ],
      pasa: ['Los niños siguen cuatro órdenes distintas.', 'Esperan quietos cuando no hay orden.'],
      falla: [{ problema: 'Se mueven antes de la orden', revisa: 'Jueguen primero solo con "adelante" y "alto".' }],
      extra: 'En casa, pide a alguien que sea el robot y dale tres órdenes.',
      preguntas: [
        q('¿El robot se mueve sin una orden?', ['No', 'Sí'], 0, 'El robot espera sus órdenes.'),
        q('¿Qué hacemos con la orden "alto"?', ['Nos detenemos', 'Saltamos'], 0, 'Alto es parar.'),
      ],
    }),

    'Simón dice robot': guia({
      reto: 'Hoy jugamos a "Simón dice", pero con un secreto: el robot solo obedece si escucha las palabras mágicas.',
      paraQue: 'Los asistentes de voz solo responden cuando escuchan su nombre. Así saben que les hablan a ellos.',
      duracion: '15 minutos',
      piezas: [TITERE],
      pasos: [
        { titulo: 'Las palabras mágicas', texto: 'Explica: solo obedecemos si la orden empieza con "Robot dice".' },
        { titulo: 'Jugamos fácil', texto: '"Robot dice: tócate la nariz". "Robot dice: salta". Todos obedecen.' },
        { titulo: 'La trampa', texto: 'Da una orden sin las palabras mágicas: "Aplaude". Quien se mueva, se ríe y sigue jugando.' },
      ],
      pasa: ['Los niños obedecen cuando escuchan "Robot dice".', 'Se quedan quietos cuando faltan las palabras mágicas.'],
      falla: [{ problema: 'Todos caen en la trampa', revisa: 'Haz una pausa y un gesto antes de las órdenes con truco para que presten atención.' }],
      extra: 'Juega "Robot dice" en casa y tú das las órdenes.',
      preguntas: [
        q('¿Cuándo obedece el robot?', ['Cuando escucha "Robot dice"', 'Siempre'], 0, 'Necesita las palabras mágicas.'),
        q('Si no dicen "Robot dice", ¿me muevo?', ['No', 'Sí'], 0, 'Sin las palabras mágicas, me quedo quieto.'),
      ],
    }),

    'Robots con ojos': guia({
      reto: 'Hoy descubrimos cómo ven los robots: tienen una cámara, que es como su ojo.',
      paraQue: 'Los carros modernos tienen cámaras para ver lo que hay atrás, y hay robots que usan cámaras para no chocar.',
      duracion: '10 minutos',
      piezas: [
        { nombre: 'Tubos de cartón', paraQue: 'Serán nuestros "ojos de robot".' },
        { nombre: 'Objetos del aula', paraQue: 'Para buscarlos mirando por el tubo.' },
      ],
      pasos: [
        { titulo: 'Nuestros ojos', texto: 'Cierren los ojos: no vemos nada. Ábranlos: vemos todo. Los ojos nos ayudan a saber qué hay alrededor.' },
        { titulo: 'El ojo del robot', texto: 'Cada niño mira por un tubo de cartón. Así ve un robot: solo lo que está frente a su cámara.' },
        { titulo: 'Buscamos con el ojo de robot', texto: 'Pide: "encuentren algo rojo". Los niños lo buscan mirando por el tubo.' },
      ],
      pasa: ['Los niños encuentran un objeto mirando por el tubo.', 'Dicen que el robot ve con una cámara.'],
      extra: 'Haz un ojo de robot con un tubo en casa y busca algo azul.',
      preguntas: [
        q('¿Con qué ve un robot?', ['Con una cámara', 'Con la nariz'], 0, 'La cámara es el ojo del robot.'),
        q('¿El robot ve lo que está detrás de él?', ['No, solo lo que está al frente', 'Sí, todo'], 0, 'Ve lo que su cámara apunta.'),
      ],
    }),

    'Clasificar colores': guia({
      reto: 'Hoy vamos a trabajar como robots ordenadores: cada cosa con las de su mismo color.',
      paraQue: 'Hay robots que separan frutas por color: las verdes a un lado y las maduras al otro.',
      duracion: '15 minutos',
      piezas: [
        { nombre: 'Objetos grandes de colores', paraQue: 'Bloques, pelotas y tapas grandes.', cuidado: 'Usa piezas grandes que no puedan tragarse.' },
        { nombre: 'Cajas o aros de colores', paraQue: 'Una para cada color.' },
      ],
      pasos: [
        { titulo: 'Miramos los colores', texto: 'Muestra cada caja y digan su color juntos.' },
        { titulo: 'Cada cosa a su caja', texto: 'Cada niño toma un objeto, dice su color y lo pone en la caja del mismo color.' },
        { titulo: 'Revisamos', texto: 'Miren dentro de cada caja: ¿todo es del mismo color? Si algo no corresponde, lo cambian de lugar.' },
      ],
      pasa: ['Los objetos quedan agrupados por color.', 'Los niños encuentran y corrigen un objeto mal ubicado.'],
      falla: [{ problema: 'Mezclan los colores', revisa: 'Empieza solo con dos colores muy distintos, como rojo y azul.' }],
      extra: 'Ordena por color tus crayones o tus medias en casa.',
      preguntas: [
        q('¿Dónde va el bloque rojo?', ['En la caja roja', 'En la caja azul'], 0, 'Cada cosa va con su color.'),
        q('¿Clasificar es poner juntas las cosas que se parecen?', ['Sí', 'No'], 0, 'Eso es clasificar.'),
      ],
    }),

    'Buscar y encontrar': guia({
      reto: 'Hoy somos robots buscadores: nos piden una cosa y tenemos que encontrarla.',
      paraQue: 'Hay robots en las bodegas que buscan un paquete entre miles y lo llevan a quien lo pidió.',
      duracion: '15 minutos',
      piezas: [
        { nombre: 'Objetos conocidos repartidos por el aula', paraQue: 'Una pelota, un libro, un vaso, un peluche.' },
        { nombre: 'Tarjetas con el dibujo de cada objeto', paraQue: 'La "orden" que recibe el robot buscador.' },
      ],
      pasos: [
        { titulo: 'Recibimos la orden', texto: 'Muestra una tarjeta: "Robot, busca la pelota".' },
        { titulo: 'Buscamos', texto: 'El niño robot recorre el aula mirando con atención hasta encontrar el objeto y lo trae.' },
        { titulo: 'Más difícil', texto: 'Pide dos características: "busca algo rojo y redondo".', consejo: 'Dar dos pistas a la vez es el primer paso para reconocer objetos.' },
      ],
      pasa: ['Los niños encuentran el objeto de la tarjeta.', 'Algunos encuentran un objeto con dos pistas.'],
      extra: 'Juega en casa: que alguien te pida un objeto y tú lo buscas como robot.',
      preguntas: [
        q('¿Qué necesita el robot para buscar?', ['Saber qué buscar', 'Nada'], 0, 'Primero necesita la orden.'),
        q('¿Usamos los ojos para buscar?', ['Sí', 'No'], 0, 'Mirar con atención ayuda a encontrar.'),
      ],
    }),

    'Diseñar mi robot': guia({
      reto: 'Hoy vamos a pensar cómo será nuestro robot amigo: qué sabe hacer y cómo nos ayuda.',
      paraQue: 'Antes de construir algo, los inventores piensan qué quieren que haga.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Tarjetas de habilidades', paraQue: 'Dibujos de un robot que escucha, uno que ve, uno que ordena y uno que canta.' },
        { nombre: 'Hoja con la silueta de un robot', paraQue: 'Para pegar las habilidades elegidas.' },
      ],
      pasos: [
        { titulo: 'Recordamos', texto: 'Repasen con gestos lo que aprendieron: los robots escuchan, ven y ordenan.' },
        { titulo: 'Elegimos', texto: 'Cada niño elige una o dos tarjetas de habilidades para su robot.' },
        { titulo: 'Las pegamos', texto: 'Peguen las tarjetas elegidas en la silueta del robot.' },
        { titulo: 'Contamos', texto: 'Cada niño dice: "Mi robot sabe…".' },
      ],
      pasa: ['Cada niño elige al menos una habilidad.', 'La dice en voz alta.'],
      extra: 'Cuenta en casa qué sabrá hacer tu robot.',
      preguntas: [
        q('¿Qué hacemos antes de construir?', ['Pensar', 'Correr'], 0, 'Primero pensamos qué queremos.'),
        q('¿Tu robot tiene una habilidad?', ['Sí, yo la elegí', 'No'], 0, 'Tú decidiste qué sabe hacer.'),
      ],
    }),

    'Dibujar mi robot': guia({
      reto: 'Hoy vamos a dibujar y decorar a nuestro robot amigo, mostrando su habilidad especial.',
      paraQue: 'Un dibujo ayuda a que los demás entiendan nuestra idea.',
      duracion: '25 minutos',
      piezas: [
        { nombre: 'Cartulina, crayones gruesos y témperas', paraQue: 'Para dibujar y pintar.' },
        { nombre: 'Stickers y papel brillante', paraQue: 'Para decorar.' },
        { nombre: 'La hoja de habilidades de la clase anterior', paraQue: 'Para recordar qué sabe hacer el robot.' },
      ],
      pasos: [
        { titulo: 'Recordamos la habilidad', texto: 'Cada niño mira su hoja de la clase anterior y recuerda qué sabe hacer su robot.' },
        { titulo: 'Dibujamos', texto: 'Dibujen el robot en la cartulina. Si escucha, orejas grandes; si ve, ojos grandes.' },
        { titulo: 'Decoramos', texto: 'Pinten y peguen stickers y papel brillante.' },
        { titulo: 'Le ponemos nombre', texto: 'El adulto escribe el nombre que cada niño elige para su robot.' },
      ],
      pasa: ['Cada dibujo muestra la habilidad del robot.', 'Cada robot tiene nombre.'],
      extra: 'Explica a tu familia por qué tu robot tiene orejas u ojos tan grandes.',
      preguntas: [
        q('Si tu robot escucha muy bien, le dibujamos…', ['Orejas grandes', 'Pies grandes'], 0, 'Las orejas muestran que escucha.'),
        q('¿Tu robot tiene nombre?', ['Sí', 'No'], 0, 'Tú lo elegiste.'),
      ],
    }),

    'Presentación': guia({
      reto: 'Hoy cada uno presenta a su robot amigo frente a todos. ¡Es el día de los inventores!',
      paraQue: 'Contar nuestras ideas nos hace sentir orgullosos y nos ayuda a aprender a hablar frente a otros.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Los dibujos de los robots', paraQue: 'Lo que cada niño va a mostrar.' },
        { nombre: 'Un lugar especial para presentar', paraQue: 'Una alfombra o una silla de inventor.' },
      ],
      pasos: [
        { titulo: 'Nos preparamos', texto: 'Practiquen dos frases: "Se llama ___" y "Sabe ___".' },
        { titulo: 'Presentamos', texto: 'Cada niño pasa al lugar especial, muestra su dibujo y dice sus dos frases.' },
        { titulo: 'Aplaudimos', texto: 'Después de cada presentación, un aplauso para el inventor.' },
        { titulo: 'Exposición', texto: 'Peguen todos los dibujos en la pared para que las familias los vean.' },
      ],
      pasa: ['Cada niño muestra su dibujo.', 'Dice el nombre de su robot o qué sabe hacer.'],
      falla: [{ problema: 'Un niño no quiere hablar', revisa: 'Puede solo mostrar su dibujo mientras el adulto dice las frases con él.' }],
      extra: 'Muéstrale tu robot a tu familia y cuenta lo que dijiste en clase.',
      preguntas: [
        q('¿Qué aprendimos que hacen los robots inteligentes?', ['Escuchan, ven y ordenan', 'Duermen'], 0, 'Esas son sus habilidades.'),
        q('¿Estás orgulloso de tu robot?', ['Sí', 'No'], 0, '¡Hiciste un gran trabajo!'),
      ],
    }),
  },
}
