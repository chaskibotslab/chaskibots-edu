// El lado «navegador» de cargar a una placa real: Web Serial (Chrome y Edge
// de computadora). Abre el puerto USB, reinicia la placa con la señal DTR
// (lo mismo que hace el Arduino IDE) y le pasa el puerto a los protocolos.

import { cargarPrograma, DATOS_CARGA, ErrorCarga, programaDeHex, type Avance, type PlacaReal, type Puerto } from './protocolos'

/** Lo mínimo de Web Serial que usamos (TypeScript no trae estos tipos). */
export interface PuertoUsb {
  open(o: { baudRate: number; bufferSize?: number }): Promise<void>
  close(): Promise<void>
  setSignals(s: { dataTerminalReady?: boolean; requestToSend?: boolean }): Promise<void>
  readable: ReadableStream<Uint8Array> | null
  writable: WritableStream<Uint8Array> | null
}
interface SerieNavegador { requestPort(): Promise<PuertoUsb>; getPorts(): Promise<PuertoUsb[]> }

const serie = (): SerieNavegador | undefined => (typeof navigator === 'undefined' ? undefined : (navigator as unknown as { serial?: SerieNavegador }).serial)
export const puedeCargar = () => !!serie()
const esperar = (ms: number) => new Promise<void>(ok => setTimeout(ok, ms))

/** Abre la ventanita del navegador para elegir el puerto. Debe llamarse desde un clic. Devuelve null si la cierran. */
export async function elegirPuerto(): Promise<PuertoUsb | null> {
  const s = serie()
  if (!s) return null
  try { return await s.requestPort() } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') return null // cerró la ventanita sin elegir
    throw e
  }
}

/** Envuelve un puerto abierto con una cola de lectura con tiempo de espera. */
function conectar(usb: PuertoUsb) {
  const lector = usb.readable!.getReader()
  const escritor = usb.writable!.getWriter()
  let cola = new Uint8Array(0)
  const aviso: { fn: (() => void) | null } = { fn: null }
  let cerrado = false
  const bomba = (async () => {
    try {
      for (;;) {
        const { value, done } = await lector.read()
        if (done) break
        if (value?.length) {
          const junta = new Uint8Array(cola.length + value.length)
          junta.set(cola); junta.set(value, cola.length)
          cola = junta
          aviso.fn?.()
        }
      }
    } catch { /* puerto desconectado: las lecturas pendientes vencen solas */ }
    cerrado = true
    aviso.fn?.()
  })()
  const puerto: Puerto = {
    escribir: bytes => escritor.write(bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes)),
    vaciar: () => { cola = new Uint8Array(0) },
    async leer(n, ms) {
      const limite = Date.now() + ms
      while (cola.length < n) {
        const falta = limite - Date.now()
        if (falta <= 0 || cerrado) throw new ErrorCarga('sin-respuesta')
        await new Promise<void>(ok => { const t = setTimeout(ok, falta); aviso.fn = () => { clearTimeout(t); ok() } })
        aviso.fn = null
      }
      const r = cola.slice(0, n)
      cola = cola.slice(n)
      return r
    },
  }
  const cerrar = async () => {
    try { await lector.cancel() } catch { /* ya cerrado */ }
    await bomba
    try { lector.releaseLock() } catch { /* */ }
    try { escritor.releaseLock() } catch { /* */ }
    try { await usb.close() } catch { /* */ }
  }
  return { puerto, cerrar }
}

/**
 * Carga el .hex en la placa conectada a `usb`. Prueba las velocidades de la
 * placa (el Nano tiene dos bootloaders) y verifica lo escrito.
 */
export async function cargarEnPlaca(usb: PuertoUsb, placa: PlacaReal, hex: string, avance?: Avance): Promise<{ bytes: number; velocidad: number }> {
  const programa = programaDeHex(hex)
  if (programa.length > DATOS_CARGA[placa].maximo) throw new ErrorCarga('tamano')
  for (const velocidad of DATOS_CARGA[placa].velocidades) {
    await usb.open({ baudRate: velocidad, bufferSize: 4096 })
    const { puerto, cerrar } = conectar(usb)
    try {
      // Reiniciar la placa: al soltar y volver a activar DTR, entra al bootloader.
      await usb.setSignals({ dataTerminalReady: false, requestToSend: false })
      await esperar(250)
      await usb.setSignals({ dataTerminalReady: true, requestToSend: true })
      await esperar(60)
      if (await cargarPrograma(puerto, placa, programa, avance)) return { bytes: programa.length, velocidad }
    } finally {
      await cerrar()
    }
    await esperar(150)
  }
  throw new ErrorCarga('sin-respuesta')
}
