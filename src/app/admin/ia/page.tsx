'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit2, Trash2, Save, X, 
  Camera, Upload, Mic, Shield, Brain, Eye,
  Zap, Settings, Code, Terminal, Lock
} from 'lucide-react'
import { EDUCATION_LEVELS } from '@/lib/constants'

interface AIActivity {
  id: string
  levelId: string
  activityName: string
  activityType: 'camera' | 'upload' | 'voice' | 'hacking'
  description: string
  difficulty: 'facil' | 'medio' | 'avanzado' | 'experto'
  icon: string
  enabled: boolean
}

const ACTIVITY_TYPES = [
  { value: 'camera', label: 'Cámara / Visión', icon: Camera, color: 'neon-cyan' },
  { value: 'upload', label: 'Clasificación de Imágenes', icon: Upload, color: 'neon-purple' },
  { value: 'voice', label: 'Voz / Audio', icon: Mic, color: 'neon-green' },
  { value: 'hacking', label: 'Hacking Ético', icon: Shield, color: 'neon-orange' },
]

const DIFFICULTY_LEVELS = [
  { value: 'facil', label: 'Fácil', color: 'green' },
  { value: 'medio', label: 'Medio', color: 'yellow' },
  { value: 'avanzado', label: 'Avanzado', color: 'orange' },
  { value: 'experto', label: 'Experto', color: 'red' },
]

export default function IAAdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'admin'

  const [activities, setActivities] = useState<AIActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<AIActivity | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    levelId: '',
    activityName: '',
    activityType: 'camera' as AIActivity['activityType'],
    description: '',
    difficulty: 'medio' as AIActivity['difficulty'],
    icon: 'brain',
    enabled: true,
  })

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login')
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    loadActivities()
  }, [selectedLevel])

  const loadActivities = async () => {
    setLoading(true)
    try {
      let url = '/api/ai-activities'
      if (selectedLevel) {
        url += `?levelId=${selectedLevel}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setActivities(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    }
    setLoading(false)
  }

  const openCreateModal = () => {
    setIsCreating(true)
    setEditingActivity(null)
    setFormData({
      levelId: selectedLevel || '',
      activityName: '',
      activityType: 'camera',
      description: '',
      difficulty: 'medio',
      icon: 'brain',
      enabled: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (activity: AIActivity) => {
    setIsCreating(false)
    setEditingActivity(activity)
    setFormData({
      levelId: activity.levelId,
      activityName: activity.activityName,
      activityType: activity.activityType,
      description: activity.description,
      difficulty: activity.difficulty,
      icon: activity.icon,
      enabled: activity.enabled,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingActivity(null)
    setMessage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const method = isCreating ? 'POST' : 'PUT'
      const response = await fetch('/api/ai-activities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingActivity?.id,
          ...formData
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: isCreating ? 'Actividad creada' : 'Actividad actualizada' })
        loadActivities()
        setTimeout(() => {
          closeModal()
        }, 1000)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Error al guardar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta actividad de IA?')) return

    try {
      const response = await fetch(`/api/ai-activities?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        loadActivities()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const toggleEnabled = async (activity: AIActivity) => {
    try {
      await fetch('/api/ai-activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activity.id,
          enabled: !activity.enabled
        })
      })
      loadActivities()
    } catch (error) {
      console.error('Error toggling:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    const typeInfo = ACTIVITY_TYPES.find(t => t.value === type)
    if (typeInfo) {
      const Icon = typeInfo.icon
      return <Icon className="w-5 h-5" />
    }
    return <Brain className="w-5 h-5" />
  }

  const getTypeColor = (type: string) => {
    const typeInfo = ACTIVITY_TYPES.find(t => t.value === type)
    return typeInfo?.color || 'gray'
  }

  const getDifficultyColor = (difficulty: string) => {
    const diff = DIFFICULTY_LEVELS.find(d => d.value === difficulty)
    return diff?.color || 'gray'
  }

  // Agrupar actividades por tipo
  const groupedActivities = activities.reduce((acc, activity) => {
    const key = activity.activityType
    if (!acc[key]) acc[key] = []
    acc[key].push(activity)
    return acc
  }, {} as Record<string, AIActivity[]>)

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
                <Brain className="w-6 h-6 text-neon-pink" />
                Gestión de Actividades IA
              </h1>
              <p className="text-sm text-gray-400">Configura las actividades de IA y Hacking Ético por nivel</p>
            </div>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Actividad
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Filtro por nivel */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filtrar por nivel:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none min-w-[200px]"
            >
              <option value="">Todos los niveles</option>
              {EDUCATION_LEVELS.map(level => (
                <option key={level.id} value={level.id}>
                  {level.icon} {level.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Leyenda de tipos */}
          <div className="flex flex-wrap gap-3 ml-auto">
            {ACTIVITY_TYPES.map(type => (
              <div key={type.value} className={`flex items-center gap-2 px-3 py-1 bg-${type.color}/10 border border-${type.color}/30 rounded-full`}>
                <type.icon className={`w-4 h-4 text-${type.color}`} />
                <span className="text-sm text-gray-300">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de actividades */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay actividades de IA{selectedLevel ? ' para este nivel' : ''}</p>
            <button onClick={openCreateModal} className="mt-4 text-neon-cyan hover:underline">
              Crear primera actividad
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {ACTIVITY_TYPES.map(type => {
              const typeActivities = groupedActivities[type.value] || []
              if (typeActivities.length === 0) return null
              
              return (
                <div key={type.value} className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
                  <div className={`bg-${type.color}/10 px-4 py-3 border-b border-dark-600 flex items-center gap-3`}>
                    <type.icon className={`w-5 h-5 text-${type.color}`} />
                    <h3 className="font-semibold text-white">{type.label}</h3>
                    <span className="text-sm text-gray-400">({typeActivities.length} actividades)</span>
                  </div>
                  <div className="divide-y divide-dark-600">
                    {typeActivities.map(activity => (
                      <div key={activity.id} className={`px-4 py-3 flex items-center gap-4 hover:bg-dark-700/50 ${!activity.enabled ? 'opacity-50' : ''}`}>
                        <div className={`w-10 h-10 bg-${type.color}/20 rounded-lg flex items-center justify-center`}>
                          {getTypeIcon(activity.activityType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{activity.activityName}</p>
                            {!activity.enabled && <Lock className="w-4 h-4 text-gray-500" />}
                          </div>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">
                              Nivel: {EDUCATION_LEVELS.find(l => l.id === activity.levelId)?.name || activity.levelId}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-${getDifficultyColor(activity.difficulty)}-500/20 text-${getDifficultyColor(activity.difficulty)}-400`}>
                              {activity.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleEnabled(activity)}
                            className={`p-2 rounded-lg transition-colors ${activity.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                            title={activity.enabled ? 'Desactivar' : 'Activar'}
                          >
                            {activity.enabled ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEditModal(activity)}
                            className="p-2 text-gray-400 hover:text-neon-cyan transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de edición/creación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-800 border-b border-dark-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isCreating ? 'Nueva Actividad de IA' : 'Editar Actividad'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
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
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.icon} {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre de la Actividad *</label>
                <input
                  type="text"
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  placeholder="Ej: Detector de Objetos"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo de Actividad</label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value as AIActivity['activityType'] })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {ACTIVITY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as AIActivity['difficulty'] })}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {DIFFICULTY_LEVELS.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe la actividad..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-neon-cyan focus:ring-neon-cyan"
                />
                <label htmlFor="enabled" className="text-gray-300">
                  Actividad habilitada
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-dark-800 border-t border-dark-600 px-6 py-4 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-gray-400 hover:text-white">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.activityName || !formData.levelId}
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
