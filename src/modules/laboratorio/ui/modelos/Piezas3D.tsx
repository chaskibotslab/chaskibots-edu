'use client'

// Modelos 3D de las piezas, generados por código con medidas reales (mm → m).
// Cada modelo se dibuja en el marco de su pieza (origen = ancla, ver
// catalogo/tipos.ts). Los materiales son PBR para que se vean realistas con
// la iluminación de estudio de la escena.

import { forwardRef, useMemo, type Ref } from 'react'
import { RoundedBox, useGLTF } from '@react-three/drei'
import { agujerosAligerado, agujerosChasis, PlacaRecortada, type Agujero } from './Placa3D'
import { NANO_ADELANTE, NANO_ATRAS, PICO_1_20, PICO_40_21 } from './Modulos3D'

export { ArduinoNano, Pico, TCRT5000, Bateria18650 } from './Modulos3D'
import type * as THREE from 'three'
import type { MaterialFisico } from '../../catalogo/tipos'
import { useCalidad } from '../calidad'
import { anclaCircuito } from './Circuito3D'
import { anclaComputadora } from './Computadoras3D'
import { PLACA_PISO, SEPARADORES_PISO } from '../../catalogo/piezas/chasis'
import { CUNA, HORQUILLAS_DISCO, HORQUILLAS_TAMBOR, PATINES_DISCO, PLACA_COMBATE } from '../../catalogo/piezas/combate'

export { RaspberryPi4, JetsonNano } from './Computadoras3D'

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
  const dosRuedas = largo < 180
  const agujeros = useMemo(
    () => agujerosChasis(largo, ancho, dosRuedas ? [5] : [60, -60], dosRuedas ? -65 : null, dosRuedas ? -23 : 0),
    [largo, ancho, dosRuedas],
  )
  const espesor = material === 'aluminio' ? 2 : 3
  return (
    <group>
      <PlacaRecortada largo={largo} ancho={ancho} espesor={espesor} radio={10} agujeros={agujeros} castShadow={q.sombras}>
        <MaterialChasis material={material} color={color} />
      </PlacaRecortada>
      {/* Tornillos M3 con tuerca en las esquinas */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <group key={i} position={M(sx * (largo / 2 - 7), 0, sz * (ancho / 2 - 7))}>
          <mesh position={M(0, espesor / 2 + 0.9, 0)}>
            <cylinderGeometry args={[m(2.7), m(2.7), m(1.8), 16]} />
            <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={M(0, -espesor / 2 - 1.2, 0)}>
            <cylinderGeometry args={[m(3.1), m(3.1), m(2.4), 6]} />
            <meshStandardMaterial color="#b8bec6" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Ranuras de los motores N20 y agujeros de los separadores del piso de arriba. */
const AGUJEROS_MINISUMO: Agujero[] = [
  ...SEPARADORES_PISO.map(([x, z]) => ({ x, z, d: 3.2 })),
  { x: -30, z: -30, lx: 3.2, lz: 10 }, { x: -30, z: 30, lx: 3.2, lz: 10 },
  { x: 10, z: -30, lx: 3.2, lz: 10 }, { x: 10, z: 30, lx: 3.2, lz: 10 },
  { x: -10, z: 0, lx: 14, lz: 3.2 }, { x: 20, z: 0, lx: 14, lz: 3.2 },
]

/** Chasis de minisumo: placa de 76 × 96 mm, pala de acero inclinada y laterales. */
export function ChasisMinisumo({ material, color }: { material: MaterialFisico; color: string }) {
  const q = useCalidad()
  const pala = (37 * Math.PI) / 180
  return (
    <group>
      <PlacaRecortada largo={76} ancho={96} radio={6} agujeros={AGUJEROS_MINISUMO} castShadow={q.sombras}>
        <MaterialChasis material={material} color={color} />
      </PlacaRecortada>
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

/** Chasis de battlebot: placa de 220 × 120 mm, cuña de acero al frente y rieles laterales. */
export function ChasisBattlebot({ material, color }: { material: MaterialFisico; color: string }) {
  const q = useCalidad()
  const ang = (CUNA.grados * Math.PI) / 180
  return (
    <group>
      <RoundedBox args={[m(220), m(3), m(120)]} radius={m(1.2)} smoothness={2} castShadow={q.sombras} receiveShadow>
        <MaterialChasis material={material} color={color} />
      </RoundedBox>
      {/* Cuña de acero con su filo */}
      <mesh position={M(CUNA.x, CUNA.y, 0)} rotation={[0, 0, -ang]} castShadow={q.sombras} receiveShadow>
        <boxGeometry args={[m(CUNA.largo), m(1.5), m(CUNA.ancho)]} />
        <meshStandardMaterial color="#d8dde3" metalness={0.55} roughness={0.32} />
      </mesh>
      {/* Rieles laterales que sostienen la cuña */}
      {[-58, 58].map(z => (
        <mesh key={z} position={M(108, -12, z)} castShadow={q.sombras}>
          <boxGeometry args={[m(18), m(20), m(3)]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* Franjas de advertencia en la placa */}
      {[-104, 104].map(x => (
        <mesh key={x} position={M(x, 1.6, 0)} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[m(8), m(116)]} />
          <meshStandardMaterial color="#facc15" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Arma giratoria: poste, motor sin escobillas y la barra de acero (la barra gira con `refGiro`). */
export const ArmaGiratoria = forwardRef(function ArmaGiratoria({ radio, alto }: { radio: number; alto: number }, refGiro: Ref<THREE.Group>) {
  const q = useCalidad()
  return (
    <group>
      {/* Poste de aluminio */}
      <mesh position={M(0, (alto - 14) / 2, 0)} castShadow={q.sombras}>
        <cylinderGeometry args={[m(9), m(11), m(alto - 14), 20]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Motor sin escobillas (campana) */}
      <mesh position={M(0, alto - 8, 0)} castShadow={q.sombras}>
        <cylinderGeometry args={[m(14), m(14), m(12), 24]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.35} />
      </mesh>
      <group ref={refGiro} position={M(0, alto, 0)}>
        {/* Barra de acero con dientes en las puntas */}
        <mesh castShadow={q.sombras}>
          <boxGeometry args={[m(radio * 2), m(6), m(20)]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.55} roughness={0.3} />
        </mesh>
        {[-1, 1].map(s => (
          <mesh key={s} position={M(s * (radio - 6), 0, s * 8)} castShadow={q.sombras}>
            <boxGeometry args={[m(12), m(8), m(8)]} />
            <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={M(0, 4, 0)}>
          <cylinderGeometry args={[m(6), m(6), m(3), 16]} />
          <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    </group>
  )
})

// ---------------------------------------------------------------------------
// Robots de combate de verdad (beetle): chasis blindados, motores, ruedas y armas
// ---------------------------------------------------------------------------

const ACERO = '#9aa3ad'
const PAVONADO = '#2b2f36'

function Tornillos({ puntos, y }: { puntos: [number, number][]; y: number }) {
  return (
    <>
      {puntos.map(([x, z], i) => (
        <mesh key={i} position={M(x, y, z)}>
          <cylinderGeometry args={[m(2.6), m(2.6), m(1.4), 6]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </>
  )
}

/** Placa del chasis blindado: biselada, con franjas de advertencia atrás y tornillos. */
function PlacaBlindada({ cajas, material, color }: { cajas: { medidas: V; centro: V }[]; material: MaterialFisico; color: string }) {
  const q = useCalidad()
  return (
    <>
      {cajas.map((c, i) => (
        <PlacaRecortada key={i} largo={c.medidas[0]} ancho={c.medidas[2]} espesor={c.medidas[1]} radio={6} position={M(...c.centro)} castShadow={q.sombras}
          agujeros={c.medidas[0] > 60 ? agujerosAligerado(c.medidas[0], c.medidas[2]) : []}>
          <MaterialChasis material={material} color={color} />
        </PlacaRecortada>
      ))}
    </>
  )
}

/** Horquillas de acero con su perforación de alivio. */
function Horquillas({ horquillas }: { horquillas: { medidas: V; centro: V }[] }) {
  const q = useCalidad()
  return (
    <>
      {horquillas.map((h, i) => (
        <group key={i} position={M(...h.centro)}>
          <RoundedBox args={M(...h.medidas)} radius={m(1.2)} smoothness={2} castShadow={q.sombras} receiveShadow>
            <meshStandardMaterial color={ACERO} metalness={0.6} roughness={0.35} />
          </RoundedBox>
          <mesh position={M(-h.medidas[0] * 0.18, 0, h.centro[2] > 0 ? h.medidas[2] / 2 + 0.1 : -h.medidas[2] / 2 - 0.1)} rotation={[0, h.centro[2] > 0 ? 0 : Math.PI, 0]}>
            <circleGeometry args={[m(Math.min(h.medidas[1], h.medidas[0]) * 0.22), 20]} />
            <meshStandardMaterial color={PAVONADO} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </>
  )
}

export function ChasisTambor({ material, color }: { material: MaterialFisico; color: string }) {
  return (
    <group>
      <PlacaBlindada material={material} color={color} cajas={[{ medidas: [PLACA_COMBATE.largo, 4, PLACA_COMBATE.ancho], centro: [PLACA_COMBATE.centroX, 0, 0] }]} />
      <Horquillas horquillas={HORQUILLAS_TAMBOR} />
      {/* Barra que une las horquillas por arriba (rigidez) */}
      <mesh position={M(52, 4, 0)} castShadow>
        <boxGeometry args={[m(10), m(6), m(122)]} />
        <meshStandardMaterial color={ACERO} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={M(-86, 2.2, 0)} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[m(6), m(104)]} />
        <meshStandardMaterial color="#facc15" roughness={0.6} />
      </mesh>
      <Tornillos y={2.4} puntos={[[-80, -48], [-80, 48], [40, -48], [40, 48], [-20, -48], [-20, 48]]} />
    </group>
  )
}

export function ChasisDisco({ material, color }: { material: MaterialFisico; color: string }) {
  return (
    <group>
      <PlacaBlindada material={material} color={color} cajas={[
        { medidas: [88, 4, PLACA_COMBATE.ancho], centro: [-44, 0, 0] },
        { medidas: [48, 4, 47], centro: [24, 0, -31.5] },
        { medidas: [48, 4, 47], centro: [24, 0, 31.5] },
      ]} />
      <Horquillas horquillas={HORQUILLAS_DISCO} />
      <Horquillas horquillas={PATINES_DISCO} />
      <mesh position={M(-86, 2.2, 0)} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[m(6), m(104)]} />
        <meshStandardMaterial color="#facc15" roughness={0.6} />
      </mesh>
      <Tornillos y={2.4} puntos={[[-80, -48], [-80, 48], [40, -48], [40, 48], [-10, -48], [-10, 48]]} />
    </group>
  )
}

/** Motor de 22 mm: lata negra, reductora plateada y el eje hacia +z. */
export function MotorCombate() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 0, -26)} rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}>
        <cylinderGeometry args={[m(11), m(11), m(28), 24]} />
        <meshStandardMaterial color="#1f2328" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={M(0, 0, -6)} rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}>
        <cylinderGeometry args={[m(11), m(11), m(12), 24]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={M(0, 0, 3)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m(2.5), m(2.5), m(6), 12]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  )
}

/** Rueda de combate: espuma negra maciza y cubo de aluminio con 6 agujeros. */
export function RuedaCombate({ radio, ancho }: { radio: number; ancho: number }) {
  const q = useCalidad()
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow={q.sombras} receiveShadow>
        <cylinderGeometry args={[m(radio), m(radio), m(ancho), 40]} />
        <meshStandardMaterial color="#14161a" roughness={0.95} />
      </mesh>
      {[-1, 1].map(s => (
        <group key={s} position={M(0, (s * ancho) / 2, 0)}>
          <mesh position={M(0, s * 0.3, 0)}>
            <cylinderGeometry args={[m(radio * 0.55), m(radio * 0.55), m(0.8), 32]} />
            <meshStandardMaterial color="#c3c9d1" metalness={0.85} roughness={0.25} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={M(Math.cos((i * Math.PI) / 3) * radio * 0.33, s * 0.8, Math.sin((i * Math.PI) / 3) * radio * 0.33)}>
              <cylinderGeometry args={[m(radio * 0.07), m(radio * 0.07), m(0.4), 10]} />
              <meshStandardMaterial color="#3a3f47" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Tambor de acero con dos hileras de dientes; gira con `refGiro` alrededor de z. */
export const ArmaTambor = forwardRef(function ArmaTambor({ radio, ancho }: { radio: number; ancho: number }, refGiro: Ref<THREE.Group>) {
  const q = useCalidad()
  return (
    <group>
      {/* Eje que atraviesa las horquillas */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m(5), m(5), m(ancho + 18), 12]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.2} />
      </mesh>
      <group ref={refGiro}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}>
          <cylinderGeometry args={[m(radio), m(radio), m(ancho), 36]} />
          <meshStandardMaterial color="#2a2e35" metalness={0.75} roughness={0.32} />
        </mesh>
        {/* Dientes: dos hileras opuestas, desfasadas */}
        {[0, Math.PI].map((a, k) => [-ancho * 0.25, ancho * 0.25].map((z, j) => (
          <mesh key={`${k}-${j}`} position={M(Math.cos(a) * (radio + 3), Math.sin(a) * (radio + 3), z * (k ? -1 : 1))} rotation={[0, 0, a]} castShadow={q.sombras}>
            <boxGeometry args={[m(10), m(9), m(ancho * 0.32)]} />
            <meshStandardMaterial color="#d9dee5" metalness={0.8} roughness={0.25} />
          </mesh>
        )))}
        {[-1, 1].map(s => (
          <mesh key={s} position={M(0, 0, s * (ancho / 2 + 0.2))} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <ringGeometry args={[m(radio * 0.35), m(radio * 0.9), 32]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
})

/** Disco vertical de acero con dos dientes; gira con `refGiro` alrededor de z. */
export const ArmaDisco = forwardRef(function ArmaDisco({ radio, ancho }: { radio: number; ancho: number }, refGiro: Ref<THREE.Group>) {
  const q = useCalidad()
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m(5), m(5), m(30), 12]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Motor sin escobillas al costado del eje */}
      <mesh position={M(0, 0, -16)} rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}>
        <cylinderGeometry args={[m(12), m(12), m(10), 24]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.35} />
      </mesh>
      <group ref={refGiro}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}>
          <cylinderGeometry args={[m(radio), m(radio), m(ancho), 48]} />
          <meshStandardMaterial color="#b8c0ca" metalness={0.8} roughness={0.28} />
        </mesh>
        {[0, Math.PI].map(a => (
          <mesh key={a} position={M(Math.cos(a) * (radio + 2), Math.sin(a) * (radio + 2), 0)} rotation={[0, 0, a + 0.4]} castShadow={q.sombras}>
            <boxGeometry args={[m(14), m(10), m(ancho + 2)]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        {[-1, 1].map(s => (
          <mesh key={s} position={M(0, 0, s * (ancho / 2 + 0.2))} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <ringGeometry args={[m(radio * 0.25), m(radio * 0.45), 32]} />
            <meshStandardMaterial color={PAVONADO} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
})

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

const AGUJEROS_PISO_ARRIBA: Agujero[] = [
  ...SEPARADORES_PISO.map(([x, z]) => ({ x, z, d: 3.2 })),
  ...[-20, -10, 0, 10, 20].flatMap(z => [{ x: -12, z, d: 3.2 }, { x: 0, z, d: 3.2 }, { x: 12, z, d: 3.2 }]),
]

/** Piso de arriba del minisumo: placa sobre cuatro separadores de latón (ver PISO_ARRIBA_MINISUMO). */
export function PisoArriba({ alto, color }: { alto: number; color: string }) {
  const q = useCalidad()
  return (
    <group>
      {SEPARADORES_PISO.map(([x, z], i) => <Separador key={i} pos={[x, 0, z]} alto={alto} />)}
      <PlacaRecortada largo={PLACA_PISO[0]} ancho={PLACA_PISO[1]} radio={5} position={M(0, alto + 1.5, 0)} castShadow={q.sombras}
        agujeros={AGUJEROS_PISO_ARRIBA}>
        <meshStandardMaterial color={color} roughness={0.55} />
      </PlacaRecortada>
      {SEPARADORES_PISO.map(([x, z], i) => (
        <mesh key={`t${i}`} position={M(x, alto + 3.8, z)}>
          <cylinderGeometry args={[m(2.6), m(2.6), m(1.6), 16]} />
          <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/** Joystick KY-023 hecho por código (respaldo del modelo real): placa, base y palanca. */
export function Joystick() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(0, 0.8, -2)} castShadow={q.sombras}>
        <boxGeometry args={[m(26), m(1.6), m(34)]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      <mesh position={M(0, 7, -4)} castShadow={q.sombras}>
        <boxGeometry args={[m(16), m(11), m(16)]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
      </mesh>
      <mesh position={M(0, 16, -4)} castShadow={q.sombras}>
        <cylinderGeometry args={[m(9), m(10), m(5), q.segmentos]} />
        <meshStandardMaterial color="#27272a" roughness={0.6} />
      </mesh>
      <Pines n={5} pos={[0, 1.6, 15.5]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Arduino Mega 2560 (largo a lo largo de z, USB hacia −z)
// ---------------------------------------------------------------------------

/** Pines del Mega por borde, como en su serigrafía (z de la primera de cada grupo). */
const MEGA_ATRAS: [number, string[]][] = [
  [-24, ['D13', 'D12', 'D11', 'D10', 'D9', 'D8']],
  [-7.4, ['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0']],
  [14, ['D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20', 'D21']],
]
const MEGA_ADELANTE: [number, string[]][] = [
  [-22, ['3V3', '5V', 'GND', 'GND2', 'VIN']],
  [-6, ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']],
  [15, ['A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15']],
]

function anclaMega(pin: string): V | null {
  for (const [z0, lista] of MEGA_ATRAS) { const i = lista.indexOf(pin); if (i >= 0) return [-24.1, 9, z0 + i * 2.54] }
  for (const [z0, lista] of MEGA_ADELANTE) { const i = lista.indexOf(pin); if (i >= 0) return [24.1, 9, z0 + i * 2.54] }
  // Doble fila del extremo: D22–D53 (pares en una fila, impares en la otra).
  const d = /^D(\d+)$/.exec(pin)
  if (d && Number(d[1]) >= 22) { const k = Number(d[1]) - 22; return [-19 + Math.floor(k / 2) * 2.54, 9, k % 2 ? 47.6 : 45.1] }
  return null
}

export const ArduinoMega = forwardRef(function ArduinoMega(_: object, refLed13: Ref<THREE.MeshStandardMaterial>) {
  const q = useCalidad()
  return (
    <group>
      <SeparadoresPlaca largo={53.3} ancho={101.6} />
      <mesh position={M(0, 0.8, 0)} castShadow={q.sombras} receiveShadow>
        <boxGeometry args={[m(53.3), m(1.6), m(101.6)]} />
        <meshStandardMaterial color="#0f6aa8" roughness={0.45} metalness={0.1} />
      </mesh>
      {/* USB-B y conector de alimentación en el extremo −z */}
      <mesh position={M(-14, 7, -46)} castShadow={q.sombras}>
        <boxGeometry args={[m(12), m(11), m(16)]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={M(16, 6.5, -46)} castShadow={q.sombras}>
        <boxGeometry args={[m(9), m(11), m(14)]} />
        <meshStandardMaterial color={NEGRO} roughness={0.5} />
      </mesh>
      {/* ATmega2560 (TQFP de 100 patas) girado 45° */}
      <mesh position={M(4, 2.2, 6)} rotation={[0, Math.PI / 4, 0]} castShadow={q.sombras}>
        <boxGeometry args={[m(14), m(1.2), m(14)]} />
        <meshStandardMaterial color="#141414" roughness={0.35} />
      </mesh>
      <mesh position={M(-6, 2.2, -30)}>
        <boxGeometry args={[m(6), m(1.2), m(6)]} />
        <meshStandardMaterial color="#141414" roughness={0.35} />
      </mesh>
      {/* Cristal y botón de reset */}
      <mesh position={M(12, 2.3, -24)}>
        <boxGeometry args={[m(2.2), m(1.4), m(5)]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={M(-18, 2.6, -36)}>
        <boxGeometry args={[m(4), m(2), m(4)]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      {/* Conectores hembra por los bordes y la doble fila del extremo */}
      {MEGA_ATRAS.map(([z0, l]) => <Pines key={z0} n={l.length} pos={[-24.1, 1.6, z0 + (l.length - 1) * 1.27]} horizontal="z" />)}
      {MEGA_ADELANTE.map(([z0, l]) => <Pines key={z0} n={l.length} pos={[24.1, 1.6, z0 + (l.length - 1) * 1.27]} horizontal="z" />)}
      <Pines n={16} pos={[-19 + 7.5 * 2.54, 1.6, 45.1]} />
      <Pines n={16} pos={[-19 + 7.5 * 2.54, 1.6, 47.6]} />
      <mesh position={M(-18, 1.9, -12)}>
        <boxGeometry args={[m(1.6), m(0.8), m(3)]} />
        <meshStandardMaterial ref={refLed13} color="#78350f" emissive="#fb923c" emissiveIntensity={0} />
      </mesh>
      <mesh position={M(18, 1.9, -30)}>
        <boxGeometry args={[m(1.6), m(0.8), m(3)]} />
        <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
})

// ---------------------------------------------------------------------------
// Raspberry Pi Pico (USB hacia −x)
// ---------------------------------------------------------------------------


/** Radio del pie de goma del perro (mm): el centro del pie queda a esta altura del piso. */
export const RADIO_PIE = 11

/** Los tres giros de una pata del perro: abducción (afuera/adentro), muslo y rodilla. */
export interface PataPerro {
  abd: THREE.Group | null; muslo: THREE.Group | null; rodilla: THREE.Group | null
  /** Largo de cada tramo del modelo que se ve (m), si no es el de la física. */
  tramo?: number
}

/**
 * Cinemática inversa de una pata de dos tramos iguales (`l` m): ángulos del
 * muslo y de la rodilla (rad, giro alrededor de z: + lleva el pie adelante)
 * para que el pie quede `x` adelante y `y` abajo de la cadera. La rodilla
 * apunta hacia atrás, como en el Unitree Go2.
 */
export function ikPata(x: number, y: number, l: number): [number, number] {
  const d = Math.min(2 * l * 0.995, Math.max(0.02, Math.hypot(x, y)))
  const a = Math.acos(d / (2 * l))
  const b = Math.atan2(x, y)
  return [b - a, 2 * a]
}

/**
 * Perro robot cuadrúpedo: cuerpo de aluminio con la cabeza (visor y sensor de
 * profundidad abajo), y cuatro patas con el motor de la cadera, el muslo y la
 * pierna con su pie de goma. Las patas se arman en grupos que Robot3D gira en
 * cada cuadro (`patas`) según la postura y el trote.
 */
export function PerroRobot({ caderas, muslo, pierna, color, patas }: { caderas: V[]; muslo: number; pierna: number; color: string; patas: PataPerro[] }) {
  const q = useCalidad()
  // Parado (cadera a 160 mm del piso), hasta que Robot3D las mueva.
  const [m0, r0] = ikPata(0, 0.16 - RADIO_PIE / 1000, muslo / 1000)
  // React engancha primero las refs de los hijos (rodilla, muslo) y después la de la cadera.
  const pata = (i: number) => (patas[i] ??= { abd: null, muslo: null, rodilla: null })
  return (
    <group>
      <RoundedBox args={M(300, 70, 110)} position={M(0, 35, 0)} radius={m(14)} smoothness={3} castShadow={q.sombras} receiveShadow>
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.38} />
      </RoundedBox>
      {/* Franja oscura del lomo y la tapa de la batería */}
      <mesh position={M(0, 70.6, 0)} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[m(250), m(70)]} /><meshStandardMaterial color="#1f2328" roughness={0.6} /></mesh>
      <mesh position={M(-120, 36, 55.6)}><boxGeometry args={[m(40), m(30), m(1)]} /><meshStandardMaterial color="#1f2328" roughness={0.5} /></mesh>
      {/* Panel de conexiones del lomo: red (RJ45 hacia arriba) y bornes de 5 V */}
      <mesh position={M(-88, 70.8, -40)}><boxGeometry args={[m(30), m(1.6), m(15)]} /><meshStandardMaterial color="#15181c" roughness={0.6} /></mesh>
      <mesh position={M(-95, 71.4, -40)}><boxGeometry args={[m(11), m(1), m(10)]} /><meshStandardMaterial color="#050607" roughness={0.8} /></mesh>
      <mesh position={M(-80, 72, -40)}><boxGeometry args={[m(6), m(2.4), m(10)]} /><meshStandardMaterial color="#1d4ed8" roughness={0.5} /></mesh>
      {/* Cabeza: visor negro brillante y el sensor de profundidad abajo */}
      <RoundedBox args={M(60, 55, 70)} position={M(170, 55, 0)} radius={m(12)} smoothness={3} castShadow={q.sombras}>
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.38} />
      </RoundedBox>
      <RoundedBox args={M(8, 30, 56)} position={M(198, 62, 0)} radius={m(4)} smoothness={2}>
        <meshStandardMaterial color="#05070a" metalness={0.3} roughness={0.08} />
      </RoundedBox>
      {[-14, 14].map(z => (
        <mesh key={z} position={M(202.5, 64, z)}><boxGeometry args={[m(0.5), m(4), m(10)]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.4} /></mesh>
      ))}
      <mesh position={M(192, 28, 0)}><sphereGeometry args={[m(13), 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color="#0b0d10" metalness={0.4} roughness={0.2} /></mesh>
      {caderas.map(([x, y, z], i) => (
        <group key={i} position={M(x, y, z)} ref={g => { pata(i).abd = g }}>
          {/* Motor de la cadera */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow={q.sombras}><cylinderGeometry args={[m(17), m(17), m(30), 20]} /><meshStandardMaterial color="#2a2f36" metalness={0.6} roughness={0.35} /></mesh>
          <group position={M(0, 0, z < 0 ? -18 : 18)} rotation={[0, 0, m0]} ref={g => { pata(i).muslo = g }}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={q.sombras}><cylinderGeometry args={[m(19), m(19), m(22), 20]} /><meshStandardMaterial color="#2a2f36" metalness={0.6} roughness={0.35} /></mesh>
            <RoundedBox args={M(26, muslo, 20)} position={M(0, -muslo / 2, 0)} radius={m(7)} smoothness={2} castShadow={q.sombras}>
              <meshStandardMaterial color={color} metalness={0.55} roughness={0.38} />
            </RoundedBox>
            <group position={M(0, -muslo, 0)} rotation={[0, 0, r0]} ref={g => { pata(i).rodilla = g }}>
              <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[m(9), m(9), m(22), 14]} /><meshStandardMaterial color="#1f2328" metalness={0.5} roughness={0.4} /></mesh>
              <mesh position={M(0, -pierna / 2, 0)} castShadow={q.sombras}><cylinderGeometry args={[m(6), m(8), m(pierna), 12]} /><meshStandardMaterial color="#1f2328" metalness={0.5} roughness={0.4} /></mesh>
              <mesh position={M(0, -pierna, 0)} castShadow={q.sombras}><sphereGeometry args={[m(RADIO_PIE), 16, 12]} /><meshStandardMaterial color="#111214" roughness={0.9} /></mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  )
}

/**
 * Sensor de línea de la barra (QRE1113): el encapsulado negro mira al piso por
 * debajo de la barra y, arriba, un LED indicador que se enciende con la lectura.
 * Origen en la cara de abajo del sensor.
 */
export const SensorBarra = forwardRef(function SensorBarra(_: object, refLed: Ref<THREE.MeshStandardMaterial>) {
  return (
    <group>
      <mesh position={M(0, 0.9, 0)}><boxGeometry args={[m(3.6), m(1.8), m(2.9)]} /><meshStandardMaterial color="#0b0b0d" roughness={0.45} /></mesh>
      {/* Emisor y receptor, hacia el piso */}
      <mesh position={M(-0.9, 0, 0)}><boxGeometry args={[m(1.1), m(0.2), m(1.6)]} /><meshStandardMaterial color="#1e3a8a" roughness={0.2} /></mesh>
      <mesh position={M(0.9, 0, 0)}><boxGeometry args={[m(1.1), m(0.2), m(1.6)]} /><meshStandardMaterial color="#111827" roughness={0.2} /></mesh>
      {/* Pastillas de soldadura de sus cuatro cables, sobre la barra */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={M(-5, 1.9, -3.8 + i * 2.54)}><boxGeometry args={[m(1.6), m(0.3), m(1.6)]} /><meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} /></mesh>
      ))}
      <mesh position={M(3.2, 2.1, 0)}>
        <boxGeometry args={[m(1.6), m(0.7), m(0.9)]} />
        <meshStandardMaterial ref={refLed} color="#7f1d1d" emissive="#ef4444" emissiveIntensity={0} />
      </mesh>
    </group>
  )
})

/**
 * Cámara CSI (IMX219) sobre un mástil: base atornillada al chasis detrás del
 * borde, el mástil con el cable plano y la placa de la cámara inclinada 40°
 * hacia el piso. La lente queda en (0, 95, 0), mirando a +x.
 */
export function CamaraCSI() {
  const q = useCalidad()
  return (
    <group>
      <mesh position={M(-12, 1.5, 0)} castShadow={q.sombras}><boxGeometry args={[m(24), m(3), m(24)]} /><meshStandardMaterial color="#27272a" roughness={0.5} /></mesh>
      <mesh position={M(-12, 45, 0)} castShadow={q.sombras}><boxGeometry args={[m(5), m(84), m(5)]} /><meshStandardMaterial color="#3f3f46" metalness={0.6} roughness={0.35} /></mesh>
      {/* Cable plano por detrás del mástil */}
      <mesh position={M(-14.8, 48, 0)}><boxGeometry args={[m(0.4), m(90), m(16)]} /><meshStandardMaterial color="#e7d8b1" roughness={0.7} /></mesh>
      <group position={M(-6, 95, 0)} rotation={[0, 0, (-40 * Math.PI) / 180]}>
        <mesh castShadow={q.sombras}><boxGeometry args={[m(1.6), m(24), m(25)]} /><meshStandardMaterial color="#15803d" roughness={0.55} /></mesh>
        <mesh position={M(2.5, 0, 0)}><boxGeometry args={[m(3.5), m(8.5), m(8.5)]} /><meshStandardMaterial color={NEGRO} roughness={0.5} /></mesh>
        <mesh position={M(5, 0, 0)} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[m(3), m(3), m(2.5), 16]} /><meshStandardMaterial color="#09090b" metalness={0.4} roughness={0.2} /></mesh>
        <mesh position={M(6.3, 0, 0)} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[m(1.6), m(1.6), m(0.2), 16]} /><meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} /></mesh>
      </group>
    </group>
  )
}



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

/** Rueda loca colgada: +y local apunta al piso (el montaje la gira 180°). Bola de acero en su copa, sobre separadores. */
export function RuedaLoca({ espaciador, radio }: { espaciador: number; radio: number }) {
  const q = useCalidad()
  return (
    <group>
      {espaciador > 0.5 && [[-7, -7], [-7, 7], [7, -7], [7, 7]].map(([x, z]) => <Separador key={`${x}${z}`} pos={[x, 0, z]} alto={espaciador} />)}
      {/* Brida de acero con sus cuatro agujeros */}
      <mesh position={M(0, espaciador + 1, 0)}>
        <boxGeometry args={[m(24), m(2), m(24)]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.3} />
      </mesh>
      {[[-7, -7], [-7, 7], [7, -7], [7, 7]].map(([x, z]) => (
        <mesh key={`t${x}${z}`} position={M(x, espaciador + 2.6, z)}>
          <cylinderGeometry args={[m(2.4), m(2.4), m(1.4), 12]} />
          <meshStandardMaterial color="#9aa1aa" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* Copa: cilindro que se cierra hacia la bola */}
      <mesh position={M(0, espaciador + 2 + radio * 0.55, 0)}>
        <cylinderGeometry args={[m(radio + 1.2), m(radio + 2.6), m(radio * 1.1), 24]} />
        <meshStandardMaterial color="#aab1b9" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={M(0, espaciador + 2 + radio * 1.1, 0)}>
        <torusGeometry args={[m(radio + 0.6), m(1.2), 10, 24]} />
        <meshStandardMaterial color="#8d949c" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={M(0, espaciador + radio + 1.2, 0)} castShadow={q.sombras}>
        <sphereGeometry args={[m(radio), q.segmentos, q.segmentos / 2]} />
        <meshStandardMaterial color="#eef1f4" metalness={1} roughness={0.06} />
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
    case 'proc:arduino-mega': return anclaMega(pin)
    case 'proc:pico': {
      const a = PICO_1_20.indexOf(pin), b = PICO_40_21.indexOf(pin)
      if (a >= 0) return [-24.13 + a * 2.54, 1, -8.89]
      if (b >= 0) return [-24.13 + b * 2.54, 1, 8.89]
      return null
    }
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
    // El «+» va del lado donde el modelo lo trae impreso.
    case 'proc:bateria-9v': return pin === '+' ? [25.5, 9, 6.5] : [25.5, 9, -6.5]
    case 'proc:motor-tt': return pin === 'M+' ? [-50, 4, 0] : [-50, -4, 0]
    case 'proc:motor-n20': return pin === 'M+' ? [2.5, 0, -25] : [-2.5, 0, -25]
    case 'proc:bateria-lipo': return pin === '+' ? [-26, 6, -3] : [-26, 6, 3]
    case 'proc:servo': return [31, 2, pin === 'GND' ? -1.2 : pin === 'V+' ? 0 : 1.2]
    case 'proc:tcrt5000': {
      const i = ['VCC', 'GND', 'DO', 'AO'].indexOf(pin)
      return i >= 0 ? [-26, 12, -3.8 + i * 2.54] : null
    }
    case 'proc:sensor-barra': {
      const i = ['VCC', 'GND', 'DO', 'AO'].indexOf(pin)
      return i >= 0 ? [-5, 1.9, -3.8 + i * 2.54] : null
    }
    case 'proc:fc51': {
      const i = ['VCC', 'GND', 'OUT'].indexOf(pin)
      return i >= 0 ? [2, 5, -2.54 + i * 2.54] : null
    }
    case 'proc:hcsr04': {
      const i = ['VCC', 'TRIG', 'ECHO', 'GND'].indexOf(pin)
      return i >= 0 ? [-3, 3, 4.1 - i * 2.5] : null
    }
    case 'proc:joystick': {
      // Tira de 5 pines en ángulo del borde +z, en el orden de la serigrafía.
      const i = ['GND', '+5V', 'VRx', 'VRy', 'SW'].indexOf(pin)
      return i >= 0 ? [-5.08 + i * 2.54, 1.5, 17.5] : null
    }
    // Robots de combate: los cables salen de atrás del motor y, en las armas,
    // del variador (ESC) al pie del poste, del motor del disco o del eje hueco del tambor.
    case 'proc:motor-combate': return pin === 'M+' ? [2.5, 0, -40.5] : pin === 'M-' ? [-2.5, 0, -40.5] : null
    case 'proc:arma-giratoria': { const i = ['SIG', 'BAT+', 'GND'].indexOf(pin); return i >= 0 ? [-11.5, 4, (i - 1) * 3] : null }
    case 'proc:arma-tambor': { const i = ['SIG', 'BAT+', 'GND'].indexOf(pin); return i >= 0 ? [0, (1 - i) * 2.5, -59] : null }
    case 'proc:arma-disco': { const i = ['SIG', 'BAT+', 'GND'].indexOf(pin); return i >= 0 ? [0, (1 - i) * 4, -21.5] : null }
    // Tambor de 170 mm: los cables del ESC salen por el extremo, dentro del brazo.
    case 'glb:abyss-tambor': { const i = ['SIG', 'BAT+', 'GND'].indexOf(pin); return i >= 0 ? [0, (1 - i) * 2.5, -86.5] : null }
    case 'glb:riptide-tambor': { const i = ['SIG', 'BAT+', 'GND'].indexOf(pin); return i >= 0 ? [0, (1 - i) * 2.5, -99] : null }
    // Panel de conexiones del perro en el lomo: red y alimentación.
    case 'proc:perro-robot': return ({ ETH: [-95, 71, -40], '5V': [-80, 73, -42.5], GND: [-80, 73, -37.5] } as Record<string, V>)[pin] ?? null
    // Cable plano de la cámara: sale de abajo del mástil.
    case 'proc:camara-csi': return pin === 'CSI' ? [-14.8, 4, 0] : null
  }
  return anclaComputadora(modelo, pin) ?? anclaCircuito(modelo, pin)
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
    case 'proc:sensor-barra': return { dir: [-0.3, 1, 0], tipo: 'soldado' }
    case 'proc:hcsr04': return { dir: [-1, 0, 0], tipo: 'dupont' }
    case 'proc:joystick': return { dir: [0, 0, 1], tipo: 'dupont' }
    case 'proc:jetson-nano':
      if (pin === 'ETH') return { dir: [-1, 0, 0], tipo: 'soldado' }
      if (pin === 'CSI') return { dir: [0, 0.4, 1], tipo: 'soldado' }
      return { dir: [0, 1, 0], tipo: 'dupont' }
    case 'proc:raspberry-pi-4':
      if (pin === 'ETH') return { dir: [1, 0, 0], tipo: 'soldado' }
      if (pin === 'CSI') return { dir: [0, 1, 0], tipo: 'soldado' }
      return { dir: [0, 1, 0], tipo: 'dupont' }
    case 'proc:camara-csi': return { dir: [-1, 0, 0], tipo: 'soldado' }
    case 'proc:motor-combate':
    case 'proc:arma-tambor':
    case 'glb:abyss-tambor':
    case 'glb:riptide-tambor':
    case 'proc:arma-disco': return { dir: [0, 0, -1], tipo: 'soldado' }
    case 'proc:arma-giratoria': return { dir: [-1, 0, 0], tipo: 'soldado' }
    case 'proc:perro-robot': return { dir: [0, 1, 0], tipo: 'soldado' }
  }
  if (anclaCircuito(modelo, pin)) return { dir: [0, 1, 0], tipo: 'macho' }
  return { dir: [0, 1, 0], tipo: 'dupont' }
}

// ---------------------------------------------------------------------------
// Modelo real (GLB)
// ---------------------------------------------------------------------------

/** Modelo 3D real ya preparado (metros, marco de la pieza). Comprimido con meshopt. */
export function ModeloGlb({ url, escala = 1, traslucido = false }: { url: string; escala?: number; traslucido?: boolean }) {
  const q = useCalidad()
  const { scene } = useGLTF(url, false, true)
  const copia = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(o => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.castShadow = q.sombras && !traslucido
      m.receiveShadow = true
      if (traslucido) {
        // Carrocería que deja ver lo de adentro: no tapa los clics a las piezas ni a los pines.
        const mat = (m.material as THREE.Material).clone()
        mat.transparent = true
        mat.opacity = 0.22
        mat.depthWrite = false
        m.material = mat
        m.raycast = () => {}
      }
    })
    return c
  }, [scene, q.sombras, traslucido])
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
