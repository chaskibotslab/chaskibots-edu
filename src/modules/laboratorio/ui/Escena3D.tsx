'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Robot3D from './Robot3D'
import type { Simulacion } from '../engine/simulation'

export type ModoCamara = 'libre' | 'seguir' | 'arriba'

function Pista({ sim, version }: { sim: Simulacion; version: number }) {
  const { gl } = useThree()
  const textura = useMemo(() => {
    const t = new THREE.CanvasTexture(sim.mapa.canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = gl.capabilities.getMaxAnisotropy()
    return t
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim, version, gl])
  useEffect(() => () => textura.dispose(), [textura])

  // Doble clic sobre la pista: poner el robot ahí (mantiene su orientación).
  const colocar = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    sim.colocarRobot({ x: e.point.x, z: e.point.z, yaw: sim.fisica.pose().yaw })
  }

  return (
    <group>
      {/* Piso del aula */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0005, 0]} receiveShadow onDoubleClick={colocar}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#3a3f4b" roughness={0.95} />
      </mesh>
      <gridHelper args={[14, 70, '#4b5262', '#434957']} position={[0, 0, 0]} />
      {/* Lona de la pista */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0004, 0]} receiveShadow onDoubleClick={colocar}>
        <planeGeometry args={[sim.mapa.anchoM, sim.mapa.altoM]} />
        <meshStandardMaterial map={textura} roughness={0.85} />
      </mesh>
    </group>
  )
}

/** Rastro del recorrido del robot. */
function Rastro({ sim, version }: { sim: Simulacion; version: number }) {
  const MAX = 1500
  const linea = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3))
    geo.setDrawRange(0, 0)
    const mat = new THREE.LineBasicMaterial({ color: '#E57361', transparent: true, opacity: 0.8 })
    return new THREE.Line(geo, mat)
  }, [])
  const n = useRef(0)
  const ultimo = useRef(0)
  useEffect(() => { n.current = 0; linea.geometry.setDrawRange(0, 0) }, [version, linea])
  useFrame(({ clock }) => {
    if (clock.elapsedTime - ultimo.current < 0.05 || !sim.fisica) return
    ultimo.current = clock.elapsedTime
    const c = sim.fisica.puntoMundo([40, 0, 0])
    const attr = linea.geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    if (n.current > 0) {
      const i = (n.current - 1) * 3
      if (Math.hypot(arr[i] - c.x, arr[i + 2] - c.z) < 0.004) return
      if (Math.hypot(arr[i] - c.x, arr[i + 2] - c.z) > 0.3) n.current = 0 // el robot fue movido
    }
    if (n.current >= MAX) { arr.copyWithin(0, 3); n.current = MAX - 1 }
    arr.set([c.x, 0.002, c.z], n.current * 3)
    n.current++
    attr.needsUpdate = true
    linea.geometry.setDrawRange(0, n.current)
  })
  return <primitive object={linea} />
}

function ControlCamara({ sim, modo }: { sim: Simulacion; modo: ModoCamara }) {
  const controles = useRef<React.ElementRef<typeof OrbitControls>>(null)
  const { camera } = useThree()
  const deseada = useMemo(() => new THREE.Vector3(), [])
  const objetivo = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (modo === 'arriba') {
      camera.position.set(0, 2.9, 0.001)
      controles.current?.target.set(0, 0, 0)
    } else if (modo === 'libre') {
      const p = sim.fisica.body.translation()
      camera.position.set(p.x - 0.6, 0.55, p.z + 0.6)
      controles.current?.target.set(p.x, 0.03, p.z)
    }
    controles.current?.update()
  }, [modo, camera, sim])

  useFrame(() => {
    if (modo !== 'seguir' || !sim.fisica) return
    const p = sim.fisica.body.translation()
    const yaw = sim.fisica.pose().yaw
    // Detrás y por encima del robot, suavizado.
    deseada.set(p.x - Math.cos(yaw) * 0.42, 0.26, p.z + Math.sin(yaw) * 0.42)
    camera.position.lerp(deseada, 0.08)
    objetivo.set(p.x + Math.cos(yaw) * 0.1, 0.02, p.z - Math.sin(yaw) * 0.1)
    controles.current?.target.lerp(objetivo, 0.15)
    controles.current?.update()
  })

  return (
    <OrbitControls
      ref={controles}
      makeDefault
      enableRotate={modo !== 'arriba'}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={0.12}
      maxDistance={6}
      enableDamping
    />
  )
}

export default function Escena3D({ sim, modoCamara, versionPista }: { sim: Simulacion; modoCamara: ModoCamara; versionPista: number }) {
  return (
    <Canvas shadows camera={{ position: [-1.1, 0.9, 1.3], fov: 45, near: 0.005, far: 60 }} dpr={[1, 2]}>
      <color attach="background" args={['#10131F']} />
      <fog attach="fog" args={['#10131F', 6, 16]} />
      <hemisphereLight args={['#dbeafe', '#1f2937', 0.7]} />
      <directionalLight
        position={[2.5, 4, 1.5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0004}
      />
      <Pista sim={sim} version={versionPista} />
      <Rastro sim={sim} version={versionPista} />
      <Robot3D sim={sim} robot={sim.robot} />
      <ControlCamara sim={sim} modo={modoCamara} />
    </Canvas>
  )
}
