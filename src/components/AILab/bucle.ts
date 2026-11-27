// Bucle de visión por cámara que no congela la pantalla.
//
// Antes cada actividad encadenaba `await modelo(...)` + requestAnimationFrame:
//   - al detener la cámara, el paso que estaba en curso volvía a pedir otro
//     cuadro, así que el bucle seguía vivo para siempre; cada vez que se
//     encendía la cámara de nuevo se sumaba otro bucle encima;
//   - el modelo corría pegado, sin dejar tiempo libre al navegador: en
//     computadoras lentas la página dejaba de responder.
//
// Aquí el bucle se corta de verdad con detener(), y después de cada paso deja
// libre al menos el mismo tiempo que tardó el modelo (y nunca menos de minMs).
export interface Bucle { detener(): void }

export function iniciarBucle(paso: () => Promise<void> | void, minMs = 110): Bucle {
  let vivo = true
  const esperar = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
  // Con la pestaña oculta el navegador no entrega cuadros: el bucle queda en pausa solo.
  const cuadro = () => new Promise<void>(r => requestAnimationFrame(() => r()))

  ;(async () => {
    while (vivo) {
      const t0 = performance.now()
      try { await paso() } catch { /* cuadro sin resultado */ }
      if (!vivo) break
      await esperar(Math.max(minMs, performance.now() - t0))
      await cuadro()
    }
  })()

  return { detener() { vivo = false } }
}
