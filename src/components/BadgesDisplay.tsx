'use client'

import { useState } from 'react'
import { Trophy, Star, Zap, Target, Award, Flame, BookOpen, Code, Bot, Brain, Shield, Lock } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface BadgesDisplayProps {
  completedLessons?: number
  totalLessons?: number
  streak?: number
  programsCompleted?: string[]
}

const BADGES_CONFIG: Omit<Badge, 'unlocked' | 'progress'>[] = [
  {
    id: 'first_lesson',
    name: 'Primera Lección',
    description: 'Completa tu primera lección',
    icon: Star,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Completa 5 lecciones',
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    maxProgress: 5,
  },
  {
    id: 'dedicated',
    name: 'Dedicado',
    description: 'Completa 10 lecciones',
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    maxProgress: 10,
  },
  {
    id: 'master',
    name: 'Maestro',
    description: 'Completa 25 lecciones',
    icon: Trophy,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    maxProgress: 25,
  },
  {
    id: 'streak_3',
    name: 'En Racha',
    description: '3 días consecutivos',
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    name: 'Imparable',
    description: '7 días consecutivos',
    icon: Flame,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    maxProgress: 7,
  },
  {
    id: 'robotica',
    name: 'Robotista',
    description: 'Completa módulo de Robótica',
    icon: Bot,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    id: 'ia',
    name: 'IA Expert',
    description: 'Completa módulo de IA',
    icon: Brain,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
  },
  {
    id: 'hacking',
    name: 'Hacker Ético',
    description: 'Completa módulo de Ciberseguridad',
    icon: Shield,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
]

export default function BadgesDisplay({ 
  completedLessons = 0, 
  totalLessons = 0,
  streak = 0,
  programsCompleted = []
}: BadgesDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const badges: Badge[] = BADGES_CONFIG.map(badge => {
    let unlocked = false
    let progress = 0

    switch (badge.id) {
      case 'first_lesson':
        unlocked = completedLessons >= 1
        progress = Math.min(completedLessons, 1)
        break
      case 'explorer':
        unlocked = completedLessons >= 5
        progress = Math.min(completedLessons, 5)
        break
      case 'dedicated':
        unlocked = completedLessons >= 10
        progress = Math.min(completedLessons, 10)
        break
      case 'master':
        unlocked = completedLessons >= 25
        progress = Math.min(completedLessons, 25)
        break
      case 'streak_3':
        unlocked = streak >= 3
        progress = Math.min(streak, 3)
        break
      case 'streak_7':
        unlocked = streak >= 7
        progress = Math.min(streak, 7)
        break
      case 'robotica':
        unlocked = programsCompleted.includes('robotica')
        break
      case 'ia':
        unlocked = programsCompleted.includes('ia')
        break
      case 'hacking':
        unlocked = programsCompleted.includes('hacking')
        break
    }

    return { ...badge, unlocked, progress }
  })

  const unlockedCount = badges.filter(b => b.unlocked).length

  return (
    <div className="bg-dark-800/80 backdrop-blur rounded-2xl p-6 border border-dark-600">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="font-bold text-white">Mis Insignias</h3>
            <p className="text-sm text-gray-500">{unlockedCount} de {badges.length} desbloqueadas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {badges.map((badge) => {
          const Icon = badge.icon
          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative p-3 rounded-xl border transition-all duration-300 ${
                badge.unlocked 
                  ? `${badge.bgColor} border-transparent hover:scale-105` 
                  : 'bg-dark-700/50 border-dark-600 opacity-50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  badge.unlocked ? badge.bgColor : 'bg-dark-600'
                }`}>
                  {badge.unlocked ? (
                    <Icon className={`w-5 h-5 ${badge.color}`} />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <span className={`text-xs font-medium text-center ${
                  badge.unlocked ? 'text-white' : 'text-gray-600'
                }`}>
                  {badge.name}
                </span>
              </div>
              
              {/* Progress bar for badges with progress */}
              {badge.maxProgress && !badge.unlocked && (
                <div className="absolute bottom-1 left-2 right-2">
                  <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${badge.bgColor.replace('/20', '')}`}
                      style={{ width: `${((badge.progress || 0) / badge.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-dark-800 rounded-2xl p-6 max-w-sm w-full border border-dark-600"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
                selectedBadge.unlocked ? selectedBadge.bgColor : 'bg-dark-700'
              }`}>
                {selectedBadge.unlocked ? (
                  <selectedBadge.icon className={`w-10 h-10 ${selectedBadge.color}`} />
                ) : (
                  <Lock className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{selectedBadge.name}</h3>
              <p className="text-gray-400 mb-4">{selectedBadge.description}</p>
              
              {selectedBadge.maxProgress && !selectedBadge.unlocked && (
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progreso</span>
                    <span className="text-white">{selectedBadge.progress}/{selectedBadge.maxProgress}</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${selectedBadge.bgColor.replace('/20', '')}`}
                      style={{ width: `${((selectedBadge.progress || 0) / selectedBadge.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {selectedBadge.unlocked && (
                <div className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">¡Desbloqueada!</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full mt-6 py-2 bg-dark-700 hover:bg-dark-600 rounded-xl text-white font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
