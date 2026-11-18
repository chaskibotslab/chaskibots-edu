/**
 * ChaskiBlocks IA: motores de inteligencia artificial.
 * Todo corre en el navegador con TensorFlow.js: las imágenes de la cámara no se envían a ningún servidor.
 *  - Clasificador de imágenes entrenable (MobileNet + KNN), como Teachable Machine.
 *  - Detector de objetos (COCO-SSD).
 *  - Seguimiento del cuerpo (MoveNet).
 *  - Reconocimiento de voz (el del navegador).
 */
import { ANCHO, ALTO } from './bloques'

export interface ObjetoVisto { clase: string; x: number; y: number; ancho: number; alto: number; seguridad: number }
export interface PuntoCuerpo { x: number; y: number; ok: boolean }
export type EstadoCamara = 'apagada' | 'cargando' | 'lista'

const dormir = (ms: number) => new Promise(ok => setTimeout(ok, ms))

export class MotorIA {
  video: HTMLVideoElement | null = null
  flujo: MediaStream | null = null
  camara: EstadoCamara = 'apagada'
  mensaje = ''
  /** Avisa a la interfaz que algo cambió (estado de cámara, ejemplos, predicción). */
  alCambiar: () => void = () => {}

  // Resultados que leen los bloques
  clase = ''
  seguridad = 0
  confianzas: number[] = []
  objetos: ObjetoVisto[] = []
  cuerpo: Record<string, PuntoCuerpo> = {}
  oido = ''
  escuchando = false

  // Qué modelos necesita el programa que está corriendo
  usar = { objetos: false, cuerpo: false }
  nombres: string[] = ['Clase 1', 'Clase 2']
  ejemplos: number[] = [0, 0]

  private tf: any = null
  private mobilenet: any = null
  private knn: any = null
  private coco: any = null
  private detector: any = null
  private cargandoModelo: Record<string, Promise<void> | undefined> = {}
  private pendiente: any = null
  private vivo = false

  // ------------------------------------------------------------------ cámara
  async encenderCamara(): Promise<boolean> {
    if (this.camara === 'lista') return true
    if (this.camara === 'cargando') { while (this.camara === 'cargando') await dormir(100); return this.camara === 'lista' }
    this.camara = 'cargando'; this.mensaje = 'Encendiendo la cámara…'; this.alCambiar()
    try {
      this.flujo = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
      if (this.video) { this.video.srcObject = this.flujo; await this.video.play().catch(() => {}) }
      this.camara = 'lista'; this.mensaje = ''
      if (!this.vivo) { this.vivo = true; this.ciclo() }
      this.alCambiar()
      return true
    } catch {
      this.camara = 'apagada'; this.mensaje = 'No pude usar la cámara. Revisa el permiso del navegador.'; this.alCambiar()
      return false
    }
  }

  apagar() {
    this.vivo = false
    this.flujo?.getTracks().forEach(t => t.stop())
    this.flujo = null
    if (this.video) this.video.srcObject = null
    this.camara = 'apagada'
  }

  // ----------------------------------------------------------------- modelos
  private una(nombre: string, cargar: () => Promise<void>) {
    if (!this.cargandoModelo[nombre]) {
      this.cargandoModelo[nombre] = cargar().catch(e => { this.cargandoModelo[nombre] = undefined; throw e })
    }
    return this.cargandoModelo[nombre]!
  }

  private async cargarTF() {
    if (this.tf) return
    const tf = await import('@tensorflow/tfjs')
    await tf.ready()
    this.tf = tf
  }

  prepararClasificador() {
    return this.una('clasificador', async () => {
      this.mensaje = 'Preparando la IA de imágenes…'; this.alCambiar()
      await this.cargarTF()
      const m = await import('@tensorflow-models/mobilenet')
      const k = await import('@tensorflow-models/knn-classifier')
      this.mobilenet = await m.load()
      this.knn = k.create()
      if (this.pendiente) { this.aplicarEntrenamiento(this.pendiente); this.pendiente = null }
      this.mensaje = ''; this.alCambiar()
    })
  }

  prepararObjetos() {
    return this.una('objetos', async () => {
      this.mensaje = 'Preparando el detector de objetos…'; this.alCambiar()
      await this.cargarTF()
      const c = await import('@tensorflow-models/coco-ssd')
      this.coco = await c.load()
      this.mensaje = ''; this.alCambiar()
    })
  }

  prepararCuerpo() {
    return this.una('cuerpo', async () => {
      this.mensaje = 'Preparando el seguimiento del cuerpo…'; this.alCambiar()
      await this.cargarTF()
      const p = await import('@tensorflow-models/pose-detection')
      this.detector = await p.createDetector(p.SupportedModels.MoveNet, { modelType: p.movenet.modelType.SINGLEPOSE_LIGHTNING })
      this.mensaje = ''; this.alCambiar()
    })
  }

  // ------------------------------------------------------------ entrenamiento
  private listo() { const v = this.video; return !!v && v.readyState >= 2 && v.videoWidth > 0 }

  /** Agrega un ejemplo de lo que ve la cámara a una clase. Devuelve una miniatura. */
  agregarEjemplo(i: number): string | null {
    if (!this.listo() || !this.mobilenet || !this.knn) return null
    const act = this.mobilenet.infer(this.video, true)
    this.knn.addExample(act, i)
    act.dispose?.()
    this.ejemplos[i] = (this.ejemplos[i] || 0) + 1
    this.alCambiar()
    try {
      const c = document.createElement('canvas'); c.width = 64; c.height = 48
      const x = c.getContext('2d')!
      x.translate(64, 0); x.scale(-1, 1); x.drawImage(this.video!, 0, 0, 64, 48)
      return c.toDataURL('image/jpeg', 0.6)
    } catch { return null }
  }

  borrarClase(i: number) {
    try { if (this.knn && this.knn.getClassExampleCount()[i]) this.knn.clearClass(i) } catch { /* clase sin ejemplos */ }
    this.ejemplos[i] = 0
    this.clase = ''; this.seguridad = 0; this.confianzas = []
    this.alCambiar()
  }

  borrarTodo() {
    try { this.knn?.clearAllClasses() } catch { /* sin clases */ }
    this.ejemplos = this.nombres.map(() => 0)
    this.clase = ''; this.seguridad = 0; this.confianzas = []
    this.pendiente = null
    this.alCambiar()
  }

  fijarClases(nombres: string[]) {
    this.nombres = nombres
    this.ejemplos = nombres.map((_, i) => this.ejemplos[i] || 0)
  }

  totalEjemplos() { return this.ejemplos.reduce((a, b) => a + b, 0) }

  /** Entrenamiento listo para guardarse dentro del archivo del proyecto. */
  exportarEntrenamiento(): any {
    if (!this.knn || !this.totalEjemplos()) return this.pendiente
    const datos: any = {}
    const ds = this.knn.getClassifierDataset()
    for (const k of Object.keys(ds)) {
      datos[k] = { forma: ds[k].shape, valores: Array.from(ds[k].dataSync() as Float32Array).map(v => Math.round(v * 1000) / 1000) }
    }
    return datos
  }

  importarEntrenamiento(datos: any) {
    this.borrarTodo()
    if (!datos || !Object.keys(datos).length) return
    // Los ejemplos se ven en los contadores aunque el modelo aún no se haya descargado
    for (const k of Object.keys(datos)) this.ejemplos[Number(k)] = datos[k].forma?.[0] || 0
    if (this.knn) this.aplicarEntrenamiento(datos)
    else { this.pendiente = datos; this.prepararClasificador().catch(() => {}) }
    this.alCambiar()
  }

  private aplicarEntrenamiento(datos: any) {
    const ds: any = {}
    for (const k of Object.keys(datos)) ds[k] = this.tf.tensor2d(datos[k].valores, datos[k].forma)
    this.knn.setClassifierDataset(ds)
  }

  // ------------------------------------------------------- ciclo de predicción
  private aEscenario(px: number, py: number) {
    const v = this.video!
    // La cámara se muestra como espejo: lo que está a tu derecha aparece a la derecha
    return { x: Math.round((0.5 - px / v.videoWidth) * ANCHO), y: Math.round((0.5 - py / v.videoHeight) * ALTO) }
  }

  private async ciclo() {
    while (this.vivo) {
      let trabajo = false
      if (this.listo()) {
        try {
          if (this.knn && this.mobilenet && this.knn.getNumClasses() > 0) {
            trabajo = true
            const act = this.mobilenet.infer(this.video, true)
            const r = await this.knn.predictClass(act, 10)
            act.dispose?.()
            const idx = Number(r.label)
            this.confianzas = this.nombres.map((_, i) => Math.round((r.confidences?.[i] || 0) * 100))
            this.clase = this.nombres[idx] || ''
            this.seguridad = this.confianzas[idx] || 0
          }
          if (this.usar.objetos && this.coco) {
            trabajo = true
            const ps = await this.coco.detect(this.video, 12, 0.5)
            this.objetos = ps.map((p: any) => {
              const [bx, by, bw, bh] = p.bbox
              const c = this.aEscenario(bx + bw / 2, by + bh / 2)
              const v = this.video!
              return { clase: p.class, x: c.x, y: c.y, ancho: (bw / v.videoWidth) * ANCHO, alto: (bh / v.videoHeight) * ALTO, seguridad: Math.round(p.score * 100) }
            })
          }
          if (this.usar.cuerpo && this.detector) {
            trabajo = true
            const poses = await this.detector.estimatePoses(this.video)
            const cuerpo: Record<string, PuntoCuerpo> = {}
            for (const k of poses[0]?.keypoints || []) {
              const c = this.aEscenario(k.x, k.y)
              cuerpo[k.name] = { x: c.x, y: c.y, ok: (k.score || 0) > 0.3 }
            }
            this.cuerpo = cuerpo
          }
        } catch { /* cuadro sin predicción */ }
        if (trabajo) this.alCambiar()
      }
      await dormir(trabajo ? (this.usar.cuerpo ? 40 : 120) : 250)
    }
  }

  // ---------------------------------------------------------------------- voz
  vozDisponible() {
    return typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  }

  private reconocedor: any = null

  async escuchar(maxMs = 7000): Promise<string> {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { this.oido = ''; return '' }
    this.escuchando = true; this.alCambiar()
    const texto = await new Promise<string>(ok => {
      const r = new SR(); this.reconocedor = r
      r.lang = 'es-ES'; r.maxAlternatives = 1; r.interimResults = false
      let fin = false
      const cerrar = (t: string) => { if (!fin) { fin = true; ok(t) } }
      r.onresult = (e: any) => cerrar(e.results?.[0]?.[0]?.transcript || '')
      r.onerror = () => cerrar('')
      r.onend = () => cerrar('')
      try { r.start() } catch { cerrar('') }
      setTimeout(() => { try { r.stop() } catch { /* ya terminó */ } }, maxMs)
    })
    this.reconocedor = null
    this.oido = texto.trim()
    this.escuchando = false; this.alCambiar()
    return this.oido
  }

  dejarDeEscuchar() {
    try { this.reconocedor?.abort() } catch { /* sin reconocedor */ }
    this.escuchando = false
  }
}
