// Competencia de velocidad: el juez cronometra las vueltas y el seguidor de
// velocidad (velocidad adaptativa) le gana al seguidor básico.
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { circuitoVelocidad } from '../arenas'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { curvas } from '../engine/tracks'
import { PREARMADOS } from '../robots/prearmados'

const fixture = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')
const muestras = Array.from({ length: 3000 }, (_, i) => curvas(i / 3000))
const reflectancia = (x: number, z: number) => (muestras.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.0095) ? 0.07 : 0.95)
const robot = () => PREARMADOS.find(p => p.id === 'seguidor-velocidad')!.construir()

describe('competencia de velocidad', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el seguidor de velocidad da las 3 vueltas en menos de 54 s sin salirse', () => {
    const sim = new SimSincrona(robot(), circuitoVelocidad(), { hex: fixture('seguidorvelocidad.hex'), reflectancia })
    const c = sim.cronometro!
    for (let t = 0; t < 75 && c.estado.fase !== 'final'; t += 1 / 60) sim.paso(1 / 60)
    expect(c.estado.fase).toBe('final')
    expect(c.estado.vueltas).toHaveLength(3)
    expect(c.estado.salidas).toBe(0)
    // El básico tarda ≈ 57 s en la misma pista: acelerar en las rectas gana tiempo.
    expect(c.estado.vueltas.reduce((s, v) => s + v, 0)).toBeLessThan(54)
    expect(c.estado.mejor).toBe(Math.min(...c.estado.vueltas))
    sim.liberar()
  }, 600_000)

  it('si se aleja de la línea más de 1 s, cuenta una salida y vuelve a la largada', () => {
    const a = circuitoVelocidad()
    const sim = new SimSincrona(robot(), a, { reflectancia })   // sin programa: quieto
    const c = sim.cronometro!
    sim.robot.colocar({ x: 0, z: 0, yaw: 0 })                  // en el medio de la pista, lejos de la cinta
    sim.correr(1.3)
    expect(c.estado.salidas).toBe(1)
    const p = sim.robot.pose().pos
    expect(Math.hypot(p.x - a.inicio.x, p.z - a.inicio.z)).toBeLessThan(0.02)
    sim.liberar()
  })
})
