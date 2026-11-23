'use client'

// Constructor de bloques 3D (estilo voxel/Minecraft): el alumno construye de verdad.
// - Clic en el piso o sobre un bloque para poner un cubo del color elegido.
// - Modo borrar: clic sobre un bloque para quitarlo.
// - Rotar con arrastrar, zoom con la rueda.
// El estado de los bloques vive en el componente padre (CADLab) para poder exportarlo y enviarlo.

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

export type VoxelMap = Record<string, string> // "x,y,z" -> color

const LIMITE = 8 // área de construcción: -8..8
const k = (x: number, y: number, z: number) => `${x},${y},${z}`
const dentro = (x: number, y: number, z: number) =>
  Math.abs(x) <= LIMITE && Math.abs(z) <= LIMITE && y >= 0 && y <= LIMITE * 2

function Bloques({
  voxels, color, modo, setVoxels,
}: {
  voxels: VoxelMap; color: string; modo: 'poner' | 'borrar'; setVoxels: (v: VoxelMap) => void
}) {
  const poner = (x: number, y: number, z: number) => {
    if (!dentro(x, y, z)) return
    const key = k(x, y, z)
    if (voxels[key]) return
    setVoxels({ ...voxels, [key]: color })
  }
  const quitar = (key: string) => {
    const copia = { ...voxels }
    delete copia[key]
    setVoxels(copia)
  }

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 6]} intensity={1.1} castShadow />
      <Grid args={[LIMITE * 2 + 1, LIMITE * 2 + 1]} cellColor="#334155" sectionColor="#475569" position={[0, -0.5, 0]} infiniteGrid={false} />

      {/* Piso invisible para colocar el primer bloque */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          if (modo !== 'poner') return
          poner(Math.round(e.point.x), 0, Math.round(e.point.z))
        }}
      >
        <planeGeometry args={[(LIMITE * 2 + 1), (LIMITE * 2 + 1)]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Bloques colocados */}
      {Object.entries(voxels).map(([key, c]) => {
        const [x, y, z] = key.split(',').map(Number)
        return (
          <mesh
            key={key}
            position={[x, y, z]}
            onPointerDown={(e) => {
              e.stopPropagation()
              if (modo === 'borrar') { quitar(key); return }
              if (e.face) {
                const n = e.face.normal
                poner(x + Math.round(n.x), y + Math.round(n.y), z + Math.round(n.z))
              }
            }}
          >
            <boxGeometry args={[0.98, 0.98, 0.98]} />
            <meshStandardMaterial color={c} />
          </mesh>
        )
      })}
    </>
  )
}

export default function VoxelBuilder(props: {
  voxels: VoxelMap; color: string; modo: 'poner' | 'borrar'; setVoxels: (v: VoxelMap) => void
}) {
  return (
    <Canvas camera={{ position: [10, 10, 14], fov: 45 }} shadows style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={['#10131F']} />
      <Bloques {...props} />
      <OrbitControls makeDefault enablePan={false} minDistance={4} maxDistance={40} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  )
}
