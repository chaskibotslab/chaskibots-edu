'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './AuthProvider'
import { 
  ExternalLink, Puzzle, Cat, Gamepad2, Zap, CircuitBoard, Code, Terminal, 
  Cpu, Bot, Cog, Eye, Box, GitBranch, Network, Joystick, Wrench, Sparkles,
  Maximize2, Minimize2
} from 'lucide-react'

// Cargar BlocklyEditor dinámicamente para evitar errores de SSR
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

// Simuladores conocidos que bloquean iframes (X-Frame-Options)
const BLOCKED_IN_IFRAME = new Set([
  'tinkercad', 'tinkercad-3d', 'replit', 'gazebo-web', 'dobot-sim',
  'camotics', 'scratch'
])

export default function SimulatorTabs() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('bloques')
  const [activeSimulator, setActiveSimulator] = useState(simulators[0])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  const filteredSimulators = simulators.filter(sim => sim.category === activeCategory)
  const isBlocked = BLOCKED_IN_IFRAME.has(activeSimulator.id)

  useEffect(() => {
    setIframeError(false)
  }, [activeSimulator.id])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Category Tabs */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        {categories.map((cat) => {
          const Icon = cat.icon
          const active = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                const firstInCategory = simulators.find(s => s.category === cat.id)
                if (firstInCategory) setActiveSimulator(firstInCategory)
              }}
              className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-brand-purple to-brand-violet text-white shadow-md scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-brand-purple border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Simulator pills */}
      <div className="flex gap-2 justify-center mb-6 flex-wrap">
        {filteredSimulators.map((sim) => {
          const Icon = sim.icon
          const active = activeSimulator.id === sim.id
          const blocked = BLOCKED_IN_IFRAME.has(sim.id)
          return (
            <button
              key={sim.id}
              onClick={() => setActiveSimulator(sim)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {sim.name}
              {!blocked && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${active ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                  ⚡ Embebido
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active Simulator Panel */}
      {activeSimulator.id === 'chaskiblocks' ? (
        <div className="h-[700px]">
          <BlocklyEditor userId={user?.id} userName={user?.name} />
        </div>
      ) : (
        <div className={`bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-violet/10 flex items-center justify-center shrink-0">
                {(() => {
                  const Icon = activeSimulator.icon
                  return <Icon className="w-6 h-6 text-brand-purple" />
                })()}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate">{activeSimulator.name}</h3>
                <p className="text-slate-500 text-sm truncate">{activeSimulator.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isBlocked && (
                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all"
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <a
                href={activeSimulator.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-brand-purple to-brand-violet text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:shadow-lg active:scale-95 transition-all shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Abrir externo</span>
              </a>
            </div>
          </div>

          {isBlocked || iframeError ? (
            <div className="p-10 text-center">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-10 h-10 text-amber-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Este simulador no permite embeberse</h4>
              <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
                Por políticas de seguridad del proveedor, debes abrirlo en una pestaña nueva. La experiencia será la misma.
              </p>
              <a
                href={activeSimulator.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white font-bold px-6 py-3 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                Abrir {activeSimulator.name} en una nueva pestaña
              </a>
            </div>
          ) : (
            <>
              <div className={`relative bg-white ${isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-[600px]'}`}>
                <iframe
                  src={activeSimulator.url}
                  className="w-full h-full border-none"
                  title={activeSimulator.name}
                  loading="lazy"
                  onError={() => setIframeError(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
                />
              </div>
              <div className="px-4 py-3 bg-gradient-to-r from-brand-purple/5 to-brand-violet/5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Simulador embebido en ChaskiBots · ¿Problemas? Usa "Abrir externo"
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
