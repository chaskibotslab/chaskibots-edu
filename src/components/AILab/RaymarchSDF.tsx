'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { RAYMARCH_VERTEX_SHADER, buildFragmentShader } from './sdfShaderLib'

interface RaymarchSDFProps {
  glsl: string
  accentColor?: string
  bgColor?: string
}

export default function RaymarchSDF({ glsl, accentColor = '#3B82F6', bgColor = '#0f0f18' }: RaymarchSDFProps) {
  const material = useMemo(() => {
    const accent = new THREE.Color(accentColor)
    const bg = new THREE.Color(bgColor)
    try {
      return new THREE.ShaderMaterial({
        vertexShader: RAYMARCH_VERTEX_SHADER,
        fragmentShader: buildFragmentShader(glsl, accentColor),
        uniforms: {
          uAccentColor: { value: new THREE.Vector3(accent.r, accent.g, accent.b) },
          uBgColor: { value: new THREE.Vector3(bg.r, bg.g, bg.b) },
        },
        side: THREE.BackSide,
        transparent: true,
      })
    } catch (err) {
      console.error('[RaymarchSDF] shader compile failed', err)
      return null
    }
  }, [glsl, accentColor, bgColor])

  if (!material) return null

  return (
    <mesh material={material}>
      <boxGeometry args={[6, 6, 6]} />
    </mesh>
  )
}
