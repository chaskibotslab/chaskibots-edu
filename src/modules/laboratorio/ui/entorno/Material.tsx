'use client'

// Material PBR con textura procedural. Si la textura no se pudo crear (sin
// canvas), cae a un color liso con la misma rugosidad.

import type * as THREE from 'three'
import { repeticion, useTextura, type TipoTextura } from './texturas'

interface Props {
  tipo: TipoTextura
  /** Tamaño de la superficie (m) para que el mosaico salga a escala real. */
  ancho: number
  largo: number
  /** Color base de la textura (en las que lo admiten) y del respaldo liso. */
  color?: string
  roughness?: number
  metalness?: number
  bumpScale?: number
  envMapIntensity?: number
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
}

export function MaterialTextura({ tipo, ancho, largo, color, roughness = 0.7, metalness = 0, bumpScale = 0, envMapIntensity = 1, transparent, opacity, side }: Props) {
  const t = useTextura(tipo, repeticion(tipo, ancho, largo), color)
  const comunes = { metalness, envMapIntensity, transparent, opacity, side }
  if (!t) return <meshStandardMaterial color={color?.split('|')[0] ?? '#c8ccd2'} roughness={roughness} {...comunes} />
  return (
    <meshStandardMaterial
      map={t.map}
      roughnessMap={t.roughnessMap}
      roughness={t.roughnessMap ? 1 : roughness}
      bumpMap={bumpScale ? t.bumpMap : undefined}
      bumpScale={bumpScale}
      {...comunes}
    />
  )
}
