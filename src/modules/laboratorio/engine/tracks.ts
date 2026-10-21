// Pistas del seguidor de línea.
//
// Una pista es una imagen: la MISMA imagen se usa como textura del piso en 3D
// y como "lo que ven" los sensores IR. Así, lo que el estudiante ve es
// exactamente lo que lee el sensor (y puede cargar su propia pista PNG).
//
// Coordenadas: el centro de la pista es (0,0) en el mundo; x crece a la
// derecha de la imagen y z hacia abajo de la imagen (vista desde arriba).

export interface Pose2D { x: number; z: number; yaw: number }

export interface Pista {
  id: string
  nombre: string
  anchoM: number
  altoM: number
  inicio: Pose2D
  /** Dibuja la pista en coordenadas de mundo (metros). */
  dibujar?: (ctx: CanvasRenderingContext2D) => void
}

export const PX_POR_M = 500 // 2 mm por píxel
const CINTA_M = 0.019       // cinta aislante de 19 mm
const BLANCO = '#f4f4f0'
const NEGRO = '#111111'

type Punto = [number, number]

function trazo(ctx: CanvasRenderingContext2D, pts: Punto[], cerrar = true) {
  ctx.strokeStyle = NEGRO
  ctx.lineWidth = CINTA_M
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  pts.forEach(([x, z], i) => (i ? ctx.lineTo(x, z) : ctx.moveTo(x, z)))
  if (cerrar) ctx.closePath()
  ctx.stroke()
}

function muestrear(f: (t: number) => Punto, n = 600): Punto[] {
  return Array.from({ length: n }, (_, i) => f(i / n))
}

function poseInicial(f: (t: number) => Punto): Pose2D {
  const [x0, z0] = f(0)
  const [x1, z1] = f(0.001)
  // El robot mira hacia +x en su marco; yaw gira alrededor de +y (antihorario visto desde arriba).
  return { x: x0, z: z0, yaw: Math.atan2(-(z1 - z0), x1 - x0) }
}

function pistaParametrica(id: string, nombre: string, f: (t: number) => Punto, anchoM = 3, altoM = 2): Pista {
  return { id, nombre, anchoM, altoM, inicio: poseInicial(f), dibujar: ctx => trazo(ctx, muestrear(f)) }
}

// Óvalo tipo estadio: dos rectas y dos semicírculos.
export const ovalo = (t: number): Punto => {
  const L = 1.2, R = 0.55
  const per = 2 * L + 2 * Math.PI * R
  let s = t * per
  if (s < L) return [-L / 2 + s, R]
  s -= L
  if (s < Math.PI * R) { const a = s / R; return [L / 2 + R * Math.sin(a), R * Math.cos(a)] }
  s -= Math.PI * R
  if (s < L) return [L / 2 - s, -R]
  s -= L
  const a = s / R
  return [-L / 2 - R * Math.sin(a), -R * Math.cos(a)]
}

// Curvas suaves: un óvalo deformado con tres "olas".
export const curvas = (t: number): Punto => {
  const a = t * 2 * Math.PI
  const k = 1 + 0.18 * Math.sin(3 * a)
  return [1.1 * Math.cos(a) * k, 0.68 * Math.sin(a) * k]
}

// Ocho: tiene un cruce donde los dos sensores ven negro a la vez.
const ocho = (t: number): Punto => {
  const a = t * 2 * Math.PI
  return [1.15 * Math.sin(a), 0.7 * Math.sin(2 * a)]
}

// Desafío: esquinas en ángulo recto y una zona en zigzag.
const DESAFIO: Punto[] = [
  [-1.1, 0.7], [0.2, 0.7], [0.2, 0.35], [0.55, 0.35], [0.55, 0.7], [1.1, 0.7],
  [1.1, -0.7], [0.4, -0.7], [0.15, -0.35], [-0.1, -0.7], [-0.35, -0.35], [-0.6, -0.7], [-1.1, -0.7],
]

export const PISTAS: Pista[] = [
  pistaParametrica('ovalo', 'Óvalo (inicial)', ovalo),
  pistaParametrica('curvas', 'Curvas suaves', curvas),
  pistaParametrica('ocho', 'Ocho con cruce', ocho),
  {
    id: 'desafio', nombre: 'Desafío: esquinas', anchoM: 3, altoM: 2,
    inicio: { x: -0.8, z: 0.7, yaw: 0 },
    dibujar: ctx => trazo(ctx, DESAFIO),
  },
]

/** Imagen de pista lista para textura y para que los sensores la lean. */
export class MapaPista {
  readonly canvas: HTMLCanvasElement
  readonly anchoM: number
  readonly altoM: number
  private pixels: Uint8ClampedArray

  constructor(pista: Pista, imagen?: CanvasImageSource) {
    this.anchoM = pista.anchoM
    this.altoM = pista.altoM
    const w = Math.round(this.anchoM * PX_POR_M)
    const h = Math.round(this.altoM * PX_POR_M)
    this.canvas = document.createElement('canvas')
    this.canvas.width = w
    this.canvas.height = h
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
    ctx.fillStyle = BLANCO
    ctx.fillRect(0, 0, w, h)
    if (imagen) {
      ctx.drawImage(imagen, 0, 0, w, h)
    } else if (pista.dibujar) {
      ctx.save()
      ctx.translate(w / 2, h / 2)
      ctx.scale(PX_POR_M, PX_POR_M)
      pista.dibujar(ctx)
      // Marca de salida: una barra verde al costado de la línea.
      const { x, z, yaw } = pista.inicio
      ctx.translate(x, z)
      ctx.rotate(-yaw)
      ctx.fillStyle = '#16a34a'
      ctx.fillRect(-0.01, 0.03, 0.02, 0.06)
      ctx.fillRect(-0.01, -0.09, 0.02, 0.06)
      ctx.restore()
    }
    this.pixels = ctx.getImageData(0, 0, w, h).data
  }

  /**
   * Reflectancia (0 = negro, 1 = blanco) promedio en un círculo de `radioM`
   * alrededor de (x, z). Fuera de la pista se ve el piso gris del aula.
   */
  reflectancia(x: number, z: number, radioM = 0.003): number {
    const { width: w, height: h } = this.canvas
    const cx = (x + this.anchoM / 2) * PX_POR_M
    const cy = (z + this.altoM / 2) * PX_POR_M
    const r = Math.max(1, Math.round(radioM * PX_POR_M))
    let suma = 0
    let n = 0
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue
        const px = Math.round(cx + dx)
        const py = Math.round(cy + dy)
        if (px < 0 || py < 0 || px >= w || py >= h) { suma += 0.55; n++; continue }
        const i = (py * w + px) * 4
        suma += (0.299 * this.pixels[i] + 0.587 * this.pixels[i + 1] + 0.114 * this.pixels[i + 2]) / 255
        n++
      }
    }
    return n ? suma / n : 0.55
  }
}
