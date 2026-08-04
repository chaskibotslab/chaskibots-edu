'use client'

import { useState, useRef, useMemo, Suspense } from 'react'
import Image from 'next/image'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Center } from '@react-three/drei'
import * as THREE from 'three'
import {
  Box, Cylinder, Triangle, Circle, Hexagon, Eye,
  RotateCcw, Download, Sliders, Type, Palette,
  ChevronRight, Info, Sparkles, Brain, Cpu,
  Layers, Plus, Trash2, Move, ZoomIn, Sun, Moon,
  Cog, Wrench, Loader2
} from 'lucide-react'

// ============================================================
// TYPES
// ============================================================
type LabTab = 'viewer' | 'builder' | 'text2cad'

interface ShapeConfig {
  id: string
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'capsule' | 'ring'
  color: string
  metalness: number
  roughness: number
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  // Type-specific params
  width?: number
  height?: number
  depth?: number
  radius?: number
  tubeRadius?: number
  radialSegments?: number
  animate?: boolean
}

// ============================================================
// CONSTANTS
// ============================================================
const SHAPE_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
  '#14B8A6', '#E11D48'
]

const PRESET_MODELS: { name: string; emoji: string; desc: string; shapes: ShapeConfig[] }[] = [
  {
    name: 'Brazo Robótico',
    emoji: '🦾',
    desc: 'Brazo articulado con 3 segmentos',
    shapes: [
      { id: 'base', type: 'cylinder', color: '#6366F1', metalness: 0.8, roughness: 0.2, position: [0, -1.2, 0], rotation: [0, 0, 0], scale: [1, 1, 1], radius: 1.2, height: 0.4, radialSegments: 32 },
      { id: 'joint1', type: 'sphere', color: '#8B5CF6', metalness: 0.7, roughness: 0.3, position: [0, -0.8, 0], rotation: [0, 0, 0], scale: [0.5, 0.5, 0.5], radius: 1 },
      { id: 'arm1', type: 'box', color: '#A78BFA', metalness: 0.6, roughness: 0.3, position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.4, 1.6, 0.4], width: 1, height: 1, depth: 1 },
      { id: 'joint2', type: 'sphere', color: '#8B5CF6', metalness: 0.7, roughness: 0.3, position: [0, 0.9, 0], rotation: [0, 0, 0], scale: [0.4, 0.4, 0.4], radius: 1 },
      { id: 'arm2', type: 'box', color: '#C4B5FD', metalness: 0.5, roughness: 0.3, position: [0.7, 1.2, 0], rotation: [0, 0, -0.8], scale: [0.3, 1.2, 0.3], width: 1, height: 1, depth: 1 },
      { id: 'gripper', type: 'cone', color: '#EF4444', metalness: 0.6, roughness: 0.2, position: [1.3, 1.8, 0], rotation: [0, 0, -1.2], scale: [0.3, 0.6, 0.3], radius: 1, height: 1 },
    ]
  },
  {
    name: 'Engranaje',
    emoji: '⚙️',
    desc: 'Engranaje mecánico con dientes',
    shapes: [
      { id: 'gear-body', type: 'cylinder', color: '#F59E0B', metalness: 0.9, roughness: 0.1, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 1.5, height: 0.3, radialSegments: 24, animate: true },
      { id: 'gear-hole', type: 'cylinder', color: '#1e1e2e', metalness: 0, roughness: 1, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 0.4, height: 0.35, radialSegments: 6 },
      { id: 'tooth1', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [1.7, 0, 0], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth2', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [-1.7, 0, 0], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth3', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [0, 0, 1.7], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth4', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [0, 0, -1.7], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth5', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [1.2, 0, 1.2], rotation: [0, Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth6', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [-1.2, 0, -1.2], rotation: [0, Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth7', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [-1.2, 0, 1.2], rotation: [0, -Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'tooth8', type: 'box', color: '#FCD34D', metalness: 0.85, roughness: 0.15, position: [1.2, 0, -1.2], rotation: [0, -Math.PI / 4, 0], scale: [0.3, 0.3, 0.3] },
    ]
  },
  {
    name: 'Robot Simple',
    emoji: '🤖',
    desc: 'Robot educativo con cabeza y cuerpo',
    shapes: [
      { id: 'body', type: 'box', color: '#3B82F6', metalness: 0.6, roughness: 0.3, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1.2, 1.6, 0.8] },
      { id: 'head', type: 'box', color: '#60A5FA', metalness: 0.5, roughness: 0.4, position: [0, 1.3, 0], rotation: [0, 0, 0], scale: [0.9, 0.9, 0.9] },
      { id: 'eye-l', type: 'sphere', color: '#EF4444', metalness: 0.3, roughness: 0.5, position: [-0.25, 1.4, 0.45], rotation: [0, 0, 0], scale: [0.15, 0.15, 0.15], radius: 1 },
      { id: 'eye-r', type: 'sphere', color: '#EF4444', metalness: 0.3, roughness: 0.5, position: [0.25, 1.4, 0.45], rotation: [0, 0, 0], scale: [0.15, 0.15, 0.15], radius: 1 },
      { id: 'antenna', type: 'cylinder', color: '#F59E0B', metalness: 0.7, roughness: 0.2, position: [0, 2.0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], radius: 0.05, height: 0.6, radialSegments: 8 },
      { id: 'ant-tip', type: 'sphere', color: '#F59E0B', metalness: 0.8, roughness: 0.1, position: [0, 2.35, 0], rotation: [0, 0, 0], scale: [0.12, 0.12, 0.12], radius: 1 },
      { id: 'arm-l', type: 'box', color: '#2563EB', metalness: 0.5, roughness: 0.3, position: [-0.9, 0.1, 0], rotation: [0, 0, 0.2], scale: [0.25, 1.2, 0.25] },
      { id: 'arm-r', type: 'box', color: '#2563EB', metalness: 0.5, roughness: 0.3, position: [0.9, 0.1, 0], rotation: [0, 0, -0.2], scale: [0.25, 1.2, 0.25] },
      { id: 'leg-l', type: 'box', color: '#1D4ED8', metalness: 0.5, roughness: 0.3, position: [-0.35, -1.3, 0], rotation: [0, 0, 0], scale: [0.3, 1, 0.35] },
      { id: 'leg-r', type: 'box', color: '#1D4ED8', metalness: 0.5, roughness: 0.3, position: [0.35, -1.3, 0], rotation: [0, 0, 0], scale: [0.3, 1, 0.35] },
    ]
  },
  {
    name: 'Rueda con Eje',
    emoji: '🛞',
    desc: 'Componente mecánico básico',
    shapes: [
      { id: 'wheel', type: 'torus', color: '#1e293b', metalness: 0.3, roughness: 0.8, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], radius: 1.2, tubeRadius: 0.35, radialSegments: 24, animate: true },
      { id: 'hub', type: 'cylinder', color: '#94A3B8', metalness: 0.8, roughness: 0.2, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 0.5, height: 0.4, radialSegments: 16 },
      { id: 'axle', type: 'cylinder', color: '#CBD5E1', metalness: 0.9, roughness: 0.1, position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [1, 1, 1], radius: 0.1, height: 2.5, radialSegments: 12, animate: true },
    ]
  },
]

// ============================================================
// TEXT-TO-3D PARSER (Spanish → ShapeConfig[])
// ============================================================
function parseText(input: string): ShapeConfig[] {
  const text = input.toLowerCase().trim()
  const shapes: ShapeConfig[] = []
  let xOffset = 0

  // Detect color
  const colorMap: Record<string, string> = {
    rojo: '#EF4444', azul: '#3B82F6', verde: '#10B981', amarillo: '#F59E0B',
    morado: '#8B5CF6', rosado: '#EC4899', naranja: '#F97316', cyan: '#06B6D4',
    blanco: '#F1F5F9', negro: '#1e293b', gris: '#6B7280', dorado: '#FCD34D',
    plateado: '#CBD5E1', violeta: '#7C3AED', rosa: '#F472B6', turquesa: '#2DD4BF',
  }
  const sizeMap: Record<string, number> = {
    'muy pequeño': 0.3, pequeño: 0.5, mediano: 1, grande: 1.5, 'muy grande': 2, enorme: 2.5, gigante: 3,
  }
  const materialMap: Record<string, { metalness: number; roughness: number }> = {
    'metálico': { metalness: 0.9, roughness: 0.1 }, metal: { metalness: 0.9, roughness: 0.1 },
    brillante: { metalness: 0.7, roughness: 0.2 }, mate: { metalness: 0.1, roughness: 0.9 },
    cristal: { metalness: 0.2, roughness: 0.05 }, madera: { metalness: 0, roughness: 0.95 },
    plástico: { metalness: 0.1, roughness: 0.6 },
  }

  // Split by common connectors
  const parts = text.split(/(?:,|\sy\s|\scon\s|\smás\s|\s\+\s|\ssobre\s|\sal lado de\s)/g).filter(Boolean)

  for (const part of parts) {
    const p = part.trim()
    if (!p) continue

    // Determine type
    let type: ShapeConfig['type'] = 'box'
    if (/esfera|bola|pelota|balón|planeta|órbita/.test(p)) type = 'sphere'
    else if (/cilindro|tubo|pilar|columna|palo/.test(p)) type = 'cylinder'
    else if (/cono|pirámide|triángulo|punta/.test(p)) type = 'cone'
    else if (/torus|anillo|dona|rosquilla|aro|rueda|llanta/.test(p)) type = 'torus'
    else if (/cápsula|pastilla|óvalo/.test(p)) type = 'capsule'
    else if (/cubo|caja|bloque|ladrillo|rectángulo/.test(p)) type = 'box'
    // Compound objects
    else if (/robot/.test(p)) {
      shapes.push(...PRESET_MODELS[2].shapes.map(s => ({ ...s, id: `${s.id}-${Date.now()}`, position: [s.position[0] + xOffset, s.position[1], s.position[2]] as [number, number, number] })))
      xOffset += 3
      continue
    } else if (/engranaje|gear/.test(p)) {
      shapes.push(...PRESET_MODELS[1].shapes.map(s => ({ ...s, id: `${s.id}-${Date.now()}`, position: [s.position[0] + xOffset, s.position[1], s.position[2]] as [number, number, number] })))
      xOffset += 4
      continue
    } else if (/brazo/.test(p)) {
      shapes.push(...PRESET_MODELS[0].shapes.map(s => ({ ...s, id: `${s.id}-${Date.now()}`, position: [s.position[0] + xOffset, s.position[1], s.position[2]] as [number, number, number] })))
      xOffset += 3
      continue
    } else if (/rueda|llanta/.test(p)) {
      shapes.push(...PRESET_MODELS[3].shapes.map(s => ({ ...s, id: `${s.id}-${Date.now()}`, position: [s.position[0] + xOffset, s.position[1], s.position[2]] as [number, number, number] })))
      xOffset += 3
      continue
    }

    // Find color
    let color = SHAPE_COLORS[shapes.length % SHAPE_COLORS.length]
    for (const [name, hex] of Object.entries(colorMap)) {
      if (p.includes(name)) { color = hex; break }
    }

    // Find size
    let size = 1
    for (const [name, s] of Object.entries(sizeMap)) {
      if (p.includes(name)) { size = s; break }
    }

    // Find material
    let metalness = 0.4, roughness = 0.5
    for (const [name, mat] of Object.entries(materialMap)) {
      if (p.includes(name)) { metalness = mat.metalness; roughness = mat.roughness; break }
    }

    // Animate?
    const animate = /girar|rotar|animar|movimiento|gira|rota/.test(p)

    shapes.push({
      id: `shape-${Date.now()}-${shapes.length}`,
      type,
      color,
      metalness,
      roughness,
      position: [xOffset, 0, 0],
      rotation: [0, 0, 0],
      scale: [size, size, size],
      radius: 1,
      height: 1,
      tubeRadius: 0.35,
      radialSegments: 32,
      animate,
    })
    xOffset += size * 2.5
  }

  return shapes.length > 0 ? shapes : [{
    id: 'default',
    type: 'box',
    color: '#3B82F6',
    metalness: 0.4,
    roughness: 0.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  }]
}

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
  const [tab, setTab] = useState<LabTab>('viewer')
  const [darkMode, setDarkMode] = useState(true)

  // Viewer state
  const [selectedPreset, setSelectedPreset] = useState(0)

  // Builder state
  const [builderShapes, setBuilderShapes] = useState<ShapeConfig[]>([
    { id: 'init-box', type: 'box', color: '#3B82F6', metalness: 0.5, roughness: 0.4, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], width: 1, height: 1, depth: 1 }
  ])
  const [selectedShapeIdx, setSelectedShapeIdx] = useState(0)

  // Text-to-3D state
  const [textInput, setTextInput] = useState('')
  const [generatedShapes, setGeneratedShapes] = useState<ShapeConfig[]>([])
  const [textExamples] = useState([
    'una esfera roja grande y un cubo azul metálico',
    'un robot con un engranaje al lado',
    'tres cilindros verdes pequeños y un cono amarillo gigante',
    'un torus dorado brillante que gira, más una caja negra mate',
    'un brazo robótico con una rueda',
    'esfera de cristal, cubo de madera, cilindro metálico',
  ])

  // Current scene shapes
  const currentShapes = tab === 'viewer' ? PRESET_MODELS[selectedPreset].shapes
    : tab === 'builder' ? builderShapes
    : generatedShapes

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

  // Generate from text
  const generateFromText = () => {
    if (!textInput.trim()) return
    const parsed = parseText(textInput)
    setGeneratedShapes(parsed)
  }

  // Export scene as JSON
  const exportScene = () => {
    const data = { shapes: currentShapes, exportedAt: new Date().toISOString() }
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
    { id: 'viewer' as LabTab, label: 'Visor 3D', icon: Eye, desc: 'Explora modelos prediseñados' },
    { id: 'builder' as LabTab, label: 'Constructor', icon: Sliders, desc: 'Crea figuras con parámetros' },
    { id: 'text2cad' as LabTab, label: 'Texto → 3D', icon: Type, desc: 'Describe y genera en 3D' },
  ]

  return (
    <div className="bg-[#1e1e2e] rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#181825] via-[#1a1a2e] to-[#181825] border-b border-gray-700/50">
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
          <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 transition-colors">
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button onClick={exportScene} className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium flex items-center gap-1 hover:bg-cyan-500/30 transition-colors">
            <Download className="w-3 h-3" /> Exportar
          </button>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="flex bg-[#181825] border-b border-gray-700/50">
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
      <div className="flex" style={{ height: 520 }}>
        {/* 3D CANVAS */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [4, 3, 6], fov: 50 }}
            style={{ background: darkMode ? '#0f0f1a' : '#e2e8f0' }}
          >
            <Suspense fallback={null}>
              <Scene shapes={currentShapes} darkMode={darkMode} />
            </Suspense>
          </Canvas>
          {/* Overlay hints */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Arrastrar para rotar</span>
            <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Scroll para zoom</span>
          </div>
          {currentShapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-500 text-sm">Escena vacía — agrega figuras</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 bg-[#181825] border-l border-gray-700/50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">

            {/* ── VIEWER TAB PANEL ── */}
            {tab === 'viewer' && (
              <>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Explora modelos 3D de piezas de robótica. Haz clic en un modelo para verlo. Usa el mouse para rotar y la rueda para hacer zoom.
                  </p>
                </div>
                <h4 className="text-white text-xs font-bold">Modelos Disponibles</h4>
                <div className="space-y-1.5">
                  {PRESET_MODELS.map((model, idx) => (
                    <button
                      key={idx}
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
                          <div className="text-gray-500 text-[10px]">{model.desc}</div>
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-600 mt-1">{model.shapes.length} piezas</div>
                    </button>
                  ))}
                </div>
                <div className="bg-gray-700/20 rounded-lg p-2.5">
                  <h5 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Info del modelo</h5>
                  <div className="text-[10px] text-gray-500 space-y-0.5">
                    <div>Piezas: <span className="text-white">{PRESET_MODELS[selectedPreset].shapes.length}</span></div>
                    <div>Tipos: <span className="text-white">{new Set(PRESET_MODELS[selectedPreset].shapes.map(s => s.type)).size}</span></div>
                    <div>Animadas: <span className="text-white">{PRESET_MODELS[selectedPreset].shapes.filter(s => s.animate).length}</span></div>
                  </div>
                </div>
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

            {/* ── TEXT-TO-3D TAB PANEL ── */}
            {tab === 'text2cad' && (
              <>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-green-300 text-[10px] font-bold">¿Cómo funciona?</h4>
                    <p className="text-gray-400 text-[10px] leading-relaxed mt-0.5">
                      Escribe una descripción en español y el parser genera las figuras 3D automáticamente. 
                      Puedes usar colores, tamaños, materiales y formas combinadas.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-[10px] font-bold uppercase tracking-wider mb-1 block">Describe tu modelo</label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ej: una esfera roja grande y un cubo azul metálico..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-white placeholder:text-gray-500 focus:border-green-500/50 focus:outline-none resize-none"
                  />
                  <button
                    onClick={generateFromText}
                    disabled={!textInput.trim()}
                    className="mt-2 w-full px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 justify-center"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generar 3D
                  </button>
                </div>

                {/* Examples */}
                <div>
                  <h4 className="text-gray-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">Ejemplos</h4>
                  <div className="space-y-1">
                    {textExamples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => { setTextInput(ex); }}
                        className="w-full text-left px-2.5 py-1.5 bg-gray-700/20 hover:bg-gray-700/40 text-gray-400 hover:text-gray-300 rounded-lg text-[10px] transition-colors"
                      >
                        &quot;{ex}&quot;
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated info */}
                {generatedShapes.length > 0 && (
                  <div className="bg-gray-700/20 rounded-lg p-2.5">
                    <h5 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Resultado</h5>
                    <div className="text-[10px] text-gray-500 space-y-0.5">
                      <div>Figuras generadas: <span className="text-white">{generatedShapes.length}</span></div>
                      <div>Tipos: <span className="text-white">{Array.from(new Set(generatedShapes.map(s => s.type))).join(', ')}</span></div>
                    </div>
                  </div>
                )}

                {/* Supported vocabulary */}
                <div className="bg-gray-700/10 rounded-lg p-2.5">
                  <h5 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Vocabulario Soportado</h5>
                  <div className="text-[9px] text-gray-600 space-y-1">
                    <div><span className="text-gray-400">Formas:</span> cubo, esfera, cilindro, cono, torus, robot, engranaje, brazo, rueda</div>
                    <div><span className="text-gray-400">Colores:</span> rojo, azul, verde, amarillo, morado, naranja, dorado, plateado...</div>
                    <div><span className="text-gray-400">Tamaños:</span> pequeño, mediano, grande, enorme, gigante</div>
                    <div><span className="text-gray-400">Material:</span> metálico, brillante, mate, cristal, madera, plástico</div>
                    <div><span className="text-gray-400">Acción:</span> girar, rotar, animar</div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
