// Orquestador de la simulación (hilo principal).
//
// Un ciclo de simulación:
//   1. Sensores: raycast de cada IR al piso → color de la pista → nivel del pin.
//   2. Micro: el worker ejecuta N ciclos de CPU con esas entradas
//      (N = tiempo pendiente × 16 MHz; ~266 667 ciclos por cuadro a 60 fps).
//   3. Actuadores: ciclo de trabajo de ENA/IN1/IN2… → L298N → voltaje de cada motor.
//   4. Física: Rapier avanza exactamente N / 16 MHz segundos.
// Si el navegador no alcanza el tiempo real, la simulación va más lenta (no se
// salta pasos) y la interfaz muestra la "velocidad de simulación" en %.

import { CPU_FREQ_HZ, type PinReport, type StepResult } from './avrRunner'
import type { WorkerIn, WorkerOut } from './avr.worker'
import { aplicarPines, leerSensores, type LecturaSensor } from './nucleo'
import { planFromRobot, type SimPlan } from './netlist'
import { RobotFisico, iniciarRapier, type Gravedad } from './physics'
import { MapaPista, type Pista, type Pose2D } from './tracks'
import type { RobotDef } from '../robots/seguidorLinea'

const MAX_PASO_S = 1 / 30      // como máximo 33 ms simulados por pedido al worker
const MAX_ATRASO_S = 0.25      // si vamos más atrasados, se descarta el exceso

export type { LecturaSensor }

export interface Telemetria {
  estado: 'sin-programa' | 'cargando' | 'corriendo' | 'pausado' | 'error'
  tiempoSim: number
  velocidadPct: number
  mhz: number
  pines: Record<string, PinReport>
  sensores: LecturaSensor[]
  motores: { instancia: string; lado: 'izq' | 'der'; volts: number; rpm: number }[]
  velocidadRobot: number
  avisos: string[]
  error?: string
}

export class Simulacion {
  readonly robot: RobotDef
  readonly plan: SimPlan
  fisica!: RobotFisico
  mapa!: MapaPista
  pista!: Pista

  private worker: Worker | null = null
  private cargado = false
  private pendiente = false
  private corriendo = false
  private atraso = 0
  private ultimoCuadro = 0
  private raf = 0
  private tiempoSim = 0
  private pines: Record<string, PinReport> = {}
  private sensores: LecturaSensor[] = []
  private serialPendiente = ''
  private estado: Telemetria['estado'] = 'sin-programa'
  private error?: string
  // Medición de velocidad (ventana de ~1 s)
  private ventana = { real: 0, sim: 0, ciclos: 0, pct: 0, mhz: 0 }
  private ultimaTelemetria = 0

  onSerial: (texto: string) => void = () => {}
  onTelemetria: (t: Telemetria) => void = () => {}
  onPistaCambiada: () => void = () => {}

  constructor(robot: RobotDef) {
    this.robot = robot
    this.plan = planFromRobot(robot)
  }

  async iniciar(pista: Pista, gravedad: Gravedad) {
    await iniciarRapier()
    this.pista = pista
    this.mapa = new MapaPista(pista)
    this.fisica = new RobotFisico(this.robot, this.plan.masaKg, gravedad, pista.inicio)
    this.ultimoCuadro = performance.now()
    this.corriendo = true // la física corre aunque no haya programa (motores apagados)
    this.raf = requestAnimationFrame(this.cuadro)
  }

  // ---------------- programa ----------------

  async cargarPrograma(hex: string): Promise<void> {
    this.worker?.terminate()
    this.cargado = false
    this.pendiente = false
    this.estado = 'cargando'
    this.error = undefined
    this.tiempoSim = 0
    this.pines = {}
    this.fisica.colocar(this.pista.inicio)
    const worker = new Worker(new URL('./avr.worker.ts', import.meta.url))
    this.worker = worker
    await new Promise<void>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent<WorkerOut>) => {
        const m = e.data
        if (m.type === 'loaded') { this.cargado = true; this.estado = 'corriendo'; this.corriendo = true; resolve() }
        else if (m.type === 'error') { this.falla(m.message); reject(new Error(m.message)) }
        else if (m.type === 'step') this.alTerminarPaso(m.result, m.ms)
      }
      worker.onerror = ev => { this.falla(ev.message || 'Error en el microcontrolador'); reject(new Error(ev.message)) }
      worker.postMessage({ type: 'load', hex } satisfies WorkerIn)
    })
  }

  detenerPrograma() {
    this.worker?.terminate()
    this.worker = null
    this.cargado = false
    this.pendiente = false
    this.pines = {}
    this.estado = 'sin-programa'
    this.fisica.ruedas.izq.volts = 0
    this.fisica.ruedas.der.volts = 0
  }

  /** Estado de pines y sensores del último paso (para animar LEDs en 3D). */
  get pinesActuales(): Record<string, PinReport> { return this.cargado ? this.pines : {} }
  get lecturasActuales(): LecturaSensor[] { return this.sensores }

  pausar() { if (this.cargado) { this.corriendo = false; this.estado = 'pausado' } }
  continuar() { if (this.cargado) { this.corriendo = true; this.estado = 'corriendo'; this.ultimoCuadro = performance.now() } }
  get pausado() { return !this.corriendo }

  enviarSerial(texto: string) { this.serialPendiente += texto }

  // ---------------- escena ----------------

  colocarRobot(p?: Pose2D) { this.fisica.colocar(p ?? this.pista.inicio) }

  cambiarPista(pista: Pista, imagen?: CanvasImageSource) {
    this.pista = pista
    this.mapa = new MapaPista(pista, imagen)
    this.fisica.colocar(pista.inicio)
    this.onPistaCambiada()
  }

  cambiarGravedad(g: Gravedad) { this.fisica.setGravedad(g) }

  // ---------------- bucle ----------------

  private cuadro = (ahora: number) => {
    this.raf = requestAnimationFrame(this.cuadro)
    const dtReal = Math.min((ahora - this.ultimoCuadro) / 1000, 0.1)
    this.ultimoCuadro = ahora
    this.ventana.real += dtReal

    if (!this.corriendo) { this.emitir(ahora); return }

    if (!this.cargado) {
      // Sin programa: la física sigue (se puede mover el robot), motores en 0.
      this.leerSensores()
      this.pasoFisica(dtReal)
      this.emitir(ahora)
      return
    }

    this.atraso = Math.min(this.atraso + dtReal, MAX_ATRASO_S)
    this.pedirPaso()
    this.emitir(ahora)
  }

  private pedirPaso() {
    if (this.pendiente || !this.worker || !this.corriendo) return
    const dt = Math.min(this.atraso, MAX_PASO_S)
    if (dt < 0.002) return
    const { digital, analog } = this.leerSensores()
    this.pendiente = true
    const msg: WorkerIn = { type: 'step', cycles: Math.round(dt * CPU_FREQ_HZ), digital, analog }
    if (this.serialPendiente) { msg.serial = this.serialPendiente; this.serialPendiente = '' }
    this.worker.postMessage(msg)
  }

  private alTerminarPaso(r: StepResult, _ms: number) {
    this.pendiente = false
    const dt = r.cycles / CPU_FREQ_HZ
    this.atraso = Math.max(0, this.atraso - dt)
    this.tiempoSim += dt
    this.ventana.sim += dt
    this.ventana.ciclos += r.cycles
    this.pines = r.pins
    if (r.serial.length) this.onSerial(new TextDecoder().decode(new Uint8Array(r.serial)))
    this.pasoFisica(dt)
    // Si todavía hay tiempo pendiente, seguir sin esperar al próximo cuadro.
    if (this.atraso >= 1 / 120) this.pedirPaso()
  }

  private leerSensores() {
    const e = leerSensores(this.plan, this.fisica, (x, z, r) => this.mapa.reflectancia(x, z, r))
    this.sensores = e.lecturas
    return e
  }

  private pasoFisica(dt: number) {
    aplicarPines(this.plan, this.fisica, this.cargado ? this.pines : null, dt)
  }

  private falla(msg: string) {
    this.estado = 'error'
    this.error = msg
    this.cargado = false
    this.pendiente = false
  }

  private emitir(ahora: number) {
    if (this.ventana.real >= 1) {
      this.ventana.pct = (this.ventana.sim / this.ventana.real) * 100
      this.ventana.mhz = this.ventana.ciclos / this.ventana.real / 1e6
      this.ventana.real = 0; this.ventana.sim = 0; this.ventana.ciclos = 0
    }
    if (ahora - this.ultimaTelemetria < 100) return
    this.ultimaTelemetria = ahora
    const pose = this.fisica.pose()
    this.onTelemetria({
      estado: this.estado,
      tiempoSim: this.tiempoSim,
      velocidadPct: this.cargado && this.corriendo ? this.ventana.pct : 0,
      mhz: this.cargado && this.corriendo ? this.ventana.mhz : 0,
      pines: this.pines,
      sensores: this.sensores,
      motores: this.plan.motores.map(m => ({
        instancia: m.instancia, lado: m.lado,
        volts: this.fisica.ruedas[m.lado].volts,
        rpm: (this.fisica.ruedas[m.lado].omega * 60) / (2 * Math.PI),
      })),
      velocidadRobot: pose.velocidad,
      avisos: this.plan.avisos,
      error: this.error,
    })
  }

  liberar() {
    cancelAnimationFrame(this.raf)
    this.worker?.terminate()
    this.fisica?.liberar()
  }
}
