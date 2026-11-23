'use client'

import { useState, useRef, useMemo, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Center } from '@react-three/drei'
import * as THREE from 'three'
import {
  Eye, RotateCcw, Download, Sliders,
  Info, Trash2, Move, ZoomIn, Sun, Moon,
  Cog, Loader2, Send, Box
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import VoxelBuilder, { VoxelMap } from './VoxelBuilder'
import TinkerEditor, { TShape, TMode } from './TinkerEditor'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Geometría base por tipo (igual que en TinkerEditor) para construir y exportar el STL.
function geomDeTipo(type: TShape['type']): THREE.BufferGeometry {
  switch (type) {
    case 'sphere': return new THREE.SphereGeometry(0.6, 32, 32)
    case 'cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32)
    case 'cone': return new THREE.ConeGeometry(0.6, 1.2, 32)
    case 'torus': return new THREE.TorusGeometry(0.5, 0.2, 16, 32)
    default: return new THREE.BoxGeometry(1, 1, 1)
  }
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
  const [tab, setTab] = useState<LabTab>('disenar')
  const [darkMode, setDarkMode] = useState(true)
  const [tinkerShapes, setTinkerShapes] = useState<TShape[]>([
    { id: 't-base', type: 'box', color: '#38bdf8', position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [2, 0.4, 2] },
    { id: 't-top', type: 'cylinder', color: '#f59e0b', position: [0, 1.3, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  ])
  const [tinkerSel, setTinkerSel] = useState<string | null>('t-top')
  const [tinkerMode, setTinkerMode] = useState<TMode>('translate')
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
    const data = tab === 'disenar' ? { tinker: tinkerShapes, exportedAt: new Date().toISOString() } : tab === 'voxel' ? { voxels, exportedAt: new Date().toISOString() } : { shapes: currentShapes, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chaskibots-cad-scene.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Enviar el diseño 3D como entrega, ligada a la cuenta del estudiante (identidad desde la sesión).
  const enviarAlProfesor = async () => {
    setEnviando(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: `CAD-${Date.now().toString(36).toUpperCase()}`,
          output: tab === 'disenar'
            ? `Diseño 3D (Tinkercad): ${tinkerShapes.length} figura(s)`
            : tab === 'voxel'
            ? `Construcción con ${Object.keys(voxels).length} bloques`
            : `Diseño 3D: ${currentShapes.length} figura(s) — ${tab === 'viewer' ? 'modelo del visor' : 'construcción propia'}`,
          files: tab === 'disenar' ? { tinker: tinkerShapes } : tab === 'voxel' ? { voxels } : { shapes: currentShapes },
        }),
      })
      if (res.ok) { setEnviado(true); setTimeout(() => setEnviado(false), 4000) }
    } catch { /* sin conexión */ }
    setEnviando(false)
  }

  const selectedShape = builderShapes[selectedShapeIdx]

  const tabs = [
    { id: 'disenar' as LabTab, label: 'Diseñar', icon: Sliders, desc: 'Figuras: mover, girar, escalar' },
    { id: 'voxel' as LabTab, label: 'Construye', icon: Box, desc: 'Arma con bloques (fácil)' },
    { id: 'viewer' as LabTab, label: 'Visor 3D', icon: Eye, desc: 'Explora modelos prediseñados' },
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
          {user?.name && (
            <button onClick={enviarAlProfesor} disabled={enviando || enviado} className={`text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors disabled:opacity-70 ${enviado ? 'bg-green-600 text-white border border-green-500' : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'}`} title={`Enviar como ${user.name}`}>
              <Send className="w-3 h-3" /> {enviado ? '✓ Enviado' : enviando ? 'Enviando…' : 'Enviar al profesor'}
            </button>
          )}
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
          {tab === 'disenar' ? (
            <TinkerEditor shapes={tinkerShapes} setShapes={setTinkerShapes} selectedId={tinkerSel} setSelectedId={setTinkerSel} mode={tinkerMode} />
          ) : tab === 'voxel' ? (
            <VoxelBuilder voxels={voxels} color={voxelColor} modo={voxelModo} setVoxels={setVoxels} />
          ) : (
          <Canvas
            camera={{ position: [4, 3, 6], fov: 50 }}
            style={{ background: darkMode ? '#0f0f1a' : '#e2e8f0' }}
          >
            <Suspense fallback={null}>
              <Scene shapes={currentShapes} darkMode={darkMode} />
            </Suspense>
          </Canvas>
          )}
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

            {/* ── DISEÑAR (TINKERCAD) ── */}
            {tab === 'disenar' && (() => {
              const sel = tinkerShapes.find(s => s.id === tinkerSel) || null
              const addShape = (type: TShape['type']) => {
                const id = 't' + Date.now().toString(36)
                setTinkerShapes(prev => [...prev, { id, type, color: '#38bdf8', position: [0, 0.6, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }])
                setTinkerSel(id)
              }
              const dupSel = () => {
                if (!sel) return
                const id = 't' + Date.now().toString(36)
                setTinkerShapes(prev => [...prev, { ...sel, id, position: [sel.position[0] + 1, sel.position[1], sel.position[2] + 1] }])
                setTinkerSel(id)
              }
              const delSel = () => { if (!sel) return; setTinkerShapes(prev => prev.filter(s => s.id !== sel.id)); setTinkerSel(null) }
              const setColor = (c: string) => { if (!sel) return; setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, color: c } : s)) }
              const setField = (field: 'position' | 'scale', axis: number, val: number) => {
                if (!sel) return
                setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, [field]: s[field].map((v, i) => i === axis ? val : v) as [number, number, number] } : s))
              }
              const espejo = (axis: number) => {
                if (!sel) return
                setTinkerShapes(prev => prev.map(s => s.id === sel.id ? { ...s, scale: s.scale.map((v, i) => i === axis ? -v : v) as [number, number, number] } : s))
              }
              const generarSTL = () => {
                if (tinkerShapes.length === 0) return
                const geos = tinkerShapes.map(s => {
                  const g = geomDeTipo(s.type)
                  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(s.rotation[0], s.rotation[1], s.rotation[2]))
                  const mtx = new THREE.Matrix4().compose(new THREE.Vector3(s.position[0], s.position[1], s.position[2]), q, new THREE.Vector3(Math.abs(s.scale[0]) || 0.1, Math.abs(s.scale[1]) || 0.1, Math.abs(s.scale[2]) || 0.1))
                  g.applyMatrix4(mtx)
                  g.deleteAttribute('uv')
                  return g
                })
                const merged = mergeGeometries(geos, false)
                if (!merged) return
                merged.computeVertexNormals()
                const stl = new STLExporter().parse(new THREE.Mesh(merged))
                const blob = new Blob([stl], { type: 'model/stl' })
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'diseno-chaskibots.stl'; a.click(); URL.revokeObjectURL(a.href)
              }
              const figuras: { t: TShape['type']; e: string; n: string }[] = [
                { t: 'box', e: '🧊', n: 'Cubo' }, { t: 'sphere', e: '⚪', n: 'Esfera' }, { t: 'cylinder', e: '🥫', n: 'Cilindro' }, { t: 'cone', e: '🔺', n: 'Cono' }, { t: 'torus', e: '🍩', n: 'Dona' },
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
                  <div>
                    <h4 className="text-white text-xs font-bold mb-1.5">Herramienta</h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([['translate', '✋ Mover'], ['rotate', '🔄 Girar'], ['scale', '⤢ Escalar']] as [TMode, string][]).map(([m, lbl]) => (
                        <button key={m} onClick={() => setTinkerMode(m)} className={`py-2 rounded-lg text-[11px] font-bold transition-colors ${tinkerMode === m ? 'bg-cyan-500 text-white' : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700/60'}`}>{lbl}</button>
                      ))}
                    </div>
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
                      <div className="grid grid-cols-2 gap-1.5">
                        <button onClick={dupSel} className="py-1.5 rounded-lg text-[11px] font-medium bg-gray-700/40 text-gray-200 hover:bg-gray-700/60">Duplicar</button>
                        <button onClick={delSel} className="py-1.5 rounded-lg text-[11px] font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> Borrar</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500">Toca una figura en la escena para editarla.</p>
                  )}
                  <div>
                    <h4 className="text-white text-xs font-bold mb-1.5">🎯 Retos</h4>
                    <div className="space-y-1 text-[11px] text-gray-300">
                      <div className="bg-gray-700/20 rounded p-2">🚗 Un <b>carro</b>: una caja + 4 cilindros (ruedas).</div>
                      <div className="bg-gray-700/20 rounded p-2">⛄ Un <b>muñeco</b>: dos esferas + un cono.</div>
                      <div className="bg-gray-700/20 rounded p-2">🏠 Una <b>casa</b>: una caja + un cono de techo.</div>
                      <div className="bg-gray-700/20 rounded p-2">⭐ <b>Libre:</b> diseña y pulsa «Enviar al profesor».</div>
                    </div>
                  </div>
                  <button onClick={generarSTL} disabled={tinkerShapes.length === 0} className="w-full py-2 rounded-lg text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Generar STL (une todo e imprime)
                  </button>
                  <div className="text-[10px] text-gray-500">Figuras: <span className="text-white font-bold">{tinkerShapes.length}</span> · El STL une todas en un solo modelo para impresión 3D.</div>
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
