// Web Worker del microcontrolador: corre el CPU emulado fuera del hilo de la
// interfaz para que la página no se congele mientras ejecuta millones de
// instrucciones por segundo.
//
// Protocolo (sincronización por pasos, "lockstep"):
//   interfaz → { type: 'load', hex }
//   interfaz → { type: 'step', cycles, digital, analog, ultrasonidos, serial? }
//   worker   → { type: 'step', result, ms }
// La interfaz pide N ciclos, el worker los ejecuta con las entradas de los
// sensores de ese momento y devuelve el estado de los pines. Luego la física
// avanza EXACTAMENTE ese tiempo (N / 16 MHz). Así el robot y el micro nunca se
// desincronizan aunque el navegador vaya lento. El eco de los HC-SR04 se
// genera aquí, junto al CPU, porque dura microsegundos.

import { AvrRunner, type Chip } from './avrRunner'
import { Ultrasonidos, type UltrasonidoPines } from './hcsr04'

export type WorkerIn =
  | { type: 'load'; hex: string; chip: Chip }
  | { type: 'step'; cycles: number; digital: Record<string, boolean>; analog: Record<string, number>; ultrasonidos: UltrasonidoPines[]; serial?: string }

export type WorkerOut =
  | { type: 'loaded' }
  | { type: 'error'; message: string }
  | { type: 'step'; result: ReturnType<AvrRunner['run']>; ms: number }

const ctx = self as unknown as Worker
let runner: AvrRunner | null = null
let ultrasonidos: Ultrasonidos | null = null

ctx.onmessage = (e: MessageEvent<WorkerIn>) => {
  const msg = e.data
  try {
    if (msg.type === 'load') {
      runner = new AvrRunner(msg.hex, msg.chip)
      ultrasonidos = new Ultrasonidos(runner)
      ctx.postMessage({ type: 'loaded' } satisfies WorkerOut)
      return
    }
    if (msg.type === 'step' && runner) {
      for (const [pin, v] of Object.entries(msg.digital)) runner.setDigitalInput(pin, v)
      for (const [pin, v] of Object.entries(msg.analog)) runner.setAnalogInput(pin, v)
      ultrasonidos?.actualizar(msg.ultrasonidos)
      if (msg.serial) runner.serialWrite(msg.serial)
      const t = performance.now()
      const result = runner.run(msg.cycles)
      ctx.postMessage({ type: 'step', result, ms: performance.now() - t } satisfies WorkerOut)
    }
  } catch (err) {
    ctx.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) } satisfies WorkerOut)
  }
}
