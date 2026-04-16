'use client'

import { useState, useEffect } from 'react'
import { getKitByLevelId, KitData } from '@/lib/dataService'
import { Package, ChevronLeft, ChevronRight, ExternalLink, ImageIcon } from 'lucide-react'

interface KitDisplayProps {
  levelId: string
}

// Función para manejar URLs de imágenes (Airtable, Google Drive o normales)
function getImageUrl(url: string): string {
  if (!url) return ''
  
  // Si es una URL de Airtable, usar el proxy para evitar CORS
  if (url.includes('airtableusercontent.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`
  }
  
  // Si es una URL de Google Drive, convertirla
  if (url.includes('drive.google.com')) {
    let fileId = ''
    
    // Formato: https://drive.google.com/file/d/FILE_ID/view
    const match1 = url.match(/\/file\/d\/([^/]+)/)
    if (match1) fileId = match1[1]
    
    // Formato: https://drive.google.com/uc?export=view&id=FILE_ID
    const match2 = url.match(/[?&]id=([^&]+)/)
    if (match2) fileId = match2[1]
    
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    }
  }
  
  return url
}

export default function KitDisplay({ levelId }: KitDisplayProps) {
  const [kit, setKit] = useState<KitData | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadKit() {
      setIsLoading(true)
      setError(null)
      
      try {
        // Primero intentar cargar desde Airtable API
        const response = await fetch(`/api/kits?levelId=${levelId}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data && !data.error) {
            setKit(data)
            setIsLoading(false)
            return
          }
        }
      } catch (err) {
        console.log('Airtable not available, using local data')
      }
      
      // Fallback: cargar desde localStorage/datos locales
      const kitData = getKitByLevelId(levelId)
      setKit(kitData)
      setIsLoading(false)
    }
    
    loadKit()
  }, [levelId])

  const nextImage = () => {
    if (kit?.images && kit.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % kit.images.length)
    }
  }

  const prevImage = () => {
    if (kit?.images && kit.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + kit.images.length) % kit.images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  if (!kit) {
    return (
      <div className="bg-gray-100/50 rounded-xl p-8 text-center">
        <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600">No hay información del kit para este nivel.</p>
        <p className="text-gray-500 text-sm mt-2">
          Agrega el kit desde el panel de administración.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Galería de Imágenes */}
      {kit.images && kit.images.length > 0 ? (
        <div className="bg-gray-100/50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📸 Fotos del Kit</h4>
          
          {/* Imagen Principal */}
          <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden mb-4">
            <img
              src={getImageUrl(kit.images[currentImageIndex])}
              alt={`${kit.name} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            
            {/* Controles de navegación */}
            {kit.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-gray-900 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Indicador de imagen */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-gray-900 text-sm">
                  {currentImageIndex + 1} / {kit.images.length}
                </div>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {kit.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {kit.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex
                      ? 'border-brand-purple'
                      : 'border-transparent hover:border-gray-500'
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-100/50 rounded-xl p-6 text-center">
          <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600">No hay fotos del kit disponibles</p>
          <p className="text-gray-500 text-sm mt-1">
            Agrega URLs de imágenes en Airtable (campo image_urls)
          </p>
        </div>
      )}

      {/* Información del Kit */}
      <div className="bg-gray-100/50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{kit.name}</h3>
            <p className="text-gray-600 mt-1">{kit.description}</p>
          </div>
          {kit.price && (
            <div className="text-right">
              <span className="text-2xl font-bold text-brand-purple">${kit.price}</span>
              <p className="text-gray-500 text-sm">USD</p>
            </div>
          )}
        </div>

        {/* Componentes */}
        {kit.components && kit.components.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3">📦 Componentes incluidos:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {kit.components.map((component, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-dark-600/50 rounded-lg px-3 py-2"
                >
                  <span className="w-2 h-2 bg-brand-purple rounded-full"></span>
                  <span className="text-gray-300 text-sm">{component}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habilidades */}
        {kit.skills && kit.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">🎯 Habilidades que desarrollarás:</h4>
            <div className="flex flex-wrap gap-2">
              {kit.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-brand-violet/20 text-brand-violet rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Video tutorial */}
        {kit.videoUrl && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-3">🎬 Video Tutorial:</h4>
            {kit.videoUrl.includes('drive.google.com') ? (
              // Embeber video de Google Drive
              <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
                <iframe
                  src={(() => {
                    // Extraer el ID del archivo de Google Drive
                    const match = kit.videoUrl.match(/\/file\/d\/([^/]+)/) || kit.videoUrl.match(/[?&]id=([^&]+)/)
                    if (match && match[1]) {
                      return `https://drive.google.com/file/d/${match[1]}/preview`
                    }
                    return kit.videoUrl
                  })()}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              </div>
            ) : kit.videoUrl.includes('youtube.com') || kit.videoUrl.includes('youtu.be') ? (
              // Embeber video de YouTube
              <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
                <iframe
                  src={(() => {
                    // Convertir URL de YouTube a embed
                    const match = kit.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
                    if (match && match[1]) {
                      return `https://www.youtube.com/embed/${match[1]}`
                    }
                    return kit.videoUrl
                  })()}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              // Enlace externo para otros videos
              <a
                href={kit.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-purple hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Ver video tutorial del kit
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
