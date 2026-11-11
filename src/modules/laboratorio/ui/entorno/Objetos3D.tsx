'use client'

// Objetos de la arena con aspecto real (caja de cartón, pared de MDF, sofá,
// mueble, maceta, patas) dibujados DENTRO de su colisionador, y la decoración
// que se ve pero no choca.

import { RoundedBox } from '@react-three/drei'
import { aspectoDe } from '../../arenas'
import type { DecoracionArena, ObjetoArena } from '../../arenas/tipos'
import { MaterialTextura } from './Material'
import { tonoColor } from './texturas'

const METAL = { metalness: 0.85, roughness: 0.32 }

function Carton({ a, h, b }: { a: number; h: number; b: number }) {
  const cinta = Math.min(0.05, a * 0.3)
  return (
    <group>
      <RoundedBox args={[a, h, b]} radius={Math.min(0.006, a / 12)} smoothness={2} position={[0, h / 2, 0]} castShadow receiveShadow>
        <MaterialTextura tipo="carton" ancho={1} largo={1} />
      </RoundedBox>
      {/* Cinta de embalar cruzando la tapa y bajando por los costados */}
      <mesh position={[0, h + 0.0005, 0]}>
        <boxGeometry args={[cinta, 0.0008, b + 0.0015]} />
        <meshStandardMaterial color="#b4803f" roughness={0.3} transparent opacity={0.9} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={s} position={[0, h * 0.86, s * (b / 2 + 0.0006)]}>
          <boxGeometry args={[cinta, h * 0.28, 0.0008]} />
          <meshStandardMaterial color="#b4803f" roughness={0.3} transparent opacity={0.9} />
        </mesh>
      ))}
      {/* Etiqueta de envío */}
      <mesh position={[a / 2 + 0.0006, h * 0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[b * 0.45, h * 0.24]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Sofa({ a, h, b, color }: { a: number; h: number; b: number; color: string }) {
  const claro = tonoColor(color, 0.14)
  const brazo = a * 0.1
  return (
    <group>
      <mesh position={[0, h * 0.2 + 0.015, b * 0.1]} castShadow receiveShadow>
        <boxGeometry args={[a - 2 * brazo, h * 0.4, b * 0.8]} />
        <MaterialTextura tipo="tela" ancho={a} largo={b} color={color} />
      </mesh>
      <mesh position={[0, h / 2 + 0.015, -b * 0.36]} castShadow receiveShadow>
        <boxGeometry args={[a - 2 * brazo, h - 0.03, b * 0.28]} />
        <MaterialTextura tipo="tela" ancho={a} largo={h} color={color} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * (a / 2 - brazo / 2), h * 0.36 + 0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[brazo, h * 0.72, b]} />
          <MaterialTextura tipo="tela" ancho={b} largo={h} color={color} />
        </mesh>
      ))}
      {[-1, 1].map(s => (
        <RoundedBox key={`c${s}`} args={[(a - 2 * brazo) * 0.47, h * 0.13, b * 0.62]} radius={0.012} smoothness={2} position={[s * (a - 2 * brazo) * 0.245, h * 0.4 + 0.08 * h, b * 0.12]} castShadow receiveShadow>
          <MaterialTextura tipo="tela" ancho={a / 2} largo={b} color={claro} />
        </RoundedBox>
      ))}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (a / 2 - 0.05), 0.015, sz * (b / 2 - 0.05)]}>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 12]} />
          <meshStandardMaterial color="#3b2f2a" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Mueble({ a, h, b, color }: { a: number; h: number; b: number; color: string }) {
  const puerta = a * 0.47
  return (
    <group>
      <mesh position={[0, h / 2 - 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[a, h - 0.02, b]} />
        <MaterialTextura tipo="madera" ancho={a} largo={h} color={color} bumpScale={0.003} />
      </mesh>
      <mesh position={[0, h - 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[a + 0.02, 0.02, b + 0.02]} />
        <MaterialTextura tipo="madera" ancho={a} largo={b} color={tonoColor(color, -0.2)} />
      </mesh>
      {[-1, 1].map(s => (
        <group key={s}>
          <mesh position={[s * (puerta / 2 + 0.006), h * 0.46, b / 2 + 0.003]} castShadow>
            <boxGeometry args={[puerta, h * 0.78, 0.006]} />
            <MaterialTextura tipo="madera" ancho={puerta} largo={h} color={tonoColor(color, 0.08)} />
          </mesh>
          <mesh position={[s * 0.03, h * 0.46, b / 2 + 0.012]}>
            <cylinderGeometry args={[0.004, 0.004, 0.05, 10]} />
            <meshStandardMaterial color="#c9ced6" {...METAL} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Maceta({ r, h, color }: { r: number; h: number; color: string }) {
  const hojas = 9
  return (
    <group>
      <mesh position={[0, h * 0.46, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.98, r * 0.76, h * 0.92, 32]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, h * 0.96, 0]} castShadow>
        <cylinderGeometry args={[r, r, h * 0.08, 32]} />
        <meshStandardMaterial color={tonoColor(color, -0.12)} roughness={0.8} />
      </mesh>
      <mesh position={[0, h * 0.975, 0]}>
        <cylinderGeometry args={[r * 0.9, r * 0.9, h * 0.03, 32]} />
        <meshStandardMaterial color="#3b2d22" roughness={1} />
      </mesh>
      {Array.from({ length: hojas }, (_, i) => {
        const ang = (i / hojas) * Math.PI * 2, largo = r * (1.6 + (i % 3) * 0.35), alto = h + largo * 0.55
        return (
          <group key={i} rotation={[0, ang, 0]} position={[0, h * 0.98, 0]}>
            {/* Cada hoja es una esfera aplastada, inclinada hacia arriba */}
            <mesh position={[largo * 0.42, (alto - h) * 0.8, 0]} rotation={[0, 0, 0.75 - (i % 2) * 0.25]} scale={[1, 0.16, 0.42]} castShadow>
              <sphereGeometry args={[largo * 0.5, 12, 8]} />
              <meshStandardMaterial color={i % 2 ? '#2f7d3a' : '#3f9a4a'} roughness={0.7} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function Objeto({ o }: { o: ObjetoArena }) {
  const [a, h, b] = o.medidas
  const asp = aspectoDe(o)
  let contenido
  switch (asp) {
    case 'carton': contenido = <Carton a={a} h={h} b={b} />; break
    case 'sofa': contenido = <Sofa a={a} h={h} b={b} color={o.color} />; break
    case 'mueble': contenido = <Mueble a={a} h={h} b={b} color={o.color} />; break
    case 'maceta': contenido = <Maceta r={a} h={h} color={o.color} />; break
    case 'pared-mdf':
      contenido = (
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[a, h, b]} />
          <MaterialTextura tipo="mdf" ancho={Math.max(a, b)} largo={h} />
        </mesh>
      )
      break
    case 'barrera':
      contenido = (
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[a, h, b]} />
          <MaterialTextura tipo="franjas" ancho={Math.max(a, b)} largo={h} color="#dc2626|#f8fafc" roughness={0.5} />
        </mesh>
      )
      break
    case 'pata-madera':
      contenido = (
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[a, a, h, 24]} />
          <MaterialTextura tipo="madera" ancho={a * 6} largo={h} color={o.color} />
        </mesh>
      )
      break
    case 'pata-metal':
      contenido = (
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[a, a, h, 24]} />
          <meshStandardMaterial color={o.color} {...METAL} />
        </mesh>
      )
      break
    default:
      contenido = (
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          {o.forma === 'caja' ? <boxGeometry args={o.medidas} /> : <cylinderGeometry args={[a, a, h, 32]} />}
          <meshStandardMaterial color={o.color} roughness={0.7} />
        </mesh>
      )
  }
  return <group position={[o.x, 0, o.z]} rotation={[0, o.yaw ?? 0, 0]}>{contenido}</group>
}

export function Decoracion({ d }: { d: DecoracionArena }) {
  const [a, h, b] = d.medidas
  return (
    <mesh position={[d.x, d.y + h / 2, d.z]} rotation={[0, d.yaw ?? 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[a, h, b]} />
      {d.aspecto === 'madera' ? <MaterialTextura tipo="madera" ancho={a} largo={b} color={d.color} bumpScale={0.003} />
        : d.aspecto === 'tela' ? <MaterialTextura tipo="tela" ancho={a} largo={b} color={d.color} />
          : d.aspecto === 'metal' ? <meshStandardMaterial color={d.color} {...METAL} />
            : <meshStandardMaterial color={d.color} roughness={0.45} />}
    </mesh>
  )
}
