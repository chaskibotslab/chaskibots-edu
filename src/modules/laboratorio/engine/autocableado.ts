// Cableado automático: conecta cada pieza a pines libres de la placa como lo
// haría un profesor: velocidad de motores y servos en pines PWM, lecturas
// analógicas en A0–A5, alimentación y tierra comunes. El orden de preferencia
// reproduce el cableado del seguidor de F1 (ENA D5, IN1–IN4 D7–D10, sensores
// en D2/D3 y A0/A1), para que su código siga funcionando.

import { pieza } from '../catalogo/piezas'
import type { Cable, RobotDoc } from '../robots/doc'
import { poses } from './ensamblaje'
import { infoPlaca, mcuDe, pinCodigo } from './placa'

const ROJO = '#ef4444'
const NEGRO = '#111827'
const SENALES = ['#a855f7', '#3b82f6', '#22c55e', '#f97316', '#eab308', '#f8fafc', '#06b6d4', '#ec4899', '#84cc16', '#f59e0b', '#14b8a6', '#8b5cf6']


export interface FilaPin {
  instancia: string
  etiqueta: string
  pin: string        // pin de la pieza (ENA, DO, TRIG…)
  placa: string      // pin de la placa (D5, A0…)
  uso: string        // para qué es, en palabras
}

export interface Cableado {
  cables: Cable[]
  tabla: FilaPin[]
  avisos: string[]
}

/**
 * Conecta las piezas a la placa. Con `conservar`, respeta los cables que ya
 * hay (cableado a mano) y solo conecta las piezas que todavía no tienen
 * ningún cable, usando pines libres.
 */
export function autocablear(doc: RobotDoc, opciones: { conservar?: boolean } = {}): Cableado {
  const existentes = new Set(doc.piezas.map(p => p.id))
  const cables: Cable[] = opciones.conservar ? doc.cables.filter(c => existentes.has(c.de[0]) && existentes.has(c.a[0])) : []
  const tabla: FilaPin[] = []
  const avisos: string[] = []
  const info = infoPlaca(doc)
  const PREFERENCIAS = info.preferencias
  const usados = new Set<string>(info.reservados) // Serial
  let color = 0
  const ps = poses(doc)

  const mcu = mcuDe(doc)
  const driver = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'puente-h')
  const bateria = doc.piezas.find(p => pieza(p.pieza).comportamiento.tipo === 'bateria')
  const de = (tipo: string) => doc.piezas
    .filter(p => pieza(p.pieza).comportamiento.tipo === tipo)
    .sort((a, b) => ps.get(a.id)!.pos.z - ps.get(b.id)!.pos.z) // de izquierda a derecha

  // Piezas que ya tienen cables (se dejan como están) y pines ya ocupados.
  const cableadas = new Set(cables.flatMap(c => [c.de[0], c.a[0]]))
  for (const c of cables) for (const [i, p] of [c.de, c.a]) if (i === mcu?.id) usados.add(p)
  const nueva = (inst: string) => !cableadas.has(inst)

  const cable = (a: [string, string], b: [string, string], c?: string) => {
    const igual = (x: Cable) => (x.de.join() === a.join() && x.a.join() === b.join()) || (x.de.join() === b.join() && x.a.join() === a.join())
    if (!cables.some(igual)) cables.push({ de: a, a: b, color: c ?? SENALES[(color++ + cables.length) % SENALES.length] })
  }

  const tomar = (lista: string[], inst: string, etiqueta: string, pin: string, uso: string): string | null => {
    if (!mcu || !nueva(inst)) return null
    const libre = lista.find(p => !usados.has(p))
    if (!libre) { avisos.push(`${etiqueta}: no quedan pines libres para ${pin}`); return null }
    usados.add(libre)
    cable([inst, pin], [mcu.id, libre])
    tabla.push({ instancia: inst, etiqueta, pin, placa: libre, uso })
    return libre
  }

  const alimentar = (inst: string, vcc: string, gnd: string) => {
    if (!mcu) return
    cable([inst, vcc], [mcu.id, vcc === 'V+' ? info.alimServo : info.alimSensores], ROJO)
    cable([inst, gnd], [mcu.id, 'GND'], NEGRO)
  }

  // Alimentación: batería → driver (o directo al Arduino si no hay driver).
  const dc = driver ? pieza(driver.pieza).comportamiento : null
  const alim = dc?.tipo === 'puente-h' ? dc.alim : null
  // Solo si la batería o el driver son nuevos (no se rehace lo que el alumno cableó).
  const alimNueva = (bateria && nueva(bateria.id)) || (driver && nueva(driver.id))
  if (bateria && driver && alim && alimNueva) {
    cable([bateria.id, '+'], [driver.id, alim.motor], ROJO)
    cable([bateria.id, '-'], [driver.id, alim.gnd], NEGRO)
    if (mcu) {
      if (alim.salida5v) {
        // L298N: su regulador de 5 V alimenta al Arduino.
        cable([driver.id, alim.salida5v], [mcu.id, info.placa === 'esp32' ? 'VIN' : '5V'], ROJO)
      } else {
        // TB6612: la batería alimenta al Arduino por VIN y el Arduino da 5 V a la lógica.
        cable([bateria.id, '+'], [mcu.id, 'VIN'], ROJO)
      }
      if (alim.vcc) cable([driver.id, alim.vcc], [mcu.id, info.alimSensores], ROJO)
      if (alim.standby) cable([driver.id, alim.standby], [mcu.id, info.alimSensores], ROJO)
      cable([driver.id, alim.gnd], [mcu.id, 'GND'], NEGRO)
    }
  } else if (bateria && mcu && !driver && nueva(bateria.id)) {
    cable([bateria.id, '+'], [mcu.id, 'VIN'], ROJO)
    cable([bateria.id, '-'], [mcu.id, 'GND'], NEGRO)
  }

  // Driver y motores: los motores de la izquierda al canal A, los de la derecha al B.
  if (driver) {
    const comp = pieza(driver.pieza).comportamiento
    if (comp.tipo === 'puente-h') {
      const motores = de('motor-dc')
      const [chA, chB] = comp.canales
      const grupos = [
        { canal: chA, motores: motores.filter(m => ps.get(m.id)!.pos.z < 0), lado: 'izquierdo' },
        { canal: chB, motores: motores.filter(m => ps.get(m.id)!.pos.z >= 0), lado: 'derecho' },
      ]
      for (const g of grupos) {
        if (!g.motores.length) continue
        tomar(PREFERENCIAS.en, driver.id, `Driver: velocidad lado ${g.lado}`, g.canal.en, `Velocidad de los motores del lado ${g.lado} (PWM)`)
        tomar(PREFERENCIAS.in, driver.id, `Driver: dirección lado ${g.lado}`, g.canal.in_a, `Dirección lado ${g.lado}`)
        tomar(PREFERENCIAS.in, driver.id, `Driver: dirección lado ${g.lado}`, g.canal.in_b, `Dirección lado ${g.lado}`)
        for (const m of g.motores) {
          if (!nueva(m.id)) continue
          cable([driver.id, g.canal.out_a], [m.id, 'M+'], ROJO)
          cable([driver.id, g.canal.out_b], [m.id, 'M-'], NEGRO)
        }
      }
    }
  }

  for (const s of de('ir-reflectivo')) {
    if (!nueva(s.id)) continue
    alimentar(s.id, 'VCC', 'GND')
    tomar(PREFERENCIAS.lineaDigital, s.id, s.etiqueta, 'DO', 'Lectura digital: HIGH = línea negra')
    tomar(PREFERENCIAS.lineaAnalogica, s.id, s.etiqueta, 'AO', 'Lectura analógica del piso')
  }
  for (const s of de('ultrasonido')) {
    if (!nueva(s.id)) continue
    alimentar(s.id, 'VCC', 'GND')
    tomar(PREFERENCIAS.trig, s.id, s.etiqueta, 'TRIG', 'Disparo del ultrasonido')
    tomar(PREFERENCIAS.echo, s.id, s.etiqueta, 'ECHO', 'Eco del ultrasonido (se mide con pulseIn)')
  }
  for (const s of de('ir-obstaculo')) {
    if (!nueva(s.id)) continue
    alimentar(s.id, 'VCC', 'GND')
    tomar(PREFERENCIAS.obstaculo, s.id, s.etiqueta, 'OUT', 'LOW = hay obstáculo')
  }
  for (const s of de('servo')) {
    if (!nueva(s.id)) continue
    alimentar(s.id, 'V+', 'GND')
    tomar(PREFERENCIAS.servo, s.id, s.etiqueta, 'SIG', 'Señal del servo')
  }

  // Mesa de electrónica: cada componente a un pin libre y a tierra, de izquierda
  // a derecha. Cada LED lleva en serie una resistencia libre (si no hay, va
  // directo a tierra y la verificación avisa que se va a quemar).
  if (mcu) {
    const enOrden = (tipo: string) => doc.piezas
      .filter(p => pieza(p.pieza).comportamiento.tipo === tipo)
      .sort((a, b) => ps.get(a.id)!.pos.x - ps.get(b.id)!.pos.x || ps.get(a.id)!.pos.z - ps.get(b.id)!.pos.z)
    const ohm = (id: string) => { const c = pieza(doc.piezas.find(p => p.id === id)!.pieza).comportamiento; return c.tipo === 'resistencia' ? c.ohm : 0 }
    const libres = enOrden('resistencia').filter(r => nueva(r.id))
    /** Une (inst, pin) con tierra a través de una resistencia libre (la más parecida a lo que se pide). */
    const aTierra = (inst: string, pin: string, para: 'led' | 'divisor') => {
      const i = para === 'led' ? libres.findIndex(r => ohm(r.id) <= 1000) : libres.findIndex(r => ohm(r.id) >= 1000)
      const r = libres.splice(i >= 0 ? i : 0, 1)[0]
      if (!r) { cable([inst, pin], [mcu.id, 'GND'], NEGRO); return }
      cable([inst, pin], [r.id, '1'])
      cable([r.id, '2'], [mcu.id, 'GND'], NEGRO)
    }
    for (const l of enOrden('led')) {
      if (!nueva(l.id)) continue
      tomar(PREFERENCIAS.led, l.id, l.etiqueta, 'A', 'HIGH enciende el LED')
      aTierra(l.id, 'K', 'led')
    }
    for (const l of enOrden('led-rgb')) {
      if (!nueva(l.id)) continue
      for (const [pin, color] of [['R', 'rojo'], ['G', 'verde'], ['B', 'azul']]) tomar(PREFERENCIAS.en, l.id, l.etiqueta, pin, `Brillo del ${color} (analogWrite 0–255)`)
      aTierra(l.id, 'K', 'led')
    }
    for (const b of enOrden('pulsador')) {
      if (!nueva(b.id)) continue
      tomar(PREFERENCIAS.boton, b.id, b.etiqueta, '1', 'Con INPUT_PULLUP: presionado = LOW')
      cable([b.id, '2'], [mcu.id, 'GND'], NEGRO)
    }
    for (const z of enOrden('buzzer')) {
      if (!nueva(z.id)) continue
      const c = pieza(z.pieza).comportamiento
      tomar(PREFERENCIAS.buzzer, z.id, z.etiqueta, '+', c.tipo === 'buzzer' && c.activo ? 'HIGH = suena' : 'Suena con tone(pin, frecuencia)')
      cable([z.id, '-'], [mcu.id, 'GND'], NEGRO)
    }
    for (const pt of enOrden('potenciometro')) {
      if (!nueva(pt.id)) continue
      cable([pt.id, '1'], [mcu.id, info.alimSensores], ROJO)
      tomar(PREFERENCIAS.analogica, pt.id, pt.etiqueta, 'W', 'Posición de la perilla (analogRead)')
      cable([pt.id, '2'], [mcu.id, 'GND'], NEGRO)
    }
    for (const l of enOrden('ldr')) {
      if (!nueva(l.id)) continue
      cable([l.id, '1'], [mcu.id, info.alimSensores], ROJO)
      tomar(PREFERENCIAS.analogica, l.id, l.etiqueta, '2', 'Luz (analogRead): más luz, número más alto')
      aTierra(l.id, '2', 'divisor')
    }
  }

  // Tabla con TODOS los cables a pines de señal de la placa (también los hechos a mano).
  if (mcu) {
    const mcuPines = new Map(pieza(mcu.pieza).pines.map(p => [p.nombre, p]))
    for (const c of cables) {
      const [lado, otro] = c.de[0] === mcu.id ? [c.de, c.a] : c.a[0] === mcu.id ? [c.a, c.de] : [null, null]
      if (!lado || !otro) continue
      const pm = mcuPines.get(lado[1])
      if (!pm || pm.tipo === 'alim' || pm.tipo === 'gnd') continue
      if (tabla.some(f => f.instancia === otro[0] && f.pin === otro[1])) continue
      const inst = doc.piezas.find(p => p.id === otro[0])
      if (!inst) continue
      const ayuda = pieza(inst.pieza).pines.find(p => p.nombre === otro[1])?.ayuda ?? ''
      tabla.push({ instancia: otro[0], etiqueta: inst.etiqueta, pin: otro[1], placa: lado[1], uso: ayuda })
    }
  }

  return { cables, tabla, avisos }
}

/** Pin de la placa conectado a (instancia, pin), según la tabla. */
export function pinDePlaca(tabla: FilaPin[], instancia: string, pin: string): string | null {
  return tabla.find(f => f.instancia === instancia && f.pin === pin)?.placa ?? null
}

export { pinCodigo }
