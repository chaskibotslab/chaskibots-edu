'use client'

import { useState } from 'react'
import { 
  Code, Gamepad2, Terminal, Cpu, Sparkles, ChevronRight,
  BookOpen, Zap, Shield, Brain, Camera, Pencil, Upload, Eye
} from 'lucide-react'
import dynamic from 'next/dynamic'
import PythonSimulator from './activities/PythonSimulator'
import RobloxEditor from './activities/RobloxEditor'
import HackingTerminal from './activities/HackingTerminal'

// AIVision cargado dinámicamente para evitar problemas con TensorFlow en SSR
const AIVision = dynamic(() => import('./AIVision'), { ssr: false })

interface AIActivitiesProps {
  levelId: string
}

type ActivityType = 'ai-vision' | 'python' | 'roblox' | 'hacking' | null

interface Activity {
  id: ActivityType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  available: boolean
  category: 'ia' | 'programacion'
}

export default function AIActivities({ levelId }: AIActivitiesProps) {
  const [activeActivity, setActiveActivity] = useState<ActivityType>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | 'ia' | 'programacion'>('all')

  const isAdvancedLevel = ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'].includes(levelId)
  const isBachillerato = ['primero-bach', 'segundo-bach', 'tercero-bach'].includes(levelId)

  const activities: Activity[] = [
    // IA Activities
    {
      id: 'ai-vision',
      title: 'Visión IA',
      description: 'Detector de objetos, clasificador de imágenes, dibujo IA y herramientas de hacking.',
      icon: <Eye className="w-6 h-6" />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/50',
      available: true,
      category: 'ia'
    },
    // Programming Activities
    {
      id: 'python',
      title: 'Simulador Python',
      description: 'Aprende programación con Python. Variables, bucles, funciones y más.',
      icon: <Code className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      available: true,
      category: 'programacion'
    },
    {
      id: 'roblox',
      title: 'Editor Roblox Lua',
      description: 'Crea scripts para Roblox Studio. Partes, eventos, jugadores y más.',
      icon: <Gamepad2 className="w-6 h-6" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      available: true,
      category: 'programacion'
    },
    {
      id: 'hacking',
      title: 'Terminal Hacking Avanzado',
      description: 'Terminal completa con sistema de archivos, 30+ comandos y herramientas de seguridad.',
      icon: <Terminal className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      available: isAdvancedLevel,
      category: 'programacion'
    }
  ]

  const filteredActivities = activeCategory === 'all' 
    ? activities 
    : activities.filter(a => a.category === activeCategory)

  const getLevelInfo = () => {
    if (isBachillerato) {
      return {
        label: 'Bachillerato',
        description: 'Acceso completo a todas las actividades avanzadas',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
      }
    }
    if (isAdvancedLevel) {
      return {
        label: 'Nivel Avanzado',
        description: 'Acceso a terminal de hacking y funciones avanzadas',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20'
      }
    }
    return {
      label: 'Nivel Básico',
      description: 'Python y Roblox con ejemplos introductorios',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    }
  }

  const levelInfo = getLevelInfo()

  const renderActivity = () => {
    switch (activeActivity) {
      case 'ai-vision':
        return <AIVision levelId={levelId} />
      case 'python':
        return <PythonSimulator levelId={levelId} />
      case 'roblox':
        return <RobloxEditor levelId={levelId} />
      case 'hacking':
        return <HackingTerminal levelId={levelId} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">IA y Programación</h2>
            <p className="text-sm text-gray-400">Experimenta con IA y aprende a programar</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 ${levelInfo.bgColor} rounded-full`}>
          <Sparkles className={`w-4 h-4 ${levelInfo.color}`} />
          <span className={`text-sm font-medium ${levelInfo.color}`}>{levelInfo.label}</span>
        </div>
      </div>

      {/* Category Filter */}
      {!activeActivity && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeCategory === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveCategory('ia')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeCategory === 'ia' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" /> Inteligencia Artificial
          </button>
          <button
            onClick={() => setActiveCategory('programacion')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeCategory === 'programacion' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Code className="w-4 h-4" /> Programación
          </button>
        </div>
      )}

      {/* Activity Selector */}
      {!activeActivity && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredActivities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => activity.available && setActiveActivity(activity.id)}
              disabled={!activity.available}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group
                ${activity.available 
                  ? `${activity.bgColor} ${activity.borderColor} hover:scale-105 hover:shadow-lg cursor-pointer` 
                  : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                }`}
            >
              {!activity.available && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
                  Nivel avanzado
                </div>
              )}
              
              <div className={`p-3 rounded-xl ${activity.bgColor} w-fit mb-4`}>
                <div className={activity.color}>{activity.icon}</div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                {activity.title}
                {activity.available && (
                  <ChevronRight className={`w-4 h-4 ${activity.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                )}
              </h3>
              
              <p className="text-sm text-gray-400">{activity.description}</p>
              
              {activity.available && (
                <div className={`mt-4 flex items-center gap-2 text-sm ${activity.color}`}>
                  <Zap className="w-4 h-4" />
                  <span>Comenzar</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Active Activity */}
      {activeActivity && (
        <div className="space-y-4">
          {/* Back Button */}
          <button
            onClick={() => setActiveActivity(null)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Volver a actividades</span>
          </button>

          {/* Activity Content */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            {renderActivity()}
          </div>
        </div>
      )}

      {/* Info Section */}
      {!activeActivity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-white">Aprende Paso a Paso</h4>
            </div>
            <p className="text-sm text-gray-400">
              Cada actividad incluye guías interactivas y ejemplos listos para usar. 
              Comienza con lo básico y avanza a tu ritmo.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-white">Ambiente Seguro</h4>
            </div>
            <p className="text-sm text-gray-400">
              Todos los simuladores funcionan en tu navegador. Puedes experimentar 
              sin miedo a romper nada. ¡Aprende haciendo!
            </p>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      {!activeActivity && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            Consejos Rápidos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">🤖</span>
              <span className="text-gray-400">
                <strong className="text-white">Visión IA:</strong> Usa tu cámara para detectar objetos y clasificar imágenes.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">💡</span>
              <span className="text-gray-400">
                <strong className="text-white">Python:</strong> Ideal para comenzar. Aprende lógica de programación.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">🎮</span>
              <span className="text-gray-400">
                <strong className="text-white">Roblox:</strong> Crea juegos reales. Copia los scripts a Roblox Studio.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">🔐</span>
              <span className="text-gray-400">
                <strong className="text-white">Terminal:</strong> Aprende comandos de Linux y ciberseguridad ética.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
