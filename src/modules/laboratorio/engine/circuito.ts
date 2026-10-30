// Circuito de la mesa de electrónica (E1): resuelve los voltajes y corrientes
// de LEDs, resistencias, pulsadores, buzzers, potenciómetros y LDR con
// análisis nodal (el mismo método que usan los simuladores de circuitos, en
// versión pequeña). Así se comporta como en la protoboard real:
//   · un LED sin resistencia se quema; con 10 kΩ apenas brilla;
//   · un LED al revés no enciende;
//   · un pulsador con INPUT_PULLUP se lee LOW al presionarlo, y una entrada
//     sin pull-up que no está unida a nada queda «al aire» (se lee LOW);
//   · el potenciómetro y la LDR forman divisores de voltaje que lee analogRead.
//
// Cómo se resuelve:
//   1. Cada «net» (pines unidos por cables) es un nodo. Todas las tierras son
//      el nodo 0. Las salidas de 5 V / 3,3 V de la placa son fuentes de voltaje.
//   2. Cada pin de la placa en modo salida es una fuente de 0 V o 5 V con 25 Ω
//      de resistencia interna; con INPUT_PULLUP, una resistencia de 35 kΩ a 5 V.
//   3. Las fuentes se convierten en su equivalente de Norton (conductancia +
//      corriente) y se resuelve G · V = I por eliminación de Gauss.
//   4. Los LED son diodos: apagados no conducen; encendidos son una caída fija
//      (Vf) más 10 Ω. Se prueba, se corrige el estado de cada LED y se repite.
// Con PWM (analogWrite, tone) se resuelve con el pin en ALTO y en BAJO y el
// brillo es el promedio según el ciclo de trabajo, como lo ve el ojo.

import { pieza } from '../catalogo/piezas'
import type { RobotDoc } from '../robots/doc'
import type { PinReport } from './avrRunner'
import { nets } from './plan'
import { datosPlaca, infoPlaca, mcuDe } from './placa'

/** Resistencia interna de un pin de salida del ATmega328P (Ω). */
const R_PIN = 25
/** Pull-up interno (INPUT_PULLUP), entre 20 y 50 kΩ según la hoja de datos. */
const R_PULLUP = 35_000
/** Resistencia del LED encendido (Ω), además de su caída Vf. */
const R_LED = 10
/** Un LED de 5 mm se quema por encima de unos 30 mA. */
const I_QUEMA = 0.03
/** Corriente con la que un LED se ve a pleno brillo. */
const I_PLENO = 0.008
const R_BOTON = 0.05
const G_FUGA = 1e-9
const G_FUENTE = 1e3
const TONO_ACTIVO = 2300

type Elemento =
  | { t: 'r'; a: number; b: number; ohm: number }
  | { t: 'led'; inst: string; etiqueta: string; canal: number; a: number; k: number; vf: number; pin: string | null }
  | { t: 'boton'; inst: string; a: number; b: number }
  | { t: 'buzzer'; inst: string; a: number; b: number; ohm: number; activo: boolean; pin: string | null }
  | { t: 'pot'; inst: string; a: number; w: number; b: number; ohm: number }
  | { t: 'ldr'; inst: string; a: number; b: number; luz: number; oscuro: number }

export interface PlanCircuito {
  /** Cantidad de nodos (el 0 es tierra). */
  n: number
  vLogica: number
  fuentes: { nodo: number; v: number }[]
  /** Pines de señal de la placa que tocan el circuito. */
  pines: { pin: string; nodo: number }[]
  elementos: Elemento[]
  /** Controles que el alumno maneja en «Probar»: pulsadores y perillas (potenciómetro, luz de la LDR). */
  controles: { inst: string; etiqueta: string; tipo: 'pulsador' | 'potenciometro' | 'ldr' | 'joystick' }[]
}

export interface ControlesCircuito {
  botones: Record<string, boolean>
  /** 0–1: giro del potenciómetro o luz sobre la LDR. */
  perillas: Record<string, number>
  /** Mano delante del (primer) sensor ultrasónico de la mesa: distancia en cm; sin valor = no hay mano. */
  mano?: number | null
}

/** Distancias que se pueden elegir para la mano (cm). */
export const MANO_MIN_CM = 2
export const MANO_MAX_CM = 60

export interface EstadoCircuito {
  /** Brillo 0–1 de cada LED (un valor; tres en el RGB). */
  leds: Record<string, number[]>
  quemados: string[]
  sonidos: { inst: string; freq: number }[]
  /** Entradas que el circuito le da a la placa (con el modo actual de cada pin). */
  digital: Record<string, boolean>
  /** Nivel de cada entrada [sin pull-up, con pull-up]: el micro elige según pinMode en el momento de leer. */
  entradas: Record<string, [boolean, boolean]>
  analog: Record<string, number>
  avisos: string[]
}

export const PERILLA_INICIAL = 0.5
export const LUZ_INICIAL = 0.6

const clave = (inst: string, pin: string) => `${inst}.${pin}`
/** Perilla de un eje del joystick (en `ControlesCircuito.perillas`). */
export const ejeJoystick = (inst: string, eje: 'x' | 'y') => `${inst}:${eje}`

export function planCircuito(doc: RobotDoc): PlanCircuito | null {
  const piezas = doc.piezas.map(p => ({ p, def: pieza(p.pieza) }))
  const conCircuito = piezas.filter(({ def }) => ['led', 'led-rgb', 'resistencia', 'pulsador', 'buzzer', 'potenciometro', 'ldr', 'joystick'].includes(def.comportamiento.tipo))
  if (!conCircuito.length) return null

  const red = nets(doc)
  const info = infoPlaca(doc)
  const mcu = mcuDe(doc)
  const indice = new Map<string, number>()
  let n = 1
  const tierras = new Set<string>()
  for (const { p, def } of piezas) for (const pin of def.pines) if (pin.tipo === 'gnd') tierras.add(red.get(clave(p.id, pin.nombre)) ?? clave(p.id, pin.nombre))
  /** Nodo de un pin: su net (o él solo si no tiene cables). */
  const nodo = (inst: string, pin: string) => {
    const k = red.get(clave(inst, pin)) ?? clave(inst, pin)
    if (tierras.has(k)) return 0
    if (!indice.has(k)) indice.set(k, n++)
    return indice.get(k)!
  }

  const elementos: Elemento[] = []
  const controles: PlanCircuito['controles'] = []
  for (const { p, def } of conCircuito) {
    const c = def.comportamiento
    if (c.tipo === 'resistencia') elementos.push({ t: 'r', a: nodo(p.id, '1'), b: nodo(p.id, '2'), ohm: c.ohm })
    else if (c.tipo === 'led') elementos.push({ t: 'led', inst: p.id, etiqueta: p.etiqueta, canal: 0, a: nodo(p.id, 'A'), k: nodo(p.id, 'K'), vf: c.vf, pin: null })
    else if (c.tipo === 'led-rgb') {
      ;(['R', 'G', 'B'] as const).forEach((pin, canal) => elementos.push({ t: 'led', inst: p.id, etiqueta: p.etiqueta, canal, a: nodo(p.id, pin), k: nodo(p.id, 'K'), vf: c.vf[canal], pin: null }))
    } else if (c.tipo === 'pulsador') {
      elementos.push({ t: 'boton', inst: p.id, a: nodo(p.id, '1'), b: nodo(p.id, '2') })
      controles.push({ inst: p.id, etiqueta: p.etiqueta, tipo: 'pulsador' })
    } else if (c.tipo === 'buzzer') elementos.push({ t: 'buzzer', inst: p.id, a: nodo(p.id, '+'), b: nodo(p.id, '-'), ohm: c.ohm, activo: c.activo, pin: null })
    else if (c.tipo === 'potenciometro') {
      elementos.push({ t: 'pot', inst: p.id, a: nodo(p.id, '1'), w: nodo(p.id, 'W'), b: nodo(p.id, '2'), ohm: c.ohm })
      controles.push({ inst: p.id, etiqueta: p.etiqueta, tipo: 'potenciometro' })
    } else if (c.tipo === 'ldr') {
      elementos.push({ t: 'ldr', inst: p.id, a: nodo(p.id, '1'), b: nodo(p.id, '2'), luz: c.ohmLuz, oscuro: c.ohmOscuro })
      controles.push({ inst: p.id, etiqueta: p.etiqueta, tipo: 'ldr' })
    } else if (c.tipo === 'joystick') {
      // Cada eje es una perilla «inst:x» / «inst:y» (0,5 = palanca al centro).
      for (const eje of ['x', 'y'] as const) {
        elementos.push({ t: 'pot', inst: ejeJoystick(p.id, eje), a: nodo(p.id, '+5V'), w: nodo(p.id, eje === 'x' ? 'VRx' : 'VRy'), b: nodo(p.id, 'GND'), ohm: c.ohm })
      }
      elementos.push({ t: 'boton', inst: p.id, a: nodo(p.id, 'SW'), b: nodo(p.id, 'GND') })
      controles.push({ inst: p.id, etiqueta: p.etiqueta, tipo: 'joystick' })
    }
  }

  // Nodos que usa el circuito: solo esos pines y fuentes de la placa entran en el cálculo.
  const usados = new Set<number>()
  for (const e of elementos) for (const x of [('a' in e ? e.a : 0), ('b' in e ? e.b : 0), ('k' in e ? e.k : 0), ('w' in e ? e.w : 0)]) usados.add(x)
  const fuentes: PlanCircuito['fuentes'] = []
  const pines: PlanCircuito['pines'] = []
  for (const { p, def } of piezas) {
    const c = def.comportamiento
    for (const pin of def.pines) {
      const k = red.get(clave(p.id, pin.nombre))
      if (!k || tierras.has(k) || !indice.has(k) || !usados.has(indice.get(k)!)) continue
      const nd = indice.get(k)!
      if (c.tipo === 'mcu') {
        const v = datosPlaca(c.placa).fuentes[pin.nombre]
        if (v !== undefined) fuentes.push({ nodo: nd, v })
        else if (pin.tipo !== 'alim' && p.id === mcu?.id) pines.push({ pin: pin.nombre, nodo: nd })
      } else if (c.tipo === 'bateria' && pin.nombre === '+') fuentes.push({ nodo: nd, v: c.voltaje })
    }
  }

  // Pin de la placa que maneja cada LED o buzzer: en su nodo o a una resistencia de distancia.
  const vecinos = (x: number) => [x, ...elementos.flatMap(e => (e.t === 'r' ? (e.a === x ? [e.b] : e.b === x ? [e.a] : []) : []))]
  const pinDe = (nodos: number[]) => {
    for (const x of nodos) for (const v of vecinos(x)) { const pp = pines.find(q => q.nodo === v); if (pp) return pp.pin }
    return null
  }
  for (const e of elementos) {
    if (e.t === 'led') e.pin = pinDe([e.a, e.k])
    else if (e.t === 'buzzer') e.pin = pinDe([e.a, e.b])
  }

  return { n, vLogica: info.vLogica, fuentes, pines, elementos, controles }
}

/** Resuelve G · V = I (eliminación de Gauss con pivoteo). Devuelve V con V[0] = 0. */
function resolver(n: number, G: Float64Array, I: Float64Array): Float64Array {
  const m = n - 1
  const A = new Float64Array(m * (m + 1))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) A[i * (m + 1) + j] = G[(i + 1) * n + (j + 1)]
    A[i * (m + 1) + m] = I[i + 1]
  }
  const w = m + 1
  for (let c = 0; c < m; c++) {
    let piv = c
    for (let r = c + 1; r < m; r++) if (Math.abs(A[r * w + c]) > Math.abs(A[piv * w + c])) piv = r
    if (piv !== c) for (let j = c; j < w; j++) { const t = A[c * w + j]; A[c * w + j] = A[piv * w + j]; A[piv * w + j] = t }
    const d = A[c * w + c]
    if (Math.abs(d) < 1e-15) continue
    for (let r = c + 1; r < m; r++) {
      const f = A[r * w + c] / d
      if (!f) continue
      for (let j = c; j < w; j++) A[r * w + j] -= f * A[c * w + j]
    }
  }
  const V = new Float64Array(n)
  for (let i = m - 1; i >= 0; i--) {
    let s = A[i * w + m]
    for (let j = i + 1; j < m; j++) s -= A[i * w + j] * V[j + 1]
    const d = A[i * w + i]
    V[i + 1] = Math.abs(d) < 1e-15 ? 0 : s / d
  }
  return V
}

/** Nivel de cada pin de salida para una de las tres resoluciones. */
type Nivel = (p: PinReport) => 0 | 1

export function resolverCircuito(
  plan: PlanCircuito,
  pines: Record<string, PinReport> | null,
  controles: ControlesCircuito,
  quemados: Set<string>,
): EstadoCircuito {
  const { n, vLogica } = plan
  const ohmPerilla = (e: Extract<Elemento, { t: 'pot' | 'ldr' }>) => {
    const x = controles.perillas[e.inst] ?? (e.t === 'pot' ? PERILLA_INICIAL : LUZ_INICIAL)
    return Math.min(1, Math.max(0, x))
  }

  const calcular = (nivel: Nivel, pullups: 'segun-modo' | 'todos' | 'ninguno' = 'segun-modo') => {
    const G = new Float64Array(n * n)
    const I = new Float64Array(n)
    const cond = (a: number, b: number, g: number) => {
      G[a * n + a] += g; G[b * n + b] += g; G[a * n + b] -= g; G[b * n + a] -= g
    }
    const fuente = (a: number, v: number, g: number) => { G[a * n + a] += g; I[a] += g * v }
    for (let i = 1; i < n; i++) G[i * n + i] += G_FUGA
    for (const f of plan.fuentes) fuente(f.nodo, f.v, G_FUENTE)
    for (const p of plan.pines) {
      // Sin informe todavía (antes del primer paso) el pin es una entrada, como al encender.
      const r = pines?.[p.pin]
      if (r?.mode === 'output') fuente(p.nodo, nivel(r) * vLogica, 1 / R_PIN)
      else if (pullups === 'todos' || (pullups === 'segun-modo' && r?.mode === 'input_pullup')) fuente(p.nodo, vLogica, 1 / R_PULLUP)
    }
    const fijos: [number, number, number][] = []
    for (const e of plan.elementos) {
      if (e.t === 'r') fijos.push([e.a, e.b, 1 / e.ohm])
      else if (e.t === 'boton' && controles.botones[e.inst]) fijos.push([e.a, e.b, 1 / R_BOTON])
      else if (e.t === 'buzzer') fijos.push([e.a, e.b, 1 / e.ohm])
      else if (e.t === 'pot') {
        const x = ohmPerilla(e)
        fijos.push([e.a, e.w, 1 / Math.max(1, e.ohm * (1 - x))], [e.w, e.b, 1 / Math.max(1, e.ohm * x)])
      } else if (e.t === 'ldr') {
        const luz = ohmPerilla(e)
        fijos.push([e.a, e.b, 1 / (e.oscuro ** (1 - luz) * e.luz ** luz)])
      }
    }
    for (const [a, b, g] of fijos) cond(a, b, g)

    // Diodos: probar con todos apagados y corregir hasta que el estado sea coherente.
    const leds = plan.elementos.filter((e): e is Extract<Elemento, { t: 'led' }> => e.t === 'led')
    const prendido = leds.map(() => false)
    let V = resolver(n, G, I)
    for (let it = 0; it < 12; it++) {
      const Gi = G.slice(), Ii = I.slice()
      leds.forEach((e, i) => {
        if (!prendido[i] || quemados.has(e.inst)) return
        const g = 1 / R_LED
        Gi[e.a * n + e.a] += g; Gi[e.k * n + e.k] += g; Gi[e.a * n + e.k] -= g; Gi[e.k * n + e.a] -= g
        Ii[e.a] += g * e.vf; Ii[e.k] -= g * e.vf
      })
      V = resolver(n, Gi, Ii)
      let cambio = false
      leds.forEach((e, i) => {
        const d = V[e.a] - V[e.k]
        const debe = !quemados.has(e.inst) && (prendido[i] ? d - e.vf > -1e-6 : d > e.vf)
        if (debe !== prendido[i]) { prendido[i] = debe; cambio = true }
      })
      if (!cambio) break
    }
    const corriente = leds.map((e, i) => (prendido[i] ? Math.max(0, (V[e.a] - V[e.k] - e.vf) / R_LED) : 0))
    return { V, leds, corriente }
  }

  const salidas = Object.values(pines ?? {}).filter(p => p.mode === 'output')
  const hayPwm = salidas.some(p => p.duty > 0.02 && p.duty < 0.98)
  const ahora = calcular(p => p.level)
  const alto = calcular(p => (p.duty > 0.02 ? 1 : 0))
  const bajo = hayPwm ? calcular(p => (p.duty >= 0.98 ? 1 : 0)) : alto

  const estado: EstadoCircuito = { leds: {}, quemados: [], sonidos: [], digital: {}, entradas: {}, analog: {}, avisos: [] }

  // Entradas de la placa: nivel lógico (con y sin pull-up) y voltaje (analogRead).
  // También antes del primer paso: el programa lee los pines apenas arranca.
  {
    const sin = calcular(p => p.level, 'ninguno')
    const con = calcular(p => p.level, 'todos')
    for (const p of plan.pines) {
      const r = pines?.[p.pin]
      if (r && r.mode === 'output') continue
      const par: [boolean, boolean] = [sin.V[p.nodo] > vLogica / 2, con.V[p.nodo] > vLogica / 2]
      estado.entradas[p.pin] = par
      estado.digital[p.pin] = r?.mode === 'input_pullup' ? par[1] : par[0]
      estado.analog[p.pin] = Math.max(0, Math.min(vLogica, ahora.V[p.nodo]))
    }
  }

  // LED: brillo promedio con PWM; si pasa demasiada corriente, se quema.
  alto.leds.forEach((e, i) => {
    const duty = e.pin ? pines?.[e.pin]?.duty ?? 0 : 0
    const pwm = e.pin && pines?.[e.pin]?.mode === 'output' && duty > 0.02 && duty < 0.98
    const iMax = Math.max(alto.corriente[i], bajo.corriente[i])
    if (iMax > I_QUEMA && !quemados.has(e.inst)) {
      estado.quemados.push(e.inst)
      estado.avisos.push(`${e.etiqueta}: se quemó (le pasaron ${(iMax * 1000).toFixed(0)} mA). Le falta la resistencia en serie.`)
    }
    const brillo = (x: number) => Math.min(1, Math.sqrt(x / I_PLENO))
    const b = quemados.has(e.inst) || estado.quemados.includes(e.inst) ? 0
      : pwm ? duty * brillo(alto.corriente[i]) + (1 - duty) * brillo(bajo.corriente[i]) : brillo(alto.corriente[i])
    const lista = (estado.leds[e.inst] ??= [])
    lista[e.canal] = b
  })

  // Buzzers: el pasivo suena con la frecuencia del pin que lo hace vibrar (tone);
  // el activo, con su tono propio mientras tiene voltaje.
  for (const e of plan.elementos) {
    if (e.t !== 'buzzer') continue
    const r = e.pin ? pines?.[e.pin] : undefined
    const vAlto = Math.abs(alto.V[e.a] - alto.V[e.b])
    const vBajo = Math.abs(bajo.V[e.a] - bajo.V[e.b])
    if (e.activo) {
      const d = r?.mode === 'output' ? r.duty : 1
      if (d * vAlto + (1 - d) * vBajo > 2.5) estado.sonidos.push({ inst: e.inst, freq: TONO_ACTIVO })
    } else if (r && r.mode === 'output' && r.freqHz > 20 && r.duty > 0.05 && r.duty < 0.95 && Math.abs(vAlto - vBajo) > 1) {
      estado.sonidos.push({ inst: e.inst, freq: r.freqHz })
    }
  }

  return estado
}
