/**
 * Miniaturas de los robots para la galería de «Armar».
 * Se dibujan una sola vez, de una en una, con un único lienzo 3D oculto y se guardan como imagen.
 */
import * as THREE from 'three'
import { cargarLDraw } from './ldraw'

const hechas = new Map<string, Promise<string>>()
let cola: Promise<unknown> = Promise.resolve()
let lienzo: { renderer: THREE.WebGLRenderer; escena: THREE.Scene; camara: THREE.PerspectiveCamera } | null = null

function preparar() {
  if (lienzo) return lienzo
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setSize(360, 270, false)
  renderer.setPixelRatio(1)
  const escena = new THREE.Scene()
  escena.add(new THREE.AmbientLight(0xffffff, 0.9))
  const sol = new THREE.DirectionalLight(0xffffff, 1.2); sol.position.set(120, 180, 90); escena.add(sol)
  const relleno = new THREE.DirectionalLight(0xffffff, 0.4); relleno.position.set(-80, 60, -100); escena.add(relleno)
  const camara = new THREE.PerspectiveCamera(32, 360 / 270, 1, 2000)
  camara.position.set(-190, 130, -230)
  camara.lookAt(0, 0, 0)
  lienzo = { renderer, escena, camara }
  return lienzo
}

async function dibujar(archivo: string): Promise<string> {
  const g = await cargarLDraw(archivo)
  const { renderer, escena, camara } = preparar()
  g.rotation.x = Math.PI // LDraw usa Y hacia abajo
  g.updateMatrixWorld(true)
  const caja = new THREE.Box3().setFromObject(g)
  const tam = caja.getSize(new THREE.Vector3())
  const centro = caja.getCenter(new THREE.Vector3())
  const s = 122 / Math.max(tam.x, tam.y, tam.z || 1)
  g.scale.setScalar(s)
  g.position.set(-centro.x * s, -centro.y * s, -centro.z * s)
  escena.add(g)
  renderer.render(escena, camara)
  const url = renderer.domElement.toDataURL('image/png')
  escena.remove(g)
  return url
}

/** Imagen (data URL) del robot terminado. Se rechaza si el equipo no puede dibujar en 3D. */
export function miniatura(archivo: string): Promise<string> {
  let p = hechas.get(archivo)
  if (!p) {
    // de una en una, con una pausa entre robots para no trabar la página
    p = cola.then(() => new Promise(ok => setTimeout(ok, 60))).then(() => dibujar(archivo))
    cola = p.catch(() => undefined)
    p.catch(() => hechas.delete(archivo))
    hechas.set(archivo, p)
  }
  return p
}
