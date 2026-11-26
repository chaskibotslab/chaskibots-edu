/**
 * Motor de simulación para los robots LEGO (EV3 y WeDo 2.0).
 * Tracción diferencial (cada motor mueve una rueda) + lectura de sensores.
 * No usa un motor de físicas pesado: integra el movimiento por dt y calcula
 * los sensores con geometría (muestreo de color del tapete y raycast 2D).
 *
 * El campo es un plano XZ en centímetros, centrado en (0,0).
 * ang = 0 mira hacia +X; el robot avanza en (cos ang, sin ang).
 */

export interface Obstaculo { x: number; z: number; r: number; alto?: number; color?: string }
export interface ZonaMeta { x: number; z: number; r: number }

export interface Tapete {
  ancho: number      // cm (eje X)
  alto: number       // cm (eje Z)
  /**
   * Pinta líneas y zonas sobre el piso (textura + sensor de color).
   * El contexto ya está en centímetros, origen en el centro, +x derecha, +z abajo.
   */
  pintar?: (ctx: CanvasRenderingContext2D) => void
  colorPiso?: string
  obstaculos: Obstaculo[]
  meta?: ZonaMeta
  inicio: { x: number; z: number; ang: number } // ang en grados
}

export interface EstadoRobot {
  x: number; z: number; ang: number   // ang en radianes
  vL: number; vR: number              // cm/s por rueda
  gradosL: number; gradosR: number    // rotación acumulada de cada rueda
  tocando: boolean
}

export class Detenido extends Error {}

const RAD = Math.PI / 180
const DEG = 180 / Math.PI
export const MAX_DIST = 250 // cm que reporta el ultrasónico como "nada cerca"

export class LegoMotor {
  tapete: Tapete | null = null
  // Geometría del robot (cm)
  distRuedas = 12      // separación entre ruedas
  radioRueda = 2.75    // radio de rueda (EV3 ~2.8cm)
  radioRobot = 8       // para colisiones
  offsetSensor = 9     // el sensor frontal va adelante del centro
  velMax = 35          // cm/s a potencia 100

  x = 0; z = 0; ang = 0
  vL = 0; vR = 0
  gradosL = 0; gradosR = 0
  tocando = false

  activo = false
  sucio = true
  private ficha = 0
  /** La interfaz entrega una función para leer el color del tapete en (x,z) → nombre de color. */
  leerColorEn: (x: number, z: number) => string = () => 'blanco'
  /** HUD: la interfaz muestra lo que el robot "dice"/escribe. */
  mensaje = ''
  alError: (t: string) => void = () => {}

  cargar(t: Tapete) {
    this.tapete = t
    this.reiniciar()
  }

  reiniciar() {
    const t = this.tapete
    this.x = t?.inicio.x ?? 0
    this.z = t?.inicio.z ?? 0
    this.ang = (t?.inicio.ang ?? 0) * RAD
    this.vL = this.vR = 0
    this.gradosL = this.gradosR = 0
    this.tocando = false
    this.mensaje = ''
    this.sucio = true
  }

  detener() {
    this.activo = false
    this.ficha++
    this.vL = this.vR = 0
    this.sucio = true
  }

  /** Inicia una ejecución nueva y devuelve su ficha (token) para la parada cooperativa. */
  nuevaEjecucion(): number {
    this.ficha++
    this.activo = true
    return this.ficha
  }

  vivo(token: number): boolean { return this.ficha === token && this.activo }

  /** Espera ms; se rechaza con Detenido si la ejecución fue cancelada. */
  pausa(token: number, ms: number): Promise<void> {
    return new Promise((ok, bad) => setTimeout(() => (this.ficha !== token ? bad(new Detenido()) : ok()), Math.max(0, ms)))
  }

  /** Convierte potencia (-100..100) a velocidad lineal de rueda (cm/s). */
  velDe(pot: number): number { return Math.max(-100, Math.min(100, pot)) / 100 * this.velMax }

  // --------------------------------------------------------- integración física
  tick(dt: number) {
    if (!this.activo) return
    const v = (this.vL + this.vR) / 2
    const omega = (this.vR - this.vL) / this.distRuedas
    const nx = this.x + Math.cos(this.ang) * v * dt
    const nz = this.z + Math.sin(this.ang) * v * dt
    this.ang += omega * dt
    // rotación de ruedas (grados)
    this.gradosL += (this.vL * dt) / (2 * Math.PI * this.radioRueda) * 360
    this.gradosR += (this.vR * dt) / (2 * Math.PI * this.radioRueda) * 360

    // colisiones con obstáculos y paredes → no atraviesa, marca "tocando"
    let choca = false
    const t = this.tapete
    if (t) {
      const lim = this.radioRobot
      const maxX = t.ancho / 2 - lim, maxZ = t.alto / 2 - lim
      let cx = nx, cz = nz
      if (cx > maxX) { cx = maxX; choca = true } else if (cx < -maxX) { cx = -maxX; choca = true }
      if (cz > maxZ) { cz = maxZ; choca = true } else if (cz < -maxZ) { cz = -maxZ; choca = true }
      for (const o of t.obstaculos) {
        const dx = cx - o.x, dz = cz - o.z
        const d = Math.hypot(dx, dz)
        const min = this.radioRobot + o.r
        if (d < min && d > 0.0001) { const k = min / d; cx = o.x + dx * k; cz = o.z + dz * k; choca = true }
      }
      this.x = cx; this.z = cz
    } else { this.x = nx; this.z = nz }
    this.tocando = choca
    this.sucio = true
  }

  // --------------------------------------------------------------- sensores
  private frente() {
    return { x: this.x + Math.cos(this.ang) * this.offsetSensor, z: this.z + Math.sin(this.ang) * this.offsetSensor }
  }

  color(): string {
    const f = this.frente()
    return this.leerColorEn(f.x, f.z)
  }

  /** Distancia al obstáculo o pared más cercano enfrente (cm). */
  distancia(): number {
    const t = this.tapete
    const ox = this.x + Math.cos(this.ang) * this.offsetSensor
    const oz = this.z + Math.sin(this.ang) * this.offsetSensor
    const dx = Math.cos(this.ang), dz = Math.sin(this.ang)
    let mejor = MAX_DIST
    if (t) {
      // paredes del campo
      const bx = t.ancho / 2, bz = t.alto / 2
      const candidatos = [
        dx > 0 ? (bx - ox) / dx : Infinity,
        dx < 0 ? (-bx - ox) / dx : Infinity,
        dz > 0 ? (bz - oz) / dz : Infinity,
        dz < 0 ? (-bz - oz) / dz : Infinity,
      ].filter(v => v > 0)
      for (const d of candidatos) mejor = Math.min(mejor, d)
      // obstáculos (círculos): intersección rayo-círculo
      for (const o of t.obstaculos) {
        const fx = ox - o.x, fz = oz - o.z
        const b = 2 * (fx * dx + fz * dz)
        const c = fx * fx + fz * fz - o.r * o.r
        const disc = b * b - 4 * c
        if (disc >= 0) {
          const s = (-b - Math.sqrt(disc)) / 2
          if (s > 0) mejor = Math.min(mejor, s)
        }
      }
    }
    return Math.max(0, Math.min(MAX_DIST, Math.round(mejor)))
  }

  tactil(): boolean { return this.tocando }

  /** Ángulo del giroscopio en grados (0..360, horario desde el inicio). */
  angulo(): number {
    const t = this.tapete
    const base = (t?.inicio.ang ?? 0) * RAD
    let g = (this.ang - base) * DEG
    g = ((g % 360) + 360) % 360
    return Math.round(g)
  }

  enMeta(): boolean {
    const m = this.tapete?.meta
    if (!m) return false
    return Math.hypot(this.x - m.x, this.z - m.z) <= m.r
  }
}
