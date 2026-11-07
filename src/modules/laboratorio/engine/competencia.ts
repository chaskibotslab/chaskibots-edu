// Competencias de sumo y minisumo (F5): rival de práctica + juez.
//
// El rival es un robot de verdad (mismas piezas y la misma física que el del
// alumno) pero su "cerebro" está escrito aquí, en TypeScript, en lugar de un
// programa emulado: así no gasta un segundo microcontrolador. Lee sus
// sensores con la misma función que el robot del alumno (leerSensores).
//
// El juez aplica el reglamento del aula:
//   · cada ronda empieza con una cuenta de 5 s: el robot del alumno debe
//     esperar quieto (su programa hace delay(5000)); si se mueve antes, es
//     salida en falso y el punto es del rival;
//   · pierde la ronda el robot que sale del dohyo (su centro pasa el borde o
//     cae por debajo de la plataforma); si salen los dos, nadie suma;
//   · si nadie sale en el tiempo de la ronda, es empate;
//   · gana el combate quien llega a 2 puntos; como mucho se juegan 3 rondas.
//
// Battlebots (arena de combate): un solo combate de 2 minutos. Cada robot
// empieza con 100 de vida y la pierde con los golpes del arma del otro (la
// energía que descarga la barra al tocarlo). Pierde por KO quien se queda sin
// vida, cae al pozo o pasa 10 s sin moverse (dado vuelta, trabado). Si nadie
// cae, gana quien tiene más vida al final.
// La usan la simulación del navegador (simulation.ts) y la de los tests
// (simSincrona.ts), así el juez es el mismo en los dos lados.

import RAPIER from '@dimforge/rapier3d-compat'
import type { ArenaDef, ReglamentoSumo } from '../arenas/tipos'
import type { RobotDoc } from '../robots/doc'
import type { PinReport } from './avrRunner'
import type { Mundo } from './fisica/mundo'
import { RobotFisico } from './fisica/robotFisico'
import type { Pose2D } from './tracks'
import { leerSensores, type FuncionReflectancia, type LecturaSensor } from './paso'
import { planDe, type SimPlan } from './plan'

// ---------------------------------------------------------------------------
// Rival de práctica
// ---------------------------------------------------------------------------

export type NivelRival = 'quieto' | 'empujador' | 'cazador'

export const NIVELES_RIVAL: Record<NivelRival, { nombre: string; descripcion: string }> = {
  quieto: { nombre: 'Quieto', descripcion: 'No se mueve: sirve para practicar cómo encontrarlo y empujarlo.' },
  empujador: { nombre: 'Empujador', descripcion: 'Va siempre hacia adelante a media velocidad y esquiva el borde.' },
  cazador: { nombre: 'Cazador', descripcion: 'Busca girando, ataca a toda velocidad cuando te ve y huye del borde.' },
}

/** Los mismos niveles en la arena de combate. */
export const NIVELES_RIVAL_COMBATE: Record<NivelRival, { nombre: string; descripcion: string }> = {
  quieto: { nombre: 'Quieto', descripcion: 'No se mueve, pero su arma gira: practica cómo acercarte sin que te golpee.' },
  empujador: { nombre: 'Empujador', descripcion: 'Te persigue despacio con el arma apagada: solo empuja con la cuña.' },
  cazador: { nombre: 'Cazador', descripcion: 'Te persigue rápido con el arma a fondo.' },
}

/** Energía (J) → daño: un golpe con la barra a fondo quita unos 12 puntos. */
const DANO_POR_JOULE = 5
/** Parte de la energía de la barra que se lleva el robot golpeado (el resto es ruido, chispas y rebote). */
const TRANSFERENCIA = 0.15

/**
 * Golpes del arma de `atacante` sobre `victima`: si la barra girando alcanza su
 * planta, descarga parte de su energía como un empujón (hacia afuera, en el
 * sentido del giro y un poco hacia arriba), frena la barra y devuelve el daño.
 */
/** ¿Algún colisionador de `a` está en contacto con uno de `b`? */
function seTocan(a: RobotFisico, b: RobotFisico): boolean {
  const w = a.mundo.world
  let toca = false
  for (let i = 0; i < a.body.numColliders() && !toca; i++) {
    const c = a.body.collider(i)
    w.contactPairsWith(c, o => {
      if (toca || o.parent()?.handle !== b.body.handle) return
      w.contactPair(c, o, m => { if (m.numContacts() > 0) toca = true })
    })
  }
  return toca
}

/** Producto de cuaterniones a·b (girar primero con b y después con a). */
function multQ(a: { x: number; y: number; z: number; w: number }, b: { x: number; y: number; z: number; w: number }) {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  }
}

export function golpesArma(atacante: RobotFisico, victima: RobotFisico): number {
  let dano = 0
  const world = atacante.mundo.world
  for (const a of atacante.armas) {
    if (a.espera > 0 || a.omega < 60) continue
    const c = atacante.puntoMundo({ x: a.centro.x * 1000, y: a.centro.y * 1000, z: a.centro.z * 1000 })
    // ¿Lo que barre el arma (un poco más grande) toca alguna pieza del rival?
    // Acostada: un disco fino en su plano. De pie: un cilindro a lo largo del eje lateral.
    const q = atacante.body.rotation()
    const rot = a.vertical ? multQ(q, { x: Math.SQRT1_2, y: 0, z: 0, w: Math.SQRT1_2 }) : q
    const forma = a.vertical ? new RAPIER.Cylinder(a.ancho / 2 + 0.005, a.radio + 0.012) : new RAPIER.Cylinder(0.012, a.radio + 0.012)
    let toca = false
    world.intersectionsWithShape(c, rot, forma, col => {
      if (col.parent()?.handle === victima.body.handle) { toca = true; return false }
      return true
    }, undefined, undefined, undefined, atacante.body)
    if (!toca) continue
    const v = victima.body.translation()
    const dx = v.x - c.x, dz = v.z - c.z
    const d = Math.hypot(dx, dz) || 1
    const energia = 0.5 * a.inercia * a.omega * a.omega * TRANSFERENCIA
    const j = Math.sqrt(2 * victima.masa * energia)
    const rx = dx / d, rz = dz / d
    // Acostada: hacia afuera del eje y en el sentido del giro (antihorario visto desde arriba).
    // De pie: el frente del arma sube, así que lanza al rival hacia adelante y arriba.
    const f = atacante.direccionMundo({ x: 1, y: 0, z: 0 })
    const dir = a.vertical
      ? { x: f.x * 0.5 + rx * 0.15, y: 0.85, z: f.z * 0.5 + rz * 0.15 }
      : { x: rx * 0.75 + rz * 0.5, y: 0.35, z: rz * 0.75 - rx * 0.5 }
    const n = Math.hypot(dir.x, dir.y, dir.z)
    victima.body.applyImpulse({ x: (dir.x / n) * j, y: (dir.y / n) * j, z: (dir.z / n) * j }, true)
    atacante.body.applyImpulse({ x: -rx * j * 0.4, y: 0, z: -rz * j * 0.4 }, true)
    a.omega *= 0.45
    a.espera = 0.25
    dano += energia * DANO_POR_JOULE
  }
  return dano
}

/** Lo que el rival decide en cada momento: velocidad de cada lado de −1 a 1. */
interface Orden { izq: number; der: number }

/** Maniobra en curso (retroceder del borde, girar…) y hasta cuándo dura. */
interface Maniobra { orden: Orden; hasta: number; siguiente?: { orden: Orden; dura: number } }

export class Rival {
  readonly doc: RobotDoc
  readonly plan: SimPlan
  readonly fisica: RobotFisico
  readonly nivel: NivelRival
  private lecturas: LecturaSensor[] = []
  private maniobra: Maniobra | null = null
  private readonly montajeDe: Map<string, string>
  private readonly vMax: number
  /** En la arena de combate persigue al alumno (sabe dónde está) en vez de leer el borde. */
  private readonly combate: boolean
  /** Pozo de la arena de combate: el rival lo esquiva. */
  private readonly pozo: ArenaDef['pozo']

  constructor(mundo: Mundo, doc: RobotDoc, nivel: NivelRival, inicio: Pose2D, combate = false, pozo?: ArenaDef['pozo']) {
    this.doc = doc
    this.combate = combate
    this.pozo = pozo
    this.nivel = nivel
    this.plan = planDe(doc)
    this.fisica = new RobotFisico(mundo, doc, this.plan, inicio)
    this.montajeDe = new Map(doc.piezas.map(p => [p.id, p.padre?.montaje ?? '']))
    this.vMax = Math.max(0, this.plan.voltajeBateria - this.plan.caidaDriver)
  }

  // Lo que necesita Robot3D para dibujarlo (igual que una Simulacion).
  get pinesActuales(): Record<string, PinReport> { return {} }
  get lecturasActuales(): LecturaSensor[] { return this.lecturas }

  colocar(p: Pose2D) { this.fisica.colocar(p); this.maniobra = null }

  /** Lee sus sensores y pone el voltaje de cada rueda. `activo` = la ronda está en juego. */
  pensar(t: number, reflectancia: FuncionReflectancia, activo: boolean, objetivo?: RobotFisico) {
    this.lecturas = leerSensores(this.plan, this.doc, this.fisica, reflectancia).lecturas
    const o = !activo ? { izq: 0, der: 0 } : this.combate && objetivo ? this.perseguir(objetivo) : this.decidir(t)
    for (const a of this.fisica.armas) a.acelerador = activo && this.nivel !== 'empujador' ? 1 : 0
    for (const r of this.fisica.ruedas) {
      const m = this.plan.motores.find(x => x.instancia === r.motor)
      r.volts = (m?.rueda && m.rueda.centro.z < 0 ? o.izq : o.der) * this.vMax
    }
  }

  /** Combate: gira hacia el alumno y avanza derecho cuando lo tiene de frente. */
  private perseguir(objetivo: RobotFisico): Orden {
    if (this.nivel === 'quieto') return { izq: 0, der: 0 }
    const potencia = this.nivel === 'cazador' ? 1 : 0.5
    const yo = this.fisica.pose(), otro = objetivo.pose().pos
    let rumbo = Math.atan2(-(otro.z - yo.pos.z), otro.x - yo.pos.x)
    // Cerca del pozo: se aleja de él antes de seguir persiguiendo.
    const p = this.pozo
    if (p && Math.hypot(yo.pos.x - p.x, yo.pos.z - p.z) < p.lado * 1.1) rumbo = Math.atan2(-(yo.pos.z - p.z), yo.pos.x - p.x)
    let e = rumbo - yo.yaw
    e = Math.atan2(Math.sin(e), Math.cos(e))
    if (Math.abs(e) > 0.6) return e > 0 ? { izq: -potencia * 0.7, der: potencia * 0.7 } : { izq: potencia * 0.7, der: -potencia * 0.7 }
    const k = e * 1.2
    return { izq: potencia * (1 - Math.max(0, k)), der: potencia * (1 + Math.min(0, k)) }
  }

  private decidir(t: number): Orden {
    if (this.nivel === 'quieto') return { izq: 0, der: 0 }
    const potencia = this.nivel === 'cazador' ? 1 : 0.6

    // Una maniobra en curso manda (salir del borde dura unas décimas).
    if (this.maniobra) {
      if (t < this.maniobra.hasta) return this.maniobra.orden
      const s = this.maniobra.siguiente
      this.maniobra = s ? { orden: s.orden, hasta: t + s.dura } : null
      if (this.maniobra) return this.maniobra.orden
    }

    // Borde blanco: retroceder y girar hacia adentro.
    const borde = (montaje: string) => this.lecturas.some(l => l.tipo === 'linea' && this.montajeDe.get(l.instancia) === montaje && l.reflectancia >= 0.5)
    const bIzq = borde('piso-izq'), bDer = borde('piso-der')
    if (bIzq || bDer) {
      const giro = bIzq ? { izq: potencia, der: -potencia } : { izq: -potencia, der: potencia }
      this.maniobra = { orden: { izq: -potencia, der: -potencia }, hasta: t + 0.25, siguiente: { orden: giro, dura: 0.3 } }
      return this.maniobra.orden
    }

    if (this.nivel === 'empujador') return { izq: potencia, der: potencia }

    // Cazador: ¿dónde está el oponente?
    const ve = (montaje: string) => this.lecturas.some(l =>
      this.montajeDe.get(l.instancia) === montaje &&
      ((l.tipo === 'obstaculo' && l.detecta) || (l.tipo === 'ultrasonido' && l.cm !== null && l.cm < 70)))
    if (ve('frente')) return { izq: 1, der: 1 }
    if (ve('frente-izq')) return { izq: 0.2, der: 1 }
    if (ve('frente-der')) return { izq: 1, der: 0.2 }
    // Buscar: gira en el lugar y cada tanto avanza un poco.
    return t % 1.6 < 1.2 ? { izq: 0.55, der: -0.55 } : { izq: 0.5, der: 0.5 }
  }
}

// ---------------------------------------------------------------------------
// Juez
// ---------------------------------------------------------------------------

export type Lado = 'alumno' | 'rival'

export interface EstadoCombate {
  /** espera = todavía no se cargó un programa; cuenta = los 5 s de espera. */
  fase: 'espera' | 'cuenta' | 'combate' | 'pausa' | 'final'
  ronda: number
  salida: string
  /** Segundos que faltan para que termine la fase (cuenta, combate o pausa). */
  restante: number
  marcador: Record<Lado, number>
  /** Resultado de la última ronda terminada. */
  ultima: { ganador: Lado | 'empate'; motivo: string } | null
  ganador: Lado | 'empate' | null
  /** Battlebot: vida que le queda a cada uno (0–100). */
  vida?: Record<Lado, number>
}

const PAUSA_S = 3
const SALIDA_EN_FALSO_M = 0.03

export class Competencia {
  readonly reglamento: ReglamentoSumo
  readonly rival: Rival
  private readonly arena: ArenaDef
  private readonly alumno: RobotFisico
  private reflectancia: FuncionReflectancia
  private t = 0
  private finFase = 0
  private origenAlumno = { x: 0, z: 0 }
  private quieto: Record<Lado, number> = { alumno: 0, rival: 0 }
  /** Segundos que los dos robots llevan trabados uno contra otro (battlebot). */
  private trabados = 0
  readonly estado: EstadoCombate

  constructor(mundo: Mundo, arena: ArenaDef, alumno: RobotFisico, rivalDoc: RobotDoc, nivel: NivelRival, reflectancia: FuncionReflectancia) {
    if (!arena.competencia) throw new Error('La arena no es de competencia')
    this.arena = arena
    this.reglamento = arena.competencia
    this.alumno = alumno
    this.reflectancia = reflectancia
    const s = this.reglamento.salidas[0]
    this.rival = new Rival(mundo, rivalDoc, nivel, s.rival, this.reglamento.tipo === 'battlebot', arena.pozo)
    alumno.colocar(s.alumno)
    this.estado = { fase: 'espera', ronda: 1, salida: s.nombre, restante: 0, marcador: { alumno: 0, rival: 0 }, ultima: null, ganador: null }
    if (this.reglamento.vida) this.estado.vida = { alumno: this.reglamento.vida, rival: this.reglamento.vida }
  }

  get robots(): RobotFisico[] { return [this.rival.fisica] }

  /** Empieza un combate nuevo (al cargar el programa del alumno). */
  empezar() {
    this.estado.marcador = { alumno: 0, rival: 0 }
    if (this.reglamento.vida) this.estado.vida = { alumno: this.reglamento.vida, rival: this.reglamento.vida }
    this.estado.ultima = null
    this.estado.ganador = null
    this.prepararRonda(1)
  }

  /** Sin programa: los robots quedan en sus salidas y el juez espera. */
  detener() {
    this.estado.fase = 'espera'
    this.estado.restante = 0
  }

  /** Antes del paso de física: el rival piensa. */
  antes() {
    this.rival.pensar(this.t, this.reflectancia, this.estado.fase === 'combate', this.alumno)
  }

  /**
   * Después del paso de física: el juez mira. Devuelve 'nueva-ronda' cuando
   * hay que reiniciar el programa del alumno (los robots ya están en sus salidas).
   */
  despues(dt: number): 'nueva-ronda' | null {
    this.t += dt
    const e = this.estado
    e.restante = Math.max(0, this.finFase - this.t)
    if (e.fase === 'cuenta') {
      const p = this.alumno.pose().pos
      if (Math.hypot(p.x - this.origenAlumno.x, p.z - this.origenAlumno.z) > SALIDA_EN_FALSO_M) {
        this.terminarRonda('rival', `Salida en falso: tu robot se movió antes de los ${this.reglamento.espera} s`)
      } else if (this.t >= this.finFase) {
        e.fase = 'combate'
        this.finFase = this.t + this.reglamento.duracionRonda
      }
    } else if (e.fase === 'combate' && this.reglamento.tipo === 'battlebot') {
      this.juzgarCombate(dt)
    } else if (e.fase === 'combate') {
      const fueraA = this.fuera(this.alumno), fueraR = this.fuera(this.rival.fisica)
      if (fueraA && fueraR) this.terminarRonda('empate', 'Salieron los dos a la vez')
      else if (fueraR) this.terminarRonda('alumno', '¡Sacaste al rival del dohyo!')
      else if (fueraA) this.terminarRonda('rival', 'Tu robot salió del dohyo')
      else if (this.t >= this.finFase) this.terminarRonda('empate', 'Se acabó el tiempo sin que nadie saliera')
    } else if (e.fase === 'pausa' && this.t >= this.finFase) {
      this.prepararRonda(e.ronda + 1)
      return 'nueva-ronda'
    }
    return null
  }

  /** Battlebot: golpes de las armas, pozo, robots inmóviles y tiempo. */
  private juzgarCombate(dt: number) {
    const vida = this.estado.vida!
    vida.rival = Math.max(0, vida.rival - golpesArma(this.alumno, this.rival.fisica))
    vida.alumno = Math.max(0, vida.alumno - golpesArma(this.rival.fisica, this.alumno))
    const inmovil = this.reglamento.inmovilS ?? 10
    // Trabados uno contra otro no cuenta como inmovilizado (como en el reglamento);
    // si siguen así 5 s, el juez los separa y vuelven a sus esquinas.
    const tocan = seTocan(this.alumno, this.rival.fisica)
    const quietos = (f: RobotFisico) => { const v = f.body.linvel(), w = f.body.angvel(); return Math.hypot(v.x, v.z) < 0.02 && Math.abs(w.y) < 0.2 }
    this.trabados = tocan && quietos(this.alumno) && quietos(this.rival.fisica) ? this.trabados + dt : 0
    if (this.trabados >= 5) {
      const s = this.reglamento.salidas[0]
      this.alumno.colocar(s.alumno); this.rival.colocar(s.rival)
      this.trabados = 0
      this.estado.ultima = { ganador: 'empate', motivo: 'Estaban trabados: el juez los separó' }
    }
    for (const [lado, f] of [['alumno', this.alumno], ['rival', this.rival.fisica]] as const) {
      // El rival «quieto» no se mueve a propósito: no cuenta como inmovilizado.
      const aproposito = lado === 'rival' && this.rival.nivel === 'quieto'
      this.quieto[lado] = !aproposito && !tocan && quietos(f) ? this.quieto[lado] + dt : 0
    }
    const ko = (lado: Lado, f: RobotFisico): string | null =>
      vida[lado] <= 0 ? 'se quedó sin vida'
        : f.body.translation().y < -0.15 ? 'cayó al pozo'
          : this.quieto[lado] >= inmovil ? `pasó ${inmovil} s sin moverse` : null
    const koA = ko('alumno', this.alumno), koR = ko('rival', this.rival.fisica)
    if (koA && koR) this.terminarRonda('empate', 'Los dos quedaron fuera de combate')
    else if (koR) this.terminarRonda('alumno', `¡KO! El rival ${koR}`)
    else if (koA) this.terminarRonda('rival', `KO: tu robot ${koA}`)
    else if (this.t >= this.finFase) {
      const g: Lado | 'empate' = vida.alumno > vida.rival + 0.5 ? 'alumno' : vida.rival > vida.alumno + 0.5 ? 'rival' : 'empate'
      this.terminarRonda(g, g === 'empate' ? 'Tiempo: empate en vida' : `Tiempo: gana quien quedó con más vida (${vida.alumno.toFixed(0)} a ${vida.rival.toFixed(0)})`)
    }
  }

  /** Fuera: el centro pasó el borde o el robot cayó por debajo de la plataforma. */
  private fuera(f: RobotFisico) {
    const p = f.body.translation()
    const r = this.arena.dohyo?.radio ?? Infinity
    return Math.hypot(p.x, p.z) > r || p.y < 0
  }

  private prepararRonda(n: number) {
    const e = this.estado
    const s = this.reglamento.salidas[(n - 1) % this.reglamento.salidas.length]
    e.ronda = n
    e.salida = s.nombre
    e.fase = 'cuenta'
    this.alumno.colocar(s.alumno)
    this.rival.colocar(s.rival)
    this.origenAlumno = { x: s.alumno.x, z: s.alumno.z }
    this.quieto = { alumno: 0, rival: 0 }
    this.finFase = this.t + this.reglamento.espera
    e.restante = this.reglamento.espera
  }

  private terminarRonda(ganador: Lado | 'empate', motivo: string) {
    const e = this.estado
    if (ganador !== 'empate') e.marcador[ganador]++
    e.ultima = { ganador, motivo }
    const meta = this.reglamento.puntosParaGanar
    const jugadas = e.ronda
    if (e.marcador.alumno >= meta || e.marcador.rival >= meta || jugadas >= this.reglamento.salidas.length) {
      e.fase = 'final'
      e.ganador = e.marcador.alumno > e.marcador.rival ? 'alumno' : e.marcador.rival > e.marcador.alumno ? 'rival' : 'empate'
      e.restante = 0
      return
    }
    e.fase = 'pausa'
    this.finFase = this.t + PAUSA_S
  }
}

/** ¿El robot cumple el reglamento? Medidas vistas desde arriba (mm) y masa (g). */
export function revisarReglamento(r: ReglamentoSumo, medidas: { largo: number; ancho: number; masa: number }) {
  return [
    { ok: medidas.largo <= r.maxLadoMm + 0.5 && medidas.ancho <= r.maxLadoMm + 0.5, texto: `Medidas ${medidas.largo.toFixed(0)} × ${medidas.ancho.toFixed(0)} mm (máx. ${r.maxLadoMm} × ${r.maxLadoMm})` },
    { ok: medidas.masa <= r.maxMasaG, texto: `Peso ${medidas.masa.toFixed(0)} g (máx. ${r.maxMasaG} g)` },
  ]
}
