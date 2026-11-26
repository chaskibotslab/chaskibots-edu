/**
 * Bloques Blockly para el simulador LEGO EV3.
 * Define los bloques, el tema, el generador (produce llamadas `api.*`) y el toolbox.
 * Los bucles inyectan `await api.tick()` para no congelar el navegador y permitir
 * la parada cooperativa (`api.vivo()`).
 */

export const COLORES_EV3: [string, string][] = [
  ['Negro', 'negro'], ['Blanco', 'blanco'], ['Rojo', 'rojo'],
  ['Azul', 'azul'], ['Verde', 'verde'], ['Amarillo', 'amarillo'],
]

const MODOS: [string, string][] = [['segundos', 'seg'], ['rotaciones', 'rot'], ['grados', 'grados']]

const C_MOTOR = '#E8A33D'   // naranja
const C_CONTROL = '#F0A500' // amarillo-naranja
const C_SENSOR = '#4C97FF'  // azul
const C_PANTALLA = '#9966FF'// morado
const C_OP = '#59C059'      // verde

export function definirBloquesEV3(Blockly: any) {
  Blockly.defineBlocksWithJsonArray([
    { type: 'ev3_inicio', message0: '▶ al empezar', nextStatement: null, colour: C_CONTROL, tooltip: 'Tu programa empieza aquí' },

    { type: 'ev3_avanzar', message0: '⬆️ avanzar potencia %1 por %2 %3',
      args0: [
        { type: 'input_value', name: 'POT', check: 'Number' },
        { type: 'input_value', name: 'VAL', check: 'Number' },
        { type: 'field_dropdown', name: 'MODO', options: MODOS },
      ], previousStatement: null, nextStatement: null, inputsInline: true, colour: C_MOTOR },

    { type: 'ev3_retroceder', message0: '⬇️ retroceder potencia %1 por %2 %3',
      args0: [
        { type: 'input_value', name: 'POT', check: 'Number' },
        { type: 'input_value', name: 'VAL', check: 'Number' },
        { type: 'field_dropdown', name: 'MODO', options: MODOS },
      ], previousStatement: null, nextStatement: null, inputsInline: true, colour: C_MOTOR },

    { type: 'ev3_tanque', message0: '🚜 motores izq %1 der %2 por %3 %4',
      args0: [
        { type: 'input_value', name: 'POTI', check: 'Number' },
        { type: 'input_value', name: 'POTD', check: 'Number' },
        { type: 'input_value', name: 'VAL', check: 'Number' },
        { type: 'field_dropdown', name: 'MODO', options: MODOS },
      ], previousStatement: null, nextStatement: null, inputsInline: true, colour: C_MOTOR },

    { type: 'ev3_girar', message0: '↻ girar a la %1 %2 grados',
      args0: [
        { type: 'field_dropdown', name: 'DIR', options: [['derecha', 'der'], ['izquierda', 'izq']] },
        { type: 'input_value', name: 'NUM', check: 'Number' },
      ], previousStatement: null, nextStatement: null, inputsInline: true, colour: C_MOTOR },

    { type: 'ev3_parar', message0: '✋ detener motores', previousStatement: null, nextStatement: null, colour: C_MOTOR },

    { type: 'ev3_esperar', message0: '⏱️ esperar %1 segundos',
      args0: [{ type: 'input_value', name: 'NUM', check: 'Number' }], previousStatement: null, nextStatement: null, inputsInline: true, colour: C_CONTROL },

    { type: 'ev3_por_siempre', message0: '🔁 por siempre %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: C_CONTROL },

    { type: 'ev3_repetir', message0: '🔁 repetir %1 veces %2 %3',
      args0: [{ type: 'input_value', name: 'NUM', check: 'Number' }, { type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
      previousStatement: null, nextStatement: null, inputsInline: true, colour: C_CONTROL },

    { type: 'ev3_esperar_hasta', message0: '⏳ esperar hasta %1',
      args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }], previousStatement: null, nextStatement: null, inputsInline: true, colour: C_CONTROL },

    // Sensores (valores)
    { type: 'ev3_es_color', message0: '🎨 ¿el color es %1 ?', args0: [{ type: 'field_dropdown', name: 'C', options: COLORES_EV3 }], output: 'Boolean', colour: C_SENSOR },
    { type: 'ev3_color', message0: '🎨 color que veo', output: 'String', colour: C_SENSOR },
    { type: 'ev3_distancia', message0: '📏 distancia (cm)', output: 'Number', colour: C_SENSOR },
    { type: 'ev3_cerca', message0: '📏 ¿obstáculo a menos de %1 cm?', args0: [{ type: 'input_value', name: 'NUM', check: 'Number' }], output: 'Boolean', inputsInline: true, colour: C_SENSOR },
    { type: 'ev3_tactil', message0: '👆 ¿botón tocado?', output: 'Boolean', colour: C_SENSOR },
    { type: 'ev3_angulo', message0: '🧭 ángulo (°)', output: 'Number', colour: C_SENSOR },
    { type: 'ev3_en_meta', message0: '🏁 ¿llegué a la meta?', output: 'Boolean', colour: C_SENSOR },

    // Pantalla
    { type: 'ev3_decir', message0: '💬 mostrar %1 por %2 s', args0: [{ type: 'input_value', name: 'TXT', check: 'String' }, { type: 'input_value', name: 'NUM', check: 'Number' }], previousStatement: null, nextStatement: null, inputsInline: true, colour: C_PANTALLA },
  ])
}

export function crearTemaEV3(Blockly: any) {
  return Blockly.Theme.defineTheme('ev3', {
    base: Blockly.Themes.Classic,
    blockStyles: {
      motor: { colourPrimary: C_MOTOR },
      control: { colourPrimary: C_CONTROL },
      sensor: { colourPrimary: C_SENSOR },
      pantalla: { colourPrimary: C_PANTALLA },
    },
    componentStyles: { workspaceBackgroundColour: '#f8fafc', toolboxBackgroundColour: '#ffffff', flyoutBackgroundColour: '#eef2f7' },
  })
}

export function crearGeneradorEV3(jsMod: any) {
  const { JavascriptGenerator, javascriptGenerator, Order } = jsMod
  const g: any = new JavascriptGenerator('EV3JS')
  Object.assign(g.forBlock, javascriptGenerator.forBlock)
  g.addReservedWords('api')

  const val = (b: any, n: string, d: string) => g.valueToCode(b, n, Order.NONE) || d
  const campo = (b: any, n: string) => JSON.stringify(b.getFieldValue(n))
  const dentro = (b: any, n: string) => g.statementToCode(b, n)
  const O = (tipo: string, f: (b: any) => string) => { g.forBlock[tipo] = (b: any) => f(b) + '\n' }
  const R = (tipo: string, f: (b: any) => string) => { g.forBlock[tipo] = (b: any) => [f(b), Order.FUNCTION_CALL] }

  g.forBlock['ev3_inicio'] = () => ''

  O('ev3_avanzar', b => `await api.avanzar(${val(b, 'POT', '50')}, ${campo(b, 'MODO')}, ${val(b, 'VAL', '2')});`)
  O('ev3_retroceder', b => `await api.retroceder(${val(b, 'POT', '50')}, ${campo(b, 'MODO')}, ${val(b, 'VAL', '2')});`)
  O('ev3_tanque', b => `await api.tanque(${val(b, 'POTI', '50')}, ${val(b, 'POTD', '50')}, ${campo(b, 'MODO')}, ${val(b, 'VAL', '2')});`)
  O('ev3_girar', b => `await api.girar((${b.getFieldValue('DIR') === 'izq' ? '-1' : '1'}) * (${val(b, 'NUM', '90')}));`)
  O('ev3_parar', () => 'api.parar();')
  O('ev3_esperar', b => `await api.esperar(${val(b, 'NUM', '1')});`)
  O('ev3_decir', b => `await api.decir(${val(b, 'TXT', '""')}, ${val(b, 'NUM', '2')});`)

  O('ev3_por_siempre', b => `while (api.vivo()) {\n${dentro(b, 'DO')}await api.tick();\n}`)
  O('ev3_repetir', b => `for (let _i = 0; _i < (${val(b, 'NUM', '4')}) && api.vivo(); _i++) {\n${dentro(b, 'DO')}await api.tick();\n}`)
  O('ev3_esperar_hasta', b => `while (api.vivo() && !(${val(b, 'COND', 'false')})) await api.tick();`)

  R('ev3_es_color', b => `api.esColor(${campo(b, 'C')})`)
  R('ev3_color', () => 'api.color()')
  R('ev3_distancia', () => 'api.distancia()')
  R('ev3_cerca', b => `api.cerca(${val(b, 'NUM', '15')})`)
  R('ev3_tactil', () => 'api.tactil()')
  R('ev3_angulo', () => 'api.angulo()')
  R('ev3_en_meta', () => 'api.enMeta()')

  return g
}

const num = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } })
const txt = (s: string) => ({ shadow: { type: 'text', fields: { TEXT: s } } })

export const TOOLBOX_EV3 = {
  kind: 'categoryToolbox',
  contents: [
    { kind: 'category', name: 'Motores', colour: C_MOTOR, contents: [
      { kind: 'block', type: 'ev3_avanzar', inputs: { POT: num(50), VAL: num(2) } },
      { kind: 'block', type: 'ev3_retroceder', inputs: { POT: num(50), VAL: num(2) } },
      { kind: 'block', type: 'ev3_tanque', inputs: { POTI: num(50), POTD: num(30), VAL: num(2) } },
      { kind: 'block', type: 'ev3_girar', inputs: { NUM: num(90) } },
      { kind: 'block', type: 'ev3_parar' },
    ] },
    { kind: 'category', name: 'Control', colour: C_CONTROL, contents: [
      { kind: 'block', type: 'ev3_esperar', inputs: { NUM: num(1) } },
      { kind: 'block', type: 'ev3_por_siempre' },
      { kind: 'block', type: 'ev3_repetir', inputs: { NUM: num(4) } },
      { kind: 'block', type: 'ev3_esperar_hasta' },
      { kind: 'block', type: 'controls_if' },
      { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
    ] },
    { kind: 'category', name: 'Sensores', colour: C_SENSOR, contents: [
      { kind: 'block', type: 'ev3_es_color' },
      { kind: 'block', type: 'ev3_color' },
      { kind: 'block', type: 'ev3_cerca', inputs: { NUM: num(15) } },
      { kind: 'block', type: 'ev3_distancia' },
      { kind: 'block', type: 'ev3_tactil' },
      { kind: 'block', type: 'ev3_angulo' },
      { kind: 'block', type: 'ev3_en_meta' },
    ] },
    { kind: 'category', name: 'Operadores', colour: C_OP, contents: [
      { kind: 'block', type: 'logic_compare' },
      { kind: 'block', type: 'logic_operation' },
      { kind: 'block', type: 'logic_negate' },
      { kind: 'block', type: 'logic_boolean' },
      { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
      { kind: 'block', type: 'math_arithmetic', inputs: { A: num(1), B: num(1) } },
    ] },
    { kind: 'category', name: 'Pantalla', colour: C_PANTALLA, contents: [
      { kind: 'block', type: 'ev3_decir', inputs: { TXT: txt('¡Hola!'), NUM: num(2) } },
      { kind: 'block', type: 'text' },
    ] },
  ],
}
