'use client'

import { useState } from 'react'
import { ExternalLink, Puzzle, Cat, Gamepad2, Zap, CircuitBoard } from 'lucide-react'

const simulators = [
  {
    id: 'blockly',
    name: 'Blockly Games',
    description: 'Juegos de programación por bloques: rompecabezas, laberinto, tortuga y más.',
    url: 'https://blockly.games/?lang=es',
    icon: Puzzle,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'scratch',
    name: 'Scratch',
    description: 'Editor oficial para crear proyectos con bloques.',
    url: 'https://scratch.mit.edu/projects/editor/',
    icon: Cat,
    color: 'from-orange-400 to-amber-500'
  },
  {
    id: 'makecode',
    name: 'MakeCode Arcade',
    description: 'Crea videojuegos 2D con bloques o JavaScript.',
    url: 'https://arcade.makecode.com/#editor',
    icon: Gamepad2,
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'wokwi',
    name: 'Wokwi',
    description: 'Simulador de Arduino, ESP32 y más.',
    url: 'https://wokwi.com/',
    icon: Zap,
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'tinkercad',
    name: 'Tinkercad Circuits',
    description: 'Simulación de electrónica y microcontroladores.',
    url: 'https://www.tinkercad.com/circuits',
    icon: CircuitBoard,
    color: 'from-purple-400 to-violet-500'
  }
]

export default function SimulatorTabs() {
  const [activeSimulator, setActiveSimulator] = useState(simulators[0])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-3 justify-center mb-6 flex-wrap">
        {simulators.map((sim) => {
          const Icon = sim.icon
          return (
            <button
              key={sim.id}
              onClick={() => setActiveSimulator(sim)}
              className={`tab-btn flex items-center gap-2 ${activeSimulator.id === sim.id ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {sim.name}
            </button>
          )
        })}
      </div>

      {/* Active Simulator Panel */}
      <div className="card animate-fadeIn">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-chaski-dark flex items-center gap-2">
              {(() => {
                const Icon = activeSimulator.icon
                return <Icon className="w-6 h-6" />
              })()}
              {activeSimulator.name}
            </h3>
            <p className="text-gray-600 mt-1">{activeSimulator.description}</p>
          </div>
          <a
            href={activeSimulator.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir en su web
          </a>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
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
    </div>
  )
}
