'use client'

import { useState, useRef, useMemo, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Center } from '@react-three/drei'
import * as THREE from 'three'
import {
  Eye, RotateCcw, Download, Sliders,
  Info, Trash2, Move, ZoomIn, Sun, Moon,
  Cog, Loader2
} from 'lucide-react'

// ============================================================
// TYPES
// ============================================================
type LabTab = 'viewer' | 'builder'

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
  const [tab, setTab] = useState<LabTab>('viewer')
  const [darkMode, setDarkMode] = useState(true)

  // Viewer state — presets loaded from Supabase (admin-editable, no redeploy needed)
  const [presets, setPresets] = useState<CadPreset[]>([])
  const [presetsLoading, setPresetsLoading] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState(0)

  useEffect(() => {
    fetch('/api/cad-presets')
      .then(r => r.json())
      .then(data => setPresets(data.presets || []))
      .catch(() => setPresets([]))
      .finally(() => setPresetsLoading(false))
  }, [])

  // Builder state
  const [builderShapes, setBuilderShapes] = useState<ShapeConfig[]>([
    { id: 'init-box', type: 'box', color: '#3B82F6', metalness: 0.5, roughness: 0.4, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], width: 1, height: 1, depth: 1 }
  ])
  const [selectedShapeIdx, setSelectedShapeIdx] = useState(0)

  // Current scene shapes
  const currentShapes = tab === 'viewer' ? (presets[selectedPreset]?.shapes || []) : builderShapes

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
  ]

  return (
    <div className="bg-labdark-surface rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
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
          <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 transition-colors">
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button onClick={exportScene} className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium flex items-center gap-1 hover:bg-cyan-500/30 transition-colors">
            <Download className="w-3 h-3" /> Exportar
          </button>
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
          {tab === 'viewer' && presetsLoading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-gray-400 text-sm pointer-events-none">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando modelos...
            </div>
          )}
          {!presetsLoading && currentShapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-500 text-sm">Escena vacía — agrega figuras</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 bg-labdark-bg border-l border-gray-700/50 flex flex-col overflow-hidden">
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
                  {presets.map((model, idx) => (
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
                      <div className="text-[9px] text-gray-600 mt-1">{model.shapes.length} piezas</div>
                    </button>
                  ))}
                </div>
                {presets[selectedPreset] && (
                  <div className="bg-gray-700/20 rounded-lg p-2.5">
                    <h5 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Info del modelo</h5>
                    <div className="text-[10px] text-gray-500 space-y-0.5">
                      <div>Piezas: <span className="text-white">{presets[selectedPreset].shapes.length}</span></div>
                      <div>Tipos: <span className="text-white">{new Set(presets[selectedPreset].shapes.map(s => s.type)).size}</span></div>
                      <div>Animadas: <span className="text-white">{presets[selectedPreset].shapes.filter(s => s.animate).length}</span></div>
                    </div>
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
