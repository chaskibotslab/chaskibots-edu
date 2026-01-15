'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit2, Trash2, Save, X, 
  Cpu, Brain, Shield, Wifi, ExternalLink,
  Clock, Wrench, Zap
} from 'lucide-react'
import { EDUCATION_LEVELS } from '@/lib/constants'

interface Project {
  id: string
  levelId: string
  projectName: string
  category: 'ia' | 'hacking' | 'iot' | 'robotics'
  description: string
  hardware: string
  difficulty: 'facil' | 'medio' | 'avanzado' | 'experto'
  duration: string
  videoUrl: string
  tutorialUrl: string
  resources: string
}

const CATEGORIES = [
  { value: 'ia', label: 'Inteligencia Artificial', icon: Brain, color: 'neon-pink' },
  { value: 'hacking', label: 'Hacking Etico', icon: Shield, color: 'neon-orange' },
  { value: 'iot', label: 'IoT / Domotica', icon: Wifi, color: 'neon-cyan' },
  { value: 'robotics', label: 'Robotica', icon: Cpu, color: 'neon-purple' },
]

const DIFFICULTY_LEVELS = [
  { value: 'facil', label: 'Facil', color: 'green' },
  { value: 'medio', label: 'Medio', color: 'yellow' },
  { value: 'avanzado', label: 'Avanzado', color: 'orange' },
  { value: 'experto', label: 'Experto', color: 'red' },
]

export default function ProjectsAdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'admin'

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    levelId: '',
    projectName: '',
    category: 'ia' as Project['category'],
    description: '',
    hardware: '',
    difficulty: 'medio' as Project['difficulty'],
    duration: '',
    videoUrl: '',
    tutorialUrl: '',
    resources: '',
  })

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    loadProjects()
  }, [selectedLevel, selectedCategory])

  const loadProjects = async () => {
    setLoading(true)
    try {
      let url = '/api/projects?'
      if (selectedLevel) url += 'levelId=' + selectedLevel + '&'
      if (selectedCategory) url += 'category=' + selectedCategory
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProjects(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
    setLoading(false)
  }

  const openCreateModal = () => {
    setIsCreating(true)
    setEditingProject(null)
    setFormData({
      levelId: selectedLevel || '',
      projectName: '',
      category: 'ia',
      description: '',
      hardware: '',
      difficulty: 'medio',
      duration: '',
      videoUrl: '',
      tutorialUrl: '',
      resources: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setIsCreating(false)
    setEditingProject(project)
    setFormData({
      levelId: project.levelId,
      projectName: project.projectName,
      category: project.category,
      description: project.description,
      hardware: project.hardware,
      difficulty: project.difficulty,
      duration: project.duration,
      videoUrl: project.videoUrl,
      tutorialUrl: project.tutorialUrl,
      resources: project.resources,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    setMessage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const method = isCreating ? 'POST' : 'PUT'
      const response = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProject?.id,
          ...formData
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: isCreating ? 'Proyecto creado' : 'Proyecto actualizado' })
        loadProjects()
        setTimeout(() => closeModal(), 1000)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Error al guardar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexion' })
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este proyecto?')) return

    try {
      const response = await fetch('/api/projects?id=' + id, { method: 'DELETE' })
      if (response.ok) {
        loadProjects()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0]
  }

  const getDifficultyColor = (difficulty: string) => {
    const diff = DIFFICULTY_LEVELS.find(d => d.value === difficulty)
    return diff?.color || 'gray'
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-neon-cyan" />
                Proyectos Avanzados
              </h1>
              <p className="text-sm text-gray-400">Jetson Nano, Raspberry Pi, ESP32-CAM, Digispark</p>
            </div>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nivel:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none min-w-[180px]"
            >
              <option value="">Todos los niveles</option>
              {EDUCATION_LEVELS.filter(l => 
                ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'].includes(l.id)
              ).map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Categoria:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none min-w-[180px]"
            >
              <option value="">Todas</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Cpu className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay proyectos</p>
            <button onClick={openCreateModal} className="mt-4 text-neon-cyan hover:underline">
              Crear primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => {
              const catInfo = getCategoryInfo(project.category)
              const CatIcon = catInfo.icon
              return (
                <div key={project.id} className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden hover:border-neon-cyan/30 transition-colors">
                  <div className={'px-4 py-3 border-b border-dark-600 bg-' + catInfo.color + '/10'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CatIcon className={'w-5 h-5 text-' + catInfo.color} />
                        <span className="text-sm text-gray-400">{catInfo.label}</span>
                      </div>
                      <span className={'text-xs px-2 py-1 rounded-full bg-' + getDifficultyColor(project.difficulty) + '-500/20 text-' + getDifficultyColor(project.difficulty) + '-400'}>
                        {project.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2">{project.projectName}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Wrench className="w-4 h-4" />
                        <span className="truncate">{project.hardware}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{project.duration}</span>
                      </div>
                    </div>
                    
                    {project.tutorialUrl && (
                      <a href={project.tutorialUrl} target="_blank" rel="noopener noreferrer" 
                         className="mt-3 flex items-center gap-1 text-neon-cyan text-sm hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        Ver tutorial
                      </a>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-dark-600 flex justify-end gap-2">
                    <button onClick={() => openEditModal(project)} className="p-2 text-gray-400 hover:text-neon-cyan">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-800 border-b border-dark-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isCreating ? 'Nuevo Proyecto' : 'Editar Proyecto'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {message && (
                <div className={'p-3 rounded-lg ' + (message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Nivel Educativo *</label>
                <select
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                >
                  <option value="">Seleccionar nivel</option>
                  {EDUCATION_LEVELS.filter(l => 
                    ['octavo-egb', 'noveno-egb', 'decimo-egb', 'primero-bach', 'segundo-bach', 'tercero-bach'].includes(l.id)
                  ).map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre del Proyecto *</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Ej: BadUSB con Digispark"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Project['category'] })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Project['difficulty'] })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {DIFFICULTY_LEVELS.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripcion</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el proyecto..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hardware</label>
                  <input
                    type="text"
                    value={formData.hardware}
                    onChange={(e) => setFormData({ ...formData, hardware: e.target.value })}
                    placeholder="Ej: Digispark ATtiny85"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duracion</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ej: 3 horas"
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">URL Video Tutorial</label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">URL Documentacion/GitHub</label>
                <input
                  type="text"
                  value={formData.tutorialUrl}
                  onChange={(e) => setFormData({ ...formData, tutorialUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Recursos Necesarios</label>
                <input
                  type="text"
                  value={formData.resources}
                  onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                  placeholder="Ej: Arduino IDE, Python, etc."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-800 border-t border-dark-600 px-6 py-4 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-gray-400 hover:text-white">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.projectName || !formData.levelId}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
