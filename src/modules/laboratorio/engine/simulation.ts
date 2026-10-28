// Orquestador de la simulación en el navegador (hilo principal).
//
// Un ciclo de simulación:
//   1. Sensores: rayos desde cada sensor (piso, obstáculos) → entradas del micro.
//   2. Micro: el worker ejecuta N ciclos de CPU con esas entradas
//      (N = tiempo pendiente × 16 MHz; ~266 667 ciclos por cuadro a 60 fps).
//   3. Actuadores: PWM de los pines → driver → voltaje de cada motor; pulsos → servos.
//   4. Física: Rapier avanza exactamente N / 16 MHz segundos, en sub-pasos fijos.
// Si el navegador no alcanza el tiempo real, la simulación va más lenta (no se
// salta pasos) y la interfaz muestra la "velocidad de simulación" en %.
// Es la misma lógica que simSincrona.ts (tests), repartida entre worker e interfaz.

import { reflectanciaArena } from '../arenas'
import type { ArenaDef } from '../arenas/tipos'
import type { RobotDoc } from '../robots/doc'
import { construirMinisumo } from '../robots/prearmados'
import { Competencia, type EstadoCombate, type NivelRival } from './competencia'
import { CPU_FREQ_HZ, type PinReport, type StepResult } from './avrRunner'
import type { WorkerIn, WorkerOut } from './avr.worker'
import { avisosEnsamblaje } from './ensamblaje'
import { Mundo, iniciarRapier, type Gravedad } from './fisica/mundo'
import { Reloj, RobotFisico } from './fisica/robotFisico'
import type { UltrasonidoPines } from './hcsr04'
import { aplicarPines, leerSensores, type LecturaSensor } from './paso'
import { planDe, type SimPlan } from './plan'
import { infoPlaca } from './placa'
import { MapaPista, type Pose2D } from './tracks'

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
  motores: { instancia: string; etiqueta: string; volts: number; rpm: number }[]
  servos: { instancia: string; angulo: number }[]
  velocidadRobot: number
  avisos: string[]
  /** Solo en arenas de competencia (sumo, minisumo). */
  combate?: EstadoCombate
  error?: string
}

export class Simulacion {
  readonly doc: RobotDoc
  readonly plan: SimPlan
  mundo!: Mundo
  fisica!: RobotFisico
  arena!: ArenaDef
  /** Imagen de la pista (solo arenas de línea): textura y lo que leen los sensores. */
  mapa: MapaPista | null = null
  private gravedad: Gravedad = 'tierra'
  private reloj = new Reloj()
  /** Combate con rival y juez (arenas de competencia). */
  competencia: Competencia | null = null
  private nivelRival: NivelRival = 'cazador'
  /** Programa cargado: hace falta para reiniciar el micro en cada ronda. */
  private hex: string | null = null

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
  private ultrasonidos: UltrasonidoPines[] = []
  private serialPendiente = ''
  private estado: Telemetria['estado'] = 'sin-programa'
  private error?: string
  private readonly avisos: string[]
  // Medición de velocidad (ventana de ~1 s)
  private ventana = { real: 0, sim: 0, ciclos: 0, pct: 0, mhz: 0 }
  private ultimaTelemetria = 0

  onSerial: (texto: string) => void = () => {}
  onTelemetria: (t: Telemetria) => void = () => {}
  onArenaCambiada: () => void = () => {}

  constructor(doc: RobotDoc) {
    this.doc = doc
    this.plan = planDe(doc)
    this.avisos = Array.from(new Set([...avisosEnsamblaje(doc), ...this.plan.avisos]))
  }

  async iniciar(arena: ArenaDef, gravedad: Gravedad, imagen?: CanvasImageSource) {
    await iniciarRapier()
    this.gravedad = gravedad
    this.montarArena(arena, imagen)
    this.ultimoCuadro = performance.now()
    this.corriendo = true // la física corre aunque no haya programa (motores apagados)
    this.raf = requestAnimationFrame(this.cuadro)
  }

  private montarArena(arena: ArenaDef, imagen?: CanvasImageSource) {
    this.mundo?.liberar()
    this.arena = arena
    this.mapa = arena.pista ? new MapaPista(arena.pista, imagen) : null
    this.mundo = new Mundo(arena, this.gravedad)
    this.fisica = new RobotFisico(this.mundo, this.doc, this.plan, arena.inicio)
    this.reloj = new Reloj()
    this.competencia = arena.competencia
      ? new Competencia(this.mundo, arena, this.fisica, construirMinisumo('pla-rojo', 'Rival'), this.nivelRival, this.reflectancia())
      : null
  }

  /** Lo que ven los sensores de piso: la imagen de la pista o el piso de la arena. */
  private reflectancia() {
    const mapa = this.mapa
    return mapa ? (x: number, z: number, r: number) => mapa.reflectancia(x, z, r) : reflectanciaArena(this.arena)
  }

  get rival(): NivelRival { return this.nivelRival }

  /** Cambia el rival de práctica; si hay un programa corriendo, empieza un combate nuevo. */
  elegirRival(n: NivelRival) {
    this.nivelRival = n
    this.cambiarArena(this.arena)
    if (this.cargado && this.hex) void this.cargarPrograma(this.hex)
  }

  // ---------------- programa ----------------

  async cargarPrograma(hex: string): Promise<void> {
    this.hex = hex
    this.tiempoSim = 0
    if (this.competencia) this.competencia.empezar()
    else this.fisica.colocar(this.arena.inicio)
    return this.encender(hex)
  }

  /** Arranca el micro con el programa (como enchufar la placa o apretar RESET). */
  private async encender(hex: string): Promise<void> {
    this.worker?.terminate()
    this.cargado = false
    this.pendiente = false
    this.estado = 'cargando'
    this.error = undefined
    this.pines = {}
    const worker = new Worker(new URL('./avr.worker.ts', import.meta.url))
    this.worker = worker
    await new Promise<void>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent<WorkerOut>) => {
        const m = e.data
        if (m.type === 'loaded') { this.cargado = true; this.estado = 'corriendo'; this.corriendo = true; resolve() }
        else if (m.type === 'error') { this.falla(m.message); reject(new Error(m.message)) }
        else if (m.type === 'step') this.alTerminarPaso(m.result)
      }
      worker.onerror = ev => { this.falla(ev.message || 'Error en el microcontrolador'); reject(new Error(ev.message)) }
      worker.postMessage({ type: 'load', hex, chip: infoPlaca(this.doc).chip } satisfies WorkerIn)
    })
  }

  detenerPrograma() {
    this.worker?.terminate()
    this.worker = null
    this.cargado = false
    this.pendiente = false
    this.pines = {}
    this.estado = 'sin-programa'
    this.hex = null
    this.competencia?.detener()
    for (const r of this.fisica.ruedas) r.volts = 0
  }

  /** Estado de pines y sensores del último paso (para animar LEDs en 3D). */
  get pinesActuales(): Record<string, PinReport> { return this.cargado ? this.pines : {} }
  get lecturasActuales(): LecturaSensor[] { return this.sensores }

  pausar() { if (this.cargado) { this.corriendo = false; this.estado = 'pausado' } }
  continuar() { if (this.cargado) { this.corriendo = true; this.estado = 'corriendo'; this.ultimoCuadro = performance.now() } }
  get pausado() { return !this.corriendo }

  enviarSerial(texto: string) { this.serialPendiente += texto }

  // ---------------- escena ----------------

  colocarRobot(p?: Pose2D) { this.fisica.colocar(p ?? this.arena.inicio) }

  cambiarArena(arena: ArenaDef, imagen?: CanvasImageSource) {
    const motores = this.fisica?.ruedas.map(r => r.volts)
    this.montarArena(arena, imagen)
    if (motores) this.fisica.ruedas.forEach((r, i) => { r.volts = motores[i] ?? 0 })
    this.onArenaCambiada()
  }

  cambiarGravedad(g: Gravedad) { this.gravedad = g; this.mundo.setGravedad(g) }

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
    const msg: WorkerIn = { type: 'step', cycles: Math.round(dt * CPU_FREQ_HZ), digital, analog, ultrasonidos: this.ultrasonidos }
    if (this.serialPendiente) { msg.serial = this.serialPendiente; this.serialPendiente = '' }
    this.worker.postMessage(msg)
  }

  private alTerminarPaso(r: StepResult) {
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
    const e = leerSensores(this.plan, this.doc, this.fisica, this.reflectancia())
    this.sensores = e.lecturas
    this.ultrasonidos = e.ultrasonidos
    return e
  }

  private pasoFisica(dt: number) {
    aplicarPines(this.plan, this.fisica, this.cargado ? this.pines : null)
    // Manejo directo (sin programa): el control pone el voltaje de cada lado.
    if (!this.cargado && this.manual) {
      const vMax = Math.max(0, this.plan.voltajeBateria - this.plan.caidaDriver)
      for (const r of this.fisica.ruedas) {
        const m = this.plan.motores.find(x => x.instancia === r.motor)
        if (!m?.driver || !m.polaridad) continue
        r.volts = (m.rueda && m.rueda.centro.z < 0 ? this.manual.izq : this.manual.der) * vMax
      }
    }
    const c = this.competencia
    c?.antes()
    this.reloj.avanzar(this.mundo, [this.fisica, ...(c?.robots ?? [])], dt)
    // Nueva ronda: los robots ya están en sus salidas; el programa vuelve a empezar.
    if (c?.despues(dt) === 'nueva-ronda' && this.hex) this.encender(this.hex).catch(() => {})
  }

  /** Control directo de los motores sin programa (−1 a 1 por lado). */
  private manual: { izq: number; der: number } | null = null
  manejar(izq: number, der: number) { this.manual = izq || der ? { izq, der } : null }
  get tieneProgramaCorriendo() { return this.cargado }

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
    const etiquetas = new Map(this.doc.piezas.map(p => [p.id, p.etiqueta]))
    this.onTelemetria({
      estado: this.estado,
      tiempoSim: this.tiempoSim,
      velocidadPct: this.cargado && this.corriendo ? this.ventana.pct : 0,
      mhz: this.cargado && this.corriendo ? this.ventana.mhz : 0,
      pines: this.pines,
      sensores: this.sensores,
      motores: this.fisica.ruedas.map(r => ({
        instancia: r.motor, etiqueta: etiquetas.get(r.motor) ?? r.motor,
        volts: r.volts, rpm: (r.omega * 60) / (2 * Math.PI),
      })),
      servos: Array.from(this.fisica.servos.values()).map(s => ({ instancia: s.instancia, angulo: s.angulo })),
      velocidadRobot: pose.velocidad,
      avisos: this.avisos,
      error: this.error,
      combate: this.competencia ? { ...this.competencia.estado, marcador: { ...this.competencia.estado.marcador } } : undefined,
    })
  }

  liberar() {
    cancelAnimationFrame(this.raf)
    this.worker?.terminate()
    this.mundo?.liberar()
  }
}
