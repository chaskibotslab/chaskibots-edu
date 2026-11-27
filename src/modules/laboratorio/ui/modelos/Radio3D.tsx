'use client'

// Módulos inalámbricos (HC-05, HC-06, HC-12) con sus medidas reales, en mm.
// Origen: centro de la base; la tira de pines queda del lado −x.

import { useCalidad } from '../calidad'

type V = [number, number, number]
const m = (v: number) => v / 1000
const M = (...v: V): V => [m(v[0]), m(v[1]), m(v[2])]

/** Posición de cada pin (mm, marco de la pieza). */
export function anclaRadio(modelo: string, pin: string): V | null {
  if (modelo !== 'proc:hc05' && modelo !== 'proc:hc06' && modelo !== 'proc:hc12') return null
  const i = ['VCC', 'GND', 'TXD', 'RXD'].indexOf(pin)
  if (i < 0) return null
  return [modelo === 'proc:hc12' ? -12.5 : -17.2, 2.2, (i - 1.5) * 2.54]
}
export const esModeloRadio = (modelo: string) => modelo === 'proc:hc05' || modelo === 'proc:hc06' || modelo === 'proc:hc12'

function TiraPines({ x, n = 4 }: { x: number; n?: number }) {
  return (
    <group>
      <mesh position={M(x + 2, 2.6, 0)}>
        <boxGeometry args={[m(2.5), m(2.5), m(n * 2.54)]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={M(x - 2.2, 2.6, (i - (n - 1) / 2) * 2.54)}>
          <boxGeometry args={[m(6), m(0.64), m(0.64)]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/** HC-05 / HC-06: placa azul de adaptación con el módulo Bluetooth encima y su antena en zigzag. */
export function ModuloBluetooth({ hc06 = false }: { hc06?: boolean }) {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 0.8, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(37.3), m(1.6), m(15.5)]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
      </mesh>
      {/* Módulo (26,9 × 13 mm) */}
      <mesh position={M(4.5, 2.1, 0)}>
        <boxGeometry args={[m(26.9), m(1), m(13)]} />
        <meshStandardMaterial color={hc06 ? '#166534' : '#1e3a8a'} roughness={0.5} />
      </mesh>
      {/* Blindaje metálico del chip */}
      <mesh position={M(0.5, 3.4, 0)}>
        <boxGeometry args={[m(11), m(1.6), m(10)]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Antena impresa en zigzag */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={M(12 + i * 1.8, 2.65, i % 2 ? 1.5 : -1.5)}>
          <boxGeometry args={[m(0.7), m(0.1), m(8)]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* LED de estado */}
      <mesh position={M(-9.5, 2, 5)}>
        <boxGeometry args={[m(1.6), m(0.8), m(0.8)]} />
        <meshStandardMaterial color="#fecaca" emissive="#ef4444" emissiveIntensity={0.9} />
      </mesh>
      <TiraPines x={-17.2} n={hc06 ? 4 : 6} />
    </group>
  )
}

/** HC-12: placa verde con blindaje y antena de resorte. */
export function ModuloHC12() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 0.6, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(27.8), m(1.2), m(14.4)]} />
        <meshStandardMaterial color="#15803d" roughness={0.55} />
      </mesh>
      <mesh position={M(-1, 2.2, 0)}>
        <boxGeometry args={[m(13), m(2), m(11)]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Antena de resorte: anillos apilados */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={M(11, 2.4 + i * 2.1, 4)} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[m(2.2), m(0.35), 6, 14]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      <TiraPines x={-12.5} n={5} />
    </group>
  )
}
