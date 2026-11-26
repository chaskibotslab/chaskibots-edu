/**
 * Dibuja el tapete en un canvas (en cm). Sirve de textura del piso y de fuente
 * para los sensores de color: color por nombre y luz reflejada (0–100).
 */
import type { Tapete } from './engine'
import { colorMasCercano } from './colores'

export const PX_POR_CM = 6

export function crearTapete(tapete: Tapete) {
  const W = Math.round(tapete.ancho * PX_POR_CM)
  const H = Math.round(tapete.alto * PX_POR_CM)
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = tapete.colorPiso || '#eef2f7'
  ctx.fillRect(0, 0, W, H)
  // Pintar en cm: origen al centro, +x derecha, +z abajo
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.scale(PX_POR_CM, PX_POR_CM)
  tapete.pintar?.(ctx)
  ctx.restore()

  // Se lee la imagen una sola vez: los sensores consultan esta copia en cada paso
  let px: Uint8ClampedArray | null = null
  try { px = ctx.getImageData(0, 0, W, H).data } catch { px = null }
  const indice = (x: number, z: number) => {
    const cx = Math.round((x + tapete.ancho / 2) * PX_POR_CM)
    const cz = Math.round((z + tapete.alto / 2) * PX_POR_CM)
    return cx < 0 || cz < 0 || cx >= W || cz >= H ? -1 : (cz * W + cx) * 4
  }
  const color = (x: number, z: number) => {
    const i = indice(x, z)
    return !px || i < 0 ? 'blanco' : colorMasCercano(px[i], px[i + 1], px[i + 2])
  }
  const luz = (x: number, z: number) => {
    const i = indice(x, z)
    return !px || i < 0 ? 100 : (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 2.55
  }
  return { canvas, color, luz }
}
