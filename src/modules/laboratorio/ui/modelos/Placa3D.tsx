'use client'

// Placas cortadas a láser (chasis, pisos, blindajes): contorno con esquinas
// redondeadas y agujeros/ranuras reales en la geometría, así el acrílico deja
// ver el piso a través de las ranuras y los cantos se ven bien de costado.
// Marco de la pieza: x a lo largo, z a lo ancho, y el espesor (centrado en 0).

import { useEffect, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'

/** Agujero redondo (diámetro `d`) o ranura (`lx` × `lz`, puntas redondas). Todo en mm. */
export type Agujero = { x: number; z: number; d: number } | { x: number; z: number; lx: number; lz: number }

/** Recorte rectangular en un costado de la placa (lado = signo de z), para que pase una rueda. Todo en mm. */
export interface Muesca { x: number; lado: 1 | -1; largo: number; fondo: number }

const mm = 0.001

function rectanguloRedondeado(p: THREE.Path, cx: number, cy: number, w: number, h: number, r: number) {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2
  r = Math.min(r, w / 2, h / 2)
  p.moveTo(x0 + r, y0)
  p.lineTo(x1 - r, y0)
  p.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false)
  p.lineTo(x1, y1 - r)
  p.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false)
  p.lineTo(x0 + r, y1)
  p.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false)
  p.lineTo(x0, y0 + r)
  p.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false)
  p.closePath()
}

/** Forma de la placa (en metros; la y de la forma es −z del robot). */
export function formaPlaca(largo: number, ancho: number, radio: number, agujeros: Agujero[], muescas: Muesca[] = []): THREE.Shape {
  const s = new THREE.Shape()
  if (!muescas.length) rectanguloRedondeado(s, 0, 0, largo * mm, ancho * mm, radio * mm)
  else {
    // Mismo contorno redondeado, con un escalón hacia adentro donde va cada rueda.
    const x0 = -largo * mm / 2, x1 = largo * mm / 2, y0 = -ancho * mm / 2, y1 = ancho * mm / 2, r = radio * mm
    // En la forma, y = −z: el costado z > 0 es el borde de abajo (y0) y se recorre de x0 a x1.
    const abajo = muescas.filter(q => q.lado === 1).sort((a, b) => a.x - b.x)
    const arriba = muescas.filter(q => q.lado === -1).sort((a, b) => b.x - a.x)
    s.moveTo(x0 + r, y0)
    for (const q of abajo) {
      const a = (q.x - q.largo / 2) * mm, b = (q.x + q.largo / 2) * mm, f = y0 + q.fondo * mm
      s.lineTo(a, y0); s.lineTo(a, f); s.lineTo(b, f); s.lineTo(b, y0)
    }
    s.lineTo(x1 - r, y0)
    s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false)
    s.lineTo(x1, y1 - r)
    s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false)
    for (const q of arriba) {
      const a = (q.x + q.largo / 2) * mm, b = (q.x - q.largo / 2) * mm, f = y1 - q.fondo * mm
      s.lineTo(a, y1); s.lineTo(a, f); s.lineTo(b, f); s.lineTo(b, y1)
    }
    s.lineTo(x0 + r, y1)
    s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false)
    s.lineTo(x0, y0 + r)
    s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false)
    s.closePath()
  }
  // Un agujero que cae en una muesca ya no existe (ahí no hay placa).
  const enMuesca = (a: Agujero) => {
    const [hx, hz] = 'd' in a ? [a.d / 2, a.d / 2] : [a.lx / 2, a.lz / 2]
    return muescas.some(q => Math.abs(a.x - q.x) < q.largo / 2 + hx + 1 && q.lado * a.z + hz > ancho / 2 - q.fondo - 1)
  }
  for (const a of agujeros) {
    if (enMuesca(a)) continue
    const h = new THREE.Path()
    const cx = a.x * mm, cy = -a.z * mm
    if ('d' in a) h.absarc(cx, cy, (a.d / 2) * mm, 0, Math.PI * 2, true)
    else rectanguloRedondeado(h, cx, cy, a.lx * mm, a.lz * mm, Math.min(a.lx, a.lz) * mm / 2)
    s.holes.push(h)
  }
  return s
}

const cache = new Map<string, THREE.ExtrudeGeometry>()

/** Geometría de la placa, compartida entre instancias iguales. */
export function geometriaPlaca(largo: number, ancho: number, espesor: number, radio: number, agujeros: Agujero[], muescas: Muesca[] = []): THREE.ExtrudeGeometry {
  const clave = `${largo}|${ancho}|${espesor}|${radio}|${agujeros.map(a => Object.values(a).join(',')).join(';')}|${muescas.map(a => Object.values(a).join(',')).join(';')}`
  let g = cache.get(clave)
  if (g) return g
  g = new THREE.ExtrudeGeometry(formaPlaca(largo, ancho, radio, agujeros, muescas), {
    depth: espesor * mm, bevelEnabled: true, bevelThickness: 0.25 * mm, bevelSize: 0.25 * mm, bevelSegments: 1, curveSegments: 6,
  })
  // Extruida en +z de la forma; se gira para que el espesor quede en y, centrado.
  g.rotateX(-Math.PI / 2)
  g.translate(0, -espesor * mm / 2, 0)
  g.computeVertexNormals()
  cache.set(clave, g)
  return g
}

export function PlacaRecortada({ largo, ancho, espesor = 3, radio = 8, agujeros = [], muescas, position = [0, 0, 0], castShadow = true, children }: {
  largo: number; ancho: number; espesor?: number; radio?: number; agujeros?: Agujero[]; muescas?: Muesca[]
  position?: [number, number, number]; castShadow?: boolean; children: ReactNode
}) {
  const geo = useMemo(() => geometriaPlaca(largo, ancho, espesor, radio, agujeros, muescas), [largo, ancho, espesor, radio, agujeros, muescas])
  useEffect(() => () => { /* compartida: no se libera */ }, [geo])
  return (
    <mesh geometry={geo} position={position} castShadow={castShadow} receiveShadow>
      {children}
    </mesh>
  )
}

/**
 * Patrón de corte de un chasis de kit: ranuras de montaje en los costados,
 * agujeros centrales cada 10 mm, ranuras para las bridas de los motores y de
 * la batería y los cuatro agujeros de la rueda loca.
 */
export function agujerosChasis(largo: number, ancho: number, motoresX: number[], locaX: number | null, bateriaX: number): Agujero[] {
  const out: Agujero[] = []
  const zs = [ancho / 2 - 12, ancho / 2 - 24]
  for (let x = -largo / 2 + 22; x <= largo / 2 - 22; x += 20) {
    for (const z of zs) { out.push({ x, z, lx: 12, lz: 3.2 }, { x, z: -z, lx: 12, lz: 3.2 }) }
  }
  for (let x = -largo / 2 + 25; x <= largo / 2 - 25; x += 10) {
    for (const z of [-10, 0, 10]) if (!(Math.abs(x - bateriaX) < 28 && z === 0)) out.push({ x, z, d: 3.2 })
  }
  for (const mx of motoresX) for (const s of [-1, 1]) {
    out.push({ x: mx - 11, z: s * (ancho / 2 - 14), lx: 3.2, lz: 9 }, { x: mx + 11, z: s * (ancho / 2 - 14), lx: 3.2, lz: 9 })
  }
  for (const s of [-1, 1]) out.push({ x: bateriaX + s * 24, z: 0, lx: 3.2, lz: 22 })
  if (locaX !== null) for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) out.push({ x: locaX + sx * 7, z: sz * 7, d: 3.2 })
  return out
}

/** Agujeros de aligeramiento de una placa de combate: filas de Ø6 fuera de la zona central. */
export function agujerosAligerado(largo: number, ancho: number, centroX = 0, cada = 14): Agujero[] {
  const out: Agujero[] = []
  for (let x = centroX - largo / 2 + 12; x <= centroX + largo / 2 - 12; x += cada) {
    for (const z of [ancho / 2 - 10, -(ancho / 2 - 10)]) out.push({ x, z, d: 5 })
  }
  return out
}
