/**
 * Mini-lenguaje para escribir programas de bloques EV3 desde el código.
 * Cada función devuelve un bloque en el formato de guardado de Blockly; `programa(...)`
 * los encadena debajo de «▶ al empezar». Se usa para las soluciones de las clases.
 */
type Bloque = { type: string; fields?: Record<string, unknown>; inputs?: Record<string, unknown>; next?: unknown; extraState?: unknown }
type Valor = Bloque | number | string
export type Programa = { blocks: { languageVersion: number; blocks: unknown[] }; variables?: { name: string; id: string }[] }

const entrada = (v: Valor) =>
  typeof v === 'number' ? { shadow: { type: 'math_number', fields: { NUM: v } } }
    : typeof v === 'string' ? { shadow: { type: 'text', fields: { TEXT: v } } }
      : { block: v }

/** Encadena bloques uno debajo del otro. */
function cadena(bloques: Bloque[]): Bloque | undefined {
  let primero: Bloque | undefined
  for (let i = bloques.length - 1; i >= 0; i--) {
    primero = { ...bloques[i], ...(primero ? { next: { block: primero } } : {}) }
  }
  return primero
}
const cuerpo = (bloques: Bloque[]) => { const c = cadena(bloques); return c ? { block: c } : undefined }
const sinVacios = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

type Modo = 'seg' | 'rot' | 'grados'
// ── Motores ──
export const avanzar = (pot: Valor, val: Valor, modo: Modo = 'rot'): Bloque => ({ type: 'ev3_avanzar', fields: { MODO: modo }, inputs: { POT: entrada(pot), VAL: entrada(val) } })
export const retroceder = (pot: Valor, val: Valor, modo: Modo = 'rot'): Bloque => ({ type: 'ev3_retroceder', fields: { MODO: modo }, inputs: { POT: entrada(pot), VAL: entrada(val) } })
export const girar = (dir: 'der' | 'izq', grados: Valor): Bloque => ({ type: 'ev3_girar', fields: { DIR: dir }, inputs: { NUM: entrada(grados) } })
export const encender = (izq: Valor, der: Valor): Bloque => ({ type: 'ev3_encender', inputs: { POTI: entrada(izq), POTD: entrada(der) } })
export const parar = (): Bloque => ({ type: 'ev3_parar' })
// ── Control ──
export const esperar = (seg: Valor): Bloque => ({ type: 'ev3_esperar', inputs: { NUM: entrada(seg) } })
export const porSiempre = (...hacer: Bloque[]): Bloque => ({ type: 'ev3_por_siempre', inputs: sinVacios({ DO: cuerpo(hacer) }) })
export const repetir = (veces: Valor, ...hacer: Bloque[]): Bloque => ({ type: 'ev3_repetir', inputs: sinVacios({ NUM: entrada(veces), DO: cuerpo(hacer) }) })
export const esperarHasta = (cond: Bloque): Bloque => ({ type: 'ev3_esperar_hasta', inputs: { COND: { block: cond } } })
/** si / si no si / si no. Pares [condición, bloques] y, opcional, los bloques del «si no». */
export const si = (ramas: [Bloque, Bloque[]][], sino?: Bloque[]): Bloque => {
  const inputs: Record<string, unknown> = {}
  ramas.forEach(([cond, hacer], i) => { inputs['IF' + i] = { block: cond }; inputs['DO' + i] = cuerpo(hacer) })
  if (sino) inputs.ELSE = cuerpo(sino)
  return { type: 'controls_if', extraState: sinVacios({ elseIfCount: ramas.length > 1 ? ramas.length - 1 : undefined, hasElse: sino ? true : undefined }), inputs: sinVacios(inputs) }
}
export const decir = (texto: string, seg: Valor): Bloque => ({ type: 'ev3_decir', inputs: { TXT: entrada(texto), NUM: entrada(seg) } })
// ── Sensores ──
export const esColor = (c: string): Bloque => ({ type: 'ev3_es_color', fields: { C: c } })
export const lineaEs = (n: number, c: string): Bloque => ({ type: 'ev3_linea_es', fields: { N: String(n), C: c } })
export const luz = (n: number): Bloque => ({ type: 'ev3_luz', fields: { N: String(n) } })
export const cerca = (cm: Valor): Bloque => ({ type: 'ev3_cerca', inputs: { NUM: entrada(cm) } })
export const tactil = (): Bloque => ({ type: 'ev3_tactil' })
export const angulo = (): Bloque => ({ type: 'ev3_angulo' })
// ── Operadores y variables ──
export const no = (a: Bloque): Bloque => ({ type: 'logic_negate', inputs: { BOOL: { block: a } } })
export const y = (a: Bloque, b: Bloque): Bloque => ({ type: 'logic_operation', fields: { OP: 'AND' }, inputs: { A: { block: a }, B: { block: b } } })
export const o = (a: Bloque, b: Bloque): Bloque => ({ type: 'logic_operation', fields: { OP: 'OR' }, inputs: { A: { block: a }, B: { block: b } } })
export const comparar = (a: Valor, op: 'EQ' | 'LT' | 'GT' | 'LTE' | 'GTE', b: Valor): Bloque => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A: entrada(a), B: entrada(b) } })
export const operar = (a: Valor, op: 'ADD' | 'MINUS' | 'MULTIPLY' | 'DIVIDE', b: Valor): Bloque => ({ type: 'math_arithmetic', fields: { OP: op }, inputs: { A: entrada(a), B: entrada(b) } })
export const variable = (nombre: string): Bloque => ({ type: 'variables_get', fields: { VAR: { id: 'var_' + nombre } } })
export const fijar = (nombre: string, valor: Valor): Bloque => ({ type: 'variables_set', fields: { VAR: { id: 'var_' + nombre } }, inputs: { VALUE: entrada(valor) } })

/** Programa completo: los bloques van debajo de «▶ al empezar». `variables` lista las que usa. */
export function programa(bloques: Bloque[], variables: string[] = []): Programa {
  const primero = cadena(bloques)
  return {
    blocks: { languageVersion: 0, blocks: [{ type: 'ev3_inicio', x: 40, y: 40, ...(primero ? { next: { block: primero } } : {}) }] },
    ...(variables.length ? { variables: variables.map(n => ({ name: n, id: 'var_' + n })) } : {}),
  }
}
