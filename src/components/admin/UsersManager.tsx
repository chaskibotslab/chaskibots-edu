'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, Users, Key, Copy, Check,
  Loader2, Filter, RefreshCw, Download
} from 'lucide-react'
import { EDUCATION_LEVELS } from '@/lib/constants'

interface User {
  id: string
  accessCode: string
  name: string
  email?: string
  levelId: string
  role: 'admin' | 'teacher' | 'student'
  courseId: string
  courseName: string
  schoolId?: string
  schoolName?: string
  programId: string
  programName: string
  progress: number
  isActive: boolean
  expiresAt?: string
}

interface Level {
  id: string
  name: string
}

interface Program {
  id: string
  name: string
  levelId: string
}

interface Course {
  id: string
  name: string
  levelId: string
}

interface School {
  id: string
  name: string
  code: string
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    levelId: '',
    role: 'student' as 'admin' | 'teacher' | 'student',
    courseId: '',
    courseName: '',
    schoolId: '',
    schoolName: '',
    programId: '',
    programName: '',
    expiresAt: ''
  })

  const [bulkData, setBulkData] = useState({
    count: 10,
    namePrefix: 'Estudiante',
    levelId: '',
    programId: '',
    programName: '',
    courseId: '',
    courseName: '',
    schoolId: '',
    schoolName: '',
    expiresAt: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, levelsRes, programsRes, coursesRes, schoolsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/levels'),
        fetch('/api/programs'),
        fetch('/api/admin/courses'),
        fetch('/api/schools')
      ])
      
      const usersData = await usersRes.json()
      const levelsData = await levelsRes.json()
      const programsData = await programsRes.json()
      const coursesData = await coursesRes.json()
      const schoolsData = await schoolsRes.json()
      
      // Cargar colegios
      if (schoolsData.success && schoolsData.schools) {
        setSchools(schoolsData.schools)
      }
      
      // Cargar cursos
      console.log('[UsersManager] Courses response:', coursesData)
      if (coursesData.courses && coursesData.courses.length > 0) {
        setCourses(coursesData.courses)
        console.log('[UsersManager] Courses loaded:', coursesData.courses.length)
      } else {
        console.log('[UsersManager] No courses found, using empty array')
      }
      
      console.log('[UsersManager] Levels loaded:', levelsData?.length || 0)
      console.log('[UsersManager] Programs loaded:', programsData?.programs?.length || 0)
      
      if (usersData.users) setUsers(usersData.users)
      
      // Usar datos de Airtable o fallback a constantes
      if (Array.isArray(levelsData) && levelsData.length > 0) {
        setLevels(levelsData)
      } else {
        // Fallback: usar EDUCATION_LEVELS de constantes
        const fallbackLevels = EDUCATION_LEVELS.map(l => ({ id: l.id, name: l.name }))
        setLevels(fallbackLevels)
        console.log('[UsersManager] Using fallback levels:', fallbackLevels.length)
      }
      
      if (programsData.programs && programsData.programs.length > 0) {
        setPrograms(programsData.programs)
      } else {
        // Fallback: programas básicos por nivel
        const fallbackPrograms = [
          { id: 'prog-robotica', name: 'Robótica', levelId: 'all' },
          { id: 'prog-programacion', name: 'Programación', levelId: 'all' },
          { id: 'prog-electronica', name: 'Electrónica', levelId: 'all' },
          { id: 'prog-ia', name: 'Inteligencia Artificial', levelId: 'all' },
          { id: 'prog-hacking', name: 'Hacking Ético', levelId: 'all' }
        ]
        setPrograms(fallbackPrograms)
        console.log('[UsersManager] Using fallback programs')
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // En caso de error, usar fallbacks
      const fallbackLevels = EDUCATION_LEVELS.map(l => ({ id: l.id, name: l.name }))
      setLevels(fallbackLevels)
    }
    setLoading(false)
  }

  const generateAccessCode = (role: string) => {
    const prefix = role === 'admin' ? 'AD' : role === 'teacher' ? 'PR' : 'ES'
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = prefix
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingId) {
        // Actualizar usuario existente
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingId,
            action: 'update',
            ...formData
          })
        })
        if (res.ok) {
          await loadData()
          resetForm()
        }
      } else {
        // Crear nuevo usuario
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          await loadData()
          resetForm()
          alert('Usuario creado exitosamente')
        } else {
          const errorData = await res.json()
          alert(`Error al crear usuario: ${errorData.error || 'Error desconocido'}`)
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error de conexión al crear usuario')
    }
    setSaving(false)
  }

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk',
          ...bulkData
        })
      })

      if (res.ok) {
        await loadData()
        setShowBulkForm(false)
      }
    } catch (error) {
      console.error('Error creating bulk users:', error)
    }
    setSaving(false)
  }

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email || '',
      levelId: user.levelId,
      role: user.role,
      courseId: user.courseId,
      courseName: user.courseName,
      schoolId: user.schoolId || '',
      schoolName: user.schoolName || '',
      programId: user.programId,
      programName: user.programName,
      expiresAt: user.expiresAt || ''
    })
    setEditingId(user.id)
    setShowForm(true)
  }

  const handleToggleActive = async (user: User) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: user.isActive ? 'deactivate' : 'activate'
        })
      })
      await loadData()
    } catch (error) {
      console.error('Error toggling user:', error)
    }
  }

  const handleRegenerateCode = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'regenerate'
        })
      })
      if (res.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Error regenerating code:', error)
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        await loadData()
      } else {
        const error = await res.json()
        alert(error.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar usuario')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleLevelChange = (levelId: string) => {
    setFormData({ ...formData, levelId, programId: '', programName: '' })
  }

  const handleProgramChange = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    setFormData({ 
      ...formData, 
      programId, 
      programName: program?.name || '' 
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      levelId: '',
      role: 'student',
      courseId: '',
      courseName: '',
      schoolId: '',
      schoolName: '',
      programId: '',
      programName: '',
      expiresAt: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredUsers = users.filter(u => {
    if (filterLevel !== 'all' && u.levelId !== filterLevel) return false
    if (filterRole !== 'all' && u.role !== filterRole) return false
    return true
  })

  const filteredPrograms = formData.levelId 
    ? programs.filter(p => p.levelId === formData.levelId || p.levelId === 'all')
    : programs

  // Mostrar todos los cursos si no hay filtro o si no hay coincidencias
  const filteredCourses = formData.levelId
    ? courses.filter(c => c.levelId === formData.levelId)
    : courses
  
  // Si no hay cursos filtrados pero hay cursos disponibles, mostrar todos
  const displayCourses = filteredCourses.length > 0 ? filteredCourses : courses

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    setFormData({
      ...formData,
      courseId,
      courseName: course?.name || ''
    })
  }

  const exportUsers = () => {
    const csv = [
      'Código,Nombre,Email,Nivel,Rol,Programa,Curso,Activo',
      ...filteredUsers.map(u => 
        `${u.accessCode},${u.name},${u.email || ''},${u.levelId},${u.role},${u.programName},${u.courseName},${u.isActive}`
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'usuarios.csv'
    a.click()
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
          <h3 className="text-lg font-bold text-white">Usuarios y Códigos de Acceso</h3>
          <p className="text-sm text-gray-400">{users.length} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportUsers}
            className="flex items-center gap-2 px-3 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => setShowBulkForm(!showBulkForm)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-orange/20 text-neon-orange rounded-lg hover:bg-neon-orange/30 transition-colors"
          >
            <Users className="w-4 h-4" />
            Crear en Lote
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancelar' : 'Nuevo Usuario'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
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
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="teacher">Profesores</option>
          <option value="student">Estudiantes</option>
        </select>
      </div>

      {/* Bulk Create Form */}
      {showBulkForm && (
        <form onSubmit={handleBulkCreate} className="bg-dark-800 rounded-xl p-6 border border-neon-orange/30 space-y-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-orange" />
            Crear Usuarios en Lote
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cantidad</label>
              <input
                type="number"
                value={bulkData.count}
                onChange={(e) => setBulkData({ ...bulkData, count: parseInt(e.target.value) })}
                min={1}
                max={100}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prefijo Nombre</label>
              <input
                type="text"
                value={bulkData.namePrefix}
                onChange={(e) => setBulkData({ ...bulkData, namePrefix: e.target.value })}
                placeholder="Estudiante"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nivel</label>
              <select
                value={bulkData.levelId}
                onChange={(e) => setBulkData({ ...bulkData, levelId: e.target.value })}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              >
                <option value="">Seleccionar...</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre del Curso</label>
              <input
                type="text"
                value={bulkData.courseName}
                onChange={(e) => setBulkData({ ...bulkData, courseName: e.target.value })}
                placeholder="8vo A Matutino"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Colegio</label>
              <select
                value={bulkData.schoolId}
                onChange={(e) => {
                  const school = schools.find(s => s.id === e.target.value)
                  setBulkData({ 
                    ...bulkData, 
                    schoolId: e.target.value,
                    schoolName: school?.name || ''
                  })
                }}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                <option value="">Sin asignar</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowBulkForm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-neon-orange text-dark-900 font-semibold rounded-lg hover:bg-neon-orange/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Crear {bulkData.count} Usuarios
            </button>
          </div>
        </form>
      )}

      {/* Single User Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl p-6 border border-dark-600 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email (opcional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                <option value="student">Estudiante</option>
                <option value="teacher">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nivel</label>
              <select
                value={formData.levelId}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
                required
              >
                <option value="">Seleccionar...</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Programa</label>
              <select
                value={formData.programId}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                <option value="">Seleccionar...</option>
                {filteredPrograms.map(prog => (
                  <option key={prog.id} value={prog.id}>{prog.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Curso/Clase (opcional)</label>
              <select
                value={formData.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                <option value="">Sin asignar</option>
                {displayCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Colegio/Institución</label>
              <select
                value={formData.schoolId}
                onChange={(e) => {
                  const school = schools.find(s => s.id === e.target.value)
                  setFormData({ 
                    ...formData, 
                    schoolId: e.target.value,
                    schoolName: school?.name || ''
                  })
                }}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
              >
                <option value="">Sin asignar</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name} ({school.code})</option>
                ))}
              </select>
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
              className="flex items-center gap-2 px-6 py-2 bg-neon-green text-dark-900 font-semibold rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Actualizar' : 'Crear'} Usuario
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-dark-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Código</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Usuario</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Nivel</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Programa</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Rol</th>
              <th className="px-4 py-3 text-left text-sm text-gray-400">Estado</th>
              <th className="px-4 py-3 text-right text-sm text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-dark-700/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-dark-600 rounded text-neon-cyan font-mono text-sm">
                      {user.accessCode}
                    </code>
                    <button
                      onClick={() => copyCode(user.accessCode)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedCode === user.accessCode ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email || 'Sin email'}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{user.levelId}</td>
                <td className="px-4 py-3 text-gray-300">{user.programName || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'teacher' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`px-2 py-0.5 rounded text-xs ${
                      user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleRegenerateCode(user.id)}
                      className="p-1.5 text-gray-400 hover:text-neon-orange transition-colors"
                      title="Regenerar código"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1.5 text-gray-400 hover:text-neon-cyan transition-colors"
                      title="Editar usuario"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                      title="Eliminar usuario"
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay usuarios con estos filtros</p>
        </div>
      )}
    </div>
  )
}
