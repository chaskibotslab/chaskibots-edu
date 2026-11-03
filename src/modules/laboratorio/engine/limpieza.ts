// Robot aspirador: el piso de la sala empieza con polvo, repartido en celdas, y
// el robot limpia las celdas por donde pasa. Debajo de los muebles no hay piso
// que limpiar (no cuentan en el porcentaje).

import type { ArenaDef } from '../arenas/tipos'

/** Lo que limpia el robot alrededor de su centro (m): un poco menos que su ancho. */
export const RADIO_ASPIRADO = 0.06

export class Limpieza {
  readonly cols: number
  readonly filas: number
  readonly celda: number
  /** 1 = sucia, 0 = limpia, 2 = no hay piso (mueble). */
  readonly celdas: Uint8Array
  private readonly ancho: number
  private readonly largo: number
  private total = 0
  private limpias = 0
  /** Cambia cada vez que se limpia algo (para redibujar el polvo). */
  version = 0

  constructor(arena: ArenaDef, celda = arena.limpieza?.celda ?? 0.05) {
    this.celda = celda
    this.ancho = arena.ancho
    this.largo = arena.largo
    this.cols = Math.round(arena.ancho / celda)
    this.filas = Math.round(arena.largo / celda)
    this.celdas = new Uint8Array(this.cols * this.filas)
    for (let f = 0; f < this.filas; f++) {
      for (let c = 0; c < this.cols; c++) {
        const { x, z } = this.centro(c, f)
        const bajoMueble = arena.objetos.some(o => o.forma === 'caja'
          ? Math.abs(x - o.x) < o.medidas[0] / 2 && Math.abs(z - o.z) < o.medidas[2] / 2
          : Math.hypot(x - o.x, z - o.z) < o.medidas[0])
        this.celdas[f * this.cols + c] = bajoMueble ? 2 : 1
      }
    }
    this.reiniciar()
  }

  private centro(c: number, f: number) {
    return { x: -this.ancho / 2 + (c + 0.5) * this.celda, z: -this.largo / 2 + (f + 0.5) * this.celda }
  }

  /** Vuelve a ensuciar todo el piso. */
  reiniciar() {
    this.total = 0
    for (let i = 0; i < this.celdas.length; i++) {
      if (this.celdas[i] !== 2) { this.celdas[i] = 1; this.total++ }
    }
    this.limpias = 0
    this.version++
  }

  /** El robot pasa por (x, z): limpia las celdas cuyo centro queda dentro del radio. */
  barrer(x: number, z: number, radio = RADIO_ASPIRADO) {
    const c0 = Math.max(0, Math.floor((x - radio + this.ancho / 2) / this.celda))
    const c1 = Math.min(this.cols - 1, Math.floor((x + radio + this.ancho / 2) / this.celda))
    const f0 = Math.max(0, Math.floor((z - radio + this.largo / 2) / this.celda))
    const f1 = Math.min(this.filas - 1, Math.floor((z + radio + this.largo / 2) / this.celda))
    let cambio = false
    for (let f = f0; f <= f1; f++) {
      for (let c = c0; c <= c1; c++) {
        const i = f * this.cols + c
        if (this.celdas[i] !== 1) continue
        const p = this.centro(c, f)
        if (Math.hypot(p.x - x, p.z - z) > radio) continue
        this.celdas[i] = 0
        this.limpias++
        cambio = true
      }
    }
    if (cambio) this.version++
  }

  /** Porcentaje del piso que ya está limpio (0–100). */
  get porcentaje() { return this.total ? (this.limpias / this.total) * 100 : 0 }
}
