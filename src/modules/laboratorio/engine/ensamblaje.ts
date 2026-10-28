// Ensamblaje: a partir del árbol de piezas calcula dónde queda cada una, el
// peso total, el centro de gravedad y las medidas. También tiene las
// operaciones del taller (encastrar, quitar, reemplazar, girar).
// Todo es puro: recibe un RobotDoc y devuelve datos o un RobotDoc nuevo.

import { Euler, Matrix4, Quaternion, Vector3 } from 'three'
import { datosVariante, pieza } from '../catalogo/piezas'
import { grados, type Colisionador, type PiezaDef, type PuntoMontaje, type V3 } from '../catalogo/tipos'
import type { PiezaEnRobot, RobotDoc } from '../robots/doc'

export interface Pose { pos: Vector3; rot: Quaternion }

export function matriz(p: Pose): Matrix4 {
  return new Matrix4().compose(p.pos, p.rot, new Vector3(1, 1, 1))
}

function poseDeMatriz(m: Matrix4): Pose {
  const pos = new Vector3(), rot = new Quaternion(), s = new Vector3()
  m.decompose(pos, rot, s)
  return { pos, rot }
}

/** Transformación de un montaje: posición, giro fijo y giro elegido (en +y). */
function matrizMontaje(m: PuntoMontaje, giro = 0, extraY = 0): Matrix4 {
  const r = m.rotacion ?? [0, 0, 0]
  const q = new Quaternion().setFromEuler(new Euler(grados(r[0]), grados(r[1]), grados(r[2]), 'XYZ'))
  q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), grados(giro + extraY)))
  return new Matrix4().compose(new Vector3(...m.posicion), q, new Vector3(1, 1, 1))
}

export function raiz(doc: RobotDoc): PiezaEnRobot {
  const r = doc.piezas.filter(p => !p.padre)
  if (r.length !== 1) throw new Error(`El robot debe tener exactamente una pieza raíz (tiene ${r.length})`)
  return r[0]
}

export function hijos(doc: RobotDoc, id: string) {
  return doc.piezas.filter(p => p.padre?.instancia === id)
}

export function montajeDe(doc: RobotDoc, p: PiezaEnRobot): PuntoMontaje | null {
  if (!p.padre) return null
  const padre = doc.piezas.find(x => x.id === p.padre!.instancia)
  if (!padre) return null
  return pieza(padre.pieza).montajes.find(m => m.id === p.padre!.montaje) ?? null
}

/**
 * Pose de cada pieza en el marco del robot (mm). `angulosServo` (grados, 90 =
 * al frente) hace girar lo que cuelga del eje de cada servo.
 */
export function poses(doc: RobotDoc, angulosServo: Record<string, number> = {}): Map<string, Pose> {
  const out = new Map<string, Pose>()
  const r = raiz(doc)
  const visitar = (inst: PiezaEnRobot, m: Matrix4) => {
    out.set(inst.id, poseDeMatriz(m))
    const def = pieza(inst.pieza)
    for (const h of hijos(doc, inst.id)) {
      const mont = def.montajes.find(x => x.id === h.padre!.montaje)
      if (!mont) continue
      const extra = mont.tipo === 'eje-servo' ? (angulosServo[inst.id] ?? 90) - 90 : 0
      visitar(h, m.clone().multiply(matrizMontaje(mont, h.padre!.giro ?? 0, extra)))
    }
  }
  visitar(r, new Matrix4())
  return out
}

/** Punto (mm, marco de la pieza) llevado al marco del robot. */
export function aRobot(p: Pose, local: V3 | Vector3): Vector3 {
  const v = Array.isArray(local) ? new Vector3(...local) : local.clone()
  return v.applyQuaternion(p.rot).add(p.pos)
}

// ---------------------------------------------------------------------------
// Ruedas y rueda loca
// ---------------------------------------------------------------------------

export interface RuedaGeo {
  instancia: string
  motor: string
  centro: Vector3        // mm, marco del robot
  eje: Vector3           // dirección del eje de giro (unitaria)
  radio: number
  ancho: number
  material: PiezaDef['material']
}

export function ruedas(doc: RobotDoc, ps = poses(doc)): RuedaGeo[] {
  const out: RuedaGeo[] = []
  for (const p of doc.piezas) {
    const def = pieza(p.pieza)
    if (def.comportamiento.tipo !== 'rueda' || !p.padre) continue
    const pose = ps.get(p.id)!
    out.push({
      instancia: p.id,
      motor: p.padre.instancia,
      centro: pose.pos.clone(),
      eje: new Vector3(0, 0, 1).applyQuaternion(pose.rot),
      radio: def.comportamiento.radio_mm,
      ancho: def.comportamiento.ancho_mm,
      material: datosVariante(def, p.variante).material,
    })
  }
  return out
}

export interface RuedaLocaGeo { instancia: string; ancla: Vector3; centroBola: Vector3; radio: number; espaciador: number }

/**
 * La rueda loca lleva separadores para quedar a la altura de las ruedas
 * motrices (como en un kit real). Si ni con 0 mm alcanza, queda más baja y el
 * robot se inclina: lo avisa `avisosEnsamblaje`.
 */
export function ruedasLocas(doc: RobotDoc, ps = poses(doc)): RuedaLocaGeo[] {
  const rs = ruedas(doc, ps)
  const piso = rs.length ? Math.min(...rs.map(r => r.centro.y - r.radio)) : null
  const out: RuedaLocaGeo[] = []
  for (const p of doc.piezas) {
    const def = pieza(p.pieza)
    if (def.comportamiento.tipo !== 'rueda-loca') continue
    const pose = ps.get(p.id)!
    const radio = def.comportamiento.radio_mm
    const abajo = new Vector3(0, 1, 0).applyQuaternion(pose.rot) // +y local = hacia donde cuelga
    const espaciador = piso === null ? 5 : Math.max(0, (pose.pos.y - piso - 2 * radio) / Math.max(0.2, -abajo.y))
    out.push({
      instancia: p.id, ancla: pose.pos.clone(), radio, espaciador,
      centroBola: pose.pos.clone().addScaledVector(abajo, espaciador + radio),
    })
  }
  return out
}

// ---------------------------------------------------------------------------
// Resumen: peso, centro de gravedad, medidas
// ---------------------------------------------------------------------------

/** Esquinas de la caja que envuelve un colisionador, en el marco de la pieza. */
function esquinas(c: Colisionador): Vector3[] {
  const ce = new Vector3(...(c.centro ?? [0, 0, 0]))
  let h: V3
  if (c.forma === 'caja') h = [c.medidas[0] / 2, c.medidas[1] / 2, c.medidas[2] / 2]
  else if (c.forma === 'esfera') h = [c.radio, c.radio, c.radio]
  else h = c.eje === 'x' ? [c.alto / 2, c.radio, c.radio] : c.eje === 'y' ? [c.radio, c.alto / 2, c.radio] : [c.radio, c.radio, c.alto / 2]
  const out: Vector3[] = []
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) out.push(new Vector3(sx * h[0], sy * h[1], sz * h[2]).add(ce))
  return out
}

export interface Resumen {
  masa_g: number
  cg: Vector3                          // mm, marco del robot
  min: Vector3
  max: Vector3
  medidas: { largo: number; ancho: number; alto: number }  // mm (x, z, y)
  piezas: number
}

export function resumen(doc: RobotDoc, ps = poses(doc)): Resumen {
  let masa = 0
  const cg = new Vector3()
  const min = new Vector3(Infinity, Infinity, Infinity)
  const max = new Vector3(-Infinity, -Infinity, -Infinity)
  const locas = new Map(ruedasLocas(doc, ps).map(l => [l.instancia, l]))
  for (const p of doc.piezas) {
    const def = pieza(p.pieza)
    const pose = ps.get(p.id)!
    const m = datosVariante(def, p.variante).masa_g
    const loca = locas.get(p.id)
    const centro = loca ? loca.centroBola : aRobot(pose, def.colisionadores[0]?.centro ?? [0, 0, 0])
    masa += m
    cg.addScaledVector(centro, m)
    if (loca) {
      min.min(loca.centroBola.clone().subScalar(loca.radio))
      max.max(loca.centroBola.clone().addScalar(loca.radio))
      min.min(loca.ancla); max.max(loca.ancla)
      continue
    }
    for (const c of def.colisionadores) for (const e of esquinas(c)) {
      const w = aRobot(pose, e)
      min.min(w); max.max(w)
    }
  }
  if (masa > 0) cg.divideScalar(masa)
  return {
    masa_g: masa, cg, min, max, piezas: doc.piezas.length,
    medidas: { largo: max.x - min.x, ancho: max.z - min.z, alto: max.y - min.y },
  }
}

/** Avisos de armado que el alumno debe ver (no impiden probar). */
export function avisosEnsamblaje(doc: RobotDoc): string[] {
  const avisos: string[] = []
  const ps = poses(doc)
  const rs = ruedas(doc, ps)
  const motores = doc.piezas.filter(p => pieza(p.pieza).comportamiento.tipo === 'motor-dc')
  for (const m of motores) {
    if (!rs.some(r => r.motor === m.id)) avisos.push(`${m.etiqueta}: no tiene rueda`)
  }
  if (motores.length === 0) avisos.push('El robot no tiene motores: no se va a mover')
  for (const l of ruedasLocas(doc, ps)) {
    const piso = rs.length ? Math.min(...rs.map(r => r.centro.y - r.radio)) : 0
    if (l.centroBola.y - l.radio < piso - 1) avisos.push('La rueda loca queda más baja que las ruedas: el robot se va a inclinar y las ruedas pueden no tocar el piso')
  }
  const sinBateria = !doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'bateria')
  if (sinBateria && motores.length) avisos.push('Falta una batería: los motores no van a girar')
  const tieneMcu = doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'mcu')
  if (!tieneMcu) avisos.push('Falta la placa (Arduino o ESP32): nadie va a controlar el robot')
  if (motores.length && !doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'puente-h')) {
    avisos.push('Falta el driver de motores (L298N o TB6612): el Arduino no puede mover motores directamente')
  }
  return avisos
}

// ---------------------------------------------------------------------------
// Operaciones del taller
// ---------------------------------------------------------------------------

export interface MontajeLibre { instancia: string; montaje: PuntoMontaje }

export function montajesLibres(doc: RobotDoc): MontajeLibre[] {
  const ocupados = new Set(doc.piezas.filter(p => p.padre).map(p => `${p.padre!.instancia}/${p.padre!.montaje}`))
  const out: MontajeLibre[] = []
  for (const p of doc.piezas) {
    for (const m of pieza(p.pieza).montajes) {
      if (!ocupados.has(`${p.id}/${m.id}`)) out.push({ instancia: p.id, montaje: m })
    }
  }
  return out
}

/** Por qué no se puede encastrar (null = sí se puede). */
export function motivoNoEncastra(doc: RobotDoc, piezaId: string, instancia: string, montajeId: string): string | null {
  const def = pieza(piezaId)
  const destino = doc.piezas.find(p => p.id === instancia)
  if (!destino) return 'Esa pieza ya no está en el robot'
  const m = pieza(destino.pieza).montajes.find(x => x.id === montajeId)
  if (!m) return 'Ese punto de montaje no existe'
  if (def.proximamente) return `${def.nombre}: ${def.proximamente}`
  if (!def.encaja.includes(m.tipo)) return `${def.nombre} no encaja en «${m.nombre}»`
  if (doc.piezas.some(p => p.padre?.instancia === instancia && p.padre.montaje === montajeId)) return `«${m.nombre}» ya está ocupado`
  if (def.comportamiento.tipo === 'mcu' && doc.piezas.some(p => pieza(p.pieza).comportamiento.tipo === 'mcu')) {
    return 'El robot ya tiene una placa'
  }
  return null
}

function slug(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function idUnico(doc: RobotDoc, base: string) {
  let id = slug(base) || 'pieza'
  for (let n = 2; doc.piezas.some(p => p.id === id); n++) id = `${slug(base)}-${n}`
  return id
}

function etiquetaPara(doc: RobotDoc, def: PiezaDef, instancia: string, m: PuntoMontaje) {
  const destino = doc.piezas.find(p => p.id === instancia)!
  const corto = def.nombre.split(' ')[0]
  // En el chasis, el nombre del montaje ya describe la pieza ("Motor izquierdo");
  // la placa y el driver se llaman por su modelo.
  if (!destino.padre) return m.tipo === 'placa' || m.tipo === 'driver' ? def.nombre : m.nombre
  // Colgando de otra pieza: "Rueda del motor izquierdo", "Sensor del servo".
  return `${corto} del ${destino.etiqueta.charAt(0).toLowerCase()}${destino.etiqueta.slice(1)}`
}

export function encastrar(doc: RobotDoc, piezaId: string, instancia: string, montajeId: string, variante?: string): { doc: RobotDoc; id: string } {
  const motivo = motivoNoEncastra(doc, piezaId, instancia, montajeId)
  if (motivo) throw new Error(motivo)
  const def = pieza(piezaId)
  const m = pieza(doc.piezas.find(p => p.id === instancia)!.pieza).montajes.find(x => x.id === montajeId)!
  const etiqueta = etiquetaPara(doc, def, instancia, m)
  const id = idUnico(doc, etiqueta)
  const nueva: PiezaEnRobot = { id, pieza: piezaId, etiqueta, padre: { instancia, montaje: montajeId } }
  if (variante) nueva.variante = variante
  return { doc: { ...doc, piezas: [...doc.piezas, nueva] }, id }
}

/** Ids de una pieza y todo lo que cuelga de ella. */
export function descendientes(doc: RobotDoc, id: string): string[] {
  const out = [id]
  for (let i = 0; i < out.length; i++) for (const h of hijos(doc, out[i])) out.push(h.id)
  return out
}

export function quitar(doc: RobotDoc, id: string): RobotDoc {
  const p = doc.piezas.find(x => x.id === id)
  if (!p) return doc
  if (!p.padre) throw new Error('El chasis no se puede quitar: cámbialo por otro')
  const fuera = new Set(descendientes(doc, id))
  return {
    ...doc,
    piezas: doc.piezas.filter(x => !fuera.has(x.id)),
    cables: doc.cables.filter(c => !fuera.has(c.de[0]) && !fuera.has(c.a[0])),
  }
}

/**
 * Cambia una pieza por otra (p. ej. rueda de goma → de plástico, o chasis 2WD
 * → 4WD). Lo que colgaba de ella se conserva si el nuevo modelo tiene un
 * montaje con el mismo id y tipo compatible; lo demás se quita.
 */
export function reemplazar(doc: RobotDoc, id: string, nuevaPieza: string, variante?: string): { doc: RobotDoc; quitadas: string[] } {
  const actual = doc.piezas.find(x => x.id === id)
  if (!actual) return { doc, quitadas: [] }
  const nuevo = pieza(nuevaPieza)
  if (actual.padre) {
    const m = montajeDe(doc, actual)
    if (m && !nuevo.encaja.includes(m.tipo)) throw new Error(`${nuevo.nombre} no encaja en «${m.nombre}»`)
  } else if (nuevo.encaja.length) {
    throw new Error('El chasis solo se puede cambiar por otro chasis')
  }
  let d: RobotDoc = {
    ...doc,
    piezas: doc.piezas.map(p => (p.id === id ? { ...p, pieza: nuevaPieza, variante: variante ?? (nuevaPieza === p.pieza ? p.variante : undefined) } : p)),
  }
  const quitadas: string[] = []
  for (const h of hijos(d, id)) {
    const m = nuevo.montajes.find(x => x.id === h.padre!.montaje)
    if (!m || !pieza(h.pieza).encaja.includes(m.tipo)) {
      quitadas.push(h.etiqueta)
      d = quitar(d, h.id)
    }
  }
  // Los cables de pines que el modelo nuevo no tiene se quitan.
  const pines = new Set(nuevo.pines.map(p => p.nombre))
  d = { ...d, cables: d.cables.filter(c => (c.de[0] !== id || pines.has(c.de[1])) && (c.a[0] !== id || pines.has(c.a[1]))) }
  return { doc: d, quitadas }
}

export function girar(doc: RobotDoc, id: string): RobotDoc {
  const p = doc.piezas.find(x => x.id === id)
  const m = p ? montajeDe(doc, p) : null
  const ops = m?.rotacionesPermitidas
  if (!p || !m || !ops || ops.length < 2) return doc
  const i = ops.indexOf(p.padre!.giro ?? 0)
  const giro = ops[(i + 1) % ops.length]
  return { ...doc, piezas: doc.piezas.map(x => (x.id === id ? { ...x, padre: { ...x.padre!, giro } } : x)) }
}

export function cambiarVariante(doc: RobotDoc, id: string, variante: string): RobotDoc {
  return { ...doc, piezas: doc.piezas.map(x => (x.id === id ? { ...x, variante } : x)) }
}

/** Robot nuevo con solo un chasis. */
export function robotVacio(chasis: string, variante?: string, nombre = 'Mi robot'): RobotDoc {
  return {
    version: 2, nombre, placa: 'uno',
    piezas: [{ id: 'chasis', pieza: chasis, variante, etiqueta: 'Chasis' }],
    cables: [],
    programa: { modo: 'codigo', cpp: '' },
  }
}

/** Errores de estructura (documento corrupto o editado a mano). */
export function validar(doc: RobotDoc): string[] {
  const errores: string[] = []
  const ids = new Set<string>()
  for (const p of doc.piezas) {
    if (ids.has(p.id)) errores.push(`Id repetido: ${p.id}`)
    ids.add(p.id)
    try { pieza(p.pieza) } catch { errores.push(`Pieza desconocida: ${p.pieza}`) }
  }
  try { raiz(doc) } catch (e) { errores.push((e as Error).message) }
  const usados = new Set<string>()
  for (const p of doc.piezas) {
    if (!p.padre) continue
    const k = `${p.padre.instancia}/${p.padre.montaje}`
    if (usados.has(k)) errores.push(`Dos piezas en el mismo montaje: ${k}`)
    usados.add(k)
    const m = montajeDe(doc, p)
    if (!m) errores.push(`${p.etiqueta}: el montaje ${k} no existe`)
    else if (ids.has(p.padre.instancia) && !pieza(p.pieza).encaja.includes(m.tipo)) errores.push(`${p.etiqueta} no encaja en ${m.nombre}`)
  }
  return errores
}
