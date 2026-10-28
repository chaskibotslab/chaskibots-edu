// Bloques del laboratorio (Blockly, en español) y la caja de herramientas,
// que solo muestra los bloques de las piezas que tiene el robot.

import type { PartesRobot, ProgramaBloques } from './generador'

const MOVIMIENTO = '#E57361'
const SENSORES = '#0ea5e9'
const ACCIONES = '#8b5cf6'
const EVENTOS = '#f59e0b'

export const DEFINICIONES = [
  {
    type: 'cb_iniciar', message0: 'al encender %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
    colour: EVENTOS, tooltip: 'Se ejecuta una sola vez, cuando el robot se enciende (setup).',
  },
  {
    type: 'cb_siempre', message0: 'repetir siempre %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
    colour: EVENTOS, tooltip: 'Se repite una y otra vez mientras el robot está encendido (loop).',
  },
  {
    type: 'cb_mover', message0: '%1 a velocidad %2 %%',
    args0: [
      { type: 'field_dropdown', name: 'DIR', options: [['avanzar', 'ADELANTE'], ['retroceder', 'ATRAS'], ['girar a la izquierda', 'IZQ'], ['girar a la derecha', 'DER']] },
      { type: 'input_value', name: 'VEL', check: 'Number' },
    ],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: MOVIMIENTO,
    tooltip: 'Mueve el robot. La velocidad va de 0 a 100 %.',
  },
  {
    type: 'cb_lados', message0: 'motores: izquierdo %1 %% derecho %2 %%',
    args0: [{ type: 'input_value', name: 'IZQ', check: 'Number' }, { type: 'input_value', name: 'DER', check: 'Number' }],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: MOVIMIENTO,
    tooltip: 'Velocidad de cada lado de -100 (atrás) a 100 (adelante). Si son distintas, el robot curva.',
  },
  { type: 'cb_detener', message0: 'detener motores', previousStatement: null, nextStatement: null, colour: MOVIMIENTO },
  {
    type: 'cb_esperar', message0: 'esperar %1 segundos', args0: [{ type: 'input_value', name: 'SEG', check: 'Number' }],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: EVENTOS,
  },
  {
    type: 'cb_linea', message0: 'el sensor de línea %1 ve negro',
    args0: [{ type: 'field_dropdown', name: 'LADO', options: [['izquierdo', 'IZQ'], ['derecho', 'DER']] }],
    output: 'Boolean', colour: SENSORES, tooltip: 'Verdadero cuando el sensor está sobre la línea negra (DO en HIGH).',
  },
  {
    type: 'cb_linea_valor', message0: 'valor del sensor de línea %1',
    args0: [{ type: 'field_dropdown', name: 'LADO', options: [['izquierdo', 'IZQ'], ['derecho', 'DER']] }],
    output: 'Number', colour: SENSORES, tooltip: 'Lectura analógica de 0 a 1023: sube cuanto más oscuro es el piso.',
  },
  { type: 'cb_distancia', message0: 'distancia del ultrasonido (cm)', output: 'Number', colour: SENSORES, tooltip: 'Distancia al objeto de adelante (400 si no ve nada).' },
  {
    type: 'cb_obstaculo', message0: 'el sensor IR %1 detecta algo',
    args0: [{ type: 'field_dropdown', name: 'LADO', options: [['izquierdo', 'IZQ'], ['derecho', 'DER']] }],
    output: 'Boolean', colour: SENSORES, tooltip: 'Verdadero cuando hay algo cerca del sensor FC-51 (su salida baja a LOW).',
  },
  { type: 'cb_tiempo', message0: 'segundos desde que se encendió', output: 'Number', colour: SENSORES },
  {
    type: 'cb_servo', message0: 'girar el servo a %1 °', args0: [{ type: 'input_value', name: 'ANG', check: 'Number' }],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: ACCIONES, tooltip: '0° y 180° son los costados; 90° es al frente.',
  },
  {
    type: 'cb_led', message0: '%1 el LED de la placa',
    args0: [{ type: 'field_dropdown', name: 'ESTADO', options: [['encender', 'ENCENDER'], ['apagar', 'APAGAR']] }],
    previousStatement: null, nextStatement: null, colour: ACCIONES,
  },
  {
    type: 'cb_imprimir', message0: 'mostrar en el Monitor Serie %1', args0: [{ type: 'input_value', name: 'TEXTO' }],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: ACCIONES,
  },
]

const num = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } })

/** Caja de herramientas por categorías, solo con lo que el robot tiene. */
export function cajaDeBloques(p: PartesRobot) {
  const categorias: object[] = []
  categorias.push({
    kind: 'category', name: 'Eventos', colour: EVENTOS,
    contents: [
      { kind: 'block', type: 'cb_iniciar' },
      { kind: 'block', type: 'cb_siempre' },
      { kind: 'block', type: 'cb_esperar', inputs: { SEG: num(1) } },
    ],
  })
  if (p.motores) {
    categorias.push({
      kind: 'category', name: 'Movimiento', colour: MOVIMIENTO,
      contents: [
        { kind: 'block', type: 'cb_mover', inputs: { VEL: num(60) } },
        { kind: 'block', type: 'cb_lados', inputs: { IZQ: num(60), DER: num(30) } },
        { kind: 'block', type: 'cb_detener' },
      ],
    })
  }
  const sensores: object[] = []
  if (p.lineaIzq || p.lineaDer) sensores.push({ kind: 'block', type: 'cb_linea' }, { kind: 'block', type: 'cb_linea_valor' })
  if (p.ultrasonido) sensores.push({ kind: 'block', type: 'cb_distancia' })
  if (p.obstaculoIzq || p.obstaculoDer) sensores.push({ kind: 'block', type: 'cb_obstaculo' })
  sensores.push({ kind: 'block', type: 'cb_tiempo' })
  categorias.push({ kind: 'category', name: 'Sensores', colour: SENSORES, contents: sensores })
  const acciones: object[] = []
  if (p.servo) acciones.push({ kind: 'block', type: 'cb_servo', inputs: { ANG: num(90) } })
  acciones.push({ kind: 'block', type: 'cb_led' }, { kind: 'block', type: 'cb_imprimir', inputs: { TEXTO: { shadow: { type: 'text', fields: { TEXT: 'hola' } } } } })
  categorias.push({ kind: 'category', name: 'Acciones', colour: ACCIONES, contents: acciones })
  categorias.push(
    {
      kind: 'category', name: 'Decisiones', colour: '#5b80a5',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
        { kind: 'block', type: 'logic_compare', inputs: { A: num(0), B: num(20) } },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'logic_boolean' },
      ],
    },
    {
      kind: 'category', name: 'Repetir', colour: '#5ba55b',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: num(3) } },
        { kind: 'block', type: 'controls_whileUntil' },
      ],
    },
    {
      kind: 'category', name: 'Números', colour: '#5b67a5',
      contents: [
        { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
        { kind: 'block', type: 'math_arithmetic', inputs: { A: num(1), B: num(1) } },
        { kind: 'block', type: 'math_random_int', inputs: { FROM: num(1), TO: num(10) } },
        { kind: 'block', type: 'text' },
      ],
    },
    { kind: 'category', name: 'Variables', colour: '#a55b80', custom: 'VARIABLE' },
  )
  return { kind: 'categoryToolbox', contents: categorias }
}

/** Programa inicial: «al encender» y «repetir siempre» vacíos. */
export const PROGRAMA_VACIO: ProgramaBloques = {
  blocks: { blocks: [{ type: 'cb_iniciar', x: 30, y: 30 } as never, { type: 'cb_siempre', x: 30, y: 150 } as never] },
}

const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } })

/** Seguidor de línea en bloques: la misma lógica que el programa en C++. */
export const SEGUIDOR_EN_BLOQUES: ProgramaBloques = {
  blocks: {
    blocks: [
      { type: 'cb_iniciar', x: 30, y: 30, inputs: { DO: { block: { type: 'cb_imprimir', inputs: { TEXTO: { shadow: { type: 'text', fields: { TEXT: 'Seguidor listo' } } } } } } } } as never,
      {
        type: 'cb_siempre', x: 30, y: 140,
        inputs: {
          DO: {
            block: {
              type: 'controls_if', extraState: { elseIfCount: 1, hasElse: true },
              inputs: {
                IF0: { block: { type: 'cb_linea', fields: { LADO: 'IZQ' } } },
                DO0: { block: { type: 'cb_lados', inputs: { IZQ: n(-33), DER: n(67) } } },
                IF1: { block: { type: 'cb_linea', fields: { LADO: 'DER' } } },
                DO1: { block: { type: 'cb_lados', inputs: { IZQ: n(67), DER: n(-33) } } },
                ELSE: { block: { type: 'cb_mover', fields: { DIR: 'ADELANTE' }, inputs: { VEL: n(59) } } },
              },
            },
          },
        },
      } as never,
    ],
  },
}
