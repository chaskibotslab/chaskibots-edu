// HC-SR04 dentro del micro emulado. Se resuelve junto al CPU (en el worker)
// porque el eco dura microsegundos y pulseIn() lo mide con precisión de
// ciclos: cuando el sketch baja TRIG, el módulo espera ~450 µs y deja ECHO en
// ALTO durante el tiempo de ida y vuelta del sonido (58 µs por cm).

import { CPU_FREQ_HZ, type AvrRunner } from './avrRunner'
import { hcsr04EchoMicros } from './bridge'

export interface UltrasonidoPines { trig: string; echo: string; cm: number | null }

const ESPERA_US = 450
const ciclos = (us: number) => Math.round((us * CPU_FREQ_HZ) / 1e6)

export class Ultrasonidos {
  private sensores = new Map<string, { echo: string; cm: number | null; ocupado: boolean; altoDesde: number }>()

  constructor(private readonly runner: AvrRunner) {
    runner.onEdge((pin, nivel, ciclo) => {
      const s = this.sensores.get(pin)
      if (!s) return
      if (nivel === 1) { s.altoDesde = ciclo; return }
      // Flanco de bajada de TRIG tras un pulso de al menos ~8 µs.
      if (s.ocupado || ciclo - s.altoDesde < ciclos(8)) return
      s.ocupado = true
      const cpu = runner.cpu
      const ancho = ciclos(hcsr04EchoMicros(s.cm))
      cpu.addClockEvent(() => {
        runner.setDigitalInput(s.echo, true)
        cpu.addClockEvent(() => { runner.setDigitalInput(s.echo, false); s.ocupado = false }, ancho)
      }, ciclos(ESPERA_US))
    })
  }

  /** Distancias más recientes (las calcula la física con rayos). */
  actualizar(lista: UltrasonidoPines[]) {
    for (const u of lista) {
      const s = this.sensores.get(u.trig)
      if (s) { s.cm = u.cm; s.echo = u.echo }
      else this.sensores.set(u.trig, { echo: u.echo, cm: u.cm, ocupado: false, altoDesde: 0 })
    }
  }
}
