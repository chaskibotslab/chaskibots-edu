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
  category: string
  enabled: boolean
}

interface Level {
  id: string
  name: string
  fullName?: string
  ageRange?: string
}

type ProgramColorKey = 'coral' | 'gold' | 'green' | 'slate'

const PROGRAMS: { id: string; name: string; color: ProgramColorKey }[] = [
  { id: 'robotica', name: 'Robótica', color: 'coral' },
  { id: 'ia', name: 'Inteligencia Artificial', color: 'gold' },
  { id: 'hacking', name: 'Hacking / Ciberseguridad', color: 'green' },
  { id: 'diseno', name: 'Diseño 3D', color: 'slate' }
]

const PROGRAM_COLOR_STYLES: Record<ProgramColorKey, { active: string; chip: string }> = {
  coral: { active: 'bg-chaski-primary/15 text-chaski-primary border-chaski-primary/30', chip: 'bg-chaski-primary/10 text-chaski-primary' },
  gold: { active: 'bg-chaski-gold/15 text-chaski-gold border-chaski-gold/30', chip: 'bg-chaski-gold/10 text-chaski-gold' },
  green: { active: 'bg-hack-green/15 text-hack-green border-hack-green/30', chip: 'bg-hack-green/10 text-hack-green' },
  slate: { active: 'bg-slate-500/15 text-slate-700 border-slate-400/40', chip: 'bg-slate-500/10 text-slate-600' },
}

const CATEGORIES = [
  { id: 'bloques', name: 'Bloques' },
  { id: 'python', name: 'Python' },
  { id: 'micropython', name: 'MicroPython' },
  { id: 'electronica', name: 'Electrónica' },
  { id: 'robotica', name: 'Robótica' },
  { id: 'ia', name: 'Inteligencia Artificial' },
  { id: 'hacking', name: 'Hacking' },
  { id: 'roblox', name: 'Roblox' },
  { id: 'cnc', name: 'CNC/Industrial' },
  { id: '3d', name: 'Diseño 3D' },
  { id: 'logica', name: 'Lógica Digital' },
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
    category: 'bloques',
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
      const response = await fetch('/api/simulators?all=1')
      if (response.ok) {
        const data = await response.json()
        setSimulators(Array.isArray(data.simulators) ? data.simulators : [])
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
      category: simulator.category || 'bloques',
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
      category: 'bloques',
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
    if (!formData.id || !formData.name) {
      setMessage({ type: 'error', text: 'ID y nombre son requeridos' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const method = isCreating ? 'POST' : 'PATCH'

      const response = await fetch('/api/simulators', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: isCreating ? 'Simulador creado exitosamente' : 'Simulador actualizado exitosamente' })
        loadSimulators()
        setTimeout(() => {
          closeModal()
        }, 1500)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Error al guardar' })
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
      const response = await fetch(`/api/simulators?id=${simulator.id}`, {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chaski-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Header */}
      <header className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gestión de Simuladores</h1>
              <p className="text-sm text-slate-600">Administra los simuladores por nivel y programa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSimulators}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-chaski-primary text-white rounded-lg font-medium hover:bg-chaski-primary/90 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Simulador
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">Filtrar por programa:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterProgram('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                filterProgram === 'all'
                  ? 'bg-chaski-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({simulators.length})
            </button>
            {PROGRAMS.map(prog => (
              <button
                key={prog.id}
                onClick={() => setFilterProgram(prog.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all active:scale-[0.98] ${
                  filterProgram === prog.id
                    ? PROGRAM_COLOR_STYLES[prog.color].active
                    : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-chaski-primary"></div>
          </div>
        ) : filteredSimulators.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center animate-fade-in">
            <Monitor className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No hay simuladores registrados.</p>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-chaski-primary text-white rounded-lg font-medium mx-auto hover:bg-chaski-primary/90 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Simulador
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSimulators.map((simulator, i) => (
              <div
                key={simulator.id}
                style={{ animationDelay: `${i * 0.05}s` }}
                className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-scale-in ${simulator.enabled ? 'border-slate-200 hover:border-chaski-primary/30' : 'border-red-200 opacity-60'}`}
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-chaski-primary">
                        {getIconComponent(simulator.icon)}
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-semibold">{simulator.name}</h3>
                        {simulator.url ? (
                          <a
                            href={simulator.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-500 hover:text-chaski-primary flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Abrir
                          </a>
                        ) : (
                          <span className="text-xs text-chaski-primary/70">Herramienta interna</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${simulator.enabled ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {simulator.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Categoría: <span className="text-chaski-primary">{CATEGORIES.find(c => c.id === simulator.category)?.name || simulator.category}</span>
                  </p>
                </div>

                {/* Programs */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">Programas:</p>
                  <div className="flex flex-wrap gap-1">
                    {PROGRAMS.map(prog => (
                      <span
                        key={prog.id}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          simulator.programs.includes(prog.id)
                            ? PROGRAM_COLOR_STYLES[prog.color].chip
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {prog.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Levels */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">Niveles ({simulator.levels.length}):</p>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {simulator.levels.slice(0, 6).map(levelId => (
                      <span key={levelId} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700">
                        {getLevelName(levelId)}
                      </span>
                    ))}
                    {simulator.levels.length > 6 && (
                      <span className="px-2 py-0.5 bg-slate-300 rounded text-xs text-slate-600">
                        +{simulator.levels.length - 6} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(simulator)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-[0.98] transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(simulator)}
                    disabled={deleting === simulator.id}
                    className="px-3 py-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 disabled:opacity-50 active:scale-[0.98] transition-all"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {isCreating ? 'Nuevo Simulador' : 'Editar Simulador'}
              </h2>
              <button onClick={closeModal} className="text-slate-600 hover:text-slate-900 active:scale-[0.98] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">ID (único)</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:bg-white transition-all disabled:opacity-60"
                    placeholder="ej: scratch, wokwi"
                    disabled={!isCreating}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:bg-white transition-all"
                    placeholder="ej: Scratch"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">URL (dejar vacío si es una herramienta interna del sitio, ej. python-ide)</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:bg-white transition-all"
                  placeholder="https://scratch.mit.edu/projects/editor/ (o vacío)"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-chaski-primary focus:ring-2 focus:ring-chaski-primary/10 focus:bg-white transition-all resize-none"
                  rows={2}
                  placeholder="Descripción breve del simulador"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Icono</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: opt.id })}
                      className={`p-2 rounded-lg border transition-all active:scale-[0.98] ${
                        formData.icon === opt.id
                          ? 'border-chaski-primary bg-chaski-primary/10 text-chaski-primary'
                          : 'border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300'
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
                <label className="block text-sm text-slate-600 mb-2">Programas</label>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMS.map(prog => (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => toggleProgram(prog.id)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all active:scale-[0.98] ${
                        formData.programs.includes(prog.id)
                          ? PROGRAM_COLOR_STYLES[prog.color].active
                          : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {formData.programs.includes(prog.id) && <Check className="w-3 h-3 inline mr-1" />}
                      {prog.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-slate-600 mb-2">Categoría (pestaña donde aparece)</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                        formData.category === cat.id
                          ? 'bg-chaski-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {formData.category === cat.id && <Check className="w-3 h-3 inline mr-1" />}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-600">Niveles ({formData.levels.length} seleccionados)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllLevels}
                      className="text-xs text-chaski-primary hover:underline"
                    >
                      Seleccionar todos
                    </button>
                    <button
                      type="button"
                      onClick={clearAllLevels}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-100 rounded-lg">
                  {levels.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => toggleLevel(level.id)}
                      className={`px-2 py-1.5 rounded text-xs text-left border transition-all active:scale-[0.98] ${
                        formData.levels.includes(level.id)
                          ? 'bg-chaski-primary/20 text-chaski-primary border-chaski-primary/50'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-chaski-primary/30 hover:bg-slate-50'
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
                  className={`w-12 h-6 rounded-full transition-all active:scale-[0.97] ${formData.enabled ? 'bg-chaski-primary' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${formData.enabled ? 'ml-6' : 'ml-0.5'}`} />
                </button>
                <span className="text-sm text-slate-700">
                  {formData.enabled ? 'Simulador activo' : 'Simulador inactivo'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-chaski-primary text-white rounded-lg font-medium hover:bg-chaski-primary/90 disabled:opacity-50 active:scale-[0.98] transition-all"
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
