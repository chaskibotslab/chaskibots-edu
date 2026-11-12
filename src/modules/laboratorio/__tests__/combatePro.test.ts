// Robots de combate con modelo real: RipTide (tambor), Fathom (4 ruedas) y Cuña (pala).
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { arenaCombate } from '../arenas'
import { encimadas, resumen } from '../engine/ensamblaje'
import { revisarReglamento } from '../engine/competencia'
import { iniciarRapier } from '../engine/fisica/mundo'
import { planDe } from '../engine/plan'
import { SimSincrona } from '../engine/simSincrona'
import { verificar } from '../engine/verificacion'
import { construirCuna, construirFathom, construirRiptide, construirWarbot } from '../robots/prearmados'

const fixture = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')
const giro = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a)))

const ROBOTS = [
  { nombre: 'RipTide', construir: construirRiptide, hex: 'warbottambor.hex' },
  { nombre: 'Fathom', construir: construirFathom, hex: 'rcnano.hex' },
  { nombre: 'Cuña', construir: construirCuna, hex: 'rcnano.hex' },
]

describe('robots de combate con modelo real', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('cumplen el reglamento, nada encimado y bien cableados', () => {
    for (const r of ROBOTS) {
      const d = r.construir()
      const m = resumen(d)
      const reglas = revisarReglamento(arenaCombate().competencia!, { largo: m.max.x - m.min.x, ancho: m.max.z - m.min.z, masa: m.masa_g })
      expect(reglas.every(x => x.ok), r.nombre).toBe(true)
      expect(encimadas(d), r.nombre).toEqual([])
      expect(verificar(d).filter(p => p.nivel === 'error'), r.nombre).toEqual([])
      expect(d.conexion).toBe('pcb')
    }
    // Los programas de prueba son los de los proyectos.
    expect(construirRiptide().programa.cpp).toBe(construirWarbot('tambor').programa.cpp)
    const rc = fixture('fuentes/rcnano.ino').split('\r').join('')
    expect(construirFathom().programa.cpp).toBe(rc)
    expect(construirCuna().programa.cpp).toBe(rc)
    expect(planDe(construirFathom()).motores.filter(m => m.polaridad !== 0).length).toBe(4)
    expect(planDe(construirRiptide()).armas[0].alimentado).toBe(true)
  })

  for (const r of ROBOTS) {
    it(`${r.nombre}: avanza derecho, gira en el lugar y queda de pie`, () => {
      const sim = new SimSincrona(r.construir(), arenaCombate(), { hex: fixture(r.hex), rival: 'quieto' })
      sim.correr(3.5)                                   // pasa la cuenta
      const p0 = sim.robot.pose()
      // Tramos cortos: a fondo cruzan la arena en un segundo y chocan con el rival.
      sim.avr!.serialWrite('9F')
      sim.correr(0.4)
      const p1 = sim.robot.pose()
      const avance = Math.hypot(p1.pos.x - p0.pos.x, p1.pos.z - p0.pos.z)
      sim.avr!.serialWrite('L')
      sim.correr(0.5)
      const p2 = sim.robot.pose()
      console.log(r.nombre, 'avance', avance.toFixed(2), 'desvio', giro(p0.yaw, p1.yaw).toFixed(2), 'giro', giro(p1.yaw, p2.yaw).toFixed(2), 'y', p0.pos.y.toFixed(4), p2.pos.y.toFixed(4))
      expect(avance).toBeGreaterThan(0.2)
      expect(giro(p0.yaw, p1.yaw)).toBeLessThan(0.25)
      expect(giro(p1.yaw, p2.yaw)).toBeGreaterThan(0.3)
      // No se vuelca: frena de golpe, da marcha atrás y sigue a la misma altura sobre sus ruedas.
      sim.avr!.serialWrite('B')
      sim.correr(0.4)
      sim.avr!.serialWrite('R')
      sim.correr(0.5)
      sim.avr!.serialWrite('S')
      sim.correr(0.6)
      console.log(r.nombre, 'y al final', sim.robot.pose().pos.y.toFixed(4))
      expect(Math.abs(sim.robot.pose().pos.y - p0.pos.y)).toBeLessThan(0.006)
      if (sim.robot.armas.length) {
        sim.avr!.serialWrite('SX')
        sim.correr(4)
        expect(sim.robot.armas[0].omega).toBeGreaterThan(0.9 * sim.robot.armas[0].omegaMax)
        expect(Math.abs(sim.robot.pose().pos.y - p0.pos.y)).toBeLessThan(0.02)
      }
      sim.liberar()
    }, 300_000)
  }

  // Fathom no entra aquí: de frente contra el tambor del rival sale volando (hay que atacar de costado).
  it('la Cuña se mete debajo del rival y lo empuja', () => {
    for (const r of ROBOTS.slice(2)) {
      const sim = new SimSincrona(r.construir(), arenaCombate(), { hex: fixture(r.hex), rival: 'quieto' })
      const c = sim.competencia!
      sim.correr(3.5)
      const r0 = { ...c.rival.fisica.pose().pos }
      let ultima = ''
      for (let t = 0; t < 12 && c.estado.fase === 'combate'; t += 1 / 60) {
        sim.paso(1 / 60)
        const p = sim.robot.pose(), q = c.rival.fisica.pose().pos
        const rumbo = Math.atan2(-(q.z - p.pos.z), q.x - p.pos.x)
        const error = Math.atan2(Math.sin(rumbo - p.yaw), Math.cos(rumbo - p.yaw))
        const letra = error > 0.3 ? 'L' : error < -0.3 ? 'R' : 'F'
        if (letra !== ultima) { sim.avr!.serialWrite((ultima ? '' : '9') + letra); ultima = letra }
      }
      const r1 = c.rival.fisica.pose().pos
      const movido = Math.hypot(r1.x - r0.x, r1.z - r0.z)
      console.log(r.nombre, 'movió al rival', movido.toFixed(2), 'm; fase', c.estado.fase, JSON.stringify(c.estado.vida))
      expect(movido, r.nombre).toBeGreaterThan(0.3)
      sim.liberar()
    }
  }, 600_000)
})
