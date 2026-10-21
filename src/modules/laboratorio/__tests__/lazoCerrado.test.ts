// Prueba de lazo cerrado: el binario REAL del seguidor de línea (compilado
// con arduino-cli) maneja el robot simulado sobre la pista. Si el puente
// pines↔física, los sensores o el modelo de motores estuvieran mal, el robot
// se saldría de la línea.
import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AvrRunner, CPU_FREQ_HZ } from '../engine/avrRunner'
import { RobotFisico, iniciarRapier } from '../engine/physics'
import { planFromRobot } from '../engine/netlist'
import { leerSensores, aplicarPines } from '../engine/nucleo'
import { PISTAS, ovalo, curvas } from '../engine/tracks'
import { SEGUIDOR_LINEA } from '../robots/seguidorLinea'

const CINTA = 0.019

function muestrasDe(f: (t: number) => [number, number], n = 3000) {
  return Array.from({ length: n }, (_, i) => f(i / n))
}

function distancia(muestras: [number, number][], x: number, z: number) {
  let mejor = Infinity, idx = 0
  muestras.forEach(([px, pz], i) => {
    const d = Math.hypot(px - x, pz - z)
    if (d < mejor) { mejor = d; idx = i }
  })
  return { d: mejor, idx }
}

function recorrer(idPista: string, curva: (t: number) => [number, number], segundos: number) {
  const muestras = muestrasDe(curva)
  const pista = PISTAS.find(p => p.id === idPista)!
  const plan = planFromRobot(SEGUIDOR_LINEA)
  const fisica = new RobotFisico(SEGUIDOR_LINEA, plan.masaKg, 'tierra', pista.inicio)
  const avr = new AvrRunner(fs.readFileSync(path.join(__dirname, 'fixtures', 'seguidor.hex'), 'utf8'))
  // Reflectancia "analítica": negro a menos de media cinta de la línea.
  const refl = (x: number, z: number) => (distancia(muestras, x, z).d < CINTA / 2 ? 0.07 : 0.95)

  const dt = 1 / 60
  let maxDesvio = 0
  let avance = 0
  let idxPrevio = distancia(muestras, pista.inicio.x, pista.inicio.z).idx
  for (let t = 0; t < segundos; t += dt) {
    const e = leerSensores(plan, fisica, refl)
    for (const [pin, v] of Object.entries(e.digital)) avr.setDigitalInput(pin, v)
    for (const [pin, v] of Object.entries(e.analog)) avr.setAnalogInput(pin, v)
    const r = avr.run(dt * CPU_FREQ_HZ)
    aplicarPines(plan, fisica, r.pins, r.cycles / CPU_FREQ_HZ)

    // Desvío del centro entre los dos sensores respecto de la línea.
    const c = fisica.puntoMundo([95, -20, 0])
    const { d, idx } = distancia(muestras, c.x, c.z)
    if (t > 0.5) maxDesvio = Math.max(maxDesvio, d)
    let paso = idx - idxPrevio
    if (paso > muestras.length / 2) paso -= muestras.length
    if (paso < -muestras.length / 2) paso += muestras.length
    avance += paso
    idxPrevio = idx
  }
  fisica.liberar()
  return { maxDesvio, vueltas: avance / muestras.length }
}

describe('lazo cerrado: sketch real + física + pista', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('el seguidor recorre el óvalo sin salirse de la línea', () => {
    const { maxDesvio, vueltas } = recorrer('ovalo', ovalo, 12)
    expect(maxDesvio).toBeLessThan(0.03)   // nunca a más de 3 cm de la cinta
    expect(vueltas).toBeGreaterThan(0.4)   // avanzó en el sentido correcto
  }, 120_000)

  it('también sigue la pista de curvas suaves', () => {
    const { maxDesvio, vueltas } = recorrer('curvas', curvas, 12)
    expect(maxDesvio).toBeLessThan(0.035)
    expect(vueltas).toBeGreaterThan(0.4)
  }, 120_000)
})
