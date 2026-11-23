'use client'

// Editor 3D estilo Tinkercad: figuras sólidas que se seleccionan y se mueven,
// giran y escalan con manijas (gizmos) directamente en la escena.
// El estado de las figuras vive en el padre (CADLab) para exportar/enviar.

import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, TransformControls } from '@react-three/drei'
import * as THREE from 'three'

export type TShapeType = 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus'
export interface TShape {
  id: string
  type: TShapeType
  color: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export type TMode = 'translate' | 'rotate' | 'scale'

function Geo({ type }: { type: TShapeType }) {
  switch (type) {
    case 'sphere': return <sphereGeometry args={[0.6, 32, 32]} />
    case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
    case 'cone': return <coneGeometry args={[0.6, 1.2, 32]} />
    case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />
    default: return <boxGeometry args={[1, 1, 1]} />
  }
}

function Piezas({
  shapes, setShapes, selectedId, setSelectedId, mode,
}: {
  shapes: TShape[]
  setShapes: (updater: (prev: TShape[]) => TShape[]) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  mode: TMode
}) {
  const meshes = useRef<Record<string, THREE.Mesh>>({})
  // Re-render una vez tras montar para que las referencias de las mallas existan
  // y la manija (gizmo) aparezca sobre la figura seleccionada desde el inicio.
  const [, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  const commit = () => {
    if (!selectedId) return
    const o = meshes.current[selectedId]
    if (!o) return
    setShapes(prev => prev.map(s => s.id === selectedId ? {
      ...s,
      position: [o.position.x, o.position.y, o.position.z],
      rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
      scale: [o.scale.x, o.scale.y, o.scale.z],
    } : s))
  }

  const sel = selectedId ? meshes.current[selectedId] : null

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 14, 8]} intensity={1.1} />
      <Grid args={[24, 24]} cellColor="#334155" sectionColor="#0ea5b7" position={[0, 0, 0]} infiniteGrid={false} />
      {/* Clic en el vacío = deseleccionar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onPointerDown={() => setSelectedId(null)}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {shapes.map(s => (
        <mesh
          key={s.id}
          ref={m => { if (m) meshes.current[s.id] = m }}
          position={s.position}
          rotation={s.rotation}
          scale={s.scale}
          onPointerDown={e => { e.stopPropagation(); setSelectedId(s.id) }}
          castShadow
        >
          <Geo type={s.type} />
          <meshStandardMaterial
            color={s.color}
            metalness={0.1}
            roughness={0.55}
            emissive={selectedId === s.id ? '#06b6d4' : '#000000'}
            emissiveIntensity={selectedId === s.id ? 0.35 : 0}
          />
        </mesh>
      ))}

      {sel && <TransformControls object={sel} mode={mode} onMouseUp={commit} translationSnap={0.5} rotationSnap={Math.PI / 12} scaleSnap={0.25} />}

      <OrbitControls makeDefault enablePan minDistance={3} maxDistance={40} maxPolarAngle={Math.PI / 2.02} />
    </>
  )
}

export default function TinkerEditor(props: {
  shapes: TShape[]
  setShapes: (updater: (prev: TShape[]) => TShape[]) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  mode: TMode
}) {
  return (
    <Canvas camera={{ position: [7, 7, 9], fov: 50 }} shadows style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={['#10131F']} />
      <Piezas {...props} />
    </Canvas>
  )
}
