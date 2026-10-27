// Lazo cerrado F2: los binarios REALES de los prearmados manejan el robot
// construido desde sus piezas. Si el ensamblaje, el cableado, los sensores o
// la física estuvieran mal, el seguidor se saldría de la línea y el evita
// obstáculos chocaría.
import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { PISTAS, ovalo, curvas } from '../engine/tracks'
import { arenaDePista, campoLibre } from '../arenas'
import { construirEvitaObstaculos, construirSeguidor } from '../robots/prearmados'

const CINTA = 0.019
const fixture = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')

function distancia(muestras: [number, number][], x: number, z: number) {
  let mejor = Infinity, idx = 0
  muestras.forEach(([px, pz], i) => {
    const d = Math.hypot(px - x, pz - z)
    if (d < mejor) { mejor = d; idx = i }
  })
  return { d: mejor, idx }
}

function recorrer(idPista: string, curva: (t: number) => [number, number], segundos: number) {
  const muestras = Array.from({ length: 3000 }, (_, i) => curva(i / 3000))
  const arena = arenaDePista(PISTAS.find(p => p.id === idPista)!)
  const doc = construirSeguidor()
  const sim = new SimSincrona(doc, arena, {
    hex: fixture('seguidor.hex'),
    reflectancia: (x, z) => (distancia(muestras, x, z).d < CINTA / 2 ? 0.07 : 0.95),
  })
  let maxDesvio = 0, avance = 0
  let idxPrevio = distancia(muestras, arena.inicio.x, arena.inicio.z).idx
  sim.correr(segundos, 1 / 60, s => {
    // Punto medio entre los dos sensores (x = sensores, z = 0).
    const p = s.robot.puntoMundo({ x: 100, y: -35, z: 0 })
    const { d, idx } = distancia(muestras, p.x, p.z)
    if (s.tiempo > 0.5) maxDesvio = Math.max(maxDesvio, d)
    let paso = idx - idxPrevio
    if (paso > muestras.length / 2) paso -= muestras.length
    if (paso < -muestras.length / 2) paso += muestras.length
    avance += paso
    idxPrevio = idx
  })
  sim.liberar()
  return { maxDesvio, vueltas: avance / muestras.length }
}

describe('lazo cerrado con robots armados por piezas', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el seguidor prearmado recorre el óvalo sin salirse de la línea', () => {
    const { maxDesvio, vueltas } = recorrer('ovalo', ovalo, 12)
    expect(maxDesvio).toBeLessThan(0.03)
    expect(vueltas).toBeGreaterThan(0.4)
  }, 120_000)

  it('también sigue la pista de curvas suaves', () => {
    const { maxDesvio, vueltas } = recorrer('curvas', curvas, 12)
    expect(maxDesvio).toBeLessThan(0.035)
    expect(vueltas).toBeGreaterThan(0.4)
  }, 120_000)

  it('el evita obstáculos recorre el campo libre sin chocar', () => {
    const arena = campoLibre(7)
    const sim = new SimSincrona(construirEvitaObstaculos(), arena, { hex: fixture('evita.hex') })
    const radio = 0.11 // mitad del largo del robot + margen
    let minDist = Infinity, recorrido = 0
    let prev = { x: arena.inicio.x, z: arena.inicio.z }
    sim.correr(30, 1 / 60, s => {
      const p = s.robot.pose().pos
      recorrido += Math.hypot(p.x - prev.x, p.z - prev.z)
      prev = { x: p.x, z: p.z }
      for (const o of arena.objetos) {
        // Distancia del centro del robot al borde de la caja (aprox. circular).
        const d = Math.hypot(p.x - o.x, p.z - o.z) - (o.medidas[0] / 2) * Math.SQRT2
        minDist = Math.min(minDist, d)
      }
      // Paredes
      minDist = Math.min(minDist, arena.ancho / 2 - Math.abs(p.x), arena.largo / 2 - Math.abs(p.z))
    })
    expect(sim.serial).toContain('Distancia')
    expect(recorrido).toBeGreaterThan(3)
    expect(minDist).toBeGreaterThan(radio * 0.5)
    sim.liberar()
  }, 240_000)
})
