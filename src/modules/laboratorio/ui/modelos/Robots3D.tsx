'use client'

// Robots completos con modelo real (GLB preparado por scripts/preparar-robots.mjs):
// cada parte móvil viene en un nodo con nombre, medida desde su articulación,
// y aquí se arma en los mismos grupos que el simulador gira en cada cuadro.

import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useCalidad } from '../calidad'
import { ikPata, RADIO_PIE, type PataPerro } from './Piezas3D'

const m = (v: number) => v / 1000
type V = [number, number, number]
const M = (...v: V): V => [m(v[0]), m(v[1]), m(v[2])]

/**
 * Medidas del Unitree Go1 ya a escala del laboratorio (mm), las mismas con
 * que se preparó `perro-go1.glb`: la cadera gira a 28,6 mm del centro, el
 * muslo cuelga 48,9 mm más afuera y cada tramo de la pata mide 130,2 mm.
 * En el modelo, el muslo descansa 45° hacia atrás y la pierna 45° adelante.
 */
const GO1 = { caderaZ: 28.6, musloZ: 48.9, tramo: 130.2, reposo: Math.PI / 4 }

/** Tramo de la pata del Go1 (m): con este largo se calculan los giros al animar. */
export const TRAMO_GO1 = m(GO1.tramo)

/**
 * Perro robot con el modelo real del Unitree Go1. El marco es el de la pieza
 * `perro-robot` (origen en el centro de la cara de abajo del cuerpo): el eje de
 * las caderas queda a la altura de `caderas[i][1]`. Encima lleva una bandeja
 * de carga (como los rieles del Go1 Edu) donde va la placa y el panel con el
 * conector de red y los bornes de 5 V; adelante, el soporte de la cámara.
 */
export function PerroGo1({ url, caderas, patas }: { url: string; caderas: V[]; patas: PataPerro[] }) {
  const q = useCalidad()
  const { scene } = useGLTF(url, false, true)
  const partes = useMemo(() => {
    const copia = scene.clone(true)
    copia.traverse(o => {
      const malla = o as THREE.Mesh
      if (malla.isMesh) { malla.castShadow = q.sombras; malla.receiveShadow = true }
    })
    const parte = (n: string) => copia.getObjectByName(n) ?? new THREE.Group()
    return {
      tronco: parte('tronco'),
      patas: [0, 1, 2, 3].map(i => ({ cadera: parte(`cadera${i}`), muslo: parte(`muslo${i}`), pierna: parte(`pierna${i}`) })),
    }
  }, [scene, q.sombras])
  // Parado (cadera a 160 mm del piso), hasta que Robot3D las mueva.
  const [m0, r0] = ikPata(0, 0.16 - m(RADIO_PIE), TRAMO_GO1)
  // React engancha primero las refs de los hijos (rodilla, muslo) y después la de la cadera.
  const pata = (i: number) => {
    const p = (patas[i] ??= { abd: null, muslo: null, rodilla: null })
    p.tramo = TRAMO_GO1
    return p
  }
  const y = caderas[0][1]
  return (
    <group>
      {/* Cada parte trae su propia matriz (escala y articulación): se ubica con un grupo, sin tocarla. */}
      <group position={M(0, y, 0)}><primitive object={partes.tronco} /></group>
      {/* Bandeja de carga sobre el lomo, con sus cuatro columnas */}
      <mesh position={M(-40, 70.4, 0)} castShadow={q.sombras} receiveShadow>
        <boxGeometry args={[m(134), m(2.4), m(84)]} />
        <meshStandardMaterial color="#1b1e23" metalness={0.7} roughness={0.42} />
      </mesh>
      {([[-100, -36], [-100, 36], [20, -36], [20, 36]] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={M(x, 62, z)}>
          <cylinderGeometry args={[m(2.6), m(2.6), m(15), 10]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* Panel de conexiones: red (RJ45 hacia arriba) y bornes de 5 V */}
      <mesh position={M(-95, 71.8, -40)}><boxGeometry args={[m(11), m(1.6), m(10)]} /><meshStandardMaterial color="#050607" roughness={0.8} /></mesh>
      <mesh position={M(-95, 72.2, -40)}><boxGeometry args={[m(12.5), m(1), m(11.5)]} /><meshStandardMaterial color="#b8bec6" metalness={0.9} roughness={0.3} /></mesh>
      <mesh position={M(-80, 72.6, -40)}><boxGeometry args={[m(6), m(2.4), m(10)]} /><meshStandardMaterial color="#1d4ed8" roughness={0.5} /></mesh>
      {/* Soporte de la cámara, sobre la cabeza */}
      <mesh position={M(174, 66, 0)} castShadow={q.sombras}>
        <boxGeometry args={[m(30), m(33), m(26)]} />
        <meshStandardMaterial color="#1b1e23" metalness={0.7} roughness={0.42} />
      </mesh>
      {caderas.map(([x, yc, z], i) => {
        const lado = z < 0 ? -1 : 1
        return (
          <group key={i} position={M(x, yc, lado * GO1.caderaZ)} ref={g => { pata(i).abd = g }}>
            <primitive object={partes.patas[i].cadera} />
            <group position={M(0, 0, lado * GO1.musloZ)} rotation={[0, 0, m0]} ref={g => { pata(i).muslo = g }}>
              <group rotation={[0, 0, GO1.reposo]}><primitive object={partes.patas[i].muslo} /></group>
              <group position={M(0, -GO1.tramo, 0)} rotation={[0, 0, r0]} ref={g => { pata(i).rodilla = g }}>
                <group rotation={[0, 0, -GO1.reposo]}><primitive object={partes.patas[i].pierna} /></group>
              </group>
            </group>
          </group>
        )
      })}
    </group>
  )
}
