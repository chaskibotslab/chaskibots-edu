/**
 * ChaskiBlocks IA: actividades guiadas.
 * Cada actividad trae sus personajes, los pasos para construirla y el proyecto terminado.
 */
import type { Proyecto, SpriteDef } from './motor'

// ------------------------------------------------- ayudas para escribir proyectos
const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } })
const t = (s: string) => ({ shadow: { type: 'text', fields: { TEXT: s } } })
const B = (type: string, extra: any = {}) => ({ type, ...extra })
const pila = (...bs: any[]) => { for (let i = bs.length - 2; i >= 0; i--) bs[i] = { ...bs[i], next: { block: bs[i + 1] } }; return bs[0] }
const guion = (x: number, y: number, ...bs: any[]) => ({ ...pila(...bs), x, y })
const bloques = (...guiones: any[]) => ({ languageVersion: 0, blocks: guiones })
const con = (bloque: any, sombra: any = {}) => ({ ...sombra, block: bloque })

const bandera = () => B('ev_bandera')
const decir = (texto: string, seg: number) => B('ap_decir_seg', { inputs: { T: t(texto), S: n(seg) } })
const decirFijo = (texto: string) => B('ap_decir', { inputs: { T: t(texto) } })
const hablar = (texto: string) => B('sn_hablar', { inputs: { T: t(texto) } })
const sonido = (s: string) => B('sn_sonido', { fields: { S: s } })
const esperar = (s: number) => B('ctl_esperar', { inputs: { S: n(s) } })
const irXY = (x: number, y: number) => B('mv_ir_xy', { inputs: { X: n(x), Y: n(y) } })
const sumarX = (v: number) => B('mv_cambiar_x', { inputs: { N: n(v) } })
const sumarY = (v: number) => B('mv_cambiar_y', { inputs: { N: n(v) } })
const disfraz = (v: number) => B('ap_disfraz_num', { inputs: { N: n(v) } })
const fondo = (f: string) => B('ap_fondo', { fields: { F: f } })
const video = (si: boolean) => B('ia_video', { fields: { E: si ? 'si' : 'no' } })
const siempre = (...hacer: any[]) => B('ctl_por_siempre', { inputs: { DO: { block: pila(...hacer) } } })
const repetir = (veces: number, ...hacer: any[]) => B('ctl_repetir', { inputs: { N: n(veces), DO: { block: pila(...hacer) } } })
const si = (cond: any, ...hacer: any[]) => B('ctl_si', { inputs: { C: { block: cond }, DO: { block: pila(...hacer) } } })
const siSino = (cond: any, hacer: any[], sino: any[]) => B('ctl_si_sino', { inputs: { C: { block: cond }, DO: { block: pila(...hacer) }, ELSE: { block: pila(...sino) } } })
const tecla = (k: string) => B('se_tecla', { fields: { K: k } })
const tocando = (o: string) => B('se_tocando', { fields: { O: o } })
const iaVe = (c: string) => B('ia_ve', { fields: { C: c } })
const cuandoVea = (c: string) => B('ia_cuando_ve', { fields: { C: c } })
const oyo = (p: string) => B('ia_oyo', { fields: { P: p } })
const detecta = (o: string) => B('ia_obj_hay', { fields: { O: o } })
const enviar = (m: string) => B('ev_enviar', { fields: { M: m } })
const alRecibir = (m: string) => B('ev_recibir', { fields: { M: m } })
const leer = (v: string) => B('variables_get', { fields: { VAR: { id: v } } })
const fijar = (v: string, entrada: any) => B('variables_set', { fields: { VAR: { id: v } }, inputs: { VALUE: entrada } })
const sumar = (v: string, cuanto: number) => B('math_change', { fields: { VAR: { id: v } }, inputs: { DELTA: n(cuanto) } })
const comparar = (a: any, op: 'EQ' | 'GT' | 'LT', b: any) => B('logic_compare', { fields: { OP: op }, inputs: { A: a, B: b } })
const resta = (a: any, b: any) => B('math_arithmetic', { fields: { OP: 'MINUS' }, inputs: { A: a, B: b } })
const suma = (a: any, b: any) => B('math_arithmetic', { fields: { OP: 'ADD' }, inputs: { A: a, B: b } })
const unir = (a: any, b: any) => B('op_unir', { inputs: { A: a, B: b } })
const variables = (...nombres: string[]) => nombres.map(v => ({ name: v, id: v }))

function personaje(id: string, nombre: string, disfraces: string[], x: number, y: number, bl: any, extra: Partial<SpriteDef> = {}): SpriteDef {
  return { id, nombre, disfraces, disfraz: 0, x, y, dir: 90, tam: 100, visible: true, rot: 'lr', bloques: bl, ...extra }
}

function proyecto(nombre: string, fondoInicial: string, sprites: SpriteDef[], extra: Partial<Proyecto> = {}): Proyecto {
  return { formato: 'chaskiblocks-ia', version: 1, nombre, fondo: fondoInicial, sprites, variables: [], clases: ['Clase 1', 'Clase 2'], ...extra }
}

export function proyectoNuevo(): Proyecto {
  return proyecto('Mi proyecto', 'cielo', [
    personaje('s1', 'Chaski', ['🤖', '😀'], 0, 0, bloques(guion(40, 40, bandera(), decir('¡Hola! Soy Chaski', 2)))),
  ])
}

// ------------------------------------------------------------------ actividades
export interface Actividad {
  id: string
  emoji: string
  titulo: string
  nivel: 'Inicial' | 'Intermedio' | 'Avanzado'
  tipo: 'Programación' | 'IA · Imagen' | 'IA · Objetos' | 'IA · Cuerpo' | 'IA · Voz'
  minutos: number
  resumen: string
  /** La idea de inteligencia artificial que se aprende, en palabras de niño. */
  idea: string
  necesita: string
  pasos: string[]
  reto: string
  solucion: () => Proyecto
}

export const ACTIVIDADES: Actividad[] = [
  {
    id: 'hola', emoji: '👋', titulo: 'Hola, Chaski', nivel: 'Inicial', tipo: 'Programación', minutos: 10,
    resumen: 'Tu primer programa: Chaski saluda, se desliza y hace un sonido.',
    idea: 'Un programa es una lista de órdenes. La computadora las cumple una por una, de arriba hacia abajo.',
    necesita: 'Solo la computadora.',
    pasos: [
      'En Eventos, toma el bloque «al presionar 🚩». Todo programa empieza con un evento.',
      'En Movimiento, encaja debajo «ir a x: y:» y escribe x: -150, y: 0. Así Chaski empieza a la izquierda.',
      'En Apariencia, agrega «decir ¡Hola! durante 2 segundos» y cambia el texto por tu saludo.',
      'En Movimiento, agrega «deslizar en 1 seg a x: 100 y: 0».',
      'En Sonido, agrega «tocar el sonido salto». Presiona la bandera verde y mira qué pasa.',
    ],
    reto: 'Haz que Chaski cambie de disfraz al llegar y que el fondo cambie a «Noche».',
    solucion: () => proyecto('Hola, Chaski', 'pradera', [
      personaje('s1', 'Chaski', ['🤖', '😀'], -150, 0, bloques(guion(40, 40, bandera(), irXY(-150, 0), decir('¡Hola! Soy Chaski', 2),
        B('mv_deslizar', { inputs: { S: n(1), X: n(100), Y: n(0) } }), sonido('salto'), decir('¡Vamos a programar!', 2)))),
    ]),
  },
  {
    id: 'lapiz', emoji: '✏️', titulo: 'Dibuja con el lápiz', nivel: 'Inicial', tipo: 'Programación', minutos: 15,
    resumen: 'Usa repeticiones para dibujar un cuadrado y luego inventa tus figuras.',
    idea: 'Repetir es un superpoder: en vez de escribir 4 veces lo mismo, le dices a la computadora «repite 4 veces».',
    necesita: 'Solo la computadora.',
    pasos: [
      'Empieza con «al presionar 🚩». Agrega «borrar todo lo dibujado» (Lápiz) e «ir a x: -60 y: -60».',
      'Agrega «apuntar en dirección 90» y «bajar el lápiz». Desde ahora, al moverse deja una línea.',
      'En Control, toma «repetir 10 veces» y cambia el 10 por 4: un cuadrado tiene 4 lados.',
      'Dentro del repetir pon «mover 120 pasos», «girar ↺ 90 grados» y «esperar 0.3 segundos».',
      'Presiona la bandera. ¿Salió el cuadrado? Prueba otro color con «usar el color».',
    ],
    reto: 'Dibuja un triángulo (3 lados, giros de 120) y una estrella (5 lados, giros de 144).',
    solucion: () => proyecto('Dibuja con el lápiz', 'cuadricula', [
      personaje('s1', 'Lápiz', ['✏️', '🖍️'], -60, -60, bloques(guion(40, 40, bandera(), B('lz_borrar'), irXY(-60, -60), B('mv_apuntar', { inputs: { N: n(90) } }),
        B('lz_color', { fields: { C: 'azul' } }), B('lz_grosor', { inputs: { N: n(4) } }), B('lz_bajar'),
        repetir(4, B('mv_mover', { inputs: { N: n(120) } }), B('mv_girar_izq', { inputs: { N: n(90) } }), esperar(0.3)), B('lz_subir'))), { rot: 'no', tam: 70 }),
    ]),
  },
  {
    id: 'estrella', emoji: '⭐', titulo: 'Atrapa la estrella', nivel: 'Intermedio', tipo: 'Programación', minutos: 25,
    resumen: 'Un videojuego: mueve a Chaski con las flechas y suma puntos al tocar la estrella.',
    idea: 'Los juegos usan condiciones: «si pasa esto, entonces haz aquello». También guardan datos en variables, como los puntos.',
    necesita: 'El teclado.',
    pasos: [
      'Con Chaski seleccionado: «al presionar 🚩» y debajo un «por siempre» (Control).',
      'Dentro del por siempre pon un «si … entonces». En el hueco encaja «¿tecla flecha derecha presionada?» (Sensores) y adentro «sumar a x 8».',
      'Repite para las otras flechas: izquierda (sumar a x -8), arriba (sumar a y 8) y abajo (sumar a y -8).',
      'En Variables, crea una variable llamada «puntos». Al inicio del programa de Chaski pon «fijar puntos a 0».',
      'Haz clic en la Estrella, abajo del escenario. Cada personaje tiene sus propios bloques.',
      'Estrella: «al presionar 🚩», «por siempre», «si ¿tocando Chaski? entonces»: «cambiar puntos por 1», «tocar el sonido moneda» e «ir a una posición al azar».',
    ],
    reto: 'Agrega un enemigo 👻 que rebote por la pantalla. Si toca a Chaski, los puntos vuelven a 0.',
    solucion: () => proyecto('Atrapa la estrella', 'espacio', [
      personaje('s1', 'Chaski', ['🤖'], -120, 0, bloques(guion(40, 40, bandera(), fijar('puntos', n(0)), siempre(
        si(tecla('ArrowRight'), sumarX(8)), si(tecla('ArrowLeft'), sumarX(-8)), si(tecla('ArrowUp'), sumarY(8)), si(tecla('ArrowDown'), sumarY(-8)))))),
      personaje('s2', 'Estrella', ['⭐', '🌟'], 120, 60, bloques(guion(40, 40, bandera(), siempre(
        si(tocando('Chaski'), sumar('puntos', 1), sonido('moneda'), B('ap_disfraz_sig'), B('mv_ir_a', { fields: { A: 'azar' } }))))), { tam: 80 }),
    ], { variables: variables('puntos') }),
  },
  {
    id: 'semaforo', emoji: '🚦', titulo: 'Semáforo inteligente', nivel: 'Inicial', tipo: 'IA · Imagen', minutos: 25,
    resumen: 'Entrena a la IA para reconocer verde y rojo. El carro avanza solo cuando ve verde.',
    idea: 'La IA aprende con ejemplos. Tú le muestras muchas fotos de «verde» y de «rojo», y ella encuentra sola en qué se parecen. Así aprenden a ver los carros autónomos.',
    necesita: 'Cámara y dos objetos: uno verde y uno rojo (papel, tapa, cuaderno).',
    pasos: [
      'Presiona «Entrenar IA». Ya hay dos clases: «Verde» y «Rojo». Enciende la cámara.',
      'Muestra el objeto verde y mantén presionado «Grabar ejemplos» de la clase Verde hasta tener unos 20. Muévelo un poco mientras grabas.',
      'Haz lo mismo con el objeto rojo en la clase Rojo. Mira las barras: ¿la IA acierta? Cierra el panel.',
      'Con el Carro seleccionado: «al presionar 🚩», «por siempre» y dentro «si ¿la IA ve Verde? entonces» (IA · Imagen): «mover 4 pasos».',
      'Para que el carro dé la vuelta: dentro del mismo «si», agrega otro «si posición en x > 220 entonces»: «dar a x el valor -220».',
      'Selecciona el Semáforo. Usa dos bloques «cuando la IA vea»: con Rojo, «cambiar al disfraz número 1»; con Verde, «cambiar al disfraz número 2».',
    ],
    reto: 'Agrega la clase «Amarillo». Con amarillo, el carro avanza despacio (mover 1 paso).',
    solucion: () => proyecto('Semáforo inteligente', 'pista', [
      personaje('s1', 'Carro', ['🚗', '🚕'], -200, -80, bloques(guion(40, 40, bandera(), irXY(-200, -80), siempre(
        si(iaVe('Verde'), B('mv_mover', { inputs: { N: n(4) } }), si(comparar(con(B('mv_x'), n(0)), 'GT', n(220)), B('mv_fijar_x', { inputs: { N: n(-220) } })))))), { tam: 130 }),
      personaje('s2', 'Semáforo', ['🔴', '🟢'], 170, 90, bloques(
        guion(40, 40, cuandoVea('Rojo'), disfraz(1), sonido('campana')),
        guion(40, 220, cuandoVea('Verde'), disfraz(2), sonido('pop'))), { tam: 130 }),
    ], { clases: ['Verde', 'Rojo'] }),
  },
  {
    id: 'piedra-papel', emoji: '✌️', titulo: 'Piedra, papel o tijera', nivel: 'Avanzado', tipo: 'IA · Imagen', minutos: 40,
    resumen: 'Enseña a la IA a reconocer tu mano y juega contra Chaski.',
    idea: 'Clasificar es poner cada cosa en su grupo. Tu modelo tiene tres grupos (piedra, papel, tijera) y decide a cuál se parece más lo que ve. Con más ejemplos y más variados, se equivoca menos.',
    necesita: 'Cámara y tu mano.',
    pasos: [
      'Abre «Entrenar IA». Graba unos 25 ejemplos de tu mano en cada clase: Piedra (puño), Papel (mano abierta) y Tijera (dos dedos). Cambia la posición y la distancia.',
      'Crea tres variables: «yo», «robot» y «puntos».',
      'Chaski cuenta: «decir Piedra, papel o… durante 1.5 segundos» y «decir ¡tijera! durante 0.8 segundos».',
      'Guarda tu jugada como número: «si ¿la IA ve Piedra?»: fijar yo a 1; Papel: 2; Tijera: 3.',
      'Chaski elige al azar: «fijar robot a número al azar entre 1 y 3» y «cambiar al disfraz número (robot + 1)» para mostrar su mano.',
      'Decide quién gana: si yo = robot es empate. Ganas si (yo − robot) es 1 o es −2. Si ganas, suma 1 a puntos.',
      'Mete todo dentro de un «por siempre» para jugar muchas rondas.',
    ],
    reto: 'Agrega una variable «puntos robot» y termina el juego cuando alguien llegue a 5.',
    solucion: () => proyecto('Piedra, papel o tijera', 'cielo', [
      personaje('s1', 'Chaski', ['🤖', '✊', '✋', '✌️'], 0, -20, bloques(guion(40, 40, bandera(), fijar('puntos', n(0)), siempre(
        disfraz(1), decir('Piedra, papel o…', 1.5), decir('¡tijera!', 0.8),
        fijar('yo', n(0)),
        si(iaVe('Piedra'), fijar('yo', n(1))), si(iaVe('Papel'), fijar('yo', n(2))), si(iaVe('Tijera'), fijar('yo', n(3))),
        fijar('robot', con(B('math_random_int', { inputs: { FROM: n(1), TO: n(3) } }), n(1))),
        B('ap_disfraz_num', { inputs: { N: con(suma(con(leer('robot'), n(1)), n(1)), n(1)) } }),
        siSino(comparar(con(leer('yo'), n(0)), 'EQ', con(leer('robot'), n(0))),
          [decir('¡Empate!', 2)],
          [siSino(B('logic_operation', { fields: { OP: 'OR' }, inputs: {
            A: { block: comparar(con(resta(con(leer('yo'), n(0)), con(leer('robot'), n(0))), n(0)), 'EQ', n(1)) },
            B: { block: comparar(con(resta(con(leer('yo'), n(0)), con(leer('robot'), n(0))), n(0)), 'EQ', n(-2)) } } }),
            [sumar('puntos', 1), sonido('moneda'), decir('¡Ganaste!', 2)],
            [sonido('láser'), decir('¡Gané yo!', 2)])])))), { tam: 180 }),
    ], { clases: ['Piedra', 'Papel', 'Tijera'], variables: variables('yo', 'robot', 'puntos') }),
  },
  {
    id: 'reciclaje', emoji: '♻️', titulo: 'Robot reciclador', nivel: 'Intermedio', tipo: 'IA · Imagen', minutos: 35,
    resumen: 'La IA mira un residuo y Chaski te dice en qué tacho va.',
    idea: 'La IA puede ayudar a cuidar el planeta. En las plantas de reciclaje hay cámaras con IA que separan los residuos. Tu modelo hace lo mismo en pequeño.',
    necesita: 'Cámara y residuos limpios: una botella plástica, una hoja de papel y una cáscara de fruta.',
    pasos: [
      'Abre «Entrenar IA» y graba unos 20 ejemplos por clase: Plástico (botella), Papel (hoja) y Orgánico (cáscara). Gira cada objeto mientras grabas.',
      'Con Chaski: «cuando la IA vea Plástico» → «enviar el mensaje plastico» y «decir en voz alta Plástico: va al tacho azul».',
      'Haz lo mismo para Papel (mensaje «papel», tacho gris) y Orgánico (mensaje «organico», tacho verde).',
      'Selecciona el Tacho. «al recibir el mensaje plastico» → «cambiar al disfraz número 2» (azul).',
      'Agrega «al recibir papel» → disfraz 3 (gris) y «al recibir organico» → disfraz 4 (verde).',
      'Presiona la bandera y muestra cada residuo a la cámara.',
    ],
    reto: 'Agrega la clase «Nada» (la mesa vacía) para que Chaski no hable cuando no hay residuo.',
    solucion: () => proyecto('Robot reciclador', 'pradera', [
      personaje('s1', 'Chaski', ['🤖'], -110, -40, bloques(
        guion(40, 40, bandera(), decir('Muéstrame un residuo', 3)),
        guion(40, 170, cuandoVea('Plástico'), enviar('plastico'), hablar('Plástico: va al tacho azul')),
        guion(40, 330, cuandoVea('Papel'), enviar('papel'), hablar('Papel: va al tacho gris')),
        guion(40, 490, cuandoVea('Orgánico'), enviar('organico'), hablar('Orgánico: va al tacho verde'))), { tam: 150 }),
      personaje('s2', 'Tacho', ['🗑️', '🟦', '⬜', '🟩'], 120, -40, bloques(
        guion(40, 40, bandera(), disfraz(1)),
        guion(40, 170, alRecibir('plastico'), disfraz(2), sonido('pop')),
        guion(40, 330, alRecibir('papel'), disfraz(3), sonido('pop')),
        guion(40, 490, alRecibir('organico'), disfraz(4), sonido('pop'))), { tam: 170 }),
    ], { clases: ['Plástico', 'Papel', 'Orgánico'] }),
  },
  {
    id: 'payaso', emoji: '🤡', titulo: 'Nariz de payaso', nivel: 'Inicial', tipo: 'IA · Cuerpo', minutos: 15,
    resumen: 'Un filtro como los de las redes sociales: una nariz roja y un sombrero que siguen tu cara.',
    idea: 'La IA encuentra puntos de tu cuerpo en la imagen: nariz, ojos, hombros, manos. A eso se le llama estimación de pose. Con esos puntos funcionan los filtros de video.',
    necesita: 'Cámara. Ponte a un metro de la pantalla, con buena luz.',
    pasos: [
      'Con la Nariz seleccionada: «al presionar 🚩» y «encender el video en el escenario» (IA · Imagen). Te verás en el escenario.',
      'Agrega «fijar la transparencia del video al 0 %» para verte bien.',
      'Agrega un «por siempre» y dentro «ir a mi nariz» (IA · Cuerpo). Presiona la bandera y mueve la cabeza.',
      'Selecciona el Sombrero. Programa: «al presionar 🚩», «por siempre», «ir a x: (x de mi nariz) y: (y de mi nariz + 90)».',
    ],
    reto: 'Agrega unas gafas 🕶️ que sigan tus ojos y un personaje que siga tu mano derecha.',
    solucion: () => proyecto('Nariz de payaso', 'blanco', [
      personaje('s1', 'Nariz', ['🔴', '🐽'], 0, 0, bloques(guion(40, 40, bandera(), video(true), B('ia_video_transp', { inputs: { N: n(0) } }),
        siempre(B('ia_ir_a_parte', { fields: { P: 'nose' } })))), { tam: 70 }),
      personaje('s2', 'Sombrero', ['🎩', '👑', '🧢'], 0, 90, bloques(guion(40, 40, bandera(), siempre(
        B('mv_ir_xy', { inputs: { X: con(B('ia_parte_x', { fields: { P: 'nose' } }), n(0)), Y: con(suma(con(B('ia_parte_y', { fields: { P: 'nose' } }), n(0)), n(90)), n(0)) } })))), { tam: 170 }),
    ]),
  },
  {
    id: 'globos', emoji: '🎈', titulo: 'Revienta globos con la mano', nivel: 'Intermedio', tipo: 'IA · Cuerpo', minutos: 30,
    resumen: 'Un juego que se controla con el cuerpo: revienta todos los globos que puedas en 30 segundos.',
    idea: 'La cámara puede ser un control de juego. La IA sigue tu muñeca muchas veces por segundo y el programa usa su posición como si fuera un ratón.',
    necesita: 'Cámara y espacio para mover los brazos.',
    pasos: [
      'Con la Mano seleccionada: «al presionar 🚩», «encender el video en el escenario», «por siempre», «ir a mi mano derecha».',
      'Crea la variable «globos». Selecciona el Globo.',
      'Globo: «al presionar 🚩», «fijar globos a 0» y «reiniciar cronómetro» (Sensores).',
      'Agrega «repetir hasta que cronómetro > 30» (usa el bloque > de Operadores).',
      'Dentro: «si ¿tocando Mano? entonces»: «cambiar globos por 1», «tocar el sonido pop» e «ir a una posición al azar».',
      'Después del repetir, agrega «decir (unir ¡Tiempo! Globos: con globos)».',
    ],
    reto: 'Agrega un segundo globo de otro color que valga 3 puntos y se mueva solo.',
    solucion: () => proyecto('Revienta globos', 'cielo', [
      personaje('s1', 'Mano', ['🖐️', '🥊'], -100, 0, bloques(guion(40, 40, bandera(), video(true), siempre(B('ia_ir_a_parte', { fields: { P: 'right_wrist' } })))), { tam: 110, rot: 'no' }),
      personaje('s2', 'Globo', ['🎈', '🟣', '🟡'], 100, 60, bloques(guion(40, 40, bandera(), fijar('globos', n(0)), B('se_reiniciar_crono'),
        B('ctl_repetir_hasta', { inputs: { C: { block: comparar(con(B('se_cronometro'), n(0)), 'GT', n(30)) }, DO: { block: pila(
          si(tocando('Mano'), sumar('globos', 1), sonido('pop'), B('ap_disfraz_sig'), B('mv_ir_a', { fields: { A: 'azar' } }))) } } }),
        B('ap_decir', { inputs: { T: con(unir(t('¡Tiempo! Globos: '), con(leer('globos'), t(''))), t('')) } }), sonido('campana'))), { tam: 120 }),
    ], { variables: variables('globos') }),
  },
  {
    id: 'guardian', emoji: '🕵️', titulo: 'Guardián de objetos', nivel: 'Intermedio', tipo: 'IA · Objetos', minutos: 25,
    resumen: 'Chaski vigila con la cámara: cuenta personas y suena la alarma si ve un celular.',
    idea: 'Detectar objetos es encontrar qué hay en la imagen y dónde está. Este modelo ya viene entrenado con miles de fotos y reconoce unas 80 cosas: personas, celulares, botellas, tazas, mochilas…',
    necesita: 'Cámara y un celular (o una botella, una taza, un libro).',
    pasos: [
      '«al presionar 🚩» y «encender el video en el escenario». Verás recuadros sobre lo que la IA reconoce.',
      'Agrega un «por siempre» y dentro un «si … entonces / si no».',
      'En el hueco pon «¿la IA detecta celular?» (IA · Objetos). Adentro: «cambiar al disfraz número 3», «decir ¡Guarda el celular!» y «tocar el sonido alarma».',
      'En el «si no», pon otro «si … entonces / si no» con «¿la IA detecta persona?».',
      'Si hay persona: disfraz 2 y «decir (unir Personas que veo: con cantidad de persona)». Si no: disfraz 1 y «decir No veo a nadie…».',
    ],
    reto: 'Cambia el celular por otro objeto del menú y haz que Chaski se mueva hacia donde está (usa «x de…»).',
    solucion: () => proyecto('Guardián de objetos', 'blanco', [
      personaje('s1', 'Chaski', ['🤖', '😀', '😠'], -170, -110, bloques(guion(40, 40, bandera(), video(true), siempre(
        siSino(detecta('cell phone'),
          [disfraz(3), decirFijo('¡Guarda el celular!'), sonido('alarma')],
          [siSino(detecta('person'),
            [disfraz(2), B('ap_decir', { inputs: { T: con(unir(t('Personas que veo: '), con(B('ia_obj_cuenta', { fields: { O: 'person' } }), t(''))), t('')) } })],
            [disfraz(1), decirFijo('No veo a nadie…')])])))), { tam: 130 }),
    ]),
  },
  {
    id: 'voz', emoji: '🎤', titulo: 'Asistente de voz', nivel: 'Intermedio', tipo: 'IA · Voz', minutos: 30,
    resumen: 'Crea tu propio asistente: Chaski escucha tus órdenes y responde hablando.',
    idea: 'El reconocimiento de voz convierte el sonido en texto. Luego el programa busca palabras clave en ese texto. Así funcionan los asistentes de los celulares y los parlantes inteligentes.',
    necesita: 'Micrófono y el navegador Chrome o Edge.',
    pasos: [
      '«al presionar 🚩» y «decir en voz alta Hola, dime una orden».',
      'Agrega un «por siempre» y dentro «escuchar y esperar» (IA · Voz). El programa se detiene hasta que hables.',
      'Agrega «si ¿escuché hola? entonces» → «decir en voz alta Hola, qué gusto escucharte».',
      'Agrega más órdenes: «noche» → cambiar el fondo a Noche; «día» → cambiar el fondo a Cielo.',
      'Agrega «salta»: tocar el sonido salto, sumar a y 60, esperar 0.2 segundos, sumar a y -60.',
      'Prueba hablando claro y cerca del micrófono. El bloque «lo que escuché» te muestra qué entendió la IA.',
    ],
    reto: 'Haz que Chaski pregunte tu nombre con la voz y luego te salude usando «lo que escuché».',
    solucion: () => proyecto('Asistente de voz', 'cielo', [
      personaje('s1', 'Chaski', ['🤖', '😀'], 0, -30, bloques(guion(40, 40, bandera(), hablar('Hola, dime una orden'), siempre(
        B('ia_escuchar'),
        B('ap_decir', { inputs: { T: con(B('ia_lo_oido'), t('')) } }),
        si(oyo('hola'), hablar('Hola, qué gusto escucharte')),
        si(oyo('noche'), fondo('noche')),
        si(oyo('día'), fondo('cielo')),
        si(oyo('salta'), sonido('salto'), sumarY(60), esperar(0.2), sumarY(-60)),
        si(oyo('baila'), repetir(4, sumarX(20), esperar(0.1), sumarX(-20), esperar(0.1))),
        si(oyo('adiós'), hablar('Hasta luego'), B('ctl_detener', { fields: { Q: 'todo' } }))))), { tam: 160 }),
    ]),
  },
]

/** Proyecto para empezar una actividad paso a paso: los personajes listos y los bloques por armar. */
export function proyectoInicial(a: Actividad): Proyecto {
  const p = a.solucion()
  p.sprites = p.sprites.map((s, i) => ({ ...s, bloques: bloques(...(i === 0 ? [guion(40, 40, bandera())] : [])) }))
  p.variables = []
  return p
}
