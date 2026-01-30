'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  ArrowLeft, Save, Plus, Trash2, Edit, Package, Image as ImageIcon,
  X, Check, ExternalLink, RefreshCw, Eye
} from 'lucide-react'

interface Kit {
  id: string
  levelId: string
  name: string
  description: string
  price: number
  components: string[]
  skills: string[]
  images: string[]
  videoUrl: string
  tutorialUrl: string
}

export default function KitsAdminPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const [kits, setKits] = useState<Kit[]>([])
  const [loadingKits, setLoadingKits] = useState(true)
  const [editingKit, setEditingKit] = useState<Kit | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    levelId: '',
    name: '',
    description: '',
    price: 0,
    components: '',
    skills: '',
    image_urls: '',
    videoUrl: '',
    tutorialUrl: ''
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/kits')
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    loadKits()
  }, [])

  const loadKits = async () => {
    setLoadingKits(true)
    try {
      const response = await fetch('/api/kits')
      if (response.ok) {
        const data = await response.json()
        setKits(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading kits:', error)
    }
    setLoadingKits(false)
  }

  const openEditModal = (kit: Kit) => {
    setEditingKit(kit)
    setIsCreating(false)
    setFormData({
      levelId: kit.levelId,
      name: kit.name,
      description: kit.description,
      price: kit.price,
      components: kit.components.join(', '),
      skills: kit.skills.join(', '),
      image_urls: kit.images.join(','),
      videoUrl: kit.videoUrl || '',
      tutorialUrl: kit.tutorialUrl || ''
    })
  }

  const openCreateModal = () => {
    setEditingKit(null)
    setIsCreating(true)
    setFormData({
      levelId: '',
      name: '',
      description: '',
      price: 0,
      components: '',
      skills: '',
      image_urls: '',
      videoUrl: '',
      tutorialUrl: ''
    })
  }

  const closeModal = () => {
    setEditingKit(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const method = isCreating ? 'POST' : 'PUT'
      const response = await fetch('/api/kits', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingKit?.id,
          ...formData
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: isCreating ? 'Kit creado exitosamente' : 'Kit actualizado exitosamente' })
        loadKits()
        setTimeout(() => {
          closeModal()
          setMessage(null)
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
              <h1 className="text-xl font-bold text-white">Gestión de Kits</h1>
              <p className="text-sm text-gray-400">Administra los kits de cada nivel educativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadKits}
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
              Nuevo Kit
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {loadingKits ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
          </div>
        ) : kits.length === 0 ? (
          <div className="bg-dark-800 rounded-xl border border-dark-600 p-12 text-center">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No hay kits registrados aún.</p>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium mx-auto"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Kit
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kits.map(kit => (
              <div
                key={kit.id}
                className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden hover:border-dark-500 transition-all"
              >
                {/* Kit Image Preview */}
                <div className="aspect-video bg-dark-700 relative">
                  {kit.images && kit.images.length > 0 ? (
                    <img
                      src={kit.images[0]}
                      alt={kit.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-dark-900/80 px-2 py-1 rounded text-xs text-gray-300">
                    {kit.images?.length || 0} fotos
                  </div>
                </div>

                {/* Kit Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{kit.name}</h3>
                      <p className="text-sm text-neon-cyan">{kit.levelId}</p>
                    </div>
                    <span className="text-lg font-bold text-neon-cyan">${kit.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{kit.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(kit)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <Link
                      href={`/nivel/${kit.levelId}`}
                      target="_blank"
                      className="px-3 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Edición/Creación */}
      {(editingKit || isCreating) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <h3 className="text-xl font-semibold text-white">
                {isCreating ? 'Crear Nuevo Kit' : 'Editar Kit'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mensaje */}
              {message && (
                <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              {/* Level ID */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">ID del Nivel *</label>
                <input
                  type="text"
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                  placeholder="ej: inicial-1, primero-egb, etc."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre del Kit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Kit Inicial 1 - Mis Primeras Luces"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el kit..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Precio (USD)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              {/* Componentes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Componentes (separados por coma)</label>
                <textarea
                  rows={2}
                  value={formData.components}
                  onChange={(e) => setFormData({ ...formData, components: e.target.value })}
                  placeholder="LED, Cables, Pila CR2032, etc."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
              </div>

              {/* Habilidades */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Habilidades (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Circuitos básicos, Motricidad fina, etc."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              {/* URLs de Imágenes de Google Drive */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  URLs de Imágenes (Google Drive)
                </label>
                <textarea
                  rows={4}
                  value={formData.image_urls}
                  onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
                  placeholder="Pega las URLs de Google Drive separadas por coma"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none resize-none font-mono text-sm"
                />
                <div className="mt-2 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                  <p className="text-xs text-neon-cyan font-medium mb-1">📁 Cómo obtener la URL:</p>
                  <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Sube la imagen a tu carpeta en Google Drive</li>
                    <li>Clic derecho → "Obtener enlace" → "Cualquier persona con el enlace"</li>
                    <li>Copia el enlace (formato: https://drive.google.com/file/d/ID/view)</li>
                    <li>Pégalo aquí (separar múltiples URLs con coma)</li>
                  </ol>
                </div>
                
                {/* Preview de imágenes */}
                {formData.image_urls && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Vista previa:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.image_urls.split(',').filter(url => url.trim()).slice(0, 6).map((url, idx) => {
                        const cleanUrl = url.trim()
                        let displayUrl = cleanUrl
                        // Convertir URL de Google Drive a formato de imagen
                        if (cleanUrl.includes('drive.google.com/file/d/')) {
                          const match = cleanUrl.match(/\/d\/([^/]+)/)
                          if (match) {
                            displayUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`
                          }
                        } else if (cleanUrl.includes('drive.google.com/uc')) {
                          displayUrl = cleanUrl
                        }
                        return (
                          <img
                            key={idx}
                            src={displayUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-dark-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )
                      })}
                      {formData.image_urls.split(',').filter(url => url.trim()).length > 6 && (
                        <div className="w-16 h-16 bg-dark-600 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          +{formData.image_urls.split(',').filter(url => url.trim()).length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">URL del Video Tutorial (opcional)</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/ID/preview"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (isCreating && (!formData.levelId || !formData.name))}
                className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-900 rounded-lg font-medium hover:bg-neon-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isCreating ? 'Crear Kit' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
