/**
 * Guías de armado LEGO EV3 (modelos LDraw empaquetados en public/ldraw).
 * Cada paso corresponde a un `0 STEP` del .ldr de scripts/ldraw, en el mismo orden.
 * `tipo` es la pieza del catálogo (public/ldraw/piezas/<tipo>.mpd) que el alumno debe elegir.
 */
export interface PasoGuia { tipo: string; titulo: string; info: string }
export interface Guia {
  id: string; nombre: string; emoji: string; descripcion: string; archivo: string; pasos: PasoGuia[]
  /** Tiene ladrillo EV3: se puede elegir en «Programar» para simularlo. */
  simulable?: boolean
}

/** Pasos (0 STEP) de las ruedas en todos los modelos: sirven para hacerlas girar al simular. */
export const PASO_RUEDA_IZQ = 6, PASO_RUEDA_DER = 7

const PASOS_CARRITO: PasoGuia[] = [
  { tipo: 'motor_grande', titulo: 'Motor grande izquierdo', info: 'Empezamos por la fuerza del robot: el motor grande que mueve la rueda izquierda.' },
  { tipo: 'motor_grande', titulo: 'Motor grande derecho', info: 'El segundo motor, paralelo al primero. Cada motor mueve una rueda.' },
  { tipo: 'viga_11', titulo: 'Viga roja de arriba', info: 'Una viga de 11 agujeros cruza por encima y une los dos motores.' },
  { tipo: 'viga_11', titulo: 'Viga roja de abajo', info: 'Otra viga de 11 cruza por debajo: ahora el chasis no se abre ni se tuerce.' },
  { tipo: 'viga_7', titulo: 'Viga de la cola', info: 'Una viga de 7 sale hacia atrás, entre los motores. Aquí irá la rueda loca.' },
  { tipo: 'rueda_loca', titulo: 'Rueda loca', info: 'Una bola de acero bajo la cola: sostiene el robot y lo deja girar hacia cualquier lado.' },
  { tipo: 'rueda', titulo: 'Rueda izquierda', info: 'Llanta y neumático en el eje rojo del motor izquierdo.' },
  { tipo: 'rueda', titulo: 'Rueda derecha', info: 'La rueda del motor derecho. Con dos ruedas motrices el robot avanza y gira.' },
]

const NARIZ: PasoGuia = { tipo: 'viga_7', titulo: 'Viga de la nariz', info: 'Una viga de 7 sale hacia adelante, apoyada en la viga roja. Sostendrá lo que va al frente y el ladrillo.' }
const VERTICAL: PasoGuia = { tipo: 'viga_5', titulo: 'Viga vertical', info: 'Una viga de 5 cuelga de la punta de la nariz: es el soporte de lo que va cerca del piso.' }
const LADRILLO: PasoGuia = { tipo: 'brick', titulo: 'Ladrillo inteligente EV3', info: 'El cerebro del robot: se apoya sobre los motores y la nariz. Aquí se ejecuta tu programa.' }
const SENSOR_COLOR: PasoGuia = { tipo: 'sensor_color', titulo: 'Sensor de color', info: 'Va en la viga vertical mirando al piso, para seguir líneas y reconocer colores.' }

export const GUIAS: Guia[] = [
  {
    id: 'carrito', nombre: 'Carrito de dos motores', emoji: '🚗',
    descripcion: 'Tu primer chasis: dos motores, vigas, dos ruedas y una rueda loca.',
    archivo: '/ldraw/carrito.mpd',
    pasos: PASOS_CARRITO,
  },
  {
    id: 'explorador', nombre: 'Robot explorador EV3', emoji: '🤖',
    descripcion: 'El carrito completo con ladrillo inteligente, sensor de color y sensor infrarrojo.',
    archivo: '/ldraw/ev3-robot.mpd', simulable: true,
    pasos: [
      ...PASOS_CARRITO,
      NARIZ, VERTICAL, LADRILLO, SENSOR_COLOR,
      { tipo: 'sensor_ir', titulo: 'Sensor infrarrojo', info: '¡Último! Sobre la nariz, mirando al frente: mide la distancia a los obstáculos.' },
    ],
  },
  {
    id: 'seguidor', nombre: 'Seguidor de línea', emoji: '〰️',
    descripcion: 'El carrito con ladrillo y un sensor de color mirando al piso, listo para seguir una línea negra.',
    archivo: '/ldraw/seguidor.mpd', simulable: true,
    pasos: [
      ...PASOS_CARRITO, NARIZ, VERTICAL, LADRILLO,
      { ...SENSOR_COLOR, info: '¡Último! En la viga vertical, mirando al piso: verá la línea negra para seguirla.' },
    ],
  },
  {
    id: 'parachoques', nombre: 'Robot con parachoques', emoji: '🛡️',
    descripcion: 'Un sensor táctil al frente con una viga de parachoques: el robot sabe cuándo chocó.',
    archivo: '/ldraw/parachoques.mpd', simulable: true,
    pasos: [
      ...PASOS_CARRITO, NARIZ, LADRILLO,
      { tipo: 'sensor_tactil', titulo: 'Sensor táctil', info: 'Sobre la nariz, con el botón rojo hacia adelante. Cuando algo lo aprieta, el robot lo siente.' },
      { tipo: 'viga_11', titulo: 'Parachoques', info: '¡Último! Una viga de 11 delante del botón: así el robot siente el choque en todo su ancho.' },
    ],
  },
  {
    id: 'topadora', nombre: 'Robot topadora', emoji: '🚜',
    descripcion: 'Un marco amarillo al frente hace de pala para empujar objetos fuera del camino.',
    archivo: '/ldraw/topadora.mpd', simulable: true,
    pasos: [
      ...PASOS_CARRITO, NARIZ, VERTICAL,
      { tipo: 'marco_11', titulo: 'Pala', info: 'Un marco de 5×11 parado delante de la viga vertical: es la pala que empuja.' },
      { ...LADRILLO, info: '¡Último! El cerebro del robot, apoyado sobre los motores y la nariz.' },
    ],
  },
]

/** El robot que se arma en «Armar» y se mueve en «Programar». */
export const GUIA_ROBOT = GUIAS[1]

/** Robots que se pueden simular en «Programar». */
export const ROBOTS_SIMULABLES = GUIAS.filter(g => g.simulable)
