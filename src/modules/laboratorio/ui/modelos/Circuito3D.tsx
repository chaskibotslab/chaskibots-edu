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
import { BASURERO, BISAGRA_BASURERO, CENTRO_CIRCUITO, PATAS_CIRCUITO, POSTE_SERVO, RESISTENCIAS, xColumna, zFila, Z_CABLE_PROTOBOARD } from '../../catalogo/piezas/circuito'
import { LUZ_INICIAL, PERILLA_INICIAL, type EstadoCircuito } from '../../engine/circuito'
import { useCalidad } from '../calidad'

const m = (v: number) => v / 1000
type V = [number, number, number]
const M = (...v: V): V => [m(v[0]), m(v[1]), m(v[2])]

const PASO = 2.54
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
    const x = xColumna(col)
    for (let i = 0; i < 5; i++) { hueco(x, -zFila(i)); hueco(x, zFila(i)) }
  }
  // Rieles de alimentación: grupos de 5 con un espacio.
  for (const lado of [-1, 1]) {
    for (let k = 0; k < 50; k++) {
      const x = xColumna(2 + k + Math.floor(k / 5))
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
  for (let col = 0; col < 63; col += 5) g.fillText(String(col + 1), X(xColumna(col)), Z(-15.6))
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
      <Pata x={-1.27} alto={3.5} /><Pata x={1.27} />
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
      {[-3.81, 3.81].flatMap(x => [-1.27, 1.27].map(z => <Pata key={`${x}${z}`} x={x} z={z} alto={1} />))}
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

// ---------------------------------------------------------------------------
// Maqueta del basurero (E2)
// ---------------------------------------------------------------------------

/** Basurero: paredes delgadas (se ve por dentro con la tapa abierta) y el poste del servo. */
export function Basurero() {
  const q = useCalidad()
  const { lado: L, alto: H } = BASURERO
  const e = 2.5
  const verde = <meshStandardMaterial color="#15803d" roughness={0.55} />
  return (
    <group>
      <mesh position={M(0, e / 2, 0)} receiveShadow>
        <boxGeometry args={[m(L), m(e), m(L)]} />
        {verde}
      </mesh>
      {([[L / 2 - e / 2, 0, e, L], [-L / 2 + e / 2, 0, e, L], [0, L / 2 - e / 2, L, e], [0, -L / 2 + e / 2, L, e]] as const).map(([x, z, a, b], i) => (
        <mesh key={i} position={M(x, H / 2, z)} castShadow={q.sombras} receiveShadow>
          <boxGeometry args={[m(a), m(H), m(b)]} />
          {verde}
        </mesh>
      ))}
      {/* Interior más oscuro y una bolsa de basura */}
      <mesh position={M(0, 30, 0)}>
        <boxGeometry args={[m(L - 2 * e - 1), m(50), m(L - 2 * e - 1)]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* Símbolo de reciclaje en el frente (tres flechas en triángulo) */}
      <group position={M(L / 2 + 0.2, 72, 0)} rotation={[0, Math.PI / 2, 0]}>
        {[0, 1, 2].map(i => (
          <mesh key={i} rotation={[0, 0, (i * 2 * Math.PI) / 3]} position={M(0, 0, 0)}>
            <ringGeometry args={[m(9), m(12), 16, 1, Math.PI / 6 + 0.25, (2 * Math.PI) / 3 - 0.5]} />
            <meshStandardMaterial color="#f0fdf4" side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      {/* Poste que sostiene el servo junto a la bisagra */}
      <mesh position={M(POSTE_SERVO.x, POSTE_SERVO.alto / 2, POSTE_SERVO.z)} castShadow={q.sombras}>
        <boxGeometry args={[m(10), m(POSTE_SERVO.alto), m(10)]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.6} />
      </mesh>
      {/* Bisagra (a lo largo del borde de atrás) */}
      <mesh position={M(0, H + 1.5, BISAGRA_BASURERO[2])} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[m(2), m(2), m(L), 12]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** Tapa (marco del eje del servo acostado; ver TAPA_BASURERO). */
export function TapaBasurero() {
  const q = useCalidad()
  const A = BASURERO.lado + 4
  return (
    <group>
      <mesh position={M(A / 2, A / 2, 1.5)} castShadow={q.sombras}>
        <boxGeometry args={[m(A), m(A), m(3)]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
      {/* Manija del lado de afuera, cerca del borde que se levanta */}
      <mesh position={M(A - 12, A / 2, -2.5)}>
        <boxGeometry args={[m(5), m(30), m(5)]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
    </group>
  )
}

const MODELOS_CIRCUITO = new Set(['proc:protoboard', 'proc:led', 'proc:led-rgb', 'proc:resistencia', 'proc:pulsador', 'proc:buzzer', 'proc:potenciometro', 'proc:ldr', 'proc:basurero', 'proc:tapa-basurero', 'proc:fuente-mb102', 'proc:portapilas-2aa'])
export const esModeloCircuito = (modelo: string) => MODELOS_CIRCUITO.has(modelo)

/** Dibuja cualquier componente del circuito según su modelo; null si no es de la protoboard. */
export function ModeloCircuito({ def, inst }: { def: PiezaDef; inst: string }) {
  const modelo = <ModeloCentrado def={def} inst={inst} />
  const centro = CENTRO_CIRCUITO[def.modelo]
  // Los de patas a medio paso se corren para que sus patas entren en los agujeros.
  return centro ? <group position={M(centro[0], 0, centro[1])}>{modelo}</group> : modelo
}

function ModeloCentrado({ def, inst }: { def: PiezaDef; inst: string }) {
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
    case 'proc:basurero': return <Basurero />
    case 'proc:tapa-basurero': return <TapaBasurero />
    case 'proc:fuente-mb102': return <FuenteMb102 inst={inst} />
    case 'proc:portapilas-2aa': return <PortapilasAA />
  }
  return null
}

// ---------------------------------------------------------------------------
// Fuentes de la mesa: MB102 en los rieles y portapilas de 2 AA
// ---------------------------------------------------------------------------

/** Patas de la MB102 (x, z en su marco): dos por riel, en los agujeros 48 y 49. */
const PATAS_MB102: [number, number][] = [0, PASO].flatMap(x => [-22.1, -19.6, 19.6, 22.1].map(z => [x, z] as [number, number]))

/** Fuente MB102: placa azul sobre patas largas, con conector de 9 V, USB, interruptor y LED verde. */
export function FuenteMb102({ inst }: { inst: string }) {
  const q = useCalidad()
  const vivo = useContext(CircuitoVivoContexto)
  const led = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(() => { if (led.current) led.current.emissiveIntensity = vivo.estado() ? 2.5 : 0 })
  const Y = 10 // cara de abajo de la placa
  return (
    <group>
      {PATAS_MB102.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={M(x, Y / 2, z)}>
          <boxGeometry args={[m(0.64), m(Y), m(0.64)]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* Separadores negros de los conectores */}
      {[-20.85, 20.85].map(z => (
        <mesh key={z} position={M(1.27, Y - 1.25, z)}>
          <boxGeometry args={[m(5.1), m(2.5), m(5.1)]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={M(0.5, Y + 0.8, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(33), m(1.6), m(53)]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
      </mesh>
      {/* Conector de 9 V (plug) y USB, del lado de afuera */}
      <mesh position={M(10, Y + 7, -12)} castShadow={q.sombras}>
        <boxGeometry args={[m(14), m(11), m(9)]} />
        <meshStandardMaterial color="#18181b" roughness={0.5} />
      </mesh>
      <mesh position={M(12, Y + 5.5, 10)}>
        <boxGeometry args={[m(14), m(7), m(13)]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Interruptor y reguladores */}
      <mesh position={M(-2, Y + 3.5, -14)}>
        <boxGeometry args={[m(6), m(4), m(10)]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      {[-4, 6].map(z => (
        <mesh key={z} position={M(-8, Y + 2.4, z)}>
          <boxGeometry args={[m(6.5), m(1.6), m(3.5)]} />
          <meshStandardMaterial color="#27272a" roughness={0.4} />
        </mesh>
      ))}
      {/* Puentes amarillos de 5 V / 3,3 V */}
      {[-17, 17].map(z => (
        <mesh key={z} position={M(-12, Y + 3.2, z)}>
          <boxGeometry args={[m(2.5), m(3.6), m(5)]} />
          <meshStandardMaterial color="#facc15" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={M(-1, Y + 2.1, 3)}>
        <boxGeometry args={[m(1.6), m(1), m(3)]} />
        <meshStandardMaterial ref={led} color="#14532d" emissive="#22c55e" emissiveIntensity={0} />
      </mesh>
    </group>
  )
}

/** Portapilas de dos AA, con las pilas a la vista. */
export function PortapilasAA() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 4, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(58), m(8), m(32)]} />
        <meshStandardMaterial color="#18181b" roughness={0.6} />
      </mesh>
      {[-7.5, 7.5].map((z, i) => (
        <group key={z} position={M(0, 8, z)} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[m(7), m(7), m(48), q.segmentos]} />
            <meshStandardMaterial color={i ? '#16a34a' : '#ca8a04'} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={M(0, i ? -24.5 : 24.5, 0)}>
            <cylinderGeometry args={[m(2.5), m(2.5), m(1.5), 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Dónde entra el cable de cada pin (al lado de su pata, en la misma tira de la protoboard). */
export function anclaCircuito(modelo: string, pin: string): V | null {
  if (modelo === 'proc:fuente-mb102') return pin === '+' ? [-12, 12, -10] : pin === '-' ? [-12, 12, -7.5] : null
  if (modelo === 'proc:portapilas-2aa') return pin === '+' ? [29, 6, -5] : pin === '-' ? [29, 6, 5] : null
  const pata = PATAS_CIRCUITO[modelo]?.find(p => p.pin === pin)
  return pata ? [pata.x, 0.3, Z_CABLE_PROTOBOARD] : null
}
