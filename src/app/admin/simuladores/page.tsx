'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  ArrowLeft, Save, Plus, Trash2, Edit, Monitor, 
  X, Check, ExternalLink, RefreshCw, Eye, Globe,
  Cpu, Code, Brain, Gamepad2, Shield, Terminal
} from 'lucide-react'

interface Simulator {
  id: string
  recordId: string
  name: string
  description: string
  icon: string
  url: string
  levels: string[]
  programs: string[]
  enabled: boolean
}

interface Level {
  id: string
  name: string
  fullName?: string
  ageRange?: string
}

const PROGRAMS = [
  { id: 'robotica', name: 'Robótica', color: 'bg-blue-500' },
  { id: 'ia', name: 'Inteligencia Artificial', color: 'bg-purple-500' },
  { id: 'hacking', name: 'Hacking / Ciberseguridad', color: 'bg-red-500' }
]

const ICON_OPTIONS = [
  { id: 'code', name: 'Código', icon: Code },
  { id: 'cpu', name: 'CPU', icon: Cpu },
  { id: 'brain', name: 'Cerebro', icon: Brain },
  { id: 'gamepad', name: 'Gamepad', icon: Gamepad2 },
  { id: 'shield', name: 'Escudo', icon: Shield },
  { id: 'terminal', name: 'Terminal', icon: Terminal },
  { id: 'globe', name: 'Web', icon: Globe },
  { id: 'monitor', name: 'Monitor', icon: Monitor },
]

export default function SimuladoresAdminPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const [simulators, setSimulators] = useState<Simulator[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loadingSimulators, setLoadingSimulators] = useState(true)
  const [editingSimulator, setEditingSimulator] = useState<Simulator | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [filterProgram, setFilterProgram] = useState<string>('all')

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    icon: 'code',
    url: '',
    levels: [] as string[],
    programs: [] as string[],
    enabled: true
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/simuladores')
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    loadSimulators()
    loadLevels()
  }, [])

  const loadSimulators = async () => {
    setLoadingSimulators(true)
    try {
      const response = await fetch('/api/simulators')
      if (response.ok) {
        const data = await response.json()
        setSimulators(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading simulators:', error)
    }
    setLoadingSimulators(false)
  }

  const loadLevels = async () => {
    try {
      const response = await fetch('/api/admin/levels')
      if (response.ok) {
        const data = await response.json()
        if (data.levels) {
          setLevels(data.levels)
        }
      }
    } catch (error) {
      console.error('Error loading levels:', error)
    }
  }

  const getLevelName = (levelId: string) => {
    const level = levels.find(l => l.id === levelId)
    return level ? level.name : levelId
  }

  const openEditModal = (simulator: Simulator) => {
    setEditingSimulator(simulator)
    setIsCreating(false)
    setFormData({
      id: simulator.id,
      name: simulator.name,
      description: simulator.description,
      icon: simulator.icon,
      url: simulator.url,
      levels: simulator.levels,
      programs: simulator.programs,
      enabled: simulator.enabled
    })
  }

  const openCreateModal = () => {
    setEditingSimulator(null)
    setIsCreating(true)
    setFormData({
      id: '',
      name: '',
      description: '',
      icon: 'code',
      url: '',
      levels: [],
      programs: ['robotica', 'ia', 'hacking'],
      enabled: true
    })
  }

  const closeModal = () => {
    setEditingSimulator(null)
    setIsCreating(false)
    setMessage(null)
  }

  const toggleLevel = (levelId: string) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.includes(levelId)
        ? prev.levels.filter(l => l !== levelId)
        : [...prev.levels, levelId]
    }))
  }

  const toggleProgram = (programId: string) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.includes(programId)
        ? prev.programs.filter(p => p !== programId)
        : [...prev.programs, programId]
    }))
  }

  const selectAllLevels = () => {
    setFormData(prev => ({
      ...prev,
      levels: levels.map(l => l.id)
    }))
  }

  const clearAllLevels = () => {
    setFormData(prev => ({
      ...prev,
      levels: []
    }))
  }

  const handleSave = async () => {
    if (!formData.id || !formData.name || !formData.url) {
      setMessage({ type: 'error', text: 'ID, nombre y URL son requeridos' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const method = isCreating ? 'POST' : 'PUT'
      const body = isCreating ? formData : { ...formData, recordId: editingSimulator?.recordId }
      
      const response = await fetch('/api/simulators', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: isCreating ? 'Simulador creado exitosamente' : 'Simulador actualizado exitosamente' })
        loadSimulators()
        setTimeout(() => {
          closeModal()
        }, 1500)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Error al guardar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    }

    setSaving(false)
  }

  const handleDelete = async (simulator: Simulator) => {
    if (!confirm(`¿Estás seguro de eliminar "${simulator.name}"?`)) return

    setDeleting(simulator.id)
    try {
      const response = await fetch(`/api/simulators?id=${simulator.recordId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadSimulators()
      } else {
        alert('Error al eliminar el simulador')
      }
    } catch (error) {
      alert('Error de conexión')
    }
    setDeleting(null)
  }

  const filteredSimulators = filterProgram === 'all' 
    ? simulators 
    : simulators.filter(s => s.programs.includes(filterProgram))

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(i => i.id === iconName)
    if (iconOption) {
      const IconComponent = iconOption.icon
      return <IconComponent className="w-5 h-5" />
    }
    return <Code className="w-5 h-5" />
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
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Gestión de Simuladores</h1>
              <p className="text-sm text-gray-400">Administra los simuladores por nivel y programa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSimulators}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90"
            >
              <Plus className="w-4 h-4" />
              Nuevo Simulador
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-dark-700">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Filtrar por programa:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterProgram('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterProgram === 'all' 
                  ? 'bg-neon-cyan text-dark-900' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Todos ({simulators.length})
            </button>
            {PROGRAMS.map(prog => (
              <button
                key={prog.id}
                onClick={() => setFilterProgram(prog.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterProgram === prog.id 
                    ? `${prog.color} text-white` 
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                {prog.name} ({simulators.filter(s => s.programs.includes(prog.id)).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="p-6">
        {loadingSimulators ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
          </div>
        ) : filteredSimulators.length === 0 ? (
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-12 text-center">
            <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No hay simuladores registrados.</p>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium mx-auto"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Simulador
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSimulators.map(simulator => (
              <div
                key={simulator.id}
                className={`bg-dark-800 rounded-xl border ${simulator.enabled ? 'border-dark-600' : 'border-red-900/50 opacity-60'} overflow-hidden hover:border-dark-500 transition-all`}
              >
                {/* Header */}
                <div className="p-4 border-b border-dark-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center text-neon-cyan">
                        {getIconComponent(simulator.icon)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{simulator.name}</h3>
                        <a 
                          href={simulator.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-neon-cyan flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Abrir
                        </a>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${simulator.enabled ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {simulator.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Programs */}
                <div className="px-4 py-3 border-b border-dark-700">
                  <p className="text-xs text-gray-500 mb-2">Programas:</p>
                  <div className="flex flex-wrap gap-1">
                    {PROGRAMS.map(prog => (
                      <span
                        key={prog.id}
                        className={`px-2 py-0.5 rounded text-xs ${
                          simulator.programs.includes(prog.id)
                            ? `${prog.color} text-white`
                            : 'bg-dark-700 text-gray-500'
                        }`}
                      >
                        {prog.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Levels */}
                <div className="px-4 py-3 border-b border-dark-700">
                  <p className="text-xs text-gray-500 mb-2">Niveles ({simulator.levels.length}):</p>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {simulator.levels.slice(0, 6).map(levelId => (
                      <span key={levelId} className="px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-300">
                        {getLevelName(levelId)}
                      </span>
                    ))}
                    {simulator.levels.length > 6 && (
                      <span className="px-2 py-0.5 bg-dark-600 rounded text-xs text-gray-400">
                        +{simulator.levels.length - 6} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(simulator)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(simulator)}
                    disabled={deleting === simulator.id}
                    className="px-3 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 disabled:opacity-50"
                  >
                    {deleting === simulator.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {(editingSimulator || isCreating) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <h2 className="text-lg font-bold text-white">
                {isCreating ? 'Nuevo Simulador' : 'Editar Simulador'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID (único)</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                    placeholder="ej: scratch, wokwi"
                    disabled={!isCreating}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                    placeholder="ej: Scratch"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  placeholder="https://scratch.mit.edu/projects/editor/"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  rows={2}
                  placeholder="Descripción breve del simulador"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Icono</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: opt.id })}
                      className={`p-2 rounded-lg border ${
                        formData.icon === opt.id 
                          ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' 
                          : 'border-dark-600 bg-dark-700 text-gray-400 hover:border-dark-500'
                      }`}
                      title={opt.name}
                    >
                      <opt.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Programs */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Programas</label>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMS.map(prog => (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => toggleProgram(prog.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.programs.includes(prog.id)
                          ? `${prog.color} text-white`
                          : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                      }`}
                    >
                      {formData.programs.includes(prog.id) && <Check className="w-3 h-3 inline mr-1" />}
                      {prog.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Niveles ({formData.levels.length} seleccionados)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllLevels}
                      className="text-xs text-neon-cyan hover:underline"
                    >
                      Seleccionar todos
                    </button>
                    <button
                      type="button"
                      onClick={clearAllLevels}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-dark-700 rounded-lg">
                  {levels.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => toggleLevel(level.id)}
                      className={`px-2 py-1.5 rounded text-xs text-left transition-all ${
                        formData.levels.includes(level.id)
                          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                          : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
                      }`}
                    >
                      {formData.levels.includes(level.id) && <Check className="w-3 h-3 inline mr-1" />}
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enabled */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                  className={`w-12 h-6 rounded-full transition-all ${formData.enabled ? 'bg-neon-cyan' : 'bg-dark-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${formData.enabled ? 'ml-6' : 'ml-0.5'}`} />
                </button>
                <span className="text-sm text-gray-300">
                  {formData.enabled ? 'Simulador activo' : 'Simulador inactivo'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-dark-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isCreating ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
