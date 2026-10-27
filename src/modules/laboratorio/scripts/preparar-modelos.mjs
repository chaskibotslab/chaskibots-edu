// Prepara los modelos 3D descargados (modelos-3d/*.glb) para el simulador:
//   1. Los lleva al marco de su pieza (ver catalogo/tipos.ts): metros, +y arriba,
//      +x adelante, y el origen en el ancla de la pieza.
//   2. Los aliviana para celulares: une vértices, simplifica mallas muy densas,
//      reduce texturas a 512 px (WebP) y comprime con meshopt (sin CDN: three
//      trae el decodificador).
//   3. Guarda el autor y la licencia dentro del archivo (asset.extras) y en
//      catalogo/creditosModelos.ts (se muestran en la ficha de cada pieza).
//
// Uso (desde la raíz del proyecto, con las herramientas gltf-transform instaladas):
//   node src/modules/laboratorio/scripts/preparar-modelos.mjs <carpeta node_modules con gltf-transform> [id…]

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const modulos = path.resolve(process.argv[2])
const imp = p => import(pathToFileURL(path.join(modulos, p)).href)
const { NodeIO, getBounds } = await imp('@gltf-transform/core/dist/index.modern.js')
const { ALL_EXTENSIONS, EXTMeshoptCompression } = await imp('@gltf-transform/extensions/dist/index.modern.js')
const { dedup, weld, prune, simplify, textureCompress, flatten, join, resample, compactPrimitive } = await imp('@gltf-transform/functions/dist/functions.modern.js')
const { MeshoptSimplifier, MeshoptEncoder } = await imp('meshoptimizer/index.module.js')
const sharp = (await imp('sharp/lib/index.js')).default

const ORIGEN = path.resolve('modelos-3d')
const SALIDA = path.resolve('public', 'lab', 'modelos')

/**
 * Cada modelo: rotación (grados XYZ) para quedar con +y arriba y +x adelante,
 * escala (mm por unidad del archivo, medida contra la pieza real) y cómo
 * ubicar el origen respecto del nodo de referencia (`ref`, normalmente la placa).
 */
const MODELOS = {
  'arduino-uno': {
    archivo: 'arduino-uno.glb', rot: [-90, 0, 0], mmPorUnidad: 53.4 / 0.822, ref: 'node_id293',
    origen: { x: 'ref-centro', y: 'ref-abajo', z: 'ref-centro' }, maxTri: 12000,
  },
  l298n: {
    archivo: 'l298n.glb', rot: [0, 0, 0], mmPorUnidad: 43 / 0.951, ref: 'Object_4',
    origen: { x: 'ref-centro', y: 'ref-abajo', z: 'ref-centro' }, maxTri: 8000,
  },
  hcsr04: {
    archivo: 'hcsr04.glb', rot: [0, 90, 0], mmPorUnidad: 45 / 2.859, ref: 'Object_4',
    origen: { x: 'ref-atras', y: 'todo-abajo', z: 'ref-centro' }, maxTri: 8000,
  },
  // El brazo blanco (Object_4) se quita: el simulador dibuja uno que gira con el servo.
  sg90: {
    archivo: 'sg90..glb', rot: [0, 90, 0], mmPorUnidad: 12.2 / 2.204, ref: 'Object_7',
    origen: { x: 'ref-centro', y: 'ref-abajo', z: 'ref-centro' }, maxTri: 10000,
    quitar: ['Object_4'], colores: { 'Material.002': [0.1, 0.3, 0.85, 1] },
  },
  // Rueda de 65 mm con llanta de goma, sacada del robot de Robótica Paraná
  // (trae las dos ruedas y el eje juntos: se queda la rueda de +z, ya en metros y con el eje en z).
  'rueda-65': {
    archivo: 'robot-sumo-referencia.glb', rot: [0, 0, 0], mmPorUnidad: 1000 * 33 / 34.4, ref: 'Roda.004',
    soloNodo: 'Roda.004', filtro: (x, y, z) => z > 0.045,
    origen: { x: 'todo-centro', y: 'todo-centro', z: 'todo-centro' }, maxTri: 6000,
  },
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
await MeshoptSimplifier.ready
await MeshoptEncoder.ready

function nodoPorNombre(doc, nombre) {
  return doc.getRoot().listNodes().find(n => n.getName() === nombre)
}

async function preparar(id, cfg) {
  const doc = await io.read(path.join(ORIGEN, cfg.archivo))
  const root = doc.getRoot()
  const creditos = root.getAsset().extras ?? {}
  const escena = root.listScenes()[0]
  for (const nombre of cfg.quitar ?? []) nodoPorNombre(doc, nombre)?.dispose()
  if (cfg.soloNodo) {
    // Quedarse con un solo grupo (p. ej. las ruedas de un robot completo).
    const queda = nodoPorNombre(doc, cfg.soloNodo)
    for (const n of root.listNodes()) if (n.getMesh() && !esDescendiente(n, queda)) n.dispose()
  }
  if (cfg.filtro) recortarTriangulos(doc, cfg.filtro)
  for (const [mat, color] of Object.entries(cfg.colores ?? {})) root.listMaterials().find(m => m.getName() === mat)?.setBaseColorFactor(color)

  // Nuevo nodo raíz con la rotación y la escala (mm → m).
  const pieza = doc.createNode(id)
  const r = cfg.rot.map(g => (g * Math.PI) / 180)
  const q = eulerXYZ(r[0], r[1], r[2])
  const s = cfg.mmPorUnidad / 1000
  pieza.setRotation(q).setScale([s, s, s])
  for (const n of escena.listChildren()) { escena.removeChild(n); pieza.addChild(n) }
  escena.addChild(pieza)

  // Origen: medido ya rotado y escalado.
  const ref = nodoPorNombre(doc, cfg.ref)
  if (!ref) throw new Error(`${id}: no encontré el nodo ${cfg.ref}`)
  const bRef = getBounds(ref)
  const bTodo = getBounds(escena)
  const eje = (k, i) => {
    const modo = cfg.origen[k]
    if (modo === 'ref-centro') return (bRef.min[i] + bRef.max[i]) / 2
    if (modo === 'ref-abajo' || modo === 'ref-atras') return bRef.min[i]
    if (modo === 'todo-abajo') return bTodo.min[i]
    if (modo === 'todo-centro') return (bTodo.min[i] + bTodo.max[i]) / 2
    return 0
  }
  const o = [eje('x', 0), eje('y', 1), eje('z', 2)]
  pieza.setTranslation([-o[0], -o[1], -o[2]])

  await doc.transform(
    dedup(), flatten(), join({ keepNamed: false }), weld({ tolerance: 0.0001 }),
    simplify({ simplifier: MeshoptSimplifier, ratio: 1, error: 0.0005 }),
    prune(), resample(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512] }),
  )
  // Si sigue muy denso, simplificar hasta el máximo de triángulos.
  const tris = () => root.listMeshes().reduce((t, m) => t + m.listPrimitives().reduce((a, p) => a + (p.getIndices()?.getCount() ?? 0) / 3, 0), 0)
  if (tris() > cfg.maxTri) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: cfg.maxTri / tris(), error: 0.02 }))

  root.getAsset().extras = { ...creditos, preparado: 'ChaskiBots Lab: escala real en metros, +y arriba, +x adelante' }
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })
  fs.mkdirSync(SALIDA, { recursive: true })
  const destino = path.join(SALIDA, `${id}.glb`)
  await io.write(destino, doc)

  const b = getBounds(root.listScenes()[0])
  const mm = v => (v * 1000).toFixed(1)
  console.log(`✓ ${id}: ${Math.round(tris())} triángulos, ${(fs.statSync(destino).size / 1024).toFixed(0)} KB · caja mm x[${mm(b.min[0])}, ${mm(b.max[0])}] y[${mm(b.min[1])}, ${mm(b.max[1])}] z[${mm(b.min[2])}, ${mm(b.max[2])}]`)
  return { [`${id}.glb`]: { titulo: creditos.title, autor: creditos.author, licencia: creditos.license, fuente: creditos.source } }
}

function esDescendiente(n, padre) {
  for (let x = n; x; x = x.getParentNode()) if (x === padre) return true
  return false
}

/**
 * Deja solo los triángulos cuyo centro (en el mundo, unidades del archivo)
 * cumple `filtro(x, y, z)`. Sirve para separar una pieza de un modelo que
 * trae varias juntas (p. ej. una de las dos ruedas).
 */
function recortarTriangulos(doc, filtro) {
  for (const n of doc.getRoot().listNodes()) {
    const malla = n.getMesh()
    if (!malla) continue
    const w = n.getWorldMatrix()
    for (const p of malla.listPrimitives()) {
      const pos = p.getAttribute('POSITION'), idx = p.getIndices()
      if (!pos || !idx) continue
      const v = [0, 0, 0], c = [0, 0, 0]
      const mundo = i => {
        pos.getElement(i, v)
        return [
          w[0] * v[0] + w[4] * v[1] + w[8] * v[2] + w[12],
          w[1] * v[0] + w[5] * v[1] + w[9] * v[2] + w[13],
          w[2] * v[0] + w[6] * v[1] + w[10] * v[2] + w[14],
        ]
      }
      const viejo = idx.getArray()
      const nuevo = []
      for (let t = 0; t < viejo.length; t += 3) {
        const a = mundo(viejo[t]), b = mundo(viejo[t + 1]), d = mundo(viejo[t + 2])
        for (let k = 0; k < 3; k++) c[k] = (a[k] + b[k] + d[k]) / 3
        if (filtro(c[0], c[1], c[2])) nuevo.push(viejo[t], viejo[t + 1], viejo[t + 2])
      }
      if (!nuevo.length) { p.dispose(); continue }
      idx.setArray(viejo.length > 65535 || pos.getCount() > 65535 ? new Uint32Array(nuevo) : new Uint16Array(nuevo))
      compactPrimitive(p) // quita los vértices que ya no usa ningún triángulo
    }
  }
}

function eulerXYZ(x, y, z) {
  const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2)
  const s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2)
  return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3]
}

const pedidos = process.argv.slice(3)
// Los créditos van en un .ts (los .json están en el .gitignore del repo).
const archivoCreditos = path.resolve('src', 'modules', 'laboratorio', 'catalogo', 'creditosModelos.ts')
const previo = fs.existsSync(archivoCreditos) ? /= (\{[\s\S]*\})\n/.exec(fs.readFileSync(archivoCreditos, 'utf8')) : null
let creditos = previo ? JSON.parse(previo[1]) : {}
for (const [id, cfg] of Object.entries(MODELOS)) {
  if (pedidos.length && !pedidos.includes(id)) continue
  creditos = { ...creditos, ...(await preparar(id, cfg)) }
}
fs.writeFileSync(archivoCreditos, `// Generado por scripts/preparar-modelos.mjs: autores y licencias de los modelos 3D.
// La licencia CC BY pide mostrar el crédito: la ficha de cada pieza lo muestra.

export interface CreditoModelo { titulo: string; autor: string; licencia: string; fuente: string }

export const CREDITOS_MODELOS: Record<string, CreditoModelo> = ${JSON.stringify(creditos, null, 2)}
`)
