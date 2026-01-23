'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  ArrowLeft, Building2, Plus, Edit, Trash2, Search,
  Users, GraduationCap, MapPin, Phone, Mail, Save, X
} from 'lucide-react'

interface School {
  id: string
  recordId?: string
  name: string
  code: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  maxStudents?: number
  maxTeachers?: number
}

export default function ColegiosPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    country: 'Ecuador',
    phone: '',
    email: '',
    maxStudents: 100,
    maxTeachers: 10
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/colegios')
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      loadSchools()
    }
  }, [isAdmin])

  const loadSchools = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/schools')
      const data = await res.json()
      if (data.success && data.schools) {
        setSchools(data.schools)
      }
    } catch (error) {
      console.error('Error loading schools:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setShowAddModal(false)
        setFormData({
          name: '',
          code: '',
          address: '',
          city: '',
          country: 'Ecuador',
          phone: '',
          email: '',
          maxStudents: 100,
          maxTeachers: 10
        })
        loadSchools()
      } else {
        alert(data.error || 'Error al crear colegio')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión al crear colegio')
    }
  }

  const handleDelete = async (school: School) => {
    if (!confirm(`¿Eliminar el colegio "${school.name}"? Esta acción no se puede deshacer.`)) {
      return
    }
    
    try {
      const res = await fetch(`/api/schools?recordId=${school.recordId || school.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        loadSchools()
      } else {
        alert('Error al eliminar colegio')
      }
    } catch (error) {
      alert('Error al eliminar colegio')
    }
  }

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold">Gestión de Colegios</h1>
                <p className="text-xs text-blue-400">Administrar instituciones educativas</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Colegio
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{schools.length}</p>
                <p className="text-sm text-gray-400">Colegios registrados</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {schools.reduce((acc, s) => acc + (s.maxStudents || 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Capacidad total estudiantes</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {schools.reduce((acc, s) => acc + (s.maxTeachers || 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Capacidad total profesores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schools List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay colegios registrados</p>
            <p className="text-gray-500 text-sm mt-1">
              Haz clic en "Nuevo Colegio" para agregar uno
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map(school => (
              <div
                key={school.id}
                className="bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{school.name}</h3>
                      <p className="text-xs text-blue-400 font-mono">{school.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(school)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {school.city && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{school.city}, {school.country || 'Ecuador'}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{school.phone}</span>
                    </div>
                  )}
                  {school.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{school.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-dark-600 flex justify-between text-xs text-gray-500">
                  <span>Max: {school.maxStudents} estudiantes</span>
                  <span>{school.maxTeachers} profesores</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-lg font-semibold text-white">Nuevo Colegio</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Nombre del Colegio *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Unidad Educativa San Francisco"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: UESF"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Quito"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Av. Principal 123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: +593999999999"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: contacto@colegio.edu.ec"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max. Estudiantes</label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max. Profesores</label>
                  <input
                    type="number"
                    value={formData.maxTeachers}
                    onChange={(e) => setFormData({ ...formData, maxTeachers: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
