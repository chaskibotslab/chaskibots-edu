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
// La usan la simulación del navegador (simulation.ts) y la de los tests
// (simSincrona.ts), así el juez es el mismo en los dos lados.

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

  constructor(mundo: Mundo, doc: RobotDoc, nivel: NivelRival, inicio: Pose2D) {
    this.doc = doc
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
  pensar(t: number, reflectancia: FuncionReflectancia, activo: boolean) {
    this.lecturas = leerSensores(this.plan, this.doc, this.fisica, reflectancia).lecturas
    const o = activo ? this.decidir(t) : { izq: 0, der: 0 }
    for (const r of this.fisica.ruedas) {
      const m = this.plan.motores.find(x => x.instancia === r.motor)
      r.volts = (m?.rueda && m.rueda.centro.z < 0 ? o.izq : o.der) * this.vMax
    }
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
  readonly estado: EstadoCombate

  constructor(mundo: Mundo, arena: ArenaDef, alumno: RobotFisico, rivalDoc: RobotDoc, nivel: NivelRival, reflectancia: FuncionReflectancia) {
    if (!arena.competencia) throw new Error('La arena no es de competencia')
    this.arena = arena
    this.reglamento = arena.competencia
    this.alumno = alumno
    this.reflectancia = reflectancia
    const s = this.reglamento.salidas[0]
    this.rival = new Rival(mundo, rivalDoc, nivel, s.rival)
    alumno.colocar(s.alumno)
    this.estado = { fase: 'espera', ronda: 1, salida: s.nombre, restante: 0, marcador: { alumno: 0, rival: 0 }, ultima: null, ganador: null }
  }

  get robots(): RobotFisico[] { return [this.rival.fisica] }

  /** Empieza un combate nuevo (al cargar el programa del alumno). */
  empezar() {
    this.estado.marcador = { alumno: 0, rival: 0 }
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
    this.rival.pensar(this.t, this.reflectancia, this.estado.fase === 'combate')
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
