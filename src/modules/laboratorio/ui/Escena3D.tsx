'use client'

// Escenas 3D del laboratorio: el taller (mesa de trabajo) y la arena de
// pruebas. El entorno (aula, luces, materiales, postprocesado) vive en
// ui/entorno; aquí se componen con el robot, el rastro y la cámara.

import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Robot3D, { type MarcadorMontaje } from './Robot3D'
import Mano3D from './modelos/Mano3D'
import Sensores3D from './Sensores3D'
import { resumen } from '../engine/ensamblaje'
import type { Simulacion } from '../engine/simulation'
import type { RobotDoc } from '../robots/doc'
import { CALIDADES, CalidadContexto, type NivelCalidad } from './calidad'
import { Efectos, Estudio, Luces, Sala } from './entorno/Entorno'
import { Arena3D, GROSOR_PISO } from './entorno/Arena3D'
import { ALTURA_MESA, Mesa3D } from './entorno/Mesa3D'

export type ModoCamara = 'libre' | 'seguir' | 'arriba' | 'robot'
/** Pedido de zoom desde los botones (+/−): cada pedido nuevo (n distinto) acerca o aleja la cámara. */
export interface PedidoZoom { n: number; factor: number }

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
      <Sala y={-ALTURA_MESA} lado={6} alto={2.6} />
      <Mesa3D />
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
      <Efectos />
    </Lienzo>
  )
}

// ---------------------------------------------------------------------------
// Arena de pruebas
// ---------------------------------------------------------------------------

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
      else {
        // Con paredes altas (combate) la cámara va por encima de ellas y hacia el centro, no detrás de la pared.
        const altas = (sim.arena.paredesAlto ?? 0) > 0.2
        const hacia = Math.hypot(p.x, p.z) > 0.05 ? Math.atan2(p.z, p.x) : -Math.PI / 4
        if (altas) camera.position.set(p.x + Math.cos(hacia) * 1.1, 0.95, p.z + Math.sin(hacia) * 1.1)
        else camera.position.set(p.x - 0.6, 0.55, p.z + 0.6)
        controles.current?.target.set(p.x, 0.03, p.z)
      }
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

  // Cámara «robot»: montada en el frente del robot, por encima de su pieza más alta, mirando el piso de adelante.
  const tamano = useMemo(() => resumen(sim.doc), [sim])
  useFrame(() => {
    if (!sim.fisica) return
    if (modo === 'robot') {
      const o = sim.fisica.puntoMundo({ x: tamano.max.x - 15, y: tamano.max.y + 25, z: 0 })
      const t = sim.fisica.puntoMundo({ x: tamano.max.x + 500, y: 0, z: 0 })
      camera.position.set(o.x, o.y, o.z)
      camera.up.set(0, 1, 0)
      camera.lookAt(t.x, t.y, t.z)
      return
    }
    if (modo !== 'seguir') return
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
      enabled={modo !== 'robot'}
      enableRotate={modo !== 'arriba'}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={banco ? 0.05 : 0.12}
      maxDistance={banco ? 1.2 : 7}
      enableDamping
    />
  )
}

/**
 * Arrastrar el robot por el piso con el mouse (con el programa detenido o en
 * pausa): mientras se arrastra, la cámara no gira. Doble clic en el piso sigue
 * funcionando. Con el programa corriendo no hace nada: primero hay que pausar.
 */
function ArrastreRobot({ sim, children }: { sim: Simulacion; children: ReactNode }) {
  const { controls, gl } = useThree()
  const plano = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const punto = useMemo(() => new THREE.Vector3(), [])
  const arrastrando = useRef(false)
  const puede = () => !sim.tieneProgramaCorriendo || sim.pausado
  const habilitar = (si: boolean) => { const c = controls as unknown as { enabled: boolean } | null; if (c) c.enabled = si }
  return (
    <group
      onPointerDown={e => {
        if (!puede() || e.button !== 0) return
        e.stopPropagation()
        arrastrando.current = true
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
        habilitar(false)
        gl.domElement.style.cursor = 'grabbing'
      }}
      onPointerMove={e => {
        if (!arrastrando.current) return
        if (e.ray.intersectPlane(plano, punto)) sim.colocarRobot({ x: punto.x, z: punto.z, yaw: sim.fisica.pose().yaw })
      }}
      onPointerUp={e => {
        if (!arrastrando.current) return
        arrastrando.current = false
        ;(e.target as Element).releasePointerCapture?.(e.pointerId)
        habilitar(true)
        gl.domElement.style.cursor = puede() ? 'grab' : ''
      }}
      onPointerOver={() => { if (puede()) gl.domElement.style.cursor = 'grab' }}
      onPointerOut={() => { if (!arrastrando.current) gl.domElement.style.cursor = '' }}
    >
      {children}
    </group>
  )
}

/** Altura del piso del aula respecto del plano de la arena (y = 0). */
export function pisoAula(arena: Simulacion['arena']): number {
  if (arena.banco) return -ALTURA_MESA
  if (arena.mesa) return -arena.mesa.altura
  if (arena.dohyo) return -arena.dohyo.altura
  if (arena.pozo) return 0
  return -GROSOR_PISO
}

export function EscenaArena({ sim, modoCamara, versionArena, nivel, onNivel, zoom, sensores = false }: { sim: Simulacion; modoCamara: ModoCamara; versionArena: number; nivel: NivelCalidad; onNivel: (n: NivelCalidad) => void; zoom?: PedidoZoom; sensores?: boolean }) {
  const q = CALIDADES[nivel]
  const arena = sim.arena
  const bajo = pisoAula(arena)
  // Doble clic sobre el piso: poner el robot ahí (mantiene su orientación).
  const colocar = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    sim.colocarRobot({ x: e.point.x, z: e.point.z, yaw: sim.fisica.pose().yaw })
  }
  return (
    <Lienzo nivel={nivel} onNivel={onNivel} camara={[-1.1, 0.9, 1.3]}>
      <Estudio intensidad={0.6} />
      <Luces sombras={q.sombras} tamSombra={q.tamSombra} alcance={arena.banco ? 0.5 : 2.2} />
      <Sala y={bajo} lado={arena.banco ? 6 : 18} alto={arena.banco ? 2.6 : 3.2} pozo={arena.pozo} onDoubleClick={arena.mesa || arena.banco ? undefined : colocar} />
      {arena.banco ? <Mesa3D /> : <Arena3D sim={sim} version={versionArena} bajo={bajo} onColocar={colocar} />}
      {sim.limpieza && <Polvo sim={sim} version={versionArena} />}
      {!arena.banco && !sim.limpieza && <Rastro sim={sim} version={versionArena} />}
      {arena.banco ? <Robot3D doc={sim.doc} sim={sim} /> : <ArrastreRobot sim={sim}><Robot3D doc={sim.doc} sim={sim} /></ArrastreRobot>}
      {sensores && !arena.banco && <Sensores3D sim={sim} />}
      {arena.banco && sim.plan.ultrasonidos.length > 0 && <Mano3D sim={sim} />}
      {sim.competencia && <Robot3D doc={sim.competencia.rival.doc} sim={sim.competencia.rival} />}
      <ControlCamara sim={sim} modo={modoCamara} zoom={zoom} />
      <Efectos />
    </Lienzo>
  )
}
