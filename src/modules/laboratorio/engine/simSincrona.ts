// Simulación completa sin navegador: micro emulado + sensores + física, paso a
// paso en el mismo hilo. La usan los tests de lazo cerrado (y en F6 el juez
// que verifica entregas). El navegador usa simulation.ts, que reparte el
// mismo trabajo entre un worker y la interfaz pero llama a las mismas
// funciones (leerSensores, aplicarPines, Reloj, Competencia).

import { reflectanciaArena } from '../arenas'
import type { ArenaDef } from '../arenas/tipos'
import { construirMinisumo } from '../robots/prearmados'
import type { RobotDoc } from '../robots/doc'
import { AvrRunner, CPU_FREQ_HZ, type StepResult } from './avrRunner'
import { Competencia, type NivelRival } from './competencia'
import { Mundo, type Gravedad } from './fisica/mundo'
import { Reloj, RobotFisico } from './fisica/robotFisico'
import { Ultrasonidos } from './hcsr04'
import { planCircuito, type ControlesCircuito, type PlanCircuito } from './circuito'
import { aplicarPines, leerSensores, type Entradas, type FuncionReflectancia } from './paso'
import { planDe, type SimPlan } from './plan'
import { infoPlaca } from './placa'

export class SimSincrona {
  readonly mundo: Mundo
  readonly robot: RobotFisico
  readonly plan: SimPlan
  readonly doc: RobotDoc
  /** Combate de sumo (solo en arenas de competencia y si se pide un rival). */
  readonly competencia: Competencia | null
  avr: AvrRunner | null
  private us: Ultrasonidos | null
  private readonly hex: string | undefined
  private readonly reloj = new Reloj()
  private readonly reflectancia: FuncionReflectancia
  /** Circuito de la protoboard: lo que el test «toca» (pulsadores, perillas) y los LED quemados. */
  readonly circuito: PlanCircuito | null
  readonly controles: ControlesCircuito = { botones: {}, perillas: {} }
  readonly quemados = new Set<string>()
  tiempo = 0
  serial = ''
  ultimas: Entradas | null = null
  ultimoPaso: StepResult | null = null

  constructor(doc: RobotDoc, arena: ArenaDef, opciones: { hex?: string; gravedad?: Gravedad; reflectancia?: FuncionReflectancia; rival?: NivelRival } = {}) {
    this.plan = planDe(doc)
    this.circuito = planCircuito(doc)
    this.mundo = new Mundo(arena, opciones.gravedad ?? 'tierra')
    this.robot = new RobotFisico(this.mundo, doc, this.plan, arena.inicio)
    this.reflectancia = opciones.reflectancia ?? reflectanciaArena(arena)
    this.hex = opciones.hex
    this.avr = null
    this.us = null
    this.doc = doc
    this.competencia = arena.competencia && opciones.rival
      ? new Competencia(this.mundo, arena, this.robot, construirMinisumo('pla-rojo', 'Rival'), opciones.rival, this.reflectancia)
      : null
    this.encender()
    this.competencia?.empezar()
  }

  /** Enciende (o reinicia) el micro con el programa: como apretar RESET. */
  private encender() {
    this.avr = this.hex ? new AvrRunner(this.hex, infoPlaca(this.doc).chip) : null
    this.us = this.avr ? new Ultrasonidos(this.avr) : null
  }

  /** Avanza `dt` segundos (sensores → micro → actuadores → física → juez). */
  paso(dt: number) {
    const pines = this.ultimoPaso?.pins ?? null
    const e = leerSensores(this.plan, this.doc, this.robot, this.reflectancia,
      this.circuito && { plan: this.circuito, pines, controles: this.controles, quemados: this.quemados }, this.controles.mano ?? null)
    this.ultimas = e
    let dtReal = dt
    if (this.avr) {
      for (const [pin, v] of Object.entries(e.digital)) this.avr.setDigitalInput(pin, v)
      for (const [pin, [sin, con]] of Object.entries(e.dobles)) this.avr.setDigitalInputDoble(pin, sin, con)
      for (const [pin, v] of Object.entries(e.analog)) this.avr.setAnalogInput(pin, v)
      this.us!.actualizar(e.ultrasonidos)
      const r = this.avr.run(dt * CPU_FREQ_HZ)
      this.ultimoPaso = r
      if (r.serial.length) this.serial += String.fromCharCode(...r.serial)
      aplicarPines(this.plan, this.robot, r.pins)
      dtReal = r.cycles / CPU_FREQ_HZ
    }
    this.competencia?.antes()
    this.reloj.avanzar(this.mundo, [this.robot, ...(this.competencia?.robots ?? [])], dtReal)
    if (this.competencia?.despues(dtReal) === 'nueva-ronda') this.encender()
    this.tiempo += dtReal
  }

  correr(segundos: number, dt = 1 / 60, cadaPaso?: (s: this) => void) {
    for (let t = 0; t < segundos; t += dt) { this.paso(dt); cadaPaso?.(this) }
  }

  liberar() { this.mundo.liberar() }
}
