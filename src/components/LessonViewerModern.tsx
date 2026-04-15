'use client'

import { useState, useEffect } from 'react'
import { 
  Play, BookOpen, Wrench, Trophy, FileQuestion, Clock, 
  ChevronLeft, ChevronRight, CheckCircle, ExternalLink,
  Lightbulb, Target, List, Image as ImageIcon, Video,
  Code, Download, Share2, Bookmark, ThumbsUp, MessageCircle,
  AlertTriangle, Info, Zap, Award, Brain, Shield, Bot,
  Star, Flame, Gift, ChevronDown, ChevronUp, X, Maximize2,
  Volume2, VolumeX, Settings, SkipForward, RotateCcw
} from 'lucide-react'

interface LessonViewerModernProps {
  lesson: {
    id: string
    title: string
    moduleName: string
    type: 'video' | 'activity' | 'tutorial' | 'project' | 'quiz'
    duration: string
    content?: string
    videoUrl?: string
    imageUrl?: string
    images?: string[]
    pdfUrl?: string
    objectives?: string[]
    materials?: string[]
    steps?: string[]
    tips?: string[]
    challenge?: string
  }
  programId: 'robotica' | 'ia' | 'hacking'
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  onComplete?: () => void
  totalLessons?: number
  currentIndex?: number
}

const programConfig = {
  robotica: {
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    lightGradient: 'from-cyan-500/20 to-blue-600/20',
    icon: Bot,
    name: 'Robótica',
    accent: '#00d4ff'
  },
  ia: {
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    lightGradient: 'from-purple-500/20 to-pink-600/20',
    icon: Brain,
    name: 'Inteligencia Artificial',
    accent: '#a855f7'
  },
  hacking: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    lightGradient: 'from-emerald-500/20 to-teal-600/20',
    icon: Shield,
    name: 'Ciberseguridad',
    accent: '#10b981'
  }
}

const typeConfig = {
  video: { icon: Play, label: 'Video', color: 'text-red-400', bg: 'bg-red-500/20' },
  activity: { icon: Wrench, label: 'Práctica', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  tutorial: { icon: BookOpen, label: 'Tutorial', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  project: { icon: Trophy, label: 'Proyecto', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  quiz: { icon: FileQuestion, label: 'Quiz', color: 'text-green-400', bg: 'bg-green-500/20' }
}

export default function LessonViewerModern({ 
  lesson, 
  programId, 
  onClose, 
  onNext, 
  onPrev,
  onComplete,
  totalLessons = 1,
  currentIndex = 0
}: LessonViewerModernProps) {
  const [activeSection, setActiveSection] = useState<'video' | 'content' | 'practice'>('video')
  const [completed, setCompleted] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['objectives'])
  const [videoProgress, setVideoProgress] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [videoError, setVideoError] = useState(false)
  
  const program = programConfig[programId]
  const lessonType = typeConfig[lesson.type]
  const TypeIcon = lessonType.icon
  const ProgramIcon = program.icon

  // Parsear contenido markdown
  const parseMarkdown = (text: string) => {
    if (!text) return ''
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2"><span class="w-1 h-6 bg-gradient-to-b ' + program.gradient + ' rounded-full"></span>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 text-gray-300 ml-4"><span class="text-' + program.color + '-400 mt-1">•</span><span>$1</span></li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="flex items-start gap-3 text-gray-300 ml-4 mb-2"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-' + program.color + '-500/20 text-' + program.color + '-400 text-sm flex items-center justify-center font-medium">$1</span></li>')
      .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed mb-3">')
      .replace(/\n/g, '<br/>')
  }

  // Obtener URL de embed del video
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return ''
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
    }
    
    // Google Drive
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }
    
    return url
  }

  // Obtener thumbnail de YouTube
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`
    }
    return null
  }

  // Abrir video en nueva pestaña (fallback)
  const openVideoExternal = () => {
    if (lesson.videoUrl) {
      window.open(lesson.videoUrl, '_blank')
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleComplete = () => {
    setCompleted(true)
    setXpEarned(prev => prev + 50)
    onComplete?.()
  }

  const progressPercent = ((currentIndex + 1) / totalLessons) * 100

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/95 backdrop-blur-sm overflow-hidden">
      {/* Header con progreso estilo Duolingo */}
      <div className="bg-dark-900 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Botón cerrar */}
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Cerrar</span>
            </button>

            {/* Barra de progreso central */}
            <div className="flex-1 max-w-md mx-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${program.gradient} rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {currentIndex + 1}/{totalLessons}
                </span>
              </div>
            </div>

            {/* XP y streak */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-400">
                <Flame className="w-5 h-5" />
                <span className="font-bold">3</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold">{xpEarned} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Layout estilo Platzi */}
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex">
        {/* Panel izquierdo - Video/Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs de navegación */}
          <div className="bg-dark-800 border-b border-dark-700 px-4">
            <div className="flex gap-1">
              {[
                { id: 'video', label: 'Video', icon: Play },
                { id: 'content', label: 'Contenido', icon: BookOpen },
                { id: 'practice', label: 'Práctica', icon: Code }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeSection === tab.id
                      ? `text-${program.color}-400 border-${program.color}-400`
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Área de contenido */}
          <div className="flex-1 overflow-y-auto">
            {activeSection === 'video' && (
              <div className="p-4">
                {/* Video Player con fallback visual */}
                {lesson.videoUrl ? (
                  <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                    {!videoError ? (
                      <div className="aspect-video relative">
                        <iframe
                          src={getVideoEmbedUrl(lesson.videoUrl)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          onError={() => setVideoError(true)}
                        />
                        {/* Overlay para detectar video no disponible */}
                      </div>
                    ) : (
                      /* Fallback visual cuando el video no funciona */
                      <div className="aspect-video relative">
                        {getYouTubeThumbnail(lesson.videoUrl) ? (
                          <img 
                            src={getYouTubeThumbnail(lesson.videoUrl)!}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-video.jpg'
                            }}
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${program.gradient} opacity-20`} />
                        )}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                          <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${program.gradient} flex items-center justify-center mb-4 cursor-pointer hover:scale-110 transition-transform`} onClick={openVideoExternal}>
                            <ExternalLink className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white font-medium mb-2">Video no disponible en embed</p>
                          <button 
                            onClick={openVideoExternal}
                            className={`px-6 py-2 bg-gradient-to-r ${program.gradient} rounded-full text-white font-medium hover:opacity-90 transition-opacity`}
                          >
                            Ver en YouTube →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Sin video - mostrar contenido visual alternativo */
                  <div className={`aspect-video bg-gradient-to-br ${program.lightGradient} rounded-2xl flex items-center justify-center border border-${program.color}-500/30`}>
                    <div className="text-center p-8">
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${program.gradient} flex items-center justify-center mx-auto mb-6`}>
                        <ProgramIcon className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{lesson.title}</h3>
                      <p className="text-gray-300 mb-6">Esta lección es práctica. Lee el contenido y usa los simuladores.</p>
                      <button 
                        onClick={() => setActiveSection('content')}
                        className={`px-6 py-3 bg-gradient-to-r ${program.gradient} rounded-xl text-white font-medium hover:opacity-90 transition-opacity`}
                      >
                        Ver Contenido →
                      </button>
                    </div>
                  </div>
                )}

                {/* Info del video */}
                <div className="mt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className={`flex items-center gap-1 ${lessonType.color}`}>
                          <TypeIcon className="w-4 h-4" />
                          {lessonType.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <ProgramIcon className="w-4 h-4" />
                          {program.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                      {lesson.pdfUrl && (
                        <a 
                          href={lesson.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'content' && (
              <div className="p-6 max-w-3xl mx-auto">
                {/* Contenido formateado */}
                <div 
                  className="prose prose-invert max-w-none [&_img]:relative [&_img]:z-0 [&_img]:max-w-[200px] [&_img]:float-right [&_img]:ml-4 [&_img]:mb-4 [&_img]:rounded-xl [&_p]:relative [&_p]:z-10"
                  dangerouslySetInnerHTML={{ __html: `<div class="text-gray-300 leading-relaxed space-y-3">${parseMarkdown(lesson.content || '')}</div>` }}
                />

                {/* Imágenes */}
                {lesson.images && lesson.images.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-cyan-400" />
                      Diagramas y Referencias
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lesson.images.map((img, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-dark-600 hover:border-cyan-500/50 transition-colors">
                          <img 
                            src={img} 
                            alt={`Imagen ${idx + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'practice' && (
              <div className="p-6 max-w-3xl mx-auto">
                <div className={`bg-gradient-to-r ${program.lightGradient} rounded-2xl p-6 border border-${program.color}-500/30`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className={`w-6 h-6 text-${program.color}-400`} />
                    Hora de Practicar
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Aplica lo aprendido usando nuestros simuladores interactivos. 
                    Experimenta, equivócate y aprende haciendo.
                  </p>
                  
                  {/* Simuladores disponibles */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <a 
                      href="https://scratch.mit.edu/projects/editor" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Scratch</p>
                        <p className="text-gray-500 text-xs">Bloques visuales</p>
                      </div>
                    </a>
                    <a 
                      href="https://wokwi.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Wokwi</p>
                        <p className="text-gray-500 text-xs">Circuitos ESP32</p>
                      </div>
                    </a>
                    <a 
                      href="https://www.tinkercad.com/circuits" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Tinkercad</p>
                        <p className="text-gray-500 text-xs">Circuitos Arduino</p>
                      </div>
                    </a>
                    <a 
                      href="https://trinket.io/python" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Trinket</p>
                        <p className="text-gray-500 text-xs">Python online</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-amber-500/10 rounded-2xl p-6 border border-amber-500/30">
                  <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Tips para esta lección
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>Toma notas mientras ves el video</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>Pausa y practica cada concepto nuevo</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>No tengas miedo de experimentar</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Sidebar con info adicional */}
        <div className="w-80 bg-dark-800 border-l border-dark-700 overflow-y-auto hidden lg:block">
          <div className="p-4 space-y-4">
            {/* Progreso de la lección */}
            <div className="bg-dark-900 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Tu progreso</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-green-500' : 'bg-dark-700'}`}>
                    {completed ? <CheckCircle className="w-5 h-5 text-white" /> : <Play className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Ver el video</p>
                    <p className="text-xs text-gray-500">{completed ? 'Completado' : 'En progreso'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Leer el contenido</p>
                    <p className="text-xs text-gray-500">Pendiente</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center">
                    <Code className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Practicar</p>
                    <p className="text-xs text-gray-500">Pendiente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Objetivos */}
            <div className="bg-dark-900 rounded-xl p-4">
              <button 
                onClick={() => toggleSection('objectives')}
                className="w-full flex items-center justify-between text-white"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Target className={`w-5 h-5 text-${program.color}-400`} />
                  Objetivos
                </span>
                {expandedSections.includes('objectives') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.includes('objectives') && (
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className={`w-4 h-4 text-${program.color}-400 mt-0.5 flex-shrink-0`} />
                    <span>Comprender los conceptos clave</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className={`w-4 h-4 text-${program.color}-400 mt-0.5 flex-shrink-0`} />
                    <span>Aplicar en práctica</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className={`w-4 h-4 text-${program.color}-400 mt-0.5 flex-shrink-0`} />
                    <span>Completar el ejercicio</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Reto extra */}
            <div className={`bg-gradient-to-br ${program.lightGradient} rounded-xl p-4 border border-${program.color}-500/30`}>
              <div className="flex items-center gap-2 mb-2">
                <Gift className={`w-5 h-5 text-${program.color}-400`} />
                <span className="font-bold text-white">Reto Extra</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                ¿Puedes modificar lo aprendido para crear algo nuevo? ¡Intenta agregar tu toque personal!
              </p>
              <button className={`w-full py-2 bg-${program.color}-500 hover:bg-${program.color}-400 text-white rounded-lg font-medium transition-colors`}>
                Aceptar Reto
              </button>
            </div>

            {/* Materiales del kit */}
            <div className="bg-dark-900 rounded-xl p-4">
              <button 
                onClick={() => toggleSection('materials')}
                className="w-full flex items-center justify-between text-white"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  Materiales
                </span>
                {expandedSections.includes('materials') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.includes('materials') && (
                <div className="mt-3 text-sm text-gray-400">
                  <p>Revisa tu kit para esta lección en la pestaña "Mi Kit"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer con navegación */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            onClick={handleComplete}
            disabled={completed}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              completed 
                ? 'bg-green-500 text-white'
                : `bg-gradient-to-r ${program.gradient} text-white hover:opacity-90`
            }`}
          >
            {completed ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                ¡Completado!
              </span>
            ) : (
              'Marcar como completado'
            )}
          </button>

          <button
            onClick={onNext}
            disabled={!onNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              onNext 
                ? `bg-gradient-to-r ${program.gradient} text-white hover:opacity-90`
                : 'text-gray-400 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
