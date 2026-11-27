// Cargar a una placa real: se prueba contra bootloaders de mentira que se
// comportan como Optiboot (UNO/Nano, STK500 v1) y como el del Mega (STK500 v2):
// guardan lo que se les escribe en una memoria y lo devuelven al leer.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cargarPrograma, ErrorCarga, programaDeHex, tramaV2, type Puerto } from '../carga/protocolos'
import { parseIntelHex } from '../engine/hex'

const hex = (n: string) => readFileSync(join(__dirname, 'fixtures', n), 'utf8')

abstract class PlacaFalsa implements Puerto {
  memoria: Uint8Array
  salida: number[] = []
  entrada: number[] = []
  arranco = false
  /** Bytes que el bootloader ignora al principio (como si aún no hubiera despertado). */
  sordera = 0
  /** Si se pone, la página que empieza aquí se guarda mal (memoria dañada). */
  danar = -1
  constructor(tam: number, public firma: number[]) { this.memoria = new Uint8Array(tam).fill(0xff) }
  async escribir(bytes: number[] | Uint8Array) {
    for (const b of bytes) {
      if (this.sordera > 0) { this.sordera--; continue }
      this.entrada.push(b)
    }
    this.procesar()
  }
  async leer(n: number) {
    if (this.salida.length < n) throw new ErrorCarga('sin-respuesta')
    return Uint8Array.from(this.salida.splice(0, n))
  }
  vaciar() { this.salida = [] }
  guardar(dir: number, datos: number[]) {
    this.memoria.set(datos, dir)
    if (dir === this.danar) this.memoria[dir + 3] ^= 0x40
  }
  abstract procesar(): void
}

class Optiboot extends PlacaFalsa {
  dir = 0
  procesar() {
    for (;;) {
      const e = this.entrada
      if (!e.length) return
      const largo = e[0] === 0x55 ? 4 : e[0] === 0x64 ? (e.length >= 3 ? 5 + ((e[1] << 8) | e[2]) : Infinity) : e[0] === 0x74 ? 5 : 2
      if (e.length < largo) return
      const o = e.splice(0, largo)
      if (o[o.length - 1] !== 0x20) { this.salida.push(0x15); continue }
      let datos: number[] = []
      if (o[0] === 0x75) datos = this.firma
      else if (o[0] === 0x55) this.dir = ((o[2] << 8) | o[1]) * 2
      else if (o[0] === 0x64) { this.guardar(this.dir, o.slice(4, -1)); this.dir += o.length - 5 }
      else if (o[0] === 0x74) { const n = (o[1] << 8) | o[2]; datos = [...this.memoria.subarray(this.dir, this.dir + n)]; this.dir += n }
      else if (o[0] === 0x51) this.arranco = true
      this.salida.push(0x14, ...datos, 0x10)
    }
  }
}

class BootMega extends PlacaFalsa {
  dir = 0
  procesar() {
    for (;;) {
      const e = this.entrada
      if (e.length < 5) return
      const n = (e[2] << 8) | e[3]
      if (e.length < n + 6) return
      const trama = e.splice(0, n + 6)
      if (trama[0] !== 0x1b || trama[4] !== 0x0e || trama.reduce((a, x) => a ^ x, 0) !== 0) continue
      const m = trama.slice(5, 5 + n)
      let r: number[] = [m[0], 0]
      if (m[0] === 0x01) r = [0x01, 0, 8, ...'AVRISP_2'.split('').map(c => c.charCodeAt(0))]
      else if (m[0] === 0x1d) r = [0x1d, 0, 0, m[4], 0, m[4] === 0x30 ? this.firma[m[6]] : 0, 0]
      else if (m[0] === 0x06) this.dir = ((((m[1] << 24) | (m[2] << 16) | (m[3] << 8) | m[4]) << 1) >>> 0)
      else if (m[0] === 0x13) { const t = (m[1] << 8) | m[2]; this.guardar(this.dir, m.slice(10, 10 + t)); this.dir += t }
      else if (m[0] === 0x14) { const t = (m[1] << 8) | m[2]; r = [0x14, 0, ...this.memoria.subarray(this.dir, this.dir + t), 0]; this.dir += t }
      else if (m[0] === 0x11) this.arranco = true
      this.salida.push(...tramaV2(trama[1], r))
    }
  }
}

describe('cargar a una placa real', () => {
  it('lee el .hex igual que el emulador', () => {
    const p = programaDeHex(hex('laberinto.hex'))
    expect(p.length).toBeGreaterThan(1000)
    expect([...p]).toEqual([...parseIntelHex(hex('laberinto.hex'), 0x8000).subarray(0, p.length)])
  })

  it('UNO: escribe todo el programa, lo verifica y arranca', async () => {
    const placa = new Optiboot(0x8000, [0x1e, 0x95, 0x0f])
    const programa = programaDeHex(hex('laberinto.hex'))
    const pasos: string[] = []
    expect(await cargarPrograma(placa, 'uno', programa, (etapa, hecho, total) => { if (hecho === total) pasos.push(etapa) })).toBe(true)
    expect([...placa.memoria.subarray(0, programa.length)]).toEqual([...programa])
    expect(placa.arranco).toBe(true)
    expect(pasos).toEqual(['escribiendo', 'verificando'])
  })

  it('Nano: insiste si el bootloader tarda en despertar', async () => {
    const placa = new Optiboot(0x8000, [0x1e, 0x95, 0x0f])
    placa.sordera = 6 // se pierde los tres primeros saludos
    const programa = programaDeHex(hex('basurero.hex'))
    expect(await cargarPrograma(placa, 'nano', programa)).toBe(true)
    expect([...placa.memoria.subarray(0, programa.length)]).toEqual([...programa])
  })

  it('Mega: escribe con el protocolo v2, pasando de los 64 KB', async () => {
    const placa = new BootMega(0x40000, [0x1e, 0x98, 0x01])
    const base = programaDeHex(hex('megabarra.hex'))
    const programa = new Uint8Array(70000) // más de 64 KB para ejercitar las direcciones altas
    for (let i = 0; i < programa.length; i++) programa[i] = base[i % base.length] ^ (i >> 8)
    expect(await cargarPrograma(placa, 'mega', programa)).toBe(true)
    expect([...placa.memoria.subarray(0, programa.length)]).toEqual([...programa])
    expect(placa.arranco).toBe(true)
  })

  it('avisa si la placa conectada no es la elegida', async () => {
    const mega = new Optiboot(0x8000, [0x1e, 0x94, 0x06]) // otro chip
    await expect(cargarPrograma(mega, 'uno', programaDeHex(hex('laberinto.hex')))).rejects.toMatchObject({ motivo: 'placa-distinta' })
    expect(mega.memoria.every(b => b === 0xff)).toBe(true) // no escribió nada
  })

  it('devuelve false si nadie contesta y falla si la memoria quedó mal', async () => {
    const muda = new Optiboot(0x8000, [0x1e, 0x95, 0x0f])
    muda.sordera = Infinity
    expect(await cargarPrograma(muda, 'uno', programaDeHex(hex('laberinto.hex')))).toBe(false)
    const danada = new Optiboot(0x8000, [0x1e, 0x95, 0x0f])
    danada.danar = 256
    await expect(cargarPrograma(danada, 'uno', programaDeHex(hex('laberinto.hex')))).rejects.toMatchObject({ motivo: 'verificacion' })
  })

  it('rechaza un programa que no cabe', async () => {
    await expect(cargarPrograma(new Optiboot(0x8000, [0x1e, 0x95, 0x0f]), 'uno', new Uint8Array(33000))).rejects.toMatchObject({ motivo: 'tamano' })
  })
})
