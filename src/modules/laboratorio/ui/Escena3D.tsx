'use client'

// Escenas 3D del laboratorio: el taller (mesa de trabajo) y la arena de
// pruebas. Iluminación de estudio con reflejos (sin descargar mapas HDR: los
// "paneles de luz" se generan aquí) y calidad que se adapta al equipo.

import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Robot3D, { type MarcadorMontaje } from './Robot3D'
import Mano3D from './modelos/Mano3D'
import { resumen } from '../engine/ensamblaje'
import type { Simulacion } from '../engine/simulation'
import type { RobotDoc } from '../robots/doc'
import { CALIDADES, CalidadContexto, type NivelCalidad } from './calidad'

export type ModoCamara = 'libre' | 'seguir' | 'arriba'
/** Pedido de zoom desde los botones (+/−): cada pedido nuevo (n distinto) acerca o aleja la cámara. */
export interface PedidoZoom { n: number; factor: number }

function Estudio({ intensidad = 1 }: { intensidad?: number }) {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2 * intensidad} position={[0, 5, -2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2.5} />
      <Lightformer form="rect" intensity={1.2 * intensidad} position={[-5, 2, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.2 * intensidad} position={[5, 2, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
          </Environment>
  )
}

function Luces({ sombras, tamSombra, alcance }: { sombras: boolean; tamSombra: number; alcance: number }) {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#94a3b8', 0.55]} />
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
      className="lab-escena"
      gl={{ antialias: nivel !== 'baja', powerPreference: 'high-performance', alpha: true }}
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

/** Mesa de trabajo: piso de estudio claro con cuadrícula fina (1 cm) y gruesa (5 cm). */
function Mesa() {
  return (
    <group>
      <mesh position={[0, -0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#e6eaf0" roughness={0.95} />
      </mesh>
      <gridHelper args={[1.2, 120, '#d3d9e2', '#d3d9e2']} position={[0, 0.0002, 0]} />
      <gridHelper args={[1.2, 24, '#bcc5d1', '#bcc5d1']} position={[0, 0.0003, 0]} />
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
      <Estudio />
      <Luces sombras={q.sombras} tamSombra={q.tamSombra} alcance={0.5} />
      <Mesa />
      <ContactShadows position={[0, 0.0012, 0]} scale={0.8} blur={2.4} opacity={0.4} far={0.3} resolution={q.nivel === 'baja' ? 256 : 512} />
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

/** Dohyo: plataforma negra con borde blanco y las dos líneas de salida (shikiri). */
function Dohyo({ radio, borde, altura, onDoubleClick }: { radio: number; borde: number; altura: number; onDoubleClick: (e: ThreeEvent<MouseEvent>) => void }) {
  return (
    <group>
      <mesh position={[0, -altura / 2, 0]} castShadow receiveShadow onDoubleClick={onDoubleClick}>
        <cylinderGeometry args={[radio, radio, altura, 96]} />
        <meshStandardMaterial color="#0b0b0e" roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0006, 0]} receiveShadow>
        <ringGeometry args={[radio - borde, radio, 96]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
      </mesh>
      {[-1, 1].map(s => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * radio * 0.13, 0.0007, 0]}>
          <planeGeometry args={[radio * 0.026, radio * 0.26]} />
          <meshStandardMaterial color="#7c4a22" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

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

  // Mesa de electrónica: el mismo escritorio con tapete de corte del taller.
  if (arena.banco) return <Mesa />

  const bajo = arena.mesa ? -arena.mesa.altura : arena.dohyo ? -arena.dohyo.altura : 0
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, bajo - 0.0005, 0]} receiveShadow onDoubleClick={arena.mesa ? undefined : colocar}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#e6eaf0" roughness={0.95} />
      </mesh>
      <gridHelper args={[14, 70, '#c4ccd7', '#d3d9e2']} position={[0, bajo, 0]} />
      {arena.mesa && (
        <group>
          <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[arena.ancho, 0.04, arena.largo]} />
            <meshStandardMaterial color="#8a6240" roughness={0.7} />
          </mesh>
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx * (arena.ancho / 2 - 0.05), bajo / 2 - 0.02, sz * (arena.largo / 2 - 0.05)]} castShadow>
              <boxGeometry args={[0.05, -bajo - 0.04, 0.05]} />
              <meshStandardMaterial color="#5b3f28" roughness={0.75} />
            </mesh>
          ))}
        </group>
      )}
      {arena.meta && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[arena.meta.x, 0.0012, arena.meta.z]}>
          <circleGeometry args={[arena.meta.radio, 48]} />
          <meshStandardMaterial color="#16a34a" transparent opacity={0.75} roughness={0.6} />
        </mesh>
      )}
      {arena.dohyo && <Dohyo {...arena.dohyo} onDoubleClick={colocar} />}
      {!arena.dohyo && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0004, 0]} receiveShadow onDoubleClick={colocar}>
        <planeGeometry args={[arena.ancho, arena.largo]} />
        {textura
          ? <meshStandardMaterial map={textura} roughness={0.8} />
          : <meshStandardMaterial color={arena.piso.color} roughness={0.75} />}
      </mesh>}
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

/** Polvo de la sala del robot aspirador: cada celda sucia es una mancha; las limpias se borran. */
function Polvo({ sim, version }: { sim: Simulacion; version: number }) {
  const limpieza = sim.limpieza
  const lienzo = useMemo(() => {
    if (!limpieza) return null
    const canvas = document.createElement('canvas')
    canvas.width = limpieza.cols
    canvas.height = limpieza.filas
    const textura = new THREE.CanvasTexture(canvas)
    textura.colorSpace = THREE.SRGBColorSpace
    // Cada celda con un tono un poco distinto, para que parezca suciedad y no una grilla.
    const tono = Array.from({ length: limpieza.celdas.length }, (_, i) => {
      const r = Math.sin(i * 12.9898) * 43758.5453
      return r - Math.floor(r)
    })
    return { canvas, textura, tono, dibujada: -1 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limpieza, version])
  useEffect(() => () => lienzo?.textura.dispose(), [lienzo])

  useFrame(() => {
    if (!limpieza || !lienzo || lienzo.dibujada === limpieza.version) return
    lienzo.dibujada = limpieza.version
    const ctx = lienzo.canvas.getContext('2d')!
    const img = ctx.createImageData(limpieza.cols, limpieza.filas)
    for (let i = 0; i < limpieza.celdas.length; i++) {
      const t = lienzo.tono[i]
      img.data[i * 4] = 70 + t * 30
      img.data[i * 4 + 1] = 60 + t * 25
      img.data[i * 4 + 2] = 45 + t * 20
      img.data[i * 4 + 3] = limpieza.celdas[i] === 1 ? 120 + t * 90 : 0
    }
    ctx.putImageData(img, 0, 0)
    lienzo.textura.needsUpdate = true
  })

  if (!limpieza || !lienzo) return null
  return (
    // El canvas va de z = −largo/2 (fila 0, arriba) a +largo/2: el plano acostado lo pone así.
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0009, 0]} receiveShadow>
      <planeGeometry args={[sim.arena.ancho, sim.arena.largo]} />
      <meshStandardMaterial map={lienzo.textura} transparent depthWrite={false} roughness={1} />
    </mesh>
  )
}

/** Rastro del recorrido del robot. */
function Rastro({ sim, version }: { sim: Simulacion; version: number }) {
  const MAX = 1500
  const linea = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3))
    geo.setDrawRange(0, 0)
    const mat = new THREE.LineBasicMaterial({ color: '#2563eb', transparent: true, opacity: 0.8 })
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

function ControlCamara({ sim, modo, zoom }: { sim: Simulacion; modo: ModoCamara; zoom?: PedidoZoom }) {
  const controles = useRef<React.ElementRef<typeof OrbitControls>>(null)
  const { camera } = useThree()
  const deseada = useMemo(() => new THREE.Vector3(), [])
  const objetivo = useMemo(() => new THREE.Vector3(), [])

  const banco = !!sim.arena.banco
  useEffect(() => {
    const p = sim.fisica.body.translation()
    // Mesa de electrónica: encuadrar todo lo que hay (protoboard, placa y, si está, la maqueta).
    // Con sensor ultrasónico, también el lugar de la mano; y un margen a la derecha para el panel.
    const r = banco ? resumen(sim.doc) : null
    const minX = r ? r.min.x : 0
    const maxX = r ? r.max.x + (sim.plan.ultrasonidos.length ? 130 : 0) + 40 : 0
    const cx = (minX + maxX) / 2000
    const k = r ? Math.max(1, (maxX - minX) / 1000 / 0.28) : 1
    if (modo === 'arriba') {
      // En la mesa de electrónica, «arriba» es mirar la protoboard desde encima.
      if (banco) { camera.position.set(p.x + cx, 0.36 * k, p.z + 0.001); controles.current?.target.set(p.x + cx, 0, p.z) }
      else { camera.position.set(0, Math.max(sim.arena.ancho, sim.arena.largo) * 0.95, 0.001); controles.current?.target.set(0, 0, 0) }
    } else if (modo === 'libre') {
      if (banco) { camera.position.set(p.x + cx - 0.01, 0.16 * k, p.z + 0.2 * k); controles.current?.target.set(p.x + cx, 0.005 * k, p.z) }
      else { camera.position.set(p.x - 0.6, 0.55, p.z + 0.6); controles.current?.target.set(p.x, 0.03, p.z) }
    }
    controles.current?.update()
  }, [modo, camera, sim, banco])

  // Botones de zoom: acercar o alejar la cámara hacia lo que mira (dentro de los límites).
  useEffect(() => {
    const c = controles.current
    if (!zoom?.n || !c) return
    const t = c.target
    const v = camera.position.clone().sub(t)
    const d = Math.min(c.maxDistance, Math.max(c.minDistance, v.length() * zoom.factor))
    camera.position.copy(t).add(v.setLength(d))
    c.update()
  }, [zoom, camera])

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
      minDistance={banco ? 0.05 : 0.12}
      maxDistance={banco ? 1.2 : 7}
      enableDamping
    />
  )
}

export function EscenaArena({ sim, modoCamara, versionArena, nivel, onNivel, zoom }: { sim: Simulacion; modoCamara: ModoCamara; versionArena: number; nivel: NivelCalidad; onNivel: (n: NivelCalidad) => void; zoom?: PedidoZoom }) {
  const q = CALIDADES[nivel]
  return (
    <Lienzo nivel={nivel} onNivel={onNivel} camara={[-1.1, 0.9, 1.3]}>
      <fog attach="fog" args={['#e4e9f0', 6, 16]} />
      <Estudio intensidad={0.6} />
      <Luces sombras={q.sombras} tamSombra={q.tamSombra} alcance={2.2} />
      <PisoArena sim={sim} version={versionArena} />
      {sim.limpieza && <Polvo sim={sim} version={versionArena} />}
      {!sim.arena.banco && !sim.limpieza && <Rastro sim={sim} version={versionArena} />}
      <Robot3D doc={sim.doc} sim={sim} />
      {sim.arena.banco && sim.plan.ultrasonidos.length > 0 && <Mano3D sim={sim} />}
      {sim.competencia && <Robot3D doc={sim.competencia.rival.doc} sim={sim.competencia.rival} />}
      <ControlCamara sim={sim} modo={modoCamara} zoom={zoom} />
    </Lienzo>
  )
}
