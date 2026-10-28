// Simulación completa sin navegador: micro emulado + sensores + física, paso a
// paso en el mismo hilo. La usan los tests de lazo cerrado (y en F6 el juez
// que verifica entregas). El navegador usa simulation.ts, que reparte el
// mismo trabajo entre un worker y la interfaz pero llama a las mismas
// funciones (leerSensores, aplicarPines, Reloj).

import type { ArenaDef } from '../arenas/tipos'
import type { RobotDoc } from '../robots/doc'
import { AvrRunner, CPU_FREQ_HZ, type StepResult } from './avrRunner'
import { Mundo, type Gravedad } from './fisica/mundo'
import { Reloj, RobotFisico } from './fisica/robotFisico'
import { Ultrasonidos } from './hcsr04'
import { aplicarPines, leerSensores, type Entradas, type FuncionReflectancia } from './paso'
import { planDe, type SimPlan } from './plan'
import { infoPlaca } from './placa'

export class SimSincrona {
  readonly mundo: Mundo
  readonly robot: RobotFisico
  readonly plan: SimPlan
  readonly doc: RobotDoc
  readonly avr: AvrRunner | null
  private readonly us: Ultrasonidos | null
  private readonly reloj = new Reloj()
  private readonly reflectancia: FuncionReflectancia
  tiempo = 0
  serial = ''
  ultimas: Entradas | null = null
  ultimoPaso: StepResult | null = null

  constructor(doc: RobotDoc, arena: ArenaDef, opciones: { hex?: string; gravedad?: Gravedad; reflectancia?: FuncionReflectancia } = {}) {
    this.plan = planDe(doc)
    this.mundo = new Mundo(arena, opciones.gravedad ?? 'tierra')
    this.robot = new RobotFisico(this.mundo, doc, this.plan, arena.inicio)
    this.reflectancia = opciones.reflectancia ?? (() => arena.piso.reflectancia)
    this.avr = opciones.hex ? new AvrRunner(opciones.hex, infoPlaca(doc).chip) : null
    this.us = this.avr ? new Ultrasonidos(this.avr) : null
    this.doc = doc
  }

  /** Avanza `dt` segundos (sensores → micro → actuadores → física). */
  paso(dt: number) {
    const e = leerSensores(this.plan, this.doc, this.robot, this.reflectancia)
    this.ultimas = e
    let dtReal = dt
    if (this.avr) {
      for (const [pin, v] of Object.entries(e.digital)) this.avr.setDigitalInput(pin, v)
      for (const [pin, v] of Object.entries(e.analog)) this.avr.setAnalogInput(pin, v)
      this.us!.actualizar(e.ultrasonidos)
      const r = this.avr.run(dt * CPU_FREQ_HZ)
      this.ultimoPaso = r
      if (r.serial.length) this.serial += String.fromCharCode(...r.serial)
      aplicarPines(this.plan, this.robot, r.pins)
      dtReal = r.cycles / CPU_FREQ_HZ
    }
    this.reloj.avanzar(this.mundo, [this.robot], dtReal)
    this.tiempo += dtReal
  }

  correr(segundos: number, dt = 1 / 60, cadaPaso?: (s: this) => void) {
    for (let t = 0; t < segundos; t += dt) { this.paso(dt); cadaPaso?.(this) }
  }

  liberar() { this.mundo.liberar() }
}
