// Núcleo síncrono de un paso de simulación (sin workers ni navegador).
// Lo usan la simulación del navegador (simulation.ts) y los tests de lazo
// cerrado, así ambos ejecutan exactamente la misma lógica.

import type { PinReport } from './avrRunner'
import { irAnalogVolts, irDigital, l298nChannel, voltsToAdc, type MotorParams } from './bridge'
import type { SimPlan } from './netlist'
import type { RobotFisico } from './physics'

export type FuncionReflectancia = (x: number, z: number, radioM: number) => number

export interface LecturaSensor {
  instancia: string
  reflectancia: number
  digital: boolean | null
  adc: number | null
  pinDigital: string | null
  pinAnalogico: string | null
}

export interface Entradas {
  digital: Record<string, boolean>
  analog: Record<string, number>
  lecturas: LecturaSensor[]
}

/** Paso 1: sensores → entradas del micro. */
export function leerSensores(plan: SimPlan, fisica: RobotFisico, reflectancia: FuncionReflectancia): Entradas {
  const digital: Record<string, boolean> = {}
  const analog: Record<string, number> = {}
  const lecturas = plan.sensoresIr.map(s => {
    const hit = fisica.rayoAlPiso(s.posicion, s.alturaMaxMm / 1000)
    // Sin piso a la vista (robot levantado): no vuelve luz, como si fuera negro.
    const refl = hit ? reflectancia(hit.x, hit.z, s.radioMm / 1000) : 0
    const dig = irDigital(refl, s.umbral)
    const volts = irAnalogVolts(refl)
    if (s.pinDigital) digital[s.pinDigital] = dig
    if (s.pinAnalogico) analog[s.pinAnalogico] = volts
    return {
      instancia: s.instancia, reflectancia: refl,
      digital: s.pinDigital ? dig : null, adc: s.pinAnalogico ? voltsToAdc(volts) : null,
      pinDigital: s.pinDigital, pinAnalogico: s.pinAnalogico,
    }
  })
  return { digital, analog, lecturas }
}

/** Pasos 3 y 4: pines del micro → L298N → voltaje de cada motor → física. */
export function aplicarPines(plan: SimPlan, fisica: RobotFisico, pines: Record<string, PinReport> | null, dt: number) {
  const duty = (pin: string | null) => {
    if (!pin || !pines) return 0
    const p = pines[pin]
    return p && p.mode === 'output' ? p.duty : 0
  }
  const volts = { izq: 0, der: 0 }
  const params: { izq?: MotorParams; der?: MotorParams } = {}
  for (const m of plan.motores) {
    // ENA sin conectar = puente puesto en la placa → velocidad máxima.
    const en = m.en ? duty(m.en) : 1
    volts[m.lado] = pines
      ? l298nChannel(duty(m.inA), duty(m.inB), en, plan.voltajeBateria, plan.caidaDriver) * m.polaridad
      : 0
    params[m.lado] = m.params
  }
  const fallback = plan.motores[0]?.params
  fisica.paso(dt, volts, { izq: params.izq ?? fallback!, der: params.der ?? fallback! })
}
