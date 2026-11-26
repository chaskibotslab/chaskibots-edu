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

  // Espera hasta que la condición se cumpla (o se agote el tiempo), cediendo al bucle de física.
  const hasta = async (cond: () => boolean, maxSeg = 20) => {
    const t0 = performance.now()
    while (vivo() && !cond() && performance.now() - t0 < maxSeg * 1000) await pausa(16)
  }

  // Mueve con velocidades dadas por el modo elegido, luego frena (salvo "inf").
  const correr = async (vI: number, vD: number, modo: string, valor: number) => {
    motor.vL = vI; motor.vR = vD; motor.sucio = true
    if (modo === 'inf') return
    if (modo === 'seg') { await pausa(Math.max(0, valor) * 1000) }
    else {
      const objetivo = modo === 'rot' ? Math.abs(valor) * 360 : Math.abs(valor)
      const g0 = (Math.abs(motor.gradosL) + Math.abs(motor.gradosR)) / 2
      await hasta(() => (Math.abs(motor.gradosL) + Math.abs(motor.gradosR)) / 2 - g0 >= objetivo)
    }
    motor.vL = motor.vR = 0; motor.sucio = true
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
      const objetivo = Math.abs(g) * Math.PI / 180
      await hasta(() => Math.abs(motor.ang - a0) >= objetivo)
      motor.vL = motor.vR = 0; motor.sucio = true
    },
    parar: () => { motor.vL = motor.vR = 0; motor.sucio = true },
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

    // utilidades para bucles cooperativos
    tick: () => pausa(16),
    vivo,
    MAX_DIST,
  }
}

export type ApiEV3 = ReturnType<typeof crearApiEV3>
