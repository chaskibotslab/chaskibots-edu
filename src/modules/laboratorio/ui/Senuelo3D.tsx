'use client'

// Lo que el alumno mueve en la arena mientras el robot corre: una linterna
// (la ven los sensores de luz) o una caja (la ven el ultrasonido y los IR).
// Se arrastra por el piso con el mouse; mientras tanto, la cámara no gira.

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ALTO_SENUELO, LADO_SENUELO } from '../engine/fisica/mundo'
import { ALTURA_LINTERNA } from '../engine/paso'
import type { Simulacion } from '../engine/simulation'

export default function Senuelo3D({ sim }: { sim: Simulacion }) {
  const { controls, gl } = useThree()
  const grupo = useRef<THREE.Group>(null)
  const plano = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const punto = useMemo(() => new THREE.Vector3(), [])
  const arrastrando = useRef(false)
  const tipo = sim.arena.senuelo?.tipo
  const habilitar = (si: boolean) => { const c = controls as unknown as { enabled: boolean } | null; if (c) c.enabled = si }

  useFrame(() => {
    const p = sim.senuelo
    if (grupo.current && p) grupo.current.position.set(p.x, 0, p.z)
  })

  if (!tipo) return null
  return (
    <group
      ref={grupo}
      onPointerDown={e => {
        if (e.button !== 0) return
        e.stopPropagation()
        arrastrando.current = true
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
        habilitar(false)
        gl.domElement.style.cursor = 'grabbing'
      }}
      onPointerMove={e => {
        if (!arrastrando.current) return
        if (e.ray.intersectPlane(plano, punto)) sim.moverSenuelo(punto.x, punto.z)
      }}
      onPointerUp={e => {
        if (!arrastrando.current) return
        arrastrando.current = false
        ;(e.target as Element).releasePointerCapture?.(e.pointerId)
        habilitar(true)
        gl.domElement.style.cursor = 'grab'
      }}
      onPointerOver={() => { gl.domElement.style.cursor = 'grab' }}
      onPointerOut={() => { if (!arrastrando.current) gl.domElement.style.cursor = '' }}
    >
      {/* Zona de agarre, más grande que el dibujo: fácil de tomar con el mouse o el dedo. */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.14, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Aro en el piso: «esto se puede mover». */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.085, 0.1, 40]} />
        <meshBasicMaterial color={tipo === 'linterna' ? '#f59e0b' : '#0ea5e9'} transparent opacity={0.7} />
      </mesh>
      {tipo === 'linterna' ? (
        <>
          <mesh position={[0, 0.006, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.012, 28]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.04, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, ALTURA_LINTERNA, 0]}>
            <sphereGeometry args={[0.03, 24, 16]} />
            <meshStandardMaterial color="#fff7d6" emissive="#fde047" emissiveIntensity={2.4} roughness={0.3} />
          </mesh>
          <pointLight position={[0, ALTURA_LINTERNA + 0.03, 0]} color="#fde68a" intensity={0.5} distance={1.6} decay={2} />
        </>
      ) : (
        <mesh position={[0, ALTO_SENUELO / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[LADO_SENUELO, ALTO_SENUELO, LADO_SENUELO]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.6} />
        </mesh>
      )}
    </group>
  )
}
