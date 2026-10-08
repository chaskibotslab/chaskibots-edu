'use client'

import { Play, BookOpen, Wrench, Trophy, FileQuestion, Clock, Lock, ChevronRight, Image, Video, FileText, ExternalLink } from 'lucide-react'

interface LessonCardProps {
  lesson: {
    id: string
    title: string
    type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
    duration: string
    content?: string
    locked?: boolean
    images?: string[]
    videoUrl?: string
    guia?: { reto?: { texto?: string } } | null
  }
  isSelected: boolean
  onSelect: () => void
  index: number
}

const typeConfig = {
  video: {
    icon: Play,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Video'
  },
  activity: {
    icon: Wrench,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-yellow-500/30',
    label: 'Actividad'
  },
  tutorial: {
    icon: BookOpen,
    color: 'text-chaski-primary',
    bg: 'bg-chaski-primary/10',
    border: 'border-chaski-primary/30',
    label: 'Tutorial'
  },
  project: {
    icon: Trophy,
    color: 'text-chaski-primary',
    bg: 'bg-chaski-primary/10',
    border: 'border-chaski-primary/30',
    label: 'Proyecto'
  },
  quiz: {
    icon: FileQuestion,
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    label: 'Quiz'
  }
}

export default function LessonCard({ lesson, isSelected, onSelect, index }: LessonCardProps) {
  const config = typeConfig[lesson.type] || typeConfig.video
  const Icon = config.icon

  if (lesson.locked) {
    return (
      <div className="relative bg-white rounded-2xl p-4 border border-slate-200/80 opacity-70">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 font-medium">{lesson.title}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.duration}
              </span>
              <span className={`px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onSelect}
      className={`group w-full text-left bg-white rounded-2xl p-4 border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isSelected ? config.border : 'border-slate-200/80 hover:border-chaski-primary/30'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Número de lección e ícono */}
        <div className={`relative w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className="absolute -top-2 -left-2 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white">
            {index}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-chaski-dark truncate group-hover:text-chaski-primary transition-colors">{lesson.title}</h4>

          {/* Descripción corta */}
          {(lesson.guia?.reto?.texto || lesson.content) && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
              {lesson.guia?.reto?.texto || lesson.content}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {lesson.duration}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            {lesson.videoUrl && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Video className="w-3 h-3" />
                Video
              </span>
            )}
            {lesson.images && lesson.images.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Image className="w-3 h-3" />
                {lesson.images.length} img
              </span>
            )}
          </div>
        </div>

        {/* Flecha */}
        <ChevronRight className={`w-5 h-5 flex-shrink-0 mt-3 transition-all group-hover:translate-x-0.5 ${isSelected ? 'text-chaski-primary' : 'text-slate-300 group-hover:text-chaski-primary'}`} />
      </div>
    </button>
  )
}
