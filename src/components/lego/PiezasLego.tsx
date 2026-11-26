'use client'

/**
 * Piezas LEGO EV3 en 3D, hechas con primitivas de Three.js (vigas technic con
 * agujeros, ladrillo EV3, motores, ruedas y sensores). Cada pieza acepta:
 *  - ghost: translúcida (vista previa de dónde va)
 *  - nuevo: resaltada (la que se acaba de colocar)
 * Unidades en "mundo"; 1 stud ≈ 8.
 */
import * as THREE from 'three'

export type TipoPieza = 'viga' | 'brick' | 'motor' | 'rueda' | 'ruedaLoca' | 'sensorColor' | 'sensorUltra'

export interface Pieza {
  id: string
  tipo: TipoPieza
  color?: string
  pos: [number, number, number]
  rot?: [number, number, number]           // grados
  args?: [number, number, number]           // dimensiones de caja (vigas/brick)
}

const rad = (d: number) => (d * Math.PI) / 180

function useMat(color: string, ghost?: boolean, nuevo?: boolean) {
  return { color, transparent: !!ghost, opacity: ghost ? 0.32 : 1, emissive: nuevo ? color : '#000000', emissiveIntensity: nuevo ? 0.35 : 0 } as any
}

function Viga({ args = [80, 8, 8], color = '#c0392b', ghost, nuevo }: { args?: [number, number, number]; color?: string; ghost?: boolean; nuevo?: boolean }) {
  const [lx, ly, lz] = args
  const ejeX = lx >= lz
  const largo = ejeX ? lx : lz
  const n = Math.max(0, Math.round(largo / 8) - 1)
  const huecos = []
  for (let i = 0; i < n; i++) {
    const off = -largo / 2 + ((i + 1) * largo) / (n + 1)
    const pos: [number, number, number] = ejeX ? [off, 0, 0] : [0, 0, off]
    // cilindro perpendicular horizontal (eje Z si la viga va en X, y viceversa)
    const rotCil: [number, number, number] = ejeX ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]
    const h = (ejeX ? lz : lx) + 0.6
    huecos.push(
      <mesh key={i} position={pos} rotation={rotCil}>
        <cylinderGeometry args={[2.5, 2.5, h, 14]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>,
    )
  }
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial {...useMat(color, ghost, nuevo)} />
      </mesh>
      {!ghost && huecos}
    </group>
  )
}

function Brick({ ghost, nuevo }: { ghost?: boolean; nuevo?: boolean }) {
  return (
    <group>
      <mesh castShadow><boxGeometry args={[56, 30, 44]} /><meshStandardMaterial {...useMat('#5b6066', ghost, nuevo)} /></mesh>
      {/* pantalla */}
      <mesh position={[0, 8, 22.3]}><boxGeometry args={[34, 24, 1]} /><meshStandardMaterial {...useMat('#9aa7b0', ghost)} /></mesh>
      {/* botones */}
      {!ghost && [[0, -10], [-11, -10], [11, -10], [0, -2], [0, -18]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 22.4]}><boxGeometry args={[6, 6, 1.5]} /><meshStandardMaterial color={i === 0 ? '#e23b3b' : '#cbd5e1'} /></mesh>
      ))}
    </group>
  )
}

function Motor({ ghost, nuevo }: { ghost?: boolean; nuevo?: boolean }) {
  return (
    <group>
      <mesh castShadow><boxGeometry args={[42, 30, 24]} /><meshStandardMaterial {...useMat('#e5e7eb', ghost, nuevo)} /></mesh>
      {/* eje de salida (adelante, +X) */}
      <mesh position={[24, -4, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[4, 4, 10, 16]} /><meshStandardMaterial {...useMat('#334155', ghost)} /></mesh>
      <mesh position={[-18, 6, 0]}><boxGeometry args={[8, 10, 26]} /><meshStandardMaterial {...useMat('#9ca3af', ghost)} /></mesh>
    </group>
  )
}

function Rueda({ ghost, nuevo }: { ghost?: boolean; nuevo?: boolean }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow><cylinderGeometry args={[18, 18, 14, 28]} /><meshStandardMaterial {...useMat('#1f2937', ghost, nuevo)} /></mesh>
      <mesh><cylinderGeometry args={[9, 9, 15, 20]} /><meshStandardMaterial {...useMat('#e5e7eb', ghost)} /></mesh>
    </group>
  )
}

function RuedaLoca({ ghost, nuevo }: { ghost?: boolean; nuevo?: boolean }) {
  return <mesh castShadow><sphereGeometry args={[9, 20, 16]} /><meshStandardMaterial {...useMat('#9ca3af', ghost, nuevo)} /></mesh>
}

function SensorColor({ ghost, nuevo }: { ghost?: boolean; nuevo?: boolean }) {
  return (
    <group>
      <mesh castShadow><boxGeometry args={[16, 14, 18]} /><meshStandardMaterial {...useMat('#334155', ghost, nuevo)} /></mesh>
      <mesh position={[0, -8, 0]}><cylinderGeometry args={[4, 4, 3, 16]} /><meshStandardMaterial color="#e23b3b" emissive="#e23b3b" emissiveIntensity={ghost ? 0 : 0.5} transparent={!!ghost} opacity={ghost ? 0.32 : 1} /></mesh>
    </group>
  )
}

function SensorUltra({ ghost, nuevo }: { ghost?: boolean; nuevo?: boolean }) {
  return (
    <group>
      <mesh castShadow><boxGeometry args={[20, 16, 14]} /><meshStandardMaterial {...useMat('#334155', ghost, nuevo)} /></mesh>
      {[-5, 5].map((z, i) => (
        <mesh key={i} position={[10, 0, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[5, 5, 2, 18]} /><meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={ghost ? 0 : 0.4} transparent={!!ghost} opacity={ghost ? 0.32 : 1} /></mesh>
      ))}
    </group>
  )
}

export function PiezaLego({ p, ghost, nuevo }: { p: Pieza; ghost?: boolean; nuevo?: boolean }) {
  const pos = p.pos
  const rot: [number, number, number] = p.rot ? [rad(p.rot[0]), rad(p.rot[1]), rad(p.rot[2])] : [0, 0, 0]
  let cuerpo: JSX.Element
  switch (p.tipo) {
    case 'viga': cuerpo = <Viga args={p.args} color={p.color} ghost={ghost} nuevo={nuevo} />; break
    case 'brick': cuerpo = <Brick ghost={ghost} nuevo={nuevo} />; break
    case 'motor': cuerpo = <Motor ghost={ghost} nuevo={nuevo} />; break
    case 'rueda': cuerpo = <Rueda ghost={ghost} nuevo={nuevo} />; break
    case 'ruedaLoca': cuerpo = <RuedaLoca ghost={ghost} nuevo={nuevo} />; break
    case 'sensorColor': cuerpo = <SensorColor ghost={ghost} nuevo={nuevo} />; break
    case 'sensorUltra': cuerpo = <SensorUltra ghost={ghost} nuevo={nuevo} />; break
    default: cuerpo = <mesh><boxGeometry args={[8, 8, 8]} /><meshStandardMaterial color={p.color || '#888'} /></mesh>
  }
  return <group position={pos} rotation={rot}>{cuerpo}</group>
}
