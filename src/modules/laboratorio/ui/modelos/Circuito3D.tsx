'use client'

// Modelos 3D de la mesa de electrónica: protoboard y componentes, con medidas
// reales (mm → m). Cada componente lee el estado del circuito en cada cuadro
// (contexto CircuitoVivo): los LED brillan con la corriente que les llega, el
// buzzer muestra ondas cuando suena, el pulsador baja al presionarlo (se le
// puede hacer clic) y la perilla del potenciómetro gira.

import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { PiezaDef } from '../../catalogo/tipos'
import { RESISTENCIAS } from '../../catalogo/piezas/circuito'
import { LUZ_INICIAL, PERILLA_INICIAL, type EstadoCircuito } from '../../engine/circuito'
import { useCalidad } from '../calidad'

const m = (v: number) => v / 1000
type V = [number, number, number]
const M = (...v: V): V => [m(v[0]), m(v[1]), m(v[2])]

const PASO = 2.54
/** Los cables entran en la misma tira de 5 huecos, 2 huecos hacia afuera de la pata. */
const Z_CABLE = -2 * PASO
const PATA = '#cbd5e1'

// ---------------------------------------------------------------------------
// Estado en vivo (lo da la simulación; en el taller no hay)
// ---------------------------------------------------------------------------

export interface CircuitoVivo {
  estado: () => EstadoCircuito | null
  perilla: (inst: string) => number | undefined
  boton: (inst: string) => boolean
  presionar?: (inst: string, presionado: boolean) => void
}

const SIN_VIDA: CircuitoVivo = { estado: () => null, perilla: () => undefined, boton: () => false }
export const CircuitoVivoContexto = createContext<CircuitoVivo>(SIN_VIDA)

// ---------------------------------------------------------------------------
// Protoboard
// ---------------------------------------------------------------------------

/** Cara de arriba de una protoboard de 830 puntos, dibujada en un canvas (5 px por mm). */
function texturaProtoboard(): THREE.CanvasTexture {
  const E = 6, L = 165, A = 55
  const c = document.createElement('canvas')
  c.width = L * E; c.height = A * E
  const g = c.getContext('2d')!
  g.fillStyle = '#f5f5f1'
  g.fillRect(0, 0, c.width, c.height)
  const X = (x: number) => (x + L / 2) * E
  const Z = (z: number) => (z + A / 2) * E
  const hueco = (x: number, z: number) => {
    g.fillStyle = '#3f3f46'
    g.fillRect(X(x) - 0.55 * E, Z(z) - 0.55 * E, 1.1 * E, 1.1 * E)
    g.fillStyle = '#18181b'
    g.fillRect(X(x) - 0.35 * E, Z(z) - 0.35 * E, 0.7 * E, 0.7 * E)
  }
  // Canaleta central.
  g.fillStyle = '#e4e4de'
  g.fillRect(0, Z(-1.6), c.width, 3.2 * E)
  // Tiras de 5 huecos a cada lado de la canaleta (63 columnas).
  for (let col = 0; col < 63; col++) {
    const x = -78.7 + col * PASO
    for (let i = 0; i < 5; i++) { hueco(x, -3.81 - i * PASO); hueco(x, 3.81 + i * PASO) }
  }
  // Rieles de alimentación: grupos de 5 con un espacio.
  for (const lado of [-1, 1]) {
    for (let k = 0; k < 50; k++) {
      const x = -74 + (k + Math.floor(k / 5)) * PASO
      hueco(x, lado * 19.6); hueco(x, lado * 22.1)
    }
    // Línea roja (+) por fuera y azul (−) por dentro, como en la protoboard real.
    g.fillStyle = '#dc2626'; g.fillRect(X(-78), Z(lado * 24.6) - 0.3 * E, 156 * E, 0.6 * E)
    g.fillStyle = '#2563eb'; g.fillRect(X(-78), Z(lado * 17.2) - 0.3 * E, 156 * E, 0.6 * E)
  }
  // Números de columna cada 5.
  g.fillStyle = '#71717a'
  g.font = `${1.6 * E}px sans-serif`
  g.textAlign = 'center'
  for (let col = 0; col < 63; col += 5) g.fillText(String(col + 1), X(-78.7 + col * PASO), Z(-15.6))
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export function Protoboard() {
  const q = useCalidad()
  const textura = useMemo(() => texturaProtoboard(), [])
  return (
    <group>
      <mesh position={M(0, 4.25, 0)} castShadow={q.sombras} receiveShadow>
        <boxGeometry args={[m(165), m(8.5), m(55)]} />
        <meshStandardMaterial color="#efefe9" roughness={0.75} />
      </mesh>
      <mesh position={M(0, 8.52, 0)} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[m(165), m(55)]} />
        <meshStandardMaterial map={textura} roughness={0.7} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Componentes
// ---------------------------------------------------------------------------

function Pata({ x, z = 0, alto = 3 }: { x: number; z?: number; alto?: number }) {
  return (
    <mesh position={M(x, alto / 2, z)}>
      <cylinderGeometry args={[m(0.25), m(0.25), m(alto), 6]} />
      <meshStandardMaterial color={PATA} metalness={0.9} roughness={0.3} />
    </mesh>
  )
}

/** Cuerpo de un LED de 5 mm (cápsula de epoxi con la punta redonda). */
function CapsulaLed({ color, material }: { color: string; material: ReactNode }) {
  const q = useCalidad()
  return (
    <group position={M(0, 3, 0)}>
      <mesh position={M(0, 0.5, 0)}>
        <cylinderGeometry args={[m(2.9), m(2.9), m(1), q.segmentos]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} roughness={0.25} />
      </mesh>
      <mesh position={M(0, 3.6, 0)} castShadow={q.sombras}>
        <cylinderGeometry args={[m(2.5), m(2.5), m(5.2), q.segmentos]} />
        {material}
      </mesh>
      <mesh position={M(0, 6.2, 0)}>
        <sphereGeometry args={[m(2.5), q.segmentos, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {material}
      </mesh>
    </group>
  )
}

export function Led({ inst, color }: { inst: string; color: string }) {
  const vivo = useContext(CircuitoVivoContexto)
  const q = useCalidad()
  const mat = useRef<THREE.MeshPhysicalMaterial>(null)
  const luz = useRef<THREE.PointLight>(null)
  const base = useMemo(() => new THREE.Color(color), [color])
  useFrame(() => {
    const e = vivo.estado()
    const b = e?.leds[inst]?.[0] ?? 0
    const quemado = !!e?.quemados.includes(inst)
    if (mat.current) {
      mat.current.emissiveIntensity = b * 3.2
      mat.current.color.copy(quemado ? new THREE.Color('#3f2a1d') : base)
    }
    if (luz.current) luz.current.intensity = b * 0.05
  })
  const material = <meshPhysicalMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0} transparent opacity={0.9} roughness={0.15} clearcoat={1} />
  return (
    <group>
      <Pata x={-1.27} /><Pata x={1.27} alto={3.5} />
      <CapsulaLed color={color} material={material} />
      {q.nivel !== 'baja' && <pointLight ref={luz} color={color} intensity={0} distance={0.09} decay={2} position={M(0, 10, 0)} />}
    </group>
  )
}

export function LedRgb({ inst }: { inst: string }) {
  const vivo = useContext(CircuitoVivoContexto)
  const q = useCalidad()
  const mat = useRef<THREE.MeshPhysicalMaterial>(null)
  const luz = useRef<THREE.PointLight>(null)
  const c = useMemo(() => new THREE.Color(), [])
  useFrame(() => {
    const [r = 0, g = 0, b = 0] = vivo.estado()?.leds[inst] ?? []
    const max = Math.max(r, g, b)
    c.setRGB(r, g, b)
    if (mat.current) { mat.current.emissive.copy(c); mat.current.emissiveIntensity = max > 0.01 ? 3 : 0 }
    if (luz.current) { luz.current.color.copy(c); luz.current.intensity = max * 0.05 }
  })
  const material = <meshPhysicalMaterial ref={mat} color="#f1f5f9" emissive="#000" transparent opacity={0.92} roughness={0.35} />
  return (
    <group>
      {[-3.81, -1.27, 1.27, 3.81].map((x, i) => <Pata key={x} x={x} alto={i === 1 ? 3.5 : 3} />)}
      <CapsulaLed color="#e2e8f0" material={material} />
      {q.nivel !== 'baja' && <pointLight ref={luz} intensity={0} distance={0.09} decay={2} position={M(0, 10, 0)} />}
    </group>
  )
}

export function Resistencia({ ohm }: { ohm: number }) {
  const q = useCalidad()
  const bandas = RESISTENCIAS.find(r => r.ohm === ohm)?.bandas ?? ['#7c2d12', '#111111', '#dc2626']
  const L = 2 * PASO // media distancia entre patas (4 huecos)
  return (
    <group>
      {[-L, L].map(x => <Pata key={x} x={x} alto={3.2} />)}
      {/* Alambre horizontal hasta el cuerpo */}
      <mesh position={M(0, 3.2, 0)} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[m(0.25), m(0.25), m(2 * L), 6]} />
        <meshStandardMaterial color={PATA} metalness={0.9} roughness={0.3} />
      </mesh>
      <group position={M(0, 3.2, 0)} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow={q.sombras}>
          <capsuleGeometry args={[m(1.15), m(4.2), 4, q.segmentos]} />
          <meshStandardMaterial color="#d9c393" roughness={0.6} />
        </mesh>
        {[...bandas, '#c9a227'].map((b, i) => (
          <mesh key={i} position={M(0, -2 + i * 1.1 + (i === 3 ? 0.6 : 0), 0)}>
            <cylinderGeometry args={[m(1.2), m(1.2), m(0.55), q.segmentos]} />
            <meshStandardMaterial color={b} roughness={0.5} metalness={i === 3 ? 0.6 : 0} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Pulsador({ inst }: { inst: string }) {
  const vivo = useContext(CircuitoVivoContexto)
  const q = useCalidad()
  const tapa = useRef<THREE.Group>(null)
  useFrame(() => {
    if (tapa.current) tapa.current.position.y = m(vivo.boton(inst) ? 3.6 : 4.4)
  })
  const interactivo = !!vivo.presionar
  const bajar = (e: ThreeEvent<PointerEvent>) => {
    if (!vivo.presionar) return
    e.stopPropagation()
    ;(e.target as Element | null)?.setPointerCapture?.(e.pointerId)
    vivo.presionar(inst, true)
  }
  const subir = (e: ThreeEvent<PointerEvent>) => { if (vivo.presionar) { e.stopPropagation(); vivo.presionar(inst, false) } }
  return (
    <group
      onPointerDown={bajar} onPointerUp={subir} onPointerLeave={subir}
      onPointerOver={() => { if (interactivo) document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = '' }}
    >
      {[-3.25, 3.25].flatMap(x => [-2.25, 2.25].map(z => <Pata key={`${x}${z}`} x={x} z={z} alto={1} />))}
      <mesh position={M(0, 2.2, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(6), m(3.4), m(6)]} />
        <meshStandardMaterial color="#1c1c1f" roughness={0.6} />
      </mesh>
      <mesh position={M(0, 3.95, 0)}>
        <boxGeometry args={[m(6.1), m(0.3), m(6.1)]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.85} roughness={0.35} />
      </mesh>
      <group ref={tapa} position={M(0, 4.4, 0)}>
        <mesh>
          <cylinderGeometry args={[m(1.9), m(1.9), m(1.8), q.segmentos]} />
          <meshStandardMaterial color="#dc2626" roughness={0.45} />
        </mesh>
      </group>
      {/* Zona de clic más grande que el botón (cómoda en celular). */}
      {interactivo && (
        <mesh position={M(0, 4, 0)} visible={false}>
          <boxGeometry args={[m(12), m(9), m(12)]} />
          <meshBasicMaterial />
        </mesh>
      )}
    </group>
  )
}

export function Buzzer({ inst, activo }: { inst: string; activo: boolean }) {
  const vivo = useContext(CircuitoVivoContexto)
  const q = useCalidad()
  const ondas = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = ondas.current
    if (!g) return
    const suena = !!vivo.estado()?.sonidos.some(s => s.inst === inst)
    g.visible = suena
    if (!suena) return
    g.children.forEach((o, i) => {
      const f = (clock.elapsedTime * 1.6 + i / 3) % 1
      o.scale.setScalar(1 + f * 2.2)
      ;((o as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - f)
    })
  })
  return (
    <group>
      <Pata x={-3.81} /><Pata x={3.81} />
      <mesh position={M(0, 5.75, 0)} castShadow={q.sombras}>
        <cylinderGeometry args={[m(6), m(6), m(9.5), q.segmentos]} />
        <meshStandardMaterial color="#141416" roughness={0.35} />
      </mesh>
      <mesh position={M(0, 10.52, 0)} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[m(0.9), m(5.6), q.segmentos]} />
        <meshStandardMaterial color={activo ? '#e5e7eb' : '#202024'} roughness={activo ? 0.8 : 0.5} />
      </mesh>
      <mesh position={M(-3.6, 10.55, -3.2)} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[m(1.6), m(0.4)]} />
        <meshBasicMaterial color="#e4e4e7" />
      </mesh>
      <group ref={ondas} position={M(0, 11, 0)} visible={false}>
        {[0, 1, 2].map(i => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[m(6), m(6.6), q.segmentos]} />
            <meshBasicMaterial color="#a5b4fc" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Potenciometro({ inst }: { inst: string }) {
  const vivo = useContext(CircuitoVivoContexto)
  const q = useCalidad()
  const perilla = useRef<THREE.Group>(null)
  useFrame(() => {
    // 300° de giro: de −150° (0) a +150° (1).
    if (perilla.current) perilla.current.rotation.y = -((vivo.perilla(inst) ?? PERILLA_INICIAL) - 0.5) * (300 * Math.PI / 180)
  })
  return (
    <group>
      {[-PASO * 2, 0, PASO * 2].map(x => <Pata key={x} x={x} alto={2} />)}
      <mesh position={M(0, 3.5, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(11), m(4), m(10)]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.45} />
      </mesh>
      <mesh position={M(0, 6, 0)}>
        <cylinderGeometry args={[m(3.6), m(3.6), m(1), q.segmentos]} />
        <meshStandardMaterial color={'#c9ced6'} metalness={0.85} roughness={0.3} />
      </mesh>
      <group ref={perilla} position={M(0, 6.5, 0)}>
        <mesh position={M(0, 3.5, 0)} castShadow={q.sombras}>
          <cylinderGeometry args={[m(3.2), m(3.4), m(7), q.segmentos]} />
          <meshStandardMaterial color="#18181b" roughness={0.5} />
        </mesh>
        <mesh position={M(0, 7.05, -1.7)}>
          <boxGeometry args={[m(0.8), m(0.2), m(3)]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      </group>
    </group>
  )
}

export function Ldr({ inst }: { inst: string }) {
  const vivo = useContext(CircuitoVivoContexto)
  const q = useCalidad()
  const halo = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(() => {
    // Un brillo cálido encima indica cuánta luz recibe.
    if (halo.current) halo.current.opacity = 0.35 * (vivo.perilla(inst) ?? LUZ_INICIAL)
  })
  return (
    <group>
      <Pata x={-PASO} alto={5} /><Pata x={PASO} alto={5} />
      <mesh position={M(0, 5.8, 0)} castShadow={q.sombras}>
        <cylinderGeometry args={[m(2.6), m(2.6), m(1.6), q.segmentos]} />
        <meshStandardMaterial color="#c2410c" roughness={0.4} />
      </mesh>
      {/* Pista en zigzag del sensor */}
      {[-1.4, -0.7, 0, 0.7, 1.4].map((z, i) => (
        <mesh key={i} position={M(0, 6.62, z)}>
          <boxGeometry args={[m(3.4 - Math.abs(z)), m(0.05), m(0.25)]} />
          <meshStandardMaterial color="#451a03" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={M(0, 6.7, 0)} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[m(6), 24]} />
        <meshBasicMaterial ref={halo} color="#fde68a" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

const MODELOS_CIRCUITO = new Set(['proc:protoboard', 'proc:led', 'proc:led-rgb', 'proc:resistencia', 'proc:pulsador', 'proc:buzzer', 'proc:potenciometro', 'proc:ldr'])
export const esModeloCircuito = (modelo: string) => MODELOS_CIRCUITO.has(modelo)

/** Dibuja cualquier componente del circuito según su modelo; null si no es de la protoboard. */
export function ModeloCircuito({ def, inst }: { def: PiezaDef; inst: string }) {
  const c = def.comportamiento
  switch (def.modelo) {
    case 'proc:protoboard': return <Protoboard />
    case 'proc:led': return <Led inst={inst} color={c.tipo === 'led' ? c.color : '#ef4444'} />
    case 'proc:led-rgb': return <LedRgb inst={inst} />
    case 'proc:resistencia': return <Resistencia ohm={c.tipo === 'resistencia' ? c.ohm : 330} />
    case 'proc:pulsador': return <Pulsador inst={inst} />
    case 'proc:buzzer': return <Buzzer inst={inst} activo={c.tipo === 'buzzer' && c.activo} />
    case 'proc:potenciometro': return <Potenciometro inst={inst} />
    case 'proc:ldr': return <Ldr inst={inst} />
  }
  return null
}

/** Dónde entra el cable de cada pin (al lado de su pata, en la misma tira de la protoboard). */
export function anclaCircuito(modelo: string, pin: string): V | null {
  const x = (lista: string[], xs: number[]) => { const i = lista.indexOf(pin); return i >= 0 ? xs[i] : null }
  let px: number | null = null
  switch (modelo) {
    case 'proc:led': px = x(['A', 'K'], [-1.27, 1.27]); break
    case 'proc:led-rgb': px = x(['R', 'K', 'G', 'B'], [-3.81, -1.27, 1.27, 3.81]); break
    case 'proc:resistencia': px = x(['1', '2'], [-2 * PASO, 2 * PASO]); break
    case 'proc:pulsador': px = x(['1', '2'], [-3.81, 3.81]); break
    case 'proc:buzzer': px = x(['+', '-'], [-3.81, 3.81]); break
    case 'proc:potenciometro': px = x(['1', 'W', '2'], [-2 * PASO, 0, 2 * PASO]); break
    case 'proc:ldr': px = x(['1', '2'], [-PASO, PASO]); break
    default: return null
  }
  return px === null ? null : [px, 0.3, Z_CABLE]
}
