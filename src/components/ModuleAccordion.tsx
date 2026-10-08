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
  guia?: { reto?: { texto?: string } } | null
}

interface ModuleAccordionProps {
  moduleName: string
  lessons: Lesson[]
  moduleIndex: number
  selectedLesson: string | null
  onSelectLesson: (id: string) => void
  defaultOpen?: boolean
  programColor: 'blue' | 'purple' | 'red' | 'green'
}

const colorConfig = {
  blue: {
    bg: 'bg-chaski-primary/10',
    border: 'border-chaski-primary/30',
    text: 'text-chaski-secondary',
    accent: 'bg-chaski-primary',
    glow: 'shadow-chaski-primary/20'
  },
  purple: {
    bg: 'bg-chaski-primary/10',
    border: 'border-chaski-primary/30',
    text: 'text-chaski-secondary',
    accent: 'bg-chaski-primary',
    glow: 'shadow-chaski-primary/20'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    accent: 'bg-red-500',
    glow: 'shadow-red-500/20'
  },
  green: {
    bg: 'bg-hack-green/10',
    border: 'border-hack-green/30',
    text: 'text-hack-green',
    accent: 'bg-hack-green',
    glow: 'shadow-hack-green/20'
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
    <div className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${isOpen ? `${colors.border} shadow-md` : 'border-slate-200/80 shadow-sm'}`}>
      {/* Header del módulo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-4 p-4 sm:p-5 transition-colors ${isOpen ? colors.bg : 'hover:bg-slate-50'}`}
      >
        {/* Número del módulo */}
        <div className={`w-12 h-12 ${colors.accent} rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {moduleIndex}
        </div>

        {/* Info del módulo */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Módulo {moduleIndex}</p>
          <h3 className="font-bold text-chaski-dark text-lg leading-tight truncate">{moduleName}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {lessons.length} lecciones
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{totalDuration} min
            </span>
            {completedCount > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                {completedCount}/{lessons.length}
              </span>
            )}
          </div>
        </div>

        {/* Flecha */}
        <ChevronDown className={`w-6 h-6 ${colors.text} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Contenido expandible */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-3 sm:p-4 space-y-2.5 bg-slate-50/70 border-t border-slate-100">
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
