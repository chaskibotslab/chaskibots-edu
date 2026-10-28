'use client'

// Robot 3D construido desde su documento (árbol de piezas). Cada pieza se
// dibuja dentro del grupo de su montaje, así que la escena tiene la misma
// forma que el robot: lo que cuelga de un servo gira con él y las ruedas
// giran sobre su eje. En el taller muestra además los puntos de encastre.

import { createRef, Suspense, useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { datosVariante, pieza } from '../catalogo/piezas'
import { grados, type PiezaDef, type PuntoMontaje } from '../catalogo/tipos'
import { hijos, poses, raiz, resumen, ruedas, ruedasLocas, aRobot } from '../engine/ensamblaje'
import type { Simulacion } from '../engine/simulation'
import type { PiezaEnRobot, RobotDoc } from '../robots/doc'
import { useCalidad } from './calidad'
import { infoPlaca } from '../engine/placa'
import {
  ArduinoNano, ArduinoUno, Bateria18650, Bateria9V, Chasis, FC51, HCSR04, HornServo, L298N, LedUno, ModeloGlb, MotorTT, Rueda, RuedaLoca, Servo, TCRT5000, anclaPin, salidaPin, SeparadoresPlaca, type SalidaPin,
  ChasisMinisumo, MotorN20, BateriaLipo,
} from './modelos/Piezas3D'

const m = (v: number) => v / 1000

export interface MarcadorMontaje { clave: string; instancia: string; montaje: PuntoMontaje }

interface Refs {
  servos: Map<string, RefObject<THREE.Group>>
  ruedas: Map<string, { ref: RefObject<THREE.Group>; signo: number }>
  ledsIr: Map<string, RefObject<THREE.MeshStandardMaterial>>
  ledsObs: Map<string, RefObject<THREE.MeshStandardMaterial>>
  led13: RefObject<THREE.MeshStandardMaterial>
}

/** Lo mínimo para animar un robot en la arena: su física, sus pines y sus sensores. */
export type FuenteRobot = Pick<Simulacion, 'fisica' | 'pinesActuales' | 'lecturasActuales'>

interface Props {
  doc: RobotDoc
  /** De dónde sale la pose y el estado (la simulación del alumno o un rival). */
  sim?: FuenteRobot | null
  seleccion?: string | null
  onSeleccionar?: (id: string | null) => void
  marcadores?: MarcadorMontaje[]
  marcadorActivo?: string | null
  onMarcador?: (m: MarcadorMontaje) => void
  /** Posiciones en pantalla de los marcadores (para soltar al arrastrar). */
  posMarcadores?: MutableRefObject<Map<string, { x: number; y: number }>>
  explosion?: number
  cables?: boolean
}

function matrizMontaje(mt: PuntoMontaje, giro = 0) {
  const r = mt.rotacion ?? [0, 0, 0]
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(grados(r[0]), grados(r[1]), grados(r[2]), 'XYZ'))
  q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), grados(giro)))
  return { pos: new THREE.Vector3(m(mt.posicion[0]), m(mt.posicion[1]), m(mt.posicion[2])), q }
}

/** Modelo real (GLB) si la pieza lo tiene; mientras carga se ve el hecho por código. */
function Modelo(p: { inst: PiezaEnRobot; def: PiezaDef; refs: Refs; espaciadorLoca: number }) {
  if (!p.def.glb) return <ModeloProc {...p} />
  const c = p.def.comportamiento
  if (c.tipo === 'rueda') {
    return (
      <group ref={p.refs.ruedas.get(p.inst.id)?.ref}>
        {/* El respaldo es la rueda por código SIN su propio grupo de giro (este ya gira). */}
        <Suspense fallback={c.tipo === 'rueda' ? <Rueda radio={c.radio_mm} ancho={c.ancho_mm} material={datosVariante(p.def, p.inst.variante).material} /> : null}>
          <ModeloGlb url={p.def.glb} escala={p.def.escalaGlb} />
        </Suspense>
      </group>
    )
  }
  return (
    <Suspense fallback={<ModeloProc {...p} />}>
      <ModeloGlb url={p.def.glb} escala={p.def.escalaGlb} />
      {c.tipo === 'mcu' && p.def.colisionadores[0]?.forma === 'caja' && (
        <SeparadoresPlaca largo={p.def.colisionadores[0].medidas[0]} ancho={p.def.colisionadores[0].medidas[2]} />
      )}
      {p.def.id === 'arduino-uno' && <LedUno ref={p.refs.led13} />}
    </Suspense>
  )
}

function ModeloProc({ inst, def, refs, espaciadorLoca }: { inst: PiezaEnRobot; def: PiezaDef; refs: Refs; espaciadorLoca: number }) {
  const v = datosVariante(def, inst.variante)
  const c = def.comportamiento
  switch (def.modelo) {
    case 'proc:chasis-2wd': return <Chasis largo={160} ancho={120} material={v.material} color={v.color ?? '#cfe6f7'} />
    case 'proc:chasis-4wd': return <Chasis largo={200} ancho={130} material={v.material} color={v.color ?? '#cfe6f7'} />
    case 'proc:arduino-uno': return <ArduinoUno ref={refs.led13} />
    case 'proc:arduino-nano': return <ArduinoNano ref={refs.led13} />
    case 'proc:l298n': return <L298N />
    case 'proc:bateria-18650': return <Bateria18650 />
    case 'proc:bateria-9v': return <Bateria9V />
    case 'proc:bateria-lipo': return <BateriaLipo />
    case 'proc:chasis-minisumo': return <ChasisMinisumo material={v.material} color={v.color ?? '#1f2430'} />
    case 'proc:motor-n20': return <MotorN20 />
    case 'proc:motor-tt': return <MotorTT />
    case 'proc:rueda': {
      const r = refs.ruedas.get(inst.id)
      return (
        <group ref={r?.ref}>
          {c.tipo === 'rueda' && <Rueda radio={c.radio_mm} ancho={c.ancho_mm} material={v.material} color={v.color} />}
        </group>
      )
    }
    case 'proc:rueda-loca': return <RuedaLoca espaciador={espaciadorLoca} radio={c.tipo === 'rueda-loca' ? c.radio_mm : 8} />
    case 'proc:servo': return <Servo color={v.color ?? '#2563eb'} />
    case 'proc:tcrt5000': {
      if (!refs.ledsIr.has(inst.id)) refs.ledsIr.set(inst.id, createRef())
      return <TCRT5000 ref={refs.ledsIr.get(inst.id)} alturaSoporte={25} />
    }
    case 'proc:fc51': {
      if (!refs.ledsObs.has(inst.id)) refs.ledsObs.set(inst.id, createRef())
      return <FC51 ref={refs.ledsObs.get(inst.id)} />
    }
    case 'proc:hcsr04': return <HCSR04 />
  }
  return (
    <mesh>
      <boxGeometry args={[0.02, 0.02, 0.02]} />
      <meshStandardMaterial color="#f0f" />
    </mesh>
  )
}

/** Caja de selección alrededor de los colisionadores de la pieza. */
function Seleccion({ def }: { def: PiezaDef }) {
  return (
    <group>
      {def.colisionadores.map((c, i) => {
        const tam: [number, number, number] = c.forma === 'caja'
          ? [c.medidas[0], c.medidas[1], c.medidas[2]]
          : c.forma === 'esfera' ? [c.radio * 2, c.radio * 2, c.radio * 2]
            : c.eje === 'z' ? [c.radio * 2, c.radio * 2, c.alto] : c.eje === 'x' ? [c.alto, c.radio * 2, c.radio * 2] : [c.radio * 2, c.alto, c.radio * 2]
        const ce = c.centro ?? [0, 0, 0]
        return (
          <lineSegments key={i} position={[m(ce[0]), m(ce[1]), m(ce[2])]}>
            <edgesGeometry args={[new THREE.BoxGeometry(m(tam[0] + 3), m(tam[1] + 3), m(tam[2] + 3))]} />
            <lineBasicMaterial color="#E57361" />
          </lineSegments>
        )
      })}
    </group>
  )
}

function Marcador({ mk, activo, onClick }: { mk: MarcadorMontaje; activo: boolean; onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(activo ? 1.5 : 1 + Math.sin(clock.elapsedTime * 5) * 0.15)
  })
  return (
    <mesh
      ref={ref}
      position={[m(mk.montaje.posicion[0]), m(mk.montaje.posicion[1]), m(mk.montaje.posicion[2])]}
      onClick={e => { e.stopPropagation(); onClick?.() }}
    >
      <sphereGeometry args={[m(7), 20, 14]} />
      <meshBasicMaterial color={activo ? '#22c55e' : '#4ade80'} transparent opacity={activo ? 0.95 : 0.65} depthTest={false} />
    </mesh>
  )
}

interface NodoProps extends Props {
  inst: PiezaEnRobot
  refs: Refs
  espaciadores: Map<string, number>
  porInstancia: Map<string, MarcadorMontaje[]>
}

function Nodo(p: NodoProps) {
  const { doc, inst, refs, seleccion, onSeleccionar, explosion = 0 } = p
  const def = pieza(inst.pieza)
  const hs = hijos(doc, inst.id)
  const click = onSeleccionar
    ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSeleccionar(inst.id) }
    : undefined
  return (
    <group>
      <group onClick={click}>
        <Modelo inst={inst} def={def} refs={refs} espaciadorLoca={p.espaciadores.get(inst.id) ?? 0} />
        {seleccion === inst.id && <Seleccion def={def} />}
      </group>
      {(p.porInstancia.get(inst.id) ?? []).map(mk => (
        <Marcador key={mk.clave} mk={mk} activo={p.marcadorActivo === mk.clave} onClick={() => p.onMarcador?.(mk)} />
      ))}
      {hs.map(h => {
        const mt = def.montajes.find(x => x.id === h.padre!.montaje)
        if (!mt) return null
        const { pos, q } = matrizMontaje(mt, h.padre!.giro ?? 0)
        pos.multiplyScalar(1 + explosion)
        if (mt.tipo === 'eje-servo') {
          if (!refs.servos.has(inst.id)) refs.servos.set(inst.id, createRef())
          return (
            <group key={h.id} position={pos} quaternion={q}>
              <group ref={refs.servos.get(inst.id)}>
                <HornServo />
                <Nodo {...p} inst={h} />
              </group>
            </group>
          )
        }
        return (
          <group key={h.id} position={pos} quaternion={q}>
            <Nodo {...p} inst={h} />
          </group>
        )
      })}
      {/* El brazo del servo se ve aunque no tenga nada encastrado */}
      {def.comportamiento.tipo === 'servo' && !hs.length && def.montajes[0] && (
        <group position={matrizMontaje(def.montajes[0]).pos}><HornServo /></group>
      )}
    </group>
  )
}

/** Una punta de cable: dónde está, hacia dónde sale y cómo termina. */
interface Punta { pos: THREE.Vector3; dir: THREE.Vector3; tipo: SalidaPin['tipo'] }

const LARGO_DUPONT = 0.014

/**
 * Cable con forma de cable real: sale recto en la dirección del pin (dentro de
 * su conector Dupont, o del borne) y se curva hacia la otra punta como un
 * cable semirrígido (curva de Bézier), cayendo un poco por su peso.
 */
function Cable({ a, b, color }: { a: Punta; b: Punta; color: string }) {
  const q = useCalidad()
  const datos = useMemo(() => {
    const salida = (p: Punta) => p.pos.clone().addScaledVector(p.dir, p.tipo === 'dupont' ? LARGO_DUPONT : 0.004)
    const p0 = salida(a), p3 = salida(b)
    const L = p0.distanceTo(p3)
    const tiron = Math.min(0.03, 0.008 + L * 0.25)
    const p1 = p0.clone().addScaledVector(a.dir, tiron)
    const p2 = p3.clone().addScaledVector(b.dir, tiron)
    // Peso: la parte del medio cae un poco.
    p1.y -= L * 0.05
    p2.y -= L * 0.05
    const curva = new THREE.CubicBezierCurve3(p0, p1, p2, p3)
    const grueso = a.tipo !== 'dupont' && b.tipo !== 'dupont' ? 0.0009 : 0.00065
    const tubo = new THREE.TubeGeometry(curva, q.nivel === 'baja' ? 14 : 36, grueso, q.nivel === 'baja' ? 5 : 8, false)
    return { tubo, grueso }
  }, [a, b, q.nivel])
  return (
    <group>
      <mesh geometry={datos.tubo} castShadow={q.sombras}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {[a, b].map((p, i) => (p.tipo === 'dupont' ? <ConectorDupont key={i} punta={p} /> : <Punta key={i} punta={p} color={color} grueso={datos.grueso} />))}
    </group>
  )
}

function ConectorDupont({ punta }: { punta: Punta }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), punta.dir), [punta])
  const centro = useMemo(() => punta.pos.clone().addScaledVector(punta.dir, LARGO_DUPONT / 2), [punta])
  return (
    <mesh position={centro} quaternion={q}>
      <boxGeometry args={[0.0026, LARGO_DUPONT, 0.0026]} />
      <meshStandardMaterial color="#141414" roughness={0.55} />
    </mesh>
  )
}

/** Punta pelada (borne de tornillo o soldadura): un poco de cobre a la vista. */
function Punta({ punta, color, grueso }: { punta: Punta; color: string; grueso: number }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), punta.dir), [punta])
  const centro = useMemo(() => punta.pos.clone().addScaledVector(punta.dir, 0.002), [punta])
  return (
    <mesh position={centro} quaternion={q}>
      <cylinderGeometry args={[grueso * 0.7, grueso * 0.7, 0.004, 6]} />
      <meshStandardMaterial color={color === '#111827' ? '#b87333' : '#c98a4b'} metalness={0.9} roughness={0.3} />
    </mesh>
  )
}

function Cables({ doc }: { doc: RobotDoc }) {
  const lista = useMemo(() => {
    const ps = poses(doc)
    const punta = (inst: string, pin: string): Punta | null => {
      const p = doc.piezas.find(x => x.id === inst)
      const pose = ps.get(inst)
      if (!p || !pose) return null
      const modelo = pieza(p.pieza).modelo
      const a = anclaPin(modelo, pin)
      if (!a) return null
      const s = salidaPin(modelo, pin)
      return {
        pos: aRobot(pose, a).multiplyScalar(0.001),
        dir: new THREE.Vector3(...s.dir).normalize().applyQuaternion(pose.rot),
        tipo: s.tipo,
      }
    }
    return doc.cables
      .map(c => ({ c, a: punta(...c.de), b: punta(...c.a) }))
      .filter(x => x.a && x.b) as { c: RobotDoc['cables'][number]; a: Punta; b: Punta }[]
  }, [doc])
  return <>{lista.map(({ c, a, b }, i) => <Cable key={i} a={a} b={b} color={c.color} />)}</>
}

/** Proyecta los marcadores a la pantalla cada cuadro (para soltar piezas arrastradas). */
function ProyectarMarcadores({ doc, marcadores, destino, raizRef }: { doc: RobotDoc; marcadores: MarcadorMontaje[]; destino: MutableRefObject<Map<string, { x: number; y: number }>>; raizRef: RefObject<THREE.Group> }) {
  const { camera, size } = useThree()
  const ps = useMemo(() => poses(doc), [doc])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const mapa = new Map<string, { x: number; y: number }>()
    const raizM = raizRef.current?.matrixWorld
    for (const mk of marcadores) {
      const pose = ps.get(mk.instancia)
      if (!pose || !raizM) continue
      v.copy(aRobot(pose, mk.montaje.posicion)).multiplyScalar(0.001).applyMatrix4(raizM).project(camera)
      mapa.set(mk.clave, { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height })
    }
    destino.current = mapa
  })
  return null
}

export default function Robot3D(props: Props) {
  const { doc, sim, marcadores = [], cables = true } = props
  const grupo = useRef<THREE.Group>(null)
  const refs = useMemo<Refs>(() => ({
    servos: new Map(), ruedas: new Map(), ledsIr: new Map(), ledsObs: new Map(), led13: createRef(),
  }), [])

  const datos = useMemo(() => {
    const ps = poses(doc)
    const rs = ruedas(doc, ps)
    for (const r of rs) {
      if (!refs.ruedas.has(r.instancia)) refs.ruedas.set(r.instancia, { ref: createRef(), signo: 1 })
      refs.ruedas.get(r.instancia)!.signo = Math.sign(r.eje.z) || 1
    }
    const locas = ruedasLocas(doc, ps)
    const bajo = Math.min(...rs.map(r => r.centro.y - r.radio), ...locas.map(l => l.centroBola.y - l.radio), resumen(doc, ps).min.y)
    return { espaciadores: new Map(locas.map(l => [l.instancia, l.espaciador])), apoyo: m(-bajo) }
  }, [doc, refs])

  const porInstancia = useMemo(() => {
    const mapa = new Map<string, MarcadorMontaje[]>()
    for (const mk of marcadores) mapa.set(mk.instancia, [...(mapa.get(mk.instancia) ?? []), mk])
    return mapa
  }, [marcadores])

  useFrame(() => {
    const g = grupo.current
    if (!g) return
    const f = sim?.fisica
    if (f) {
      const p = f.body.translation()
      const q = f.body.rotation()
      g.position.set(p.x, p.y, p.z)
      g.quaternion.set(q.x, q.y, q.z, q.w)
      for (const r of f.ruedas) {
        const w = refs.ruedas.get(r.instancia)
        if (w?.ref.current) w.ref.current.rotation.z = -r.angulo * w.signo
      }
      for (const s of Array.from(f.servos.values())) {
        const ref = refs.servos.get(s.instancia)?.current
        if (ref) ref.rotation.y = grados(s.angulo - 90)
      }
      const d13 = sim.pinesActuales[infoPlaca(doc).pinLed]
      if (refs.led13.current) refs.led13.current.emissiveIntensity = d13?.mode === 'output' && d13.duty > 0.05 ? 3 * d13.duty + 0.5 : 0
      for (const l of sim.lecturasActuales) {
        if (l.tipo === 'linea') {
          const mat = refs.ledsIr.get(l.instancia)?.current
          // El LED del módulo se prende cuando DO está en LOW (ve blanco).
          if (mat) mat.emissiveIntensity = l.reflectancia >= 0.5 ? 2.5 : 0
        } else if (l.tipo === 'obstaculo') {
          const mat = refs.ledsObs.get(l.instancia)?.current
          if (mat) mat.emissiveIntensity = l.detecta ? 2.5 : 0
        }
      }
    } else {
      g.position.set(0, datos.apoyo, 0)
      g.quaternion.identity()
    }
  })

  const r = raiz(doc)
  return (
    <group ref={grupo} onPointerMissed={() => props.onSeleccionar?.(null)}>
      <Nodo {...props} inst={r} refs={refs} espaciadores={datos.espaciadores} porInstancia={porInstancia} />
      {cables && !props.explosion && <Cables doc={doc} />}
      {props.posMarcadores && <ProyectarMarcadores doc={doc} marcadores={marcadores} destino={props.posMarcadores} raizRef={grupo} />}
    </group>
  )
}
