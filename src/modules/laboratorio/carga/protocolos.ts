// Cargar un programa a una placa REAL por el cable USB, hablando con su
// «bootloader» (el programita de fábrica que recibe el código):
//  - UNO y Nano: protocolo STK500 v1 (Optiboot a 115200; Nano antiguo a 57600).
//  - Mega 2560: protocolo STK500 v2 (a 115200).
// Este archivo no sabe de navegadores: recibe un «Puerto» abstracto, así se
// puede probar con una placa de mentira (ver __tests__/cargaPlaca.test.ts).

export interface Puerto {
  escribir(bytes: number[] | Uint8Array): Promise<void>
  /** Espera exactamente `n` bytes; si no llegan en `ms`, falla con ErrorCarga('sin-respuesta'). */
  leer(n: number, ms: number): Promise<Uint8Array>
  /** Descarta lo que haya llegado y aún no se leyó. */
  vaciar(): void
}

export type MotivoCarga = 'sin-respuesta' | 'placa-distinta' | 'verificacion' | 'tamano' | 'protocolo' | 'hex'
export class ErrorCarga extends Error {
  constructor(public motivo: MotivoCarga, mensaje?: string) { super(mensaje ?? motivo) }
}

export type PlacaReal = 'uno' | 'nano' | 'mega'
export type Avance = (etapa: 'escribiendo' | 'verificando', hecho: number, total: number) => void

export const DATOS_CARGA: Record<PlacaReal, { protocolo: 1 | 2; pagina: number; maximo: number; firma: number[]; velocidades: number[] }> = {
  uno: { protocolo: 1, pagina: 128, maximo: 32256, firma: [0x1e, 0x95], velocidades: [115200] },
  // El Nano «nuevo» usa Optiboot (115200); el antiguo y muchos clones, 57600 y 2 KB de bootloader.
  nano: { protocolo: 1, pagina: 128, maximo: 30720, firma: [0x1e, 0x95], velocidades: [115200, 57600] },
  mega: { protocolo: 2, pagina: 256, maximo: 253952, firma: [0x1e, 0x98, 0x01], velocidades: [115200] },
}

/** Convierte el .hex del compilador en los bytes del programa (hasta el último byte usado). */
export function programaDeHex(hex: string): Uint8Array {
  const trozos: { dir: number; datos: number[] }[] = []
  let base = 0
  let fin = 0
  for (const cruda of hex.split(/\r?\n/)) {
    const linea = cruda.trim()
    if (!linea) continue
    if (linea[0] !== ':') throw new ErrorCarga('hex')
    const b: number[] = []
    for (let i = 1; i < linea.length; i += 2) b.push(parseInt(linea.slice(i, i + 2), 16))
    if (b.some(Number.isNaN) || b.reduce((a, x) => (a + x) & 0xff, 0) !== 0) throw new ErrorCarga('hex')
    const datos = b.slice(4, 4 + b[0])
    if (b[3] === 0x00) {
      const dir = base + ((b[1] << 8) | b[2])
      trozos.push({ dir, datos })
      fin = Math.max(fin, dir + datos.length)
    } else if (b[3] === 0x01) break
    else if (b[3] === 0x02) base = ((datos[0] << 8) | datos[1]) << 4
    else if (b[3] === 0x04) base = ((datos[0] << 8) | datos[1]) * 65536
  }
  if (!fin) throw new ErrorCarga('hex')
  const programa = new Uint8Array(fin).fill(0xff)
  for (const t of trozos) programa.set(t.datos, t.dir)
  return programa
}

function pagina(programa: Uint8Array, desde: number, tam: number): Uint8Array {
  const p = new Uint8Array(tam).fill(0xff)
  p.set(programa.subarray(desde, Math.min(programa.length, desde + tam)))
  return p
}
const iguales = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((v, i) => v === b[i])

// ───────────────────────────── STK500 v1 (UNO, Nano)
const OK_INICIO = 0x14, OK_FIN = 0x10, FIN_ORDEN = 0x20

async function ordenV1(p: Puerto, orden: number[], nRespuesta = 0, ms = 1000): Promise<Uint8Array> {
  await p.escribir([...orden, FIN_ORDEN])
  const r = await p.leer(nRespuesta + 2, ms)
  if (r[0] !== OK_INICIO || r[r.length - 1] !== OK_FIN) throw new ErrorCarga('protocolo')
  return r.subarray(1, 1 + nRespuesta)
}

/** Llama al bootloader hasta que conteste (recién reiniciada, la placa escucha ~1 segundo). */
export async function saludarV1(p: Puerto, intentos = 10): Promise<boolean> {
  for (let i = 0; i < intentos; i++) {
    p.vaciar()
    try {
      await p.escribir([0x30, FIN_ORDEN])
      const r = await p.leer(2, 250)
      if (r[0] === OK_INICIO && r[1] === OK_FIN) return true
    } catch (e) {
      if (!(e instanceof ErrorCarga)) throw e
    }
  }
  return false
}

export async function cargarV1(p: Puerto, programa: Uint8Array, placa: 'uno' | 'nano', avance?: Avance): Promise<void> {
  const d = DATOS_CARGA[placa]
  const firma = await ordenV1(p, [0x75], 3)
  if (firma[0] !== d.firma[0] || firma[1] !== d.firma[1]) throw new ErrorCarga('placa-distinta')
  await ordenV1(p, [0x50]) // entrar a modo de programación
  const direccion = (byte: number) => { const palabra = byte >> 1; return [0x55, palabra & 0xff, palabra >> 8] }
  for (let dir = 0; dir < programa.length; dir += d.pagina) {
    await ordenV1(p, direccion(dir))
    await ordenV1(p, [0x64, d.pagina >> 8, d.pagina & 0xff, 0x46, ...pagina(programa, dir, d.pagina)])
    avance?.('escribiendo', Math.min(programa.length, dir + d.pagina), programa.length)
  }
  for (let dir = 0; dir < programa.length; dir += d.pagina) {
    await ordenV1(p, direccion(dir))
    const leido = await ordenV1(p, [0x74, d.pagina >> 8, d.pagina & 0xff, 0x46], d.pagina)
    if (!iguales(leido, pagina(programa, dir, d.pagina))) throw new ErrorCarga('verificacion')
    avance?.('verificando', Math.min(programa.length, dir + d.pagina), programa.length)
  }
  await ordenV1(p, [0x51]) // salir: la placa arranca el programa nuevo
}

// ───────────────────────────── STK500 v2 (Mega 2560)
const INICIO_V2 = 0x1b, TOKEN_V2 = 0x0e

export function tramaV2(secuencia: number, cuerpo: number[]): number[] {
  const m = [INICIO_V2, secuencia & 0xff, cuerpo.length >> 8, cuerpo.length & 0xff, TOKEN_V2, ...cuerpo]
  m.push(m.reduce((a, x) => a ^ x, 0))
  return m
}

class SesionV2 {
  private secuencia = 0
  constructor(private p: Puerto) {}
  /** Envía una orden y devuelve lo que viene después de [orden, estado]. */
  async orden(cuerpo: number[], ms = 2000): Promise<Uint8Array> {
    this.secuencia = (this.secuencia + 1) & 0xff
    await this.p.escribir(tramaV2(this.secuencia, cuerpo))
    const cab = await this.p.leer(5, ms)
    if (cab[0] !== INICIO_V2 || cab[1] !== this.secuencia || cab[4] !== TOKEN_V2) throw new ErrorCarga('protocolo')
    const n = (cab[2] << 8) | cab[3]
    const resto = await this.p.leer(n + 1, ms)
    let suma = 0
    for (const x of cab) suma ^= x
    for (const x of resto) suma ^= x
    if (suma !== 0 || resto[0] !== cuerpo[0] || resto[1] !== 0x00) throw new ErrorCarga('protocolo')
    return resto.subarray(2, n)
  }
}

export async function saludarV2(p: Puerto, intentos = 8): Promise<boolean> {
  for (let i = 0; i < intentos; i++) {
    p.vaciar()
    try {
      await new SesionV2(p).orden([0x01], 300)
      return true
    } catch (e) {
      if (!(e instanceof ErrorCarga)) throw e
    }
  }
  return false
}

export async function cargarV2(p: Puerto, programa: Uint8Array, avance?: Avance): Promise<void> {
  const d = DATOS_CARGA.mega
  const s = new SesionV2(p)
  await s.orden([0x01]) // presentarse
  const firma: number[] = []
  for (let i = 0; i < 3; i++) firma.push((await s.orden([0x1d, 4, 4, 0, 0x30, 0, i, 0]))[3])
  if (firma.some((v, i) => v !== d.firma[i])) throw new ErrorCarga('placa-distinta')
  await s.orden([0x10, 200, 100, 25, 32, 0, 0x53, 3, 0xac, 0x53, 0, 0]) // modo de programación
  // La dirección va en palabras; el bit más alto avisa que la memoria pasa de 64 KB.
  const direccion = (byte: number) => { const w = byte >> 1; return [0x06, 0x80 | ((w >>> 24) & 0x7f), (w >> 16) & 0xff, (w >> 8) & 0xff, w & 0xff] }
  for (let dir = 0; dir < programa.length; dir += d.pagina) {
    await s.orden(direccion(dir))
    await s.orden([0x13, d.pagina >> 8, d.pagina & 0xff, 0xc1, 0x0a, 0x40, 0x4c, 0x20, 0, 0, ...pagina(programa, dir, d.pagina)])
    avance?.('escribiendo', Math.min(programa.length, dir + d.pagina), programa.length)
  }
  for (let dir = 0; dir < programa.length; dir += d.pagina) {
    await s.orden(direccion(dir))
    const leido = (await s.orden([0x14, d.pagina >> 8, d.pagina & 0xff, 0x20])).subarray(0, d.pagina)
    if (!iguales(leido, pagina(programa, dir, d.pagina))) throw new ErrorCarga('verificacion')
    avance?.('verificando', Math.min(programa.length, dir + d.pagina), programa.length)
  }
  await s.orden([0x11, 1, 1]) // salir: arranca el programa
}

/** Con el bootloader ya escuchando: saluda y carga. Devuelve false si la placa no contestó el saludo. */
export async function cargarPrograma(p: Puerto, placa: PlacaReal, programa: Uint8Array, avance?: Avance): Promise<boolean> {
  if (programa.length > DATOS_CARGA[placa].maximo) throw new ErrorCarga('tamano')
  if (DATOS_CARGA[placa].protocolo === 2) {
    if (!(await saludarV2(p))) return false
    await cargarV2(p, programa, avance)
  } else {
    if (!(await saludarV1(p))) return false
    await cargarV1(p, programa, placa as 'uno' | 'nano', avance)
  }
  return true
}
