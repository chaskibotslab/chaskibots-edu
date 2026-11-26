/**
 * API que usan los bloques compilados del EV3.
 * Cada método controla el robot a través del motor de simulación.
 * El movimiento real lo integra el bucle de física (motor.tick); aquí solo
 * fijamos velocidades de rueda y esperamos a que se cumpla la condición.
 */
import { LegoMotor, MAX_DIST } from './engine'

export function crearApiEV3(motor: LegoMotor, token: number) {
  const vivo = () => motor.vivo(token)
  const pausa = (ms: number) => motor.pausa(token, ms)

  const apagar = () => { motor.vL = motor.vR = 0; motor.sucio = true }
  // Espera hasta que la condición se cumpla (o se agote el tiempo). Se revisa en cada paso de física.
  const hasta = (cond: () => boolean, maxSeg = 20, alFinal?: () => void) => motor.hasta(token, cond, maxSeg, alFinal)
  // Avisa una sola vez si el programa usa un sensor de línea que este robot no tiene.
  let avisado = false
  const sensor = (n: unknown) => {
    const i = Math.round(Number(n) || 1)
    if (!avisado && (i < 1 || i > motor.lineas.length)) {
      avisado = true
      motor.alError(motor.lineas.length
        ? `Este robot solo tiene ${motor.lineas.length} sensor${motor.lineas.length > 1 ? 'es' : ''} de línea: el sensor ${i} no existe y siempre verá blanco.`
        : 'Este robot no tiene sensores de color mirando al piso. Elige otro robot.')
    }
    return i
  }

  // Mueve con velocidades dadas por el modo elegido, luego frena (salvo "inf").
  const correr = async (vI: number, vD: number, modo: string, valor: number) => {
    motor.vL = vI; motor.vR = vD; motor.sucio = true
    if (modo === 'inf') return
    if (modo === 'seg') { await motor.pausa(token, Math.max(0, valor) * 1000, apagar) }
    else {
      const objetivo = modo === 'rot' ? Math.abs(valor) * 360 : Math.abs(valor)
      // cuánto han girado las ruedas desde este momento (sirve igual hacia adelante que hacia atrás)
      const l0 = motor.gradosL, r0 = motor.gradosR
      await hasta(() => (Math.abs(motor.gradosL - l0) + Math.abs(motor.gradosR - r0)) / 2 >= objetivo, 20, apagar)
    }
    apagar()
  }

  return {
    // movimiento tipo "tanque" (cada lado con su potencia)
    tanque: async (potI: unknown, potD: unknown, modo: string, valor: unknown) =>
      correr(motor.velDe(Number(potI) || 0), motor.velDe(Number(potD) || 0), modo, Number(valor) || 0),
    avanzar: async (pot: unknown, modo: string, valor: unknown) => {
      const v = motor.velDe(Number(pot) || 0)
      await correr(v, v, modo, Number(valor) || 0)
    },
    retroceder: async (pot: unknown, modo: string, valor: unknown) => {
      const v = -motor.velDe(Number(pot) || 0)
      await correr(v, v, modo, Number(valor) || 0)
    },
    // girar en el sitio los grados indicados (+ derecha, - izquierda)
    girar: async (grados: unknown) => {
      const g = Number(grados) || 0
      const s = motor.velDe(40) * (g >= 0 ? 1 : -1)
      const a0 = motor.ang
      motor.vL = s; motor.vR = -s; motor.sucio = true
      // medio paso de margen: así el giro termina lo más cerca posible del ángulo pedido
      const objetivo = Math.abs(g) * Math.PI / 180 - Math.abs(s) / motor.distRuedas / 60
      await hasta(() => Math.abs(motor.ang - a0) >= objetivo, 20, apagar)
    },
    parar: () => { motor.vL = motor.vR = 0; motor.sucio = true },
    // enciende los motores y sigue con el programa (no espera)
    encender: (potI: unknown, potD: unknown) => { motor.vL = motor.velDe(Number(potI) || 0); motor.vR = motor.velDe(Number(potD) || 0); motor.sucio = true },
    esperar: (seg: unknown) => pausa((Number(seg) || 0) * 1000),

    decir: async (texto: unknown, seg?: unknown) => {
      motor.mensaje = String(texto ?? ''); motor.sucio = true
      if (seg !== undefined) { await pausa((Number(seg) || 0) * 1000); if (motor.mensaje === String(texto ?? '')) { motor.mensaje = ''; motor.sucio = true } }
    },

    // sensores
    color: () => motor.color(),
    esColor: (c: string) => motor.color() === c,
    distancia: () => motor.distancia(),
    cerca: (cm: unknown) => motor.distancia() <= (Number(cm) || 0),
    tactil: () => motor.tactil(),
    angulo: () => motor.angulo(),
    enMeta: () => motor.enMeta(),
    lineaEs: (n: unknown, c: string) => motor.colorLinea(sensor(n)) === c,
    lineaColor: (n: unknown) => motor.colorLinea(sensor(n)),
    luz: (n: unknown) => motor.luz(sensor(n)),
    tiempo: () => Math.round(motor.tiempo * 10) / 10,

    // utilidades para bucles cooperativos
    tick: () => pausa(0),
    // «esperar hasta»: la condición se revisa en cada paso de física, sin límite de tiempo
    hasta: (cond: () => unknown) => motor.hasta(token, () => !!cond()),
    vivo,
    MAX_DIST,
  }
}

export type ApiEV3 = ReturnType<typeof crearApiEV3>
