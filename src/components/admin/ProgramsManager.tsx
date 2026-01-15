'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, BookOpen, 
  Loader2, Filter
} from 'lucide-react'

interface Program {
  id: string
  name: string
  description: string
  levelId: string
  levelName: string
  type: string
  duration: string
  price: number
  isActive: boolean
}

interface Level {
  id: string
  name: string
}

export default function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [formData, setFormData] = useState<Partial<Program>>({
    name: '',
    description: '',
    levelId: '',
    levelName: '',
    type: 'robotica',
    duration: '6 meses',
    price: 50,
    isActive: true
  })

  const programTypes = [
    { value: 'robotica', label: '🤖 Robótica', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'programacion', label: '💻 Programación', color: 'bg-green-500/20 text-green-400' },
    { value: 'electronica', label: '⚡ Electrónica', color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'ia', label: '🧠 Inteligencia Artificial', color: 'bg-purple-500/20 text-purple-400' },
    { value: 'hacking', label: '🔐 Hacking Ético', color: 'bg-red-500/20 text-red-400' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [programsRes, levelsRes] = await Promise.all([
        fetch('/api/programs'),
        fetch('/api/levels')
      ])
      
      const programsData = await programsRes.json()
      const levelsData = await levelsRes.json()
      
      if (programsData.programs) setPrograms(programsData.programs)
      if (Array.isArray(levelsData)) setLevels(levelsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Generate ID if new
    const dataToSend = {
      ...formData,
      id: editingId || `prog-${formData.levelId}-${formData.type}-${Date.now()}`
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/programs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (res.ok) {
        await loadData()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving program:', error)
    }
    setSaving(false)
  }

  const handleEdit = (program: Program) => {
    setFormData(program)
    setEditingId(program.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este programa?')) return

    try {
      await fetch(`/api/admin/programs?id=${id}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Error deleting program:', error)
    }
  }

  const handleLevelChange = (levelId: string) => {
    const level = levels.find(l => l.id === levelId)
    setFormData({ 
      ...formData, 
      levelId, 
      levelName: level?.name || '' 
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      levelId: '',
      levelName: '',
      type: 'robotica',
      duration: '6 meses',
      price: 50,
      isActive: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredPrograms = filterLevel === 'all' 
    ? programs 
    : programs.filter(p => p.levelId === filterLevel)

  const getTypeStyle = (type: string) => {
    return programTypes.find(t => t.value === type)?.color || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Programas</h3>
          <p className="text-sm text-gray-400">{programs.length} programas en {levels.length} niveles</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
            >
              <option value="all">Todos los niveles</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancelar' : 'Nuevo Programa'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl p-6 border border-dark-600 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre del Programa</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Robótica Avanzada"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nivel Educativo</label>
              <select
                value={formData.levelId || ''}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              >
                <option value="">Seleccionar nivel...</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el programa..."
              rows={2}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo de Programa</label>
              <select
                value={formData.type || 'robotica'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                {programTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Duración</label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="ej: 6 meses"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Precio ($)</label>
              <input
                type="number"
                value={formData.price || 50}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-neon-purple text-white font-semibold rounded-lg hover:bg-neon-purple/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Actualizar' : 'Crear'} Programa
            </button>
          </div>
        </form>
      )}

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="bg-dark-800 rounded-xl p-4 border border-dark-600 hover:border-dark-500 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs ${getTypeStyle(program.type)}`}>
                  {programTypes.find(t => t.value === program.type)?.label || program.type}
                </span>
                <h4 className="text-white font-semibold mt-2">{program.name}</h4>
                <p className="text-sm text-gray-500">{program.levelName}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(program)}
                  className="p-1.5 text-gray-400 hover:text-neon-cyan transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{program.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{program.duration}</span>
              <span className="text-neon-cyan font-semibold">${program.price}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay programas {filterLevel !== 'all' ? 'para este nivel' : ''}</p>
        </div>
      )}
    </div>
  )
}
