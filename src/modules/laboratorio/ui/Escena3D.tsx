'use client'

// Escenas 3D del laboratorio: el taller (mesa de trabajo) y la arena de
// pruebas. Iluminación de estudio con reflejos (sin descargar mapas HDR: los
// "paneles de luz" se generan aquí) y calidad que se adapta al equipo.

import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Robot3D, { type MarcadorMontaje } from './Robot3D'
import type { Simulacion } from '../engine/simulation'
import type { RobotDoc } from '../robots/doc'
import { CALIDADES, CalidadContexto, type NivelCalidad } from './calidad'

export type ModoCamara = 'libre' | 'seguir' | 'arriba'

function Estudio({ intensidad = 1 }: { intensidad?: number }) {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2 * intensidad} position={[0, 5, -2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2.5} />
      <Lightformer form="rect" intensity={1.2 * intensidad} position={[-5, 2, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.2 * intensidad} position={[5, 2, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="ring" color="#E57361" intensity={0.6 * intensidad} position={[0, 3, 5]} scale={2} />
    </Environment>
  )
}

function Luces({ sombras, tamSombra, alcance }: { sombras: boolean; tamSombra: number; alcance: number }) {
  return (
    <>
      <hemisphereLight args={['#eef2ff', '#2b2f3a', 0.35]} />
      <directionalLight
        position={[2.5, 4, 1.5]}
        intensity={1.8}
        castShadow={sombras}
        shadow-mapSize={[tamSombra, tamSombra]}
        shadow-camera-left={-alcance}
        shadow-camera-right={alcance}
        shadow-camera-top={alcance}
        shadow-camera-bottom={-alcance}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
    </>
  )
}

/** Lienzo común: ajusta la calidad con los fps medidos (PerformanceMonitor). */
function Lienzo({ nivel, onNivel, children, camara }: { nivel: NivelCalidad; onNivel: (n: NivelCalidad) => void; children: ReactNode; camara: [number, number, number] }) {
  const q = CALIDADES[nivel]
  return (
    <Canvas
      shadows={q.sombras ? 'soft' : false}
      dpr={q.dpr}
      camera={{ position: camara, fov: 40, near: 0.005, far: 60 }}
      gl={{ antialias: nivel !== 'baja', powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor
        onDecline={() => onNivel(nivel === 'alta' ? 'media' : 'baja')}
        onIncline={() => onNivel(nivel === 'baja' ? 'media' : nivel)}
        flipflops={3}
      />
      <CalidadContexto.Provider value={q}>{children}</CalidadContexto.Provider>
    </Canvas>
  )
}

// ---------------------------------------------------------------------------
// Taller
// ---------------------------------------------------------------------------

function Mesa() {
  const textura = useMemo(() => {
    // Veta de madera generada (sin descargar imágenes).
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#8a6240'
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 140; i++) {
      const y = Math.random() * 512
      ctx.strokeStyle = `rgba(${60 + Math.random() * 40}, ${38 + Math.random() * 20}, 20, ${0.15 + Math.random() * 0.25})`
      ctx.lineWidth = 1 + Math.random() * 3
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin(x / 60 + i) * 4)
      ctx.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 1)
    return t
  }, [])
  return (
    <group>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.04, 0.9]} />
        <meshStandardMaterial map={textura} roughness={0.7} />
      </mesh>
      {/* Tapete de corte verde */}
      <mesh position={[0, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.6, 0.45]} />
        <meshStandardMaterial color="#1d3b30" roughness={0.92} />
      </mesh>
      <gridHelper args={[0.6, 24, '#3d6b57', '#2a5444']} position={[0, 0.001, 0]} scale={[1, 1, 0.75]} />
    </group>
  )
}

export interface PropsTaller {
  doc: RobotDoc
  seleccion: string | null
  onSeleccionar: (id: string | null) => void
  marcadores: MarcadorMontaje[]
  marcadorActivo: string | null
  onMarcador: (m: MarcadorMontaje) => void
  posMarcadores: MutableRefObject<Map<string, { x: number; y: number }>>
  explosion: number
  cables: boolean
  nivel: NivelCalidad
  onNivel: (n: NivelCalidad) => void
}

function ExplosionSuave({ objetivo, children }: { objetivo: number; children: (e: number) => ReactNode }) {
  const [e, setE] = useState(objetivo)
  const actual = useRef(objetivo)
  useFrame(() => {
    const d = objetivo - actual.current
    if (Math.abs(d) < 0.002) { if (actual.current !== objetivo) { actual.current = objetivo; setE(objetivo) } return }
    actual.current += d * 0.18
    setE(actual.current)
  })
  return <>{children(e)}</>
}

export function EscenaTaller(p: PropsTaller) {
  const q = CALIDADES[p.nivel]
  return (
    <Lienzo nivel={p.nivel} onNivel={p.onNivel} camara={[0.2, 0.16, 0.24]}>
      <color attach="background" args={['#1a1d27']} />
      <Estudio />
      <Luces sombras={q.sombras} tamSombra={q.tamSombra} alcance={0.5} />
      <Mesa />
      <ContactShadows position={[0, 0.0012, 0]} scale={0.8} blur={2.4} opacity={0.55} far={0.3} resolution={q.nivel === 'baja' ? 256 : 512} />
      <ExplosionSuave objetivo={p.explosion}>
        {e => (
          <Robot3D
            doc={p.doc} seleccion={p.seleccion} onSeleccionar={p.onSeleccionar}
            marcadores={p.marcadores} marcadorActivo={p.marcadorActivo} onMarcador={p.onMarcador}
            posMarcadores={p.posMarcadores} explosion={e} cables={p.cables}
          />
        )}
      </ExplosionSuave>
      <OrbitControls makeDefault target={[0, 0.04, 0]} minDistance={0.12} maxDistance={1.4} maxPolarAngle={Math.PI / 2 - 0.08} enableDamping />
    </Lienzo>
  )
}

// ---------------------------------------------------------------------------
// Arena de pruebas
// ---------------------------------------------------------------------------

function PisoArena({ sim, version }: { sim: Simulacion; version: number }) {
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

  // Doble clic sobre el piso: poner el robot ahí (mantiene su orientación).
  const colocar = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    sim.colocarRobot({ x: e.point.x, z: e.point.z, yaw: sim.fisica.pose().yaw })
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0005, 0]} receiveShadow onDoubleClick={colocar}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#3a3f4b" roughness={0.95} />
      </mesh>
      <gridHelper args={[14, 70, '#4b5262', '#434957']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0004, 0]} receiveShadow onDoubleClick={colocar}>
        <planeGeometry args={[arena.ancho, arena.largo]} />
        {textura
          ? <meshStandardMaterial map={textura} roughness={0.8} />
          : <meshStandardMaterial color={arena.piso.color} roughness={0.75} />}
      </mesh>
      {arena.paredes && (() => {
        const W = arena.ancho / 2, L = arena.largo / 2, h = 0.15, e = 0.02
        return ([[0, -L - e, arena.ancho + 2 * e, e * 2], [0, L + e, arena.ancho + 2 * e, e * 2], [-W - e, 0, e * 2, arena.largo], [W + e, 0, e * 2, arena.largo]] as const).map(([x, z, a, b], i) => (
          <mesh key={i} position={[x, h / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[a, h, b]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
        ))
      })()}
      {arena.objetos.map(o => (
        <mesh key={o.id} position={[o.x, o.medidas[1] / 2, o.z]} rotation={[0, o.yaw ?? 0, 0]} castShadow receiveShadow>
          {o.forma === 'caja'
            ? <boxGeometry args={o.medidas} />
            : <cylinderGeometry args={[o.medidas[0], o.medidas[0], o.medidas[1], 32]} />}
          <meshStandardMaterial color={o.color} roughness={0.7} />
        </mesh>
      ))}
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
    const c = sim.fisica.puntoMundo({ x: 40, y: 0, z: 0 })
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
      camera.position.set(0, Math.max(sim.arena.ancho, sim.arena.largo) * 0.95, 0.001)
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
      maxDistance={7}
      enableDamping
    />
  )
}

export function EscenaArena({ sim, modoCamara, versionArena, nivel, onNivel }: { sim: Simulacion; modoCamara: ModoCamara; versionArena: number; nivel: NivelCalidad; onNivel: (n: NivelCalidad) => void }) {
  const q = CALIDADES[nivel]
  return (
    <Lienzo nivel={nivel} onNivel={onNivel} camara={[-1.1, 0.9, 1.3]}>
      <color attach="background" args={['#10131F']} />
      <fog attach="fog" args={['#10131F', 6, 16]} />
      <Estudio intensidad={0.6} />
      <Luces sombras={q.sombras} tamSombra={q.tamSombra} alcance={2.2} />
      <PisoArena sim={sim} version={versionArena} />
      <Rastro sim={sim} version={versionArena} />
      <Robot3D doc={sim.doc} sim={sim} />
      <ControlCamara sim={sim} modo={modoCamara} />
    </Lienzo>
  )
}
