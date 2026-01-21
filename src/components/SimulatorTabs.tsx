'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './AuthProvider'
import { 
  ExternalLink, Puzzle, Cat, Gamepad2, Zap, CircuitBoard, Code, Terminal, 
  Cpu, Bot, Cog, Eye, Box, GitBranch, Network, Joystick, Wrench, Sparkles
} from 'lucide-react'

// Cargar BlocklyEditor dinámicamente para evitar errores de SSR
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

const simulators = [
  // Bloques
  {
    id: 'chaskiblocks',
    name: 'ChaskiBlocks',
    description: 'Editor de bloques para robótica - ¡Exclusivo ChaskiBots!',
    url: '',
    icon: Sparkles,
    category: 'bloques',
    requiresLogin: false,
    isInternal: true
  },
  {
    id: 'blockly',
    name: 'Blockly Games',
    description: 'Juegos de programación por bloques - Sin registro',
    url: 'https://blockly.games/?lang=es',
    icon: Puzzle,
    category: 'bloques',
    requiresLogin: false
  },
  {
    id: 'scratch',
    name: 'Scratch',
    description: 'Editor de proyectos con bloques - Sin registro para probar',
    url: 'https://scratch.mit.edu/projects/editor/',
    icon: Cat,
    category: 'bloques',
    requiresLogin: false
  },
  {
    id: 'makecode',
    name: 'MakeCode Arcade',
    description: 'Crea videojuegos 2D - Sin registro',
    url: 'https://arcade.makecode.com/#editor',
    icon: Gamepad2,
    category: 'bloques',
    requiresLogin: false
  },
  {
    id: 'makecode-microbit',
    name: 'MakeCode micro:bit',
    description: 'Programa micro:bit con bloques - Sin registro',
    url: 'https://makecode.microbit.org/',
    icon: Cpu,
    category: 'bloques',
    requiresLogin: false
  },
  // Python
  {
    id: 'trinket',
    name: 'Trinket Python',
    description: 'Ejecuta Python en el navegador - Sin registro',
    url: 'https://trinket.io/python',
    icon: Code,
    category: 'python',
    requiresLogin: false
  },
  {
    id: 'programiz',
    name: 'Programiz Python',
    description: 'Compilador Python online - Sin registro',
    url: 'https://www.programiz.com/python-programming/online-compiler/',
    icon: Terminal,
    category: 'python',
    requiresLogin: false
  },
  {
    id: 'replit',
    name: 'Replit Python',
    description: 'IDE Python completo en la nube',
    url: 'https://replit.com/languages/python3',
    icon: Code,
    category: 'python',
    requiresLogin: false
  },
  // MicroPython
  {
    id: 'micropython-esp32',
    name: 'MicroPython ESP32',
    description: 'Simula MicroPython en ESP32 - Sin registro',
    url: 'https://wokwi.com/projects/new/micropython-esp32',
    icon: Cpu,
    category: 'micropython',
    requiresLogin: false
  },
  {
    id: 'micropython-pico',
    name: 'Raspberry Pi Pico',
    description: 'Simula Pi Pico con MicroPython - Sin registro',
    url: 'https://wokwi.com/projects/new/micropython-pi-pico',
    icon: CircuitBoard,
    category: 'micropython',
    requiresLogin: false
  },
  // Electrónica
  {
    id: 'wokwi-arduino',
    name: 'Wokwi Arduino',
    description: 'Simulador de Arduino UNO - Sin registro',
    url: 'https://wokwi.com/projects/new/arduino-uno',
    icon: Zap,
    category: 'electronica',
    requiresLogin: false
  },
  {
    id: 'wokwi-esp32',
    name: 'Wokwi ESP32',
    description: 'Simulador de ESP32 con WiFi/BT - Sin registro',
    url: 'https://wokwi.com/projects/new/esp32',
    icon: Cpu,
    category: 'electronica',
    requiresLogin: false
  },
  {
    id: 'wokwi-esp32-c3',
    name: 'ESP32-C3 RISC-V',
    description: 'ESP32-C3 con arquitectura RISC-V - Sin registro',
    url: 'https://wokwi.com/projects/new/esp32-c3-devkitm-1',
    icon: Cpu,
    category: 'electronica',
    requiresLogin: false
  },
  {
    id: 'wokwi-esp32-s2',
    name: 'ESP32-S2',
    description: 'ESP32-S2 con USB nativo - Sin registro',
    url: 'https://wokwi.com/projects/new/esp32-s2-devkitm-1',
    icon: Cpu,
    category: 'electronica',
    requiresLogin: false
  },
  {
    id: 'tinkercad',
    name: 'Tinkercad Circuits',
    description: 'Simulación de electrónica y Arduino',
    url: 'https://www.tinkercad.com/circuits',
    icon: CircuitBoard,
    category: 'electronica',
    requiresLogin: true
  },
  {
    id: 'falstad',
    name: 'Falstad Circuit',
    description: 'Simulador de circuitos electrónicos - Sin registro',
    url: 'https://www.falstad.com/circuit/circuitjs.html',
    icon: Zap,
    category: 'electronica',
    requiresLogin: false
  },
  // Robótica - Brazos Robóticos y Simuladores
  {
    id: 'gazebo-web',
    name: 'Gazebo Web',
    description: 'Simulador ROS/Gazebo en navegador - Sin registro',
    url: 'https://app.gazebosim.org/',
    icon: Bot,
    category: 'robotica',
    requiresLogin: false
  },
  {
    id: 'dobot-sim',
    name: 'Dobot Simulator',
    description: 'Simulador brazo Dobot Magician - Sin registro',
    url: 'https://www.dobot-robots.com/products/education/magician.html',
    icon: Joystick,
    category: 'robotica',
    requiresLogin: false
  },
  // CNC/Industrial
  {
    id: 'openbuilds',
    name: 'OpenBuilds CAM',
    description: 'Generador de G-Code para CNC - Sin registro',
    url: 'https://cam.openbuilds.com/',
    icon: Cog,
    category: 'cnc',
    requiresLogin: false
  },
  {
    id: 'ncviewer',
    name: 'NC Viewer',
    description: 'Visualizador de código G-Code CNC - Sin registro',
    url: 'https://ncviewer.com/',
    icon: Eye,
    category: 'cnc',
    requiresLogin: false
  },
  {
    id: 'jscut',
    name: 'JSCut',
    description: 'CAM para CNC en navegador - Sin registro',
    url: 'http://jscut.org/jscut.html',
    icon: Cog,
    category: 'cnc',
    requiresLogin: false
  },
  {
    id: 'camotics',
    name: 'CAMotics Web',
    description: 'Simulador de fresado CNC - Sin registro',
    url: 'https://camotics.org/',
    icon: Eye,
    category: 'cnc',
    requiresLogin: false
  },
  // 3D
  {
    id: 'tinkercad-3d',
    name: 'Tinkercad 3D',
    description: 'Diseño 3D para impresión - Fácil de usar',
    url: 'https://www.tinkercad.com/3d-design',
    icon: Box,
    category: '3d',
    requiresLogin: true
  },
  {
    id: 'blockscad',
    name: 'BlocksCAD',
    description: 'Diseño 3D con bloques - Sin registro',
    url: 'https://www.blockscad3d.com/editor/',
    icon: Box,
    category: '3d',
    requiresLogin: false
  },
  // Lógica
  {
    id: 'logic-gates',
    name: 'Logic Gate Simulator',
    description: 'Simulador de compuertas lógicas - Sin registro',
    url: 'https://logic.ly/demo/',
    icon: GitBranch,
    category: 'logica',
    requiresLogin: false
  },
  {
    id: 'circuitverse',
    name: 'CircuitVerse',
    description: 'Simulador de circuitos digitales - Sin registro',
    url: 'https://circuitverse.org/simulator',
    icon: Network,
    category: 'logica',
    requiresLogin: false
  },
]

export default function SimulatorTabs() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('bloques')
  const [activeSimulator, setActiveSimulator] = useState(simulators[0])

  const filteredSimulators = simulators.filter(sim => sim.category === activeCategory)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Category Tabs */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                const firstInCategory = simulators.find(s => s.category === cat.id)
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
          const Icon = sim.icon
          return (
            <button
              key={sim.id}
              onClick={() => setActiveSimulator(sim)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                activeSimulator.id === sim.id 
                  ? 'bg-dark-600 text-white border border-neon-cyan/50' 
                  : 'bg-dark-800 text-gray-500 hover:bg-dark-700 hover:text-gray-300 border border-dark-600'
              }`}
            >
              <Icon className="w-3 h-3" />
              {sim.name}
              {!sim.requiresLogin && (
                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Sin registro</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active Simulator Panel */}
      {activeSimulator.id === 'chaskiblocks' ? (
        /* ChaskiBlocks - Editor interno */
        <div className="h-[700px]">
          <BlocklyEditor userId={user?.id} userName={user?.name} />
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {(() => {
                  const Icon = activeSimulator.icon
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
              Abrir en su web
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

          <p className="text-sm text-gray-500 mt-4 text-center">
            Si el simulador no carga correctamente, usa el botón "Abrir en su web" para acceder directamente.
          </p>
        </div>
      )}
    </div>
  )
}
