// Lazo cerrado de los proyectos prearmados de F2.1: cada uno con su programa
// REAL (fixtures/fuentes/*.ino compilados con arduino-cli) en su arena.
import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { ovalo } from '../engine/tracks'
import { arena } from '../arenas'
import { PREARMADOS } from '../robots/prearmados'

const fx = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')

function preparar(id: string, hex: string, opciones: ConstructorParameters<typeof SimSincrona>[2] = {}) {
  const pre = PREARMADOS.find(p => p.id === id)!
  const a = arena(pre.arena)
  return { sim: new SimSincrona(pre.construir(), a, { hex: fx(hex), ...opciones }), a }
}

/** Cuadros en los que el robot toca de costado algo (caja o pared); el piso no cuenta. */
function contarChoques(sim: SimSincrona) {
  const w = sim.mundo.world, b = sim.robot.body
  let toca = false
  for (let i = 0; i < b.numColliders(); i++) {
    w.contactPairsWith(b.collider(i), otro => {
      w.contactPair(b.collider(i), otro, m => { if (m.numContacts() > 0 && Math.abs(m.normal().y) < 0.7) toca = true })
    })
  }
  return toca
}

describe('proyectos prearmados con su programa real', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('«No me caigo»: explora la mesa 30 s sin caerse', () => {
    const { sim } = preparar('anticaida', 'anticaida.hex')
    let minY = Infinity, recorrido = 0, prev = sim.robot.pose().pos
    sim.correr(30, 1 / 60, s => {
      const p = s.robot.pose().pos
      minY = Math.min(minY, p.y)
      recorrido += Math.hypot(p.x - prev.x, p.z - prev.z)
      prev = p
    })
    expect(minY).toBeGreaterThan(0.03)      // sigue sobre la mesa (cayendo estaría en −0,7 m)
    expect(recorrido).toBeGreaterThan(3)
    expect(sim.serial).toContain('Borde')   // llegó a bordes y los detectó
    sim.liberar()
  }, 300_000)

  it('«Seguidor con freno»: frena antes de la barrera y no la toca', () => {
    const muestras = Array.from({ length: 3000 }, (_, i) => ovalo(i / 3000))
    const refl = (x: number, z: number) => (muestras.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.0095) ? 0.07 : 0.95)
    const { sim } = preparar('seguidor-freno', 'seguidorfreno.hex', { reflectancia: refl })
    let choques = 0
    sim.correr(10, 1 / 60, s => { if (contarChoques(s)) choques++ })
    const p = sim.robot.pose()
    expect(choques).toBe(0)
    expect(p.velocidad).toBeLessThan(0.01)                // detenido
    expect(p.pos.x).toBeGreaterThan(0.0)                  // llegó cerca de la barrera (x = 0,35)…
    expect(p.pos.x).toBeLessThan(0.35)                    // …sin pasarla
    sim.liberar()
  }, 300_000)

  it('«Resuelve laberintos»: llega a la meta siguiendo la pared derecha', () => {
    const { sim, a } = preparar('laberinto', 'laberinto.hex')
    let llego = false
    sim.correr(90, 1 / 60, s => {
      const p = s.robot.pose().pos
      if (Math.hypot(p.x - a.meta!.x, p.z - a.meta!.z) < a.meta!.radio) llego = true
    })
    expect(llego).toBe(true)
    sim.liberar()
  }, 600_000)

  // El 4WD mide 17 cm de ancho con las ruedas y sus sensores no ven los
  // costados de las ruedas: como el robot real, a veces roza una caja al
  // pasar. Lo que se exige es que no se quede atascado y que explore.
  it('«Explorador 4WD»: explora el campo sin quedarse atascado', () => {
    const { sim } = preparar('explorador', 'explorador.hex')
    let roce = 0, seguidos = 0, maxSeguidos = 0, recorrido = 0, prev = sim.robot.pose().pos
    sim.correr(30, 1 / 60, s => {
      if (contarChoques(s)) { roce++; seguidos++; maxSeguidos = Math.max(maxSeguidos, seguidos) } else seguidos = 0
      const p = s.robot.pose().pos
      recorrido += Math.hypot(p.x - prev.x, p.z - prev.z)
      prev = p
    })
    expect(recorrido).toBeGreaterThan(3)
    expect(maxSeguidos / 60).toBeLessThan(1.5)   // ningún roce dura más de 1,5 s
    expect(roce / 1800).toBeLessThan(0.2)        // roza menos del 20 % del tiempo
    sim.liberar()
  }, 300_000)
})
