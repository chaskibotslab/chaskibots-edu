// Prepara robots completos descargados de Sketchfab (modelos-3d/sketchfab/*.glb)
// que el simulador mueve POR PARTES (patas, armas, ruedas). A diferencia de
// preparar-modelos.mjs (que une todo en una sola malla), aquí cada parte queda
// en un nodo con nombre, en metros y medida desde su propia articulación, para
// que la interfaz la gire donde corresponde.
//
// Uso (desde la raíz del proyecto, con las herramientas gltf-transform instaladas):
//   node src/modules/laboratorio/scripts/preparar-robots.mjs <carpeta node_modules con gltf-transform> [id…]

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const modulos = path.resolve(process.argv[2])
const imp = async (...opciones) => {
  for (const p of opciones) if (fs.existsSync(path.join(modulos, p))) return import(pathToFileURL(path.join(modulos, p)).href)
  throw new Error(`No encontré ${opciones[0]} en ${modulos}`)
}
const { NodeIO, getBounds } = await imp('@gltf-transform/core/dist/core.modern.js', '@gltf-transform/core/dist/index.modern.js')
const { ALL_EXTENSIONS, EXTMeshoptCompression } = await imp('@gltf-transform/extensions/dist/extensions.modern.js', '@gltf-transform/extensions/dist/index.modern.js')
const { dedup, weld, prune, simplify, textureCompress } = await imp('@gltf-transform/functions/dist/functions.modern.js')
const { MeshoptSimplifier, MeshoptEncoder } = await imp('meshoptimizer/index.module.js')
// sharp: el de la carpeta de herramientas o, si su binario no carga, el del proyecto.
const sharp = await imp('sharp/lib/index.js').then(m => m.default).catch(async () => (await import('sharp')).default)

const ORIGEN = path.resolve('modelos-3d', 'sketchfab')
const SALIDA = path.resolve('public', 'lab', 'modelos')

/**
 * Cada robot: `mmPorUnidad` (escala al tamaño del laboratorio), `giros`
 * opcionales para quedar con +y arriba y +x adelante, y sus `partes`. Cada
 * parte toma uno o más nodos del archivo y se mide desde su `pivote`: el
 * nombre de un nodo (su posición en el mundo) o un punto [x, y, z] en unidades
 * del archivo (ya girado).
 */
/** Cajas [x, y, z] (mín, máx) de los sólidos de Abyss, en unidades del archivo. */
const ABYSS = {
  ruedaIzq: [[-23.6, -17.4], [-8.6, 3.6], [-6.6, 5.6]],
  ruedaDer: [[17.4, 23.6], [-8.6, 3.6], [-6.6, 5.6]],
  tambor: [[-17.1, 17.1], [-7.8, 2.8], [7.4, 15.6]],
}

// «RipTide» (Floating Castle Robotics, Tinkercad): cajas en unidades del archivo.
const RIPTIDE = {
  ruedaIzq: [[-8.2, -5.4], [-13.8, -7.6], [-3.9, 2.3]],
  ruedaDer: [[15.4, 18.2], [-13.8, -7.6], [-3.9, 2.3]],
  tambor: [[-7.7, 17.7], [-12.8, -4.6], [3.4, 13.5]],
}
// «Fathom» (Floating Castle Robotics, Tinkercad): las cuatro ruedas.
const FATHOM = {
  delIzq: [[-20.2, -13.8], [-25.6, -13.3], [9.3, 21.6]],
  delDer: [[13.8, 20.2], [-25.6, -13.3], [9.3, 21.6]],
  traIzq: [[-19.8, -12.3], [-25.6, -15.3], [-18.7, -8.4]],
  traDer: [[12.3, 19.8], [-25.6, -15.3], [-18.7, -8.4]],
}
const ROBOTS = {
  // Unitree Go1 de C. Yamahata. Las patas vienen separadas por tramo, con un
  // «hueso» en cada articulación. Escala: caderas a 115 mm del centro, como
  // las del catálogo (catalogo/piezas/cuadrupedo.ts); cada tramo mide 130 mm.
  'perro-go1': {
    archivo: 'robot-dog-unitree-go1.glb', mmPorUnidad: 1000 * 115 / 217.4, maxTri: 36000,
    partes: {
      tronco: { nodos: ['Trunk_24'], pivote: 'BodyBone_25' },
      ...Object.fromEntries(['FL', 'FR', 'BL', 'BR'].flatMap((l, i) => [
        [`cadera${i}`, { nodos: [`Hip${l}_`], pivote: `Hip${l}Bone_` }],
        [`muslo${i}`, { nodos: [`Thigh${l}_`], pivote: `Thigh${l}Bone_` }],
        [`pierna${i}`, { nodos: [`Calf${l}_`], pivote: `Calf${l}Bone_` }],
      ])),
    },
  },
  // «Abyss» de Floating Castle Robotics: robot de combate de tambor hecho en
  // Tinkercad, con una malla por color. Las ruedas, el tambor y la carrocería
  // se separan por sus sólidos sueltos (`dentro` / `fuera`: cajas en unidades
  // del archivo). Escala: rueda de 12 unidades → 60 mm. El frente del archivo
  // es +z: se gira para que quede en +x.
  'abyss-casco': {
    archivo: 'abyss.glb', mmPorUnidad: 5, giros: [['y', 90]], maxTri: 9000,
    partes: { casco: { fuera: [ABYSS.ruedaIzq, ABYSS.ruedaDer, ABYSS.tambor], pivote: [0, -2.49, -0.49] } },
  },
  // La rueda de −x del archivo: girada queda con el tapacubos hacia +z (afuera del motor).
  'abyss-rueda': {
    archivo: 'abyss.glb', mmPorUnidad: 5, giros: [['y', 90]], maxTri: 5000,
    partes: { rueda: { dentro: [ABYSS.ruedaIzq], pivote: [-20.5, -2.49, -0.49] } },
  },
  // «Line Follower Robot» de zoe.goodward: un seguidor de competencia dibujado
  // en CAD (en cm), con cada pieza en su nodo. La carrocería se queda con la
  // base, el piso de arriba, los separadores y la barra de sensores; el motor
  // N20 y la rueda Pololu de 42 mm salen como piezas aparte. Se quitan la
  // placa, la batería y la rueda loca: van las del catálogo.
  'seguidor-pro-chasis': {
    archivo: 'line-follower-robot.glb', mmPorUnidad: 10, giros: [['y', 90]], maxTri: 22000, opacidadMin: 0.82,
    partes: { chasis: { sinNodos: ['Board_3', 'battery', 'micro-metal-gearmotor-standard', 'pololu-wheel', 'pololu-ball-caster'], pivote: [-1.401, 0.289, -2.7] } },
  },
  // Pila de 9 V (modelo CC0, en metros, parada): se acuesta con los bornes hacia +x.
  'bateria-9v': {
    archivo: 'cc0-generic-9v-battery.glb', mmPorUnidad: 1000, giros: [['z', -90]], maxTri: 2000,
    partes: { pila: { sinNodos: [], pivote: [0.009, 0.024, 0] } },
  },
  // Origen sobre el eje, 8 mm antes del centro de la rueda (como el N20 del catálogo).
  'motor-n20': {
    archivo: 'line-follower-robot.glb', mmPorUnidad: 10, giros: [['y', 90]], maxTri: 5000,
    partes: { motor: { nodos: ['micro-metal-gearmotor-standard:1'], pivote: [-9.436, 0.939, -6.3] } },
  },
  'rueda-42': {
    archivo: 'line-follower-robot.glb', mmPorUnidad: 10, giros: [['y', 90]], maxTri: 4000,
    partes: { rueda: { nodos: ['pololu-wheel-42x19mm:1'], pivote: [-10.236, 0.939, -6.3] } },
  },
  // «Micro sumo paladin» de matheus.nfranca97: minisumo de 10 × 10 cm (en
  // metros, frente en +z). La carrocería se queda con la estructura, la rampa,
  // la cuna de los motores y la placa de arriba (ID46); la rueda sale aparte.
  // Origen en el centro del eje de las ruedas.
  'paladin-casco': {
    archivo: 'micro-sumo-paladin.glb', mmPorUnidad: 1000, giros: [['y', 90]], maxTri: 9000,
    partes: { casco: { nodos: ['estrutura', 'Rampa', 'Meio', 'ID46'], pivote: [-0.006, 0.1175, -0.001] } },
  },
  'rueda-31': {
    archivo: 'micro-sumo-paladin.glb', mmPorUnidad: 1000, giros: [['y', 90]], maxTri: 3000, color: [0.03, 0.03, 0.035],
    partes: { rueda: { nodos: ['Roda'], pivote: [0.029, 0.1175, -0.0173] } },
  },
  // «RipTide»: tambor enorme de tres tramos entre dos brazos, ruedas atrás y
  // patines al frente. Escala: rueda de 6 unidades → 60 mm. Origen en el eje de las ruedas.
  'riptide-casco': {
    archivo: 'riptide.glb', mmPorUnidad: 10, giros: [['y', 90]], maxTri: 9000,
    partes: { casco: { fuera: [RIPTIDE.ruedaIzq, RIPTIDE.ruedaDer, RIPTIDE.tambor], pivote: [5, -10.71, -0.79] } },
  },
  'riptide-rueda': {
    archivo: 'riptide.glb', mmPorUnidad: 10, giros: [['y', 90]], maxTri: 5000,
    partes: { rueda: { dentro: [RIPTIDE.ruedaIzq], pivote: [-6.75, -10.71, -0.79] } },
  },
  'riptide-tambor': {
    archivo: 'riptide.glb', mmPorUnidad: 10, giros: [['y', 90]], maxTri: 8000,
    partes: { tambor: { dentro: [RIPTIDE.tambor], pivote: [5, -8.71, 8.46] } },
  },
  // «Fathom»: un tiburón con arpón, de cuatro ruedas. Escala: 4,5 mm por unidad
  // (20 cm de ancho). Origen entre los dos ejes, a la altura del eje delantero.
  'fathom-casco': {
    archivo: 'fathom.glb', mmPorUnidad: 4.5, giros: [['y', 90]], maxTri: 14000,
    partes: { casco: { fuera: [FATHOM.delIzq, FATHOM.delDer, FATHOM.traIzq, FATHOM.traDer], pivote: [0, -19.47, 0.97] } },
  },
  'fathom-rueda': {
    archivo: 'fathom.glb', mmPorUnidad: 4.5, giros: [['y', 90]], maxTri: 5000,
    partes: { rueda: { dentro: [FATHOM.delIzq], pivote: [-17, -19.47, 15.47] } },
  },
  // «Ant Weight Battle Bot» de WilliamMezitis: caja con tapa y una pala curva
  // (en metros, el frente ya es +x). Se quitan sus motores: van los del catálogo.
  'cuna-casco': {
    archivo: 'ant-weight-battle-bot.glb', mmPorUnidad: 1000, maxTri: 8000,
    partes: { casco: { nodos: ['Object_28', 'Object_29', 'Object_11', 'Object_16', 'Object_26', 'Object_27'], pivote: [0.065, 0.082, 0.1335] } },
  },
  'cuna-rueda': {
    archivo: 'ant-weight-battle-bot.glb', mmPorUnidad: 1000, maxTri: 6000,
    partes: { rueda: { nodos: ['Object_12', 'Object_13'], pivote: [0.065, 0.0818, 0.1927] } },
  },
  'abyss-tambor': {
    archivo: 'abyss.glb', mmPorUnidad: 5, giros: [['y', 90]], maxTri: 6000,
    partes: { tambor: { dentro: [ABYSS.tambor], pivote: [0, -2.49, 11.51] } },
  },
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
await MeshoptSimplifier.ready
await MeshoptEncoder.ready

/** Nodo por nombre exacto o por prefijo (los nombres de Sketchfab terminan en «_<número>»). */
function nodo(doc, nombre) {
  const lista = doc.getRoot().listNodes()
  const n = lista.find(x => x.getName() === nombre) ?? lista.find(x => x.getName().startsWith(nombre))
  if (!n) throw new Error(`no encontré el nodo ${nombre}`)
  return n
}

const mul = (a, b) => {
  const o = new Array(16)
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
  }
  return o
}
const giroEje = (eje, g) => {
  const a = (g * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a)
  if (eje === 'x') return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]
  if (eje === 'y') return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}
const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
const punto = (m, p) => [0, 1, 2].map(r => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r])

/**
 * Sólidos sueltos de una primitiva: triángulos unidos por vértices en la misma
 * posición. De cada uno, sus índices y su caja en el mundo (unidades del archivo).
 */
function solidos(p, w) {
  const pos = p.getAttribute('POSITION'), n = pos.getCount()
  const idx = p.getIndices() ? Array.from(p.getIndices().getArray()) : [...Array(n).keys()]
  const clave = new Map(), rep = new Array(n), mundo = new Array(n), e = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    pos.getElement(i, e)
    mundo[i] = punto(w, e)
    const k = mundo[i].map(v => v.toFixed(3)).join(',')
    if (!clave.has(k)) clave.set(k, clave.size)
    rep[i] = clave.get(k)
  }
  const padre = [...Array(clave.size).keys()]
  const raiz = a => { while (padre[a] !== a) { padre[a] = padre[padre[a]]; a = padre[a] } return a }
  for (let t = 0; t + 2 < idx.length; t += 3) {
    const a = raiz(rep[idx[t]])
    padre[raiz(rep[idx[t + 1]])] = a
    padre[raiz(rep[idx[t + 2]])] = a
  }
  const lista = new Map()
  for (let t = 0; t + 2 < idx.length; t += 3) {
    const r = raiz(rep[idx[t]])
    if (!lista.has(r)) lista.set(r, { indices: [], min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] })
    const c = lista.get(r)
    for (let k = 0; k < 3; k++) {
      const i = idx[t + k]
      c.indices.push(i)
      for (let a = 0; a < 3; a++) { c.min[a] = Math.min(c.min[a], mundo[i][a]); c.max[a] = Math.max(c.max[a], mundo[i][a]) }
    }
  }
  return [...lista.values()]
}

async function preparar(id, cfg) {
  const doc = await io.read(path.join(ORIGEN, cfg.archivo))
  const root = doc.getRoot()
  const escena = root.getDefaultScene() ?? root.listScenes()[0]
  for (const a of root.listAnimations()) a.dispose()
  for (const s of root.listSkins()) s.dispose()

  // Giro general (el primero de la lista se aplica primero) y escala a metros.
  const G = (cfg.giros ?? []).reduce((acc, [eje, g]) => mul(giroEje(eje, g), acc), IDENT)
  const s = cfg.mmPorUnidad / 1000

  const originales = root.listNodes().filter(n => n.getMesh())
  const nuevas = []
  for (const [nombre, parte] of Object.entries(cfg.partes)) {
    const pv = punto(G, typeof parte.pivote === 'string' ? punto(nodo(doc, parte.pivote).getWorldMatrix(), [0, 0, 0]) : parte.pivote)
    // Parte = escala · traslación(−pivote) · giro general; dentro, cada malla con su matriz del mundo.
    const base = mul([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, -pv[0] * s, -pv[1] * s, -pv[2] * s, 1], G)
    const grupo = doc.createNode(nombre).setMatrix(base)
    for (const origen of parte.nodos ?? []) {
      nodo(doc, origen).traverse(n => {
        if (!n.getMesh()) return
        grupo.addChild(doc.createNode('').setMesh(n.getMesh()).setMatrix(n.getWorldMatrix()))
      })
    }
    // Todo menos algunos nodos (por prefijo del nombre) y lo que cuelga de ellos.
    if (parte.sinNodos) {
      const fuera = n => { for (let x = n; x; x = x.getParentNode()) if (parte.sinNodos.some(pre => x.getName().startsWith(pre))) return true; return false }
      for (const n of originales) if (!fuera(n)) grupo.addChild(doc.createNode('').setMesh(n.getMesh()).setMatrix(n.getWorldMatrix()))
    }
    // Por sólidos sueltos: los que caben en alguna caja de `dentro`, o los que no caben en ninguna de `fuera`.
    if (parte.dentro || parte.fuera) {
      const cabe = (c, cajas) => cajas.some(k => [0, 1, 2].every(a => c.min[a] >= k[a][0] && c.max[a] <= k[a][1]))
      for (const n of originales) {
        const malla = doc.createMesh(n.getName())
        for (const p of n.getMesh().listPrimitives()) {
          const idx = []
          for (const c of solidos(p, n.getWorldMatrix())) {
            if (parte.dentro ? cabe(c, parte.dentro) : !cabe(c, parte.fuera)) idx.push(...c.indices)
          }
          if (!idx.length) continue
          const q = p.clone()
          for (const sem of q.listSemantics()) q.setAttribute(sem, q.getAttribute(sem).clone())
          const cuenta = q.getAttribute('POSITION').getCount()
          q.setIndices(doc.createAccessor().setType('SCALAR').setArray(cuenta > 65535 ? new Uint32Array(idx) : new Uint16Array(idx)))
          // Los vértices que ya no usa ningún triángulo los quita weld() más abajo.
          malla.addPrimitive(q)
        }
        if (malla.listPrimitives().length) grupo.addChild(doc.createNode('').setMesh(malla).setMatrix(n.getWorldMatrix()))
      }
    }
    nuevas.push(grupo)
  }
  for (const n of escena.listChildren()) n.dispose()
  for (const n of root.listNodes()) if (!nuevas.includes(n) && !nuevas.includes(n.getParentNode())) n.dispose()
  for (const n of nuevas) escena.addChild(n)

  // Un solo color para toda la pieza (por ejemplo, una rueda de silicona que el modelo trae sin pintar).
  if (cfg.color) for (const m of root.listMaterials()) m.setBaseColorFactor([...cfg.color, 1]).setRoughnessFactor(0.85).setMetallicFactor(0)
  // Acrílicos casi invisibles: se les da cuerpo para que se lean en pantalla.
  if (cfg.opacidadMin) {
    for (const m of root.listMaterials()) {
      const c = m.getBaseColorFactor()
      if (m.getAlphaMode() !== 'OPAQUE' && c[3] < cfg.opacidadMin) m.setBaseColorFactor([c[0], c[1], c[2], cfg.opacidadMin])
    }
  }
  await doc.transform(
    dedup(), weld({ tolerance: 0.0001 }),
    simplify({ simplifier: MeshoptSimplifier, ratio: 1, error: 0.0005 }),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512] }),
  )
  const tris = () => root.listMeshes().reduce((t, m) => t + m.listPrimitives().reduce((a, p) => a + (p.getIndices()?.getCount() ?? 0) / 3, 0), 0)
  if (tris() > cfg.maxTri) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: cfg.maxTri / tris(), error: 0.01 }), prune())

  const lic = JSON.parse(fs.readFileSync(path.join(ORIGEN, 'licencias.json'), 'utf8'))[cfg.archivo]
  if (!lic) throw new Error(`${id}: falta la licencia de ${cfg.archivo} en licencias.json`)
  const credito = {
    titulo: lic.titulo, autor: `${lic.autor} (${lic.perfil})`,
    licencia: lic.licencia === 'CC Attribution' ? 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)' : lic.licencia,
    fuente: lic.url,
  }
  root.getAsset().extras = { ...credito, preparado: 'ChaskiBots Lab: por partes, en metros, +y arriba, +x adelante' }
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })
  fs.mkdirSync(SALIDA, { recursive: true })
  const destino = path.join(SALIDA, `${id}.glb`)
  await io.write(destino, doc)

  console.log(`✓ ${id}: ${Math.round(tris())} triángulos, ${(fs.statSync(destino).size / 1024).toFixed(0)} KB`)
  const mm = v => (v * 1000).toFixed(1)
  for (const n of nuevas) {
    const b = getBounds(n)
    console.log(`   ${n.getName().padEnd(9)} x[${mm(b.min[0])}, ${mm(b.max[0])}] y[${mm(b.min[1])}, ${mm(b.max[1])}] z[${mm(b.min[2])}, ${mm(b.max[2])}]`)
  }
  return { [`${id}.glb`]: credito }
}

const pedidos = process.argv.slice(3)
// Los créditos van en el mismo .ts que escribe preparar-modelos.mjs.
const archivoCreditos = path.resolve('src', 'modules', 'laboratorio', 'catalogo', 'creditosModelos.ts')
const texto = fs.readFileSync(archivoCreditos, 'utf8')
const previo = /= (\{[\s\S]*\})\r?\n/.exec(texto)
let creditos = JSON.parse(previo[1])
for (const [id, cfg] of Object.entries(ROBOTS)) {
  if (pedidos.length && !pedidos.includes(id)) continue
  creditos = { ...creditos, ...(await preparar(id, cfg)) }
}
const salto = texto.includes('\r\n') ? '\r\n' : '\n'
fs.writeFileSync(archivoCreditos, texto.replace(previo[1], JSON.stringify(creditos, null, 2).replace(/\n/g, salto)))
