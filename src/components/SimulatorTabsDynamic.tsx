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
    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando ChaskiBlocks...</p>
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
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
        <span className="ml-3 text-gray-600">Cargando simuladores...</span>
      </div>
    )
  }

  if (error && simulators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadSimulators}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
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
                  ? 'bg-brand-purple text-dark-900' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
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
                  ? 'bg-dark-600 text-gray-900 border border-brand-purple/50' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-300 border border-gray-200'
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
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header del simulador */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-purple to-blue-600 flex items-center justify-center">
                  {(() => {
                    const Icon = getIcon(activeSimulator.icon)
                    return <Icon className="w-7 h-7 text-gray-900" />
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeSimulator.name}</h3>
                  <p className="text-gray-600 text-sm">{activeSimulator.description}</p>
                </div>
              </div>
              <a
                href={activeSimulator.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-brand-purple to-blue-600 text-gray-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-brand-purple/20"
              >
                <ExternalLink className="w-5 h-5" />
                Abrir Simulador
              </a>
            </div>
          </div>

          {/* Vista previa visual atractiva */}
          <div className="relative h-[500px] bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
            {/* Patrón de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300d4ff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            
            {/* Contenido central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-purple to-blue-600 flex items-center justify-center mb-6 shadow-2xl shadow-brand-purple/30">
                {(() => {
                  const Icon = getIcon(activeSimulator.icon)
                  return <Icon className="w-12 h-12 text-gray-900" />
                })()}
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{activeSimulator.name}</h2>
              <p className="text-gray-600 max-w-md mb-8">{activeSimulator.description}</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={activeSimulator.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-brand-purple to-blue-600 text-gray-900 px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-brand-purple/30 text-lg"
                >
                  <Zap className="w-6 h-6" />
                  Iniciar Simulador
                </a>
              </div>
              
              <p className="text-gray-500 text-sm mt-6">
                El simulador se abrirá en una nueva pestaña para mejor experiencia
              </p>
            </div>

            {/* Decoración */}
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-brand-purple/10 blur-2xl" />
            <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-600/10 blur-3xl" />
          </div>

          {/* Tips */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Sparkles className="w-5 h-5 text-brand-purple" />
              <span><strong className="text-gray-900">Tip:</strong> Practica lo aprendido en las lecciones usando este simulador</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          Selecciona un simulador para comenzar
        </div>
      )}
    </div>
  )
}
