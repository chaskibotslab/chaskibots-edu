'use client'

// Mesa de trabajo del taller y de la mesa de electrónica: tablero de madera
// con un tapete de corte verde (cuadrícula de 1 cm y 5 cm, la referencia de
// medida del taller) y patas de acero hasta el piso del aula.

import { MaterialTextura } from './Material'

/** Altura del tablero sobre el piso del aula (m). */
export const ALTURA_MESA = 0.75

export function Mesa3D({ ancho = 1.6, fondo = 0.8, tapete = [0.9, 0.6] as [number, number] }) {
  const grosor = 0.03, tapeteAlto = 0.003
  const bajoTablero = -tapeteAlto - grosor
  const pata = ALTURA_MESA + bajoTablero
  return (
    <group>
      <mesh position={[0, -tapeteAlto / 2, 0]} receiveShadow>
        <boxGeometry args={[tapete[0], tapeteAlto, tapete[1]]} />
        <MaterialTextura tipo="tapete" ancho={tapete[0]} largo={tapete[1]} />
      </mesh>
      <mesh position={[0, -tapeteAlto - grosor / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[ancho, grosor, fondo]} />
        <MaterialTextura tipo="madera" ancho={ancho} largo={fondo} color="#d6b88a" bumpScale={0.004} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (ancho / 2 - 0.06), bajoTablero - pata / 2, sz * (fondo / 2 - 0.06)]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, pata, 16]} />
          <meshStandardMaterial color="#3f444b" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
      {[-1, 1].map(s => (
        <mesh key={`t${s}`} position={[0, -ALTURA_MESA + 0.12, s * (fondo / 2 - 0.06)]}>
          <boxGeometry args={[ancho - 0.12, 0.03, 0.03]} />
          <meshStandardMaterial color="#3f444b" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}
