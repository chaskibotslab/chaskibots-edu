/**
 * Carga de modelos LEGO reales (formato LDraw .mpd autocontenido) con caché.
 * Cada llamada devuelve un clon propio (comparte geometría, no estado de visibilidad).
 */
import * as THREE from 'three'
import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js'

const cache = new Map<string, Promise<THREE.Group>>()

export function cargarLDraw(url: string): Promise<THREE.Group> {
  let p = cache.get(url)
  if (!p) {
    p = new Promise<THREE.Group>((ok, bad) => {
      const loader = new LDrawLoader()
      ;(loader as any).smoothNormals = false // más ligero para máquinas modestas
      loader.load(url, (g: any) => ok(g as THREE.Group), undefined, bad)
    })
    p.catch(() => cache.delete(url))
    cache.set(url, p)
  }
  return p.then(g => g.clone(true))
}

/** Piezas de primer nivel del modelo, con el número de paso (0 STEP) en que aparecen. */
export function piezasPorPaso(modelo: THREE.Object3D): { obj: THREE.Object3D; paso: number }[] {
  return modelo.children
    .filter(o => o.userData && o.userData.buildingStep !== undefined)
    .map(o => ({ obj: o, paso: o.userData.buildingStep as number }))
}

/** Muestra solo las piezas de los pasos anteriores a `paso`. */
export function mostrarHasta(modelo: THREE.Object3D, paso: number) {
  for (const { obj, paso: n } of piezasPorPaso(modelo)) obj.visible = n < paso
}

/** Oculta las líneas de borde: a tamaño pequeño ensucian el dibujo y cuestan trabajo en escenas animadas. */
export function aligerar(modelo: THREE.Object3D) {
  modelo.traverse((o: any) => { if (o.isLine) o.visible = false })
}
