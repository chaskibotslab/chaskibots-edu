'use client'

// El aula alrededor de la escena (piso, paredes), las luces y el postprocesado.

import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, N8AO, SMAA, ToneMapping } from '@react-three/postprocessing'
import type { ThreeEvent } from '@react-three/fiber'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useCalidad } from '../calidad'
import { MaterialTextura } from './Material'
import { PlanoConPozo } from './Arena3D'

/** Paneles de luz de estudio (reflejos en plásticos y metales) sin descargar mapas HDR. */
export function Estudio({ intensidad = 1 }: { intensidad?: number }) {
  return (
    <Environment resolution={256} frames={1}>
      {/* Fondo gris claro del mapa: sin él, metales y vidrios reflejan negro. */}
      <mesh scale={60}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color="#9aa1aa" side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} scale={60}>
        <planeGeometry />
        <meshBasicMaterial color="#5e6570" />
      </mesh>
      <Lightformer form="rect" intensity={2.2 * intensidad} position={[0, 5, -2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2.5} />
      <Lightformer form="rect" intensity={1.2 * intensidad} position={[-5, 2, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.2 * intensidad} position={[5, 2, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="rect" intensity={0.6 * intensidad} position={[0, 6, 4]} scale={[6, 2, 1]} rotation-x={Math.PI / 2} />
    </Environment>
  )
}

/** Luz principal cálida con sombras, relleno frío y cielo del aula. */
export function Luces({ sombras, tamSombra, alcance }: { sombras: boolean; tamSombra: number; alcance: number }) {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#aab0ba', 0.45]} />
      <directionalLight
        color="#fff6ea"
        position={[2.5, 4, 1.5]}
        intensity={1.7}
        castShadow={sombras}
        shadow-mapSize={[tamSombra, tamSombra]}
        shadow-camera-left={-alcance}
        shadow-camera-right={alcance}
        shadow-camera-top={alcance}
        shadow-camera-bottom={-alcance}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <directionalLight color="#e6edff" position={[-3, 2.5, -2]} intensity={0.45} />
    </>
  )
}

/**
 * El aula: piso de baldosas de vinilo y paredes pintadas con rodapié. `y` es la
 * altura del piso (debajo de la mesa o del dohyo). Con `pozo`, el piso tiene el
 * hueco de la arena de combate.
 */
export function Sala({ y = 0, lado = 18, alto = 3.2, pozo, onDoubleClick }: {
  y?: number; lado?: number; alto?: number
  pozo?: { x: number; z: number; lado: number }
  onDoubleClick?: (e: ThreeEvent<MouseEvent>) => void
}) {
  const mitad = lado / 2
  const lados: [number, number, number][] = [[0, -mitad, 0], [0, mitad, Math.PI], [-mitad, 0, Math.PI / 2], [mitad, 0, -Math.PI / 2]]
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0005, 0]} receiveShadow onDoubleClick={onDoubleClick}>
        {pozo ? <PlanoConPozo ancho={lado} largo={lado} pozo={pozo} /> : <planeGeometry args={[lado, lado]} />}
        <MaterialTextura tipo="aula" ancho={lado} largo={lado} />
      </mesh>
      {lados.map(([x, z, ry], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, ry, 0]}>
          <mesh position={[0, alto / 2, 0]}>
            <planeGeometry args={[lado, alto]} />
            <MaterialTextura tipo="pintura" ancho={lado} largo={alto} />
          </mesh>
          <mesh position={[0, 0.05, 0.006]}>
            <boxGeometry args={[lado, 0.1, 0.012]} />
            <meshStandardMaterial color="#5b6472" roughness={0.55} />
          </mesh>
          {/* Guardasilla a 90 cm: una franja un poco más oscura que corta la pared. */}
          <mesh position={[0, 0.9, 0.004]}>
            <boxGeometry args={[lado, 0.04, 0.008]} />
            <meshStandardMaterial color="#d7dbe1" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Oclusión ambiental, antialiasing y tono fotográfico; nada en calidad baja. */
export function Efectos() {
  const q = useCalidad()
  if (!q.ao) return null
  const alta = q.nivel === 'alta'
  const efectos = [
    <N8AO key="ao" screenSpaceRadius aoRadius={alta ? 40 : 28} intensity={2} distanceFalloff={1} halfRes={!alta} quality={alta ? 'medium' : 'low'} color="#171c26" />,
    ...(q.aa === 'smaa' ? [<SMAA key="aa" />] : []),
    <ToneMapping key="tono" mode={ToneMappingMode.ACES_FILMIC} />,
  ]
  return <EffectComposer multisampling={q.aa === 'msaa' ? 4 : 0} enableNormalPass={false}>{efectos}</EffectComposer>
}
