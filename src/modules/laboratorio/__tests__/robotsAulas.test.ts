// Robots del paso C6: primeros motores, robot aspirador (sala con polvo) y Robô WiFi.
// Los .hex salen de compilar fixtures/fuentes con arduino-cli (el Robô WiFi, con la
// capa del ESP32, para el ATmega2560).
import { beforeAll, describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { campoLibre, sala } from '../arenas'
import { encimadas } from '../engine/ensamblaje'
import { iniciarRapier } from '../engine/fisica/mundo'
import { Limpieza } from '../engine/limpieza'
import { SimSincrona } from '../engine/simSincrona'
import { verificar } from '../engine/verificacion'
import { construirAspirador, construirPrimerosMotores, construirRoboWifi } from '../robots/prearmados'

const hex = (n: string) => fs.readFileSync(path.join(__dirname, 'fixtures', `${n}.hex`), 'utf8')

describe('sala con polvo', () => {
  it('debajo de los muebles no hay polvo y el robot limpia por donde pasa', () => {
    const l = new Limpieza(sala())
    expect(l.porcentaje).toBe(0)
    const sofa = sala().objetos.find(o => o.id === 'sofa')!
    const i = (x: number, z: number) => Math.floor((z + 1.1) / 0.05) * l.cols + Math.floor((x + 1.5) / 0.05)
    expect(l.celdas[i(sofa.x, sofa.z)]).toBe(2)
    l.barrer(-1.2, 0.6)
    expect(l.celdas[i(-1.2, 0.6)]).toBe(0)
    expect(l.porcentaje).toBeGreaterThan(0)
    l.reiniciar()
    expect(l.porcentaje).toBe(0)
  })
})

describe('robots de C6', () => {
  beforeAll(async () => { await iniciarRapier() })

  it('se arman sin errores ni piezas encimadas', () => {
    for (const d of [construirPrimerosMotores(), construirAspirador(), construirRoboWifi()]) {
      expect(verificar(d).filter(x => x.nivel === 'error'), d.nombre).toEqual([])
      expect(encimadas(d), d.nombre).toEqual([])
    }
  })

  it('primeros motores: dibuja un cuadrado (esquinas de 90°) y vuelve a donde salió', () => {
    const s = new SimSincrona(construirPrimerosMotores(), campoLibre(), { hex: hex('primerosmotores') })
    const inicio = s.robot.pose().pos
    // 1 s de espera; cada lado dura 1,2 s de avance + 0,2 + 0,25 de giro + 0,2.
    s.correr(1 + 1.2 + 0.1)
    const yaws = [s.robot.pose().yaw]
    for (let i = 0; i < 4; i++) { s.correr(1.85); yaws.push(s.robot.pose().yaw) }
    const giros = yaws.slice(1).map((y, i) => (((y - yaws[i]) * 180 / Math.PI) % 360 + 360) % 360)
    for (const g of giros) expect(Math.abs(g - 90), `giros: ${giros.map(x => x.toFixed(0))}`).toBeLessThan(10)
    const fin = s.robot.pose().pos  // acaba de cerrar el cuadrado
    expect(Math.hypot(fin.x - inicio.x, fin.z - inicio.z)).toBeLessThan(0.15)
    s.liberar()
  }, 300_000)

  it('aspirador: en 2 minutos limpia buena parte de la sala sin quedarse trabado', () => {
    const s = new SimSincrona(construirAspirador(), sala(), { hex: hex('aspirador') })
    const porMinuto: number[] = []
    let minX = 9, maxX = -9
    for (let m = 0; m < 2; m++) {
      s.correr(60, 1 / 60, x => { const p = x.robot.pose().pos; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x) })
      porMinuto.push(s.limpieza!.porcentaje)
    }
    console.log('aspirador, % limpio por minuto:', porMinuto.map(p => p.toFixed(1)).join(' → '))
    // Llega a los dos lados de la mesa (no se queda en un rincón) y sigue limpiando.
    expect(minX).toBeLessThan(-1)
    expect(maxX).toBeGreaterThan(0.8)
    expect(porMinuto[0]).toBeGreaterThan(8)
    expect(porMinuto[1]).toBeGreaterThan(porMinuto[0] + 10)
    s.liberar()
  }, 900_000)

  it('Robô WiFi: cada letra del control es una visita a su página (/F avanza, /S frena)', () => {
    const s = new SimSincrona(construirRoboWifi(), campoLibre(), { hex: hex('robowifi') })
    s.correr(0.5)
    expect(s.serial).toContain('192.168.4.1')
    const x0 = s.robot.pose().pos.x
    s.avr!.serialWrite('9F')
    s.correr(1)
    const x1 = s.robot.pose().pos.x
    expect(x1 - x0).toBeGreaterThan(0.1)  // sale mirando a +x
    s.avr!.serialWrite('S')
    s.correr(1)
    expect(s.robot.pose().velocidad).toBeLessThan(0.02)
    s.liberar()
  }, 300_000)
})
