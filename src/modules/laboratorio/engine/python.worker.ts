// Web Worker de la Raspberry Pi: corre el programa en Python (Pyodide) fuera
// del hilo de la interfaz. Habla el MISMO protocolo que avr.worker.ts, así la
// simulación no distingue una placa de otra:
//   interfaz → { type: 'load', python, placa }
//   interfaz → { type: 'step', cycles, digital, dobles, ultrasonidos, camara?, serial? }
//   worker   → { type: 'step', result, ms }
// «cycles» se traduce a segundos con la misma frecuencia de referencia, y el
// reloj del programa (sleep) avanza exactamente ese tiempo (ver runtime.ts).

import { RUNTIME_PY } from './python/runtime'
import type { PinReport, StepResult } from './avrRunner'
import type { UltrasonidoPines } from './hcsr04'
import type { ImagenCamara } from './paso'

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
/** La misma frecuencia de referencia que el Arduino emulado (avrRunner.ts), sin cargar el emulador aquí. */
const CPU_FREQ_HZ = 16_000_000

export type PythonIn =
  | { type: 'load'; python: string; placa: 'rpi' | 'jetson' }
  /** `camara`: imagen nueva de la cámara (si no viene, el programa sigue viendo la anterior). */
  | { type: 'step'; cycles: number; digital: Record<string, boolean>; dobles?: Record<string, [boolean, boolean]>; analog: Record<string, number>; ultrasonidos: UltrasonidoPines[]; camara?: ImagenCamara; serial?: string }

interface Pyodide {
  runPython(code: string): unknown
  globals: { get(nombre: string): (...args: unknown[]) => { toJs(o: { dict_converter: typeof Object.fromEntries }): unknown; destroy(): void } | string | undefined }
  toPy(v: unknown): unknown
}
declare function importScripts(...urls: string[]): void
declare function loadPyodide(o: { indexURL: string }): Promise<Pyodide>

const ctx = self as unknown as Worker
let py: Pyodide | null = null
let total = 0

async function iniciar(): Promise<Pyodide> {
  if (py) return py
  importScripts(`${PYODIDE}pyodide.js`)
  py = await loadPyodide({ indexURL: PYODIDE })
  py.runPython(RUNTIME_PY)
  return py
}

ctx.onmessage = async (e: MessageEvent<PythonIn>) => {
  const msg = e.data
  try {
    if (msg.type === 'load') {
      const p = await iniciar()
      const error = p.globals.get('_cargar')(msg.python, msg.placa)
      if (typeof error === 'string') { ctx.postMessage({ type: 'error', message: error }); return }
      total = 0
      ctx.postMessage({ type: 'loaded' })
      return
    }
    if (msg.type === 'step' && py) {
      const t = performance.now()
      const dt = msg.cycles / CPU_FREQ_HZ
      const r = py.globals.get('_avanzar')(dt, py.toPy(msg.digital), py.toPy(msg.dobles ?? {}), py.toPy(msg.ultrasonidos), msg.camara ? py.toPy(msg.camara) : null) as { toJs(o: object): unknown; destroy(): void }
      const res = r.toJs({ dict_converter: Object.fromEntries }) as { pines: Record<string, PinReport>; salida: string; error: string | null; terminado: boolean }
      r.destroy()
      total += msg.cycles
      const result: StepResult = { cycles: msg.cycles, totalCycles: total, pins: res.pines, serial: Array.from(new TextEncoder().encode(res.salida)) }
      ctx.postMessage({ type: 'step', result, ms: performance.now() - t })
      // Un error del programa se muestra como los de la placa (el paso ya avanzó la física).
      if (res.error) ctx.postMessage({ type: 'error', message: res.error })
    }
  } catch (err) {
    ctx.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
