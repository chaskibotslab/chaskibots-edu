/**
 * COPOL — lecciones de los kits de madera (sin programación):
 *   Inicial 1: generador eólico      Inicial 2: carro solar
 *   4to EGB:   tragamonedas          5to EGB:   carro radiocontrolado
 *
 * OJO: se escribieron sin tener a la vista la lista de piezas de cada caja.
 * Describen el armado típico de estos kits y remiten al instructivo de la caja
 * para el orden exacto de las piezas. El docente debe revisarlas contra el kit
 * real y corregirlas en /admin/academia.
 *
 * Cada proyecto: [slug, título, tipo, orden, descripción, objetivos, guía]
 */

const PILAS = 'Las pilas las entrega y las recoge el docente. Si una pila se calienta, se saca de inmediato.'

const pregunta = (pregunta, opciones, explicacion) => ({ pregunta, opciones, correcta: 0, explicacion })

// ---------------------------------------------------------------------------
// Inicial 1 — Generador eólico
// ---------------------------------------------------------------------------
const EOLICO = [
  ['eolico-conoce-las-piezas', 'Conoce las piezas del generador de viento', 'practica', -2,
    'Antes de armar, los niños reconocen cada pieza de madera del generador de viento y dicen para qué creen que sirve.',
    ['Reconocer y nombrar las piezas del kit.', 'Separar las piezas por forma y tamaño.'],
    {
      reto: { texto: 'Vas a conocer las piezas de tu molino de viento. ¡Cada una tiene un trabajo!', paraQue: 'Los molinos de viento de verdad usan el viento para hacer luz para las casas.', duracion: '20 minutos' },
      piezas: [
        { nombre: 'Piezas de madera', paraQue: 'Forman la torre y la base del molino.', cuidado: 'Se sacan de la plancha con cuidado, empujando con el dedo. Si una pieza no sale, la ayuda el profe.' },
        { nombre: 'Aspas (hélice)', paraQue: 'Son los brazos que giran cuando sopla el viento.', cuidado: 'Son delgadas: no se doblan ni se muerden.' },
        { nombre: 'Motorcito', paraQue: 'Cuando las aspas lo hacen girar, fabrica un poquito de electricidad.' },
        { nombre: 'Lucecita (LED)', paraQue: 'Se enciende con la electricidad que fabrica el motorcito.' },
      ],
      pasos: [
        { titulo: 'Abre la caja', texto: 'Saca todas las piezas y ponlas sobre la mesa, sin que se monten unas sobre otras.' },
        { titulo: 'Busca las que giran', texto: 'Encuentra las aspas. Hazlas girar con el dedo, como un ventilador.' },
        { titulo: 'Busca la luz', texto: 'Encuentra la lucecita y el motorcito con sus dos cablecitos.' },
        { titulo: 'Ordena', texto: 'Pon juntas las piezas grandes y juntas las pequeñas. Cuenta cuántas hay de cada grupo.', consejo: 'El docente compara con el dibujo del instructivo de la caja que no falte ninguna pieza.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Todas las piezas están sobre la mesa, ordenadas.', 'Cada niño señala las aspas, el motorcito y la lucecita.'], siNoFunciona: [{ problema: 'Falta una pieza', revisa: 'Revisa dentro de la caja y debajo de la plancha de madera. Si no aparece, avisa al docente.' }] },
      demuestra: { reto: 'Muéstrale a un amigo cuál pieza gira con el viento.', preguntas: [
        pregunta('¿Qué pieza gira con el viento?', ['Las aspas', 'La base', 'La caja'], 'Las aspas son como los brazos de un ventilador.'),
        pregunta('¿Qué se enciende al final?', ['La lucecita', 'La madera', 'El cable'], 'La lucecita se enciende con la electricidad.'),
      ] },
    }],
  ['eolico-arma-la-torre', 'Arma la torre y las aspas', 'practica', -1,
    'Los niños arman la base y la torre de madera, y colocan las aspas en el eje del motorcito, con ayuda del docente.',
    ['Encajar piezas de madera siguiendo un dibujo.', 'Trabajar con cuidado y por turnos.'],
    {
      reto: { texto: 'Vas a armar la torre de tu molino y a ponerle sus aspas.', paraQue: 'Una torre alta atrapa mejor el viento.', duracion: '30 minutos' },
      piezas: [
        { nombre: 'Base y torre de madera', paraQue: 'Sostienen el molino de pie.' },
        { nombre: 'Motorcito', paraQue: 'Va arriba de la torre. En su puntita (el eje) se ponen las aspas.', cuidado: 'Los cablecitos no se jalan.' },
        { nombre: 'Aspas', paraQue: 'Se encajan en la puntita del motorcito.' },
      ],
      pasos: [
        { titulo: 'Arma la base', texto: 'Encaja las piezas de la base como muestra el dibujo del instructivo. Deben quedar firmes sobre la mesa.' },
        { titulo: 'Levanta la torre', texto: 'Encaja la torre en la base. Empuja despacio hasta que no se mueva.', consejo: 'Si una pieza queda floja, el docente pone una gotita de goma blanca.' },
        { titulo: 'Pon el motorcito arriba', texto: 'Coloca el motorcito en su lugar, en lo alto de la torre, con la puntita hacia afuera.' },
        { titulo: 'Pon las aspas', texto: 'Empuja las aspas en la puntita del motorcito hasta que queden apretadas.' },
        { titulo: 'Prueba que giren', texto: 'Dale un empujoncito a las aspas con el dedo. Deben girar libres, sin rozar la torre.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['El molino se queda de pie solo.', 'Las aspas giran al empujarlas con el dedo.'], siNoFunciona: [
        { problema: 'El molino se cae', revisa: 'La base no está bien encajada. Aprieta cada unión otra vez.' },
        { problema: 'Las aspas rozan la torre', revisa: 'Sácalas un poquito hacia afuera, sin sacarlas del todo.' },
      ] },
      demuestra: { reto: 'Sopla suave y cuenta cuántas vueltas dan las aspas.', preguntas: [
        pregunta('¿Dónde se ponen las aspas?', ['En la puntita del motorcito', 'En la base', 'En el suelo'], 'Así, cuando las aspas giran, el motorcito también gira.'),
        pregunta('¿Para qué sirve la base?', ['Para que el molino no se caiga', 'Para que gire', 'Para que brille'], 'La base lo mantiene de pie.'),
      ] },
    }],
  ['el-generador-eolico', 'El generador de viento enciende una luz', 'principal', 1,
    'Con el molino armado, los niños conectan la lucecita y descubren que el viento puede encender una luz.',
    ['Descubrir que el viento puede producir electricidad.', 'Comparar: viento suave, viento fuerte y sin viento.'],
    {
      reto: { texto: '¡Vas a encender una luz usando solo viento!', paraQue: 'Así se hace electricidad limpia: sin humo y sin gastar pilas.', duracion: '30 minutos' },
      piezas: [
        { nombre: 'Molino armado', paraQue: 'Atrapa el viento con sus aspas.' },
        { nombre: 'Lucecita (LED)', paraQue: 'Se enciende cuando el motorcito gira rápido.', cuidado: 'Tiene una patita larga y una corta. Si no enciende, se le da la vuelta.' },
        { nombre: 'Viento', paraQue: 'Un ventilador, un secador en frío o soplar fuerte.', cuidado: 'El ventilador y el secador solo los maneja el docente.' },
      ],
      pasos: [
        { titulo: 'Conecta la lucecita', texto: 'Une los dos cablecitos del motorcito con las dos patitas de la lucecita, como muestra el instructivo.', consejo: 'En muchos kits la lucecita ya viene conectada: en ese caso solo se revisa que no esté suelta.' },
        { titulo: 'Sopla suave', texto: 'Sopla despacito hacia las aspas. Mira qué pasa con la luz.' },
        { titulo: 'Dale viento fuerte', texto: 'El docente acerca el ventilador. Mira las aspas y mira la luz.' },
        { titulo: 'Quita el viento', texto: 'El docente apaga el ventilador. Mira qué pasa con la luz cuando las aspas se detienen.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Con viento fuerte, las aspas giran rápido y la lucecita se enciende.', 'Sin viento, la lucecita se apaga.'], siNoFunciona: [
        { problema: 'Las aspas giran pero la luz no enciende', revisa: 'Dale la vuelta a la lucecita (cambia las patitas de cable). Si sigue apagada, acerca más el ventilador: necesita girar rápido.' },
        { problema: 'Las aspas no giran', revisa: 'Pon el molino de frente al viento y revisa que las aspas no rocen la torre.' },
      ] },
      demuestra: { reto: 'Dibuja tu molino con la luz encendida y cuéntale a tu familia de dónde salió la electricidad.', preguntas: [
        pregunta('¿Qué enciende la luz del molino?', ['El viento', 'Una pila', 'El sol'], 'El viento hace girar las aspas y el motorcito fabrica la electricidad.'),
        pregunta('¿Qué pasa cuando no hay viento?', ['La luz se apaga', 'La luz brilla más', 'El molino se rompe'], 'Sin viento las aspas no giran y no hay electricidad.'),
      ] },
    }],
]

// ---------------------------------------------------------------------------
// Inicial 2 — Carro solar
// ---------------------------------------------------------------------------
const SOLAR = [
  ['solar-conoce-las-piezas', 'Conoce las piezas del carro solar', 'practica', -2,
    'Los niños reconocen las piezas del carro solar: el panel, el motorcito, las ruedas y el cuerpo de madera.',
    ['Reconocer y nombrar las piezas del kit.', 'Descubrir que el panel solar «come» luz.'],
    {
      reto: { texto: 'Vas a conocer las piezas de un carro que camina con la luz del sol.', paraQue: 'Hay casas y carros de verdad que usan paneles solares para tener electricidad.', duracion: '20 minutos' },
      piezas: [
        { nombre: 'Panel solar', paraQue: 'Es la placa oscura y brillante. Cuando le da la luz, fabrica electricidad.', cuidado: 'No se raya ni se dobla. Se agarra por los bordes.' },
        { nombre: 'Motorcito', paraQue: 'Hace girar las ruedas.', cuidado: 'Los cablecitos no se jalan.' },
        { nombre: 'Ruedas y ejes', paraQue: 'Los ejes son los palitos que atraviesan el carro; en sus puntas van las ruedas.' },
        { nombre: 'Cuerpo de madera', paraQue: 'Es el carro: sostiene todo lo demás.' },
      ],
      pasos: [
        { titulo: 'Abre la caja', texto: 'Saca todas las piezas y ponlas sobre la mesa.' },
        { titulo: 'Busca el panel', texto: 'Encuentra la placa oscura y brillante. Ese es el panel solar.' },
        { titulo: 'Cuenta las ruedas', texto: 'Cuenta cuántas ruedas tiene tu carro.' },
        { titulo: 'Ordena', texto: 'Pon las piezas de madera a un lado y las demás al otro.', consejo: 'El docente compara con el dibujo del instructivo que no falte ninguna pieza.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Todas las piezas están sobre la mesa, ordenadas.', 'Cada niño señala el panel solar, el motorcito y las ruedas.'], siNoFunciona: [{ problema: 'Falta una pieza', revisa: 'Revisa dentro de la caja y debajo de la plancha de madera. Si no aparece, avisa al docente.' }] },
      demuestra: { reto: 'Muéstrale a un amigo cuál pieza necesita luz para trabajar.', preguntas: [
        pregunta('¿Qué pieza necesita luz?', ['El panel solar', 'La rueda', 'La madera'], 'El panel convierte la luz en electricidad.'),
        pregunta('¿Qué pieza hace girar las ruedas?', ['El motorcito', 'El panel', 'La caja'], 'El motorcito gira cuando recibe electricidad.'),
      ] },
    }],
  ['solar-arma-el-carro', 'Arma el carro', 'practica', -1,
    'Los niños arman el cuerpo de madera, colocan los ejes y las ruedas, y ponen el motorcito y el panel en su lugar.',
    ['Encajar piezas de madera siguiendo un dibujo.', 'Comprobar que las ruedas giran libres.'],
    {
      reto: { texto: 'Vas a armar tu carro: su cuerpo, sus ruedas y su panel.', paraQue: 'Un carro bien armado rueda derecho y no se traba.', duracion: '35 minutos' },
      piezas: [
        { nombre: 'Cuerpo de madera', paraQue: 'Sostiene las ruedas, el motorcito y el panel.' },
        { nombre: 'Ejes y ruedas', paraQue: 'Hacen que el carro ruede.' },
        { nombre: 'Motorcito con su engranaje o polea', paraQue: 'Mueve las ruedas de atrás.' },
        { nombre: 'Panel solar', paraQue: 'Va arriba, mirando al cielo.' },
      ],
      pasos: [
        { titulo: 'Arma el cuerpo', texto: 'Encaja las piezas de madera del carro como muestra el dibujo del instructivo.' },
        { titulo: 'Pon los ejes y las ruedas', texto: 'Pasa cada palito (eje) por sus agujeros y empuja una rueda en cada punta.', consejo: 'Las ruedas no deben apretar el cuerpo del carro: deja un espacio del ancho de una uña.' },
        { titulo: 'Coloca el motorcito', texto: 'Pon el motorcito en su lugar para que mueva las ruedas de atrás, como en el dibujo.' },
        { titulo: 'Coloca el panel', texto: 'Pon el panel solar arriba del carro, con la cara oscura mirando hacia el cielo.' },
        { titulo: 'Une los cablecitos', texto: 'El docente une los dos cablecitos del panel con los dos del motorcito, como indica el instructivo.' },
        { titulo: 'Rueda de prueba', texto: 'Empuja el carro con la mano sobre la mesa. Debe rodar derecho y sin trabarse.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Al empujarlo con la mano, el carro rueda derecho.', 'Ninguna rueda roza el cuerpo del carro.'], siNoFunciona: [
        { problema: 'El carro se va de lado', revisa: 'Un eje está chueco o una rueda está más metida que la otra. Empareja las ruedas.' },
        { problema: 'Una rueda no gira', revisa: 'Está apretando el cuerpo del carro. Sepárala un poquito.' },
      ] },
      demuestra: { reto: 'Haz rodar tu carro hasta un amigo empujándolo una sola vez.', preguntas: [
        pregunta('¿Hacia dónde mira el panel?', ['Hacia el cielo', 'Hacia el piso', 'Hacia atrás'], 'Así le llega la luz.'),
        pregunta('¿Qué pasa si una rueda aprieta el carro?', ['El carro se traba', 'El carro vuela', 'Nada'], 'Las ruedas necesitan espacio para girar.'),
      ] },
    }],
  ['el-carro-solar', 'El carro solar corre con el sol', 'principal', 1,
    'Los niños llevan el carro al sol y descubren que se mueve solo; comparan sol, sombra y la mano tapando el panel.',
    ['Descubrir que la luz del sol puede mover un carro.', 'Comparar: sol, sombra y panel tapado.'],
    {
      reto: { texto: '¡Vas a hacer caminar un carro usando solo la luz del sol!', paraQue: 'El sol nos da energía gratis y limpia todos los días.', duracion: '30 minutos' },
      piezas: [
        { nombre: 'Carro solar armado', paraQue: 'Corre cuando su panel recibe luz fuerte.' },
        { nombre: 'Sol', paraQue: 'Es quien da la energía.', cuidado: 'Se sale al patio con gorra. Nunca se mira directo al sol.' },
      ],
      pasos: [
        { titulo: 'Sal al sol', texto: 'Lleva tu carro al patio, a un piso liso. Ponlo en el suelo con el panel mirando al sol.' },
        { titulo: 'Suéltalo', texto: 'Suelta el carro y mira cómo empieza a caminar solo.' },
        { titulo: 'Tapa el panel', texto: 'Pon tu mano sobre el panel, sin tocarlo. Mira qué pasa con el carro.' },
        { titulo: 'Llévalo a la sombra', texto: 'Pon el carro en la sombra y mira si camina.', consejo: 'En un día nublado se puede usar una lámpara fuerte muy cerca del panel; la maneja el docente.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Al sol, el carro camina solo.', 'Al tapar el panel o en la sombra, el carro se detiene.'], siNoFunciona: [
        { problema: 'El carro no se mueve al sol', revisa: 'Levántalo: si las ruedas giran en el aire, el piso es muy áspero; prueba en un piso liso. Si no giran, el docente revisa que los cablecitos estén bien unidos.' },
        { problema: 'El carro va hacia atrás', revisa: 'El docente intercambia los dos cablecitos del motorcito.' },
      ] },
      demuestra: { reto: 'Haz una carrera: ¿qué carro llega más lejos al sol?', preguntas: [
        pregunta('¿Qué le da energía al carro?', ['El sol', 'Una pila', 'El viento'], 'El panel convierte la luz del sol en electricidad.'),
        pregunta('¿Qué pasa si tapas el panel?', ['El carro se detiene', 'El carro corre más', 'Se enciende una luz'], 'Sin luz, el panel no fabrica electricidad.'),
      ] },
    }],
]

// ---------------------------------------------------------------------------
// 4to EGB — Tragamonedas
// ---------------------------------------------------------------------------
const TRAGAMONEDAS = [
  ['tragamonedas-piezas-y-plano', 'Las piezas y el plano', 'practica', -3,
    'Antes de armar, se revisa que el kit esté completo y se lee el plano: qué pieza va con cuál y en qué orden.',
    ['Leer un plano de armado e identificar cada pieza.', 'Organizar el puesto de trabajo antes de construir.'],
    {
      reto: { texto: 'Vas a preparar todo para construir tu tragamonedas: revisar las piezas y entender el plano.', paraQue: 'En cualquier taller, primero se revisa el material y el plano; después se arma. Así no sobran ni faltan piezas.', duracion: '30 minutos' },
      piezas: [
        { nombre: 'Planchas de madera cortadas', paraQue: 'De ellas salen las paredes, la tapa y las piezas del mecanismo.', cuidado: 'Saca cada pieza empujando desde atrás. Si un borde quedó áspero, líjalo suave.' },
        { nombre: 'Piezas del mecanismo', paraQue: 'Son las que se mueven cuando entra la moneda: palanca, rampa, ejes o engranajes, según tu kit.' },
        { nombre: 'Tornillos, ligas o pasadores', paraQue: 'Unen las piezas que giran o que deben quedar firmes.', cuidado: 'Son pequeños: guárdalos en la tapa de la caja para no perderlos.' },
        { nombre: 'Instructivo (plano)', paraQue: 'Muestra el orden del armado, paso por paso.' },
      ],
      pasos: [
        { titulo: 'Saca y separa', texto: 'Saca las piezas de las planchas y ponlas sobre la mesa. Separa las grandes (paredes y tapas) de las pequeñas (mecanismo).' },
        { titulo: 'Cuenta contra el plano', texto: 'Compara tus piezas con la lista o el dibujo del instructivo. Marca con un visto cada pieza que encuentres.' },
        { titulo: 'Numera', texto: 'Si las piezas no traen número, escríbelo suave con lápiz en una cara que quede hacia adentro.' },
        { titulo: 'Lee el recorrido de la moneda', texto: 'En el plano, sigue con el dedo el camino de la moneda: por dónde entra, qué pieza empuja y dónde cae.', consejo: 'Explícaselo a tu compañero con tus palabras: si puedes explicarlo, lo entendiste.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Todas las piezas del plano están sobre la mesa y marcadas.', 'Puedes señalar en el plano por dónde entra la moneda y qué pieza mueve.'], siNoFunciona: [
        { problema: 'Falta una pieza', revisa: 'Revisa los sobrantes de la plancha: a veces una pieza pequeña queda pegada. Si no aparece, avisa al docente.' },
        { problema: 'No entiendo el plano', revisa: 'Busca primero las piezas más grandes en el dibujo y úsalas como guía para ubicar las demás.' },
      ] },
      demuestra: { reto: 'Dibuja en tu cuaderno el camino que seguirá la moneda dentro de la máquina.', preguntas: [
        pregunta('¿Por qué se revisan las piezas antes de armar?', ['Para saber si el kit está completo y no parar a medio trabajo', 'Para que la madera se seque', 'No hace falta revisarlas'], 'Si falta una pieza, es mejor saberlo antes de empezar.'),
        pregunta('¿Qué muestra el plano?', ['El orden y la posición de cada pieza', 'El precio del kit', 'El color de la pintura'], 'El plano es la guía del armado.'),
      ] },
    }],
  ['tragamonedas-arma-la-caja', 'Arma la caja', 'practica', -2,
    'Se arma el cuerpo de la máquina: base, paredes y la pieza con la ranura para la moneda. Todavía sin la tapa, para poder trabajar adentro.',
    ['Unir piezas por encastre formando una estructura firme.', 'Comprobar escuadra y firmeza antes de seguir.'],
    {
      reto: { texto: 'Vas a levantar el cuerpo de tu tragamonedas: la caja donde vivirá el mecanismo.', paraQue: 'Toda máquina necesita un cuerpo firme: si la caja se tuerce, las piezas de adentro se traban.', duracion: '40 minutos' },
      piezas: [
        { nombre: 'Base y paredes', paraQue: 'Forman la caja.' },
        { nombre: 'Pieza con la ranura', paraQue: 'Por la ranura entra la moneda.', cuidado: 'La ranura debe quedar en la posición que indica el plano: de eso depende que la moneda caiga donde debe.' },
        { nombre: 'Goma blanca', paraQue: 'Fija las uniones que quedan flojas.', cuidado: 'Solo una gota. No pegues todavía la tapa ni la pared que el plano deja para el final.' },
      ],
      pasos: [
        { titulo: 'Prueba en seco', texto: 'Encaja la base y las paredes sin goma, siguiendo el plano. Comprueba que todas las pestañas entran.' },
        { titulo: 'Revisa la ranura', texto: 'Coloca la pieza de la ranura y deja caer una moneda: debe pasar sin trabarse.', consejo: 'Si roza, lija apenas los bordes de la ranura.' },
        { titulo: 'Fija las uniones', texto: 'Desarma una unión a la vez, pon una gota de goma y vuelve a encajar. Limpia lo que sobre.' },
        { titulo: 'Deja abierta la caja', texto: 'No pongas la tapa ni la pared de atrás: por ahí vas a meter el mecanismo en la siguiente clase.' },
        { titulo: 'Deja secar', texto: 'Apoya la caja sobre la mesa, derecha, y no la muevas hasta el final de la clase.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['La caja se queda derecha y no se tambalea.', 'Una moneda pasa por la ranura sin trabarse.'], siNoFunciona: [
        { problema: 'Una pared queda torcida', revisa: 'La pestaña no entró hasta el fondo. Sácala y vuelve a encajar antes de que seque la goma.' },
        { problema: 'La moneda se traba en la ranura', revisa: 'Lija suave los bordes de la ranura y prueba otra vez.' },
      ] },
      demuestra: { reto: 'Prueba la ranura con tres monedas de distinto tamaño. ¿Cuáles pasan?', preguntas: [
        pregunta('¿Por qué se arma primero sin goma?', ['Para comprobar que todo encaja antes de pegar', 'Para gastar menos goma', 'Porque la goma mancha'], 'Si algo va mal, todavía se puede corregir.'),
        pregunta('¿Por qué se deja la caja abierta?', ['Para poder colocar el mecanismo adentro', 'Para que se vea bonita', 'Porque faltan piezas'], 'El mecanismo se monta desde el lado abierto.'),
      ] },
    }],
  ['tragamonedas-el-mecanismo', 'El mecanismo de la moneda', 'practica', -1,
    'Se monta dentro de la caja el mecanismo que la moneda acciona con su peso, y se ajusta hasta que funcione siempre.',
    ['Reconocer una palanca: punto de apoyo, fuerza y movimiento.', 'Ajustar un mecanismo probando y corrigiendo.'],
    {
      reto: { texto: 'Vas a montar el corazón de la máquina: el mecanismo que se mueve cuando entra la moneda.', paraQue: 'Las alcancías, las máquinas de chicles y los torniquetes usan el mismo truco: el peso de una moneda mueve una palanca.', duracion: '40 minutos' },
      piezas: [
        { nombre: 'Rampa o canal', paraQue: 'Guía la moneda desde la ranura hasta la palanca.' },
        { nombre: 'Palanca', paraQue: 'La moneda cae sobre un extremo; el otro extremo se levanta y mueve algo.', cuidado: 'Debe girar libre en su eje: ni muy apretada ni tan floja que se salga.' },
        { nombre: 'Eje o pasador', paraQue: 'Es el punto de apoyo de la palanca.' },
        { nombre: 'Piezas restantes del mecanismo', paraQue: 'Según tu kit: una compuerta, un tambor o un cajón que se abre. Sigue el plano.' },
      ],
      pasos: [
        { titulo: 'Arma la palanca sola', texto: 'Fuera de la caja, pasa el eje por la palanca. Empuja un extremo con el dedo: el otro debe subir.' },
        { titulo: 'Coloca la rampa', texto: 'Fija la rampa en el lugar que indica el plano, debajo de la ranura.' },
        { titulo: 'Monta la palanca', texto: 'Coloca el eje con la palanca en sus agujeros dentro de la caja. Comprueba que gira sin rozar las paredes.' },
        { titulo: 'Monta lo que la palanca mueve', texto: 'Coloca la pieza que la palanca acciona (compuerta, tambor o cajón) siguiendo el plano.' },
        { titulo: 'Prueba con la moneda', texto: 'Deja caer una moneda por la ranura y observa todo el recorrido. Repite cinco veces.', consejo: 'Anota cuántas veces de cinco funciona. Ajusta y vuelve a contar.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['La moneda baja por la rampa y cae sobre la palanca.', 'La palanca se mueve y acciona la otra pieza.', 'Funciona cinco veces seguidas.'], siNoFunciona: [
        { problema: 'La moneda se queda en la rampa', revisa: 'La rampa quedó muy plana o tiene goma seca. Dale más inclinación o límpiala.' },
        { problema: 'La moneda cae pero la palanca no se mueve', revisa: 'El eje está apretado o la moneda cae muy cerca del punto de apoyo. Afloja el eje y revisa la posición de la rampa.' },
        { problema: 'La palanca no vuelve a su sitio', revisa: 'Falta el contrapeso o la liga que la regresa. Revisa el plano.' },
      ] },
      demuestra: { reto: 'Prueba con una moneda más liviana y con una más pesada. ¿Con cuál funciona mejor y por qué?', preguntas: [
        pregunta('¿Qué fuerza mueve la palanca?', ['El peso de la moneda', 'Una pila', 'El viento'], 'La moneda cae y su peso empuja un extremo de la palanca.'),
        pregunta('¿Qué es el punto de apoyo?', ['El eje sobre el que gira la palanca', 'La ranura', 'La tapa de la caja'], 'Toda palanca gira alrededor de un punto de apoyo.'),
      ] },
    }],
  ['el-tragamonedas', 'El tragamonedas', 'principal', 1,
    'Se cierra la caja, se hacen las pruebas finales y cada estudiante presenta su máquina explicando cómo funciona.',
    ['Terminar y probar una máquina simple completa.', 'Explicar el funcionamiento usando las palabras palanca, peso y punto de apoyo.'],
    {
      reto: { texto: 'Vas a terminar tu tragamonedas, decorarlo y demostrar que funciona.', paraQue: 'Construir una máquina que funciona siempre, y saber explicarla, es lo que hace un ingeniero.', duracion: '40 minutos' },
      piezas: [
        { nombre: 'Caja con el mecanismo montado', paraQue: 'Es tu máquina casi terminada.' },
        { nombre: 'Tapa y pared final', paraQue: 'Cierran la caja.', cuidado: 'Antes de pegarlas, prueba el mecanismo una última vez: después ya no podrás meter la mano.' },
        { nombre: 'Marcadores o pintura', paraQue: 'Para decorar.', cuidado: 'No pintes la ranura ni las piezas que se mueven: la pintura las traba.' },
      ],
      pasos: [
        { titulo: 'Última prueba abierta', texto: 'Con la caja todavía abierta, deja caer la moneda cinco veces. Debe funcionar las cinco.' },
        { titulo: 'Cierra la caja', texto: 'Coloca la pared final y la tapa. Si tu kit tiene una puerta para sacar las monedas, déjala sin pegar.' },
        { titulo: 'Prueba cerrada', texto: 'Repite la prueba con la caja cerrada. Escucha el recorrido de la moneda.' },
        { titulo: 'Decora', texto: 'Ponle nombre a tu máquina y decórala por fuera.' },
        { titulo: 'Presenta', texto: 'Muestra tu máquina a la clase: deja caer una moneda y explica qué pasa adentro.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['La moneda entra, acciona el mecanismo y queda guardada.', 'Funciona varias veces seguidas con la caja cerrada.', 'Las monedas se pueden recuperar.'], siNoFunciona: [
        { problema: 'Funcionaba abierta y cerrada no', revisa: 'La tapa está rozando el mecanismo. Ábrela y mira dónde toca.' },
        { problema: 'A veces funciona y a veces no', revisa: 'La moneda no cae siempre en el mismo punto. Corrige la rampa para que la guíe mejor.' },
      ] },
      demuestra: { reto: 'Cambia algo para que tu máquina funcione solo con un tamaño de moneda. Explica qué cambiaste.', preguntas: [
        pregunta('¿Qué tipo de máquina simple usa tu tragamonedas?', ['Una palanca', 'Una polea', 'Un tornillo'], 'La moneda mueve una palanca con su peso.'),
        pregunta('¿Por qué no se pintan las piezas que se mueven?', ['Porque la pintura las puede trabar', 'Porque se ven feas', 'Porque la madera se moja'], 'La pintura aumenta el roce entre las piezas.'),
        pregunta('Si la palanca no se mueve con una moneda liviana, ¿qué puedes hacer?', ['Hacer que la moneda caiga más lejos del punto de apoyo', 'Pintar la palanca', 'Cerrar la caja'], 'Más lejos del punto de apoyo, la misma fuerza mueve más.'),
      ] },
    }],
]

// ---------------------------------------------------------------------------
// 5to EGB — Carro radiocontrolado
// ---------------------------------------------------------------------------
const CARRO_RC = [
  ['carro-rc-piezas-y-plano', 'Las piezas y el plano', 'practica', -3,
    'Se revisa el kit y se identifican las partes de un carro a control remoto: chasis, motores, ruedas, portapilas, receptor y control.',
    ['Identificar las partes de un vehículo a control remoto y su función.', 'Leer un plano de armado.'],
    {
      reto: { texto: 'Vas a conocer cada parte de tu carro a control remoto antes de armarlo.', paraQue: 'Los drones, los carros de juguete y los robots de rescate se manejan igual: un control envía órdenes y el vehículo las recibe.', duracion: '30 minutos' },
      piezas: [
        { nombre: 'Chasis de madera', paraQue: 'Es el cuerpo del carro: sostiene todo.' },
        { nombre: 'Motores', paraQue: 'Hacen girar las ruedas.', cuidado: 'No dobles ni jales sus cables: las soldaduras son frágiles.' },
        { nombre: 'Ruedas', paraQue: 'Las que van en los motores empujan el carro; las demás solo lo sostienen.' },
        { nombre: 'Portapilas', paraQue: 'Guarda las pilas y entrega la energía.', cuidado: PILAS },
        { nombre: 'Receptor', paraQue: 'Es la plaquita que va en el carro: escucha al control y enciende los motores.' },
        { nombre: 'Control remoto', paraQue: 'Envía tus órdenes por el aire.' },
      ],
      pasos: [
        { titulo: 'Saca y separa', texto: 'Pon todas las piezas sobre la mesa. Separa la madera, las piezas eléctricas y los tornillos.' },
        { titulo: 'Cuenta contra el plano', texto: 'Compara con la lista o el dibujo del instructivo y marca cada pieza que encuentres.' },
        { titulo: 'Sigue la energía', texto: 'En el plano, sigue con el dedo el camino de la energía: de las pilas al receptor y del receptor a los motores.' },
        { titulo: 'Reconoce los cables', texto: 'Mira cuántos cables salen del receptor y hacia dónde va cada uno según el plano. Fíjate en los colores.', consejo: 'Rojo casi siempre es positivo (+) y negro es negativo (–).' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Todas las piezas del plano están sobre la mesa.', 'Puedes explicar el camino de la energía: pilas → receptor → motores.'], siNoFunciona: [
        { problema: 'Falta una pieza', revisa: 'Revisa el fondo de la caja y las bolsitas. Si no aparece, avisa al docente.' },
      ] },
      demuestra: { reto: 'Dibuja tu carro visto desde arriba y señala dónde irá cada parte.', preguntas: [
        pregunta('¿Qué hace el receptor?', ['Recibe las órdenes del control y enciende los motores', 'Guarda las pilas', 'Hace girar las ruedas con la mano'], 'Es el «oído» del carro.'),
        pregunta('¿De dónde sale la energía de los motores?', ['De las pilas', 'Del control remoto', 'De las ruedas'], 'El control solo envía órdenes; la energía la ponen las pilas del carro.'),
      ] },
    }],
  ['carro-rc-chasis-y-motores', 'Arma el chasis y los motores', 'practica', -2,
    'Se arma el chasis de madera, se fijan los motores y se colocan las ruedas, comprobando que el carro rueda derecho.',
    ['Construir una estructura firme y alineada.', 'Fijar motores y ruedas de modo que giren libres.'],
    {
      reto: { texto: 'Vas a armar el cuerpo de tu carro y a ponerle sus motores y ruedas.', paraQue: 'Si el chasis queda torcido o un motor queda flojo, el carro se va de lado aunque lo manejes bien.', duracion: '40 minutos' },
      piezas: [
        { nombre: 'Chasis de madera', paraQue: 'La base donde se monta todo.' },
        { nombre: 'Motores con sus soportes', paraQue: 'Van a los lados o atrás, según el plano.' },
        { nombre: 'Ruedas', paraQue: 'Se empujan en el eje de cada motor.' },
        { nombre: 'Tornillos y destornillador', paraQue: 'Fijan los motores al chasis.', cuidado: 'Aprieta hasta que quede firme, sin forzar: la madera se raja.' },
      ],
      pasos: [
        { titulo: 'Arma el chasis', texto: 'Encaja las piezas de madera siguiendo el plano. Prueba primero sin goma y luego fija las uniones.' },
        { titulo: 'Fija los motores', texto: 'Coloca cada motor en su soporte y atorníllalo. Los dos deben quedar a la misma altura y mirando hacia el mismo lado.', consejo: 'Deja los cables de los motores hacia el centro del carro: así llegarán al receptor.' },
        { titulo: 'Pon las ruedas', texto: 'Empuja una rueda en el eje de cada motor, hasta el fondo.' },
        { titulo: 'Pon la rueda de apoyo', texto: 'Coloca la rueda loca o las ruedas delanteras que trae tu kit.' },
        { titulo: 'Prueba de rodado', texto: 'Empuja el carro con la mano sobre la mesa. Debe rodar derecho y sin trabarse.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['El carro rueda derecho al empujarlo con la mano.', 'Las ruedas no rozan el chasis.', 'Los motores no se mueven al tocarlos.'], siNoFunciona: [
        { problema: 'El carro se va hacia un lado', revisa: 'Un motor quedó más adelante o más inclinado que el otro. Aflójalo, alinéalo y vuelve a apretar.' },
        { problema: 'Una rueda se sale', revisa: 'No entró hasta el fondo del eje. Empújala con firmeza.' },
      ] },
      demuestra: { reto: 'Empuja tu carro una sola vez y mide con una regla cuánto se desvía en un metro.', preguntas: [
        pregunta('¿Por qué los motores deben quedar alineados?', ['Para que el carro avance derecho', 'Para que gasten menos pilas', 'Para que se vean iguales'], 'Si un motor queda torcido, esa rueda empuja hacia otro lado.'),
        pregunta('¿Qué pasa si aprietas demasiado un tornillo en la madera?', ['La madera se puede rajar', 'El motor gira más rápido', 'Nada'], 'La madera delgada se parte con facilidad.'),
      ] },
    }],
  ['carro-rc-conecta-el-control', 'Conecta el receptor y prueba el control', 'practica', -1,
    'Se conectan el portapilas, el receptor y los motores, y se comprueba con el carro en el aire que cada orden del control mueve las ruedas correctas.',
    ['Conectar un circuito siguiendo un plano, respetando la polaridad.', 'Probar un sistema por partes antes de usarlo.'],
    {
      reto: { texto: 'Vas a darle vida a tu carro: conectar las pilas, el receptor y los motores, y probar el control.', paraQue: 'Todo sistema a control remoto tiene tres partes: quien manda (control), quien escucha (receptor) y quien actúa (motores).', duracion: '40 minutos' },
      piezas: [
        { nombre: 'Portapilas con pilas', paraQue: 'La energía del carro.', cuidado: 'Pon las pilas al final, cuando todo esté conectado. Respeta el + y el – marcados en el portapilas. ' + PILAS },
        { nombre: 'Receptor', paraQue: 'Recibe las órdenes y enciende los motores.', cuidado: 'No lo apoyes sobre partes metálicas: puede hacer cortocircuito.' },
        { nombre: 'Control remoto', paraQue: 'Envía las órdenes.', cuidado: 'Usa sus propias pilas. Revisa que estén puestas.' },
        { nombre: 'Interruptor', paraQue: 'Enciende y apaga el carro sin sacar las pilas.' },
      ],
      pasos: [
        { titulo: 'Fija el receptor y el portapilas', texto: 'Coloca el receptor y el portapilas en el chasis, en el lugar que indica el plano. El peso debe quedar repartido.' },
        { titulo: 'Conecta los motores', texto: 'Une los cables de cada motor a las salidas del receptor marcadas para motor, como muestra el plano.' },
        { titulo: 'Conecta la energía', texto: 'Une el cable rojo del portapilas a la entrada positiva (+) del receptor y el negro a la negativa (–), pasando por el interruptor si tu kit lo trae.', consejo: 'Antes de poner las pilas, pídele al docente que revise el rojo y el negro.' },
        { titulo: 'Pon las pilas y enciende', texto: 'Con el carro levantado en la mano (ruedas en el aire), pon las pilas y enciende el interruptor.' },
        { titulo: 'Prueba cada orden', texto: 'Presiona adelante, atrás, izquierda y derecha en el control, una a la vez. Mira qué ruedas giran y hacia dónde.' },
        { titulo: 'Corrige el sentido', texto: 'Si al presionar adelante una rueda gira hacia atrás, apaga e intercambia los dos cables de ese motor.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['Adelante: las ruedas motrices giran hacia adelante.', 'Atrás: giran hacia atrás.', 'Izquierda y derecha: el carro gira hacia el lado que pides.'], siNoFunciona: [
        { problema: 'No pasa nada al encender', revisa: 'Revisa que las pilas estén en el sentido correcto, que el interruptor esté encendido y que el rojo y el negro lleguen al receptor.' },
        { problema: 'El carro enciende pero no obedece al control', revisa: 'Revisa las pilas del control y acércalo al carro. Algunos kits piden encender primero el carro y después el control para que se enlacen.' },
        { problema: 'Una rueda gira al revés', revisa: 'Apaga e intercambia los dos cables de ese motor.' },
        { problema: 'Algo se calienta', revisa: 'Apaga y saca las pilas de inmediato. Hay un cable mal conectado: avisa al docente.' },
      ] },
      demuestra: { reto: 'Llena una tabla: para cada botón del control, anota qué ruedas giran y en qué sentido.', preguntas: [
        pregunta('¿Por qué se prueba con las ruedas en el aire?', ['Para ver qué hace cada rueda sin que el carro se escape', 'Para gastar menos pilas', 'Porque el piso está sucio'], 'Probar por partes evita golpes y permite corregir.'),
        pregunta('Si un motor gira al revés, ¿qué se hace?', ['Intercambiar sus dos cables', 'Cambiar las pilas', 'Quitar la rueda'], 'Al invertir los cables se invierte el giro.'),
      ] },
    }],
  ['el-carro-radiocontrolado', 'El carro radiocontrolado', 'principal', 1,
    'Con el carro terminado, los estudiantes aprenden a manejarlo, miden su alcance y completan un circuito de conos.',
    ['Manejar un vehículo a control remoto con precisión.', 'Medir y comparar: alcance del control y tiempo en un recorrido.'],
    {
      reto: { texto: 'Vas a manejar tu carro por un circuito y a medir qué tan lejos obedece al control.', paraQue: 'Manejar a distancia con precisión es lo que hacen los pilotos de drones y los operadores de robots.', duracion: '40 minutos' },
      piezas: [
        { nombre: 'Carro terminado', paraQue: 'Listo para rodar.', cuidado: 'Apágalo siempre que no lo uses: así duran las pilas.' },
        { nombre: 'Conos, vasos o tapas', paraQue: 'Marcan el circuito.' },
        { nombre: 'Metro y cronómetro', paraQue: 'Para medir el alcance y el tiempo.' },
      ],
      pasos: [
        { titulo: 'Asegura los cables', texto: 'Sujeta los cables sueltos con cinta para que no rocen las ruedas.' },
        { titulo: 'Primera rodada', texto: 'En un piso liso, avanza un metro, frena y retrocede. Repite hasta que te salga derecho.' },
        { titulo: 'Aprende a girar', texto: 'Dibuja un ocho con dos conos y recórrelo despacio.' },
        { titulo: 'Mide el alcance', texto: 'Aléjate del carro de metro en metro y prueba si todavía obedece. Anota la distancia máxima.' },
        { titulo: 'El circuito', texto: 'Arma un circuito con cinco conos. Mide tu tiempo en tres intentos y anota el mejor.' },
      ],
      codigo: [],
      prueba: { queDebePasar: ['El carro avanza, retrocede y gira hacia donde le ordenas.', 'Completa el circuito sin tumbar conos.', 'Tienes anotado el alcance del control y tu mejor tiempo.'], siNoFunciona: [
        { problema: 'El carro va lento o se detiene', revisa: 'Las pilas están gastadas o un cable roza una rueda.' },
        { problema: 'No va derecho', revisa: 'Revisa que las dos ruedas motrices estén a fondo en sus ejes y que nada las roce.' },
        { problema: 'Deja de obedecer de lejos', revisa: 'Llegaste al alcance máximo del control. Acércate.' },
      ] },
      demuestra: { reto: 'Compite contra tu propio tiempo: baja tu marca en el circuito sin tumbar ningún cono.', preguntas: [
        pregunta('¿Cómo viaja la orden del control al carro?', ['Por el aire, sin cables', 'Por un cable escondido', 'Por las ruedas'], 'El control la emite y el receptor del carro la capta.'),
        pregunta('¿Por qué el carro deja de obedecer cuando está muy lejos?', ['Porque la señal del control llega muy débil', 'Porque se le acaban las ruedas', 'Porque el piso cambia'], 'Toda señal tiene un alcance máximo.'),
        pregunta('¿Qué conviene hacer al terminar la clase?', ['Apagar el carro y el control', 'Dejarlo encendido', 'Sacarle las ruedas'], 'Así las pilas duran más.'),
      ] },
    }],
]

module.exports = {
  'kit-copol-inicial-1': EOLICO,
  'kit-copol-inicial-2': SOLAR,
  'kit-copol-cuarto-egb': TRAGAMONEDAS,
  'kit-copol-quinto-egb': CARRO_RC,
}
