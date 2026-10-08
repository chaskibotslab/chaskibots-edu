// Guías por etapas de las lecciones de Inteligencia Artificial de Inicial 2 (4 a 5 años).
// Son actividades sin pantallas: decisiones, patrones y clasificación, las tres
// ideas básicas con las que "piensa" una máquina. Escritas para el docente o adulto que acompaña.
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

module.exports = {
  levelId: 'inicial-2',
  programId: 'ia',
  guias: {
    'Bienvenida Inicial 2': guia({
      reto: 'Empezamos un año nuevo de aventuras. Hoy vamos a descubrir qué significa que una máquina sea "inteligente" y qué cosas aprenderemos juntos.',
      paraQue: 'Hay máquinas que parecen pensar: un celular que reconoce tu voz, un juguete que responde, un carro que frena solo. Este año aprenderemos las ideas sencillas que usan para hacerlo.',
      duracion: '8 minutos',
      piezas: [
        { nombre: 'Un títere o muñeco de robot', paraQue: 'Será el amigo del grupo durante todo el año.' },
        { nombre: 'Imágenes de máquinas inteligentes', paraQue: 'Un asistente de voz, una aspiradora robot, un semáforo.' },
      ],
      pasos: [
        { titulo: 'Nos saludamos', texto: 'Presenta al robot del grupo y deja que los niños le pongan un nombre. Él los acompañará en cada clase.' },
        { titulo: '¿Qué es pensar?', texto: 'Pregunta: ¿cómo sabes que tienes que ponerte una chompa? Porque sientes frío y decides. Sentir y decidir es pensar.' },
        { titulo: 'Máquinas que deciden', texto: 'Muestra las imágenes. Estas máquinas también sienten algo y deciden, pero solo porque una persona les enseñó cómo.' },
        { titulo: 'Lo que vamos a aprender', texto: 'Cuenta las tres aventuras del año: tomar decisiones, encontrar patrones y clasificar cosas.' },
      ],
      pasa: ['Los niños nombran al robot del grupo.', 'Dicen con sus palabras que una máquina inteligente decide porque alguien le enseñó.'],
      extra: 'En casa, busca una máquina que "decida" algo sola y cuéntalo mañana.',
      preguntas: [
        q('¿Quién les enseña a las máquinas a decidir?', ['Las personas', 'Nadie, aprenden solas'], 0, 'Las personas les dan las instrucciones.'),
        q('¿Qué haces cuando sientes frío?', ['Me pongo una chompa', 'Me quito los zapatos'], 0, 'Sientes y decides: eso es pensar.'),
      ],
    }),

    'Si llueve uso paraguas': guia({
      reto: 'Hoy vamos a aprender dos palabras mágicas que usan todas las máquinas inteligentes: "si" y "entonces". Si llueve, entonces uso paraguas.',
      paraQue: 'Así deciden las máquinas: si pasa algo, entonces hacen algo. Si alguien se acerca a la puerta del supermercado, entonces la puerta se abre.',
      duracion: '12 minutos',
      piezas: [
        { nombre: 'Tarjetas de clima', paraQue: 'Sol, lluvia, frío, viento.' },
        { nombre: 'Objetos o tarjetas de ropa', paraQue: 'Paraguas, gorra, chompa, lentes de sol.' },
      ],
      pasos: [
        { titulo: 'Las palabras mágicas', texto: 'Di en voz alta y con gestos: "SI llueve… ENTONCES uso paraguas". Que el grupo lo repita.' },
        { titulo: 'Cambiamos el clima', texto: 'Muestra una tarjeta de clima. Los niños buscan el objeto correcto y dicen la frase completa: "Si hace sol, entonces uso gorra".' },
        { titulo: 'Con el cuerpo', texto: 'Jueguen: "Si aplaudo, entonces saltan". "Si levanto la mano, entonces se sientan". Cambia las reglas varias veces.', consejo: 'Deja que un niño invente una regla nueva para el grupo.' },
        { titulo: 'Las máquinas también', texto: 'Cuenta ejemplos: si aprietas el botón, entonces el timbre suena. Si el semáforo está en rojo, entonces los carros paran.' },
      ],
      pasa: ['Los niños completan frases con "si… entonces…".', 'Siguen correctamente las reglas del juego con el cuerpo.'],
      falla: [{ problema: 'Dicen solo la segunda parte', revisa: 'Usa una mano para el "si" y la otra para el "entonces", y pide las dos manos antes de responder.' }],
      extra: 'Inventa una regla "si… entonces…" para tu casa y enséñasela a tu familia.',
      preguntas: [
        q('Si llueve, entonces…', ['Uso paraguas', 'Uso lentes de sol'], 0, 'La lluvia nos hace decidir usar paraguas.'),
        q('Si el semáforo está en rojo, entonces los carros…', ['Avanzan', 'Paran'], 1, 'Rojo significa parar.'),
      ],
    }),

    'El robot que decide': guia({
      reto: 'Hoy vamos a ayudar a un robot a decidir qué hacer en distintas situaciones, usando tarjetas.',
      paraQue: 'Un robot no sabe qué hacer hasta que alguien le da reglas. Los programadores escriben muchas reglas "si… entonces…" para que el robot actúe bien.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Tarjetas de situaciones', paraQue: 'Dibujos de: hay basura en el piso, alguien tiene sed, está oscuro, hay una pared delante.' },
        { nombre: 'Tarjetas de acciones', paraQue: 'Recoger, traer agua, encender la luz, girar.' },
        { nombre: 'El robot del grupo', paraQue: 'Es quien "recibe" las decisiones.' },
      ],
      pasos: [
        { titulo: 'Miramos las situaciones', texto: 'Muestra cada tarjeta de situación y conversen qué está pasando en el dibujo.' },
        { titulo: 'Buscamos la acción', texto: 'Para cada situación, los niños eligen la tarjeta de acción que el robot debería hacer y la colocan al lado.' },
        { titulo: 'Decimos la regla', texto: 'Entre todos dicen la regla completa: "Si hay basura, entonces el robot la recoge".' },
        { titulo: 'Probamos una regla equivocada', texto: 'Une a propósito dos tarjetas que no combinan ("Si está oscuro, entonces trae agua") y pregunta si el robot haría bien su trabajo.', consejo: 'Reírse de la regla absurda ayuda a entender por qué las reglas deben ser correctas.' },
      ],
      pasa: ['Cada situación queda unida con una acción que tiene sentido.', 'Los niños reconocen cuando una regla está mal.'],
      falla: [{ problema: 'Varios niños eligen acciones distintas', revisa: 'Es una buena oportunidad: conversen cuál ayuda mejor y por qué. A veces hay más de una respuesta válida.' }],
      extra: 'Dibuja una situación nueva y la acción que haría tu robot.',
      preguntas: [
        q('Si hay una pared delante, el robot debe…', ['Seguir de frente', 'Girar'], 1, 'Si sigue de frente, choca.'),
        q('¿El robot sabe solo qué hacer?', ['No, necesita reglas', 'Sí, siempre'], 0, 'Las personas le dan las reglas.'),
      ],
    }),

    'Juego de decisiones': guia({
      reto: 'Hoy tú eres el robot. Vas a moverte por el aula siguiendo reglas, y solo podrás hacer lo que las reglas digan.',
      paraQue: 'Los robots de limpieza y los carros que se manejan solos hacen esto todo el tiempo: miran lo que hay delante y deciden con sus reglas.',
      duracion: '18 minutos',
      piezas: [
        { nombre: 'Tarjetas de colores', paraQue: 'Verde, rojo y amarillo.' },
        { nombre: 'Un camino marcado en el piso', paraQue: 'Con cinta o cuerdas.' },
      ],
      pasos: [
        { titulo: 'Aprendemos las reglas', texto: 'Si ves verde, entonces caminas. Si ves rojo, entonces te detienes. Si ves amarillo, entonces giras. Repítanlas con gestos.' },
        { titulo: 'Un robot a la vez', texto: 'Un niño hace de robot en el camino. El adulto muestra tarjetas y el robot actúa según la regla.' },
        { titulo: 'El grupo vigila', texto: 'Los demás observan y dicen "¡regla cumplida!" o ayudan si el robot se confunde.' },
        { titulo: 'Agregamos una regla', texto: 'Inventen una regla nueva entre todos, por ejemplo: si escuchas una palmada, entonces saltas.', consejo: 'Sube la dificultad mostrando las tarjetas más rápido.' },
      ],
      pasa: ['Los niños responden a cada color con la acción correcta.', 'Recuerdan al menos tres reglas a la vez.'],
      falla: [{ problema: 'Se olvidan de las reglas', revisa: 'Empieza solo con verde y rojo; agrega el amarillo cuando las dos primeras salgan bien.' }],
      extra: 'Juega en casa: tú das las reglas y alguien de tu familia es el robot.',
      preguntas: [
        q('Si ves rojo, entonces…', ['Caminas', 'Te detienes'], 1, 'Rojo es parar.'),
        q('¿El robot puede hacer algo que no esté en sus reglas?', ['No', 'Sí'], 0, 'Un robot solo hace lo que sus reglas indican.'),
      ],
    }),

    'Encontrar patrones': guia({
      reto: 'Hoy vamos a ser buscadores de patrones. Un patrón es algo que se repite siempre igual: rojo, azul, rojo, azul…',
      paraQue: 'Las máquinas inteligentes aprenden buscando patrones. Así reconocen una canción, una cara o una letra. Tú también los usas: sabes que después del día viene la noche.',
      duracion: '10 minutos',
      piezas: [
        { nombre: 'Bloques o fichas de dos colores', paraQue: 'Para armar secuencias.' },
        { nombre: 'Imágenes con patrones', paraQue: 'Una cebra, un piso de baldosas, una camiseta a rayas.' },
      ],
      pasos: [
        { titulo: 'Escuchamos un patrón', texto: 'Haz un ritmo: palmada, golpe en las piernas, palmada, golpe… Los niños lo siguen. ¿Qué viene después?' },
        { titulo: 'Vemos un patrón', texto: 'Arma una fila: rojo, azul, rojo, azul. Señala cada ficha mientras dicen los colores en voz alta.' },
        { titulo: 'Patrones escondidos', texto: 'Muestra las imágenes y busquen qué se repite. Luego busquen patrones en el aula: la ropa, el piso, las ventanas.' },
      ],
      pasa: ['Los niños continúan un ritmo de dos sonidos.', 'Señalan un patrón en una imagen o en el aula.'],
      falla: [{ problema: 'No ven qué se repite', revisa: 'Usa solo dos elementos muy distintos y nómbralos en voz alta como una canción.' }],
      extra: 'Encuentra un patrón en tu ropa o en tu casa y muéstralo.',
      preguntas: [
        q('Rojo, azul, rojo, azul… ¿qué sigue?', ['Rojo', 'Verde'], 0, 'El patrón repite rojo y azul.'),
        q('¿Qué es un patrón?', ['Algo que se repite igual', 'Algo que nunca se repite'], 0, 'Un patrón siempre vuelve a empezar.'),
      ],
    }),

    'Completar secuencias': guia({
      reto: 'Hoy hay patrones a los que les falta una pieza. Tu misión es descubrir cuál falta y ponerla en su lugar.',
      paraQue: 'Cuando tu celular adivina la palabra que vas a escribir, está completando un patrón. Adivinar lo que sigue es una de las cosas más útiles que hace una máquina inteligente.',
      duracion: '25 minutos',
      piezas: [
        { nombre: 'Bloques de colores y formas', paraQue: 'Para armar y completar las filas.' },
        { nombre: 'Tiras de papel con secuencias incompletas', paraQue: 'Cada una con un espacio vacío.' },
      ],
      pasos: [
        { titulo: 'El patrón con hueco', texto: 'Arma una fila: círculo, cuadrado, círculo, (hueco), círculo, cuadrado. Pregunta qué falta.' },
        { titulo: 'Leemos en voz alta', texto: 'Señalen cada pieza y digan su nombre. Al llegar al hueco, hagan una pausa: el oído ayuda a descubrir lo que falta.' },
        { titulo: 'Completamos', texto: 'Cada niño recibe una tira y coloca el bloque que falta. Luego la "lee" completa para comprobar.' },
        { titulo: 'Más difícil', texto: 'Prueba con tres elementos (rojo, azul, verde) o con el hueco al final de la fila.', consejo: 'Los niños que terminan pueden preparar una tira con hueco para un compañero.' },
      ],
      pasa: ['Los niños completan secuencias de dos elementos.', 'Comprueban su respuesta leyendo la fila completa.'],
      falla: [{ problema: 'Ponen cualquier pieza', revisa: 'Vuelve a leer la fila en voz alta con ritmo; pregunta "¿suena igual?" después de colocarla.' }],
      extra: 'Arma un patrón con tus juguetes, esconde uno y pide a alguien que adivine cuál falta.',
      preguntas: [
        q('Círculo, cuadrado, círculo, ___ . ¿Qué falta?', ['Cuadrado', 'Círculo'], 0, 'Después del círculo siempre viene el cuadrado.'),
        q('¿Cómo compruebas que está bien?', ['Leyendo toda la fila', 'Cerrando los ojos'], 0, 'Si suena igual de principio a fin, el patrón está completo.'),
      ],
    }),

    'Crear mis patrones': guia({
      reto: 'Hoy tú eres el inventor. Vas a crear tu propio patrón y un compañero tendrá que descubrir cómo sigue.',
      paraQue: 'Inventar reglas es lo que hacen los programadores. Si tu patrón tiene una regla clara, cualquier persona, o cualquier máquina, podrá continuarlo.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Bloques, fichas, crayones o adhesivos', paraQue: 'Lo que cada niño elija para su patrón.' },
        { nombre: 'Tiras de cartulina', paraQue: 'Para pegar o dibujar el patrón.' },
      ],
      pasos: [
        { titulo: 'Elegimos dos o tres cosas', texto: 'Cada niño escoge los elementos de su patrón: dos colores, dos formas o dos adhesivos.' },
        { titulo: 'Inventamos la regla', texto: 'Decide el orden y repítelo al menos tres veces en la tira.' },
        { titulo: 'Intercambiamos', texto: 'Cambia tu tira con un compañero. Cada uno continúa el patrón del otro.' },
        { titulo: 'Contamos la regla', texto: 'Cada inventor dice su regla en voz alta: "Mi patrón es estrella, corazón, estrella, corazón".' },
      ],
      pasa: ['Cada niño crea un patrón que se repite al menos tres veces.', 'Un compañero logra continuarlo.'],
      falla: [{ problema: 'El patrón no se repite', revisa: 'Pide que lo "cante" en voz alta. Si no puede cantarlo igual dos veces, todavía no es un patrón.' }],
      extra: 'Crea un patrón con sonidos o movimientos y enséñaselo a tu familia.',
      preguntas: [
        q('Para que sea un patrón, la regla debe…', ['Repetirse', 'Cambiar cada vez'], 0, 'Si no se repite, nadie puede saber qué sigue.'),
        q('¿Tu compañero pudo continuar tu patrón?', ['Sí, porque la regla era clara', 'No importa'], 0, 'Una regla clara la puede seguir cualquiera.'),
      ],
    }),

    'Agrupar objetos': guia({
      reto: 'Hoy vamos a aprender a clasificar: poner juntas las cosas que se parecen. ¡Hay robots que hacen esto todo el día!',
      paraQue: 'En las fábricas, los robots separan frutas buenas de malas y cartas por ciudad. En casa, tú clasificas cuando guardas los juguetes en su caja y la ropa en su cajón.',
      duracion: '12 minutos',
      piezas: [
        { nombre: 'Objetos variados', paraQue: 'Bloques, tapas, crayones y botones de distintos colores y tamaños.' },
        { nombre: 'Aros o bandejas', paraQue: 'Para formar los grupos.' },
      ],
      pasos: [
        { titulo: 'Mezclamos todo', texto: 'Coloca todos los objetos en el centro. Pregunta: ¿cómo podríamos ordenarlos?' },
        { titulo: 'Por color', texto: 'Entre todos, pongan en cada aro los objetos del mismo color.' },
        { titulo: 'Cambiamos la regla', texto: 'Mezclen otra vez y ahora agrupen por tamaño: grandes y pequeños. Los mismos objetos quedan en grupos distintos.', consejo: 'Este es el momento clave: la forma de agrupar depende de la regla que elegimos.' },
        { titulo: 'Los robots clasifican', texto: 'Cuenta cómo un robot de fábrica mira cada fruta y decide a qué caja va, siguiendo una regla igual que ellos.' },
      ],
      pasa: ['Los niños agrupan por color.', 'Vuelven a agrupar los mismos objetos por tamaño.'],
      falla: [{ problema: 'Mezclan dos reglas a la vez', revisa: 'Antes de empezar, digan la regla en voz alta: "ahora solo miramos el color".' }],
      extra: 'Ordena tus juguetes en casa usando una regla y cuenta cuál elegiste.',
      preguntas: [
        q('¿Qué es clasificar?', ['Juntar las cosas que se parecen', 'Tirar las cosas'], 0, 'Clasificar es agrupar según una regla.'),
        q('¿Podemos agrupar los mismos objetos de otra forma?', ['Sí, cambiando la regla', 'No'], 0, 'Por color, por tamaño o por forma: depende de la regla.'),
      ],
    }),

    'Juego de clasificación': guia({
      reto: 'Hoy vamos a clasificar las cosas de nuestra aula y a descubrir a qué grupo pertenece cada una.',
      paraQue: 'Clasificar bien ayuda a encontrar las cosas rápido. Las bibliotecas, los supermercados y hasta tu celular con las fotos funcionan gracias a que alguien, o algo, clasificó primero.',
      duracion: '25 minutos',
      piezas: [
        { nombre: 'Objetos del aula', paraQue: 'Lápices, libros, juguetes, loncheras.' },
        { nombre: 'Cajas con un dibujo', paraQue: 'Cada caja muestra qué va dentro: para escribir, para leer, para jugar.' },
      ],
      pasos: [
        { titulo: 'Conocemos las cajas', texto: 'Muestra cada caja y su dibujo. Conversen qué tipo de cosas irían en cada una.' },
        { titulo: 'Clasificamos por turnos', texto: 'Cada niño toma un objeto, dice su nombre y lo lleva a la caja que corresponde, explicando por qué.' },
        { titulo: 'El objeto difícil', texto: 'Presenta algo que podría ir en dos cajas, como un libro para colorear. Conversen y decidan juntos.', consejo: 'No hay una única respuesta: lo importante es dar una razón.' },
        { titulo: 'Revisamos', texto: 'Abran cada caja y comprueben si todo lo que hay dentro cumple la regla.' },
      ],
      pasa: ['Cada objeto termina en una caja con una razón.', 'El grupo detecta y corrige un objeto mal ubicado.'],
      falla: [{ problema: 'Clasifican por gusto y no por la regla', revisa: 'Pregunta "¿para qué sirve?" antes de que lo lleven a una caja.' }],
      extra: 'Ayuda en casa a guardar las compras: ¿qué va en la refrigeradora y qué en la alacena?',
      preguntas: [
        q('Un crayón va en la caja de cosas para…', ['Escribir y pintar', 'Comer'], 0, 'El crayón sirve para pintar.'),
        q('Si un objeto puede ir en dos cajas, ¿qué hacemos?', ['Lo pensamos y damos una razón', 'Lo escondemos'], 0, 'Elegir con una razón también es clasificar.'),
      ],
    }),

    'Robot clasificador': guia({
      reto: 'Hoy un niño será el robot clasificador. Recibirá objetos uno por uno y deberá decidir a qué caja van, sin hablar, solo siguiendo su regla.',
      paraQue: 'Así trabaja un robot en una fábrica de reciclaje: ve un objeto, aplica su regla y lo manda al lugar correcto, miles de veces al día.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Dos cajas', paraQue: 'Una para cada grupo, por ejemplo "rojo" y "no rojo".' },
        { nombre: 'Objetos variados', paraQue: 'Para pasarle al robot.' },
        { nombre: 'Una vincha o cartel de robot', paraQue: 'Para quien hace de robot.' },
      ],
      pasos: [
        { titulo: 'Le damos la regla al robot', texto: 'En secreto, el adulto le dice al niño robot su regla: "Si es rojo, entonces va a esta caja. Si no, a la otra".' },
        { titulo: 'El robot trabaja', texto: 'Los compañeros le pasan objetos uno por uno y el robot los clasifica en silencio.' },
        { titulo: 'Adivinamos la regla', texto: 'El grupo observa las dos cajas y trata de descubrir qué regla estaba siguiendo el robot.' },
        { titulo: 'Cambiamos de robot y de regla', texto: 'Otro niño hace de robot con una regla nueva: por tamaño, por forma o por uso.', consejo: 'Adivinar la regla mirando los resultados es exactamente lo que hace una máquina cuando aprende.' },
      ],
      pasa: ['El robot clasifica sin equivocarse siguiendo su regla.', 'El grupo descubre la regla observando las cajas.'],
      falla: [{ problema: 'El grupo no adivina la regla', revisa: 'Usa una regla muy visible, como el color, y pocos objetos.' }],
      extra: 'En casa, clasifica algo con una regla secreta y pide a tu familia que la adivine.',
      preguntas: [
        q('¿Qué necesita el robot para clasificar?', ['Una regla', 'Suerte'], 0, 'Sin regla, no sabe dónde poner cada cosa.'),
        q('¿Cómo descubrimos la regla del robot?', ['Mirando qué puso en cada caja', 'Preguntándole su nombre'], 0, 'Los resultados nos muestran la regla.'),
      ],
    }),

    'Diseñar clasificador': guia({
      reto: 'Hoy vamos a ser diseñadores. Antes de construir nuestro robot clasificador, vamos a dibujarlo y a decidir qué va a clasificar.',
      paraQue: 'Los ingenieros nunca empiezan construyendo: primero piensan y dibujan. Un buen plan ahorra errores y materiales.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Hojas y crayones', paraQue: 'Para dibujar el diseño.' },
        { nombre: 'Ejemplos de materiales', paraQue: 'Cajas de cartón, tubos y tapas, para imaginar con qué se construirá.' },
      ],
      pasos: [
        { titulo: 'Decidimos qué clasifica', texto: 'Cada niño o grupo elige: ¿su robot separará por color, por tamaño o por tipo de objeto?' },
        { titulo: 'Decimos la regla', texto: 'Completen la frase: "Si es ___, entonces va a ___".' },
        { titulo: 'Dibujamos el robot', texto: 'Dibuja el robot con su entrada (por donde entran los objetos) y sus dos salidas o cajas.' },
        { titulo: 'Elegimos materiales', texto: 'Miren los materiales disponibles y marquen en el dibujo cuál usarán para cada parte.', consejo: 'Guarda los dibujos: se usarán como plano en la próxima clase.' },
      ],
      pasa: ['Cada diseño muestra una entrada y al menos dos salidas.', 'Cada niño puede decir la regla de su robot.'],
      falla: [{ problema: 'Dibujan un robot sin cajas', revisa: 'Pregunta: "¿y a dónde van las cosas después?" para que agreguen las salidas.' }],
      extra: 'Cuenta en casa qué va a clasificar tu robot y con qué lo vas a construir.',
      preguntas: [
        q('¿Qué hacemos antes de construir?', ['Pensar y dibujar el plan', 'Pegar todo rápido'], 0, 'El diseño nos guía y evita errores.'),
        q('¿Cuántas salidas necesita un clasificador?', ['Al menos dos', 'Ninguna'], 0, 'Necesita un lugar distinto para cada grupo.'),
      ],
    }),

    'Construir clasificador': guia({
      reto: 'Llegó el día de construir. Con cartón y tu diseño, vas a armar tu propio robot clasificador y a ponerlo a prueba.',
      paraQue: 'Construir algo que funciona es lo más emocionante de ser ingeniero. Tu robot de cartón sigue la misma idea que los robots de verdad: una regla y un lugar para cada cosa.',
      duracion: '30 minutos',
      piezas: [
        { nombre: 'Caja de cartón grande', paraQue: 'El cuerpo del robot.', cuidado: 'Los cortes los hace el adulto con tijera o cúter.' },
        { nombre: 'Dos cajas pequeñas o vasos', paraQue: 'Las salidas donde caen los objetos.' },
        { nombre: 'Pegamento, cinta, crayones y adhesivos', paraQue: 'Para unir y decorar.' },
        { nombre: 'Objetos para clasificar', paraQue: 'Los que eligieron en el diseño.' },
      ],
      pasos: [
        { titulo: 'Miramos el plano', texto: 'Cada niño revisa su dibujo de la clase anterior y recuerda su regla.' },
        { titulo: 'Armamos el cuerpo', texto: 'El adulto hace los cortes. Los niños pegan las dos cajas de salida y marcan cada una con un dibujo o color.' },
        { titulo: 'Le damos vida', texto: 'Decoren el robot: ojos, boca, antenas y un cartel con su nombre.' },
        { titulo: 'Lo ponemos a prueba', texto: 'Pasa objetos uno por uno. El niño, como "cerebro" del robot, aplica la regla y los deja caer en la salida correcta.' },
        { titulo: 'Mejoramos', texto: 'Si algo no funciona (se cae, no entra, se confunde), piensen juntos cómo arreglarlo.', consejo: 'Corregir después de probar es parte normal del trabajo de un ingeniero.' },
      ],
      pasa: ['El robot tiene dos salidas marcadas y se mantiene en pie.', 'Los objetos terminan en la salida correcta según la regla.'],
      falla: [
        { problema: 'Las cajas se despegan', revisa: 'Usa cinta ancha además del pegamento y deja secar antes de probar.' },
        { problema: 'Los objetos no caben', revisa: 'Agranda la abertura o elige objetos más pequeños.' },
      ],
      extra: 'Prueba tu robot con objetos nuevos que no usaste en clase. ¿Tu regla sigue funcionando?',
      preguntas: [
        q('¿Quién hace los cortes del cartón?', ['El adulto', 'Los niños'], 0, 'Las herramientas de corte las usa solo el adulto.'),
        q('Si algo no funciona, ¿qué hacemos?', ['Pensamos cómo arreglarlo', 'Lo botamos'], 0, 'Probar y mejorar es parte de construir.'),
      ],
    }),

    'Feria de robots': guia({
      reto: 'Hoy mostramos nuestros robots clasificadores a las familias. Tú explicas qué clasifica tu robot y cómo decide.',
      paraQue: 'Explicar tu invento a otros te ayuda a entenderlo mejor y a sentirte orgulloso de lo que aprendiste este año.',
      duracion: '25 minutos',
      piezas: [
        { nombre: 'Tu robot clasificador', paraQue: 'El protagonista de tu mesa.' },
        { nombre: 'Objetos para la demostración', paraQue: 'Para que los visitantes vean al robot en acción.' },
        { nombre: 'Cartel con el nombre del robot y su regla', paraQue: 'Para que todos sepan qué hace.' },
      ],
      pasos: [
        { titulo: 'Preparamos la mesa', texto: 'Cada niño coloca su robot, su cartel y sus objetos.' },
        { titulo: 'Ensayamos', texto: 'Practiquen tres frases: "Se llama ___. Clasifica ___. Su regla es: si ___, entonces ___".' },
        { titulo: 'Demostramos', texto: 'Cuando llega un visitante, el niño le pide que le pase un objeto y muestra a qué salida va.' },
        { titulo: 'Celebramos', texto: 'Al final, un aplauso para todos los inventores y una foto del grupo con sus robots.' },
      ],
      pasa: ['Cada niño dice el nombre y la regla de su robot.', 'Hace al menos una demostración frente a un visitante.'],
      falla: [{ problema: 'Un niño no quiere hablar', revisa: 'Puede hacer solo la demostración mientras el adulto dice la regla con él.' }],
      extra: 'Cuéntale a tu familia qué te gustaría que hiciera tu próximo robot.',
      preguntas: [
        q('¿Qué tres ideas aprendimos este año?', ['Decidir, encontrar patrones y clasificar', 'Correr, saltar y dormir'], 0, 'Son las tres ideas con las que "piensa" una máquina.'),
        q('¿Quién inventó tu robot?', ['Yo', 'Nadie'], 0, 'Tú lo diseñaste, lo construiste y le diste su regla.'),
      ],
    }),
  },
}
