'use client'

// Texturas procedurales del entorno (pisos, paredes, mesa, objetos). Se dibujan
// una sola vez en un canvas (con semilla fija: siempre salen iguales) y se
// guardan en caché por tipo, tamaño y color. Cada superficie usa un clon con su
// propia repetición. Sin `document` (tests) devuelven null y los materiales
// caen al color liso.

import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { aleatorio } from '../../arenas'
import { useCalidad } from '../calidad'

export type TipoTextura =
  | 'melamina' | 'mdf' | 'madera' | 'acero' | 'goma' | 'carton' | 'tapete' | 'aula' | 'tela' | 'pintura' | 'franjas'

export interface Textura {
  map: THREE.Texture
  roughnessMap?: THREE.Texture
  bumpMap?: THREE.Texture
}

/** Metros que cubre un mosaico de cada textura (para calcular la repetición). */
export const MOSAICO_M: Record<TipoTextura, number> = {
  melamina: 0.5, mdf: 0.5, madera: 1, acero: 0.3, goma: 0.25, carton: 1, tapete: 0.1, aula: 1, tela: 0.2, pintura: 1, franjas: 0.16,
}

/** Repetición de una superficie de `ancho × largo` m con esa textura. */
export const repeticion = (tipo: TipoTextura, ancho: number, largo: number): [number, number] =>
  [Math.max(1e-3, ancho / MOSAICO_M[tipo]), Math.max(1e-3, largo / MOSAICO_M[tipo])]

export const claveTextura = (tipo: TipoTextura, tam: number, color?: string) => `${tipo}:${tam}:${color ?? ''}`

interface Lienzos { color: HTMLCanvasElement; rugosidad?: HTMLCanvasElement; relieve?: HTMLCanvasElement }

const cache = new Map<string, Textura | null>()

// ---------------------------------------------------------------------------
// Utilidades de dibujo
// ---------------------------------------------------------------------------

function lienzo(ancho: number, alto = ancho): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = ancho
  c.height = alto
  const ctx = c.getContext('2d')
  return ctx ? [c, ctx] : null
}

function rgb(color: string): [number, number, number] {
  const c = new THREE.Color(color)
  return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)]
}

const hex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')

/** Aclara (k > 0) u oscurece (k < 0) un color. */
function tono(color: string, k: number) {
  const [r, g, b] = rgb(color)
  return k >= 0 ? hex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k) : hex(r * (1 + k), g * (1 + k), b * (1 + k))
}
export const tonoColor = tono

/** Ruido fino por píxel sobre lo ya dibujado (±fuerza en cada canal). */
function granulado(ctx: CanvasRenderingContext2D, fuerza: number, semilla = 1) {
  const { width, height } = ctx.canvas
  const img = ctx.getImageData(0, 0, width, height)
  const d = img.data
  const rnd = aleatorio(semilla)
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 2 * fuerza
    d[i] += n; d[i + 1] += n; d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

/** Vetas o rayas rectas a lo largo de x, de largo y opacidad variables. */
function rayas(ctx: CanvasRenderingContext2D, n: number, color: string, alfa: number, semilla: number, grosorMax = 1.5) {
  const t = ctx.canvas.width
  const rnd = aleatorio(semilla)
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const y = rnd() * t, x = rnd() * t, l = t * (0.05 + rnd() * 0.4)
    ctx.globalAlpha = alfa * (0.4 + rnd() * 0.6)
    ctx.lineWidth = 0.5 + rnd() * grosorMax
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y + (rnd() - 0.5) * 2); ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function puntos(ctx: CanvasRenderingContext2D, n: number, colores: string[], alfa: number, semilla: number, radioMax = 1.5) {
  const t = ctx.canvas.width
  const rnd = aleatorio(semilla)
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colores[i % colores.length]
    ctx.globalAlpha = alfa * (0.3 + rnd() * 0.7)
    const r = 0.4 + rnd() * radioMax
    ctx.beginPath(); ctx.arc(rnd() * t, rnd() * t, r, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}

function gris(tam: number, valor: number, ruido = 0, semilla = 3): HTMLCanvasElement | undefined {
  const l = lienzo(tam)
  if (!l) return undefined
  const [c, ctx] = l
  ctx.fillStyle = hex(valor, valor, valor)
  ctx.fillRect(0, 0, tam, tam)
  if (ruido) granulado(ctx, ruido, semilla)
  return c
}

// ---------------------------------------------------------------------------
// Generadores
// ---------------------------------------------------------------------------

function melamina(tam: number, color = '#f1f1ec'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  rayas(ctx, 240, tono(color, 0.5), 0.05, 11)
  rayas(ctx, 240, tono(color, -0.25), 0.04, 12)
  granulado(ctx, 4, 13)
  return { color: c, rugosidad: gris(tam, 150, 14) }
}

function mdf(tam: number, color = '#c6a77b'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  puntos(ctx, tam * 6, [tono(color, -0.35), tono(color, 0.3)], 0.5, 21, 1.1)
  granulado(ctx, 9, 22)
  return { color: c, rugosidad: gris(tam, 228, 8) }
}

function madera(tam: number, color = '#c89a63'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  const rnd = aleatorio(31)
  ctx.lineCap = 'round'
  // Vetas: líneas onduladas a lo largo de x, algunas más oscuras y anchas.
  for (let i = 0; i < 70; i++) {
    const y0 = rnd() * tam, amp = 2 + rnd() * 6, f = 0.5 + rnd() * 1.5, ancho = 0.6 + rnd() * 2.4
    ctx.strokeStyle = tono(color, -(0.12 + rnd() * 0.3))
    ctx.globalAlpha = 0.25 + rnd() * 0.35
    ctx.lineWidth = ancho
    ctx.beginPath()
    for (let x = 0; x <= tam; x += 8) ctx.lineTo(x, y0 + Math.sin((x / tam) * Math.PI * 2 * f + i) * amp)
    ctx.stroke()
  }
  // Tablas: una junta cada cuarto del mosaico.
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = tono(color, -0.5)
  ctx.lineWidth = 2
  for (let k = 0; k < 4; k++) { const y = (k * tam) / 4 + 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tam, y); ctx.stroke() }
  ctx.globalAlpha = 1
  granulado(ctx, 6, 32)
  return { color: c, rugosidad: gris(tam, 165, 12), relieve: c }
}

/** Chapa de acero estriada (lágrima): rombos en relieve alternados, con rayones. */
function acero(tam: number): Lienzos | null {
  const l = lienzo(tam), r = lienzo(tam), b = lienzo(tam)
  if (!l || !r || !b) return null
  const [c, ctx] = l, [cr, ctxR] = r, [cb, ctxB] = b
  ctx.fillStyle = '#7e868f'
  ctx.fillRect(0, 0, tam, tam)
  rayas(ctx, 500, '#aeb6be', 0.07, 41, 1)
  rayas(ctx, 500, '#4c5258', 0.06, 42, 1)
  ctxR.fillStyle = '#5a5a5a'; ctxR.fillRect(0, 0, tam, tam)
  ctxB.fillStyle = '#000'; ctxB.fillRect(0, 0, tam, tam)
  const celdas = 6, celda = tam / celdas
  const lagrima = (cx: CanvasRenderingContext2D, x: number, y: number, ang: number, color: string, dx = 0) => {
    cx.save(); cx.translate(x + dx, y + dx); cx.rotate(ang)
    cx.fillStyle = color
    cx.beginPath(); cx.ellipse(0, 0, celda * 0.3, celda * 0.075, 0, 0, Math.PI * 2); cx.fill()
    cx.restore()
  }
  for (let i = 0; i < celdas; i++) for (let j = 0; j < celdas; j++) {
    const x = (i + 0.5) * celda, y = (j + 0.5) * celda, ang = ((i + j) % 2 ? 1 : -1) * Math.PI / 4
    lagrima(ctx, x, y, ang, '#4f565d', 2.5)
    lagrima(ctx, x, y, ang, '#9aa2aa', -1)
    lagrima(ctx, x, y, ang, '#848c95')
    lagrima(ctxR, x, y, ang, '#7a7a7a')
    lagrima(ctxB, x, y, ang, '#fff')
  }
  granulado(ctx, 7, 43)
  granulado(ctxR, 10, 44)
  return { color: c, rugosidad: cr, relieve: cb }
}

function goma(tam: number, color = '#101114'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  puntos(ctx, tam * 3, [tono(color, 0.25), tono(color, 0.12)], 0.35, 51, 0.9)
  granulado(ctx, 6, 52)
  return { color: c, rugosidad: gris(tam, 135, 18, 53) }
}

function carton(tam: number, color = '#c3925f'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  rayas(ctx, 900, tono(color, 0.35), 0.1, 61, 1)
  rayas(ctx, 700, tono(color, -0.3), 0.08, 62, 1)
  // Ondulación del cartón, muy sutil.
  ctx.globalAlpha = 0.05
  ctx.strokeStyle = tono(color, -0.4)
  ctx.lineWidth = 1
  for (let y = 0; y < tam; y += 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tam, y); ctx.stroke() }
  ctx.globalAlpha = 1
  granulado(ctx, 7, 63)
  return { color: c, rugosidad: gris(tam, 222, 8) }
}

/** Tapete de corte: 10 cm por mosaico, cuadrícula de 1 cm y líneas gruesas cada 5 cm. */
function tapete(tam: number, color = '#2f5f48'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  granulado(ctx, 4, 71)
  const paso = tam / 10
  ctx.strokeStyle = '#ffffff'
  for (let k = 0; k <= 10; k++) {
    const gruesa = k % 5 === 0
    ctx.globalAlpha = gruesa ? 0.85 : 0.4
    ctx.lineWidth = gruesa ? Math.max(2, tam / 256) : Math.max(1, tam / 700)
    const p = Math.round(k * paso) + 0.5
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, tam); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(tam, p); ctx.stroke()
  }
  ctx.globalAlpha = 1
  return { color: c, rugosidad: gris(tam, 205, 6) }
}

/** Piso del aula: baldosas de vinilo de 50 cm con motas, 2 × 2 por mosaico. */
function aula(tam: number, color = '#d8dbe0'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  const rnd = aleatorio(81)
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    ctx.fillStyle = tono(color, (rnd() - 0.5) * 0.08)
    ctx.fillRect((i * tam) / 2, (j * tam) / 2, tam / 2, tam / 2)
  }
  puntos(ctx, tam * 8, [tono(color, -0.45), tono(color, 0.5), '#9aa3ad'], 0.55, 82, 1.3)
  ctx.strokeStyle = tono(color, -0.3)
  ctx.lineWidth = Math.max(2, tam / 400)
  ctx.beginPath()
  ctx.moveTo(tam / 2 + 0.5, 0); ctx.lineTo(tam / 2 + 0.5, tam)
  ctx.moveTo(0, tam / 2 + 0.5); ctx.lineTo(tam, tam / 2 + 0.5)
  ctx.moveTo(0.5, 0); ctx.lineTo(0.5, tam); ctx.moveTo(0, 0.5); ctx.lineTo(tam, 0.5)
  ctx.stroke()
  granulado(ctx, 5, 83)
  return { color: c, rugosidad: gris(tam, 120, 14, 84) }
}

function tela(tam: number, color = '#475569'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  ctx.lineWidth = 1
  for (let k = 0; k < tam; k += 3) {
    ctx.strokeStyle = k % 6 ? tono(color, 0.18) : tono(color, -0.2)
    ctx.globalAlpha = 0.18
    ctx.beginPath(); ctx.moveTo(k + 0.5, 0); ctx.lineTo(k + 0.5, tam); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, k + 0.5); ctx.lineTo(tam, k + 0.5); ctx.stroke()
  }
  ctx.globalAlpha = 1
  granulado(ctx, 10, 91)
  return { color: c, rugosidad: gris(tam, 240, 6) }
}

function pintura(tam: number, color = '#eceef1'): Lienzos | null {
  const l = lienzo(tam)
  if (!l) return null
  const [c, ctx] = l
  ctx.fillStyle = color
  ctx.fillRect(0, 0, tam, tam)
  granulado(ctx, 4, 101)
  return { color: c, rugosidad: gris(tam, 232, 5) }
}

/** Franjas diagonales de advertencia: `color` = "fondo|franja". */
function franjas(_tam: number, color = '#111827|#facc15'): Lienzos | null {
  const l = lienzo(256, 32)
  if (!l) return null
  const [c, ctx] = l
  const [fondo, franja] = color.split('|')
  ctx.fillStyle = fondo; ctx.fillRect(0, 0, 256, 32)
  ctx.fillStyle = franja
  for (let i = -32; i < 256; i += 32) { ctx.beginPath(); ctx.moveTo(i, 32); ctx.lineTo(i + 16, 0); ctx.lineTo(i + 32, 0); ctx.lineTo(i + 16, 32); ctx.fill() }
  return { color: c }
}

const GENERADORES: Record<TipoTextura, (tam: number, color?: string) => Lienzos | null> = {
  melamina, mdf, madera, acero, goma, carton, tapete, aula, tela, pintura, franjas,
}

// ---------------------------------------------------------------------------
// Caché y clones
// ---------------------------------------------------------------------------

function aTextura(c: HTMLCanvasElement, esColor: boolean): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  if (esColor) t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Textura base (compartida) de ese tipo, tamaño y color. */
export function texturaBase(tipo: TipoTextura, tam: number, color?: string): Textura | null {
  const clave = claveTextura(tipo, tam, color)
  if (cache.has(clave)) return cache.get(clave)!
  const ls = GENERADORES[tipo](tam, color)
  const t = ls
    ? { map: aTextura(ls.color, true), roughnessMap: ls.rugosidad && aTextura(ls.rugosidad, false), bumpMap: ls.relieve && aTextura(ls.relieve, false) }
    : null
  cache.set(clave, t)
  return t
}

function clonar(base: Textura, repetir: [number, number], anisotropia: number): Textura {
  const uno = (t: THREE.Texture) => {
    const c = t.clone()
    c.repeat.set(repetir[0], repetir[1])
    c.anisotropy = anisotropia
    c.needsUpdate = true
    return c
  }
  return { map: uno(base.map), roughnessMap: base.roughnessMap && uno(base.roughnessMap), bumpMap: base.bumpMap && uno(base.bumpMap) }
}

/**
 * Textura lista para un material: clon con la repetición pedida. `repetir` son
 * las veces que se repite el mosaico en cada eje (ver `repeticion`).
 */
export function useTextura(tipo: TipoTextura, repetir: [number, number] = [1, 1], color?: string): Textura | null {
  const { gl } = useThree()
  const q = useCalidad()
  const anisotropia = Math.min(8, gl.capabilities.getMaxAnisotropy())
  const [rx, ry] = repetir
  const t = useMemo(() => {
    const base = texturaBase(tipo, q.texturas, color)
    return base ? clonar(base, [rx, ry], anisotropia) : null
  }, [tipo, q.texturas, color, rx, ry, anisotropia])
  useEffect(() => () => { if (t) { t.map.dispose(); t.roughnessMap?.dispose(); t.bumpMap?.dispose() } }, [t])
  return t
}
