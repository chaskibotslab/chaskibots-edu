'use client'

// Editor 3D estilo Tinkercad: figuras sólidas que se seleccionan y se manipulan
// DIRECTAMENTE con manijas sobre la propia figura, sin botones de modo:
//  - Arrastrar el cuerpo  -> mover sobre el piso (X/Z)
//  - Arrastrar una esquina (cubos blancos) -> agrandar / encoger
//  - Arrastrar el anillo verde -> girar
//  - Arrastrar la flecha de arriba -> subir / bajar (altura Y)
// El estado de las figuras vive en el padre (CADLab) para exportar/enviar.

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'

export type TShapeType =
  | 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus'
  | 'pyramid' | 'prism' | 'tetra' | 'octa' | 'dodeca' | 'icosa'
  | 'capsule' | 'dome' | 'wheel' | 'knot'
export interface TShape {
  id: string
  type: TShapeType
  color: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

function Geo({ type }: { type: TShapeType }) {
  switch (type) {
    case 'sphere': return <sphereGeometry args={[0.6, 32, 32]} />
    case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
    case 'cone': return <coneGeometry args={[0.6, 1.2, 32]} />
    case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />
    case 'pyramid': return <coneGeometry args={[0.7, 1.2, 4]} />
    case 'prism': return <cylinderGeometry args={[0.7, 0.7, 1.2, 3]} />
    case 'tetra': return <tetrahedronGeometry args={[0.8]} />
    case 'octa': return <octahedronGeometry args={[0.8]} />
    case 'dodeca': return <dodecahedronGeometry args={[0.8]} />
    case 'icosa': return <icosahedronGeometry args={[0.8]} />
    case 'capsule': return <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
    case 'dome': return <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
    case 'wheel': return <cylinderGeometry args={[0.7, 0.7, 0.3, 32]} />
    case 'knot': return <torusKnotGeometry args={[0.4, 0.15, 80, 10]} />
    default: return <boxGeometry args={[1, 1, 1]} />
  }
}

// Mitad del tamaño base (sin escala) por tipo, para ubicar las manijas en las esquinas.
function halfExtents(type: TShapeType): [number, number, number] {
  switch (type) {
    case 'sphere': return [0.6, 0.6, 0.6]
    case 'cylinder': return [0.5, 0.6, 0.5]
    case 'cone': return [0.6, 0.6, 0.6]
    case 'torus': return [0.7, 0.7, 0.2]
    case 'pyramid': return [0.7, 0.6, 0.7]
    case 'prism': return [0.7, 0.6, 0.7]
    case 'tetra': return [0.8, 0.8, 0.8]
    case 'octa': return [0.8, 0.8, 0.8]
    case 'dodeca': return [0.8, 0.8, 0.8]
    case 'icosa': return [0.8, 0.8, 0.8]
    case 'capsule': return [0.4, 0.8, 0.4]
    case 'dome': return [0.7, 0.7, 0.7]
    case 'wheel': return [0.7, 0.15, 0.7]
    case 'knot': return [0.6, 0.6, 0.6]
    default: return [0.5, 0.5, 0.5]
  }
}

type DragKind = 'move' | 'scale' | 'rotate' | 'lift'
interface DragState {
  kind: DragKind
  plane: THREE.Plane
  // move
  offX?: number; offZ?: number
  // scale
  startDist?: number; startScale?: [number, number, number]
  // rotate
  startAngle?: number; startRotY?: number
  // lift
  startY?: number; startPosY?: number
}

function Escena({
  shapes, setShapes, selectedId, setSelectedId, showGrid, onBeforeChange,
}: {
  shapes: TShape[]
  setShapes: (updater: (prev: TShape[]) => TShape[]) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  showGrid: boolean
  onBeforeChange?: () => void
}) {
  const { camera, gl } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const drag = useRef<DragState | null>(null)
  const [dragging, setDragging] = useState(false)

  // Re-render una vez tras montar para que las manijas aparezcan desde el inicio.
  const [, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  const sel = selectedId ? shapes.find(s => s.id === selectedId) || null : null

  // Convierte la posición del puntero en un punto 3D sobre un plano.
  const worldPoint = (clientX: number, clientY: number, plane: THREE.Plane): THREE.Vector3 | null => {
    const rect = gl.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    const out = new THREE.Vector3()
    return raycaster.ray.intersectPlane(plane, out) ? out : null
  }

  const horizPlane = (y: number) => new THREE.Plane(new THREE.Vector3(0, 1, 0), -y)
  const camPlane = (center: THREE.Vector3) => {
    const n = camera.getWorldDirection(new THREE.Vector3())
    return new THREE.Plane().setFromNormalAndCoplanarPoint(n.negate(), center)
  }
  const vertPlane = (center: THREE.Vector3) => {
    const d = camera.getWorldDirection(new THREE.Vector3())
    const n = new THREE.Vector3(d.x, 0, d.z).normalize()
    return new THREE.Plane().setFromNormalAndCoplanarPoint(n, center)
  }

  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d || !selectedId) return
    const p = worldPoint(e.clientX, e.clientY, d.plane)
    if (!p) return
    if (d.kind === 'move') {
      const nx = p.x - (d.offX || 0), nz = p.z - (d.offZ || 0)
      setShapes(prev => prev.map(s => s.id === selectedId ? { ...s, position: [nx, s.position[1], nz] } : s))
    } else if (d.kind === 'scale') {
      const c = sel ? new THREE.Vector3(...sel.position) : new THREE.Vector3()
      const dist = p.distanceTo(c)
      const f = Math.max(0.1, dist / (d.startDist || 1))
      const ss = d.startScale || [1, 1, 1]
      const clamp = (v: number) => (Math.abs(v) < 0.15 ? Math.sign(v || 1) * 0.15 : v)
      setShapes(prev => prev.map(s => s.id === selectedId ? { ...s, scale: [clamp(ss[0] * f), clamp(ss[1] * f), clamp(ss[2] * f)] } : s))
    } else if (d.kind === 'rotate') {
      const c = sel ? sel.position : [0, 0, 0]
      const ang = Math.atan2(p.x - c[0], p.z - c[2])
      const ry = (d.startRotY || 0) + (ang - (d.startAngle || 0))
      setShapes(prev => prev.map(s => s.id === selectedId ? { ...s, rotation: [s.rotation[0], ry, s.rotation[2]] } : s))
    } else if (d.kind === 'lift') {
      const ny = Math.max(0, (d.startPosY || 0) + (p.y - (d.startY || 0)))
      setShapes(prev => prev.map(s => s.id === selectedId ? { ...s, position: [s.position[0], ny, s.position[2]] } : s))
    }
  }

  const endDrag = () => {
    drag.current = null
    setDragging(false)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', endDrag)
    document.body.style.cursor = ''
  }

  const begin = (kind: DragKind, s: TShape, clientX: number, clientY: number) => {
    onBeforeChange?.()
    const center = new THREE.Vector3(...s.position)
    let d: DragState
    if (kind === 'move') {
      const plane = horizPlane(s.position[1])
      const p = worldPoint(clientX, clientY, plane) || center
      d = { kind, plane, offX: p.x - s.position[0], offZ: p.z - s.position[2] }
    } else if (kind === 'scale') {
      const plane = camPlane(center)
      const p = worldPoint(clientX, clientY, plane) || center
      d = { kind, plane, startDist: Math.max(0.001, p.distanceTo(center)), startScale: [...s.scale] as [number, number, number] }
    } else if (kind === 'rotate') {
      const plane = horizPlane(s.position[1])
      const p = worldPoint(clientX, clientY, plane) || center
      d = { kind, plane, startAngle: Math.atan2(p.x - s.position[0], p.z - s.position[2]), startRotY: s.rotation[1] }
    } else {
      const plane = vertPlane(center)
      const p = worldPoint(clientX, clientY, plane) || center
      d = { kind, plane, startY: p.y, startPosY: s.position[1] }
    }
    drag.current = d
    setDragging(true)
    document.body.style.cursor = kind === 'move' ? 'grabbing' : 'crosshair'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', endDrag)
  }

  // Esquinas y manijas de la figura seleccionada.
  const he = sel ? halfExtents(sel.type) : [0.5, 0.5, 0.5]
  const sc = sel ? sel.scale : [1, 1, 1]
  const ex = [Math.abs(he[0] * sc[0]), Math.abs(he[1] * sc[1]), Math.abs(he[2] * sc[2])]
  const corners: [number, number, number][] = []
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) corners.push([sx * ex[0], sy * ex[1], sz * ex[2]])
  const ringR = Math.max(ex[0], ex[2]) + 0.35
  const topY = ex[1] + 0.45

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 14, 8]} intensity={1.1} />
      {showGrid && <Grid args={[24, 24]} cellColor="#334155" sectionColor="#0ea5b7" position={[0, 0, 0]} infiniteGrid={false} />}

      {/* Clic en el vacío = deseleccionar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onPointerDown={() => setSelectedId(null)}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {shapes.map(s => (
        <mesh
          key={s.id}
          position={s.position}
          rotation={s.rotation}
          scale={s.scale}
          onPointerDown={e => { e.stopPropagation(); setSelectedId(s.id); begin('move', s, e.clientX, e.clientY) }}
          onPointerOver={() => { if (!dragging) document.body.style.cursor = 'grab' }}
          onPointerOut={() => { if (!dragging) document.body.style.cursor = '' }}
          castShadow
        >
          <Geo type={s.type} />
          <meshStandardMaterial
            color={s.color}
            metalness={0.1}
            roughness={0.55}
            emissive={selectedId === s.id ? '#06b6d4' : '#000000'}
            emissiveIntensity={selectedId === s.id ? 0.3 : 0}
          />
        </mesh>
      ))}

      {/* Manijas de la figura seleccionada (en su propio marco: posición + rotación) */}
      {sel && (
        <group position={sel.position} rotation={sel.rotation}>
          {/* Caja guía */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(ex[0] * 2, ex[1] * 2, ex[2] * 2)]} />
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </lineSegments>

          {/* Esquinas: agrandar / encoger */}
          {corners.map((c, i) => (
            <mesh
              key={i}
              position={c}
              onPointerDown={e => { e.stopPropagation(); begin('scale', sel, e.clientX, e.clientY) }}
              onPointerOver={() => { if (!dragging) document.body.style.cursor = 'nwse-resize' }}
              onPointerOut={() => { if (!dragging) document.body.style.cursor = '' }}
            >
              <boxGeometry args={[0.16, 0.16, 0.16]} />
              <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={0.4} />
            </mesh>
          ))}

          {/* Anillo: girar */}
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, -ex[1] + 0.02, 0]}
            onPointerDown={e => { e.stopPropagation(); begin('rotate', sel, e.clientX, e.clientY) }}
            onPointerOver={() => { if (!dragging) document.body.style.cursor = 'grab' }}
            onPointerOut={() => { if (!dragging) document.body.style.cursor = '' }}
          >
            <torusGeometry args={[ringR, 0.05, 10, 40]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
          </mesh>

          {/* Flecha arriba: subir / bajar */}
          <mesh
            position={[0, topY, 0]}
            onPointerDown={e => { e.stopPropagation(); begin('lift', sel, e.clientX, e.clientY) }}
            onPointerOver={() => { if (!dragging) document.body.style.cursor = 'ns-resize' }}
            onPointerOut={() => { if (!dragging) document.body.style.cursor = '' }}
          >
            <coneGeometry args={[0.16, 0.3, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}

      <OrbitControls makeDefault enabled={!dragging} enablePan minDistance={3} maxDistance={40} maxPolarAngle={Math.PI / 2.02} />
    </>
  )
}

export default function TinkerEditor(props: {
  shapes: TShape[]
  setShapes: (updater: (prev: TShape[]) => TShape[]) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  darkMode?: boolean
  showGrid?: boolean
  onBeforeChange?: () => void
}) {
  const { darkMode = true, showGrid = true, ...rest } = props
  return (
    <Canvas camera={{ position: [7, 7, 9], fov: 50 }} shadows style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={[darkMode ? '#10131F' : '#eef2f8']} />
      <Escena {...rest} showGrid={showGrid} />
    </Canvas>
  )
}
