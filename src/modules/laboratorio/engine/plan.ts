// Plan de simulación (F2): a partir de las piezas y los cables calcula qué
// pin de la placa maneja cada motor, servo y sensor. Nada está fijo en el
// código: si un cable cambia de pin, la simulación lo sigue sola. Lo que no
// está conectado (o no tiene alimentación) no funciona, como en la realidad.

import { pieza } from '../catalogo/piezas'
import type { V3 } from '../catalogo/tipos'
import type { RobotDoc } from '../robots/doc'
import type { MotorParams } from './bridge'
import { poses, resumen, ruedas, type RuedaGeo } from './ensamblaje'
import { infoPlaca, mcuDe } from './placa'

const k = (inst: string, pin: string) => `${inst}.${pin}`

/** Agrupa los pines unidos por cables (directa o indirectamente) en "nets".
 *  También une los pines que una pieza conecta por dentro con su padre (la
 *  fuente pinchada en los rieles de la protoboard). */
export function nets(doc: RobotDoc): Map<string, string> {
  const parent = new Map<string, string>()
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x)
    const p = parent.get(x)!
    if (p === x) return x
    const r = find(p)
    parent.set(x, r)
    return r
  }
  const unir = (x: string, y: string) => {
    const a = find(x), b = find(y)
    if (a !== b) parent.set(a, b)
  }
  for (const c of doc.cables) unir(k(...c.de), k(...c.a))
  for (const p of doc.piezas) {
    if (!p.padre) continue
    for (const [propio, delPadre] of pieza(p.pieza).unePinesConPadre ?? []) unir(k(p.id, propio), k(p.padre.instancia, delPadre))
  }
  const out = new Map<string, string>()
  for (const x of Array.from(parent.keys())) out.set(x, find(x))
  return out
}

export interface MotorPlan {
  instancia: string
  etiqueta: string
  en: string | null       // pin de la placa en ENx (null = puente puesto → siempre al máximo)
  inA: string | null
  inB: string | null
  polaridad: 1 | -1 | 0   // 0 = el motor no está conectado al driver
  params: MotorParams
  rueda: RuedaGeo | null
  driver: string | null
}

export interface LineaPlan { instancia: string; pinDigital: string | null; pinAnalogico: string | null; umbral: number; radioMm: number; alturaMaxMm: number }
export interface UltrasonidoPlan { instancia: string; trig: string | null; echo: string | null; alcanceCm: number; aperturaGrados: number; origen: V3 }
export interface ObstaculoPlan { instancia: string; out: string | null; alcanceMm: number; origen: V3 }
export interface ServoPlan { instancia: string; sig: string | null; gradosPorSeg: number; alimentado: boolean }

export interface SimPlan {
  mcu: string | null
  motores: MotorPlan[]
  lineas: LineaPlan[]
  ultrasonidos: UltrasonidoPlan[]
  obstaculos: ObstaculoPlan[]
  servos: ServoPlan[]
  voltajeBateria: number
  caidaDriver: number
  masaKg: number
  avisos: string[]
}

export function planDe(doc: RobotDoc): SimPlan {
  const n = nets(doc)
  const avisos: string[] = []
  const mcu = mcuDe(doc)
  const info = infoPlaca(doc)
  const mcuPines = mcu ? pieza(mcu.pieza).pines : []

  const net = (inst: string, pin: string) => n.get(k(inst, pin)) ?? null
  const mismo = (a: [string, string], b: [string, string]) => { const x = net(...a); return !!x && x === net(...b) }

  /** Pin de señal de la placa en la misma net que (inst, pin). */
  const pinPlaca = (inst: string, pin: string): string | null => {
    const x = net(inst, pin)
    if (!x || !mcu) return null
    for (const p of mcuPines) {
      if (p.tipo === 'alim' || p.tipo === 'gnd') continue
      if (net(mcu.id, p.nombre) === x) return p.nombre
    }
    return null
  }

  // Una pieza está alimentada si su VCC llega a un 5 V (placa o driver) y su GND a tierra.
  const fuentes5v: [string, string][] = []
  const tierras: [string, string][] = []
  for (const p of doc.piezas) {
    const c = pieza(p.pieza).comportamiento
    if (c.tipo === 'mcu') { for (const f of Object.keys(info.fuentes)) fuentes5v.push([p.id, f]); tierras.push([p.id, 'GND']) }
    if (c.tipo === 'puente-h') {
      if (c.alim.salida5v) fuentes5v.push([p.id, c.alim.salida5v])
      tierras.push([p.id, c.alim.gnd])
    }
    if (c.tipo === 'bateria') tierras.push([p.id, '-'])
  }
  const alimentado = (inst: string, vcc: string, gnd: string) =>
    fuentes5v.some(f => mismo([inst, vcc], f)) && tierras.some(t => mismo([inst, gnd], t))

  // Batería: llega a la entrada de motores del driver o a la placa (VIN).
  let voltajeBateria = 0
  for (const p of doc.piezas) {
    const c = pieza(p.pieza).comportamiento
    if (c.tipo !== 'bateria') continue
    const conectada = doc.piezas.some(d => {
      const t = pieza(d.pieza).comportamiento
      return (t.tipo === 'puente-h' && mismo([p.id, '+'], [d.id, t.alim.motor])) || (t.tipo === 'mcu' && mismo([p.id, '+'], [d.id, 'VIN']))
    })
    if (conectada) voltajeBateria = Math.max(voltajeBateria, c.voltaje)
    // En la mesa de electrónica la pila (o la fuente) alimenta el circuito directamente,
    // también a través de los rieles: cuenta si su + llega a alguna otra pieza.
    else {
      const red = n.get(k(p.id, '+'))
      const raiz = doc.piezas.find(d => !d.padre)?.id
      const usa = !!red && Array.from(n.entries()).some(([x, r]) => r === red && ![p.id, raiz].includes(x.slice(0, x.indexOf('.'))))
      if (!usa) avisos.push(`${p.etiqueta}: no está conectada`)
    }
  }

  const rs = ruedas(doc, poses(doc))
  const motores: MotorPlan[] = []
  let caidaDriver = 2
  const motoresConDriver = new Set<string>()
  for (const d of doc.piezas) {
    const c = pieza(d.pieza).comportamiento
    if (c.tipo !== 'puente-h') continue
    caidaDriver = c.caida_v
    // TB6612: sin 5 V en la lógica (VCC) o con STBY en LOW, el driver no mueve nada.
    const conCinco = (pin: string) => fuentes5v.some(f => mismo([d.id, pin], f))
    const apagado =
      (c.alim.vcc && !conCinco(c.alim.vcc) ? `${d.etiqueta}: le falta alimentar la lógica (${c.alim.vcc} a 5V)` : null) ??
      (c.alim.standby && !conCinco(c.alim.standby) ? `${d.etiqueta}: ${c.alim.standby} debe ir a 5V; si no, el driver queda apagado` : null)
    if (apagado) avisos.push(apagado)
    for (const canal of c.canales) {
      for (const m of doc.piezas) {
        const mc = pieza(m.pieza).comportamiento
        if (mc.tipo !== 'motor-dc') continue
        let polaridad: 1 | -1 | 0 = 0
        if (mismo([d.id, canal.out_a], [m.id, 'M+']) && mismo([d.id, canal.out_b], [m.id, 'M-'])) polaridad = 1
        else if (mismo([d.id, canal.out_a], [m.id, 'M-']) && mismo([d.id, canal.out_b], [m.id, 'M+'])) polaridad = -1
        if (!polaridad) continue
        motoresConDriver.add(m.id)
        const inA = pinPlaca(d.id, canal.in_a), inB = pinPlaca(d.id, canal.in_b)
        if (!inA || !inB) avisos.push(`${m.etiqueta}: ${canal.in_a}/${canal.in_b} del driver no están conectados a la placa`)
        motores.push({
          instancia: m.id, etiqueta: m.etiqueta, driver: d.id,
          en: pinPlaca(d.id, canal.en), inA, inB, polaridad: apagado ? 0 : polaridad,
          params: { vNominal: mc.v_nominal, rpmNoLoad: mc.rpm_sin_carga, stallTorque: mc.torque_bloqueo_nm, deadband: mc.zona_muerta_v, tau: mc.tau_s },
          rueda: rs.find(r => r.motor === m.id) ?? null,
        })
      }
    }
  }
  // Motores sin driver: quedan quietos (la rueda igual toca el piso y frena).
  for (const m of doc.piezas) {
    const mc = pieza(m.pieza).comportamiento
    if (mc.tipo !== 'motor-dc' || motoresConDriver.has(m.id)) continue
    avisos.push(`${m.etiqueta}: no está conectado a un driver`)
    motores.push({
      instancia: m.id, etiqueta: m.etiqueta, driver: null, en: null, inA: null, inB: null, polaridad: 0,
      params: { vNominal: mc.v_nominal, rpmNoLoad: mc.rpm_sin_carga, stallTorque: mc.torque_bloqueo_nm, deadband: mc.zona_muerta_v, tau: mc.tau_s },
      rueda: rs.find(r => r.motor === m.id) ?? null,
    })
  }

  const lineas: LineaPlan[] = []
  const ultrasonidos: UltrasonidoPlan[] = []
  const obstaculos: ObstaculoPlan[] = []
  const servos: ServoPlan[] = []
  for (const p of doc.piezas) {
    const c = pieza(p.pieza).comportamiento
    if (c.tipo === 'ir-reflectivo') {
      const ok = alimentado(p.id, 'VCC', 'GND')
      if (!ok) avisos.push(`${p.etiqueta}: no tiene alimentación (VCC y GND)`)
      const pinDigital = ok ? pinPlaca(p.id, 'DO') : null
      const pinAnalogico = ok ? pinPlaca(p.id, 'AO') : null
      if (ok && !pinDigital && !pinAnalogico) avisos.push(`${p.etiqueta}: no está conectado a ningún pin de la placa`)
      lineas.push({ instancia: p.id, pinDigital, pinAnalogico, umbral: c.umbral, radioMm: c.radio_lectura_mm, alturaMaxMm: c.altura_max_mm })
    } else if (c.tipo === 'ultrasonido') {
      const ok = alimentado(p.id, 'VCC', 'GND')
      if (!ok) avisos.push(`${p.etiqueta}: no tiene alimentación (VCC y GND)`)
      ultrasonidos.push({
        instancia: p.id, trig: ok ? pinPlaca(p.id, 'TRIG') : null, echo: ok ? pinPlaca(p.id, 'ECHO') : null,
        alcanceCm: c.alcance_max_cm, aperturaGrados: c.apertura_grados, origen: c.origen,
      })
    } else if (c.tipo === 'ir-obstaculo') {
      const ok = alimentado(p.id, 'VCC', 'GND')
      if (!ok) avisos.push(`${p.etiqueta}: no tiene alimentación (VCC y GND)`)
      obstaculos.push({ instancia: p.id, out: ok ? pinPlaca(p.id, 'OUT') : null, alcanceMm: c.alcance_mm, origen: c.origen })
    } else if (c.tipo === 'servo') {
      const ok = alimentado(p.id, 'V+', 'GND')
      if (!ok) avisos.push(`${p.etiqueta}: no tiene alimentación (V+ y GND)`)
      servos.push({ instancia: p.id, sig: pinPlaca(p.id, 'SIG'), gradosPorSeg: 60 / c.seg_por_60, alimentado: ok })
    }
  }

  return {
    mcu: mcu?.id ?? null, motores, lineas, ultrasonidos, obstaculos, servos,
    voltajeBateria, caidaDriver, masaKg: resumen(doc).masa_g / 1000, avisos,
  }
}
