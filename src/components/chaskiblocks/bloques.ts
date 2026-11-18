/**
 * ChaskiBlocks IA: definición de bloques, generador de código y caja de herramientas.
 * La organización sigue la de Scratch / PictoBlox: categorías por color y
 * extensiones de inteligencia artificial (imagen, objetos, cuerpo y voz).
 */

export const ANCHO = 480
export const ALTO = 360

export const COLORES = {
  eventos: '#FFBF00',
  movimiento: '#4C97FF',
  apariencia: '#9966FF',
  sonido: '#CF63CF',
  control: '#FFAB19',
  sensores: '#5CB1D6',
  operadores: '#59C059',
  variables: '#FF8C1A',
  lapiz: '#0FBD8C',
  ia_imagen: '#E8456B',
  ia_objetos: '#B5651D',
  ia_cuerpo: '#5B5FC7',
  ia_voz: '#1098AD',
} as const

export const FONDOS: Record<string, { nombre: string; css: string }> = {
  cielo: { nombre: 'Cielo', css: 'linear-gradient(#8fd3ff, #dff3ff)' },
  pradera: { nombre: 'Pradera', css: 'linear-gradient(#9ad8ff 0 62%, #7ccf6b 62% 100%)' },
  playa: { nombre: 'Playa', css: 'linear-gradient(#8fd3ff 0 45%, #3fa9d9 45% 62%, #f4deaa 62% 100%)' },
  noche: { nombre: 'Noche', css: 'radial-gradient(circle at 80% 18%, #fff7c2 0 5%, transparent 5.5%), radial-gradient(circle at 20% 30%, #fff 0 .5%, transparent .8%), radial-gradient(circle at 55% 12%, #fff 0 .5%, transparent .8%), radial-gradient(circle at 35% 55%, #fff 0 .4%, transparent .7%), linear-gradient(#141a3c, #2e3a78)' },
  espacio: { nombre: 'Espacio', css: 'radial-gradient(circle at 15% 20%, #fff 0 .5%, transparent .8%), radial-gradient(circle at 70% 35%, #fff 0 .5%, transparent .8%), radial-gradient(circle at 40% 75%, #fff 0 .5%, transparent .8%), radial-gradient(circle at 88% 80%, #fff 0 .4%, transparent .7%), radial-gradient(circle at 75% 20%, #7b5cd6 0 9%, transparent 9.5%), #0b0d24' },
  pista: { nombre: 'Pista', css: 'linear-gradient(#9ad8ff 0 40%, #7ccf6b 40% 55%, #5a6272 55% 76%, #f2f2f2 76% 78%, #5a6272 78% 90%, #7ccf6b 90% 100%)' },
  cuadricula: { nombre: 'Cuadrícula', css: 'linear-gradient(90deg, transparent 239px, #e2574c 239px 241px, transparent 241px), linear-gradient(transparent 179px, #e2574c 179px 181px, transparent 181px), repeating-linear-gradient(90deg, #d5dbe6 0 1px, transparent 1px 40px), repeating-linear-gradient(#d5dbe6 0 1px, transparent 1px 40px), #ffffff' },
  blanco: { nombre: 'Blanco', css: '#ffffff' },
}

export const NOTAS: Record<string, number> = { do: 261.6, re: 293.7, mi: 329.6, fa: 349.2, sol: 392, la: 440, si: 493.9, 'do alto': 523.3 }
export const SONIDOS = ['pop', 'moneda', 'campana', 'láser', 'salto', 'alarma', 'tambor']
export const COLORES_LAPIZ: Record<string, string> = {
  rojo: '#e03131', naranja: '#f76707', amarillo: '#f5c400', verde: '#2f9e44', celeste: '#1c9be6', azul: '#3b5bdb', morado: '#9c36b5', rosado: '#e64980', negro: '#212529', blanco: '#ffffff',
}

export const TECLAS: [string, string][] = [
  ['espacio', 'espacio'], ['flecha arriba', 'ArrowUp'], ['flecha abajo', 'ArrowDown'], ['flecha derecha', 'ArrowRight'], ['flecha izquierda', 'ArrowLeft'], ['cualquiera', 'cualquiera'],
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('').map(c => [c, c] as [string, string]),
]

/** Objetos que reconoce el detector (nombre para el estudiante → etiqueta del modelo COCO). */
export const OBJETOS: [string, string][] = [
  ['persona', 'person'], ['celular', 'cell phone'], ['botella', 'bottle'], ['taza', 'cup'], ['libro', 'book'], ['mochila', 'backpack'],
  ['tijeras', 'scissors'], ['silla', 'chair'], ['laptop', 'laptop'], ['teclado', 'keyboard'], ['ratón de computadora', 'mouse'], ['reloj', 'clock'],
  ['pelota', 'sports ball'], ['banana', 'banana'], ['manzana', 'apple'], ['naranja', 'orange'], ['cuchara', 'spoon'], ['control remoto', 'remote'],
  ['perro', 'dog'], ['gato', 'cat'], ['osito de peluche', 'teddy bear'], ['planta', 'potted plant'], ['televisor', 'tv'], ['paraguas', 'umbrella'],
]

/** Partes del cuerpo (nombre para el estudiante → punto del modelo MoveNet). */
export const PARTES: [string, string][] = [
  ['nariz', 'nose'], ['mano derecha', 'right_wrist'], ['mano izquierda', 'left_wrist'], ['ojo derecho', 'right_eye'], ['ojo izquierdo', 'left_eye'],
  ['hombro derecho', 'right_shoulder'], ['hombro izquierdo', 'left_shoulder'], ['codo derecho', 'right_elbow'], ['codo izquierdo', 'left_elbow'],
]

/** Listas que cambian mientras se usa el editor; las leen los menús desplegables. */
export const dinamicos = { sprites: ['Chaski'] as string[], clases: ['Clase 1', 'Clase 2'] as string[] }

export const BLOQUES_SOMBRERO = ['ev_bandera', 'ev_tecla', 'ev_clic', 'ev_recibir', 'ia_cuando_ve']

const V = (name: string, check?: string) => ({ type: 'input_value', name, ...(check ? { check } : {}) })
const D = (name: string, options: [string, string][]) => ({ type: 'field_dropdown', name, options })
const T = (name: string, text: string) => ({ type: 'field_input', name, text })
const lista = (xs: string[]) => xs.map(x => [x, x] as [string, string])

const orden = (type: string, style: string, message0: string, args0: any[] = [], extra: any = {}) =>
  ({ type, style, message0, args0, inputsInline: true, previousStatement: null, nextStatement: null, ...extra })
const sombrero = (type: string, style: string, message0: string, args0: any[] = [], extra: any = {}) =>
  ({ type, style, message0, args0, inputsInline: true, nextStatement: null, ...extra })
const valor = (type: string, style: string, message0: string, args0: any[] = [], output: string | null = null, extra: any = {}) =>
  ({ type, style, message0, args0, inputsInline: true, output, ...extra })
const cuerpo = (name: string) => [{ type: 'input_statement', name }]

export function definirBloques(Blockly: any) {
  if (Blockly.Blocks['ev_bandera']) return

  Blockly.defineBlocksWithJsonArray([
    // ---------------------------------------------------------------- eventos
    sombrero('ev_bandera', 'eventos_sombrero', 'al presionar 🚩', [], { tooltip: 'Aquí empieza el programa cuando presionas la bandera verde' }),
    sombrero('ev_tecla', 'eventos_sombrero', 'al presionar la tecla %1', [D('K', TECLAS)]),
    sombrero('ev_clic', 'eventos_sombrero', 'al hacer clic en este personaje'),
    sombrero('ev_recibir', 'eventos_sombrero', 'al recibir el mensaje %1', [T('M', 'mensaje1')]),
    orden('ev_enviar', 'eventos', 'enviar el mensaje %1', [T('M', 'mensaje1')], { tooltip: 'Avisa a todos los personajes. Los que tengan «al recibir» con el mismo mensaje empiezan.' }),
    orden('ev_enviar_esperar', 'eventos', 'enviar el mensaje %1 y esperar', [T('M', 'mensaje1')]),

    // ------------------------------------------------------------- movimiento
    orden('mv_mover', 'movimiento', 'mover %1 pasos', [V('N')]),
    orden('mv_girar_der', 'movimiento', 'girar ↻ %1 grados', [V('N')]),
    orden('mv_girar_izq', 'movimiento', 'girar ↺ %1 grados', [V('N')]),
    orden('mv_ir_a', 'movimiento', 'ir a %1', [D('A', [['una posición al azar', 'azar'], ['el puntero del ratón', 'puntero'], ['el centro', 'centro']])]),
    orden('mv_ir_xy', 'movimiento', 'ir a x: %1 y: %2', [V('X'), V('Y')]),
    orden('mv_deslizar', 'movimiento', 'deslizar en %1 seg a x: %2 y: %3', [V('S'), V('X'), V('Y')]),
    orden('mv_apuntar', 'movimiento', 'apuntar en dirección %1', [V('N')], { tooltip: '90 = derecha, 0 = arriba, -90 = izquierda, 180 = abajo' }),
    orden('mv_cambiar_x', 'movimiento', 'sumar a x %1', [V('N')]),
    orden('mv_fijar_x', 'movimiento', 'dar a x el valor %1', [V('N')]),
    orden('mv_cambiar_y', 'movimiento', 'sumar a y %1', [V('N')]),
    orden('mv_fijar_y', 'movimiento', 'dar a y el valor %1', [V('N')]),
    orden('mv_rebotar', 'movimiento', 'si toca un borde, rebotar'),
    orden('mv_rotacion', 'movimiento', 'usar estilo de giro %1', [D('R', [['izquierda-derecha', 'lr'], ['en todas direcciones', 'todo'], ['no girar', 'no']])]),
    valor('mv_x', 'movimiento', 'posición en x'),
    valor('mv_y', 'movimiento', 'posición en y'),
    valor('mv_dir', 'movimiento', 'dirección'),

    // ------------------------------------------------------------- apariencia
    orden('ap_decir_seg', 'apariencia', 'decir %1 durante %2 segundos', [V('T'), V('S')]),
    orden('ap_decir', 'apariencia', 'decir %1', [V('T')]),
    orden('ap_pensar_seg', 'apariencia', 'pensar %1 durante %2 segundos', [V('T'), V('S')]),
    orden('ap_disfraz_sig', 'apariencia', 'siguiente disfraz'),
    orden('ap_disfraz_num', 'apariencia', 'cambiar al disfraz número %1', [V('N')]),
    orden('ap_fondo', 'apariencia', 'cambiar el fondo a %1', [D('F', Object.entries(FONDOS).map(([k, f]) => [f.nombre, k] as [string, string]))]),
    orden('ap_fondo_sig', 'apariencia', 'siguiente fondo'),
    orden('ap_tam_cambiar', 'apariencia', 'cambiar tamaño en %1', [V('N')]),
    orden('ap_tam_fijar', 'apariencia', 'fijar tamaño al %1 %', [V('N')]),
    orden('ap_mostrar', 'apariencia', 'mostrar'),
    orden('ap_esconder', 'apariencia', 'esconder'),
    valor('ap_tam', 'apariencia', 'tamaño'),
    valor('ap_disfraz', 'apariencia', 'número de disfraz'),

    // ----------------------------------------------------------------- sonido
    orden('sn_sonido', 'sonido', 'tocar el sonido %1', [D('S', lista(SONIDOS))]),
    orden('sn_nota', 'sonido', 'tocar la nota %1 durante %2 segundos', [D('N', lista(Object.keys(NOTAS))), V('S')]),
    orden('sn_hablar', 'sonido', 'decir en voz alta %1', [V('T')], { tooltip: 'La computadora lee el texto con su voz' }),

    // ---------------------------------------------------------------- control
    orden('ctl_esperar', 'control', 'esperar %1 segundos', [V('S')]),
    orden('ctl_repetir', 'control', 'repetir %1 veces', [V('N')], { message1: '%1', args1: cuerpo('DO') }),
    { type: 'ctl_por_siempre', style: 'control', message0: 'por siempre', message1: '%1', args1: cuerpo('DO'), previousStatement: null },
    orden('ctl_si', 'control', 'si %1 entonces', [V('C', 'Boolean')], { message1: '%1', args1: cuerpo('DO') }),
    orden('ctl_si_sino', 'control', 'si %1 entonces', [V('C', 'Boolean')], { message1: '%1', args1: cuerpo('DO'), message2: 'si no', message3: '%1', args3: cuerpo('ELSE') }),
    orden('ctl_esperar_hasta', 'control', 'esperar hasta que %1', [V('C', 'Boolean')]),
    orden('ctl_repetir_hasta', 'control', 'repetir hasta que %1', [V('C', 'Boolean')], { message1: '%1', args1: cuerpo('DO') }),
    { type: 'ctl_detener', style: 'control', message0: 'detener %1', args0: [D('Q', [['todo', 'todo'], ['este programa', 'este']])], previousStatement: null },

    // --------------------------------------------------------------- sensores
    orden('se_preguntar', 'sensores', 'preguntar %1 y esperar', [V('T')]),
    valor('se_respuesta', 'sensores', 'respuesta'),
    valor('se_tecla', 'sensores', '¿tecla %1 presionada?', [D('K', TECLAS)], 'Boolean'),
    valor('se_raton_abajo', 'sensores', '¿ratón presionado?', [], 'Boolean'),
    valor('se_raton_x', 'sensores', 'x del ratón'),
    valor('se_raton_y', 'sensores', 'y del ratón'),
    valor('se_cronometro', 'sensores', 'cronómetro'),
    orden('se_reiniciar_crono', 'sensores', 'reiniciar cronómetro'),

    // ------------------------------------------------------------- operadores
    valor('op_unir', 'operadores', 'unir %1 %2', [V('A'), V('B')]),
    valor('op_contiene', 'operadores', '¿ %1 contiene %2 ?', [V('A'), V('B')], 'Boolean'),
    valor('op_redondear', 'operadores', 'redondear %1', [V('N')]),

    // ------------------------------------------------------------------ lápiz
    orden('lz_borrar', 'lapiz', 'borrar todo lo dibujado'),
    orden('lz_bajar', 'lapiz', 'bajar el lápiz'),
    orden('lz_subir', 'lapiz', 'subir el lápiz'),
    orden('lz_color', 'lapiz', 'usar el color %1', [D('C', lista(Object.keys(COLORES_LAPIZ)))]),
    orden('lz_grosor', 'lapiz', 'fijar el grosor del lápiz a %1', [V('N')]),
    orden('lz_sellar', 'lapiz', 'sellar'),

    // ------------------------------------------------------- IA: imagen (cámara)
    orden('ia_video', 'ia_imagen', '%1 el video en el escenario', [D('E', [['encender', 'si'], ['apagar', 'no']])]),
    orden('ia_video_transp', 'ia_imagen', 'fijar la transparencia del video al %1 %', [V('N')]),
    valor('ia_clase', 'ia_imagen', 'lo que ve la IA', [], null, { tooltip: 'El nombre de la clase que tu modelo reconoce ahora' }),
    valor('ia_seguridad', 'ia_imagen', 'seguridad de la IA (%)', [], null, { tooltip: 'Qué tan segura está la IA, de 0 a 100' }),

    // ------------------------------------------------------------ IA: objetos
    valor('ia_obj_hay', 'ia_objetos', '¿la IA detecta %1 ?', [D('O', OBJETOS)], 'Boolean'),
    valor('ia_obj_cuenta', 'ia_objetos', 'cantidad de %1', [D('O', OBJETOS)]),
    valor('ia_obj_x', 'ia_objetos', 'x de %1', [D('O', OBJETOS)]),
    valor('ia_obj_y', 'ia_objetos', 'y de %1', [D('O', OBJETOS)]),
    valor('ia_obj_lista', 'ia_objetos', 'objetos que ve la IA'),

    // ------------------------------------------------------------- IA: cuerpo
    orden('ia_ir_a_parte', 'ia_cuerpo', 'ir a mi %1', [D('P', PARTES)], { tooltip: 'El personaje va adonde la cámara ve esa parte de tu cuerpo' }),
    valor('ia_parte_visible', 'ia_cuerpo', '¿la IA ve mi %1 ?', [D('P', PARTES)], 'Boolean'),
    valor('ia_parte_x', 'ia_cuerpo', 'x de mi %1', [D('P', PARTES)]),
    valor('ia_parte_y', 'ia_cuerpo', 'y de mi %1', [D('P', PARTES)]),

    // ---------------------------------------------------------------- IA: voz
    orden('ia_escuchar', 'ia_voz', 'escuchar y esperar', [], { tooltip: 'Espera a que digas algo por el micrófono y lo recuerda' }),
    valor('ia_oyo', 'ia_voz', '¿escuché %1 ?', [T('P', 'hola')], 'Boolean'),
    valor('ia_lo_oido', 'ia_voz', 'lo que escuché'),
  ])

  // Bloques con menús que dependen del proyecto (personajes y clases entrenadas)
  const menu = (opciones: () => [string, string][]) => new Blockly.FieldDropdown(opciones)
  const clases = () => lista(dinamicos.clases.length ? dinamicos.clases : ['Clase 1'])
  const objetivos = () => [['el borde', '_borde'], ['el puntero del ratón', '_puntero'], ...lista(dinamicos.sprites)] as [string, string][]

  Blockly.Blocks['se_tocando'] = {
    init(this: any) {
      this.appendDummyInput().appendField('¿tocando').appendField(menu(objetivos), 'O').appendField('?')
      this.setOutput(true, 'Boolean'); this.setStyle('sensores')
    },
  }
  Blockly.Blocks['se_distancia'] = {
    init(this: any) {
      this.appendDummyInput().appendField('distancia a').appendField(menu(() => objetivos().slice(1)), 'O')
      this.setOutput(true, null); this.setStyle('sensores')
    },
  }
  Blockly.Blocks['mv_apuntar_hacia'] = {
    init(this: any) {
      this.appendDummyInput().appendField('apuntar hacia').appendField(menu(() => objetivos().slice(1)), 'O')
      this.setPreviousStatement(true); this.setNextStatement(true); this.setStyle('movimiento')
    },
  }
  Blockly.Blocks['ia_cuando_ve'] = {
    init(this: any) {
      this.appendDummyInput().appendField('cuando la IA vea').appendField(menu(clases), 'C')
      this.setNextStatement(true); this.setStyle('ia_imagen_sombrero')
      this.setTooltip('Empieza cada vez que la cámara pasa a mostrar esa clase')
    },
  }
  Blockly.Blocks['ia_ve'] = {
    init(this: any) {
      this.appendDummyInput().appendField('¿la IA ve').appendField(menu(clases), 'C').appendField('?')
      this.setOutput(true, 'Boolean'); this.setStyle('ia_imagen')
    },
  }
}

export function crearTema(Blockly: any) {
  const estilo = (c: string, extra: any = {}) => ({ colourPrimary: c, ...extra })
  const blockStyles: any = {}
  for (const [k, c] of Object.entries(COLORES)) blockStyles[k] = estilo(c)
  blockStyles.eventos_sombrero = estilo(COLORES.eventos, { hat: 'cap' })
  blockStyles.ia_imagen_sombrero = estilo(COLORES.ia_imagen, { hat: 'cap' })
  // Bloques de fábrica de Blockly que usamos en Operadores y Variables
  blockStyles.math_blocks = estilo(COLORES.operadores)
  blockStyles.logic_blocks = estilo(COLORES.operadores)
  blockStyles.text_blocks = estilo(COLORES.operadores)
  blockStyles.variable_blocks = estilo(COLORES.variables)
  const categoryStyles: any = { variables: { colour: COLORES.variables } }
  for (const [k, c] of Object.entries(COLORES)) categoryStyles[k] = { colour: c }
  return Blockly.Theme.defineTheme('chaskiblocks', {
    name: 'chaskiblocks',
    base: Blockly.Themes.Zelos,
    blockStyles,
    categoryStyles,
    componentStyles: {
      workspaceBackgroundColour: '#f9fafc', toolboxBackgroundColour: '#ffffff', toolboxForegroundColour: '#334155',
      flyoutBackgroundColour: '#eef2f7', flyoutForegroundColour: '#475569', flyoutOpacity: 0.97,
      scrollbarColour: '#cbd5e1', scrollbarOpacity: 0.7, insertionMarkerColour: '#000000', insertionMarkerOpacity: 0.2,
    },
    fontStyle: { family: '"Helvetica Neue", Helvetica, Arial, sans-serif', weight: '600', size: 12 },
    startHats: false,
  })
}

// ------------------------------------------------------------------ generador
export function crearGenerador(jsMod: any) {
  const { JavascriptGenerator, javascriptGenerator, Order } = jsMod
  const g: any = new JavascriptGenerator('ChaskiJS')
  Object.assign(g.forBlock, javascriptGenerator.forBlock)
  g.addReservedWords('api,V')

  const val = (b: any, n: string, d: string) => g.valueToCode(b, n, Order.NONE) || d
  const campo = (b: any, n: string) => JSON.stringify(b.getFieldValue(n))
  const llamar = (codigo: string) => [codigo, Order.FUNCTION_CALL]
  const dentro = (b: any, n: string) => g.statementToCode(b, n)
  const O = (tipo: string, f: (b: any) => string) => { g.forBlock[tipo] = (b: any) => f(b) + '\n' }
  const R = (tipo: string, f: (b: any) => string) => { g.forBlock[tipo] = (b: any) => llamar(f(b)) }

  for (const t of BLOQUES_SOMBRERO) g.forBlock[t] = () => ''
  O('ev_enviar', b => `api.enviar(${campo(b, 'M')});`)
  O('ev_enviar_esperar', b => `await api.enviarYEsperar(${campo(b, 'M')});`)

  O('mv_mover', b => `api.mover(${val(b, 'N', '10')});`)
  O('mv_girar_der', b => `api.girar(${val(b, 'N', '15')});`)
  O('mv_girar_izq', b => `api.girar(-(${val(b, 'N', '15')}));`)
  O('mv_ir_a', b => `api.irA(${campo(b, 'A')});`)
  O('mv_ir_xy', b => `api.irXY(${val(b, 'X', '0')}, ${val(b, 'Y', '0')});`)
  O('mv_deslizar', b => `await api.deslizar(${val(b, 'S', '1')}, ${val(b, 'X', '0')}, ${val(b, 'Y', '0')});`)
  O('mv_apuntar', b => `api.apuntar(${val(b, 'N', '90')});`)
  O('mv_apuntar_hacia', b => `api.apuntarHacia(${campo(b, 'O')});`)
  O('mv_cambiar_x', b => `api.irXY(api.x() + Number(${val(b, 'N', '10')}), api.y());`)
  O('mv_fijar_x', b => `api.irXY(${val(b, 'N', '0')}, api.y());`)
  O('mv_cambiar_y', b => `api.irXY(api.x(), api.y() + Number(${val(b, 'N', '10')}));`)
  O('mv_fijar_y', b => `api.irXY(api.x(), ${val(b, 'N', '0')});`)
  O('mv_rebotar', () => 'api.rebotar();')
  O('mv_rotacion', b => `api.poner({ rot: ${campo(b, 'R')} });`)
  R('mv_x', () => 'api.x()'); R('mv_y', () => 'api.y()'); R('mv_dir', () => 'api.dir()')

  O('ap_decir_seg', b => `await api.decir(${val(b, 'T', "''")}, ${val(b, 'S', '2')}, false);`)
  O('ap_decir', b => `api.decir(${val(b, 'T', "''")});`)
  O('ap_pensar_seg', b => `await api.decir(${val(b, 'T', "''")}, ${val(b, 'S', '2')}, true);`)
  O('ap_disfraz_sig', () => 'api.disfraz(api.numDisfraz() + 1);')
  O('ap_disfraz_num', b => `api.disfraz(${val(b, 'N', '1')});`)
  O('ap_fondo', b => `api.fondo(${campo(b, 'F')});`)
  O('ap_fondo_sig', () => 'api.fondoSiguiente();')
  O('ap_tam_cambiar', b => `api.tam(api.tamano() + Number(${val(b, 'N', '10')}));`)
  O('ap_tam_fijar', b => `api.tam(${val(b, 'N', '100')});`)
  O('ap_mostrar', () => 'api.poner({ visible: true });')
  O('ap_esconder', () => 'api.poner({ visible: false });')
  R('ap_tam', () => 'api.tamano()'); R('ap_disfraz', () => 'api.numDisfraz()')

  O('sn_sonido', b => `await api.sonido(${campo(b, 'S')});`)
  O('sn_nota', b => `await api.nota(${campo(b, 'N')}, ${val(b, 'S', '0.4')});`)
  O('sn_hablar', b => `await api.hablar(${val(b, 'T', "''")});`)

  O('ctl_esperar', b => `await api.esperar(${val(b, 'S', '1')});`)
  O('ctl_repetir', b => `for (let i_ = 0, n_ = Math.round(Number(${val(b, 'N', '10')})) || 0; i_ < n_; i_++) {\n${dentro(b, 'DO')}  await api.tick();\n}`)
  O('ctl_por_siempre', b => `while (true) {\n${dentro(b, 'DO')}  await api.tick();\n}`)
  O('ctl_si', b => `if (${val(b, 'C', 'false')}) {\n${dentro(b, 'DO')}}`)
  O('ctl_si_sino', b => `if (${val(b, 'C', 'false')}) {\n${dentro(b, 'DO')}} else {\n${dentro(b, 'ELSE')}}`)
  O('ctl_esperar_hasta', b => `while (!(${val(b, 'C', 'false')})) {\n  await api.tick();\n}`)
  O('ctl_repetir_hasta', b => `while (!(${val(b, 'C', 'false')})) {\n${dentro(b, 'DO')}  await api.tick();\n}`)
  O('ctl_detener', b => (b.getFieldValue('Q') === 'todo' ? 'api.detenerTodo();\nawait api.tick();' : 'return;'))

  R('se_tocando', b => `api.tocando(${campo(b, 'O')})`)
  R('se_distancia', b => `api.distancia(${campo(b, 'O')})`)
  O('se_preguntar', b => `await api.preguntar(${val(b, 'T', "''")});`)
  R('se_respuesta', () => 'api.respuesta()')
  R('se_tecla', b => `api.tecla(${campo(b, 'K')})`)
  R('se_raton_abajo', () => 'api.ratonAbajo()')
  R('se_raton_x', () => 'api.ratonX()'); R('se_raton_y', () => 'api.ratonY()')
  R('se_cronometro', () => 'api.cronometro()')
  O('se_reiniciar_crono', () => 'api.reiniciarCrono();')

  R('op_unir', b => `api.unir(${val(b, 'A', "''")}, ${val(b, 'B', "''")})`)
  R('op_contiene', b => `api.contiene(${val(b, 'A', "''")}, ${val(b, 'B', "''")})`)
  R('op_redondear', b => `Math.round(Number(${val(b, 'N', '0')}) || 0)`)

  O('lz_borrar', () => 'api.lapizBorrar();')
  O('lz_bajar', () => 'api.lapiz(true);')
  O('lz_subir', () => 'api.lapiz(false);')
  O('lz_color', b => `api.lapizColor(${campo(b, 'C')});`)
  O('lz_grosor', b => `api.lapizGrosor(${val(b, 'N', '3')});`)
  O('lz_sellar', () => 'api.sellar();')

  O('ia_video', b => `api.video(${b.getFieldValue('E') === 'si'});`)
  O('ia_video_transp', b => `api.videoTransp(${val(b, 'N', '30')});`)
  R('ia_ve', b => `api.iaVe(${campo(b, 'C')})`)
  R('ia_clase', () => 'api.iaClase()')
  R('ia_seguridad', () => 'api.iaSeguridad()')
  R('ia_obj_hay', b => `api.objHay(${campo(b, 'O')})`)
  R('ia_obj_cuenta', b => `api.objCuenta(${campo(b, 'O')})`)
  R('ia_obj_x', b => `api.objX(${campo(b, 'O')})`)
  R('ia_obj_y', b => `api.objY(${campo(b, 'O')})`)
  R('ia_obj_lista', () => 'api.objLista()')
  O('ia_ir_a_parte', b => `api.irAParte(${campo(b, 'P')});`)
  R('ia_parte_visible', b => `api.parteVisible(${campo(b, 'P')})`)
  R('ia_parte_x', b => `api.parteX(${campo(b, 'P')})`)
  R('ia_parte_y', b => `api.parteY(${campo(b, 'P')})`)
  O('ia_escuchar', () => 'await api.escuchar();')
  R('ia_oyo', b => `api.oyo(${campo(b, 'P')})`)
  R('ia_lo_oido', () => 'api.loOido()')

  // Las variables son de todo el proyecto: viven en el objeto compartido V
  const nombreVar = (b: any) => JSON.stringify(b.getField('VAR')?.getText() || 'variable')
  g.forBlock['variables_get'] = (b: any) => [`V[${nombreVar(b)}]`, Order.MEMBER]
  g.forBlock['variables_set'] = (b: any) => `V[${nombreVar(b)}] = ${val(b, 'VALUE', '0')};\n`
  g.forBlock['math_change'] = (b: any) => `V[${nombreVar(b)}] = (Number(V[${nombreVar(b)}]) || 0) + Number(${val(b, 'DELTA', '1')});\n`
  return g
}

// ---------------------------------------------------------- caja de herramientas
const num = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } })
const txt = (t: string) => ({ shadow: { type: 'text', fields: { TEXT: t } } })
const bl = (type: string, inputs?: any, extra: any = {}) => ({ kind: 'block', type, ...(inputs ? { inputs } : {}), ...extra })
const rotulo = (text: string) => ({ kind: 'label', text })
const cat = (name: string, estilo: string, contents: any[]) => ({ kind: 'category', name, categorystyle: estilo, contents })

export const CATEGORIAS: { nombre: string; color: string }[] = [
  { nombre: 'Eventos', color: COLORES.eventos }, { nombre: 'Movimiento', color: COLORES.movimiento }, { nombre: 'Apariencia', color: COLORES.apariencia },
  { nombre: 'Sonido', color: COLORES.sonido }, { nombre: 'Control', color: COLORES.control }, { nombre: 'Sensores', color: COLORES.sensores },
  { nombre: 'Operadores', color: COLORES.operadores }, { nombre: 'Variables', color: COLORES.variables }, { nombre: 'Lápiz', color: COLORES.lapiz },
  { nombre: 'IA · Imagen', color: COLORES.ia_imagen }, { nombre: 'IA · Objetos', color: COLORES.ia_objetos }, { nombre: 'IA · Cuerpo', color: COLORES.ia_cuerpo }, { nombre: 'IA · Voz', color: COLORES.ia_voz },
]

export const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    cat('Eventos', 'eventos', [bl('ev_bandera'), bl('ev_tecla'), bl('ev_clic'), bl('ev_recibir'), bl('ev_enviar'), bl('ev_enviar_esperar')]),
    cat('Movimiento', 'movimiento', [
      bl('mv_mover', { N: num(10) }), bl('mv_girar_der', { N: num(15) }), bl('mv_girar_izq', { N: num(15) }),
      bl('mv_ir_a'), bl('mv_ir_xy', { X: num(0), Y: num(0) }), bl('mv_deslizar', { S: num(1), X: num(100), Y: num(0) }),
      bl('mv_apuntar', { N: num(90) }), bl('mv_apuntar_hacia'),
      bl('mv_cambiar_x', { N: num(10) }), bl('mv_fijar_x', { N: num(0) }), bl('mv_cambiar_y', { N: num(10) }), bl('mv_fijar_y', { N: num(0) }),
      bl('mv_rebotar'), bl('mv_rotacion'), bl('mv_x'), bl('mv_y'), bl('mv_dir'),
    ]),
    cat('Apariencia', 'apariencia', [
      bl('ap_decir_seg', { T: txt('¡Hola!'), S: num(2) }), bl('ap_decir', { T: txt('¡Hola!') }), bl('ap_pensar_seg', { T: txt('Mmm...'), S: num(2) }),
      bl('ap_disfraz_sig'), bl('ap_disfraz_num', { N: num(1) }), bl('ap_fondo'), bl('ap_fondo_sig'),
      bl('ap_tam_cambiar', { N: num(10) }), bl('ap_tam_fijar', { N: num(100) }), bl('ap_mostrar'), bl('ap_esconder'), bl('ap_tam'), bl('ap_disfraz'),
    ]),
    cat('Sonido', 'sonido', [bl('sn_sonido'), bl('sn_nota', { S: num(0.4) }), bl('sn_hablar', { T: txt('Hola, soy Chaski') })]),
    cat('Control', 'control', [
      bl('ctl_esperar', { S: num(1) }), bl('ctl_repetir', { N: num(10) }), bl('ctl_por_siempre'), bl('ctl_si'), bl('ctl_si_sino'),
      bl('ctl_esperar_hasta'), bl('ctl_repetir_hasta'), bl('ctl_detener'),
    ]),
    cat('Sensores', 'sensores', [
      bl('se_tocando'), bl('se_distancia'), bl('se_preguntar', { T: txt('¿Cómo te llamas?') }), bl('se_respuesta'),
      bl('se_tecla'), bl('se_raton_abajo'), bl('se_raton_x'), bl('se_raton_y'), bl('se_cronometro'), bl('se_reiniciar_crono'),
    ]),
    cat('Operadores', 'operadores', [
      bl('math_arithmetic', { A: num(1), B: num(1) }), bl('math_random_int', { FROM: num(1), TO: num(10) }),
      bl('logic_compare', { A: num(0), B: num(50) }, { fields: { OP: 'GT' } }), bl('logic_compare', { A: num(0), B: num(50) }, { fields: { OP: 'LT' } }), bl('logic_compare', { A: num(0), B: num(50) }),
      bl('logic_operation'), bl('logic_operation', undefined, { fields: { OP: 'OR' } }), bl('logic_negate'),
      bl('op_unir', { A: txt('hola '), B: txt('mundo') }), bl('op_contiene', { A: txt('robot'), B: txt('o') }), bl('op_redondear', { N: num(3.7) }),
    ]),
    { kind: 'category', name: 'Variables', categorystyle: 'variables', custom: 'VARIABLE' },
    cat('Lápiz', 'lapiz', [bl('lz_borrar'), bl('lz_bajar'), bl('lz_subir'), bl('lz_color'), bl('lz_grosor', { N: num(3) }), bl('lz_sellar')]),
    cat('IA · Imagen', 'ia_imagen', [
      rotulo('Entrena tu modelo con el botón «Entrenar IA»'),
      bl('ia_cuando_ve'), bl('ia_ve'), bl('ia_clase'), bl('ia_seguridad'),
      rotulo('Cámara en el escenario'),
      bl('ia_video'), bl('ia_video_transp', { N: num(30) }),
    ]),
    cat('IA · Objetos', 'ia_objetos', [
      rotulo('La IA reconoce objetos con la cámara'),
      bl('ia_obj_hay'), bl('ia_obj_cuenta'), bl('ia_obj_x'), bl('ia_obj_y'), bl('ia_obj_lista'),
    ]),
    cat('IA · Cuerpo', 'ia_cuerpo', [
      rotulo('La IA sigue tu cuerpo con la cámara'),
      bl('ia_ir_a_parte'), bl('ia_parte_visible'), bl('ia_parte_x'), bl('ia_parte_y'),
    ]),
    cat('IA · Voz', 'ia_voz', [
      rotulo('La IA entiende lo que dices'),
      bl('ia_escuchar'), bl('ia_oyo'), bl('ia_lo_oido'), bl('sn_hablar', { T: txt('Te escucho') }),
    ]),
  ],
}
