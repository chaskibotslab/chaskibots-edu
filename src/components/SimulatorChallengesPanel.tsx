'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  Trophy, Clock, CheckCircle, Eye, X, RefreshCw, 
  Filter, Gamepad2, Target, Award, ChevronDown
} from 'lucide-react'

interface SimulatorChallenge {
  id: string
  challengeId: string
  challengeName: string
  challengeCategory: string
  challengeDifficulty: string
  studentName: string
  studentEmail?: string
  courseId?: string
  schoolId?: string
  completedAt: string
  status: 'completed' | 'verified'
  verifiedBy?: string
  verifiedAt?: string
}

const CATEGORY_INFO: Record<string, { name: string, icon: string, color: string }> = {
  laberinto: { name: 'Laberintos', icon: '🧩', color: 'bg-blue-500/20 text-blue-400' },
  coleccionables: { name: 'Coleccionables', icon: '⭐', color: 'bg-purple-500/20 text-purple-400' },
  minisumo: { name: 'Mini Sumo', icon: '🥋', color: 'bg-red-500/20 text-red-400' }
}

const DIFFICULTY_INFO: Record<string, { name: string, color: string }> = {
  easy: { name: 'Fácil', color: 'bg-green-500/20 text-green-400' },
  medium: { name: 'Medio', color: 'bg-yellow-500/20 text-yellow-400' },
  hard: { name: 'Difícil', color: 'bg-red-500/20 text-red-400' }
}

export default function SimulatorChallengesPanel() {
  const { user, isAdmin, isTeacher } = useAuth()
  const [challenges, setChallenges] = useState<SimulatorChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedChallenge, setSelectedChallenge] = useState<SimulatorChallenge | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [categoryFilter, statusFilter])

  const loadChallenges = async () => {
    setLoading(true)
    try {
      let url = '/api/simulator-challenges?'
      if (categoryFilter) url += `category=${categoryFilter}&`
      if (statusFilter) url += `status=${statusFilter}&`
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        setChallenges(data.challenges || [])
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (challenge: SimulatorChallenge) => {
    if (!user) return
    
    setVerifying(true)
    try {
      const res = await fetch('/api/simulator-challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challenge.id,
          status: 'verified',
          verifiedBy: user.name || user.accessCode
        })
      })
      
      const data = await res.json()
      if (data.success) {
        loadChallenges()
        setSelectedChallenge(null)
      }
    } catch (error) {
      console.error('Error verifying challenge:', error)
    } finally {
      setVerifying(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Estadísticas
  const stats = {
    total: challenges.length,
    completed: challenges.filter(c => c.status === 'completed').length,
    verified: challenges.filter(c => c.status === 'verified').length,
    byCategory: {
      laberinto: challenges.filter(c => c.challengeCategory === 'laberinto').length,
      coleccionables: challenges.filter(c => c.challengeCategory === 'coleccionables').length,
      minisumo: challenges.filter(c => c.challengeCategory === 'minisumo').length
    }
  }

  // Agrupar por estudiante
  const studentStats = challenges.reduce((acc, c) => {
    if (!acc[c.studentName]) {
      acc[c.studentName] = { total: 0, verified: 0, challenges: [] }
    }
    acc[c.studentName].total++
    if (c.status === 'verified') acc[c.studentName].verified++
    acc[c.studentName].challenges.push(c)
    return acc
  }, {} as Record<string, { total: number, verified: number, challenges: SimulatorChallenge[] }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Retos del Simulador 3D</h2>
            <p className="text-sm text-gray-400">Progreso de estudiantes en los retos</p>
          </div>
        </div>
        <button
          onClick={() => { setSyncing(true); loadChallenges().finally(() => setSyncing(false)) }}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Total Retos</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.completed}</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Verificados</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.verified}</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🧩</span>
            <span className="text-xs text-gray-400">Laberintos</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.byCategory.laberinto}</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🥋</span>
            <span className="text-xs text-gray-400">Mini Sumo</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.byCategory.minisumo}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Todas las categorías</option>
            <option value="laberinto">🧩 Laberintos</option>
            <option value="coleccionables">⭐ Coleccionables</option>
            <option value="minisumo">🥋 Mini Sumo</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Todos los estados</option>
            <option value="completed">⏳ Pendientes</option>
            <option value="verified">✅ Verificados</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Tabla de retos */}
      <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-400">Cargando retos...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="p-8 text-center">
            <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay retos completados aún</p>
            <p className="text-sm text-gray-500 mt-1">Los estudiantes pueden enviar sus retos desde el simulador 3D</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estudiante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Dificultad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {challenge.studentName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{challenge.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">{challenge.challengeName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${CATEGORY_INFO[challenge.challengeCategory]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                        {CATEGORY_INFO[challenge.challengeCategory]?.icon || '🎮'}
                        {CATEGORY_INFO[challenge.challengeCategory]?.name || challenge.challengeCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${DIFFICULTY_INFO[challenge.challengeDifficulty]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                        {DIFFICULTY_INFO[challenge.challengeDifficulty]?.name || challenge.challengeDifficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(challenge.completedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {challenge.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedChallenge(challenge)}
                          className="p-1.5 bg-dark-600 hover:bg-dark-500 text-gray-300 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {challenge.status === 'completed' && (
                          <button
                            onClick={() => handleVerify(challenge)}
                            className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                            title="Verificar reto"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen por estudiante */}
      {Object.keys(studentStats).length > 0 && (
        <div className="bg-dark-800 rounded-xl border border-dark-600 p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Progreso por Estudiante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(studentStats).map(([name, stats]) => (
              <div key={name} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{name}</p>
                    <p className="text-xs text-gray-400">{stats.total} retos completados</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-dark-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.verified / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{stats.verified}/{stats.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 max-w-lg w-full">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Detalles del Reto
              </h3>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="p-1 hover:bg-dark-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedChallenge.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selectedChallenge.studentName}</p>
                    {selectedChallenge.studentEmail && (
                      <p className="text-sm text-gray-400">{selectedChallenge.studentEmail}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Reto</p>
                  <p className="text-white font-medium">{selectedChallenge.challengeName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Categoría</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${CATEGORY_INFO[selectedChallenge.challengeCategory]?.color}`}>
                    {CATEGORY_INFO[selectedChallenge.challengeCategory]?.icon}
                    {CATEGORY_INFO[selectedChallenge.challengeCategory]?.name}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Dificultad</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${DIFFICULTY_INFO[selectedChallenge.challengeDifficulty]?.color}`}>
                    {DIFFICULTY_INFO[selectedChallenge.challengeDifficulty]?.name}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Estado</p>
                  {selectedChallenge.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                      <Clock className="w-3 h-3" />
                      Pendiente
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Completado</p>
                  <p className="text-white text-sm">{formatDate(selectedChallenge.completedAt)}</p>
                </div>
                {selectedChallenge.verifiedBy && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Verificado por</p>
                    <p className="text-white text-sm">{selectedChallenge.verifiedBy}</p>
                  </div>
                )}
              </div>
              
              {selectedChallenge.status === 'completed' && (
                <button
                  onClick={() => handleVerify(selectedChallenge)}
                  disabled={verifying}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verificar Reto
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
