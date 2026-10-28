import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { generarArduino, type BloqueJson, type ProgramaBloques } from '../bloques/generador'
import { SEGUIDOR_EN_BLOQUES } from '../bloques/definiciones'
import { autocablear } from '../engine/autocableado'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { PISTAS, ovalo } from '../engine/tracks'
import { arenaDePista } from '../arenas'
import { construirEvitaObstaculos, construirSeguidor } from '../robots/prearmados'

const tabla = (doc: ReturnType<typeof construirSeguidor>) => autocablear(doc, { conservar: true }).tabla
const programa = (siempre: BloqueJson, variables: ProgramaBloques['variables'] = []): ProgramaBloques =>
  ({ blocks: { blocks: [{ type: 'cb_siempre', inputs: { DO: { block: siempre } } }] }, variables })
const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } })

describe('bloques → código Arduino', () => {
  it('el seguidor en bloques genera el mismo comportamiento que el de C++', () => {
    const doc = construirSeguidor()
    const { cpp, avisos } = generarArduino(SEGUIDOR_EN_BLOQUES, doc, tabla(doc))
    expect(avisos).toEqual([])
    expect(cpp).toContain('const int LINEA_IZQ = 2;')
    expect(cpp).toContain('if (digitalRead(LINEA_IZQ) == HIGH) {')
    expect(cpp).toContain('motores(vel(59), vel(59));   // avanzar')
  })

  it('respeta la precedencia de las operaciones', () => {
    const doc = construirSeguidor()
    const suma = { type: 'math_arithmetic', fields: { OP: 'ADD' }, inputs: { A: n(1), B: n(2) } }
    const prod = { type: 'math_arithmetic', fields: { OP: 'MULTIPLY' }, inputs: { A: { block: suma }, B: n(3) } }
    const { cpp } = generarArduino(programa({ type: 'cb_imprimir', inputs: { TEXTO: { block: prod } } } as BloqueJson), doc, tabla(doc))
    expect(cpp).toContain('Serial.println((1 + 2) * 3);')
  })

  it('las variables se declaran con un nombre válido en C', () => {
    const doc = construirSeguidor()
    const set = { type: 'variables_set', fields: { VAR: { id: 'v1' } }, inputs: { VALUE: n(5) } }
    const { cpp } = generarArduino(programa(set as BloqueJson, [{ id: 'v1', name: 'vueltas dadas' }]), doc, tabla(doc))
    expect(cpp).toContain('float vueltas_dadas = 0;')
    expect(cpp).toContain('vueltas_dadas = 5;')
  })

  it('avisa si un bloque usa una pieza que el robot no tiene', () => {
    const doc = construirSeguidor() // sin ultrasonido ni servo
    const si = { type: 'controls_if', inputs: { IF0: { block: { type: 'logic_compare', fields: { OP: 'LT' }, inputs: { A: { block: { type: 'cb_distancia' } }, B: n(20) } } } } }
    const { avisos } = generarArduino(programa(si as BloqueJson), doc, tabla(doc))
    expect(avisos.some(a => a.includes('ultrasonido'))).toBe(true)
  })

  it('con ultrasonido y servo incluye la librería y las funciones', () => {
    const doc = construirEvitaObstaculos()
    const servo = { type: 'cb_servo', inputs: { ANG: n(45) }, next: { block: { type: 'cb_imprimir', inputs: { TEXTO: { block: { type: 'cb_distancia' } } } } } }
    const { cpp, avisos } = generarArduino(programa(servo as BloqueJson), doc, tabla(doc))
    expect(avisos).toEqual([])
    expect(cpp).toContain('#include <Servo.h>')
    expect(cpp).toContain('servo.attach(SERVO_PIN);')
    expect(cpp).toContain('long medirCm()')
  })

  it('el seguidor hecho con bloques (compilado de verdad) recorre el óvalo', async () => {
    await iniciarRapier()
    const muestras = Array.from({ length: 3000 }, (_, i) => ovalo(i / 3000))
    const cerca = (x: number, z: number) => Math.min(...muestras.map(([px, pz]) => Math.hypot(px - x, pz - z)))
    const sim = new SimSincrona(construirSeguidor(), arenaDePista(PISTAS.find(p => p.id === 'ovalo')!), {
      hex: fs.readFileSync(path.join(__dirname, 'fixtures', 'seguidor-bloques.hex'), 'utf8'),
      reflectancia: (x, z) => (cerca(x, z) < 0.0095 ? 0.07 : 0.95),
    })
    let maxDesvio = 0
    sim.correr(10, 1 / 60, s => {
      const p = s.robot.puntoMundo({ x: 100, y: -35, z: 0 })
      if (s.tiempo > 0.5) maxDesvio = Math.max(maxDesvio, cerca(p.x, p.z))
    })
    expect(sim.serial).toContain('Seguidor listo')
    expect(maxDesvio).toBeLessThan(0.03)
    sim.liberar()
  }, 300_000)
})
