// Arenas de F2: las pistas de línea de F1 y el campo libre con obstáculos.

import { PISTAS, type Pista } from '../engine/tracks'
import type { ArenaDef, ObjetoArena } from './tipos'

export type { ArenaDef, ObjetoArena }

export function arenaDePista(p: Pista): ArenaDef {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: 'Pista de cinta negra sobre fondo blanco para seguidores de línea.',
    ancho: p.anchoM,
    largo: p.altoM,
    piso: { material: 'melamina', color: '#f4f4f0', reflectancia: 0.95 },
    pista: p,
    objetos: [],
    paredes: false,
    inicio: p.inicio,
  }
}

/** Generador pseudoaleatorio con semilla (mulberry32): misma semilla, mismo campo. */
export function aleatorio(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const COLORES_CAJA = ['#c2410c', '#b45309', '#15803d', '#1d4ed8', '#7c3aed', '#be123c']

/**
 * Campo libre: piso de 4 × 3 m con paredes y cajas repartidas al azar (con
 * semilla), dejando libre la zona de salida.
 */
export function campoLibre(semilla = 7, cantidad = 9): ArenaDef {
  const ancho = 4, largo = 3
  const rnd = aleatorio(semilla)
  const objetos: ObjetoArena[] = []
  let intentos = 0
  while (objetos.length < cantidad && intentos++ < 500) {
    const lado = 0.12 + rnd() * 0.18
    const x = (rnd() - 0.5) * (ancho - 0.6)
    const z = (rnd() - 0.5) * (largo - 0.6)
    // Zona de salida libre (robot en el centro-izquierda mirando a +x).
    if (Math.hypot(x + 1.2, z) < 0.55) continue
    // Sin superponerse (y con paso para el robot entre cajas).
    if (objetos.some(o => Math.hypot(o.x - x, o.z - z) < (o.medidas[0] + lado) / 2 + 0.3)) continue
    objetos.push({
      id: `caja-${objetos.length + 1}`, forma: 'caja', medidas: [lado, 0.1 + rnd() * 0.15, lado],
      x, z, yaw: rnd() * Math.PI, color: COLORES_CAJA[objetos.length % COLORES_CAJA.length], material: 'mdf',
    })
  }
  return {
    id: 'campo-libre',
    nombre: 'Campo libre con obstáculos',
    descripcion: 'Piso amplio con paredes y cajas para robots que esquivan obstáculos.',
    ancho, largo,
    piso: { material: 'melamina', color: '#9c968a', reflectancia: 0.8 },
    objetos,
    paredes: true,
    inicio: { x: -1.2, z: 0, yaw: 0 },
  }
}

export function listaArenas(): ArenaDef[] {
  return [...PISTAS.map(arenaDePista), campoLibre()]
}

export function arena(id: string): ArenaDef {
  const a = listaArenas().find(x => x.id === id)
  if (!a) throw new Error(`Arena desconocida: ${id}`)
  return a
}
