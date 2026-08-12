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
  }
  isSelected: boolean
  onSelect: () => void
  index: number
}

const typeConfig = {
  video: {
    icon: Play,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    label: 'Video'
  },
  activity: {
    icon: Wrench,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    label: 'Actividad'
  },
  tutorial: {
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    label: 'Tutorial'
  },
  project: {
    icon: Trophy,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    label: 'Proyecto'
  },
  quiz: {
    icon: FileQuestion,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    label: 'Quiz'
  }
}

export default function LessonCard({ lesson, isSelected, onSelect, index }: LessonCardProps) {
  const config = typeConfig[lesson.type] || typeConfig.video
  const Icon = config.icon

  if (lesson.locked) {
    return (
      <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/10 opacity-60">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-slate-400 font-medium">{lesson.title}</p>
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
          <div className="flex items-center gap-2 text-slate-300">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Bloqueado</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left bg-white/[0.03] rounded-xl p-4 border transition-all duration-300 hover:scale-[1.01] hover:bg-white/[0.06] ${
        isSelected
          ? `${config.border} border-2 shadow-lg shadow-${config.color}/10`
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Número de lección e ícono */}
        <div className={`relative w-14 h-14 ${config.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
          <span className="absolute -top-2 -left-2 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-dark-800">
            {index}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{lesson.title}</h4>

          {/* Descripción corta */}
          {lesson.content && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {lesson.content}
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
        <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-white rotate-90' : 'text-slate-500'}`} />
      </div>
    </button>
  )
}
