// Verificación eléctrica del cableado, como la haría un profesor antes de
// encender el robot. Separa errores (en la vida real algo se quema o no
// puede funcionar: no se deja probar) de advertencias (funciona, pero no
// como el alumno espera: se deja probar y la simulación lo refleja).

import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from '../robots/doc'
import { nets, planDe } from './plan'
import { infoPlaca, mcuDe } from './placa'

export interface Problema {
  nivel: 'error' | 'advertencia'
  texto: string
  /** Pines involucrados ("instancia.pin"), para resaltarlos en el esquema. */
  pines: string[]
}

const clave = (inst: string, pin: string) => `${inst}.${pin}`

/** Pines del código: números o constantes usadas en pinMode/digitalRead/digitalWrite/analogRead/analogWrite/attach. */
export function pinesDelCodigo(cpp: string, esp32 = false): Set<string> {
  const sinComentarios = cpp.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  const constantes = new Map<string, string>()
  // Cualquier «NOMBRE = número», también en listas (const int ENA = 5, IN1 = 7;).
  for (const m of Array.from(sinComentarios.matchAll(/\b(\w+)\s*=\s*(A?\d+)\b/g))) constantes.set(m[1], m[2])
  for (const m of Array.from(sinComentarios.matchAll(/#define\s+(\w+)\s+(A?\d+)\b/g))) constantes.set(m[1], m[2])
  const usados = new Set<string>()
  const llamadas = /\b(?:pinMode|digitalRead|digitalWrite|analogRead|analogWrite|pulseIn|attach|tone|noTone)\s*\(\s*(\w+)/g
  for (const m of Array.from(sinComentarios.matchAll(llamadas))) {
    const v = constantes.get(m[1]) ?? m[1]
    // En el ESP32 el número es el GPIO; en Arduino, 14–19 son A0–A5.
    if (/^\d+$/.test(v)) usados.add(esp32 ? `GPIO${v}` : Number(v) >= 14 && Number(v) <= 19 ? `A${Number(v) - 14}` : `D${v}`)
    else if (/^A\d$/.test(v)) usados.add(v)
  }
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
      else if (c.tipo === 'mcu' && (pin.nombre === '5V' || pin.nombre === '3V3' || (c.placa === 'esp32' && pin.nombre === 'VIN'))) rol.set(k, 'fuente')
      else if (c.tipo === 'puente-h' && pin.nombre === c.alim.salida5v) rol.set(k, 'fuente')
      else if (c.tipo === 'mcu' && pin.tipo !== 'alim') rol.set(k, pin.tipo === 'pwm' || c.placa === 'esp32' ? 'pwm-placa' : 'senal-placa')
      else if (c.tipo === 'motor-dc') rol.set(k, 'motor')
      else if (pin.tipo === 'analogico' && c.tipo !== 'mcu') rol.set(k, 'salida-analogica')
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

  // LED sin resistencia en serie: al encenderlo pasa demasiada corriente y se quema.
  for (const p of doc.piezas) {
    const c = pieza(p.pieza).comportamiento
    if (c.tipo !== 'led' && c.tipo !== 'led-rgb') continue
    // En serie = la resistencia comparte el cable con la pata del LED (no cuenta si ese cable es la tierra o los 5 V).
    const conResistencia = (pin: string) => {
      const g = grupos.get(n.get(clave(p.id, pin)) ?? '') ?? []
      if (g.some(k => rol.get(k) === 'tierra' || rol.get(k) === 'fuente')) return false
      return g.some(k => {
        const d = doc.piezas.find(x => x.id === k.split('.')[0])
        return !!d && pieza(d.pieza).comportamiento.tipo === 'resistencia'
      })
    }
    const anodos = c.tipo === 'led' ? ['A'] : ['R', 'G', 'B']
    const conectado = n.has(clave(p.id, 'K')) && anodos.some(a => n.has(clave(p.id, a)))
    if (conectado && !conResistencia('K') && anodos.some(a => n.has(clave(p.id, a)) && !conResistencia(a))) {
      out.push({ nivel: 'advertencia', texto: `${p.etiqueta} no tiene resistencia en serie: en la vida real se quema al encenderlo. Pon una de 220 Ω o 330 Ω entre la pata corta y tierra.`, pines: [clave(p.id, 'K')] })
    }
  }

  // Lo que ya detecta el plan: piezas sin alimentación, sin conectar, drivers apagados…
  for (const a of planDe(doc).avisos) out.push({ nivel: 'advertencia', texto: a, pines: [] })

  // Coherencia código ↔ cables.
  const mcu = mcuDe(doc)
  const info = infoPlaca(doc)
  if (mcu && doc.programa.cpp.trim()) {
    for (const pin of Array.from(pinesDelCodigo(doc.programa.cpp, info.placa === 'esp32'))) {
      if (pin === info.pinLed) continue // LED de la placa: no necesita cable
      if (!n.has(clave(mcu.id, pin))) out.push({ nivel: 'advertencia', texto: `Tu programa usa el pin ${pin}, pero no hay ningún cable en ${pin}.`, pines: [clave(mcu.id, pin)] })
    }
  }

  // ESP32 (3,3 V): una señal de 5 V en un GPIO lo puede dañar.
  if (mcu && info.vLogica === 3.3) {
    for (const p of doc.piezas) {
      const def = pieza(p.pieza)
      const vcc = def.pines.find(x => x.nombre === 'VCC' || x.nombre === 'V+')
      if (!vcc || def.comportamiento.tipo === 'servo') continue
      const g = grupos.get(n.get(clave(p.id, vcc.nombre)) ?? '') ?? []
      const a5v = g.some(k => k === clave(mcu.id, 'VIN') || /\.(5V)$/.test(k))
      if (!a5v) continue
      const salidas = def.pines.filter(x => ['DO', 'AO', 'OUT', 'ECHO'].includes(x.nombre)).map(x => clave(p.id, x.nombre))
      const aGpio = salidas.find(k => (grupos.get(n.get(k) ?? '') ?? []).some(m => m.startsWith(mcu.id + '.GPIO')))
      if (aGpio) out.push({ nivel: 'advertencia', texto: `${p.etiqueta} está alimentado con 5 V y su señal va a un GPIO del ESP32, que trabaja con 3,3 V: en la vida real lo puede dañar. Aliméntalo desde 3V3.`, pines: [aGpio] })
    }
  }

  // Sin duplicados (mismo texto).
  const vistos = new Set<string>()
  return out.filter(p => (vistos.has(p.texto) ? false : (vistos.add(p.texto), true)))
}
