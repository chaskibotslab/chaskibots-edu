'use client'

// La arena en 3D: piso con su material real, paredes, dohyo, pozo, mesa
// elevada, meta y los objetos. Solo aspecto: la física lee la misma ArenaDef.

import { useEffect, useMemo } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { ArenaDef } from '../../arenas'
import type { Simulacion } from '../../engine/simulation'
import { MaterialTextura } from './Material'
import { Decoracion, Objeto } from './Objetos3D'
import { useTextura, type TipoTextura } from './texturas'

/** Grosor del tablero de la arena (m): la cara de arriba queda en y = 0. */
export const GROSOR_PISO = 0.012

type Colocar = (e: ThreeEvent<MouseEvent>) => void

/** Textura del piso según la arena. */
export function texturaPiso(arena: ArenaDef): TipoTextura | null {
  if (arena.piso.aspecto) return arena.piso.aspecto
  const m = arena.piso.material
  return m === 'melamina' ? 'melamina' : m === 'mdf' ? 'mdf' : m === 'metal' ? 'acero' : null
}

/** Piso (en el plano XY, se gira después) con un agujero cuadrado donde está el pozo. */
export function PlanoConPozo({ ancho, largo, pozo }: { ancho: number; largo: number; pozo: { x: number; z: number; lado: number } }) {
  const forma = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-ancho / 2, -largo / 2); s.lineTo(ancho / 2, -largo / 2); s.lineTo(ancho / 2, largo / 2); s.lineTo(-ancho / 2, largo / 2); s.closePath()
    // Girado −90° en X: la z del mundo es la −y del plano.
    const h = pozo.lado / 2, cx = pozo.x, cy = -pozo.z
    const agujero = new THREE.Path()
    agujero.moveTo(cx - h, cy - h); agujero.lineTo(cx - h, cy + h); agujero.lineTo(cx + h, cy + h); agujero.lineTo(cx + h, cy - h); agujero.closePath()
    s.holes.push(agujero)
    return s
  }, [ancho, largo, pozo])
  // ShapeGeometry da UV en metros: se reescalan a 0–1 para que la textura se repita como en un plano.
  const geo = useMemo(() => {
    const g = new THREE.ShapeGeometry(forma)
    const uv = g.getAttribute('uv') as THREE.BufferAttribute
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / ancho + 0.5, uv.getY(i) / largo + 0.5)
    return g
  }, [forma, ancho, largo])
  useEffect(() => () => geo.dispose(), [geo])
  return <primitive object={geo} attach="geometry" />
}

function MaterialPiso({ arena, textura }: { arena: ArenaDef; textura: THREE.Texture | null }) {
  if (textura) return <meshStandardMaterial map={textura} roughness={0.8} />
  const tipo = texturaPiso(arena)
  if (!tipo) return <meshStandardMaterial color={arena.piso.color} roughness={0.75} />
  const conColor = tipo === 'melamina' || tipo === 'mdf' || tipo === 'madera'
  return (
    <MaterialTextura
      tipo={tipo} ancho={arena.ancho} largo={arena.largo}
      color={conColor ? arena.piso.color : undefined}
      metalness={tipo === 'acero' ? 0.75 : 0}
      bumpScale={tipo === 'acero' ? 0.02 : tipo === 'madera' ? 0.004 : 0}
    />
  )
}

/** Tablero de la arena (melamina, MDF o acero) con su grosor; en la arena con pozo, una chapa con el hueco. */
function PisoArena({ arena, textura, onColocar }: { arena: ArenaDef; textura: THREE.Texture | null; onColocar: Colocar }) {
  if (arena.pozo) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0004, 0]} receiveShadow onDoubleClick={onColocar}>
        <PlanoConPozo ancho={arena.ancho} largo={arena.largo} pozo={arena.pozo} />
        <MaterialPiso arena={arena} textura={textura} />
      </mesh>
    )
  }
  return (
    <mesh position={[0, -GROSOR_PISO / 2, 0]} castShadow receiveShadow onDoubleClick={onColocar}>
      <boxGeometry args={[arena.ancho, GROSOR_PISO, arena.largo]} />
      <MaterialPiso arena={arena} textura={textura} />
    </mesh>
  )
}

/** Dohyo: plataforma de goma negra con el aro de cinta blanca y las dos líneas de salida (shikiri). */
export function Dohyo({ radio, borde, altura, onDoubleClick }: { radio: number; borde: number; altura: number; onDoubleClick: Colocar }) {
  return (
    <group>
      <mesh position={[0, -altura / 2, 0]} castShadow receiveShadow onDoubleClick={onDoubleClick}>
        <cylinderGeometry args={[radio, radio, altura, 128]} />
        <meshStandardMaterial color="#1a1b20" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]} receiveShadow onDoubleClick={onDoubleClick}>
        <circleGeometry args={[radio - borde + 0.003, 128]} />
        <MaterialTextura tipo="goma" ancho={radio * 2} largo={radio * 2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0007, 0]} receiveShadow>
        <ringGeometry args={[radio - borde, radio, 128]} />
        <meshStandardMaterial color="#f4f4ef" roughness={0.38} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * radio * 0.13, 0.0008, 0]}>
          <planeGeometry args={[radio * 0.026, radio * 0.26]} />
          <meshStandardMaterial color="#8a4b1f" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Paredes bajas de MDF o, si son altas (combate), paneles de policarbonato con postes de aluminio. */
export function Paredes({ arena }: { arena: ArenaDef }) {
  const W = arena.ancho / 2, L = arena.largo / 2, h = arena.paredesAlto ?? 0.15, e = 0.02
  // [x, z, giro, largo del lado]
  const lados: [number, number, number, number][] = [
    [0, -L - e, 0, arena.ancho + 2 * e], [0, L + e, 0, arena.ancho + 2 * e],
    [-W - e, 0, Math.PI / 2, arena.largo + 2 * e], [W + e, 0, Math.PI / 2, arena.largo + 2 * e],
  ]
  if (h <= 0.2) {
    return (
      <group>
        {lados.map(([x, z, ry, largo], i) => (
          <mesh key={i} position={[x, h / 2, z]} rotation={[0, ry, 0]} castShadow receiveShadow>
            <boxGeometry args={[largo, h, 2 * e]} />
            <MaterialTextura tipo="mdf" ancho={largo} largo={h} />
          </mesh>
        ))}
      </group>
    )
  }
  const zocalo = 0.15
  return (
    <group>
      {lados.map(([x, z, ry, largo], i) => {
        const postes = Math.max(2, Math.round(largo / 1.2) + 1)
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, ry, 0]}>
            <mesh position={[0, zocalo / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[largo, zocalo, 0.03]} />
              <MaterialTextura tipo="acero" ancho={largo} largo={zocalo} metalness={0.75} bumpScale={0.02} />
            </mesh>
            <mesh position={[0, zocalo + (h - zocalo) / 2, 0]} receiveShadow>
              <boxGeometry args={[largo, h - zocalo, 0.012]} />
              <meshPhysicalMaterial color="#e8f1fb" transparent opacity={0.14} roughness={0.08} metalness={0} depthWrite={false} />
            </mesh>
            <mesh position={[0, h + 0.015, 0]} castShadow>
              <boxGeometry args={[largo + 0.05, 0.03, 0.05]} />
              <meshStandardMaterial color="#b4bac2" metalness={0.9} roughness={0.35} />
            </mesh>
            {Array.from({ length: postes }, (_, k) => (
              <mesh key={k} position={[-largo / 2 + (k * largo) / (postes - 1), (h + 0.03) / 2, 0]} castShadow>
                <boxGeometry args={[0.05, h + 0.03, 0.05]} />
                <meshStandardMaterial color="#aeb5bd" metalness={0.9} roughness={0.35} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

/** Pozo de la arena de combate: hueco oscuro, borde con franjas y luces rojas en las esquinas. */
export function Pozo({ x, z, lado }: { x: number; z: number; lado: number }) {
  const franjas = useTextura('franjas', [Math.round(lado / 0.16) || 1, 1])
  const h = lado / 2, ancho = 0.04, prof = 0.4
  return (
    <group position={[x, 0, z]}>
      {([[0, -h, lado, 0], [0, h, lado, Math.PI], [-h, 0, lado, Math.PI / 2], [h, 0, lado, -Math.PI / 2]] as const).map(([px, pz, l, r], i) => (
        <mesh key={i} position={[px, -prof / 2, pz]} rotation={[0, r, 0]}>
          <planeGeometry args={[l, prof]} />
          <meshStandardMaterial color="#2a303a" side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, -prof + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[lado, lado]} />
        <meshStandardMaterial color="#0b0f17" />
      </mesh>
      {([[0, -h - ancho / 2, lado + 2 * ancho, 0], [0, h + ancho / 2, lado + 2 * ancho, 0], [-h - ancho / 2, 0, lado, Math.PI / 2], [h + ancho / 2, 0, lado, Math.PI / 2]] as const).map(([px, pz, l, r], i) => (
        <mesh key={`b${i}`} position={[px, 0.0008, pz]} rotation={[-Math.PI / 2, 0, r]}>
          <planeGeometry args={[l, ancho]} />
          {franjas ? <meshStandardMaterial map={franjas.map} roughness={0.6} /> : <meshStandardMaterial color="#facc15" roughness={0.6} />}
        </mesh>
      ))}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`l${i}`} position={[sx * (h + ancho + 0.02), 0.012, sz * (h + ancho + 0.02)]}>
          <cylinderGeometry args={[0.015, 0.018, 0.024, 16]} />
          <meshStandardMaterial color="#7f1d1d" emissive="#ef4444" emissiveIntensity={2.2} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/** Zona de llegada: círculo verde con borde blanco. */
function Meta({ x, z, radio }: { x: number; z: number; radio: number }) {
  return (
    <group position={[x, 0.0012, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[radio, 48]} />
        <meshStandardMaterial color="#16a34a" transparent opacity={0.75} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.0002]}>
        <ringGeometry args={[radio * 0.88, radio, 48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Mesa elevada: tablero de melamina con faldón y patas de acero hasta el piso del aula. */
function MesaElevada({ arena, bajo }: { arena: ArenaDef; bajo: number }) {
  const grosor = 0.03, pata = -grosor - bajo
  return (
    <group>
      <mesh position={[0, -grosor / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[arena.ancho, grosor, arena.largo]} />
        <MaterialTextura tipo="melamina" ancho={arena.ancho} largo={arena.largo} color={arena.piso.color} />
      </mesh>
      <mesh position={[0, -grosor - 0.04, 0]} castShadow>
        <boxGeometry args={[arena.ancho - 0.12, 0.08, arena.largo - 0.12]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.3} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (arena.ancho / 2 - 0.06), bajo + pata / 2, sz * (arena.largo / 2 - 0.06)]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, pata, 20]} />
          <meshStandardMaterial color="#3f444b" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

/** Toda la arena (sin el robot): la usa EscenaArena. */
export function Arena3D({ sim, version, bajo, onColocar }: { sim: Simulacion; version: number; bajo: number; onColocar: Colocar }) {
  const { gl } = useThree()
  const arena = sim.arena
  const textura = useMemo(() => {
    if (!sim.mapa) return null
    const t = new THREE.CanvasTexture(sim.mapa.canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = gl.capabilities.getMaxAnisotropy()
    return t
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim, version, gl])
  useEffect(() => () => textura?.dispose(), [textura])

  return (
    <group>
      {arena.pozo && <Pozo {...arena.pozo} />}
      {arena.mesa && <MesaElevada arena={arena} bajo={bajo} />}
      {arena.dohyo
        ? <Dohyo {...arena.dohyo} onDoubleClick={onColocar} />
        : <PisoArena arena={arena} textura={textura} onColocar={onColocar} />}
      {arena.meta && <Meta {...arena.meta} />}
      {arena.paredes && <Paredes arena={arena} />}
      {arena.objetos.map(o => <Objeto key={o.id} o={o} />)}
      {arena.decoracion?.map(d => <Decoracion key={d.id} d={d} />)}
    </group>
  )
}
