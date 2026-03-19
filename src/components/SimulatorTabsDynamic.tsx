'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './AuthProvider'
import { 
  ExternalLink, Puzzle, Cat, Gamepad2, Zap, CircuitBoard, Code, Terminal, 
  Cpu, Bot, Cog, Eye, Box, GitBranch, Network, Joystick, Wrench, Sparkles,
  Loader2, AlertCircle, RefreshCw
} from 'lucide-react'

const BlocklyEditor = dynamic(() => import('./BlocklyEditor'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-dark-800 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando ChaskiBlocks...</p>
      </div>
    </div>
  )
})

interface Simulator {
  id: string
  name: string
  description: string
  icon: string
  url: string
  levels: string[]
  programs: string[]
  category?: string
  enabled: boolean
}

const categories = [
  { id: 'bloques', name: 'Bloques', icon: Puzzle },
  { id: 'python', name: 'Python', icon: Code },
  { id: 'micropython', name: 'MicroPython', icon: Cpu },
  { id: 'electronica', name: 'Electrónica', icon: Zap },
  { id: 'robotica', name: 'Robótica', icon: Bot },
  { id: 'cnc', name: 'CNC/Industrial', icon: Cog },
  { id: '3d', name: 'Diseño 3D', icon: Box },
  { id: 'logica', name: 'Lógica Digital', icon: GitBranch },
]

const iconMap: Record<string, any> = {
  puzzle: Puzzle,
  cat: Cat,
  gamepad: Gamepad2,
  gamepad2: Gamepad2,
  zap: Zap,
  circuitboard: CircuitBoard,
  code: Code,
  code2: Code,
  terminal: Terminal,
  cpu: Cpu,
  microchip: Cpu,
  bot: Bot,
  cog: Cog,
  eye: Eye,
  box: Box,
  boxes: Box,
  gitbranch: GitBranch,
  network: Network,
  joystick: Joystick,
  wrench: Wrench,
  sparkles: Sparkles,
  activity: Zap,
  cable: CircuitBoard,
  scissors: Cog,
}

const getIcon = (iconName: string) => {
  const normalized = iconName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return iconMap[normalized] || Code
}

// ChaskiBlocks interno (siempre disponible)
const chaskiBlocks: Simulator = {
  id: 'chaskiblocks',
  name: 'ChaskiBlocks',
  description: 'Editor de bloques para robótica - ¡Exclusivo ChaskiBots!',
  url: '',
  icon: 'sparkles',
  category: 'bloques',
  levels: [],
  programs: [],
  enabled: true
}

interface SimulatorTabsDynamicProps {
  levelId?: string
  programId?: string
}

export default function SimulatorTabsDynamic({ levelId, programId }: SimulatorTabsDynamicProps) {
  const { user } = useAuth()
  const [simulators, setSimulators] = useState<Simulator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('bloques')
  const [activeSimulator, setActiveSimulator] = useState<Simulator | null>(null)

  useEffect(() => {
    loadSimulators()
  }, [levelId, programId])

  const loadSimulators = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/simulators'
      const params = new URLSearchParams()
      if (levelId) params.append('levelId', levelId)
      if (programId) params.append('programId', programId)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Error cargando simuladores')
      
      const data = await response.json()
      const enabledSimulators = Array.isArray(data) 
        ? data.filter((s: Simulator) => s.enabled)
        : []
      
      // Agregar ChaskiBlocks al inicio
      setSimulators([chaskiBlocks, ...enabledSimulators])
      
      // Seleccionar el primero de la categoría activa
      const firstInCategory = [chaskiBlocks, ...enabledSimulators].find(
        s => (s.category || 'bloques') === activeCategory
      )
      setActiveSimulator(firstInCategory || chaskiBlocks)
    } catch (err) {
      console.error('Error loading simulators:', err)
      setError('No se pudieron cargar los simuladores')
      // Usar ChaskiBlocks como fallback
      setSimulators([chaskiBlocks])
      setActiveSimulator(chaskiBlocks)
    }
    setLoading(false)
  }

  const filteredSimulators = simulators.filter(
    sim => (sim.category || 'bloques') === activeCategory
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        <span className="ml-3 text-gray-400">Cargando simuladores...</span>
      </div>
    )
  }

  if (error && simulators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadSimulators}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Category Tabs */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        {categories.map((cat) => {
          const Icon = cat.icon
          const hasSimulators = simulators.some(s => (s.category || 'bloques') === cat.id)
          if (!hasSimulators) return null
          
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                const firstInCategory = simulators.find(s => (s.category || 'bloques') === cat.id)
                if (firstInCategory) setActiveSimulator(firstInCategory)
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                activeCategory === cat.id 
                  ? 'bg-neon-cyan text-dark-900' 
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Simulator Tabs within Category */}
      <div className="flex gap-2 justify-center mb-6 flex-wrap">
        {filteredSimulators.map((sim) => {
          const Icon = getIcon(sim.icon)
          return (
            <button
              key={sim.id}
              onClick={() => setActiveSimulator(sim)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                activeSimulator?.id === sim.id 
                  ? 'bg-dark-600 text-white border border-neon-cyan/50' 
                  : 'bg-dark-800 text-gray-500 hover:bg-dark-700 hover:text-gray-300 border border-dark-600'
              }`}
            >
              <Icon className="w-3 h-3" />
              {sim.name}
            </button>
          )
        })}
      </div>

      {/* Active Simulator Panel */}
      {activeSimulator?.id === 'chaskiblocks' ? (
        <div className="h-[700px]">
          <BlocklyEditor userId={user?.id} userName={user?.name} />
        </div>
      ) : activeSimulator ? (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {(() => {
                  const Icon = getIcon(activeSimulator.icon)
                  return <Icon className="w-6 h-6 text-neon-cyan" />
                })()}
                {activeSimulator.name}
              </h3>
              <p className="text-gray-400 mt-1">{activeSimulator.description}</p>
            </div>
            <a
              href={activeSimulator.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neon-cyan text-dark-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-neon-cyan/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir en nueva pestaña
            </a>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-dark-900 border border-dark-600">
            <iframe
              src={activeSimulator.url}
              className="w-full h-[600px] border-none"
              title={activeSimulator.name}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            />
          </div>

          <p className="text-center text-gray-500 text-sm mt-4">
            Si el simulador no carga correctamente, usa el botón "Abrir en nueva pestaña"
          </p>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Selecciona un simulador para comenzar
        </div>
      )}
    </div>
  )
}
