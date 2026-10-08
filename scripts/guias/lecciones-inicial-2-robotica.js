// Guías por etapas de las lecciones de Robótica de Inicial 2 (4 a 5 años).
// Están escritas para que las lea el docente o el adulto que acompaña al niño.
// Clave = título de la lección. Se cargan con scripts/seed-lesson-guias.js.

const PILA = { nombre: 'Pila de botón CR2032', paraQue: 'Guarda la energía que enciende la luz. Tiene dos caras: la lisa con letras es el positivo (+) y la otra el negativo (–).', cuidado: 'Es pequeña y peligrosa si se traga. La entrega y la recoge siempre el adulto, y se cuenta al empezar y al terminar.' }
const LED = { nombre: 'LED', paraQue: 'Es una luz pequeñita. Tiene dos patitas: la larga es el positivo (+) y la corta el negativo (–).', cuidado: 'Solo enciende si las patitas están del lado correcto. Si no enciende, se le da la vuelta.' }
const CINTA = { nombre: 'Cinta de cobre', paraQue: 'Es un camino de metal por donde viaja la electricidad, como una carretera para la energía.', cuidado: 'Los bordes pueden cortar un poco: se pega despacio y con ayuda.' }

module.exports = {
  levelId: 'inicial-2',
  programId: 'robotica',
  guias: {
    '¿Qué necesita electricidad?': {
      reto: {
        texto: 'Hoy vamos a ser detectives de la electricidad. Buscaremos en el aula qué cosas necesitan electricidad para funcionar y cuáles no.',
        paraQue: 'La electricidad hace funcionar la luz, la refrigeradora y el televisor. Saber qué cosas la usan nos ayuda a cuidarnos y a no desperdiciarla.',
        duracion: '15 minutos',
      },
      piezas: [
        { nombre: 'Tarjetas u objetos del aula', paraQue: 'Cosas para clasificar: una linterna, un foco, un libro, una pelota, un ventilador, una cuchara.' },
        { nombre: 'Dos cajas o círculos en el piso', paraQue: 'Una para "usa electricidad" y otra para "no usa electricidad".' },
      ],
      pasos: [
        { titulo: 'Conversamos', texto: 'Pregunta al grupo: ¿qué pasa en casa cuando se va la luz? ¿Qué cosas dejan de funcionar? Escucha sus ideas sin corregir todavía.' },
        { titulo: 'Clasificamos', texto: 'Cada niño toma un objeto o una tarjeta y lo lleva a la caja que cree correcta. Entre todos revisan y explican por qué.' },
        { titulo: 'Camino abierto y camino cerrado', texto: 'Los niños se toman de las manos en ronda: la electricidad puede pasar porque el camino está cerrado. Cuando dos se sueltan, el camino se abre y la electricidad ya no pasa.', consejo: 'Pasa un apretón de manos por la ronda para representar la electricidad viajando.' },
        { titulo: 'Nos cuidamos', texto: 'Recuerden juntos las reglas: no tocar enchufes, no meter objetos en ellos y no tocar aparatos con las manos mojadas.' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Los niños nombran al menos tres cosas que usan electricidad.',
          'Explican con sus palabras que la electricidad necesita un camino cerrado para pasar.',
        ],
        siNoFunciona: [
          { problema: 'Confunden pilas con enchufe', revisa: 'Aclara que las dos son electricidad: la pila la lleva guardada y el enchufe la trae por los cables.' },
        ],
      },
      demuestra: {
        reto: 'En casa, busca con tu familia tres cosas que usen electricidad y dibújalas.',
        preguntas: [
          { pregunta: '¿Cuál de estas cosas necesita electricidad?', opciones: ['Una pelota', 'Un foco', 'Un cuaderno'], correcta: 1, explicacion: 'El foco necesita electricidad para dar luz.' },
          { pregunta: 'Si el camino está abierto, ¿la electricidad pasa?', opciones: ['Sí', 'No'], correcta: 1, explicacion: 'La electricidad solo pasa cuando el camino está cerrado, sin cortes.' },
          { pregunta: '¿Podemos tocar los enchufes?', opciones: ['Sí, siempre', 'No, es peligroso'], correcta: 1, explicacion: 'Los enchufes solo los usa una persona adulta.' },
        ],
      },
    },

    'Primer Circuito con LED': {
      reto: {
        texto: 'Hoy vamos a encender nuestra primera luz. Con una cinta, una pila y un LED haremos un camino para que la electricidad llegue a la luz.',
        paraQue: 'Así funciona una linterna: una pila, un camino y una luz. Cuando el camino se cierra, la luz se enciende.',
        duracion: '25 minutos',
      },
      piezas: [CINTA, PILA, LED, { nombre: 'Plantilla de papel', paraQue: 'Tiene dibujado el camino donde va la cinta y los lugares de la pila y el LED.' }],
      pasos: [
        { titulo: 'Miramos la plantilla', texto: 'Sigan con el dedo el camino dibujado: sale de la pila, pasa por el LED y vuelve a la pila. Ese recorrido completo se llama circuito.' },
        { titulo: 'Pegamos la cinta', texto: 'Con ayuda, pega la cinta de cobre sobre las líneas de la plantilla. Presiona bien con el dedo para que quede lisa.', consejo: 'En las esquinas es mejor doblar la cinta que cortarla: así el camino no se interrumpe.' },
        { titulo: 'Colocamos el LED', texto: 'Abre las patitas del LED y apoya cada una sobre un pedazo de cinta, en el lugar marcado. La patita larga va del lado del signo +. Sujétalas con cinta adhesiva.' },
        { titulo: 'Colocamos la pila', texto: 'El adulto entrega la pila. Va en el círculo marcado, con la cara de las letras (+) hacia el lado del signo +.' },
        { titulo: 'Cerramos el camino', texto: 'Dobla la esquina del papel para que la cinta toque la parte de arriba de la pila. ¡La luz se enciende!' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Al doblar la esquina y presionar, el LED se enciende.',
          'Al soltar, el LED se apaga: el camino se abrió.',
        ],
        siNoFunciona: [
          { problema: 'El LED no enciende', revisa: 'Dale la vuelta al LED: la patita larga debe estar del lado del +.' },
          { problema: 'Sigue sin encender', revisa: 'Da la vuelta a la pila y presiona bien la cinta: si está arrugada o cortada, el camino está abierto.' },
          { problema: 'Enciende y se apaga', revisa: 'Las patitas del LED no tocan bien la cinta. Sujétalas con más cinta adhesiva.' },
        ],
      },
      demuestra: {
        reto: 'Muéstrale a un compañero cómo se enciende y se apaga tu luz, y cuéntale por dónde viaja la electricidad.',
        preguntas: [
          { pregunta: '¿Qué le da energía a la luz?', opciones: ['La pila', 'El papel', 'La cinta adhesiva'], correcta: 0, explicacion: 'La pila guarda la energía que enciende el LED.' },
          { pregunta: '¿Qué patita del LED es el positivo?', opciones: ['La corta', 'La larga'], correcta: 1, explicacion: 'La patita larga es el positivo (+).' },
          { pregunta: 'Si la cinta está rota, ¿la luz enciende?', opciones: ['Sí', 'No'], correcta: 1, explicacion: 'Si el camino está roto, la electricidad no puede pasar.' },
        ],
      },
    },

    'Circuito en Paralelo': {
      reto: {
        texto: 'Hoy vamos a encender dos luces con una sola pila. Y haremos un experimento: si quitamos una luz, ¿la otra se apaga?',
        paraQue: 'En tu casa, si se quema un foco los demás siguen encendidos. Eso pasa porque cada foco tiene su propio camino. Hoy lo vas a comprobar.',
        duracion: '30 minutos',
      },
      piezas: [CINTA, PILA, { ...LED, nombre: '2 LED' }, { nombre: 'Plantilla de dos caminos', paraQue: 'Tiene dos líneas largas, como las vías de un tren, y dos lugares para los LED.' }],
      pasos: [
        { titulo: 'Pegamos las dos vías', texto: 'Pega dos tiras de cinta de cobre, una al lado de la otra, sin que se toquen. Una vía sale del + de la pila y la otra del –.' },
        { titulo: 'Ponemos el primer LED', texto: 'Coloca un LED como un puente entre las dos vías: la patita larga sobre la vía del + y la corta sobre la vía del –.' },
        { titulo: 'Ponemos el segundo LED', texto: 'Coloca el otro LED más adelante, igual que el primero: como otro puente entre las mismas dos vías.', consejo: 'Los dos LED deben mirar hacia el mismo lado.' },
        { titulo: 'Colocamos la pila', texto: 'El adulto entrega la pila y la colocan en su lugar. Presionen para cerrar el camino: se encienden las dos luces.' },
        { titulo: 'El experimento', texto: 'Con cuidado, levanta una patita de uno de los LED. Observen qué pasa con el otro.' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Con la pila puesta, se encienden las dos luces.',
          'Al levantar un LED, el otro sigue encendido.',
        ],
        siNoFunciona: [
          { problema: 'Solo enciende un LED', revisa: 'El que no enciende está al revés. Dale la vuelta.' },
          { problema: 'No enciende ninguno', revisa: 'Las dos vías se están tocando en algún punto, o la pila está al revés.' },
          { problema: 'Un LED brilla menos', revisa: 'Es normal si son de colores distintos: cada color necesita diferente energía.' },
        ],
      },
      demuestra: {
        reto: 'Explica a tu familia por qué en casa, cuando un foco se quema, los otros siguen encendidos.',
        preguntas: [
          { pregunta: '¿Cuántas luces encendimos con una pila?', opciones: ['Una', 'Dos'], correcta: 1, explicacion: 'Las dos luces comparten la misma pila.' },
          { pregunta: 'Si quitamos un LED, ¿el otro se apaga?', opciones: ['Sí', 'No'], correcta: 1, explicacion: 'Cada LED tiene su propio camino, así que el otro sigue encendido.' },
          { pregunta: '¿Las dos vías de cinta pueden tocarse?', opciones: ['Sí', 'No'], correcta: 1, explicacion: 'Si se tocan, la electricidad toma un atajo y no llega a las luces.' },
        ],
      },
    },

    'Proyecto Arte Eléctrico': {
      reto: {
        texto: 'Hoy vas a crear un dibujo que se ilumina de verdad. Puede ser un cielo con estrellas, un robot con ojos brillantes o lo que tú imagines.',
        paraQue: 'Las tarjetas musicales, los letreros luminosos y los juguetes con luces mezclan arte y electricidad. Los ingenieros también son creativos.',
        duracion: '35 minutos',
      },
      piezas: [CINTA, PILA, { ...LED, nombre: 'LED de colores' }, { nombre: 'Cartulina, crayones y adhesivos', paraQue: 'Para dibujar y decorar tu obra.' }],
      pasos: [
        { titulo: 'Imaginamos', texto: 'Piensa qué quieres dibujar y qué parte se va a iluminar: los ojos de un robot, una estrella, la luz de una casa.' },
        { titulo: 'Dibujamos', texto: 'Haz tu dibujo en la cartulina y marca con un punto dónde irá cada luz.' },
        { titulo: 'Hacemos el camino', texto: 'Con ayuda, pega la cinta de cobre desde el lugar de la pila hasta cada punto de luz y de regreso, como en la clase anterior.', consejo: 'El camino puede ir por detrás de la cartulina para que no tape el dibujo.' },
        { titulo: 'Ponemos las luces', texto: 'Coloca cada LED en su punto, con la patita larga hacia el lado del +. Sujeta con cinta adhesiva.' },
        { titulo: 'Encendemos y decoramos', texto: 'El adulto coloca la pila. Cuando las luces enciendan, termina de decorar con colores y adhesivos.' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Las luces se encienden en los lugares que elegiste.',
          'El dibujo se entiende y las luces forman parte de él.',
        ],
        siNoFunciona: [
          { problema: 'Una luz no enciende', revisa: 'Da la vuelta a ese LED y revisa que sus patitas toquen la cinta.' },
          { problema: 'No enciende ninguna', revisa: 'Sigue el camino con el dedo buscando un corte en la cinta, y revisa la posición de la pila.' },
        ],
      },
      demuestra: {
        reto: 'Ponle un nombre a tu obra y preséntala al grupo: qué dibujaste y qué parte se ilumina.',
        preguntas: [
          { pregunta: '¿Qué necesita tu dibujo para iluminarse?', opciones: ['Solo crayones', 'Pila, camino de cinta y LED'], correcta: 1, explicacion: 'Sin pila, camino y luz no hay circuito.' },
          { pregunta: '¿Quién coloca la pila?', opciones: ['El adulto', 'Cualquiera'], correcta: 0, explicacion: 'La pila es pequeña y peligrosa; la maneja el adulto.' },
          { pregunta: '¿Los ingenieros pueden ser creativos?', opciones: ['Sí', 'No'], correcta: 0, explicacion: 'Inventar cosas nuevas necesita mucha imaginación.' },
        ],
      },
    },

    'Energía Renovable': {
      reto: {
        texto: 'Hoy vamos a descubrir de dónde viene la electricidad. ¿Sabías que el viento, el sol y el agua pueden producirla?',
        paraQue: 'Hay energía que se acaba y contamina, y energía que la naturaleza nos da una y otra vez sin ensuciar. Elegir bien cuida nuestro planeta.',
        duracion: '15 minutos',
      },
      piezas: [
        { nombre: 'Imágenes o video corto', paraQue: 'De un molino de viento, un panel solar y una represa.' },
        { nombre: 'Un molinete de papel', paraQue: 'Para sentir cómo el viento puede mover cosas.' },
      ],
      pasos: [
        { titulo: 'Preguntamos', texto: '¿De dónde viene la luz de nuestra casa? Escucha las ideas de los niños.' },
        { titulo: 'Conocemos tres amigos de la energía', texto: 'Muestra las imágenes: el sol, el viento y el agua. Los tres pueden producir electricidad y nunca se acaban. A eso lo llamamos energía renovable.' },
        { titulo: 'Sentimos el viento', texto: 'Cada niño sopla un molinete. Pregunta: ¿quién lo hace girar? El viento tiene fuerza, y esa fuerza se puede convertir en electricidad.' },
        { titulo: 'Cuidamos la energía', texto: 'Conversen: ¿qué podemos hacer para no gastarla? Apagar la luz al salir, cerrar la refrigeradora, apagar el televisor.' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Los niños nombran el sol, el viento o el agua como fuentes de energía.',
          'Proponen al menos una acción para ahorrar energía.',
        ],
        siNoFunciona: [
          { problema: 'No entienden "renovable"', revisa: 'Usa la idea de "que nunca se acaba": el sol sale todos los días y el viento vuelve a soplar.' },
        ],
      },
      demuestra: {
        reto: 'Dibuja uno de los tres amigos de la energía y cuéntale a tu familia qué hace.',
        preguntas: [
          { pregunta: '¿Cuál de estos nos da energía que nunca se acaba?', opciones: ['El viento', 'Una pila usada'], correcta: 0, explicacion: 'El viento vuelve a soplar siempre: es energía renovable.' },
          { pregunta: '¿Qué hacemos al salir de un cuarto?', opciones: ['Dejar la luz encendida', 'Apagar la luz'], correcta: 1, explicacion: 'Apagar la luz ahorra energía.' },
          { pregunta: '¿El sol puede producir electricidad?', opciones: ['Sí', 'No'], correcta: 0, explicacion: 'Los paneles solares convierten la luz del sol en electricidad.' },
        ],
      },
    },

    'Experimentos con Viento': {
      reto: {
        texto: 'Hoy vamos a encender una luz ¡soplando! Sin pila: solo con la fuerza de tu aire y un pequeño molino.',
        paraQue: 'Así funcionan los grandes molinos de viento que ves en las montañas: el viento hace girar las aspas y ese giro produce electricidad para muchas casas.',
        duracion: '25 minutos',
      },
      piezas: [
        { nombre: 'Generador eólico', paraQue: 'Es un molino pequeño. Cuando sus aspas giran, produce electricidad.', cuidado: 'No acerques los dedos ni el pelo a las aspas cuando giran.' },
        LED,
        { nombre: 'Cables', paraQue: 'Llevan la electricidad del generador al LED.' },
      ],
      pasos: [
        { titulo: 'Conocemos el molino', texto: 'Miren el generador: tiene aspas y dos cables. Gírenlo despacio con el dedo para ver cómo se mueve.' },
        { titulo: 'Conectamos la luz', texto: 'Con ayuda, une cada cable del generador con una patita del LED.' },
        { titulo: 'Soplamos suave', texto: 'Sopla despacio sobre las aspas y observa el LED.' },
        { titulo: 'Soplamos fuerte', texto: 'Ahora sopla con más fuerza. ¿Qué cambió en la luz?', consejo: 'Si soplar no alcanza, usen un ventilador o un secador de pelo con aire frío.' },
        { titulo: 'Comparamos', texto: 'Conversen: ¿cuándo brilló más la luz? Mientras más rápido giran las aspas, más electricidad se produce.' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Al soplar, el LED se enciende.',
          'Con viento fuerte brilla más; con viento suave, menos o se apaga.',
        ],
        siNoFunciona: [
          { problema: 'Las aspas giran pero el LED no enciende', revisa: 'Cambia los cables de patita: el LED está al revés.' },
          { problema: 'Enciende muy poquito', revisa: 'Necesita más viento. Usa un ventilador o acerca más el generador.' },
          { problema: 'Las aspas no giran', revisa: 'Sopla de frente y revisa que nada roce las aspas.' },
        ],
      },
      demuestra: {
        reto: 'Prueba soplar desde distintos lugares y descubre desde dónde giran mejor las aspas.',
        preguntas: [
          { pregunta: '¿Qué enciende la luz en este experimento?', opciones: ['Una pila', 'El viento que mueve las aspas'], correcta: 1, explicacion: 'El giro de las aspas produce la electricidad.' },
          { pregunta: 'Si soplas más fuerte, la luz…', opciones: ['Brilla más', 'Brilla menos'], correcta: 0, explicacion: 'Más viento hace girar más rápido y produce más electricidad.' },
          { pregunta: '¿El viento se acaba?', opciones: ['Sí', 'No'], correcta: 1, explicacion: 'El viento es energía renovable: vuelve a soplar siempre.' },
        ],
      },
    },

    '¿Qué es un Robot?': {
      reto: {
        texto: 'Hoy vamos a conocer a los robots: qué son, cómo son y qué trabajos hacen para ayudarnos.',
        paraQue: 'Los robots limpian casas, arman carros, ayudan a los doctores y exploran otros planetas. Los inventan y los cuidan personas como tú cuando seas grande.',
        duracion: '20 minutos',
      },
      piezas: [
        { nombre: 'Videos o imágenes de robots', paraQue: 'Una aspiradora robot, un brazo de fábrica, un robot explorador.' },
        { nombre: 'Espacio para moverse', paraQue: 'Para jugar a ser robots.' },
      ],
      pasos: [
        { titulo: '¿Qué saben de los robots?', texto: 'Pregunta qué robots conocen de películas o dibujos. Anota o dibuja sus ideas.' },
        { titulo: 'Robots de verdad', texto: 'Muestra los videos. Un robot es una máquina que hace tareas sola, siguiendo instrucciones que una persona le dio.' },
        { titulo: 'Las tres partes de un robot', texto: 'Explica con gestos: los robots sienten (con sensores, como nuestros ojos), piensan (con su computadora, como nuestro cerebro) y se mueven (con motores, como nuestros músculos).' },
        { titulo: 'Jugamos al robot', texto: 'Un niño es el robot y otro le da instrucciones: "camina dos pasos", "gira", "levanta el brazo". El robot solo hace lo que le dicen.', consejo: 'Da una instrucción incompleta a propósito para que descubran que un robot necesita órdenes claras.' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Los niños dicen que un robot es una máquina que hace tareas sola.',
          'En el juego, el "robot" sigue las instrucciones paso a paso.',
        ],
        siNoFunciona: [
          { problema: 'Creen que los robots están vivos', revisa: 'Aclara que son máquinas: no sienten hambre ni sueño, y solo hacen lo que alguien les programó.' },
        ],
      },
      demuestra: {
        reto: 'Dibuja un robot que te ayude en casa y cuenta qué tarea haría.',
        preguntas: [
          { pregunta: '¿Qué es un robot?', opciones: ['Un animal', 'Una máquina que hace tareas sola'], correcta: 1, explicacion: 'Un robot es una máquina que sigue instrucciones.' },
          { pregunta: '¿Quién le dice al robot qué hacer?', opciones: ['Una persona que lo programa', 'Nadie'], correcta: 0, explicacion: 'Las personas escriben las instrucciones del robot.' },
          { pregunta: '¿Con qué "siente" un robot?', opciones: ['Con sensores', 'Con las manos'], correcta: 0, explicacion: 'Los sensores son como los ojos y oídos del robot.' },
        ],
      },
    },

    'Feria de Robótica': {
      reto: {
        texto: 'Hoy es un día especial: vamos a mostrar a nuestras familias todo lo que construimos y aprendimos. ¡Tú eres el ingeniero que explica!',
        paraQue: 'Los inventores no solo construyen: también cuentan sus ideas a otras personas. Explicar lo que hiciste te ayuda a entenderlo mejor y a sentirte orgulloso.',
        duracion: '30 minutos',
      },
      piezas: [
        { nombre: 'Tus proyectos', paraQue: 'El circuito con LED, tu arte eléctrico y el generador de viento.' },
        { nombre: 'Mesa de exposición y cartel con tu nombre', paraQue: 'Tu espacio en la feria.' },
        { nombre: 'Certificado de Pequeño Ingeniero', paraQue: 'Lo recibes al terminar tu presentación.' },
      ],
      pasos: [
        { titulo: 'Preparamos la mesa', texto: 'Cada niño coloca sus proyectos en su espacio, con su cartel. El adulto revisa las pilas y los LED antes de empezar.' },
        { titulo: 'Ensayamos', texto: 'Practiquen tres frases: qué es, cómo lo hice y qué aprendí. Por ejemplo: "Este es mi circuito. Pegué la cinta y puse la pila. Aprendí que la electricidad necesita un camino".' },
        { titulo: 'Recibimos a las familias', texto: 'Cada niño muestra y explica su proyecto a quienes visitan su mesa, y enciende sus luces.' },
        { titulo: 'Entrega de certificados', texto: 'Al terminar, cada niño recibe su certificado de Pequeño Ingeniero y un aplauso del grupo.' },
        { titulo: 'Recogemos', texto: 'El adulto retira y cuenta todas las pilas antes de que los proyectos vayan a casa.' },
      ],
      codigo: [],
      prueba: {
        queDebePasar: [
          'Cada niño presenta al menos un proyecto con sus palabras.',
          'Las luces de los proyectos encienden durante la feria.',
        ],
        siNoFunciona: [
          { problema: 'Un proyecto no enciende el día de la feria', revisa: 'Lleva pilas y LED de repuesto y revisa todos los proyectos antes de abrir.' },
          { problema: 'Un niño no quiere hablar', revisa: 'Permite que solo muestre y encienda su proyecto mientras el adulto lo acompaña con preguntas sencillas.' },
        ],
      },
      demuestra: {
        reto: 'Cuéntale a tu familia cuál fue tu proyecto favorito y qué te gustaría inventar después.',
        preguntas: [
          { pregunta: '¿Qué necesita la electricidad para encender una luz?', opciones: ['Un camino cerrado', 'Un camino roto'], correcta: 0, explicacion: 'La electricidad pasa solo si el camino está completo.' },
          { pregunta: '¿Qué puede producir electricidad sin acabarse?', opciones: ['El viento', 'Una pila gastada'], correcta: 0, explicacion: 'El viento, el sol y el agua son energías renovables.' },
          { pregunta: '¿Quiénes inventan los robots?', opciones: ['Las personas', 'Otros robots'], correcta: 0, explicacion: 'Las personas diseñan, construyen y programan los robots.' },
        ],
      },
    },
  },
}
