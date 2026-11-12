// Seguidor de línea de competencia (modelo real): armado y lazo cerrado con su programa.
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { arena } from '../arenas'
import { encimadas, resumen } from '../engine/ensamblaje'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { ovalo } from '../engine/tracks'
import { verificar } from '../engine/verificacion'
import { PREARMADOS, construirSeguidorPro } from '../robots/prearmados'

const fx = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')

describe('seguidor de competencia', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('se arma sin piezas encimadas ni errores de cableado', () => {
    const d = construirSeguidorPro()
    expect(encimadas(d)).toEqual([])
    expect(verificar(d).filter(p => p.nivel === 'error')).toEqual([])
    const r = resumen(d)
    expect(r.masa_g).toBeLessThan(200)
    expect(r.min.y).toBeCloseTo(-14.5, 0)   // se apoya en las ruedas de 42 mm
    // El programa de prueba (fixtures/fuentes/seguidorpro.ino) es el del proyecto.
    expect(fx('fuentes/seguidorpro.ino')).toBe(d.programa.cpp)
  })

  it('recorre el óvalo con su programa real sin salirse de la línea', () => {
    const pre = PREARMADOS.find(p => p.id === 'seguidor-pro')!
    const muestras = Array.from({ length: 3000 }, (_, i) => ovalo(i / 3000))
    const cerca = (x: number, z: number) => Math.min(...muestras.map(([px, pz]) => Math.hypot(px - x, pz - z)))
    const sim = new SimSincrona(pre.construir(), arena(pre.arena), { hex: fx('seguidorpro.hex'), reflectancia: (x, z) => (cerca(x, z) < 0.0095 ? 0.07 : 0.95) })
    let maxDesvio = 0, recorrido = 0, prev = sim.robot.pose().pos
    sim.correr(15, 1 / 60, s => {
      const barra = s.robot.puntoMundo({ x: 54, y: -10, z: 0 })
      if (s.tiempo > 0.5) maxDesvio = Math.max(maxDesvio, cerca(barra.x, barra.z))
      const p = s.robot.pose().pos
      recorrido += Math.hypot(p.x - prev.x, p.z - prev.z)
      prev = p
    })
    console.log('SEGUIDOR PRO desvío', maxDesvio.toFixed(4), 'recorrido', recorrido.toFixed(2), 'vel', sim.robot.pose().velocidad.toFixed(3))
    expect(maxDesvio).toBeLessThan(0.03)
    expect(recorrido).toBeGreaterThan(2)
    sim.liberar()
  }, 300_000)
})
