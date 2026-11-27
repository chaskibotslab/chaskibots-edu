/// <reference lib="webworker" />
// Detección de objetos (COCO-SSD) fuera del hilo de la página.
//
// En computadoras con gráfica lenta cada detección tarda de 0,3 a 2 segundos y,
// hecha en la página, la deja congelada ese tiempo. Aquí el modelo corre en un
// proceso aparte: la página solo envía un cuadro y espera la respuesta.
export type Deteccion = { class: string; score: number; bbox: [number, number, number, number] }
export type Pedido = { tipo: 'cargar' } | { tipo: 'detectar'; id: number; cuadro: ImageBitmap }
export type Respuesta =
  | { tipo: 'listo'; motor: string }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'resultado'; id: number; detecciones: Deteccion[] }

const ctx = self as unknown as DedicatedWorkerGlobalScope
let modelo: { detect(img: ImageBitmap): Promise<Deteccion[]> } | null = null

ctx.onmessage = async (e: MessageEvent<Pedido>) => {
  const p = e.data
  try {
    if (p.tipo === 'cargar') {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const coco = await import('@tensorflow-models/coco-ssd')
      modelo = (await coco.load()) as unknown as typeof modelo
      ctx.postMessage({ tipo: 'listo', motor: tf.getBackend() } satisfies Respuesta)
    } else if (p.tipo === 'detectar') {
      let detecciones: Deteccion[] = []
      try { if (modelo) detecciones = await modelo.detect(p.cuadro) } finally { p.cuadro.close() }
      ctx.postMessage({ tipo: 'resultado', id: p.id, detecciones } satisfies Respuesta)
    }
  } catch (err) {
    ctx.postMessage({ tipo: 'error', mensaje: err instanceof Error ? err.message : String(err) } satisfies Respuesta)
  }
}
