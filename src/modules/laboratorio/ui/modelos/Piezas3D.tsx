'use client'

// Modelos 3D de las piezas, generados por código con medidas reales (mm → m).
// Cada modelo se dibuja en el marco de su pieza (origen = ancla, ver
// catalogo/tipos.ts). Los materiales son PBR para que se vean realistas con
// la iluminación de estudio de la escena.

import { forwardRef, useMemo, type Ref } from 'react'
import { RoundedBox, useGLTF } from '@react-three/drei'
import type * as THREE from 'three'
import type { MaterialFisico } from '../../catalogo/tipos'
import { useCalidad } from '../calidad'
import { anclaCircuito } from './Circuito3D'
import { PLACA_PISO, SEPARADORES_PISO } from '../../catalogo/piezas/chasis'

const m = (v: number) => v / 1000
type V = [number, number, number]
const M = (...v: V): V => [m(v[0]), m(v[1]), m(v[2])]

// ---------------------------------------------------------------------------
// Materiales
// ---------------------------------------------------------------------------

export function MaterialChasis({ material, color }: { material: MaterialFisico; color: string }) {
  const q = useCalidad()
  if (material === 'acrilico') {
    return q.transmision
      ? <meshPhysicalMaterial color={color} transmission={0.85} roughness={0.08} thickness={m(3)} ior={1.49} clearcoat={1} transparent />
      : <meshStandardMaterial color={color} transparent opacity={0.55} roughness={0.1} />
  }
  if (material === 'aluminio') return <meshStandardMaterial color={color} metalness={0.92} roughness={0.32} />
  if (material === 'mdf') return <meshStandardMaterial color={color} roughness={0.92} />
  return <meshStandardMaterial color={color} roughness={0.55} />
}

const PCB_VERDE = '#0e7c6b'
const PCB_AZUL = '#1d4ed8'
const NEGRO = '#111214'
const METAL = '#c9ced6'

function Pines({ n, pos, horizontal = 'x', paso = 2.54 }: { n: number; pos: V; horizontal?: 'x' | 'z'; paso?: number }) {
  const largo = n * paso
  return (
    <group position={M(...pos)}>
      <mesh>
        <boxGeometry args={horizontal === 'x' ? [m(largo), m(2.5), m(2.5)] : [m(2.5), m(2.5), m(largo)]} />
        <meshStandardMaterial color={NEGRO} roughness={0.6} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const o = -largo / 2 + paso / 2 + i * paso
        return (
          <mesh key={i} position={M(horizontal === 'x' ? o : 0, 2.6, horizontal === 'z' ? o : 0)}>
            <boxGeometry args={[m(0.64), m(3), m(0.64)]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
          </mesh>
        )
      })}
    </group>
  )
}

function Separador({ pos, alto }: { pos: V; alto: number }) {
  return (
    <mesh position={M(pos[0], pos[1] + alto / 2, pos[2])}>
      <cylinderGeometry args={[m(1.8), m(1.8), m(alto), 6]} />
      <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Chasis
// ---------------------------------------------------------------------------

export function Chasis({ largo, ancho, material, color }: { largo: number; ancho: number; material: MaterialFisico; color: string }) {
  const q = useCalidad()
  const ranuras: V[] = []
  for (let x = -largo / 2 + 25; x < largo / 2 - 20; x += 22) ranuras.push([x, 0, -ancho / 2 + 14], [x, 0, ancho / 2 - 14])
  return (
    <group>
      <RoundedBox args={[m(largo), m(material === 'aluminio' ? 2 : 3), m(ancho)]} radius={m(1)} smoothness={2} castShadow={q.sombras} receiveShadow>
        <MaterialChasis material={material} color={color} />
      </RoundedBox>
      {/* Ranuras de montaje (decorativas) */}
      {ranuras.map((p, i) => (
        <mesh key={i} position={M(p[0], 1.6, p[2])} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[m(10), m(3)]} />
          <meshStandardMaterial color="#0b0d12" transparent opacity={material === 'acrilico' ? 0.35 : 0.7} />
        </mesh>
      ))}
      {/* Tornillos en las esquinas */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={M(sx * (largo / 2 - 6), 2, sz * (ancho / 2 - 6))}>
          <cylinderGeometry args={[m(2.6), m(2.6), m(1.4), 12]} />
          <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/** Chasis de minisumo: placa de 76 × 96 mm, pala de acero inclinada y laterales. */
export function ChasisMinisumo({ material, color }: { material: MaterialFisico; color: string }) {
  const q = useCalidad()
  const pala = (37 * Math.PI) / 180
  return (
    <group>
      <RoundedBox args={[m(76), m(3), m(96)]} radius={m(1)} smoothness={2} castShadow={q.sombras} receiveShadow>
        <MaterialChasis material={material} color={color} />
      </RoundedBox>
      {/* Pala de acero pulido con su filo */}
      <mesh position={M(48, -14.8, 0)} rotation={[0, 0, -pala]} castShadow={q.sombras} receiveShadow>
        <boxGeometry args={[m(30), m(1.5), m(96)]} />
        <meshStandardMaterial color="#d7dce3" metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh position={M(60, -23.9, 0)}>
        <boxGeometry args={[m(1.2), m(0.6), m(96)]} />
        <meshStandardMaterial color="#f1f5f9" metalness={1} roughness={0.08} />
      </mesh>
      {/* Laterales que sostienen la pala */}
      {[-47, 47].map(z => (
        <mesh key={z} position={M(40, -10, z)} castShadow={q.sombras}>
          <boxGeometry args={[m(14), m(14), m(2)]} />
          <MaterialChasis material={material} color={color} />
        </mesh>
      ))}
      {/* Tornillos */}
      {[[-32, -42], [-32, 42], [30, -42], [30, 42]].map(([x, z], i) => (
        <mesh key={i} position={M(x, 2, z)}>
          <cylinderGeometry args={[m(2.2), m(2.2), m(1.2), 12]} />
          <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Placas y electrónica
// ---------------------------------------------------------------------------

export const ArduinoUno = forwardRef(function ArduinoUno(_: object, refLed13: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  return (
    <group>
      {[[-30, -22], [-30, 22], [30, -22], [30, 22]].map(([x, z], i) => <Separador key={i} pos={[x, -10, z]} alto={10} />)}
      <mesh position={M(0, 0.8, 0)} castShadow={q.sombras} receiveShadow>
        <boxGeometry args={[m(68.6), m(1.6), m(53.4)]} />
        <meshStandardMaterial color="#00878f" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* USB-B y jack de alimentación (atrás) */}
      <mesh position={M(-28, 7, 12)} castShadow={q.sombras}>
        <boxGeometry args={[m(16), m(11), m(12)]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={M(-29, 6.5, -17)} castShadow={q.sombras}>
        <boxGeometry args={[m(14), m(11), m(9)]} />
        <meshStandardMaterial color={NEGRO} roughness={0.5} />
      </mesh>
      {/* ATmega328P (DIP-28) en zócalo */}
      <mesh position={M(12, 3.4, -6)} castShadow={q.sombras}>
        <boxGeometry args={[m(35), m(3.6), m(7.5)]} />
        <meshStandardMaterial color="#141414" roughness={0.35} />
      </mesh>
      {/* Cristal 16 MHz, regulador, condensadores */}
      <mesh position={M(-6, 2.6, -1)}>
        <boxGeometry args={[m(11), m(3), m(4.5)]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.95} roughness={0.15} />
      </mesh>
      {[[-14, -18], [-19, -18]].map(([x, z], i) => (
        <mesh key={i} position={M(x, 4.5, z)}>
          <cylinderGeometry args={[m(3), m(3), m(7), 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.35} />
        </mesh>
      ))}
      {/* Tiras de pines hembra */}
      <Pines n={10} pos={[5, 1.6, -24]} />
      <Pines n={8} pos={[23.6, 1.6, -24]} />
      <Pines n={6} pos={[26.8, 1.6, 23.6]} />
      <Pines n={8} pos={[8, 1.6, 23.6]} />
      {/* LED 13 y LED ON */}
      <mesh position={M(-2.3, 2, -14.1)}>
        <boxGeometry args={[m(3), m(1.2), m(1.6)]} />
        <meshStandardMaterial ref={refLed13} color="#78350f" emissive="#fb923c" emissiveIntensity={0} />
      </mesh>
      <mesh position={M(26, 2, 17)}>
        <boxGeometry args={[m(3), m(1.2), m(1.6)]} />
        <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
})

/** Pines del ESP32 DevKit V1 (30 pines) por lado, según su serigrafía. */
const ESP32_A = ['EN', 'GPIO36', 'GPIO39', 'GPIO34', 'GPIO35', 'GPIO32', 'GPIO33', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO14', 'GPIO12', 'GPIO13', 'GND', 'VIN']
const ESP32_B = ['GPIO23', 'GPIO22', 'GPIO1', 'GPIO3', 'GPIO21', 'GPIO19', 'GPIO18', 'GPIO5', 'GPIO17', 'GPIO16', 'GPIO4', 'GPIO2', 'GPIO15', 'GND2', '3V3']

/** Separadores de bronce bajo una placa (los modelos reales no los traen). */
export function SeparadoresPlaca({ largo, ancho }: { largo: number; ancho: number }) {
  const x = largo / 2 - 4, z = ancho / 2 - 4
  return <>{[[-x, -z], [-x, z], [x, -z], [x, z]].map(([px, pz], i) => <Separador key={i} pos={[px, -10, pz]} alto={10} />)}</>
}

/** Piso de arriba del minisumo: placa sobre cuatro separadores de latón (ver PISO_ARRIBA_MINISUMO). */
export function PisoArriba({ alto, color }: { alto: number; color: string }) {
  const q = useCalidad()
  return (
    <group>
      {SEPARADORES_PISO.map(([x, z], i) => <Separador key={i} pos={[x, 0, z]} alto={alto} />)}
      <RoundedBox args={[m(PLACA_PISO[0]), m(3), m(PLACA_PISO[1])]} radius={m(1)} position={M(0, alto + 1.5, 0)} castShadow={q.sombras} receiveShadow>
        <meshStandardMaterial color={color} roughness={0.55} />
      </RoundedBox>
    </group>
  )
}

/** Pines del Nano por lado (USB hacia −x), según su serigrafía. */
const NANO_ATRAS = ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'RST', 'GND', 'VIN']
const NANO_ADELANTE = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND', 'RST', 'D0', 'D1']

export const ArduinoNano = forwardRef(function ArduinoNano(_: object, refLed13: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  return (
    <group>
      {[[-19, -6], [-19, 6], [19, -6], [19, 6]].map(([x, z], i) => <Separador key={i} pos={[x, -10, z]} alto={10} />)}
      <mesh position={M(0, 0.8, 0)} castShadow={q.sombras} receiveShadow>
        <boxGeometry args={[m(45), m(1.6), m(18)]} />
        <meshStandardMaterial color="#1d4fb8" roughness={0.45} metalness={0.1} />
      </mesh>
      {/* Mini USB */}
      <mesh position={M(-21, 3.2, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(9), m(4), m(7.5)]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
      </mesh>
      {/* ATmega328P (TQFP) girado 45° */}
      <mesh position={M(4, 2.1, 0)} rotation={[0, Math.PI / 4, 0]} castShadow={q.sombras}>
        <boxGeometry args={[m(7), m(1.2), m(7)]} />
        <meshStandardMaterial color="#141414" roughness={0.35} />
      </mesh>
      <mesh position={M(-9, 2.4, -2)}>
        <boxGeometry args={[m(5), m(1.6), m(3)]} />
        <meshStandardMaterial color="#141414" roughness={0.4} />
      </mesh>
      <mesh position={M(13, 2.3, 3)}>
        <boxGeometry args={[m(5), m(1.4), m(2)]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Botón de reset */}
      <mesh position={M(-2, 2.6, -4.5)}>
        <boxGeometry args={[m(3.5), m(2), m(3.5)]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      {/* LED «L» (13) y LED de encendido */}
      <mesh position={M(-14, 1.9, 4)}>
        <boxGeometry args={[m(1.6), m(0.8), m(1)]} />
        <meshStandardMaterial ref={refLed13} color="#78350f" emissive="#fb923c" emissiveIntensity={0} />
      </mesh>
      <mesh position={M(-14, 1.9, 6)}>
        <boxGeometry args={[m(1.6), m(0.8), m(1)]} />
        <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={1.5} />
      </mesh>
      <Pines n={15} pos={[0, 1.6, -7.6]} />
      <Pines n={15} pos={[0, 1.6, 7.6]} />
    </group>
  )
})

export function L298N() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 0.8, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(43), m(1.6), m(43)]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.55} />
      </mesh>
      {/* Disipador de aluminio negro con aletas */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={M(-4, 13, -14 + i * 3.5)} castShadow={q.sombras}>
          <boxGeometry args={[m(23), m(23), m(1.2)]} />
          <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {/* Borneras azules con tornillos */}
      {[[3.5, -18, 0], [3.5, 18, 0], [-18.5, 0, 1]].map(([x, z, girada], i) => (
        <group key={i} position={M(x, 6, z)}>
          <mesh>
            <boxGeometry args={girada ? [m(7.5), m(10), m(16)] : [m(16), m(10), m(7.5)]} />
            <meshStandardMaterial color="#1e40af" roughness={0.45} />
          </mesh>
          {[-1, 0, 1].slice(girada ? 0 : 1).map(k => (
            <mesh key={k} position={M(girada ? 0 : k * 5 + 2.5, 5.2, girada ? k * 5 : 0)}>
              <cylinderGeometry args={[m(1.6), m(1.6), m(0.6), 10]} />
              <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Pines de control ENA IN1 IN2 IN3 IN4 ENB */}
      <Pines n={6} pos={[19, 1.6, 0]} horizontal="z" />
      {/* Puentes (jumpers) de ENA/ENB */}
      {[-6.35, 6.35].map(z => (
        <mesh key={z} position={M(19, 6, z)}>
          <boxGeometry args={[m(2.6), m(4), m(5)]} />
          <meshStandardMaterial color={NEGRO} />
        </mesh>
      ))}
    </group>
  )
}

export function Bateria18650() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 4, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(77), m(8), m(41)]} />
        <meshStandardMaterial color={NEGRO} roughness={0.7} />
      </mesh>
      {[-9.5, 9.5].map(z => (
        <group key={z} position={M(0, 11, z)}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow={q.sombras}>
            <cylinderGeometry args={[m(9), m(9), m(65), q.segmentos]} />
            <meshPhysicalMaterial color="#2563eb" roughness={0.3} clearcoat={0.8} />
          </mesh>
          <mesh position={M(33, 0, 0)} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[m(4), m(4), m(1.5), 16]} />
            <meshStandardMaterial color={METAL} metalness={0.95} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {[-36, 36].map(x => (
        <mesh key={x} position={M(x, 11, 0)}>
          <boxGeometry args={[m(5), m(14), m(41)]} />
          <meshStandardMaterial color={NEGRO} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function BateriaLipo() {
  const q = useCalidad()
  return (
    <group>
      <RoundedBox args={[m(40), m(12), m(18)]} radius={m(1.5)} position={M(0, 6, 0)} castShadow={q.sombras}>
        <meshPhysicalMaterial color="#1e3a8a" roughness={0.35} clearcoat={0.6} />
      </RoundedBox>
      {/* Etiqueta */}
      <mesh position={M(0, 12.05, 0)} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[m(30), m(12)]} />
        <meshStandardMaterial color="#facc15" roughness={0.6} />
      </mesh>
      {/* Cables rojo y negro */}
      {[[-3, '#dc2626'], [3, NEGRO]].map(([z, c]) => (
        <mesh key={z as number} position={M(-23, 6, z as number)} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[m(1), m(1), m(8), 8]} />
          <meshStandardMaterial color={c as string} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Bateria9V() {
  const q = useCalidad()
  return (
    <group>
      <RoundedBox args={[m(48.5), m(17.5), m(26.5)]} radius={m(2)} position={M(0, 8.75, 0)} castShadow={q.sombras}>
        <meshStandardMaterial color="#1f2937" roughness={0.45} metalness={0.2} />
      </RoundedBox>
      <mesh position={M(-6, 8.75, 0)}>
        <boxGeometry args={[m(20), m(17.7), m(26.7)]} />
        <meshStandardMaterial color="#c2410c" roughness={0.4} metalness={0.3} />
      </mesh>
      {[-5, 5].map(z => (
        <mesh key={z} position={M(25, 8.75, z)} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[m(3), m(3), m(3), 6]} />
          <meshStandardMaterial color={METAL} metalness={0.95} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Movimiento
// ---------------------------------------------------------------------------

export function MotorTT() {
  const q = useCalidad()
  return (
    <group>
      {/* Caja reductora amarilla */}
      <RoundedBox args={[m(46), m(22), m(19)]} radius={m(1.5)} position={M(-8, 0, 0)} castShadow={q.sombras}>
        <meshStandardMaterial color="#facc15" roughness={0.45} />
      </RoundedBox>
      {/* Motor metálico */}
      <mesh position={M(-39, 0, 0)} rotation={[0, 0, Math.PI / 2]} castShadow={q.sombras}>
        <cylinderGeometry args={[m(9.5), m(9.5), m(20), q.segmentos]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={M(-49.5, 0, 0)} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[m(5), m(5), m(1.5), 16]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.6} />
      </mesh>
      {/* Eje doble D hacia la rueda */}
      <mesh position={M(0, 0, 13)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m(2.7), m(2.7), m(12), 12]} />
        <meshStandardMaterial color="#fde68a" roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Micromotor N20: reductora dorada + motor plateado hacia −z, eje hacia +z. */
export function MotorN20() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 0, -4.5)} castShadow={q.sombras}>
        <boxGeometry args={[m(12), m(10), m(9)]} />
        <meshStandardMaterial color="#d4a72c" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={M(0, 0, -16.5)} rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}>
        <cylinderGeometry args={[m(5.6), m(5.6), m(15), q.segmentos]} />
        <meshStandardMaterial color={METAL} metalness={0.92} roughness={0.22} />
      </mesh>
      <mesh position={M(0, 0, -24.5)}>
        <boxGeometry args={[m(9), m(7), m(1.5)]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      <mesh position={M(0, 0, 4)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m(1.5), m(1.5), m(8), 10]} />
        <meshStandardMaterial color={METAL} metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function Rueda({ radio, ancho, material, color }: { radio: number; ancho: number; material: MaterialFisico; color?: string }) {
  const q = useCalidad()
  const goma = material === 'goma'
  const rin = radio * (goma ? 0.66 : 0.92)
  const tacos = goma ? Math.round(radio * 0.9) : 0
  return (
    <group>
      {goma && (
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}>
          <cylinderGeometry args={[m(radio), m(radio), m(ancho), q.segmentos * 2]} />
          <meshStandardMaterial color="#1b1b1d" roughness={0.95} />
        </mesh>
      )}
      {/* Dibujo de la llanta */}
      {Array.from({ length: tacos }, (_, i) => {
        const a = (i / tacos) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * m(radio), Math.sin(a) * m(radio), 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[m(1.2), m(3), m(ancho * 0.9)]} />
            <meshStandardMaterial color="#141416" roughness={1} />
          </mesh>
        )
      })}
      {/* Rin con rayos */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={!goma && q.sombras}>
        <cylinderGeometry args={[m(rin), m(rin), m(ancho + (goma ? 0.6 : 0)), q.segmentos]} />
        <meshStandardMaterial color={goma ? '#facc15' : color ?? '#facc15'} roughness={0.45} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={M(0, 0, ancho / 2 + 0.4)}>
          <boxGeometry args={[m(rin * 1.8), m(4), m(1.5)]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={M(0, 0, ancho / 2 + 1)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m(5), m(5), m(2), 16]} />
        <meshStandardMaterial color="#a16207" roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Rueda loca colgada: +y local apunta al piso (el montaje la gira 180°). */
export function RuedaLoca({ espaciador, radio }: { espaciador: number; radio: number }) {
  const q = useCalidad()
  return (
    <group>
      {espaciador > 0.5 && [-7, 7].map(x => <Separador key={x} pos={[x, 0, 0]} alto={espaciador} />)}
      <mesh position={M(0, espaciador + 1, 0)}>
        <boxGeometry args={[m(24), m(2), m(14)]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={M(0, espaciador + radio * 0.9, 0)}>
        <cylinderGeometry args={[m(radio + 1.5), m(radio + 2.5), m(radio * 1.2), 20]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={M(0, espaciador + radio + 1, 0)} castShadow={q.sombras}>
        <sphereGeometry args={[m(radio), q.segmentos, q.segmentos / 2]} />
        <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.08} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Servo (el brazo/horn lo dibuja Robot3D dentro del grupo que gira)
// ---------------------------------------------------------------------------

export function Servo({ color }: { color: string }) {
  const q = useCalidad()
  return (
    <group>
      <RoundedBox args={[m(23), m(22.7), m(12.2)]} radius={m(1)} position={M(0, 11.35, 0)} castShadow={q.sombras}>
        <meshPhysicalMaterial color={color} roughness={0.35} transmission={0} clearcoat={0.4} />
      </RoundedBox>
      {/* Orejas de montaje */}
      <mesh position={M(0, 16, 0)}>
        <boxGeometry args={[m(32.5), m(2.5), m(12.2)]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Torre del eje */}
      <mesh position={M(6, 24, 0)}>
        <cylinderGeometry args={[m(5.8), m(5.8), m(3), 20]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={M(6, 26.5, 0)}>
        <cylinderGeometry args={[m(2.4), m(2.4), m(2.5), 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* Cable marrón-rojo-naranja */}
      {['#7c2d12', '#dc2626', '#f97316'].map((c, i) => (
        <mesh key={c} position={M(-13, 4, -1.2 + i * 1.2)} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[m(0.6), m(0.6), m(6), 6]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Brazo blanco del servo (gira con el eje). */
export function HornServo() {
  return (
    <group position={M(0, -0.5, 0)}>
      <mesh>
        <cylinderGeometry args={[m(3.5), m(3.5), m(1.5), 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.45} />
      </mesh>
      <mesh position={M(0, 0, 0)}>
        <boxGeometry args={[m(32), m(1.5), m(5)]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.45} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Sensores
// ---------------------------------------------------------------------------

export const TCRT5000 = forwardRef(function TCRT5000({ alturaSoporte }: { alturaSoporte: number }, refLed: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  return (
    <group>
      {/* Componente TCRT5000 mirando al piso */}
      <mesh position={M(0, 3.5, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(6), m(7), m(10)]} />
        <meshStandardMaterial color={NEGRO} roughness={0.4} />
      </mesh>
      <mesh position={M(0, 0.4, -2.5)}>
        <cylinderGeometry args={[m(1.8), m(1.8), m(0.8), 12]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={M(0, 0.4, 2.5)}>
        <cylinderGeometry args={[m(1.8), m(1.8), m(0.8), 12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
      </mesh>
      {/* Placa azul del módulo */}
      <mesh position={M(-12, 7.8, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(32), m(1.6), m(13)]} />
        <meshStandardMaterial color={PCB_AZUL} roughness={0.55} />
      </mesh>
      <mesh position={M(-14, 10.6, 0)}>
        <boxGeometry args={[m(6), m(4), m(6)]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>
      {/* LED indicador: se enciende cuando ve blanco (DO en LOW) */}
      <mesh position={M(-6, 9, 4)}>
        <boxGeometry args={[m(2), m(1.2), m(1.6)]} />
        <meshStandardMaterial ref={refLed} color="#7f1d1d" emissive="#ef4444" emissiveIntensity={0} />
      </mesh>
      <Pines n={4} pos={[-26, 8.6, 0]} horizontal="z" />
      {/* Soporte acrílico hasta el chasis */}
      <mesh position={M(-20, 8.6 + alturaSoporte / 2, 0)}>
        <boxGeometry args={[m(3), m(alturaSoporte), m(12)]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Zona del piso que lee el sensor */}
      <mesh position={M(0, -12.5, 0)} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[m(3.5), 20]} />
        <meshBasicMaterial color="#ff2d2d" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
})

export const FC51 = forwardRef(function FC51(_: object, refLed: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(15.5, 1.6, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(31), m(1.6), m(14)]} />
        <meshStandardMaterial color={PCB_AZUL} roughness={0.55} />
      </mesh>
      {/* Emisor IR (transparente) y receptor (oscuro) */}
      <mesh position={M(30, 4.5, -3)} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[m(2.5), m(2.5), m(6), 16]} />
        <meshPhysicalMaterial color="#e0f2fe" transmission={0.6} roughness={0.1} />
      </mesh>
      <mesh position={M(30, 4.5, 3)} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[m(2.5), m(2.5), m(6), 16]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={M(18, 4, 0)}>
        <boxGeometry args={[m(6), m(4.5), m(6)]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>
      <mesh position={M(10, 2.8, 4.5)}>
        <boxGeometry args={[m(2), m(1.2), m(1.6)]} />
        <meshStandardMaterial ref={refLed} color="#14532d" emissive="#22c55e" emissiveIntensity={0} />
      </mesh>
      <Pines n={3} pos={[2, 1.6, 0]} horizontal="z" />
    </group>
  )
})

export function HCSR04() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0.8, 10, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(1.6), m(20), m(45)]} />
        <meshStandardMaterial color={PCB_AZUL} roughness={0.55} />
      </mesh>
      {[-13, 13].map(z => (
        <group key={z} position={M(1.6, 10, z)}>
          <mesh position={M(6, 0, 0)} rotation={[0, 0, Math.PI / 2]} castShadow={q.sombras}>
            <cylinderGeometry args={[m(8), m(8), m(12), q.segmentos]} />
            <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.28} />
          </mesh>
          <mesh position={M(12.05, 0, 0)} rotation={[0, 0, -Math.PI / 2]}>
            <circleGeometry args={[m(6.8), q.segmentos]} />
            <meshStandardMaterial color="#1f2937" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={M(2.6, 17, 0)}>
        <boxGeometry args={[m(2), m(3), m(9)]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.2} />
      </mesh>
      <Pines n={4} pos={[-1.5, 2, 0]} horizontal="z" />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Puntos de conexión de cada pin (mm, marco de la pieza) para dibujar cables
// ---------------------------------------------------------------------------

// Medidas tomadas de la serigrafía de los modelos reales (public/lab/modelos):
// en el UNO los pines digitales van por el borde de atrás (−z) y POWER/ANALOG
// por el de adelante (+z), con el USB hacia −x, como en la placa real.
export function anclaPin(modelo: string, pin: string): V | null {
  const d = /^D(\d+)$/.exec(pin)
  const a = /^A(\d)$/.exec(pin)
  switch (modelo) {
    case 'proc:arduino-uno':
      if (d) { const n = Number(d[1]); return [n >= 8 ? -1 + (13 - n) * 2.54 : 14.8 + (7 - n) * 2.54, 9, -24] }
      if (a) return [20.4 + Number(a[1]) * 2.54, 9, 23.6]
      return ({ '3V3': [5.4, 9, 23.6], '5V': [7.9, 9, 23.6], GND: [10.5, 9, 23.6], VIN: [15.4, 9, 23.6] } as Record<string, V>)[pin] ?? null
    case 'proc:esp32': {
      const a = ESP32_A.indexOf(pin), b = ESP32_B.indexOf(pin)
      if (a >= 0) return [-17.8 + a * 2.54, 5, -11.4]
      if (b >= 0) return [-17.8 + b * 2.54, 5, 11.4]
      return null
    }
    case 'proc:arduino-nano': {
      const a = NANO_ATRAS.indexOf(pin), b = NANO_ADELANTE.indexOf(pin)
      if (a >= 0) return [-17.8 + a * 2.54, 5, -7.6]
      if (b >= 0) return [-17.8 + b * 2.54, 5, 7.6]
      return null
    }
    case 'proc:l298n': {
      const i = ['ENA', 'IN1', 'IN2', 'IN3', 'IN4', 'ENB'].indexOf(pin)
      if (i >= 0) return [1.9 + i * 2.55, 7, 19.6]
      return ({ OUT1: [-19.7, 9, 4.4], OUT2: [-19.7, 9, 8.7], OUT3: [19.4, 9, 8.4], OUT4: [19.4, 9, 3.6], '12V': [-14, 10, 17.9], GND: [-8.2, 10, 17.9], '5V': [-2.4, 10, 17.9] } as Record<string, V>)[pin] ?? null
    }
    case 'proc:tb6612': {
      // Dos filas de 8 pines (como el módulo de SparkFun).
      const f1 = ['VM', 'VCC', 'GND', 'AO1', 'AO2', 'BO2', 'BO1', 'GND2']
      const f2 = ['PWMA', 'AIN2', 'AIN1', 'STBY', 'BIN1', 'BIN2', 'PWMB', 'GND3']
      const i1 = f1.indexOf(pin), i2 = f2.indexOf(pin)
      if (i1 >= 0) return [-8.9 + i1 * 2.54, 3, -8.9]
      if (i2 >= 0) return [-8.9 + i2 * 2.54, 3, 8.9]
      return null
    }
    case 'proc:bateria-18650': return pin === '+' ? [-38, 12, -6] : [-38, 12, 6]
    case 'proc:bateria-9v': return pin === '+' ? [26, 9, -5] : [26, 9, 5]
    case 'proc:motor-tt': return pin === 'M+' ? [-50, 4, 0] : [-50, -4, 0]
    case 'proc:motor-n20': return pin === 'M+' ? [2.5, 0, -25] : [-2.5, 0, -25]
    case 'proc:bateria-lipo': return pin === '+' ? [-26, 6, -3] : [-26, 6, 3]
    case 'proc:servo': return [31, 2, pin === 'GND' ? -1.2 : pin === 'V+' ? 0 : 1.2]
    case 'proc:tcrt5000': {
      const i = ['VCC', 'GND', 'DO', 'AO'].indexOf(pin)
      return i >= 0 ? [-26, 12, -3.8 + i * 2.54] : null
    }
    case 'proc:fc51': {
      const i = ['VCC', 'GND', 'OUT'].indexOf(pin)
      return i >= 0 ? [2, 5, -2.54 + i * 2.54] : null
    }
    case 'proc:hcsr04': {
      const i = ['VCC', 'TRIG', 'ECHO', 'GND'].indexOf(pin)
      return i >= 0 ? [-3, 3, 4.1 - i * 2.5] : null
    }
  }
  return anclaCircuito(modelo, pin)
}

/** Hacia dónde sale el cable de cada pin (marco de la pieza) y cómo se conecta. */
/** 'macho': la punta de un jumper pinchada en la protoboard (conector corto). */
export interface SalidaPin { dir: V; tipo: 'dupont' | 'macho' | 'borne' | 'soldado' }

export function salidaPin(modelo: string, pin: string): SalidaPin {
  switch (modelo) {
    case 'proc:l298n':
      if (/^OUT[12]$/.test(pin)) return { dir: [-1, 0.25, 0], tipo: 'borne' }
      if (/^OUT[34]$/.test(pin)) return { dir: [1, 0.25, 0], tipo: 'borne' }
      if (pin === '12V' || pin === 'GND' || pin === '5V') return { dir: [0, 0.25, 1], tipo: 'borne' }
      return { dir: [0, 1, 0], tipo: 'dupont' }
    case 'proc:motor-tt': return { dir: [-1, 0, 0], tipo: 'soldado' }
    case 'proc:motor-n20': return { dir: [0, 0, -1], tipo: 'soldado' }
    case 'proc:bateria-lipo': return { dir: [-1, 0.2, 0], tipo: 'soldado' }
    case 'proc:bateria-18650': return { dir: [-1, 0.3, 0], tipo: 'soldado' }
    case 'proc:bateria-9v': return { dir: [1, 0.3, 0], tipo: 'soldado' }
    case 'proc:portapilas-2aa': return { dir: [1, 0.3, 0], tipo: 'soldado' }
    case 'proc:fuente-mb102': return { dir: [0, 1, 0], tipo: 'dupont' }
    case 'proc:servo': return { dir: [1, 0, 0], tipo: 'dupont' }
    case 'proc:fc51': return { dir: [-1, 0, 0], tipo: 'dupont' }
    case 'proc:hcsr04': return { dir: [-1, 0, 0], tipo: 'dupont' }
  }
  if (anclaCircuito(modelo, pin)) return { dir: [0, 1, 0], tipo: 'macho' }
  return { dir: [0, 1, 0], tipo: 'dupont' }
}

// ---------------------------------------------------------------------------
// Modelo real (GLB)
// ---------------------------------------------------------------------------

/** Modelo 3D real ya preparado (metros, marco de la pieza). Comprimido con meshopt. */
export function ModeloGlb({ url, escala = 1 }: { url: string; escala?: number }) {
  const q = useCalidad()
  const { scene } = useGLTF(url, false, true)
  const copia = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) { m.castShadow = q.sombras; m.receiveShadow = true }
    })
    return c
  }, [scene, q.sombras])
  return <primitive object={copia} scale={escala} />
}

/** LED «L» (pin 13) sobre el modelo real del UNO: se enciende con el programa. */
export const LedUno = forwardRef(function LedUno(_: object, ref: Ref<THREE.MeshStandardMaterial>) {
  return (
    <mesh position={M(-2.3, 1.9, -14.1)}>
      <boxGeometry args={[m(2.2), m(0.8), m(1.4)]} />
      <meshStandardMaterial ref={ref} color="#78350f" emissive="#fb923c" emissiveIntensity={0} transparent opacity={0.9} />
    </mesh>
  )
})
