// Sonido de los buzzers con Web Audio: una onda cuadrada (como la que genera
// tone() en el pin) por cada buzzer que suena. El navegador solo deja sonar
// después de un gesto del usuario: `activar()` se llama al apretar «Compilar
// y ejecutar» o al tocar un control.

import type { EstadoCircuito } from '../engine/circuito'

const VOLUMEN = 0.045

export class SonidoBuzzers {
  private ctx: AudioContext | null = null
  private voces = new Map<string, { osc: OscillatorNode; gan: GainNode }>()
  silencio = false

  activar() {
    try {
      if (!this.ctx) this.ctx = new AudioContext()
      void this.ctx.resume()
    } catch { /* navegador sin Web Audio: la simulación sigue sin sonido */ }
  }

  actualizar(sonidos: EstadoCircuito['sonidos']) {
    const ctx = this.ctx
    if (!ctx) return
    const ahora = ctx.currentTime
    const activos = new Set<string>()
    if (!this.silencio) {
      for (const s of sonidos) {
        activos.add(s.inst)
        let v = this.voces.get(s.inst)
        if (!v) {
          const osc = ctx.createOscillator()
          const gan = ctx.createGain()
          osc.type = 'square'
          gan.gain.value = 0
          osc.connect(gan).connect(ctx.destination)
          osc.start()
          v = { osc, gan }
          this.voces.set(s.inst, v)
        }
        v.osc.frequency.setTargetAtTime(Math.min(8000, Math.max(30, s.freq)), ahora, 0.004)
        v.gan.gain.setTargetAtTime(VOLUMEN, ahora, 0.004)
      }
    }
    this.voces.forEach((v, inst) => {
      if (!activos.has(inst)) v.gan.gain.setTargetAtTime(0, ahora, 0.006)
    })
  }

  cerrar() {
    this.voces.forEach(v => { try { v.osc.stop() } catch { /* ya detenido */ } })
    this.voces.clear()
    void this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}
