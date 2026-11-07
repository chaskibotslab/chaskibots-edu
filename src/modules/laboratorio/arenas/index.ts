// Arenas de F2: las pistas de línea de F1 y el campo libre con obstáculos.

import { PISTAS, curvas, type Pista } from '../engine/tracks'
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
export function campoLibre(semilla = 7, cantidad = 9, id = 'campo-libre'): ArenaDef {
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
    id,
    nombre: id === 'campo-libre' ? 'Campo libre con obstáculos' : 'Campo con más obstáculos',
    descripcion: 'Piso amplio con paredes y cajas para robots que esquivan obstáculos.',
    ancho, largo,
    piso: { material: 'melamina', color: '#9c968a', reflectancia: 0.8 },
    objetos,
    paredes: true,
    inicio: { x: -1.2, z: 0, yaw: 0 },
  }
}

/** Óvalo con una barrera sobre la línea: para seguidores que deben frenar. */
export function ovaloConBarrera(): ArenaDef {
  const base = arenaDePista(PISTAS.find(p => p.id === 'ovalo')!)
  return {
    ...base,
    id: 'ovalo-barrera',
    nombre: 'Óvalo con barrera',
    descripcion: 'La pista del óvalo con una caja sobre la línea: el robot debe frenar antes de chocar.',
    objetos: [{ id: 'barrera', forma: 'caja', medidas: [0.05, 0.12, 0.22], x: 0.35, z: 0.55, color: '#dc2626', material: 'mdf' }],
  }
}

/**
 * Laberinto en serpentina de 4 pasillos de 60 cm (2,4 × 1,8 m). Se resuelve
 * siguiendo siempre la pared derecha.
 */
export function laberinto(): ArenaDef {
  const alto = 0.12, grueso = 0.02, color = '#e2e8f0'
  const pared = (id: string, x: number, z1: number, z2: number): ObjetoArena => ({
    id, forma: 'caja', medidas: [grueso, alto, z2 - z1], x, z: (z1 + z2) / 2, color, material: 'mdf',
  })
  return {
    id: 'laberinto',
    nombre: 'Laberinto',
    descripcion: 'Cuatro pasillos en zigzag con paredes de 12 cm. La meta es el círculo verde.',
    ancho: 2.4, largo: 1.8,
    piso: { material: 'melamina', color: '#8a8f99', reflectancia: 0.8 },
    objetos: [pared('pared-1', -0.6, -0.9, 0.3), pared('pared-2', 0, -0.3, 0.9), pared('pared-3', 0.6, -0.9, 0.3)],
    paredes: true,
    inicio: { x: -0.9, z: -0.65, yaw: -Math.PI / 2 },
    meta: { x: 0.9, z: -0.6, radio: 0.15 },
  }
}

/**
 * Sala con polvo para el robot aspirador (3 × 2,2 m): sofá, mueble de la tele,
 * maceta, y las patas de una mesa y de una silla, por donde el robot puede pasar.
 */
export function sala(): ArenaDef {
  const patas = (id: string, cx: number, cz: number, dx: number, dz: number, radio: number, color: string): ObjetoArena[] =>
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => ({
      id: `${id}-${i + 1}`, forma: 'cilindro', medidas: [radio, 0.4, radio], x: cx + sx * dx, z: cz + sz * dz, color, material: 'mdf',
    }))
  return {
    id: 'sala',
    nombre: 'Sala con polvo',
    descripcion: 'Una sala con muebles y el piso sucio. El robot aspirador limpia por donde pasa: ¿cuánto logra limpiar?',
    ancho: 3, largo: 2.2,
    piso: { material: 'mdf', color: '#b08a5a', reflectancia: 0.6 },
    objetos: [
      { id: 'sofa', forma: 'caja', medidas: [0.9, 0.35, 0.35], x: 0, z: -0.9, color: '#475569', material: 'mdf' },
      { id: 'mueble-tv', forma: 'caja', medidas: [0.7, 0.45, 0.25], x: 0.1, z: 0.95, color: '#78350f', material: 'mdf' },
      { id: 'maceta', forma: 'cilindro', medidas: [0.12, 0.3, 0.12], x: 1.25, z: -0.8, color: '#c2410c', material: 'pla' },
      ...patas('mesa', 0, 0.05, 0.4, 0.2, 0.02, '#92400e'),
      ...patas('silla', -1, -0.6, 0.175, 0.175, 0.015, '#57534e'),
    ],
    paredes: true,
    limpieza: { celda: 0.05 },
    inicio: { x: -1.2, z: 0.6, yaw: 0 },
  }
}

/** Mesa de 1,2 × 0,8 m a 75 cm del suelo: el robot no debe caerse. */
export function mesa(): ArenaDef {
  return {
    id: 'mesa',
    nombre: 'Mesa (¡no te caigas!)',
    descripcion: 'Un tablero elevado: si el robot pasa el borde, se cae al suelo.',
    ancho: 1.2, largo: 0.8,
    piso: { material: 'melamina', color: '#c8b08a', reflectancia: 0.75 },
    objetos: [],
    paredes: false,
    mesa: { altura: 0.75 },
    inicio: { x: -0.3, z: 0, yaw: 0.4 },
  }
}

/** Mesa de electrónica: el escritorio donde está la protoboard (no hay nada que recorrer). */
export function mesaElectronica(): ArenaDef {
  return {
    id: 'mesa-electronica',
    nombre: 'Mesa de electrónica',
    descripcion: 'El escritorio con la protoboard y la placa.',
    ancho: 0.9, largo: 0.6,
    piso: { material: 'melamina', color: '#8a6240', reflectancia: 0.5 },
    objetos: [],
    paredes: false,
    banco: true,
    // La protoboard queda al centro de la vista (la placa va a su izquierda).
    inicio: { x: 0.05, z: 0, yaw: 0 },
  }
}

export function listaArenas(): ArenaDef[] {
  return [...PISTAS.map(arenaDePista), ovaloConBarrera(), campoLibre(), campoLibre(11, 12, 'campo-explorador'), laberinto(), sala(), mesa(), dohyo('minisumo'), dohyo('sumo'), arenaCombate(), circuitoVelocidad(), mesaElectronica()]
}

export function arena(id: string): ArenaDef {
  const a = listaArenas().find(x => x.id === id)
  if (!a) throw new Error(`Arena desconocida: ${id}`)
  return a
}

/**
 * Dohyo de sumo: negro con borde blanco (los sensores de piso lo ven) y
 * elevado (si el robot sale, cae al piso). Las salidas cambian en cada ronda:
 * frente a frente, de costado y de espaldas.
 */
export function dohyo(categoria: 'minisumo' | 'sumo'): ArenaDef {
  const mini = categoria === 'minisumo'
  const radio = mini ? 0.385 : 0.77
  const d = mini ? 0.13 : 0.25        // distancia del centro a cada robot
  const lado = radio * 2 + 0.6
  return {
    id: mini ? 'dohyo-minisumo' : 'dohyo-sumo',
    nombre: mini ? 'Minisumo (dohyo 77 cm)' : 'Sumo (dohyo 154 cm)',
    descripcion: mini
      ? 'Dojo de 77 cm con borde blanco. Robots de hasta 10 × 10 cm y 500 g. Gana quien saque al otro: 2 de 3 rondas.'
      : 'Dojo de 154 cm con borde blanco. Robots de hasta 20 × 20 cm y 3 kg. Gana quien saque al otro: 2 de 3 rondas.',
    ancho: lado, largo: lado,
    piso: { material: 'melamina', color: '#0b0b0e', reflectancia: 0.05 },
    objetos: [],
    paredes: false,
    dohyo: { radio, borde: mini ? 0.025 : 0.05, altura: mini ? 0.025 : 0.05 },
    competencia: {
      tipo: 'sumo', categoria,
      maxLadoMm: mini ? 100 : 200, maxMasaG: mini ? 500 : 3000,
      espera: 5, duracionRonda: 60, puntosParaGanar: 2,
      salidas: [
        { nombre: 'Frente a frente', alumno: { x: -d, z: 0, yaw: 0 }, rival: { x: d, z: 0, yaw: Math.PI } },
        { nombre: 'De costado', alumno: { x: -d, z: 0, yaw: Math.PI / 2 }, rival: { x: d, z: 0, yaw: -Math.PI / 2 } },
        { nombre: 'De espaldas', alumno: { x: -d, z: 0, yaw: Math.PI }, rival: { x: d, z: 0, yaw: 0 } },
      ],
    },
    inicio: { x: -d, z: 0, yaw: 0 },
  }
}

/**
 * Competencia de velocidad: la pista de curvas con cronómetro. Tres vueltas
 * contra el reloj (máximo 3 minutos); salirse de la línea anula la vuelta.
 */
export function circuitoVelocidad(): ArenaDef {
  const base = PISTAS.find(p => p.id === 'curvas')!
  const pista: Pista = { ...base, id: 'circuito-velocidad', trazado: curvas }
  return {
    ...arenaDePista(pista),
    nombre: 'Competencia de velocidad (3 vueltas)',
    descripcion: 'La pista de curvas con cronómetro: tres vueltas lo más rápido posible. Si el robot se sale de la línea, la vuelta no cuenta y vuelve a la salida.',
    cronometro: { vueltas: 3, maxS: 180 },
  }
}

/**
 * Arena de combate (battlebots): 2,4 × 2,4 m de piso de acero con paredes de
 * policarbonato de 40 cm y un pozo en una esquina. Los robots salen de
 * esquinas opuestas. Un combate de 2 minutos con 100 de vida cada uno.
 */
export function arenaCombate(): ArenaDef {
  const d = 0.75
  return {
    id: 'arena-combate',
    nombre: 'Arena de combate (battlebots)',
    descripcion: 'Arena de 2,4 m con paredes altas y un pozo en la esquina. Robots de hasta 1,5 kg. KO: vida en cero, caer al pozo o quedar 10 s sin moverse.',
    ancho: 2.4, largo: 2.4,
    piso: { material: 'metal', color: '#8b939c', reflectancia: 0.35 },
    objetos: [],
    paredes: true,
    paredesAlto: 0.4,
    pozo: { x: 0.85, z: 0.85, lado: 0.4 },
    competencia: {
      tipo: 'battlebot', categoria: 'beetle',
      maxLadoMm: 300, maxMasaG: 1500,
      vida: 100, inmovilS: 10,
      espera: 3, duracionRonda: 120, puntosParaGanar: 1,
      salidas: [{ nombre: 'Esquinas opuestas', alumno: { x: -d, z: d, yaw: Math.PI / 4 }, rival: { x: d, z: -d, yaw: -3 * Math.PI / 4 } }],
    },
    inicio: { x: -d, z: d, yaw: Math.PI / 4 },
  }
}

/** Lo que ven los sensores de piso en arenas sin pista dibujada (dohyo: negro con borde blanco). */
export function reflectanciaArena(a: ArenaDef): (x: number, z: number) => number {
  const d = a.dohyo
  if (!d) return () => a.piso.reflectancia
  return (x, z) => {
    const r = Math.hypot(x, z)
    if (r > d.radio) return 0.3                       // piso del aula, más abajo
    return r >= d.radio - d.borde ? 0.92 : a.piso.reflectancia
  }
}
