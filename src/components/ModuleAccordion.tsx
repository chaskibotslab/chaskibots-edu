'use client'

import { useState } from 'react'
import { ChevronDown, BookOpen, Clock, CheckCircle, Play } from 'lucide-react'
import LessonCard from './LessonCard'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
  duration: string
  order: number
  content?: string
  locked?: boolean
  images?: string[]
  videoUrl?: string
}

interface ModuleAccordionProps {
  moduleName: string
  lessons: Lesson[]
  moduleIndex: number
  selectedLesson: string | null
  onSelectLesson: (id: string) => void
  defaultOpen?: boolean
  programColor: 'blue' | 'purple' | 'red'
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    accent: 'bg-blue-500',
    glow: 'shadow-blue-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    accent: 'bg-purple-500',
    glow: 'shadow-purple-500/20'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    accent: 'bg-red-500',
    glow: 'shadow-red-500/20'
  }
}

export default function ModuleAccordion({ 
  moduleName, 
  lessons, 
  moduleIndex, 
  selectedLesson, 
  onSelectLesson,
  defaultOpen = false,
  programColor = 'blue'
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const colors = colorConfig[programColor]
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)
  const totalDuration = sortedLessons.reduce((acc, l) => {
    const mins = parseInt(l.duration) || 0
    return acc + mins
  }, 0)
  const completedCount = 0 // TODO: implementar progreso real

  return (
    <div className={`rounded-2xl border ${colors.border} overflow-hidden transition-all duration-300 ${isOpen ? `shadow-lg ${colors.glow}` : ''}`}>
      {/* Header del módulo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-4 p-5 ${colors.bg} hover:brightness-110 transition-all`}
      >
        {/* Número del módulo */}
        <div className={`w-12 h-12 ${colors.accent} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
          {moduleIndex}
        </div>

        {/* Info del módulo */}
        <div className="flex-1 text-left">
          <h3 className="font-bold text-white text-lg">{moduleName}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {lessons.length} lecciones
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{totalDuration} min
            </span>
            {completedCount > 0 && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                {completedCount}/{lessons.length}
              </span>
            )}
          </div>
        </div>

        {/* Barra de progreso mini */}
        <div className="hidden sm:block w-24">
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.accent} rounded-full transition-all`}
              style={{ width: `${(completedCount / lessons.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flecha */}
        <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Contenido expandible */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 space-y-3 bg-dark-900/50">
          {sortedLessons.map((lesson, idx) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isSelected={selectedLesson === lesson.id}
              onSelect={() => !lesson.locked && onSelectLesson(lesson.id)}
              index={idx + 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
