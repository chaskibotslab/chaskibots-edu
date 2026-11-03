// Minisumo RC y placas que caben: cada placa en cada robot, y el manejo con letras.
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { dohyo } from '../arenas'
import { encimadas, encastrar, motivoNoEncastra, reemplazar, resumen, robotVacio } from '../engine/ensamblaje'
import { revisarReglamento } from '../engine/competencia'
import { iniciarRapier } from '../engine/fisica/mundo'
import { SimSincrona } from '../engine/simSincrona'
import { verificar } from '../engine/verificacion'
import { pinCodigo, pinDePlaca, autocablear } from '../engine/autocableado'
import { conPlacaDe } from './utilPlacas'
import { PREARMADOS, construirMinisumo, construirMinisumoRc, programaConPinesNuevos } from '../robots/prearmados'

const fixture = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8')
const reglas = (d: ReturnType<typeof robotVacio>) => {
  const r = resumen(d)
  return revisarReglamento(dohyo('minisumo').competencia!, { largo: r.max.x - r.min.x, ancho: r.max.z - r.min.z, masa: r.masa_g })
}

describe('las placas respetan los espacios', () => {
  it('Nano, ESP32 y Pico caben abajo en el minisumo y cumplen los 10 × 10 cm', () => {
    for (const placa of ['arduino-nano', 'esp32-devkit', 'raspberry-pico']) {
      const d = reemplazar(construirMinisumo(), 'arduino-nano-v3', placa).doc
      expect(encimadas(d), placa).toEqual([])
      expect(reglas(d).every(x => x.ok), placa).toBe(true)
    }
  })

  it('el UNO no entra abajo: el aviso manda al piso de arriba, y ahí sí cabe a lo largo', () => {
    expect(() => reemplazar(construirMinisumo(), 'arduino-nano-v3', 'arduino-uno')).toThrow(/no cabe ahí/)
    const vacio = robotVacio('chasis-minisumo')
    expect(motivoNoEncastra(vacio, 'arduino-uno', 'chasis', 'placa')).toMatch(/se saldría de la base.*Piso de arriba/)
    const { doc, id } = encastrar(vacio, 'piso-arriba-minisumo', 'chasis', 'arriba')
    expect(motivoNoEncastra(doc, 'arduino-uno', id, 'placa')).toMatch(/«Placa grande/)
    expect(motivoNoEncastra(doc, 'arduino-uno', id, 'placa-centro')).toBeNull()
  })

  it('el Mega es demasiado grande para el minisumo, aun con el piso de arriba', () => {
    expect(motivoNoEncastra(robotVacio('chasis-minisumo'), 'arduino-mega', 'chasis', 'placa')).toMatch(/demasiado grande/)
  })

  it('las cinco placas caben en los chasis 2WD y 4WD de cada robot', () => {
    for (const p of PREARMADOS.filter(x => (x.categoria ?? 'robot') === 'robot' && !x.id.startsWith('minisumo'))) {
      for (const placa of ['arduino-uno', 'arduino-nano', 'arduino-mega', 'esp32-devkit', 'raspberry-pico']) {
        expect(encimadas(conPlacaDe(p.construir(), placa)), `${p.id} con ${placa}`).toEqual([])
      }
    }
  })

  it('cambiar de placa rehace una plantilla sin tocar con los pines nuevos', () => {
    const antes = construirMinisumo()
    const cambiado = reemplazar(antes, 'arduino-nano-v3', 'esp32-devkit').doc
    const nuevo = { ...cambiado, cables: autocablear(cambiado).cables }
    const r = programaConPinesNuevos(antes, nuevo, 'minisumo')
    expect(r.desactualizado).toBe(false)
    const { tabla } = autocablear(nuevo, { conservar: true })
    const trig = nuevo.piezas.find(p => p.pieza === 'hcsr04')!.id
    expect(r.doc.programa.cpp).toContain(`TRIG = ${pinCodigo(pinDePlaca(tabla, trig, 'TRIG'))};`)
    expect(r.doc.programa.cpp).not.toBe(antes.programa.cpp)

    const editado = { ...antes, programa: { modo: 'codigo' as const, cpp: '// mío\n' + antes.programa.cpp } }
    const r2 = programaConPinesNuevos(editado, { ...nuevo, programa: editado.programa }, 'minisumo')
    expect(r2.doc.programa.cpp).toBe(editado.programa.cpp)
    expect(r2.desactualizado).toBe(true)
  })
})

describe('minisumo RC', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('cumple el reglamento y está bien cableado', () => {
    const d = construirMinisumoRc()
    expect(reglas(d).every(x => x.ok)).toBe(true)
    expect(encimadas(d)).toEqual([])
    expect(verificar(d).filter(p => p.nivel === 'error')).toEqual([])
  })

  it('combate real: obedece las letras y saca al rival quieto', () => {
    const sim = new SimSincrona(construirMinisumoRc(), dohyo('minisumo'), { hex: fixture('minisumorc.hex'), rival: 'quieto' })
    const c = sim.competencia!
    // Un piloto como el alumno: nada en la cuenta; después, velocidad 9, apuntar al rival y empujar.
    let ultima = ''
    let quieto = true
    sim.correr(30, 1 / 60, s => {
      const p = s.robot.pose()
      if (c.estado.fase === 'cuenta') {
        ultima = ''
        if (p.velocidad > 0.02) quieto = false
      }
      if (c.estado.fase !== 'combate') return
      const r = c.rival.fisica.pose().pos
      const error = Math.atan2(Math.sin(Math.atan2(-(r.z - p.pos.z), r.x - p.pos.x) - p.yaw), Math.cos(Math.atan2(-(r.z - p.pos.z), r.x - p.pos.x) - p.yaw))
      const letra = error > 0.3 ? 'L' : error < -0.3 ? 'R' : 'F'
      if (letra !== ultima) { s.avr!.serialWrite((ultima ? '' : '9') + letra); ultima = letra }
    })
    expect(quieto).toBe(true)
    expect(c.estado.marcador.alumno).toBeGreaterThan(c.estado.marcador.rival)
    sim.liberar()
  }, 600_000)
})
