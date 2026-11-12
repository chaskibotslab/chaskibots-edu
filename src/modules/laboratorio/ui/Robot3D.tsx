'use client'

// Robot 3D construido desde su documento (árbol de piezas). Cada pieza se
// dibuja dentro del grupo de su montaje, así que la escena tiene la misma
// forma que el robot: lo que cuelga de un servo gira con él y las ruedas
// giran sobre su eje. En el taller muestra además los puntos de encastre.

import { createRef, Suspense, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { datosVariante, pieza } from '../catalogo/piezas'
import { grados, type PiezaDef, type PuntoMontaje } from '../catalogo/tipos'
import { hijos, montajeDe, poses, raiz, resumen, ruedas, ruedasLocas, aRobot } from '../engine/ensamblaje'
import type { Simulacion } from '../engine/simulation'
import type { RobotFisico } from '../engine/fisica/robotFisico'
import type { PiezaEnRobot, RobotDoc } from '../robots/doc'
import { useCalidad } from './calidad'
import { infoPlaca } from '../engine/placa'
import {
  ArduinoMega, ArduinoNano, ArduinoUno, Joystick, Pico, RaspberryPi4, JetsonNano, CamaraCSI, PisoArriba, Bateria18650, Bateria9V, Chasis, FC51, HCSR04, HornServo, L298N, LedUno, ModeloGlb, MotorTT, Rueda, RuedaLoca, Servo, TCRT5000, anclaPin, salidaPin, SeparadoresPlaca, type SalidaPin,
  ChasisMinisumo, MotorN20, BateriaLipo, ChasisBattlebot, ArmaGiratoria, ChasisTambor, ChasisDisco, MotorCombate, RuedaCombate, ArmaTambor, ArmaDisco,
  PerroRobot, ikPata, RADIO_PIE, type PataPerro, SensorBarra,
} from './modelos/Piezas3D'
import { PerroGo1 } from './modelos/Robots3D'
import { CablesPcb } from './modelos/Pcb3D'
import { SEPARADOR_PISO } from '../catalogo/piezas/chasis'
import { AGUJEROS_RIEL, ALTO_PROTOBOARD, RIELES, agujeroRiel, xRiel } from '../catalogo/piezas/circuito'
import { CircuitoVivoContexto, ModeloCircuito, esModeloCircuito, type CircuitoVivo } from './modelos/Circuito3D'

const m = (v: number) => v / 1000

/**
 * Bajo el puntero hay un pin de cableado: el pin gana aunque un cable o la
 * pieza estén más cerca de la cámara (el pin está metido en su conector).
 */
const hayPin = (e: { intersections: { object: THREE.Object3D }[] }) => e.intersections.some(i => i.object.userData.esPin)

export interface MarcadorMontaje { clave: string; instancia: string; montaje: PuntoMontaje }

interface Refs {
  servos: Map<string, RefObject<THREE.Group>>
  ruedas: Map<string, { ref: RefObject<THREE.Group>; signo: number }>
  ledsIr: Map<string, RefObject<THREE.MeshStandardMaterial>>
  ledsObs: Map<string, RefObject<THREE.MeshStandardMaterial>>
  led13: RefObject<THREE.MeshStandardMaterial>
  armas: Map<string, RefObject<THREE.Group>>
  /** Patas del perro robot (abducción, muslo, rodilla), en el orden de sus caderas. */
  perro: PataPerro[]
}

/** Lo mínimo para animar un robot en la arena: su física, sus pines y sus sensores. */
export type FuenteRobot = Pick<Simulacion, 'fisica' | 'pinesActuales' | 'lecturasActuales'>
  & Partial<Pick<Simulacion, 'circuitoActual' | 'controles' | 'presionar'>>

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
  /** Modo cablear: muestra cada pin como un punto que se puede tocar y deja elegir cables. */
  cableado?: Cableado3D
}

/** Lo que necesita la escena para cablear sobre las piezas reales. Los pines van como "instancia.pin". */
export interface Cableado3D {
  /** Pin ya elegido (la primera punta del cable que se está poniendo). */
  elegido: [string, string] | null
  cableSel: number | null
  /** Pines con algún problema eléctrico. */
  problemas: Set<string>
  /** Pines del próximo paso de la guía: laten para que se encuentren. */
  sugeridos: Set<string>
  onPin: (inst: string, pin: string) => void
  onCable: (i: number | null) => void
  /** El puntero pasa por encima de un pin (null = salió). */
  onSobre?: (pin: [string, string] | null) => void
  /** Se tocó una pieza (no un pin): punto tocado en el mundo, para acercar la cámara ahí. */
  onPieza?: (punto: THREE.Vector3, inst: string) => void
}

function matrizMontaje(mt: PuntoMontaje, giro = 0) {
  const r = mt.rotacion ?? [0, 0, 0]
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(grados(r[0]), grados(r[1]), grados(r[2]), 'XYZ'))
  q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), grados(giro)))
  return { pos: new THREE.Vector3(m(mt.posicion[0]), m(mt.posicion[1]), m(mt.posicion[2])), q }
}

/** Modelo real (GLB) si la pieza lo tiene; mientras carga se ve el hecho por código. */
function Modelo(p: { inst: PiezaEnRobot; def: PiezaDef; refs: Refs; espaciadorLoca: number; bajoChasis?: number; traslucido?: boolean }) {
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
  if (c.tipo === 'arma-giratoria') {
    // El arma entera gira (tambor con sus dientes): el grupo es el que mueve la simulación.
    if (!p.refs.armas.has(p.inst.id)) p.refs.armas.set(p.inst.id, createRef())
    return (
      <Suspense fallback={null}>
        <group ref={p.refs.armas.get(p.inst.id)}><ModeloGlb url={p.def.glb} escala={p.def.escalaGlb} /></group>
      </Suspense>
    )
  }
  if (c.tipo === 'chasis') {
    // Carrocería real: en «Cablear» se vuelve traslúcida para ver la electrónica que lleva adentro.
    return <Suspense fallback={null}><ModeloGlb url={p.def.glb} escala={p.def.escalaGlb} traslucido={p.traslucido && p.def.carcasa} /></Suspense>
  }
  if (c.tipo === 'cuadrupedo') {
    return (
      <Suspense fallback={<ModeloProc {...p} />}>
        <PerroGo1 url={p.def.glb} caderas={c.caderas} patas={p.refs.perro} />
      </Suspense>
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

function ModeloProc({ inst, def, refs, espaciadorLoca, bajoChasis = 0 }: { inst: PiezaEnRobot; def: PiezaDef; refs: Refs; espaciadorLoca: number; bajoChasis?: number }) {
  const v = datosVariante(def, inst.variante)
  const c = def.comportamiento
  if (esModeloCircuito(def.modelo)) return <ModeloCircuito def={def} inst={inst.id} />
  switch (def.modelo) {
    case 'proc:chasis-2wd': return <Chasis largo={160} ancho={120} material={v.material} color={v.color ?? '#cfe6f7'} />
    case 'proc:chasis-4wd': return <Chasis largo={200} ancho={130} material={v.material} color={v.color ?? '#cfe6f7'} />
    case 'proc:arduino-uno': return <ArduinoUno ref={refs.led13} />
    case 'proc:arduino-nano': return <ArduinoNano ref={refs.led13} />
    case 'proc:arduino-mega': return <ArduinoMega ref={refs.led13} />
    case 'proc:pico': return <Pico ref={refs.led13} />
    case 'proc:raspberry-pi-4': return <RaspberryPi4 ref={refs.led13} />
    case 'proc:jetson-nano': return <JetsonNano />
    case 'proc:camara-csi': return <CamaraCSI />
    case 'proc:l298n': return <L298N />
    case 'proc:bateria-18650': return <Bateria18650 />
    case 'proc:bateria-9v': return <Bateria9V />
    case 'proc:bateria-lipo': return <BateriaLipo />
    case 'proc:piso-arriba': return <PisoArriba alto={SEPARADOR_PISO} color={v.color ?? '#334155'} />
    case 'proc:chasis-minisumo': return <ChasisMinisumo material={v.material} color={v.color ?? '#1f2430'} />
    case 'proc:chasis-battlebot': return <ChasisBattlebot material={v.material} color={v.color ?? '#b8bec6'} />
    case 'proc:chasis-tambor': return <ChasisTambor material={v.material} color={v.color ?? '#4b5563'} />
    case 'proc:chasis-disco': return <ChasisDisco material={v.material} color={v.color ?? '#4b5563'} />
    case 'proc:motor-combate': return <MotorCombate />
    case 'proc:rueda-combate': {
      const r = refs.ruedas.get(inst.id)
      return <group ref={r?.ref}>{c.tipo === 'rueda' && <RuedaCombate radio={c.radio_mm} ancho={c.ancho_mm} />}</group>
    }
    case 'proc:arma-tambor':
    case 'proc:arma-disco': {
      if (!refs.armas.has(inst.id)) refs.armas.set(inst.id, createRef())
      const radio = c.tipo === 'arma-giratoria' ? c.radio_mm : 28, ancho = c.tipo === 'arma-giratoria' ? c.ancho_mm ?? 8 : 8
      return def.modelo === 'proc:arma-tambor'
        ? <ArmaTambor ref={refs.armas.get(inst.id)} radio={radio} ancho={ancho} />
        : <ArmaDisco ref={refs.armas.get(inst.id)} radio={radio} ancho={ancho} />
    }
    case 'proc:arma-giratoria': {
      if (!refs.armas.has(inst.id)) refs.armas.set(inst.id, createRef())
      return <ArmaGiratoria ref={refs.armas.get(inst.id)} radio={c.tipo === 'arma-giratoria' ? c.radio_mm : 65} alto={c.tipo === 'arma-giratoria' ? c.alto_mm : 42} />
    }
    case 'proc:perro-robot':
      return c.tipo === 'cuadrupedo' ? <PerroRobot caderas={c.caderas} muslo={c.muslo_mm} pierna={c.pierna_mm} color={v.color ?? '#3f4650'} patas={refs.perro} /> : null
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
      // El soporte sube desde el sensor (8,6 mm) hasta la cara de abajo del chasis (3 mm de espesor).
      return <TCRT5000 ref={refs.ledsIr.get(inst.id)} alturaSoporte={Math.max(1, bajoChasis - 1.5 - 8.6)} />
    }
    case 'proc:sensor-barra': {
      if (!refs.ledsIr.has(inst.id)) refs.ledsIr.set(inst.id, createRef())
      return <SensorBarra ref={refs.ledsIr.get(inst.id)} />
    }
    case 'proc:fc51': {
      if (!refs.ledsObs.has(inst.id)) refs.ledsObs.set(inst.id, createRef())
      return <FC51 ref={refs.ledsObs.get(inst.id)} />
    }
    case 'proc:hcsr04': return <HCSR04 />
    case 'proc:joystick': return <Joystick />
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
  const enfocar = p.cableado?.onPieza
  const click = onSeleccionar || enfocar
    ? (e: ThreeEvent<MouseEvent>) => { if (hayPin(e)) return; e.stopPropagation(); onSeleccionar?.(inst.id); enfocar?.(e.point.clone(), inst.id) }
    : undefined
  return (
    <group>
      <group onClick={click}>
        <Modelo inst={inst} def={def} refs={refs} espaciadorLoca={p.espaciadores.get(inst.id) ?? 0} bajoChasis={-(montajeDe(doc, inst)?.posicion[1] ?? -35)}
          traslucido={!!p.cableado || explosion > 0.05 || (p.marcadores?.length ?? 0) > 0}
        />
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
/** Conector de la punta macho pinchada en la protoboard (más corto). */
const LARGO_MACHO = 0.006
const largoConector = (t: Punta['tipo']) => (t === 'dupont' ? LARGO_DUPONT : t === 'macho' ? LARGO_MACHO : 0)

/**
 * Cable con forma de cable real: sale recto en la dirección del pin (dentro de
 * su conector Dupont, o del borne) y se curva hacia la otra punta como un
 * cable semirrígido (curva de Bézier), cayendo un poco por su peso.
 */
function Cable({ a, b, color, sel = false, tenue = false, fantasma = false, onClick }: { a: Punta; b: Punta; color: string; sel?: boolean; tenue?: boolean; fantasma?: boolean; onClick?: () => void }) {
  const q = useCalidad()
  const tocable = !!onClick
  const datos = useMemo(() => {
    const salida = (p: Punta) => p.pos.clone().addScaledVector(p.dir, largoConector(p.tipo) || 0.004)
    const p0 = salida(a), p3 = salida(b)
    const L = p0.distanceTo(p3)
    // Sale derecho del conector un tramo corto y enseguida se tiende hacia la otra
    // punta, cayendo por su peso: cables bajos y pegados al robot, no arcos altos.
    const tiron = Math.min(0.016, 0.006 + L * 0.12)
    const p1 = p0.clone().addScaledVector(a.dir, tiron)
    const p2 = p3.clone().addScaledVector(b.dir, tiron)
    p1.y -= L * 0.08
    p2.y -= L * 0.08
    const curva = new THREE.CubicBezierCurve3(p0, p1, p2, p3)
    const conector = (t: Punta['tipo']) => t === 'dupont' || t === 'macho'
    const grueso = !conector(a.tipo) && !conector(b.tipo) ? 0.0009 : 0.00065
    const tubo = new THREE.TubeGeometry(curva, q.nivel === 'baja' ? 14 : 36, sel ? grueso * 1.7 : grueso, q.nivel === 'baja' ? 5 : 8, false)
    // Tubo ancho invisible: un cable de 1 mm sería casi imposible de tocar con el dedo.
    const toque = tocable ? new THREE.TubeGeometry(curva, 12, 0.0028, 5, false) : null
    return { tubo, grueso, toque }
  }, [a, b, q.nivel, sel, tocable])
  return (
    <group>
      <mesh geometry={datos.tubo} castShadow={q.sombras && !fantasma}>
        <meshStandardMaterial color={color} roughness={0.4} emissive={sel ? color : '#000000'} emissiveIntensity={sel ? 0.6 : 0} transparent={tocable || fantasma} opacity={fantasma ? 0.55 : tenue ? 0.3 : 1} />
      </mesh>
      {datos.toque && (
        <mesh geometry={datos.toque} onClick={e => { if (hayPin(e)) return; e.stopPropagation(); onClick?.() }} onPointerOver={e => { if (hayPin(e)) return; e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {[a, b].map((p, i) => (largoConector(p.tipo) ? <ConectorDupont key={i} punta={p} largo={largoConector(p.tipo)} /> : <Punta key={i} punta={p} color={color} grueso={datos.grueso} />))}
    </group>
  )
}

function ConectorDupont({ punta, largo }: { punta: Punta; largo: number }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), punta.dir), [punta])
  const centro = useMemo(() => punta.pos.clone().addScaledVector(punta.dir, largo / 2), [punta, largo])
  return (
    <mesh position={centro} quaternion={q}>
      <boxGeometry args={[largo === LARGO_DUPONT ? 0.0026 : 0.0022, largo, largo === LARGO_DUPONT ? 0.0026 : 0.0022]} />
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

/**
 * Dónde termina cada cable: `punta` para un pin con lugar fijo y `enRiel` para
 * los rieles de la protoboard (el cable entra en el agujero libre más cercano
 * a su otra punta). Todo en metros, en el marco del robot.
 */
function puntasDe(doc: RobotDoc) {
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
  const usados = new Map<string, Set<number>>()
  const base = raiz(doc)
  const poseBase = ps.get(base.id)
  const enRiel = (inst: string, pin: string, otra: Punta | null): Punta | null => {
    if (!poseBase || inst !== base.id) return null
    // Un puente entre dos rieles va al principio de la protoboard.
    const x = otra ? otra.pos.clone().multiplyScalar(1000).sub(poseBase.pos).applyQuaternion(poseBase.rot.clone().invert()).x : -70
    const h = agujeroRiel(pin, x, usados)
    if (!h) return null
    return { pos: aRobot(poseBase, [h[0], ALTO_PROTOBOARD + 0.3, h[1]]).multiplyScalar(0.001), dir: new THREE.Vector3(0, 1, 0).applyQuaternion(poseBase.rot), tipo: 'macho' }
  }
  /** Las dos puntas de un cable (null si algún pin no tiene lugar). */
  const cable = (de: [string, string], a: [string, string]): [Punta, Punta] | null => {
    const pa = punta(...de), pb = punta(...a)
    const x = pa ?? enRiel(...de, pb)
    const y = pb ?? enRiel(...a, x)
    return x && y ? [x, y] : null
  }
  return { punta, cable, base, poseBase }
}

function Cables({ doc, cableado }: { doc: RobotDoc; cableado?: Cableado3D }) {
  const lista = useMemo(() => {
    const { cable } = puntasDe(doc)
    return doc.cables.map((c, i) => ({ c, i, p: cable(c.de, c.a) })).filter(x => x.p) as { c: RobotDoc['cables'][number]; i: number; p: [Punta, Punta] }[]
  }, [doc])
  const sel = cableado?.cableSel ?? null
  const elegir = cableado?.onCable
  // Con PCB: pistas y mazos en lugar de cables sueltos. En «Cablear» se ve cada conexión como cable, para poder tocarla.
  if (doc.conexion === 'pcb' && !cableado) return <CablesPcb doc={doc} lista={lista} suelto={({ c, i, p }) => <Cable key={i} a={p[0]} b={p[1]} color={c.color} />} />
  return <>{lista.map(({ c, i, p }) => (
    <Cable key={i} a={p[0]} b={p[1]} color={c.color} sel={sel === i} tenue={sel !== null && sel !== i} onClick={elegir ? () => elegir(i) : undefined} />
  ))}</>
}

const COLOR_PIN: Record<string, string> = { gnd: '#64748b', alim: '#dc2626', potencia: '#dc2626', pwm: '#9333ea', analogico: '#65a30d' }
const colorPin = (tipo: string) => COLOR_PIN[tipo] ?? '#2563eb'

type EstadoPin = 'normal' | 'elegido' | 'sugerido' | 'problema'
const colorEstado = (e: EstadoPin, normal: string) => (e === 'elegido' ? '#facc15' : e === 'sugerido' ? '#22c55e' : e === 'problema' ? '#f59e0b' : normal)

function EtiquetaPin({ texto }: { texto: string }) {
  return (
    <Html position={[0, 0.004, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <span style={{ display: 'block', transform: 'translateY(-14px)', whiteSpace: 'nowrap', background: 'rgba(15,23,42,.92)', color: '#fff', font: '600 11px ui-monospace, monospace', padding: '2px 6px', borderRadius: 4 }}>{texto}</span>
    </Html>
  )
}

interface PropsPunto { estado: EstadoPin; etiqueta: string; onClick: () => void; onSobre: (si: boolean) => void }

/** Un pin que se puede tocar: una bolita en su lugar real, del color de su tipo. */
function PuntoPin({ pos, color, estado, etiqueta, onClick, onSobre }: PropsPunto & { pos: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  const [sobre, setSobre] = useState(false)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const late = estado === 'sugerido' || estado === 'elegido' ? 1.45 + Math.sin(clock.elapsedTime * 6) * 0.3 : 1
    ref.current.scale.setScalar(sobre ? 1.6 : late)
  })
  return (
    <mesh
      ref={ref} position={pos} renderOrder={10} userData={{ esPin: true }}
      onClick={e => { e.stopPropagation(); onClick() }}
      onPointerOver={e => { e.stopPropagation(); setSobre(true); onSobre(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setSobre(false); onSobre(false); document.body.style.cursor = '' }}
    >
      <sphereGeometry args={[0.00115, 14, 10]} />
      <meshBasicMaterial color={colorEstado(estado, color)} transparent opacity={sobre || estado !== 'normal' ? 1 : 0.85} depthTest={false} />
      {(sobre || estado === 'elegido') && <EtiquetaPin texto={etiqueta} />}
    </mesh>
  )
}

/** Riel de la protoboard: una barra a lo largo de todos sus agujeros (están unidos por dentro). */
function BarraRiel({ a, b, mas, estado, etiqueta, onClick, onSobre }: PropsPunto & { a: THREE.Vector3; b: THREE.Vector3; mas: boolean }) {
  const [sobre, setSobre] = useState(false)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = sobre ? 0.9 : estado === 'normal' ? 0.4 : 0.6 + Math.sin(clock.elapsedTime * 6) * 0.3
  })
  const { centro, giro, largo } = useMemo(() => ({
    centro: a.clone().add(b).multiplyScalar(0.5),
    giro: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), b.clone().sub(a).normalize()),
    largo: a.distanceTo(b) + 0.003,
  }), [a, b])
  return (
    <mesh
      position={centro} quaternion={giro} renderOrder={9} userData={{ esPin: true }}
      onClick={e => { e.stopPropagation(); onClick() }}
      onPointerOver={e => { e.stopPropagation(); setSobre(true); onSobre(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setSobre(false); onSobre(false); document.body.style.cursor = '' }}
    >
      <boxGeometry args={[largo, 0.0006, 0.0021]} />
      <meshBasicMaterial ref={mat} color={colorEstado(estado, mas ? '#dc2626' : '#2563eb')} transparent opacity={0.4} depthTest={false} />
      {(sobre || estado === 'elegido') && <EtiquetaPin texto={etiqueta} />}
    </mesh>
  )
}

/** Modo cablear: todos los pines del robot en su lugar real, y el cable que se está por poner. */
function PinesCableado({ doc, cableado }: { doc: RobotDoc; cableado: Cableado3D }) {
  const [sobre, setSobre] = useState<[string, string] | null>(null)
  const datos = useMemo(() => {
    const t = puntasDe(doc)
    const pines: { inst: string; pin: string; tipo: string; etiqueta: string; pos: THREE.Vector3 }[] = []
    const rieles: { pin: string; mas: boolean; a: THREE.Vector3; b: THREE.Vector3 }[] = []
    for (const p of doc.piezas) {
      const def = pieza(p.pieza)
      if (def.comportamiento.tipo === 'protoboard' && t.poseBase && p.id === t.base.id) {
        for (const r of RIELES) {
          if (!def.pines.some(x => x.nombre === r.pin)) continue
          const y = ALTO_PROTOBOARD + 0.4
          rieles.push({
            pin: r.pin, mas: r.signo === '+',
            a: aRobot(t.poseBase, [xRiel(0), y, r.z]).multiplyScalar(0.001),
            b: aRobot(t.poseBase, [xRiel(AGUJEROS_RIEL - 1), y, r.z]).multiplyScalar(0.001),
          })
        }
        continue
      }
      for (const pin of def.pines) {
        const pt = t.punta(p.id, pin.nombre)
        if (!pt) continue
        // La bolita va en la boca del pin, apenas hacia donde sale el cable.
        pines.push({ inst: p.id, pin: pin.nombre, tipo: pin.tipo, etiqueta: `${pin.nombre}${pin.tipo === 'pwm' ? '~' : ''}`, pos: pt.pos.clone().addScaledVector(pt.dir, 0.0012) })
      }
    }
    return { pines, rieles, base: t.base.id }
  }, [doc])

  const estado = (inst: string, pin: string): EstadoPin => {
    const k = `${inst}.${pin}`
    if (cableado.elegido && cableado.elegido[0] === inst && cableado.elegido[1] === pin) return 'elegido'
    if (cableado.sugeridos.has(k)) return 'sugerido'
    if (cableado.problemas.has(k)) return 'problema'
    return 'normal'
  }
  const pasar = (inst: string, pin: string) => (si: boolean) => {
    const v: [string, string] | null = si ? [inst, pin] : null
    setSobre(v)
    cableado.onSobre?.(v)
  }

  // Cable «fantasma»: desde el pin elegido hasta el que está bajo el puntero, para ver cómo quedaría.
  const fantasma = useMemo(() => {
    const e = cableado.elegido
    if (!e || !sobre || (e[0] === sobre[0] && e[1] === sobre[1])) return null
    return puntasDe(doc).cable(e, sobre)
  }, [doc, cableado.elegido, sobre])

  return (
    <group>
      {datos.rieles.map(r => (
        <BarraRiel key={r.pin} a={r.a} b={r.b} mas={r.mas} estado={estado(datos.base, r.pin)}
          etiqueta={`riel ${r.mas ? '+' : '−'} de ${r.pin.endsWith('arriba') ? 'arriba' : 'abajo'}`}
          onClick={() => cableado.onPin(datos.base, r.pin)} onSobre={pasar(datos.base, r.pin)} />
      ))}
      {datos.pines.map(p => (
        <PuntoPin key={`${p.inst}.${p.pin}`} pos={p.pos} color={colorPin(p.tipo)} estado={estado(p.inst, p.pin)} etiqueta={p.etiqueta}
          onClick={() => cableado.onPin(p.inst, p.pin)} onSobre={pasar(p.inst, p.pin)} />
      ))}
      {fantasma && <Cable a={fantasma[0]} b={fantasma[1]} color="#facc15" fantasma />}
    </group>
  )
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

/**
 * Patas del perro en cada cuadro: el pie va donde la suspensión de esa pata
 * encontró el piso y, al caminar, se mueve al trote (patas en diagonal juntas):
 * adelante en el aire y atrás apoyado. La pata del saludo se mueve en el aire.
 */
function animarPatas(mc: NonNullable<RobotFisico['marcha']>, patas: PataPerro[], t: number) {
  const c = mc.plan
  const l = c.largoPata / 2
  const avance = mc.v.x / c.vMax, lado = mc.v.y / c.vLatMax, giro = mc.v.w / ((c.giroMax * Math.PI) / 180)
  const rapidez = Math.min(1, Math.max(Math.hypot(avance, lado), Math.abs(giro)))
  mc.patas.forEach((p, i) => {
    const r = patas[i]
    if (!r?.abd || !r.muslo || !r.rodilla) return
    const psi = mc.fase + (i === 0 || i === 3 ? 0 : Math.PI)
    let x: number, y: number, z = p.corrimiento.z
    if (p.enAire) {
      x = 0.09; y = 0.05 + 0.015 * Math.sin(t * 9)
    } else {
      const zancada = 0.035 * (avance + (c.caderas[i].z < 0 ? -0.7 : 0.7) * giro)
      x = -zancada * Math.cos(psi)
      y = Math.min(c.largoPata, p.largo ?? p.altura) - RADIO_PIE / 1000 - 0.025 * rapidez * Math.max(0, Math.sin(psi))
      z -= 0.015 * lado * Math.cos(psi)   // vy + = izquierda (−z)
    }
    r.abd.rotation.x = -Math.atan2(z, y)
    // El modelo real tiene los tramos más largos que la pata de la física: dobla más la rodilla.
    const [a, b] = ikPata(x, Math.hypot(y, z), r.tramo ?? l)
    r.muslo.rotation.z = a
    r.rodilla.rotation.z = b
  })
}

export default function Robot3D(props: Props) {
  const { doc, sim, marcadores = [], cables = true } = props
  const grupo = useRef<THREE.Group>(null)
  const refs = useMemo<Refs>(() => ({
    servos: new Map(), ruedas: new Map(), ledsIr: new Map(), ledsObs: new Map(), led13: createRef(), armas: new Map(), perro: [],
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
    // El perro se muestra parado sobre sus patas (sus colisionadores no llegan al piso).
    const c = pieza(raiz(doc).pieza).comportamiento
    const apoyo = c.tipo === 'cuadrupedo' ? m(c.alturas_mm.parado - c.caderas[0][1]) : m(-bajo)
    return { espaciadores: new Map(locas.map(l => [l.instancia, l.espaciador])), apoyo }
  }, [doc, refs])

  const porInstancia = useMemo(() => {
    const mapa = new Map<string, MarcadorMontaje[]>()
    for (const mk of marcadores) mapa.set(mk.instancia, [...(mapa.get(mk.instancia) ?? []), mk])
    return mapa
  }, [marcadores])

  useFrame(({ clock }) => {
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
      // La barra gira de verdad, pero a 6000 rpm se vería quieta: se dibuja más lenta.
      for (const a of f.armas) {
        const g = refs.armas.get(a.instancia)?.current
        // De pie (tambor, disco) gira alrededor de z: el frente sube.
        if (g) { if (a.vertical) g.rotation.z = a.angulo * 0.07; else g.rotation.y = a.angulo * 0.07 }
      }
      if (f.marcha) animarPatas(f.marcha, refs.perro, clock.elapsedTime)
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

  // Lo que leen los componentes de la protoboard en cada cuadro (LED, pulsador, perillas).
  const vivo = useMemo<CircuitoVivo>(() => ({
    estado: () => sim?.circuitoActual ?? null,
    perilla: inst => sim?.controles?.perillas[inst],
    boton: inst => !!sim?.controles?.botones[inst],
    presionar: sim?.presionar ? (inst, v) => sim.presionar!(inst, v) : undefined,
  }), [sim])

  const r = raiz(doc)
  return (
    <CircuitoVivoContexto.Provider value={vivo}>
      <group ref={grupo} onPointerMissed={() => { props.onSeleccionar?.(null); props.cableado?.onCable(null) }}>
        <Nodo {...props} inst={r} refs={refs} espaciadores={datos.espaciadores} porInstancia={porInstancia} />
        {cables && !props.explosion && <Cables doc={doc} cableado={props.cableado} />}
        {props.cableado && !props.explosion && <PinesCableado doc={doc} cableado={props.cableado} />}
        {props.posMarcadores && <ProyectarMarcadores doc={doc} marcadores={marcadores} destino={props.posMarcadores} raizRef={grupo} />}
      </group>
    </CircuitoVivoContexto.Provider>
  )
}
