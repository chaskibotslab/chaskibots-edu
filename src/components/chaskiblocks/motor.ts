/**
 * ChaskiBlocks IA: motor de ejecución del escenario.
 * Cada pila de bloques que empieza con un bloque de evento es un programa que
 * corre al mismo tiempo que los demás, como en Scratch.
 */
import { ANCHO, ALTO, FONDOS, NOTAS, COLORES_LAPIZ, OBJETOS, PARTES } from './bloques'
import type { MotorIA } from './ia'

export interface SpriteDef {
  id: string
  nombre: string
  disfraces: string[] // un emoji o una imagen (data URL)
  disfraz: number
  x: number
  y: number
  dir: number
  tam: number
  visible: boolean
  rot: 'lr' | 'todo' | 'no'
  bloques: any
}

export interface Proyecto {
  formato: 'chaskiblocks-ia'
  version: 1
  nombre: string
  fondo: string
  sprites: SpriteDef[]
  variables: any[]
  clases: string[]
  entrenamiento?: any
}

export interface ScriptCompilado { spriteId: string; tipo: string; arg: string; fn: (api: any, V: any) => Promise<void> }
interface Hilo extends ScriptCompilado { activo: boolean }
interface Efimero { dice: string; piensa: boolean; lapiz: boolean; color: string; grosor: number }

export class Detenido extends Error {}

/** Emojis dibujados mirando a la izquierda: se voltean para que avancen de frente. */
const MIRA_IZQUIERDA = new Set(['🚗', '🚙', '🚕', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚜', '🚚', '🚲', '🛵', '🏍️', '🚂', '✈️', '🚁', '⛵', '🚤', '🐟', '🐠', '🐬', '🐳', '🦈', '🐢', '🐌', '🐛', '🐜', '🦆', '🐓', '🦖', '🦕', '🐎', '🐕', '🐈', '🐊', '🐘', '🦏', '🐄', '🐖', '🐑', '🐇', '🐁', '🦔', '🐿️'])
export const miraIzquierda = (disfraz: string) => MIRA_IZQUIERDA.has(disfraz)

const limitar = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const numero = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const objetoCoco = (nombre: string) => OBJETOS.find(o => o[1] === nombre || o[0] === nombre)?.[1] || nombre
const NOMBRES_FONDOS = Object.keys(FONDOS)

let audio: AudioContext | null = null
function tono(tipo: OscillatorType, f0: number, f1: number, dur: number, vol = 0.14, retraso = 0) {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    audio = audio || new Ctx()
    const ctx = audio!
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime + retraso
    const osc = ctx.createOscillator(); const gan = ctx.createGain()
    osc.type = tipo
    osc.frequency.setValueAtTime(f0, t)
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur)
    gan.gain.setValueAtTime(vol, t)
    gan.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(gan); gan.connect(ctx.destination)
    osc.start(t); osc.stop(t + dur + 0.02)
  } catch { /* sin audio */ }
}

const SONIDOS: Record<string, { ms: number; tocar: () => void }> = {
  pop: { ms: 120, tocar: () => tono('sine', 520, 180, 0.1, 0.2) },
  moneda: { ms: 260, tocar: () => { tono('square', 988, 988, 0.08, 0.08); tono('square', 1319, 1319, 0.2, 0.08, 0.08) } },
  campana: { ms: 500, tocar: () => { tono('triangle', 880, 880, 0.6, 0.16); tono('sine', 1760, 1760, 0.4, 0.05) } },
  'láser': { ms: 250, tocar: () => tono('sawtooth', 1400, 180, 0.24, 0.08) },
  salto: { ms: 220, tocar: () => tono('square', 260, 720, 0.2, 0.07) },
  alarma: { ms: 620, tocar: () => { for (let i = 0; i < 3; i++) { tono('square', 880, 880, 0.1, 0.07, i * 0.2); tono('square', 660, 660, 0.1, 0.07, i * 0.2 + 0.1) } } },
  tambor: { ms: 200, tocar: () => tono('sine', 160, 45, 0.18, 0.35) },
}

export class Motor {
  sprites: SpriteDef[] = []
  fondo = 'cielo'
  V: Record<string, any> = {}
  ef = new Map<string, Efimero>()
  activo = false
  hilosVivos = 0
  teclas = new Set<string>()
  raton = { x: 0, y: 0, abajo: false }
  pregunta: { texto: string; responder: (r: string) => void } | null = null
  respuesta = ''
  video = false
  videoOpacidad = 0.7
  ctx: CanvasRenderingContext2D | null = null
  sucio = true
  alError: (mensaje: string) => void = () => {}
  /** Se llama cuando un programa pide la cámara o un modelo de IA. */
  alPedirCamara: () => void = () => {}

  private ficha = 0
  private hilos: Hilo[] = []
  private t0 = 0
  private reloj: any = null
  private claseAnterior = ''

  constructor(public ia: MotorIA) {}

  efimero(id: string): Efimero {
    let e = this.ef.get(id)
    if (!e) { e = { dice: '', piensa: false, lapiz: false, color: COLORES_LAPIZ.azul, grosor: 3 }; this.ef.set(id, e) }
    return e
  }

  /** Media caja de choque del personaje, en pasos del escenario. */
  radio(s: SpriteDef) { return Math.max(6, 20 * s.tam / 100) }

  // -------------------------------------------------------------- ciclo de vida
  iniciar(scripts: ScriptCompilado[]) {
    this.detener()
    this.ficha++
    this.activo = true
    this.hilos = scripts.map(s => ({ ...s, activo: false }))
    this.hilosVivos = 0
    this.t0 = performance.now()
    this.respuesta = ''
    this.claseAnterior = ''
    for (const h of this.hilos) if (h.tipo === 'ev_bandera') this.lanzar(h)
    // Bloques «cuando la IA vea…»: se disparan al cambiar la clase reconocida
    this.reloj = setInterval(() => {
      const c = this.ia.clase
      if (c && c !== this.claseAnterior) for (const h of this.hilos) if (h.tipo === 'ia_cuando_ve' && h.arg === c) this.lanzar(h)
      this.claseAnterior = c
    }, 100)
    this.sucio = true
  }

  detener() {
    this.ficha++
    this.activo = false
    this.hilos = []
    this.hilosVivos = 0
    this.teclas.clear()
    clearInterval(this.reloj)
    if (this.pregunta) { const p = this.pregunta; this.pregunta = null; p.responder('') }
    for (const e of this.ef.values()) { e.dice = ''; e.piensa = false }
    try { window.speechSynthesis?.cancel() } catch { /* sin voz */ }
    this.ia.dejarDeEscuchar()
    this.sucio = true
  }

  private lanzar(h: Hilo): Promise<void> {
    if (h.activo) return Promise.resolve()
    const sprite = this.sprites.find(s => s.id === h.spriteId)
    if (!sprite) return Promise.resolve()
    const t = this.ficha
    h.activo = true
    this.hilosVivos++
    return Promise.resolve()
      .then(() => h.fn(this.crearApi(sprite, t), this.V))
      .catch((e: any) => { if (!(e instanceof Detenido) && this.ficha === t) this.alError(`Un programa de «${sprite.nombre}» se detuvo: ${e?.message || e}`) })
      .finally(() => { h.activo = false; if (this.ficha === t) { this.hilosVivos--; this.sucio = true } })
  }

  // ------------------------------------------------------- eventos del usuario
  teclaAbajo(k: string) {
    if (!this.activo) return
    const nueva = !this.teclas.has(k)
    this.teclas.add(k)
    if (nueva) for (const h of this.hilos) if (h.tipo === 'ev_tecla' && (h.arg === k || h.arg === 'cualquiera')) this.lanzar(h)
  }
  teclaArriba(k: string) { this.teclas.delete(k) }
  clic(spriteId: string) {
    if (!this.activo) return
    for (const h of this.hilos) if (h.tipo === 'ev_clic' && h.spriteId === spriteId) this.lanzar(h)
  }

  // ------------------------------------------------------------------- lápiz
  borrarLapiz() { this.ctx?.clearRect(0, 0, ANCHO, ALTO) }
  private trazo(s: SpriteDef, x0: number, y0: number) {
    const e = this.efimero(s.id)
    if (!e.lapiz || !this.ctx) return
    const c = this.ctx
    c.strokeStyle = e.color; c.lineWidth = e.grosor; c.lineCap = 'round'
    c.beginPath(); c.moveTo(ANCHO / 2 + x0, ALTO / 2 - y0); c.lineTo(ANCHO / 2 + s.x, ALTO / 2 - s.y); c.stroke()
  }

  private mover(s: SpriteDef, x: number, y: number) {
    const x0 = s.x, y0 = s.y
    s.x = limitar(numero(x), -ANCHO / 2, ANCHO / 2)
    s.y = limitar(numero(y), -ALTO / 2, ALTO / 2)
    this.trazo(s, x0, y0)
    this.sucio = true
  }

  private objetivo(s: SpriteDef, o: string): { x: number; y: number; r: number } | null {
    if (o === '_puntero') return { x: this.raton.x, y: this.raton.y, r: 2 }
    const otro = this.sprites.find(p => p.nombre === o && p.id !== s.id)
    return otro && otro.visible ? { x: otro.x, y: otro.y, r: this.radio(otro) } : null
  }

  // ------------------------------------------------- lo que pueden hacer los bloques
  private crearApi(s: SpriteDef, t: number) {
    const m = this
    const ia = this.ia
    const e = this.efimero(s.id)
    const pausa = (ms: number) => new Promise<void>((ok, mal) => setTimeout(() => (m.ficha !== t ? mal(new Detenido()) : ok()), ms))
    const cuadro = () => pausa(33)
    const pedirCamara = () => { if (ia.camara === 'apagada') m.alPedirCamara() }
    const parte = (p: string) => ia.cuerpo[PARTES.find(x => x[1] === p || x[0] === p)?.[1] || p]
    const vistos = (o: string) => ia.objetos.filter(x => x.clase === objetoCoco(o))

    return {
      tick: cuadro,
      esperar: (seg: unknown) => pausa(Math.max(0, numero(seg)) * 1000),
      detenerTodo: () => { m.detener() },
      poner: (cambios: Partial<SpriteDef>) => { Object.assign(s, cambios); m.sucio = true },

      // movimiento
      x: () => Math.round(s.x), y: () => Math.round(s.y), dir: () => s.dir,
      mover: (pasos: unknown) => { const r = (90 - s.dir) * Math.PI / 180; m.mover(s, s.x + Math.cos(r) * numero(pasos), s.y + Math.sin(r) * numero(pasos)) },
      girar: (g: unknown) => { let d = (s.dir + numero(g)) % 360; if (d > 180) d -= 360; if (d <= -180) d += 360; s.dir = d; m.sucio = true },
      apuntar: (g: unknown) => { let d = numero(g) % 360; if (d > 180) d -= 360; if (d <= -180) d += 360; s.dir = d; m.sucio = true },
      apuntarHacia: (o: string) => { const p = m.objetivo(s, o); if (p) { s.dir = Math.round(90 - Math.atan2(p.y - s.y, p.x - s.x) * 180 / Math.PI); if (s.dir > 180) s.dir -= 360; m.sucio = true } },
      irXY: (x: unknown, y: unknown) => m.mover(s, numero(x), numero(y)),
      irA: (a: string) => {
        if (a === 'azar') m.mover(s, Math.round((Math.random() - 0.5) * (ANCHO - 60)), Math.round((Math.random() - 0.5) * (ALTO - 60)))
        else if (a === 'puntero') m.mover(s, m.raton.x, m.raton.y)
        else m.mover(s, 0, 0)
      },
      deslizar: async (seg: unknown, x: unknown, y: unknown) => {
        const ms = Math.max(0, numero(seg)) * 1000, x0 = s.x, y0 = s.y, x1 = numero(x), y1 = numero(y), ini = performance.now()
        while (performance.now() - ini < ms) { const k = (performance.now() - ini) / ms; m.mover(s, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); await cuadro() }
        m.mover(s, x1, y1)
      },
      rebotar: () => {
        const r = m.radio(s); let d = s.dir
        if (s.x + r > ANCHO / 2 || s.x - r < -ANCHO / 2) d = -d
        if (s.y + r > ALTO / 2 || s.y - r < -ALTO / 2) d = 180 - d
        if (d !== s.dir) {
          if (d > 180) d -= 360; if (d <= -180) d += 360
          s.dir = d
          m.mover(s, limitar(s.x, -ANCHO / 2 + r, ANCHO / 2 - r), limitar(s.y, -ALTO / 2 + r, ALTO / 2 - r))
        }
      },

      // apariencia
      decir: async (texto: unknown, seg?: unknown, piensa = false) => {
        const txt = typeof texto === 'number' ? String(Math.round(texto * 100) / 100) : String(texto ?? '')
        e.dice = txt; e.piensa = piensa; m.sucio = true
        if (seg === undefined) return
        await pausa(Math.max(0.1, numero(seg)) * 1000)
        if (e.dice === txt) { e.dice = ''; m.sucio = true }
      },
      numDisfraz: () => s.disfraz + 1,
      disfraz: (n: unknown) => { const total = s.disfraces.length || 1; s.disfraz = (((Math.round(numero(n)) - 1) % total) + total) % total; m.sucio = true },
      fondo: (f: string) => { if (FONDOS[f]) { m.fondo = f; m.sucio = true } },
      fondoSiguiente: () => { m.fondo = NOMBRES_FONDOS[(NOMBRES_FONDOS.indexOf(m.fondo) + 1) % NOMBRES_FONDOS.length]; m.sucio = true },
      tamano: () => Math.round(s.tam),
      tam: (n: unknown) => { s.tam = limitar(numero(n), 10, 400); m.sucio = true },

      // sonido
      sonido: async (nombre: string) => { const d = SONIDOS[nombre] || SONIDOS.pop; d.tocar(); await pausa(d.ms) },
      nota: async (nombre: string, seg: unknown) => { const d = limitar(numero(seg) || 0.4, 0.05, 4); tono('triangle', NOTAS[nombre] || 440, NOTAS[nombre] || 440, d, 0.18); await pausa(d * 1000) },
      hablar: async (texto: unknown) => {
        const txt = String(texto ?? '')
        e.dice = txt; e.piensa = false; m.sucio = true
        if ('speechSynthesis' in window && txt) {
          await new Promise<void>(ok => {
            const u = new SpeechSynthesisUtterance(txt); u.lang = 'es-ES'; u.rate = 0.95
            u.onend = () => ok(); u.onerror = () => ok()
            window.speechSynthesis.speak(u)
            setTimeout(ok, 1500 + txt.length * 120)
          })
        } else await pausa(600 + txt.length * 60)
        await pausa(1)
        if (e.dice === txt) { e.dice = ''; m.sucio = true }
      },

      // eventos
      enviar: (msg: string) => { for (const h of m.hilos) if (h.tipo === 'ev_recibir' && h.arg === msg) m.lanzar(h) },
      enviarYEsperar: async (msg: string) => { await Promise.all(m.hilos.filter(h => h.tipo === 'ev_recibir' && h.arg === msg).map(h => m.lanzar(h))); await pausa(1) },

      // sensores
      tocando: (o: string) => {
        if (!s.visible) return false
        const r = m.radio(s)
        if (o === '_borde') return s.x + r >= ANCHO / 2 || s.x - r <= -ANCHO / 2 || s.y + r >= ALTO / 2 || s.y - r <= -ALTO / 2
        const p = m.objetivo(s, o)
        return !!p && Math.abs(p.x - s.x) < r + p.r && Math.abs(p.y - s.y) < r + p.r
      },
      distancia: (o: string) => { const p = m.objetivo(s, o); return p ? Math.round(Math.hypot(p.x - s.x, p.y - s.y)) : 10000 },
      preguntar: async (texto: unknown) => {
        const txt = String(texto ?? '')
        e.dice = txt; e.piensa = false
        m.respuesta = await new Promise<string>(ok => { m.pregunta = { texto: txt, responder: ok }; m.sucio = true })
        m.pregunta = null
        if (e.dice === txt) e.dice = ''
        m.sucio = true
        await pausa(1)
      },
      respuesta: () => { const n = Number(m.respuesta); return m.respuesta.trim() !== '' && Number.isFinite(n) ? n : m.respuesta },
      tecla: (k: string) => (k === 'cualquiera' ? m.teclas.size > 0 : m.teclas.has(k)),
      ratonAbajo: () => m.raton.abajo, ratonX: () => Math.round(m.raton.x), ratonY: () => Math.round(m.raton.y),
      cronometro: () => Math.round((performance.now() - m.t0) / 100) / 10,
      reiniciarCrono: () => { m.t0 = performance.now() },

      // operadores
      unir: (a: unknown, b: unknown) => String(a ?? '') + String(b ?? ''),
      contiene: (a: unknown, b: unknown) => String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),

      // lápiz
      lapiz: (abajo: boolean) => { e.lapiz = abajo; if (abajo) m.trazo(s, s.x, s.y); m.sucio = true },
      lapizColor: (c: string) => { e.color = COLORES_LAPIZ[c] || c },
      lapizGrosor: (n: unknown) => { e.grosor = limitar(numero(n), 1, 60) },
      lapizBorrar: () => { m.borrarLapiz(); m.sucio = true },
      sellar: () => {
        const c = m.ctx; const d = s.disfraces[s.disfraz] || ''
        if (!c || d.startsWith('data:')) return
        c.save(); c.font = `${48 * s.tam / 100}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'
        c.fillText(d, ANCHO / 2 + s.x, ALTO / 2 - s.y); c.restore()
      },

      // inteligencia artificial
      video: (si: boolean) => { m.video = si; if (si) pedirCamara(); m.sucio = true },
      videoTransp: (n: unknown) => { m.videoOpacidad = 1 - limitar(numero(n), 0, 100) / 100; m.sucio = true },
      iaVe: (c: string) => { pedirCamara(); return ia.clase === c },
      iaClase: () => { pedirCamara(); return ia.clase },
      iaSeguridad: () => ia.seguridad,
      objHay: (o: string) => vistos(o).length > 0,
      objCuenta: (o: string) => vistos(o).length,
      objX: (o: string) => vistos(o)[0]?.x ?? 0,
      objY: (o: string) => vistos(o)[0]?.y ?? 0,
      objLista: () => Array.from(new Set(ia.objetos.map(x => OBJETOS.find(o => o[1] === x.clase)?.[0] || x.clase))).join(', '),
      irAParte: (p: string) => { const k = parte(p); if (k?.ok) m.mover(s, k.x, k.y) },
      parteVisible: (p: string) => !!parte(p)?.ok,
      parteX: (p: string) => parte(p)?.x ?? 0,
      parteY: (p: string) => parte(p)?.y ?? 0,
      escuchar: async () => {
        if (!ia.vozDisponible()) { m.alError('Este navegador no reconoce la voz. Usa Google Chrome o Microsoft Edge.'); ia.oido = ''; await pausa(800); return }
        await ia.escuchar()
        await pausa(1)
      },
      oyo: (palabra: string) => { const p = String(palabra).toLowerCase().trim(); return !!p && ia.oido.toLowerCase().includes(p) },
      loOido: () => ia.oido,
    }
  }
}
