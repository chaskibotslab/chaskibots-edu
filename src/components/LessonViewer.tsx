'use client'

import { useState } from 'react'
import { 
  Play, BookOpen, Wrench, Trophy, FileQuestion, Clock, 
  ChevronLeft, ChevronRight, CheckCircle, ExternalLink,
  Lightbulb, Target, List, Image as ImageIcon, Video,
  Code, Download, Share2, Bookmark, ThumbsUp, MessageCircle,
  AlertTriangle, Info, Zap, Award, Brain, Shield, Bot
} from 'lucide-react'

interface Resource {
  title: string
  url: string
  type?: string
}

interface ExternalLink {
  title: string
  url: string
  desc?: string
}

interface LessonViewerProps {
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
    resources?: string | Resource[]
    externalLinks?: string | ExternalLink[]
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
}

const programConfig = {
  robotica: {
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    icon: Bot,
    name: 'Robótica'
  },
  ia: {
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    icon: Brain,
    name: 'Inteligencia Artificial'
  },
  hacking: {
    color: 'red',
    gradient: 'from-red-500 to-orange-600',
    icon: Shield,
    name: 'Ciberseguridad'
  }
}

const typeConfig = {
  video: { icon: Play, label: 'Video', color: 'text-red-400', bg: 'bg-red-500/20' },
  activity: { icon: Wrench, label: 'Actividad', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  tutorial: { icon: BookOpen, label: 'Tutorial', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  project: { icon: Trophy, label: 'Proyecto', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  quiz: { icon: FileQuestion, label: 'Quiz', color: 'text-green-400', bg: 'bg-green-500/20' }
}

export default function LessonViewer({ lesson, programId, onClose, onNext, onPrev }: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'practice'>('content')
  const [completed, setCompleted] = useState(false)
  
  const program = programConfig[programId]
  const lessonType = typeConfig[lesson.type]
  const TypeIcon = lessonType.icon
  const ProgramIcon = program.icon

  // Parsear contenido enriquecido
  const parseContent = (content: string) => {
    if (!content) return { description: '', objectives: [], materials: [], steps: [], tips: [], challenge: '' }
    
    // Intentar parsear como JSON si tiene formato especial
    try {
      if (content.startsWith('{')) {
        return JSON.parse(content)
      }
    } catch {}
    
    return { description: content, objectives: [], materials: [], steps: [], tips: [], challenge: '' }
  }

  const parsedContent = parseContent(lesson.content || '')
  const description = typeof parsedContent === 'string' ? parsedContent : parsedContent.description || lesson.content

  // Parsear recursos y enlaces externos
  const parseJsonField = <T,>(field: string | T[] | undefined): T[] => {
    if (!field) return []
    if (Array.isArray(field)) return field
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }

  const resources = parseJsonField<Resource>(lesson.resources)
  const externalLinks = parseJsonField<ExternalLink>(lesson.externalLinks)

  // Extraer video ID de YouTube
  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : null
  }

  // Extraer ID de Google Drive
  const getGoogleDriveId = (url: string): string | null => {
    // Formatos: /file/d/ID/view, /file/d/ID, id=ID
    const match = url.match(/(?:\/file\/d\/|id=)([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  // Determinar tipo de video
  const getVideoEmbed = (url: string) => {
    const youtubeId = getYouTubeId(url)
    if (youtubeId) {
      return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${youtubeId}` }
    }
    
    const driveId = getGoogleDriveId(url)
    if (driveId) {
      return { type: 'drive', embedUrl: `https://drive.google.com/file/d/${driveId}/preview` }
    }
    
    return null
  }

  // Convertir URL de imagen de Google Drive a formato embebible
  const getImageUrl = (url: string): string => {
    if (!url) return ''
    
    // Si es Google Drive, convertir a formato de imagen directa
    const driveId = getGoogleDriveId(url)
    if (driveId) {
      return `https://drive.google.com/uc?export=view&id=${driveId}`
    }
    
    return url
  }

  const videoEmbed = lesson.videoUrl ? getVideoEmbed(lesson.videoUrl) : null

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className={`sticky top-0 z-10 bg-gradient-to-r ${program.gradient} p-4 shadow-lg`}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-gray-900/80 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Volver a lecciones</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className={`${lessonType.bg} px-3 py-1 rounded-full flex items-center gap-2`}>
                <TypeIcon className={`w-4 h-4 ${lessonType.color}`} />
                <span className="text-gray-900 text-sm font-medium">{lessonType.label}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-900/80">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{lesson.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto p-6">
          {/* Title Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <ProgramIcon className="w-4 h-4" />
              <span>{program.name}</span>
              <ChevronRight className="w-4 h-4" />
              <span>{lesson.moduleName}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            
            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${program.gradient} transition-all duration-500`}
                  style={{ width: completed ? '100%' : '0%' }}
                />
              </div>
              <span className="text-sm text-gray-600">{completed ? 'Completado' : 'En progreso'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
            {[
              { id: 'content', label: 'Contenido', icon: BookOpen },
              { id: 'resources', label: 'Recursos', icon: Download },
              { id: 'practice', label: 'Práctica', icon: Code }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab.id 
                    ? `bg-gray-100 text-gray-900 border-b-2 border-${program.color}-500` 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player - YouTube or Google Drive */}
                {lesson.type === 'video' && videoEmbed && (
                  <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      src={videoEmbed.embedUrl}
                      title={lesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}

                {/* Video Placeholder when no valid URL */}
                {lesson.type === 'video' && !videoEmbed && (
                  <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`w-20 h-20 ${lessonType.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Play className={`w-10 h-10 ${lessonType.color}`} />
                      </div>
                      <p className="text-gray-600">Video próximamente</p>
                    </div>
                  </div>
                )}

                {/* Lesson Image */}
                {lesson.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-gray-200">
                    <img 
                      src={getImageUrl(lesson.imageUrl)} 
                      alt={lesson.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className={`w-5 h-5 text-${program.color}-400`} />
                    Descripción
                  </h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>

                {/* Imágenes adicionales de la lección */}
                {lesson.images && lesson.images.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className={`w-5 h-5 text-${program.color}-400`} />
                      Imágenes y Diagramas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lesson.images.map((img, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 hover:border-brand-purple/50 transition-colors">
                          <img 
                            src={getImageUrl(img)} 
                            alt={`Diagrama ${idx + 1}`}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enlace a Simuladores */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className={`w-5 h-5 text-${program.color}-400`} />
                    Practica en el Simulador
                  </h2>
                  <div className="bg-white rounded-xl p-6 border border-dark-700">
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${program.gradient} rounded-xl flex items-center justify-center`}>
                        <Code className="w-8 h-8 text-gray-900" />
                      </div>
                      <p className="text-gray-600 text-center">Aplica lo aprendido usando nuestros simuladores interactivos</p>
                      <button 
                        onClick={onClose}
                        className={`px-6 py-3 bg-gradient-to-r ${program.gradient} rounded-xl text-gray-900 font-medium hover:opacity-90 transition-opacity flex items-center gap-2`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ir a Simuladores
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDF Descargable */}
                {lesson.pdfUrl && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Download className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Material PDF</h3>
                          <p className="text-sm text-gray-600">Descarga el material de apoyo para esta lección</p>
                        </div>
                      </div>
                      <a
                        href={lesson.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-gray-900 rounded-xl font-medium flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </a>
                    </div>
                  </div>
                )}

                {/* Steps (for tutorials/activities) */}
                {(lesson.type === 'tutorial' || lesson.type === 'activity' || lesson.type === 'project') && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <List className={`w-5 h-5 text-${program.color}-400`} />
                      Pasos a seguir
                    </h2>
                    <div className="space-y-4">
                      {[
                        'Lee la descripción completa de la lección',
                        'Observa el diagrama y entiende los conceptos',
                        'Abre el simulador recomendado',
                        'Sigue las instrucciones paso a paso',
                        'Experimenta y prueba variaciones',
                        'Completa el reto final'
                      ].map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 bg-gray-100/50 rounded-xl">
                          <div className={`w-8 h-8 bg-gradient-to-r ${program.gradient} rounded-lg flex items-center justify-center text-gray-900 font-bold text-sm flex-shrink-0`}>
                            {idx + 1}
                          </div>
                          <p className="text-gray-300 pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Objectives */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className={`w-4 h-4 text-${program.color}-400`} />
                    Objetivos
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'Comprender los conceptos básicos',
                      'Aplicar lo aprendido en práctica',
                      'Completar el ejercicio propuesto'
                    ].map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div className="bg-yellow-500/10 rounded-2xl p-5 border border-yellow-500/30">
                  <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-yellow-200/80">
                    <li>• Toma notas mientras aprendes</li>
                    <li>• No tengas miedo de experimentar</li>
                    <li>• Pregunta si tienes dudas</li>
                  </ul>
                </div>

                {/* Challenge */}
                <div className={`bg-gradient-to-br ${program.gradient} rounded-2xl p-5`}>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Reto Extra
                  </h3>
                  <p className="text-gray-900/90 text-sm mb-4">
                    ¿Puedes modificar lo aprendido para crear algo nuevo? ¡Intenta agregar tu toque personal!
                  </p>
                  <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-gray-900 font-medium transition-colors">
                    Aceptar Reto
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
                    <Bookmark className="w-4 h-4" />
                    Guardar
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Resources from lesson data */}
              {resources.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Materiales de la lección
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource, idx) => {
                      const iconMap: Record<string, any> = {
                        video: Video,
                        pdf: Download,
                        code: Code,
                        image: ImageIcon
                      }
                      const Icon = iconMap[resource.type || 'pdf'] || Download
                      const colorMap: Record<string, string> = {
                        video: 'red',
                        pdf: 'green',
                        code: 'purple',
                        image: 'blue'
                      }
                      const color = colorMap[resource.type || 'pdf'] || 'gray'
                      
                      return (
                        <a 
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 hover:border-${color}-500/50 transition-all text-left group block`}
                        >
                          <div className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-6 h-6 text-${color}-400`} />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{resource.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Abrir recurso
                          </p>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* External Links */}
              {externalLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Enlaces externos recomendados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {externalLinks.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-cyan-500/50 transition-all flex items-center gap-4 group"
                      >
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ExternalLink className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{link.title}</h4>
                          {link.desc && <p className="text-sm text-gray-600">{link.desc}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Default resources if none provided */}
              {resources.length === 0 && externalLinks.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Video, title: 'Video Tutorial', desc: 'Explicación paso a paso', color: 'red' },
                    { icon: ImageIcon, title: 'Diagramas', desc: 'Esquemas visuales', color: 'blue' },
                    { icon: Download, title: 'Material PDF', desc: 'Guía descargable', color: 'green' },
                    { icon: Code, title: 'Código Ejemplo', desc: 'Código para practicar', color: 'purple' },
                    { icon: ExternalLink, title: 'Simulador', desc: 'Practica en línea', color: 'cyan' },
                    { icon: MessageCircle, title: 'Foro', desc: 'Pregunta a la comunidad', color: 'yellow' }
                  ].map((resource, idx) => (
                    <button 
                      key={idx}
                      className={`p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 hover:border-${resource.color}-500/50 transition-all text-left group`}
                    >
                      <div className={`w-12 h-12 bg-${resource.color}-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <resource.icon className={`w-6 h-6 text-${resource.color}-400`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ejercicio Práctico</h2>
                <p className="text-gray-600 mb-6">
                  Aplica lo que aprendiste completando este ejercicio interactivo.
                </p>
                <div className="bg-white rounded-xl p-8 border border-dark-700 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${program.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Code className="w-10 h-10 text-gray-900" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Abrir Simulador</h3>
                  <p className="text-gray-600 mb-4">Practica en un entorno seguro</p>
                  <button className={`px-6 py-3 bg-gradient-to-r ${program.gradient} rounded-xl text-gray-900 font-medium hover:opacity-90 transition-opacity`}>
                    Iniciar Práctica
                  </button>
                </div>
              </div>

              {/* Quiz Preview */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Rápido</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-xl">
                    <p className="text-gray-900 mb-3">¿Qué aprendiste en esta lección?</p>
                    <div className="space-y-2">
                      {['Opción A', 'Opción B', 'Opción C', 'Opción D'].map((opt, idx) => (
                        <button 
                          key={idx}
                          className="w-full p-3 bg-dark-600 hover:bg-dark-500 rounded-lg text-left text-gray-300 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={onPrev}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
            
            <button 
              onClick={() => setCompleted(true)}
              className={`px-6 py-3 bg-gradient-to-r ${program.gradient} rounded-xl text-gray-900 font-medium hover:opacity-90 transition-opacity flex items-center gap-2`}
            >
              <CheckCircle className="w-5 h-5" />
              Marcar como completado
            </button>
            
            <button 
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
            >
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
