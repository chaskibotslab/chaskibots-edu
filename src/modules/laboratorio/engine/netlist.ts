// Netlist: a partir de los cables del robot calcula qué pin del micro maneja
// cada entrada de cada componente. La simulación no tiene pines "fijos" en el
// código: si en el cableado el sensor va a D4 en vez de D2, basta con cambiar
// la conexión y la simulación lo sigue sola.

import { componente } from '../catalogo'
import type { RobotDef } from '../robots/seguidorLinea'

const key = (inst: string, pin: string) => `${inst}.${pin}`

/** Agrupa los pines unidos por cables (directa o indirectamente) en "nets". */
export function buildNets(robot: RobotDef): Map<string, string> {
  const parent = new Map<string, string>()
  const find = (k: string): string => {
    if (!parent.has(k)) parent.set(k, k)
    const p = parent.get(k)!
    if (p === k) return k
    const r = find(p)
    parent.set(k, r)
    return r
  }
  for (const c of robot.conexiones) {
    const a = find(key(c.de[0], c.de[1]))
    const b = find(key(c.a[0], c.a[1]))
    if (a !== b) parent.set(a, b)
  }
  const net = new Map<string, string>()
  for (const k of Array.from(parent.keys())) net.set(k, find(k))
  return net
}

export interface MotorPlan {
  instancia: string
  lado: 'izq' | 'der'
  en: string | null       // pin del micro conectado a ENx (null = puente/jumper → siempre al máximo)
  inA: string | null
  inB: string | null
  polaridad: 1 | -1       // -1 si los cables del motor están invertidos
  params: { vNominal: number; rpmNoLoad: number; stallTorque: number; deadband: number; tau: number }
}

export interface IrPlan {
  instancia: string
  posicion: [number, number, number]
  pinDigital: string | null
  pinAnalogico: string | null
  umbral: number
  radioMm: number
  alturaMaxMm: number
}

export interface SimPlan {
  motores: MotorPlan[]
  sensoresIr: IrPlan[]
  voltajeBateria: number
  caidaDriver: number
  masaKg: number
  avisos: string[]
}

export function planFromRobot(robot: RobotDef): SimPlan {
  const nets = buildNets(robot)
  const inst = new Map(robot.instancias.map(i => [i.id, i]))
  const avisos: string[] = []

  // Pin del micro que está en la misma net que (instancia, pin), si lo hay.
  const mcuPin = (i: string, pin: string): string | null => {
    const n = nets.get(key(i, pin))
    if (!n) return null
    for (const p of componente(inst.get(robot.mcu)!.tipo).pines) {
      if (p.tipo === 'alim') continue
      if (nets.get(key(robot.mcu, p.nombre)) === n) return p.nombre
    }
    return null
  }
  const sameNet = (a: [string, string], b: [string, string]) => {
    const na = nets.get(key(...a))
    return !!na && na === nets.get(key(...b))
  }

  let voltajeBateria = 0
  let caidaDriver = 2
  const motores: MotorPlan[] = []
  const sensoresIr: IrPlan[] = []

  for (const i of robot.instancias) {
    const def = componente(i.tipo)
    const comp = def.comportamiento
    if (comp.tipo === 'bateria') voltajeBateria = Number(comp.voltaje)
    if (comp.tipo === 'l298n') {
      caidaDriver = Number(comp.caida_v ?? 2)
      const canales = comp.canales as { en: string; in_a: string; in_b: string; out_a: string; out_b: string }[]
      for (const canal of canales) {
        // Buscar qué motor cuelga de las salidas de este canal.
        for (const m of robot.instancias) {
          const md = componente(m.tipo)
          if (md.comportamiento.tipo !== 'motor-dc') continue
          let polaridad: 1 | -1 | 0 = 0
          if (sameNet([i.id, canal.out_a], [m.id, 'M+']) && sameNet([i.id, canal.out_b], [m.id, 'M-'])) polaridad = 1
          else if (sameNet([i.id, canal.out_a], [m.id, 'M-']) && sameNet([i.id, canal.out_b], [m.id, 'M+'])) polaridad = -1
          if (!polaridad) continue
          const c = md.comportamiento
          const en = mcuPin(i.id, canal.en)
          const inA = mcuPin(i.id, canal.in_a)
          const inB = mcuPin(i.id, canal.in_b)
          if (!inA || !inB) avisos.push(`${m.id}: ${canal.in_a}/${canal.in_b} del driver no están conectados al Arduino`)
          motores.push({
            instancia: m.id,
            lado: m.posicion[2] < 0 ? 'izq' : 'der',
            en, inA, inB, polaridad,
            params: {
              vNominal: Number(c.v_nominal), rpmNoLoad: Number(c.rpm_sin_carga),
              stallTorque: Number(c.torque_bloqueo_nm), deadband: Number(c.zona_muerta_v), tau: Number(c.tau_s),
            },
          })
        }
      }
    }
    if (comp.tipo === 'ir-reflectivo') {
      const pinDigital = mcuPin(i.id, 'DO')
      const pinAnalogico = mcuPin(i.id, 'AO')
      if (!pinDigital && !pinAnalogico) avisos.push(`${i.id}: el sensor no está conectado a ningún pin del Arduino`)
      sensoresIr.push({
        instancia: i.id, posicion: i.posicion, pinDigital, pinAnalogico,
        umbral: Number(comp.umbral ?? 0.5), radioMm: Number(comp.radio_lectura_mm ?? 3),
        alturaMaxMm: Number(comp.altura_max_mm ?? 25),
      })
    }
  }

  const masaKg = robot.instancias.reduce((s, i) => s + componente(i.tipo).masa_g, 0) / 1000
  if (!voltajeBateria) avisos.push('El robot no tiene batería: los motores no van a girar')
  return { motores, sensoresIr, voltajeBateria, caidaDriver, masaKg, avisos }
}
