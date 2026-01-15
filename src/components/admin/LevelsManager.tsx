'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, GraduationCap, 
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react'

interface Level {
  id: string
  name: string
  fullName: string
  category: string
  ageRange: string
  gradeNumber: number
  kitPrice: number
  hasHacking: boolean
  hasAdvancedIA: boolean
  color: string
  neonColor: string
  icon: string
}

export default function LevelsManager() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Level>>({
    id: '',
    name: '',
    fullName: '',
    category: 'elemental',
    ageRange: '',
    gradeNumber: 1,
    kitPrice: 50,
    hasHacking: false,
    hasAdvancedIA: false,
    color: 'from-blue-500 to-cyan-600',
    neonColor: '#00d4ff',
    icon: '📚'
  })

  const categories = [
    { value: 'inicial', label: 'Inicial' },
    { value: 'preparatoria', label: 'Preparatoria' },
    { value: 'elemental', label: 'Elemental' },
    { value: 'media', label: 'Media' },
    { value: 'superior', label: 'Superior' },
    { value: 'bachillerato', label: 'Bachillerato' },
    { value: 'universidad', label: 'Universidad' },
    { value: 'curso-libre', label: 'Curso Libre' }
  ]

  const icons = ['🧒', '🎒', '✏️', '📚', '🔬', '🤖', '💡', '⚡', '🎮', '🔧', '🛠️', '💻', '🧠', '🔐', '🚀', '🎓']

  useEffect(() => {
    loadLevels()
  }, [])

  const loadLevels = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/levels')
      const data = await res.json()
      if (Array.isArray(data)) {
        setLevels(data)
      }
    } catch (error) {
      console.error('Error loading levels:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/levels', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await loadLevels()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving level:', error)
    }
    setSaving(false)
  }

  const handleEdit = (level: Level) => {
    setFormData(level)
    setEditingId(level.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este nivel?')) return

    try {
      await fetch(`/api/admin/levels?id=${id}`, { method: 'DELETE' })
      await loadLevels()
    } catch (error) {
      console.error('Error deleting level:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      fullName: '',
      category: 'elemental',
      ageRange: '',
      gradeNumber: 1,
      kitPrice: 50,
      hasHacking: false,
      hasAdvancedIA: false,
      color: 'from-blue-500 to-cyan-600',
      neonColor: '#00d4ff',
      icon: '📚'
    })
    setEditingId(null)
    setShowForm(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Niveles Educativos</h3>
          <p className="text-sm text-gray-400">{levels.length} niveles configurados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nuevo Nivel'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl p-6 border border-dark-600 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ID (único)</label>
              <input
                type="text"
                value={formData.id || ''}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                placeholder="ej: cuarto-bach"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre Corto</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: 4° BGU"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="ej: Cuarto de Bachillerato"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <select
                value={formData.category || 'elemental'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rango de Edad</label>
              <input
                type="text"
                value={formData.ageRange || ''}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                placeholder="ej: 18-19 años"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Número de Grado</label>
              <input
                type="number"
                value={formData.gradeNumber || 1}
                onChange={(e) => setFormData({ ...formData, gradeNumber: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Precio Kit ($)</label>
              <input
                type="number"
                value={formData.kitPrice || 50}
                onChange={(e) => setFormData({ ...formData, kitPrice: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Icono</label>
              <div className="flex flex-wrap gap-1">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                      formData.icon === icon ? 'bg-neon-cyan/30 ring-2 ring-neon-cyan' : 'bg-dark-700 hover:bg-dark-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Color Neon</label>
              <input
                type="color"
                value={formData.neonColor || '#00d4ff'}
                onChange={(e) => setFormData({ ...formData, neonColor: e.target.value })}
                className="w-full h-10 bg-dark-700 border border-dark-600 rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasHacking || false}
                  onChange={(e) => setFormData({ ...formData, hasHacking: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-300">Hacking</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasAdvancedIA || false}
                  onChange={(e) => setFormData({ ...formData, hasAdvancedIA: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-300">IA Avanzada</span>
              </label>
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
              className="flex items-center gap-2 px-6 py-2 bg-neon-cyan text-dark-900 font-semibold rounded-lg hover:bg-neon-cyan/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Actualizar' : 'Crear'} Nivel
            </button>
          </div>
        </form>
      )}

      {/* Levels List */}
      <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Nivel</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Categoría</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Edad</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Precio</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Funciones</th>
              <th className="px-4 py-3 text-right text-sm text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {levels.map((level) => (
              <tr key={level.id} className="hover:bg-dark-700/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="text-white font-medium">{level.name}</p>
                      <p className="text-xs text-gray-500">{level.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-dark-600 rounded text-sm text-gray-300 capitalize">
                    {level.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{level.ageRange}</td>
                <td className="px-4 py-3 text-gray-300">${level.kitPrice}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {level.hasHacking && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Hacking</span>
                    )}
                    {level.hasAdvancedIA && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">IA</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(level)}
                      className="p-2 text-gray-400 hover:text-neon-cyan transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(level.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
