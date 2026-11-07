// Competencia de velocidad para seguidores de línea: el juez cronometra.
//
// La pista es una curva cerrada (tracks.ts). El juez sigue el avance del robot
// sobre ella (el punto de la línea más cercano, como fracción de la vuelta):
//   · una vuelta cuenta cuando el avance pasa de casi 1 a casi 0 habiendo
//     recorrido más de la mitad (así no cuenta ir y volver sobre la salida);
//   · si el robot se aleja más de 12 cm de la línea durante 1 s, se salió:
//     la vuelta se anula y vuelve a la salida;
//   · la carrera termina al completar las vueltas o al llegar al tiempo máximo.
// La usan la simulación del navegador y la de los tests, así el juez es el mismo.

import type { ArenaDef } from '../arenas/tipos'

export interface EstadoCarrera {
  fase: 'espera' | 'carrera' | 'final'
  vuelta: number           // la que se está corriendo (1…)
  totalVueltas: number
  tiempo: number           // s desde la largada
  tiempoVuelta: number     // s de la vuelta en curso
  vueltas: number[]        // tiempos de las vueltas completas (s)
  mejor: number | null
  salidas: number
  motivo: string | null
}

const SALIDA_M = 0.12
const SALIDA_S = 1

export class Cronometro {
  readonly estado: EstadoCarrera
  private readonly puntos: [number, number][]
  private readonly maxS: number
  private indice = 0
  private avanceMax = 0
  private afuera = 0

  constructor(arena: ArenaDef) {
    const c = arena.cronometro!
    const f = arena.pista!.trazado!
    const n = 1200
    this.puntos = Array.from({ length: n }, (_, i) => f(i / n))
    this.maxS = c.maxS
    this.estado = { fase: 'espera', vuelta: 1, totalVueltas: c.vueltas, tiempo: 0, tiempoVuelta: 0, vueltas: [], mejor: null, salidas: 0, motivo: null }
  }

  /** Largada (al cargar el programa): todo a cero. */
  empezar() {
    Object.assign(this.estado, { fase: 'carrera', vuelta: 1, tiempo: 0, tiempoVuelta: 0, vueltas: [], mejor: null, salidas: 0, motivo: null })
    this.indice = 0; this.avanceMax = 0; this.afuera = 0
  }

  detener() { if (this.estado.fase === 'carrera') this.estado.fase = 'espera' }

  /** Punto de la línea más cercano: busca cerca del anterior (o en toda la pista si se perdió). */
  private cercano(x: number, z: number): { i: number; d: number } {
    const n = this.puntos.length
    let mejor = { i: this.indice, d: Infinity }
    const buscar = (desde: number, hasta: number) => {
      for (let k = desde; k <= hasta; k++) {
        const i = ((k % n) + n) % n
        const [px, pz] = this.puntos[i]
        const d = Math.hypot(px - x, pz - z)
        if (d < mejor.d) mejor = { i, d }
      }
    }
    buscar(this.indice - 60, this.indice + 60)
    if (mejor.d > SALIDA_M) buscar(0, n - 1)
    return mejor
  }

  /** Después de cada paso de física. Devuelve 'reubicar' si el robot debe volver a la salida. */
  actualizar(dt: number, x: number, z: number): 'reubicar' | null {
    const e = this.estado
    if (e.fase !== 'carrera') return null
    e.tiempo += dt
    e.tiempoVuelta += dt
    const n = this.puntos.length
    const { i, d } = this.cercano(x, z)
    const antes = this.indice / n, ahora = i / n
    this.indice = i
    if (ahora > this.avanceMax && ahora - antes < 0.2) this.avanceMax = ahora
    if (antes > 0.85 && ahora < 0.15 && this.avanceMax > 0.5) {
      e.vueltas.push(e.tiempoVuelta)
      e.mejor = Math.min(e.mejor ?? Infinity, e.tiempoVuelta)
      e.tiempoVuelta = 0
      this.avanceMax = 0
      if (e.vueltas.length >= e.totalVueltas) {
        e.fase = 'final'
        e.motivo = `${e.totalVueltas} vueltas en ${e.vueltas.reduce((s, v) => s + v, 0).toFixed(1)} s`
        return null
      }
      e.vuelta++
    }
    this.afuera = d > SALIDA_M ? this.afuera + dt : 0
    if (this.afuera >= SALIDA_S) {
      e.salidas++
      e.tiempoVuelta = 0
      this.indice = 0; this.avanceMax = 0; this.afuera = 0
      return 'reubicar'
    }
    if (e.tiempo >= this.maxS) {
      e.fase = 'final'
      e.motivo = `Tiempo máximo: ${e.vueltas.length} de ${e.totalVueltas} vueltas`
    }
    return null
  }
}
