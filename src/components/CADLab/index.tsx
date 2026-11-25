'use client'

import { useState, useRef, useMemo, Suspense, type ReactNode } from 'react'
import Image from 'next/image'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Center } from '@react-three/drei'
import * as THREE from 'three'
import {
  Eye, RotateCcw, Download, Sliders,
  Info, Trash2, Move, ZoomIn, Sun, Moon,
  Cog, Send, Box, Maximize2, Minimize2
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useExpand } from '@/hooks/useExpand'
import EnviarTarea from '@/components/simuladores/EnviarTarea'
import VoxelBuilder, { VoxelMap } from './VoxelBuilder'
import TinkerEditor, { TShape } from './TinkerEditor'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'

// Geometría base por tipo (igual que en TinkerEditor) para construir y exportar el STL.
function geomDeTipo(type: TShape['type']): THREE.BufferGeometry {
  switch (type) {
    case 'sphere': return new THREE.SphereGeometry(0.6, 32, 32)
    case 'cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32)
    case 'cone': return new THREE.ConeGeometry(0.6, 1.2, 32)
    case 'torus': return new THREE.TorusGeometry(0.5, 0.2, 16, 32)
    case 'pyramid': return new THREE.ConeGeometry(0.7, 1.2, 4)
    case 'prism': return new THREE.CylinderGeometry(0.7, 0.7, 1.2, 3)
    case 'tetra': return new THREE.TetrahedronGeometry(0.8)
    case 'octa': return new THREE.OctahedronGeometry(0.8)
    case 'dodeca': return new THREE.DodecahedronGeometry(0.8)
    case 'icosa': return new THREE.IcosahedronGeometry(0.8)
    case 'capsule': return new THREE.CapsuleGeometry(0.4, 0.8, 8, 16)
    case 'dome': return new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    case 'wheel': return new THREE.CylinderGeometry(0.7, 0.7, 0.3, 32)
    case 'knot': return new THREE.TorusKnotGeometry(0.4, 0.15, 80, 10)
    default: return new THREE.BoxGeometry(1, 1, 1)
  }
}

// ============================================================
// MODELOS REALES (formato del editor) — para el Visor y para "Abrir en Diseñar"
// ============================================================
export interface Modelo {
  id: string
  name: string
  emoji: string
  description: string
  piezas: TShape[]
  guia: string[]
}

// Atajo para crear una pieza del modelo.
function pz(
  id: string, type: TShape['type'], color: string,
  position: [number, number, number], scale: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0], hole = false,
): TShape {
  return { id, type, color, position, rotation, scale, hole }
}

function construirModelos(): Modelo[] {
  // ⚙️ Engranaje con dientes alrededor y hueco central
  const engr: TShape[] = [pz('g-disco', 'wheel', '#9aa7b8', [0, 0.4, 0], [1.5, 0.6, 1.5])]
  const dientes = 12
  for (let i = 0; i < dientes; i++) {
    const a = (i / dientes) * Math.PI * 2
    engr.push(pz('g-d' + i, 'box', '#9aa7b8', [Math.cos(a) * 1.05, 0.4, Math.sin(a) * 1.05], [0.26, 0.5, 0.34], [0, -a, 0]))
  }
  engr.push(pz('g-hueco', 'cylinder', '#94a3b8', [0, 0.4, 0], [0.55, 1.3, 0.55], [0, 0, 0], true))

  // 🚁 Dron: cuerpo + 2 brazos cruzados + 4 motores con hélices
  const dron: TShape[] = [
    pz('dr-cuerpo', 'box', '#334155', [0, 1, 0], [0.9, 0.3, 0.9]),
    pz('dr-cupula', 'dome', '#38bdf8', [0, 1.15, 0], [0.5, 0.5, 0.5]),
    pz('dr-brazoA', 'box', '#475569', [0, 1, 0], [2.6, 0.12, 0.16], [0, Math.PI / 4, 0]),
    pz('dr-brazoB', 'box', '#475569', [0, 1, 0], [2.6, 0.12, 0.16], [0, -Math.PI / 4, 0]),
  ]
  const r = 0.92
  const esq: [number, number][] = [[r, r], [r, -r], [-r, r], [-r, -r]]
  esq.forEach(([x, z], i) => {
    dron.push(pz('dr-m' + i, 'cylinder', '#0f172a', [x, 1.05, z], [0.14, 0.2, 0.14]))
    dron.push(pz('dr-h' + i, 'wheel', '#94a3b8', [x, 1.2, z], [0.55, 0.1, 0.55]))
  })

  // 🚗 Carrito con 4 ruedas
  const carro: TShape[] = [
    pz('c-chasis', 'box', '#ef4444', [0, 0.62, 0], [2.4, 0.4, 1.1]),
    pz('c-cabina', 'box', '#dc2626', [-0.1, 1.05, 0], [1.2, 0.55, 0.95]),
    pz('c-faro', 'box', '#fde68a', [1.22, 0.62, 0], [0.08, 0.2, 0.7]),
  ]
  const ruedas: [number, number][] = [[0.8, 0.58], [0.8, -0.58], [-0.8, 0.58], [-0.8, -0.58]]
  ruedas.forEach(([x, z], i) => carro.push(pz('c-r' + i, 'wheel', '#111827', [x, 0.4, z], [0.5, 0.5, 0.5], [Math.PI / 2, 0, 0])))

  // 🤖 Robot
  const robot: TShape[] = [
    pz('r-cuerpo', 'box', '#38bdf8', [0, 1.4, 0], [1.2, 1.4, 0.7]),
    pz('r-cabeza', 'box', '#e2e8f0', [0, 2.5, 0], [0.85, 0.7, 0.75]),
    pz('r-ojoL', 'sphere', '#0f172a', [-0.2, 2.55, 0.38], [0.16, 0.16, 0.16]),
    pz('r-ojoR', 'sphere', '#0f172a', [0.2, 2.55, 0.38], [0.16, 0.16, 0.16]),
    pz('r-antena', 'cylinder', '#f59e0b', [0, 3.0, 0], [0.06, 0.4, 0.06]),
    pz('r-bola', 'sphere', '#ef4444', [0, 3.3, 0], [0.13, 0.13, 0.13]),
    pz('r-brazoL', 'cylinder', '#94a3b8', [-0.85, 1.4, 0], [0.18, 0.9, 0.18], [0, 0, 0.12]),
    pz('r-brazoR', 'cylinder', '#94a3b8', [0.85, 1.4, 0], [0.18, 0.9, 0.18], [0, 0, -0.12]),
    pz('r-piernaL', 'cylinder', '#475569', [-0.35, 0.5, 0], [0.22, 0.8, 0.22]),
    pz('r-piernaR', 'cylinder', '#475569', [0.35, 0.5, 0], [0.22, 0.8, 0.22]),
  ]

  // 🦾 Brazo robótico
  const brazo: TShape[] = [
    pz('b-base', 'cylinder', '#475569', [0, 0.25, 0], [1.2, 0.4, 1.2]),
    pz('b-eje', 'cylinder', '#334155', [0, 0.6, 0], [0.5, 0.5, 0.5]),
    pz('b-seg1', 'box', '#38bdf8', [0, 1.3, 0], [0.35, 1.5, 0.35]),
    pz('b-junta', 'sphere', '#f59e0b', [0, 2.05, 0], [0.3, 0.3, 0.3]),
    pz('b-seg2', 'box', '#38bdf8', [0.55, 2.35, 0], [1.2, 0.3, 0.3], [0, 0, -0.45]),
    pz('b-pinzaA', 'box', '#94a3b8', [1.1, 2.6, 0.12], [0.35, 0.12, 0.1], [0, 0, -0.45]),
    pz('b-pinzaB', 'box', '#94a3b8', [1.1, 2.6, -0.12], [0.35, 0.12, 0.1], [0, 0, -0.45]),
  ]

  // 🔑 Llavero (placa + anilla + hueco para colgar)
  const llavero: TShape[] = [
    pz('l-placa', 'box', '#22c55e', [0, 0.3, 0], [2.0, 0.25, 0.9]),
    pz('l-anilla', 'torus', '#16a34a', [-1.1, 0.3, 0], [0.5, 0.5, 0.5]),
    pz('l-hueco', 'cylinder', '#94a3b8', [-1.1, 0.3, 0], [0.22, 1.0, 0.22], [0, 0, 0], true),
  ]

  // 🏠 Casa (con puerta y ventana como huecos)
  const casa: TShape[] = [
    pz('h-paredes', 'box', '#fbbf24', [0, 0.8, 0], [1.8, 1.6, 1.6]),
    pz('h-techo', 'pyramid', '#b91c1c', [0, 2.0, 0], [1.7, 1.2, 1.6], [0, Math.PI / 4, 0]),
    pz('h-puerta', 'box', '#78350f', [0, 0.55, 0.82], [0.5, 1.0, 0.5], [0, 0, 0], true),
    pz('h-ventana', 'box', '#78350f', [0.55, 1.1, 0.82], [0.4, 0.4, 0.5], [0, 0, 0], true),
  ]

  return [
    { id: 'robot', name: 'Robot', emoji: '🤖', description: 'Cuerpo, cabeza, brazos y piernas', piezas: robot, guia: ['Cuerpo: una caja grande.', 'Cabeza: una caja encima.', 'Ojos: dos esferas pequeñas al frente.', 'Brazos y piernas: cilindros a los lados.', 'Antena: cilindro fino + esfera. ¡Genera el STL!'] },
    { id: 'carro', name: 'Carrito', emoji: '🚗', description: 'Chasis, cabina y 4 ruedas', piezas: carro, guia: ['Chasis: una caja alargada.', 'Cabina: una caja más pequeña encima.', 'Ruedas: 4 "ruedas" giradas 90°, una en cada esquina.', 'Faro: una cajita amarilla al frente.', 'Ajusta el tamaño y genera el STL para imprimir.'] },
    { id: 'dron', name: 'Dron', emoji: '🚁', description: 'Cuerpo, brazos y 4 hélices', piezas: dron, guia: ['Cuerpo: una caja plana.', 'Brazos: dos cajas largas cruzadas en X.', 'Motores: un cilindro en cada punta.', 'Hélices: una "rueda" delgada sobre cada motor.', 'Cúpula: una media esfera arriba.'] },
    { id: 'brazo', name: 'Brazo robótico', emoji: '🦾', description: 'Base giratoria, brazo y pinza', piezas: brazo, guia: ['Base: cilindro ancho y bajo.', 'Brazo: una caja vertical larga.', 'Junta: una esfera naranja.', 'Antebrazo: una caja inclinada.', 'Pinza: dos cajitas al final.'] },
    { id: 'engranaje', name: 'Engranaje', emoji: '⚙️', description: 'Disco con dientes y hueco central', piezas: engr, guia: ['Disco: una "rueda" aplanada.', 'Dientes: 12 cajitas alrededor del borde.', 'Hueco: un cilindro marcado como HUECO en el centro.', 'Al generar el STL, el hueco atraviesa el disco.', 'Así se hacen piezas que encajan en un eje.'] },
    { id: 'llavero', name: 'Llavero', emoji: '🔑', description: 'Placa con anilla y hueco', piezas: llavero, guia: ['Placa: una caja plana (puedes ponerle tu nombre después).', 'Anilla: una dona (torus) a un lado.', 'Hueco: un cilindro HUECO para pasar la cuerda.', 'Genera el STL: ¡listo para imprimir y colgar!'] },
    { id: 'casa', name: 'Casa', emoji: '🏠', description: 'Paredes, techo, puerta y ventana', piezas: casa, guia: ['Paredes: una caja grande.', 'Techo: una pirámide encima.', 'Puerta y ventana: cajas marcadas como HUECO.', 'Los huecos abren la puerta y la ventana al generar el STL.'] },
  ]
}

const MODELOS: Modelo[] = construirModelos()

// Malla de una pieza del modelo (respeta "hueco" mostrándola transparente).
function PiezaModelo({ s }: { s: TShape }) {
  const geo = useMemo(() => geomDeTipo(s.type), [s.type])
  return (
    <mesh geometry={geo} position={s.position} rotation={s.rotation} scale={s.scale}>
      {s.hole
        ? <meshStandardMaterial color="#94a3b8" transparent opacity={0.3} depthWrite={false} />
        : <meshStandardMaterial color={s.color} metalness={0.15} roughness={0.5} />}
    </mesh>
  )
}

function GrupoGira({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.3 })
  return <group ref={ref}>{children}</group>
}

function ModeloViewer({ piezas, darkMode }: { piezas: TShape[]; darkMode: boolean }) {
  return (
    <Canvas camera={{ position: [5, 4, 7], fov: 50 }} style={{ background: darkMode ? '#0f0f1a' : '#e2e8f0' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 10, 6]} intensity={1} />
      <directionalLight position={[-4, 4, -4]} intensity={0.3} />
      <GrupoGira>
        {piezas.map(s => <PiezaModelo key={s.id} s={s} />)}
      </GrupoGira>
      <Grid position={[0, 0, 0]} args={[20, 20]} cellSize={0.5} cellThickness={0.5} cellColor={darkMode ? '#1e293b' : '#CBD5E1'} sectionSize={2} sectionColor={darkMode ? '#334155' : '#94A3B8'} fadeDistance={22} infiniteGrid />
      <OrbitControls enablePan enableZoom minDistance={3} maxDistance={24} />
      <Environment preset={darkMode ? 'night' : 'studio'} />
    </Canvas>
  )
}

// ============================================================
// TYPES
// ============================================================
type LabTab = 'disenar' | 'voxel' | 'viewer' | 'builder'

interface ShapeConfig {
  id: string
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'capsule' | 'ring'
  color: string
  metalness: number
  roughness: number
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  width?: number
  height?: number
  depth?: number
  radius?: number
  tubeRadius?: number
  radialSegments?: number
  animate?: boolean
}

interface CadPreset {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  shapes: ShapeConfig[]
}

// ============================================================
// CONSTANTS
// ============================================================
const SHAPE_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
  '#14B8A6', '#E11D48'
]

// ============================================================
// 3D SHAPE COMPONENT
// ============================================================
function Shape3D({ config }: { config: ShapeConfig }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (config.animate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  const geometry = useMemo(() => {
    const segs = config.radialSegments || 32
    switch (config.type) {
      case 'sphere': return new THREE.SphereGeometry(config.radius || 1, segs, segs)
      case 'cylinder': return new THREE.CylinderGeometry(config.radius || 0.5, config.radius || 0.5, config.height || 1, segs)
      case 'cone': return new THREE.ConeGeometry(config.radius || 0.5, config.height || 1, segs)
      case 'torus': return new THREE.TorusGeometry(config.radius || 1, config.tubeRadius || 0.35, 16, segs)
      case 'capsule': return new THREE.CapsuleGeometry(config.radius || 0.5, config.height || 1, 8, segs)
      default: return new THREE.BoxGeometry(config.width || 1, config.height || 1, config.depth || 1)
    }
  }, [config])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={config.position}
      rotation={config.rotation}
      scale={config.scale}
    >
      <meshStandardMaterial
        color={config.color}
        metalness={config.metalness}
        roughness={config.roughness}
      />
    </mesh>
  )
}

// ============================================================
// SCENE COMPONENT
// ============================================================
function Scene({ shapes, darkMode }: { shapes: ShapeConfig[]; darkMode: boolean }) {
  return (
    <>
      <ambientLight intensity={darkMode ? 0.3 : 0.5} />
      <directionalLight position={[5, 8, 5]} intensity={darkMode ? 0.8 : 1.2} castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#93C5FD" />

      <Center>
        {shapes.map(shape => (
          <Shape3D key={shape.id} config={shape} />
        ))}
      </Center>

      <Grid
        position={[0, -2, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor={darkMode ? '#1e293b' : '#CBD5E1'}
        sectionSize={2}
        sectionThickness={1}
        sectionColor={darkMode ? '#334155' : '#94A3B8'}
        fadeDistance={15}
        infiniteGrid
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={2}
        maxDistance={20}
        autoRotate={false}
      />
      <Environment preset={darkMode ? 'night' : 'studio'} />
    </>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CADLab() {
  const { user } = useAuth()
  const { expanded, toggle, shellClass } = useExpand()
  const [tab, setTab] = useState<LabTab>('disenar')
  const [darkMode, setDarkMode] = useState(true)
  const [tinkerShapes, setTinkerShapes] = useState<TShape[]>([
    { id: 't-base', type: 'box', color: '#38bdf8', position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [2, 0.4, 2] },
    { id: 't-top', type: 'cylinder', color: '#f59e0b', position: [0, 1.3, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  ])
  const [tinkerSel, setTinkerSel] = useState<string | null>('t-top')
  const [tinkerHist, setTinkerHist] = useState<TShape[][]>([])
  const [showGrid, setShowGrid] = useState(true)
  // Guarda el estado actual antes de un arrastre, para que "Deshacer" funcione.
  const snapTinker = () => setTinkerHist(h => [...h.slice(-19), tinkerShapes])
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [voxels, setVoxels] = useState<VoxelMap>(() => {
    // Ejemplo inicial para que el alumno vea algo y entienda cómo se construye.
    const v: VoxelMap = {}
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) v[`${x},0,${z}`] = '#3b82f6'
    v['0,1,0'] = '#ef4444'
    return v
  })
  const [voxelColor, setVoxelColor] = useState('#3b82f6')
  const [voxelModo, setVoxelModo] = useState<'poner' | 'borrar'>('poner')

  // Visor 3D: modelos propios bien construidos (en código, siempre funcionan)
  const modelos = MODELOS
  const [selectedPreset, setSelectedPreset] = useState(0)
  const modeloSel = modelos[selectedPreset]
  // Guía del proyecto cargado en "Diseñar" (id del modelo), para mostrar los pasos.
  const [guiaActiva, setGuiaActiva] = useState<string | null>(null)

  // Carga un modelo como punto de partida editable en el editor.
  const cargarProyecto = (m: Modelo) => {
    setTinkerHist(h => [...h.slice(-19), tinkerShapes])
    setTinkerShapes(m.piezas.map(p => ({ ...p, position: [...p.position] as [number, number, number], rotation: [...p.rotation] as [number, number, number], scale: [...p.scale] as [number, number, number] })))
    setTinkerSel(m.piezas[0]?.id || null)
    setGuiaActiva(m.id)
  }
  // Desde el Visor: abrir el modelo seleccionado en "Diseñar" para editarlo y fabricarlo.
  const abrirEnDisenar = () => { if (modeloSel) { cargarProyecto(modeloSel); setTab('disenar') } }

  // Builder state
  const [builderShapes, setBuilderShapes] = useState<ShapeConfig[]>([
    { id: 'init-box', type: 'box', color: '#3B82F6', metalness: 0.5, roughness: 0.4, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], width: 1, height: 1, depth: 1 }
  ])
  const [selectedShapeIdx, setSelectedShapeIdx] = useState(0)

  // Builder: add shape
  const addShape = (type: ShapeConfig['type']) => {
    const newShape: ShapeConfig = {
      id: `shape-${Date.now()}`,
      type,
      color: SHAPE_COLORS[builderShapes.length % SHAPE_COLORS.length],
      metalness: 0.4,
      roughness: 0.5,
      position: [builderShapes.length * 2, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      width: 1, height: 1, depth: 1,
      radius: 0.5, tubeRadius: 0.2,
      radialSegments: 32,
    }
    setBuilderShapes(prev => [...prev, newShape])
    setSelectedShapeIdx(builderShapes.length)
  }

  const removeShape = (idx: number) => {
    setBuilderShapes(prev => prev.filter((_, i) => i !== idx))
    if (selectedShapeIdx >= builderShapes.length - 1) setSelectedShapeIdx(Math.max(0, builderShapes.length - 2))
  }

  const updateShape = (idx: number, updates: Partial<ShapeConfig>) => {
    setBuilderShapes(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s))
  }

  // Export scene as JSON
  const exportScene = () => {
    const data = tab === 'disenar' ? { tinker: tinkerShapes, exportedAt: new Date().toISOString() } : tab === 'voxel' ? { voxels, exportedAt: new Date().toISOString() } : { modelo: modeloSel?.id, piezas: modeloSel?.piezas, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chaskibots-cad-scene.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedShape = builderShapes[selectedShapeIdx]

  const tabs = [
    { id: 'disenar' as LabTab, label: 'Diseñar', icon: Sliders, desc: 'Figuras: mover, girar, escalar' },
    { id: 'voxel' as LabTab, label: 'Construye', icon: Box, desc: 'Arma con bloques (fácil)' },
    { id: 'viewer' as LabTab, label: 'Visor 3D', icon: Eye, desc: 'Explora modelos prediseñados' },
  ]

  return (
    <div className={`bg-labdark-surface rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl ${shellClass}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-labdark-bg via-labdark-bg2 to-labdark-bg border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <Image src="/chaski.png" alt="ChaskiBots" width={28} height={28} className="rounded-lg" />
          <div>
            <h2 className="text-white text-sm font-bold flex items-center gap-2">
              <Cog className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
              Laboratorio CAD 3D
            </h2>
            <p className="text-[10px] text-gray-500">ChaskiBots Lab — Diseño y Modelado 3D Interactivo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 transition-colors" title="Fondo claro/oscuro">
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button onClick={toggle} className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 transition-colors" title={expanded ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}>
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={exportScene} className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium flex items-center gap-1 hover:bg-cyan-500/30 transition-colors">
            <Download className="w-3 h-3" /> Exportar
          </button>
          <EnviarTarea
            simulador="Diseño 3D"
            sigla="3D"
            botonClassName="text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors disabled:opacity-70 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
            obtenerEntrega={() => ({
              output: tab === 'disenar'
                ? `Diseño 3D (Tinkercad): ${tinkerShapes.length} figura(s)`
                : tab === 'voxel'
                ? `Construcción con ${Object.keys(voxels).length} bloques`
                : `Modelo del visor: ${modeloSel?.name || '—'}`,
              files: tab === 'disenar' ? { tinker: tinkerShapes } : tab === 'voxel' ? { voxels } : { piezas: modeloSel?.piezas },
            })}
          />
        </div>
      </div>

      {/* TAB BAR */}
      <div className="flex bg-labdark-bg border-b border-gray-700/50">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-medium transition-all border-b-2 ${
                tab === t.id
                  ? 'text-cyan-400 border-cyan-400 bg-white/5'
                  : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <div className="text-left">
                <div>{t.label}</div>
                <div className="text-[9px] opacity-60">{t.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* CONTENT */}
      <div className="flex" style={{ height: expanded ? 'calc(100vh - 118px)' : 520 }}>
        {/* 3D CANVAS */}
        <div className="flex-1 relative">
          {tab === 'disenar' ? (
            <TinkerEditor shapes={tinkerShapes} setShapes={setTinkerShapes} selectedId={tinkerSel} setSelectedId={setTinkerSel} darkMode={darkMode} showGrid={showGrid} onBeforeChange={snapTinker} />
          ) : tab === 'voxel' ? (
            <VoxelBuilder voxels={voxels} color={voxelColor} modo={voxelModo} setVoxels={setVoxels} />
          ) : (
            <Suspense fallback={null}>
              <ModeloViewer piezas={modeloSel?.piezas || []} darkMode={darkMode} />
            </Suspense>
          )}
          {/* Overlay hints */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Arrastrar para rotar</span>
            <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Scroll para zoom</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 bg-labdark-bg border-l border-gray-700/50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">

            {/* ── DISEÑAR (TINKERCAD) ── */}
            {tab === 'disenar' && (() => {
              const sel = tinkerShapes.find(s => s.id === tinkerSel) || null
              const snap = () => setTinkerHist(h => [...h.slice(-19), tinkerShapes])
              const deshacer = () => setTinkerHist(h => { if (!h.length) return h; setTinkerShapes(h[h.length - 1]); setTinkerSel(null); return h.slice(0, -1) })
              const addShape = (type: TShape['type']) => {
                snap()
                const id = 't' + Date.now().toString(36)
                setTinkerShapes(prev => [...prev, { id, type, color: '#38bdf8', position: [0, 0.6, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }])
                setTinkerSel(id)
              }
              const dupSel = () => {
                if (!sel) return
                snap()
                const id = 't' + Date.now().toString(36)
                setTinkerShapes(prev => [...prev, { ...sel, id, position: [sel.position[0] + 1, sel.position[1], sel.position[2] + 1] }])
                setTinkerSel(id)
              }
              const delSel = () => { if (!sel) return; snap(); setTinkerShapes(prev => prev.filter(s => s.id !== sel.id)); setTinkerSel(null) }
              const setColor = (c: string) => { if (!sel) return; setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, color: c } : s)) }
              const setField = (field: 'position' | 'scale', axis: number, val: number) => {
                if (!sel) return
                setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, [field]: s[field].map((v, i) => i === axis ? val : v) as [number, number, number] } : s))
              }
              const espejo = (axis: number) => {
                if (!sel) return
                snap()
                setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, scale: s.scale.map((v, i) => i === axis ? -v : v) as [number, number, number] } : s))
              }
              const ponerEnPiso = () => { if (!sel) return; snap(); setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, position: [s.position[0], Math.abs(s.scale[1]) * 0.5, s.position[2]] } : s)) }
              const girar45 = () => { if (!sel) return; snap(); setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, rotation: [s.rotation[0], s.rotation[1] + Math.PI / 4, s.rotation[2]] } : s)) }
              const toggleHole = () => { if (!sel) return; snap(); setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, hole: !s.hole } : s)) }
              const construirGeo = (s: TShape) => {
                const g = geomDeTipo(s.type)
                const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(s.rotation[0], s.rotation[1], s.rotation[2]))
                const mtx = new THREE.Matrix4().compose(new THREE.Vector3(s.position[0], s.position[1], s.position[2]), q, new THREE.Vector3(Math.abs(s.scale[0]) || 0.1, Math.abs(s.scale[1]) || 0.1, Math.abs(s.scale[2]) || 0.1))
                g.applyMatrix4(mtx)
                g.deleteAttribute('uv')
                g.computeVertexNormals()
                return g
              }
              const descargarSTL = (geom: THREE.BufferGeometry) => {
                geom.computeVertexNormals()
                const stl = new STLExporter().parse(new THREE.Mesh(geom))
                const blob = new Blob([stl], { type: 'model/stl' })
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'diseno-chaskibots.stl'; a.click(); URL.revokeObjectURL(a.href)
              }
              const generarSTL = () => {
                if (tinkerShapes.length === 0) return
                const solidos = tinkerShapes.filter(s => !s.hole).map(construirGeo)
                const huecos = tinkerShapes.filter(s => s.hole).map(construirGeo)
                if (solidos.length === 0) return
                const base = mergeGeometries(solidos, false)
                if (!base) return
                if (huecos.length === 0) { descargarSTL(base); return }
                try {
                  const ev = new Evaluator(); ev.attributes = ['position', 'normal']
                  let res = new Brush(base); res.updateMatrixWorld()
                  for (const h of huecos) {
                    const hb = new Brush(h); hb.updateMatrixWorld()
                    res = ev.evaluate(res, hb, SUBTRACTION)
                  }
                  descargarSTL(res.geometry)
                } catch {
                  // Si la resta falla, al menos exporta los sólidos.
                  descargarSTL(base)
                }
              }
              const figuras: { t: TShape['type']; e: string; n: string }[] = [
                { t: 'box', e: '🧊', n: 'Cubo' }, { t: 'sphere', e: '⚪', n: 'Esfera' }, { t: 'cylinder', e: '🥫', n: 'Cilindro' },
                { t: 'cone', e: '🔺', n: 'Cono' }, { t: 'pyramid', e: '🔻', n: 'Pirámide' }, { t: 'prism', e: '📐', n: 'Prisma' },
                { t: 'torus', e: '🍩', n: 'Dona' }, { t: 'knot', e: '🥨', n: 'Nudo' }, { t: 'capsule', e: '💊', n: 'Cápsula' },
                { t: 'dome', e: '⛺', n: 'Cúpula' }, { t: 'wheel', e: '🛞', n: 'Rueda' }, { t: 'tetra', e: '🔸', n: 'Tetra' },
                { t: 'octa', e: '🔷', n: 'Octa' }, { t: 'dodeca', e: '⬡', n: 'Dodeca' }, { t: 'icosa', e: '✴️', n: 'Icosa' },
              ]
              return (
                <>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
                    <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-400 text-[10px] leading-relaxed">Agrega figuras, tócalas para seleccionarlas y usa las <b className="text-cyan-300">manijas</b> para mover, girar o escalar. Arrastra el fondo para rotar la cámara.</p>
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold mb-1.5">Agregar figura</h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {figuras.map(f => (
                        <button key={f.t} onClick={() => addShape(f.t)} className="py-2 rounded-lg text-[11px] font-medium bg-gray-700/40 text-gray-200 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors flex flex-col items-center gap-0.5">
                          <span className="text-base leading-none">{f.e}</span>{f.n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 text-[11px] text-cyan-100 leading-snug">
                    <span className="font-bold">Manipula la figura directo:</span> arrastra el <b>cuerpo</b> para moverla, una <b>esquina blanca</b> para agrandar/encoger, el <b>anillo verde</b> para girar y la <b>flecha naranja</b> para subirla o bajarla.
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={deshacer} disabled={tinkerHist.length === 0} className="py-1.5 rounded-lg text-[11px] font-medium bg-gray-700/40 text-gray-200 hover:bg-gray-700/60 disabled:opacity-40">↶ Deshacer</button>
                    <button onClick={girar45} disabled={!sel} className="py-1.5 rounded-lg text-[11px] font-medium bg-gray-700/40 text-gray-200 hover:bg-gray-700/60 disabled:opacity-40">↻ Girar 45°</button>
                    <button onClick={ponerEnPiso} disabled={!sel} className="py-1.5 rounded-lg text-[11px] font-medium bg-gray-700/40 text-gray-200 hover:bg-gray-700/60 disabled:opacity-40">⬇ Al piso</button>
                    <button onClick={() => setShowGrid(g => !g)} className="py-1.5 rounded-lg text-[11px] font-medium bg-gray-700/40 text-gray-200 hover:bg-gray-700/60">{showGrid ? '▦ Rejilla: sí' : '▢ Rejilla: no'}</button>
                  </div>
                  {sel ? (
                    <div className="space-y-2 bg-gray-700/20 rounded-lg p-2.5">
                      <div className="text-[11px] text-gray-300 font-bold">Figura seleccionada</div>
                      <div className="flex flex-wrap gap-1.5">
                        {['#ef4444', '#f59e0b', '#22c55e', '#38bdf8', '#a855f7', '#ec4899', '#ffffff', '#6b4f2a'].map(c => (
                          <button key={c} onClick={() => setColor(c)} style={{ background: c }} className={`w-6 h-6 rounded-md border-2 ${sel.color === c ? 'border-white' : 'border-black/30'}`} />
                        ))}
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Posición</div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['X', 'Y', 'Z'] as const).map((ax, i) => (
                            <input key={'p' + ax} type="number" step={0.5} value={Math.round(sel.position[i] * 100) / 100} onChange={e => setField('position', i, parseFloat(e.target.value) || 0)} className="w-full px-1 py-0.5 bg-gray-800 border border-gray-600/50 rounded text-[10px] text-gray-200" title={'Posición ' + ax} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Tamaño</div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['X', 'Y', 'Z'] as const).map((ax, i) => (
                            <input key={'s' + ax} type="number" step={0.25} min={0.1} value={Math.round(Math.abs(sel.scale[i]) * 100) / 100} onChange={e => setField('scale', i, parseFloat(e.target.value) || 0.1)} className="w-full px-1 py-0.5 bg-gray-800 border border-gray-600/50 rounded text-[10px] text-gray-200" title={'Tamaño ' + ax} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Tamaño general — arrastra para agrandar/achicar</div>
                        <input type="range" min={0.2} max={4} step={0.05} value={Math.abs(sel.scale[0])} onChange={e => { const v = parseFloat(e.target.value); setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, scale: [v, v, v] } : s)) }} className="w-full accent-cyan-500" />
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['X', 'Y', 'Z'] as const).map((ax, i) => (
                          <button key={'m' + ax} onClick={() => espejo(i)} className="py-1 rounded text-[10px] font-medium bg-gray-700/40 text-gray-200 hover:bg-gray-700/60">⇋ Espejo {ax}</button>
                        ))}
                      </div>
                      <button onClick={toggleHole} className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-colors ${sel.hole ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40' : 'bg-gray-700/40 text-gray-200 hover:bg-gray-700/60'}`}>
                        {sel.hole ? '🧊 Volver sólido' : '🕳️ Hacer hueco (resta/perfora)'}
                      </button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button onClick={dupSel} className="py-1.5 rounded-lg text-[11px] font-medium bg-gray-700/40 text-gray-200 hover:bg-gray-700/60">Duplicar</button>
                        <button onClick={delSel} className="py-1.5 rounded-lg text-[11px] font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> Borrar</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500">Toca una figura en la escena para editarla.</p>
                  )}
                  <div>
                    <h4 className="text-white text-xs font-bold mb-1.5">🏗️ Proyectos para fabricar</h4>
                    <p className="text-[10px] text-gray-500 mb-1.5">Carga uno, modifícalo a tu gusto y genera el STL para imprimir.</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {MODELOS.map(m => (
                        <button key={m.id} onClick={() => cargarProyecto(m)} className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${guiaActiva === m.id ? 'bg-cyan-500/25 text-cyan-100 border border-cyan-500/40' : 'bg-gray-700/40 text-gray-200 hover:bg-cyan-500/20 hover:text-cyan-200'}`}>
                          <span>{m.emoji}</span> {m.name}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const m = MODELOS.find(x => x.id === guiaActiva)
                      if (!m) return null
                      return (
                        <div className="mt-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2">
                          <div className="text-[11px] text-cyan-200 font-bold mb-1">{m.emoji} Guía: {m.name}</div>
                          <ol className="text-[10px] text-gray-300 space-y-0.5 list-decimal list-inside">
                            {m.guia.map((g, i) => <li key={i}>{g}</li>)}
                          </ol>
                        </div>
                      )
                    })()}
                  </div>
                  <button onClick={generarSTL} disabled={tinkerShapes.filter(s => !s.hole).length === 0} className="w-full py-2 rounded-lg text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Generar STL (une sólidos y resta huecos)
                  </button>
                  <div className="text-[10px] text-gray-500">Figuras: <span className="text-white font-bold">{tinkerShapes.length}</span> · Huecos: <span className="text-amber-300 font-bold">{tinkerShapes.filter(s => s.hole).length}</span> · El STL une los sólidos y perfora los huecos para impresión 3D.</div>
                </>
              )
            })()}

            {/* ── CONSTRUYE (BLOQUES) ── */}
            {tab === 'voxel' && (
              <>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-[10px] leading-relaxed">Clic en el piso o sobre un bloque para <b className="text-cyan-300">poner</b>. Cambia a <b className="text-cyan-300">borrar</b> para quitar. Arrastra para rotar, rueda para zoom.</p>
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold mb-1.5">Color del bloque</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ffffff', '#6b4f2a'].map(col => (
                      <button key={col} onClick={() => setVoxelColor(col)} style={{ background: col }} className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${voxelColor === col ? 'border-white' : 'border-black/30'}`} aria-label={col} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => setVoxelModo('poner')} className={`py-2 rounded-lg text-xs font-bold transition-colors ${voxelModo === 'poner' ? 'bg-cyan-500 text-white' : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700/60'}`}>🧱 Poner</button>
                  <button onClick={() => setVoxelModo('borrar')} className={`py-2 rounded-lg text-xs font-bold transition-colors ${voxelModo === 'borrar' ? 'bg-red-500 text-white' : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700/60'}`}>🧽 Borrar</button>
                </div>
                <button onClick={() => setVoxels({})} className="w-full py-2 rounded-lg text-xs font-medium bg-gray-700/40 text-gray-300 hover:bg-red-500/20 hover:text-red-300 flex items-center justify-center gap-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Vaciar todo</button>
                <div>
                  <h4 className="text-white text-xs font-bold mb-1.5">🎯 Retos y guías</h4>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="bg-gray-700/20 rounded p-2">🏠 Construye una <b>casa</b> con paredes y techo.</div>
                    <div className="bg-gray-700/20 rounded p-2">🌳 Haz un <b>árbol</b>: tronco café y copa verde.</div>
                    <div className="bg-gray-700/20 rounded p-2">🤖 Arma un <b>robot</b> con cabeza, cuerpo y brazos.</div>
                    <div className="bg-gray-700/20 rounded p-2">🚗 Un <b>carro</b> con 4 ruedas.</div>
                    <div className="bg-gray-700/20 rounded p-2">⭐ <b>Libre:</b> crea lo que imagines y pulsa «Enviar al profesor».</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500">Bloques colocados: <span className="text-white font-bold">{Object.keys(voxels).length}</span></div>
              </>
            )}

            {/* ── VIEWER TAB PANEL ── */}
            {tab === 'viewer' && (
              <>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Explora modelos reales. Elige uno y pulsa <b className="text-cyan-300">Abrir en Diseñar</b> para modificarlo y generar su STL para imprimir.
                  </p>
                </div>
                <button onClick={abrirEnDisenar} className="w-full py-2 rounded-lg text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-400 flex items-center justify-center gap-1">
                  ✏️ Abrir «{modeloSel?.name}» en Diseñar
                </button>
                <h4 className="text-white text-xs font-bold">Modelos</h4>
                <div className="space-y-1.5">
                  {modelos.map((model, idx) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedPreset(idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        selectedPreset === idx
                          ? 'bg-cyan-500/15 border border-cyan-500/30'
                          : 'bg-gray-700/20 hover:bg-gray-700/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{model.emoji}</span>
                        <div>
                          <div className="text-gray-200 text-xs font-medium">{model.name}</div>
                          <div className="text-gray-500 text-[10px]">{model.description}</div>
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-600 mt-1">{model.piezas.length} piezas</div>
                    </button>
                  ))}
                </div>
                {modeloSel && (
                  <div className="bg-gray-700/20 rounded-lg p-2.5">
                    <h5 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Cómo está hecho</h5>
                    <ol className="text-[10px] text-gray-400 space-y-1 list-decimal list-inside">
                      {modeloSel.guia.map((g, i) => <li key={i}>{g}</li>)}
                    </ol>
                  </div>
                )}
              </>
            )}

            {/* ── BUILDER TAB PANEL ── */}
            {tab === 'builder' && (
              <>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Agrega figuras 3D y ajusta sus parámetros. Aprende sobre geometría, materiales y transformaciones 3D.
                  </p>
                </div>

                {/* Add shape buttons */}
                <div>
                  <h4 className="text-gray-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">Agregar Figura</h4>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { type: 'box' as const, label: 'Cubo', icon: '◻' },
                      { type: 'sphere' as const, label: 'Esfera', icon: '◯' },
                      { type: 'cylinder' as const, label: 'Cilindro', icon: '⬭' },
                      { type: 'cone' as const, label: 'Cono', icon: '△' },
                      { type: 'torus' as const, label: 'Torus', icon: '◎' },
                    ].map(s => (
                      <button
                        key={s.type}
                        onClick={() => addShape(s.type)}
                        className="px-2 py-1 bg-gray-700/40 hover:bg-purple-500/20 text-gray-400 hover:text-purple-300 rounded-md text-[10px] transition-colors flex items-center gap-1"
                      >
                        <span>{s.icon}</span> {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape list */}
                <div>
                  <h4 className="text-gray-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">Figuras ({builderShapes.length})</h4>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {builderShapes.map((s, idx) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedShapeIdx(idx)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                          selectedShapeIdx === idx ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-gray-700/20 hover:bg-gray-700/40'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-300 text-[10px] flex-1">{s.type}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeShape(idx) }} className="text-gray-600 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected shape properties */}
                {selectedShape && (
                  <div className="space-y-2.5">
                    <h4 className="text-gray-300 text-[10px] font-bold uppercase tracking-wider">Propiedades</h4>

                    {/* Color */}
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Color</label>
                      <div className="flex flex-wrap gap-1">
                        {SHAPE_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updateShape(selectedShapeIdx, { color: c })}
                            className={`w-5 h-5 rounded-md border-2 transition-all ${selectedShape.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Scale */}
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis}>
                        <label className="text-[10px] text-gray-500 flex justify-between">
                          <span>Escala {axis}</span>
                          <span className="text-gray-400">{selectedShape.scale[i].toFixed(1)}</span>
                        </label>
                        <input
                          type="range" min={0.1} max={3} step={0.1}
                          value={selectedShape.scale[i]}
                          onChange={(e) => {
                            const newScale = [...selectedShape.scale] as [number, number, number]
                            newScale[i] = Number(e.target.value)
                            updateShape(selectedShapeIdx, { scale: newScale })
                          }}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none accent-purple-500"
                        />
                      </div>
                    ))}

                    {/* Position */}
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={`pos-${axis}`}>
                        <label className="text-[10px] text-gray-500 flex justify-between">
                          <span>Posición {axis}</span>
                          <span className="text-gray-400">{selectedShape.position[i].toFixed(1)}</span>
                        </label>
                        <input
                          type="range" min={-5} max={5} step={0.1}
                          value={selectedShape.position[i]}
                          onChange={(e) => {
                            const newPos = [...selectedShape.position] as [number, number, number]
                            newPos[i] = Number(e.target.value)
                            updateShape(selectedShapeIdx, { position: newPos })
                          }}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none accent-purple-500"
                        />
                      </div>
                    ))}

                    {/* Material */}
                    <div>
                      <label className="text-[10px] text-gray-500 flex justify-between">
                        <span>Metalness</span><span className="text-gray-400">{selectedShape.metalness.toFixed(1)}</span>
                      </label>
                      <input type="range" min={0} max={1} step={0.1} value={selectedShape.metalness}
                        onChange={(e) => updateShape(selectedShapeIdx, { metalness: Number(e.target.value) })}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none accent-purple-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 flex justify-between">
                        <span>Rugosidad</span><span className="text-gray-400">{selectedShape.roughness.toFixed(1)}</span>
                      </label>
                      <input type="range" min={0} max={1} step={0.1} value={selectedShape.roughness}
                        onChange={(e) => updateShape(selectedShapeIdx, { roughness: Number(e.target.value) })}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none accent-purple-500" />
                    </div>

                    {/* Animate toggle */}
                    <button
                      onClick={() => updateShape(selectedShapeIdx, { animate: !selectedShape.animate })}
                      className={`w-full text-[10px] px-2.5 py-1.5 rounded-lg transition-colors ${
                        selectedShape.animate ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-700/40 text-gray-500'
                      }`}
                    >
                      {selectedShape.animate ? '⟳ Animación activa' : '○ Sin animación'}
                    </button>
                  </div>
                )}

                <button onClick={() => setBuilderShapes([])} className="w-full text-[10px] px-2.5 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-gray-500 rounded-lg transition-colors flex items-center gap-1 justify-center">
                  <RotateCcw className="w-3 h-3" /> Limpiar escena
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
