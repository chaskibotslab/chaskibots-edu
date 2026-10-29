// Mesa de electrónica (E1): la protoboard (base, como el chasis de un robot)
// y los componentes que se pinchan en ella. Los valores eléctricos son los de
// las piezas de los kits (LED de 5 mm, resistencias de ¼ W, pulsador de 6 mm,
// buzzer de 12 mm, potenciómetro de 10 kΩ, LDR de 5 mm) y los usa
// engine/circuito.ts para resolver el circuito.
//
// Marco de cada componente: origen en un agujero de la protoboard (la fila más
// cerca de la canaleta), patas a lo largo de x, cada una en su propia columna.
// El cable de cada pin entra en la misma tira de 5 agujeros, 3 agujeros hacia
// afuera (−z): así la pata y su cable quedan unidos por dentro, como en la
// protoboard real. PATAS_CIRCUITO dice dónde cae cada pata.
//
// Los pines de los componentes son 'digital' aunque vayan a tierra o a 5 V:
// 'gnd' y 'alim' quedan para las placas y baterías (la verificación los usa
// para detectar cortocircuitos).

import type { PiezaDef, PuntoMontaje } from '../tipos'

/** Alto de la protoboard (mm): los componentes se apoyan sobre su cara de arriba. */
export const ALTO_PROTOBOARD = 8.5
/** Distancia entre agujeros (mm). */
export const PASO_PROTOBOARD = 2.54
/** x de la columna k (0–62) de la protoboard. */
export const xColumna = (k: number) => -78.7 + k * PASO_PROTOBOARD
/** |z| de la fila i (0–4) de una tira: 0 es la más cercana a la canaleta. */
export const zFila = (i: number) => 3.81 + i * PASO_PROTOBOARD
/** Huecos para componentes: 8 lugares × 2 mitades (arriba y abajo de la canaleta). */
export const COLUMNAS_PROTOBOARD = 8
/** Cada lugar está 7 columnas después del anterior: los componentes no comparten tiras. */
const PRIMERA_COLUMNA = 6
const COLUMNAS_ENTRE_LUGARES = 7
/** z (marco del componente) donde entran los cables: fila 3 de la misma tira. */
export const Z_CABLE_PROTOBOARD = -3 * PASO_PROTOBOARD

/**
 * Patas de cada componente en el marco de su hueco (mm): todas caen en agujeros.
 * Los que tienen patas a medio paso del centro (LED, buzzer, pulsador) se corren
 * 1,27 mm (ver CENTRO_CIRCUITO) para que sus patas entren en los agujeros.
 */
export const PATAS_CIRCUITO: Record<string, { pin: string; x: number; z: number }[]> = {
  'proc:led': [{ pin: 'A', x: 0, z: 0 }, { pin: 'K', x: 2.54, z: 0 }],
  'proc:led-rgb': [{ pin: 'R', x: -2.54, z: 0 }, { pin: 'K', x: 0, z: 0 }, { pin: 'G', x: 2.54, z: 0 }, { pin: 'B', x: 5.08, z: 0 }],
  'proc:resistencia': [{ pin: '1', x: -5.08, z: 0 }, { pin: '2', x: 5.08, z: 0 }],
  // Pulsador de 4 patas: las dos de cada lado van en la misma tira (están unidas por dentro).
  'proc:pulsador': [{ pin: '1', x: -2.54, z: 0 }, { pin: '1', x: -2.54, z: -2.54 }, { pin: '2', x: 5.08, z: 0 }, { pin: '2', x: 5.08, z: -2.54 }],
  'proc:buzzer': [{ pin: '+', x: -2.54, z: 0 }, { pin: '-', x: 5.08, z: 0 }],
  'proc:potenciometro': [{ pin: '1', x: -5.08, z: 0 }, { pin: 'W', x: 0, z: 0 }, { pin: '2', x: 5.08, z: 0 }],
  'proc:ldr': [{ pin: '1', x: -2.54, z: 0 }, { pin: '2', x: 2.54, z: 0 }],
}
/** Dónde va el centro del cuerpo de cada componente respecto a su hueco (x, z en mm). */
export const CENTRO_CIRCUITO: Record<string, [number, number]> = {
  'proc:led': [1.27, 0],
  'proc:led-rgb': [1.27, 0],
  'proc:pulsador': [1.27, -1.27],
  'proc:buzzer': [1.27, 0],
}

function huecos(): PuntoMontaje[] {
  const out: PuntoMontaje[] = []
  for (let fila = 0; fila < 2; fila++) {
    for (let c = 0; c < COLUMNAS_PROTOBOARD; c++) {
      const n = fila * COLUMNAS_PROTOBOARD + c + 1
      out.push({
        id: `hueco-${n}`,
        tipo: 'protoboard',
        nombre: `${fila === 0 ? 'Arriba' : 'Abajo'}, columna ${c + 1}`,
        posicion: [xColumna(PRIMERA_COLUMNA + c * COLUMNAS_ENTRE_LUGARES), ALTO_PROTOBOARD, fila === 0 ? -zFila(0) : zFila(0)],
        // Abajo de la canaleta el componente mira al revés: sus cables salen hacia el borde.
        rotacion: fila === 0 ? [0, 0, 0] : [0, 180, 0],
      })
    }
  }
  return out
}

export const PROTOBOARD: PiezaDef = {
  id: 'protoboard-830',
  nombre: 'Protoboard 830 puntos',
  familia: 'chasis',
  descripcion: 'La base de la mesa de electrónica. Se pinchan los componentes sin soldar; la placa va al lado y los cables unen sus pines con los de cada componente.',
  enKits: true,
  modelo: 'proc:protoboard',
  masa_g: 85,
  material: 'plastico',
  color: '#f4f4f0',
  colisionadores: [{ forma: 'caja', medidas: [165, ALTO_PROTOBOARD, 55], centro: [0, ALTO_PROTOBOARD / 2, 0] }],
  montajes: [
    { id: 'placa', tipo: 'placa', nombre: 'Lugar de la placa', posicion: [-127, 0, 0], rotacionesPermitidas: [0, 180] },
    ...huecos(),
    // Módulos (E2): el HC-SR04 parado sobre la mesa a la derecha, mirando hacia afuera (+x),
    // con sus 4 cables hembra directo a la placa (pinchado en la protoboard sus 4 pines
    // quedarían en la misma tira y se unirían);
    // un servo sobre la mesa, detrás de la protoboard; y la maqueta del proyecto a la derecha.
    { id: 'sensor', tipo: 'sensor-frontal', nombre: 'A la derecha de la protoboard (sensor)', posicion: [105, 0, 0] },
    { id: 'servo', tipo: 'soporte-servo', nombre: 'Detrás de la protoboard (servo)', posicion: [30, 0, -50] },
    { id: 'maqueta', tipo: 'maqueta', nombre: 'Junto a la protoboard (maqueta)', posicion: [175, 0, 0] },
    // Batería sobre la mesa, adelante, con los bornes hacia la protoboard: para
    // probar circuitos sin placa (LED + resistencia + pila).
    { id: 'bateria', tipo: 'bateria', nombre: 'Delante de la protoboard (batería)', posicion: [-40, 0, 72], rotacion: [0, 90, 0] },
  ],
  encaja: [],
  pines: [],
  comportamiento: { tipo: 'protoboard' },
  datos: [['Puntos', '830 (630 + 200 de los rieles)'], ['Medidas', '165 × 55 × 8,5 mm'], ['Tiras', '5 huecos unidos por dentro, a cada lado de la canaleta']],
}

const LED_COLORES = [
  { id: 'rojo', nombre: 'rojo', color: '#ef4444', vf: 2.0 },
  { id: 'amarillo', nombre: 'amarillo', color: '#facc15', vf: 2.1 },
  { id: 'verde', nombre: 'verde', color: '#22c55e', vf: 2.2 },
  { id: 'azul', nombre: 'azul', color: '#3b82f6', vf: 3.0 },
  { id: 'blanco', nombre: 'blanco', color: '#f8fafc', vf: 3.0 },
] as const

const CUERPO_LED = [{ forma: 'cilindro' as const, radio: 2.5, alto: 8.6, eje: 'y' as const, centro: [0, 9.3, 0] as [number, number, number] }]

export const LEDS: PiezaDef[] = LED_COLORES.map(c => ({
  id: `led-${c.id}`,
  nombre: `LED ${c.nombre}`,
  familia: 'circuito',
  descripcion: `LED de 5 mm ${c.nombre}. Enciende cuando la corriente entra por la pata larga (ánodo, +) y sale por la corta (cátodo, −). Siempre con una resistencia en serie: sin ella se quema.`,
  enKits: c.id === 'rojo' || c.id === 'amarillo' || c.id === 'verde',
  modelo: 'proc:led',
  masa_g: 0.4,
  material: 'plastico',
  color: c.color,
  colisionadores: CUERPO_LED,
  montajes: [],
  encaja: ['protoboard'],
  pines: [
    { nombre: 'A', tipo: 'digital', ayuda: 'Ánodo (+), la pata larga: hacia el pin de la placa' },
    { nombre: 'K', tipo: 'digital', ayuda: 'Cátodo (−), la pata corta: hacia la resistencia y tierra' },
  ],
  comportamiento: { tipo: 'led', color: c.color, vf: c.vf },
  datos: [['Voltaje de encendido', `${c.vf.toFixed(1)} V`], ['Corriente ideal', '10–15 mA'], ['Máximo', '20 mA (más de 30 mA lo quema)']],
  fuente: 'Hoja de datos típica de LED de 5 mm',
}))

export const LED_RGB: PiezaDef = {
  id: 'led-rgb',
  nombre: 'LED RGB (cátodo común)',
  familia: 'circuito',
  descripcion: 'Tres LED (rojo, verde y azul) en una sola cápsula, con el cátodo compartido. Mezclando los tres con PWM salen todos los colores.',
  modelo: 'proc:led-rgb',
  masa_g: 0.5,
  material: 'plastico',
  color: '#f1f5f9',
  colisionadores: CUERPO_LED,
  montajes: [],
  encaja: ['protoboard'],
  pines: [
    { nombre: 'R', tipo: 'pwm', ayuda: 'Ánodo rojo (con su resistencia)' },
    { nombre: 'K', tipo: 'digital', ayuda: 'Cátodo común, la pata más larga: a tierra' },
    { nombre: 'G', tipo: 'pwm', ayuda: 'Ánodo verde (con su resistencia)' },
    { nombre: 'B', tipo: 'pwm', ayuda: 'Ánodo azul (con su resistencia)' },
  ],
  comportamiento: { tipo: 'led-rgb', vf: [2.0, 3.0, 3.0] },
  datos: [['Tipo', 'Cátodo común'], ['Voltaje de encendido', 'R 2,0 V · G 3,0 V · B 3,0 V']],
}

/** Colores de las bandas: 1.ª cifra, 2.ª cifra, multiplicador (y dorado = 5 %). */
export const RESISTENCIAS = [
  { ohm: 220, nombre: '220 Ω', bandas: ['#dc2626', '#dc2626', '#7c2d12'] },
  { ohm: 330, nombre: '330 Ω', bandas: ['#f97316', '#f97316', '#7c2d12'] },
  { ohm: 1000, nombre: '1 kΩ', bandas: ['#7c2d12', '#111111', '#dc2626'] },
  { ohm: 10000, nombre: '10 kΩ', bandas: ['#7c2d12', '#111111', '#f97316'] },
]

export const RESISTENCIAS_PIEZAS: PiezaDef[] = RESISTENCIAS.map(r => ({
  id: `resistencia-${r.ohm}`,
  nombre: `Resistencia ${r.nombre}`,
  familia: 'circuito',
  descripcion: `Frena la corriente. ${r.ohm <= 330 ? 'Es la que va en serie con cada LED.' : r.ohm === 1000 ? 'Con una LDR forma un divisor de voltaje para medir la luz.' : 'Sirve de pull-down o pull-up y para divisores de voltaje.'} No tiene lado: puede ir en cualquier sentido.`,
  enKits: r.ohm === 330 || r.ohm === 1000,
  modelo: 'proc:resistencia',
  masa_g: 0.25,
  material: 'plastico',
  colisionadores: [{ forma: 'cilindro', radio: 1.2, alto: 6.3, eje: 'x', centro: [0, 3, 0] }],
  montajes: [],
  encaja: ['protoboard'],
  pines: [
    { nombre: '1', tipo: 'digital', ayuda: 'Una punta (da igual cuál)' },
    { nombre: '2', tipo: 'digital', ayuda: 'La otra punta' },
  ],
  comportamiento: { tipo: 'resistencia', ohm: r.ohm },
  datos: [['Valor', r.nombre], ['Tolerancia', '5 % (banda dorada)'], ['Potencia', '¼ W']],
}))

export const PULSADOR: PiezaDef = {
  id: 'pulsador',
  nombre: 'Pulsador 6 mm',
  familia: 'circuito',
  descripcion: 'Botón que une sus dos lados mientras lo presionas. Con INPUT_PULLUP no necesita resistencia: un lado al pin y el otro a tierra (presionado se lee LOW).',
  enKits: true,
  modelo: 'proc:pulsador',
  masa_g: 0.6,
  material: 'plastico',
  colisionadores: [{ forma: 'caja', medidas: [6, 5, 6], centro: [0, 2.5, 0] }],
  montajes: [],
  encaja: ['protoboard'],
  pines: [
    { nombre: '1', tipo: 'digital', ayuda: 'Un lado del botón: al pin de la placa' },
    { nombre: '2', tipo: 'digital', ayuda: 'El otro lado: a tierra (con INPUT_PULLUP)' },
  ],
  comportamiento: { tipo: 'pulsador' },
  datos: [['Tipo', 'Táctil, 4 patas (unidas de a dos)'], ['Rebote', '< 5 ms']],
}

export const BUZZER_PASIVO: PiezaDef = {
  id: 'buzzer-pasivo',
  nombre: 'Buzzer pasivo',
  familia: 'circuito',
  descripcion: 'Parlante pequeño: suena con tone(pin, frecuencia), que lo hace vibrar. Con digitalWrite(HIGH) solo hace un clic.',
  enKits: true,
  modelo: 'proc:buzzer',
  masa_g: 2,
  material: 'plastico',
  colisionadores: [{ forma: 'cilindro', radio: 6, alto: 9.5, eje: 'y', centro: [0, 4.75, 0] }],
  montajes: [],
  encaja: ['protoboard'],
  pines: [
    { nombre: '+', tipo: 'digital', ayuda: 'Positivo: al pin de la placa (tone)' },
    { nombre: '-', tipo: 'digital', ayuda: 'Negativo: a tierra' },
  ],
  comportamiento: { tipo: 'buzzer', activo: false, ohm: 150 },
  datos: [['Tipo', 'Pasivo (necesita tone)'], ['Rango útil', '200–5000 Hz']],
}

export const BUZZER_ACTIVO: PiezaDef = {
  ...BUZZER_PASIVO,
  id: 'buzzer-activo',
  nombre: 'Buzzer activo',
  descripcion: 'Trae su propio oscilador: suena siempre con el mismo tono (unos 2300 Hz) mientras recibe HIGH. Se reconoce por la etiqueta y el fondo sellado.',
  enKits: false,
  comportamiento: { tipo: 'buzzer', activo: true, ohm: 150 },
  datos: [['Tipo', 'Activo (con oscilador)'], ['Tono', '≈ 2300 Hz']],
}

export const POTENCIOMETRO: PiezaDef = {
  id: 'potenciometro-10k',
  nombre: 'Potenciómetro 10 kΩ',
  familia: 'circuito',
  descripcion: 'Perilla que reparte el voltaje: las puntas a 5 V y a tierra, y la pata del medio (cursor) da de 0 a 5 V según cuánto la gires. Se lee con analogRead.',
  enKits: true,
  modelo: 'proc:potenciometro',
  masa_g: 3,
  material: 'plastico',
  colisionadores: [{ forma: 'caja', medidas: [10, 7, 10], centro: [0, 3.5, 0] }],
  montajes: [],
  encaja: ['protoboard'],
  pines: [
    { nombre: '1', tipo: 'digital', ayuda: 'Una punta: a 5 V (o 3,3 V)' },
    { nombre: 'W', tipo: 'analogico', ayuda: 'Cursor: a una entrada analógica' },
    { nombre: '2', tipo: 'digital', ayuda: 'La otra punta: a tierra' },
  ],
  comportamiento: { tipo: 'potenciometro', ohm: 10000 },
  datos: [['Valor', '10 kΩ, lineal (B10K)'], ['Giro', '300°']],
}

export const LDR: PiezaDef = {
  id: 'ldr',
  nombre: 'Fotorresistencia (LDR)',
  familia: 'circuito',
  descripcion: 'Su resistencia baja con la luz: unos 1 kΩ al sol y 1 MΩ a oscuras. Con una resistencia de 1 kΩ forma un divisor y analogRead mide la luz.',
  enKits: true,
  modelo: 'proc:ldr',
  masa_g: 0.3,
  material: 'plastico',
  colisionadores: [{ forma: 'cilindro', radio: 2.5, alto: 2, eje: 'y', centro: [0, 6, 0] }],
  montajes: [],
  encaja: ['protoboard'],
  pines: [
    { nombre: '1', tipo: 'digital', ayuda: 'Una pata (da igual cuál): a 5 V' },
    { nombre: '2', tipo: 'digital', ayuda: 'La otra: a la entrada analógica y a la resistencia' },
  ],
  comportamiento: { tipo: 'ldr', ohmLuz: 1000, ohmOscuro: 1_000_000 },
  datos: [['Con luz', '≈ 1 kΩ'], ['A oscuras', '≈ 1 MΩ'], ['Tipo', 'GL5528']],
}

// ---------------------------------------------------------------------------
// Maqueta del basurero (E2, kit de 9no)
// ---------------------------------------------------------------------------
// Marco: origen en el centro de la base; el sensor va en la cara +x (la mano
// llega por ese lado). La tapa cuelga de una bisagra en el borde de atrás
// (−z), arriba, a lo largo de x: así se levanta de frente a la cámara. El
// servo va acostado en un poste, en la esquina de atrás junto al sensor, con
// su eje en la línea de la bisagra; la tapa se encastra en ese eje: con el
// servo en 0° la tapa está cerrada (horizontal) y en 90° abierta (vertical),
// como en el kit.

/** Medidas del basurero (mm): base cuadrada y alto. */
export const BASURERO = { lado: 100, alto: 110 }
/** Eje del servo = punta de la bisagra de la tapa (esquina de atrás del lado del sensor, apenas sobre el borde). */
export const BISAGRA_BASURERO: [number, number, number] = [52, 113, -52]
/** Poste que sostiene el servo (x, z) y su alto (hasta la base del servo acostado). */
export const POSTE_SERVO = { x: 68.5, z: -52, alto: 95 }

export const MAQUETA_BASURERO: PiezaDef = {
  id: 'maqueta-basurero',
  nombre: 'Basurero (maqueta)',
  familia: 'circuito',
  descripcion: 'Un basurero pequeño para el proyecto de 9no: el sensor ultrasónico va en el frente y el servo, de costado junto a la bisagra, abre la tapa.',
  modelo: 'proc:basurero',
  masa_g: 120,
  material: 'plastico',
  color: '#15803d',
  colisionadores: [
    { forma: 'caja', medidas: [BASURERO.lado, BASURERO.alto, BASURERO.lado], centro: [0, BASURERO.alto / 2, 0] },
    // Poste del servo.
    { forma: 'caja', medidas: [10, POSTE_SERVO.alto, 10], centro: [POSTE_SERVO.x, POSTE_SERVO.alto / 2, POSTE_SERVO.z] },
  ],
  montajes: [
    { id: 'sensor', tipo: 'sensor-frontal', nombre: 'Frente del basurero', posicion: [BASURERO.lado / 2 + 1, 40, 0] },
    // Servo acostado (girado 90° en z): su +y (el eje) apunta a −x y su +x hacia
    // arriba. El eje (6 mm en x y 28 mm en y, en el marco del servo) cae justo en la bisagra.
    { id: 'servo', tipo: 'soporte-servo', nombre: 'Soporte del servo (bisagra)', posicion: [BISAGRA_BASURERO[0] + 28, BISAGRA_BASURERO[1] - 6, BISAGRA_BASURERO[2]], rotacion: [0, 0, 90] },
  ],
  encaja: ['maqueta'],
  pines: [],
  comportamiento: { tipo: 'maqueta' },
  datos: [['Medidas', '100 × 100 × 110 mm'], ['Tapa', 'Con bisagra atrás, la mueve un servo'], ['Sensor', 'En el frente, mirando hacia afuera']],
}

/**
 * Tapa del basurero. Marco = el del eje del servo acostado: el ancho va a lo
 * largo del eje (+y), el largo hacia +x (vertical cuando el servo está en 90°)
 * y el grosor hacia +z (queda abajo cuando la tapa se cierra).
 */
export const TAPA_BASURERO: PiezaDef = {
  id: 'tapa-basurero',
  nombre: 'Tapa del basurero',
  familia: 'circuito',
  descripcion: 'Va en el eje del servo: con 0° queda cerrada y con 90° abierta.',
  modelo: 'proc:tapa-basurero',
  masa_g: 15,
  material: 'plastico',
  color: '#166534',
  colisionadores: [{ forma: 'caja', medidas: [BASURERO.lado + 4, BASURERO.lado + 4, 3], centro: [(BASURERO.lado + 4) / 2, (BASURERO.lado + 4) / 2, 1.5] }],
  montajes: [],
  encaja: ['eje-servo'],
  pines: [],
  comportamiento: { tipo: 'maqueta' },
  datos: [['Medidas', '104 × 104 × 3 mm'], ['Cerrada', 'Servo en 0°'], ['Abierta', 'Servo en 90°']],
}

export const PIEZAS_CIRCUITO: PiezaDef[] = [...LEDS, LED_RGB, ...RESISTENCIAS_PIEZAS, PULSADOR, BUZZER_PASIVO, BUZZER_ACTIVO, POTENCIOMETRO, LDR, MAQUETA_BASURERO, TAPA_BASURERO]
