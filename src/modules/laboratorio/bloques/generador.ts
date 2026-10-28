// Generador de código Arduino (C++) a partir de un programa de bloques.
//
// Lee el JSON que guarda Blockly (serialization.workspaces.save) y escribe un
// sketch legible y comentado. No usa Blockly: así se puede probar sin
// navegador y el resultado es siempre el mismo. Los pines salen de la tabla de
// pines del robot (los cables reales), igual que en las plantillas.

import { pieza } from '../catalogo/piezas'
import { pinCodigo, pinDePlaca, type FilaPin } from '../engine/autocableado'
import { infoPlaca } from '../engine/placa'
import type { RobotDoc } from '../robots/doc'

export interface BloqueJson {
  type: string
  id?: string
  fields?: Record<string, unknown>
  inputs?: Record<string, { block?: BloqueJson; shadow?: BloqueJson }>
  next?: { block?: BloqueJson }
}

export interface ProgramaBloques {
  blocks?: { blocks?: BloqueJson[] }
  variables?: { name: string; id: string }[]
}

/** Qué partes del robot existen (para generar el código y armar la caja de bloques). */
export interface PartesRobot {
  motores: boolean
  lineaIzq: string | null
  lineaDer: string | null
  ultrasonido: string | null
  obstaculoIzq: string | null
  obstaculoDer: string | null
  servo: string | null
}

export function partesDe(doc: RobotDoc): PartesRobot {
  const por = (f: (p: RobotDoc['piezas'][number]) => boolean) => doc.piezas.find(f)?.id ?? null
  const tipo = (id: string) => pieza(doc.piezas.find(p => p.id === id)!.pieza).comportamiento.tipo
  const sensoresIr = doc.piezas.filter(p => tipo(p.id) === 'ir-obstaculo')
  return {
    motores: doc.piezas.some(p => tipo(p.id) === 'puente-h') && doc.piezas.some(p => tipo(p.id) === 'motor-dc'),
    lineaIzq: por(p => p.padre?.montaje === 'piso-izq' && tipo(p.id) === 'ir-reflectivo'),
    lineaDer: por(p => p.padre?.montaje === 'piso-der' && tipo(p.id) === 'ir-reflectivo'),
    ultrasonido: por(p => tipo(p.id) === 'ultrasonido'),
    // Un solo IR de obstáculos cuenta como «izquierdo» si está al frente o a la izquierda.
    obstaculoIzq: sensoresIr.find(p => p.padre?.montaje !== 'frente-der')?.id ?? null,
    obstaculoDer: sensoresIr.find(p => p.padre?.montaje === 'frente-der')?.id ?? null,
    servo: por(p => tipo(p.id) === 'servo'),
  }
}

const ORDEN_ATOMICO = 0
const ORDEN_UNARIO = 2
const ORDEN_MULT = 5
const ORDEN_SUMA = 6
const ORDEN_RELACION = 8
const ORDEN_IGUALDAD = 9
const ORDEN_Y = 13
const ORDEN_O = 14
const ORDEN_NINGUNO = 99

type Valor = [string, number]

export interface Generado { cpp: string; avisos: string[] }

export function generarArduino(programa: ProgramaBloques, doc: RobotDoc, tabla: FilaPin[]): Generado {
  const partes = partesDe(doc)
  const avisos: string[] = []
  const usa = new Set<string>()
  const nombresVar = new Map((programa.variables ?? []).map(v => [v.id, nombreC(v.name)]))
  const pin = (inst: string | null, p: string) => (inst ? pinCodigo(pinDePlaca(tabla, inst, p)) : '-1')
  const falta = (que: string) => { avisos.push(`Usas un bloque de ${que}, pero el robot no lo tiene`); return '0' }

  const valor = (b: BloqueJson | undefined, entrada: string, orden: number, defecto = '0'): string => {
    const hijo = b?.inputs?.[entrada]?.block ?? b?.inputs?.[entrada]?.shadow
    if (!hijo) return defecto
    const [code, ordenHijo] = expresion(hijo)
    return ordenHijo > orden ? `(${code})` : code
  }

  const campo = (b: BloqueJson, nombre: string) => String(b.fields?.[nombre] ?? '')

  function expresion(b: BloqueJson): Valor {
    switch (b.type) {
      case 'math_number': return [String(Number(campo(b, 'NUM')) || 0), ORDEN_ATOMICO]
      case 'logic_boolean': return [campo(b, 'BOOL') === 'TRUE' ? 'true' : 'false', ORDEN_ATOMICO]
      case 'text': return [JSON.stringify(campo(b, 'TEXT')), ORDEN_ATOMICO]
      case 'variables_get': {
        const v = b.fields?.VAR as { id?: string } | undefined
        return [nombresVar.get(v?.id ?? '') ?? 'variable', ORDEN_ATOMICO]
      }
      case 'logic_negate': return [`!${valor(b, 'BOOL', ORDEN_UNARIO, 'true')}`, ORDEN_UNARIO]
      case 'logic_compare': {
        const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[campo(b, 'OP')] ?? '=='
        const orden = op === '==' || op === '!=' ? ORDEN_IGUALDAD : ORDEN_RELACION
        return [`${valor(b, 'A', orden)} ${op} ${valor(b, 'B', orden)}`, orden]
      }
      case 'logic_operation': {
        const y = campo(b, 'OP') === 'AND'
        const orden = y ? ORDEN_Y : ORDEN_O
        return [`${valor(b, 'A', orden, 'false')} ${y ? '&&' : '||'} ${valor(b, 'B', orden, 'false')}`, orden]
      }
      case 'math_arithmetic': {
        const op = campo(b, 'OP')
        if (op === 'POWER') return [`pow(${valor(b, 'A', ORDEN_NINGUNO)}, ${valor(b, 'B', ORDEN_NINGUNO)})`, ORDEN_ATOMICO]
        const s = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/' }[op] ?? '+'
        const orden = s === '+' || s === '-' ? ORDEN_SUMA : ORDEN_MULT
        return [`${valor(b, 'A', orden)} ${s} ${valor(b, 'B', orden + 1)}`, orden]
      }
      case 'math_random_int': return [`random(${valor(b, 'FROM', ORDEN_NINGUNO)}, ${valor(b, 'TO', ORDEN_SUMA)} + 1)`, ORDEN_ATOMICO]
      case 'cb_linea': {
        const lado = campo(b, 'LADO')
        const inst = lado === 'DER' ? partes.lineaDer : partes.lineaIzq
        if (!inst) return [falta('sensor de línea'), ORDEN_ATOMICO]
        return [`digitalRead(${lado === 'DER' ? 'LINEA_DER' : 'LINEA_IZQ'}) == HIGH`, ORDEN_IGUALDAD]
      }
      case 'cb_linea_valor': {
        const lado = campo(b, 'LADO')
        const inst = lado === 'DER' ? partes.lineaDer : partes.lineaIzq
        if (!inst) return [falta('sensor de línea'), ORDEN_ATOMICO]
        usa.add(lado === 'DER' ? 'lineaValorDer' : 'lineaValorIzq')
        return [`analogRead(${lado === 'DER' ? 'LINEA_DER_AO' : 'LINEA_IZQ_AO'})`, ORDEN_ATOMICO]
      }
      case 'cb_distancia':
        if (!partes.ultrasonido) return [falta('ultrasonido'), ORDEN_ATOMICO]
        usa.add('ultrasonido')
        return ['medirCm()', ORDEN_ATOMICO]
      case 'cb_obstaculo': {
        const lado = campo(b, 'LADO')
        const inst = lado === 'DER' ? partes.obstaculoDer : partes.obstaculoIzq
        if (!inst) return [falta('sensor IR de obstáculos'), ORDEN_ATOMICO]
        usa.add(lado === 'DER' ? 'obstaculoDer' : 'obstaculoIzq')
        return [`digitalRead(${lado === 'DER' ? 'IR_DER' : 'IR_IZQ'}) == LOW`, ORDEN_IGUALDAD]
      }
      case 'cb_tiempo': return ['millis() / 1000.0', ORDEN_MULT]
    }
    avisos.push(`El bloque «${b.type}» no se puede convertir a código`)
    return ['0', ORDEN_ATOMICO]
  }

  const sangria = (code: string) => code.split('\n').map(l => (l ? '  ' + l : l)).join('\n')

  function sentencias(b: BloqueJson | undefined): string {
    let out = ''
    for (let x = b; x; x = x.next?.block) out += sentencia(x)
    return out
  }

  const cuerpo = (b: BloqueJson, entrada: string) => sangria(sentencias(b.inputs?.[entrada]?.block))

  function sentencia(b: BloqueJson): string {
    switch (b.type) {
      case 'controls_if': {
        let code = ''
        for (let i = 0; b.inputs?.[`IF${i}`] || i === 0; i++) {
          if (!b.inputs?.[`IF${i}`] && i > 0) break
          code += `${i === 0 ? 'if' : ' else if'} (${valor(b, `IF${i}`, ORDEN_NINGUNO, 'false')}) {\n${cuerpo(b, `DO${i}`)}}`
        }
        if (b.inputs?.ELSE) code += ` else {\n${cuerpo(b, 'ELSE')}}`
        return code + '\n'
      }
      case 'controls_repeat_ext':
        return `for (int i = 0; i < ${valor(b, 'TIMES', ORDEN_RELACION, '10')}; i++) {\n${cuerpo(b, 'DO')}}\n`
      case 'controls_whileUntil': {
        const cond = valor(b, 'BOOL', ORDEN_NINGUNO, 'false')
        return `while (${campo(b, 'MODE') === 'UNTIL' ? `!(${cond})` : cond}) {\n${cuerpo(b, 'DO')}}\n`
      }
      case 'controls_flow_statements': return campo(b, 'FLOW') === 'CONTINUE' ? 'continue;\n' : 'break;\n'
      case 'variables_set': {
        const v = b.fields?.VAR as { id?: string } | undefined
        return `${nombresVar.get(v?.id ?? '') ?? 'variable'} = ${valor(b, 'VALUE', ORDEN_NINGUNO)};\n`
      }
      case 'math_change': {
        const v = b.fields?.VAR as { id?: string } | undefined
        return `${nombresVar.get(v?.id ?? '') ?? 'variable'} += ${valor(b, 'DELTA', ORDEN_NINGUNO, '1')};\n`
      }
      case 'cb_mover': {
        if (!partes.motores) { falta('motores'); return '' }
        usa.add('motores')
        const v = `vel(${valor(b, 'VEL', ORDEN_NINGUNO, '60')})`
        const dir = campo(b, 'DIR')
        const [i, d] = dir === 'ATRAS' ? [`-${v}`, `-${v}`] : dir === 'IZQ' ? [`-${v}`, v] : dir === 'DER' ? [v, `-${v}`] : [v, v]
        const que = { ADELANTE: 'avanzar', ATRAS: 'retroceder', IZQ: 'girar a la izquierda', DER: 'girar a la derecha' }[dir] ?? 'avanzar'
        return `motores(${i}, ${d});   // ${que}\n`
      }
      case 'cb_lados':
        if (!partes.motores) { falta('motores'); return '' }
        usa.add('motores')
        return `motores(vel(${valor(b, 'IZQ', ORDEN_NINGUNO)}), vel(${valor(b, 'DER', ORDEN_NINGUNO)}));\n`
      case 'cb_detener':
        if (!partes.motores) { falta('motores'); return '' }
        usa.add('motores')
        return 'motores(0, 0);   // detener\n'
      case 'cb_esperar': return `delay(${valor(b, 'SEG', ORDEN_MULT, '1')} * 1000);\n`
      case 'cb_servo':
        if (!partes.servo) { falta('servo'); return '' }
        usa.add('servo')
        return `servo.write(constrain(${valor(b, 'ANG', ORDEN_NINGUNO, '90')}, 0, 180));\n`
      case 'cb_led':
        usa.add('led')
        return `digitalWrite(LED_BUILTIN, ${campo(b, 'ESTADO') === 'APAGAR' ? 'LOW' : 'HIGH'});\n`
      case 'cb_imprimir':
        return `Serial.println(${valor(b, 'TEXTO', ORDEN_NINGUNO, '""')});\n`
    }
    // Una expresión suelta como sentencia (p. ej. «medirCm()»).
    const [code] = expresion(b)
    return `${code};\n`
  }

  const raices = programa.blocks?.blocks ?? []
  const inicio = raices.filter(b => b.type === 'cb_iniciar').map(b => sentencias(b.inputs?.DO?.block)).join('')
  const siempre = raices.filter(b => b.type === 'cb_siempre').map(b => sentencias(b.inputs?.DO?.block)).join('')
  if (!raices.some(b => b.type === 'cb_siempre')) avisos.push('Falta el bloque «repetir siempre»: sin él, el robot no hace nada')

  // ----- armar el sketch -----
  const lineas: string[] = ['// Programa hecho con bloques en ChaskiBots Lab', '']
  if (usa.has('servo')) lineas.push(infoPlaca(doc).placa === 'esp32' ? '#include <ESP32Servo.h>' : '#include <Servo.h>', '')
  const constantes: string[] = []
  if (usa.has('motores')) {
    const d = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'puente-h')!
    const c = pieza(d.pieza).comportamiento
    if (c.tipo === 'puente-h') {
      const [a, bb] = c.canales
      constantes.push(
        `const int ENA = ${pin(d.id, a.en)}, IN1 = ${pin(d.id, a.in_a)}, IN2 = ${pin(d.id, a.in_b)};   // motores del lado izquierdo`,
        `const int ENB = ${pin(d.id, bb.en)}, IN3 = ${pin(d.id, bb.in_a)}, IN4 = ${pin(d.id, bb.in_b)};   // motores del lado derecho`,
      )
    }
  }
  const sinCodigo = (s: string) => s.replace(/"(?:[^"\\]|\\.)*"/g, '""')
  const todo = sinCodigo(inicio + siempre)
  if (/LINEA_IZQ\b/.test(todo)) constantes.push(`const int LINEA_IZQ = ${pin(partes.lineaIzq, 'DO')};   // sensor de línea izquierdo (DO)`)
  if (/LINEA_DER\b/.test(todo)) constantes.push(`const int LINEA_DER = ${pin(partes.lineaDer, 'DO')};   // sensor de línea derecho (DO)`)
  if (/LINEA_IZQ_AO/.test(todo)) constantes.push(`const int LINEA_IZQ_AO = ${pin(partes.lineaIzq, 'AO')};`)
  if (/LINEA_DER_AO/.test(todo)) constantes.push(`const int LINEA_DER_AO = ${pin(partes.lineaDer, 'AO')};`)
  if (usa.has('obstaculoIzq')) constantes.push(`const int IR_IZQ = ${pin(partes.obstaculoIzq, 'OUT')};   // IR de obstáculos (LOW = hay algo)`)
  if (usa.has('obstaculoDer')) constantes.push(`const int IR_DER = ${pin(partes.obstaculoDer, 'OUT')};`)
  if (usa.has('ultrasonido')) constantes.push(`const int TRIG = ${pin(partes.ultrasonido, 'TRIG')}, ECHO = ${pin(partes.ultrasonido, 'ECHO')};   // ultrasonido`)
  if (usa.has('servo')) constantes.push(`const int SERVO_PIN = ${pin(partes.servo, 'SIG')};`)
  if (constantes.length) lineas.push(...constantes, '')

  const vars = programa.variables ?? []
  if (vars.length) lineas.push('// Variables', ...vars.map(v => `float ${nombreC(v.name)} = 0;`), '')
  if (usa.has('servo')) lineas.push('Servo servo;', '')

  if (usa.has('motores')) {
    lineas.push(
      '// Convierte un porcentaje (-100 a 100) en la velocidad del driver (-255 a 255)',
      'int vel(float porcentaje) {',
      '  return constrain(porcentaje, -100, 100) * 255 / 100;',
      '}',
      '',
      '// Velocidad de cada lado: positivo = adelante, negativo = atrás',
      'void motores(int izq, int der) {',
      '  digitalWrite(IN1, izq >= 0 ? HIGH : LOW);',
      '  digitalWrite(IN2, izq >= 0 ? LOW : HIGH);',
      '  analogWrite(ENA, abs(izq));',
      '  digitalWrite(IN3, der >= 0 ? HIGH : LOW);',
      '  digitalWrite(IN4, der >= 0 ? LOW : HIGH);',
      '  analogWrite(ENB, abs(der));',
      '}',
      '',
    )
  }
  if (usa.has('ultrasonido')) {
    lineas.push(
      '// Mide la distancia en cm con el ultrasonido (400 si no hay eco)',
      'long medirCm() {',
      '  digitalWrite(TRIG, LOW);',
      '  delayMicroseconds(2);',
      '  digitalWrite(TRIG, HIGH);',
      '  delayMicroseconds(10);',
      '  digitalWrite(TRIG, LOW);',
      '  long us = pulseIn(ECHO, HIGH, 30000);',
      '  if (us == 0) return 400;',
      '  return us / 58;',
      '}',
      '',
    )
  }

  const config: string[] = ['Serial.begin(9600);']
  if (usa.has('motores')) config.push('pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);', 'pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);')
  if (/LINEA_IZQ\b/.test(todo)) config.push('pinMode(LINEA_IZQ, INPUT);')
  if (/LINEA_DER\b/.test(todo)) config.push('pinMode(LINEA_DER, INPUT);')
  if (usa.has('obstaculoIzq')) config.push('pinMode(IR_IZQ, INPUT);')
  if (usa.has('obstaculoDer')) config.push('pinMode(IR_DER, INPUT);')
  if (usa.has('ultrasonido')) config.push('pinMode(TRIG, OUTPUT);', 'pinMode(ECHO, INPUT);')
  if (usa.has('servo')) config.push('servo.attach(SERVO_PIN);')
  if (usa.has('led')) config.push('pinMode(LED_BUILTIN, OUTPUT);')

  lineas.push('void setup() {', ...config.map(l => '  ' + l))
  if (inicio) lineas.push('', '  // al encender', sangria(inicio).replace(/\n$/, ''))
  lineas.push('}', '', 'void loop() {')
  if (siempre) lineas.push(sangria(siempre).replace(/\n$/, ''))
  lineas.push('}', '')
  return { cpp: lineas.join('\n'), avisos: Array.from(new Set(avisos)) }
}

/** Nombre válido en C a partir del nombre que le dio el alumno a la variable. */
function nombreC(nombre: string) {
  const limpio = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_]/g, '_')
  const n = /^[A-Za-z_]/.test(limpio) ? limpio : `v_${limpio}`
  const reservadas = new Set(['int', 'float', 'long', 'if', 'else', 'for', 'while', 'loop', 'setup', 'delay', 'servo', 'motores', 'vel'])
  return reservadas.has(n) ? `${n}_` : n
}
