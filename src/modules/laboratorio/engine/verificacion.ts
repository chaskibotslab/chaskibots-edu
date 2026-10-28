// Verificación eléctrica del cableado, como la haría un profesor antes de
// encender el robot. Separa errores (en la vida real algo se quema o no
// puede funcionar: no se deja probar) de advertencias (funciona, pero no
// como el alumno espera: se deja probar y la simulación lo refleja).

import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from '../robots/doc'
import { nets, planDe } from './plan'

export interface Problema {
  nivel: 'error' | 'advertencia'
  texto: string
  /** Pines involucrados ("instancia.pin"), para resaltarlos en el esquema. */
  pines: string[]
}

const clave = (inst: string, pin: string) => `${inst}.${pin}`

/** Pines del código: números o constantes usadas en pinMode/digitalRead/digitalWrite/analogRead/analogWrite/attach. */
export function pinesDelCodigo(cpp: string): Set<string> {
  const sinComentarios = cpp.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  const constantes = new Map<string, string>()
  // Cualquier «NOMBRE = número», también en listas (const int ENA = 5, IN1 = 7;).
  for (const m of Array.from(sinComentarios.matchAll(/\b(\w+)\s*=\s*(A?\d+)\b/g))) constantes.set(m[1], m[2])
  for (const m of Array.from(sinComentarios.matchAll(/#define\s+(\w+)\s+(A?\d+)\b/g))) constantes.set(m[1], m[2])
  const usados = new Set<string>()
  const llamadas = /\b(?:pinMode|digitalRead|digitalWrite|analogRead|analogWrite|pulseIn|attach)\s*\(\s*(\w+)/g
  for (const m of Array.from(sinComentarios.matchAll(llamadas))) {
    const v = constantes.get(m[1]) ?? m[1]
    if (/^\d+$/.test(v)) usados.add(Number(v) >= 14 && Number(v) <= 19 ? `A${Number(v) - 14}` : `D${v}`)
    else if (/^A\d$/.test(v)) usados.add(v)
  }
  usados.delete('D13') // LED de la placa: no necesita cable
  return usados
}

export function verificar(doc: RobotDoc): Problema[] {
  const out: Problema[] = []
  const n = nets(doc)
  const grupos = new Map<string, string[]>()
  for (const [k, raiz] of Array.from(n.entries())) grupos.set(raiz, [...(grupos.get(raiz) ?? []), k])

  // Qué es cada pin, para razonar sobre cada net.
  type Rol = 'fuente' | 'tierra' | 'senal-placa' | 'pwm-placa' | 'motor' | 'bateria+' | 'entrada' | 'salida-analogica' | 'otro'
  const rol = new Map<string, Rol>()
  const etiqueta = new Map(doc.piezas.map(p => [p.id, p.etiqueta]))
  for (const p of doc.piezas) {
    const def = pieza(p.pieza)
    const c = def.comportamiento
    for (const pin of def.pines) {
      const k = clave(p.id, pin.nombre)
      if (pin.tipo === 'gnd') rol.set(k, 'tierra')
      else if (c.tipo === 'bateria' && pin.nombre === '+') rol.set(k, 'bateria+')
      else if (c.tipo === 'mcu-avr' && (pin.nombre === '5V' || pin.nombre === '3V3')) rol.set(k, 'fuente')
      else if (c.tipo === 'puente-h' && pin.nombre === c.alim.salida5v) rol.set(k, 'fuente')
      else if (c.tipo === 'mcu-avr' && pin.tipo !== 'alim') rol.set(k, pin.tipo === 'pwm' ? 'pwm-placa' : 'senal-placa')
      else if (c.tipo === 'motor-dc') rol.set(k, 'motor')
      else if (pin.tipo === 'analogico' && c.tipo !== 'mcu-avr') rol.set(k, 'salida-analogica')
      else rol.set(k, 'otro')
    }
  }
  const nombre = (k: string) => { const [i, p] = k.split('.'); return `${p} de ${etiqueta.get(i) ?? i}` }

  for (const miembros of Array.from(grupos.values())) {
    const de = (r: Rol) => miembros.filter(k => rol.get(k) === r)
    const fuentes = [...de('fuente'), ...de('bateria+')]
    const tierras = de('tierra')
    const senales = [...de('senal-placa'), ...de('pwm-placa')]
    if (fuentes.length && tierras.length) {
      out.push({ nivel: 'error', texto: `Cortocircuito: ${nombre(fuentes[0])} está unido a tierra (${nombre(tierras[0])}). En la vida real se calienta y se quema.`, pines: [fuentes[0], tierras[0]] })
    }
    if (de('motor').length && senales.length) {
      out.push({ nivel: 'error', texto: `${nombre(de('motor')[0])} va directo a ${nombre(senales[0])}: un pin del Arduino no da corriente para un motor. Usa un driver (L298N o TB6612).`, pines: [de('motor')[0], senales[0]] })
    }
    if (de('bateria+').length && senales.length) {
      out.push({ nivel: 'error', texto: `La batería está conectada a ${nombre(senales[0])}: le llegarían más de 5 V y se quemaría.`, pines: [de('bateria+')[0], senales[0]] })
    }
    if (de('motor').length && (fuentes.length || tierras.length)) {
      out.push({ nivel: 'advertencia', texto: `${nombre(de('motor')[0])} está fijo a la alimentación: giraría siempre, sin control. Conéctalo a las salidas del driver.`, pines: [de('motor')[0]] })
    }
    // Salida analógica de un sensor en un pin que no lee voltajes.
    const analogica = de('salida-analogica')[0]
    const digital = senales.find(k => /\.D\d+$/.test(k))
    if (analogica && digital) {
      out.push({ nivel: 'advertencia', texto: `${nombre(analogica)} es una salida analógica, pero va a ${nombre(digital)}, que solo lee HIGH/LOW. Para leer valores usa A0–A5.`, pines: [analogica, digital] })
    }
    // Dos salidas de sensores en el mismo cable: se pelean.
    const salidasSensor = miembros.filter(k => {
      const [i, p] = k.split('.')
      const def = doc.piezas.find(x => x.id === i)
      if (!def) return false
      const c = pieza(def.pieza).comportamiento.tipo
      return (c === 'ir-reflectivo' && (p === 'DO' || p === 'AO')) || (c === 'ir-obstaculo' && p === 'OUT') || (c === 'ultrasonido' && p === 'ECHO')
    })
    if (salidasSensor.length > 1) {
      out.push({ nivel: 'advertencia', texto: `${nombre(salidasSensor[0])} y ${nombre(salidasSensor[1])} están en el mismo pin: las dos señales se mezclan.`, pines: salidasSensor })
    }
  }

  // Velocidad del driver en un pin sin PWM.
  for (const d of doc.piezas) {
    const c = pieza(d.pieza).comportamiento
    if (c.tipo !== 'puente-h') continue
    for (const canal of c.canales) {
      const g = grupos.get(n.get(clave(d.id, canal.en)) ?? '') ?? []
      const sinPwm = g.find(k => rol.get(k) === 'senal-placa')
      if (sinPwm) out.push({ nivel: 'advertencia', texto: `${canal.en} (velocidad) va a ${nombre(sinPwm)}, que no tiene PWM (~): el motor solo podrá ir a fondo o apagado. Usa D3, D5, D6, D9, D10 o D11.`, pines: [clave(d.id, canal.en), sinPwm] })
    }
  }

  // Lo que ya detecta el plan: piezas sin alimentación, sin conectar, drivers apagados…
  for (const a of planDe(doc).avisos) out.push({ nivel: 'advertencia', texto: a, pines: [] })

  // Coherencia código ↔ cables.
  const mcu = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'mcu-avr')
  if (mcu && doc.programa.cpp.trim()) {
    for (const pin of Array.from(pinesDelCodigo(doc.programa.cpp))) {
      if (!n.has(clave(mcu.id, pin))) out.push({ nivel: 'advertencia', texto: `Tu programa usa el pin ${pin}, pero no hay ningún cable en ${pin}.`, pines: [clave(mcu.id, pin)] })
    }
  }

  // Sin duplicados (mismo texto).
  const vistos = new Set<string>()
  return out.filter(p => (vistos.has(p.texto) ? false : (vistos.add(p.texto), true)))
}
