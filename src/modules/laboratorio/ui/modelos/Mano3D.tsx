'use client'

// Mano de la mesa de electrónica (E2): la que el alumno acerca al sensor
// ultrasónico con el control del panel. Se dibuja en el eje del primer
// sensor, a la distancia elegida, con la palma mirando al sensor; es la misma
// distancia que lee el sensor (engine/paso.ts → leerSensores, `mano`).

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { rayoUltrasonido } from '../../engine/paso'
import type { Simulacion } from '../../engine/simulation'
import { useCalidad } from '../calidad'

const m = (v: number) => v / 1000
const PIEL = '#e0ac69'

/** Dedos: [z del dedo en la palma, largo] (mm), del índice al meñique. */
const DEDOS: [number, number][] = [[-30, 72], [-10, 80], [10, 76], [29, 60]]

export default function Mano3D({ sim }: { sim: Simulacion }) {
  const q = useCalidad()
  const grupo = useRef<THREE.Group>(null)
  const actual = useRef<number | null>(null)

  useFrame(() => {
    const g = grupo.current
    if (!g) return
    const cm = sim.controles.mano ?? null
    const r = cm === null ? null : rayoUltrasonido(sim.plan, sim.doc, sim.fisica)
    g.visible = !!r
    if (!r || cm === null) { actual.current = null; return }
    // Se mueve suave hacia la distancia elegida (como una mano de verdad), pero
    // la lectura del sensor ya es la nueva: la animación dura muy poco.
    actual.current = actual.current === null ? cm : actual.current + (cm - actual.current) * 0.35
    const d = actual.current / 100
    g.position.set(r.o.x + r.d.x * d, r.o.y + r.d.y * d, r.o.z + r.d.z * d)
    g.rotation.set(0, Math.atan2(-r.d.z, r.d.x), 0)
  })

  const piel = <meshStandardMaterial color={PIEL} roughness={0.65} />
  // Marco de la mano: −x mira al sensor (la palma), +y hacia arriba; el eco
  // vuelve de la parte baja de la palma.
  return (
    <group ref={grupo} visible={false}>
      <RoundedBox args={[m(24), m(95), m(84)]} radius={m(10)} smoothness={3} position={[m(12), m(35), 0]} castShadow={q.sombras}>
        {piel}
      </RoundedBox>
      {DEDOS.map(([z, largo]) => (
        <mesh key={z} position={[m(11), m(80 + largo / 2), m(z)]} castShadow={q.sombras}>
          <capsuleGeometry args={[m(8.5), m(largo - 17), 4, 10]} />
          {piel}
        </mesh>
      ))}
      {/* Pulgar, abierto hacia el costado */}
      <mesh position={[m(6), m(30), m(-52)]} rotation={[-0.75, 0, 0]} castShadow={q.sombras}>
        <capsuleGeometry args={[m(10), m(40), 4, 10]} />
        {piel}
      </mesh>
      {/* Muñeca y manga, hacia afuera (lejos del sensor), sin tocar la mesa */}
      <mesh position={[m(48), m(2), 0]} rotation={[0, 0, Math.PI / 2]} castShadow={q.sombras}>
        <capsuleGeometry args={[m(19), m(60), 4, 12]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.8} />
      </mesh>
    </group>
  )
}
