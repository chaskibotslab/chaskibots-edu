// Núcleo síncrono de un paso de simulación (F2), sin workers ni navegador.
// Lo usan la simulación del navegador y los tests de lazo cerrado, así ambos
// ejecutan exactamente la misma lógica:
//   1. leerSensores: rayos desde cada sensor → niveles/voltajes/distancias.
//   2. (el micro corre con esas entradas)
//   3. aplicarPines: pines del micro → driver → voltaje de cada motor; pulsos → servos.
//   4. (la física avanza el mismo tiempo)

import type { RobotDoc } from '../robots/doc'
import type { PinReport } from './avrRunner'
import { resolverCircuito, type ControlesCircuito, type EstadoCircuito, type PlanCircuito } from './circuito'
import { irAnalogVolts, irDigital, l298nChannel, servoPulseToAngle, voltsToAdc } from './bridge'
import { aRobot, poses } from './ensamblaje'
import type { RobotFisico } from './fisica/robotFisico'
import { rotar } from './fisica/vec'
import type { UltrasonidoPines } from './hcsr04'
import type { SimPlan } from './plan'

/** Reflectancia del piso (0 negro – 1 blanco) alrededor de (x, z). */
export type FuncionReflectancia = (x: number, z: number, radioM: number) => number

export type LecturaSensor =
  | { tipo: 'linea'; instancia: string; reflectancia: number; digital: boolean | null; adc: number | null; pinDigital: string | null; pinAnalogico: string | null }
  | { tipo: 'ultrasonido'; instancia: string; cm: number | null }
  | { tipo: 'obstaculo'; instancia: string; detecta: boolean; pin: string | null }

export interface Entradas {
  digital: Record<string, boolean>
  /** Entradas del circuito que dependen del pull-up: [sin, con] (ver AvrRunner.setDigitalInputDoble). */
  dobles: Record<string, [boolean, boolean]>
  analog: Record<string, number>
  ultrasonidos: UltrasonidoPines[]
  lecturas: LecturaSensor[]
  /** Estado del circuito de la protoboard (LED, pulsadores…), si hay. */
  circuito: EstadoCircuito | null
}

/** Lo que hace falta para resolver el circuito: su plan, los pines del último paso y lo que toca el alumno. */
export interface EntornoCircuito {
  plan: PlanCircuito
  pines: Record<string, PinReport> | null
  controles: ControlesCircuito
  /** LED quemados en esta corrida (se agregan los que se queman ahora). */
  quemados: Set<string>
}

/** Origen y dirección (mundo) de un sensor, desde un punto y un eje de su marco. */
function rayoDesde(ps: ReturnType<typeof poses>, fisica: RobotFisico, instancia: string, origen: [number, number, number], eje: { x: number; y: number; z: number }) {
  const pose = ps.get(instancia)!
  const o = fisica.puntoMundo(aRobot(pose, origen))
  const d = fisica.direccionMundo(rotar(pose.rot, eje))
  return { o, d }
}

/** Hacia dónde mira el primer sensor ultrasónico (mundo): ahí se pone la mano de la mesa de electrónica. */
export function rayoUltrasonido(plan: SimPlan, doc: RobotDoc, fisica: RobotFisico) {
  const s = plan.ultrasonidos[0]
  return s ? rayoDesde(poses(doc, fisica.angulosServo()), fisica, s.instancia, s.origen, { x: 1, y: 0, z: 0 }) : null
}

/**
 * `mano`: distancia (cm) de la mano que el alumno pone delante del primer
 * sensor ultrasónico (mesa de electrónica). Siempre está en el eje del
 * sensor, así que el eco vuelve de ella si está más cerca que lo demás.
 */
export function leerSensores(plan: SimPlan, doc: RobotDoc, fisica: RobotFisico, reflectancia: FuncionReflectancia, circuito?: EntornoCircuito | null, mano: number | null = null): Entradas {
  const digital: Record<string, boolean> = {}
  const analog: Record<string, number> = {}
  const ultrasonidos: UltrasonidoPines[] = []
  const lecturas: LecturaSensor[] = []
  const ps = poses(doc, fisica.angulosServo())
  const rayoDe = (instancia: string, origen: [number, number, number], eje: { x: number; y: number; z: number }) => rayoDesde(ps, fisica, instancia, origen, eje)

  for (const s of plan.lineas) {
    const { o, d } = rayoDe(s.instancia, [0, 0, 0], { x: 0, y: -1, z: 0 })
    const t = fisica.rayo(o, d, s.alturaMaxMm / 1000)
    // Sin piso a la vista (robot levantado): no vuelve luz, como si fuera negro.
    const refl = t === null ? 0 : reflectancia(o.x + d.x * t, o.z + d.z * t, s.radioMm / 1000)
    const dig = irDigital(refl, s.umbral)
    const volts = irAnalogVolts(refl)
    if (s.pinDigital) digital[s.pinDigital] = dig
    if (s.pinAnalogico) analog[s.pinAnalogico] = volts
    lecturas.push({
      tipo: 'linea', instancia: s.instancia, reflectancia: refl,
      digital: s.pinDigital ? dig : null, adc: s.pinAnalogico ? voltsToAdc(volts) : null,
      pinDigital: s.pinDigital, pinAnalogico: s.pinAnalogico,
    })
  }

  plan.ultrasonidos.forEach((s, n) => {
    // Cono de 5 rayos en el plano horizontal del sensor; vale el eco más cercano.
    let min: number | null = null
    for (let i = -2; i <= 2; i++) {
      const a = ((i / 4) * s.aperturaGrados * Math.PI) / 180
      const { o, d } = rayoDe(s.instancia, s.origen, { x: Math.cos(a), y: 0, z: -Math.sin(a) })
      const t = fisica.rayo(o, d, s.alcanceCm / 100)
      if (t !== null && (min === null || t < min)) min = t
    }
    if (n === 0 && mano !== null && mano <= s.alcanceCm && (min === null || mano / 100 < min)) min = mano / 100
    const cm = min === null ? null : min * 100
    if (s.trig && s.echo) ultrasonidos.push({ trig: s.trig, echo: s.echo, cm })
    lecturas.push({ tipo: 'ultrasonido', instancia: s.instancia, cm })
  })

  for (const s of plan.obstaculos) {
    const { o, d } = rayoDe(s.instancia, s.origen, { x: 1, y: 0, z: 0 })
    const detecta = fisica.rayo(o, d, s.alcanceMm / 1000) !== null
    if (s.out) digital[s.out] = !detecta // LOW = hay obstáculo
    lecturas.push({ tipo: 'obstaculo', instancia: s.instancia, detecta, pin: s.out })
  }

  // Circuito: sus entradas se resuelven con los pines del paso anterior (un paso = pocos ms).
  let estado: EstadoCircuito | null = null
  if (circuito) {
    estado = resolverCircuito(circuito.plan, circuito.pines, circuito.controles, circuito.quemados)
    for (const q of estado.quemados) circuito.quemados.add(q)
    Object.assign(analog, estado.analog)
  }

  return { digital, dobles: estado?.entradas ?? {}, analog, ultrasonidos, lecturas, circuito: estado }
}


/** Pines del micro → driver → voltaje de cada motor; pulsos → ángulo pedido a cada servo. */
export function aplicarPines(plan: SimPlan, fisica: RobotFisico, pines: Record<string, PinReport> | null) {
  const duty = (pin: string | null) => {
    if (!pin || !pines) return 0
    const p = pines[pin]
    return p && p.mode === 'output' ? p.duty : 0
  }
  const volts = new Map<string, number>()
  for (const m of plan.motores) {
    if (!pines || !m.polaridad) { volts.set(m.instancia, 0); continue }
    // ENx sin conectar = puente puesto en la placa → velocidad máxima.
    const en = m.en ? duty(m.en) : 1
    volts.set(m.instancia, l298nChannel(duty(m.inA), duty(m.inB), en, plan.voltajeBateria, plan.caidaDriver) * m.polaridad)
  }
  for (const r of fisica.ruedas) r.volts = volts.get(r.motor) ?? 0

  for (const s of plan.servos) {
    const f = fisica.servos.get(s.instancia)
    if (!f || !s.sig || !pines) continue
    const p = pines[s.sig]
    if (p && p.mode === 'output' && p.pulsoUs > 300 && p.pulsoUs < 3000) f.objetivo = servoPulseToAngle(p.pulsoUs / 1000)
  }
}
