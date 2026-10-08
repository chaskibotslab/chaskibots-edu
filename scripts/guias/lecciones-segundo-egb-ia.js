// Guías por etapas de las lecciones de Inteligencia Artificial de 2do EGB (6 a 7 años).
// Pensamiento computacional: condicionales (si… entonces), bucles (repetir) y un proyecto final.
// Combina actividades sin pantalla con ScratchJr (app gratuita para tableta o computadora).
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

const SCRATCHJR = { nombre: 'Tableta o computadora con ScratchJr', paraQue: 'App gratuita para programar uniendo bloques de colores, sin escribir.', cuidado: 'Una tableta por pareja: uno maneja y el otro dirige, y luego cambian.' }
const TARJETAS = { nombre: 'Tarjetas "SI" y "ENTONCES"', paraQue: 'Para armar reglas: SI pasa esto, ENTONCES hago esto otro.' }

module.exports = {
  levelId: 'segundo-egb',
  programId: 'ia',
  guias: {
    // ───────────── Módulo 1 · Condicionales ─────────────
    'Bienvenida 2° EGB': guia({
      reto: 'Este año vamos a enseñarle a una máquina a tomar decisiones y a repetir tareas. Hoy empezamos descubriendo cómo "piensa" una computadora.',
      paraQue: 'Las máquinas inteligentes no adivinan: siguen reglas e instrucciones que alguien les dio, paso a paso.',
      duracion: '10 minutos',
      piezas: [{ nombre: 'Espacio libre en el aula', paraQue: 'Para el juego del robot.' }],
      pasos: [
        { titulo: 'El robot obediente', texto: 'El docente es un robot que solo hace exactamente lo que le dicen. Los estudiantes le dan órdenes para llegar a la puerta: "un paso adelante", "gira a la derecha".' },
        { titulo: 'Órdenes claras', texto: 'Si alguien dice "anda para allá", el robot no se mueve: no entiende. Las instrucciones deben ser claras y en orden.' },
        { titulo: 'Lo que aprenderemos', texto: 'Cuenta el plan del año: decisiones (si… entonces), repeticiones (bucles) y al final crearán su propia app.' },
      ],
      pasa: ['El grupo logra llevar al "robot" hasta la puerta con órdenes claras.', 'Dicen que una máquina sigue instrucciones.'],
      extra: 'Dale a alguien de tu familia tres órdenes claras para llegar de la sala a la cocina.',
      preguntas: [
        q('¿Cómo sabe una máquina qué hacer?', ['Sigue instrucciones', 'Adivina'], 0, 'Las máquinas siguen las instrucciones que les damos.'),
        q('¿Cuál es una instrucción clara?', ['Da dos pasos adelante', 'Anda por ahí'], 0, 'Dice exactamente qué hacer y cuánto.'),
      ],
    }),

    'Si entonces': guia({
      reto: 'Hoy aprendemos la regla favorita de las computadoras: SI pasa algo, ENTONCES hago algo.',
      paraQue: 'Tú la usas todos los días: si llueve, entonces llevo paraguas. Las máquinas deciden igual.',
      duracion: '15 minutos',
      piezas: [TARJETAS, { nombre: 'Pizarra', paraQue: 'Para escribir las reglas del grupo.' }],
      pasos: [
        { titulo: 'Reglas de todos los días', texto: 'Completen juntos: "Si tengo sed, entonces…", "Si suena el timbre, entonces…", "Si el semáforo está en rojo, entonces…".' },
        { titulo: 'Las dos partes', texto: 'Señala en cada regla: la parte SI es lo que pasa (la condición) y la parte ENTONCES es lo que hago (la acción).' },
        { titulo: 'Simón programador', texto: 'Juego: "Si levanto la mano, entonces ustedes saltan". Levanta o no la mano. Solo actúan cuando la condición se cumple.', consejo: 'Haz trampas amistosas: levanta un pie en vez de la mano. Si saltan, repasen la regla.' },
      ],
      pasa: ['Inventan una regla propia con SI y ENTONCES.', 'En el juego solo actúan cuando la condición se cumple.'],
      falla: [{ problema: 'Confunden la condición con la acción', revisa: 'Pregunta siempre: "¿qué tiene que pasar primero?" Eso es el SI.' }],
      extra: 'Escribe o dibuja tres reglas "si… entonces" que se cumplan en tu casa.',
      preguntas: [
        q('En "si llueve, entonces uso paraguas", ¿cuál es la condición?', ['Llueve', 'Uso paraguas'], 0, 'La condición es lo que tiene que pasar.'),
        q('Si la condición NO se cumple…', ['No hago la acción', 'Hago la acción igual'], 0, 'La acción solo ocurre cuando la condición es verdadera.'),
        q('¿Cuál es una regla si… entonces?', ['Si tengo frío, entonces me pongo chompa', 'Me gusta el helado'], 0, 'Tiene una condición y una acción.'),
      ],
    }),

    'Juego de decisiones': guia({
      reto: 'Vamos a jugar a ser máquinas que deciden. Cada tarjeta trae una situación y tú eliges la acción correcta.',
      paraQue: 'Un semáforo, un ascensor y una puerta automática deciden así, miles de veces al día.',
      duracion: '25 minutos',
      piezas: [
        { nombre: 'Tarjetas de condición', paraQue: '"El semáforo está en verde", "la puerta detecta a una persona", "está oscuro", "el tanque está lleno".' },
        { nombre: 'Tarjetas de acción', paraQue: '"Avanzar", "abrir la puerta", "encender la luz", "cerrar la llave".' },
      ],
      pasos: [
        { titulo: 'Emparejamos', texto: 'En grupos, unan cada tarjeta de condición con su acción y lean la regla completa: "Si está oscuro, entonces enciendo la luz".' },
        { titulo: 'Semáforo humano', texto: 'Un estudiante muestra un círculo verde, amarillo o rojo. Los demás son carros: verde avanzan, amarillo van lento, rojo se detienen.' },
        { titulo: 'Inventamos una máquina', texto: 'Cada grupo inventa una máquina con dos reglas y la actúa. Los demás adivinan las reglas.', consejo: 'Ejemplo: un basurero que si le acercas la mano, abre la tapa.' },
      ],
      pasa: ['Unen correctamente condiciones con acciones.', 'Cada grupo presenta una máquina con al menos dos reglas.'],
      extra: 'Observa una máquina de tu casa (microondas, lavadora) y descubre una de sus reglas.',
      preguntas: [
        q('Si el semáforo está en rojo, entonces…', ['Me detengo', 'Acelero'], 0, 'Rojo significa alto.'),
        q('Una puerta automática se abre si…', ['Detecta a una persona', 'Es lunes'], 0, 'Su condición es detectar a alguien cerca.'),
        q('¿Las máquinas deciden con reglas?', ['Sí', 'No, al azar'], 0, 'Siguen reglas que alguien programó.'),
      ],
    }),

    'Decisiones encadenadas': guia({
      reto: '¿Y si la condición no se cumple? Hoy agregamos la palabra SINO: si pasa esto, hago una cosa; sino, hago otra.',
      paraQue: 'Con "sino" la máquina siempre sabe qué hacer: si hay luz, apago el foco; sino, lo enciendo.',
      duracion: '25 minutos',
      piezas: [TARJETAS, { nombre: 'Tarjeta "SINO"', paraQue: 'Para la segunda opción.' }, { nombre: 'Cinta en el piso', paraQue: 'Para dibujar un camino que se divide en dos.' }],
      pasos: [
        { titulo: 'El camino que se divide', texto: 'Marca en el piso un camino que se abre en dos. Regla: "Si tu nombre empieza con vocal, ve a la izquierda; sino, a la derecha". Cada estudiante camina y decide.' },
        { titulo: 'Reglas con sino', texto: 'Completen: "Si hace sol, voy al patio; sino…", "Si terminé la tarea, juego; sino…".' },
        { titulo: 'Encadenamos', texto: 'Ahora dos preguntas seguidas: "Si es día de clases: si llueve, llevo paraguas; sino, llevo gorra. Sino (no hay clases): me quedo en casa". Dibújenlo como un árbol de caminos.', consejo: 'Dibujar el árbol en la pizarra ayuda mucho a no perderse.' },
      ],
      pasa: ['Usan correctamente "sino" en una regla propia.', 'Recorren el camino tomando la rama correcta.'],
      falla: [{ problema: 'Se pierden con dos condiciones', revisa: 'Vuelve a una sola condición con sino y avanza cuando la dominen.' }],
      extra: 'Dibuja un camino que se divide con una regla "si… sino" para elegir qué desayunar.',
      preguntas: [
        q('"Si hay sol, voy al parque; sino, leo un cuento". Hoy llueve. ¿Qué hago?', ['Voy al parque', 'Leo un cuento'], 1, 'No hay sol, así que se cumple el "sino".'),
        q('La palabra "sino" sirve para…', ['Decir qué hacer cuando la condición no se cumple', 'Repetir algo'], 0, 'Es la segunda opción.'),
        q('Con "si… sino", ¿la máquina se queda sin saber qué hacer?', ['No, siempre tiene una opción', 'Sí'], 0, 'Siempre toma uno de los dos caminos.'),
      ],
    }),

    'Scratch Jr condicionales': guia({
      reto: 'Llevamos el "si… entonces" a la pantalla: en ScratchJr haremos que un personaje reaccione solo cuando lo tocas.',
      paraQue: 'Así funcionan los botones de cualquier app: si lo tocas, entonces pasa algo.',
      duracion: '30 minutos',
      piezas: [SCRATCHJR],
      pasos: [
        { titulo: 'Conocemos ScratchJr', texto: 'Abre un proyecto nuevo. Identifica: el escenario (donde pasa todo), el personaje (el gato) y abajo los bloques de colores.' },
        { titulo: 'El bloque "al tocar"', texto: 'En los bloques amarillos busca el que tiene un dedo tocando. Arrástralo a la zona de programación. Significa: SI tocan al personaje, ENTONCES…' },
        { titulo: 'Agregamos la acción', texto: 'Pega a su derecha un bloque azul de saltar. Toca al gato en el escenario: ¡salta!' },
        { titulo: 'Otro personaje, otra regla', texto: 'Agrega un segundo personaje con el botón "+" y dale su propia regla: si lo tocan, que gire o que diga "¡Hola!" (bloque morado).', consejo: 'Los bloques se leen de izquierda a derecha, como una frase.' },
      ],
      pasa: ['El personaje no hace nada hasta que lo tocan.', 'Al tocarlo, hace la acción programada.', 'Hay dos personajes con reglas distintas.'],
      falla: [
        { problema: 'El personaje se mueve solo al empezar', revisa: 'Usaron la bandera verde en vez del bloque del dedo. Cámbienlo.' },
        { problema: 'No pasa nada al tocarlo', revisa: 'Los bloques no están pegados entre sí: deben encajar como piezas de rompecabezas.' },
      ],
      extra: 'Haz que un personaje se haga grande cuando lo tocas y otro se haga pequeño.',
      preguntas: [
        q('El bloque amarillo con un dedo significa…', ['Empezar cuando tocan al personaje', 'Borrar todo'], 0, 'Es la condición: si lo tocan.'),
        q('¿Cómo se leen los bloques?', ['De izquierda a derecha', 'De abajo hacia arriba'], 0, 'Como una frase.'),
        q('Si no toco al personaje…', ['No hace nada', 'Salta igual'], 0, 'La acción solo ocurre si se cumple la condición.'),
      ],
    }),

    // ───────────── Módulo 2 · Bucles ─────────────
    'Repetir acciones': guia({
      reto: 'Hoy descubrimos un truco de programadores para no cansarse: en lugar de decir lo mismo muchas veces, decimos "repite".',
      paraQue: 'Cepillarte los dientes, aplaudir o caminar son acciones que se repiten. Las máquinas son expertas en repetir sin aburrirse.',
      duracion: '15 minutos',
      piezas: [{ nombre: 'Tarjetas de acciones y de números', paraQue: 'Aplaudir, saltar, girar; y los números del 2 al 5.' }],
      pasos: [
        { titulo: 'La forma larga', texto: 'Di: "aplaude, aplaude, aplaude, aplaude, aplaude". ¿Cansado, verdad? Ahora di: "repite 5 veces: aplaude". Es lo mismo, pero más corto.' },
        { titulo: 'Jugamos a repetir', texto: 'Saca una tarjeta de número y una de acción: "repite 3 veces: saltar". Todo el grupo lo cumple contando en voz alta.' },
        { titulo: 'Repetimos dos acciones', texto: '"Repite 3 veces: aplaude y salta". Fíjense que se repite el par completo: aplaude-salta, aplaude-salta, aplaude-salta.', consejo: 'A eso que se repite una y otra vez los programadores lo llaman bucle.' },
      ],
      pasa: ['Cumplen la cantidad exacta de repeticiones.', 'Dicen que un bucle es repetir una instrucción varias veces.'],
      extra: 'Encuentra tres cosas que repites cada día y di cuántas veces las haces.',
      preguntas: [
        q('Un bucle es…', ['Repetir instrucciones varias veces', 'Una decisión'], 0, 'Bucle significa repetición.'),
        q('"Repite 4 veces: salta". ¿Cuántos saltos doy?', ['2', '4', '8'], 1, 'El número dice cuántas veces se repite.'),
        q('¿Para qué sirven los bucles?', ['Para escribir menos instrucciones', 'Para escribir más'], 0, 'Ahorran trabajo.'),
      ],
    }),

    'Dibujar con bucles': guia({
      reto: 'Vamos a crear patrones y figuras repitiendo siempre los mismos pasos. Con muy pocas instrucciones saldrán dibujos grandes.',
      paraQue: 'Las cenefas, los tejidos y las baldosas son patrones: una forma que se repite.',
      duracion: '30 minutos',
      piezas: [{ nombre: 'Hoja cuadriculada, lápiz y colores', paraQue: 'Para dibujar siguiendo instrucciones.' }, { nombre: 'Fichas o tapas de colores', paraQue: 'Para armar patrones con las manos.' }],
      pasos: [
        { titulo: 'Patrones con fichas', texto: 'Arma: rojo, azul, rojo, azul, rojo, azul. ¿Qué se repite? "Rojo, azul". Dilo como bucle: "repite 3 veces: rojo, azul".' },
        { titulo: 'El cuadrado', texto: 'En la hoja cuadriculada: "repite 4 veces: avanza 3 cuadritos y gira a la derecha". ¿Qué figura salió?' },
        { titulo: 'La escalera', texto: '"Repite 5 veces: sube 1 cuadrito y avanza 1 a la derecha". Sale una escalera.' },
        { titulo: 'Mi propio patrón', texto: 'Cada estudiante inventa una cenefa, escribe su bucle y un compañero la dibuja siguiendo solo esas instrucciones.', consejo: 'Si el dibujo del compañero sale distinto, la instrucción no estaba clara: hay que corregirla.' },
      ],
      pasa: ['Dibujan un cuadrado repitiendo 4 veces la misma instrucción.', 'Escriben el bucle de su propio patrón.'],
      falla: [{ problema: 'La figura no cierra', revisa: 'Olvidaron el giro o contaron mal los cuadritos. Repitan paso a paso con el dedo.' }],
      extra: 'Busca un patrón en tu ropa o en el piso de tu casa y descubre qué parte se repite.',
      preguntas: [
        q('En "rojo, azul, rojo, azul", ¿qué se repite?', ['Rojo, azul', 'Solo rojo'], 0, 'El par rojo-azul es lo que se repite.'),
        q('Para dibujar un cuadrado repetimos… veces', ['2', '4'], 1, 'Un cuadrado tiene 4 lados iguales.'),
        q('Un patrón es…', ['Algo que se repite con orden', 'Un dibujo al azar'], 0, 'En un patrón hay una regla que se repite.'),
      ],
    }),

    'Bucles en Scratch Jr': guia({
      reto: 'Hoy usamos el bloque naranja "repetir" de ScratchJr para que el personaje haga mucho con muy pocos bloques.',
      paraQue: 'Los programadores usan bucles todo el tiempo: es la forma de hacer que una máquina trabaje sin escribirle mil instrucciones.',
      duracion: '30 minutos',
      piezas: [SCRATCHJR],
      pasos: [
        { titulo: 'La forma larga', texto: 'Programa al gato con bandera verde y cuatro bloques de saltar seguidos. Funciona, pero ocupa mucho espacio.' },
        { titulo: 'El bloque repetir', texto: 'En los bloques naranjas toma el que tiene forma de C con un número. Pon dentro un solo bloque de saltar y cambia el número a 4.' },
        { titulo: 'Comparamos', texto: 'Prueba los dos programas: hacen lo mismo. ¿Cuál usa menos bloques? ¿Cuál es más fácil de cambiar si quiero 10 saltos?' },
        { titulo: 'Dos acciones dentro', texto: 'Mete dentro del repetir: avanzar y saltar. El gato cruzará la pantalla dando saltos.', consejo: 'Cambia el número del bucle y predice qué pasará antes de tocar la bandera.' },
      ],
      pasa: ['El personaje repite la acción la cantidad de veces indicada.', 'Usan un solo bloque de acción dentro del repetir.'],
      falla: [
        { problema: 'Solo se repite una acción', revisa: 'El otro bloque quedó fuera de la C naranja. Arrástralo adentro.' },
        { problema: 'El personaje sale de la pantalla', revisa: 'Baja el número de repeticiones o empieza desde el borde izquierdo.' },
      ],
      extra: 'Haz que el gato dé una vuelta completa repitiendo varias veces el bloque de girar.',
      preguntas: [
        q('¿De qué color es el bloque repetir?', ['Naranja', 'Azul'], 0, 'Los bloques de control son naranjas.'),
        q('Lo que se repite es lo que está…', ['Dentro del bloque repetir', 'Fuera del bloque'], 0, 'Solo se repite lo que está dentro de la C.'),
        q('Si cambio el número de 4 a 6, el gato…', ['Repite 6 veces', 'Repite 4 veces'], 0, 'El número indica las repeticiones.'),
      ],
    }),

    'Animación con bucles': guia({
      reto: 'Vamos a crear una animación que nunca se detiene: un personaje que baila o un pez que nada sin parar.',
      paraQue: 'Los dibujos animados y los videojuegos usan bucles infinitos: el fondo se mueve y los personajes caminan una y otra vez.',
      duracion: '30 minutos',
      piezas: [SCRATCHJR],
      pasos: [
        { titulo: 'Elegimos escena', texto: 'Cambia el fondo (botón del paisaje) y elige un personaje que te guste.' },
        { titulo: 'Armamos el movimiento', texto: 'Bandera verde, luego: mover a la derecha, mover a la izquierda. El personaje va y vuelve una vez.' },
        { titulo: 'Para siempre', texto: 'En los bloques rojos busca "repetir por siempre" y pégalo al final. Ahora el personaje va y vuelve sin parar.' },
        { titulo: 'Más vida', texto: 'Agrega un segundo personaje con su propio bucle (por ejemplo, saltar por siempre). Los dos se mueven a la vez.', consejo: 'Para detener todo, toca el botón rojo de arriba.' },
      ],
      pasa: ['La animación sigue sin detenerse sola.', 'Hay al menos dos personajes animados.'],
      falla: [{ problema: 'La animación se hace una sola vez', revisa: 'Falta el bloque rojo "repetir por siempre" al final del programa.' }],
      extra: 'Crea una escena del mar con tres peces que nadan a distintas velocidades.',
      preguntas: [
        q('"Repetir por siempre" hace que el programa…', ['Nunca termine solo', 'Se borre'], 0, 'Vuelve a empezar una y otra vez.'),
        q('¿Dónde va el bloque "repetir por siempre"?', ['Al final', 'Al principio'], 0, 'Va al final y regresa al inicio.'),
        q('¿Pueden moverse dos personajes a la vez?', ['Sí, cada uno con su programa', 'No'], 0, 'Cada personaje tiene sus propios bloques.'),
      ],
    }),

    // ───────────── Módulo 3 · Combinando ─────────────
    'Condicionales + Bucles': guia({
      reto: 'Hoy juntamos nuestros dos superpoderes: decidir y repetir. Con los dos a la vez se pueden crear juegos.',
      paraQue: 'Un videojuego hace esto sin parar: repite por siempre "si tocan el botón, entonces el personaje salta".',
      duracion: '15 minutos',
      piezas: [TARJETAS, { nombre: 'Tarjeta "REPITE"', paraQue: 'Para combinar con las de decisión.' }],
      pasos: [
        { titulo: 'Recordamos', texto: '¿Qué es una condición? ¿Qué es un bucle? Pide un ejemplo de cada uno.' },
        { titulo: 'El guardia', texto: 'Un estudiante es el guardia de una puerta. Regla: "repite por siempre: si alguien dice la clave, déjalo pasar; sino, di alto". Jueguen varias rondas.' },
        { titulo: 'Lo encontramos alrededor', texto: 'Un semáforo repite todo el día y cambia según el tiempo. ¿Qué otras máquinas repiten y deciden a la vez?' },
      ],
      pasa: ['Identifican en el juego qué parte es el bucle y cuál la condición.', 'Dan un ejemplo de máquina que repite y decide.'],
      extra: 'Inventa un juego para el recreo con una regla que combine "repite" y "si… entonces".',
      preguntas: [
        q('En el juego del guardia, ¿cuál es la condición?', ['Si dicen la clave', 'Repetir por siempre'], 0, 'La condición es decir la clave.'),
        q('¿Se pueden usar bucles y condiciones juntos?', ['Sí', 'No'], 0, 'Juntos permiten crear juegos y máquinas.'),
      ],
    }),

    'Juego interactivo': guia({
      reto: 'Creamos nuestro primer juego en ScratchJr: un personaje que se mueve todo el tiempo y reacciona cuando logras tocarlo.',
      paraQue: 'Es la base de muchos juegos de atrapar: algo se mueve y tú debes tocarlo a tiempo.',
      duracion: '40 minutos',
      piezas: [SCRATCHJR],
      pasos: [
        { titulo: 'Planeamos', texto: 'Decidan: ¿quién es el personaje?, ¿cómo se mueve?, ¿qué pasa cuando lo atrapo?' },
        { titulo: 'El bucle: se mueve solo', texto: 'Primer programa del personaje: bandera verde, mover a la derecha, mover a la izquierda, repetir por siempre.' },
        { titulo: 'La condición: lo atrapo', texto: 'Segundo programa del mismo personaje: bloque "al tocar", luego hacerse pequeño o desaparecer (bloque morado) y decir "¡Me atrapaste!".' },
        { titulo: 'Probamos y ajustamos', texto: 'Juega. ¿Es muy fácil? Sube la velocidad (bloque naranja de velocidad). ¿Muy difícil? Bájala.', consejo: 'Un personaje puede tener varios programas a la vez, uno debajo del otro.' },
        { titulo: 'Intercambio', texto: 'Cada pareja prueba el juego de otra y le dice una cosa que le gustó.' },
      ],
      pasa: ['El personaje se mueve solo sin parar.', 'Al tocarlo, reacciona.', 'Otra pareja pudo jugarlo.'],
      falla: [
        { problema: 'Al tocarlo no pasa nada', revisa: 'Falta el programa con el bloque del dedo, o está en otro personaje.' },
        { problema: 'Desaparece y ya no vuelve', revisa: 'Agrega al inicio del primer programa un bloque morado de "mostrar".' },
      ],
      extra: 'Agrega un segundo personaje más rápido que valga "el doble" al atraparlo.',
      preguntas: [
        q('¿Qué hace que el personaje se mueva sin parar?', ['El bucle "repetir por siempre"', 'El bloque del dedo'], 0, 'El bucle repite el movimiento.'),
        q('¿Qué hace que reaccione al tocarlo?', ['El bloque "al tocar"', 'La bandera verde'], 0, 'Es la condición del juego.'),
        q('Si el juego es muy fácil, puedo…', ['Subir la velocidad', 'Borrar el personaje'], 0, 'Ajustar la dificultad es parte de diseñar juegos.'),
      ],
    }),

    'Mejorando mi juego': guia({
      reto: 'Los buenos juegos se sienten vivos. Hoy le ponemos sonidos y detalles al nuestro.',
      paraQue: 'Los programadores nunca terminan a la primera: publican, escuchan opiniones y mejoran.',
      duracion: '35 minutos',
      piezas: [SCRATCHJR, { nombre: 'Lugar silencioso', paraQue: 'Para grabar los sonidos sin ruido de fondo.' }],
      pasos: [
        { titulo: 'Sonido listo', texto: 'En los bloques verdes está el sonido "pop". Agrégalo al programa del dedo: ahora suena cuando atrapas al personaje.' },
        { titulo: 'Grabo mi propio sonido', texto: 'Toca el bloque verde del micrófono y graba una frase corta: "¡Bien hecho!". Úsalo en tu juego.' },
        { titulo: 'Mejoramos con opiniones', texto: 'Recuerda lo que te dijo la otra pareja y aplica una mejora: otro fondo, otro personaje, un mensaje al final.' },
        { titulo: 'Prueba final', texto: 'Juega tres veces seguidas para comprobar que todo funciona siempre igual.' },
      ],
      pasa: ['El juego tiene al menos un sonido.', 'Se aplicó una mejora sugerida por compañeros.'],
      falla: [{ problema: 'No se escucha nada', revisa: 'Sube el volumen del dispositivo y revisa que el bloque verde esté pegado al programa.' }],
      extra: 'Pide a alguien de tu familia que pruebe el juego y anota una idea que te dé.',
      preguntas: [
        q('¿De qué color son los bloques de sonido?', ['Verdes', 'Azules'], 0, 'Los verdes son de sonido.'),
        q('¿Para qué pedimos opiniones?', ['Para mejorar el juego', 'Para molestar'], 0, 'Otros ven cosas que nosotros no.'),
      ],
    }),

    // ───────────── Módulo 4 · Proyecto Final ─────────────
    'Diseñar mi app': guia({
      reto: 'Empieza el proyecto final: vas a crear tu propia app con varias pantallas. Hoy la diseñas en papel.',
      paraQue: 'Toda app que usas empezó como un dibujo en una hoja. Diseñar primero evita perderse al programar.',
      duracion: '15 minutos',
      piezas: [{ nombre: 'Hoja con 3 recuadros', paraQue: 'Cada recuadro es una pantalla de la app.' }, { nombre: 'Lápiz y colores', paraQue: 'Para dibujar.' }],
      pasos: [
        { titulo: 'Elijo mi idea', texto: 'Opciones: un cuento interactivo, un juego de atrapar o una app que presenta a mi familia o mi mascota.' },
        { titulo: 'Dibujo las 3 pantallas', texto: 'Pantalla 1: inicio. Pantalla 2: lo principal. Pantalla 3: el final. Dibuja el fondo y los personajes de cada una.' },
        { titulo: 'Marco las reglas', texto: 'En cada pantalla escribe una regla: "si toco la estrella, paso a la siguiente pantalla", "el pez nada por siempre".' },
      ],
      pasa: ['Tienen el diseño de 3 pantallas.', 'Su diseño incluye al menos una condición y un bucle.'],
      extra: 'Ponle nombre a tu app y dibuja su ícono.',
      preguntas: [
        q('¿Qué hacemos antes de programar una app?', ['Diseñarla en papel', 'Nada'], 0, 'El diseño es el plano de la app.'),
        q('¿Cuántas pantallas tendrá nuestra app?', ['Una', 'Tres'], 1, 'Inicio, parte principal y final.'),
      ],
    }),

    'Crear mi app': guia({
      reto: 'Hoy convertimos el diseño en una app de verdad en ScratchJr, con tres pantallas, decisiones y repeticiones.',
      paraQue: 'Es tu primera creación completa: reúne todo lo aprendido en el año.',
      duracion: '45 minutos',
      piezas: [SCRATCHJR, { nombre: 'Tu hoja de diseño', paraQue: 'El plano que vas a seguir.' }],
      pasos: [
        { titulo: 'Creamos las páginas', texto: 'A la derecha de la pantalla, toca el "+" para agregar páginas hasta tener 3. Pon a cada una su fondo.' },
        { titulo: 'Pantalla 1: inicio', texto: 'Agrega el título con el botón "ABC" y un personaje. Programa: si lo tocan, ir a la página 2 (bloque rojo con el dibujo de la página).' },
        { titulo: 'Pantalla 2: lo principal', texto: 'Aquí va tu juego o tu cuento: un personaje con un bucle (se mueve) y otro con una condición (reacciona al tocarlo y lleva a la página 3).' },
        { titulo: 'Pantalla 3: final', texto: 'Un mensaje de cierre, un sonido grabado y un personaje que celebra con "repetir por siempre".' },
        { titulo: 'Recorrido completo', texto: 'Empieza en la página 1 y llega hasta el final sin ayuda. Corrige lo que falle.', consejo: 'Guarda con frecuencia volviendo a la pantalla de inicio de ScratchJr (el ícono de la casa).' },
      ],
      pasa: ['La app tiene 3 páginas y se puede pasar de una a otra.', 'Usa al menos un bucle y una condición.', 'Se recorre completa sin trabarse.'],
      falla: [
        { problema: 'No cambia de página', revisa: 'Falta el bloque rojo de "ir a página" al final del programa del dedo.' },
        { problema: 'No alcanzó el tiempo', revisa: 'Termina primero el recorrido entre páginas; los adornos van al final.' },
      ],
      extra: 'Agrega una cuarta página secreta a la que solo se llega tocando un objeto escondido.',
      preguntas: [
        q('¿Qué bloque cambia de página?', ['El rojo con el dibujo de la página', 'El verde de sonido'], 0, 'Los bloques rojos terminan el programa o cambian de página.'),
        q('¿Qué termino primero?', ['Que la app funcione de inicio a fin', 'Los adornos'], 0, 'Primero que funcione, después que se vea bonita.'),
        q('Mi app usa bucles para…', ['Que algo se repita', 'Cambiar de página'], 0, 'El bucle repite acciones.'),
      ],
    }),

    'Feria de apps': guia({
      reto: 'Llegó el día de mostrar tu app. Vas a presentarla, a probar las de tus compañeros y a celebrar todo lo que aprendiste.',
      paraQue: 'Compartir lo que creas y explicar cómo lo hiciste es tan importante como hacerlo.',
      duracion: '30 minutos',
      piezas: [{ nombre: 'Dispositivos con las apps terminadas', paraQue: 'Uno por puesto de la feria.' }, { nombre: 'Tarjetas "Me gustó…" y "Una idea…"', paraQue: 'Para dejar comentarios amables.' }],
      pasos: [
        { titulo: 'Preparo mi presentación', texto: 'Ensaya tres frases: "Mi app se llama…", "Sirve para…", "Usé un bucle para… y una condición para…".' },
        { titulo: 'Feria, primera ronda', texto: 'La mitad del curso presenta en su puesto y la otra mitad visita y prueba. Cada visitante deja una tarjeta.' },
        { titulo: 'Segunda ronda', texto: 'Cambian los papeles.' },
        { titulo: 'Cierre del año', texto: 'En ronda: ¿qué aprendí?, ¿qué fue lo más difícil?, ¿qué quiero crear después? Entrega de diplomas o aplausos.' },
      ],
      pasa: ['Cada estudiante presenta su app y nombra su bucle y su condición.', 'Todos reciben al menos un comentario amable.'],
      extra: 'Muestra tu app en casa y enséñale a alguien a hacer un bucle en ScratchJr.',
      preguntas: [
        q('Un buen comentario a un compañero es…', ['Me gustó tu personaje; podrías añadir sonido', 'Está feo'], 0, 'Dice algo positivo y da una idea para mejorar.'),
        q('Este año aprendí a usar…', ['Condiciones y bucles', 'Solo colores'], 0, 'Son las dos grandes ideas del curso.'),
      ],
    }),
  },
}
