// Guías por etapas de las lecciones de Robótica de 2do EGB (6 a 7 años).
// Kit "3 Robots Elemental": pez robótico, lámpara moderna y carro a radiocontrol.
// Escritas para el docente; toda soldadura y uso de silicona caliente lo hace el adulto.
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

const MOTOR = { nombre: 'Motor pequeño', paraQue: 'Gira cuando recibe electricidad. Es el "músculo" del robot.', cuidado: 'No frenes el eje con los dedos mientras gira: el motor se calienta.' }
const PILAS = { nombre: 'Portapilas con pilas', paraQue: 'Guarda la energía. Tiene un cable rojo (positivo) y uno negro (negativo).', cuidado: 'Los cables rojo y negro nunca deben tocarse entre sí: las pilas se calientan.' }
const INTERRUPTOR = { nombre: 'Interruptor', paraQue: 'Abre y cierra el camino de la electricidad: es el botón de encendido y apagado.' }
const CAUTIN = { nombre: 'Cautín y estaño', paraQue: 'Une los cables de forma firme derritiendo un metal blando llamado estaño.', cuidado: 'Quema. Lo usa solo el adulto. Los niños miran con gafas, sentados y sin acercar las manos.' }
const LED = { nombre: 'LED', paraQue: 'Luz pequeña. La patita larga es el positivo (+) y la corta el negativo (–).', cuidado: 'Si se conecta al revés no enciende. Siempre va con su resistencia.' }
const RESISTENCIA = { nombre: 'Resistencia', paraQue: 'Frena un poco la electricidad para que el LED no se queme. Es el "cinturón de seguridad" del LED.' }

module.exports = {
  levelId: 'segundo-egb',
  programId: 'robotica',
  guias: {
    // ───────────── Módulo 1 · Pez Robótico ─────────────
    'Movimiento Ondulatorio': guia({
      reto: 'Vamos a descubrir cómo nadan los peces para que nuestro robot pueda nadar igual: moviendo la cola de un lado a otro.',
      paraQue: 'Los ingenieros copian a los animales para inventar máquinas. Los robots submarinos que exploran el mar se mueven como peces.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Video o láminas de peces nadando', paraQue: 'Para observar cómo se mueve la cola.' },
        { nombre: 'Tira de cartulina y un recipiente con agua', paraQue: 'Para probar con la mano cómo una cola empuja el agua.' },
        { nombre: 'Hoja y lápices', paraQue: 'Para dibujar el pez robot que construiremos.' },
      ],
      pasos: [
        { titulo: 'Observamos', texto: 'Miren cómo nada un pez. Pregunta: ¿qué parte mueve para avanzar? ¿Hacia dónde la mueve? La cola va de izquierda a derecha, una y otra vez.' },
        { titulo: 'Lo hacemos con el cuerpo', texto: 'De pie, con los brazos juntos al frente como un pez, muevan la cintura de lado a lado. Ese vaivén que se repite se llama movimiento ondulatorio.' },
        { titulo: 'Probamos en el agua', texto: 'Mueve la tira de cartulina de lado a lado dentro del agua. Sientan cómo empuja el agua hacia atrás: por eso el pez avanza hacia adelante.', consejo: 'Prueben despacio y rápido. ¿Cuándo empuja más agua?' },
        { titulo: 'Dibujamos nuestro pez', texto: 'Cada estudiante dibuja su pez robot y marca con una flecha la parte que se moverá.' },
      ],
      pasa: ['Explican que el pez avanza porque la cola empuja el agua.', 'Señalan en su dibujo qué parte se mueve.'],
      falla: [{ problema: 'Creen que el pez avanza con las aletas de los lados', revisa: 'Vuelvan a mirar el video: las aletas de los lados sirven para girar y frenar; la cola es la que empuja.' }],
      extra: 'Busca otro animal que se mueva ondulando (una serpiente, una anguila, un delfín) y cuéntalo en clase.',
      preguntas: [
        q('¿Qué parte mueve el pez para avanzar?', ['Los ojos', 'La cola', 'La boca'], 1, 'La cola empuja el agua hacia atrás y el pez va hacia adelante.'),
        q('El movimiento ondulatorio es…', ['Un movimiento de lado a lado que se repite', 'Quedarse quieto', 'Saltar una vez'], 0, 'Es un vaivén que se repite, como una ola.'),
        q('¿Por qué los ingenieros observan a los animales?', ['Para copiar buenas ideas', 'Para asustarlos'], 0, 'La naturaleza ya resolvió muchos problemas; nosotros aprendemos de ella.'),
      ],
    }),

    'Motor y Mecanismo': guia({
      reto: 'Hoy armamos el "músculo" del pez: un motor que gira y una barra que convierte ese giro en el vaivén de la cola.',
      paraQue: 'Un motor solo sabe girar. Los mecanismos cambian ese giro en otros movimientos: así funcionan los limpiaparabrisas de un carro.',
      duracion: '35 minutos',
      piezas: [MOTOR, PILAS,
        { nombre: 'Barra o biela del kit', paraQue: 'Une el motor con la cola. Cuando el motor gira, la barra empuja y jala la cola.' },
        { nombre: 'Cuerpo y cola del pez', paraQue: 'La estructura donde se monta todo.' },
      ],
      pasos: [
        { titulo: 'Probamos el motor solo', texto: 'Toca los dos cables del portapilas con los dos contactos del motor. ¿Gira? Cambia los cables de lado: ahora gira al revés.', consejo: 'Pega un pedacito de cinta en el eje para ver mejor el giro.' },
        { titulo: 'Montamos el motor', texto: 'Coloca el motor en su lugar dentro del cuerpo del pez, siguiendo la guía del kit. Debe quedar firme, sin bailar.' },
        { titulo: 'Unimos la barra', texto: 'Conecta un extremo de la barra a la pieza que gira con el motor y el otro extremo a la cola.' },
        { titulo: 'Miramos el mecanismo', texto: 'Gira el motor despacio con la mano y observa: el motor da vueltas, pero la cola va de lado a lado.' },
      ],
      pasa: ['El motor gira al conectar las pilas.', 'Al girar el motor, la cola se mueve de un lado a otro sin trabarse.'],
      falla: [
        { problema: 'El motor no gira', revisa: 'Revisa que las pilas estén bien puestas (mira el + y el –) y que los cables toquen el metal del motor.' },
        { problema: 'La cola se traba', revisa: 'La barra está muy apretada o torcida. Aflójala un poco y verifica que nada roce.' },
      ],
      extra: 'Busca en casa un objeto que convierta un giro en otro movimiento (una batidora, un abrelatas) y explica cómo lo hace.',
      preguntas: [
        q('¿Qué hace el motor cuando recibe electricidad?', ['Gira', 'Se enfría', 'Da luz'], 0, 'El motor convierte la electricidad en giro.'),
        q('¿Para qué sirve la barra?', ['Para adornar', 'Para pasar el movimiento del motor a la cola'], 1, 'La barra cambia el giro en un vaivén.'),
        q('Si cambio los cables de lado, el motor…', ['Gira al revés', 'Se apaga para siempre'], 0, 'Al invertir los cables se invierte el sentido de giro.'),
      ],
    }),

    'Impermeabilización': guia({
      reto: 'El agua y la electricidad no se llevan bien. Hoy protegemos el motor y las pilas para que el pez pueda entrar al agua sin dañarse.',
      paraQue: 'Los relojes sumergibles, las linternas de buceo y los submarinos están sellados para que el agua no llegue a sus circuitos.',
      duracion: '40 minutos',
      piezas: [PILAS, INTERRUPTOR, CAUTIN,
        { nombre: 'Silicona', paraQue: 'Tapa las rendijas por donde podría entrar agua.', cuidado: 'Si es silicona caliente, la aplica solo el adulto.' },
      ],
      pasos: [
        { titulo: 'Reglas del taller', texto: 'Antes de empezar: gafas puestas, cabello recogido, sentados, y las manos lejos del cautín. Solo el adulto suelda.' },
        { titulo: 'El adulto suelda el circuito', texto: 'Pilas → interruptor → motor → pilas. Los estudiantes siguen el camino con el dedo en un dibujo y dicen por dónde viaja la electricidad.', consejo: 'Mientras esperan su turno, los niños dibujan el circuito en su cuaderno.' },
        { titulo: 'Probamos en seco', texto: 'Antes de sellar, enciende el interruptor. Si la cola se mueve, el circuito está bien. Nunca se sella algo que no funciona.' },
        { titulo: 'Sellamos', texto: 'Cierra el compartimento del motor y cubre con silicona todas las uniones y el lugar por donde sale la barra. Deja secar el tiempo que indica el envase.' },
      ],
      pasa: ['El pez enciende y apaga con el interruptor.', 'No se ven rendijas abiertas en el compartimento.'],
      falla: [
        { problema: 'Funcionaba y después de sellar ya no', revisa: 'Un cable pudo soltarse al cerrar. Hay que abrir, revisar las soldaduras y volver a sellar.' },
        { problema: 'La silicona tapó la barra y la cola no se mueve', revisa: 'Retira el exceso con cuidado: la barra necesita moverse libremente.' },
      ],
      extra: 'Haz una lista de tres aparatos que NO se pueden mojar y uno que sí, y explica por qué.',
      preguntas: [
        q('¿Por qué sellamos el compartimento del motor?', ['Para que se vea bonito', 'Para que no entre agua al circuito'], 1, 'El agua daña el motor y las pilas.'),
        q('¿Quién usa el cautín?', ['Cualquier niño', 'Solo la persona adulta'], 1, 'El cautín quema; lo maneja el adulto.'),
        q('¿Qué hacemos antes de sellar?', ['Probar que funcione', 'Guardarlo sin probar'], 0, 'Si se sella algo que no funciona, hay que romper el sello para arreglarlo.'),
      ],
    }),

    'Pruebas en Agua': guia({
      reto: '¡Al agua! Hoy probamos si nuestro pez flota, si avanza y qué podemos mejorar para que nade mejor.',
      paraQue: 'Ningún invento sale perfecto a la primera. Los ingenieros prueban, observan y mejoran muchas veces.',
      duracion: '35 minutos',
      piezas: [
        { nombre: 'Pez robótico terminado', paraQue: 'Ya sellado y seco.' },
        { nombre: 'Tina o piscina inflable con agua', paraQue: 'La pista de pruebas.', cuidado: 'Un adulto siempre junto al agua. Piso seco alrededor para no resbalar.' },
        { nombre: 'Hoja de registro', paraQue: 'Para anotar qué pasó en cada prueba.' },
      ],
      pasos: [
        { titulo: 'Prueba 1: ¿flota?', texto: 'Con el pez apagado, ponlo en el agua. ¿Flota derecho, se inclina o se hunde? Anótalo.' },
        { titulo: 'Prueba 2: ¿avanza?', texto: 'Enciéndelo fuera del agua y luego suéltalo. Observa si avanza recto, gira o se queda en el mismo lugar.' },
        { titulo: 'Mejoramos', texto: 'Cambia una sola cosa a la vez (por ejemplo, el tamaño de la cola o dónde va el peso) y vuelve a probar.', consejo: 'Si cambias dos cosas a la vez no sabrás cuál ayudó.' },
        { titulo: 'Competencia amistosa', texto: 'Carrera de un lado al otro de la tina. Al final, sequen bien los peces y apáguenlos.' },
      ],
      pasa: ['El pez flota sin hundirse.', 'Avanza en el agua moviendo la cola.', 'Cada estudiante anota al menos una mejora.'],
      falla: [
        { problema: 'Se hunde o se inclina', revisa: 'El peso está mal repartido. Mueve las pilas hacia el centro o añade un flotador pequeño.' },
        { problema: 'Mueve la cola pero no avanza', revisa: 'La cola es muy pequeña o muy blanda: prueba con una más grande o más firme.' },
        { problema: 'Entró agua', revisa: 'Apaga, saca las pilas, seca todo y vuelve a sellar la rendija cuando esté seco.' },
      ],
      extra: 'Dibuja la versión 2 de tu pez con la mejora que le harías y explica por qué nadaría mejor.',
      preguntas: [
        q('¿Cuántas cosas conviene cambiar en cada prueba?', ['Una sola', 'Todas a la vez'], 0, 'Así sabemos qué cambio fue el que ayudó.'),
        q('Si el pez se inclina hacia un lado, el problema es…', ['El color', 'Cómo está repartido el peso'], 1, 'El peso debe estar equilibrado para que flote derecho.'),
        q('¿Qué hacemos al terminar?', ['Dejarlo mojado y encendido', 'Secarlo y apagarlo'], 1, 'Así cuidamos las pilas y el motor.'),
      ],
    }),

    // ───────────── Módulo 2 · Lámpara Moderna ─────────────
    'Diseño y Planificación': guia({
      reto: 'Vamos a diseñar nuestra propia lámpara. Antes de construir, un buen inventor dibuja su idea y planifica los pasos.',
      paraQue: 'Todo lo que usamos fue dibujado antes de fabricarse: tu silla, tu mochila, una casa. Planificar ahorra errores.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Fotos de distintas lámparas', paraQue: 'De mesa, de techo, linternas, veladores: para tomar ideas.' },
        { nombre: 'Hoja de diseño y colores', paraQue: 'Para el boceto.' },
        { nombre: 'Estructura de la lámpara del kit', paraQue: 'La base y el soporte que vamos a ensamblar.' },
      ],
      pasos: [
        { titulo: 'Miramos lámparas', texto: 'Comparen: ¿para qué sirve cada una? ¿Cuál alumbra todo el cuarto y cuál un solo lugar? Toda lámpara tiene base, soporte y luz.' },
        { titulo: 'Hacemos el boceto', texto: 'Cada estudiante dibuja su lámpara: forma, colores y dónde irán las 5 luces. Escriben para quién es y dónde la usarán.' },
        { titulo: 'Planificamos', texto: 'Ordenen los pasos con números: 1) armar la estructura, 2) hacer el circuito, 3) soldar, 4) decorar.' },
        { titulo: 'Ensamblamos la estructura', texto: 'Armen la base y el soporte siguiendo la guía del kit. Verifiquen que se pare sola sin caerse.' },
      ],
      pasa: ['Cada estudiante tiene su boceto con las 5 luces ubicadas.', 'La estructura está armada y estable.'],
      falla: [{ problema: 'La lámpara se cae', revisa: 'La base es muy pequeña o el peso está muy arriba. Revisa que las piezas estén encajadas hasta el fondo.' }],
      extra: 'Observa las lámparas de tu casa y dibuja la que más te guste. ¿Qué la hace especial?',
      preguntas: [
        q('¿Qué hacemos antes de construir?', ['Dibujar y planificar', 'Pegar todo rápido'], 0, 'El boceto ayuda a pensar antes de gastar materiales.'),
        q('¿Qué parte mantiene de pie a la lámpara?', ['La base', 'El foco'], 0, 'Una base ancha y firme evita que se caiga.'),
        q('Un boceto es…', ['Un dibujo de la idea', 'Una herramienta para soldar'], 0, 'Es el dibujo previo de lo que vamos a construir.'),
      ],
    }),

    'Circuito 5 LEDs Paralelo': guia({
      reto: 'Hoy encendemos 5 LEDs de colores al mismo tiempo. El secreto es darle a cada LED su propio camino: eso se llama circuito en paralelo.',
      paraQue: 'Las luces de tu casa están en paralelo: si se quema un foco, los demás siguen encendidos.',
      duracion: '40 minutos',
      piezas: [LED, RESISTENCIA, PILAS,
        { nombre: 'Cables o pinzas cocodrilo', paraQue: 'Para probar el circuito sin soldar todavía.' },
      ],
      pasos: [
        { titulo: 'Un LED con su resistencia', texto: 'Arma el primer camino: del positivo de las pilas a la resistencia, de la resistencia a la patita larga del LED, y de la patita corta al negativo. ¡Enciende!', consejo: 'Regla del nivel: un LED nunca va sin su resistencia.' },
        { titulo: 'El segundo camino', texto: 'Sin desarmar el primero, arma otro igual al lado: otra resistencia y otro LED, conectados a los mismos dos cables de las pilas.' },
        { titulo: 'Completamos los 5', texto: 'Repite hasta tener 5 caminos. Todos los positivos se juntan en una línea y todos los negativos en otra, como los peldaños de una escalera.' },
        { titulo: 'El experimento', texto: 'Desconecta un LED. ¿Qué pasa con los otros cuatro? Siguen encendidos, porque cada uno tiene su propio camino.' },
        { titulo: 'Contamos', texto: '¿Cuántas resistencias usamos? Una por cada LED: 5 LEDs, 5 resistencias.' },
      ],
      pasa: ['Los 5 LEDs encienden a la vez.', 'Al quitar uno, los demás siguen encendidos.'],
      falla: [
        { problema: 'Un LED no enciende', revisa: 'Probablemente está al revés: la patita larga va hacia el positivo. Dale la vuelta.' },
        { problema: 'No enciende ninguno', revisa: 'Revisa las pilas y que las dos líneas (positiva y negativa) lleguen hasta el portapilas.' },
        { problema: 'Un color brilla menos', revisa: 'Es normal: cada color necesita una cantidad distinta de energía.' },
      ],
      extra: 'Dibuja el circuito como una escalera: dos líneas largas y 5 peldaños, cada uno con su LED y su resistencia.',
      preguntas: [
        q('En paralelo, si se apaga un LED…', ['Se apagan todos', 'Los demás siguen encendidos'], 1, 'Cada LED tiene su propio camino.'),
        q('¿Para qué sirve la resistencia?', ['Para proteger al LED', 'Para que brille más'], 0, 'Frena la electricidad para que el LED no se queme.'),
        q('Para 5 LEDs necesitamos…', ['1 resistencia', '5 resistencias'], 1, 'Una resistencia por cada LED.'),
      ],
    }),

    'Soldadura Compleja': guia({
      reto: 'Hoy el circuito de la lámpara queda fijo para siempre. El adulto suelda y tú eres el ingeniero ayudante: preparas, ordenas y revisas.',
      paraQue: 'Dentro de un televisor o un teléfono hay cientos de soldaduras que mantienen unidas las piezas.',
      duracion: '45 minutos',
      piezas: [CAUTIN, LED, RESISTENCIA,
        { nombre: 'Gafas de protección', paraQue: 'Protegen los ojos de salpicaduras.', cuidado: 'Obligatorias para todos los que estén en la mesa.' },
        { nombre: 'Base de la lámpara', paraQue: 'Donde quedan montados los 5 LEDs.' },
      ],
      pasos: [
        { titulo: 'Reglas de seguridad', texto: 'Un adulto por cada dos estudiantes. Gafas puestas, sentados, cabello recogido, mesa despejada. El cautín solo descansa en su soporte.' },
        { titulo: 'Preparamos las piezas', texto: 'El estudiante coloca cada LED en su lugar con la patita larga hacia el lado positivo y le acerca su resistencia. El adulto revisa antes de soldar.', consejo: 'Marca el lado positivo con un punto rojo para no confundirte.' },
        { titulo: 'El adulto suelda', texto: 'Se suelda un LED a la vez. El estudiante cuenta en voz alta cuántas uniones van y avisa cuál sigue.' },
        { titulo: 'Inspección', texto: 'Con el cautín ya apagado y frío, revisen juntos: cada soldadura debe verse brillante y con forma de gotita, sin tocar a la de al lado.' },
        { titulo: 'Prueba final', texto: 'Conecta las pilas: deben encender los 5 LEDs.' },
      ],
      pasa: ['Los 5 LEDs encienden con las pilas.', 'Ninguna soldadura toca a otra.', 'Nadie tocó el cautín caliente.'],
      falla: [
        { problema: 'Un LED no enciende después de soldar', revisa: 'Puede estar al revés o tener una soldadura opaca y floja. El adulto la repasa.' },
        { problema: 'Dos soldaduras se tocan', revisa: 'Eso causa un cortocircuito. El adulto separa el estaño sobrante.' },
      ],
      extra: 'Dibuja las 3 reglas de seguridad más importantes del taller de soldadura.',
      preguntas: [
        q('¿Quién suelda?', ['El adulto', 'El estudiante más rápido'], 0, 'El cautín alcanza temperaturas que queman gravemente.'),
        q('Una buena soldadura se ve…', ['Brillante y como una gotita', 'Opaca y con grietas'], 0, 'Brillante significa que el estaño se unió bien.'),
        q('¿Qué nos ponemos antes de empezar?', ['Gafas de protección', 'Guantes de lana'], 0, 'Las gafas cuidan los ojos.'),
      ],
    }),

    'Decoración y Exposición': guia({
      reto: 'Terminamos la lámpara: le hacemos una pantalla, la decoramos y la presentamos en nuestra galería.',
      paraQue: 'Un buen producto funciona bien y además se ve bien. Explicar tu trabajo a otros es parte de ser inventor.',
      duracion: '35 minutos',
      piezas: [
        { nombre: 'Lámpara con el circuito soldado', paraQue: 'La base del trabajo de hoy.' },
        { nombre: 'Papel vegetal, cartulina o vaso plástico', paraQue: 'Para la pantalla que suaviza la luz.' },
        { nombre: 'Pinturas, marcadores y goma', paraQue: 'Para decorar la base.', cuidado: 'La pintura no debe tocar los LEDs ni las soldaduras.' },
      ],
      pasos: [
        { titulo: 'Hacemos la pantalla', texto: 'Recorta y arma la pantalla según tu boceto. Pruébala sobre los LEDs encendidos: ¿la luz se ve más suave?' },
        { titulo: 'Decoramos la base', texto: 'Pinta y decora la base. Deja libres el interruptor y el lugar de las pilas.' },
        { titulo: 'Comparamos con el boceto', texto: 'Pon tu lámpara junto a tu dibujo. ¿Quedó parecida? ¿Qué cambiaste y por qué?' },
        { titulo: 'Galería de lámparas', texto: 'Con el aula un poco oscura, cada estudiante enciende su lámpara y cuenta: cómo se llama, cómo funciona y qué fue lo más difícil.' },
      ],
      pasa: ['La lámpara enciende con su pantalla puesta.', 'Cada estudiante explica que sus LEDs están en paralelo.'],
      falla: [{ problema: 'La pantalla tapa demasiado la luz', revisa: 'Usa un papel más delgado o haz pequeños agujeros para dejar salir la luz.' }],
      extra: 'Explica a tu familia cómo funciona tu lámpara y pregúntales dónde les gustaría ponerla.',
      preguntas: [
        q('¿Para qué sirve la pantalla de una lámpara?', ['Para suavizar la luz', 'Para guardar las pilas'], 0, 'La pantalla reparte la luz y evita que moleste a los ojos.'),
        q('¿Cómo están conectados nuestros 5 LEDs?', ['En paralelo', 'Sin conectar'], 0, 'Cada LED tiene su propio camino.'),
        q('Al decorar, ¿qué no debemos cubrir?', ['El interruptor y las pilas', 'La base'], 0, 'Deben quedar libres para encender y cambiar pilas.'),
      ],
    }),

    // ───────────── Módulo 3 · Carro RC ─────────────
    'Control Remoto Conceptos': guia({
      reto: 'Hoy descubrimos cómo un control puede mover un carro sin tocarlo y sin cables: con ondas de radio invisibles.',
      paraQue: 'Los drones, los juguetes a control remoto y los portones eléctricos funcionan así: alguien envía una orden y la máquina la recibe.',
      duracion: '20 minutos',
      piezas: [
        { nombre: 'Control remoto del kit', paraQue: 'Es el emisor: envía las órdenes.' },
        { nombre: 'Carro o receptor del kit', paraQue: 'Es el receptor: escucha las órdenes y las cumple.' },
        { nombre: 'Tarjetas de órdenes', paraQue: 'Adelante, atrás, izquierda, derecha, alto.' },
      ],
      pasos: [
        { titulo: 'Conversamos', texto: '¿Qué cosas en casa se manejan con un control? ¿Cómo sabe el televisor qué botón apretaste si no hay cable?' },
        { titulo: 'Ondas invisibles', texto: 'Explica: el control lanza una señal que viaja por el aire, como cuando llamas a un amigo de lejos. No la vemos, pero llega.' },
        { titulo: 'Juego emisor y receptor', texto: 'En parejas: uno es el control y muestra una tarjeta; el otro es el carro y obedece. Luego cambian.', consejo: 'Prueben alejándose: llega un momento en que el "carro" ya no distingue la orden. Eso es el alcance.' },
        { titulo: 'Miramos las piezas reales', texto: 'Identifiquen en el kit cuál es el emisor (control) y cuál el receptor (la tarjeta que va en el carro).' },
      ],
      pasa: ['Distinguen quién envía la orden y quién la recibe.', 'Explican que la señal viaja por el aire sin cables.'],
      extra: 'Cuenta cuántos controles remotos hay en tu casa y qué maneja cada uno.',
      preguntas: [
        q('¿Quién envía la orden?', ['El control (emisor)', 'Las ruedas'], 0, 'El control emite la señal.'),
        q('¿Cómo viaja la orden hasta el carro?', ['Por ondas de radio en el aire', 'Por un cable muy largo'], 0, 'Las ondas de radio son invisibles y viajan por el aire.'),
        q('Si me alejo demasiado, el carro…', ['Deja de recibir la señal', 'Corre más rápido'], 0, 'Toda señal tiene un alcance máximo.'),
      ],
    }),

    'Sistema de Dirección': guia({
      reto: 'Un carro que solo va recto no llega muy lejos. Hoy armamos la dirección: el mecanismo que gira las ruedas delanteras.',
      paraQue: 'Es lo mismo que hace el volante de un carro o el manubrio de tu bicicleta.',
      duracion: '40 minutos',
      piezas: [
        { nombre: 'Servomotor', paraQue: 'Un motor especial que no da vueltas completas: gira hasta el ángulo que se le pide y se queda ahí.', cuidado: 'No lo fuerces con la mano: sus engranajes internos son delicados.' },
        { nombre: 'Ruedas delanteras y eje de dirección', paraQue: 'Las ruedas que giran a izquierda y derecha.' },
        { nombre: 'Chasis del carro', paraQue: 'El "esqueleto" donde se monta todo.' },
      ],
      pasos: [
        { titulo: 'Jugamos con los ángulos', texto: 'De pie, brazo al frente: eso es "centro". Giren el brazo un poco a la izquierda, al centro, un poco a la derecha. Un ángulo dice cuánto giramos.' },
        { titulo: 'Montamos el servo', texto: 'Coloca el servomotor en su lugar del chasis según la guía del kit y sujétalo firme.' },
        { titulo: 'Unimos las ruedas', texto: 'Conecta el brazo del servo con el eje de dirección. Cuando el servo gire, las dos ruedas delanteras deben girar juntas.' },
        { titulo: 'Calibramos el centro', texto: 'Con el servo en su posición central, las ruedas deben apuntar derecho hacia adelante. Si apuntan torcidas, suelta el brazo y vuelve a colocarlo.', consejo: 'Mira el carro desde arriba para comprobar que las ruedas estén rectas.' },
      ],
      pasa: ['Las ruedas delanteras giran juntas a izquierda y derecha.', 'En el centro, apuntan derecho.'],
      falla: [
        { problema: 'El carro siempre se va hacia un lado', revisa: 'El centro está mal calibrado: recoloca el brazo del servo con las ruedas rectas.' },
        { problema: 'Las ruedas casi no giran', revisa: 'Algo las roza o la unión con el servo está floja.' },
      ],
      extra: 'En tu bicicleta o en un carrito de juguete, observa qué ruedas giran para doblar: ¿las de adelante o las de atrás?',
      preguntas: [
        q('¿Qué hace el servomotor en el carro?', ['Gira las ruedas delanteras', 'Enciende luces'], 0, 'El servo mueve la dirección.'),
        q('Un ángulo nos dice…', ['Cuánto giramos', 'Cuánto pesa algo'], 0, 'El ángulo mide la cantidad de giro.'),
        q('Calibrar el centro sirve para…', ['Que el carro vaya recto', 'Que el carro salte'], 0, 'Con las ruedas rectas en el centro, el carro no se desvía.'),
      ],
    }),

    'Circuito RC Completo': guia({
      reto: 'Hoy unimos todo: pilas, receptor, motor y dirección. Al terminar, el carro obedecerá a tu control.',
      paraQue: 'Así se arma cualquier máquina a control remoto: una fuente de energía, un receptor que escucha y motores que actúan.',
      duracion: '45 minutos',
      piezas: [PILAS, MOTOR, CAUTIN,
        { nombre: 'Receptor de radio', paraQue: 'Escucha las órdenes del control y enciende el motor o mueve la dirección.' },
        { nombre: 'Control remoto', paraQue: 'El emisor, con sus propias pilas.' },
      ],
      pasos: [
        { titulo: 'Seguimos el plano', texto: 'Con el plano del kit, recorre con el dedo: de las pilas al receptor, del receptor al motor de avance y del receptor a la dirección.' },
        { titulo: 'El adulto suelda', texto: 'Con las mismas reglas de seguridad de siempre, el adulto suelda las uniones que indica el plano. El estudiante va marcando en el plano cada cable ya conectado.' },
        { titulo: 'Primera prueba, ruedas al aire', texto: 'Levanta el carro para que las ruedas no toquen la mesa. Enciéndelo y prueba cada botón: adelante, atrás, izquierda, derecha.', consejo: 'Probar con las ruedas al aire evita que el carro salga disparado de la mesa.' },
        { titulo: 'Ordenamos los cables', texto: 'Acomoda y sujeta los cables para que ninguno roce las ruedas ni quede colgando.' },
        { titulo: 'Prueba en el piso', texto: 'Ahora sí: carro al piso y a manejar despacio.' },
      ],
      pasa: ['El carro avanza y retrocede con el control.', 'Gira a izquierda y derecha.', 'Ningún cable roza las ruedas.'],
      falla: [
        { problema: 'No responde a nada', revisa: 'Revisa las pilas del carro y también las del control, y que el interruptor del carro esté encendido.' },
        { problema: 'Avanza cuando pido retroceder', revisa: 'Los dos cables del motor están invertidos: el adulto los cambia de lado.' },
        { problema: 'Responde solo de cerca', revisa: 'Pilas gastadas en el control o la antena del receptor está doblada o tapada.' },
      ],
      extra: 'Dibuja el camino completo de una orden: desde tu dedo en el botón hasta la rueda que gira.',
      preguntas: [
        q('¿Qué pieza escucha las órdenes del control?', ['El receptor', 'La rueda'], 0, 'El receptor recibe la señal y activa los motores.'),
        q('¿Por qué probamos primero con las ruedas al aire?', ['Para que el carro no se caiga de la mesa', 'Para gastar pilas'], 0, 'Es más seguro probar sin que el carro se mueva.'),
        q('Si el carro va al revés de lo que pido…', ['Los cables del motor están invertidos', 'Hay que pintarlo'], 0, 'Invertir los cables invierte el giro del motor.'),
      ],
    }),

    'Carreras y Competencias': guia({
      reto: 'Día de pista. Vamos a manejar nuestro carro por un circuito con curvas y a mejorar nuestro control en cada intento.',
      paraQue: 'Manejar a distancia exige práctica y precisión, igual que pilotar un dron o un robot explorador.',
      duracion: '40 minutos',
      piezas: [
        { nombre: 'Carro RC terminado y control', paraQue: 'Con pilas cargadas.' },
        { nombre: 'Cinta de papel y conos o vasos', paraQue: 'Para marcar la pista y el slalom.' },
        { nombre: 'Cronómetro y tabla de tiempos', paraQue: 'Para registrar cada intento.' },
      ],
      pasos: [
        { titulo: 'Armamos la pista', texto: 'Marquen con cinta una pista con salida, dos curvas y meta. Aparte, una fila de 4 conos para el slalom (zigzag).' },
        { titulo: 'Vuelta de reconocimiento', texto: 'Cada piloto da una vuelta lenta sin cronómetro para conocer la pista.' },
        { titulo: 'Vueltas cronometradas', texto: 'Dos intentos por piloto. Un compañero toma el tiempo y lo anota. Salirse de la pista suma 3 segundos.' },
        { titulo: 'Slalom', texto: 'Pasar en zigzag entre los conos sin tocarlos. Aquí gana la precisión, no la velocidad.', consejo: 'Ir más despacio en las curvas casi siempre da mejor tiempo total.' },
        { titulo: 'Cierre', texto: 'Cada piloto cuenta qué mejoró entre su primer y segundo intento. Se aplaude a todos.' },
      ],
      pasa: ['Cada estudiante completa la pista manejando su carro.', 'Comparan sus dos tiempos y dicen qué cambiaron.'],
      falla: [
        { problema: 'El carro se va de lado en las rectas', revisa: 'Vuelve a calibrar el centro de la dirección.' },
        { problema: 'Pierde fuerza', revisa: 'Pilas gastadas: cámbialas antes del siguiente intento.' },
      ],
      extra: 'Diseña en una hoja tu propia pista con tres obstáculos y preséntala al curso.',
      preguntas: [
        q('En el slalom gana quien…', ['Es más preciso', 'Choca más conos'], 0, 'Se trata de controlar bien el carro.'),
        q('¿Para qué anotamos los tiempos?', ['Para ver si mejoramos', 'Para llenar la hoja'], 0, 'Medir nos permite comparar y mejorar.'),
        q('En una curva conviene…', ['Bajar la velocidad', 'Acelerar al máximo'], 0, 'Más despacio se controla mejor el giro.'),
      ],
    }),
  },
}
