/**
 * Motor de simulación para los robots LEGO (EV3 y WeDo 2.0).
 * Tracción diferencial (cada motor mueve una rueda) + lectura de sensores.
 * No usa un motor de físicas pesado: integra el movimiento por pasos fijos y calcula
 * los sensores con geometría (muestreo de color del tapete y rayos 2D).
 *
 * El campo es un plano XZ en centímetros, centrado en (0,0).
 * ang = 0 mira hacia +X; el robot avanza en (cos ang, sin ang). Su lado derecho es (-sin ang, cos ang),
 * así que girar a la derecha AUMENTA el ángulo (sentido horario visto desde arriba).
 *
 * El tiempo es simulado: las esperas del programa se cumplen cuando avanza `tiempo` (en `tick`),
 * no con el reloj real. Así el resultado es el mismo en una máquina lenta, rápida o acelerada.
 */

export interface Obstaculo { x: number; z: number; r: number; alto?: number; color?: string }
/** Muro rectangular (centro y tamaño), alineado con los ejes. */
export interface Muro { x: number; z: number; w: number; h: number; alto?: number; color?: string }
export interface ZonaMeta { x: number; z: number; r: number }
/** Objeto que el robot puede empujar. Un «rival» con `vel` persigue al robot. */
export interface Movil { x: number; z: number; r: number; tipo: 'caja' | 'rival'; vel?: number; color?: string; alto?: number }
export interface EstadoMovil extends Movil { fuera: boolean; ang: number }

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
  muros?: Muro[]
  moviles?: Movil[]
  /** Ring de sumo: quien sale del círculo pierde. */
  ring?: ZonaMeta
  /** Puntos de control que hay que pisar en orden. */
  puntos?: ZonaMeta[]
  /** false = sin paredes en el borde del campo (por defecto hay paredes). */
  paredes?: boolean
  meta?: ZonaMeta
  inicio: { x: number; z: number; ang: number } // ang en grados
}

export class Detenido extends Error { name = 'Detenido' }

const RAD = Math.PI / 180
const DEG = 180 / Math.PI
export const MAX_DIST = 250 // cm que reporta el sensor de distancia como "nada cerca"
export const PASO = 1 / 60  // segundos simulados por paso de física

interface Espera { t: number; token: number; ok: () => void; bad: (e: Error) => void; cond?: () => boolean; alCumplir?: () => void }

export class LegoMotor {
  tapete: Tapete | null = null
  // Geometría del robot (cm)
  distRuedas = 12      // separación entre ruedas
  radioRueda = 2.75    // radio de rueda (EV3 ~2.8cm)
  radioRobot = 8       // para colisiones
  offsetSensor = 9     // los sensores van adelante del centro
  velMax = 35          // cm/s a potencia 100
  /** Sensores de color mirando al piso: posición lateral de cada uno (cm, + = derecha), de izquierda a derecha. */
  lineas: number[] = [0]

  x = 0; z = 0; ang = 0
  vL = 0; vR = 0
  gradosL = 0; gradosR = 0
  tocando = false
  /** Segundos simulados desde que empezó la ejecución. */
  tiempo = 0
  /** Centímetros recorridos (odómetro). */
  recorrido = 0
  /** Veces que el robot chocó con algo fijo. */
  golpes = 0
  /** Cuántos puntos de control lleva pisados. */
  puntosHechos = 0
  /** El robot salió del ring. */
  caido = false
  moviles: EstadoMovil[] = []

  activo = false
  sucio = true
  private ficha = 0
  private esperas: Espera[] = []
  /** La interfaz entrega funciones para leer el tapete en (x,z): nombre de color y luz reflejada 0–100. */
  leerColorEn: (x: number, z: number) => string = () => 'blanco'
  leerLuzEn: (x: number, z: number) => number = () => 100
  /** HUD: la interfaz muestra lo que el robot "dice"/escribe. */
  mensaje = ''
  alError: (t: string) => void = () => {}
  /** Se llama al final de cada paso de física (para vigilar si la actividad ya se logró). */
  alPaso: (() => void) | null = null

  cargar(t: Tapete) {
    this.tapete = t
    this.reiniciar()
  }

  reiniciar() {
    const t = this.tapete
    this.cancelarEsperas()
    this.x = t?.inicio.x ?? 0
    this.z = t?.inicio.z ?? 0
    this.ang = (t?.inicio.ang ?? 0) * RAD
    this.vL = this.vR = 0
    this.gradosL = this.gradosR = 0
    this.tocando = false
    this.tiempo = 0; this.recorrido = 0; this.golpes = 0; this.puntosHechos = 0; this.caido = false
    this.moviles = (t?.moviles || []).map(m => ({ ...m, fuera: false, ang: 0 }))
    this.mensaje = ''
    this.sucio = true
  }

  private cancelarEsperas() {
    const pendientes = this.esperas
    this.esperas = []
    for (const e of pendientes) e.bad(new Detenido())
  }

  detener() {
    this.activo = false
    this.ficha++
    this.vL = this.vR = 0
    this.cancelarEsperas()
    this.sucio = true
  }

  /** Inicia una ejecución nueva y devuelve su ficha (token) para la parada cooperativa. */
  nuevaEjecucion(): number {
    this.ficha++
    this.cancelarEsperas()
    this.activo = true
    return this.ficha
  }

  vivo(token: number): boolean { return this.ficha === token && this.activo }

  /** Espera ms de tiempo simulado (0 = hasta el siguiente paso); se rechaza con Detenido si la ejecución fue cancelada. */
  pausa(token: number, ms: number, alCumplir?: () => void): Promise<void> {
    return new Promise((ok, bad) => {
      if (!this.vivo(token)) { bad(new Detenido()); return }
      this.esperas.push({ t: this.tiempo + Math.max(0, ms) / 1000 - 1e-9, token, ok, bad, alCumplir })
    })
  }

  /**
   * Espera hasta que `cond` sea verdadera (o pasen `maxSeg` segundos simulados). La condición se revisa
   * en CADA paso de física y `alCumplir` se ejecuta en ese mismo paso (p. ej. apagar motores): así un giro
   * o una distancia terminan en el punto exacto aunque la simulación vaya acelerada.
   */
  hasta(token: number, cond: () => boolean, maxSeg = Infinity, alCumplir?: () => void): Promise<void> {
    return new Promise((ok, bad) => {
      if (!this.vivo(token)) { bad(new Detenido()); return }
      if (cond()) { alCumplir?.(); ok(); return }
      this.esperas.push({ t: this.tiempo + maxSeg, token, ok, bad, cond, alCumplir })
    })
  }

  /** Convierte potencia (-100..100) a velocidad lineal de rueda (cm/s). */
  velDe(pot: number): number { return Math.max(-100, Math.min(100, pot)) / 100 * this.velMax }

  // --------------------------------------------------------- integración física
  /** Avanza un paso de simulación de `dt` segundos. */
  tick(dt: number = PASO) {
    if (!this.activo) return
    this.tiempo += dt
    const t = this.tapete
    if (!this.caido) {
      const v = (this.vL + this.vR) / 2
      const omega = (this.vL - this.vR) / this.distRuedas
      const x0 = this.x, z0 = this.z
      let cx = this.x + Math.cos(this.ang) * v * dt
      let cz = this.z + Math.sin(this.ang) * v * dt
      this.ang += omega * dt
      this.gradosL += (this.vL * dt) / (2 * Math.PI * this.radioRueda) * 360
      this.gradosR += (this.vR * dt) / (2 * Math.PI * this.radioRueda) * 360

      let choca = false
      let empuja = false
      if (t) {
        const R = this.radioRobot
        // rivales que persiguen al robot
        for (const m of this.moviles) {
          if (m.tipo !== 'rival' || !m.vel || m.fuera) continue
          const dx = cx - m.x, dz = cz - m.z, d = Math.hypot(dx, dz)
          if (d > 0.001) { m.x += dx / d * m.vel * dt; m.z += dz / d * m.vel * dt; m.ang = Math.atan2(dz, dx) }
        }
        // empujar objetos móviles: gana el que empuja con más velocidad
        for (const m of this.moviles) {
          if (m.fuera) continue // ya cayó de la tarima
          const dx = m.x - cx, dz = m.z - cz, d = Math.hypot(dx, dz)
          const min = R + m.r
          if (d >= min || d < 0.0001) continue
          const nx = dx / d, nz = dz / d, sobra = min - d
          const mia = Math.max(0, (Math.cos(this.ang) * nx + Math.sin(this.ang) * nz) * v) + 1
          const suya = m.tipo === 'rival' ? (m.fuera ? 0 : (m.vel || 0)) + 6 : 0
          const parteMia = suya / (mia + suya)
          cx -= nx * sobra * parteMia; cz -= nz * sobra * parteMia
          // lo que está delante del robot se empuja hacia donde el robot avanza (como una pala plana):
          // así no se resbala hacia un lado
          const fx = Math.cos(this.ang), fz = Math.sin(this.ang), frente = fx * nx + fz * nz
          const mueve = sobra * (1 - parteMia)
          if (v > 0 && frente > 0.5) { m.x += fx * mueve / frente; m.z += fz * mueve / frente }
          else { m.x += nx * mueve; m.z += nz * mueve }
          empuja = true
        }
        // paredes del campo
        if (t.paredes !== false) {
          const maxX = t.ancho / 2 - R, maxZ = t.alto / 2 - R
          if (cx > maxX) { cx = maxX; choca = true } else if (cx < -maxX) { cx = -maxX; choca = true }
          if (cz > maxZ) { cz = maxZ; choca = true } else if (cz < -maxZ) { cz = -maxZ; choca = true }
        }
        for (const o of t.obstaculos) {
          const dx = cx - o.x, dz = cz - o.z
          const d = Math.hypot(dx, dz)
          const min = R + o.r
          if (d < min && d > 0.0001) { const k = min / d; cx = o.x + dx * k; cz = o.z + dz * k; choca = true }
        }
        for (const w of t.muros || []) {
          const px = Math.max(w.x - w.w / 2, Math.min(cx, w.x + w.w / 2))
          const pz = Math.max(w.z - w.h / 2, Math.min(cz, w.z + w.h / 2))
          const dx = cx - px, dz = cz - pz, d = Math.hypot(dx, dz)
          if (d >= R) continue
          if (d > 0.0001) { cx = px + dx / d * R; cz = pz + dz / d * R }
          else { // el centro quedó dentro del muro: sale por el lado más cercano
            const sx = w.w / 2 - Math.abs(cx - w.x), sz = w.h / 2 - Math.abs(cz - w.z)
            if (sx < sz) cx = w.x + Math.sign(cx - w.x || 1) * (w.w / 2 + R); else cz = w.z + Math.sign(cz - w.z || 1) * (w.h / 2 + R)
          }
          choca = true
        }
        // ring de sumo
        if (t.ring) {
          // un objeto cae cuando ya tiene más de medio cuerpo fuera de la tarima
          for (const m of this.moviles) if (!m.fuera && Math.hypot(m.x - t.ring.x, m.z - t.ring.z) > t.ring.r - m.r / 2) m.fuera = true
          if (Math.hypot(cx - t.ring.x, cz - t.ring.z) > t.ring.r + 2) { this.caido = true; this.vL = this.vR = 0 }
        }
        // puntos de control, en orden
        const p = t.puntos?.[this.puntosHechos]
        if (p && Math.hypot(cx - p.x, cz - p.z) <= p.r) this.puntosHechos++
      }
      this.x = cx; this.z = cz
      this.recorrido += Math.hypot(cx - x0, cz - z0)
      if (choca && !this.tocando) this.golpes++
      this.tocando = choca || empuja
    }
    this.sucio = true
    this.alPaso?.()
    if (!this.activo) return
    // despertar al programa
    if (this.esperas.length) {
      const lista = (e: Espera) => e.t <= this.tiempo || (e.cond ? e.cond() : false)
      const listas = this.esperas.filter(lista)
      if (listas.length) {
        this.esperas = this.esperas.filter(e => !listas.includes(e))
        for (const e of listas) { e.alCumplir?.(); e.ok() }
      }
    }
  }

  // --------------------------------------------------------------- sensores
  /** Punto del piso bajo un sensor: adelante `offsetSensor` y `lateral` cm a la derecha. */
  private bajoSensor(lateral = 0) {
    const c = Math.cos(this.ang), s = Math.sin(this.ang)
    return { x: this.x + c * this.offsetSensor - s * lateral, z: this.z + s * this.offsetSensor + c * lateral }
  }

  /** Posición lateral del sensor de línea n (1 = el de más a la izquierda); null si el robot no lo tiene. */
  private lateralDe(n: number): number | null {
    const i = Math.round(n) - 1
    return i >= 0 && i < this.lineas.length ? this.lineas[i] : null
  }

  /** Color bajo el sensor de color (si el robot tiene varios, el punto medio entre ellos). */
  color(): string {
    const f = this.bajoSensor(this.lineas.length === 1 ? this.lineas[0] : 0)
    return this.leerColorEn(f.x, f.z)
  }

  /** Color que ve el sensor de línea n. */
  colorLinea(n: number): string {
    const lat = this.lateralDe(n)
    if (lat === null) return 'blanco'
    const f = this.bajoSensor(lat)
    return this.leerColorEn(f.x, f.z)
  }

  /** Luz reflejada (0 = negro, 100 = blanco) del sensor de línea n: promedia una zona pequeña, como el sensor real. */
  luz(n: number): number {
    const lat = this.lateralDe(n)
    if (lat === null) return 100
    const f = this.bajoSensor(lat)
    const r = 0.7
    let suma = this.leerLuzEn(f.x, f.z) * 2
    suma += this.leerLuzEn(f.x + r, f.z) + this.leerLuzEn(f.x - r, f.z) + this.leerLuzEn(f.x, f.z + r) + this.leerLuzEn(f.x, f.z - r)
    return Math.round(suma / 6)
  }

  /** Distancia a lo más cercano que hay enfrente (cm). */
  distancia(): number {
    const t = this.tapete
    const dx = Math.cos(this.ang), dz = Math.sin(this.ang)
    const ox = this.x + dx * this.offsetSensor
    const oz = this.z + dz * this.offsetSensor
    let mejor = MAX_DIST
    const circulo = (cx: number, cz: number, r: number) => {
      const fx = ox - cx, fz = oz - cz
      const b = 2 * (fx * dx + fz * dz)
      const c = fx * fx + fz * fz - r * r
      const disc = b * b - 4 * c
      if (disc >= 0) { const s = (-b - Math.sqrt(disc)) / 2; if (s > 0) mejor = Math.min(mejor, s) }
    }
    const caja = (x0: number, x1: number, z0: number, z1: number) => {
      let a = -Infinity, b = Infinity
      for (const [o, d, lo, hi] of [[ox, dx, x0, x1], [oz, dz, z0, z1]] as const) {
        if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return } else {
          const t1 = (lo - o) / d, t2 = (hi - o) / d
          a = Math.max(a, Math.min(t1, t2)); b = Math.min(b, Math.max(t1, t2))
        }
      }
      if (a <= b && a > 0) mejor = Math.min(mejor, a)
    }
    if (t) {
      if (t.paredes !== false) {
        const bx = t.ancho / 2, bz = t.alto / 2
        for (const d of [dx > 0 ? (bx - ox) / dx : Infinity, dx < 0 ? (-bx - ox) / dx : Infinity, dz > 0 ? (bz - oz) / dz : Infinity, dz < 0 ? (-bz - oz) / dz : Infinity]) {
          if (d > 0) mejor = Math.min(mejor, d)
        }
      }
      for (const o of t.obstaculos) circulo(o.x, o.z, o.r)
      for (const w of t.muros || []) caja(w.x - w.w / 2, w.x + w.w / 2, w.z - w.h / 2, w.z + w.h / 2)
    }
    for (const m of this.moviles) if (!m.fuera) circulo(m.x, m.z, m.r)
    return Math.max(0, Math.min(MAX_DIST, Math.round(mejor)))
  }

  tactil(): boolean { return this.tocando }

  /** Ángulo del giroscopio en grados (0..360, horario desde el inicio). */
  angulo(): number {
    const t = this.tapete
    const base = (t?.inicio.ang ?? 0) * RAD
    let g = (this.ang - base) * DEG
    g = ((g % 360) + 360) % 360
    return Math.round(g) % 360
  }

  enMeta(): boolean {
    const m = this.tapete?.meta
    if (!m) return false
    return Math.hypot(this.x - m.x, this.z - m.z) <= m.r
  }

  quieto(): boolean { return Math.abs(this.vL) + Math.abs(this.vR) < 1 }
}
